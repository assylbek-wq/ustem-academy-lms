// Модули и датчики (как в наборах для Arduino), дисплеи, драйверы моторов, механика.
import { P, MM, el, lead, label, mono, pcb, header, dip, smdLed, smd, tact, shade, row } from "./core.js";
import { LcdI2C, lcdParallel, SSD1306, MPU6050, DS3231, WS2812, dhtResponder, sonar as sonarDev, shift595, tm1637 } from "../devices/index.js";

// ─── общие кусочки ───
// Плата модуля над рядом выводов (выводы в y=0, плата выше)
function modBoard(g, x, w, h, color, names, opts = {}) {
  const top = -0.55 * P - h;
  pcb(g, x, top, w, h, color, { holes: opts.holes || [] });
  header(g, 0, -0.1 * P, names.length);
  for (let i = 0; i < names.length; i++) lead(g, i * P, -0.1 * P, i * P, 0, 2);
  if (opts.labels !== false) names.forEach((n, i) => label(g, i * P, -0.85 * P, n, opts.lsize || 5.6, opts.lcolor || "#f1f3f5", "middle", 600));
  return top;
}
// питание модуля: нагрузка и запомнить напряжение
const pwr = (n, a = "VCC", b = "GND", r = 20000) => ({ type: "R", a: n(a), b: n(b), r });
const vout = (n, pin, gnd, v, r = 200) => ({ type: "V", p: n(pin), n: n(gnd), v, r });
const powered = (part, need = 2.7) => (part.$pwr ?? 0) > need;
const keepPwr = (a = "VCC", b = "GND") => (part, v) => { part.$pwr = v(a) - v(b); };

// Картинка экрана в SVG из canvas (обновляется, только когда изменилась)
function screen(g, x, y, w, h, cw, ch) {
  const img = el("image", { x, y, width: w, height: h, preserveAspectRatio: "none" }, g);
  const cv = typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (cv) { cv.width = cw; cv.height = ch; }
  return { img, cv, push() { if (cv) img.setAttribute("href", cv.toDataURL()); } };
}

// ───────────────── Сервопривод SG90 ─────────────────
const HORNS = {
  single: (g) => el("path", { d: "M -5 0 L -3.4 -30 a 3.4 3.4 0 0 1 6.8 0 L 5 0 a 5 5 0 0 1 -10 0 z", fill: "url(#g-white)", stroke: "#adb5bd", "stroke-width": 0.6 }, g),
  double: (g) => el("path", { d: "M -4.4 0 L -3.2 -28 a 3.2 3.2 0 0 1 6.4 0 L 4.4 0 L 3.2 28 a 3.2 3.2 0 0 1 -6.4 0 z", fill: "url(#g-white)", stroke: "#adb5bd", "stroke-width": 0.6 }, g),
  cross: (g) => el("path", { d: "M -3.4 -26 a 3.4 3.4 0 0 1 6.8 0 L 4 -4 L 22 -3 a 3 3 0 0 1 0 6 L 4 4 L 3 18 a 3 3 0 0 1 -6 0 L -4 4 L -22 3 a 3 3 0 0 1 0 -6 L -4 -4 z", fill: "url(#g-white)", stroke: "#adb5bd", "stroke-width": 0.6 }, g),
  arm: (g) => { el("rect", { x: -3, y: -58, width: 6, height: 62, rx: 3, fill: "#e03131", stroke: "#a51111" }, g); el("circle", { cx: 0, cy: -55, r: 4, fill: "#fff" }, g); },
};
const servo = {
  title: "Сервопривод SG90", group: "Движение", props: { horn: "single" }, kind3d: "servo",
  desc: "Поворачивается на угол 0-180° по ширине импульса 0,5-2,4 мс каждые 20 мс. Провода: коричневый - GND, красный - 5 В, оранжевый - сигнал.",
  selects: [{ prop: "horn", label: "Качалка", options: () => [["single", "Одинарная"], ["double", "Двойная"], ["cross", "Крестовая"], ["arm", "Стрелка 10 см"]], rerender: true }],
  pins: () => [{ name: "GND", x: 0, y: 0, title: "коричневый" }, { name: "5V", x: P, y: 0, title: "красный" }, { name: "SIG", x: 2 * P, y: 0, title: "оранжевый, сигнал" }],
  render(g, part) {
    el("rect", { x: -0.45 * P, y: -0.95 * P, width: 2.9 * P, height: 0.95 * P, rx: 1, fill: "url(#g-black)" }, g);
    for (const [x, c] of [[0, "#6b3e26"], [P, "#e03131"], [2 * P, "#f08c00"]]) el("path", { d: `M ${x} ${-0.9 * P} C ${x} ${-1.6 * P} ${P} ${-1.7 * P} ${P + (x - P) * 0.3} ${-2.4 * P}`, stroke: c, "stroke-width": 2.4, fill: "none" }, g);
    const bx = -2.3 * P, by = -6.6 * P, bw = 6.6 * P, bh = 4.2 * P;
    el("rect", { x: bx - 0.7 * P, y: by + 1.5 * P, width: bw + 1.4 * P, height: 1.2 * P, rx: 2, fill: "#2f6fd6", stroke: "#1b4fa3" }, g);
    for (const hx of [bx - 0.35 * P, bx + bw + 0.35 * P]) el("circle", { cx: hx, cy: by + 2.1 * P, r: 2.6, fill: "#123a7a" }, g);
    el("rect", { x: bx, y: by, width: bw, height: bh, rx: 3, fill: "url(#g-blue)", stroke: "#1b4fa3", filter: "url(#f-shadow)" }, g);
    el("rect", { x: bx + 3, y: by + 3, width: bw - 6, height: 5, rx: 2, fill: "#fff", opacity: 0.18 }, g);
    label(g, bx + bw * 0.65, by + bh - 6, "SG90 9g", 7, "#dbe4ff", "middle", 600);
    const cx = bx + 1.25 * P, cy = by + 1.3 * P;
    part.$c = [cx, cy];
    el("circle", { cx, cy, r: 13, fill: "#2a62c4", stroke: "#1b4fa3" }, g);
    el("circle", { cx: cx + 15, cy: cy + 4, r: 6, fill: "#2a62c4" }, g);
    part.$horn = el("g", {}, g);
    (HORNS[part.props.horn] || HORNS.single)(part.$horn);
    el("circle", { cx: 0, cy: 0, r: 4.5, fill: "url(#g-metal)", stroke: "#868e96" }, part.$horn);
    part.$angle = label(g, bx + bw * 0.65, by + 1.5 * P, "", 10, "#fff", "middle", 700, mono);
  },
  update(part, st) {
    const a = st.servo?.[part.id];
    if (a !== undefined) part.target = a;
    const tgt = part.target ?? 90;
    // скорость SG90: около 0,1 с на 60° (600°/с)
    const now = performance.now(), dt = Math.min(0.1, (now - (part.$t || now)) / 1000); part.$t = now;
    part.angle = part.angle ?? 90;
    const step = 600 * dt;
    part.angle += Math.max(-step, Math.min(step, tgt - part.angle));
    const [cx, cy] = part.$c;
    part.$horn.setAttribute("transform", `translate(${cx} ${cy}) rotate(${90 - part.angle})`);
    part.$angle.textContent = `${Math.round(part.angle)}°`;
  },
  model: (part, n) => [{ type: "R", a: n("5V"), b: n("GND"), r: 500 }],
};

// ───────────────── Моторы ─────────────────
const motor = {
  title: "Мотор постоянного тока", group: "Движение", kind3d: "motor",
  desc: "Мотор типа 130, 3-6 В, ток 100-250 мА: от вывода платы его не питают, только через транзистор или драйвер.",
  pins: () => [{ name: "+", x: 0, y: 0 }, { name: "-", x: 2 * P, y: 0 }],
  render(g, part) {
    lead(g, 0, 0, 0, -0.9 * P, 1.6); lead(g, 2 * P, 0, 2 * P, -0.9 * P, 1.6);
    el("rect", { x: -0.6 * P, y: -4.6 * P, width: 3.2 * P, height: 3.7 * P, rx: 6, fill: "url(#g-metalh)", stroke: "#868e96", filter: "url(#f-shadow)" }, g);
    el("rect", { x: -0.6 * P, y: -1.6 * P, width: 3.2 * P, height: 0.7 * P, rx: 2, fill: "#d9480f" }, g);
    el("circle", { cx: P, cy: -2.8 * P, r: 4, fill: "#495057" }, g);
    part.$rot = el("g", {}, g);
    el("rect", { x: P - 1.6, y: -2.8 * P - 22, width: 3.2, height: 44, rx: 1.6, fill: "#e03131" }, part.$rot);
    label(g, -2, -1.15 * P, "+", 9, "#fff", "middle", 700);
    part.$rpm = label(g, P, -5 * P, "", 9, "#343a40", "middle", 600);
    part.$ang = 0;
  },
  update(part, st) { spin(part, st.motor?.[part.id] || 0, 0.25, 1500); part.$rot.setAttribute("transform", `rotate(${part.$ang} ${P} ${-2.8 * P})`); part.$rpm.textContent = Math.abs(part.speed) > 0.02 ? `${Math.round(Math.abs(part.speed) * 100)}%` : ""; },
  info: () => "Ток до 250 мА.",
  model: (part, n) => [{ type: "R", a: n("+"), b: n("-"), r: 20, key: part.id }],
};
function spin(part, current, full, degPerSec) {
  const now = performance.now(), dt = Math.min(0.1, (now - (part.$t || now)) / 1000); part.$t = now;
  const target = Math.max(-1, Math.min(1, current / full));
  part.speed = (part.speed || 0) + (target - (part.speed || 0)) * Math.min(1, dt * 6); // инерция ротора
  part.$ang = ((part.$ang || 0) + part.speed * degPerSec * dt) % 360;
}

