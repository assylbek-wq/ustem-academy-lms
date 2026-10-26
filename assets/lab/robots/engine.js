// Ядро симулятора роботов Unitree на MuJoCo (WebAssembly). Без DOM: работает в Web Worker и в Node (тесты).
// Физика 500 Гц (шаг модели 2 мс). Моторы как в unitree_sdk2: на каждом шаге физики привод считает
// tau = kp * (q* - q) + kd * (dq* - dq) + tau_ff и ограничивает момент пределом мотора. Команда держится до следующей.
import { ROBOTS, quatToRpy } from "./models.js";
import { Trot } from "./gait.js";

export const FPS = 50; // кадров записи в секунду

// Пакет модели: [4 байта длина заголовка][JSON][файлы]
export function unpack(buf) {
  const u8 = new Uint8Array(buf);
  const n = new DataView(u8.buffer, u8.byteOffset, 4).getUint32(0, true);
  const head = JSON.parse(new TextDecoder().decode(u8.subarray(4, 4 + n)));
  const files = new Map();
  for (const f of head.files) files.set(f.name, u8.subarray(4 + n + f.off, 4 + n + f.off + f.len));
  return { model: head.model, files };
}

const esc = (s) => String(s).replace(/[^a-zA-Z0-9_.-]/g, "");
const num = (v, d = 0) => (Number.isFinite(+v) ? +v : d);
const vec = (a, n, d = 0) => Array.from({ length: n }, (_, i) => num(a && a[i], d)).join(" ");

// Сцена задания: модель робота + пол + препятствия и метки
export function sceneXml(robot, world = {}) {
  const R = ROBOTS[robot];
  const geoms = [];
  (world.boxes || []).forEach((b, i) => {
    geoms.push(`<geom name="obs_${esc(b.name || i)}" type="box" pos="${vec(b.pos, 3)}" size="${vec(b.size, 3, 0.05)}" euler="0 0 ${num(b.yaw)}" rgba="${vec(b.rgba || [0.55, 0.57, 0.6, 1], 4, 1)}" contype="1" conaffinity="3" friction="${num(b.friction, 0.9)}"/>`);
  });
  (world.marks || []).forEach((m, i) => {
    geoms.push(`<geom name="mark_${i}" type="cylinder" pos="${vec([m.pos?.[0], m.pos?.[1], 0.001], 3)}" size="${num(m.r, 0.15)} 0.001" rgba="${vec(m.rgba || [0.95, 0.75, 0.1, 0.9], 4, 1)}" contype="0" conaffinity="0" group="1"/>`);
  });
  return `<mujoco model="${R.id} task">
  <include file="${R.model}"/>
  <statistic center="0 0 0.3" extent="1.2"/>
  <worldbody>
    <light pos="0 0 3" dir="0 0 -1" directional="true"/>
    <geom name="floor" size="0 0 0.05" type="plane" rgba="0.2 0.3 0.4 1" contype="1" conaffinity="3" friction="${num(world.friction, 1)}"/>
    ${geoms.join("\n    ")}
  </worldbody>
</mujoco>`;
}

const OBJ = { body: 1, joint: 3, geom: 5, site: 6, actuator: 19 };

