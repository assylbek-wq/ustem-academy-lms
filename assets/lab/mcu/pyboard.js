// Платы ESP32 и micro:bit: настоящий MicroPython (WebAssembly) в браузере, «железо» - схема лаборатории.
// Программа идет в реальном времени: pytransform делает sleep() ожидающим, run() двигает виртуальные часы.
import { I2CBus } from "./i2c.js";
import { transform } from "./pytransform.js";
import { PRELUDE, LIBS, ASYNC_CALLS } from "./pylib.js";

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
// ESP32-DevKitC (38 выводов): выводы GPIO, у которых есть АЦП, и только входы
const ESP_GPIO = [0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33, 34, 35, 36, 39];
const ESP_ADC = [0, 2, 4, 12, 13, 14, 15, 25, 26, 27, 32, 33, 34, 35, 36, 39];
const MB_PINS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 19, 20];

export const PY_BOARDS = {
  esp32: { title: "ESP32 DevKitC", vcc: 3.3, pins: ESP_GPIO.map(String), adc: ESP_ADC.map(String), led: "2", sda: "21", scl: "22" },
  microbit: { title: "BBC micro:bit v2", vcc: 3.3, pins: MB_PINS.map((n) => "P" + n), adc: ["P0", "P1", "P2", "P3", "P4", "P10"], sda: "P20", scl: "P19" },
};

let mc = null;
const macrotask = () => new Promise((res) => {
  if (typeof MessageChannel === "undefined") { setTimeout(res, 0); return; }
  if (!mc) { mc = new MessageChannel(); mc.q = []; mc.port1.onmessage = () => { const f = mc.q.shift(); f && f(); }; if (mc.port1.unref) mc.port1.unref(); }
  mc.q.push(res); mc.port2.postMessage(0);
});

const toArr = (x) => {
  if (x == null) return [];
  if (typeof x === "string") return Array.from(x, (c) => c.charCodeAt(0) - 1); // байты из Python: код + 1 (см. _s в pylib.js)
  if (ArrayBuffer.isView(x)) return Array.from(x);
  if (Array.isArray(x)) return x.map(Number);
  return Array.from(x);
};

let lastRun = Promise.resolve(), shared = null;
// очистка перед новым запуском: свои переменные, модули платы (заново прочитают _hw), мусор
const RESET = `
import sys as __sys, gc as __gc
for __k in list(globals()):
    if not __k.startswith('__'):
        del globals()[__k]
for __k in list(__sys.modules):
    if __k not in ('sys', 'gc', 'js', 'pyscript', 'asyncio', 'micropython', 'builtins', 'math', 'json', 'struct', 'random', 'collections', 're', 'os', 'framebuf', 'io', 'array', 'binascii', 'errno', 'select', 'uasyncio'):
        del __sys.modules[__k]
__gc.collect()
`;

export class PyMcu {
  constructor(board, { onSerial, onError, loadMicroPython, wasmUrl } = {}) {
    const B = PY_BOARDS[board];
    this.board = board; this.kind = "py"; this.vcc = 3.3; this.B = B;
    this.onSerial = onSerial; this.onError = onError; this.loadMP = loadMicroPython; this.wasmUrl = wasmUrl;
    this.pinNames = B.pins; this.adcPins = new Set(B.adc); this.sda = B.sda; this.scl = B.scl;
    this.t = 0; this.frameStart = 0; this.budgetT = 0;
    this.i2c = new I2CBus();
    this.pins = {};
    for (const n of B.pins) this.pins[n] = { mode: "input", pull: null, out: 0, level: false, inLevel: false, volts: 0, pwm: null, since: 0, high: 0, rises: 0, pulse: null, riseAt: 0, irq: null };
    this.sleepers = []; this.listeners = {}; this.devices = { neopixel: {}, dht: {}, pulse: {} };
    this.mb = { display: new Array(25).fill(0), buttons: { A: { down: false, presses: 0, was: false }, B: { down: false, presses: 0, was: false } }, accel: [0, 0, -1024, 0], temp: 22, light: 120, sound: 30 };
    this.dead = false;
  }

  now() { return this.t; }
  get seconds() { return this.t; }
  onPin(name, f) { (this.listeners[name] ||= []).push(f); }

