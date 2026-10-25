"""Геймификация: опыт, звания, значки, серия дней, путь сезона и рейтинг.

Опыт не начисляется вручную в разных местах кода: refresh(user) собирает факты (уроки, тесты, сертификаты,
принятые задания, задания симуляторов, шаги пути из Connect и самоотметки) и сверяет с таблицей xp_events.
Факт исчез (отметку сняли, сертификат отозван) - его опыт тоже уходит. Значки остаются навсегда.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timedelta

from sqlalchemy import func

from ..game import paths as gpaths
from ..game.tracks import (BADGES, RANKS, XP_EVIDENCE, XP_LESSON, XP_LEVEL, XP_PHOTO_BONUS, XP_QUIZ, XP_SIM,
                           all_steps, sim_presets)
from ..models import (Certificate, Cohort, Enrollment, Evidence, JourneyMark, Lesson, LessonProgress, Program,
                      SimSolve, User, UserBadge, XpEvent, db, utcnow)
from . import connect


def _dt(v) -> datetime | None:
    if not v:
        return None
    if isinstance(v, datetime):
        return v
    try:
        d = datetime.fromisoformat(str(v).replace("Z", "+00:00"))
    except ValueError:
        return None
    return d.astimezone().replace(tzinfo=None) if d.tzinfo else d


# ─── Шаги из Connect ─────────────────────────────────────────────────────
def _teams(user: User, track: dict) -> list[dict]:
    teams = [t for t in (user.connect_snapshot or {}).get("teams", [])
             if t.get("program") and gpaths.program_matches(track, t["program"])]
    current = [t for t in teams if t.get("is_current")]
    return current or teams


def connect_step(user: User, track: dict, step: dict) -> datetime | None:
    """Когда шаг засчитан по данным Connect (или None)."""
    rule = step["rule"]
    if rule == "linked":
        return user.connect_linked_at
    if not user.connect_person_id:
        return None
    teams = _teams(user, track)
    now = user.connect_synced_at or utcnow()
    if rule == "team":
        return now if teams else None
    if rule == "roster":
        ok = [t for t in teams if step["min"] <= (t.get("students") or 0) <= step["max"] and not t.get("consents_missing")]
        return now if ok else None
    if rule == "registered":
        return now if any(t.get("status") in ("registered", "verified") for t in teams) else None
    if rule == "number":
        return now if any(t.get("team_number") for t in teams) else None
    kinds = step.get("kinds")
    regs = [r for t in teams for r in t.get("registrations", []) if not kinds or r.get("kind") in kinds]
    hits: list[datetime] = []
    for r in regs:
        if rule == "approved" and r.get("status") in ("approved", "checked_in"):
            hits.append(_dt(r.get("decided_at")) or _dt(r.get("starts_at")) or now)
        elif rule == "played" and (r.get("checked_in_at") or r.get("status") == "checked_in" or r.get("rank")):
            hits.append(_dt(r.get("checked_in_at")) or _dt(r.get("starts_at")) or now)
        elif rule == "award" and r.get("awards"):
            hits.append(_dt(r.get("ends_at")) or _dt(r.get("starts_at")) or now)
        elif rule == "advanced" and r.get("advanced"):
            hits.append(_dt(r.get("ends_at")) or _dt(r.get("starts_at")) or now)
    return min(hits) if hits else None


# ─── Факты пользователя ──────────────────────────────────────────────────
class Facts:
    def __init__(self, user: User):
        self.user = user
        enr_ids = [e.id for e in Enrollment.query.filter_by(user_id=user.id)]
        self.lessons: dict[int, datetime] = {}
        self.quizzes: dict[int, datetime] = {}
        if enr_ids:
            rows = (db.session.query(LessonProgress, Lesson).join(Lesson, Lesson.id == LessonProgress.lesson_id)
                    .filter(LessonProgress.enrollment_id.in_(enr_ids), LessonProgress.completed_at.isnot(None)).all())
            for lp, les in rows:
                self.lessons.setdefault(les.id, lp.completed_at)
                if les.kind == "quiz" and lp.quiz_score is not None:
                    self.quizzes.setdefault(les.id, lp.completed_at)
        self.certs = (db.session.query(Certificate, Program.slug).outerjoin(Enrollment, Enrollment.id == Certificate.enrollment_id)
                      .outerjoin(Cohort, Cohort.id == Enrollment.cohort_id).outerjoin(Program, Program.id == Cohort.program_id)
                      .filter(Certificate.user_id == user.id, Certificate.status == "valid").all())
        self.evidence: dict[int, datetime] = {}
        if enr_ids:
            for ev in Evidence.query.filter(Evidence.enrollment_id.in_(enr_ids), Evidence.status == "accepted"):
                self.evidence.setdefault(ev.assignment_id, ev.submitted_at)
        self.sims = {s.preset: s.solved_at for s in SimSolve.query.filter_by(user_id=user.id)}
        self.marks = {(m.track, m.step): m for m in JourneyMark.query.filter_by(user_id=user.id)}

    def course_done(self, slug: str, level: int) -> datetime | None:
        got = [c.issued_at for c, s in self.certs if s == slug and c.level_number == level]
        return min(got) if got else None

    def step_done(self, track: dict, step: dict) -> datetime | None:
        k = step["kind"]
        if k == "connect":
            return connect_step(self.user, track, step)
        if k == "sim":
            return self.sims.get(step["preset"])
        if k == "course":
            return self.course_done(step["course"], step["level"])
        if k == "lesson":
            return self.lessons.get(step["lesson_id"])
        if k == "evidence":
            return self.evidence.get(step["assignment_id"])
        m = self.marks.get((track["code"], step["code"]))
        return m.created_at if m else None

    def xp_rows(self) -> dict[str, tuple[str, int, dict, datetime]]:
        """ref -> (kind, xp, title, when)"""
        out: dict[str, tuple[str, int, dict, datetime]] = {}
        titles = {l.id: l.title for l in Lesson.query.filter(Lesson.id.in_(list(self.lessons)))} if self.lessons else {}
        for lid, at in self.lessons.items():
            out[f"lesson:{lid}"] = ("lesson", XP_LESSON, titles.get(lid) or {}, at)
        for lid, at in self.quizzes.items():
            out[f"quiz:{lid}"] = ("quiz", XP_QUIZ, titles.get(lid) or {}, at)
        for c, _slug in self.certs:
            out[f"cert:{c.id}"] = ("level", XP_LEVEL, c.level_title or {}, c.issued_at)
        for aid, at in self.evidence.items():
            out[f"evidence:{aid}"] = ("evidence", XP_EVIDENCE, {}, at)
        for preset, at in self.sims.items():
            out[f"sim:{preset}"] = ("sim", XP_SIM, {"ru": preset}, at)
        seen = set()
        # все опубликованные пути, а не только выбранные: отметка или результат в Connect не теряются,
        # если тренер убрал путь из своего списка
        for track in gpaths.published_db_paths():
            for _stage, step in all_steps(track):
                if step["kind"] not in ("connect", "self"):
                    continue
                # общий шаг (подключение Connect) засчитывается один раз на оба пути
                ref = "step:connect" if step["code"] == "connect" else f"step:{track['code']}:{step['code']}"
                if ref in seen:
                    continue
                at = self.step_done(track, step)
                if at:
                    seen.add(ref)
                    xp = step["xp"]
                    m = self.marks.get((track["code"], step["code"]))
                    if m and m.photo_id:
                        xp += XP_PHOTO_BONUS
                    out[ref] = ("step", xp, step["title"], at)
        return out


# ─── Сверка опыта и значков ──────────────────────────────────────────────
def refresh(user: User, sync_connect: bool = True) -> list[str]:
    """Пересчитать опыт и значки. Возвращает коды новых значков."""
    if sync_connect:
        connect.sync(user)
    facts = Facts(user)
    want = facts.xp_rows()
    have = {e.ref: e for e in XpEvent.query.filter_by(user_id=user.id)}
    for ref, ev in have.items():
        if ref not in want:
            db.session.delete(ev)
        elif ev.xp != want[ref][1]:
            ev.xp = want[ref][1]
    for ref, (kind, xp, title, at) in want.items():
        if ref not in have:
            db.session.add(XpEvent(user_id=user.id, ref=ref, kind=kind, xp=xp, title=title, created_at=at or utcnow()))
    db.session.flush()
    new = _badges(user, facts, want)
    db.session.commit()
    return new


def _badges(user: User, facts: Facts, want: dict) -> list[str]:
    earned = {b.code for b in UserBadge.query.filter_by(user_id=user.id)}
    cond = {
        "first-lesson": bool(facts.lessons),
        "connected": bool(user.connect_person_id),
        "first-sim": len(facts.sims) >= 1,
        "sim-5": len(facts.sims) >= 5,
        "spike-master": all(p in facts.sims for p in sim_presets("spike-")),
        "ftc-master": all(p in facts.sims for p in sim_presets("ftc-")),
        "cubesat-master": all(p in facts.sims for p in sim_presets("cubesat-")),
        "certified": bool(facts.certs),
        "team": any(r.endswith((":registered",)) for r in want),
        "first-event": any(r.endswith((":scrimmage", ":qual-played", ":nat-played", ":played")) for r in want),
        "award": any(r.endswith((":award", ":nat-award")) for r in want),
        "advanced": any(r.endswith(":advanced") for r in want),
        "national": any(r.endswith(":nat-played") for r in want),
        "world": any(r.endswith(":world") for r in want),
        "stage": any(s["done"] == s["total"] and s["total"] for t in gpaths.for_user(user)
                     for s in track_state(user, t, facts)["stages"]),
        "chronicler": sum(1 for m in facts.marks.values() if m.photo_id) >= 10,
        "streak-7": streak(user)[1] >= 7,
        "streak-30": streak(user)[1] >= 30,
    }
    new = [code for code, ok in cond.items() if ok and code not in earned]
    for code in new:
        db.session.add(UserBadge(user_id=user.id, code=code))
    return new


# ─── Чтение состояния ────────────────────────────────────────────────────
def total_xp(user: User) -> int:
    return int(db.session.query(func.coalesce(func.sum(XpEvent.xp), 0)).filter(XpEvent.user_id == user.id).scalar() or 0)


def rank_of(xp: int) -> dict:
    idx = max(i for i, (need, _) in enumerate(RANKS) if xp >= need)
    need, title = RANKS[idx]
    nxt = RANKS[idx + 1] if idx + 1 < len(RANKS) else None
    pct = 100 if not nxt else round(100 * (xp - need) / (nxt[0] - need))
    return {"level": idx + 1, "title": title, "floor": need, "next": nxt[0] if nxt else None,
            "next_title": nxt[1] if nxt else None, "pct": pct, "to_next": (nxt[0] - xp) if nxt else 0}


def streak(user: User, today: date | None = None) -> tuple[int, int]:
    """(текущая серия дней, лучшая серия)"""
    raw = db.session.query(func.date(XpEvent.created_at)).filter(XpEvent.user_id == user.id).distinct()
    days = sorted({d if isinstance(d, date) else date.fromisoformat(str(d)[:10]) for (d,) in raw if d})
    if not days:
        return 0, 0
    best = cur = 1
    for a, b in zip(days, days[1:]):
        cur = cur + 1 if (b - a).days == 1 else 1
        best = max(best, cur)
    today = today or utcnow().date()
    run, d = 0, today if today in days else today - timedelta(days=1)
    s = set(days)
    while d in s:
        run += 1
        d -= timedelta(days=1)
    return run, best


def track_state(user: User, track: dict, facts: Facts | None = None) -> dict:
    facts = facts or Facts(user)
    stages, current = [], None
    for i, stage in enumerate(track["stages"]):
        steps = []
        for step in stage["steps"]:
            at = facts.step_done(track, step)
            xp = step.get("xp") or {"sim": XP_SIM, "course": XP_LEVEL, "evidence": XP_EVIDENCE,
                                    "lesson": XP_QUIZ if step.get("quiz") else XP_LESSON}.get(step["kind"], 0)
            mark = facts.marks.get((track["code"], step["code"])) if step["kind"] == "self" else None
            steps.append({**step, "done": bool(at), "done_at": at, "xp": xp, "mark": mark})
        done = sum(1 for s in steps if s["done"])
        st = {"index": i, "code": stage["code"], "icon": stage["icon"], "title": stage["title"], "steps": steps,
              "done": done, "total": len(steps), "complete": done == len(steps)}
        if current is None and not st["complete"]:
            current = i
        stages.append(st)
    total = sum(s["total"] for s in stages)
    done = sum(s["done"] for s in stages)
    current = len(stages) - 1 if current is None else current
    reach = max([s["index"] for s in stages if s["done"]] + [current])  # докуда уже «доехали» по карте
    return {"track": track, "stages": stages, "current": current, "reach": reach,
            "done": done, "total": total, "pct": round(100 * done / total) if total else 0}


def summary(user: User) -> dict:
    xp = total_xp(user)
    cur, best = streak(user)
    badges = {b.code: b.earned_at for b in UserBadge.query.filter_by(user_id=user.id)}
    recent = XpEvent.query.filter_by(user_id=user.id).order_by(XpEvent.created_at.desc()).limit(6).all()
    week = int(db.session.query(func.coalesce(func.sum(XpEvent.xp), 0)).filter(
        XpEvent.user_id == user.id, XpEvent.created_at >= utcnow() - timedelta(days=7)).scalar() or 0)
    return {"xp": xp, "rank": rank_of(xp), "streak": cur, "best_streak": best, "badges": badges, "recent": recent,
            "week": week, "region": connect.region_of(user)}


def path_member_ids(path: dict) -> set[int]:
    """Кто идет по пути: выбрал сам, записан на курс или ведет команду этой программы в Connect."""
    from ..models import Cohort, Enrollment, UserPath
    ids = {u.user_id for u in UserPath.query.filter_by(key=path["key"])}
    if path["kind"] == "course":
        ids |= {uid for (uid,) in db.session.query(Enrollment.user_id).join(Cohort, Cohort.id == Enrollment.cohort_id)
                .join(Program, Program.id == Cohort.program_id)
                .filter(Program.slug == path["course"], Enrollment.status != "dropped")}
    elif path.get("programs"):
        for u in User.query.filter(User.connect_person_id.isnot(None)):
            if any(gpaths.program_matches(path, c) for c in gpaths.connect_programs(u)):
                ids.add(u.id)
    return ids


def leaderboard(region: str | None = None, limit: int | None = 50, path: dict | None = None) -> list[dict]:
    rows = (db.session.query(User, func.sum(XpEvent.xp).label("xp"))
            .join(XpEvent, XpEvent.user_id == User.id)
            .filter(User.leaderboard_hidden.is_(False), User.is_active.is_(True))
            .group_by(User.id).order_by(func.sum(XpEvent.xp).desc()).all())
    members = path_member_ids(path) if path else None
    out = []
    for u, xp in rows:
        if members is not None and u.id not in members:
            continue
        r = connect.region_of(u)
        if region and r != region:
            continue
        out.append({"user": u, "xp": int(xp or 0), "region": r, "rank": rank_of(int(xp or 0))})
    for i, row in enumerate(out, 1):
        row["place"] = i
    return out if limit is None else out[:limit]


def regions_in_board() -> list[str]:
    return sorted({r["region"] for r in leaderboard(limit=None) if r["region"]})


def badge_list(earned: dict) -> list[dict]:
    return [{"code": c, **b, "earned_at": earned.get(c)} for c, b in BADGES.items()]


def by_kind(user: User) -> dict[str, int]:
    out: dict[str, int] = defaultdict(int)
    for kind, xp in db.session.query(XpEvent.kind, func.sum(XpEvent.xp)).filter(XpEvent.user_id == user.id).group_by(XpEvent.kind):
        out[kind] = int(xp or 0)
    return dict(out)
