"""USTEM Academy - LMS для подготовки учителей инженерного образования."""
from __future__ import annotations

import logging
import mimetypes
import os
from datetime import date, datetime

from flask import Flask, g, redirect, request, session, url_for
from markupsafe import Markup

from .config import Config

# MicroPython для симулятора SPIKE: браузер требует правильные типы для WebAssembly и ES-модулей
mimetypes.add_type("application/wasm", ".wasm")
mimetypes.add_type("text/javascript", ".mjs")
from .core import check_csrf, csrf_token, fmt_seconds, human_size, loc, render_markdown, video_embed
from .i18n import LOCALES, LOCALE_NAMES, SITE_LOCALE, UI_LOCALES, t
from .models import Notification, User, db, local_today


def create_app(config: type = Config, **overrides) -> Flask:
    app = Flask(__name__, static_folder="static", template_folder="templates")
    # за Caddy: настоящий IP посетителя из X-Forwarded-For (иначе все учителя «приходят» с одного адреса прокси,
    # и лимиты попыток входа и восстановления пароля срабатывают на всех сразу)
    from werkzeug.middleware.proxy_fix import ProxyFix
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
    app.config.from_object(config)
    app.config.update(overrides)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    logging.getLogger("fontTools").setLevel(logging.WARNING)

    db.init_app(app)
    if (not app.config.get("TESTING") and app.config.get("SESSION_COOKIE_SECURE")
            and app.config["SECRET_KEY"] == "dev-secret-change-me"):
        raise RuntimeError("Задайте SECRET_KEY в окружении для продакшена")

    from .blueprints import admin, api, auth, cohorts, efir, game, lab, learn, live, private_pages, public, reports, review, studio
    for bp in (public.bp, private_pages.bp, auth.bp, learn.bp, lab.bp, game.bp, live.bp, efir.bp, review.bp, cohorts.bp, studio.bp, admin.bp, reports.bp, api.bp):
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
        g.locale = session.get("locale") or (g.user.locale if g.user else None) or SITE_LOCALE
        if g.locale not in LOCALES:
            g.locale = SITE_LOCALE
        # самостоятельная регистрация: пока почта не подтверждена, открыты вход, выход, страница подтверждения и эфиры
        if g.user and request.endpoint and not request.endpoint.startswith(("auth.", "static", "public.", "live.", "efir.", "private.")):
            from .blueprints.auth import needs_verification
            if needs_verification(g.user):
                if request.path.startswith("/api/"):
                    return {"error": "email_not_verified"}, 403
                return redirect(url_for("auth.verify_needed"))

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
            "locales": LOCALES, "ui_locales": UI_LOCALES, "locale_names": LOCALE_NAMES, "csrf_token": csrf_token,
            "unread_count": unread, "static_v": _static_v(app), "video_embed": video_embed,
            "today": local_today(),
            "dir_icon": DIR_ICONS,
        }

    app.jinja_env.filters["md"] = render_markdown
    app.jinja_env.filters["loc"] = loc
    app.jinja_env.filters["dt"] = _fmt_dt
    app.jinja_env.filters["d"] = _fmt_date
    app.jinja_env.filters["when"] = _cohort_when
    app.jinja_env.filters["mmss"] = fmt_seconds
    app.jinja_env.filters["size"] = human_size

    from .errors import register_errors
    register_errors(app)

    with app.app_context():
        _sqlite_tweaks()
        from .dbinit import init_db
        init_db(app)
        from .seed import seed_content, seed_demo
        if app.config.get("SEED_DEMO"):
            seed_demo()
        elif app.config.get("SEED_CONTENT"):
            seed_content()
        if app.config.get("SEED_CONTENT") or app.config.get("SEED_DEMO"):
            from .content import ensure_all
            ensure_all()  # готовые курсы из app/content, которых еще нет в базе
        if not app.config.get("TESTING") and app.config.get("DB_AUTO_INIT", True):
            try:
                from .services.live import ensure_events
                ensure_events()  # эфиры из app/content/live_*.py (тексты вопросов обновляются)
            except Exception:  # эфир не должен мешать запуску Академии
                logging.getLogger("academy").exception("live: ensure_events failed")
                db.session.rollback()
        if not app.config.get("TESTING") and app.config.get("DB_AUTO_INIT", True):
            from .services.selfpaced import sync_all
            sync_all()  # постоянные потоки для программ «в своем темпе»
        db.session.remove()
        db.engine.dispose()  # gunicorn --preload: не передавать соединения в дочерние процессы

    from .cli import register_cli
    register_cli(app)
    return app


def _sqlite_tweaks():
    """SQLite: внешние ключи как в PostgreSQL и lower() с поддержкой кириллицы для поиска."""
    from sqlalchemy import event
    engine = db.engine
    if engine.dialect.name != "sqlite":
        return

    @event.listens_for(engine, "connect")
    def _on_connect(dbapi_conn, _record):
        dbapi_conn.execute("PRAGMA foreign_keys=ON")
        dbapi_conn.create_function("lower", 1, lambda s: s.lower() if isinstance(s, str) else s,
                                   deterministic=True)


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


DIR_ICONS = {
    "base": "🧭", "fll-future": "🧱", "ftc": "🔧", "battle-bots": "🤖", "physical-ai": "🦾", "drones": "🚁",
    "wso": "🚀", "future-race": "🏎️", "fll-challenge": "🏆", "fll-explore": "🔍", "ai-teacher": "✨", "first-season": "🌿", "electronics": "🔌", "other": "📘",
}

MONTHS = {
    "ru": ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
    "kk": ["қаң", "ақп", "нау", "сәу", "мам", "мау", "шіл", "там", "қыр", "қаз", "қар", "жел"],
    "en": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
}


def _cohort_when(cohort) -> str:
    """Когда идет поток: дата старта или «в любое время» для режима «в своем темпе»."""
    from .i18n import t
    return t("selfpaced.when") if getattr(cohort, "self_paced", False) else _fmt_date(cohort.start_date)


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