const ttmotor = {
  title: "Мотор-редуктор TT с колесом", group: "Механика", kind3d: "ttmotor",
  desc: "Желтый мотор с редуктором 1:48 и колесом 65 мм, как в наборах роботов. 3-6 В, около 200 об/мин при 6 В.",
  pins: () => [{ name: "+", x: 0, y: 0 }, { name: "-", x: P, y: 0 }],
  render(g, part) {
    lead(g, 0, 0, 0, -0.8 * P, 1.6); lead(g, P, 0, P, -0.8 * P, 1.6);
    el("rect", { x: -1.3 * P, y: -3.6 * P, width: 4.6 * P, height: 2.8 * P, rx: 3, fill: "#f2c94c", stroke: "#b8860b", filter: "url(#f-shadow)" }, g);
    el("rect", { x: 2.6 * P, y: -3.3 * P, width: 2.4 * P, height: 2.2 * P, rx: 6, fill: "url(#g-metalh)", stroke: "#868e96" }, g);
    const cx = -0.2 * P, cy = -2.2 * P; part.$c = [cx, cy];
    el("circle", { cx, cy, r: 2.4 * P, fill: "#1c1d20", stroke: "#000", filter: "url(#f-shadow)" }, g);
    el("circle", { cx, cy, r: 1.85 * P, fill: "#2b2d31" }, g);
    part.$rot = el("g", {}, g);
    for (let i = 0; i < 6; i++) el("rect", { x: -2, y: -1.8 * P, width: 4, height: 1.3 * P, rx: 1, fill: "#f2c94c", transform: `rotate(${i * 60})` }, part.$rot);
    el("circle", { cx: 0, cy: 0, r: 0.55 * P, fill: "#f2c94c", stroke: "#b8860b" }, part.$rot);
    part.$rpm = label(g, 1.5 * P, -4 * P, "", 9, "#343a40", "middle", 600);
  },
  update(part, st) {
    spin(part, st.motor?.[part.id] || 0, 0.2, 1200);
    const [cx, cy] = part.$c; part.$rot.setAttribute("transform", `translate(${cx} ${cy}) rotate(${part.$ang})`);
    part.$rpm.textContent = Math.abs(part.speed) > 0.02 ? `${Math.round(Math.abs(part.speed) * 200)} об/мин` : "";
  },
  model: (part, n) => [{ type: "R", a: n("+"), b: n("-"), r: 25, key: part.id }],
};

const fan = {
  title: "Вентилятор (мотор с пропеллером)", group: "Механика", kind3d: "fan",
  desc: "Мотор 130 с пропеллером. Скорость - ШИМ через транзистор или драйвер.",
  pins: () => [{ name: "+", x: 0, y: 0 }, { name: "-", x: P, y: 0 }],
  render(g, part) {
    lead(g, 0, 0, 0, -0.8 * P, 1.6); lead(g, P, 0, P, -0.8 * P, 1.6);
    el("rect", { x: -0.6 * P, y: -2.6 * P, width: 2.2 * P, height: 1.8 * P, rx: 4, fill: "url(#g-metalh)", stroke: "#868e96" }, g);
    const cx = 0.5 * P, cy = -4.4 * P; part.$c = [cx, cy];
    el("circle", { cx, cy, r: 2.6 * P, fill: "#e9ecef", opacity: 0.25, stroke: "#adb5bd", "stroke-dasharray": "3 3" }, g);
    part.$rot = el("g", {}, g);
    for (let i = 0; i < 3; i++) el("path", { d: "M 0 0 C 10 -8 18 -30 6 -36 C -6 -34 -6 -12 0 0", fill: "#4dabf7", stroke: "#1c7ed6", opacity: 0.9, transform: `rotate(${i * 120})` }, part.$rot);
    el("circle", { cx: 0, cy: 0, r: 5, fill: "#1c7ed6" }, part.$rot);
  },
  update(part, st) { spin(part, st.motor?.[part.id] || 0, 0.25, 2200); const [cx, cy] = part.$c; part.$rot.setAttribute("transform", `translate(${cx} ${cy}) rotate(${part.$ang})`); },
  model: (part, n) => [{ type: "R", a: n("+"), b: n("-"), r: 20, key: part.id }],
};

const vibro = {
  title: "Модуль вибромотора", group: "Движение", kind3d: "module", h3: 6,
  desc: "Вибромотор-таблетка с транзистором: IN = HIGH - вибрирует.",
  pins: () => row(["IN", "VCC", "GND"]),
  render(g, part) {
    modBoard(g, -0.7 * P, 3.4 * P, 2.6 * P, "#1c1d20", ["IN", "VCC", "GND"]);
    part.$m = el("circle", { cx: P, cy: -2.2 * P, r: 0.8 * P, fill: "url(#g-metal)", stroke: "#868e96" }, g);
  },
  update(part) { const on = part.$on; part.$m.setAttribute("transform", on ? `translate(${(Math.random() - 0.5) * 2} ${(Math.random() - 0.5) * 2})` : ""); },
  model: (part, n) => [pwr(n), { type: "R", a: n("IN"), b: n("GND"), r: 4700 }, ...(part.$on && powered(part) ? [{ type: "R", a: n("VCC"), b: n("GND"), r: 60, key: part.id }] : [])],
  after(part, v) { part.$pwr = v("VCC") - v("GND"); part.$on = v("IN") - v("GND") > 1.5; },
};

// Шаговый 28BYJ-48 и плата ULN2003
const stepper = {
  title: "Шаговый мотор 28BYJ-48 + ULN2003", group: "Механика", props: {}, kind3d: "stepper",
  desc: "4096 полушагов на оборот (2048 полных шагов). Входы IN1-IN4 включают обмотки, питание 5 В.",
  pins: () => row(["IN1", "IN2", "IN3", "IN4", "-", "+"]),
  render(g, part) {
    pcb(g, -0.8 * P, -4.3 * P, 7.4 * P, 3.8 * P, "#2f9e44", { holes: [[-0.3 * P, -3.8 * P], [6.1 * P, -3.8 * P]] });
    header(g, 0, -0.1 * P, 6);
    for (let i = 0; i < 6; i++) lead(g, i * P, -0.1 * P, i * P, 0, 2);
    ["IN1", "IN2", "IN3", "IN4", "-", "+"].forEach((n, i) => label(g, i * P, -0.85 * P, n, 5.6, "#fff", "middle", 600));
    dip(g, 0.2 * P, -3.4 * P, 16, "ULN2003", 1.2);
    part.$leds = [0, 1, 2, 3].map((i) => smdLed(g, 1 * P + i * 0.9 * P, -1.35 * P, "#e03131"));
    // мотор
    const cx = 3 * P, cy = -8.2 * P; part.$c = [cx, cy];
    el("rect", { x: cx - 3.1 * P, y: cy - 0.5 * P, width: 6.2 * P, height: 1 * P, rx: 3, fill: "url(#g-metal)", stroke: "#868e96" }, g);
    for (const hx of [cx - 2.6 * P, cx + 2.6 * P]) el("circle", { cx: hx, cy, r: 3, fill: "#495057" }, g);
    el("circle", { cx, cy, r: 2 * P, fill: "url(#g-metal)", stroke: "#868e96", filter: "url(#f-shadow)" }, g);
    el("rect", { x: cx - 1.2 * P, y: cy + 1.4 * P, width: 2.4 * P, height: 1.3 * P, rx: 2, fill: "#1971c2" }, g);
    for (let i = 0; i < 5; i++) el("path", { d: `M ${cx - 0.8 * P + i * 0.4 * P} ${cy + 2.7 * P} L ${0.9 * P + i * 0.3 * P} ${-4.3 * P}`, stroke: ["#1971c2", "#e64980", "#fab005", "#f76707", "#e03131"][i], "stroke-width": 1.6, fill: "none" }, g);
    part.$rot = el("g", {}, g);
    el("rect", { x: -2, y: -1.7 * P, width: 4, height: 1.7 * P, rx: 2, fill: "#e03131" }, part.$rot);
    el("circle", { cx: 0, cy: 0, r: 5, fill: "#f8f9fa", stroke: "#868e96" }, part.$rot);
    part.$deg = label(g, cx, cy + 3.6 * P, "", 8, "#343a40", "middle", 600, mono);
    part.pos = part.pos || 0;
  },
  // Положение считаем по фронтам IN1-IN4: каждый новый полушаг последовательности - 1/4096 оборота
  device(part, env) {
    const SEQ = [0b1000, 0b1100, 0b0100, 0b0110, 0b0010, 0b0011, 0b0001, 0b1001];
    let last = -1;
    const upd = () => {
      if (!env.powered("+", "-", 4)) return;
      const s = (env.level("IN1") ? 8 : 0) | (env.level("IN2") ? 4 : 0) | (env.level("IN3") ? 2 : 0) | (env.level("IN4") ? 1 : 0);
      part.coils = s;
      const k = SEQ.indexOf(s); if (k < 0) return;
      if (last >= 0) { let d = (k - last + 8) % 8; if (d > 4) d -= 8; part.pos += d; }
      last = k;
    };
    for (const p of ["IN1", "IN2", "IN3", "IN4"]) env.onLevel(p, upd);
    return {};
  },
  update(part) {
    const deg = ((part.pos || 0) / 4096) * 360;
    const [cx, cy] = part.$c; part.$rot.setAttribute("transform", `translate(${cx} ${cy}) rotate(${deg})`);
    part.$deg.textContent = `${Math.round(deg)}°`;
    part.$leds.forEach((l, i) => l.set(((part.coils || 0) >> (3 - i)) & 1));
  },
  model: (part, n) => [...["IN1", "IN2", "IN3", "IN4"].map((p) => ({ type: "R", a: n(p), b: n("-"), r: 3000 })), { type: "R", a: n("+"), b: n("-"), r: part.coils ? 40 : 5000 }],
  after(part, v) { part.$pwr = v("+") - v("-"); },
};

