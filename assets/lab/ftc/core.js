// Ядро симулятора FTC без DOM: устройства FTC SDK, физика шасси, учебная игра «Сбор пыльцы» и проверки заданий.
// Время симуляции идет шагами dt; код ученика (async) просыпается на шагах, поэтому результат воспроизводим.
import { transpile, JavaError } from "./java.js";

export const HALF = 72;                       // поле 144 x 144 дюйма, начало координат в центре
export const VMAX = 60;                       // дюйм/с при мощности 1
export const TPR = 537.7;                     // тиков на оборот выходного вала
export const WHEEL_D = 104 / 25.4;            // колесо 104 мм в дюймах
export const TPI = TPR / (Math.PI * WHEEL_D); // ~41,8 тика на дюйм
export const TPS = VMAX * TPI;                // тиков в секунду на полной мощности
export const HIVE = { x: 0, y: 0, r: 10 };
export const PARK = { x0: 44, y0: -72, x1: 72, y1: -44 };
export const CAPACITY = 4;
export const HIT_MIN = 24, HIT_MAX = 84, HIT_DEG = 8;
const STOP = { stop: true };

export const DRIVES = {
  mecanum: { title: "Mecanum", motors: [["frontLeft", -1], ["frontRight", 1], ["backLeft", -1], ["backRight", 1]] },
  tank: { title: "Танковое", motors: [["leftDrive", -1], ["rightDrive", 1]] },
};
export const MODULES = {
  intake: { title: "Захват-ролик (intake)", text: "Затягивает пыльцу с поля, держит до 4 штук", motors: ["intake"], servos: [] },
  launcher: { title: "Пусковая установка", text: "Маховик и заслонка: выстрел в улей с 24-84 дюймов", motors: ["launcher"], servos: ["gate"] },
  lift: { title: "Подъемник на слайдах", text: "Мотор с энкодером, упоры 0 и 3000 тиков", motors: ["lift"], servos: [] },
  claw: { title: "Клешня", text: "Сервопривод: 0 открыта, 1 закрыта", motors: [], servos: ["claw"] },
  distance: { title: "Датчик расстояния", text: "Спереди по центру, до 200 см", motors: [], servos: [], sensors: [["distance", "DistanceSensor"]] },
  arm: { title: "Неподвижная длинная рука", text: "Торчит вперед на 5 дюймов и не складывается", motors: [], servos: [], ext: 5 },
};
export const DEFAULT_ROBOT = { drive: "mecanum", size: 18, modules: ["intake", "launcher"], names: {} };

export function deviceList(robot) {
  const list = [];
  const nm = (role) => (robot.names && robot.names[role] != null ? robot.names[role] : role);
  let mp = 0, sp = 0;
  const port = (k) => (k < 4 ? `Control Hub ${k}` : `Expansion Hub ${k - 4}`);
  for (const [role] of (DRIVES[robot.drive] || DRIVES.mecanum).motors) list.push({ role, type: "DcMotor", port: "Мотор " + port(mp++), name: nm(role) });
  for (const m of robot.modules || []) {
    const def = MODULES[m]; if (!def) continue;
    for (const role of def.motors) list.push({ role, type: "DcMotor", port: "Мотор " + port(mp++), name: nm(role) });
    for (const role of def.servos) list.push({ role, type: "Servo", port: "Серво " + port(sp++).replace("Expansion Hub", "Exp").replace("Control Hub", "CH"), name: nm(role) });
    for (const [role, type] of def.sensors || []) list.push({ role, type, port: "I2C 1", name: nm(role) });
  }
  list.push({ role: "imu", type: "IMU", port: "Встроенный", name: nm("imu") });
  return list;
}

export function inspect(robot) {
  const devs = deviceList(robot);
  const ext = Math.max(0, ...(robot.modules || []).map((m) => (MODULES[m] && MODULES[m].ext) || 0));
  const start = +(robot.size + ext).toFixed(1);
  const motors = devs.filter((d) => d.type === "DcMotor").length;
  const servos = devs.filter((d) => d.type === "Servo").length;
  const names = devs.map((d) => d.name.trim());
  const uniq = names.every((n) => n) && new Set(names).size === names.length;
  return [
    { id: "size", ok: start <= 18, label: `Стартовый размер ${String(start).replace(".", ",")} дюйма (предел 18)` },
    { id: "motors", ok: motors <= 8, label: `Моторов ${motors} (предел 8)` },
    { id: "servos", ok: servos <= 8, label: `Сервоприводов ${servos} (предел 8)` },
    { id: "names", ok: uniq, label: "Имена устройств не пустые и не повторяются" },
  ];
}

