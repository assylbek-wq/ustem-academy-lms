// Тренировочный мат USTEM для симулятора SPIKE Prime: 2362 x 1143 мм, как поле FLL Challenge.
// Это не мат сезона BIOGLOW: свое учебное поле с линиями, цветными зонами, линейкой, ящиком и рычагом.
// Координаты в миллиметрах: начало в левом нижнем углу, x вправо, y от нижнего борта (стороны домов).
// Одни и те же примитивы используются для отрисовки и для показаний датчика цвета.

export const MAT_W = 2362, MAT_H = 1143;

export const COLORS = {
  white: [246, 246, 240], black: [28, 28, 30], red: [214, 40, 40], blue: [37, 99, 235], green: [22, 160, 74],
  yellow: [250, 204, 21], homeL: [255, 237, 213], homeR: [219, 234, 254], orange: [234, 88, 12], gray: [203, 213, 225],
  zone: [226, 232, 240],
};

// Цвета SPIKE (модуль color)
export const SPIKE_COLOR = { BLACK: 0, MAGENTA: 1, PURPLE: 2, BLUE: 3, AZURE: 4, TURQUOISE: 5, GREEN: 6, YELLOW: 7, ORANGE: 8, RED: 9, WHITE: 10, UNKNOWN: -1 };

function curve(p0, p1, p2, p3, n = 40) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    pts.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]);
  }
  return pts;
}

export const LINE_CURVE = [...curve([450, 640], [700, 640], [800, 900], [1050, 900]),
  ...curve([1050, 900], [1300, 900], [1350, 640], [1600, 640]).slice(1),
  ...curve([1600, 640], [1800, 640], [1850, 820], [1900, 860]).slice(1)];

// Примитивы в порядке рисования: последний сверху
export const PRIMS = [
  { t: "rect", x0: 0, y0: 0, x1: 380, y1: 320, c: "homeL", label: "ДОМ: ЛЕВАЯ" },
  { t: "rect", x0: 1982, y0: 0, x1: MAT_W, y1: 320, c: "homeR", label: "ДОМ: ПРАВАЯ" },
  { t: "frame", x0: 0, y0: 0, x1: 380, y1: 320, w: 10, c: "orange" },
  { t: "frame", x0: 1982, y0: 0, x1: MAT_W, y1: 320, w: 10, c: "blue" },
  // линейка: стартовая линия и отметки через 10 см
  { t: "seg", a: [450, 60], b: [450, 300], w: 8, c: "black" },
  ...Array.from({ length: 11 }, (_, k) => ({ t: "seg", a: [550 + k * 100, 60], b: [550 + k * 100, k % 5 === 4 ? 140 : 100], w: 4, c: "black" })),
  { t: "seg", a: [450, 60], b: [1550, 60], w: 4, c: "black" },
  // длинная прямая линия
  { t: "seg", a: [450, 430], b: [2000, 430], w: 20, c: "black" },
  // кривая линия для езды по линии и финиш
  { t: "poly", pts: LINE_CURVE, w: 20, c: "black" },
  { t: "rect", x0: 1880, y0: 820, x1: 1990, y1: 930, c: "green" },
  // цветные квадраты
  { t: "rect", x0: 450, y0: 960, x1: 600, y1: 1110, c: "red" },
  { t: "rect", x0: 700, y0: 960, x1: 850, y1: 1110, c: "blue" },
  { t: "rect", x0: 950, y0: 960, x1: 1100, y1: 1110, c: "yellow" },
  { t: "rect", x0: 1200, y0: 960, x1: 1350, y1: 1110, c: "green" },
  // зона для ящика
  { t: "rect", x0: 1600, y0: 120, x1: 1850, y1: 320, c: "zone" },
  { t: "frame", x0: 1600, y0: 120, x1: 1850, y1: 320, w: 6, c: "gray" },
];

export const LABELS = [
  { x: 190, y: 290, text: "ДОМ: ЛЕВАЯ" }, { x: 2172, y: 290, text: "ДОМ: ПРАВАЯ" },
  { x: 1000, y: 30, text: "линейка: 10 см" }, { x: 1725, y: 100, text: "зона ящика" },
  { x: 1935, y: 960, text: "финиш" },
];

const segDist = (x, y, a, b) => {
  const vx = b[0] - a[0], vy = b[1] - a[1], L = vx * vx + vy * vy;
  const t = L ? Math.max(0, Math.min(1, ((x - a[0]) * vx + (y - a[1]) * vy) / L)) : 0;
  return Math.hypot(x - (a[0] + vx * t), y - (a[1] + vy * t));
};

