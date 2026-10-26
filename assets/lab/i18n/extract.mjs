// Сбор русских строк интерфейса симуляторов для перевода: node i18n/extract.mjs
// Берет строковые литералы и шаблоны из JS (без комментариев), строки из Python внутри JS (сообщения программ),
// поля заданий из JSON (title, task, label, hint...) и комментарии в коде заданий и примеров.
// Пишет i18n/todo-<группа>.json: строки, которых еще нет в i18n/kk.json.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as acorn from "acorn";
import * as walk from "acorn-walk";

const LAB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STATIC = path.resolve(LAB, "../../app/static");
const CYR = /[А-Яа-яЁё]/;
const GROUPS = {
  electronics: { js: ["lab.js", "parts", "devices", "mcu", "view3d.js", "solver.js"], json: ["lab/presets"], examples: true },
  spike: { js: ["spike"], json: ["spikesim/presets"] },
  ftc: { js: ["ftc"], json: ["ftcsim/presets"] },
  sat: { js: ["sat", "cubesat", "cansat"], json: ["cubesat/presets", "cansat/presets"] },
  robots: { js: ["robots"], json: ["robots/presets"] },
};
const SKIP = new Set(["bootrom.js", "extract.mjs"]);

const files = (p) => {
  const full = path.join(LAB, p);
  if (statSync(full).isFile()) return [full];
  return readdirSync(full).filter((f) => f.endsWith(".js") && !SKIP.has(f)).map((f) => path.join(full, f));
};

function add(set, s) {
  for (let line of String(s).split(/\n/)) {
    for (let seg of line.split(/<[^>]+>/)) { // разметка: только текст между тегами
      seg = seg.replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
      if (seg.length > 1 && CYR.test(seg)) set.add(seg);
    }
  }
}

// строки и комментарии внутри Python-кода (программы для MicroPython)
function fromPython(set, src) {
  for (const m of src.matchAll(/#\s*([^\n]*[А-Яа-я][^\n]*)/g)) add(set, m[1]);
  for (const m of src.matchAll(/(["'])((?:(?!\1)[^\n\\]|\\.)*[А-Яа-я](?:(?!\1)[^\n\\]|\\.)*)\1/g)) add(set, m[2].replace(/\\n/g, "\n"));
}
// комментарии в C++/Java/Python коде заданий и примеров
function fromCode(set, code) {
  for (const m of code.matchAll(/(?:\/\/|#)\s*([^\n]*[А-Яа-я][^\n]*)/g)) add(set, m[1]);
  for (const m of code.matchAll(/\/\*([\s\S]*?)\*\//g)) if (CYR.test(m[1])) add(set, m[1].replace(/^\s*\*\s?/gm, ""));
  for (const m of code.matchAll(/"((?:[^"\\\n]|\\.)*[А-Яа-я](?:[^"\\\n]|\\.)*)"/g)) add(set, m[1]);
  for (const m of code.matchAll(/'((?:[^'\\\n]|\\.)*[А-Яа-я](?:[^'\\\n]|\\.)*)'/g)) add(set, m[1]);
}

function fromJs(set, file) {
  const src = readFileSync(file, "utf8");
  let ast;
  try { ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "module" }); } catch (e) { console.warn("не разобрать", file, e.message); return; }
  const take = (s) => {
    if (!CYR.test(s)) return;
    if (/\n\s*(def |class |import |from |while |for )/.test(s) || /^\s*(import|from) \w/m.test(s)) { fromPython(set, s); return; }
    if (/\n\s*(void |#include|public class|@TeleOp|\/\/)/.test(s)) { fromCode(set, s); return; }
    add(set, s);
  };
  walk.full(ast, (n) => {
    if (n.type === "Literal" && typeof n.value === "string") take(n.value);
    else if (n.type === "TemplateLiteral") take(n.quasis.map((q) => q.value.cooked ?? q.value.raw).join("{}"));
  });
}

const CODE_KEYS = new Set(["code", "python", "start", "blocks"]);
function fromJson(set, v, key) {
  if (typeof v === "string") { if (CODE_KEYS.has(key)) fromCode(set, v); else if (CYR.test(v)) add(set, v); }
  else if (Array.isArray(v)) v.forEach((x) => fromJson(set, x, key));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) fromJson(set, x, k);
}

const done = existsSync(path.join(LAB, "i18n/kk.json")) ? JSON.parse(readFileSync(path.join(LAB, "i18n/kk.json"), "utf8")) : {};
const seen = new Set();
let total = 0;
for (const [g, cfg] of Object.entries(GROUPS)) {
  const set = new Set();
  for (const p of cfg.js) for (const f of files(p)) fromJs(set, f);
  for (const d of cfg.json) for (const f of readdirSync(path.join(STATIC, d))) if (f.endsWith(".json")) fromJson(set, JSON.parse(readFileSync(path.join(STATIC, d, f), "utf8")));
  if (cfg.examples) {
    const { EXAMPLES, DEFAULT_CODE } = await import(path.join(LAB, "examples.js"));
    for (const ex of EXAMPLES) { add(set, ex.title); add(set, ex.desc); add(set, ex.group); fromCode(set, ex.code); }
    for (const c of Object.values(DEFAULT_CODE)) fromCode(set, c);
  }
  const todo = [...set].filter((s) => !(s in done) && !seen.has(s)).sort();
  todo.forEach((s) => seen.add(s));
  total += todo.length;
  const out = path.join(LAB, `i18n/todo-${g}.json`);
  if (todo.length) writeFileSync(out, JSON.stringify(todo, null, 0).replace(/","/g, '",\n"'));
  else if (existsSync(out)) unlinkSync(out);
  console.log(g, set.size, "строк, новых", todo.length);
}
console.log("всего новых", total);
