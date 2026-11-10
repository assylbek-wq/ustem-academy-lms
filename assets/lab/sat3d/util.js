// Общие помощники 3D-лаборатории CanSat: математика, текстуры на canvas, материалы.
// Единицы сцены - метры, ось Y вверх.
import * as THREE from "three";

export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const smooth = (k) => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };
export const DEG = Math.PI / 180;
export const TAU = Math.PI * 2;

/** Повторяемый генератор случайных чисел 0..1 */
export function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
/** Хеш числа в 0..1 (для частиц без состояния) */
export const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export function canvasTex(w, h, draw, { repeat, aniso = 4, srgb = true } = {}) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

/** Мягкое круглое пятно: дым, пыль, свечение */
export function softDot(size = 128, inner = "rgba(255,255,255,1)", outer = "rgba(255,255,255,0)", mid = 0.35) {
  return canvasTex(size, size, (g, w) => {
    const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    r.addColorStop(0, inner); r.addColorStop(mid, inner.replace(/[\d.]+\)$/, "0.55)")); r.addColorStop(1, outer);
    g.fillStyle = r; g.fillRect(0, 0, w, w);
  }, { srgb: true });
}

/** Клубящееся облако дыма: несколько пятен со смещением */
export function puffTex(size = 128, seed = 7) {
  const r = rng(seed);
  return canvasTex(size, size, (g, w) => {
    for (let i = 0; i < 9; i++) {
      const x = w / 2 + (r() - 0.5) * w * 0.34, y = w / 2 + (r() - 0.5) * w * 0.34, rad = w * (0.2 + r() * 0.16);
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, "rgba(255,255,255,.62)"); gr.addColorStop(0.55, "rgba(255,255,255,.3)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(0, 0, w, w);
    }
  });
}

export const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, ...o });
export const lam = (color, o = {}) => new THREE.MeshLambertMaterial({ color, ...o });

/** Освободить геометрии, материалы и текстуры группы */
export function dispose(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of ms) { for (const k of ["map", "alphaMap", "emissiveMap", "bumpMap"]) if (m[k]) m[k].dispose(); m.dispose(); }
  });
}

/** Двоичный поиск и линейная интерполяция записи полета {t, x, z, th, ro, ph} */
export function sample(rows, t, out = {}) {
  const n = rows.length;
  if (!n) return null;
  let a, b, k;
  if (t <= rows[0].t) { a = b = rows[0]; k = 0; }
  else if (t >= rows[n - 1].t) { a = b = rows[n - 1]; k = 0; }
  else {
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (rows[m].t <= t) lo = m; else hi = m; }
    a = rows[lo]; b = rows[hi]; k = (t - a.t) / Math.max(1e-6, b.t - a.t);
  }
  out.t = t; out.x = lerp(a.x, b.x, k); out.z = lerp(a.z, b.z, k); out.th = lerp(a.th, b.th, k);
  out.ro = lerp(a.ro || 0, b.ro || 0, k); out.ph = k < 0.5 ? a.ph : b.ph;
  out.vx = lerp(a.vx || 0, b.vx || 0, k); out.vz = lerp(a.vz || 0, b.vz || 0, k);
  return out;
}

/** Подпись-спрайт (латиница и цифры: кириллические подписи делаются HTML-слоем, чтобы работал перевод) */
export function textSprite(text, { color = "#fff", bg = "rgba(10,25,52,.7)", size = 44 } = {}) {
  const pad = 14, font = `600 ${size}px Inter, system-ui, sans-serif`;
  const m = document.createElement("canvas").getContext("2d"); m.font = font;
  const w = Math.ceil(m.measureText(text).width) + pad * 2, h = size + pad;
  const tex = canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.beginPath(); g.roundRect(0, 0, w, h, 12); g.fill();
    g.font = font; g.fillStyle = color; g.textBaseline = "middle"; g.fillText(text, pad, h / 2 + 2);
  });
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
  s.userData.aspect = w / h;
  return s;
}
