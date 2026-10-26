// Устройства со своими протоколами: работают одинаково на всех платах лаборатории.
// env (дает лаборатория): mcu, pin(вывод детали) -> вывод платы, level(вывод) -> уровень цепи сейчас,
// onLevel(вывод, f(уровень, t)) - изменения уровня цепи, powered() - есть ли питание у модуля.
import { FONT5x7 } from "./font.js";

// ─────────────── HD44780 (LCD 1602 и 2004) ───────────────
export class HD44780 {
  constructor(cols = 16, rows = 2) {
    this.cols = cols; this.rows = rows;
    this.ddram = new Uint8Array(128).fill(0x20); this.cgram = new Uint8Array(64);
    this.ac = 0; this.cg = false; this.inc = 1; this.shiftDisp = false; this.on = false; this.cursor = false; this.blink = false;
    this.shift = 0; this.bits8 = true; this.half = null; this.backlight = true; this.dirty = true;
  }
  // 4-битный режим: две половинки байта подряд
  nibble(rs, n) {
    if (this.bits8) { // после включения контроллер в 8-битном режиме: смотрим только старшие биты
      if (!rs && (n & 0x2) && !(n & 0x1)) { /* 0x2x: перейти в 4 бита */ }
      this.write(rs, n << 4, true);
      return;
    }
    if (this.half === null) { this.half = n; return; }
    const b = (this.half << 4) | n; this.half = null;
    this.write(rs, b, false);
  }
  write(rs, b, from8) {
    this.dirty = true;
    if (rs) {
      if (this.cg) { this.cgram[this.ac & 63] = b & 31; this.ac = (this.ac + this.inc) & 63; }
      else { this.ddram[this.ac & 127] = b; this.ac = (this.ac + this.inc) & 127; if (this.shiftDisp) this.shift += this.inc; }
      return;
    }
    if (b & 0x80) { this.cg = false; this.ac = b & 0x7f; return; }
    if (b & 0x40) { this.cg = true; this.ac = b & 0x3f; return; }
    if (b & 0x20) { this.bits8 = !!(b & 0x10); this.half = null; return; }
    if (b & 0x10) { if (b & 0x08) this.shift += b & 0x04 ? -1 : 1; else this.ac = (this.ac + (b & 0x04 ? 1 : -1)) & 127; return; }
    if (b & 0x08) { this.on = !!(b & 4); this.cursor = !!(b & 2); this.blink = !!(b & 1); return; }
    if (b & 0x04) { this.inc = b & 2 ? 1 : -1; this.shiftDisp = !!(b & 1); return; }
    if (b & 0x02) { this.ac = 0; this.shift = 0; this.cg = false; return; }
    if (b & 0x01) { this.ddram.fill(0x20); this.ac = 0; this.shift = 0; this.inc = 1; this.cg = false; }
  }
  addr(row, col) { const base = [0, 0x40, this.cols, 0x40 + this.cols][row]; return (base + ((col + this.shift) % 40 + 40) % 40) & 127; }
  text() {
    const out = [];
    for (let r = 0; r < this.rows; r++) { let s = ""; for (let c = 0; c < this.cols; c++) { const ch = this.ddram[this.addr(r, c)]; s += ch >= 32 && ch < 127 ? String.fromCharCode(ch) : ch < 8 ? "▒" : "?"; } out.push(s); }
    return out;
  }
  /** Нарисовать на canvas: символы 5x8 с промежутками, как на настоящем стекле. */
  draw(cv, t = 0) {
    const ctx = cv.getContext("2d"); const S = cv.width / (this.cols * 6 + 2);
    const bg = this.backlight ? "#7fbf2f" : "#3d5a1c", px = this.backlight ? "#16330a" : "#122108", off = this.backlight ? "rgba(20,60,10,.13)" : "rgba(0,0,0,.08)";
    ctx.fillStyle = bg; ctx.fillRect(0, 0, cv.width, cv.height);
    for (let r = 0; r < this.rows; r++) for (let c = 0; c < this.cols; c++) {
      const a = this.addr(r, c); const ch = this.ddram[a];
      const x0 = (1 + c * 6) * S, y0 = (1 + r * 9) * S;
      const cur = this.on && this.cursor && a === this.ac && !this.cg;
      const blk = this.on && this.blink && a === this.ac && !this.cg && Math.floor(t * 2) % 2 === 0;
      for (let y = 0; y < 8; y++) for (let x = 0; x < 5; x++) {
        let bit;
        if (ch < 16) bit = (this.cgram[((ch & 7) << 3) + y] >> (4 - x)) & 1;
        else bit = y < 7 ? (FONT5x7[ch * 5 + x] >> y) & 1 : 0;
        if (cur && y === 7) bit = 1;
        if (blk) bit = 1;
        ctx.fillStyle = this.on && bit ? px : off;
        ctx.fillRect(x0 + x * S, y0 + y * S, S * 0.88, S * 0.88);
      }
    }
  }
}

