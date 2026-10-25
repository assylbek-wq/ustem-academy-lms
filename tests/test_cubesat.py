"""Конструктор и симулятор CubeSat (WSO): задания совпадают с генератором, эталоны проходят, стартовые программы
не проходят (через node, если есть), сборка на месте, страница открывается, путь WSO CubeSat и значок работают."""
import ast
import json
import shutil
import subprocess
import sys
from pathlib import Path
from unittest import skipUnless

from tests.base import AppTestCase

from app.game import paths as gpaths
from app.game.tracks import BADGES, SEED_PATHS, WSO_CUBESAT, all_steps
from app.models import User, db

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "assets" / "lab"))
import cubesat_presets as C  # noqa: E402

PDIR = ROOT / "app" / "static" / "cubesat" / "presets"
NODE = shutil.which("node") and (ROOT / "assets" / "lab" / "node_modules" / "@micropython").exists()


class CubeSatTest(AppTestCase):
    def test_presets_on_disk_match_generator(self):
        for name, data in C.PRESETS.items():
            p = PDIR / f"{name}.json"
            self.assertTrue(p.exists(), f"нет {p.name}: запустите python3 assets/lab/cubesat_presets.py")
            self.assertEqual(json.loads(p.read_text(encoding="utf-8")), json.loads(json.dumps(data)), name)
            if data.get("checks"):
                self.assertIn(name, C.SOLUTIONS, f"нет эталона для {name}")
            self.assertNotRegex(json.dumps(data, ensure_ascii=False), "[ёЁ—]", name)
            ast.parse(data["python"])
        for sol in C.SOLUTIONS.values():
            if sol.get("python"):
                ast.parse(sol["python"])

    @skipUnless(NODE, "нужны node и assets/lab/node_modules")
    def test_solutions_fly(self):
        for args in ([], ["--negative"]):
            r = subprocess.run(["node", str(ROOT / "tests" / "e2e" / "cubesat_solutions.mjs"), *args], capture_output=True, text=True, timeout=300)
            self.assertEqual(r.returncode, 0, r.stdout + r.stderr)

    def test_bundle_built(self):
        st = ROOT / "app" / "static"
        self.assertGreater((st / "js" / "cubesatsim.js").stat().st_size, 100_000, "соберите: bash deploy/build-lab.sh")
        self.assertTrue((st / "js" / "cubesatworker.js").exists())
        self.assertTrue((st / "css" / "cubesat.css").exists())

    def test_sim_page(self):
        self.assertEqual(self.client.get("/lab/cubesat").status_code, 302)
        self.login("teacher1@academy.demo")
        r = self.client.get("/lab/cubesat?preset=cubesat-link")
        self.assertEqual(r.status_code, 200)
        self.assertIn(b"cubesat-sim-link", r.data)
        self.assertIn(b"cubesatsim.js", r.data)
        self.assertIn(b"cubesat-sim-sandbox", self.client.get("/lab/cubesat?preset=../x").data)

    def test_path_and_badge(self):
        self.assertIn(WSO_CUBESAT, SEED_PATHS)
        from app.blueprints.game import known_preset, sim_url
        sims = [s["preset"] for _, s in all_steps(WSO_CUBESAT) if s["kind"] == "sim"]
        self.assertEqual(sorted(sims), sorted(n for n in C.PRESETS if n != "cubesat-sandbox"))
        for _, s in all_steps(WSO_CUBESAT):
            self.assertTrue(s["title"]["ru"] and s["title"]["kk"] and s["title"]["en"], s["code"])
            self.assertNotRegex(json.dumps(s, ensure_ascii=False), "[ёЁ—]")
        for p in sims:
            self.assertTrue(known_preset(p), p)
        self.assertFalse(known_preset("cubesat-sandbox"))
        with self.app.test_request_context():
            self.assertIn("/lab/cubesat?preset=cubesat-link", sim_url("cubesat-link"))
        t = self.new_client("teacher1@academy.demo")
        user = User.query.filter_by(email="teacher1@academy.demo").first()
        page = t.get("/journey/wso-cubesat?stage=0").get_data(as_text=True)
        self.assertIn("/lab/cubesat?preset=cubesat-build", page)
        for p in sims:
            r = t.post("/api/sim/solved", json={"preset": p}).get_json()
            self.assertTrue(r["ok"], p)
        self.assertIn(BADGES["cubesat-master"]["title"]["ru"], r["badges"])
        # команда CubeSat в Connect: открывается путь CubeSat, а не общий WSO
        user.connect_person_id = "0b5f8e0a-1111-4222-8333-944455556666"
        user.connect_snapshot = {"person": {}, "teams": [{"program": "WSO_CUBESAT", "is_current": True, "status": "draft", "students": 3, "registrations": []}]}
        db.session.commit()
        keys = [p["key"] for p in gpaths.for_user(user) if p.get("auto") == "connect"]
        self.assertEqual(keys, ["wso-cubesat"])
        self.assertEqual(t.get("/journey/wso-cubesat").status_code, 200)
        # CanSat по-прежнему попадает в общий путь WSO
        user.connect_snapshot = {"person": {}, "teams": [{"program": "WSO_CANSAT", "is_current": True, "status": "draft", "students": 3, "registrations": []}]}
        db.session.commit()
        self.assertEqual([p["key"] for p in gpaths.for_user(user) if p.get("auto") == "connect"], ["wso"])
