// Физика виртуального робота SPIKE Prime на тренировочном мате: моторы с энкодерами и профилем скорости,
// пара моторов как motor_pair SPIKE 3, гироскоп хаба, датчики цвета, расстояния и силы, ящик и рычаг.
// Без DOM: работает в Web Worker и в Node для тестов.
import { MAT_W, MAT_H, sampleSpot, reflectionOf, spikeColorOf, distToPoly, LINE_CURVE } from "./mat.js";
import { Bioglow } from "./bioglow.js";
import { robotModel } from "./robots.js";

// пятно датчика цвета для поля с рисунком (как sampleSpot в mat.js, но реже: рисунок и так сглажен)
const SPOT16 = Array.from({ length: 16 }, (_, i) => { const r = 7 * Math.sqrt((i + 0.5) / 16), a = i * 2.399963; return [r * Math.cos(a), r * Math.sin(a)]; });

export const WHEEL_D = 56;                       // мм
export const MM_PER_DEG = Math.PI * WHEEL_D / 360;
export const TRACK = 112;                        // расстояние между колесами, мм
export const BODY = { front: 105, back: 75, half: 80 }; // корпус от оси колес
export const SENSOR_POS = { E: [95, -28], F: [95, 28] }; // датчики цвета: [вперед, вправо], мм
export const MAX_SPEED = { large: 1050, medium: 1110, small: 660 };
export const PORTS = ["A", "B", "C", "D", "E", "F"];
export const DT = 0.005;

export const DEFAULT_ROBOT = {
  A: "motor:large", B: "motor:large", C: "motor:medium", D: "motor:medium", E: "color", F: "color",
};

class Motor {
  constructor(kind) { this.kind = kind; this.pos = 0; this.vel = 0; this.cmd = 0; this.accel = 1000; this.decel = 1000; this.job = null; this.offset = 0; }
  get max() { return MAX_SPEED[this.kind] || 1050; }
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const OBJ_R = { marker: 24, cube: 24, crate: 30, baton: 10 };
const ramp = (cur, want, acc, dec, dt) => {
  const rate = Math.abs(want) > Math.abs(cur) && Math.sign(want || 1) === Math.sign(cur || want || 1) ? acc : dec;
  const d = want - cur, step = rate * dt;
  return Math.abs(d) <= step ? want : cur + Math.sign(d) * step;
};

// Профиль: желаемая скорость, чтобы доехать до цели и затормозить с ускорением dec
const profile = (rem, vmax, dec) => Math.sign(rem) * Math.min(vmax, Math.sqrt(2 * dec * Math.abs(rem)));

export class Robot {
  constructor(preset = {}) {
    this.preset = preset;
    this.model = robotModel(preset);
    this.ports = this.model.ports;
    this.body = this.model.body;
    this.mmPerDeg = Math.PI * this.model.wheel / 360;
    const st = preset.start || { x: 190, y: 150, h: -90 };
    this.pose = { x: st.x, y: st.y, h: (st.h || 0) * Math.PI / 180 };
    this.drift = preset.drift || 0;          // разница диаметров колес: 0,01 = правое на 1% больше
    this.motors = {};
    for (const p of PORTS) if (String(this.ports[p]).startsWith("motor")) this.motors[p] = new Motor(this.ports[p].split(":")[1] || "medium");
    this.pairs = {};
    this.pairJob = null;
    this.t = 0;
    this.yawOffset = this.pose.h;
    this.matrix = { text: "", image: null, pixels: null };
    this.prints = [];
    this.beeps = [];
    this.buttons = { left: false, right: false };
    this.box = preset.box ? { ...preset.box, r: 55 } : null;
    this.lever = preset.lever ? { ...preset.lever, up: true, flips: 0 } : null;
    this.trail = [[this.pose.x, this.pose.y]]; this.trailT = 0;
    this.maxLineDist = 0;
    this.events = [];
    this.field = preset.field === "bioglow" ? new Bioglow(preset) : null;
    this.speedMm = 0;
    // предметы уроков Competition Ready: метки (стоят на месте), кубик и ящики (их двигают корпус и навесное)
    this.objects = (preset.objects || []).map((o, i) => ({ id: o.id || o.kind + i, kind: o.kind, x: o.x, y: o.y,
      r: o.r || OBJ_R[o.kind] || 25, fixed: o.kind === "marker" || !!o.fixed, touched: false, carried: null, lifted: false }));
    this.toolState = {};
  }

