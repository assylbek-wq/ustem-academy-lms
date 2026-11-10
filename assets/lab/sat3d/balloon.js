// Трехмерная сцена полета CubeSat на привязном аэростате: лебедка, аэростат на тросе, спутник на подвесе
// вращается и раскачивается, ветер наклоняет трос и сносит аэростат от станции. Положение считается из тех же
// формул, что и полет (cubesat/flight.js: высота, снос, вращение, раскачка), поэтому пауза и перемотка точны.
import * as THREE from "three";
import { buildCube, CUBE } from "./cube.js";
import { Pulses } from "./fx.js";
import { SUN, makeBlob } from "./world.js";
import { Stage } from "./stage.js";
import { canvasTex, clamp, dispose, lam, lerp, smooth, std, TAU } from "./util.js";

const HANG = 4.2, REST = 1.0, X0 = 2.4, DEG = Math.PI / 180;   // X0: аэростат стоит над брезентом рядом с лебедкой

/** Привязной аэростат: обтекаемая оболочка с тремя надувными стабилизаторами, нос смотрит против ветра (-X) */
function makeAerostat() {
  const g = new THREE.Group(), L = 6.4, Rm = 1.25;
  const prof = [];
  for (let i = 0; i <= 40; i++) { const k = i / 40, r = Rm * Math.pow(Math.sin(Math.PI * Math.pow(k, 0.72)), 0.82); prof.push(new THREE.Vector2(Math.max(0.001, r), (k - 0.42) * L)); }
  const tex = canvasTex(1024, 512, (c, w, h) => {
    c.fillStyle = "#f4f6f9"; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) { c.fillStyle = "rgba(16,33,63,.05)"; c.fillRect((i / 16) * w, 0, 2, h); }        // швы оболочки
    c.fillStyle = "#ff6a1a"; c.fillRect(0, h * 0.62, w, h * 0.11); c.fillStyle = "#10213f"; c.fillRect(0, h * 0.73, w, h * 0.03);
    c.fillStyle = "#ff6a1a"; c.fillRect(0, 0, w, h * 0.1);
    c.fillStyle = "#10213f"; c.font = "800 78px Inter, system-ui, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle";
    c.save(); c.translate(w * 0.25, h * 0.4); c.rotate(-Math.PI / 2); c.fillText("USTEM", 0, 0); c.restore();
    c.save(); c.translate(w * 0.75, h * 0.4); c.rotate(-Math.PI / 2); c.fillText("WSO", 0, 0); c.restore();
  }, { aniso: 8 });
  const skin = std(0xffffff, { map: tex, roughness: 0.42, metalness: 0.05 });
  const hull = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), skin); hull.rotation.z = -Math.PI / 2;     // ось вдоль X, нос к -X
  g.add(hull);
  const finMat = std(0xff6a1a, { roughness: 0.5 });
  for (const a of [Math.PI / 2, Math.PI / 2 + (TAU / 3), Math.PI / 2 - (TAU / 3)]) {
    const f = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), finMat); f.scale.set(0.95, 0.72, 0.16);
    const p = new THREE.Group(); p.rotation.x = a - Math.PI / 2; f.position.set(2.75, 0.95, 0); p.add(f); g.add(p);
  }
  // стропы от оболочки к узлу под брюхом
  const pts = [];
  for (const x of [-1.6, -0.5, 0.6, 1.6]) for (const z of [-0.7, 0.7]) pts.push(x, -Math.sqrt(Math.max(0, 1.1 - z * z)) * 0.95, z, 0, -2.0, 0);
  const lines = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)), new THREE.LineBasicMaterial({ color: 0x334155 }));
  g.add(lines);
  g.userData.knot = 2.0;       // узел ниже оси на 2 м
  return g;
}