// ─────────────── Форматирование как в Java ───────────────
export function jformat(fmt, ...args) {
  let k = 0;
  return String(fmt).replace(/%([-+ 0,]*)(\d+)?(?:\.(\d+))?([dfsbxne%])/g, (m, flags, width, prec, conv) => {
    if (conv === "%") return "%";
    if (conv === "n") return "\n";
    const v = args[k++];
    let s;
    if (conv === "d") s = String(Math.trunc(Number(v)));
    else if (conv === "f") s = Number(v).toFixed(prec != null ? +prec : 6);
    else if (conv === "e") s = Number(v).toExponential(prec != null ? +prec : 6);
    else if (conv === "x") s = (Math.trunc(Number(v)) >>> 0).toString(16);
    else if (conv === "b") s = String(!!v);
    else s = jstr(v);
    if (flags.includes("+") && Number(v) >= 0 && "df".includes(conv)) s = "+" + s;
    if (width && s.length < +width) s = flags.includes("-") ? s.padEnd(+width) : s.padStart(+width, flags.includes("0") ? "0" : " ");
    return s;
  });
}
const jstr = (v) => (v === null || v === undefined ? "null" : typeof v === "number" && !Number.isFinite(v) ? (Number.isNaN(v) ? "NaN" : v > 0 ? "Infinity" : "-Infinity") : String(v));

// ─────────────── Геймпад ───────────────
export const BUTTONS = ["a", "b", "x", "y", "dpad_up", "dpad_down", "dpad_left", "dpad_right", "left_bumper", "right_bumper", "start", "back", "left_stick_button", "right_stick_button"];
export const AXES = ["left_stick_x", "left_stick_y", "right_stick_x", "right_stick_y", "left_trigger", "right_trigger"];
const camel = (s) => s.replace(/_(\w)/g, (_, c) => c.toUpperCase());
function makeGamepad() {
  const g = { _prev: {}, _pressed: {}, _released: {} };
  for (const b of BUTTONS) {
    g[b] = false;
    g[camel(b) + "WasPressed"] = () => { const v = !!g._pressed[b]; g._pressed[b] = false; return v; };
    g[camel(b) + "WasReleased"] = () => { const v = !!g._released[b]; g._released[b] = false; return v; };
  }
  for (const a of AXES) g[a] = 0;
  g.rumble = () => {}; g.stopRumble = () => {};
  g.atRest = () => AXES.every((a) => Math.abs(g[a]) < 0.05);
  return g;
}
function feedGamepad(g, src) {
  for (const b of BUTTONS) {
    const v = !!(src && src[b]);
    if (v && !g._prev[b]) g._pressed[b] = true;
    if (!v && g._prev[b]) g._released[b] = true;
    g._prev[b] = v; g[b] = v;
  }
  for (const a of AXES) { let v = src ? Number(src[a]) || 0 : 0; if (Math.abs(v) < 0.04) v = 0; g[a] = Math.max(a.endsWith("trigger") ? 0 : -1, Math.min(1, v)); }
}

class SdkError extends Error {}

const ENUMS = {
  Direction: { FORWARD: "FORWARD", REVERSE: "REVERSE" },
  RunMode: { RUN_WITHOUT_ENCODER: "RUN_WITHOUT_ENCODER", RUN_USING_ENCODER: "RUN_USING_ENCODER", RUN_TO_POSITION: "RUN_TO_POSITION", STOP_AND_RESET_ENCODER: "STOP_AND_RESET_ENCODER" },
  ZeroPowerBehavior: { BRAKE: "BRAKE", FLOAT: "FLOAT", UNKNOWN: "UNKNOWN" },
};

