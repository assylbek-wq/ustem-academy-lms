// Симулятор FTC для курса «FTC с нуля»: поле, Driver Hub, конструктор робота, код на Java и автопроверка.
import { EditorView, basicSetup } from "codemirror";
import { java } from "@codemirror/lang-java";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { Core, advance, DRIVES, MODULES, deviceList, inspect, HALF, CAPACITY, LAUNCH_MIN, LAUNCH_MAX, DEFAULT_ROBOT,
  ALLIANCES, FRAME, FRAME_LEGS, HIVES, CELL, TIP_AT, FLOWERS, flowerRect, LOADING, GARDEN, TRAY, POLLEN_R, NECTAR_R, cellCenter, otherSide } from "./core.js";

let VIEW_ROT = 0; // поворот вида: поле «глазами пилотов» своего альянса

const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v; else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else if (v !== false && v != null) e.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(k));
  return e;
};
const clone = (o) => JSON.parse(JSON.stringify(o));
const fmtTime = (s) => { s = Math.max(0, s); const m = Math.floor(s / 60); return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`; };
const BRAND = "#ea580c";

// Клавиатура -> геймпад
const KEYS = {
  KeyW: ["left_stick_y", -1], KeyS: ["left_stick_y", 1], KeyA: ["left_stick_x", -1], KeyD: ["left_stick_x", 1],
  ArrowLeft: ["right_stick_x", -0.6], ArrowRight: ["right_stick_x", 0.6], ArrowUp: ["right_stick_y", -1], ArrowDown: ["right_stick_y", 1],
  KeyJ: ["a", true], KeyK: ["b", true], KeyU: ["x", true], KeyI: ["y", true],
  KeyQ: ["left_bumper", true], KeyE: ["right_bumper", true], KeyZ: ["left_trigger", 1], KeyC: ["right_trigger", 1],
  KeyT: ["dpad_up", true], KeyG: ["dpad_down", true], KeyF: ["dpad_left", true], KeyH: ["dpad_right", true],
};
let activeSim = null;
const keysDown = new Set();
window.addEventListener("keydown", (e) => {
  if (!activeSim || !KEYS[e.code]) return;
  if (e.target.closest && e.target.closest(".cm-editor, input, textarea, select")) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  keysDown.add(e.code);
  if (["init", "run"].includes(activeSim.core.phase)) e.preventDefault();
});
window.addEventListener("keyup", (e) => keysDown.delete(e.code));
window.addEventListener("blur", () => keysDown.clear());

class FtcSim {
  constructor(root, { preset = "ftc-sandbox", storageKey = null } = {}) {
    this.root = root; this.presetName = preset; this.storageKey = storageKey || "ftc:" + preset;
    this.speed = 1; this.virtual = {}; this.toasts = [];
    this.core = new Core({});
    this.build();
    this.load();
  }

  // ─────────────── Разметка ───────────────
  build() {
    const r = this.root;
    r.classList.add("ftc");
    r.tabIndex = -1;
    r.addEventListener("pointerdown", () => { activeSim = this; });
    this.opLabel = h("span", { class: "ftc-op" }, "");
    this.btnInit = h("button", { type: "button", class: "ds-big ds-init", onclick: () => this.init() }, "INIT");
    this.btnStart = h("button", { type: "button", class: "ds-big ds-start", title: "START", "aria-label": "START", onclick: () => this.start(), disabled: true }, "▶");
    this.btnStop = h("button", { type: "button", class: "ds-stop", title: "STOP", "aria-label": "STOP", onclick: () => this.stop(), disabled: true }, "■");
    this.viewSel = h("select", { class: "ftc-select", title: "Как смотреть на поле", "aria-label": "Вид на поле", onchange: (e) => { this.view = e.target.value; this.draw(); } },
      h("option", { value: "driver" }, "Вид пилотов"), h("option", { value: "audience" }, "Вид зрителей"));
    this.view = "driver";
    const speed = h("select", { class: "ftc-select", title: "Скорость симуляции", "aria-label": "Скорость симуляции", onchange: (e) => { this.speed = +e.target.value; } },
      h("option", { value: 1 }, "1x"), h("option", { value: 2 }, "2x"), h("option", { value: 4 }, "4x"));
    this.btnReset = h("button", { type: "button", class: "ftc-tool", title: "Вернуть стартовый код и робота задания", onclick: () => this.resetAll() }, "Сброс");
    this.fileName = h("span", { class: "obj-file" }, "TeleOpMain.java");

    // OnBot Java: дерево проекта сверху, редактор, сообщения сборки снизу
    this.codeBox = h("div", { class: "ftc-code" });
    this.codeErr = h("pre", { class: "ftc-err", hidden: true });
    const editor = h("section", { class: "obj" },
      h("div", { class: "obj-head" }, h("b", {}, "OnBot Java"), h("span", { class: "obj-path" }, "TeamCode / src / org / firstinspires / ftc / teamcode /"), this.fileName),
      h("div", { class: "obj-tabs" }, h("span", { class: "obj-tab" }, this.fileName.cloneNode(true))),
      this.codeBox,
      h("div", { class: "obj-build" }, h("div", { class: "obj-build-h" }, "Сообщения сборки"), this.codeErr, this.buildOk = h("div", { class: "obj-build-ok" }, "Нажмите INIT на Driver Station: код соберется и запустится.")));

    // Поле
    this.canvas = h("canvas", { class: "ftc-canvas" });
    this.hudTime = h("div", { class: "ftc-hud-time" });
    this.hudScore = h("div", { class: "ftc-hud-score" });
    this.hudPose = h("div", { class: "ftc-hud-pose" });
    this.toastBox = h("div", { class: "ftc-toasts", "aria-live": "polite" });
    this.fieldWrap = h("div", { class: "ftc-field" }, this.canvas, this.hudTime, this.hudScore, this.hudPose, this.toastBox);
    this.padBox = this.buildPad();
    const keysHelp = h("details", { class: "ftc-keys" },
      h("summary", {}, "Управление геймпадом"),
      h("p", {}, "W A S D - левый стик, ← → - поворот (правый стик), ↑ ↓ - правый стик Y, J K U I - кнопки A B X Y, Q E - бамперы, Z C - триггеры, T G F H - крестовина. Подходит и настоящий геймпад по USB или Bluetooth."),
      h("button", { type: "button", class: "ftc-tool", onclick: () => { this.padBox.hidden = !this.padBox.hidden; } }, "Экранный геймпад"));

    // Driver Station
    this.hub = this.buildHub();

    // Робот и задание
    this.tabs = {};
    const tab = (id, title) => { const b = h("button", { type: "button", class: "ftc-tab", role: "tab", onclick: () => this.showTab(id) }, title); this.tabs[id] = { b }; return b; };
    const bar = h("div", { class: "ftc-tabbar", role: "tablist" }, tab("task", "Задание"), tab("robot", "Конфигурация робота"));
    this.robotBox = h("div", { class: "ftc-robot" });
    this.tabs.robot.pane = h("div", { class: "ftc-pane" }, this.robotBox);
    this.taskBox = h("div", { class: "ftc-task" });
    this.tabs.task.pane = h("div", { class: "ftc-pane" }, this.taskBox);

    const top = h("header", { class: "ftc-appbar" }, this.titleEl = h("span", { class: "ftc-title" }, ""), h("span", { class: "ftc-grow" }),
      h("button", { type: "button", class: "ftc-tool", title: "Вернуть робота и пыльцу на старт", onclick: () => this.resetField() }, "Поле на старт"),
      this.viewSel, speed, this.btnReset,
      h("button", { type: "button", class: "ftc-tool", title: "Во весь экран", "aria-label": "Во весь экран", onclick: () => { this.root.classList.toggle("ftc-full"); this.resize(); } }, "⛶"));
    const right = h("div", { class: "ftc-right" }, this.fieldWrap, this.hub, keysHelp, this.padBox,
      h("div", { class: "ftc-side" }, bar, this.tabs.task.pane, this.tabs.robot.pane));
    r.innerHTML = "";
    r.append(top, h("div", { class: "ftc-body" }, editor, right));

    this.editor = new EditorView({
      doc: "", parent: this.codeBox,
      extensions: [basicSetup, java(), keymap.of([indentWithTab]), EditorView.updateListener.of((u) => { if (u.docChanged) { this.save(); this.updateFileName(); } })],
    });
    this.showTab("task");
    new ResizeObserver(() => this.resize()).observe(this.fieldWrap);
    this.core.on((ev, data) => this.onCore(ev, data));
    requestAnimationFrame(() => this.loop());
  }

  updateFileName() {
    const m = this.code().match(/public\s+class\s+(\w+)/);
    const name = (m ? m[1] : "TeamCode") + ".java";
    for (const el of this.root.querySelectorAll(".obj-file")) el.textContent = name;
  }

  /** Driver Station: выбор программы, круглая кнопка INIT / START, STOP, таймер и телеметрия */
  buildHub() {
    this.hubState = h("span", { class: "ftc-hub-state" }, "Выберите программу");
    this.hubName = h("div", { class: "ftc-hub-name" }, "");
    this.hubTimer = h("div", { class: "ftc-hub-timer" }, "0:00");
    this.hubTel = h("pre", { class: "ftc-hub-tel" }, "");
    this.hubErr = h("pre", { class: "ftc-hub-err", hidden: true });
    this.hubLog = h("pre", { class: "ftc-hub-log", hidden: true });
    return h("section", { class: "ds", "aria-label": "Driver Station" },
      h("div", { class: "ds-top" }, h("span", { class: "ds-brand" }, "Driver Station"), h("span", { class: "ds-net" }, h("i"), "Robot Controller подключен"), h("span", { class: "ds-volt" }, "12,8 В")),
      h("div", { class: "ds-main" },
        h("div", { class: "ds-left" },
          h("div", { class: "ds-op" }, h("span", { class: "ds-op-k" }, "OpMode"), this.hubName),
          h("div", { class: "ds-controls" }, this.btnInit, this.btnStart, h("div", { class: "ds-timer" }, this.hubTimer, this.hubState), this.btnStop)),
        h("div", { class: "ds-telwrap" }, h("div", { class: "ds-tel-h" }, "Telemetry"), this.hubTel, this.hubErr, this.hubLog)));
  }

  buildPad() {
    const stick = (axX, axY) => {
      const knob = h("div", { class: "ftc-knob" });
      const base = h("div", { class: "ftc-stick" }, knob);
      const set = (x, y) => { this.virtual[axX] = x; this.virtual[axY] = y; knob.style.transform = `translate(${x * 28}px, ${y * 28}px)`; };
      let id = null;
      const move = (e) => {
        if (e.pointerId !== id) return;
        const b = base.getBoundingClientRect();
        let x = (e.clientX - b.left - b.width / 2) / (b.width / 2), y = (e.clientY - b.top - b.height / 2) / (b.height / 2);
        const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
        set(+x.toFixed(2), +y.toFixed(2));
      };
      base.addEventListener("pointerdown", (e) => { id = e.pointerId; base.setPointerCapture(id); activeSim = this; move(e); });
      base.addEventListener("pointermove", move);
      const up = (e) => { if (e.pointerId === id) { id = null; set(0, 0); } };
      base.addEventListener("pointerup", up); base.addEventListener("pointercancel", up);
      return base;
    };
    const btn = (key, label, cls = "") => {
      const b = h("button", { type: "button", class: "ftc-pbtn " + cls }, label);
      const on = (v) => (e) => { e.preventDefault(); this.virtual[key] = v ? (key.endsWith("trigger") ? 1 : true) : 0; b.classList.toggle("on", v); };
      b.addEventListener("pointerdown", on(true)); b.addEventListener("pointerup", on(false)); b.addEventListener("pointerleave", on(false)); b.addEventListener("pointercancel", on(false));
      return b;
    };
    return h("div", { class: "ftc-pad", hidden: true },
      h("div", { class: "ftc-pad-col" }, h("div", { class: "ftc-pad-row" }, btn("left_bumper", "LB"), btn("left_trigger", "LT")), stick("left_stick_x", "left_stick_y")),
      h("div", { class: "ftc-pad-col" }, h("div", { class: "ftc-abxy" }, btn("y", "Y", "y"), btn("x", "X", "x"), btn("b", "B", "b"), btn("a", "A", "a"))),
      h("div", { class: "ftc-pad-col" }, h("div", { class: "ftc-pad-row" }, btn("right_trigger", "RT"), btn("right_bumper", "RB")), stick("right_stick_x", "right_stick_y")));
  }

  showTab(id) {
    if (!this.tabs[id]) return; // код и Driver Station видны всегда
    for (const [k, t] of Object.entries(this.tabs)) { t.pane.hidden = k !== id; t.b.classList.toggle("active", k === id); t.b.setAttribute("aria-selected", String(k === id)); }
    if (id === "robot") this.renderRobot();
  }

  toast(text, kind = "", key = null) {
    if (key) for (const old of this.toastBox.querySelectorAll(`[data-key="${key}"]`)) old.remove();
    if (this.toastBox.children.length >= 3) this.toastBox.firstChild.remove();
    const el = h("div", { class: "ftc-toast " + kind, "data-key": key }, text);
    this.toastBox.append(el);
    setTimeout(() => el.remove(), 2200);
  }

  // ─────────────── Данные ───────────────
  async load() {
    let pd = null;
    try { pd = await (await fetch(`/static/ftcsim/presets/${this.presetName}.json`, { cache: "no-cache" })).json(); } catch (e) { pd = null; }
    this.presetData = pd || { title: "Свободная тренировка", robot: DEFAULT_ROBOT, code: "", checks: [] };
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(this.storageKey) || "null"); } catch (e) { saved = null; }
    const robot = (saved && saved.robot) || this.presetData.robot || DEFAULT_ROBOT;
    const code = (saved && typeof saved.code === "string" && saved.code) || this.presetData.code || "";
    this.core.preset = this.presetData;
    this.core.setRobot(robot);
    this.editor.dispatch({ changes: { from: 0, to: this.editor.state.doc.length, insert: code } });
    this.core.code = code; this.core.evalStatic();
    this.titleEl.textContent = this.presetData.title || "Свободная тренировка";
    this.updateFileName();
    this.renderTask(); this.renderRobot(); this.refreshButtons(); this.updateHub();
    this.showTab(this.presetData.tab || (this.presetData.checks && this.presetData.checks.length ? "task" : "code"));
    this.resize();
  }

  save() {
    clearTimeout(this.saveT);
    this.saveT = setTimeout(() => {
      try { localStorage.setItem(this.storageKey, JSON.stringify({ code: this.code(), robot: this.core.robot })); } catch (e) { /* хранилище недоступно */ }
    }, 300);
    this.codeErr.hidden = true;
  }

  code() { return this.editor.state.doc.toString(); }

  resetAll() {
    if (!this.confirmReset) {
      this.confirmReset = true; this.btnReset.textContent = "Точно сбросить?";
      setTimeout(() => { this.confirmReset = false; this.btnReset.textContent = "Сброс"; }, 3000);
      return;
    }
    this.confirmReset = false; this.btnReset.textContent = "Сброс";
    this.stop();
    this.editor.dispatch({ changes: { from: 0, to: this.editor.state.doc.length, insert: this.presetData.code || "" } });
    this.setRobot(clone(this.presetData.robot || DEFAULT_ROBOT));
    try { localStorage.removeItem(this.storageKey); } catch (e) { /* ничего */ }
  }

  resetField() {
    if (["init", "run"].includes(this.core.phase)) return;
    this.core.reset(); this.core.code = this.code(); this.core.evalStatic();
    this.renderChecks(); this.refreshButtons(); this.updateHub();
  }

  setRobot(robot) {
    if (["init", "run"].includes(this.core.phase)) return;
    this.core.setRobot(robot);
    this.core.code = this.code(); this.core.evalStatic();
    this.renderRobot(); this.renderChecks(); this.save(); this.updateHub();
  }

  // ─────────────── Управление программой ───────────────
  init() {
    activeSim = this;
    this.core.script = this.script || null;
    const ok = this.core.init(this.code());
    this.updateHub();
    if (!ok) {
      this.codeErr.textContent = this.core.error; this.codeErr.hidden = false; this.buildOk.hidden = true;
    } else {
      this.codeErr.hidden = true; this.buildOk.hidden = false; this.buildOk.textContent = "Сборка прошла успешно.";
      if (["code", "task"].includes(this.currentTab()) && !this.presetData.keepTab) this.showTab("hub");
    }
    this.renderChecks(); this.refreshButtons();
    return ok;
  }

  start() { this.core.start(); this.refreshButtons(); this.updateHub(); this.root.focus({ preventScroll: true }); }
  stop() { this.core.stop("Нажата кнопка STOP"); }

  currentTab() { return Object.keys(this.tabs).find((k) => !this.tabs[k].pane.hidden); }

  refreshButtons() {
    const ph = this.core.phase;
    this.btnInit.disabled = ["init", "run"].includes(ph);
    this.btnStart.disabled = ph !== "init" || !this.core.reachedWait;
    this.btnStop.disabled = !["init", "run"].includes(ph);
    // как на Driver Station: одна большая кнопка - INIT, после инициализации ▶ START
    this.btnInit.hidden = ["init", "run"].includes(ph);
    this.btnStart.hidden = ph !== "init";
    this.btnStart.classList.toggle("ready", !this.btnStart.disabled);
    const kind = this.core.kind === "auto" ? "Autonomous" : this.core.kind === "teleop" ? "TeleOp" : "";
    this.opLabel.textContent = this.core.opName ? `${this.core.opName} · ${kind}` : "";
  }

  onCore(ev, data) {
    if (ev === "phase" || ev === "ready") { this.refreshButtons(); this.updateHub(); this.renderChecks(); if (ev === "phase" && ["done", "stopped", "error"].includes(this.core.phase)) this.afterRun(); }
    else if (ev === "shot") {
      if (data.hit) return;
      if (data.dist < LAUNCH_MIN) this.toast(`Мимо: слишком близко к улью (${Math.round(data.dist)} дюймов, нужно от ${LAUNCH_MIN})`, "bad");
      else if (data.dist > LAUNCH_MAX) this.toast(`Мимо: слишком далеко (${Math.round(data.dist)} дюймов, нужно до ${LAUNCH_MAX})`, "bad");
      else this.toast(`Мимо верхней ячейки: промах ${Math.round(data.miss)} дюймов вбок`, "bad");
    } else if (ev === "cell") this.toast(`В верхней ячейке ${this.core.cells[this.core.alliance].up.length}/${TIP_AT}`, "ok", "cell");
    else if (ev === "tip") { if (data.alliance === this.core.alliance) this.toast("HIVE TIP! +20. Верхняя ячейка теперь с другой стороны", "ok", "cell"); }
    else if (ev === "collect") this.toast(`В роботе ${this.core.held.length}/${CAPACITY}` + (data && data.flower ? ` (из цветка ${data.flower})` : ""), "", "held");
    else if (ev === "flower") this.toast(data.ok ? `Элемент в цветке ${data.flower}` : "Цветки открыты для очков только в последние 60 секунд", data.ok ? "ok" : "bad");
    else if (ev === "endgame") this.toast("Минута до конца: цветки открыты, весь NECTAR на поле", "ok");
  }

  afterRun() {
    const c = this.core;
    if (c.phase === "error") { this.codeErr.textContent = c.error; this.codeErr.hidden = false; this.buildOk.hidden = true; }
    this.renderChecks();
    if (c.allOk) { this.toast("Задание выполнено!", "ok"); if (window.academySolved) window.academySolved(this.presetName); }
  }

  // ─────────────── Цикл ───────────────
  readInput() {
    const inp = {};
    for (const code of keysDown) { const [k, v] = KEYS[code]; inp[k] = typeof v === "number" ? (inp[k] || 0) + v : v; }
    for (const [k, v] of Object.entries(this.virtual)) { if (v) inp[k] = typeof v === "number" ? (Math.abs(v) > Math.abs(inp[k] || 0) ? v : inp[k]) : v; }
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
    const gp = pads.find((p) => p.mapping === "standard") || pads[0];
    if (gp) {
      const ax = (i) => (Math.abs(gp.axes[i] || 0) > 0.08 ? gp.axes[i] : 0);
      const pick = (k, v) => { if (Math.abs(v) > Math.abs(inp[k] || 0)) inp[k] = v; };
      pick("left_stick_x", ax(0)); pick("left_stick_y", ax(1)); pick("right_stick_x", ax(2)); pick("right_stick_y", ax(3));
      const b = (i) => !!(gp.buttons[i] && gp.buttons[i].pressed);
      const names = ["a", "b", "x", "y", "left_bumper", "right_bumper", null, null, "back", "start", "left_stick_button", "right_stick_button", "dpad_up", "dpad_down", "dpad_left", "dpad_right"];
      names.forEach((n, i) => { if (n && b(i)) inp[n] = true; });
      pick("left_trigger", gp.buttons[6] ? gp.buttons[6].value : 0); pick("right_trigger", gp.buttons[7] ? gp.buttons[7].value : 0);
    }
    this.core.input = activeSim === this || gp ? inp : {};
  }

  async loop() {
    if (!this.root.isConnected) return;
    const c = this.core;
    if (["init", "run"].includes(c.phase) && !this.stepping) {
      this.stepping = true;
      try { this.readInput(); await advance(c, this.speed); } finally { this.stepping = false; }
      this.tickHud();
    }
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  tickHud() {
    const c = this.core;
    if (!this.hudT || performance.now() - this.hudT > 120) { this.hudT = performance.now(); this.updateHub(); this.renderChecksState(); }
  }

  updateHub() {
    const c = this.core;
    const states = { idle: "Выберите программу и нажмите INIT", init: c.reachedWait ? "INIT готов: нажмите START" : "INIT...", run: "Работает", done: "Программа завершилась", stopped: "Остановлено", error: "Ошибка" };
    this.hubState.textContent = states[c.phase] || "";
    this.hubState.className = "ftc-hub-state " + c.phase;
    this.hubName.textContent = c.opName ? `${c.opName} (${c.kind === "auto" ? "Autonomous" : "TeleOp"})` : "Программа не выбрана";
    const rt = c.tStart != null ? c.t - c.tStart : 0;
    this.hubTimer.textContent = c.kind === "auto" && c.tStart != null ? fmtTime(30 - rt) : c.preset.limit && c.tStart != null ? fmtTime(c.preset.limit - rt) : fmtTime(rt);
    const tel = c.telemetryShown.join("\n");
    if (this.hubTel.textContent !== tel) this.hubTel.textContent = tel;
    this.hubErr.hidden = !c.error; this.hubErr.textContent = c.error || "";
    const log = c.log.slice(-8).join("\n");
    this.hubLog.hidden = !log; this.hubLog.textContent = log ? "System.out:\n" + log : "";
    // HUD поля
    const ph = c.phase === "run" ? (c.kind === "auto" ? "AUTO" : "TELEOP") : c.phase === "init" ? "INIT" : "";
    this.hudTime.textContent = ph ? `${ph} ${this.hubTimer.textContent}` : "";
    this.hudTime.hidden = !ph;
    const hasGame = c.has("intake") || c.has("launcher");
    const al = ALLIANCES[c.alliance].name;
    this.hudScore.textContent = `${al}: ${c.total} оч.` + (hasGame ? ` · в роботе ${c.held.length}/${CAPACITY}` : "");
    this.hudScore.style.color = ALLIANCES[c.alliance].color;
    this.hudPose.textContent = `x ${c.pose.x.toFixed(1)}  y ${c.pose.y.toFixed(1)}  курс ${c.heading.toFixed(1)}°`;
  }

  // ─────────────── Задание ───────────────
  renderTask() {
    const pd = this.presetData, box = this.taskBox;
    box.innerHTML = "";
    box.append(h("h4", {}, pd.title || "Свободная тренировка"));
    for (const line of (pd.task || "Поле FIRST Tech Challenge BIOBUZZ 2026-2027. Заберите POLLEN из цветков и садов, забрасывайте в верхнюю ячейку своего улья, переворачивайте улей (HIVE TIP, 20 очков), к концу встаньте в свою LOADING ZONE. Пишите программу на вкладке «Код».").split("\n")) box.append(h("p", {}, line));
    this.checkList = h("ul", { class: "ftc-checklist" });
    this.doneEl = h("div", { class: "ftc-done", hidden: true }, "Задание выполнено! Отметьте урок как пройденный.");
    if (pd.checks && pd.checks.length) box.append(h("p", { class: "ftc-muted" }, "Проверка идет во время работы программы. Каждый запуск INIT начинает проверку заново."), this.checkList, this.doneEl);
    box.append(h("details", { class: "ftc-rules" }, h("summary", {}, "Поле BIOBUZZ в симуляторе: что как устроено"),
      h("ul", {},
        h("li", {}, "Поле, улей, цветки, сады (GARDEN), зоны загрузки (LOADING ZONE) и расстановка элементов взяты из официальной CAD-модели поля FIRST и Competition Manual (разделы 9 и 10). Красный альянс слева от зрителей, синий справа."),
        h("li", {}, "Улей каждого альянса: две ячейки, верхняя открыта для броска. В начале в верхней ячейке 3 NECTAR. Когда в ней набирается " + TIP_AT + " элементов, улей переворачивается (HIVE TIP, 20 очков), содержимое высыпается, а бросать теперь нужно в ячейку с другой стороны. Порог " + TIP_AT + " - упрощение симулятора: на настоящем поле улей переворачивает вес."),
        h("li", {}, "Бросок: маховик launcher раскручен, заслонка gate открыта (больше 0,5). Попадание, если до центра верхней ячейки по полу " + LAUNCH_MIN + "-" + LAUNCH_MAX + " дюймов и промах вбок не больше 8 дюймов (ширина ячейки 20). Пока маховик крутится, видна линия прицела."),
        h("li", {}, "Захват берет POLLEN и NECTAR своего цвета, в роботе помещается 4. Перед цветком захват вынимает POLLEN через нижнее окно. Подъемник выше 2200 тиков достает до верха цветка (21,5 дюйма): реверс захвата кладет элемент в цветок, очки за цветки - только в последние 60 секунд."),
        h("li", {}, "Очки по мануалу: LEAVE 3 и PARK 5 в AUTO, PARK 5 в конце, HIVE TIP 20, элемент в верхней ячейке в конце 2, элемент в своем цветке 2, нижний NECTAR в цветке 5, элемент в своем саду 1. Соперников и партнера по альянсу в симуляторе нет."),
        h("li", {}, "Мотор: 537,7 тика на оборот, колесо 104 мм, около 41,8 тика на дюйм, максимум около 60 дюймов в секунду."))));
    this.renderChecks();
  }

  renderChecks() {
    if (!this.checkList) return;
    const checks = this.presetData.checks || [];
    this.checkList.innerHTML = "";
    this.checkEls = checks.map((c) => { const li = h("li", {}, c.label); this.checkList.append(li); return li; });
    this.renderChecksState();
  }

  renderChecksState() {
    const st = this.core.checkState;
    (this.checkEls || []).forEach((li, i) => li.classList.toggle("ok", !!(st[i] && st[i].ok)));
    if (this.doneEl) this.doneEl.hidden = !this.core.allOk;
  }

  // ─────────────── Конструктор робота ───────────────
  renderRobot() {
    const box = this.robotBox; if (!box) return;
    const robot = this.core.robot, locked = ["init", "run"].includes(this.core.phase);
    box.innerHTML = "";
    if (locked) box.append(h("p", { class: "ftc-warn" }, "Остановите программу (STOP), чтобы менять робота."));
    const upd = (fn) => { const rb = clone(this.core.robot); fn(rb); this.setRobot(rb); };
    this.preview = h("canvas", { class: "ftc-preview", width: 240, height: 240 });
    box.append(h("div", { class: "ftc-builder-top" }, this.preview,
      h("div", { class: "ftc-builder-side" },
        h("div", { class: "ftc-label" }, "Шасси"),
        ...Object.entries(DRIVES).map(([id, d]) => h("label", { class: "ftc-choice" + (robot.drive === id ? " on" : "") },
          h("input", { type: "radio", name: "drive-" + this.storageKey, checked: robot.drive === id, disabled: locked, onchange: () => upd((rb) => { rb.drive = id; }) }),
          h("span", {}, h("b", {}, d.title), h("small", {}, id === "mecanum" ? "4 мотора, едет в любую сторону" : "2 мотора, просто и сильно толкает")))),
        this.presetName === "ftc-sandbox" ? h("div", { class: "ftc-label" }, "Альянс") : null,
        this.presetName === "ftc-sandbox" ? h("div", { class: "ftc-row2" }, ...["red", "blue"].map((a) => h("label", { class: "ftc-choice" + ((robot.alliance || "red") === a ? " on" : "") },
          h("input", { type: "radio", name: "al-" + this.storageKey, checked: (robot.alliance || "red") === a, disabled: locked, onchange: () => upd((rb) => { rb.alliance = a; }) }),
          h("span", {}, h("b", {}, ALLIANCES[a].name))))) : null,
        h("div", { class: "ftc-label" }, `Рама: ${String(robot.size).replace(".", ",")} дюйма (${(robot.size * 2.54).toFixed(1).replace(".", ",")} см)`),
        h("input", { type: "range", class: "ftc-range", min: 14, max: 20, step: 0.5, value: robot.size, disabled: locked, onchange: (e) => upd((rb) => { rb.size = +e.target.value; }) }))));
    box.append(h("div", { class: "ftc-label" }, "Механизмы и датчики"));
    box.append(h("div", { class: "ftc-modules" }, ...Object.entries(MODULES).map(([id, m]) => {
      const on = (robot.modules || []).includes(id);
      return h("label", { class: "ftc-choice" + (on ? " on" : "") },
        h("input", { type: "checkbox", checked: on, disabled: locked, onchange: (e) => upd((rb) => { rb.modules = (rb.modules || []).filter((x) => x !== id); if (e.target.checked) rb.modules.push(id); }) }),
        h("span", {}, h("b", {}, m.title), h("small", {}, m.text)));
    })));
    // Конфигурация
    box.append(h("div", { class: "ftc-label" }, "Конфигурация (как Configure Robot в Driver Station)"));
    const devs = deviceList(robot);
    box.append(h("table", { class: "ftc-config" },
      h("tr", {}, h("th", {}, "Порт"), h("th", {}, "Тип"), h("th", {}, "Имя")),
      ...devs.map((d) => h("tr", {}, h("td", {}, d.port), h("td", {}, d.type),
        h("td", {}, h("input", { class: "ftc-input", value: d.name, disabled: locked, spellcheck: "false",
          onchange: (e) => upd((rb) => { rb.names = rb.names || {}; rb.names[d.role] = e.target.value.trim(); }) }))))));
    // Осмотр
    box.append(h("div", { class: "ftc-label" }, "Осмотр робота"));
    box.append(h("ul", { class: "ftc-checklist" }, ...inspect(robot).map((x) => h("li", { class: x.ok ? "ok" : "bad" }, x.label))));
    this.drawPreview();
  }

  drawPreview() {
    const cv = this.preview; if (!cv) return;
    const ctx = cv.getContext("2d"), W = cv.width;
    ctx.clearRect(0, 0, W, W);
    ctx.fillStyle = "#e5e7eb"; ctx.fillRect(0, 0, W, W);
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1;
    const s = W / 30;
    for (let i = 0; i <= 30; i += 6) { ctx.beginPath(); ctx.moveTo(i * s, 0); ctx.lineTo(i * s, W); ctx.moveTo(0, i * s); ctx.lineTo(W, i * s); ctx.stroke(); }
    // куб 18 дюймов
    ctx.setLineDash([5, 4]); ctx.strokeStyle = "#16a34a"; ctx.lineWidth = 2;
    ctx.strokeRect((15 - 9) * s, (15 - 9) * s, 18 * s, 18 * s); ctx.setLineDash([]);
    ctx.fillStyle = "#16a34a"; ctx.font = "11px Inter, system-ui, sans-serif"; ctx.fillText("куб 18 дюймов", 4, 13);
    ctx.save(); ctx.translate(W / 2, W / 2); ctx.scale(s, -s);
    drawRobot(ctx, this.core, { x: 0, y: 0, h: 0 }, true);
    ctx.restore();
  }

  // ─────────────── Отрисовка поля ───────────────
  resize() {
    const wrap = this.fieldWrap; if (!wrap) return;
    const w = wrap.clientWidth, dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(w * dpr); this.canvas.height = Math.round(w * dpr);
    this.canvas.style.height = w + "px";
    this.draw();
  }

  draw() {
    const cv = this.canvas, ctx = cv.getContext("2d"), W = cv.width;
    if (!W) return;
    const c = this.core, SPAN = 164, s = W / SPAN;
    VIEW_ROT = this.view === "driver" ? (c.alliance === "red" ? Math.PI / 2 : -Math.PI / 2) : 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#e2e8f0"; ctx.fillRect(0, 0, W, W);
    ctx.setTransform(s, 0, 0, -s, W / 2, W / 2); // мировые координаты: дюймы, y вверх
    ctx.rotate(VIEW_ROT);
    // зоны альянсов за стенами и лотки NECTAR
    for (const a of ["red", "blue"]) {
      const A = ALLIANCES[a], sx = Math.sign(A.wallX);
      ctx.fillStyle = a === "red" ? "rgba(220,38,38,.12)" : "rgba(37,99,235,.12)";
      ctx.fillRect(sx > 0 ? 73 : -82, -47.9, 9, 95.8);
      const T = TRAY[a];
      ctx.fillStyle = "#f8fafc"; ctx.strokeStyle = A.color; ctx.lineWidth = 0.4;
      ctx.fillRect(T.x0, T.y0, T.x1 - T.x0, T.y1 - T.y0); ctx.strokeRect(T.x0, T.y0, T.x1 - T.x0, T.y1 - T.y0);
      for (let k = 0; k < c.trays[a]; k++) nectar(ctx, (T.x0 + T.x1) / 2, T.y0 + 2.2 + k * 2.9, NECTAR_R * 0.8, a);
    }
    // плитки 6 x 6
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
      ctx.fillStyle = (i + j) % 2 ? "#c9ced6" : "#d1d6dd";
      ctx.fillRect(-72 + i * 24 + 0.12, -72 + j * 24 + 0.12, 23.76, 23.76);
    }
    // LOADING ZONE и GARDEN: лента альянса
    for (const a of ["red", "blue"]) {
      const A = ALLIANCES[a], Z = LOADING[a], G = GARDEN[a];
      ctx.fillStyle = a === "red" ? "rgba(220,38,38,.10)" : "rgba(37,99,235,.10)";
      ctx.fillRect(Z.x0, Z.y0, Z.x1 - Z.x0, Z.y1 - Z.y0);
      ctx.strokeStyle = A.color; ctx.lineWidth = 1; ctx.strokeRect(Z.x0 + 0.5, Z.y0 + 0.5, Z.x1 - Z.x0 - 1, Z.y1 - Z.y0 - 1);
      text(ctx, "LOADING", (Z.x0 + Z.x1) / 2, (Z.y0 + Z.y1) / 2, 2.4, A.color, "bold");
      ctx.fillStyle = A.color; ctx.globalAlpha = 0.85; ctx.fillRect(G.x0, G.y0, G.x1 - G.x0, G.y1 - G.y0); ctx.globalAlpha = 1;
      text(ctx, "GARDEN", (G.x0 + G.x1) / 2, G.y0 > 0 ? G.y0 - 3 : G.y1 + 3, 2.4, A.color, "bold");
    }
    // старт
    const sp = c.startPose;
    ctx.save(); ctx.translate(sp.x, sp.y); ctx.rotate(sp.h);
    ctx.setLineDash([1.5, 1.5]); ctx.strokeStyle = "rgba(15,23,42,.45)"; ctx.lineWidth = 0.4; ctx.strokeRect(-c.size / 2, -c.size / 2, c.size, c.size);
    ctx.restore(); ctx.setLineDash([]);
    // отметки и флажки
    const zoneCheck = (c.preset.checks || []).findIndex((x) => x.type === "zones");
    const seen = zoneCheck >= 0 && c.checkState[zoneCheck] && c.checkState[zoneCheck].seen;
    (c.preset.marks || []).forEach((m, k) => {
      const ok = seen && seen.has(k);
      ctx.fillStyle = ok ? "rgba(22,163,74,.25)" : "rgba(124,58,237,.14)"; ctx.strokeStyle = ok ? "#16a34a" : "#7c3aed"; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.arc(m.x, m.y, Math.max(m.r, 2.5), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(m.x - 1.5, m.y); ctx.lineTo(m.x + 1.5, m.y); ctx.moveTo(m.x, m.y - 1.5); ctx.lineTo(m.x, m.y + 1.5); ctx.stroke();
      text(ctx, m.label, m.x, m.y + Math.max(m.r, 2.5) + 2.5, 3.4, ok ? "#15803d" : "#6d28d9", "bold");
    });
    // след
    if (c.trail.length > 1) {
      ctx.strokeStyle = "rgba(8,145,178,.65)"; ctx.lineWidth = 0.6; ctx.setLineDash([1.2, 1.2]);
      ctx.beginPath(); c.trail.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.lineTo(c.pose.x, c.pose.y); ctx.stroke(); ctx.setLineDash([]);
    }
    // элементы на полу
    for (const b of c.items) if (b.state === "field") (b.kind === "nectar" ? nectar(ctx, b.x, b.y, NECTAR_R, b.color) : ball(ctx, b.x, b.y, POLLEN_R + 0.15));
    // цветки
    FLOWERS.forEach((f, i) => drawFlower(ctx, f, c.flowerStock[i], c.flowerScored[i], c.flowersOpen()));
    // робот (под ульем: улей выше робота)
    drawRobot(ctx, c, c.pose, false);
    // улей и рама
    drawHiveStructure(ctx, c);
    // прицел
    const L = c.motors.launcher;
    if (L && Math.abs(L.vel) > 0.15) {
      const aim = c.aim(), fx = -Math.sin(c.pose.h), fy = Math.cos(c.pose.h);
      ctx.strokeStyle = aim.hit ? "rgba(22,163,74,.95)" : "rgba(220,38,38,.65)"; ctx.lineWidth = 0.5; ctx.setLineDash([2, 1.5]);
      const len = Math.min(110, Math.max(20, aim.dist));
      ctx.beginPath(); ctx.moveTo(c.pose.x, c.pose.y); ctx.lineTo(c.pose.x + fx * len, c.pose.y + fy * len); ctx.stroke();
      ctx.setLineDash([1, 2]); ctx.strokeStyle = "rgba(234,88,12,.4)";
      for (const r of [LAUNCH_MIN, LAUNCH_MAX]) { ctx.beginPath(); ctx.arc(aim.target.x, aim.target.y, r, 0, Math.PI * 2); ctx.stroke(); }
      ctx.setLineDash([]);
    }
    // датчик расстояния
    if (c.has("distance")) {
      const d = Math.min(c.rayFront(), 200 / 2.54), fx = -Math.sin(c.pose.h), fy = Math.cos(c.pose.h), o = c.size / 2;
      ctx.strokeStyle = "rgba(220,38,38,.55)"; ctx.lineWidth = 0.35;
      ctx.beginPath(); ctx.moveTo(c.pose.x + fx * o, c.pose.y + fy * o); ctx.lineTo(c.pose.x + fx * (o + d), c.pose.y + fy * (o + d)); ctx.stroke();
    }
    // летящие элементы
    for (const f of c.flying) {
      if (f.done) continue;
      const k = Math.min(1, f.t / f.dur), x = f.x0 + (f.x1 - f.x0) * k, y = f.y0 + (f.y1 - f.y0) * k, r = 1.6 + Math.sin(k * Math.PI) * 2;
      if (f.item.kind === "nectar") nectar(ctx, x, y, r * 1.2, f.item.color); else ball(ctx, x, y, r);
    }
    // стены поля
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 1.4; ctx.strokeRect(-72.7, -72.7, 145.4, 145.4);
    // подпись зрителей
    if (this.view !== "driver") text(ctx, "ЗРИТЕЛИ", 0, -76, 2.8, "#64748b", "bold");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (this.preview && !this.tabs.robot.pane.hidden && ["init", "run"].includes(c.phase)) this.drawPreview();
  }
}

function text(ctx, str, x, y, size, color, weight = "") {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-VIEW_ROT); ctx.scale(1, -1);
  ctx.fillStyle = color; ctx.font = `${weight} ${size}px Inter, system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(str, 0, 0); ctx.restore();
}

