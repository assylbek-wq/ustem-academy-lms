// Проверка примеров лаборатории электроники без браузера:
// 1) все детали и выводы существуют, в одном отверстии макетки не два вывода;
// 2) скетчи C++ компилируются для своей платы (avr-gcc через app/services/arduino.py);
// 3) программы MicroPython для ESP32 и micro:bit запускаются на модели платы 3 с без ошибок,
//    для Pico - на эмуляции RP2040 (если передан --pico, это долго).
// Запуск: node tests/e2e/lab_examples.mjs [--pico]
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lab = path.join(root, "assets/lab");
const { EXAMPLES } = await import(path.join(lab, "examples.js"));
const { PARTS, pinPos } = await import(path.join(lab, "parts/index.js"));
const { PyMcu } = await import(path.join(lab, "mcu/pyboard.js"));
const withPico = process.argv.includes("--pico");
let fail = 0;
const bad = (ex, msg) => { fail++; console.log(`  ОШИБКА ${ex.id}: ${msg}`); };

for (const ex of EXAMPLES) {
  const ids = new Set();
  const holes = new Map();
  for (const p of ex.parts) {
    if (!PARTS[p.type]) { bad(ex, `нет детали ${p.type}`); continue; }
    if (ids.has(p.id)) bad(ex, `повтор id ${p.id}`);
    ids.add(p.id);
  }
  const bb = ex.parts.filter((p) => /^breadboard/.test(p.type));
  for (const b of bb) for (const pin of PARTS[b.type].pins()) { const q = pinPos(b, pin); holes.set(`${q.x},${q.y}`, null); }
  for (const p of ex.parts) {
    const def = PARTS[p.type]; if (!def || /^breadboard/.test(p.type) || def.board) continue;
    for (const pin of def.pins()) {
      const q = pinPos({ ...p, rot: p.rot || 0 }, pin), k = `${q.x},${q.y}`;
      if (holes.has(k)) { if (holes.get(k)) bad(ex, `${p.id}.${pin.name} и ${holes.get(k)} в одном отверстии`); holes.set(k, `${p.id}.${pin.name}`); }
    }
  }
  for (const w of ex.wires) for (const end of [w.a, w.b]) {
    const [id, name] = end.split(/\.(.+)/);
    const p = ex.parts.find((q) => q.id === id);
    if (!p) { bad(ex, `провод ${w.id}: нет детали ${id}`); continue; }
    if (!PARTS[p.type].pins().some((q) => q.name === name)) bad(ex, `провод ${w.id}: у ${p.type} нет вывода ${name}`);
  }
  if (!/[^\x00-\x7f]/.test(ex.title)) bad(ex, "название без русского текста");
  for (const t of [ex.title, ex.desc, ex.code]) if (/[ё—]/.test(t)) bad(ex, "буква «ё» или длинное тире");
}
console.log(`Схемы: ${EXAMPLES.length} примеров проверено`);

// компиляция C++
const cpp = EXAMPLES.filter((e) => PARTS[e.board].lang === "cpp");
const py = `
import json, sys
sys.path.insert(0, ${JSON.stringify(root)})
from app.services import arduino
out = {}
for ex in json.load(sys.stdin):
    try:
        r = arduino.compile_sketch(ex["code"], ex["board"])
        out[ex["id"]] = {"ok": True, "size": r["size"], "flash": r["flash"]}
    except Exception as e:
        out[ex["id"]] = {"ok": False, "error": str(e)[:600]}
print(json.dumps(out))
`;
const res = JSON.parse(execFileSync("python3", ["-c", py], { input: JSON.stringify(cpp.map(({ id, board, code }) => ({ id, board, code }))), maxBuffer: 1 << 24 }).toString());
for (const ex of cpp) {
  const r = res[ex.id];
  if (!r.ok) bad(ex, "компиляция:\n" + r.error);
  else console.log(`  ${ex.id} (${ex.board}): ${r.size} байт из ${r.flash}`);
}

// MicroPython на модели платы (таймер держит процесс, пока идут асинхронные шаги)
const keepAlive = setInterval(() => {}, 1000);
const mp = await import(path.join(lab, "node_modules/@micropython/micropython-webassembly-pyscript/micropython.mjs"));
const wasmUrl = path.join(lab, "node_modules/@micropython/micropython-webassembly-pyscript/micropython.wasm");
for (const ex of EXAMPLES.filter((e) => e.board === "esp32" || e.board === "microbit")) {
  let err = null, out = "";
  const m = new PyMcu(ex.board, { onSerial: (s) => (out += s), onError: (e) => (err = e), loadMicroPython: mp.loadMicroPython, wasmUrl });
  // устройства, которые программа ждет: DHT и NeoPixel отвечают как настоящие
  for (const p of ex.parts) {
    if (/^dht/.test(p.type)) { const w = ex.wires.find((x) => x.b === `${p.id}.DATA` || x.a === `${p.id}.DATA`); const pin = (w.a.startsWith(p.id) ? w.b : w.a).split(".")[1]; m.devices.dht[pin] = { powered: () => true, temperature: () => p.props.temp, humidity: () => p.props.hum }; }
  }
  for (const p of ex.parts) if (p.type === "oled" || p.type === "lcd_i2c") m.i2c.attach({ addr: p.props.addr || (p.type === "oled" ? 60 : 39), write() { return true; }, read() { return 0; }, start() {}, stop() {} });
  await m.start(ex.code);
  for (let i = 0; i < 60 && !err; i++) await m.runAsync(0.05);
  m.stop();
  if (err) bad(ex, "MicroPython:\n" + err);
  else console.log(`  ${ex.id}: 3 с без ошибок` + (out ? `, вывод: ${JSON.stringify(out.slice(0, 60))}` : ""));
}

if (withPico) {
  const { Rp2040Mcu } = await import(path.join(lab, "mcu/rp2040.js"));
  const uf2 = readFileSync(path.join(root, "app/static/lab/pico/micropython.uf2"));
  const m = new Rp2040Mcu(uf2.buffer.slice(uf2.byteOffset, uf2.byteOffset + uf2.length), {});
  for (const ex of EXAMPLES.filter((e) => e.board === "pico")) {
    let err = null, out = "";
    m.rebind(); m.onSerial = (s) => (out += s); m.onError = (e) => (err = e);
    for (const p of ex.parts) if (p.type === "oled" || p.type === "lcd_i2c") m.i2c.attach({ addr: p.props.addr || (p.type === "oled" ? 60 : 39), write() { return true; }, read() { return 0; }, start() {}, stop() {} });
    m.start(ex.code);
    const t0 = m.now();
    while (m.now() - t0 < (m.booting ? 6 : 2) && !err) m.run(0.05, 1000);
    if (err) bad(ex, "Pico:\n" + err);
    else if (/Traceback/.test(out)) bad(ex, "Pico:\n" + out); else console.log(`  ${ex.id}: ${(m.now() - t0).toFixed(1)} с без ошибок, вывод: ${JSON.stringify(out.slice(0, 80))}`);
  }
}

clearInterval(keepAlive);
console.log(fail ? `Ошибок: ${fail}` : "Все примеры в порядке");
process.exit(fail ? 1 : 0);