// ─────────────── Мотор и сервопривод ───────────────
class Motor {
  constructor(core, name, role, mount) {
    Object.assign(this, { core, name, role, mount, power: 0, dir: 1, mode: "RUN_WITHOUT_ENCODER", zpb: "BRAKE", target: 0, targetSet: false, pos: 0, vel: 0 });
    this.tau = role === "launcher" ? 0.45 : 0.1;
    const m = this;
    const num = (v, what) => { const n = Number(v); if (!Number.isFinite(n)) throw new SdkError(`${what}: получено ${jstr(v)}, нужно число`); return n; };
    this.api = {
      setPower(p) { m.power = Math.max(-1, Math.min(1, num(p, `${name}.setPower`))); },
      getPower() { return m.power; },
      setDirection(d) { m.dir = d === "REVERSE" ? -1 : 1; },
      getDirection() { return m.dir < 0 ? "REVERSE" : "FORWARD"; },
      setMode(md) {
        if (!ENUMS.RunMode[md]) throw new SdkError(`${name}.setMode: неизвестный режим ${md}`);
        if (md === "STOP_AND_RESET_ENCODER") { m.pos = 0; m.power = 0; m.mode = "RUN_WITHOUT_ENCODER"; m.resetMode = true; return; }
        if (md === "RUN_TO_POSITION" && !m.targetSet) throw new SdkError(`${name}: перед RUN_TO_POSITION вызовите setTargetPosition()`);
        m.mode = md;
      },
      getMode() { return m.mode; },
      setZeroPowerBehavior(z) { m.zpb = z; },
      getZeroPowerBehavior() { return m.zpb; },
      setTargetPosition(t) { m.target = Math.round(num(t, `${name}.setTargetPosition`)); m.targetSet = true; },
      getTargetPosition() { return m.target; },
      getCurrentPosition() { return Math.round(m.pos); },
      isBusy() { return m.mode === "RUN_TO_POSITION" && Math.abs(m.target - m.pos) > 10; },
      getVelocity() { return m.vel * TPS; },
      setVelocity(v) { m.power = Math.max(-1, Math.min(1, num(v, `${name}.setVelocity`) / TPS)); if (m.mode === "RUN_WITHOUT_ENCODER") m.mode = "RUN_USING_ENCODER"; },
      getPortNumber() { return 0; },
      getDeviceName() { return name; },
    };
  }
  update(dt) {
    let cmd = this.power;
    if (this.mode === "RUN_TO_POSITION") {
      const err = this.target - this.pos, lim = Math.abs(this.power);
      cmd = Math.max(-lim, Math.min(lim, err / 120));
      if (Math.abs(err) > 6 && Math.abs(cmd) < 0.05 && lim > 0) cmd = Math.sign(err) * Math.min(lim, 0.05);
    }
    const tau = cmd === 0 ? (this.zpb === "FLOAT" ? 0.5 : 0.05) : this.tau;
    this.vel += (cmd - this.vel) * Math.min(1, dt / tau);
    this.pos += this.vel * TPS * dt;
    if (this.role === "lift") { if (this.pos < 0) { this.pos = 0; this.vel = Math.max(0, this.vel); } if (this.pos > 3000) { this.pos = 3000; this.vel = Math.min(0, this.vel); } }
  }
  wheel() { return this.vel * this.dir * this.mount * VMAX; } // скорость поверхности колеса «вперед», дюйм/с
}

class Servo {
  constructor(name, role) {
    Object.assign(this, { name, role, target: 0.5, pos: 0.5, dir: 1, set: false });
    const s = this;
    this.api = {
      setPosition(p) { const n = Number(p); if (!Number.isFinite(n)) throw new SdkError(`${name}.setPosition: нужно число`); s.target = Math.max(0, Math.min(1, n)); s.set = true; },
      getPosition() { return s.target; },
      setDirection(d) { s.dir = d === "REVERSE" ? -1 : 1; },
      getDirection() { return s.dir < 0 ? "REVERSE" : "FORWARD"; },
      getDeviceName() { return name; },
    };
  }
  update(dt) { const goal = this.dir < 0 ? 1 - this.target : this.target; const d = goal - this.pos; this.pos += Math.sign(d) * Math.min(Math.abs(d), 2.5 * dt); }
}

// ─────────────── Ядро ───────────────
export class Core {
  constructor({ preset = {}, robot = null } = {}) {
    this.preset = preset;
    this.robot = JSON.parse(JSON.stringify(robot || preset.robot || DEFAULT_ROBOT));
    this.dt = 1 / 60;
    this.input = {};            // ввод пилота (клавиатура, экранный или настоящий геймпад)
    this.script = null;         // сценарий геймпада для автопроверки: [[t0, t1, {...}], ...]
    this.listeners = [];
    this.reset();
  }

  on(fn) { this.listeners.push(fn); }
  emit(ev, data) { for (const f of this.listeners) f(ev, data); }

  setRobot(robot) { this.robot = JSON.parse(JSON.stringify(robot)); this.reset(); }

  reset() {
    const st = this.preset.start || { x: 0, y: -60, h: 0 };
    this.pose = { x: st.x, y: st.y, h: (st.h || 0) * Math.PI / 180 };
    this.startPose = { ...this.pose };
    this.vel = { f: 0, r: 0, w: 0 };
    this.t = 0; this.tStart = null; this.phase = "idle"; this.error = null; this.endReason = "";
    this.waiters = []; this.iter = 0; this.stopRequested = false;
    this.telemetryShown = []; this.telemetryBuf = []; this.log = [];
    this.gamepad1 = makeGamepad(); this.gamepad2 = makeGamepad();
    this.motors = {}; this.servos = {}; this.devices = new Map();
    for (const d of deviceList(this.robot)) {
      let dev;
      if (d.type === "DcMotor") {
        const mount = ((DRIVES[this.robot.drive] || DRIVES.mecanum).motors.find(([r]) => r === d.role) || [0, 1])[1];
        dev = new Motor(this, d.name, d.role, mount); this.motors[d.role] = dev;
      } else if (d.type === "Servo") { dev = new Servo(d.name, d.role); this.servos[d.role] = dev; if (d.role === "gate") dev.pos = dev.target = 0; }
      else if (d.type === "IMU") dev = this.makeImu();
      else if (d.type === "DistanceSensor") dev = this.makeDistance();
      this.devices.set(d.name, { type: d.type, role: d.role, api: dev.api || dev });
    }
    // Игра
    this.pollen = (this.preset.pollen === "none" ? [] : defaultPollen()).map((p, i) => ({ id: i, ...p }));
    this.held = this.has("intake") || this.has("launcher") ? (this.preset.preload ?? 4) : 0;
    this.flying = []; this.cool = 0; this.ejectCool = 0;
    this.score = { leave: 0, hive: 0, park: 0 }; this.hits = 0; this.collected = 0; this.shots = 0;
    this.trail = [{ x: this.pose.x, y: this.pose.y }]; this.trailT = 0;
    this.checkState = (this.preset.checks || []).map(() => ({ ok: false }));
    this.code = "";
    this.evalStatic();
  }