  spot(x, y) {
    if (!this.field) return sampleSpot(x, y);
    let r = 0, g = 0, b = 0;
    for (const [dx, dy] of SPOT16) { const c = this.field.colorAt(x + dx, y + dy); r += c[0]; g += c[1]; b += c[2]; }
    return [r / 16, g / 16, b / 16];
  }

  device(port) { return this.ports[port]; }

  // ─── Команды моторов ───
  motor(port) {
    const m = this.motors[port];
    if (!m) throw new Error(`На порту ${port} нет мотора (там: ${this.ports[port] || "пусто"})`);
    return m;
  }

  motorRun(port, v, accel = 1000) {
    const m = this.motor(port); this.releasePair(port);
    this.cancelJob(m); m.cmd = clamp(v, -m.max, m.max); m.accel = accel; m.decel = accel;
  }

  motorStop(port, mode = "brake") {
    const m = this.motor(port); this.releasePair(port); this.cancelJob(m);
    m.cmd = 0; m.decel = mode === "coast" ? 1500 : 12000;
  }

  motorForDegrees(port, deg, v, accel = 1000, decel = 1000) {
    const m = this.motor(port); this.releasePair(port); this.cancelJob(m);
    const dir = Math.sign(deg || 1) * Math.sign(v || 1);
    return new Promise((resolve) => { m.job = { target: m.pos + Math.abs(deg) * dir, vmax: Math.min(Math.abs(v), m.max), accel, decel, resolve }; });
  }

  motorToRelative(port, position, v) {
    const m = this.motor(port); this.releasePair(port); this.cancelJob(m);
    return new Promise((resolve) => { m.job = { target: position + m.offset, vmax: Math.min(Math.abs(v), m.max), accel: 1000, decel: 1000, resolve }; });
  }

  cancelJob(m) { if (m.job) { const r = m.job.resolve; m.job = null; r(3); } }

  releasePair(port) {
    if (this.pairJob && this.pairJob.ports.includes(port)) { const r = this.pairJob.resolve; this.pairJob = null; r && r(3); }
  }

  pairPorts(pair) {
    const p = this.pairs[pair];
    if (!p) throw new Error("Пара моторов не настроена: сначала motor_pair.pair(motor_pair.PAIR_1, port.A, port.B)");
    return p;
  }

  static steer(s) {
    s = clamp(s, -100, 100);
    return s >= 0 ? [1, 1 - s / 50] : [1 + s / 50, 1];
  }

  pairMove(pair, l, r, accel = 1000) {
    const [A, B] = this.pairPorts(pair);
    if (this.pairJob) { const res = this.pairJob.resolve; this.pairJob = null; res && res(3); }
    const mA = this.motor(A), mB = this.motor(B);
    this.cancelJob(mA); this.cancelJob(mB);
    mA.cmd = clamp(-l, -mA.max, mA.max); mB.cmd = clamp(r, -mB.max, mB.max); mA.accel = mB.accel = accel; mA.decel = mB.decel = accel;
  }

  pairStop(pair, mode = "brake") {
    const [A, B] = this.pairPorts(pair);
    if (this.pairJob) { const res = this.pairJob.resolve; this.pairJob = null; res && res(3); }
    for (const p of [A, B]) { const m = this.motor(p); this.cancelJob(m); m.cmd = 0; m.decel = mode === "coast" ? 1500 : 12000; }
  }

  // Движение пары на градусы: ведущее колесо проходит |deg|, второе - пропорционально
  pairForDegrees(pair, deg, lRatio, rRatio, v, accel = 1000, decel = 1000) {
    const [A, B] = this.pairPorts(pair);
    if (this.pairJob) { const res = this.pairJob.resolve; this.pairJob = null; res && res(3); }
    const mA = this.motor(A), mB = this.motor(B);
    this.cancelJob(mA); this.cancelJob(mB);
    const k = Math.max(Math.abs(lRatio), Math.abs(rRatio)) || 1;
    const dir = Math.sign(deg || 1) * Math.sign(v || 1);
    return new Promise((resolve) => {
      this.pairJob = { ports: [A, B], A, B, l: lRatio / k * dir, r: rRatio / k * dir, total: Math.abs(deg), done: 0, vp: 0,
        vmax: Math.min(Math.abs(v), mA.max), accel, decel, resolve };
    });
  }

