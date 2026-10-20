// Web Worker симулятора SPIKE: MicroPython + физика. Главный поток рисует поле и шлет нажатия кнопок хаба.
import { runProgram } from "./runner.js";

self.onmessage = async (e) => {
  const m = e.data;
  if (m.type === "start") {
    try {
      const mod = await import(m.mjsUrl);
      const res = await runProgram({
        code: m.code, preset: m.preset, speed: m.speed || 1, wasmUrl: m.wasmUrl, loadMicroPython: mod.loadMicroPython,
        post: (msg) => self.postMessage(msg),
        onSim: (s) => { self.__sim = s; },
      });
      void res;
    } catch (err) {
      self.postMessage({ type: "done", error: String(err && err.message || err) });
    }
  } else if (m.type === "button" && self.__sim) {
    self.__sim.buttons[m.which] = m.down;
  }
};
