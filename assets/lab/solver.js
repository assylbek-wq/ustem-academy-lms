// Расчет цепи постоянного тока методом узловых потенциалов.
// Все источники заданы с внутренним сопротивлением (эквивалент Нортона), поэтому
// хватает матрицы проводимостей G и вектора токов I. Светодиоды - кусочно-линейная модель.

const LEAK = 1e-9; // утечка каждого узла на землю: плавающие участки цепи не ломают расчет

function gauss(A, b) {
  const n = b.length;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    if (Math.abs(A[p][c]) < 1e-18) continue;
    if (p !== c) { [A[p], A[c]] = [A[c], A[p]]; [b[p], b[c]] = [b[c], b[p]]; }
    for (let r = c + 1; r < n; r++) {
      const f = A[r][c] / A[c][c];
      if (!f) continue;
      for (let k = c; k < n; k++) A[r][k] -= f * A[c][k];
      b[r] -= f * b[c];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let k = r + 1; k < n; k++) s -= A[r][k] * x[k];
    x[r] = Math.abs(A[r][r]) < 1e-18 ? 0 : s / A[r][r];
  }
  return x;
}

/**
 * elements: [{type:'R', a, b, r} | {type:'V', p, n, v, r} | {type:'D', a, k, vf, rs, key}]
 * Узлы - целые числа 0..nodeCount-1, узел 0 - земля.
 * Возвращает {v: напряжения узлов, diodes: {key: {on, i}}, current(el)}.
 */
// Транзистор NPN: переход база-эмиттер - диод, участок коллектор-эмиттер - сопротивление,
// которое падает с ростом тока базы (ток коллектора не больше beta x Iб, насыщение около 0,2 В).
const VBE = 0.65, RBE = 50, VSAT = 0.2;

export function solve(nodeCount, elements) {
  // Переход база-эмиттер каждого транзистора считаем как диод
  for (const q of elements.filter((e) => e.type === "Q")) q.$d ||= { type: "D", a: q.b, k: q.e, vf: VBE, rs: RBE, key: q.key + ":be", q };
  const all = elements.flatMap((e) => (e.type === "Q" ? [e, e.$d] : [e]));
  const diodes = all.filter((e) => e.type === "D");
  const trans = elements.filter((e) => e.type === "Q");
  const on = new Map(diodes.map((d) => [d, false]));
  const ib = new Map(trans.map((q) => [q, 0]));
  let v = new Array(nodeCount).fill(0);
  for (let iter = 0; iter < 60; iter++) {
    const n = nodeCount - 1;
    const G = Array.from({ length: n }, () => new Array(n).fill(0));
    const I = new Array(n).fill(0);
    for (let i = 0; i < n; i++) G[i][i] += LEAK;
    const stamp = (a, b, g) => {
      if (a > 0) G[a - 1][a - 1] += g;
      if (b > 0) G[b - 1][b - 1] += g;
      if (a > 0 && b > 0) { G[a - 1][b - 1] -= g; G[b - 1][a - 1] -= g; }
    };
    const inject = (node, cur) => { if (node > 0) I[node - 1] += cur; };
    for (const e of all) {
      if (e.type === "Q") { const ic = 100 * ib.get(e); stamp(e.c, e.e, Math.min(5, Math.max(1e-9, ic / VSAT))); continue; }
      if (e.type === "R") stamp(e.a, e.b, 1 / Math.max(e.r, 1e-6));
      else if (e.type === "V") { const g = 1 / Math.max(e.r, 1e-6); stamp(e.p, e.n, g); inject(e.p, e.v * g); inject(e.n, -e.v * g); }
      else if (e.type === "D") {
        if (on.get(e)) { const g = 1 / e.rs; stamp(e.a, e.k, g); inject(e.a, e.vf * g); inject(e.k, -e.vf * g); }
        else stamp(e.a, e.k, 1e-9);
      }
    }
    const x = gauss(G, I);
    v = [0, ...x];
    let changed = false;
    for (const d of diodes) {
      const vd = v[d.a] - v[d.k];
      const isOn = on.get(d);
      if (!isOn && vd > d.vf + 1e-6) { on.set(d, true); changed = true; }
      else if (isOn && vd < d.vf - 1e-6) { on.set(d, false); changed = true; }
    }
    for (const q of trans) {
      const d = q.$d;
      const cur = on.get(d) ? Math.max(0, (v[d.a] - v[d.k] - d.vf) / d.rs) : 0;
      const prev = ib.get(q);
      if (Math.abs(cur - prev) > 1e-7 + 0.01 * prev) { ib.set(q, prev + 0.6 * (cur - prev)); changed = true; }
    }
    if (!changed) break;
  }
  const result = { v, diodes: {}, trans: {} };
  for (const q of trans) result.trans[q.key] = { ib: ib.get(q), ic: Math.max(0, (v[q.c] - v[q.e]) * Math.min(5, Math.max(1e-9, 100 * ib.get(q) / VSAT))) };
  for (const d of diodes) {
    const isOn = on.get(d);
    const i = isOn ? (v[d.a] - v[d.k] - d.vf) / d.rs : 0;
    result.diodes[d.key] = { on: isOn && i > 0, i: Math.max(0, i) };
  }
  result.current = (e) => {
    if (e.type === "R") return (v[e.a] - v[e.b]) / Math.max(e.r, 1e-6);
    if (e.type === "V") return (e.v - (v[e.p] - v[e.n])) / Math.max(e.r, 1e-6);
    return 0;
  };
  return result;
}

/** Объединение пинов в узлы (электрические цепи). */
export class Nets {
  constructor() { this.parent = new Map(); }
  find(k) {
    if (!this.parent.has(k)) this.parent.set(k, k);
    let p = this.parent.get(k);
    if (p !== k) { p = this.find(p); this.parent.set(k, p); }
    return p;
  }
  union(a, b) { const ra = this.find(a), rb = this.find(b); if (ra !== rb) this.parent.set(ra, rb); }
}
