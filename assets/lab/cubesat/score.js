// Разбор полета CubeSat по критерию «Работа в полете» (регламент WSO 13.6.3, 40 баллов). Оценка симулятора, не судей.
import { maxGap } from "../sat/checks.js";

export function score(res, mission = {}) {
  const f = res.flight;
  const got = res.packets.filter((p) => p.ok);
  const inFlight = got.filter((p) => p.t >= f.tLaunch && p.t <= f.tLand);
  const firstAfter = got.find((p) => p.t >= f.tLaunch);
  const link = firstAfter && firstAfter.t - f.tLaunch <= 30 ? 10 : firstAfter && firstAfter.t - f.tLaunch <= 120 ? 5 : 0;
  const gap = maxGap(res.packets, f.tLaunch, f.tLand);
  const tele = gap <= 10 ? 10 : gap <= 20 ? 7 : gap <= 60 ? 4 : 0;
  const tasks = missionScore(res, mission);
  const alive = !res.died || res.died >= f.tLand;
  const lastSent = res.packets.length ? res.packets[res.packets.length - 1].t : 0;
  const planned = alive && lastSent >= f.tLand - 5 ? 6 : alive && lastSent >= f.tDescend ? 3 : 0;
  const sdSet = new Set(res.sd.map((x) => x.text));
  const matched = got.filter((p) => sdSet.has(p.text)).length;
  const share = got.length ? matched / got.length : 0;
  const stored = share >= 0.95 ? 4 : share >= 0.7 ? 2 : 0;
  const sent = res.packets.filter((p) => p.t >= f.tLaunch && p.t <= f.tLand).length;
  return {
    total: link + tele + tasks.points + planned + stored, max: 40, title: "Работа в полете (FLT)",
    note: "Оценка симулятора по критериям финала WSO CubeSat. Данные (DAT), анализ (ANL), презентацию (PRS) и инженерное решение (ENG) судьи оценивают по отчету и защите команды.",
    items: [
      { key: "FLT1", max: 10, points: link, label: "Связь с наземной станцией после старта", value: firstAfter ? `первый пакет через ${(firstAfter.t - f.tLaunch).toFixed(1)} с` : "пакетов после старта нет" },
      { key: "FLT2", max: 10, points: tele, label: "Телеметрия в течение всего полета", value: `самый длинный перерыв ${gap.toFixed(1)} с` },
      { key: "FLT3", max: 10, points: tasks.points, label: "Выполнение задач миссии", value: tasks.value },
      { key: "FLT4", max: 6, points: planned, label: "Работа в течение планового времени", value: alive ? (planned ? "работал до посадки" : "передача прекратилась раньше посадки") : `аккумулятор сел на ${Math.round(res.died)} с` },
      { key: "FLT5", max: 4, points: stored, label: "Совпадение записанных и переданных данных", value: `${matched} из ${got.length} принятых пакетов есть на борту` },
    ],
    stats: [
      ["Передано за полет", sent], ["Принято", inFlight.length], ["Потери", (sent ? Math.round(100 * (1 - inFlight.length / sent)) : 0) + "%"],
      ["Самый длинный перерыв", gap.toFixed(1).replace(".", ",") + " с"], ["Строк на борту", res.sd.length], ["Снимков", res.photos.length],
      ["Заряд в конце", ((res.timeline[res.timeline.length - 1] || {}).pct ?? 0) + "%"], ["Длительность", (f.tEnd / 60).toFixed(1).replace(".", ",") + " мин"],
    ],
  };
}

/** Задачи миссии: профиль атмосферы (замеры по слоям высоты) и/или снимки */
export function missionScore(res, mission) {
  const f = res.flight;
  const parts = [];
  let pts = 0, n = 0;
  if (mission.profile !== false) {
    n++;
    const step = Math.max(10, Math.round(f.altMax / 20));
    const bins = new Set();
    for (const p of res.packets) if (p.ok && p.t >= f.tLaunch && p.t <= f.tTop && /\d/.test(p.text)) bins.add(Math.floor(p.alt / step));
    const need = Math.floor(f.altMax / step);
    const share = need ? Math.min(1, bins.size / need) : 0;
    pts += share;
    parts.push(`профиль атмосферы: ${Math.round(share * 100)}% слоев по ${step} м`);
  }
  if (mission.photos) {
    n++;
    const high = res.photos.filter((p) => p.alt >= f.altMax * 0.5).length;
    pts += Math.min(1, high / mission.photos);
    parts.push(`снимки выше половины высоты: ${high} (нужно ${mission.photos})`);
  }
  return { points: n ? Math.round((10 * pts) / n) : 0, value: parts.join("; ") };
}
