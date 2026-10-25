// Полет CubeSat для бортовой программы: окружение аэростата + общая бортовая электроника.
import { Environment } from "./flight.js";
import { items, linkOf } from "./model.js";
import { onboard } from "../sat/onboard.js";

export function createSim(config, flight) {
  const env = new Environment(flight);
  const parts = items(config);
  const sim = onboard(parts, env, { link: linkOf(config), tau: 700, rth: 14,
    sampleExtra: (t) => ({ yaw: Math.round(env.yaw(t)), drift: +env.drift(t).toFixed(1), wind: +env.windAt(t).toFixed(1) }) });
  return sim;
}
