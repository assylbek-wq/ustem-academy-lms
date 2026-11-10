// 3D-вид конструктора: ракета-носитель или CanSat на «витрине». Модель можно крутить мышью или пальцем,
// корпус делается прозрачным (разрез), CanSat раскладывается по этажам. Подписи деталей - HTML поверх
// холста (их переводит общий словарь), центр тяжести и центр давления отмечены на оси ракеты.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildRocket } from "./rocket.js";
import { buildCan, CAN_H } from "./can.js";
import { canvasTex, dispose, softDot, clamp } from "./util.js";

const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

function markerTex(kind) {
  return canvasTex(128, 128, (g, w) => {
    const c = w / 2, r = w * 0.4;
    if (kind === "cg") {
      g.fillStyle = "#fff"; g.beginPath(); g.arc(c, c, r, 0, 7); g.fill();
      g.fillStyle = "#10213f"; g.beginPath(); g.moveTo(c, c); g.arc(c, c, r, 0, Math.PI / 2); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(c, c); g.arc(c, c, r, Math.PI, Math.PI * 1.5); g.closePath(); g.fill();
      g.strokeStyle = "#10213f"; g.lineWidth = 7; g.beginPath(); g.arc(c, c, r, 0, 7); g.stroke();
    } else {
      g.fillStyle = "#fff"; g.beginPath(); g.arc(c, c, r, 0, 7); g.fill();
      g.strokeStyle = "#dc2626"; g.lineWidth = 12; g.beginPath(); g.arc(c, c, r - 4, 0, 7); g.stroke();
      g.fillStyle = "#dc2626"; g.beginPath(); g.arc(c, c, r * 0.36, 0, 7); g.fill();
    }
  });
}

