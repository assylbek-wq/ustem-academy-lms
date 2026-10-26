// Поле FIRST LEGO League Challenge сезона BIOGLOW (2026-2027) для симулятора SPIKE Prime.
// Мат 2000 x 1143 мм лежит по центру стола 2362 x 1143 (слева и справа зоны хранения ~181 мм), как в Robot Game
// Rulebook (стр. 7, 15). Рисунок мата - из официальной книги правил, координаты моделей - по каркасу мата (wireframe)
// из Team Meeting Guide (стр. 15), очки - по книге правил (стр. 8-12).
// Механика моделей упрощена: модель срабатывает, когда робот толкает ее нужную часть корпусом или опускает
// (поднимает) навесное на моторе C или D в нужном месте. Координаты: мм, x от левого борта стола, y от борта домов.

export const TABLE_W = 2362, TABLE_H = 1143, MX = 181, FIELD_W = 2000;
export const HOME_R = 482, LAUNCH_R = 457;

// Официальные названия миссий (книга правил RU и KZ)
export const MISSIONS = [
  { id: 1, ru: "Воздушное обследование", kk: "Әуеден зерттеу", en: "Drone Survey" },
  { id: 2, ru: "Взрывные семена", kk: "Жарылатын тұқымдар", en: "Exploding Seeds" },
  { id: 3, ru: "Переворот камня", kk: "Тасты төңкеру", en: "Flip the Rock" },
  { id: 4, ru: "Счастливые листья", kk: "Сәтті жапырақтар", en: "Lucky Leaves" },
  { id: 5, ru: "Разрастающиеся корни", kk: "Жайылған тамырлар", en: "Reaching Roots" },
  { id: 6, ru: "Нашествие листорезов", kk: "Жапырақкескіш құмырсқалардың қарбаласы", en: "Leafcutter Frenzy" },
  { id: 7, ru: "Гигантский гриб", kk: "Алып саңырауқұлақтар", en: "Humongous Fungus" },
  { id: 8, ru: "Переплетение", kk: "Шырмалу", en: "Tangled" },
  { id: 9, ru: "Исследовательская платформа", kk: "Зерттеу платформасы", en: "Research Platform" },
  { id: 10, ru: "Хрупкие микроэкосистемы", kk: "Осал микроорталар", en: "Fragile Microhabitats" },
  { id: 11, ru: "Окно в прошлое", kk: "Өткенге терезе", en: "Window to the Past" },
  { id: 12, ru: "Лесной старейшина", kk: "Орман қариясы", en: "Forest Elder" },
  { id: 13, ru: "Ключевые виды", kk: "Тірек түрлер", en: "Keystone Species" },
  { id: 14, ru: "Семена возрождения", kk: "Жаңару тұқымдары", en: "Seeds of Renewal" },
  { id: 15, ru: "Биоцентрическая архитектура", kk: "Биоцентрлік сәулет", en: "Biocentric Architecture" },
];
export const DOCKS = {
  mine: { ru: "Шахта", x: 1889, y: 1043, w: 124, h: 124, a: -40, dir: 50 },
  city: { ru: "Город", x: 1283, y: 96, w: 92, h: 135, a: 0, dir: 270 },
  farm: { ru: "Ферма", x: 1002, y: 630, w: 90, h: 132, a: 0, dir: 90 },
};
export const DEFAULT_DOCKS = { mine: 15, city: 14, farm: 13 };
const ECO = { mine: "canopy", city: "skylight", farm: "hatch" };

// ─────────────── геометрия ───────────────
const rad = (d) => (d * Math.PI) / 180;
// прямоугольник: центр, размеры, поворот (градусы); круг: центр и радиус
const box = (x, y, w, h, a = 0) => ({ k: "box", x: x + MX, y, w, h, a });
const circ = (x, y, r) => ({ k: "circle", x: x + MX, y, r });
// зона толчка: робот входит в нее, двигаясь в направлении dir (0 = вправо, 90 = к дальнему борту)
const pushZone = (x, y, dir, L, W) => ({ k: "box", x: x + MX, y, w: W, h: L, a: dir - 90, dir });

