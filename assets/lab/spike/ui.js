// Симулятор SPIKE Prime: блоки и Python прямо на странице урока, виртуальный робот на тренировочном мате FLL.
import { localize, trPreset, trCode, tr, onReady } from "../i18n/index.js";
import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { createWorkspace, loadBlocks, saveBlocks, workspaceToPython, Blockly } from "./blocks.js";
import { MAT_W, MAT_H, drawMat } from "./mat.js";
import { BODY, SENSOR_POS, DEFAULT_ROBOT, evalChecks } from "./physics.js";
import { explainError } from "./runner.js";

const SCRIPT_SRC = (document.currentScript && document.currentScript.src) || "/static/js/spikesim.js";
const WORKER_URL = SCRIPT_SRC.replace(/spikesim\.js/, "spikeworker.js");
const MP_BASE = new URL("/static/spikesim/", location.href).href;

const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v; else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else if (v !== false && v != null) e.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(k));
  return e;
};

// Шрифт 3 x 5 для матрицы хаба
const FONT = {
  A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110", E: "111100110100111", F: "111100110100100",
  G: "011100101101011", H: "101101111101101", I: "111010010010111", J: "001001001101010", K: "101101110101101", L: "100100100100111",
  M: "101111111101101", N: "110101101101101", O: "010101101101010", P: "110101110100100", Q: "010101101110011", R: "110101110101101",
  S: "011100010001110", T: "111010010010010", U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101",
  Y: "101101010010010", Z: "111001010100111", 0: "111101101101111", 1: "010110010010111", 2: "110001010100111", 3: "110001010001110",
  4: "101101111001001", 5: "111100110001110", 6: "011100111101111", 7: "111001010010010", 8: "111101111101111", 9: "111101111001110",
  "-": "000000111000000", "!": "010010010000010", "?": "110001010000010", ":": "000010000010000", ".": "000000000000010", " ": "000000000000000",
};

const PORT_TITLES = { "motor:large": "большой мотор", "motor:medium": "средний мотор", color: "датчик цвета", distance: "датчик расстояния", force: "датчик силы", "": "пусто" };
const ROLE = { A: "левое колесо", B: "правое колесо", C: "навесное (рука)", D: "навесное 2", E: "левый датчик", F: "правый датчик" };

let audio = null;
function beep(freq, ms, vol) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = freq; g.gain.value = Math.min(0.2, (vol || 80) / 500);
    o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + Math.min(2, ms / 1000));
  } catch (e) { /* звук недоступен */ }
}

class SpikeSim {
  constructor(root, { preset = "spike-sandbox" } = {}) {
    this.root = root; this.presetName = preset; this.storageKey = "spike:" + preset;
    this.mode = "blocks"; this.speed = 1; this.running = false; this.worker = null;
    this.state = null; this.prints = []; this.checkState = []; this.view = { scroll: 0 };
    this.build();
    this.load();
  }

