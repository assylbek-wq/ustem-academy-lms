// Проверки заданий CanSat: конструкция и прогноз полета (сразу), запись последнего полета (после запуска).
import { CAN } from "./catalog.js";
import { inspect, items } from "./model.js";
import { predict } from "./physics.js";
import { found, score } from "./score.js";
import { flightCheck, hasSensor, need } from "../sat/checks.js";

const fmt = (x, d = 1) => x.toFixed(d).replace(".", ",");

export function evalCheck(c, ctx) {
  const { config, flight, res, extra = {} } = ctx;
  const ins = ctx.ins || inspect(config, flight);
  const pr = () => (ctx.pred = ctx.pred || predict(config, ins.flight));
  switch (c.type) {
    case "inspect": { const k = ins.checks.find((x) => x.key === c.key); return need(k && k.ok, k && k.value); }
    case "inspect_group": { const bad = ins.checks.filter((x) => x.group === c.group && !x.ok); return need(!bad.length, bad.length ? `не пройдено: ${bad.length}` : "все пункты"); }
    case "inspect_all": { const bad = ins.checks.filter((x) => !x.ok && !x.optional); return need(!bad.length, bad.length ? `не пройдено: ${bad.length}` : "все пункты"); }
    case "sensor": return need(hasSensor(items(config), c.sensor));
    case "can_mass_max": return need(ins.can.mass.total <= c.g, `${ins.can.mass.total} г`);
    case "can_mass_min": return need(ins.can.mass.total >= c.g, `${ins.can.mass.total} г`);
    case "rocket_mass_max": return need(ins.rocket.lift.m <= c.g, `${Math.round(ins.rocket.lift.m)} г`);
    case "stability": return need(ins.rocket.stab >= c.min && ins.rocket.stab <= (c.max || 99), `${fmt(ins.rocket.stab, 2)} кал.`);
    case "descent": return need(ins.can.vDesc >= c.min && ins.can.vDesc <= c.max, `${fmt(ins.can.vDesc)} м/с`);
    case "eject_max": { const p = pr(); return need(!p.crash && p.vEject <= c.v, p.crash ? "ракета упала" : `${fmt(p.vEject)} м/с`); }
    case "rocket_land_max": { const p = pr(); return need(p.vLandRocket <= c.v, `${fmt(p.vLandRocket)} м/с`); }
    case "apogee_min": { const p = pr(); return need(p.apogee >= c.m, `${Math.round(p.apogee)} м`); }
    case "drift_max": { const p = pr(); return need(Math.abs(p.xCan) <= c.m, `${Math.round(Math.abs(p.xCan))} м`); }
    case "budget_export": return need(extra.exported, extra.exported ? "скачано" : "");
  }
  if (!res) return { ok: false, value: "", pending: true };
  const fl = res.flight;
  const common = flightCheck(c, res, fl);
  if (common) return common;
  switch (c.type) {
    case "sd_rate": {
      const n = res.sd.filter((x) => x.t >= fl.tLaunch && x.t <= fl.tLand).length;
      const hz = n / Math.max(1, fl.tLand - fl.tLaunch);
      return need(hz >= c.hz, `${fmt(hz)} Гц`);
    }
    case "rx_rate": {
      const n = res.packets.filter((p) => p.ok && p.t >= fl.tLaunch && p.t <= fl.tLand).length;
      const hz = n / Math.max(1, fl.tLand - fl.tLaunch);
      return need(hz >= c.hz, `${fmt(hz)} Гц`);
    }
    case "event": {
      // первая строка с меткой (на SD или в принятом пакете) попадает в окно вокруг настоящего события
      const tReal = fl[c.at];
      const lines = [...res.sd.map((x) => ({ t: x.t, text: x.text })), ...res.packets.filter((p) => p.ok).map((p) => ({ t: p.t, text: p.text }))]
        .filter((x) => x.text.includes(c.token)).sort((a, b) => a.t - b.t);
      if (!lines.length) return need(false, "метки нет");
      const d = lines[0].t - tReal;
      return need(d >= -(c.before ?? 0.3) && d <= c.after, `${d >= 0 ? "+" : ""}${fmt(d, 2)} с от настоящего момента`);
    }
    case "accel_range": {
      const n = (res.read || {}).accel || 0;
      return need(res.range >= c.g && n >= 10, res.range >= c.g ? `диапазон ±${res.range} g` : `диапазон ±${res.range} g: старт не помещается`);
    }
    case "found": return need(found(res), found(res) ? "нашли" : "CanSat потерян");
    case "video": { const s = score(res); return need(s.bonus >= c.points, `бонус ${s.bonus} из 3`); }
    case "score_min": { const s = score(res); return need(s.total >= c.points, `${s.total} из 75`); }
  }
  return { ok: false, value: "неизвестная проверка" };
}

export function evalChecks(checks, ctx) {
  const ins = inspect(ctx.config, ctx.flight);
  const c2 = { ...ctx, ins };
  const out = (checks || []).map((c) => evalCheck(c, c2));
  return { results: out, all: out.length > 0 && out.every((r) => r.ok) };
}

export const FLIGHT_CHECKS = new Set(["no_error", "alive", "received_min", "first_after_launch", "max_gap", "loss_max", "sd_match", "sd_min",
  "unique_packets", "alt_in_packets", "sd_rate", "rx_rate", "event", "accel_range", "found", "video", "score_min"]);
export const needsFlight = (checks) => (checks || []).some((c) => FLIGHT_CHECKS.has(c.type));
void CAN;
