// Запуск бортовой программы на MicroPython (WebAssembly) с виртуальным спутником. Время виртуальное:
// программа пролетает весь полет за секунды, интерфейс потом проигрывает запись. Сам полет (физика)
// считается заранее в sim.js каждого вида спутника, программа только читает датчики и пишет данные.
import { SAT_PY } from "./pyapi.js";

export async function runProgram({ sim, code, loadMicroPython, wasmUrl }) {
  const prints = [];
  let error = sim.blocker ? sim.blocker() : null;
  if (error) { sim.finish(); return { ...sim.result(), prints, error }; }
  const errs = [];
  const mp = await loadMicroPython({ url: wasmUrl, heapsize: 8 * 1024 * 1024, pystack: 4096,
    stdout: (l) => { if (prints.length < 2000) prints.push({ t: +sim.now().toFixed(2), text: l }); }, stderr: (l) => errs.push(l), linebuffer: true });
  try { mp.FS.mkdir("/lib"); } catch (e) { /* есть */ }
  mp.FS.writeFile("/lib/sat.py", SAT_PY);
  mp.registerJsModule("_sat", sim.api);
  try {
    await mp.runPythonAsync(code);
  } catch (e) {
    const text = String((e && e.message) || e) + (errs.length ? "\n" + errs.join("\n") : "");
    if (!/FlightOver/.test(text)) error = text;
  }
  sim.finish();
  return { ...sim.result(), prints, error };
}

export function explainError(text) {
  const t = String(text || "");
  const line = (t.match(/line (\d+)/g) || []).pop();
  let hint = "";
  if (/не установлен|не хватает памяти|некуда сохранить|не включается/.test(t)) hint = "Измените сборку на вкладке «Конструктор».";
  else if (/NameError/.test(t)) { const m = t.match(/name '(\w+)'/); hint = `Неизвестное имя «${m ? m[1] : "?"}». Первая строка программы: from sat import *`; }
  else if (/ImportError|no module named/i.test(t)) hint = "Модуль бортовой программы называется sat: from sat import *";
  else if (/IndentationError/.test(t)) hint = "Отступы: внутри while, for, if, def строки сдвигаются на 4 пробела.";
  else if (/SyntaxError/.test(t)) hint = "Синтаксис: двоеточия после while/if/def, скобки и кавычки.";
  else if (/Пакет \d+ байт/.test(t)) hint = "Округлите числа (round(x, 1)) и уберите лишний текст из пакета.";
  else if (/вызовов/.test(t)) hint = "В бесконечном цикле обязательно нужен sleep(): он двигает время полета.";
  else if (/ZeroDivisionError/.test(t)) hint = "Деление на ноль: проверьте, что знаменатель уже измерен (например, p0).";
  return { text: t, line: line ? +line.split(" ")[1] : null, hint };
}
