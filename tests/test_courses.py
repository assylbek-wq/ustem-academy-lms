"""Готовые курсы из app/content: загрузка, прохождение онлайн-уровня, сертификат и уведомления."""
import io
import re

from tests.base import AppTestCase

from app.content import load
from app.models import Certificate, Cohort, Enrollment, Notification, Program, User, db
from app.services import certificates


class CanopyCourseTest(AppTestCase):
    def setUp(self):
        super().setUp()
        self.program = load("canopy-2026")

    def test_course_structure(self):
        p = Program.query.filter_by(slug="first-canopy-2026-rules").one()
        self.assertEqual(p.status, "published")
        self.assertEqual(len(p.levels), 5)
        for lv in p.levels:
            self.assertFalse(lv.require_attendance)
            self.assertEqual(len(lv.assignments), 1)
            quizzes = [l for l in lv.lessons if l.kind == "quiz"]
            self.assertEqual(len(quizzes), 1)
            for qq in quizzes[0].questions:
                self.assertTrue(all(0 <= i < len(qq.options) for i in qq.correct))
            for l in lv.lessons:
                body = (l.body or {}).get("ru", "")
                self.assertNotRegex(body, "[ёЁ—]", l.title["ru"])
        self.assertEqual(Cohort.query.filter_by(program_id=p.id, is_open=True).count(), 5)

    def test_reload_refuses_when_cohorts_have_learners_unless_replace(self):
        from app.content import CourseError
        with self.assertRaises(CourseError):
            load("canopy-2026")
        load("canopy-2026", replace=True)

    def test_online_level_to_certificate(self):
        cohort = Cohort.query.join(Program).filter(Program.slug == "first-canopy-2026-rules").order_by(Cohort.id).first()
        learner = self.new_client("teacher1@academy.demo")
        r = learner.get(f"/join/{cohort.invite_code}")
        self.assertEqual(r.status_code, 302)
        enr = Enrollment.query.filter_by(cohort_id=cohort.id).one()
        for lesson in cohort.level.lessons:
            data = {}
            for qq in lesson.questions:
                data[f"q{qq.id}"] = [str(i) for i in qq.correct]
            r = learner.post(f"/my/cohort/{cohort.id}/lesson/{lesson.id}", data=data)
            self.assertIn(r.status_code, (200, 302))
        a = cohort.level.assignments[0]
        r = learner.post(f"/my/cohort/{cohort.id}/assignment/{a.id}", data={
            "text": "Паспорт команды", "files": (io.BytesIO(b"%PDF-1.4 test"), "passport.pdf")},
            content_type="multipart/form-data")
        self.assertEqual(r.status_code, 302)
        # в потоке нет тренера и наставника: о сдаче узнают администраторы
        admins = [u for u in User.query.all() if u.is_admin]
        self.assertTrue(admins)
        for adm in admins:
            self.assertTrue(Notification.query.filter_by(user_id=adm.id, kind="review").first())

        admin = self.new_client("admin@academy.demo")
        ev = enr.evidence[0]
        data = {"decision": "accepted", "summary": "ok"}
        for c in a.criteria:
            data[f"c{c.id}"] = "3"
        r = admin.post(f"/review/{ev.id}", data=data)
        self.assertEqual(r.status_code, 302)
        cert = Certificate.query.filter_by(enrollment_id=enr.id).one()
        # минуты уроков + 60 минут практики, округление вверх
        import math
        minutes = sum(l.duration_min for l in cohort.level.lessons) + 60
        self.assertEqual(cert.hours, math.ceil(minutes / 60))
        self.assertEqual(certificates._completed_key(cert), "cert.pdf.completed_online")
        pdf = learner.get(f"/my/certificates/{cert.code}.pdf")
        self.assertEqual(pdf.status_code, 200)
        self.assertEqual(pdf.mimetype, "application/pdf")

    def test_images_in_lessons_exist(self):
        import os
        root = os.path.join(os.path.dirname(__file__), "..", "app")
        for lv in self.program.levels:
            for l in lv.lessons:
                for src in re.findall(r"\((/static/course/[^)]+)\)", (l.body or {}).get("ru", "")):
                    self.assertTrue(os.path.exists(root + src), src)


