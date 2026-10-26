// Окно просмотра как в MuJoCo simulate: клетчатый пол, небо-градиент, тени, вращение камеры мышью.
// Геометрия берется из скомпилированной модели MuJoCo (тела, геометрии, сетки), позы тел - из записи.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

function checker() {
  const c = document.createElement("canvas"); c.width = c.height = 512;
  const g = c.getContext("2d");
  const a = "#33475b", b = "#1a2633";
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? b : a; g.fillRect(i * 256, j * 256, 256, 256); }
  g.strokeStyle = "rgba(200,210,220,.35)"; g.lineWidth = 3;
  g.strokeRect(0, 0, 512, 512); g.beginPath(); g.moveTo(256, 0); g.lineTo(256, 512); g.moveTo(0, 256); g.lineTo(512, 256); g.stroke();
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(40, 40); t.anisotropy = 4;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function sky() {
  const c = document.createElement("canvas"); c.width = 2; c.height = 256;
  const g = c.getContext("2d"); const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, "#4c80b3"); gr.addColorStop(0.55, "#2a4766"); gr.addColorStop(1, "#0d1218");
  g.fillStyle = gr; g.fillRect(0, 0, 2, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const q3 = (q) => new THREE.Quaternion(q[1], q[2], q[3], q[0]);

export class View {
  constructor(host) {
    this.host = host;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: false });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.append(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.scene.background = sky();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.02, 100);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; this.controls.dampingFactor = 0.12;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ map: checker(), roughness: 0.9, metalness: 0 }));
    floor.receiveShadow = true; this.scene.add(floor);
    this.scene.add(new THREE.HemisphereLight(0xdde6f0, 0x1a2230, 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(2, -3, 5); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera; sc.left = sc.bottom = -3; sc.right = sc.top = 3; sc.near = 0.5; sc.far = 15;
    sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.012;
    this.sun = sun; this.scene.add(sun); this.scene.add(sun.target);
    this.head = new THREE.PointLight(0xffffff, 0.35, 0, 0); this.camera.add(this.head); this.scene.add(this.camera);
    this.bodies = []; this.collision = []; this.follow = true; this.showCollision = false;
    this.trail = null; this.trailOn = true;
    this.arrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.5, 0xff5533, 0.12, 0.07);
    this.arrow.visible = false; this.scene.add(this.arrow);
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(host);
    this.resize();
    const loop = () => { this.raf = requestAnimationFrame(loop); this.controls.update(); this.renderer.render(this.scene, this.camera); };
    loop();
  }

  resize() {
    const w = this.host.clientWidth || 600, h = this.host.clientHeight || 400;
    this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }

  build(vis, cam) {
    for (const b of this.bodies) this.scene.remove(b);
    this.bodies = []; this.collision = [];
    const geoCache = {};
    for (let b = 0; b < vis.nbody; b++) { const g = new THREE.Group(); this.bodies.push(g); this.scene.add(g); }
    for (const g of vis.geoms) {
      if (g.group > 3) continue;
      let geo;
      const s = g.size;
      if (g.type === 2) geo = new THREE.SphereGeometry(s[0], 20, 14);
      else if (g.type === 3) { geo = new THREE.CapsuleGeometry(s[0], 2 * s[1], 8, 16); geo.rotateX(Math.PI / 2); }
      else if (g.type === 4) { geo = new THREE.SphereGeometry(1, 20, 14); geo.scale(s[0], s[1], s[2]); }
      else if (g.type === 5) { geo = new THREE.CylinderGeometry(s[0], s[0], 2 * s[1], 28); geo.rotateX(Math.PI / 2); }
      else if (g.type === 6) geo = new THREE.BoxGeometry(2 * s[0], 2 * s[1], 2 * s[2]);
      else if (g.type === 7) {
        if (!geoCache[g.mesh]) {
          const ms = vis.meshes[g.mesh];
          const bg = new THREE.BufferGeometry();
          bg.setAttribute("position", new THREE.BufferAttribute(ms.vert, 3));
          bg.setIndex(new THREE.BufferAttribute(ms.face, 1));
          geoCache[g.mesh] = toCreasedNormals(bg, Math.PI / 5); // острые ребра остаются острыми, как в MuJoCo
          bg.dispose();
        }
        geo = geoCache[g.mesh];
      } else continue;
      const col = new THREE.Color(g.rgba[0], g.rgba[1], g.rgba[2]);
      const isCol = g.group === 3;
      const mat = isCol ? new THREE.MeshBasicMaterial({ color: 0xff7a2f, wireframe: true, transparent: true, opacity: 0.5 })
        : new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, metalness: 0.05, side: THREE.DoubleSide, transparent: g.rgba[3] < 1, opacity: g.rgba[3] });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(g.pos[0], g.pos[1], g.pos[2]);
      mesh.quaternion.copy(q3(g.quat));
      mesh.castShadow = !isCol && g.body > 0 && g.rgba[3] > 0.5; mesh.receiveShadow = !isCol;
      if (isCol) { mesh.visible = this.showCollision; this.collision.push(mesh); }
      this.bodies[g.body].add(mesh);
    }
    this.base = vis.base;
    this.cam = cam;
    this.resetCamera();
    this.clearTrail();
  }

  resetCamera() {
    const c = this.cam || { dist: 2, elev: -20, azim: 140, lookZ: 0.3 };
    const b = this.bodies[this.base];
    const tx = b ? b.position.x : 0, ty = b ? b.position.y : 0;
    const el = (c.elev * Math.PI) / 180, az = (c.azim * Math.PI) / 180;
    this.controls.target.set(tx, ty, c.lookZ);
    this.camera.position.set(tx + c.dist * Math.cos(el) * Math.cos(az), ty + c.dist * Math.cos(el) * Math.sin(az), c.lookZ - c.dist * Math.sin(el));
    this.controls.update();
  }

  setCollision(on) { this.showCollision = on; for (const m of this.collision) m.visible = on; }

  // кадр: для каждого тела x, y, z, qw, qx, qy, qz
  pose(frame, off = 0) {
    const n = this.bodies.length;
    for (let b = 0; b < n; b++) {
      const k = off + b * 7, g = this.bodies[b];
      g.position.set(frame[k], frame[k + 1], frame[k + 2]);
      g.quaternion.set(frame[k + 4], frame[k + 5], frame[k + 6], frame[k + 3]);
    }
    const bb = this.bodies[this.base];
    if (bb) {
      if (this.follow) {
        const d = new THREE.Vector3(bb.position.x - this.controls.target.x, bb.position.y - this.controls.target.y, 0);
        this.controls.target.add(d); this.camera.position.add(d);
      }
      this.sun.position.set(bb.position.x + 2, bb.position.y - 3, 5); this.sun.target.position.set(bb.position.x, bb.position.y, 0);
    }
  }

  push(f) { // стрелка толчка
    if (!f) { this.arrow.visible = false; return; }
    const bb = this.bodies[this.base];
    const v = new THREE.Vector3(f[0], f[1], f[2]); const len = v.length();
    if (!bb || len < 1e-6) { this.arrow.visible = false; return; }
    v.normalize();
    this.arrow.position.copy(bb.position).addScaledVector(v, -0.6);
    this.arrow.setDirection(v); this.arrow.setLength(0.5, 0.12, 0.07); this.arrow.visible = true;
  }

  clearTrail() { if (this.trail) { this.scene.remove(this.trail); this.trail.geometry.dispose(); this.trail = null; } }
  setTrail(rows, upto) {
    this.clearTrail();
    if (!this.trailOn || !rows || rows.length < 2) return;
    const n = Math.max(2, Math.min(rows.length, upto + 1));
    const pts = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pts[i * 3] = rows[i].x; pts[i * 3 + 1] = rows[i].y; pts[i * 3 + 2] = 0.004; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pts, 3));
    this.trail = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xffd34d }));
    this.scene.add(this.trail);
  }

  destroy() { cancelAnimationFrame(this.raf); this.ro.disconnect(); this.renderer.dispose(); }
}
