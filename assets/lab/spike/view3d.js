// Живой 3D-вид симулятора SPIKE Prime (Three.js): стол FLL с бортами, мат (BIOGLOW или тренировочный USTEM),
// модели миссий BIOGLOW в духе LEGO, робот по модели из robots.js (хаб с матрицей 5 x 5, колеса, моторы, датчики,
// навесное). Координаты сцены в мм: X = x стола, Z = -y стола (дальний борт уходит вглубь), Y - вверх.
// Внутри построителей используется «табличная» запись (u, v, y): u вправо, v от борта домов (у робота: u = r, v = f).
// Кадр рисуется только когда изменилось состояние, двигается камера или идет плавная анимация модели.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { drawMat, MAT_W, MAT_H } from "./mat.js";
import { MX, FIELD_W, DOCKS, DEFAULT_DOCKS } from "./bioglow.js";
import { robotModel } from "./robots.js";

const W = MAT_W, H = MAT_H, WALL = 36, WALL_H = 70;
const DEG = Math.PI / 180;
const rad = (d) => d * DEG;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const T = (x) => x + MX;                  // x мата BIOGLOW -> x стола

// цвета LEGO
const C = {
  white: 0xf4f4f4, black: 0x1b1d21, red: 0xc91a09, yellow: 0xf2cd37, orange: 0xfe8a18, dorange: 0xa95500,
  green: 0x237841, bgreen: 0x4b9f4a, lime: 0xa5ca18, dgreen: 0x184632, sand: 0xa0bcac, olive: 0x9b9a5a,
  tan: 0xe4cd9e, dtan: 0x958a73, nougat: 0xaa7d55, brown: 0x582a12, dbrown: 0x352100,
  lbg: 0xa0a5a9, dbg: 0x6c6e68, azure: 0x36aebf, teal: 0x008f9b, magenta: 0x923978, pink: 0xc870a0,
  board: 0x3c3c3e, wall: 0x18191b, metal: 0xc9ced4,
};

// стиль роботов: робот курса, приводная база и продвинутая база отличаются цветом рамы и навесного
const STYLE = {
  course: { frame: C.dbg, cross: C.black, arm: C.azure, accent: C.black },
  "driving-base": { frame: C.white, cross: C.black, arm: C.magenta, accent: C.black },
  advanced: { frame: C.black, cross: C.dbg, arm: C.magenta, blade: C.dbg, accent: C.yellow },
};
const MOTOR = {
  medium: { W: 32, H: 40, L: 48, back: 12, rotor: 11, col: C.azure },
  large: { W: 40, H: 44, L: 72, back: 22, rotor: 14, col: C.teal },
};

// шрифт 3 x 5 для бегущей строки матрицы (как в ui.js)
const FONT = {
  A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110", E: "111100110100111", F: "111100110100100",
  G: "011100101101011", H: "101101111101101", I: "111010010010111", J: "001001001101010", K: "101101110101101", L: "100100100100111",
  M: "101111111101101", N: "110101101101101", O: "010101101101010", P: "110101110100100", Q: "010101101110011", R: "110101110101101",
  S: "011100010001110", T: "111010010010010", U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101",
  Y: "101101010010010", Z: "111001010100111", 0: "111101101101111", 1: "010110010010111", 2: "110001010100111", 3: "110001010001110",
  4: "101101111001001", 5: "111100110001110", 6: "011100111101111", 7: "111001010010010", 8: "111101111101111", 9: "111101111001110",
  "-": "000000111000000", "!": "010010010000010", "?": "110001010000010", ":": "000010000010000", ".": "000000000000010", " ": "000000000000000",
};

// ─────────────── набор материалов и геометрий ───────────────
class Kit {
  constructor() { this.mats = new Map(); this.geos = new Map(); this.tex = []; }
  mat(c, o) {
    const key = o ? c + JSON.stringify(o) : c;
    let m = this.mats.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.42, metalness: 0, ...(o || {}) });
      this.mats.set(key, m);
    }
    return m;
  }
  geo(key, make) { let g = this.geos.get(key); if (!g) { g = make(); this.geos.set(key, g); } return g; }
  dispose() {
    for (const m of this.mats.values()) m.dispose();
    for (const g of this.geos.values()) g.dispose();
    for (const t of this.tex) t.dispose();
    this.mats.clear(); this.geos.clear(); this.tex = [];
  }
}

let K = null;                              // набор на время сборки (сборка синхронная)
const mat = (c, o) => (typeof c === "number" ? K.mat(c, o) : c);
const geo = (key, make) => K.geo(key, make);

function mesh(parent, g, m, u = 0, v = 0, y = 0) {
  const o = new THREE.Mesh(g, mat(m));
  o.position.set(u, y, -v); o.castShadow = true; o.receiveShadow = true;
  parent.add(o); return o;
}
function grp(parent, u = 0, v = 0, y = 0, a = 0, dyn = false) {
  const g = new THREE.Group(); g.position.set(u, y, -v); g.rotation.y = rad(a);
  if (dyn) g.userData.dyn = true;
  parent.add(g); return g;
}
// брусок: w по u, d по v, h по высоте, низ на y0
function box(parent, c, w, d, h, u = 0, v = 0, y0 = 0, o = {}) {
  let r = o.r || 0;
  if (r) r = Math.min(r, Math.min(w, d, h) / 2 - 0.05);
  const g = r > 0.3 ? geo(`rb${w},${h},${d},${r}`, () => new RoundedBoxGeometry(w, h, d, 2, r)) : geo(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d));
  const m = mesh(parent, g, c, u, v, y0 + h / 2);
  if (o.a) m.rotation.y = rad(o.a);
  if (o.studs) studs(parent, o.studs === true ? c : o.studs, w, d, u, v, y0 + h, o.a || 0);
  return m;
}
function cyl(parent, c, r, h, u = 0, v = 0, y0 = 0, seg = 20, rTop = r) {
  const g = geo(`c${r},${rTop},${h},${seg}`, () => new THREE.CylinderGeometry(rTop, r, h, seg));
  return mesh(parent, g, c, u, v, y0 + h / 2);
}
// цилиндр вдоль оси u или v, центр в точке
function cylAx(parent, c, r, len, axis, u, v, y, seg = 20) {
  const g = geo(`c${r},${r},${len},${seg}`, () => new THREE.CylinderGeometry(r, r, len, seg));
  const m = mesh(parent, g, c, u, v, y);
  if (axis === "u") m.rotation.z = Math.PI / 2; else m.rotation.x = Math.PI / 2;
  return m;
}
function sphere(parent, c, r, u, v, y, sx = 1, sy = 1, sz = 1) {
  const m = mesh(parent, geo(`s${r}`, () => new THREE.SphereGeometry(r, 14, 10)), c, u, v, y);
  m.scale.set(sx, sy, sz); return m;
}
// шипы LEGO с шагом 8 мм
function studs(parent, c, w, d, u, v, y, a = 0) {
  const nx = Math.max(1, Math.floor(w / 8)), nz = Math.max(1, Math.floor(d / 8));
  if (nx * nz > 400) return;
  const g = grp(parent, u, v, y, a), sg = geo("stud", () => new THREE.CylinderGeometry(2.4, 2.4, 1.8, 8));
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) mesh(g, sg, c, (i - (nx - 1) / 2) * 8, (j - (nz - 1) / 2) * 8, 0.9);
}
function studsRound(parent, c, r, u, v, y) {
  const g = grp(parent, u, v, y), sg = geo("stud", () => new THREE.CylinderGeometry(2.4, 2.4, 1.8, 8));
  const n = Math.floor(r / 8);
  for (let i = -n; i <= n; i++) for (let j = -n; j <= n; j++) {
    const x = i * 8, z = j * 8;
    if (Math.hypot(x, z) <= r - 4) mesh(g, sg, c, x, z, 0.9);
  }
}
// балка Technic: n отверстий с шагом 8 мм. axis: "x" (вдоль u, отверстия вдоль v), "z" (вдоль v вперед, отверстия
// вдоль u), "y" (вверх, отверстия вдоль u), "yv" (вверх, отверстия вдоль v). Первое отверстие в точке установки.
function beamGeo(n, axis) {
  return geo(`la${n}${axis}`, () => {
    const L = (n - 1) * 8, R = 3.6, sh = new THREE.Shape();
    sh.moveTo(0, -R); sh.lineTo(L, -R); sh.absarc(L, 0, R, -Math.PI / 2, Math.PI / 2, false);
    sh.lineTo(0, R); sh.absarc(0, 0, R, Math.PI / 2, Math.PI * 1.5, false);
    for (let i = 0; i < n; i++) { const hp = new THREE.Path(); hp.absarc(i * 8, 0, 2.4, 0, Math.PI * 2, true); sh.holes.push(hp); }
    const g = new THREE.ExtrudeGeometry(sh, { depth: 7.2, bevelEnabled: false, curveSegments: 7 });
    g.translate(0, 0, -3.6);
    if (axis === "z") g.rotateY(Math.PI / 2);
    else if (axis === "y") { g.rotateZ(Math.PI / 2); g.rotateY(Math.PI / 2); }
    else if (axis === "yv") g.rotateZ(Math.PI / 2);
    return g;
  });
}
function beam(parent, c, n, axis, u, v, y) { return mesh(parent, beamGeo(Math.max(2, n), axis), c, u, v, y); }
const holes = (len) => Math.max(2, Math.round(len / 8) + 1);