function ball(ctx, x, y, r) {
  const g = ctx.createRadialGradient(x - r * 0.35, y + r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, "#fef9c3"); g.addColorStop(0.6, "#facc15"); g.addColorStop(1, "#ca8a04");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "rgba(161,98,7,.8)"; ctx.lineWidth = 0.2; ctx.stroke();
}

function nectar(ctx, x, y, r, color) {
  const red = color === "red";
  const g = ctx.createRadialGradient(x - r * 0.35, y + r * 0.35, r * 0.1, x, y, r);
  g.addColorStop(0, red ? "#fecaca" : "#bfdbfe"); g.addColorStop(0.55, red ? "#ef4444" : "#3b82f6"); g.addColorStop(1, red ? "#991b1b" : "#1e3a8a");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
}

function drawFlower(ctx, f, stock, scored, open) {
  const R = flowerRect(f);
  ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.strokeStyle = "#16a34a"; ctx.lineWidth = 0.5;
  ctx.fillRect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0); ctx.strokeRect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0);
  // верхнее кольцо с отверстием 4 дюйма
  const cx = (R.x0 + R.x1) / 2, cy = (R.y0 + R.y1) / 2;
  ctx.beginPath(); ctx.arc(cx, cy, 3.1, 0, Math.PI * 2); ctx.fillStyle = open ? "#bbf7d0" : "#dcfce7"; ctx.fill(); ctx.strokeStyle = "#15803d"; ctx.lineWidth = 0.6; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fillStyle = "#14532d"; ctx.fill();
  stock.forEach((_, k) => ball(ctx, cx - 1.6 + (k % 2) * 3.2, cy - 1.6 + Math.floor(k / 2) * 3.2, 1.05));
  scored.slice(-3).forEach((e, k) => (e === "pollen" ? ball(ctx, cx - 2 + k * 2, cy, 0.9) : nectar(ctx, cx - 2 + k * 2, cy, 1.1, e)));
  const lx = f.wall === "red" ? R.x1 + 3 : f.wall === "blue" ? R.x0 - 3 : cx, ly = f.wall === "back" ? R.y0 - 3 : f.wall === "aud" ? R.y1 + 3 : cy;
  text(ctx, "F" + f.id + (scored.length ? ` ${scored.length}` : ""), lx, ly, 2.6, "#15803d", "bold");
}

