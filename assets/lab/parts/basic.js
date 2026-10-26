// Макетные платы, пассивные компоненты, полупроводники, индикация, кнопки, питание, мультиметр.
import { P, MM, el, lead, label, mono, pcb, LED_COLORS, LED_RS, LED_FULL, LED_BURN, fmtOhm, BAND, bands, shade } from "./core.js";

// ───────────────── Макетные платы ─────────────────
function makeBreadboard(cols) {
  const ROWS = { tp: 1, tn: 2, a: 4, b: 5, c: 6, d: 7, e: 8, f: 11, g: 12, h: 13, i: 14, j: 15, bp: 17, bn: 18 };
  const pins = [];
  for (const [r, y] of Object.entries(ROWS)) {
    for (let c = 0; c < cols; c++) {
      const rail = r.length === 2;
      if (rail && (c + 1) % 6 === 0 && cols > 40) continue; // у полноразмерной платы шины разбиты на группы по 5
      pins.push({ name: `${r}${c + 1}`, x: (c + 1) * P, y: y * P, hole: true });
    }
  }
  const W = (cols + 1) * P, H = 19 * P;
  return {
    title: cols > 40 ? "Макетная плата 830 точек" : "Макетная плата 400 точек", group: "Макетирование", w: W, h: H, layer: 0, kind3d: "breadboard",
    desc: "Отверстия a-e и f-j каждой колонки соединены внутри, шины + и - идут вдоль всей платы.",
    pins: () => pins,
    render(g) {
      el("rect", { x: 0, y: 0, width: W, height: H, rx: 5, fill: "#f6f3ec", stroke: "#d8d2c6", filter: "url(#f-shadow)" }, g);
      el("rect", { x: 2, y: 2, width: W - 4, height: 3, rx: 1.5, fill: "#fff", opacity: 0.8 }, g);
      el("rect", { x: P / 2, y: 9.15 * P, width: cols * P, height: 1.7 * P, rx: 2, fill: "#e8e3d8", stroke: "#ddd6c8" }, g);
      for (const [y, color] of [[0.55, "#d62828"], [2.45, "#1d4ed8"], [16.55, "#d62828"], [18.45, "#1d4ed8"]]) {
        el("line", { x1: P * 0.8, y1: y * P, x2: W - P * 0.8, y2: y * P, stroke: color, "stroke-width": 1.4, opacity: 0.85 }, g);
      }
      for (const [s, y, c] of [["+", 1, "#d62828"], ["-", 2, "#1d4ed8"], ["+", 17, "#d62828"], ["-", 18, "#1d4ed8"]]) { label(g, P * 0.32, y * P + 3, s, 9, c, "middle", 600); label(g, W - P * 0.32, y * P + 3, s, 9, c, "middle", 600); }
      for (const [r, y] of Object.entries(ROWS)) if (r.length === 1) { label(g, P * 0.35, y * P + 2.5, r, 6.5, "#9a9284"); label(g, W - P * 0.35, y * P + 2.5, r, 6.5, "#9a9284"); }
      for (let c = 1; c <= cols; c++) if (c === 1 || c % 5 === 0) { label(g, c * P, 3.25 * P, String(c), 6, "#9a9284"); label(g, c * P, 16.1 * P, String(c), 6, "#9a9284"); }
      for (const p of pins) {
        el("rect", { x: p.x - 2.6, y: p.y - 2.6, width: 5.2, height: 5.2, rx: 0.8, fill: "#2a2621" }, g);
        el("rect", { x: p.x - 2.6, y: p.y - 2.6, width: 5.2, height: 1.2, rx: 0.6, fill: "#5b544a" }, g);
      }
    },
    links(pinKey) {
      const out = [];
      for (let c = 1; c <= cols; c++) {
        for (const r of "bcde") out.push([pinKey(`a${c}`), pinKey(`${r}${c}`)]);
        for (const r of "ghij") out.push([pinKey(`f${c}`), pinKey(`${r}${c}`)]);
      }
      const railPins = pins.filter((p) => /^(tp|tn|bp|bn)/.test(p.name));
      const first = {};
      for (const p of railPins) { const r = p.name.slice(0, 2); if (!first[r]) first[r] = p.name; else out.push([pinKey(first[r]), pinKey(p.name)]); }
      return out;
    },
  };
}

// ───────────────── Светодиод 5 мм ─────────────────
function ledBody(g, x, y, c, w = P + 4) {
  // y - уровень основания линзы; линза вверх
  const r = w / 2;
  el("rect", { x: x - r - 1.5, y: y - 3, width: w + 3, height: 3, rx: 1, fill: c.fill, opacity: 0.95 }, g);
  el("path", { d: `M ${x - r} ${y - 3} v ${-1.15 * P} a ${r} ${r} 0 0 1 ${w} 0 v ${1.15 * P} z`, fill: c.body, opacity: 0.88, stroke: shade(c.fill, -0.25), "stroke-width": 0.6 }, g);
  el("path", { d: `M ${x - r} ${y - 3} v ${-1.15 * P} a ${r} ${r} 0 0 1 ${w} 0 v ${1.15 * P} z`, fill: "url(#g-dome)" }, g);
  // кристалл и рамка внутри
  el("path", { d: `M ${x - 3} ${y - 6} v -7 h 3 l 3 3 v 4`, fill: "none", stroke: shade(c.fill, -0.45), "stroke-width": 1.2, opacity: 0.7 }, g);
}

