// Модель WSO CanSat: банка (масса, стек, парашют), ракета-носитель (массы, центр тяжести, центр давления
// по Barrowman, запас устойчивости, коэффициент сопротивления), радио и предстартовая проверка (12.4-12.6).
import { CAN, CATEGORIES, DEFAULT_ROCKET, DIAMETERS, FIN_MATERIALS, MATERIALS, MOTOR, NOSES, PARTS, part } from "./catalog.js";
import { FADE, G, TX_LEVELS, linkBudget } from "../sat/core.js";

export { FADE, TX_LEVELS, PARTS, CATEGORIES, DIAMETERS };
export const MAX_ROCKET = 1500;   // г вместе с двигателем и CanSat (12.4.2)
export const MIN_STAB = 1.5;      // калибра на всех участках активного полета (12.4.1)
export const WIRING = 0.08;       // провода, винты, клей внутри банки
export const CHUTE_GSM = 45;      // г/м² ткани купола (рипстоп) + стропы
export const CHUTE_CD = 0.8;      // плоский круглый купол

export const DEFAULT_FLIGHT = { pre: 40, post: 15, wind: 3, station: 60, groundP: 1013.25, groundT: 18, lat: 43.3605, lon: 77.0055, refApogee: 450, seed: 11 };

export const emptyConfig = () => ({ items: [], radioMode: null, txDbm: 14, canChute: 35, rocket: { ...DEFAULT_ROCKET } });
export const rocketOf = (cfg) => ({ ...DEFAULT_ROCKET, ...(cfg.rocket || {}) });

export function items(cfg) { return (cfg.items || []).map((id) => part(id)).filter(Boolean); }
export const has = (cfg, pred) => items(cfg).some(pred);
export const find = (cfg, cat) => items(cfg).find((p) => p.cat === cat);

export function addPart(cfg, id) {
  const p = part(id);
  if (!p) return cfg;
  const cat = CATEGORIES.find((c) => c.id === p.cat);
  let list = [...(cfg.items || [])];
  if (cat && cat.one) list = list.filter((x) => (part(x) || {}).cat !== p.cat);
  else if (list.includes(id)) return cfg;
  list.push(id);
  const next = { ...cfg, items: list };
  if (p.cat === "radio") next.radioMode = p.modes[0].id;
  return next;
}
export function removeAt(cfg, i) { const list = [...(cfg.items || [])]; list.splice(i, 1); return { ...cfg, items: list }; }

export function radio(cfg) {
  const r = find(cfg, "radio");
  if (!r) return null;
  const mode = r.modes.find((m) => m.id === cfg.radioMode) || r.modes[0];
  return { ...r, mode, txDbm: TX_LEVELS.includes(+cfg.txDbm) ? +cfg.txDbm : 14 };
}
export function linkOf(cfg) {
  const r = radio(cfg);
  return r ? { radio: r, mode: r.mode, txDbm: r.txDbm, ant: find(cfg, "antenna"), gs: find(cfg, "station") } : null;
}

// ─── CanSat ───
const area = (dCm) => (Math.PI * Math.pow(dCm / 100, 2)) / 4;
export const chuteMass = (dCm) => (dCm > 0 ? +(area(dCm) * CHUTE_GSM + 3).toFixed(1) : 0);

export function canMass(cfg) {
  const rows = items(cfg).filter((p) => p.cat !== "station").map((p) => ({ name: p.name, g: p.mass || 0 }));
  const parts = rows.reduce((s, r) => s + r.g, 0);
  const wiring = Math.round(parts * WIRING);
  const chute = chuteMass(cfg.canChute || 0);
  return { rows, parts, wiring, chute, total: Math.round(parts + wiring + chute) };
}
export function canStack(cfg) {
  const boards = items(cfg).filter((p) => p.h);
  return { boards, used: boards.reduce((s, p) => s + p.h + 2, 0), limit: CAN.stack };
}
/** Установившаяся скорость снижения под куполом диаметром dCm, м/с */
export const descentRate = (massG, dCm, rho = 1.2) => (dCm > 0 ? Math.sqrt((2 * (massG / 1000) * G) / (rho * CHUTE_CD * area(dCm))) : 40);

