// Разбор полета CanSat по критериям финала WSO (регламент 12.8.2). Симулятор оценивает то, что видно из
// записи полета: B (полет и апогей), C (качество данных), D (хранение и передача), E (спасение), бонус за видео.
// A (соответствие проекту и качество сборки) и F (анализ и презентация) оценивают судьи.
import { maxGap } from "../sat/checks.js";

const QUANT = { bme_p: "давление", bme_t: "температура внутри", bme_h: "влажность", ext_t: "наружная температура", accel: "ускорение",
  gyro: "угловая скорость", gps: "координаты", lux: "освещенность", co2: "CO2", bat_v: "напряжение батареи" };

export function dataTimes(res, fl) {
  const rx = res.packets.filter((p) => p.ok && p.t >= fl.tLaunch && p.t <= fl.tLand).map((p) => p.t);
  const sd = res.sd.filter((x) => x.t >= fl.tLaunch && x.t <= fl.tLand).map((x) => x.t);
  return { rx, sd };
}
const rate = (ts, dur) => (dur > 0 ? ts.length / dur : 0);

/** Самая длинная пауза в списке моментов времени между from и to */
function gapOf(ts, from, to) {
  let g = 0, last = from;
  for (const t of ts) { g = Math.max(g, t - last); last = t; }
  return Math.max(g, to - last);
}

export function found(res) {
  const ev = res.ev, fl = res.flight;
  const dist = Math.abs(ev.xCan);
  const gpsAfter = res.packets.some((p) => p.ok && p.t >= fl.tLand - 20 && /\b\d{2}\.\d{4,}/.test(p.text));
  return dist <= 250 || gpsAfter;
}

