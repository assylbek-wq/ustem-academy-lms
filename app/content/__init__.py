"""Готовые курсы Академии, которые хранятся в коде и загружаются в базу командой `flask load-course`.

Каждый курс - модуль с константами SLUG и PROGRAM (словарь со структурой программы).
Изображения курса лежат в app/static/course/<slug-курса>/.
"""
from __future__ import annotations

import re
import textwrap
from datetime import date

from ..models import (Assignment, Cohort, Lesson, Level, Module, Program, QuizQuestion, RubricCriterion, db,
                      utcnow)

COURSES = {}


def register(module) -> None:
    COURSES[module.SLUG] = module


_BLOCK_START = re.compile(r"^(\s*[-*+] |\s*\d+\. |#|\||\[!\[|<|---|```)")


def unwrap(md_text: str) -> str:
    """Склеивает переносы внутри абзацев: рендер Markdown превращает каждый перенос в <br> (nl2br)."""
    out: list[str] = []
    for line in textwrap.dedent(md_text).strip().split("\n"):
        prev = out[-1] if out else ""
        cont = line.strip()
        if (out and cont and prev.strip() and not _BLOCK_START.match(line)
                and not prev.lstrip().startswith(("#", "|", "---", "```", "<span"))):
            if line.startswith(">") and prev.startswith(">"):
                cont = line[1:].strip()
            elif line.startswith(">"):
                out.append(line)
                continue
            out[-1] = prev.rstrip() + " " + cont
        else:
            out.append(line)
    return "\n".join(out)


def ru(text: str) -> dict:
    """Текст только на русском (казахская и английская версии покажут русский с пометкой)."""
    return {"ru": unwrap(text)}


def ml(ru_text: str, kk: str, en: str) -> dict:
    return {"ru": ru_text, "kk": kk, "en": en}


class CourseError(RuntimeError):
    pass


def load(slug: str, replace: bool = False, cohorts: bool = True) -> Program:
    """Создает программу из описания курса. Существующую программу без групп пересоздает;
    программу с группами пересоздает только при replace=True (прогресс слушателей при этом теряется)."""
    if slug not in COURSES:
        raise CourseError(f"Курс {slug} не найден. Доступны: {', '.join(sorted(COURSES))}")
    spec = COURSES[slug].PROGRAM
    old = Program.query.filter_by(slug=spec["slug"]).first()
    if old:
        has_cohorts = Cohort.query.filter_by(program_id=old.id).first() is not None
        if has_cohorts and not replace:
            raise CourseError("У программы уже есть группы. Запустите с --replace, если прогресс можно сбросить.")
        Cohort.query.filter_by(program_id=old.id).delete()
        db.session.delete(old)
        db.session.flush()

    p = Program(slug=spec["slug"], direction=spec["direction"], title=spec["title"], summary=spec["summary"],
                description=spec["description"], audience=spec["audience"], equipment=spec["equipment"],
                color=spec["color"], position=spec.get("position", 0), status="published", version=1,
                published_at=utcnow())
    db.session.add(p)
    db.session.flush()
    for number, lv in enumerate(spec["levels"], start=1):
        level = Level(program_id=p.id, number=number, title=lv["title"], description=lv.get("description", {}),
                      outcomes=lv.get("outcomes", {}), duration=lv.get("duration", {}),
                      min_quiz_score=lv.get("min_quiz_score", 80), require_attendance=False)
        db.session.add(level)
        db.session.flush()
        for mi, mod in enumerate(lv["modules"]):
            m = Module(level_id=level.id, position=mi, title=mod["title"])
            db.session.add(m)
            db.session.flush()
            for li, les in enumerate(mod["lessons"]):
                lesson = Lesson(module_id=m.id, position=li, kind=les["kind"], title=les["title"],
                                body=les.get("body", {}), video_url=les.get("video", {}),
                                duration_min=les.get("minutes", 10))
                db.session.add(lesson)
                db.session.flush()
                for qi, q in enumerate(les.get("questions", [])):
                    db.session.add(QuizQuestion(lesson_id=lesson.id, position=qi, prompt=q["q"],
                                                options=q["options"], correct=q["correct"],
                                                explanation=q.get("why", {})))
        for ai, a in enumerate(lv.get("assignments", [])):
            asg = Assignment(level_id=level.id, position=ai, title=a["title"], description=a["description"],
                             evidence_kind=a.get("kind", "files"), due_days=a.get("due_days", 21),
                             pass_min_level=a.get("pass_min_level", 2))
            db.session.add(asg)
            db.session.flush()
            for ci, (title, descriptors) in enumerate(a["rubric"]):
                db.session.add(RubricCriterion(assignment_id=asg.id, position=ci, title=title,
                                               descriptors=descriptors))
        if cohorts and lv.get("cohort"):
            db.session.add(Cohort(name=lv["cohort"], program_id=p.id, level_id=level.id, program_version=1,
                                  language="ru", start_date=date.today(), capacity=1000, status="active",
                                  is_open=True))
    db.session.commit()
    return p


def ensure_all() -> list[str]:
    """Загружает курсы, которых еще нет в базе (вызывается при старте приложения)."""
    created = []
    for slug, mod in COURSES.items():
        if not Program.query.filter_by(slug=mod.PROGRAM["slug"]).first():
            load(slug)
            created.append(slug)
    return created


from . import canopy_2026  # noqa: E402

register(canopy_2026)