  // ─────────────── Разметка ───────────────
  build() {
    const r = this.root; r.classList.add("sp"); r.innerHTML = "";
    const icon = (d, size = 18) => { const n = document.createElementNS("http://www.w3.org/2000/svg", "svg"); n.setAttribute("viewBox", "0 0 24 24"); n.setAttribute("width", size); n.setAttribute("height", size); n.setAttribute("aria-hidden", "true"); n.innerHTML = d; return n; };
    this.btnRun = h("button", { type: "button", class: "sp-run", title: "Запуск", "aria-label": "Запуск программы", onclick: () => (this.running ? this.stop() : this.run()) }, "▶");
    this.tabBlocks = h("button", { type: "button", class: "sp-mode", onclick: () => this.setMode("blocks") }, "Блоки");
    this.tabPy = h("button", { type: "button", class: "sp-mode", onclick: () => this.setMode("python") }, "Python");
    this.btnPreview = h("button", { type: "button", class: "sp-tool", title: "Посмотреть, какой Python получается из блоков", onclick: () => this.togglePreview() }, "Код блоков");
    this.btnToPy = h("button", { type: "button", class: "sp-tool", title: "Продолжить в Python: код блоков перенесется в редактор Python", onclick: () => this.blocksToPython() }, "В Python");
    const speed = h("select", { class: "sp-select", title: "Скорость симуляции", "aria-label": "Скорость симуляции", onchange: (e) => { this.speed = +e.target.value; } },
      h("option", { value: 1 }, "Скорость 1x"), h("option", { value: 2 }, "Скорость 2x"), h("option", { value: 4 }, "Скорость 4x"));
    this.btnReset = h("button", { type: "button", class: "sp-tool", title: "Вернуть стартовую программу задания", onclick: () => this.resetAll() }, "Сброс");
    this.titleEl = h("span", { class: "sp-project" }, "Проект");
    const hubGlyph = icon('<rect x="4" y="3" width="16" height="18" rx="3" fill="#ffd500" stroke="#1a1a1a" stroke-width="1.5"/><rect x="7" y="6" width="10" height="8" rx="1" fill="#1a1a1a"/><circle cx="12" cy="17.5" r="1.6" fill="#fff" stroke="#1a1a1a"/>', 22);
    const tb = h("header", { class: "sp-appbar" },
      h("div", { class: "sp-title" }, hubGlyph, this.titleEl),
      h("div", { class: "sp-modes", role: "tablist" }, this.tabBlocks, this.tabPy), this.btnPreview, this.btnToPy,
      h("span", { class: "sp-grow" }),
      speed,
      h("button", { type: "button", class: "sp-tool", title: "Скачать main.py для приложения SPIKE", onclick: () => this.download() }, "Скачать .py"),
      h("button", { type: "button", class: "sp-tool", title: "Скопировать код Python", onclick: () => this.copy() }, "Копировать"),
      this.btnReset,
      h("button", { type: "button", class: "sp-tool sp-icon", title: "Во весь экран", "aria-label": "Во весь экран", onclick: () => { this.root.classList.toggle("sp-full"); this.resize(); Blockly.svgResize(this.ws); } },
        icon('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2"/>', 16)),
      h("span", { class: "sp-hubstate", title: "Программа работает на виртуальном хабе" }, h("i"), "Хаб: симулятор"));

    // редакторы и консоль снизу, как в приложении
    this.blocksDiv = h("div", { class: "sp-blockly" });
    this.pyDiv = h("div", { class: "sp-python", hidden: true });
    this.preview = h("pre", { class: "sp-preview", hidden: true });
    this.consoleBox = h("pre", { class: "sp-console" });
    this.tabs = {};
    const conHead = h("button", { type: "button", class: "sp-drawer-h", "aria-expanded": "false", onclick: () => this.showTab(this.tabs.console.pane.hidden ? "console" : "-console") }, "Консоль");
    this.tabs.console = { b: conHead, pane: h("div", { class: "sp-drawer-b", hidden: true }, this.consoleBox) };
    const editor = h("div", { class: "sp-editor" },
      h("div", { class: "sp-canvas-wrap" }, this.blocksDiv, this.pyDiv, this.preview, h("div", { class: "sp-runbar" }, this.btnRun)),
      h("div", { class: "sp-drawer" }, conHead, this.tabs.console.pane));

    // симулятор: поле, хаб, порты, задание
    this.canvas = h("canvas", { class: "sp-canvas" });
    this.hud = h("div", { class: "sp-hud" });
    this.toastBox = h("div", { class: "sp-toasts", "aria-live": "polite" });
    this.field = h("div", { class: "sp-field" }, this.canvas, this.toastBox);
    this.matrix = h("div", { class: "sp-matrix" }, ...Array.from({ length: 25 }, () => h("i")));
    this.matrixText = h("div", { class: "sp-mtext" });
    const hbtn = (which, label) => {
      const b = h("button", { type: "button", class: "sp-hbtn", title: which === "left" ? "Левая кнопка хаба" : "Правая кнопка хаба", "aria-label": which === "left" ? "Левая кнопка хаба" : "Правая кнопка хаба" }, label);
      const set = (down) => (e) => { e.preventDefault(); b.classList.toggle("on", down); if (this.worker) this.worker.postMessage({ type: "button", which, down }); };
      b.addEventListener("pointerdown", set(true)); b.addEventListener("pointerup", set(false)); b.addEventListener("pointerleave", set(false));
      return b;
    };
    this.hubCenter = h("button", { type: "button", class: "sp-hbtn sp-hcenter", title: "Центральная кнопка: запуск и стоп", "aria-label": "Центральная кнопка хаба", onclick: () => (this.running ? this.stop() : this.run()) });
    const hub = h("div", { class: "sp-hub" }, this.matrix, this.matrixText, h("div", { class: "sp-hbtns" }, hbtn("left", "◀"), this.hubCenter, hbtn("right", "▶")));
    this.portsBox = h("div", { class: "sp-portgrid" });
    const tab = (id, title) => { const b = h("button", { type: "button", class: "sp-tab", role: "tab", onclick: () => this.showTab(id) }, title); this.tabs[id] = { b }; return b; };
    this.taskBox = h("div", { class: "sp-task" });
    this.robotBox = h("div", { class: "sp-robot" });
    this.helpBox = h("div", { class: "sp-help" });
    const bar = h("div", { class: "sp-tabbar", role: "tablist" }, tab("task", "Задание"), tab("robot", "Робот"), tab("help", "Справка"));
    this.tabs.task.pane = h("div", { class: "sp-pane" }, this.taskBox);
    this.tabs.robot.pane = h("div", { class: "sp-pane" }, this.robotBox);
    this.tabs.help.pane = h("div", { class: "sp-pane" }, this.helpBox);
    const side = h("aside", { class: "sp-side" },
      h("div", { class: "sp-sec-h" }, h("span", {}, "Тренировочное поле"), this.hud),
      this.field,
      h("div", { class: "sp-hubrow" }, hub, h("div", { class: "sp-ports-live" }, h("div", { class: "sp-sec-h" }, h("span", {}, "Порты")), this.portsBox)),
      h("div", { class: "sp-info" }, bar, this.tabs.task.pane, this.tabs.robot.pane, this.tabs.help.pane));
    r.append(tb, h("div", { class: "sp-body" }, editor, side));

    this.ws = createWorkspace(this.blocksDiv, () => { this.save(); if (!this.preview.hidden) this.updatePreview(); });
    this.decorateToolbox();
    this.py = new EditorView({ doc: "", parent: this.pyDiv,
      extensions: [basicSetup, python(), keymap.of([indentWithTab]), EditorView.updateListener.of((u) => { if (u.docChanged) this.save(); })] });
    this.renderHelp();
    this.showTab("task");
    new ResizeObserver(() => { this.resize(); Blockly.svgResize(this.ws); }).observe(this.root);
    requestAnimationFrame(() => this.loop());
  }

