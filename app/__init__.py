"""USTEM Academy - LMS для подготовки учителей инженерного образования."""
from __future__ import annotations

import logging
import os
from datetime import date, datetime

from flask import Flask, g, request, session
from markupsafe import Markup

from .config import Config
from .core import check_csrf, csrf_token, fmt_seconds, human_size, loc, render_markdown, video_embed
from .i18n import LOCALES, LOCALE_NAMES, t
from .models import Notification, User, db


def create_app(config: type = Config, **overrides) -> Flask:
    app = Flask(__name__, static_folder="static", template_folder="templates")
    app.config.from_object(config)
    app.config.update(overrides)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    logging.getLogger("fontTools").setLevel(logging.WARNING)

    db.init_app(app)

    from .blueprints import admin, api, auth, cohorts, learn, public, reports, review, studio
    for bp in (public.bp, auth.bp, learn.bp, review.bp, cohorts.bp, studio.bp, admin.bp, reports.bp, api.bp):
        app.register_blueprint(bp)

    @app.before_request
    def load_globals():
        check_csrf()
        g.user = None
        uid = session.get("uid")
        if uid:
            user = db.session.get(User, uid)
            if user and user.is_active and session.get("pwfp") == (user.password_hash or "")[-12:]:
                g.user = user
            else:
                session.pop("uid", None)
        lang = request.args.get("lang")
        if lang in LOCALES:
            session["locale"] = lang
            if g.user and g.user.locale != lang:
                g.user.locale = lang
                db.session.commit()
        g.locale = session.get("locale") or (g.user.locale if g.user else None) or "ru"
        if g.locale not in LOCALES:
            g.locale = "ru"

    @app.after_request
    def security_headers(resp):
        resp.headers.setdefault("X-Content-Type-Options", "nosniff")
        resp.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
        resp.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        if app.config.get("SESSION_COOKIE_SECURE"):
            resp.headers.setdefault("Strict-Transport-Security", "max-age=31536000")
        return resp

    @app.context_processor
    def inject():
        unread = 0
        if g.get("user"):
            unread = Notification.query.filter_by(user_id=g.user.id, read_at=None).count()
        return {
            "t": t, "loc": loc, "user": g.get("user"), "locale": g.get("locale", "ru"),
            "locales": LOCALES, "locale_names": LOCALE_NAMES, "csrf_token": csrf_token,
            "unread_count": unread, "static_v": _static_v(app), "video_embed": video_embed,
            "today": date.today(),
        }

    app.jinja_env.filters["md"] = render_markdown
    app.jinja_env.filters["loc"] = loc
    app.jinja_env.filters["dt"] = _fmt_dt
    app.jinja_env.filters["d"] = _fmt_date
    app.jinja_env.filters["mmss"] = fmt_seconds
    app.jinja_env.filters["size"] = human_size

    from .errors import register_errors
    register_errors(app)

    with app.app_context():
        db.create_all()
        from .seed import seed_content, seed_demo
        if app.config.get("SEED_DEMO"):
            seed_demo()
        elif app.config.get("SEED_CONTENT"):
            seed_content()

    from .cli import register_cli
    register_cli(app)
    return app


def _static_v(app):
    cache: dict[str, str] = {}

    def static_v(filename: str) -> str:
        from flask import url_for
        if filename not in cache:
            try:
                mtime = int(os.path.getmtime(os.path.join(app.static_folder, filename)))
            except OSError:
                mtime = 0
            cache[filename] = url_for("static", filename=filename, v=mtime)
        return cache[filename]
    return static_v


MONTHS = {
    "ru": ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
    "kk": ["қаң", "ақп", "нау", "сәу", "мам", "мау", "шіл", "там", "қыр", "қаз", "қар", "жел"],
    "en": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
}


def _fmt_date(value) -> str:
    if not value:
        return ""
    if isinstance(value, datetime):
        value = value.date()
    lang = g.get("locale", "ru")
    m = MONTHS.get(lang, MONTHS["ru"])[value.month - 1]
    if lang == "en":
        return f"{m} {value.day}, {value.year}"
    return f"{value.day} {m} {value.year}"


def _fmt_dt(value) -> str:
    if not value:
        return ""
    return f"{_fmt_date(value)}, {value:%H:%M}"
