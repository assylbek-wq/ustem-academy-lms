"""Видеосервер студии эфиров (LiveKit): спикеры по ссылке, экран эфира и трансляция в YouTube без OBS.

Настройки (переменные окружения):
- LIVEKIT_URL         адрес для браузеров, wss://media.ustem.kz
- LIVEKIT_API_URL     адрес API для сервера Академии (по умолчанию тот же хост по https)
- LIVEKIT_API_KEY / LIVEKIT_API_SECRET  ключ из livekit.yaml (keys:)

Без настроек студия работает как /live: экран, пульт и викторина, только без камер спикеров.
Комната эфира - efir-<id>. Спикер получает имя g-..., экран и пульт входят невидимыми (hidden), без публикации.
Трансляция - Web Egress: невидимый Chrome на видеосервере открывает экран эфира и шлет RTMP в YouTube.
Токены и запросы к API (Twirp JSON) собраны вручную: JWT HS256 и urllib, без лишних зависимостей.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time
import urllib.error
import urllib.request

from flask import current_app

DEFAULT_RTMP = "rtmp://a.rtmp.youtube.com/live2"
LAYOUTS = ("auto", "speakers", "hide")
MAX_ON = 4          # сколько спикеров одновременно на экране
TTL = 8 * 3600      # токен входа живет 8 часов (эфир с подготовкой)


class MediaError(Exception):
    pass


def cfg() -> dict:
    c = current_app.config
    url = (c.get("LIVEKIT_URL") or "").strip().rstrip("/")
    api = (c.get("LIVEKIT_API_URL") or "").strip().rstrip("/")
    if url and not api:
        api = url.replace("wss://", "https://").replace("ws://", "http://")
    return {"url": url, "api": api, "key": c.get("LIVEKIT_API_KEY") or "", "secret": c.get("LIVEKIT_API_SECRET") or ""}


def enabled() -> bool:
    c = cfg()
    return bool(c["url"] and c["key"] and c["secret"])


def room(ev) -> str:
    return f"efir-{ev.id}"


# ─── Токены ──────────────────────────────────────────────────────────────
def _b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()


def _jwt(claims: dict) -> str:
    c = cfg()
    head = _b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    body = _b64(json.dumps(claims, separators=(",", ":"), ensure_ascii=False).encode())
    sig = hmac.new(c["secret"].encode(), f"{head}.{body}".encode(), hashlib.sha256).digest()
    return f"{head}.{body}.{_b64(sig)}"


def token(ev, identity: str, name: str = "", publish: bool = False, hidden: bool = False, meta: dict | None = None) -> str:
    now = int(time.time())
    grant = {"room": room(ev), "roomJoin": True, "canSubscribe": True, "canPublish": publish,
             "canPublishData": publish, "hidden": hidden}
    if publish:
        grant["canPublishSources"] = ["camera", "microphone", "screen_share", "screen_share_audio"]
    claims = {"iss": cfg()["key"], "sub": identity, "nbf": now - 10, "exp": now + TTL, "video": grant}
    if name:
        claims["name"] = name[:80]
    if meta:
        claims["metadata"] = json.dumps(meta, ensure_ascii=False)
    return _jwt(claims)


def guest_identity(prev: str | None = None) -> str:
    """Спикер заходит повторно с тем же именем в комнате (браузер помнит его), иначе новое."""
    if prev and len(prev) <= 24 and prev.startswith("g-") and prev[2:].isalnum():
        return prev
    return "g-" + secrets.token_hex(5)


def viewer_identity(kind: str) -> str:
    return f"{kind}-{secrets.token_hex(4)}"


# ─── API видеосервера ────────────────────────────────────────────────────
def _admin_token(ev) -> str:
    now = int(time.time())
    return _jwt({"iss": cfg()["key"], "sub": "academy", "nbf": now - 10, "exp": now + 600,
                 "video": {"room": room(ev), "roomAdmin": True, "roomRecord": True, "roomList": True}})


def call(ev, service: str, method: str, body: dict, timeout: float = 15) -> dict:
    """Twirp JSON: POST {api}/twirp/livekit.<service>/<method>."""
    if not enabled():
        raise MediaError("efir.m_off")
    req = urllib.request.Request(f"{cfg()['api']}/twirp/livekit.{service}/{method}", method="POST",
                                 data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "Authorization": f"Bearer {_admin_token(ev)}"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        try:
            msg = json.loads(e.read() or b"{}").get("msg") or str(e)
        except ValueError:
            msg = str(e)
        current_app.logger.warning("livekit %s/%s: %s", service, method, msg)
        raise MediaError(msg) from e
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        current_app.logger.warning("livekit %s/%s: %s", service, method, e)
        raise MediaError("efir.m_unreachable") from e


def remove(ev, identity: str) -> None:
    call(ev, "RoomService", "RemoveParticipant", {"room": room(ev), "identity": identity})


# ─── Сцена: кто в эфире ──────────────────────────────────────────────────
def stage(ev) -> dict:
    s = dict(ev.stage or {})
    return {"on": list(s.get("on") or [])[:MAX_ON], "muted": list(s.get("muted") or []), "hands": list(s.get("hands") or []),
            "layout": s.get("layout") if s.get("layout") in LAYOUTS else "auto", "v": int(s.get("v") or 0)}


def set_stage(ev, on=None, muted=None, layout=None, hands=None) -> dict:
    """Сцена эфира. Выведенный в эфир спикер опускает руку сам."""
    s = stage(ev)
    clean = lambda xs: [x for x in dict.fromkeys(str(i)[:24] for i in xs) if x.startswith("g-")]
    if on is not None:
        s["on"] = clean(on)[:MAX_ON]
        s["hands"] = [h for h in s["hands"] if h not in s["on"]]
    if muted is not None:
        s["muted"] = clean(muted)[:60]
    if hands is not None:
        s["hands"] = [h for h in clean(hands) if h not in s["on"]][:60]
    if layout is not None and layout in LAYOUTS:
        s["layout"] = layout
    s["v"] += 1
    ev.stage = s
    return s


# ─── Трансляция в YouTube ────────────────────────────────────────────────
ACTIVE = ("EGRESS_STARTING", "EGRESS_ACTIVE", "EGRESS_ENDING")


def rtmp_target(ev) -> str:
    key = (ev.stream_key or "").strip()
    if not key:
        raise MediaError("efir.s_no_key")
    return f"{(ev.stream_url or DEFAULT_RTMP).strip().rstrip('/')}/{key}"


def start_stream(ev, screen_url: str) -> dict:
    """Видеосервер открывает экран эфира (1920 x 1080, 30 к/с) и шлет его в YouTube. Экран сам подает сигнал старта."""
    cur = stream_status(ev)
    if cur.get("status") in ACTIVE:
        return cur
    info = call(ev, "Egress", "StartWebEgress", {
        "url": screen_url, "preset": "H264_1080P_30", "await_start_signal": True,
        "stream_outputs": [{"protocol": "RTMP", "urls": [rtmp_target(ev)]}]}, timeout=30)
    ev.egress = {"id": info.get("egress_id") or info.get("egressId"), "status": info.get("status") or "EGRESS_STARTING",
                 "at": int(time.time()), "error": ""}
    return ev.egress


def stop_stream(ev) -> dict:
    eg = dict(ev.egress or {})
    if eg.get("id"):
        try:
            info = call(ev, "Egress", "StopEgress", {"egress_id": eg["id"]})
            eg["status"] = info.get("status") or "EGRESS_ENDING"
        except MediaError as e:
            eg["status"], eg["error"] = "EGRESS_ABORTED", str(e)
    ev.egress = eg
    return eg


def stream_status(ev) -> dict:
    """Свежий статус с видеосервера (если он доступен), иначе последний сохраненный."""
    eg = dict(ev.egress or {})
    if not eg.get("id") or not enabled():
        return eg
    try:
        items = call(ev, "Egress", "ListEgress", {"egress_id": eg["id"]}, timeout=6).get("items") or []
    except MediaError:
        return eg
    if items:
        it = items[0]
        eg["status"] = it.get("status") or eg.get("status")
        eg["error"] = it.get("error") or ""
        ev.egress = eg
    return eg
