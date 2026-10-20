// Детали лаборатории: внешний вид (SVG), выводы и электрическая модель.
// Шаг сетки P = 15 px соответствует 2,54 мм (0,1 дюйма), как у макетной платы.
export const P = 15;

const NS = "http://www.w3.org/2000/svg";
export function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

export const LED_COLORS = {
  red: { fill: "#ef4444", glow: "#ff3b30", vf: 1.8, label: "Красный" },
  yellow: { fill: "#facc15", glow: "#ffd60a", vf: 2.0, label: "Желтый" },
  green: { fill: "#22c55e", glow: "#30d158", vf: 2.1, label: "Зеленый" },
  blue: { fill: "#3b82f6", glow: "#0a84ff", vf: 3.0, label: "Синий" },
  white: { fill: "#e5e7eb", glow: "#ffffff", vf: 3.0, label: "Белый" },
};
const LED_RS = 12;          // внутреннее сопротивление открытого светодиода, Ом
const LED_FULL = 0.015;     // ток полной яркости, А
const LED_BURN = 0.04;      // ток, при котором светодиод сгорает, А

export const RESISTOR_VALUES = [10, 47, 100, 150, 220, 330, 470, 680, 1000, 2200, 4700, 10000, 22000, 47000, 100000, 1000000];
export function fmtOhm(r) {
  if (r >= 1e6) return (r / 1e6).toString().replace(".", ",") + " МОм";
  if (r >= 1000) return (r / 1000).toString().replace(".", ",") + " кОм";
  return r + " Ом";
}
const BAND = ["#111", "#7c3f12", "#dc2626", "#f97316", "#facc15", "#16a34a", "#2563eb", "#7c3aed", "#6b7280", "#fff"];
function bands(r) {
  const exp = Math.floor(Math.log10(r)) - 1;
  const digits = Math.round(r / 10 ** exp);
  return [Math.floor(digits / 10), digits % 10, Math.max(0, exp)];
}

const lead = (g, x1, y1, x2, y2) => el("line", { x1, y1, x2, y2, stroke: "#9ca3af", "stroke-width": 2.2, "stroke-linecap": "round" }, g);
const label = (g, x, y, text, size = 9, color = "#334155", anchor = "middle") =>
  Object.assign(el("text", { x, y, "font-size": size, fill: color, "text-anchor": anchor, "font-family": "Inter, Arial, sans-serif" }, g), { textContent: text });

// ───────────────────────── Макетная плата ─────────────────────────
const BB_COLS = 30;
const BB_ROWS = { tp: 1, tn: 2, a: 4, b: 5, c: 6, d: 7, e: 8, f: 11, g: 12, h: 13, i: 14, j: 15, bp: 17, bn: 18 };

function breadboardPins() {
  const pins = [];
  for (const [row, y] of Object.entries(BB_ROWS)) {
    for (let c = 0; c < BB_COLS; c++) pins.push({ name: `${row}${c + 1}`, x: (c + 1) * P, y: y * P, hole: true });
  }
  return pins;
}
const BB_PINS = breadboardPins();

