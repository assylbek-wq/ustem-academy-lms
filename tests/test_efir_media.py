"""Студия эфиров: видеосервер (токены LiveKit), ссылка спикера, сцена, трансляция в YouTube (API видеосервера подменен)."""
import base64
import hashlib
import hmac
import json
from unittest import mock

from tests.base import AppTestCase

from app.models import EfirEvent, db
from app.services import efir_builder as lb
from app.services import efir_media as media


def _decode(tok, secret):
    h, b, sig = tok.split(".")
    want = base64.urlsafe_b64encode(hmac.new(secret.encode(), f"{h}.{b}".encode(), hashlib.sha256).digest()).rstrip(b"=").decode()
    assert sig == want, "bad signature"
    return json.loads(base64.urlsafe_b64decode(b + "=" * (-len(b) % 4)))


class EfirMediaTest(AppTestCase):
    def setUp(self):
        super().setUp()
        self.m = self.new_client("methodist@academy.demo")
        r = self.m.post("/efir/new", json={"title": "Студия тест", "starts_at": "2026-11-05T11:00"}).get_json()
        self.ev = EfirEvent.query.filter_by(slug=r["slug"]).first()

    def _on(self):
        self.app.config.update(LIVEKIT_URL="wss://media.example.kz", LIVEKIT_API_KEY="APIkey", LIVEKIT_API_SECRET="s" * 32)

    def tearDown(self):
        self.app.config.update(LIVEKIT_URL="", LIVEKIT_API_KEY="", LIVEKIT_API_SECRET="")
        super().tearDown()

    def test_guest_page_needs_key_and_works_without_server(self):
        anon = self.app.test_client()
        self.assertEqual(anon.get(f"/efir/{self.ev.slug}/guest").status_code, 404)
        self.assertEqual(anon.get(f"/efir/{self.ev.slug}/guest?k=wrong").status_code, 404)
        r = anon.get(f"/efir/{self.ev.slug}/guest?k={self.ev.guest_key}")
        self.assertEqual(r.status_code, 200)
        self.assertNotIn("livekit-client", r.get_data(as_text=True))  # без видеосервера: только сообщение
        r = self.m.post(f"/efir/{self.ev.slug}/guest/token", json={"k": self.ev.guest_key, "name": "Асылбек"})
        self.assertEqual(r.status_code, 503)

    def test_guest_token(self):
        self._on()
        anon = self.app.test_client()
        page = anon.get(f"/efir/{self.ev.slug}/guest?k={self.ev.guest_key}").get_data(as_text=True)
        self.assertIn("livekit-client", page)
        import re
        csrf = re.search(r'name="csrf-token" content="([^"]+)"', page).group(1)
        h = {"X-CSRF-Token": csrf}
        self.assertEqual(anon.post(f"/efir/{self.ev.slug}/guest/token", json={"k": self.ev.guest_key, "name": "A"}, headers=h).status_code, 400)
        d = anon.post(f"/efir/{self.ev.slug}/guest/token", json={"k": self.ev.guest_key, "name": "Асылбек М.", "role": "CEO"}, headers=h).get_json()
        self.assertTrue(d["ok"])
        self.assertEqual(d["url"], "wss://media.example.kz")
        c = _decode(d["token"], "s" * 32)
        self.assertEqual(c["iss"], "APIkey")
        self.assertEqual(c["sub"], d["identity"])
        self.assertTrue(d["identity"].startswith("g-"))
        self.assertEqual(c["name"], "Асылбек М.")
        self.assertEqual(json.loads(c["metadata"])["role"], "CEO")
        self.assertEqual(c["video"]["room"], f"efir-{self.ev.id}")
        self.assertTrue(c["video"]["canPublish"])
        self.assertFalse(c["video"]["hidden"])
        # повторный вход с тем же именем в комнате
        d2 = anon.post(f"/efir/{self.ev.slug}/guest/token", json={"k": self.ev.guest_key, "name": "Асылбек М.", "prev": d["identity"]}, headers=h).get_json()
        self.assertEqual(d2["identity"], d["identity"])
        self.assertTrue(media.guest_identity("x-bad").startswith("g-"))
        self.assertNotEqual(media.guest_identity("g-../../x"), "g-../../x")

    def test_screen_and_control_tokens_hidden(self):
        self._on()
        anon = self.app.test_client()
        self.assertEqual(anon.get(f"/efir/{self.ev.slug}/media.json").status_code, 403)
        d = anon.get(f"/efir/{self.ev.slug}/media.json?key={self.ev.screen_key}").get_json()
        c = _decode(d["token"], "s" * 32)
        self.assertTrue(c["video"]["hidden"])
        self.assertFalse(c["video"]["canPublish"])
        self.assertTrue(c["sub"].startswith("screen-"))
        self.assertTrue(_decode(self.m.get(f"/efir/{self.ev.slug}/media.json?as=control").get_json()["token"], "s" * 32)["sub"].startswith("control-"))
        self.assertIn("livekit-client", anon.get(f"/efir/{self.ev.slug}/screen?key={self.ev.screen_key}").get_data(as_text=True))

    def test_stage(self):
        teacher = self.new_client("teacher1@academy.demo")
        self.assertEqual(teacher.post(f"/efir/{self.ev.slug}/control/stage", json={"on": ["g-a"]}).status_code, 403)
        d = self.m.post(f"/efir/{self.ev.slug}/control/stage", json={"on": ["g-a", "g-b", "g-a", "screen-x", "g-c", "g-d", "g-e"], "layout": "speakers"}).get_json()
        self.assertEqual(d["stage"]["on"], ["g-a", "g-b", "g-c", "g-d"])   # без повторов, только спикеры, не больше 4
        self.assertEqual(d["stage"]["layout"], "speakers")
        d = self.m.post(f"/efir/{self.ev.slug}/control/stage", json={"layout": "nope", "muted": ["g-b"]}).get_json()
        self.assertEqual(d["stage"]["layout"], "speakers")
        self.assertEqual(d["stage"]["muted"], ["g-b"])
        sj = self.m.get(f"/efir/{self.ev.slug}/screen.json").get_json()
        self.assertEqual(sj["stage"]["on"], ["g-a", "g-b", "g-c", "g-d"])
        st = self.app.test_client().get(f"/efir/{self.ev.slug}/guest/status?k={self.ev.guest_key}&id=g-b").get_json()
        self.assertEqual((st["on"], st["muted"]), (True, True))
        self.assertEqual(self.app.test_client().get(f"/efir/{self.ev.slug}/guest/status?k=bad&id=g-b").status_code, 404)
        with mock.patch.object(media, "remove") as rm:
            d = self.m.post(f"/efir/{self.ev.slug}/control/kick", json={"identity": "g-b"}).get_json()
        rm.assert_called_once()
        self.assertNotIn("g-b", d["stage"]["on"])

    def test_stream_key_saved_and_hidden(self):
        r = self.m.post(f"/efir/{self.ev.slug}/build/save", json={"stream_key": "abcd-efgh-ijkl-mnop-qrst"}).get_json()
        self.assertTrue(r["ok"], r)
        db.session.refresh(self.ev)
        self.assertEqual(self.ev.stream_key, "abcd-efgh-ijkl-mnop-qrst")
        bj = self.m.get(f"/efir/{self.ev.slug}/build.json").get_json()
        self.assertTrue(bj["has_stream_key"])
        self.assertEqual(bj["stream_key_tail"], "qrst")
        self.assertNotIn("abcd-efgh", json.dumps(bj))
        self.assertIn("/guest?k=", bj["urls"]["speaker"])
        self.assertFalse(self.m.post(f"/efir/{self.ev.slug}/build/save", json={"stream_key": "bad key!"}).get_json()["ok"])
        self.assertFalse(self.m.post(f"/efir/{self.ev.slug}/build/save", json={"stream_url": "http://x"}).get_json()["ok"])
        self.m.post(f"/efir/{self.ev.slug}/build/save", json={"stream_key": ""})   # пустое значение ключ не стирает
        db.session.refresh(self.ev)
        self.assertTrue(self.ev.stream_key)
        self.m.post(f"/efir/{self.ev.slug}/build/save", json={"stream_key": "-"})
        db.session.refresh(self.ev)
        self.assertIsNone(self.ev.stream_key)

    def test_stream_start_stop(self):
        d = self.m.post(f"/efir/{self.ev.slug}/control/stream", json={"action": "start"})
        self.assertEqual(d.status_code, 502)   # нет видеосервера
        self._on()
        d = self.m.post(f"/efir/{self.ev.slug}/control/stream", json={"action": "start"}).get_json()
        self.assertFalse(d["ok"])              # нет ключа
        self.m.post(f"/efir/{self.ev.slug}/build/save", json={"stream_key": "abcd-1234"})
        calls = []

        def fake(ev, service, method, body, timeout=15):
            calls.append((service, method, body))
            if method == "StartWebEgress":
                return {"egress_id": "EG_1", "status": "EGRESS_STARTING"}
            if method == "ListEgress":
                return {"items": [{"egress_id": "EG_1", "status": "EGRESS_ACTIVE"}]}
            if method == "StopEgress":
                return {"egress_id": "EG_1", "status": "EGRESS_ENDING"}
            return {}
        with mock.patch.object(media, "call", side_effect=fake):
            d = self.m.post(f"/efir/{self.ev.slug}/control/stream", json={"action": "start"}).get_json()
            self.assertTrue(d["ok"], d)
            self.assertEqual(d["stream"]["status"], "EGRESS_ACTIVE")
            start = [c for c in calls if c[1] == "StartWebEgress"][0][2]
            self.assertEqual(start["stream_outputs"][0]["urls"], ["rtmp://a.rtmp.youtube.com/live2/abcd-1234"])
            self.assertIn(f"/efir/{self.ev.slug}/screen?key={self.ev.screen_key}", start["url"])
            self.assertIn("egress=1", start["url"])
            self.assertTrue(start["await_start_signal"])
            # повторный старт не запускает вторую трансляцию
            self.m.post(f"/efir/{self.ev.slug}/control/stream", json={"action": "start"})
            self.assertEqual(len([c for c in calls if c[1] == "StartWebEgress"]), 1)
            d = self.m.post(f"/efir/{self.ev.slug}/control/stream", json={"action": "stop"}).get_json()
            self.assertTrue(d["ok"])
            self.assertEqual([c[2] for c in calls if c[1] == "StopEgress"], [{"egress_id": "EG_1"}])
        teacher = self.new_client("teacher1@academy.demo")
        self.assertEqual(teacher.post(f"/efir/{self.ev.slug}/control/stream", json={"action": "stop"}).status_code, 403)

    def test_live_untouched(self):
        """Студия не меняет вебинары /live: отдельные таблицы и страницы."""
        from app.models import LiveEvent
        n = LiveEvent.query.count()
        lb.create({"ru": "Еще эфир"}, None, None)
        self.assertEqual(LiveEvent.query.count(), n)
        self.assertEqual(self.m.get(f"/live/{self.ev.slug}/build").status_code, 404)

    def test_hands_and_mute_all(self):
        anon = self.app.test_client()
        page = anon.get(f"/efir/{self.ev.slug}/guest?k={self.ev.guest_key}").get_data(as_text=True)
        import re
        h = {"X-CSRF-Token": re.search(r'name="csrf-token" content="([^"]+)"', page).group(1)}
        base = f"/efir/{self.ev.slug}"
        self.assertEqual(anon.post(base + "/guest/hand", json={"k": "bad", "id": "g-a", "up": True}, headers=h).status_code, 404)
        self.assertEqual(anon.post(base + "/guest/hand", json={"k": self.ev.guest_key, "id": "screen-1", "up": True}, headers=h).status_code, 400)
        for gid in ("g-a", "g-b"):
            self.assertTrue(anon.post(base + "/guest/hand", json={"k": self.ev.guest_key, "id": gid, "up": True}, headers=h).get_json()["hand"])
        st = anon.get(base + f"/guest/status?k={self.ev.guest_key}&id=g-a").get_json()
        self.assertTrue(st["hand"])
        self.assertFalse(st["on"])                     # за кулисами: микрофон на странице спикера заперт
        self.assertEqual(self.m.get(base + "/screen.json").get_json()["stage"]["hands"], ["g-a", "g-b"])
        d = self.m.post(base + "/control/stage", json={"on": ["g-a"]}).get_json()   # вывели в эфир - рука опустилась
        self.assertEqual(d["stage"]["hands"], ["g-b"])
        self.assertFalse(anon.post(base + "/guest/hand", json={"k": self.ev.guest_key, "id": "g-a", "up": True}, headers=h).get_json()["hand"])
        self.assertFalse(anon.post(base + "/guest/hand", json={"k": self.ev.guest_key, "id": "g-b", "up": False}, headers=h).get_json()["hand"])
        d = self.m.post(base + "/control/stage", json={"muted": ["g-a", "g-b"]}).get_json()   # «Выключить всех»
        self.assertEqual(d["stage"]["muted"], ["g-a", "g-b"])
        self.assertTrue(anon.get(base + f"/guest/status?k={self.ev.guest_key}&id=g-a").get_json()["muted"])
        self.assertEqual(self.m.post(base + "/control/stage", json={"muted": []}).get_json()["stage"]["muted"], [])

    def test_guest_preview_and_slides(self):
        self._on()
        from fpdf import FPDF
        import io
        pdf = FPDF(orientation="L", unit="pt", format=(540, 960))
        for i in range(3):
            pdf.add_page(); pdf.set_font("Helvetica", size=40); pdf.text(60, 120, f"Slide {i + 1}")
        r = self.m.post(f"/efir/{self.ev.slug}/build/deck/upload", data={"pdf": (io.BytesIO(bytes(pdf.output())), "d.pdf")},
                        content_type="multipart/form-data")
        self.assertEqual(r.status_code, 200, r.get_data(as_text=True)[:200])
        anon = self.app.test_client()
        base = f"/efir/{self.ev.slug}"
        page = anon.get(f"{base}/guest?k={self.ev.guest_key}").get_data(as_text=True)
        self.assertIn(f"/screen?key={self.ev.guest_key}", page.replace("&amp;", "&"))
        self.assertEqual(page.count('data-i="'), 3)
        # ключ спикера открывает экран (предпросмотр), слайды и состояние, но не пульт
        self.assertEqual(anon.get(f"{base}/screen?key={self.ev.guest_key}&preview=1").status_code, 200)
        self.assertEqual(anon.get(f"{base}/screen.json?key={self.ev.guest_key}").status_code, 200)
        self.assertEqual(anon.get(f"{base}/control.json?key={self.ev.guest_key}").status_code, 302)
        import re
        h = {"X-CSRF-Token": re.search(r'name="csrf-token" content="([^"]+)"', page).group(1)}
        body = {"k": self.ev.guest_key, "id": "g-a", "slide": 2}
        self.assertEqual(anon.post(f"{base}/guest/slide", json=body, headers=h).status_code, 403)   # за кулисами
        self.m.post(f"{base}/control/stage", json={"on": ["g-a"]})
        d = anon.post(f"{base}/guest/slide", json=body, headers=h).get_json()
        self.assertEqual((d["slide"], d["of"]), (2, 3))
        st = self.m.get(f"{base}/control.json").get_json()["state"]
        self.assertEqual((st["mode"], st["slide"]), ("slides", 2))
        self.assertEqual(anon.post(f"{base}/guest/slide", json=dict(body, slide=99), headers=h).get_json()["slide"], 2)
        self.assertEqual(anon.get(f"{base}/guest/status?k={self.ev.guest_key}&id=g-a").get_json()["slide"], 2)
        self.assertEqual(anon.post(f"{base}/guest/slide", json=dict(body, k="bad"), headers=h).status_code, 404)

    def test_video_scene(self):
        base = f"/efir/{self.ev.slug}"
        teacher = self.new_client("teacher1@academy.demo")
        self.assertEqual(teacher.post(base + "/build/video", json={"url": "https://youtu.be/jfKfPfyJRdk"}).status_code, 403)
        self.assertEqual(self.m.post(base + "/build/video", json={"url": "not a link"}).status_code, 400)
        d = self.m.post(base + "/build/video", json={"url": "https://www.youtube.com/watch?v=jfKfPfyJRdk", "title": "Lofi"}).get_json()
        yt = d["videos"][0]
        self.assertEqual((yt["kind"], yt["yt"], yt["title"]), ("youtube", "jfKfPfyJRdk", "Lofi"))
        # файл: загрузка частями через /api/uploads, затем в эфир
        data = b"\x00\x00\x00\x18ftypmp42" + b"0" * 5000
        s = self.m.post("/api/uploads", json={"name": "clip.mp4", "size": len(data), "type": "video/mp4"}).get_json()
        r = self.m.put(f"/api/uploads/{s['id']}?offset=0", data=data).get_json()
        d = self.m.post(base + "/build/video", json={"file_id": r["file_id"], "title": "Ролик", "dur": 95}).get_json()
        self.assertTrue(d["ok"], d)
        fv = d["videos"][1]
        self.assertEqual((fv["kind"], fv["dur"], fv["title"]), ("file", 95, "Ролик"))
        self.assertEqual(self.m.post(base + "/build/video", json={"file_id": r["file_id"]}).status_code, 400)  # уже перенесен
        anon = self.app.test_client()
        self.assertEqual(anon.get(fv["src"]).status_code, 404)
        self.assertEqual(anon.get(fv["src"] + f"?key={self.ev.screen_key}").status_code, 200)
        rr = anon.get(fv["src"] + f"?key={self.ev.screen_key}", headers={"Range": "bytes=0-99"})
        self.assertEqual((rr.status_code, len(rr.data)), (206, 100))
        # пульт: показать, пауза, перемотка, вернуться на прежнюю сцену
        self.m.post(base + "/control/state", json={"mode": "talk"})
        self.assertEqual(self.m.post(base + "/control/video", json={"action": "pause"}).status_code, 400)
        st = self.m.post(base + "/control/video", json={"action": "play", "vid": fv["id"]}).get_json()["state"]
        self.assertEqual((st["mode"], st["vid"], st["paused"], st["back"]), ("video", fv["id"], False, "talk"))
        from app.services import efir as esvc
        esvc._cache.clear()
        sj = anon.get(base + f"/screen.json?key={self.ev.screen_key}").get_json()
        self.assertEqual(sj["state"]["mode"], "video")
        self.assertEqual(sj["vnow"]["id"], fv["id"])
        self.assertIn(f"key={self.ev.screen_key}", sj["vnow"]["src"])
        st = self.m.post(base + "/control/video", json={"action": "pause"}).get_json()["state"]
        self.assertTrue(st["paused"])
        st = self.m.post(base + "/control/video", json={"action": "seek", "pos": 42}).get_json()["state"]
        self.assertEqual((st["pos"], st["paused"]), (42, True))
        st = self.m.post(base + "/control/video", json={"action": "resume"}).get_json()["state"]
        self.assertFalse(st["paused"])
        st = self.m.post(base + "/control/video", json={"action": "play", "vid": yt["id"], "from": 0}).get_json()["state"]
        self.assertEqual((st["vid"], st["back"]), (yt["id"], "talk"))   # смена ролика не теряет, куда вернуться
        st = self.m.post(base + "/control/video", json={"action": "stop"}).get_json()["state"]
        self.assertEqual(st["mode"], "talk")
        self.assertIn(fv["title"], self.m.get(base + "/control").get_data(as_text=True))
        # удаление убирает файл
        from app.services import efir_video
        p = efir_video.path(db.session.get(EfirEvent, self.ev.id), {"id": fv["id"], "ext": "mp4"})
        self.assertTrue(p.exists())
        d = self.m.post(base + "/build/video", json={"delete": fv["id"]}).get_json()
        self.assertEqual([v["id"] for v in d["videos"]], [yt["id"]])
        self.assertFalse(p.exists())

    def test_partners(self):
        import io
        from PIL import Image
        base = f"/efir/{self.ev.slug}"
        def png(w=900, h=300, color=(0, 120, 200, 255)):
            b = io.BytesIO(); im = Image.new("RGBA", (w + 40, h + 40), (0, 0, 0, 0))
            im.paste(Image.new("RGBA", (w, h), color), (20, 20)); im.save(b, "PNG"); return b.getvalue()
        teacher = self.new_client("teacher1@academy.demo")
        self.assertEqual(teacher.post(base + "/build/partner", data={"name": "X", "logo": (io.BytesIO(png()), "l.png")},
                                      content_type="multipart/form-data").status_code, 403)
        self.assertEqual(self.m.post(base + "/build/partner", data={"name": "X"}, content_type="multipart/form-data").status_code, 400)
        self.assertEqual(self.m.post(base + "/build/partner", data={"name": "X", "logo": (io.BytesIO(b"nope"), "l.png")},
                                     content_type="multipart/form-data").status_code, 400)
        d = self.m.post(base + "/build/partner", data={"name": "STEMshop", "url": "stemshop.kz", "label": "Партнер",
                                                       "logo": (io.BytesIO(png()), "logo.png")}, content_type="multipart/form-data").get_json()
        self.assertTrue(d["ok"], d)
        p1 = d["partners"][0]
        self.assertEqual((p1["name"], p1["url"], p1["label"]), ("STEMshop", "https://stemshop.kz", "Партнер"))
        self.assertEqual((p1["w"], p1["h"]), (600, 200))   # обрезаны прозрачные поля, вписано в 600 x 240
        anon = self.app.test_client()
        r = anon.get(p1["logo"])
        self.assertEqual((r.status_code, r.mimetype), (200, "image/png"))
        d = self.m.post(base + "/build/partner", data={"name": "USTEM", "logo": (io.BytesIO(png(200, 200)), "u.png")},
                        content_type="multipart/form-data").get_json()
        p2 = d["partners"][1]
        self.assertEqual(self.m.post(base + "/build/partner", json={"id": p1["id"], "url": "bad url"}).status_code, 400)
        d = self.m.post(base + "/build/partner", json={"order": [p2["id"], p1["id"]]}).get_json()
        self.assertEqual([x["name"] for x in d["partners"]], ["USTEM", "STEMshop"])
        # видно на экране, у учителя, в приглашении
        self.assertIn(p1["logo"], anon.get(base + f"/screen?key={self.ev.screen_key}").get_data(as_text=True).replace("&amp;", "&"))
        gate = anon.get(base).get_data(as_text=True)
        self.assertIn("https://stemshop.kz", gate)
        self.assertIn('rel="noopener sponsored"', self.m.get(base).get_data(as_text=True))
        # копия эфира получает логотипы
        cp = self.m.post("/efir/new", json={"title": "Копия", "copy": self.ev.slug}).get_json()
        cpd = self.m.get(f"/efir/{cp['slug']}/build.json").get_json()
        self.assertEqual(len(cpd["partners"]), 2)
        self.assertEqual(anon.get(cpd["partners"][0]["logo"]).status_code, 200)
        d = self.m.post(base + "/build/partner", json={"delete": p2["id"]}).get_json()
        self.assertEqual([x["name"] for x in d["partners"]], ["STEMshop"])
        self.assertEqual(anon.get(p2["logo"]).status_code, 404)
