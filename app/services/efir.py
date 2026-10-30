"""Прямой эфир: загрузка эфиров из app/content, состояние, баллы, статистика.

Нагрузка: 500+ учителей опрашивают состояние раз в 3 секунды. Поэтому состояние эфира и статистика для экрана
кешируются в процессе на 1-2 секунды, пульс присутствия пишется в базу не чаще раза в 20 секунд на человека,
а ответ на вопрос - одна вставка.
"""
from __future__ import annotations

import threading
import time
from datetime import timedelta

from sqlalchemy import func

from ..models import EfirAnswer, EfirAsk, EfirEvent, EfirFeedback, EfirQuestion, EfirViewer, User, db, utcnow

SOURCES = ()  # эфиры студии собираются только в конструкторе
MODES = ("waiting", "talk", "slides", "video", "profile", "question", "reveal", "leaderboard", "ask", "finish")
ONLINE_WINDOW = 45          # секунд: «смотрит сейчас», если страница отвечала за это время
HEARTBEAT_EVERY = 20        # секунд между записями пульса одного учителя
GRACE = 25                  # секунд к таймеру вопроса: задержка YouTube и медленная сеть

KZ_REGIONS = [
    ("astana", "Астана", "Астана"), ("almaty", "Алматы", "Алматы"), ("shymkent", "Шымкент", "Шымкент"),
    ("abai", "Абай облысы", "Абайская область"), ("akmola", "Ақмола облысы", "Акмолинская область"),
    ("aktobe", "Ақтөбе облысы", "Актюбинская область"), ("almaty_obl", "Алматы облысы", "Алматинская область"),
    ("atyrau", "Атырау облысы", "Атырауская область"), ("vko", "Шығыс Қазақстан облысы", "Восточно-Казахстанская область"),
    ("zhambyl", "Жамбыл облысы", "Жамбылская область"), ("zhetysu", "Жетісу облысы", "Жетысуская область"),
    ("zko", "Батыс Қазақстан облысы", "Западно-Казахстанская область"), ("karaganda", "Қарағанды облысы", "Карагандинская область"),
    ("kostanay", "Қостанай облысы", "Костанайская область"), ("kyzylorda", "Қызылорда облысы", "Кызылординская область"),
    ("mangystau", "Маңғыстау облысы", "Мангистауская область"), ("pavlodar", "Павлодар облысы", "Павлодарская область"),
    ("sko", "Солтүстік Қазақстан облысы", "Северо-Казахстанская область"), ("turkistan", "Түркістан облысы", "Туркестанская область"),
    ("ulytau", "Ұлытау облысы", "Улытауская область"),
]
REGION_KEYS = {k for k, _, _ in KZ_REGIONS}
SUBJECTS = ("physics", "informatics", "math", "technology", "chemistry", "biology", "primary", "other")
POSITIONS = ("teacher", "deputy", "director", "methodist", "other")
ROBOTICS = ("none", "started", "team")


def local_hm(dt) -> str:
    """Время записи (UTC в базе) по часовому поясу Академии."""
    if not dt:
        return ""
    from zoneinfo import ZoneInfo
    from flask import current_app
    tz = ZoneInfo(current_app.config.get("TIMEZONE", "Asia/Almaty"))
    from datetime import timezone as _tz
    return dt.replace(tzinfo=_tz.utc).astimezone(tz).strftime("%H:%M")


def region_name(key: str | None, lang: str = "kk") -> str:
    for k, kk, ru in KZ_REGIONS:
        if k == key:
            return ru if lang == "ru" else kk
    return key or ""


