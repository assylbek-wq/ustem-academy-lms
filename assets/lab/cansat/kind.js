// CanSat для общего интерфейса симулятора: банка и ракета в конструкторе, прогноз полета (как OpenRocket),
// условия запуска, проверки и разбор по критериям финала WSO CanSat.
import { CATEGORIES, DIAMETERS, FIN_MATERIALS, MATERIALS, MOTOR, NOSES, PARTS, part } from "./catalog.js";
import { DEFAULT_FLIGHT, FADE, TX_LEVELS, addPart, budgetCsv, descentRate, emptyConfig, inspect, items, removeAt, rocketModel, rocketOf } from "./model.js";
import { fly } from "./physics.js";
import { evalChecks, needsFlight } from "./checks.js";
import { score } from "./score.js";
import { drawCan, drawRocket } from "../sat/blueprint.js";
import { fields } from "../sat/core.js";

const fmt = (x, d = 0) => Number(x).toLocaleString("ru-RU", { minimumFractionDigits: d, maximumFractionDigits: d });
let cache = { key: "", val: null };

/** Прогноз полета без бортовой программы: события и траектория для сцены (кэш по сборке и условиям) */
export function forecast(cfg, flight) {
  const key = JSON.stringify([cfg.items, cfg.canChute, cfg.rocket, flight]);
  if (cache.key === key) return cache.val;
  const trip = fly(cfg, { ...DEFAULT_FLIGHT, ...flight });
  const path = trip.rocket.filter((p, i) => p.t >= trip.ev.tLaunch && p.t <= trip.ev.tEject && i % 5 === 0)
    .concat(trip.can.filter((p, i) => p.t > trip.ev.tEject && i % 25 === 0));
  cache = { key, val: { ev: trip.ev, path, alt: trip.can.filter((_, i) => i % 10 === 0).map((p) => [p.t, Math.max(0, p.z)]), ralt: trip.rocket.filter((_, i) => i % 10 === 0).map((p) => [p.t, Math.max(0, p.z)]) } };
  return cache.val;
}

export const ROCKET_CONTROLS = [
  { key: "d", label: "Диаметр корпуса", type: "select", opts: DIAMETERS.map((d) => [d, `${d} мм`]) },
  { key: "len", label: "Длина ракеты", type: "range", min: 70, max: 150, step: 5, unit: "см" },
  { key: "material", label: "Материал корпуса", type: "select", opts: Object.entries(MATERIALS).map(([k, m]) => [k, m.name]) },
  { key: "nose", label: "Обтекатель", type: "select", opts: Object.entries(NOSES).map(([k, n]) => [k, n.name]) },
  { key: "noseK", label: "Длина обтекателя", type: "range", min: 2, max: 5, step: 0.5, unit: "калибра" },
  { key: "fins", label: "Стабилизаторы", type: "select", opts: [[3, "3 шт"], [4, "4 шт"]] },
  { key: "finMat", label: "Материал стабилизаторов", type: "select", opts: Object.entries(FIN_MATERIALS).map(([k, m]) => [k, m.name]) },
  { key: "root", label: "Корневая хорда", type: "range", min: 50, max: 220, step: 5, unit: "мм" },
  { key: "tip", label: "Концевая хорда", type: "range", min: 0, max: 150, step: 5, unit: "мм" },
  { key: "span", label: "Размах (высота)", type: "range", min: 25, max: 150, step: 5, unit: "мм" },
  { key: "sweep", label: "Стреловидность", type: "range", min: 0, max: 150, step: 5, unit: "мм" },
  { key: "chute", label: "Парашют ракеты", type: "range", min: 20, max: 120, step: 5, unit: "см" },
  { key: "rail", label: "Наклон направляющей", type: "range", min: 0, max: 10, step: 1, unit: "°" },
];