  has(module) { return (this.robot.modules || []).includes(module); }
  get size() { return this.robot.size || 18; }

  makeImu() {
    const core = this;
    let offset = 0;
    const yaw = () => { let a = (core.pose.h - offset) * 180 / Math.PI; a = ((a + 180) % 360 + 360) % 360 - 180; return a; };
    const angles = () => ({
      getYaw: (u) => (u === "RADIANS" ? yaw() * Math.PI / 180 : yaw()), getPitch: () => 0, getRoll: () => 0,
      getAcquisitionTime: () => core.t,
    });
    return {
      initialize() { return true; },
      resetYaw() { offset = core.pose.h; },
      getRobotYawPitchRollAngles: angles,
      getRobotAngularVelocity: (u) => ({ zRotationRate: u === "RADIANS" ? core.vel.w : core.vel.w * 180 / Math.PI, xRotationRate: 0, yRotationRate: 0 }),
      getDeviceName: () => "imu",
    };
  }

  makeDistance() {
    const core = this;
    const k = { CM: 2.54, MM: 25.4, METER: 0.0254, INCH: 1 };
    return {
      getDistance(unit) {
        const inch = Math.min(core.rayFront(), 200 / 2.54);
        return inch * (k[unit] ?? 2.54);
      },
      getDeviceName: () => "distance",
    };
  }

  rayFront() {
    const { x, y, h } = this.pose;
    const fx = -Math.sin(h), fy = Math.cos(h);
    const ox = x + fx * this.size / 2, oy = y + fy * this.size / 2;
    let best = Infinity;
    if (fx > 1e-6) best = Math.min(best, (HALF - ox) / fx); if (fx < -1e-6) best = Math.min(best, (-HALF - ox) / fx);
    if (fy > 1e-6) best = Math.min(best, (HALF - oy) / fy); if (fy < -1e-6) best = Math.min(best, (-HALF - oy) / fy);
    // улей
    const dx = ox - HIVE.x, dy = oy - HIVE.y, b = dx * fx + dy * fy, c = dx * dx + dy * dy - HIVE.r * HIVE.r, disc = b * b - c;
    if (disc >= 0) { const t = -b - Math.sqrt(disc); if (t > 0) best = Math.min(best, t); }
    return Math.max(0, best);
  }

  // ─────────────── Запуск кода ───────────────
  compile(code) {
    const tr = transpile(code);
    this.kind = tr.kind; this.opName = tr.name;
    return tr;
  }

