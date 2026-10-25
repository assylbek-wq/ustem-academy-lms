// Полет CubeSat на привязном аэростате (регламент WSO 13.5): подъем на тросе, висение, спуск.
// Ветер наклоняет трос и сносит спутник от станции, спутник вращается и раскачивается.
import { flightPlan } from "./model.js";
import { pressureAt, rng } from "../sat/core.js";

export class Environment {
  constructor(flight = {}) {
    this.f = flightPlan(flight);
    const r = rng((this.f.seed || 7) * 131);
    this.gpsFix = 26 + r() * 14; // холодный старт GPS: 26-40 с
    this.gust = r() * 100;
  }

  /** Высота над землей, м: подъем лебедкой, висение (трос немного «дышит»), спуск */
  alt(t) {
    const f = this.f;
    if (t <= f.tLaunch) return 0;
    if (t <= f.tTop) return (t - f.tLaunch) * f.ascent;
    if (t <= f.tDescend) return f.altMax + 3 * Math.sin((t - f.tTop) / 40);
    if (t <= f.tLand) return Math.max(0, f.altMax - (t - f.tDescend) * f.descent);
    return 0;
  }
  vz(t) { const f = this.f; return t > f.tLaunch && t <= f.tTop ? f.ascent : t > f.tDescend && t <= f.tLand ? -f.descent : 0; }
  phase(t) {
    const f = this.f;
    return t < f.tLaunch ? "pre" : t < f.tTop ? "ascent" : t < f.tDescend ? "hold" : t < f.tLand ? "descent" : "landed";
  }
  /** Ветер на высоте: растет с высотой (степенной закон), с порывами */
  windAt(t) {
    const h = Math.max(2, this.alt(t));
    return this.f.wind * Math.pow(h / 10, 0.14) * (1 + 0.18 * Math.sin(t / 9 + this.gust) + 0.08 * Math.sin(t / 2.3));
  }
  /** Наклон троса от ветра, градусы */
  lean(t) { return this.alt(t) > 0 ? Math.min(35, this.windAt(t) * 2.6) : 0; }
  /** Снос по горизонтали от лебедки (по ветру, от станции), м */
  drift(t) { return this.alt(t) * Math.tan((this.lean(t) * Math.PI) / 180); }

  pressure(t) { return pressureAt(this.alt(t), this.f.groundP, this.f.groundT); }
  airTemp(t) { return this.f.groundT - 0.0065 * this.alt(t) + 0.4 * Math.sin(t / 37); }
  humidity(t) { return Math.max(8, 55 - this.alt(t) * 0.018); }
  co2(t) { return 420 + 25 * Math.exp(-this.alt(t) / 150); }

  /** Вращение на тросе вокруг вертикали и раскачка */
  yaw(t) { return (((this.f.spin * t + 25 * Math.sin(t / 7)) % 360) + 360) % 360; }
  swing(t) { return this.alt(t) > 0 ? (6 * Math.sin(t / 3.1) + 3 * Math.sin(t / 1.3)) * (0.6 + this.windAt(t) / 10) : 0; }
  accel(t) {
    const sw = (this.swing(t) * Math.PI) / 180, g = 9.80665;
    const az = this.vz(t) !== this.vz(t - 0.5) ? (this.vz(t) - this.vz(t - 0.5)) * 2 : 0;
    return [g * Math.sin(sw), 0.3 * Math.sin(t / 1.7), g * Math.cos(sw) + az];
  }
  gyro(t) {
    const spin = this.alt(t) > 0 ? this.f.spin + 8 * Math.cos(t / 7) : 0;
    return [(6 / 3.1) * Math.cos(t / 3.1) * 57.3 / 57.3, 0, spin];
  }
  lux(t) {
    const a = (this.yaw(t) * Math.PI) / 180;
    return Math.max(800, 52000 * (0.55 + 0.45 * Math.cos(a))) * (1 + this.alt(t) / 20000);
  }
  sun(t) { return 0.32 + 0.08 * Math.cos((this.yaw(t) * Math.PI) / 90); }

  /** Геометрия до станции: станция стоит против ветра, спутник сносит от нее */
  geometry(t) {
    const h = this.alt(t) + 1.5, x = this.f.station + this.drift(t);
    return { dist: Math.hypot(h, x), elev: (Math.atan2(h, x) * 180) / Math.PI + this.swing(t) * 0.5 };
  }
  position(t) {
    const d = this.drift(t), f = this.f;
    return { lat: f.lat + (d * Math.cos(0.7)) / 111320, lon: f.lon + (d * Math.sin(0.7)) / (111320 * Math.cos((f.lat * Math.PI) / 180)), alt: 347 + this.alt(t) };
  }
}