export const PARTS = {
  breadboard: {
    title: "Макетная плата", group: "Основа", w: (BB_COLS + 1) * P, h: 19 * P, pins: () => BB_PINS, layer: 0,
    render(g) {
      el("rect", { x: 0, y: 0, width: (BB_COLS + 1) * P, height: 19 * P, rx: 6, fill: "#f4f1ea", stroke: "#d6d0c4" }, g);
      el("rect", { x: P / 2, y: 9.2 * P, width: BB_COLS * P, height: 1.6 * P, fill: "#e7e2d7" }, g);
      for (const [row, y, color] of [["+", 1, "#dc2626"], ["-", 2, "#2563eb"], ["+", 17, "#dc2626"], ["-", 18, "#2563eb"]]) {
        el("line", { x1: P / 2, y1: (y + (y % 2 ? -0.5 : 0.5)) * P, x2: (BB_COLS + 0.5) * P, y2: (y + (y % 2 ? -0.5 : 0.5)) * P, stroke: color, "stroke-width": 1 }, g);
        label(g, P * 0.25, y * P + 3, row, 9, color, "middle");
      }
      for (const [r, y] of Object.entries(BB_ROWS)) if (r.length === 1) label(g, P * 0.25, y * P + 3, r, 7, "#94a3b8");
      for (const c of [1, 5, 10, 15, 20, 25, 30]) label(g, c * P, 3.3 * P, String(c), 7, "#94a3b8");
      for (const p of BB_PINS) el("rect", { x: p.x - 2.5, y: p.y - 2.5, width: 5, height: 5, rx: 1, fill: "#3f3a33" }, g);
    },
    // Внутренние соединения: колонки a-e и f-j, шины питания по всей длине
    links(pinKey) {
      const out = [];
      for (let c = 1; c <= BB_COLS; c++) {
        for (const r of "bcde") out.push([pinKey(`a${c}`), pinKey(`${r}${c}`)]);
        for (const r of "ghij") out.push([pinKey(`f${c}`), pinKey(`${r}${c}`)]);
      }
      for (const rail of ["tp", "tn", "bp", "bn"]) for (let c = 2; c <= BB_COLS; c++) out.push([pinKey(`${rail}1`), pinKey(`${rail}${c}`)]);
      return out;
    },
  },

  resistor: {
    title: "Резистор", group: "Пассивные", props: { r: 220 }, pins: () => [{ name: "1", x: 0, y: 0 }, { name: "2", x: 4 * P, y: 0 }],
    render(g, part) {
      lead(g, 0, 0, 4 * P, 0);
      el("rect", { x: 0.9 * P, y: -5.5, width: 2.2 * P, height: 11, rx: 5, fill: "#e8cfa4", stroke: "#b08d57" }, g);
      const [d1, d2, m] = bands(part.props.r);
      [d1, d2, m].forEach((b, i) => el("rect", { x: 1.25 * P + i * 7, y: -5.5, width: 3.5, height: 11, fill: BAND[b] }, g));
      el("rect", { x: 2.75 * P, y: -5.5, width: 3.5, height: 11, fill: "#c9a227" }, g);
    },
    info: (part) => fmtOhm(part.props.r),
    model: (part, n) => [{ type: "R", a: n("1"), b: n("2"), r: part.props.r, key: part.id }],
  },

  led: {
    title: "Светодиод", group: "Индикация", props: { color: "red" },
    pins: () => [{ name: "A", x: P, y: 0, title: "анод (+, длинная ножка)" }, { name: "K", x: 0, y: 0, title: "катод (-)" }],
    render(g, part) {
      const c = LED_COLORS[part.props.color] || LED_COLORS.red;
      lead(g, 0, 0, 0, -1.2 * P); lead(g, P, 0, P, -1.2 * P);
      el("line", { x1: P, y1: -1.2 * P, x2: P + 3, y2: -1.5 * P, stroke: "#9ca3af", "stroke-width": 2 }, g);
      part.$glow = el("circle", { cx: P / 2, cy: -2.3 * P, r: 15, fill: c.glow, opacity: 0 }, g);
      el("path", { d: `M ${-2} ${-1.2 * P} h ${P + 4} v ${-1.1 * P} a ${P / 2 + 2} ${P / 2 + 2} 0 0 0 ${-P - 4} 0 z`, fill: c.fill, stroke: "rgba(0,0,0,.25)" }, g);
      part.$burn = label(g, P / 2, -3.6 * P, "", 9, "#dc2626");
    },
    update(part, st) {
      const s = st.diodes[part.id] || { i: 0 };
      if (s.i > LED_BURN) part.burnt = true;
      const b = part.burnt ? 0 : Math.min(1, (s.i / LED_FULL) * (st.duty?.[part.id] ?? 1));
      part.brightness = b;
      part.$glow.setAttribute("opacity", (b * 0.85).toFixed(2));
      part.$burn.textContent = part.burnt ? "сгорел!" : "";
    },
    info: (part) => (LED_COLORS[part.props.color] || LED_COLORS.red).label,
    model: (part, n) => part.burnt ? [] : [{ type: "D", a: n("A"), k: n("K"), vf: (LED_COLORS[part.props.color] || LED_COLORS.red).vf, rs: LED_RS, key: part.id }],
  },

  rgbled: {
    title: "RGB-светодиод", group: "Индикация",
    pins: () => [{ name: "R", x: 0, y: 0 }, { name: "COM", x: P, y: 0, title: "общий катод (-)" }, { name: "G", x: 2 * P, y: 0 }, { name: "B", x: 3 * P, y: 0 }],
    render(g, part) {
      for (let i = 0; i < 4; i++) lead(g, i * P, 0, i * P, -1.2 * P);
      part.$glow = el("circle", { cx: 1.5 * P, cy: -2.4 * P, r: 18, fill: "#000", opacity: 0 }, g);
      el("path", { d: `M ${-3} ${-1.2 * P} h ${3 * P + 6} v ${-1.1 * P} a ${1.5 * P + 3} ${1.2 * P} 0 0 0 ${-3 * P - 6} 0 z`, fill: "#f8fafc", stroke: "#94a3b8", opacity: 0.9 }, g);
      label(g, 0, 10, "R", 7); label(g, 2 * P, 10, "G", 7); label(g, 3 * P, 10, "B", 7);
    },
    update(part, st) {
      const ch = ["r", "g", "b"].map((c) => {
        const s = st.diodes[`${part.id}:${c}`] || { i: 0 };
        return Math.min(1, (s.i / LED_FULL) * (st.duty?.[`${part.id}:${c}`] ?? 1));
      });
      const m = Math.max(...ch);
      part.brightness = m;
      part.$glow.setAttribute("fill", `rgb(${ch.map((x) => Math.round(255 * (m ? x / m : 0))).join(",")})`);
      part.$glow.setAttribute("opacity", (m * 0.9).toFixed(2));
    },
    model: (part, n) => [
      { type: "D", a: n("R"), k: n("COM"), vf: 1.8, rs: LED_RS, key: `${part.id}:r` },
      { type: "D", a: n("G"), k: n("COM"), vf: 2.1, rs: LED_RS, key: `${part.id}:g` },
      { type: "D", a: n("B"), k: n("COM"), vf: 3.0, rs: LED_RS, key: `${part.id}:b` },
    ],
  },

  button: {
    title: "Кнопка", group: "Ввод", props: {}, pins: () => [{ name: "1", x: 0, y: 0 }, { name: "2", x: 2 * P, y: 0 }],
    render(g, part) {
      el("rect", { x: -4, y: -1.6 * P, width: 2 * P + 8, height: 1.6 * P, rx: 3, fill: "#334155" }, g);
      part.$cap = el("circle", { cx: P, cy: -0.8 * P, r: 7, fill: "#ef4444", stroke: "#7f1d1d", class: "lab-press" }, g);
    },
    update(part) { part.$cap.setAttribute("r", part.pressed ? 5.5 : 7); },
    interactive: "press",
    model: (part, n) => part.pressed ? [{ type: "R", a: n("1"), b: n("2"), r: 0.05 }] : [],
  },

  switch: {
    title: "Переключатель", group: "Ввод", props: { on: false }, pins: () => [{ name: "1", x: 0, y: 0 }, { name: "2", x: 2 * P, y: 0 }],
    render(g, part) {
      el("rect", { x: -4, y: -1.4 * P, width: 2 * P + 8, height: 1.4 * P, rx: 3, fill: "#475569" }, g);
      part.$knob = el("rect", { x: 0, y: -1.1 * P, width: P, height: 0.8 * P, rx: 2, fill: "#e2e8f0", class: "lab-press" }, g);
    },
    update(part) { part.$knob.setAttribute("x", part.props.on ? P : 0); },
    interactive: "toggle",
    info: (part) => (part.props.on ? "включен" : "выключен"),
    model: (part, n) => part.props.on ? [{ type: "R", a: n("1"), b: n("2"), r: 0.05 }] : [],
  },

  pot: {
    title: "Потенциометр", group: "Ввод", props: { r: 10000, pos: 0.5 },
    pins: () => [{ name: "1", x: 0, y: 0 }, { name: "W", x: P, y: 0, title: "средний вывод (бегунок)" }, { name: "2", x: 2 * P, y: 0 }],
    render(g, part) {
      for (let i = 0; i < 3; i++) lead(g, i * P, 0, i * P, -0.8 * P);
      el("rect", { x: -6, y: -2.6 * P, width: 2 * P + 12, height: 1.9 * P, rx: 4, fill: "#2563eb" }, g);
      el("circle", { cx: P, cy: -1.65 * P, r: 10, fill: "#e5e7eb", stroke: "#64748b", class: "lab-press" }, g);
      part.$needle = el("line", { x1: P, y1: -1.65 * P, x2: P, y2: -1.65 * P - 9, stroke: "#0f172a", "stroke-width": 2.5, "stroke-linecap": "round" }, g);
    },
    update(part) {
      const a = (-135 + 270 * part.props.pos) * Math.PI / 180;
      part.$needle.setAttribute("x2", P + 9 * Math.sin(a)); part.$needle.setAttribute("y2", -1.65 * P - 9 * Math.cos(a));
    },
    interactive: "slider", sliderProp: "pos", sliderLabel: "Положение ручки",
    info: (part) => `${fmtOhm(part.props.r)}, ${Math.round(part.props.pos * 100)}%`,
    model: (part, n) => [
      { type: "R", a: n("1"), b: n("W"), r: Math.max(1, part.props.r * part.props.pos) },
      { type: "R", a: n("W"), b: n("2"), r: Math.max(1, part.props.r * (1 - part.props.pos)) },
    ],
  },

  ldr: {
    title: "Фоторезистор", group: "Ввод", props: { light: 0.5 }, pins: () => [{ name: "1", x: 0, y: 0 }, { name: "2", x: P, y: 0 }],
    render(g, part) {
      lead(g, 0, 0, 0, -P); lead(g, P, 0, P, -P);
      el("circle", { cx: P / 2, cy: -1.8 * P, r: 11, fill: "#fde68a", stroke: "#a16207", class: "lab-press" }, g);
      el("path", { d: `M ${P / 2 - 7} ${-1.8 * P - 4} q 3.5 -4 7 0 t 7 0 M ${P / 2 - 7} ${-1.8 * P + 2} q 3.5 -4 7 0 t 7 0`, stroke: "#b45309", fill: "none", "stroke-width": 1.6 }, g);
      part.$sun = el("circle", { cx: P / 2 + 14, cy: -2.9 * P, r: 5, fill: "#f59e0b" }, g);
    },
    update(part) { part.$sun.setAttribute("opacity", (0.15 + 0.85 * part.props.light).toFixed(2)); },
    interactive: "slider", sliderProp: "light", sliderLabel: "Освещенность",
    // 0% света - около 200 кОм, 100% - около 1 кОм
    resistance: (part) => Math.round(200000 * Math.pow(1000 / 200000, part.props.light)),
    info(part) { return `${Math.round(part.props.light * 100)}% света, ${fmtOhm(this.resistance(part))}`; },
    model(part, n) { return [{ type: "R", a: n("1"), b: n("2"), r: this.resistance(part) }]; },
  },

  buzzer: {
    title: "Пьезопищалка", group: "Индикация", pins: () => [{ name: "+", x: 0, y: 0 }, { name: "-", x: 2 * P, y: 0 }],
    render(g, part) {
      lead(g, 0, 0, 0, -0.8 * P); lead(g, 2 * P, 0, 2 * P, -0.8 * P);
      el("circle", { cx: P, cy: -1.9 * P, r: 17, fill: "#1f2937" }, g);
      el("circle", { cx: P, cy: -1.9 * P, r: 4, fill: "#4b5563" }, g);
      label(g, -4, -0.9 * P, "+", 10, "#dc2626");
      part.$wave = el("path", { d: `M ${P + 21} ${-2.6 * P} q 6 10 0 20 M ${P + 26} ${-2.9 * P} q 9 14 0 29`, stroke: "#f59e0b", fill: "none", "stroke-width": 2, opacity: 0 }, g);
    },
    update(part, st) { part.$wave.setAttribute("opacity", st.tone?.[part.id] ? 1 : 0); },
    model: (part, n) => [{ type: "R", a: n("+"), b: n("-"), r: 1000, key: part.id }],
  },

  servo: {
    title: "Сервопривод", group: "Движение",
    pins: () => [{ name: "GND", x: 0, y: 0 }, { name: "5V", x: P, y: 0 }, { name: "SIG", x: 2 * P, y: 0, title: "сигнал" }],
    render(g, part) {
      el("line", { x1: 0, y1: 0, x2: 0, y2: -P, stroke: "#4b2e1a", "stroke-width": 3 }, g);
      el("line", { x1: P, y1: 0, x2: P, y2: -P, stroke: "#dc2626", "stroke-width": 3 }, g);
      el("line", { x1: 2 * P, y1: 0, x2: 2 * P, y2: -P, stroke: "#f59e0b", "stroke-width": 3 }, g);
      el("rect", { x: -2.5 * P, y: -4.6 * P, width: 7 * P, height: 3.6 * P, rx: 5, fill: "#1e3a8a" }, g);
      el("circle", { cx: -0.5 * P, cy: -2.8 * P, r: 13, fill: "#e5e7eb" }, g);
      part.$horn = el("g", {}, g);
      el("rect", { x: -0.5 * P - 4, y: -2.8 * P - 30, width: 8, height: 34, rx: 4, fill: "#f8fafc", stroke: "#94a3b8" }, part.$horn);
      part.$angle = label(g, 3 * P, -2.3 * P, "", 10, "#fff");
    },
    update(part, st) {
      const a = st.servo?.[part.id];
      if (a !== undefined) part.angle = a;
      const ang = part.angle ?? 90;
      part.$horn.setAttribute("transform", `rotate(${ang - 90} ${-0.5 * P} ${-2.8 * P})`);
      part.$angle.textContent = `${Math.round(ang)}°`;
    },
    model: (part, n) => [{ type: "R", a: n("5V"), b: n("GND"), r: 500 }],
  },

  seg7: {
    title: "7-сегментный индикатор", group: "Индикация",
    pins: () => {
      const top = ["g", "f", "COM", "a", "b"], bot = ["e", "d", "COM2", "c", "dp"];
      return [...top.map((nm, i) => ({ name: nm, x: i * P, y: 0 })), ...bot.map((nm, i) => ({ name: nm, x: i * P, y: 6 * P }))];
    },
    render(g, part) {
      el("rect", { x: -P / 2, y: P / 2, width: 5 * P, height: 5 * P, rx: 3, fill: "#111827" }, g);
      const S = { a: [0.8, 1.2, 2.4, 0], b: [3.2, 1.4, 0, 1.6], c: [3.2, 3.2, 0, 1.6], d: [0.8, 4.9, 2.4, 0], e: [0.8, 3.2, 0, 1.6], f: [0.8, 1.4, 0, 1.6], g: [0.8, 3.05, 2.4, 0] };
      part.$seg = {};
      for (const [k, [x, y, w, h]] of Object.entries(S)) {
        part.$seg[k] = el("rect", { x: x * P - 2, y: y * P - 2, width: w * P + 4 || 5, height: h * P + 4 || 5, rx: 2, fill: "#3f1d1d" }, g);
      }
      part.$seg.dp = el("circle", { cx: 3.75 * P, cy: 5 * P, r: 2.5, fill: "#3f1d1d" }, g);
    },
    update(part, st) {
      for (const [k, node] of Object.entries(part.$seg)) {
        const s = st.diodes[`${part.id}:${k}`] || { i: 0 };
        const on = s.i * (st.duty?.[`${part.id}:${k}`] ?? 1) > 0.002;
        node.setAttribute("fill", on ? "#ef4444" : "#3f1d1d");
      }
    },
    links: (pinKey, part) => [[pinKey("COM"), pinKey("COM2")]],
    model: (part, n) => ["a", "b", "c", "d", "e", "f", "g", "dp"].map((s) => ({ type: "D", a: n(s), k: n("COM"), vf: 1.8, rs: 30, key: `${part.id}:${s}` })),
  },

  diode: {
    title: "Диод", group: "Пассивные",
    pins: () => [{ name: "A", x: 0, y: 0, title: "анод" }, { name: "K", x: 3 * P, y: 0, title: "катод (сторона с полоской)" }],
    render(g) {
      lead(g, 0, 0, 3 * P, 0);
      el("rect", { x: 0.75 * P, y: -5, width: 1.5 * P, height: 10, rx: 2, fill: "#1f2937" }, g);
      el("rect", { x: 1.95 * P, y: -5, width: 3.5, height: 10, fill: "#d1d5db" }, g);
    },
    model: (part, n) => [{ type: "D", a: n("A"), k: n("K"), vf: 0.7, rs: 0.3, key: part.id }],
  },

  npn: {
    title: "Транзистор NPN", group: "Пассивные",
    pins: () => [{ name: "E", x: 0, y: 0, title: "эмиттер" }, { name: "B", x: P, y: 0, title: "база" }, { name: "C", x: 2 * P, y: 0, title: "коллектор" }],
    render(g) {
      for (let i = 0; i < 3; i++) lead(g, i * P, 0, i * P, -0.8 * P);
      el("path", { d: `M ${-5} ${-0.8 * P} h ${2 * P + 10} v ${-1.2 * P} a ${P + 5} ${P} 0 0 0 ${-2 * P - 10} 0 z`, fill: "#1f2937" }, g);
      label(g, P, -1.35 * P, "NPN", 7.5, "#e5e7eb");
      label(g, 0, 10, "E", 7); label(g, P, 10, "B", 7); label(g, 2 * P, 10, "C", 7);
    },
    info: () => "Как 2N2222: E - эмиттер, B - база, C - коллектор. Небольшой ток базы открывает путь коллектор-эмиттер.",
    model: (part, n) => [{ type: "Q", b: n("B"), c: n("C"), e: n("E"), beta: 100, key: part.id }],
  },

  motor: {
    title: "Мотор постоянного тока", group: "Движение",
    pins: () => [{ name: "+", x: 0, y: 0 }, { name: "-", x: 2 * P, y: 0 }],
    render(g, part) {
      lead(g, 0, 0, 0, -P); lead(g, 2 * P, 0, 2 * P, -P);
      el("rect", { x: -P, y: -4.4 * P, width: 4 * P, height: 3.4 * P, rx: 8, fill: "#9ca3af", stroke: "#4b5563" }, g);
      el("circle", { cx: P, cy: -2.7 * P, r: 17, fill: "#e5e7eb", stroke: "#6b7280" }, g);
      part.$rot = el("g", {}, g);
      el("rect", { x: P - 2, y: -2.7 * P - 15, width: 4, height: 30, rx: 2, fill: "#ef4444" }, part.$rot);
      el("circle", { cx: P, cy: -2.7 * P, r: 3, fill: "#374151" }, part.$rot);
      label(g, 0, -1.25 * P, "+", 10, "#dc2626");
      part.$rpm = label(g, P, -4.75 * P, "", 9, "#334155");
      part.$ang = 0;
    },
    update(part, st) {
      const i = st.motor?.[part.id] || 0;
      const now = performance.now();
      const dt = Math.min(0.1, (now - (part.$t || now)) / 1000);
      part.$t = now;
      part.speed = Math.max(-1, Math.min(1, i / 0.25));
      part.$ang = (part.$ang + part.speed * 1500 * dt) % 360;
      part.$rot.setAttribute("transform", `rotate(${part.$ang} ${P} ${-2.7 * P})`);
      part.$rpm.textContent = Math.abs(part.speed) > 0.02 ? `${Math.round(Math.abs(part.speed) * 100)}%` : "";
    },
    info: () => "Ток до 250 мА: от пина Arduino его не питают, только через транзистор или драйвер.",
    model: (part, n) => [{ type: "R", a: n("+"), b: n("-"), r: 20, key: part.id }],
  },

  sonar: {
    title: "Ультразвуковой датчик HC-SR04", group: "Ввод", props: { dist: 50 },
    pins: () => [{ name: "VCC", x: 0, y: 0 }, { name: "TRIG", x: P, y: 0 }, { name: "ECHO", x: 2 * P, y: 0 }, { name: "GND", x: 3 * P, y: 0 }],
    render(g, part) {
      for (let i = 0; i < 4; i++) lead(g, i * P, 0, i * P, -0.8 * P);
      el("rect", { x: -2.2 * P, y: -4 * P, width: 7.4 * P, height: 3.2 * P, rx: 4, fill: "#1d4ed8" }, g);
      for (const cx of [-0.6 * P, 3.6 * P]) {
        el("circle", { cx, cy: -2.4 * P, r: 17, fill: "#d1d5db", stroke: "#6b7280", "stroke-width": 2 }, g);
        el("circle", { cx, cy: -2.4 * P, r: 11, fill: "#4b5563" }, g);
      }
      label(g, 1.5 * P, -3.3 * P, "HC-SR04", 7, "#dbeafe");
      part.$d = label(g, 1.5 * P, -4.6 * P, "", 10, "#1e3a8a");
      for (const [i, t] of ["VCC", "TRIG", "ECHO", "GND"].entries()) label(g, i * P, -1.05 * P, t[0], 6.5, "#dbeafe");
    },
    update(part) { part.$d.textContent = `до препятствия ${part.props.dist} см`; },
    sliders: [{ prop: "dist", label: "Расстояние до препятствия, см", min: 2, max: 300, step: 1 }],
    info: () => "TRIG - импульс 10 мкс запускает замер, ECHO - ответный импульс: 58 мкс на каждый сантиметр.",
    model: (part, n) => [{ type: "R", a: n("VCC"), b: n("GND"), r: 2000 }],
  },

  tmp36: {
    title: "Датчик температуры TMP36", group: "Ввод", props: { temp: 25 },
    pins: () => [{ name: "+Vs", x: 0, y: 0, title: "питание 2,7-5,5 В" }, { name: "Vout", x: P, y: 0, title: "выход: 10 мВ на градус" }, { name: "GND", x: 2 * P, y: 0 }],
    render(g, part) {
      for (let i = 0; i < 3; i++) lead(g, i * P, 0, i * P, -0.8 * P);
      el("path", { d: `M ${-5} ${-0.8 * P} h ${2 * P + 10} v ${-1.2 * P} a ${P + 5} ${P} 0 0 0 ${-2 * P - 10} 0 z`, fill: "#111827" }, g);
      label(g, P, -1.35 * P, "TMP36", 7, "#e5e7eb");
      part.$t = label(g, P, -3.4 * P, "", 10, "#b91c1c");
    },
    update(part) { part.$t.textContent = `${part.props.temp} °C`; },
    sliders: [{ prop: "temp", label: "Температура, °C", min: -40, max: 125, step: 1 }],
    info: () => "Выход: 0,5 В при 0 °C и плюс 10 мВ на каждый градус. 25 °C - 0,75 В.",
    model(part, n) {
      const powered = (part.$pwr ?? 5) > 2.7;
      const els = [{ type: "R", a: n("+Vs"), b: n("GND"), r: 50000 }];
      if (powered) els.push({ type: "V", p: n("Vout"), n: n("GND"), v: 0.5 + 0.01 * part.props.temp, r: 50 });
      return els;
    },
  },

  battery: {
    title: "Батарейка", group: "Питание", props: { v: 9 }, pins: () => [{ name: "+", x: 0, y: 0 }, { name: "-", x: 2 * P, y: 0 }],
    render(g, part) {
      lead(g, 0, 0, 0, -P); lead(g, 2 * P, 0, 2 * P, -P);
      el("rect", { x: -P, y: -4.2 * P, width: 4 * P, height: 3.2 * P, rx: 4, fill: "#111827" }, g);
      el("rect", { x: -P, y: -4.2 * P, width: 4 * P, height: 1.1 * P, rx: 4, fill: "#f59e0b" }, g);
      part.$v = label(g, P, -1.9 * P, "", 11, "#fff");
      label(g, 0, -1.3 * P, "+", 10, "#f87171"); label(g, 2 * P, -1.3 * P, "-", 11, "#93c5fd");
    },
    update(part) { part.$v.textContent = `${part.props.v} В`; },
    info: (part) => `${part.props.v} В`,
    model: (part, n) => [{ type: "V", p: n("+"), n: n("-"), v: part.props.v, r: 0.5, key: part.id }],
  },

  meter: {
    title: "Мультиметр", group: "Измерения", props: { mode: "V" },
    pins: () => [{ name: "COM", x: 0, y: 0, title: "черный щуп" }, { name: "IN", x: 3 * P, y: 0, title: "красный щуп" }],
    render(g, part) {
      el("rect", { x: -P, y: -5.6 * P, width: 5 * P, height: 5 * P, rx: 6, fill: "#facc15", stroke: "#a16207" }, g);
      el("rect", { x: -0.4 * P, y: -5 * P, width: 3.8 * P, height: 1.7 * P, rx: 3, fill: "#d9f99d" }, g);
      part.$val = label(g, 1.5 * P, -3.75 * P, "", 12, "#1a2e05");
      part.$mode = label(g, 1.5 * P, -2.2 * P, "", 10, "#713f12");
      el("circle", { cx: 0, cy: -0.6 * P, r: 5, fill: "#111" }, g); el("circle", { cx: 3 * P, cy: -0.6 * P, r: 5, fill: "#dc2626" }, g);
    },
    update(part, st) {
      const m = st.meter?.[part.id];
      part.$mode.textContent = { V: "Вольтметр", A: "Амперметр", R: "Омметр" }[part.props.mode];
      if (!m) { part.$val.textContent = "---"; return; }
      part.$val.textContent = m;
    },
    info: (part) => ({ V: "напряжение", A: "ток", R: "сопротивление" }[part.props.mode]),
    model: (part, n) => part.props.mode === "A" ? [{ type: "R", a: n("IN"), b: n("COM"), r: 0.01, key: part.id }]
      : part.props.mode === "R" ? [{ type: "V", p: n("IN"), n: n("COM"), v: 1, r: 1000, key: part.id, meterR: true }]
        : [{ type: "R", a: n("IN"), b: n("COM"), r: 1e7, key: part.id }],
  },

  uno: {
    title: "Arduino Uno", group: "Основа", w: 29 * P, h: 21 * P, layer: 0,
    pins: () => {
      const top = [["SCL", 9], ["SDA", 10], ["AREF", 11], ["GND.1", 12], ["13", 13], ["12", 14], ["11", 15], ["10", 16], ["9", 17], ["8", 18],
        ["7", 20], ["6", 21], ["5", 22], ["4", 23], ["3", 24], ["2", 25], ["1", 26], ["0", 27]];
      const bot = [["IOREF", 10], ["RESET", 11], ["3.3V", 12], ["5V", 13], ["GND.2", 14], ["GND.3", 15], ["VIN", 16],
        ["A0", 18], ["A1", 19], ["A2", 20], ["A3", 21], ["A4", 22], ["A5", 23]];
      return [...top.map(([n, x]) => ({ name: n, x: x * P, y: P })), ...bot.map(([n, x]) => ({ name: n, x: x * P, y: 20 * P }))];
    },
    render(g, part) {
      el("rect", { x: 0, y: 0, width: 29 * P, height: 21 * P, rx: 10, fill: "#0e7490", stroke: "#155e75" }, g);
      el("rect", { x: -0.6 * P, y: 3 * P, width: 3.8 * P, height: 3.6 * P, rx: 2, fill: "#cbd5e1", stroke: "#64748b" }, g);
      el("rect", { x: -0.3 * P, y: 14 * P, width: 3.2 * P, height: 2.6 * P, rx: 2, fill: "#1f2937" }, g);
      el("rect", { x: 12 * P, y: 8.5 * P, width: 12 * P, height: 3.2 * P, rx: 2, fill: "#1f2937" }, g);
      label(g, 18 * P, 10.4 * P, "ATmega328P", 9, "#94a3b8");
      label(g, 9 * P, 13.8 * P, "UNO", 22, "#e0f2fe");
      label(g, 9 * P, 15.3 * P, "USTEM Lab", 9, "#bae6fd");
      el("rect", { x: 8.5 * P, y: 0.4 * P, width: 10 * P, height: 1.2 * P, rx: 2, fill: "#111" }, g);
      el("rect", { x: 19.5 * P, y: 0.4 * P, width: 8 * P, height: 1.2 * P, rx: 2, fill: "#111" }, g);
      el("rect", { x: 9.5 * P, y: 19.4 * P, width: 7 * P, height: 1.2 * P, rx: 2, fill: "#111" }, g);
      el("rect", { x: 17.5 * P, y: 19.4 * P, width: 6 * P, height: 1.2 * P, rx: 2, fill: "#111" }, g);
      for (const p of this.pins()) {
        const lbl = p.name.replace(/\.\d$/, "");
        label(g, p.x, p.y < 10 * P ? p.y + 16 : p.y - 9, lbl, 6.5, "#e0f2fe");
      }
      label(g, 16.5 * P, 2.6 * P + 6, "DIGITAL (PWM ~ 3 5 6 9 10 11)", 7, "#bae6fd");
      label(g, 20.5 * P, 18.2 * P, "ANALOG IN", 7, "#bae6fd");
      el("rect", { x: 11.5 * P, y: 3.6 * P, width: 10, height: 6, rx: 1, fill: "#fbbf24" }, g);
      label(g, 11.5 * P + 18, 3.6 * P + 6, "L", 7, "#e0f2fe");
      part.$l = el("rect", { x: 11.5 * P, y: 3.6 * P, width: 10, height: 6, rx: 1, fill: "#fde047", opacity: 0 }, g);
      el("rect", { x: 23 * P, y: 4 * P, width: 10, height: 6, rx: 1, fill: "#22c55e" }, g);
      label(g, 23 * P + 20, 4 * P + 6, "ON", 7, "#e0f2fe");
      part.$tx = el("rect", { x: 11.5 * P, y: 5.2 * P, width: 10, height: 6, rx: 1, fill: "#fde047", opacity: 0 }, g);
      label(g, 11.5 * P + 18, 5.2 * P + 6, "TX", 7, "#e0f2fe");
      part.$run = label(g, 21 * P, 15 * P, "", 9, "#fef08a");
    },
    update(part, st) {
      part.$l.setAttribute("opacity", st.pin13 ? 1 : 0);
      part.$tx.setAttribute("opacity", st.tx ? 1 : 0);
      part.$run.textContent = st.running ? "работает" : "";
    },
    links: (pinKey) => [[pinKey("GND.1"), pinKey("GND.2")], [pinKey("GND.1"), pinKey("GND.3")]],
    model: (part, n) => [
      { type: "V", p: n("5V"), n: n("GND.1"), v: 5, r: 0.1, key: part.id + ":5v" },
      { type: "V", p: n("3.3V"), n: n("GND.1"), v: 3.3, r: 0.5, key: part.id + ":3v3" },
    ],
  },
};

/** Положение вывода с учетом поворота детали (на 0/90/180/270 градусов). */
export function pinPos(part, pin) {
  const r = ((part.rot || 0) % 360 + 360) % 360;
  let { x, y } = pin;
  if (r === 90) [x, y] = [-y, x];
  else if (r === 180) [x, y] = [-x, -y];
  else if (r === 270) [x, y] = [y, -x];
  return { x: part.x + x, y: part.y + y };
}
