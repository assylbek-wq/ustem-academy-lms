// Raspberry Pi Pico: настоящий RP2040 (rp2040js) с официальной прошивкой MicroPython. Программа передается через
// USB (CDC) в raw REPL, как это делает Thonny. Выводы GP0-GP28, АЦП на GP26-GP28, I2C0 и I2C1, ШИМ - через GPIO.
import { RP2040, USBCDC, GPIOPinState, ConsoleLogger, LogLevel, I2CMode } from "rp2040js";
import { bootromB1 } from "./bootrom.js";
import { I2CBus } from "./i2c.js";
import { LIBS } from "./pylib.js";

const NS = 8; // наносекунд на такт при 125 МГц

export class Rp2040Mcu {
  constructor(uf2, { onSerial, onError } = {}) {
    this.kind = "rp2040"; this.board = "pico"; this.vcc = 3.3; this.freq = 125e6;
    this.onSerial = onSerial; this.onError = onError;
    const mcu = this.mcu = new RP2040();
    this.clock = mcu.clock;
    mcu.loadBootrom(bootromB1);
    mcu.logger = new ConsoleLogger(LogLevel.Error);
    const u8 = new Uint8Array(uf2);
    for (let o = 0; o + 512 <= u8.length; o += 512) {
      const dv = new DataView(u8.buffer, u8.byteOffset + o, 512);
      const addr = dv.getUint32(12, true), size = dv.getUint32(16, true);
      mcu.flash.set(u8.subarray(o + 32, o + 32 + size), addr - 0x10000000);
    }
    this.cdc = new USBCDC(mcu.usbCtrl);
    this.cdc.onDeviceConnected = () => { this.connected = true; this._send("\x03\x03\x01"); };
    this.cdc.onSerialData = (b) => this._rx(b);
    this.txq = []; this.dec = new TextDecoder(); this.rxState = "boot"; this.rxBuf = ""; this.errBuf = "";
    this.pinNames = Array.from({ length: 29 }, (_, i) => "GP" + i);
    this.adcCh = { GP26: 0, GP27: 1, GP28: 2 };
    this.sda = "GP4"; this.scl = "GP5";
    mcu.adc.channelValues[4] = 876; // встроенный датчик температуры, около 27 °C
    this.i2c = new I2CBus();
    // I2C: устройства отвечают с задержкой, как на настоящей шине (400 кГц, как по умолчанию в MicroPython: около 23 мкс на байт)
    const later = (f, us) => this.clock.createAlarm(f).schedule(us * 1000);
    for (const port of mcu.i2c) {
      const bus = this.i2c;
      // rp2040js после NACK очищает FIFO, но не ставит TX_EMPTY: pico-sdk ждал бы до тайм-аута. На настоящей
      // микросхеме флаг выставляется, поэтому добавляем его (i2c.scan() и OSError ENODEV работают как на плате).
      const abort = port.abort.bind(port);
      port.abort = (reason) => { abort(reason); port.setInterrupts(1 << 4); };
      port.onStart = () => { bus.start(); later(() => port.completeStart(), 10); };
      port.onConnect = (addr, mode) => { const ok = bus.connect(addr, mode === I2CMode.Read); later(() => port.completeConnect(ok), 23); };
      port.onWriteByte = (v) => { const ok = bus.write(v); later(() => port.completeWrite(ok), 23); };
      port.onReadByte = () => { const v = bus.read(); later(() => port.completeRead(v), 23); };
      port.onStop = () => { bus.stop(); later(() => port.completeStop(), 10); };
    }
    this.stat = {}; this.listeners = {}; this.driven = new Map();
    mcu.gpio.forEach((g, i) => {
      if (i > 28) return;
      const name = "GP" + i;
      this.stat[name] = { level: false, since: 0, high: 0, rises: 0, pulse: null, riseAt: 0 };
      g.addListener((st) => this._onPin(name, st));
    });
    mcu.core.PC = 0x10000000;
    this.frameStart = 0;
  }

  now() { return this.clock.nanos / 1e9; }
  get seconds() { return this.now(); }
  onPin(name, f) { (this.listeners[name] ||= []).push(f); }
  rebind() { this.listeners = {}; this.i2c.clear(); this.driven.clear(); }

  _onPin(name, st) {
    const s = this.stat[name]; const t = this.clock.nanos;
    const level = st === GPIOPinState.High;
    if (level === s.level) return;
    if (s.level) s.high += t - Math.max(s.since, this.frameStart);
    if (level) { s.rises++; s.riseAt = t; } else if (s.riseAt) s.pulse = (t - s.riseAt) / 1000;
    s.level = level; s.since = t;
    const ls = this.listeners[name];
    if (ls) for (const f of ls) f(level, t / 1e9, this.mode(name));
  }

