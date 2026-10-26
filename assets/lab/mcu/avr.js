// Эмулятор Arduino на avr8js: Uno и Nano (ATmega328P), Mega 2560 (ATmega2560), 16 МГц.
// Порты, таймеры (PWM, millis, Servo), UART, АЦП, I2C (TWI). Устройства с собственными протоколами
// (HC-SR04, DHT, WS2812, 74HC595, TM1637) слушают фронты выводов и сами управляют входами через drive().
import {
  CPU, avrInstruction, AVRTimer, timer0Config, timer1Config, timer2Config, AVRIOPort, AVRUSART, usart0Config,
  AVRADC, adcConfig, PinState, AVRTWI, twiConfig, AVRSPI, spiConfig,
  portAConfig, portBConfig, portCConfig, portDConfig, portEConfig, portFConfig, portGConfig, portHConfig, portJConfig,
  portKConfig, portLConfig,
} from "avr8js";
import { I2CBus } from "./i2c.js";

export const FREQ = 16e6;

function parseHex(hex, words) {
  const flash = new Uint8Array(words * 2);
  let base = 0;
  for (const line of hex.split("\n")) {
    if (!line.startsWith(":")) continue;
    const len = parseInt(line.substr(1, 2), 16);
    const addr = parseInt(line.substr(3, 4), 16);
    const type = parseInt(line.substr(7, 2), 16);
    if (type === 2) base = parseInt(line.substr(9, 4), 16) << 4;
    else if (type === 4) base = parseInt(line.substr(9, 4), 16) << 16;
    if (type !== 0) continue;
    for (let i = 0; i < len; i++) flash[base + addr + i] = parseInt(line.substr(9 + i * 2, 2), 16);
  }
  return new Uint16Array(flash.buffer);
}

// ─── ATmega2560: адреса векторов прерываний (номер вектора x 2) и таймеры 3-5 ───
const INT = (EICR, index, iscOffset, vec) => ({ EICR, EIMSK: 0x3d, EIFR: 0x3c, index, iscOffset, interrupt: vec * 2 });
const PC = (PCIE, PCMSK, vec) => ({ PCIE, PCICR: 0x68, PCIFR: 0x3b, PCMSK, pinChangeInterrupt: vec * 2, mask: 0xff, offset: 0 });
const MEGA_PORTS = {
  A: portAConfig, B: { ...portBConfig, pinChange: PC(0, 0x6b, 9) }, C: portCConfig,
  D: { ...portDConfig, pinChange: undefined, externalInterrupts: [INT(0x69, 0, 0, 1), INT(0x69, 1, 2, 2), INT(0x69, 2, 4, 3), INT(0x69, 3, 6, 4)] },
  E: { ...portEConfig, externalInterrupts: [null, null, null, null, INT(0x6a, 4, 0, 5), INT(0x6a, 5, 2, 6), INT(0x6a, 6, 4, 7), INT(0x6a, 7, 6, 8)] },
  F: portFConfig, G: portGConfig, H: portHConfig, J: portJConfig, K: { ...portKConfig, pinChange: PC(2, 0x6d, 11) }, L: portLConfig,
};
const UNO_PORTS = { B: portBConfig, C: portCConfig, D: portDConfig };
const T16 = (n, base, timsk, tifr, vec, ports) => ({
  ...timer1Config, captureInterrupt: vec * 2, compAInterrupt: (vec + 1) * 2, compBInterrupt: (vec + 2) * 2, compCInterrupt: (vec + 3) * 2, ovfInterrupt: (vec + 4) * 2,
  TIFR: tifr, TCCRA: base, TCCRB: base + 1, TCCRC: base + 2, TCNT: base + 4, ICR: base + 6, OCRA: base + 8, OCRB: base + 10, OCRC: base + 12, TIMSK: timsk,
  compPortA: ports[0][0], compPinA: ports[0][1], compPortB: ports[1][0], compPinB: ports[1][1], compPortC: ports[2][0], compPinC: ports[2][1], externalClockPort: 0, externalClockPin: 0,
});
const P = (port, bit) => [MEGA_PORTS[port].PORT, bit];
const MEGA_TIMERS = [
  { ...timer0Config, compAInterrupt: 42, compBInterrupt: 44, ovfInterrupt: 46, compPortA: MEGA_PORTS.B.PORT, compPinA: 7, compPortB: MEGA_PORTS.G.PORT, compPinB: 5, externalClockPort: 0 },
  { ...timer1Config, captureInterrupt: 32, compAInterrupt: 34, compBInterrupt: 36, compCInterrupt: 38, ovfInterrupt: 40, OCRC: 0x8c,
    compPortA: MEGA_PORTS.B.PORT, compPinA: 5, compPortB: MEGA_PORTS.B.PORT, compPinB: 6, compPortC: MEGA_PORTS.B.PORT, compPinC: 7, externalClockPort: 0 },
  { ...timer2Config, compAInterrupt: 26, compBInterrupt: 28, ovfInterrupt: 30, compPortA: MEGA_PORTS.B.PORT, compPinA: 4, compPortB: MEGA_PORTS.H.PORT, compPinB: 6 },
  T16(3, 0x90, 0x71, 0x38, 31, [P("E", 3), P("E", 4), P("E", 5)]),
  T16(4, 0xa0, 0x72, 0x39, 41, [P("H", 3), P("H", 4), P("H", 5)]),
  T16(5, 0x120, 0x73, 0x3a, 46, [P("L", 3), P("L", 4), P("L", 5)]),
];
const megaAdcChannels = {};
for (let i = 0; i < 8; i++) { megaAdcChannels[i] = { type: 0, channel: i }; megaAdcChannels[0x20 + i] = { type: 0, channel: 8 + i }; }
megaAdcChannels[0x1e] = { type: 4, voltage: 1.1 }; megaAdcChannels[0x1f] = { type: 4, voltage: 0 };

