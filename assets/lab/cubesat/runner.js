// Полет CubeSat: бортовая программа на MicroPython (WebAssembly) управляет виртуальным спутником.
// Время виртуальное: программа пролетает весь полет за секунды, а интерфейс потом проигрывает запись
// (timeline) с выбранной скоростью. Работает и в Web Worker (worker.js), и в Node для проверок заданий.
import { Environment, gauss, rng } from "./flight.js";
import { SAT_PY } from "./pyapi.js";
import { DCDC, TX_EFF, airtime, find, has, inspect, items, link, radio, txPowerW } from "./model.js";

const COST = { bme_p: 0.01, bme_t: 0.01, bme_h: 0.01, lux: 0.18, co2: 0.002, bat_v: 0.001, bat_pct: 0.001, accel: 0.002, gyro: 0.002, gps: 0.005 };
const NEED = { bme_p: "bme", bme_t: "bme", bme_h: "bme", lux: "light", co2: "co2", accel: "imu", gyro: "imu", gps: "gps" };
const SENSOR_NAME = { bme: "BME280", light: "BH1750", co2: "SCD40", imu: "MPU-6050", gps: "GPS NEO-6M" };
const MAX_CALLS = 400000;

export function simulate(cfg, flight) {
  const env = new Environment(flight);
  const f = env.f;
  const ins = inspect(cfg, flight);
  const r = rng((f.seed || 7) * 7919 + (cfg.items || []).length);
  const list = items(cfg);
  const sensors = new Set(list.map((p) => p.sensor).filter(Boolean));
  const rad = radio(cfg);
  const obc = find(cfg, "obc");
  const storage = has(cfg, (p) => p.cat === "storage") || (obc && obc.storage);
  const bms = has(cfg, (p) => p.bms);
  const idleW = list.reduce((s, p) => s + (p.idle || 0), 0) / 1000 / (bms ? DCDC : 1);
  const solarW = list.reduce((s, p) => s + (p.solar || 0), 0);
  const whMax = list.reduce((s, p) => s + (p.wh || 0), 0);
  const cam = list.find((p) => p.sensor === "camera");

  const st = { t: 0, wh: whMax, died: null, packets: [], sd: [], photos: [], timeline: [], calls: 0, lastSample: -1, co2: { t: -9, v: 0 } };
  const sample = () => {
    const s = Math.floor(st.t);
    for (let k = st.lastSample + 1; k <= s && k <= f.tEnd; k++) {
      st.timeline.push({ t: k, alt: +env.alt(k).toFixed(1), temp: +env.airTemp(k).toFixed(2), p: +env.pressure(k).toFixed(2),
        pct: whMax ? Math.max(0, Math.round((100 * st.wh) / whMax)) : 0, yaw: Math.round(env.yaw(k)), phase: env.phase(k), alive: !st.died || k < st.died });
    }
    st.lastSample = Math.max(st.lastSample, s);
  };
  const advance = (dt, extraW = 0) => {
    const steps = Math.max(1, Math.ceil(dt / 1));
    const h = dt / steps;
    for (let i = 0; i < steps && !st.died; i++) {
      const solar = solarW * env.sun(st.t);
      st.wh -= ((idleW + extraW - solar) * h) / 3600;
      if (st.wh > whMax) st.wh = whMax;
      st.t += h;
      if (st.wh <= 0) { st.wh = 0; st.died = st.t; }
    }
    if (st.died && st.t < st.died) st.t = st.died;
    sample();
  };
  const over = () => st.died != null || st.t >= f.tEnd;
  const err = (msg) => "__err__:" + msg;

  const value = (key) => {
    const t = st.t;
    switch (key) {
      case "bme_p": return +(env.pressure(t) + gauss(r) * 0.12).toFixed(2);
      case "bme_t": return +(env.airTemp(t - 12) + 4 + gauss(r) * 0.3).toFixed(2); // датчик внутри корпуса: теплее и с запаздыванием
      case "bme_h": return +(env.humidity(t) + gauss(r) * 1.5).toFixed(1);
      case "lux": return Math.round(env.lux(t) * (1 + gauss(r) * 0.02));
      case "co2": { if (t - st.co2.t >= 5) st.co2 = { t, v: Math.round(env.co2(t) + gauss(r) * 6) }; return st.co2.v; }
      case "bat_v": { const x = whMax ? st.wh / whMax : 0; return +(3.3 + 0.9 * x - 0.15 * Math.pow(1 - x, 8)).toFixed(3); }
      case "bat_pct": return whMax ? Math.round((100 * st.wh) / whMax) : 0;
      default: return 0;
    }
  };
  const vector = (key) => {
    const t = st.t, sw = (env.swing(t) * Math.PI) / 180;
    if (key === "accel") return [+(9.81 * Math.sin(sw) + gauss(r) * 0.05).toFixed(3), +(gauss(r) * 0.08).toFixed(3), +(9.81 * Math.cos(sw) + gauss(r) * 0.05).toFixed(3)];
    if (key === "gyro") { const spin = env.alt(t) > 0 ? f.spin + 8 * Math.cos(t / 7) : 0; return [+(gauss(r) * 0.6).toFixed(2), +(gauss(r) * 0.6).toFixed(2), +(spin + gauss(r) * 0.4).toFixed(2)]; }
    if (key === "gps") {
      if (t < 30) return null;
      const p = env.position(t);
      return [+(p.lat + (gauss(r) * 2) / 111320).toFixed(6), +(p.lon + (gauss(r) * 2) / 70000).toFixed(6), +(347 + p.alt + gauss(r) * 6).toFixed(1)];
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
    read: (key) => {
      if (over()) return "__over__";
      if (++st.calls > MAX_CALLS) return err("Слишком много вызовов: добавьте sleep() в цикл");
      if (NEED[key] && !sensors.has(NEED[key])) return err(`Датчик ${SENSOR_NAME[NEED[key]]} не установлен в конструкторе`);
      if ((key === "bat_v" || key === "bat_pct") && !whMax) return err("Нет аккумулятора");
      advance(COST[key] || 0.001);
      return over() ? "__over__" : value(key);
    },
    vec: (key) => {
      if (over()) return "__over__";
      if (++st.calls > MAX_CALLS) return err("Слишком много вызовов: добавьте sleep() в цикл");
      if (NEED[key] && !sensors.has(NEED[key])) return err(`Датчик ${SENSOR_NAME[NEED[key]]} не установлен в конструкторе`);
      advance(COST[key] || 0.002);
      return over() ? "__over__" : vector(key);
    },
    photo: () => {
      if (over()) return "__over__";
      if (!cam) return err("Камера не установлена в конструкторе");
      if (!obc || !obc.camera) return err("Камере не хватает памяти этого компьютера: нужен ESP32 или Raspberry Pi");
      if (!storage) return err("Снимок некуда сохранить: нет накопителя microSD");
      advance(cam.shot, cam.shotW);
      if (over()) return "__over__";
      const name = `IMG_${String(st.photos.length + 1).padStart(4, "0")}.jpg`;
      st.photos.push({ t: +st.t.toFixed(2), alt: +env.alt(st.t).toFixed(1), name, yaw: Math.round(env.yaw(st.t)) });
      return name;
    },
    send: (text) => {
      if (over()) return "__over__";
      if (++st.calls > MAX_CALLS) return err("Слишком много вызовов: добавьте sleep() в цикл");
      if (!rad) return err("Радиомодуль не установлен в конструкторе");
      const bytes = new TextEncoder().encode(text).length;
      if (bytes > rad.maxlen) return err(`Пакет ${bytes} байт, а ${rad.name} передает не больше ${rad.maxlen}. Сократите строку.`);
      const air = airtime(bytes, rad.mode.kbps);
      const t0 = st.t;
      advance(air, txPowerW(rad.txDbm) / TX_EFF / (bms ? DCDC : 1));
      if (st.died) return "__over__";
      const g = env.geometry(t0);
      const ln = link(cfg, g.dist, g.elev + env.swing(t0) * 0.5);
      let ok = false, rssi = null;
      if (ln && !ln.bad) {
        const fade = 5 * Math.log10(Math.max(1e-6, -Math.log(Math.max(1e-9, r())))); // замирания: чаще около 0 дБ, иногда -10 дБ
        rssi = ln.prx + fade;
        ok = rssi > ln.sens;
      }
      st.packets.push({ t: +t0.toFixed(3), text, bytes, ok, rssi: rssi == null ? null : +rssi.toFixed(1), alt: +env.alt(t0).toFixed(1), air: +air.toFixed(3) });
      return over() ? "__over__" : 0;
    },
    log: (line) => {
      if (over()) return "__over__";
      if (!storage) return err("Накопитель не установлен: добавьте модуль microSD");
      advance(0.005);
      if (over()) return "__over__";
      st.sd.push({ t: +st.t.toFixed(3), text: line });
      return 0;
    },
  };
  return { env, st, api, ins, finish: () => { if (!st.died) advance(Math.max(0, f.tEnd - st.t)); else sample(); } };
}

export async function runFlight({ code, config, flight, loadMicroPython, wasmUrl }) {
  const sim = simulate(config, flight);
  const { st, api, ins } = sim;
  const prints = [];
  let error = null;
  if (!find(config, "obc") || !has(config, (p) => p.battery)) {
    error = "Спутник не включается: в конструкторе нужен бортовой компьютер и аккумулятор.";
    sim.finish();
    return { ...result(sim, prints), error };
  }
  const errs = [];
  const mp = await loadMicroPython({ url: wasmUrl, heapsize: 8 * 1024 * 1024, pystack: 4096,
    stdout: (l) => { if (prints.length < 2000) prints.push({ t: +st.t.toFixed(2), text: l }); }, stderr: (l) => errs.push(l), linebuffer: true });
  try { mp.FS.mkdir("/lib"); } catch (e) { /* есть */ }
  mp.FS.writeFile("/lib/sat.py", SAT_PY);
  mp.registerJsModule("_sat", api);
  try {
    await mp.runPythonAsync(code);
  } catch (e) {
    const text = String((e && e.message) || e) + (errs.length ? "\n" + errs.join("\n") : "");
    if (!/FlightOver/.test(text)) error = text;
  }
  sim.finish();
  void ins;
  return { ...result(sim, prints), error };
}

function result(sim, prints) {
  const { st, env, ins } = sim;
  return { timeline: st.timeline, packets: st.packets, sd: st.sd, photos: st.photos, prints, died: st.died, flight: env.f,
           inspect: { ok: ins.ok, checks: ins.checks.map((c) => ({ key: c.key, ok: c.ok, label: c.label, value: c.value || "" })) } };
}

/** Разбор полета по критерию «Работа в полете» (правила 13.6.3, 40 баллов) - оценка симулятора, не судей */
export function score(res, mission = {}) {
  const f = res.flight;
  const got = res.packets.filter((p) => p.ok);
  const inFlight = got.filter((p) => p.t >= f.tLaunch && p.t <= f.tLand);
  const firstAfter = got.find((p) => p.t >= f.tLaunch);
  const link = firstAfter && firstAfter.t - f.tLaunch <= 30 ? 10 : firstAfter && firstAfter.t - f.tLaunch <= 120 ? 5 : 0;
  // самый длинный перерыв в телеметрии за время полета
  let gap = 0, last = f.tLaunch;
  for (const p of inFlight) { gap = Math.max(gap, p.t - last); last = p.t; }
  gap = Math.max(gap, f.tLand - last);
  const tele = gap <= 10 ? 10 : gap <= 20 ? 7 : gap <= 60 ? 4 : 0;
  const tasks = missionScore(res, mission);
  const alive = !res.died || res.died >= f.tLand;
  const lastSent = res.packets.length ? res.packets[res.packets.length - 1].t : 0;
  const planned = alive && lastSent >= f.tLand - 5 ? 6 : alive && lastSent >= f.tDescend ? 3 : 0;
  const sdSet = new Set(res.sd.map((x) => x.text));
  const matched = got.filter((p) => sdSet.has(p.text)).length;
  const share = got.length ? matched / got.length : 0;
  const stored = share >= 0.95 ? 4 : share >= 0.7 ? 2 : 0;
  const sent = res.packets.filter((p) => p.t >= f.tLaunch && p.t <= f.tLand).length;
  return {
    total: link + tele + tasks.points + planned + stored,
    items: [
      { key: "FLT1", max: 10, points: link, label: "Связь с наземной станцией после старта", value: firstAfter ? `первый пакет через ${(firstAfter.t - f.tLaunch).toFixed(1)} с` : "пакетов после старта нет" },
      { key: "FLT2", max: 10, points: tele, label: "Телеметрия в течение всего полета", value: `самый длинный перерыв ${gap.toFixed(1)} с` },
      { key: "FLT3", max: 10, points: tasks.points, label: "Выполнение задач миссии", value: tasks.value },
      { key: "FLT4", max: 6, points: planned, label: "Работа в течение планового времени", value: alive ? (planned ? "работал до посадки" : "передача прекратилась раньше посадки") : `аккумулятор сел на ${Math.round(res.died)} с` },
      { key: "FLT5", max: 4, points: stored, label: "Совпадение записанных и переданных данных", value: `${matched} из ${got.length} принятых пакетов есть на борту` },
    ],
    stats: { sent, received: inFlight.length, loss: sent ? Math.round(100 * (1 - inFlight.length / sent)) : 0, gap, photos: res.photos.length, sd: res.sd.length },
  };
}

/** Задачи миссии: профиль атмосферы (замеры по слоям высоты) и/или снимки */
export function missionScore(res, mission) {
  const f = res.flight;
  const parts = [];
  let pts = 0, n = 0;
  if (mission.profile !== false) {
    n++;
    const step = Math.max(10, Math.round(f.altMax / 20));
    const bins = new Set();
    for (const p of res.packets) if (p.ok && p.t >= f.tLaunch && p.t <= f.tTop && /\d/.test(p.text)) bins.add(Math.floor(p.alt / step));
    const need = Math.floor(f.altMax / step);
    const share = need ? Math.min(1, bins.size / need) : 0;
    pts += share;
    parts.push(`профиль атмосферы: ${Math.round(share * 100)}% слоев по ${step} м`);
  }
  if (mission.photos) {
    n++;
    const high = res.photos.filter((p) => p.alt >= f.altMax * 0.5).length;
    const share = Math.min(1, high / mission.photos);
    pts += share;
    parts.push(`снимки выше половины высоты: ${high} (нужно ${mission.photos})`);
  }
  return { points: n ? Math.round((10 * pts) / n) : 0, value: parts.join("; ") };
}

export function explainError(text) {
  const t = String(text || "");
  const line = (t.match(/line (\d+)/g) || []).pop();
  let hint = "";
  if (/не установлен|не хватает памяти|некуда сохранить|не включается/.test(t)) hint = "Измените спутник на вкладке «Конструктор».";
  else if (/NameError/.test(t)) { const m = t.match(/name '(\w+)'/); hint = `Неизвестное имя «${m ? m[1] : "?"}». Первая строка программы: from sat import *`; }
  else if (/ImportError|no module named/i.test(t)) hint = "Модуль бортовой программы называется sat: from sat import *";
  else if (/IndentationError/.test(t)) hint = "Отступы: внутри while, for, if, def строки сдвигаются на 4 пробела.";
  else if (/SyntaxError/.test(t)) hint = "Синтаксис: двоеточия после while/if/def, скобки и кавычки.";
  else if (/Пакет \d+ байт/.test(t)) hint = "Округлите числа (round(x, 1)) и уберите лишний текст из пакета.";
  else if (/вызовов/.test(t)) hint = "В бесконечном цикле обязательно нужен sleep(): он двигает время полета.";
  return { text: t, line: line ? +line.split(" ")[1] : null, hint };
}
