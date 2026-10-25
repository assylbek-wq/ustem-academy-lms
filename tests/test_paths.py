"""Пути «Мой путь»: выбор путей, пути курсов, сезон WSO из Connect, конструктор в Студии, рейтинг по пути."""
import json

from tests.base import AppTestCase

from app.game import paths as gpaths
from app.models import JourneyPath, Program, SimSolve, User, UserPath, db
from app.services import game


class PathsTest(AppTestCase):
    def setUp(self):
        super().setUp()
        self.t = self.new_client("teacher1@academy.demo")
        self.user = User.query.filter_by(email="teacher1@academy.demo").first()

    def test_setup_flow_and_course_paths(self):
        # без выбора путей и без Connect - сначала выбор
        r = self.t.get("/journey")
        self.assertIn("/journey/setup", r.headers["Location"])
        page = self.t.get("/journey/setup").get_data(as_text=True)
        self.assertIn("World Space Olympiad", page)
        # курсы, на которые тренер записан, уже есть как пути
        mine = gpaths.for_user(self.user)
        self.assertTrue(mine and all(p["kind"] == "course" for p in mine))
        course = mine[0]
        self.assertEqual(self.t.get(f"/journey/{course['key']}").status_code, 200)
        # выбирает FTC: путь появляется, курсовые остаются
        self.t.post("/journey/setup", data={"path": ["ftc", "nope"]})
        keys = [p["key"] for p in gpaths.for_user(self.user)]
        self.assertIn("ftc", keys)
        self.assertIn(course["key"], keys)
        self.assertEqual(UserPath.query.filter_by(user_id=self.user.id).count(), 1)
        self.assertEqual(self.t.get("/journey").status_code, 302)
        # передумал - снимает
        self.t.post("/journey/setup", data={"courses_only": "1"})
        self.assertNotIn("ftc", [p["key"] for p in gpaths.for_user(self.user)])

    def test_course_path_counts_lessons(self):
        prog = Program.query.filter_by(status="published").first()
        path = gpaths.from_course(prog)
        self.assertEqual(len(path["stages"]), len(prog.levels))
        last = path["stages"][0]["steps"][-1]
        self.assertEqual((last["kind"], last["level"]), ("course", 1))
        state = game.track_state(self.user, path)
        self.assertEqual(state["done"], sum(1 for s in state["stages"] for x in s["steps"] if x["done"]))

    def test_wso_path_from_connect_category(self):
        self.user.connect_person_id = "0b5f8e0a-1111-4222-8333-944455556666"
        self.user.connect_snapshot = {"person": {}, "teams": [{"program": "WSO_CANSAT", "is_current": True, "status": "draft",
            "students": 4, "registrations": [{"status": "approved", "kind": "national", "awards": [], "starts_at": "2026-12-01T05:00:00Z"}]}]}
        db.session.commit()
        mine = gpaths.for_user(self.user)
        self.assertEqual(mine[0]["key"], "wso")  # программа команды из Connect идет первой
        state = game.track_state(self.user, gpaths.get("wso"))
        done = {s["code"] for st in state["stages"] for s in st["steps"] if s["done"]}
        self.assertTrue({"team", "approved"} <= done)
        self.assertEqual(self.t.get("/journey").headers["Location"].rsplit("/", 1)[1], "wso")
        board = game.leaderboard(path=gpaths.get("wso"), limit=None)
        game.refresh(self.user, sync_connect=False)
        self.assertIn(self.user.id, [r["user"].id for r in game.leaderboard(path=gpaths.get("wso"), limit=None)])
        self.assertIsInstance(board, list)

    def test_leaderboard_by_path(self):
        other = User.query.filter_by(email="teacher2@academy.demo").first()
        for u in (self.user, other):
            db.session.add(SimSolve(user_id=u.id, preset="spike-first"))
        db.session.add(UserPath(user_id=other.id, key="fll"))
        db.session.commit()
        for u in (self.user, other):
            game.refresh(u, sync_connect=False)
        ids = [r["user"].id for r in game.leaderboard(path=gpaths.get("fll"), limit=None)]
        self.assertEqual(ids, [other.id])
        self.assertEqual(self.t.get("/leaderboard?path=fll").status_code, 200)


class PathStudioTest(AppTestCase):
    def test_methodist_builds_and_publishes_path(self):
        m = self.new_client("methodist@academy.demo")
        self.assertEqual(m.get("/studio/paths").status_code, 200)
        r = m.post("/studio/paths", data={"slug": "drone-league", "title": "Alem Drone League"})
        p = JourneyPath.query.filter_by(slug="drone-league").first()
        self.assertTrue(p and r.headers["Location"].endswith(f"/studio/paths/{p.id}"))
        self.assertEqual(m.get(f"/studio/paths/{p.id}").status_code, 200)
        course = Program.query.filter_by(status="published").first().slug
        stages = [
            {"title": {"ru": "Старт"}, "icon": "flag", "steps": [
                {"kind": "connect", "rule": "linked", "title": {"ru": "Подключить Connect"}, "xp": 100},
                {"kind": "self", "title": {"ru": "Собрать дрон"}, "xp": 80, "photo": True},
                {"kind": "course", "course": course, "level": 1, "title": {"ru": "Уровень 1"}},
                {"kind": "sim", "preset": "spike-first", "title": {"ru": "Первая программа"}}]},
            {"title": {"ru": "Турнир"}, "icon": "trophy", "steps": [
                {"kind": "connect", "rule": "played", "kinds": ["regional", "bogus"], "title": {"ru": "Выступили"}, "xp": 300}]},
        ]
        r = m.post(f"/studio/paths/{p.id}", data={"title_ru": "Alem Drone League", "subtitle_ru": "Сезон 2027", "kind": "season",
                                                   "programs": "alem_drone_league, bad code", "color": "#123456",
                                                   "stages": json.dumps(stages)})
        db.session.refresh(p)
        self.assertEqual(p.programs, ["ALEM_DRONE_LEAGUE"])
        self.assertEqual(p.stages[0]["steps"][0]["code"], "connect")
        self.assertEqual(p.stages[1]["steps"][0]["kinds"], ["regional"])
        self.assertEqual(p.color, "#123456")
        # плохое задание симулятора не сохраняется
        bad = [{"title": {"ru": "X"}, "steps": [{"kind": "sim", "preset": "spike-nope", "title": {"ru": "?"}}]}]
        m.post(f"/studio/paths/{p.id}", data={"title_ru": "Alem Drone League", "stages": json.dumps(bad)})
        db.session.refresh(p)
        self.assertEqual(len(p.stages), 2)
        # черновик не виден тренерам, после публикации - виден
        t = self.new_client("teacher1@academy.demo")
        self.assertEqual(t.get("/journey/drone-league").status_code, 404)
        self.assertEqual(m.get("/journey/drone-league").status_code, 200)  # методист смотрит черновик
        m.post(f"/studio/paths/{p.id}", data={"action": "publish"})
        self.assertEqual(t.get("/journey/drone-league").status_code, 200)
        t.post("/journey/drone-league/mark", data={"step": "s1-2"})
        # путь с отметками не удаляется
        m.post(f"/studio/paths/{p.id}", data={"action": "delete"})
        self.assertTrue(db.session.get(JourneyPath, p.id))
        self.assertEqual(t.get("/studio/paths").status_code, 403)
