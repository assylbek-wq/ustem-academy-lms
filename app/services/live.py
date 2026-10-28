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

from ..models import LiveAnswer, LiveAsk, LiveEvent, LiveQuestion, LiveViewer, User, db, utcnow

SOURCES = ("live_keleshek",)
MODES = ("waiting", "talk", "slides", "profile", "question", "reveal", "leaderboard", "ask", "finish")
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
    его правят в конструкторе (/live/<slug>/build) и на пульте, перезапуск Академии не должен затирать эти правки."""
    import importlib
    for name in SOURCES:
        mod = importlib.import_module(f"app.content.{name}")
        data = mod.EVENT
        ev = LiveEvent.query.filter_by(slug=data["slug"]).first()
        if not ev:
            ev = LiveEvent(slug=data["slug"], state={"mode": "waiting", "v": 1})
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
        have = {q.key for q in LiveQuestion.query.filter_by(event_id=ev.id)}
        for pos, qd in enumerate(mod.QUESTIONS):
            if qd["key"] in have:
                continue
            db.session.add(LiveQuestion(event_id=ev.id, key=qd["key"], block=qd["block"], position=pos, text=qd["text"],
                                        options=qd["options"], correct=qd["correct"], note=qd.get("note") or {},
                                        seconds=qd.get("seconds", 30)))
    db.session.commit()


def _ml(d) -> dict:
    d = d if isinstance(d, dict) else {}
    return {k: (d.get(k) or "").strip()[:600] for k in ("kk", "ru") if (d.get(k) or "").strip()}


def save_question(ev: LiveEvent, data: dict, q: LiveQuestion | None = None) -> tuple[LiveQuestion | None, str | None]:
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
        qs = LiveQuestion.query.filter_by(event_id=ev.id).order_by(LiveQuestion.position).all()
        in_block = [x.position for x in qs if x.block <= block]
        pos = (max(in_block) + 1) if in_block else 0
        for x in qs:
            if x.position >= pos:
                x.position += 1
        n = 1
        keys = {x.key for x in qs}
        while f"c{n}" in keys:
            n += 1
        q = LiveQuestion(event_id=ev.id, key=f"c{n}", position=pos)
        db.session.add(q)
    q.block, q.text, q.options, q.correct, q.note, q.seconds = block, text, options, correct, note, seconds
    db.session.commit()
    drop_cache(ev.slug)
    return q, None


def blocks(slug: str) -> dict:
    """Программа эфира {номер блока: {"kk","ru"}} (номера с 1)."""
    ev = LiveEvent.query.filter_by(slug=slug).first()
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
        ev = LiveEvent.query.filter_by(slug=slug).first()
        if not ev:
            return None
        st = dict(ev.state or {})
        out = {"mode": st.get("mode", "waiting"), "v": st.get("v", 0), "now": time.time(), "block": st.get("block"),
               "slide": st.get("slide", 0), "dv": int((ev.deck or {}).get("v", 0))}
        qid = st.get("qid")
        if out["mode"] in ("question", "reveal") and qid:
            q = db.session.get(LiveQuestion, qid)
            if q:
                total = LiveQuestion.query.filter_by(event_id=ev.id).count()
                out["q"] = {"id": q.id, "n": q.position + 1, "of": total, "text": q.text, "options": q.options,
                            "seconds": q.seconds, "at": st.get("at", 0), "block": q.block}
                if out["mode"] == "reveal":
                    out["q"]["correct"] = q.correct
                    out["q"]["note"] = q.note
        db.session.remove()
        return out
    return _cached("state:" + slug, 1.0, build)


def set_state(ev: LiveEvent, mode: str, **extra) -> None:
    st = {"mode": mode, "v": int((ev.state or {}).get("v", 0)) + 1}
    st.update(extra)
    ev.state = st
    db.session.commit()
    drop_cache(ev.slug)


# ─── Присутствие и ответы ────────────────────────────────────────────────
def viewer_for(ev: LiveEvent, user: User, create: bool = True) -> LiveViewer | None:
    v = LiveViewer.query.filter_by(event_id=ev.id, user_id=user.id).first()
    if not v and create:
        v = LiveViewer(event_id=ev.id, user_id=user.id, first_seen=utcnow(), last_seen=utcnow(),
                       school=user.organization, city=user.city)
        db.session.add(v)
        try:
            db.session.commit()
        except Exception:  # гонка двух вкладок
            db.session.rollback()
            v = LiveViewer.query.filter_by(event_id=ev.id, user_id=user.id).first()
    return v


def heartbeat(v: LiveViewer) -> None:
    now = utcnow()
    gap = (now - (v.last_seen or now)).total_seconds()
    if gap < HEARTBEAT_EVERY:
        return
    if gap < 90:  # был на странице без перерыва
        v.seconds = (v.seconds or 0) + int(gap)
    v.last_seen = now
    db.session.commit()


def points_for(q: LiveQuestion, ms: int | None) -> int:
    """Kahoot: 500 за верный ответ + до 500 за скорость (время считает телефон с момента показа вопроса)."""
    limit = max(5, q.seconds) * 1000
    ms = limit if ms is None else max(0, min(int(ms), limit))
    return 500 + round(500 * (1 - ms / limit))


def answer(ev: LiveEvent, q: LiveQuestion, user: User, choice: int, ms: int | None) -> dict:
    st = ev.state or {}
    if st.get("mode") != "question" or st.get("qid") != q.id:
        return {"ok": False, "error": "closed"}
    if time.time() > float(st.get("at", 0)) + q.seconds + GRACE:
        return {"ok": False, "error": "late"}
    if not (0 <= choice < len(q.options or [])):
        return {"ok": False, "error": "bad"}
    if LiveAnswer.query.filter_by(question_id=q.id, user_id=user.id).first():
        return {"ok": False, "error": "already"}
    good = choice == q.correct
    pts = points_for(q, ms) if good else 0
    v = viewer_for(ev, user)
    db.session.add(LiveAnswer(event_id=ev.id, question_id=q.id, user_id=user.id, choice=choice,
                              is_correct=good, points=pts, ms=ms))
    v.score = (v.score or 0) + pts
    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return {"ok": False, "error": "already"}
    return {"ok": True}


def my_result(ev: LiveEvent, user: User, qid: int | None) -> dict:
    v = LiveViewer.query.filter_by(event_id=ev.id, user_id=user.id).first()
    out = {"score": v.score if v else 0, "profile": bool(v and v.profile_at)}
    if qid:
        a = LiveAnswer.query.filter_by(question_id=qid, user_id=user.id).first()
        if a:
            out["answer"] = {"choice": a.choice, "correct": a.is_correct, "points": a.points}
    return out


def rank_of(ev: LiveEvent, user: User) -> tuple[int, int]:
    v = LiveViewer.query.filter_by(event_id=ev.id, user_id=user.id).first()
    total = LiveViewer.query.filter_by(event_id=ev.id).count()
    if not v:
        return 0, total
    better = LiveViewer.query.filter(LiveViewer.event_id == ev.id, LiveViewer.score > (v.score or 0)).count()
    return better + 1, total


# ─── Статистика для экрана и пульта ──────────────────────────────────────
def short_name(full: str) -> str:
    parts = (full or "").split()
    if len(parts) >= 2:
        return f"{parts[1]} {parts[0][0]}."  # «Фамилия Имя» -> «Имя Ф.»
    return parts[0] if parts else "?"


def stats(slug: str) -> dict | None:
    def build():
        ev = LiveEvent.query.filter_by(slug=slug).first()
        if not ev:
            return None
        since = utcnow() - timedelta(seconds=ONLINE_WINDOW)
        base = LiveViewer.query.filter_by(event_id=ev.id)
        out = {
            "online": base.filter(LiveViewer.last_seen >= since).count(),
            "joined": base.count(),
            "profiles": base.filter(LiveViewer.profile_at.isnot(None)).count(),
            "schools": db.session.query(func.count(func.distinct(func.lower(LiveViewer.school))))
                         .filter(LiveViewer.event_id == ev.id, LiveViewer.school.isnot(None), LiveViewer.school != "").scalar() or 0,
        }
        regions = (db.session.query(LiveViewer.region, func.count(LiveViewer.id), func.coalesce(func.sum(LiveViewer.score), 0))
                   .filter(LiveViewer.event_id == ev.id, LiveViewer.region.isnot(None))
                   .group_by(LiveViewer.region).all())
        out["regions"] = sorted(({"key": r, "kk": region_name(r, "kk"), "ru": region_name(r, "ru"), "n": n, "score": int(s)}
                                 for r, n, s in regions), key=lambda x: -x["n"])
        subj: dict[str, int] = {}
        for (subs,) in db.session.query(LiveViewer.subjects).filter(LiveViewer.event_id == ev.id, LiveViewer.profile_at.isnot(None)):
            for s in subs or []:
                subj[s] = subj.get(s, 0) + 1
        out["subjects"] = subj
        top = (db.session.query(LiveViewer, User).join(User, User.id == LiveViewer.user_id)
               .filter(LiveViewer.event_id == ev.id, LiveViewer.score > 0)
               .order_by(LiveViewer.score.desc(), LiveViewer.first_seen).limit(10).all())
        out["top"] = [{"name": short_name(u.full_name), "school": (v.school or "")[:60],
                       "region": region_name(v.region, "kk"), "region_ru": region_name(v.region, "ru"), "score": v.score} for v, u in top]
        reg_rank = [r for r in out["regions"] if r["n"] >= 1]
        for r in reg_rank:
            r["avg"] = round(r["score"] / r["n"]) if r["n"] else 0
        out["region_top"] = sorted(reg_rank, key=lambda x: (-x["avg"], -x["n"]))[:8]
        qid = (ev.state or {}).get("qid")
        if qid:
            rows = dict(db.session.query(LiveAnswer.choice, func.count(LiveAnswer.id))
                        .filter(LiveAnswer.question_id == qid).group_by(LiveAnswer.choice).all())
            out["answers"] = {"qid": qid, "by": [rows.get(i, 0) for i in range(4)], "total": sum(rows.values())}
        db.session.remove()
        return out
    return _cached("stats:" + slug, 2.0, build)


def asks(ev: LiveEvent, limit: int = 60) -> list[dict]:
    rows = (LiveAsk.query.filter(LiveAsk.event_id == ev.id, LiveAsk.status != "hidden")
            .order_by(LiveAsk.created_at.desc()).limit(limit).all())
    out = []
    for a in rows:
        v = LiveViewer.query.filter_by(event_id=ev.id, user_id=a.user_id).first()
        out.append({"id": a.id, "text": a.text, "status": a.status, "name": a.user.full_name if a.user else "",
                    "school": (v.school if v else "") or "", "region": region_name(v.region if v else None, "kk"),
                    "at": local_hm(a.created_at)})
    return out


def reset(ev: LiveEvent) -> dict:
    """Обнулить эфир: ответы, анкеты зрителей, вопросы спикеру; экран - на заставку. Аккаунты учителей остаются."""
    counts = {
        "answers": LiveAnswer.query.filter_by(event_id=ev.id).delete(synchronize_session=False),
        "asks": LiveAsk.query.filter_by(event_id=ev.id).delete(synchronize_session=False),
        "viewers": LiveViewer.query.filter_by(event_id=ev.id).delete(synchronize_session=False),
    }
    db.session.flush()
    set_state(ev, "waiting")  # коммитит и сбрасывает кеш
    return counts
