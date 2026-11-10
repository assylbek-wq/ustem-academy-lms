// Лаборатория спутников WSO: конструктор, бортовая программа на MicroPython, полет и разбор.
// Один интерфейс для CubeSat 1U и CanSat. Встраивается в урок блоками <div class="cubesat-sim-ИМЯ"></div>
// и <div class="cansat-sim-ИМЯ"></div>, песочницы /lab/cubesat и /lab/cansat.
import { localize, trPreset, trCode, tr, onReady } from "../i18n/index.js";
import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import cubesat from "../cubesat/kind.js";
import cansat from "../cansat/kind.js";
import { explainError } from "./vm.js";
import { Scene } from "./scene.js";
import { setup as cvSetup } from "./blueprint.js";

const KINDS = { cubesat, cansat };
const SCRIPT_SRC = (document.currentScript && document.currentScript.src) || "/static/js/satsim.js";
const WORKER_URL = SCRIPT_SRC.replace(/satsim\.js/, "satworker.js");
const MP_BASE = new URL("/static/spikesim/", location.href).href;
const TIMEOUT = 25000;
// 3D-сцена и 3D-конструктор CanSat лежат отдельным файлом (three.js) и грузятся только там, где нужны
const S3D_URL = SCRIPT_SRC.replace(/satsim\.js.*$/, "sat3d.js") + "?v=" + (typeof __S3D_V__ === "string" ? __S3D_V__ : "dev");
let s3dP = null;
const load3d = () => s3dP || (s3dP = import(S3D_URL).catch(() => null));
const webglOk = () => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch (e) { return false; } };
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v; else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else if (v !== false && v != null) e.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(k));
  return e;
};
const fmt = (x, d = 0) => Number(x).toLocaleString("ru-RU", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtT = (t) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
const download = (name, text, type = "text/csv") => {
  const a = h("a", { href: URL.createObjectURL(new Blob([(type === "text/csv" ? "﻿" : "") + text], { type: type + ";charset=utf-8" })), download: name });
  document.body.append(a); a.click(); a.remove();
};
const clone = (x) => JSON.parse(JSON.stringify(x));

class SatLab {
  constructor(root, { kind, preset }) {
    this.root = root; this.K = KINDS[kind]; this.kind = kind; this.presetName = preset; this.storageKey = "satlab:" + preset;
    this.res = null; this.play = null; this.solvedSent = false; this.exported = false; this.mode = "build";
    this.scene = new Scene(kind);
    this.use3d = webglOk(); this.view3d = true; this.xray = true; this.s3d = null;
    this.build();
    this.load();
    if (this.use3d) load3d().then((m) => { this.s3d = m; if (!m) this.use3d = false; this.viewBar.hidden = !this.use3d; this.camBar.hidden = !this.use3d; if (this.config) this.drawAll(); });
  }

  // ─────────────── Разметка ───────────────
  build() {
    const r = this.root, K = this.K; r.className = "sl sl-" + this.kind; r.innerHTML = "";
    this.tabs = {};
    const tab = (id, n, title) => { const b = h("button", { type: "button", class: "sl-step", role: "tab", onclick: () => this.showTab(id) }, title); this.tabs[id] = { b }; return b; };
    this.btnReset = h("button", { type: "button", class: "sl-tool", title: "Вернуть стартовую сборку и программу задания", onclick: () => this.resetAll() }, "Сброс");
    this.titleEl = h("div", { class: "sl-title" });
    const head = h("header", { class: "sl-head" },
      h("div", { class: "sl-brand" }, h("b", { class: "sl-kind" }, K.title), this.titleEl),
      h("span", { class: "sl-grow" }), this.btnReset,
      h("button", { type: "button", class: "sl-tool", title: "Во весь экран", "aria-label": "Во весь экран", onclick: () => { this.root.classList.toggle("sl-full"); this.drawAll(); } }, "⛶"));
    const steps = h("nav", { class: "sl-steps", role: "tablist", "aria-label": "Разделы" }, tab("build", "", K.id === "cansat" ? "Конструктор" : "Конструктор"), tab("flight", "", "Программа и полет"), tab("debrief", "", "Разбор полета"), tab("help", "", "Справка"));

    // сборка
    this.modeBar = h("div", { class: "sl-seg", role: "tablist" });
    this.side = h("div", { class: "sl-side" });
    this.bp = h("canvas", { class: "sl-bp" });
    this.b3dHost = h("div", { class: "sl-b3d", hidden: true });
    const vbtn = (text, title, fn) => h("button", { type: "button", title, onclick: fn }, text);
    this.btn3d = vbtn("3D", "Объемная модель: поверните мышью или пальцем", () => { this.view3d = true; this.drawBp(); });
    this.btn2d = vbtn("Чертеж", "Чертеж с размерами", () => { this.view3d = false; this.drawBp(); });
    this.btnXray = h("button", { type: "button", class: "sl-chip", title: "Сделать корпус прозрачным и показать, что внутри", onclick: () => { this.xray = !this.xray; this.drawBp(); } }, "Разрез");
    this.btnExpl = h("button", { type: "button", class: "sl-chip", title: "Разнести платы, чтобы увидеть порядок сборки", onclick: () => { this.explode = !this.explode; this.drawBp(); } }, "Разобрать");
    this.viewBar = h("div", { class: "sl-viewbar", hidden: true }, h("div", { class: "sl-seg" }, this.btn3d, this.btn2d), this.btnXray, this.btnExpl,
      h("span", { class: "sl-grow" }), h("span", { class: "sl-viewhint" }, "Поверните модель мышью"));
    this.gauges = h("div", { class: "sl-gauges" });
    this.preflight = h("div", { class: "sl-preflight" });
    this.forecastBox = h("div", { class: "sl-forecast" });
    this.condBox = h("div", { class: "sl-conds" });
    const buildPane = h("section", { class: "sl-build" }, this.side,
      h("div", { class: "sl-desk" },
        h("div", { class: "sl-desk-top" }, this.modeBar, h("span", { class: "sl-grow" }),
          h("button", { type: "button", class: "sl-btn sl-btn-sm", title: "Таблица масс и энергии для технической документации", onclick: () => this.exportBudget() }, "Скачать бюджет CSV")),
        h("div", { class: "sl-sheet" }, this.viewBar, this.b3dHost, this.bp), this.gauges, this.forecastBox, this.preflight, this.condBox));

    // полет
    this.pyDiv = h("div", { class: "sl-python" });
    this.btnRun = h("button", { type: "button", class: "sl-launch", title: "Запустить полет (F5)", onclick: () => (this.worker ? this.stopRun() : this.run()) }, h("i", { class: "sl-ico-run" }), h("span", {}, "Запустить"));
    this.btnStop = h("button", { type: "button", class: "sl-stopbtn", title: "Остановить", onclick: () => this.stopRun() }, h("i", { class: "sl-ico-stop" }), h("span", {}, "Стоп"));
    this.speedSel = h("select", { class: "sl-select", title: "Скорость проигрывания полета", "aria-label": "Скорость проигрывания" },
      ...(this.kind === "cansat" ? [[0, "Авто"], [1, "×1"], [2, "×2"], [5, "×5"], [15, "×15"]] : [[0, "Авто"], [1, "×1"], [10, "×10"], [30, "×30"], [60, "×60"], [150, "×150"]])
        .map(([v, t], i) => h("option", { value: v, selected: i === 0 }, t)));
    this.btnSkip = h("button", { type: "button", class: "sl-btn sl-btn-sm", title: "Сразу к концу полета", onclick: () => this.skip(), disabled: true }, "В конец");
    this.sceneCv = h("canvas", { class: "sl-scene" });
    this.s3Host = h("div", { class: "sl-s3", hidden: true });
    this.hud = h("div", { class: "sl-hud" });
    this.countEl = h("div", { class: "sl-count3", hidden: true, "data-notr": true });
    this.sumBox = h("div", { class: "sl-sum", hidden: true });
    const CAMS = [["follow", "Слежение", "Камера летит рядом. Поверните мышью, колесо - ближе или дальше"], ["station", "Со станции", "Вид в объектив с наземной станции"],
      ["onboard", "С борта", this.kind === "cansat" ? "Камера на ракете, после отделения - на CanSat" : "Камера на дне спутника смотрит вниз"], ["wide", "Весь полет", "Общий вид с высотной линейкой и траекториями"]];
    this.camBtns = CAMS.map(([id, text, title], i) => h("button", { type: "button", class: i ? "" : "on", title, onclick: () => this.setCam(id) }, text));
    this.camBar = h("div", { class: "sl-cams", hidden: true }, h("div", { class: "sl-seg sl-seg-dark" }, this.camBtns),
      h("button", { type: "button", class: "sl-zoom", title: "Ближе", "aria-label": "Ближе", onclick: () => this.fs && this.fs.zoom(0.8) }, "+"),
      h("button", { type: "button", class: "sl-zoom", title: "Дальше", "aria-label": "Дальше", onclick: () => this.fs && this.fs.zoom(1.25) }, "−"));
    this.camIds = CAMS.map((c) => c[0]);
    // лента времени: пауза, перемотка, отметки событий
    this.btnPlay = h("button", { type: "button", class: "sl-tl-play", title: "Пауза или продолжить", "aria-label": "Пауза или продолжить", onclick: () => this.togglePlay() }, h("i"));
    this.btnAgain = h("button", { type: "button", class: "sl-tl-btn", title: "Показать полет сначала", "aria-label": "Показать полет сначала", onclick: () => this.replayAgain(), disabled: true }, "⟲");
    this.scrub = h("input", { type: "range", class: "sl-scrub", min: 0, max: 100, step: 0.05, value: 0, "aria-label": "Время полета", disabled: true });
    this.scrub.addEventListener("input", () => this.seek(+this.scrub.value));
    this.tlMarks = h("div", { class: "sl-tl-marks" });
    this.tlTime = h("span", { class: "sl-tl-time", "data-notr": true }, "00:00");
    this.btnRun2 = h("button", { type: "button", class: "sl-go-btn", title: "Запустить полет", onclick: () => (this.worker ? this.stopRun() : this.run()) }, h("i", { class: "sl-ico-run" }), h("span", {}, "Запустить"));
    const timeline = h("div", { class: "sl-tl" }, this.btnPlay, this.btnAgain, h("div", { class: "sl-tl-track" }, this.tlMarks, this.scrub), this.tlTime,
      h("label", { class: "sl-speed" }, h("span", {}, "Скорость"), this.speedSel), this.btnSkip, this.btnRun2);
    this.toastBox = h("div", { class: "sl-toasts", "aria-live": "polite" });
    this.gsBox = h("div", { class: "sl-console", role: "log" });
    this.chart = h("canvas", { class: "sl-chart" });
    this.seriesSel = h("select", { class: "sl-select", title: "Что показать на графике", "aria-label": "Ряд графика", onchange: () => this.drawChart(this.play ? this.play.t : undefined) });
    const flightPane = h("section", { class: "sl-flight" },
      h("div", { class: "sl-code" },
        h("div", { class: "sl-bar" }, this.btnRun, this.btnStop, h("span", { class: "sl-grow" }),
          h("button", { type: "button", class: "sl-btn sl-btn-sm", title: "Скачать main.py", onclick: () => download("main.py", this.code(), "text/x-python") }, "Скачать main.py")),
        h("div", { class: "sl-filetabs" }, h("span", {}, "main.py")),
        this.pyDiv,
        h("div", { class: "sl-shell" }, h("div", { class: "sl-shell-h" }, "Оболочка"), this.shell = h("div", { class: "sl-shell-b", role: "log" }))),
      h("div", { class: "sl-sky" },
        this.sceneWrap = h("div", { class: "sl-scenewrap" }, this.sceneCv, this.s3Host, this.hud, this.camBar, this.countEl, this.toastBox, this.sumBox), timeline,
        h("div", { class: "sl-panels" },
          h("div", { class: "sl-panel sl-panel-dark" }, h("div", { class: "sl-panel-h" }, "Наземная станция", h("span", {}, "принятые пакеты")), this.gsBox),
          h("div", { class: "sl-panel" }, h("div", { class: "sl-panel-h" }, "График", this.seriesSel), this.chart))));

    this.debriefBox = h("section", { class: "sl-debrief" });
    this.helpBox = h("section", { class: "sl-help" });
    this.tabs.build.pane = buildPane; this.tabs.flight.pane = flightPane; this.tabs.debrief.pane = this.debriefBox; this.tabs.help.pane = this.helpBox;
    this.taskBox = h("aside", { class: "sl-task" });
    r.append(head, steps, h("div", { class: "sl-body" }, this.taskBox, h("div", { class: "sl-main" }, buildPane, flightPane, this.debriefBox, this.helpBox)));

    this.py = new EditorView({ doc: "", parent: this.pyDiv,
      extensions: [basicSetup, python(), keymap.of([indentWithTab]), EditorView.updateListener.of((u) => { if (u.docChanged) this.save(); })] });
    this.renderHelp();
    new ResizeObserver(() => this.drawAll()).observe(this.root);
  }

  showTab(id) {
    for (const [k, t] of Object.entries(this.tabs)) { t.pane.hidden = k !== id; t.b.classList.toggle("on", k === id); t.b.setAttribute("aria-current", k === id ? "step" : "false"); }
    this.tab = id; this.save();
    if (id === "debrief") this.renderDebrief();
    requestAnimationFrame(() => this.drawAll());
  }

  // ─────────────── Данные ───────────────
  async load() {
    let pd = null;
    try { pd = await (await fetch(`/static/${this.kind}/presets/${this.presetName}.json`, { cache: "no-cache" })).json(); trPreset(pd); } catch (e) { pd = null; }
    this.pd = pd || { title: "Свободная сборка", checks: [], config: this.K.emptyConfig(), python: "from sat import *\n", free_flight: true };
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(this.storageKey) || "null"); } catch (e) { saved = null; }
    this.config = (saved && saved.config) || clone(this.pd.config || this.K.emptyConfig());
    this.flight = { ...(this.pd.flight || {}), ...((this.pd.free_flight && saved && saved.flight) || {}) };
    this.exported = !!(saved && saved.exported);
    const code = (saved && typeof saved.py === "string" && saved.py) || this.pd.python || "";
    this.loading = true;
    this.py.dispatch({ changes: { from: 0, to: this.py.state.doc.length, insert: code } });
    this.loading = false;
    this.res = null;
    this.mode = (saved && saved.mode) || (this.pd.tab === "rocket" ? "rocket" : "build");
    this.titleEl.textContent = this.pd.title || "";
    this.renderTask(); this.refresh();
    const tab = (saved && saved.tab) || (this.pd.tab === "rocket" ? "build" : this.pd.tab) || "build";
    this.showTab(tab);
    this.renderFlightIdle();
  }

  save() {
    if (!this.pd || this.loading) return;
    clearTimeout(this.saveT);
    this.saveT = setTimeout(() => {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify({ config: this.config, py: this.py.state.doc.toString(), tab: this.tab, mode: this.mode,
          flight: this.pd.free_flight ? this.flight : undefined, exported: this.exported }));
      } catch (e) { /* хранилище недоступно */ }
    }, 300);
  }

  resetAll() {
    if (!this.confirmReset) {
      this.confirmReset = true; this.btnReset.textContent = "Точно сбросить?";
      setTimeout(() => { this.confirmReset = false; this.btnReset.textContent = "Сброс"; }, 3000); return;
    }
    this.confirmReset = false; this.btnReset.textContent = "Сброс";
    this.stopRun(true);
    try { localStorage.removeItem(this.storageKey); } catch (e) { /* ничего */ }
    this.load();
  }

  code() { return this.py.state.doc.toString(); }

  setConfig(next, quiet) {
    this.config = next;
    if (this.play) this.stopRun(true);
    if (this.res) { this.res = null; this.renderFlightIdle(); if (!quiet) this.toast("Сборка изменилась: запустите полет заново"); }
    this.save(); this.refresh();
  }

  refresh() {
    this.ins = this.K.inspect(this.config, this.flight);
    this.renderModes(); this.renderSide(); this.renderGauges(); this.renderForecast(); this.renderPreflight(); this.renderConds(); this.drawBp(); this.evalTask();
  }

  toast(text, kind = "") {
    const el = h("div", { class: "sl-toast " + kind }, text);
    if (this.toastBox.children.length >= 3) this.toastBox.firstChild.remove();
    this.toastBox.append(el); setTimeout(() => el.remove(), 3000);
  }

  // ─────────────── Сборка ───────────────
  renderModes() {
    const modes = this.K.modes;
    this.modeBar.hidden = modes.length < 2;
    this.modeBar.replaceChildren(...modes.map((m) => h("button", { type: "button", role: "tab", "aria-selected": String(this.mode === m.id), class: this.mode === m.id ? "on" : "",
      onclick: () => { this.mode = m.id; this.save(); this.refresh(); } }, m.label)));
  }

  renderSide() {
    if (this.mode === "rocket") return this.renderRocketControls();
    const K = this.K, box = this.side; box.innerHTML = "";
    const list = this.config.items || [];
    for (const cat of K.CATEGORIES) {
      const sec = h("section", { class: "sl-cat" }, h("h5", {}, cat.title, cat.required ? h("span", { class: "sl-req", title: "Нужно для полета" }, " *") : null));
      for (const p of K.PARTS.filter((x) => x.cat === cat.id)) {
        const n = list.filter((id) => id === p.id).length;
        const meta = [p.mass ? `${fmt(p.mass, p.mass % 1 ? 1 : 0)} г` : null, p.idle ? `${p.idle} мВт` : null, p.h ? `${p.h} мм` : null, p.wh ? `${fmt(p.wh, 1)} Вт·ч` : null,
          p.gain != null ? `${p.gain > 0 ? "+" : ""}${fmt(p.gain, 1)} дБи` : null, p.freq ? `${p.freq} МГц` : null, p.maxlen ? `пакет до ${p.maxlen} Б` : null].filter(Boolean).join("  ");
        const canMore = !n || (p.max && n < p.max);
        const replaces = cat.one && !n && list.some((id) => (K.part(id) || {}).cat === cat.id);
        const card = h("div", { class: "sl-part" + (n ? " on" : "") },
          h("i", { class: "sl-swatch", style: `background:${p.color}` }),
          h("div", { class: "sl-part-b" }, h("div", { class: "sl-part-n" }, p.name, n > 1 ? h("span", { class: "sl-count" }, ` ×${n}`) : null),
            h("div", { class: "sl-part-m" }, meta), h("div", { class: "sl-part-note" }, p.note)),
          h("div", { class: "sl-part-a" },
            canMore ? h("button", { type: "button", class: "sl-add", title: replaces ? "Заменить" : "Добавить", "aria-label": (replaces ? "Заменить на " : "Добавить ") + p.name,
              onclick: () => this.setConfig(K.addPart(this.config, p.id)) }, replaces ? "⇄" : "+") : null,
            n ? h("button", { type: "button", class: "sl-del", title: "Убрать", "aria-label": "Убрать " + p.name,
              onclick: () => this.setConfig(K.removeAt(this.config, list.lastIndexOf(p.id))) }, "−") : null));
        sec.append(card);
      }
      if (cat.id === "radio") {
        const r = K.items(this.config).find((x) => x.cat === "radio");
        if (r) {
          const mode = h("select", { class: "sl-select", "aria-label": "Режим радио", onchange: (e) => this.setConfig({ ...this.config, radioMode: e.target.value }) },
            r.modes.map((m) => h("option", { value: m.id, selected: m.id === (this.config.radioMode || r.modes[0].id) }, `${m.name}, чувствительность ${m.sens} дБм`)));
          const tx = h("select", { class: "sl-select", "aria-label": "Мощность передатчика", onchange: (e) => this.setConfig({ ...this.config, txDbm: +e.target.value }) },
            K.TX_LEVELS.map((v) => h("option", { value: v, selected: v === +this.config.txDbm }, `${v} дБм (${fmt(Math.pow(10, v / 10))} мВт)`)));
          sec.append(h("div", { class: "sl-radio" }, h("label", {}, "Режим", mode), h("label", {}, "Мощность", tx)));
        }
      }
      if (cat.id === "body" && K.canChute) sec.append(this.slider({ ...K.canChute, value: this.config.canChute || 0 }, (v) => this.setConfig({ ...this.config, canChute: v }, true)));
      box.append(sec);
    }
  }

  slider(c, onInput) {
    const out = h("output", {}, `${fmt(c.value, c.step < 1 ? 1 : 0)} ${c.unit}`);
    const inp = h("input", { type: "range", min: c.min, max: c.max, step: c.step, value: c.value, "aria-label": c.label });
    let t;
    inp.addEventListener("input", () => { out.textContent = `${fmt(+inp.value, c.step < 1 ? 1 : 0)} ${c.unit}`; clearTimeout(t); t = setTimeout(() => onInput(+inp.value), 60); });
    return h("label", { class: "sl-slider" }, h("span", {}, c.label, out), inp);
  }

  renderRocketControls() {
    const K = this.K, box = this.side; box.innerHTML = "";
    const rk = K.rocketOf(this.config);
    const set = (key, v) => this.setConfig({ ...this.config, rocket: { ...rk, [key]: v } }, true);
    box.append(h("p", { class: "sl-side-note" }, "Ракета под стандартный двигатель РД1-100-7М. Меняйте размеры: центр тяжести и центр давления на чертеже двигаются сразу."));
    const groups = [["Корпус", ["d", "len", "material"]], ["Головной обтекатель", ["nose", "noseK"]], ["Стабилизаторы", ["fins", "finMat", "root", "tip", "span", "sweep"]], ["Спасение и старт", ["chute", "rail"]]];
    for (const [title, keys] of groups) {
      const sec = h("section", { class: "sl-cat" }, h("h5", {}, title));
      for (const key of keys) {
        const c = K.rocketControls.find((x) => x.key === key);
        if (c.type === "select") {
          sec.append(h("label", { class: "sl-field" }, h("span", {}, c.label), h("select", { class: "sl-select", onchange: (e) => set(key, isNaN(+e.target.value) ? e.target.value : +e.target.value) },
            c.opts.map(([v, t]) => h("option", { value: v, selected: String(v) === String(rk[key]) }, t)))));
        } else sec.append(this.slider({ ...c, value: rk[key] }, (v) => set(key, v)));
      }
      box.append(sec);
    }
  }

  renderGauges() {
    this.gauges.replaceChildren(...this.K.gauges(this.ins, this.mode).map((g) => h("div", { class: "sl-gauge " + g.cls },
      h("div", { class: "sl-gauge-t" }, g.title), h("div", { class: "sl-gauge-v" }, g.value),
      h("div", { class: "sl-meter" }, h("i", { style: `width:${Math.max(2, Math.min(100, g.share * 100)).toFixed(0)}%` })), h("div", { class: "sl-gauge-s" }, g.sub))));
  }

  renderForecast() {
    const box = this.forecastBox; box.innerHTML = "";
    if (!this.K.prediction || this.mode !== "rocket") { box.hidden = true; return; }
    box.hidden = false;
    const p = this.K.prediction(this.config, this.flight);
    this.pred = p;
    const plot = h("canvas", { class: "sl-mini" });
    box.append(h("div", { class: "sl-forecast-h" }, h("b", {}, "Прогноз полета"), h("span", {}, "без бортовой программы, как Simulate в OpenRocket")),
      h("div", { class: "sl-forecast-b" },
        h("dl", {}, p.rows.map(([k, v]) => [h("dt", {}, k), h("dd", {}, v)])), plot),
      ...(p.warnings.length ? [h("ul", { class: "sl-warns" }, p.warnings.map((w) => h("li", {}, w)))] : []));
    requestAnimationFrame(() => this.drawMini(plot, p));
  }

  drawMini(cv, p) {
    if (!cv.isConnected) return;
    const { ctx, W, H } = cvSetup(cv, 0.55, 150);
    const ev = p.ev, t0 = ev.tLaunch, t1 = ev.tEnd, z1 = Math.max(50, ev.apogee * 1.1);
    const X = (t) => 30 + ((t - t0) / (t1 - t0)) * (W - 40), Y = (z) => H - 18 - (z / z1) * (H - 30);
    ctx.fillStyle = "#f8fafc"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#e2e8f0"; ctx.fillStyle = "#64748b"; ctx.font = "10px Inter, system-ui, sans-serif";
    for (let i = 0; i <= 3; i++) { const z = (z1 * i) / 3, y = Y(z); ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W - 10, y); ctx.stroke(); ctx.fillText(fmt(z), 2, y + 3); }
    const line = (pts, color, w) => { ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); let f = true; for (const [t, z] of pts) { if (t < t0) continue; f ? ctx.moveTo(X(t), Y(z)) : ctx.lineTo(X(t), Y(z)); f = false; } ctx.stroke(); };
    line(p.ralt, "#94a3b8", 1.4); line(p.alt, "#0e7490", 2);
    ctx.fillStyle = "#ff6a1a"; ctx.beginPath(); ctx.arc(X(ev.tEject), Y(ev.ejectAlt), 4, 0, 7); ctx.fill();
    ctx.fillStyle = "#10213f"; ctx.fillText("выброс", X(ev.tEject) + 6, Y(ev.ejectAlt) - 4);
    ctx.fillStyle = "#64748b"; ctx.fillText(`${fmt(t1 - t0)} с`, W - 34, H - 4);
  }

  renderPreflight() {
    const ins = this.ins, K = this.K;
    const go = ins.checks.filter((c) => !c.optional || !c.ok);
    const okAll = go.every((c) => c.ok || c.optional);
    this.preflight.replaceChildren(
      h("div", { class: "sl-pf-h" }, h("b", {}, "Предстартовая проверка"), h("span", { class: "sl-go " + (okAll ? "go" : "nogo") }, okAll ? "Допущен к старту" : "Не допущен")),
      ...K.groups.map((g) => {
        const rows = go.filter((c) => (g.id ? c.group === g.id : true));
        if (!rows.length) return null;
        return h("div", { class: "sl-pf-g" }, K.groups.length > 1 ? h("div", { class: "sl-pf-gt" }, g.title) : null,
          h("ul", {}, rows.map((c) => h("li", { class: c.ok ? (c.warn ? "warn" : "ok") : c.optional ? "" : "bad" },
            h("span", { class: "sl-pf-l" }, c.label), c.value ? h("span", { class: "sl-pf-v" }, c.value) : null,
            K.inspectNote(c) ? h("span", { class: "sl-pf-n" }, K.inspectNote(c)) : null))));
      }));
  }

  renderConds() {
    const K = this.K, fl = this.ins.flight, box = this.condBox; box.innerHTML = "";
    if (!this.pd.free_flight) { box.append(h("p", { class: "sl-facts" }, K.facts(fl))); return; }
    box.append(h("div", { class: "sl-conds-h" }, "Условия запуска"),
      h("div", { class: "sl-condgrid" }, K.conditions(fl).map((c) => h("label", { class: "sl-field" }, h("span", {}, c.label),
        h("select", { class: "sl-select", onchange: (e) => { this.flight = { ...this.flight, [c.key]: +e.target.value }; this.setConfig(this.config, true); } },
          c.opts.map((v) => h("option", { value: v, selected: v === c.value }, `${c.div ? v / c.div : v} ${c.unit}`)))))),
      h("p", { class: "sl-facts" }, K.facts(fl)));
  }

  exportBudget() {
    download(`${this.kind}-budget.csv`, this.K.budgetCsv(this.config, this.flight));
    if (!this.exported) { this.exported = true; this.save(); this.evalTask(); }
  }

  drawBp() {
    const on3 = !!(this.use3d && this.s3d && this.view3d);
    this.b3dHost.hidden = !on3; this.bp.hidden = on3;
    this.btn3d.classList.toggle("on", this.view3d); this.btn2d.classList.toggle("on", !this.view3d);
    this.btnXray.hidden = this.btnExpl.hidden = !on3; if (this.mode === "rocket") this.btnExpl.hidden = true;
    const cube = this.kind !== "cansat";
    this.btnXray.classList.toggle("on", !!this.xray); this.btnExpl.classList.toggle("on", !!this.explode);
    if (on3) {
      if (this.b3dHost.offsetParent === null) return;
      try {
        if (!this.b3d) this.b3d = new this.s3d.BuilderView(this.b3dHost);
        const K = this.K;
        if (cube) this.b3d.set({ mode: "cube", parts: K.items(this.config) });
        else {
          const lift = this.ins.rocket.lift;
          this.b3d.set({ mode: this.mode === "rocket" ? "rocket" : "can", rocket: K.rocketOf(this.config), parts: K.items(this.config), cg: lift.cg, cp: lift.cp,
            labels: { cg: `ЦТ ${fmt(lift.cg)} мм`, cp: `ЦД ${fmt(lift.cp)} мм`, can: "CanSat", motor: "Двигатель РД1-100-7М", chute: "Парашют ракеты" } });
        }
        this.b3d.setXray(!!this.xray); this.b3d.setExplode(this.mode !== "rocket" && !!this.explode);
        return;
      } catch (e) { this.use3d = false; this.viewBar.hidden = true; this.camBar.hidden = true; this.b3dHost.hidden = true; this.bp.hidden = false; }
    }
    if (!this.bp.isConnected || this.bp.offsetParent === null) return;
    this.K.draw(this.bp, this.mode, this.config, this.ins);
  }

  // ─────────────── Полет ───────────────
  run() {
    this.stopRun(true);
    const on = this.ins.checks.find((c) => c.key === "power_on");
    if (on && !on.ok) { this.showTab("build"); this.toast("Не включится: нужен бортовой компьютер и питание", "bad"); return; }
    this.res = null; this.renderFlightIdle("Полет рассчитывается...");
    this.shell.replaceChildren(); this.shellLog(">>> %Run main.py", "muted");
    this.btnRun.classList.add("on"); this.btnRun2.classList.add("on");
    // сцена должна быть на виду: на узком экране она выше редактора
    try { const r = this.sceneWrap.getBoundingClientRect(); if (r.top < 0 || r.bottom > window.innerHeight) this.sceneWrap.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) { /* старый браузер */ }
    const w = new Worker(WORKER_URL, { type: "module" });
    this.worker = w;
    this.killT = setTimeout(() => this.fail("Программа зависла: в бесконечном цикле нет sleep(). Время полета идет только в sleep() и при работе с датчиками."), TIMEOUT);
    w.onmessage = (e) => this.onDone(e.data);
    w.onerror = (e) => this.fail("Ошибка симулятора: " + (e.message || "worker"));
    w.postMessage({ type: "start", kind: this.kind, code: this.code(), config: this.config, flight: this.flight, mjsUrl: MP_BASE + "micropython.mjs", wasmUrl: MP_BASE + "micropython.wasm" });
  }

  stopRun(silent) {
    clearTimeout(this.killT);
    if (this.worker) { this.worker.terminate(); this.worker = null; if (!silent) this.renderFlightIdle(); }
    if (this.play) { cancelAnimationFrame(this.play.raf); this.play = null; }
    this.btnRun.classList.remove("on"); this.btnRun2.classList.remove("on"); this.btnSkip.disabled = true;
    this.sumBox.hidden = true; this.syncTl();
  }

  shellLog(text, kind = "") {
    this.shell.append(h("div", { class: kind ? "sl-l-" + kind : "" }, text));
    while (this.shell.childNodes.length > 300) this.shell.firstChild.remove();
    this.shell.scrollTop = this.shell.scrollHeight;
  }

  fail(text) {
    this.stopRun(true);
    const ex = explainError(text);
    this.shellLog(ex.text, "err"); if (ex.hint) this.shellLog("Подсказка: " + ex.hint, "hint");
    if (ex.line) this.gotoLine(ex.line);
  }

  onDone(m) {
    clearTimeout(this.killT);
    if (this.worker) { this.worker.terminate(); this.worker = null; }
    if (m.error || !m.res) { this.fail(m.error || "Полет не рассчитался"); return; }
    this.res = m.res;
    this.score = this.K.score(this.res, this.pd.mission || {});
    this.startReplay();
  }

  renderFlightIdle(text) {
    this.gsBox.innerHTML = "";
    this.log(text || "Ожидание пакетов. Нажмите «Запустить»: программа выполнится на борту, а здесь появятся пакеты, которые примет станция.", "muted");
    this.hud.replaceChildren(); this.hudEls = null; this.countEl.hidden = true; this.sumBox.hidden = true;
    this.seriesSel.innerHTML = ""; this.series = [];
    this.drawScene(0); this.drawChart(); this.syncTl();
  }

  shellHead() {
    const res = this.res;
    this.shell.replaceChildren(); this.shellLog(">>> %Run main.py", "muted");
    if (res && res.error) { const ex = explainError(res.error); this.shellLog(ex.text, "err"); if (ex.hint) this.shellLog("Подсказка: " + ex.hint, "hint"); return ex; }
    return null;
  }

  startReplay() {
    const res = this.res, K = this.K;
    this.gsBox.innerHTML = "";
    const ex = this.shellHead(); if (ex && ex.line) this.gotoLine(ex.line);
    this.buildSeries();
    this.events = [
      ...res.packets.map((p) => ({ t: p.t, kind: "pkt", p })),
      ...res.prints.map((p) => ({ t: p.t, kind: "print", p })),
      ...res.photos.map((p) => ({ t: p.t, kind: "photo", p })),
      ...K.phases(res.flight).filter(([k]) => res.flight[k] != null).map(([k, text]) => ({ t: res.flight[k], kind: "phase", text })),
    ];
    if (res.ev && res.ev.warnings) for (const w of res.ev.warnings) this.events.push({ t: res.flight.tEject + 0.5, kind: "warn", text: w });
    if (res.died) this.events.push({ t: res.died, kind: "died" });
    this.events.sort((a, b) => a.t - b.t);
    const t0 = Math.max(0, res.flight.tLaunch - 4);
    // события до начала проигрывания показываем сразу
    this.play = { t: t0, t0, last: performance.now(), ei: 0, raf: 0, paused: false, done: false };
    this.btnRun.classList.remove("on"); this.btnRun2.classList.remove("on"); this.btnSkip.disabled = false; this.sumBox.hidden = true;
    this.scrub.min = t0; this.scrub.max = res.flight.tEnd; this.renderMarks();
    this.flush(t0, true);
    this.tick(t0);
    this.loop();
  }

  /** Скорость проигрывания. «Авто»: старт, отделение и посадка в реальном времени, остальное быстрее */
  speedAt(t) {
    const v = +this.speedSel.value; if (v) return v;
    const f = this.res.flight;
    if (this.kind !== "cansat") {
      // аэростат: старт и посадка медленно, подъем, висение и спуск ужимаются примерно до 12 секунд каждый
      if (t < f.tLaunch + 6) return 1;
      if (t < f.tTop - 4) return Math.max(2, (f.tTop - f.tLaunch) / 12);
      if (t < f.tTop + 4) return 2;
      if (t < f.tDescend - 3) return Math.max(2, (f.tDescend - f.tTop) / 12);
      if (t < f.tDescend + 3) return 2;
      if (t < f.tLand - 6) return Math.max(2, (f.tLand - f.tDescend) / 12);
      if (t < f.tLand + 2) return 1.5;
      return 8;
    }
    if (t < (f.tBurnout || f.tLaunch) + 2.5) return 1;
    if (t < f.tEject - 1.5) return 2.5;
    if (t < f.tEject + 3.5) return 1;
    if (t < f.tLand - 3) return f.tLand - f.tEject > 45 ? 6 : 4;
    if (t < f.tLand + 2) return 1.5;
    return 4;
  }

  loop() {
    const pl = this.play; if (!pl || pl.raf || pl.paused || pl.done) return;
    const tEnd = this.res.flight.tEnd;
    pl.last = performance.now();
    const step = (now) => {
      pl.raf = 0;
      if (this.play !== pl || pl.paused || pl.done) return;
      const dt = Math.min(0.25, (now - pl.last) / 1000); pl.last = now;
      pl.t = Math.min(tEnd, pl.t + dt * this.speedAt(pl.t));
      this.flush(pl.t, false);
      this.tick(pl.t);
      if (pl.t >= tEnd) { this.endReplay(); return; }
      pl.raf = requestAnimationFrame(step);
    };
    pl.raf = requestAnimationFrame(step);
  }

  tick(t) { this.drawScene(t); this.drawChart(t); this.syncTl(); }

  flush(t, quiet) {
    const pl = this.play;
    let n = 0;
    while (pl.ei < this.events.length && this.events[pl.ei].t <= t) {
      const e = this.events[pl.ei++];
      if (++n > 300) continue;
      if (e.kind === "pkt") {
        if (e.p.ok) this.log(`${fmtT(e.p.t)}  ${e.p.text}`, "", `${fmt(e.p.rssi)} дБм`);
        else this.log(`${fmtT(e.p.t)}  пакет потерян`, "lost", e.p.rssi == null ? "нет связи" : `${fmt(e.p.rssi)} дБм`);
      } else if (e.kind === "print") this.shellLog(e.p.text);
      else if (e.kind === "photo") this.log(`${fmtT(e.t)}  борт: снимок ${e.p.name}, ${fmt(e.p.alt)} м`, "muted");
      else if (e.kind === "phase") { this.log(`${fmtT(e.t)}  ${e.text}`, "phase"); if (!quiet) this.toast(e.text); }
      else if (e.kind === "warn") { this.log(`${fmtT(e.t)}  ${e.text}`, "err"); if (!quiet) this.toast(e.text, "bad"); }
      else if (e.kind === "died") { this.log(`${fmtT(e.t)}  Борт выключился`, "err"); if (!quiet) this.toast("Борт выключился", "bad"); }
    }
  }

  /** Перемотка: журналы пересобираются до выбранного момента */
  seek(t) {
    const pl = this.play, res = this.res; if (!pl || !res) return;
    t = clamp(t, pl.t0, res.flight.tEnd);
    if (t < pl.t) { this.gsBox.innerHTML = ""; this.shellHead(); pl.ei = 0; pl.logged = false; }
    pl.t = t; this.flush(t, true);
    if (t >= res.flight.tEnd) { this.endReplay(); return; }
    pl.done = false; this.sumBox.hidden = true; this.btnSkip.disabled = false;
    this.tick(t);
    this.loop();
  }
  skip() { if (this.play) this.seek(this.res.flight.tEnd); }
  togglePlay() {
    const pl = this.play;
    if (!pl || !this.res) { if (!this.worker) this.run(); return; }
    if (pl.done) { this.replayAgain(); return; }
    pl.paused = !pl.paused; this.syncTl(); this.drawScene(pl.t); this.loop();
  }
  replayAgain() { const pl = this.play; if (!pl) return; pl.paused = false; pl.done = false; this.seek(pl.t0); this.loop(); }

  endReplay() {
    const s = this.score, pl = this.play, tEnd = this.res.flight.tEnd;
    if (pl) { cancelAnimationFrame(pl.raf); pl.raf = 0; pl.t = tEnd; pl.done = true; pl.paused = true; }
    this.btnSkip.disabled = true;
    this.tick(tEnd);
    if (pl && !pl.logged) { pl.logged = true; this.log(`Полет окончен. ${s.title}: ${s.total} из ${s.max}${s.bonus ? `, бонус +${s.bonus}` : ""}. Подробно на вкладке «Разбор».`, "phase"); }
    this.evalTask(); this.showSummary();
  }

  syncTl() {
    const pl = this.play, on = !!(pl && this.res);
    this.scrub.disabled = !on; this.btnAgain.disabled = !on;
    if (on) this.scrub.value = pl.t;
    const txt = on ? `${fmtT(pl.t)} / ${fmtT(this.res.flight.tEnd)}` : "00:00";
    if (this.tlTime.textContent !== txt) this.tlTime.textContent = txt;
    this.btnPlay.classList.toggle("playing", on && !pl.paused && !pl.done);
    this.sceneWrap.classList.toggle("paused", on && pl.paused && !pl.done);
    if (on) this.scrub.style.setProperty("--k", (((pl.t - pl.t0) / Math.max(0.01, this.res.flight.tEnd - pl.t0)) * 100).toFixed(2) + "%");
    else { this.scrub.style.setProperty("--k", "0%"); this.tlMarks.replaceChildren(); }
  }

  renderMarks() {
    const f = this.res.flight, pl = this.play, span = Math.max(0.01, f.tEnd - pl.t0);
    this.tlMarks.replaceChildren(...this.K.phases(f).filter(([k]) => f[k] != null).map(([k, text]) =>
      h("button", { type: "button", class: "sl-tl-mark", style: `left:${(((f[k] - pl.t0) / span) * 100).toFixed(2)}%`, title: text, "aria-label": text, onclick: () => this.seek(Math.max(pl.t0, f[k] - 0.6)) })));
  }

  showSummary() {
    const s = this.score, res = this.res, box = this.sumBox;
    const got = res.packets.filter((p) => p.ok).length, sent = res.packets.length;
    const rows = [];
    if (res.ev) { rows.push(["Апогей", `${fmt(res.ev.apogee)} м`]); if (!res.ev.crash) rows.push(["Посадка CanSat", `${fmt(res.ev.vLandCan, 1)} м/с`]); }
    rows.push(["Принято пакетов", `${got} из ${sent}`]);
    const warns = (res.ev && res.ev.warnings) || [];
    box.replaceChildren(
      h("button", { type: "button", class: "sl-sum-x", title: "Закрыть", "aria-label": "Закрыть", onclick: () => { box.hidden = true; } }, "×"),
      h("div", { class: "sl-sum-h" }, "Полет окончен"),
      h("div", { class: "sl-sum-score" }, h("span", {}, s.title), h("b", { "data-notr": true }, `${s.total} / ${s.max}`)),
      h("dl", {}, rows.map(([k, v]) => [h("dt", {}, k), h("dd", { "data-notr": true }, v)])),
      h("ul", { class: "sl-sum-w", hidden: !warns.length }, warns.map((w) => h("li", {}, w))),
      h("div", { class: "sl-sum-a" }, h("button", { type: "button", class: "sl-btn sl-btn-pri", onclick: () => this.showTab("debrief") }, "Разбор полета"),
        h("button", { type: "button", class: "sl-btn", onclick: () => this.replayAgain() }, "Повторить")));
    box.hidden = false;
  }

  setCam(id) {
    this.cam = id; this.camBtns.forEach((b, i) => b.classList.toggle("on", this.camIds[i] === id));
    if (this.fs) this.fs.setCamera(id);
  }

  gotoLine(n) {
    try { const line = this.py.state.doc.line(Math.min(n, this.py.state.doc.lines)); this.py.dispatch({ selection: { anchor: line.from, head: line.to }, scrollIntoView: true }); this.py.focus(); } catch (e) { /* нет строки */ }
  }

  log(text, kind = "", side = "") {
    const line = h("div", { class: kind ? "sl-l-" + kind : "" }, h("span", {}, text), side ? h("em", {}, side) : null);
    this.gsBox.append(line);
    while (this.gsBox.childNodes.length > 300) this.gsBox.firstChild.remove();
    this.gsBox.scrollTop = this.gsBox.scrollHeight;
  }

  buildSeries() {
    this.series = this.K.series(this.res);
    const keep = this.seriesSel.value;
    const tele = this.series.filter((x) => x.tele);
    const defId = tele.length ? tele[Math.min(tele.length - 1, 2)].id : "alt";
    this.seriesSel.replaceChildren(...this.series.map((s) => h("option", { value: s.id, selected: s.id === keep || (!this.series.some((x) => x.id === keep) && s.id === defId) }, s.name)));
  }

  drawChart(tNow) {
    const cv = this.chart; if (cv.offsetParent === null) return;
    const { ctx, W, H } = cvSetup(cv, 0.42, 190);
    ctx.font = "11px Inter, system-ui, sans-serif"; ctx.fillStyle = "#8494b2";
    const s = (this.series || []).find((x) => x.id === this.seriesSel.value);
    if (!this.res || !s) { ctx.fillText("График появится после полета", 14, 26); return; }
    const fl = this.res.flight, [ta, tb] = this.K.chartWindow ? this.K.chartWindow(this.res) : [0, fl.tEnd];
    const L = 46, R = W - 10, T = 10, B = H - 22;
    const vis = s.pts.filter((q) => q[0] >= ta && q[0] <= tb);
    const ys = vis.map((q) => q[1]);
    if (!ys.length) return;
    let lo = Math.min(...ys), hi = Math.max(...ys); if (hi - lo < 1e-6) { hi += 1; lo -= 1; }
    const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
    const X = (t) => L + ((R - L) * (t - ta)) / (tb - ta), Y = (v) => B - ((B - T) * (v - lo)) / (hi - lo);
    const bands = this.kind === "cubesat" ? [[fl.tLaunch, fl.tTop], [fl.tTop, fl.tDescend], [fl.tDescend, fl.tLand]] : [[fl.tLaunch, fl.tEject], [fl.tEject, fl.tLand]];
    bands.forEach(([a, b], i) => { ctx.fillStyle = i % 2 ? "rgba(34,184,207,.08)" : "rgba(255,106,26,.07)"; ctx.fillRect(X(a), T, X(b) - X(a), B - T); });
    ctx.strokeStyle = "#e6ecf4"; ctx.fillStyle = "#6b7a99"; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const v = lo + ((hi - lo) * i) / 4, y = Y(v); ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke(); ctx.fillText(fmt(v, Math.abs(hi - lo) < 10 ? 1 : 0), 4, y + 4); }
    const span = tb - ta, stepT = span > 600 ? 120 : span > 240 ? 60 : span > 60 ? 15 : 5;
    for (let tt = Math.ceil(ta / stepT) * stepT; tt <= tb; tt += stepT) ctx.fillText(span > 240 ? `${Math.round(tt / 60)} мин` : `${Math.round(tt)} с`, X(tt) - 10, H - 6);
    const until = tNow == null ? Infinity : tNow;
    ctx.strokeStyle = "#1c7fa8"; ctx.fillStyle = "#1c7fa8"; ctx.lineWidth = 1.8;
    if (s.line) { ctx.beginPath(); let first = true; for (const [t, v] of vis) { if (t > until) break; first ? ctx.moveTo(X(t), Y(v)) : ctx.lineTo(X(t), Y(v)); first = false; } ctx.stroke(); }
    else for (const [t, v] of vis) { if (t > until) break; ctx.fillRect(X(t) - 1.2, Y(v) - 1.2, 2.4, 2.4); }
    if (tNow != null) { ctx.strokeStyle = "rgba(255,106,26,.8)"; ctx.beginPath(); ctx.moveTo(X(tNow), T); ctx.lineTo(X(tNow), B); ctx.stroke(); }
  }

  drawScene(t) {
    if (!this.config || this.sceneWrap.offsetParent === null) return;
    const K = this.K, pl = this.play, playing = !!(pl && !pl.paused && !pl.done);
    const fl = this.ins ? this.ins.flight : K.flightPlan(this.flight);
    const yagi = K.items(this.config).some((p) => p.cat === "station" && !p.omni);
    if (this.use3d && this.s3d && this.flight3d()) {
      const fs = this.fs;
      if (this.kind === "cansat") fs.setConfig({ rocket: K.rocketOf(this.config), parts: K.items(this.config), canChute: this.config.canChute || 0, wind: K.sceneWind(fl), station: fl.station, yagi });
      else fs.setConfig({ parts: K.items(this.config), wind: K.sceneWind(fl), station: fl.station, yagi, env: K.env(this.res ? this.res.flight : fl), plan: this.res ? this.res.flight : fl });
      if (this.fsRes !== this.res) { this.fsRes = this.res; fs.setFlight(this.res); }
      const p = this.res || this.kind !== "cansat" ? null : K.forecast(this.config, fl);
      if (this.fsPred !== p) { this.fsPred = p; fs.setPrediction(p); }
      fs.setTime(t, playing);
    } else {
      const st = { res: this.res, t, flight: fl, speed: this.res && pl ? this.speedAt(t) : 30, playing: !!pl, wind: K.sceneWind(fl), yagi };
      if (this.kind === "cansat" && !this.res) { const p = K.forecast(this.config, fl); st.pred = p.ev; st.predPath = p.path; }
      this.scene.draw(this.sceneCv, st);
    }
    this.renderHud(t);
  }

  /** 3D-сцена полета создается при первом показе вкладки; если видеокарта отказала, остается плоская сцена */
  flight3d() {
    if (this.fs) return this.fs;
    try {
      this.s3Host.hidden = false; this.sceneCv.hidden = true;
      this.fs = new (this.kind === "cansat" ? this.s3d.FlightScene : this.s3d.BalloonScene)(this.s3Host, { station: "Станция", pad: "Стартовый стол", rocket: "Ракета", apogee: "Апогей", winch: "Лебедка" });
      if (this.cam) this.fs.setCamera(this.cam);
      this.sceneWrap.classList.add("is3d");
    } catch (e) { this.fs = null; this.use3d = false; this.s3Host.hidden = true; this.sceneCv.hidden = false; this.camBar.hidden = true; }
    return this.fs;
  }

  renderHud(t) {
    const res = this.res;
    if (!res) { if (this.hud.firstChild) this.hud.replaceChildren(); this.hudEls = null; this.countEl.hidden = true; return; }
    const hd = this.K.hud(res, t); if (!hd) return;
    const got = res.packets.filter((p) => p.t <= t && p.ok).length, sent = res.packets.filter((p) => p.t <= t).length;
    const tileOf = (label, unit, cls = "") => { const b = h("b", { "data-notr": true }, "0"); return [h("div", { class: "sl-tile " + cls }, h("span", {}, label), h("div", {}, b, unit ? h("em", {}, unit) : null)), b]; };
    const put = (el, v) => { if (el.textContent !== v) el.textContent = v; };
    if (this.kind !== "cansat" && !this.fs) {
      this.hud.replaceChildren(
        h("span", { class: "sl-hud-t" }, fmtT(t)), h("span", {}, this.K.PHASE[hd.phase] || ""), h("span", {}, `${fmt(hd.alt)} м`),
        ...hd.extra.map((x) => h("span", { class: x === "выключен" ? "bad" : "" }, x)), h("span", {}, `принято ${got} из ${sent}`));
      return;
    }
    if (this.kind !== "cansat") {
      // приборы CubeSat
      if (!this.hudEls) {
        const [a, alt] = tileOf("Высота", "м", "sl-tile-big"), [b, wind] = tileOf("Ветер", "м/с"), [c, air] = tileOf("Воздух", "°C"), [d, tin] = tileOf("Внутри корпуса", "°C"),
          [e, bat] = tileOf("Аккумулятор", "%"), [f, rx] = tileOf("Принято пакетов", "");
        const phase = h("span", { class: "sl-phase" }), off = h("span", { class: "sl-phase bad", hidden: true }, "Борт выключен");
        this.hud.classList.add("sl-hud3");
        this.hud.replaceChildren(h("div", { class: "sl-tiles" }, a, b, c, d, e, f), h("div", { class: "sl-phases" }, phase, off));
        this.hudEls = { alt, wind, air, tin, bat, rx, phase, off, last: "" };
      }
      const i = Math.min(res.timeline.length - 1, Math.max(0, Math.floor(t))), r0 = res.timeline[i], r1 = res.timeline[Math.min(res.timeline.length - 1, i + 1)], k = t - Math.floor(t), E = this.hudEls;
      put(E.alt, fmt(r0.alt + (r1.alt - r0.alt) * k)); put(E.wind, fmt(r0.wind, 1)); put(E.air, fmt(r0.temp, 1)); put(E.tin, fmt(r0.tin, 1)); put(E.bat, String(r0.pct)); put(E.rx, `${got} / ${sent}`);
      if (E.last !== hd.phase) { E.last = hd.phase; E.phase.textContent = this.K.PHASE[hd.phase] || ""; }
      E.off.hidden = hd.alive !== false;
      const n = Math.ceil(res.flight.tLaunch - t), show = n >= 1 && n <= 3;
      this.countEl.hidden = !show; if (show) put(this.countEl, String(n));
      return;
    }
    // приборы CanSat: подписи ставятся один раз, каждый кадр меняются только числа
    if (!this.hudEls) {
      const tile = (label, unit, cls = "") => { const b = h("b", { "data-notr": true }, "0"); return [h("div", { class: "sl-tile " + cls }, h("span", {}, label), h("div", {}, b, unit ? h("em", {}, unit) : null)), b]; };
      const [a, alt] = tile("Высота", "м", "sl-tile-big"), [b, vz] = tile("Скорость", "м/с"), [c, g] = tile("Перегрузка", "g"), [d, rx] = tile("Принято пакетов", "");
      const phase = h("span", { class: "sl-phase" }), off = h("span", { class: "sl-phase bad", hidden: true }, "Борт выключен");
      this.hud.classList.add("sl-hud3");
      this.hud.replaceChildren(h("div", { class: "sl-tiles" }, a, b, c, d), h("div", { class: "sl-phases" }, phase, off));
      this.hudEls = { alt, vz, g, rx, phase, off, last: "" };
    }
    const tl = res.timeline[Math.min(res.timeline.length - 1, Math.max(0, Math.round(t * 10)))], E = this.hudEls;
    const set = (el, v) => { if (el.textContent !== v) el.textContent = v; };
    set(E.alt, fmt(hd.alt)); set(E.vz, (tl.vz > 0.5 ? "↑ " : tl.vz < -0.5 ? "↓ " : "") + fmt(Math.abs(tl.vz), 1)); set(E.g, fmt(tl.g, 1)); set(E.rx, `${got} / ${sent}`);
    if (E.last !== hd.phase) { E.last = hd.phase; E.phase.textContent = this.K.PHASE[hd.phase] || ""; }
    E.off.hidden = hd.alive !== false;
    const n = Math.ceil(res.flight.tLaunch - t);
    const show = n >= 1 && n <= 3;
    this.countEl.hidden = !show; if (show) set(this.countEl, String(n));
  }

  // ─────────────── Разбор ───────────────
  renderDebrief() {
    const box = this.debriefBox; box.innerHTML = "";
    if (!this.res) { box.append(h("div", { class: "sl-empty" }, h("b", {}, "Разбор появится после полета."), " Запустите полет на вкладке «Программа и полет»: здесь будут баллы по критериям регламента, потери пакетов и файлы для отчета.")); return; }
    const s = this.score, res = this.res, K = this.K;
    box.append(
      h("div", { class: "sl-sheet-h" }, h("h4", {}, s.title), h("p", {}, s.note)),
      h("table", { class: "sl-scoresheet" },
        h("thead", {}, h("tr", {}, h("th", {}, "Пункт"), h("th", {}, "Что оценивается"), h("th", {}, "Результат полета"), h("th", { class: "num" }, "Баллы"))),
        h("tbody", {}, s.items.map((x) => h("tr", { class: x.points >= x.max ? "full" : x.points ? "part" : "zero" },
          h("td", { class: "key" }, x.key), h("td", {}, x.label), h("td", { class: "val" }, x.value), h("td", { class: "num" }, `${x.points} из ${x.max}`)))),
        h("tfoot", {}, h("tr", {}, h("td", { colspan: 3 }, "Итого" + (s.bonus ? `, плюс бонус ${s.bonus}` : "")), h("td", { class: "num" }, `${s.total} из ${s.max}`)))),
      h("div", { class: "sl-stats" }, s.stats.map(([l, v]) => h("div", { class: "sl-stat" }, h("div", { class: "sl-stat-v" }, String(v)), h("div", { class: "sl-stat-l" }, l)))),
      h("div", { class: "sl-downloads" },
        h("button", { type: "button", class: "sl-btn", onclick: () => download("ground-station.csv", "t;rssi;packet\n" + res.packets.filter((p) => p.ok).map((p) => `${p.t};${p.rssi};${p.text}`).join("\n")) }, "Принято станцией, CSV"),
        h("button", { type: "button", class: "sl-btn", disabled: !res.sd.length, onclick: () => download("data.csv", res.sd.map((x) => x.text).join("\n")) }, "Файл с борта data.csv"),
        h("button", { type: "button", class: "sl-btn", onclick: () => download("flight-truth.csv", K.truthCsv(res)) }, "Настоящие значения, CSV")),
      h("p", { class: "sl-hint" }, "Сравните данные с борта и со станции, постройте графики по высоте и объясните потери пакетов: это материал для раздела «Анализ» в отчете команды."));
    if (res.photos.length) {
      const strip = h("div", { class: "sl-photos" });
      const pick = res.photos.filter((_, i) => i % Math.ceil(res.photos.length / 8) === 0).slice(0, 8);
      for (const p of pick) { const c = h("canvas", { width: 160, height: 120 }); drawPhoto(c, p, res.flight); strip.append(h("figure", {}, c, h("figcaption", {}, `${p.name}, ${fmt(p.alt)} м`))); }
      box.append(h("h5", {}, `Снимки с борта: ${res.photos.length}`), strip);
    }
  }

  // ─────────────── Задание ───────────────
  renderTask() {
    const pd = this.pd, box = this.taskBox; box.innerHTML = "";
    const body = h("div", { class: "sl-task-b" });
    for (const line of (pd.task || "").split("\n")) if (line) body.append(h("p", {}, line));
    this.checkList = h("ul", { class: "sl-checks" });
    this.doneEl = h("div", { class: "sl-done", hidden: true }, "Задание выполнено. Отметьте урок как пройденный.");
    if (pd.checks && pd.checks.length) {
      body.append(h("p", { class: "sl-task-m" }, this.K.needsFlight(pd.checks) ? "Пункты про сборку проверяются сразу, про полет - после каждого полета." : "Проверка идет сразу, пока вы собираете."), this.checkList, this.doneEl);
    } else body.append(h("p", { class: "sl-task-m" }, "Свободный режим без проверок: пробуйте разные сборки и смотрите, как меняются масса, устойчивость, энергия и связь."));
    const det = h("details", { class: "sl-task-d", open: true }, h("summary", {}, h("span", { class: "sl-task-k" }, "Задание"), h("b", {}, pd.title || "Свободная сборка")), body);
    box.append(det);
  }

  evalTask() {
    if (!this.pd || !this.checkList) return;
    const checks = this.pd.checks || [];
    if (!checks.length) return;
    const ev = this.K.evalChecks(checks, { config: this.config, flight: this.flight, res: this.play && !this.play.done ? null : this.res, mission: this.pd.mission, extra: { exported: this.exported } });
    this.checkList.replaceChildren(...checks.map((c, i) => {
      const r = ev.results[i];
      return h("li", { class: r.ok ? "ok" : r.pending ? "" : "bad" }, h("span", {}, c.label), r.value && !r.pending ? h("em", {}, r.value) : null);
    }));
    this.doneEl.hidden = !ev.all;
    if (ev.all && !this.solvedSent) {
      this.solvedSent = true;
      this.toast("Задание выполнено", "ok");
      if (window.academySolved) window.academySolved(this.presetName);
    }
  }

  renderHelp() {
    const K = this.K;
    const api = [
      ["from sat import *", "подключить модули (первая строка программы)"],
      ["sleep(0.1)", "подождать; время полета идет в sleep() и при работе с датчиками"],
      ["time()", "секунды с включения"],
      ["bme.pressure(), bme.temperature()", "давление, гПа; температура внутри корпуса, °C"],
      ["bme.humidity()", "влажность, % (только BME280)"],
      ["therm.temperature()", "наружная температура с DS18B20, °C"],
      ["imu.range(16)", "диапазон акселерометра: 2, 4, 8 или 16 g"],
      ["imu.accel(), imu.gyro()", "перегрузка (x, y, z) в м/с², вращение (x, y, z) в °/с"],
      ["gps.position()", "(широта, долгота, высота) или None без фиксации"],
      ["light.lux()", "освещенность, лк"],
      ["camera.capture(), camera.video(True)", "снимок; запись видео (нужен компьютер с камерой)"],
      ["radio.send(line)", "передать строку на станцию; длина не больше лимита модуля"],
      ["sd.write(line)", "записать строку в data.csv на борту"],
      ["battery.voltage(), battery.percent()", "напряжение под нагрузкой, В; заряд, %"],
    ];
    this.helpBox.replaceChildren(
      h("h4", {}, "Как это устроено"), h("p", {}, K.help.intro),
      h("p", {}, "В симуляторе три шага: соберите конструкцию, напишите бортовую программу на MicroPython и запустите полет. Программа выполняется на настоящем интерпретаторе MicroPython в браузере. Время виртуальное: весь полет считается за секунды, потом проигрывается."),
      h("h5", {}, "Что учитывает физика"), h("p", {}, K.help.physics),
      h("h5", {}, "Модуль sat"),
      h("table", { class: "sl-api" }, h("tbody", {}, api.map(([a, b]) => h("tr", {}, h("td", {}, h("code", {}, a)), h("td", {}, b))))),
      h("h5", {}, "Пример"), h("pre", { class: "sl-pre" }, K.help.example),
      h("p", { class: "sl-hint" }, "Массы, мощности и чувствительности в каталоге - типичные значения распространенных модулей. Для документации команды берите паспорта своих компонентов."));
  }

  drawAll() {
    if (!this.config) return;
    this.drawBp();
    this.drawScene(this.play ? this.play.t : this.res ? this.res.flight.tEnd : 0);
    this.drawChart(this.play ? this.play.t : undefined);
  }
}

