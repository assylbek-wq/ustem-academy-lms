// Блоки SPIKE 3 Word Blocks (Blockly, рендер zelos как Scratch) и генератор Python для SPIKE 3.
// Категории, порядок, цвета, тексты и значения по умолчанию - как в приложении LEGO Education SPIKE 3 для
// SPIKE Prime (официальные русские строки приложения, без «е» с точками и длинного тире). Код из блоков - обычная
// программа SPIKE 3 на MicroPython: общая часть (скорости в %, сантиметры, события, подпрограммы) живет в модуле
// wb.py (wbpy.js), поэтому код блоков короткий: `await wb.move("forward", 10, "cm")`.
// Старые блоки spike_* (до Word Blocks) остаются определенными и генерируются, но в палитре их нет.
import * as Blockly from "blockly/core";
import "blockly/blocks";
import * as Ru from "blockly/msg/ru";
import { pythonGenerator as G, Order } from "blockly/python";
import { tr, KK } from "../i18n/index.js";

Blockly.setLocale(Ru);

// ─── Цвета категорий SPIKE 3: основной, второй (поля и меню), третий (обводка) ───
const PAL = {
  motor: ["#0090F5", "#0078CC", "#0062A6"],
  movement: ["#FF4CCD", "#C80090", "#B2248A"],
  light: ["#9B6AF6", "#691FF0", "#571CC1"],
  sounds: ["#C061F1", "#8A40AF", "#642E7F"],
  event: ["#F5C402", "#C8A300", "#B09400"],
  control: ["#FFB515", "#ECA100", "#C98A01"],
  sensing: ["#34CCF1", "#00A8C9", "#368FA9"],
  operators: ["#00B94D", "#00963E", "#006A2A"],
  variables: ["#FF8F24", "#FF7D00", "#D26600"],
  data_lists: ["#FF693C", "#F93F09", "#CA2D00"],
  myBlocks: ["#FF5D64", "#FF000C", "#C6000A"],
};
const STYLE_ALIAS = { // встроенные стили Blockly (старые программы) -> цвета SPIKE
  logic_blocks: "operators", math_blocks: "operators", text_blocks: "operators", loop_blocks: "control",
  variable_blocks: "variables", variable_dynamic_blocks: "variables", list_blocks: "data_lists",
  procedure_blocks: "myBlocks", colour_blocks: "light", hat_blocks: "event",
};
const HATS = new Set(["event", "procedure_blocks", "myBlocks"]);

const svgUri = (svg) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

// ─── Значки (рисуются вторым цветом категории на белой плашке, как в SPIKE 3) ───
const GLYPH = {
  motor: (c) => `<circle cx="12" cy="12" r="8" fill="none" stroke="${c}" stroke-width="3"/><path d="M12 8.5v7M8.5 12h7" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>`,
  move: (c) => `<rect x="5" y="4" width="14" height="13" rx="3" fill="${c}"/><rect x="2" y="13" width="5" height="8" rx="2" fill="${c}"/><rect x="17" y="13" width="5" height="8" rx="2" fill="${c}"/><rect x="8" y="7" width="8" height="5" rx="1" fill="#fff"/>`,
  light: (c) => [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => `<rect x="${4 + i * 6}" y="${4 + j * 6}" width="4.4" height="4.4" rx="1" fill="${c}"/>`)).join(""),
  sound: (c) => `<path d="M4 9h4l5-4v14l-5-4H4z" fill="${c}"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
  flag: (c) => `<path d="M6 3v18" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/><path d="M7 4c4-2 6 2 11 0v9c-5 2-7-2-11 0z" fill="${c}"/>`,
  hub: (c) => `<rect x="4" y="2.5" width="16" height="19" rx="3.5" fill="none" stroke="${c}" stroke-width="2.4"/>` + [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => `<rect x="${7.6 + i * 3.4}" y="${6 + j * 3.4}" width="2.2" height="2.2" fill="${c}"/>`)).join("") + `<circle cx="12" cy="18" r="1.6" fill="${c}"/>`,
  color: (c) => `<rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="${c}" stroke-width="2.4"/><circle cx="12" cy="12" r="4" fill="${c}"/>`,
  distance: (c) => `<circle cx="7.5" cy="12" r="5" fill="none" stroke="${c}" stroke-width="2.4"/><circle cx="16.5" cy="12" r="5" fill="none" stroke="${c}" stroke-width="2.4"/><circle cx="7.5" cy="12" r="1.8" fill="${c}"/><circle cx="16.5" cy="12" r="1.8" fill="${c}"/>`,
  force: (c) => `<rect x="5" y="9" width="14" height="11" rx="2.5" fill="none" stroke="${c}" stroke-width="2.4"/><rect x="8.5" y="3.5" width="7" height="6.5" rx="1.5" fill="${c}"/>`,
  timer: (c) => `<circle cx="12" cy="13" r="8" fill="none" stroke="${c}" stroke-width="2.4"/><path d="M12 13V8.5M12 13l3 2" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><path d="M9.5 2.5h5" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`,
  any: (c) => `<rect x="4" y="5" width="16" height="14" rx="3" fill="none" stroke="${c}" stroke-width="2.4"/>`,
};
const ICON_SIZE = 30;
const iconUri = (glyph, style) => svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 30 30"><rect x="1" y="1" width="28" height="28" rx="7" fill="#fff" stroke="${PAL[style][2]}" stroke-width="1"/><g transform="translate(3 3)">${GLYPH[glyph](PAL[style][1])}</g></svg>`);
const ICON = (glyph, style) => ({ type: "field_image", src: iconUri(glyph, style), width: ICON_SIZE, height: ICON_SIZE, alt: "" });

// стрелки для меню направлений (белые, как значки в полях SPIKE)
function arrowSvg(kind) {
  let body;
  if (kind === "up" || kind === "down") {
    body = `<path d="M12 3 L20 12 H15 V21 H9 V12 H4 Z" fill="#fff" ${kind === "down" ? 'transform="rotate(180 12 12)"' : ""}/>`;
  } else {
    const cw = kind === "cw", r = 7.5, a0 = -200, a1 = 70; // дуга почти по кругу, стрелка на конце
    const pt = (a) => [12 + r * Math.cos(a * Math.PI / 180), 12 + r * Math.sin(a * Math.PI / 180)];
    const [x0, y0] = pt(a0), [x1, y1] = pt(a1);
    const t = (a1 + 90) * Math.PI / 180, n = a1 * Math.PI / 180; // касательная (по часовой) и нормаль на конце
    const tip = [x1 + Math.cos(t) * 4.5, y1 + Math.sin(t) * 4.5], l = [x1 + Math.cos(n) * 4.2, y1 + Math.sin(n) * 4.2], rr = [x1 - Math.cos(n) * 4.2, y1 - Math.sin(n) * 4.2];
    body = `<g ${cw ? "" : 'transform="translate(24 0) scale(-1 1)"'}><path d="M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 1 1 ${x1.toFixed(2)} ${y1.toFixed(2)}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M${tip.map((v) => v.toFixed(2)).join(" ")} L${l.map((v) => v.toFixed(2)).join(" ")} L${rr.map((v) => v.toFixed(2)).join(" ")} Z" fill="#fff"/></g>`;
  }
  return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">${body}</svg>`);
}
const ARROW = (kind, alt) => ({ src: arrowSvg(kind), width: 22, height: 22, alt });

// ─── Свои поля: порт, картинка 5x5, цвет ───
const PORT_LETTERS = ["A", "B", "C", "D", "E", "F"];

/** Поле-картинка: рисуется SVG-изображением, редактор во всплывающем окне Blockly. Наследует FieldImage:
 *  zelos не сдвигает картинки за выемку блока, поэтому плашка порта стоит у левого края, как в SPIKE. */
class SvgField extends Blockly.FieldImage {
  constructor(value, opts = {}) {
    super(svgUri("<svg xmlns='http://www.w3.org/2000/svg'/>"), 30, 30, "");
    this.opts = opts; this.SERIALIZABLE = true; this.CURSOR = "pointer";
    this.clickHandler = () => this.openEditor();
    this.size_ = new Blockly.utils.Size(30, 30);
    this.setValue(value);
  }
  styleColours() {
    const b = this.getSourceBlock();
    const st = b && b.style ? b.style : { colourPrimary: "#888", colourSecondary: "#666", colourTertiary: "#444" };
    return [st.colourPrimary, st.colourSecondary, st.colourTertiary];
  }
  initView() { this.img_ = Blockly.utils.dom.createSvgElement("image", {}, this.fieldGroup_); this.redraw(); }
  redraw() {
    if (!this.img_) return;
    const { w, h, svg } = this.draw();
    this.img_.setAttribute("width", w); this.img_.setAttribute("height", h);
    this.img_.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", svgUri(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${svg}</svg>`));
    this.size_ = new Blockly.utils.Size(w, h);
  }
  render_() { this.redraw(); }
  updateSize_() { /* размер задает redraw */ }
  applyColour() { this.redraw(); }
  doValueUpdate_(v) { this.value_ = v; this.isDirty_ = true; this.redraw(); }
  getText_() { return String(this.getValue()); }
  showEditor_() { this.openEditor(); }
  openEditor() {
    Blockly.DropDownDiv.clearContent(); // пересоздает окно: содержимое берем после очистки
    const div = Blockly.DropDownDiv.getContentDiv();
    const box = document.createElement("div"); box.className = "wb-editor";
    box.style.cssText = "padding:8px;font:600 13px system-ui,sans-serif;color:#fff;user-select:none";
    this.buildEditor(box);
    div.append(box);
    const [p, , t] = this.styleColours();
    Blockly.DropDownDiv.setColour(p, t);
    Blockly.DropDownDiv.showPositionedByField(this, () => this.onEditorClose && this.onEditorClose());
  }
}

const DEVICE_OF = { motor: "motor", color: "color", distance: "distance", force: "force", any: "any" };
/** Выбор порта как в SPIKE: белая плашка со значком устройства и буквой; редактор - порты хаба A C E слева, B D F справа. */
class FieldPort extends SvgField {
  static fromJson(o) { return new FieldPort(o.value || "A", o); }
  doClassValidation_(v) {
    const s = [...new Set(String(v || "").toUpperCase().replace(/[^A-F]/g, ""))].join("");
    const o = this.opts || {};
    if (!s) return null;
    if (o.pair) return s.length === 2 ? s : null;
    return o.multi ? s : s[0];
  }
  draw() {
    const [, sec, ter] = this.styleColours(), v = String(this.getValue() || "A");
    const label = v.split("").join("+"), h = 30, w = 30 + label.length * 10 + 6;
    return { w, h, svg: `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="7" fill="#fff" stroke="${ter}" stroke-width="1"/>`
      + `<g transform="translate(4 3)">${GLYPH[DEVICE_OF[this.opts.kind] || "any"](sec)}</g>`
      + `<text x="30" y="20.5" font-family="Helvetica,Arial,sans-serif" font-size="15" font-weight="700" fill="#2b2b2b">${esc(label)}</text>` };
  }
  buildEditor(box) {
    const sel = String(this.getValue() || "").split("");
    const pick = [...(this.opts.pair ? [] : sel)];
    const hint = document.createElement("div"); hint.style.cssText = "text-align:center;margin-bottom:6px;opacity:.9";
    hint.textContent = this.opts.pair ? tr("Выберите левый, затем правый мотор") : this.opts.multi ? tr("Можно выбрать несколько портов") : tr("Порт хаба");
    box.append(hint);
    const grid = document.createElement("div");
    grid.style.cssText = "display:grid;grid-template-columns:repeat(2,44px);gap:6px 34px;justify-content:center;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.18)";
    const btns = {};
    const paint = () => {
      for (const L of PORT_LETTERS) {
        const on = pick.includes(L);
        btns[L].style.background = on ? "#fff" : "rgba(255,255,255,.25)";
        btns[L].style.color = on ? this.styleColours()[1] : "#fff";
        btns[L].title = this.opts.pair && on ? (pick.indexOf(L) === 0 ? tr("левый") : tr("правый")) : "";
      }
    };
    for (const L of ["A", "B", "C", "D", "E", "F"]) {
      const bt = document.createElement("button"); bt.type = "button"; bt.textContent = L;
      bt.style.cssText = "height:36px;border:0;border-radius:8px;font:700 16px system-ui,sans-serif;cursor:pointer";
      bt.onclick = () => {
        if (this.opts.pair) {
          if (pick.includes(L)) pick.splice(pick.indexOf(L), 1); else pick.push(L);
          paint();
          if (pick.length === 2) { this.setValue(pick.join("")); Blockly.DropDownDiv.hideIfOwner(this, true); }
        } else if (this.opts.multi) {
          if (pick.includes(L)) { if (pick.length > 1) pick.splice(pick.indexOf(L), 1); } else pick.push(L);
          paint(); this.setValue(PORT_LETTERS.filter((x) => pick.includes(x)).join(""));
        } else { this.setValue(L); Blockly.DropDownDiv.hideIfOwner(this, true); }
      };
      btns[L] = bt; grid.append(bt);
    }
    box.append(grid); paint();
  }
}