  /** Категории блоков кружками своего цвета, как в приложении SPIKE */
  decorateToolbox() {
    try {
      for (const item of this.ws.getToolbox().getToolboxItems()) {
        const row = item.rowDiv_ || (item.getDiv && item.getDiv() && item.getDiv().querySelector(".blocklyToolboxCategory, .blocklyTreeRow"));
        const box = item.rowContents_ || row;
        if (!row || !box || box.querySelector(".sp-dot")) continue;
        const color = item.colour_ || row.style.borderLeftColor || "#999";
        row.style.borderLeft = "0";
        const dot = document.createElement("span"); dot.className = "sp-dot"; dot.style.background = color;
        box.prepend(dot);
      }
    } catch (e) { /* другая версия Blockly: остаются полоски */ }
  }

  showTab(id) {
    if (id === "console" || id === "-console") {
      const open = id === "console";
      this.tabs.console.pane.hidden = !open; this.tabs.console.b.setAttribute("aria-expanded", String(open)); this.tabs.console.b.classList.toggle("open", open);
      requestAnimationFrame(() => Blockly.svgResize(this.ws));
      return;
    }
    for (const [k, t] of Object.entries(this.tabs)) {
      if (k === "console") continue;
      t.pane.hidden = k !== id; t.b.classList.toggle("active", k === id); t.b.setAttribute("aria-selected", String(k === id));
    }
  }

  /** Живые показания портов, как панель хаба в приложении */
  renderPorts() {
    const ports = { ...DEFAULT_ROBOT, ...((this.pd && this.pd.robot) || {}) }, st = this.state || {};
    const key = JSON.stringify([st.motors, st.yaw, Object.keys(st.sensors || {})]);
    if (key === this.portsKey) return;
    this.portsKey = key;
    this.portsBox.replaceChildren(...["A", "B", "C", "D", "E", "F"].map((p) => {
      const d = String(ports[p] || "");
      let v = "-";
      if (d.startsWith("motor") && st.motors && st.motors[p] !== undefined) v = `${st.motors[p]}°`;
      else if (d === "color" && st.sensors && st.sensors[p]) v = "цвет";
      const short = { "motor:large": "мотор L", "motor:medium": "мотор M", color: "цвет", distance: "дальномер", force: "сила" };
      return h("div", { class: "sp-port" + (d ? "" : " empty") }, h("b", {}, p), h("span", { title: PORT_TITLES[d] || "" }, d ? (short[d] || d) : "пусто"), h("em", {}, d ? v : ""));
    }), h("div", { class: "sp-port sp-port-yaw" }, h("b", {}, "Yaw"), h("span", {}, "гироскоп"), h("em", {}, st.yaw !== undefined ? `${(-st.yaw / 10).toFixed(0)}°` : "-")));
  }

