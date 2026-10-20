// Перевод подмножества Java (как в OpMode FTC SDK) в асинхронный JavaScript для симулятора.
// Поддерживается то, что нужно ученику: поля и методы класса, переменные с типами, if/for/while, массивы,
// for-each, приведение типов, перечисления SDK (DcMotor.Direction.REVERSE и т. п.).
// Блокирующие вызовы (sleep, waitForStart, opModeIsActive и методы самого класса) превращаются в await,
// в каждый цикл вставляется await __y(), чтобы бесконечный цикл не повесил страницу.

const PRIMS = new Set(["double", "float", "int", "long", "short", "byte", "boolean", "char", "String", "var", "Double", "Integer", "Boolean"]);
const MODIFIERS = new Set(["public", "private", "protected", "static", "final", "synchronized", "volatile", "transient", "abstract"]);
const BLOCKING = new Set(["sleep", "waitForStart", "opModeIsActive", "opModeInInit", "idle", "isStopRequested"]);
const KEYWORDS = new Set(["if", "else", "for", "while", "do", "return", "new", "switch", "case", "break", "continue", "true", "false", "null", "this", "throw", "try", "catch", "finally", "default", "instanceof"]);

export class JavaError extends Error {
  constructor(msg, line) { super(msg); this.line = line; }
}

function tokenize(src) {
  const toks = [];
  let i = 0, line = 1;
  const push = (type, v) => toks.push({ type, v, line });
  while (i < src.length) {
    const c = src[i];
    if (c === "\n") { push("nl", c); line++; i++; continue; }
    if (/\s/.test(c)) { let j = i; while (j < src.length && /[ \t\r]/.test(src[j])) j++; push("ws", src.slice(i, j)); i = j; continue; }
    if (c === "/" && src[i + 1] === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
    if (c === "/" && src[i + 1] === "*") {
      const j = src.indexOf("*/", i + 2); const end = j < 0 ? src.length : j + 2;
      for (const ch of src.slice(i, end)) if (ch === "\n") { push("nl", "\n"); line++; }
      i = end; continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== c) { if (src[j] === "\\") j++; if (src[j] === "\n") throw new JavaError("Строка не закрыта кавычкой", line); j++; }
      push("str", src.slice(i, j + 1)); i = j + 1; continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1]))) {
      let j = i; while (j < src.length && /[0-9a-fA-FxX._]/.test(src[j])) j++;
      let num = src.slice(i, j).replace(/_/g, "");
      if (/^[0-9.]+[eE]$/.test(num) && /[+-]/.test(src[j])) { j++; while (/[0-9]/.test(src[j])) j++; num = src.slice(i, j); }
      num = num.replace(/[fFdDlL]$/, "");
      push("num", num); i = j; continue;
    }
    if (/[A-Za-z_$]/.test(c)) { let j = i; while (j < src.length && /[\w$]/.test(src[j])) j++; push("id", src.slice(i, j)); i = j; continue; }
    const three = src.slice(i, i + 3), two = src.slice(i, i + 2);
    if ([">>>", "<<=", ">>="].includes(three)) { push("p", three); i += 3; continue; }
    if (["==", "!=", "<=", ">=", "&&", "||", "++", "--", "+=", "-=", "*=", "/=", "%=", "<<", ">>", "->", "::", "&=", "|=", "^="].includes(two)) { push("p", two); i += 2; continue; }
    push("p", c); i++;
  }
  return toks;
}

// Индекс следующего значимого токена
const nx = (t, i) => { while (i < t.length && (t[i].type === "ws" || t[i].type === "nl")) i++; return i; };
const pv = (t, i) => { while (i >= 0 && (t[i].type === "ws" || t[i].type === "nl")) i--; return i; };

function matchClose(t, i, open, close) {
  let d = 0;
  for (let k = i; k < t.length; k++) {
    if (t[k].v === open && t[k].type === "p") d++;
    else if (t[k].v === close && t[k].type === "p") { d--; if (d === 0) return k; }
  }
  throw new JavaError(`Не хватает закрывающей скобки «${close}»`, t[i].line);
}