const SMILEY = "9909999099000009000909990";
const MATRIX_PRESETS = [SMILEY, "0909099999999990999000900", "0000009090000001000101110", "9999999999999999999999999", "0000000000000000000000000"];
/** Картинка 5x5 для матрицы хаба: 25 цифр яркости 0-9 по строкам. */
class FieldMatrix extends SvgField {
  static fromJson(o) { return new FieldMatrix(o.value || SMILEY, o); }
  doClassValidation_(v) { const s = String(v ?? "").replace(/[^0-9]/g, ""); return s.length === 25 ? s : null; }
  draw() {
    const [, sec, ter] = this.styleColours(), v = String(this.getValue() || SMILEY), cell = 5, gap = 0.9, pad = 3.5;
    const sz = pad * 2 + cell * 5 + gap * 4;
    let svg = `<rect x="0.5" y="0.5" width="${sz - 1}" height="${sz - 1}" rx="6" fill="#fff" stroke="${ter}" stroke-width="1"/>`;
    for (let i = 0; i < 25; i++) {
      const d = +v[i], x = pad + (i % 5) * (cell + gap), y = pad + Math.floor(i / 5) * (cell + gap);
      svg += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="1" fill="${d ? sec : "#d9d9d9"}" ${d && d < 9 ? `fill-opacity="${(0.25 + 0.75 * d / 9).toFixed(2)}"` : ""}/>`;
    }
    return { w: sz, h: sz, svg };
  }
  buildEditor(box) {
    let brush = 9;
    const cells = [];
    const grid = document.createElement("div");
    grid.style.cssText = "display:grid;grid-template-columns:repeat(5,30px);gap:5px;padding:9px;border-radius:12px;background:#1d1d1f;width:max-content;margin:0 auto";
    const paint = () => { const v = this.getValue(); cells.forEach((c, i) => { const d = +v[i]; c.style.background = d ? `rgba(255,255,255,${(0.2 + 0.8 * d / 9).toFixed(2)})` : "#3a3a3c"; }); };
    for (let i = 0; i < 25; i++) {
      const c = document.createElement("button"); c.type = "button";
      c.style.cssText = "width:30px;height:30px;border:0;border-radius:5px;cursor:pointer;padding:0";
      c.onclick = () => { const v = this.getValue().split(""); v[i] = +v[i] === brush ? "0" : String(brush); this.setValue(v.join("")); paint(); };
      cells.push(c); grid.append(c);
    }
    const row = document.createElement("div"); row.style.cssText = "display:flex;align-items:center;gap:8px;margin-top:8px";
    const lab = document.createElement("span"); lab.textContent = tr("Яркость");
    const range = document.createElement("input"); range.type = "range"; range.min = "1"; range.max = "9"; range.value = "9"; range.style.flex = "1";
    const val = document.createElement("b"); val.textContent = "9"; val.style.width = "12px";
    range.oninput = () => { brush = +range.value; val.textContent = range.value; };
    row.append(lab, range, val);
    const presets = document.createElement("div"); presets.style.cssText = "display:flex;gap:6px;justify-content:center;margin-top:8px";
    for (const pv of MATRIX_PRESETS) {
      const b = document.createElement("button"); b.type = "button"; b.style.cssText = "border:0;background:#fff;border-radius:6px;padding:2px;cursor:pointer;line-height:0";
      const tmp = new FieldMatrix(pv); tmp.styleColours = () => this.styleColours();
      const { svg, w } = tmp.draw();
      b.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w}" viewBox="0 0 ${w} ${w}">${svg}</svg>`;
      b.onclick = () => { this.setValue(pv); paint(); };
      presets.append(b);
    }
    box.append(grid, row, presets); paint();
  }
}

// цвета SPIKE: значение - константа модуля color
const COLOR_HEX = { BLACK: "#000000", MAGENTA: "#EB3DAA", PURPLE: "#691FF0", BLUE: "#0090F5", AZURE: "#00D4FF", TURQUOISE: "#00C2BD",
  GREEN: "#00B94D", YELLOW: "#FFD500", ORANGE: "#FCAC00", RED: "#FF000C", WHITE: "#FFFFFF", UNKNOWN: "none" };
const COLOR_NAMES = { BLACK: "черный", MAGENTA: "фиолетовый", PURPLE: "пурпурный", BLUE: "синий", AZURE: "голубой", TURQUOISE: "бирюзовый",
  GREEN: "зеленый", YELLOW: "желтый", ORANGE: "оранжевый", RED: "красный", WHITE: "белый", UNKNOWN: "нет цвета" };
const SENSOR_COLORS = ["BLACK", "MAGENTA", "BLUE", "AZURE", "GREEN", "YELLOW", "RED", "WHITE", "UNKNOWN"];
const LIGHT_COLORS = ["BLACK", "MAGENTA", "PURPLE", "BLUE", "AZURE", "TURQUOISE", "GREEN", "YELLOW", "ORANGE", "RED", "WHITE"];
const swatch = (k, r, cx, cy, stroke = "#fff") => k === "UNKNOWN"
  ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="#9e9e9e" stroke-width="1.5"/><path d="M${cx - r * 0.6} ${cy + r * 0.6}L${cx + r * 0.6} ${cy - r * 0.6}" stroke="#d00" stroke-width="2"/>`
  : `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${COLOR_HEX[k]}" stroke="${stroke}" stroke-width="1.5"/>`;
/** Цвет кружком, как в SPIKE; редактор - кружки цветов. */
class FieldSpikeColor extends SvgField {
  static fromJson(o) { return new FieldSpikeColor(o.value || "RED", o); }
  list() { return (this.opts || {}).palette === "light" ? LIGHT_COLORS : SENSOR_COLORS; }
  doClassValidation_(v) { return COLOR_HEX[v] !== undefined ? v : null; }
  draw() {
    const [, , ter] = this.styleColours();
    return { w: 30, h: 30, svg: `<rect x="0.5" y="0.5" width="29" height="29" rx="15" fill="#fff" stroke="${ter}"/>${swatch(this.getValue(), 10, 15, 15, "#bbb")}` };
  }
  buildEditor(box) {
    const grid = document.createElement("div"); grid.style.cssText = "display:grid;grid-template-columns:repeat(4,38px);gap:6px";
    for (const k of this.list()) {
      const b = document.createElement("button"); b.type = "button"; b.title = tr(COLOR_NAMES[k]);
      b.style.cssText = `width:38px;height:38px;border-radius:50%;border:${k === this.getValue() ? "3px solid #fff" : "2px solid rgba(255,255,255,.5)"};cursor:pointer;padding:0;background:transparent;line-height:0`;
      b.innerHTML = `<svg width="34" height="34" viewBox="0 0 34 34">${swatch(k, 14, 17, 17, "rgba(0,0,0,.15)")}</svg>`;
      b.onclick = () => { this.setValue(k); Blockly.DropDownDiv.hideIfOwner(this, true); };
      grid.append(b);
    }
    box.append(grid);
  }
}

/** Сообщения для «передать» и «когда я получу»: меню из всех сообщений программы + «Новое сообщение». */
class FieldMessage extends Blockly.FieldDropdown {
  static fromJson(o) { return new FieldMessage(o.value); }
  constructor(value) {
    super(function () {
      const names = new Set([this.getValue() || tr("сообщение1")]);
      const ws = this.getSourceBlock() && this.getSourceBlock().workspace;
      const all = ws ? (ws.isFlyout && ws.targetWorkspace ? ws.targetWorkspace : ws).getAllBlocks(false) : [];
      for (const b of all) { const f = b.getField && b.getField("MESSAGE"); if (f instanceof FieldMessage && f.getValue()) names.add(f.getValue()); }
      return [...[...names].sort().map((n) => [n, n]), [tr("Новое сообщение"), "__new__"]];
    }, (v) => {
      if (v !== "__new__") return v;
      Blockly.dialog.prompt(tr("Название нового сообщения:"), "", (name) => { if (name && name.trim()) this.setValue(name.trim()); });
      return null;
    });
    this.value_ = value || tr("сообщение1");
  }
  doClassValidation_(v) { return v == null ? null : String(v); }
}

Blockly.fieldRegistry.register("field_spike_port", FieldPort);
Blockly.fieldRegistry.register("field_spike_matrix", FieldMatrix);
Blockly.fieldRegistry.register("field_spike_color", FieldSpikeColor);
Blockly.fieldRegistry.register("field_spike_message", FieldMessage);

// Меню как у SPIKE: поле в блоке закрашено вторым цветом, обводка третьим
const ddApply = Blockly.FieldDropdown.prototype.applyColour;
Blockly.FieldDropdown.prototype.applyColour = function () {
  ddApply.call(this);
  const b = this.getSourceBlock();
  if (this.borderRect_ && b && !b.isShadow() && b.style) {
    this.borderRect_.setAttribute("fill", b.style.colourSecondary);
    this.borderRect_.setAttribute("stroke", b.style.colourTertiary);
  }
};

// ─── Описание блоков ───
const DEF_PORT = { motor: "A", color: "E", distance: "F", force: "D", any: "A" };
const PORT = (kind, o = {}) => ({ type: "field_spike_port", name: o.name || "PORT", kind, value: o.value || DEF_PORT[kind], multi: !!o.multi, pair: !!o.pair });
const NUM = (name, v) => ({ type: "input_value", name, _num: v });
const TXT = (name, v) => ({ type: "input_value", name, _text: v });
const BOOL = (name) => ({ type: "input_value", name, check: "Boolean" });
const DD = (name, options) => ({ type: "field_dropdown", name, options });
const MATRIX = { type: "field_spike_matrix", name: "MATRIX", value: SMILEY };
const COLOR = (name, palette = "sensor", value = "RED") => ({ type: "field_spike_color", name, palette, value });
const VAR = (name = "VARIABLE", type = "") => ({ type: "field_variable", name, variable: null, variableTypes: [type], defaultType: type });