/** Лебедка на прицепе, баллоны с гелием, стартовая площадка */
function makeWinch() {
  const g = new THREE.Group();
  const steel = std(0x9aa3ad, { metalness: 0.8, roughness: 0.35 }), dark = std(0x1f2937, { roughness: 0.7 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.16, 1.0), std(0xff6a1a, { roughness: 0.55 })); base.position.y = 0.42; g.add(base);
  for (const [x, z] of [[-0.55, 0.55], [0.55, 0.55], [-0.55, -0.55], [0.55, -0.55]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 20), dark); w.rotation.x = Math.PI / 2; w.position.set(x, 0.2, z); g.add(w); }
  for (const z of [-0.3, 0.3]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.06), steel); s.position.set(0, 0.75, z); g.add(s); }
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 24), std(0xe2e8f0, { roughness: 0.8 })); drum.rotation.x = Math.PI / 2; drum.position.y = 0.85; g.add(drum);
  for (const z of [-0.26, 0.26]) { const fl = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 24), steel); fl.rotation.x = Math.PI / 2; fl.position.set(0, 0.85, z); g.add(fl); }
  const motor = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.3), dark); motor.position.set(-0.55, 0.65, 0); g.add(motor);
  const tow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.06), steel); tow.position.set(-1.3, 0.4, 0); g.add(tow);
  // баллоны с гелием
  for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 1.25, 6, 14), std(0x7c5a3a, { roughness: 0.5, metalness: 0.3 })); c.rotation.z = Math.PI / 2; c.position.set(-1.6, 0.13, -2.4 - i * 0.27); g.add(c); }
  // брезент под аэростат и ограждение
  const tarp = new THREE.Mesh(new THREE.CircleGeometry(4.2, 40).rotateX(-Math.PI / 2), lam(0x3b6ea8)); tarp.position.set(X0, 0.012, 0); g.add(tarp);
  const coneGeo = new THREE.ConeGeometry(0.11, 0.34, 10), coneMat = std(0xff6a1a, { roughness: 0.6 });
  for (let i = 0; i < 8; i++) { const a = (i * TAU) / 8 + 0.2; const c = new THREE.Mesh(coneGeo, coneMat); c.position.set(X0 + Math.cos(a) * 6, 0.17, Math.sin(a) * 6); g.add(c); }
  g.userData.drum = drum; g.userData.top = new THREE.Vector3(0, 1.05, 0);
  return g;
}

