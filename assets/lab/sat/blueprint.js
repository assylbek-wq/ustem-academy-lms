// Чертежи конструктора: CubeSat 1U в изометрии, банка CanSat в разрезе, ракета-носитель сбоку с центром тяжести
// и центром давления. Рисуется на «миллиметровке», как лист эскизного проекта.

export const INK = "#10213f";
const GRID_MINOR = "rgba(16,33,63,.035)", GRID_MAJOR = "rgba(16,33,63,.07)";
const LABEL = "#24385e";
export const FONT = "Inter, system-ui, sans-serif";

export function shade(hex, k) {
  if (!hex || hex[0] !== "#") return hex || "#94a3b8";
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = (c) => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

export function setup(cv, ratio = 0.72, minH = 300) {
  const W = cv.clientWidth || 600, H = Math.max(minH, Math.round(W * ratio)), dpr = window.devicePixelRatio || 1;
  cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + "px";
  const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, W, H };
}

export function paper(ctx, W, H, grid = true) {
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
  if (!grid) return;
  ctx.lineWidth = 1;
  for (const [step, color] of [[10, GRID_MINOR], [50, GRID_MAJOR]]) {
    ctx.strokeStyle = color; ctx.beginPath();
    for (let x = 0.5; x < W; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 0.5; y < H; y += step) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
  }
}

/** Размерная линия с засечками и подписью посередине */
export function dim(ctx, x1, y1, x2, y2, text, { color = "#3b5b8f", side = -1 } = {}) {
  const ang = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(ang) * side, ny = Math.cos(ang) * side;
  ctx.save();
  ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  for (const [x, y] of [[x1, y1], [x2, y2]]) {
    ctx.beginPath(); ctx.moveTo(x - Math.cos(ang + 0.8) * 5, y - Math.sin(ang + 0.8) * 5); ctx.lineTo(x + Math.cos(ang + 0.8) * 5, y + Math.sin(ang + 0.8) * 5); ctx.stroke();
  }
  ctx.font = `500 11px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const mx = (x1 + x2) / 2 + nx * 10, my = (y1 + y2) / 2 + ny * 10;
  ctx.translate(mx, my);
  let a = ang; if (a > Math.PI / 2 || a < -Math.PI / 2) a += Math.PI;
  ctx.rotate(a);
  const w = ctx.measureText(text).width + 8;
  ctx.fillStyle = "#ffffff"; ctx.fillRect(-w / 2, -7, w, 14);
  ctx.fillStyle = color; ctx.fillText(text, 0, 0.5);
  ctx.restore();
}

/** Подписи деталей справа с выносными линиями, без наложений */
export function leaders(ctx, labels, x, { top = 16, bottom = Infinity, gap = 15 } = {}) {
  ctx.save();
  ctx.font = `500 11.5px ${FONT}`; ctx.textBaseline = "middle"; ctx.textAlign = "left";
  const sorted = [...labels].sort((a, b) => a.y - b.y);
  let last = top - gap;
  for (const L of sorted) { L.ly = Math.max(L.y, last + gap); last = L.ly; }
  const over = last - bottom;
  if (over > 0) for (const L of sorted) L.ly -= over;
  for (const L of sorted) {
    ctx.strokeStyle = L.bad ? "#e5484d" : "rgba(36,56,94,.45)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L.x, L.y); ctx.lineTo(x - 18, L.ly); ctx.lineTo(x - 4, L.ly); ctx.stroke();
    ctx.fillStyle = L.bad ? "#c62f34" : LABEL; ctx.fillText(L.text, x, L.ly);
    ctx.beginPath(); ctx.arc(L.x, L.y, 2, 0, 7); ctx.fillStyle = L.bad ? "#e5484d" : "rgba(36,56,94,.6)"; ctx.fill();
  }
  ctx.restore();
}

export function note(ctx, text, x, y, { size = 12, weight = 600, color = LABEL, align = "left" } = {}) {
  ctx.save(); ctx.font = `${weight} ${size}px ${FONT}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = "alphabetic"; ctx.fillText(text, x, y); ctx.restore();
}

const shortName = (n) => n.replace(/[,:].*$/, "").replace(/\s*\(.*\)$/, "");

