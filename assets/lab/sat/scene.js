// Сцена полета: небо, облака, горы и степь, наземная станция, аэростат с CubeSat или ракета с CanSat
// и парашютами, пакеты телеметрии лучами к станции, высотомер справа. Масштаб подбирается под весь полет.
import { FONT, roundRect, shade, setup } from "./blueprint.js";

const TAU = Math.PI * 2;

function interp(rows, t) {
  if (!rows || !rows.length) return null;
  if (t <= rows[0].t) return rows[0];
  if (t >= rows[rows.length - 1].t) return rows[rows.length - 1];
  let lo = 0, hi = rows.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (rows[m].t <= t) lo = m; else hi = m; }
  const a = rows[lo], b = rows[hi], k = (t - a.t) / Math.max(1e-6, b.t - a.t);
  return { t, x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k, th: a.th + (b.th - a.th) * k, ph: k < 0.5 ? a.ph : b.ph };
}

// повторяемые облака и горы
const CLOUDS = Array.from({ length: 7 }, (_, i) => ({ x: (i * 0.173 + 0.07) % 1, y: 0.12 + ((i * 37) % 23) / 70, s: 0.6 + ((i * 53) % 10) / 14, v: 0.004 + (i % 3) * 0.002 }));
const RIDGE = Array.from({ length: 34 }, (_, i) => 0.35 + 0.65 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)) * (0.6 + 0.4 * Math.sin(i * 0.31)));

export class Scene {
  constructor(kind) { this.kind = kind; }

  /** Рамка мира (м) под весь полет */
  frame(st) {
    const { res, flight, pred } = st;
    if (this.kind === "cubesat") {
      const altMax = (res ? res.flight.altMax : flight.altMax) || 500, station = (res ? res.flight.station : flight.station) || 150;
      const drift = res ? Math.max(...res.timeline.map((x) => x.drift || 0)) : altMax * 0.2;
      return { x0: -station - 40, x1: Math.max(drift, 40) + 80, z1: altMax * 1.14 };
    }
    const ev = res ? res.ev : pred;
    const apo = ev ? ev.apogee : 400;
    const pts = res && res.trip ? [...res.trip.rocket, ...res.trip.can] : st.predPath || [];
    const xs = pts.length ? [Math.min(...pts.map((p) => p.x)), Math.max(...pts.map((p) => p.x)), 0] : [0, 250];
    const station = flight.station || 60;
    return { x0: Math.min(-station * 0.5 - 40, Math.min(...xs) - 50), x1: Math.max(...xs) + 70, z1: Math.max(120, apo * 1.16) };
  }

  draw(cv, st) {
    const { ctx, W, H } = setup(cv, 0.5, 260);
    const f = this.frame(st), ground = H - 44, top = this.kind === "cubesat" ? 84 : 44;
    const sx = (W - 90) / (f.x1 - f.x0), sz = (ground - top) / f.z1;
    const X = (x) => 24 + (x - f.x0) * sx, Z = (z) => ground - z * sz;
    const t = st.t || 0;
    this.sky(ctx, W, ground, t);
    this.mountains(ctx, W, ground);
    this.groundPlane(ctx, W, H, ground);
    // ветер
    this.windsock(ctx, 18, 24, st.wind || 0);
    // станция
    const stX = this.kind === "cubesat" ? X(-(st.res ? st.res.flight.station : st.flight.station || 150)) : X(-0.5 * (st.flight.station || 60));
    let target = null;
    if (this.kind === "cubesat") target = this.cubesat(ctx, st, X, Z, ground, t);
    else target = this.cansat(ctx, st, X, Z, ground, t);
    this.station(ctx, stX, ground, st.yagi, target);
    // лучи пакетов к станции
    if (st.res && st.playing && target) {
      const span = Math.max(0.5, (st.speed || 30) / 35);
      const recent = st.res.packets.filter((p) => p.t <= t && p.t > t - span).slice(-3);
      for (const p of recent) {
        const a = 1 - (t - p.t) / span;
        ctx.save(); ctx.strokeStyle = p.ok ? `rgba(80,227,194,${0.85 * a})` : `rgba(255,99,99,${0.85 * a})`; ctx.lineWidth = 2; ctx.setLineDash([7, 6]); ctx.lineDashOffset = -t * 60;
        ctx.beginPath(); ctx.moveTo(target.x, target.y); ctx.lineTo(stX + 12, ground - 50); ctx.stroke(); ctx.restore();
      }
    }
    // высотомер
    const alt = target ? target.alt : 0;
    this.altimeter(ctx, W, top, ground, f.z1, alt, st.res ? st.res.flight.altMax : null);
    return { ground, X, Z };
  }