  env() {
    const core = this;
    const hw = {
      get(cls, name) {
        if (name === undefined) { name = cls; cls = null; }
        const d = core.devices.get(name);
        if (!d) throw new SdkError(`Устройство «${name}» не найдено в конфигурации робота. В конфигурации есть: ${[...core.devices.keys()].join(", ")}`);
        const fam = { DcMotor: "DcMotor", DcMotorEx: "DcMotor", DcMotorSimple: "DcMotor", Servo: "Servo", IMU: "IMU", DistanceSensor: "DistanceSensor", Rev2mDistanceSensor: "DistanceSensor" };
        if (cls && fam[cls] && fam[cls] !== d.type) throw new SdkError(`«${name}» в конфигурации - ${d.type}, а в коде запрошен ${cls}`);
        return d.api;
      },
    };
    hw.dcMotor = { get: (n) => hw.get("DcMotor", n) };
    hw.servo = { get: (n) => hw.get("Servo", n) };
    const telemetry = {
      addData(cap, v, ...args) { core.telemetryBuf.push(`${cap} : ${args.length ? jformat(v, ...args) : jstr(v)}`); return telemetry; },
      addLine(s = "") { core.telemetryBuf.push(String(s)); return telemetry; },
      update() { core.telemetryShown = core.telemetryBuf.slice(0, 40); core.telemetryBuf = []; core.emit("telemetry"); return true; },
      clear() { core.telemetryBuf = []; },
      clearAll() { core.telemetryBuf = []; core.telemetryShown = []; },
      setAutoClear() {}, setMsTransmissionInterval() {}, speak() {},
      log() { return { add: (s, ...a) => { core.log.push(a.length ? jformat(s, ...a) : String(s)); } }; },
    };
    const tick = () => new Promise((resolve, reject) => core.waiters.push({ t: 0, resolve, reject }));
    const jMath = Object.create(Math);
    Object.assign(jMath, { toRadians: (d) => d * Math.PI / 180, toDegrees: (r) => r * 180 / Math.PI, signum: (v) => Math.sign(v), floorMod: (a, b) => ((a % b) + b) % b, clamp: (v, a, b) => Math.max(a, Math.min(b, v)), round: (v) => Math.round(v) });
    class ElapsedTime {
      constructor() { this.t0 = core.t; }
      reset() { this.t0 = core.t; }
      seconds() { return core.t - this.t0; }
      milliseconds() { return (core.t - this.t0) * 1000; }
      time() { return core.t - this.t0; }
      toString() { return (core.t - this.t0).toFixed(3) + " seconds"; }
    }
    class Parameters { constructor(o) { this.o = o; } }
    const dirs = { UP: "UP", DOWN: "DOWN", LEFT: "LEFT", RIGHT: "RIGHT", FORWARD: "FORWARD", BACKWARD: "BACKWARD" };
    class RevHubOrientationOnRobot { constructor(a, b) { this.a = a; this.b = b; } }
    RevHubOrientationOnRobot.LogoFacingDirection = dirs; RevHubOrientationOnRobot.UsbFacingDirection = dirs;
    const E = {
      hardwareMap: hw, telemetry, gamepad1: this.gamepad1, gamepad2: this.gamepad2, Math: jMath,
      DcMotor: { ...ENUMS }, DcMotorEx: { ...ENUMS }, DcMotorSimple: { Direction: ENUMS.Direction },
      Servo: { Direction: ENUMS.Direction }, IMU: { Parameters }, RevHubOrientationOnRobot,
      AngleUnit: { DEGREES: "DEGREES", RADIANS: "RADIANS" }, DistanceUnit: { CM: "CM", MM: "MM", INCH: "INCH", METER: "METER" },
      Range: { clip: (v, a, b) => Math.max(a, Math.min(b, v)), scale: (n, x1, x2, y1, y2) => y1 + (n - x1) * (y2 - y1) / (x2 - x1) },
      ElapsedTime,
      String: { format: jformat, valueOf: jstr },
      Integer: { parseInt: (s) => parseInt(s, 10), MAX_VALUE: 2147483647, MIN_VALUE: -2147483648, toString: jstr },
      Double: { parseDouble: parseFloat, MAX_VALUE: Number.MAX_VALUE, toString: jstr },
      System: { out: { println: (s = "") => core.log.push(jstr(s)), print: (s) => core.log.push(jstr(s)) }, currentTimeMillis: () => Math.round(core.t * 1000), nanoTime: () => Math.round(core.t * 1e9) },
      getRuntime: () => (core.tStart == null ? 0 : core.t - core.tStart),
      sleep: (ms) => { if (core.stopRequested) return Promise.reject(STOP); return new Promise((resolve, reject) => core.waiters.push({ t: core.t + Math.max(0, Number(ms) || 0) / 1000 - 1e-9, resolve, reject })); },
      waitForStart: async () => {
        core.reachedWait = true; core.emit("ready");
        while (core.phase === "init") await tick();
        if (core.stopRequested) throw STOP;
      },
      opModeIsActive: async () => { await tick(); return core.phase === "run" && !core.stopRequested; },
      opModeInInit: async () => { await tick(); return core.phase === "init"; },
      isStopRequested: async () => core.stopRequested,
      isStarted: () => core.phase === "run",
      idle: () => tick(),
      requestOpModeStop: () => { core.stop("Программа вызвала requestOpModeStop()"); },
      terminateOpModeNow: () => { core.stop("Программа вызвала terminateOpModeNow()"); throw STOP; },
      __y: async () => {
        if (core.stopRequested) throw STOP;
        if (++core.iter > 400) await tick();
      },
    };
    return E;
  }

  // INIT: перевести и запустить код до waitForStart
  init(code) {
    this.reset();
    this.code = code;
    let tr;
    try { tr = this.compile(code); } catch (e) {
      this.phase = "error";
      this.error = e instanceof JavaError ? `Строка ${e.line}: ${e.message}` : String(e.message || e);
      this.emit("error"); return false;
    }
    const E = this.env();
    const names = Object.keys(E);
    let fn;
    try {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      fn = new AsyncFunction(...names, `"use strict";${tr.js}\nreturn await runOpMode();`);
    } catch (e) {
      this.phase = "error"; this.error = "Синтаксическая ошибка: " + explain(e); this.emit("error"); return false;
    }
    this.phase = "init"; this.reachedWait = false;
    this.evalStatic();
    this.emit("phase");
    this.running = fn(...names.map((n) => E[n])).then(
      () => this.finish("done"),
      (e) => { if (e === STOP) this.finish("stopped"); else { this.error = errLine(e) + explain(e); this.finish("error"); } },
    );
    return true;
  }

