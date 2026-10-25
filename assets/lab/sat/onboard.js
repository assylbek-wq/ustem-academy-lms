// Бортовая электроника в полете: часы, питание, тепло, датчики, радио, накопитель, камера.
// Общая часть CubeSat и CanSat. Окружение (env) у каждого вида свое: аэростат или ракета с парашютом.
// Время виртуальное: каждый вызов датчика и sleep() продвигают часы, физика полета посчитана заранее в env.
import { Battery, Thermal, airtime, fade, gauss, linkBudget, rng, txPowerW, TX_EFF } from "./core.js";

const MAX_CALLS = 600000;
// сколько занимает вызов, с (I2C, преобразование АЦП, ожидание данных)
const COST = { bme_p: 0.008, bme_t: 0.008, bme_h: 0.008, lux: 0.12, co2: 0.002, ext_t: 0.01, bat_v: 0.001, bat_pct: 0.001, accel: 0.0015, gyro: 0.0015, gps: 0.004 };
const NEED = { bme_p: "bme", bme_t: "bme", bme_h: "bme_h", lux: "light", co2: "co2", accel: "imu", gyro: "imu", gps: "gps", ext_t: "therm" };
const SENSOR_NAME = { bme: "датчик давления", bme_h: "датчик влажности (BME280)", light: "BH1750", co2: "SCD40", imu: "MPU-6050", gps: "GPS", therm: "DS18B20" };

/**
 * parts - список деталей конструкции (из каталога вида), env - окружение полета, opts:
 *   link - {radio, mode, txDbm, ant, gs} или null, bms - есть ли DC-DC, rth/tau - тепло корпуса,
 *   sampleExtra(t) - добавочные поля для записи полета, impact(t) - «удар» (CanSat при посадке).
 */
