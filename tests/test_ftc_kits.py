"""Уроки под ключ курса «FTC с нуля»: структура, тексты без «ё» и длинного тире, показ в уроке."""
import json

from tests.base import AppTestCase

from app.content import COURSES
from app.content.ftc_kits import KITS
from app.models import Lesson, Program, db

FIELDS = {"goal", "minutes", "group", "prep", "plan", "say", "task", "check", "mistakes", "homework", "slides"}


def lessons():
    prog = COURSES["ftc-start-2026"].PROGRAM
    return [les for lv in prog["levels"] for m in lv["modules"] for les in m["lessons"]]


class FtcKitsTest(AppTestCase):
    def test_every_lesson_has_a_valid_kit(self):
        titles = {les["title"]["ru"] for les in lessons()}
        self.assertTrue(set(KITS) <= titles, set(KITS) - titles)
        for les in lessons():
            if les["kind"] == "quiz":
                continue
            self.assertIn("kit", les, les["title"]["ru"])
            k = les["kit"]["ru"]
            self.assertEqual(FIELDS - set(k), set(), les["title"]["ru"])
            self.assertEqual(sum(p[0] for p in k["plan"]), k["minutes"], les["title"]["ru"])
            self.assertTrue(3 <= len(k["slides"]) <= 10)
            if k["task"].get("sim"):
                self.assertTrue(k["task"]["sim"].startswith("ftc-"))
            self.assertNotRegex(json.dumps(k, ensure_ascii=False), "[ёЁ—–]", les["title"]["ru"])

    def test_kit_is_shown_in_lesson_page(self):
        from app.content import load
        p = Program.query.filter_by(slug="ftc-start-2026").first() or load("ftc-start-2026")
        db.session.commit()
        lesson = Lesson.query.filter(Lesson.kit.isnot(None)).join(Lesson.module).filter_by(level_id=p.levels[0].id).first()
        self.assertTrue(lesson)
        self.login("methodist@academy.demo")
        page = self.client.get(f"/studio/lessons/{lesson.id}/preview").get_data(as_text=True)
        self.assertIn('id="kit-slides"', page)
        self.assertIn("kit.css", page)