function toLocal(s, px, py) {
  const dx = px - s.x, dy = py - s.y, c = Math.cos(rad(-(s.a || 0))), si = Math.sin(rad(-(s.a || 0)));
  return [dx * c - dy * si, dx * si + dy * c];
}
export function inShape(s, px, py, pad = 0) {
  if (s.k === "circle") return Math.hypot(px - s.x, py - s.y) <= s.r + pad;
  const [u, v] = toLocal(s, px, py);
  return Math.abs(u) <= s.w / 2 + pad && Math.abs(v) <= s.h / 2 + pad;
}
// насколько точка вошла в фигуру и куда ее вытолкнуть
function penetration(s, px, py) {
  if (s.k === "circle") {
    const dx = px - s.x, dy = py - s.y, d = Math.hypot(dx, dy);
    if (d >= s.r) return null;
    return d < 1e-6 ? { nx: 1, ny: 0, d: s.r } : { nx: dx / d, ny: dy / d, d: s.r - d };
  }
  const [u, v] = toLocal(s, px, py);
  const ex = s.w / 2 - Math.abs(u), ey = s.h / 2 - Math.abs(v);
  if (ex <= 0 || ey <= 0) return null;
  let lx = 0, ly = 0, d;
  if (ex < ey) { lx = Math.sign(u) || 1; d = ex; } else { ly = Math.sign(v) || 1; d = ey; }
  const c = Math.cos(rad(s.a || 0)), si = Math.sin(rad(s.a || 0));
  return { nx: lx * c - ly * si, ny: lx * si + ly * c, d };
}
// глубина входа точки в зону толчка (0 у входной стороны)
function pushDepth(z, px, py) {
  const [u, v] = toLocal(z, px, py);
  if (Math.abs(u) > z.w / 2 || Math.abs(v) > z.h / 2) return -1;
  return v + z.h / 2;
}
function rayShape(s, ox, oy, fx, fy) {
  if (s.k === "circle") {
    const dx = ox - s.x, dy = oy - s.y, b = dx * fx + dy * fy, c = dx * dx + dy * dy - s.r * s.r, disc = b * b - c;
    if (disc < 0) return Infinity;
    const t = -b - Math.sqrt(disc);
    return t > 0 ? t : Infinity;
  }
  const [lo, lv] = toLocal(s, ox, oy), c = Math.cos(rad(-(s.a || 0))), si = Math.sin(rad(-(s.a || 0)));
  const du = fx * c - fy * si, dv = fx * si + fy * c;
  let t0 = -Infinity, t1 = Infinity;
  for (const [p, d, half] of [[lo, du, s.w / 2], [lv, dv, s.h / 2]]) {
    if (Math.abs(d) < 1e-9) { if (Math.abs(p) > half) return Infinity; continue; }
    let a = (-half - p) / d, b = (half - p) / d;
    if (a > b) [a, b] = [b, a];
    t0 = Math.max(t0, a); t1 = Math.min(t1, b);
  }
  return t0 <= t1 && t0 > 0 ? t0 : Infinity;
}
const dockShape = (name, pad = 0) => { const d = DOCKS[name]; return box(d.x, d.y, d.w + pad, d.h + pad, d.a); };
// точка на «передней» стороне дока (со стороны робота): offset вдоль стороны, out - наружу
function dockFront(name, offset = 0, out = 0) {
  const d = DOCKS[name], back = rad(d.dir + 180), side = rad(d.dir + 90);
  const half = d.dir % 180 === 90 ? d.h / 2 : d.w / 2;
  return [MX + d.x + Math.cos(back) * (half + out) + Math.cos(side) * offset, d.y + Math.sin(back) * (half + out) + Math.sin(side) * offset];
}

// ─────────────── поле ───────────────
export class Bioglow {
  constructor(preset = {}) {
    this.docks = { ...DEFAULT_DOCKS, ...(preset.docks || {}) };
    this.s = {
      droneUp: false, mapFlipped: false, seedsOut: false, flagDown: false, rockFlipped: false, rockBack: false,
      leaf1: false, leaf2: false, katydidMoved: false, katydidOut: false, root: 0, myc: 0, vine: false,
      platform: false, camera: false, treeSeed: false, spiderMoved: false, snailMoved: false, cover: false,
      cane: false, tie: "tree", trees: false, canopy: false, skylight: 0, hatch: false, fragments: 3, antHome: false,
    };
    this.objs = [
      { id: "scan", kind: "scan", x: MX + 1153, y: 165, r: 16 },
      { id: "keystone", kind: "keystone", x: preset.keystone ? preset.keystone.x : 520, y: preset.keystone ? preset.keystone.y : 300, r: 40 },
    ];
    this.tools = { C: { down: false, tip: null }, D: { down: false, tip: null } };
    this.carry = null;
    this.events = [];
    this.pixels = null;
    this.build();
    for (const [k, v] of Object.entries(preset.fieldState || {})) this.s[k] = v; // начальное состояние для заданий
  }