# ─── Загрузка эфиров из кода ─────────────────────────────────────────────
def ensure_events() -> None:
    """Создает эфиры из app/content/live_*.py, если их еще нет, и недостающие вопросы. Существующий эфир не трогаем:
    его правят в конструкторе (/efir/<slug>/build) и на пульте, перезапуск Академии не должен затирать эти правки."""
    import importlib
    for name in SOURCES:
        mod = importlib.import_module(f"app.content.{name}")
        data = mod.EVENT
        ev = EfirEvent.query.filter_by(slug=data["slug"]).first()
        if not ev:
            ev = EfirEvent(slug=data["slug"], state={"mode": "waiting", "v": 1})
            ev.starts_at = data.get("starts_at")
            ev.title = data["title"]
            ev.subtitle = data.get("subtitle") or {}
            ev.links = data.get("links") or {}
            db.session.add(ev)
        if not ev.blocks:
            bl = getattr(mod, "BLOCKS", {}) or {}
            ev.blocks = [bl[k] for k in sorted(bl)]
        if not ev.texts and getattr(mod, "TEXTS", None):
            ev.texts = mod.TEXTS
        db.session.flush()
        have = {q.key for q in EfirQuestion.query.filter_by(event_id=ev.id)}
        for pos, qd in enumerate(mod.QUESTIONS):
            if qd["key"] in have:
                continue
            db.session.add(EfirQuestion(event_id=ev.id, key=qd["key"], block=qd["block"], position=pos, text=qd["text"],
                                        options=qd["options"], correct=qd["correct"], note=qd.get("note") or {},
                                        seconds=qd.get("seconds", 30)))
    db.session.commit()


def _ml(d) -> dict:
    d = d if isinstance(d, dict) else {}
    return {k: (d.get(k) or "").strip()[:600] for k in ("kk", "ru") if (d.get(k) or "").strip()}


def save_question(ev: EfirEvent, data: dict, q: EfirQuestion | None = None) -> tuple[EfirQuestion | None, str | None]:
    """Создать или изменить вопрос с пульта. Возвращает (вопрос, None) или (None, ключ ошибки)."""
    text = _ml(data.get("text"))
    options = [_ml(o) for o in (data.get("options") or [])]
    options = [o for o in options if o]
    note = _ml(data.get("note"))
    try:
        correct = int(data.get("correct"))
        seconds = int(data.get("seconds") or 30)
        block = int(data.get("block") or (q.block if q else 1))
    except (TypeError, ValueError):
        return None, "live.q_err"
    if not text or not (2 <= len(options) <= 4) or not (0 <= correct < len(options)) or not (10 <= seconds <= 120) \
            or not (1 <= block <= max(20, len(ev.blocks or []))):
        return None, "live.q_err"
    if q is None:
        qs = EfirQuestion.query.filter_by(event_id=ev.id).order_by(EfirQuestion.position).all()
        in_block = [x.position for x in qs if x.block <= block]
        pos = (max(in_block) + 1) if in_block else 0
        for x in qs:
            if x.position >= pos:
                x.position += 1
        n = 1
        keys = {x.key for x in qs}
        while f"c{n}" in keys:
            n += 1
        q = EfirQuestion(event_id=ev.id, key=f"c{n}", position=pos)
        db.session.add(q)
    q.block, q.text, q.options, q.correct, q.note, q.seconds = block, text, options, correct, note, seconds
    db.session.commit()
    drop_cache(ev.slug)
    return q, None


def blocks(slug: str) -> dict:
    """Программа эфира {номер блока: {"kk","ru"}} (номера с 1)."""
    ev = EfirEvent.query.filter_by(slug=slug).first()
    return {i + 1: b for i, b in enumerate((ev.blocks if ev else None) or [])}


# ─── Кеш состояния ───────────────────────────────────────────────────────
_lock = threading.Lock()
_cache: dict[str, tuple[float, object]] = {}


def _cached(key: str, ttl: float, build):
    now = time.monotonic()
    hit = _cache.get(key)
    if hit and now - hit[0] < ttl:
        return hit[1]
    with _lock:
        hit = _cache.get(key)
        if hit and now - hit[0] < ttl:
            return hit[1]
        val = build()
        _cache[key] = (time.monotonic(), val)
        return val


def drop_cache(slug: str) -> None:
    for k in list(_cache):
        if k.endswith(":" + slug):
            _cache.pop(k, None)