function drawHiveStructure(ctx, c) {
  // ноги A-образной рамы (вид сверху: от опор к верхним углам у оси поворота) и перекладина
  ctx.strokeStyle = "#475569"; ctx.lineWidth = 1.3; ctx.lineCap = "round";
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * FRAME.halfX, sy * FRAME.halfY); ctx.lineTo(sx * 12.3, 0); ctx.stroke(); }
  ctx.fillStyle = "#334155";
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) ctx.fillRect(sx * FRAME.halfX - 1, sy * FRAME.halfY - 1, 2, 2);
  // ульи
  for (const a of ["red", "blue"]) {
    const H = HIVES[a], A = ALLIANCES[a], cell = c.cells[a], up = cell.upSide;
    for (const side of ["aud", "back"]) {
      const isUp = side === up, sy = side === "aud" ? -1 : 1, yr = isUp ? CELL.upY : CELL.downY;
      const y0 = sy > 0 ? yr[0] : -yr[1], y1 = sy > 0 ? yr[1] : -yr[0];
      ctx.globalAlpha = isUp ? 0.82 : 0.45;
      ctx.fillStyle = A.color; rr(ctx, H.x0, y0, H.x1 - H.x0, y1 - y0, 1.2); ctx.fill();
      ctx.globalAlpha = 1;
      if (isUp) {
        ctx.fillStyle = "rgba(255,255,255,.72)"; rr(ctx, H.x0 + 1.6, y0 + 1.6, H.x1 - H.x0 - 3.2, y1 - y0 - 3.2, 0.8); ctx.fill();
        cell.up.forEach((e, k) => {
          const x = H.x0 + 3.5 + (k % 5) * 3.6, y = (sy > 0 ? y0 + 4 : y1 - 4) + sy * Math.floor(k / 5) * 3.6;
          if (e === "pollen") ball(ctx, x, y, POLLEN_R); else nectar(ctx, x, y, NECTAR_R * 0.9, e);
        });
        text(ctx, `▲ ${cell.up.length}/${TIP_AT}`, (H.x0 + H.x1) / 2, sy > 0 ? y1 - 3.2 : y0 + 3.2, 2.6, A.color, "bold");
      }
    }
  }
  ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(-12.3, 0); ctx.lineTo(12.3, 0); ctx.stroke();
  ctx.lineCap = "butt";
}