  start() {
    if (this.phase !== "init") return;
    this.phase = "run"; this.tStart = this.t;
    this.limit = this.preset.limit || (this.kind === "auto" ? 30 : 0);
    this.emit("phase");
  }

  stop(reason = "") {
    if (!["init", "run"].includes(this.phase)) return;
    this.endReason = this.endReason || reason;
    this.stopRequested = true;
    const ws = this.waiters; this.waiters = [];
    for (const w of ws) w.reject(STOP);
  }

  finish(how) {
    if (["done", "stopped", "error"].includes(this.phase)) return;
    const wasRun = this.phase === "run";
    this.stopRequested = true;
    for (const m of Object.values(this.motors)) { m.power = 0; if (m.mode === "RUN_TO_POSITION") m.mode = "RUN_WITHOUT_ENCODER"; }
    this.phase = how;
    if (how === "done" && !this.endReason) this.endReason = "Программа завершилась";
    if (wasRun) { this.scorePark(); this.evalEnd(); }
    const ws = this.waiters; this.waiters = [];
    for (const w of ws) w.reject(STOP);
    this.emit("phase");
  }

  // ─────────────── Шаг симуляции ───────────────
  step() {
    const dt = this.dt;
    this.t += dt; this.iter = 0;
    let src = this.input;
    if (this.script && this.phase === "run") {
      const rt = this.t - this.tStart;
      src = {};
      for (const [a, b, vals] of this.script) if (rt >= a && rt < b) Object.assign(src, vals);
    }
    if (this.phase === "run") feedGamepad(this.gamepad1, src); else feedGamepad(this.gamepad1, null);
    for (const m of Object.values(this.motors)) m.update(dt);
    for (const s of Object.values(this.servos)) s.update(dt);
    this.drive(dt);
    this.game(dt);
    if (this.phase === "run") {
      this.trailT += dt;
      if (this.trailT > 0.1) { this.trailT = 0; this.trail.push({ x: this.pose.x, y: this.pose.y }); if (this.trail.length > 900) this.trail.shift(); }
      if (this.limit && this.t - this.tStart >= this.limit - 1e-9) this.stop(this.kind === "auto" ? "30 секунд AUTO закончились" : "Время матча закончилось");
      this.evalLive();
    }
    const ws = this.waiters; this.waiters = [];
    for (const w of ws) { if (w.t <= this.t) w.resolve(); else this.waiters.push(w); }
  }

  drive(dt) {
    const p = this.pose, m = this.motors;
    let f = 0, r = 0, w = 0;
    if (this.robot.drive === "tank") {
      const L = m.leftDrive ? m.leftDrive.wheel() : 0, R = m.rightDrive ? m.rightDrive.wheel() : 0;
      f = (L + R) / 2; w = (L - R) / 2 / 8;
    } else {
      const fl = m.frontLeft ? m.frontLeft.wheel() : 0, fr = m.frontRight ? m.frontRight.wheel() : 0;
      const bl = m.backLeft ? m.backLeft.wheel() : 0, br = m.backRight ? m.backRight.wheel() : 0;
      f = (fl + fr + bl + br) / 4; r = (fl - fr - bl + br) / 4 * 0.85; w = (fl - fr + bl - br) / 4 / 13;
    }
    this.vel = { f, r, w: -w };
    p.h -= w * dt;
    const fx = -Math.sin(p.h), fy = Math.cos(p.h), rx = Math.cos(p.h), ry = Math.sin(p.h);
    p.x += (fx * f + rx * r) * dt; p.y += (fy * f + ry * r) * dt;
    // стены
    const half = this.size / 2, ext = half * (Math.abs(Math.cos(p.h)) + Math.abs(Math.sin(p.h)));
    p.x = Math.max(-HALF + ext, Math.min(HALF - ext, p.x)); p.y = Math.max(-HALF + ext, Math.min(HALF - ext, p.y));
    // улей
    const dx = p.x - HIVE.x, dy = p.y - HIVE.y, d = Math.hypot(dx, dy), minD = HIVE.r + half * 0.95;
    if (d < minD) { const k = d < 1e-6 ? 1 : minD / d; p.x = HIVE.x + dx * k; p.y = HIVE.y + (d < 1e-6 ? minD : dy * k); }
  }

  local(x, y) {
    const p = this.pose, dx = x - p.x, dy = y - p.y;
    return { f: dx * -Math.sin(p.h) + dy * Math.cos(p.h), r: dx * Math.cos(p.h) + dy * Math.sin(p.h) };
  }
  world(f, r) {
    const p = this.pose;
    return { x: p.x + -Math.sin(p.h) * f + Math.cos(p.h) * r, y: p.y + Math.cos(p.h) * f + Math.sin(p.h) * r };
  }