// Карты выводов: имя -> [порт, бит] и аналоговые каналы
function unoPins(nano) {
  const map = {};
  for (let i = 0; i <= 7; i++) map[String(i)] = ["D", i];
  for (let i = 8; i <= 13; i++) map[String(i)] = ["B", i - 8];
  for (let i = 0; i <= 5; i++) map[`A${i}`] = ["C", i];
  const adc = { A0: 0, A1: 1, A2: 2, A3: 3, A4: 4, A5: 5 };
  if (nano) { adc.A6 = 6; adc.A7 = 7; }
  return { map, adc };
}
const MEGA_ORDER = "E0 E1 E4 E5 G5 E3 H3 H4 H5 H6 B4 B5 B6 B7 J1 J0 H1 H0 D3 D2 D1 D0 A0 A1 A2 A3 A4 A5 A6 A7 C7 C6 C5 C4 C3 C2 C1 C0 D7 G2 G1 G0 L7 L6 L5 L4 L3 L2 L1 L0 B3 B2 B1 B0 F0 F1 F2 F3 F4 F5 F6 F7 K0 K1 K2 K3 K4 K5 K6 K7".split(" ");
function megaPins() {
  const map = {}, adc = {};
  MEGA_ORDER.forEach((pb, i) => {
    const name = i < 54 ? String(i) : `A${i - 54}`;
    map[name] = [pb[0], +pb[1]];
    if (i >= 54) adc[name] = i - 54;
  });
  return { map, adc };
}

export const AVR_BOARDS = {
  uno: { title: "Arduino Uno", mcu: "ATmega328P", words: 0x4000, sram: 2048, pins: () => unoPins(false), sda: "A4", scl: "A5", led: "13" },
  nano: { title: "Arduino Nano", mcu: "ATmega328P", words: 0x4000, sram: 2048, pins: () => unoPins(true), sda: "A4", scl: "A5", led: "13" },
  mega: { title: "Arduino Mega 2560", mcu: "ATmega2560", words: 0x20000, sram: 0x2100, pins: megaPins, sda: "20", scl: "21", led: "13" },
};