  build() {
    const D = this.docks, dockOf = (m) => Object.keys(D).find((k) => D[k] === m);
    this.dockOf = dockOf;
    // твердые части моделей: робот в них упирается
    this.solids = [
      circ(1153, 61, 34),                    // 01 пилот дрона
      box(639, 543, 52, 52, 45),             // 02 стебель
      box(80, 661, 120, 56),                 // 03 камень у левого борта
      box(135, 1030, 110, 100),              // 04 гнездо с листьями
      box(406, 1112, 40, 52),                // 05 корни у дальнего борта
      circ(578, 1075, 58),                   // 08-09 дерево
      box(1520, 1078, 100, 110),             // 06 гнездо муравьев
      box(1662, 1102, 50, 60),               // 07 мицелий
      box(1409, 596, 78, 78, 45),            // 11 окно в прошлое
      circ(1940, 757, 32),                   // 12 дерево
      box(1941, 546, 30, 60),                // 12 столбик
    ];
    const m15 = dockOf(15);
    if (m15) this.solids.push(dockShape(m15));
    this.fragile = [{ key: "spiderMoved", s: circ(752, 1050, 22) }, { key: "snailMoved", s: circ(1044, 723, 26) }];
    // срабатывания
    const T = [];
    T.push({ m: 1, kind: "push", z: pushZone(1098, 61, 0, 40, 90), need: 12, act: () => { if (!this.s.droneUp) { this.s.droneUp = true; this.ev("Дрон взлетел"); } } });
    T.push({ m: 1, kind: "down", z: box(1153, 128, 70, 50), act: () => { if (this.s.droneUp && !this.s.mapFlipped) { this.s.mapFlipped = true; this.ev("Карта LiDAR перевернута"); } } });
    T.push({ m: 2, kind: "touch", z: circ(639, 543, 62), act: () => this.releaseSeeds() });
    T.push({ m: 3, kind: "push", z: pushZone(158, 661, 180, 36, 56), need: 10, act: () => { if (!this.s.flagDown) { this.s.flagDown = true; this.s.rockFlipped = true; this.ev("Флажок опущен"); } } });
    T.push({ m: 3, kind: "down", z: box(80, 661, 90, 60), act: () => { if (this.s.rockFlipped && !this.s.rockBack) { this.s.rockBack = true; this.ev("Камень на месте"); } } });
    T.push({ m: 4, kind: "up", z: box(100, 965, 30, 30), act: () => { if (!this.s.leaf1) { this.s.leaf1 = true; this.ev("Лист снят"); } } });
    T.push({ m: 4, kind: "up", z: box(170, 965, 30, 30), act: () => { if (!this.s.leaf2) { this.s.leaf2 = true; this.ev("Лист снят"); } } });
    T.push({ m: 4, kind: "updown", z: box(135, 965, 22, 30), act: () => { this.s.katydidMoved = true; } });
    T.push({ m: 5, kind: "push", z: pushZone(406, 1061, 90, 50, 50), need: 15, depth: (d) => { this.s.root = Math.max(this.s.root, d >= 38 ? 2 : 1); } });
    T.push({ m: 6, kind: "down", z: box(1606, 1048, 60, 64), act: () => {
      if (this.s.antHome) return;
      this.s.antHome = true;
      if (Math.abs(this.robotSpeed) > 330) { this.s.fragments = 0; this.ev("Слишком быстро: листья рассыпались"); } else this.ev("Муравей в гнезде");
    } });
    T.push({ m: 7, kind: "push", z: pushZone(1662, 1052, 90, 40, 50), need: 25, act: () => { if (!this.s.myc) { this.s.myc = 1; this.ev("Мицелий вытянут"); } } });
    T.push({ m: 8, kind: "down", z: box(578, 1000, 50, 30), act: () => { if (!this.s.vine) { this.s.vine = true; this.ev("Лиана на мате"); } } });
    T.push({ m: 9, kind: "up", z: box(505, 1062, 30, 60), act: () => { if (!this.s.platform) { this.s.platform = true; this.ev("Платформа поднята"); } } });
    T.push({ m: 9, kind: "down", z: box(652, 1062, 34, 50), act: () => { if (!this.s.camera) { this.s.camera = true; this.ev("Фотоловушка установлена"); } } });
    T.push({ m: 9, kind: "down", z: box(622, 1012, 30, 30), act: () => this.dropTreeSeed() });
    T.push({ m: 11, kind: "down", z: box(1368, 556, 34, 40, 45), act: () => { if (!this.s.cover) { this.s.cover = true; this.ev("Окно открыто"); } } });
    T.push({ m: 12, kind: "up", z: box(1896, 757, 30, 50), act: () => { if (!this.s.cane) { this.s.cane = true; this.ev("Подпорка поднята"); } } });
    T.push({ m: 12, kind: "up", z: box(1940, 712, 40, 26), act: () => { if (this.s.tie === "tree") { this.s.tie = "robot"; this.ev("Стяжка на навесном"); } } });
    T.push({ m: 12, kind: "down", z: box(1941, 546, 50, 80), act: () => { if (this.s.tie === "robot") { this.s.tie = "post"; this.ev("Стяжка на столбике"); } } });
    // модели на доках
    for (const [dock, m] of Object.entries(D)) {
      const d = DOCKS[dock];
      if (m === 13) T.push({ m: 13, kind: "up", z: dockShape(dock, 30), act: () => { if (!this.s.trees) { this.s.trees = true; this.ev("Молодые деревья подняты"); } } });
      if (m === 15) {
        const [ax, ay] = dockFront(dock, -32, 14), [bx, by] = dockFront(dock, 0, 18), [cx, cy] = dockFront(dock, 32, 14);
        T.push({ m: 15, kind: "up", z: { k: "box", x: ax, y: ay, w: 30, h: 28, a: d.a }, act: () => { if (!this.s.canopy) { this.s.canopy = true; this.ev("Навес для гнезд поднят"); } } });
        T.push({ m: 15, kind: "push", z: { k: "box", x: bx, y: by, w: 30, h: 36, a: d.dir - 90, dir: d.dir }, need: 14, act: () => { if (!this.s.skylight) { this.s.skylight = 1; this.ev("Окно сада задвинуто"); } } });
        T.push({ m: 15, kind: "down", z: { k: "box", x: cx, y: cy, w: 30, h: 28, a: d.a }, act: () => { if (!this.s.hatch) { this.s.hatch = true; this.ev("Компостный люк открыт"); } } });
      }
    }
    this.triggers = T.map((t) => ({ ...t, t: 0 }));
  }

