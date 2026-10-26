"""Проверка блоков SPIKE 3 (Word Blocks) в браузере: программы из новых блоков превращаются в Python и
работают в симуляторе без ошибок; старые блоки spike_* тоже работают.

Запуск (нужен сервер с демо-данными и Playwright):
    SEED_DEMO=1 PORT=5099 python wsgi.py &
    python3 tests/e2e/spike_wordblocks.py http://localhost:5099
"""
import asyncio
import sys

from playwright.async_api import async_playwright


def num(v):
    return {"shadow": {"type": "math_number", "fields": {"NUM": v}}}


def text(v):
    return {"shadow": {"type": "wb_text", "fields": {"TEXT": v}}}


def chain(*blocks):
    head = None
    for b in reversed(blocks):
        if head:
            b = {**b, "next": {"block": head}}
        head = b
    return head


def stack(hat, *blocks, x=30, y=30):
    h = {**hat, "x": x, "y": y}
    if blocks:
        h["next"] = {"block": chain(*blocks)}
    return h


def ws(*stacks, variables=None):
    d = {"blocks": {"languageVersion": 0, "blocks": list(stacks)}}
    if variables:
        d["variables"] = variables
    return d


def say(v):
    """Вывод в консоль (старый блок spike_print: в SPIKE 3 своего блока print нет)."""
    return {"type": "spike_print", "inputs": {"V": v}}


START = {"type": "flipperevents_whenProgramStarts"}
VAR = {"type": "data_variable", "fields": {"VARIABLE": {"id": "v1"}}}

CASES = {
    # движение на 10 см, мотор на 1 оборот, картинка, повтор, две шапки, кнопка и «остановить все»
    "basic": dict(preset="spike-sandbox", seconds=8, press=[[4.0, "left"]], moved=95, prints=["3", "left"], blocks=ws(
        stack(START,
              {"type": "flipperlight_lightDisplayImageOn", "fields": {"MATRIX": "9909999099000009000909990"}},
              {"type": "flippermove_move", "fields": {"DIRECTION": "forward", "UNIT": "cm"}, "inputs": {"VALUE": num(10)}},
              {"type": "flippermotor_motorTurnForDirection", "fields": {"PORT": "C", "DIRECTION": "clockwise", "UNIT": "rotations"},
               "inputs": {"VALUE": num(1)}},
              {"type": "control_repeat", "inputs": {"TIMES": num(3), "SUBSTACK": {"block": {
                  "type": "data_changevariableby", "fields": {"VARIABLE": {"id": "v1"}}, "inputs": {"VALUE": num(1)}}}}},
              say({"block": VAR}),
              {"type": "flipperlight_lightDisplayText", "inputs": {"TEXT": text("OK")}}),
        stack({"type": "flipperevents_whenButton", "fields": {"BUTTON": "LEFT", "EVENT": "pressed"}},
              say(text("left")), {"type": "flippercontrol_stop", "fields": {"STOP_OPTION": "all"}}, x=500),
        variables=[{"name": "счет", "id": "v1"}])),
    # «ждать до» отраженный свет < 50: робот едет к черной линии
    "line": dict(preset="spike-square", seconds=8, prints=["line"], blocks=ws(stack(START,
        {"type": "flippermove_movementSpeed", "inputs": {"SPEED": num(20)}},
        {"type": "flippermove_startMove", "fields": {"DIRECTION": "forward"}},
        {"type": "control_wait_until", "inputs": {"CONDITION": {"block": {
            "type": "flippersensors_isReflectivity", "fields": {"PORT": "E", "COMPARATOR": "<"}, "inputs": {"VALUE": num(50)}}}}},
        {"type": "flippermove_stopMove"},
        say(text("line"))))),
    # операторы, список, сообщения, «Мой блок», «и выйти из программы»
    "ops": dict(preset="spike-sandbox", seconds=8, prints=["a5", "True", "1", "got", "after"], blocks=ws(
        stack(START,
              say({"block": {"type": "operator_join", "inputs": {"STRING1": text("a"), "STRING2": {"block": {
                  "type": "operator_add", "inputs": {"NUM1": num(2), "NUM2": num(3)}}}}}}),
              say({"block": {"type": "flipperoperator_isInBetween", "inputs": {"VALUE": num(3), "LOW": num(-10), "HIGH": num(10)}}}),
              {"type": "data_addtolist", "fields": {"LIST": {"id": "l1"}}, "inputs": {"ITEM": text("x")}},
              say({"block": {"type": "data_lengthoflist", "fields": {"LIST": {"id": "l1"}}}}),
              {"type": "event_broadcastandwait", "fields": {"MESSAGE": "m1"}},
              say(text("after")),
              {"type": "procedures_callnoreturn", "extraState": {"name": "turn", "params": ["n"]},
               "inputs": {"ARG0": {"block": {"type": "math_number", "fields": {"NUM": 2}}}}},
              {"type": "flippercontrol_stop", "fields": {"STOP_OPTION": "exit"}}),
        stack({"type": "event_whenbroadcastreceived", "fields": {"MESSAGE": "m1"}}, say(text("got")), x=500),
        stack({"type": "procedures_defnoreturn", "extraState": {"params": [{"name": "n", "id": "p1"}]}, "fields": {"NAME": "turn"},
               "inputs": {"STACK": {"block": {"type": "control_repeat", "inputs": {
                   "TIMES": {"block": {"type": "data_variable", "fields": {"VARIABLE": {"id": "p1"}}}},
                   "SUBSTACK": {"block": {"type": "flippermove_steer", "fields": {"UNIT": "degrees"},
                                          "inputs": {"STEERING": num(100), "VALUE": num(90)}}}}}}}}, y=500),
        variables=[{"name": "список", "id": "l1", "type": "list"}, {"name": "n", "id": "p1"}])),
    # старая программа (до Word Blocks)
    "old": dict(preset="spike-sandbox", seconds=6, moved=280, blocks={"blocks": {"languageVersion": 0, "blocks": [
        {"type": "spike_start", "x": 30, "y": 30, "next": {"block": {
            "type": "spike_write", "inputs": {"TEXT": {"shadow": {"type": "text", "fields": {"TEXT": "Hi"}}}},
            "next": {"block": {"type": "spike_move_for", "fields": {"DIR": "1", "UNIT": "cm"}, "inputs": {"N": num(30)}}}}}}]}}),
}