const ROT_DIR = DD("DIRECTION", [[ARROW("cw", "по часовой стрелке"), "clockwise"], [ARROW("ccw", "против часовой стрелки"), "counterclockwise"]]);
const MOVE_DIR = DD("DIRECTION", [[ARROW("up", "вперед"), "forward"], [ARROW("down", "назад"), "back"]]);
const MOTOR_UNITS = [["обороты", "rotations"], ["градусы", "degrees"], ["с", "seconds"]];
const MOVE_UNITS = [["см", "cm"], ["дюймы", "in"], ["обороты", "rotations"], ["градусы", "degrees"], ["с", "seconds"]];
const DIST_UNITS = [["%", "%"], ["см", "cm"], ["дюймы", "in"]];
const DIST_CMP = [["ближе", "closer"], ["дальше", "farther"], ["точно в", "exactly"]];
const FORCE_OPTS = [["нажата", "pressed"], ["нажата с усилием", "hard_pressed"], ["отпущена", "released"]];
const FACES = [["передняя часть", "front"], ["задняя часть", "back"], ["верхняя часть", "top"], ["нижняя часть", "bottom"], ["левая сторона", "left"], ["правая сторона", "right"]];
const GESTURES = [["встряхивание", "shaken"], ["касание", "tapped"], ["двойное касание", "double_tapped"], ["падение", "falling"]];
const TILTS = [["вперед", "forward"], ["назад", "backward"], ["влево", "left"], ["вправо", "right"], ["любое направление", "any"]];
const BUTTONS = [["левая", "LEFT"], ["правая", "RIGHT"]];
const BUTTON_EV = [["нажата", "pressed"], ["отпущена", "released"]];
const STOP_METHODS = [["торможение", "brake"], ["зафиксированное положение", "hold"], ["свободное вращение", "coast"]];
const ACCELS = [["среднее", "medium"], ["медленно", "slow"], ["быстро", "fast"]];
const SOUNDS = [["Мяу", "Cat Meow 1"], ["Бонк", "Bonk"], ["Дверной звонок", "Doorbell 1"], ["Привет", "Hello"], ["Робот", "Robot 1"], ["Победа", "Triumph"]];

// kind: cmd - обычный, end - без продолжения снизу, hat - шапка, num - круглый отчет, bool - шестиугольный
const B = (type, style, kind, message0, args0 = [], extra = {}) => ({ type, style, kind, message0, args0, ...extra });