// LCD через переходник PCF8574 (адрес 0x27): P0=RS, P1=RW, P2=E, P3=подсветка, P4-P7=D4-D7
export class LcdI2C {
  constructor(addr = 0x27, cols = 16, rows = 2) { this.addr = addr; this.lcd = new HD44780(cols, rows); this.last = 0; this.port = 0xff; }
  write(b) {
    const fall = (this.last & 4) && !(b & 4);
    this.lcd.backlight = !!(b & 8);
    if (fall) this.lcd.nibble(b & 1, b >> 4);
    this.last = b; this.lcd.dirty = true; this.port = b;
    return true;
  }
  read() { return this.port; }
}

// LCD 1602 параллельный (LiquidCrystal): RS, E, D4-D7
export function lcdParallel(env, part) {
  const lcd = new HD44780(16, 2);
  env.onLevel("E", (lvl) => {
    if (lvl) return;
    const rs = env.level("RS") ? 1 : 0;
    const n = (env.level("D4") ? 1 : 0) | (env.level("D5") ? 2 : 0) | (env.level("D6") ? 4 : 0) | (env.level("D7") ? 8 : 0);
    lcd.nibble(rs, n);
  });
  return lcd;
}

// ─────────────── OLED SSD1306 128x64 по I2C ───────────────
export class SSD1306 {
  constructor(addr = 0x3c, h = 64) {
    this.addr = addr; this.w = 128; this.h = h; this.pages = h / 8;
    this.ram = new Uint8Array(128 * 8); this.on = false; this.inv = false; this.contrast = 0xcf;
    this.mode = 0; this.c0 = 0; this.c1 = 127; this.p0 = 0; this.p1 = 7; this.col = 0; this.page = 0;
    this.ctl = null; this.args = []; this.need = 0; this.cmdBuf = null; this.dirty = true; this.flipX = false; this.flipY = false; this.startLine = 0;
  }
  start() { this.ctl = null; }
  write(b) {
    if (this.ctl === null) { this.ctl = b; return true; }
    if (this.ctl & 0x40) { this.data(b); if (this.ctl & 0x80) this.ctl = null; return true; }
    this.cmd(b); if (this.ctl & 0x80) this.ctl = null;
    return true;
  }
  read() { return this.on ? 0x03 : 0x43; }
  data(b) {
    this.ram[this.page * 128 + this.col] = b; this.dirty = true;
    if (this.mode === 1) { // вертикальная
      if (++this.page > this.p1) { this.page = this.p0; if (++this.col > this.c1) this.col = this.c0; }
    } else {
      if (++this.col > (this.mode === 2 ? 127 : this.c1)) { this.col = this.mode === 2 ? 0 : this.c0; if (this.mode === 0 && ++this.page > this.p1) this.page = this.p0; }
    }
  }
  cmd(b) {
    if (this.need) {
      this.args.push(b);
      if (--this.need) return;
      const [op, a1, a2] = [this.cmdBuf, ...this.args];
      if (op === 0x20) this.mode = a1 & 3;
      else if (op === 0x21) { this.c0 = a1 & 127; this.c1 = a2 & 127; this.col = this.c0; }
      else if (op === 0x22) { this.p0 = a1 & 7; this.p1 = a2 & 7; this.page = this.p0; }
      else if (op === 0x81) this.contrast = a1;
      this.dirty = true;
      return;
    }
    const takes = { 0x20: 1, 0x21: 2, 0x22: 2, 0x81: 1, 0x8d: 1, 0xa8: 1, 0xd3: 1, 0xd5: 1, 0xd9: 1, 0xda: 1, 0xdb: 1, 0x26: 6, 0x27: 6, 0x29: 5, 0x2a: 5, 0xa3: 2 };
    if (takes[b]) { this.cmdBuf = b; this.need = takes[b]; this.args = []; return; }
    if (b === 0xae) this.on = false; else if (b === 0xaf) this.on = true;
    else if (b === 0xa6) this.inv = false; else if (b === 0xa7) this.inv = true;
    else if (b === 0xa0) this.flipX = false; else if (b === 0xa1) this.flipX = true;
    else if (b === 0xc0) this.flipY = false; else if (b === 0xc8) this.flipY = true;
    else if (b >= 0x40 && b <= 0x7f) this.startLine = b & 63;
    else if (b >= 0xb0 && b <= 0xb7) this.page = b & 7;
    else if (b <= 0x0f) this.col = (this.col & 0xf0) | b;
    else if (b >= 0x10 && b <= 0x1f) this.col = (this.col & 0x0f) | ((b & 0xf) << 4);
    this.dirty = true;
  }
  pixel(x, y) { const v = (this.ram[(y >> 3) * 128 + x] >> (y & 7)) & 1; return this.inv ? !v : !!v; }
  draw(cv) {
    const ctx = cv.getContext("2d"); const W = cv.width, H = cv.height, sx = W / 128, sy = H / this.h;
    ctx.fillStyle = "#05070a"; ctx.fillRect(0, 0, W, H);
    if (!this.on) return;
    const k = 0.55 + 0.45 * (this.contrast / 255);
    ctx.fillStyle = `rgba(175,225,255,${k})`;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < 128; x++) {
      const xx = this.flipX ? x : x, yy = (y + this.startLine) % this.h;
      if (this.pixel(xx, yy)) ctx.fillRect((this.flipX ? x : x) * sx, (this.flipY ? y : y) * sy, sx * 0.92, sy * 0.92);
    }
  }
}

