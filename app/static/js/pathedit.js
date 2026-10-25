/* Конструктор пути в Студии: этапы и шаги редактируются в браузере, при сохранении уходят JSON в поле stages. */
(() => {
  const data = JSON.parse(document.getElementById("pe-data").textContent);
  const L = data.L, R = data.R, LOC = ["ru", "kk", "en"];
  const root = document.getElementById("pe-stages");
  let stages = data.stages || [];

  const el = (tag, attrs = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") e.className = v;
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) e.setAttribute(k, v === true ? "" : v);
    }
    kids.flat().forEach((c) => c != null && e.append(c.nodeType ? c : document.createTextNode(c)));
    return e;
  };
  const ml = (obj, key, label, opts = {}) => el("div", { class: opts.wide ? "md:col-span-2" : "" },
    el("label", { class: "label" }, label),
    el("div", { class: "grid grid-cols-3 gap-1" }, LOC.map((l) => {
      const inp = el("input", { class: "input py-1.5 text-sm", placeholder: l.toUpperCase(), value: (obj[key] || {})[l] || "",
        "aria-label": `${label} ${l.toUpperCase()}`, required: l === "ru" && opts.required });
      inp.addEventListener("input", () => { obj[key] = { ...(obj[key] || {}), [l]: inp.value }; });
      return inp;
    })));
  const field = (label, input) => el("div", {}, el("label", { class: "label" }, label), input);
  const bind = (inp, obj, key, conv = (v) => v) => { inp.addEventListener("input", () => { obj[key] = conv(inp.type === "checkbox" ? inp.checked : inp.value); }); inp.addEventListener("change", () => { obj[key] = conv(inp.type === "checkbox" ? inp.checked : inp.value); }); return inp; };
  const select = (opts, value, onChange) => {
    const s = el("select", { class: "input py-1.5 text-sm" }, opts.map(([v, t]) => el("option", { value: v, selected: v === value }, t)));
    s.addEventListener("change", () => onChange(s.value));
    return s;
  };
  const move = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; render(); };
  const tools = (arr, i) => el("div", { class: "flex gap-1 shrink-0" },
    el("button", { type: "button", class: "btn-icon", title: L.up, "aria-label": L.up, onclick: () => move(arr, i, -1) }, "↑"),
    el("button", { type: "button", class: "btn-icon", title: L.down, "aria-label": L.down, onclick: () => move(arr, i, 1) }, "↓"),
    el("button", { type: "button", class: "btn-icon hover:text-rose-600", title: L.remove, "aria-label": L.remove,
      onclick: () => { arr.splice(i, 1); render(); } }, "✕"));

  const kindFields = (step) => {
    const box = el("div", { class: "grid sm:grid-cols-3 gap-2" });
    if (step.kind === "self" || step.kind === "connect") {
      box.append(field(L.xp, bind(el("input", { type: "number", min: 0, max: 3000, class: "input py-1.5 text-sm", value: step.xp ?? 50 }), step, "xp", Number)));
    }
    if (step.kind === "self") {
      const cb = bind(el("input", { type: "checkbox", checked: !!step.photo }), step, "photo");
      box.append(el("label", { class: "flex items-center gap-2 text-sm pt-6" }, cb, L.photo));
    } else if (step.kind === "connect") {
      box.append(field(L.rule, select(data.rules.map((r) => [r, R[r]]), step.rule || "", (v) => { step.rule = v; render(); })));
      if (["approved", "played", "award", "advanced"].includes(step.rule)) {
        const kinds = new Set(step.kinds || []);
        box.append(el("div", { class: "sm:col-span-3" }, el("div", { class: "label" }, L.kinds),
          el("div", { class: "flex flex-wrap gap-2" }, data.event_kinds.map((k) => {
            const cb = el("input", { type: "checkbox", checked: kinds.has(k) });
            cb.addEventListener("change", () => { cb.checked ? kinds.add(k) : kinds.delete(k); step.kinds = [...kinds]; });
            return el("label", { class: "flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-100" }, cb, k);
          }))));
      }
      if (step.rule === "roster") {
        box.append(field("min", bind(el("input", { type: "number", min: 1, max: 50, class: "input py-1.5 text-sm", value: step.min ?? 2 }), step, "min", Number)));
        box.append(field("max", bind(el("input", { type: "number", min: 1, max: 50, class: "input py-1.5 text-sm", value: step.max ?? 10 }), step, "max", Number)));
      }
    } else if (step.kind === "course") {
      box.append(field(L.course, select([["", "-"], ...data.courses.map((c) => [c.slug, c.title])], step.course || "", (v) => { step.course = v; render(); })));
      const c = data.courses.find((x) => x.slug === step.course);
      const n = c ? c.levels : 5;
      box.append(field(L.level, select(Array.from({ length: n }, (_, i) => [String(i + 1), String(i + 1)]), String(step.level || 1), (v) => { step.level = Number(v); })));
    } else if (step.kind === "sim") {
      box.append(field(L.preset, bind(el("input", { class: "input py-1.5 text-sm", value: step.preset || "", placeholder: "spike-line" }), step, "preset", (v) => v.trim())));
    }
    return box;
  };

  const stepCard = (stage, step, i) => el("div", { class: "rounded-lg border border-slate-200 p-3 space-y-2 bg-white" },
    el("div", { class: "flex items-end gap-2" },
      el("div", { class: "flex-1" }, field(L.kind, select(["self", "connect", "course", "sim"].map((k) => [k, L["k_" + k]]), step.kind,
        (v) => { step.kind = v; if (v === "connect" && !step.rule) step.rule = "team"; render(); }))),
      tools(stage.steps, i)),
    el("div", { class: "grid md:grid-cols-2 gap-2" }, ml(step, "title", L.title, { required: true }), ml(step, "hint", L.hint)),
    kindFields(step));

  const stageCard = (stage, i) => el("section", { class: "card p-4 space-y-3", style: "border-left: 4px solid var(--pe-c, #0085ff)" },
    el("div", { class: "flex items-start gap-3" },
      el("div", { class: "w-9 h-9 rounded-lg bg-slate-800 text-white font-bold grid place-items-center shrink-0" }, String(i + 1)),
      el("div", { class: "flex-1 grid md:grid-cols-[1fr_180px] gap-3" },
        ml(stage, "title", L.stage, { required: true }),
        field(L.icon, select(data.icons.map((x) => [x, x]), stage.icon || "flag", (v) => { stage.icon = v; }))),
      tools(stages, i)),
    el("div", { class: "space-y-2 pl-12" }, (stage.steps || []).map((s, j) => stepCard(stage, s, j)),
      el("button", { type: "button", class: "btn-secondary btn-sm", onclick: () => { (stage.steps ||= []).push({ kind: "self", xp: 50, title: {} }); render(); } }, "+ " + L.add_step)));

  function render() {
    root.replaceChildren(...stages.map(stageCard));
    root.style.setProperty("--pe-c", document.getElementById("pe-color").value);
  }
  document.getElementById("pe-add-stage").addEventListener("click", () => { stages.push({ icon: "flag", title: {}, steps: [] }); render(); });
  document.getElementById("pe-color").addEventListener("input", (e) => root.style.setProperty("--pe-c", e.target.value));
  document.getElementById("path-form").addEventListener("submit", () => { document.getElementById("pe-json").value = JSON.stringify(stages); });
  render();
})();