  ev(text) { this.events.push(text); }

  releaseSeeds() {
    if (this.s.seedsOut) return;
    this.s.seedsOut = true;
    for (const [i, [dx, dy]] of [[-96, 30], [86, 72], [12, -102]].entries()) this.objs.push({ id: "seed" + i, kind: "seed", x: MX + 639 + dx, y: 543 + dy, r: 18 });
    this.ev("Семена выброшены");
  }
  dropTreeSeed() {
    if (this.s.treeSeed) return;
    this.s.treeSeed = true;
    this.objs.push({ id: "seed3", kind: "seed", x: MX + 622, y: 968, r: 18 });
    this.ev("Семечко упало с дерева");
  }

  // ─── мат: цвет для датчиков ───
  async load(url) {
    if (!url || this.pixels || typeof fetch === "undefined" || typeof createImageBitmap === "undefined") return;
    try {
      const blob = await (await fetch(url)).blob();
      const bmp = await createImageBitmap(blob);
      const cv = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(bmp.width, bmp.height) : null;
      if (!cv) return;
      const ctx = cv.getContext("2d");
      ctx.drawImage(bmp, 0, 0);
      this.pixels = { w: bmp.width, h: bmp.height, data: ctx.getImageData(0, 0, bmp.width, bmp.height).data };
    } catch (e) { this.pixels = null; }
  }
  colorAt(x, y) {
    if (x < 0 || y < 0 || x > TABLE_W || y > TABLE_H) return [90, 90, 90];
    const u = x - MX;
    if (u < 0 || u > FIELD_W) return [60, 60, 62];           // стол рядом с матом
    const P = this.pixels;
    if (!P) return [235, 235, 230];
    const px = Math.min(P.w - 1, Math.max(0, Math.floor((u / FIELD_W) * P.w)));
    const py = Math.min(P.h - 1, Math.max(0, Math.floor((1 - y / TABLE_H) * P.h)));
    const i = (py * P.w + px) * 4;
    return [P.data[i], P.data[i + 1], P.data[i + 2]];
  }

  // ─── робот и поле ───
  bodyPoints(robot, BODY) {
    const pts = [];
    for (let r = -BODY.half; r <= BODY.half; r += 20) { pts.push(robot.local2world(BODY.front, r)); pts.push(robot.local2world(-BODY.back, r)); }
    for (let f = -BODY.back + 20; f < BODY.front; f += 25) { pts.push(robot.local2world(f, -BODY.half)); pts.push(robot.local2world(f, BODY.half)); }
    return pts;
  }

  collide(robot, BODY) {
    for (let it = 0; it < 3; it++) {
      let mx = 0, my = 0;
      for (const q of this.bodyPoints(robot, BODY)) for (const s of this.solids) {
        const p = penetration(s, q.x, q.y);
        if (p && p.d > 0) {
          const vx = p.nx * p.d, vy = p.ny * p.d;
          if (Math.abs(vx) > Math.abs(mx)) mx = vx;
          if (Math.abs(vy) > Math.abs(my)) my = vy;
        }
      }
      if (!mx && !my) break;
      robot.pose.x += mx; robot.pose.y += my;
    }
  }

  toolTip(robot, BODY, port, ang) {
    const reach = 110 * Math.sin(Math.max(0, Math.min(180, ang)) * Math.PI / 180);
    return robot.local2world(BODY.front + Math.max(10, reach), port === "D" ? 40 : 0);
  }

