// Казахский язык для всех симуляторов лаборатории. Включается, когда у страницы <html lang="kk">.
// Строки интерфейса остаются русскими в коде; словарь i18n/kk.json (ru -> kk, собирает i18n/merge.mjs) грузится
// только для казахской страницы, а перевод делают:
//  - localize(root): текст и подписи (title, placeholder, aria-label) внутри корня симулятора, в том числе
//    появившиеся позже (MutationObserver);
//  - tr(s): для текста, который рисуется на canvas, в confirm/alert, в определениях блоков;
//  - trCode(code): комментарии (и, если нужно, строки) в стартовом коде заданий и примеров.
// Код в редакторе, ввод пользователя и вывод его программы не трогаем; в консолях переводим только строки,
// которые целиком совпадают со словарем (сообщения самих симуляторов).

const CYR = /[А-Яа-яЁё]/;
const W = "А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІіA-Za-z0-9_";
export const LANG = typeof document !== "undefined" ? (document.documentElement.lang || "ru").slice(0, 2) : "ru";
export const KK = LANG === "kk";
const SKIP = ".cm-editor, .cm-content, textarea, input, script, style, [data-notr], .blocklyHtmlInput";
const LINES = "[data-tr=lines], .lab-serial, .sp-console, .sl-console, .sl-shell-b, .rl-shell-b, .ftc-hub-tel, .ftc-hub-log";

const exact = new Map();
const pats = [];
const inner = [];
let fragRe = null;
const fragMap = new Map();
const cache = new Map();
let loaded = false;

