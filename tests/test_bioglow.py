"""Поле BIOGLOW в симуляторе SPIKE и курс «FLL Challenge BIOGLOW»: курс грузится, есть казахский текст,
задания поля на месте, рисунок мата есть."""
import json
import re
from pathlib import Path

from tests.base import AppTestCase

from app.content import COURSES, load

ROOT = Path(__file__).resolve().parents[1]


class BioglowCourseTest(AppTestCase):
    def test_loads(self):
        p = load("fll-bioglow-season")
        self.assertEqual(p.status, "published")
        self.assertTrue(p.self_paced)
        self.assertEqual(len(p.levels), 4)
        for lv in p.levels:
            quizzes = [les for les in lv.lessons if les.kind == "quiz"]
            self.assertEqual(len(quizzes), 1)
            for qq in quizzes[0].questions:
                self.assertTrue(all(0 <= i < len(qq.options) for i in qq.correct))

    def test_texts_ru_and_kk(self):
        prog = COURSES["fll-bioglow-season"].PROGRAM
        sims = set()
        for lv in prog["levels"]:
            for m in lv["modules"]:
                for les in m["lessons"]:
                    for part in ([les.get("body")] if les.get("body") else []) + [x["q"] for x in les.get("questions", [])]:
                        self.assertIn("kk", part, les["title"]["ru"])
                        for lang in ("ru", "kk"):
                            self.assertNotRegex(part[lang], "[ёЁ—]", les["title"]["ru"])
                            self.assertNotIn("{sim}", part[lang])
                    body = (les.get("body") or {}).get("ru", "")
                    sims.update(re.findall(r'class="spike-sim-([\w-]+)"', body))
                    if les.get("body"):
                        self.assertEqual(re.findall(r'spike-sim-[\w-]+', body), re.findall(r'spike-sim-[\w-]+', les["body"]["kk"]))
            for a in lv["assignments"]:
                self.assertIn("kk", a["description"])
        for name in sims:
            self.assertTrue((ROOT / "app/static/spikesim/presets" / f"spike-{name}.json").exists(), name)
        self.assertGreaterEqual(len(sims), 5)

    def test_field_assets(self):
        self.assertTrue((ROOT / "app/static/spikesim/bioglow/mat.jpg").exists())
        pd = json.loads((ROOT / "app/static/spikesim/presets/spike-bio-match.json").read_text(encoding="utf-8"))
        self.assertEqual(pd["field"], "bioglow")
        self.assertTrue(any(c["type"] == "score_total" for c in pd["checks"]))
        js = (ROOT / "app/static/js/spikesim.js").read_text(encoding="utf-8")
        self.assertIn("bioglow/mat.jpg", js)
