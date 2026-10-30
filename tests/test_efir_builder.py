"""Конструктор эфиров: список, создание и копия, настройки, вставка вопросов, порядок, предпросмотр, права."""
from tests.base import AppTestCase

from app.models import EfirEvent, EfirQuestion
from app.services import efir as svc
from app.services import live as live_svc
from app.services import efir_builder as lb


class EfirBuilderTest(AppTestCase):
    def setUp(self):
        super().setUp()
        live_svc.ensure_events()
        svc._cache.clear()
        from app.models import LiveEvent
        from app.services import efir_builder
        self.ev = efir_builder.import_live(LiveEvent.query.filter_by(slug="keleshek1").first(), None, slug="keleshek")
        self.m = self.new_client("methodist@academy.demo")

    def _new(self, **kw):
        body = {"title": "FIRST LEGO League с нуля", "starts_at": "2026-11-03T11:00"}
        body.update(kw)
        r = self.m.post("/efir/new", json=body)
        self.assertEqual(r.status_code, 200, r.get_data(as_text=True))
        return EfirEvent.query.filter_by(slug=r.get_json()["slug"]).first()

    def test_access(self):
        teacher = self.new_client("teacher1@academy.demo")
        self.assertEqual(teacher.get("/efir/").status_code, 403)
        self.assertEqual(teacher.post("/efir/new", json={"title": "x"}).status_code, 403)
        self.assertEqual(teacher.get("/efir/keleshek/build").status_code, 403)
        r = self.m.get("/efir/")
        self.assertEqual(r.status_code, 200)
        self.assertIn("/efir/keleshek/build", r.get_data(as_text=True))

    def test_keleshek_program_seeded_and_kept(self):
        self.assertEqual(len(self.ev.blocks), 4)
        self.assertIn("ҰБА", self.ev.texts["partners"])
        lb.save_settings(self.ev, {"title": {"kk": "Жаңа атау", "ru": "Новое название"}})
        svc.ensure_events()  # перезапуск не затирает правки конструктора
        self.assertEqual(EfirEvent.query.get(self.ev.id).title["ru"], "Новое название")

    def test_create_blank_and_copy(self):
        ev = self._new()
        self.assertEqual(ev.title, {"ru": "FIRST LEGO League с нуля"})  # язык по буквам названия
        self.assertEqual(ev.slug, "first-lego-league-s-nulya")
        self.assertEqual(ev.starts_at.hour, 11)
        self.assertEqual(len(ev.blocks), 1)
        self.assertNotEqual(ev.screen_key, self.ev.screen_key)
        self.assertEqual(self.m.get(f"/efir/{ev.slug}/build").status_code, 200)
        cp = self._new(title="Келешек Лигасы · екінші семинар", copy="keleshek")
        self.assertEqual(cp.title, {"kk": "Келешек Лигасы · екінші семинар"})
        self.assertEqual(len(cp.blocks), 4)
        self.assertEqual(EfirQuestion.query.filter_by(event_id=cp.id).count(),
                         EfirQuestion.query.filter_by(event_id=self.ev.id).count())
        self.assertNotIn("kicker", cp.texts)  # подпись с датой у копии своя
        no_q = self._new(title="Без вопросов", copy="keleshek", with_questions=0)
        self.assertEqual(EfirQuestion.query.filter_by(event_id=no_q.id).count(), 0)
        self.assertEqual(self.m.post("/efir/new", json={"title": ""}).status_code, 400)

    def test_settings(self):
        ev = self._new()
        base = f"/efir/{ev.slug}/build/save"
        r = self.m.post(base, json={"youtube": "https://youtube.com/live/gBcYDPseS-w?si=x", "lang": "ru",
                                    "subtitle": {"ru": "Подзаголовок"}, "partners": "USTEM × Партнер",
                                    "links": {"connect": "connect.ustem.kz/register", "bot": ""},
                                    "blocks": [{"ru": "Начало"}, {"ru": "FLL"}]})
        self.assertTrue(r.get_json()["ok"], r.get_json())
        ev = EfirEvent.query.get(ev.id)
        self.assertEqual((ev.youtube_id, ev.lang, ev.texts["partners"]), ("gBcYDPseS-w", "ru", "USTEM × Партнер"))
        self.assertEqual(ev.links, {"connect": "https://connect.ustem.kz/register"})
        self.assertEqual(len(ev.blocks), 2)
        self.assertEqual(self.m.post(base, json={"youtube": "not a link"}).status_code, 400)
        self.assertEqual(self.m.post(base, json={"slug": "Bad Slug!"}).status_code, 400)
        self.assertEqual(self.m.post(base, json={"slug": "keleshek"}).status_code, 400)
        r = self.m.post(base, json={"slug": "fll-1103"})
        self.assertEqual(r.get_json()["data"]["slug"], "fll-1103")
        self.assertEqual(self.m.get("/efir/fll-1103/build").status_code, 200)
        # экран: подпись с датой собирается сама, финал и бот из настроек
        html = self.m.get("/efir/fll-1103/screen?lang=ru").get_data(as_text=True)
        self.assertIn("USTEM × Партнер · Вебинар · 3 ноября 2026", html)
        self.assertNotIn("UstemConnectBot", html)

    def test_slug_locked_after_viewers(self):
        teacher = self.new_client("teacher1@academy.demo")
        teacher.get("/efir/keleshek")
        r = self.m.post("/efir/keleshek/build/save", json={"slug": "keleshek-1"})
        self.assertEqual(r.status_code, 400)
        self.assertEqual(self.m.post("/efir/keleshek/build/delete", json={"confirm": "keleshek"}).status_code, 400)

    def test_paste_reorder_delete(self):
        ev = self._new()
        text = ("# Что такое FLL\n1. Сколько лет детям?\n- 6-9\n+ 9-16\n- 16-18\n> Для 9-16 лет.\n\n"
                "2) Кто основал FIRST?\na) Илон Маск\nb) Дин Кеймен (верно)\n\n# Команда\nСколько детей в команде?\n- 5\n* 10\n"
                "Плохой вопрос без вариантов\n")
        d = self.m.post(f"/efir/{ev.slug}/build/paste", json={"text": text, "dry": 1}).get_json()
        self.assertEqual(len(d["items"]), 3)
        self.assertEqual(d["blocks"], ["Что такое FLL", "Команда"])
        r = self.m.post(f"/efir/{ev.slug}/build/paste", json={"text": text, "lang": "ru"}).get_json()
        self.assertEqual(r["added"], 3)
        ev = EfirEvent.query.get(ev.id)
        self.assertEqual([b["ru"] for b in ev.blocks], ["Что такое FLL", "Команда"])  # пустой блок по умолчанию заменен
        qs = EfirQuestion.query.filter_by(event_id=ev.id).order_by(EfirQuestion.position).all()
        self.assertEqual([(q.block, q.correct, len(q.options)) for q in qs], [(1, 1, 3), (1, 1, 2), (2, 1, 2)])
        self.assertEqual(qs[0].note, {"ru": "Для 9-16 лет."})
        # перетаскивание: последний вопрос наверх и в первый блок
        self.m.post(f"/efir/{ev.slug}/build/reorder", json={"ids": [qs[2].id, qs[0].id, qs[1].id], "blocks": {str(qs[2].id): 1}})
        order = EfirQuestion.query.filter_by(event_id=ev.id).order_by(EfirQuestion.position).all()
        self.assertEqual([(q.id, q.block) for q in order], [(qs[2].id, 1), (qs[0].id, 1), (qs[1].id, 1)])
        # блок с вопросами удалить нельзя
        self.m.post(f"/efir/{ev.slug}/build/reorder", json={"ids": [], "blocks": {str(qs[2].id): 2}})
        self.assertEqual(self.m.post(f"/efir/{ev.slug}/build/save", json={"blocks": [{"ru": "Один"}]}).status_code, 400)
        # предпросмотр сцены с вопросом
        html = self.m.get(f"/efir/{ev.slug}/screen?demo=reveal&qid={qs[0].id}&lang=ru").get_data(as_text=True)
        self.assertIn(qs[0].text["ru"].encode("unicode_escape").decode()[:20].lower(), html.lower())
        self.assertIn('"mode": "reveal"', html)
        key_html = self.client.get(f"/efir/{ev.slug}/screen?key={ev.screen_key}&demo=reveal").get_data(as_text=True)
        self.assertIn("DEMO = null", key_html)  # по ключу OBS только живой эфир
        # QR и удаление
        self.assertIn("image/svg", self.m.get(f"/efir/{ev.slug}/qr.svg").headers["Content-Type"])
        self.assertEqual(self.m.post(f"/efir/{ev.slug}/build/delete", json={"confirm": "x"}).status_code, 400)
        r = self.m.post(f"/efir/{ev.slug}/build/delete", json={"confirm": ev.slug})
        self.assertTrue(r.get_json()["ok"])
        self.assertIsNone(EfirEvent.query.filter_by(id=ev.id).first())
        self.assertEqual(EfirQuestion.query.filter_by(event_id=ev.id).count(), 0)

    def test_readiness_and_archive(self):
        ev = self._new()
        ready = {r["key"]: r["ok"] for r in lb.readiness(ev)}
        self.assertEqual(ready, {"title": False, "date": True, "youtube": False, "questions": False, "translate": True})
        self.m.post(f"/efir/{ev.slug}/build/save", json={"archived": True})
        self.assertTrue(EfirEvent.query.get(ev.id).archived)
        self.assertIn("data-arch", self.m.get("/efir/").get_data(as_text=True))

    def test_ai_off_without_key(self):
        ev = self._new()
        self.assertEqual(self.m.post(f"/efir/{ev.slug}/build/translate").status_code, 400)
        self.assertEqual(self.m.post(f"/efir/{ev.slug}/build/ai", data={"text": "x" * 100}).status_code, 400)

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
            r = self.m.post(f"/efir/{ev.slug}/build/ai", data={"text": "Материал вебинара. " * 10, "count": "5"}).get_json()
        self.assertEqual(len(r["items"]), 1)
        r = self.m.post(f"/efir/{ev.slug}/build/add", json={"items": r["items"], "block": 1}).get_json()
        self.assertEqual(r["added"], 1)
        q = EfirQuestion.query.filter_by(event_id=ev.id).first()
        self.assertEqual((q.correct, q.text["kk"]), (2, "Сұрақ?"))
        # перевод: дописывает только пустой язык, «ё» и длинное тире убираются
        lb.save_settings(ev, {"subtitle": {"ru": "Как начать"}})
        pack = {"title": {"ru": "FIRST LEGO League с нуля", "kk": "FIRST LEGO League нөлден"}, "subtitle": {"ru": "Как начать", "kk": "Қалай бастау"},
                "blocks": [{"kk": "Негізгі бөлім", "ru": "Основная — часть ё"}], "kicker": {}, "finish": {}, "questions": []}
        with fake(json.dumps(pack, ensure_ascii=False)):
            r = self.m.post(f"/efir/{ev.slug}/build/translate").get_json()
        self.assertTrue(r["ok"], r)
        ev = EfirEvent.query.get(ev.id)
        self.assertEqual(ev.title["kk"], "FIRST LEGO League нөлден")
        self.assertEqual(ev.subtitle, {"ru": "Как начать", "kk": "Қалай бастау"})
        self.assertEqual(ev.blocks[0]["ru"], "Основная часть")  # уже заполненное не меняется

    def test_deck(self):
        from fpdf import FPDF
        from app.services import efir_deck
        pdf = FPDF(orientation="L", unit="pt", format=(1080, 1920))
        for i in range(3):
            pdf.add_page()
            pdf.set_font("Helvetica", "B", 80)
            pdf.cell(0, 200, f"Slide {i + 1}")
        data = bytes(pdf.output())
        ev = self._new()
        import io
        r = self.m.post(f"/efir/{ev.slug}/build/deck/upload", data={"pdf": (io.BytesIO(data), "deck.pdf")},
                        content_type="multipart/form-data").get_json()
        self.assertEqual(r["added"], 3, r)
        slides = r["deck"]["slides"]
        self.assertEqual((slides[0]["w"], slides[0]["layout"]), (1920, "side"))
        self.assertEqual(self.m.post(f"/efir/{ev.slug}/build/deck/upload", data={"pdf": (io.BytesIO(b"nope"), "x.pdf")},
                                     content_type="multipart/form-data").status_code, 400)
        # картинки: команде и экрану по ключу, остальным нет
        img = f"/efir/{ev.slug}/slides/{slides[0]['id']}.jpg"
        self.assertEqual(self.m.get(img).mimetype, "image/jpeg")
        self.assertEqual(self.client.get(img).status_code, 404)
        self.assertEqual(self.client.get(img + f"?key={ev.screen_key}").status_code, 200)
        self.assertEqual(self.m.get(f"/efir/{ev.slug}/slides/..%2Fx.jpg").status_code, 404)
        # раскладка, QR, порядок, удаление
        ids = [s["id"] for s in slides]
        r = self.m.post(f"/efir/{ev.slug}/build/deck", json={"cam": "br", "slides": [
            {"id": ids[2], "layout": "cam", "qr": {"on": True, "to": "url", "url": "forms.gle/abc", "label": "Анкета", "pos": "bl"}},
            {"id": ids[0], "layout": "full", "qr": {"on": True, "to": "connect"}}]}).get_json()
        d = r["deck"]
        self.assertEqual([s["id"] for s in d["slides"]], [ids[2], ids[0]])
        self.assertEqual(d["cam"], "br")
        self.assertEqual(d["slides"][0]["qr"]["url"], "https://forms.gle/abc")
        folder = efir_deck.folder(EfirEvent.query.get(ev.id))
        self.assertFalse((folder / f"{ids[1]}.jpg").exists())
        # скачивание: PDF и PNG с прозрачным окном камеры
        r = self.m.get(f"/efir/{ev.slug}/build/deck/export.pdf")
        self.assertEqual((r.status_code, r.mimetype), (200, "application/pdf"))
        self.assertTrue(r.data.startswith(b"%PDF"))
        r = self.m.get(f"/efir/{ev.slug}/build/deck/export.zip")
        import zipfile
        from PIL import Image
        z = zipfile.ZipFile(io.BytesIO(r.data))
        self.assertEqual(z.namelist(), ["slide-01.png", "slide-02.png"])
        open(self.upload_dir + "/s1.png", "wb").write(z.read("slide-01.png")) if isinstance(self.upload_dir, str) else None
        im = Image.open(io.BytesIO(z.read("slide-01.png")))
        self.assertEqual(im.size, (1920, 1080))
        self.assertEqual(im.getpixel((1484 + 196, 540 + 196))[3], 0)   # окно камеры внизу справа прозрачное
        self.assertEqual(im.getpixel((300, 500))[3], 255)
        im2 = Image.open(io.BytesIO(z.read("slide-02.png")))
        self.assertEqual(im2.getpixel((1680, 700))[3], 255)  # full: без окна
        self.assertEqual(self.client.get(f"/efir/{ev.slug}/build/deck/export.zip").status_code, 302)
        # пульт: слайды
        r = self.m.post(f"/efir/{ev.slug}/control/state", json={"mode": "slides", "slide": 5}).get_json()
        self.assertEqual(r["state"]["slide"], 1)
        self.assertIn("sl-strip", self.m.get(f"/efir/{ev.slug}/control").get_data(as_text=True))
        # экран получает презентацию, когда версия изменилась, с готовыми QR
        svc._cache.clear()
        j = self.client.get(f"/efir/{ev.slug}/screen.json?key={ev.screen_key}&dv=0").get_json()
        self.assertEqual(j["state"]["mode"], "slides")
        self.assertEqual(len(j["deck"]["slides"]), 2)
        self.assertIn("<svg", j["deck"]["slides"][0]["qr"]["svg"])
        self.assertEqual(j["deck"]["slides"][1]["qr"]["show"], "connect.ustem.kz/register")
        self.assertEqual(j["deck"]["cam"]["y"], 540)
        j2 = self.client.get(f"/efir/{ev.slug}/screen.json?key={ev.screen_key}&dv={j['deck']['v']}").get_json()
        self.assertNotIn("deck", j2)
        # «Слайд + 2 камеры»: два прозрачных окна справа, слайд слева, экран получает оба окна
        self.m.post(f"/efir/{ev.slug}/build/deck", json={"slides": [{"id": ids[2], "layout": "duo", "qr": {"on": True, "to": "watch", "pos": "br"}},
                                                                    {"id": ids[0], "layout": "full"}]})
        z = zipfile.ZipFile(io.BytesIO(self.m.get(f"/efir/{ev.slug}/build/deck/export.zip").data))
        im = Image.open(io.BytesIO(z.read("slide-01.png")))
        self.assertEqual(im.getpixel((1484 + 196, 148 + 196))[3], 0)    # верхнее окно
        self.assertEqual(im.getpixel((1484 + 196, 564 + 196))[3], 0)    # нижнее окно
        self.assertEqual(im.getpixel((1484 + 196, 556))[3], 255)        # между окнами рамка
        self.assertEqual(im.getpixel((300, 500))[3], 255)
        svc._cache.clear()
        j = self.client.get(f"/efir/{ev.slug}/screen.json?key={ev.screen_key}&dv=0").get_json()
        self.assertEqual(j["deck"]["slides"][0]["layout"], "duo")
        self.assertEqual([c["y"] for c in j["deck"]["cam2"]], [148, 564])
        self.assertEqual(self.m.get(f"/efir/{ev.slug}/build/deck/export.pdf").status_code, 200)
        # копия эфира получает свои файлы, удаление эфира убирает папку
        cp = self._new(title="Копия", copy=ev.slug)
        self.assertEqual(len(efir_deck.get(cp)["slides"]), 2)
        self.assertTrue((efir_deck.folder(cp) / f"{ids[2]}.jpg").exists())
        self.m.post(f"/efir/{ev.slug}/build/deck", json={"slides": []})
        self.assertEqual(EfirEvent.query.get(ev.id).state["mode"], "talk")
        self.m.post(f"/efir/{cp.slug}/build/delete", json={"confirm": cp.slug})
        self.assertFalse(folder.parent.joinpath(str(cp.id)).exists())

    def test_youtube_cover(self):
        import io
        from PIL import Image
        ev = self._new()
        r = self.m.get(f"/efir/{ev.slug}/youtube-cover.jpg?lang=ru&dl=1")
        self.assertEqual((r.status_code, r.mimetype), (200, "image/jpeg"))
        self.assertIn("attachment", r.headers["Content-Disposition"])
        im = Image.open(io.BytesIO(r.data))
        self.assertEqual(im.size, (1280, 720))
        self.assertLess(len(r.data), 2 * 1024 * 1024)
        b = io.BytesIO()
        Image.new("RGB", (600, 900), (200, 150, 120)).save(b, "JPEG")
        r = self.m.post(f"/efir/{ev.slug}/build/speaker", data={"photo": (io.BytesIO(b.getvalue()), "me.jpg")},
                        content_type="multipart/form-data").get_json()
        self.assertTrue(r["ok"])
        self.m.post(f"/efir/{ev.slug}/build/save", json={"speaker_name": "Асылбек", "speaker_role": "CEO"})
        self.assertTrue(self.m.get(f"/efir/{ev.slug}/build.json").get_json()["has_photo"])
        self.assertEqual(self.m.get(f"/efir/{ev.slug}/youtube-cover.jpg?lang=kk").status_code, 200)
        self.assertEqual(self.m.post(f"/efir/{ev.slug}/build/speaker", data={"photo": (io.BytesIO(b"nope"), "x.jpg")},
                                     content_type="multipart/form-data").status_code, 400)
        self.assertEqual(self.client.get(f"/efir/{ev.slug}/youtube-cover.jpg").status_code, 302)

    def test_import_from_live(self):
        from app.models import LiveEvent
        src = LiveEvent.query.filter_by(slug="keleshek1").first()
        n = EfirQuestion.query.count()
        r = self.m.post("/efir/import", json={"slug": "keleshek1"}).get_json()
        self.assertTrue(r["ok"])
        ev = EfirEvent.query.filter_by(slug=r["slug"]).first()
        self.assertNotEqual(ev.slug, "keleshek")
        self.assertEqual(ev.title, src.title)
        self.assertEqual(EfirQuestion.query.filter_by(event_id=ev.id).count(), EfirQuestion.query.filter_by(event_id=self.ev.id).count())
        self.assertGreater(EfirQuestion.query.count(), n)
        self.assertEqual(self.m.post("/efir/import", json={"slug": "nope"}).status_code, 404)
        # фото спикера и слайды переносятся вместе с вебинаром
        import io
        from PIL import Image
        from app.services import live_deck
        b = io.BytesIO(); Image.new("RGB", (400, 400), (10, 120, 200)).save(b, "JPEG")
        live_deck.save_speaker(src, b.getvalue())
        r2 = self.m.post("/efir/import", json={"slug": "keleshek1"}).get_json()
        ev2 = EfirEvent.query.filter_by(slug=r2["slug"]).first()
        from app.services import efir_deck
        self.assertTrue(efir_deck.speaker_path(ev2).exists())
        self.assertTrue(self.m.get(f"/efir/{ev2.slug}/build.json").get_json()["has_photo"])
        self.assertIn("keleshek", self.m.get("/efir/").get_data(as_text=True))
