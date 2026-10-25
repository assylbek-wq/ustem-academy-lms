// Проверки заданий CubeSat: часть смотрит на конструкцию (сразу, без полета), часть на запись последнего полета.
import { inspect, items, has } from "./model.js";
import { score, missionScore } from "./runner.js";

/** Числа из строки телеметрии */
const nums = (s) => (String(s).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);

export function evalCheck(c, ctx) {
  const { config, flight, res, extra = {} } = ctx;
  const ins = ctx.ins || inspect(config, flight);
  const fl = ins.flight;
  const need = (cond, value = "") => ({ ok: !!cond, value });
  switch (c.type) {
    case "inspect": { const k = ins.checks.find((x) => x.key === c.key); return need(k && k.ok, k && k.value); }
    case "inspect_all": { const bad = ins.checks.filter((x) => !x.ok && !x.optional); return need(!bad.length, bad.length ? `не пройдено: ${bad.length}` : "все пункты"); }
    case "sensor": return need(has(config, (p) => p.sensor === c.sensor));
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
  const got = res.packets.filter((p) => p.ok);
  const inFlight = got.filter((p) => p.t >= fl.tLaunch && p.t <= fl.tLand);
  switch (c.type) {
    case "no_error": return need(!res.error, res.error ? "ошибка в программе" : "");
    case "alive": return need(!res.died || res.died >= fl.tLand, res.died ? `сел на ${Math.round(res.died)} с` : "");
    case "received_min": return need(inFlight.length >= c.n, `${inFlight.length} пакетов`);
    case "first_after_launch": {
      const p = got.find((x) => x.t >= fl.tLaunch);
      return need(p && p.t - fl.tLaunch <= c.s, p ? `через ${(p.t - fl.tLaunch).toFixed(1)} с` : "нет");
    }
    case "max_gap": { const s = score(res); return need(inFlight.length && s.stats.gap <= c.s, `${s.stats.gap.toFixed(1)} с`); }
    case "loss_max": { const s = score(res); return need(s.stats.sent && s.stats.loss <= c.pct, `потери ${s.stats.loss}%`); }
    case "sd_match": {
      const set = new Set(res.sd.map((x) => x.text));
      const share = got.length ? got.filter((p) => set.has(p.text)).length / got.length : 0;
      return need(got.length >= 20 && share >= c.share, `${Math.round(share * 100)}% совпадает`);
    }
    case "sd_min": return need(res.sd.length >= c.n, `${res.sd.length} строк`);
    case "unique_packets": { // у каждого пакета свой номер или время: повторов нет
      const set = new Set(got.map((p) => p.text));
      return need(got.length >= 20 && set.size === got.length, `${set.size} разных из ${got.length}`);
    }
    case "alt_in_packets": {
      // в пакете есть число, близкое к настоящей высоте: высота посчитана по давлению
      const high = inFlight.filter((p) => p.alt >= (c.from || 50));
      const okN = high.filter((p) => nums(p.text).some((v) => Math.abs(v - p.alt) <= c.tol)).length;
      const share = high.length ? okN / high.length : 0;
      return need(high.length >= 20 && share >= (c.share || 0.8), `${Math.round(share * 100)}% пакетов с точной высотой`);
    }
    case "profile": { const m = missionScore(res, { profile: true }); return need(m.points >= (c.points || 9), m.value); }
    case "photos_high": { const n = res.photos.filter((p) => p.alt >= fl.altMax * 0.5).length; return need(n >= c.n, `${n} снимков`); }
    case "photos_max": return need(res.photos.length <= c.n, `${res.photos.length} снимков`);
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
