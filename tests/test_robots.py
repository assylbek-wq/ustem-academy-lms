"""Лаборатория роботов Unitree (MuJoCo): задания совпадают с генератором, эталоны проходят, стартовые программы
не проходят (через node, если есть), сборка и модели на месте, страницы открываются, курс загружается со встроенными
заданиями, решенные задания засчитываются и дают значок."""
import ast
import json
import shutil
import subprocess
import sys
from pathlib import Path
from unittest import skipUnless

from tests.base import AppTestCase

from app.game.tracks import BADGES
from app.models import Program

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "assets" / "lab"))
import robot_presets as RP  # noqa: E402

STATIC = ROOT / "app" / "static"
NODE = shutil.which("node") and (ROOT / "assets" / "lab" / "node_modules" / "@mujoco").exists()


class RobotLabTest(AppTestCase):
    def test_presets_on_disk_match_generator(self):
        files = sorted(p.stem for p in (STATIC / "robots" / "presets").glob("robot-*.json"))
        self.assertEqual(files, sorted(RP.PRESETS), "запустите python3 assets/lab/robot_presets.py")
        for name, data in RP.PRESETS.items():
            disk = json.loads((STATIC / "robots" / "presets" / f"{name}.json").read_text(encoding="utf-8"))
            self.assertEqual(disk, json.loads(json.dumps(data)), name)
            self.assertIn(data["robot"], ("go2", "g1"))
            self.assertNotRegex(json.dumps(data, ensure_ascii=False), "[ёЁ—]", name)
            ast.parse(data["python"])
            if data.get("checks"):
                self.assertIn(name, RP.SOLUTIONS, f"нет эталона для {name}")
                ast.parse(RP.SOLUTIONS[name])
            else:
                self.assertTrue(name.endswith("-sandbox"), name)

    @skipUnless(NODE, "нужны node и assets/lab/node_modules")
    def test_solutions_pass_and_starters_fail(self):
        for args in ([], ["--negative"]):
            r = subprocess.run(["node", str(ROOT / "tests" / "e2e" / "robot_solutions.mjs"), *args], capture_output=True, text=True, timeout=600)
            self.assertEqual(r.returncode, 0, r.stdout + r.stderr)

    def test_bundle_and_models(self):
        self.assertGreater((STATIC / "js" / "robotsim.js").stat().st_size, 100_000, "соберите: bash deploy/build-lab.sh")
        self.assertTrue((STATIC / "js" / "robotworker.js").exists())
        self.assertGreater((STATIC / "robots" / "mujoco.wasm").stat().st_size, 1_000_000)
        self.assertTrue((STATIC / "robots" / "mujoco.js").exists())
        for robot in ("go2", "g1"):
            pack = (STATIC / "robots" / robot / f"{robot}.pack").read_bytes()
            n = int.from_bytes(pack[:4], "little")
            head = json.loads(pack[4:4 + n])
            names = {f["name"] for f in head["files"]}
            self.assertIn(head["model"], names)
            self.assertIn("scene.xml", names)
            self.assertTrue((STATIC / "robots" / robot / "LICENSE").exists(), "лицензия BSD-3 Unitree обязательна")

    def test_pages(self):
        self.assertEqual(self.client.get("/lab/robots").status_code, 302)
        self.login("teacher1@academy.demo")
        r = self.client.get("/lab/robots")
        self.assertEqual(r.status_code, 200)
        self.assertIn(b"robot-sim-go2-sandbox", r.data)
        self.assertIn(b"robotsim.js", r.data)
        self.assertIn(b"robot-sim-g1-sandbox", self.client.get("/lab/robots?robot=g1").data)
        self.assertIn(b"robot-sim-g1-wave", self.client.get("/lab/robots?preset=robot-g1-wave").data)
        self.assertIn(b"robot-sim-go2-sandbox", self.client.get("/lab/robots?preset=../x").data)
        hub = self.client.get("/lab").data.decode()
        self.assertIn("/lab/robots", hub)

    def test_course_embeds_tasks(self):
        from app.content import load
        load("unitree-mujoco")
        p = Program.query.filter_by(slug="unitree-mujoco").one()
        self.assertEqual(len(p.levels), 5)
        bodies = " ".join((l.body or {}).get("ru", "") for lv in p.levels for l in lv.lessons)
        self.assertNotRegex(bodies, "[ёЁ—]")
        tasks = [n for n in RP.PRESETS if not n.endswith("-sandbox")]
        for name in tasks:
            self.assertIn(f'class="robot-sim-{name.removeprefix("robot-")}"', bodies, name)
        for lv in p.levels:
            self.assertEqual(len(lv.assignments), 1)
            quiz = [l for l in lv.lessons if l.kind == "quiz"]
            self.assertEqual(len(quiz), 1)
            for qq in quiz[0].questions:
                self.assertTrue(all(0 <= i < len(qq.options) for i in qq.correct))
        for img in ("robot-lab", "go2-corridor", "g1-plot", "g1-arms"):
            self.assertTrue((STATIC / "course" / "unitree-mujoco" / f"{img}.jpg").exists(), img)

    def test_solved_and_badge(self):
        from app.blueprints.game import known_preset, sim_url
        t = self.new_client("teacher1@academy.demo")
        tasks = [n for n in RP.PRESETS if not n.endswith("-sandbox")]
        self.assertFalse(known_preset("robot-nope"))
        with self.app.test_request_context():
            self.assertIn("/lab/robots?preset=robot-go2-walk", sim_url("robot-go2-walk"))
        r = None
        for name in tasks:
            self.assertTrue(known_preset(name), name)
            r = t.post("/api/sim/solved", json={"preset": name}).get_json()
            self.assertTrue(r["ok"], name)
        self.assertIn(BADGES["unitree-master"]["title"]["ru"], r["badges"])
