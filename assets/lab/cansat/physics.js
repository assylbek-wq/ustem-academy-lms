// Полет ракеты с CanSat в вертикальной плоскости (x - по ветру, z - вверх): направляющая, работа двигателя
// по таблице тяги, сопротивление, флюгерный разворот по запасу устойчивости, замедлитель 7 с, вышибной заряд,
// раскрытие двух парашютов, снос ветром и посадка. Считается целиком до запуска бортовой программы.
import { MOTOR } from "./catalog.js";
import { CHUTE_CD, canMass, descentRate, rocketModel, rocketOf } from "./model.js";
import { G, airDensity, gauss, rng } from "../sat/core.js";

const RAIL = 1.0;          // длина направляющей, м
const CAN_LINES_N = 160;   // прочность строп парашюта CanSat, Н
const ROCKET_LINES_N = 350;
const DEG = Math.PI / 180;

export function thrustAt(t) {
  const c = MOTOR.curve;
  if (t <= 0 || t >= c[c.length - 1][0]) return 0;
  for (let i = 1; i < c.length; i++) if (t <= c[i][0]) { const [a, fa] = c[i - 1], [b, fb] = c[i]; return fa + ((fb - fa) * (t - a)) / (b - a); }
  return 0;
}
const IMPULSE = (() => { let s = 0; for (let t = 0; t < MOTOR.burn; t += 0.001) s += thrustAt(t) * 0.001; return s; })();

/** Ветер на высоте h: степенной закон от ветра на 10 м, с порывами */
export function windAt(f, h, t, gust) {
  return f.wind * Math.pow(Math.max(2, h) / 10, 0.14) * (1 + 0.2 * Math.sin(t / 4.3 + gust) + 0.1 * Math.sin(t / 1.7 + 2 * gust));
}

/**
 * Полет: rocket и can - записи с шагом 0,02 с (t, x, z, vx, vz, th - угол оси от вертикали, fx/fz - перегрузка
 * в осях корпуса, gyro, phase), ev - события и итоговые числа для разбора и проверок.
 */