  sky(ctx, W, ground, t) {
    const g = ctx.createLinearGradient(0, 0, 0, ground);
    g.addColorStop(0, "#173a7a"); g.addColorStop(0.45, "#3f7ac2"); g.addColorStop(0.85, "#a9cdee"); g.addColorStop(1, "#e3eef8");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, ground);
    // солнце
    const sx = W * 0.78, sy = ground * 0.22;
    const glow = ctx.createRadialGradient(sx, sy, 4, sx, sy, ground * 0.55);
    glow.addColorStop(0, "rgba(255,244,214,.95)"); glow.addColorStop(0.08, "rgba(255,236,190,.55)"); glow.addColorStop(1, "rgba(255,236,190,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, ground);
    ctx.fillStyle = "#fff8e6"; ctx.beginPath(); ctx.arc(sx, sy, 11, 0, TAU); ctx.fill();
    // облака
    for (const c of CLOUDS) {
      const x = (((c.x + t * c.v * 0.05) % 1.2) - 0.1) * W, y = c.y * ground, r = 18 * c.s;
      ctx.fillStyle = "rgba(255,255,255,.78)";
      ctx.beginPath();
      for (const [dx, dy, rr] of [[0, 0, 1], [1.1, -0.35, 0.8], [2, 0.05, 0.9], [-1, 0.15, 0.7], [0.9, 0.3, 0.9]]) ctx.ellipse(x + dx * r, y + dy * r, rr * r * 1.15, rr * r * 0.8, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(160,190,225,.25)"; ctx.beginPath(); ctx.ellipse(x + r, y + r * 0.6, r * 2.2, r * 0.35, 0, 0, TAU); ctx.fill();
    }
  }

  mountains(ctx, W, ground) {
    const cansat = this.kind === "cansat";
    const h = cansat ? ground * 0.34 : ground * 0.1, base = ground;
    // дальний хребет
    ctx.beginPath(); ctx.moveTo(0, base);
    RIDGE.forEach((v, i) => ctx.lineTo((i / (RIDGE.length - 1)) * W, base - h * v));
    ctx.lineTo(W, base); ctx.closePath();
    const g = ctx.createLinearGradient(0, base - h, 0, base);
    g.addColorStop(0, cansat ? "#7f98bd" : "#9db3cf"); g.addColorStop(1, cansat ? "#a9bdd8" : "#c7d6e8");
    ctx.fillStyle = g; ctx.fill();
    if (cansat) {
      // снежные шапки Заилийского Алатау
      ctx.fillStyle = "rgba(255,255,255,.88)";
      RIDGE.forEach((v, i) => {
        if (v < 0.72 || i === 0 || i === RIDGE.length - 1) return;
        const x = (i / (RIDGE.length - 1)) * W, y = base - h * v, w = W / RIDGE.length;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - w * 0.45, y + h * 0.14); ctx.lineTo(x - w * 0.1, y + h * 0.1); ctx.lineTo(x + w * 0.15, y + h * 0.15); ctx.lineTo(x + w * 0.42, y + h * 0.12); ctx.closePath(); ctx.fill();
      });
    }
    // ближние холмы
    ctx.beginPath(); ctx.moveTo(0, base);
    for (let i = 0; i <= 20; i++) ctx.lineTo((i / 20) * W, base - h * 0.18 - Math.sin(i * 0.9) * h * 0.06 - (cansat ? h * 0.05 : 0));
    ctx.lineTo(W, base); ctx.closePath(); ctx.fillStyle = cansat ? "#94ab7d" : "#b5c48d"; ctx.fill();
  }