// Пропуск типа: Name, Name.Inner, Name<...>, Name[]..., возвращает индекс после типа или -1
function skipType(t, i) {
  i = nx(t, i);
  if (!t[i] || t[i].type !== "id" || KEYWORDS.has(t[i].v)) return -1;
  i++;
  while (true) {
    const j = nx(t, i);
    if (t[j] && t[j].v === "." && t[nx(t, j + 1)] && t[nx(t, j + 1)].type === "id") { i = nx(t, j + 1) + 1; continue; }
    if (t[j] && t[j].v === "<") { let d = 0, k = j; for (; k < t.length; k++) { if (t[k].v === "<") d++; else if (t[k].v === ">") { d--; if (!d) break; } else if (t[k].v === ">>") { d -= 2; if (d <= 0) break; } else if (![",", "?"].includes(t[k].v) && !["id", "ws", "nl"].includes(t[k].type)) return -1; } i = k + 1; continue; }
    if (t[j] && t[j].v === "[" && t[nx(t, j + 1)] && t[nx(t, j + 1)].v === "]") { i = nx(t, j + 1) + 1; continue; }
    return i;
  }
}

function isTypeStart(t, i) {
  const tok = t[nx(t, i)];
  if (!tok || tok.type !== "id") return false;
  return PRIMS.has(tok.v) || /^[A-Z]/.test(tok.v);
}

// Java требует «;» в конце оператора, а JavaScript прощает. Ловим строку, после которой забыли точку с запятой.
const STMT_END_PREV = new Set(["++", "--", "]"]);
function checkSemicolons(t) {
  const sig = t.filter((x) => x.type !== "ws");
  for (let k = 1; k < sig.length - 1; k++) {
    if (sig[k].type !== "nl") continue;
    let a = k - 1; while (a >= 0 && sig[a].type === "nl") a--;
    let b = k + 1; while (b < sig.length && sig[b].type === "nl") b++;
    if (a < 0 || b >= sig.length) continue;
    const prev = sig[a], next = sig[b];
    const prevEnds = (prev.type === "id" && !KEYWORDS.has(prev.v) && !MODIFIERS.has(prev.v) && prev.v !== "else") || prev.type === "num" || prev.type === "str" || (prev.type === "p" && STMT_END_PREV.has(prev.v));
    const nextStarts = next.type === "id" && !["else", "catch", "finally", "throws", "extends", "implements", "instanceof"].includes(next.v);
    if (prevEnds && nextStarts) {
      // объявление типа на одной строке, имя на следующей - редкость; аннотации уже убраны
      if (sig[a - 1] && ["@", "new", "extends", "implements", "class"].includes(sig[a - 1].v)) continue;
      throw new JavaError("Похоже, в конце строки не хватает «;»", prev.line);
    }
  }
}

