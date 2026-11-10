// Полигон запуска: небо с солнцем, степь с полями и дорогой (шейдер без повторяющейся текстуры), хребет
// Заилийского Алатау на юге, облака, деревья, стартовый стол с направляющей, лагерь команды с наземной
// станцией и оператором антенны, ветроуказатель. Единицы - метры. X - по ветру, Y - вверх, юг (горы) в -Z.
import * as THREE from "three";
import { canvasTex, clamp, lam, lerp, puffTex, rng, softDot, std, TAU } from "./util.js";

export const SUN = new THREE.Vector3(0.48, 0.74, 0.47).normalize();
export const HORIZON = new THREE.Color(0xc4dcf2);
const ZENITH = new THREE.Color(0x3d86d8);

// ─────────────── небо ───────────────
export function makeSky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uSun: { value: SUN }, uHor: { value: HORIZON }, uZen: { value: ZENITH } },
    vertexShader: "varying vec3 vD; void main(){ vD = normalize(position); vec4 p = modelViewMatrix * vec4(position, 0.0); gl_Position = projectionMatrix * vec4(p.xyz, 1.0); gl_Position.z = gl_Position.w; }",
    fragmentShader: `
      varying vec3 vD; uniform vec3 uSun, uHor, uZen;
      void main(){
        vec3 d = normalize(vD);
        float h = clamp(d.y, -0.2, 1.0);
        vec3 c = mix(uHor, uZen, pow(smoothstep(0.0, 0.85, h), 0.62));
        c = mix(c, uHor * vec3(0.93, 0.95, 0.98), smoothstep(0.0, -0.08, h));
        float s = max(0.0, dot(d, normalize(uSun)));
        c += vec3(1.0, 0.93, 0.78) * (pow(s, 380.0) * 2.2 + pow(s, 28.0) * 0.22 + pow(s, 5.0) * 0.1);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), mat);
  m.frustumCulled = false; m.renderOrder = -10;
  return m;
}

// ─────────────── земля ───────────────
export function makeGround(fogDensity) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uFog: { value: HORIZON }, uDen: { value: fogDensity }, uSunK: { value: 1 } },
    vertexShader: "varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
    fragmentShader: `
      precision highp float;
      varying vec3 vW; uniform vec3 uFog; uniform float uDen;
      float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
        return mix(mix(h1(i), h1(i+vec2(1,0)), f.x), mix(h1(i+vec2(0,1)), h1(i+vec2(1,1)), f.x), f.y); }
      float fbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a*n2(p); p = p*2.03 + 17.0; a *= 0.5; } return s; }
      void main(){
        vec2 p = vW.xz; float d = length(cameraPosition - vW); float r = length(p);
        vec3 dry = vec3(0.70, 0.66, 0.40), green = vec3(0.40, 0.54, 0.26), dark = vec3(0.28, 0.40, 0.21);
        float m1 = fbm(p*0.0035), m2 = fbm(p*0.027 + 7.0);
        vec3 c = mix(green, dry, smoothstep(0.36, 0.66, m1));
        c = mix(c, dark, smoothstep(0.52, 0.8, m2) * 0.45);
        // вдали от площадки - поля клетками с бороздами
        vec2 g = (p + vec2(310.0, 130.0)) / vec2(270.0, 190.0); vec2 cell = floor(g), cf = fract(g);
        float cr = h1(cell);
        float inside = smoothstep(0.0, 0.025, cf.x) * smoothstep(1.0, 0.975, cf.x) * smoothstep(0.0, 0.035, cf.y) * smoothstep(1.0, 0.965, cf.y);
        vec3 field = mix(vec3(0.63, 0.60, 0.33), vec3(0.34, 0.52, 0.24), cr);
        field = mix(field, vec3(0.53, 0.43, 0.29), step(0.78, cr));
        field = mix(field, vec3(0.80, 0.74, 0.36), step(0.93, cr));
        float rows = 0.5 + 0.5*sin((cr > 0.5 ? p.x : p.y) * 1.3);
        field *= 0.94 + 0.06*rows*(1.0 - smoothstep(120.0, 500.0, d));
        float farK = smoothstep(380.0, 760.0, r) * 0.85;
        c = mix(c, mix(c*0.78, field, inside), farK);
        // грунтовая дорога мимо лагеря и тропа к столу
        float road = smoothstep(2.6, 1.5, abs(p.y - 46.0 - 16.0*sin(p.x*0.0042)));
        float path = smoothstep(0.7, 0.3, abs(p.x + p.y*0.55)) * step(0.0, p.y) * step(p.y, 46.0);
        vec3 dirt = vec3(0.66, 0.57, 0.42) * (0.92 + 0.16*n2(p*2.3));
        c = mix(c, dirt, max(road*0.92, path*0.5));
        // вытоптанная площадка у стартового стола
        c = mix(c, dirt*1.04, smoothstep(5.5, 1.2, r) * 0.75);
        // мелкая фактура травы вблизи
        float nearK = 1.0 - smoothstep(6.0, 70.0, d), closeK = 1.0 - smoothstep(1.0, 14.0, d);
        c *= 0.88 + 0.2*n2(p*1.1)*nearK + 0.12*n2(p*7.0)*nearK + 0.06*(m2 - 0.5);
        c *= 0.86 + 0.28*n2(p*vec2(34.0, 21.0))*closeK + 0.14*closeK;
        c *= 1.0 + (n2(p*vec2(160.0, 55.0) + 3.0) - 0.5)*0.34*(1.0 - smoothstep(0.5, 6.0, d));
        c = mix(c, c*vec3(1.08, 1.04, 0.8), smoothstep(0.55, 0.9, n2(p*0.9 + 40.0))*nearK*0.5);
        c = pow(c, vec3(2.2));
        float f = 1.0 - exp(-d*d*uDen*uDen);
        c = mix(c, uFog, clamp(f, 0.0, 1.0));
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const geo = new THREE.CircleGeometry(60000, 72); geo.rotateX(-Math.PI / 2);
  return new THREE.Mesh(geo, mat);
}