function rr(ctx, x, y, w, hh, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + hh, r); ctx.arcTo(x + w, y + hh, x, y + hh, r); ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

// Робот в своей системе координат: вперед +y, вправо +x (мир рисуется с y вверх)
function drawRobot(ctx, c, pose, preview) {
  const S = c.size, hs = S / 2, robot = c.robot;
  ctx.save(); ctx.translate(pose.x, pose.y); ctx.rotate(pose.h);
  // тень
  ctx.fillStyle = "rgba(0,0,0,.18)"; rr(ctx, -hs + 0.7, -hs - 0.7, S, S, 1.6); ctx.fill();
  // колеса
  const m = c.motors;
  if (robot.drive === "tank") {
    for (const [sx, role] of [[-1, "leftDrive"], [1, "rightDrive"]]) {
      const x = sx > 0 ? hs - 3.4 : -hs + 0.4;
      ctx.fillStyle = "#111827"; rr(ctx, x, -hs + 0.6, 3, S - 1.2, 0.8); ctx.fill();
      const off = m[role] ? (m[role].pos / 40) % 2 : 0;
      ctx.strokeStyle = "#4b5563"; ctx.lineWidth = 0.35;
      for (let k = -hs + 1 + off; k < hs - 1; k += 2) { ctx.beginPath(); ctx.moveTo(x + 0.3, k); ctx.lineTo(x + 2.7, k); ctx.stroke(); }
    }
  } else {
    const wheels = [["frontLeft", -1, 1], ["frontRight", 1, 1], ["backLeft", -1, -1], ["backRight", 1, -1]];
    for (const [role, sx, sy] of wheels) {
      const cx = sx * (hs - 1.9), cy = sy * (hs - 3.3);
      ctx.fillStyle = "#111827"; rr(ctx, cx - 1.6, cy - 2.6, 3.2, 5.2, 0.8); ctx.fill();
      // ролики mecanum: при виде сверху колеса образуют букву X
      const sgn = sx * sy;
      const off = m[role] ? ((m[role].pos * m[role].dir * m[role].mount) / 30) % 1.4 : 0;
      ctx.strokeStyle = "#9ca3af"; ctx.lineWidth = 0.35;
      ctx.save(); ctx.beginPath(); ctx.rect(cx - 1.6, cy - 2.6, 3.2, 5.2); ctx.clip();
      for (let k = -4; k <= 4; k += 1.4) { const yy = cy + k + off; ctx.beginPath(); ctx.moveTo(cx - 1.6, yy - 1.2 * sgn); ctx.lineTo(cx + 1.6, yy + 1.2 * sgn); ctx.stroke(); }
      ctx.restore();
    }
  }
  // рама и бамперы
  const inset = robot.drive === "tank" ? 3.6 : 3.6;
  ctx.fillStyle = "#475569"; rr(ctx, -hs + inset, -hs + 0.5, S - inset * 2, S - 1, 1); ctx.fill();
  ctx.fillStyle = BRAND; rr(ctx, -hs + inset - 0.3, -hs, S - inset * 2 + 0.6, 1.4, 0.6); ctx.fill();
  rr(ctx, -hs + inset - 0.3, hs - 1.4, S - inset * 2 + 0.6, 1.4, 0.6); ctx.fill();
  // Control Hub
  ctx.fillStyle = "#1f2937"; rr(ctx, -2.6, -hs + 2.2, 5.2, 3.4, 0.5); ctx.fill();
  ctx.fillStyle = "#f97316"; ctx.fillRect(-2.2, -hs + 2.6, 1.2, 0.5);
  // механизмы
  const has = (k) => (robot.modules || []).includes(k);
  if (has("arm")) { ctx.fillStyle = "#64748b"; ctx.fillRect(hs - inset - 3, hs - 2, 2, 7); ctx.fillStyle = "#94a3b8"; ctx.fillRect(hs - inset - 4, hs + 4, 4, 1); }
  if (has("intake")) {
    const iv = m.intake ? m.intake.vel : 0, off = m.intake ? (m.intake.pos / 25) % 1.5 : 0;
    ctx.fillStyle = "#166534"; rr(ctx, -hs + inset, hs - 0.2, S - inset * 2, 2.2, 0.6); ctx.fill();
    ctx.strokeStyle = Math.abs(iv) > 0.3 ? "#86efac" : "#22c55e"; ctx.lineWidth = 0.35;
    for (let k = -hs + inset + off; k < hs - inset; k += 1.5) { ctx.beginPath(); ctx.moveTo(k, hs); ctx.lineTo(k + 0.7, hs + 1.8); ctx.stroke(); }
  }
  // накопитель с пыльцой
  if (has("intake") || has("launcher")) {
    for (let k = 0; k < CAPACITY; k++) {
      const x = -3.6 + k * 2.4, y = hs - 4.2;
      const e = c.held[k];
      if (e) (e.kind === "nectar" ? nectar(ctx, x, y, 1.15, e.color) : ball(ctx, x, y, 1.05)); else { ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 0.2; ctx.beginPath(); ctx.arc(x, y, 1.05, 0, Math.PI * 2); ctx.stroke(); }
    }
  }
  if (has("launcher")) {
    const L = m.launcher, ang = L ? L.pos / 60 : 0;
    ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.arc(0, 1, 3.1, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = L && L.vel > 0.8 ? "#4ade80" : "#94a3b8"; ctx.lineWidth = 0.5;
    for (let k = 0; k < 3; k++) { const a = ang + k * 2.09; ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(Math.cos(a) * 2.6, 1 + Math.sin(a) * 2.6); ctx.stroke(); }
    const g = c.servos.gate;
    ctx.fillStyle = g && g.pos > 0.5 ? "#4ade80" : "#ef4444"; ctx.fillRect(-1.2, 4.3, 2.4, 0.8 + (g ? g.pos : 0) * 0.6);
  }
  if (has("lift")) {
    const p = m.lift ? m.lift.pos / 3000 : 0;
    ctx.fillStyle = "#334155"; ctx.fillRect(-hs + inset + 0.6, -hs + 6, 2.2, 8);
    ctx.fillStyle = "#38bdf8"; ctx.fillRect(-hs + inset + 0.6, -hs + 6, 2.2, 8 * p);
  }
  if (has("claw")) {
    const p = c.servos.claw ? c.servos.claw.pos : 0.5, open = (1 - p) * 1.6;
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(hs - inset - 4.5 - open, hs - 3.2, 0.9, 3); ctx.fillRect(hs - inset - 2.6 + open, hs - 3.2, 0.9, 3);
  }
  if (has("distance")) { ctx.fillStyle = "#dc2626"; ctx.fillRect(-0.8, hs - 1.2, 1.6, 1); }
  // стрелка курса
  ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.beginPath(); ctx.moveTo(0, hs - 6.4); ctx.lineTo(-1.6, hs - 9.2); ctx.lineTo(1.6, hs - 9.2); ctx.closePath(); ctx.fill();
  ctx.restore();
}

const instances = [];
function mount() {
  for (const node of document.querySelectorAll(".ftc-embed, [class*='ftc-sim-']")) {
    if (node.dataset.mounted) continue;
    node.dataset.mounted = "1";
    const m = node.className.match(/ftc-sim-([\w-]+)/);
    const preset = m ? "ftc-" + m[1].replace(/^ftc-/, "") : "ftc-sandbox";
    const wrap = document.createElement("div");
    node.replaceWith(wrap);
    instances.push(new FtcSim(wrap, { preset }));
  }
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
window.USTEMFtc = { FtcSim, mount, instances };
