// Сквозная проверка заданий CubeSat без браузера: настоящий MicroPython (WASM) + та же модель, что в интерфейсе.
//   node tests/e2e/cubesat_solutions.mjs             эталоны проходят все проверки
//   node tests/e2e/cubesat_solutions.mjs --negative  стартовая сборка и программа задание не проходят
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lab = path.join(root, "assets/lab");
const { runFlight } = await import(path.join(lab, "cubesat/runner.js"));
const { evalChecks, needsFlight } = await import(path.join(lab, "cubesat/checks.js"));
const { loadMicroPython } = await import(path.join(lab, "node_modules/@micropython/micropython-webassembly-pyscript/micropython.mjs"));
const { presets, solutions } = JSON.parse(execFileSync("python3", [path.join(lab, "cubesat_presets.py"), "--solutions"]).toString());

const negative = process.argv.includes("--negative");
let failed = 0;
for (const [name, pd] of Object.entries(presets)) {
  if (!pd.checks || !pd.checks.length) continue;
  const sol = negative ? {} : solutions[name] || {};
  const config = sol.config || pd.config;
  const code = sol.python || pd.python;
  const flight = pd.flight || {};
  let res = null;
  if (needsFlight(pd.checks)) res = await runFlight({ code, config, flight, loadMicroPython });
  const ev = evalChecks(pd.checks, { config, flight, res, mission: pd.mission, extra: { exported: !!sol.export } });
  const good = negative ? !ev.all : ev.all;
  if (!good) failed++;
  console.log(`${good ? "OK  " : "FAIL"} ${name}` + (res && res.error ? `  [${res.error.split("\n").pop()}]` : ""));
  if (!good || process.argv.includes("-v")) ev.results.forEach((r, i) => console.log(`      ${r.ok ? "+" : "-"} ${pd.checks[i].label}: ${r.value}`));
}
console.log(failed ? `${failed} заданий не прошли` : "все задания в порядке");
process.exit(failed ? 1 : 0);
