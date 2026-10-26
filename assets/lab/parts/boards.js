// Платы: Arduino Uno, Nano, Mega 2560, Raspberry Pi Pico, ESP32 DevKitC, BBC micro:bit v2 с платой расширения.
// Каждая плата знает свой микроконтроллер (mcu), имена выводов в программе (mcuPin) и источники питания.
import { P, MM, el, lead, label, mono, header, smd, tact, shade } from "./core.js";

const silk = (g, x, y, t, s = 6, c = "#f1f3f5", a = "middle", w = 500) => label(g, x, y, t, s, c, a, w);
function boardLed(g, x, y, color, text, tx = 10) {
  el("rect", { x: x - 3, y: y - 2, width: 6, height: 4, rx: 0.6, fill: "#f8f9fa", opacity: 0.9 }, g);
  const glow = el("circle", { cx: x, cy: y, r: 7, fill: color, opacity: 0, filter: "url(#f-blur)" }, g);
  const dot = el("rect", { x: x - 2, y: y - 1.3, width: 4, height: 2.6, fill: color, opacity: 0.3 }, g);
  if (text) silk(g, x + tx, y + 2, text, 5.5, "#f1f3f5", "start");
  return { set(on) { dot.setAttribute("opacity", on ? 1 : 0.3); glow.setAttribute("opacity", on ? 0.85 : 0); } };
}
function usbB(g, x, y) { // разъем USB-B (Uno, Mega): торчит за край платы
  el("rect", { x, y, width: 4.6 * P, height: 3.4 * P, rx: 1.5, fill: "url(#g-metal)", stroke: "#868e96", filter: "url(#f-shadow)" }, g);
  el("rect", { x: x + 0.5 * P, y: y + 0.6 * P, width: 3.6 * P, height: 2.2 * P, rx: 1, fill: "none", stroke: "#adb5bd" }, g);
}
function dcJack(g, x, y) {
  el("rect", { x, y, width: 4.2 * P, height: 2.9 * P, rx: 1.5, fill: "url(#g-black)", filter: "url(#f-shadow)" }, g);
  el("circle", { cx: x + 0.9 * P, cy: y + 1.45 * P, r: 0.7 * P, fill: "#111", stroke: "#495057" }, g);
}
function microUsb(g, x, y, w = 1.6 * P, h = 1.2 * P) { el("rect", { x, y, width: w, height: h, rx: 1, fill: "url(#g-metalh)", stroke: "#868e96" }, g); el("rect", { x: x + 2, y: y + h * 0.35, width: w - 4, height: h * 0.3, fill: "#343a40" }, g); }
function qfp(g, cx, cy, s, text, pins = 8) {
  el("rect", { x: cx - s / 2, y: cy - s / 2, width: s, height: s, fill: "url(#g-ic)", transform: `rotate(45 ${cx} ${cy})` }, g);
  for (let i = 0; i < pins; i++) for (const k of [0, 1, 2, 3]) {
    const t = -s / 2 + (i + 0.5) * s / pins;
    const [x, y] = [[t, -s / 2 - 1.4], [s / 2 + 1.4, t], [t, s / 2 + 1.4], [-s / 2 - 1.4, t]][k];
    el("rect", { x: cx + x - 0.6, y: cy + y - 0.6, width: 1.2, height: 1.2, fill: "#c9ced4", transform: `rotate(45 ${cx} ${cy})` }, g);
  }
  if (text) silk(g, cx, cy + 2, text, 4.6, "#adb5bd");
}

// ───────────────── Arduino Uno R3 ─────────────────
const UNO_TOP = [["SCL", 9], ["SDA", 10], ["AREF", 11], ["GND.1", 12], ["13", 13], ["12", 14], ["11", 15], ["10", 16], ["9", 17], ["8", 18],
  ["7", 20], ["6", 21], ["5", 22], ["4", 23], ["3", 24], ["2", 25], ["1", 26], ["0", 27]];
const UNO_BOT = [["IOREF", 10], ["RESET", 11], ["3.3V", 12], ["5V", 13], ["GND.2", 14], ["GND.3", 15], ["VIN", 16],
  ["A0", 18], ["A1", 19], ["A2", 20], ["A3", 21], ["A4", 22], ["A5", 23]];