  game(dt) {
    const half = this.size / 2;
    const intake = this.motors.intake;
    // пыльца на поле: забор и толкание корпусом
    for (const b of this.pollen) {
      if (b.state !== "field") continue;
      const l = this.local(b.x, b.y);
      if (intake && intake.vel > 0.3 && this.held < CAPACITY && l.f > half - 2 && l.f < half + 5 && Math.abs(l.r) < half - 2) {
        b.state = "held"; this.held++; this.collected++; this.emit("collect"); continue;
      }
      if (Math.abs(l.f) < half + 2.5 && Math.abs(l.r) < half + 2.5) {
        // выталкиваем по ближайшей оси
        const pf = half + 2.5 - Math.abs(l.f), pr = half + 2.5 - Math.abs(l.r);
        const nl = pf < pr ? { f: Math.sign(l.f || 1) * (half + 2.5), r: l.r } : { f: l.f, r: Math.sign(l.r || 1) * (half + 2.5) };
        const w = this.world(nl.f, nl.r);
        b.x = Math.max(-HALF + 2.5, Math.min(HALF - 2.5, w.x)); b.y = Math.max(-HALF + 2.5, Math.min(HALF - 2.5, w.y));
      }
    }
    // выброс назад реверсом захвата
    this.ejectCool -= dt;
    if (intake && intake.vel < -0.3 && this.held > 0 && this.ejectCool <= 0) {
      this.ejectCool = 0.35; this.held--;
      const w = this.world(half + 6, 0);
      this.dropBall(w.x, w.y);
    }
    // пуск
    this.cool -= dt;
    const L = this.motors.launcher, gate = this.servos.gate;
    if (L && gate && this.phase === "run" && gate.pos > 0.5 && L.vel > 0.8 && this.held > 0 && this.cool <= 0) {
      this.cool = 0.4; this.held--; this.shots++;
      const p = this.pose, dx = HIVE.x - p.x, dy = HIVE.y - p.y, dist = Math.hypot(dx, dy);
      const fx = -Math.sin(p.h), fy = Math.cos(p.h);
      const err = Math.abs(Math.atan2(fx * dy - fy * dx, fx * dx + fy * dy)) * 180 / Math.PI;
      const hit = dist >= HIT_MIN && dist <= HIT_MAX && err <= HIT_DEG;
      const land = hit ? { x: HIVE.x, y: HIVE.y } : this.world(Math.min(70, 30 + 40 * L.vel), 0);
      this.flying.push({ x0: p.x, y0: p.y, x1: land.x, y1: land.y, t: 0, dur: 0.5, hit, dist, err });
      this.emit("shot", { hit, dist, err });
    }
    for (const f of this.flying) {
      f.t += dt;
      if (f.t >= f.dur && !f.done) {
        f.done = true;
        if (f.hit) { this.hits++; this.score.hive += 3; this.emit("score"); }
        else this.dropBall(f.x1, f.y1);
      }
    }
    this.flying = this.flying.filter((f) => !f.done || f.t < f.dur + 0.4);
    // LEAVE в AUTO
    if (this.phase === "run" && this.kind === "auto" && !this.score.leave && Math.hypot(this.pose.x - this.startPose.x, this.pose.y - this.startPose.y) > 12) this.score.leave = 3;
  }

  dropBall(x, y) {
    x = Math.max(-HALF + 3, Math.min(HALF - 3, x)); y = Math.max(-HALF + 3, Math.min(HALF - 3, y));
    const d = Math.hypot(x - HIVE.x, y - HIVE.y);
    if (d < HIVE.r + 3) { const k = (HIVE.r + 3) / Math.max(d, 1e-6); x = HIVE.x + (x - HIVE.x) * k; y = HIVE.y + (d < 1e-6 ? HIVE.r + 3 : (y - HIVE.y) * k); }
    this.pollen.push({ id: this.pollen.length, x, y, state: "field" });
  }

  inPark() { const p = this.pose; return p.x >= PARK.x0 && p.x <= PARK.x1 && p.y >= PARK.y0 && p.y <= PARK.y1; }
  scorePark() { this.score.park = this.inPark() ? 5 : 0; }
  get total() { return this.score.leave + this.score.hive + this.score.park; }
  get heading() { let a = this.pose.h * 180 / Math.PI; return ((a + 180) % 360 + 360) % 360 - 180; }

  // ─────────────── Проверки ───────────────
  evalStatic() {
    const checks = this.preset.checks || [];
    checks.forEach((c, i) => {
      const s = this.checkState[i]; if (!s) return;
      if (c.type === "inspection") s.ok = inspect(this.robot).every((x) => x.ok);
      else if (c.type === "builder_has") s.ok = (!c.drive || this.robot.drive === c.drive) && (c.modules || []).every((m) => this.has(m));
      else if (c.type === "code_has") s.ok = !!this.code && new RegExp(c.re).test(this.code);
    });
  }