export function onboard(parts, env, opts = {}) {
  const f = env.f;
  const r = rng((f.seed || 7) * 7919 + parts.length * 31 + 1);
  const sensors = new Set(parts.flatMap((p) => (p.sensors || (p.sensor ? [p.sensor] : []))));
  const link = opts.link;
  const obc = parts.find((p) => p.cat === "obc");
  const storage = parts.some((p) => p.cat === "storage") || (obc && obc.storage);
  const bms = parts.some((p) => p.bms);
  const conv = bms ? 0.9 : 0.85; // КПД: DC-DC или линейный стабилизатор
  const idleW = parts.reduce((s, p) => s + (p.idle || 0), 0) / 1000 / conv;
  const solarW = parts.reduce((s, p) => s + (p.solar || 0), 0);
  const cam = parts.find((p) => p.sensor === "camera");
  const batt = new Battery({ wh: parts.reduce((s, p) => s + (p.wh || 0), 0), rint: Math.max(0.05, ...parts.filter((p) => p.wh).map((p) => p.rint || 0.12)) });
  const thermal = new Thermal({ t0: env.airTemp(0) + 2, tau: opts.tau || 600, rth: opts.rth || 15 });
  const st = { t: 0, died: null, packets: [], sd: [], photos: [], video: [], timeline: [], calls: 0, last: -1, co2: { t: -9, v: 0 },
               range: 2, read: {}, busyW: 0, recording: null, nextIdx: 0 };
  let loadW = idleW;

  const sampleStep = opts.sampleStep || 1;
  const sample = () => {
    for (let k = st.nextIdx * sampleStep; k <= st.t + 1e-9 && k <= f.tEnd + 1e-9; k = ++st.nextIdx * sampleStep) {
      const row = { t: +k.toFixed(2), // строки записи идут ровно через sampleStep: индекс = t / sampleStep
 alt: +env.alt(k).toFixed(1), temp: +env.airTemp(k).toFixed(2), p: +env.pressure(k).toFixed(2), tin: +thermal.t.toFixed(2),
        pct: batt.whMax ? Math.round(100 * batt.soc()) : 0, v: +batt.voltage(loadW).toFixed(3), phase: env.phase(k), alive: !st.died || k < st.died };
      Object.assign(row, opts.sampleExtra ? opts.sampleExtra(k) : {});
      st.timeline.push(row);
    }
  };
  const advance = (dt, extraW = 0) => {
    const steps = Math.max(1, Math.ceil(dt / 0.5));
    const h = dt / steps;
    for (let i = 0; i < steps && !st.died; i++) {
      const p = idleW + extraW + (st.recording ? cam.videoW : 0);
      loadW = p;
      const solar = solarW * (env.sun ? env.sun(st.t) : 0);
      thermal.step(env.airTemp(st.t), p, h);
      batt.drain(Math.max(0, p - solar), h, thermal.t);
      st.t += h;
      if (batt.dead) st.died = st.t;
      if (opts.destroyed && opts.destroyed(st.t)) st.died = st.t;
    }
    loadW = idleW;
    sample();
  };
  const over = () => st.died != null || st.t >= f.tEnd;
  const err = (msg) => "__err__:" + msg;
  const count = (key) => { st.read[key] = (st.read[key] || 0) + (env.phase(st.t) !== "pre" && env.phase(st.t) !== "landed" ? 1 : 0); };
  const guard = (key) => {
    if (over()) return "__over__";
    if (++st.calls > MAX_CALLS) return err("Слишком много вызовов: добавьте sleep() в цикл");
    if (NEED[key] && !sensors.has(NEED[key])) return err(`Датчик ${SENSOR_NAME[NEED[key]]} не установлен в конструкторе`);
    return null;
  };

  const value = (key) => {
    const t = st.t;
    switch (key) {
      case "bme_p": return +(env.pressure(t) + gauss(r) * 0.06).toFixed(2);
      case "bme_t": return +(thermal.t + gauss(r) * 0.15).toFixed(2);   // датчик внутри корпуса
      case "bme_h": return +(env.humidity(t) + gauss(r) * 1.2).toFixed(1);
      case "ext_t": { // DS18B20: новое значение раз в 0,75 с (конвертация идет в фоне), лаг датчика на выносе 3 с
        if (t - (st.ext ? st.ext.t : -9) >= 0.75) st.ext = { t, v: +(env.airTemp(t - 3) + gauss(r) * 0.06).toFixed(2) };
        return st.ext.v;
      }
      case "lux": return Math.round(env.lux(t) * (1 + gauss(r) * 0.02));
      case "co2": { if (t - st.co2.t >= 5) st.co2 = { t, v: Math.round(env.co2(t) + gauss(r) * 6) }; return st.co2.v; }
      case "bat_v": return +(batt.voltage(loadW) + gauss(r) * 0.004).toFixed(3);
      case "bat_pct": return batt.whMax ? Math.round(100 * batt.soc()) : 0;
      default: return 0;
    }
  };
  const vector = (key) => {
    const t = st.t;
    if (key === "accel") {
      const lim = st.range * 9.80665;
      return env.accel(t).map((a) => +Math.max(-lim, Math.min(lim, a + gauss(r) * 0.04)).toFixed(3));
    }
    if (key === "gyro") return env.gyro(t).map((w) => +(w + gauss(r) * 0.3).toFixed(2));
    if (key === "gps") {
      if (t < (env.gpsFix || 32)) return null;
      const g = env.position(t);
      return [+(g.lat + (gauss(r) * 2.5) / 111320).toFixed(6), +(g.lon + (gauss(r) * 2.5) / 70000).toFixed(6), +(g.alt + gauss(r) * 5).toFixed(1)];
    }
    return null;
  };

  const api = {
    now: () => (over() ? "__over__" : +st.t.toFixed(3)),
    sleep: (s) => {
      if (over()) return "__over__";
      if (!(s >= 0)) return err("sleep: время должно быть не меньше 0");
      advance(Math.min(s, f.tEnd - st.t + 0.001));
      return over() ? "__over__" : 0;
    },
    setrange: (g) => {
      if (![2, 4, 8, 16].includes(g)) return err("imu.range: можно 2, 4, 8 или 16");
      const e = guard("accel"); if (e) return e;
      st.range = g; return 0;
    },
    read: (key) => {
      const e = guard(key); if (e) return e;
      if ((key === "bat_v" || key === "bat_pct") && !batt.whMax) return err("Нет аккумулятора");
      advance(COST[key] || 0.001);
      if (over()) return "__over__";
      count(key);
      return value(key);
    },
    vec: (key) => {
      const e = guard(key); if (e) return e;
      advance(COST[key] || 0.002);
      if (over()) return "__over__";
      count(key);
      return vector(key);
    },
    photo: () => {
      if (over()) return "__over__";
      if (!cam) return err("Камера не установлена в конструкторе");
      if (!obc || !obc.camera) return err("Камере не хватает памяти этого компьютера: нужен ESP32 или Raspberry Pi");
      if (!storage) return err("Снимок некуда сохранить: нет накопителя microSD");
      advance(cam.shot, cam.shotW);
      if (over()) return "__over__";
      const name = `IMG_${String(st.photos.length + 1).padStart(4, "0")}.jpg`;
      st.photos.push({ t: +st.t.toFixed(2), alt: +env.alt(st.t).toFixed(1), name, yaw: Math.round(env.yaw ? env.yaw(st.t) : 0) });
      return name;
    },
    video: (on) => {
      if (over()) return "__over__";
      if (!cam) return err("Камера не установлена в конструкторе");
      if (!obc || !obc.camera) return err("Для видео нужен ESP32 или Raspberry Pi");
      if (!storage) return err("Видео некуда записать: нет накопителя microSD");
      if (on && !st.recording) st.recording = { from: st.t };
      if (!on && st.recording) { st.video.push({ from: +st.recording.from.toFixed(2), to: +st.t.toFixed(2) }); st.recording = null; }
      advance(0.05);
      return over() ? "__over__" : 0;
    },
    send: (text) => {
      const e = guard(); if (e) return e;
      if (!link || !link.radio) return err("Радиомодуль не установлен в конструкторе");
      const bytes = new TextEncoder().encode(text).length;
      if (bytes > link.radio.maxlen) return err(`Пакет ${bytes} байт, а ${link.radio.name} передает не больше ${link.radio.maxlen}. Сократите строку.`);
      const air = airtime(link.radio, link.mode, bytes);
      const t0 = st.t;
      advance(air + 0.002, txPowerW(link.txDbm) / TX_EFF / conv);
      if (st.died) return "__over__";
      const g = env.geometry(t0);
      const ln = linkBudget(link, g.dist, g.elev, g.extra || 0);
      let ok = false, rssi = null;
      if (ln && !ln.bad) { rssi = ln.prx + fade(r); ok = rssi > ln.sens; }
      st.packets.push({ t: +t0.toFixed(3), text, bytes, ok, rssi: rssi == null ? null : +rssi.toFixed(1), alt: +env.alt(t0).toFixed(1), air: +air.toFixed(3) });
      return over() ? "__over__" : 0;
    },
    log: (line) => {
      if (over()) return "__over__";
      if (!storage) return err("Накопитель не установлен: добавьте модуль microSD");
      advance(0.004);
      if (over()) return "__over__";
      st.sd.push({ t: +st.t.toFixed(3), text: line });
      return 0;
    },
  };

  return {
    api, st, env,
    now: () => st.t,
    blocker: () => (!obc || !batt.whMax ? "Спутник не включается: в конструкторе нужен бортовой компьютер и аккумулятор." : null),
    finish: () => {
      if (!st.died) advance(Math.max(0, f.tEnd - st.t)); else sample();
      if (st.recording) { st.video.push({ from: +st.recording.from.toFixed(2), to: +Math.min(st.t, st.died || f.tEnd).toFixed(2) }); st.recording = null; }
    },
    result: () => ({ timeline: st.timeline, packets: st.packets, sd: st.sd, photos: st.photos, video: st.video, died: st.died, flight: f,
                     read: st.read, range: st.range }),
  };
}
