// Запуск программы на MicroPython (WebAssembly) с роботом в MuJoCo. Время виртуальное: robot.sleep()
// продвигает физику, программа проходит все задание за секунды, интерфейс потом проигрывает запись.
import { pyModule } from "./pyapi.js";

const MAX_CALLS = 20000;

export function bridge(sim, limit) {
  let calls = 0, over = false;
  const err = (m) => "__err__:" + m;
  const nums = (s, n) => { const a = String(s).split(","); return Array.from({ length: n }, (_, i) => +a[i]); };
  return {
    n: () => sim.n,
    name: () => sim.R.id,
    now: () => +sim.t.toFixed(4),
    state: () => {
      if (over) return "__over__";
      if (++calls > MAX_CALLS) return err("Слишком много вызовов без паузы: добавьте robot.sleep() в цикл");
      return sim.lowState();
    },
    write: (s) => {
      if (over) return "__over__";
      if (++calls > MAX_CALLS) return err("Слишком много вызовов без паузы: добавьте robot.sleep() в цикл");
      if (sim.mode === "sport") return err("Робот в спортивном режиме: в этом задании им управляет SportClient, LowCmd не принимается");
      const parts = String(s).split(";");
      if (parts.length !== 5) return err("Неверная команда LowCmd");
      const [q, dq, kp, kd, tau] = parts.map((p) => nums(p, sim.n));
      if (q.some((v) => !Number.isFinite(v))) return err("В LowCmd есть нечисловое значение q");
      sim.setLowCmd(q, dq, kp, kd, tau);
      return null;
    },
    sleep: (sec) => {
      if (over) return "__over__";
      calls = 0;
      const left = limit - sim.t;
      const want = Math.max(+sec || 0, sim.dt);
      sim.advance(Math.min(want, Math.max(left, 0)));
      if (sim.t >= limit - 1e-9) { over = true; return "__over__"; }
      return null;
    },
    sport: (name, a, b, c) => {
      if (over) return "__over__";
      if (++calls > MAX_CALLS) return err("Слишком много вызовов без паузы: добавьте robot.sleep() в цикл");
      const e = sim.sportCmd(String(name), [a, b, c]);
      return e ? err(e) : null;
    },
  };
}

export async function runProgram({ sim, code, limit, loadMicroPython, wasmUrl }) {
  const prints = [];
  let error = null;
  const errs = [];
  const mp = await loadMicroPython({ url: wasmUrl, heapsize: 8 * 1024 * 1024, pystack: 4096,
    stdout: (l) => { if (prints.length < 2000) prints.push({ t: +sim.t.toFixed(2), text: l }); }, stderr: (l) => errs.push(l), linebuffer: true });
  try { mp.FS.mkdir("/lib"); } catch (e) { /* есть */ }
  mp.FS.writeFile("/lib/unitree.py", pyModule(sim.R.id));
  mp.registerJsModule("_robot", bridge(sim, limit));
  try {
    await mp.runPythonAsync(code);
  } catch (e) {
    const text = String((e && e.message) || e) + (errs.length ? "\n" + errs.join("\n") : "");
    if (!/SimOver/.test(text)) error = text;
  }
  // программа закончилась раньше: последняя команда держится до конца задания
  if (!error && sim.t < limit) sim.advance(limit - sim.t);
  return { prints, error };
}

export function explainError(text) {
  const t = String(text || "");
  const line = (t.match(/line (\d+)/g) || []).pop();
  let hint = "";
  if (/спортивном режиме/.test(t)) hint = "В этом задании робот управляется командами SportClient: sport.StandUp(), sport.Move(vx, vy, vyaw).";
  else if (/Спортивный режим выключен/.test(t)) hint = "Здесь нужен низкий уровень: LowCmd и robot.write(cmd).";
  else if (/NameError/.test(t)) { const m = t.match(/name '(\w+)'/); hint = `Неизвестное имя «${m ? m[1] : "?"}». Первая строка программы: from unitree import *`; }
  else if (/ImportError|no module named/i.test(t)) hint = "Модуль называется unitree: from unitree import *";
  else if (/IndentationError/.test(t)) hint = "Отступы: внутри while, for, if, def строки сдвигаются на 4 пробела.";
  else if (/SyntaxError/.test(t)) hint = "Синтаксис: двоеточия после while/if/def/for, скобки и кавычки.";
  else if (/IndexError/.test(t)) hint = "Индекс мотора вне списка: у Go2 моторы 0-11, у G1 0-28.";
  else if (/без паузы/.test(t)) hint = "В бесконечном цикле обязательно нужен robot.sleep(): он двигает время симуляции.";
  else if (/ZeroDivisionError/.test(t)) hint = "Деление на ноль: проверьте знаменатель (например, длительность движения).";
  else if (/AttributeError/.test(t)) { const m = t.match(/attribute '(\w+)'/); hint = `Нет поля «${m ? m[1] : "?"}». В LowCmd: motor_cmd[i].q, dq, kp, kd, tau; в LowState: motor_state[i].q, dq, imu_state.rpy.`; }
  return { text: t, line: line ? +line.split(" ")[1] : null, hint };
}
