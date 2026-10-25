// Сквозная проверка заданий CubeSat и CanSat без браузера: настоящий MicroPython (WASM) + та же модель, что в интерфейсе.
//   node tests/e2e/sat_solutions.mjs cubesat             эталоны проходят все проверки
//   node tests/e2e/sat_solutions.mjs cansat --negative   стартовые сборка и программа задание не проходят
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lab = path.join(root, "assets/lab");
const kinds = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const negative = process.argv.includes("--negative");
const verbose = process.argv.includes("-v");
const { runProgram } = await import(path.join(lab, "sat/vm.js"));
const { loadMicroPython } = await import(path.join(lab, "node_modules/@micropython/micropython-webassembly-pyscript/micropython.mjs"));

let failed = 0;
for (const kind of kinds.length ? kinds : ["cubesat", "cansat"]) {
  const { createSim } = await import(path.join(lab, kind, "sim.js"));
  const { evalChecks, needsFlight } = await import(path.join(lab, kind, "checks.js"));
  const { presets, solutions } = JSON.parse(execFileSync("python3", [path.join(lab, `${kind}_presets.py`), "--solutions"]).toString());
  for (const [name, pd] of Object.entries(presets)) {
    if (!pd.checks || !pd.checks.length) continue;
    const sol = negative ? {} : solutions[name] || {};
    const config = sol.config || pd.config;
    const code = sol.python || pd.python;
    const flight = { ...(pd.flight || {}), ...(sol.flight || {}) };
    let res = null;
    const t0 = Date.now();
    if (needsFlight(pd.checks)) res = await runProgram({ sim: createSim(config, flight), code, loadMicroPython });
    const ev = evalChecks(pd.checks, { config, flight, res, mission: pd.mission, extra: { exported: !!sol.export } });
    const good = negative ? !ev.all : ev.all;
    if (!good) failed++;
    console.log(`${good ? "OK  " : "FAIL"} ${name}  ${Date.now() - t0} мс` + (res && res.error ? `  [${res.error.split("\n").pop()}]` : ""));
    if (!good || verbose) ev.results.forEach((r, i) => console.log(`      ${r.ok ? "+" : "-"} ${pd.checks[i].label}: ${r.value}`));
  }
}
console.log(failed ? `${failed} заданий не прошли` : "все задания в порядке");
process.exit(failed ? 1 : 0);
