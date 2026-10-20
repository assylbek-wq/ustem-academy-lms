"""Сквозная проверка лаборатории в браузере: каждое задание с эталонным решением проходит автопроверку.

Запуск (нужен работающий сервер с демо-данными и Playwright):
    SEED_DEMO=1 PORT=5099 python wsgi.py &
    python3 tests/e2e/lab_solutions.py http://localhost:5099 [--negative] [имя_задания ...]
"""
import asyncio
import json
import sys
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "assets" / "lab"))
import presets as P  # noqa: E402

APPLY = """
async ([sol, holeOf]) => {
  const lab = window.USTEMLab.instances[0];
  const bb = lab.parts.find(p => p.type === 'breadboard');
  const key = (k) => k.includes('.') ? k : `${bb.id}.${k}`;
  for (const [id, hole] of Object.entries(sol.move || {})) {
    const p = lab.parts.find(q => q.id === id);
    const pin = holeOf[id];
    // ставим вывод pin детали в отверстие hole
    const hx = bb.x + hole[0], hy = bb.y + hole[1];
    p.x = hx - pin[0]; p.y = hy - pin[1]; p.rot = hole[2] || 0;
  }
  for (const [id, props] of Object.entries(sol.props || {})) Object.assign(lab.parts.find(q => q.id === id).props, props);
  for (const [a, b] of (sol.wires || [])) lab.wires.push({ id: 'tw' + Math.random(), a: key(a), b: key(b), pts: [], color: '#16a34a' });
  if (sol.code) lab.editor.dispatch({ changes: { from: 0, to: lab.editor.state.doc.length, insert: sol.code } });
  lab.renderAll(); lab.changed();
  await lab.start();
  return lab.running;
}
"""

DRIVE = """
async ([sol, seconds]) => {
  const lab = window.USTEMLab.instances[0];
  const t0 = performance.now();
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  let k = 0;
  while (performance.now() - t0 < seconds * 1000) {
    if (sol.press) { const b = lab.parts.find(q => q.id === sol.press); b.pressed = (Math.floor(k / 8) % 2) === 0; }
    if (sol.pot_sweep) { const p = lab.parts.find(q => q.id === sol.pot_sweep); p.props.pos = (k % 20) / 20; lab.netsDirty = true; }
    for (const [id, seq] of Object.entries(sol.sweep || {})) { const p = lab.parts.find(q => q.id === id); const [prop, vals] = seq; p.props[prop] = vals[Math.floor(k / 10) % vals.length]; lab.netsDirty = true; }
    k++; await sleep(100);
  }
  const res = lab.checks.map((c, i) => ({ label: c.label, ok: !!(lab.checkState[i] && lab.checkState[i].ok) }));
  return { res, serial: lab.serialOut.textContent.slice(-200), status: lab.status.textContent, err: lab.compileOut.textContent.slice(0, 500) };
}
"""


def hole_xy(name):
    row = name.rstrip("0123456789")
    return int(name[len(row):]) * P.P, P.ROWS[row] * P.P


async def main(base, names):
    failed = 0
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        ctx = await b.new_context(viewport={"width": 1400, "height": 900})
        pg = await ctx.new_page()
        errors = []
        pg.on("pageerror", lambda e: errors.append(str(e)))
        await pg.goto(base + "/login")
        await pg.fill("input[name=email]", "admin@academy.demo")
        await pg.fill("input[name=password]", "demo12345")
        await pg.press("input[name=password]", "Enter")
        await pg.wait_for_load_state("networkidle")
        for name in names:
            sol = P.SOLUTIONS.get(name)
            if not sol:
                print(f"-- {name}: нет эталонного решения")
                continue
            await pg.evaluate("localStorage.clear()")
            await pg.goto(f"{base}/lab?preset={name}")
            await pg.wait_for_function("window.USTEMLab && window.USTEMLab.instances.length && window.USTEMLab.instances[0].presetData !== undefined")
            await pg.wait_for_timeout(500)
            preset = P.PRESETS[name]
            holes, pins = {}, {}
            for pid, h in (sol.get("move") or {}).items():
                part = next(p for p in preset["parts"] if p["id"] == pid)
                hx, hy = hole_xy(h if isinstance(h, str) else h[0])
                rot = 0 if isinstance(h, str) else h[1]
                pin = (sol.get("move_pin") or {}).get(pid, list(P.PINS[part["type"]])[0])
                px, py = P.PINS[part["type"]][pin]
                if rot == 90:
                    px, py = -py, px
                holes[pid] = [hx, hy, rot]
                pins[pid] = [px, py]
            js_sol = {**sol, "move": holes}
            if NEGATIVE:
                if "code" not in sol:
                    continue
                js_sol.pop("code")  # стартовый код из задания не должен проходить проверку
            ok = await pg.evaluate(APPLY, [js_sol, pins])
            out = await pg.evaluate(DRIVE, [js_sol, sol.get("seconds", 6)])
            passed = ok and out["res"] and all(r["ok"] for r in out["res"])
            if NEGATIVE:
                passed = not passed
            failed += not passed
            print(("OK  " if passed else "FAIL"), name, json.dumps(out["res"], ensure_ascii=False))
            if not passed:
                print("     status:", out["status"], "| compile:", out["err"][:300], "| serial:", out["serial"][-120:])
        if errors:
            print("JS errors:", errors[:5])
            failed += 1
        await b.close()
    return failed


NEGATIVE = False

if __name__ == "__main__":
    args = sys.argv[1:]
    if "--negative" in args:  # стартовый код заданий: автопроверка не должна засчитываться
        NEGATIVE = True
        args.remove("--negative")
    base = args[0] if args else "http://localhost:5099"
    names = args[1:] or list(P.PRESETS)
    sys.exit(1 if asyncio.run(main(base, names)) else 0)
