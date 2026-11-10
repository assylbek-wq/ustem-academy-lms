// Общая основа 3D-сцен полета (CanSat и CubeSat): рендер, небо, земля, горы, облака, деревья, станция, свет и тени,
// управление камерой мышью, подписи поверх сцены, цикл кадров с экономией на слабых устройствах.
// Наследник задает pose(dt) (расставить тела на момент времени) и aim(dt) (камера), подписи - в initLabels().
import * as THREE from "three";
import { HORIZON, SUN, makeClouds, makeGround, makeMountains, makeSky, makeStation, makeTrees, makeWindsock } from "./world.js";
import { clamp, dispose } from "./util.js";

export const FOG = 0.00008;
export const CAMERAS = ["follow", "station", "onboard", "wide"];
export const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

export class Stage {
  /** opts.avoid(x, z) - где не сажать деревья */
  constructor(host, labels = {}, opts = {}) {
    this.host = host; this.T = labels;
    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.02;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.pr = Math.min(window.devicePixelRatio || 1, 2); this.slow = 0;
    r.domElement.className = "s3-canvas";
    this.tags = el("div", "s3-tags");
    host.append(r.domElement, this.tags);

    const sc = this.scene = new THREE.Scene();
    sc.fog = new THREE.FogExp2(HORIZON, FOG);
    this.cam = new THREE.PerspectiveCamera(42, 1.6, 0.05, 70000);
    this.sky = makeSky(); this.sky.scale.setScalar(1000); sc.add(this.sky);
    const ground = makeGround(FOG); ground.renderOrder = -9; sc.add(ground);
    const mts = makeMountains(); mts.children.forEach((m, i) => { m.renderOrder = -8 + i; m.material.depthTest = false; m.material.depthWrite = false; }); sc.add(mts);
    this.clouds = makeClouds(); sc.add(this.clouds);
    sc.add(makeTrees(opts.avoid || ((x, z) => Math.hypot(x, z) < 20)));
    this.sock = makeWindsock(); this.sock.position.set(7, 0, -6); sc.add(this.sock);
    this.station = makeStation(); sc.add(this.station);

    sc.add(new THREE.HemisphereLight(0xdcebff, 0x8c9070, 0.85));
    const sun = this.sun = new THREE.DirectionalLight(0xfff3dc, 2.4);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.012;
    const c = sun.shadow.camera; c.left = c.bottom = -9; c.right = c.top = 9; c.near = 0.5; c.far = 60;
    sc.add(sun, sun.target);
    this.catcher = new THREE.Mesh(new THREE.PlaneGeometry(26, 26).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.36 }));
    this.catcher.receiveShadow = true; this.catcher.position.y = 0.015; sc.add(this.catcher);

    // отражения неба на корпусе: окружение снимается с самой сцены неба и земли
    const envScene = new THREE.Scene(); const sky2 = makeSky(); sky2.scale.setScalar(900); envScene.add(sky2);
    const gdisc = new THREE.Mesh(new THREE.CircleGeometry(880, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x77875a })); gdisc.position.y = -2; envScene.add(gdisc);
    const pm = new THREE.PMREMGenerator(r); this.envRT = pm.fromScene(envScene, 0, 0.5, 2000); pm.dispose(); dispose(envScene);
    sc.environment = this.envRT.texture; sc.environmentIntensity = 0.75;

    this.t = 0; this.playing = false; this.mode = "follow"; this.clock = 0; this.last = performance.now();
    this.orb = { az: 0.55, el: 0.14, zoom: 1, auto: true }; this.wideOrb = { az: 0.22, el: 0.05 };
    this.V = new THREE.Vector3(); this.V2 = new THREE.Vector3(); this.tgt = new THREE.Vector3(0, 0.6, 0);
    this.labels = []; this.wind = 3;
    this.bind();
    this.visible = true;
    this.io = new IntersectionObserver((es) => { this.visible = es[0].isIntersecting; if (this.visible) this.kick(); }); this.io.observe(host);
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(host);
    this.resize();
    Promise.resolve().then(() => this.kick());     // после конструктора наследника
  }

  bind() {
    const cv = this.renderer.domElement; cv.style.touchAction = "pan-y";
    let drag = null;
    cv.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY }; this.active = true; this.orb.auto = false; cv.setPointerCapture(e.pointerId); cv.classList.add("grab"); });
    cv.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const o = this.mode === "wide" ? this.wideOrb : this.orb, dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = { x: e.clientX, y: e.clientY };
      o.az -= dx * 0.006; o.el = clamp(o.el + dy * 0.004, -0.25, 1.35);
    });
    const up = () => { drag = null; cv.classList.remove("grab"); };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    cv.addEventListener("pointerleave", () => { if (!drag) this.active = false; });
    cv.addEventListener("wheel", (e) => { if (!this.active && !e.ctrlKey) return; e.preventDefault(); this.orb.zoom = clamp(this.orb.zoom * Math.exp(e.deltaY * 0.0012), 0.45, 7); }, { passive: false });
  }
  zoom(k) { this.orb.zoom = clamp(this.orb.zoom * k, 0.45, 7); }
  setCamera(m) { if (CAMERAS.includes(m)) this.mode = m; }
  setTime(t, playing) { this.t = t; this.playing = !!playing; if (playing) this.orb.auto = false; }

  kick() { if (!this.raf && !this.dead) this.raf = requestAnimationFrame((n) => this.frame(n)); }
  frame(now) {
    this.raf = 0;
    if (this.dead) return;
    if (!this.visible || document.hidden || !this.host.offsetParent) { this.last = now; if (this.visible) setTimeout(() => this.kick(), 400); return; }
    const dt = Math.min(0.1, (now - this.last) / 1000); this.last = now; this.clock += dt;
    if (this.ready()) {
      this.pose(dt); this.aim(dt);
      this.renderer.render(this.scene, this.cam);
      this.placeLabels();
    }
    // слабое устройство: сначала снижаем плотность пикселей, затем отключаем тени
    this.slow = this.slow * 0.95 + (dt > 0.034 ? 1 : 0) * 0.05;
    if (this.slow > 0.7 && this.clock > 3) { this.slow = 0; if (this.pr > 1) { this.pr = Math.max(1, this.pr - 0.5); this.resize(); } else if (this.renderer.shadowMap.enabled) { this.renderer.shadowMap.enabled = false; this.sun.castShadow = false; this.catcher.visible = false; } }
    this.kick();
  }
  ready() { return true; }
  resize() {
    const w = this.host.clientWidth, h = this.host.clientHeight; if (!w || !h) return;
    this.renderer.setPixelRatio(this.pr); this.renderer.setSize(w, h, false);
    this.cam.aspect = w / h; this.cam.updateProjectionMatrix(); this.W = w; this.H = h;
  }

  /** Тень: световая камера идет вдоль луча солнца через цель, площадка-приемник лежит там, где тень падает на землю */
  shadowAt(tg) {
    const fx = Math.round((tg.x - SUN.x * (tg.y / SUN.y)) * 2) / 2, fz = Math.round((tg.z - SUN.z * (tg.y / SUN.y)) * 2) / 2, reach = tg.y / SUN.y + 30;
    this.sun.position.set(fx + SUN.x * reach, SUN.y * reach, fz + SUN.z * reach); this.sun.target.position.set(fx, 0, fz);
    const sc = this.sun.shadow.camera; if (Math.abs(sc.far - (reach + 14)) > 0.5) { sc.far = reach + 14; sc.updateProjectionMatrix(); }
    this.catcher.position.set(fx, 0.015, fz);
  }
  setLens(fov, near) { const cam = this.cam; if (cam.fov !== fov || cam.near !== near) { cam.fov = fov; cam.near = near; cam.updateProjectionMatrix(); } }

  /** Оператор станции наводит антенну на цель, наставник и ученик смотрят на нее */
  crew(tg, pointing) {
    const u = this.station.userData;
    this.station.updateMatrixWorld();
    const loc = this.station.worldToLocal(this.V2.copy(tg)), elev = Math.atan2(loc.y - 1.4, Math.hypot(loc.x, loc.z));
    for (const p of u.watchers) p.rotation.y = Math.atan2(loc.x - p.position.x, loc.z - p.position.z);
    u.operator.userData.arms.forEach((a) => { a.rotation.x = this.yagi ? -(0.95 + elev * 0.55) : -0.12; });
    u.yagi.rotation.x = -elev;
    u.watchers[1].userData.arms[1].rotation.x = pointing ? -(Math.PI / 2 + elev) : -0.12;
    (this.yagi ? u.yagi : u.mast).getWorldPosition(u.antenna); u.antenna.y += this.yagi ? 0.1 : 3.4;
  }

  // ─────────────── подписи поверх сцены ───────────────
  tag(key, text, cls, posFn, showFn, num) {
    const e = el("div", "s3-tag " + (cls || ""));
    e.append(el("span", "", text)); const b = el("b"); b.setAttribute("data-notr", ""); e.append(b);
    this.tags.append(e); const item = { key, e, b, posFn, showFn, num };
    this.labels.push(item); return item;
  }
  dropTags(key) { for (const l of this.labels.filter((x) => x.key === key)) l.e.remove(); this.labels = this.labels.filter((x) => x.key !== key); }
  placeLabels() {
    if (!this.labelsOn) { this.labelsOn = true; this.initLabels(); }
    const v = this.V2, W = this.W, H = this.H;
    for (const l of this.labels) {
      let on = !!l.showFn(); const p = on && l.posFn();
      if (on && p) { v.copy(p).project(this.cam); on = v.z < 1 && v.z > -1 && Math.abs(v.x) < 0.98 && Math.abs(v.y) < 0.95; } else on = false;
      l.e.hidden = !on;
      if (!on) continue;
      if (l.num) { const s = l.num(); if (l.b.textContent !== s) l.b.textContent = s; }
      l.e.style.transform = `translate(${((v.x + 1) / 2 * W).toFixed(1)}px, ${((1 - v.y) / 2 * H).toFixed(1)}px)`;
    }
  }
  initLabels() {}

  dispose() {
    this.dead = true; cancelAnimationFrame(this.raf); this.io.disconnect(); this.ro.disconnect();
    dispose(this.scene); this.envRT.dispose(); this.renderer.dispose(); this.renderer.forceContextLoss();
    this.renderer.domElement.remove(); this.tags.remove();
  }
}