  // ─── Датчики ───
  local2world(f, r) {
    const p = this.pose;
    return { x: p.x - Math.sin(p.h) * f + Math.cos(p.h) * r, y: p.y + Math.cos(p.h) * f + Math.sin(p.h) * r };
  }

  sensorPoint(port) {
    const s = this.model.sensors[port] || [this.body.front - 10, 0];
    return this.local2world(s[0], s[1]);
  }

  needDevice(port, kind) {
    if (!String(this.ports[port] || "").startsWith(kind)) throw new Error(`На порту ${port} нет устройства «${kind}» (там: ${this.ports[port] || "пусто"})`);
  }

  reflection(port) { this.needDevice(port, "color"); const q = this.sensorPoint(port); return reflectionOf(this.spot(q.x, q.y)); }
  color(port) { this.needDevice(port, "color"); const q = this.sensorPoint(port); return spikeColorOf(this.spot(q.x, q.y)); }
  rgbi(port) { this.needDevice(port, "color"); const q = this.sensorPoint(port); const c = this.spot(q.x, q.y); return [...c.map((v) => Math.round(v * 4)), Math.round((c[0] + c[1] + c[2]) * 4 / 3)]; }

  distance(port) {
    this.needDevice(port, "distance");
    const o = this.local2world(this.body.front, 0), fx = -Math.sin(this.pose.h), fy = Math.cos(this.pose.h);
    let best = Infinity;
    if (fx > 1e-6) best = Math.min(best, (MAT_W - o.x) / fx); if (fx < -1e-6) best = Math.min(best, -o.x / fx);
    if (fy > 1e-6) best = Math.min(best, (MAT_H - o.y) / fy); if (fy < -1e-6) best = Math.min(best, -o.y / fy);
    for (const c of [this.box, this.lever && { x: this.lever.x, y: this.lever.y, r: 40 }, ...this.objects.filter((q) => !q.carried)]) {
      if (!c) continue;
      const dx = o.x - c.x, dy = o.y - c.y, b = dx * fx + dy * fy, cc = dx * dx + dy * dy - c.r * c.r, disc = b * b - cc;
      if (disc >= 0) { const t = -b - Math.sqrt(disc); if (t > 0) best = Math.min(best, t); }
    }
    if (this.field) best = Math.min(best, this.field.raycast(o.x, o.y, fx, fy));
    return best > 2000 ? -1 : Math.round(best);
  }

  forcePressed(port) { this.needDevice(port, "force"); return this.frontContact() < 3; }
  force(port) { this.needDevice(port, "force"); const d = this.frontContact(); return d < 3 ? 60 : 0; }

  frontContact() {
    let best = Infinity;
    for (const r of [-this.body.half + 10, 0, this.body.half - 10]) {
      const q = this.local2world(this.body.front, r);
      best = Math.min(best, q.x, q.y, MAT_W - q.x, MAT_H - q.y);
      if (this.box) best = Math.min(best, Math.hypot(q.x - this.box.x, q.y - this.box.y) - this.box.r);
      for (const o of this.objects) if (!o.carried) best = Math.min(best, Math.hypot(q.x - o.x, q.y - o.y) - o.r);
      if (this.field) best = Math.min(best, this.field.raycast(this.local2world(this.body.front - 5, r).x, this.local2world(this.body.front - 5, r).y, -Math.sin(this.pose.h), Math.cos(this.pose.h)) - 5);
    }
    return best;
  }

  yawDeci() { let a = (this.pose.h - this.yawOffset) * 180 / Math.PI; a = ((a + 180) % 360 + 360) % 360 - 180; return Math.round(a * 10); }
  resetYaw(deci) { this.yawOffset = this.pose.h - (deci / 10) * Math.PI / 180; }