// стержень между точками (для статичных деталей; координаты табличные)
function rodBetween(parent, c, r, a, b) {
  const m = mesh(parent, geo("rod" + r, () => new THREE.CylinderGeometry(r, r, 1, 8)), c);
  setRod(m, a[0], a[2], -a[1], b[0], b[2], -b[1]);
  return m;
}
const _d = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
// стержень по двум точкам в координатах сцены, без выделения памяти
function setRod(m, ax, ay, az, bx, by, bz) {
  _d.set(bx - ax, by - ay, bz - az);
  const L = _d.length() || 1;
  m.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
  m.scale.set(1, L, 1);
  m.quaternion.setFromUnitVectors(_up, _d.multiplyScalar(1 / L));
}

// Слияние статичных деталей: в каждом узле (корень и группы с userData.dyn) детали одного материала сливаются в одну
// сетку. Детали с userData.keep (пиксели матрицы, детали, меняющие цвет) остаются отдельными.
function bake(root) {
  root.updateMatrixWorld(true);
  const nodes = [root];
  root.traverse((o) => { if (o !== root && o.userData.dyn && !o.userData.baked) nodes.push(o); });
  const inv = new THREE.Matrix4(), rel = new THREE.Matrix4();
  for (const N of nodes) {
    inv.copy(N.matrixWorld).invert();
    const buckets = new Map(), drop = [];
    const walk = (o) => {
      for (const c of o.children) {
        if (c.userData.dyn) continue;
        if (c.isMesh && !c.userData.keep) {
          let b = buckets.get(c.material);
          if (!b) { b = { list: [], shadow: c.castShadow }; buckets.set(c.material, b); }
          b.list.push(c); drop.push(c);
        }
        if (c.children.length && !c.userData.keep) walk(c);
      }
    };
    walk(N);
    N.userData.baked = true;
    const owned = (N.userData.geos ||= []);
    for (const [m, b] of buckets) {
      const parts = b.list.map((c) => {
        const g = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone();
        for (const k of Object.keys(g.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") g.deleteAttribute(k);
        g.morphAttributes = {};
        rel.multiplyMatrices(inv, c.matrixWorld); g.applyMatrix4(rel);
        return g;
      });
      const merged = mergeGeometries(parts, false);
      for (const g of parts) g.dispose();
      if (!merged) continue;
      const mm = new THREE.Mesh(merged, m);
      mm.castShadow = b.shadow; mm.receiveShadow = true;
      N.add(mm); owned.push(merged);
    }
    for (const c of drop) c.removeFromParent();
  }
  // пустые группы больше не нужны
  const empty = [];
  root.traverse((o) => { if (o.isGroup && !o.userData.dyn && !o.userData.keep && o !== root && o.children.length === 0) empty.push(o); });
  for (const o of empty) o.removeFromParent();
}
function disposeTree(root) {
  root.traverse((o) => {
    if (o.userData.geos) for (const g of o.userData.geos) g.dispose();
    if (o.userData.matPlane) { o.userData.matPlane.geometry.dispose(); o.userData.matPlane.material.dispose(); }
  });
  root.removeFromParent();
}

let glowTex = null;
function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const ctx = c.getContext("2d"), gr = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.6)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gr; ctx.fillRect(0, 0, 64, 64);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
}

// ─────────────── мелкие модели ───────────────
function seedModel(parent, r) {
  const g = new THREE.Group(); parent.add(g);
  cyl(g, C.brown, r * 0.8, r * 0.55, 0, 0, 0, 14);
  sphere(g, C.nougat, r * 0.62, 0, 0, r * 0.55, 1, 0.75, 1);
  box(g, C.lime, 3, 3, r * 0.6, 0, 0, r * 0.95);
  box(g, C.lime, 9, 3, 2, 3, 0, r * 1.45, { r: 1 });
  return g;
}
function leafShapeGeo() {
  return geo("leaf", () => {
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.quadraticCurveTo(14, 8, 0, 34); s.quadraticCurveTo(-14, 8, 0, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: 2.4, bevelEnabled: false, curveSegments: 8 });
    g.translate(0, 0, -1.2); return g;
  });
}
function leaf(parent, c, u, v, y, tilt = -0.5, turn = 0, s = 1) {
  const m = mesh(parent, leafShapeGeo(), c, u, v, y);
  m.rotation.set(tilt, turn, 0); m.scale.setScalar(s); return m;
}