export function score(res) {
  const ev = res.ev, fl = res.flight;
  const dur = Math.max(1, fl.tLand - fl.tLaunch);
  const isFound = found(res);
  const t = dataTimes(res, fl);
  const sdTimes = isFound ? t.sd : []; // не нашли CanSat: оценка только по телеметрии (12.6.7)
  const all = [...new Set([...sdTimes, ...t.rx])].sort((a, b) => a - b);
  // B. Полет и апогей
  const aoa = ev.maxAoA, stable = ev.tumble ? 0 : aoa < 10 ? 8 : aoa < 20 ? 6 : aoa < 35 ? 3 : 1;
  const apo = Math.round(12 * Math.min(1, ev.apogee / (fl.refApogee || 450)));
  const ej = !ev.canChuteOk || !ev.rocketChuteOk || ev.crash ? 0 : ev.vEject <= 12 ? 5 : ev.vEject <= 20 ? 3 : 1;
  // C. Качество данных
  const bins = new Set(all.map((x) => Math.floor(x - fl.tLaunch)));
  const coverage = Math.min(1, bins.size / Math.ceil(dur));
  const complete = Math.round(9 * coverage);
  const hz = Math.max(rate(sdTimes, dur), rate(t.rx, dur));
  const gap = all.length ? gapOf(all, fl.tLaunch, fl.tLand) : dur;
  let sampling = hz >= 10 ? 8 : hz >= 5 ? 6 : hz >= 2 ? 4 : hz >= 1 ? 2 : 0;
  if (gap > 2) sampling = Math.max(0, sampling - 2);
  const kinds = Object.entries(res.read || {}).filter(([, n]) => n >= 10).map(([k]) => QUANT[k] || k);
  const nk = new Set(kinds).size;
  const diversity = [0, 2, 4, 5, 6, 7, 8][Math.min(6, nk)];
  // D. Хранение и передача
  const sdOk = sdTimes.length >= 20, rxOk = t.rx.length >= 20;
  const method = sdOk || rxOk ? 8 : sdTimes.length || t.rx.length ? 3 : 0;
  const first = all[0], last = all[all.length - 1];
  const integrity = all.length && first - fl.tLaunch <= 1 && fl.tLand - last <= 2 ? 4 : all.length ? 2 : 0;
  const sdSet = new Set(res.sd.map((x) => x.text));
  const got = res.packets.filter((p) => p.ok);
  const share = got.length ? got.filter((p) => sdSet.has(p.text)).length / got.length : 0;
  const both = sdOk && rxOk ? (share >= 0.9 ? 3 : share >= 0.5 ? 1 : 0) : 0;
  // E. Спасение и целостность
  const rocketOk = ev.vLandRocket <= 6.5 ? 3 : ev.vLandRocket <= 9 ? 2 : ev.vLandRocket <= 13 ? 1 : 0;
  const canOk = !isFound ? 0 : ev.vLandCan <= 9 ? 7 : ev.vLandCan <= 12 ? 5 : ev.vLandCan <= 16 ? 2 : 0;
  // бонус за видео полета (12.8.4)
  const vid = (res.video || []).reduce((s, v) => s + Math.max(0, Math.min(v.to, fl.tLand) - Math.max(v.from, fl.tLaunch)), 0) / dur;
  const bonus = vid >= 0.7 ? 3 : vid >= 0.3 ? 2 : vid > 0.05 ? 1 : 0;
  const B = stable + apo + ej, C = complete + sampling + diversity, D = method + integrity + both, E = rocketOk + canOk;
  const rf = (x, d = 1) => x.toFixed(d).replace(".", ",");
  return {
    total: B + C + D + E, max: 75, bonus, title: "Оценка полета (B, C, D, E)",
    note: "Оценка симулятора по критериям финала WSO CanSat (12.8.2). A (соответствие проекту и качество сборки, 10) и F (анализ и презентация, 15) оценивают судьи. " +
      (isFound ? "" : "CanSat не нашли в поле: данные с SD не учтены, оценка только по телеметрии (12.6.7)."),
    items: [
      { key: "B1", max: 8, points: stable, label: "Устойчивый полет без опасных отклонений", value: ev.tumble ? "ракета кувыркалась" : `наибольший угол атаки ${rf(aoa)}°` },
      { key: "B2", max: 12, points: apo, label: "Апогей", value: `${Math.round(ev.apogee)} м, условный лучший апогей финала ${fl.refApogee || 450} м` },
      { key: "B3", max: 5, points: ej, label: "Спасательные системы и выброс CanSat", value: ev.crash ? "ракета упала до выброса" : `скорость на выбросе ${rf(ev.vEject)} м/с` + (ev.warnings.length ? `; ${ev.warnings.join("; ")}` : "") },
      { key: "C1", max: 9, points: complete, label: "Полнота данных за весь полет", value: `данные есть в ${Math.round(coverage * 100)}% секунд полета` },
      { key: "C2", max: 8, points: sampling, label: "Частота записи и отсутствие пропусков", value: `${rf(hz)} Гц, самая длинная пауза ${rf(gap)} с` },
      { key: "C3", max: 8, points: diversity, label: "Разнообразие измерений", value: nk ? kinds.join(", ") : "датчики в полете не читались" },
      { key: "D1", max: 8, points: method, label: "Запись или передача работает", value: `${sdTimes.length} строк на SD, ${t.rx.length} пакетов принято` },
      { key: "D2", max: 4, points: integrity, label: "Полнота и целостность набора", value: all.length ? `от ${rf(first - fl.tLaunch)} с после старта до ${rf(fl.tLand - last)} с до посадки` : "нет данных" },
      { key: "D3", max: 3, points: both, label: "Запись и передача одновременно, данные совпадают", value: sdOk && rxOk ? `${Math.round(share * 100)}% пакетов есть на SD` : "нужны оба способа" },
      { key: "E1", max: 3, points: rocketOk, label: "Состояние ракеты после посадки", value: `посадка ${rf(ev.vLandRocket)} м/с` },
      { key: "E2", max: 7, points: canOk, label: "Состояние CanSat и сохранность данных", value: isFound ? `посадка ${rf(ev.vLandCan)} м/с в ${Math.round(Math.abs(ev.xCan))} м от старта` : `не нашли: упал в ${Math.round(Math.abs(ev.xCan))} м, координат в телеметрии нет` },
    ],
    stats: [
      ["Апогей", `${Math.round(ev.apogee)} м`], ["Макс. скорость", `${Math.round(ev.maxV)} м/с`], ["Макс. перегрузка", `${rf(ev.maxAccel / 9.80665)} g`],
      ["Сход с направляющей", `${rf(ev.vRail)} м/с`], ["Снижение CanSat", `${rf(ev.vDescCan)} м/с`], ["Снос CanSat", `${Math.round(Math.abs(ev.xCan))} м`],
      ["Строк на SD", res.sd.length], ["Пакетов принято", got.length],
    ],
  };
}
