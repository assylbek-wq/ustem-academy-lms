// Конструктор и симулятор CubeSat 1U для World Space Olympiad: сборка спутника, бортовая программа на MicroPython,
// полет на привязном аэростате, наземная станция и разбор полета по критерию FLT. Встраивается в урок блоком
// <div class="cubesat-sim-ИМЯ"></div>, песочница /lab/cubesat.
import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { CATEGORIES, PARTS, part } from "./catalog.js";
import { FADE, MAX_MASS, TX_LEVELS, addPart, budgetCsv, emptyConfig, flightPlan, inspect, items, removeAt } from "./model.js";
import { explainError, score } from "./runner.js";
import { evalChecks, needsFlight } from "./checks.js";

const SCRIPT_SRC = (document.currentScript && document.currentScript.src) || "/static/js/cubesatsim.js";
const WORKER_URL = SCRIPT_SRC.replace(/cubesatsim\.js/, "cubesatworker.js");
const MP_BASE = new URL("/static/spikesim/", location.href).href;
const TIMEOUT = 25000;

const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") e.className = v; else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else if (v !== false && v != null) e.setAttribute(k, v === true ? "" : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) e.append(k.nodeType ? k : document.createTextNode(k));
  return e;
};
const fmt = (x, d = 0) => Number(x).toLocaleString("ru-RU", { minimumFractionDigits: d, maximumFractionDigits: d });
const PHASE = { pre: "Подготовка на старте", ascent: "Подъем", hold: "Висение", descent: "Спуск", landed: "Посадка" };
const download = (name, text, type = "text/csv") => {
  const a = h("a", { href: URL.createObjectURL(new Blob(["﻿" + text], { type: type + ";charset=utf-8" })), download: name });
  document.body.append(a); a.click(); a.remove();
};
const fields = (text) => String(text).split(/[,;\t ]+/).map((x) => parseFloat(x));

class CubeSatSim {
  constructor(root, { preset = "cubesat-sandbox" } = {}) {
    this.root = root; this.presetName = preset; this.storageKey = "cubesat:" + preset;
    this.res = null; this.play = null; this.solvedSent = false; this.exported = false;
    this.build();
    this.load();
  }

  // ─────────────── Разметка ───────────────
  build() {
    const r = this.root; r.classList.add("cs"); r.innerHTML = "";
    this.tabs = {};
    const tab = (id, title) => { const b = h("button", { type: "button", class: "cs-tab", onclick: () => this.showTab(id) }, title); this.tabs[id] = { b }; return b; };
    this.btnReset = h("button", { type: "button", class: "cs-btn", title: "Вернуть стартовую сборку и программу задания", onclick: () => this.resetAll() }, "Сброс");
    const top = h("div", { class: "cs-top" },
      h("div", { class: "cs-tabs" }, tab("build", "1. Конструктор"), tab("flight", "2. Программа и полет"), tab("debrief", "3. Разбор полета"), tab("help", "Справка")),
      h("span", { class: "cs-grow" }), this.btnReset,
      h("button", { type: "button", class: "cs-btn", title: "Во весь экран", onclick: () => { this.root.classList.toggle("cs-full"); this.drawAll(); } }, "⛶"));

    // конструктор
    this.catalog = h("div", { class: "cs-catalog" });
    this.iso = h("canvas", { class: "cs-iso", width: 560, height: 430 });
    this.gauges = h("div", { class: "cs-gauges" });
    this.inspectBox = h("ul", { class: "cs-inspect" });
    this.flightBox = h("div", { class: "cs-conds" });
    const buildPane = h("div", { class: "cs-build" }, this.catalog,
      h("div", { class: "cs-view" },
        h("div", { class: "cs-isowrap" }, this.iso),
        this.gauges,
        h("div", { class: "cs-card" }, h("div", { class: "cs-card-h" }, h("b", {}, "Предстартовая проверка"),
          h("span", { class: "cs-grow" }),
          h("button", { type: "button", class: "cs-btn cs-btn-sm", title: "Таблица масс и энергии для технической документации", onclick: () => this.exportBudget() }, "⭳ Бюджет CSV")),
        this.inspectBox),
        this.flightBox));

    // программа и полет
    this.pyDiv = h("div", { class: "cs-python" });
    this.btnRun = h("button", { type: "button", class: "cs-btn cs-run", onclick: () => (this.worker ? this.stopRun() : this.run()) }, "▶ Старт полета");
    this.speedSel = h("select", { class: "cs-select", title: "Скорость проигрывания полета" },
      ...[[10, "×10"], [30, "×30"], [60, "×60"], [150, "×150"]].map(([v, t]) => h("option", { value: v, selected: v === 30 }, t)));
    this.speedSel.addEventListener("change", () => { if (this.play) this.play.speed = +this.speedSel.value; });
    this.btnSkip = h("button", { type: "button", class: "cs-btn", title: "Сразу к концу полета", onclick: () => this.skip(), disabled: true }, "⏭ В конец");
    this.scene = h("canvas", { class: "cs-scene", width: 760, height: 330 });
    this.hud = h("div", { class: "cs-hud" });
    this.toastBox = h("div", { class: "cs-toasts" });
    this.gsBox = h("pre", { class: "cs-console" });
    this.chart = h("canvas", { class: "cs-chart", width: 760, height: 190 });
    this.seriesSel = h("select", { class: "cs-select", title: "Что показать на графике", onchange: () => this.drawChart() });
    const flightPane = h("div", { class: "cs-flight" },
      h("div", { class: "cs-code" },
        h("div", { class: "cs-bar" }, this.btnRun, this.speedSel, this.btnSkip, h("span", { class: "cs-grow" }),
          h("button", { type: "button", class: "cs-btn cs-btn-sm", title: "Скачать main.py", onclick: () => download("main.py", this.code(), "text/x-python") }, "⭳ .py")),
        this.pyDiv),
      h("div", { class: "cs-sky" },
        h("div", { class: "cs-scenewrap" }, this.scene, this.hud, this.toastBox),
        h("div", { class: "cs-gs" }, h("div", { class: "cs-gs-h" }, h("b", {}, "Наземная станция"), h("span", { class: "cs-muted" }, " принятые пакеты")), this.gsBox),
        h("div", { class: "cs-chartwrap" }, h("div", { class: "cs-gs-h" }, h("b", {}, "График"), h("span", { class: "cs-grow" }), this.seriesSel), this.chart)));

    this.debriefBox = h("div", { class: "cs-debrief" });
    this.helpBox = h("div", { class: "cs-help" });
    this.tabs.build.pane = buildPane; this.tabs.flight.pane = flightPane;
    this.tabs.debrief.pane = this.debriefBox; this.tabs.help.pane = this.helpBox;

    this.taskBox = h("aside", { class: "cs-task" });
    r.append(top, h("div", { class: "cs-body" }, h("div", { class: "cs-main" }, buildPane, flightPane, this.debriefBox, this.helpBox), this.taskBox));

    this.py = new EditorView({ doc: "", parent: this.pyDiv,
      extensions: [basicSetup, python(), keymap.of([indentWithTab]), EditorView.updateListener.of((u) => { if (u.docChanged) this.save(); })] });
    this.renderHelp();
    new ResizeObserver(() => this.drawAll()).observe(this.root);
  }