// Драйвер L298N
const l298n = {
  title: "Драйвер моторов L298N", group: "Движение", kind3d: "module", h3: 26,
  desc: "Два канала до 2 А. IN1/IN2 - направление мотора A, ENA - скорость (ШИМ, перемычку снять). Питание моторов 5-12 В на +12V.",
  pins: () => [...row(["OUT1", "OUT2"], 0, 0), ...row(["+12V", "GND", "+5V"], 0, 3 * P), ...row(["ENA", "IN1", "IN2", "IN3", "IN4", "ENB"], 0, 7 * P), ...row(["OUT3", "OUT4"], 0, 14 * P)],
  render(g, part) {
    pcb(g, -0.8 * P, -9.4 * P, 16.6 * P, 8.8 * P, "#c92a2a", { holes: [[-0.2 * P, -8.8 * P], [15.2 * P, -8.8 * P], [-0.2 * P, -1.2 * P], [15.2 * P, -1.2 * P]] });
    // радиатор
    el("rect", { x: 4.5 * P, y: -9.2 * P, width: 6.2 * P, height: 4.2 * P, rx: 1, fill: "#111" }, g);
    for (let i = 0; i < 9; i++) el("rect", { x: 4.6 * P + i * 0.68 * P, y: -9.6 * P, width: 0.45 * P, height: 4.6 * P, fill: "url(#g-black)" }, g);
    label(g, 7.6 * P, -4.4 * P, "L298N", 8, "#fff", "middle", 700, mono);
    // клеммники
    const term = (x, n) => { el("rect", { x: x - P / 2, y: -1.9 * P, width: n * P, height: 1.5 * P, rx: 1, fill: "#1971c2" }, g); for (let i = 0; i < n; i++) el("circle", { cx: x + i * P, cy: -1.15 * P, r: 4.2, fill: "url(#g-metal)", stroke: "#495057" }, g); };
    term(0, 2); term(3 * P, 3); term(14 * P, 2);
    header(g, 7 * P, -0.95 * P, 6);
    for (let i = 0; i < 2; i++) lead(g, i * P, -0.4 * P, i * P, 0, 2.4);
    for (let i = 0; i < 3; i++) lead(g, 3 * P + i * P, -0.4 * P, 3 * P + i * P, 0, 2.4);
    for (let i = 0; i < 6; i++) lead(g, 7 * P + i * P, -0.95 * P, 7 * P + i * P, 0, 2);
    for (let i = 0; i < 2; i++) lead(g, 14 * P + i * P, -0.4 * P, 14 * P + i * P, 0, 2.4);
    ["ENA", "IN1", "IN2", "IN3", "IN4", "ENB"].forEach((n, i) => label(g, 7 * P + i * P, -2 * P, n, 5.6, "#fff", "middle", 600));
    [["OUT1", 0], ["OUT2", P], ["+12V", 3 * P], ["GND", 4 * P], ["+5V", 5 * P], ["OUT3", 14 * P], ["OUT4", 15 * P]].forEach(([n, x]) => label(g, x, -2.3 * P, n, 5.6, "#fff", "middle", 600));
    el("rect", { x: 1.6 * P, y: -7.5 * P, width: 1.6 * P, height: 2.4 * P, rx: 6, fill: "#1c1d20" }, g);
    part.$led = smdLed(g, 12.5 * P, -6 * P, "#e03131");
  },
  update(part) { part.$led.set(powered(part, 4)); },
  model(part, n) {
    const els = [{ type: "R", a: n("+12V"), b: n("GND"), r: 2000 }, ...["ENA", "IN1", "IN2", "IN3", "IN4", "ENB"].map((p) => ({ type: "R", a: n(p), b: n("GND"), r: 10000 }))];
    const vs = part.$pwr ?? 0;
    if (vs > 6.5) els.push(vout(n, "+5V", "GND", 5, 0.5));
    const ch = (en, a, b, o1, o2) => {
      const d = part.$in || {};
      const duty = d[en] ?? 0;
      if (duty < 0.01 || vs < 3) return;
      const v = Math.max(0, vs - 1.4) * duty;
      if (d[a] && !d[b]) { els.push(vout(n, o1, "GND", v, 2)); els.push(vout(n, o2, "GND", 0, 2)); }
      else if (!d[a] && d[b]) { els.push(vout(n, o1, "GND", 0, 2)); els.push(vout(n, o2, "GND", v, 2)); }
      else { els.push(vout(n, o1, "GND", d[a] ? v : 0, 2)); els.push(vout(n, o2, "GND", d[b] ? v : 0, 2)); } // торможение
    };
    ch("ENA", "IN1", "IN2", "OUT1", "OUT2"); ch("ENB", "IN3", "IN4", "OUT3", "OUT4");
    return els;
  },
  after(part, v, env) {
    part.$pwr = v("+12V") - v("GND");
    const lv = (p) => v(p) - v("GND") > 2.3;
    part.$in = { IN1: lv("IN1"), IN2: lv("IN2"), IN3: lv("IN3"), IN4: lv("IN4"), ENA: env ? env.duty("ENA", "GND") : lv("ENA") ? 1 : 0, ENB: env ? env.duty("ENB", "GND") : lv("ENB") ? 1 : 0 };
  },
};

const relay = {
  title: "Модуль реле 5 В", group: "Движение", props: {}, kind3d: "relay",
  desc: "Реле SRD-05VDC: S = HIGH включает реле, контакт COM переключается с NC на NO. Через контакты можно включать лампу или насос.",
  pins: () => [...row(["S", "+", "-"]), { name: "NO", x: 0, y: -6.6 * P, title: "нормально разомкнутый" }, { name: "COM", x: P, y: -6.6 * P, title: "общий" }, { name: "NC", x: 2 * P, y: -6.6 * P, title: "нормально замкнутый" }],
  render(g, part) {
    pcb(g, -1.1 * P, -6.1 * P, 4.2 * P, 5.6 * P, "#1d4ed8", { holes: [[-0.6 * P, -5.6 * P], [2.6 * P, -1.1 * P]] });
    header(g, 0, -0.1 * P, 3); for (let i = 0; i < 3; i++) lead(g, i * P, -0.1 * P, i * P, 0, 2);
    ["S", "+", "-"].forEach((n, i) => label(g, i * P, -0.85 * P, n, 6, "#fff", "middle", 700));
    el("rect", { x: -0.9 * P, y: -5.3 * P, width: 3.8 * P, height: 3 * P, rx: 2, fill: "#1971c2", stroke: "#0b3d91", filter: "url(#f-shadow)" }, g);
    label(g, P, -4.2 * P, "SRD-05VDC", 6, "#e7f5ff", "middle", 600, mono);
    label(g, P, -3.4 * P, "10A 250VAC", 5.5, "#e7f5ff", "middle", 400, mono);
    el("rect", { x: -0.5 * P, y: -6.9 * P, width: 3 * P, height: 1.0 * P, rx: 1, fill: "#2f9e44" }, g);
    for (let i = 0; i < 3; i++) el("circle", { cx: i * P, cy: -6.4 * P, r: 4, fill: "url(#g-metal)", stroke: "#495057" }, g);
    ["NO", "COM", "NC"].forEach((n, i) => label(g, i * P, -7.2 * P, n, 5.5, "#343a40", "middle", 600));
    part.$led = smdLed(g, 2.5 * P, -1.9 * P, "#e03131");
    part.$state = label(g, 4 * P, -3.5 * P, "", 8, "#343a40", "start", 600);
  },
  update(part) { part.$led.set(!!part.$on); part.$state.textContent = part.$on ? "вкл" : ""; },
  model: (part, n) => [{ type: "R", a: n("+"), b: n("-"), r: part.$on ? 70 : 20000 }, { type: "R", a: n("S"), b: n("-"), r: 5000 },
    { type: "R", a: n("COM"), b: n(part.$on ? "NO" : "NC"), r: 0.05 }],
  after(part, v) { part.$pwr = v("+") - v("-"); const on = part.$pwr > 3.5 && v("S") - v("-") > 2; if (on !== part.$on) { part.$on = on; part.$changed = true; } },
};

// ───────────────── Датчики ─────────────────
const sonar = {
  title: "Ультразвуковой дальномер HC-SR04", group: "Датчики", props: { dist: 50 }, kind3d: "sonar",
  desc: "TRIG: импульс 10 мкс запускает замер. ECHO: ответный импульс, 58 мкс на каждый сантиметр. Дальность 2-400 см.",
  sliders: [{ prop: "dist", label: "Расстояние до препятствия, см", min: 2, max: 400, step: 1 }],
  pins: () => row(["VCC", "TRIG", "ECHO", "GND"]),
  render(g, part) {
    pcb(g, -1.7 * P, -4.55 * P, 7.4 * P, 4 * P, "#1c5bb0", { holes: [[-1.2 * P, -4.05 * P], [5.2 * P, -4.05 * P], [-1.2 * P, -1.05 * P], [5.2 * P, -1.05 * P]] });
    header(g, 0, -0.1 * P, 4); for (let i = 0; i < 4; i++) lead(g, i * P, -0.1 * P, i * P, 0, 2);
    ["Vcc", "Trig", "Echo", "Gnd"].forEach((t, i) => label(g, i * P, -0.85 * P, t, 5.4, "#e7f5ff", "middle", 600));
    for (const cx of [-0.35 * P, 3.35 * P]) {
      el("circle", { cx, cy: -2.75 * P, r: 1.15 * P + 2, fill: "url(#g-metal)", stroke: "#868e96", filter: "url(#f-shadow)" }, g);
      el("circle", { cx, cy: -2.75 * P, r: 0.9 * P, fill: "url(#p-mesh)" }, g);
    }
    el("rect", { x: 0.85 * P, y: -3.9 * P, width: 1.3 * P, height: 0.6 * P, rx: 1, fill: "url(#g-metal)" }, g);
    label(g, 1.5 * P, -1.5 * P, "HC-SR04", 6, "#e7f5ff", "middle", 700, mono);
    part.$d = label(g, 1.5 * P, -4.95 * P, "", 9, "#1c5bb0", "middle", 700);
  },
  update(part) { part.$d.textContent = `${part.props.dist} см`; },
  device: (part, env) => sonarDev(env, part),
  model: (part, n) => [pwr(n, "VCC", "GND", 2000)],
  after: keepPwr(),
};

const tmp36 = {
  title: "Датчик температуры TMP36", group: "Датчики", props: { temp: 25 }, kind3d: "to92",
  desc: "Выход 0,5 В при 0 °C и плюс 10 мВ на каждый градус: 25 °C - 0,75 В.",
  sliders: [{ prop: "temp", label: "Температура, °C", min: -40, max: 125, step: 1 }],
  pins: () => [{ name: "+Vs", x: 0, y: 0, title: "питание 2,7-5,5 В" }, { name: "Vout", x: P, y: 0, title: "выход: 10 мВ на градус" }, { name: "GND", x: 2 * P, y: 0 }],
  render(g, part) {
    for (let i = 0; i < 3; i++) lead(g, i * P, 0, i * P, -0.8 * P);
    el("path", { d: `M ${-5} ${-0.8 * P} h ${2 * P + 10} v ${-1.2 * P} a ${P + 5} ${P} 0 0 0 ${-2 * P - 10} 0 z`, fill: "url(#g-black)", filter: "url(#f-shadow)" }, g);
    label(g, P, -1.35 * P, "TMP36", 6.5, "#d0d4d9", "middle", 500, mono);
    part.$t = label(g, P, -3.1 * P, "", 9, "#c92a2a", "middle", 700);
  },
  update(part) { part.$t.textContent = `${part.props.temp} °C`; },
  model(part, n) {
    const els = [{ type: "R", a: n("+Vs"), b: n("GND"), r: 50000 }];
    if ((part.$pwr ?? 5) > 2.7) els.push({ type: "V", p: n("Vout"), n: n("GND"), v: 0.5 + 0.01 * part.props.temp, r: 50 });
    return els;
  },
  after: keepPwr("+Vs", "GND"),
};