class CatalogTest(AppTestCase):
    def test_logged_in_user_sees_catalog_not_empty_page(self):
        load("canopy-2026")
        client = self.new_client("teacher1@academy.demo")
        r = client.get("/?public=1")
        self.assertEqual(r.status_code, 302)
        self.assertTrue(r.headers["Location"].endswith("/catalog"))
        html = client.get("/catalog").get_data(as_text=True)
        self.assertIn("Сезон FIRST CANOPY 2026-2027", html)
        self.assertGreaterEqual(html.count("/join/"), 5)
        home = client.get("/my").get_data(as_text=True)
        self.assertIn('href="/catalog"', home)


class SelfPacedTest(AppTestCase):
    def test_canopy_is_self_paced_without_deadlines(self):
        p = load("canopy-2026")
        self.assertTrue(p.self_paced)
        cohorts = Cohort.query.filter_by(program_id=p.id).all()
        self.assertEqual(len(cohorts), 5)
        for c in cohorts:
            self.assertTrue(c.self_paced and c.is_open)
            self.assertEqual(c.capacity, 0)  # без ограничения мест
            self.assertIsNone(c.due_date(c.level.assignments[0]))
        client = self.new_client("teacher2@academy.demo")
        html = client.get("/catalog").get_data(as_text=True)
        self.assertIn("Начать", html)
        self.assertIn("в любое время", html)

    def test_studio_toggle_creates_and_closes_cohorts(self):
        from app.models import Program
        p = Program.query.filter_by(slug="fll-future-edition").one()
        methodist = self.new_client("methodist@academy.demo")
        form = {"action": "meta", "title_ru": p.title["ru"], "direction": p.direction, "color": p.color,
                "position": "0", "slug": p.slug, "self_paced": "1"}
        r = methodist.post(f"/studio/programs/{p.id}", data=form)
        self.assertEqual(r.status_code, 302)
        sp = Cohort.query.filter_by(program_id=p.id, self_paced=True).all()
        self.assertEqual(len(sp), len(p.levels))
        self.assertTrue(all(c.is_open for c in sp))
        # учитель записывается в любой момент
        learner = self.new_client("teacher3@academy.demo")
        r = learner.get(f"/join/{sp[0].invite_code}")
        self.assertEqual(r.status_code, 302)
        self.assertTrue(Enrollment.query.filter_by(cohort_id=sp[0].id).first())
        # выключили режим: запись закрыта, начатое обучение сохраняется
        form.pop("self_paced")
        methodist.post(f"/studio/programs/{p.id}", data=form)
        db.session.expire_all()
        self.assertFalse(any(c.is_open for c in Cohort.query.filter_by(program_id=p.id, self_paced=True)))
        self.assertTrue(Enrollment.query.filter_by(cohort_id=sp[0].id).first())
        # повторное включение не плодит потоки
        form["self_paced"] = "1"
        methodist.post(f"/studio/programs/{p.id}", data=form)
        self.assertEqual(Cohort.query.filter_by(program_id=p.id, self_paced=True).count(), len(p.levels))

    def test_existing_course_switches_to_self_paced_keeping_links(self):
        from app.content import _apply_self_paced
        from app.models import Program
        p = load("canopy-2026", cohorts=False)
        p.self_paced = False
        for lv in p.levels:  # как было на сервере: обычные открытые потоки
            db.session.add(Cohort(name="Онлайн-поток", program_id=p.id, level_id=lv.id, is_open=True, capacity=1000))
        db.session.commit()
        codes = {c.invite_code for c in Cohort.query.filter_by(program_id=p.id)}
        _apply_self_paced(p)
        db.session.commit()
        sp = Cohort.query.filter_by(program_id=p.id, self_paced=True).all()
        self.assertEqual({c.invite_code for c in sp}, codes)
        self.assertTrue(db.session.get(Program, p.id).self_paced)


