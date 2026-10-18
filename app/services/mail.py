"""Отправка писем. Без SMTP письма только пишутся в лог (ссылки-приглашения админ видит в интерфейсе)."""
from __future__ import annotations

import logging
import smtplib
import threading
from email.message import EmailMessage

from flask import current_app

log = logging.getLogger("academy.mail")


def mail_enabled() -> bool:
    return bool(current_app.config.get("SMTP_HOST"))


def _deliver(cfg: dict, msg: EmailMessage) -> None:
    try:
        with smtplib.SMTP(cfg["SMTP_HOST"], cfg["SMTP_PORT"], timeout=15) as s:
            s.starttls()
            if cfg["SMTP_USER"]:
                s.login(cfg["SMTP_USER"], cfg["SMTP_PASSWORD"])
            s.send_message(msg)
    except Exception:  # письмо не должно ронять запрос
        log.exception("SMTP delivery failed to %s", msg["To"])


def send_mail(to: str, subject: str, body: str) -> None:
    cfg = current_app.config
    if not to:
        return
    if not mail_enabled() or cfg.get("TESTING"):
        log.info("MAIL (not sent) to=%s subject=%s\n%s", to, subject, body)
        return
    msg = EmailMessage()
    msg["From"] = cfg["MAIL_FROM"]
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)
    keys = ("SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD")
    threading.Thread(target=_deliver, args=({k: cfg[k] for k in keys}, msg), daemon=True).start()


def absolute(url: str | None) -> str:
    if not url:
        return current_app.config["PUBLIC_BASE_URL"]
    if url.startswith("http"):
        return url
    return current_app.config["PUBLIC_BASE_URL"].rstrip("/") + url


def send_to_user(user_id: int, text: str, url: str | None = None) -> None:
    from ..models import User, db
    user = db.session.get(User, user_id)
    if not user or not user.is_active:
        return
    body = f"{text}\n\n{absolute(url)}\n\nUSTEM Academy"
    send_mail(user.email, f"USTEM Academy: {text[:80]}", body)
