// 3D-модель CanSat (банка 66 x 115 мм): корпус по выбранному варианту, стек плат-этажей на стойках,
// модули похожи на настоящие (Pico, ESP32-CAM, GPS с керамической антенной, LiPo, 18650, LoRa, microSD),
// антенна, рым-болт для парашюта. Начало координат - центр банки, ось +Y вверх.
import * as THREE from "three";
import { canvasTex, std, TAU } from "./util.js";

export const CAN_R = 0.033, CAN_H = 0.115;
const BOARD_R = 0.029, PCB_T = 0.0016;
const mm = (x) => x / 1000;

const box = (w, h, d, color, o = {}) => new THREE.Mesh(new THREE.BoxGeometry(mm(w), mm(h), mm(d)), std(color, o));
const cyl = (r, h, color, o = {}, seg = 20) => new THREE.Mesh(new THREE.CylinderGeometry(mm(r), mm(r), mm(h), seg), std(color, o));
const METAL = { metalness: 0.85, roughness: 0.3 };
const at = (m, x, y, z) => { m.position.set(mm(x), mm(y), mm(z)); return m; };

/** Плата разработчика: текстолит, чип, разъем USB, гребенки выводов */
function devBoard(w, d, color, { chip = 7, shield = null, usb = true } = {}) {
  const g = new THREE.Group();
  g.add(at(box(w, 1.6, d, color, { roughness: 0.5 }), 0, 0.8, 0));
  for (const s of [-1, 1]) g.add(at(box(w - 6, 2.2, 2.2, 0x111827), 0, 2.4, s * (d / 2 - 1.6)));
  if (shield) g.add(at(box(shield[0], 3, shield[1], 0xcbd5e1, METAL), w / 2 - shield[0] / 2 - 3, 3.1, 0));
  else g.add(at(box(chip, 1.2, chip, 0x0b0f17, { roughness: 0.3 }), 2, 2.2, 0));
  if (usb) g.add(at(box(6, 2.6, 7.5, 0xd1d5db, METAL), -w / 2 + 2.5, 2.9, 0));
  return g;
}