function dht(kind) {
  const d22 = kind === 22;
  return {
    title: d22 ? "Датчик DHT22 (AM2302)" : "Датчик DHT11", group: "Датчики", props: { temp: 24, hum: 45 }, kind3d: "dht",
    desc: d22 ? "Температура -40...80 °C (0,1 °C), влажность 0-100%. Один провод данных, замер не чаще раза в 2 с." : "Температура 0-50 °C, влажность 20-90%, точность 1. Один провод данных, замер не чаще раза в секунду.",
    sliders: [{ prop: "temp", label: "Температура, °C", min: d22 ? -40 : 0, max: d22 ? 80 : 50, step: d22 ? 0.1 : 1 }, { prop: "hum", label: "Влажность, %", min: d22 ? 0 : 20, max: d22 ? 100 : 90, step: d22 ? 0.1 : 1 }],
    pins: () => row(["VCC", "DATA", "GND"]),
    render(g, part) {
      const c = d22 ? "#f1f3f5" : "#1c7ed6";
      pcb(g, -0.9 * P, -1.6 * P, 3.8 * P, 1.1 * P, d22 ? "#212529" : "#2b8a3e", { shadow: false });
      header(g, 0, -0.1 * P, 3); for (let i = 0; i < 3; i++) lead(g, i * P, -0.1 * P, i * P, 0, 2);
      el("rect", { x: -0.75 * P, y: -5.2 * P, width: 3.5 * P, height: 3.8 * P, rx: 2, fill: c, stroke: shade(c, -0.3), filter: "url(#f-shadow)" }, g);
      for (let y = 0; y < 5; y++) for (let x = 0; x < 4; x++) el("rect", { x: -0.45 * P + x * 0.8 * P, y: -4.9 * P + y * 0.62 * P, width: 0.5 * P, height: 0.36 * P, rx: 1, fill: shade(c, -0.45) }, g);
      label(g, P, -1.65 * P, d22 ? "DHT22" : "DHT11", 6, d22 ? "#495057" : "#fff", "middle", 700, mono);
      ["+", "out", "-"].forEach((t, i) => label(g, i * P, -0.65 * P, t, 5.5, "#f1f3f5", "middle", 600));
      part.$t = label(g, P, -5.6 * P, "", 8, "#343a40", "middle", 600);
    },
    update(part) { part.$t.textContent = `${part.props.temp} °C  ${part.props.hum}%`; },
    device(part, env) {
      const r = dhtResponder(env, part, kind);
      const pin = env.pin("DATA");
      if (env.mcu.kind === "py" && pin) env.mcu.devices.dht[pin] = { temperature: () => (d22 ? +part.props.temp.toFixed(1) : Math.round(part.props.temp)), humidity: () => (d22 ? +part.props.hum.toFixed(1) : Math.round(part.props.hum)), powered: () => env.powered() };
      return r;
    },
    model: (part, n) => [pwr(n, "VCC", "GND", 5000), { type: "R", a: n("DATA"), b: n("VCC"), r: 10000 }],
    after: keepPwr(),
  };
}

// Модуль с цифровым выходом (и, если есть, аналоговым): ИК-препятствие, линия, звук, газ, пламя, почва, датчик Холла
function sensorMod({ title, desc, names, color = "#1c1d20", dig, ana, props, sliders, interactive, render, info, kind3d = "module", h3 = 8, w = 4.4 }) {
  return {
    title, group: "Датчики", props, sliders, interactive, desc, kind3d, h3,
    pins: () => row(names),
    render(g, part) {
      modBoard(g, -0.9 * P, w * P, 3.6 * P, color, names);
      part.$pled = smdLed(g, -0.35 * P, -1.5 * P, "#e03131");
      part.$dled = dig ? smdLed(g, (names.length - 0.5) * P, -1.5 * P, "#37b24d") : null;
      if (render) render(g, part);
    },
    update(part) { part.$pled.set(powered(part)); if (part.$dled) part.$dled.set(powered(part) && !!part.$dlvl === (dig.ledWhen ?? false)); if (this.upd) this.upd(part); },
    info,
    model(part, n) {
      const vcc = part.$pwr ?? 0;
      const els = [pwr(n, "VCC", "GND", 8000)];
      if (vcc > 2.7) {
        if (ana) els.push(vout(n, ana.pin, "GND", Math.max(0, Math.min(1, ana.value(part))) * vcc, 1000));
        if (dig) { part.$dlvl = dig.value(part); els.push(vout(n, dig.pin, "GND", part.$dlvl ? vcc : 0, 150)); }
      }
      return els;
    },
    after: keepPwr(),
  };
}
const pot3 = (g, x, y) => { el("rect", { x: x - 6, y: y - 6, width: 12, height: 12, rx: 1, fill: "#1971c2" }, g); el("circle", { cx: x, cy: y, r: 3.5, fill: "url(#g-white)" }, g); el("line", { x1: x - 2.5, y1: y, x2: x + 2.5, y2: y, stroke: "#495057", "stroke-width": 1 }, g); };

const irObstacle = sensorMod({
  title: "ИК-датчик препятствия FC-51", desc: "Выход OUT = LOW, когда перед датчиком есть препятствие (2-30 см, регулируется). Горит зеленый светодиод.",
  names: ["OUT", "GND", "VCC"], props: { near: false }, interactive: "toggle", kind3d: "irsensor",
  dig: { pin: "OUT", value: (part) => !part.props.near, ledWhen: false },
  render(g, part) {
    for (const [cx, c] of [[0.2 * P, "#212529"], [1.8 * P, "#e9ecef"]]) { el("rect", { x: cx - 4, y: -5.6 * P, width: 8, height: 1.4 * P, rx: 2, fill: "url(#g-metal)" }, g); el("circle", { cx, cy: -5.7 * P, r: 4.5, fill: c, stroke: "#495057", class: "lab-press" }, g); }
    pot3(g, P, -3 * P);
    part.$o = label(g, P, -6.6 * P, "", 8, "#343a40", "middle", 600);
  },
  info: (part) => (part.props.near ? "есть препятствие" : "свободно"),
});
irObstacle.upd = (part) => { part.$o.textContent = part.props.near ? "препятствие" : ""; };
irObstacle.update = ((orig) => function (part) { orig.call(this, part); part.$o.textContent = part.props.near ? "препятствие" : ""; })(irObstacle.update);

const lineSensor = sensorMod({
  title: "Датчик линии TCRT5000", desc: "Над черной линией отражения нет: DO = HIGH. Над белым полем DO = LOW. AO - аналоговый уровень отражения.",
  names: ["VCC", "GND", "DO", "AO"], props: { black: false }, interactive: "toggle", kind3d: "irsensor",
  dig: { pin: "DO", value: (part) => !!part.props.black, ledWhen: false },
  ana: { pin: "AO", value: (part) => (part.props.black ? 0.92 : 0.12) },
  render(g, part) {
    el("rect", { x: 0.3 * P, y: -5.8 * P, width: 2.4 * P, height: 1.2 * P, rx: 2, fill: "#212529", class: "lab-press" }, g);
    el("circle", { cx: 0.9 * P, cy: -5.2 * P, r: 4, fill: "#3b5bdb" }, g); el("circle", { cx: 2.1 * P, cy: -5.2 * P, r: 4, fill: "#212529", stroke: "#868e96" }, g);
    pot3(g, 1.5 * P, -3 * P);
    part.$surf = el("rect", { x: -0.6 * P, y: -7.4 * P, width: 4.2 * P, height: 1.2 * P, rx: 2, fill: "#f8f9fa", stroke: "#ced4da", class: "lab-press" }, g);
  },
});
lineSensor.update = ((orig) => function (part) { orig.call(this, part); part.$surf.setAttribute("fill", part.props.black ? "#111" : "#f8f9fa"); })(lineSensor.update);

