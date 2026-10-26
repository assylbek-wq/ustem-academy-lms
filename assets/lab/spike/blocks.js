// Блоки в стиле SPIKE Word Blocks (Blockly) и генератор Python для SPIKE 3.
// Код из блоков - обычная программа SPIKE 3: ее можно скачать и загрузить в приложение SPIKE на настоящий хаб.
import * as Blockly from "blockly/core";
import "blockly/blocks";
import * as Ru from "blockly/msg/ru";
import { pythonGenerator as G, Order } from "blockly/python";
import { tr, KK } from "../i18n/index.js";

Blockly.setLocale(Ru);

const C = { events: "#f5c402", motors: "#0090f5", move: "#ff4ccd", sensors: "#00b4e5", light: "#9a5cff", sound: "#cf63cf",
  control: "#ffab19", ops: "#59c059", vars: "#ff8c1a", my: "#ff6680" };
const PORTS = [["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"], ["E", "E"], ["F", "F"]];
const COLORS = [["черный", "BLACK"], ["белый", "WHITE"], ["красный", "RED"], ["синий", "BLUE"], ["зеленый", "GREEN"], ["желтый", "YELLOW"]];
const num = (name, v) => ({ type: "input_value", name, check: "Number", _shadow: v });

const DEFS = [
  { type: "spike_start", message0: "▶ когда программа запущена", nextStatement: null, colour: C.events, tooltip: "Начало программы (async def main)" },
  // моторы
  { type: "spike_motor_run_for", message0: "мотор %1 %2 на %3 %4 скорость %5 %%",
    args0: [{ type: "field_dropdown", name: "PORT", options: [["C", "C"], ["D", "D"], ["A", "A"], ["B", "B"]] },
      { type: "field_dropdown", name: "DIR", options: [["↻", "1"], ["↺", "-1"]] }, num("N", 1),
      { type: "field_dropdown", name: "UNIT", options: [["оборотов", "rot"], ["градусов", "deg"], ["секунд", "sec"]] }, num("SPEED", 75)],
    inputsInline: true, previousStatement: null, nextStatement: null, colour: C.motors, tooltip: "motor.run_for_degrees / run_for_time" },
  { type: "spike_motor_start", message0: "запустить мотор %1 %2 скорость %3 %%",
    args0: [{ type: "field_dropdown", name: "PORT", options: [["C", "C"], ["D", "D"], ["A", "A"], ["B", "B"]] },
      { type: "field_dropdown", name: "DIR", options: [["↻", "1"], ["↺", "-1"]] }, num("SPEED", 75)],
    inputsInline: true, previousStatement: null, nextStatement: null, colour: C.motors },
  { type: "spike_motor_stop", message0: "остановить мотор %1", args0: [{ type: "field_dropdown", name: "PORT", options: [["C", "C"], ["D", "D"], ["A", "A"], ["B", "B"]] }],
    previousStatement: null, nextStatement: null, colour: C.motors },
  { type: "spike_motor_goto", message0: "мотор %1 в позицию %2 ° скорость %3 %%",
    args0: [{ type: "field_dropdown", name: "PORT", options: [["C", "C"], ["D", "D"], ["A", "A"], ["B", "B"]] }, num("POS", 0), num("SPEED", 75)],
    inputsInline: true, previousStatement: null, nextStatement: null, colour: C.motors },
  { type: "spike_motor_reset", message0: "сбросить позицию мотора %1", args0: [{ type: "field_dropdown", name: "PORT", options: PORTS }],
    previousStatement: null, nextStatement: null, colour: C.motors },
  { type: "spike_motor_position", message0: "позиция мотора %1", args0: [{ type: "field_dropdown", name: "PORT", options: PORTS }], output: "Number", colour: C.motors },
  // движение
  { type: "spike_move_pair", message0: "моторы движения %1 и %2",
    args0: [{ type: "field_dropdown", name: "L", options: PORTS }, { type: "field_dropdown", name: "R", options: [["B", "B"], ["A", "A"], ["C", "C"], ["D", "D"], ["E", "E"], ["F", "F"]] }],
    previousStatement: null, nextStatement: null, colour: C.move, tooltip: "motor_pair.pair: левое и правое колесо" },
  { type: "spike_move_speed", message0: "скорость движения %1 %%", args0: [num("SPEED", 50)], previousStatement: null, nextStatement: null, colour: C.move },
  { type: "spike_move_for", message0: "двигаться %1 на %2 %3",
    args0: [{ type: "field_dropdown", name: "DIR", options: [["вперед ↑", "1"], ["назад ↓", "-1"]] }, num("N", 10),
      { type: "field_dropdown", name: "UNIT", options: [["см", "cm"], ["градусов", "deg"], ["оборотов", "rot"], ["секунд", "sec"]] }],
    inputsInline: true, previousStatement: null, nextStatement: null, colour: C.move, tooltip: "motor_pair.move_for_degrees" },
  { type: "spike_move_steer_for", message0: "двигаться с рулем %1 на %2 %3",
    args0: [num("STEER", 30), num("N", 10), { type: "field_dropdown", name: "UNIT", options: [["см", "cm"], ["градусов", "deg"], ["оборотов", "rot"], ["секунд", "sec"]] }],
    inputsInline: true, previousStatement: null, nextStatement: null, colour: C.move, tooltip: "Руль от -100 до 100: 0 прямо, 100 разворот вправо" },
  { type: "spike_move_start", message0: "начать движение с рулем %1", args0: [num("STEER", 0)], inputsInline: true, previousStatement: null, nextStatement: null, colour: C.move },
  { type: "spike_move_tank", message0: "начать движение: левое %1 %% правое %2 %%", args0: [num("L", 50), num("R", 50)], inputsInline: true, previousStatement: null, nextStatement: null, colour: C.move },
  { type: "spike_move_stop", message0: "остановить движение", previousStatement: null, nextStatement: null, colour: C.move },
  { type: "spike_turn_gyro", message0: "повернуть %1 на %2 ° по гироскопу",
    args0: [{ type: "field_dropdown", name: "DIR", options: [["вправо ↻", "1"], ["влево ↺", "-1"]] }, num("DEG", 90)],
    inputsInline: true, previousStatement: null, nextStatement: null, colour: C.move, tooltip: "Поворот по гироскопу с P-регулятором (функция turn из урока)" },
  // датчики
  { type: "spike_reflection", message0: "отражение %1", args0: [{ type: "field_dropdown", name: "PORT", options: [["E", "E"], ["F", "F"], ["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]] }], output: "Number", colour: C.sensors },
  { type: "spike_color_is", message0: "%1 видит %2",
    args0: [{ type: "field_dropdown", name: "PORT", options: [["E", "E"], ["F", "F"], ["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]] }, { type: "field_dropdown", name: "COLOR", options: COLORS }],
    output: "Boolean", colour: C.sensors },
  { type: "spike_distance", message0: "расстояние %1 (мм)", args0: [{ type: "field_dropdown", name: "PORT", options: [["D", "D"], ["C", "C"], ["E", "E"], ["F", "F"], ["A", "A"], ["B", "B"]] }], output: "Number", colour: C.sensors },
  { type: "spike_force", message0: "датчик силы %1 нажат", args0: [{ type: "field_dropdown", name: "PORT", options: [["D", "D"], ["C", "C"], ["E", "E"], ["F", "F"], ["A", "A"], ["B", "B"]] }], output: "Boolean", colour: C.sensors },
  { type: "spike_yaw", message0: "угол поворота (yaw)", output: "Number", colour: C.sensors, tooltip: "Как в приложении: направо - плюс" },
  { type: "spike_reset_yaw", message0: "сбросить угол поворота", previousStatement: null, nextStatement: null, colour: C.sensors },
  { type: "spike_button", message0: "кнопка %1 нажата", args0: [{ type: "field_dropdown", name: "B", options: [["левая", "LEFT"], ["правая", "RIGHT"]] }], output: "Boolean", colour: C.sensors },
  // свет и звук
  { type: "spike_write", message0: "написать %1", args0: [{ type: "input_value", name: "TEXT", _shadowText: "Hi" }], previousStatement: null, nextStatement: null, colour: C.light },
  { type: "spike_image", message0: "показать %1",
    args0: [{ type: "field_dropdown", name: "IMG", options: [["улыбку", "IMAGE_HAPPY"], ["сердце", "IMAGE_HEART"], ["галочку", "IMAGE_YES"], ["крестик", "IMAGE_NO"], ["квадрат", "IMAGE_SQUARE"]] }],
    previousStatement: null, nextStatement: null, colour: C.light },
  { type: "spike_clear", message0: "выключить экран", previousStatement: null, nextStatement: null, colour: C.light },
  { type: "spike_beep", message0: "сигнал нота %1 на %2 с", args0: [num("NOTE", 60), num("SEC", 0.2)], inputsInline: true, previousStatement: null, nextStatement: null, colour: C.sound },
  // управление
  { type: "spike_wait", message0: "ждать %1 с", args0: [num("SEC", 1)], inputsInline: true, previousStatement: null, nextStatement: null, colour: C.control },
  { type: "spike_wait_until", message0: "ждать, пока %1", args0: [{ type: "input_value", name: "COND", check: "Boolean" }], previousStatement: null, nextStatement: null, colour: C.control },
  { type: "spike_repeat", message0: "повторить %1 раз", args0: [num("N", 10)], message1: "%1", args1: [{ type: "input_statement", name: "DO" }], previousStatement: null, nextStatement: null, colour: C.control },
  { type: "spike_forever", message0: "всегда", message1: "%1", args1: [{ type: "input_statement", name: "DO" }], previousStatement: null, colour: C.control },
  { type: "spike_until", message0: "повторять, пока не %1", args0: [{ type: "input_value", name: "COND", check: "Boolean" }], message1: "%1", args1: [{ type: "input_statement", name: "DO" }], previousStatement: null, nextStatement: null, colour: C.control },
  { type: "spike_print", message0: "вывести в консоль %1", args0: [{ type: "input_value", name: "V" }], previousStatement: null, nextStatement: null, colour: C.control },
  { type: "spike_stop", message0: "остановить программу", previousStatement: null, colour: C.control },
];

// Блоки определяем при первом создании рабочей области: к этому времени загружен словарь казахского языка
let defined = false;
function defineOnce() {
  if (defined) return; defined = true;
  if (KK) for (const [k, v] of Object.entries(Blockly.Msg)) if (typeof v === "string") Blockly.Msg[k] = tr(v);
  Blockly.common.defineBlocksWithJsonArray(DEFS.map((d) => {
    const c = JSON.parse(JSON.stringify(d));
    for (const k of ["message0", "message1", "tooltip"]) if (typeof c[k] === "string") c[k] = tr(c[k]);
    for (const k of ["args0", "args1"]) (c[k] || []).forEach((a) => {
      delete a._shadow; delete a._shadowText;
      if (Array.isArray(a.options)) a.options = a.options.map(([t, v]) => [typeof t === "string" ? tr(t) : t, v]);
    });
    return c;
  }));
  if (KK) for (const c of TOOLBOX.contents) if (c.name) c.name = tr(c.name);
}

// Набор блоков с подставленными числами (shadow), как в SPIKE
function shadowsFor(type) {
  const d = DEFS.find((x) => x.type === type), inputs = {};
  for (const k of ["args0", "args1"]) for (const a of d[k] || []) {
    if (a._shadow !== undefined) inputs[a.name] = { shadow: { type: "math_number", fields: { NUM: a._shadow } } };
    if (a._shadowText !== undefined) inputs[a.name] = { shadow: { type: "text", fields: { TEXT: a._shadowText } } };
  }
  return { kind: "block", type, inputs };
}

export const TOOLBOX = {
  kind: "categoryToolbox",
  contents: [
    { kind: "category", name: "Движение", colour: C.move, contents: ["spike_move_for", "spike_turn_gyro", "spike_move_steer_for", "spike_move_start", "spike_move_tank", "spike_move_stop", "spike_move_speed", "spike_move_pair"].map(shadowsFor) },
    { kind: "category", name: "Моторы", colour: C.motors, contents: ["spike_motor_run_for", "spike_motor_start", "spike_motor_stop", "spike_motor_goto", "spike_motor_reset", "spike_motor_position"].map(shadowsFor) },
    { kind: "category", name: "Датчики", colour: C.sensors, contents: ["spike_reflection", "spike_color_is", "spike_distance", "spike_force", "spike_yaw", "spike_reset_yaw", "spike_button"].map(shadowsFor) },
    { kind: "category", name: "Свет и звук", colour: C.light, contents: ["spike_write", "spike_image", "spike_clear", "spike_beep"].map(shadowsFor) },
    { kind: "category", name: "Управление", colour: C.control, contents: [
      ...["spike_wait", "spike_wait_until", "spike_repeat", "spike_forever", "spike_until"].map(shadowsFor),
      { kind: "block", type: "controls_if" }, { kind: "block", type: "controls_if", extraState: { hasElse: true } },
      ...["spike_print", "spike_stop", "spike_start"].map(shadowsFor)] },
    { kind: "category", name: "Операторы", colour: C.ops, contents: [
      { kind: "block", type: "math_arithmetic", inputs: { A: { shadow: { type: "math_number", fields: { NUM: 1 } } }, B: { shadow: { type: "math_number", fields: { NUM: 1 } } } } },
      { kind: "block", type: "logic_compare", inputs: { A: { shadow: { type: "math_number", fields: { NUM: 0 } } }, B: { shadow: { type: "math_number", fields: { NUM: 50 } } } } },
      { kind: "block", type: "logic_operation" }, { kind: "block", type: "logic_negate" },
      { kind: "block", type: "math_single", fields: { OP: "ABS" }, inputs: { NUM: { shadow: { type: "math_number", fields: { NUM: -5 } } } } },
      { kind: "block", type: "math_round", inputs: { NUM: { shadow: { type: "math_number", fields: { NUM: 3.5 } } } } },
      { kind: "block", type: "math_random_int", inputs: { FROM: { shadow: { type: "math_number", fields: { NUM: 1 } } }, TO: { shadow: { type: "math_number", fields: { NUM: 10 } } } } },
      { kind: "block", type: "math_number" }, { kind: "block", type: "text" }, { kind: "block", type: "logic_boolean" }] },
    { kind: "category", name: "Переменные", colour: C.vars, custom: "VARIABLE" },
    { kind: "category", name: "Мои блоки", colour: C.my, custom: "PROCEDURE" },
  ],
};

// ─── Генератор Python ───
const P = (b, f = "PORT") => `port.${b.getFieldValue(f)}`;
const V = (b, name, gen, d = "0") => gen.valueToCode(b, name, Order.NONE) || d;
const needs = new Set();
const HELPERS = {
  move: `WHEEL_MM = 56
DEG_PER_CM = 360 / (3.1416 * WHEEL_MM / 10)
PAIR = motor_pair.PAIR_1
MOVE_SPEED = 500`,
  yaw: `def yaw():
    return -motion_sensor.tilt_angles()[0] / 10   # направо - плюс, как в приложении`,
  turn: `async def turn(angle, max_speed=400):
    motion_sensor.reset_yaw(0)
    await runloop.sleep_ms(50)
    while abs(angle - yaw()) > 1:
        error = angle - yaw()
        speed = int(min(max_speed, max(80, abs(error) * 6)))
        if error > 0:
            motor_pair.move_tank(PAIR, speed, -speed)
        else:
            motor_pair.move_tank(PAIR, -speed, speed)
        await runloop.sleep_ms(10)
    motor_pair.stop(PAIR)`,
};

const unitDeg = (n, unit) => (unit === "cm" ? `int(${n} * DEG_PER_CM)` : unit === "rot" ? `int(${n} * 360)` : `int(${n})`);
const loopYield = "await runloop.sleep_ms(5)  # пауза, чтобы хаб успевал обновить датчики\n";

G.forBlock.spike_start = () => "";
G.forBlock.spike_motor_run_for = (b, g) => {
  const n = V(b, "N", g, "1"), sp = `int(${V(b, "SPEED", g, "75")} * 10)`, dir = b.getFieldValue("DIR"), u = b.getFieldValue("UNIT");
  const v = dir === "1" ? sp : `-${sp}`;
  if (u === "sec") return `await motor.run_for_time(${P(b)}, int(${n} * 1000), ${v})\n`;
  return `await motor.run_for_degrees(${P(b)}, ${u === "rot" ? `int(${n} * 360)` : `int(${n})`}, ${v})\n`;
};
G.forBlock.spike_motor_start = (b, g) => `motor.run(${P(b)}, ${b.getFieldValue("DIR") === "1" ? "" : "-"}int(${V(b, "SPEED", g, "75")} * 10))\n`;
G.forBlock.spike_motor_stop = (b) => `motor.stop(${P(b)})\n`;
G.forBlock.spike_motor_goto = (b, g) => `await motor.run_to_relative_position(${P(b)}, int(${V(b, "POS", g)}), int(${V(b, "SPEED", g, "75")} * 10))\n`;
G.forBlock.spike_motor_reset = (b) => `motor.reset_relative_position(${P(b)}, 0)\n`;
G.forBlock.spike_motor_position = (b) => [`motor.relative_position(${P(b)})`, Order.FUNCTION_CALL];
G.forBlock.spike_move_pair = (b) => { needs.add("move"); return `motor_pair.pair(PAIR, port.${b.getFieldValue("L")}, port.${b.getFieldValue("R")})\n`; };
G.forBlock.spike_move_speed = (b, g) => { needs.add("move"); return `MOVE_SPEED = int(${V(b, "SPEED", g, "50")} * 10)\n`; };
G.forBlock.spike_move_for = (b, g) => {
  needs.add("move");
  const n = V(b, "N", g, "10"), u = b.getFieldValue("UNIT"), dir = b.getFieldValue("DIR");
  if (u === "sec") return `await motor_pair.move_for_time(PAIR, int(${n} * 1000), 0, velocity=${dir === "1" ? "" : "-"}MOVE_SPEED)\n`;
  return `await motor_pair.move_for_degrees(PAIR, ${dir === "1" ? "" : "-"}${unitDeg(n, u)}, 0, velocity=MOVE_SPEED)\n`;
};
G.forBlock.spike_move_steer_for = (b, g) => {
  needs.add("move");
  const n = V(b, "N", g, "10"), u = b.getFieldValue("UNIT"), s = `int(${V(b, "STEER", g)})`;
  if (u === "sec") return `await motor_pair.move_for_time(PAIR, int(${n} * 1000), ${s}, velocity=MOVE_SPEED)\n`;
  return `await motor_pair.move_for_degrees(PAIR, ${unitDeg(n, u)}, ${s}, velocity=MOVE_SPEED)\n`;
};
G.forBlock.spike_move_start = (b, g) => { needs.add("move"); return `motor_pair.move(PAIR, int(${V(b, "STEER", g)}), velocity=MOVE_SPEED)\n`; };
G.forBlock.spike_move_tank = (b, g) => { needs.add("move"); return `motor_pair.move_tank(PAIR, int(${V(b, "L", g, "50")} * 10), int(${V(b, "R", g, "50")} * 10))\n`; };
G.forBlock.spike_move_stop = () => { needs.add("move"); return "motor_pair.stop(PAIR)\n"; };
G.forBlock.spike_turn_gyro = (b, g) => { needs.add("move"); needs.add("yaw"); needs.add("turn"); return `await turn(${b.getFieldValue("DIR") === "1" ? "" : "-"}${V(b, "DEG", g, "90")})\n`; };
G.forBlock.spike_reflection = (b) => [`color_sensor.reflection(${P(b)})`, Order.FUNCTION_CALL];
G.forBlock.spike_color_is = (b) => [`color_sensor.color(${P(b)}) == color.${b.getFieldValue("COLOR")}`, Order.RELATIONAL];
G.forBlock.spike_distance = (b) => [`distance_sensor.distance(${P(b)})`, Order.FUNCTION_CALL];
G.forBlock.spike_force = (b) => [`force_sensor.pressed(${P(b)})`, Order.FUNCTION_CALL];
G.forBlock.spike_yaw = () => { needs.add("yaw"); return ["yaw()", Order.FUNCTION_CALL]; };
G.forBlock.spike_reset_yaw = () => "motion_sensor.reset_yaw(0)\n";
G.forBlock.spike_button = (b) => [`button.pressed(button.${b.getFieldValue("B")}) > 0`, Order.RELATIONAL];
G.forBlock.spike_write = (b, g) => `await light_matrix.write(str(${V(b, "TEXT", g, '""')}))\n`;
G.forBlock.spike_image = (b) => `light_matrix.show_image(light_matrix.${b.getFieldValue("IMG")})\n`;
G.forBlock.spike_clear = () => "light_matrix.clear()\n";
G.forBlock.spike_beep = (b, g) => `await sound.beep(int(440 * 2 ** ((${V(b, "NOTE", g, "60")} - 69) / 12)), int(${V(b, "SEC", g, "0.2")} * 1000), 80)\n`;
G.forBlock.spike_wait = (b, g) => `await runloop.sleep_ms(int(${V(b, "SEC", g, "1")} * 1000))\n`;
G.forBlock.spike_wait_until = (b, g) => `await runloop.until(lambda: ${V(b, "COND", g, "True")})\n`;
G.forBlock.spike_repeat = (b, g) => `for _ in range(int(${V(b, "N", g, "10")})):\n${g.statementToCode(b, "DO") || g.INDENT + "pass\n"}`;
G.forBlock.spike_forever = (b, g) => `while True:\n${g.statementToCode(b, "DO")}${g.INDENT}${loopYield}`;
G.forBlock.spike_until = (b, g) => `while not (${V(b, "COND", g, "False")}):\n${g.statementToCode(b, "DO")}${g.INDENT}${loopYield}`;
G.forBlock.spike_print = (b, g) => `print(${V(b, "V", g, '""')})\n`;
G.forBlock.spike_stop = () => "raise SystemExit\n";

// «Мои блоки»: асинхронные функции, вызов через await
function globalsFor(block, g, exclude = []) {
  const names = block.workspace.getVariableMap().getAllVariables().map((v) => g.getVariableName(v.getId())).filter((n) => !exclude.includes(n));
  return names.length ? `${g.INDENT}global ${names.join(", ")}\n` : "";
}
function defProc(block, g, withReturn) {
  const name = g.getProcedureName(block.getFieldValue("NAME"));
  const args = (block.getVarModels ? block.getVarModels() : []).map((m) => g.getVariableName(m.getId()));
  let body = g.statementToCode(block, "STACK");
  if (withReturn) { const r = g.valueToCode(block, "RETURN", Order.NONE) || "None"; body += `${g.INDENT}return ${r}\n`; }
  if (!body) body = g.INDENT + "pass\n";
  g.definitions_["%" + name] = `async def ${name}(${args.join(", ")}):\n${globalsFor(block, g, args)}${body}`;
  return null;
}
G.forBlock.procedures_defnoreturn = (b, g) => defProc(b, g, false);
G.forBlock.procedures_defreturn = (b, g) => defProc(b, g, true);
const callArgs = (b, g) => b.getVars().map((_, i) => g.valueToCode(b, "ARG" + i, Order.NONE) || "None").join(", ");
G.forBlock.procedures_callnoreturn = (b, g) => `await ${g.getProcedureName(b.getFieldValue("NAME"))}(${callArgs(b, g)})\n`;
G.forBlock.procedures_callreturn = (b, g) => [`(await ${g.getProcedureName(b.getFieldValue("NAME"))}(${callArgs(b, g)}))`, Order.FUNCTION_CALL];

const HEADER = `from hub import port, motion_sensor, light_matrix, sound, button
import motor, motor_pair, color_sensor, distance_sensor, force_sensor, color, runloop
`;

// Код программы из рабочей области
export function workspaceToPython(ws) {
  needs.clear();
  G.init(ws);
  const start = ws.getTopBlocks(true).find((b) => b.type === "spike_start");
  let mainBody = "";
  if (start && start.getNextBlock()) mainBody = G.blockToCode(start.getNextBlock());
  if (Array.isArray(mainBody)) mainBody = mainBody[0];
  // определения «Моих блоков»
  for (const b of ws.getTopBlocks(true)) if (b.type.startsWith("procedures_def")) G.blockToCode(b);
  needs.add("move");
  const defs = Object.entries(G.definitions_).filter(([k]) => k.startsWith("%")).map(([, v]) => v);
  const varDefs = ws.getVariableMap().getAllVariables().map((v) => `${G.getVariableName(v.getId())} = 0`);
  const glob = ["MOVE_SPEED", ...ws.getVariableMap().getAllVariables().map((v) => G.getVariableName(v.getId()))];
  const helpers = ["move", "yaw", "turn"].filter((k) => needs.has(k)).map((k) => HELPERS[k]);
  const body = (mainBody || "").split("\n").filter((l, i, a) => l || i < a.length - 1).map((l) => (l ? G.INDENT + l : l)).join("\n");
  let code = HEADER + "\n" + helpers.join("\n\n\n") + "\n";
  if (varDefs.length) code += "\n" + varDefs.join("\n") + "\n";
  if (defs.length) code += "\n\n" + defs.join("\n\n") + "\n";
  code += `\n\nasync def main():\n${G.INDENT}global ${glob.join(", ")}\n${G.INDENT}motor_pair.pair(PAIR, port.A, port.B)\n${body || G.INDENT + "pass"}\n\n\nrunloop.run(main())\n`;
  return code.replace(/\n{4,}/g, "\n\n\n");
}

const THEME = Blockly.Theme.defineTheme("ustem", { base: Blockly.Themes.Classic, fontStyle: { family: "Inter, system-ui, sans-serif", size: 11, weight: "600" },
  componentStyles: { workspaceBackgroundColour: "#f8fafc", toolboxBackgroundColour: "#ffffff", flyoutBackgroundColour: "#f1f5f9", flyoutOpacity: 1 } });

export function createWorkspace(el, onChange) {
  defineOnce();
  const ws = Blockly.inject(el, {
    toolbox: TOOLBOX, trashcan: true, scrollbars: true, sounds: false, renderer: "zelos",
    zoom: { controls: true, wheel: false, startScale: 0.8, maxScale: 2, minScale: 0.4, scaleSpeed: 1.15 },
    move: { scrollbars: true, drag: true, wheel: true }, grid: { spacing: 24, length: 2, colour: "#e2e8f0", snap: true },
    theme: THEME,
  });
  ws.addChangeListener((e) => { if (!e.isUiEvent && onChange) onChange(); });
  return ws;
}

export function loadBlocks(ws, state) {
  ws.clear();
  if (state) { try { Blockly.serialization.workspaces.load(state, ws); } catch (e) { /* испорченное сохранение */ } }
  if (!ws.getTopBlocks(false).some((b) => b.type === "spike_start")) {
    const s = ws.newBlock("spike_start"); s.initSvg(); s.render(); s.moveBy(30, 30);
  }
}

export const saveBlocks = (ws) => Blockly.serialization.workspaces.save(ws);
export { Blockly };
