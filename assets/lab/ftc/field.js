// Поле FIRST Tech Challenge BIOBUZZ (2026-2027). Размеры и положения элементов сняты с официальной CAD-модели FIRST
// (Field CAD, STEP v26-27.2) и раздела 9 Competition Manual. Подсчет очков - по таблице раздела 10.
// Координаты в дюймах: начало в центре поля, +x - к синему альянсу (красный слева от зрителей), +y - к стене,
// дальней от зрителей. Курс 0 - робот смотрит в +y, положительный угол - против часовой стрелки.

export const HALF = 72;
export const TILE = 24;

export const ALLIANCES = {
  red: { name: "Красный", color: "#dc2626", light: "#fecaca", wallX: -HALF },
  blue: { name: "Синий", color: "#2563eb", light: "#bfdbfe", wallX: HALF },
};

// Рама улья: ноги A-образных рам. На высоте робота (до ~14 дюймов) мешают только нижние части ног у опор.
export const FRAME = { halfX: 24.6, halfY: 18.5, pivotHeight: 43.95, width: 49.46, depth: 38.95 };
export const FRAME_LEGS = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => ({
  x0: sx * 24.6, y0: sy * 18.5, x1: sx * 20.6, y1: sy * 12.6, r: 1.2,
}));

// Улей каждого альянса: две ячейки, одна смотрит вверх (в нее бросают), другая вниз. После TIP они меняются.
// Центры проекций ячеек на пол: верхняя ячейка ближе к оси поворота (10,8 дюйма), нижняя дальше (13,9).
export const HIVES = {
  red: { x0: -23.4, x1: -2.1, cx: -12.75, startUp: "aud" },
  blue: { x0: 2.1, x1: 23.4, cx: 12.75, startUp: "back" },
};
export const CELL = { up: 10.8, down: 13.9, halfW: 10, height: 55, upY: [1.6, 20.1], downY: [2.7, 25.2] };
export const TIP_AT = 6; // упрощение симулятора: столько элементов в верхней ячейке переворачивают улей

// 4 цветка на стенах. Отверстие сверху 4 дюйма на высоте 21,5, внизу окно для выемки пыльцы.
export const FLOWERS = [
  { id: 1, x: -23.4, y: 68.1, wall: "back" },
  { id: 2, x: 23.4, y: -68.1, wall: "aud" },
  { id: 3, x: -68.1, y: -23.4, wall: "red" },
  { id: 4, x: 68.1, y: 23.4, wall: "blue" },
];
export const FLOWER_SIZE = { along: 6.6, depth: 7.4, top: 21.5 };
export function flowerRect(f) {
  const a = FLOWER_SIZE.along / 2, d = FLOWER_SIZE.depth;
  if (f.wall === "back") return { x0: f.x - a, x1: f.x + a, y0: HALF - d, y1: HALF };
  if (f.wall === "aud") return { x0: f.x - a, x1: f.x + a, y0: -HALF, y1: -HALF + d };
  if (f.wall === "red") return { x0: -HALF, x1: -HALF + d, y0: f.y - a, y1: f.y + a };
  return { x0: HALF - d, x1: HALF, y0: f.y - a, y1: f.y + a };
}

// Зоны на полу (лента альянса)
export const LOADING = {
  red: { x0: -HALF, x1: -59.1, y0: 23.9, y1: 46.6 },
  blue: { x0: 59.1, x1: HALF, y0: -46.6, y1: -23.9 },
};
export const GARDEN = {
  red: { x0: -70.1, x1: -47.4, y0: -70.1, y1: -68.1 },
  blue: { x0: 47.4, x1: 70.1, y0: 68.1, y1: 70.1 },
};
// Лотки с NECTAR в зонах альянсов (за стеной поля)
export const TRAY = { red: { x0: -81.9, x1: -71.7, y0: -7.9, y1: 7.9 }, blue: { x0: 71.7, x1: 81.9, y0: -7.9, y1: 7.9 } };

export const POLLEN_R = 1.4, NECTAR_R = 1.8;

// Начальная расстановка (раздел 10 мануала): по 4 POLLEN в каждом цветке и в каждом саду, по 4 в каждом роботе,
// по 3 NECTAR в каждой верхней ячейке, по 5 NECTAR в каждой зоне альянса.
export function setupElements() {
  const field = [];
  for (const x of [-69.3, -66.4, -63.5, -60.6]) field.push({ kind: "pollen", x, y: -69.3 });
  for (const x of [69.3, 66.4, 63.5, 60.6]) field.push({ kind: "pollen", x, y: 69.3 });
  return {
    field,
    flowerStock: FLOWERS.map(() => ["pollen", "pollen", "pollen", "pollen"]),
    cells: { red: { up: ["red", "red", "red"], upSide: HIVES.red.startUp }, blue: { up: ["blue", "blue", "blue"], upSide: HIVES.blue.startUp } },
    trays: { red: 5, blue: 5 },
  };
}

// Сторона «aud» - ближе к зрителям (y < 0), «back» - дальняя (y > 0)
export function cellCenter(alliance, side, up) {
  const h = HIVES[alliance], d = up ? CELL.up : CELL.down;
  return { x: h.cx, y: side === "aud" ? -d : d };
}
export const otherSide = (s) => (s === "aud" ? "back" : "aud");

export const SCORE = { leave: 3, park: 5, tip: 20, cell: 2, bottomNectar: 5, flower: 2, garden: 1 };
export const MATCH = { auto: 30, transition: 8, teleop: 120, flowerOpen: 60 };
