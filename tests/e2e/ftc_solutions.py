"""Сквозная проверка симулятора FTC в браузере: эталонное решение каждого задания проходит автопроверку.

Запуск (нужен работающий сервер с демо-данными и Playwright):
    SEED_DEMO=1 PORT=5099 python wsgi.py &
    python3 tests/e2e/ftc_solutions.py http://localhost:5099 [--negative] [имя_задания ...]

С --negative запускается стартовый код задания (и стартовый робот): хотя бы одна проверка должна не пройти.
"""
import asyncio
import sys
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "assets" / "lab"))
import ftc_presets as F  # noqa: E402

RUN = """
async ([sol, robot, code, negative]) => {
  const sim = window.USTEMFtc.instances[0];
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 50 && !sim.presetData; i++) await sleep(100);
  if (robot) sim.setRobot(robot);
  sim.editor.dispatch({ changes: { from: 0, to: sim.editor.state.doc.length, insert: code } });
  sim.speed = 8;
  sim.script = sol.script || null;
  if (!sim.init()) return { err: sim.core.error, res: sim.core.checkState.map(s => s.ok) };
  for (let i = 0; i < 100 && !sim.core.reachedWait && sim.core.phase === 'init'; i++) await sleep(50);
  sim.start();
  const c = sim.core;
  const t0 = performance.now();
  while (['init', 'run'].includes(c.phase) && c.t - c.tStart < (sol.seconds || 5) && performance.now() - t0 < 60000) await sleep(50);
  if (['init', 'run'].includes(c.phase)) sim.stop();
  for (let i = 0; i < 40 && ['init', 'run'].includes(c.phase); i++) await sleep(50);
  await sleep(150);
  return { err: c.error, res: c.checkState.map(s => s.ok), labels: (c.preset.checks || []).map(x => x.label),
           pose: [c.pose.x.toFixed(1), c.pose.y.toFixed(1), c.heading.toFixed(1)], hits: c.hits, done: !sim.doneEl.hidden };
}
"""


async def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    base = args[0] if args else "http://localhost:5099"
    negative = "--negative" in sys.argv
    names = args[1:] or [n for n, p in F.PRESETS.items() if p.get("checks") and not (negative and p.get("play"))]
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
        for name in names:
            preset, sol = F.PRESETS[name], F.SOLUTIONS[name]
            await page.evaluate("localStorage.clear()")
            await page.goto(f"{base}/lab/ftc?preset={name}")
            await page.wait_for_function("window.USTEMFtc && window.USTEMFtc.instances.length > 0")
            robot = preset.get("robot") if negative else sol.get("robot")
            code = preset["code"] if negative else sol["code"]
            r = await page.evaluate(RUN, [sol, robot, code, negative])
            ok = all(r["res"]) and not r.get("err")
            good = (not ok) if negative else ok
            mark = "OK  " if good else "FAIL"
            print(f"{mark} {name}: {r['res']} {r.get('err') or ''} pose={r.get('pose')} hits={r.get('hits')}")
            if not good:
                failed.append(name)
        if errors:
            print("Ошибки страницы:", errors)
            failed.append("pageerror")
        await browser.close()
    if failed:
        print("Не прошли:", ", ".join(failed))
        sys.exit(1)
    print("Все задания прошли" + (" (стартовый код не проходит)" if negative else ""))


if __name__ == "__main__":
    asyncio.run(main())
