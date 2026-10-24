// Лаборатория USTEM: макетная плата, детали, провода, симуляция цепи и Arduino Uno.
import { EditorView, basicSetup } from "codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { PARTS, P, el, pinPos, RESISTOR_VALUES, fmtOhm, LED_COLORS } from "./parts.js";
import { solve, Nets } from "./solver.js";
import { Uno, PIN_MAP, FREQ } from "./avr.js";

const WIRE_COLORS = { "#16a34a": "Зеленый", "#dc2626": "Красный", "#111827": "Черный", "#2563eb": "Синий", "#f59e0b": "Оранжевый", "#a855f7": "Фиолетовый" };
const DEFAULT_CODE = `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(13, LOW);
  delay(500);
}
`;
const csrf = () => (document.querySelector('meta[name="csrf-token"]') || {}).content || "";
const snap = (v) => Math.round(v / P) * P;
let uid = 0;
const newId = (type) => `${type}${Date.now().toString(36)}${(uid++).toString(36)}`;
const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v; else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const k of kids.flat()) if (k != null) e.append(k.nodeType ? k : document.createTextNode(k));
  return e;
};

class Lab {
  constructor(root, { preset = null, storageKey = "lab:sandbox", compileUrl = "/lab/compile" } = {}) {
    this.root = root; this.preset = preset; this.storageKey = storageKey; this.compileUrl = compileUrl;
    this.parts = []; this.wires = []; this.checks = [];
    this.view = { x: 20, y: 20, s: 1 };
    this.sel = null; this.drawing = null; this.running = false; this.uno = null; this.compiledFor = null;
    this.audio = null; this.tones = {};
    this.build();
    this.load();
  }

  // ─────────────── Разметка ───────────────
  build() {
    const r = this.root;
    r.classList.add("lab");
    r.innerHTML = "";
    const groups = {};
    for (const [type, def] of Object.entries(PARTS)) (groups[def.group] ||= []).push([type, def]);
    this.palette = h("div", { class: "lab-palette" },
      ...Object.entries(groups).map(([g, items]) => h("div", { class: "lab-pgroup" }, h("div", { class: "lab-pgtitle" }, g),
        ...items.map(([type, def]) => h("button", { type: "button", class: "lab-pbtn", onclick: () => { this.addPart(type); this.palette.classList.remove("open"); } }, def.title)))));
    this.btnRun = h("button", { type: "button", class: "lab-btn lab-run", onclick: () => (this.running ? this.stop() : this.start()) }, "▶ Старт");
    const tb = h("div", { class: "lab-toolbar" },
      h("div", { class: "lab-add" }, h("button", { type: "button", class: "lab-btn", onclick: () => this.palette.classList.toggle("open") }, "+ Деталь"), this.palette),
      this.btnRun,
      h("button", { type: "button", class: "lab-btn", title: "Отменить (Ctrl+Z)", onclick: () => this.undo() }, "↶"),
      h("button", { type: "button", class: "lab-btn", title: "Повторить (Ctrl+Y)", onclick: () => this.redo() }, "↷"),
      h("button", { type: "button", class: "lab-btn", title: "Повернуть (R)", onclick: () => this.rotateSel() }, "⟳"),
      h("button", { type: "button", class: "lab-btn", title: "Копия детали (Ctrl+D)", onclick: () => this.duplicateSel() }, "⧉"),
      h("button", { type: "button", class: "lab-btn", title: "Удалить (Delete)", onclick: () => this.deleteSel() }, "✕"),
      h("span", { class: "lab-sep" }),
      h("button", { type: "button", class: "lab-btn", title: "Приблизить", onclick: () => this.zoom(1.2) }, "+"),
      h("button", { type: "button", class: "lab-btn", title: "Отдалить", onclick: () => this.zoom(1 / 1.2) }, "−".replace("−", "-")),
      h("button", { type: "button", class: "lab-btn", title: "Показать все", onclick: () => this.fit() }, "⤢"),
      h("span", { class: "lab-sep" }),
      h("button", { type: "button", class: "lab-btn", title: "Вернуть исходную схему и код", onclick: () => this.reset() }, "Сброс"),
      h("button", { type: "button", class: "lab-btn", title: "Скачать проект", onclick: () => this.exportJson() }, "Скачать"),
      h("label", { class: "lab-btn", title: "Открыть проект" }, "Открыть", h("input", { type: "file", accept: ".json", hidden: true, onchange: (e) => this.importJson(e) })),
      h("button", { type: "button", class: "lab-btn", title: "Во весь экран", onclick: () => this.root.classList.toggle("lab-full") }, "⛶"));
    this.svg = el("svg", { class: "lab-svg" });
    this.world = el("g", {}, this.svg);
    this.gParts0 = el("g", {}, this.world); this.gParts = el("g", {}, this.world); this.gWires = el("g", {}, this.world); this.gTemp = el("g", {}, this.world);
    this.status = h("div", { class: "lab-status" }, "");
    const canvas = h("div", { class: "lab-canvas" }, this.svg, this.status);
    // Правая панель
    this.tabs = {};
    const mkTab = (id, title) => { const b = h("button", { type: "button", class: "lab-tab", onclick: () => this.showTab(id) }, title); this.tabs[id].b = b; return b; };
    this.codeBox = h("div", { class: "lab-code" });
    this.compileOut = h("pre", { class: "lab-out" });
    this.serialOut = h("pre", { class: "lab-serial" });
    const serialIn = h("input", { class: "lab-input", placeholder: "Отправить в Serial..." });
    const send = () => { if (this.uno && serialIn.value) { this.uno.serialWrite(serialIn.value + "\n"); serialIn.value = ""; } };
    serialIn.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
    this.propsBox = h("div", { class: "lab-props" });
    this.checksBox = h("div", { class: "lab-checks" });
    this.tabs.code = { b: null, pane: h("div", { class: "lab-pane" }, this.codeBox, this.compileOut) };
    this.plot = h("canvas", { class: "lab-plot", width: 600, height: 220, hidden: true });
    this.plotData = []; this.serialLine = "";
    const plotBtn = h("button", { type: "button", class: "lab-btn", title: "Числа из Serial в виде графика" }, "График");
    plotBtn.addEventListener("click", () => { this.plot.hidden = !this.plot.hidden; plotBtn.classList.toggle("on", !this.plot.hidden); this.drawPlot(); });
    this.tabs.serial = { b: null, pane: h("div", { class: "lab-pane" }, this.plot, this.serialOut, h("div", { class: "lab-row" }, serialIn,
      h("button", { type: "button", class: "lab-btn", onclick: send }, "Отправить"), plotBtn,
      h("button", { type: "button", class: "lab-btn", onclick: () => { this.serialOut.textContent = ""; this.plotData = []; this.drawPlot(); } }, "Очистить"))) };
    this.tabs.props = { b: null, pane: h("div", { class: "lab-pane" }, this.propsBox) };
    this.tabs.task = { b: null, pane: h("div", { class: "lab-pane" }, this.checksBox) };
    const tabBar = h("div", { class: "lab-tabbar" }, mkTab("code", "Код"), mkTab("serial", "Serial"), mkTab("props", "Свойства"), mkTab("task", "Задание"));
    for (const t of Object.values(this.tabs)) t.pane && (t.pane.hidden = true);
    const side = h("div", { class: "lab-side" }, tabBar, ...Object.values(this.tabs).map((t) => t.pane));
    r.append(tb, h("div", { class: "lab-body" }, canvas, side));
    this.editor = new EditorView({
      doc: DEFAULT_CODE, parent: this.codeBox,
      extensions: [basicSetup, cpp(), keymap.of([indentWithTab]), EditorView.updateListener.of((u) => { if (u.docChanged) this.save(); })],
    });
    this.bindCanvas();
    this.showTab("code");
  }