const led = {
  title: "Светодиод 5 мм", group: "Индикация", props: { color: "red" }, kind3d: "led",
  desc: "Длинная ножка - анод (+), короткая - катод (-), со стороны среза на ободке. Нужен резистор 220-330 Ом.",
  selects: [{ prop: "color", label: "Цвет", options: () => Object.entries(LED_COLORS).map(([k, c]) => [k, c.label]), rerender: true }],
  pins: () => [{ name: "A", x: P, y: 0, title: "анод (+, длинная ножка)" }, { name: "K", x: 0, y: 0, title: "катод (-, короткая ножка)" }],
  render(g, part) {
    const c = LED_COLORS[part.props.color] || LED_COLORS.red;
    lead(g, 0, 0, 0, -1.1 * P); lead(g, P, 0, P, -0.7 * P); lead(g, P, -0.7 * P, P - 2, -1.1 * P);
    part.$glow = el("circle", { cx: P / 2, cy: -2.1 * P, r: 22, fill: c.glow, opacity: 0, filter: "url(#f-blur)" }, g);
    ledBody(g, P / 2, -1.05 * P, c);
    part.$core = el("circle", { cx: P / 2, cy: -2 * P, r: 5, fill: "#fff", opacity: 0 }, g);
    part.$burn = label(g, P / 2, -3.3 * P, "", 9, "#c92a2a", "middle", 600);
  },
  update(part, st) {
    const s = st.diodes[part.id] || { i: 0 };
    if (s.i > LED_BURN) part.burnt = true;
    const b = part.burnt ? 0 : Math.min(1, (s.i / LED_FULL) * (st.duty?.[part.id] ?? 1));
    part.brightness = b;
    part.$glow.setAttribute("opacity", (b * 0.9).toFixed(2));
    part.$core.setAttribute("opacity", (b * 0.8).toFixed(2));
    part.$burn.textContent = part.burnt ? "сгорел" : "";
  },
  info: (part) => (LED_COLORS[part.props.color] || LED_COLORS.red).label + ", прямое напряжение " + String((LED_COLORS[part.props.color] || LED_COLORS.red).vf).replace(".", ",") + " В",
  model: (part, n) => part.burnt ? [] : [{ type: "D", a: n("A"), k: n("K"), vf: (LED_COLORS[part.props.color] || LED_COLORS.red).vf, rs: LED_RS, key: part.id }],
};

const rgbled = {
  title: "RGB-светодиод", group: "Индикация", props: { common: "K" }, kind3d: "rgbled",
  desc: "Три кристалла в одном корпусе. Самая длинная ножка - общий катод (или анод у варианта с общим анодом).",
  selects: [{ prop: "common", label: "Тип", options: () => [["K", "Общий катод (-)"], ["A", "Общий анод (+)"]], rerender: true }],
  pins: () => [{ name: "R", x: 0, y: 0 }, { name: "COM", x: P, y: 0, title: "общий вывод (самая длинная ножка)" }, { name: "G", x: 2 * P, y: 0 }, { name: "B", x: 3 * P, y: 0 }],
  render(g, part) {
    for (let i = 0; i < 4; i++) lead(g, i * P, 0, i * P, -1.1 * P);
    part.$glow = el("circle", { cx: 1.5 * P, cy: -2.3 * P, r: 26, fill: "#000", opacity: 0, filter: "url(#f-blur)" }, g);
    el("rect", { x: -3, y: -1.1 * P - 3, width: 3 * P + 6, height: 3, rx: 1, fill: "#e9ecef" }, g);
    el("path", { d: `M ${-2} ${-1.1 * P - 3} v ${-1.1 * P} a ${1.5 * P + 2} ${1.3 * P} 0 0 1 ${3 * P + 4} 0 v ${1.1 * P} z`, fill: "#f1f3f5", opacity: 0.9, stroke: "#adb5bd", "stroke-width": 0.6 }, g);
    el("path", { d: `M ${-2} ${-1.1 * P - 3} v ${-1.1 * P} a ${1.5 * P + 2} ${1.3 * P} 0 0 1 ${3 * P + 4} 0 v ${1.1 * P} z`, fill: "url(#g-dome)" }, g);
    part.$core = el("circle", { cx: 1.5 * P, cy: -2.3 * P, r: 8, fill: "#fff", opacity: 0 }, g);
    for (const [t, x] of [["R", 0], [part.props.common === "A" ? "+" : "-", P], ["G", 2 * P], ["B", 3 * P]]) label(g, x, 10, t, 7, "#495057");
  },
  update(part, st) {
    const ch = ["r", "g", "b"].map((c) => { const s = st.diodes[`${part.id}:${c}`] || { i: 0 }; return Math.min(1, (s.i / LED_FULL) * (st.duty?.[`${part.id}:${c}`] ?? 1)); });
    const m = Math.max(...ch);
    part.brightness = m; part.rgb = ch;
    const col = `rgb(${ch.map((x) => Math.round(255 * (m ? x / m : 0))).join(",")})`;
    part.$glow.setAttribute("fill", col); part.$glow.setAttribute("opacity", (m * 0.95).toFixed(2));
    part.$core.setAttribute("fill", col); part.$core.setAttribute("opacity", (m * 0.9).toFixed(2));
  },
  model: (part, n) => {
    const ca = part.props.common === "A";
    const d = (pin, vf, k) => (ca ? { type: "D", a: n("COM"), k: n(pin), vf, rs: LED_RS, key: `${part.id}:${k}` } : { type: "D", a: n(pin), k: n("COM"), vf, rs: LED_RS, key: `${part.id}:${k}` });
    return [d("R", 1.8, "r"), d("G", 2.1, "g"), d("B", 3.0, "b")];
  },
};