export function distToPoly(x, y, pts) {
  let d = Infinity;
  for (let i = 1; i < pts.length; i++) d = Math.min(d, segDist(x, y, pts[i - 1], pts[i]));
  return d;
}

function hit(p, x, y) {
  if (p.t === "rect") return x >= p.x0 && x <= p.x1 && y >= p.y0 && y <= p.y1;
  if (p.t === "frame") {
    if (!(x >= p.x0 && x <= p.x1 && y >= p.y0 && y <= p.y1)) return false;
    return x - p.x0 < p.w || p.x1 - x < p.w || y - p.y0 < p.w || p.y1 - y < p.w;
  }
  if (p.t === "seg") return segDist(x, y, p.a, p.b) <= p.w / 2;
  if (p.t === "poly") return distToPoly(x, y, p.pts) <= p.w / 2;
  return false;
}

export function colorAt(x, y) {
  if (x < 0 || y < 0 || x > MAT_W || y > MAT_H) return COLORS.gray;
  let c = COLORS.white;
  for (const p of PRIMS) if (hit(p, x, y)) c = COLORS[p.c];
  return c;
}

// Пятно датчика: 64 точки «подсолнухом» в круге радиусом 7 мм. Точки не лежат рядами, поэтому отражение
// меняется плавно, когда датчик пересекает край линии под любым углом.
const SPOT = Array.from({ length: 64 }, (_, i) => {
  const r = 7 * Math.sqrt((i + 0.5) / 64), a = i * 2.399963;
  return [r * Math.cos(a), r * Math.sin(a)];
});
export function sampleSpot(x, y) {
  let r = 0, g = 0, b = 0;
  for (const [dx, dy] of SPOT) { const c = colorAt(x + dx, y + dy); r += c[0]; g += c[1]; b += c[2]; }
  const n = SPOT.length;
  return [r / n, g / n, b / n];
}

export function reflectionOf(rgb) {
  const lum = (0.3 * rgb[0] + 0.59 * rgb[1] + 0.11 * rgb[2]) / 255;
  return Math.max(0, Math.min(100, Math.round(lum * 97 + 1)));
}

export function spikeColorOf(rgb) {
  const [r, g, b] = rgb, mx = Math.max(r, g, b), mn = Math.min(r, g, b), v = mx / 255, s = mx ? (mx - mn) / mx : 0;
  if (v < 0.25) return SPIKE_COLOR.BLACK;
  if (s < 0.25) return v > 0.7 ? SPIKE_COLOR.WHITE : SPIKE_COLOR.UNKNOWN;
  let hdeg;
  if (mx === r) hdeg = (60 * ((g - b) / (mx - mn)) + 360) % 360;
  else if (mx === g) hdeg = 60 * ((b - r) / (mx - mn)) + 120;
  else hdeg = 60 * ((r - g) / (mx - mn)) + 240;
  if (hdeg < 15 || hdeg >= 340) return SPIKE_COLOR.RED;
  if (hdeg < 40) return SPIKE_COLOR.ORANGE;
  if (hdeg < 70) return SPIKE_COLOR.YELLOW;
  if (hdeg < 160) return SPIKE_COLOR.GREEN;
  if (hdeg < 200) return SPIKE_COLOR.AZURE;
  if (hdeg < 260) return SPIKE_COLOR.BLUE;
  return SPIKE_COLOR.MAGENTA;
}

export const rgbCss = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

// Отрисовка мата в контексте с уже настроенным преобразованием (мм, y вверх)
export function drawMat(ctx, textFn) {
  ctx.fillStyle = rgbCss(COLORS.white); ctx.fillRect(0, 0, MAT_W, MAT_H);
  for (const p of PRIMS) {
    const col = rgbCss(COLORS[p.c]);
    if (p.t === "rect") { ctx.fillStyle = col; ctx.fillRect(p.x0, p.y0, p.x1 - p.x0, p.y1 - p.y0); }
    else if (p.t === "frame") { ctx.strokeStyle = col; ctx.lineWidth = p.w; ctx.strokeRect(p.x0 + p.w / 2, p.y0 + p.w / 2, p.x1 - p.x0 - p.w, p.y1 - p.y0 - p.w); }
    else if (p.t === "seg" || p.t === "poly") {
      const pts = p.t === "seg" ? [p.a, p.b] : p.pts;
      ctx.strokeStyle = col; ctx.lineWidth = p.w; ctx.lineCap = p.t === "seg" ? "butt" : "round"; ctx.lineJoin = "round";
      ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke();
    }
  }
  if (textFn) for (const L of LABELS) textFn(L.text, L.x, L.y);
}
