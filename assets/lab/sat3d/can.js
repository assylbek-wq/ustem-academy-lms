// 3D-модель CanSat (банка 66 x 115 мм): корпус по выбранному варианту, стек плат-этажей на стойках,
// модули похожи на настоящие (Pico, ESP32-CAM, GPS с керамической антенной, LiPo, 18650, LoRa, microSD),
// антенна, рым-болт для парашюта. Начало координат - центр банки, ось +Y вверх.
import * as THREE from "three";
import { canvasTex, std, TAU } from "./util.js";
import { METAL, mm, moduleOf } from "./modules.js";

export const CAN_R = 0.033, CAN_H = 0.115;
const BOARD_R = 0.029, PCB_T = 0.0016;

function shellTexture(color) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = color; g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(0,0,0,.05)"; for (let y = 0; y < h; y += 3) g.fillRect(0, y, w, 1);   // слои 3D-печати
    g.fillStyle = "#ff6a1a"; g.fillRect(0, h * 0.12, w, h * 0.06);
    g.fillStyle = "#10213f"; g.font = "800 26px Inter, system-ui, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("CanSat", w * 0.25, h * 0.52); g.fillText("USTEM", w * 0.75, h * 0.52);
  }, { aniso: 8 });
}

/**
 * parts - детали из каталога (items(cfg)). Возвращает группу, список плат с опорными точками для подписей
 * и управление видом: setXray (прозрачный корпус), setExplode (0..1, разнесенный вид).
 */