  _edge(name, level) {
    const p = this.pins[name]; if (!p || level === p.level) return;
    if (p.level) p.high += this.t - Math.max(p.since, this.frameStart);
    if (level) { p.rises++; p.riseAt = this.t; } else if (p.riseAt) p.pulse = (this.t - p.riseAt) * 1e6;
    p.level = level; p.since = this.t;
    const ls = this.listeners[name]; if (ls) for (const f of ls) f(level, this.t, p.mode);
  }

  // ─── модуль _hw для Python ───
  api() {
    const self = this;
    return {
      has_pin: (n) => n in self.pins,
      has_adc: (n) => self.adcPins.has(n),
      pin_mode(n, mode, pull) {
        const p = self.pins[n]; if (!p) return;
        p.pwm = null;
        if (mode === 3 || mode === 7) p.mode = p.out ? "high" : "low";
        else p.mode = pull === 2 ? "pullup" : pull === 1 ? "pulldown" : "input";
      },
      pin_write(n, v) {
        const p = self.pins[n]; if (!p) return;
        p.pwm = null; p.out = v ? 1 : 0; p.mode = v ? "high" : "low";
        self._edge(n, !!v);
      },
      pin_read(n) {
        const p = self.pins[n]; if (!p) return false;
        if (p.mode === "high" || p.mode === "low") return p.out === 1;
        return p.inLevel;
      },
      pin_irq(n, handler, trigger, pinObj) { const p = self.pins[n]; if (p) p.irq = handler ? { handler, trigger, pinObj } : null; },
      pwm(n, freq, duty) {
        const p = self.pins[n]; if (!p) return;
        if (!freq || duty <= 0) { p.pwm = null; p.out = 0; p.mode = "low"; self._edge(n, false); return; }
        p.pwm = { freq: +freq, duty: Math.min(1, +duty) }; p.mode = "high";
      },
      adc: (n) => (self.pins[n] ? self.pins[n].volts : 0),
      i2c_scan: () => self.i2c.scan(),
      i2c_write: (addr, buf) => self.i2c.writeto(addr, toArr(buf)),
      i2c_read: (addr, n) => self.i2c.readfrom(addr, n),
      np_write(n, flat) { const d = self.devices.neopixel[n]; if (d) d.setRGB(toArr(flat)); },
      dht_read(n, kind) { const d = self.devices.dht[n]; return d && d.powered() ? [d.temperature(), d.humidity()] : null; },
      pulse_in(n, level, timeout) { const d = self.devices.pulse[n]; const v = d ? d(level) : -2; return v == null ? -2 : v; },
      now: () => self.t,
      wall: () => Date.now() / 1000,
      localtime(secs) { const d = secs == null ? new Date() : new Date(secs * 1000); return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), (d.getDay() + 6) % 7, 0]; },
      sleep(s) {
        if (self.dead) return Promise.reject(new Error("KeyboardInterrupt"));
        return new Promise((res, rej) => self.sleepers.push({ at: self.t + Math.max(0, +s || 0), res, rej }));
      },
      tick() {
        if (self.dead) return Promise.reject(new Error("KeyboardInterrupt"));
        if (performance.now() - self.budgetT < 6) return null;
        return new Promise((res, rej) => self.sleepers.push({ at: self.t, res, rej, frame: true }));
      },
      log: (s) => self.onSerial && self.onSerial(String(s) + "\n"),
      mb_display(arr) { self.mb.display = toArr(arr); },
      mb_button(b, what) {
        const s = self.mb.buttons[b]; if (!s) return 0;
        if (what === 0) return s.down ? 1 : 0;
        if (what === 1) { const w = s.was; s.was = false; return w ? 1 : 0; }
        const c = s.presses; s.presses = 0; return c;
      },
      mb_accel: (i) => self.mb.accel[i] || 0,
      mb_temp: () => self.mb.temp,
      mb_light: () => self.mb.light,
      mb_sound: () => self.mb.sound,
    };
  }

  async start(code) {
    // Один интерпретатор на страницу: два экземпляра MicroPython WASM в одном потоке портят память друг другу.
    // Перед новым запуском ждем, пока прошлая программа обработает остановку, и очищаем состояние.
    const prevDone = await Promise.race([lastRun.then(() => true), new Promise((r) => setTimeout(() => r(false), 800))]);
    if (!shared || shared.url !== this.wasmUrl || !prevDone || shared.runs > 40) {
      const mp = await this.loadMP({ url: this.wasmUrl, heapsize: 4 * 1024 * 1024, pystack: 2048,
        stdout: (l) => shared && shared.out(l + "\n"), stderr: (l) => shared && shared.out(l + "\n"), linebuffer: true });
      shared = { mp, url: this.wasmUrl, runs: 0, out: () => {} };
      const fs = mp.FS;
      try { fs.mkdir("/lib"); } catch (e) { /* есть */ }
      for (const [name, src] of Object.entries(LIBS)) fs.writeFile(`/lib/${name}.py`, src);
    } else {
      await shared.mp.runPythonAsync(RESET);
    }
    shared.runs++;
    shared.out = (s) => this.onSerial && this.onSerial(s);
    this.mp = shared.mp;
    this.mp.registerJsModule("_hw", this.api());
    await this.mp.runPythonAsync(PRELUDE);
    const { code: tcode } = transform(code, ASYNC_CALLS);
    this.budgetT = performance.now();
    // программа без await выполняется сразу и возвращает не Promise
    let run; try { run = Promise.resolve(this.mp.runPythonAsync(tcode)); } catch (e) { run = Promise.reject(e); }
    this.done = run.then(() => { this.finished = true; }, (e) => {
      this.finished = true;
      const msg = String((e && e.message) || e);
      if (!this.dead && !/KeyboardInterrupt|SystemExit/.test(msg)) this.onError && this.onError(msg);
    });
    lastRun = this.done;
  }

  stop() {
    this.dead = true;
    for (const s of this.sleepers) s.rej(new Error("KeyboardInterrupt"));
    this.sleepers = [];
  }

  // ─── схема -> плата ───
  mode(name) {
    const p = this.pins[name]; if (!p) return "input";
    if (p.pwm) return "high";
    return p.mode;
  }

  setInput(name, volts) {
    const p = this.pins[name]; if (!p) return;
    p.volts = Math.max(0, Math.min(3.3, volts));
    if (p.driven !== undefined) return;
    const lvl = volts > 1.65;
    if (lvl !== p.inLevel) {
      p.inLevel = lvl;
      if (p.irq && (p.mode === "input" || p.mode === "pullup" || p.mode === "pulldown")) {
        const want = lvl ? 1 : 2;
        if (p.irq.trigger & want) { try { p.irq.handler(p.irq.pinObj); } catch (e) { /* ошибка в обработчике */ } }
      }
    }
  }

  drive(name, level, delay = 0) {
    const p = this.pins[name]; if (!p) return;
    if (level === null) delete p.driven; else { p.driven = level; p.inLevel = level; }
  }

  serialWrite() { /* ввод с клавиатуры в MicroPython не поддержан */ }

  // Виртуальное время идет кусками до каждого пробуждения: короткие sleep() внутри кадра выполняются честно.
  async runAsync(seconds) {
    this.frameStart = this.t; this.budgetT = performance.now();
    for (const p of Object.values(this.pins)) { p.high = 0; p.rises = 0; p.since = Math.max(p.since, this.frameStart); }
    const end = this.t + seconds;
    for (let guard = 0; guard < 2000; guard++) {
      if (!this.sleepers.length) break;
      let next = Infinity;
      for (const s of this.sleepers) if (s.at < next) next = s.at;
      if (next > end + 1e-12) break;
      this.t = Math.max(this.t, next);
      const due = this.sleepers.filter((s) => s.at <= this.t + 1e-12);
      this.sleepers = this.sleepers.filter((s) => s.at > this.t + 1e-12);
      for (const s of due) s.res();
      await macrotask();
      if (performance.now() - this.budgetT > 12) break; // кадр занят: остальное в следующем
    }
    this.t = Math.max(this.t, end);
    return this.stats(seconds);
  }

  stats(seconds) {
    const out = {};
    for (const [name, p] of Object.entries(this.pins)) {
      if (p.pwm) {
        out[name] = { duty: p.pwm.duty, freq: p.pwm.freq, pulse: (p.pwm.duty / p.pwm.freq) * 1e6, level: p.pwm.duty > 0.5 };
        continue;
      }
      let high = p.high;
      if (p.level) high += this.t - Math.max(p.since, this.frameStart);
      out[name] = { duty: seconds ? Math.min(1, high / seconds) : 0, freq: p.rises / Math.max(seconds, 1e-6), pulse: p.pulse, level: p.level };
    }
    return out;
  }
}