// Светодиодная шкала 10 сегментов (корпус DIP-20)
const ledbar = {
  title: "Светодиодная шкала (10)", group: "Индикация", kind3d: "module", h3: 8,
  desc: "Десять светодиодов в одном корпусе: верхний ряд - аноды, нижний - катоды.",
  pins: () => [...Array.from({ length: 10 }, (_, i) => ({ name: "A" + (i + 1), x: i * P, y: 0, title: "анод " + (i + 1) })), ...Array.from({ length: 10 }, (_, i) => ({ name: "K" + (i + 1), x: i * P, y: 3 * P, title: "катод " + (i + 1) }))],
  render(g, part) {
    el("rect", { x: -0.45 * P, y: 0.35 * P, width: 9.9 * P, height: 2.3 * P, rx: 1.5, fill: "url(#g-black)", filter: "url(#f-shadow)" }, g);
    part.$seg = [];
    for (let i = 0; i < 10; i++) part.$seg.push(el("rect", { x: i * P - 4, y: 0.65 * P, width: 8, height: 1.7 * P, rx: 1, fill: "#3b1416" }, g));
  },
  update(part, st) {
    part.$seg.forEach((s, i) => { const d = st.diodes[`${part.id}:${i}`] || { i: 0 }; const b = Math.min(1, d.i / LED_FULL * (st.duty?.[`${part.id}:${i}`] ?? 1)); s.setAttribute("fill", b > 0.05 ? `rgba(255,${60 + 60 * b},40,${0.4 + 0.6 * b})` : "#3b1416"); });
  },
  model: (part, n) => Array.from({ length: 10 }, (_, i) => ({ type: "D", a: n("A" + (i + 1)), k: n("K" + (i + 1)), vf: 2.0, rs: LED_RS, key: `${part.id}:${i}` })),
};

// ───────────────── Пассивные ─────────────────
const resistor = {
  title: "Резистор", group: "Пассивные", props: { r: 220 }, kind3d: "resistor",
  desc: "Ограничивает ток. Номинал читается по цветным полоскам: две цифры и множитель.",
  selects: [{ prop: "r", label: "Сопротивление", options: () => [10, 47, 100, 150, 220, 330, 470, 680, 1000, 2200, 3300, 4700, 10000, 22000, 47000, 100000, 1000000].map((v) => [v, fmtOhm(v)]), rerender: true, num: true }],
  pins: () => [{ name: "1", x: 0, y: 0 }, { name: "2", x: 4 * P, y: 0 }],
  render(g, part) {
    lead(g, 0, 0, 4 * P, 0, 2);
    el("path", { d: `M ${0.8 * P} -4.6 q 0 -1.6 3 -1.6 h ${2.4 * P - 6} q 3 0 3 1.6 v 9.2 q 0 1.6 -3 1.6 h ${-2.4 * P + 6} q -3 0 -3 -1.6 z`, fill: "url(#g-resistor)", stroke: "#8b6f43", "stroke-width": 0.6 }, g);
    const [d1, d2, m] = bands(part.props.r);
    [d1, d2, m].forEach((b, i) => el("rect", { x: 1.2 * P + i * 7.5, y: -6.2, width: 3.6, height: 12.4, fill: BAND[b], opacity: 0.95 }, g));
    el("rect", { x: 2.85 * P, y: -6.2, width: 3.6, height: 12.4, fill: "#c99a2e" }, g);
    el("rect", { x: 0.8 * P + 3, y: -4.4, width: 2.4 * P - 6, height: 2.2, rx: 1, fill: "#fff", opacity: 0.35 }, g);
  },
  info: (part) => fmtOhm(part.props.r) + ", 0,25 Вт",
  model: (part, n) => [{ type: "R", a: n("1"), b: n("2"), r: part.props.r, key: part.id }],
};

const capacitor = {
  title: "Конденсатор керамический", group: "Пассивные", props: { c: "100n" }, kind3d: "capceramic",
  desc: "Сглаживает помехи по питанию. В симуляции постоянного тока не проводит ток.",
  selects: [{ prop: "c", label: "Емкость", options: () => [["10n", "10 нФ (103)"], ["100n", "100 нФ (104)"], ["1u", "1 мкФ (105)"]], rerender: true }],
  pins: () => [{ name: "1", x: 0, y: 0 }, { name: "2", x: P, y: 0 }],
  render(g, part) {
    lead(g, 0, 0, 0, -0.8 * P); lead(g, P, 0, P, -0.8 * P);
    el("ellipse", { cx: P / 2, cy: -1.45 * P, rx: 0.75 * P, ry: 0.65 * P, fill: "#e9a23b", stroke: "#a86d18", "stroke-width": 0.7 }, g);
    el("ellipse", { cx: P / 2 - 3, cy: -1.7 * P, rx: 4, ry: 2.5, fill: "#fff", opacity: 0.35 }, g);
    label(g, P / 2, -1.3 * P, { "10n": "103", "100n": "104", "1u": "105" }[part.props.c], 6.5, "#5c3a08", "middle", 600, mono);
  },
  model: () => [],
};

