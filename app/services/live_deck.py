"""Презентация эфира: слайды из PDF с окном для камеры спикера и QR-кодом.

Методист загружает PDF в конструкторе, каждая страница становится картинкой 1920 px (UPLOAD_DIR/live/<id эфира>/).
Для слайда выбирается раскладка:
  full - слайд на весь экран, камеры нет;
  cam  - слайд на весь экран, в углу прозрачное окно для камеры (подходит, если угол слайда пустой);
  side - слайд уменьшен слева, справа колонка с окном камеры (и QR под ней): содержимое слайда не перекрывается.
Окно камеры на всех слайдах в одном месте (cam = tr | br): в OBS камера ставится один раз под источник Browser,
экран Академии в этом месте прозрачный. QR на слайде ведет на эфир, Connect, бота или свою ссылку.
"""
from __future__ import annotations

import re
import secrets
import shutil
from pathlib import Path

from flask import current_app

from ..models import LiveEvent, db

LAYOUTS = ("full", "cam", "side")
QR_TO = ("watch", "connect", "bot", "url")
CAM = {"tr": {"x": 1484, "y": 148, "w": 392, "h": 392}, "br": {"x": 1484, "y": 540, "w": 392, "h": 392}}
MAX_SLIDES = 120
WIDTH = 1920
THUMB = 480


class DeckError(ValueError):
    """Ошибка: ключ строки i18n."""


def folder(ev: LiveEvent) -> Path:
    p = Path(current_app.config["UPLOAD_DIR"]) / "live" / str(ev.id)
    p.mkdir(parents=True, exist_ok=True)
    return p


def get(ev: LiveEvent) -> dict:
    d = dict(ev.deck or {})
    d.setdefault("cam", "tr")
    d.setdefault("v", 0)
    d.setdefault("slides", [])
    return d


def _default_slide(sid: str, w: int, h: int) -> dict:
    return {"id": sid, "w": w, "h": h, "layout": "side",
            "qr": {"on": False, "to": "watch", "url": "", "label": "", "pos": "br"}}


def render_pdf(ev: LiveEvent, data: bytes, replace: bool = False) -> int:
    """Страницы PDF -> JPEG 1920 px и миниатюры 480 px. Возвращает число добавленных слайдов."""
    import pypdfium2 as pdfium
    if not data.startswith(b"%PDF"):
        raise DeckError("live.d_err_pdf")
    try:
        pdf = pdfium.PdfDocument(data)
    except Exception as exc:  # битый или зашифрованный файл
        raise DeckError("live.d_err_pdf") from exc
    deck = get(ev)
    slides = [] if replace else list(deck["slides"])
    n = len(pdf)
    if not n or len(slides) + n > MAX_SLIDES:
        raise DeckError("live.d_err_many")
    if replace:
        _drop_files(ev, [s["id"] for s in deck["slides"]])
    out = folder(ev)
    added = 0
    for i in range(n):
        page = pdf[i]
        pw, ph = page.get_size()
        scale = WIDTH / pw if pw else 2
        img = page.render(scale=scale).to_pil().convert("RGB")
        sid = secrets.token_hex(8)
        img.save(out / f"{sid}.jpg", "JPEG", quality=88, optimize=True, progressive=True)
        th = img.copy()
        th.thumbnail((THUMB, THUMB * 2))
        th.save(out / f"{sid}-t.jpg", "JPEG", quality=80, optimize=True)
        slides.append(_default_slide(sid, img.width, img.height))
        added += 1
    pdf.close()
    deck["slides"] = slides
    deck["v"] = int(deck["v"]) + 1
    ev.deck = deck
    db.session.commit()
    return added


def _drop_files(ev: LiveEvent, ids: list[str]) -> None:
    out = folder(ev)
    for sid in ids:
        for name in (f"{sid}.jpg", f"{sid}-t.jpg"):
            try:
                (out / name).unlink()
            except FileNotFoundError:
                pass


def save(ev: LiveEvent, f: dict) -> dict:
    """Сохранить порядок слайдов, раскладку, QR и место камеры. Слайды, которых нет в списке, удаляются."""
    deck = get(ev)
    have = {s["id"]: s for s in deck["slides"]}
    if f.get("cam") in CAM:
        deck["cam"] = f["cam"]
    if isinstance(f.get("slides"), list):
        new = []
        for x in f["slides"]:
            if not isinstance(x, dict) or x.get("id") not in have or any(n["id"] == x["id"] for n in new):
                continue
            s = dict(have[x["id"]])
            if x.get("layout") in LAYOUTS:
                s["layout"] = x["layout"]
            q = x.get("qr") if isinstance(x.get("qr"), dict) else {}
            if q:
                url = (q.get("url") or "").strip()[:400]
                if url and not re.match(r"^https?://", url):
                    url = "https://" + url
                s["qr"] = {"on": bool(q.get("on")), "to": q.get("to") if q.get("to") in QR_TO else "watch",
                           "url": url, "label": (q.get("label") or "").strip()[:80],
                           "pos": q.get("pos") if q.get("pos") in ("bl", "br") else "br"}
            new.append(s)
        gone = [sid for sid in have if sid not in {n["id"] for n in new}]
        _drop_files(ev, gone)
        deck["slides"] = new
    deck["v"] = int(deck["v"]) + 1
    ev.deck = deck
    db.session.commit()
    return deck


def copy(src: LiveEvent, dst: LiveEvent) -> None:
    """Копия эфира получает свою копию слайдов (файлы копируются, чтобы удаление в одном не ломало другой)."""
    deck = get(src)
    if not deck["slides"]:
        return
    a, b = folder(src), folder(dst)
    for s in deck["slides"]:
        for name in (f"{s['id']}.jpg", f"{s['id']}-t.jpg"):
            if (a / name).exists():
                shutil.copy2(a / name, b / name)
    dst.deck = {"cam": deck["cam"], "v": 1, "slides": [dict(s) for s in deck["slides"]]}


def remove_all(ev: LiveEvent) -> None:
    shutil.rmtree(folder(ev), ignore_errors=True)


def qr_url(s: dict, links: dict) -> str:
    q = s.get("qr") or {}
    if q.get("to") == "url":
        return q.get("url") or ""
    return links.get("academy" if q.get("to", "watch") == "watch" else q.get("to")) or ""


_qr_cache: dict[str, str] = {}


def qr_svg(url: str) -> str:
    if url not in _qr_cache:
        import segno
        if len(_qr_cache) > 200:
            _qr_cache.clear()
        _qr_cache[url] = segno.make(url, error="m").svg_inline(scale=10, border=2, dark="#0b0b12", light="#ffffff",
                                                                omitsize=True)
    return _qr_cache[url]


def for_screen(ev: LiveEvent, links: dict, key: str = "") -> dict:
    """Презентация для экрана: картинки, раскладки, готовые QR (svg) и подписи."""
    from flask import url_for
    deck = get(ev)
    out = []
    for s in deck["slides"]:
        q = dict(s.get("qr") or {})
        url = qr_url(s, links) if q.get("on") else ""
        q["svg"] = qr_svg(url) if url else ""
        q["show"] = re.sub(r"^https?://", "", url).split("?")[0].rstrip("/") if url else ""
        out.append({"id": s["id"], "layout": s.get("layout", "side"), "w": s.get("w"), "h": s.get("h"), "qr": q,
                    "img": url_for("live.slide_img", slug=ev.slug, name=f"{s['id']}.jpg", key=key or None)})
    return {"v": deck["v"], "cam": CAM[deck["cam"]], "cam_pos": deck["cam"], "slides": out}
