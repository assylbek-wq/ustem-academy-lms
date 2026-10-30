from tests.base import AppTestCase

from app.models import EfirAnswer, EfirEvent, EfirQuestion, EfirViewer, User
from app.services import efir as svc
from app.services import live as live_svc


class EfirTest(AppTestCase):
    def setUp(self):
        super().setUp()
        live_svc.ensure_events()
        svc._cache.clear()
        from app.models import LiveEvent
        from app.services import efir_builder
        self.ev = efir_builder.import_live(LiveEvent.query.filter_by(slug="keleshek1").first(), None, slug="keleshek")

    def test_event_loaded_from_content(self):
        self.assertIsNotNone(self.ev)
        qs = EfirQuestion.query.filter_by(event_id=self.ev.id).order_by(EfirQuestion.position).all()
        self.assertGreaterEqual(len(qs), 10)
        for q in qs:
            self.assertEqual(len(q.options), 4, q.key)
            self.assertTrue(0 <= q.correct < 4)
            for lang in ("kk", "ru"):
                self.assertTrue(q.text.get(lang) and all(o.get(lang) for o in q.options), (q.key, lang))
        svc.ensure_events()  # повторная загрузка не плодит вопросы
        self.assertEqual(EfirQuestion.query.filter_by(event_id=self.ev.id).count(), len(qs))

    def test_gate_and_register_returns_to_live(self):
        r = self.client.get("/efir/keleshek?lang=kk")
        self.assertEqual(r.status_code, 200)
        self.assertIn("/register?next=", r.get_data(as_text=True))
        r = self.client.post("/register?next=/efir/keleshek", data={
            "full_name": "Ахметова Айгерим", "email": "a@school.kz", "password": "password123", "consent": "1",
            "phone": "+7 701 000 00 01"})
        self.assertEqual(r.status_code, 302)
        self.assertTrue(r.headers["Location"].endswith("/efir/keleshek"))
        self.assertEqual(self.client.get("/efir/keleshek").status_code, 200)

    def test_quiz_flow(self):
        teacher = self.new_client("teacher1@academy.demo")
        op = self.new_client("admin@academy.demo")
        self.assertEqual(teacher.get("/efir/keleshek").status_code, 200)
        r = teacher.post("/efir/keleshek/profile", json={"region": "almaty", "school": "№5 мектеп", "subjects": ["physics", "nope"]})
        self.assertEqual(r.get_json(), {"ok": True})
        uid = User.query.filter_by(email="teacher1@academy.demo").first().id
        v = EfirViewer.query.filter_by(user_id=uid).first()
        self.assertEqual(v.subjects, ["physics"])
        self.assertEqual(teacher.post("/efir/keleshek/profile", json={"region": "mars", "school": "x", "subjects": []}).status_code, 400)

        q = EfirQuestion.query.filter_by(event_id=self.ev.id, key="q1").first()
        # до запуска вопроса ответы не принимаются
        self.assertEqual(teacher.post("/efir/keleshek/answer", json={"qid": q.id, "choice": q.correct, "ms": 100}).get_json()["error"], "closed")
        self.assertEqual(teacher.post("/efir/keleshek/control/state", json={"mode": "question", "qid": q.id}).status_code, 403)
        self.assertEqual(op.post("/efir/keleshek/control/state", json={"mode": "question", "qid": q.id}).status_code, 200)
        svc._cache.clear()
        st = teacher.get("/efir/keleshek/state").get_json()
        self.assertEqual(st["mode"], "question")
        self.assertNotIn("correct", st["q"])
        r = teacher.post("/efir/keleshek/answer", json={"qid": q.id, "choice": q.correct, "ms": 3000})
        self.assertTrue(r.get_json()["ok"])
        self.assertEqual(teacher.post("/efir/keleshek/answer", json={"qid": q.id, "choice": 0, "ms": 10}).get_json()["error"], "already")
        a = EfirAnswer.query.filter_by(question_id=q.id).first()
        self.assertTrue(a.is_correct)
        self.assertEqual(a.points, svc.points_for(q, 3000))
        self.assertGreater(a.points, 900)

        op.post("/efir/keleshek/control/state", json={"mode": "reveal"})
        svc._cache.clear()
        st = teacher.get("/efir/keleshek/state").get_json()
        self.assertEqual(st["q"]["correct"], q.correct)
        self.assertTrue(st["me"]["answer"]["correct"])

        op.post("/efir/keleshek/control/state", json={"mode": "leaderboard"})
        svc._cache.clear()
        st = teacher.get("/efir/keleshek/state").get_json()
        self.assertEqual(st["me"]["rank"], 1)
        self.assertEqual(len(st["top"]), 1)

        self.assertTrue(teacher.post("/efir/keleshek/ask", json={"text": "Жабдық қашан келеді?"}).get_json()["ok"])
        data = op.get("/efir/keleshek/control.json").get_json()
        self.assertEqual(len(data["asks"]), 1)
        self.assertEqual(op.post(f"/efir/keleshek/control/ask/{data['asks'][0]['id']}", json={"status": "picked"}).status_code, 200)

        self.assertEqual(self.client.get("/efir/keleshek/screen").status_code, 403)
        self.assertEqual(self.client.get(f"/efir/keleshek/screen?key={self.ev.screen_key}&lang=kk").status_code, 200)
        sj = self.client.get(f"/efir/keleshek/screen.json?key={self.ev.screen_key}").get_json()
        self.assertEqual(sj["stats"]["joined"], 1)
        self.assertEqual(sj["picked"]["text"], "Жабдық қашан келеді?")
        self.assertEqual(self.client.get(f"/efir/keleshek/overlay?key={self.ev.screen_key}").status_code, 200)
        r = op.get("/efir/keleshek/export.xlsx")
        self.assertEqual(r.status_code, 200)
        for lang in ("ru", "kk", "en"):
            self.assertEqual(op.get(f"/efir/keleshek/control?lang={lang}").status_code, 200)

    def test_youtube_link_parsing(self):
        op = self.new_client("admin@academy.demo")
        for link in ("https://www.youtube.com/live/jfKfPfyJRdk?si=x", "https://youtu.be/jfKfPfyJRdk", "jfKfPfyJRdk",
                     "https://www.youtube.com/watch?v=jfKfPfyJRdk&feature=share"):
            r = op.post("/efir/keleshek/control/settings", json={"youtube": link})
            self.assertEqual(r.get_json()["youtube_id"], "jfKfPfyJRdk", link)
        self.assertEqual(op.post("/efir/keleshek/control/settings", json={"youtube": "https://example.com"}).status_code, 400)

    def test_reset_admin_only(self):
        teacher = self.new_client("teacher1@academy.demo")
        teacher.get("/efir/keleshek")
        teacher.post("/efir/keleshek/profile", json={"region": "almaty", "school": "№5", "subjects": ["math"]})
        teacher.post("/efir/keleshek/ask", json={"text": "Сұрақ бар"})
        admin = self.new_client("admin@academy.demo")
        q = EfirQuestion.query.filter_by(event_id=self.ev.id, key="q1").first()
        admin.post("/efir/keleshek/control/state", json={"mode": "question", "qid": q.id})
        teacher.post("/efir/keleshek/answer", json={"qid": q.id, "choice": q.correct, "ms": 100})
        self.assertEqual(EfirAnswer.query.count(), 1)
        methodist = self.new_client("methodist@academy.demo")
        self.assertEqual(methodist.post("/efir/keleshek/control/reset", json={"confirm": "keleshek"}).status_code, 403)
        self.assertNotIn("id=\"reset\"", methodist.get("/efir/keleshek/control").get_data(as_text=True))
        self.assertEqual(admin.post("/efir/keleshek/control/reset", json={"confirm": "wrong"}).status_code, 400)
        self.assertEqual(EfirAnswer.query.count(), 1)
        r = admin.post("/efir/keleshek/control/reset", json={"confirm": "Keleshek "}).get_json()
        self.assertEqual((r["ok"], r["answers"], r["viewers"], r["asks"]), (True, 1, 1, 1))
        self.assertEqual(EfirAnswer.query.count() + EfirViewer.query.count(), 0)
        self.assertEqual(EfirEvent.query.get(self.ev.id).state["mode"], "waiting")
        self.assertIn("id=\"reset\"", admin.get("/efir/keleshek/control").get_data(as_text=True))
        self.assertEqual(User.query.filter_by(email="teacher1@academy.demo").count(), 1)

    def test_edit_add_delete_questions(self):
        op = self.new_client("methodist@academy.demo")
        q = EfirQuestion.query.filter_by(event_id=self.ev.id, key="q1").first()
        body = {"block": 1, "text": {"kk": "Жаңа сұрақ?", "ru": "Новый вопрос?"},
                "options": [{"kk": "А"}, {"kk": "Б"}, {"kk": ""}, {"kk": "В"}], "correct": 2,
                "note": {"kk": "Себебі"}, "seconds": 25}
        r = op.post(f"/efir/keleshek/control/question/{q.id}", json=body)
        self.assertTrue(r.get_json()["ok"], r.get_json())
        db_q = EfirQuestion.query.get(q.id)
        self.assertEqual((db_q.text["kk"], len(db_q.options), db_q.correct, db_q.seconds), ("Жаңа сұрақ?", 3, 2, 25))
        svc.ensure_events()  # перезапуск Академии не затирает правку
        self.assertEqual(EfirQuestion.query.get(q.id).text["kk"], "Жаңа сұрақ?")
        self.assertEqual(op.post(f"/efir/keleshek/control/question/{q.id}", json={**body, "options": [{"kk": "А"}]}).status_code, 400)
        n = EfirQuestion.query.filter_by(event_id=self.ev.id).count()
        r = op.post("/efir/keleshek/control/question", json={**body, "block": 1}).get_json()
        new = EfirQuestion.query.get(r["id"])
        self.assertEqual(EfirQuestion.query.filter_by(event_id=self.ev.id).count(), n + 1)
        block1 = [x.key for x in EfirQuestion.query.filter_by(event_id=self.ev.id).order_by(EfirQuestion.position) if x.block == 1]
        self.assertEqual(block1[-1], new.key)
        order = [x.position for x in EfirQuestion.query.filter_by(event_id=self.ev.id).order_by(EfirQuestion.position)]
        self.assertEqual(order, sorted(set(order)))
        self.assertTrue(op.post(f"/efir/keleshek/control/question/{new.id}/delete", json={}).get_json()["ok"])
        # вопрос с ответами удалить нельзя
        teacher = self.new_client("teacher1@academy.demo")
        teacher.get("/efir/keleshek")
        op.post("/efir/keleshek/control/state", json={"mode": "question", "qid": q.id})
        teacher.post("/efir/keleshek/answer", json={"qid": q.id, "choice": 2, "ms": 100})
        self.assertEqual(op.post(f"/efir/keleshek/control/question/{q.id}/delete", json={}).status_code, 400)
        self.assertEqual(self.client.post(f"/efir/keleshek/control/question/{q.id}", json=body).status_code, 302)
        self.assertIn('data-edit="new"', op.get("/efir/keleshek/control").get_data(as_text=True))

    def test_stats_page(self):
        from datetime import datetime
        from zoneinfo import ZoneInfo
        from app.models import db
        self.ev.starts_at = datetime.now(ZoneInfo("Asia/Almaty")).replace(tzinfo=None, second=0, microsecond=0)
        db.session.commit()
        teacher = self.new_client("teacher1@academy.demo")
        teacher.get("/efir/keleshek")
        teacher.post("/efir/keleshek/profile", json={"region": "zko", "school": "№5", "subjects": ["physics", "math"],
                                                     "position": "teacher", "robotics": "team"})
        admin = self.new_client("admin@academy.demo")
        q = EfirQuestion.query.filter_by(event_id=self.ev.id, key="q2").first()
        admin.post("/efir/keleshek/control/state", json={"mode": "question", "qid": q.id})
        teacher.post("/efir/keleshek/answer", json={"qid": q.id, "choice": q.correct, "ms": 1000})
        teacher.post("/efir/keleshek/ask", json={"text": "Сұрақ бар"})
        self.assertEqual(teacher.get("/efir/keleshek/stats").status_code, 403)
        for lang in ("kk", "ru", "en"):
            self.assertEqual(admin.get(f"/efir/keleshek/stats?lang={lang}").status_code, 200)
        d = admin.get("/efir/keleshek/stats.json").get_json()
        self.assertEqual((d["kpi"]["viewers"], d["kpi"]["profiles"], d["kpi"]["answers"], d["kpi"]["asks"]), (1, 1, 1, 1))
        self.assertEqual(d["regions"][0]["code"], "KZ-ZAP")
        self.assertEqual({s["key"] for s in d["subjects"]}, {"physics", "math"})
        asked = [x for x in d["quiz"] if x["answers"]]
        self.assertEqual((len(asked), asked[0]["n"], asked[0]["pct"]), (1, 2, 100))
        self.assertTrue(any(m["mode"] == "question" and m["q"] == 2 for m in d["marks"]))
        self.assertGreaterEqual(d["kpi"]["peak"], 1)
        self.assertEqual(d["top"][0]["ok"], 1)
        # гостевая ссылка: без входа, только с ключом, без ФИО авторов вопросов
        from app.blueprints.efir import stats_key
        key = stats_key(self.ev)
        guest = self.app.test_client()
        self.assertEqual(guest.get("/efir/keleshek/stats.json").status_code, 403)
        self.assertEqual(guest.get("/efir/keleshek/stats.json?key=wrong").status_code, 403)
        self.assertEqual(guest.get("/efir/keleshek/stats").status_code, 302)
        page = guest.get(f"/efir/keleshek/stats?key={key}&lang=ru")
        self.assertEqual(page.status_code, 200)
        self.assertNotIn(b"export.xlsx", page.data)
        self.assertNotIn(b'id="shareBtn"', page.data)
        gd = guest.get(f"/efir/keleshek/stats.json?key={key}").get_json()
        self.assertEqual((gd["asks"][0]["name"], gd["kpi"]["asks"]), ("", 1))
        self.assertEqual(guest.get(f"/efir/keleshek/export.xlsx?key={key}").status_code, 302)
        self.assertEqual(guest.get(f"/efir/keleshek/control?key={key}").status_code, 302)
        self.assertIn(key.encode(), admin.get("/efir/keleshek/stats").data)

    def test_asks_antispam_and_feedback(self):
        from datetime import timedelta
        from app.models import EfirAsk, EfirFeedback
        teacher = self.new_client("teacher1@academy.demo")
        teacher.get("/efir/keleshek")
        ok = teacher.post("/efir/keleshek/ask", json={"text": "Первый вопрос?"}).get_json()
        self.assertTrue(ok["ok"])
        r = teacher.post("/efir/keleshek/ask", json={"text": "Второй вопрос сразу"})
        self.assertEqual(r.status_code, 429)
        self.assertGreater(r.get_json()["wait"], 0)
        def age():  # сдвигаем время прошлых вопросов, чтобы не ждать паузу
            for a in EfirAsk.query.filter_by(event_id=self.ev.id).all():
                a.created_at -= timedelta(seconds=60)
            from app.models import db
            db.session.commit()
        age()
        self.assertEqual(teacher.post("/efir/keleshek/ask", json={"text": "первый  вопрос"}).status_code, 400)  # повтор
        for i in range(12):  # больше прежних 10
            age()
            self.assertTrue(teacher.post("/efir/keleshek/ask", json={"text": f"Вопрос номер {i}"}).get_json()["ok"])
        # модератор скрывает автора: старые и новые вопросы не видны на пульте и в аналитике
        admin = self.new_client("admin@academy.demo")
        uid = User.query.filter_by(email="teacher1@academy.demo").first().id
        self.assertTrue(admin.post(f"/efir/keleshek/control/mute/{uid}", json={"on": True}).get_json()["ok"])
        age()
        self.assertTrue(teacher.post("/efir/keleshek/ask", json={"text": "Спам спам"}).get_json()["ok"])
        self.assertEqual(admin.get("/efir/keleshek/control.json").get_json().get("asks", []), [])
        self.assertEqual(admin.get("/efir/keleshek/stats.json").get_json()["kpi"]["asks"], 0)
        # отзыв
        self.assertEqual(teacher.post("/efir/keleshek/feedback", json={"rating": 9}).status_code, 400)
        r = teacher.post("/efir/keleshek/feedback", json={"rating": 5, "liked": ["quiz", "bad"], "improve": ["sound"],
                                                          "comment": "Отлично", "topics": "FTC"})
        self.assertTrue(r.get_json()["ok"])
        teacher.post("/efir/keleshek/feedback", json={"rating": 4})  # повторно - обновляет
        self.assertEqual(EfirFeedback.query.filter_by(event_id=self.ev.id).count(), 1)
        teacher.post("/efir/keleshek/feedback", json={"rating": 4, "liked": ["quiz"], "comment": "Отлично"})
        d = admin.get("/efir/keleshek/stats.json").get_json()["feedback"]
        self.assertEqual((d["n"], d["avg"], d["dist"][3], d["liked"][0]["key"]), (1, 4.0, 1, "quiz"))
        self.assertTrue(d["comments"][0]["name"])
        from app.blueprints.efir import stats_key
        g = self.app.test_client().get(f"/efir/keleshek/stats.json?key={stats_key(self.ev)}").get_json()
        self.assertEqual(g["feedback"]["comments"][0]["name"], "")
        self.assertIn("fb-rate", teacher.get("/efir/keleshek").get_data(as_text=True))
        x = admin.get("/efir/keleshek/export.xlsx")
        self.assertEqual(x.status_code, 200)

    def test_timeline_ignores_visits_outside_window(self):
        from datetime import datetime
        from app.models import db
        from app.services import efir_stats
        t1 = self.new_client("teacher1@academy.demo")
        t1.get("/efir/keleshek")
        v = EfirViewer.query.filter_by(event_id=self.ev.id).first()
        # был в 09:00-09:10 по Астане (до окна 10:15), а пик считался бы весь эфир
        v.first_seen, v.last_seen = datetime(2026, 10, 27, 4, 0), datetime(2026, 10, 27, 4, 10)
        db.session.commit()
        d = efir_stats.compute(self.ev)
        self.assertEqual(d["kpi"]["viewers"], 1)
        self.assertEqual(d["kpi"]["peak"], 0)
