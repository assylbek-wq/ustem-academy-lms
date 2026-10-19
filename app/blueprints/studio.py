"""Студия методиста: конструктор программ, уровней, модулей, уроков, тестов, заданий и рубрик."""
from __future__ import annotations

import re

from flask import Blueprint, abort, flash, g, jsonify, redirect, render_template, request, url_for

from ..core import audit, ml_from_form, ml_list_from_form, render_markdown, role_required
from ..i18n import LOCALES, t
from ..models import (DIRECTIONS, EVIDENCE_KINDS, LESSON_KINDS, Assignment, Cohort, Evidence, Lesson,
                      LessonMaterial, LessonProgress, Level, Module, Program, QuizQuestion, RubricCriterion, db,
                      utcnow)
from ..services import selfpaced, storage

bp = Blueprint("studio", __name__, url_prefix="/studio")

DEFAULT_DESCRIPTORS = [
    {"ru": "1 - Не проявлено", "kk": "1 - Көрінбеді", "en": "1 - Not evident"},
    {"ru": "2 - Частично", "kk": "2 - Ішінара", "en": "2 - Partially"},
    {"ru": "3 - Уверенно", "kk": "3 - Сенімді", "en": "3 - Proficient"},
    {"ru": "4 - Образцово", "kk": "4 - Үлгілі", "en": "4 - Exemplary"},
]


def slugify(text: str) -> str:
    table = str.maketrans({"а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e", "ж": "zh", "з": "z",
                           "и": "i", "й": "y", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o", "п": "p", "р": "r",
                           "с": "s", "т": "t", "у": "u", "ф": "f", "х": "h", "ц": "ts", "ч": "ch", "ш": "sh",
                           "щ": "sch", "ы": "y", "э": "e", "ю": "yu", "я": "ya", "ә": "a", "ғ": "g", "қ": "k",
                           "ң": "n", "ө": "o", "ұ": "u", "ү": "u", "һ": "h", "і": "i", "ь": "", "ъ": ""})
    s = re.sub(r"[^a-z0-9]+", "-", (text or "").lower().translate(table)).strip("-")
    return s[:80] or "program"


def unique_slug(base: str, exclude_id: int | None = None) -> str:
    slug, n = base, 2
    while True:
        q = Program.query.filter_by(slug=slug)
        if exclude_id:
            q = q.filter(Program.id != exclude_id)
        if not q.first():
            return slug
        slug, n = f"{base}-{n}", n + 1


def get_or_404(model, id_):
    obj = db.session.get(model, id_)
    if not obj:
        abort(404)
    return obj


def _swap(items: list, obj, direction: int) -> None:
    items = sorted(items, key=lambda x: (x.position, x.id))
    for i, it in enumerate(items):
        it.position = i
    idx = items.index(obj)
    j = idx + direction
    if 0 <= j < len(items):
        items[idx].position, items[j].position = items[j].position, items[idx].position


def _next_pos(items) -> int:
    return max((x.position for x in items), default=-1) + 1


# ─── Программы ───────────────────────────────────────────────────────────
@bp.route("", methods=["GET", "POST"])
@role_required("methodist")
def index():
    if request.method == "POST":
        title = ml_from_form("title")
        if not any(title.values()):
            flash(t("studio.err_title"), "error")
            return redirect(url_for("studio.index"))
        p = Program(title=title, slug=unique_slug(slugify(title.get("en") or title.get("ru") or title.get("kk"))),
                    direction=request.form.get("direction") if request.form.get("direction") in DIRECTIONS else "other")
        db.session.add(p)
        db.session.flush()
        db.session.add(Level(program_id=p.id, number=1, title={"ru": "Старт", "kk": "Старт", "en": "Start"}))
        audit("program.created", "program", p.id)
        db.session.commit()
        return redirect(url_for("studio.program", program_id=p.id))
    programs = Program.query.order_by(Program.position, Program.id).all()
    return render_template("studio/index.html", programs=programs, directions=DIRECTIONS)