// ─────────────── горы ───────────────
/** Одномерный шум: сумма синусов со случайными фазами и «гребневая» добавка для острых вершин */
function ridgeNoise(seed) {
  const r = rng(seed), oct = Array.from({ length: 7 }, (_, i) => ({ f: 3 * Math.pow(1.93, i) * (0.85 + r() * 0.3), ph: r() * TAU, a: Math.pow(0.56, i) }));
  const norm = oct.reduce((q, o) => q + o.a, 0);
  return (a) => { let v = 0; for (const o of oct) v += o.a * (1 - Math.abs(Math.sin(a * o.f + o.ph))); return Math.pow(v / norm, 1.5); };
}
/** Лента хребта по дуге горизонта: по высоте пять поясов (дымка у подножия, склон, скалы, снег), грани освещены сбоку */
function ridge(R, a0, a1, n, heightAt, col) {
  const pos = [], cols = [], idx = [], rowsN = 6;
  const c = new THREE.Color(), rock = new THREE.Color(col.rock), foot = new THREE.Color(col.foot), snow = new THREE.Color(col.snow), shade = new THREE.Color(col.shade);
  const hs = []; for (let i = 0; i <= n; i++) hs.push(heightAt(lerp(a0, a1, i / n)));
  for (let i = 0; i <= n; i++) {
    const a = lerp(a0, a1, i / n), H = hs[i], x = Math.cos(a) * R, z = Math.sin(a) * R;
    const slope = (hs[Math.min(n, i + 1)] - hs[Math.max(0, i - 1)]) / Math.max(1, col.span);   // склон к солнцу светлее
    const lit = clamp(0.5 + slope * 0.9, 0, 1);
    for (let j = 0; j < rowsN; j++) {
      const k = j / (rowsN - 1), y = H * k;
      pos.push(x, y, z);
      c.copy(foot).lerp(rock, smooth01(k * 1.6)).lerp(shade, (1 - lit) * 0.55 * k);
      const snowK = smooth01((y - col.snowAt + (lit - 0.5) * col.snowJ) / col.snowBand);
      c.lerp(snow, snowK * (0.75 + 0.25 * lit));
      c.lerp(HORIZON, col.haze * (1 - k * 0.55));
      cols.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < rowsN - 1; j++) { const a = i * rowsN + j, b = a + rowsN; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, fog: false }));
  m.frustumCulled = false;
  return m;
}
const smooth01 = (k) => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };

