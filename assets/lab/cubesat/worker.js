// Web Worker полета CubeSat: MicroPython + модель полета. Полет считается целиком, интерфейс проигрывает запись.
import { runFlight } from "./runner.js";

self.onmessage = async (e) => {
  const m = e.data;
  if (m.type !== "start") return;
  try {
    const mod = await import(m.mjsUrl);
    const res = await runFlight({ code: m.code, config: m.config, flight: m.flight, wasmUrl: m.wasmUrl, loadMicroPython: mod.loadMicroPython });
    self.postMessage({ type: "done", res });
  } catch (err) {
    self.postMessage({ type: "done", error: String((err && err.message) || err) });
  }
};
