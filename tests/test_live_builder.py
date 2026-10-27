"""Конструктор эфиров: список, создание и копия, настройки, вставка вопросов, порядок, предпросмотр, права."""
from tests.base import AppTestCase

from app.models import LiveEvent, LiveQuestion
from app.services import live as svc
from app.services import live_builder as lb


class LiveBuilderTest(AppTestCase):
    def setUp(self):
        super().setUp()
        svc.ensure_events()
        svc._cache.clear()
        self.ev = LiveEvent.query.filter_by(slug="keleshek").first()
        self.m = self.new_client("methodist@academy.demo")

    def _new(self, **kw):
        body = {"title": "FIRST LEGO League с нуля", "starts_at": "2026-11-03T11:00"}
        body.update(kw)
        r = self.m.post("/live/new", json=body)
        self.assertEqual(r.status_code, 200, r.get_data(as_text=True))
        return LiveEvent.query.filter_by(slug=r.get_json()["slug"]).first()

    def test_access(self):
        teacher = self.new_client("teacher1@academy.demo")
        self.assertEqual(teacher.get("/live/").status_code, 403)
        self.assertEqual(teacher.post("/live/new", json={"title": "x"}).status_code, 403)
        self.assertEqual(teacher.get("/live/keleshek/build").status_code, 403)
        r = self.m.get("/live/")
        self.assertEqual(r.status_code, 200)
        self.assertIn("/live/keleshek/build", r.get_data(as_text=True))

    def test_keleshek_program_seeded_and_kept(self):
        self.assertEqual(len(self.ev.blocks), 4)
        self.assertIn("ҰБА", self.ev.texts["partners"])
        lb.save_settings(self.ev, {"title": {"kk": "Жаңа атау", "ru": "Новое название"}})
        svc.ensure_events()  # перезапуск не затирает правки конструктора
        self.assertEqual(LiveEvent.query.get(self.ev.id).title["ru"], "Новое название")

    def test_create_blank_and_copy(self):
        ev = self._new()
        self.assertEqual(ev.title, {"ru": "FIRST LEGO League с нуля"})  # язык по буквам названия
        self.assertEqual(ev.slug, "first-lego-league-s-nulya")
        self.assertEqual(ev.starts_at.hour, 11)
        self.assertEqual(len(ev.blocks), 1)
        self.assertNotEqual(ev.screen_key, self.ev.screen_key)
        self.assertEqual(self.m.get(f"/live/{ev.slug}/build").status_code, 200)
        cp = self._new(title="Келешек Лигасы · екінші семинар", copy="keleshek")
        self.assertEqual(cp.title, {"kk": "Келешек Лигасы · екінші семинар"})
        self.assertEqual(len(cp.blocks), 4)
        self.assertEqual(LiveQuestion.query.filter_by(event_id=cp.id).count(),
                         LiveQuestion.query.filter_by(event_id=self.ev.id).count())
        self.assertNotIn("kicker", cp.texts)  # подпись с датой у копии своя
        no_q = self._new(title="Без вопросов", copy="keleshek", with_questions=0)
        self.assertEqual(LiveQuestion.query.filter_by(event_id=no_q.id).count(), 0)
        self.assertEqual(self.m.post("/live/new", json={"title": ""}).status_code, 400)

    def test_settings(self):
        ev = self._new()
        base = f"/live/{ev.slug}/build/save"
        r = self.m.post(base, json={"youtube": "https://youtube.com/live/gBcYDPseS-w?si=x", "lang": "ru",
                                    "subtitle": {"ru": "Подзаголовок"}, "partners": "USTEM × Партнер",
                                    "links": {"connect": "connect.ustem.kz/register", "bot": ""},
                                    "blocks": [{"ru": "Начало"}, {"ru": "FLL"}]})
        self.assertTrue(r.get_json()["ok"], r.get_json())
        ev = LiveEvent.query.get(ev.id)
        self.assertEqual((ev.youtube_id, ev.lang, ev.texts["partners"]), ("gBcYDPseS-w", "ru", "USTEM × Партнер"))
        self.assertEqual(ev.links, {"connect": "https://connect.ustem.kz/register"})
        self.assertEqual(len(ev.blocks), 2)
        self.assertEqual(self.m.post(base, json={"youtube": "not a link"}).status_code, 400)
        self.assertEqual(self.m.post(base, json={"slug": "Bad Slug!"}).status_code, 400)
        self.assertEqual(self.m.post(base, json={"slug": "keleshek"}).status_code, 400)
        r = self.m.post(base, json={"slug": "fll-1103"})
        self.assertEqual(r.get_json()["data"]["slug"], "fll-1103")
        self.assertEqual(self.m.get("/live/fll-1103/build").status_code, 200)
        # экран: подпись с датой собирается сама, финал и бот из настроек
        html = self.m.get("/live/fll-1103/screen?lang=ru").get_data(as_text=True)
        self.assertIn("USTEM × Партнер · Вебинар · 3 ноября 2026", html)
        self.assertNotIn("UstemConnectBot", html)

    def test_slug_locked_after_viewers(self):
        teacher = self.new_client("teacher1@academy.demo")
        teacher.get("/live/keleshek")
        r = self.m.post("/live/keleshek/build/save", json={"slug": "keleshek-1"})
        self.assertEqual(r.status_code, 400)
        self.assertEqual(self.m.post("/live/keleshek/build/delete", json={"confirm": "keleshek"}).status_code, 400)

    def test_paste_reorder_delete(self):
        ev = self._new()
        text = ("# Что такое FLL\n1. Сколько лет детям?\n- 6-9\n+ 9-16\n- 16-18\n> Для 9-16 лет.\n\n"
                "2) Кто основал FIRST?\na) Илон Маск\nb) Дин Кеймен (верно)\n\n# Команда\nСколько детей в команде?\n- 5\n* 10\n"
                "Плохой вопрос без вариантов\n")
        d = self.m.post(f"/live/{ev.slug}/build/paste", json={"text": text, "dry": 1}).get_json()
        self.assertEqual(len(d["items"]), 3)
        self.assertEqual(d["blocks"], ["Что такое FLL", "Команда"])
        r = self.m.post(f"/live/{ev.slug}/build/paste", json={"text": text, "lang": "ru"}).get_json()
        self.assertEqual(r["added"], 3)
        ev = LiveEvent.query.get(ev.id)
        self.assertEqual([b["ru"] for b in ev.blocks], ["Что такое FLL", "Команда"])  # пустой блок по умолчанию заменен
        qs = LiveQuestion.query.filter_by(event_id=ev.id).order_by(LiveQuestion.position).all()
        self.assertEqual([(q.block, q.correct, len(q.options)) for q in qs], [(1, 1, 3), (1, 1, 2), (2, 1, 2)])
        self.assertEqual(qs[0].note, {"ru": "Для 9-16 лет."})
        # перетаскивание: последний вопрос наверх и в первый блок
        self.m.post(f"/live/{ev.slug}/build/reorder", json={"ids": [qs[2].id, qs[0].id, qs[1].id], "blocks": {str(qs[2].id): 1}})
        order = LiveQuestion.query.filter_by(event_id=ev.id).order_by(LiveQuestion.position).all()
        self.assertEqual([(q.id, q.block) for q in order], [(qs[2].id, 1), (qs[0].id, 1), (qs[1].id, 1)])
        # блок с вопросами удалить нельзя
        self.m.post(f"/live/{ev.slug}/build/reorder", json={"ids": [], "blocks": {str(qs[2].id): 2}})
        self.assertEqual(self.m.post(f"/live/{ev.slug}/build/save", json={"blocks": [{"ru": "Один"}]}).status_code, 400)
        # предпросмотр сцены с вопросом
        html = self.m.get(f"/live/{ev.slug}/screen?demo=reveal&qid={qs[0].id}&lang=ru").get_data(as_text=True)
        self.assertIn(qs[0].text["ru"].encode("unicode_escape").decode()[:20].lower(), html.lower())
        self.assertIn('"mode": "reveal"', html)
        key_html = self.client.get(f"/live/{ev.slug}/screen?key={ev.screen_key}&demo=reveal").get_data(as_text=True)
        self.assertIn("DEMO = null", key_html)  # по ключу OBS только живой эфир
        # QR и удаление
        self.assertIn("image/svg", self.m.get(f"/live/{ev.slug}/qr.svg").headers["Content-Type"])
        self.assertEqual(self.m.post(f"/live/{ev.slug}/build/delete", json={"confirm": "x"}).status_code, 400)
        r = self.m.post(f"/live/{ev.slug}/build/delete", json={"confirm": ev.slug})
        self.assertTrue(r.get_json()["ok"])
        self.assertIsNone(LiveEvent.query.filter_by(id=ev.id).first())
        self.assertEqual(LiveQuestion.query.filter_by(event_id=ev.id).count(), 0)

    def test_readiness_and_archive(self):
        ev = self._new()
        ready = {r["key"]: r["ok"] for r in lb.readiness(ev)}
        self.assertEqual(ready, {"title": False, "date": True, "youtube": False, "questions": False, "translate": True})
        self.m.post(f"/live/{ev.slug}/build/save", json={"archived": True})
        self.assertTrue(LiveEvent.query.get(ev.id).archived)
        self.assertIn("data-arch", self.m.get("/live/").get_data(as_text=True))

    def test_ai_off_without_key(self):
        ev = self._new()
        self.assertEqual(self.m.post(f"/live/{ev.slug}/build/translate").status_code, 400)
        self.assertEqual(self.m.post(f"/live/{ev.slug}/build/ai", data={"text": "x" * 100}).status_code, 400)

    def test_ai_with_fake_model(self):
        import json
        from unittest import mock
        ev = self._new()
        self.app.config["ANTHROPIC_API_KEY"] = "test"

        class Block:
            type = "text"

            def __init__(self, text):
                self.text = text

        def fake(reply):
            client = mock.Mock()
            client.messages.create.return_value = mock.Mock(content=[Block(reply)])
            return mock.patch.object(lb, "_client", return_value=client)
        items = [{"text": {"kk": "Сұрақ?", "ru": "Вопрос?"}, "options": [{"kk": "a", "ru": "a"}, {"kk": "b", "ru": "b"},
                  {"kk": "c", "ru": "c"}, {"kk": "d", "ru": "d"}], "correct": 2, "note": {"kk": "Себебі", "ru": "Потому"}},
                 {"text": {"ru": "Плохой"}, "options": [{"ru": "a"}], "correct": 5}]
        with fake("Вот:\n```json\n" + json.dumps(items, ensure_ascii=False) + "\n```"):
            r = self.m.post(f"/live/{ev.slug}/build/ai", data={"text": "Материал вебинара. " * 10, "count": "5"}).get_json()
        self.assertEqual(len(r["items"]), 1)
        r = self.m.post(f"/live/{ev.slug}/build/add", json={"items": r["items"], "block": 1}).get_json()
        self.assertEqual(r["added"], 1)
        q = LiveQuestion.query.filter_by(event_id=ev.id).first()
        self.assertEqual((q.correct, q.text["kk"]), (2, "Сұрақ?"))
        # перевод: дописывает только пустой язык, «ё» и длинное тире убираются
        lb.save_settings(ev, {"subtitle": {"ru": "Как начать"}})
        pack = {"title": {"ru": "FIRST LEGO League с нуля", "kk": "FIRST LEGO League нөлден"}, "subtitle": {"ru": "Как начать", "kk": "Қалай бастау"},
                "blocks": [{"kk": "Негізгі бөлім", "ru": "Основная — часть ё"}], "kicker": {}, "finish": {}, "questions": []}
        with fake(json.dumps(pack, ensure_ascii=False)):
            r = self.m.post(f"/live/{ev.slug}/build/translate").get_json()
        self.assertTrue(r["ok"], r)
        ev = LiveEvent.query.get(ev.id)
        self.assertEqual(ev.title["kk"], "FIRST LEGO League нөлден")
        self.assertEqual(ev.subtitle, {"ru": "Как начать", "kk": "Қалай бастау"})
        self.assertEqual(ev.blocks[0]["ru"], "Основная часть")  # уже заполненное не меняется
