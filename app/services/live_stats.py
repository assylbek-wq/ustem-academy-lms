"""Статистика и аналитика эфира: страница /live/<slug>/stats (blueprints/live.py).

Присутствие по минутам восстанавливается из first_seen / last_seen зрителя (пульс страницы раз в 20 секунд):
учитель считается на эфире с первого захода до последнего пульса. Моменты эфира (анкета, вопросы, рейтинг)
берутся из журнала: каждое нажатие на пульте пишет audit «live.state».
"""
from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from flask import current_app

from ..models import AuditLog, LiveAnswer, LiveAsk, LiveEvent, LiveFeedback, LiveQuestion, LiveViewer, User, db
from . import live as svc

REGION_CODES = {
    "astana": "KZ-AST", "almaty": "KZ-ALA", "shymkent": "KZ-SHY", "abai": "KZ-ABA", "akmola": "KZ-AKM", "aktobe": "KZ-AKT",
    "almaty_obl": "KZ-ALM", "atyrau": "KZ-ATY", "vko": "KZ-VOS", "zhambyl": "KZ-ZHA", "zhetysu": "KZ-ZHT", "zko": "KZ-ZAP",
    "karaganda": "KZ-KAR", "kostanay": "KZ-KUS", "kyzylorda": "KZ-KZY", "mangystau": "KZ-MAN", "pavlodar": "KZ-PAV",
    "sko": "KZ-SEV", "turkistan": "KZ-YUZ", "ulytau": "KZ-ULY",
}
WATCH_BUCKETS = ((0, 5), (5, 15), (15, 30), (30, 60), (60, 10_000))


def _tz() -> ZoneInfo:
    return ZoneInfo(current_app.config.get("TIMEZONE", "Asia/Almaty"))


def _local(dt: datetime | None) -> datetime | None:
    if not dt:
        return None
    return dt.replace(tzinfo=timezone.utc).astimezone(_tz()).replace(tzinfo=None)


def _norm_school(s: str | None) -> str:
    return " ".join((s or "").replace("«", "").replace("»", "").replace('"', "").lower().split())