/** Слои рисуются от дальнего к ближнему (порядок детей группы) */
export function makeMountains() {
  const g = new THREE.Group();
  const n1 = ridgeNoise(41), n2 = ridgeNoise(97), n3 = ridgeNoise(13), n4 = ridgeNoise(211);
  const south = (a) => Math.pow(Math.max(0, Math.sin(-a)), 0.45);        // хребет стоит на юге и сходит на нет к краям
  // дальний снежный хребет
  g.add(ridge(16500, -Math.PI * 1.02, Math.PI * 0.02, 520, (a) => (1300 + 3600 * n1(a)) * (0.3 + 0.7 * south(a)),
    { foot: 0x8ea2bd, rock: 0x62799c, shade: 0x3d5275, snow: 0xffffff, snowAt: 2500, snowBand: 900, snowJ: 700, haze: 0.5, span: 420 }));
  // ближний хребет: ниже, темнее, снега меньше
  g.add(ridge(12500, -Math.PI * 1.04, Math.PI * 0.04, 460, (a) => (700 + 2300 * n2(a * 1.3 + 2)) * (0.25 + 0.75 * south(a)),
    { foot: 0x7f97a6, rock: 0x566f86, shade: 0x34495f, snow: 0xf3f7fc, snowAt: 2150, snowBand: 600, snowJ: 500, haze: 0.36, span: 300 }));
  // зеленые предгорья
  g.add(ridge(8000, -Math.PI * 1.08, Math.PI * 0.08, 300, (a) => (140 + 760 * n3(a * 0.8 + 5)) * (0.3 + 0.7 * south(a)),
    { foot: 0x86a078, rock: 0x64845d, shade: 0x3f5a45, snow: 0xffffff, snowAt: 1e9, snowBand: 1, snowJ: 0, haze: 0.4, span: 110 }));
  // пологие холмы по остальному горизонту
  g.add(ridge(9500, 0.04, Math.PI * 0.96, 200, (a) => 50 + 330 * n4(a * 0.6 + 9) * Math.pow(Math.sin(a), 0.5),
    { foot: 0x94ab86, rock: 0x7d9a70, shade: 0x55745a, snow: 0xffffff, snowAt: 1e9, snowBand: 1, snowJ: 0, haze: 0.55, span: 80 }));
  return g;
}

// ─────────────── облака ───────────────
function cloudTex(seed) {
  const r = rng(seed);
  return canvasTex(256, 128, (g, w, h) => {
    const n = 16 + Math.floor(r() * 8);
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < n; i++) {
      const k = i / (n - 1), x = w * (0.16 + 0.68 * k) + (r() - 0.5) * 18, top = Math.sin(k * Math.PI);
      const rad = h * (0.16 + 0.24 * top * (0.6 + 0.4 * r())), y = h * 0.7 - rad * 0.55 - top * h * 0.12 * r() + pass * 5;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      const col = pass ? "255,255,255" : "206,216,232";                 // сначала сероватое основание, сверху белые шапки
      gr.addColorStop(0, `rgba(${col},.9)`); gr.addColorStop(0.55, `rgba(${col},.6)`); gr.addColorStop(1, `rgba(${col},0)`);
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }
  });
}
export function makeClouds() {
  const g = new THREE.Group();
  const r = rng(77);
  const texs = [cloudTex(3), cloudTex(11), cloudTex(29), cloudTex(57)];
  const list = [];
  for (let i = 0; i < 26; i++) {
    const mat = new THREE.SpriteMaterial({ map: texs[i % 4], transparent: true, opacity: 0.86 + r() * 0.12, depthWrite: false, fog: false, color: 0xffffff });
    const s = new THREE.Sprite(mat);
    const a = r() * TAU, d = 1500 + r() * 6000, w = 700 + r() * 1300;
    s.position.set(Math.cos(a) * d, 1100 + r() * 1100, Math.sin(a) * d);
    s.scale.set(w, w * 0.5, 1);
    g.add(s); list.push({ s, v: 0.6 + r() * 0.8 });
  }
  g.userData.drift = (dt, wind) => { for (const c of list) { c.s.position.x += dt * (1.5 + wind) * c.v; if (c.s.position.x > 7500) c.s.position.x = -7500; } };
  return g;
}