// ─── Ракета ───
const noseLen = (r) => r.d * r.noseK;

/** Детали ракеты с массами (г) и положением центра масс от носа (мм) - как дерево компонентов в OpenRocket */
export function rocketParts(cfg, burnout = false) {
  const r = rocketOf(cfg), mat = MATERIALS[r.material] || MATERIALS.paper, fm = FIN_MATERIALS[r.finMat] || FIN_MATERIALS.balsa, nose = NOSES[r.nose] || NOSES.ogive;
  const L = r.len * 10, D = r.d, Ln = noseLen(r), Lb = L - Ln;
  const rad = D / 2000, slant = Math.hypot(rad, Ln / 1000);
  const noseShell = Math.PI * rad * slant * (r.nose === "cone" ? 1 : 1.1) * 0.0012 * 1240 * 1000;
  const body = Math.PI * (D / 1000) * (Lb / 1000) * (mat.wall / 1000) * mat.rho * (mat.fill || 1) * 1000;
  const finArea = ((r.root + r.tip) / 2) * r.span / 1e6;
  const fins = r.fins * finArea * (fm.t / 1000) * fm.rho * 1000;
  const xb = L - r.root;
  const finCg = xb + (r.sweep * (r.root + 2 * r.tip)) / (3 * (r.root + r.tip)) + ((r.root + r.tip) - (r.root * r.tip) / (r.root + r.tip)) / 6;
  const can = canMass(cfg).total;
  const chute = area(r.chute) * CHUTE_GSM + 18; // купол ракеты + амортизатор + пыж
  const list = [
    { key: "nose", name: `Головной обтекатель (${nose.name.toLowerCase()}, PLA)`, g: noseShell + 8, x: Ln * (r.nose === "cone" ? 0.667 : 0.62) },
    { key: "body", name: `Корпус: ${mat.name.toLowerCase()}`, g: body, x: Ln + Lb / 2 },
    { key: "fins", name: `Стабилизаторы ${r.fins} шт: ${fm.name.toLowerCase()}`, g: fins, x: finCg },
    { key: "can", name: "CanSat с парашютом", g: can, x: Ln + 10 + CAN.h / 2 },
    { key: "chute", name: `Парашют ракеты ${r.chute} см, амортизатор, пыж`, g: chute, x: Ln + CAN.h + 60 },
    { key: "mount", name: "Моторамa и центрирующие кольца", g: 26, x: L - MOTOR.len / 2 - 15 },
    { key: "motor", name: `Двигатель ${MOTOR.name}` + (burnout ? " (без топлива)" : ""), g: MOTOR.mass - (burnout ? MOTOR.prop : 0), x: L - MOTOR.len / 2 + 10 },
    { key: "lugs", name: "Направляющие кольца, клей, краска", g: 4 + 0.05 * (noseShell + body + fins), x: Ln + Lb * 0.55 },
  ];
  return { list, L, D, Ln, Lb, xb, finArea, nose, mat, fm, r };
}

