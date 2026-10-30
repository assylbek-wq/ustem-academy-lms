"""Партнеры эфира студии: логотип, название, сайт и подпись («Генеральный партнер»).

Список хранится в EfirEvent.texts["logos"] = [{"id", "name", "url", "label", "w", "h"}], картинки - PNG в
UPLOAD_DIR/efir/<id эфира>/partners/<id>.png (до 600 x 240, прозрачность сохраняется). Логотипы публичные:
их видят экран эфира (и YouTube), страница учителя и приглашение до входа.
"""
from __future__ import annotations

import io
import re
import secrets
import shutil

from ..models import EfirEvent, db
from . import efir_deck

MAX_PARTNERS = 12
MAX_BYTES = 8 * 1024 * 1024
BOX = (600, 240)


class PartnerError(ValueError):
    """Ошибка: ключ строки i18n."""


def items(ev: EfirEvent) -> list[dict]:
    return [dict(p) for p in ((ev.texts or {}).get("logos") or []) if isinstance(p, dict) and p.get("id")]


def get(ev: EfirEvent, pid: str) -> dict | None:
    return next((p for p in items(ev) if p["id"] == pid), None)


def folder(ev: EfirEvent):
    p = efir_deck.folder(ev) / "partners"
    p.mkdir(parents=True, exist_ok=True)
    return p


def path(ev: EfirEvent, pid: str):
    return folder(ev) / f"{pid}.png"


def _save(ev: EfirEvent, lst: list[dict]) -> None:
    texts = dict(ev.texts or {})
    texts["logos"] = lst
    ev.texts = texts
    db.session.commit()


def _clean_url(u: str | None) -> str:
    u = (u or "").strip()[:300]
    if not u:
        return ""
    if not re.match(r"https?://", u, re.I):
        u = "https://" + u
    if not re.fullmatch(r"https?://[^\s<>\"']+\.[^\s<>\"']+", u):
        raise PartnerError("efir.p_err_url")
    return u


def _text(s: str | None, n: int) -> str:
    return " ".join(str(s or "").split())[:n]


def _logo(data: bytes) -> tuple[bytes, int, int]:
    """Картинка -> PNG в рамке 600 x 240, лишние прозрачные поля обрезаны."""
    from PIL import Image, UnidentifiedImageError
    if not data or len(data) > MAX_BYTES:
        raise PartnerError("efir.p_err_logo")
    try:
        im = Image.open(io.BytesIO(data))
        im.load()
    except (UnidentifiedImageError, OSError):
        raise PartnerError("efir.p_err_logo")
    im = im.convert("RGBA")
    box = im.getchannel("A").getbbox()
    if box:
        im = im.crop(box)
    im.thumbnail(BOX, Image.LANCZOS)
    out = io.BytesIO()
    im.save(out, "PNG", optimize=True)
    return out.getvalue(), im.width, im.height


def add(ev: EfirEvent, name: str, url: str | None, label: str | None, logo: bytes) -> dict:
    lst = items(ev)
    if len(lst) >= MAX_PARTNERS:
        raise PartnerError("efir.p_err_many")
    name = _text(name, 80)
    if not name:
        raise PartnerError("efir.p_err_name")
    url = _clean_url(url)
    png, w, h = _logo(logo)
    p = {"id": secrets.token_hex(6), "name": name, "url": url, "label": _text(label, 60), "w": w, "h": h}
    path(ev, p["id"]).write_bytes(png)
    lst.append(p)
    _save(ev, lst)
    return p


def update(ev: EfirEvent, pid: str, f: dict, logo: bytes | None = None) -> None:
    lst = items(ev)
    for p in lst:
        if p["id"] != pid:
            continue
        if "name" in f:
            p["name"] = _text(f.get("name"), 80) or p["name"]
        if "url" in f:
            p["url"] = _clean_url(f.get("url"))
        if "label" in f:
            p["label"] = _text(f.get("label"), 60)
        if logo:
            png, p["w"], p["h"] = _logo(logo)
            path(ev, pid).write_bytes(png)
            p["v"] = int(p.get("v") or 0) + 1
    _save(ev, lst)


def remove(ev: EfirEvent, pid: str) -> None:
    path(ev, pid).unlink(missing_ok=True)
    _save(ev, [p for p in items(ev) if p["id"] != pid])


def reorder(ev: EfirEvent, ids: list) -> None:
    lst = items(ev)
    pos = {str(i): n for n, i in enumerate(ids or [])}
    lst.sort(key=lambda p: pos.get(p["id"], len(pos)))
    _save(ev, lst)


def copy(src: EfirEvent, dst: EfirEvent) -> None:
    """Копия эфира: логотипы копируются файлами (texts копирует create сам)."""
    for p in items(src):
        if path(src, p["id"]).exists():
            shutil.copy2(path(src, p["id"]), path(dst, p["id"]))