const electrolytic = {
  title: "Конденсатор электролитический", group: "Пассивные", props: { c: "100u" }, kind3d: "capelectro",
  desc: "Большая емкость для питания моторов и сервоприводов. Полярный: полоса - минус.",
  selects: [{ prop: "c", label: "Емкость", options: () => [["10u", "10 мкФ"], ["100u", "100 мкФ"], ["470u", "470 мкФ"], ["1000u", "1000 мкФ"]], rerender: true }],
  pins: () => [{ name: "+", x: 0, y: 0 }, { name: "-", x: P, y: 0 }],
  render(g, part) {
    lead(g, 0, 0, 0, -0.6 * P); lead(g, P, 0, P, -0.6 * P);
    el("rect", { x: -0.35 * P, y: -2.9 * P, width: 1.7 * P, height: 2.3 * P, rx: 4, fill: "#1f3a8a", stroke: "#10235a" }, g);
    el("rect", { x: 0.85 * P, y: -2.9 * P, width: 0.5 * P, height: 2.3 * P, fill: "#c8d3f0", opacity: 0.85 }, g);
    for (let i = 0; i < 3; i++) label(g, 1.1 * P, -2.35 * P + i * 8, "-", 8, "#1f3a8a", "middle", 700);
    el("rect", { x: -0.35 * P + 2, y: -2.9 * P + 1, width: 3, height: 2.3 * P - 2, rx: 1.5, fill: "#fff", opacity: 0.25 }, g);
    label(g, 0.25 * P, -1.5 * P, part.props.c.replace("u", "µ"), 6, "#dbe4ff", "middle", 600);
  },
  model: (part, n) => [{ type: "R", a: n("+"), b: n("-"), r: 5e6 }],
};

const diode = {
  title: "Диод 1N4007", group: "Полупроводники", kind3d: "diode",
  desc: "Пропускает ток от анода к катоду (сторона с полоской). Защищает схему от ЭДС мотора и реле.",
  pins: () => [{ name: "A", x: 0, y: 0, title: "анод" }, { name: "K", x: 3 * P, y: 0, title: "катод (полоска)" }],
  render(g) {
    lead(g, 0, 0, 3 * P, 0, 2);
    el("rect", { x: 0.85 * P, y: -5, width: 1.3 * P, height: 10, rx: 2.5, fill: "url(#g-black)" }, g);
    el("rect", { x: 1.85 * P, y: -5, width: 3.5, height: 10, fill: "#cfd4da" }, g);
  },
  model: (part, n) => [{ type: "D", a: n("A"), k: n("K"), vf: 0.7, rs: 0.3, key: part.id }],
};

function to92(g, text) {
  el("path", { d: `M ${-5} ${-0.8 * P} h ${2 * P + 10} v ${-1.2 * P} a ${P + 5} ${P} 0 0 0 ${-2 * P - 10} 0 z`, fill: "url(#g-black)", filter: "url(#f-shadow)" }, g);
  label(g, P, -1.35 * P, text, 6.5, "#d0d4d9", "middle", 500, mono);
}
const npn = {
  title: "Транзистор NPN 2N2222", group: "Полупроводники", kind3d: "to92",
  desc: "Небольшой ток базы открывает путь коллектор-эмиттер: так Arduino включает мотор или лампу.",
  pins: () => [{ name: "E", x: 0, y: 0, title: "эмиттер" }, { name: "B", x: P, y: 0, title: "база" }, { name: "C", x: 2 * P, y: 0, title: "коллектор" }],
  render(g) {
    for (let i = 0; i < 3; i++) lead(g, i * P, 0, i * P, -0.8 * P);
    to92(g, "2N2222");
    label(g, 0, 10, "E", 7, "#495057"); label(g, P, 10, "B", 7, "#495057"); label(g, 2 * P, 10, "C", 7, "#495057");
  },
  info: () => "E - эмиттер, B - база, C - коллектор. Коэффициент усиления около 100.",
  model: (part, n) => [{ type: "Q", b: n("B"), c: n("C"), e: n("E"), beta: 100, key: part.id }],
};
const mosfet = {
  title: "MOSFET IRLZ44N", group: "Полупроводники", kind3d: "to220",
  desc: "Мощный полевой транзистор с логическим уровнем: 5 В на затворе открывают ток до десятков ампер.",
  pins: () => [{ name: "G", x: 0, y: 0, title: "затвор" }, { name: "D", x: P, y: 0, title: "сток" }, { name: "S", x: 2 * P, y: 0, title: "исток" }],
  render(g) {
    for (let i = 0; i < 3; i++) lead(g, i * P, 0, i * P, -1.0 * P, 2.6);
    el("rect", { x: -0.6 * P, y: -4.6 * P, width: 3.2 * P, height: 1.6 * P, rx: 1, fill: "url(#g-metal)", stroke: "#868e96", "stroke-width": 0.6 }, g);
    el("circle", { cx: P, cy: -3.9 * P, r: 4.5, fill: "#495057" }, g);
    el("rect", { x: -0.6 * P, y: -3.1 * P, width: 3.2 * P, height: 2.2 * P, rx: 1, fill: "url(#g-black)", filter: "url(#f-shadow)" }, g);
    label(g, P, -2.05 * P, "IRLZ44N", 6.5, "#d0d4d9", "middle", 500, mono);
    label(g, 0, 10, "G", 7, "#495057"); label(g, P, 10, "D", 7, "#495057"); label(g, 2 * P, 10, "S", 7, "#495057");
  },
  // Затвор: напряжение затвор-исток открывает канал (сопротивление падает до 0,03 Ом выше 2,5 В)
  model(part, n) {
    const vgs = part.$vgs ?? 0;
    const r = vgs > 2.5 ? 0.03 : vgs > 1.2 ? 30 / (vgs - 1.1) : 1e8;
    return [{ type: "R", a: n("G"), b: n("S"), r: 1e7 }, { type: "R", a: n("D"), b: n("S"), r }];
  },
  after(part, v) { part.$vgs = v("G") - v("S"); },
};

