"""Геймификация: опыт, значки, путь сезона, связь с USTEM Connect, рейтинг."""
import base64
import hashlib
import hmac
import io
import json
import time
from datetime import timedelta
from unittest import mock

from tests.base import AppTestCase

from app.game.tracks import TRACKS, all_steps
from app.models import JourneyMark, SimSolve, User, UserBadge, XpEvent, db, utcnow
from app.services import connect, game

KEY = "k" * 40
PERSON = "0b5f8e0a-1111-4222-8333-944455556666"


def sign(claims: dict) -> str:
    body = base64.urlsafe_b64encode(json.dumps(claims).encode()).rstrip(b"=").decode()
    sig = base64.urlsafe_b64encode(hmac.new(KEY.encode(), body.encode(), hashlib.sha256).digest()).rstrip(b"=").decode()
    return f"{body}.{sig}"


SNAPSHOT = {
    "person": {"id": PERSON, "name": "Тест", "region": {"ru": "Алматы"}, "country": "KZ"},
    "teams": [{
        "id": "t1", "name": "NyanCat", "program": "FLL_CHALLENGE", "season": "2026-27", "is_current": True,
        "status": "registered", "role": "coach", "students": 6, "consents_missing": 0, "coaches": 1, "team_number": 123,
        "registrations": [
            {"status": "checked_in", "kind": "scrimmage", "checked_in_at": "2026-10-20T05:00:00Z", "awards": [],
             "starts_at": "2026-10-20T05:00:00Z", "advanced": False, "rank": None},
            {"status": "approved", "kind": "regional", "decided_at": "2026-10-21T05:00:00Z", "checked_in_at": "2026-11-15T04:00:00Z",
             "starts_at": "2026-11-15T04:00:00Z", "ends_at": "2026-11-15T12:00:00Z", "rank": 2, "advanced": True,
             "awards": [{"code": "CORE_VALUES", "name": {"ru": "Core Values"}, "kind": "judged", "place": 1}]},
        ],
    }],
}


