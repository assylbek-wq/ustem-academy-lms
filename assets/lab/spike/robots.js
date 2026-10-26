// Модели роботов симулятора SPIKE Prime. Размеры в мм, координаты на роботе: f - вперед от оси колес, r - вправо.
// "course" - робот курса USTEM (колеса A и B), как было в первых заданиях; "driving-base" - приводная база из уроков
// Competition Ready приложения SPIKE (Training Camp 1-3, Guided Mission); "advanced" - продвинутая приводная база
// (Assembling an Advanced Driving Base, My Code Our Program, Time for an Upgrade, Mission Ready).
// Порты и колеса - по инструкциям LEGO и программам-решениям LEGO на Python; колея рассчитана из углов поворота
// в этих решениях (182 градуса колеса на 90 градусов у базы, 145 у продвинутой базы).

export const ROBOTS = {
  course: {
    title: "Робот курса",
    ports: { A: "motor:large", B: "motor:large", C: "motor:medium", D: "motor:medium", E: "color", F: "color" },
    drive: ["A", "B"], wheel: 56, track: 112,
    body: { front: 105, back: 75, half: 80 },
    sensors: { E: [95, -28], F: [95, 28] },
    tools: { C: { off: 0, reach: 110, kind: "arm" }, D: { off: 40, reach: 110, kind: "arm" } },
    hub: { f: -5, r: 0, along: true },
    roles: { A: "левое колесо", B: "правое колесо", C: "навесное (рука)", D: "навесное 2", E: "левый датчик", F: "правый датчик" },
  },
  "driving-base": {
    title: "Приводная база",
    ports: { C: "motor:medium", D: "motor:medium", E: "motor:medium", F: "distance", B: "color", A: "" },
    drive: ["C", "D"], wheel: 56, track: 113,
    body: { front: 78, back: 92, half: 64 },
    sensors: { B: [70, 0], F: [78, 0] },
    tools: { E: { off: 0, reach: 95, kind: "arm" } },
    hub: { f: -10, r: 0, along: true },
    roles: { C: "левое колесо", D: "правое колесо", E: "рука", F: "датчик расстояния", B: "датчик цвета", A: "" },
  },
  advanced: {
    title: "Продвинутая приводная база",
    ports: { A: "motor:large", E: "motor:large", C: "motor:medium", D: "motor:medium", B: "color", F: "color" },
    drive: ["A", "E"], wheel: 88, track: 145,
    body: { front: 112, back: 82, half: 92 },
    sensors: { B: [92, -34], F: [92, 34] },
    tools: { C: { off: 0, reach: 70, kind: "dozer" }, D: { off: 0, reach: 120, kind: "lift" } },
    hub: { f: -12, r: 0, along: false },
    roles: { A: "левое колесо", E: "правое колесо", C: "отвал (бульдозер)", D: "подъемная рука", B: "левый датчик цвета", F: "правый датчик цвета" },
  },
};

/** Модель робота задания: имя из ROBOTS или старый формат {порт: устройство} поверх робота курса. */
export function robotModel(preset = {}) {
  const r = preset.robot;
  const name = typeof r === "string" ? r : (preset.robotModel || "course");
  const base = ROBOTS[name] || ROBOTS.course;
  const m = JSON.parse(JSON.stringify(base));
  m.name = ROBOTS[name] ? name : "course";
  if (r && typeof r === "object") Object.assign(m.ports, r);
  if (preset.sensorPos) Object.assign(m.sensors, preset.sensorPos);
  return m;
}