// ───────────────── Ввод ─────────────────
const button = {
  title: "Кнопка тактовая", group: "Ввод", props: {}, kind3d: "button", interactive: "press",
  desc: "Пока кнопка нажата, ее выводы соединены. Обычно ставится между выводом платы и GND, а в коде - INPUT_PULLUP.",
  pins: () => [{ name: "1", x: 0, y: 0 }, { name: "2", x: 2 * P, y: 0 }],
  render(g, part) {
    for (const x of [0, 2 * P]) lead(g, x, 0, x, -0.5 * P, 2);
    el("rect", { x: -0.25 * P, y: -2.4 * P, width: 2.5 * P, height: 2 * P, rx: 1.5, fill: "url(#g-metal)", stroke: "#868e96", "stroke-width": 0.7, filter: "url(#f-shadow)" }, g);
    for (const [x, y] of [[0.1 * P, -2.05 * P], [1.9 * P, -2.05 * P], [0.1 * P, -0.75 * P], [1.9 * P, -0.75 * P]]) el("circle", { cx: x, cy: y, r: 1.6, fill: "#495057" }, g);
    el("circle", { cx: P, cy: -1.4 * P, r: 9, fill: "url(#g-black)" }, g);
    part.$cap = el("circle", { cx: P, cy: -1.4 * P, r: 7, fill: part.props.cap || "url(#g-cap)", stroke: "#000", "stroke-width": 0.6, class: "lab-press" }, g);
  },
  update(part) { part.$cap.setAttribute("r", part.pressed ? 5.6 : 7); },
  model: (part, n) => part.pressed ? [{ type: "R", a: n("1"), b: n("2"), r: 0.05 }] : [],
};

const sw = {
  title: "Переключатель движковый", group: "Ввод", props: { on: false }, kind3d: "switch", interactive: "toggle",
  desc: "Движковый переключатель: включенное положение замыкает выводы.",
  pins: () => [{ name: "1", x: 0, y: 0 }, { name: "2", x: 2 * P, y: 0 }],
  render(g, part) {
    for (const x of [0, 2 * P]) lead(g, x, 0, x, -0.5 * P, 2);
    el("rect", { x: -0.4 * P, y: -1.9 * P, width: 2.8 * P, height: 1.4 * P, rx: 1.5, fill: "url(#g-metal)", stroke: "#868e96", filter: "url(#f-shadow)" }, g);
    el("rect", { x: 0, y: -1.6 * P, width: 2 * P, height: 0.8 * P, rx: 1, fill: "#212529" }, g);
    part.$knob = el("rect", { x: 0, y: -1.75 * P, width: P, height: 1.1 * P, rx: 1.5, fill: "url(#g-black)", stroke: "#000", class: "lab-press" }, g);
  },
  update(part) { part.$knob.setAttribute("x", part.props.on ? P : 0); },
  info: (part) => (part.props.on ? "включен" : "выключен"),
  model: (part, n) => part.props.on ? [{ type: "R", a: n("1"), b: n("2"), r: 0.05 }] : [],
};

const pot = {
  title: "Потенциометр 10 кОм", group: "Ввод", props: { r: 10000, pos: 0.5 }, kind3d: "pot",
  desc: "Делитель напряжения: средний вывод (бегунок) дает напряжение от 0 до питания в зависимости от поворота ручки.",
  selects: [{ prop: "r", label: "Номинал", options: () => [[1000, "1 кОм"], [10000, "10 кОм"], [100000, "100 кОм"]], num: true }],
  pins: () => [{ name: "1", x: 0, y: 0 }, { name: "W", x: P, y: 0, title: "бегунок (средний вывод)" }, { name: "2", x: 2 * P, y: 0 }],
  render(g, part) {
    for (let i = 0; i < 3; i++) lead(g, i * P, 0, i * P, -0.6 * P, 2);
    el("rect", { x: -0.45 * P, y: -2.75 * P, width: 2.9 * P, height: 2.2 * P, rx: 2, fill: "#2b5fb3", stroke: "#18397a", filter: "url(#f-shadow)" }, g);
    el("circle", { cx: P, cy: -1.65 * P, r: 12.5, fill: "url(#g-white)", stroke: "#adb5bd", class: "lab-press" }, g);
    el("circle", { cx: P, cy: -1.65 * P, r: 9, fill: "url(#p-knurl)", class: "lab-press" }, g);
    part.$needle = el("line", { x1: P, y1: -1.65 * P, x2: P, y2: -1.65 * P - 9, stroke: "#212529", "stroke-width": 2.6, "stroke-linecap": "round" }, g);
  },
  update(part) {
    const a = (-135 + 270 * part.props.pos) * Math.PI / 180;
    part.$needle.setAttribute("x2", P + 10 * Math.sin(a)); part.$needle.setAttribute("y2", -1.65 * P - 10 * Math.cos(a));
  },
  interactive: "slider", sliderProp: "pos", sliderLabel: "Положение ручки",
  info: (part) => `${fmtOhm(part.props.r)}, ${Math.round(part.props.pos * 100)}%`,
  model: (part, n) => [
    { type: "R", a: n("1"), b: n("W"), r: Math.max(1, part.props.r * part.props.pos) },
    { type: "R", a: n("W"), b: n("2"), r: Math.max(1, part.props.r * (1 - part.props.pos)) },
  ],
};