/** Масса, центр тяжести, центр давления, запас устойчивости и момент инерции */
export function rocketModel(cfg, burnout = false) {
  const rp = rocketParts(cfg, burnout), { list, L, D, Ln, xb, r, nose } = rp;
  const m = list.reduce((s, p) => s + p.g, 0);
  const cg = list.reduce((s, p) => s + p.g * p.x, 0) / m;
  // Barrowman: нос и стабилизаторы
  const cnN = 2, xN = nose.cp * Ln;
  const R = D / 2, S = r.span, Cr = r.root, Ct = r.tip;
  const lf = Math.hypot(S, r.sweep + Ct / 2 - Cr / 2);
  const cnF = r.fins ? (1 + R / (S + R)) * ((4 * r.fins * Math.pow(S / D, 2)) / (1 + Math.sqrt(1 + Math.pow((2 * lf) / (Cr + Ct), 2)))) : 0;
  const xF = xb + (r.sweep * (Cr + 2 * Ct)) / (3 * (Cr + Ct)) + ((Cr + Ct) - (Cr * Ct) / (Cr + Ct)) / 6;
  const cn = cnN + cnF;
  const cp = (cnN * xN + cnF * xF) / cn;
  const inertia = list.reduce((s, p) => s + (p.g / 1000) * Math.pow((p.x - cg) / 1000, 2), 0) + (m / 1000) * Math.pow(L / 1000, 2) / 60;
  // сопротивление (дозвук): нос + трение + толщина стабилизаторов + донный срез + кольца
  const aref = (Math.PI * Math.pow(D / 1000, 2)) / 4;
  const wet = Math.PI * (D / 1000) * (L / 1000) * 0.95 + 2 * r.fins * rp.finArea;
  const cd = nose.cd + 0.0048 * (1 + 1.5 / (L / D)) * (wet / aref) + (0.5 * r.fins * (rp.fm.t / 1000) * (S / 1000)) / aref + 0.12 + 0.02;
  return { m, cg, cp, stab: (cp - cg) / D, cn, cnN, cnF, xN, xF, cd, aref, inertia, parts: list, L, D, Ln, r };
}

export function compartment(cfg) {
  const r = rocketOf(cfg), mat = MATERIALS[r.material] || MATERIALS.paper;
  const inner = r.d - 2 * mat.wall;
  return { inner, fits: inner >= CAN.d + 1.5, clearance: inner - CAN.d };
}

/** Предстартовая проверка: CanSat (12.5) и ракета (12.4, 12.6.4-12.6.5) */
export function inspect(cfg, flight = {}, prediction = null) {
  const fl = { ...DEFAULT_FLIGHT, ...flight };
  const cm = canMass(cfg), stk = canStack(cfg), r = rocketOf(cfg);
  const lift = rocketModel(cfg, false), burn = rocketModel(cfg, true);
  const stab = Math.min(lift.stab, burn.stab);
  const comp = compartment(cfg);
  const obc = find(cfg, "obc");
  const batt = has(cfg, (p) => p.battery);
  const storage = has(cfg, (p) => p.cat === "storage") || (obc && obc.storage);
  const lk = linkOf(cfg);
  const radioOk = !!(lk && lk.ant && lk.gs && lk.ant.freq === lk.radio.freq && lk.gs.freq === lk.radio.freq);
  const vDesc = descentRate(cm.total, cfg.canChute);
  const checks = [
    { key: "can_mass", group: "can", ok: cm.total <= CAN.maxMass, label: "Масса CanSat не больше 300 г", value: `${cm.total} г` },
    { key: "can_fit", group: "can", ok: !!find(cfg, "body") && stk.used <= stk.limit, label: "Все помещается в банку 66 × 115 мм", value: `стек ${stk.used} из ${stk.limit} мм` },
    { key: "power_on", group: "can", ok: !!obc && batt, label: "Включается: компьютер и источник питания" },
    { key: "data", group: "can", ok: !!storage || radioOk, label: "Есть запись на SD или радио на станцию", value: storage && radioOk ? "оба способа" : storage ? "только SD" : radioOk ? "только радио" : "нет" },
    { key: "can_chute", group: "can", ok: vDesc <= 12 && vDesc >= 3, warn: vDesc > 10, label: "Парашют CanSat: снижение 3-12 м/с", value: `${vDesc.toFixed(1).replace(".", ",")} м/с` },
    { key: "stability", group: "rocket", ok: stab >= MIN_STAB, warn: stab > 4, label: "Устойчивость не меньше 1,5 калибра", value: `${stab.toFixed(2).replace(".", ",")} кал.` + (stab > 4 ? " (перестабильна: развернется против ветра)" : "") },
    { key: "rocket_mass", group: "rocket", ok: lift.m <= MAX_ROCKET, label: "Масса ракеты не больше 1500 г", value: `${Math.round(lift.m)} г` },
    { key: "rocket_dims", group: "rocket", ok: r.len >= 70 && r.len <= 150 && r.d >= 50 && r.d <= 100, label: "Длина 70-150 см, диаметр 5-10 см", value: `${r.len} см × ${r.d} мм` },
    { key: "compartment", group: "rocket", ok: comp.fits, label: "Отсек вмещает банку CanSat", value: `внутри ${comp.inner.toFixed(1).replace(".", ",")} мм, банка 66 мм` },
    { key: "materials", group: "rocket", ok: true, label: "Материалы разрешены, двигатель штатный РД1-100-7М", value: r.material === "carbon" ? "карбон экранирует радио" : "" },
  ];
  if (prediction) {
    checks.push({ key: "rail", group: "flight", ok: prediction.vRail >= 12, warn: prediction.vRail < 15, label: "Скорость схода с направляющей не меньше 12 м/с", value: `${prediction.vRail.toFixed(1).replace(".", ",")} м/с` });
  }
  const ln = lk && worstLink(cfg, fl);
  return { checks, ok: checks.every((c) => c.ok || c.optional), can: { mass: cm, stack: stk, vDesc }, rocket: { lift, burn, stab, comp }, link: ln, flight: fl };
}