  evalLive() {
    const checks = this.preset.checks || [];
    const rt = this.t - this.tStart;
    checks.forEach((c, i) => {
      const s = this.checkState[i]; if (s.ok) return;
      if (c.type === "init_ok") s.ok = !!this.reachedWait;
      else if (c.type === "zones") {
        s.seen ||= new Set();
        c.zones.forEach((z, k) => { if (Math.hypot(this.pose.x - z.x, this.pose.y - z.y) <= z.r) s.seen.add(k); });
        s.ok = s.seen.size === c.zones.length;
      } else if (c.type === "strafe") {
        if (!s.ref || Math.abs(angDiff(this.pose.h, s.ref.h)) > 10 * Math.PI / 180) s.ref = { ...this.pose };
        const l = localOf(s.ref, this.pose.x, this.pose.y);
        if (Math.abs(l.f) > (c.dist || 24) * 0.5) s.ref = { ...this.pose };
        else if (Math.abs(l.r) >= (c.dist || 24)) s.ok = true;
      } else if (c.type === "telemetry") s.ok = this.telemetryShown.some((l) => l.includes(c.text));
      else if (c.type === "collect") s.ok = this.collected >= c.n;
      else if (c.type === "hits") s.ok = this.hits >= c.n && (!c.within || rt <= c.within);
      else if (c.type === "score") s.ok = this.total >= c.n;
    });
    this.evalStatic();
  }

  evalEnd() {
    const checks = this.preset.checks || [];
    checks.forEach((c, i) => {
      const s = this.checkState[i]; if (s.ok) return;
      if (c.type === "pose_end") s.ok = Math.hypot(this.pose.x - c.x, this.pose.y - c.y) <= c.tol;
      else if (c.type === "heading_end") s.ok = Math.abs(angDiff(this.heading * Math.PI / 180, c.deg * Math.PI / 180)) * 180 / Math.PI <= c.tol;
      else if (c.type === "park") s.ok = this.inPark();
      else if (c.type === "finished") s.ok = this.phase === "done" || this.endReason === "Программа завершилась";
      else if (c.type === "score") s.ok = this.total >= c.n;
    });
    this.evalLive && this.evalStatic();
  }

  get allOk() { return this.checkState.length > 0 && this.checkState.every((s) => s.ok); }
}

const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
const localOf = (ref, x, y) => { const dx = x - ref.x, dy = y - ref.y; return { f: dx * -Math.sin(ref.h) + dy * Math.cos(ref.h), r: dx * Math.cos(ref.h) + dy * Math.sin(ref.h) }; };

export function defaultPollen() {
  const out = [];
  for (const y of [-30, -12, 6, 24]) { out.push({ x: -56, y, state: "field" }); out.push({ x: 56, y, state: "field" }); }
  for (const x of [-30, -10, 10, 30]) out.push({ x, y: 50, state: "field" });
  return out;
}

function errLine(e) {
  const m = String(e && e.stack || "").match(/<anonymous>:(\d+):\d+/);
  return m ? `Строка ${Math.max(1, +m[1] - 2)}: ` : "";
}

function explain(e) {
  const msg = String(e && e.message || e);
  if (e instanceof SdkError) return msg;
  let m;
  if ((m = msg.match(/^(\w+) is not defined/))) return `неизвестное имя «${m[1]}». Проверьте написание (Java различает большие и маленькие буквы) и что переменная объявлена.`;
  if ((m = msg.match(/reading '(\w+)'/))) return `объект равен null, у него нельзя вызвать «${m[1]}». Получите устройство через hardwareMap.get(...) до использования.`;
  if ((m = msg.match(/(\S+) is not a function/))) return `«${m[1]}» - такого метода нет (или в симуляторе он не поддерживается). Проверьте имя.`;
  if ((m = msg.match(/Assignment to constant/))) return "нельзя изменить final-переменную.";
  if (/Unexpected token|Unexpected identifier|missing \)/.test(msg)) return `${msg}. Проверьте скобки и точки с запятой.`;
  if (/Maximum call stack/.test(msg)) return "бесконечная рекурсия: метод вызывает сам себя без остановки.";
  return msg;
}

// Пропуск шага событий: дать коду ученика доработать до следующего ожидания
let flushImpl;
if (typeof setImmediate === "function") flushImpl = () => new Promise((r) => setImmediate(r));
else {
  const ch = new MessageChannel(); const q = [];
  ch.port1.onmessage = () => { const r = q.shift(); r && r(); };
  flushImpl = () => new Promise((r) => { q.push(r); ch.port2.postMessage(0); });
}
export const flush = flushImpl;

export async function advance(core, n) {
  for (let i = 0; i < n; i++) {
    core.step();
    await flush();
  }
}