// ─────────────── MPU6050 (акселерометр и гироскоп) ───────────────
export class MPU6050 {
  constructor(part, addr = 0x68) { this.part = part; this.addr = addr; this.reg = 0; this.first = true; this.regs = new Uint8Array(128); this.regs[0x6b] = 0x40; this.regs[0x75] = 0x68; }
  start() { this.first = true; }
  write(b) { if (this.first) { this.reg = b; this.first = false; } else { this.regs[this.reg & 127] = b; this.reg++; } return true; }
  read() {
    const p = this.part.props, s16 = (v) => { v = Math.max(-32768, Math.min(32767, Math.round(v))); return v & 0xffff; };
    const afs = [16384, 8192, 4096, 2048][(this.regs[0x1c] >> 3) & 3], gfs = [131, 65.5, 32.8, 16.4][(this.regs[0x1b] >> 3) & 3];
    const vals = { 0x3b: s16(p.ax * afs), 0x3d: s16(p.ay * afs), 0x3f: s16(p.az * afs), 0x41: s16((p.temp - 36.53) * 340), 0x43: s16(p.gx * gfs), 0x45: s16(p.gy * gfs), 0x47: s16(p.gz * gfs) };
    const r = this.reg & 127; this.reg++;
    if (r >= 0x3b && r <= 0x48) { const off = r - 0x3b, v = vals[0x3b + (off & ~1)]; return off & 1 ? v & 0xff : v >> 8; } // пары: старший байт, младший
    return this.regs[r];
  }
}