/** Плата сверху: маска, контактные площадки, микросхема */
function pcbTop(ctx, P, a, c, z, color, seed) {
  const poly = (pts, fill) => { ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(...P(...q)) : ctx.moveTo(...P(...q)))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
  poly([[a, a, z], [c, a, z], [c, c, z], [a, c, z]], color);
  // контактные площадки по краю (как гребенка разъема PC/104)
  ctx.fillStyle = "rgba(250,204,21,.85)";
  for (let i = 0; i < 9; i++) { const q = P(a + 6 + i * 4.2, a + 3, z); ctx.fillRect(q[0] - 1, q[1] - 0.6, 2, 1.2); }
  // микросхема и пара компонентов
  const s = 10 + (seed % 3) * 4, cx = 40 + (seed % 5) * 3, cy = 44 - (seed % 4) * 3;
  poly([[cx, cy, z], [cx + s, cy, z], [cx + s, cy + s, z], [cx, cy + s, z]], "rgba(15,23,42,.78)");
  poly([[cx + s + 6, cy + 2, z], [cx + s + 11, cy + 2, z], [cx + s + 11, cy + 6, z], [cx + s + 6, cy + 6, z]], "rgba(203,213,225,.9)");
}

/** CubeSat 1U в изометрии: каркас с рельсами, стек плат, солнечные панели, антенна, размеры */
export function drawCube(cv, parts, ins) {
  const { ctx, W, H } = setup(cv, 0.7, 320);
  paper(ctx, W, H);
  const s = Math.min(W / 390, H / 310), cx = W * 0.33, cy = H * 0.64;
  const P = (x, y, z) => [cx + (x - y) * 0.866 * s, cy + (x + y) * 0.5 * s - z * s];
  const poly = (pts, fill, stroke, lw = 1) => { ctx.beginPath(); pts.forEach((q, i) => (i ? ctx.lineTo(...P(...q)) : ctx.moveTo(...P(...q)))); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); } };
  const line = (a, b, color, lw, dash) => { ctx.save(); if (dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(...P(...a)); ctx.lineTo(...P(...b)); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = "round"; ctx.stroke(); ctx.restore(); };
  const S = 100, frame = parts.find((p) => p.cat === "frame");
  // тень
  ctx.save(); ctx.filter = "blur(6px)"; poly([[4, 4, 0], [S + 10, 4, 0], [S + 10, S + 10, 0], [4, S + 10, 0]], "rgba(16,33,63,.16)"); ctx.restore();
  const rail = frame ? (frame.id === "frame-alu" ? "#7b8794" : frame.id === "frame-pcb" ? "#1b5e3c" : "#a8b3c2") : "#c3cedb";
  const railHi = shade(rail, 0.35);
  const edges = { back: [[[0, 0, 0], [0, 0, S]], [[0, 0, S], [S, 0, S]], [[0, 0, S], [0, S, S]], [[0, 0, 0], [S, 0, 0]], [[0, 0, 0], [0, S, 0]]],
                  front: [[[S, S, 0], [S, S, S]], [[S, 0, 0], [S, 0, S]], [[0, S, 0], [0, S, S]], [[0, S, S], [S, S, S]], [[S, 0, S], [S, S, S]], [[S, S, 0], [0, S, 0]], [[S, S, 0], [S, 0, 0]]] };
  if (frame) for (const [a, b] of edges.back) { line(a, b, rail, 5 * s); line(a, b, railHi, 1.4 * s); }
  else for (const [a, b] of [...edges.back, ...edges.front]) line(a, b, "rgba(59,91,143,.45)", 1.2, [5, 4]);
  // стек плат
  const boards = parts.filter((p) => p.h), limit = ins.stack.limit, labels = [];
  let z = 6;
  boards.forEach((b, i) => {
    const z0 = z, z1 = z + b.h, over = z1 > limit + 6, m = b.battery ? 15 : 9, a = m, c = S - m;
    const edge = over ? "#e5484d" : "rgba(16,33,63,.35)";
    const top = b.battery ? shade(b.color, 0.15) : b.color;
    poly([[a, c, z0], [c, c, z0], [c, c, z1], [a, c, z1]], shade(b.color, -0.2), edge);
    poly([[c, a, z0], [c, c, z0], [c, c, z1], [c, a, z1]], shade(b.color, -0.36), edge);
    if (b.battery) {
      poly([[a, a, z1], [c, a, z1], [c, c, z1], [a, c, z1]], top, edge);
      const q = P(S / 2, S / 2, z1); ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.font = `700 ${Math.max(8, 9 * s)}px ${FONT}`; ctx.textAlign = "center"; ctx.fillText("Li-ion", q[0], q[1] + 3);
    } else { pcbTop(ctx, P, a, c, z1, top, i * 7 + b.h); poly([[a, a, z1], [c, a, z1], [c, c, z1], [a, c, z1]], null, edge); }
    // стойки PC/104 по углам
    labels.push({ x: P(c, a, (z0 + z1) / 2)[0], y: P(c, a, (z0 + z1) / 2)[1], text: shortName(b.name), bad: over });
    z = z1 + 2;
  });
  if (frame) {
    const face = frame.id === "frame-pcb" ? "rgba(27,94,60,.10)" : "rgba(168,179,194,.12)";
    poly([[0, S, 0], [S, S, 0], [S, S, S], [0, S, S]], face); poly([[S, 0, 0], [S, S, 0], [S, S, S], [S, 0, S]], face);
  }
  // солнечные панели: ячейки на двух видимых гранях
  const solar = parts.filter((p) => p.solar).length;
  const cells = (face) => {
    for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++) {
      const u0 = 10 + i * 40, v0 = 10 + j * 20, q = (u, v) => (face ? [S, u, v] : [u, S, v]);
      poly([q(u0, v0), q(u0 + 38, v0), q(u0 + 38, v0 + 18), q(u0, v0 + 18)], face ? "rgba(23,42,110,.92)" : "rgba(30,58,138,.9)", "rgba(147,197,253,.55)");
    }
  };
  if (solar >= 1) cells(false);
  if (solar >= 2) cells(true);
  if (frame) for (const [a, b] of edges.front) { line(a, b, rail, 5 * s); line(a, b, railHi, 1.4 * s); }
  // антенна
  const ant = parts.find((p) => p.cat === "antenna");
  if (ant && frame) {
    if (ant.id === "ant-spring433") {
      ctx.strokeStyle = "#475569"; ctx.lineWidth = 1.6; ctx.beginPath();
      for (let i = 0; i <= 70; i++) { const q = P(50 + 4 * Math.cos(i / 2.6), 50 + 4 * Math.sin(i / 2.6), S + i * 0.45); i ? ctx.lineTo(...q) : ctx.moveTo(...q); }
      ctx.stroke();
    } else {
      const len = ant.id === "ant-24" ? 45 : 100;
      line([50, 50, S], [50, 50, S + len], "#1f2a3d", 2.6);
      const tip = P(50, 50, S + len); ctx.fillStyle = "#1f2a3d"; ctx.beginPath(); ctx.arc(tip[0], tip[1], 3, 0, 7); ctx.fill();
    }
  }
  // размеры
  if (frame) {
    const a = P(0, S + 16, 0), b = P(S, S + 16, 0); dim(ctx, a[0], a[1], b[0], b[1], "100 мм", { side: 1 });
    const c = P(S + 16, 0, 0), d = P(S + 16, S, 0); dim(ctx, c[0], c[1], d[0], d[1], "100 мм", { side: 1 });
    const e = P(-12, S, 0), f = P(-12, S, S); dim(ctx, e[0], e[1], f[0], f[1], "100 мм");
  }
  leaders(ctx, labels, P(S, 0, 0)[0] + 46, { top: 40, bottom: H - 40 });
  note(ctx, frame ? shortName(frame.name) : "Выберите каркас 1U", 14, 22, { size: 13, weight: 700, color: INK });
  note(ctx, `стек ${ins.stack.used} из ${ins.stack.limit} мм · ${ins.mass.total} г`, 14, 40, { size: 11.5, weight: 500 });
  if (!boards.length) note(ctx, "Добавляйте модули из каталога слева", W / 2, H / 2, { align: "center", color: "#6b7a99" });
}