  showTab(id) {
    for (const [k, t] of Object.entries(this.tabs)) { t.pane.hidden = k !== id; t.b && t.b.classList.toggle("active", k === id); }
    this.tab = id;
  }

  setStatus(text, kind = "") { this.status.textContent = text; this.status.className = "lab-status " + kind; }

  // ─────────────── Данные ───────────────
  async load() {
    let presetData = null;
    if (this.preset) {
      try { presetData = await (await fetch(`/static/lab/presets/${this.preset}.json`, { cache: "no-cache" })).json(); } catch (e) { presetData = null; }
    }
    this.presetData = presetData;
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(this.storageKey) || "null"); } catch (e) { saved = null; }
    this.applyProject(saved || presetData || this.defaultProject());
    this.checks = (presetData && presetData.checks) || [];
    this.renderChecks();
    if (presetData && presetData.task) this.showTab("task");
    else if (!this.hasUno()) this.showTab("props");
    requestAnimationFrame(() => this.fit());
  }

  defaultProject() {
    return { parts: [{ id: "uno1", type: "uno", x: 0, y: 0 }, { id: "bb1", type: "breadboard", x: 0, y: -24 * P }], wires: [], code: DEFAULT_CODE };
  }

  applyProject(pr) {
    this.stop();
    this.parts = (pr.parts || []).filter((p) => PARTS[p.type]).map((p) => ({ rot: 0, ...p, props: { ...(PARTS[p.type].props || {}), ...(p.props || {}) } }));
    this.wires = (pr.wires || []).map((w) => ({ color: "#16a34a", pts: [], ...w }));
    this.editor.dispatch({ changes: { from: 0, to: this.editor.state.doc.length, insert: pr.code ?? DEFAULT_CODE } });
    this.sel = null;
    this.renderAll();
    this.renderProps();
    this.netsDirty = true;
    if (!this._restoring) { this.history = [JSON.stringify(this.project())]; this.hpos = 0; }
  }

  // ─────────────── Отмена и повтор ───────────────
  pushHistory() {
    const snapState = JSON.stringify(this.project());
    if (this.history && this.history[this.hpos] === snapState) return;
    this.history = (this.history || []).slice(0, (this.hpos ?? -1) + 1);
    this.history.push(snapState);
    if (this.history.length > 60) this.history.shift();
    this.hpos = this.history.length - 1;
  }
  restore(i) {
    if (!this.history || i < 0 || i >= this.history.length) return;
    this.hpos = i; this._restoring = true;
    const keepCode = this.editor.state.doc.toString();
    const pr = JSON.parse(this.history[i]);
    pr.code = keepCode; // код отменяется в самом редакторе (Ctrl+Z там), здесь - только схема
    this.applyProject(pr);
    this._restoring = false; this.save();
  }
  undo() { this.restore((this.hpos ?? 0) - 1); }
  redo() { this.restore((this.hpos ?? 0) + 1); }

  project() {
    return {
      parts: this.parts.map(({ id, type, x, y, rot, props }) => ({ id, type, x, y, rot, props })),
      wires: this.wires.map(({ id, a, b, pts, color }) => ({ id, a, b, pts, color })),
      code: this.editor.state.doc.toString(),
    };
  }

  save() {
    clearTimeout(this._saveT);
    this._saveT = setTimeout(() => { try { localStorage.setItem(this.storageKey, JSON.stringify(this.project())); } catch (e) { /* storage недоступен */ } }, 300);
  }

  reset() {
    if (!confirm("Вернуть исходную схему и код? Ваши изменения будут удалены.")) return;
    try { localStorage.removeItem(this.storageKey); } catch (e) { /* ignore */ }
    this.applyProject(this.presetData || this.defaultProject());
    this.fit();
  }

  exportJson() {
    const blob = new Blob([JSON.stringify(this.project(), null, 1)], { type: "application/json" });
    const a = h("a", { href: URL.createObjectURL(blob), download: "ustem-lab-project.json" });
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  importJson(e) {
    const f = e.target.files[0]; if (!f) return;
    f.text().then((t) => { try { this.applyProject(JSON.parse(t)); this.save(); this.fit(); } catch (err) { alert("Не удалось открыть файл проекта."); } });
    e.target.value = "";
  }

  hasUno() { return this.parts.some((p) => p.type === "uno"); }

  // ─────────────── Отрисовка ───────────────
  renderAll() {
    this.gParts0.innerHTML = ""; this.gParts.innerHTML = "";
    for (const p of this.parts) this.renderPart(p);
    this.renderWires();
  }

  renderPart(p) {
    const def = PARTS[p.type];
    if (p.$g) p.$g.remove();
    const g = el("g", { class: "lab-part", "data-id": p.id }, def.layer === 0 ? this.gParts0 : this.gParts);
    const body = el("g", {}, g);
    def.render.call(def, body, p);
    for (const pin of def.pins()) {
      const c = el("circle", { cx: pin.x, cy: pin.y, r: pin.hole ? 4 : 4.5, class: "lab-pin" + (pin.hole ? " hole" : ""), "data-key": `${p.id}.${pin.name}` }, g);
      el("title", {}, c).textContent = pin.title ? `${pin.name}: ${pin.title}` : pin.name;
    }
    p.$g = g;
    this.placePart(p);
    if (def.update) def.update(p, { diodes: {}, duty: {} });
  }

  placePart(p) {
    p.$g.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${p.rot || 0})`);
    p.$g.classList.toggle("selected", this.sel && this.sel.kind === "part" && this.sel.id === p.id);
  }

  pinXY(key) {
    const [id, name] = key.split(/\.(.+)/);
    const p = this.parts.find((q) => q.id === id);
    if (!p) return null;
    const pin = PARTS[p.type].pins().find((q) => q.name === name);
    return pin ? pinPos(p, pin) : null;
  }

  renderWires() {
    this.gWires.innerHTML = "";
    this.wires = this.wires.filter((w) => this.pinXY(w.a) && this.pinXY(w.b));
    for (const w of this.wires) {
      const pts = [this.pinXY(w.a), ...(w.pts || []), this.pinXY(w.b)];
      const d = "M " + pts.map((q) => `${q.x} ${q.y}`).join(" L ");
      const selected = this.sel && this.sel.kind === "wire" && this.sel.id === w.id;
      el("path", { d, class: "lab-wire-hit", "data-wire": w.id }, this.gWires);
      el("path", { d, class: "lab-wire" + (selected ? " selected" : ""), stroke: w.color, "data-wire": w.id }, this.gWires);
      for (const q of [pts[0], pts[pts.length - 1]]) el("circle", { cx: q.x, cy: q.y, r: 3, fill: w.color }, this.gWires);
    }
  }

  applyView() { this.world.setAttribute("transform", `translate(${this.view.x} ${this.view.y}) scale(${this.view.s})`); }
  zoom(f, cx, cy) {
    const rect = this.svg.getBoundingClientRect();
    cx ??= rect.width / 2; cy ??= rect.height / 2;
    const s = Math.min(4, Math.max(0.25, this.view.s * f));
    this.view.x = cx - (cx - this.view.x) * (s / this.view.s); this.view.y = cy - (cy - this.view.y) * (s / this.view.s); this.view.s = s;
    this.applyView();
  }
  fit() {
    const rect = this.svg.getBoundingClientRect();
    if (!this.parts.length || !rect.width) { this.applyView(); return; }
    const bb = this.world.getBBox();
    const s = Math.min(2, Math.max(0.3, Math.min((rect.width - 40) / bb.width, (rect.height - 40) / bb.height)));
    this.view = { s, x: (rect.width - bb.width * s) / 2 - bb.x * s, y: (rect.height - bb.height * s) / 2 - bb.y * s };
    this.applyView();
  }
  toWorld(e) {
    const r = this.svg.getBoundingClientRect();
    return { x: (e.clientX - r.left - this.view.x) / this.view.s, y: (e.clientY - r.top - this.view.y) / this.view.s };
  }

  // ─────────────── Редактирование ───────────────
  addPart(type) {
    const def = PARTS[type];
    const rect = this.svg.getBoundingClientRect();
    const c = this.toWorld({ clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 });
    const p = { id: newId(type), type, x: snap(c.x - (def.w || 2 * P) / 2), y: snap(c.y), rot: 0, props: { ...(def.props || {}) } };
    this.parts.push(p);
    this.renderPart(p);
    this.select({ kind: "part", id: p.id });
    this.changed();
  }

  select(s) {
    this.sel = s;
    for (const p of this.parts) p.$g && this.placePart(p);
    this.renderWires();
    this.renderProps();
    if (s && this.tab !== "code" && this.tab !== "serial") this.showTab("props");
  }

  selPart() { return this.sel && this.sel.kind === "part" ? this.parts.find((p) => p.id === this.sel.id) : null; }

  rotateSel() {
    const p = this.selPart(); if (!p) return;
    p.rot = ((p.rot || 0) + 90) % 360;
    this.placePart(p); this.renderWires(); this.changed();
  }

  deleteSel() {
    if (!this.sel) return;
    if (this.sel.kind === "part") {
      const p = this.selPart();
      if (p) { p.$g.remove(); this.parts = this.parts.filter((q) => q !== p); }
    } else this.wires = this.wires.filter((w) => w.id !== this.sel.id);
    this.sel = null; this.renderWires(); this.renderProps(); this.changed();
  }

  changed() { this.netsDirty = true; this.save(); this.pushHistory(); }

  duplicateSel() {
    const p = this.selPart(); if (!p || p.type === "uno" || p.type === "breadboard") return;
    const q = { id: newId(p.type), type: p.type, x: p.x + 2 * P, y: p.y + 2 * P, rot: p.rot, props: { ...p.props } };
    this.parts.push(q); this.renderPart(q); this.select({ kind: "part", id: q.id }); this.changed();
  }

  bindCanvas() {
    const svg = this.svg;
    let drag = null;
    svg.addEventListener("pointerdown", (e) => {
      const w = this.toWorld(e);
      const pin = e.target.closest(".lab-pin");
      const press = e.target.closest(".lab-press");
      const partG = e.target.closest(".lab-part");
      const wire = e.target.dataset && e.target.dataset.wire;
      if (this.drawing) {
        if (pin) this.finishWire(pin.dataset.key);
        else { this.drawing.pts.push({ x: snap(w.x), y: snap(w.y) }); this.drawTemp(w); }
        return;
      }
      if (pin && !(this.running && press)) { this.drawing = { a: pin.dataset.key, pts: [] }; this.drawTemp(w); return; }
      if (partG) {
        const p = this.parts.find((q) => q.id === partG.dataset.id);
        if (this.running && press && p) { this.interact(p, true); drag = { kind: "press", p }; svg.setPointerCapture(e.pointerId); return; }
        this.select({ kind: "part", id: p.id });
        const riders = p.type === "breadboard" ? this.ridersOf(p) : [];
        drag = { kind: "part", p, dx: w.x - p.x, dy: w.y - p.y, riders: riders.map((q) => ({ q, ox: q.x - p.x, oy: q.y - p.y })), moved: false };
        svg.setPointerCapture(e.pointerId);
        return;
      }
      if (wire) { this.select({ kind: "wire", id: wire }); return; }
      this.select(null);
      drag = { kind: "pan", sx: e.clientX - this.view.x, sy: e.clientY - this.view.y };
      svg.setPointerCapture(e.pointerId);
    });
    svg.addEventListener("pointermove", (e) => {
      const w = this.toWorld(e);
      if (this.drawing) { this.drawTemp(w); return; }
      if (!drag) return;
      if (drag.kind === "pan") { this.userMoved = true; this.view.x = e.clientX - drag.sx; this.view.y = e.clientY - drag.sy; this.applyView(); }
      else if (drag.kind === "part") {
        const nx = snap(w.x - drag.dx), ny = snap(w.y - drag.dy);
        if (nx === drag.p.x && ny === drag.p.y) return;
        drag.p.x = nx; drag.p.y = ny; drag.moved = true; this.placePart(drag.p);
        for (const r of drag.riders) { r.q.x = nx + r.ox; r.q.y = ny + r.oy; this.placePart(r.q); }
        this.renderWires();
      }
    });
    const up = () => {
      if (drag && drag.kind === "press") this.interact(drag.p, false);
      if (drag && drag.kind === "part" && drag.moved) this.changed();
      drag = null;
    };
    svg.addEventListener("pointerup", up);
    svg.addEventListener("pointercancel", up);
    svg.addEventListener("wheel", (e) => { e.preventDefault(); const r = svg.getBoundingClientRect(); this.zoom(e.deltaY < 0 ? 1.1 : 1 / 1.1, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    this.root.tabIndex = 0;
    this.root.addEventListener("keydown", (e) => {
      if (e.target.closest(".cm-editor") || e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
      if (e.key === "Escape") { this.drawing = null; this.gTemp.innerHTML = ""; }
      else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); this.deleteSel(); }
      else if ((e.ctrlKey || e.metaKey) && (e.code === "KeyZ")) { e.preventDefault(); e.shiftKey ? this.redo() : this.undo(); }
      else if ((e.ctrlKey || e.metaKey) && e.code === "KeyY") { e.preventDefault(); this.redo(); }
      else if ((e.ctrlKey || e.metaKey) && e.code === "KeyD") { e.preventDefault(); this.duplicateSel(); }
      else if (e.code === "KeyR" && !e.ctrlKey && !e.metaKey) this.rotateSel();
    });
    // Подсветка: при наведении на вывод видно все, что с ним электрически соединено
    svg.addEventListener("pointerover", (e) => {
      const pin = e.target.closest && e.target.closest(".lab-pin");
      if (!pin) return;
      if (this.netsDirty || !this.net) this.buildNets();
      const root = this.net.nets.find(pin.dataset.key);
      let n = 0;
      for (const c of svg.querySelectorAll(".lab-pin")) { const on = this.net.nets.find(c.dataset.key) === root; c.classList.toggle("hl", on); n += on; }
      this.hlOn = true;
      if (!this.drawing && !this.running) this.setStatus(`${pin.querySelector("title")?.textContent || pin.dataset.key}: соединено выводов и отверстий - ${n}`);
    });
    svg.addEventListener("pointerout", (e) => {
      if (!this.hlOn || !(e.target.closest && e.target.closest(".lab-pin"))) return;
      for (const c of svg.querySelectorAll(".lab-pin.hl")) c.classList.remove("hl");
      this.hlOn = false;
      if (!this.drawing && !this.running) this.setStatus("");
    });
    let fitted = false;
    new ResizeObserver(() => {
      const r = svg.getBoundingClientRect();
      if (!this.userMoved && r.width > 0 && Math.abs(r.width - (this._lastW || 0)) > 40) { this._lastW = r.width; this.fit(); fitted = true; }
      else this.applyView();
    }).observe(svg);
  }

  ridersOf(bb) {
    const holes = new Set(PARTS.breadboard.pins().map((pin) => { const q = pinPos(bb, pin); return `${q.x},${q.y}`; }));
    return this.parts.filter((q) => q !== bb && q.type !== "breadboard" && q.type !== "uno" &&
      PARTS[q.type].pins().some((pin) => { const xy = pinPos(q, pin); return holes.has(`${xy.x},${xy.y}`); }));
  }

  drawTemp(w) {
    this.gTemp.innerHTML = "";
    const a = this.pinXY(this.drawing.a);
    const pts = [a, ...this.drawing.pts, { x: w.x, y: w.y }];
    el("path", { d: "M " + pts.map((q) => `${q.x} ${q.y}`).join(" L "), class: "lab-wire temp" }, this.gTemp);
    this.setStatus("Проведите провод к другому выводу. Клик по пустому месту - изгиб, Esc - отмена.");
  }

  finishWire(b) {
    const d = this.drawing;
    this.drawing = null; this.gTemp.innerHTML = ""; this.setStatus("");
    if (!b || b === d.a) return;
    const color = /GND|-|COM|K$/.test(d.a + b) && !/5V|\+/.test(d.a + b) ? "#111827" : /5V|\+|3\.3V|VIN/.test(d.a + b) ? "#dc2626" : "#16a34a";
    this.wires.push({ id: newId("w"), a: d.a, b, pts: d.pts, color });
    this.renderWires(); this.changed();
  }

  interact(p, down) {
    const def = PARTS[p.type];
    if (def.interactive === "press") p.pressed = down;
    else if (def.interactive === "toggle" && down) { p.props.on = !p.props.on; this.renderProps(); }
    else if (def.interactive === "slider" && down) { this.select({ kind: "part", id: p.id }); }
    def.update && def.update(p, this.lastState || { diodes: {} });
  }

  // ─────────────── Свойства ───────────────
  renderProps() {
    const box = this.propsBox; box.innerHTML = "";
    if (!this.sel) { box.append(h("p", { class: "lab-muted" }, "Выберите деталь или провод на схеме. Детали добавляются кнопкой «+ Деталь». Провод: нажмите на вывод детали или отверстие платы, затем на второй вывод.")); return; }
    if (this.sel.kind === "wire") {
      const w = this.wires.find((q) => q.id === this.sel.id); if (!w) return;
      box.append(h("h4", {}, "Провод"), h("p", { class: "lab-muted" }, `${w.a} → ${w.b}`),
        h("div", { class: "lab-swatches" }, ...Object.entries(WIRE_COLORS).map(([c, t]) => h("button", { type: "button", title: t, class: "lab-swatch", style: `background:${c}`, onclick: () => { w.color = c; this.renderWires(); this.save(); } }))),
        h("button", { type: "button", class: "lab-btn danger", onclick: () => this.deleteSel() }, "Удалить провод"));
      return;
    }
    const p = this.selPart(); if (!p) return;
    const def = PARTS[p.type];
    const rerender = () => { this.renderPart(p); this.renderWires(); this.renderProps(); this.changed(); };
    box.append(h("h4", {}, def.title));
    if (def.info) box.append(h("p", { class: "lab-muted" }, def.info.call(def, p)));
    const field = (title, input) => box.append(h("label", { class: "lab-field" }, h("span", {}, title), input));
    const select = (opts, value, on) => { const s = h("select", { class: "lab-input" }, ...opts.map(([v, t]) => h("option", { value: v, selected: String(v) === String(value) }, t))); s.addEventListener("change", () => on(s.value)); return s; };
    if (p.type === "resistor") field("Сопротивление", select(RESISTOR_VALUES.map((v) => [v, fmtOhm(v)]), p.props.r, (v) => { p.props.r = +v; rerender(); }));
    if (p.type === "led") field("Цвет", select(Object.entries(LED_COLORS).map(([k, c]) => [k, c.label]), p.props.color, (v) => { p.props.color = v; p.burnt = false; rerender(); }));
    if (p.type === "led" && p.burnt) box.append(h("button", { type: "button", class: "lab-btn", onclick: () => { p.burnt = false; rerender(); } }, "Заменить сгоревший светодиод"));
    if (p.type === "battery") field("Напряжение", select([[1.5, "1,5 В"], [3, "3 В (2 x AA)"], [4.5, "4,5 В"], [9, "9 В"]], p.props.v, (v) => { p.props.v = +v; rerender(); }));
    if (p.type === "pot") field("Номинал", select([[1000, "1 кОм"], [10000, "10 кОм"], [100000, "100 кОм"]], p.props.r, (v) => { p.props.r = +v; rerender(); }));
    if (p.type === "meter") field("Режим", select([["V", "Напряжение, В"], ["A", "Ток, мА"], ["R", "Сопротивление, Ом"]], p.props.mode, (v) => { p.props.mode = v; rerender(); }));
    if (p.type === "switch") field("Состояние", select([["0", "Выключен"], ["1", "Включен"]], p.props.on ? "1" : "0", (v) => { p.props.on = v === "1"; rerender(); }));
    if (def.interactive === "slider") {
      const s = h("input", { type: "range", min: 0, max: 100, value: Math.round(p.props[def.sliderProp] * 100), class: "lab-range" });
      s.addEventListener("input", () => { p.props[def.sliderProp] = s.value / 100; def.update(p, this.lastState || { diodes: {} }); this.netsDirty = true; this.save(); });
      field(def.sliderLabel, s);
    }
    for (const sl of def.sliders || []) {
      const out = h("span", { class: "lab-muted" }, String(p.props[sl.prop]));
      const s2 = h("input", { type: "range", min: sl.min, max: sl.max, step: sl.step || 1, value: p.props[sl.prop], class: "lab-range" });
      s2.addEventListener("input", () => { p.props[sl.prop] = +s2.value; out.textContent = s2.value; def.update && def.update(p, this.lastState || { diodes: {} }); this.netsDirty = true; this.save(); });
      box.append(h("label", { class: "lab-field" }, h("span", {}, sl.label, " ", out), s2));
    }
    if (def.interactive === "press") box.append(h("p", { class: "lab-muted" }, "Во время симуляции нажмите на кнопку на схеме и удерживайте."));
    box.append(h("div", { class: "lab-row" },
      h("button", { type: "button", class: "lab-btn", onclick: () => this.rotateSel() }, "Повернуть"),
      h("button", { type: "button", class: "lab-btn danger", onclick: () => this.deleteSel() }, "Удалить")));
  }

  // ─────────────── Схема -> узлы ───────────────
  buildNets() {
    const nets = new Nets();
    const key = (p, name) => `${p.id}.${name}`;
    const holes = new Map();
    for (const p of this.parts) {
      const def = PARTS[p.type];
      for (const pin of def.pins()) nets.find(key(p, pin.name));
      if (def.links) for (const [a, b] of def.links((n) => key(p, n), p)) nets.union(a, b);
      if (p.type === "breadboard") for (const pin of def.pins()) { const q = pinPos(p, pin); holes.set(`${q.x},${q.y}`, key(p, pin.name)); }
    }
    for (const p of this.parts) {
      if (p.type === "breadboard") continue;
      for (const pin of PARTS[p.type].pins()) { const q = pinPos(p, pin); const hk = holes.get(`${q.x},${q.y}`); if (hk) nets.union(key(p, pin.name), hk); }
    }
    for (const w of this.wires) nets.union(w.a, w.b);
    // Номера узлов; земля - GND Arduino, иначе минус батарейки
    const roots = new Map();
    const uno = this.parts.find((p) => p.type === "uno");
    const bat = this.parts.find((p) => p.type === "battery");
    const gndKey = uno ? key(uno, "GND.1") : bat ? key(bat, "-") : null;
    if (gndKey) roots.set(nets.find(gndKey), 0);
    let next = gndKey ? 1 : 0;
    const node = (k) => { const r = nets.find(k); if (!roots.has(r)) roots.set(r, next++); return roots.get(r); };
    for (const p of this.parts) for (const pin of PARTS[p.type].pins()) node(key(p, pin.name));
    if (!gndKey && next === 0) next = 1;
    this.net = { node, count: Math.max(next, 1) + (gndKey ? 0 : 0), nets, uno };
    // Какие пины Arduino на каких узлах (для серво и пищалки)
    this.unoPinsByNode = new Map();
    if (uno) for (const name of Object.keys(PIN_MAP)) { const n = node(key(uno, name)); (this.unoPinsByNode.get(n) || this.unoPinsByNode.set(n, []).get(n)).push(name); }
    this.netsDirty = false;
    this.setupSonars();
  }

  setupSonars() {
    if (!this.uno || !this.net) return;
    const list = [];
    for (const p of this.parts) {
      if (p.type !== "sonar") continue;
      const trig = (this.unoPinsByNode.get(this.net.node(`${p.id}.TRIG`)) || [])[0];
      const echo = (this.unoPinsByNode.get(this.net.node(`${p.id}.ECHO`)) || [])[0];
      if (trig && echo) list.push({ trig, echo, cm: () => p.props.dist, ok: () => (p.$pwr ?? 0) > 4 });
    }
    this.uno.setSonars(list);
  }

  // ─────────────── Симуляция ───────────────
  async start() {
    if (this.running) return;
    this.buildNets();
    this.serialOut.textContent = ""; this.plotData = []; this.serialLine = ""; this.drawPlot();
    if (this.hasUno()) {
      const code = this.editor.state.doc.toString();
      if (this.compiledFor !== code) {
        this.setStatus("Компиляция...", "busy");
        this.compileOut.textContent = "Компиляция...";
        try {
          const res = await fetch(this.compileUrl, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf() }, body: JSON.stringify({ code }) });
          const data = await res.json().catch(() => ({ ok: false, error: "Сервер не ответил" }));
          if (!data.ok) { this.compileOut.textContent = data.error || "Ошибка компиляции"; this.compileOut.classList.add("err"); this.showTab("code"); this.setStatus("Ошибка в коде: смотрите вкладку «Код»", "err"); return; }
          this.hex = data.hex; this.compiledFor = code;
          this.compileOut.classList.remove("err");
          this.compileOut.textContent = `Готово: скетч занимает ${data.size} байт из 32 256.`;
        } catch (e) { this.compileOut.textContent = "Нет связи с сервером компиляции."; this.setStatus("Нет связи с сервером", "err"); return; }
      }
      this.uno = new Uno(this.hex, { onSerial: (ch) => this.onSerial(ch) });
      this.setupSonars();
    } else this.uno = null;
    for (const p of this.parts) if (p.type === "led") p.burnt = false;
    this.running = true; this.simTime = 0; this.checkState = {};
    this.btnRun.textContent = "■ Стоп"; this.btnRun.classList.add("on");
    this.setStatus(this.uno ? "Симуляция работает" : "Цепь под напряжением", "ok");
    this.root.classList.add("running");
    this.lastT = performance.now();
    const loop = (t) => { if (!this.running) return; this.step(Math.min(0.05, (t - this.lastT) / 1000)); this.lastT = t; this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    if (!this.running) return;
    this.running = false; cancelAnimationFrame(this.raf); this.uno = null;
    this.btnRun.textContent = "▶ Старт"; this.btnRun.classList.remove("on");
    this.root.classList.remove("running");
    this.setStatus("");
    for (const t of Object.values(this.tones)) t.gain.gain.value = 0;
    const blank = { diodes: {}, duty: {}, servo: {}, tone: {}, meter: {} };
    for (const p of this.parts) PARTS[p.type].update && PARTS[p.type].update(p, blank);
  }

  step(dt) {
    if (this.netsDirty) this.buildNets();
    const { node, count } = this.net;
    let stats = null;
    if (this.uno) { stats = this.uno.run(Math.round(FREQ * dt)); this.simTime = this.uno.seconds; } else this.simTime += dt;
    // Базовые элементы деталей
    const base = [];
    for (const p of this.parts) {
      const def = PARTS[p.type];
      if (def.model) for (const e of def.model.call(def, p, (n) => node(`${p.id}.${n}`))) base.push(e);
    }
    // Выводы Arduino: PWM усредняем, считая цепь в нескольких точках периода
    const unoP = this.net.uno;
    const outPins = [];
    if (stats) for (const name of Object.keys(PIN_MAP)) {
      const m = this.uno.mode(name);
      outPins.push({ name, m, duty: m === "high" || m === "low" ? stats[name].duty : 0, n: node(`${unoP.id}.${name}`) });
    }
    const pwm = outPins.some((o) => o.duty > 0.02 && o.duty < 0.98);
    const K = pwm ? 8 : 1;
    const acc = { v: new Array(count).fill(0), diodes: {}, maxI: {} };
    let lastSol = null;
    for (let s = 0; s < K; s++) {
      const th = (s + 0.5) / K;
      const els = base.slice();
      for (const o of outPins) {
        if (o.m === "high" || o.m === "low") els.push({ type: "V", p: o.n, n: 0, v: o.duty > th || (K === 1 && o.m === "high") ? 5 : 0, r: 25 });
        else if (o.m === "pullup") els.push({ type: "V", p: o.n, n: 0, v: 5, r: 35000 });
      }
      const sol = solve(count, els);
      lastSol = sol;
      for (let i = 0; i < count; i++) acc.v[i] += sol.v[i] / K;
      for (const [k, d] of Object.entries(sol.diodes)) { acc.diodes[k] = acc.diodes[k] || { i: 0 }; acc.diodes[k].i += d.i / K; acc.maxI[k] = Math.max(acc.maxI[k] || 0, d.i); }
    }
    // Входы Arduino
    if (stats) for (const o of outPins) if (o.m === "input" || o.m === "pullup") this.uno.setInput(o.name, acc.v[o.n]);
    // Состояние для отрисовки
    const st = { diodes: acc.diodes, duty: {}, servo: {}, tone: {}, meter: {}, meterVal: {}, motor: {}, running: true, pin13: stats && stats["13"].duty > 0.3, tx: this.uno && this.uno.txAt && (this.uno.cpu.cycles - this.uno.txAt) < FREQ * 0.05 };
    const vd = (p, a, b) => acc.v[node(`${p.id}.${a}`)] - acc.v[node(`${p.id}.${b}`)];
    for (const p of this.parts) {
      if (p.type === "led") { const mi = acc.maxI[p.id] || 0; if (mi > 0.04) p.burnt = true; }
      if (p.type === "motor") st.motor[p.id] = vd(p, "+", "-") / 20;
      if (p.type === "tmp36") p.$pwr = vd(p, "+Vs", "GND");
      if (p.type === "sonar") p.$pwr = vd(p, "VCC", "GND");
      if (p.type === "servo" && stats) {
        const pins = this.unoPinsByNode.get(node(`${p.id}.SIG`)) || [];
        for (const pn of pins) { const pu = stats[pn].pulse; if (pu && pu > 400 && pu < 2700) st.servo[p.id] = Math.max(0, Math.min(180, (pu - 544) / (2400 - 544) * 180)); }
      }
      if (p.type === "buzzer") {
        const pins = stats ? (this.unoPinsByNode.get(node(`${p.id}.+`)) || []) : [];
        let f = 0;
        for (const pn of pins) if (stats[pn].freq > 30 && stats[pn].duty > 0.05 && stats[pn].duty < 0.95) f = stats[pn].freq;
        const vdrop = acc.v[node(`${p.id}.+`)] - acc.v[node(`${p.id}.-`)];
        if (!f && vdrop > 2) f = 2300; // активная пищалка от постоянного напряжения
        st.tone[p.id] = f; this.tone(p.id, f);
      }
      if (p.type === "meter") {
        const vin = acc.v[node(`${p.id}.IN`)], vcom = acc.v[node(`${p.id}.COM`)];
        const d = vin - vcom;
        st.meterVal[p.id] = p.props.mode === "V" ? d : p.props.mode === "A" ? d / 0.01 * 1000 : Math.round(1000 * d / (1 - d));
        if (p.props.mode === "V") st.meter[p.id] = `${d.toFixed(2).replace(".", ",")} В`;
        else if (p.props.mode === "A") st.meter[p.id] = `${(d / 0.01 * 1000).toFixed(1).replace(".", ",")} мА`;
        else st.meter[p.id] = d > 0.999 ? "OL" : fmtOhm(Math.round(1000 * d / (1 - d)));
      }
    }
    this.lastState = st;
    if (this.plotDirty) { this.plotDirty = false; this.drawPlot(); }
    for (const p of this.parts) PARTS[p.type].update && PARTS[p.type].update(p, st);
    this.evalChecks(st, stats);
  }

  onSerial(ch) {
    const o = this.serialOut;
    o.textContent += ch;
    if (o.textContent.length > 20000) o.textContent = o.textContent.slice(-15000);
    o.scrollTop = 1e9;
    if (ch === "\n") {
      const nums = (this.serialLine.match(/-?\d+(?:[.,]\d+)?/g) || []).slice(0, 3).map((x) => parseFloat(x.replace(",", ".")));
      if (nums.length) { this.plotData.push(nums); if (this.plotData.length > 300) this.plotData.shift(); this.lastNums = nums; this.plotDirty = true; }
      this.serialLine = "";
    } else if (ch !== "\r") this.serialLine += ch;
  }

  drawPlot() {
    const c = this.plot; if (!c || c.hidden) return;
    const ctx = c.getContext("2d"), W = c.width, H = c.height;
    ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, W, H);
    const d = this.plotData;
    if (!d.length) { ctx.fillStyle = "#94a3b8"; ctx.font = "13px Inter, Arial"; ctx.fillText("Выводите числа через Serial.println - здесь появится график", 12, H / 2); return; }
    let lo = Infinity, hi = -Infinity;
    for (const r of d) for (const x of r) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
    if (hi - lo < 1e-9) { hi += 1; lo -= 1; }
    const pad = (hi - lo) * 0.08; hi += pad; lo -= pad;
    const X = (i) => 36 + (W - 44) * (i / Math.max(1, 299)), Y = (v) => H - 14 - (H - 26) * ((v - lo) / (hi - lo));
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 1; ctx.fillStyle = "#94a3b8"; ctx.font = "11px Inter, Arial";
    for (const v of [lo + pad, (lo + hi) / 2, hi - pad]) { ctx.beginPath(); ctx.moveTo(36, Y(v)); ctx.lineTo(W - 8, Y(v)); ctx.stroke(); ctx.fillText(String(+v.toFixed(1)), 2, Y(v) + 4); }
    const colors = ["#38bdf8", "#f472b6", "#a3e635"];
    for (let k = 0; k < 3; k++) {
      ctx.strokeStyle = colors[k]; ctx.lineWidth = 2; ctx.beginPath(); let started = false;
      d.forEach((r, i) => { if (r[k] === undefined) return; const x = X(i + 300 - d.length), y = Y(r[k]); if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y); });
      ctx.stroke();
    }
  }

  tone(id, f) {
    if (!this.audio) { try { this.audio = new AudioContext(); } catch (e) { return; } }
    let t = this.tones[id];
    if (!t) {
      const osc = this.audio.createOscillator(); const gain = this.audio.createGain();
      osc.type = "square"; gain.gain.value = 0; osc.connect(gain).connect(this.audio.destination); osc.start();
      t = this.tones[id] = { osc, gain };
    }
    if (f > 0) { t.osc.frequency.setTargetAtTime(Math.min(f, 8000), this.audio.currentTime, 0.01); t.gain.gain.value = 0.04; } else t.gain.gain.value = 0;
  }

  // ─────────────── Проверка задания ───────────────
  renderChecks() {
    const box = this.checksBox; box.innerHTML = "";
    const pd = this.presetData;
    if (pd && pd.title) box.append(h("h4", {}, pd.title));
    if (pd && pd.task) box.append(h("div", { class: "lab-task" }, ...pd.task.split("\n").map((l) => h("p", {}, l))));
    if (!this.checks.length) { if (!pd) box.append(h("p", { class: "lab-muted" }, "Свободная лаборатория: собирайте любые схемы. Задания с автопроверкой есть в уроках курса.")); return; }
    box.append(h("p", { class: "lab-muted" }, "Нажмите «Старт»: проверка идет во время симуляции."));
    this.checkEls = this.checks.map((c) => { const li = h("li", {}, c.label); return li; });
    box.append(h("ul", { class: "lab-checklist" }, ...this.checkEls));
    this.doneEl = h("div", { class: "lab-done", hidden: true }, "Задание выполнено! Отметьте урок как пройденный.");
    box.append(this.doneEl);
  }

  // Выход должен совпадать с условием и когда условие выполнено, и когда нет (раздельный счет для двух состояний)
  agreeBoth(s, cond, outOn) {
    const k = cond ? "on" : "off";
    s[k + "N"] = (s[k + "N"] || 0) + 1;
    if (outOn === cond) s[k + "Ok"] = (s[k + "Ok"] || 0) + 1;
    const r = (x) => (s[x + "Ok"] || 0) / (s[x + "N"] || 1);
    return (s.onN || 0) > 10 && (s.offN || 0) > 10 && r("on") > 0.85 && r("off") > 0.85;
  }

  evalChecks(st, stats) {
    if (!this.checks.length) return;
    const cs = this.checkState;
    this.checks.forEach((c, i) => {
      const s = cs[i] ||= { ok: false, hist: [], levels: new Set(), lastOn: null, edges: [] };
      if (s.ok) return;
      const part = this.parts.find((p) => p.id === c.part) || this.parts.find((p) => p.type === c.partType);
      const bright = part ? (part.brightness || 0) : 0;
      if (c.type === "led_on") s.ok = bright > 0.25;
      else if (c.type === "led_current") { const i = part ? (st.diodes[part.id]?.i || 0) * 1000 : 0; s.ok = i >= c.min_ma && i <= c.max_ma; }
      else if (c.type === "blink") {
        const on = bright > 0.25;
        if (s.lastOn === false && on) { s.edges.push(this.simTime); if (s.edges.length > 4) s.edges.shift(); }
        s.lastOn = on;
        if (s.edges.length >= 3) { const per = (s.edges[s.edges.length - 1] - s.edges[0]) / (s.edges.length - 1) * 1000; s.ok = per >= c.min_ms && per <= c.max_ms; }
      } else if (c.type === "fade") { if (part) s.levels.add(Math.round((part.brightness || 0) * 10)); s.ok = s.levels.size >= (c.levels || 5); }
      else if (c.type === "serial") s.ok = this.serialOut.textContent.includes(c.text);
      else if (c.type === "servo") s.ok = part && st.servo[part.id] !== undefined && Math.abs(st.servo[part.id] - c.angle) <= (c.tol || 10);
      else if (c.type === "servo_track") {
        // Угол повторяет ручку: совпадение в трех разных положениях (начало, середина, конец)
        const src = this.parts.find((p) => p.id === c.src);
        const a = part ? st.servo[part.id] : undefined;
        if (src && a !== undefined) {
          const pos = src.props.pos;
          if (Math.abs(a - pos * 180) <= (c.tol || 12)) s.levels.add(pos < 0.3 ? "lo" : pos > 0.7 ? "hi" : "mid");
        }
        s.ok = s.levels.size >= 3;
      }
      else if (c.type === "tone") s.ok = part && st.tone[part.id] > 0;
      else if (c.type === "meter") { const v = part ? st.meterVal[part.id] : undefined; s.ok = part && part.props.mode === c.mode && v !== undefined && v >= c.min && v <= c.max; }
      else if (c.type === "serial_num") {
        const src = this.parts.find((p) => p.id === c.part);
        const last = this.lastNums && this.lastNums[0];
        if (src && last !== undefined) { const want = src.props[c.prop]; s.ok = Math.abs(last - want) <= (c.tol || 1); }
      } else if (c.type === "colors") {
        if (part && (part.brightness || 0) > 0.3) {
          const ch = ["r", "g", "b"].map((k) => st.diodes[`${part.id}:${k}`]?.i || 0);
          const m = Math.max(...ch);
          s.levels.add(ch.map((x) => (x > m * 0.5 ? 1 : 0)).join(""));
        }
        s.ok = s.levels.size >= (c.count || 3);
      } else if (c.type === "motor_levels") { if (part) s.levels.add(Math.round(Math.abs(part.speed || 0) * 5)); s.ok = s.levels.size >= (c.levels || 3); }
      else if (c.type === "follow") {
        // Выход (светодиод, пищалка, мотор) включен тогда и только тогда, когда выполнено условие на свойстве детали-источника
        const src = this.parts.find((p) => p.id === c.src);
        if (part && src) {
          const outOn = part.type === "buzzer" ? st.tone[part.id] > 0 : part.type === "motor" ? Math.abs(part.speed || 0) > 0.1 : (part.brightness || 0) > 0.25;
          const val = src.props[c.prop];
          const cond = c.lt !== undefined ? val < c.lt : val > c.gt;
          const t = this.simTime;
          if (s.lastCond !== cond) { s.lastCond = cond; s.since = t; }
          if (t - s.since > (c.settle || 0.4)) s.ok = this.agreeBoth(s, cond, outOn);
        }
      }
      else if (c.type === "button_led") {
        // Пока кнопка нажата - светодиод горит, отпущена - не горит
        const btn = this.parts.find((p) => p.type === "button");
        const led = part;
        if (btn && led) {
          const pressed = !!btn.pressed;
          if (s.lastCond !== pressed) { s.lastCond = pressed; s.since = this.simTime; }
          if (this.simTime - s.since > 0.15) s.ok = this.agreeBoth(s, pressed, (led.brightness || 0) > 0.25);
        }
      }
      if (s.ok) this.checkEls[i].classList.add("ok");
    });
    if (this.checks.every((_, i) => cs[i] && cs[i].ok) && this.doneEl.hidden) {
      this.doneEl.hidden = false;
      if (window.academySolved && this.preset) window.academySolved("lab-" + this.preset);
    }
  }
}

const instances = [];
function mount() {
  for (const node of document.querySelectorAll(".lab-embed, [class*='lab-preset-']")) {
    if (node.dataset.mounted) continue;
    node.dataset.mounted = "1";
    const m = node.className.match(/lab-preset-([\w-]+)/);
    const preset = m ? m[1] : null;
    const wrap = document.createElement("div");
    node.replaceWith(wrap);
    instances.push(new Lab(wrap, { preset, storageKey: preset ? "lab:" + preset : "lab:sandbox", compileUrl: document.body.dataset.labCompile || "/lab/compile" }));
  }
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
window.USTEMLab = { Lab, mount, instances };