const soundSensor = sensorMod({
  title: "Датчик звука KY-038", desc: "AO - громкость (аналог), DO = HIGH, когда звук громче порога.",
  names: ["AO", "GND", "VCC", "DO"], props: { level: 0.2 }, sliders: [{ prop: "level", label: "Громкость", min: 0, max: 1, step: 0.01 }], kind3d: "mic",
  dig: { pin: "DO", value: (part) => part.props.level > 0.6, ledWhen: true },
  ana: { pin: "AO", value: (part) => 0.1 + 0.8 * part.props.level },
  render(g) { el("circle", { cx: 1.5 * P, cy: -5.2 * P, r: 0.9 * P, fill: "url(#g-black)", stroke: "#868e96", "stroke-width": 1.5 }, g); el("circle", { cx: 1.5 * P, cy: -5.2 * P, r: 0.6 * P, fill: "url(#p-mesh)" }, g); pot3(g, 0.5 * P, -3 * P); },
});
const gasSensor = sensorMod({
  title: "Датчик газа MQ-2", desc: "Чувствует дым и горючие газы. AO растет с концентрацией, DO = LOW, когда превышен порог. Прогрев около минуты.",
  names: ["VCC", "GND", "DO", "AO"], props: { gas: 0.1 }, sliders: [{ prop: "gas", label: "Концентрация газа", min: 0, max: 1, step: 0.01 }], kind3d: "mq2",
  dig: { pin: "DO", value: (part) => part.props.gas < 0.5, ledWhen: false },
  ana: { pin: "AO", value: (part) => 0.08 + 0.85 * part.props.gas },
  render(g) { el("circle", { cx: 1.5 * P, cy: -5.5 * P, r: 1.3 * P, fill: "url(#g-metal)", stroke: "#868e96" }, g); el("circle", { cx: 1.5 * P, cy: -5.5 * P, r: 1.0 * P, fill: "url(#p-mesh)" }, g); pot3(g, 0.3 * P, -2.7 * P); },
});
const flameSensor = sensorMod({
  title: "Датчик пламени", desc: "ИК-фотодиод: DO = LOW, когда видит пламя. AO падает с яркостью огня.",
  names: ["AO", "GND", "VCC", "DO"], props: { flame: 0 }, sliders: [{ prop: "flame", label: "Пламя", min: 0, max: 1, step: 0.01 }],
  dig: { pin: "DO", value: (part) => part.props.flame < 0.4, ledWhen: false },
  ana: { pin: "AO", value: (part) => 0.95 - 0.85 * part.props.flame },
  render(g, part) { el("rect", { x: 1.2 * P, y: -6 * P, width: 0.6 * P, height: 1.6 * P, fill: "url(#g-leadv)" }, g); el("ellipse", { cx: 1.5 * P, cy: -6.2 * P, rx: 0.4 * P, ry: 0.5 * P, fill: "#1c1d20" }, g); pot3(g, 0.4 * P, -3 * P); part.$fire = el("path", { d: `M ${1.5 * P} ${-8.5 * P} c -10 8 -8 14 0 16 c 8 -2 10 -8 0 -16`, fill: "#ff922b", opacity: 0 }, g); },
});
flameSensor.update = ((orig) => function (part) { orig.call(this, part); part.$fire.setAttribute("opacity", part.props.flame.toFixed(2)); })(flameSensor.update);
const soilSensor = sensorMod({
  title: "Датчик влажности почвы", desc: "AO высокий в сухой почве и падает во влажной. DO = LOW, когда влажность выше порога.",
  names: ["VCC", "GND", "DO", "AO"], props: { moist: 0.3 }, sliders: [{ prop: "moist", label: "Влажность почвы", min: 0, max: 1, step: 0.01 }],
  dig: { pin: "DO", value: (part) => part.props.moist < 0.5, ledWhen: false },
  ana: { pin: "AO", value: (part) => 0.95 - 0.7 * part.props.moist },
  render(g) { pot3(g, 1.5 * P, -2.8 * P); },
});
const waterSensor = {
  title: "Датчик уровня воды", group: "Датчики", props: { level: 0.3 }, kind3d: "module", h3: 2,
  desc: "Чем глубже погружен датчик, тем выше напряжение на S.",
  sliders: [{ prop: "level", label: "Уровень воды", min: 0, max: 1, step: 0.01 }],
  pins: () => row(["S", "+", "-"]),
  render(g, part) {
    modBoard(g, -1.1 * P, 4.2 * P, 7.5 * P, "#c92a2a", ["S", "+", "-"]);
    for (let i = 0; i < 10; i++) el("rect", { x: -0.8 * P, y: -7.6 * P + i * 0.48 * P, width: 3.6 * P, height: 0.2 * P, fill: "url(#g-gold)" }, g);
    part.$w = el("rect", { x: -1.1 * P, y: -0.55 * P, width: 4.2 * P, height: 0, fill: "#4dabf7", opacity: 0.45 }, g);
  },
  update(part) { const h = part.props.level * 6 * P; part.$w.setAttribute("y", -0.55 * P - 1.5 * P - h); part.$w.setAttribute("height", h); },
  model: (part, n) => [pwr(n, "+", "-", 8000), ...((part.$pwr ?? 0) > 2.7 ? [vout(n, "S", "-", part.props.level * 0.8 * part.$pwr, 1000)] : [])],
  after: keepPwr("+", "-"),
};
const hall = sensorMod({
  title: "Датчик Холла KY-003", desc: "S = LOW, когда рядом магнит.", names: ["S", "+", "-"].map((x) => x),
  props: { magnet: false }, interactive: "toggle",
  dig: { pin: "S", value: (part) => !part.props.magnet, ledWhen: false },
  render(g, part) { el("rect", { x: 0.6 * P, y: -5.4 * P, width: 0.8 * P, height: 0.6 * P, fill: "url(#g-black)" }, g); part.$mag = el("rect", { x: 2.4 * P, y: -6.2 * P, width: 1.4 * P, height: 0.9 * P, rx: 2, fill: "#e03131", opacity: 0.2, class: "lab-press" }, g); },
});
hall.pins = () => row(["S", "+", "-"]);
hall.model = function (part, n) { const els = [pwr(n, "+", "-", 8000)]; if ((part.$pwr ?? 0) > 2.7) els.push(vout(n, "S", "-", part.props.magnet ? 0 : part.$pwr, 150)); return els; };
hall.after = keepPwr("+", "-");
hall.update = function (part) { part.$pled.set(powered(part)); part.$mag.setAttribute("opacity", part.props.magnet ? 1 : 0.2); };

const pir = {
  title: "Датчик движения HC-SR501", group: "Датчики", props: { hold: 3 }, kind3d: "pir", interactive: "press",
  desc: "Пироэлектрический датчик: OUT = HIGH на несколько секунд после движения человека. Нажмите на линзу, чтобы «пройти» мимо.",
  sliders: [{ prop: "hold", label: "Время удержания, с", min: 1, max: 10, step: 1 }],
  pins: () => row(["VCC", "OUT", "GND"]),
  render(g, part) {
    pcb(g, -1.5 * P, -4.9 * P, 5 * P, 4.3 * P, "#2f9e44", { holes: [[-1 * P, -4.4 * P], [3 * P, -4.4 * P]] });
    header(g, 0, -0.1 * P, 3); for (let i = 0; i < 3; i++) lead(g, i * P, -0.1 * P, i * P, 0, 2);
    el("circle", { cx: P, cy: -2.9 * P, r: 1.85 * P, fill: "#f8f9fa", stroke: "#ced4da", filter: "url(#f-shadow)", class: "lab-press" }, g);
    for (let i = 1; i < 4; i++) el("circle", { cx: P, cy: -2.9 * P, r: i * 0.45 * P, fill: "none", stroke: "#dee2e6", class: "lab-press" }, g);
    part.$o = label(g, P, -5.3 * P, "", 8, "#2f9e44", "middle", 700);
  },
  update(part) {
    const now = performance.now() / 1000;
    if (part.pressed) part.$until = now + part.props.hold;
    part.$active = (part.$until || 0) > now;
    part.$o.textContent = part.$active ? "движение" : "";
  },
  model: (part, n) => [pwr(n, "VCC", "GND", 8000), ...((part.$pwr ?? 0) > 4 ? [vout(n, "OUT", "GND", part.$active ? 3.3 : 0, 150)] : [])],
  after: keepPwr(),
};

const touch = {
  title: "Сенсорная кнопка TTP223", group: "Ввод", props: {}, kind3d: "module", h3: 2, interactive: "press",
  desc: "Емкостная кнопка: пока вы касаетесь площадки, SIG = HIGH.",
  pins: () => row(["GND", "VCC", "SIG"]),
  render(g, part) {
    modBoard(g, -0.6 * P, 3.2 * P, 3.2 * P, "#c92a2a", ["GND", "VCC", "SIG"]);
    part.$pad = el("circle", { cx: P, cy: -2.4 * P, r: 1.1 * P, fill: "url(#g-gold)", stroke: "#a87b1b", class: "lab-press" }, g);
  },
  update(part) { part.$pad.setAttribute("opacity", part.pressed ? 0.7 : 1); },
  model: (part, n) => [pwr(n, "VCC", "GND", 8000), ...((part.$pwr ?? 0) > 2 ? [vout(n, "SIG", "GND", part.pressed ? part.$pwr : 0, 150)] : [])],
  after: keepPwr(),
};

const joystick = {
  title: "Джойстик KY-023", group: "Ввод", props: { x: 0, y: 0 }, kind3d: "joystick", interactive: "press",
  desc: "Два потенциометра (VRx, VRy) и кнопка SW (замыкает на GND). В центре на осях половина питания.",
  sliders: [{ prop: "x", label: "Ось X", min: -1, max: 1, step: 0.01 }, { prop: "y", label: "Ось Y", min: -1, max: 1, step: 0.01 }],
  pins: () => row(["GND", "+5V", "VRx", "VRy", "SW"]),
  render(g, part) {
    modBoard(g, -1.2 * P, 6.4 * P, 6.4 * P, "#1c1d20", ["GND", "+5V", "VRx", "VRy", "SW"], { lsize: 5 });
    el("rect", { x: 0.2 * P, y: -6.3 * P, width: 3.6 * P, height: 3.6 * P, rx: 3, fill: "url(#g-black)" }, g);
    part.$stick = el("g", {}, g);
    el("circle", { cx: 0, cy: 0, r: 1.3 * P, fill: "#212529", stroke: "#000", filter: "url(#f-shadow)", class: "lab-press" }, part.$stick);
    el("circle", { cx: 0, cy: 0, r: 1.0 * P, fill: "url(#p-knurl)", opacity: 0.25, class: "lab-press" }, part.$stick);
  },
  update(part) { part.$stick.setAttribute("transform", `translate(${2 * P + part.props.x * 0.9 * P} ${-4.5 * P - part.props.y * 0.9 * P})`); },
  model(part, n) {
    const els = [{ type: "R", a: n("+5V"), b: n("GND"), r: 10000 }];
    const v = part.$pwr ?? 0;
    if (v > 1) { els.push(vout(n, "VRx", "GND", v * (0.5 + 0.5 * part.props.x), 2500)); els.push(vout(n, "VRy", "GND", v * (0.5 + 0.5 * part.props.y), 2500)); }
    if (part.pressed) els.push({ type: "R", a: n("SW"), b: n("GND"), r: 0.05 });
    return els;
  },
  after: keepPwr("+5V", "GND"),
};

const encoder = {
  title: "Энкодер KY-040", group: "Ввод", props: {}, kind3d: "encoder",
  desc: "Поворот дает два сдвинутых сигнала CLK и DT (на модуле есть подтяжки к +). Нажатие ручки замыкает SW на GND. Кнопками «влево» и «вправо» в свойствах или щелчком по ручке.",
  actions: [{ label: "↺ влево", run: (part) => (part.$queue ||= []).push(-1) }, { label: "↻ вправо", run: (part) => (part.$queue ||= []).push(1) }],
  interactive: "press",
  pins: () => row(["GND", "+", "SW", "DT", "CLK"]),
  render(g, part) {
    modBoard(g, -1 * P, 6 * P, 4.6 * P, "#1c1d20", ["GND", "+", "SW", "DT", "CLK"]);
    el("rect", { x: 0.7 * P, y: -4.8 * P, width: 2.6 * P, height: 2.6 * P, rx: 1, fill: "url(#g-metal)" }, g);
    part.$knob = el("g", {}, g);
    el("circle", { cx: 0, cy: 0, r: 1.15 * P, fill: "url(#g-black)", stroke: "#000", class: "lab-press" }, part.$knob);
    el("rect", { x: -1.5, y: -1.1 * P, width: 3, height: 0.7 * P, fill: "#fff", class: "lab-press" }, part.$knob);
    part.$pos = label(g, 2 * P, -6 * P, "", 8, "#343a40", "middle", 600, mono);
    part.$st = 0; part.$count = 0;
  },
  update(part) {
    if (part.pressed && !part.$was) (part.$queue ||= []).push(1);
    part.$was = part.pressed && !part.$pressHold;
    // одна четверть цикла кода Грея за кадр
    if (!part.$phase && part.$queue && part.$queue.length) { part.$dir = part.$queue.shift(); part.$phase = 4; }
    if (part.$phase) { part.$st = (part.$st + part.$dir + 4) % 4; part.$phase--; if (!part.$phase) part.$count += part.$dir; }
    part.$knob.setAttribute("transform", `translate(${2 * P} ${-3.5 * P}) rotate(${part.$count * 18 + (part.$phase ? part.$dir * (4 - part.$phase) * 4.5 : 0)})`);
    part.$pos.textContent = `шаг ${part.$count}`;
  },
  // состояния контактов (true - замкнут на GND): покой 0 - оба разомкнуты
  model(part, n) {
    const st = [[false, false], [true, false], [true, true], [false, true]][part.$st || 0];
    const els = [{ type: "R", a: n("+"), b: n("GND"), r: 20000 }];
    const v = part.$pwr ?? 0;
    if (v > 2) { els.push({ type: "R", a: n("CLK"), b: n("+"), r: 10000 }); els.push({ type: "R", a: n("DT"), b: n("+"), r: 10000 }); }
    if (st[0]) els.push({ type: "R", a: n("CLK"), b: n("GND"), r: 1 });
    if (st[1]) els.push({ type: "R", a: n("DT"), b: n("GND"), r: 1 });
    if (part.$swDown) els.push({ type: "R", a: n("SW"), b: n("GND"), r: 0.05 });
    return els;
  },
  after: keepPwr("+", "GND"),
};