// ─────────────── DS3231 (часы реального времени) ───────────────
export class DS3231 {
  constructor(addr = 0x68) { this.addr = addr; this.reg = 0; this.first = true; this.offset = 0; }
  start() { this.first = true; }
  write(b) {
    if (this.first) { this.reg = b; this.first = false; return true; }
    if (this.reg <= 6) { /* установка времени: сдвиг относительно часов компьютера */ const d = this.now(); const bcd = (v) => (v >> 4) * 10 + (v & 15); const parts = this.parts(d); parts[this.reg] = bcd(b & 0x7f); this.offset += this.fromParts(parts) - d.getTime(); }
    this.reg++; return true;
  }
  now() { return new Date(Date.now() + this.offset); }
  parts(d) { return [d.getSeconds(), d.getMinutes(), d.getHours(), d.getDay() || 7, d.getDate(), d.getMonth() + 1, d.getFullYear() % 100]; }
  fromParts(p) { return new Date(2000 + p[6], p[5] - 1, p[4], p[2], p[1], p[0]).getTime(); }
  read() {
    const d = this.now(), p = this.parts(d), bcd = (v) => ((Math.floor(v / 10) << 4) | (v % 10));
    const r = this.reg++;
    if (r <= 6) return bcd(p[r]);
    if (r === 0x11) return 22; if (r === 0x12) return 0;
    return 0;
  }
}

// ─────────────── WS2812 (NeoPixel): разбор импульсов на выводе DIN ───────────────
export class WS2812 {
  constructor(n) { this.n = n; this.rgb = new Uint8Array(n * 3); this.bits = []; this.riseT = 0; this.lastT = 0; this.dirty = true; }
  edge(level, t) {
    if (level) {
      if (t - this.lastT > 50e-6) this.latch();
      this.riseT = t;
    } else {
      const hi = t - this.riseT;
      if (hi > 0 && hi < 5e-6) this.bits.push(hi > 0.55e-6 ? 1 : 0);
    }
    this.lastT = t;
  }
  latch() {
    if (this.bits.length >= 24) {
      const k = Math.min(this.n, Math.floor(this.bits.length / 24));
      for (let i = 0; i < k; i++) {
        let g = 0, r = 0, b = 0;
        for (let j = 0; j < 8; j++) { g = (g << 1) | this.bits[i * 24 + j]; r = (r << 1) | this.bits[i * 24 + 8 + j]; b = (b << 1) | this.bits[i * 24 + 16 + j]; }
        this.rgb[i * 3] = r; this.rgb[i * 3 + 1] = g; this.rgb[i * 3 + 2] = b;
      }
      this.dirty = true;
    }
    this.bits = [];
  }
  idle(t) { if (this.bits.length && t - this.lastT > 50e-6) this.latch(); }
  setRGB(flat) { for (let i = 0; i < Math.min(flat.length, this.n * 3); i++) this.rgb[i] = flat[i]; this.dirty = true; }
  color(i) { return [this.rgb[i * 3], this.rgb[i * 3 + 1], this.rgb[i * 3 + 2]]; }
}

