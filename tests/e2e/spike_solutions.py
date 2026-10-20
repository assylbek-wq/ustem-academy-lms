"""Сквозная проверка симулятора SPIKE Prime в браузере: эталон каждого задания проходит автопроверку.

Запуск (нужен работающий сервер с демо-данными и Playwright):
    SEED_DEMO=1 PORT=5099 python wsgi.py &
    python3 tests/e2e/spike_solutions.py http://localhost:5099 [--negative] [имя_задания ...]

С --negative запускается стартовая программа задания: хотя бы одна проверка должна не пройти.
Задания в блоках проверяются через рабочую область Blockly (эталон загружается как JSON блоков).
"""
import asyncio
import sys
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "assets" / "lab"))
import spike_presets as S  # noqa: E402

RUN = """
async ([sol, preset]) => {
  const sim = window.USTEMSpike.instances[0];
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 100 && !sim.loaded; i++) await sleep(100);
  const mode = sol.mode || (sol.blocks ? 'blocks' : 'python');
  if (mode === 'blocks') sim.loadBlocksJson(sol.blocks || preset.blocks);
  else sim.py.dispatch({ changes: { from: 0, to: sim.py.state.doc.length, insert: sol.python ?? preset.python } });
  sim.setMode(mode);
  sim.run({ speed: 4 });
  const presses = (sol.press || []).slice();
  const limit = sol.stop_after || sol.seconds || 8;
  const t0 = performance.now();
  while (sim.running && performance.now() - t0 < 90000) {
    const t = sim.state ? sim.state.t : 0;
    while (presses.length && t >= presses[0][0]) sim.press(presses.shift()[1]);
    if (t >= limit) { sim.stop(); break; }
    await sleep(20);
  }
  await sleep(100);
  const st = sim.state;
  return { err: sim.error && sim.error.text, res: (preset.checks || []).map((c, i) => !!(sim.checkState[i] && sim.checkState[i].ok)),
           labels: (preset.checks || []).map(c => c.label), t: st.t.toFixed(1),
           pose: [st.pose.x.toFixed(0), st.pose.y.toFixed(0), (st.pose.h * 180 / Math.PI).toFixed(1)], prints: sim.prints.slice(-3) };
}
"""


async def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    base = args[0] if args else "http://localhost:5099"
    negative = "--negative" in sys.argv
    names = args[1:] or [n for n, p in S.PRESETS.items() if p.get("checks")]
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
            preset, sol = S.PRESETS[name], S.SOLUTIONS[name]
            if negative:
                sol = {"seconds": sol.get("seconds", 8), "mode": preset.get("mode", "blocks")}
            await page.evaluate("localStorage.clear()")
            await page.goto(f"{base}/lab/spike?preset={name}")
            await page.wait_for_function("window.USTEMSpike && window.USTEMSpike.instances.length > 0")
            r = await page.evaluate(RUN, [sol, preset])
            ok = all(r["res"]) and not r.get("err")
            good = (not ok) if negative else ok
            print(f"{'OK  ' if good else 'FAIL'} {name}: {r['res']} {r.get('err') or ''} t={r['t']} pose={r['pose']} {r['prints']}")
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
