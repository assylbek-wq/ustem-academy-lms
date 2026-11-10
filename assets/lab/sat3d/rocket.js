// 3D-модель ракеты-носителя по параметрам конструктора (диаметр, длина, форма обтекателя, стабилизаторы,
// материалы). Начало координат - срез сопла, ось +Y к носу. Обтекатель - отдельная группа: после вышибного
// заряда он отделяется и висит на амортизаторе. Внутренности (CanSat, парашют, моторама) видны в разрезе.
import * as THREE from "three";
import { canvasTex, clamp, rng, std, TAU } from "./util.js";

const MOTOR_R = 0.0145, MOTOR_L = 0.22;

function bodyTexture(material, Lb, D) {
  const w = 512, h = clamp(Math.round((w * Lb) / (Math.PI * D)), 256, 2048);
  const r = rng(material.length * 31 + 5);
  return canvasTex(w, h, (g) => {
    if (material === "carbon") {
      g.fillStyle = "#1b1e23"; g.fillRect(0, 0, w, h);
      const s = 16;
      for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) {
        const k = ((x / s + y / s) & 1) ? 0.1 : 0.03;
        const gr = g.createLinearGradient(x, y, x + s, y + s);
        gr.addColorStop(0, `rgba(255,255,255,${k})`); gr.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = gr; g.fillRect(x, y, s, s);
      }
    } else if (material === "glass") {
      g.fillStyle = "#e3e9df"; g.fillRect(0, 0, w, h);
      g.strokeStyle = "rgba(120,140,120,.12)"; g.lineWidth = 1;
      for (let i = -h; i < w + h; i += 9) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.moveTo(i, 0); g.lineTo(i - h, h); g.stroke(); }
    } else if (material === "pla") {
      g.fillStyle = "#f3f3f1"; g.fillRect(0, 0, w, h);
      g.fillStyle = "rgba(0,0,0,.035)"; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 1);
    } else {
      // крафт-бумага: спиральная навивка трубки
      g.fillStyle = "#b98b57"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${r() < 0.5 ? "70,45,20" : "255,235,200"},${0.03 + r() * 0.05})`; g.fillRect(r() * w, r() * h, 1 + r() * 10, 1); }
      g.strokeStyle = "rgba(80,52,24,.42)"; g.lineWidth = 2;
      const pitch = 210;
      for (let y = -w; y < h + pitch; y += pitch) { g.beginPath(); g.moveTo(0, y + pitch * 0.9); g.lineTo(w, y); g.stroke(); }
    }
    const dark = material === "carbon";
    // раскраска: оранжевая и синяя полосы у носа, надпись вдоль корпуса, шахматный пояс для видимости вращения
    const band = (y0, hh, c) => { g.fillStyle = c; g.fillRect(0, y0, w, hh); };
    band(h * 0.035, h * 0.03, "#ff6a1a"); band(h * 0.07, h * 0.012, dark ? "#e5e7eb" : "#10213f");
    const cy = h * 0.8, ch = Math.min(h * 0.07, 70);
    for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? "#f8fafc" : "#111827"; g.fillRect((i * w) / 4, cy, w / 4, ch); g.fillStyle = i % 2 ? "#111827" : "#f8fafc"; g.fillRect((i * w) / 4, cy + ch, w / 4, ch); }
    g.save(); g.translate(w * 0.25, h * 0.46); g.rotate(Math.PI / 2);
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = dark ? "#f1f5f9" : "#10213f";
    g.font = `800 ${Math.round(w * 0.2)}px Inter, system-ui, sans-serif`; g.fillText("USTEM", 0, 0);
    g.restore();
    g.save(); g.translate(w * 0.75, h * 0.46); g.rotate(Math.PI / 2);
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#ff6a1a";
    g.font = `700 ${Math.round(w * 0.12)}px Inter, system-ui, sans-serif`; g.fillText("WSO CanSat", 0, 0);
    g.restore();
  }, { aniso: 8 });
}

const BODY_LOOK = {
  paper: { roughness: 0.85 }, pla: { roughness: 0.45 }, glass: { roughness: 0.35 }, carbon: { roughness: 0.3, metalness: 0.15 },
};
const FIN_LOOK = {
  balsa: { color: 0xe6cb98, roughness: 0.85 }, ply: { color: 0xc49a62, roughness: 0.75 },
  pla: { color: 0xff6a1a, roughness: 0.45 }, eps: { color: 0xf6f6f4, roughness: 0.95 },
};
const FIN_T = { balsa: 0.003, ply: 0.003, pla: 0.003, eps: 0.005 };

/** Радиус обтекателя на расстоянии y от вершины (0..Ln) */
export function noseRadius(kind, y, Ln, R) {
  const k = clamp(y / Ln, 0, 1);
  if (kind === "cone") return R * k;
  if (kind === "parabolic") return R * (2 * k - k * k);
  const rho = (R * R + Ln * Ln) / (2 * R);                    // касательное оживало
  return Math.sqrt(Math.max(0, rho * rho - Math.pow(Ln - y, 2))) + R - rho;
}

/**
 * r - параметры ракеты из конструктора (мм, см). Возвращает группу и размеры в метрах.
 * inside: строить ли внутренности (нужны конструктору для разреза).
 */
export function buildRocket(r, { inside = false, canGroup = null } = {}) {
  const D = r.d / 1000, R = D / 2, L = r.len / 100;
  const Ln = Math.min(L * 0.6, (r.d * r.noseK) / 1000), Lb = L - Ln;
  const root = new THREE.Group();
  const bodyG = new THREE.Group(), noseG = new THREE.Group();
  root.add(bodyG, noseG);

  // корпус
  const look = BODY_LOOK[r.material] || BODY_LOOK.paper;
  const bodyMat = std(0xffffff, { map: bodyTexture(r.material, Lb, D), side: THREE.DoubleSide, ...look });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, Lb, 48, 1, true), bodyMat);
  body.position.y = Lb / 2; bodyG.add(body);

  // обтекатель: тело вращения по профилю + посадочный поясок
  const noseMat = std(0xff6a1a, { roughness: 0.38 });
  const pts = [];
  const N = 28;
  for (let i = 0; i <= N; i++) { const y = (Ln * i) / N; pts.push(new THREE.Vector2(Math.max(0.0005, noseRadius(r.nose, y, Ln, R)), Ln - y)); }
  pts.reverse();
  const nose = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), noseMat);
  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.93, R * 0.93, 0.045, 32), std(0xe2e8f0, { roughness: 0.5 }));
  shoulder.position.y = -0.0225;
  const noseCap = new THREE.Mesh(new THREE.CircleGeometry(R * 0.93, 32), std(0xcbd5e1));
  noseCap.rotation.x = Math.PI / 2; noseCap.position.y = -0.045;
  noseG.add(nose, shoulder, noseCap);
  noseG.position.y = Lb;

  // стабилизаторы: трапеция (корень, конец, размах, стреловидность)
  const fl = FIN_LOOK[r.finMat] || FIN_LOOK.balsa, ft = FIN_T[r.finMat] || 0.003;
  const cr = r.root / 1000, ct = r.tip / 1000, sp = r.span / 1000, sw = r.sweep / 1000;
  const shape = new THREE.Shape();
  shape.moveTo(R * 0.98, 0); shape.lineTo(R * 0.98, cr); shape.lineTo(R + sp, cr - sw); shape.lineTo(R + sp, cr - sw - Math.max(0.004, ct)); shape.closePath();
  const finGeo = new THREE.ExtrudeGeometry(shape, { depth: ft, bevelEnabled: true, bevelThickness: ft * 0.3, bevelSize: ft * 0.3, bevelSegments: 1 });
  finGeo.translate(0, 0, -ft / 2);
  const finMat = std(fl.color, { roughness: fl.roughness });
  const fins = new THREE.Group();
  const nf = r.fins || 4;
  for (let i = 0; i < nf; i++) { const f = new THREE.Mesh(finGeo, finMat); f.rotation.y = (i * TAU) / nf + Math.PI / nf; fins.add(f); }
  bodyG.add(fins);

  // двигатель и донный срез
  const motorMat = std(0x7c5a3c, { roughness: 0.8 });
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(MOTOR_R, MOTOR_R, MOTOR_L, 24), motorMat);
  motor.position.y = MOTOR_L / 2 - 0.012;
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(MOTOR_R * 0.45, MOTOR_R * 0.8, 0.004, 20), std(0x1f2937, { roughness: 0.9 }));
  nozzle.position.y = -0.012;
  const ring = new THREE.Mesh(new THREE.RingGeometry(MOTOR_R, R * 0.99, 40), std(0xd6c7a8, { side: THREE.DoubleSide, roughness: 0.9 }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.003;
  bodyG.add(motor, nozzle, ring);

  // направляющие кольца (со стороны -X: там стоит направляющая)
  const lugMat = std(0xe5e7eb, { roughness: 0.5 });
  for (const y of [L * 0.16, Lb * 0.72]) {
    const lug = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.03, 12, 1, true), lugMat);
    lug.material.side = THREE.DoubleSide; lug.position.set(-(R + 0.0045), y, 0); bodyG.add(lug);
  }

  // внутренности для разреза
  let inner = null;
  if (inside) {
    inner = new THREE.Group();
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(MOTOR_R + 0.0015, MOTOR_R + 0.0015, MOTOR_L + 0.02, 24, 1, true), std(0xc9a26b, { side: THREE.DoubleSide, roughness: 0.9 }));
    tube.position.y = MOTOR_L / 2 + 0.004;
    inner.add(tube);
    for (const y of [0.03, MOTOR_L - 0.01]) {
      const cring = new THREE.Mesh(new THREE.RingGeometry(MOTOR_R + 0.0015, R * 0.97, 40), std(0xd9c39a, { side: THREE.DoubleSide, roughness: 0.9 }));
      cring.rotation.x = Math.PI / 2; cring.position.y = y; inner.add(cring);
    }
    // пыж и уложенный парашют ракеты
    const wad = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.9, R * 0.9, 0.018, 24), std(0xf1f5f9, { roughness: 1 }));
    wad.position.y = MOTOR_L + 0.05; inner.add(wad);
    const packR = Math.min(R * 0.86, 0.02 + r.chute / 100 * 0.045);
    const pack = new THREE.Mesh(new THREE.SphereGeometry(packR, 20, 14), std(0xdc2626, { roughness: 0.9 }));
    pack.scale.y = 1.5; pack.position.y = Lb - 0.115 - 0.03 - packR * 1.5 - 0.02; inner.add(pack);
    // амортизатор (эластичный шнур) змейкой
    const cordPts = [];
    for (let i = 0; i <= 40; i++) { const k = i / 40; cordPts.push(new THREE.Vector3(Math.sin(k * 26) * R * 0.5, MOTOR_L + 0.07 + k * Math.max(0.05, pack.position.y - packR * 1.5 - MOTOR_L - 0.09), Math.cos(k * 26) * R * 0.5)); }
    inner.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cordPts), 80, 0.0018, 5), std(0xf8fafc, { roughness: 1 })));
    if (canGroup) { canGroup.position.y = Lb - 0.012 - 0.0575; inner.add(canGroup); }
    bodyG.add(inner);
  }

  return { group: root, bodyG, noseG, body, bodyMat, fins, inner, L, Lb, Ln, R, D, tubeR: R,
    /** Разрез: корпус и обтекатель полупрозрачные */
    setXray(on) {
      bodyMat.transparent = on; bodyMat.opacity = on ? 0.22 : 1; bodyMat.depthWrite = !on; bodyMat.needsUpdate = true;
      noseMat.transparent = on; noseMat.opacity = on ? 0.35 : 1; noseMat.depthWrite = !on; noseMat.needsUpdate = true;
      if (inner) inner.visible = on;
    } };
}

/** Факел двигателя: вложенные конусы со свечением, мерцают каждый кадр */
export function buildFlame() {
  const g = new THREE.Group();
  const mk = (r, len, color, op) => {
    const geo = new THREE.ConeGeometry(r, len, 14, 1, true);
    geo.rotateX(Math.PI); geo.translate(0, -len / 2, 0);            // основание у сопла, вершина вниз
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    g.add(m); return m;
  };
  const outer = mk(0.03, 0.42, 0xff7a1a, 0.55), mid = mk(0.02, 0.3, 0xffc24a, 0.8), core = mk(0.011, 0.16, 0xfff6d8, 0.95);
  g.userData.flick = (t, power = 1) => {
    const a = 0.85 + 0.3 * Math.sin(t * 91.3) * Math.sin(t * 37.7), b = 0.9 + 0.2 * Math.sin(t * 63.1 + 1);
    outer.scale.set(b * power, a * power, b * power); mid.scale.set(a, b * power, a); core.scale.set(1, a, 1);
  };
  g.visible = false;
  return g;
}
