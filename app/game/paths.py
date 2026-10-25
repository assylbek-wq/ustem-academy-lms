"""Пути на карте «Мой путь».

Три вида:
- season / growth - хранятся в journey_paths, их собирает методист в Студии (первые три - из SEED_PATHS);
- course - строятся сами из уровней опубликованного курса: уровень - этап, уроки и задания - шаги,
  сертификат уровня - последний шаг этапа. Ключ пути курса: "c-<slug курса>".
У каждого тренера свой набор путей (user_paths): выбранные вручную + курсы, на которые он записан,
+ программы его команд в USTEM Connect.
"""
from __future__ import annotations

import re

from ..models import Assignment, Cohort, Enrollment, JourneyPath, Program, UserPath, db
from .tracks import SEED_PATHS, ml

ICONS = ["flag", "team", "box", "robot", "code", "bulb", "swords", "flag-race", "podium", "globe", "trophy", "chip", "book"]
COURSE_COLORS = {"fll-challenge": "#e5322d", "ftc": "#f27c1c", "arduino": "#0e9f6e", "first": "#0085ff"}
SIM_RE = re.compile(r'class="(spike-sim|ftc-sim|lab-preset)-([a-z0-9-]+)"')


def seed() -> None:
    """Первые пути (FLL, FTC, WSO), если в базе еще нет ни одного."""
    if JourneyPath.query.first():
        return
    for i, p in enumerate(SEED_PATHS):
        db.session.add(JourneyPath(slug=p["code"], kind="season", title=p["title"], subtitle=p.get("season") or {},
                                   color=p["color"], programs=p.get("programs") or [], stages=p["stages"],
                                   status="published", position=i))
    db.session.commit()


def _glow(color: str) -> str:
    """Светлый вариант цвета для подсветки на карте."""
    try:
        r, g, b = (int(color[i:i + 2], 16) for i in (1, 3, 5))
    except (ValueError, TypeError):
        return "#8cc8ff"
    return "#{:02x}{:02x}{:02x}".format(*(min(255, c + (255 - c) * 2 // 5) for c in (r, g, b)))


def from_db(p: JourneyPath) -> dict:
    return {"key": p.slug, "code": p.slug, "kind": p.kind, "title": p.title, "season": p.subtitle or {},
            "color": p.color or "#0085ff", "glow": _glow(p.color or "#0085ff"), "programs": p.programs or [],
            "stages": p.stages or [], "status": p.status, "id": p.id}


def from_course(prog: Program) -> dict:
    stages = []
    for li, lv in enumerate(sorted(prog.levels, key=lambda x: x.number)):
        steps = []
        for m in sorted(lv.modules, key=lambda x: x.position):
            for les in sorted(m.lessons, key=lambda x: x.position):
                body = " ".join(v or "" for v in (les.body or {}).values()) if isinstance(les.body, dict) else ""
                sims = sorted({f"{'lab-' if kind == 'lab-preset' else ''}{name if kind == 'lab-preset' else kind.split('-')[0] + '-' + name}"
                               for kind, name in SIM_RE.findall(body)})
                steps.append({"code": f"l{les.id}", "kind": "lesson", "lesson_id": les.id, "title": les.title,
                              "quiz": les.kind == "quiz"})
                for preset in sims:
                    if "sandbox" not in preset:
                        steps.append({"code": f"sim-{preset}", "kind": "sim", "preset": preset,
                                      "title": ml(f"Задание симулятора: {preset}", f"Симулятор тапсырмасы: {preset}", f"Simulator task: {preset}")})
        for a in Assignment.query.filter_by(level_id=lv.id).order_by(Assignment.position):
            steps.append({"code": f"a{a.id}", "kind": "evidence", "assignment_id": a.id, "title": a.title})
        steps.append({"code": f"level-{lv.number}", "kind": "course", "course": prog.slug, "level": lv.number,
                      "title": ml("Сертификат уровня", "Деңгей сертификаты", "Level certificate")})
        stages.append({"code": f"lv{lv.number}", "icon": ICONS[(li + 4) % len(ICONS)], "title": lv.title, "steps": steps})
    color = prog.color or COURSE_COLORS.get(prog.direction, "#0085ff")
    return {"key": f"c-{prog.slug}", "code": f"c-{prog.slug}", "kind": "course", "title": prog.title,
            "season": prog.summary or {}, "color": color, "glow": _glow(color), "programs": [], "stages": stages,
            "course": prog.slug, "status": prog.status}


def published_db_paths() -> list[dict]:
    seed()
    return [from_db(p) for p in JourneyPath.query.filter_by(status="published").order_by(JourneyPath.position, JourneyPath.id)]


def get(key: str, include_drafts: bool = False) -> dict | None:
    if key.startswith("c-"):
        prog = Program.query.filter_by(slug=key[2:]).first()
        return from_course(prog) if prog and (prog.status == "published" or include_drafts) else None
    seed()
    p = JourneyPath.query.filter_by(slug=key).first()
    return from_db(p) if p and (p.status == "published" or include_drafts) else None


def program_matches(path: dict, program_code: str) -> bool:
    return any(program_code == c or program_code.startswith(c + "_") for c in path.get("programs") or [])


def connect_programs(user) -> set[str]:
    return {t.get("program") for t in (user.connect_snapshot or {}).get("teams", []) if t.get("program")}


def for_user(user) -> list[dict]:
    """Пути тренера по порядку: программы его команд в Connect, выбранные сезоны, курсы (свежие первыми)."""
    chosen = [u.key for u in UserPath.query.filter_by(user_id=user.id).order_by(UserPath.id)]
    progs = connect_programs(user)
    out, seen = [], set()

    def add(path):
        if path and path["key"] not in seen:
            seen.add(path["key"])
            out.append(path)

    db_paths = published_db_paths()
    for p in db_paths:
        if any(program_matches(p, c) for c in progs):
            add({**p, "auto": "connect"})
    for key in chosen:
        if not key.startswith("c-"):
            add(next((p for p in db_paths if p["key"] == key), None))
    enrolled = (db.session.query(Program).join(Cohort, Cohort.program_id == Program.id)
                .join(Enrollment, Enrollment.cohort_id == Cohort.id).filter(Enrollment.user_id == user.id, Enrollment.status != "dropped", Program.status == "published")
                .order_by(Enrollment.enrolled_at.desc()).all())
    for prog in dict.fromkeys(enrolled):
        add({**from_course(prog), "auto": "course"})
    for key in chosen:
        if key.startswith("c-"):
            add(get(key))
    return out


def user_has(user, key: str) -> bool:
    return any(p["key"] == key for p in for_user(user))