function staticBase() {
  const s = [...document.scripts].map((x) => x.src).find((u) => /\/static\/js\//.test(u));
  return s ? s.replace(/\/static\/js\/.*$/, "/static/") : "/static/";
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const norm = (s) => s.replace(/\s+/g, " ").trim();

function build(d) {
  const frags = [];
  for (const [ru, kk] of Object.entries(d)) {
    if (!kk || kk === ru) continue;
    if (/\{\d*\}/.test(ru)) {
      let n = 0;
      const re = new RegExp("^" + esc(ru).replace(/\\\{\d*\\\}/g, () => { n++; return "([\\s\\S]+?)"; }) + "$");
      let k = 0;
      const out = kk.replace(/\{(\d*)\}/g, (_, i) => "$" + (i ? +i : ++k));
      pats.push([re, out, ru.length]);
      // тот же шаблон внутри длинного текста (подстановки - одно «слово»)
      if (ru.replace(/\{\d*\}/g, "").trim().length >= 5) {
        let j = 0;
        inner.push([new RegExp(esc(ru).replace(/\\\{\d*\\\}/g, () => { j++; return "([^\\s,;:()]+)"; }), "g"), out, ru.length]);
      }
      for (const piece of ru.split(/\{\d*\}/)) { const p = piece.trim(); if (p.length >= 4 && CYR.test(p) && d[p] && d[p] !== p) frags.push(p); }
    } else {
      exact.set(ru, kk);
      if (ru.length >= 3) { frags.push(ru); fragMap.set(ru, kk); }
    }
  }
  pats.sort((a, b) => b[2] - a[2]);
  inner.sort((a, b) => b[2] - a[2]);
  for (const p of frags) if (!fragMap.has(p)) fragMap.set(p, d[p]);
  const list = [...new Set(frags)].sort((a, b) => b.length - a.length).map(esc);
  if (list.length) fragRe = new RegExp(`(?<![${W}])(?:${list.join("|")})(?![${W}])`, "g");
  loaded = true;
}

export const ready = KK && typeof fetch !== "undefined"
  ? fetch(staticBase() + "lab/i18n/kk.json", { cache: "force-cache" }).then((r) => r.json()).then(build).catch(() => {})
  : Promise.resolve();

function whole(t) {
  const e = exact.get(t);
  if (e != null) return e;
  for (const [re, out] of pats) if (re.test(t)) return t.replace(re, (...m) => out.replace(/\$(\d+)/g, (_, i) => { const v = m[+i]; return v == null ? "" : tr(v); }));
  return null;
}

/** Перевести строку (точное совпадение, шаблон с {}, затем знакомые куски фразы). */
export function tr(s, linesOnly = false) {
  if (!KK || !loaded || typeof s !== "string" || !CYR.test(s)) return s;
  const key = (linesOnly ? "\u0001" : "") + s;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const lead = s.match(/^\s*/)[0], tail = s.match(/\s*$/)[0];
  const t = norm(s);
  let r = whole(t);
  if (r == null && !linesOnly) {
    r = t;
    for (const [re, out] of inner) if (re.test(r)) { re.lastIndex = 0; r = r.replace(re, (...m) => out.replace(/\$(\d+)/g, (_, i) => m[+i] ?? "")); }
    if (fragRe) r = r.replace(fragRe, (m) => fragMap.get(m) ?? m);
  }
  const res = r == null || r === t ? s : lead + r + tail;
  if (cache.size > 20000) cache.clear();
  cache.set(key, res);
  return res;
}

/** Консоль: переводим только строки, которые целиком есть в словаре. */
function trLines(s) {
  if (!CYR.test(s)) return s;
  return s.split("\n").map((line) => {
    const t = norm(line);
    let r = whole(t);
    if (r == null) { // «ValueError: текст», «>>> текст»: префикс оставляем
      const m = t.match(/^([\w.]*(?:Error|Exception|Warning)?:\s*|>>>\s*|\[[^\]]*\]\s*)(.+)$/);
      if (m) { const w = whole(m[2]); if (w != null) r = m[1] + w; }
    }
    return r == null ? line : line.replace(t, r);
  }).join("\n");
}

/** Комментарии (и строки в кавычках, если strings) в коде: // ..., # ..., "...". */
export function trCode(code, { strings = false } = {}) {
  if (!KK || !loaded || typeof code !== "string" || !CYR.test(code)) return code;
  let out = code.replace(/(\/\/|#)([^\n]*)/g, (m, mark, text) => {
    if (!CYR.test(text)) return m;
    if (mark === "#" && /^#\s*(include|define|if|endif|pragma)/.test(m)) return m;
    // комментарий может идти после строки с кавычками: переводим только сам комментарий
    return mark + text.replace(/^(\s*)(.*?)(\s*)$/, (_, a, b, c) => a + tr(b) + c);
  });
  if (strings) out = out.replace(/(["'])((?:(?!\1)[^\n\\]|\\.)*[А-Яа-я](?:(?!\1)[^\n\\]|\\.)*)\1/g, (m, q, text) => q + tr(text).replace(new RegExp(q, "g"), "\\" + q) + q);
  return out;
}

const last = new WeakMap();
function fixText(node) {
  const v = node.nodeValue;
  if (!v || !CYR.test(v) || last.get(node) === v) return;
  const p = node.parentElement;
  if (!p || p.closest(SKIP)) return;
  const r = p.closest(LINES) ? trLines(v) : tr(v);
  last.set(node, r);
  if (r !== v) node.nodeValue = r;
}
const ATTRS = ["title", "placeholder", "aria-label", "data-tip", "label"];
function fixAttrs(el) {
  if (el.closest && el.closest(SKIP) && !el.matches("input, textarea")) return;
  for (const a of ATTRS) {
    const v = el.getAttribute && el.getAttribute(a);
    if (v && CYR.test(v)) { const r = tr(v); if (r !== v) el.setAttribute(a, r); }
  }
}
function sweep(root) {
  if (root.nodeType === 3) { fixText(root); return; }
  if (root.nodeType !== 1) return;
  if (root.matches(".cm-editor, script, style")) return;
  fixAttrs(root);
  const it = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: (n) => (n.nodeType === 1 && n.matches(".cm-editor, script, style") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let n = it.nextNode(); n; n = it.nextNode()) { if (n.nodeType === 3) fixText(n); else fixAttrs(n); }
}

let patched = false;
function patchGlobals() {
  if (patched) return; patched = true;
  // текст на canvas (графики, подписи сцены, приборы) и стандартные окна
  const C = typeof CanvasRenderingContext2D !== "undefined" ? CanvasRenderingContext2D.prototype : null;
  if (C) for (const f of ["fillText", "strokeText", "measureText"]) { const o = C[f]; C[f] = function (t, ...a) { return o.call(this, tr(String(t)), ...a); }; }
  const O = typeof OffscreenCanvasRenderingContext2D !== "undefined" ? OffscreenCanvasRenderingContext2D.prototype : null;
  if (O) for (const f of ["fillText", "strokeText", "measureText"]) { const o = O[f]; O[f] = function (t, ...a) { return o.call(this, tr(String(t)), ...a); }; }
  for (const f of ["alert", "confirm", "prompt"]) { const o = window[f]; if (o) window[f] = (m, ...a) => o.call(window, tr(String(m ?? "")), ...a); }
}

/** Переводить все, что появляется внутри корня симулятора. */
export function localize(root) {
  if (!KK || !root) return;
  ready.then(() => {
    if (!loaded) return;
    patchGlobals();
    sweep(root);
    new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === "characterData") fixText(m.target);
        else if (m.type === "attributes") fixAttrs(m.target);
        else for (const n of m.addedNodes) sweep(n);
      }
    }).observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  });
}

/** Стартовый код задания: перевести комментарии (строки в кавычках не трогаем: на них могут опираться проверки). */
export function trPreset(pd, keys = ["code", "python"]) {
  if (!KK || !pd || typeof pd !== "object") return pd;
  for (const k of keys) if (typeof pd[k] === "string") pd[k] = trCode(pd[k]);
  return pd;
}

/** Запуск симулятора: сначала словарь (для казахской страницы), потом mount. */
export function onReady(mount) {
  const go = () => ready.then(mount);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
}