  setMode(mode) {
    this.mode = mode;
    this.blocksDiv.hidden = mode !== "blocks"; this.pyDiv.hidden = mode !== "python";
    this.tabBlocks.classList.toggle("active", mode === "blocks"); this.tabPy.classList.toggle("active", mode === "python");
    this.btnPreview.hidden = this.btnToPy.hidden = mode !== "blocks";
    if (mode !== "blocks") this.preview.hidden = true;
    if (mode === "blocks") setTimeout(() => Blockly.svgResize(this.ws), 0);
    this.save();
  }

  togglePreview() { this.preview.hidden = !this.preview.hidden; this.btnPreview.classList.toggle("on", !this.preview.hidden); this.updatePreview(); }
  updatePreview() { this.preview.textContent = workspaceToPython(this.ws); }

  blocksToPython() {
    const code = workspaceToPython(this.ws);
    const cur = this.py.state.doc.toString();
    if (cur.trim() && cur.trim() !== code.trim() && !this.confirmTo) {
      this.confirmTo = true; this.btnToPy.textContent = "Заменить код Python?";
      setTimeout(() => { this.confirmTo = false; this.btnToPy.textContent = "→ В Python"; }, 3000);
      return;
    }
    this.confirmTo = false; this.btnToPy.textContent = "→ В Python";
    this.py.dispatch({ changes: { from: 0, to: this.py.state.doc.length, insert: code } });
    this.setMode("python");
    this.toast("Код блоков перенесен в Python. Блоки остались как были.");
  }

  loadBlocksJson(json) { loadBlocks(this.ws, json); this.save(); }

  code() { return this.mode === "blocks" ? workspaceToPython(this.ws) : this.py.state.doc.toString(); }