const MOTORS = [
  B("flippermotor_motorTurnForDirection", "motor", "cmd", "%1 запустить %2 на %3 %4", [PORT("motor", { multi: true }), ROT_DIR, NUM("VALUE", 1), DD("UNIT", MOTOR_UNITS)]),
  B("flippermotor_motorGoDirectionToPosition", "motor", "cmd", "%1 перейти %2 в положение %3", [PORT("motor", { multi: true }),
    DD("DIRECTION", [["самым коротким путем", "shortest"], ["по часовой стрелке", "clockwise"], ["против часовой стрелки", "counterclockwise"]]), NUM("POSITION", 0)]),
  B("flippermotor_motorStartDirection", "motor", "cmd", "%1 запустить мотор %2", [PORT("motor", { multi: true }), ROT_DIR]),
  B("flippermotor_motorStop", "motor", "cmd", "%1 остановить мотор", [PORT("motor", { multi: true })]),
  B("flippermotor_motorSetSpeed", "motor", "cmd", "%1 задать скорость %2 %%", [PORT("motor", { multi: true }), NUM("SPEED", 75)]),
  B("flippermotor_absolutePosition", "motor", "num", "%1 положение", [PORT("motor")]),
  B("flippermotor_speed", "motor", "num", "%1 скорость", [PORT("motor")]),
];
const MOVEMENT = [
  B("flippermove_move", "movement", "cmd", "%1 переместить %2 на %3 %4", [ICON("move", "movement"), MOVE_DIR, NUM("VALUE", 10), DD("UNIT", MOVE_UNITS)]),
  B("flippermove_startMove", "movement", "cmd", "%1 начать движение %2", [ICON("move", "movement"), MOVE_DIR]),
  B("flippermove_steer", "movement", "cmd", "%1 переместить с рулем %2 на %3 %4", [ICON("move", "movement"), NUM("STEERING", 30), NUM("VALUE", 10), DD("UNIT", MOVE_UNITS)],
    { tooltip: "Руль от -100 до 100: 0 - прямо, 100 - разворот на месте вправо, -100 - влево" }),
  B("flippermove_startSteer", "movement", "cmd", "%1 начать движение с рулем %2", [ICON("move", "movement"), NUM("STEERING", 30)],
    { tooltip: "Руль от -100 до 100: 0 - прямо, 100 - разворот на месте вправо, -100 - влево" }),
  B("flippermove_stopMove", "movement", "cmd", "%1 остановить движение", [ICON("move", "movement")]),
  B("flippermove_movementSpeed", "movement", "cmd", "%1 установить скорость движения %2 %%", [ICON("move", "movement"), NUM("SPEED", 50)]),
  B("flippermove_setMovementPair", "movement", "cmd", "%1 установить моторы для движения %2", [ICON("move", "movement"), PORT("motor", { name: "PAIR", value: "AB", pair: true })]),
  B("flippermove_setDistance", "movement", "cmd", "%1 установить 1 оборот мотора на %2 %3", [ICON("move", "movement"), NUM("DISTANCE", 17.5), DD("UNIT", [["см", "cm"], ["дюймы", "in"]])]),
];
const LIGHT = [
  B("flipperlight_lightDisplayImageOnForTime", "light", "cmd", "%1 включить %2 на %3 с", [ICON("light", "light"), MATRIX, NUM("VALUE", 2)]),
  B("flipperlight_lightDisplayImageOn", "light", "cmd", "%1 включить %2", [ICON("light", "light"), MATRIX]),
  B("flipperlight_lightDisplayText", "light", "cmd", "%1 написать %2", [ICON("light", "light"), TXT("TEXT", "Hello")]),
  B("flipperlight_lightDisplayOff", "light", "cmd", "%1 отключить пиксели", [ICON("light", "light")]),
  B("flipperlight_lightDisplaySetBrightness", "light", "cmd", "%1 установить яркость пикселей на %2 %%", [ICON("light", "light"), NUM("BRIGHTNESS", 75)]),
  B("flipperlight_lightDisplaySetPixel", "light", "cmd", "%1 задать пиксели для %2, %3 до %4 %%", [ICON("light", "light"), NUM("X", 1), NUM("Y", 1), NUM("BRIGHTNESS", 100)]),
  B("flipperlight_lightDisplayRotate", "light", "cmd", "%1 вращать %2", [ICON("light", "light"), ROT_DIR]),
  B("flipperlight_lightDisplaySetOrientation", "light", "cmd", "%1 настроить ориентацию %2", [ICON("light", "light"),
    DD("ORIENTATION", [["вертикально", "upright"], ["влево", "left"], ["вправо", "right"], ["вверх ногами", "upside_down"]])]),
  B("flipperlight_centerButtonLight", "light", "cmd", "%1 установить %2 для подсветки центральной кнопки", [ICON("hub", "light"), COLOR("COLOR", "light", "RED")]),
  B("flipperlight_ultrasonicLightUp", "light", "cmd", "%1 включить подсветку %2", [PORT("distance"), { type: "field_input", name: "VALUE", text: "100 100 100 100" }],
    { tooltip: "Яркость четырех сегментов подсветки датчика расстояния, 0-100" }),
];
const SOUND = [
  B("flippersound_playSoundUntilDone", "sounds", "cmd", "%1 воспроизводить звук %2 до завершения", [ICON("sound", "sounds"), DD("SOUND", SOUNDS)]),
  B("flippersound_playSound", "sounds", "cmd", "%1 включить звук %2", [ICON("sound", "sounds"), DD("SOUND", SOUNDS)]),
  B("flippersound_beepForTime", "sounds", "cmd", "%1 включить звуковой сигнал %2 на %3 с", [ICON("sound", "sounds"), NUM("NOTE", 60), NUM("DURATION", 0.2)],
    { tooltip: "Нота по номеру MIDI: 60 - до первой октавы" }),
  B("flippersound_beep", "sounds", "cmd", "%1 включить звуковой сигнал %2", [ICON("sound", "sounds"), NUM("NOTE", 60)]),
  B("flippersound_stopSound", "sounds", "cmd", "%1 остановить воспроизведение всех звуков", [ICON("sound", "sounds")]),
  B("sound_changevolumeby", "sounds", "cmd", "%1 изменить громкость на %2", [ICON("sound", "sounds"), NUM("VOLUME", -10)]),
  B("sound_setvolumeto", "sounds", "cmd", "%1 установить громкость на %2 %%", [ICON("sound", "sounds"), NUM("VOLUME", 100)]),
  B("sound_volume", "sounds", "num", "%1 громкость", [ICON("sound", "sounds")]),
];
const EVENTS = [
  B("flipperevents_whenProgramStarts", "event", "hat", "%1 когда программа запускается", [ICON("flag", "event")]),
  B("flipperevents_whenColor", "event", "hat", "%1 когда цвет %2", [PORT("color"), COLOR("OPTION")]),
  B("flipperevents_whenPressed", "event", "hat", "%1 когда %2", [PORT("force"), DD("OPTION", [...FORCE_OPTS, ["давление изменилось", "changed"]])]),
  B("flipperevents_whenDistance", "event", "hat", "%1 когда %2 %3 %4", [PORT("distance"), DD("COMPARATOR", DIST_CMP), NUM("VALUE", 15), DD("UNIT", DIST_UNITS)]),
  B("flipperevents_whenTilted", "event", "hat", "%1 при наклоне %2", [ICON("hub", "event"), DD("VALUE", TILTS)]),
  B("flipperevents_whenOrientation", "event", "hat", "%1 когда %2 вверху", [ICON("hub", "event"), DD("VALUE", FACES)]),
  B("flipperevents_whenGesture", "event", "hat", "%1 когда %2", [ICON("hub", "event"), DD("EVENT", GESTURES)]),
  B("flipperevents_whenButton", "event", "hat", "%1 когда кнопка %2 %3", [ICON("hub", "event"), DD("BUTTON", BUTTONS), DD("EVENT", BUTTON_EV)]),
  B("flipperevents_whenCondition", "event", "hat", "%1 когда %2", [ICON("hub", "event"), BOOL("CONDITION")]),
  B("flipperevents_whenTimer", "event", "hat", "%1 когда таймер > %2", [ICON("timer", "event"), NUM("VALUE", 10)]),
  B("event_whenbroadcastreceived", "event", "hat", "когда я получу %1", [{ type: "field_spike_message", name: "MESSAGE" }]),
  B("event_broadcast", "event", "cmd", "передать %1", [{ type: "field_spike_message", name: "MESSAGE" }]),
  B("event_broadcastandwait", "event", "cmd", "передать %1 и ждать", [{ type: "field_spike_message", name: "MESSAGE" }]),
];
const CONTROL = [
  B("control_wait", "control", "cmd", "ждать %1 секунд", [NUM("DURATION", 1)]),
  B("control_repeat", "control", "cmd", "повторить %1 раз", [NUM("TIMES", 10)], { message1: "%1", args1: [{ type: "input_statement", name: "SUBSTACK" }] }),
  B("control_forever", "control", "end", "повторять всегда", [], { message1: "%1", args1: [{ type: "input_statement", name: "SUBSTACK" }] }),
  B("control_if", "control", "cmd", "если %1 то", [BOOL("CONDITION")], { message1: "%1", args1: [{ type: "input_statement", name: "SUBSTACK" }] }),
  B("control_if_else", "control", "cmd", "если %1 то", [BOOL("CONDITION")], { message1: "%1", args1: [{ type: "input_statement", name: "SUBSTACK" }],
    message2: "иначе", message3: "%1", args3: [{ type: "input_statement", name: "SUBSTACK2" }] }),
  B("control_wait_until", "control", "cmd", "ждать до %1", [BOOL("CONDITION")]),
  B("control_repeat_until", "control", "cmd", "повторять пока не %1", [BOOL("CONDITION")], { message1: "%1", args1: [{ type: "input_statement", name: "SUBSTACK" }] }),
  B("flippercontrol_stop", "control", "end", "остановить %1", [DD("STOP_OPTION", [["все", "all"], ["эту подпрограмму", "this"], ["и выйти из программы", "exit"]])]),
  B("flippercontrol_stopOtherStacks", "control", "cmd", "остановить другие подпрограммы", []),
];
const SENSORS = [
  B("flippersensors_isColor", "sensing", "bool", "%1 цвет %2?", [PORT("color"), COLOR("VALUE")]),
  B("flippersensors_color", "sensing", "num", "%1 цвет", [PORT("color")]),
  B("flippersensors_isReflectivity", "sensing", "bool", "%1 отраженный свет %2 %3 %%?", [PORT("color"), DD("COMPARATOR", [["<", "<"], ["=", "="], [">", ">"]]), NUM("VALUE", 50)]),
  B("flippersensors_reflectivity", "sensing", "num", "%1 отраженный свет", [PORT("color")]),
  B("flippersensors_isPressed", "sensing", "bool", "%1 %2?", [PORT("force"), DD("OPTION", FORCE_OPTS)]),
  B("flippersensors_force", "sensing", "num", "%1 давление в %2", [PORT("force"), DD("UNIT", [["%", "%"], ["Н", "N"]])]),
  B("flippersensors_isDistance", "sensing", "bool", "%1 %2 %3 %4?", [PORT("distance"), DD("COMPARATOR", DIST_CMP), NUM("VALUE", 15), DD("UNIT", DIST_UNITS)]),
  B("flippersensors_distance", "sensing", "num", "%1 расстояние в %2", [PORT("distance"), DD("UNIT", DIST_UNITS)]),
  B("flippersensors_isTilted", "sensing", "bool", "%1 хаб наклонен %2?", [ICON("hub", "sensing"), DD("VALUE", TILTS)]),
  B("flippersensors_isorientation", "sensing", "bool", "%1 %2 вверху?", [ICON("hub", "sensing"), DD("ORIENTATION", FACES)]),
  B("flippersensors_ismotion", "sensing", "bool", "%1 %2?", [ICON("hub", "sensing"), DD("MOTION", GESTURES)]),
  B("flippersensors_orientationAxis", "sensing", "num", "%1 %2 угол", [ICON("hub", "sensing"), DD("AXIS", [["тангаж", "pitch"], ["крен", "roll"], ["рысканье", "yaw"]])],
    { tooltip: "Угол в градусах; рысканье: поворот вправо - плюс" }),
  B("flippersensors_resetYaw", "sensing", "cmd", "%1 установить угол рыскания хаба на 0", [ICON("hub", "sensing")]),
  B("flippersensors_buttonIsPressed", "sensing", "bool", "%1 кнопка %2 %3?", [ICON("hub", "sensing"), DD("BUTTON", BUTTONS), DD("EVENT", BUTTON_EV)]),
  B("flippersensors_timer", "sensing", "num", "%1 таймер", [ICON("timer", "sensing")]),
  B("flippersensors_resetTimer", "sensing", "cmd", "%1 сбросить таймер", [ICON("timer", "sensing")]),
];
const OPS = [
  B("operator_add", "operators", "num", "%1 + %2", [NUM("NUM1", ""), NUM("NUM2", "")]),
  B("operator_subtract", "operators", "num", "%1 - %2", [NUM("NUM1", ""), NUM("NUM2", "")]),
  B("operator_multiply", "operators", "num", "%1 * %2", [NUM("NUM1", ""), NUM("NUM2", "")]),
  B("operator_divide", "operators", "num", "%1 / %2", [NUM("NUM1", ""), NUM("NUM2", "")]),
  B("operator_random", "operators", "num", "выдать случайное от %1 до %2", [NUM("FROM", 1), NUM("TO", 10)]),
  B("operator_gt", "operators", "bool", "%1 > %2", [TXT("OPERAND1", ""), TXT("OPERAND2", "50")]),
  B("operator_lt", "operators", "bool", "%1 < %2", [TXT("OPERAND1", ""), TXT("OPERAND2", "50")]),
  B("operator_equals", "operators", "bool", "%1 = %2", [TXT("OPERAND1", ""), TXT("OPERAND2", "50")]),
  B("flipperoperator_isInBetween", "operators", "bool", "значение %1 в диапазоне от %2 до %3?", [NUM("VALUE", 0), NUM("LOW", -10), NUM("HIGH", 10)]),
  B("operator_and", "operators", "bool", "%1 и %2", [BOOL("OPERAND1"), BOOL("OPERAND2")]),
  B("operator_or", "operators", "bool", "%1 или %2", [BOOL("OPERAND1"), BOOL("OPERAND2")]),
  B("operator_not", "operators", "bool", "не %1", [BOOL("OPERAND")]),
  B("operator_join", "operators", "num", "соединить %1 %2", [TXT("STRING1", "яблоко"), TXT("STRING2", "банан")]),
  B("operator_letter_of", "operators", "num", "буква %1 в %2", [NUM("LETTER", 1), TXT("STRING", "яблоко")]),
  B("operator_length", "operators", "num", "длина %1", [TXT("STRING", "яблоко")]),
  B("operator_contains", "operators", "bool", "%1 содержит %2?", [TXT("STRING1", "яблоко"), TXT("STRING2", "я")]),
  B("operator_mod", "operators", "num", "остаток от деления %1 на %2", [NUM("NUM1", ""), NUM("NUM2", "")]),
  B("operator_round", "operators", "num", "округлить %1", [NUM("NUM", "")]),
  B("operator_mathop", "operators", "num", "%1 от %2", [DD("OPERATOR", [["модуль", "abs"], ["округлить вниз", "floor"], ["округлить вверх", "ceiling"], ["квадратный корень", "sqrt"],
    ["sin", "sin"], ["cos", "cos"], ["tan", "tan"], ["asin", "asin"], ["acos", "acos"], ["atan", "atan"], ["ln", "ln"], ["log", "log"], ["e ^", "e ^"], ["10 ^", "10 ^"]]), NUM("NUM", "")]),
];
const VARIABLES = [
  B("data_variable", "variables", "num", "%1", [VAR()]),
  B("data_setvariableto", "variables", "cmd", "задать %1 значение %2", [VAR(), TXT("VALUE", "0")]),
  B("data_changevariableby", "variables", "cmd", "изменить %1 на %2", [VAR(), NUM("VALUE", 1)]),
  B("data_listcontents", "data_lists", "num", "%1", [VAR("LIST", "list")]),
  B("data_addtolist", "data_lists", "cmd", "добавить %1 в %2", [TXT("ITEM", "вещь"), VAR("LIST", "list")]),
  B("data_deleteoflist", "data_lists", "cmd", "удалить %1 из %2", [NUM("INDEX", 1), VAR("LIST", "list")]),
  B("data_deletealloflist", "data_lists", "cmd", "удалить все из %1", [VAR("LIST", "list")]),
  B("data_insertatlist", "data_lists", "cmd", "вставить %1 в позицию %2 из %3", [TXT("ITEM", "вещь"), NUM("INDEX", 1), VAR("LIST", "list")]),
  B("data_replaceitemoflist", "data_lists", "cmd", "заменить элемент %1 в %2 на %3", [NUM("INDEX", 1), VAR("LIST", "list"), TXT("ITEM", "вещь")]),
  B("data_itemoflist", "data_lists", "num", "элемент %1 из %2", [NUM("INDEX", 1), VAR("LIST", "list")]),
  B("data_itemnumoflist", "data_lists", "num", "номер элемента %1 в %2", [TXT("ITEM", "вещь"), VAR("LIST", "list")]),
  B("data_lengthoflist", "data_lists", "num", "длина %1", [VAR("LIST", "list")]),
  B("data_listcontainsitem", "data_lists", "bool", "%1 содержит %2?", [VAR("LIST", "list"), TXT("ITEM", "вещь")]),
];
const MORE_MOTORS = [
  B("flippermoremotor_motorStartPower", "motor", "cmd", "%1 запустить мотор с мощностью %2 %%", [PORT("motor", { multi: true }), NUM("POWER", 100)]),
  B("flippermoremotor_motorPower", "motor", "num", "%1 мощность", [PORT("motor")]),
  B("flippermoremotor_motorSetDegreeCounted", "motor", "cmd", "%1 установить относительное положение %2", [PORT("motor", { multi: true }), NUM("VALUE", 0)]),
  B("flippermoremotor_position", "motor", "num", "%1 относительное положение", [PORT("motor")]),
  B("flippermoremotor_motorGoToRelativePosition", "motor", "cmd", "%1 перейти к относительному положению %2 со скоростью %3 %%", [PORT("motor", { multi: true }), NUM("POSITION", 0), NUM("SPEED", 75)]),
  B("flippermoremotor_motorSetStopMethod", "motor", "cmd", "%1 при остановке: %2", [PORT("motor", { multi: true }), DD("STOP", STOP_METHODS)]),
  B("flippermoremotor_motorSetAcceleration", "motor", "cmd", "%1 установить значение ускорения %2", [PORT("motor", { multi: true }), DD("ACCELERATION", ACCELS)]),
];
const MORE_MOVE = [
  B("flippermoremove_startDualSpeed", "movement", "cmd", "%1 начать движение со скоростью %2 %3 %%", [ICON("move", "movement"), NUM("LEFT", 50), NUM("RIGHT", 50)],
    { tooltip: "Скорость левого и правого мотора движения, %" }),
  B("flippermoremove_movementSetStopMethod", "movement", "cmd", "%1 запрограммировать моторы на %2 при остановке", [ICON("move", "movement"), DD("STOP", STOP_METHODS)]),
  B("flippermoremove_movementSetAcceleration", "movement", "cmd", "%1 установить значение ускорения движения %2", [ICON("move", "movement"), DD("ACCELERATION", ACCELS)]),
];
const MORE_SENSORS = [
  B("flippermoresensors_acceleration", "sensing", "num", "%1 ускорение по %2", [ICON("hub", "sensing"), DD("AXIS", [["x", "x"], ["y", "y"], ["z", "z"]])]),
  B("flippermoresensors_angularVelocity", "sensing", "num", "%1 угловая скорость по %2", [ICON("hub", "sensing"), DD("AXIS", [["x", "x"], ["y", "y"], ["z", "z"]])]),
  B("flippermoresensors_rawColor", "sensing", "num", "%1 необработанное значение %2", [PORT("color"), DD("COLOR", [["красный", "red"], ["зеленый", "green"], ["синий", "blue"]])]),
  B("flippermoresensors_color", "sensing", "num", "%1 номер цвета", [PORT("color")]),
  B("flippermoresensors_orientation", "sensing", "num", "%1 ориентация", [ICON("hub", "sensing")]),
  B("flippermoresensors_motion", "sensing", "num", "%1 действие", [ICON("hub", "sensing")]),
  B("flippermoresensors_setOrientation", "sensing", "cmd", "%1 настроить ориентацию датчика %2", [ICON("hub", "sensing"), DD("UP", FACES)]),
];
const SHADOWS = [
  { type: "wb_text", style: "operators", message0: "%1", args0: [{ type: "field_input", name: "TEXT", text: "" }], output: null },
];

