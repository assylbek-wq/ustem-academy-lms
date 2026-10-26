// Общее для деталей лаборатории: шаг сетки, SVG-помощники, градиенты (металл, пластик, плата), подписи.
// Шаг P = 15 px соответствует 2,54 мм (0,1 дюйма), как у макетной платы: 1 мм = 5,9 px.
export const P = 15;
export const MM = P / 2.54;

const NS = "http://www.w3.org/2000/svg";
export function el(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

// Градиенты и фильтры: один раз в <defs> холста (и в SVG для текстур 3D-вида)
export const DEFS = `
<linearGradient id="g-lead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f3f5"/><stop offset=".5" stop-color="#a7adb4"/><stop offset="1" stop-color="#6c737b"/></linearGradient>
<linearGradient id="g-leadv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f1f3f5"/><stop offset=".5" stop-color="#a7adb4"/><stop offset="1" stop-color="#6c737b"/></linearGradient>
<linearGradient id="g-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".45" stop-color="#c3c9cf"/><stop offset=".55" stop-color="#aeb5bc"/><stop offset="1" stop-color="#e2e6ea"/></linearGradient>
<linearGradient id="g-metalh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9ecef"/><stop offset=".5" stop-color="#b8bfc6"/><stop offset="1" stop-color="#dfe3e7"/></linearGradient>
<linearGradient id="g-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe7a1"/><stop offset=".5" stop-color="#d9a93d"/><stop offset="1" stop-color="#f3d27a"/></linearGradient>
<linearGradient id="g-ic" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3d42"/><stop offset="1" stop-color="#1b1d20"/></linearGradient>
<linearGradient id="g-black" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3f45"/><stop offset=".12" stop-color="#26292d"/><stop offset="1" stop-color="#121315"/></linearGradient>
<linearGradient id="g-header" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c2f33"/><stop offset="1" stop-color="#0f1012"/></linearGradient>
<linearGradient id="g-resistor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3e2c4"/><stop offset=".45" stop-color="#d9bd8f"/><stop offset="1" stop-color="#a98a5c"/></linearGradient>
<linearGradient id="g-blue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a7bd5"/><stop offset="1" stop-color="#1f4e9a"/></linearGradient>
<linearGradient id="g-white" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dfe3e8"/></linearGradient>
<radialGradient id="g-dome" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff" stop-opacity=".85"/><stop offset=".35" stop-color="#ffffff" stop-opacity=".18"/><stop offset="1" stop-color="#000000" stop-opacity=".18"/></radialGradient>
<radialGradient id="g-glow"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".4" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<radialGradient id="g-cap" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#5b6168"/><stop offset="1" stop-color="#1c1e21"/></radialGradient>
<radialGradient id="g-mesh" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#9aa0a6"/><stop offset="1" stop-color="#5f656c"/></radialGradient>
<pattern id="p-mesh" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#7d838a"/><circle cx="1.5" cy="1.5" r=".9" fill="#2d3136"/></pattern>
<pattern id="p-knurl" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#cfd4d9"/><path d="M0 3L3 0" stroke="#8b939b" stroke-width=".8"/></pattern>
<filter id="f-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.6" stdDeviation="1.6" flood-color="#000" flood-opacity=".28"/></filter>
<filter id="f-blur"><feGaussianBlur stdDeviation="3"/></filter>
`;

export function installDefs(svg) {
  const d = el("defs", {}, svg);
  d.innerHTML = DEFS;
  return d;
}

// Ножка вывода (металл с бликом)
export function lead(g, x1, y1, x2, y2, w = 2.2) {
  const vertical = Math.abs(x2 - x1) < Math.abs(y2 - y1);
  return el("line", { x1, y1, x2, y2, stroke: vertical ? "url(#g-leadv)" : "url(#g-lead)", "stroke-width": w, "stroke-linecap": "round" }, g);
}
export function label(g, x, y, text, size = 9, color = "#334155", anchor = "middle", weight = 400, family = "Inter, 'Segoe UI', Arial, sans-serif") {
  const t = el("text", { x, y, "font-size": size, fill: color, "text-anchor": anchor, "font-family": family, "font-weight": weight }, g);
  t.textContent = text;
  return t;
}
export const mono = "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace";

// Печатная плата модуля: цвет, скругление, крепежные отверстия
export function pcb(g, x, y, w, h, color = "#1d5fa8", opts = {}) {
  el("rect", { x, y, width: w, height: h, rx: opts.rx ?? 3, fill: color, stroke: shade(color, -0.35), "stroke-width": 1, filter: opts.shadow === false ? null : "url(#f-shadow)" }, g);
  el("rect", { x: x + 1, y: y + 1, width: w - 2, height: h - 2, rx: Math.max(0, (opts.rx ?? 3) - 1), fill: "none", stroke: shade(color, 0.25), "stroke-width": 0.6, opacity: 0.5 }, g);
  for (const [hx, hy] of opts.holes || []) {
    el("circle", { cx: hx, cy: hy, r: 3.6, fill: "url(#g-gold)" }, g);
    el("circle", { cx: hx, cy: hy, r: 2.2, fill: "#f8f8f8" }, g);
  }
}
// Штыревой разъем (черная пластиковая планка и квадратные контакты)
export function header(g, x, y, n, opts = {}) {
  const dir = opts.vertical ? [0, P] : [P, 0];
  const w = opts.vertical ? P - 1 : n * P - 1, h = opts.vertical ? n * P - 1 : P - 1;
  el("rect", { x: x - P / 2 + 0.5, y: y - P / 2 + 0.5, width: w, height: h, rx: 1.2, fill: opts.female ? "url(#g-header)" : "url(#g-header)" }, g);
  for (let i = 0; i < n; i++) {
    const cx = x + dir[0] * i, cy = y + dir[1] * i;
    if (opts.female) el("rect", { x: cx - 2.6, y: cy - 2.6, width: 5.2, height: 5.2, fill: "#050506" }, g);
    else el("rect", { x: cx - 2.4, y: cy - 2.4, width: 4.8, height: 4.8, rx: 0.4, fill: "url(#g-gold)", stroke: "#8a6a1e", "stroke-width": 0.4 }, g);
  }
}
// Микросхема в корпусе DIP
export function dip(g, x, y, n, text = "", w = 3) {
  const half = n / 2, L = half * P;
  el("rect", { x: x - 0.4 * P, y: y - 0.45 * P, width: L - 0.2 * P, height: w * P - 0.1 * P, rx: 1.5, fill: "url(#g-ic)", filter: "url(#f-shadow)" }, g);
  el("path", { d: `M ${x - 0.4 * P} ${y + w * P / 2 - 0.55 * P} a 4 4 0 0 1 0 8`, fill: "#111", opacity: 0.8 }, g);
  for (let i = 0; i < half; i++) {
    el("rect", { x: x + i * P - 2, y: y - 0.75 * P, width: 4, height: 0.32 * P, fill: "url(#g-metalh)" }, g);
    el("rect", { x: x + i * P - 2, y: y + w * P - 0.62 * P, width: 4, height: 0.32 * P, fill: "url(#g-metalh)" }, g);
  }
  if (text) label(g, x + L / 2 - 0.5 * P, y + w * P / 2 - 0.45 * P + 3, text, 7, "#c9cdd2", "middle", 500, mono);
}
// Кнопка тактовая 6x6 мм
export function tact(g, cx, cy, size = 6 * MM, capColor = "#1c1d20") {
  el("rect", { x: cx - size / 2, y: cy - size / 2, width: size, height: size, rx: 1, fill: "url(#g-metal)", stroke: "#6b7280", "stroke-width": 0.6 }, g);
  return el("circle", { cx, cy, r: size * 0.3, fill: capColor, stroke: "#000", "stroke-width": 0.5, class: "lab-press" }, g);
}
// Светодиод SMD на модуле
export function smdLed(g, x, y, color = "#ef4444") {
  el("rect", { x: x - 3, y: y - 2, width: 6, height: 4, rx: 0.6, fill: "#f3f4f6", stroke: "#9ca3af", "stroke-width": 0.4 }, g);
  const dot = el("rect", { x: x - 1.6, y: y - 1.2, width: 3.2, height: 2.4, fill: color, opacity: 0.25 }, g);
  const glow = el("circle", { cx: x, cy: y, r: 8, fill: color, opacity: 0, filter: "url(#f-blur)" }, g);
  return { dot, glow, set(on) { dot.setAttribute("opacity", on ? 1 : 0.25); glow.setAttribute("opacity", on ? 0.75 : 0); } };
}
// SMD-резистор/конденсатор (декор)
export function smd(g, x, y, kind = "r", rot = 0) {
  const gg = el("g", { transform: `translate(${x} ${y}) rotate(${rot})` }, g);
  el("rect", { x: -4, y: -2, width: 8, height: 4, fill: kind === "r" ? "#1f2023" : "#c7a77a" }, gg);
  el("rect", { x: -4, y: -2, width: 1.6, height: 4, fill: "url(#g-metalh)" }, gg);
  el("rect", { x: 2.4, y: -2, width: 1.6, height: 4, fill: "url(#g-metalh)" }, gg);
}

export function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (c) => Math.max(0, Math.min(255, Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k)));
  r = f(r); g = f(g); b = f(b);
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

