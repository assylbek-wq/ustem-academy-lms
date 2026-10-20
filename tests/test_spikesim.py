"""Симулятор SPIKE Prime: задания на диске совпадают с генератором, уроки курса ссылаются на существующие задания,
сборка (js, worker, MicroPython wasm) на месте, страница симулятора открывается."""
import ast
import json
import re
import sys
from pathlib import Path

from tests.base import AppTestCase

from app.content import COURSES

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "assets" / "lab"))
import spike_presets as S  # noqa: E402

PDIR = ROOT / "app" / "static" / "spikesim" / "presets"


def _bodies():
    prog = COURSES["spike-prime-fll"].PROGRAM
    return " ".join(les.get("body", {}).get("ru", "") for lv in prog["levels"] for m in lv["modules"] for les in m["lessons"])


class SpikeSimTest(AppTestCase):
    def test_presets_on_disk_match_generator(self):
        for name, data in S.PRESETS.items():
            p = PDIR / f"{name}.json"
            self.assertTrue(p.exists(), f"нет {p.name}: запустите python3 assets/lab/spike_presets.py")
            self.assertEqual(json.loads(p.read_text(encoding="utf-8")), json.loads(json.dumps(data)), name)
            if data.get("checks"):
                self.assertIn(name, S.SOLUTIONS, f"нет эталонного решения для {name}")
            self.assertNotRegex(data.get("task", "") + data.get("title", ""), "[ёЁ—]", name)
            if data.get("python"):
                ast.parse(data["python"])

    def test_solutions_are_valid_python(self):
        for name, sol in S.SOLUTIONS.items():
            if sol.get("python"):
                ast.parse(sol["python"])

    def test_lessons_use_existing_presets(self):
        used = set(re.findall(r'class="spike-sim-([\w-]+)"', _bodies()))
        self.assertGreaterEqual(len(used), 8)
        for name in used:
            self.assertTrue((PDIR / f"spike-{name}.json").exists(), name)

    def test_bundle_built(self):
        st = ROOT / "app" / "static"
        self.assertGreater((st / "js" / "spikesim.js").stat().st_size, 100_000, "соберите: bash deploy/build-lab.sh")
        self.assertTrue((st / "js" / "spikeworker.js").exists())
        self.assertTrue((st / "spikesim" / "micropython.mjs").exists())
        self.assertGreater((st / "spikesim" / "micropython.wasm").stat().st_size, 100_000)
        self.assertTrue((st / "css" / "spikesim.css").exists())

    def test_sim_page(self):
        self.assertEqual(self.client.get("/lab/spike").status_code, 302)  # только после входа
        self.login("admin@academy.demo")
        r = self.client.get("/lab/spike?preset=spike-gyro")
        self.assertEqual(r.status_code, 200)
        self.assertIn(b"spike-sim-gyro", r.data)
        self.assertIn(b"spikesim.js", r.data)
        r = self.client.get("/lab/spike?preset=../../etc")
        self.assertIn(b"spike-sim-sandbox", r.data)
        r = self.client.get("/static/spikesim/micropython.wasm")
        self.assertEqual(r.headers["Content-Type"], "application/wasm")
        r.close()