export class BuilderView {
  constructor(host) {
    this.host = host;
    host.classList.add("s3-builder");
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 0.92;
    this.canvas = this.renderer.domElement; this.canvas.className = "s3-canvas";
    this.labels = el("div", "s3-labels");
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); this.svg.setAttribute("class", "s3-leaders");
    host.append(this.canvas, this.svg, this.labels);
    this.scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
    this.scene.environmentIntensity = 0.55;
    const key = new THREE.DirectionalLight(0xffffff, 1.25); key.position.set(2, 3, 2.5); this.scene.add(key, new THREE.AmbientLight(0xffffff, 0.25));
    this.camera = new THREE.PerspectiveCamera(28, 2, 0.01, 50);
    this.controls = new OrbitControls(this.camera, this.canvas);
    Object.assign(this.controls, { enablePan: false, enableZoom: false, enableDamping: true, dampingFactor: 0.12, rotateSpeed: 0.8 });
    this.controls.addEventListener("start", () => { this.touched = true; });
    this.controls.addEventListener("change", () => this.kick());
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: softDot(128, "rgba(15,23,42,.28)", "rgba(15,23,42,0)", 0.3), transparent: true, depthWrite: false }));
    this.shadow.rotation.x = -Math.PI / 2; this.scene.add(this.shadow);
    this.model = null; this.key = ""; this.xray = false; this.explode = 0; this.explodeTo = 0; this.spin = 0;
    this.items = [];
    this.ro = new ResizeObserver(() => { this.resize(); this.kick(); }); this.ro.observe(host);
    this.io = new IntersectionObserver((es) => { this.onscreen = es[0].isIntersecting; if (this.onscreen) this.kick(); }); this.io.observe(host);
    this.onscreen = true; this.last = 0; this.raf = 0;
    this.loop = (now) => this.frame(now);
    this.resize(); this.kick();
  }

  /** opts: { mode: "rocket" | "can", rocket, parts, cg, cp, stab, canChute, labels } */
  set(opts) {
    const key = JSON.stringify([opts.mode, opts.rocket, (opts.parts || []).map((p) => p.id)]);
    this.opts = opts;
    if (key !== this.key) {
      this.key = key;
      if (this.model) { this.scene.remove(this.model.wrap); dispose(this.model.wrap); }
      this.model = opts.mode === "rocket" ? this.makeRocket(opts) : this.makeCan(opts);
      this.scene.add(this.model.wrap);
      this.applyView(true);
      if (this.modeWas !== opts.mode) { this.modeWas = opts.mode; this.touched = false; this.frameCamera(true); }
      else this.frameCamera(false);
    }
    this.updateMarkers();
    this.kick();
  }

  makeRocket(o) {
    const can = buildCan(o.parts || [], { detail: false });
    const rk = buildRocket(o.rocket, { inside: true, canGroup: can.group });
    const wrap = new THREE.Group(), turn = new THREE.Group();
    turn.add(rk.group); rk.group.position.y = -rk.L / 2;
    wrap.add(turn); wrap.rotation.z = Math.PI / 2;                  // нос влево, как на чертеже
    const mk = (kind) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: markerTex(kind), depthTest: false, transparent: true })); s.renderOrder = 10; rk.group.add(s); return s; };
    const cg = mk("cg"), cp = mk("cp");
    return { kind: "rocket", wrap, turn, rk, can, cg, cp, size: rk.L, radius: rk.R + o.rocket.span / 1000 };
  }

  makeCan(o) {
    const can = buildCan(o.parts || [], { detail: true });
    const wrap = new THREE.Group(), turn = new THREE.Group();
    turn.add(can.group); wrap.add(turn);
    return { kind: "can", wrap, turn, can, size: CAN_H, radius: can.R };
  }

  setXray(on) { this.xray = on; this.applyView(); this.updateMarkers(); this.kick(); }
  setExplode(on) { this.explodeTo = on ? 1 : 0; this.applyView(); this.kick(); }

  applyView(instant) {
    const m = this.model; if (!m) return;
    if (m.kind === "rocket") { m.rk.setXray(this.xray); }
    else { m.can.setXray(this.xray || this.explodeTo > 0); if (instant) { this.explode = this.explodeTo; m.can.setExplode(this.explode); } }
  }

  frameCamera(reset) {
    const m = this.model; if (!m) return;
    const asp = this.camera.aspect, t = Math.tan((this.camera.fov * Math.PI) / 360);
    let dist, az, elv; const target = new THREE.Vector3();
    if (m.kind === "rocket") {
      dist = Math.max((m.size * 0.64) / (t * asp), (m.radius * 1.7) / t);
      az = -0.3; elv = 0.16;
      this.shadow.scale.set(m.size * 1.05, m.radius * 2.6, 1); this.shadow.position.set(0, -m.radius - 0.02, 0);
    } else {
      // банка крупно; длинный штырь антенны может уходить за край кадра
      const k = this.explode, top = Math.max(CAN_H / 2 + 0.012, m.can.stackTop + k * m.can.boards.length * 0.017 + 0.012);
      const hh = (top + CAN_H / 2) / 2 + 0.012, ww = m.radius * (1.25 + 2.4 * k) + 0.02;
      dist = Math.max(hh / t, ww / (t * asp)) * 1.12;
      target.set(-0.05 * k + 0.012, (top - CAN_H / 2) / 2, 0);
      az = 0.5; elv = 0.3 + 0.12 * k;
      this.shadow.scale.set(0.16 + 0.12 * k, 0.16, 1); this.shadow.position.set(-0.05 * k, -CAN_H / 2 - 0.001, 0);
    }
    this.dist = dist;
    if (reset || !this.touched) {
      this.camera.position.set(target.x + Math.sin(az) * Math.cos(elv) * dist, target.y + Math.sin(elv) * dist, target.z + Math.cos(az) * Math.cos(elv) * dist);
    } else {
      const dir = this.camera.position.clone().sub(this.controls.target).normalize();
      this.camera.position.copy(target).addScaledVector(dir, dist);
    }
    this.controls.target.copy(target); this.controls.update();
  }

  updateMarkers() {
    const m = this.model, o = this.opts; if (!m || !o) return;
    this.items = [];
    if (m.kind === "rocket") {
      const s = Math.max(0.035, m.rk.R * 0.9);
      m.cg.scale.setScalar(s); m.cp.scale.setScalar(s);
      m.cg.position.set(0, m.rk.L - (o.cg || 0) / 1000, 0); m.cp.position.set(0, m.rk.L - (o.cp || 0) / 1000, 0);
      const L = o.labels || {};
      this.items.push({ obj: m.cg, text: L.cg, cls: "cg", dy: -1 }, { obj: m.cp, text: L.cp, cls: "cp", dy: 1 });
      if (this.xray) {
        const anchor = (y) => { const a = new THREE.Object3D(); a.position.set(0, y, 0); m.rk.group.add(a); return a; };
        if (!m.anchors) m.anchors = { can: anchor(m.rk.Lb - 0.07), motor: anchor(0.1), chute: anchor(m.rk.Lb - 0.115 - 0.09) };
        this.items.push({ obj: m.anchors.can, text: L.can, cls: "part", dy: -1 }, { obj: m.anchors.motor, text: L.motor, cls: "part", dy: -1 }, { obj: m.anchors.chute, text: L.chute, cls: "part", dy: 1 });
      }
    } else {
      for (const b of m.can.boards) this.items.push({ obj: b.anchor, text: b.part.name, cls: "board", color: b.part.color, side: true });
    }
    // HTML-подписи пересоздаются только при смене набора
    const sig = this.items.map((i) => i.cls + ":" + i.text).join("|");
    if (sig !== this.labelSig) {
      this.labelSig = sig; this.labels.replaceChildren(); this.svg.replaceChildren();
      for (const it of this.items) {
        it.el = el("div", "s3-label s3-" + it.cls, it.text || "");
        if (it.color) { const sw = el("i"); sw.style.background = it.color; it.el.prepend(sw); }
        it.line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.labels.append(it.el); this.svg.append(it.line);
      }
      this.labelItems = this.items;
    } else if (this.labelItems) {
      this.items.forEach((it, i) => { it.el = this.labelItems[i].el; it.line = this.labelItems[i].line; });
      this.labelItems = this.items;
    }
  }

  resize() {
    const w = Math.max(200, this.host.clientWidth), h = Math.max(160, this.host.clientHeight);
    this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.W = w; this.H = h; this.svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    if (this.model) this.frameCamera(false);
  }

  kick() { this.idleAt = performance.now() + 4000; if (!this.raf && this.onscreen) this.raf = requestAnimationFrame(this.loop); }

  frame(now) {
    this.raf = 0;
    if (!this.onscreen || !this.host.isConnected || this.host.offsetParent === null) return;
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000); this.last = now;
    const m = this.model;
    let moving = false;
    if (m) {
      if (Math.abs(this.explode - this.explodeTo) > 0.002) {
        this.explode += (this.explodeTo - this.explode) * Math.min(1, dt * 7); moving = true;
        if (m.kind === "can") { m.can.setExplode(this.explode); this.frameCamera(false); }
      }
      // медленное вращение, пока модель не трогали
      if (!this.touched) { this.spin += dt * 0.35; m.turn.rotation.y = this.spin; moving = true; }
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.placeLabels();
    if (moving || now < this.idleAt) this.raf = requestAnimationFrame(this.loop);
  }

  placeLabels() {
    const v = new THREE.Vector3(), W = this.W, H = this.H;
    const side = [];
    for (const it of this.items) {
      if (!it.el) continue;
      it.obj.getWorldPosition(v); v.project(this.camera);
      it.sx = (v.x * 0.5 + 0.5) * W; it.sy = (-v.y * 0.5 + 0.5) * H;
      if (it.side) side.push(it);
      else {
        const ly = clamp(it.sy + it.dy * (this.model.radius * 0 + 46), 14, H - 14);
        it.el.style.transform = `translate(${Math.round(it.sx)}px, ${Math.round(ly)}px) translate(-50%, -50%)`;
        it.line.setAttribute("x1", it.sx); it.line.setAttribute("y1", it.sy + it.dy * 9); it.line.setAttribute("x2", it.sx); it.line.setAttribute("y2", ly - it.dy * 10);
      }
    }
    if (side.length) {
      // подписи плат столбиком справа, без наложений
      side.sort((a, b) => a.sy - b.sy);
      const gap = 21, x = Math.min(W - 8, Math.max(...side.map((s) => s.sx)) + 46);
      let y = Math.max(12, Math.min(side[0].sy, H - 12 - gap * (side.length - 1)));
      const total = gap * (side.length - 1), mid = (side[0].sy + side[side.length - 1].sy) / 2;
      y = clamp(mid - total / 2, 12, Math.max(12, H - 12 - total));
      for (const it of side) {
        const ly = Math.max(y, Math.min(it.sy, y)); y = ly + gap;
        it.el.style.transform = `translate(${Math.round(x)}px, ${Math.round(ly)}px) translate(0, -50%)`;
        it.el.style.maxWidth = Math.max(60, W - x - 6) + "px";
        it.line.setAttribute("x1", it.sx); it.line.setAttribute("y1", it.sy); it.line.setAttribute("x2", x - 4); it.line.setAttribute("y2", ly);
      }
    }
  }

  dispose() {
    cancelAnimationFrame(this.raf); this.ro.disconnect(); this.io.disconnect(); this.controls.dispose();
    if (this.model) dispose(this.model.wrap);
    this.renderer.dispose(); this.canvas.remove(); this.labels.remove(); this.svg.remove();
  }
}