const KEYS = ["1", "2", "3", "A", "4", "5", "6", "B", "7", "8", "9", "C", "*", "0", "#", "D"];
const keypad = {
  title: "Клавиатура 4 x 4", group: "Ввод", props: {}, kind3d: "keypad",
  desc: "Матрица кнопок: нажатая клавиша соединяет свою строку (R1-R4) со столбцом (C1-C4). Библиотека Keypad сама опрашивает матрицу.",
  pins: () => row(["R1", "R2", "R3", "R4", "C1", "C2", "C3", "C4"]),
  render(g, part) {
    el("rect", { x: 0.2 * P, y: -1.4 * P, width: 6.6 * P, height: 1.2 * P, rx: 2, fill: "#212529" }, g);
    for (let i = 0; i < 8; i++) el("path", { d: `M ${i * P} 0 V ${-0.8 * P} L ${2.5 * P + i * 0.3 * P} ${-1.6 * P}`, stroke: "url(#g-leadv)", "stroke-width": 2, fill: "none" }, g);
    el("rect", { x: -1.5 * P, y: -12.8 * P, width: 10 * P, height: 11.4 * P, rx: 4, fill: "#2b2d31", filter: "url(#f-shadow)" }, g);
    part.$keys = {};
    KEYS.forEach((k, i) => {
      const x = -1 * P + (i % 4) * 2.35 * P, y = -12.3 * P + Math.floor(i / 4) * 2.7 * P;
      const isL = /[A-D]/.test(k);
      part.$keys[k] = el("rect", { x, y, width: 2 * P, height: 2.3 * P, rx: 4, fill: isL ? "#c92a2a" : k === "*" || k === "#" ? "#1971c2" : "#f8f9fa", stroke: "#000", "stroke-width": 0.6, class: "lab-press", "data-key": k }, g);
      label(g, x + P, y + 1.45 * P, k, 12, isL || k === "*" || k === "#" ? "#fff" : "#212529", "middle", 700).setAttribute("pointer-events", "none");
    });
  },
  interactive: "keys",
  update(part) { for (const [k, r] of Object.entries(part.$keys)) r.setAttribute("opacity", part.key === k ? 0.55 : 1); },
  model(part, n) {
    if (!part.key) return [];
    const i = KEYS.indexOf(part.key); if (i < 0) return [];
    return [{ type: "R", a: n("R" + (Math.floor(i / 4) + 1)), b: n("C" + (i % 4 + 1)), r: 0.1 }];
  },
};

// ───────────────── Дисплеи ─────────────────
const lcdI2c = {
  title: "Дисплей LCD 1602 с I2C (PCF8574)", group: "Дисплеи", props: { addr: 0x27 }, kind3d: "lcd",
  desc: "16 символов x 2 строки. Переходник PCF8574 на обратной стороне: только 4 провода - GND, VCC, SDA, SCL. Адрес 0x27 (иногда 0x3F).",
  selects: [{ prop: "addr", label: "Адрес I2C", options: () => [[0x27, "0x27"], [0x3f, "0x3F"]], num: true }],
  pins: () => row(["GND", "VCC", "SDA", "SCL"]),
  render(g, part) {
    const x0 = -2 * P, w = 16.5 * P;
    pcb(g, x0, -7.2 * P, w, 6.6 * P, "#1c7c2e", { holes: [[x0 + 0.6 * P, -6.6 * P], [x0 + w - 0.6 * P, -6.6 * P], [x0 + 0.6 * P, -1.2 * P], [x0 + w - 0.6 * P, -1.2 * P]] });
    el("rect", { x: x0 + 1.2 * P, y: -6.6 * P, width: w - 2.4 * P, height: 4.6 * P, rx: 2, fill: "#111" }, g);
    part.$scr = screen(g, x0 + 1.6 * P, -6.2 * P, w - 3.2 * P, 3.8 * P, 16 * 6 * 3 + 6, 2 * 9 * 3 + 6);
    header(g, 0, -0.1 * P, 4); for (let i = 0; i < 4; i++) lead(g, i * P, -0.1 * P, i * P, 0, 2);
    ["GND", "VCC", "SDA", "SCL"].forEach((t, i) => label(g, i * P, -0.85 * P, t, 5.4, "#fff", "middle", 600));
  },
  device(part, env) {
    const dev = new LcdI2C(part.props.addr, 16, 2);
    part.$lcd = dev.lcd;
    if (env.i2cOk()) env.mcu.i2c.attach(dev);
    return dev;
  },
  update(part, st) {
    const lcd = part.$lcd; const s = part.$scr;
    if (!s.cv) return;
    const on = st.running && powered(part, 4) && lcd;
    const key = on ? (lcd.dirty || lcd.blink ? "d" + Math.floor(performance.now() / 500) : part.$k) : "off";
    if (key === part.$k && !(lcd && lcd.dirty)) return;
    part.$k = key;
    if (on) { lcd.draw(s.cv, performance.now() / 1000); lcd.dirty = false; } else { const c = s.cv.getContext("2d"); c.fillStyle = "#33521a"; c.fillRect(0, 0, s.cv.width, s.cv.height); }
    s.push();
  },
  model: (part, n) => [pwr(n, "VCC", "GND", 1000), { type: "R", a: n("SDA"), b: n("VCC"), r: 4700 }, { type: "R", a: n("SCL"), b: n("VCC"), r: 4700 }],
  after: keepPwr(),
};

const lcdPar = {
  title: "Дисплей LCD 1602 (параллельный)", group: "Дисплеи", props: {}, kind3d: "lcd",
  desc: "16 выводов: VSS, VDD, V0 (контраст), RS, RW, E, D0-D7, A и K (подсветка). Для библиотеки LiquidCrystal хватит RS, E, D4-D7.",
  pins: () => row(["VSS", "VDD", "V0", "RS", "RW", "E", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "A", "K"]),
  render(g, part) {
    const x0 = -0.8 * P, w = 16.6 * P;
    pcb(g, x0, -7.4 * P, w, 6.8 * P, "#1c7c2e", { holes: [[x0 + 0.6 * P, -6.8 * P], [x0 + w - 0.6 * P, -6.8 * P]] });
    el("rect", { x: x0 + 1 * P, y: -6.6 * P, width: w - 2 * P, height: 4.7 * P, rx: 2, fill: "#111" }, g);
    part.$scr = screen(g, x0 + 1.4 * P, -6.2 * P, w - 2.8 * P, 3.9 * P, 16 * 6 * 3 + 6, 2 * 9 * 3 + 6);
    header(g, 0, -0.1 * P, 16); for (let i = 0; i < 16; i++) lead(g, i * P, -0.1 * P, i * P, 0, 2);
    ["VSS", "VDD", "V0", "RS", "RW", "E", "D0", "D1", "D2", "D3", "D4", "D5", "D6", "D7", "A", "K"].forEach((t, i) => label(g, i * P, -0.85 * P, t, 4.6, "#fff", "middle", 600));
  },
  device(part, env) { part.$lcd = lcdParallel(env, part); return part.$lcd; },
  update: lcdI2c.update,
  model: (part, n) => [pwr(n, "VDD", "VSS", 1000), { type: "R", a: n("A"), b: n("K"), r: 100 }, ...["RS", "RW", "E", "D4", "D5", "D6", "D7"].map((p) => ({ type: "R", a: n(p), b: n("VSS"), r: 100000 }))],
  after(part, v) { part.$pwr = v("VDD") - v("VSS"); if (part.$lcd) part.$lcd.backlight = v("A") - v("K") > 2.5; },
};

const oled = {
  title: "OLED 0,96\" SSD1306 (I2C)", group: "Дисплеи", props: { addr: 0x3c }, kind3d: "oled",
  desc: "128 x 64 точки, контроллер SSD1306, адрес 0x3C. Библиотеки Adafruit SSD1306 + GFX, в MicroPython - ssd1306.",
  pins: () => row(["GND", "VCC", "SCL", "SDA"]),
  render(g, part) {
    pcb(g, -1.6 * P, -7.6 * P, 6.2 * P, 7 * P, "#1c3d78", { holes: [[-1.1 * P, -7.1 * P], [4.1 * P, -7.1 * P], [-1.1 * P, -1.1 * P], [4.1 * P, -1.1 * P]] });
    el("rect", { x: -1.3 * P, y: -6.3 * P, width: 5.6 * P, height: 3.9 * P, rx: 1, fill: "#05070a", stroke: "#2b2d31" }, g);
    part.$scr = screen(g, -1.1 * P, -6.1 * P, 5.2 * P, 2.6 * P * 1.0 + 0.3 * P, 256, 128);
    header(g, 0, -0.1 * P, 4); for (let i = 0; i < 4; i++) lead(g, i * P, -0.1 * P, i * P, 0, 2);
    ["GND", "VCC", "SCL", "SDA"].forEach((t, i) => label(g, i * P, -0.85 * P, t, 5.4, "#fff", "middle", 600));
  },
  device(part, env) { const d = new SSD1306(part.props.addr, 64); part.$oled = d; if (env.i2cOk()) env.mcu.i2c.attach(d); return d; },
  update(part, st) {
    const d = part.$oled, s = part.$scr; if (!s.cv) return;
    const on = st.running && powered(part, 2.5) && d;
    if (on && !d.dirty && part.$k === "on") return;
    if (!on && part.$k === "off") return;
    part.$k = on ? "on" : "off";
    if (on) { d.draw(s.cv); d.dirty = false; } else { const c = s.cv.getContext("2d"); c.fillStyle = "#05070a"; c.fillRect(0, 0, s.cv.width, s.cv.height); }
    s.push();
  },
  model: (part, n) => [pwr(n, "VCC", "GND", 2000), { type: "R", a: n("SDA"), b: n("VCC"), r: 4700 }, { type: "R", a: n("SCL"), b: n("VCC"), r: 4700 }],
  after: keepPwr(),
};

