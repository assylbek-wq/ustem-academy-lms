// Трехмерная сцена полета CanSat: полигон, ракета и банка из конструктора, двигатель, дым, отделение обтекателя,
// два парашюта, посадка, тени, радиоимпульсы и четыре камеры. Картина целиком определяется временем полета t
// (запись траектории из physics.js), поэтому паузу и перемотку сцена переносит без накопленных ошибок.
import * as THREE from "three";
import { buildRocket, buildFlame } from "./rocket.js";
import { buildCan, CAN_H, CAN_R } from "./can.js";
import { buildChute } from "./chute.js";
import { Particles, Pulses, flightSmoke, landingDust } from "./fx.js";
import { SUN, makeBlob, makePad } from "./world.js";
import { Stage } from "./stage.js";
import { clamp, dispose, lerp, sample, smooth } from "./util.js";

const PADY = 0.125, CORD = 0.9;

export class FlightScene extends Stage {
  constructor(host, labels = {}) {
    const sd = Math.hypot(0.5, 0.85), ux = -0.5 / sd, uz = 0.85 / sd;
    super(host, labels, { avoid: (x, z) => { const along = x * ux + z * uz, off = Math.abs(x * uz - z * ux); return Math.hypot(x, z) < 20 || (along > 0 && along < 230 && off < 10) || Math.abs(z - 46 - 16 * Math.sin(x * 0.0042)) < 6; } });
    const sc = this.scene;
    this.pad = makePad(); sc.add(this.pad);
    this.station.rotation.y = -Math.atan2(0.5, 0.85);
    this.ps = new Particles(); sc.add(this.ps.mesh);
    this.pulses = new Pulses(); sc.add(this.pulses.group);
    this.blobR = makeBlob(); this.blobC = makeBlob(); sc.add(this.blobR, this.blobC);
    this.models = new THREE.Group(); sc.add(this.models);
    this.lines = new THREE.Group(); sc.add(this.lines);
    this.flameLight = new THREE.PointLight(0xffa040, 0, 9, 1.6); sc.add(this.flameLight);
    this.S1 = {}; this.S2 = {}; this.S3 = {};
    this.rail = 0; this.stationD = 60; this.fl = null; this.pred = null; this.cfgKey = "";
  }
  ready() { return !!this.rocket; }

