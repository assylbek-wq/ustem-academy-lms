// Web Worker полета: MicroPython + модель полета CubeSat или CanSat. Полет считается целиком, интерфейс проигрывает запись.
import { runProgram } from "./vm.js";
import { createSim as cubesatSim } from "../cubesat/sim.js";
import { createSim as cansatSim } from "../cansat/sim.js";

const SIMS = { cubesat: cubesatSim, cansat: cansatSim };

self.onmessage = async (e) => {
  const m = e.data;
  if (m.type !== "start") return;
  try {
    const mod = await import(m.mjsUrl);
    const sim = SIMS[m.kind](m.config, m.flight);
    const res = await runProgram({ sim, code: m.code, wasmUrl: m.wasmUrl, loadMicroPython: mod.loadMicroPython });
    self.postMessage({ type: "done", res });
  } catch (err) {
    self.postMessage({ type: "done", error: String((err && err.message) || err) });
  }
};
