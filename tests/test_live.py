from tests.base import AppTestCase

from app.models import LiveAnswer, LiveEvent, LiveQuestion, LiveViewer, User
from app.services import live as svc


class LiveTest(AppTestCase):
    def setUp(self):
        super().setUp()
        svc.ensure_events()
        svc._cache.clear()
        self.ev = LiveEvent.query.filter_by(slug="keleshek").first()

    def test_event_loaded_from_content(self):
        self.assertIsNotNone(self.ev)
        qs = LiveQuestion.query.filter_by(event_id=self.ev.id).order_by(LiveQuestion.position).all()
        self.assertGreaterEqual(len(qs), 10)
        for q in qs:
            self.assertEqual(len(q.options), 4, q.key)
            self.assertTrue(0 <= q.correct < 4)
            for lang in ("kk", "ru"):
                self.assertTrue(q.text.get(lang) and all(o.get(lang) for o in q.options), (q.key, lang))
        svc.ensure_events()  # повторная загрузка не плодит вопросы
        self.assertEqual(LiveQuestion.query.filter_by(event_id=self.ev.id).count(), len(qs))

    def test_gate_and_register_returns_to_live(self):
        r = self.client.get("/live/keleshek?lang=kk")
        self.assertEqual(r.status_code, 200)
        self.assertIn("/register?next=", r.get_data(as_text=True))
        r = self.client.post("/register?next=/live/keleshek", data={
            "full_name": "Ахметова Айгерим", "email": "a@school.kz", "password": "password123", "consent": "1",
            "phone": "+7 701 000 00 01"})
        self.assertEqual(r.status_code, 302)
        self.assertTrue(r.headers["Location"].endswith("/live/keleshek"))
        self.assertEqual(self.client.get("/live/keleshek").status_code, 200)

    def test_quiz_flow(self):
        teacher = self.new_client("teacher1@academy.demo")
        op = self.new_client("admin@academy.demo")
        self.assertEqual(teacher.get("/live/keleshek").status_code, 200)
        r = teacher.post("/live/keleshek/profile", json={"region": "almaty", "school": "№5 мектеп", "subjects": ["physics", "nope"]})
        self.assertEqual(r.get_json(), {"ok": True})
        uid = User.query.filter_by(email="teacher1@academy.demo").first().id
        v = LiveViewer.query.filter_by(user_id=uid).first()
        self.assertEqual(v.subjects, ["physics"])
        self.assertEqual(teacher.post("/live/keleshek/profile", json={"region": "mars", "school": "x", "subjects": []}).status_code, 400)

        q = LiveQuestion.query.filter_by(event_id=self.ev.id, key="q1").first()
        # до запуска вопроса ответы не принимаются
        self.assertEqual(teacher.post("/live/keleshek/answer", json={"qid": q.id, "choice": q.correct, "ms": 100}).get_json()["error"], "closed")
        self.assertEqual(teacher.post("/live/keleshek/control/state", json={"mode": "question", "qid": q.id}).status_code, 403)
        self.assertEqual(op.post("/live/keleshek/control/state", json={"mode": "question", "qid": q.id}).status_code, 200)
        svc._cache.clear()
        st = teacher.get("/live/keleshek/state").get_json()
        self.assertEqual(st["mode"], "question")
        self.assertNotIn("correct", st["q"])
        r = teacher.post("/live/keleshek/answer", json={"qid": q.id, "choice": q.correct, "ms": 3000})
        self.assertTrue(r.get_json()["ok"])
        self.assertEqual(teacher.post("/live/keleshek/answer", json={"qid": q.id, "choice": 0, "ms": 10}).get_json()["error"], "already")
        a = LiveAnswer.query.filter_by(question_id=q.id).first()
        self.assertTrue(a.is_correct)
        self.assertEqual(a.points, svc.points_for(q, 3000))
        self.assertGreater(a.points, 900)

        op.post("/live/keleshek/control/state", json={"mode": "reveal"})
        svc._cache.clear()
        st = teacher.get("/live/keleshek/state").get_json()
        self.assertEqual(st["q"]["correct"], q.correct)
        self.assertTrue(st["me"]["answer"]["correct"])

        op.post("/live/keleshek/control/state", json={"mode": "leaderboard"})
        svc._cache.clear()
        st = teacher.get("/live/keleshek/state").get_json()
        self.assertEqual(st["me"]["rank"], 1)
        self.assertEqual(len(st["top"]), 1)

        self.assertTrue(teacher.post("/live/keleshek/ask", json={"text": "Жабдық қашан келеді?"}).get_json()["ok"])
        data = op.get("/live/keleshek/control.json").get_json()
        self.assertEqual(len(data["asks"]), 1)
        self.assertEqual(op.post(f"/live/keleshek/control/ask/{data['asks'][0]['id']}", json={"status": "picked"}).status_code, 200)

        self.assertEqual(self.client.get("/live/keleshek/screen").status_code, 403)
        self.assertEqual(self.client.get(f"/live/keleshek/screen?key={self.ev.screen_key}&lang=kk").status_code, 200)
        sj = self.client.get(f"/live/keleshek/screen.json?key={self.ev.screen_key}").get_json()
        self.assertEqual(sj["stats"]["joined"], 1)
        self.assertEqual(sj["picked"]["text"], "Жабдық қашан келеді?")
        self.assertEqual(self.client.get(f"/live/keleshek/overlay?key={self.ev.screen_key}").status_code, 200)
        r = op.get("/live/keleshek/export.xlsx")
        self.assertEqual(r.status_code, 200)
        for lang in ("ru", "kk", "en"):
            self.assertEqual(op.get(f"/live/keleshek/control?lang={lang}").status_code, 200)

    def test_youtube_link_parsing(self):
        op = self.new_client("admin@academy.demo")
        for link in ("https://www.youtube.com/live/jfKfPfyJRdk?si=x", "https://youtu.be/jfKfPfyJRdk", "jfKfPfyJRdk",
                     "https://www.youtube.com/watch?v=jfKfPfyJRdk&feature=share"):
            r = op.post("/live/keleshek/control/settings", json={"youtube": link})
            self.assertEqual(r.get_json()["youtube_id"], "jfKfPfyJRdk", link)
        self.assertEqual(op.post("/live/keleshek/control/settings", json={"youtube": "https://example.com"}).status_code, 400)

    def test_reset_admin_only(self):
        teacher = self.new_client("teacher1@academy.demo")
        teacher.get("/live/keleshek")
        teacher.post("/live/keleshek/profile", json={"region": "almaty", "school": "№5", "subjects": ["math"]})
        teacher.post("/live/keleshek/ask", json={"text": "Сұрақ бар"})
        admin = self.new_client("admin@academy.demo")
        q = LiveQuestion.query.filter_by(event_id=self.ev.id, key="q1").first()
        admin.post("/live/keleshek/control/state", json={"mode": "question", "qid": q.id})
        teacher.post("/live/keleshek/answer", json={"qid": q.id, "choice": q.correct, "ms": 100})
        self.assertEqual(LiveAnswer.query.count(), 1)
        methodist = self.new_client("methodist@academy.demo")
        self.assertEqual(methodist.post("/live/keleshek/control/reset", json={"confirm": "keleshek"}).status_code, 403)
        self.assertNotIn("id=\"reset\"", methodist.get("/live/keleshek/control").get_data(as_text=True))
        self.assertEqual(admin.post("/live/keleshek/control/reset", json={"confirm": "wrong"}).status_code, 400)
        self.assertEqual(LiveAnswer.query.count(), 1)
        r = admin.post("/live/keleshek/control/reset", json={"confirm": "Keleshek "}).get_json()
        self.assertEqual((r["ok"], r["answers"], r["viewers"], r["asks"]), (True, 1, 1, 1))
        self.assertEqual(LiveAnswer.query.count() + LiveViewer.query.count(), 0)
        self.assertEqual(LiveEvent.query.get(self.ev.id).state["mode"], "waiting")
        self.assertIn("id=\"reset\"", admin.get("/live/keleshek/control").get_data(as_text=True))
        self.assertEqual(User.query.filter_by(email="teacher1@academy.demo").count(), 1)