// ─── Старые блоки (до Word Blocks): нужны для сохраненных программ и старых заданий ───
const OLDP = (name, opts) => ({ type: "field_dropdown", name, options: opts.map((x) => [x, x]) });
const PORTS = ["A", "B", "C", "D", "E", "F"];
const OLD = [
  B("spike_start", "event", "hat", "▶ когда программа запущена"),
  B("spike_motor_run_for", "motor", "cmd", "мотор %1 %2 на %3 %4 скорость %5 %%", [OLDP("PORT", ["C", "D", "A", "B"]), DD("DIR", [["↻", "1"], ["↺", "-1"]]), NUM("N", 1),
    DD("UNIT", [["оборотов", "rot"], ["градусов", "deg"], ["секунд", "sec"]]), NUM("SPEED", 75)]),
  B("spike_motor_start", "motor", "cmd", "запустить мотор %1 %2 скорость %3 %%", [OLDP("PORT", ["C", "D", "A", "B"]), DD("DIR", [["↻", "1"], ["↺", "-1"]]), NUM("SPEED", 75)]),
  B("spike_motor_stop", "motor", "cmd", "остановить мотор %1", [OLDP("PORT", ["C", "D", "A", "B"])]),
  B("spike_motor_goto", "motor", "cmd", "мотор %1 в позицию %2 ° скорость %3 %%", [OLDP("PORT", ["C", "D", "A", "B"]), NUM("POS", 0), NUM("SPEED", 75)]),
  B("spike_motor_reset", "motor", "cmd", "сбросить позицию мотора %1", [OLDP("PORT", PORTS)]),
  B("spike_motor_position", "motor", "num", "позиция мотора %1", [OLDP("PORT", PORTS)]),
  B("spike_move_pair", "movement", "cmd", "моторы движения %1 и %2", [OLDP("L", PORTS), OLDP("R", ["B", "A", "C", "D", "E", "F"])]),
  B("spike_move_speed", "movement", "cmd", "скорость движения %1 %%", [NUM("SPEED", 50)]),
  B("spike_move_for", "movement", "cmd", "двигаться %1 на %2 %3", [DD("DIR", [["вперед ↑", "1"], ["назад ↓", "-1"]]), NUM("N", 10),
    DD("UNIT", [["см", "cm"], ["градусов", "deg"], ["оборотов", "rot"], ["секунд", "sec"]])]),
  B("spike_move_steer_for", "movement", "cmd", "двигаться с рулем %1 на %2 %3", [NUM("STEER", 30), NUM("N", 10), DD("UNIT", [["см", "cm"], ["градусов", "deg"], ["оборотов", "rot"], ["секунд", "sec"]])]),
  B("spike_move_start", "movement", "cmd", "начать движение с рулем %1", [NUM("STEER", 0)]),
  B("spike_move_tank", "movement", "cmd", "начать движение: левое %1 %% правое %2 %%", [NUM("L", 50), NUM("R", 50)]),
  B("spike_move_stop", "movement", "cmd", "остановить движение"),
  B("spike_turn_gyro", "movement", "cmd", "повернуть %1 на %2 ° по гироскопу", [DD("DIR", [["вправо ↻", "1"], ["влево ↺", "-1"]]), NUM("DEG", 90)]),
  B("spike_reflection", "sensing", "num", "отражение %1", [OLDP("PORT", ["E", "F", "A", "B", "C", "D"])]),
  B("spike_color_is", "sensing", "bool", "%1 видит %2", [OLDP("PORT", ["E", "F", "A", "B", "C", "D"]),
    DD("COLOR", [["черный", "BLACK"], ["белый", "WHITE"], ["красный", "RED"], ["синий", "BLUE"], ["зеленый", "GREEN"], ["желтый", "YELLOW"]])]),
  B("spike_distance", "sensing", "num", "расстояние %1 (мм)", [OLDP("PORT", ["D", "C", "E", "F", "A", "B"])]),
  B("spike_force", "sensing", "bool", "датчик силы %1 нажат", [OLDP("PORT", ["D", "C", "E", "F", "A", "B"])]),
  B("spike_yaw", "sensing", "num", "угол поворота (yaw)"),
  B("spike_reset_yaw", "sensing", "cmd", "сбросить угол поворота"),
  B("spike_button", "sensing", "bool", "кнопка %1 нажата", [DD("B", [["левая", "LEFT"], ["правая", "RIGHT"]])]),
  B("spike_write", "light", "cmd", "написать %1", [TXT("TEXT", "Hi")]),
  B("spike_image", "light", "cmd", "показать %1", [DD("IMG", [["улыбку", "IMAGE_HAPPY"], ["сердце", "IMAGE_HEART"], ["галочку", "IMAGE_YES"], ["крестик", "IMAGE_NO"], ["квадрат", "IMAGE_SQUARE"]])]),
  B("spike_clear", "light", "cmd", "выключить экран"),
  B("spike_beep", "sounds", "cmd", "сигнал нота %1 на %2 с", [NUM("NOTE", 60), NUM("SEC", 0.2)]),
  B("spike_wait", "control", "cmd", "ждать %1 с", [NUM("SEC", 1)]),
  B("spike_wait_until", "control", "cmd", "ждать, пока %1", [BOOL("COND")]),
  B("spike_repeat", "control", "cmd", "повторить %1 раз", [NUM("N", 10)], { message1: "%1", args1: [{ type: "input_statement", name: "DO" }] }),
  B("spike_forever", "control", "end", "всегда", [], { message1: "%1", args1: [{ type: "input_statement", name: "DO" }] }),
  B("spike_until", "control", "cmd", "повторять, пока не %1", [BOOL("COND")], { message1: "%1", args1: [{ type: "input_statement", name: "DO" }] }),
  B("spike_print", "control", "cmd", "вывести в консоль %1", [TXT("V", "")]),
  B("spike_stop", "control", "end", "остановить программу"),
];

const ALL = [...MOTORS, ...MOVEMENT, ...LIGHT, ...SOUND, ...EVENTS, ...CONTROL, ...SENSORS, ...OPS, ...VARIABLES, ...MORE_MOTORS, ...MORE_MOVE, ...MORE_SENSORS, ...OLD];
const BY_TYPE = Object.fromEntries(ALL.map((d) => [d.type, d]));
const HAT_TYPES = new Set(ALL.filter((d) => d.kind === "hat").map((d) => d.type));

// печатный текст без «е» с точками и длинного тире (правило проекта)
const fixRu = (s) => (typeof s === "string" ? s.replace(/\u0451/g, "\u0435").replace(/\u0401/g, "\u0415").replace(/[\u2014\u2013]/g, "-") : s);
const MSG = { // подписи Blockly в духе SPIKE (Scratch)
  PROCEDURES_DEFNORETURN_TITLE: "определить", PROCEDURES_DEFNORETURN_PROCEDURE: "блок", PROCEDURES_BEFORE_PARAMS: "с:",
  PROCEDURES_CALL_BEFORE_PARAMS: "с:", PROCEDURES_DEFNORETURN_TOOLTIP: "Мой блок: набор команд под своим именем",
  NEW_VARIABLE: "Создать переменную", NEW_VARIABLE_TITLE: "Имя новой переменной:", NEW_LIST: "Создать список",
};

function toJson(d) {
  const j = { type: d.type, style: d.style, message0: d.message0, args0: [], inputsInline: true, tooltip: d.tooltip || "" };
  for (const k of ["message1", "args1", "message2", "message3", "args3"]) if (d[k] !== undefined) j[k] = d[k];
  for (const a of d.args0 || []) {
    if (a._num !== undefined || a._text !== undefined) { j.args0.push({ type: "input_value", name: a.name }); continue; }
    j.args0.push({ ...a });
  }
  if (d.kind === "cmd") { j.previousStatement = null; j.nextStatement = null; }
  else if (d.kind === "end") j.previousStatement = null;
  else if (d.kind === "hat") j.nextStatement = null;
  else if (d.kind === "num") j.output = null;
  else if (d.kind === "bool") j.output = "Boolean";
  if (d.message1 || d.message3) j.inputsInline = true;
  return j;
}

// Блоки определяем при первом создании рабочей области: к этому времени загружен словарь казахского языка
let defined = false;
function defineOnce() {
  if (defined) return; defined = true;
  for (const [k, v] of Object.entries(Blockly.Msg)) if (typeof v === "string") Blockly.Msg[k] = fixRu(tr(v));
  for (const [k, v] of Object.entries(MSG)) Blockly.Msg[k] = tr(v);
  const trArg = (a) => {
    const c = { ...a };
    if (Array.isArray(c.options)) c.options = c.options.map(([t, v]) => [typeof t === "string" ? tr(t) : { ...t, alt: tr(t.alt) }, v]);
    if (c.type === "field_input" && typeof c.text === "string") c.text = tr(c.text);
    return c;
  };
  Blockly.common.defineBlocksWithJsonArray([...ALL.map(toJson), ...SHADOWS].map((c) => {
    for (const k of ["message0", "message1", "message2", "message3", "tooltip"]) if (typeof c[k] === "string" && c[k]) c[k] = tr(c[k]);
    for (const k of ["args0", "args1", "args3"]) if (c[k]) c[k] = c[k].map(trArg);
    return c;
  }));
  if (KK) for (const c of TOOLBOX.contents) {
    if (c.name) c.name = tr(c.name);
    for (const it of c.contents || []) if (it.kind === "label") it.text = tr(it.text);
  }
}
export { defineOnce as defineBlocks };

// Блок палитры с подставленными значениями (shadow), как в SPIKE
function shadowInputs(type) {
  const d = BY_TYPE[type], inputs = {};
  for (const a of d.args0 || []) {
    if (a._num !== undefined) inputs[a.name] = { shadow: { type: "math_number", fields: { NUM: a._num } } };
    if (a._text !== undefined) inputs[a.name] = { shadow: { type: "wb_text", fields: { TEXT: tr(a._text) } } };
  }
  return inputs;
}
const blk = (type) => ({ kind: "block", type, inputs: shadowInputs(type) });
const cat = (name, style, list) => ({ kind: "category", name, colour: PAL[style][0], contents: [{ kind: "label", text: name }, ...list.map((d) => blk(d.type))] });

export const TOOLBOX = {
  kind: "categoryToolbox",
  contents: [
    cat("Моторы", "motor", MOTORS),
    cat("Движение", "movement", MOVEMENT),
    cat("Свет", "light", LIGHT),
    cat("Звук", "sounds", SOUND),
    cat("События", "event", EVENTS),
    cat("Управление", "control", CONTROL),
    cat("Датчики", "sensing", SENSORS),
    cat("Операторы", "operators", OPS),
    { kind: "category", name: "Переменные", colour: PAL.variables[0], custom: "WB_VARIABLES" },
    { kind: "category", name: "Мои блоки", colour: PAL.myBlocks[0], custom: "WB_PROCEDURES" },
    { kind: "sep" },
    cat("Дополнительные моторы", "motor", MORE_MOTORS),
    cat("Дополнительные движения", "movement", MORE_MOVE),
    cat("Дополнительные датчики", "sensing", MORE_SENSORS),
  ],
};

