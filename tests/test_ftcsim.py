"""Симулятор FTC: задания на диске совпадают с генератором, уроки ссылаются на существующие задания и картинки,
страница симулятора открывается."""
import json
import re
import sys
from pathlib import Path

from tests.base import AppTestCase

from app.content import COURSES

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "assets" / "lab"))
import ftc_presets as F  # noqa: E402

PDIR = ROOT / "app" / "static" / "ftcsim" / "presets"


def _bodies():
    prog = COURSES["ftc-start-2026"].PROGRAM
    return " ".join(les.get("body", {}).get("ru", "") for lv in prog["levels"] for m in lv["modules"] for les in m["lessons"])


class FtcSimTest(AppTestCase):
    def test_presets_on_disk_match_generator(self):
        for name, data in F.PRESETS.items():
            p = PDIR / f"{name}.json"
            self.assertTrue(p.exists(), f"нет {p.name}: запустите python3 assets/lab/ftc_presets.py")
            self.assertEqual(json.loads(p.read_text(encoding="utf-8")), json.loads(json.dumps(data)), name)
            if data.get("checks"):
                self.assertIn(name, F.SOLUTIONS, f"нет эталонного решения для {name}")
            self.assertNotRegex(data.get("task", "") + data.get("title", ""), "[ёЁ—]", name)

    def test_lessons_use_existing_presets_and_images(self):
        body = _bodies()
        used = set(re.findall(r'class="ftc-sim-([\w-]+)"', body))
        self.assertGreaterEqual(len(used), 9)
        for name in used:
            self.assertTrue((PDIR / f"ftc-{name}.json").exists(), name)
        for src in re.findall(r"\]\((/static/course/ftc-start-2026/[^)]+)\)", body):
            self.assertTrue((ROOT / "app" / src.lstrip("/")).exists(), src)

    def test_bundle_built(self):
        js = ROOT / "app" / "static" / "js" / "ftcsim.js"
        self.assertTrue(js.exists() and js.stat().st_size > 100_000, "соберите: bash deploy/build-lab.sh")
        self.assertTrue((ROOT / "app" / "static" / "css" / "ftcsim.css").exists())

    def test_sim_page(self):
        self.assertEqual(self.client.get("/lab/ftc").status_code, 302)  # только после входа
        self.login("admin@academy.demo")
        r = self.client.get("/lab/ftc?preset=ftc-auto")
        self.assertEqual(r.status_code, 200)
        self.assertIn(b"ftc-sim-auto", r.data)
        self.assertIn(b"ftcsim.js", r.data)
        r = self.client.get("/lab/ftc?preset=../../etc")
        self.assertIn(b"ftc-sim-sandbox", r.data)