RUN = """
async ([blocks, c]) => {
  const sim = window.USTEMSpike.instances[0];
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 100 && !sim.loaded; i++) await sleep(100);
  sim.loadBlocksJson(blocks);
  sim.setMode('blocks');
  const code = sim.code();
  sim.run({ speed: 4 });
  const presses = (c.press || []).slice();
  const t0 = performance.now();
  while (sim.running && performance.now() - t0 < 60000) {
    const t = sim.state ? sim.state.t : 0;
    while (presses.length && t >= presses[0][0]) sim.press(presses.shift()[1]);
    if (t >= c.seconds) { sim.stop(); break; }
    await sleep(20);
  }
  await sleep(100);
  const st = sim.state;
  return { code, err: sim.error && sim.error.text, prints: sim.prints.slice(), ended: sim.ended, finished: sim.finished,
           moved: Math.hypot(st.pose.x - sim.start.x, st.pose.y - sim.start.y), t: st.t };
}
"""


async def main():
    base = (sys.argv[1:] or ["http://localhost:5099"])[0]
    failed = []
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await (await browser.new_context(viewport={"width": 1400, "height": 1000})).new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(base + "/login")
        await page.fill("input[name=email]", "admin@academy.demo")
        await page.fill("input[name=password]", "demo12345")
        await page.press("input[name=password]", "Enter")
        await page.wait_for_load_state("networkidle")
        for name, c in CASES.items():
            await page.evaluate("localStorage.clear()")
            await page.goto(f"{base}/lab/spike?preset={c['preset']}")
            await page.wait_for_function("window.USTEMSpike && window.USTEMSpike.instances.length > 0")
            r = await page.evaluate(RUN, [c["blocks"], {k: v for k, v in c.items() if k != "blocks"}])
            problems = []
            if r["err"] and "SystemExit" not in r["err"]:
                problems.append("ошибка: " + r["err"])
            for want in c.get("prints", []):
                if want not in r["prints"]:
                    problems.append(f"нет вывода {want!r}")
            if r["moved"] < c.get("moved", 0):
                problems.append(f"проехал {r['moved']:.0f} мм < {c['moved']}")
            print(f"{'FAIL' if problems else 'OK  '} {name}: t={r['t']:.1f} moved={r['moved']:.0f} prints={r['prints'][-6:]} {'; '.join(problems)}")
            if problems:
                print(r["code"])
                failed.append(name)
        if errors:
            print("Ошибки страницы:", errors)
            failed.append("pageerror")
        await browser.close()
    if failed:
        print("Не прошли:", ", ".join(failed))
        sys.exit(1)
    print("Все программы из блоков работают")


if __name__ == "__main__":
    asyncio.run(main())