  // ─── Шаг физики ───
  step(dt = DT) {
    this.t += dt;
    if (this.field && !this.matchOver && this.t >= (this.preset.matchTime || 150)) {
      this.matchOver = true;
      for (const m of Object.values(this.motors)) { this.cancelJob(m); m.cmd = 0; m.decel = 12000; }
      if (this.pairJob) { const r = this.pairJob.resolve; this.pairJob = null; r && r(3); }
      this.events.push({ toast: "Время матча вышло" });
    }
    // пара моторов на градусы
    const pj = this.pairJob;
    if (pj) {
      const rem = pj.total - pj.done;
      const want = profile(rem, pj.vmax, pj.decel);
      pj.vp = ramp(pj.vp, want, pj.accel, pj.decel, dt);
      pj.done += pj.vp * dt;
      const mA = this.motors[pj.A], mB = this.motors[pj.B];
      mA.vel = -pj.vp * pj.l; mB.vel = pj.vp * pj.r; mA.cmd = mA.vel; mB.cmd = mB.vel;
      mA.pos += mA.vel * dt; mB.pos += mB.vel * dt;
      if (pj.total - pj.done < 0.5 && Math.abs(pj.vp) < 60) {
        mA.vel = mB.vel = mA.cmd = mB.cmd = 0; this.pairJob = null; pj.resolve(0);
      }
    }
    for (const [p, m] of Object.entries(this.motors)) {
      if (pj && pj.ports.includes(p)) continue;
      if (m.job) {
        const j = m.job, rem = j.target - m.pos;
        m.vel = ramp(m.vel, profile(rem, j.vmax, j.decel), j.accel, j.decel, dt);
        if (Math.abs(rem) < 0.5 && Math.abs(m.vel) < 60) { m.pos = j.target; m.vel = 0; m.cmd = 0; m.job = null; j.resolve(0); }
      } else m.vel = ramp(m.vel, m.cmd, m.accel, m.decel, dt);
      m.pos += m.vel * dt;
    }
    this.kinematics(dt);
    this.trailT += dt;
    if (this.trailT > 0.05) { this.trailT = 0; this.trail.push([Math.round(this.pose.x), Math.round(this.pose.y)]); if (this.trail.length > 3000) this.trail.shift(); }
    if (this.preset.trackLine) {
      const q = this.sensorPoint(this.preset.trackLine);
      const d = distToPoly(q.x, q.y, LINE_CURVE);
      if (this.t > 0.3) this.maxLineDist = Math.max(this.maxLineDist, d);
    }
  }

  kinematics(dt) {
    const p = this.pose;
    let vl = 0, vr = 0;
    // колеса на портах модели: левое стоит зеркально (крутится назад, когда робот едет вперед), правое - прямо
    const [pl, pr] = this.model.drive, L = this.motors[pl], R = this.motors[pr];
    if (L) vl = -L.vel * this.mmPerDeg * (1 - this.drift / 2);
    if (R) vr = R.vel * this.mmPerDeg * (1 + this.drift / 2);
    const v = (vl + vr) / 2, w = (vr - vl) / this.model.track;
    this.speedMm = v;
    const old = { ...p };
    p.h += w * dt;
    p.x += -Math.sin(p.h) * v * dt; p.y += Math.cos(p.h) * v * dt;
    // борта стола
    const corners = [[this.body.front, -this.body.half], [this.body.front, this.body.half], [-this.body.back, -this.body.half], [-this.body.back, this.body.half]].map(([f, r]) => this.local2world(f, r));
    let dx = 0, dy = 0;
    for (const c of corners) {
      if (c.x < 0) dx = Math.max(dx, -c.x); if (c.x > MAT_W) dx = Math.min(dx, MAT_W - c.x);
      if (c.y < 0) dy = Math.max(dy, -c.y); if (c.y > MAT_H) dy = Math.min(dy, MAT_H - c.y);
    }
    if (dx || dy) {
      p.x += dx; p.y += dy;
      // упор в борт поворачивает робота вдоль стены (выравнивание о стену)
      const fx = -Math.sin(p.h), fy = Math.cos(p.h);
      const normal = Math.abs(dy) >= Math.abs(dx) ? [0, Math.sign(dy)] : [Math.sign(dx), 0];
      const along = fx * normal[0] + fy * normal[1];
      if (Math.abs(v) > 1 && Math.abs(along) > 0.6) {
        const target = Math.atan2(normal[0] * Math.sign(v), -normal[1] * Math.sign(v));
        let d = target - p.h; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
        // ошибка ориентации гасится, пока робот давит в стену
        p.h += clamp(d, -1, 1) * Math.min(1, dt * 15);
      }
    }
    // модели поля: упор в твердые части, срабатывания миссий, свободные предметы
    if (this.field) {
      this.field.collide(this, this.body);
      this.field.update(this, this.body, dt);
      for (const e of this.field.events.splice(0)) this.events.push({ toast: e });
    }
    // ящик
    if (this.box) this.pushBox(old);
    if (this.objects.length) this.updateObjects();
    // рычаг: опускается навесным на моторе C
    const tool0 = Object.keys(this.model.tools)[0];
    if (this.lever && tool0 && this.motors[tool0]) {
      const ang = this.motors[tool0].pos;
      const reach = 110 * Math.sin(clamp(ang, 0, 180) * Math.PI / 180);
      const tip = this.local2world(this.body.front + reach, 0);
      const d = Math.hypot(tip.x - this.lever.x, tip.y - this.lever.y);
      if (this.lever.up && d < 70 && ang > 60) { this.lever.up = false; this.lever.flips++; this.events.push("lever"); }
    }
  }

