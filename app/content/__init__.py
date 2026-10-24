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
    in_code = False
    for line in textwrap.dedent(md_text).strip().split("\n"):
        if line.lstrip().startswith("```"):
            in_code = not in_code
            out.append(line)
            continue
        if in_code:  # код не склеиваем: переносы строк в нем значимы
            out.append(line)
            continue
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
                published_at=utcnow(), self_paced=bool(spec.get("self_paced")))
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
                                body=les.get("body", {}), video_url=les.get("video", {}), kit=les.get("kit"),
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
        if cohorts and lv.get("cohort") and not p.self_paced:
            db.session.add(Cohort(name=lv["cohort"], program_id=p.id, level_id=level.id, program_version=1,
                                  language="ru", start_date=date.today(), capacity=1000, status="active",
                                  is_open=True))
    db.session.flush()
    if cohorts:
        from ..services.selfpaced import sync_program
        sync_program(p)  # постоянные потоки для курсов «в своем темпе»
    db.session.commit()
    return p


def update(slug: str) -> Program:
    """Обновляет уже загруженный курс на месте: программа, уровни, потоки и записи слушателей сохраняются.

    Уроки сопоставляются по русскому названию внутри уровня: совпавшие обновляются (прогресс слушателей сохраняется),
    новые создаются, исчезнувшие удаляются. Задания и критерии рубрик сопоставляются по порядку.
    """
    if slug not in COURSES:
        raise CourseError(f"Курс {slug} не найден. Доступны: {', '.join(sorted(COURSES))}")
    spec = COURSES[slug].PROGRAM
    p = Program.query.filter_by(slug=spec["slug"]).first()
    if p is None:
        return load(slug)
    for f in ("title", "summary", "description", "audience", "equipment", "color", "direction"):
        setattr(p, f, spec[f])
    p.self_paced = bool(spec.get("self_paced"))
    p.version = (p.version or 0) + 1
    p.published_at = utcnow()
    levels = {lv.number: lv for lv in p.levels}
    for number, lv_spec in enumerate(spec["levels"], start=1):
        level = levels.get(number)
        if level is None:
            level = Level(program_id=p.id, number=number)
            db.session.add(level)
            db.session.flush()
        level.title, level.description = lv_spec["title"], lv_spec.get("description", {})
        level.outcomes, level.duration = lv_spec.get("outcomes", {}), lv_spec.get("duration", {})
        level.min_quiz_score = lv_spec.get("min_quiz_score", 80)
        level.require_attendance = False
        _update_level_content(level, lv_spec)
    db.session.flush()
    from ..services.selfpaced import sync_program
    sync_program(p)
    db.session.commit()
    return p


def _update_level_content(level: Level, lv_spec: dict) -> None:
    old_modules = list(level.modules)
    old_lessons = {les.title.get("ru"): les for m in old_modules for les in m.lessons}
    kept_ids = set()
    for mi, mod_spec in enumerate(lv_spec["modules"]):
        if mi < len(old_modules):
            m = old_modules[mi]
            m.position, m.title = mi, mod_spec["title"]
        else:
            m = Module(level_id=level.id, position=mi, title=mod_spec["title"])
            db.session.add(m)
            db.session.flush()
        for li, les in enumerate(mod_spec["lessons"]):
            lesson = old_lessons.get(les["title"]["ru"])
            if lesson is None or lesson.id in kept_ids:
                lesson = Lesson(module_id=m.id, title=les["title"])
                db.session.add(lesson)
            lesson.module_id, lesson.position, lesson.kind = m.id, li, les["kind"]
            lesson.title, lesson.body = les["title"], les.get("body", {})
            lesson.video_url, lesson.duration_min = les.get("video", {}), les.get("minutes", 10)
            if not (lesson.kit or {}).get("_edited"):  # план, исправленный методистом в Студии, не затираем
                lesson.kit = les.get("kit")
            db.session.flush()
            kept_ids.add(lesson.id)
            QuizQuestion.query.filter_by(lesson_id=lesson.id).delete()
            for qi, q in enumerate(les.get("questions", [])):
                db.session.add(QuizQuestion(lesson_id=lesson.id, position=qi, prompt=q["q"], options=q["options"],
                                            correct=q["correct"], explanation=q.get("why", {})))
    db.session.flush()
    for les in old_lessons.values():
        if les.id not in kept_ids:
            db.session.delete(les)
    db.session.flush()
    for m in old_modules[len(lv_spec["modules"]):]:
        db.session.delete(m)
    old_asg = list(level.assignments)
    for ai, a in enumerate(lv_spec.get("assignments", [])):
        asg = old_asg[ai] if ai < len(old_asg) else None
        if asg is None:
            asg = Assignment(level_id=level.id)
            db.session.add(asg)
        asg.position, asg.title, asg.description = ai, a["title"], a["description"]
        asg.evidence_kind, asg.due_days = a.get("kind", "files"), a.get("due_days", 21)
        asg.pass_min_level = a.get("pass_min_level", 2)
        db.session.flush()
        old_crit = list(asg.criteria)
        for ci, (title, descriptors) in enumerate(a["rubric"]):
            if ci < len(old_crit):
                old_crit[ci].position, old_crit[ci].title, old_crit[ci].descriptors = ci, title, descriptors
            else:
                db.session.add(RubricCriterion(assignment_id=asg.id, position=ci, title=title, descriptors=descriptors))
        for c in old_crit[len(a["rubric"]):]:
            db.session.delete(c)


def _apply_self_paced(p: Program) -> None:
    """Переводит уже загруженный курс в режим «в своем темпе»: его открытые онлайн-потоки без тренера
    становятся постоянными (ссылки на запись сохраняются)."""
    from ..services.selfpaced import SELF_PACED_NAME
    p.self_paced = True
    taken = set()
    for c in Cohort.query.filter_by(program_id=p.id).order_by(Cohort.id):
        if (not c.self_paced and c.is_open and c.trainer_id is None and not c.sessions
                and c.level_id not in taken):
            c.self_paced, c.name = True, SELF_PACED_NAME
            taken.add(c.level_id)


def ensure_all() -> list[str]:
    """Загружает курсы, которых еще нет в базе (вызывается при старте приложения)."""
    created = []
    for slug, mod in COURSES.items():
        p = Program.query.filter_by(slug=mod.PROGRAM["slug"]).first()
        if not p:
            load(slug)
            created.append(slug)
        elif mod.PROGRAM.get("self_paced") and not p.self_paced:
            _apply_self_paced(p)
            db.session.commit()
    return created


from . import arduino_basics, canopy_2026, ftc_start_2026, spike_prime_fll  # noqa: E402

register(canopy_2026)
register(ftc_start_2026)
register(arduino_basics)
register(spike_prime_fll)
