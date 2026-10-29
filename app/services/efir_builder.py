"""Конструктор эфиров (/efir, /efir/<slug>/build): создать, скопировать, настроить эфир и собрать вопросы.

Эфир целиком хранится в базе (EfirEvent + EfirQuestion). Код эфира (slug) - это адрес для учителей
academy.ustem.kz/efir/<slug>, его можно менять, пока на эфир никто не заходил.
Быстрая сборка вопросов: вставка текстом (parse_paste), ИИ по презентации (ai_questions), ИИ-перевод (ai_translate).
"""
from __future__ import annotations

import base64
import json
import logging
import re
from datetime import datetime

from flask import current_app

from ..models import EfirAnswer, EfirEvent, EfirQuestion, EfirViewer, db, new_token
from . import efir as svc

log = logging.getLogger("academy.live")

LANGS = ("kk", "ru")
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$")
RESERVED = {"new", "build", "control", "stats", "screen", "overlay", "static", "api", "admin"}
DEFAULT_LINKS = {"connect": "https://connect.ustem.kz/register", "bot": "https://t.me/UstemConnectBot"}
MONTHS = {
    "kk": ("қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"),
    "ru": ("января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"),
}
KIND = {"kk": "Вебинар", "ru": "Вебинар"}


KK_LETTERS = re.compile(r"[әғқңөұүһіӘҒҚҢӨҰҮҺІ]")


def guess_lang(text: str) -> str:
    """Казахский, если в тексте есть казахские буквы, иначе русский."""
    return "kk" if KK_LETTERS.search(text or "") else "ru"


class BuildError(ValueError):
    """Ошибка ввода: ключ строки i18n."""


# ─── Тексты по умолчанию ─────────────────────────────────────────────────
def date_label(dt: datetime | None, lang: str) -> str:
    if not dt:
        return ""
    return f"{dt.day} {MONTHS[lang][dt.month - 1]} {dt.year}"


def kicker(ev: EfirEvent, lang: str) -> str:
    """Подпись над названием на экране: из конструктора или «Вебинар · 3 ноября 2026»."""
    own = ((ev.texts or {}).get("kicker") or {}).get(lang) or ((ev.texts or {}).get("kicker") or {}).get("kk")
    if own:
        return own
    lang = lang if lang in LANGS else "kk"
    return " · ".join(x for x in (KIND[lang], date_label(ev.starts_at, lang)) if x)


def bot_handle(url: str | None) -> str:
    m = re.search(r"t\.me/([A-Za-z0-9_]{3,})", url or "")
    return "@" + m.group(1) if m else ""


# ─── Список, создание, копия ─────────────────────────────────────────────
def status(ev: EfirEvent, now: datetime) -> str:
    mode = (ev.state or {}).get("mode") or "waiting"
    if ev.archived:
        return "archived"
    if mode not in ("waiting", "finish"):
        return "live"
    if mode == "finish" or (ev.starts_at and ev.starts_at < now and EfirViewer.query.filter_by(event_id=ev.id).first()):
        return "done"
    return "soon" if ev.starts_at else "draft"


def unique_slug(base: str) -> str:
    from ..blueprints.studio import slugify
    base = slugify(base)[:30].strip("-") or "efir"
    if len(base) < 3 or base in RESERVED:
        base = f"efir-{base}".strip("-")
    slug, n = base, 2
    while EfirEvent.query.filter_by(slug=slug).first():
        slug, n = f"{base}-{n}", n + 1
    return slug


def _ml(d, limit: int = 300) -> dict:
    d = d if isinstance(d, dict) else {}
    return {k: str(d.get(k) or "").strip()[:limit] for k in LANGS if str(d.get(k) or "").strip()}


