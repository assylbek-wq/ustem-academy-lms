"""Лаборатория: курсы FTC и Arduino, задания лаборатории, компиляция скетчей."""
import json
import re
import shutil
import sys
import unittest
from pathlib import Path

from tests.base import AppTestCase

from app.content import COURSES, load
from app.models import Program
from app.services import arduino

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "assets" / "lab"))
import presets as lab_presets  # noqa: E402


class NewCoursesTest(AppTestCase):
    def test_ftc_and_arduino_courses_load(self):
        for slug in ("ftc-start-2026", "arduino-basics"):
            p = load(slug)
            self.assertEqual(p.status, "published")
            self.assertTrue(p.self_paced)
            for lv in p.levels:
                quizzes = [l for l in lv.lessons if l.kind == "quiz"]
                self.assertEqual(len(quizzes), 1, lv.title)
                for qq in quizzes[0].questions:
                    self.assertTrue(all(0 <= i < len(qq.options) for i in qq.correct))
                for l in lv.lessons:
                    self.assertNotRegex((l.body or {}).get("ru", ""), "[ёЁ—]", l.title["ru"])

    def test_lab_presets_exist_and_are_generated(self):
        body = " ".join(les.get("body", {}).get("ru", "") for lv in COURSES["arduino-basics"].PROGRAM["levels"]
                        for m in lv["modules"] for les in m["lessons"])
        used = set(re.findall(r"lab-preset-([\w-]+)", body))
        self.assertTrue(used)
        pdir = ROOT / "app" / "static" / "lab" / "presets"
        for name in used:
            on_disk = json.loads((pdir / f"{name}.json").read_text())
            self.assertEqual(on_disk, json.loads(json.dumps(lab_presets.PRESETS[name], ensure_ascii=False)),
                             f"{name}.json устарел: запустите python3 assets/lab/presets.py")
        for name, pr in lab_presets.PRESETS.items():
            self.assertNotRegex(pr["task"] + pr["title"], "[ёЁ—]")

    def test_lesson_page_embeds_lab(self):
        load("arduino-basics")
        p = Program.query.filter_by(slug="arduino-basics").one()
        self.login("admin@academy.demo")
        from app.models import Cohort, Enrollment, User, db
        cohort = Cohort.query.filter_by(program_id=p.id).order_by(Cohort.id).first()
        user = User.query.filter_by(email="admin@academy.demo").one()
        db.session.add(Enrollment(cohort_id=cohort.id, user_id=user.id))
        db.session.commit()
        lesson = [l for l in p.levels[0].lessons if "lab-preset-" in l.body.get("ru", "")][0]
        html = self.client.get(f"/my/cohort/{cohort.id}/lesson/{lesson.id}").get_data(as_text=True)
        self.assertIn('class="lab-preset-battery-led"', html)
        self.assertIn("js/lab.js", html)
        hub = self.client.get("/lab").get_data(as_text=True)  # все симуляторы на одной странице
        for path in ("/lab/arduino", "/lab/spike", "/lab/ftc", "/lab/cubesat", "/lab/cansat"):
            self.assertIn(f'href="{path}"', hub)
        self.assertIn("lab-preset-blink", self.client.get("/lab/arduino?preset=blink").get_data(as_text=True))
        r = self.client.get("/lab?preset=blink")  # старые ссылки
        self.assertEqual(r.status_code, 302)
        self.assertIn("/lab/arduino?preset=blink", r.headers["Location"])


@unittest.skipUnless(arduino.available(), "avr-gcc не установлен")
class CompileTest(AppTestCase):
    def test_compile_endpoint(self):
        self.login("admin@academy.demo")
        r = self.client.post("/lab/compile", json={"code": "void setup(){pinMode(13,OUTPUT);} void loop(){digitalWrite(13,1);}"})
        data = r.get_json()
        self.assertTrue(data["ok"], data)
        self.assertTrue(data["hex"].startswith(":"))
        r = self.client.post("/lab/compile", json={"code": "void setup(){ int x = ; } void loop(){}"})
        self.assertFalse(r.get_json()["ok"])
        self.assertIn("sketch:1", r.get_json()["error"])

    def test_compile_boards_and_libraries(self):
        self.login("admin@academy.demo")
        code = "#include <Servo.h>\n#include <LiquidCrystal_I2C.h>\n#include <Adafruit_NeoPixel.h>\nServo s; LiquidCrystal_I2C l(0x27,16,2);\nvoid setup(){s.attach(9); l.init();} void loop(){}"
        sizes = {}
        for board in ("uno", "nano", "mega"):
            data = self.client.post("/lab/compile", json={"code": code, "board": board}).get_json()
            self.assertTrue(data["ok"], (board, data))
            sizes[board] = data["flash"]
        self.assertGreater(sizes["mega"], sizes["uno"])
        r = self.client.post("/lab/compile", json={"code": code, "board": "pico"})
        self.assertFalse(r.get_json()["ok"])  # Pico программируется на MicroPython, не компилируется

    def test_compile_requires_login(self):
        r = self.client.post("/lab/compile", json={"code": "void setup(){} void loop(){}"})
        self.assertIn(r.status_code, (302, 401, 403))

    def test_blocks_file_access(self):
        for code in ['#include "/etc/passwd"\nvoid setup(){} void loop(){}', '#include </etc/passwd>',
                     'asm(".incbin \\"/etc/passwd\\"");', '#define F "/etc/passwd"\n#include F\n',
                     '#pragma GCC poison x\n', 'void setup(){}\n#line 1 "/etc/passwd"\n']:
            with self.assertRaises(arduino.CompileError, msg=code):
                arduino.compile_sketch(code)

    def test_all_preset_solutions_compile(self):
        for name, sol in lab_presets.SOLUTIONS.items():
            if sol.get("code"):
                self.assertGreater(arduino.compile_sketch(sol["code"])["size"], 100, name)


class KazakhLabDictTest(unittest.TestCase):
    def test_dictionary_is_valid(self):
        import json, re
        from pathlib import Path
        d = json.loads((Path(__file__).resolve().parents[1] / "app/static/lab/i18n/kk.json").read_text(encoding="utf-8"))
        self.assertGreater(len(d), 1500)
        for ru, kk in d.items():
            self.assertTrue(kk.strip(), ru)
            self.assertEqual(len(re.findall(r"\{\d*\}", ru)), len(re.findall(r"\{\d*\}", kk)), ru)
            self.assertEqual(sorted(re.findall(r"%\d", ru)), sorted(re.findall(r"%\d", kk)), ru)
            self.assertNotIn("\u2014", kk, ru)