const slidepot = {
  title: "Потенциометр движковый", group: "Ввод", props: { r: 10000, pos: 0.5 }, kind3d: "module", h3: 9,
  desc: "Линейный регулятор, как на микшерном пульте.",
  pins: () => [{ name: "1", x: 0, y: 0 }, { name: "W", x: P, y: 0, title: "бегунок" }, { name: "2", x: 2 * P, y: 0 }],
  render(g, part) {
    pcb(g, -2.5 * P, -2.6 * P, 7 * P, 2.1 * P, "#1c1d20");
    el("rect", { x: -2 * P, y: -1.65 * P, width: 6 * P, height: 4, rx: 2, fill: "#000" }, g);
    part.$knob = el("rect", { x: -2 * P, y: -2.3 * P, width: 0.9 * P, height: 1.5 * P, rx: 2, fill: "url(#g-white)", stroke: "#868e96", class: "lab-press" }, g);
    for (let i = 0; i < 3; i++) lead(g, i * P, 0, i * P, -0.5 * P, 2);
  },
  update(part) { part.$knob.setAttribute("x", -2 * P + part.props.pos * 5.1 * P); },
  interactive: "slider", sliderProp: "pos", sliderLabel: "Положение движка",
  model: pot.model,
};

const ldr = {
  title: "Фоторезистор", group: "Датчики", props: { light: 0.5 }, kind3d: "ldr",
  desc: "Сопротивление падает на свету: около 200 кОм в темноте и около 1 кОм на ярком свету.",
  pins: () => [{ name: "1", x: 0, y: 0 }, { name: "2", x: P, y: 0 }],
  render(g, part) {
    lead(g, 0, 0, 0, -P); lead(g, P, 0, P, -P);
    el("circle", { cx: P / 2, cy: -1.75 * P, r: 11, fill: "#f8f1e3", stroke: "#a8916a", class: "lab-press" }, g);
    el("path", { d: `M ${P / 2 - 7} ${-1.75 * P - 5} h 11 v 2.5 h -11 v 2.5 h 11 v 2.5 h -11 v 2.5 h 11`, stroke: "#b7410e", fill: "none", "stroke-width": 1.4 }, g);
    el("circle", { cx: P / 2, cy: -1.75 * P, r: 11, fill: "url(#g-dome)" }, g);
    part.$sun = el("circle", { cx: P / 2 + 16, cy: -2.9 * P, r: 6, fill: "#fcc419", filter: "url(#f-shadow)" }, g);
  },
  update(part) { part.$sun.setAttribute("opacity", (0.12 + 0.88 * part.props.light).toFixed(2)); },
  interactive: "slider", sliderProp: "light", sliderLabel: "Освещенность",
  resistance: (part) => Math.round(200000 * Math.pow(1000 / 200000, part.props.light)),
  info(part) { return `${Math.round(part.props.light * 100)}% света, ${fmtOhm(this.resistance(part))}`; },
  model(part, n) { return [{ type: "R", a: n("1"), b: n("2"), r: this.resistance(part) }]; },
};

const thermistor = {
  title: "Термистор NTC 10 кОм", group: "Датчики", props: { temp: 25 }, kind3d: "ldr",
  desc: "Сопротивление падает с ростом температуры: 10 кОм при 25 °C (B = 3950).",
  sliders: [{ prop: "temp", label: "Температура, °C", min: -20, max: 100, step: 1 }],
  pins: () => [{ name: "1", x: 0, y: 0 }, { name: "2", x: P, y: 0 }],
  render(g, part) {
    lead(g, 0, 0, P / 2 - 2, -1.2 * P, 1.6); lead(g, P, 0, P / 2 + 2, -1.2 * P, 1.6);
    el("ellipse", { cx: P / 2, cy: -1.6 * P, rx: 7, ry: 8, fill: "#1f1f1f", stroke: "#000" }, g);
    part.$t = label(g, P / 2, -2.6 * P, "", 8, "#c92a2a", "middle", 600);
  },
  update(part) { part.$t.textContent = `${part.props.temp} °C`; },
  resistance: (part) => Math.round(10000 * Math.exp(3950 * (1 / (part.props.temp + 273.15) - 1 / 298.15))),
  model(part, n) { return [{ type: "R", a: n("1"), b: n("2"), r: this.resistance(part) }]; },
};

// ───────────────── Звук ─────────────────
const buzzer = {
  title: "Пьезопищалка", group: "Индикация", kind3d: "buzzer",
  desc: "Пассивная: звучит на частоте ШИМ (tone()). От постоянного напряжения пищит на своей частоте около 2,3 кГц.",
  pins: () => [{ name: "+", x: 0, y: 0 }, { name: "-", x: 2 * P, y: 0 }],
  render(g, part) {
    lead(g, 0, 0, 0, -0.6 * P); lead(g, 2 * P, 0, 2 * P, -0.6 * P);
    el("circle", { cx: P, cy: -1.9 * P, r: 18, fill: "url(#g-black)", filter: "url(#f-shadow)" }, g);
    el("circle", { cx: P, cy: -1.9 * P, r: 15.5, fill: "none", stroke: "#3b3f45" }, g);
    el("circle", { cx: P, cy: -1.9 * P, r: 3.2, fill: "#0b0c0e" }, g);
    label(g, -5, -0.85 * P, "+", 10, "#e03131", "middle", 700);
    part.$wave = el("path", { d: `M ${P + 22} ${-2.6 * P} q 6 10 0 20 M ${P + 27} ${-2.9 * P} q 9 14 0 29`, stroke: "#f08c00", fill: "none", "stroke-width": 2, opacity: 0 }, g);
  },
  update(part, st) { part.$wave.setAttribute("opacity", st.tone?.[part.id] ? 1 : 0); },
  model: (part, n) => [{ type: "R", a: n("+"), b: n("-"), r: 1000, key: part.id }],
};