def _parse_dt(s: str | None) -> datetime | None:
    s = (s or "").strip()
    if not s:
        return None
    for fmt in ("%Y-%m-%dT%H:%M", "%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(s, fmt)
        except ValueError:
            pass
    raise BuildError("live.b_err_date")


def create(title: dict, starts_at: str | None, user_id: int | None, source: EfirEvent | None = None,
           with_questions: bool = True) -> EfirEvent:
    """Новый эфир: пустой (с одним блоком) или копия source (тексты, программа, ссылки, вопросы)."""
    title = _ml(title, 160)
    if not title:
        raise BuildError("live.b_err_title")
    when = _parse_dt(starts_at)
    ev = EfirEvent(slug=unique_slug(title.get("ru") or title.get("kk") or ""), title=title,
                   state={"mode": "waiting", "v": 1}, starts_at=when, created_by=user_id, screen_key=new_token(18))
    if source:
        ev.subtitle = dict(source.subtitle or {})
        ev.links = dict(source.links or {})
        ev.blocks = [dict(b) for b in (source.blocks or [])]
        texts = dict(source.texts or {})
        texts.pop("kicker", None)  # подпись с датой у копии своя
        ev.texts = texts
        ev.lang = source.lang or "kk"
    else:
        ev.subtitle, ev.links, ev.texts, ev.lang = {}, dict(DEFAULT_LINKS), {"partners": "USTEM Foundation"}, "kk"
        ev.blocks = [{"kk": "Негізгі бөлім", "ru": "Основная часть"}]
    db.session.add(ev)
    db.session.flush()
    if source:
        from . import efir_deck
        efir_deck.copy(source, ev)
    if source and with_questions:
        for i, q in enumerate(EfirQuestion.query.filter_by(event_id=source.id).order_by(EfirQuestion.position)):
            db.session.add(EfirQuestion(event_id=ev.id, key=f"c{i + 1}", block=q.block, position=i, text=dict(q.text or {}),
                                        options=[dict(o) for o in (q.options or [])], correct=q.correct,
                                        note=dict(q.note or {}), seconds=q.seconds))
    db.session.commit()
    return ev


def import_live(src, user_id: int | None, slug: str | None = None) -> EfirEvent:
    """Перенести вебинар из /live в студию: тексты, программа, ссылки, YouTube, слайды и вопросы. /live не меняется."""
    import shutil
    from . import live_deck
    ev = EfirEvent(slug=slug or unique_slug((src.title or {}).get("ru") or (src.title or {}).get("kk") or src.slug),
                   title=dict(src.title or {}), subtitle=dict(src.subtitle or {}), youtube_id=src.youtube_id,
                   starts_at=src.starts_at, state={"mode": "waiting", "v": 1}, links=dict(src.links or {}),
                   blocks=[dict(b) for b in (src.blocks or [])], texts=dict(src.texts or {}), lang=src.lang or "kk",
                   created_by=user_id, screen_key=new_token(18), guest_key=new_token(18))
    db.session.add(ev)
    db.session.flush()
    deck = live_deck.get(src)
    if deck["slides"]:
        from . import efir_deck
        a, b = live_deck.folder(src), efir_deck.folder(ev)
        for sl in deck["slides"]:
            for name in (f"{sl['id']}.jpg", f"{sl['id']}-t.jpg"):
                if (a / name).exists():
                    shutil.copy2(a / name, b / name)
        ev.deck = {"cam": deck["cam"], "v": 1, "slides": [dict(sl) for sl in deck["slides"]]}
    for i, q in enumerate(_live_questions(src)):
        db.session.add(EfirQuestion(event_id=ev.id, key=q.key, block=q.block, position=i, text=dict(q.text or {}),
                                    options=[dict(o) for o in (q.options or [])], correct=q.correct,
                                    note=dict(q.note or {}), seconds=q.seconds))
    db.session.commit()
    return ev


def _live_questions(src):
    from ..models import LiveQuestion
    return LiveQuestion.query.filter_by(event_id=src.id).order_by(LiveQuestion.position).all()


# ─── Настройки ───────────────────────────────────────────────────────────
def has_viewers(ev: EfirEvent) -> bool:
    return EfirViewer.query.filter_by(event_id=ev.id).first() is not None


def save_settings(ev: EfirEvent, f: dict) -> list[str]:
    """Сохранить основное, экран и ссылки. Возвращает список измененных полей. Ошибка ввода - BuildError."""
    changed = []
    if "title" in f:
        title = _ml(f.get("title"), 160)
        if not title:
            raise BuildError("live.b_err_title")
        ev.title = title
        changed.append("title")
    if "subtitle" in f:
        ev.subtitle = _ml(f.get("subtitle"), 300)
    if "starts_at" in f:
        ev.starts_at = _parse_dt(f.get("starts_at"))
    if "youtube" in f:
        raw = (f.get("youtube") or "").strip()
        if raw:
            from ..blueprints.efir import YT_RE
            m = YT_RE.search(raw)
            yid = m.group(1) if m else (raw if re.fullmatch(r"[A-Za-z0-9_-]{11}", raw) else None)
            if not yid:
                raise BuildError("live.err_youtube")
            ev.youtube_id = yid
        else:
            ev.youtube_id = None
    if f.get("lang") in LANGS:
        ev.lang = f["lang"]
    if "stream_url" in f:
        u = (f.get("stream_url") or "").strip()[:255]
        if u and not u.startswith(("rtmp://", "rtmps://")):
            raise BuildError("efir.s_err_url")
        ev.stream_url = u or None
    if "stream_key" in f:  # ключ YouTube: пустое значение не стирает сохраненный, стереть - "-"
        k = (f.get("stream_key") or "").strip()[:255]
        if k == "-":
            ev.stream_key = None
        elif k:
            if not re.fullmatch(r"[A-Za-z0-9_\-]{4,255}", k):
                raise BuildError("efir.s_err_key")
            ev.stream_key = k
    texts = dict(ev.texts or {})
    if "partners" in f:
        texts["partners"] = (f.get("partners") or "").strip()[:160]
    for k in ("speaker_name", "speaker_role"):
        if k in f:
            texts[k] = (f.get(k) or "").strip()[:120]
    for k in ("kicker", "finish"):
        if k in f:
            v = _ml(f.get(k), 300)
            if v:
                texts[k] = v
            else:
                texts.pop(k, None)
    ev.texts = texts
    if "links" in f and isinstance(f["links"], dict):
        links = {}
        for k in ("connect", "bot"):
            u = (f["links"].get(k) or "").strip()[:300]
            if u:
                if not re.match(r"^https?://", u):
                    u = "https://" + u
                links[k] = u
        ev.links = links
    if "blocks" in f and isinstance(f["blocks"], list):
        bl = [_ml(b, 120) for b in f["blocks"]][:20]
        bl = [b if b else {"kk": f"Блок {i + 1}", "ru": f"Блок {i + 1}"} for i, b in enumerate(bl)]
        if not bl:
            raise BuildError("live.b_err_blocks")
        used = {q.block for q in EfirQuestion.query.filter_by(event_id=ev.id)}
        if used and max(used) > len(bl):
            raise BuildError("live.b_err_block_used")
        ev.blocks = bl
    if "slug" in f:
        slug = (f.get("slug") or "").strip().lower()
        if slug != ev.slug:
            if not SLUG_RE.match(slug) or slug in RESERVED:
                raise BuildError("live.b_err_slug")
            if has_viewers(ev):
                raise BuildError("live.b_err_slug_used")
            if EfirEvent.query.filter(EfirEvent.slug == slug, EfirEvent.id != ev.id).first():
                raise BuildError("live.b_err_slug_taken")
            svc.drop_cache(ev.slug)
            ev.slug = slug
            changed.append("slug")
    if "archived" in f:
        ev.archived = bool(f.get("archived"))
    db.session.commit()
    svc.drop_cache(ev.slug)
    svc._cache.pop("yt:" + ev.slug, None)
    from ..blueprints import efir as bp
    bp._ids.pop(ev.slug, None)
    return changed


def reorder(ev: EfirEvent, ids: list[int]) -> None:
    qs = {q.id: q for q in EfirQuestion.query.filter_by(event_id=ev.id)}
    pos = 0
    for i in ids:
        q = qs.pop(int(i), None)
        if q:
            q.position = pos
            pos += 1
    for q in sorted(qs.values(), key=lambda x: x.position):
        q.position = pos
        pos += 1
    db.session.commit()
    svc.drop_cache(ev.slug)


def readiness(ev: EfirEvent) -> list[dict]:
    """Проверка перед эфиром: что заполнено, что нет."""
    qs = EfirQuestion.query.filter_by(event_id=ev.id).all()
    t = ev.title or {}
    missing_tr = sum(1 for q in qs if not all((q.text or {}).get(l) for l in LANGS)
                     or any(not all((o or {}).get(l) for l in LANGS) for o in q.options or []))
    return [
        {"key": "title", "ok": bool(t.get("kk") and t.get("ru"))},
        {"key": "date", "ok": bool(ev.starts_at)},
        {"key": "youtube", "ok": bool(ev.youtube_id)},
        {"key": "questions", "ok": len(qs) >= 3, "n": len(qs)},
        {"key": "translate", "ok": missing_tr == 0, "n": missing_tr},
    ]


# ─── Вставка текстом ─────────────────────────────────────────────────────
_OPT = re.compile(r"^(?:[-+*•✓✔]|[a-dа-гA-DА-Г]\s*[).]|\[[ xх+]?\])\s*", re.I)
_QNUM = re.compile(r"^(?:\d+\s*[.)]|[?❓]|Q\d*\s*[.:)])\s*", re.I)
_GOOD_TAIL = re.compile(r"\s*\((?:верно|дұрыс|correct|✓)\)\s*$", re.I)


def parse_paste(text: str) -> tuple[list[dict], list[str]]:
    """Вопросы из текста. Формат: строка вопроса, под ней 2-4 варианта, каждый с «-» в начале (или «а)», «b.»);
    верный помечен «+» или «*» вместо «-» (или «(верно)» в конце). Строка «# Название» начинает новый блок,
    строка «> текст» - пояснение после ответа. Нумерация вопросов «1.», «1)» убирается сама."""
    items, blocks, cur = [], [], None

    def flush():
        nonlocal cur
        if cur and cur["text"]:
            items.append(cur)
        cur = None

    for raw in (text or "").replace("\r", "").split("\n"):
        line = raw.strip()
        if not line:
            flush()
            continue
        if line.startswith("#"):
            flush()
            if line.lstrip("#").strip():
                blocks.append(line.lstrip("#").strip())
            continue
        if line.startswith(">"):
            if cur:
                cur["note"] = (cur.get("note", "") + " " + line[1:].strip()).strip()
            continue
        if cur is not None and _OPT.match(line):
            good = line[:1] in "+*✓✔" or bool(_GOOD_TAIL.search(line)) or bool(re.match(r"^\[[xх+]\]", line, re.I))
            opt = _GOOD_TAIL.sub("", _OPT.sub("", line, count=1)).strip()
            if opt:
                if good and cur["correct"] is None:
                    cur["correct"] = len(cur["options"])
                cur["options"].append(opt)
            continue
        if cur is not None and not cur["options"]:
            cur["text"] += " " + line
            continue
        flush()
        cur = {"text": _QNUM.sub("", line), "options": [], "correct": None, "note": "", "block": len(blocks) or None}
    flush()
    out = []
    for it in items:
        if 2 <= len(it["options"]) <= 4:
            out.append({"text": it["text"][:600], "options": [o[:200] for o in it["options"]],
                        "correct": it["correct"] if it["correct"] is not None else 0, "has_correct": it["correct"] is not None,
                        "note": it["note"][:600], "block": it["block"]})
    return out, blocks


def add_parsed(ev: EfirEvent, items: list[dict], new_blocks: list[str], lang: str, block: int, seconds: int = 30) -> int:
    """Добавить разобранные вопросы в конец блока. Строки «# Блок» создают новые блоки программы."""
    lang = lang if lang in LANGS else "ru"
    bl = list(ev.blocks or [])
    if new_blocks and not EfirQuestion.query.filter_by(event_id=ev.id).first() and all(it.get("block") for it in items):
        bl = []  # первый текст в пустом эфире задает программу целиком: пустой блок по умолчанию не нужен
    base = len(bl)
    if new_blocks:
        for name in new_blocks:
            bl.append({lang: name[:120]})
        ev.blocks = bl
        db.session.flush()
    n = 0
    for it in items:
        b = (base + it["block"]) if (new_blocks and it.get("block")) else block
        data = {"text": {lang: it["text"]}, "options": [{lang: o} for o in it["options"]], "correct": it["correct"],
                "note": {lang: it["note"]} if it.get("note") else {}, "seconds": seconds, "block": b}
        q, err = svc.save_question(ev, data)
        if q:
            n += 1
    db.session.commit()
    return n


# ─── ИИ ──────────────────────────────────────────────────────────────────
def ai_enabled() -> bool:
    return bool(current_app.config.get("ANTHROPIC_API_KEY"))


def _client():
    import anthropic
    return anthropic.Anthropic(api_key=current_app.config["ANTHROPIC_API_KEY"], timeout=180)


def _json_from(text: str):
    m = re.search(r"```(?:json)?\s*(.+?)```", text, re.S)
    raw = m.group(1) if m else text[text.find("["):text.rfind("]") + 1] if "[" in text else text
    return json.loads(raw)


QUIZ_RULES = (
    "Правила вопросов викторины (как Kahoot, учителя отвечают с телефона за 20-30 секунд):\n"
    "- вопрос короткий, до 110 символов, один смысл, без «не» и подвохов;\n"
    "- ровно 4 варианта, каждый до 40 символов, один верный, неверные правдоподобные и из той же темы;\n"
    "- верный вариант ставь на разные позиции (0-3), не всегда на одну;\n"
    "- пояснение (note) - 1 предложение до 160 символов: почему верно, с фактом из материала;\n"
    "- вопросы только по фактам из материала, по порядку изложения;\n"
    "- казахский - литературный, без калек с русского (не «шешім қабылдау» там, где лучше «шешу»); термины FIRST, "
    "FLL, FTC, STEM и названия программ не переводи.\n"
)


def ai_questions(ev: EfirEvent, count: int, pdf: bytes | None, text: str, focus: str) -> list[dict]:
    """Вопросы на казахском и русском по презентации (PDF) или тексту. Возвращает [{text, options, correct, note}]."""
    content = []
    if pdf:
        content.append({"type": "document", "source": {"type": "base64", "media_type": "application/pdf",
                                                         "data": base64.standard_b64encode(pdf).decode()}})
    if text.strip():
        content.append({"type": "text", "text": f"<material>\n{text.strip()[:60000]}\n</material>"})
    title = (ev.title or {}).get("ru") or (ev.title or {}).get("kk") or ""
    content.append({"type": "text", "text": (
        f"Это материал вебинара для учителей школ Казахстана «{title}». Составь {count} вопросов викторины.\n"
        + (f"Фокус: {focus.strip()[:400]}\n" if focus.strip() else "") + QUIZ_RULES +
        'Ответ - только JSON-массив без пояснений: [{"text": {"kk": "...", "ru": "..."}, '
        '"options": [{"kk": "...", "ru": "..."}, x4], "correct": 0, "note": {"kk": "...", "ru": "..."}}]')})
    resp = _client().messages.create(model=current_app.config["AI_MODEL"], max_tokens=8000,
                                     messages=[{"role": "user", "content": content}])
    out = "".join(b.text for b in resp.content if getattr(b, "type", "") == "text")
    data = _json_from(out)
    res = []
    for d in data if isinstance(data, list) else []:
        opts = [_ml(o, 200) for o in (d.get("options") or [])][:4]
        try:
            correct = int(d.get("correct", 0))
        except (TypeError, ValueError):
            continue
        if _ml(d.get("text"), 600) and len(opts) >= 2 and all(opts) and 0 <= correct < len(opts):
            res.append({"text": _ml(d.get("text"), 600), "options": opts, "correct": correct, "note": _ml(d.get("note"), 600)})
    return res


def ai_translate(ev: EfirEvent) -> int:
    """Дописать недостающий язык (kk или ru) в названии, программе, текстах экрана и вопросах эфира."""
    qs = EfirQuestion.query.filter_by(event_id=ev.id).order_by(EfirQuestion.position).all()
    pack = {"title": ev.title or {}, "subtitle": ev.subtitle or {}, "blocks": ev.blocks or [],
            "kicker": (ev.texts or {}).get("kicker") or {}, "finish": (ev.texts or {}).get("finish") or {},
            "questions": [{"id": q.id, "text": q.text, "options": q.options, "note": q.note or {}} for q in qs]}

    def need(o):
        return isinstance(o, dict) and any(o.get(l) for l in LANGS) and not all(o.get(l) for l in LANGS)
    todo = [pack["title"], pack["subtitle"], pack["kicker"], pack["finish"], *pack["blocks"]]
    for q in pack["questions"]:
        todo += [q["text"], q["note"], *q["options"]]
    if not any(need(o) for o in todo):
        return 0
    prompt = ("Ниже JSON вебинара для учителей Казахстана. В каждом объекте {\"kk\", \"ru\"} заполнен один язык - "
              "допиши второй (казахский литературный, без калек; русский без буквы «ё» и без длинного тире). "
              "Термины FIRST, FLL, FTC, STEM, USTEM и названия программ не переводи. Уже заполненное не меняй. "
              "Пустые объекты {} оставь пустыми. Верни тот же JSON целиком, без пояснений.\n\n"
              + json.dumps(pack, ensure_ascii=False))
    resp = _client().messages.create(model=current_app.config["AI_MODEL"], max_tokens=16000,
                                     messages=[{"role": "user", "content": prompt}])
    out = "".join(b.text for b in resp.content if getattr(b, "type", "") == "text")
    m = re.search(r"```(?:json)?\s*(.+?)```", out, re.S)
    data = json.loads(m.group(1) if m else out[out.find("{"):out.rfind("}") + 1])
    n = 0

    def merge(old, new):
        nonlocal n
        old = dict(old or {})
        if isinstance(new, dict):
            for l in LANGS:
                v = str(new.get(l) or "").replace("ё", "е").replace("Ё", "Е").replace(" — ", " - ").replace("—", "-").strip()
                if not old.get(l) and v and any(old.values()):
                    old[l] = v[:600]
                    n += 1
        return old
    ev.title = merge(ev.title, data.get("title"))
    ev.subtitle = merge(ev.subtitle, data.get("subtitle"))
    nb = data.get("blocks") or []
    ev.blocks = [merge(b, nb[i] if i < len(nb) else None) for i, b in enumerate(ev.blocks or [])]
    texts = dict(ev.texts or {})
    for k in ("kicker", "finish"):
        if texts.get(k):
            texts[k] = merge(texts[k], data.get(k))
    ev.texts = texts
    by_id = {int(x.get("id", 0)): x for x in data.get("questions") or [] if isinstance(x, dict)}
    for q in qs:
        x = by_id.get(q.id) or {}
        q.text = merge(q.text, x.get("text"))
        q.note = merge(q.note, x.get("note"))
        xo = x.get("options") or []
        q.options = [merge(o, xo[i] if i < len(xo) else None) for i, o in enumerate(q.options or [])]
    db.session.commit()
    svc.drop_cache(ev.slug)
    return n


def delete(ev: EfirEvent) -> None:
    if has_viewers(ev) or EfirAnswer.query.filter_by(event_id=ev.id).first():
        raise BuildError("live.b_err_delete")
    from . import efir_deck
    efir_deck.remove_all(ev)
    EfirQuestion.query.filter_by(event_id=ev.id).delete()
    db.session.delete(ev)
    db.session.commit()
    svc.drop_cache(ev.slug)