  // показания датчиков для панели хаба (как панель портов в приложении SPIKE)
  readings() {
    const out = {};
    for (const p of PORTS) {
      const d = String(this.ports[p] || "");
      try {
        if (d === "color") { const q = this.sensorPoint(p), c = this.spot(q.x, q.y); out[p] = { color: spikeColorOf(c), refl: reflectionOf(c) }; }
        else if (d === "distance") out[p] = { dist: this.distance(p) };
        else if (d === "force") out[p] = { force: this.force(p) };
        else if (this.motors[p]) out[p] = { pos: Math.round(this.motors[p].pos), vel: Math.round(this.motors[p].vel) };
      } catch (e) { /* нет устройства */ }
    }
    return out;
  }

  // навесное: кончик инструмента (0 градусов - поднято, 90 - опущено вперед)
  toolTip(port) {
    const t = this.model.tools[port], m = this.motors[port];
    const a = clamp(m ? m.pos : 0, 0, 180), reach = t.reach * Math.sin(a * Math.PI / 180);
    return { ...this.local2world(this.body.front + Math.max(8, reach), t.off), a };
  }

  updateObjects() {
    // метки - неподвижные: робот в них упирается (и это отмечается как касание)
    for (const o of this.objects) {
      if (o.carried) continue;
      if (o.fixed) {
        const before = { x: this.pose.x, y: this.pose.y }, b = { x: o.x, y: o.y, r: o.r };
        if (this.pushCircle(b)) { this.pose.x -= b.x - o.x; this.pose.y -= b.y - o.y; if (!o.touched) { o.touched = true; this.events.push({ toast: "Робот задел метку!" }); } }
        void before;
      } else if (this.pushCircle(o)) o.moved = true;
    }
    // отвал (бульдозер): опущенный отвал толкает предметы перед роботом
    for (const [port, t] of Object.entries(this.model.tools)) {
      const m = this.motors[port];
      if (!m) continue;
      const st = (this.toolState[port] ||= { down: false });
      const tip = this.toolTip(port);
      if (t.kind === "dozer") {
        if (tip.a < 60) continue;
        for (const o of this.objects) {
          if (o.fixed || o.carried) continue;
          const dx = o.x - this.pose.x, dy = o.y - this.pose.y, f = dx * -Math.sin(this.pose.h) + dy * Math.cos(this.pose.h), r = dx * Math.cos(this.pose.h) + dy * Math.sin(this.pose.h);
          const edge = this.body.front + t.reach;
          if (f > this.body.front - 5 && f < edge + o.r && Math.abs(r) < this.body.half) {
            const w = this.local2world(edge + o.r, r); o.x = w.x; o.y = w.y; o.moved = true;
          }
        }
        continue;
      }
      // рука и подъемная рука: опустили рядом с предметом - зацепили; подняли - несем; опустили снова - отпустили
      if (!st.down && tip.a >= 60) {
        st.down = true;
        const held = this.objects.find((o) => o.carried === port);
        if (held) { held.carried = null; held.lifted = false; held.x = tip.x; held.y = tip.y; this.events.push({ toast: "Предмет отпущен" }); }
        else {
          const o = this.objects.filter((q) => !q.fixed && !q.carried).sort((a, b) => Math.hypot(a.x - tip.x, a.y - tip.y) - Math.hypot(b.x - tip.x, b.y - tip.y))[0];
          if (o && Math.hypot(o.x - tip.x, o.y - tip.y) < o.r + 30) { o.carried = port; this.events.push({ toast: "Предмет захвачен" }); }
        }
      } else if (st.down && tip.a <= 30) { st.down = false; const held = this.objects.find((o) => o.carried === port); if (held) held.lifted = true; }
      const held = this.objects.find((o) => o.carried === port);
      if (held) { const w = this.local2world(this.body.front + held.r + 4, t.off); held.x = w.x; held.y = w.y; }
    }
    for (const o of this.objects) { o.x = clamp(o.x, o.r, MAT_W - o.r); o.y = clamp(o.y, o.r, MAT_H - o.r); }
  }