const seg7 = {
  title: "7-сегментный индикатор", group: "Индикация", kind3d: "module", h3: 8,
  desc: "Общий катод: COM на GND, сегменты a-g и точка через резисторы к выводам платы.",
  pins: () => {
    const top = ["g", "f", "COM", "a", "b"], bot = ["e", "d", "COM2", "c", "dp"];
    return [...top.map((nm, i) => ({ name: nm, x: i * P, y: 0 })), ...bot.map((nm, i) => ({ name: nm, x: i * P, y: 6 * P }))];
  },
  render(g, part) {
    el("rect", { x: -P / 2, y: P / 2, width: 5 * P, height: 5 * P, rx: 2, fill: "url(#g-black)", filter: "url(#f-shadow)" }, g);
    const S = { a: [0.95, 1.15, 2.1, 0], b: [3.2, 1.35, 0, 1.55], c: [3.05, 3.2, 0, 1.55], d: [0.75, 4.95, 2.1, 0], e: [0.65, 3.2, 0, 1.55], f: [0.8, 1.35, 0, 1.55], g: [0.85, 3.05, 2.1, 0] };
    part.$seg = {};
    for (const [k, [x, y, w, h]] of Object.entries(S)) {
      part.$seg[k] = el("rect", { x: x * P - 2, y: y * P - 2, width: w * P + 4 || 5, height: h * P + 4 || 5, rx: 2, fill: "#36181a", transform: `skewX(-6)` }, g);
    }
    part.$seg.dp = el("circle", { cx: 3.75 * P, cy: 5 * P, r: 2.6, fill: "#36181a" }, g);
  },
  update(part, st) {
    for (const [k, node] of Object.entries(part.$seg)) {
      const s = st.diodes[`${part.id}:${k}`] || { i: 0 };
      const on = s.i * (st.duty?.[`${part.id}:${k}`] ?? 1) > 0.002;
      node.setAttribute("fill", on ? "#ff4d4f" : "#36181a");
    }
  },
  links: (pinKey) => [[pinKey("COM"), pinKey("COM2")]],
  model: (part, n) => ["a", "b", "c", "d", "e", "f", "g", "dp"].map((s) => ({ type: "D", a: n(s), k: n("COM"), vf: 1.8, rs: 30, key: `${part.id}:${s}` })),
};

// ───────────────── Питание ─────────────────
const battery = {
  title: "Батарейка 9 В (Крона)", group: "Питание", props: { v: 9 }, kind3d: "battery9v",
  desc: "Источник питания. Красный провод - плюс.",
  selects: [{ prop: "v", label: "Напряжение", options: () => [[1.5, "1,5 В"], [3, "3 В (2 x AA)"], [4.5, "4,5 В"], [6, "6 В (4 x AA)"], [7.4, "7,4 В (2 x 18650)"], [9, "9 В"], [12, "12 В"]], num: true }],
  pins: () => [{ name: "+", x: 0, y: 0 }, { name: "-", x: 2 * P, y: 0 }],
  render(g, part) {
    el("path", { d: `M 0 0 C 0 ${-0.8 * P} 0 ${-0.8 * P} ${0.3 * P} ${-1.2 * P}`, stroke: "#e03131", "stroke-width": 2.6, fill: "none" }, g);
    el("path", { d: `M ${2 * P} 0 C ${2 * P} ${-0.8 * P} ${2 * P} ${-0.8 * P} ${1.7 * P} ${-1.2 * P}`, stroke: "#212529", "stroke-width": 2.6, fill: "none" }, g);
    el("rect", { x: -0.8 * P, y: -5.3 * P, width: 3.6 * P, height: 4.1 * P, rx: 3, fill: "url(#g-black)", filter: "url(#f-shadow)" }, g);
    el("rect", { x: -0.8 * P, y: -5.3 * P, width: 3.6 * P, height: 1.3 * P, rx: 3, fill: "#f59f00" }, g);
    el("rect", { x: -0.2 * P, y: -5.8 * P, width: 0.9 * P, height: 0.5 * P, rx: 1, fill: "url(#g-metal)" }, g);
    el("rect", { x: 1.2 * P, y: -5.8 * P, width: 0.9 * P, height: 0.5 * P, rx: 1, fill: "url(#g-metal)" }, g);
    part.$v = label(g, P, -2.6 * P, "", 12, "#f8f9fa", "middle", 700);
  },
  update(part) { part.$v.textContent = `${String(part.props.v).replace(".", ",")} В`; },
  info: (part) => `${String(part.props.v).replace(".", ",")} В`,
  model: (part, n) => [{ type: "V", p: n("+"), n: n("-"), v: part.props.v, r: 0.5, key: part.id }],
};

const aapack = {
  title: "Батарейный отсек 4 x AA", group: "Питание", props: { v: 6 }, kind3d: "module", h3: 15,
  desc: "Четыре пальчиковые батарейки последовательно: 6 В для моторов и сервоприводов.",
  pins: () => [{ name: "+", x: 0, y: 0 }, { name: "-", x: P, y: 0 }],
  render(g) {
    el("path", { d: `M 0 0 V ${-1.2 * P}`, stroke: "#e03131", "stroke-width": 2.6 }, g);
    el("path", { d: `M ${P} 0 V ${-1.2 * P}`, stroke: "#212529", "stroke-width": 2.6 }, g);
    el("rect", { x: -2.5 * P, y: -5.6 * P, width: 6 * P, height: 4.4 * P, rx: 3, fill: "url(#g-black)", filter: "url(#f-shadow)" }, g);
    for (let i = 0; i < 4; i++) {
      el("rect", { x: -2.2 * P + i * 1.4 * P, y: -5.3 * P, width: 1.2 * P, height: 3.8 * P, rx: 6, fill: "url(#g-metalh)" }, g);
      el("rect", { x: -2.2 * P + i * 1.4 * P, y: -5.3 * P + 6, width: 1.2 * P, height: 2.2 * P, fill: i % 2 ? "#2f9e44" : "#1971c2" }, g);
    }
  },
  model: (part, n) => [{ type: "V", p: n("+"), n: n("-"), v: 6, r: 0.4, key: part.id }],
};