  update(robot, BODY, dt) {
    const s = this.s, body = this.bodyPoints(robot, BODY);
    this.robotSpeed = robot.speedMm || 0;
    const front = [];
    for (let r = -BODY.half + 10; r <= BODY.half - 10; r += 15) front.push(robot.local2world(BODY.front, r));
    // навесное на моторах C и D
    const toolEvents = [];
    for (const port of ["C", "D"]) {
      const m = robot.motors[port];
      if (!m || !String(robot.ports[port]).startsWith("motor")) continue;
      const tl = this.tools[port], a = m.pos, tip = this.toolTip(robot, BODY, port, a);
      // опустили (угол 60 и больше) - событие «down» там, где кончик коснулся; подняли (30 и меньше) - «up» там,
      // где кончик был ниже всего (за эту точку навесное зацепило деталь)
      const depth = Math.sin(Math.max(0, Math.min(180, a)) * Math.PI / 180);
      if (!tl.down && a >= 60) { tl.down = true; tl.downTip = tip; tl.deep = depth; tl.lastDownTip = tip; toolEvents.push({ kind: "down", tip }); }
      else if (tl.down && a <= 30) { tl.down = false; toolEvents.push({ kind: "up", tip: tl.lastDownTip || tip }); }
      if (tl.down && depth >= tl.deep) { tl.deep = depth; tl.lastDownTip = tip; }
      tl.tip = tip;
    }
    for (const t of this.triggers) {
      if (t.kind === "push") {
        // толкать нужно лицом к модели, а не боком или задом
        const hd = (robot.pose.h * 180 / Math.PI) + 90;
        let diff = ((hd - t.z.dir) % 360 + 540) % 360 - 180;
        if (Math.abs(diff) > 30 || (robot.speedMm || 0) < 15) continue;
        let d = -1;
        for (const q of front) d = Math.max(d, pushDepth(t.z, q.x, q.y));
        if (t.depth && d >= t.need) t.depth(d);
        if (!t.depth && d >= t.need) t.act();
      } else if (t.kind === "touch") {
        const hit = front.some((q) => inShape(t.z, q.x, q.y)) || Object.values(this.tools).some((tl) => tl.tip && inShape(t.z, tl.tip.x, tl.tip.y));
        t.t = hit ? t.t + dt : 0;
        if (t.t > 0.12) t.act();
      } else {
        for (const e of toolEvents) if ((t.kind === e.kind || t.kind === "updown") && inShape(t.z, e.tip.x, e.tip.y, t.kind === "updown" ? 0 : 12)) t.act();
      }
    }
    // кузнечик: робот задел гнездо в середине или вытолкнул кузнечика
    const kz = circ(135, 966, 16);
    if (body.some((q) => inShape(kz, q.x, q.y))) { s.katydidMoved = true; if (front.some((q) => inShape(kz, q.x, q.y, -6))) s.katydidOut = true; }
    // хрупкие микроэкосистемы
    for (const f of this.fragile) {
      if (s[f.key]) continue;
      const tipHit = Object.values(this.tools).some((tl) => tl.tip && inShape(f.s, tl.tip.x, tl.tip.y, 4));
      if (tipHit || body.some((q) => inShape(f.s, q.x, q.y, 4))) { s[f.key] = true; this.ev("Микроэкосистема сдвинута!"); }
    }
    // свободные предметы толкает корпус робота
    for (const o of this.objs) {
      robot.pushCircle(o);
      for (const so of this.solids) {
        const p = penetration(so, o.x, o.y);
        if (p) { o.x += p.nx * (p.d + o.r * 0.2); o.y += p.ny * (p.d + o.r * 0.2); }
      }
      o.x = Math.max(o.r, Math.min(TABLE_W - o.r, o.x)); o.y = Math.max(o.r, Math.min(TABLE_H - o.r, o.y));
    }
  }

  raycast(ox, oy, fx, fy) {
    let best = Infinity;
    for (const sh of this.solids) best = Math.min(best, rayShape(sh, ox, oy, fx, fy));
    for (const o of this.objs) best = Math.min(best, rayShape({ k: "circle", x: o.x, y: o.y, r: o.r }, ox, oy, fx, fy));
    return best;
  }