class GameTest(AppTestCase):
    def setUp(self):
        super().setUp()
        self.app.config["CONNECT_API_KEY"] = KEY
        self.t = self.new_client("teacher1@academy.demo")
        self.user = User.query.filter_by(email="teacher1@academy.demo").first()

    def xp(self):
        db.session.expire_all()
        return game.total_xp(self.user)

    def test_pages_render(self):
        for url in ("/journey/fll", "/journey/ftc", "/leaderboard", "/my", "/account"):
            r = self.t.get(url)
            self.assertEqual(r.status_code, 200, url)
        self.assertEqual(self.t.get("/journey").status_code, 302)
        self.assertEqual(self.t.get("/journey/nope").status_code, 404)
        page = self.t.get("/journey/fll?stage=3").get_data(as_text=True)
        self.assertIn("spike-ruler", page)

    def test_sim_solved_gives_xp_and_badge_once(self):
        r = self.t.post("/api/sim/solved", json={"preset": "spike-ruler"}).get_json()
        self.assertEqual(r["xp"], 25)
        self.assertTrue(r["badges"])  # первый запуск
        self.assertEqual(self.t.post("/api/sim/solved", json={"preset": "spike-ruler"}).get_json()["xp"], 0)
        for bad in ("spike-sandbox", "spike-nope", "../x", "lab-nope"):
            self.assertEqual(self.t.post("/api/sim/solved", json={"preset": bad}).status_code, 400, bad)
        self.assertEqual(self.t.post("/api/sim/solved", json={"preset": "lab-blink"}).get_json()["xp"], 25)
        self.assertEqual(self.t.post("/api/sim/solved", json={"preset": "ftc-auto"}).get_json()["xp"], 25)
        self.assertTrue(UserBadge.query.filter_by(user_id=self.user.id, code="first-sim").first())
        page = self.t.get("/journey/fll?stage=3").get_data(as_text=True)
        self.assertIn("jy-step done", page)

    def test_self_mark_with_photo_and_undo(self):
        before = self.xp()
        png = b"\x89PNG\r\n\x1a\n" + b"0" * 100
        r = self.t.post("/journey/fll/mark", data={"step": "kit", "stage": "2", "note": "Купили",
                                                   "photo": (io.BytesIO(png), "kit.png")}, content_type="multipart/form-data")
        self.assertEqual(r.status_code, 302)
        self.assertEqual(self.xp() - before, 50 + 20)
        m = JourneyMark.query.filter_by(user_id=self.user.id, step="kit").first()
        self.assertTrue(m.photo_id)
        self.assertEqual(self.t.get(f"/files/{m.photo_id}").status_code, 200)
        # нельзя отметить шаг, который засчитывает Connect
        self.assertEqual(self.t.post("/journey/fll/mark", data={"step": "team"}).status_code, 404)
        self.t.post("/journey/fll/mark", data={"step": "kit", "action": "undo"})
        self.assertEqual(self.xp(), before)

    def test_connect_link_flow(self):
        self.assertEqual(self.t.get("/connect/start").status_code, 302)
        with self.t.session_transaction() as s:
            state = s["connect_state"]
        good = sign({"p": PERSON, "name": "T", "email": None, "state": state, "exp": (time.time() + 120) * 1000})
        with mock.patch.object(connect, "fetch_journey", return_value=SNAPSHOT):
            r = self.t.get(f"/connect/callback?t={good}")
        self.assertEqual(r.status_code, 302)
        db.session.expire_all()
        u = db.session.get(User, self.user.id)
        self.assertEqual(u.connect_person_id, PERSON)
        self.assertEqual(connect.region_of(u), "Алматы")
        refs = {e.ref for e in XpEvent.query.filter_by(user_id=u.id)}
        for step in ("connect", "fll:team", "fll:roster", "fll:registered", "fll:scrimmage", "fll:qual-approved",
                     "fll:qual-played", "fll:award", "fll:advanced"):
            self.assertIn(f"step:{step}" if step == "connect" else f"step:{step}", refs)
        self.assertNotIn("step:fll:nat-played", refs)
        badges = {b.code for b in UserBadge.query.filter_by(user_id=u.id)}
        self.assertTrue({"connected", "team", "first-event", "award", "advanced"} <= badges)
        # ссылку нельзя использовать второй раз (state снят из сессии) и с чужим state
        self.t.get(f"/connect/callback?t={good}")
        bad = sign({"p": PERSON, "name": "T", "state": "other-state-123456789", "exp": (time.time() + 120) * 1000})
        self.assertIsNone(connect.verify_link(bad, "mine-state-123456789"))
        expired = sign({"p": PERSON, "state": "s" * 20, "exp": (time.time() - 1) * 1000})
        self.assertIsNone(connect.verify_link(expired, "s" * 20))
        self.assertIsNone(connect.verify_link(good[:-2] + "xx", state))
        # отключение убирает опыт за шаги из Connect
        self.t.post("/connect/unlink")
        self.assertFalse(XpEvent.query.filter(XpEvent.user_id == u.id, XpEvent.ref.like("step:fll:%")).count())

    def test_same_person_cannot_link_twice(self):
        other = User.query.filter_by(email="teacher2@academy.demo").first()
        other.connect_person_id = PERSON
        db.session.commit()
        self.t.get("/connect/start")
        with self.t.session_transaction() as s:
            state = s["connect_state"]
        tok = sign({"p": PERSON, "state": state, "exp": (time.time() + 120) * 1000})
        self.t.get(f"/connect/callback?t={tok}")
        db.session.expire_all()
        self.assertIsNone(db.session.get(User, self.user.id).connect_person_id)

    def test_leaderboard_region_and_hidden(self):
        a = self.user
        b = User.query.filter_by(email="teacher2@academy.demo").first()
        a.region, b.region = "Алматы", "Астана"
        db.session.add_all([SimSolve(user_id=a.id, preset="spike-first"), SimSolve(user_id=b.id, preset="spike-first"),
                            SimSolve(user_id=b.id, preset="spike-line")])
        db.session.commit()
        game.refresh(a, sync_connect=False)
        game.refresh(b, sync_connect=False)
        rows = game.leaderboard()
        self.assertEqual([r["user"].id for r in rows[:2]], [b.id, a.id])
        self.assertEqual([r["user"].id for r in game.leaderboard("Алматы")], [a.id])
        b.leaderboard_hidden = True
        db.session.commit()
        self.assertNotIn(b.id, [r["user"].id for r in game.leaderboard()])
        page = self.t.get("/leaderboard?region=Алматы").get_data(as_text=True)
        self.assertIn(a.full_name, page)

    def test_streak_and_ranks(self):
        now = utcnow()
        for i, d in enumerate((0, 1, 2, 5)):
            db.session.add(XpEvent(user_id=self.user.id, ref=f"x:{i}", kind="bonus", xp=10, created_at=now - timedelta(days=d)))
        db.session.commit()
        self.assertEqual(game.streak(self.user, now.date()), (3, 3))
        self.assertEqual(game.rank_of(0)["level"], 1)
        self.assertEqual(game.rank_of(300)["level"], 2)
        self.assertIsNone(game.rank_of(99999)["next"])

    def test_track_definitions(self):
        from app.blueprints.game import known_preset
        for code, tr in TRACKS.items():
            codes = [s["code"] for _, s in all_steps(tr)]
            self.assertEqual(len(codes), len(set(codes)), code)
            for _, s in all_steps(tr):
                self.assertTrue(s["title"]["ru"] and s["title"]["kk"] and s["title"]["en"], s["code"])
                if s["kind"] == "sim":
                    self.assertTrue(known_preset(s["preset"]), s["preset"])
                for lang in ("ru",):
                    self.assertNotRegex(json.dumps(s, ensure_ascii=False), "[ёЁ—]")