  showTab(id) {
    for (const [k, t] of Object.entries(this.tabs)) { t.pane.hidden = k !== id; t.b.classList.toggle("active", k === id); }
    this.tab = id; this.save();
    if (id === "debrief") this.renderDebrief();
    requestAnimationFrame(() => this.drawAll());
  }

  // ─────────────── Данные ───────────────
  async load() {
    let pd = null;
    try { pd = await (await fetch(`/static/cubesat/presets/${this.presetName}.json`, { cache: "no-cache" })).json(); } catch (e) { pd = null; }
    this.pd = pd || { title: "Свободная сборка и полет", checks: [], config: emptyConfig(), python: "from sat import *\n", free_flight: true };
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(this.storageKey) || "null"); } catch (e) { saved = null; }
    this.config = (saved && saved.config) || JSON.parse(JSON.stringify(this.pd.config || emptyConfig()));
    this.flight = { ...(this.pd.flight || {}), ...((this.pd.free_flight && saved && saved.flight) || {}) };
    this.exported = !!(saved && saved.exported);
    const code = (saved && typeof saved.py === "string" && saved.py) || this.pd.python || "";
    this.loading = true;
    this.py.dispatch({ changes: { from: 0, to: this.py.state.doc.length, insert: code } });
    this.loading = false;
    this.res = null;
    this.renderTask(); this.refresh();
    this.showTab((saved && saved.tab) || this.pd.tab || "build");
    this.renderFlightIdle();
  }

  save() {
    if (!this.pd || this.loading) return;
    clearTimeout(this.saveT);
    this.saveT = setTimeout(() => {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify({ config: this.config, py: this.py.state.doc.toString(), tab: this.tab,
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

  setConfig(next) {
    this.config = next;
    if (this.play) this.stopRun(true);
    if (this.res) { this.res = null; this.renderFlightIdle(); this.toast("Сборка изменилась: запустите полет заново"); }
    this.save(); this.refresh();
  }

  refresh() {
    this.ins = inspect(this.config, this.flight);
    this.renderCatalog(); this.renderGauges(); this.renderInspect(); this.renderConds(); this.drawIso(); this.evalTask();
  }

  toast(text, kind = "") {
    const el = h("div", { class: "cs-toast " + kind }, text);
    if (this.toastBox.children.length >= 3) this.toastBox.firstChild.remove();
    this.toastBox.append(el); setTimeout(() => el.remove(), 3000);
  }

  // ─────────────── Конструктор ───────────────
  renderCatalog() {
    const box = this.catalog; box.innerHTML = "";
    const list = this.config.items || [];
    for (const cat of CATEGORIES) {
      const sec = h("section", { class: "cs-cat" }, h("h5", {}, cat.title, cat.required ? h("span", { class: "cs-req", title: "Нужно для полета" }, " *") : null));
      for (const p of PARTS.filter((x) => x.cat === cat.id)) {
        const n = list.filter((id) => id === p.id).length;
        const meta = [p.mass ? `${p.mass} г` : null, p.idle ? `${p.idle} мВт` : null, p.h ? `${p.h} мм` : null, p.wh ? `${fmt(p.wh, 1)} Вт·ч` : null,
          p.gain != null ? `${p.gain > 0 ? "+" : ""}${fmt(p.gain, 1)} дБи` : null, p.freq ? `${p.freq} МГц` : null, p.maxlen ? `пакет до ${p.maxlen} Б` : null].filter(Boolean).join(" · ");
        const card = h("div", { class: "cs-part" + (n ? " on" : "") },
          h("i", { class: "cs-dot", style: `background:${p.color}` }),
          h("div", { class: "cs-part-b" }, h("div", { class: "cs-part-n" }, p.name, n > 1 ? h("span", { class: "cs-count" }, ` ×${n}`) : null),
            h("div", { class: "cs-part-m" }, meta), h("div", { class: "cs-part-note" }, p.note)),
          h("div", { class: "cs-part-a" },
            (!n || p.max) && !(p.max && n >= p.max) ? h("button", { type: "button", class: "cs-add", title: n && !p.max ? "" : "Добавить", "aria-label": "Добавить " + p.name,
              onclick: () => this.setConfig(addPart(this.config, p.id)) }, cat.one && list.some((id) => (part(id) || {}).cat === cat.id) && !n ? "⇄" : "+") : null,
            n ? h("button", { type: "button", class: "cs-del", title: "Убрать", "aria-label": "Убрать " + p.name,
              onclick: () => this.setConfig(removeAt(this.config, list.lastIndexOf(p.id))) }, "−") : null));
        sec.append(card);
      }
      if (cat.id === "radio") {
        const r = items(this.config).find((x) => x.cat === "radio");
        if (r) {
          const mode = h("select", { class: "cs-select", "aria-label": "Режим радио", onchange: (e) => this.setConfig({ ...this.config, radioMode: e.target.value }) },
            r.modes.map((m) => h("option", { value: m.id, selected: m.id === (this.config.radioMode || r.modes[0].id) }, `${m.name}, чувствительность ${m.sens} дБм`)));
          const tx = h("select", { class: "cs-select", "aria-label": "Мощность передатчика", onchange: (e) => this.setConfig({ ...this.config, txDbm: +e.target.value }) },
            TX_LEVELS.map((v) => h("option", { value: v, selected: v === +this.config.txDbm }, `${v} дБм (${fmt(Math.pow(10, v / 10), 0)} мВт)`)));
          sec.append(h("div", { class: "cs-radio" }, h("label", {}, "Режим", mode), h("label", {}, "Мощность", tx)));
        }
      }
      box.append(sec);
    }
  }

  renderGauges() {
    const ins = this.ins, fl = ins.flight, pw = ins.power;
    const planMin = (fl.tEnd - fl.tLaunch + fl.pre) / 60;
    const g = (title, value, share, cls, sub) => h("div", { class: "cs-gauge " + cls },
      h("div", { class: "cs-gauge-t" }, title), h("div", { class: "cs-gauge-v" }, value),
      h("div", { class: "cs-meter" }, h("i", { style: `width:${Math.max(2, Math.min(100, share * 100)).toFixed(0)}%` })), h("div", { class: "cs-gauge-s" }, sub));
    const m = ins.mass.total, st = ins.stack, ln = ins.link;
    const hours = pw.hours * 60;
    this.gauges.replaceChildren(
      g("Масса", `${m} г`, m / MAX_MASS, m > MAX_MASS ? "bad" : m > MAX_MASS * 0.85 ? "warn" : "ok", `лимит ${MAX_MASS} г, провода +${ins.mass.wiring} г`),
      g("Стек плат", `${st.used} мм`, st.used / st.limit, st.used > st.limit ? "bad" : st.used > st.limit * 0.9 ? "warn" : "ok", `из ${st.limit} мм в каркасе`),
      g("Энергия", pw.wh ? `${fmt(hours)} мин` : "нет батареи", pw.wh ? Math.min(1, hours / (planMin * 3)) : 0, !pw.wh || hours < planMin * 1.5 ? "bad" : hours < planMin * 3 ? "warn" : "ok",
        `полет ${fmt(planMin)} мин, ${fmt(pw.total, 2)} Вт`),
      g("Связь", ln ? (ln.bad ? "частоты разные" : `${ln.margin > 0 ? "+" : ""}${fmt(ln.margin, 1)} дБ`) : "нет линии",
        ln && !ln.bad ? Math.max(0, Math.min(1, (ln.margin + 5) / 35)) : 0, !ln || ln.bad || ln.margin < 0 ? "bad" : ln.margin < FADE ? "warn" : "ok",
        ln && !ln.bad ? `худшая точка: ${fmt(ln.dist)} м, угол ${fmt(ln.elev)}°` : `станция в ${fl.station} м, высота ${fl.altMax} м`));
  }

  renderInspect() {
    this.inspectBox.replaceChildren(...this.ins.checks.filter((c) => !c.optional || !c.ok).map((c) =>
      h("li", { class: c.ok ? (c.warn ? "warn" : "ok") : c.optional ? "" : "bad" }, h("span", {}, c.label),
        c.value ? h("em", {}, c.value) : null, c.warn ? h("em", { class: "cs-warnline" }, `меньше ${FADE} дБ: при вращении и раскачке часть пакетов потеряется`) : null)));
  }

  renderConds() {
    const fl = this.ins.flight;
    const box = this.flightBox; box.innerHTML = "";
    const facts = `Аэростат: ${fl.altMax} м, подъем ${fl.ascent} м/с, висение ${fmt(fl.hold / 60, fl.hold % 60 ? 1 : 0)} мин. Станция в ${fl.station} м от старта.`;
    if (!this.pd.free_flight) { box.append(h("div", { class: "cs-card cs-muted" }, h("b", {}, "Условия полета. "), facts)); return; }
    const sel = (label, key, opts, unit) => h("label", {}, label, h("select", { class: "cs-select", onchange: (e) => { this.flight = { ...this.flight, [key]: +e.target.value }; this.setConfig(this.config); } },
      opts.map((v) => h("option", { value: v, selected: v === fl[key] }, `${unit === "мин" ? v / 60 : v} ${unit}`))));
    box.append(h("div", { class: "cs-card" }, h("b", {}, "Условия полета"),
      h("div", { class: "cs-condgrid" }, sel("Высота", "altMax", [300, 500, 1000, 1500, 2000], "м"), sel("Станция", "station", [100, 150, 300, 500, 800], "м"),
        sel("Висение", "hold", [60, 300, 600, 1800, 3600], "мин"))));
  }

  exportBudget() {
    download(`cubesat-budget.csv`, budgetCsv(this.config, this.flight));
    if (!this.exported) { this.exported = true; this.save(); this.evalTask(); }
  }

  /** Изометрия куба 1U: каркас, стек плат снизу вверх, солнечные панели и антенна */
  drawIso() {
    const cv = this.iso; if (!cv.isConnected || cv.offsetParent === null) return;
    const W = cv.clientWidth || 560, H = Math.round(W * 0.76), dpr = window.devicePixelRatio || 1;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + "px";
    const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const s = Math.min(W / 330, H / 260), cx = W * 0.36, cy = H * 0.66;
    const P = (x, y, z) => [cx + (x - y) * 0.866 * s, cy + (x + y) * 0.5 * s - z * s];
    const poly = (pts, fill, stroke, lw = 1) => { ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(...P(...q)) : ctx.moveTo(...P(...q)))); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } };
    const line = (a, b, color, lw) => { ctx.beginPath(); ctx.moveTo(...P(...a)); ctx.lineTo(...P(...b)); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke(); };
    const list = items(this.config);
    const frame = list.find((p) => p.cat === "frame");
    const S = 100;
    // тень и пол
    poly([[-8, -8, 0], [S + 8, -8, 0], [S + 8, S + 8, 0], [-8, S + 8, 0]], "rgba(15,23,42,.06)");
    const rail = frame ? (frame.id === "frame-alu" ? "#64748b" : frame.id === "frame-pcb" ? "#166534" : "#94a3b8") : "#cbd5e1";
    // задние ребра
    if (frame) {
      for (const [a, b] of [[[0, 0, 0], [0, 0, S]], [[0, 0, S], [S, 0, S]], [[0, 0, S], [0, S, S]], [[0, 0, 0], [S, 0, 0]], [[0, 0, 0], [0, S, 0]]]) line(a, b, rail, 3);
    } else {
      ctx.setLineDash([5, 5]);
      for (const [a, b] of [[[0, 0, 0], [S, 0, 0]], [[S, 0, 0], [S, S, 0]], [[S, S, 0], [0, S, 0]], [[0, S, 0], [0, 0, 0]], [[0, 0, S], [S, 0, S]], [[S, 0, S], [S, S, S]], [[S, S, S], [0, S, S]], [[0, S, S], [0, 0, S]], [[0, 0, 0], [0, 0, S]], [[S, 0, 0], [S, 0, S]], [[S, S, 0], [S, S, S]], [[0, S, 0], [0, S, S]]]) line(a, b, "#cbd5e1", 1.5);
      ctx.setLineDash([]);
    }
    // стек плат
    const boards = list.filter((p) => p.h);
    const limit = this.ins.stack.limit;
    let z = 6;
    const labels = [];
    for (const b of boards) {
      const z0 = z, z1 = z + b.h, over = z1 > limit + 6;
      const m = b.battery ? 14 : 8, a = m, c = S - m;
      poly([[a, c, z0], [c, c, z0], [c, c, z1], [a, c, z1]], shade(b.color, -0.18), over ? "#dc2626" : "rgba(15,23,42,.35)");
      poly([[c, a, z0], [c, c, z0], [c, c, z1], [c, a, z1]], shade(b.color, -0.32), over ? "#dc2626" : "rgba(15,23,42,.35)");
      poly([[a, a, z1], [c, a, z1], [c, c, z1], [a, c, z1]], b.battery ? shade(b.color, 0.1) : b.color, over ? "#dc2626" : "rgba(15,23,42,.45)");
      if (!b.battery && b.h <= 8) { // микросхема на плате
        poly([[40, 40, z1], [60, 40, z1], [60, 60, z1], [40, 60, z1]], "rgba(15,23,42,.55)");
      }
      labels.push({ y: P(c, a, (z0 + z1) / 2)[1], x: P(c, a, (z0 + z1) / 2)[0], text: b.name.replace(/[,:].*$/, ""), over });
      z = z1 + 2;
    }
    // передние ребра и грани
    if (frame) {
      const face = frame.id === "frame-pcb" ? "rgba(22,101,52,.10)" : "rgba(148,163,184,.10)";
      poly([[0, S, 0], [S, S, 0], [S, S, S], [0, S, S]], face);
      poly([[S, 0, 0], [S, S, 0], [S, S, S], [S, 0, S]], face);
      for (const [a, b] of [[[S, S, 0], [S, S, S]], [[S, 0, 0], [S, 0, S]], [[0, S, 0], [0, S, S]], [[0, S, S], [S, S, S]], [[S, 0, S], [S, S, S]], [[S, S, 0], [0, S, 0]], [[S, S, 0], [S, 0, 0]]]) line(a, b, rail, 3.2);
    }
    // солнечные панели на двух видимых гранях
    const solar = list.filter((p) => p.solar).length;
    const panel = (pts) => { poly(pts, "rgba(30,58,138,.82)", "#93c5fd", 1); };
    if (solar >= 1) panel([[8, S, 8], [S - 8, S, 8], [S - 8, S, S - 8], [8, S, S - 8]]);
    if (solar >= 2) panel([[S, 8, 8], [S, S - 8, 8], [S, S - 8, S - 8], [S, 8, S - 8]]);
    // антенна
    const ant = list.find((p) => p.cat === "antenna");
    if (ant && frame) {
      if (ant.id === "ant-spring433") {
        ctx.strokeStyle = "#475569"; ctx.lineWidth = 2; ctx.beginPath();
        for (let i = 0; i <= 60; i++) { const q = P(50 + 4 * Math.cos(i / 3), 50 + 4 * Math.sin(i / 3), S + i * 0.5); i ? ctx.lineTo(...q) : ctx.moveTo(...q); }
        ctx.stroke();
      } else {
        const len = ant.id === "ant-24" ? 45 : 95;
        line([50, 50, S], [50, 50, S + len], "#334155", 3);
        const tip = P(50, 50, S + len); ctx.fillStyle = "#334155"; ctx.beginPath(); ctx.arc(tip[0], tip[1], 3.5, 0, 7); ctx.fill();
      }
    }
    // подписи стека справа
    ctx.font = "600 11px Inter, system-ui, sans-serif"; ctx.textBaseline = "middle";
    const lx = P(S, 0, 0)[0] + 34;
    labels.sort((a, b) => b.y - a.y);
    let last = Infinity;
    for (const L of labels) {
      const y = Math.min(L.y, last - 14); last = y;
      ctx.strokeStyle = L.over ? "#dc2626" : "#94a3b8"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(L.x + 2, L.y); ctx.lineTo(lx - 4, y); ctx.stroke();
      ctx.fillStyle = L.over ? "#dc2626" : "#334155"; ctx.fillText(L.text, lx, y);
    }
    // надписи
    ctx.fillStyle = "#64748b"; ctx.font = "600 12px Inter, system-ui, sans-serif"; ctx.textBaseline = "alphabetic";
    ctx.fillText(frame ? `${frame.name.replace(/, .*$/, "")}: 100 × 100 × 100 мм` : "Выберите каркас 1U", 12, 20);
    const station = list.find((p) => p.cat === "station");
    ctx.fillText(station ? "Станция: " + station.name.replace(/^Станция /, "") : "Нет наземной станции", 12, H - 12);
    if (!boards.length) { ctx.fillStyle = "#94a3b8"; ctx.fillText("Добавляйте модули из каталога слева", P(50, 50, 50)[0] - 90, P(50, 50, 50)[1]); }
  }

  // ─────────────── Полет ───────────────
  run() {
    this.stopRun(true);
    if (!this.ins.checks.find((c) => c.key === "power_on").ok) {
      this.showTab("build"); this.toast("Спутник не включится: нужен бортовой компьютер и аккумулятор", "bad"); return;
    }
    this.res = null; this.renderFlightIdle("Полет рассчитывается...");
    this.btnRun.textContent = "■ Отмена"; this.btnRun.classList.add("on");
    const w = new Worker(WORKER_URL, { type: "module" });
    this.worker = w;
    this.killT = setTimeout(() => this.fail("Программа зависла: в бесконечном цикле нет sleep(). Время полета идет только в sleep() и при работе с датчиками."), TIMEOUT);
    w.onmessage = (e) => this.onDone(e.data);
    w.onerror = (e) => this.fail("Ошибка симулятора: " + (e.message || "worker"));
    w.postMessage({ type: "start", code: this.code(), config: this.config, flight: this.flight, mjsUrl: MP_BASE + "micropython.mjs", wasmUrl: MP_BASE + "micropython.wasm" });
  }

  stopRun(silent) {
    clearTimeout(this.killT);
    if (this.worker) { this.worker.terminate(); this.worker = null; if (!silent) this.renderFlightIdle(); }
    if (this.play) { cancelAnimationFrame(this.play.raf); this.play = null; }
    this.btnRun.textContent = "▶ Старт полета"; this.btnRun.classList.remove("on"); this.btnSkip.disabled = true;
  }

  fail(text) {
    this.stopRun(true);
    this.gsBox.innerHTML = "";
    const ex = explainError(text);
    this.log(ex.text, "err"); if (ex.hint) this.log("Подсказка: " + ex.hint, "hint");
    if (ex.line) this.gotoLine(ex.line);
  }

  onDone(m) {
    clearTimeout(this.killT);
    if (this.worker) { this.worker.terminate(); this.worker = null; }
    if (m.error || !m.res) { this.fail(m.error || "Полет не рассчитался"); return; }
    this.res = m.res;
    this.score = score(this.res, this.pd.mission || {});
    this.startReplay();
  }

  renderFlightIdle(text) {
    this.gsBox.innerHTML = "";
    this.log(text || "Нажмите «Старт полета». Программа выполнится на спутнике, а здесь появятся пакеты, которые примет станция.", "muted");
    this.hud.textContent = "";
    this.seriesSel.innerHTML = ""; this.series = [];
    this.drawScene(0); this.drawChart();
  }

  startReplay() {
    const res = this.res;
    this.gsBox.innerHTML = "";
    if (res.error) { const ex = explainError(res.error); this.log(ex.text, "err"); if (ex.hint) this.log("Подсказка: " + ex.hint, "hint"); if (ex.line) this.gotoLine(ex.line); }
    this.buildSeries();
    this.events = [
      ...res.packets.map((p) => ({ t: p.t, kind: "pkt", p })),
      ...res.prints.map((p) => ({ t: p.t, kind: "print", p })),
      ...res.photos.map((p) => ({ t: p.t, kind: "photo", p })),
      ...Object.entries({ tLaunch: "Старт! Аэростат пошел вверх", tTop: "Высота достигнута, висение", tDescend: "Начался спуск", tLand: "Посадка" })
        .map(([k, text]) => ({ t: res.flight[k], kind: "phase", text })),
    ];
    if (res.died) this.events.push({ t: res.died, kind: "died" });
    this.events.sort((a, b) => a.t - b.t);
    this.play = { t: 0, last: performance.now(), speed: +this.speedSel.value, ei: 0, raf: 0 };
    this.btnRun.textContent = "▶ Старт полета"; this.btnRun.classList.remove("on"); this.btnSkip.disabled = false;
    const step = (now) => {
      const pl = this.play; if (!pl) return;
      pl.t = Math.min(res.flight.tEnd, pl.t + ((now - pl.last) / 1000) * pl.speed); pl.last = now;
      this.flush(pl.t);
      this.drawScene(pl.t); this.drawChart(pl.t);
      if (pl.t >= res.flight.tEnd) { this.endReplay(); return; }
      pl.raf = requestAnimationFrame(step);
    };
    this.play.raf = requestAnimationFrame(step);
  }

  flush(t) {
    const pl = this.play;
    let n = 0;
    while (pl.ei < this.events.length && this.events[pl.ei].t <= t) {
      const e = this.events[pl.ei++];
      if (++n > 400) continue; // при «в конец» не выводим тысячи строк сразу
      if (e.kind === "pkt") {
        if (e.p.ok) this.log(`${fmtT(e.p.t)}  ${e.p.text}`, "", `RSSI ${fmt(e.p.rssi)} дБм`);
        else this.log(`${fmtT(e.p.t)}  пакет потерян`, "lost", e.p.rssi == null ? "нет связи" : `сигнал ${fmt(e.p.rssi)} дБм`);
      } else if (e.kind === "print") this.log(`${fmtT(e.t)}  [борт] ${e.p.text}`, "muted");
      else if (e.kind === "photo") this.log(`${fmtT(e.t)}  [борт] снимок ${e.p.name} на высоте ${fmt(e.p.alt)} м`, "muted");
      else if (e.kind === "phase") { this.log(`${fmtT(e.t)}  ${e.text}`, "phase"); this.toast(e.text); }
      else if (e.kind === "died") { this.log(`${fmtT(e.t)}  Аккумулятор разряжен, спутник выключился`, "err"); this.toast("Аккумулятор разряжен!", "bad"); }
    }
  }

  skip() { if (this.play) { this.play.t = this.res.flight.tEnd; this.play.last = performance.now(); } }

  endReplay() {
    const s = this.score;
    if (this.play) cancelAnimationFrame(this.play.raf);
    this.play = null; this.btnSkip.disabled = true;
    this.drawScene(this.res.flight.tEnd, true); this.drawChart();
    this.log(`Полет окончен. Принято ${s.stats.received} из ${s.stats.sent} пакетов за полет. Работа в полете: ${s.total} из 40. Подробности на вкладке «Разбор полета».`, "phase");
    this.evalTask(true);
  }

  gotoLine(n) {
    try { const line = this.py.state.doc.line(Math.min(n, this.py.state.doc.lines)); this.py.dispatch({ selection: { anchor: line.from, head: line.to }, scrollIntoView: true }); this.py.focus(); } catch (e) { /* нет строки */ }
  }

  log(text, kind = "", side = "") {
    const line = h("div", { class: kind ? "cs-l-" + kind : "" }, h("span", {}, text), side ? h("em", {}, side) : null);
    this.gsBox.append(line);
    while (this.gsBox.childNodes.length > 300) this.gsBox.firstChild.remove();
    this.gsBox.scrollTop = this.gsBox.scrollHeight;
  }

  /** Ряды для графика: настоящая высота, сигнал и числовые поля принятых пакетов */
  buildSeries() {
    const res = this.res, got = res.packets.filter((p) => p.ok);
    const series = [{ id: "alt", name: "Высота спутника, м (по симулятору)", pts: res.timeline.map((x) => [x.t, x.alt]), line: true }];
    const cols = Math.min(8, Math.max(0, ...got.slice(0, 50).map((p) => fields(p.text).length)));
    for (let i = 0; i < cols; i++) {
      const pts = got.map((p) => [p.t, fields(p.text)[i]]).filter((q) => Number.isFinite(q[1]));
      if (pts.length > 3) series.push({ id: "f" + i, name: `Телеметрия: поле ${i + 1}`, pts });
    }
    if (got.length) series.push({ id: "rssi", name: "Сигнал на станции (RSSI), дБм", pts: got.map((p) => [p.t, p.rssi]) });
    series.push({ id: "bat", name: "Заряд аккумулятора, %", pts: res.timeline.map((x) => [x.t, x.pct]), line: true });
    this.series = series;
    const keep = this.seriesSel.value;
    const tele = series.filter((x) => x.id.startsWith("f"));
    const defId = tele.length ? tele[tele.length - 1].id : "alt"; // последнее поле: обычно датчик, а не номер или время
    this.seriesSel.replaceChildren(...series.map((s) => h("option", { value: s.id, selected: s.id === keep || (!keep && s.id === defId) }, s.name)));
  }

  drawChart(tNow) {
    const cv = this.chart; if (cv.offsetParent === null) return;
    const W = cv.clientWidth || 760, H = 190, dpr = window.devicePixelRatio || 1;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + "px";
    const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.font = "11px Inter, system-ui, sans-serif"; ctx.fillStyle = "#94a3b8";
    const s = (this.series || []).find((x) => x.id === this.seriesSel.value);
    if (!this.res || !s) { ctx.fillText("График появится после полета", 12, 24); return; }
    const fl = this.res.flight, L = 46, R = W - 10, T = 10, B = H - 22;
    const ys = s.pts.map((q) => q[1]);
    let lo = Math.min(...ys), hi = Math.max(...ys); if (hi - lo < 1e-6) { hi += 1; lo -= 1; }
    const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
    const X = (t) => L + ((R - L) * t) / fl.tEnd, Y = (v) => B - ((B - T) * (v - lo)) / (hi - lo);
    // фазы полета
    for (const [a, b, c] of [[fl.tLaunch, fl.tTop, "rgba(14,165,233,.07)"], [fl.tTop, fl.tDescend, "rgba(99,102,241,.08)"], [fl.tDescend, fl.tLand, "rgba(14,165,233,.07)"]]) { ctx.fillStyle = c; ctx.fillRect(X(a), T, X(b) - X(a), B - T); }
    ctx.strokeStyle = "#e2e8f0"; ctx.fillStyle = "#64748b"; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const v = lo + ((hi - lo) * i) / 4, y = Y(v); ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke(); ctx.fillText(fmt(v, Math.abs(hi - lo) < 10 ? 1 : 0), 4, y + 4); }
    for (let m = 0; m * 60 <= fl.tEnd; m += Math.max(1, Math.round(fl.tEnd / 60 / 8))) ctx.fillText(m + " мин", X(m * 60) - 10, H - 6);
    const until = tNow == null ? Infinity : tNow;
    ctx.strokeStyle = "#2563eb"; ctx.fillStyle = "#2563eb"; ctx.lineWidth = 1.8;
    if (s.line) { ctx.beginPath(); let first = true; for (const [t, v] of s.pts) { if (t > until) break; first ? ctx.moveTo(X(t), Y(v)) : ctx.lineTo(X(t), Y(v)); first = false; } ctx.stroke(); }
    else for (const [t, v] of s.pts) { if (t > until) break; ctx.fillRect(X(t) - 1, Y(v) - 1, 2.4, 2.4); }
    if (tNow != null) { ctx.strokeStyle = "rgba(234,88,12,.7)"; ctx.beginPath(); ctx.moveTo(X(tNow), T); ctx.lineTo(X(tNow), B); ctx.stroke(); }
  }

  /** Вид сбоку: станция, лебедка, трос, аэростат и спутник; пакеты летят к станции */
  drawScene(t, end) {
    const cv = this.scene; if (cv.offsetParent === null) return;
    const W = cv.clientWidth || 760, H = Math.round(Math.min(360, Math.max(240, W * 0.43))), dpr = window.devicePixelRatio || 1;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + "px";
    const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const fl = (this.res && this.res.flight) || flightPlan(this.flight);
    const ground = H - 34, top = 78;
    const k = (ground - top) / (fl.altMax * 1.05);
    const sx = 70, lx = Math.min(W - 120, Math.max(sx + 140, sx + fl.station * k * 1.6));
    const tl = this.res ? this.res.timeline[Math.min(this.res.timeline.length - 1, Math.floor(t))] : null;
    const alt = tl ? tl.alt : 0;
    // небо темнеет с высотой
    const g = ctx.createLinearGradient(0, 0, 0, ground);
    g.addColorStop(0, "#1e3a8a"); g.addColorStop(0.55, "#60a5fa"); g.addColorStop(1, "#dbeafe");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, ground);
    ctx.fillStyle = "#65a30d"; ctx.fillRect(0, ground, W, H - ground); ctx.fillStyle = "#4d7c0f"; ctx.fillRect(0, ground, W, 4);
    // шкала высоты
    ctx.font = "11px Inter, system-ui, sans-serif"; ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.lineWidth = 1;
    const stepM = fl.altMax > 1200 ? 500 : fl.altMax > 600 ? 200 : 100;
    for (let a = stepM; a <= fl.altMax * 1.04; a += stepM) { const y = ground - a * k; ctx.beginPath(); ctx.moveTo(W - 50, y); ctx.lineTo(W - 8, y); ctx.stroke(); ctx.fillText(a + " м", W - 46, y - 3); }
    // станция
    const st = items(this.config).find((p) => p.cat === "station");
    ctx.fillStyle = "#334155"; ctx.fillRect(sx - 22, ground - 16, 44, 16); ctx.fillStyle = "#93c5fd"; ctx.fillRect(sx - 18, ground - 30, 26, 14);
    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx + 14, ground - 16); ctx.lineTo(sx + 14, ground - 52); ctx.stroke();
    const satY = ground - alt * k - 8, satX = lx + (tl ? Math.sin(t / 3.1) * 4 : 0);
    if (st && !st.omni) { // направленная антенна смотрит на спутник
      const ang = Math.atan2(satY - (ground - 52), satX - (sx + 14));
      ctx.save(); ctx.translate(sx + 14, ground - 52); ctx.rotate(ang); ctx.strokeStyle = "#0f172a"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(26, 0);
      for (let i = 0; i < 4; i++) { ctx.moveTo(6 + i * 6, -6 + i); ctx.lineTo(6 + i * 6, 6 - i); } ctx.stroke(); ctx.restore();
    }
    ctx.fillStyle = "#0f172a"; ctx.font = "600 11px Inter, system-ui, sans-serif"; ctx.fillText("Станция", sx - 22, ground + 16);
    // лебедка, трос, аэростат
    ctx.fillStyle = "#78350f"; ctx.fillRect(lx - 14, ground - 10, 28, 10);
    ctx.strokeStyle = "rgba(15,23,42,.6)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx, ground - 10); ctx.lineTo(satX, satY - 30); ctx.stroke();
    ctx.fillStyle = "#f8fafc"; ctx.beginPath(); ctx.ellipse(satX, satY - 48, 26, 18, 0, 0, 7); ctx.fill(); ctx.strokeStyle = "#94a3b8"; ctx.stroke();
    ctx.strokeStyle = "rgba(15,23,42,.7)"; ctx.beginPath(); ctx.moveTo(satX, satY - 30); ctx.lineTo(satX, satY - 6); ctx.stroke();
    // спутник: куб, повернутый по курсу (ширина видимой грани меняется)
    const yaw = tl ? (tl.yaw * Math.PI) / 180 : 0.5, w1 = 12 * Math.abs(Math.cos(yaw)), w2 = 12 * Math.abs(Math.sin(yaw));
    ctx.fillStyle = "#e2e8f0"; ctx.fillRect(satX - (w1 + w2) / 2, satY - 6, w1, 12); ctx.fillStyle = "#94a3b8"; ctx.fillRect(satX - (w1 + w2) / 2 + w1, satY - 6, w2, 12);
    ctx.strokeStyle = "#0f172a"; ctx.strokeRect(satX - (w1 + w2) / 2, satY - 6, w1 + w2, 12);
    ctx.fillText("Лебедка", lx - 22, ground + 16);
    // последние пакеты: линия к станции
    if (this.res && !end) {
      const recent = this.res.packets.filter((p) => p.t <= t && p.t > t - Math.max(0.6, (this.play ? this.play.speed : 30) / 40));
      for (const p of recent.slice(-3)) {
        const a = 1 - (t - p.t) / Math.max(0.6, (this.play ? this.play.speed : 30) / 40);
        ctx.strokeStyle = p.ok ? `rgba(34,197,94,${0.9 * a})` : `rgba(239,68,68,${0.9 * a})`; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
        ctx.beginPath(); ctx.moveTo(satX, satY); ctx.lineTo(sx + 14, ground - 52); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    // HUD
    if (this.res && tl) {
      const got = this.res.packets.filter((p) => p.t <= t && p.ok).length, sent = this.res.packets.filter((p) => p.t <= t).length;
      const last = [...this.res.packets].reverse().find((p) => p.t <= t && p.ok);
      this.hud.replaceChildren(
        h("span", {}, h("b", {}, fmtT(t)), " " + (PHASE[tl.phase] || "")), h("span", {}, `высота ${fmt(alt)} м`), h("span", {}, `воздух ${fmt(tl.temp, 1)} °C`),
        h("span", { class: tl.alive ? "" : "bad" }, tl.alive ? `заряд ${tl.pct}%` : "выключен"),
        h("span", {}, `принято ${got} из ${sent}`), last ? h("span", {}, `RSSI ${fmt(last.rssi)} дБм`) : null);
    } else if (!this.res) {
      ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.font = "600 13px Inter, system-ui, sans-serif";
      ctx.fillText(`Привязной аэростат: подъем до ${fl.altMax} м, станция в ${fl.station} м от старта`, 14, 24);
    }
  }

  // ─────────────── Разбор полета ───────────────
  renderDebrief() {
    const box = this.debriefBox; box.innerHTML = "";
    if (!this.res) { box.append(h("div", { class: "cs-empty" }, "Здесь появится разбор после полета: баллы по критерию «Работа в полете», потери пакетов, данные для отчета.")); return; }
    const s = this.score, res = this.res, fl = res.flight;
    box.append(
      h("div", { class: "cs-score" }, h("div", { class: "cs-score-n" }, String(s.total), h("small", {}, " / 40")),
        h("div", {}, h("b", {}, "Работа в полете (FLT)"), h("p", { class: "cs-muted" }, "Оценка симулятора по критериям финала WSO. Данные (DAT), анализ (ANL), презентацию (PRS) и инженерное решение (ENG) судьи оценивают по отчету и защите команды."))),
      h("table", { class: "cs-table" }, h("tbody", {}, s.items.map((x) => h("tr", { class: x.points >= x.max ? "ok" : x.points ? "part" : "bad" },
        h("td", {}, x.key), h("td", {}, x.label, h("div", { class: "cs-muted" }, x.value)), h("td", { class: "cs-pts" }, `${x.points} / ${x.max}`))))),
      h("div", { class: "cs-stats" },
        stat("Передано за полет", s.stats.sent), stat("Принято", s.stats.received), stat("Потери", s.stats.loss + "%"), stat("Самый длинный перерыв", fmt(s.stats.gap, 1) + " с"),
        stat("Строк на борту", s.stats.sd), stat("Снимков", s.stats.photos), stat("Заряд в конце", (res.timeline[res.timeline.length - 1] || {}).pct + "%"),
        stat("Длительность", fmt(fl.tEnd / 60, 1) + " мин")),
      h("div", { class: "cs-downloads" },
        h("button", { type: "button", class: "cs-btn", onclick: () => download("ground-station.csv", "t;rssi;packet\n" + res.packets.filter((p) => p.ok).map((p) => `${p.t};${p.rssi};${p.text}`).join("\n")) }, "⭳ Принято станцией, CSV"),
        h("button", { type: "button", class: "cs-btn", disabled: !res.sd.length, onclick: () => download("data.csv", res.sd.map((x) => x.text).join("\n")) }, "⭳ Файл с борта data.csv"),
        h("button", { type: "button", class: "cs-btn", onclick: () => download("flight-truth.csv", "t;alt_m;pressure_hpa;air_temp_c;battery_pct\n" + res.timeline.map((x) => `${x.t};${x.alt};${x.p};${x.temp};${x.pct}`).join("\n")) }, "⭳ Настоящие значения, CSV")),
      h("p", { class: "cs-muted" }, "Сравните данные с борта и со станции, постройте профиль температуры по высоте и объясните потери пакетов: это материал для раздела «Анализ» в отчете."));
    if (res.photos.length) {
      const strip = h("div", { class: "cs-photos" });
      const pick = res.photos.filter((_, i) => i % Math.ceil(res.photos.length / 8) === 0).slice(0, 8);
      for (const p of pick) { const c = h("canvas", { width: 160, height: 120 }); drawPhoto(c, p, fl); strip.append(h("figure", {}, c, h("figcaption", {}, `${p.name}, ${fmt(p.alt)} м`))); }
      box.append(h("h5", {}, `Снимки с борта: ${res.photos.length}`), strip);
    }
  }

  // ─────────────── Задание ───────────────
  renderTask() {
    const pd = this.pd, box = this.taskBox; box.innerHTML = "";
    box.append(h("div", { class: "cs-task-k" }, "WSO · CubeSat 1U"), h("h4", {}, pd.title || "Свободная сборка и полет"));
    for (const line of (pd.task || "").split("\n")) if (line) box.append(h("p", {}, line));
    this.checkList = h("ul", { class: "cs-checks" });
    this.doneEl = h("div", { class: "cs-done", hidden: true }, "Задание выполнено! Отметьте урок как пройденный.");
    if (pd.checks && pd.checks.length) {
      box.append(h("p", { class: "cs-muted" }, needsFlight(pd.checks) ? "Пункты про сборку проверяются сразу, про полет - после каждого полета." : "Проверка идет сразу, пока вы собираете спутник."), this.checkList, this.doneEl);
    } else box.append(h("p", { class: "cs-muted" }, "Свободный режим: без проверок. Попробуйте разные сборки и посмотрите, как меняются масса, энергия и связь."));
  }

  evalTask(announce) {
    if (!this.pd || !this.checkList) return;
    const checks = this.pd.checks || [];
    if (!checks.length) return;
    const ev = evalChecks(checks, { config: this.config, flight: this.flight, res: this.play ? null : this.res, mission: this.pd.mission, extra: { exported: this.exported } });
    this.checkList.replaceChildren(...checks.map((c, i) => {
      const r = ev.results[i];
      return h("li", { class: r.ok ? "ok" : r.pending ? "" : "bad" }, h("span", {}, c.label), r.value && !r.pending ? h("em", {}, r.value) : null);
    }));
    this.doneEl.hidden = !ev.all;
    if (ev.all && !this.solvedSent) {
      this.solvedSent = true;
      this.toast("Задание выполнено!", "ok");
      if (window.academySolved) window.academySolved(this.presetName);
    }
    void announce;
  }

  renderHelp() {
    const api = [
      ["from sat import *", "подключить все модули спутника (первая строка программы)"],
      ["sleep(1)", "подождать 1 секунду; время полета идет в sleep() и при работе с датчиками"],
      ["time()", "секунды с включения; аэростат стартует через 60 с после включения"],
      ["bme.pressure(), bme.temperature(), bme.humidity()", "давление (гПа), температура внутри корпуса (°C), влажность (%)"],
      ["imu.accel(), imu.gyro()", "ускорение (x, y, z) в м/с², вращение (x, y, z) в °/с"],
      ["gps.position()", "(широта, долгота, высота) или None до фиксации"],
      ["light.lux(), co2.ppm()", "освещенность (лк), CO2 (ppm)"],
      ["camera.capture()", "снимок на накопитель (0,8 с), возвращает имя файла"],
      ["radio.send(line)", "передать строку на станцию; длина не больше лимита модуля"],
      ["sd.write(line)", "записать строку в data.csv на борту"],
      ["battery.voltage(), battery.percent()", "напряжение (В) и заряд (%)"],
    ];
    this.helpBox.replaceChildren(
      h("h4", {}, "Как это устроено"),
      h("p", {}, "По правилам World Space Olympiad команда собирает CubeSat 1U: куб 100 мм, не тяжелее 800 г, с бортовым компьютером, питанием, радио, полезной нагрузкой и своей наземной станцией. На финале спутник поднимают на привязном аэростате (до 2000 м), телеметрия идет на станцию в реальном времени и пишется на борт."),
      h("p", {}, "В симуляторе три шага: соберите спутник в конструкторе (масса, стек плат, энергия, радиолиния), напишите бортовую программу на MicroPython и запустите полет. Программа выполняется на настоящем интерпретаторе MicroPython в браузере, время полета виртуальное: весь полет считается за секунды, потом проигрывается."),
      h("h5", {}, "Модуль sat"),
      h("table", { class: "cs-table cs-api" }, h("tbody", {}, api.map(([a, b]) => h("tr", {}, h("td", {}, h("code", {}, a)), h("td", {}, b))))),
      h("h5", {}, "Радиолиния"),
      h("p", {}, "Мощность на входе приемника = мощность передатчика + усиление антенн - потери в пространстве - потери на кабелях и корпусе. Запас = принятая мощность - чувствительность приемника. Штыревая антенна плохо излучает вверх, поэтому самая трудная точка часто не самая дальняя, а над станцией. Оставляйте запас 10 дБ и больше: спутник вращается и раскачивается на тросе."),
      h("h5", {}, "Пример: телеметрия раз в секунду"),
      h("pre", { class: "cs-pre" }, 'from sat import *\n\nn = 0\nwhile True:\n    line = "%d,%.1f,%.2f" % (n, time(), bme.pressure())\n    sd.write(line)\n    radio.send(line)\n    n += 1\n    sleep(1)'),
      h("p", { class: "cs-muted" }, "Массы, мощности и чувствительности в каталоге - типичные значения распространенных модулей. Для документации команды берите паспорта своих компонентов."));
  }

  drawAll() { if (!this.config) return; this.drawIso(); this.drawScene(this.play ? this.play.t : this.res ? this.res.flight.tEnd : 0, !this.play && !!this.res); this.drawChart(this.play ? this.play.t : undefined); }
}