const PWM_UNO = new Set(["3", "5", "6", "9", "10", "11"]);
const uno = {
  title: "Arduino Uno R3", group: "Платы", w: 29 * P, h: 21 * P, layer: 0, board: "uno", mcuKind: "avr", vcc: 5, kind3d: "board", lang: "cpp",
  desc: "ATmega328P, 16 МГц, 32 КБ flash, 2 КБ ОЗУ. 14 цифровых выводов (6 с ШИМ ~), 6 аналоговых входов, I2C на A4/A5, светодиод L на выводе 13.",
  pins: () => [...UNO_TOP.map(([n, x]) => ({ name: n, x: x * P, y: P, title: n === "SCL" || n === "SDA" ? n + " (то же, что A" + (n === "SDA" ? 4 : 5) + ")" : PWM_UNO.has(n) ? "D" + n + " ~ШИМ" : undefined })),
    ...UNO_BOT.map(([n, x]) => ({ name: n, x: x * P, y: 20 * P }))],
  mcuPin: (name) => (/^(\d+|A\d)$/.test(name) ? name : name === "SDA" ? "A4" : name === "SCL" ? "A5" : null),
  render(g, part) {
    const W = 29 * P, H = 21 * P;
    el("path", { d: `M 8 0 H ${W - 18} L ${W} 18 V ${H - 8} Q ${W} ${H} ${W - 8} ${H} H 8 Q 0 ${H} 0 ${H - 8} V 8 Q 0 0 8 0 Z`, fill: "#00878f", stroke: "#006a70", filter: "url(#f-shadow)" }, g);
    el("path", { d: `M 8 0 H ${W - 18} L ${W} 18 V ${H - 8} Q ${W} ${H} ${W - 8} ${H} H 8 Q 0 ${H} 0 ${H - 8} V 8 Q 0 0 8 0 Z`, fill: "none", stroke: "#3fb6bd", "stroke-width": 0.6, opacity: 0.6 }, g);
    for (const [hx, hy] of [[1.0 * P, 1.1 * P], [27.5 * P, 2.2 * P], [1.0 * P, 19.6 * P], [26.6 * P, 19.6 * P]]) { el("circle", { cx: hx, cy: hy, r: 5, fill: "url(#g-gold)" }, g); el("circle", { cx: hx, cy: hy, r: 3.2, fill: "#f8f9fa" }, g); }
    usbB(g, -1.3 * P, 2.6 * P); dcJack(g, -1.1 * P, 14.4 * P);
    // разъемы
    header(g, 9 * P, P, 10, { female: true }); header(g, 20 * P, P, 8, { female: true });
    header(g, 10 * P, 20 * P, 7, { female: true }); header(g, 18 * P, 20 * P, 6, { female: true });
    header(g, 26.2 * P, 9.2 * P, 3, { vertical: true }); header(g, 27.2 * P, 9.2 * P, 3, { vertical: true });
    // микросхема в панельке
    el("rect", { x: 11.2 * P, y: 11.6 * P, width: 14.6 * P, height: 4.2 * P, rx: 1.5, fill: "#2b2d31" }, g);
    el("rect", { x: 11.6 * P, y: 12.1 * P, width: 13.8 * P, height: 3.2 * P, rx: 1, fill: "url(#g-ic)" }, g);
    el("circle", { cx: 12.1 * P, cy: 13.7 * P, r: 3, fill: "#111" }, g);
    silk(g, 18.5 * P, 13.4 * P, "ATMEGA328P-PU", 7.5, "#ced4da", "middle", 600);
    silk(g, 18.5 * P, 14.5 * P, "ATMEL", 5.5, "#868e96");
    for (let i = 0; i < 14; i++) { el("rect", { x: 11.85 * P + i * P - 1.8, y: 11.55 * P, width: 3.6, height: 0.55 * P, fill: "url(#g-metalh)" }, g); el("rect", { x: 11.85 * P + i * P - 1.8, y: 15.3 * P, width: 3.6, height: 0.55 * P, fill: "url(#g-metalh)" }, g); }
    // USB-микросхема, кварц, кнопка, стабилизатор, конденсаторы
    el("rect", { x: 8.2 * P, y: 4.4 * P, width: 2.4 * P, height: 2.4 * P, fill: "url(#g-ic)", transform: `rotate(45 ${9.4 * P} ${5.6 * P})` }, g);
    silk(g, 9.4 * P, 5.75 * P, "16U2", 5, "#adb5bd");
    el("rect", { x: 5.2 * P, y: 7.3 * P, width: 2.6 * P, height: 1.1 * P, rx: 4, fill: "url(#g-metalh)", stroke: "#868e96" }, g);
    silk(g, 6.5 * P, 8.05 * P, "16.000", 4.4, "#495057");
    tact(g, 2.3 * P, 1.6 * P, 5.5 * MM, "#c92a2a");
    el("rect", { x: 3.5 * P, y: 16.2 * P, width: 2.2 * P, height: 1.8 * P, fill: "url(#g-ic)" }, g); el("rect", { x: 3.5 * P, y: 15.6 * P, width: 2.2 * P, height: 0.6 * P, fill: "url(#g-metalh)" }, g);
    for (const [cx, cy] of [[6.6 * P, 16.9 * P], [8.3 * P, 16.9 * P]]) { el("circle", { cx, cy, r: 0.75 * P, fill: "#c9ced4", stroke: "#868e96" }, g); el("circle", { cx, cy, r: 0.5 * P, fill: "#dee2e6" }, g); }
    for (let i = 0; i < 6; i++) smd(g, 5 * P + i * 1.2 * P, 10.5 * P, i % 2 ? "c" : "r", 90);
    // надписи
    silk(g, 16.5 * P, 3.0 * P, "DIGITAL (PWM~)", 6.5, "#f1f3f5", "middle", 600);
    silk(g, 20.5 * P, 18.4 * P, "ANALOG IN", 6.5, "#f1f3f5", "middle", 600);
    silk(g, 12.5 * P, 18.4 * P, "POWER", 6.5, "#f1f3f5", "middle", 600);
    el("rect", { x: 14.5 * P, y: 5.2 * P, width: 6.6 * P, height: 2.5 * P, rx: 3, fill: "none", stroke: "#f1f3f5", "stroke-width": 1.2 }, g);
    silk(g, 17.8 * P, 7.1 * P, "UNO", 22, "#f1f3f5", "middle", 800);
    silk(g, 24 * P, 6.6 * P, "ARDUINO", 7, "#f1f3f5", "middle", 700);
    for (const p of this.pins()) {
      const lbl = p.name.replace(/\.\d$/, "");
      const t = p.y < 10 * P ? (PWM_UNO.has(lbl) ? "~" + lbl : lbl) : lbl;
      silk(g, p.x, p.y < 10 * P ? p.y + 14 : p.y - 10, t, 5.3, "#f1f3f5", "middle", 500).setAttribute("transform", `rotate(-90 ${p.x} ${p.y < 10 * P ? p.y + 14 : p.y - 10})`);
    }
    part.$l = boardLed(g, 12.6 * P, 4.0 * P, "#f59f00", "L");
    part.$tx = boardLed(g, 12.6 * P, 5.2 * P, "#f59f00", "TX");
    part.$rx = boardLed(g, 12.6 * P, 6.4 * P, "#f59f00", "RX");
    part.$on = boardLed(g, 24.6 * P, 8.6 * P, "#37b24d", "ON", -14);
  },
  update(part, st) { part.$l.set(st.led && st.led[part.id]); part.$tx.set(st.tx); part.$on.set(true); },
  links: (k) => [[k("GND.1"), k("GND.2")], [k("GND.1"), k("GND.3")], [k("SDA"), k("A4")], [k("SCL"), k("A5")]],
  gnd: "GND.1", led: "13",
  model: (part, n) => [
    { type: "V", p: n("5V"), n: n("GND.1"), v: 5, r: 0.1, key: part.id + ":5v" },
    { type: "V", p: n("3.3V"), n: n("GND.1"), v: 3.3, r: 0.5, key: part.id + ":3v3" },
  ],
};