def public_state(slug: str) -> dict | None:
    """То, что видят все: режим, текущий вопрос без правильного ответа (до показа ответа)."""
    def build():
        ev = EfirEvent.query.filter_by(slug=slug).first()
        if not ev:
            return None
        st = dict(ev.state or {})
        out = {"mode": st.get("mode", "waiting"), "v": st.get("v", 0), "now": time.time(), "block": st.get("block"),
               "slide": st.get("slide", 0), "dv": int((ev.deck or {}).get("v", 0))}
        if out["mode"] == "video":  # видео: какое, с какой секунды и когда пущено (экран считает позицию сам)
            out["video"] = {k: st.get(k) for k in ("vid", "pos", "play_at", "paused")}
        qid = st.get("qid")
        if out["mode"] in ("question", "reveal") and qid:
            q = db.session.get(EfirQuestion, qid)
            if q:
                total = EfirQuestion.query.filter_by(event_id=ev.id).count()
                out["q"] = {"id": q.id, "n": q.position + 1, "of": total, "text": q.text, "options": q.options,
                            "seconds": q.seconds, "at": st.get("at", 0), "block": q.block}
                if out["mode"] == "reveal":
                    out["q"]["correct"] = q.correct
                    out["q"]["note"] = q.note
        db.session.remove()
        return out
    return _cached("state:" + slug, 1.0, build)


def set_state(ev: EfirEvent, mode: str, **extra) -> None:
    st = {"mode": mode, "v": int((ev.state or {}).get("v", 0)) + 1}
    st.update(extra)
    ev.state = st
    db.session.commit()
    drop_cache(ev.slug)


# ─── Присутствие и ответы ────────────────────────────────────────────────
def viewer_for(ev: EfirEvent, user: User, create: bool = True) -> EfirViewer | None:
    v = EfirViewer.query.filter_by(event_id=ev.id, user_id=user.id).first()
    if not v and create:
        v = EfirViewer(event_id=ev.id, user_id=user.id, first_seen=utcnow(), last_seen=utcnow(),
                       school=user.organization, city=user.city)
        db.session.add(v)
        try:
            db.session.commit()
        except Exception:  # гонка двух вкладок
            db.session.rollback()
            v = EfirViewer.query.filter_by(event_id=ev.id, user_id=user.id).first()
    return v


def heartbeat(v: EfirViewer) -> None:
    now = utcnow()
    gap = (now - (v.last_seen or now)).total_seconds()
    if gap < HEARTBEAT_EVERY:
        return
    if gap < 90:  # был на странице без перерыва
        v.seconds = (v.seconds or 0) + int(gap)
    v.last_seen = now
    db.session.commit()


def points_for(q: EfirQuestion, ms: int | None) -> int:
    """Kahoot: 500 за верный ответ + до 500 за скорость (время считает телефон с момента показа вопроса)."""
    limit = max(5, q.seconds) * 1000
    ms = limit if ms is None else max(0, min(int(ms), limit))
    return 500 + round(500 * (1 - ms / limit))


def answer(ev: EfirEvent, q: EfirQuestion, user: User, choice: int, ms: int | None) -> dict:
    st = ev.state or {}
    if st.get("mode") != "question" or st.get("qid") != q.id:
        return {"ok": False, "error": "closed"}
    if time.time() > float(st.get("at", 0)) + q.seconds + GRACE:
        return {"ok": False, "error": "late"}
    if not (0 <= choice < len(q.options or [])):
        return {"ok": False, "error": "bad"}
    if EfirAnswer.query.filter_by(question_id=q.id, user_id=user.id).first():
        return {"ok": False, "error": "already"}
    good = choice == q.correct
    pts = points_for(q, ms) if good else 0
    v = viewer_for(ev, user)
    db.session.add(EfirAnswer(event_id=ev.id, question_id=q.id, user_id=user.id, choice=choice,
                              is_correct=good, points=pts, ms=ms))
    v.score = (v.score or 0) + pts
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return {"ok": False, "error": "already"}
    return {"ok": True}


def my_result(ev: EfirEvent, user: User, qid: int | None) -> dict:
    v = EfirViewer.query.filter_by(event_id=ev.id, user_id=user.id).first()
    out = {"score": v.score if v else 0, "profile": bool(v and v.profile_at)}
    if qid:
        a = EfirAnswer.query.filter_by(question_id=qid, user_id=user.id).first()
        if a:
            out["answer"] = {"choice": a.choice, "correct": a.is_correct, "points": a.points}
    return out