  // круглый предмет (семя, метка, модель): корпус робота выталкивает его наружу; true, если сдвинул
  pushCircle(b) {
    const p = this.pose, dx = b.x - p.x, dy = b.y - p.y;
    const f = dx * -Math.sin(p.h) + dy * Math.cos(p.h), r = dx * Math.cos(p.h) + dy * Math.sin(p.h);
    const cf = clamp(f, -this.body.back, this.body.front), cr = clamp(r, -this.body.half, this.body.half);
    const ddf = f - cf, ddr = r - cr, d = Math.hypot(ddf, ddr);
    if (d >= b.r) return false;
    let nf, nr;
    if (d < 1e-6) { nf = f >= 0 ? this.body.front + b.r : -this.body.back - b.r; nr = r; }
    else { nf = cf + ddf / d * b.r; nr = cr + ddr / d * b.r; }
    const w = this.local2world(nf, nr);
    b.x = w.x; b.y = w.y;
    return true;
  }

  pushBox() {
    const b = this.box, p = this.pose;
    const dx = b.x - p.x, dy = b.y - p.y;
    const f = dx * -Math.sin(p.h) + dy * Math.cos(p.h), r = dx * Math.cos(p.h) + dy * Math.sin(p.h);
    const cf = clamp(f, -this.body.back, this.body.front), cr = clamp(r, -this.body.half, this.body.half);
    const ddf = f - cf, ddr = r - cr, d = Math.hypot(ddf, ddr);
    if (d >= b.r) return;
    let nf, nr;
    if (d < 1e-6) { nf = f >= 0 ? this.body.front + b.r : -this.body.back - b.r; nr = r; }
    else { nf = cf + ddf / d * b.r; nr = cr + ddr / d * b.r; }
    const w = this.local2world(nf, nr);
    b.x = clamp(w.x, b.r, MAT_W - b.r); b.y = clamp(w.y, b.r, MAT_H - b.r);
  }

  boxInZone(z) { return !!this.box && this.box.x >= z.x0 && this.box.x <= z.x1 && this.box.y >= z.y0 && this.box.y <= z.y1; }
  get heading() { return this.yawDeciWorld() / 10; }
  yawDeciWorld() { let a = this.pose.h * 180 / Math.PI; return Math.round((((a + 180) % 360 + 360) % 360 - 180) * 10); }

