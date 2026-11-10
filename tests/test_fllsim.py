"""Симулятор игры FLL BIOGLOW в Лаборатории."""
from pathlib import Path

from tests.base import AppTestCase

ROOT = Path(__file__).resolve().parents[1]


class FllSimTest(AppTestCase):
    def test_page_and_hub(self):
        self.assertEqual(self.client.get("/lab/fll-bioglow").status_code, 302)
        self.login("teacher1@academy.demo")
        r = self.client.get("/lab/fll-bioglow")
        self.assertIn("fllsim/index.html", r.get_data(as_text=True))
        self.assertEqual(r.headers["Cross-Origin-Opener-Policy"], "same-origin")
        self.assertEqual(r.headers["Cross-Origin-Embedder-Policy"], "credentialless")
        self.assertIn("/lab/fll-bioglow", self.client.get("/lab").get_data(as_text=True))

    def test_build_is_isolated(self):
        self.assertTrue((ROOT / "app/static/fllsim/pyodide/pyodide.asm.wasm").exists())
        r = self.client.get("/static/fllsim/index.html")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.headers["Cross-Origin-Embedder-Policy"], "require-corp")
        self.assertEqual(r.headers["Cross-Origin-Resource-Policy"], "same-origin")
        r.close()
        other = self.client.get("/static/css/labhub.css")
        self.assertNotIn("Cross-Origin-Embedder-Policy", other.headers)
        other.close()
