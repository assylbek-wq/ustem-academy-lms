// Эффекты полета без накопленного состояния: дым, пыль и вспышки считаются как функция времени полета,
// поэтому перемотка назад и вперед показывает ту же картину. Частицы - прямоугольники, повернутые к камере.
import * as THREE from "three";
import { canvasTex, clamp, hash, lerp, puffTex, TAU } from "./util.js";

const MAXP = 2200;

export class Particles {
  constructor() {
    const base = new THREE.PlaneGeometry(1, 1);
    const g = new THREE.InstancedBufferGeometry();
    g.index = base.index; g.setAttribute("position", base.attributes.position); g.setAttribute("uv", base.attributes.uv);
    this.pos = new Float32Array(MAXP * 3); this.misc = new Float32Array(MAXP * 2); this.col = new Float32Array(MAXP * 4);
    g.setAttribute("iPos", this.aPos = new THREE.InstancedBufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("iMisc", this.aMisc = new THREE.InstancedBufferAttribute(this.misc, 2).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("iCol", this.aCol = new THREE.InstancedBufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage));
    g.instanceCount = 0;
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { map: { value: puffTex(128, 5) } },
      vertexShader: `
        attribute vec3 iPos; attribute vec2 iMisc; attribute vec4 iCol; varying vec2 vUv; varying vec4 vCol;
        void main(){ vUv = uv; vCol = iCol; vec4 mv = viewMatrix * vec4(iPos, 1.0);
          float c = cos(iMisc.y), s = sin(iMisc.y); vec2 p = vec2(position.x*c - position.y*s, position.x*s + position.y*c);
          mv.xy += p * iMisc.x; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `
        uniform sampler2D map; varying vec2 vUv; varying vec4 vCol;
        void main(){ float a = texture2D(map, vUv).a * vCol.a; if (a < 0.004) discard;
          gl_FragColor = vec4(vCol.rgb * (0.62 + 0.38*vUv.y), a);
          #include <colorspace_fragment>
        }`,
    });
    this.mesh = new THREE.Mesh(g, mat); this.mesh.frustumCulled = false; this.mesh.renderOrder = 5;
    this.list = [];
  }
  clear() { this.list.length = 0; this.mesh.geometry.instanceCount = 0; }
  /** p: {te, x,y,z, vx,vy,vz, drag, wk (доля сноса ветром), s0, s1, grow, life, c:[r,g,b], a} */
  add(p) { if (this.list.length < MAXP) this.list.push(p); }
  update(t, wind) {
    let n = 0;
    const { pos, misc, col } = this;
    for (let i = 0; i < this.list.length; i++) {
      const p = this.list[i], age = t - p.te;
      if (age < 0 || age > p.life) continue;
      const k = (1 - Math.exp(-p.drag * age)) / p.drag;
      pos[n * 3] = p.x + p.vx * k + wind * p.wk * age;
      pos[n * 3 + 1] = Math.max(p.floor || 0, p.y + p.vy * k + (p.rise || 0) * age);
      pos[n * 3 + 2] = p.z + p.vz * k;
      misc[n * 2] = p.s0 + (p.sq || 0) * (1 - Math.exp(-age * 28)) + (p.s1 - p.s0 - (p.sq || 0)) * (1 - Math.exp(-age * p.grow));
      misc[n * 2 + 1] = p.rot + age * p.spin;
      const u = age / p.life;
      col[n * 4] = p.c[0]; col[n * 4 + 1] = p.c[1]; col[n * 4 + 2] = p.c[2];
      col[n * 4 + 3] = p.a * Math.min(1, age / (p.fade || 0.06)) * Math.pow(1 - u, 1.4);
      n++;
    }
    this.aPos.needsUpdate = this.aMisc.needsUpdate = this.aCol.needsUpdate = true;
    this.mesh.geometry.instanceCount = n;
  }
}

const SMOKE = [0.86, 0.86, 0.85], THIN = [0.8, 0.82, 0.86], DUST = [0.5, 0.4, 0.26], GREY = [0.36, 0.36, 0.36];

/** Облако частиц в точке: пыль при посадке, хлопок вышибного заряда */
export function burst(ps, seed, n, te, at, { speed = 3, up = 0.5, c = DUST, a = 0.5, s1 = 1.2, life = 3, wk = 0.5, flat = true, push = null } = {}) {
  for (let i = 0; i < n; i++) {
    const h1 = hash(seed + i * 3.1), h2 = hash(seed + i * 7.7 + 1), h3 = hash(seed + i * 1.3 + 2);
    const az = h1 * TAU, el = flat ? h2 * 0.5 : (h2 - 0.5) * Math.PI, sp = speed * (0.4 + 0.6 * h3);
    ps.add({ te: te + h3 * 0.08, x: at.x, y: at.y, z: at.z,
      vx: Math.cos(az) * Math.cos(el) * sp + (push ? push.x : 0), vy: Math.sin(el) * sp + up + (push ? push.y : 0), vz: Math.sin(az) * Math.cos(el) * sp,
      drag: 2.2, wk, s0: 0.1, s1: s1 * (0.7 + 0.6 * h2), grow: 1.6, life: life * (0.7 + 0.5 * h1), c, a, rot: h1 * TAU, spin: (h2 - 0.5) * 0.8, floor: 0.05 });
  }
}

/**
 * Дымы одного полета. at(t) -> {x, y, z, ax, ay} (положение сопла и ось ракеты), ev - события.
 * Шлейф двигателя ставится по пройденному пути, чтобы на большой скорости не было разрывов.
 */
export function flightSmoke(ps, at, ev, burn) {
  ps.clear();
  const t0 = ev.tLaunch, tb = Math.min(ev.tBurnout || t0 + burn, ev.tEject), te = ev.tEject;
  // клубы у стартового стола
  burst(ps, 11, 46, t0 + 0.02, { x: 0, y: 0.18, z: 0 }, { speed: 5.5, up: 0.6, c: SMOKE, a: 0.75, s1: 2.1, life: 7, wk: 0.55 });
  burst(ps, 91, 16, t0 + 0.05, { x: 0, y: 0.1, z: 0 }, { speed: 3.5, up: 0.3, c: DUST, a: 0.4, s1: 1.4, life: 4, wk: 0.5 });
  let last = null, i = 0;
  const emit = (t, thick) => {
    const s = at(t); if (!s) return;
    if (last && Math.hypot(s.x - last.x, s.y - last.y) < (thick ? 0.2 : 0.6) && t - last.t < (thick ? 0.03 : 0.2)) return;
    last = { x: s.x, y: s.y, t }; i++;
    const h1 = hash(i * 1.7), h2 = hash(i * 5.3 + 4), h3 = hash(i * 9.1 + 8);
    const ex = thick ? 7 : 1.2;
    ps.add({ te: t, x: s.x, y: s.y, z: s.z,
      vx: -s.ax * ex + (h1 - 0.5) * (thick ? 1.4 : 0.4), vy: -s.ay * ex + (h2 - 0.5) * (thick ? 1.0 : 0.3), vz: (h3 - 0.5) * (thick ? 1.4 : 0.4),
      drag: 4, wk: 0.9, fade: 0.012, s0: thick ? 0.22 : 0.08, sq: thick ? 1.0 : 0.26, s1: thick ? 2.6 + h1 * 1.4 : 0.7 + h1 * 0.3, grow: thick ? 0.45 : 0.5,
      life: thick ? 11 + h2 * 6 : 6 + h2 * 3, c: thick ? SMOKE : THIN, a: thick ? 0.85 : 0.42, rot: h3 * TAU, spin: (h1 - 0.5) * 0.5, rise: 0.15 });
  };
  for (let t = t0; t < tb; t += 0.002) emit(t, true);
  for (let t = tb; t < te; t += 0.01) emit(t, false);      // трассер замедлителя
  if (!ev.crash) {
    const s = at(te - 0.01);
    if (s) burst(ps, 301, 30, te, { x: s.x + s.ax * 0.9, y: s.y + s.ay * 0.9, z: 0 }, { speed: 4.5, up: 0, c: SMOKE, a: 0.8, s1: 1.3, life: 3.4, wk: 0.9, flat: false, push: { x: s.ax * 4 + (s.vx || 0) * 0.5, y: s.ay * 4 + (s.vy || 0) * 0.5 } });
  }
}

export function landingDust(ps, seed, te, x, v) {
  const k = clamp(v / 8, 0.35, 3);
  burst(ps, seed, Math.round(10 + 10 * k), te, { x, y: 0.08, z: 0 }, { speed: 1.2 + 1.6 * k, up: 0.3 * k, c: DUST, a: 0.55, s1: 0.5 + 0.6 * k, life: 2 + k, wk: 0.5 });
  if (v > 14) burst(ps, seed + 50, 18, te, { x, y: 0.1, z: 0 }, { speed: 5, up: 2.5, c: GREY, a: 0.5, s1: 1.6, life: 4, wk: 0.5 });
}

/** Кольца радиоимпульсов: расходятся от антенны при каждой передаче пакета */
export class Pulses {
  constructor(n = 8) {
    const tex = canvasTex(128, 128, (g, w) => {
      g.strokeStyle = "#fff"; g.lineWidth = 7; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 8, 0, TAU); g.stroke();
      g.globalAlpha = 0.35; g.lineWidth = 16; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 12, 0, TAU); g.stroke();
    });
    this.group = new THREE.Group();
    this.pool = Array.from({ length: n }, () => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, fog: false }));
      s.visible = false; s.renderOrder = 8; this.group.add(s); return s;
    });
  }
  /** packets отсортированы по t; posAt(t) - где был передатчик; cam - для постоянного видимого размера */
  update(t, packets, posAt, cam, station) {
    let k = 0;
    const LIFE = 0.9;
    if (packets && packets.length) {
      let lo = 0, hi = packets.length;
      while (lo < hi) { const m = (lo + hi) >> 1; if (packets[m].t < t - LIFE) lo = m + 1; else hi = m; }
      for (let i = lo; i < packets.length && packets[i].t <= t && k < this.pool.length - 1; i++) {
        const p = packets[i], age = (t - p.t) / LIFE, s = this.pool[k++];
        const at = posAt(p.t); if (!at) { k--; continue; }
        s.position.copy(at);
        const d = cam.position.distanceTo(at), sz = d * Math.tan((cam.fov * Math.PI) / 360) * (0.02 + 0.13 * age);
        s.scale.set(sz, sz, 1); s.material.opacity = 0.5 * (1 - age);
        s.material.color.set(p.ok ? 0x6ee7b7 : 0xfca5a5); s.visible = true;
        // принятый пакет: отклик у антенны станции
        if (p.ok && station && age > 0.25 && k < this.pool.length) {
          const r = this.pool[k++], a2 = (age - 0.25) / 0.75, d2 = cam.position.distanceTo(station), z2 = d2 * Math.tan((cam.fov * Math.PI) / 360) * (0.01 + 0.07 * a2);
          r.position.copy(station); r.scale.set(z2, z2, 1); r.material.opacity = 0.6 * (1 - a2); r.material.color.set(0x6ee7b7); r.visible = true;
        }
      }
    }
    for (; k < this.pool.length; k++) this.pool[k].visible = false;
  }
}