// ─────────────── деревья и кусты ───────────────
export function makeTrees(avoid) {
  const g = new THREE.Group();
  const r = rng(913);
  const N = 70;
  const crownGeo = new THREE.IcosahedronGeometry(1, 1), trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 1, 5);
  const crowns = new THREE.InstancedMesh(crownGeo, lam(0xffffff, { flatShading: true }), N);
  const trunks = new THREE.InstancedMesh(trunkGeo, lam(0x6b4a2f), N);
  const blobs = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 14).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x1b2a17, transparent: true, opacity: 0.3, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), N);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    let x, z, tries = 0;
    do { const a = r() * TAU, d = 22 + Math.pow(r(), 0.6) * 520; x = Math.cos(a) * d; z = Math.sin(a) * d; } while (avoid(x, z) && ++tries < 20);
    const bush = r() < 0.4, hh = bush ? 0.7 + r() * 0.8 : 3 + r() * 4.5, rad = bush ? hh * (0.8 + r() * 0.5) : hh * (0.32 + r() * 0.14);
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), r() * TAU);
    crowns.setMatrixAt(i, m.compose(new THREE.Vector3(x, bush ? hh * 0.5 : hh * 0.68, z), q, new THREE.Vector3(rad, bush ? hh * 0.6 : hh * 0.5, rad)));
    crowns.setColorAt(i, c.setHSL(0.25 + r() * 0.07, 0.45 + r() * 0.2, 0.13 + r() * 0.08));
    trunks.setMatrixAt(i, m.compose(new THREE.Vector3(x, bush ? 0.05 : hh * 0.2, z), q, new THREE.Vector3(bush ? 0.01 : 1 + hh * 0.12, bush ? 0.01 : hh * 0.4, bush ? 0.01 : 1 + hh * 0.12)));
    // тень-пятно, сдвинутая от солнца
    const k = (bush ? hh * 0.5 : hh * 0.68) / SUN.y;
    blobs.setMatrixAt(i, m.compose(new THREE.Vector3(x - SUN.x * k, 0.02, z - SUN.z * k), new THREE.Quaternion(), new THREE.Vector3(rad * 1.15, 1, rad * 1.15)));
  }
  crowns.instanceColor.needsUpdate = true;
  g.add(blobs, trunks, crowns);
  return g;
}

// ─────────────── стартовый стол ───────────────
export function makePad() {
  const g = new THREE.Group();
  const steel = std(0x9aa3ad, { metalness: 0.8, roughness: 0.35 }), dark = std(0x374151, { roughness: 0.7 });
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.008, 24), std(0x6b7280, { metalness: 0.7, roughness: 0.5 }));
  plate.position.y = 0.11; g.add(plate);
  for (let i = 0; i < 3; i++) {
    const a = (i * TAU) / 3 + 0.5;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.42, 8), dark);
    leg.position.set(Math.cos(a) * 0.17, 0.055, Math.sin(a) * 0.17);
    leg.rotation.z = Math.cos(a) * 1.15; leg.rotation.x = -Math.sin(a) * 1.15;
    g.add(leg);
  }
  // направляющая: наклоняется вместе с ракетой (см. setRail)
  const railG = new THREE.Group(); railG.position.y = 0.11;
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 1.3, 8), steel);
  rod.position.y = 0.65; railG.add(rod);
  g.add(railG);
  // пульт запуска и провода
  const box = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.14), std(0xf59e0b, { roughness: 0.6 }));
  box.position.set(-1.2, 0.045, 6.2); g.add(box);
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 12), std(0xdc2626)); btn.position.set(-1.2, 0.1, 6.2); g.add(btn);
  const wire = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.05, 0.1, 0.05), new THREE.Vector3(0.1, 0.01, 0.4), new THREE.Vector3(-0.5, 0.01, 3.1), new THREE.Vector3(-1.2, 0.02, 6.1)]),
    new THREE.LineBasicMaterial({ color: 0x111827 }));
  g.add(wire);
  // ограждение: конусы по кругу
  const coneGeo = new THREE.ConeGeometry(0.11, 0.34, 10), coneMat = std(0xff6a1a, { roughness: 0.6 });
  for (let i = 0; i < 6; i++) { const a = (i * TAU) / 6 + 0.3; const c = new THREE.Mesh(coneGeo, coneMat); c.position.set(Math.cos(a) * 4.2, 0.17, Math.sin(a) * 4.2); g.add(c); }
  g.userData.setRail = (th) => { railG.rotation.z = -th; };
  g.userData.railG = railG;
  return g;
}