/** Модуль на плате-этаже: что стоит сверху текстолита */
function moduleOf(p) {
  const g = new THREE.Group();
  switch (p.id) {
    case "obc-nano": g.add(devBoard(43, 18, 0x1d4ed8)); break;
    case "obc-pico": g.add(devBoard(51, 21, 0x15803d)); break;
    case "obc-esp32": g.add(devBoard(52, 28, 0x111827, { shield: [18, 16] })); break;
    case "obc-esp32cam": {
      g.add(devBoard(40, 27, 0x111827, { shield: [16, 15], usb: false }));
      g.add(at(box(8.5, 5, 8.5, 0x1f2937), -8, 4.1, 0));
      const lens = cyl(3.4, 4, 0x0b0f17, { roughness: 0.2 }); g.add(at(lens, -8, 8.2, 0));
      g.add(at(cyl(2.2, 0.4, 0x3b82f6, { roughness: 0.05, metalness: 0.6 }), -8, 10.3, 0));
      g.add(at(box(13, 1.6, 14, 0xd1d5db, METAL), 11, 2.4, 0));
      break;
    }
    case "bat-lipo400": case "bat-lipo1000": {
      const big = p.id === "bat-lipo1000", w = big ? 48 : 34, d = big ? 30 : 22, h = big ? 7 : 5;
      g.add(at(box(w, h, d, 0xc7ccd4, { metalness: 0.6, roughness: 0.4 }), 0, h / 2, 0));
      g.add(at(box(w * 0.7, 0.3, d * 0.92, big ? 0xd97706 : 0xf59e0b, { roughness: 0.6 }), 2, h + 0.1, 0));
      g.add(at(box(5, h * 0.8, d * 0.9, 0xb45309, { roughness: 0.7 }), -w / 2 - 2, h / 2, 0));
      for (const [s, c] of [[-1, 0xdc2626], [1, 0x111827]]) g.add(at(cyl(0.7, 12, c), -w / 2 - 8, h / 2, s * 3).rotateZ(Math.PI / 2));
      break;
    }
    case "bat-18650": {
      g.add(at(box(22, 3, 22, 0x111827), 0, 1.5, 0));
      g.add(at(cyl(9.2, 65, 0x16a34a, { roughness: 0.35 }, 28), 0, 3 + 32.5, 0));
      g.add(at(cyl(9.3, 3, 0xe5e7eb, METAL, 28), 0, 3 + 65 - 1.5, 0));
      g.add(at(cyl(3.2, 1.6, 0xe5e7eb, METAL), 0, 3 + 65.6, 0));
      break;
    }
    case "eps-tp4056": g.add(at(box(26, 1.6, 17, 0x1e3a8a), 0, 0.8, 0), at(box(6, 2.6, 7.5, 0xd1d5db, METAL), -10, 2.9, 0), at(box(5, 1.4, 4, 0x0b0f17), 3, 2.3, 0), at(box(1.6, 0.8, 1, 0xef4444, { emissive: 0xef4444, emissiveIntensity: 0.6 }), 9, 2, 5)); break;
    case "bmp280": case "bme280": g.add(at(box(13, 1.6, 11, 0x7e22ce), 0, 0.8, 0), at(box(2.5, 1, 2.5, 0xd1d5db, METAL), 0, 2.1, 0)); break;
    case "imu": g.add(at(box(21, 1.6, 16, 0x1d4ed8), 0, 0.8, 0), at(box(4, 1, 4, 0x0b0f17, { roughness: 0.3 }), 0, 2.1, 0)); break;
    case "gps": g.add(at(box(26, 1.6, 26, 0x1d4ed8), 0, 0.8, 0), at(box(16, 4, 16, 0xe7d9b8, { roughness: 0.7 }), 0, 3.6, 0), at(box(11, 0.3, 11, 0xd1d5db, METAL), 0, 5.7, 0)); break;
    case "ds18b20": g.add(at(box(10, 1.2, 8, 0x0e7490), 0, 0.6, 0)); break;
    case "bh1750": g.add(at(box(14, 1.6, 18, 0x1d4ed8), 0, 0.8, 0), at(box(3, 1, 2.5, 0xf8fafc, { roughness: 0.1 }), 0, 2.1, 0)); break;
    case "sd": g.add(at(box(24, 1.6, 24, 0x1d4ed8), 0, 0.8, 0), at(box(14, 2, 15, 0xd1d5db, METAL), 3, 2.6, 0), at(box(11, 1, 9, 0x111827), 9, 2.6, 0)); break;
    case "radio-lora": g.add(at(box(17, 1.2, 16, 0x0f172a), 0, 0.6, 0), at(box(12, 2.4, 11, 0xcbd5e1, METAL), -1, 2.4, 0)); break;
    case "radio-apc220": g.add(at(box(37, 1.6, 17, 0x1e40af), 0, 0.8, 0), at(box(12, 3, 11, 0xcbd5e1, METAL), 6, 3.1, 0), at(cyl(3, 6, 0xd4a017, METAL), -17, 3, 0).rotateZ(Math.PI / 2)); break;
    case "radio-nrf": g.add(at(box(41, 1.6, 15, 0x0b0f17), 0, 0.8, 0), at(box(10, 2.4, 10, 0xcbd5e1, METAL), 8, 2.8, 0), at(cyl(3, 7, 0xd4a017, METAL), -19, 3, 0).rotateZ(Math.PI / 2)); break;
    default: g.add(at(box(22, 1.6, 16, 0x1d4ed8), 0, 0.8, 0), at(box(5, 1.2, 5, 0x0b0f17), 0, 2.2, 0));
  }
  return g;
}

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
