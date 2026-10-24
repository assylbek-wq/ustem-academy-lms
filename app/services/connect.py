"""Связь с USTEM Connect: подключение кабинета тренера и снимок его пути сезона.

Подключение (см. src/lib/academy-link.ts в Connect):
  /connect/start -> Connect /link/academy?state=... -> тренер подтверждает -> /connect/callback?t=<payload>.<hmac>
Подпись HMAC-SHA256 ключом CONNECT_API_KEY, state сверяется с сессией, ссылка живет 5 минут.
Снимок: GET {CONNECT_API_URL}/api/v1/academy/journey?person=<id> - команды, заявки, приезд, места, награды
(без персональных данных учеников). Хранится в users.connect_snapshot и обновляется не чаще раза в 10 минут.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import timedelta

from flask import current_app

from ..models import User, db, utcnow

log = logging.getLogger("academy.connect")
SYNC_EVERY = timedelta(minutes=10)


def enabled() -> bool:
    return len(current_app.config.get("CONNECT_API_KEY") or "") >= 32


def link_url(state: str) -> str:
    return f"{current_app.config['CONNECT_URL']}/link/academy?state={urllib.parse.quote(state)}"


def verify_link(token: str | None, state: str | None) -> dict | None:
    """Проверенные данные из ссылки Connect или None."""
    key = current_app.config.get("CONNECT_API_KEY") or ""
    if not enabled() or not token or not state or len(token) > 4096 or token.count(".") != 1:
        return None
    body, sig = token.split(".")
    good = base64.urlsafe_b64encode(hmac.new(key.encode(), body.encode(), hashlib.sha256).digest()).rstrip(b"=").decode()
    if not hmac.compare_digest(good, sig):
        return None
    try:
        claims = json.loads(base64.urlsafe_b64decode(body + "=" * (-len(body) % 4)))
    except (ValueError, json.JSONDecodeError):
        return None
    if not isinstance(claims, dict) or claims.get("state") != state:
        return None
    if not isinstance(claims.get("exp"), (int, float)) or claims["exp"] < time.time() * 1000:
        return None
    if not isinstance(claims.get("p"), str) or not 30 <= len(claims["p"]) <= 40:
        return None
    return claims


def fetch_journey(person_id: str) -> dict | None:
    base = current_app.config.get("CONNECT_API_URL") or current_app.config["CONNECT_URL"]
    req = urllib.request.Request(f"{base}/api/v1/academy/journey?person={urllib.parse.quote(person_id)}",
                                 headers={"Authorization": f"Bearer {current_app.config['CONNECT_API_KEY']}",
                                          "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=5) as r:  # noqa: S310 - адрес из настроек сервера
            data = json.loads(r.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, ValueError, OSError) as e:
        log.warning("Connect journey недоступен: %s", e)
        return None
    return data if isinstance(data, dict) and isinstance(data.get("teams"), list) else None


def sync(user: User, force: bool = False) -> bool:
    """Обновить снимок из Connect. True, если данные обновились."""
    if not user.connect_person_id or not enabled():
        return False
    if not force and user.connect_synced_at and utcnow() - user.connect_synced_at < SYNC_EVERY:
        return False
    data = fetch_journey(user.connect_person_id)
    user.connect_synced_at = utcnow()  # и при ошибке: не долбить Connect на каждом открытии страницы
    if data is None:
        db.session.commit()
        return False
    user.connect_snapshot = data
    db.session.commit()
    return True


def region_of(user: User) -> str:
    if user.region:
        return user.region
    reg = ((user.connect_snapshot or {}).get("person") or {}).get("region") or {}
    return (reg.get("ru") or reg.get("en") or "") if isinstance(reg, dict) else str(reg or "")