// ─────────────── люди ───────────────
const SKIN = [0xf1c9a5, 0xe0ac82, 0xc98d62, 0xf4d3b5];
export function makePerson(h, shirt, { skin = 0, cap = null, armL = 0.12, armR = 0.12 } = {}) {
  const g = new THREE.Group();
  const leg = h * 0.47, torso = h * 0.33, head = h * 0.075;
  const pants = lam(0x334155), top = lam(shirt), sk = lam(SKIN[skin % SKIN.length]);
  for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.045, h * 0.04, leg, 8), pants); l.position.set(s * h * 0.055, leg / 2, 0); g.add(l); }
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(h * 0.095, torso - h * 0.12, 4, 10), top); body.position.y = leg + torso / 2; body.scale.z = 0.72; g.add(body);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(head, 14, 10), sk); hd.position.y = leg + torso + head * 1.25; g.add(hd);
  if (cap != null) { const cp = new THREE.Mesh(new THREE.SphereGeometry(head * 1.06, 14, 8, 0, TAU, 0, Math.PI * 0.5), lam(cap)); cp.position.copy(hd.position); cp.position.y += head * 0.12; g.add(cp); }
  const arms = [];
  for (const [s, ang] of [[-1, armL], [1, armR]]) {
    const pivot = new THREE.Group(); pivot.position.set(s * h * 0.125, leg + torso - h * 0.03, 0);
    const a = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.028, h * 0.024, h * 0.34, 7), sk); a.position.y = -h * 0.17; pivot.add(a);
    pivot.rotation.x = -ang; g.add(pivot); arms.push(pivot);
  }
  g.userData.arms = arms; g.userData.h = h;
  return g;
}

/** Антенна Яги: траверса и шесть элементов убывающей длины. Ось траверсы +Z (куда наводится). */
function makeYagi() {
  const g = new THREE.Group();
  const al = std(0xd1d5db, { metalness: 0.9, roughness: 0.3 });
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.95, 8), al); boom.rotation.x = Math.PI / 2; boom.position.z = 0.3; g.add(boom);
  [0.36, 0.33, 0.3, 0.29, 0.28, 0.27].forEach((len, i) => {
    const e = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, len, 6), al); e.rotation.z = Math.PI / 2; e.position.z = -0.12 + i * 0.165; g.add(e);
  });
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.16, 8), std(0x111827)); grip.position.set(0, -0.08, -0.02); g.add(grip);
  return g;
}

