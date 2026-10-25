// CubeSat 1U для общего интерфейса симулятора: каталог, чертеж, приборы, условия полета, проверки, разбор.
import { CATEGORIES, PARTS, part } from "./catalog.js";
import { FADE, MAX_MASS, TX_LEVELS, addPart, budgetCsv, emptyConfig, flightPlan, inspect, items, removeAt } from "./model.js";
import { evalChecks, needsFlight } from "./checks.js";
import { score } from "./score.js";
import { drawCube } from "../sat/blueprint.js";
import { fields } from "../sat/core.js";

const fmt = (x, d = 0) => Number(x).toLocaleString("ru-RU", { minimumFractionDigits: d, maximumFractionDigits: d });

export default {
  id: "cubesat", title: "CubeSat 1U", badge: "World Space Olympiad, категория CubeSat",
  CATEGORIES, PARTS, part, TX_LEVELS, emptyConfig, items, addPart, removeAt, budgetCsv, evalChecks, needsFlight,
  score: (res, mission) => score(res, mission),
  inspect: (cfg, flight) => inspect(cfg, flight),
  flightPlan,
  modes: [{ id: "build", label: "Спутник" }],
  draw(cv, mode, cfg, ins) { drawCube(cv, items(cfg), ins); },

  gauges(ins) {
    const fl = ins.flight, pw = ins.power, m = ins.mass.total, st = ins.stack, ln = ins.link;
    const planMin = (fl.tEnd - fl.tLaunch + fl.pre) / 60, mins = pw.hours * 60;
    return [
      { title: "Масса", value: `${m} г`, share: m / MAX_MASS, cls: m > MAX_MASS ? "bad" : m > MAX_MASS * 0.85 ? "warn" : "ok", sub: `лимит ${MAX_MASS} г, провода +${ins.mass.wiring} г` },
      { title: "Стек плат", value: `${st.used} мм`, share: st.used / st.limit, cls: st.used > st.limit ? "bad" : st.used > st.limit * 0.9 ? "warn" : "ok", sub: `из ${st.limit} мм в каркасе` },
      { title: "Энергия", value: pw.wh ? `${fmt(mins)} мин` : "нет батареи", share: pw.wh ? Math.min(1, mins / (planMin * 3)) : 0,
        cls: !pw.wh || mins < planMin * 1.5 ? "bad" : mins < planMin * 3 ? "warn" : "ok", sub: `полет ${fmt(planMin)} мин, ${fmt(pw.total, 2)} Вт` },
      { title: "Связь", value: ln ? (ln.bad ? "частоты разные" : `${ln.margin > 0 ? "+" : ""}${fmt(ln.margin, 1)} дБ`) : "нет линии",
        share: ln && !ln.bad ? Math.max(0, Math.min(1, (ln.margin + 5) / 35)) : 0, cls: !ln || ln.bad || ln.margin < 0 ? "bad" : ln.margin < FADE ? "warn" : "ok",
        sub: ln && !ln.bad ? `худшая точка ${fmt(ln.dist)} м, угол ${fmt(ln.elev)}°` : `станция в ${fl.station} м, высота ${fl.altMax} м` },
    ];
  },
  groups: [{ id: null, title: "Предстартовая проверка (13.4, 13.5)" }],
  inspectNote: (c) => (c.key === "link" && c.warn ? `меньше ${FADE} дБ: при вращении и раскачке часть пакетов потеряется` : ""),

  conditions(fl) {
    return [
      { key: "altMax", label: "Высота", opts: [300, 500, 1000, 1500, 2000], unit: "м" },
      { key: "station", label: "Станция", opts: [100, 150, 300, 500, 800], unit: "м" },
      { key: "hold", label: "Висение", opts: [60, 300, 600, 1800, 3600], unit: "мин", div: 60 },
      { key: "wind", label: "Ветер", opts: [0, 2, 4, 7, 10], unit: "м/с" },
    ].map((c) => ({ ...c, value: fl[c.key] }));
  },
  facts: (fl) => `Привязной аэростат: ${fl.altMax} м, подъем ${fl.ascent} м/с, висение ${fmt(fl.hold / 60, fl.hold % 60 ? 1 : 0)} мин, ветер у земли ${fl.wind} м/с. Станция в ${fl.station} м от лебедки.`,
  sceneWind: (fl) => fl.wind || 0,
  phases: (f) => [["tLaunch", "Старт! Лебедка отпускает трос"], ["tTop", "Высота достигнута, висение"], ["tDescend", "Начался спуск"], ["tLand", "Посадка"]],
  PHASE: { pre: "Подготовка", ascent: "Подъем", hold: "Висение", descent: "Спуск", landed: "На земле" },

  series(res) {
    const got = res.packets.filter((p) => p.ok);
    const out = [{ id: "alt", name: "Высота спутника, м", pts: res.timeline.map((x) => [x.t, x.alt]), line: true }];
    const cols = Math.min(8, Math.max(0, ...got.slice(0, 50).map((p) => fields(p.text).length)));
    for (let i = 0; i < cols; i++) {
      const pts = got.map((p) => [p.t, fields(p.text)[i]]).filter((q) => Number.isFinite(q[1]));
      if (pts.length > 3) out.push({ id: "f" + i, name: `Телеметрия: поле ${i + 1}`, pts, tele: true });
    }
    out.push({ id: "tin", name: "Температура внутри корпуса, °C", pts: res.timeline.map((x) => [x.t, x.tin]), line: true });
    out.push({ id: "out", name: "Температура воздуха, °C", pts: res.timeline.map((x) => [x.t, x.temp]), line: true });
    if (got.length) out.push({ id: "rssi", name: "Сигнал на станции, дБм", pts: got.map((p) => [p.t, p.rssi]) });
    out.push({ id: "v", name: "Напряжение аккумулятора, В", pts: res.timeline.map((x) => [x.t, x.v]), line: true });
    out.push({ id: "wind", name: "Ветер на высоте спутника, м/с", pts: res.timeline.map((x) => [x.t, x.wind]), line: true });
    return out;
  },
  hud(res, t) {
    const tl = res.timeline[Math.min(res.timeline.length - 1, Math.max(0, Math.floor(t)))];
    return tl ? { phase: tl.phase, alt: tl.alt, extra: [`воздух ${fmt(tl.temp, 1)} °C`, `внутри ${fmt(tl.tin, 1)} °C`, tl.alive ? `${fmt(tl.v, 2)} В, ${tl.pct}%` : "выключен"], alive: tl.alive } : null;
  },
  truthCsv: (res) => "t;alt_m;pressure_hpa;air_c;inside_c;battery_v;battery_pct;wind_ms\n" + res.timeline.map((x) => `${x.t};${x.alt};${x.p};${x.temp};${x.tin};${x.v};${x.pct};${x.wind}`).join("\n"),

  help: {
    intro: "По правилам World Space Olympiad команда собирает CubeSat 1U: куб 100 мм, не тяжелее 800 г, с бортовым компьютером, питанием, радио, полезной нагрузкой и своей наземной станцией. На финале спутник поднимают на привязном аэростате (до 2000 м), телеметрия идет на станцию в реальном времени и пишется на борт.",
    physics: "Ветер растет с высотой и наклоняет трос: спутник уносит от станции, угол места меняется. Спутник вращается на тросе и раскачивается, поэтому сигнал замирает. Электроника греет корпус, а на холоде у аккумулятора меньше емкости. Пакет LoRa летит столько, сколько дает формула Semtech для выбранного SF.",
    example: 'from sat import *\n\nn = 0\nwhile True:\n    line = "%d,%.1f,%.2f" % (n, time(), bme.pressure())\n    sd.write(line)\n    radio.send(line)\n    n += 1\n    sleep(1)',
  },
};