  groundPlane(ctx, W, H, ground) {
    const g = ctx.createLinearGradient(0, ground, 0, H);
    g.addColorStop(0, "#a3b86c"); g.addColorStop(1, "#7f9a4e");
    ctx.fillStyle = g; ctx.fillRect(0, ground, W, H - ground);
    ctx.fillStyle = "rgba(255,255,255,.12)"; for (let x = 0; x < W; x += 23) ctx.fillRect(x + ((x * 7) % 11), ground + 6 + ((x * 13) % 20), 6, 1.5);
  }

  windsock(ctx, x, y, wind) {
    ctx.save();
    roundRect(ctx, x - 8, y - 14, 112, 28, 8); ctx.fillStyle = "rgba(10,25,52,.55)"; ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + 8); ctx.lineTo(x, y - 8); ctx.stroke();
    const len = 10 + Math.min(1, wind / 8) * 22, droop = (1 - Math.min(1, wind / 8)) * 8;
    for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? "#ffffff" : "#ff6a1a"; ctx.beginPath(); const a = (i * len) / 4, b = ((i + 1) * len) / 4; ctx.moveTo(x + a, y - 7 + (droop * a) / len); ctx.lineTo(x + b, y - 6 + (droop * b) / len + i * 0.5); ctx.lineTo(x + b, y - 1 + (droop * b) / len - i * 0.5); ctx.lineTo(x + a, y + (droop * a) / len); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = "#fff"; ctx.font = `600 11.5px ${FONT}`; ctx.textBaseline = "middle"; ctx.fillText(`ветер ${wind.toFixed(0)} м/с`, x + 40, y);
    ctx.restore();
  }

  station(ctx, x, ground, yagi, target) {
    // тент команды
    ctx.fillStyle = "rgba(16,33,63,.25)"; ctx.beginPath(); ctx.ellipse(x + 4, ground + 3, 34, 5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = "#ff6a1a"; ctx.beginPath(); ctx.moveTo(x - 30, ground - 26); ctx.lineTo(x + 26, ground - 26); ctx.lineTo(x + 32, ground - 18); ctx.lineTo(x - 36, ground - 18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fff"; for (let i = -30; i < 26; i += 14) ctx.fillRect(x + i, ground - 18, 7, 4);
    ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 2; for (const dx of [-32, 28]) { ctx.beginPath(); ctx.moveTo(x + dx, ground - 18); ctx.lineTo(x + dx, ground); ctx.stroke(); }
    ctx.fillStyle = "#e2e8f0"; ctx.fillRect(x - 22, ground - 10, 40, 3);
    ctx.fillStyle = "#1e293b"; ctx.fillRect(x - 12, ground - 17, 14, 7); ctx.fillStyle = "#38bdf8"; ctx.fillRect(x - 11, ground - 16, 12, 5);
    // мачта и антенна
    const ax = x + 12, ay = ground - 50;
    ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax, ground - 10); ctx.lineTo(ax, ay); ctx.stroke();
    if (yagi && target) {
      const ang = Math.atan2(target.y - ay, target.x - ax);
      ctx.save(); ctx.translate(ax, ay); ctx.rotate(ang); ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(26, 0);
      for (let i = 0; i < 5; i++) { ctx.moveTo(i * 6, -7 + i); ctx.lineTo(i * 6, 7 - i); } ctx.stroke(); ctx.restore();
    } else { ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, ay - 16); ctx.stroke(); ctx.fillStyle = "#1e293b"; ctx.beginPath(); ctx.arc(ax, ay - 16, 2.4, 0, TAU); ctx.fill(); }
    ctx.fillStyle = "#10213f"; ctx.font = `700 11px ${FONT}`; ctx.textAlign = "center"; ctx.fillText("станция", x, ground + 22); ctx.textAlign = "left";
  }

  cubesat(ctx, st, X, Z, ground, t) {
    const res = st.res;
    const tl = res ? res.timeline[Math.min(res.timeline.length - 1, Math.max(0, Math.floor(t)))] : null;
    const alt = tl ? tl.alt : 0, drift = tl ? tl.drift || 0 : 0;
    const wx = X(0), sx = X(drift) + (tl ? Math.sin(t / 3.1) * 3 : 0), sy = Z(alt) - 10;
    // лебедка
    ctx.fillStyle = "#7c4a1d"; roundRect(ctx, wx - 16, ground - 12, 32, 12, 3); ctx.fill(); ctx.fillStyle = "#334155"; ctx.beginPath(); ctx.arc(wx, ground - 12, 5, 0, TAU); ctx.fill();
    // трос с провисом
    ctx.strokeStyle = "rgba(16,33,63,.7)"; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(wx, ground - 14);
    ctx.quadraticCurveTo((wx + sx) / 2 + (sx - wx) * 0.2, (ground + sy) / 2 + 10, sx, sy - 30); ctx.stroke();
    // аэростат-змей
    const bx = sx, by = sy - 50;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(Math.min(0.35, (drift / Math.max(30, alt)) * 0.8));
    const g = ctx.createLinearGradient(0, -18, 0, 18); g.addColorStop(0, "#ffffff"); g.addColorStop(0.6, "#e2e8f0"); g.addColorStop(1, "#94a3b8");
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 34, 16, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = "rgba(16,33,63,.35)"; ctx.stroke();
    ctx.fillStyle = "#ff6a1a"; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(40, s * 13); ctx.lineTo(42, s * 3); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = "rgba(16,33,63,.5)"; ctx.font = `700 8px ${FONT}`; ctx.textAlign = "center"; ctx.fillText("WSO", -6, 3);
    ctx.restore();
    ctx.strokeStyle = "rgba(16,33,63,.6)"; ctx.beginPath(); ctx.moveTo(bx, by + 15); ctx.lineTo(sx, sy - 7); ctx.stroke();
    // куб
    const yaw = tl ? (tl.yaw * Math.PI) / 180 : 0.6, w1 = 9 * Math.abs(Math.cos(yaw)) + 2, w2 = 9 * Math.abs(Math.sin(yaw)) + 2;
    ctx.fillStyle = "#e2e8f0"; ctx.fillRect(sx - (w1 + w2) / 2, sy - 7, w1, 14); ctx.fillStyle = "#1e3a8a"; ctx.fillRect(sx - (w1 + w2) / 2 + w1, sy - 7, w2, 14);
    ctx.strokeStyle = "#10213f"; ctx.lineWidth = 1; ctx.strokeRect(sx - (w1 + w2) / 2, sy - 7, w1 + w2, 14);
    return { x: sx, y: sy, alt };
  }

  cansat(ctx, st, X, Z, ground, t) {
    const res = st.res, trip = res ? res.trip : null;
    // стартовый стол
    const px = X(0);
    ctx.fillStyle = "#475569"; ctx.fillRect(px - 14, ground - 4, 28, 4);
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, ground - 4); ctx.lineTo(px - 3, ground - 40); ctx.stroke();
    if (!trip) {
      // до полета: ракета на столе и прогноз пунктиром
      this.rocketIcon(ctx, px - 1.5, ground - 22, -0.05, false);
      if (st.pred && st.predPath) {
        ctx.save(); ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.setLineDash([3, 5]); ctx.lineWidth = 1.5; ctx.beginPath();
        st.predPath.forEach((p, i) => (i ? ctx.lineTo(X(p.x), Z(p.z)) : ctx.moveTo(X(p.x), Z(p.z)))); ctx.stroke(); ctx.restore();
        const a = st.pred; ctx.fillStyle = "#fff"; ctx.font = `700 12px ${FONT}`; ctx.fillText(`прогноз апогея ${Math.round(a.apogee)} м`, X(0) + 10, Z(a.apogee) - 8);
      }
      return { x: px, y: ground - 30, alt: 0 };
    }
    const ev = res.ev, rk = interp(trip.rocket, t), cn = interp(trip.can, t);
    // дымный след ракеты на активном участке и до выброса
    const trail = trip.rocket.filter((p) => p.t >= ev.tLaunch && p.t <= Math.min(t, ev.tEject));
    if (trail.length > 1) {
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1], b = trail[i], burnt = b.t <= ev.tBurnout + 0.3;
        ctx.strokeStyle = burnt ? `rgba(255,255,255,${0.55})` : "rgba(255,255,255,.22)"; ctx.lineWidth = burnt ? 4 : 1.5;
        ctx.beginPath(); ctx.moveTo(X(a.x), Z(a.z)); ctx.lineTo(X(b.x), Z(b.z)); ctx.stroke();
      }
    }
    // след CanSat под парашютом
    const ctrail = trip.can.filter((p) => p.t > ev.tEject && p.t <= t);
    if (ctrail.length > 1) {
      ctx.save(); ctx.strokeStyle = "rgba(80,227,194,.8)"; ctx.setLineDash([2, 4]); ctx.lineWidth = 1.5; ctx.beginPath();
      ctrail.forEach((p, i) => (i ? ctx.lineTo(X(p.x), Z(p.z)) : ctx.moveTo(X(p.x), Z(p.z)))); ctx.stroke(); ctx.restore();
    }
    // хлопок вышибного заряда
    if (t >= ev.tEject && t < ev.tEject + 1.6 && !ev.crash) {
      const a = (t - ev.tEject) / 1.6, ex = X(interp(trip.rocket, ev.tEject).x), ey = Z(interp(trip.rocket, ev.tEject).z);
      ctx.fillStyle = `rgba(255,255,255,${0.7 * (1 - a)})`; ctx.beginPath(); ctx.arc(ex, ey, 6 + a * 26, 0, TAU); ctx.fill();
    }
    const separated = t >= ev.tEject;
    const rx = X(rk.x), ry = Z(rk.z), cx = X(cn.x), cy = Z(cn.z);
    if (!separated) {
      this.rocketIcon(ctx, rx, ry - 4, rk.th, rk.ph === 1 && t >= ev.tLaunch);
      return { x: rx, y: ry, alt: rk.z };
    }
    // ракета под своим парашютом
    const rOpen = ev.rocketChuteOk ? Math.min(1, (t - ev.tEject) / 0.8) : 0;
    if (rk.z > 0.5 && rOpen > 0) this.chute(ctx, rx, ry - 26, 20 * rOpen, "#ffffff", "#10213f", t);
    this.rocketIcon(ctx, rx, ry, rk.z > 0.5 ? (rOpen > 0 ? Math.PI * 0.92 : rk.th) : Math.PI / 2, false, rk.z <= 0.5);
    // CanSat под своим парашютом
    const cOpen = ev.canChuteOk ? Math.min(1, (t - ev.tEject) / 0.7) : 0;
    if (cn.z > 0.5 && cOpen > 0) this.chute(ctx, cx, cy - 20, 14 * cOpen, "#ff6a1a", "#ffffff", t + 1.3);
    ctx.save(); ctx.translate(cx, cy); if (cn.z <= 0.5) ctx.rotate(Math.PI / 2);
    const g = ctx.createLinearGradient(-4, 0, 4, 0); g.addColorStop(0, "#94a3b8"); g.addColorStop(0.5, "#f8fafc"); g.addColorStop(1, "#64748b");
    ctx.fillStyle = g; roundRect(ctx, -4, -7, 8, 13, 2); ctx.fill(); ctx.strokeStyle = "#10213f"; ctx.lineWidth = 0.8; ctx.stroke(); ctx.restore();
    // места посадки
    if (t >= ev.tLand) this.landMark(ctx, cx, ground, `CanSat ${Math.round(Math.abs(ev.xCan))} м`, "#0e7490");
    if (t >= ev.tLandRocket) this.landMark(ctx, rx, ground, "ракета", "#10213f", 14);
    return { x: cx, y: cy, alt: cn.z };
  }

  rocketIcon(ctx, x, y, th, flame, lying) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(lying ? Math.PI / 2 : th);
    if (flame) {
      const f = 10 + Math.random() * 6;
      const g = ctx.createLinearGradient(0, 11, 0, 11 + f); g.addColorStop(0, "#fff7c2"); g.addColorStop(0.4, "#ffb020"); g.addColorStop(1, "rgba(255,90,20,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-3, 11); ctx.quadraticCurveTo(0, 11 + f * 1.3, 3, 11); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = "#f1f5f9"; ctx.strokeStyle = "#10213f"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, -16); ctx.quadraticCurveTo(4, -9, 4, -5); ctx.lineTo(4, 11); ctx.lineTo(-4, 11); ctx.lineTo(-4, -5); ctx.quadraticCurveTo(-4, -9, 0, -16); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#ff6a1a"; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 4, 4); ctx.lineTo(s * 9, 12); ctx.lineTo(s * 4, 11); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = "#1e3a8a"; ctx.fillRect(-4, -3, 8, 3);
    ctx.restore();
  }

  chute(ctx, x, y, r, c1, c2, t) {
    const sway = Math.sin(t * 2.2) * 0.12;
    ctx.save(); ctx.translate(x, y); ctx.rotate(sway);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? c2 : c1; ctx.beginPath(); ctx.moveTo(0, 0); ctx.ellipse(0, 0, r, r * 0.62, 0, Math.PI + (i * Math.PI) / 6, Math.PI + ((i + 1) * Math.PI) / 6); ctx.closePath(); ctx.fill(); }
    ctx.strokeStyle = "rgba(16,33,63,.45)"; ctx.lineWidth = 0.8;
    for (const sx of [-1, -0.5, 0.5, 1]) { ctx.beginPath(); ctx.moveTo(sx * r, 0); ctx.lineTo(0, r * 1.3); ctx.stroke(); }
    ctx.restore();
  }

  landMark(ctx, x, ground, text, color, dy = 0) {
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 5, ground + 6 - 5); ctx.lineTo(x + 5, ground + 6 + 5); ctx.moveTo(x + 5, ground + 6 - 5); ctx.lineTo(x - 5, ground + 6 + 5); ctx.stroke();
    ctx.fillStyle = color; ctx.font = `700 11px ${FONT}`; ctx.textAlign = "center"; ctx.fillText(text, x, ground + 26 + dy); ctx.textAlign = "left";
  }

  altimeter(ctx, W, top, ground, z1, alt, apogee) {
    const x = W - 46, h = ground - top;
    ctx.save();
    roundRect(ctx, x - 6, top - 14, 50, h + 28, 10); ctx.fillStyle = "rgba(10,25,52,.42)"; ctx.fill();
    const step = z1 > 1500 ? 500 : z1 > 600 ? 200 : z1 > 250 ? 100 : 50;
    ctx.font = `600 10px ${FONT}`; ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1; ctx.textAlign = "right";
    for (let a = 0; a <= z1; a += step / 2) {
      const y = ground - (a / z1) * h, major = a % step === 0;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (major ? 10 : 5), y); ctx.stroke();
      if (major) ctx.fillText(`${a}`, x + 38, y + 3.5);
    }
    if (apogee) { const y = ground - (apogee / z1) * h; ctx.strokeStyle = "#ffd166"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 40, y); ctx.stroke(); ctx.setLineDash([]); }
    const y = ground - (Math.min(alt, z1) / z1) * h;
    ctx.fillStyle = "#50e3c2"; ctx.beginPath(); ctx.moveTo(x - 2, y); ctx.lineTo(x - 10, y - 5); ctx.lineTo(x - 10, y + 5); ctx.closePath(); ctx.fill();
    ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.font = `700 11px ${FONT}`; ctx.fillText("м", x + 19, top - 2);
    ctx.restore();
  }
}
export { shade };