export class BalloonScene extends Stage {
  constructor(host, labels = {}) {
    super(host, labels, { avoid: (x, z) => Math.hypot(x, z) < 22 || (x < 0 && x > -860 && Math.abs(z - 5) < 12) || Math.abs(z - 46 - 16 * Math.sin(x * 0.0042)) < 6 });
    const sc = this.scene;
    this.winch = makeWinch(); sc.add(this.winch);
    this.sock.position.set(-5, 0, -8);
    this.station.rotation.y = -Math.PI / 2;
    this.rig = new THREE.Group(); sc.add(this.rig);                    // начало - спутник; над ним подвес и аэростат
    this.aero = makeAerostat(); this.rig.add(this.aero);
    this.cubeG = new THREE.Group(); this.rig.add(this.cubeG);
    this.hang = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(30), 3)), new THREE.LineBasicMaterial({ color: 0x1f2937 }));
    this.hang.frustumCulled = false; this.rig.add(this.hang);
    this.tether = new THREE.Line(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(41 * 3), 3)), new THREE.LineBasicMaterial({ color: 0xf8fafc, fog: false }));
    this.tether.frustumCulled = false; sc.add(this.tether);
    this.pulses = new Pulses(); sc.add(this.pulses.group);
    this.blob = makeBlob(); sc.add(this.blob);
    this.orb.el = 0.1; this.orb.az = 0.7;
    this.env = null; this.cfgKey = ""; this.stationD = 0; this.fl = null;
    this.P = new THREE.Vector3(); this.B = new THREE.Vector3();
  }
  ready() { return !!(this.cube && this.env); }
  zoom(k) { this.orb.zoom = clamp(this.orb.zoom * k, 0.45, 40); }

  /** cfg: {parts, wind, station, yagi, env (cubesat/flight.js Environment), plan} */
  setConfig(cfg) {
    this.wind = cfg.wind || 0; this.env = cfg.env; this.plan = cfg.plan;
    if (cfg.station !== this.stationD) {
      this.stationD = cfg.station; this.stPos = new THREE.Vector3(-cfg.station, 0, 5); this.station.position.copy(this.stPos); this.wideKey = "";
    }
    const u = this.station.userData; u.yagi.visible = !!cfg.yagi; u.mast.visible = !cfg.yagi; this.yagi = !!cfg.yagi;
    const key = (cfg.parts || []).map((p) => p.id).join();
    if (key === this.cfgKey) return;
    this.cfgKey = key;
    dispose(this.cubeG); this.cubeG.clear();
    this.cube = buildCube(cfg.parts || [], {}); this.cube.group.rotation.order = "YZX";
    this.cubeG.add(this.cube.group);
    for (const o of [this.rig, this.winch, this.station]) o.traverse((m) => { if (m.isMesh && !m.material.transparent) m.castShadow = true; });
  }
  setFlight(res) { this.fl = res && res.packets ? { packets: res.packets } : null; }
  setPrediction() {}

  pose(dt) {
    const t = this.t, e = this.env, wind = this.wind;
    const alt = e.alt(t), up = alt > 0.01, P = this.P.set(e.drift(t) + X0, alt + REST, 0);
    const sw = (up ? e.swing(t) : 0) * DEG, yaw = e.yaw(up ? t : 0) * DEG, lean = e.lean(t) * DEG;
    this.rig.position.copy(P);
    const c = this.cube.group; c.rotation.set(0, yaw, sw);
    // подвес: четыре стропы от углов куба к кольцу, от кольца фал к узлу аэростата
    const ex = this.rig.scale.x, cs = this.cubeG.scale.x;
    const ring = 0.32 * cs, h = this.aero.userData.knot, by = HANG + h, p = this.hang.geometry.attributes.position.array;
    let i = 0;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const lx = sx * 0.042 * cs, lz = sz * 0.042 * cs, ly = 0.056 * cs;
      // угол куба с учетом вращения и раскачки
      const cx = lx * Math.cos(yaw) + lz * Math.sin(yaw), cz = -lx * Math.sin(yaw) + lz * Math.cos(yaw);
      p[i++] = cx * Math.cos(sw) - ly * Math.sin(sw); p[i++] = cx * Math.sin(sw) + ly * Math.cos(sw); p[i++] = cz;
      p[i++] = -ring * Math.sin(sw); p[i++] = ring * Math.cos(sw); p[i++] = 0;
    }
    p[i++] = -ring * Math.sin(sw); p[i++] = ring * Math.cos(sw); p[i++] = 0; p[i++] = 0; p[i++] = HANG; p[i++] = 0;
    this.hang.geometry.attributes.position.needsUpdate = true;
    // аэростат: нос против ветра, слегка задран, покачивается
    const a = this.aero; a.position.set(0, by, 0);
    a.rotation.set(Math.sin(this.clock * 0.7) * 0.03, Math.sin(this.clock * 0.23) * 0.06 * Math.min(1, wind / 3 + 0.3), 0.1 + lean * 0.25 + Math.sin(this.clock * 0.5) * 0.02);
    // трос от лебедки к узлу: под ветром провисает дугой
    const W0 = this.winch.userData.top, B = this.B.set(P.x, P.y + HANG * ex, 0), tp = this.tether.geometry.attributes.position.array;
    for (let k = 0; k <= 40; k++) { const s = k / 40, bow = Math.pow(s, 1 + clamp(lean * 1.6, 0, 1.2)); tp[k * 3] = lerp(W0.x, B.x, bow); tp[k * 3 + 1] = lerp(W0.y, B.y, s); tp[k * 3 + 2] = 0; }
    this.tether.geometry.attributes.position.needsUpdate = true;
    this.winch.userData.drum.rotation.y = -alt * 2.2;
    this.st = { alt, up, yaw, sw };
    const pk = this.fl && this.fl.packets;
    this.pulseFn = () => { this.pulses.update(t, pk, (pt) => new THREE.Vector3(e.drift(pt) + X0, e.alt(pt) + REST, 0), this.cam, this.station.userData.antenna); };
    this.clouds.userData.drift(dt, wind); this.sock.userData.update(this.clock, wind);
    this.crew(P, up);
  }

  aim(dt) {
    const cam = this.cam, P = this.P, o = this.orb;
    let ex = 1, cs = 1, fov = 42, near = 0.03;
    if (this.mode === "wide") {
      const f = this.plan, lean = Math.min(35, f.wind * Math.pow(f.altMax / 10, 0.14) * 1.26 * 2.6) * DEG;
      const key = [f.altMax, f.wind, this.stationD, this.W, this.H].join();
      if (key !== this.wideKey) {
        this.wideKey = key;
        const x0 = -this.stationD - 30, x1 = f.altMax * Math.tan(lean) + 40, Hh = f.altMax * 1.12 + 30, tf = Math.tan((40 * Math.PI) / 360);
        this.wide = { c: new THREE.Vector3((x0 + x1) / 2, Hh * 0.45, 0), d: Math.max(Hh / (2 * tf), (x1 - x0) / (2 * tf * cam.aspect)) * 1.08 };
        this.buildRuler(f.altMax);
      }
      const w = this.wide, q = this.wideOrb; fov = 40; near = 1;
      cam.position.set(w.c.x + w.d * Math.sin(q.az) * Math.cos(q.el), Math.max(2, w.c.y + w.d * Math.sin(q.el)), w.c.z + w.d * Math.cos(q.az) * Math.cos(q.el));
      cam.up.set(0, 1, 0); cam.lookAt(w.c);
      ex = clamp(cam.position.distanceTo(P) / 130, 1, 30); cs = 9;
    } else if (this.mode === "station") {
      cam.position.set(this.stPos.x - 3.4, 1.62, this.stPos.z + 2.6);
      const tg = this.V.set(P.x, P.y + HANG * 0.55, 0), d = cam.position.distanceTo(tg), frame = clamp(d * 0.02, 11, 16);
      fov = clamp((2 * Math.atan(frame / 2 / d) * 180) / Math.PI, 0.5, 40); near = Math.max(0.3, d * 0.15);
      const k = ((fov * Math.PI) / 180) * 0.012, c = this.clock;
      cam.up.set(0, 1, 0); cam.lookAt(tg.x + d * k * Math.sin(c * 1.9), tg.y + d * k * Math.sin(c * 2.7 + 1), tg.z);
      cs = 3;
    } else if (this.mode === "onboard") {
      fov = 84; near = 0.02;
      const g = this.cube.group; g.updateWorldMatrix(true, false);
      cam.position.copy(g.localToWorld(this.V2.set(0, -CUBE / 2 - 0.012, 0)));
      const look = g.localToWorld(this.V.set(0, -3, 0));
      cam.up.copy(g.localToWorld(new THREE.Vector3(1, 0, 0)).sub(g.getWorldPosition(new THREE.Vector3()))).normalize(); cam.lookAt(look);
    } else {
      if (o.auto && !this.playing) o.az += dt * 0.09;
      const d = 0.62 * o.zoom, k = smooth((o.zoom - 2) / 8);                 // при отдалении цель уходит вверх к аэростату
      const ty = P.y + 0.06 + k * (HANG + 2) * 0.5;
      cam.position.set(P.x + d * Math.sin(o.az) * Math.cos(o.el), Math.max(0.25, ty + d * Math.sin(o.el)), d * Math.cos(o.az) * Math.cos(o.el));
      cam.up.set(0, 1, 0); cam.lookAt(P.x, ty, 0);
    }
    this.setLens(fov, near);
    this.rig.scale.setScalar(ex); this.cubeG.scale.setScalar(cs);
    if (this.ruler) this.ruler.visible = this.mode === "wide";
    this.shadowAt(P);
    const far = this.mode === "wide" && P.y > 8;
    this.blob.visible = far; if (far) { this.blob.position.set(P.x - SUN.x * (P.y / SUN.y), 0.03, -SUN.z * (P.y / SUN.y)); this.blob.scale.setScalar(10 + P.y * 0.05); }
    this.pulseFn();   // после камеры: размер колец считается от ее нового положения
  }

  initLabels() {
    const T = this.T, v = new THREE.Vector3();
    this.tag("station", T.station || "Station", "", () => v.copy(this.stPos).setY(3.6), () => this.mode === "wide" || this.mode === "follow" && this.orb.zoom > 6);
    this.tag("winch", T.winch || "Winch", "", () => v.set(0, 1.6, 0), () => this.mode === "wide");
    this.tag("cube", "CubeSat", "s3-tag-can", () => v.copy(this.P), () => this.mode === "wide" || this.mode === "station", () => (this.st.up ? `${Math.round(this.st.alt)} м` : ""));
  }
  buildRuler(top0) {
    if (this.ruler) { this.scene.remove(this.ruler); dispose(this.ruler); }
    this.dropTags("tick");
    const step = top0 > 1200 ? 500 : top0 > 600 ? 250 : 100, top = Math.ceil(top0 / step) * step, w = top * 0.012, pts = [0, 0, -10, 0, top, -10];
    for (let y = step; y <= top; y += step) {
      pts.push(-w, y, -10, w, y, -10);
      const p = new THREE.Vector3(0, y, -10);
      this.tag("tick", "", "s3-tag-tick", () => p, () => this.mode === "wide", () => `${y} м`);
    }
    this.ruler = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, fog: false }));
    this.ruler.frustumCulled = false; this.scene.add(this.ruler);
  }
}
