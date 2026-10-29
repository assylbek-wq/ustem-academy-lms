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


# ─── Скачивание: слайды с окном камеры и QR ──────────────────────────────
W, H = 1920, 1080
_FONTS = {}


def _font(bold: bool, size: int):
    from PIL import ImageFont
    key = (bold, size)
    if key not in _FONTS:
        from pathlib import Path as _P
        f = _P(current_app.static_folder) / "fonts" / ("UstemSans-Bold.ttf" if bold else "UstemSans.ttf")
        try:
            _FONTS[key] = ImageFont.truetype(str(f), size)
        except OSError:
            _FONTS[key] = ImageFont.load_default()
    return _FONTS[key]


def _cover():
    """Синий фон как на экране эфира (обложка отчетов «Келешек»)."""
    from PIL import Image
    stops = [(0, (0, 87, 200)), (.38, (0, 117, 242)), (.72, (24, 156, 217)), (1, (82, 189, 234))]
    strip = Image.new("RGB", (W + H // 2, 1))
    px = strip.load()
    n = W + H // 2
    for x in range(n):
        tt = x / (n - 1)
        for i in range(len(stops) - 1):
            a, ca = stops[i]
            b, cb = stops[i + 1]
            if a <= tt <= b:
                k = (tt - a) / (b - a)
                px[x, 0] = tuple(round(ca[j] + (cb[j] - ca[j]) * k) for j in range(3))
                break
    img = Image.new("RGB", (W, H))
    for y in range(H):  # наклон 120 градусов: каждая строка сдвинута
        off = (H - y) // 2
        img.paste(strip.crop((off, 0, off + W, 1)), (0, y))
    return img.convert("RGBA")


def _rr_mask(size, box, r):
    from PIL import Image, ImageDraw
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle(box, radius=r, fill=255)
    return m


def _fit(img, bw, bh):
    from PIL import Image
    k = min(bw / img.width, bh / img.height)
    return img.resize((max(1, round(img.width * k)), max(1, round(img.height * k))), Image.LANCZOS)


def _wrap(draw, text, font, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if draw.textlength(t, font=font) <= width or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines[:3]


def render(ev: LiveEvent, s: dict, links: dict, transparent: bool, cover=None, labels: dict | None = None):
    """Один слайд 1920 x 1080 так же, как его показывает экран эфира. transparent - окно камеры прозрачное (PNG для OBS),
    иначе в окне заглушка «Камера спикера» (PDF для просмотра и печати)."""
    from PIL import Image, ImageDraw
    import io
    import segno
    deck = get(ev)
    cam = CAM[deck["cam"]]
    lay = s.get("layout", "side")
    src = Image.open(folder(ev) / f"{s['id']}.jpg").convert("RGBA")
    canvas = (cover or _cover()).copy() if lay != "full" else Image.new("RGBA", (W, H), (11, 19, 34, 255))
    if lay == "side":
        top = 124 if deck["cam"] == "br" else 148
        im = _fit(src, 1436, 808)
        canvas.alpha_composite(im, (24 + (1436 - im.width) // 2, top + (808 - im.height) // 2))
    else:
        im = _fit(src, W, H)
        canvas.alpha_composite(im, ((W - im.width) // 2, (H - im.height) // 2))
    d = ImageDraw.Draw(canvas)
    if lay != "full":
        x, y, w, h = cam["x"], cam["y"], cam["w"], cam["h"]
        ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        rd = ImageDraw.Draw(ring)
        rd.rounded_rectangle((x - 6, y - 6, x + w + 6, y + h + 6), radius=30, fill=(0, 117, 242, 255))
        canvas.alpha_composite(ring)
        hole = _rr_mask((W, H), (x, y, x + w, y + h), 24)
        if transparent:
            a = canvas.getchannel("A")
            a.paste(0, mask=hole)
            canvas.putalpha(a)
        else:
            ph = Image.new("RGBA", (W, H), (31, 47, 74, 255))
            canvas.paste(ph, (0, 0), hole)
            lab = (labels or {}).get("cam", "Камера")
            f = _font(True, 28)
            tw = d.textlength(lab, font=f)
            d.text((x + (w - tw) / 2, y + h / 2 - 16), lab, font=f, fill=(201, 214, 232))
    q = s.get("qr") or {}
    url = qr_url(s, links) if q.get("on") else ""
    if url:
        buf = io.BytesIO()
        segno.make(url, error="m").save(buf, kind="png", scale=10, border=1, dark="#0b0b12", light="#ffffff")
        qimg = Image.open(io.BytesIO(buf.getvalue())).convert("RGBA")
        label = q.get("label") or (labels or {}).get(q.get("to", "watch"), "")
        show = re.sub(r"^https?://", "", url).split("?")[0].rstrip("/")
        if lay == "side":
            bw = cam["w"]
            qs = 230 if deck["cam"] == "br" else 250
            bx = cam["x"]
            by = 148 if deck["cam"] == "br" else cam["y"] + cam["h"] + 30
        else:
            bw, qs = 300, 264
            bx = 40 if q.get("pos") == "bl" else W - 340
            by = None
        fb, fm = _font(True, 26), _font(False, 17)
        lines = _wrap(d, label, fb, bw - 36) if label else []
        slines = _wrap(d, show, fm, bw - 36)
        bh = 18 + qs + (10 + 31 * len(lines) if lines else 0) + 6 + 22 * len(slines) + 18
        if by is None:
            by = H - 40 - bh
        d.rounded_rectangle((bx, by, bx + bw, by + bh), radius=26, fill=(255, 255, 255, 255))
        canvas.alpha_composite(qimg.resize((qs, qs), Image.NEAREST), (bx + (bw - qs) // 2, by + 18))
        ty = by + 18 + qs + 10
        for ln in lines:
            d.text((bx + (bw - d.textlength(ln, font=fb)) / 2, ty), ln, font=fb, fill=(27, 31, 36))
            ty += 31
        ty += 6
        for ln in slines:
            d.text((bx + (bw - d.textlength(ln, font=fm)) / 2, ty), ln, font=fm, fill=(0, 105, 218))
            ty += 22
    return canvas


def export(ev: LiveEvent, links: dict, kind: str, labels: dict) -> tuple[bytes, str, str]:
    """kind = pdf (все слайды, окно камеры с заглушкой) или zip (PNG с прозрачным окном для OBS)."""
    import io
    import zipfile
    deck = get(ev)
    if not deck["slides"]:
        raise DeckError("live.d_none")
    cover = _cover()
    buf = io.BytesIO()
    if kind == "pdf":
        pages = [render(ev, s, links, False, cover, labels).convert("RGB") for s in deck["slides"]]
        pages[0].save(buf, "PDF", save_all=True, append_images=pages[1:], resolution=144)
        return buf.getvalue(), "application/pdf", f"slides-{ev.slug}.pdf"
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        for i, s in enumerate(deck["slides"]):
            b = io.BytesIO()
            render(ev, s, links, True, cover, labels).save(b, "PNG", optimize=True)
            z.writestr(f"slide-{i + 1:02d}.png", b.getvalue())
    return buf.getvalue(), "application/zip", f"slides-{ev.slug}-obs.zip"


# ─── Обложка для YouTube 1280 x 720 ──────────────────────────────────────
def speaker_path(ev: LiveEvent) -> Path:
    return folder(ev) / "speaker.jpg"


def save_speaker(ev: LiveEvent, data: bytes) -> None:
    from PIL import Image, ImageOps
    import io
    try:
        im = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert("RGB")
    except Exception as exc:
        raise DeckError("live.yt_err_photo") from exc
    side = min(im.size)  # квадрат по центру, сверху чуть больше: лицо обычно в верхней части кадра
    left, top = (im.width - side) // 2, max(0, (im.height - side) // 4)
    im.crop((left, top, left + side, top + side)).resize((800, 800), Image.LANCZOS).save(speaker_path(ev), "JPEG", quality=90)


def _dots(img, step=26):
    from PIL import ImageDraw
    import math
    from PIL import Image
    w, h = img.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy, R = w * .72, h * .35, max(w, h) * .75
    for y in range(step // 2, h, step):
        for x in range(step // 2, w, step):
            dd = math.hypot(x - cx, y - cy) / R
            a = max(0, .06 + .22 * dd * (.5 + .5 * math.sin(dd * 14)))
            d.ellipse((x - 1.6, y - 1.6, x + 1.6, y + 1.6), fill=(255, 255, 255, int(255 * a)))
    out = img.copy()
    out.alpha_composite(layer)
    return out


def youtube_cover(ev: LiveEvent, lang: str, labels: dict, url: str) -> bytes:
    """Обложка эфира для YouTube (1280 x 720, JPEG до 2 МБ) в стиле экрана эфира."""
    from PIL import Image, ImageDraw, ImageFilter
    from pathlib import Path as _P
    import io
    from . import live_builder as lb
    Wc, Hc = 1280, 720
    img = _cover().resize((Wc, Hc), Image.LANCZOS)
    blobs = Image.new("RGBA", (Wc, Hc), (0, 0, 0, 0))
    bd = ImageDraw.Draw(blobs)
    bd.ellipse((Wc - 200, -220, Wc + 180, 160), fill=(127, 214, 255, 120))
    bd.ellipse((-200, Hc - 200, 160, Hc + 220), fill=(0, 63, 166, 140))
    img.alpha_composite(blobs.filter(ImageFilter.GaussianBlur(70)))
    img = _dots(img)
    d = ImageDraw.Draw(img)
    pad = 64
    # логотип
    logo_p = _P(current_app.static_folder) / "img" / "ustem-foundation-white.webp"
    try:
        logo = Image.open(logo_p).convert("RGBA")
        logo = logo.resize((int(logo.width * 58 / logo.height), 58), Image.LANCZOS)
        img.alpha_composite(logo, (pad, 48))
    except OSError:
        pass
    # плашка LIVE и дата справа сверху
    fm = _font(True, 24)
    when = ""
    if ev.starts_at:
        when = f"{lb.date_label(ev.starts_at, lang)} · {ev.starts_at.strftime('%H:%M')}"
    x = Wc - pad
    if when:
        tw = d.textlength(when, font=fm)
        d.rounded_rectangle((x - tw - 36, 52, x, 100), radius=24, fill=(255, 255, 255, 255))
        d.text((x - tw - 18, 61), when, font=fm, fill=(0, 87, 200))
        x -= tw + 36 + 12
    live = labels.get("live", "LIVE")
    tw = d.textlength(live, font=fm)
    d.rounded_rectangle((x - tw - 58, 52, x, 100), radius=24, fill=(229, 72, 77, 255))
    d.ellipse((x - tw - 40, 70, x - tw - 28, 82), fill=(255, 255, 255))
    d.text((x - tw - 18, 61), live, font=fm, fill=(255, 255, 255))
    # фото спикера
    texts = ev.texts or {}
    photo = speaker_path(ev)
    has_photo = photo.exists()
    col_w = Wc - 2 * pad
    if has_photo:
        size = 380
        px, py = Wc - pad - size, 170
        ph = Image.open(photo).convert("RGBA").resize((size, size), Image.LANCZOS)
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
        ring = Image.new("RGBA", (size + 20, size + 20), (0, 0, 0, 0))
        ImageDraw.Draw(ring).ellipse((0, 0, size + 19, size + 19), fill=(255, 255, 255, 255))
        img.alpha_composite(ring, (px - 10, py - 10))
        img.paste(ph, (px, py), mask)
        name, role = (texts.get("speaker_name") or "").strip(), (texts.get("speaker_role") or "").strip()
        if name:
            fn, fr = _font(True, 30), _font(False, 22)
            nl = _wrap(d, name, fn, size + 40)[:1]
            rl = _wrap(d, role, fr, size + 40)[:2] if role else []
            bh = 22 + 38 * len(nl) + 28 * len(rl) + 16
            by = py + size + 26
            d.rounded_rectangle((px - 20, by, px + size + 20, by + bh), radius=18, fill=(255, 255, 255, 255))
            ty = by + 14
            for ln in nl:
                d.text((px + size / 2 - d.textlength(ln, font=fn) / 2, ty), ln, font=fn, fill=(27, 31, 36))
                ty += 38
            for ln in rl:
                d.text((px + size / 2 - d.textlength(ln, font=fr) / 2, ty), ln, font=fr, fill=(92, 102, 112))
                ty += 28
        col_w = px - pad - 50
    # надпись над названием
    kick = (texts.get("partners") or "USTEM Foundation").upper()
    fk = _font(True, 22)
    kl = _wrap(d, kick, fk, col_w)[:1]
    y = 190
    for ln in kl:
        d.text((pad, y), ln, font=fk, fill=(205, 238, 255))
        y += 34
    y += 8
    # название: подбираем размер, чтобы влезло в 3 строки
    title = ((ev.title or {}).get(lang) or (ev.title or {}).get("kk") or (ev.title or {}).get("ru") or "").split("·")[0].strip()
    for size in (104, 96, 88, 80, 72, 64, 58, 52):
        ft = _font(True, size)
        lines = _wrap(d, title, ft, col_w)
        if len(lines) <= 3 and all(d.textlength(l, font=ft) <= col_w for l in lines):
            break
    lh = int(size * 1.06)
    for ln in lines:
        d.text((pad, y), ln, font=ft, fill=(255, 255, 255))
        y += lh
    sub = ((ev.subtitle or {}).get(lang) or "").strip()
    if sub:
        fs = _font(False, 30)
        y += 14
        for ln in _wrap(d, sub, fs, col_w)[:2]:
            d.text((pad, y), ln, font=fs, fill=(234, 243, 255))
            y += 40
    # ссылка на эфир внизу
    show = re.sub(r"^https?://", "", url).split("?")[0]
    fu = _font(True, 26)
    tw = d.textlength(show, font=fu)
    d.rounded_rectangle((pad, Hc - 98, pad + tw + 44, Hc - 48), radius=25, fill=(0, 40, 110, 90), outline=(255, 255, 255, 120), width=2)
    d.text((pad + 22, Hc - 88), show, font=fu, fill=(255, 255, 255))
    out = io.BytesIO()
    img.convert("RGB").save(out, "JPEG", quality=90, optimize=True, progressive=True)
    return out.getvalue()
