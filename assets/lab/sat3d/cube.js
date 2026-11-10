// 3D-модель CubeSat 1U (куб 100 мм): каркас с рельсами по выбранному варианту, стек плат на стойках как в PC/104,
// солнечные панели на гранях, антенна, объектив камеры снизу, рым для подвеса к аэростату.
// Начало координат - центр куба, ось +Y вверх. Интерфейс тот же, что у buildCan (для конструктора).
import * as THREE from "three";
import { canvasTex, std, TAU } from "./util.js";
import { METAL, at, box, cyl, mm, moduleOf } from "./modules.js";

export const CUBE = 0.1;
const S = 100, RAIL = 8.5, BOARD = 86, STEP = 0.021;

function solarTex() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = "#0b1533"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++) {
      const x = 10 + i * 120, y = 8 + j * 61, gr = g.createLinearGradient(x, y, x + 116, y + 56);
      gr.addColorStop(0, "#1b2f73"); gr.addColorStop(1, "#122056"); g.fillStyle = gr;
      g.beginPath(); g.moveTo(x + 8, y); g.lineTo(x + 108, y); g.lineTo(x + 116, y + 8); g.lineTo(x + 116, y + 48); g.lineTo(x + 108, y + 56); g.lineTo(x + 8, y + 56); g.lineTo(x, y + 48); g.lineTo(x, y + 8); g.closePath(); g.fill();
      g.strokeStyle = "rgba(190,210,255,.5)"; g.lineWidth = 1;
      for (let k = 1; k < 8; k++) { g.beginPath(); g.moveTo(x + k * 14.5, y + 2); g.lineTo(x + k * 14.5, y + 54); g.stroke(); }
      g.strokeStyle = "rgba(220,230,255,.8)"; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 2, y + 28); g.lineTo(x + 114, y + 28); g.stroke();
    }
  }, { aniso: 8 });
}
function wallTex(kind) {
  return canvasTex(256, 256, (g, w, h) => {
    if (kind === "frame-pcb") {
      g.fillStyle = "#17603f"; g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(230,200,90,.55)"; g.lineWidth = 2;
      for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(20 + i * 26, 30); g.lineTo(20 + i * 26, 90 + ((i * 37) % 60)); g.lineTo(34 + i * 26, 110 + ((i * 37) % 60)); g.stroke(); }
      g.fillStyle = "rgba(230,200,90,.8)"; for (const [x, y] of [[14, 14], [w - 14, 14], [14, h - 14], [w - 14, h - 14]]) { g.beginPath(); g.arc(x, y, 6, 0, TAU); g.fill(); }
      g.fillStyle = "#e8f5ee"; g.font = "800 24px Inter, system-ui, sans-serif"; g.textAlign = "center"; g.fillText("USTEM CubeSat 1U", w / 2, h - 44);
    } else {
      g.fillStyle = "#e6ebf1"; g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(0,0,0,.05)"; for (let y = 0; y < h; y += 3) g.fillRect(0, y, w, 1);
      g.fillStyle = "#ff6a1a"; g.fillRect(0, h - 60, w, 14);
      g.fillStyle = "#10213f"; g.font = "800 28px Inter, system-ui, sans-serif"; g.textAlign = "center"; g.fillText("USTEM", w / 2, h - 18);
    }
  }, { aniso: 8 });
}