/** Худшая точка линии: CanSat в отсеке ракеты на апогее (корпус ослабляет сигнал) и над станцией */
export function worstLink(cfg, fl, apogee = 450) {
  const lk = linkOf(cfg);
  if (!lk) return null;
  const mat = MATERIALS[rocketOf(cfg).material] || MATERIALS.paper;
  let worst = null;
  for (let i = 0; i <= 20; i++) {
    const alt = (apogee * i) / 20, sx = -0.5 * fl.station, sy = 0.85 * fl.station;
    const d = Math.hypot(sx, sy, alt), el = (Math.atan2(alt, Math.hypot(sx, sy)) * 180) / Math.PI;
    const b = linkBudget(lk, d, el);
    if (b && (!worst || b.margin < worst.margin)) worst = { ...b, dist: d, elev: el, alt };
  }
  if (worst) worst.inRocket = mat.rf; // дополнительное ослабление, пока CanSat в отсеке
  return worst;
}

/** Таблица масс для документации: CanSat и ракета (как в OpenRocket) */
export function budgetCsv(cfg) {
  const cm = canMass(cfg), rm = rocketModel(cfg);
  const lines = ["CanSat;Масса, г;Потребление, мВт"];
  for (const p of items(cfg)) if (p.cat !== "station") lines.push(`${p.name};${p.mass || 0};${p.idle || 0}`);
  lines.push(`Парашют CanSat ${cfg.canChute} см;${cm.chute};`, `Провода, винты, клей (оценка ${WIRING * 100}%);${cm.wiring};`, `Итого CanSat;${cm.total};`, "");
  lines.push("Ракета;Масса, г;Положение центра масс от носа, мм");
  for (const p of rm.parts) lines.push(`${p.name};${p.g.toFixed(0)};${p.x.toFixed(0)}`);
  lines.push(`Итого на старте;${rm.m.toFixed(0)};${rm.cg.toFixed(0)}`, "");
  const b = rocketModel(cfg, true);
  lines.push(`Центр давления (Barrowman), мм от носа;${rm.cp.toFixed(0)}`, `Запас устойчивости на старте, калибров;${rm.stab.toFixed(2)}`,
    `Запас устойчивости после выгорания, калибров;${b.stab.toFixed(2)}`, `Коэффициент сопротивления Cd (оценка);${rm.cd.toFixed(2)}`,
    `Скорость снижения CanSat, м/с;${descentRate(cm.total, cfg.canChute).toFixed(1)}`);
  return lines.join("\n");
}
