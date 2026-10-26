// Сквозная проверка заданий Unitree Go2 и G1 без браузера: настоящие MuJoCo и MicroPython (WASM), тот же код, что в воркере.
//   node tests/e2e/robot_solutions.mjs               эталоны проходят все проверки
//   node tests/e2e/robot_solutions.mjs --negative    стартовые программы задание не проходят
//   node tests/e2e/robot_solutions.mjs go2-walk -v   одно задание с подробностями
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lab = path.join(root, "assets/lab");
const only = process.argv.slice(2).filter((a) => !a.startsWith("-"));
const negative = process.argv.includes("--negative");
const verbose = process.argv.includes("-v");
const { RobotSim, unpack } = await import(path.join(lab, "robots/engine.js"));
const { runProgram } = await import(path.join(lab, "robots/vm.js"));
const { evaluate } = await import(path.join(lab, "robots/checks.js"));
const { loadMicroPython } = await import(path.join(lab, "node_modules/@micropython/micropython-webassembly-pyscript/micropython.mjs"));
const loadMujoco = (await import(path.join(lab, "node_modules/@mujoco/mujoco/mujoco.js"))).default;
const mj = await loadMujoco();
const packs = {};
const { presets, solutions } = JSON.parse(execFileSync("python3", [path.join(lab, "robot_presets.py"), "--solutions"]).toString());

let failed = 0;
for (const [name, pd] of Object.entries(presets)) {
  if (!pd.checks || !pd.checks.length) continue;
  if (only.length && !only.some((o) => name.endsWith(o))) continue;
  const code = negative ? pd.python : solutions[name];
  if (!code) { console.log(`FAIL ${name}  нет эталона`); failed++; continue; }
  packs[pd.robot] ||= unpack(fs.readFileSync(path.join(root, `app/static/robots/${pd.robot}/${pd.robot}.pack`)));
  const t0 = Date.now();
  const sim = new RobotSim(mj, packs[pd.robot], pd);
  const out = await runProgram({ sim, code, limit: pd.limit || 10, loadMicroPython });
  const res = sim.result();
  const ev = evaluate(pd, res, code);
  sim.delete();
  const all = ev.every((c) => c.ok) && !out.error;
  const good = negative ? !all : all;
  if (!good) failed++;
  console.log(`${good ? "OK  " : "FAIL"} ${name}  ${Date.now() - t0} мс` + (out.error ? `  [${out.error.trim().split("\n").pop()}]` : ""));
  if (!good || verbose) ev.forEach((r) => console.log(`      ${r.ok ? "+" : "-"} ${r.text}: ${r.value}`));
}
console.log(failed ? `${failed} заданий не прошли` : "все задания в порядке");
process.exit(failed ? 1 : 0);
