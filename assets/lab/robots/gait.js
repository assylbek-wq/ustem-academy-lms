// Шаг Go2 (рысь) и обратная кинематика ноги. Это аналог SportClient из unitree_sdk2: высокий уровень
// задает скорость (vx, vy, wz), контроллер сам выбирает углы суставов. Чистые функции, без DOM.
export const LEG = 0.213;
export const HIP_Y = 0.0955;
// Порядок ног в модели MuJoCo: FL, FR, RL, RR (в unitree_sdk2: FR, FL, RR, RL)
export const HIPS = [[0.1934, 0.0465], [0.1934, -0.0465], [-0.1934, 0.0465], [-0.1934, -0.0465]];
export const SIDE = [1, -1, 1, -1];
export const STAND = [0, 0.9, -1.8];

// Обратная задача для одной ноги: точка стопы (x, y, z) в осях бедра -> углы [hip, thigh, calf]
export function legIK(x, y, z, side) {
  const l1 = HIP_Y * side;
  const d2 = y * y + z * z;
  const L = Math.sqrt(Math.max(d2 - l1 * l1, 1e-6));
  const q0 = Math.atan2(z, y) - Math.atan2(-L, l1);
  const r = Math.min(Math.sqrt(x * x + L * L), 2 * LEG * 0.999);
  const c = (r * r - 2 * LEG * LEG) / (2 * LEG * LEG);
  const q2 = -Math.acos(Math.max(-1, Math.min(1, c)));
  const a = Math.atan2(-x, L);
  return [q0, a - q2 / 2, q2];
}

// Прямая задача: углы -> точка стопы в осях бедра
export function legFK(q0, q1, q2, side) {
  const l1 = HIP_Y * side;
  const xp = -LEG * Math.sin(q1) - LEG * Math.sin(q1 + q2);
  const zp = -LEG * Math.cos(q1) - LEG * Math.cos(q1 + q2);
  const c = Math.cos(q0), s = Math.sin(q0);
  return [xp, l1 * c - zp * s, l1 * s + zp * c];
}

export class Trot {
  constructor(opts = {}) {
    this.T = opts.period || 0.36; // период шага, с
    this.h = opts.height || 0.27; // высота корпуса
    this.lift = opts.lift || 0.07; // высота подъема стопы
    this.phase = 0;
    this.v = [0, 0, 0];
    this.cmd = [0, 0, 0];
    this.blend = 0; // 0 - стоит, 1 - идет
    this.x0 = opts.x0 ?? 0;
    this.comp = [0, 0, 0]; // поправка шага по измеренной скорости (интегральная)
  }
  // dt шага регулятора; meas - измеренная скорость корпуса в его осях [vx, vy, wz]; rp - крен и тангаж.
  // Возвращает 12 углов в порядке модели.
  update(dt, meas = null, rp = [0, 0]) {
    const lim = [0.8, 0.4, 1.5];
    for (let i = 0; i < 3; i++) {
      const target = Math.max(-lim[i], Math.min(lim[i], this.cmd[i]));
      const rate = i === 2 ? 3 : 1.2;
      this.v[i] += Math.max(-rate * dt, Math.min(rate * dt, target - this.v[i]));
    }
    const moving = Math.abs(this.v[0]) + Math.abs(this.v[1]) + Math.abs(this.v[2]) > 0.02 || Math.abs(this.cmd[0]) + Math.abs(this.cmd[1]) + Math.abs(this.cmd[2]) > 0.01;
    this.blend += Math.max(-dt * 4, Math.min(dt * 4, (moving ? 1 : 0) - this.blend));
    this.phase = (this.phase + dt / this.T) % 1;
    if (meas && this.blend > 0.9) {
      for (let i = 0; i < 3; i++) {
        this.comp[i] += dt * 1.5 * (this.v[i] - meas[i]);
        const cap = Math.abs(this.v[i]) * 1.2 + 0.15;
        this.comp[i] = Math.max(-cap, Math.min(cap, this.comp[i]));
      }
    } else if (this.blend < 0.5) this.comp = [0, 0, 0];
    const v = [0, 1, 2].map((i) => this.v[i] + this.comp[i]);
    const q = [];
    for (let k = 0; k < 4; k++) {
      const [hx, hy] = HIPS[k];
      // скорость точки опоры с учетом поворота
      const lvx = v[0] - v[2] * hy;
      const lvy = v[1] + v[2] * hx;
      const ph = (this.phase + (k === 0 || k === 3 ? 0 : 0.5)) % 1;
      const half = this.T / 2;
      let x, y, z;
      if (ph < 0.5) { // опора: стопа едет назад
        const s = ph / 0.5;
        x = lvx * half * (0.5 - s);
        y = lvy * half * (0.5 - s);
        z = 0;
      } else { // перенос
        const s = (ph - 0.5) / 0.5;
        const e = 0.5 - 0.5 * Math.cos(Math.PI * s);
        x = lvx * half * (-0.5 + e);
        y = lvy * half * (-0.5 + e);
        z = this.lift * Math.sin(Math.PI * s) * this.blend;
      }
      x *= this.blend; y *= this.blend;
      // наклон корпуса компенсируем высотой стопы
      const dz = -rp[1] * hx + rp[0] * hy;
      q.push(...legIK(x + this.x0, HIP_Y * SIDE[k] + y, -this.h + z + dz, SIDE[k]));
    }
    return q;
  }
}