const powermod = {
  title: "Модуль питания макетки (5 В / 3,3 В)", group: "Питание", props: { v: 5 }, kind3d: "module", h3: 10,
  desc: "Модуль MB102: от 9-12 В или USB дает стабильные 5 В или 3,3 В (перемычка). Ток до 700 мА.",
  selects: [{ prop: "v", label: "Выход", options: () => [[5, "5 В"], [3.3, "3,3 В"]], num: true }],
  pins: () => [{ name: "+", x: 0, y: 0, title: "выход +" }, { name: "-", x: P, y: 0, title: "выход -" }],
  render(g, part) {
    pcb(g, -1.5 * P, -4.6 * P, 4 * P, 4.1 * P, "#2b2d31");
    el("rect", { x: -1.3 * P, y: -4.4 * P, width: 1.6 * P, height: 1.3 * P, rx: 2, fill: "url(#g-black)" }, g);
    el("circle", { cx: -0.5 * P, cy: -3.75 * P, r: 4, fill: "#495057" }, g);
    el("rect", { x: 0.7 * P, y: -4.5 * P, width: 1.5 * P, height: 1.1 * P, rx: 1, fill: "url(#g-metal)" }, g);
    el("rect", { x: -1.1 * P, y: -2.6 * P, width: 1.4 * P, height: 0.9 * P, rx: 1, fill: "url(#g-ic)" }, g);
    label(g, 0.5 * P, -1.45 * P, `${String(part.props.v).replace(".", ",")} V`, 7, "#ced4da", "middle", 600);
    part.$led = el("circle", { cx: 1.9 * P, cy: -2.2 * P, r: 2.6, fill: "#37b24d" }, g);
    lead(g, 0, 0, 0, -0.6 * P, 2.4); lead(g, P, 0, P, -0.6 * P, 2.4);
  },
  model: (part, n) => [{ type: "V", p: n("+"), n: n("-"), v: part.props.v, r: 0.2, key: part.id }],
};

// ───────────────── Измерения ─────────────────
const meter = {
  title: "Мультиметр", group: "Измерения", props: { mode: "V" }, kind3d: "meter",
  desc: "Черный щуп - COM, красный - IN. Режимы: напряжение, ток (включается в разрыв цепи), сопротивление (без питания).",
  selects: [{ prop: "mode", label: "Режим", options: () => [["V", "Напряжение, В"], ["A", "Ток, мА"], ["R", "Сопротивление, Ом"]], rerender: true }],
  pins: () => [{ name: "COM", x: 0, y: 0, title: "черный щуп" }, { name: "IN", x: 3 * P, y: 0, title: "красный щуп" }],
  render(g, part) {
    el("rect", { x: -P, y: -6.6 * P, width: 5 * P, height: 6 * P, rx: 7, fill: "#f59f00", stroke: "#b35c00", filter: "url(#f-shadow)" }, g);
    el("rect", { x: -0.65 * P, y: -6.25 * P, width: 4.3 * P, height: 5.3 * P, rx: 5, fill: "#212529" }, g);
    el("rect", { x: -0.35 * P, y: -5.9 * P, width: 3.7 * P, height: 1.7 * P, rx: 2, fill: "#b8c99d" }, g);
    part.$val = label(g, 1.5 * P, -4.7 * P, "", 13, "#1b2410", "middle", 600, mono);
    el("circle", { cx: 1.5 * P, cy: -2.75 * P, r: 13, fill: "url(#g-black)", stroke: "#495057" }, g);
    part.$knob = el("line", { x1: 1.5 * P, y1: -2.75 * P, x2: 1.5 * P, y2: -2.75 * P - 11, stroke: "#f1f3f5", "stroke-width": 3, "stroke-linecap": "round" }, g);
    part.$mode = label(g, 1.5 * P, -1.25 * P, "", 8, "#f1f3f5");
    el("circle", { cx: 0, cy: -0.4 * P, r: 4.5, fill: "#111" }, g); el("circle", { cx: 3 * P, cy: -0.4 * P, r: 4.5, fill: "#e03131" }, g);
  },
  update(part, st) {
    const ang = { V: -40, A: 0, R: 40 }[part.props.mode] * Math.PI / 180;
    part.$knob.setAttribute("x2", 1.5 * P + 11 * Math.sin(ang)); part.$knob.setAttribute("y2", -2.75 * P - 11 * Math.cos(ang));
    part.$mode.textContent = { V: "V⎓", A: "mA", R: "Ω" }[part.props.mode];
    const m = st.meter?.[part.id];
    part.$val.textContent = m || "- - -";
  },
  info: (part) => ({ V: "напряжение", A: "ток", R: "сопротивление" }[part.props.mode]),
  model: (part, n) => part.props.mode === "A" ? [{ type: "R", a: n("IN"), b: n("COM"), r: 0.01, key: part.id }]
    : part.props.mode === "R" ? [{ type: "V", p: n("IN"), n: n("COM"), v: 1, r: 1000, key: part.id, meterR: true }]
      : [{ type: "R", a: n("IN"), b: n("COM"), r: 1e7, key: part.id }],
};

export const BASIC = {
  breadboard: makeBreadboard(30), breadboard_full: makeBreadboard(63),
  resistor, capacitor, electrolytic, diode, npn, mosfet,
  led, rgbled, ledbar, seg7, buzzer,
  button, switch: sw, pot, slidepot, ldr, thermistor,
  battery, aapack, powermod, meter,
};