@bp.route("/programs/<int:program_id>", methods=["GET", "POST"])
@role_required("methodist")
def program(program_id):
    p = get_or_404(Program, program_id)
    if request.method == "POST":
        action = request.form.get("action")
        if action == "meta":
            for f in ("title", "summary", "description", "audience", "equipment"):
                setattr(p, f, ml_from_form(f))
            if request.form.get("direction") in DIRECTIONS:
                p.direction = request.form["direction"]
            color = request.form.get("color", "")
            if re.fullmatch(r"#[0-9a-fA-F]{6}", color):
                p.color = color
            p.position = request.form.get("position", type=int) or 0
            p.self_paced = bool(request.form.get("self_paced"))
            slug = slugify(request.form.get("slug") or "")
            if slug:
                p.slug = unique_slug(slug, exclude_id=p.id)
            flash(t("studio.saved"), "success")
        elif action == "publish":
            p.status, p.version, p.published_at = "published", (p.version or 0) + 1, utcnow()
            audit("program.published", "program", p.id, version=p.version)
            flash(t("studio.published", v=p.version), "success")
        elif action == "unpublish":
            p.status = "draft"
            flash(t("studio.unpublished"), "success")
        elif action == "add_level":
            n = max((l.number for l in p.levels), default=0) + 1
            db.session.add(Level(program_id=p.id, number=n, title={"ru": f"Уровень {n}", "kk": f"{n}-деңгей",
                                                                    "en": f"Level {n}"}))
        elif action == "delete":
            # пустые постоянные потоки «в своем темпе» удаляются вместе с программой
            for c in Cohort.query.filter_by(program_id=p.id, self_paced=True).all():
                if not c.enrollments:
                    db.session.delete(c)
            db.session.flush()
            if Cohort.query.filter_by(program_id=p.id).first():
                flash(t("studio.err_in_use"), "error")
            else:
                audit("program.deleted", "program", p.id)
                db.session.delete(p)
                db.session.commit()
                return redirect(url_for("studio.index"))
        db.session.flush()
        selfpaced.sync_program(p)
        db.session.commit()
        return redirect(url_for("studio.program", program_id=p.id))
    return render_template("studio/program.html", p=p, directions=DIRECTIONS, lesson_kinds=LESSON_KINDS)


@bp.route("/levels/<int:level_id>", methods=["GET", "POST"])
@role_required("methodist")
def level(level_id):
    lv = get_or_404(Level, level_id)
    if request.method == "POST":
        action = request.form.get("action")
        if action == "meta":
            for f in ("title", "description", "outcomes", "duration"):
                setattr(lv, f, ml_from_form(f))
            score = request.form.get("min_quiz_score", type=int)
            lv.min_quiz_score = max(0, min(100, 70 if score is None else score))
            lv.require_attendance = bool(request.form.get("require_attendance"))
            flash(t("studio.saved"), "success")
        elif action == "add_module":
            title = ml_from_form("module_title")
            if not any(title.values()):
                title = {"ru": "Новый модуль", "kk": "Жаңа модуль", "en": "New module"}
            db.session.add(Module(level_id=lv.id, title=title, position=_next_pos(lv.modules)))
        elif action == "rename_module":
            m = get_or_404(Module, request.form.get("module_id", type=int))
            if m.level_id == lv.id:
                m.title = ml_from_form("module_title")
        elif action == "move_module":
            m = get_or_404(Module, request.form.get("module_id", type=int))
            if m.level_id != lv.id:
                abort(404)
            _swap(lv.modules, m, -1 if request.form.get("dir") == "up" else 1)
        elif action == "delete_module":
            m = get_or_404(Module, request.form.get("module_id", type=int))
            ids = [l.id for l in m.lessons]
            if ids and LessonProgress.query.filter(LessonProgress.lesson_id.in_(ids)).first():
                flash(t("studio.err_lesson_in_use"), "error")
            elif m.level_id == lv.id:
                db.session.delete(m)
        elif action == "add_lesson":
            m = get_or_404(Module, request.form.get("module_id", type=int))
            if m.level_id != lv.id:
                abort(404)
            kind = request.form.get("kind") if request.form.get("kind") in LESSON_KINDS else "text"
            names = {"video": ("Новый видеоурок", "Жаңа бейнесабақ", "New video lesson"),
                     "text": ("Новый урок", "Жаңа сабақ", "New lesson"),
                     "quiz": ("Тест", "Тест", "Quiz")}[kind]
            lesson = Lesson(module_id=m.id, kind=kind, title=dict(zip(LOCALES, names)),
                            position=_next_pos(m.lessons), duration_min=5 if kind == "quiz" else 10)
            db.session.add(lesson)
            db.session.commit()
            return redirect(url_for("studio.lesson", lesson_id=lesson.id))
        elif action == "move_lesson":
            lesson = get_or_404(Lesson, request.form.get("lesson_id", type=int))
            if lesson.module.level_id != lv.id:
                abort(404)
            _swap(lesson.module.lessons, lesson, -1 if request.form.get("dir") == "up" else 1)
        elif action == "add_assignment":
            a = Assignment(level_id=lv.id, position=_next_pos(lv.assignments),
                           title={"ru": "Видео своего урока", "kk": "Өз сабағыңыздың бейнесі",
                                  "en": "Video of your lesson"})
            db.session.add(a)
            db.session.flush()
            db.session.add(RubricCriterion(assignment_id=a.id, position=0,
                                           title={"ru": "Критерий", "kk": "Критерий", "en": "Criterion"},
                                           descriptors=DEFAULT_DESCRIPTORS))
            db.session.commit()
            return redirect(url_for("studio.assignment", assignment_id=a.id))
        elif action == "delete_level":
            for c in Cohort.query.filter_by(level_id=lv.id, self_paced=True).all():
                if not c.enrollments:
                    db.session.delete(c)
            db.session.flush()
            if Cohort.query.filter_by(level_id=lv.id).first():
                flash(t("studio.err_in_use"), "error")
            else:
                pid = lv.program_id
                db.session.delete(lv)
                db.session.commit()
                return redirect(url_for("studio.program", program_id=pid))
        db.session.commit()
        return redirect(url_for("studio.level", level_id=lv.id))
    return render_template("studio/level.html", lv=lv, p=lv.program, lesson_kinds=LESSON_KINDS)