export function fly(cfg, flight) {
  const f = flight;
  const r = rng((f.seed || 11) * 977 + 3);
  const gust = r() * 10;
  const ro = rocketOf(cfg);
  const lift = rocketModel(cfg, false), burn = rocketModel(cfg, true);
  const canG = canMass(cfg).total / 1000;
  const T0 = f.pre;
  const rail = (ro.rail || 0) * DEG * -1; // направляющая наклонена против ветра
  const ev = { tLaunch: T0, warnings: [] };
  const rocket = [], can = [];
  const REC = 0.02;
  let nextRec = 0;

  // состояние ракеты (вместе с CanSat до вышибного заряда)
  let t = 0, x = 0, z = 0, vx = 0, vz = 0, th = rail, w = 0, onRail = true, railS = 0;
  const misSign = r() < 0.5 ? -1 : 1;
  let maxA = 0, maxV = 0, maxAoA = 0, apogee = 0, tApo = null, fxB = 0, fzB = G, tumble = false;
  const tEject = T0 + MOTOR.burn + MOTOR.delay;
  const props = (tt) => {
    const k = Math.min(1, Math.max(0, tt / MOTOR.burn));
    const blend = (a, b) => a + (b - a) * k;
    return { m: blend(lift.m, burn.m) / 1000, cg: blend(lift.cg, burn.cg), I: blend(lift.inertia, burn.inertia) };
  };
  const rec = (arr, row) => arr.push(row);

  // ─── до старта ───
  for (t = 0; t < T0; t += REC) {
    rec(rocket, { t: +t.toFixed(2), x: 0, z: 0, vx: 0, vz: 0, th, fx: 0, fz: G, gx: 0, gy: 0, gz: 0, ph: 0 });
  }
  nextRec = T0;
  // ─── активный участок и пассивный полет до вышибного заряда ───
  let dt = 0.002;
  t = T0;
  while (t < tEject) {
    const tt = t - T0;
    const { m, cg, I } = props(tt);
    const T = thrustAt(tt);
    const h = Math.max(0, z), rho = airDensity(h, f.groundP, f.groundT);
    const wind = windAt(f, h, t, gust);
    const vax = vx - wind, vaz = vz, va = Math.hypot(vax, vaz);
    const thAir = va > 0.5 ? Math.atan2(vax, vaz) : th;
    let aoa = th - thAir; aoa = Math.atan2(Math.sin(aoa), Math.cos(aoa));
    const q = 0.5 * rho * va * va;
    const ax0 = Math.sin(th), az0 = Math.cos(th);
    const cd = lift.cd * (1 + 6 * Math.min(1, aoa * aoa));
    const D = q * lift.aref * cd;
    const N = q * lift.aref * lift.cn * Math.sin(aoa); // нормальная сила, перпендикулярно оси
    let Fx = T * ax0 - (va > 0 ? (D * vax) / va : 0) - N * az0;
    let Fz = T * az0 - (va > 0 ? (D * vaz) / va : 0) + N * ax0 - m * G;
    if (onRail) {
      // по направляющей: только вдоль оси, без вращения
      const along = Fx * ax0 + Fz * az0;
      const a = Math.max(0, along / m);
      const v = Math.hypot(vx, vz) + a * dt;
      vx = v * ax0; vz = v * az0;
      railS += v * dt;
      x += vx * dt; z += vz * dt;
      if (railS >= RAIL) { onRail = false; ev.vRail = v; ev.tRail = t; }
      fxB = 0; fzB = along / m;
    } else {
      const ax = Fx / m, az = Fz / m;
      vx += ax * dt; vz += az * dt; x += vx * dt; z += vz * dt;
      // флюгерный момент: стабилизаторы разворачивают ось по набегающему потоку
      const arm = (lift.cp - cg) / 1000;
      const Mr = -q * lift.aref * lift.cn * arm * Math.sin(aoa);
      const damp = 0.5 * rho * va * lift.aref * (lift.cnN * Math.pow((lift.xN - cg) / 1000, 2) + lift.cnF * Math.pow((lift.xF - cg) / 1000, 2));
      const jet = T > 0 ? ((MOTOR.prop / 1000) / MOTOR.burn) * Math.pow((lift.L - cg) / 1000, 2) : 0;
      // перекос тяги и несимметрия: небольшой момент, неустойчивую ракету он разворачивает
      const mis = T * Math.sin(0.4 * DEG) * ((lift.L - cg) / 1000) * misSign;
      w += ((Mr + mis - (damp + jet) * w) / I) * dt;
      th += w * dt;
      if (Math.abs(aoa) > 70 * DEG) tumble = true;
      maxAoA = Math.max(maxAoA, Math.abs(aoa));
      // перегрузка в осях корпуса: удельная сила = a - g
      const sfx = ax, sfz = az + G;
      fzB = sfx * ax0 + sfz * az0; fxB = sfx * az0 - sfz * ax0;
    }
    if (z < 0 && !onRail) { z = 0; ev.crash = t; break; }
    maxA = Math.max(maxA, Math.hypot(fxB, fzB));
    maxV = Math.max(maxV, Math.hypot(vx, vz));
    if (z > apogee) { apogee = z; tApo = t; }
    if (tt >= MOTOR.burn && !ev.tBurnout) ev.tBurnout = t;
    if (t >= nextRec - 1e-9) {
      const roll = Math.min(120, Math.hypot(vx, vz) * 0.5);
      rec(rocket, { t: +t.toFixed(3), x, z, vx, vz, th, fx: fxB, fz: fzB, gx: (w / DEG), gy: gauss(r) * 2, gz: roll, ph: tt < MOTOR.burn ? 1 : 2 });
      nextRec += REC;
    }
    t += dt;
    if (tt > 0.5 && dt < 0.005) dt = 0.005;
  }
  if (!ev.tBurnout) ev.tBurnout = T0 + MOTOR.burn;
  ev.apogee = apogee; ev.tApogee = tApo || t; ev.maxAccel = maxA; ev.maxV = maxV; ev.maxAoA = maxAoA / DEG; ev.tumble = tumble;
  ev.vRail = ev.vRail || 0;

  // ─── вышибной заряд: CanSat и ракета разделяются ───
  const vEj = Math.hypot(vx, vz);
  ev.tEject = ev.crash || tEject; ev.vEject = vEj; ev.ejectAlt = z; ev.ejectBeforeApogee = !ev.crash && vz > 1;
  const canArea = (Math.PI * Math.pow((cfg.canChute || 0) / 100, 2)) / 4;
  const rArea = (Math.PI * Math.pow(ro.chute / 100, 2)) / 4;
  const rho0 = airDensity(z, f.groundP, f.groundT);
  ev.shockCan = 0.5 * rho0 * vEj * vEj * CHUTE_CD * canArea * 1.6;   // рывок при раскрытии с коэффициентом 1,6
  ev.shockRocket = 0.5 * rho0 * vEj * vEj * CHUTE_CD * rArea * 1.6;
  ev.canChuteOk = !ev.crash && canArea > 0 && ev.shockCan <= CAN_LINES_N;
  ev.rocketChuteOk = !ev.crash && ev.shockRocket <= ROCKET_LINES_N;
  if (ev.crash) ev.warnings.push("Ракета упала до срабатывания вышибного заряда");
  else {
    if (!ev.canChuteOk && canArea > 0) ev.warnings.push(`Рывок ${Math.round(ev.shockCan)} Н оборвал стропы парашюта CanSat`);
    if (!ev.rocketChuteOk) ev.warnings.push(`Рывок ${Math.round(ev.shockRocket)} Н оборвал стропы парашюта ракеты`);
  }

  // спуск двух тел: свое сопротивление, свой парашют, общий ветер
  const descend = (mass, chuteArea, chuteOk, bodyCdA, out, kind) => {
    let tt = ev.tEject, px = x, pz = z, pvx = vx, pvz = vz, k = 0, landed = null, vLand = 0;
    let swing = 0.6, nr = Math.ceil(tt / REC) * REC;
    const spin = kind === "can" ? 70 + r() * 80 : 20;
    while (tt < ev.tEject + 400) {
      const h = Math.max(0, pz), rho = airDensity(h, f.groundP, f.groundT);
      const wind = windAt(f, h, tt, gust);
      const vax = pvx - wind, vaz = pvz, va = Math.hypot(vax, vaz);
      const open = chuteOk ? Math.min(1, (tt - ev.tEject) / 0.7) : 0;
      const cdA = bodyCdA + CHUTE_CD * chuteArea * open * open;
      const D = 0.5 * rho * va * va * cdA;
      const ax = va > 0 ? (-D * vax) / va / mass : 0, az = (va > 0 ? (-D * vaz) / va / mass : 0) - G;
      pvx += ax * 0.01; pvz += az * 0.01; px += pvx * 0.01; pz += pvz * 0.01;
      tt += 0.01;
      if (pz <= 0) { landed = tt; vLand = Math.hypot(pvx, pvz); pz = 0; break; }
      if (tt >= nr) {
        const age = tt - ev.tEject;
        swing = 0.6 * Math.exp(-age / 6) + 0.08; // раскачка после рывка затухает
        const phi = swing * Math.sin(age * 2 * Math.PI / 1.4);
        const tumbleK = kind === "can" && age < 0.7 ? 1 : 0;
        const sfx = ax, sfz = az + G;
        const th2 = tumbleK ? age * 9 : phi;
        let fz = sfx * Math.sin(th2) + sfz * Math.cos(th2), fx = sfx * Math.cos(th2) - sfz * Math.sin(th2);
        if (kind === "can" && chuteOk && age > 0.5 && age < 0.62) fz += Math.min(60 * G, ev.shockCan / mass); // рывок строп
        out.push({ t: +tt.toFixed(2), x: px, z: pz, vx: pvx, vz: pvz, th: th2, fx, fz,
          gx: tumbleK ? 520 : (swing * 2 * Math.PI / 1.4) * Math.cos(age * 2 * Math.PI / 1.4) / DEG, gy: gauss(r) * 3, gz: tumbleK ? 300 : spin, ph: 3 });
        nr += REC;
      }
    }
    return { landed: landed || tt, vLand, x: px };
  };
  const canBodyCdA = 0.8 * 0.0034;
  const rocketBodyCdA = 1.1 * lift.aref * 4; // ракета падает боком
  // до разделения CanSat едет внутри ракеты: та же запись
  for (const row of rocket) if (row.t <= ev.tEject) can.push({ ...row });
  const c = descend(canG, canArea, ev.canChuteOk, canBodyCdA, can, "can");
  const rmass = (burn.m - canMass(cfg).total) / 1000;
  const rr = descend(rmass, rArea, ev.rocketChuteOk, rocketBodyCdA, rocket, "rocket");
  ev.tLand = c.landed; ev.vLandCan = c.vLand; ev.xCan = c.x;
  ev.tLandRocket = rr.landed; ev.vLandRocket = rr.vLand; ev.xRocket = rr.x;
  ev.vDescCan = descentRate(canMass(cfg).total, cfg.canChute);
  // после посадки: удар и покой
  const tEnd = Math.max(c.landed, rr.landed) + (f.post || 15);
  const impact = (arr, tl, v, xl) => {
    for (let tt = Math.ceil(tl / REC) * REC; tt <= tEnd + 1e-9; tt += REC) {
      const hit = tt - tl < 0.04 ? Math.min(100 * G, v / 0.03) : 0;
      arr.push({ t: +tt.toFixed(2), x: xl, z: 0, vx: 0, vz: 0, th: 1.2, fx: G * 0.9, fz: G * 0.35 + hit, gx: 0, gy: 0, gz: 0, ph: 4 });
    }
  };
  impact(can, c.landed, c.vLand, c.x);
  impact(rocket, rr.landed, rr.vLand, rr.x);
  ev.tEnd = tEnd;
  ev.impulse = IMPULSE;
  return { rocket, can, ev, REC };
}

/** Быстрый прогноз для конструктора (как кнопка Simulate в OpenRocket) */
export function predict(cfg, flight) {
  const { ev } = fly(cfg, flight);
  return ev;
}
