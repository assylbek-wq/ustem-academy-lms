// Модули электроники для 3D-моделей CanSat и CubeSat: платы разработчика, аккумуляторы, датчики, радио.
// Размеры в миллиметрах, как у настоящих модулей; модуль стоит на плате-этаже, ось +Y вверх.
import * as THREE from "three";
import { std } from "./util.js";

export const mm = (x) => x / 1000;
export const box = (w, h, d, color, o = {}) => new THREE.Mesh(new THREE.BoxGeometry(mm(w), mm(h), mm(d)), std(color, o));
export const cyl = (r, h, color, o = {}, seg = 20) => new THREE.Mesh(new THREE.CylinderGeometry(mm(r), mm(r), mm(h), seg), std(color, o));
export const METAL = { metalness: 0.85, roughness: 0.3 };
export const at = (m, x, y, z) => { m.position.set(mm(x), mm(y), mm(z)); return m; };

/** Плата разработчика: текстолит, чип, разъем USB, гребенки выводов */
export function devBoard(w, d, color, { chip = 7, shield = null, usb = true } = {}) {
  const g = new THREE.Group();
  g.add(at(box(w, 1.6, d, color, { roughness: 0.5 }), 0, 0.8, 0));
  for (const s of [-1, 1]) g.add(at(box(w - 6, 2.2, 2.2, 0x111827), 0, 2.4, s * (d / 2 - 1.6)));
  if (shield) g.add(at(box(shield[0], 3, shield[1], 0xcbd5e1, METAL), w / 2 - shield[0] / 2 - 3, 3.1, 0));
  else g.add(at(box(chip, 1.2, chip, 0x0b0f17, { roughness: 0.3 }), 2, 2.2, 0));
  if (usb) g.add(at(box(6, 2.6, 7.5, 0xd1d5db, METAL), -w / 2 + 2.5, 2.9, 0));
  return g;
}

/** Модуль на плате-этаже: что стоит сверху текстолита */
export function moduleOf(p) {
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
    case "obc-stm32": g.add(devBoard(53, 22, 0x1e40af, { chip: 8 })); break;
    case "obc-rpi": {
      g.add(at(box(65, 1.6, 30, 0x15803d, { roughness: 0.5 }), 0, 0.8, 0), at(box(12, 1.4, 12, 0x0b0f17, { roughness: 0.3 }), -8, 2.3, 0), at(box(12, 2, 12, 0xcbd5e1, METAL), 10, 2.6, 0));
      g.add(at(box(51, 2.5, 5, 0x111827), 0, 2.9, -11.5), at(box(11, 3, 7.5, 0xd1d5db, METAL), -20, 3.1, 11), at(box(7, 2.6, 6, 0xd1d5db, METAL), 4, 2.9, 12), at(box(12, 1.5, 12, 0xd1d5db, METAL), -27, 2.4, 0));
      break;
    }
    case "bat-lipo": {
      g.add(at(box(50, 8, 34, 0xc7ccd4, { metalness: 0.6, roughness: 0.4 }), 0, 4, 0), at(box(36, 0.3, 31, 0xd97706, { roughness: 0.6 }), 2, 8.1, 0), at(box(5, 6.4, 30, 0xb45309, { roughness: 0.7 }), -27, 4, 0));
      for (const [s, c] of [[-1, 0xdc2626], [1, 0x111827]]) g.add(at(cyl(0.7, 12, c), -33, 4, s * 3).rotateZ(Math.PI / 2));
      break;
    }
    case "bat-18650x2": case "bat-18650h": {
      // держатель и элементы 18650 лежа
      const n = p.id === "bat-18650x2" ? 2 : 1, w = n * 21;
      g.add(at(box(76, 3, w + 2, 0x111827, { roughness: 0.6 }), 0, 1.5, 0));
      for (let i = 0; i < n; i++) {
        const z = (i - (n - 1) / 2) * 20.5;
        g.add(at(cyl(9.2, 65, 0x16a34a, { roughness: 0.35 }, 28), 0, 12, z).rotateZ(Math.PI / 2), at(cyl(9.3, 3, 0xe5e7eb, METAL, 28), 31.5, 12, z).rotateZ(Math.PI / 2));
        for (const sx of [-1, 1]) g.add(at(box(2, 18, 16, 0x1f2937), sx * 36, 10, z));
      }
      break;
    }
    case "eps-bms": g.add(at(box(40, 1.6, 26, 0x6d28d9), 0, 0.8, 0), at(box(8, 4, 8, 0x1f2937), -10, 3.6, 0), at(box(5, 1.4, 4, 0x0b0f17), 4, 2.3, -5), at(box(10, 4.5, 8, 0x16a34a), 12, 3.8, 6), at(box(1.6, 0.8, 1, 0x22c55e, { emissive: 0x22c55e, emissiveIntensity: 0.7 }), 15, 2, -9)); break;
    case "radio-hc12": g.add(at(box(27, 1.2, 14, 0x1e293b), 0, 0.6, 0), at(box(10, 2.2, 9, 0xcbd5e1, METAL), 3, 2.3, 0), at(cyl(1.6, 5, 0xd4a017, METAL), -11, 2.6, 0)); break;
    case "light": g.add(at(box(14, 1.6, 18, 0x1d4ed8), 0, 0.8, 0), at(box(3, 1, 2.5, 0xf8fafc, { roughness: 0.1 }), 0, 2.1, 0)); break;
    case "co2": g.add(at(box(23, 1.6, 23, 0x166534), 0, 0.8, 0), at(box(10, 6, 10, 0xd1d5db, METAL), 0, 4.6, 0), at(box(4, 0.4, 4, 0x0b0f17), 0, 7.8, 0)); break;
    case "camera": g.add(at(box(24, 1.6, 24, 0x111827), 0, 0.8, 0), at(box(8.5, 3, 8.5, 0x1f2937), 0, 3.1, 0), at(cyl(3.6, 3, 0x0b0f17, { roughness: 0.2 }), 0, 6, 0), at(cyl(2.3, 0.4, 0x3b82f6, { roughness: 0.05, metalness: 0.6 }), 0, 7.7, 0)); break;
    default: g.add(at(box(22, 1.6, 16, 0x1d4ed8), 0, 0.8, 0), at(box(5, 1.2, 5, 0x0b0f17), 0, 2.2, 0));
  }
  return g;
}

