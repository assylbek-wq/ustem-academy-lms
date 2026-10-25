// Общие проверки заданий по записи полета: связь, телеметрия, запись на борт, высота в пакетах.
// Виды спутников добавляют свои проверки (конструкция, баллы по регламенту) в своих checks.js.
import { numbers } from "./core.js";

export const need = (cond, value = "") => ({ ok: !!cond, value });
export const hasSensor = (parts, s) => parts.some((p) => (p.sensors || [p.sensor]).includes(s));

/** Самый длинный перерыв в принятой телеметрии между from и to */
export function maxGap(packets, from, to) {
  let gap = 0, last = from;
  for (const p of packets) if (p.ok && p.t >= from && p.t <= to) { gap = Math.max(gap, p.t - last); last = p.t; }
  return Math.max(gap, to - last);
}

/** Проверки, общие для CubeSat и CanSat. fl: tLaunch, tLand. Возвращает undefined, если тип не общий */
export function flightCheck(c, res, fl) {
  const got = res.packets.filter((p) => p.ok);
  const inFlight = got.filter((p) => p.t >= fl.tLaunch && p.t <= fl.tLand);
  switch (c.type) {
    case "no_error": return need(!res.error, res.error ? "ошибка в программе" : "");
    case "alive": return need(!res.died || res.died >= fl.tLand, res.died ? `выключился на ${Math.round(res.died)} с` : "");
    case "received_min": return need(inFlight.length >= c.n, `${inFlight.length} пакетов`);
    case "first_after_launch": {
      const p = got.find((x) => x.t >= fl.tLaunch);
      return need(p && p.t - fl.tLaunch <= c.s, p ? `через ${(p.t - fl.tLaunch).toFixed(1)} с` : "нет");
    }
    case "max_gap": { const g = maxGap(res.packets, fl.tLaunch, fl.tLand); return need(inFlight.length && g <= c.s, `${g.toFixed(1)} с`); }
    case "loss_max": {
      const sent = res.packets.filter((p) => p.t >= fl.tLaunch && p.t <= fl.tLand).length;
      const loss = sent ? Math.round(100 * (1 - inFlight.length / sent)) : 100;
      return need(sent && loss <= c.pct, `потери ${loss}%`);
    }
    case "sd_match": {
      const set = new Set(res.sd.map((x) => x.text));
      const share = got.length ? got.filter((p) => set.has(p.text)).length / got.length : 0;
      return need(got.length >= 20 && share >= c.share, `${Math.round(share * 100)}% совпадает`);
    }
    case "sd_min": return need(res.sd.length >= c.n, `${res.sd.length} строк`);
    case "unique_packets": {
      const set = new Set(got.map((p) => p.text));
      return need(got.length >= 20 && set.size === got.length, `${set.size} разных из ${got.length}`);
    }
    case "alt_in_packets": {
      const high = inFlight.filter((p) => p.alt >= (c.from || 50));
      const okN = high.filter((p) => numbers(p.text).some((v) => Math.abs(v - p.alt) <= c.tol)).length;
      const share = high.length ? okN / high.length : 0;
      return need(high.length >= (c.min || 20) && share >= (c.share || 0.8), `${Math.round(share * 100)}% пакетов с точной высотой`);
    }
    case "photos_high": { const n = res.photos.filter((p) => p.alt >= fl.altMax * 0.5).length; return need(n >= c.n, `${n} снимков`); }
    case "photos_max": return need(res.photos.length <= c.n, `${res.photos.length} снимков`);
  }
  return undefined;
}
