"""UrSim (симулятор вождения FTC команды URAN92) в Лаборатории."""
import json
from pathlib import Path

from tests.base import AppTestCase

ROOT = Path(__file__).resolve().parents[1]


class UrSimTest(AppTestCase):
    def test_page_and_hub(self):
        self.assertEqual(self.client.get("/lab/ursim").status_code, 302)
        self.login("teacher1@academy.demo")
        html = self.client.get("/lab/ursim").get_data(as_text=True)
        self.assertIn("ursim/index.html?lang=", html)
        self.assertIn("/lab/ursim", self.client.get("/lab").get_data(as_text=True))

    def test_build_and_translation(self):
        self.assertTrue((ROOT / "app/static/ursim/index.html").exists())
        self.assertTrue((ROOT / "app/static/ursim/LICENSE.txt").exists())
        kk = json.loads((ROOT / "vendor/ursim/src/ui/i18n.kk.json").read_text(encoding="utf-8"))
        self.assertGreater(len(kk), 150)
        self.assertTrue(all(v.strip() for v in kk.values()))