/** «Снимок» с борта: горизонт наклонен раскачкой, поля мельче с высотой */
function drawPhoto(cv, p, fl) {
  const ctx = cv.getContext("2d"), W = cv.width, H = cv.height;
  let seed = Math.round(p.t * 1000) % 2147483647 || 1;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const horizon = H * (0.28 + 0.12 * Math.sin(p.yaw / 40));
  const sky = ctx.createLinearGradient(0, 0, 0, horizon); sky.addColorStop(0, "#1d4ed8"); sky.addColorStop(1, "#bfdbfe");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(W / 2, horizon); ctx.rotate(Math.sin(p.t / 3.1) * 0.12); ctx.translate(-W / 2, -horizon);
  ctx.fillStyle = "#a3b18a"; ctx.fillRect(-20, horizon, W + 40, H);
  const cell = Math.max(4, 40 - (p.alt / Math.max(1, fl.altMax)) * 32), cols = ["#7c9a5e", "#b5a36a", "#5f7f45", "#c9b98a", "#8aa66a"];
  for (let y = horizon; y < H + 10; y += cell * (0.5 + (y - horizon) / H)) for (let x = -20; x < W + 20; x += cell * 1.6) { ctx.fillStyle = cols[Math.floor(rnd() * cols.length)]; ctx.fillRect(x, y, cell * 1.6 - 1, cell * (0.5 + (y - horizon) / H) - 1); }
  ctx.restore();
  ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(0, H - 14, W, 14); ctx.fillStyle = "#fff"; ctx.font = "10px monospace"; ctx.fillText(`${Math.round(p.alt)} m  t=${Math.round(p.t)}s`, 4, H - 4);
}

const instances = [];
function mount() {
  for (const node of document.querySelectorAll("[class*='cubesat-sim-'], [class*='cansat-sim-']")) {
    if (node.dataset.mounted) continue;
    node.dataset.mounted = "1";
    const m = node.className.match(/(cubesat|cansat)-sim-([\w-]+)/);
    if (!m) continue;
    const wrap = document.createElement("div");
    node.replaceWith(wrap);
    instances.push(new SatLab(wrap, { kind: m[1], preset: `${m[1]}-${m[2].replace(new RegExp("^" + m[1] + "-"), "")}` }));
    localize(wrap);
  }
}
onReady(mount);
window.USTEMSat = { SatLab, mount, instances };
