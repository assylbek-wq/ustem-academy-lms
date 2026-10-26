// Превращает обычную программу MicroPython в кооперативную, чтобы она шла в реальном времени рядом со схемой
// и не замораживала страницу: sleep() и функции пользователя становятся await, каждый проход while отдает
// управление браузеру. Номера строк не меняются: все правки делаются внутри строк.
const KW = new Set(["def", "class", "if", "elif", "else", "while", "for", "in", "not", "and", "or", "return", "import", "from", "as", "lambda", "yield", "await", "async", "pass", "break", "continue", "global", "nonlocal", "try", "except", "finally", "with", "raise", "del", "assert", "is", "None", "True", "False"]);

function lex(src) {
  const toks = [];
  let i = 0, line = 1;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === "\n") { toks.push({ t: "nl", s: i, e: i + 1, line }); line++; i++; continue; }
    if (c === "#") { const j = src.indexOf("\n", i); i = j < 0 ? n : j; continue; }
    if (c === " " || c === "\t" || c === "\r" || c === "\\") { if (c === "\\" && src[i + 1] === "\n") { i += 2; line++; continue; } i++; continue; }
    // строки (с префиксами f, r, b)
    const m = /^([rRbBfFuU]{0,2})('''|"""|'|")/.exec(src.slice(i, i + 5));
    if (m && (m[1] === "" || /[A-Za-z]/.test(c))) {
      const q = m[2]; let j = i + m[0].length;
      while (j < n) {
        if (src[j] === "\\") { j += 2; continue; }
        if (src.startsWith(q, j)) { j += q.length; break; }
        if (src[j] === "\n") { if (q.length === 1) break; line++; }
        j++;
      }
      toks.push({ t: "str", s: i, e: j, line }); i = j; continue;
    }
    if (/[A-Za-z_]/.test(c)) { let j = i + 1; while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++; toks.push({ t: "id", v: src.slice(i, j), s: i, e: j, line }); i = j; continue; }
    if (/[0-9]/.test(c)) { let j = i + 1; while (j < n && /[0-9A-Za-z_.]/.test(src[j])) j++; toks.push({ t: "num", s: i, e: j, line }); i = j; continue; }
    toks.push({ t: "op", v: c, s: i, e: i + 1, line }); i++;
  }
  return toks;
}

const indentOf = (l) => l.match(/^[ \t]*/)[0].replace(/\t/g, "    ").length;

/**
 * asyncCalls - имена вызовов, которые нужно ждать (sleep, display.scroll ...), в виде "name" или "obj.name".
 * Возвращает { code, asyncDefs }.
 */
export function transform(src, asyncCalls = []) {
  const lines = src.split("\n");
  // 1. функции: имя, строка, отступ, конец, генератор, «синхронная» (dunder, генератор, @property)
  const defs = [];
  lines.forEach((l, k) => {
    const m = /^([ \t]*)(async\s+)?def\s+([A-Za-z_]\w*)/.exec(l);
    if (m) defs.push({ name: m[3], line: k, ind: indentOf(l), already: !!m[2] });
  });
  for (const d of defs) {
    let end = lines.length;
    for (let k = d.line + 1; k < lines.length; k++) {
      const l = lines[k];
      if (!l.trim() || l.trim().startsWith("#")) continue;
      if (indentOf(l) <= d.ind) { end = k; break; }
    }
    d.end = end;
    const body = lines.slice(d.line + 1, end).join("\n");
    d.gen = /\byield\b/.test(body.replace(/#[^\n]*/g, ""));
    const prev = lines[d.line - 1] || "";
    d.sync = d.gen || /^__\w+__$/.test(d.name) || /@property|@staticmethod.*sync/.test(prev);
  }
  const asyncNames = new Set(defs.filter((d) => !d.sync).map((d) => d.name));
  const syncNames = new Set(defs.filter((d) => d.sync).map((d) => d.name));
  for (const n of syncNames) asyncNames.delete(n);
  const apiFull = new Set(asyncCalls.filter((a) => a.includes(".")));
  const apiBare = new Set(asyncCalls.filter((a) => !a.includes(".")));
  // строка -> находится ли внутри синхронной функции (await там нельзя)
  const inSync = new Array(lines.length).fill(false);
  for (const d of defs) if (d.sync) for (let k = d.line; k < d.end; k++) inSync[k] = true;
  const lineStart = [0]; for (let k = 0; k < src.length; k++) if (src[k] === "\n") lineStart.push(k + 1);
  const lineOfPos = (pos) => { let lo = 0, hi = lineStart.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (lineStart[mid] <= pos) lo = mid; else hi = mid - 1; } return lo; };

  const toks = lex(src);
  const ins = []; // [позиция, текст]
  let lambdaDepth = 0;
  for (let i = 0; i < toks.length; i++) {
    const tk = toks[i];
    if (tk.t !== "id") continue;
    if (tk.v === "def" && toks[i + 1] && toks[i + 1].t === "id") {
      const name = toks[i + 1].v;
      const d = defs.find((x) => x.name === name && x.line === lineOfPos(tk.s));
      if (d && !d.sync && !d.already) ins.push([tk.s, "async "]);
      continue;
    }
    if (tk.v === "while" && !inSync[lineOfPos(tk.s)]) {
      // while COND:  ->  while (await __tick()) or (COND):
      let depth = 0, j = i + 1;
      for (; j < toks.length; j++) {
        const t = toks[j];
        if (t.t === "op" && "([{".includes(t.v)) depth++;
        else if (t.t === "op" && ")]}".includes(t.v)) depth--;
        else if (t.t === "op" && t.v === ":" && depth === 0) break;
        if (t.t === "nl" && depth === 0) { j = -1; break; }
      }
      if (j > 0) { ins.push([toks[i + 1].s, "(await __tick()) or ("]); ins.push([toks[j].s, ")"]); }
      continue;
    }
    const next = toks[i + 1];
    if (!next || next.t !== "op" || next.v !== "(") continue;
    const prev = toks[i - 1];
    if (prev && prev.t === "id" && (prev.v === "def" || prev.v === "class" || prev.v === "await")) continue;
    if (KW.has(tk.v)) continue;
    // полное имя вызова: a.b.c(
    let k = i, full = tk.v;
    while (toks[k - 1] && toks[k - 1].t === "op" && toks[k - 1].v === "." && toks[k - 2] && toks[k - 2].t === "id") { k -= 2; full = toks[k].v + "." + full; }
    const dotted = toks[k - 1] && toks[k - 1].t === "op" && toks[k - 1].v === ".";
    if (dotted) continue; // a[0].f() и подобное не трогаем
    const member = full.includes(".");
    const want = (!member && (asyncNames.has(tk.v) || apiBare.has(tk.v))) ||
      (member && (apiFull.has(full) || apiFull.has(full.split(".").slice(-2).join(".")) || asyncNames.has(tk.v)));
    if (!want) continue;
    if (inSync[lineOfPos(tk.s)]) continue;
    // внутри lambda нельзя await
    let ln = lineOfPos(tk.s), inLambda = false;
    for (let b = i - 1; b >= 0 && lineOfPos(toks[b].s) === ln; b--) if (toks[b].t === "id" && toks[b].v === "lambda") { inLambda = true; break; }
    if (inLambda) continue;
    // найти закрывающую скобку
    let depth = 0, j = i + 1;
    for (; j < toks.length; j++) {
      const t = toks[j];
      if (t.t === "op" && "([{".includes(t.v)) depth++;
      else if (t.t === "op" && ")]}".includes(t.v)) { depth--; if (depth === 0) break; }
    }
    if (j >= toks.length) continue;
    ins.push([toks[k].s, "(await __aw("]);
    ins.push([toks[j].e, "))"]);
  }
  ins.forEach((x, k) => x.push(k));
  ins.sort((a, b) => b[0] - a[0] || b[2] - a[2]);
  let out = src;
  for (const [pos, text] of ins) out = out.slice(0, pos) + text + out.slice(pos);
  return { code: out, asyncDefs: [...asyncNames] };
}
