"""Общие помощники: доступ, аудит, уведомления, мультиязычные поля, Markdown, видео."""
from __future__ import annotations

import functools
import logging
import re
import secrets
from urllib.parse import parse_qs, urlparse

import bleach
import markdown as md
from flask import abort, current_app, flash, g, redirect, request, session, url_for
from markupsafe import Markup

from .i18n import LOCALES, t
from .models import AuditLog, Notification, db

log = logging.getLogger("academy")


# ─── Доступ ──────────────────────────────────────────────────────────────
def login_required(view):
    @functools.wraps(view)
    def wrapped(*a, **kw):
        if not g.user:
            flash(t("auth.login_required"), "info")
            return redirect(url_for("auth.login", next=request.full_path))
        return view(*a, **kw)
    return wrapped


def role_required(*roles):
    """Пропускает пользователей с любой из ролей (админ проходит всегда)."""
    def deco(view):
        @functools.wraps(view)
        @login_required
        def wrapped(*a, **kw):
            if not g.user.has_role(*roles):
                abort(403)
            return view(*a, **kw)
        return wrapped
    return deco


# ─── CSRF ────────────────────────────────────────────────────────────────
def csrf_token() -> str:
    tok = session.get("_csrf")
    if not tok:
        tok = secrets.token_urlsafe(24)
        session["_csrf"] = tok
    return tok


def check_csrf() -> None:
    if request.method not in ("POST", "PUT", "PATCH", "DELETE") or current_app.config.get("TESTING_NO_CSRF"):
        return
    sent = request.form.get("_csrf") or request.headers.get("X-CSRF-Token")
    if not sent or not secrets.compare_digest(sent, session.get("_csrf", "")):
        abort(400, description="CSRF")


# ─── Аудит и уведомления ─────────────────────────────────────────────────
def audit(action: str, entity: str | None = None, entity_id: int | None = None, **details) -> None:
    db.session.add(AuditLog(user_id=g.user.id if getattr(g, "user", None) else None,
                            action=action, entity=entity, entity_id=entity_id, details=details))


def notify(user_id: int | None, kind: str, text: str, url: str | None = None, email: bool = True) -> None:
    """Уведомление в кабинете + письмо (если настроен SMTP)."""
    if not user_id:
        return
    db.session.add(Notification(user_id=user_id, kind=kind, text=text[:500], url=url))
    if email:
        from .services.mail import send_to_user
        send_to_user(user_id, text, url)


# ─── Мультиязычные поля ──────────────────────────────────────────────────
def loc(value, locale: str | None = None) -> str:
    """{"ru":..,"kk":..,"en":..} -> строка на текущем языке с запасными вариантами."""
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    lang = locale or getattr(g, "locale", "ru")
    for k in (lang, "ru", "kk", "en"):
        v = value.get(k)
        if v:
            return v
    return next((v for v in value.values() if v), "")


def is_translated(value, locale: str) -> bool:
    return bool(isinstance(value, dict) and value.get(locale))


def ml_from_form(prefix: str, form=None) -> dict:
    form = form or request.form
    return {l: (form.get(f"{prefix}_{l}") or "").strip() for l in LOCALES}


def ml_list_from_form(prefix: str, form=None) -> list[dict]:
    """Поля вида prefix_0_ru, prefix_0_kk ... в список словарей; пустые строки отбрасываются."""
    form = form or request.form
    out, i = [], 0
    while any(f"{prefix}_{i}_{l}" in form for l in LOCALES):
        item = {l: (form.get(f"{prefix}_{i}_{l}") or "").strip() for l in LOCALES}
        if any(item.values()):
            out.append(item)
        i += 1
    return out


# ─── Markdown ────────────────────────────────────────────────────────────
ALLOWED_TAGS = sorted(set(bleach.sanitizer.ALLOWED_TAGS) | {
    "p", "h2", "h3", "h4", "ul", "ol", "li", "pre", "code", "blockquote", "table", "thead",
    "tbody", "tr", "th", "td", "hr", "br", "img", "strong", "em", "a", "div", "span",
})
ALLOWED_ATTRS = {"a": ["href", "title", "target", "rel"], "img": ["src", "alt", "title"],
                 "div": ["class"], "span": ["class"], "code": ["class"]}


def render_markdown(text: str | None) -> Markup:
    if not text:
        return Markup("")
    html = md.markdown(text, extensions=["tables", "fenced_code", "sane_lists", "nl2br"])
    clean = bleach.clean(html, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS,
                         protocols=["http", "https", "mailto"], strip=True)
    clean = bleach.linkify(clean, callbacks=[_target_blank])
    return Markup(clean)


def _target_blank(attrs, new=False):
    href = attrs.get((None, "href"), "")
    if href.startswith("http"):
        attrs[(None, "target")] = "_blank"
        attrs[(None, "rel")] = "noopener"
    return attrs


# ─── Видео ───────────────────────────────────────────────────────────────
def video_embed(url: str | None) -> dict | None:
    """Ссылка -> {"type": "iframe"|"file", "src": ...}. Поддержка YouTube, Vimeo, прямых mp4/webm."""
    if not url:
        return None
    url = url.strip()
    u = urlparse(url)
    host = (u.netloc or "").lower().removeprefix("www.").removeprefix("m.")
    vid = None
    if host in ("youtube.com", "youtube-nocookie.com"):
        if u.path == "/watch":
            vid = parse_qs(u.query).get("v", [None])[0]
        elif u.path.startswith(("/embed/", "/shorts/", "/live/")):
            vid = u.path.split("/")[2]
    elif host == "youtu.be":
        vid = u.path.lstrip("/").split("/")[0]
    if vid and re.fullmatch(r"[\w-]{6,20}", vid):
        return {"type": "iframe", "src": f"https://www.youtube-nocookie.com/embed/{vid}?rel=0"}
    if host == "vimeo.com":
        m = re.match(r"/(\d+)", u.path)
        if m:
            return {"type": "iframe", "src": f"https://player.vimeo.com/video/{m.group(1)}"}
    if host == "player.vimeo.com":
        return {"type": "iframe", "src": url}
    if re.search(r"\.(mp4|webm|m4v|mov)(\?|$)", u.path, re.I) or url.startswith("/"):
        return {"type": "file", "src": url}
    return None


def safe_next(target: str | None, default: str) -> str:
    if target and target.startswith("/") and not target.startswith("//"):
        return target
    return default


def fmt_seconds(s: float | int | None) -> str:
    s = int(s or 0)
    return f"{s // 60}:{s % 60:02d}"


def human_size(n: int | None) -> str:
    n = n or 0
    for unit in ("Б", "КБ", "МБ", "ГБ"):
        if n < 1024 or unit == "ГБ":
            return f"{n:.0f} {unit}" if unit == "Б" else f"{n:.1f} {unit}"
        n /= 1024
    return str(n)