// ─────────────── DHT11 / DHT22 на одном проводе ───────────────
export function dhtResponder(env, part, kind) {
  let lowAt = null;
  const pin = env.pin("DATA");
  const mcu = env.mcu;
  if (!pin) return null;
  const temp = () => part.props.temp, hum = () => part.props.hum;
  const frame = () => {
    let b;
    if (kind === 11) {
      const h = Math.round(hum()), t = Math.round(temp());
      b = [h & 255, 0, t < 0 ? 0 : t & 255, 0];
    } else {
      const h = Math.round(hum() * 10), t = Math.round(Math.abs(temp()) * 10) | (temp() < 0 ? 0x8000 : 0);
      b = [h >> 8, h & 255, t >> 8, t & 255];
    }
    b.push((b[0] + b[1] + b[2] + b[3]) & 255);
    return b;
  };
  mcu.onPin(pin, (level, t, mode) => {
    const driving = mode === "low";
    if (driving) { if (lowAt === null) lowAt = t; return; }
    if (lowAt === null) return;
    const held = t - lowAt; lowAt = null;
    if (held < 0.0008 || !env.powered()) return;
    // ответ датчика: 20-40 мкс пауза, 80 мкс низкий, 80 мкс высокий, 40 бит, 50 мкс низкий в конце
    let at = 30e-6;
    const seq = [[false, 80e-6], [true, 80e-6]];
    for (const byte of frame()) for (let i = 7; i >= 0; i--) { seq.push([false, 50e-6]); seq.push([true, (byte >> i) & 1 ? 70e-6 : 27e-6]); }
    seq.push([false, 50e-6]);
    for (const [lvl, dur] of seq) { mcu.drive(pin, lvl, at); at += dur; }
    mcu.drive(pin, null, at);
  });
  return { temperature: temp, humidity: hum, powered: () => env.powered() };
}

// ─────────────── HC-SR04 ───────────────
export function sonar(env, part) {
  const trig = env.pin("TRIG"), echo = env.pin("ECHO"), mcu = env.mcu;
  const cm = () => Math.max(2, Math.min(400, part.props.dist));
  if (trig && echo && mcu.kind !== "py") {
    let riseT = null;
    mcu.onPin(trig, (level, t) => {
      if (level) { riseT = t; return; }
      if (riseT === null || t - riseT < 8e-6 || !env.powered()) return;
      riseT = null;
      mcu.drive(echo, true, 0.0002);
      mcu.drive(echo, false, 0.0002 + cm() * 58e-6);
      mcu.drive(echo, null, 0.0002 + cm() * 58e-6 + 1e-6);
    });
  }
  if (echo && mcu.kind === "py") mcu.devices.pulse[echo] = (level) => (env.powered() ? (level ? Math.round(cm() * 58.2) : 200) : -2);
  return { cm };
}

// ─────────────── 74HC595: регистр сдвига ───────────────
export function shift595(env, part) {
  const st = { shift: 0, out: 0, qh: false };
  env.onLevel("SRCLK", (lvl) => {
    if (!lvl) return;
    if (!env.level("SRCLR", true)) { st.shift = 0; return; }
    st.shift = ((st.shift << 1) | (env.level("SER") ? 1 : 0)) & 0xff;
    st.qh = !!(st.shift & 0x80);
  });
  env.onLevel("RCLK", (lvl) => { if (lvl) st.out = st.shift; });
  env.driver("QH'", () => st.qh);
  return st;
}

// ─────────────── TM1637: 4 разряда, двухпроводной протокол (младший бит первым) ───────────────
export function tm1637(env, part) {
  const st = { seg: [0, 0, 0, 0, 0, 0], on: false, bright: 7, addr: 0, inc: true, bits: 0, n: 0, first: true, dirty: true };
  let clk = true, dio = true;
  const onEdge = () => {
    const c = env.level("CLK", true), d = env.level("DIO", true);
    if (c && clk && !d && dio) { st.n = 0; st.bits = 0; st.first = true; } // старт
    else if (c && clk && d && !dio) { /* стоп */ }
    else if (c && !clk) { // фронт CLK: бит
      if (st.n < 8) { st.bits |= (d ? 1 : 0) << st.n; st.n++; }
      else { // 9-й такт - подтверждение
        const b = st.bits; st.n = 0; st.bits = 0;
        if (st.first) {
          st.first = false;
          if ((b & 0xc0) === 0x40) st.inc = !(b & 4);
          else if ((b & 0xc0) === 0xc0) st.addr = b & 7;
          else if ((b & 0xc0) === 0x80) { st.on = !!(b & 8); st.bright = b & 7; st.dirty = true; }
        } else { st.seg[st.addr & 7] = b; if (st.inc) st.addr++; st.dirty = true; }
      }
    }
    clk = c; dio = d;
  };
  env.onLevel("CLK", onEdge); env.onLevel("DIO", onEdge);
  return st;
}
