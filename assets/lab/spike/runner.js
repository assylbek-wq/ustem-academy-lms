// Запуск программы SPIKE 3 на MicroPython (WebAssembly) с виртуальным роботом.
// Используется в Web Worker (worker.js) и в Node для проверок. Время симуляции идет вместе с реальным временем
// (умноженным на скорость); любой вызов датчика или мотора сначала «догоняет» физику до текущего момента, поэтому
// работают и циклы без await, как на настоящем хабе.
import { Robot, DT, PORTS } from "./physics.js";
import { PY_FILES } from "./pyapi.js";

const PORT_NAMES = ["A", "B", "C", "D", "E", "F"];
const IMAGES = {
  1: "0101011111111110111000100", 2: "0000001010011100010000000", 3: "0000001010000001000101110", 4: "0000001010000000111000000",
  5: "0000001010000000111010001", 13: "0000000001000101010001000", 14: "1000101010001000101010001", 43: "1111110001100011000111111",
};

export async function runProgram({ code, preset, speed = 1, loadMicroPython, wasmUrl, post, onSim, now = () => performance.now() }) {
  const sim = new Robot(preset);
  if (sim.field) await sim.field.load(preset.matUrl || String(wasmUrl || "").replace(/micropython\.wasm$/, "bioglow/mat.jpg"));
  if (onSim) onSim(sim);
  let stopped = false, wall0 = now();
  const timers = [];
  let lastPost = 0;
  const simTime = () => (now() - wall0) / 1000 * speed;

  const snapshot = (extra = {}) => post({ type: "state", state: sim.snapshot(), ...extra });

  function catchUp() {
    if (stopped) return;
    const target = simTime();
    let n = 0;
    while (sim.t + DT <= target && n < 6000) {
      sim.step(DT); n++;
      for (let i = timers.length - 1; i >= 0; i--) if (timers[i].t <= sim.t) { const tm = timers.splice(i, 1)[0]; tm.resolve(0); }
    }
    if (n >= 6000) wall0 = now() - sim.t * 1000 / speed; // не догоняем бесконечно после зависания
    if (now() - lastPost > 33) { lastPost = now(); snapshot(); }
    for (const ev of sim.events.splice(0)) post({ type: "event", event: ev });
  }

  const P = (i) => { const n = PORT_NAMES[i]; if (n === undefined) throw new Error("Неизвестный порт: " + i); return n; };
  const wait = (ms) => new Promise((resolve) => timers.push({ t: sim.t + Math.max(0, ms) / 1000, resolve }));
  // поле сезона: матч 2:30, после сигнала робот останавливается, а программа завершается
  const wrap = (fn) => (...a) => {
    catchUp();
    if (sim.matchOver) throw new Error("SystemExit: время матча 2:30 вышло");
    return fn(...a);
  };
  const stopMode = (m) => (m === 0 || m === 4 ? "coast" : "brake");
  const steer = (s) => Robot.steer(s);

  const api = {
    now: () => { catchUp(); return Math.round(sim.t * 1000); },
    sleep: wrap((ms) => wait(ms)),
    tick: wrap(() => wait(DT * 1000)),
    // моторы
    m_run: wrap((p, v, a) => sim.motorRun(P(p), v, a)),
    m_stop: wrap((p, mode) => sim.motorStop(P(p), stopMode(mode))),
    m_deg: wrap((p, d, v, a, dc) => sim.motorForDegrees(P(p), d, v, a, dc)),
    m_time: wrap((p, ms, v, a) => { sim.motorRun(P(p), v, a); return wait(ms).then(() => { sim.motorStop(P(p)); return 0; }); }),
    m_rel: wrap((p, pos, v) => sim.motorToRelative(P(p), pos, v)),
    m_abs: wrap((p, pos, v) => { const m = sim.motor(P(p)); const cur = ((m.pos % 360) + 360) % 360; let d = pos - cur; if (d > 180) d -= 360; if (d < -180) d += 360; return sim.motorForDegrees(P(p), d, Math.abs(v)); }),
    m_relpos: wrap((p) => Math.round(sim.motor(P(p)).pos - sim.motor(P(p)).offset)),
    m_reset: wrap((p, pos) => { const m = sim.motor(P(p)); m.offset = m.pos - pos; }),
    m_abspos: wrap((p) => { const v = Math.round(sim.motor(P(p)).pos) % 360; return ((v + 540) % 360) - 180; }),
    m_vel: wrap((p) => Math.round(sim.motor(P(p)).vel)),
    // пара
    p_pair: wrap((pair, a, b) => { sim.pairs[pair] = [P(a), P(b)]; sim.motor(P(a)); sim.motor(P(b)); }),
    p_unpair: wrap((pair) => { delete sim.pairs[pair]; }),
    p_move: wrap((pair, s, v, a) => { const [l, r] = steer(s); sim.pairMove(pair, v * l, v * r, a); }),
    p_tank: wrap((pair, l, r, a) => sim.pairMove(pair, l, r, a)),
    p_stop: wrap((pair, mode) => sim.pairStop(pair, stopMode(mode))),
    p_deg: wrap((pair, d, s, v, a, dc) => { const [l, r] = steer(s); return sim.pairForDegrees(pair, d, l, r, v, a, dc); }),
    p_tank_deg: wrap((pair, d, lv, rv, a, dc) => {
      const m = Math.max(Math.abs(lv), Math.abs(rv)) || 1;
      return sim.pairForDegrees(pair, d, lv / m, rv / m, m, a, dc);
    }),
    p_time: wrap((pair, ms, s, v, a) => { const [l, r] = steer(s); sim.pairMove(pair, v * l, v * r, a); return wait(ms).then(() => { sim.pairStop(pair); return 0; }); }),
    p_tank_time: wrap((pair, ms, lv, rv, a) => { sim.pairMove(pair, lv, rv, a); return wait(ms).then(() => { sim.pairStop(pair); return 0; }); }),
    // датчики
    reflection: wrap((p) => sim.reflection(P(p))),
    color: wrap((p) => sim.color(P(p))),
    rgbi: wrap((p) => sim.rgbi(P(p))),
    distance: wrap((p) => sim.distance(P(p))),
    force: wrap((p) => sim.force(P(p))),
    pressed: wrap((p) => sim.forcePressed(P(p))),
    tilt: wrap(() => [sim.yawDeci(), 0, 0]),
    gyro: wrap(() => [0, 0, 0]),
    reset_yaw: wrap((a) => sim.resetYaw(a)),
    button: wrap((b) => (b === 1 ? (sim.buttons.left ? 100 : 0) : b === 2 ? (sim.buttons.right ? 100 : 0) : 0)),
    // матрица и звук
    matrix_write: wrap((text, _i, tpc) => { sim.matrix = { text, image: null, pixels: null }; snapshot(); return wait(Math.max(1, text.length) * tpc); }),
    matrix_image: wrap((id) => { sim.matrix = { text: "", image: id, pixels: IMAGES[id] ? [...IMAGES[id]].map((c) => (c === "1" ? 100 : 0)) : null }; }),
    matrix_clear: wrap(() => { sim.matrix = { text: "", image: null, pixels: null }; }),
    matrix_pixel: wrap((x, y, i) => { const px = sim.matrix.pixels ? [...sim.matrix.pixels] : new Array(25).fill(0); if (x >= 0 && x < 5 && y >= 0 && y < 5) px[y * 5 + x] = i; sim.matrix = { text: "", image: null, pixels: px }; }),
    matrix_get: wrap((x, y) => (sim.matrix.pixels ? sim.matrix.pixels[y * 5 + x] || 0 : 0)),
    matrix_show: wrap((px) => { sim.matrix = { text: "", image: null, pixels: Array.from(px).slice(0, 25) }; }),
    beep: wrap((f, d, v) => { sim.beeps.push(f); post({ type: "beep", freq: f, ms: d / speed, vol: v }); return wait(d); }),
  };

  const out = [];
  const mp = await loadMicroPython({ url: wasmUrl, heapsize: 4 * 1024 * 1024, pystack: 4096,
    stdout: (l) => { sim.prints.push(l); post({ type: "print", line: l }); }, stderr: (l) => out.push(l), linebuffer: true });
  try { mp.FS.mkdir("/lib"); } catch (e) { /* уже есть */ }
  for (const [name, src] of Object.entries(PY_FILES)) mp.FS.writeFile("/lib/" + name, src);
  mp.registerJsModule("_sim", api);

  const driver = setInterval(catchUp, 4);
  wall0 = now();
  let error = null;
  try {
    await mp.runPythonAsync(code);
    await mp.runPythonAsync("import runloop as _rl\nimport asyncio as _aio\nif _rl._tasks:\n    await _aio.gather(*_rl._tasks)\n");
  } catch (e) {
    error = String(e && e.message || e) + (out.length ? "\n" + out.join("\n") : "");
  }
  // программа закончилась: моторы останавливаются, как на хабе
  catchUp();
  for (const p of PORTS) if (sim.motors[p]) { sim.cancelJob(sim.motors[p]); sim.motors[p].cmd = 0; sim.motors[p].decel = 12000; }
  if (sim.pairJob) { const r = sim.pairJob.resolve; sim.pairJob = null; r(3); }
  const tEnd = sim.t + 0.4;
  while (sim.t < tEnd) sim.step(DT);
  clearInterval(driver);
  stopped = true;
  post({ type: "state", state: sim.snapshot() });
  post({ type: "done", error, prints: sim.prints.length, beeps: sim.beeps.length });
  return { sim, error };
}

export function explainError(text) {
  const t = String(text || "");
  const line = (t.match(/line (\d+)/g) || []).pop();
  let hint = "";
  if (/NameError/.test(t)) { const m = t.match(/name '(\w+)'/); hint = `Неизвестное имя «${m ? m[1] : "?"}»: проверьте написание и import.`; }
  else if (/ImportError|no module named/i.test(t)) hint = "Такого модуля нет. В SPIKE 3: hub, motor, motor_pair, color_sensor, distance_sensor, force_sensor, color, runloop.";
  else if (/IndentationError/.test(t)) hint = "Отступы: внутри def, if, while, for строки сдвигаются на 4 пробела одинаково.";
  else if (/SyntaxError/.test(t)) hint = "Синтаксис: проверьте двоеточия после def/if/while, скобки и кавычки.";
  else if (/TypeError.*argument/.test(t)) hint = "Не то количество аргументов у функции: сравните со справкой SPIKE 3.";
  else if (/На порту/.test(t)) hint = "Проверьте схему портов робота задания (вкладка «Робот»).";
  else if (/await.*outside|outside.*async/i.test(t)) hint = "await можно писать только внутри async def.";
  return { text: t, line: line ? +line.split(" ")[1] : null, hint };
}