def rank_of(ev: EfirEvent, user: User) -> tuple[int, int]:
    v = EfirViewer.query.filter_by(event_id=ev.id, user_id=user.id).first()
    total = EfirViewer.query.filter_by(event_id=ev.id).count()
    if not v:
        return 0, total
    better = EfirViewer.query.filter(EfirViewer.event_id == ev.id, EfirViewer.score > (v.score or 0)).count()
    return better + 1, total


# ─── Статистика для экрана и пульта ──────────────────────────────────────
def short_name(full: str) -> str:
    parts = (full or "").split()
    if len(parts) >= 2:
        return f"{parts[1]} {parts[0][0]}."  # «Фамилия Имя» -> «Имя Ф.»
    return parts[0] if parts else "?"


def stats(slug: str) -> dict | None:
    def build():
        ev = EfirEvent.query.filter_by(slug=slug).first()
        if not ev:
            return None
        since = utcnow() - timedelta(seconds=ONLINE_WINDOW)
        base = EfirViewer.query.filter_by(event_id=ev.id)
        out = {
            "online": base.filter(EfirViewer.last_seen >= since).count(),
            "joined": base.count(),
            "profiles": base.filter(EfirViewer.profile_at.isnot(None)).count(),
            "schools": db.session.query(func.count(func.distinct(func.lower(EfirViewer.school))))
                         .filter(EfirViewer.event_id == ev.id, EfirViewer.school.isnot(None), EfirViewer.school != "").scalar() or 0,
        }
        regions = (db.session.query(EfirViewer.region, func.count(EfirViewer.id), func.coalesce(func.sum(EfirViewer.score), 0))
                   .filter(EfirViewer.event_id == ev.id, EfirViewer.region.isnot(None))
                   .group_by(EfirViewer.region).all())
        out["regions"] = sorted(({"key": r, "kk": region_name(r, "kk"), "ru": region_name(r, "ru"), "n": n, "score": int(s)}
                                 for r, n, s in regions), key=lambda x: -x["n"])
        subj: dict[str, int] = {}
        for (subs,) in db.session.query(EfirViewer.subjects).filter(EfirViewer.event_id == ev.id, EfirViewer.profile_at.isnot(None)):
            for s in subs or []:
                subj[s] = subj.get(s, 0) + 1
        out["subjects"] = subj
        top = (db.session.query(EfirViewer, User).join(User, User.id == EfirViewer.user_id)
               .filter(EfirViewer.event_id == ev.id, EfirViewer.score > 0)
               .order_by(EfirViewer.score.desc(), EfirViewer.first_seen).limit(10).all())
        out["top"] = [{"name": short_name(u.full_name), "school": (v.school or "")[:60],
                       "region": region_name(v.region, "kk"), "region_ru": region_name(v.region, "ru"), "score": v.score} for v, u in top]
        reg_rank = [r for r in out["regions"] if r["n"] >= 1]
        for r in reg_rank:
            r["avg"] = round(r["score"] / r["n"]) if r["n"] else 0
        out["region_top"] = sorted(reg_rank, key=lambda x: (-x["avg"], -x["n"]))[:8]
        qid = (ev.state or {}).get("qid")
        if qid:
            rows = dict(db.session.query(EfirAnswer.choice, func.count(EfirAnswer.id))
                        .filter(EfirAnswer.question_id == qid).group_by(EfirAnswer.choice).all())
            out["answers"] = {"qid": qid, "by": [rows.get(i, 0) for i in range(4)], "total": sum(rows.values())}
        db.session.remove()
        return out
    return _cached("stats:" + slug, 2.0, build)


def asks(ev: EfirEvent, limit: int = 60) -> list[dict]:
    rows = (EfirAsk.query.filter(EfirAsk.event_id == ev.id, EfirAsk.status != "hidden")
            .order_by(EfirAsk.created_at.desc()).limit(limit).all())
    out = []
    for a in rows:
        v = EfirViewer.query.filter_by(event_id=ev.id, user_id=a.user_id).first()
        out.append({"id": a.id, "text": a.text, "status": a.status, "name": a.user.full_name if a.user else "",
                    "school": (v.school if v else "") or "", "region": region_name(v.region if v else None, "kk"),
                    "at": local_hm(a.created_at), "uid": a.user_id})
    return out


# ─── Вопросы спикеру: защита от спама ────────────────────────────────────
ASK_COOLDOWN = 15     # секунд между вопросами одного учителя
ASK_MAX = 30          # вопросов от одного учителя за эфир
ASK_MIN, ASK_LEN = 3, 600


