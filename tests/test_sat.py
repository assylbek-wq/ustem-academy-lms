"""Лаборатория спутников WSO (CubeSat и CanSat): задания совпадают с генераторами, эталоны проходят, стартовые
программы не проходят (через node, если есть), сборка на месте, страницы открываются, пути и значки работают."""
import ast
import json
import shutil
import subprocess
import sys
from pathlib import Path
from unittest import skipUnless

from tests.base import AppTestCase

from app.game import paths as gpaths
from app.game.tracks import BADGES, SEED_PATHS, WSO_CANSAT, WSO_CUBESAT, all_steps
from app.models import User, db

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "assets" / "lab"))
import cansat_presets as CA  # noqa: E402
import cubesat_presets as CU  # noqa: E402

STATIC = ROOT / "app" / "static"
NODE = shutil.which("node") and (ROOT / "assets" / "lab" / "node_modules" / "@micropython").exists()
KINDS = {"cubesat": (CU, WSO_CUBESAT), "cansat": (CA, WSO_CANSAT)}


class SatLabTest(AppTestCase):
    def test_presets_on_disk_match_generator(self):
        for kind, (mod, _) in KINDS.items():
            for name, data in mod.PRESETS.items():
                p = STATIC / kind / "presets" / f"{name}.json"
                self.assertTrue(p.exists(), f"нет {p.name}: запустите python3 assets/lab/{kind}_presets.py")
                self.assertEqual(json.loads(p.read_text(encoding="utf-8")), json.loads(json.dumps(data)), name)
                if data.get("checks"):
                    self.assertIn(name, mod.SOLUTIONS, f"нет эталона для {name}")
                self.assertNotRegex(json.dumps(data, ensure_ascii=False), "[ёЁ—]", name)
                ast.parse(data["python"])
            for sol in mod.SOLUTIONS.values():
                if sol.get("python"):
                    ast.parse(sol["python"])

    @skipUnless(NODE, "нужны node и assets/lab/node_modules")
    def test_solutions_fly(self):
        for args in ([], ["--negative"]):
            r = subprocess.run(["node", str(ROOT / "tests" / "e2e" / "sat_solutions.mjs"), *args], capture_output=True, text=True, timeout=300)
            self.assertEqual(r.returncode, 0, r.stdout + r.stderr)

    def test_bundle_built(self):
        self.assertGreater((STATIC / "js" / "satsim.js").stat().st_size, 100_000, "соберите: bash deploy/build-lab.sh")
        self.assertTrue((STATIC / "js" / "satworker.js").exists())
        self.assertTrue((STATIC / "css" / "sat.css").exists())

    def test_sim_pages(self):
        self.assertEqual(self.client.get("/lab/cansat").status_code, 302)
        self.login("teacher1@academy.demo")
        for kind, preset in (("cubesat", "link"), ("cansat", "rocket")):
            r = self.client.get(f"/lab/{kind}?preset={kind}-{preset}")
            self.assertEqual(r.status_code, 200)
            self.assertIn(f"{kind}-sim-{preset}".encode(), r.data)
            self.assertIn(b"satsim.js", r.data)
            self.assertIn(f"{kind}-sim-sandbox".encode(), self.client.get(f"/lab/{kind}?preset=../x").data)

    def test_paths_and_badges(self):
        from app.blueprints.game import known_preset, sim_url
        t = self.new_client("teacher1@academy.demo")
        user = User.query.filter_by(email="teacher1@academy.demo").first()
        for kind, (mod, path) in KINDS.items():
            self.assertIn(path, SEED_PATHS)
            sims = [s["preset"] for _, s in all_steps(path) if s["kind"] == "sim"]
            self.assertEqual(sorted(sims), sorted(n for n in mod.PRESETS if not n.endswith("sandbox")))
            codes = [s["code"] for _, s in all_steps(path)]
            self.assertEqual(len(codes), len(set(codes)), kind)
            for _, s in all_steps(path):
                self.assertTrue(s["title"]["ru"] and s["title"]["kk"] and s["title"]["en"], s["code"])
                self.assertNotRegex(json.dumps(s, ensure_ascii=False), "[ёЁ—]")
            for p in sims:
                self.assertTrue(known_preset(p), p)
            self.assertFalse(known_preset(f"{kind}-sandbox"))
            with self.app.test_request_context():
                self.assertIn(f"/lab/{kind}?preset={sims[0]}", sim_url(sims[0]))
            for p in sims:
                r = t.post("/api/sim/solved", json={"preset": p}).get_json()
                self.assertTrue(r["ok"], p)
            self.assertIn(BADGES[f"{kind}-master"]["title"]["ru"], r["badges"])
        # команда в Connect: открывается путь своей категории, а не общий WSO
        user.connect_person_id = "0b5f8e0a-1111-4222-8333-944455556666"
        for program, key in (("WSO_CUBESAT", "wso-cubesat"), ("WSO_CANSAT", "wso-cansat"), ("WSO_ROVERS", "wso")):
            user.connect_snapshot = {"person": {}, "teams": [{"program": program, "is_current": True, "status": "draft", "students": 3, "registrations": []}]}
            db.session.commit()
            self.assertEqual([p["key"] for p in gpaths.for_user(user) if p.get("auto") == "connect"], [key], program)
        self.assertEqual(t.get("/journey/wso-cansat").status_code, 200)
