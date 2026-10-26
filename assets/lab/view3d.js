// Живой 3D-вид схемы (Three.js): стол, макетка, платы и модули с рисунком из 2D-схемы, объемные детали
// (светодиоды светятся, сервопривод поворачивает качалку, моторы крутятся, робот ездит), провода дугами.
// Координаты: x и z = x и y схемы в пикселях (P = 2,54 мм), y - вверх. MM - пикселей в миллиметре.
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PARTS, P, MM, pinPos, LED_COLORS } from "./parts/index.js";
import { bands, BAND } from "./parts/core.js";

const BB_H = 8.5 * MM;            // высота макетки
const PCB = 1.6 * MM;
const HEADER = 8.5 * MM;          // гнездовой разъем Uno и Mega
// высота корпуса (мм) для деталей, нарисованных рисунком сверху
const SLAB = { board: 1.6, breadboard: 8.5, module: 3, dip: 4, lcd: 9, oled: 3, keypad: 0.8, neopixel: 1.6, sonar: 1.6, dht: 7, pir: 14,
  irsensor: 3, mic: 3, mq2: 3, joystick: 3, encoder: 3, relay: 3, meter: 24, battery9v: 17, stepper: 1.6, car: 0 };
const M = (o) => new THREE.MeshStandardMaterial(o);
const MAT = {
  black: M({ color: 0x1b1c1f, roughness: 0.6 }), metal: M({ color: 0xc9ced4, metalness: 0.85, roughness: 0.3 }),
  lead: M({ color: 0xb8bec6, metalness: 0.9, roughness: 0.35 }), gold: M({ color: 0xd4a72c, metalness: 0.9, roughness: 0.3 }),
  blue: M({ color: 0x2b5fb3, roughness: 0.5 }), white: M({ color: 0xf1f3f5, roughness: 0.5 }), side: M({ color: 0x23262b, roughness: 0.7 }),
};
const geomCache = new Map();
const cyl = (r, h, n = 20) => { const k = `c${r.toFixed(2)},${h.toFixed(2)},${n}`; if (!geomCache.has(k)) geomCache.set(k, new THREE.CylinderGeometry(r, r, h, n)); return geomCache.get(k); };
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
function mesh(geo, mat, x = 0, y = 0, z = 0, parent) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; if (parent) parent.add(m); return m; }
function rod(a, b, r, mat, parent) { // цилиндр от точки a до точки b
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b), len = va.distanceTo(vb);
  const m = mesh(cyl(r, len, 8), mat, 0, 0, 0, parent);
  m.position.copy(va).add(vb).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  return m;
}
const legs = (g, xs, h, z = 0) => xs.forEach((x) => rod([x, 0, z], [x, h, z], 0.25 * MM, MAT.lead, g));

let glowTex = null;
function glowSprite(color) {
  if (!glowTex) {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const ctx = c.getContext("2d"), gr = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gr; ctx.fillRect(0, 0, 64, 64); glowTex = new THREE.CanvasTexture(c);
  }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  s.scale.set(18 * MM, 18 * MM, 1);
  return s;
}