export function transpile(src) {
  const t = tokenize(src);
  checkSemicolons(t);
  let kind = "teleop", name = "OpMode";
  const out = [];
  const methods = new Set();
  // 1. Убрать package/import и аннотации, найти класс
  let i = 0;
  const kept = [];
  while (i < t.length) {
    const tok = t[i];
    if (tok.type === "id" && (tok.v === "package" || tok.v === "import") && (pv(kept, kept.length - 1) < 0 || [";", "}"].includes(kept[pv(kept, kept.length - 1)]?.v))) {
      while (i < t.length && t[i].v !== ";") { if (t[i].type === "nl") kept.push(t[i]); i++; }
      i++; continue;
    }
    if (tok.v === "@" && tok.type === "p") {
      const j = nx(t, i + 1);
      const ann = t[j] ? t[j].v : "";
      let end = j + 1;
      const k = nx(t, end);
      let args = "";
      if (t[k] && t[k].v === "(") { const c = matchClose(t, k, "(", ")"); args = t.slice(k, c + 1).map((x) => x.v).join(""); end = c + 1; }
      if (ann === "Autonomous") kind = "auto";
      if (ann === "TeleOp") kind = "teleop";
      const m = args.match(/name\s*=\s*"([^"]*)"/); if (m && (ann === "Autonomous" || ann === "TeleOp")) name = m[1];
      for (const x of t.slice(i, end)) if (x.type === "nl") kept.push(x);
      i = end; continue;
    }
    kept.push(tok); i++;
  }
  const s = kept;
  // 2. Класс
  let ci = s.findIndex((x) => x.type === "id" && x.v === "class");
  if (ci < 0) throw new JavaError("Не найден класс OpMode: нужен public class Имя extends LinearOpMode { ... }", 1);
  const ob = s.findIndex((x, k) => k > ci && x.v === "{");
  const ext = s.slice(ci, ob).map((x) => x.v).join("");
  if (/extends\s*OpMode\b/.test(ext) && !/LinearOpMode/.test(ext)) throw new JavaError("Симулятор поддерживает LinearOpMode (extends LinearOpMode)", s[ci].line);
  const cb = matchClose(s, ob, "{", "}");
  const header = s.slice(0, ci).filter((x) => x.type === "nl");
  const body = s.slice(ob + 1, cb);
  // 3. Члены класса
  const members = [];
  let k = 0;
  const memberOut = [];
  while (k < body.length) {
    const j = nx(body, k);
    if (j >= body.length) { memberOut.push(...body.slice(k)); break; }
    memberOut.push(...body.slice(k, j));
    k = j;
    // модификаторы
    while (body[k] && body[k].type === "id" && MODIFIERS.has(body[k].v)) { k = nx(body, k + 1); }
    const typeEnd = skipType(body, k);
    if (typeEnd < 0) throw new JavaError("Непонятная строка в классе: ожидается поле или метод", body[k]?.line || 1);
    const ni = nx(body, typeEnd);
    const nameTok = body[ni];
    if (!nameTok || nameTok.type !== "id") throw new JavaError("Ожидается имя поля или метода", body[k].line);
    const after = nx(body, ni + 1);
    if (body[after] && body[after].v === "(") {
      // метод
      const pc = matchClose(body, after, "(", ")");
      const params = splitParams(body.slice(after + 1, pc));
      let bo = nx(body, pc + 1);
      if (body[bo] && body[bo].v === "throws") { while (body[bo] && body[bo].v !== "{") bo++; }
      if (!body[bo] || body[bo].v !== "{") throw new JavaError("После объявления метода нужна «{»", nameTok.line);
      const bc = matchClose(body, bo, "{", "}");
      methods.add(nameTok.v);
      members.push({ kind: "method", name: nameTok.v, params, body: body.slice(bo + 1, bc), line: nameTok.line });
      memberOut.push({ type: "slot", v: members.length - 1 });
      k = bc + 1;
    } else {
      // поле: до ;
      let e = ni;
      let d = 0;
      while (e < body.length && !(body[e].v === ";" && d === 0)) { if ("({[".includes(body[e].v)) d++; if (")}]".includes(body[e].v)) d--; e++; }
      members.push({ kind: "field", toks: body.slice(ni, e) });
      memberOut.push({ type: "slot", v: members.length - 1 });
      k = e + 1;
    }
  }
  if (!methods.has("runOpMode")) throw new JavaError("Нет метода runOpMode(): в LinearOpMode код пишут в нем", s[ci].line);
  // 4. Сборка
  const lines = [];
  const emit = (toks) => toks.map((x) => x.v).join("");
  let js = header.map(() => "\n").join("");
  for (const piece of memberOut) {
    if (piece.type !== "slot") { js += piece.v; continue; }
    const m = members[piece.v];
    if (m.kind === "field") js += "let " + emit(convertBody(m.toks, methods, true)) + ";";
    else js += `async function ${m.name}(${m.params.join(", ")}) {` + emit(convertBody(m.body, methods)) + "}";
  }
  void lines; void out;
  return { js, kind, name };
}

function splitParams(toks) {
  const names = [];
  let cur = [];
  const flush = () => { const ids = cur.filter((x) => x.type === "id" && !MODIFIERS.has(x.v)); if (ids.length) names.push(ids[ids.length - 1].v); cur = []; };
  let d = 0;
  for (const x of toks) { if (x.v === "<") d++; if (x.v === ">") d--; if (x.v === "," && d === 0) flush(); else cur.push(x); }
  flush();
  return names;
}

