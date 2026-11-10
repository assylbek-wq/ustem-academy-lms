// Парашют: круглый купол из клиньев двух цветов с полюсным отверстием и стропами. Начало координат - точка
// схода строп (там висит груз), купол над ней. setOpen(k): 0 - вытянутая «колбаса» сразу после выброса,
// 1 - наполненный купол; breathe(t) - купол «дышит» в потоке.
import * as THREE from "three";
import { lerp, TAU } from "./util.js";

/** d - диаметр купола в раскрое (м), как задается в конструкторе */
export function buildChute(d, c1 = 0xff6a1a, c2 = 0xffffff, { gores = 12 } = {}) {
  const g = new THREE.Group();
  const Rp = d * 0.36;            // радиус наполненного купола (проекция около 0,7 диаметра раскроя)
  const hDome = d * 0.26;         // высота купола
  const lineLen = Math.max(0.18, d * 1.05);
  const rings = 7, seg = 4;       // делений вдоль меридиана и поперек одного клина
  const pos = [], col = [], idx = [];
  const A = new THREE.Color(c1), B = new THREE.Color(c2);
  const vent = 0.09;
  for (let gi = 0; gi < gores; gi++) {
    const c = gi % 2 ? B : A, base = pos.length / 3;
    for (let j = 0; j <= rings; j++) {
      const k = vent + (1 - vent) * (j / rings);                 // 0 - полюс, 1 - кромка
      const th = k * 1.25;                                       // угол от полюса
      for (let s = 0; s <= seg; s++) {
        const u = s / seg, a = ((gi + u) / gores) * TAU;
        // клин слегка выпирает между стропами, кромка фестонами
        const bulge = 1 + 0.045 * Math.sin(u * Math.PI) * k;
        const scallop = j === rings ? -0.035 * d * Math.sin(u * Math.PI) : 0;
        const r = Rp * (Math.sin(th) / Math.sin(1.25)) * bulge;
        const y = hDome * (Math.cos(th) - Math.cos(1.25)) / (1 - Math.cos(1.25)) - scallop;
        pos.push(Math.cos(a) * r, y, Math.sin(a) * r);
        const shade = 0.82 + 0.18 * Math.sin(u * Math.PI);        // складки: к швам темнее
        col.push(c.r * shade, c.g * shade, c.b * shade);
      }
    }
    for (let j = 0; j < rings; j++) for (let s = 0; s < seg; s++) {
      const a = base + j * (seg + 1) + s, b = a + 1, c2i = a + seg + 1, d2 = c2i + 1;
      idx.push(a, c2i, b, b, c2i, d2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geo.setIndex(idx); geo.computeVertexNormals();
  const canopy = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  const canopyG = new THREE.Group(); canopyG.add(canopy);
  // стропы от кромки (швы клиньев) к точке схода
  const lp = new Float32Array(gores * 6);
  const lines = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(lp, 3)),
    new THREE.LineBasicMaterial({ color: 0x1f2937, transparent: true, opacity: 0.8 }));
  lines.frustumCulled = false;
  g.add(canopyG, lines);
  let open = -1;
  const api = {
    group: g, canopy, d, Rp, lineLen, height: lineLen + hDome,
    setOpen(k, wob = 0) {
      const sx = lerp(0.1, 1, k) * (1 + wob), sy = lerp(2.4, 1, k) * (1 - wob * 0.6);
      const rimR = Rp * sx, cy = Math.sqrt(Math.max(0.01, lineLen * lineLen - rimR * rimR));
      canopyG.scale.set(sx, sy, sx); canopyG.position.y = cy;
      for (let i = 0; i < gores; i++) {
        const a = (i / gores) * TAU;
        lp[i * 6] = 0; lp[i * 6 + 1] = 0; lp[i * 6 + 2] = 0;
        lp[i * 6 + 3] = Math.cos(a) * rimR; lp[i * 6 + 4] = cy; lp[i * 6 + 5] = Math.sin(a) * rimR;
      }
      lines.geometry.attributes.position.needsUpdate = true;
      open = k;
    },
    get open() { return open; },
  };
  api.setOpen(1);
  return api;
}