/** parts - детали из каталога (items(cfg)) */
export function buildCube(parts, { detail = true } = {}) {
  const root = new THREE.Group(), shellG = new THREE.Group(), stackG = new THREE.Group();
  root.add(stackG, shellG);
  const frame = parts.find((p) => p.cat === "frame"), kind = frame ? frame.id : "none";
  const h2 = S / 2, fade = [];           // материалы стенок, которые становятся прозрачными в разрезе

  // каркас: четыре рельса, верхняя и нижняя рамки
  const railMat = kind === "frame-alu" ? std(0x9aa5b1, { metalness: 0.85, roughness: 0.32 }) : kind === "frame-pcb" ? std(0x2b2f36, { metalness: 0.6, roughness: 0.45 }) : std(0xd5dbe3, { roughness: 0.6 });
  if (kind !== "none") {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      shellG.add(at(new THREE.Mesh(new THREE.BoxGeometry(mm(RAIL), mm(S + 13), mm(RAIL)), railMat), sx * (h2 - RAIL / 2), 0, sz * (h2 - RAIL / 2)));
    }
    for (const sy of [-1, 1]) for (const [w, d, x, z] of [[S - 2 * RAIL, 5, 0, h2 - 2.5], [S - 2 * RAIL, 5, 0, -h2 + 2.5], [5, S - 2 * RAIL, h2 - 2.5, 0], [5, S - 2 * RAIL, -h2 + 2.5, 0]]) {
      shellG.add(at(new THREE.Mesh(new THREE.BoxGeometry(mm(w), mm(4), mm(d)), railMat), x, sy * (h2 - 2), z));
    }
  } else {
    // каркас не выбран: контур куба пунктиром
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(CUBE, CUBE, CUBE)), new THREE.LineDashedMaterial({ color: 0x64748b, dashSize: 0.005, gapSize: 0.004 }));
    e.computeLineDistances(); shellG.add(e);
  }
  // стенки: печатный каркас - с окнами, стенки-платы - сплошные, алюминий - перекладины
  const solar = Math.min(4, parts.filter((p) => p.solar).length);
  const faces = [[0, 1], [1, 0], [0, -1], [-1, 0]];                   // нормали граней (x, z)
  const solarMat = solar ? std(0xffffff, { map: solarTex(), roughness: 0.25, metalness: 0.3, side: THREE.DoubleSide }) : null;
  if (solarMat) fade.push([solarMat, 1]);
  faces.forEach(([nx, nz], i) => {
    const g = new THREE.Group(); g.position.set(mm(nx * (h2 - 0.8)), 0, mm(nz * (h2 - 0.8))); g.rotation.y = Math.atan2(nx, nz); shellG.add(g);
    const W = S - 2 * RAIL - 1;
    if (i < solar) { g.add(new THREE.Mesh(new THREE.BoxGeometry(mm(W), mm(S - 10), mm(1.6)), solarMat)); return; }
    if (kind === "frame-pcb") {
      const m = std(0xffffff, { map: wallTex(kind), roughness: 0.5, side: THREE.DoubleSide }); fade.push([m, 1]);
      g.add(new THREE.Mesh(new THREE.BoxGeometry(mm(W), mm(S - 10), mm(1.6)), m));
    } else if (kind === "frame-print") {
      const m = std(0xffffff, { map: wallTex(kind), roughness: 0.6, side: THREE.DoubleSide }); fade.push([m, 1]);
      // рамка с окном: нижняя полоса с надписью и тонкие перемычки
      g.add(at(new THREE.Mesh(new THREE.BoxGeometry(mm(W), mm(24), mm(2)), m), 0, -h2 + 17, 0));
      g.add(at(new THREE.Mesh(new THREE.BoxGeometry(mm(W), mm(6), mm(2)), railMat), 0, h2 - 9, 0));
    } else if (kind === "frame-alu") {
      for (const s of [-1, 1]) { const bar = at(new THREE.Mesh(new THREE.BoxGeometry(mm(4), mm(118), mm(2)), railMat), 0, 0, 0); bar.rotation.z = s * 0.72; g.add(bar); }
    }
  });
  // верхняя крышка с рымом для подвеса, нижняя - с объективом камеры
  const lidMat = std(kind === "frame-pcb" ? 0x17603f : kind === "frame-alu" ? 0xaab4bf : 0xdfe4ea, { roughness: 0.5, metalness: kind === "frame-alu" ? 0.7 : 0, side: THREE.DoubleSide });
  fade.push([lidMat, 1]);
  if (kind !== "none") {
    shellG.add(at(new THREE.Mesh(new THREE.BoxGeometry(mm(S - 2 * RAIL), mm(1.6), mm(S - 2 * RAIL)), lidMat), 0, h2 - 0.8, 0));
    stackG.add(at(new THREE.Mesh(new THREE.BoxGeometry(mm(S - 2 * RAIL), mm(1.6), mm(S - 2 * RAIL)), std(lidMat.color.getHex(), { roughness: 0.5 })), 0, -h2 + 0.8, 0));
  }
  const eye = new THREE.Mesh(new THREE.TorusGeometry(0.006, 0.0014, 8, 20), std(0xd1d5db, METAL)); eye.position.y = mm(h2 + 6); shellG.add(eye);
  if (parts.some((p) => p.id === "camera")) {
    stackG.add(at(cyl(7, 5, 0x111827, { roughness: 0.3 }), 0, -h2 - 2.5, 0), at(cyl(4.6, 0.6, 0x3b82f6, { roughness: 0.05, metalness: 0.6 }), 0, -h2 - 5.2, 0));
  }

  // стек плат на четырех стойках
  const boards = [], stack = parts.filter((p) => p.h);
  let y = mm(-h2 + 5);
  const total = stack.reduce((s, p) => s + mm(p.h + 2), 0), rodTop = Math.max(mm(h2 - 6), y + total);
  const brass = std(0xc9a227, { metalness: 0.8, roughness: 0.35 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.0016, 0.0016, rodTop - y, 8), brass);
    rod.position.set(mm(sx * 37), (rodTop + y) / 2, mm(sz * 37)); stackG.add(rod);
  }
  for (const p of stack) {
    const g = new THREE.Group();
    const small = p.battery ? 70 : BOARD - 4;
    g.add(at(box(small, 1.6, small, new THREE.Color(p.color).multiplyScalar(p.battery ? 0.35 : 0.75).getHex(), { roughness: 0.55 }), 0, 0.8, 0));
    if (!p.battery) g.add(at(box(52, 3.2, 5, 0x111827, { roughness: 0.5 }), 0, 3.2, -36));          // разъем стека по краю платы
    if (detail) {
      const id = p.id === "bat-18650" ? "bat-18650h" : p.id;
      const m = moduleOf({ ...p, id }); m.position.y = mm(1.6); if (!p.battery) m.position.z = mm(4); g.add(m);
    } else g.add(at(box(small * 0.7, Math.max(1, p.h - 1.6), small * 0.7, new THREE.Color(p.color).getHex()), 0, 1.6 + (p.h - 1.6) / 2, 0));
    g.position.y = y;
    const anchor = new THREE.Object3D(); anchor.position.set(mm(BOARD / 2), mm(p.h / 2), 0); g.add(anchor);
    stackG.add(g); boards.push({ part: p, group: g, y0: y, h: mm(p.h), anchor });
    y += mm(p.h + 2);
  }
  // антенна
  const ant = parts.find((p) => p.cat === "antenna");
  let antTop = null;
  if (ant) {
    if (ant.id === "ant-whip433") {
      const pts = [new THREE.Vector3(0.04, 0.05, 0.04), new THREE.Vector3(0.043, 0.11, 0.043), new THREE.Vector3(0.052, 0.17, 0.05), new THREE.Vector3(0.066, 0.218, 0.058)];
      shellG.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.0012, 6), std(0xcfd4da, METAL)));
      shellG.add(at(cyl(3, 6, 0xd4a017, METAL), 40, h2 + 3, 40)); antTop = pts[3];
    } else if (ant.id === "ant-spring433") {
      const pts = []; for (let i = 0; i <= 120; i++) { const k = i / 120; pts.push(new THREE.Vector3(0.03 + Math.cos(k * 12 * TAU) * 0.004, 0.012 + k * 0.026, 0.03 + Math.sin(k * 12 * TAU) * 0.004)); }
      stackG.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 240, 0.0005, 5), std(0xd1d5db, METAL)));
    } else shellG.add(at(cyl(3.2, 8, 0xd4a017, METAL), 36, h2 + 4, 36), at(cyl(4.2, 50, 0x111827, { roughness: 0.6 }), 36, h2 + 33, 36));
  }
  const overflow = y > mm(h2 - 2);
  return { group: root, shellG, stackG, boards, H: CUBE, R: 0.07, step: STEP, overflow, kind, stackTop: y, antTop,
    setXray(on) { for (const [m, base] of fade) { m.transparent = on; m.opacity = on ? 0.14 : base; m.depthWrite = !on; m.needsUpdate = true; } },
    setExplode(k) {
      shellG.position.set(-0.16 * k, 0.02 * k, 0);
      boards.forEach((b, i) => { b.group.position.y = b.y0 + k * (i + 0.5) * STEP; });
    } };
}
