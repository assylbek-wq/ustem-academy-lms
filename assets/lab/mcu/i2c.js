// Шина I2C: адрес -> устройство. Одна и та же для AVR (TWI), RP2040 (I2C0/I2C1) и MicroPython (machine.I2C).
// Устройство: { addr, start(), write(byte) -> ack, read() -> byte, stop() }.
export class I2CBus {
  constructor() { this.devices = new Map(); this.cur = null; this.log = []; }
  attach(dev) { this.devices.set(dev.addr, dev); }
  clear() { this.devices.clear(); }
  start() { if (this.cur && this.cur.start) this.cur.start(true); }
  connect(addr, read) {
    this.cur = this.devices.get(addr) || null;
    if (this.cur) { this.cur.reading = read; if (this.cur.start) this.cur.start(false, read); }
    return !!this.cur;
  }
  write(b) { return this.cur ? this.cur.write(b) !== false : false; }
  read() { return this.cur ? this.cur.read() & 0xff : 0xff; }
  stop() { if (this.cur && this.cur.stop) this.cur.stop(); this.cur = null; }
  // готовые транзакции для MicroPython
  writeto(addr, bytes) { if (!this.connect(addr, false)) return false; for (const b of bytes) this.write(b); this.stop(); return true; }
  readfrom(addr, n) { if (!this.connect(addr, true)) return null; const out = []; for (let i = 0; i < n; i++) out.push(this.read()); this.stop(); return out; }
  scan() { return [...this.devices.keys()].sort((a, b) => a - b); }
}
