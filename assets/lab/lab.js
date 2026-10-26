// Лаборатория электроники USTEM: макетная плата, 60+ деталей, платы Arduino Uno, Nano, Mega 2560 (C++),
// Raspberry Pi Pico, ESP32, micro:bit (MicroPython), расчет цепи, протоколы устройств, 3D-вид и примеры.
import { localize, trPreset, trCode, tr, onReady } from "./i18n/index.js";
import { EditorView, basicSetup } from "codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { keymap } from "@codemirror/view";
import { Compartment } from "@codemirror/state";
import { indentWithTab } from "@codemirror/commands";
import { PARTS, GROUPS, P, el, pinPos, installDefs, fmtOhm } from "./parts/index.js";
import { solve, Nets } from "./solver.js";
import { AvrMcu, FREQ } from "./mcu/avr.js";
import { Rp2040Mcu } from "./mcu/rp2040.js";
import { PyMcu } from "./mcu/pyboard.js";
import { EXAMPLES, DEFAULT_CODE } from "./examples.js";
import { View3D } from "./view3d.js";

const SCRIPT_SRC = (document.currentScript && document.currentScript.src) || "/static/js/lab.js";
const STATIC = new URL("/static/", location.href).href;
const WIRE_COLORS = { "#2f9e44": "Зеленый", "#e03131": "Красный", "#212529": "Черный", "#1971c2": "Синий", "#f08c00": "Оранжевый", "#9c36b5": "Фиолетовый", "#f8f9fa": "Белый", "#fab005": "Желтый" };
const csrf = () => (document.querySelector('meta[name="csrf-token"]') || {}).content || "";
const snap = (v) => Math.round(v / P) * P;
let uid = 0;
const newId = (type) => `${type}${Date.now().toString(36)}${(uid++).toString(36)}`;
const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v; else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(k));
  return e;
};
const LANG = { cpp: { file: "sketch.ino", name: "C++ (Arduino)" }, py: { file: "main.py", name: "MicroPython" } };
const BOARD_ORDER = ["uno", "nano", "mega", "pico", "esp32", "microbit"];

let mpModule = null, picoUf2 = null, picoShared = null;
const loadMP = async () => { if (!mpModule) mpModule = await import(STATIC + "spikesim/micropython.mjs"); return mpModule.loadMicroPython; };

class Lab {
  constructor(root, { preset = null, storageKey = "lab:sandbox", compileUrl = "/lab/compile" } = {}) {
    this.root = root; this.preset = preset; this.storageKey = storageKey; this.compileUrl = compileUrl;
    this.parts = []; this.wires = []; this.checks = [];
    this.view = { x: 20, y: 20, s: 1 };
    this.sel = null; this.drawing = null; this.running = false; this.mcu = null; this.compiled = null;
    this.audio = null; this.tones = {}; this.mode = "2d";
    this.build();
    this.load();
  }