const TM_SEG = { a: [0.55, 0.35, 1.5, 0.3], b: [2.05, 0.6, 0.3, 1.3], c: [2.05, 2.15, 0.3, 1.3], d: [0.55, 3.45, 1.5, 0.3], e: [0.25, 2.15, 0.3, 1.3], f: [0.25, 0.6, 0.3, 1.3], g: [0.55, 1.9, 1.5, 0.3] };
const tm1637Mod = {
  title: "4-разрядный индикатор TM1637", group: "Дисплеи", props: {}, kind3d: "module", h3: 9,
  desc: "Четыре цифры с двоеточием, всего два провода данных (CLK, DIO). Библиотека TM1637Display.",
  pins: () => row(["CLK", "DIO", "VCC", "GND"]),
  render(g, part) {
    pcb(g, -4.5 * P, -5.9 * P, 12.6 * P, 5.3 * P, "#1c3d78", { holes: [[-4 * P, -5.4 * P], [7.6 * P, -5.4 * P], [-4 * P, -1.1 * P], [7.6 * P, -1.1 * P]] });
    el("rect", { x: -3.6 * P, y: -5.5 * P, width: 10.8 * P, height: 4.1 * P, rx: 1.5, fill: "#111" }, g);
    part.$seg = [];
    for (let d = 0; d < 4; d++) {
      const ox = -3.2 * P + d * 2.65 * P + (d > 1 ? 0.3 * P : 0), oy = -5.2 * P;
      const segs = {};
      for (const [k, [x, y, w, h]] of Object.entries(TM_SEG)) segs[k] = el("rect", { x: ox + x * P, y: oy + y * P, width: w * P, height: h * P, rx: 1.5, fill: "#2a1012", transform: "skewX(-5)" }, g);
      part.$seg.push(segs);
    }
    part.$colon = [el("circle", { cx: 1.85 * P, cy: -4.2 * P, r: 2.4, fill: "#2a1012" }, g), el("circle", { cx: 1.85 * P, cy: -3 * P, r: 2.4, fill: "#2a1012" }, g)];
    header(g, 0, -0.1 * P, 4); for (let i = 0; i < 4; i++) lead(g, i * P, -0.1 * P, i * P, 0, 2);
    ["CLK", "DIO", "VCC", "GND"].forEach((t, i) => label(g, i * P, -0.85 * P, t, 5.2, "#fff", "middle", 600));
  },
  device(part, env) { part.$tm = tm1637(env, part); return part.$tm; },
  update(part, st) {
    const tm = part.$tm, on = st.running && tm && tm.on && powered(part, 2.5);
    const lit = `rgba(255,${40 + (tm ? tm.bright : 0) * 6},40,1)`;
    part.$seg.forEach((segs, d) => { const b = on ? tm.seg[d] : 0; "abcdefg".split("").forEach((k, i) => segs[k].setAttribute("fill", (b >> i) & 1 ? lit : "#2a1012")); });
    const colon = on && (tm.seg[1] & 0x80);
    part.$colon.forEach((c) => c.setAttribute("fill", colon ? lit : "#2a1012"));
  },
  model: (part, n) => [pwr(n, "VCC", "GND", 1000), { type: "R", a: n("CLK"), b: n("VCC"), r: 10000 }, { type: "R", a: n("DIO"), b: n("VCC"), r: 10000 }],
  after: keepPwr(),
};

const neopixel = {
  title: "Адресные светодиоды WS2812B", group: "Индикация", props: { count: 8, shape: "strip" }, kind3d: "neopixel",
  desc: "Каждый светодиод - отдельный цвет по одному проводу данных (DIN). Питание 5 В, до 60 мА на светодиод на полной яркости.",
  selects: [{ prop: "shape", label: "Форма", options: () => [["strip", "Лента"], ["ring", "Кольцо"], ["matrix", "Матрица 8 x 8"]], rerender: true }, { prop: "count", label: "Количество", options: () => [[1, "1"], [8, "8"], [12, "12"], [16, "16"], [24, "24"], [30, "30"], [64, "64 (матрица)"]], num: true, rerender: true }],
  pins: () => row(["GND", "DIN", "VCC"]),
  layout(part) {
    const n = part.props.shape === "matrix" ? 64 : part.props.count;
    const out = [];
    for (let i = 0; i < n; i++) {
      if (part.props.shape === "ring") { const a = (i / n) * Math.PI * 2 - Math.PI / 2, R = Math.max(2.4 * P, n * 0.32 * P); out.push([P + R * Math.cos(a), -R - 1.8 * P + R * Math.sin(a)]); }
      else if (part.props.shape === "matrix") { const x = i % 8, y = Math.floor(i / 8); out.push([-2.5 * P + x * 1.1 * P, -10.6 * P + y * 1.1 * P]); }
      else out.push([-1 * P + i * 1.6 * P, -2.4 * P]);
    }
    return out;
  },
  render(g, part) {
    const L = this.layout(part), sh = part.props.shape;
    if (sh === "ring") { const R = Math.max(2.4 * P, L.length * 0.32 * P); el("circle", { cx: P, cy: -R - 1.8 * P, r: R + 0.7 * P, fill: "none", stroke: "#1c1d20", "stroke-width": 1.4 * P, filter: "url(#f-shadow)" }, g); }
    else if (sh === "matrix") el("rect", { x: -3.1 * P, y: -11.2 * P, width: 8.9 * P, height: 8.9 * P, rx: 2, fill: "#1c1d20", filter: "url(#f-shadow)" }, g);
    else el("rect", { x: -1.7 * P, y: -3.1 * P, width: L.length * 1.6 * P + 0.2 * P, height: 1.4 * P, rx: 2, fill: "#1c1d20", filter: "url(#f-shadow)" }, g);
    part.$px = L.map(([x, y]) => {
      el("rect", { x: x - 6, y: y - 6, width: 12, height: 12, rx: 1.5, fill: "#f8f9fa" }, g);
      const glow = el("circle", { cx: x, cy: y, r: 9, fill: "#000", opacity: 0, filter: "url(#f-blur)" }, g);
      const c = el("circle", { cx: x, cy: y, r: 4.2, fill: "#dee2e6" }, g);
      return { c, glow };
    });
    for (let i = 0; i < 3; i++) lead(g, i * P, 0, i * P, -0.9 * P, 2);
    el("rect", { x: -0.4 * P, y: -1.25 * P, width: 2.8 * P, height: 0.5 * P, rx: 1, fill: "#2b2d31" }, g);
    ["GND", "DIN", "5V"].forEach((t, i) => label(g, i * P, 9, t, 5.4, "#495057", "middle", 600));
  },
  device(part, env) {
    const n = part.props.shape === "matrix" ? 64 : part.props.count;
    const d = new WS2812(n); part.$np = d;
    const pin = env.pin("DIN");
    if (pin) { if (env.mcu.kind === "py") env.mcu.devices.neopixel[pin] = d; else env.mcu.onPin(pin, (lvl, t) => d.edge(lvl, t)); }
    return d;
  },
  update(part, st) {
    const d = part.$np, on = st.running && d && powered(part, 3.5);
    if (d) d.idle(st.t || 0);
    part.$px.forEach((px, i) => {
      const [r, g, b] = on ? d.color(i) : [0, 0, 0];
      const m = Math.max(r, g, b);
      px.c.setAttribute("fill", m ? `rgb(${Math.min(255, r * 1.6 + 30)},${Math.min(255, g * 1.6 + 30)},${Math.min(255, b * 1.6 + 30)})` : "#dee2e6");
      px.glow.setAttribute("fill", `rgb(${r},${g},${b})`); px.glow.setAttribute("opacity", m ? Math.min(1, 0.3 + m / 200).toFixed(2) : 0);
    });
  },
  model(part, n) {
    let load = 2000;
    if (part.$np) { let sum = 0; for (const v of part.$np.rgb) sum += v; load = Math.max(8, 5 / Math.max(0.001, sum / 255 * 0.02)); }
    return [{ type: "R", a: n("VCC"), b: n("GND"), r: load, key: part.id }, { type: "R", a: n("DIN"), b: n("GND"), r: 100000 }];
  },
  after: keepPwr(),
};

const mpu = {
  title: "Акселерометр и гироскоп MPU6050", group: "Датчики", props: { pitch: 0, roll: 0, gz: 0, temp: 24, ax: 0, ay: 0, az: 1, gx: 0, gy: 0 }, kind3d: "module", h3: 3,
  desc: "Шесть осей по I2C (адрес 0x68): ускорение (в g) и угловая скорость (°/с). Наклоните плату ползунками.",
  sliders: [{ prop: "pitch", label: "Наклон вперед, °", min: -90, max: 90, step: 1 }, { prop: "roll", label: "Наклон вбок, °", min: -90, max: 90, step: 1 }, { prop: "gz", label: "Вращение, °/с", min: -250, max: 250, step: 1 }],
  pins: () => row(["VCC", "GND", "SCL", "SDA", "XDA", "XCL", "AD0", "INT"]),
  render(g, part) {
    modBoard(g, -0.8 * P, 8.6 * P, 4.6 * P, "#1c3d78", ["VCC", "GND", "SCL", "SDA", "XDA", "XCL", "AD0", "INT"], { lsize: 5, holes: [[-0.3 * P, -4.7 * P], [7.3 * P, -4.7 * P]] });
    el("rect", { x: 2.6 * P, y: -4.1 * P, width: 1.8 * P, height: 1.8 * P, rx: 1, fill: "url(#g-ic)" }, g);
    label(g, 3.5 * P, -3.1 * P, "MPU", 5, "#adb5bd", "middle", 500, mono);
    part.$axes = el("g", { transform: `translate(${6 * P} ${-3.3 * P})` }, g);
    el("line", { x1: 0, y1: 0, x2: 14, y2: 0, stroke: "#ff6b6b", "stroke-width": 1.5 }, part.$axes); label(part.$axes, 18, 3, "X", 6, "#fff");
    el("line", { x1: 0, y1: 0, x2: 0, y2: -14, stroke: "#69db7c", "stroke-width": 1.5 }, part.$axes); label(part.$axes, 0, -17, "Y", 6, "#fff");
  },
  update(part) {
    const p = part.props, rad = Math.PI / 180;
    p.ax = -Math.sin(p.pitch * rad); p.ay = Math.sin(p.roll * rad) * Math.cos(p.pitch * rad); p.az = Math.cos(p.roll * rad) * Math.cos(p.pitch * rad);
    p.gx = 0; p.gy = 0;
    part.$axes.setAttribute("transform", `translate(${6 * P} ${-3.3 * P}) rotate(${-p.gz / 10})`);
  },
  device(part, env) { const d = new MPU6050(part); if (env.i2cOk()) env.mcu.i2c.attach(d); return d; },
  model: (part, n) => [pwr(n, "VCC", "GND", 5000), { type: "R", a: n("SDA"), b: n("VCC"), r: 4700 }, { type: "R", a: n("SCL"), b: n("VCC"), r: 4700 }],
  after: keepPwr(),
};