@bp.route("/lessons/<int:lesson_id>", methods=["GET", "POST"])
@role_required("methodist")
def lesson(lesson_id):
    lesson = get_or_404(Lesson, lesson_id)
    lv = lesson.module.level
    if request.method == "POST":
        action = request.form.get("action")
        if action == "meta":
            lesson.title = ml_from_form("title")
            lesson.body = ml_from_form("body")
            lesson.video_url = ml_from_form("video_url")
            if request.form.get("kind") in LESSON_KINDS:
                lesson.kind = request.form["kind"]
            lesson.duration_min = max(1, min(600, request.form.get("duration_min", type=int) or 10))
            mid = request.form.get("module_id", type=int)
            if mid and mid != lesson.module_id:
                m = db.session.get(Module, mid)
                if m and m.level_id == lv.id:
                    lesson.module_id = m.id
                    lesson.position = _next_pos(m.lessons)
            flash(t("studio.saved"), "success")
        elif action == "add_question":
            db.session.add(QuizQuestion(lesson_id=lesson.id, position=_next_pos(lesson.questions),
                                        prompt={"ru": "Новый вопрос"},
                                        options=[{"ru": "Вариант 1"}, {"ru": "Вариант 2"}], correct=[0]))
        elif action == "save_question":
            q = get_or_404(QuizQuestion, request.form.get("question_id", type=int))
            if q.lesson_id != lesson.id:
                abort(404)
            q.prompt = ml_from_form("prompt")
            q.explanation = ml_from_form("explanation")
            picked = {int(x) for x in request.form.getlist("correct") if x.isdigit()}
            opts, correct = [], []
            for i in range(12):
                item = {l: (request.form.get(f"opt_{i}_{l}") or "").strip() for l in LOCALES}
                if any(item.values()):
                    if i in picked:
                        correct.append(len(opts))
                    opts.append(item)
            if len(opts) < 2 or not correct or max(correct) >= len(opts):
                flash(t("studio.err_question"), "error")
            else:
                q.options, q.correct = opts, correct
                flash(t("studio.saved"), "success")
        elif action == "delete_question":
            q = get_or_404(QuizQuestion, request.form.get("question_id", type=int))
            if q.lesson_id == lesson.id:
                db.session.delete(q)
        elif action == "upload_material":
            fs = request.files.get("material")
            if fs and fs.filename:
                try:
                    storage.save_material(fs, lesson.id)
                except storage.UploadError:
                    flash(t("upload.err_ext", name=fs.filename), "error")
        elif action == "delete_material":
            m = get_or_404(LessonMaterial, request.form.get("material_id", type=int))
            if m.lesson_id == lesson.id:
                storage.delete_file(storage.material_path(m))
                db.session.delete(m)
        elif action == "delete" and LessonProgress.query.filter_by(lesson_id=lesson.id).first():
            flash(t("studio.err_lesson_in_use"), "error")
        elif action == "delete":
            audit("lesson.deleted", "lesson", lesson.id)
            db.session.delete(lesson)
            db.session.commit()
            return redirect(url_for("studio.level", level_id=lv.id))
        db.session.commit()
        anchor = f"#q{request.form.get('question_id')}" if action == "save_question" else ""
        return redirect(url_for("studio.lesson", lesson_id=lesson.id) + anchor)
    return render_template("studio/lesson.html", lesson=lesson, lv=lv, p=lv.program, lesson_kinds=LESSON_KINDS)


