// Модель CubeSat 1U: масса, стек плат, энергия, радиолиния и предстартовая проверка по регламенту WSO (глава 13).
import { CATEGORIES, FRAME_STACK, PARTS, part } from "./catalog.js";
import { FADE, TX_EFF, TX_LEVELS, airtime, linkBudget, txPowerW } from "../sat/core.js";

export { FADE, TX_LEVELS };
export const MAX_MASS = 800;            // г, правила WSO CubeSat 13.4.1
export const WIRING = 0.06;             // провода, крепеж, разъемы: 6% от массы компонентов
export const BOARD_GAP = 2;             // зазор между платами в стеке, мм
export const DCDC = 0.9;                // КПД преобразователя питания

export const DEFAULT_FLIGHT = { altMax: 500, ascent: 3, descent: 3, hold: 300, pre: 60, post: 30, station: 150,
  groundP: 973.5, groundT: 12, lat: 51.0905, lon: 71.4185, spin: 18, wind: 4, seed: 7 };

export function flightPlan(f = {}) {
  const fl = { ...DEFAULT_FLIGHT, ...f };
  const up = fl.altMax / fl.ascent, down = fl.altMax / fl.descent;
  fl.tLaunch = fl.pre; fl.tTop = fl.pre + up; fl.tDescend = fl.tTop + fl.hold; fl.tLand = fl.tDescend + down; fl.tEnd = fl.tLand + fl.post;
  return fl;
}

export const emptyConfig = () => ({ items: [], radioMode: null, txDbm: 14, name: "" });

export function items(cfg) {
  return (cfg.items || []).map((id) => part(id)).filter(Boolean);
}
export const has = (cfg, pred) => items(cfg).some(pred);
export const find = (cfg, cat) => items(cfg).find((p) => p.cat === cat);

export function canAdd(cfg, p) {
  const list = items(cfg);
  const cat = CATEGORIES.find((c) => c.id === p.cat);
  if (cat && cat.one && list.some((x) => x.cat === p.cat)) return { ok: false, why: "replace" };
  if (p.max && list.filter((x) => x.id === p.id).length >= p.max) return { ok: false, why: "max" };
  if (!p.max && !p.face && list.some((x) => x.id === p.id)) return { ok: false, why: "dup" };
  return { ok: true };
}

/** Добавить деталь: в категориях «одна штука» заменяет прежнюю */
export function addPart(cfg, id) {
  const p = part(id);
  if (!p) return cfg;
  const cat = CATEGORIES.find((c) => c.id === p.cat);
  let list = [...(cfg.items || [])];
  if (cat && cat.one) list = list.filter((x) => (part(x) || {}).cat !== p.cat);
  else if (!canAdd(cfg, p).ok) return cfg;
  list.push(id);
  const next = { ...cfg, items: list };
  if (p.cat === "radio") next.radioMode = p.modes[0].id;
  return next;
}
export function removeAt(cfg, i) {
  const list = [...(cfg.items || [])];
  list.splice(i, 1);
  return { ...cfg, items: list };
}

export function radio(cfg) {
  const r = find(cfg, "radio");
  if (!r) return null;
  const mode = r.modes.find((m) => m.id === cfg.radioMode) || r.modes[0];
  return { ...r, mode, txDbm: TX_LEVELS.includes(+cfg.txDbm) ? +cfg.txDbm : 14 };
}

/** Радиолиния на борту и на станции для бюджета: модуль, режим, мощность, антенны */
export function linkOf(cfg) {
  const r = radio(cfg);
  return r ? { radio: r, mode: r.mode, txDbm: r.txDbm, ant: find(cfg, "antenna"), gs: find(cfg, "station") } : null;
}

/** Радиолиния на расстоянии distM при угле места elevDeg */
export function link(cfg, distM, elevDeg = 0) {
  const l = linkOf(cfg);
  const b = l && linkBudget(l, distM, elevDeg);
  return b ? { ...b, r: l.radio, ant: l.ant, gs: l.gs } : null;
}

/** Самая трудная точка полета для связи: проверяем дальнюю точку и точку с самым большим углом места */
export function worstLink(cfg, fl) {
  let worst = null;
  for (let i = 0; i <= 20; i++) {
    // ветер наклоняет трос и уносит спутник от станции: учитываем снос на этой высоте
    const alt = (fl.altMax * i) / 20, x = fl.station + alt * Math.tan((Math.min(35, (fl.wind || 0) * 2.6 * Math.pow(Math.max(2, alt) / 10, 0.14)) * Math.PI) / 180);
    const d = Math.hypot(alt, x), el = (Math.atan2(alt, x) * 180) / Math.PI;
    const ln = link(cfg, d, el);
    if (ln && (!worst || ln.margin < worst.margin)) worst = { ...ln, dist: d, elev: el, alt };
  }
  return worst;
}