const rtc = {
  title: "Часы реального времени DS3231", group: "Датчики", props: {}, kind3d: "module", h3: 9,
  desc: "Точные часы с батарейкой по I2C (адрес 0x68). В симуляторе показывают время вашего компьютера.",
  pins: () => row(["32K", "SQW", "SCL", "SDA", "VCC", "GND"]),
  render(g) {
    modBoard(g, -1.3 * P, 7.6 * P, 5.2 * P, "#1c3d78", ["32K", "SQW", "SCL", "SDA", "VCC", "GND"]);
    el("circle", { cx: 3.3 * P, cy: -3.6 * P, r: 2 * P, fill: "url(#g-metal)", stroke: "#868e96" }, g);
    label(g, 3.3 * P, -3.4 * P, "CR2032", 6, "#495057", "middle", 600, mono);
    el("rect", { x: -0.6 * P, y: -4.6 * P, width: 1.8 * P, height: 1.4 * P, rx: 1, fill: "url(#g-ic)" }, g);
  },
  device(part, env) { const d = new DS3231(); if (env.i2cOk()) env.mcu.i2c.attach(d); return d; },
  model: (part, n) => [pwr(n, "VCC", "GND", 5000)],
  after: keepPwr(),
};

// 74HC595 в корпусе DIP-16 (ставится через канавку макетной платы)
const HC_TOP = ["VCC", "Q0", "SER", "OE", "RCLK", "SRCLK", "SRCLR", "QH'"], HC_BOT = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "GND"];
const hc595 = {
  title: "Сдвиговый регистр 74HC595", group: "Полупроводники", props: {}, kind3d: "dip",
  desc: "8 выходов из 3 выводов платы: SER - данные, SRCLK - сдвиг, RCLK - защелка (shiftOut). OE на GND, SRCLR на +5 В.",
  pins: () => [...HC_TOP.map((name, i) => ({ name, x: i * P, y: 0 })), ...HC_BOT.map((name, i) => ({ name, x: i * P, y: 3 * P }))],
  render(g) {
    el("rect", { x: -0.45 * P, y: 0.35 * P, width: 7.9 * P, height: 2.3 * P, rx: 1.5, fill: "url(#g-ic)", filter: "url(#f-shadow)" }, g);
    el("circle", { cx: -0.05 * P, cy: 1.5 * P, r: 3.2, fill: "#111" }, g);
    label(g, 3.5 * P, 1.62 * P, "74HC595", 7.5, "#ced4da", "middle", 600, mono);
    HC_TOP.forEach((t, i) => label(g, i * P, 0.85 * P, t, 4.4, "#adb5bd"));
    HC_BOT.forEach((t, i) => label(g, i * P, 2.45 * P, t, 4.4, "#adb5bd"));
  },
  device(part, env) { part.$sr = shift595(env, part); return part.$sr; },
  model(part, n) {
    const els = [pwr(n, "VCC", "GND", 50000)];
    const v = part.$pwr ?? 0, out = part.$sr ? part.$sr.out : 0, oe = part.$oe ?? true;
    if (v > 2 && oe) for (let i = 0; i < 8; i++) els.push(vout(n, "Q" + i, "GND", (out >> (7 - i)) & 1 ? v : 0, 45));
    if (v > 2 && part.$sr) els.push(vout(n, "QH'", "GND", part.$sr.qh ? v : 0, 45));
    return els;
  },
  after(part, v) { part.$pwr = v("VCC") - v("GND"); part.$oe = v("OE") - v("GND") < 1.5; },
};

// ───────────────── Механика: робот ─────────────────
const car = {
  title: "Шасси робота 2WD", group: "Механика", props: {}, kind3d: "car",
  desc: "Двухколесная платформа: два мотора-редуктора TT с колесами и опорное колесо. Подключайте моторы через драйвер L298N. В 3D-виде робот ездит по столу.",
  actions: [{ label: "Вернуть на старт", run: (part) => { part.pose = { x: 0, y: 0, a: 0 }; part.trail = []; } }],
  pins: () => [{ name: "ML+", x: 0, y: 0, title: "левый мотор +" }, { name: "ML-", x: P, y: 0, title: "левый мотор -" }, { name: "MR+", x: 3 * P, y: 0, title: "правый мотор +" }, { name: "MR-", x: 4 * P, y: 0, title: "правый мотор -" }],
  render(g, part) {
    el("path", { d: `M ${-3 * P} ${-1.5 * P} h ${10 * P} l ${1 * P} ${-3 * P} v ${-8 * P} q 0 ${-3 * P} ${-3 * P} ${-3 * P} h ${-6 * P} q ${-3 * P} 0 ${-3 * P} ${3 * P} v ${8 * P} z`, fill: "#ffd43b", opacity: 0.85, stroke: "#e8b100", filter: "url(#f-shadow)" }, g);
    for (const [x, rot] of [[-4.4 * P, 0], [7.6 * P, 0]]) { el("rect", { x, y: -9.6 * P, width: 1.6 * P, height: 4.6 * P, rx: 3, fill: "#212529" }, g); for (let i = 0; i < 7; i++) el("rect", { x, y: -9.4 * P + i * 0.62 * P, width: 1.6 * P, height: 0.25 * P, fill: "#495057" }, g); }
    for (const x of [-2.6 * P, 5.2 * P]) el("rect", { x, y: -8.8 * P, width: 1.4 * P, height: 3 * P, rx: 2, fill: "#f2c94c", stroke: "#b8860b" }, g);
    el("circle", { cx: 2 * P, cy: -14.4 * P, r: 0.9 * P, fill: "url(#g-metal)", stroke: "#868e96" }, g);
    for (let i = 0; i < 5; i++) if (i !== 2) lead(g, i * P, 0, i * P, -1.6 * P, 2);
    part.$v = label(g, 2 * P, -11.5 * P, "", 8, "#343a40", "middle", 600);
    label(g, 2 * P, -12.8 * P, "вперед", 7, "#a0750a", "middle", 600);
  },
  update(part, st) {
    const l = st.motor?.[part.id + ":L"] || 0, r = st.motor?.[part.id + ":R"] || 0;
    const now = performance.now(), dt = Math.min(0.1, (now - (part.$t || now)) / 1000); part.$t = now;
    part.pose = part.pose || { x: 0, y: 0, a: 0 };
    const vl = Math.max(-1, Math.min(1, l / 0.2)) * 0.35, vr = Math.max(-1, Math.min(1, r / 0.2)) * 0.35; // м/с
    part.wl = vl; part.wr = vr;
    const v = (vl + vr) / 2, w = (vr - vl) / 0.13;
    const p = part.pose; p.a += w * dt; p.x += v * Math.cos(p.a) * dt; p.y += v * Math.sin(p.a) * dt;
    if (st.running) { (part.trail ||= []).push([p.x, p.y]); if (part.trail.length > 600) part.trail.shift(); }
    part.$v.textContent = Math.abs(v) > 0.01 || Math.abs(w) > 0.05 ? `${(v * 100).toFixed(0)} см/с` : "";
  },
  model: (part, n) => [{ type: "R", a: n("ML+"), b: n("ML-"), r: 25, key: part.id + ":L" }, { type: "R", a: n("MR+"), b: n("MR-"), r: 25, key: part.id + ":R" }],
};

const buzzerMod = {
  title: "Модуль активной пищалки", group: "Индикация", props: {}, kind3d: "buzzer",
  desc: "Активная пищалка с генератором: I/O = LOW включает звук (так сделано на большинстве модулей с транзистором PNP).",
  pins: () => row(["VCC", "I/O", "GND"]),
  render(g, part) {
    modBoard(g, -0.8 * P, 3.6 * P, 3 * P, "#1c1d20", ["VCC", "I/O", "GND"]);
    el("circle", { cx: P, cy: -2.6 * P, r: 1.2 * P, fill: "url(#g-black)", stroke: "#000" }, g);
    el("circle", { cx: P, cy: -2.6 * P, r: 3, fill: "#000" }, g);
    part.$wave = el("path", { d: `M ${2.6 * P} ${-3.4 * P} q 5 8 0 16`, stroke: "#f08c00", fill: "none", "stroke-width": 2, opacity: 0 }, g);
  },
  update(part, st) { part.$wave.setAttribute("opacity", part.$on ? 1 : 0); if (st.toneFn) st.toneFn(part.id, part.$on && st.running ? 2300 : 0); },
  model: (part, n) => [pwr(n, "VCC", "GND", part.$on ? 200 : 20000), { type: "R", a: n("I/O"), b: n("VCC"), r: 10000 }],
  after(part, v) { part.$pwr = v("VCC") - v("GND"); part.$on = part.$pwr > 3 && v("I/O") - v("GND") < 1; },
};

export const MODULES = {
  servo, motor, ttmotor, fan, vibro, stepper, l298n, relay,
  sonar, tmp36, dht11: dht(11), dht22: dht(22), pir, irobstacle: irObstacle, line: lineSensor, sound: soundSensor, mq2: gasSensor,
  flame: flameSensor, soil: soilSensor, water: waterSensor, hall, touch, joystick, encoder, keypad,
  lcd_i2c: lcdI2c, lcd_par: lcdPar, oled, tm1637: tm1637Mod, neopixel, mpu6050: mpu, ds3231: rtc, hc595, car, buzzer_mod: buzzerMod,
};