export default {
  id: "cansat", title: "CanSat", badge: "World Space Olympiad, категория CanSat",
  CATEGORIES, PARTS, part, TX_LEVELS, emptyConfig, items, addPart, removeAt, evalChecks, needsFlight, forecast,
  budgetCsv: (cfg) => budgetCsv(cfg),
  score: (res) => score(res),
  inspect(cfg, flight) {
    const f = { ...DEFAULT_FLIGHT, ...flight };
    const pr = forecast(cfg, f).ev;
    const ins = inspect(cfg, f, pr);
    ins.pred = pr;
    return ins;
  },
  flightPlan: (fl) => ({ ...DEFAULT_FLIGHT, ...fl }),
  modes: [{ id: "build", label: "CanSat" }, { id: "rocket", label: "Ракета" }],
  rocketControls: ROCKET_CONTROLS,
  rocketOf,
  canChute: { label: "Парашют CanSat", min: 0, max: 80, step: 1, unit: "см" },
  draw(cv, mode, cfg, ins) {
    if (mode === "rocket") drawRocket(cv, cfg, ins.rocket.lift, ins.rocket.burn, ins.pred);
    else drawCan(cv, items(cfg), cfg, ins);
  },

  gauges(ins, mode) {
    const cm = ins.can.mass.total, st = ins.can.stack, rk = ins.rocket, ln = ins.link;
    if (mode === "rocket") {
      const stab = rk.stab;
      return [
        { title: "Устойчивость", value: `${fmt(stab, 2)} кал.`, share: Math.max(0, Math.min(1, stab / 4)), cls: stab < 1.5 ? "bad" : stab > 4 ? "warn" : "ok", sub: "нужно не меньше 1,5" },
        { title: "Масса ракеты", value: `${fmt(rk.lift.m)} г`, share: rk.lift.m / 1500, cls: rk.lift.m > 1500 ? "bad" : rk.lift.m > 1300 ? "warn" : "ok", sub: "лимит 1500 г с двигателем" },
        { title: "Отсек CanSat", value: `${fmt(rk.comp.inner, 1)} мм`, share: Math.min(1, rk.comp.inner / 90), cls: rk.comp.fits ? "ok" : "bad", sub: rk.comp.fits ? `зазор ${fmt(rk.comp.clearance, 1)} мм` : "банка 66 мм не входит" },
        { title: "Сопротивление", value: `Cd ${fmt(rk.lift.cd, 2)}`, share: Math.min(1, rk.lift.cd / 1), cls: rk.lift.cd > 0.75 ? "warn" : "ok", sub: "чем меньше, тем выше апогей" },
      ];
    }
    const v = ins.can.vDesc;
    return [
      { title: "Масса CanSat", value: `${cm} г`, share: cm / 300, cls: cm > 300 ? "bad" : cm > 270 ? "warn" : "ok", sub: `лимит 300 г, парашют ${fmt(ins.can.mass.chute, 1)} г` },
      { title: "Стек в банке", value: `${st.used} мм`, share: st.used / st.limit, cls: st.used > st.limit ? "bad" : st.used > st.limit * 0.9 ? "warn" : "ok", sub: `из ${st.limit} мм` },
      { title: "Снижение", value: `${fmt(v, 1)} м/с`, share: Math.min(1, v / 14), cls: v > 12 || v < 3 ? "bad" : v > 10 || v < 5 ? "warn" : "ok", sub: "под парашютом, у земли" },
      { title: "Связь", value: ln ? (ln.bad ? "частоты разные" : `${ln.margin > 0 ? "+" : ""}${fmt(ln.margin, 1)} дБ`) : "нет линии",
        share: ln && !ln.bad ? Math.max(0, Math.min(1, (ln.margin + 5) / 45)) : 0, cls: !ln || ln.bad || ln.margin < 0 ? "bad" : ln.margin < FADE + (ln.inRocket || 0) ? "warn" : "ok",
        sub: ln && !ln.bad ? `в отсеке еще -${ln.inRocket} дБ` : "радио необязательно, если есть SD" },
    ];
  },
  groups: [{ id: "can", title: "CanSat (12.5)" }, { id: "rocket", title: "Ракета-носитель (12.4, 12.6)" }, { id: "flight", title: "Прогноз полета" }],
  inspectNote: () => "",

  /** Прогноз полета для конструктора: числа как в окне симуляции OpenRocket */
  prediction(cfg, flight) {
    const p = forecast(cfg, flight);
    const e = p.ev;
    return {
      rows: [
        ["Апогей", `${fmt(e.apogee)} м`], ["Время до апогея", `${fmt(e.tApogee - e.tLaunch, 1)} с`], ["Макс. скорость", `${fmt(e.maxV)} м/с`],
        ["Макс. перегрузка", `${fmt(e.maxAccel / 9.80665, 1)} g`], ["Сход с направляющей", `${fmt(e.vRail, 1)} м/с`],
        ["Выброс CanSat", e.crash ? "ракета упала" : `через ${MOTOR.delay} с после выгорания, ${fmt(e.vEject, 1)} м/с`],
        ["Снижение CanSat", `${fmt(e.vDescCan, 1)} м/с, посадка ${fmt(e.vLandCan, 1)} м/с`], ["Посадка ракеты", `${fmt(e.vLandRocket, 1)} м/с`],
        ["Снос CanSat ветром", `${fmt(Math.abs(e.xCan))} м`],
      ],
      warnings: e.warnings.concat(e.ejectBeforeApogee ? ["Выброс до апогея: ракета еще летит вверх"] : []).concat(e.vEject > 20 && !e.crash ? ["Быстрый выброс: стропы могут не выдержать рывка"] : []),
      alt: p.alt, ralt: p.ralt, ev: e, path: p.path,
    };
  },

  conditions(fl) {
    return [
      { key: "wind", label: "Ветер у земли", opts: [0, 2, 3, 5, 7, 9], unit: "м/с" },
      { key: "station", label: "Станция", opts: [30, 60, 100, 200], unit: "м" },
      { key: "groundT", label: "Температура", opts: [-5, 5, 18, 30], unit: "°C" },
    ].map((c) => ({ ...c, value: fl[c.key] }));
  },
  facts: (fl) => `Стандартный двигатель ${MOTOR.name}: ${MOTOR.impulse} Н·с, 2 с работы, замедлитель ${MOTOR.delay} с. Ветер у земли ${fl.wind} м/с, станция в ${fl.station} м от стола.`,
  sceneWind: (fl) => fl.wind || 0,
  phases: () => [["tLaunch", "Старт!"], ["tBurnout", "Двигатель выгорел"], ["tApogee", "Апогей"], ["tEject", "Вышибной заряд: CanSat отделился"], ["tLand", "CanSat на земле"]],
  PHASE: { pre: "На столе", boost: "Работает двигатель", coast: "Пассивный полет", descent: "Под парашютом", landed: "На земле" },

  series(res) {
    const got = res.packets.filter((p) => p.ok);
    const out = [{ id: "alt", name: "Высота CanSat, м", pts: res.timeline.map((x) => [x.t, x.alt]), line: true }];
    const src = res.sd.length ? res.sd : got;
    const cols = Math.min(10, Math.max(0, ...src.slice(0, 60).map((p) => fields(p.text).length)));
    for (let i = 0; i < cols; i++) {
      const pts = src.map((p) => [p.t, fields(p.text)[i]]).filter((q) => Number.isFinite(q[1]));
      if (pts.length > 3) out.push({ id: "f" + i, name: `${res.sd.length ? "SD" : "Телеметрия"}: поле ${i + 1}`, pts, tele: true });
    }
    out.push({ id: "g", name: "Перегрузка, g (по симулятору)", pts: res.timeline.map((x) => [x.t, x.g]), line: true });
    out.push({ id: "vz", name: "Вертикальная скорость, м/с", pts: res.timeline.map((x) => [x.t, x.vz]), line: true });
    if (got.length) out.push({ id: "rssi", name: "Сигнал на станции, дБм", pts: got.map((p) => [p.t, p.rssi]) });
    return out;
  },
  chartWindow: (res) => [Math.max(0, res.flight.tLaunch - 5), res.flight.tEnd],
  hud(res, t) {
    const tl = res.timeline[Math.min(res.timeline.length - 1, Math.max(0, Math.round(t * 10)))];
    return tl ? { phase: tl.phase, alt: tl.alt, extra: [`${fmt(tl.vz, 1)} м/с`, `${fmt(tl.g, 1)} g`, `воздух ${fmt(tl.temp, 1)} °C`, tl.alive ? `${fmt(tl.v, 2)} В` : "выключен"], alive: tl.alive } : null;
  },
  truthCsv: (res) => "t;alt_m;vz_ms;g;pressure_hpa;air_c;inside_c;battery_v;x_m\n" + res.timeline.map((x) => `${x.t};${x.alt};${x.vz};${x.g};${x.p};${x.temp};${x.tin};${x.v};${x.x}`).join("\n"),

  help: {
    intro: "В категории CanSat команда строит модель ракеты и спутник размером с банку 330 мл (66 × 115 мм, до 300 г). Стандартный двигатель РД1-100-7М поднимает ракету на несколько сотен метров, через 7 с после выгорания вышибной заряд выталкивает CanSat, и он спускается на своем парашюте: измеряет, пишет на SD и передает на станцию.",
    physics: "Полет считается как в OpenRocket: тяга по таблице двигателя, масса уменьшается по мере выгорания топлива, сопротивление зависит от формы и площади, а устойчивость - от расстояния между центром тяжести и центром давления (метод Barrowman). Ракета разворачивается против ветра, после выброса оба тела сносит ветром. Акселерометр MPU-6050 по умолчанию меряет до 2 g: для старта нужен imu.range(16). Корпус из карбона экранирует радио и GPS.",
    example: 'from sat import *\n\nimu.range(16)\nn = 0\nwhile True:\n    a = imu.accel()\n    line = "%d,%.2f,%.2f,%.1f" % (n, time(), bme.pressure(), a[2])\n    sd.write(line)\n    if n % 4 == 0:\n        radio.send(line)\n    n += 1\n    sleep(0.05)',
  },
  descentRate,
};