function fmtT(t) { const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`; }
function stat(label, value) { return h("div", { class: "cs-stat" }, h("div", { class: "cs-stat-v" }, String(value)), h("div", { class: "cs-stat-l" }, label)); }

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = (c) => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

/** «Снимок» с борта: земля внизу, горизонт наклонен раскачкой, поля мельче с высотой */
function drawPhoto(cv, p, fl) {
  const ctx = cv.getContext("2d"), W = cv.width, H = cv.height;
  let seed = Math.round(p.t * 1000) % 2147483647 || 1;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const horizon = H * (0.28 + 0.12 * Math.sin(p.yaw / 40));
  const sky = ctx.createLinearGradient(0, 0, 0, horizon); sky.addColorStop(0, "#1d4ed8"); sky.addColorStop(1, "#bfdbfe");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(W / 2, horizon); ctx.rotate(Math.sin(p.t / 3.1) * 0.12); ctx.translate(-W / 2, -horizon);
  ctx.fillStyle = "#a3b18a"; ctx.fillRect(-20, horizon, W + 40, H);
  const cell = Math.max(4, 40 - (p.alt / fl.altMax) * 32);
  const cols = ["#7c9a5e", "#b5a36a", "#5f7f45", "#c9b98a", "#8aa66a"];
  for (let y = horizon; y < H + 10; y += cell * (0.5 + (y - horizon) / H)) {
    for (let x = -20; x < W + 20; x += cell * 1.6) { ctx.fillStyle = cols[Math.floor(rnd() * cols.length)]; ctx.fillRect(x, y, cell * 1.6 - 1, cell * (0.5 + (y - horizon) / H) - 1); }
  }
  ctx.restore();
  ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(0, H - 14, W, 14); ctx.fillStyle = "#fff"; ctx.font = "10px monospace"; ctx.fillText(`${Math.round(p.alt)} m  t=${Math.round(p.t)}s`, 4, H - 4);
}

const instances = [];
function mount() {
  for (const node of document.querySelectorAll(".cubesat-embed, [class*='cubesat-sim-']")) {
    if (node.dataset.mounted) continue;
    node.dataset.mounted = "1";
    const m = node.className.match(/cubesat-sim-([\w-]+)/);
    const preset = m ? "cubesat-" + m[1].replace(/^cubesat-/, "") : "cubesat-sandbox";
    const wrap = document.createElement("div");
    node.replaceWith(wrap);
    instances.push(new CubeSatSim(wrap, { preset }));
  }
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
window.USTEMCubeSat = { CubeSatSim, mount, instances };
