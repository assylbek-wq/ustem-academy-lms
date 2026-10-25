// Полет CubeSat на тросе под аэростатом (правила WSO CubeSat 13.5.3): подъем, висение, спуск.
// Здесь только физика окружения по времени t (с): высота, атмосфера, вращение, освещение. Без DOM.
import { flightPlan } from "./model.js";

/** Детерминированный генератор случайных чисел: одинаковый полет при каждом запуске */
export function rng(seed) {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const gauss = (r) => Math.sqrt(-2 * Math.log(Math.max(1e-9, r()))) * Math.cos(2 * Math.PI * r());

export class Environment {
  constructor(flight = {}) {
    this.f = flightPlan(flight);
  }

  /** Высота над землей, м */
  alt(t) {
    const f = this.f;
    if (t <= f.tLaunch) return 0;
    if (t <= f.tTop) return (t - f.tLaunch) * f.ascent;
    if (t <= f.tDescend) return f.altMax + 3 * Math.sin((t - f.tTop) / 40); // висение: трос немного «дышит»
    if (t <= f.tLand) return Math.max(0, f.altMax - (t - f.tDescend) * f.descent);
    return 0;
  }
  vz(t) { const f = this.f; return t > f.tLaunch && t <= f.tTop ? f.ascent : t > f.tDescend && t <= f.tLand ? -f.descent : 0; }
  phase(t) {
    const f = this.f;
    return t < f.tLaunch ? "pre" : t < f.tTop ? "ascent" : t < f.tDescend ? "hold" : t < f.tLand ? "descent" : "landed";
  }

  /** Атмосфера по модели стандартной атмосферы от наземных условий */
  pressure(t) {
    const h = this.alt(t), T0 = this.f.groundT + 273.15;
    return this.f.groundP * Math.pow(1 - (0.0065 * h) / T0, 5.25588);
  }
  airTemp(t) { return this.f.groundT - 0.0065 * this.alt(t); }
  humidity(t) { return Math.max(8, 55 - this.alt(t) * 0.018); }
  co2(t) { return 420 + 25 * Math.exp(-this.alt(t) / 150); }

  /** Вращение спутника на тросе вокруг вертикали и раскачка */
  yaw(t) { return (this.f.spin * t + 25 * Math.sin(t / 7)) % 360; }
  swing(t) { return this.alt(t) > 0 ? 6 * Math.sin(t / 3.1) + 3 * Math.sin(t / 1.3) : 0; } // градусы

  /** Освещенность на датчике, лк: солнце с одной стороны, датчик вращается вместе со спутником */
  lux(t) {
    const a = (this.yaw(t) * Math.PI) / 180;
    return Math.max(800, 52000 * (0.55 + 0.45 * Math.cos(a))) * (1 + this.alt(t) / 20000);
  }
  /** Доля мощности солнечных панелей на боковых гранях */
  sun(t) { return 0.32 + 0.08 * Math.cos((this.yaw(t) * Math.PI) / 90); }

  /** Геометрия до станции: расстояние и угол места, если смотреть со станции */
  geometry(t) {
    const h = this.alt(t) + 1.5;
    return { dist: Math.hypot(h, this.f.station), elev: (Math.atan2(h, this.f.station) * 180) / Math.PI };
  }

  /** Координаты спутника: точка старта, снос ветром на высоте */
  position(t) {
    const h = this.alt(t), drift = h * 0.08;
    return { lat: this.f.lat + (drift * Math.cos(0.7)) / 111320, lon: this.f.lon + (drift * Math.sin(0.7)) / (111320 * Math.cos((this.f.lat * Math.PI) / 180)), alt: h };
  }
}