  // ─── очки по книге правил ───
  score() {
    const s = this.s, rows = [], D = this.docks;
    const add = (m, pts, max, parts) => rows.push({ m, pts, max, parts });
    const obj = (id) => this.objs.find((o) => o.id === id);
    const scan = obj("scan");
    const survey = box(1052, 231, 76, 76, 30);
    const scanIn = scan && (inShape(survey, scan.x, scan.y, scan.r * 0.6));
    add(1, (s.droneUp ? 20 : 0) + (s.droneUp && s.mapFlipped && scanIn ? 10 : 0), 30,
      [["Дрон не касается мата", s.droneUp, 20], ["Бонус: карта перевернута, метка в зоне", s.droneUp && s.mapFlipped && scanIn, 10]]);
    const stalkSeeds = this.objs.filter((o) => /^seed[012]$/.test(o.id) && Math.hypot(o.x - MX - 639, o.y - 543) > 48).length;
    add(2, stalkSeeds * 10, 30, [["Семена не касаются стебля: " + stalkSeeds + " из 3", stalkSeeds > 0, stalkSeeds * 10]]);
    add(3, (s.flagDown ? 20 : 0) + (s.flagDown && s.rockBack ? 10 : 0), 30,
      [["Флажок опущен", s.flagDown, 20], ["Бонус: камень вернулся на место", s.flagDown && s.rockBack, 10]]);
    const leaves = (s.leaf1 ? 1 : 0) + (s.leaf2 ? 1 : 0);
    const m4 = s.katydidOut ? 0 : (leaves >= 1 ? 10 : 0) + (leaves === 2 && !s.katydidMoved ? 20 : 0);
    add(4, m4, 30, [["Один лист снят", leaves >= 1 && !s.katydidOut, 10], ["Бонус: второй лист, кузнечик на месте", leaves === 2 && !s.katydidMoved && !s.katydidOut, 20],
      ...(s.katydidOut ? [["Кузнечик вне зоны: 0 очков за миссию", false, 0]] : [])]);
    add(5, s.root === 2 ? 20 : s.root === 1 ? 10 : 0, 20, [["Корень вытянут частично (10) или полностью (20)", s.root > 0, s.root === 2 ? 20 : s.root * 10]]);
    const m6 = s.antHome ? s.fragments * 10 : 0;
    add(6, m6, 30, [["Муравей у гнезда, листья в гнезде: " + (s.antHome ? s.fragments : 0) + " из 3", m6 > 0, m6]]);
    add(7, s.myc ? 20 : 0, 30, [["Мицелий полностью вытянут", !!s.myc, 20], ["Бонус с соседним столом (в симуляторе нет соперника)", false, 0]]);
    add(8, s.vine ? 30 : 0, 30, [["Лиана касается мата", s.vine, 30]]);
    const treeSeed = obj("seed3"), seedOff = !!treeSeed && Math.hypot(treeSeed.x - MX - 578, treeSeed.y - 1075) > 64;
    add(9, (s.platform ? 10 : 0) + (s.camera ? 10 : 0) + (seedOff ? 10 : 0), 30,
      [["Платформа поднята", s.platform, 10], ["Фотоловушка установлена", s.camera, 10], ["Семечко не касается дерева", seedOff, 10]]);
    add(10, (s.spiderMoved ? 0 : 10) + (s.snailMoved ? 0 : 10), 20,
      [["Дом паука на месте", !s.spiderMoved, 10], ["Дом улитки на месте", !s.snailMoved, 10]]);
    add(11, s.cover ? 20 : 0, 20, [["Крышка корней опущена до мата", s.cover, 20]]);
    add(12, (s.cane ? 20 : 0) + (s.tie === "post" ? 10 : 0), 30, [["Подпорка поднята и касается дерева", s.cane, 20], ["Стяжка вокруг столбика", s.tie === "post", 10]]);
    const d13 = this.dockOf(13), d14 = this.dockOf(14), d15 = this.dockOf(15);
    const ks = obj("keystone"), ksOn = !!(d13 && ks && inShape(dockShape(d13, 10), ks.x, ks.y));
    add(13, ksOn && s.trees ? 30 : 0, 30, [["Ключевой вид на платформе", ksOn, 0], ["и молодые деревья подняты", ksOn && s.trees, 30]]);
    const inSt = d14 ? this.objs.filter((o) => o.kind === "seed" && inShape(dockShape(d14, 4), o.x, o.y)).length : 0;
    add(14, inSt * 10, 40, [["Семена в станции: " + inSt + " (5 + 5 бонус за каждое)", inSt > 0, inSt * 10]]);
    const eco = d15 && ((ECO[d15] === "canopy" && s.canopy) || (ECO[d15] === "skylight" && s.skylight) || (ECO[d15] === "hatch" && s.hatch));
    add(15, (s.canopy ? 10 : 0) + (s.skylight ? 10 : 0) + (s.hatch ? 10 : 0) + (eco ? 10 : 0), 40,
      [["Навес для гнезд поднят", s.canopy, 10], ["Окно сада полностью задвинуто", !!s.skylight, 10], ["Компостный люк открыт", s.hatch, 10],
        ["Экобонус дока «" + (d15 ? DOCKS[d15].ru : "-") + "»", !!eco, 10]]);
    const total = rows.reduce((a, r) => a + r.pts, 0) + 50 + 20;
    return { rows, tokens: 50, inspection: 20, total };
  }

  snapshot() {
    return { s: { ...this.s }, docks: this.docks, objs: this.objs.map((o) => ({ id: o.id, kind: o.kind, x: Math.round(o.x), y: Math.round(o.y), r: o.r })), score: this.score() };
  }
}

// ─────────────── отрисовка (главный поток) ───────────────
const C = { plate: "#9ca3af", plateDark: "#4b5563", green: "#16a34a", lime: "#84cc16", brown: "#7c4a21", red: "#dc2626", yellow: "#facc15",
  white: "#f8fafc", black: "#111827", tan: "#d6b37a", blue: "#2563eb", orange: "#ea580c", pink: "#db2777" };