// ─────────────── лагерь команды со станцией ───────────────
export function makeStation() {
  const g = new THREE.Group();
  const pole = std(0xcbd5e1, { metalness: 0.6, roughness: 0.4 });
  // шатер 3 x 3 м
  for (const [x, z] of [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.1, 8), pole); p.position.set(x, 1.05, z); g.add(p); }
  const roofTex = canvasTex(256, 64, (c, w, h) => { c.fillStyle = "#ff6a1a"; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = "800 34px Inter, system-ui, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("USTEM", w / 2, h / 2 + 2); });
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.25, 0.85, 4, 1), lam(0xff6a1a)); roof.rotation.y = Math.PI / 4; roof.position.y = 2.52; g.add(roof);
  for (let i = 0; i < 4; i++) {
    const v = new THREE.Mesh(new THREE.PlaneGeometry(3.06, 0.3), lam(0xffffff, { map: roofTex, side: THREE.DoubleSide }));
    v.position.set(Math.sin((i * Math.PI) / 2) * 1.53, 1.98, Math.cos((i * Math.PI) / 2) * 1.53); v.rotation.y = (i * Math.PI) / 2; g.add(v);
  }
  // стол с ноутбуком и приемником
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.65), lam(0xe5e7eb)); table.position.set(0, 0.74, 0); g.add(table);
  for (const [x, z] of [[-0.68, -0.27], [0.68, -0.27], [-0.68, 0.27], [0.68, 0.27]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.74, 6), pole); l.position.set(x, 0.37, z); g.add(l); }
  const lap = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.015, 0.23), std(0x374151)); lap.position.set(-0.2, 0.77, 0.05); g.add(lap);
  const scrTex = canvasTex(128, 80, (c, w, h) => { c.fillStyle = "#0b1220"; c.fillRect(0, 0, w, h); c.strokeStyle = "#50e3c2"; c.lineWidth = 2; c.beginPath(); for (let x = 0; x < w; x += 4) c.lineTo(x, h * 0.75 - Math.sin(x / 26) * h * 0.4 * Math.min(1, x / 40)); c.stroke(); c.fillStyle = "#94a3b8"; for (let i = 0; i < 4; i++) c.fillRect(6, 6 + i * 6, 30 + ((i * 17) % 22), 2); });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.22), new THREE.MeshBasicMaterial({ map: scrTex })); scr.position.set(-0.2, 0.885, -0.07); scr.rotation.x = -0.25; g.add(scr);
  const rx = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.11), std(0x1e293b)); rx.position.set(0.35, 0.785, 0); g.add(rx);
  // ящики и флажки
  const crate = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.4), lam(0x1d4ed8)); crate.position.set(1.0, 0.2, 1.0); g.add(crate);
  // мачта со штыревой антенной (для станции без Яги)
  const mast = new THREE.Group();
  const mp = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 3.2, 8), pole); mp.position.y = 1.6; mast.add(mp);
  const whip = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.5, 6), std(0x111827)); whip.position.y = 3.45; mast.add(whip);
  mast.position.set(1.9, 0, -1.9); g.add(mast);
  // команда: оператор с Яги, двое у ноутбука, наставник, ученик показывает вверх
  const people = [];
  const add = (p, x, z, face = 0) => { p.position.set(x, 0, z); p.rotation.y = face; g.add(p); people.push(p); return p; };
  const operator = add(makePerson(1.62, 0x2563eb, { skin: 1, cap: 0xff6a1a, armL: 1.25, armR: 1.25 }), 2.6, -2.3);
  const yagi = makeYagi(); yagi.position.set(0, 1.28, 0.3); operator.add(yagi);
  add(makePerson(1.45, 0xf59e0b, { skin: 0 }), -0.35, 0.75, Math.PI);
  add(makePerson(1.5, 0x10b981, { skin: 2, cap: 0x1d4ed8 }), 0.25, 0.8, Math.PI);
  const mentor = add(makePerson(1.76, 0x334155, { skin: 3 }), -2.4, -2.0);
  const kid = add(makePerson(1.38, 0xef4444, { skin: 1, armR: 2.6 }), -3.3, -2.6);
  // тени-пятна под шатром и людьми
  const blob = (x, z, sx, sz, op = 0.28) => { const m = new THREE.Mesh(new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x1b2a17, transparent: true, opacity: op, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); m.position.set(x, 0.02, z); m.scale.set(sx, 1, sz); g.add(m); };
  blob(-SUN.x * 2.6, -SUN.z * 2.6, 2.3, 2.3, 0.3);
  g.userData = { operator, yagi, mast, people, watchers: [mentor, kid, operator], antenna: new THREE.Vector3() };
  return g;
}

// ─────────────── ветроуказатель ───────────────
export function makeWindsock() {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 3.2, 8), std(0xe5e7eb, { metalness: 0.5, roughness: 0.4 })); pole.position.y = 1.6; g.add(pole);
  const sock = new THREE.Group(); sock.position.y = 3.15; g.add(sock);
  const segs = [];
  for (let i = 0; i < 5; i++) {
    const r0 = 0.17 - i * 0.022, r1 = 0.17 - (i + 1) * 0.022;
    const geo = new THREE.CylinderGeometry(r1, r0, 0.26, 12, 1, true); geo.rotateZ(-Math.PI / 2); geo.translate(0.13, 0, 0);
    const s = new THREE.Mesh(geo, lam(i % 2 ? 0xffffff : 0xff6a1a, { side: THREE.DoubleSide }));
    const pivot = new THREE.Group(); pivot.add(s); pivot.position.x = i ? 0.26 : 0.03;
    (i ? segs[i - 1] : sock).add(pivot); segs.push(pivot);
  }
  g.userData.update = (time, wind) => {
    const k = clamp(wind / 8, 0, 1);
    const droop = (1 - k) * 0.42;
    segs.forEach((s, i) => { s.rotation.z = -droop * (i ? 1 : 1.3) + Math.sin(time * (3 + k * 5) + i * 0.9) * 0.05 * (0.4 + k) * (i + 1) * 0.5; s.rotation.y = Math.sin(time * 2.1 + i) * 0.04 * (i + 1); });
  };
  return g;
}

/** Круглая мягкая тень-пятно под летящим телом (для вида издалека) */
export function makeBlob() {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: softDot(64, "rgba(20,30,20,.9)", "rgba(20,30,20,0)", 0.4), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
  return m;
}