  // ─────────────── Разметка ───────────────
  build() {
    const r = this.root;
    r.classList.add("lab"); r.innerHTML = "";
    const svgIcon = (d) => { const n = document.createElementNS("http://www.w3.org/2000/svg", "svg"); n.setAttribute("viewBox", "0 0 24 24"); n.setAttribute("aria-hidden", "true"); n.innerHTML = d; return n; };
    // палитра деталей с поиском
    this.palSearch = h("input", { class: "lab-input", type: "search", placeholder: "Поиск: светодиод, датчик, ESP32...", "aria-label": "Поиск детали" });
    this.palList = h("div", { class: "lab-plist" });
    this.palette = h("div", { class: "lab-palette" }, this.palSearch, this.palList);
    this.palSearch.addEventListener("input", () => this.renderPalette());
    this.renderPalette();

    // ─── IDE: как Arduino IDE 2 / Thonny ───
    const round = (title, d, onclick, cls = "") => h("button", { type: "button", class: "ide-round " + cls, title, "aria-label": title, onclick }, svgIcon(d));
    this.btnVerify = round("Проверить (скомпилировать)", '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>', () => this.verify());
    this.btnUpload = round("Загрузить и запустить", '<path d="M5 12h12M12 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>', () => (this.running ? this.restart() : this.start()));
    this.boardSel = h("select", { class: "ide-select", "aria-label": "Плата", title: "Плата: сменить плату в схеме" });
    for (const b of BOARD_ORDER) this.boardSel.append(h("option", { value: b }, PARTS[b].title));
    this.boardSel.addEventListener("change", () => this.switchBoard(this.boardSel.value));
    this.exMenu = h("div", { class: "lab-menu lab-exmenu" });
    const examples = h("details", { class: "lab-more ide-ex" }, h("summary", { class: "ide-btn" }, "Примеры"), this.exMenu);
    this.renderExamples();
    const ide = h("div", { class: "ide-bar" }, this.btnVerify, this.btnUpload, h("div", { class: "ide-board" }, svgIcon('<rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 6V3M12 6V3M16 6V3M8 21v-3M12 21v-3M16 21v-3" stroke="currentColor" stroke-width="1.8"/>'), this.boardSel), examples,
      h("span", { class: "lab-grow" }),
      round("Плоттер по порту", '<path d="M3 17l5-6 4 4 5-8 4 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>', () => { this.showTab("serial"); this.togglePlot(true); }, "ide-sm"),
      round("Монитор порта", '<circle cx="10.5" cy="10.5" r="5.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M15 15l5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>', () => this.showTab("serial"), "ide-sm"));
    this.fileTab = h("span", { class: "ide-tab" }, "sketch.ino");
    this.libInfo = h("span", { class: "ide-libs" });
    this.codeBox = h("div", { class: "lab-code" });
    this.compileOut = h("pre", { class: "lab-out" });
    this.serialOut = h("pre", { class: "lab-serial" });
    const serialIn = h("input", { class: "lab-input", placeholder: "Сообщение (Enter - отправить в плату)" });
    const send = () => { if (this.mcu && serialIn.value) { this.mcu.serialWrite(serialIn.value + "\n"); serialIn.value = ""; } };
    serialIn.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });
    this.plot = h("canvas", { class: "lab-plot", width: 600, height: 200, hidden: true });
    this.plotData = []; this.serialLine = "";
    this.plotBtn = h("button", { type: "button", class: "lab-mini", title: "Числа из Serial в виде графика", onclick: () => this.togglePlot() }, "График");
    this.tabs = {};
    const mkTab = (id, title, cls) => { const b = h("button", { type: "button", class: cls, role: "tab", onclick: () => this.showTab(id) }, title); this.tabs[id].b = b; return b; };
    this.tabs.output = { pane: h("div", { class: "ide-pane" }, this.compileOut) };
    this.tabs.serial = { pane: h("div", { class: "ide-pane ide-serial" }, h("div", { class: "lab-row" }, serialIn, h("button", { type: "button", class: "lab-mini", onclick: send }, "Отправить"), this.plotBtn,
      h("button", { type: "button", class: "lab-mini", onclick: () => { this.serialOut.textContent = ""; this.plotData = []; this.drawPlot(); } }, "Очистить")), this.plot, this.serialOut) };
    const bottom = h("div", { class: "ide-bottom" }, h("div", { class: "ide-btabs", role: "tablist" }, mkTab("output", "Вывод", "ide-btab"), mkTab("serial", "Монитор порта", "ide-btab")), this.tabs.output.pane, this.tabs.serial.pane);
    const ideCol = h("section", { class: "ide" }, ide, h("div", { class: "ide-tabs" }, this.fileTab, h("span", { class: "lab-grow" }), this.libInfo), this.codeBox, bottom);

    // ─── Симуляция ───
    this.btnRun = h("button", { type: "button", class: "sim-play", title: "Запустить симуляцию", "aria-label": "Запустить симуляцию", onclick: () => (this.running ? this.stop() : this.start()) }, "▶");
    this.simClock = h("span", { class: "sim-clock" }, "00:00.000");
    this.speedEl = h("span", { class: "sim-speed", title: "Скорость симуляции относительно реального времени" });
    const tool = (title, text, onclick) => h("button", { type: "button", class: "lab-mini", title, "aria-label": title, onclick }, text);
    this.viewBtns = {};
    const vb = (id, text, title) => { const b = h("button", { type: "button", class: "lab-seg", title, onclick: () => this.setMode(id) }, text); this.viewBtns[id] = b; return b; };
    const simBar = h("div", { class: "sim-bar" }, this.btnRun, this.simClock, this.speedEl,
      h("div", { class: "lab-add" }, h("button", { type: "button", class: "lab-mini lab-addbtn", onclick: () => { this.palette.classList.toggle("open"); if (this.palette.classList.contains("open")) this.palSearch.focus({ preventScroll: true }); } }, "+ Деталь"), this.palette),
      h("span", { class: "lab-grow" }),
      tool("Отменить (Ctrl+Z)", "↶", () => this.undo()), tool("Повторить (Ctrl+Y)", "↷", () => this.redo()),
      tool("Повернуть (R)", "⟳", () => this.rotateSel()), tool("Копия детали (Ctrl+D)", "⧉", () => this.duplicateSel()), tool("Удалить (Delete)", "✕", () => this.deleteSel()),
      h("span", { class: "lab-sep" }),
      tool("Приблизить", "+", () => this.zoom(1.2)), tool("Отдалить", "-", () => this.zoom(1 / 1.2)), tool("Показать все", "⤢", () => this.fit()),
      h("span", { class: "lab-sep" }),
      h("div", { class: "lab-segs", role: "group", "aria-label": "Вид" }, vb("2d", "2D", "Схема на макетной плате"), vb("3d", "3D", "Объемный вид"), vb("split", "2D + 3D", "Оба вида")),
      h("details", { class: "lab-more" }, h("summary", { class: "lab-mini", title: "Проект" }, "Проект"),
        h("div", { class: "lab-menu" },
          h("button", { type: "button", onclick: () => this.reset() }, "Вернуть исходную схему и код"),
          h("button", { type: "button", onclick: () => this.clearAll() }, "Новый пустой проект"),
          h("button", { type: "button", onclick: () => this.exportJson() }, "Скачать проект"),
          h("label", {}, "Открыть проект", h("input", { type: "file", accept: ".json", hidden: true, onchange: (e) => this.importJson(e) })))),
      tool("Во весь экран", "⛶", () => { this.root.classList.toggle("lab-full"); setTimeout(() => this.v3 && this.v3.resize(), 50); }));
    this.svg = el("svg", { class: "lab-svg" });
    installDefs(this.svg);
    this.world = el("g", {}, this.svg);
    this.gParts0 = el("g", {}, this.world); this.gParts = el("g", {}, this.world); this.gWires = el("g", {}, this.world); this.gTemp = el("g", {}, this.world);
    this.status = h("div", { class: "lab-status" }, "");
    this.host3d = h("div", { class: "lab-3d", hidden: true });
    this.canvasBox = h("div", { class: "lab-canvas" }, this.svg, this.host3d, this.status);
    this.propsBox = h("div", { class: "lab-props" });
    this.checksBox = h("div", { class: "lab-checks" });
    this.tabs.props = { pane: h("div", { class: "lab-pane" }, this.propsBox) };
    this.tabs.task = { pane: h("div", { class: "lab-pane" }, this.checksBox) };
    const side = h("div", { class: "lab-side" }, h("div", { class: "lab-tabbar", role: "tablist" }, mkTab("task", "Задание", "lab-tab"), mkTab("props", "Свойства", "lab-tab")), this.tabs.task.pane, this.tabs.props.pane);
    const simCol = h("section", { class: "sim" }, simBar, this.canvasBox, side);
    r.append(h("div", { class: "lab-body" }, ideCol, simCol));
    this.langComp = new Compartment();
    this.editor = new EditorView({
      doc: DEFAULT_CODE.uno, parent: this.codeBox,
      extensions: [basicSetup, this.langComp.of(cpp()), keymap.of([indentWithTab, { key: "Mod-u", run: () => { this.running ? this.restart() : this.start(); return true; } }, { key: "Mod-r", run: () => { this.verify(); return true; } }]),
        EditorView.updateListener.of((u) => { if (u.docChanged) this.save(); })],
    });
    this.bindCanvas();
    this.showTab("output"); this.showTab("task");
    this.setMode("2d");
  }

  renderPalette() {
    const q = (this.palSearch.value || "").trim().toLowerCase();
    this.palList.innerHTML = "";
    const groups = {};
    for (const [type, def] of Object.entries(PARTS)) {
      if (q && !(def.title + " " + (def.desc || "") + " " + type).toLowerCase().includes(q)) continue;
      (groups[def.group] ||= []).push([type, def]);
    }
    for (const g of GROUPS) {
      if (!groups[g]) continue;
      this.palList.append(h("div", { class: "lab-pgroup" }, h("div", { class: "lab-pgtitle" }, g),
        ...groups[g].map(([type, def]) => h("button", { type: "button", class: "lab-pbtn", title: def.desc || "", onclick: () => { this.addPart(type); this.palette.classList.remove("open"); } }, def.title))));
    }
    if (!this.palList.children.length) this.palList.append(h("p", { class: "lab-muted" }, "Ничего не найдено"));
  }

  renderExamples() {
    const m = this.exMenu; m.innerHTML = "";
    const byGroup = {};
    for (const ex of EXAMPLES) (byGroup[ex.group] ||= []).push(ex);
    for (const [g, list] of Object.entries(byGroup)) {
      m.append(h("div", { class: "lab-mgroup" }, g));
      for (const ex of list) m.append(h("button", { type: "button", title: ex.desc, onclick: () => { m.parentElement.open = false; this.openExample(ex); } }, h("span", {}, ex.title), h("small", {}, PARTS[ex.board] ? PARTS[ex.board].title : "")));
    }
  }

  openExample(ex) {
    if (this.dirtyProject() && !confirm(`Открыть пример «${ex.title}»? Текущая схема и код будут заменены (их можно сначала скачать: Проект - Скачать).`)) return;
    this.applyProject(JSON.parse(JSON.stringify(ex)));
    this.save(); requestAnimationFrame(() => this.fit());
    this.setStatus(`Пример «${ex.title}». Нажмите ▶, чтобы запустить.`, "ok");
  }

  dirtyProject() { return this.parts.length > 2 || this.wires.length > 0; }

  togglePlot(force) {
    const on = force === undefined ? this.plot.hidden : force;
    this.plot.hidden = !on; this.plotBtn.classList.toggle("on", on); this.drawPlot();
  }

  setMode(m) {
    this.mode = m;
    for (const [k, b] of Object.entries(this.viewBtns)) b.classList.toggle("on", k === m);
    for (const k of ["2d", "3d", "split"]) this.canvasBox.classList.toggle("mode-" + k, k === m);
    this.host3d.hidden = m === "2d";
    if (m !== "2d") {
      if (!this.v3) { try { this.v3 = new View3D(this.host3d); } catch (e) { this.host3d.textContent = "3D-вид недоступен: браузер не поддерживает WebGL."; } }
      if (this.v3) { this.v3.sync(this.parts, this.wires, (k) => this.pinXY(k)); this.v3.resize(); this.v3.fit(); this.v3.update(this.lastState || {}, this.parts); }
    }
    if (m !== "3d") requestAnimationFrame(() => this.applyView());
  }

  // ─────────────── Плата и язык ───────────────
  board() { return this.parts.find((p) => PARTS[p.type].board); }
  lang() { const b = this.board(); return b ? PARTS[b.type].lang : "cpp"; }
  syncLang() {
    const b = this.board(), lang = this.lang();
    if (this.curLang !== lang) { this.curLang = lang; this.editor.dispatch({ effects: this.langComp.reconfigure(lang === "py" ? python() : cpp()) }); }
    this.fileTab.textContent = LANG[lang].file;
    this.fileTab.title = LANG[lang].name;
    if (b) this.boardSel.value = b.type;
    this.libInfo.textContent = LANG[lang].name + ". " + (lang === "cpp" ? "Библиотеки: Servo, Wire, LiquidCrystal_I2C, Adafruit_NeoPixel, DHT, Adafruit_SSD1306, TM1637Display, Keypad, Stepper" : (b && b.type === "microbit" ? "Модули: microbit, music, neopixel, machine" : "Модули: machine, time, neopixel, dht, ssd1306, i2c_lcd, hcsr04" + (b && b.type === "esp32" ? ", network" : "")));
  }

  // Сменить плату: заменить деталь, перенести провода с одинаковыми именами выводов, подставить код на нужном языке
  switchBoard(type) {
    const old = this.board();
    if (old && old.type === type) return;
    this.stop();
    const def = PARTS[type];
    const np = { id: newId(type), type, x: old ? old.x : 0, y: old ? old.y : 0, rot: 0, props: { ...(def.props || {}) } };
    const oldLang = old ? PARTS[old.type].lang : null;
    if (old) {
      const names = new Set(def.pins().map((p) => p.name));
      this.wires = this.wires.filter((w) => {
        for (const end of ["a", "b"]) if (w[end].startsWith(old.id + ".")) { const pin = w[end].slice(old.id.length + 1); if (!names.has(pin)) return false; w[end] = np.id + "." + pin; }
        return true;
      });
      old.$g && old.$g.remove();
      this.parts = this.parts.filter((p) => p !== old);
    }
    this.parts.unshift(np);
    const code = this.editor.state.doc.toString();
    if (def.lang !== oldLang || !code.trim() || Object.values(DEFAULT_CODE).includes(code)) {
      if (oldLang) this.altCode = { ...(this.altCode || {}), [oldLang]: code };
      const next = (this.altCode && this.altCode[def.lang] && def.lang !== oldLang) ? this.altCode[def.lang] : DEFAULT_CODE[type];
      this.editor.dispatch({ changes: { from: 0, to: this.editor.state.doc.length, insert: next } });
    }
    this.renderAll(); this.syncLang(); this.changed(); this.compiled = null;
    this.setStatus(`Плата: ${def.title}. Язык: ${LANG[def.lang].name}.`, "ok");
  }

  /** Как ✓ в Arduino IDE: только компиляция (для плат на Python - проверка синтаксиса при запуске) */
  async verify() {
    const b = this.board();
    if (!b) { this.showTab("output"); this.compileOut.textContent = "На схеме нет платы: компилировать нечего."; return; }
    if (PARTS[b.type].lang !== "cpp") { this.showTab("output"); this.compileOut.classList.remove("err"); this.compileOut.textContent = "MicroPython не компилируется заранее: программа выполняется по строкам. Ошибки появятся здесь после запуска."; return; }
    this.compiled = null;
    await this.compile();
  }

  async compile() {
    const code = this.editor.state.doc.toString(), board = this.board().type;
    if (this.compiled && this.compiled.code === code && this.compiled.board === board) return true;
    this.showTab("output");
    this.setStatus("Компиляция...", "busy");
    this.compileOut.classList.remove("err");
    this.compileOut.textContent = `Компиляция скетча для ${PARTS[board].title}...`;
    this.btnVerify.classList.add("busy"); this.btnUpload.classList.add("busy");
    try {
      const res = await fetch(this.compileUrl, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf() }, body: JSON.stringify({ code, board }) });
      const data = await res.json().catch(() => ({ ok: false, error: "Сервер не ответил" }));
      if (!data.ok) { this.compileOut.textContent = data.error || "Ошибка компиляции"; this.compileOut.classList.add("err"); this.setStatus("Ошибка в коде: смотрите «Вывод» под редактором", "err"); return false; }
      this.compiled = { code, board, hex: data.hex };
      const flash = data.flash || 32256;
      this.compileOut.textContent = `Скетч использует ${data.size.toLocaleString("ru-RU")} байт (${Math.round((100 * data.size) / flash)}%) памяти устройства. Всего доступно ${flash.toLocaleString("ru-RU")} байт.`;
      this.setStatus("Скомпилировано", "ok");
      return true;
    } catch (e) { this.compileOut.textContent = "Нет связи с сервером компиляции."; this.setStatus("Нет связи с сервером", "err"); return false; }
    finally { this.btnVerify.classList.remove("busy"); this.btnUpload.classList.remove("busy"); }
  }

  showTab(id) {
    const group = ["output", "serial"].includes(id) ? ["output", "serial"] : ["props", "task"];
    for (const k of group) { const t = this.tabs[k]; t.pane.hidden = k !== id; t.b && t.b.classList.toggle("active", k === id); t.b && t.b.setAttribute("aria-selected", String(k === id)); }
  }

  setStatus(text, kind = "") { this.status.textContent = text; this.status.className = "lab-status " + kind; }

  // ─────────────── Данные ───────────────
  async load() {
    let presetData = null;
    if (this.preset) {
      try { presetData = await (await fetch(`${STATIC}lab/presets/${this.preset}.json`, { cache: "no-cache" })).json(); trPreset(presetData); } catch (e) { presetData = null; }
    }
    this.presetData = presetData;
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(this.storageKey) || "null"); } catch (e) { saved = null; }
    this.applyProject(saved || presetData || this.defaultProject());
    this.checks = (presetData && presetData.checks) || [];
    this.renderChecks();
    if (presetData && presetData.task) this.showTab("task");
    requestAnimationFrame(() => this.fit());
  }

  defaultProject() {
    return { parts: [{ id: "uno1", type: "uno", x: 0, y: 0 }, { id: "bb1", type: "breadboard", x: 0, y: -24 * P }], wires: [], code: DEFAULT_CODE.uno };
  }

  applyProject(pr) {
    this.stop();
    for (const p of this.parts) p.$g && p.$g.remove();
    this.parts = (pr.parts || []).filter((p) => PARTS[p.type]).map((p) => ({ rot: 0, ...p, props: { ...(PARTS[p.type].props || {}), ...(p.props || {}) } }));
    this.wires = (pr.wires || []).map((w) => ({ color: "#2f9e44", pts: [], ...w }));
    this.altCode = pr.altCode || null;
    const b = this.parts.find((p) => PARTS[p.type].board);
    this.editor.dispatch({ changes: { from: 0, to: this.editor.state.doc.length, insert: pr.code ?? DEFAULT_CODE[b ? b.type : "uno"] } });
    this.sel = null; this.compiled = null;
    this.renderAll(); this.renderProps(); this.syncLang();
    this.netsDirty = true;
    if (this.v3 && this.mode !== "2d") this.v3.sync(this.parts, this.wires, (k) => this.pinXY(k));
    if (!this._restoring) { this.history = [JSON.stringify(this.project())]; this.hpos = 0; }
  }

  pushHistory() {
    const s = JSON.stringify(this.project());
    if (this.history && this.history[this.hpos] === s) return;
    this.history = (this.history || []).slice(0, (this.hpos ?? -1) + 1);
    this.history.push(s);
    if (this.history.length > 80) this.history.shift();
    this.hpos = this.history.length - 1;
  }
  restore(i) {
    if (!this.history || i < 0 || i >= this.history.length) return;
    this.hpos = i; this._restoring = true;
    const keepCode = this.editor.state.doc.toString();
    const pr = JSON.parse(this.history[i]);
    pr.code = keepCode;
    this.applyProject(pr);
    this._restoring = false; this.save();
  }
  undo() { this.restore((this.hpos ?? 0) - 1); }
  redo() { this.restore((this.hpos ?? 0) + 1); }

  project() {
    return {
      parts: this.parts.map(({ id, type, x, y, rot, props }) => ({ id, type, x, y, rot, props })),
      wires: this.wires.map(({ id, a, b, pts, color }) => ({ id, a, b, pts, color })),
      code: this.editor.state.doc.toString(), altCode: this.altCode || undefined,
    };
  }
  save() {
    clearTimeout(this._saveT);
    this._saveT = setTimeout(() => { try { localStorage.setItem(this.storageKey, JSON.stringify(this.project())); } catch (e) { /* хранилище недоступно */ } }, 300);
  }
  reset() {
    if (!confirm("Вернуть исходную схему и код? Ваши изменения будут удалены.")) return;
    try { localStorage.removeItem(this.storageKey); } catch (e) { /* нет */ }
    this.applyProject(this.presetData || this.defaultProject());
    this.fit();
  }
  clearAll() {
    if (!confirm("Начать новый проект? Текущая схема и код будут удалены.")) return;
    const b = this.board();
    const t = b ? b.type : "uno";
    this.applyProject({ parts: [{ id: t + "1", type: t, x: 0, y: 0 }, { id: "bb1", type: "breadboard", x: 0, y: -24 * P }], wires: [], code: DEFAULT_CODE[t] });
    this.save(); this.fit();
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

  // ─────────────── Отрисовка ───────────────
  renderAll() {
    for (const p of this.parts) if (p.$g) { p.$g.remove(); p.$g = null; }
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
      el("title", {}, c).textContent = pin.title ? `${pin.name.replace(/\.\d$/, "")}: ${pin.title}` : pin.name.replace(/\.\d$/, "");
    }
    p.$g = g;
    this.placePart(p);
    if (def.update) { try { def.update.call(def, p, this.blankState()); } catch (e) { /* деталь без состояния */ } }
  }
  blankState() { return { diodes: {}, duty: {}, servo: {}, tone: {}, meter: {}, motor: {}, led: {}, running: false }; }
  placePart(p) {
    p.$g.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${p.rot || 0})`);
    p.$g.classList.toggle("selected", !!(this.sel && this.sel.kind === "part" && this.sel.id === p.id));
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
      el("path", { d, class: "lab-wire-sh" }, this.gWires);
      el("path", { d, class: "lab-wire" + (selected ? " selected" : ""), stroke: w.color, "data-wire": w.id }, this.gWires);
      el("path", { d, class: "lab-wire-hl" }, this.gWires);
      for (const q of [pts[0], pts[pts.length - 1]]) el("rect", { x: q.x - 3, y: q.y - 3, width: 6, height: 6, rx: 1, fill: "#212529" }, this.gWires);
    }
    if (this.v3 && this.mode !== "2d") this.v3.sync(this.parts, this.wires, (k) => this.pinXY(k));
  }
  applyView() { this.world.setAttribute("transform", `translate(${this.view.x} ${this.view.y}) scale(${this.view.s})`); }
  zoom(f, cx, cy) {
    if (this.mode === "3d") { this.v3 && this.v3.zoom(f); return; }
    const rect = this.svg.getBoundingClientRect();
    cx ??= rect.width / 2; cy ??= rect.height / 2;
    const s = Math.min(4, Math.max(0.2, this.view.s * f));
    this.view.x = cx - (cx - this.view.x) * (s / this.view.s); this.view.y = cy - (cy - this.view.y) * (s / this.view.s); this.view.s = s;
    this.applyView();
  }
  fit() {
    if (this.v3 && this.mode !== "2d") this.v3.fit();
    const rect = this.svg.getBoundingClientRect();
    if (!this.parts.length || !rect.width) { this.applyView(); return; }
    const bb = this.world.getBBox();
    const s = Math.min(2, Math.max(0.2, Math.min((rect.width - 40) / bb.width, (rect.height - 40) / bb.height)));
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
    if (def.board && this.board()) { this.switchBoard(type); return; }
    const rect = this.svg.getBoundingClientRect();
    const c = this.toWorld({ clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 });
    const p = { id: newId(type), type, x: snap(c.x - (def.w || 2 * P) / 2), y: snap(c.y), rot: 0, props: { ...(def.props || {}) } };
    this.parts.push(p);
    this.renderPart(p);
    this.select({ kind: "part", id: p.id });
    this.changed();
    if (def.board) this.syncLang();
  }
  select(s) {
    this.sel = s;
    for (const p of this.parts) p.$g && this.placePart(p);
    this.renderWires(); this.renderProps();
    if (s) this.showTab("props");
  }
  selPart() { return this.sel && this.sel.kind === "part" ? this.parts.find((p) => p.id === this.sel.id) : null; }
  rotateSel() { const p = this.selPart(); if (!p) return; p.rot = ((p.rot || 0) + 90) % 360; this.placePart(p); this.renderWires(); this.changed(); }
  deleteSel() {
    if (!this.sel) return;
    if (this.sel.kind === "part") { const p = this.selPart(); if (p) { p.$g.remove(); this.parts = this.parts.filter((q) => q !== p); } }
    else this.wires = this.wires.filter((w) => w.id !== this.sel.id);
    this.sel = null; this.renderWires(); this.renderProps(); this.changed(); this.syncLang();
  }
  changed() { this.netsDirty = true; this.save(); this.pushHistory(); if (this.running) this.devicesDirty = true; }
  duplicateSel() {
    const p = this.selPart(); if (!p || PARTS[p.type].board || /^breadboard/.test(p.type)) return;
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
        if (this.running && press && p) { this.interact(p, true, press.dataset.key); drag = { kind: "press", p }; svg.setPointerCapture(e.pointerId); return; }
        this.select({ kind: "part", id: p.id });
        const riders = /^breadboard/.test(p.type) ? this.ridersOf(p) : [];
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
      if (e.target.closest(".cm-editor") || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === "Escape") { this.drawing = null; this.gTemp.innerHTML = ""; this.palette.classList.remove("open"); }
      else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); this.deleteSel(); }
      else if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") { e.preventDefault(); e.shiftKey ? this.redo() : this.undo(); }
      else if ((e.ctrlKey || e.metaKey) && e.code === "KeyY") { e.preventDefault(); this.redo(); }
      else if ((e.ctrlKey || e.metaKey) && e.code === "KeyD") { e.preventDefault(); this.duplicateSel(); }
      else if (e.code === "KeyR" && !e.ctrlKey && !e.metaKey) this.rotateSel();
    });
    svg.addEventListener("pointerover", (e) => {
      const pin = e.target.closest && e.target.closest(".lab-pin");
      if (!pin) return;
      if (this.netsDirty || !this.net) this.buildNets();
      const root = this.net.nets.find(pin.dataset.key);
      let n = 0;
      for (const c of svg.querySelectorAll(".lab-pin")) { const on = this.net.nets.find(c.dataset.key) === root; c.classList.toggle("hl", on); n += on; }
      this.hlOn = true;
      if (!this.drawing && !this.running) {
        const v = this.lastV && this.lastV[this.net.node(pin.dataset.key)];
        this.setStatus(`${pin.querySelector("title")?.textContent || pin.dataset.key}: соединено выводов и отверстий - ${n}` + (v != null ? `, ${v.toFixed(2).replace(".", ",")} В` : ""));
      }
    });
    svg.addEventListener("pointerout", (e) => {
      if (!this.hlOn || !(e.target.closest && e.target.closest(".lab-pin"))) return;
      for (const c of svg.querySelectorAll(".lab-pin.hl")) c.classList.remove("hl");
      this.hlOn = false;
      if (!this.drawing && !this.running) this.setStatus("");
    });
    new ResizeObserver(() => {
      const r = svg.getBoundingClientRect();
      if (!this.userMoved && r.width > 0 && Math.abs(r.width - (this._lastW || 0)) > 40) { this._lastW = r.width; this.fit(); }
      else this.applyView();
      this.v3 && this.v3.resize();
    }).observe(this.canvasBox);
  }

  ridersOf(bb) {
    const holes = new Set(PARTS[bb.type].pins().map((pin) => { const q = pinPos(bb, pin); return `${q.x},${q.y}`; }));
    return this.parts.filter((q) => q !== bb && !/^breadboard/.test(q.type) && !PARTS[q.type].board &&
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
    const both = d.a + " " + b;
    const color = /GND|\.-\b|\.-$|VSS|\.K\b/.test(both) && !/5V|3V|\.\+|VCC|VIN|VBUS/.test(both) ? "#212529" : /5V|\.\+|3\.3V|3V3|VIN|VCC|VBUS|\.3V$/.test(both) ? "#e03131" : "#2f9e44";
    this.wires.push({ id: newId("w"), a: d.a, b, pts: d.pts, color });
    this.renderWires(); this.changed();
  }
  interact(p, down, key) {
    const def = PARTS[p.type];
    if (def.interactive === "press") p.pressed = down;
    else if (def.interactive === "keys") p.key = down ? key : null;
    else if (def.interactive === "toggle" && down) {
      const prop = Object.keys(def.props || {}).find((k) => typeof def.props[k] === "boolean");
      if (prop) { p.props[prop] = !p.props[prop]; this.renderProps(); }
    } else if (def.interactive === "slider" && down) this.select({ kind: "part", id: p.id });
    if (def.update) def.update.call(def, p, this.lastState || this.blankState());
    this.netsDirty = this.netsDirty || false;
  }

  // ─────────────── Свойства ───────────────
  renderProps() {
    const box = this.propsBox; box.innerHTML = "";
    if (!this.sel) { box.append(h("p", { class: "lab-muted" }, "Выберите деталь или провод. Детали - кнопка «+ Деталь» (есть поиск), готовые проекты - «Примеры» над кодом. Провод: нажмите на вывод детали или отверстие макетки, затем на второй вывод.")); return; }
    if (this.sel.kind === "wire") {
      const w = this.wires.find((q) => q.id === this.sel.id); if (!w) return;
      box.append(h("h4", {}, "Провод"), h("p", { class: "lab-muted" }, `${w.a.replace(/\.\d$/, "")} → ${w.b.replace(/\.\d$/, "")}`),
        h("div", { class: "lab-swatches" }, ...Object.entries(WIRE_COLORS).map(([c, t]) => h("button", { type: "button", title: t, "aria-label": t, class: "lab-swatch", style: `background:${c}`, onclick: () => { w.color = c; this.renderWires(); this.save(); } }))),
        h("button", { type: "button", class: "lab-btn danger", onclick: () => this.deleteSel() }, "Удалить провод"));
      return;
    }
    const p = this.selPart(); if (!p) return;
    const def = PARTS[p.type];
    const rerender = () => { this.renderPart(p); this.renderWires(); this.renderProps(); this.changed(); if (this.running) this.devicesDirty = true; };
    box.append(h("h4", {}, def.title));
    if (def.desc) box.append(h("p", { class: "lab-desc" }, def.desc));
    if (def.info) box.append(h("p", { class: "lab-muted" }, def.info.call(def, p)));
    const field = (title, input) => box.append(h("label", { class: "lab-field" }, h("span", {}, title), input));
    for (const s of def.selects || []) {
      const sel = h("select", { class: "lab-input" }, ...s.options().map(([v, t]) => h("option", { value: v, selected: String(v) === String(p.props[s.prop]) }, t)));
      sel.addEventListener("change", () => { p.props[s.prop] = s.num ? +sel.value : sel.value; if (p.type === "led") p.burnt = false; s.rerender ? rerender() : (this.changed(), this.renderProps()); });
      field(s.label, sel);
    }
    if (p.type === "led" && p.burnt) box.append(h("button", { type: "button", class: "lab-btn", onclick: () => { p.burnt = false; rerender(); } }, "Заменить сгоревший светодиод"));
    if (def.interactive === "slider") {
      const s = h("input", { type: "range", min: 0, max: 100, value: Math.round(p.props[def.sliderProp] * 100), class: "lab-range" });
      s.addEventListener("input", () => { p.props[def.sliderProp] = s.value / 100; def.update.call(def, p, this.lastState || this.blankState()); this.save(); });
      field(def.sliderLabel, s);
    }
    for (const sl of def.sliders || []) {
      const out = h("span", { class: "lab-val" }, String(p.props[sl.prop]).replace(".", ","));
      const s2 = h("input", { type: "range", min: sl.min, max: sl.max, step: sl.step || 1, value: p.props[sl.prop], class: "lab-range" });
      s2.addEventListener("input", () => { p.props[sl.prop] = +s2.value; out.textContent = s2.value.replace(".", ","); def.update && def.update.call(def, p, this.lastState || this.blankState()); this.save(); });
      box.append(h("label", { class: "lab-field" }, h("span", {}, sl.label, " ", out), s2));
    }
    if (def.actions) box.append(h("div", { class: "lab-row" }, ...def.actions.map((a) => h("button", { type: "button", class: "lab-btn", onclick: () => { a.run(p); def.update && def.update.call(def, p, this.lastState || this.blankState()); } }, a.label))));
    if (def.interactive === "press") box.append(h("p", { class: "lab-muted" }, "Во время симуляции нажмите на деталь на схеме и удерживайте."));
    if (def.interactive === "toggle") box.append(h("p", { class: "lab-muted" }, "Во время симуляции щелкните по детали, чтобы переключить."));
    if (def.interactive === "keys") box.append(h("p", { class: "lab-muted" }, "Во время симуляции нажимайте кнопки на схеме мышью."));
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
      if (/^breadboard/.test(p.type)) for (const pin of def.pins()) { const q = pinPos(p, pin); holes.set(`${q.x},${q.y}`, key(p, pin.name)); }
    }
    for (const p of this.parts) {
      if (/^breadboard/.test(p.type)) continue;
      for (const pin of PARTS[p.type].pins()) { const q = pinPos(p, pin); const hk = holes.get(`${q.x},${q.y}`); if (hk) nets.union(key(p, pin.name), hk); }
    }
    for (const w of this.wires) nets.union(w.a, w.b);
    const roots = new Map();
    const board = this.board();
    const bat = this.parts.find((p) => ["battery", "aapack", "powermod"].includes(p.type));
    const gndKey = board ? key(board, PARTS[board.type].gnd) : bat ? key(bat, "-") : null;
    if (gndKey) roots.set(nets.find(gndKey), 0);
    let next = gndKey ? 1 : 0;
    const node = (k) => { const r = nets.find(k); if (!roots.has(r)) roots.set(r, next++); return roots.get(r); };
    for (const p of this.parts) for (const pin of PARTS[p.type].pins()) node(key(p, pin.name));
    if (next === 0) next = 1;
    this.net = { node, count: Math.max(next, 1), nets, board };
    // выводы микроконтроллера на узлах
    this.mcuByNode = new Map(); this.boardPins = [];
    if (board) {
      const def = PARTS[board.type];
      for (const pin of def.pins()) {
        const m = def.mcuPin(pin.name); if (!m) continue;
        const n = node(key(board, pin.name));
        if (!this.boardPins.some((b) => b.mcu === m)) this.boardPins.push({ mcu: m, n });
        const list = this.mcuByNode.get(n) || []; if (!list.includes(m)) list.push(m); this.mcuByNode.set(n, list);
      }
    }
    this.netsDirty = false;
  }

  // Окружение для устройств детали (см. devices/index.js)
  envFor(p) {
    const lab = this, mcu = this.mcu, node = (pin) => this.net.node(`${p.id}.${pin}`);
    const mcuPin = (pin) => (lab.mcuByNode.get(node(pin)) || [])[0] || null;
    return {
      mcu, part: p,
      pin: mcuPin,
      level(pin, dflt = false) {
        const n = node(pin);
        const m = (lab.mcuByNode.get(n) || [])[0];
        if (m && mcu) { const md = mcu.mode(m); if (md === "high") return true; if (md === "low") return false; }
        const drv = lab.drivers.get(n); if (drv) return !!drv();
        const v = lab.lastV ? lab.lastV[n] : null;
        if (v == null) return dflt;
        return v > (mcu ? mcu.vcc : 5) / 2;
      },
      onLevel(pin, f) { const m = mcuPin(pin); if (m && mcu) mcu.onPin(m, (lvl, t) => f(lvl, t)); },
      driver(pin, fn) { lab.drivers.set(node(pin), fn); },
      powered(a = "VCC", b = "GND", min = 2.7) { const v = lab.lastV; if (!v) return true; /* цепь еще не посчитана */ return v[node(a)] - v[node(b)] > min || (p.$pwr ?? 0) > min; },
      i2cOk() {
        if (!mcu) return false;
        const sda = mcuPin("SDA"), scl = mcuPin("SCL");
        if (!sda || !scl) return false;
        if (mcu.kind === "py") return true; // machine.I2C можно на любых выводах
        if (mcu.kind === "rp2040") return true; // I2C0/I2C1 на многих выводах
        return sda === mcu.sda && scl === mcu.scl;
      },
      duty(pin) { const m = mcuPin(pin); if (m && lab.stats && lab.stats[m]) { const md = mcu.mode(m); return md === "high" || md === "low" ? lab.stats[m].duty : 0; } const v = lab.lastV ? lab.lastV[node(pin)] - lab.lastV[node("GND")] : 0; return v > 2.3 ? 1 : 0; },
    };
  }

  setupDevices() {
    this.drivers = new Map();
    const m = this.mcu;
    if (m) { // при пересборке схемы во время работы: снять старые подписки устройств
      m.listeners = {}; m.i2c && m.i2c.clear();
      if (m.devices) m.devices = { neopixel: {}, dht: {}, pulse: {} };
    }
    for (const p of this.parts) {
      const def = PARTS[p.type];
      if (!def.device) continue;
      try { p.$dev = def.device.call(def, p, this.envFor(p)); } catch (e) { console.warn("device", p.type, e); }
    }
    this.devicesDirty = false;
  }

  // ─────────────── Симуляция ───────────────
  async start() {
    if (this.running || this.starting) return;
    this.starting = true;
    try {
      this.buildNets();
      this.serialOut.textContent = ""; this.plotData = []; this.serialLine = ""; this.drawPlot();
      const b = this.board();
      this.mcu = null; this.stats = null; this.lastV = null; this.errorShown = false;
      const onSerial = (s) => this.onSerial(s);
      const onError = (text) => this.pyError(text);
      if (b) {
        const def = PARTS[b.type];
        const code = this.editor.state.doc.toString();
        if (def.mcuKind === "avr") {
          if (!(await this.compile())) return;
          this.mcu = new AvrMcu(b.type, this.compiled.hex, { onSerial });
          this.setupDevices();
        } else if (def.mcuKind === "rp2040") {
          this.setStatus("Загрузка MicroPython на Pico...", "busy");
          if (!picoUf2) picoUf2 = await (await fetch(STATIC + "lab/pico/micropython.uf2")).arrayBuffer();
          if (!picoShared) picoShared = new Rp2040Mcu(picoUf2, {});
          this.mcu = picoShared; this.mcu.rebind(); this.mcu.onSerial = onSerial; this.mcu.onError = onError;
          this.setupDevices();
          this.compileOut.classList.remove("err"); this.compileOut.textContent = "MicroPython v1.24 на RP2040 (эмуляция процессора). Программа передается через USB, как в Thonny.";
          this.mcu.start(code);
        } else {
          const loadMicroPython = await loadMP();
          this.mcu = new PyMcu(b.type, { onSerial, onError, loadMicroPython, wasmUrl: STATIC + "spikesim/micropython.wasm" });
          this.compileOut.classList.remove("err"); this.compileOut.textContent = `MicroPython для ${def.title}: программа выполняется настоящим интерпретатором, выводы и датчики - модель платы.`;
          this.syncBoardInputs();
          this.setupDevices();
          await this.mcu.start(code);
        }
      }
      if (!this.mcu) this.setupDevices();
      for (const p of this.parts) if (p.type === "led") p.burnt = false;
      this.running = true; this.simTime = 0; this.checkState = {}; this.wall0 = performance.now();
      this.btnRun.textContent = "■"; this.btnRun.title = "Остановить симуляцию"; this.btnRun.classList.add("on");
      this.setStatus(this.mcu ? "Симуляция работает" : "Цепь под напряжением", "ok");
      this.root.classList.add("running");
      this.lastT = performance.now();
      const loop = async (t) => {
        if (!this.running) return;
        if (!this.busyStep) {
          this.busyStep = true;
          try { await this.step(Math.min(0.2, (t - this.lastT) / 1000)); } catch (e) { console.error(e); this.setStatus("Ошибка симуляции: " + e.message, "err"); }
          this.busyStep = false;
        }
        this.lastT = t;
        this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    } finally { this.starting = false; }
  }

  async restart() { this.stop(); await this.start(); }

  stop() {
    if (!this.running) return;
    this.running = false; cancelAnimationFrame(this.raf);
    if (this.mcu && this.mcu.stop && this.mcu.kind !== "avr") this.mcu.stop();
    this.mcu = null;
    this.btnRun.textContent = "▶"; this.btnRun.title = "Запустить симуляцию"; this.btnRun.classList.remove("on"); this.simClock.textContent = "00:00.000"; this.speedEl.textContent = "";
    this.root.classList.remove("running");
    this.setStatus("");
    for (const t of Object.values(this.tones)) t.gain.gain.value = 0;
    const blank = this.blankState();
    for (const p of this.parts) PARTS[p.type].update && PARTS[p.type].update.call(PARTS[p.type], p, blank);
    if (this.v3) this.v3.update(blank, this.parts);
  }

  pyError(text) {
    this.showTab("output");
    const t = String(text).replace(/\r/g, "");
    const line = (t.match(/line (\d+)/g) || []).pop();
    let hint = "";
    if (/NameError/.test(t)) { const m = t.match(/name '(\w+)'/); hint = `Неизвестное имя «${m ? m[1] : "?"}»: проверьте import и написание.`; }
    else if (/ImportError|no module named/i.test(t)) hint = "Такого модуля нет. Для платы есть: " + this.libInfo.textContent.replace(/^.*Модули: /, "");
    else if (/IndentationError/.test(t)) hint = "Отступы: строки внутри while, for, if, def сдвигаются на 4 пробела.";
    else if (/SyntaxError/.test(t)) hint = "Синтаксис: двоеточия после while/if/def/for, скобки и кавычки.";
    else if (/invalid pin|ValueError: pin/.test(t)) hint = "Такого вывода у платы нет: смотрите подписи выводов на схеме.";
    else if (/OSError: \[Errno (19|5)|OSError: 19|ENODEV|EIO/.test(t)) hint = "Устройство I2C не отвечает: проверьте SDA, SCL, питание и адрес.";
    this.compileOut.textContent = t.split("\n").slice(-4).join("\n") + (hint ? "\n\n" + hint : "");
    this.compileOut.classList.add("err");
    this.setStatus("Ошибка в программе: смотрите «Вывод»", "err");
    if (line) { const n = +line.split(" ")[1]; const doc = this.editor.state.doc; if (n >= 1 && n <= doc.lines) { const l = doc.line(n); this.editor.dispatch({ selection: { anchor: l.from, head: l.to }, scrollIntoView: true }); } }
  }

  // входы micro:bit (кнопки, датчики) из детали платы
  syncBoardInputs() {
    const b = this.board(); if (!b || !this.mcu || this.mcu.board !== "microbit") return;
    const mb = this.mcu.mb, pr = b.props;
    for (const k of ["A", "B"]) { const s = mb.buttons[k], down = b.key === k; if (down && !s.down) { s.was = true; s.presses++; } s.down = down; }
    mb.accel = [pr.ax, pr.ay, -Math.round(Math.sqrt(Math.max(0, 1024 * 1024 - pr.ax * pr.ax - pr.ay * pr.ay))), 0];
    mb.temp = pr.temp; mb.light = pr.light; mb.sound = pr.sound;
  }

  async step(dt) {
    if (this.netsDirty) this.buildNets();
    if (this.devicesDirty) this.setupDevices();
    const { node, count } = this.net;
    const mcu = this.mcu;
    let stats = null;
    if (mcu) {
      this.syncBoardInputs();
      if (mcu.kind === "py") stats = await mcu.runAsync(dt);
      else if (mcu.kind === "rp2040") stats = mcu.run(dt, Math.max(12, Math.min(60, dt * 700))); // эмуляция RP2040 медленнее реального времени: отдаем ей большую часть кадра
      else stats = mcu.run(dt);
      if (!this.running) return;
      this.simTime = mcu.now();
      if (mcu.kind === "rp2040") {
        this.speedEl.textContent = mcu.booting ? "загрузка..." : mcu.lastSpeed < 0.95 ? `${Math.round(mcu.lastSpeed * 100)}% скорости` : "";
      }
    } else this.simTime += dt;
    this.stats = stats;
    { const t = this.simTime, m = Math.floor(t / 60), sec = t - m * 60; this.simClock.textContent = `${String(m).padStart(2, "0")}:${sec.toFixed(3).padStart(6, "0")}`; }
    // элементы деталей
    const base = [];
    for (const p of this.parts) {
      const def = PARTS[p.type];
      if (def.model) for (const e of def.model.call(def, p, (n) => node(`${p.id}.${n}`))) base.push(e);
    }
    // выводы платы: ШИМ усредняем, считая цепь в нескольких точках периода
    const outPins = [];
    const vcc = mcu ? mcu.vcc : 5;
    if (stats) for (const bp of this.boardPins) {
      const m = mcu.mode(bp.mcu), st = stats[bp.mcu]; if (!st) continue;
      outPins.push({ name: bp.mcu, m, duty: m === "high" || m === "low" ? st.duty : 0, n: bp.n });
    }
    const pwm = outPins.some((o) => o.duty > 0.02 && o.duty < 0.98);
    const K = pwm ? 6 : 1;
    const acc = { v: new Array(count).fill(0), diodes: {}, maxI: {}, cur: {} };
    for (let s = 0; s < K; s++) {
      const th = (s + 0.5) / K;
      const els = base.slice();
      for (const o of outPins) {
        if (o.m === "high" || o.m === "low") els.push({ type: "V", p: o.n, n: 0, v: (K === 1 ? o.m === "high" || o.duty > 0.5 : o.duty > th) ? vcc : 0, r: 25 });
        else if (o.m === "pullup") els.push({ type: "V", p: o.n, n: 0, v: vcc, r: 35000 });
        else if (o.m === "pulldown") els.push({ type: "R", a: o.n, b: 0, r: 50000 });
      }
      const sol = solve(count, els);
      for (let i = 0; i < count; i++) acc.v[i] += sol.v[i] / K;
      for (const [k, d] of Object.entries(sol.diodes)) { acc.diodes[k] = acc.diodes[k] || { i: 0 }; acc.diodes[k].i += d.i / K; acc.maxI[k] = Math.max(acc.maxI[k] || 0, d.i); }
      for (const e of els) if (e.key) acc.cur[e.key] = (acc.cur[e.key] || 0) + sol.current(e) / K;
    }
    this.lastV = acc.v;
    // входы платы
    if (stats) for (const o of outPins) if (o.m !== "high" && o.m !== "low") mcu.setInput(o.name, acc.v[o.n]);
    // напряжения для деталей (транзисторы, модули)
    const vfn = (p) => (pin) => acc.v[node(`${p.id}.${pin}`)] ?? 0;
    for (const p of this.parts) { const def = PARTS[p.type]; if (def.after) def.after.call(def, p, vfn(p), this.mcu ? this.envFor(p) : null); }
    // состояние для отрисовки
    const st = { diodes: acc.diodes, duty: {}, servo: {}, tone: {}, meter: {}, meterVal: {}, motor: {}, led: {}, mbDisplay: {}, running: true, t: this.simTime,
      tx: mcu && mcu.txAt && (mcu.cpu.cycles - mcu.txAt) < FREQ * 0.05, toneFn: (id, f) => this.tone(id, f) };
    const vd = (p, a, b) => acc.v[node(`${p.id}.${a}`)] - acc.v[node(`${p.id}.${b}`)];
    const pinsOf = (p, pin) => this.mcuByNode.get(node(`${p.id}.${pin}`)) || [];
    const board = this.board();
    if (board && stats) {
      const def = PARTS[board.type];
      if (def.led && stats[def.led]) st.led[board.id] = stats[def.led].duty > 0.3;
      if (board.type === "microbit" && mcu.mb) { st.mbDisplay[board.id] = mcu.mb.display; const p0 = stats.P0; this.tone(board.id + ":spk", p0 && p0.freq > 30 && p0.duty > 0.05 && p0.duty < 0.95 ? p0.freq : 0); }
    }
    for (const p of this.parts) {
      const t = p.type;
      if (t === "led") { const mi = acc.maxI[p.id] || 0; if (mi > 0.04) p.burnt = true; }
      for (const k of [p.id, p.id + ":L", p.id + ":R"]) if (acc.cur[k] !== undefined) st.motor[k] = acc.cur[k];
      if (t === "servo" && stats) for (const pn of pinsOf(p, "SIG")) { const pu = stats[pn].pulse; if (pu && pu > 400 && pu < 2700 && vd(p, "5V", "GND") > 3.5) st.servo[p.id] = Math.max(0, Math.min(180, (pu - 544) / (2400 - 544) * 180)); }
      if (t === "buzzer") {
        let f = 0;
        if (stats) for (const pn of pinsOf(p, "+")) if (stats[pn].freq > 30 && stats[pn].duty > 0.05 && stats[pn].duty < 0.95) f = stats[pn].freq;
        if (!f && vd(p, "+", "-") > 2) f = 2300;
        st.tone[p.id] = f; this.tone(p.id, f);
      }
      if (t === "meter") {
        const d = vd(p, "IN", "COM");
        st.meterVal[p.id] = p.props.mode === "V" ? d : p.props.mode === "A" ? d / 0.01 * 1000 : Math.round(1000 * d / (1 - d));
        st.meter[p.id] = p.props.mode === "V" ? `${d.toFixed(2).replace(".", ",")} В` : p.props.mode === "A" ? `${(d / 0.01 * 1000).toFixed(1).replace(".", ",")} мА` : d > 0.999 ? "OL" : fmtOhm(Math.round(1000 * d / (1 - d)));
      }
    }
    this.lastState = st;
    if (this.plotDirty) { this.plotDirty = false; this.drawPlot(); }
    for (const p of this.parts) { const def = PARTS[p.type]; if (def.update) def.update.call(def, p, st); }
    if (this.v3 && this.mode !== "2d") this.v3.update(st, this.parts);
    this.evalChecks(st, stats);
  }

  onSerial(s) {
    const o = this.serialOut;
    o.textContent += s;
    if (o.textContent.length > 20000) o.textContent = o.textContent.slice(-15000);
    o.scrollTop = 1e9;
    for (const ch of s) {
      if (ch === "\n") {
        const nums = (this.serialLine.match(/-?\d+(?:[.,]\d+)?/g) || []).slice(0, 3).map((x) => parseFloat(x.replace(",", ".")));
        if (nums.length) { this.plotData.push(nums); if (this.plotData.length > 300) this.plotData.shift(); this.lastNums = nums; this.plotDirty = true; }
        this.serialLine = "";
      } else if (ch !== "\r") this.serialLine += ch;
    }
  }

  drawPlot() {
    const c = this.plot; if (!c || c.hidden) return;
    const ctx = c.getContext("2d"), W = c.width, H = c.height;
    ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, W, H);
    const d = this.plotData;
    if (!d.length) { ctx.fillStyle = "#94a3b8"; ctx.font = "13px Inter, Arial"; ctx.fillText("Выводите числа через Serial.println или print() - здесь появится график", 12, H / 2); return; }
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
    if (!this.audio) { if (!f) return; try { this.audio = new AudioContext(); } catch (e) { return; } }
    let t = this.tones[id];
    if (!t) {
      const osc = this.audio.createOscillator(); const gain = this.audio.createGain();
      osc.type = "square"; gain.gain.value = 0; osc.connect(gain).connect(this.audio.destination); osc.start();
      t = this.tones[id] = { osc, gain };
    }
    if (f > 0) { t.osc.frequency.setTargetAtTime(Math.min(f, 8000), this.audio.currentTime, 0.01); t.gain.gain.value = 0.035; } else t.gain.gain.value = 0;
  }

  // ─────────────── Проверка задания (задания уроков) ───────────────
  renderChecks() {
    const box = this.checksBox; box.innerHTML = "";
    const pd = this.presetData;
    if (pd && pd.title) box.append(h("h4", {}, pd.title));
    if (pd && pd.task) box.append(h("div", { class: "lab-task" }, ...pd.task.split("\n").map((l) => h("p", {}, l))));
    if (!this.checks.length) {
      if (!pd) box.append(h("div", { class: "lab-intro" },
        h("p", {}, "Свободная лаборатория: собирайте схемы из 60+ деталей и программируйте платы."),
        h("ul", {}, h("li", {}, "Плата выбирается над кодом: Arduino Uno, Nano, Mega 2560 - C++; Raspberry Pi Pico, ESP32, micro:bit - MicroPython."),
          h("li", {}, "«Примеры» - готовые проекты со схемой и кодом."), h("li", {}, "«3D» над схемой - объемный вид, который работает вместе с симуляцией.")),
        h("p", { class: "lab-muted" }, "Задания с автопроверкой есть в уроках курсов.")));
      return;
    }
    box.append(h("p", { class: "lab-muted" }, "Нажмите ▶ над схемой: проверка идет во время симуляции."));
    this.checkEls = this.checks.map((c) => h("li", {}, c.label));
    box.append(h("ul", { class: "lab-checklist" }, ...this.checkEls));
    this.doneEl = h("div", { class: "lab-done", hidden: true }, "Задание выполнено! Отметьте урок как пройденный.");
    box.append(this.doneEl);
  }
  agreeBoth(s, cond, outOn) {
    const k = cond ? "on" : "off";
    s[k + "N"] = (s[k + "N"] || 0) + 1;
    if (outOn === cond) s[k + "Ok"] = (s[k + "Ok"] || 0) + 1;
    const r = (x) => (s[x + "Ok"] || 0) / (s[x + "N"] || 1);
    return (s.onN || 0) > 10 && (s.offN || 0) > 10 && r("on") > 0.85 && r("off") > 0.85;
  }
  evalChecks(st) {
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
        const src = this.parts.find((p) => p.id === c.src);
        const a = part ? st.servo[part.id] : undefined;
        if (src && a !== undefined) { const pos = src.props.pos; if (Math.abs(a - pos * 180) <= (c.tol || 12)) s.levels.add(pos < 0.3 ? "lo" : pos > 0.7 ? "hi" : "mid"); }
        s.ok = s.levels.size >= 3;
      } else if (c.type === "tone") s.ok = part && st.tone[part.id] > 0;
      else if (c.type === "meter") { const v = part ? st.meterVal[part.id] : undefined; s.ok = part && part.props.mode === c.mode && v !== undefined && v >= c.min && v <= c.max; }
      else if (c.type === "serial_num") {
        const src = this.parts.find((p) => p.id === c.part);
        const last = this.lastNums && this.lastNums[0];
        if (src && last !== undefined) s.ok = Math.abs(last - src.props[c.prop]) <= (c.tol || 1);
      } else if (c.type === "colors") {
        if (part && (part.brightness || 0) > 0.3) { const ch = ["r", "g", "b"].map((k) => st.diodes[`${part.id}:${k}`]?.i || 0); const m = Math.max(...ch); s.levels.add(ch.map((x) => (x > m * 0.5 ? 1 : 0)).join("")); }
        s.ok = s.levels.size >= (c.count || 3);
      } else if (c.type === "motor_levels") {
        // уровень по току мотора (без инерции ротора); засчитываем уровень, который держится два кадра подряд
        if (part) { const lvl = Math.round(Math.min(1, Math.abs(st.motor[part.id] || 0) / 0.25) * 5); if (lvl === s.prev) s.levels.add(lvl); s.prev = lvl; }
        s.ok = s.levels.size >= (c.levels || 3);
      } else if (c.type === "follow") {
        const src = this.parts.find((p) => p.id === c.src);
        if (part && src) {
          const outOn = part.type === "buzzer" ? st.tone[part.id] > 0 : part.type === "motor" ? Math.abs(part.speed || 0) > 0.1 : (part.brightness || 0) > 0.25;
          const val = src.props[c.prop];
          const cond = c.lt !== undefined ? val < c.lt : val > c.gt;
          if (s.lastCond !== cond) { s.lastCond = cond; s.since = this.simTime; }
          if (this.simTime - s.since > (c.settle || 0.4)) s.ok = this.agreeBoth(s, cond, outOn);
        }
      } else if (c.type === "button_led") {
        const btn = this.parts.find((p) => p.type === "button");
        if (btn && part) {
          const pressed = !!btn.pressed;
          if (s.lastCond !== pressed) { s.lastCond = pressed; s.since = this.simTime; }
          if (this.simTime - s.since > 0.15) s.ok = this.agreeBoth(s, pressed, (part.brightness || 0) > 0.25);
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
let codeLocalized = false;
function mount() {
  if (!codeLocalized) { // примеры и стартовый код на языке страницы (комментарии и строки)
    codeLocalized = true;
    for (const ex of EXAMPLES) ex.code = trCode(ex.code, { strings: true });
    for (const k of Object.keys(DEFAULT_CODE)) DEFAULT_CODE[k] = trCode(DEFAULT_CODE[k], { strings: true });
  }
  for (const node of document.querySelectorAll(".lab-embed, [class*='lab-preset-']")) {
    if (node.dataset.mounted) continue;
    node.dataset.mounted = "1";
    const m = node.className.match(/lab-preset-([\w-]+)/);
    const preset = m ? m[1] : null;
    const wrap = document.createElement("div");
    node.replaceWith(wrap);
    instances.push(new Lab(wrap, { preset, storageKey: preset ? "lab:" + preset : "lab:sandbox2", compileUrl: document.body.dataset.labCompile || "/lab/compile" }));
    localize(wrap);
  }
}
onReady(mount);
window.USTEMLab = { Lab, mount, instances, PARTS, EXAMPLES };
