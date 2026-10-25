// Общая физика спутников WSO (CubeSat и CanSat): случайные числа, радиолиния, эфирное время пакета,
// аккумулятор и тепло внутри корпуса. Без DOM: работает в Web Worker и в Node для проверок заданий.

/** Повторяемый генератор случайных чисел (mulberry32): один и тот же полет при одном seed */
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
export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, k) => a + (b - a) * k;

// ─── Атмосфера (международная стандартная атмосфера от наземных условий) ───
export const G = 9.80665;
export function pressureAt(h, groundP, groundT) {
  const T0 = groundT + 273.15;
  return groundP * Math.pow(1 - (0.0065 * h) / T0, 5.25588);
}
export function airDensity(h, groundP = 1013.25, groundT = 15) {
  const T = groundT + 273.15 - 0.0065 * h;
  return (pressureAt(h, groundP, groundT) * 100) / (287.05 * T);
}
/** Высота по давлению: обратная формула, которую команды пишут в бортовой программе */
export const altitudeFrom = (p, p0) => 44330 * (1 - Math.pow(p / p0, 0.1903));

// ─── Радио ───
/** Потери в свободном пространстве, дБ */
export const fspl = (dKm, fMHz) => 20 * Math.log10(Math.max(dKm, 0.001)) + 20 * Math.log10(fMHz) + 32.44;
/** Потери из-за диаграммы вертикального штыря: прямо вверх и вниз он почти не излучает */
export const patternLoss = (elevDeg) => Math.min(20, -20 * Math.log10(Math.max(Math.cos((elevDeg * Math.PI) / 180), 0.1)));
export const txPowerW = (dbm) => Math.pow(10, dbm / 10) / 1000;
export const TX_LEVELS = [10, 14, 17, 20]; // дБм
export const OTHER_LOSS = 3;              // кабели, рассогласование, корпус, дБ
export const FADE = 10;                   // рекомендуемый запас на замирания и вращение, дБ
export const TX_EFF = 0.3;                // доля мощности питания передатчика, уходящая в эфир

/**
 * Эфирное время пакета, с. Для LoRa - формула из документации Semtech SX1276/77/78 (полоса 125 кГц,
 * CR 4/5, преамбула 8 символов, явный заголовок, CRC, оптимизация низкой скорости при SF11-12).
 * Для остальных модулей: байты пакета + 13 байт служебной части на скорости эфира.
 */
export function airtime(radio, mode, bytes) {
  if (mode.sf) {
    const sf = mode.sf, bw = 125000, cr = 1, npre = 8, de = sf >= 11 ? 1 : 0;
    const tsym = Math.pow(2, sf) / bw;
    const payload = 8 + Math.max(Math.ceil((8 * bytes - 4 * sf + 28 + 16) / (4 * (sf - 2 * de))) * (cr + 4), 0);
    return (npre + 4.25) * tsym + payload * tsym;
  }
  return ((bytes + 13) * 8) / (mode.kbps * 1000);
}

/** Замирания сигнала, дБ: распределение Рэлея (чаще около 0, иногда провал на 10-20 дБ) */
export const fade = (r) => 5 * Math.log10(Math.max(1e-6, -Math.log(Math.max(1e-9, r()))));

// ─── Аккумулятор ───
// Напряжение разомкнутой цепи Li-ion / LiPo по заряду (типичная кривая NMC)
const OCV = [[0, 3.0], [0.05, 3.42], [0.1, 3.55], [0.2, 3.66], [0.3, 3.72], [0.5, 3.8], [0.7, 3.92], [0.85, 4.03], [0.95, 4.13], [1, 4.2]];
export function ocv(soc) {
  soc = clamp(soc, 0, 1);
  for (let i = 1; i < OCV.length; i++) {
    if (soc <= OCV[i][0]) { const [a, va] = OCV[i - 1], [b, vb] = OCV[i]; return va + ((vb - va) * (soc - a)) / (b - a); }
  }
  return 4.2;
}
/** Емкость падает на холоде: при -20 °C у Li-ion остается около 70% */
export const coldFactor = (tempC) => (tempC >= 20 ? 1 : clamp(1 - (20 - tempC) * 0.0075, 0.55, 1));

/**
 * Аккумулятор с внутренним сопротивлением: напряжение проседает под нагрузкой (передача, камера).
 * cells - число банок последовательно (1S), wh - энергия, rint - внутреннее сопротивление, Ом.
 */
export class Battery {
  constructor({ wh = 0, rint = 0.12, cells = 1 } = {}) {
    this.whMax = wh; this.wh = wh; this.rint = rint; this.cells = cells; this.dead = false;
  }
  soc() { return this.whMax ? clamp(this.wh / this.whMax, 0, 1) : 0; }
  voltage(loadW = 0) {
    const v0 = ocv(this.soc()) * this.cells;
    const i = loadW / Math.max(1, v0);
    return v0 - i * this.rint;
  }
  /** Списать энергию: powerW в течение dt секунд при температуре tempC */
  drain(powerW, dt, tempC = 20) {
    if (!this.whMax || this.dead) return;
    this.wh -= (powerW * dt) / 3600 / coldFactor(tempC);
    if (this.wh <= 0) { this.wh = 0; this.dead = true; }
  }
}

/**
 * Тепло внутри корпуса: температура стремится к наружной плюс нагрев от электроники.
 * tau - тепловая постоянная времени, с; rth - тепловое сопротивление корпуса, °C/Вт.
 */
export class Thermal {
  constructor({ t0 = 20, tau = 600, rth = 15 } = {}) { this.t = t0; this.tau = tau; this.rth = rth; }
  step(outside, powerW, dt) { this.t += ((outside + powerW * this.rth - this.t) * dt) / this.tau; return this.t; }
}

/** Строка с числами: для проверок «в пакете есть высота» и графиков полей телеметрии */
export const numbers = (s) => (String(s).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
export const fields = (text) => String(text).split(/[,;\t ]+/).map((x) => parseFloat(x));

/**
 * Бюджет радиолинии на расстоянии distM при угле места elevDeg.
 * link = { radio, mode, txDbm, ant, gs }: модуль, режим, мощность, антенна на борту, станция.
 */
export function linkBudget(link, distM, elevDeg = 0, extraLoss = 0) {
  const { radio, mode, txDbm, ant, gs } = link || {};
  if (!radio || !ant || !gs) return null;
  const bad = ant.freq !== radio.freq ? "antenna" : gs.freq !== radio.freq ? "station" : null;
  const loss = fspl(distM / 1000, radio.freq);
  const pattern = (ant.omni ? patternLoss(elevDeg) : 0) + (gs.omni ? patternLoss(elevDeg) : 0);
  const prx = txDbm + ant.gain + gs.gain - loss - pattern - OTHER_LOSS - extraLoss - (bad ? 40 : 0);
  return { prx, margin: prx - mode.sens, sens: mode.sens, loss, pattern, bad };
}
