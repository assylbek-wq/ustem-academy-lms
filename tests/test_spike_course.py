"""Курс «SPIKE Prime для FLL Challenge»: загружается, тексты по правилам, картинки на месте, код Python без ошибок."""
import ast
import re
from pathlib import Path

from tests.base import AppTestCase

from app.content import COURSES, load

ROOT = Path(__file__).resolve().parents[1]


class SpikeCourseTest(AppTestCase):
    def test_loads(self):
        p = load("spike-prime-fll")
        self.assertEqual(p.status, "published")
        self.assertTrue(p.self_paced)
        self.assertEqual(len(p.levels), 5)
        for lv in p.levels:
            quizzes = [l for l in lv.lessons if l.kind == "quiz"]
            self.assertEqual(len(quizzes), 1, lv.title)
            for qq in quizzes[0].questions:
                self.assertTrue(all(0 <= i < len(qq.options) for i in qq.correct))

    def test_texts_images_and_code(self):
        prog = COURSES["spike-prime-fll"].PROGRAM
        blocks = 0
        for lv in prog["levels"]:
            for m in lv["modules"]:
                for les in m["lessons"]:
                    body = (les.get("body") or {}).get("ru", "")
                    self.assertNotRegex(body, "[ёЁ—]", les["title"]["ru"])
                    for src in re.findall(r"\]\((/static/course/spike-prime-fll/[^)]+)\)", body):
                        self.assertTrue((ROOT / "app" / src.lstrip("/")).exists(), src)
                    for code in re.findall(r"```python\n(.*?)```", body, re.S):
                        ast.parse(code)
                        blocks += 1
        self.assertGreaterEqual(blocks, 10)