@bp.route("/lessons/<int:lesson_id>/preview")
@role_required("methodist", "trainer", "mentor")
def lesson_preview(lesson_id):
    lesson = get_or_404(Lesson, lesson_id)
    return render_template("studio/lesson_preview.html", lesson=lesson, lv=lesson.module.level)


@bp.route("/assignments/<int:assignment_id>", methods=["GET", "POST"])
@role_required("methodist")
def assignment(assignment_id):
    a = get_or_404(Assignment, assignment_id)
    lv = a.level
    if request.method == "POST":
        action = request.form.get("action")
        if action == "meta":
            a.title = ml_from_form("title")
            a.description = ml_from_form("description")
            if request.form.get("evidence_kind") in EVIDENCE_KINDS:
                a.evidence_kind = request.form["evidence_kind"]
            a.due_days = request.form.get("due_days", type=int)
            a.pass_min_level = max(1, min(4, request.form.get("pass_min_level", type=int) or 2))
            flash(t("studio.saved"), "success")
        elif action == "add_criterion":
            db.session.add(RubricCriterion(assignment_id=a.id, position=_next_pos(a.criteria),
                                           title={"ru": "Новый критерий", "kk": "Жаңа критерий",
                                                  "en": "New criterion"},
                                           descriptors=DEFAULT_DESCRIPTORS))
        elif action == "save_criterion":
            c = get_or_404(RubricCriterion, request.form.get("criterion_id", type=int))
            if c.assignment_id == a.id:
                c.title = ml_from_form("ctitle")
                desc = [{l: (request.form.get(f"d_{i}_{l}") or "").strip() for l in LOCALES} for i in range(4)]
                c.descriptors = desc
                flash(t("studio.saved"), "success")
        elif action == "move_criterion":
            c = get_or_404(RubricCriterion, request.form.get("criterion_id", type=int))
            _swap(a.criteria, c, -1 if request.form.get("dir") == "up" else 1)
        elif action == "delete_criterion":
            c = get_or_404(RubricCriterion, request.form.get("criterion_id", type=int))
            if c.assignment_id == a.id and len(a.criteria) > 1:
                db.session.delete(c)
        elif action == "delete" and Evidence.query.filter_by(assignment_id=a.id).first():
            flash(t("studio.err_assignment_in_use"), "error")
        elif action == "delete":
            db.session.delete(a)
            db.session.commit()
            return redirect(url_for("studio.level", level_id=lv.id))
        db.session.commit()
        return redirect(url_for("studio.assignment", assignment_id=a.id))
    return render_template("studio/assignment.html", a=a, lv=lv, p=lv.program, evidence_kinds=EVIDENCE_KINDS)


@bp.post("/preview-md")
@role_required("methodist")
def preview_md():
    return jsonify(html=str(render_markdown((request.get_json(silent=True) or {}).get("text", ""))))
