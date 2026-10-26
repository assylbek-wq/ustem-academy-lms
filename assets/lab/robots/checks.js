// Проверки задания по записи симуляции. Каждая проверка: { ok, text, value }.
import { ROBOTS } from "./models.js";

const deg = (r) => (r * 180) / Math.PI;
const f = (x, d = 2) => Number(x).toFixed(d).replace(".", ",");

function holdTime(rows, pred, from = 0) {
  let best = 0, start = null;
  for (const r of rows) {
    if (r.t < from) continue;
    if (pred(r)) { if (start == null) start = r.t; best = Math.max(best, r.t - start); } else start = null;
  }
  return best;
}
function target(c, robot) {
  if (Array.isArray(c.target)) return c.target;
  return ROBOTS[robot].poses[c.target || "stand"];
}
const tail = (rows, sec) => { const t1 = rows[rows.length - 1].t; return rows.filter((r) => r.t >= t1 - sec); };

export function evaluate(preset, res, code = "") {
  const rows = res.rows;
  const out = [];
  for (const c of preset.checks || []) {
    let ok = false, value = "";
    const from = c.from || 0;
    if (c.type === "upright") {
      const fell = rows.find((r) => r.t >= from && r.fell);
      ok = !fell; value = fell ? `упал на ${f(fell.t, 1)} с` : `наклон до ${Math.round(deg(res.maxTilt))}°`;
    } else if (c.type === "height") {
      const h = holdTime(rows, (r) => r.z >= c.min && r.z <= (c.max ?? 9) && !r.fell, from);
      ok = h >= (c.hold || 0) - 0.03; value = `держал ${f(h, 1)} с`;
    } else if (c.type === "below") {
      const zmin = Math.min(...rows.filter((r) => r.t >= from).map((r) => r.z));
      ok = zmin <= c.z; value = `ниже всего ${f(zmin)} м`;
    } else if (c.type === "pose") {
      const tgt = target(c, res.robot);
      const idx = c.joints || tgt.map((_, i) => i);
      const tr = tail(rows, 0.3);
      let worst = 0;
      for (const i of idx) for (const r of tr) worst = Math.max(worst, Math.abs(r.q[i] - tgt[i]));
      ok = worst <= (c.tol || 0.1); value = `ошибка до ${f(worst)} рад`;
    } else if (c.type === "reach") {
      let best = 1e9, at = null;
      for (const r of rows) {
        const dd = c.y == null ? Math.max(0, c.x - r.x) : Math.hypot(r.x - c.x, r.y - c.y);
        if (dd < best) best = dd;
        if (dd <= (c.r || 0) && at == null && !r.fell) at = r.t;
      }
      ok = at != null && (c.by == null || at <= c.by);
      value = at != null ? `за ${f(at, 1)} с` : `не хватило ${f(best)} м`;
    } else if (c.type === "visit") {
      let k = 0, at = null;
      for (const r of rows) {
        if (k >= c.points.length || r.fell) break;
        const [px, py] = c.points[k];
        if (Math.hypot(r.x - px, r.y - py) <= (c.r || 0.3)) { k++; if (k === c.points.length) at = r.t; }
      }
      ok = k === c.points.length; value = ok ? `все точки за ${f(at, 1)} с` : `пройдено ${k} из ${c.points.length}`;
    } else if (c.type === "rp") {
      const key = c.axis === "roll" ? "roll" : "pitch";
      const lo = (c.min ?? -180) * Math.PI / 180, hi = (c.max ?? 180) * Math.PI / 180;
      const hd = holdTime(rows, (r) => r[key] >= lo && r[key] <= hi && !r.fell, from);
      ok = hd >= (c.hold || 0) - 0.03; value = `держал ${f(hd, 1)} с`;
    } else if (c.type === "kpmax") {
      const worst = Math.max(...c.joints.map((i) => res.maxKp[i]));
      ok = worst <= c.max; value = `kp до ${Math.round(worst)}`;
    } else if (c.type === "zone") {
      const r = rows[rows.length - 1];
      const dd = Math.hypot(r.x - c.x, r.y - c.y);
      ok = dd <= c.r; value = `в конце ${f(dd)} м от центра`;
    } else if (c.type === "yaw") {
      const y = deg(rows[rows.length - 1].yaw - rows[0].yaw);
      ok = Math.abs(y - c.deg) <= (c.tol || 15); value = `поворот ${Math.round(y)}°`;
    } else if (c.type === "nohit") {
      ok = !res.hits; value = res.hits ? `касание на ${f(res.hitT, 1)} с` : "без касаний";
    } else if (c.type === "wave") {
      const qs = rows.filter((r) => r.t >= from).map((r) => r.q[c.joint]);
      const mid = (Math.max(...qs) + Math.min(...qs)) / 2;
      let n = 0, side = 0, peak = 0;
      for (const q of qs) {
        const s = q > mid ? 1 : -1;
        peak = Math.max(peak, Math.abs(q - mid));
        if (s !== side) { if (side !== 0 && peak >= c.amp / 2) n++; side = s; peak = 0; }
      }
      const amp = Math.max(...qs) - Math.min(...qs);
      ok = n >= (c.count || 4) * 2 - 1 && amp >= c.amp; value = `${Math.floor((n + 1) / 2)} взмахов, размах ${Math.round(deg(amp))}°`;
    } else if (c.type === "smooth") {
      ok = res.maxDq <= c.maxdq; value = `скорость сустава до ${f(res.maxDq, 1)} рад/с`;
    } else if (c.type === "nosat") {
      ok = res.satShare <= (c.share ?? 0.05); value = `упор в предел момента ${Math.round(res.satShare * 100)}% времени`;
    } else if (c.type === "track") {
      const rs = rows.filter((r) => r.t >= from);
      let s = 0;
      for (const r of rs) for (const i of c.joints) s += Math.abs(r.q[i] - r.qd[i]);
      const e = s / Math.max(1, rs.length * c.joints.length);
      ok = e <= c.tol; value = `средняя ошибка ${f(e, 3)} рад`;
    } else if (c.type === "still") {
      const r = tail(rows, 0.5);
      const v = Math.max(...r.map((x) => Math.abs(x.vx)));
      ok = v <= (c.v || 0.05); value = `скорость ${f(v)} м/с`;
    } else if (c.type === "code") {
      ok = new RegExp(c.re).test(code); value = ok ? "есть" : "нет";
    }
    out.push({ ok, text: c.text, value });
  }
  return out;
}
