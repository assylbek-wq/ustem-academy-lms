from tests.base import AppTestCase, csrf_from

from app.models import Cohort, Lesson, Program, Session


class SmokeTest(AppTestCase):
    def test_public_pages(self):
        for url in ["/", "/programs/fll-future-edition", "/login", "/register", "/forgot", "/verify",
                    "/healthz", "/robots.txt", "/?lang=kk", "/?lang=en"]:
            self.assertEqual(self.client.get(url).status_code, 200, url)
        self.assertEqual(self.client.get("/programs/ftc-start").status_code, 404)  # черновик скрыт

    def test_every_role_sees_its_pages(self):
        cohort = Cohort.query.first()
        lesson = cohort.level.lessons[0]
        session = Session.query.first()
        program = Program.query.filter_by(slug="fll-future-edition").first()
        pages = {
            "admin@academy.demo": ["/my", "/admin", "/admin/cohorts", "/admin/cohorts/new", f"/admin/cohorts/{cohort.id}",
                                   f"/admin/cohorts/{cohort.id}/import", "/admin/users", "/admin/users/new",
                                   "/admin/customers", "/admin/certificates", "/admin/leads", "/admin/audit",
                                   "/reports", f"/reports/cohort/{cohort.id}", f"/reports/cohort/{cohort.id}.xlsx",
                                   "/admin/import-template.xlsx", "/cohorts", "/review", "/studio"],
            "methodist@academy.demo": ["/studio", f"/studio/programs/{program.id}", f"/studio/levels/{cohort.level_id}",
                                       f"/studio/lessons/{lesson.id}", f"/studio/lessons/{lesson.id}/preview",
                                       f"/studio/assignments/{cohort.level.assignments[0].id}"],
            "trainer@academy.demo": ["/cohorts", f"/cohorts/{cohort.id}", f"/cohorts/{cohort.id}/attendance/{session.id}",
                                     "/review"],
            "mentor@academy.demo": ["/review", "/review?status=accepted"],
            "customer@academy.demo": ["/reports", f"/reports/cohort/{cohort.id}"],
            "teacher1@academy.demo": ["/my", f"/my/cohort/{cohort.id}", f"/my/cohort/{cohort.id}/lesson/{lesson.id}",
                                      f"/my/cohort/{cohort.id}/assignment/{cohort.level.assignments[0].id}",
                                      "/my/certificates", "/my/portfolio", "/account", "/notifications"],
        }
        for email, urls in pages.items():
            c = self.new_client(email)
            for u in urls:
                for lang in ("ru", "kk", "en"):
                    r = c.get(u + ("&" if "?" in u else "?") + f"lang={lang}")
                    self.assertEqual(r.status_code, 200, f"{email} {u} {lang}")

    def test_access_is_restricted(self):
        c = self.new_client("teacher1@academy.demo")
        for u in ["/admin", "/studio", "/cohorts", "/review", "/reports"]:
            self.assertEqual(c.get(u).status_code, 403, u)
        anon = self.new_client()
        r = anon.get("/my")
        self.assertEqual(r.status_code, 302)
        self.assertIn("/login", r.headers["Location"])
        c = self.new_client("mentor@academy.demo")
        self.assertEqual(c.get("/admin").status_code, 403)
        self.assertEqual(c.get("/studio").status_code, 403)

    def test_lesson_outside_cohort_level_is_404(self):
        cohort = Cohort.query.first()
        other = Lesson.query.join(Lesson.module).filter_by(level_id=Program.query.filter_by(
            slug="ustem-foundations").first().levels[0].id).first()
        c = self.new_client("teacher1@academy.demo")
        self.assertEqual(c.get(f"/my/cohort/{cohort.id}/lesson/{other.id}").status_code, 404)


class CsrfTest(AppTestCase):
    csrf_off = False

    def test_post_without_token_is_rejected(self):
        r = self.client.post("/login", data={"email": "admin@academy.demo", "password": "demo12345"})
        self.assertEqual(r.status_code, 400)

    def test_post_with_token_works(self):
        token = csrf_from(self.client.get("/login").get_data(as_text=True))
        r = self.client.post("/login", data={"email": "admin@academy.demo", "password": "demo12345", "_csrf": token})
        self.assertEqual(r.status_code, 302)
