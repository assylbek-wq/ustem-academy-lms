// Эмулятор Arduino Uno (ATmega328P, 16 МГц) на avr8js: порты, таймеры (PWM, millis), UART, АЦП.
import {
  CPU, avrInstruction, AVRTimer, timer0Config, timer1Config, timer2Config, AVRIOPort, portBConfig, portCConfig,
  portDConfig, AVRUSART, usart0Config, AVRADC, adcConfig, PinState,
} from "avr8js";

export const FREQ = 16e6;

function parseHex(hex) {
  const flash = new Uint8Array(0x8000);
  for (const line of hex.split("\n")) {
    if (!line.startsWith(":")) continue;
    const len = parseInt(line.substr(1, 2), 16);
    const addr = parseInt(line.substr(3, 4), 16);
    const type = parseInt(line.substr(7, 2), 16);
    if (type !== 0) continue;
    for (let i = 0; i < len; i++) flash[addr + i] = parseInt(line.substr(9 + i * 2, 2), 16);
  }
  return new Uint16Array(flash.buffer);
}

// Номер пина Arduino -> [порт, бит]
export const PIN_MAP = {};
for (let i = 0; i <= 7; i++) PIN_MAP[String(i)] = ["D", i];
for (let i = 8; i <= 13; i++) PIN_MAP[String(i)] = ["B", i - 8];
for (let i = 0; i <= 5; i++) PIN_MAP[`A${i}`] = ["C", i];

export class Uno {
  constructor(hex, { onSerial } = {}) {
    this.cpu = new CPU(parseHex(hex));
    new AVRTimer(this.cpu, timer0Config);
    new AVRTimer(this.cpu, timer1Config);
    new AVRTimer(this.cpu, timer2Config);
    this.ports = { B: new AVRIOPort(this.cpu, portBConfig), C: new AVRIOPort(this.cpu, portCConfig), D: new AVRIOPort(this.cpu, portDConfig) };
    this.usart = new AVRUSART(this.cpu, usart0Config, FREQ);
    this.usart.onByteTransmit = (b) => { this.txAt = this.cpu.cycles; onSerial && onSerial(String.fromCharCode(b)); };
    this.adc = new AVRADC(this.cpu, adcConfig);
    // Статистика по пинам за кадр: доля времени HIGH (для PWM), длина импульса (серво), фронты (частота звука)
    this.stat = {};
    for (const name of Object.keys(PIN_MAP)) this.stat[name] = { level: false, since: 0, high: 0, rises: 0, pulse: null, riseAt: 0 };
    for (const [port, obj] of Object.entries(this.ports)) {
      obj.addListener(() => this._onPort(port));
    }
    this.frameStart = 0;
    // Внешние устройства, которые сами управляют входом (эхо ультразвукового датчика): пин -> true
    this.driven = new Set();
    this.sonars = [];
  }

  /** Ультразвуковой датчик HC-SR04: импульс на TRIG -> через 0,2 мс импульс на ECHO длиной 58 мкс на 1 см. */
  setSonars(list) {
    this.sonars = list;
    this.driven = new Set(list.map((s) => s.echo));
  }

  _sonarTrigger(s) {
    const [p, bit] = PIN_MAP[s.echo];
    const cm = Math.max(2, Math.min(400, s.cm()));
    const start = Math.round(FREQ * 0.0002);
    const len = Math.round(cm * 58 * 16);
    this.cpu.addClockEvent(() => this.ports[p].setPin(bit, true), start);
    this.cpu.addClockEvent(() => this.ports[p].setPin(bit, false), start + len);
  }

  _onPort(port) {
    const now = this.cpu.cycles;
    for (const [name, [p, bit]] of Object.entries(PIN_MAP)) {
      if (p !== port) continue;
      const level = this.ports[p].pinState(bit) === PinState.High;
      const s = this.stat[name];
      if (level === s.level) continue;
      if (s.level) s.high += now - Math.max(s.since, this.frameStart);
      if (level) { s.rises++; s.riseAt = now; } else if (s.riseAt) { s.pulse = (now - s.riseAt) / 16; } // мкс
      if (!level && s.riseAt && now - s.riseAt >= 8 * 16) {
        for (const so of this.sonars) if (so.trig === name && so.ok()) this._sonarTrigger(so);
      }
      s.level = level; s.since = now;
    }
  }

  /** Состояние пина для расчета цепи: "high" | "low" | "input" | "pullup" */
  mode(name) {
    const [p, bit] = PIN_MAP[name];
    const st = this.ports[p].pinState(bit);
    return st === PinState.High ? "high" : st === PinState.Low ? "low" : st === PinState.InputPullUp ? "pullup" : "input";
  }

  setInput(name, volts) {
    if (this.driven.has(name)) return;
    const [p, bit] = PIN_MAP[name];
    this.ports[p].setPin(bit, volts > 2.5);
    if (p === "C") this.adc.channelValues[bit] = Math.max(0, Math.min(5, volts));
  }

  serialWrite(text) { for (const ch of text) this.usart.writeByte(ch.charCodeAt(0) & 0xff); }

  /** Выполнить cycles тактов процессора; вернуть статистику пинов за этот отрезок. */
  run(cycles) {
    const cpu = this.cpu;
    this.frameStart = cpu.cycles;
    for (const s of Object.values(this.stat)) { s.high = 0; s.rises = 0; s.since = Math.max(s.since, this.frameStart); }
    const end = cpu.cycles + cycles;
    while (cpu.cycles < end) { avrInstruction(cpu); cpu.tick(); }
    const span = cpu.cycles - this.frameStart;
    const out = {};
    for (const [name, s] of Object.entries(this.stat)) {
      let high = s.high;
      if (s.level) high += cpu.cycles - Math.max(s.since, this.frameStart);
      out[name] = { duty: span ? high / span : 0, freq: s.rises / (span / FREQ), pulse: s.pulse, level: s.level };
    }
    return out;
  }

  get seconds() { return this.cpu.cycles / FREQ; }
}