/** Средняя мощность, Вт: постоянное потребление + передача телеметрии (пакет pktBytes раз в period с) */
export function power(cfg, pktBytes = 48, period = 1) {
  const list = items(cfg);
  const idle = list.reduce((s, p) => s + (p.idle || 0), 0) / 1000;
  const r = radio(cfg);
  const duty = r ? Math.min(1, airtime(r, r.mode, Math.min(pktBytes, r.maxlen)) / period) : 0;
  const tx = r ? (txPowerW(r.txDbm) / TX_EFF) * duty : 0;
  const bms = list.some((p) => p.bms);
  const total = (idle + tx) / (bms ? DCDC : 1);
  const wh = list.reduce((s, p) => s + (p.wh || 0), 0);
  const solar = list.reduce((s, p) => s + (p.solar || 0), 0) * 0.32; // панели на вращающемся спутнике: в среднем около трети
  return { idle, tx, duty, total, wh, solar, net: Math.max(0.01, total - solar), hours: wh ? (wh * 0.85) / Math.max(0.01, total - solar) : 0 };
}

export function mass(cfg) {
  const rows = items(cfg).filter((p) => p.cat !== "station").map((p) => ({ name: p.name, g: p.mass || 0 }));
  const parts = rows.reduce((s, r) => s + r.g, 0);
  const wiring = Math.round(parts * WIRING);
  return { rows, parts, wiring, total: parts + wiring };
}

export function stack(cfg) {
  const boards = items(cfg).filter((p) => p.h);
  const used = boards.reduce((s, p) => s + p.h + BOARD_GAP, 0);
  const frame = find(cfg, "frame");
  return { boards, used, limit: frame ? frame.stack : FRAME_STACK };
}

/** Предстартовая проверка (правила 13.4 и 13.5.2) и бюджеты для задания и документации */
export function inspect(cfg, flight = {}) {
  const fl = flightPlan(flight);
  const m = mass(cfg), st = stack(cfg), pw = power(cfg);
  const dmax = Math.hypot(fl.altMax, fl.station);
  const ln = worstLink(cfg, fl);
  const frame = find(cfg, "frame"), obc = find(cfg, "obc");
  const batt = has(cfg, (p) => p.battery);
  const storage = has(cfg, (p) => p.cat === "storage") || (obc && obc.storage);
  const camera = find(cfg, "payload") && has(cfg, (p) => p.sensor === "camera");
  const flightH = (fl.tEnd - fl.tLaunch + fl.pre) / 3600;
  const checks = [
    { key: "dims", ok: !!frame && frame.size >= 95 && frame.size <= 105 && st.used <= st.limit,
      label: "Габариты 1U: каркас 95-105 мм, стек плат помещается", value: `${st.used} из ${st.limit} мм` },
    { key: "mass", ok: m.total <= MAX_MASS, label: "Масса не больше 800 г", value: `${m.total} г` },
    { key: "power_on", ok: !!obc && batt, label: "Включается: есть бортовой компьютер и аккумулятор" },
    { key: "logging", ok: !!storage, label: "Запись данных на борт (microSD)" },
    { key: "camera_ok", ok: !camera || (!!obc && !!obc.camera && !!storage), label: "Камера подключена к ESP32 или Raspberry Pi и пишет на накопитель", optional: !camera },
    { key: "link", ok: !!ln && !ln.bad && ln.margin >= 0, warn: !!ln && !ln.bad && ln.margin < FADE,
      label: "Связь с наземной станцией на максимальной дальности", value: ln ? (ln.bad ? "частоты не совпадают" : `запас ${ln.margin.toFixed(1)} дБ (высота ${Math.round(ln.alt)} м, угол ${Math.round(ln.elev)}°)`) : "нет радио, антенны или станции" },
    { key: "safety", ok: !batt || has(cfg, (p) => p.bms), label: "Батарея защищена от короткого замыкания (BMS)" },
    { key: "energy", ok: pw.hours >= flightH * 1.5, label: "Энергии хватает на полет с запасом 50%",
      value: pw.wh ? `${(pw.hours * 60).toFixed(0)} мин при плане ${(flightH * 60).toFixed(0)} мин` : "нет аккумулятора" },
  ];
  return { checks, ok: checks.every((c) => c.ok || c.optional), mass: m, stack: st, power: pw, link: ln, dmax, flight: fl };
}

/** Таблицы бюджетов в CSV для технической документации (раздел про массу и энергию) */
export function budgetCsv(cfg, flight) {
  const r = inspect(cfg, flight);
  const lines = ["Компонент;Масса, г;Потребление, мВт"];
  for (const p of items(cfg)) if (p.cat !== "station") lines.push(`${p.name};${p.mass || 0};${p.idle || 0}`);
  lines.push(`Провода и крепеж (оценка ${WIRING * 100}%);${r.mass.wiring};`);
  lines.push(`Итого;${r.mass.total};${Math.round(r.power.idle * 1000)}`);
  lines.push("");
  lines.push(`Средняя мощность с передачей телеметрии, Вт;${r.power.total.toFixed(2)}`);
  lines.push(`Запас энергии аккумулятора, Вт·ч;${r.power.wh}`);
  lines.push(`Расчетное время работы, мин;${(r.power.hours * 60).toFixed(0)}`);
  if (r.link) lines.push(`Запас радиолинии в худшей точке (${Math.round(r.link.dist)} м, угол ${Math.round(r.link.elev)}°), дБ;${r.link.margin.toFixed(1)}`);
  return lines.join("\n");
}

export { PARTS, CATEGORIES };
