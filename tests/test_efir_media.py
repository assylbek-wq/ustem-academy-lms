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