export function buildCan(parts, { detail = true } = {}) {
  const root = new THREE.Group();
  const shellG = new THREE.Group(), stackG = new THREE.Group();
  root.add(stackG, shellG);
  const body = parts.find((p) => p.cat === "body");
  const kind = body ? body.id : "none";
  const H = CAN_H, R = CAN_R;

  // корпус
  let wallMat = null;
  const capMat = std(kind === "body-frame" ? 0x14532d : kind === "body-petg" ? 0xb6c2d1 : 0xcfd6df, { roughness: 0.55 });
  if (kind === "body-pla" || kind === "body-petg") {
    const petg = kind === "body-petg";
    wallMat = std(0xffffff, { map: shellTexture(petg ? "#c9d6e6" : "#e8ecf1"), roughness: petg ? 0.2 : 0.55, side: THREE.DoubleSide,
      transparent: petg, opacity: petg ? 0.55 : 1, depthWrite: !petg });
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H - 0.006, 48, 1, true), wallMat);
    shellG.add(wall);
  } else if (kind === "none") {
    // корпус не выбран: контур банки пунктиром
    const ringGeo = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 65 }, (_, i) => new THREE.Vector3(Math.cos((i / 64) * TAU) * R, 0, Math.sin((i / 64) * TAU) * R)));
    const lm = new THREE.LineDashedMaterial({ color: 0x64748b, dashSize: 0.004, gapSize: 0.004 });
    for (const y of [-H / 2, H / 2]) { const l = new THREE.Line(ringGeo, lm); l.computeLineDistances(); l.position.y = y; shellG.add(l); }
  }
  const capTop = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.003, 48), capMat); capTop.position.y = H / 2 - 0.0015;
  const capBot = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.003, 48), capMat); capBot.position.y = -H / 2 + 0.0015;
  if (kind !== "none") { shellG.add(capTop); stackG.add(capBot); }
  // рым-болт для стропы парашюта
  const eye = new THREE.Mesh(new THREE.TorusGeometry(0.005, 0.0012, 8, 20), std(0xd1d5db, METAL));
  eye.position.y = H / 2 + 0.005; shellG.add(eye);
  // уложенный парашют CanSat под крышкой не рисуем: в полете он раскрыт (chute.js)

  // стойки и платы-этажи
  const boards = [];
  const stack = parts.filter((p) => p.h);
  let y = -H / 2 + 0.004;
  const rodTop = Math.max(H / 2 - 0.004, y + stack.reduce((s, p) => s + mm(p.h + 2), 0));
  const brass = std(0xc9a227, { metalness: 0.8, roughness: 0.35 });
  if (detail || kind === "body-frame") {
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.0015, 0.0015, rodTop - (-H / 2 + 0.003), 8), brass);
      rod.position.set(Math.cos(a) * 0.026, (rodTop + (-H / 2 + 0.003)) / 2, Math.sin(a) * 0.026);
      stackG.add(rod);
    }
  }
  for (const p of stack) {
    const g = new THREE.Group();
    const pcb = new THREE.Mesh(new THREE.CylinderGeometry(BOARD_R, BOARD_R, PCB_T, 40), std(new THREE.Color(p.color).multiplyScalar(0.8), { roughness: 0.55 }));
    pcb.position.y = PCB_T / 2; g.add(pcb);
    if (detail) { const m = moduleOf(p); m.position.y = PCB_T; g.add(m); }
    else { const blk = new THREE.Mesh(new THREE.CylinderGeometry(BOARD_R * 0.8, BOARD_R * 0.8, Math.max(0.001, mm(p.h) - PCB_T), 16), std(p.color)); blk.position.y = PCB_T + (mm(p.h) - PCB_T) / 2; g.add(blk); }
    g.position.y = y;
    const anchor = new THREE.Object3D(); anchor.position.set(BOARD_R, mm(p.h) / 2, 0); g.add(anchor);
    stackG.add(g);
    boards.push({ part: p, group: g, y0: y, h: mm(p.h), anchor });
    y += mm(p.h + 2);
  }
  // DS18B20 на выносе: зонд снаружи у дна
  if (parts.some((p) => p.id === "ds18b20")) {
    const probe = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.03, 12), std(0xcbd5e1, METAL));
    probe.position.set(R + 0.004, -H / 2 + 0.02, 0); stackG.add(probe);
  }
  // антенна
  const ant = parts.find((p) => p.cat === "antenna");
  let antTop = null;
  if (ant) {
    if (ant.id === "ant-whip433") {
      const pts = [new THREE.Vector3(0.018, H / 2, 0), new THREE.Vector3(0.02, H / 2 + 0.06, 0.002), new THREE.Vector3(0.03, H / 2 + 0.12, 0.004), new THREE.Vector3(0.046, H / 2 + 0.168, 0.006)];
      const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.0011, 6), std(0x111827, { roughness: 0.5 }));
      shellG.add(m); antTop = pts[3];
    } else if (ant.id === "ant-spring433") {
      const pts = []; for (let i = 0; i <= 120; i++) { const k = i / 120; pts.push(new THREE.Vector3(0.02 + Math.cos(k * 12 * TAU) * 0.004, H / 2 - 0.03 + k * 0.024, Math.sin(k * 12 * TAU) * 0.004)); }
      stackG.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 240, 0.0005, 5), std(0xd1d5db, METAL)));
    } else {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0032, 0.008, 12), std(0xd4a017, METAL)); base.position.set(0.018, H / 2 + 0.004, 0);
      const stub = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.0045, 0.05, 12), std(0x111827, { roughness: 0.6 })); stub.position.set(0.018, H / 2 + 0.033, 0);
      shellG.add(base, stub);
    }
  }

  const overflow = y > H / 2 - 0.003;   // стек не помещается: платы торчат из банки
  return { group: root, shellG, stackG, boards, wallMat, H, R, overflow, kind, stackTop: y, antTop,
    setXray(on) {
      if (!wallMat) return;
      const petg = kind === "body-petg";
      wallMat.transparent = on || petg; wallMat.opacity = on ? 0.16 : petg ? 0.55 : 1; wallMat.depthWrite = !(on || petg); wallMat.needsUpdate = true;
    },
    setExplode(k) {
      shellG.position.set(-0.105 * k, 0.02 * k, 0);
      boards.forEach((b, i) => { b.group.position.y = b.y0 + k * (i + 0.5) * 0.017; });
    } };
}