export class RobotSim {
  // mj - модуль MuJoCo; pack - результат unpack(); preset - задание (robot, start, mode, world, hang, pushes, limit)
  constructor(mj, pack, preset = {}) {
    this.mj = mj; this.preset = preset; this.R = ROBOTS[preset.robot || "go2"];
    const R = this.R;
    const dir = "/" + R.id;
    try { mj.FS.mkdir(dir); } catch (e) { /* есть */ }
    try { mj.FS.mkdir(dir + "/assets"); } catch (e) { /* есть */ }
    for (const [name, data] of pack.files) mj.FS.writeFile(`${dir}/${name}`, data);
    mj.FS.writeFile(`${dir}/task.xml`, sceneXml(R.id, preset.world || {}));
    this.m = mj.MjModel.from_xml_path(`${dir}/task.xml`);
    this.d = new mj.MjData(this.m);
    const m = this.m;
    this.dt = m.opt.timestep;
    this.n = R.motors.length;
    this.act = R.motors.map((name) => mj.mj_name2id(m, OBJ.actuator, name));
    if (this.act.some((a) => a < 0)) throw new Error("В модели нет привода: " + R.motors[this.act.findIndex((a) => a < 0)]);
    const trn = m.actuator_trnid, qadr = m.jnt_qposadr, vadr = m.jnt_dofadr, cr = m.actuator_ctrlrange, jr = m.jnt_range;
    this.qa = this.act.map((a) => qadr[trn[2 * a]]);
    this.va = this.act.map((a) => vadr[trn[2 * a]]);
    this.lim = this.act.map((a) => [cr[2 * a], cr[2 * a + 1]]);
    this.range = this.act.map((a) => [jr[2 * trn[2 * a]], jr[2 * trn[2 * a] + 1]]);
    this.baseId = mj.mj_name2id(m, OBJ.body, R.base);
    this.nbody = m.nbody;
    // геометрии препятствий и стоп для контактов
    this.obsGeoms = new Set();
    for (let g = 0; g < m.ngeom; g++) {
      const name = mj.mj_id2name(m, OBJ.geom, g) || "";
      if (name.startsWith("obs_")) this.obsGeoms.add(g);
    }
    this.floorId = mj.mj_name2id(m, OBJ.geom, "floor");
    this.robotGeom = new Uint8Array(m.ngeom);
    for (let g = 0; g < m.ngeom; g++) this.robotGeom[g] = m.geom_bodyid[g] > 0 ? 1 : 0;
    if (R.id === "go2") this.footGeoms = R.feet.map((f) => [mj.mj_name2id(m, OBJ.geom, f)]);
    else {
      const bodies = R.feet.map((b) => mj.mj_name2id(m, OBJ.body, b));
      this.footGeoms = bodies.map((b) => { const gs = []; for (let g = 0; g < m.ngeom; g++) if (m.geom_bodyid[g] === b && m.geom_contype[g]) gs.push(g); return gs; });
    }
    this.cf = new Float64Array(6);
    this.reset();
  }

  delete() { try { this.d.delete(); this.m.delete(); } catch (e) { /* уже */ } }

  reset() {
    const { mj, m, d, R, preset } = this;
    mj.mj_resetData(m, d);
    const st = preset.start || {};
    const pose = R.poses[st.pose || (R.id === "go2" ? "lie" : "stand")] || R.poses.stand;
    const yaw = num(st.yaw);
    d.qpos[0] = num(st.x); d.qpos[1] = num(st.y); d.qpos[2] = R.startZ[st.pose] ?? R.startZ.stand ?? 0.4;
    d.qpos[3] = Math.cos(yaw / 2); d.qpos[4] = 0; d.qpos[5] = 0; d.qpos[6] = Math.sin(yaw / 2);
    for (let i = 0; i < this.n; i++) d.qpos[this.qa[i]] = pose[i];
    mj.mj_forward(m, d);
    // команда моторам (как LowCmd): q, dq, kp, kd, tau
    const kp = (i) => (Array.isArray(R.kp) ? R.kp[i] : R.kp), kd = (i) => (Array.isArray(R.kd) ? R.kd[i] : R.kd);
    this.cmd = { q: Float64Array.from(pose), dq: new Float64Array(this.n), kp: new Float64Array(this.n), kd: new Float64Array(this.n), tau: new Float64Array(this.n) };
    for (let i = 0; i < this.n; i++) { this.cmd.kp[i] = kp(i); this.cmd.kd[i] = kd(i); }
    // устояться 0,4 с в стартовой позе
    this.t = 0; this.steps = 0; this.pushes = []; this.sport = null; this.maxDq = 0; this.satSteps = 0;
    for (let s = 0; s < 200; s++) this.physics();
    this.s0 = this.steps;
    if (!preset.hold) { this.cmd.kp.fill(0); this.cmd.kd.fill(R.id === "go2" ? 0.5 : 1); }
    this.t = 0; this.calls = 0;
    this.frames = []; this.rows = []; this.hits = 0; this.hitT = null; this.fellAt = null; this.maxTilt = 0;
    this.satSteps = 0; this.maxDq = 0; this.yawU = this.rpy()[2]; this.yawPrev = this.yawU;
    this.maxKp = new Float64Array(this.n);
    this.mode = preset.mode === "sport" ? "sport" : "low";
    this.sport = null;
    if (this.mode === "sport") this.sportInit(st.pose === "lie" ? "lie" : "stand");
    this.pushes = (preset.pushes || []).map((p) => ({ t: num(p.t), dur: num(p.dur, 0.1), f: [num(p.f?.[0]), num(p.f?.[1]), num(p.f?.[2])] }));
    this.nextFrame = 0;
    this.record();
  }