// «Переменные»: кнопки создания, отчеты переменных и блоки для первой из них (как в Scratch)
function variablesFlyout(ws) {
  const vm = ws.getVariableMap(), byName = (a, b) => a.getName().localeCompare(b.getName());
  const vars = vm.getVariablesOfType("").sort(byName), lists = vm.getVariablesOfType("list").sort(byName);
  const out = [{ kind: "label", text: tr("Переменные") }, { kind: "button", text: Blockly.Msg.NEW_VARIABLE, callbackKey: "WB_NEW_VAR" }];
  const withVar = (type, field, v) => { const b = blk(type); b.fields = { [field]: { id: v.getId() } }; return b; };
  for (const v of vars) out.push(withVar("data_variable", "VARIABLE", v));
  if (vars.length) out.push(withVar("data_setvariableto", "VARIABLE", vars[0]), withVar("data_changevariableby", "VARIABLE", vars[0]));
  out.push({ kind: "button", text: Blockly.Msg.NEW_LIST, callbackKey: "WB_NEW_LIST" });
  for (const v of lists) out.push(withVar("data_listcontents", "LIST", v));
  if (lists.length) for (const d of VARIABLES.filter((x) => x.style === "data_lists" && x.type !== "data_listcontents")) out.push(withVar(d.type, "LIST", lists[0]));
  return out;
}
// «Мои блоки»: блок «определить» и вызовы уже созданных блоков
function proceduresFlyout(ws) {
  const out = [{ kind: "label", text: tr("Мои блоки") }, { kind: "block", type: "procedures_defnoreturn", fields: { NAME: tr("блок") } }];
  for (const [name, params] of Blockly.Procedures.allProcedures(ws)[0]) out.push({ kind: "block", type: "procedures_callnoreturn", extraState: { name, params } });
  return out;
}

// ─── Генератор Python ───
const F = (b, n) => b.getFieldValue(n);
const V = (b, n, d = "0", order = Order.NONE) => G.valueToCode(b, n, order) || d;
const isNum = (c) => /^-?\d+(\.\d+)?$/.test(String(c).trim());
const isStr = (c) => /^"(?:[^"\\]|\\.)*"$/.test(String(c).trim());
const q = (s) => JSON.stringify(String(s));
const portsOf = (v) => String(v || "A").split("").map((L) => `port.${L}`);
const P = (b, n = "PORT") => { const p = portsOf(F(b, n)); return p.length === 1 ? p[0] : `(${p.join(", ")})`; };
const ms = (c) => (isNum(c) ? String(Math.round(parseFloat(c) * 1000)) : `int(${c} * 1000)`);
const S = (c) => (isStr(c) ? c : `str(${c})`);
const YIELD = "await runloop.sleep_ms(5)\n";
const needs = new Set();
const sub = (b, n) => G.statementToCode(b, n) || G.INDENT + "pass\n";
const loopBody = (b, n, always) => { const s = G.statementToCode(b, n); return (s || "") + (always || !/\bawait\b/.test(s) ? G.INDENT + YIELD : ""); };
const fn = (code, order = Order.FUNCTION_CALL) => [code, order];

// имена переменных и «Моих блоков» для Python: буквы любого алфавита (MicroPython это умеет), цифры и _
const RESERVED = new Set(("False None True and as assert async await break class continue def del elif else except finally for from global if import in is "
  + "lambda nonlocal not or pass raise return try while with yield wb port button motor motor_pair color_sensor distance_sensor force_sensor color "
  + "runloop math random hub light_matrix motion_sensor sound light print str int float len range abs round main").split(" "));
let NAMES = new Map(), USED = new Set();
function ident(key, raw) {
  if (NAMES.has(key)) return NAMES.get(key);
  let s = String(raw || "x").trim().replace(/[^\p{L}\p{N}_]+/gu, "_").replace(/^_+|_+$/g, "") || "x";
  if (/^\d/.test(s)) s = "_" + s;
  let n = s, i = 2;
  while (RESERVED.has(n) || USED.has(n) || /^stack_\d+$/.test(n)) n = `${s}_${i++}`;
  USED.add(n); NAMES.set(key, n);
  return n;
}
const varName = (id) => NAMES.get("v:" + id) || "x";
const varField = (b, n) => varName(F(b, n));
const procName = (name) => ident("p:" + name, name);