function shapePath(ctx, s, pad = 0) {
  ctx.beginPath();
  if (s.k === "circle") { ctx.arc(s.x, s.y, s.r + pad, 0, Math.PI * 2); return; }
  ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(rad(s.a || 0)); ctx.rect(-s.w / 2 - pad, -s.h / 2 - pad, s.w + 2 * pad, s.h + 2 * pad); ctx.restore();
}
function fillShape(ctx, s, fill, stroke, lw = 4, pad = 0) {
  shapePath(ctx, s, pad);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function studs(ctx, s, color = "rgba(255,255,255,.35)") {
  if (s.k !== "box") return;
  ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(rad(s.a || 0)); ctx.fillStyle = color;
  for (let x = -s.w / 2 + 8; x < s.w / 2; x += 16) for (let y = -s.h / 2 + 8; y < s.h / 2; y += 16) { ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
function badge(ctx, text, x, y, label) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, -1);
  ctx.fillStyle = "#dc2626"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(-24, -20, 48, 40, 9); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.font = "700 26px Inter, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 1);
  if (label) { ctx.font = "600 17px Inter, system-ui, sans-serif"; ctx.fillStyle = "rgba(15,23,42,.85)"; ctx.fillText(label, 0, 34); }
  ctx.restore();
}

/** Нарисовать стол, мат и модели. ctx уже в мм (y вверх). fs - снимок поля, img - рисунок мата. */
export function drawBioglow(ctx, fs, img, opt = {}) {
  ctx.fillStyle = "#2b2b2e"; ctx.fillRect(0, 0, TABLE_W, TABLE_H);
  if (img && img.complete && img.naturalWidth) {
    ctx.save(); ctx.translate(MX, TABLE_H); ctx.scale(1, -1); ctx.drawImage(img, 0, 0, FIELD_W, TABLE_H); ctx.restore();
  } else { ctx.fillStyle = "#4d7c3a"; ctx.fillRect(MX, 0, FIELD_W, TABLE_H); }
  if (!fs) return;
  const s = fs.s, P = (x, y) => [x + MX, y];
  const on = (cond, a, b) => (cond ? a : b);
  // 01 дрон: пилот, рама, дрон, карта
  fillShape(ctx, circ(1153, 61, 34), C.plate, C.plateDark);
  fillShape(ctx, box(1153, 61, 14, 14), C.red);
  ctx.strokeStyle = C.black; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(...P(1110, 30)); ctx.lineTo(...P(1110, 130)); ctx.moveTo(...P(1196, 30)); ctx.lineTo(...P(1196, 130)); ctx.stroke();
  fillShape(ctx, box(1153, 128, 56, 36), on(s.mapFlipped, "#475569", C.lime), C.plateDark, 3);
  if (s.droneUp) { ctx.globalAlpha = 0.9; fillShape(ctx, box(1153, 175, 40, 40), "#67e8f9", "#0e7490", 4); ctx.globalAlpha = 1; }
  else fillShape(ctx, box(1153, 95, 30, 30), "#67e8f9", "#0e7490", 3);
  // 02 стебель и семена
  fillShape(ctx, box(639, 543, 52, 52, 45), C.plate, C.plateDark); fillShape(ctx, circ(639, 543, 14), C.lime, C.green, 3);
  if (!s.seedsOut) for (const [dx, dy] of [[-40, 20], [38, 30], [5, -44]]) fillShape(ctx, circ(639 + dx, 543 + dy, 13), C.brown, "#451a03", 3);
  // 03 камень и флажок
  fillShape(ctx, box(80, 661, 120, 56), on(s.rockFlipped && !s.rockBack, "#a8a29e", "#57534e"), C.black);
  studs(ctx, box(80, 661, 120, 56));
  fillShape(ctx, box(150, on(s.flagDown, 640, 690), 14, 30), C.red, "#7f1d1d", 3);
  // 04 гнездо, листья, кузнечик
  fillShape(ctx, box(135, 1030, 110, 100), "#166534", "#052e16");
  if (!s.leaf1) fillShape(ctx, box(100, 985, 34, 18), C.lime, C.green, 3);
  if (!s.leaf2) fillShape(ctx, box(170, 985, 34, 18), C.lime, C.green, 3);
  fillShape(ctx, circ(135, s.katydidOut ? 930 : 985, 11), s.katydidMoved ? C.orange : "#22c55e", "#14532d", 3);
  // 05 корни
  fillShape(ctx, box(406, 1112, 40, 52), C.plate, C.plateDark);
  fillShape(ctx, box(406, s.root === 2 ? 1060 : s.root === 1 ? 1080 : 1095, 16, 40), C.brown, "#451a03", 3);
  // 08-09 дерево: ствол, крона, платформа, лиана, фотоловушка
  fillShape(ctx, circ(578, 1075, 58), "rgba(21,128,61,.85)", "#14532d");
  fillShape(ctx, circ(578, 1075, 22), C.brown, "#451a03", 3);
  fillShape(ctx, box(520, 1062, 34, 54), on(s.platform, C.tan, "#a16207"), "#713f12", 3);
  ctx.strokeStyle = on(s.vine, C.lime, C.green); ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(...P(578, 1030)); ctx.lineTo(...P(578, s.vine ? 990 : 1010)); ctx.stroke();
  fillShape(ctx, box(652, 1062, 18, 26), on(s.camera, C.black, "#64748b"), C.black, 2);
  // 10 хрупкие
  fillShape(ctx, circ(752, 1050, 22), on(s.spiderMoved, "#fca5a5", C.white), C.black, 3);
  fillShape(ctx, circ(1044, 723, 26), on(s.snailMoved, "#fca5a5", C.yellow), "#854d0e", 3);
  // 06 муравейник и 07 мицелий
  fillShape(ctx, box(1520, 1078, 100, 110), C.tan, "#92400e"); studs(ctx, box(1520, 1078, 100, 110), "rgba(146,64,14,.35)");
  for (let i = 0; i < 3; i++) if (i < s.fragments) fillShape(ctx, box(1495 + i * 25, 1095, 16, 34), [C.yellow, C.orange, C.green][i], null);
  fillShape(ctx, circ(s.antHome ? 1584 : 1606, 1048, 17), C.red, "#7f1d1d", 3);
  fillShape(ctx, box(1662, 1102, 50, 60), C.white, "#64748b");
  if (s.myc) fillShape(ctx, box(1662, 1050, 18, 60), C.white, "#64748b", 3);
  // 11 окно в прошлое
  fillShape(ctx, box(1409, 596, 78, 78, 45), "#78350f", "#451a03");
  fillShape(ctx, box(1381, 568, 60, 14, 45), on(s.cover, C.red, "#991b1b"), "#7f1d1d", 3, on(s.cover, 6, 0));
  // 12 старый лес
  fillShape(ctx, circ(1940, 757, 32), "#a16207", "#713f12"); fillShape(ctx, circ(1940, 757, 13), "#d6b37a", null);
  fillShape(ctx, box(1941, 546, 30, 60), C.plate, C.plateDark);
  ctx.strokeStyle = C.brown; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(...P(1900, s.cane ? 790 : 720)); ctx.lineTo(...P(1928, 757)); ctx.stroke();
  const tie = s.tie === "post" ? [1941, 546] : s.tie === "tree" ? [1940, 716] : null;
  if (tie) { ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(MX + tie[0], tie[1], 22, 0, Math.PI * 2); ctx.stroke(); }
  // доки и модели 13-15
  for (const [dock, d] of Object.entries(DOCKS)) {
    const m = fs.docks[dock], sh = box(d.x, d.y, d.w, d.h, d.a);
    if (m === 13) { fillShape(ctx, sh, "#1f2937", "#111827"); studs(ctx, sh); fillShape(ctx, box(d.x, d.y, d.w - 30, 26, d.a), on(s.trees, "#22c55e", "#166534"), null); }
    else if (m === 14) { fillShape(ctx, sh, "rgba(120,53,15,.55)", "#451a03", 6); }
    else if (m === 15) {
      fillShape(ctx, sh, "#a3a36a", "#3f3f1f"); studs(ctx, sh, "rgba(255,255,255,.25)");
      fillShape(ctx, box(d.x, d.y, d.w - 34, d.h - 50, d.a), on(s.skylight, "#334155", "#94a3b8"), C.red, 3);
      if (s.canopy) fillShape(ctx, box(d.x, d.y, 30, 30, d.a), C.lime, C.green, 2);
      if (s.hatch) fillShape(ctx, box(d.x, d.y, 18, 18, d.a + 45), "#78350f", null);
    } else fillShape(ctx, sh, null, "rgba(255,255,255,.7)", 3);
    if (opt.labels) {
      ctx.save(); ctx.translate(MX + d.x, d.y < 300 ? d.y + d.h / 2 + 26 : d.y - d.h / 2 - 22); ctx.scale(1, -1);
      ctx.font = "700 22px Inter, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.lineWidth = 6; ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.strokeText(d.ru, 0, 0); ctx.fillStyle = "#0f172a"; ctx.fillText(d.ru, 0, 0);
      ctx.restore();
    }
  }
  // свободные предметы
  for (const o of fs.objs) {
    if (o.kind === "seed") fillShape(ctx, { k: "circle", x: o.x, y: o.y, r: o.r }, C.brown, "#451a03", 3);
    else if (o.kind === "scan") fillShape(ctx, { k: "circle", x: o.x, y: o.y, r: o.r }, "#22d3ee", "#0e7490", 3);
    else if (o.kind === "keystone") { fillShape(ctx, { k: "circle", x: o.x, y: o.y, r: o.r }, C.pink, "#831843", 4); studs(ctx, { k: "box", x: o.x, y: o.y, w: 50, h: 50 }); }
  }
  // номера миссий как на карте книги правил
  if (opt.labels) {
    const L = [[1, 1153, 210], [2, 639, 625], [3, 80, 720], [4, 135, 920], [5, 406, 1010], [6, 1520, 990], [7, 1662, 1000], [8, 520, 960],
      [9, 640, 960], [10, 752, 990], [10, 1110, 723], [11, 1409, 500], [12, 1940, 690]];
    for (const [n, x, y] of L) badge(ctx, String(n).padStart(2, "0"), MX + x, y);
    for (const [dock, d] of Object.entries(DOCKS)) badge(ctx, String(fs.docks[dock]), MX + d.x, d.y);
  }
}