// Преобразование тела метода (или инициализатора поля)
function convertBody(toks, methods, isField = false) {
  const t = toks.slice();
  const out = [];
  let i = 0;
  const stmtStart = (idx) => { const p = pv(out, out.length - 1); return p < 0 || ["{", "}", ";", ")"].includes(out[p].v) && !(out[p].v === ")" && !out[p].ctrlEnd); };
  // Объявление переменной в начале оператора: Type name = / ; / , / :
  const tryDecl = () => {
    let j = i;
    while (t[j] && t[j].type === "id" && t[j].v === "final") j = nx(t, j + 1);
    if (!isTypeStart(t, j)) return false;
    const te = skipType(t, j);
    if (te < 0) return false;
    const ni = nx(t, te);
    if (!t[ni] || t[ni].type !== "id" || KEYWORDS.has(t[ni].v)) return false;
    const a = nx(t, ni + 1);
    if (!t[a] || !["=", ";", ",", ":"].includes(t[a].v)) return false;
    out.push({ type: "id", v: "let" }, { type: "ws", v: " " });
    i = ni;
    return true;
  };
  if (isField) { /* поле уже без типа */ }
  let parenDepth = 0;
  const loopHeads = []; // ожидаем { после ) цикла
  while (i < t.length) {
    const tok = t[i];
    // final
    if (tok.type === "id" && tok.v === "final") { i = nx(t, i + 1); continue; }
    // this.поле -> поле (поля класса стали переменными модуля)
    if (tok.type === "id" && tok.v === "this" && t[nx(t, i + 1)] && t[nx(t, i + 1)].v === ".") { i = nx(t, i + 1) + 1; continue; }
    // объявления в начале оператора и в заголовке for
    if (tok.type === "id" && !isField) {
      const p = pv(out, out.length - 1);
      const prev = p >= 0 ? out[p] : null;
      const atStart = !prev || /[{};]$/.test(prev.v.trim()) || (prev.v === "(" && prev.forOpen) || (prev.type === "id" && prev.v === "else");
      if (atStart && tryDecl()) continue;
    }
    // for-each: for (Type x : arr)
    if (tok.type === "p" && tok.v === ":" && out.some((x) => x.forOpen) && parenDepth >= 1) { out.push({ type: "id", v: " of" }); i++; continue; }
    // приведение типов (int) (double) ...
    if (tok.v === "(" ) {
      const a = nx(t, i + 1), b = nx(t, a + 1);
      if (t[a] && t[a].type === "id" && PRIMS.has(t[a].v) && t[b] && t[b].v === ")") {
        const next = t[nx(t, b + 1)];
        if (next && (next.type === "id" || next.type === "num" || next.v === "(" || next.v === "-")) {
          const s0 = nx(t, b + 1);
          const e = operandEnd(t, s0);
          const isInt = ["int", "short", "byte", "Integer", "long"].includes(t[a].v);
          out.push({ type: "id", v: isInt ? "Math.trunc(" : "(" }, ...convertBody(t.slice(s0, e), methods, true), { type: "p", v: ")" });
          i = e; continue;
        }
      }
    }
    // X.class -> "X"
    if (tok.type === "id") {
      const d = nx(t, i + 1), c = nx(t, d + 1);
      if (t[d] && t[d].v === "." && t[c] && t[c].v === "class") { out.push({ type: "str", v: JSON.stringify(tok.v) }); i = c + 1; continue; }
    }
    // new Type[]{...} -> [...];  new Type[n] -> new Array(n).fill(0)
    if (tok.type === "id" && tok.v === "new") {
      const te = skipType(t, i + 1);
      if (te > 0) {
        const typeToks = t.slice(nx(t, i + 1), te);
        const isArr = typeToks.some((x) => x.v === "[");
        const n = nx(t, te);
        if (isArr && t[n] && t[n].v === "{") { const c = matchClose(t, n, "{", "}"); out.push({ type: "p", v: "[" }, ...convertBody(t.slice(n + 1, c), methods, true), { type: "p", v: "]" }); i = c + 1; continue; }
        // new double[n]
        const bi = typeToks.findIndex((x) => x.v === "[");
        if (bi < 0 && t[n] && t[n].v === "[") {
          const c = matchClose(t, n, "[", "]");
          const base = typeToks.map((x) => x.v).join("");
          const fill = PRIMS.has(base) && base !== "String" && base !== "boolean" ? "0" : base === "boolean" ? "false" : "null";
          out.push({ type: "id", v: "new Array(" }, ...convertBody(t.slice(n + 1, c), methods, true), { type: "id", v: `).fill(${fill})` });
          i = c + 1; continue;
        }
      }
    }
    // блокирующие вызовы и методы класса
    if (tok.type === "id" && (BLOCKING.has(tok.v) || methods.has(tok.v))) {
      const n = nx(t, i + 1);
      const p = pv(out, out.length - 1);
      if (t[n] && t[n].v === "(" && !(p >= 0 && out[p].v === ".")) { out.push({ type: "id", v: "(await " }, tok); const c = matchClose(t, n, "(", ")"); out.push(...convertBody(t.slice(n, c + 1), methods, true), { type: "p", v: ")" }); i = c + 1; continue; }
    }
    // заголовки циклов: отмечаем, чтобы вставить __y()
    if (tok.type === "id" && (tok.v === "while" || tok.v === "for")) {
      const n = nx(t, i + 1);
      if (t[n] && t[n].v === "(") {
        const c = matchClose(t, n, "(", ")");
        const head = t.slice(n + 1, c);
        out.push(tok, { type: "ws", v: " " });
        const open = { type: "p", v: "(", forOpen: tok.v === "for" };
        out.push(open);
        parenDepth++;
        const conv = convertBodyHead(head, methods, tok.v === "for");
        out.push(...conv, { type: "p", v: ")" });
        parenDepth--;
        i = c + 1;
        const b = nx(t, i);
        if (t[b] && t[b].v === "{") { out.push(...t.slice(i, b + 1), { type: "id", v: " await __y();" }); i = b + 1; }
        else if (t[b] && t[b].v === ";") { out.push({ type: "id", v: " { await __y(); }" }); i = b + 1; }
        else {
          // тело из одного оператора без скобок
          let e = b, d = 0;
          while (e < t.length && !(t[e].v === ";" && d === 0)) { if ("({[".includes(t[e].v)) d++; if (")}]".includes(t[e].v)) d--; e++; }
          out.push({ type: "id", v: " { await __y(); " }, ...convertBody(t.slice(b, e + 1), methods), { type: "id", v: " }" });
          i = e + 1;
        }
        continue;
      }
    }
    if (tok.type === "id" && tok.v === "do") {
      const b = nx(t, i + 1);
      if (t[b] && t[b].v === "{") { out.push(tok, ...t.slice(i + 1, b + 1), { type: "id", v: " await __y();" }); i = b + 1; continue; }
    }
    if (tok.v === "(") parenDepth++;
    if (tok.v === ")") parenDepth--;
    out.push(tok);
    i++;
  }
  return out;
}