def compute(ev: LiveEvent) -> dict:
    viewers = (db.session.query(LiveViewer, User).join(User, User.id == LiveViewer.user_id)
               .filter(LiveViewer.event_id == ev.id).all())
    qs = LiveQuestion.query.filter_by(event_id=ev.id).order_by(LiveQuestion.position).all()
    answers = LiveAnswer.query.filter_by(event_id=ev.id).all()
    asks = (LiveAsk.query.filter(LiveAsk.event_id == ev.id, LiveAsk.status != "hidden")  # скрытые модератором - спам
            .order_by(LiveAsk.created_at).all())
    vs = [v for v, _ in viewers]

    # ─── Присутствие по минутам ──────────────────────────────────────────
    spans = []
    for v in vs:
        a, b = _local(v.first_seen), _local(v.last_seen or v.first_seen)
        if a and b:
            spans.append((a.replace(second=0, microsecond=0), b.replace(second=0, microsecond=0)))
    timeline, peak, peak_at = [], 0, None
    if spans:
        start = min(a for a, _ in spans)
        end = max(b for _, b in spans)
        if ev.starts_at:  # ось от 30 минут до начала, если кто-то пришел раньше
            start = max(start, ev.starts_at - timedelta(minutes=45))
        diff = Counter()
        joins = Counter()
        for a, b in spans:
            a2 = max(a, start)
            diff[a2] += 1
            diff[b + timedelta(minutes=1)] -= 1
            joins[a2] += 1
        cur, t = 0, start
        while t <= end:
            cur += diff.get(t, 0)
            timeline.append({"t": t.strftime("%H:%M"), "n": cur, "j": joins.get(t, 0)})
            if cur > peak:
                peak, peak_at = cur, t.strftime("%H:%M")
            t += timedelta(minutes=1)

    # ─── Моменты эфира из журнала пульта ─────────────────────────────────
    qnum = {q.id: i + 1 for i, q in enumerate(qs)}
    marks = []
    for row in (AuditLog.query.filter_by(action="live.state", entity_id=ev.id).order_by(AuditLog.created_at).all()):
        d = row.details or {}
        m = d.get("mode")
        if m in ("question", "profile", "leaderboard", "ask", "finish", "talk", "waiting"):
            at = _local(row.created_at)
            marks.append({"t": at.strftime("%H:%M"), "mode": m, "q": qnum.get(d.get("qid")) if m == "question" else None})
    # одинаковые подряд (повторные нажатия) схлопываем
    dedup = []
    for m in marks:
        if not dedup or (dedup[-1]["mode"], dedup[-1]["q"]) != (m["mode"], m["q"]):
            dedup.append(m)
    marks = dedup

    # ─── Кто был ─────────────────────────────────────────────────────────
    profiled = [v for v in vs if v.profile_at]
    reg = Counter(v.region for v in vs if v.region)
    score_by_reg = Counter()
    for v in vs:
        if v.region:
            score_by_reg[v.region] += v.score or 0
    regions = [{"key": k, "code": REGION_CODES.get(k), "kk": svc.region_name(k, "kk"), "ru": svc.region_name(k, "ru"),
                "n": n, "avg": round(score_by_reg[k] / n) if n else 0} for k, n in reg.most_common()]
    subjects = Counter(s for v in profiled for s in (v.subjects or []))
    positions = Counter(v.position for v in profiled if v.position)
    robotics = Counter(v.robotics for v in profiled if v.robotics)
    schools = Counter()
    school_name = {}
    for v in vs:
        key = _norm_school(v.school)
        if len(key) >= 2:
            schools[key] += 1
            school_name.setdefault(key, (v.school or "").strip())
    watch = [0] * len(WATCH_BUCKETS)
    minutes = [(v.seconds or 0) / 60 for v in vs]
    for m in minutes:
        for i, (lo, hi) in enumerate(WATCH_BUCKETS):
            if lo <= m < hi:
                watch[i] += 1
                break

    # ─── Викторина ───────────────────────────────────────────────────────
    by_q: dict[int, list[LiveAnswer]] = {}
    for a in answers:
        by_q.setdefault(a.question_id, []).append(a)
    quiz = []
    for i, q in enumerate(qs):
        rows = by_q.get(q.id, [])
        dist = [0] * len(q.options or [])
        for a in rows:
            if 0 <= a.choice < len(dist):
                dist[a.choice] += 1
        ok = sum(1 for a in rows if a.is_correct)
        ms = [a.ms for a in rows if a.ms is not None]
        quiz.append({"n": i + 1, "block": q.block, "text": q.text, "options": q.options, "correct": q.correct,
                     "answers": len(rows), "ok": ok, "pct": round(100 * ok / len(rows)) if rows else None,
                     "sec": round(sum(ms) / len(ms) / 1000, 1) if ms else None, "dist": dist})
    answered_people = len({a.user_id for a in answers})

    top = sorted((x for x in viewers if (x[0].score or 0) > 0), key=lambda x: (-(x[0].score or 0), x[0].first_seen or datetime.min))[:10]
    top_rows = [{"name": svc.short_name(u.full_name), "school": (v.school or "")[:70], "kk": svc.region_name(v.region, "kk"),
                 "ru": svc.region_name(v.region, "ru"), "score": v.score,
                 "ok": sum(1 for a in answers if a.user_id == u.id and a.is_correct)} for v, u in top]

    # ─── Воронка ─────────────────────────────────────────────────────────
    day = (ev.starts_at or _local(datetime.utcnow())).date()
    tz = _tz()
    day_start = datetime.combine(day, datetime.min.time()).replace(tzinfo=tz).astimezone(timezone.utc).replace(tzinfo=None)
    new_users = User.query.filter(User.created_at >= day_start, User.created_at < day_start + timedelta(days=1)).count()
    askers = len({a.user_id for a in asks})
    funnel = [
        {"key": "viewers", "n": len(vs)},
        {"key": "profiles", "n": len(profiled)},
        {"key": "answered", "n": answered_people},
        {"key": "asked", "n": askers},
    ]
    fbs = LiveFeedback.query.filter_by(event_id=ev.id).order_by(LiveFeedback.created_at.desc()).all()
    if fbs:
        funnel.append({"key": "feedback", "n": len(fbs)})
    fb_dist = [sum(1 for f in fbs if f.rating == r) for r in range(1, 6)]
    fb = {
        "n": len(fbs), "avg": round(sum(f.rating for f in fbs) / len(fbs), 2) if fbs else None, "dist": fb_dist,
        "nps": round(100 * (fb_dist[4] - sum(fb_dist[:3])) / len(fbs)) if fbs else None,
        "liked": [{"key": k, "n": n} for k, n in Counter(x for f in fbs for x in (f.liked or [])).most_common()],
        "improve": [{"key": k, "n": n} for k, n in Counter(x for f in fbs for x in (f.improve or [])).most_common()],
        "comments": [{"rating": f.rating, "text": f.comment, "topics": f.topics, "at": svc.local_hm(f.created_at),
                      "name": f.user.full_name if f.user else ""} for f in fbs if f.comment or f.topics][:300],
    }

    ask_rows = []
    vmap = {v.user_id: v for v in vs}
    for a in asks:
        v = vmap.get(a.user_id)
        ask_rows.append({"text": a.text, "status": a.status, "at": svc.local_hm(a.created_at),
                         "name": a.user.full_name if a.user else "", "school": (v.school if v else "") or "",
                         "region": svc.region_name(v.region if v else None, "kk"), "region_ru": svc.region_name(v.region if v else None, "ru")})

    total_min = sum(minutes)
    return {
        "kpi": {
            "viewers": len(vs), "profiles": len(profiled), "schools": len(schools), "regions": len(reg),
            "answers": len(answers), "answered": answered_people, "asks": len(asks), "askers": askers,
            "avg_min": round(total_min / len(vs), 1) if vs else 0, "hours": round(total_min / 60),
            "peak": peak, "peak_at": peak_at, "new_users": new_users,
            "no_region": len(vs) - sum(reg.values()),
        },
        "timeline": timeline, "marks": marks,
        "regions": regions,
        "subjects": [{"key": k, "n": n} for k, n in subjects.most_common()],
        "positions": [{"key": k, "n": n} for k, n in positions.most_common()],
        "robotics": [{"key": k, "n": robotics.get(k, 0)} for k in svc.ROBOTICS],
        "schools": [{"name": school_name[k], "n": n} for k, n in schools.most_common(12)],
        "watch": [{"lo": lo, "hi": hi, "n": watch[i]} for i, (lo, hi) in enumerate(WATCH_BUCKETS)],
        "quiz": quiz, "top": top_rows, "funnel": funnel, "asks": ask_rows, "feedback": fb,
        "generated": _local(datetime.now(timezone.utc).replace(tzinfo=None)).strftime("%H:%M"),
        "live": (ev.state or {}).get("mode") not in (None, "waiting", "finish"),
    }