const GEN = {
  // Моторы
  flippermotor_motorTurnForDirection: (b) => `await wb.motor_run_for(${P(b)}, ${q(F(b, "DIRECTION"))}, ${V(b, "VALUE", "1")}, ${q(F(b, "UNIT"))})\n`,
  flippermotor_motorGoDirectionToPosition: (b) => `await wb.motor_go_to(${P(b)}, ${q(F(b, "DIRECTION"))}, ${V(b, "POSITION")})\n`,
  flippermotor_motorStartDirection: (b) => `wb.motor_start(${P(b)}, ${q(F(b, "DIRECTION"))})\n`,
  flippermotor_motorStop: (b) => `wb.motor_stop(${P(b)})\n`,
  flippermotor_motorSetSpeed: (b) => `wb.motor_set_speed(${P(b)}, ${V(b, "SPEED", "75")})\n`,
  flippermotor_absolutePosition: (b) => fn(`wb.motor_position(${P(b)})`),
  flippermotor_speed: (b) => fn(`wb.motor_speed(${P(b)})`),
  // Движение
  flippermove_move: (b) => `await wb.move(${q(F(b, "DIRECTION"))}, ${V(b, "VALUE", "10")}, ${q(F(b, "UNIT"))})\n`,
  flippermove_startMove: (b) => `wb.start_move(${q(F(b, "DIRECTION"))})\n`,
  flippermove_steer: (b) => `await wb.steer(${V(b, "STEERING")}, ${V(b, "VALUE", "10")}, ${q(F(b, "UNIT"))})\n`,
  flippermove_startSteer: (b) => `wb.start_steer(${V(b, "STEERING")})\n`,
  flippermove_stopMove: () => "wb.stop_move()\n",
  flippermove_movementSpeed: (b) => `wb.set_move_speed(${V(b, "SPEED", "50")})\n`,
  flippermove_setMovementPair: (b) => { const [l, r] = portsOf(F(b, "PAIR")); return `wb.set_move_motors(${l}, ${r || "port.B"})\n`; },
  flippermove_setDistance: (b) => `wb.set_rotation_distance(${V(b, "DISTANCE", "17.5")}, ${q(F(b, "UNIT"))})\n`,
  // Свет
  flipperlight_lightDisplayImageOnForTime: (b) => `await wb.show_image_for(${q(F(b, "MATRIX"))}, ${V(b, "VALUE", "2")})\n`,
  flipperlight_lightDisplayImageOn: (b) => `wb.show_image(${q(F(b, "MATRIX"))})\n`,
  flipperlight_lightDisplayText: (b) => `await wb.write(${V(b, "TEXT", '""')})\n`,
  flipperlight_lightDisplayOff: () => "wb.clear()\n",
  flipperlight_lightDisplaySetBrightness: (b) => `wb.set_brightness(${V(b, "BRIGHTNESS", "75")})\n`,
  flipperlight_lightDisplaySetPixel: (b) => `wb.set_pixel(${V(b, "X", "1")}, ${V(b, "Y", "1")}, ${V(b, "BRIGHTNESS", "100")})\n`,
  flipperlight_lightDisplayRotate: (b) => `wb.rotate(${q(F(b, "DIRECTION"))})\n`,
  flipperlight_lightDisplaySetOrientation: (b) => `wb.set_orientation(${q(F(b, "ORIENTATION"))})\n`,
  flipperlight_centerButtonLight: (b) => `wb.power_light(color.${F(b, "COLOR")})\n`,
  flipperlight_ultrasonicLightUp: (b) => `wb.distance_light(${P(b)}, ${q(F(b, "VALUE"))})\n`,
  // Звук
  flippersound_playSoundUntilDone: (b) => `await wb.play_sound(${q(F(b, "SOUND"))})\n`,
  flippersound_playSound: (b) => `wb.start_sound(${q(F(b, "SOUND"))})\n`,
  flippersound_beepForTime: (b) => `await wb.beep_for(${V(b, "NOTE", "60")}, ${V(b, "DURATION", "0.2")})\n`,
  flippersound_beep: (b) => `wb.start_beep(${V(b, "NOTE", "60")})\n`,
  flippersound_stopSound: () => "wb.stop_sound()\n",
  sound_changevolumeby: (b) => `wb.change_volume(${V(b, "VOLUME", "-10")})\n`,
  sound_setvolumeto: (b) => `wb.set_volume(${V(b, "VOLUME", "100")})\n`,
  sound_volume: () => fn("wb.volume", Order.ATOMIC),
  // События (шапки собирает workspaceToPython)
  event_broadcast: (b) => `wb.broadcast(${q(F(b, "MESSAGE"))})\n`,
  event_broadcastandwait: (b) => `await wb.broadcast_wait(${q(F(b, "MESSAGE"))})\n`,
  // Управление
  control_wait: (b) => `await runloop.sleep_ms(${ms(V(b, "DURATION", "1", Order.MULTIPLICATIVE))})\n`,
  control_repeat: (b) => { const n = V(b, "TIMES", "10"); return `for _ in range(${isNum(n) ? String(Math.round(+n)) : `int(${n})`}):\n${loopBody(b, "SUBSTACK", false)}`; },
  control_forever: (b) => `while True:\n${loopBody(b, "SUBSTACK", true)}`,
  control_if: (b) => `if ${V(b, "CONDITION", "False")}:\n${sub(b, "SUBSTACK")}`,
  control_if_else: (b) => `if ${V(b, "CONDITION", "False")}:\n${sub(b, "SUBSTACK")}else:\n${sub(b, "SUBSTACK2")}`,
  control_wait_until: (b) => `await runloop.until(lambda: ${V(b, "CONDITION", "False")})\n`,
  control_repeat_until: (b) => `while not (${V(b, "CONDITION", "False")}):\n${loopBody(b, "SUBSTACK", true)}`,
  flippercontrol_stop: (b) => (F(b, "STOP_OPTION") === "this" ? "raise wb.StopStack()\n" : "raise SystemExit\n"),
  flippercontrol_stopOtherStacks: () => "wb.stop_other_stacks()\n",
  // Датчики
  flippersensors_isColor: (b) => fn(`color_sensor.color(${P(b)}) == color.${F(b, "VALUE")}`, Order.RELATIONAL),
  flippersensors_color: (b) => fn(`color_sensor.color(${P(b)})`),
  flippersensors_isReflectivity: (b) => {
    const c = F(b, "COMPARATOR"), v = V(b, "VALUE", "50", Order.RELATIONAL);
    return fn(`color_sensor.reflection(${P(b)}) ${c === "=" ? "==" : c} ${v}`, Order.RELATIONAL);
  },
  flippersensors_reflectivity: (b) => fn(`color_sensor.reflection(${P(b)})`),
  flippersensors_isPressed: (b) => fn(`wb.is_force(${P(b)}, ${q(F(b, "OPTION"))})`),
  flippersensors_force: (b) => fn(`wb.force(${P(b)}, ${q(F(b, "UNIT"))})`),
  flippersensors_isDistance: (b) => fn(`wb.is_distance(${P(b)}, ${q(F(b, "COMPARATOR"))}, ${V(b, "VALUE", "15")}, ${q(F(b, "UNIT"))})`),
  flippersensors_distance: (b) => fn(`wb.distance(${P(b)}, ${q(F(b, "UNIT"))})`),
  flippersensors_isTilted: (b) => fn(`wb.is_tilted(${q(F(b, "VALUE"))})`),
  flippersensors_isorientation: (b) => fn(`wb.is_up(${q(F(b, "ORIENTATION"))})`),
  flippersensors_ismotion: (b) => fn(`wb.is_gesture(${q(F(b, "MOTION"))})`),
  flippersensors_orientationAxis: (b) => fn(`wb.angle(${q(F(b, "AXIS"))})`),
  flippersensors_resetYaw: () => "wb.reset_yaw()\n",
  flippersensors_buttonIsPressed: (b) => fn(`button.pressed(button.${F(b, "BUTTON")}) ${F(b, "EVENT") === "released" ? "== 0" : "> 0"}`, Order.RELATIONAL),
  flippersensors_timer: () => fn("wb.timer()"),
  flippersensors_resetTimer: () => "wb.reset_timer()\n",
  // Операторы
  operator_add: (b) => fn(`${V(b, "NUM1", "0", Order.ADDITIVE)} + ${V(b, "NUM2", "0", Order.ADDITIVE)}`, Order.ADDITIVE),
  operator_subtract: (b) => fn(`${V(b, "NUM1", "0", Order.ADDITIVE)} - ${V(b, "NUM2", "0", Order.MULTIPLICATIVE)}`, Order.ADDITIVE),
  operator_multiply: (b) => fn(`${V(b, "NUM1", "0", Order.MULTIPLICATIVE)} * ${V(b, "NUM2", "0", Order.MULTIPLICATIVE)}`, Order.MULTIPLICATIVE),
  operator_divide: (b) => {
    const d = V(b, "NUM2", "0", Order.UNARY_SIGN);
    return isNum(d) && +d !== 0 ? fn(`${V(b, "NUM1", "0", Order.MULTIPLICATIVE)} / ${d}`, Order.MULTIPLICATIVE) : fn(`wb.div(${V(b, "NUM1")}, ${V(b, "NUM2")})`);
  },
  operator_random: (b) => {
    const a = V(b, "FROM", "1"), c = V(b, "TO", "10");
    if (/^-?\d+$/.test(a) && /^-?\d+$/.test(c)) { needs.add("random"); return fn(`random.randint(${Math.min(+a, +c)}, ${Math.max(+a, +c)})`); }
    return fn(`wb.pick_random(${a}, ${c})`);
  },
  operator_gt: (b) => fn(`${num(V(b, "OPERAND1", "0", Order.RELATIONAL))} > ${num(V(b, "OPERAND2", "0", Order.RELATIONAL))}`, Order.RELATIONAL),
  operator_lt: (b) => fn(`${num(V(b, "OPERAND1", "0", Order.RELATIONAL))} < ${num(V(b, "OPERAND2", "0", Order.RELATIONAL))}`, Order.RELATIONAL),
  operator_equals: (b) => {
    const a = V(b, "OPERAND1", '""', Order.RELATIONAL), c = V(b, "OPERAND2", '""', Order.RELATIONAL);
    if (isStr(a) && isStr(c)) return fn(`${a} == ${c}`, Order.RELATIONAL);
    const a2 = num(a), c2 = num(c);
    return isNum(a2) || isNum(c2) ? fn(`${a2} == ${c2}`, Order.RELATIONAL) : fn(`wb.equals(${a}, ${c})`);
  },
  flipperoperator_isInBetween: (b) => fn(`${V(b, "LOW", "-10", Order.RELATIONAL)} <= ${V(b, "VALUE", "0", Order.RELATIONAL)} <= ${V(b, "HIGH", "10", Order.RELATIONAL)}`, Order.RELATIONAL),
  operator_and: (b) => fn(`${V(b, "OPERAND1", "False", Order.LOGICAL_AND)} and ${V(b, "OPERAND2", "False", Order.LOGICAL_AND)}`, Order.LOGICAL_AND),
  operator_or: (b) => fn(`${V(b, "OPERAND1", "False", Order.LOGICAL_OR)} or ${V(b, "OPERAND2", "False", Order.LOGICAL_OR)}`, Order.LOGICAL_OR),
  operator_not: (b) => fn(`not ${V(b, "OPERAND", "False", Order.LOGICAL_NOT)}`, Order.LOGICAL_NOT),
  operator_join: (b) => fn(`${S(V(b, "STRING1", '""'))} + ${S(V(b, "STRING2", '""'))}`, Order.ADDITIVE),
  operator_letter_of: (b) => fn(`wb.letter(${V(b, "LETTER", "1")}, ${V(b, "STRING", '""')})`),
  operator_length: (b) => fn(`len(${S(V(b, "STRING", '""'))})`),
  operator_contains: (b) => fn(`wb.contains(${V(b, "STRING1", '""')}, ${V(b, "STRING2", '""')})`),
  operator_mod: (b) => fn(`${V(b, "NUM1", "0", Order.MULTIPLICATIVE)} % ${V(b, "NUM2", "1", Order.MULTIPLICATIVE)}`, Order.MULTIPLICATIVE),
  operator_round: (b) => fn(`round(${V(b, "NUM")})`),
  operator_mathop: (b) => { const op = F(b, "OPERATOR"), x = V(b, "NUM"); return op === "abs" ? fn(`abs(${x})`) : fn(`wb.mathop(${q(op)}, ${x})`); },
  wb_text: (b) => { const t = F(b, "TEXT"); return isNum(t) ? [String(+t), +t < 0 ? Order.UNARY_SIGN : Order.ATOMIC] : [q(t), Order.ATOMIC]; },
  // Переменные и списки
  data_variable: (b) => [varField(b, "VARIABLE"), Order.ATOMIC],
  data_setvariableto: (b) => `${varField(b, "VARIABLE")} = ${V(b, "VALUE")}\n`,
  data_changevariableby: (b) => `${varField(b, "VARIABLE")} += ${V(b, "VALUE", "1")}\n`,
  data_listcontents: (b) => fn(`" ".join(str(x) for x in ${varField(b, "LIST")})`),
  data_addtolist: (b) => `${varField(b, "LIST")}.append(${V(b, "ITEM", '""')})\n`,
  data_deleteoflist: (b) => `wb.delete_item(${varField(b, "LIST")}, ${V(b, "INDEX", "1")})\n`,
  data_deletealloflist: (b) => `${varField(b, "LIST")}.clear()\n`,
  data_insertatlist: (b) => `wb.insert_item(${varField(b, "LIST")}, ${V(b, "INDEX", "1")}, ${V(b, "ITEM", '""')})\n`,
  data_replaceitemoflist: (b) => `wb.replace_item(${varField(b, "LIST")}, ${V(b, "INDEX", "1")}, ${V(b, "ITEM", '""')})\n`,
  data_itemoflist: (b) => fn(`wb.item(${varField(b, "LIST")}, ${V(b, "INDEX", "1")})`),
  data_itemnumoflist: (b) => fn(`wb.index_of(${varField(b, "LIST")}, ${V(b, "ITEM", '""')})`),
  data_lengthoflist: (b) => fn(`len(${varField(b, "LIST")})`),
  data_listcontainsitem: (b) => fn(`wb.list_contains(${varField(b, "LIST")}, ${V(b, "ITEM", '""')})`),
  // Дополнительные моторы, движения, датчики
  flippermoremotor_motorStartPower: (b) => `wb.motor_start_power(${P(b)}, ${V(b, "POWER", "100")})\n`,
  flippermoremotor_motorPower: (b) => fn(`wb.motor_power(${P(b)})`),
  flippermoremotor_motorSetDegreeCounted: (b) => `wb.motor_set_relative(${P(b)}, ${V(b, "VALUE")})\n`,
  flippermoremotor_position: (b) => fn(`motor.relative_position(${P(b)})`),
  flippermoremotor_motorGoToRelativePosition: (b) => `await wb.motor_go_relative(${P(b)}, ${V(b, "POSITION")}, ${V(b, "SPEED", "75")})\n`,
  flippermoremotor_motorSetStopMethod: (b) => `wb.motor_set_stop(${P(b)}, ${q(F(b, "STOP"))})\n`,
  flippermoremotor_motorSetAcceleration: (b) => `wb.motor_set_acceleration(${P(b)}, ${q(F(b, "ACCELERATION"))})\n`,
  flippermoremove_startDualSpeed: (b) => `wb.start_tank(${V(b, "LEFT", "50")}, ${V(b, "RIGHT", "50")})\n`,
  flippermoremove_movementSetStopMethod: (b) => `wb.set_move_stop(${q(F(b, "STOP"))})\n`,
  flippermoremove_movementSetAcceleration: (b) => `wb.set_move_acceleration(${q(F(b, "ACCELERATION"))})\n`,
  flippermoresensors_acceleration: (b) => fn(`wb.acceleration(${q(F(b, "AXIS"))})`),
  flippermoresensors_angularVelocity: (b) => fn(`wb.angular_velocity(${q(F(b, "AXIS"))})`),
  flippermoresensors_rawColor: (b) => fn(`wb.raw_color(${P(b)}, ${q(F(b, "COLOR"))})`),
  flippermoresensors_color: (b) => fn(`color_sensor.color(${P(b)})`),
  flippermoresensors_orientation: () => fn("wb.orientation()"),
  flippermoresensors_motion: () => fn("wb.gesture()"),
  flippermoresensors_setOrientation: (b) => `wb.set_yaw_face(${q(F(b, "UP"))})\n`,

  // Старые блоки spike_* -> те же функции wb
  spike_start: () => "",
  spike_motor_run_for: (b) => {
    const u = { rot: "rotations", deg: "degrees", sec: "seconds" }[F(b, "UNIT")];
    return `await wb.motor_run_for(port.${F(b, "PORT")}, ${q(F(b, "DIR") === "1" ? "clockwise" : "counterclockwise")}, ${V(b, "N", "1")}, ${q(u)}, speed=${V(b, "SPEED", "75")})\n`;
  },
  spike_motor_start: (b) => `wb.motor_start(port.${F(b, "PORT")}, ${q(F(b, "DIR") === "1" ? "clockwise" : "counterclockwise")}, speed=${V(b, "SPEED", "75")})\n`,
  spike_motor_stop: (b) => `wb.motor_stop(port.${F(b, "PORT")})\n`,
  spike_motor_goto: (b) => `await wb.motor_go_relative(port.${F(b, "PORT")}, ${V(b, "POS")}, ${V(b, "SPEED", "75")})\n`,
  spike_motor_reset: (b) => `motor.reset_relative_position(port.${F(b, "PORT")}, 0)\n`,
  spike_motor_position: (b) => fn(`motor.relative_position(port.${F(b, "PORT")})`),
  spike_move_pair: (b) => `wb.set_move_motors(port.${F(b, "L")}, port.${F(b, "R")})\n`,
  spike_move_speed: (b) => `wb.set_move_speed(${V(b, "SPEED", "50")})\n`,
  spike_move_for: (b) => {
    const u = { cm: "cm", deg: "degrees", rot: "rotations", sec: "seconds" }[F(b, "UNIT")];
    return `await wb.move(${q(F(b, "DIR") === "1" ? "forward" : "back")}, ${V(b, "N", "10")}, ${q(u)})\n`;
  },
  spike_move_steer_for: (b) => {
    const u = { cm: "cm", deg: "degrees", rot: "rotations", sec: "seconds" }[F(b, "UNIT")];
    return `await wb.steer(${V(b, "STEER")}, ${V(b, "N", "10")}, ${q(u)})\n`;
  },
  spike_move_start: (b) => `wb.start_steer(${V(b, "STEER")})\n`,
  spike_move_tank: (b) => `wb.start_tank(${V(b, "L", "50")}, ${V(b, "R", "50")})\n`,
  spike_move_stop: () => "wb.stop_move()\n",
  spike_turn_gyro: (b) => `await wb.turn_gyro(${F(b, "DIR") === "1" ? "" : "-"}${V(b, "DEG", "90", Order.UNARY_SIGN)})\n`,
  spike_reflection: (b) => fn(`color_sensor.reflection(port.${F(b, "PORT")})`),
  spike_color_is: (b) => fn(`color_sensor.color(port.${F(b, "PORT")}) == color.${F(b, "COLOR")}`, Order.RELATIONAL),
  spike_distance: (b) => fn(`distance_sensor.distance(port.${F(b, "PORT")})`),
  spike_force: (b) => fn(`force_sensor.pressed(port.${F(b, "PORT")})`),
  spike_yaw: () => fn("wb.yaw()"),
  spike_reset_yaw: () => "wb.reset_yaw()\n",
  spike_button: (b) => fn(`button.pressed(button.${F(b, "B")}) > 0`, Order.RELATIONAL),
  spike_write: (b) => `await wb.write(${V(b, "TEXT", '""')})\n`,
  spike_image: (b) => `light_matrix.show_image(light_matrix.${F(b, "IMG")})\n`,
  spike_clear: () => "wb.clear()\n",
  spike_beep: (b) => `await wb.beep_for(${V(b, "NOTE", "60")}, ${V(b, "SEC", "0.2")})\n`,
  spike_wait: (b) => `await runloop.sleep_ms(${ms(V(b, "SEC", "1", Order.MULTIPLICATIVE))})\n`,
  spike_wait_until: (b) => `await runloop.until(lambda: ${V(b, "COND", "True")})\n`,
  spike_repeat: (b) => { const n = V(b, "N", "10"); return `for _ in range(${isNum(n) ? String(Math.round(+n)) : `int(${n})`}):\n${loopBody(b, "DO", false)}`; },
  spike_forever: (b) => `while True:\n${loopBody(b, "DO", true)}`,
  spike_until: (b) => `while not (${V(b, "COND", "False")}):\n${loopBody(b, "DO", true)}`,
  spike_print: (b) => `print(${V(b, "V", '""')})\n`,
  spike_stop: () => "raise SystemExit\n",

  // Мои блоки: асинхронные функции, вызов через await
  procedures_callnoreturn: (b) => `await ${procName(F(b, "NAME"))}(${callArgs(b)})\n`,
  procedures_callreturn: (b) => fn(`(await ${procName(F(b, "NAME"))}(${callArgs(b)}))`),
  procedures_defnoreturn: () => null,
  procedures_defreturn: () => null,
  // встроенные блоки старых программ: имена переменных как у новых блоков
  variables_get: (b) => [varField(b, "VAR"), Order.ATOMIC],
  variables_set: (b) => `${varField(b, "VAR")} = ${V(b, "VALUE")}\n`,
  math_change: (b) => `${varField(b, "VAR")} += ${V(b, "DELTA", "1")}\n`,
};
// сравнение > и <: текстовые поля Scratch превращаем в числа
function num(c) {
  if (isStr(c)) { const t = JSON.parse(c).trim(); return t === "" ? "0" : isFinite(+t) ? String(+t) : c; }
  return isNum(c) ? c : `wb.num(${c})`;
}
function callArgs(b) { return b.getVarModels().map((_, i) => G.valueToCode(b, "ARG" + i, Order.NONE) || "None").join(", "); }
for (const [k, f] of Object.entries(GEN)) G.forBlock[k] = (b) => f(b);

