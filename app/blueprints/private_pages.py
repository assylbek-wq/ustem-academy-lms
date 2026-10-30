"""Закрытые страницы по паролю, без учетной записи: готовый HTML лежит в app/private_pages/<slug>.html
(не в static, чтобы его нельзя было открыть в обход пароля), картинки страницы - в app/private_pages/<slug>/a/
(отдаются тоже только после пароля). В HTML можно вставить {{CSRF}} - для формы «Выйти». Хранится только хеш пароля; после верного
пароля доступ запоминается в сессии (сменили пароль - старый доступ перестает действовать)."""
from __future__ import annotations

from pathlib import Path

from flask import Blueprint, abort, make_response, redirect, render_template, request, send_from_directory, session, url_for
from werkzeug.security import check_password_hash

from ..core import csrf_token
from .auth import _rate_limited

bp = Blueprint("private", __name__)

PAGES_DIR = Path(__file__).resolve().parents[1] / "private_pages"

# slug -> (заголовок формы, хеш пароля: werkzeug.security.generate_password_hash)
PAGES = {
    "keleshek-osnashchenie": (
        "Келешек: оснащение школ",
        "scrypt:32768:8:1$srVFAvbia0KdcSKA$5dcabeec11150b0edaaa0f5d72ce9b55aad9be46c77f8d4b015e7496e1b977b219de7ad132d961da6351633c9e71a8c359c6410cbced1b611ebd73c1cfd70f57",
    ),
    "rukovodstvo": (
        "Руководство USTEM Academy для команды",
        "scrypt:32768:8:1$aQUt0mjI3aso1Kxi$d2092af565c8d1b3ff14037955b7e5542d36d6db569ca1f880359b0721a84738aaeca9044f637ae57af7a6fc1edbfca7f82f129f7d55b4143d10a646a9b150f6",
    ),
}


def _key(slug: str) -> str:
    return f"pp:{slug}"


def _closed(resp):
    resp.headers["Cache-Control"] = "private, no-store"
    resp.headers["X-Robots-Tag"] = "noindex, nofollow"
    resp.headers["Referrer-Policy"] = "no-referrer"
    return resp


def _allowed(slug: str) -> bool:
    return slug in PAGES and session.get(_key(slug)) == PAGES[slug][1][-12:]


@bp.route("/closed/<slug>/a/<path:name>")
def asset(slug: str, name: str):
    """Картинки закрытой страницы: только тем, кто ввел пароль."""
    if not _allowed(slug):
        abort(404)
    resp = send_from_directory(PAGES_DIR / slug / "a", name, max_age=3600)
    resp.headers["Cache-Control"] = "private, max-age=3600"
    resp.headers["X-Robots-Tag"] = "noindex, nofollow"
    return resp


@bp.route("/closed/<slug>", methods=["GET", "POST"])
def page(slug: str):
    if slug not in PAGES or not (PAGES_DIR / f"{slug}.html").exists():
        abort(404)
    title, pw_hash = PAGES[slug]
    error = False
    if request.method == "POST":
        if _rate_limited(f"pp:{request.remote_addr}", limit=10, window=300):
            abort(429)
        if check_password_hash(pw_hash, request.form.get("password", "")):
            session.permanent = True
            session[_key(slug)] = pw_hash[-12:]
            return redirect(url_for("private.page", slug=slug))
        error = True
    if _allowed(slug):
        resp = make_response((PAGES_DIR / f"{slug}.html").read_text(encoding="utf-8").replace("{{CSRF}}", csrf_token()))
        resp.headers["Content-Type"] = "text/html; charset=utf-8"
        resp.headers["X-Frame-Options"] = "DENY"
        return _closed(resp)
    return _closed(make_response(render_template("private/password.html", title=title, error=error), 401 if error else 200))


@bp.route("/closed/<slug>/logout", methods=["POST"])
def leave(slug: str):
    session.pop(_key(slug), None)
    return redirect(url_for("private.page", slug=slug))