// ─────────────── объемные детали (координаты детали, до поворота) ───────────────
const BUILD = {
  led(g, part) {
    const c = LED_COLORS[part.props.color] || LED_COLORS.red;
    legs(g, [0, P], 4 * MM);
    const mat = new THREE.MeshPhysicalMaterial({ color: c.body, roughness: 0.15, transmission: 0.35, thickness: 2, transparent: true, opacity: 0.88, emissive: c.glow, emissiveIntensity: 0 });
    const x = P / 2, y0 = 4 * MM;
    mesh(cyl(2.9 * MM, 1 * MM), mat, x, y0 + 0.5 * MM, 0, g);
    mesh(cyl(2.5 * MM, 4.6 * MM), mat, x, y0 + 3.3 * MM, 0, g);
    mesh(new THREE.SphereGeometry(2.5 * MM, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat, x, y0 + 5.6 * MM, 0, g);
    const glow = glowSprite(c.glow); glow.position.set(x, y0 + 5 * MM, 0); g.add(glow);
    return (p) => { const b = p.burnt ? 0 : p.brightness || 0; mat.emissiveIntensity = b * 2.2; glow.material.opacity = Math.min(1, b * 1.1); };
  },
  rgbled(g) {
    legs(g, [0, P, 2 * P, 3 * P], 4 * MM);
    const mat = new THREE.MeshPhysicalMaterial({ color: 0xf1f3f5, roughness: 0.4, transparent: true, opacity: 0.9, emissive: 0x000000 });
    const x = 1.5 * P, y0 = 4 * MM;
    mesh(cyl(2.9 * MM, 1 * MM), mat, x, y0 + 0.5 * MM, 0, g);
    mesh(cyl(2.5 * MM, 4.6 * MM), mat, x, y0 + 3.3 * MM, 0, g);
    mesh(new THREE.SphereGeometry(2.5 * MM, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat, x, y0 + 5.6 * MM, 0, g);
    const glow = glowSprite(0xffffff); glow.position.set(x, y0 + 5 * MM, 0); g.add(glow);
    return (p) => {
      const ch = p.rgb || [0, 0, 0], b = p.brightness || 0, m = Math.max(1e-6, ...ch);
      const col = new THREE.Color(ch[0] / m, ch[1] / m, ch[2] / m);
      mat.emissive.copy(col).multiplyScalar(b * 2); glow.material.color.copy(col); glow.material.opacity = Math.min(1, b);
    };
  },
  resistor(g, part) {
    const h = 2.4 * MM, L = 4 * P;
    rod([0, 0, 0], [0, h, 0], 0.25 * MM, MAT.lead, g); rod([L, 0, 0], [L, h, 0], 0.25 * MM, MAT.lead, g); rod([0, h, 0], [L, h, 0], 0.25 * MM, MAT.lead, g);
    const body = mesh(cyl(1.25 * MM, 6.3 * MM, 16), M({ color: 0xd8c08f, roughness: 0.6 }), L / 2, h, 0, g); body.rotation.z = Math.PI / 2;
    const [d1, d2, m] = bands(part.props.r);
    [d1, d2, m].map((b) => BAND[b]).concat(["#c9a227"]).forEach((col, i) => {
      const r = mesh(cyl(1.3 * MM, 0.6 * MM, 16), M({ color: col, roughness: 0.5 }), L / 2 - 2.2 * MM + i * 1.2 * MM + (i === 3 ? 1.2 * MM : 0), h, 0, g); r.rotation.z = Math.PI / 2;
    });
  },
  diode(g) {
    const h = 2 * MM, L = 3 * P;
    rod([0, 0, 0], [0, h, 0], 0.25 * MM, MAT.lead, g); rod([L, 0, 0], [L, h, 0], 0.25 * MM, MAT.lead, g); rod([0, h, 0], [L, h, 0], 0.25 * MM, MAT.lead, g);
    const b = mesh(cyl(1.3 * MM, 5 * MM, 16), MAT.black, L / 2, h, 0, g); b.rotation.z = Math.PI / 2;
    const s = mesh(cyl(1.35 * MM, 0.8 * MM, 16), MAT.metal, L / 2 + 1.8 * MM, h, 0, g); s.rotation.z = Math.PI / 2;
  },
  capceramic(g) { legs(g, [0, P], 3 * MM); const d = mesh(cyl(2.6 * MM, 1.4 * MM, 20), M({ color: 0xe9a23b, roughness: 0.6 }), P / 2, 5.2 * MM, 0, g); d.rotation.x = Math.PI / 2; },
  capelectro(g) {
    legs(g, [0, P], 1.5 * MM);
    mesh(cyl(3.1 * MM, 11 * MM, 24), M({ color: 0x1f3a8a, roughness: 0.4 }), P / 2, 7 * MM, 0, g);
    mesh(cyl(3.0 * MM, 0.3 * MM, 24), MAT.metal, P / 2, 12.6 * MM, 0, g);
    mesh(box(1.2 * MM, 11 * MM, 0.6 * MM), M({ color: 0xc8d3f0 }), P / 2 + 2.4 * MM, 7 * MM, 2.5 * MM, g);
  },
  to92(g) {
    legs(g, [0, P, 2 * P], 3 * MM);
    const geo = new THREE.CylinderGeometry(2.4 * MM, 2.4 * MM, 4.5 * MM, 20, 1, false, -Math.PI / 2, Math.PI);
    const m = mesh(geo, MAT.black, P, 5.3 * MM, 0, g); m.rotation.y = Math.PI;
    mesh(box(4.8 * MM, 4.5 * MM, 0.2 * MM), MAT.black, P, 5.3 * MM, 0, g);
  },
  to220(g) {
    legs(g, [0, P, 2 * P], 4 * MM);
    mesh(box(10 * MM, 9 * MM, 4.4 * MM), MAT.black, P, 8.5 * MM, 0, g);
    mesh(box(10 * MM, 6.5 * MM, 1.3 * MM), MAT.metal, P, 16 * MM, -1.5 * MM, g);
  },
  ldr(g, part) {
    legs(g, [0, P], 3.5 * MM);
    const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d");
    x.fillStyle = "#f3e7cf"; x.fillRect(0, 0, 64, 64); x.strokeStyle = "#b7410e"; x.lineWidth = 3; x.beginPath();
    for (let i = 0; i < 6; i++) { x.moveTo(14, 12 + i * 8); x.lineTo(50, 12 + i * 8); } x.stroke();
    const top = M({ map: new THREE.CanvasTexture(c), roughness: 0.4 });
    mesh(cyl(2.6 * MM, 2 * MM), [M({ color: part.type === "thermistor" ? 0x2b2d31 : 0xe9dcc0 }), top, top], P / 2, 4.5 * MM, 0, g);
  },
  button(g) {
    legs(g, [0, 2 * P], 0.5 * MM);
    mesh(box(6 * MM, 3.4 * MM, 6 * MM), MAT.black, P, 1.7 * MM, 0, g);
    mesh(box(6.1 * MM, 0.3 * MM, 6.1 * MM), MAT.metal, P, 3.5 * MM, 0, g);
    const cap = mesh(cyl(1.75 * MM, 1.6 * MM), M({ color: 0x2b2d31, roughness: 0.5 }), P, 4.3 * MM, 0, g);
    return (p) => { cap.position.y = (p.pressed ? 3.8 : 4.4) * MM; };
  },
  switch(g) {
    legs(g, [0, P, 2 * P], 0.5 * MM);
    mesh(box(8.6 * MM, 3.6 * MM, 3.6 * MM), MAT.metal, P, 1.8 * MM, 0, g);
    const knob = mesh(box(2 * MM, 2.4 * MM, 1.6 * MM), MAT.black, P, 4.6 * MM, 0, g);
    return (p) => { knob.position.x = P + (p.props.on ? 1.5 : -1.5) * MM; };
  },
  pot(g) {
    legs(g, [0, P, 2 * P], 0.5 * MM);
    mesh(box(9.6 * MM, 5 * MM, 9.6 * MM), MAT.blue, P, 2.5 * MM, -3 * MM, g);
    const knob = new THREE.Group(); knob.position.set(P, 5 * MM, -3 * MM); g.add(knob);
    mesh(cyl(3 * MM, 7 * MM, 18), M({ color: 0xe9ecef, roughness: 0.4 }), 0, 3.5 * MM, 0, knob);
    mesh(box(0.8 * MM, 0.4 * MM, 2.6 * MM), MAT.black, 0, 7.05 * MM, -1.4 * MM, knob);
    return (p) => { knob.rotation.y = -((p.props.pos ?? 0.5) - 0.5) * 1.5 * Math.PI; };
  },
  buzzer(g, part) {
    if (part.type === "buzzer_mod") return null;
    legs(g, [0, 2 * P], 1 * MM);
    mesh(cyl(6 * MM, 8.5 * MM, 28), MAT.black, P, 5.2 * MM, 0, g);
    mesh(cyl(1 * MM, 0.2 * MM), M({ color: 0x050505 }), P, 9.5 * MM, 0, g);
  },
  servo(g) {
    const bx = -2.3 * P, by = -6.6 * P, bw = 6.6 * P, bh = 4.2 * P, H = 22 * MM;
    const blue = new THREE.MeshPhysicalMaterial({ color: 0x2f6fd6, roughness: 0.25, transmission: 0.2, transparent: true, opacity: 0.93 });
    mesh(box(bw, H, bh), blue, bx + bw / 2, H / 2, by + bh / 2, g);
    mesh(box(bw + 1.4 * P, 2 * MM, bh), blue, bx + bw / 2, H * 0.7, by + bh / 2, g); // ушки крепления
    const cx = bx + 1.25 * P, cz = by + 1.3 * P;
    mesh(cyl(13, 3 * MM), blue, cx, H + 1.5 * MM, cz, g);
    const horn = new THREE.Group(); horn.position.set(cx, H + 3.4 * MM, cz); g.add(horn);
    const wm = M({ color: 0xf8f9fa, roughness: 0.5 });
    mesh(box(7, 1.6 * MM, 32), wm, 0, 0, -14, horn); mesh(cyl(5.5, 1.6 * MM), wm, 0, 0, 0, horn); mesh(cyl(3.5, 1.6 * MM), wm, 0, 0, -29, horn);
    mesh(cyl(2.5, 2 * MM), MAT.metal, 0, 0.3 * MM, 0, horn);
    // кабель от выводов к корпусу
    [["#6b3e26", 0], ["#e03131", P], ["#f08c00", 2 * P]].forEach(([c, x]) => {
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(x, 1 * MM, 0), new THREE.Vector3(x, 3 * MM, -0.8 * P), new THREE.Vector3(P + (x - P) * 0.2, 6 * MM, by + bh + 2)]);
      mesh(new THREE.TubeGeometry(curve, 12, 0.6 * MM, 6), M({ color: c, roughness: 0.6 }), 0, 0, 0, g);
    });
    return (p) => { horn.rotation.y = -((90 - (p.angle ?? 90)) * Math.PI) / 180; };
  },
  motor(g) {
    legs(g, [0, 2 * P], 3 * MM);
    const r = 1.6 * P, body = new THREE.Group(); body.position.set(P, r, -2.75 * P); g.add(body);
    const can = mesh(cyl(r, 3.7 * P, 28), MAT.metal, 0, 0, 0, body); can.rotation.x = Math.PI / 2;
    const cap = mesh(cyl(r * 1.01, 0.6 * P, 28), M({ color: 0xd9480f }), 0, 0, 1.6 * P, body); cap.rotation.x = Math.PI / 2;
    const rot = new THREE.Group(); rot.position.set(0, 0, -1.85 * P - 2 * MM); body.add(rot);
    const sh = mesh(cyl(1 * MM, 4 * MM), MAT.metal, 0, 0, 0, rot); sh.rotation.x = Math.PI / 2;
    mesh(box(3 * MM, 14 * MM, 1.2 * MM), M({ color: 0xe03131 }), 0, 0, -1.5 * MM, rot);
    return (p) => { rot.rotation.z = -((p.$ang || 0) * Math.PI) / 180; };
  },
  fan(g, part) {
    legs(g, [0, P], 2 * MM);
    const [cx, cz] = part.$c || [0.5 * P, -4.4 * P];
    mesh(cyl(1.1 * P, 14 * MM, 24), MAT.metal, cx, 9 * MM, cz, g);
    const rot = new THREE.Group(); rot.position.set(cx, 17 * MM, cz); g.add(rot);
    const bm = new THREE.MeshPhysicalMaterial({ color: 0x4dabf7, roughness: 0.3, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
    for (let i = 0; i < 3; i++) { const b = mesh(box(9, 0.8 * MM, 2.6 * P), bm, 0, 0, -1.3 * P, null); const arm = new THREE.Group(); b.rotation.z = 0.35; arm.add(b); arm.rotation.y = (i * 2 * Math.PI) / 3; rot.add(arm); }
    mesh(cyl(5, 3 * MM), M({ color: 0x1c7ed6 }), 0, 0, 0, rot);
    return (p) => { rot.rotation.y = -((p.$ang || 0) * Math.PI) / 180; };
  },
  ttmotor(g, part) {
    legs(g, [0, P], 2 * MM);
    const H = 2.6 * P, yel = M({ color: 0xf2c94c, roughness: 0.6 });
    mesh(box(4.6 * P, H, 2.8 * P), yel, 1 * P, H / 2, -2.2 * P, g);
    const can = mesh(cyl(1.1 * P, 2.4 * P, 24), MAT.metal, 3.8 * P, H / 2, -2.2 * P, g); can.rotation.z = Math.PI / 2;
    const [cx, cz] = part.$c || [-0.2 * P, -2.2 * P];
    const wheel = new THREE.Group(); wheel.position.set(-1.3 * P - 0.9 * P, H / 2 + 0.6 * P, cz); g.add(wheel);
    const tire = mesh(cyl(2.5 * P, 1.5 * P, 32), MAT.black, 0, 0, 0, wheel); tire.rotation.z = Math.PI / 2;
    const hub = mesh(cyl(1.8 * P, 1.6 * P, 6), yel, 0, 0, 0, wheel); hub.rotation.z = Math.PI / 2;
    void cx;
    return (p) => { wheel.rotation.x = -((p.$ang || 0) * Math.PI) / 180; };
  },
  car(g) {
    const ax = 2.4 * P, az = -7.3 * P;           // середина оси колес: вокруг нее робот поворачивает
    const body = new THREE.Group(); body.position.set(ax, 0, az); g.add(body);
    const R = 2.3 * P;
    const plate = new THREE.MeshPhysicalMaterial({ color: 0xffd43b, roughness: 0.2, transmission: 0.3, transparent: true, opacity: 0.8 });
    const shape = new THREE.Shape(); const S = (x, z) => [x - ax, -(z - az)];
    shape.moveTo(...S(-3 * P, -1.5 * P)); shape.lineTo(...S(7 * P, -1.5 * P)); shape.lineTo(...S(8 * P, -4.5 * P)); shape.lineTo(...S(8 * P, -12.5 * P));
    shape.quadraticCurveTo(...S(8 * P, -15.5 * P), ...S(5 * P, -15.5 * P)); shape.lineTo(...S(-1 * P, -15.5 * P)); shape.quadraticCurveTo(...S(-4 * P, -15.5 * P), ...S(-4 * P, -12.5 * P));
    shape.lineTo(...S(-4 * P, -4.5 * P)); shape.lineTo(...S(-3 * P, -1.5 * P));
    const pg = new THREE.ExtrudeGeometry(shape, { depth: 3 * MM, bevelEnabled: false }); pg.rotateX(-Math.PI / 2);
    mesh(pg, plate, 0, R + 4 * MM, 0, body);
    const yel = M({ color: 0xf2c94c, roughness: 0.6 });
    const wheels = [];
    for (const [x, side] of [[-3.6 * P, -1], [8.4 * P, 1]]) {
      mesh(box(1.4 * P, 2.2 * P, 3 * P), yel, x - ax - side * 1.5 * P, R + 1.5 * MM, -1.5, body);
      const w = new THREE.Group(); w.position.set(x - ax, R, 0); body.add(w); wheels.push(w);
      const t = mesh(cyl(R, 1.6 * P, 32), MAT.black, 0, 0, 0, w); t.rotation.z = Math.PI / 2;
      const h = mesh(cyl(R * 0.7, 1.65 * P, 6), yel, 0, 0, 0, w); h.rotation.z = Math.PI / 2;
    }
    mesh(new THREE.SphereGeometry(0.9 * P, 16, 12), MAT.metal, 2 * P - ax, 0.9 * P, -14.4 * P - az, body);
    rod([2 * P - ax, 0.9 * P, -14.4 * P - az], [2 * P - ax, R + 4 * MM, -14.4 * P - az], 1.2 * MM, MAT.metal, body);
    // батарейный отсек сверху
    mesh(box(5 * P, 1.4 * P, 3 * P), MAT.black, 0, R + 4 * MM + 0.7 * P, -4.5 * P, body);
    let rl = 0, rr = 0, t0 = performance.now();
    const K = 1000 * MM; // пикселей в метре
    return (p) => {
      const now = performance.now(), dt = Math.min(0.1, (now - t0) / 1000); t0 = now;
      rl += ((p.wl || 0) / (0.0325)) * dt; rr += ((p.wr || 0) / 0.0325) * dt;
      wheels[0].rotation.x = -rl; wheels[1].rotation.x = -rr;
      const ps = p.pose || { x: 0, y: 0, a: 0 };
      body.position.set(ax - ps.y * K, 0, az - ps.x * K);
      body.rotation.y = ps.a;
    };
  },
};

// ─────────────── рисунок детали из 2D-схемы ───────────────
const ROTORS = ["$rot", "$horn", "$glow"];
function bodyOf(part) { return part.$g && part.$g.firstChild; }
async function rasterize(part, hide) {
  const body = bodyOf(part); if (!body || !body.isConnected) return null;
  let bb; try { bb = body.getBBox(); } catch (e) { return null; }
  if (!bb.width || !bb.height) return null;
  const pad = 3, x = bb.x - pad, y = bb.y - pad, w = bb.width + 2 * pad, h = bb.height + 2 * pad;
  const scale = Math.min(4, 2048 / Math.max(w, h));
  const W = Math.max(2, Math.round(w * scale)), H = Math.max(2, Math.round(h * scale));
  const clone = body.cloneNode(true);
  const kids = [...body.children];
  hide.forEach((elx) => { const i = kids.indexOf(elx); if (i >= 0) clone.children[i].setAttribute("visibility", "hidden"); });
  const defs = body.ownerSVGElement.querySelector("defs");
  const src = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="${x} ${y} ${w} ${h}">${defs ? defs.outerHTML : ""}${new XMLSerializer().serializeToString(clone)}</svg>`;
  const img = new Image();
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(src);
  try { await img.decode(); } catch (e) { return null; }
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  cv.getContext("2d").drawImage(img, 0, 0, W, H);
  return { cv, x, y, w, h };
}

export class View3D {
  constructor(host) {
    this.host = host;
    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap;
    r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    host.append(r.domElement);
    const s = this.scene = new THREE.Scene();
    s.background = new THREE.Color(0xdfe3e8);
    this.camera = new THREE.PerspectiveCamera(35, 1, 5, 40000);
    this.camera.position.set(200, 900, 900);
    this.controls = new OrbitControls(this.camera, r.domElement);
    this.controls.enableDamping = true; this.controls.maxPolarAngle = Math.PI * 0.49; this.controls.screenSpacePanning = true;
    s.add(new THREE.HemisphereLight(0xffffff, 0x8a7f72, 1.1));
    const sun = this.sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 1.5;
    s.add(sun, sun.target);
    // стол
    const c = document.createElement("canvas"); c.width = c.height = 512; const x = c.getContext("2d");
    x.fillStyle = "#c9a77c"; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 160; i++) { x.strokeStyle = `rgba(${90 + Math.random() * 40},${60 + Math.random() * 30},30,${0.05 + Math.random() * 0.08})`; x.lineWidth = 1 + Math.random() * 3; x.beginPath(); const yy = Math.random() * 512; x.moveTo(0, yy); x.bezierCurveTo(170, yy + Math.random() * 20 - 10, 340, yy + Math.random() * 20 - 10, 512, yy); x.stroke(); }
    const wood = new THREE.CanvasTexture(c); wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(12, 12); wood.colorSpace = THREE.SRGBColorSpace;
    const desk = new THREE.Mesh(new THREE.PlaneGeometry(30000, 30000), M({ map: wood, roughness: 0.8 }));
    desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; s.add(desk);
    // коврик
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), M({ color: 0x2f3a35, roughness: 0.95 }));
    mat.rotation.x = -Math.PI / 2; mat.position.y = 0.3; mat.receiveShadow = true; s.add(mat); this.mat = mat;
    this.trail = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xe03131 }));
    this.trail.frustumCulled = false; s.add(this.trail);
    this.items = new Map(); this.wireGroup = new THREE.Group(); s.add(this.wireGroup);
    this.parts = []; this.rr = 0; this.busy = 0;
    r.setAnimationLoop(() => this.frame());
    this.resize();
  }

  visible() { return this.host.offsetParent !== null && !this.host.hidden; }
  resize() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }

  // Схема изменилась: пересобрать объекты деталей (неизменные остаются) и провода
  sync(parts, wires, pinXY) {
    this.parts = parts; this.pinXY = pinXY;
    const holes = new Set();
    for (const b of parts.filter((p) => /^breadboard/.test(p.type))) for (const pin of PARTS[b.type].pins()) { const q = pinPos(b, pin); holes.add(`${q.x},${q.y}`); }
    const keep = new Set();
    for (const p of parts) {
      const def = PARTS[p.type];
      const onBoard = !def.board && !/^breadboard/.test(p.type) && def.pins().some((pin) => { const q = pinPos(p, pin); return holes.has(`${q.x},${q.y}`); });
      const sig = JSON.stringify([p.type, p.props, p.rot || 0]);
      let it = this.items.get(p.id);
      if (it && it.sig !== sig) { this.scene.remove(it.g); this.items.delete(p.id); it = null; }
      if (!it) it = this.makeItem(p, def, sig);
      it.base = onBoard ? BB_H : def.board ? 2 * MM : 0;
      it.part = p;
      it.g.position.set(p.x, it.base, p.y);
      it.g.rotation.y = -((p.rot || 0) * Math.PI) / 180;
      keep.add(p.id);
    }
    for (const [id, it] of this.items) if (!keep.has(id)) { this.scene.remove(it.g); this.items.delete(id); }
    this.buildWires(wires);
    this.layoutMat();
    if (!this.fitted && parts.length && this.host.clientWidth) { this.fitted = true; this.resize(); this.fit(); }
  }

  makeItem(p, def, sig) {
    const g = new THREE.Group(); this.scene.add(g);
    const it = { g, sig, kind: def.kind3d || "module", tex: null, last: "", t: 0, rotors: [] };
    const build = BUILD[it.kind] || (p.type === "buzzer" ? BUILD.buzzer : null);
    if (build) it.upd = build(g, p);
    if (!build || it.upd === null) { it.slab = true; it.upd = null; }
    if (it.kind === "stepper") it.slab = true;
    if (it.kind === "board" && (p.type === "uno" || p.type === "mega")) this.headers(g, p, def);
    this.items.set(p.id, it);
    return it;
  }

  headers(g, p, def) { // гнездовые разъемы: черные колодки над выводами
    const mat = MAT.black, hole = M({ color: 0x050505 });
    for (const pin of def.pins()) {
      if (pin.hole) continue;
      mesh(box(P, HEADER, P), mat, pin.x, PCB + HEADER / 2, pin.y, g);
      mesh(box(1 * MM, 0.2, 1 * MM), hole, pin.x, PCB + HEADER + 0.1, pin.y, g);
    }
  }

  // высота конца провода над столом
  pinHeight(key) {
    const [id] = key.split(/\.(.+)/);
    const it = this.items.get(id); if (!it) return 0;
    const p = it.part, def = PARTS[p.type];
    if (/^breadboard/.test(p.type)) return BB_H;
    if (p.type === "uno" || p.type === "mega") return it.base + PCB + HEADER;
    if (def.board) return it.base + PCB + 1 * MM;
    if (it.slab) return it.base + 2.5 * MM;
    return it.base + 0.5 * MM;
  }

  buildWires(wires) {
    for (const m of this.wireGroup.children) { m.geometry.dispose(); }
    this.wireGroup.clear();
    for (const w of wires) {
      const a = this.pinXY(w.a), b = this.pinXY(w.b); if (!a || !b) continue;
      const ha = this.pinHeight(w.a), hb = this.pinHeight(w.b);
      const pts2 = [a, ...(w.pts || []), b];
      let len = 0; for (let i = 1; i < pts2.length; i++) len += Math.hypot(pts2[i].x - pts2[i - 1].x, pts2[i].y - pts2[i - 1].y);
      const top = Math.max(ha, hb) + 5 * MM + Math.min(25 * MM, len * 0.08);
      const pts = [new THREE.Vector3(a.x, ha, a.y), new THREE.Vector3(a.x, ha + 3 * MM, a.y)];
      if (pts2.length > 2) for (const q of w.pts) pts.push(new THREE.Vector3(q.x, top, q.y));
      else pts.push(new THREE.Vector3((a.x + b.x) / 2, top, (a.y + b.y) / 2));
      pts.push(new THREE.Vector3(b.x, hb + 3 * MM, b.y), new THREE.Vector3(b.x, hb, b.y));
      const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(16, Math.round(len / 6)), 0.65 * MM, 8), M({ color: w.color, roughness: 0.45 }));
      tube.castShadow = true; this.wireGroup.add(tube);
    }
  }

  layoutMat() {
    const b = this.bounds(); if (!b) return;
    const pad = 6 * P;
    this.mat.scale.set(b.x1 - b.x0 + 2 * pad, b.z1 - b.z0 + 2 * pad, 1);
    this.mat.position.set((b.x0 + b.x1) / 2, 0.3, (b.z0 + b.z1) / 2);
    const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2, R = Math.max(b.x1 - b.x0, b.z1 - b.z0) + 600;
    this.sun.position.set(cx - R * 0.4, R * 1.2, cz + R * 0.7); this.sun.target.position.set(cx, 0, cz);
    const sc = this.sun.shadow.camera; sc.left = -R; sc.right = R; sc.top = R; sc.bottom = -R; sc.near = 10; sc.far = R * 4; sc.updateProjectionMatrix();
  }

  bounds() {
    if (!this.parts.length) return null;
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const p of this.parts) {
      const body = bodyOf(p); let bb = null;
      try { bb = body && body.getBBox(); } catch (e) { bb = null; }
      const xs = bb && bb.width ? [bb.x, bb.x + bb.width] : [0, 2 * P], ys = bb && bb.width ? [bb.y, bb.y + bb.height] : [-2 * P, 0];
      const a = ((p.rot || 0) * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
      for (const x of xs) for (const y of ys) { const X = p.x + x * c - y * s, Z = p.y + x * s + y * c; x0 = Math.min(x0, X); x1 = Math.max(x1, X); z0 = Math.min(z0, Z); z1 = Math.max(z1, Z); }
    }
    return { x0, x1, z0, z1 };
  }

  fit() {
    const b = this.bounds(); if (!b) return;
    const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2;
    const w = Math.max(200, b.x1 - b.x0), d = Math.max(200, b.z1 - b.z0);
    const vf = (this.camera.fov * Math.PI) / 360, hf = Math.atan(Math.tan(vf) * this.camera.aspect);
    // камера под углом около 50 градусов: глубина схемы видна укороченной
    const dist = Math.max(w / 2 / Math.tan(hf), d / 2 / Math.tan(vf)) * 1.2 + 20 * MM;
    this.controls.target.set(cx, 0, cz);
    this.camera.position.set(cx, dist * 0.78, cz + dist * 0.63);
    this.controls.update();
  }
  zoom(f) {
    const t = this.controls.target, c = this.camera.position;
    c.sub(t).multiplyScalar(1 / f).add(t); this.controls.update();
  }

  update(st, parts) { this.st = st; if (parts) this.parts = parts; }

  // рисунок детали на верхней грани корпуса; обновляется, когда меняется 2D-рисунок (экраны, светодиоды платы)
  async refreshTex(it) {
    const p = it.part, body = bodyOf(p); if (!body) return;
    const rot = ROTORS.map((k) => p[k]).filter((e) => e && e.parentNode === body);
    let sig = body.innerHTML;
    for (const r of rot) sig = sig.replace(r.outerHTML, "");
    if (sig === it.last) return;
    it.last = sig; this.busy++;
    try {
      const r = await rasterize(p, rot); if (!r) { it.last = ""; return; }
      const t = new THREE.CanvasTexture(r.cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
      const h = (SLAB[it.kind] ?? (PARTS[p.type].h3 || 3)) * MM;
      if (!it.slabMesh) {
        const top = new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.35, roughness: 0.55 });
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), top);
        plane.rotation.x = -Math.PI / 2; plane.receiveShadow = true; plane.castShadow = h < 1;
        it.g.add(plane); it.slabMesh = plane;
        if (h > 0.5) {
          const side = it.kind === "breadboard" ? M({ color: 0xece7dc, roughness: 0.8 }) : it.kind === "battery9v" ? M({ color: 0x1f2124 }) : MAT.side;
          const inset = it.kind === "breadboard" ? 0 : 4;
          const sideBox = mesh(box(Math.max(1, r.w - 2 * inset), h - 0.4, Math.max(1, r.h - 2 * inset)), side, 0, 0, 0, it.g);
          sideBox.visible = it.kind !== "car"; it.sideBox = sideBox;
        }
      } else { it.slabMesh.material.map.dispose(); it.slabMesh.material.map = t; it.slabMesh.material.needsUpdate = true; }
      it.slabMesh.scale.set(r.w, r.h, 1);
      it.slabMesh.position.set(r.x + r.w / 2, h + 0.2, r.y + r.h / 2);
      if (it.sideBox) { it.sideBox.position.set(r.x + r.w / 2, (h - 0.4) / 2, r.y + r.h / 2); }
      // вращающиеся части (качалка, ротор) отдельными пластинками
      for (const el of rot) if (!it.rotors.some((q) => q.el === el)) await this.addRotor(it, el, h);
    } finally { this.busy--; }
  }

  async addRotor(it, el, h) {
    const tr = el.getAttribute("transform"); el.removeAttribute("transform");
    let r = null;
    try {
      const bb = el.getBBox();
      const W = Math.round((bb.width + 4) * 3), H = Math.round((bb.height + 4) * 3);
      const defs = el.ownerSVGElement.querySelector("defs");
      const src = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="${bb.x - 2} ${bb.y - 2} ${bb.width + 4} ${bb.height + 4}">${defs ? defs.outerHTML : ""}${new XMLSerializer().serializeToString(el)}</svg>`;
      const img = new Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(src); await img.decode();
      const cv = document.createElement("canvas"); cv.width = W; cv.height = H; cv.getContext("2d").drawImage(img, 0, 0);
      r = { cv, x: bb.x - 2, y: bb.y - 2, w: bb.width + 4, h: bb.height + 4 };
    } catch (e) { r = null; } finally { if (tr) el.setAttribute("transform", tr); }
    if (!r) return;
    const t = new THREE.CanvasTexture(r.cv); t.colorSpace = THREE.SRGBColorSpace;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(r.w, r.h), new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.35 }));
    plane.rotation.x = -Math.PI / 2; plane.position.set(r.x + r.w / 2, 0, r.y + r.h / 2);
    const piv = new THREE.Group(); piv.add(plane); piv.position.y = h + 2 * MM; it.g.add(piv);
    it.rotors.push({ el, piv });
  }

  frame() {
    if (!this.visible()) return;
    this.controls.update();
    // объемные детали
    for (const it of this.items.values()) {
      const p = it.part; if (!p) continue;
      if (it.upd) it.upd(p);
      for (const r of it.rotors) { // повторяем transform 2D-группы: translate(cx cy) rotate(a)
        const m = /translate\(([-\d.e]+)[ ,]+([-\d.e]+)\)\s*rotate\(([-\d.e]+)/.exec(r.el.getAttribute("transform") || "");
        if (m) { r.piv.position.x = +m[1]; r.piv.position.z = +m[2]; r.piv.rotation.y = -(+m[3] * Math.PI) / 180; }
      }
    }
    // рисунки деталей: по кругу, не больше двух одновременно
    const list = [...this.items.values()].filter((it) => it.slab);
    if (list.length && this.busy < 2) {
      const now = performance.now();
      for (let k = 0; k < Math.min(3, list.length); k++) {
        const it = list[this.rr++ % list.length];
        if (now - it.t > 120) { it.t = now; this.refreshTex(it); }
      }
    }
    // след робота
    const car = this.parts.find((p) => p.type === "car" && p.trail && p.trail.length > 1);
    if (car) {
      const K = 1000 * MM, ax = car.x + 2.4 * P, az = car.y - 7.3 * P;
      const pts = car.trail.map(([x, y]) => new THREE.Vector3(ax - y * K, 0.8, az - x * K));
      this.trail.geometry.dispose(); this.trail.geometry = new THREE.BufferGeometry().setFromPoints(pts); this.trail.visible = true;
    } else this.trail.visible = false;
    this.renderer.render(this.scene, this.camera);
  }
}