const isHat = (b) => HAT_TYPES.has(b.type);
// декоратор, который превращает функцию подпрограммы в подпрограмму с шапкой
function hatDecorator(b) {
  const lam = (c) => `@wb.when(lambda: ${c})`;
  switch (b.type) {
    case "flipperevents_whenProgramStarts": case "spike_start": return "@wb.when_program_starts";
    case "flipperevents_whenColor": return lam(`color_sensor.color(${P(b)}) == color.${F(b, "OPTION")}`);
    case "flipperevents_whenPressed": return `@wb.when_force(${P(b)}, ${q(F(b, "OPTION"))})`;
    case "flipperevents_whenDistance": return lam(`wb.is_distance(${P(b)}, ${q(F(b, "COMPARATOR"))}, ${V(b, "VALUE", "15")}, ${q(F(b, "UNIT"))})`);
    case "flipperevents_whenTilted": return lam(`wb.is_tilted(${q(F(b, "VALUE"))})`);
    case "flipperevents_whenOrientation": return lam(`wb.is_up(${q(F(b, "VALUE"))})`);
    case "flipperevents_whenGesture": return lam(`wb.is_gesture(${q(F(b, "EVENT"))})`);
    case "flipperevents_whenButton": return `@wb.when_button(button.${F(b, "BUTTON")}, ${q(F(b, "EVENT"))})`;
    case "flipperevents_whenCondition": return lam(V(b, "CONDITION", "False"));
    case "flipperevents_whenTimer": return lam(`wb.timer() > ${V(b, "VALUE", "10", Order.RELATIONAL)}`);
    case "event_whenbroadcastreceived": return `@wb.when_receive(${q(F(b, "MESSAGE"))})`;
    default: return null;
  }
}

const HEADER = `from hub import port, button
import motor, motor_pair, color_sensor, distance_sensor, force_sensor, color, runloop
import wb
`;

/** Код программы из рабочей области: каждая шапка - своя подпрограмма, все идут одновременно (wb.main). */
export function workspaceToPython(ws) {
  needs.clear();
  G.INDENT = "    ";
  G.init(ws);
  NAMES = new Map(); USED = new Set();
  const vars = ws.getVariableMap().getAllVariables();
  // параметры «Моих блоков» тоже переменные рабочей области
  for (const v of vars) ident("v:" + v.getId(), v.getName());
  const top = ws.getTopBlocks(true).filter((b) => b.isEnabled());
  const paramIds = new Set();
  for (const b of top) if (b.type.startsWith("procedures_def")) for (const m of b.getVarModels ? b.getVarModels() : []) paramIds.add(m.getId());
  const globals = vars.filter((v) => !paramIds.has(v.getId()) && v.getType() !== "list").map((v) => varName(v.getId()));
  // global - только для переменных, которым функция присваивает значение
  const globLine = (body, exclude = []) => {
    const g = globals.filter((n) => !exclude.includes(n) && new RegExp(`(^|\\n)\\s*${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[-+]?=[^=]`, "u").test(body));
    return g.length ? `${G.INDENT}global ${g.join(", ")}\n` : "";
  };
  const chain = (first) => { if (!first) return ""; let c = G.blockToCode(first); if (Array.isArray(c)) c = c[0]; return c || ""; };

  const procs = [], stacks = [];
  for (const b of top) {
    if (b.type === "procedures_defnoreturn" || b.type === "procedures_defreturn") {
      const name = procName(F(b, "NAME"));
      const args = (b.getVarModels ? b.getVarModels() : []).map((m) => varName(m.getId()));
      let body = G.statementToCode(b, "STACK");
      if (b.type === "procedures_defreturn") body += `${G.INDENT}return ${G.valueToCode(b, "RETURN", Order.NONE) || "None"}\n`;
      procs.push(`async def ${name}(${args.join(", ")}):\n${globLine(body, args)}${body || G.INDENT + "pass\n"}`);
    }
  }
  let n = 0;
  for (const b of top) {
    if (!isHat(b)) continue;
    const deco = hatDecorator(b);
    if (!deco) continue;
    const body = G.prefixLines(chain(b.getNextBlock()), G.INDENT);
    stacks.push(`${deco}\nasync def stack_${++n}():\n${globLine(body)}${body || G.INDENT + "pass\n"}`);
  }
  const inits = vars.filter((v) => !paramIds.has(v.getId())).map((v) => `${varName(v.getId())} = ${v.getType() === "list" ? "[]" : "0"}`);
  const extra = [...needs].map((m) => `import ${m}\n`).join("");
  let code = HEADER + extra;
  if (inits.length) code += "\n" + inits.join("\n") + "\n";
  for (const p of procs) code += "\n\n" + p;
  for (const s of stacks) code += "\n\n" + s;
  code += "\n\nrunloop.run(wb.main())\n";
  return code.replace(/\n{4,}/g, "\n\n\n");
}

// ─── Тема и рабочая область ───
const blockStyles = {};
for (const [k, [p, s, t]] of Object.entries(PAL)) blockStyles[k] = { colourPrimary: p, colourSecondary: s, colourTertiary: t, ...(HATS.has(k) ? { hat: "cap" } : {}) };
for (const [k, v] of Object.entries(STYLE_ALIAS)) blockStyles[k] = { ...blockStyles[v], ...(HATS.has(k) ? { hat: "cap" } : {}) };
const THEME = Blockly.Theme.defineTheme("spike3", {
  base: Blockly.Themes.Classic, blockStyles,
  categoryStyles: Object.fromEntries(Object.entries(PAL).map(([k, [p]]) => [k, { colour: p }])),
  fontStyle: { family: "Helvetica Neue, Helvetica, Arial, sans-serif", size: 12, weight: "500" },
  componentStyles: { workspaceBackgroundColour: "#F4F6FA", toolboxBackgroundColour: "#ffffff", flyoutBackgroundColour: "#FBFBFC", flyoutOpacity: 1,
    scrollbarColour: "#cfd4dc", insertionMarkerColour: "#000000", insertionMarkerOpacity: 0.2 },
});

export function createWorkspace(el, onChange) {
  defineOnce();
  const ws = Blockly.inject(el, {
    toolbox: TOOLBOX, trashcan: true, scrollbars: true, sounds: false, renderer: "zelos",
    zoom: { controls: true, wheel: false, startScale: 0.75, maxScale: 2, minScale: 0.35, scaleSpeed: 1.15 },
    move: { scrollbars: true, drag: true, wheel: true }, grid: { spacing: 40, length: 2, colour: "#dfe3ea", snap: false },
    theme: THEME,
  });
  ws.registerToolboxCategoryCallback("WB_VARIABLES", variablesFlyout);
  ws.registerToolboxCategoryCallback("WB_PROCEDURES", proceduresFlyout);
  ws.registerButtonCallback("WB_NEW_VAR", () => Blockly.Variables.createVariableButtonHandler(ws, null, ""));
  ws.registerButtonCallback("WB_NEW_LIST", () => Blockly.Variables.createVariableButtonHandler(ws, null, "list"));
  ws.addChangeListener((e) => { if (!e.isUiEvent && onChange) onChange(); });
  return ws;
}

export function loadBlocks(ws, state) {
  ws.clear();
  if (state) { try { Blockly.serialization.workspaces.load(state, ws); } catch (e) { /* испорченное сохранение */ } }
  if (!ws.getTopBlocks(false).some(isHat)) {
    const s = ws.newBlock("flipperevents_whenProgramStarts"); s.initSvg(); s.render(); s.moveBy(30, 30);
  }
}

export const saveBlocks = (ws) => Blockly.serialization.workspaces.save(ws);
export { Blockly };
