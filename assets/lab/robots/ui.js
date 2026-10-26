// Лаборатория роботов Unitree Go2 и G1 на MuJoCo. Слева задание, программа на MicroPython (API как unitree_sdk2),
// графики и справка; справа окно MuJoCo с записью запуска или ручным пультом.
// Встраивается в урок блоком <div class="robot-sim-ИМЯ"></div>, песочница /lab/robots.
import { localize, trPreset, trCode, tr, onReady } from "../i18n/index.js";
import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { View } from "./view.js";
import { ROBOTS } from "./models.js";
import { explainError } from "./vm.js";

const SCRIPT_SRC = (document.currentScript && document.currentScript.src) || "/static/js/robotsim.js";
const WORKER_URL = SCRIPT_SRC.replace(/robotsim\.js/, "robotworker.js");
const STATIC = new URL("/static/", location.href).href;
const MP_BASE = STATIC + "spikesim/";
const TIMEOUT = 60000;

const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v; else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else if (v !== false && v != null) e.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(k));
  return e;
};
const fmt = (x, d = 2) => Number(x).toLocaleString("ru-RU", { minimumFractionDigits: d, maximumFractionDigits: d });
const deg = (r) => Math.round((r * 180) / Math.PI);
const download = (name, text) => {
  const a = h("a", { href: URL.createObjectURL(new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" })), download: name });
  document.body.append(a); a.click(); a.remove();
};

// суставы G1 на пульте
const G1_SLIDERS = ["WaistYaw", "LeftShoulderPitch", "LeftShoulderRoll", "LeftElbow", "RightShoulderPitch", "RightShoulderRoll", "RightElbow", "LeftWristRoll", "RightWristRoll"];

class RobotLab {
  constructor(root, { preset }) {
    this.root = root; this.presetName = preset; this.storageKey = "robotlab:" + preset;
    this.res = null; this.idx = 0; this.playing = false; this.speed = 1; this.solvedSent = false; this.liveOn = false; this.keys = new Set();
    this.load();
  }

  async load() {
    this.root.className = "rl"; this.root.innerHTML = "";
    this.root.append(h("div", { class: "rl-loading" }, "Загрузка симулятора..."));
    let pd;
    try { pd = await (await fetch(`${STATIC}robots/presets/${this.presetName}.json`, { cache: "no-cache" })).json(); trPreset(pd); } catch (e) { pd = null; }
    if (!pd) { this.root.innerHTML = ""; this.root.append(h("div", { class: "rl-loading" }, "Задание не найдено: " + this.presetName)); return; }
    this.pd = pd; this.R = ROBOTS[pd.robot];
    this.build();
    this.startWorker();
  }

  // ─────────────── Разметка ───────────────
  build() {
    const r = this.root, pd = this.pd, R = this.R;
    r.innerHTML = ""; r.classList.add("rl-" + R.id);
    this.tabs = {};
    const tab = (id, title) => { const b = h("button", { type: "button", class: "rl-tab", role: "tab", onclick: () => this.showTab(id) }, title); this.tabs[id] = b; return b; };
    this.runBtn = h("button", { type: "button", class: "rl-run", title: "Запустить (F5)", onclick: () => this.run() }, h("span", { class: "rl-ico-run" }), "Запустить");
    this.stopBtn = h("button", { type: "button", class: "rl-btn", disabled: true, onclick: () => this.stop() }, "Стоп");
    this.status = h("span", { class: "rl-status" }, "Загрузка...");
    const head = h("header", { class: "rl-head" },
      h("b", { class: "rl-robot" }, R.title), h("span", { class: "rl-title" }, pd.title || ""),
      h("span", { class: "rl-grow" }), this.status, this.runBtn, this.stopBtn,
      h("button", { type: "button", class: "rl-tool", title: "Вернуть стартовую программу задания", onclick: () => this.resetCode() }, "Сброс"),
      h("button", { type: "button", class: "rl-tool", title: "Во весь экран", "aria-label": "Во весь экран", onclick: () => { this.root.classList.toggle("rl-full"); } }, "⛶"));

    // левая колонка
    this.checksEl = h("ul", { class: "rl-checks" });
    this.doneEl = h("div", { class: "rl-done", hidden: true }, "Задание выполнено");
    const facts = [
      ["Робот", R.title],
      ["Режим", pd.mode === "sport" ? "спортивный (SportClient)" : "низкий уровень (LowCmd)"],
      ["Старт", { lie: "лежит", stand: "стоит", home: "стоит" }[pd.start?.pose] || "стоит"],
      ["Время задания", fmt(pd.limit || 10, 0) + " с"],
    ];
    if (pd.hang) facts.push(["Подвес", "страховочный трос держит корпус"]);
    if (pd.pushes?.length) facts.push(["Толчки", pd.pushes.map((p) => `${fmt(p.t, 1)} с`).join(", ")]);
    const taskPane = h("div", { class: "rl-pane rl-taskpane" },
      h("h3", {}, pd.title || "Песочница"),
      h("div", { class: "rl-task" }, (pd.task || "").split("\n\n").map((p) => h("p", {}, p))),
      h("dl", { class: "rl-facts" }, facts.map(([k, v]) => [h("dt", {}, k), h("dd", {}, v)])),
      pd.checks?.length ? h("h4", {}, "Проверки") : null, this.checksEl, this.doneEl,
      pd.hint ? h("details", { class: "rl-hint" }, h("summary", {}, "Подсказка"), h("p", {}, pd.hint)) : null);

    this.editorHost = h("div", { class: "rl-editor" });
    this.shell = h("div", { class: "rl-shell-b", role: "log" });
    const codePane = h("div", { class: "rl-pane rl-codepane" },
      h("div", { class: "rl-codebar" }, h("span", { class: "rl-file" }, "main.py"), h("span", { class: "rl-grow" }), h("span", { class: "rl-muted" }, "F5 или Ctrl+Enter - запуск")),
      this.editorHost,
      h("div", { class: "rl-shell" }, h("div", { class: "rl-shell-h" }, "Консоль"), this.shell));

    this.plotSel = h("select", { class: "rl-select", onchange: () => this.drawPlot() });
    const opts = [["z", "Высота корпуса, м"], ["rp", "Крен и тангаж, °"], ["vx", "Скорость вперед, м/с"], ["xy", "Путь сверху (x, y), м"]];
    R.labels.forEach((l, i) => opts.push(["q" + i, `${i}  ${l}: угол и цель, рад`]));
    R.labels.forEach((l, i) => opts.push(["t" + i, `${i}  ${l}: момент, Н·м`]));
    for (const [v, t] of opts) this.plotSel.append(h("option", { value: v }, t));
    this.plot = h("canvas", { class: "rl-plot" });
    const plotPane = h("div", { class: "rl-pane rl-plotpane" },
      h("div", { class: "rl-plotbar" }, this.plotSel, h("span", { class: "rl-grow" }), h("button", { type: "button", class: "rl-btn", onclick: () => this.exportCsv() }, "Скачать CSV")),
      this.plot, h("p", { class: "rl-muted" }, "График строится по последнему запуску. Вертикальная линия - текущий кадр записи."));

    const helpPane = h("div", { class: "rl-pane rl-helppane" }, this.helpContent());

    this.panes = { task: taskPane, code: codePane, plot: plotPane, help: helpPane };
    const left = h("section", { class: "rl-left" },
      h("nav", { class: "rl-tabs", role: "tablist" }, tab("task", "Задание"), tab("code", "Программа"), tab("plot", "Графики"), tab("help", "Справка")),
      taskPane, codePane, plotPane, helpPane);

    // окно MuJoCo
    this.viewHost = h("div", { class: "rl-view" });
    this.info = h("pre", { class: "rl-info" });
    this.segRec = h("button", { type: "button", class: "rl-seg on", onclick: () => this.setLive(false) }, "Запись");
    this.segLive = h("button", { type: "button", class: "rl-seg", onclick: () => this.setLive(true) }, "Пульт");
    const toggle = (label, on, fn) => { const b = h("button", { type: "button", class: "rl-vbtn" + (on ? " on" : ""), "aria-pressed": on ? "true" : "false" }, label); b.onclick = () => { const v = !b.classList.contains("on"); b.classList.toggle("on", v); b.setAttribute("aria-pressed", v); fn(v); }; return b; };
    const vbar = h("div", { class: "rl-vbar" },
      h("div", { class: "rl-segs" }, this.segRec, this.segLive),
      h("span", { class: "rl-grow" }),
      toggle("Следить", true, (v) => { this.view.follow = v; }),
      toggle("Траектория", true, (v) => { this.view.trailOn = v; this.view.setTrail(this.res?.rows, this.idx); }),
      toggle("Столкновения", false, (v) => this.view.setCollision(v)),
      h("button", { type: "button", class: "rl-vbtn", onclick: () => this.view.resetCamera() }, "Вид"));
    this.playBtn = h("button", { type: "button", class: "rl-play", "aria-label": "Воспроизвести", onclick: () => this.togglePlay() }, "▶");
    this.scrub = h("input", { type: "range", class: "rl-scrub", min: 0, max: 0, value: 0, step: 1, "aria-label": "Время записи", oninput: () => { this.playing = false; this.playBtn.textContent = "▶"; this.seek(+this.scrub.value); } });
    this.timeEl = h("span", { class: "rl-time" }, "0,00 с");
    this.speedSel = h("select", { class: "rl-speed", "aria-label": "Скорость", onchange: () => { this.speed = +this.speedSel.value; } },
      [["0.25", "0,25×"], ["0.5", "0,5×"], ["1", "1×"], ["2", "2×"]].map(([v, t]) => h("option", { value: v, selected: v === "1" }, t)));
    this.timeline = h("div", { class: "rl-timeline" }, this.playBtn, this.scrub, this.timeEl, this.speedSel);
    this.pult = h("div", { class: "rl-pult", hidden: true });
    const right = h("section", { class: "rl-right" }, vbar, h("div", { class: "rl-viewwrap" }, this.viewHost, this.info), this.timeline, this.pult);

    r.append(head, h("div", { class: "rl-body" }, left, right));
    this.view = new View(this.viewHost);

    let saved = null;
    try { saved = localStorage.getItem(this.storageKey); } catch (e) { /* нет */ }
    this.editor = new EditorView({
      doc: saved || pd.python || "from unitree import *\n",
      extensions: [basicSetup, python(), keymap.of([indentWithTab, { key: "F5", run: () => { this.run(); return true; } }, { key: "Mod-Enter", run: () => { this.run(); return true; } }]),
        EditorView.updateListener.of((u) => { if (u.docChanged) { try { localStorage.setItem(this.storageKey, u.state.doc.toString()); } catch (e) { /* нет */ } } })],
      parent: this.editorHost,
    });
    this.renderChecks(null);
    this.showTab(pd.tab || "task");
    this.keyDown = (e) => this.onKey(e, true); this.keyUp = (e) => this.onKey(e, false);
    window.addEventListener("keydown", this.keyDown); window.addEventListener("keyup", this.keyUp);
    new ResizeObserver(() => this.drawPlot()).observe(this.plot);
  }

  helpContent() {
    const R = this.R, go2 = R.id === "go2";
    const rows = R.labels.map((l, i) => h("tr", {}, h("td", {}, String(i)), h("td", {}, h("code", {}, l)), h("td", {}, R.motors[i].replace(/_joint$/, ""))));
    const code = (s) => h("pre", { class: "rl-pre" }, s);
    return [
      h("h3", {}, "Модуль unitree"),
      h("p", {}, "Программа повторяет структуры unitree_sdk2: команда LowCmd с полями q, dq, kp, kd, tau для каждого мотора и состояние LowState. Мотор сам считает момент 500 раз в секунду:"),
      code("tau = kp * (q - q_изм) + kd * (dq - dq_изм) + tau"),
      h("p", {}, "Время виртуальное: robot.sleep(с) двигает симуляцию. Команда держится, пока не придет новая. Программа может закончиться раньше задания: робот держит последнюю команду."),
      code(`from unitree import *

robot = Robot()
cmd = LowCmd()
st = robot.read()              # LowState
q = st.motor_state[0].q        # угол мотора 0, рад
roll, pitch, yaw = st.imu_state.rpy
gx, gy, gz = st.imu_state.gyroscope
${go2 ? "ff = st.foot_force         # сила на стопах FR, FL, RR, RL, Н\n" : "ff = st.foot_force         # сила на левой и правой стопе, Н\n"}
m = cmd.motor_cmd[0]
m.q = 0.5; m.dq = 0.0; m.kp = ${go2 ? "60" : "60"}; m.kd = ${go2 ? "5" : "1"}; m.tau = 0.0
robot.write(cmd)
robot.sleep(0.02)              # 20 мс
t = robot.time()`),
      go2 ? h("h4", {}, "Спортивный режим (SportClient)") : null,
      go2 ? h("p", {}, "В заданиях со спортивным режимом робот ходит сам, как с пультом: команды задают скорость, суставами управляет встроенный контроллер рыси. LowCmd в этом режиме не принимается.") : null,
      go2 ? code(`sport = SportClient()
sport.StandUp()          # встать
sport.Move(0.4, 0, 0)    # vx м/с, vy м/с, vyaw рад/с
robot.sleep(2)
sport.StopMove()
sport.StandDown()        # лечь
sport.Damp()             # отпустить моторы`) : null,
      h("h4", {}, `Моторы ${R.title} (порядок unitree_sdk2)`),
      h("p", { class: "rl-muted" }, "Константы с этими именами доступны в программе: " + (go2 ? "FR_0 = 0, FR_1 = 1 ... RL_2 = 11." : "LeftHipPitch = 0 ... RightWristYaw = 28.")),
      h("table", { class: "rl-table" }, h("thead", {}, h("tr", {}, h("th", {}, "№"), h("th", {}, "Имя"), h("th", {}, "Сустав в модели"))), h("tbody", {}, rows)),
      h("h4", {}, "Пульт"),
      h("p", {}, go2 ? "Кнопка «Пульт» над окном запускает робота в реальном времени. W и S - вперед и назад, A и D - поворот, Q и E - шаг вбок, пробел - стоп." : "Кнопка «Пульт» над окном запускает робота в реальном времени: ползунки двигают руки и корпус, галочка «Подвес» включает страховочный трос."),
      h("h4", {}, "Модель"),
      h("p", { class: "rl-muted" }, `Физика MuJoCo 3 (WebAssembly), шаг 2 мс. Модель ${R.title} из MuJoCo Menagerie (Google DeepMind), лицензия BSD-3-Clause, Unitree Robotics; сетки упрощены для браузера.`),
    ];
  }

  showTab(id) {
    for (const [k, b] of Object.entries(this.tabs)) { b.classList.toggle("on", k === id); b.setAttribute("aria-selected", k === id ? "true" : "false"); this.panes[k].hidden = k !== id; }
    if (id === "plot") requestAnimationFrame(() => this.drawPlot());
    if (id === "code") requestAnimationFrame(() => this.editor.requestMeasure());
  }

  resetCode() {
    if (!confirm("Вернуть стартовую программу задания? Ваша программа будет удалена.")) return;
    this.editor.dispatch({ changes: { from: 0, to: this.editor.state.doc.length, insert: this.pd.python || "" } });
  }

  // ─────────────── Воркер ───────────────
  baseMsg() { return { preset: this.pd, packUrl: STATIC + "robots/" + this.R.pack, base: STATIC, mjsUrl: MP_BASE + "micropython.mjs", wasmUrl: MP_BASE + "micropython.wasm" }; }
  startWorker() {
    if (this.worker) this.worker.terminate();
    this.worker = new Worker(WORKER_URL, { type: "module" });
    this.worker.onmessage = (e) => this.onMsg(e.data);
    this.worker.onerror = (e) => this.fail("Симулятор не запустился: " + (e.message || "ошибка воркера"));
    this.setStatus("Загрузка MuJoCo...");
    this.worker.postMessage({ type: "init", ...this.baseMsg() });
  }
  onMsg(m) {
    if (m.type === "ready") {
      this.view.build(m.visuals, this.R.camera);
      this.view.pose(m.first); this.view.resetCamera();
      this.ready = true; this.setStatus("Готов");
      this.info.textContent = "Нажмите «Запустить» или включите «Пульт»";
    } else if (m.type === "done") {
      clearTimeout(this.killT);
      this.busy(false);
      this.res = m;
      this.shellOut(m);
      this.renderChecks(m.checks);
      this.scrub.max = Math.max(0, m.rows.length - 1);
      this.seek(0); this.playing = true; this.playBtn.textContent = "❚❚"; this.tick();
      this.drawPlot();
      this.setStatus(m.error ? "Ошибка" : "Готово за " + fmt(m.info.t, 1) + " с симуляции");
    } else if (m.type === "frame") {
      this.view.pose(m.frame);
      this.liveRow = m.row;
      this.showInfo(m.row);
    } else if (m.type === "note") {
      this.shellLine(m.text, "warn");
    } else if (m.type === "fail") {
      clearTimeout(this.killT); this.busy(false);
      this.fail(m.error);
    }
  }
  fail(text) { this.busy(false); this.setStatus("Ошибка"); this.shellLine(text, "err"); }
  setStatus(t) { this.status.textContent = t; }
  busy(on) { this.runBtn.disabled = on; this.stopBtn.disabled = !on; this.root.classList.toggle("rl-busy", on); }

  run() {
    if (!this.ready) return;
    this.setLive(false);
    this.busy(true); this.setStatus("Считаю...");
    this.shell.innerHTML = ""; this.shellLine(">>> %Run main.py", "muted");
    this.renderChecks(null, true);
    this.killT = setTimeout(() => { this.startWorker(); this.fail("Программа зависла: в цикле нет robot.sleep(). Время симуляции идет только в sleep()."); }, TIMEOUT);
    this.worker.postMessage({ type: "run", code: this.editor.state.doc.toString(), ...this.baseMsg() });
  }
  stop() { clearTimeout(this.killT); this.startWorker(); this.busy(false); this.shellLine("Остановлено", "muted"); }

  shellLine(text, cls = "") { this.shell.append(h("div", { class: "rl-l " + (cls ? "rl-l-" + cls : "") }, text)); this.shell.scrollTop = this.shell.scrollHeight; }
  shellOut(m) {
    for (const p of m.prints.slice(0, 300)) this.shellLine(`[${fmt(p.t, 2)}] ${p.text}`);
    if (m.prints.length > 300) this.shellLine(`... еще ${m.prints.length - 300} строк`, "muted");
    if (m.error) {
      const ex = explainError(m.error);
      this.shellLine(ex.text.trim().split("\n").slice(-3).join("\n"), "err");
      if (ex.hint) this.shellLine(ex.hint, "warn");
      if (ex.line) this.markLine(ex.line);
    }
    const i = m.info;
    this.shellLine(i.fellAt != null ? `Робот упал на ${fmt(i.fellAt, 1)} с` : `Робот не упал, наклон до ${deg(i.maxTilt)}°`, i.fellAt != null ? "warn" : "muted");
  }
  markLine(n) {
    const doc = this.editor.state.doc; if (n < 1 || n > doc.lines) return;
    const l = doc.line(n); this.editor.dispatch({ selection: { anchor: l.from, head: l.to }, scrollIntoView: true });
  }

  renderChecks(list, pending = false) {
    const pd = this.pd; this.checksEl.innerHTML = "";
    (pd.checks || []).forEach((c, i) => {
      const r = list && list[i];
      this.checksEl.append(h("li", { class: r ? (r.ok ? "ok" : "bad") : pending ? "wait" : "" }, c.text, r && r.value ? h("em", {}, r.value) : null));
    });
    const all = list && list.length && list.every((c) => c.ok);
    this.doneEl.hidden = !all;
    if (all && !this.solvedSent) { this.solvedSent = true; if (window.academySolved) window.academySolved(this.presetName); }
  }

  // ─────────────── Проигрывание ───────────────
  seek(i) {
    const m = this.res; if (!m) return;
    i = Math.max(0, Math.min(m.rows.length - 1, Math.round(i)));
    this.idx = i; this.scrub.value = i;
    this.view.pose(m.frames, i * m.stride);
    const row = m.rows[i];
    this.timeEl.textContent = fmt(row.t, 2) + " с";
    this.showInfo(row);
    const push = (this.pd.pushes || []).find((p) => row.t >= p.t && row.t < p.t + (p.dur || 0.1));
    this.view.push(push ? push.f : null);
    if (i % 5 === 0 || !this.playing) this.view.setTrail(m.rows, i);
    if (!this.playing || i % 10 === 0) this.drawCursor();
  }
  togglePlay() {
    if (!this.res) return;
    if (this.idx >= this.res.rows.length - 1) this.seek(0);
    this.playing = !this.playing; this.playBtn.textContent = this.playing ? "❚❚" : "▶";
    if (this.playing) this.tick();
  }
  tick() {
    let last = performance.now(), acc = this.idx;
    const step = (now) => {
      if (!this.playing || !this.res || this.liveOn) return;
      acc += ((now - last) / 1000) * this.res.fps * this.speed; last = now;
      if (acc >= this.res.rows.length - 1) { this.seek(this.res.rows.length - 1); this.playing = false; this.playBtn.textContent = "▶"; this.drawPlot(); return; }
      if (Math.floor(acc) !== this.idx) this.seek(acc);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  showInfo(r) {
    const lines = [
      `Время      ${fmt(r.t, 2)} с`,
      `Высота     ${fmt(r.z, 3)} м`,
      `Крен       ${deg(r.roll)}°   Тангаж ${deg(r.pitch)}°`,
      `Курс       ${deg(r.yaw)}°`,
      `Скорость   ${fmt(r.vx, 2)} м/с`,
      `Положение  ${fmt(r.x, 2)}; ${fmt(r.y, 2)} м`,
    ];
    if (r.fell) lines.push("УПАЛ");
    this.info.textContent = lines.join("\n");
  }

  // ─────────────── Пульт ───────────────
  setLive(on) {
    if (on === this.liveOn) return;
    if (on && !this.ready) return;
    this.liveOn = on; this.playing = false; this.playBtn.textContent = "▶";
    this.segLive.classList.toggle("on", on); this.segRec.classList.toggle("on", !on);
    this.timeline.hidden = on; this.pult.hidden = !on;
    this.view.clearTrail(); this.view.push(null);
    if (on) { this.buildPult(); this.startLive(); }
    else { this.worker && this.worker.postMessage({ type: "live", on: false }); if (this.res) this.seek(this.idx); }
  }
  livePreset() {
    const pd = this.pd;
    if (this.R.id === "go2") return { ...pd, mode: "sport", pushes: [], start: { ...(pd.start || {}), pose: "lie" } };
    return { ...pd, hold: true, hang: this.hang ?? true, pushes: [] };
  }
  startLive() { this.worker.postMessage({ type: "live", on: true, ...this.baseMsg(), preset: this.livePreset() }); }
  buildPult() {
    const p = this.pult; p.innerHTML = "";
    const send = (m) => this.worker.postMessage(m);
    const btn = (t, fn, title) => h("button", { type: "button", class: "rl-btn", title, onclick: fn }, t);
    const pushBtn = btn("Толкнуть", () => { const a = Math.random() * Math.PI * 2; send({ type: "push", f: [Math.cos(a) * 60, Math.sin(a) * 60, 0] }); }, "Толчок 60 Н в случайную сторону");
    if (this.R.id === "go2") {
      this.speedOut = h("span", { class: "rl-pult-v" }, "vx 0,0 · vy 0,0 · поворот 0,0");
      p.append(h("div", { class: "rl-pult-row" },
        btn("Встать", () => send({ type: "sport", name: "StandUp" })), btn("Лечь", () => send({ type: "sport", name: "StandDown" })),
        btn("Отпустить моторы", () => send({ type: "sport", name: "Damp" })), pushBtn, btn("Заново", () => send({ type: "reset" })),
        h("span", { class: "rl-grow" }), this.speedOut),
        h("p", { class: "rl-muted" }, "Щелкните по окну и управляйте с клавиатуры: W / S - вперед и назад, A / D - поворот, Q / E - шаг вбок, пробел - стоп. Сначала нажмите «Встать»."));
    } else {
      const hang = h("input", { type: "checkbox", checked: this.hang ?? true });
      hang.onchange = () => { this.hang = hang.checked; this.startLive(); };
      const sliders = h("div", { class: "rl-sliders" });
      for (const name of G1_SLIDERS) {
        const i = this.R.labels.indexOf(name);
        const val = h("output", {}, "0°");
        const s = h("input", { type: "range", min: -1.6, max: 1.6, step: 0.01, value: this.R.poses.stand[i] });
        s.oninput = () => { val.textContent = deg(+s.value) + "°"; send({ type: "joints", q: { [i]: +s.value } }); };
        val.textContent = deg(+s.value) + "°";
        sliders.append(h("label", { class: "rl-slider" }, h("span", {}, `${i} ${name}`), s, val));
      }
      p.append(h("div", { class: "rl-pult-row" }, h("label", { class: "rl-check" }, hang, " Подвес"), pushBtn, btn("Заново", () => send({ type: "reset" }))),
        sliders, h("p", { class: "rl-muted" }, "Ноги держат стойку с усилениями из примера Unitree. Без подвеса и без баланса по IMU робот падает: это и есть первое задание курса."));
    }
  }
  onKey(e, down) {
    if (!this.liveOn || this.R.id !== "go2") return;
    if (e.target && (e.target.closest(".cm-editor") || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName))) return;
    const k = e.key.toLowerCase();
    const map = { w: 1, ц: 1, s: 1, ы: 1, a: 1, ф: 1, d: 1, в: 1, q: 1, й: 1, e: 1, у: 1, " ": 1, arrowup: 1, arrowdown: 1, arrowleft: 1, arrowright: 1 };
    if (!map[k]) return;
    e.preventDefault();
    if (k === " ") { this.keys.clear(); } else if (down) this.keys.add(k); else this.keys.delete(k);
    const has = (...ks) => ks.some((x) => this.keys.has(x));
    const vx = (has("w", "ц", "arrowup") ? 0.6 : 0) - (has("s", "ы", "arrowdown") ? 0.4 : 0);
    const wz = (has("a", "ф", "arrowleft") ? 1.2 : 0) - (has("d", "в", "arrowright") ? 1.2 : 0);
    const vy = (has("q", "й") ? 0.3 : 0) - (has("e", "у") ? 0.3 : 0);
    if (this.speedOut) this.speedOut.textContent = `vx ${fmt(vx, 1)} · vy ${fmt(vy, 1)} · поворот ${fmt(wz, 1)}`;
    this.worker.postMessage({ type: "sport", name: vx || vy || wz ? "Move" : "StopMove", args: [vx, vy, wz] });
  }

  // ─────────────── Графики ───────────────
  series() {
    const m = this.res; if (!m) return null;
    const v = this.plotSel.value, rows = m.rows, t = rows.map((r) => r.t);
    if (v === "z") return { t, lines: [{ name: "z", y: rows.map((r) => r.z), c: "#1f6feb" }], unit: "м" };
    if (v === "rp") return { t, lines: [{ name: "крен", y: rows.map((r) => deg(r.roll)), c: "#1f6feb" }, { name: "тангаж", y: rows.map((r) => deg(r.pitch)), c: "#d9480f" }], unit: "°" };
    if (v === "vx") return { t, lines: [{ name: "vx", y: rows.map((r) => r.vx), c: "#1f6feb" }], unit: "м/с" };
    if (v === "xy") return { xy: true, t: rows.map((r) => r.x), lines: [{ name: "путь", y: rows.map((r) => r.y), c: "#1f6feb" }], unit: "м" };
    const i = +v.slice(1);
    if (v[0] === "q") return { t, lines: [{ name: "угол", y: rows.map((r) => r.q[i]), c: "#1f6feb" }, { name: "цель", y: rows.map((r) => r.qd[i]), c: "#868e96", dash: true }], unit: "рад" };
    return { t, lines: [{ name: "момент", y: rows.map((r) => r.tau[i]), c: "#2b8a3e" }], unit: "Н·м" };
  }
  drawPlot() {
    const cv = this.plot; if (!cv || cv.offsetParent === null) return;
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const s = this.series();
    g.font = "12px system-ui, sans-serif"; g.fillStyle = "#5f6b7a";
    if (!s) { g.fillText("Запустите программу, чтобы увидеть график", 12, 24); return; }
    const L = 52, Rm = 12, T = 22, B = 28, pw = W - L - Rm, ph = H - T - B;
    let x0 = Math.min(...s.t), x1 = Math.max(...s.t);
    const ys = s.lines.flatMap((l) => l.y);
    let y0 = Math.min(...ys), y1 = Math.max(...ys);
    if (y1 - y0 < 1e-6) { y0 -= 0.5; y1 += 0.5; }
    const pad = (y1 - y0) * 0.08; y0 -= pad; y1 += pad;
    if (s.xy) { const span = Math.max(x1 - x0, y1 - y0); x1 = x0 + span; y1 = y0 + span * (ph / pw); }
    if (x1 - x0 < 1e-6) x1 = x0 + 1;
    const X = (x) => L + ((x - x0) / (x1 - x0)) * pw, Y = (y) => T + ph - ((y - y0) / (y1 - y0)) * ph;
    g.strokeStyle = "#e3e7ec"; g.lineWidth = 1;
    for (let k = 0; k <= 4; k++) {
      const yy = T + (ph * k) / 4; g.beginPath(); g.moveTo(L, yy); g.lineTo(L + pw, yy); g.stroke();
      g.fillText(fmt(y1 - ((y1 - y0) * k) / 4, Math.abs(y1 - y0) < 2 ? 2 : 1), 4, yy + 4);
    }
    for (let k = 0; k <= 5; k++) { const xx = L + (pw * k) / 5; g.fillText(fmt(x0 + ((x1 - x0) * k) / 5, 1), xx - 10, H - 8); }
    g.fillText(s.xy ? "x, м  →     y, м  ↑" : `t, с     ${s.unit}`, L, 14);
    for (const l of s.lines) {
      g.strokeStyle = l.c; g.lineWidth = 1.6; g.setLineDash(l.dash ? [5, 4] : []);
      g.beginPath(); l.y.forEach((y, k) => { const px = X(s.t[k]), py = Y(y); if (k) g.lineTo(px, py); else g.moveTo(px, py); }); g.stroke();
    }
    g.setLineDash([]);
    let lx = L + pw;
    for (const l of [...s.lines].reverse()) { const w = g.measureText(l.name).width; lx -= w + 22; g.fillStyle = l.c; g.fillRect(lx, 7, 12, 3); g.fillStyle = "#1f2933"; g.fillText(l.name, lx + 15, 13); }
    this.plotGeom = { X, Y, s, T, ph };
    this.drawCursor(true);
  }
  drawCursor(fresh) {
    if (!this.plotGeom || !this.res || this.plot.offsetParent === null) return;
    if (!fresh) { this.drawPlot(); return; }
    const { X, s, T, ph } = this.plotGeom, g = this.plot.getContext("2d");
    const xv = s.xy ? null : s.t[this.idx];
    if (xv == null) return;
    g.strokeStyle = "#c92a2a"; g.lineWidth = 1; g.beginPath(); g.moveTo(X(xv), T); g.lineTo(X(xv), T + ph); g.stroke();
  }
  exportCsv() {
    const m = this.res; if (!m) return;
    const L = this.R.labels;
    const head = ["t", "x", "y", "z", "roll", "pitch", "yaw", "vx", ...L.map((l) => "q_" + l), ...L.map((l) => "qdes_" + l), ...L.map((l) => "tau_" + l)];
    const lines = [head.join(";")];
    for (const r of m.rows) lines.push([r.t, r.x, r.y, r.z, r.roll, r.pitch, r.yaw, r.vx, ...r.q, ...r.qd, ...r.tau].map((v) => String(+(+v).toFixed(4)).replace(".", ",")).join(";"));
    download(`${this.presetName}.csv`, lines.join("\n"));
  }
}

const instances = [];
function mount() {
  for (const node of document.querySelectorAll("[class*='robot-sim-']")) {
    if (node.dataset.mounted) continue;
    node.dataset.mounted = "1";
    const m = node.className.match(/robot-sim-([\w-]+)/);
    if (!m) continue;
    const wrap = document.createElement("div");
    node.replaceWith(wrap);
    instances.push(new RobotLab(wrap, { preset: "robot-" + m[1].replace(/^robot-/, "") }));
    localize(wrap);
  }
}
onReady(mount);
window.USTEMRobots = { RobotLab, mount, instances };