/** CanSat: банка в разрезе со стеком плат, парашютом и антенной, размеры 66 × 115 мм */
export function drawCan(cv, parts, cfg, ins) {
  const { ctx, W, H } = setup(cv, 0.7, 320);
  paper(ctx, W, H);
  const body = parts.find((p) => p.cat === "body");
  const chuteSpace = (cfg.canChute || 0) > 0 ? Math.min(150, H * 0.3) : 30;
  const k = Math.min((H - 70 - chuteSpace) / 115, (W * 0.3) / 66), cx = W * 0.3, bottom = H - 50;
  const w = 66 * k, h = 115 * k, x0 = cx - w / 2, top = bottom - h, ry = w * 0.16;
  // тень
  ctx.save(); ctx.filter = "blur(8px)"; ctx.fillStyle = "rgba(16,33,63,.18)"; ctx.beginPath(); ctx.ellipse(cx + 8, bottom + 6, w * 0.62, ry * 1.1, 0, 0, 7); ctx.fill(); ctx.restore();
  // задняя стенка
  const shell = body ? (body.id === "body-frame" ? null : body.id === "body-petg" ? "rgba(148,163,184," : "rgba(203,213,225,") : null;
  if (shell) {
    const g = ctx.createLinearGradient(x0, 0, x0 + w, 0);
    g.addColorStop(0, shell + ".55)"); g.addColorStop(0.5, shell + ".18)"); g.addColorStop(1, shell + ".6)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, bottom, w / 2, ry, 0, 0, Math.PI); ctx.lineTo(x0, top); ctx.ellipse(cx, top, w / 2, ry, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
  }
  // стек плат снизу вверх
  const boards = parts.filter((p) => p.h), labels = [];
  let z = 4;
  boards.forEach((b) => {
    const bh = b.h * k, y1 = bottom - z * k, y0 = y1 - bh, over = z + b.h > ins.can.stack.limit + 4;
    const bw = b.battery && b.h > 30 ? 20 * k : (b.battery ? 52 : 56) * k;
    const bx = cx - bw / 2;
    const g = ctx.createLinearGradient(bx, 0, bx + bw, 0);
    g.addColorStop(0, shade(b.color, -0.25)); g.addColorStop(0.45, shade(b.color, 0.12)); g.addColorStop(1, shade(b.color, -0.3));
    ctx.fillStyle = g; ctx.strokeStyle = over ? "#e5484d" : "rgba(16,33,63,.4)"; ctx.lineWidth = 1;
    roundRect(ctx, bx, y0, bw, Math.max(2, bh), Math.min(4, bh / 2)); ctx.fill(); ctx.stroke();
    if (!b.battery && bh > 5) { ctx.fillStyle = "rgba(15,23,42,.7)"; ctx.fillRect(cx - 7 * k, y0 + 1, 14 * k, Math.max(1.5, bh - 3)); }
    labels.push({ x: bx + bw, y: (y0 + y1) / 2, text: shortName(b.name), bad: over });
    z += b.h + 2;
  });
  // стойки
  ctx.strokeStyle = "rgba(100,116,139,.6)"; ctx.lineWidth = 1.5;
  for (const sx of [cx - 25 * k, cx + 25 * k]) { ctx.beginPath(); ctx.moveTo(sx, bottom - 3 * k); ctx.lineTo(sx, top + 6 * k); ctx.stroke(); }
  // передняя стенка и крышки
  ctx.strokeStyle = body ? INK : "rgba(59,91,143,.55)"; ctx.lineWidth = body ? 1.6 : 1.2;
  if (!body) ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.ellipse(cx, top, w / 2, ry, 0, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(x0, bottom); ctx.ellipse(cx, bottom, w / 2, ry, 0, Math.PI, 0, true); ctx.lineTo(x0 + w, top); ctx.stroke();
  ctx.setLineDash([]);
  // антенна и парашют сверху
  const ant = parts.find((p) => p.cat === "antenna");
  if (ant && ant.id !== "ant-spring433") { ctx.strokeStyle = "#1f2a3d"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + 14 * k, top); ctx.quadraticCurveTo(cx + 30 * k, top - 40 * k, cx + 18 * k, top - 62 * k); ctx.stroke(); }
  if (ant && ant.id === "ant-spring433") { ctx.strokeStyle = "#64748b"; ctx.lineWidth = 1.3; ctx.beginPath(); for (let i = 0; i <= 40; i++) { const yy = top + 8 * k + i * 0.5 * k, xx = cx - 20 * k + 3 * k * Math.sin(i); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
  const chuteD = cfg.canChute || 0;
  if (chuteD > 0) {
    const avail = top - ry - 40;
    const cw = Math.min(W * 0.3, avail * 1.7, 50 + chuteD * 2.6), ccx = cx, ccy = top - ry - Math.max(26, avail * 0.38);
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? "#ffffff" : "#ff6a1a"; ctx.beginPath(); const a0 = Math.PI + (i * Math.PI) / 8, a1 = Math.PI + ((i + 1) * Math.PI) / 8; ctx.moveTo(ccx, ccy); ctx.ellipse(ccx, ccy, cw / 2, cw * 0.32, 0, a0, a1); ctx.closePath(); ctx.fill(); }
    ctx.strokeStyle = "rgba(16,33,63,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(ccx, ccy, cw / 2, cw * 0.32, 0, Math.PI, 0); ctx.stroke();
    ctx.strokeStyle = "rgba(16,33,63,.35)"; for (const sx of [-0.5, -0.25, 0.25, 0.5]) { ctx.beginPath(); ctx.moveTo(ccx + sx * cw, ccy); ctx.lineTo(cx + sx * 0.3 * w, top - ry * 0.6); ctx.stroke(); }
    dim(ctx, ccx - cw / 2, ccy - cw * 0.32 - 12, ccx + cw / 2, ccy - cw * 0.32 - 12, `парашют Ø ${chuteD} см`);
  }
  // размеры
  dim(ctx, x0, bottom + ry + 18, x0 + w, bottom + ry + 18, "Ø 66 мм", { side: 1 });
  dim(ctx, x0 - 22, bottom, x0 - 22, top, "115 мм");
  leaders(ctx, labels, cx + w / 2 + 50, { top: 30, bottom: H - 20 });
  note(ctx, body ? shortName(body.name) : "Выберите корпус банки", 14, 22, { size: 13, weight: 700, color: INK });
  note(ctx, `${ins.can.mass.total} г из 300 · стек ${ins.can.stack.used} из ${ins.can.stack.limit} мм`, 14, 40, { size: 11.5, weight: 500 });
  if (!boards.length) note(ctx, "Добавляйте модули из каталога слева", W * 0.62, H / 2, { align: "center", color: "#6b7a99" });
}

export function roundRect(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

const BODY_LOOK = {
  paper: { base: "#c9a46a", line: "rgba(120,84,40,.35)", spiral: true },
  pla: { base: "#e7ebf0", line: "rgba(100,116,139,.18)", layers: true },
  glass: { base: "#cfe3d8", line: "rgba(52,110,80,.25)", weave: true },
  carbon: { base: "#2b2f36", line: "rgba(255,255,255,.08)", weave: true },
};

/** Ракета сбоку: нос, корпус с текстурой материала, разрез отсеков, стабилизаторы, ЦТ и ЦД, размеры */
export function drawRocket(cv, cfg, rm, rmBurn, pred) {
  const { ctx, W, H } = setup(cv, 0.46, 280);
  paper(ctx, W, H, false);
  const r = rm.r, L = rm.L, D = rm.D, Ln = rm.Ln;
  const finSpan = r.span;
  const k = Math.min((W - 90) / L, (H - 170) / (D + 2 * finSpan));
  const x0 = 46, cy = H * 0.6, R = (D / 2) * k, X = (mm) => x0 + mm * k;
  const look = BODY_LOOK[r.material] || BODY_LOOK.paper;
  // тень
  ctx.save(); ctx.filter = "blur(7px)"; ctx.fillStyle = "rgba(16,33,63,.15)"; ctx.fillRect(X(Ln * 0.3), cy + R + finSpan * k * 0.6, (L - Ln * 0.3) * k, 8); ctx.restore();
  // стабилизаторы (верх и низ; для трех - верх и наклонный низ)
  const fin = (sign, squash = 1) => {
    const xr = X(L - r.root), y = cy + sign * R;
    ctx.beginPath(); ctx.moveTo(xr, y); ctx.lineTo(xr + r.sweep * k, y + sign * finSpan * k * squash); ctx.lineTo(xr + (r.sweep + r.tip) * k, y + sign * finSpan * k * squash); ctx.lineTo(X(L), y); ctx.closePath();
    const g = ctx.createLinearGradient(0, y, 0, y + sign * finSpan * k);
    const fc = r.finMat === "balsa" ? "#e3c48f" : r.finMat === "ply" ? "#c99a5b" : r.finMat === "eps" ? "#f8fafc" : "#ff8a3d";
    g.addColorStop(0, shade(fc, -0.1)); g.addColorStop(1, shade(fc, 0.15));
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = "rgba(16,33,63,.55)"; ctx.lineWidth = 1; ctx.stroke();
  };
  fin(-1); fin(1, r.fins === 3 ? 0.5 : 1);
  if (r.fins === 4) { ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = "#94a3b8"; ctx.fillRect(X(L - r.root * 0.95), cy - 2, r.root * 0.95 * k, 4); ctx.restore(); }
  // корпус
  const bx = X(Ln), bw = (L - Ln) * k;
  const g = ctx.createLinearGradient(0, cy - R, 0, cy + R);
  g.addColorStop(0, shade(look.base, -0.25)); g.addColorStop(0.35, shade(look.base, 0.22)); g.addColorStop(1, shade(look.base, -0.35));
  ctx.fillStyle = g; ctx.fillRect(bx, cy - R, bw, 2 * R);
  ctx.save(); ctx.beginPath(); ctx.rect(bx, cy - R, bw, 2 * R); ctx.clip(); ctx.strokeStyle = look.line; ctx.lineWidth = 1;
  if (look.spiral) for (let x = bx - 2 * R; x < bx + bw; x += 26) { ctx.beginPath(); ctx.moveTo(x, cy + R); ctx.lineTo(x + 2 * R, cy - R); ctx.stroke(); }
  if (look.layers) for (let y = cy - R; y < cy + R; y += 2.2) { ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx + bw, y); ctx.stroke(); }
  if (look.weave) for (let x = bx; x < bx + bw; x += 6) for (let y = cy - R; y < cy + R; y += 6) { ctx.strokeRect(x + ((y / 6) % 2) * 3, y, 3, 3); }
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.strokeRect(bx, cy - R, bw, 2 * R);
  // нос
  const nose = (t) => { // радиус на расстоянии t (0..1) от вершины
    if (r.nose === "cone") return t;
    if (r.nose === "parabolic") return Math.sqrt(t) * (2 - Math.sqrt(t)) * 0.5 + Math.sqrt(t) * 0.5;
    const rho = (R * R + (Ln * k) ** 2) / (2 * R), x = t * Ln * k; return (Math.sqrt(rho * rho - (Ln * k - x) ** 2) + R - rho) / R;
  };
  ctx.beginPath(); ctx.moveTo(X(0), cy);
  for (let i = 0; i <= 40; i++) { const t = i / 40; ctx.lineTo(X(Ln * t), cy - R * nose(t)); }
  for (let i = 40; i >= 0; i--) { const t = i / 40; ctx.lineTo(X(Ln * t), cy + R * nose(t)); }
  const gn = ctx.createLinearGradient(0, cy - R, 0, cy + R); gn.addColorStop(0, "#d6dde6"); gn.addColorStop(0.35, "#ffffff"); gn.addColorStop(1, "#9aa6b5");
  ctx.fillStyle = gn; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.stroke();
  // разрез: CanSat, парашют, двигатель (пунктиром)
  ctx.save(); ctx.setLineDash([4, 3]); ctx.lineWidth = 1.2;
  const canX = X(Ln + 10), canW = 115 * k, canR = Math.min(R - 2, 33 * k);
  ctx.strokeStyle = "#6b7a99"; ctx.fillStyle = "rgba(255,255,255,.55)"; roundRect(ctx, canX, cy - canR, canW, 2 * canR, 4); ctx.fill(); ctx.stroke();
  const chX = X(Ln + 125); ctx.strokeStyle = "#ff6a1a"; ctx.fillStyle = "rgba(255,106,26,.18)"; roundRect(ctx, chX, cy - R * 0.6, 70 * k, R * 1.2, 6); ctx.fill(); ctx.stroke();
  const mX = X(L - 210), mW = 220 * k, mR = 14.5 * k; ctx.strokeStyle = "#334155"; ctx.fillStyle = "rgba(51,65,85,.25)"; ctx.fillRect(mX, cy - mR, mW, 2 * mR); ctx.strokeRect(mX, cy - mR, mW, 2 * mR);
  ctx.restore();
  ctx.font = `600 10.5px ${FONT}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillStyle = "#3b4a68"; if (canW > 46) ctx.fillText("CanSat", canX + canW / 2, cy);
  ctx.fillStyle = "#c2410c"; if (70 * k > 40) ctx.fillText("парашют", chX + 35 * k, cy);
  ctx.fillStyle = "#1e293b"; if (mW > 60) ctx.fillText(MOTOR_LABEL, mX + mW / 2, cy);
  // ЦТ и ЦД
  const marker = (mm, kind, label, above) => {
    const x = X(mm), y = above ? cy - R - 26 : cy + R + 26;
    ctx.strokeStyle = kind === "cg" ? INK : "#e5484d"; ctx.lineWidth = 1; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x, y); ctx.stroke(); ctx.setLineDash([]);
    if (kind === "cg") {
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, cy, 8, 0, 7); ctx.fill();
      ctx.fillStyle = INK; for (const a of [0, Math.PI]) { ctx.beginPath(); ctx.moveTo(x, cy); ctx.arc(x, cy, 8, a, a + Math.PI / 2); ctx.closePath(); ctx.fill(); }
      ctx.strokeStyle = INK; ctx.beginPath(); ctx.arc(x, cy, 8, 0, 7); ctx.stroke();
    } else {
      ctx.fillStyle = "#e5484d"; ctx.beginPath(); ctx.arc(x, cy, 8, 0, 7); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, cy, 3, 0, 7); ctx.fill();
    }
    note(ctx, label, x, above ? y - 4 : y + 13, { size: 11, weight: 700, color: kind === "cg" ? INK : "#c62f34", align: "center" });
  };
  marker(rm.cg, "cg", `ЦТ ${Math.round(rm.cg)} мм`, true);
  marker(rm.cp, "cp", `ЦД ${Math.round(rm.cp)} мм`, false);
  if (rmBurn) { ctx.fillStyle = "rgba(16,33,63,.35)"; ctx.beginPath(); ctx.arc(X(rmBurn.cg), cy - R - 9, 3, 0, 7); ctx.fill(); }
  // подписи в углах, как на виде ракеты в OpenRocket
  const stab = Math.min(rm.stab, rmBurn ? rmBurn.stab : rm.stab), ok = stab >= 1.5;
  const f1 = (x, d = 0) => x.toFixed(d).replace(".", ",");
  ctx.save(); ctx.font = `12px ${FONT}`; ctx.fillStyle = INK; ctx.textBaseline = "top"; ctx.textAlign = "left";
  const left = [["Ракета", true], [`Длина ${f1(L / 10)} см, макс. диаметр ${D} мм`], [`Масса ${f1(rm.m)} г с двигателем`],
    [`Устойчивость: ${f1(stab, 2)} кал.`, false, ok ? "#14855a" : "#c62f34"], [`ЦТ: ${f1(rm.cg)} мм`], [`ЦД: ${f1(rm.cp)} мм`]];
  left.forEach(([t, b, c], i) => { ctx.font = `${b ? 600 : 400} 12px ${FONT}`; ctx.fillStyle = c || INK; ctx.fillText(t, 12, 10 + i * 15); });
  if (pred) {
    ctx.textAlign = "right";
    const right = [`Апогей: ${f1(pred.apogee)} м`, `Макс. скорость: ${f1(pred.maxV)} м/с`, `Макс. ускорение: ${f1(pred.maxAccel / 9.80665, 1)} g`, `Сход с направляющей: ${f1(pred.vRail, 1)} м/с`];
    right.forEach((t, i) => { ctx.font = `400 12px ${FONT}`; ctx.fillStyle = INK; ctx.fillText(t, W - 12, 10 + i * 15); });
  }
  ctx.restore();
  // размеры
  dim(ctx, X(0), H - 18, X(L), H - 18, `${(L / 10).toFixed(0)} см`);
  dim(ctx, X(L) + 16, cy - R, X(L) + 16, cy + R, `Ø ${D}`, { side: 1 });
}
const MOTOR_LABEL = "РД1-100-7М";
