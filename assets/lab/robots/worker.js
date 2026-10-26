// Web Worker симулятора роботов: MuJoCo (WebAssembly) + MicroPython. Программа проходит задание в виртуальном
// времени, интерфейс проигрывает запись. В режиме «Пульт» физика идет в реальном времени по командам с клавиатуры.
import { RobotSim, unpack, FPS } from "./engine.js";
import { runProgram } from "./vm.js";
import { evaluate } from "./checks.js";

let mj = null, pack = null, packRobot = null, base = "", live = null;

async function loadMj() {
  if (!mj) { const mod = await import(base + "robots/mujoco.js"); mj = await mod.default(); }
  return mj;
}
async function loadPack(robot, url) {
  if (packRobot !== robot) { pack = unpack(await (await fetch(url)).arrayBuffer()); packRobot = robot; }
  return pack;
}
function packFrames(frames) {
  const n = frames.length ? frames[0].length : 0;
  const all = new Float32Array(frames.length * n);
  frames.forEach((f, i) => all.set(f, i * n));
  return { all, stride: n };
}
function rowsOut(rows) {
  return rows.map((r) => ({ t: r.t, x: r.x, y: r.y, z: r.z, roll: r.roll, pitch: r.pitch, yaw: r.yaw, vx: r.vx, fell: r.fell, hit: r.hit, q: r.q, qd: r.qd, tau: r.tau }));
}
function stopLive() { if (live) { clearInterval(live.timer); live.sim.delete(); live = null; } }

self.onmessage = async (e) => {
  const m = e.data;
  try {
    if (m.type === "init") {
      base = m.base;
      await loadMj(); await loadPack(m.preset.robot, m.packUrl);
      const sim = new RobotSim(mj, pack, m.preset);
      const vis = sim.visuals();
      const first = sim.frames[0];
      sim.delete();
      self.postMessage({ type: "ready", visuals: vis, first });
    } else if (m.type === "run") {
      stopLive();
      await loadMj(); await loadPack(m.preset.robot, m.packUrl);
      const sim = new RobotSim(mj, pack, m.preset);
      const mod = await import(m.mjsUrl);
      const limit = m.preset.limit || 10;
      const out = await runProgram({ sim, code: m.code, limit, wasmUrl: m.wasmUrl, loadMicroPython: mod.loadMicroPython });
      const res = sim.result();
      const checks = evaluate(m.preset, res, m.code);
      const { all, stride } = packFrames(res.frames);
      const msg = { type: "done", prints: out.prints, error: out.error, checks, frames: all, stride, fps: FPS, rows: rowsOut(res.rows),
        info: { fellAt: res.fellAt, hits: res.hits, maxTilt: res.maxTilt, satShare: res.satShare, maxDq: res.maxDq, t: res.t } };
      sim.delete();
      self.postMessage(msg, [all.buffer]);
    } else if (m.type === "live") {
      stopLive();
      if (!m.on) return;
      await loadMj(); await loadPack(m.preset.robot, m.packUrl);
      const sim = new RobotSim(mj, pack, m.preset);
      live = { sim, start: Date.now() };
      live.timer = setInterval(() => {
        // время симуляции догоняет настенные часы, но не больше 0,1 с за раз (если вкладка была в фоне)
        const want = (Date.now() - live.start) / 1000;
        if (want - sim.t > 0.1) live.start = Date.now() - (sim.t + 0.1) * 1000;
        sim.advance(Math.min(0.1, Math.max(0, want - sim.t)));
        const f = sim.frames[sim.frames.length - 1];
        const r = sim.rows[sim.rows.length - 1];
        sim.frames.length = 0; sim.rows.length = 0;
        if (f) self.postMessage({ type: "frame", frame: f, row: { t: r.t, x: r.x, y: r.y, z: r.z, roll: r.roll, pitch: r.pitch, yaw: r.yaw, vx: r.vx, fell: r.fell, q: r.q, qd: r.qd, tau: r.tau } });
      }, 1000 / FPS);
    } else if (m.type === "sport" && live) {
      const err = live.sim.sportCmd(m.name, m.args || []);
      if (err) self.postMessage({ type: "note", text: err });
    } else if (m.type === "joints" && live) {
      const s = live.sim, n = s.n;
      const q = Array.from(s.cmd.q);
      for (const [i, v] of Object.entries(m.q)) q[+i] = v;
      const kp = Array.from(s.cmd.kp), kd = Array.from(s.cmd.kd);
      s.setLowCmd(q, new Array(n).fill(0), kp, kd, new Array(n).fill(0));
    } else if (m.type === "push" && live) {
      live.sim.pushes.push({ t: live.sim.t, dur: 0.15, f: m.f });
    } else if (m.type === "reset" && live) {
      live.sim.reset(); live.start = Date.now();
    }
  } catch (err) {
    self.postMessage({ type: "fail", error: String((err && err.message) || err) });
  }
};
