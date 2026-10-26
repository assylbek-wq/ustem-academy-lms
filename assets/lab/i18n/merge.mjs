// Свести переводы в один словарь: i18n/kk-*.json (новые партии) + i18n/kk.json -> i18n/kk.json и
// app/static/lab/i18n/kk.json (его грузит страница). Проверяет подстановки {} и %1. Запуск: node i18n/merge.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync, unlinkSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(DIR, "../../../app/static/lab/i18n");
const main = path.join(DIR, "kk.json");
let dict = {};
try { dict = JSON.parse(readFileSync(main, "utf8")); } catch (e) { dict = {}; }
const batches = readdirSync(DIR).filter((f) => /^kk-.+\.json$/.test(f));
for (const f of batches) Object.assign(dict, JSON.parse(readFileSync(path.join(DIR, f), "utf8")));

const count = (s, re) => (s.match(re) || []).length;
let bad = 0;
for (const [ru, kk] of Object.entries(dict)) {
  const problems = [];
  if (typeof kk !== "string" || !kk.trim()) problems.push("пусто");
  else {
    if (count(ru, /\{\d*\}/g) !== count(kk, /\{\d*\}/g)) problems.push("{}");
    const pr = (ru.match(/%\d/g) || []).sort().join(), pk = (kk.match(/%\d/g) || []).sort().join();
    if (pr !== pk) problems.push("%N");
    if (/—|ё/.test(kk)) problems.push("тире или ё");
  }
  if (problems.length) { bad++; console.log("!", problems.join(", "), JSON.stringify(ru), "->", JSON.stringify(kk)); }
}
const sorted = Object.fromEntries(Object.entries(dict).sort(([a], [b]) => a.localeCompare(b, "ru")));
writeFileSync(main, JSON.stringify(sorted, null, 1) + "\n");
mkdirSync(OUT, { recursive: true });
writeFileSync(path.join(OUT, "kk.json"), JSON.stringify(sorted));
if (!bad && process.argv.includes("--clean")) for (const f of batches) unlinkSync(path.join(DIR, f));
console.log(`строк: ${Object.keys(sorted).length}, ошибок: ${bad}`);
process.exit(bad ? 1 : 0);
