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
        # 79 минут уроков + 60 минут практики = 2 ч 19 мин -> 3 часа
        self.assertEqual(cert.hours, 3)
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