  // ---------- Состояние ----------
  rpy() { const q = this.d.qpos; return quatToRpy(q[3], q[4], q[5], q[6]); }
  tilt() { const q = this.d.qpos; return Math.acos(Math.max(-1, Math.min(1, 1 - 2 * (q[4] * q[4] + q[5] * q[5])))); }
  bodyVel() { // скорость корпуса в его осях (vx, vy) и скорость поворота
    const d = this.d, yaw = this.rpy()[2], c = Math.cos(yaw), s = Math.sin(yaw);
    return [c * d.qvel[0] + s * d.qvel[1], -s * d.qvel[0] + c * d.qvel[1], this.yawRate()];
  }
  yawRate() { // угловая скорость вокруг вертикали мира из угловой скорости в осях корпуса
    const q = this.d.qpos, w = this.d.qvel;
    const [qw, qx, qy, qz] = [q[3], q[4], q[5], q[6]];
    // третья строка матрицы поворота
    return 2 * (qx * qz - qw * qy) * w[3] + 2 * (qy * qz + qw * qx) * w[4] + (1 - 2 * (qx * qx + qy * qy)) * w[5];
  }
  footForce() {
    const { mj, m, d } = this;
    const out = this.footGeoms.map(() => 0);
    const con = d.contact; const n = d.ncon;
    for (let i = 0; i < n; i++) {
      const c = con.get(i);
      for (let k = 0; k < this.footGeoms.length; k++) {
        if (this.footGeoms[k].includes(c.geom1) || this.footGeoms[k].includes(c.geom2)) { mj.mj_contactForce(m, d, i, this.cf); out[k] += Math.abs(this.cf[0]); }
      }
      c.delete && c.delete();
    }
    con.delete && con.delete();
    return out;
  }
  obstacleHit() {
    if (!this.obsGeoms.size) return false;
    const d = this.d, con = d.contact, n = d.ncon;
    let hit = false;
    for (let i = 0; i < n && !hit; i++) {
      const c = con.get(i);
      if ((this.obsGeoms.has(c.geom1) && this.robotGeom[c.geom2]) || (this.obsGeoms.has(c.geom2) && this.robotGeom[c.geom1])) hit = true;
      c.delete && c.delete();
    }
    con.delete && con.delete();
    return hit;
  }
  // LowState одним массивом: q[n], dq[n], tau[n], rpy[3], gyro[3], acc[3], quat[4], foot[k], t
  lowState() {
    const { d, n } = this;
    const out = [];
    for (let i = 0; i < n; i++) out.push(d.qpos[this.qa[i]]);
    for (let i = 0; i < n; i++) out.push(d.qvel[this.va[i]]);
    for (let i = 0; i < n; i++) out.push(d.ctrl[this.act[i]]);
    const q = d.qpos;
    out.push(...this.rpy());
    out.push(d.qvel[3], d.qvel[4], d.qvel[5]);
    // акселерометр: (a - g) в осях корпуса
    const [w, x, y, z] = [q[3], q[4], q[5], q[6]];
    const a = [d.qacc[0], d.qacc[1], d.qacc[2] + 9.81];
    const R = [[1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y)], [2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x)], [2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)]];
    for (let r = 0; r < 3; r++) out.push(R[0][r] * a[0] + R[1][r] * a[1] + R[2][r] * a[2]);
    out.push(w, x, y, z);
    out.push(...this.footForce());
    out.push(this.t);
    return out;
  }

  // ---------- Управление ----------
  setLowCmd(q, dq, kp, kd, tau) {
    const c = this.cmd, n = this.n;
    for (let i = 0; i < n; i++) {
      c.q[i] = num(q[i], c.q[i]); c.dq[i] = num(dq[i]); c.kp[i] = Math.max(0, Math.min(500, num(kp[i]))); if (c.kp[i] > this.maxKp[i]) this.maxKp[i] = c.kp[i]; c.kd[i] = Math.max(0, Math.min(50, num(kd[i]))); c.tau[i] = num(tau[i]);
    }
  }

  sportInit(state) {
    const tr = new Trot();
    this.sport = { state, from: this.motorQ(), to: this.R.poses[state === "lie" ? "lie" : "home"], t0: -10, dur: 1, trot: tr };
    const sp = this.sport;
    sp.q = Float64Array.from(sp.to);
  }
  motorQ() { return Array.from({ length: this.n }, (_, i) => this.d.qpos[this.qa[i]]); }
  // команды SportClient: StandUp, StandDown, Damp, BalanceStand, RecoveryStand, Move, StopMove
  sportCmd(name, args = []) {
    const sp = this.sport;
    if (!sp) return "Спортивный режим выключен в этом задании: управляйте моторами через LowCmd";
    const go = (state, pose, dur) => { sp.state = state; sp.from = this.motorQ(); sp.to = this.R.poses[pose]; sp.t0 = this.t; sp.dur = dur; sp.trot.cmd = [0, 0, 0]; sp.trot.v = [0, 0, 0]; sp.trot.blend = 0; };
    if (name === "StandUp" || name === "RecoveryStand" || name === "BalanceStand") { if (sp.state !== "stand" && sp.state !== "move") go("stand", "home", this.tilt() > 1 ? 2 : 1.2); else if (sp.state === "move") { sp.trot.cmd = [0, 0, 0]; } return null; }
    if (name === "StandDown") { go("lie", "lie", 1.2); return null; }
    if (name === "Damp") { sp.state = "damp"; return null; }
    if (name === "Move") {
      if (sp.state === "lie" || sp.state === "damp") return "Робот лежит: сначала StandUp()";
      if (this.t - sp.t0 < sp.dur) return null; // еще встает
      if (sp.state !== "move") { sp.state = "move"; sp.trot.phase = 0; }
      sp.trot.cmd = [num(args[0]), num(args[1]), num(args[2])];
      return null;
    }
    if (name === "StopMove") { if (sp.state === "move") sp.trot.cmd = [0, 0, 0]; return null; }
    return "Нет такой команды: " + name;
  }

  // один шаг физики
  physics() {
    const { mj, m, d, n } = this;
    const c = this.cmd;
    let kp = c.kp, kd = c.kd, qd = c.q, dqd = c.dq, tff = c.tau;
    if (this.sport && this.mode === "sport") {
      const sp = this.sport;
      if (this.steps % SPORT_EVERY === 0 || !sp.q) {
        const ctl = SPORT_EVERY * this.dt;
        if (sp.state === "move") {
          const qm = sp.trot.update(ctl, this.bodyVel(), this.rpy()); // порядок модели (FL, FR, RL, RR)
          const q = this.act.map((a) => qm[a]); // порядок unitree_sdk2
          sp.dqv = q.map((v, i) => (v - (sp.q ? sp.q[i] : v)) / ctl);
          sp.q = q;
          if (sp.trot.blend <= 0.001 && !sp.trot.cmd.some((v) => Math.abs(v) > 0.01)) sp.state = "stand";
        } else {
          const a = Math.min(1, Math.max(0, (this.t - sp.t0) / sp.dur)), e = a * a * (3 - 2 * a);
          sp.q = sp.to.map((v, i) => sp.from[i] + (v - sp.from[i]) * e);
          sp.dqv = null;
        }
      }
      qd = sp.q; dqd = sp.dqv || ZERO; tff = ZERO;
      const damp = sp.state === "damp";
      kp = damp ? ZERO : SPORT_KP; kd = damp ? SPORT_KD_DAMP : SPORT_KD;
    }
    let satNow = 0;
    for (let i = 0; i < n; i++) {
      const q = d.qpos[this.qa[i]], dq = d.qvel[this.va[i]];
      let tau = kp[i] * (qd[i] - q) + kd[i] * ((dqd[i] || 0) - dq) + (tff[i] || 0);
      const [lo, hi] = this.lim[i];
      if (tau > hi) { tau = hi; satNow++; } else if (tau < lo) { tau = lo; satNow++; }
      d.ctrl[this.act[i]] = tau;
      if (Math.abs(dq) > this.maxDq) this.maxDq = Math.abs(dq);
    }
    if (satNow) this.satSteps++;
    // толчки и страховочный подвес
    const xf = d.xfrc_applied, b = this.baseId * 6;
    for (let k = 0; k < 6; k++) xf[b + k] = 0;
    for (const p of this.pushes) if (this.t >= p.t && this.t < p.t + p.dur) { xf[b] += p.f[0]; xf[b + 1] += p.f[1]; xf[b + 2] += p.f[2]; }
    if (this.preset.hang) {
      const z0 = this.R.startZ.stand + 0.02, z = d.qpos[2];
      xf[b + 2] += Math.max(0, 4000 * (z0 - z)) - 120 * d.qvel[2];
      xf[b] += -200 * (d.qpos[0] - num(this.preset.start?.x)) - 60 * d.qvel[0];
      xf[b + 1] += -200 * (d.qpos[1] - num(this.preset.start?.y)) - 60 * d.qvel[1];
      // трос держит таз и не дает ему завалиться: крен и тангаж тянутся к нулю
      const [r0, p0] = this.rpy();
      xf[b + 3] += -400 * r0 - 40 * d.qvel[3]; xf[b + 4] += -400 * p0 - 40 * d.qvel[4];
    }
    mj.mj_step(m, d);
    this.steps++;
  }

  // продвинуть время на seconds, записывая кадры
  advance(seconds) {
    const end = this.t + Math.max(0, seconds);
    while (this.t + this.dt / 2 < end) {
      this.physics();
      this.t = (this.steps - this.s0) * this.dt;
      const y = this.rpy()[2]; let dy = y - this.yawPrev; if (dy > Math.PI) dy -= 2 * Math.PI; if (dy < -Math.PI) dy += 2 * Math.PI;
      this.yawU += dy; this.yawPrev = y;
      if (this.t + 1e-9 >= this.nextFrame / FPS) this.record();
    }
  }

  fallen() { return this.tilt() > this.R.fallTilt || this.d.qpos[2] < this.R.fallZ; }

  record() {
    const { d, n } = this;
    const pose = new Float32Array(this.nbody * 7);
    for (let b = 0; b < this.nbody; b++) {
      for (let k = 0; k < 3; k++) pose[b * 7 + k] = d.xpos[b * 3 + k];
      for (let k = 0; k < 4; k++) pose[b * 7 + 3 + k] = d.xquat[b * 4 + k];
    }
    this.frames.push(pose);
    const rpy = this.rpy();
    const tilt = this.tilt();
    this.maxTilt = Math.max(this.maxTilt, tilt);
    const fell = this.fallen();
    if (fell && this.fellAt == null) this.fellAt = this.t;
    const hit = this.obstacleHit();
    if (hit) { this.hits++; if (this.hitT == null) this.hitT = this.t; }
    const qd = this.sport && this.mode === "sport" ? this.sport.q : this.cmd.q;
    const row = { t: +this.t.toFixed(3), x: d.qpos[0], y: d.qpos[1], z: d.qpos[2], roll: rpy[0], pitch: rpy[1], yaw: this.yawU, tilt, fell, hit,
      vx: this.bodyVel()[0], q: new Float32Array(n), qd: new Float32Array(n), tau: new Float32Array(n) };
    for (let i = 0; i < n; i++) { row.q[i] = d.qpos[this.qa[i]]; row.qd[i] = qd[i]; row.tau[i] = d.ctrl[this.act[i]]; }
    this.rows.push(row);
    this.nextFrame++;
  }

  // геометрия для отрисовки (Three.js): видимые геометрии и сетки
  visuals() {
    const m = this.m;
    const geoms = [], meshes = {};
    for (let g = 0; g < m.ngeom; g++) {
      const group = m.geom_group[g];
      const type = m.geom_type[g];
      if (type === 0) continue; // пол рисует интерфейс
      const mat = m.geom_matid[g];
      const rgba = mat >= 0 ? Array.from(m.mat_rgba.slice(mat * 4, mat * 4 + 4)) : Array.from(m.geom_rgba.slice(g * 4, g * 4 + 4));
      const mesh = type === 7 ? m.geom_dataid[g] : -1;
      geoms.push({ body: m.geom_bodyid[g], type, group, size: Array.from(m.geom_size.slice(g * 3, g * 3 + 3)), pos: Array.from(m.geom_pos.slice(g * 3, g * 3 + 3)), quat: Array.from(m.geom_quat.slice(g * 4, g * 4 + 4)), rgba, mesh });
      if (mesh >= 0 && !meshes[mesh]) {
        const va = m.mesh_vertadr[mesh], vn = m.mesh_vertnum[mesh], fa = m.mesh_faceadr[mesh], fn = m.mesh_facenum[mesh];
        meshes[mesh] = { vert: Float32Array.from(m.mesh_vert.slice(va * 3, (va + vn) * 3)), face: Uint32Array.from(m.mesh_face.slice(fa * 3, (fa + fn) * 3)) };
      }
    }
    return { geoms, meshes, nbody: this.nbody, base: this.baseId };
  }

  // итог запуска: кадры и ряды для разбора и проверок
  result() {
    return { robot: this.R.id, t: this.t, fps: FPS, nbody: this.nbody, frames: this.frames, rows: this.rows, fellAt: this.fellAt, hits: this.hits, hitT: this.hitT,
      maxTilt: this.maxTilt, satShare: this.steps > this.s0 ? this.satSteps / (this.steps - this.s0) : 0, maxDq: this.maxDq, maxKp: Array.from(this.maxKp), labels: this.R.labels, range: this.range, lim: this.lim };
  }
}

const ZERO = new Float64Array(32);
const SPORT_KP = new Float64Array(32).fill(150);
const SPORT_KD = new Float64Array(32).fill(4);
const SPORT_KD_DAMP = new Float64Array(32).fill(1.5);
const SPORT_EVERY = 10;