  // ─────────────── Данные ───────────────
  async load() {
    let pd = null;
    try { pd = await (await fetch(`/static/spikesim/presets/${this.presetName}.json`, { cache: "no-cache" })).json(); trPreset(pd); } catch (e) { pd = null; }
    this.pd = pd || { title: "Свободная тренировка", checks: [], mode: "blocks" };
    this.titleEl.textContent = this.pd.title || "Свободная тренировка";
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(this.storageKey) || "null"); } catch (e) { saved = null; }
    loadBlocks(this.ws, (saved && saved.blocks) || this.pd.blocks || null);
    const py = (saved && typeof saved.py === "string" && saved.py) || this.pd.python || "";
    this.py.dispatch({ changes: { from: 0, to: this.py.state.doc.length, insert: py } });
    this.setMode((saved && saved.mode) || this.pd.mode || "blocks");
    this.resetState();
    this.renderTask(); this.renderRobot();
    this.loaded = true;
  }

  save() {
    if (!this.loaded) return;
    clearTimeout(this.saveT);
    this.saveT = setTimeout(() => {
      try { localStorage.setItem(this.storageKey, JSON.stringify({ mode: this.mode, py: this.py.state.doc.toString(), blocks: saveBlocks(this.ws) })); } catch (e) { /* хранилище недоступно */ }
    }, 400);
  }

  resetAll() {
    if (!this.confirmReset) {
      this.confirmReset = true; this.btnReset.textContent = "Точно сбросить?";
      setTimeout(() => { this.confirmReset = false; this.btnReset.textContent = "Сброс"; }, 3000); return;
    }
    this.confirmReset = false; this.btnReset.textContent = "Сброс";
    this.stop();
    try { localStorage.removeItem(this.storageKey); } catch (e) { /* ничего */ }
    this.loaded = false; this.load();
  }

  resetState() {
    const st = this.pd.start || { x: 190, y: 150, h: -90 };
    this.start = { x: st.x, y: st.y, h: (st.h || 0) * Math.PI / 180 };
    this.state = { t: 0, pose: { ...this.start }, motors: {}, matrix: { text: "" }, box: this.pd.box ? { ...this.pd.box } : null,
      lever: this.pd.lever ? { up: true, flips: 0 } : null, sensors: {}, maxLineDist: 0 };
    this.trail = [];
    this.checkState = []; this.renderChecks();
  }

  download() {
    const blob = new Blob([this.code()], { type: "text/x-python" });
    const a = h("a", { href: URL.createObjectURL(blob), download: "main.py" }); document.body.append(a); a.click(); a.remove();
  }

  async copy() { try { await navigator.clipboard.writeText(this.code()); this.toast("Код скопирован"); } catch (e) { this.toast("Не удалось скопировать"); } }

  toast(text, kind = "") {
    const el = h("div", { class: "sp-toast " + kind }, text);
    if (this.toastBox.children.length >= 3) this.toastBox.firstChild.remove();
    this.toastBox.append(el); setTimeout(() => el.remove(), 2600);
  }

  // ─────────────── Запуск ───────────────
  run(opts = {}) {
    this.stop(true);
    this.resetState();
    this.prints = []; this.consoleBox.textContent = ""; this.beeps = 0; this.events = [];
    const code = this.code();
    this.lastCode = code;
    this.running = true; this.finished = false; this.ended = false; this.error = null;
    this.btnRun.textContent = "■"; this.btnRun.title = "Стоп"; this.btnRun.setAttribute("aria-label", "Остановить программу"); this.btnRun.classList.add("on");
    this.lastMsg = performance.now();
    const w = new Worker(WORKER_URL, { type: "module" });
    this.worker = w;
    w.onmessage = (e) => this.onMsg(e.data);
    w.onerror = (e) => { this.finish(false, "Ошибка симулятора: " + (e.message || "worker")); };
    w.postMessage({ type: "start", code, preset: this.pd, speed: opts.speed || this.speed, mjsUrl: MP_BASE + "micropython.mjs", wasmUrl: MP_BASE + "micropython.wasm" });
    this.startedAt = performance.now();
    if (this.tabs.console.pane.hidden && !this.pd.checks?.length) this.showTab("console");
  }

  stop(silent) {
    if (this.worker) { this.worker.terminate(); this.worker = null; }
    if (this.running && !silent) this.finish(false, null, true);
    this.running = false;
    this.btnRun.textContent = "▶"; this.btnRun.title = "Запуск"; this.btnRun.setAttribute("aria-label", "Запуск программы"); this.btnRun.classList.remove("on");
  }

  onMsg(m) {
    this.lastMsg = performance.now();
    if (m.type === "state") { this.state = m.state; this.trail.push([m.state.pose.x, m.state.pose.y]); if (this.trail.length > 4000) this.trail.shift(); this.evalLive(); }
    else if (m.type === "print") { this.prints.push(m.line); this.log(m.line); }
    else if (m.type === "beep") { this.beeps++; beep(m.freq, m.ms, m.vol); }
    else if (m.type === "event" && m.event === "lever") this.toast("Рычаг опущен!", "ok");
    else if (m.type === "done") {
      if (m.error && !/SystemExit/.test(m.error)) this.finish(false, m.error); else this.finish(true);
    }
  }

  finish(ok, error, byUser) {
    if (this.worker) { this.worker.terminate(); this.worker = null; }
    this.running = false; this.ended = true; this.finished = !!ok;
    this.btnRun.textContent = "▶"; this.btnRun.title = "Запуск"; this.btnRun.setAttribute("aria-label", "Запуск программы"); this.btnRun.classList.remove("on");
    if (error) {
      const ex = explainError(error);
      this.error = ex;
      this.log(ex.text, "err");
      if (ex.hint) this.log("Подсказка: " + ex.hint, "hint");
      this.showTab("console");
      if (ex.line && this.mode === "python") this.gotoLine(ex.line);
    } else if (byUser) this.log("Программа остановлена.", "muted");
    else this.log("Программа завершилась.", "muted");
    this.evalLive();
    if (this.allOk) { this.toast("Задание выполнено!", "ok"); if (window.academySolved) window.academySolved(this.presetName); }
  }

  gotoLine(n) {
    try { const line = this.py.state.doc.line(Math.min(n, this.py.state.doc.lines)); this.py.dispatch({ selection: { anchor: line.from, head: line.to }, scrollIntoView: true }); this.py.focus(); } catch (e) { /* нет строки */ }
  }

  log(text, kind = "") {
    const line = h("span", { class: kind ? "sp-l-" + kind : "" }, text + "\n");
    this.consoleBox.append(line);
    if (this.consoleBox.childNodes.length > 400) this.consoleBox.firstChild.remove();
    this.consoleBox.scrollTop = this.consoleBox.scrollHeight;
  }

  evalLive() {
    const checks = this.pd.checks || [];
    if (!checks.length || !this.state) return;
    this.allOk = evalChecks(checks, this.checkState, this.state, {
      ended: this.ended, finished: this.finished, beeps: this.beeps || 0, prints: this.prints, start: this.start, code: this.lastCode || this.code(),
    });
    this.renderChecksState();
  }

  // ─────────────── Задание, робот, справка ───────────────
  renderTask() {
    const pd = this.pd, box = this.taskBox; box.innerHTML = "";
    box.append(h("h4", {}, pd.title || "Свободная тренировка"));
    for (const line of (pd.task || "Тренировочный мат USTEM 2362 x 1143 мм, как поле FLL Challenge. Пишите программу блоками или на Python и нажимайте «Запуск».").split("\n")) box.append(h("p", {}, line));
    this.checkList = h("ul", { class: "sp-checklist" });
    this.doneEl = h("div", { class: "sp-done", hidden: true }, "Задание выполнено! Отметьте урок как пройденный.");
    if (pd.checks && pd.checks.length) box.append(h("p", { class: "sp-muted" }, "Проверка идет во время запуска. Каждый запуск начинает проверку заново."), this.checkList, this.doneEl);
    this.renderChecks();
  }
  renderChecks() {
    if (!this.checkList) return;
    this.checkList.innerHTML = "";
    this.checkEls = (this.pd.checks || []).map((c) => { const li = h("li", {}, c.label); this.checkList.append(li); return li; });
    this.renderChecksState();
  }
  renderChecksState() {
    (this.checkEls || []).forEach((li, i) => li.classList.toggle("ok", !!(this.checkState[i] && this.checkState[i].ok)));
    if (this.doneEl) this.doneEl.hidden = !this.allOk;
  }

  renderRobot() {
    const ports = { ...DEFAULT_ROBOT, ...(this.pd.robot || {}) };
    this.robotBox.innerHTML = "";
    this.robotBox.append(h("p", { class: "sp-muted" }, "Робот курса: приводная база на колесах 56 мм, расстояние между колесами 112 мм. Пара моторов в программе: motor_pair.pair(PAIR, port.A, port.B)."),
      h("table", { class: "sp-ports" }, h("tr", {}, h("th", {}, "Порт"), h("th", {}, "Устройство"), h("th", {}, "Назначение")),
        ...Object.entries(ports).map(([p, d]) => h("tr", {}, h("td", {}, p), h("td", {}, PORT_TITLES[d] || d || "пусто"), h("td", {}, d ? ROLE[p] : "")))),
      this.pd.drift ? h("p", { class: "sp-warn" }, `У этого робота правое колесо чуть больше левого (${(this.pd.drift * 100).toFixed(1).replace(".", ",")}%): без гироскопа он уходит в сторону, как настоящий.`) : null,
      h("p", { class: "sp-muted" }, "Скорость в блоках - проценты (100% = 1000 градусов в секунду), в Python - градусы в секунду."));
  }

  renderHelp() {
    const rows = [
      ["Пара моторов", "motor_pair.pair(motor_pair.PAIR_1, port.A, port.B)"],
      ["Ехать на градусы", "await motor_pair.move_for_degrees(PAIR, 720, 0, velocity=500)"],
      ["Ехать с рулем", "motor_pair.move(PAIR, steering, velocity=400)"],
      ["Танк", "motor_pair.move_tank(PAIR, 300, -300)"],
      ["Стоп", "motor_pair.stop(PAIR)"],
      ["Мотор на угол", "await motor.run_for_degrees(port.C, 90, 500)"],
      ["Позиция мотора", "motor.relative_position(port.B)"],
      ["Отражение", "color_sensor.reflection(port.E)"],
      ["Цвет", "color_sensor.color(port.E) == color.RED"],
      ["Гироскоп", "-motion_sensor.tilt_angles()[0] / 10"],
      ["Сброс угла", "motion_sensor.reset_yaw(0)"],
      ["Пауза", "await runloop.sleep_ms(500)"],
      ["Ждать условие", "await runloop.until(lambda: color_sensor.reflection(port.E) < 25)"],
      ["Матрица", "await light_matrix.write(\"1\")"],
      ["Кнопка", "button.pressed(button.LEFT)"],
      ["Звук", "await sound.beep(440, 200, 80)"],
    ];
    this.helpBox.append(h("p", { class: "sp-muted" }, "Python в симуляторе - MicroPython, как на хабе SPIKE Prime. Модули и параметры как в приложении SPIKE 3."),
      h("table", { class: "sp-ports" }, ...rows.map(([a, b]) => h("tr", {}, h("td", {}, a), h("td", {}, h("code", {}, b))))),
      h("p", { class: "sp-muted" }, "На настоящий хаб: «⭳ .py», затем в приложении SPIKE новый проект Python и вставить код. Кнопки ◀ ▶ хаба работают и в симуляторе."));
  }

  // ─────────────── Отрисовка ───────────────
  resize() {
    const w = this.field.clientWidth, dpr = window.devicePixelRatio || 1;
    if (!w) return;
    const hgt = Math.round(w * (MAT_H + 160) / (MAT_W + 160));
    this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(hgt * dpr); this.canvas.style.height = hgt + "px";
    this.draw();
  }

  loop() {
    if (!this.root.isConnected) return;
    if (this.running && performance.now() - this.lastMsg > 3000) {
      this.finish(false, "Программа зависла: цикл без await и без обращения к моторам или датчикам. Добавьте в цикл await runloop.sleep_ms(10).");
    }
    this.draw(); this.drawMatrix(); this.renderPorts();
    requestAnimationFrame(() => this.loop());
  }

  drawMatrix() {
    const st = this.state || {}, mx = st.matrix || {};
    let px = null;
    if (mx.pixels) px = mx.pixels.map((v) => v > 0);
    else if (mx.text) {
      const txt = String(mx.text).toUpperCase(), glyphs = [...txt].map((c) => FONT[c]);
      if (glyphs.every(Boolean)) {
        const cols = [];
        glyphs.forEach((g) => { for (let x = 0; x < 3; x++) cols.push([0, 1, 2, 3, 4].map((y) => g[y * 3 + x] === "1")); cols.push([0, 0, 0, 0, 0].map(() => false)); });
        let off = 0;
        if (glyphs.length > 1) { const len = cols.length + 5; off = Math.floor(performance.now() / 120) % len - 5; } else off = -1;
        px = [];
        for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) { const c = cols[x + off]; px.push(!!(c && c[y])); }
      }
    }
    const cells = this.matrix.children;
    for (let i = 0; i < 25; i++) cells[i].classList.toggle("on", !!(px && px[i]));
    this.matrixText.textContent = mx.text && !(px) ? mx.text : "";
  }

  draw() {
    const cv = this.canvas, ctx = cv.getContext("2d"), W = cv.width, H = cv.height;
    if (!W) return;
    const s = W / (MAT_W + 160), st = this.state;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#8b5e34"; ctx.fillRect(0, 0, W, H);           // борта стола
    ctx.setTransform(s, 0, 0, -s, 80 * s, H - 80 * s);              // мм, y вверх
    drawMat(ctx, (t, x, y) => this.text(ctx, t, x, y, 26, "rgba(15,23,42,.5)"));
    // шкала линейки
    for (let k = 0; k <= 10; k += 5) this.text(ctx, `${k * 10}`, 450 + k * 100, 160, 22, "#334155");
    if (!st) return;
    // ящик и рычаг
    if (st.box) {
      ctx.save(); ctx.translate(st.box.x, st.box.y);
      ctx.fillStyle = "#d97706"; ctx.fillRect(-55, -55, 110, 110); ctx.strokeStyle = "#78350f"; ctx.lineWidth = 6; ctx.strokeRect(-55, -55, 110, 110);
      ctx.beginPath(); ctx.moveTo(-55, -55); ctx.lineTo(55, 55); ctx.moveTo(55, -55); ctx.lineTo(-55, 55); ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
    }
    if (st.lever && this.pd.lever) {
      const L = this.pd.lever;
      ctx.fillStyle = "#475569"; ctx.fillRect(L.x - 40, L.y - 20, 80, 40);
      ctx.strokeStyle = st.lever.up ? "#dc2626" : "#16a34a"; ctx.lineWidth = 16; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(L.x, L.y); ctx.lineTo(L.x + (st.lever.up ? 0 : 90), L.y + (st.lever.up ? 90 : 0)); ctx.stroke(); ctx.lineCap = "butt";
      this.text(ctx, st.lever.up ? "рычаг" : "опущен!", L.x, L.y - 50, 24, st.lever.up ? "#991b1b" : "#15803d");
    }
    // отметки задания
    for (const m of this.pd.marks || []) {
      ctx.strokeStyle = "#7c3aed"; ctx.lineWidth = 6; ctx.setLineDash([16, 10]);
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      this.text(ctx, m.label, m.x, m.y + m.r + 28, 24, "#6d28d9");
    }
    // след
    if (this.trail.length > 1) {
      ctx.strokeStyle = "rgba(8,145,178,.7)"; ctx.lineWidth = 5; ctx.setLineDash([12, 10]);
      ctx.beginPath(); this.trail.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.setLineDash([]);
    }
    this.drawRobot(ctx, st);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const p = st.pose, yaw = -((p.h - this.start.h) * 180 / Math.PI);
    const n = ((yaw + 180) % 360 + 360) % 360 - 180;
    this.hud.textContent = `x ${Math.round(p.x)} мм  y ${Math.round(p.y)} мм  угол ${n.toFixed(1)}°`;
  }

  drawRobot(ctx, st) {
    const p = st.pose, ports = { ...DEFAULT_ROBOT, ...(this.pd.robot || {}) };
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.h);
    // в системе робота: вперед +y, вправо +x
    ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.fillRect(-BODY.half + 8, -BODY.back - 8, BODY.half * 2, BODY.front + BODY.back);
    ctx.fillStyle = "#e2e8f0"; ctx.strokeStyle = "#334155"; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.roundRect(-BODY.half, -BODY.back, BODY.half * 2, BODY.front + BODY.back, 18); ctx.fill(); ctx.stroke();
    // колеса
    ctx.fillStyle = "#111827";
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.roundRect(sx * (BODY.half + 2) - (sx > 0 ? 0 : 22), -28, 22, 56, 6); ctx.fill(); }
    // хаб с матрицей
    ctx.fillStyle = "#facc15"; ctx.strokeStyle = "#a16207"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(-46, -60, 92, 110, 12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#1e293b"; ctx.fillRect(-30, -20, 60, 60);
    // датчики цвета
    for (const port of ["E", "F"]) {
      if (ports[port] !== "color") continue;
      const sp = (this.pd.sensorPos && this.pd.sensorPos[port]) || SENSOR_POS[port];
      ctx.fillStyle = "#2563eb"; ctx.fillRect(sp[1] - 12, sp[0] - 12, 24, 24);
      ctx.strokeStyle = "rgba(220,38,38,.9)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(sp[1], sp[0], 7, 0, Math.PI * 2); ctx.stroke();
    }
    if (ports.D === "distance") { ctx.fillStyle = "#0f172a"; ctx.fillRect(-26, BODY.front - 14, 52, 16); }
    // рука на моторе C: проекция сверху
    const c = st.motors && st.motors.C;
    if (c !== undefined) {
      const reach = 110 * Math.sin(Math.max(0, Math.min(180, c)) * Math.PI / 180);
      ctx.strokeStyle = "#ea580c"; ctx.lineWidth = 14; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(0, BODY.front - 6); ctx.lineTo(0, BODY.front + Math.max(8, reach)); ctx.stroke(); ctx.lineCap = "butt";
    }
    // стрелка вперед
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(-14, 6); ctx.lineTo(14, 6); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  text(ctx, str, x, y, size, color) {
    ctx.save(); ctx.translate(x, y); ctx.scale(1, -1);
    ctx.fillStyle = color; ctx.font = `600 ${size}px Inter, system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(str, 0, 0); ctx.restore();
  }

  // для автопроверки: нажатие кнопки хаба
  press(which, ms = 150) {
    if (!this.worker) return;
    this.worker.postMessage({ type: "button", which, down: true });
    setTimeout(() => this.worker && this.worker.postMessage({ type: "button", which, down: false }), ms);
  }
}

const instances = [];
function mount() {
  for (const node of document.querySelectorAll(".spike-embed, [class*='spike-sim-']")) {
    if (node.dataset.mounted) continue;
    node.dataset.mounted = "1";
    const m = node.className.match(/spike-sim-([\w-]+)/);
    const preset = m ? "spike-" + m[1].replace(/^spike-/, "") : "spike-sandbox";
    const wrap = document.createElement("div");
    node.replaceWith(wrap);
    instances.push(new SpikeSim(wrap, { preset }));
    localize(wrap);
  }
}
onReady(mount);
window.USTEMSpike = { SpikeSim, mount, instances };