// Конец операнда приведения типа: -x, (выражение), имя.поле[индекс](вызов)...
function operandEnd(t, i) {
  if (t[i] && t[i].v === "-") i = nx(t, i + 1);
  if (!t[i]) return i;
  if (t[i].v === "(") i = matchClose(t, i, "(", ")") + 1;
  else if (t[i].type === "num" || t[i].type === "str") return i + 1;
  else if (t[i].type === "id") i++;
  while (true) {
    const j = nx(t, i);
    if (t[j] && t[j].v === "." && t[nx(t, j + 1)] && t[nx(t, j + 1)].type === "id") { i = nx(t, j + 1) + 1; continue; }
    if (t[j] && t[j].v === "(") { i = matchClose(t, j, "(", ")") + 1; continue; }
    if (t[j] && t[j].v === "[") { i = matchClose(t, j, "[", "]") + 1; continue; }
    return i;
  }
}

function convertBodyHead(head, methods, isFor) {
  if (!isFor) return convertBody(head, methods, true);
  // for (init; cond; step) или for (Type x : arr)
  const t = head;
  const colon = t.findIndex((x) => x.v === ":" && x.type === "p");
  const semi = t.findIndex((x) => x.v === ";");
  if (colon >= 0 && semi < 0) {
    const ids = t.slice(0, colon).filter((x) => x.type === "id" && x.v !== "final");
    const nm = ids[ids.length - 1].v;
    return [{ type: "id", v: `let ${nm} of ` }, ...convertBody(t.slice(colon + 1), methods, true)];
  }
  // init: объявление типа
  const init = t.slice(0, semi);
  const rest = t.slice(semi);
  let initOut;
  const j = nx(init, 0);
  if (isTypeStart(init, j)) {
    const te = skipType(init, j);
    const ni = nx(init, te);
    if (te > 0 && init[ni] && init[ni].type === "id") initOut = [{ type: "id", v: "let " }, ...convertBody(init.slice(ni), methods, true)];
  }
  if (!initOut) initOut = convertBody(init, methods, true);
  return [...initOut, ...convertBody(rest, methods, true)];
}