// ───────────────── Arduino Nano ─────────────────
const NANO_TOP = ["D12", "D11", "D10", "D9", "D8", "D7", "D6", "D5", "D4", "D3", "D2", "GND.1", "RST.1", "D0", "D1"];
const NANO_BOT = ["D13", "3V3", "AREF", "A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "5V", "RST.2", "GND.2", "VIN"];
const nano = {
  title: "Arduino Nano", group: "Платы", w: 17 * P, h: 7 * P, board: "nano", mcuKind: "avr", vcc: 5, kind3d: "board", lang: "cpp",
  desc: "Тот же ATmega328P, что у Uno, в маленьком корпусе для макетной платы: ряды выводов на расстоянии 0,6 дюйма (через канавку). Восемь аналоговых входов: A6 и A7 - только аналоговые.",
  pins: () => [...NANO_TOP.map((n, i) => ({ name: n, x: (i + 1) * P, y: 0 })), ...NANO_BOT.map((n, i) => ({ name: n, x: (i + 1) * P, y: 6 * P }))],
  mcuPin: (name) => (/^D\d+$/.test(name) ? name.slice(1) : /^A\d$/.test(name) ? name : null),
  render(g, part) {
    const x0 = 0, y0 = -0.7 * P, W = 16.6 * P, H = 7.4 * P;
    el("rect", { x: x0, y: y0, width: W, height: H, rx: 3, fill: "#00669e", stroke: "#004c76", filter: "url(#f-shadow)" }, g);
    microUsb(g, -0.6 * P, 2.1 * P, 1.9 * P, 1.8 * P);
    for (const p of this.pins()) { el("circle", { cx: p.x, cy: p.y, r: 4.6, fill: "url(#g-gold)" }, g); el("rect", { x: p.x - 2.4, y: p.y - 2.4, width: 4.8, height: 4.8, fill: "#ced4da" }, g); }
    qfp(g, 9 * P, 3 * P, 2.6 * P, "328P");
    tact(g, 4.2 * P, 3 * P, 4.5 * MM, "#f1f3f5");
    el("rect", { x: 13 * P, y: 2.3 * P, width: 1.7 * P, height: 1.4 * P, fill: "url(#g-ic)" }, g);
    NANO_TOP.forEach((n, i) => silk(g, (i + 1) * P, 0.95 * P, n.replace(/\.\d/, "").replace(/^D/, ""), 4.6));
    NANO_BOT.forEach((n, i) => silk(g, (i + 1) * P, 5.35 * P, n.replace(/\.\d/, "").replace(/^D/, ""), 4.6));
    silk(g, 12.2 * P, 4.5 * P, "NANO", 7, "#f1f3f5", "middle", 700);
    part.$l = boardLed(g, 5.8 * P, 4.4 * P, "#f59f00", "L", 6);
    part.$tx = boardLed(g, 5.8 * P, 1.6 * P, "#f59f00", "TX", 6);
    part.$on = boardLed(g, 7.6 * P, 4.4 * P, "#37b24d", "", 6);
  },
  update: uno.update,
  links: (k) => [[k("GND.1"), k("GND.2")], [k("RST.1"), k("RST.2")]],
  gnd: "GND.1", led: "13",
  model: (part, n) => [{ type: "V", p: n("5V"), n: n("GND.1"), v: 5, r: 0.15, key: part.id + ":5v" }, { type: "V", p: n("3V3"), n: n("GND.1"), v: 3.3, r: 1, key: part.id + ":3v3" }],
};

// ───────────────── Arduino Mega 2560 ─────────────────
const MEGA_TOP = [["SCL", 9], ["SDA", 10], ["AREF", 11], ["GND.1", 12], ["13", 13], ["12", 14], ["11", 15], ["10", 16], ["9", 17], ["8", 18],
  ["7", 20], ["6", 21], ["5", 22], ["4", 23], ["3", 24], ["2", 25], ["1", 26], ["0", 27],
  ["14", 29], ["15", 30], ["16", 31], ["17", 32], ["18", 33], ["19", 34], ["20", 35], ["21", 36]];
const MEGA_BOT = [["IOREF", 10], ["RESET", 11], ["3.3V", 12], ["5V", 13], ["GND.2", 14], ["GND.3", 15], ["VIN", 16],
  ...Array.from({ length: 8 }, (_, i) => ["A" + i, 18 + i]), ...Array.from({ length: 8 }, (_, i) => ["A" + (8 + i), 27 + i])];
const MEGA_DBL = [];
for (let i = 0; i < 16; i++) { MEGA_DBL.push([String(22 + 2 * i), 38.5 + i, 2]); MEGA_DBL.push([String(23 + 2 * i), 38.5 + i, 3]); }
const mega = {
  title: "Arduino Mega 2560", group: "Платы", w: 53 * P, h: 21 * P, layer: 0, board: "mega", mcuKind: "avr", vcc: 5, kind3d: "board", lang: "cpp",
  desc: "ATmega2560: 54 цифровых вывода (15 с ШИМ), 16 аналоговых входов, 4 UART, 256 КБ flash, 8 КБ ОЗУ. I2C на 20 (SDA) и 21 (SCL).",
  pins: () => [...MEGA_TOP.map(([n, x]) => ({ name: n, x: x * P, y: P })), ...MEGA_BOT.map(([n, x]) => ({ name: n, x: x * P, y: 20 * P })),
    ...MEGA_DBL.map(([n, x, r]) => ({ name: n, x: (r === 2 ? 50 : 51) * P, y: (x - 36.5) * P })),
    { name: "5V.2", x: 50 * P, y: 1 * P }, { name: "5V.3", x: 51 * P, y: 1 * P }, { name: "GND.4", x: 50 * P, y: 18 * P }, { name: "GND.5", x: 51 * P, y: 18 * P }],
  mcuPin: (name) => (/^(\d+|A\d+)$/.test(name) ? name : name === "SDA" ? "20" : name === "SCL" ? "21" : null),
  render(g, part) {
    const W = 53 * P, H = 21 * P;
    el("path", { d: `M 8 0 H ${W - 8} Q ${W} 0 ${W} 8 V ${H - 8} Q ${W} ${H} ${W - 8} ${H} H 8 Q 0 ${H} 0 ${H - 8} V 8 Q 0 0 8 0 Z`, fill: "#00878f", stroke: "#006a70", filter: "url(#f-shadow)" }, g);
    usbB(g, -1.3 * P, 2.6 * P); dcJack(g, -1.1 * P, 14.4 * P);
    header(g, 9 * P, P, 10, { female: true }); header(g, 20 * P, P, 8, { female: true }); header(g, 29 * P, P, 8, { female: true });
    header(g, 10 * P, 20 * P, 7, { female: true }); header(g, 18 * P, 20 * P, 8, { female: true }); header(g, 27 * P, 20 * P, 8, { female: true });
    header(g, 50 * P, 1 * P, 18, { female: true, vertical: true }); header(g, 51 * P, 1 * P, 18, { female: true, vertical: true });
    el("rect", { x: 22 * P, y: 7.5 * P, width: 7 * P, height: 7 * P, fill: "url(#g-ic)", filter: "url(#f-shadow)" }, g);
    silk(g, 25.5 * P, 11 * P, "ATMEGA2560", 7, "#ced4da", "middle", 600); silk(g, 25.5 * P, 12 * P, "16AU", 5.5, "#868e96");
    for (let i = 0; i < 25; i++) for (const s of [0, 1]) { el("rect", { x: 22.15 * P + i * 0.27 * P, y: s ? 14.5 * P : 7.2 * P, width: 1.6, height: 0.3 * P, fill: "#c9ced4" }, g); el("rect", { x: s ? 29 * P : 21.7 * P, y: 7.65 * P + i * 0.27 * P, width: 0.3 * P, height: 1.6, fill: "#c9ced4" }, g); }
    tact(g, 2.3 * P, 1.6 * P, 5.5 * MM, "#c92a2a");
    el("rect", { x: 5.2 * P, y: 7.3 * P, width: 2.6 * P, height: 1.1 * P, rx: 4, fill: "url(#g-metalh)", stroke: "#868e96" }, g);
    silk(g, 38 * P, 9 * P, "MEGA 2560", 22, "#f1f3f5", "middle", 800); silk(g, 38 * P, 11 * P, "ARDUINO", 8, "#f1f3f5", "middle", 700);
    silk(g, 20 * P, 3 * P, "PWM", 6.5, "#f1f3f5", "middle", 600); silk(g, 32.5 * P, 3 * P, "COMMUNICATION", 6.5, "#f1f3f5", "middle", 600);
    silk(g, 26 * P, 18.4 * P, "ANALOG IN", 6.5, "#f1f3f5", "middle", 600); silk(g, 48.7 * P, 10 * P, "DIGITAL", 6.5, "#f1f3f5", "middle", 600).setAttribute("transform", `rotate(-90 ${48.7 * P} ${10 * P})`);
    for (const p of this.pins()) {
      const lbl = p.name.replace(/\.\d$/, "");
      if (p.x >= 49 * P) { silk(g, p.x + (p.x > 50.5 * P ? 10 : -10), p.y + 2, lbl, 4.6, "#f1f3f5"); continue; }
      const y = p.y < 10 * P ? p.y + 14 : p.y - 10;
      silk(g, p.x, y, lbl, 5, "#f1f3f5").setAttribute("transform", `rotate(-90 ${p.x} ${y})`);
    }
    part.$l = boardLed(g, 12.6 * P, 4.0 * P, "#f59f00", "L"); part.$tx = boardLed(g, 12.6 * P, 5.2 * P, "#f59f00", "TX"); part.$on = boardLed(g, 16 * P, 7.4 * P, "#37b24d", "ON");
  },
  update: uno.update,
  links: (k) => [[k("GND.1"), k("GND.2")], [k("GND.1"), k("GND.3")], [k("GND.1"), k("GND.4")], [k("GND.1"), k("GND.5")], [k("5V"), k("5V.2")], [k("5V"), k("5V.3")], [k("SDA"), k("20")], [k("SCL"), k("21")]],
  gnd: "GND.1", led: "13",
  model: (part, n) => [{ type: "V", p: n("5V"), n: n("GND.1"), v: 5, r: 0.1, key: part.id + ":5v" }, { type: "V", p: n("3.3V"), n: n("GND.1"), v: 3.3, r: 0.5, key: part.id + ":3v3" }],
};

// ───────────────── Raspberry Pi Pico ─────────────────
const PICO_TOP = ["VBUS", "VSYS", "GND.1", "3V3_EN", "3V3", "ADC_VREF", "GP28", "AGND", "GP27", "GP26", "RUN", "GP22", "GND.2", "GP21", "GP20", "GP19", "GP18", "GND.3", "GP17", "GP16"];
const PICO_BOT = ["GP0", "GP1", "GND.4", "GP2", "GP3", "GP4", "GP5", "GND.5", "GP6", "GP7", "GP8", "GP9", "GND.6", "GP10", "GP11", "GP12", "GP13", "GND.7", "GP14", "GP15"];
const pico = {
  title: "Raspberry Pi Pico", group: "Платы", w: 21 * P, h: 7 * P, board: "pico", mcuKind: "rp2040", vcc: 3.3, kind3d: "board", lang: "py",
  desc: "RP2040: два ядра Cortex-M0+ 133 МГц, 264 КБ ОЗУ, 2 МБ flash. 26 выводов GP (логика 3,3 В!), три АЦП на GP26-GP28, светодиод на GP25. Программа на MicroPython (как в Thonny).",
  pins: () => [...PICO_TOP.map((n, i) => ({ name: n, x: (i + 1) * P, y: 0 })), ...PICO_BOT.map((n, i) => ({ name: n, x: (i + 1) * P, y: 7 * P }))],
  mcuPin: (name) => (/^GP\d+$/.test(name) ? name : null),
  render(g, part) {
    const W = 21 * P, H = 8.4 * P, y0 = -0.7 * P;
    el("rect", { x: 0, y: y0, width: W, height: H, rx: 4, fill: "#1b7a3d", stroke: "#105a2b", filter: "url(#f-shadow)" }, g);
    for (const p of this.pins()) {
      el("path", { d: `M ${p.x - 4} ${p.y === 0 ? y0 : y0 + H} v ${p.y === 0 ? 7 : -7} a 4 4 0 0 ${p.y === 0 ? 0 : 1} 8 0 v ${p.y === 0 ? -7 : 7}`, fill: "url(#g-gold)" }, g);
      el("circle", { cx: p.x, cy: p.y, r: 2.6, fill: "#e9ecef" }, g);
    }
    microUsb(g, -0.5 * P, 2.7 * P, 2.1 * P, 2 * P);
    el("rect", { x: 9 * P, y: 2.1 * P, width: 3 * P, height: 3 * P, fill: "url(#g-ic)" }, g);
    silk(g, 10.5 * P, 3.6 * P, "RP2040", 5.6, "#ced4da", "middle", 600);
    el("rect", { x: 13.5 * P, y: 2.4 * P, width: 2.4 * P, height: 1.6 * P, fill: "url(#g-ic)" }, g); silk(g, 14.7 * P, 3.4 * P, "W25Q16", 3.8, "#868e96");
    tact(g, 5.2 * P, 3.6 * P, 4.5 * MM, "#f1f3f5"); silk(g, 5.2 * P, 5.2 * P, "BOOTSEL", 4.4);
    el("rect", { x: 17.5 * P, y: 2.6 * P, width: 2.6 * P, height: 2.2 * P, rx: 1, fill: "url(#g-metal)" }, g); // отладочный разъем
    silk(g, 15.5 * P, 5.6 * P, "Raspberry Pi Pico ©2020", 5.2, "#f1f3f5", "middle", 600);
    PICO_TOP.forEach((n, i) => silk(g, (i + 1) * P, 0.95 * P, n.replace(/\.\d/, "").replace("ADC_VREF", "VREF").replace("3V3_EN", "EN"), 3.8));
    PICO_BOT.forEach((n, i) => silk(g, (i + 1) * P, 6.4 * P, n.replace(/\.\d/, ""), 3.8));
    part.$l = boardLed(g, 3.2 * P, 1.9 * P, "#37b24d", "LED", 6);
  },
  update(part, st) { part.$l.set(st.led && st.led[part.id]); },
  links: (k) => Array.from({ length: 6 }, (_, i) => [k("GND.1"), k("GND." + (i + 2))]).concat([[k("GND.1"), k("AGND")]]),
  gnd: "GND.1", led: "GP25",
  model: (part, n) => [{ type: "V", p: n("3V3"), n: n("GND.1"), v: 3.3, r: 0.3, key: part.id + ":3v3" }, { type: "V", p: n("VBUS"), n: n("GND.1"), v: 5, r: 0.2, key: part.id + ":vbus" }, { type: "V", p: n("VSYS"), n: n("GND.1"), v: 4.7, r: 0.3, key: part.id + ":vsys" }],
};

// ───────────────── ESP32 DevKitC (38 выводов) ─────────────────
const ESP_TOP = ["5V", "CMD", "SD3", "SD2", "13", "GND.1", "12", "14", "27", "26", "25", "33", "32", "35", "34", "VN", "VP", "EN", "3V3"];
const ESP_BOT = ["CLK", "SD0", "SD1", "15", "2", "0", "4", "16", "17", "5", "18", "19", "GND.2", "21", "RX", "TX", "22", "23", "GND.3"];
const esp32 = {
  title: "ESP32 DevKitC", group: "Платы", w: 20 * P, h: 10 * P, board: "esp32", mcuKind: "py", vcc: 3.3, kind3d: "board", lang: "py",
  desc: "Двухъядерный ESP32 240 МГц с Wi-Fi и Bluetooth. Логика 3,3 В. АЦП на 32-39 и других, ЦАП на 25-26, I2C по умолчанию 21 (SDA) и 22 (SCL), светодиод на GPIO2. Программа на MicroPython.",
  pins: () => [...ESP_TOP.map((n, i) => ({ name: n, x: (i + 1) * P, y: 0 })), ...ESP_BOT.map((n, i) => ({ name: n, x: (i + 1) * P, y: 10 * P }))],
  mcuPin: (name) => (/^\d+$/.test(name) ? name : { VN: "39", VP: "36", RX: "3", TX: "1" }[name] || null),
  render(g, part) {
    const W = 21.5 * P, H = 11.2 * P, y0 = -0.6 * P;
    el("rect", { x: 0, y: y0, width: W, height: H, rx: 3, fill: "#16181b", stroke: "#000", filter: "url(#f-shadow)" }, g);
    header(g, P, 0, 19); header(g, P, 10 * P, 19);
    microUsb(g, -0.6 * P, 4.1 * P, 2.2 * P, 1.8 * P);
    // модуль ESP32-WROOM-32: экран и антенна
    el("rect", { x: 9.2 * P, y: 1.5 * P, width: 12.5 * P, height: 7 * P, rx: 1.5, fill: "#1c3d78" }, g);
    el("rect", { x: 9.6 * P, y: 1.9 * P, width: 8.6 * P, height: 6.2 * P, rx: 1, fill: "url(#g-metal)", stroke: "#868e96" }, g);
    silk(g, 13.9 * P, 4.3 * P, "ESP32-WROOM-32", 6.5, "#343a40", "middle", 700);
    silk(g, 13.9 * P, 5.3 * P, "Wi-Fi + BT", 5.5, "#495057");
    el("path", { d: `M ${18.7 * P} ${2.3 * P} h ${2.4 * P} v ${0.8 * P} h ${-1.6 * P} v ${0.8 * P} h ${1.6 * P} v ${0.8 * P} h ${-1.6 * P} v ${0.8 * P} h ${1.6 * P} v ${0.8 * P} h ${-1.6 * P} v ${0.8 * P} h ${1.6 * P}`, fill: "none", stroke: "url(#g-gold)", "stroke-width": 2 }, g);
    tact(g, 2.7 * P, 2.4 * P, 4 * MM, "#212529"); silk(g, 2.7 * P, 3.9 * P, "EN", 4.4);
    tact(g, 2.7 * P, 7.6 * P, 4 * MM, "#212529"); silk(g, 2.7 * P, 6.6 * P, "BOOT", 4.4);
    el("rect", { x: 4.8 * P, y: 4 * P, width: 1.8 * P, height: 2 * P, fill: "url(#g-ic)" }, g); silk(g, 5.7 * P, 5.15 * P, "CP2102", 3.6, "#868e96");
    ESP_TOP.forEach((n, i) => silk(g, (i + 1) * P, 1.05 * P, n.replace(/\.\d/, ""), 4.2));
    ESP_BOT.forEach((n, i) => silk(g, (i + 1) * P, 9.35 * P, n.replace(/\.\d/, ""), 4.2));
    part.$l = boardLed(g, 7.2 * P, 3.1 * P, "#339af0", "", 6);
    part.$on = boardLed(g, 7.2 * P, 6.9 * P, "#e03131", "", 6);
  },
  update(part, st) { part.$l.set(st.led && st.led[part.id]); part.$on.set(true); },
  links: (k) => [[k("GND.1"), k("GND.2")], [k("GND.1"), k("GND.3")]],
  gnd: "GND.1", led: "2",
  model: (part, n) => [{ type: "V", p: n("3V3"), n: n("GND.1"), v: 3.3, r: 0.3, key: part.id + ":3v3" }, { type: "V", p: n("5V"), n: n("GND.1"), v: 5, r: 0.2, key: part.id + ":5v" }],
};

// ───────────────── micro:bit v2 на плате расширения ─────────────────
const MB_PINS = ["P0", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12", "P13", "P14", "P15", "P16", "P19", "P20"];
const microbit = {
  title: "BBC micro:bit v2", group: "Платы", w: 22 * P, h: 14 * P, board: "microbit", mcuKind: "py", vcc: 3.3, kind3d: "board", lang: "py",
  props: { ax: 0, ay: 0, temp: 22, light: 120, sound: 30 },
  sliders: [{ prop: "ax", label: "Наклон вправо (акселерометр X), mg", min: -1024, max: 1024, step: 16 }, { prop: "ay", label: "Наклон к себе (Y), mg", min: -1024, max: 1024, step: 16 },
    { prop: "temp", label: "Температура, °C", min: -5, max: 50, step: 1 }, { prop: "light", label: "Освещенность (0-255)", min: 0, max: 255, step: 1 }, { prop: "sound", label: "Громкость (0-255)", min: 0, max: 255, step: 1 }],
  desc: "nRF52833, светодиодная матрица 5 x 5, кнопки A и B, акселерометр, компас, датчики света и температуры, микрофон и динамик. Выводы P0-P20 через плату расширения. Программа на MicroPython (как в python.microbit.org).",
  pins: () => [...MB_PINS.map((n, i) => ({ name: n, x: (i + 1) * P, y: 0 })), { name: "3V", x: 20.5 * P, y: 0 }, { name: "GND.1", x: 21.5 * P, y: 0 }, { name: "GND.2", x: 22.5 * P, y: 0 }],
  mcuPin: (name) => (/^P\d+$/.test(name) ? name : null),
  interactive: "keys",
  render(g, part) {
    // плата расширения
    el("rect", { x: 0, y: -2.6 * P, width: 23.5 * P, height: 2.4 * P + 0.5 * P, rx: 3, fill: "#1c1d20", filter: "url(#f-shadow)" }, g);
    header(g, P, 0, 19); header(g, 20.5 * P, 0, 3);
    MB_PINS.forEach((n, i) => silk(g, (i + 1) * P, -0.95 * P, n.slice(1), 5));
    [["3V", 20.5], ["G", 21.5], ["G", 22.5]].forEach(([t, x]) => silk(g, x * P, -0.95 * P, t, 5));
    el("rect", { x: 1.2 * P, y: -2.4 * P, width: 21 * P, height: 0.8 * P, rx: 1, fill: "#000" }, g);
    // сама плата micro:bit (лицевая сторона)
    const x0 = 3.2 * P, y0 = -14.6 * P, W = 17 * P, H = 13.4 * P;
    el("path", { d: `M ${x0 + 6} ${y0} h ${W - 12} q 6 0 6 6 v ${H - 6} h ${-W} v ${-(H - 6)} q 0 -6 6 -6 z`, fill: "#232629", stroke: "#000", filter: "url(#f-shadow)" }, g);
    for (let i = 0; i < 25; i++) el("rect", { x: x0 + 0.8 * P + i * 0.62 * P, y: y0 + H - 1.4 * P, width: 0.4 * P, height: 1.4 * P, fill: "url(#g-gold)" }, g);
    for (const [i, t] of [[0, "0"], [1, "1"], [2, "2"], [3, "3V"], [4, "GND"]]) { const cx = x0 + 1.4 * P + i * 3.6 * P; el("circle", { cx, cy: y0 + H - 2.2 * P, r: 0.75 * P, fill: "url(#g-gold)" }, g); el("circle", { cx, cy: y0 + H - 2.2 * P, r: 0.45 * P, fill: "#232629" }, g); silk(g, cx, y0 + H - 3.4 * P, t, 6.5, "#f1f3f5", "middle", 700); }
    // кнопки и логотип
    for (const [k, cx] of [["A", x0 + 1.8 * P], ["B", x0 + W - 1.8 * P]]) {
      el("rect", { x: cx - 1.1 * P, y: y0 + 3.8 * P, width: 2.2 * P, height: 2.2 * P, rx: 2, fill: "url(#g-metal)" }, g);
      part["$btn" + k] = el("circle", { cx, cy: y0 + 4.9 * P, r: 0.75 * P, fill: "url(#g-black)", stroke: "#000", class: "lab-press", "data-key": k }, g);
      silk(g, cx, y0 + 3.3 * P, k, 8, "#f1f3f5", "middle", 800);
    }
    el("path", { d: `M ${x0 + W / 2 - 14} ${y0 + 1.2 * P} h 28 a 6 6 0 0 1 0 12 h -28 a 6 6 0 0 1 0 -12 z`, fill: "none", stroke: "url(#g-gold)", "stroke-width": 2.4 }, g);
    part.$led = [];
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
      const cx = x0 + W / 2 + (x - 2) * 1.35 * P, cy = y0 + 3.9 * P + y * 1.25 * P;
      el("rect", { x: cx - 2, y: cy - 4, width: 4, height: 8, rx: 1, fill: "#4a1d1f" }, g);
      const glow = el("circle", { cx, cy, r: 7, fill: "#ff3b30", opacity: 0, filter: "url(#f-blur)" }, g);
      const dot = el("rect", { x: cx - 2, y: cy - 4, width: 4, height: 8, rx: 1, fill: "#ff4d4f", opacity: 0 }, g);
      part.$led.push({ glow, dot });
    }
    silk(g, x0 + W / 2, y0 + H - 4.4 * P, "micro:bit", 8, "#f1f3f5", "middle", 700);
  },
  update(part, st) {
    const m = st.mbDisplay && st.mbDisplay[part.id];
    part.$led.forEach((l, i) => { const v = m ? m[i] / 9 : 0; l.dot.setAttribute("opacity", v.toFixed(2)); l.glow.setAttribute("opacity", (v * 0.8).toFixed(2)); });
    for (const k of ["A", "B"]) part["$btn" + k].setAttribute("r", part.key === k ? 0.6 * P : 0.75 * P);
  },
  links: (k) => [[k("GND.1"), k("GND.2")]],
  gnd: "GND.1",
  model: (part, n) => [{ type: "V", p: n("3V"), n: n("GND.1"), v: 3.3, r: 0.4, key: part.id + ":3v" }],
};

export const BOARDS = { uno, nano, mega, pico, esp32, microbit };
