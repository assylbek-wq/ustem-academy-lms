// Проверки заданий CubeSat: конструкция (сразу, без полета) и запись последнего полета.
import { inspect, items } from "./model.js";
import { missionScore, score } from "./score.js";
import { flightCheck, hasSensor, need } from "../sat/checks.js";

export function evalCheck(c, ctx) {
  const { config, flight, res, extra = {} } = ctx;
  const ins = ctx.ins || inspect(config, flight);
  const fl = ins.flight;
  switch (c.type) {
    case "inspect": { const k = ins.checks.find((x) => x.key === c.key); return need(k && k.ok, k && k.value); }
    case "inspect_all": { const bad = ins.checks.filter((x) => !x.ok && !x.optional); return need(!bad.length, bad.length ? `не пройдено: ${bad.length}` : "все пункты"); }
    case "sensor": return need(hasSensor(items(config), c.sensor));
    case "part": return need(items(config).some((p) => p.id === c.id));
    case "mass_max": return need(ins.mass.total <= c.g, `${ins.mass.total} г`);
    case "link_margin": return need(ins.link && !ins.link.bad && ins.link.margin >= c.db, ins.link && !ins.link.bad ? `${ins.link.margin.toFixed(1)} дБ` : "нет связи");
    case "energy_ratio": {
      const h = (fl.tEnd - fl.tLaunch + fl.pre) / 3600;
      const r = ins.power.hours / h;
      return need(r >= c.ratio, ins.power.wh ? `запас ×${r.toFixed(1)}` : "нет аккумулятора");
    }
    case "budget_export": return need(extra.exported, extra.exported ? "скачано" : "");
  }
  // дальше нужны результаты полета
  if (!res) return { ok: false, value: "", pending: true };
  const common = flightCheck(c, res, fl);
  if (common) return common;
  switch (c.type) {
    case "profile": { const m = missionScore(res, { profile: true }); return need(m.points >= (c.points || 9), m.value); }
    case "flt_min": { const s = score(res, ctx.mission || {}); return need(s.total >= c.points, `${s.total} из 40`); }
  }
  return { ok: false, value: "неизвестная проверка" };
}

export function evalChecks(checks, ctx) {
  const ins = inspect(ctx.config, ctx.flight);
  const out = (checks || []).map((c) => evalCheck(c, { ...ctx, ins }));
  return { results: out, all: out.length > 0 && out.every((r) => r.ok) };
}

/** Нужен ли полет для проверки задания */
export const FLIGHT_CHECKS = new Set(["no_error", "alive", "received_min", "first_after_launch", "max_gap", "loss_max", "sd_match", "sd_min",
  "unique_packets", "alt_in_packets", "profile", "photos_high", "photos_max", "flt_min"]);
export const needsFlight = (checks) => (checks || []).some((c) => FLIGHT_CHECKS.has(c.type));