  snapshot() {
    const m = {};
    for (const [p, mo] of Object.entries(this.motors)) m[p] = Math.round(mo.pos);
    return {
      t: this.t, pose: { x: this.pose.x, y: this.pose.y, h: this.pose.h }, motors: m, matrix: this.matrix,
      box: this.box && { x: this.box.x, y: this.box.y }, lever: this.lever && { up: this.lever.up, flips: this.lever.flips },
      sensors: Object.fromEntries(PORTS.filter((p) => String(this.ports[p]) === "color").map((p) => [p, this.sensorPoint(p)])),
      maxLineDist: this.maxLineDist, yaw: this.yawDeci(),
      field: this.field ? this.field.snapshot() : null,
      objects: this.objects.map((o) => ({ id: o.id, kind: o.kind, x: o.x, y: o.y, r: o.r, touched: o.touched, carried: o.carried, lifted: o.lifted })),
      model: this.model.name, front: this.local2world(this.body.front, 0),
      readings: this.readings(),
    };
  }
}

// ─── Проверки заданий (по снимкам состояния и выводу программы) ───
export function evalChecks(checks, cs, st, ctx) {
  const hd = (st.pose.h * 180 / Math.PI);
  const norm = (a) => ((a + 180) % 360 + 360) % 360 - 180;
  checks.forEach((c, i) => {
    const s = cs[i] ||= { ok: false };
    if (s.ok) return;
    const end = ctx.ended;
    if (c.type === "matrix") s.ok = (st.matrix.text || "").toUpperCase().includes(String(c.text).toUpperCase());
    else if (c.type === "beep") s.ok = ctx.beeps > 0;
    else if (c.type === "moved") s.ok = Math.hypot(st.pose.x - ctx.start.x, st.pose.y - ctx.start.y) >= c.mm;
    else if (c.type === "print_nums") s.ok = ctx.prints.filter((l) => /\d/.test(l)).length >= c.n;
    else if (c.type === "zone") { const z = c.zone; s.ok = (!c.end || end) && st.pose.x >= z.x0 && st.pose.x <= z.x1 && st.pose.y >= z.y0 && st.pose.y <= z.y1; }
    else if (c.type === "sensor_on" && end) { const q = st.sensors[c.port]; s.ok = !!q && q.x >= c.zone.x0 && q.x <= c.zone.x1 && q.y >= c.zone.y0 && q.y <= c.zone.y1; }
    else if (c.type === "pose_end" && end) s.ok = Math.hypot(st.pose.x - c.x, st.pose.y - c.y) <= c.tol;
    else if (c.type === "axis_end" && end) s.ok = Math.abs(st.pose[c.axis] - c.value) <= c.tol;
    else if (c.type === "heading_end" && end) s.ok = Math.abs(norm(hd - c.deg)) <= c.tol;
    else if (c.type === "line_track" && end) s.ok = st.maxLineDist <= c.max;
    else if (c.type === "box_zone") s.ok = !!st.box && st.box.x >= c.zone.x0 && st.box.x <= c.zone.x1 && st.box.y >= c.zone.y0 && st.box.y <= c.zone.y1;
    else if (c.type === "lever") s.ok = !!st.lever && !st.lever.up;
    else if (c.type === "code_has") s.ok = new RegExp(c.re).test(ctx.code || "");
    else if (c.type === "finished" && end) s.ok = ctx.finished;
    else if (c.type === "mission" && st.field) { const r = st.field.score.rows.find((x) => x.m === c.m); s.ok = !!r && r.pts >= (c.min || 1) && (!c.end || end); }
    else if (c.type === "mission_keep" && end && st.field) { const r = st.field.score.rows.find((x) => x.m === c.m); s.ok = !!r && r.pts >= c.min; }
    else if (c.type === "score_total" && st.field) s.ok = st.field.score.total >= c.min && (!c.end || end);
    else if (c.type === "obj_zone") { const o = (st.objects || []).find((q) => q.id === c.id); s.ok = (!c.end || end) && !!o && o.x >= c.zone.x0 && o.x <= c.zone.x1 && o.y >= c.zone.y0 && o.y <= c.zone.y1; }
    else if (c.type === "no_touch" && end) s.ok = !(st.objects || []).some((q) => q.kind === "marker" && q.touched);
    else if (c.type === "near_obj" && end) { const o = (st.objects || []).find((q) => q.id === c.id); const d = o && st.front ? Math.hypot(st.front.x - o.x, st.front.y - o.y) - o.r : Infinity; s.ok = d <= c.max && d >= (c.min || 0); }
    else if (c.type === "visit") { s.n ||= 0; const z = c.points[s.n]; if (z && Math.hypot(st.pose.x - z[0], st.pose.y - z[1]) <= c.tol) s.n++; s.ok = s.n >= c.points.length; }
    else if (c.type === "home_end" && end) { const hx = c.side === "right" ? MAT_W - 181 : 181; s.ok = Math.hypot(st.pose.x - hx, st.pose.y) <= 482 - 40; }
  });
  return checks.length > 0 && checks.every((_, i) => cs[i] && cs[i].ok);
}
