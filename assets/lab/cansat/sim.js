// Полет CanSat для бортовой программы: траектория посчитана заранее (physics.js), датчики читают ее.
import { fly } from "./physics.js";
import { DEFAULT_FLIGHT, items, linkOf, rocketOf } from "./model.js";
import { MATERIALS } from "./catalog.js";
import { onboard } from "../sat/onboard.js";
import { pressureAt, rng } from "../sat/core.js";

const PHASES = ["pre", "boost", "coast", "descent", "landed"];

/** Окружение CanSat: интерполяция записи полета + атмосфера, свет, GPS и радиотень корпуса ракеты */
export class CanEnv {
  constructor(cfg, flight) {
    const f = { ...DEFAULT_FLIGHT, ...flight };
    this.trip = fly(cfg, f);
    const ev = this.trip.ev;
    this.f = { ...f, tLaunch: ev.tLaunch, tBurnout: ev.tBurnout, tApogee: ev.tApogee, tEject: ev.tEject, tLand: ev.tLand,
               tEnd: ev.tEnd, altMax: ev.apogee, tTop: ev.tApogee, tDescend: ev.tEject };
    this.ev = ev;
    this.rows = this.trip.can;
    const r = rng((f.seed || 11) * 53);
    this.gpsFix = 26 + r() * 14;
    this.shield = (MATERIALS[rocketOf(cfg).material] || MATERIALS.paper).rf;
    this.carbon = rocketOf(cfg).material === "carbon";
    this.i = 0;
  }
  /** Запись полета в момент t (линейная интерполяция) */
  at(t) {
    const a = this.rows;
    if (t <= a[0].t) return a[0];
    if (t >= a[a.length - 1].t) return a[a.length - 1];
    let i = this.i;
    if (a[i].t > t) i = 0;
    while (i < a.length - 2 && a[i + 1].t < t) i++;
    this.i = i;
    const p = a[i], q = a[i + 1], k = (t - p.t) / Math.max(1e-6, q.t - p.t);
    const o = {};
    for (const key of ["x", "z", "vx", "vz", "th", "fx", "fz", "gx", "gy", "gz"]) o[key] = p[key] + (q[key] - p[key]) * k;
    o.ph = k < 0.5 ? p.ph : q.ph; o.t = t;
    return o;
  }
  alt(t) { return Math.max(0, this.at(t).z); }
  phase(t) { return PHASES[this.at(t).ph] || "pre"; }
  pressure(t) { return pressureAt(this.alt(t), this.f.groundP, this.f.groundT); }
  airTemp(t) { return this.f.groundT - 0.0065 * this.alt(t) + 0.3 * Math.sin(t / 23); }
  humidity(t) { return Math.max(10, 42 - this.alt(t) * 0.012); }
  co2(t) { return 425; }
  accel(t) { const s = this.at(t); return [s.fx, 0.25 * Math.sin(t * 3.1) * (s.ph === 3 ? 1 : 0.2), s.fz]; }
  gyro(t) { const s = this.at(t); return [s.gx, s.gy, s.gz]; }
  /** В отсеке ракеты темно; под парашютом свет мигает от вращения */
  lux(t) {
    const s = this.at(t);
    if (s.ph === 1 || s.ph === 2) return 3;
    const spin = (t * (s.gz || 0) * Math.PI) / 180;
    return s.ph === 4 ? 21000 : Math.max(900, 48000 * (0.55 + 0.45 * Math.cos(spin)));
  }
  yaw(t) { return ((t * (this.at(t).gz || 0)) % 360 + 360) % 360; }
  /** Станция сбоку от стартовой площадки; пока CanSat в отсеке, корпус ракеты ослабляет сигнал */
  geometry(t) {
    const s = this.at(t), sx = -0.5 * this.f.station, sy = 0.85 * this.f.station;
    const dist = Math.hypot(s.x - sx, sy, s.z + 1);
    const elev = (Math.atan2(s.z + 1, Math.hypot(s.x - sx, sy)) * 180) / Math.PI + (s.th || 0) * 20;
    let extra = 0;
    if (s.ph <= 2) extra = this.shield;            // внутри отсека (до старта и до вышибного заряда)
    if (s.ph === 4) extra = 12;                     // лежит в траве
    return { dist, elev, extra };
  }
  /** GPS: обновление раз в секунду, нет фиксации в отсеке из карбона и при перегрузке больше 4 g */
  position(t) {
    const tt = Math.floor(t);
    const s = this.at(tt);
    if (this.carbon && s.ph <= 2) return null;
    if (s.ph === 1 || (s.ph === 2 && tt < this.f.tBurnout + 3)) return null;
    const f = this.f;
    return { lat: f.lat + (s.x * Math.cos(0.4)) / 111320, lon: f.lon + (s.x * Math.sin(0.4)) / (111320 * Math.cos((f.lat * Math.PI) / 180)), alt: 690 + Math.max(0, s.z) };
  }
}

export function createSim(config, flight) {
  const env = new CanEnv(config, flight);
  const parts = items(config);
  const origPos = env.position.bind(env);
  env.position = (t) => origPos(t) || { lat: NaN };
  const sim = onboard(parts, env, { link: linkOf(config), tau: 240, rth: 25, sampleStep: 0.1,
    // жесткая посадка ломает электронику (данные на SD сохраняются)
    destroyed: (t) => t >= env.f.tLand && env.ev.vLandCan > 18,
    sampleExtra: (t) => { const s = env.at(t); return { x: +s.x.toFixed(1), vz: +s.vz.toFixed(1), g: +(Math.hypot(s.fx, s.fz) / 9.80665).toFixed(2) }; } });
  // GPS: null без фиксации
  const vec = sim.api.vec;
  sim.api.vec = (key) => {
    const v = vec(key);
    if (key === "gps" && Array.isArray(v) && Number.isNaN(v[0])) return null;
    return v;
  };
  sim.trip = env.trip;
  const result = sim.result;
  sim.result = () => ({ ...result(), ev: env.ev, trip: { rocket: thin(env.trip.rocket), can: thin(env.trip.can) } });
  return sim;
}

/** Прореживание записи для передачи в интерфейс (сцена полета): шаг 0,1 с */
function thin(rows) {
  const out = []; let next = -1;
  for (const r of rows) if (r.t >= next) { out.push({ t: r.t, x: +r.x.toFixed(2), z: +r.z.toFixed(2), th: +r.th.toFixed(3), ph: r.ph }); next = r.t + 0.1 - 1e-9; }
  return out;
}