def _norm(text: str) -> str:
    return " ".join("".join(ch for ch in text.lower() if ch.isalnum() or ch.isspace()).split())


def add_ask(ev: EfirEvent, user: User, text: str) -> tuple[bool, str | None, int]:
    """Сохранить вопрос спикеру. Возвращает (ok, ключ ошибки, сколько секунд подождать).
    Модератор видит не все: вопросы скрытого автора (EfirViewer.muted) сохраняются со статусом hidden,
    сам автор об этом не узнает и не начинает писать с другого аккаунта."""
    text = " ".join((text or "").split())
    if len(text) < ASK_MIN:
        return False, "live.ask_short", 0
    text = text[:ASK_LEN]
    mine = EfirAsk.query.filter_by(event_id=ev.id, user_id=user.id).order_by(EfirAsk.created_at.desc()).all()
    if mine and mine[0].created_at:
        wait = ASK_COOLDOWN - int((utcnow() - mine[0].created_at).total_seconds())
        if wait > 0:
            return False, "live.ask_wait", wait
    if len(mine) >= ASK_MAX:
        return False, "live.ask_limit", 0
    n = _norm(text)
    if any(_norm(a.text) == n for a in mine):
        return False, "live.ask_dup", 0
    v = EfirViewer.query.filter_by(event_id=ev.id, user_id=user.id).first()
    db.session.add(EfirAsk(event_id=ev.id, user_id=user.id, text=text, status="hidden" if v and v.muted else "new"))
    db.session.commit()
    return True, None, 0


def mute(ev: EfirEvent, user_id: int, on: bool = True) -> int:
    """Скрыть автора: его вопросы прячутся от модератора и экрана, новые сразу скрытые. Возвращает число скрытых."""
    v = EfirViewer.query.filter_by(event_id=ev.id, user_id=user_id).first()
    if v:
        v.muted = on
    n = 0
    if on:
        n = EfirAsk.query.filter(EfirAsk.event_id == ev.id, EfirAsk.user_id == user_id,
                                 EfirAsk.status != "hidden").update({"status": "hidden"}, synchronize_session=False)
    db.session.commit()
    return n


# ─── Отзывы ──────────────────────────────────────────────────────────────
FB_LIKED = ("topic", "speaker", "quiz", "examples", "format", "materials")
FB_IMPROVE = ("sound", "video", "length", "pace", "practice", "nothing")


def save_feedback(ev: EfirEvent, user: User, data: dict) -> tuple[EfirFeedback | None, str | None]:
    try:
        rating = int(data.get("rating"))
    except (TypeError, ValueError):
        return None, "live.fb_err"
    if not 1 <= rating <= 5:
        return None, "live.fb_err"
    fb = EfirFeedback.query.filter_by(event_id=ev.id, user_id=user.id).first()
    if not fb:
        fb = EfirFeedback(event_id=ev.id, user_id=user.id)
        db.session.add(fb)
    fb.rating = rating
    fb.liked = [x for x in (data.get("liked") or []) if x in FB_LIKED]
    fb.improve = [x for x in (data.get("improve") or []) if x in FB_IMPROVE]
    fb.comment = (data.get("comment") or "").strip()[:1500] or None
    fb.topics = (data.get("topics") or "").strip()[:500] or None
    fb.updated_at = utcnow()
    db.session.commit()
    return fb, None


def reset(ev: EfirEvent) -> dict:
    """Обнулить эфир: ответы, анкеты зрителей, вопросы спикеру; экран - на заставку. Аккаунты учителей остаются."""
    counts = {
        "answers": EfirAnswer.query.filter_by(event_id=ev.id).delete(synchronize_session=False),
        "asks": EfirAsk.query.filter_by(event_id=ev.id).delete(synchronize_session=False),
        "feedback": EfirFeedback.query.filter_by(event_id=ev.id).delete(synchronize_session=False),
        "viewers": EfirViewer.query.filter_by(event_id=ev.id).delete(synchronize_session=False),
    }
    db.session.flush()
    set_state(ev, "waiting")  # коммитит и сбрасывает кеш
    return counts