  // ─── USB: raw REPL ───
  _rx(bytes) {
    if (this.debug) this.debug(bytes, this.rxState);
    for (const b of bytes) {
      const ch = String.fromCharCode(b);
      if (this.rxState === "boot" || this.rxState === "wait") { this.rxBuf += ch; if (this.rxBuf.endsWith("raw REPL; CTRL-B to exit\r\n>")) {
          this.rxBuf = "";
          // мягкая перезагрузка отдельным шагом: ждем второе приглашение raw REPL, вывод загрузки не показываем
          if (this.needReset) { this.needReset = false; this._send("\x04"); continue; }
          this.rxState = "ready"; this._sendPending();
        }
        continue;
      }
      if (this.rxState === "sent") { this.rxBuf += ch; if (this.rxBuf.endsWith("OK")) { this.rxBuf = ""; this.rxState = "out"; } continue; }
      if (this.rxState === "out") {
        if (b === 4) { this.rxState = "err"; this.errBuf = ""; }
        else if (ch !== "\r" && this.onSerial) { const t = this.dec.decode(new Uint8Array([b]), { stream: true }); if (t) this.onSerial(t); }
        continue;
      }
      if (this.rxState === "err") {
        if (b === 4) {
          this.rxState = "idle";
          // первая строка - служебная (exec подготовки), номера строк сдвигаем обратно
          const text = this.errBuf.trim().replace(/line (\d+)/g, (m, n) => `line ${Math.max(1, n - 1)}`);
          if (text && !/KeyboardInterrupt/.test(text)) this.onError && this.onError(text);
        } else this.errBuf += this.dec.decode(new Uint8Array([b]), { stream: true });
        continue;
      }
    }
  }
  _send(s) { for (const b of new TextEncoder().encode(s)) this.txq.push(b); }
  _feed() { const f = this.cdc.txFIFO; while (this.txq.length && !f.full) this.cdc.sendSerialByte(this.txq.shift()); }
  _sendPending() { if (this.pending != null) { const c = this.pending; this.pending = null; this.rxState = "sent"; this._send(c + "\x04"); } }

  /** Запустить программу: прервать прошлую, мягкая перезагрузка, raw REPL, код. */
  start(code) {
    this.pending = picoPrelude(code) + code.replace(/\r\n/g, "\n");
    if (this.rxState === "boot") return; // отправим, когда загрузится MicroPython
    this.rxState = "wait"; this.rxBuf = ""; this.needReset = true;
    this._send("\x03\x03\x02\x01"); // прервать, raw REPL; затем мягкая перезагрузка (чистые переменные)
  }
  stop() { this._send("\x03\x03"); this.rxState = "wait"; }
  softReset() { this.rxState = "wait"; this.rxBuf = ""; this._send("\x03\x03\x01\x04"); }

  get booting() { return this.rxState === "boot"; }

  // ─── выводы ───
  mode(name) {
    const g = this.mcu.gpio[+name.slice(2)]; if (!g) return "input";
    switch (g.value) {
      case GPIOPinState.High: return "high";
      case GPIOPinState.Low: return "low";
      case GPIOPinState.InputPullUp: return "pullup";
      case GPIOPinState.InputPullDown: return "pulldown";
      default: return "input";
    }
  }

  setInput(name, volts) {
    if (name in this.adcCh) this.mcu.adc.channelValues[this.adcCh[name]] = Math.round(Math.max(0, Math.min(3.3, volts)) / 3.3 * 4095);
    if (this.driven.has(name)) return;
    const g = this.mcu.gpio[+name.slice(2)];
    if (g) g.setInputValue(volts > 1.65);
  }

  drive(name, level, delay = 0) {
    const g = this.mcu.gpio[+name.slice(2)]; if (!g) return;
    const apply = () => { if (level === null) this.driven.delete(name); else { this.driven.set(name, level); g.setInputValue(level); } };
    if (delay <= 0) apply(); else this.clock.createAlarm(apply).schedule(Math.max(1, Math.round(delay * 1e9)));
  }

  serialWrite(text) { this._send(text); }

  /** Выполнить seconds секунд, но не дольше budgetMs настоящего времени. Возвращает статистику выводов. */
  run(seconds, budgetMs = 14) {
    const { mcu, clock } = this;
    this.frameStart = clock.nanos;
    for (const s of Object.values(this.stat)) { s.high = 0; s.rises = 0; s.since = Math.max(s.since, this.frameStart); }
    const end = clock.nanos + seconds * 1e9;
    const wall0 = performance.now();
    let n = 0;
    while (clock.nanos < end) {
      if (mcu.core.waiting) clock.tick(Math.min(clock.nanosToNextAlarm, end - clock.nanos));
      else clock.tick(mcu.core.executeInstruction() * NS);
      if (++n % 4000 === 0) { this._feed(); if (performance.now() - wall0 > budgetMs) break; }
    }
    this._feed();
    const span = Math.max(1, clock.nanos - this.frameStart);
    this.lastSpeed = span / 1e9 / seconds;
    const out = {};
    for (const [name, s] of Object.entries(this.stat)) {
      let high = s.high;
      if (s.level) high += clock.nanos - Math.max(s.since, this.frameStart);
      out[name] = { duty: high / span, freq: s.rises / (span / 1e9), pulse: s.pulse, level: s.level };
    }
    return out;
  }
}

// Подготовка для Pico в одну строку: i2c.scan() без нулевой записи (rp2040js не эмулирует программный I2C)
// и драйверы ssd1306, i2c_lcd, hcsr04, если программа их подключает.
const PICO_BASE = `import sys, machine as _m
class _M:
    pass
def _mk(name, src):
    g = {}
    exec(src, g)
    o = _M()
    for k in g:
        setattr(o, k, g[k])
    sys.modules[name] = o
_mod = _M()
for _k in dir(_m):
    setattr(_mod, _k, getattr(_m, _k))
class I2C(_m.I2C):
    def scan(self):
        r = []
        for a in range(8, 120):
            try:
                self.readfrom(a, 1)
                r.append(a)
            except OSError:
                pass
        return r
_mod.I2C = I2C
sys.modules['machine'] = _mod
`;
function picoPrelude(code) {
  let src = PICO_BASE;
  for (const lib of ["ssd1306", "i2c_lcd", "hcsr04"]) {
    if (new RegExp(`^\\s*(from|import)\\s+${lib}\\b`, "m").test(code)) src += `_mk(${JSON.stringify(lib)}, ${JSON.stringify(LIBS[lib])})\n`;
  }
  src += "del _k, _m, _mk, _mod, _M\n";
  return `exec(${JSON.stringify(src)})\n`;
}