class MigrationTest(AppTestCase):
    def test_legacy_and_fresh_databases_upgrade(self):
        import os
        import sqlite3
        import tempfile
        from flask_migrate import upgrade
        from app import create_app
        from app.config import Config
        from app.dbinit import MIGRATIONS_DIR

        class Prod(Config):
            TESTING = False
            SEED_CONTENT = False
            SEED_DEMO = False

        with tempfile.TemporaryDirectory() as d:
            legacy = os.path.join(d, "legacy.db")
            app = create_app(Prod, SQLALCHEMY_DATABASE_URI=f"sqlite:///{legacy}", DB_AUTO_INIT=False)
            with app.app_context():
                upgrade(directory=MIGRATIONS_DIR, revision="0001_baseline")
            con = sqlite3.connect(legacy)
            con.execute("DROP TABLE alembic_version")  # база, созданная до миграций
            con.execute("INSERT INTO programs(slug, direction, title, status, version, position) "
                        "VALUES ('old', 'base', '{}', 'published', 1, 0)")
            con.commit()
            con.close()
            create_app(Prod, SQLALCHEMY_DATABASE_URI=f"sqlite:///{legacy}")
            con = sqlite3.connect(legacy)
            self.assertEqual(con.execute("SELECT version_num FROM alembic_version").fetchone()[0], "0012_live_feedback")
            self.assertEqual(con.execute("SELECT self_paced FROM programs WHERE slug='old'").fetchone()[0], 0)
            con.close()

            fresh = os.path.join(d, "fresh.db")
            create_app(Prod, SQLALCHEMY_DATABASE_URI=f"sqlite:///{fresh}")
            con = sqlite3.connect(fresh)
            self.assertEqual(con.execute("SELECT version_num FROM alembic_version").fetchone()[0], "0012_live_feedback")
            con.close()


class CourseUpdateTest(AppTestCase):
    def test_update_keeps_cohorts_progress_and_rebuilds_lessons(self):
        import copy
        from app import content
        from app.models import Lesson, LessonProgress, Program, User
        mod = content.COURSES["canopy-2026"]
        original = mod.PROGRAM
        old_spec = copy.deepcopy(original)
        # «старая версия»: в первом уровне нет нового урока, зато есть устаревший
        first = old_spec["levels"][0]["modules"][0]["lessons"]
        first.pop(2)
        first.append({"kind": "text", "title": {"ru": "Устаревший урок"}, "body": {"ru": "старое"}})
        mod.PROGRAM = old_spec
        try:
            p = content.load("canopy-2026")
        finally:
            mod.PROGRAM = original
        cohort = Cohort.query.filter_by(program_id=p.id).order_by(Cohort.id).first()
        codes = {c.invite_code for c in Cohort.query.filter_by(program_id=p.id)}
        user = User.query.filter_by(email="teacher1@academy.demo").one()
        enr = Enrollment(cohort_id=cohort.id, user_id=user.id)
        db.session.add(enr)
        db.session.flush()
        kept = Lesson.query.filter(Lesson.module.has(level_id=cohort.level_id)).order_by(Lesson.id).first()
        db.session.add(LessonProgress(enrollment_id=enr.id, lesson_id=kept.id, attempts=1))
        db.session.commit()
        kept_id = kept.id

        content.update("canopy-2026")
        db.session.expire_all()
        p = Program.query.filter_by(slug=original["slug"]).one()
        self.assertEqual({c.invite_code for c in Cohort.query.filter_by(program_id=p.id)}, codes)
        self.assertIsNotNone(db.session.get(Lesson, kept_id))
        self.assertTrue(LessonProgress.query.filter_by(enrollment_id=enr.id, lesson_id=kept_id).first())
        titles = [l.title["ru"] for l in p.levels[0].lessons]
        self.assertNotIn("Устаревший урок", titles)
        self.assertIn(original["levels"][0]["modules"][0]["lessons"][2]["title"]["ru"], titles)
        expected = sum(len(m["lessons"]) for m in original["levels"][0]["modules"])
        self.assertEqual(len(titles), expected)
        quiz = [l for l in p.levels[0].lessons if l.kind == "quiz"][0]
        spec_quiz = [les for m in original["levels"][0]["modules"] for les in m["lessons"] if les["kind"] == "quiz"][0]
        self.assertEqual(len(quiz.questions), len(spec_quiz["questions"]))