  // ─────────────── сборка и запись полета ───────────────
  /** cfg: {rocket, parts, canChute (см), wind, station (м), yagi} */
  setConfig(cfg) {
    const key = JSON.stringify([cfg.rocket, (cfg.parts || []).map((p) => p.id), cfg.canChute]);
    this.wind = cfg.wind || 0; this.rail = -((cfg.rocket.rail || 0) * Math.PI) / 180;
    if (cfg.station !== this.stationD || !this.stPos) {
      this.stationD = cfg.station || 60; this.stPos = new THREE.Vector3(-0.5 * this.stationD, 0, 0.85 * this.stationD);
      this.station.position.copy(this.stPos); this.wideKey = "";
    }
    const u = this.station.userData;
    u.yagi.visible = !!cfg.yagi; u.mast.visible = !cfg.yagi; this.yagi = !!cfg.yagi;
    this.pad.userData.setRail(this.rail);
    if (key === this.cfgKey) return;
    this.cfgKey = key; this.cfg = cfg;
    dispose(this.models); this.models.clear();
    const R = this.rocket = buildRocket(cfg.rocket, {});
    R.group.rotation.order = "ZYX";
    this.flame = buildFlame(); this.flame.position.y = -0.014; this.flame.scale.setScalar(Math.max(1, cfg.rocket.d / 75)); R.group.add(this.flame);
    this.rChute = buildChute(Math.max(0.15, cfg.rocket.chute / 100), 0xdc2626, 0xffffff);
    R.group.add(this.rChute.group);
    this.cordGeo = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(12), 3));
    this.cord = new THREE.LineSegments(this.cordGeo, new THREE.LineBasicMaterial({ color: 0xf1f5f9 })); this.cord.frustumCulled = false; R.group.add(this.cord);
    this.can = buildCan(cfg.parts || [], {}); this.can.group.rotation.order = "ZYX";
    this.canRig = new THREE.Group(); this.canRig.add(this.can.group);
    this.cChute = cfg.canChute > 0 ? buildChute(cfg.canChute / 100, 0xff6a1a, 0xffffff, { gores: 8 }) : null;
    this.models.add(R.group, this.canRig); if (this.cChute) this.models.add(this.cChute.group);
    this.models.traverse((o) => { if (o.isMesh && !(o.material && o.material.blending === THREE.AdditiveBlending)) o.castShadow = true; });
    this.pad.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    this.station.traverse((o) => { if (o.isMesh && !o.material.transparent) o.castShadow = true; });
  }

  /** res: {trip: {rocket, can}, ev, packets} или null (ракета на столе) */
  setFlight(res) {
    dispose(this.lines); this.lines.clear(); this.ps.clear(); this.pathR = this.pathC = null;
    if (!res || !res.trip) { this.fl = null; this.wideKey = ""; return; }
    const fl = this.fl = { rocket: res.trip.rocket, can: res.trip.can, ev: res.ev, packets: res.packets || [] };
    const ev = fl.ev;
    this.thE = sample(fl.rocket, ev.tEject - 0.011, {}).th;
    flightSmoke(this.ps, (t) => this.nozzleAt(t), ev, 2);
    if (ev.crash) landingDust(this.ps, 700, ev.crash, sample(fl.rocket, ev.crash, {}).x, 30);
    else { landingDust(this.ps, 500, ev.tLand, ev.xCan, ev.vLandCan); landingDust(this.ps, 600, ev.tLandRocket, ev.xRocket, ev.vLandRocket); }
    const mk = (rows, a, b, color) => {
      const pts = []; const ts = [];
      for (const q of rows) if (q.t >= a && q.t <= b) { pts.push(q.x, Math.max(0, q.z) + PADY, 0); ts.push(q.t); }
      const g = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
      const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85, fog: false })); l.frustumCulled = false; this.lines.add(l);
      return { l, ts };
    };
    this.pathR = mk(fl.rocket, ev.tLaunch, ev.tLandRocket || ev.tEnd, 0xff8a3d);
    this.pathC = ev.crash ? null : mk(fl.can, ev.tEject, ev.tLand, 0x22d3ee);
    this.wideKey = "";
  }

  /** Прогноз из конструктора: пунктир траектории, пока полета нет */
  setPrediction(p) {
    if (this.predLine) { this.scene.remove(this.predLine); dispose(this.predLine); this.predLine = null; }
    this.pred = p && p.ev ? p : null; this.wideKey = "";
    if (!this.pred || !p.path || p.path.length < 2) return;
    const g = new THREE.BufferGeometry().setFromPoints(p.path.map((q) => new THREE.Vector3(q.x, Math.max(0, q.z) + PADY, 0)));
    this.predLine = new THREE.Line(g, new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 4, gapSize: 3, transparent: true, opacity: 0.8, fog: false }));
    this.predLine.computeLineDistances(); this.predLine.frustumCulled = false; this.scene.add(this.predLine);
  }
  /** Положение сопла и ось ракеты на активном участке (для шлейфа) */
  nozzleAt(t) {
    const s = sample(this.fl.rocket, t, this.S3); if (!s) return null;
    return { x: s.x, y: Math.max(0, s.z) + PADY, z: 0, ax: Math.sin(s.th), ay: Math.cos(s.th), vx: s.vx, vy: s.vz };
  }

  /** Расставить ракету, банку, парашюты и эффекты на момент t */
  pose(dt) {
    const t = this.t, fl = this.fl, ev = fl && fl.ev, R = this.rocket, rg = R.group, wind = this.wind;
    const s = fl ? sample(fl.rocket, t, this.S1) : { x: 0, z: 0, th: this.rail, ro: 0, ph: 0, vx: 0, vz: 0 };
    const crashed = !!(fl && ev.crash && t >= ev.crash), ejected = !!(fl && !ev.crash && t >= ev.tEject);
    let th = s.th, px = s.x, py = Math.max(0, s.z) + PADY, pz = 0, noseK = 0, landK = 0, age = 0;
    const off = (R.R + 0.0045) * (1 - smooth(s.z / 3));
    if (ejected) {
      age = t - ev.tEject;
      th = ev.rocketChuteOk ? lerp(this.thE, s.th, smooth(age / 1.2)) : lerp(this.thE, 0.35 * Math.sin(t * 4), smooth(age / 0.8));
      pz = -0.5 * smooth(age / 2); noseK = smooth(age / 0.7);
      if (t >= ev.tLandRocket) { landK = smooth((t - ev.tLandRocket) / 0.55); th = lerp(th, 1.545, landK); py = lerp(PADY, R.R + 0.012, landK); }
    }
    const ax = Math.sin(th), ay = Math.cos(th);
    if (ay < 0 && !ejected) py = Math.max(py, -ay * R.L - 0.1);          // носом вниз: вершина не глубже 10 см
    if (crashed) { const c = sample(fl.rocket, ev.crash - 0.011, this.S3); th = c.th; px = c.x; py = Math.cos(th) < -0.15 ? -Math.cos(th) * R.L - 0.1 : R.R + 0.01; if (Math.cos(th) >= -0.15) th = 1.545 * Math.sign(Math.sin(th) || 1); }
    rg.position.set(px + Math.cos(th) * off, py - Math.sin(th) * off, pz);
    rg.rotation.set(0, s.ro || 0, -th);
    // двигатель
    const tt = fl ? t - ev.tLaunch : -1, burnEnd = fl ? (ev.tBurnout || ev.tLaunch + 2) - ev.tLaunch : 0;
    const power = fl && tt > 0 && tt < burnEnd && !crashed ? Math.min(1, tt / 0.07) * (tt < 0.45 ? 1.35 : 0.92) * Math.min(1, (burnEnd - tt) / 0.18) : 0;
    this.flame.visible = power > 0.01; if (power > 0) this.flame.userData.flick(this.clock, power);
    this.flameLight.intensity = power * 14; this.flameLight.position.set(px - ax * 0.15, py - ay * 0.15 + 0.05, 0.1);
    this.power = power;
    // обтекатель, амортизатор и парашют ракеты (в осях корпуса)
    const N = R.noseG, sway = Math.sin(this.clock * 2.3) * 0.18 * noseK * (1 - landK);
    N.position.set(lerp(0.17 * noseK, 0, landK), R.Lb + lerp(CORD * 0.42 * noseK, 0.32, landK), lerp(0.05 * noseK, 0.17, landK));
    N.rotation.z = -(lerp(2.95, 2.55, landK) * noseK) + sway;
    const ck = ejected ? smooth(age / 0.6) : 0, ch = this.rChute;
    ch.group.visible = ejected && age > 0.1;
    if (ch.group.visible) {
      const a2 = age - 0.25, ok = ev.rocketChuteOk;
      const open = ok ? smooth(a2 / 0.9) : 0.05 + 0.015 * Math.sin(this.clock * 31);
      const wob = open > 0.9 ? 0.05 * Math.sin(this.clock * 4.2) * Math.exp(-a2 / 4) + 0.014 * Math.sin(this.clock * 2.1) : 0;
      ch.setOpen(lerp(open, 0.82, landK), wob * (1 - landK));
      ch.group.position.set(0, R.Lb + CORD * ck, 0);
      ch.group.rotation.z = th * 0.5 * (1 - landK); ch.group.scale.set(lerp(1, 0.13, landK), 1, 1);
    }
    this.cord.visible = ejected;
    if (ejected) {
      const p = this.cordGeo.attributes.position.array;
      p.set([0, R.Lb, 0, 0, R.Lb + CORD * ck, 0, 0, R.Lb + CORD * ck * 0.5, 0, N.position.x, N.position.y - 0.03, N.position.z]);
      this.cordGeo.attributes.position.needsUpdate = true;
    }
    // CanSat
    const rig = this.canRig, cc = this.cChute;
    rig.visible = ejected; if (cc) cc.group.visible = false;
    let cx = px, cy = py, cz = 0, cth = 0, cLand = 0, cOpen = 0;
    if (ejected) {
      const q = sample(fl.can, t, this.S2), okc = ev.canChuteOk;
      cx = q.x; cy = Math.max(0, q.z) + 0.1; cz = 0.5 * smooth(age / 2);
      cth = okc ? q.th : age * 5.5;
      if (t >= ev.tLand) { cLand = smooth((t - ev.tLand) / 0.6); cth = lerp(okc ? q.th : 0, 1.5708, cLand); cy = lerp(0.1, CAN_R + 0.004, cLand); }
      rig.position.set(cx, cy, cz);
      this.can.group.rotation.set(0, q.ro || 0, -cth);
      if (cc) {
        cc.group.visible = age > 0.08;
        const exC = rig.scale.x, topL = (CAN_H / 2 + 0.016) * exC;
        if (okc) {
          const a2 = age - 0.3; cOpen = smooth(a2 / 0.7);
          const wob = cOpen > 0.9 ? 0.07 * Math.sin(this.clock * 5) * Math.exp(-a2 / 3) + 0.016 * Math.sin(this.clock * 2.6) : 0;
          cc.setOpen(lerp(cOpen, 0.8, cLand), wob * (1 - cLand));
          const trail = Math.atan2(-q.vx + wind, Math.max(0.5, -q.vz + 4)), hang = lerp(trail, q.th * 0.4, smooth(age / 1.3));
          cc.group.position.set(cx + Math.sin(cth) * topL, cy + Math.cos(cth) * topL, cz);
          cc.group.rotation.set(0, 0, -lerp(hang, 1.5, cLand)); cc.group.scale.set(exC * lerp(1, 0.13, cLand), exC, exC);
        } else {
          // стропы оборваны рывком: купол остается позади и медленно опускается сам
          const a3 = Math.max(0, age - 0.5), p0 = sample(fl.can, ev.tEject + 0.5, this.S3), yy = Math.max(0.06, p0.z + PADY - 2.4 * a3), down = yy <= 0.07 ? 1 : 0;
          cc.setOpen(age < 0.5 ? 0.08 : 0.55, 0.12 * Math.sin(this.clock * 3.3) * (1 - down));
          if (age < 0.5) cc.group.position.set(cx + Math.sin(cth) * topL, cy + Math.cos(cth) * topL, cz);
          else cc.group.position.set(p0.x + wind * Math.min(a3, (p0.z + PADY) / 2.4), yy, cz + 0.4);
          cc.group.rotation.set(0, 0, down ? -1.5 : 0.25 * Math.sin(this.clock * 1.7)); cc.group.scale.set(exC * (down ? 0.13 : 1), exC, exC);
        }
      }
    }
    this.st = { px: rg.position.x, py: rg.position.y, pz, ax, ay, cx, cy, cz, ejected, crashed, age, cOpen, s };
    // цель камеры и точка на земле, куда падает тень
    const tg = this.V;
    if (ejected) tg.set(cx, cy + (cc && ev.canChuteOk ? cc.height * 0.42 * cOpen * (1 - cLand) : 0), cz);
    else tg.set(px + ax * R.L * 0.5, py + ay * R.L * 0.5, 0);
    this.tgt.copy(tg);
    // длина траекторий до текущего момента
    for (const pth of [this.pathR, this.pathC]) if (pth) { let n = 0; const ts = pth.ts; let lo = 0, hi = ts.length; while (lo < hi) { const m = (lo + hi) >> 1; if (ts[m] <= t) lo = m + 1; else hi = m; } n = lo; pth.l.geometry.setDrawRange(0, n); }
    this.ps.update(t, wind);
    this.pulseFn = () => { this.pulses.update(t, fl && fl.packets, (pt) => { const q = sample(fl.can, pt, this.S3); return q ? this.V2.set(q.x, Math.max(0, q.z) + PADY + 0.1, pt >= ev.tEject ? cz : 0).clone() : null; }, this.cam, this.station.userData.antenna); };
    // окружение
    this.clouds.userData.drift(dt, wind); this.sock.userData.update(this.clock, wind);
    this.crew(tg, !!(fl && t > ev.tLaunch));
  }

  /** Камера, тени и преувеличение размеров в общем виде */
  aim(dt) {
    const cam = this.cam, tg = this.tgt, st = this.st, R = this.rocket, fl = this.fl, ev = fl && fl.ev;
    let ex = 1, fov = 42, near = 0.05;
    this.rocket.group.visible = true;
    if (this.mode === "wide") {
      const e = ev || (this.pred && this.pred.ev) || { apogee: 250, xCan: 60, xRocket: 30 };
      const key = [e.apogee, e.xCan, e.xRocket, this.stationD, this.W, this.H].join();
      if (key !== this.wideKey) {
        this.wideKey = key;
        const x0 = Math.min(0, e.xCan || 0, e.xRocket || 0, this.stPos.x) - 25, x1 = Math.max(0, e.xCan || 0, e.xRocket || 0) + 25, Hh = (e.apogee || 100) * 1.14 + 25;
        const tf = Math.tan((40 * Math.PI) / 360);
        this.wide = { c: new THREE.Vector3((x0 + x1) / 2, Hh * 0.44, 0), d: Math.max(Hh / (2 * tf), (x1 - x0) / (2 * tf * cam.aspect)) * 1.08 };
        this.buildRuler(e.apogee || 100);
      }
      const o = this.wideOrb, w = this.wide; fov = 40; near = 1;
      cam.position.set(w.c.x + w.d * Math.sin(o.az) * Math.cos(o.el), Math.max(2, w.c.y + w.d * Math.sin(o.el)), w.c.z + w.d * Math.cos(o.az) * Math.cos(o.el));
      cam.up.set(0, 1, 0); cam.lookAt(w.c);
      ex = lerp(1, clamp(cam.position.distanceTo(tg) / 24, 1, 45), smooth((tg.y - 2) / 40));
    } else if (this.mode === "station") {
      cam.position.set(this.stPos.x + 2.2, 1.62, this.stPos.z - 3.4);
      const d = cam.position.distanceTo(tg), frame = clamp(d * 0.028, 4.2, 13);
      fov = clamp((2 * Math.atan(frame / 2 / d) * 180) / Math.PI, 0.7, 40); near = Math.max(0.3, d * 0.15);
      const k = (fov * Math.PI) / 180 * 0.012, c = this.clock;
      cam.up.set(0, 1, 0); cam.lookAt(tg.x + d * k * Math.sin(c * 1.9), tg.y + d * k * Math.sin(c * 2.7 + 1), tg.z);
    } else if (this.mode === "onboard") {
      fov = 82; near = 0.015;
      if (st.ejected) {
        const g = this.can.group; g.updateWorldMatrix(true, false);
        cam.position.copy(g.localToWorld(this.V2.set(0, -CAN_H / 2 - 0.012, 0)));
        const look = g.localToWorld(this.V.set(0, -3, 0)); cam.up.copy(g.localToWorld(new THREE.Vector3(1, 0, 0)).sub(g.getWorldPosition(new THREE.Vector3()))).normalize(); cam.lookAt(look);
      } else {
        const g = R.group; g.updateWorldMatrix(true, false);
        const a = Math.PI / (this.cfg.rocket.fins || 4) * 2;                 // между стабилизаторами
        const rx = Math.cos(a), rz = Math.sin(a), rr = R.R + 0.075;
        cam.position.copy(g.localToWorld(this.V2.set(rx * rr, R.Lb * 0.78, rz * rr)));
        const look = g.localToWorld(this.V.set(rx * (R.R + 0.3), -0.5, rz * (R.R + 0.3)));
        cam.up.copy(g.localToWorld(new THREE.Vector3(rx, 0.25, rz)).sub(g.getWorldPosition(new THREE.Vector3()))).normalize(); cam.lookAt(look);
      }
    } else {
      const o = this.orb;
      if (o.auto && !this.playing) o.az += dt * 0.09;
      const base = st.ejected ? 2.3 + (this.cChute ? this.cChute.height * 1.7 * st.cOpen : 0) : Math.max(2.9, R.L * 3.1) * (this.power > 0 || (fl && this.t > ev.tLaunch) ? 1.55 : 1);
      this.dist = this.dist == null ? base : lerp(this.dist, base, 1 - Math.exp(-dt * 2.5));
      const d = this.dist * o.zoom, sh = this.power * 0.012;
      cam.position.set(tg.x + d * Math.sin(o.az) * Math.cos(o.el) + sh * Math.sin(this.clock * 83), Math.max(0.3, tg.y + d * Math.sin(o.el) + sh * Math.sin(this.clock * 71)), tg.z + d * Math.cos(o.az) * Math.cos(o.el));
      cam.up.set(0, 1, 0); cam.lookAt(tg);
    }
    this.setLens(fov, near);
    this.rocket.group.scale.setScalar(ex); this.canRig.scale.setScalar(ex);
    if (this.ruler) this.ruler.visible = this.mode === "wide";
    for (const pth of [this.pathR, this.pathC]) if (pth) pth.l.visible = this.mode === "wide";
    if (this.predLine) this.predLine.visible = !fl;
    this.shadowAt(tg);
    // в общем виде тела далеко: мягкие пятна под ними
    const far = this.mode === "wide";
    const blob = (b, x, y, z, on) => { b.visible = on && far; if (b.visible) { const k = 6 + y * 0.05; b.position.set(x - SUN.x * (y / SUN.y), 0.03, z - SUN.z * (y / SUN.y)); b.scale.setScalar(k); b.material.opacity = clamp(1.1 - y / 500, 0.25, 0.9); } };
    blob(this.blobR, st.px, st.py, st.pz, st.py > 3); blob(this.blobC, st.cx, st.cy, st.cz, st.ejected && st.cy > 3);
    this.pulseFn();   // после камеры: размер колец считается от ее нового положения
  }

  // ─────────────── подписи поверх сцены ───────────────
  initLabels() {
    const T = this.T, v = new THREE.Vector3();
    this.tag("station", T.station || "Station", "", () => v.copy(this.stPos).setY(3.6), () => this.mode === "wide" || (this.mode === "follow" && !this.fl));
    this.tag("pad", T.pad || "Pad", "", () => v.set(0, 2.2, 0), () => this.mode === "wide" && (!this.fl || this.st.py > 30));
    this.tag("can", "CanSat", "s3-tag-can", () => v.set(this.st.cx, this.st.cy, this.st.cz), () => this.st.ejected && (this.mode === "wide" || this.mode === "station"));
    this.tag("rocket", T.rocket || "Rocket", "s3-tag-rocket", () => v.set(this.st.px, this.st.py, this.st.pz), () => this.st.ejected && (this.mode === "wide" || this.mode === "station"));
    this.tag("apogee", T.apogee || "Apogee", "s3-tag-apo", () => { const p = this.apoPoint(); return p && v.copy(p); }, () => this.mode === "wide" || !this.fl,
      () => { const e = (this.fl && this.fl.ev) || (this.pred && this.pred.ev); return e ? `${this.fl ? "" : "≈ "}${Math.round(e.apogee)} м` : ""; });
  }
  apoPoint() {
    const rows = this.fl ? this.fl.rocket : this.pred && this.pred.path; if (!rows || !rows.length) return null;
    if (this.apoRows !== rows) { this.apoRows = rows; let best = rows[0]; for (const q of rows) if (q.z > best.z) best = q; this.apoP = new THREE.Vector3(best.x, best.z + PADY, 0); }
    return this.apoP;
  }
  buildRuler(apogee) {
    if (this.ruler) { this.scene.remove(this.ruler); dispose(this.ruler); }
    this.dropTags("tick");
    const step = apogee > 900 ? 200 : apogee > 360 ? 100 : 50, top = Math.ceil(apogee / step) * step, pts = [0, 0, -10, 0, top, -10];
    for (let y = step; y <= top; y += step) {
      pts.push(-4, y, -10, 4, y, -10);
      const p = new THREE.Vector3(0, y, -10);
      this.tag("tick", "", "s3-tag-tick", () => p, () => this.mode === "wide", () => `${y} м`);
    }
    this.ruler = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, fog: false }));
    this.ruler.frustumCulled = false; this.scene.add(this.ruler);
  }

}