export class AvrMcu {
  constructor(board, hex, { onSerial } = {}) {
    const B = AVR_BOARDS[board];
    this.board = board; this.kind = "avr"; this.vcc = 5; this.freq = FREQ;
    this.cpu = new CPU(parseHex(hex, B.words), B.sram);
    const mega = board === "mega";
    const portCfg = mega ? MEGA_PORTS : UNO_PORTS;
    for (const t of mega ? MEGA_TIMERS : [timer0Config, timer1Config, timer2Config]) new AVRTimer(this.cpu, t);
    this.ports = {};
    for (const [k, cfg] of Object.entries(portCfg)) this.ports[k] = new AVRIOPort(this.cpu, cfg);
    this.usart = new AVRUSART(this.cpu, mega ? { ...usart0Config, rxCompleteInterrupt: 50, dataRegisterEmptyInterrupt: 52, txCompleteInterrupt: 54 } : usart0Config, FREQ);
    const dec = new TextDecoder(); // Serial.print("Привет") приходит байтами UTF-8
    this.usart.onByteTransmit = (b) => { this.txAt = this.cpu.cycles; const s = dec.decode(new Uint8Array([b]), { stream: true }); if (s && onSerial) onSerial(s); };
    this.adc = new AVRADC(this.cpu, mega ? { ...adcConfig, adcInterrupt: 58, numChannels: 16, muxInputMask: 0x3f, muxChannels: megaAdcChannels } : adcConfig);
    new AVRSPI(this.cpu, mega ? { ...spiConfig, spiInterrupt: 48 } : spiConfig, FREQ);
    // I2C
    this.i2c = new I2CBus();
    const twi = new AVRTWI(this.cpu, mega ? { ...twiConfig, twiInterrupt: 78 } : twiConfig, FREQ);
    const bus = this.i2c;
    twi.eventHandler = {
      start: () => { bus.start(); twi.completeStart(); },
      stop: () => { bus.stop(); twi.completeStop(); },
      connectToSlave: (addr, write) => twi.completeConnect(bus.connect(addr, !write)),
      writeByte: (v) => twi.completeWrite(bus.write(v)),
      readByte: () => twi.completeRead(bus.read()),
    };
    const { map, adc } = B.pins();
    this.map = map; this.adcCh = adc; this.pinNames = [...new Set([...Object.keys(map), ...Object.keys(adc)])];
    this.sda = B.sda; this.scl = B.scl;
    // по портам: бит -> имя
    this.byPort = {};
    for (const [name, [p, bit]] of Object.entries(map)) (this.byPort[p] ||= [])[bit] = name;
    this.stat = {}; this.listeners = {};
    for (const name of this.pinNames) this.stat[name] = { level: false, since: 0, high: 0, rises: 0, pulse: null, riseAt: 0, mode: "input" };
    for (const [port, obj] of Object.entries(this.ports)) obj.addListener(() => this._onPort(port));
    this.frameStart = 0;
    this.driven = new Map(); // вывод -> уровень, который задает внешнее устройство
    this.inputSet = new Set();
  }

  now() { return this.cpu.cycles / FREQ; }
  get seconds() { return this.now(); }

  _onPort(port) {
    const now = this.cpu.cycles, names = this.byPort[port], obj = this.ports[port];
    if (!names) return;
    for (let bit = 0; bit < 8; bit++) {
      const name = names[bit]; if (!name) continue;
      const st = obj.pinState(bit);
      const level = st === PinState.High;
      const s = this.stat[name];
      const mode = st === PinState.High ? "high" : st === PinState.Low ? "low" : st === PinState.InputPullUp ? "pullup" : "input";
      // включили подтяжку: вход сразу читается 1, как на плате (цепь уточнит уровень в следующем кадре)
      if (mode === "pullup" && s.mode !== "pullup" && !this.driven.has(name)) obj.setPin(bit, true);
      s.mode = mode;
      if (level === s.level) continue;
      if (s.level) s.high += now - Math.max(s.since, this.frameStart);
      if (level) { s.rises++; s.riseAt = now; } else if (s.riseAt) s.pulse = (now - s.riseAt) / 16; // мкс
      s.level = level; s.since = now;
      const ls = this.listeners[name];
      if (ls) for (const f of ls) f(level, now / FREQ, s.mode);
    }
  }

  /** Подписка на изменения выхода: f(level, t секунд, mode) */
  onPin(name, f) { (this.listeners[name] ||= []).push(f); }

  /** Состояние вывода для расчета цепи: "high" | "low" | "input" | "pullup" */
  mode(name) {
    const m = this.map[name];
    if (!m) return "input";
    const st = this.ports[m[0]].pinState(m[1]);
    return st === PinState.High ? "high" : st === PinState.Low ? "low" : st === PinState.InputPullUp ? "pullup" : "input";
  }

  setInput(name, volts) {
    if (name in this.adcCh) this.adc.channelValues[this.adcCh[name]] = Math.max(0, Math.min(5, volts));
    if (this.driven.has(name)) return;
    const m = this.map[name];
    if (m) { this.inputSet.add(name); this.ports[m[0]].setPin(m[1], volts > 2.5); }
  }

  /** Внешнее устройство задает уровень входа через delay секунд (null - отпустить). */
  drive(name, level, delay = 0) {
    const m = this.map[name]; if (!m) return;
    const apply = () => {
      if (level === null) this.driven.delete(name); else { this.driven.set(name, level); this.ports[m[0]].setPin(m[1], level); }
    };
    if (delay <= 0) apply(); else this.cpu.addClockEvent(apply, Math.max(1, Math.round(delay * FREQ)));
  }

  serialWrite(text) { for (const b of new TextEncoder().encode(text)) this.usart.writeByte(b); }

  run(seconds) {
    const cpu = this.cpu;
    this.frameStart = cpu.cycles;
    for (const s of Object.values(this.stat)) { s.high = 0; s.rises = 0; s.since = Math.max(s.since, this.frameStart); }
    const end = cpu.cycles + Math.round(seconds * FREQ);
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
}