// Цвета светодиодов: прямое напряжение и свечение
export const LED_COLORS = {
  red: { fill: "#e5383b", body: "#ff6b6b", glow: "#ff3b30", vf: 1.8, label: "Красный" },
  yellow: { fill: "#f4c20d", body: "#ffe066", glow: "#ffd60a", vf: 2.0, label: "Желтый" },
  green: { fill: "#2fb36b", body: "#69db7c", glow: "#30d158", vf: 2.1, label: "Зеленый" },
  blue: { fill: "#2f6fe0", body: "#74a7ff", glow: "#2b7bff", vf: 3.0, label: "Синий" },
  white: { fill: "#e9ecef", body: "#f8f9fa", glow: "#ffffff", vf: 3.0, label: "Белый" },
  orange: { fill: "#f08c00", body: "#ffa94d", glow: "#ff922b", vf: 2.0, label: "Оранжевый" },
};
export const LED_RS = 12, LED_FULL = 0.015, LED_BURN = 0.04;

export const RESISTOR_VALUES = [10, 47, 100, 150, 220, 330, 470, 680, 1000, 2200, 3300, 4700, 10000, 22000, 47000, 100000, 1000000];
export function fmtOhm(r) {
  if (r >= 1e6) return (r / 1e6).toString().replace(".", ",") + " МОм";
  if (r >= 1000) return (r / 1000).toString().replace(".", ",") + " кОм";
  return r + " Ом";
}
export const BAND = ["#111111", "#7c3f12", "#d62828", "#f77f00", "#f4d000", "#2b9348", "#1d4ed8", "#7b2cbf", "#8d99ae", "#ffffff"];
export function bands(r) {
  const exp = Math.floor(Math.log10(r)) - 1;
  const digits = Math.round(r / 10 ** exp);
  return [Math.floor(digits / 10), digits % 10, Math.max(0, exp)];
}

/** Положение вывода с учетом поворота детали (на 0/90/180/270 градусов). */
export function pinPos(part, pin) {
  const r = ((part.rot || 0) % 360 + 360) % 360;
  let { x, y } = pin;
  if (r === 90) [x, y] = [-y, x];
  else if (r === 180) [x, y] = [-x, -y];
  else if (r === 270) [x, y] = [y, -x];
  return { x: part.x + x, y: part.y + y };
}

// Ряд выводов модуля снизу: имена слева направо с шагом P
export const row = (names, y = 0, x0 = 0, extra = {}) => names.map((name, i) => ({ name, x: x0 + i * P, y, ...(extra[name] ? { title: extra[name] } : {}) }));