// ─────────────── стол и мат ───────────────
function buildTable(root, kit, bio, matUrl, onTex) {
  box(root, C.board, W + 2 * WALL, H + 2 * WALL, 18, W / 2, H / 2, -18);
  box(root, 0x2a2a2d, W + 2 * WALL - 20, H + 2 * WALL - 20, 160, W / 2, H / 2, -178);
  const wall = mat(C.wall, { roughness: 0.7 });
  box(root, wall, WALL, H + 2 * WALL, WALL_H, -WALL / 2, H / 2, 0);
  box(root, wall, WALL, H + 2 * WALL, WALL_H, W + WALL / 2, H / 2, 0);
  box(root, wall, W, WALL, WALL_H, W / 2, -WALL / 2, 0);
  box(root, wall, W, WALL, WALL_H, W / 2, H + WALL / 2, 0);
  // мат: плоскость, верх рисунка у дальнего борта
  let tex, x0 = 0, w = W;
  if (bio) {
    x0 = MX; w = FIELD_W;
    tex = new THREE.TextureLoader().load(matUrl, () => onTex && onTex());
  } else {
    const s = 1.5, cv = document.createElement("canvas");
    cv.width = Math.round(W * s); cv.height = Math.round(H * s);
    const ctx = cv.getContext("2d");
    ctx.setTransform(s, 0, 0, -s, 0, H * s);
    const txt = (t, x, y, size = 26, col = "rgba(15,23,42,.5)") => {
      ctx.save(); ctx.translate(x, y); ctx.scale(1, -1); ctx.fillStyle = col;
      ctx.font = `700 ${size}px Inter, system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(t, 0, 0); ctx.restore();
    };
    drawMat(ctx, (t, x, y) => txt(t, x, y));
    for (let k = 0; k <= 10; k += 5) txt(`${k * 10}`, 450 + k * 100, 160, 22, "#334155");
    tex = new THREE.CanvasTexture(cv);
  }
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  kit.tex.push(tex);
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, H), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }));
  plane.rotation.x = -Math.PI / 2; plane.position.set(x0 + w / 2, 0.4, -H / 2);
  plane.receiveShadow = true; plane.userData.keep = true;
  root.add(plane);
  root.userData.matPlane = plane;
}

// ─────────────── поле BIOGLOW ───────────────
function buildBioglow(root, knob) {
  const R = {};
  // 01 воздушное обследование: пилот с кнопкой, рама-кран, дрон на тросе, карта LiDAR
  {
    const g = grp(root, T(1153), 61);
    cyl(g, C.lbg, 34, 12, 0, 0, 0, 28); studsRound(g, C.lbg, 34, 0, 0, 12);
    box(g, C.red, 14, 14, 8, 0, 0, 12, { r: 2 });
    box(g, C.dbg, 16, 10, 12, 0, 18, 12); box(g, C.white, 16, 10, 14, 0, 18, 24, { r: 2 }); cyl(g, C.yellow, 5, 9, 0, 18, 38, 14);
    for (const x of [1110, 1196]) {
      beam(root, C.dbg, 13, "z", T(x), 32, 3.6);
      beam(root, C.dbg, 21, "y", T(x), 130, 4);
      box(root, C.dbg, 10, 16, 8, T(x), 130, 0, { studs: true });
    }
    beam(root, C.dbg, 12, "x", T(1110), 130, 164);
    beam(root, C.yellow, 5, "z", T(1153), 130, 171);
    const d = R.drone = grp(root, T(1153), 95, 8, 0, true);
    box(d, C.azure, 26, 26, 10, 0, 0, 4, { r: 4 }); box(d, C.white, 14, 14, 3, 0, 0, 14, { r: 1.5 });
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const arm = box(d, C.black, 30, 5, 4, x * 11, z * 11, 7); arm.rotation.y = rad(x * z > 0 ? -45 : 45);
      cyl(d, C.black, 4, 6, x * 22, z * 22, 6, 10);
      cyl(d, mat(0xaeefec, { transparent: true, opacity: 0.55 }), 11, 1.5, x * 22, z * 22, 12, 20);
      box(d, C.black, 3, 3, 4, x * 12, z * 12, 0);
    }
    R.tether = rodBetween(root, C.black, 1, [0, 0, 0], [0, 0, 1]); R.tether.userData.keep = true;
    knob("drone", (k) => {
      const v = 95 + 80 * k, y = 8 + 118 * k;
      d.position.set(T(1153), y, -v);
      setRod(R.tether, T(1153), 167, -162, T(1153), y + 16, -v);
      R.tether.visible = k > 0.03;
    });
    const m = R.map = grp(root, T(1153), 128, 2, 0, true);
    box(m, C.dbg, 56, 36, 1.8, 0, 0, -1.8);
    box(m, C.lime, 56, 36, 1.8, 0, 0, 0);
    box(m, C.green, 18, 12, 0.8, -10, 4, 1.8); box(m, C.dgreen, 12, 8, 0.8, 14, -6, 1.8);
    knob("map", (k) => { m.rotation.x = Math.PI * k; m.position.y = 2 + Math.sin(Math.PI * k) * 30; });
  }
  // 02 стебель с семенами
  {
    const g = grp(root, T(639), 543, 0, 45);
    box(g, C.dbg, 52, 52, 8, 0, 0, 0, { studs: true });
    cyl(g, C.bgreen, 8, 190, 0, 0, 8, 10);
    leaf(g, C.lime, 6, 0, 60, -1.0, 0, 1.2); leaf(g, C.lime, -6, 0, 100, -1.0, Math.PI, 1.1); leaf(g, C.lime, 0, 6, 140, -1, Math.PI / 2, 0.9);
    cyl(g, C.lime, 14, 22, 0, 0, 196, 12, 10); cyl(g, C.yellow, 9, 6, 0, 0, 218, 12);
    const s = R.stalkSeeds = grp(root, T(639), 543, 0, 0, true);
    const H3 = [120, 92, 150];
    [[-40, 20], [38, 30], [5, -44]].forEach(([dx, dy], i) => {
      rodBetween(root, C.green, 2.2, [T(639), 543, H3[i]], [T(639) + dx * 0.8, 543 + dy * 0.8, H3[i] - 4]);
      const sd = seedModel(s, 13); sd.position.set(dx, H3[i] - 14, -dy);
    });
  }
  // 03 камень и флажок
  {
    const r = R.rock = grp(root, T(80), 661, 14, 0, true);
    box(r, C.lbg, 120, 56, 6, 0, 0, -14);
    const rock = mesh(r, geo("rock", () => new THREE.DodecahedronGeometry(1, 0)), mat(C.dbg, { flatShading: true, roughness: 0.7 }), 0, 0, 2);
    rock.scale.set(54, 15, 25);
    const rock2 = mesh(r, geo("rock", () => new THREE.DodecahedronGeometry(1, 0)), mat(0x55585a, { flatShading: true, roughness: 0.7 }), -22, 4, 8);
    rock2.scale.set(22, 12, 16); rock2.rotation.y = 0.5;
    knob("rock", (k) => { r.rotation.z = Math.PI * k; r.position.y = 14 + Math.sin(Math.PI * k) * 26; });
    box(root, C.lbg, 18, 18, 10, T(150), 665, 0, { studs: true });
    const f = R.flag = grp(root, T(150), 665, 10, 0, true);
    cyl(f, C.lbg, 2, 86, 0, 0, 0, 8);
    box(f, C.red, 28, 2.4, 20, 15, 0, 64);
    knob("flag", (k) => { f.rotation.x = rad(82) * k; });
  }
  // 04 гнездо с листьями и кузнечиком
  {
    box(root, C.dgreen, 110, 100, 8, T(135), 1030, 0, { studs: true });
    for (const [x, y, w, h] of [[95, 1062, 34, 64], [140, 1068, 40, 82], [180, 1058, 30, 56], [118, 1072, 30, 40]]) box(root, C.bgreen, w, 26, h, T(x), y, 8, { studs: true });
    cyl(root, C.brown, 26, 16, T(135), 1025, 8, 16, 30); cyl(root, C.dbrown, 21, 1, T(135), 1025, 24.2, 16);
    sphere(root, C.white, 6, T(130), 1025, 26, 1, 1.2, 1); sphere(root, C.white, 6, T(142), 1030, 26, 1, 1.2, 1);
    for (const [key, x] of [["leaf1", 100], ["leaf2", 170]]) {
      const l = R[key] = grp(root, T(x), 985, 0, 0, true);
      box(l, C.dgreen, 10, 10, 6, 0, 0, 0, { studs: true }); cyl(l, C.green, 1.6, 26, 0, 0, 6, 6);
      leaf(l, C.lime, 0, 0, 22, -0.7, 0, 1.15);
    }
    const kd = R.kat = grp(root, T(135), 985, 6, 0, true);
    box(kd, C.bgreen, 8, 22, 8, 0, 0, 4, { r: 3 }); box(kd, C.bgreen, 8, 8, 8, 0, 13, 6, { r: 3 });
    sphere(kd, C.black, 1.4, -3, 16, 11); sphere(kd, C.black, 1.4, 3, 16, 11);
    for (const sx of [-1, 1]) {
      const leg = box(kd, C.green, 2, 20, 2.4, sx * 6, -4, 10); leg.rotation.x = 0.5;
      const leg2 = box(kd, C.green, 2, 10, 2, sx * 5, 4, 0); leg2.rotation.x = -0.6;
      const ant = box(kd, C.green, 1, 16, 1, sx * 2.5, 22, 14); ant.rotation.x = -0.5;
    }
  }
  // 05 корни
  {
    box(root, C.lbg, 44, 52, 54, T(406), 1112, 0, { studs: true });
    box(root, C.black, 22, 2, 14, T(406), 1086, 0);
    const r = R.root = grp(root, T(406), 1095, 0, 0, true);
    box(r, C.brown, 14, 40, 10, 0, 0, 1, { r: 3 });
    const a = box(r, C.brown, 4, 18, 4, -8, -10, 2); a.rotation.y = 0.6;
    const b = box(r, C.brown, 4, 16, 4, 8, -6, 2); b.rotation.y = -0.5;
    box(r, C.nougat, 18, 6, 14, 0, -21, 1, { r: 2 });
    knob("root", (k) => { r.position.z = -(1095 - k); });
  }
  // 08-09 дерево: ствол, крона, платформа, лиана, фотоловушка, семечко на ветке
  {
    cyl(root, C.brown, 22, 240, T(578), 1075, 0, 8, 18);
    box(root, C.green, 116, 116, 36, T(578), 1075, 196, { studs: C.green });
    box(root, C.bgreen, 92, 92, 34, T(578), 1075, 232, { a: 45, studs: C.bgreen });
    box(root, C.bgreen, 52, 52, 28, T(578), 1075, 266, { a: 15, studs: C.bgreen });
    beam(root, C.dbg, 22, "y", T(520) - 21, 1062, 4); beam(root, C.dbg, 22, "y", T(520) + 21, 1062, 4);
    const p = R.plat = grp(root, T(520), 1062, 70, 0, true);
    box(p, C.tan, 34, 54, 6, 0, 0, 0, { studs: true });
    box(p, C.dtan, 34, 4, 10, 0, -26, 6);
    knob("platform", (k) => { p.position.y = 70 + 90 * k; });
    const vh = R.vineHang = grp(root, T(578), 1030, 0, 0, true);
    for (let i = 0; i < 5; i++) {
      box(vh, i % 2 ? C.green : C.lime, 7, 7, 24, 0, 0, 74 + i * 25, { r: 2 });
      if (i % 2) leaf(vh, C.lime, 4, 0, 84 + i * 25, 0.2, Math.PI / 2, 0.45);
    }
    const vd = R.vineDown = grp(root, T(578), 1010, 0, 0, true);
    box(vd, C.lime, 8, 44, 6, 0, 0, 0, { r: 2 }); box(vd, C.green, 7, 7, 30, 0, 18, 6, { r: 2 });
    leaf(vd, C.lime, 5, -10, 3, -1.45, 0.5, 0.5); leaf(vd, C.lime, -5, 8, 3, -1.45, -0.6, 0.5);
    box(root, C.dbg, 12, 12, 40, T(652), 1068, 0, { studs: true });
    const cam = R.cam = grp(root, T(652), 1062, 40, 0, true);
    R.camBody = box(cam, C.dbg, 18, 14, 26, 0, 0, 0, { r: 2 }); R.camBody.userData.keep = true;
    cylAx(cam, C.black, 5, 4, "v", 0, -8, 16, 14); cylAx(cam, mat(0x88ccee, { roughness: 0.1, metalness: 0.3 }), 3.5, 4.4, "v", 0, -8, 16, 14);
    knob("camera", (k) => { cam.rotation.x = -(1 - k) * 1.2; });
    rodBetween(root, C.brown, 4, [T(578), 1062, 136], [T(622), 1010, 142]);
    const ts = R.treeSeed = grp(root, T(622), 1010, 144, 0, true); seedModel(ts, 14);
  }
  // 10 хрупкие микроэкосистемы: паук и улитка
  {
    const sp = R.spider = grp(root, T(752), 1050, 0, 0, true);
    cyl(sp, C.white, 22, 6, 0, 0, 0, 24); studsRound(sp, C.white, 22, 0, 0, 6);
    box(sp, C.white, 3, 3, 40, -16, 6, 6); box(sp, C.white, 3, 3, 40, 16, 6, 6); box(sp, C.white, 35, 3, 3, 0, 6, 44);
    const w1 = box(sp, C.lbg, 1, 1, 44, 0, 6, 4); w1.rotation.z = 0.6; const w2 = box(sp, C.lbg, 1, 1, 44, 0, 6, 4); w2.rotation.z = -0.6;
    sphere(sp, C.black, 5, 0, 6, 26); sphere(sp, C.black, 3.5, 0, 6, 33);
    for (let i = 0; i < 4; i++) for (const sx of [-1, 1]) { const l = box(sp, C.black, 12, 1.2, 1.2, sx * 7, 6, 22 + i * 3); l.rotation.z = sx * (0.5 - i * 0.3); }
    knob("spider", (k) => { sp.rotation.z = 0.45 * k; sp.position.x = T(752) + 14 * k; sp.position.y = 6 * k; });
    const sn = R.snail = grp(root, T(1044), 723, 0, 0, true);
    cyl(sn, C.sand, 26, 5, 0, 0, 0, 24); studsRound(sn, C.sand, 26, 0, 0, 5);
    box(sn, C.tan, 34, 10, 7, 2, 0, 5, { r: 3 }); box(sn, C.tan, 7, 8, 12, 17, 0, 9, { r: 3 });
    for (const z of [-2, 2]) box(sn, C.tan, 1.4, 1.4, 8, 18, z, 20);
    const shell = mesh(sn, geo("shell", () => new THREE.TorusGeometry(9, 6, 10, 20)), C.yellow, -2, 0, 22);
    shell.scale.set(1, 1, 0.9);
    cylAx(sn, C.orange, 4, 13.6, "v", -2, 0, 22, 14);
    knob("snail", (k) => { sn.rotation.z = -0.45 * k; sn.position.x = T(1044) - 12 * k; sn.position.y = 6 * k; });
  }
  // 06 муравейник, листья и муравей; 07 гриб и мицелий
  {
    box(root, C.tan, 100, 110, 12, T(1520), 1078, 0, { studs: true });
    box(root, C.dtan, 76, 86, 14, T(1520), 1082, 12, { studs: true });
    box(root, C.tan, 50, 60, 14, T(1520), 1086, 26, { studs: true });
    box(root, C.black, 22, 2, 12, T(1520), 1022, 0);
    R.frag = [C.yellow, C.orange, C.bgreen].map((c, i) => {
      const f = grp(root, T(1495 + i * 25), 1095, 40, 0, true);
      leaf(f, c, 0, 0, 0, -0.25, 0, 0.9); return f;
    });
    const a = R.ant = grp(root, T(1606), 1048, 0, 0, true);
    cyl(a, C.dbg, 17, 5, 0, 0, 0, 20);
    sphere(a, C.red, 7, -8, 0, 13, 1.2, 0.9, 1); sphere(a, C.red, 4.5, 1, 0, 13); sphere(a, C.red, 5, 9, 0, 15);
    for (const x of [-3, 1, 5]) for (const sz of [-1, 1]) { const l = box(a, C.black, 1.4, 14, 1.4, x, sz * 6, 8); l.rotation.x = sz * 0.6; }
    for (const sz of [-1, 1]) { const at = box(a, C.black, 10, 1, 1, 15, sz * 3, 20); at.rotation.z = 0.6; }
    leaf(a, C.lime, 2, 0, 18, 0.4, Math.PI / 2, 0.6);
    knob("ant", (k) => { a.position.x = T(1606) - 22 * k; });
    box(root, C.white, 50, 60, 18, T(1662), 1102, 0, { studs: true });
    cyl(root, C.white, 8, 64, T(1662), 1112, 18, 14);
    const cap = mesh(root, geo("cap", () => new THREE.SphereGeometry(28, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2)), C.dorange, T(1662), 1112, 80);
    cap.scale.set(1, 0.6, 1);
    cyl(root, C.tan, 4, 30, T(1648), 1090, 18, 10); const cap2 = mesh(root, geo("cap2", () => new THREE.SphereGeometry(12, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2)), C.dorange, T(1648), 1090, 48); cap2.scale.set(1, 0.6, 1);
    const my = R.myc = grp(root, T(1662), 1102, 0, 0, true);
    box(my, C.white, 18, 60, 10, 0, 0, 1, { r: 2 });
    box(my, C.lbg, 22, 4, 14, 0, -30, 0, { r: 1 });
    for (const x of [-4, 4]) box(my, C.lbg, 1.4, 50, 1, x, 4, 11);
    knob("myc", (k) => { my.position.z = -(1102 - 52 * k); });
  }
  // 11 окно в прошлое
  {
    const g = grp(root, T(1409), 596, 0, 45);
    box(g, C.brown, 78, 78, 10, 0, 0, 0, { studs: true });
    box(g, C.tan, 8, 8, 72, -26, 0, 10); box(g, C.tan, 8, 8, 72, 26, 0, 10); box(g, C.tan, 60, 8, 8, 0, 0, 82, { studs: true });
    box(g, mat(0xaeefec, { transparent: true, opacity: 0.45, roughness: 0.1 }), 44, 2, 64, 0, 0, 14);
    for (const [x, a] of [[-8, 0.3], [6, -0.4], [12, 0.2]]) { const rt = box(g, C.brown, 3, 3, 50, x, 6, 12); rt.rotation.z = a; }
    const cv = R.cover = grp(g, -41, 0, 0, 0, true);
    box(cv, C.red, 4, 60, 66, -2, 0, 0, { r: 1 }); studs(cv, C.red, 4, 56, -2, 0, 66);
    box(cv, C.dbg, 6, 10, 10, -6, 0, 52);
    knob("cover", (k) => { cv.rotation.z = rad(88) * k; });
  }
  // 12 лесной старейшина: старое дерево, подпорка, стяжка, столбик
  {
    cyl(root, C.dbrown, 32, 150, T(1940), 757, 0, 7, 26);
    cyl(root, C.nougat, 25, 3, T(1940), 757, 150, 14); cyl(root, C.dtan, 12, 3.5, T(1940), 757, 150, 12);
    box(root, C.brown, 40, 10, 10, T(1965), 760, 110, { a: 30 }); box(root, C.brown, 34, 10, 10, T(1915), 765, 90, { a: -40 });
    box(root, C.dgreen, 34, 30, 8, T(1970), 765, 116, { studs: true }); box(root, C.dgreen, 30, 26, 8, T(1910), 770, 96, { studs: true });
    box(root, C.brown, 10, 20, 10, T(1940), 718, 70);
    box(root, C.lbg, 30, 60, 80, T(1941), 546, 0, { studs: true });
    const torus = geo("tie", () => new THREE.TorusGeometry(10, 2.6, 8, 20));
    R.tieTree = mesh(root, torus, C.red, T(1940), 714, 75); R.tieTree.userData.keep = true;
    const tp = R.tiePost = grp(root, T(1941), 546, 44, 0, true);
    const tm = mesh(tp, geo("tie2", () => new THREE.TorusGeometry(24, 2.6, 8, 28)), C.red); tm.rotation.x = Math.PI / 2; tm.scale.set(0.8, 1.42, 1);
    R.cane = rodBetween(root, C.brown, 3.6, [0, 0, 0], [0, 0, 1]); R.cane.userData.keep = true;
    knob("cane", (k) => {
      const l = (a, b) => a + (b - a) * k;
      setRod(R.cane, T(l(1872, 1888)), l(4, 4), -l(708, 806), T(l(1924, 1912)), l(6, 92), -l(750, 760));
    });
  }
  return R;
}

// модели на доках 13-15 (перестраиваются, если доки поменялись)
function buildDocks(parent, docks, knob, R) {
  const root = grp(parent, 0, 0, 0, 0, true);
  for (const [name, d] of Object.entries(DOCKS)) {
    const m = docks[name], w = d.w, h = d.h;
    const g = grp(root, T(d.x), d.y, 0, d.dir - 90);   // перед модели (сторона робота) - локальное -v
    if (m === 13) {
      box(g, 0x2b2d31, w, h, 8, 0, 0, 0, { studs: true });
      const tr = R.trees = grp(g, 0, -4, 8, 0, true);
      box(tr, C.dbg, w - 30, 10, 6, 0, 0, 0, { studs: true });
      for (const x of [-(w - 46) / 2, 0, (w - 46) / 2]) {
        cyl(tr, C.brown, 3, 18, x, 0, 6, 8);
        cyl(tr, C.bgreen, 12, 18, x, 0, 20, 8, 7); cyl(tr, C.green, 8, 16, x, 0, 36, 8, 2);
      }
      knob("trees", (k) => { tr.rotation.x = (1 - k) * rad(84); });
    } else if (m === 14) {
      box(g, C.tan, w, h, 4, 0, 0, 0);
      box(g, C.brown, w, 7, 26, 0, -h / 2 + 3.5, 4, { studs: true }); box(g, C.brown, w, 7, 26, 0, h / 2 - 3.5, 4, { studs: true });
      box(g, C.brown, 7, h - 14, 26, -w / 2 + 3.5, 0, 4, { studs: true }); box(g, C.brown, 7, h - 14, 26, w / 2 - 3.5, 0, 4, { studs: true });
      box(g, C.nougat, w - 14, 4, 14, 0, 0, 4);
      box(g, C.lime, 10, 10, 18, w / 2 - 7, h / 2 - 7, 30, { studs: true });
    } else if (m === 15) {
      box(g, C.olive, w, h, 10, 0, 0, 0, { studs: true });
      box(g, C.white, w - 16, 8, 50, 0, h / 2 - 12, 10, { studs: true });
      for (const x of [-(w / 2 - 12), w / 2 - 12]) box(g, C.white, 8, 8, 50, x, h / 2 - 34, 10);
      box(g, C.sand, w - 8, 30, 4, 0, h / 2 - 26, 60, { studs: true });
      box(g, mat(0xaeefec, { transparent: true, opacity: 0.5, roughness: 0.1 }), w - 34, 2, 30, 0, h / 2 - 17, 16);
      // окно сада: красная рамка и задвижная панель
      const fv = -h / 2 + 22;
      box(g, C.red, 36, 3, 2, 0, fv - 16, 10); box(g, C.red, 36, 3, 2, 0, fv + 16, 10);
      box(g, C.red, 3, 30, 2, -17, fv, 10); box(g, C.red, 3, 30, 2, 17, fv, 10);
      box(g, C.black, 30, 28, 0.6, 0, fv, 10);
      const sk = R.sky = grp(g, 0, fv, 12, 0, true);
      box(sk, C.dbg, 30, 30, 3, 0, 0, 0, { studs: true }); box(sk, C.dbg, 30, 4, 8, 0, -15, 0);
      knob("skylight", (k) => { sk.position.z = -(fv - 26 * (1 - k)); });
      // навес для гнезд: зеленая панель на петле
      const cp = R.canopy = grp(g, 32, -h / 2 + 8, 10, 0, true);
      box(cp, C.lime, 24, 30, 3, 0, 15, 0, { studs: true }); box(cp, C.lime, 8, 10, 3, 0, -4, 0);
      knob("canopy", (k) => { cp.rotation.x = rad(70) * k; });
      // компостный люк
      box(g, C.dbrown, 20, 20, 0.6, -32, -h / 2 + 14, 10);
      const ht = R.hatch = grp(g, -32, -h / 2 + 25, 10, 0, true);
      box(ht, C.nougat, 22, 22, 3, 0, -11, 0, { studs: true });
      knob("hatch", (k) => { ht.rotation.x = -rad(105) * k; });
    } else {
      for (const [ww, hh, x, y] of [[w, 4, 0, -h / 2], [w, 4, 0, h / 2], [4, h, -w / 2, 0], [4, h, w / 2, 0]]) box(g, C.white, ww, hh, 1, x, y, 0.4);
    }
  }
  return root;
}

// подвижные предметы поля
function buildObj(parent, kind, r, color) {
  const g = new THREE.Group(); g.userData.dyn = true; parent.add(g);
  if (kind === "seed") seedModel(g, r * 0.85);
  else if (kind === "scan") { cyl(g, C.azure, r, 4, 0, 0, 0, 20); cyl(g, C.white, r * 0.55, 0.8, 0, 0, 4, 16); box(g, C.black, r * 0.7, 2, 0.6, 0, 0, 4.8); }
  else if (kind === "keystone") {
    cyl(g, C.dgreen, r * 0.9, 5, 0, 0, 0, 24); studsRound(g, C.dgreen, r * 0.9, 0, 0, 5);
    box(g, C.pink, 46, 24, 20, -4, 0, 9, { r: 6 }); box(g, C.pink, 18, 18, 18, 22, 0, 18, { r: 5 });
    box(g, C.magenta, 6, 4, 8, 22, -6, 36); box(g, C.magenta, 6, 4, 8, 22, 6, 36);
    sphere(g, C.black, 2, 31, -5, 28); sphere(g, C.black, 2, 31, 5, 28);
    box(g, C.magenta, 16, 8, 5, -30, 0, 12, { r: 2 });
    for (const [x, z] of [[-18, -8], [-18, 8], [10, -8], [10, 8]]) box(g, C.magenta, 6, 6, 6, x, z, 5);
  } else if (kind === "crate") {
    const s = r * 2, hh = Math.round(s * 0.65);
    box(g, C.dorange, s - 8, s - 8, hh - 4, 0, 0, 0);
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(g, C.brown, 8, 8, hh, x * (s / 2 - 4), z * (s / 2 - 4), 0);
    for (const sd of [-1, 1]) {
      box(g, C.brown, s, 8, 6, 0, sd * (s / 2 - 4), hh - 6); box(g, C.brown, 8, s, 6, sd * (s / 2 - 4), 0, hh - 6);
      const x1 = box(g, C.brown, s * 1.2, 2, 6, 0, sd * (s / 2 - 3.5), hh / 2 - 3); x1.rotation.z = Math.atan2(hh - 8, s - 8);
      const x2 = box(g, C.brown, s * 1.2, 2, 6, 0, sd * (s / 2 - 3.5), hh / 2 - 3); x2.rotation.z = -Math.atan2(hh - 8, s - 8);
      const x3 = box(g, C.brown, 2, s * 1.2, 6, sd * (s / 2 - 3.5), 0, hh / 2 - 3); x3.rotation.x = Math.atan2(hh - 8, s - 8);
      const x4 = box(g, C.brown, 2, s * 1.2, 6, sd * (s / 2 - 3.5), 0, hh / 2 - 3); x4.rotation.x = -Math.atan2(hh - 8, s - 8);
    }
    studs(g, C.dorange, s - 16, s - 16, 0, 0, hh - 4);
  } else if (kind === "marker") {
    cyl(g, color || C.red, r, 3, 0, 0, 0, 24); cyl(g, C.white, r * 0.45, 4, 0, 0, 0, 16); studsRound(g, C.white, Math.max(6, r * 0.45), 0, 0, 4);
  } else if (kind === "cube") {
    box(g, color || C.yellow, r * 2, r * 2, r * 2, 0, 0, 0, { r: 1.5, studs: true });
  } else {
    box(g, color || C.red, Math.max(16, r * 2), Math.max(8, r), 11.4, 0, 0, 0, { r: 0.8, studs: true });
  }
  return g;
}

// ─────────────── робот ───────────────
function motorModel(parent, kind, u, v, y, side) {
  const s = MOTOR[kind] || MOTOR.medium;
  box(parent, C.white, s.W, s.L, s.H, u, v - s.back, y - s.H / 2, { r: 6 });
  cylAx(parent, s.col, s.rotor, 3, "u", u + side * (s.W / 2 + 1.4), v, y, 24);
  cylAx(parent, C.black, 2.6, 3.6, "u", u + side * (s.W / 2 + 1.6), v, y, 8);
  cylAx(parent, C.lbg, s.rotor * 0.7, 2, "u", u - side * (s.W / 2 + 0.9), v, y, 20);
  box(parent, C.black, 12, 6, 10, u, v - s.back - s.L / 2 - 2, y - 2, { r: 2 });
}

function wheelModel(parent, D, tw, side) {
  const R = D / 2, ri = R * 0.66;
  const tire = mesh(parent, geo(`tire${D},${tw}`, () => {
    const c = Math.min(4, tw / 3), pts = [new THREE.Vector2(ri, -tw / 2)];
    for (let i = 0; i <= 4; i++) { const a = -Math.PI / 2 + (i / 4) * (Math.PI / 2); pts.push(new THREE.Vector2(R - c + Math.cos(a) * c, -tw / 2 + c + Math.sin(a) * c)); }
    for (let i = 0; i <= 4; i++) { const a = (i / 4) * (Math.PI / 2); pts.push(new THREE.Vector2(R - c + Math.cos(a) * c, tw / 2 - c + Math.sin(a) * c)); }
    pts.push(new THREE.Vector2(ri, tw / 2));
    const g = new THREE.LatheGeometry(pts, 40); g.rotateZ(Math.PI / 2); return g;
  }), mat(0x202124, { roughness: 0.85, side: THREE.DoubleSide }));
  tire.rotation.set(0, 0, 0);
  cylAx(parent, C.lbg, ri + 0.4, tw - 1.5, "u", 0, 0, 0, 28);
  const o = side * (tw / 2 - 0.4);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2, rr = ri * 0.62;
    cylAx(parent, 0x55585c, ri * 0.17, 1.4, "u", o, Math.cos(a) * rr, Math.sin(a) * rr, 10);
  }
  cylAx(parent, C.black, 3, 1.6, "u", o, 0, 0, 8);
  cylAx(parent, C.white, ri * 0.32, 1, "u", o - side * 0.2, 0, 0, 16);
}

function hubModel(parent, u, v, y, along, R) {
  const g = grp(parent, u, v, y, along ? 0 : 90);
  box(g, C.yellow, 56, 88, 32, 0, 0, 0, { r: 6 });
  box(g, C.white, 48, 78, 2, 0, 0, 31, { r: 3 });
  box(g, 0x111214, 36, 36, 1, 0, 10, 32.6, { r: 2 });
  const pg = geo("pix", () => new THREE.BoxGeometry(4.6, 0.8, 4.6));
  R.pixels = [];
  for (let row = 0; row < 5; row++) for (let col = 0; col < 5; col++) {
    const p = mesh(g, pg, R.pixOff, (col - 2) * 6.4, 10 + (2 - row) * 6.4, 33.6);
    p.castShadow = false; p.userData.keep = true; R.pixels.push(p);
  }
  const ring = cyl(g, R.btnOn, 8, 1.2, 0, -21, 32.2, 24); ring.userData.keep = true; ring.castShadow = false; R.btnRing = ring;
  cyl(g, C.white, 6, 2.2, 0, -21, 32.4, 24);
  box(g, C.lbg, 9, 7, 1.6, -16, -21, 32.4, { r: 1 }); box(g, C.lbg, 9, 7, 1.6, 16, -21, 32.4, { r: 1 });
  cyl(g, C.lbg, 3, 1.6, 17, 35, 32.4, 12);
  for (let i = 0; i < 3; i++) box(g, 0x2a2b2e, 12, 1.4, 0.6, 0, -33 - i * 2.6, 33);
  for (const sx of [-1, 1]) for (const z of [-24, 0, 24]) box(g, 0x3a3c40, 1.6, 11, 7, sx * 28.2, z, 13, { r: 0.6 });
  box(g, 0x111214, 10, 2, 5, 0, 44.2, 14);
  return g;
}

function sensorColor(parent, u, v, y1) {
  box(parent, C.black, 24, 24, 24, u, v, 8, { r: 3 });
  box(parent, C.white, 24, 12, 4, u, v - 6, 32, { r: 1 });
  cyl(parent, C.white, 6, 1, u, v, 7.4, 16);
  if (y1 - 36 > 8) beam(parent, C.black, holes(y1 - 36), "yv", u + 16, v, 36);
  const glow = new THREE.Mesh(geo("glowc", () => new THREE.CircleGeometry(17, 24)), glowMat());
  glow.rotation.x = -Math.PI / 2; glow.position.set(u, 0.9, -v); glow.userData.keep = true; parent.add(glow);
}
let _glowMat = null;
function glowMat() {
  if (!_glowMat || !K.mats.has("__glow")) {
    _glowMat = new THREE.MeshBasicMaterial({ map: glowTexture(), color: 0xfff6e0, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
    K.mats.set("__glow", _glowMat);
  }
  return _glowMat;
}
function sensorDistance(parent, u, v, y1, y0 = 22) {
  box(parent, C.white, 56, 22, 26, u, v - 12, y0, { r: 4 });
  box(parent, C.black, 52, 2, 22, u, v - 0.5, y0 + 2, { r: 1 });
  for (const sx of [-1, 1]) {
    cylAx(parent, C.black, 9, 4, "v", u + sx * 13, v + 1, y0 + 13, 20);
    cylAx(parent, mat(0x223344, { roughness: 0.15, metalness: 0.4 }), 6, 4.6, "v", u + sx * 13, v + 1, y0 + 13, 20);
    const ring = mesh(parent, geo("eye", () => new THREE.TorusGeometry(8.6, 0.9, 6, 24)), mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 1.2 }), u + sx * 13, v + 3, y0 + 13);
    ring.castShadow = false;
  }
  if (y1 - (y0 + 26) > 8) beam(parent, C.black, holes(y1 - y0 - 26), "yv", u - 32, v - 12, y0 + 26);
}

function buildRobot(model, kit) {
  const R = { wheels: [], tools: [] };
  R.pixOff = kit.mat(0x1d1e21, { roughness: 0.5 });
  R.pixOn = kit.mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 1.6 });
  R.btnOn = kit.mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.9 });
  const root = R.root = new THREE.Group();
  const st = STYLE[model.name] || STYLE.course;
  const b = model.body, D = model.wheel, Rw = D / 2, tw = D > 70 ? 18 : 14;
  const kind = (p) => (String(model.ports[p] || "").split(":")[1] || "medium");
  // колеса и приводные моторы
  let motorTop = 0;
  model.drive.forEach((port, i) => {
    const side = i === 0 ? -1 : 1, s = MOTOR[kind(port)] || MOTOR.medium;
    const wg = grp(root, side * model.track / 2, 0, Rw, 0, true);
    wheelModel(wg, D, tw, side);
    R.wheels.push({ g: wg, port, sign: side });
    const mu = side * (model.track / 2 - tw / 2 - 2 - s.W / 2);
    motorModel(root, kind(port), mu, 0, Rw, side);
    motorTop = Math.max(motorTop, Rw + s.H / 2);
    cylAx(root, C.lbg, 2.4, 6, "u", side * (model.track / 2 - tw / 2 - 1), 0, Rw, 8);
  });
  // рама
  const railY = Math.max(motorTop, 2 * Rw) + 6, half = b.half - 4;
  const vBack = -b.back + 4, len = b.front + b.back - 8;
  for (const sx of [-1, 1]) {
    beam(root, st.frame, holes(len), "z", sx * half, vBack, railY);
    // стойки от рамы к моторам
    beam(root, st.frame, holes(railY - Rw), "yv", sx * half, -Math.min(20, b.back - 10), Rw);
  }
  const nC = holes(2 * half);
  beam(root, st.cross, nC, "x", -half, b.front - 4, railY + 7.2);
  beam(root, st.cross, nC, "x", -half, vBack, railY + 7.2);
  beam(root, st.cross, nC, "x", -half, model.hub.f - 30, railY + 7.2);
  beam(root, st.cross, nC, "x", -half, model.hub.f + 30, railY + 7.2);
  const hubY = railY + 7.2 + 3.6;
  // опора сзади: шарик
  const cv = -b.back + 16;
  sphere(root, mat(C.metal, { metalness: 0.8, roughness: 0.25 }), 7, 0, cv, 7);
  box(root, C.black, 20, 20, 10, 0, cv, 9, { r: 3 });
  beam(root, st.frame, holes(railY - 20), "yv", 0, cv, 20);
  // хаб
  hubModel(root, model.hub.r || 0, model.hub.f || 0, hubY, model.hub.along, R);
  // датчики
  for (const [port, pos] of Object.entries(model.sensors || {})) {
    const dev = String(model.ports[port] || "");
    if (dev === "color") sensorColor(root, pos[1], pos[0], railY);
    else if (dev === "distance") {
      const near = Object.entries(model.sensors).some(([q, c]) => q !== port && String(model.ports[q]) === "color" && Math.abs(c[0] - pos[0]) < 30 && Math.abs(c[1] - pos[1]) < 40);
      sensorDistance(root, pos[1], pos[0], railY, near ? 36 : 22);
    }
  }
  // навесное
  const pivotY = railY + 14, pivotF = b.front - 8, hook = pivotY - 6;
  const tools = Object.entries(model.tools || {}).filter(([p]) => String(model.ports[p] || "").startsWith("motor"));
  tools.forEach(([port, t], i) => {
    const k = t.kind || "arm";
    if (k === "arm") {
      const mu = (t.off || 0) - 20;
      motorModel(root, "medium", mu, pivotF, pivotY, 1);
      const g = grp(root, t.off || 0, pivotF, pivotY, 0, true);
      beam(g, st.arm, holes(t.reach), "y", 0, 0, 0);
      beam(g, st.arm, holes(hook), "z", 0, 0, t.reach);
      box(g, st.accent, 7, 10, 14, 0, hook - 2, t.reach - 7);
      const tip = grp(g, 0, hook, t.reach - 10, 0, true);
      R.tools.push({ g, port, tip });
    } else {
      const mu = tools.length > 1 ? (i - (tools.length - 1) / 2) * 44 : -20;
      motorModel(root, "medium", mu, pivotF, pivotY, mu < 0 ? 1 : -1);
      const A = k === "dozer" ? b.half - 12 : 30;
      cylAx(root, C.lbg, 2.4, 2 * A + 10, "u", 0, pivotF, pivotY, 8);
      const g = grp(root, 0, pivotF, pivotY, 0, true);
      for (const sx of [-1, 1]) beam(g, k === "dozer" ? st.frame : st.arm, holes(t.reach), "y", sx * A, 0, 0);
      const tool = { g, port };
      if (k === "dozer") {
        const bl = tool.blade = grp(g, 0, 0, t.reach, 0, true);
        beam(bl, st.frame, holes(2 * A), "x", -A, 0, 0);
        const bh = pivotY - 4;
        box(bl, st.blade || C.dbg, 2 * A + 16, 6, bh, 0, 6, -bh + 2, { r: 1.5 });
        box(bl, st.accent, 2 * A + 16, 7, 6, 0, 6, -bh + 2);
        for (const sx of [-1, 1]) box(bl, st.frame, 7, 8, bh - 4, sx * A, 3, -bh + 4);
      } else {
        beam(g, st.cross, holes(2 * A), "x", -A, 0, t.reach);
        for (const sx of [-1, 1]) { beam(g, st.arm, holes(hook), "z", sx * A, 0, t.reach); box(g, st.accent, 7, 10, 12, sx * A, hook - 2, t.reach - 6); }
        tool.tip = grp(g, 0, hook, t.reach - 10, 0, true);
      }
      R.tools.push(tool);
    }
  });
  // стяжка миссии 12, когда она на навесном
  const tipT = R.tools.find((t) => t.tip);
  if (tipT) {
    R.tie = mesh(tipT.tip, geo("tie", () => new THREE.TorusGeometry(10, 2.6, 8, 20)), C.red, 0, 0, 0);
    R.tie.userData.keep = true; R.tie.visible = false;
  }
  bake(root);
  return R;
}

// ─────────────── вид ───────────────
export class Spike3D {
  constructor(container, opts = {}) {
    this.host = container; this.opts = opts;
    this.kit = new Kit();
    this.knobs = new Map(); this.knobList = [];
    this.objPool = new Map();
    this.dirty = true; this.visibleNow = true; this.raf = 0; this.last = 0;
    this.followOn = false; this.snap = true;
    this.pixState = new Uint8Array(25); this.pixWant = new Uint8Array(25);
    this.mtext = ""; this.mcols = null; this.mOff = -99;
    this._fv = new THREE.Vector3(); this._tv = new THREE.Vector3();

    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap;
    r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = 1.0;
    r.domElement.style.cssText = "display:block;width:100%;height:100%;outline:none;touch-action:none";
    container.appendChild(r.domElement);

    const sc = this.scene = new THREE.Scene();
    sc.background = new THREE.Color(0xdde3ea);
    const pm = new THREE.PMREMGenerator(r);
    this.envTex = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
    sc.environment = this.envTex; sc.environmentIntensity = 0.45;
    sc.add(new THREE.HemisphereLight(0xffffff, 0x8c8478, 1.0));
    const sun = this.sun = new THREE.DirectionalLight(0xffffff, 2.1);
    sun.position.set(W / 2 - 700, 2600, -H / 2 + 1300); sun.target.position.set(W / 2, 0, -H / 2);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 3; sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.6;
    const s = sun.shadow.camera; s.left = -1500; s.right = 1500; s.top = 1100; s.bottom = -1100; s.near = 500; s.far = 5500;
    sc.add(sun, sun.target);

    this.camera = new THREE.PerspectiveCamera(38, 1, 5, 20000);
    const ctl = this.controls = new OrbitControls(this.camera, r.domElement);
    ctl.enableDamping = true; ctl.dampingFactor = 0.12; ctl.maxPolarAngle = rad(86); ctl.minDistance = 120; ctl.maxDistance = 6000;
    ctl.screenSpacePanning = true;
    ctl.addEventListener("change", () => { this.dirty = true; });
    this.onDbl = () => this.resetView();
    r.domElement.addEventListener("dblclick", this.onDbl);

    this.ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => this.resize()) : null;
    if (this.ro) this.ro.observe(container);
    this.io = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver((es) => {
      for (const e of es) this.visibleNow = e.isIntersecting;
      if (this.visibleNow) { this.dirty = true; this.start(); }
    }) : null;
    if (this.io) this.io.observe(container);
    this.onVis = () => { if (!document.hidden) { this.dirty = true; this.start(); } };
    document.addEventListener("visibilitychange", this.onVis);
    this.loop = this.loop.bind(this);
    this.resize(); this.resetView();
    this.start();
  }

  knob(name, f) { const k = { v: 0, t: 0, f }; this.knobs.set(name, k); this.knobList.push(k); f(0); }
  setK(name, t) { const k = this.knobs.get(name); if (k) k.t = t; }

  setScene(pd = {}, model) {
    this.pd = pd;
    model = model || robotModel(pd);
    const bio = pd.field === "bioglow";
    K = this.kit;
    if (this.fieldRoot) disposeTree(this.fieldRoot);
    for (const t of this.kit.tex) t.dispose();
    this.kit.tex = [];
    this.knobs.clear(); this.knobList = []; this.objPool.clear();
    this.F = null; this.dockRoot = null; this.dockSig = ""; this.dockRef = null;
    const root = this.fieldRoot = new THREE.Group(); this.scene.add(root);
    buildTable(root, this.kit, bio, this.opts.matUrl || "/static/spikesim/bioglow/mat.jpg", () => { this.dirty = true; });
    const knob = (n, f) => this.knob(n, f);
    if (bio) {
      this.F = buildBioglow(root, knob);
      this.objRoot = grp(root, 0, 0, 0, 0, true);
      this.buildDocks(pd.docks || DEFAULT_DOCKS);
    } else {
      this.objRoot = grp(root, 0, 0, 0, 0, true);
      if (pd.box) { this.crate = buildObj(root, "crate", 55); this.crate.position.set(pd.box.x, 0, -pd.box.y); }
      else this.crate = null;
      if (pd.lever) {
        const L = pd.lever;
        box(root, C.dbg, 80, 40, 30, L.x, L.y, 0, { studs: true });
        const lv = this.lever = grp(root, L.x, L.y, 26, 0, true);
        beam(lv, C.red, 12, "yv", 0, 0, 0); box(lv, C.yellow, 12, 10, 12, 0, 0, 84, { r: 3 });
        knob("lever", (k) => { lv.rotation.z = -rad(80) * k; });
      } else this.lever = null;
      for (const o of pd.objects || []) {
        const g = buildObj(root, o.kind, o.r || 20, o.color != null ? (typeof o.color === "string" ? new THREE.Color(o.color).getHex() : o.color) : null);
        g.position.set(o.x, 0, -o.y); if (o.a) g.rotation.y = rad(o.a);
      }
    }
    bake(root);
    // робот
    if (this.R) disposeTree(this.R.root);
    this.model = model;
    this.R = buildRobot(model, this.kit);
    this.scene.add(this.R.root);
    K = null;
    this.snap = true; this.snapPix = true; this.lastSt = null;
    const st0 = pd.start || (bio ? { x: 330, y: 150, h: 0 } : { x: 190, y: 150, h: -90 });
    this.update({ t: 0, pose: { x: st0.x, y: st0.y, h: rad(st0.h || 0) }, motors: {}, matrix: { text: "" }, box: pd.box || null, lever: pd.lever ? { up: true } : null, field: null });
    this.snap = true;
    this.dirty = true; this.start();
  }

  buildDocks(docks) {
    if (docks === this.dockRef) return;
    this.dockRef = docks;
    let sig = "";
    for (const n in DOCKS) sig += n + ":" + docks[n] + ";";
    if (sig === this.dockSig) return;
    const prevK = K; K = this.kit;
    if (this.dockRoot) disposeTree(this.dockRoot);
    for (const n of ["trees", "skylight", "canopy", "hatch"]) { const k = this.knobs.get(n); if (k) { this.knobs.delete(n); this.knobList.splice(this.knobList.indexOf(k), 1); } }
    this.dockRoot = buildDocks(this.fieldRoot, docks, (n, f) => this.knob(n, f), this.F);
    bake(this.dockRoot);
    this.dockSig = sig; this.snap = true;
    K = prevK;
  }

  // снимок состояния робота и поля
  update(st) {
    if (!st || !st.pose || !this.R) return;
    const L = this.lastSt;
    if (L === st && !this.snap) return;
    const p = st.pose, t = st.t || 0;
    if (L && t < this.lastT - 1e-6) this.snap = true;          // сброс симуляции
    this.lastSt = st; this.lastT = t;
    const R = this.R;
    R.root.position.set(p.x, 0, -p.y); R.root.rotation.y = p.h;
    const m = st.motors || {};
    for (let i = 0; i < R.wheels.length; i++) { const w = R.wheels[i]; w.g.rotation.x = -(m[w.port] || 0) * w.sign * DEG; }
    for (let i = 0; i < R.tools.length; i++) {
      const tl = R.tools[i], a = clamp(m[tl.port] || 0, -60, 92) * DEG;
      tl.g.rotation.x = -a; if (tl.blade) tl.blade.rotation.x = a;
    }
    this.setMatrix(st.matrix);
    const fs = st.field;
    if (this.F) this.applyField(fs);
    else {
      if (this.crate && st.box) this.crate.position.set(st.box.x, 0, -st.box.y);
      if (this.lever) this.setK("lever", st.lever && !st.lever.up ? 1 : 0);
    }
    if (this.snap) { for (const k of this.knobList) { k.v = k.t; k.f(k.v); } this.snap = false; }
    this.dirty = true;
  }

  applyField(fs) {
    const s = (fs && fs.s) || {}, F = this.F;
    if (fs && fs.docks) this.buildDocks(fs.docks);
    this.setK("drone", s.droneUp ? 1 : 0); this.setK("map", s.mapFlipped ? 1 : 0);
    this.setK("rock", s.rockFlipped && !s.rockBack ? 1 : 0); this.setK("flag", s.flagDown ? 1 : 0);
    F.leaf1.visible = !s.leaf1; F.leaf2.visible = !s.leaf2;
    F.kat.position.set(T(135), s.katydidOut ? 0.5 : 6, -(s.katydidOut ? 930 : 985)); F.kat.rotation.y = s.katydidMoved ? 0.7 : 0;
    this.setK("root", s.root === 2 ? 35 : s.root === 1 ? 15 : 0);
    this.setK("platform", s.platform ? 1 : 0);
    F.vineHang.visible = !s.vine; F.vineDown.visible = !!s.vine;
    this.setK("camera", s.camera ? 1 : 0); F.camBody.material = mat2(this.kit, s.camera ? C.black : C.dbg);
    F.treeSeed.visible = !s.treeSeed; F.stalkSeeds.visible = !s.seedsOut;
    this.setK("spider", s.spiderMoved ? 1 : 0); this.setK("snail", s.snailMoved ? 1 : 0);
    this.setK("ant", s.antHome ? 1 : 0);
    const fr = s.fragments == null ? 3 : s.fragments;
    for (let i = 0; i < 3; i++) F.frag[i].visible = i < fr;
    this.setK("myc", s.myc ? 1 : 0); this.setK("cover", s.cover ? 1 : 0); this.setK("cane", s.cane ? 1 : 0);
    const tie = s.tie || "tree";
    F.tieTree.visible = tie === "tree"; F.tiePost.visible = tie === "post";
    if (this.R.tie) this.R.tie.visible = tie === "robot";
    this.setK("trees", s.trees ? 1 : 0); this.setK("canopy", s.canopy ? 1 : 0); this.setK("skylight", s.skylight ? 1 : 0); this.setK("hatch", s.hatch ? 1 : 0);
    // свободные предметы: семена, метка, ключевой вид
    const objs = (fs && fs.objs) || DEFAULT_OBJS;
    for (const g of this.objPool.values()) g.userData.seen = false;
    for (let i = 0; i < objs.length; i++) {
      const o = objs[i];
      let g = this.objPool.get(o.id);
      if (!g) {
        const prev = K; K = this.kit;
        g = buildObj(this.objRoot, o.kind, o.r || 18); bake(g);
        K = prev; this.objPool.set(o.id, g);
      }
      g.userData.seen = true; g.visible = true;
      g.position.set(o.x, 0, -o.y);
    }
    for (const g of this.objPool.values()) if (!g.userData.seen) g.visible = false;
  }

  setMatrix(mx) {
    mx = mx || {};
    const want = this.pixWant;
    if (mx.pixels) { this.mcols = null; for (let i = 0; i < 25; i++) want[i] = mx.pixels[i] > 0 ? 1 : 0; }
    else if (mx.text) {
      if (mx.text !== this.mtext) {
        this.mtext = mx.text;
        const glyphs = [...String(mx.text).toUpperCase()].map((c) => FONT[c]);
        if (glyphs.every(Boolean)) {
          const cols = [];
          for (const g of glyphs) { for (let x = 0; x < 3; x++) cols.push([0, 1, 2, 3, 4].map((y) => g[y * 3 + x] === "1")); cols.push([false, false, false, false, false]); }
          this.mcols = cols; this.mScroll = glyphs.length > 1; this.mOff = -99;
        } else this.mcols = null;
      }
      if (this.mcols) { this.matrixText(performance.now(), true); return; }
      want.fill(0);
    } else { this.mcols = null; want.fill(0); }
    if (!mx.text) this.mtext = "";
    this.applyPixels();
  }
  matrixText(now, force) {
    const cols = this.mcols; if (!cols) return false;
    const off = this.mScroll ? (Math.floor(now / 120) % (cols.length + 5)) - 5 : -1;
    if (off === this.mOff && !force) return false;
    this.mOff = off;
    const want = this.pixWant;
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) { const c = cols[x + off]; want[y * 5 + x] = c && c[y] ? 1 : 0; }
    return this.applyPixels();
  }
  applyPixels() {
    const R = this.R; if (!R || !R.pixels) return false;
    let ch = false;
    for (let i = 0; i < 25; i++) if (this.pixState[i] !== this.pixWant[i] || this.snapPix) {
      this.pixState[i] = this.pixWant[i]; R.pixels[i].material = this.pixWant[i] ? R.pixOn : R.pixOff; ch = true;
    }
    this.snapPix = false;
    if (ch) this.dirty = true;
    return ch;
  }

  follow(on) {
    this.followOn = !!on;
    if (this.followOn) this.chaseView();
    this.dirty = true; this.start();
    return this.followOn;
  }
  chaseView() {
    if (!this.R) return;
    const p = this.R.root.position, h = this.R.root.rotation.y;
    this.controls.target.set(p.x, 40, p.z);
    this.camera.position.set(p.x + Math.sin(h) * 520, 480, p.z + Math.cos(h) * 520);
    this.controls.update();
  }
  resetView() {
    if (this.followOn) { this.chaseView(); this.dirty = true; return; }
    const t = Math.tan(rad(this.camera.fov / 2)), asp = this.camera.aspect || 1.6;
    const d = Math.max(1300 / (t * asp), 760 / t), el = rad(47);
    this.controls.target.set(W / 2, 0, -H / 2 + 40);
    this.camera.position.set(W / 2, Math.sin(el) * d, -H / 2 + 40 + Math.cos(el) * d);
    this.controls.update(); this.dirty = true;
  }

  resize() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    if (w === this.w && h === this.h) return;
    const first = !this.w;
    this.w = w; this.h = h;
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    if (first) this.resetView();
    this.dirty = true; this.start();
  }

  start() { if (!this.raf && this.renderer) { this.last = performance.now(); this.raf = requestAnimationFrame(this.loop); } }

  loop(now) {
    this.raf = 0;
    if (!this.renderer || !this.visibleNow || document.hidden) return;
    const dt = Math.min(0.1, Math.max(0, (now - this.last) / 1000)); this.last = now;
    let need = this.dirty;
    // плавные движения моделей
    const a = Math.min(1, dt * 7);
    for (let i = 0; i < this.knobList.length; i++) {
      const k = this.knobList[i];
      if (k.v !== k.t) {
        k.v += (k.t - k.v) * a;
        if (Math.abs(k.t - k.v) < 0.004 * Math.max(1, Math.abs(k.t))) k.v = k.t;
        k.f(k.v); need = true;
      }
    }
    if (this.mcols && this.mScroll && this.matrixText(now)) need = true;
    // камера за роботом
    if (this.followOn && this.R) {
      const p = this.R.root.position, tg = this.controls.target, f = Math.min(1, dt * 6);
      const dx = (p.x - tg.x) * f, dz = (p.z - tg.z) * f;
      if (Math.abs(dx) + Math.abs(dz) > 0.05) { tg.x += dx; tg.z += dz; this.camera.position.x += dx; this.camera.position.z += dz; need = true; }
    }
    if (this.controls.update()) need = true;
    if (need && this.w) { this.dirty = false; this.renderer.render(this.scene, this.camera); }
    this.raf = requestAnimationFrame(this.loop);
  }

  render() { if (this.renderer && this.w) { this.renderer.render(this.scene, this.camera); this.dirty = false; } }

  dispose() {
    if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0;
    if (this.ro) this.ro.disconnect(); if (this.io) this.io.disconnect();
    document.removeEventListener("visibilitychange", this.onVis);
    this.renderer.domElement.removeEventListener("dblclick", this.onDbl);
    this.controls.dispose();
    if (this.fieldRoot) disposeTree(this.fieldRoot);
    if (this.R) disposeTree(this.R.root);
    this.kit.dispose();
    if (glowTex) { glowTex.dispose(); glowTex = null; }
    this.envTex.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.renderer = null;
  }
}

const mat2 = (kit, c) => kit.mat(c);
const DEFAULT_OBJS = [
  { id: "scan", kind: "scan", x: MX + 1153, y: 165, r: 16 },
  { id: "keystone", kind: "keystone", x: 520, y: 300, r: 40 },
];
