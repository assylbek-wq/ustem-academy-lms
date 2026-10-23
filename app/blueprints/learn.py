"""Кабинет учителя-слушателя: программы, уроки, тесты, задания, сертификаты, портфолио."""
from __future__ import annotations

from datetime import timedelta

from flask import Blueprint, Response, abort, flash, g, redirect, render_template, request, send_file, url_for

from ..core import audit, login_required, notify
from ..i18n import t
from ..models import (Certificate, Cohort, Enrollment, Evidence, EvidenceFile, Lesson, LessonMaterial,
                      LessonProgress, Level, Program, Session, User, UserRole, db, local_now, utcnow)
from ..services import ai, progress, storage
from ..services.certificates import render_pdf
from ..services.mail import absolute

bp = Blueprint("learn", __name__)


def my_enrollment(cohort_id: int) -> Enrollment:
    enr = Enrollment.query.filter_by(cohort_id=cohort_id, user_id=g.user.id).first()
    if not enr or enr.status == "dropped":
        abort(404)
    return enr


def lesson_in_cohort(cohort: Cohort, lesson_id: int) -> Lesson:
    lesson = db.session.get(Lesson, lesson_id)
    if not lesson or lesson.module.level_id != cohort.level_id:
        abort(404)
    return lesson


def staff_home_links():
    u = g.user
    links = []
    if u.has_role("mentor", "trainer"):
        links.append(("review.queue", "nav.review"))
    if u.has_role("trainer"):
        links.append(("cohorts.index", "nav.cohorts"))
    if u.has_role("methodist"):
        links.append(("studio.index", "nav.studio"))
    if u.is_admin:
        links.append(("admin.index", "nav.admin"))
    if u.customer_ids or u.is_admin:
        links.append(("reports.index", "nav.reports"))
    return links


@bp.route("/my")
@login_required
def home():
    enrollments = (Enrollment.query.filter(Enrollment.user_id == g.user.id, Enrollment.status != "dropped")
                   .order_by(Enrollment.enrolled_at.desc()).all())
    items = [(e, progress.state(e)) for e in enrollments]
    cohort_ids = [e.cohort_id for e in enrollments if e.status == "active"]
    sessions = []
    if cohort_ids:
        sessions = (Session.query.filter(Session.cohort_id.in_(cohort_ids), Session.starts_at >= local_now() - timedelta(hours=6))
                    .order_by(Session.starts_at).limit(5).all())
    deadlines = sorted(
        [(e, a) for e, st in items if e.status == "active" for a in st.assignments
         if a.due and a.status in ("todo", "returned")], key=lambda x: x[1].due)[:5]
    certs = Certificate.query.filter_by(user_id=g.user.id, status="valid").count()
    return render_template("learn/home.html", items=items, sessions=sessions, deadlines=deadlines,
                           certs=certs, staff_links=staff_home_links())


@bp.route("/catalog")
@login_required
def catalog():
    """Каталог опубликованных программ с открытыми потоками для вошедшего пользователя."""
    programs = Program.query.filter_by(status="published").order_by(Program.position, Program.id).all()
    open_cohorts = (Cohort.query.filter(Cohort.is_open.is_(True), Cohort.status != "finished")
                    .join(Level, Cohort.level_id == Level.id).order_by(Level.number, Cohort.start_date).all())
    cohorts: dict[int, list] = {}
    for c in open_cohorts:
        cohorts.setdefault(c.program_id, []).append(c)
    mine = {e.cohort_id for e in Enrollment.query.filter(Enrollment.user_id == g.user.id,
                                                         Enrollment.status != "dropped")}
    return render_template("learn/catalog.html", programs=programs, cohorts=cohorts, mine=mine)


@bp.route("/my/cohort/<int:cohort_id>")
@login_required
def cohort(cohort_id):
    enr = my_enrollment(cohort_id)
    st = progress.state(enr)
    return render_template("learn/cohort.html", enr=enr, cohort=enr.cohort, st=st)


@bp.route("/my/cohort/<int:cohort_id>/lesson/<int:lesson_id>", methods=["GET", "POST"])
@login_required
def lesson(cohort_id, lesson_id):
    enr = my_enrollment(cohort_id)
    cohort = enr.cohort
    lesson = lesson_in_cohort(cohort, lesson_id)
    lp = LessonProgress.query.filter_by(enrollment_id=enr.id, lesson_id=lesson.id).first()
    result = None
    if request.method == "POST":
        if not lp:
            lp = LessonProgress(enrollment_id=enr.id, lesson_id=lesson.id, attempts=0)
            db.session.add(lp)
        if lesson.kind == "quiz":
            correct = 0
            answers = {}
            for q in lesson.questions:
                picked = sorted(int(x) for x in request.form.getlist(f"q{q.id}") if x.isdigit())
                answers[q.id] = picked
                if picked == sorted(q.correct or []):
                    correct += 1
            total = len(lesson.questions) or 1
            score = round(100 * correct / total)
            lp.attempts = (lp.attempts or 0) + 1
            lp.quiz_score = max(lp.quiz_score or 0, score)
            passed = score >= cohort.level.min_quiz_score
            if passed and not lp.completed_at:
                lp.completed_at = utcnow()
            result = {"score": score, "correct": correct, "total": total, "passed": passed, "answers": answers}
        else:
            if not lp.completed_at:
                lp.completed_at = utcnow()
        db.session.commit()
        cert = progress.maybe_complete(enr)
        db.session.commit()
        if cert:
            flash(t("learn.level_completed"), "success")
            return redirect(url_for("learn.certificates"))
        if lesson.kind != "quiz":
            nxt = progress.state(enr).next_lesson
            if nxt:
                return redirect(url_for("learn.lesson", cohort_id=cohort.id, lesson_id=nxt.id))
            return redirect(url_for("learn.cohort", cohort_id=cohort.id))
    st = progress.state(enr)
    lessons = cohort.level.lessons
    idx = next((i for i, l in enumerate(lessons) if l.id == lesson.id), 0)
    prev_l = lessons[idx - 1] if idx > 0 else None
    next_l = lessons[idx + 1] if idx + 1 < len(lessons) else None
    chat = ai.history(g.user.id, lesson.id) if ai.enabled() else []
    return render_template("learn/lesson.html", enr=enr, cohort=cohort, lesson=lesson, lp=lp, st=st,
                           result=result, prev_l=prev_l, next_l=next_l, ai_enabled=ai.enabled(), chat=chat)


@bp.route("/my/cohort/<int:cohort_id>/assignment/<int:assignment_id>", methods=["GET", "POST"])
@login_required
def assignment(cohort_id, assignment_id):
    enr = my_enrollment(cohort_id)
    cohort = enr.cohort
    a = next((x for x in cohort.level.assignments if x.id == assignment_id), None)
    if not a:
        abort(404)
    attempts = sorted([e for e in enr.evidence if e.assignment_id == a.id], key=lambda e: e.attempt)
    current = attempts[-1] if attempts else None
    can_submit = enr.status == "active" and (not current or current.status == "returned")
    if request.method == "POST":
        if not can_submit:
            abort(409)
        ids = [int(x) for x in request.form.getlist("file_id") if x.isdigit()]
        files = EvidenceFile.query.filter(EvidenceFile.id.in_(ids), EvidenceFile.owner_id == g.user.id,
                                          EvidenceFile.evidence_id.is_(None)).all() if ids else []
        for fs in request.files.getlist("files"):
            if fs and fs.filename:
                try:
                    files.append(storage.save_small_file(fs, g.user.id))
                except storage.UploadError:
                    flash(t("upload.err_ext", name=fs.filename), "error")
        text = (request.form.get("text") or "").strip()
        has_video = any(f.kind == "video" for f in files)
        if a.evidence_kind == "video" and not has_video:
            flash(t("assignment.need_video"), "error")
            return redirect(request.url)
        if a.evidence_kind == "files" and not files:
            flash(t("assignment.need_files"), "error")
            return redirect(request.url)
        if a.evidence_kind == "text" and not text:
            flash(t("assignment.need_text"), "error")
            return redirect(request.url)
        if has_video and not request.form.get("consent_children"):
            flash(t("assignment.need_consent"), "error")
            return redirect(request.url)
        ev = Evidence(enrollment_id=enr.id, assignment_id=a.id, attempt=(current.attempt + 1) if current else 1,
                      text=text, consent_children=bool(request.form.get("consent_children")))
        db.session.add(ev)
        db.session.flush()
        for f in files:
            f.evidence_id = ev.id
        audit("evidence.submitted", "evidence", ev.id, assignment=a.id)
        reviewer = enr.mentor_id or cohort.trainer_id
        # в открытых онлайн-потоках может не быть ни наставника, ни тренера: тогда сообщаем администраторам
        reviewers = [reviewer] if reviewer else [u.id for u in User.query.join(UserRole).filter(
            UserRole.role == "admin", User.is_active.is_(True)).all()]
        for rid in reviewers:
            r_user = db.session.get(User, rid)
            notify(rid, "review", t("notify.new_submission", name=g.user.full_name,
                                    locale=(r_user.locale if r_user else None) or "ru"),
                   url=url_for("review.detail", evidence_id=ev.id))
        db.session.commit()
        flash(t("assignment.submitted"), "success")
        return redirect(url_for("learn.assignment", cohort_id=cohort.id, assignment_id=a.id))
    return render_template("learn/assignment.html", enr=enr, cohort=cohort, a=a, attempts=attempts,
                           current=current, can_submit=can_submit, due=cohort.due_date(a))


@bp.route("/my/certificates")
@login_required
def certificates():
    certs = Certificate.query.filter_by(user_id=g.user.id).order_by(Certificate.issued_at.desc()).all()
    return render_template("learn/certificates.html", certs=certs)


@bp.route("/my/certificates/<code>.pdf")
@login_required
def certificate_pdf(code):
    cert = Certificate.query.filter_by(code=code, user_id=g.user.id).first_or_404()
    pdf = render_pdf(cert, absolute(url_for("public.verify", code=cert.code)), locale=g.locale)
    return Response(pdf, mimetype="application/pdf",
                    headers={"Content-Disposition": f'attachment; filename="USTEM-Academy-{cert.code}.pdf"'})


@bp.route("/my/portfolio")
@login_required
def portfolio():
    certs = Certificate.query.filter_by(user_id=g.user.id, status="valid").order_by(Certificate.issued_at.desc()).all()
    accepted = (Evidence.query.join(Enrollment).filter(Enrollment.user_id == g.user.id, Evidence.status == "accepted")
                .order_by(Evidence.submitted_at.desc()).all())
    return render_template("public/portfolio.html", owner=g.user, certs=certs, accepted=accepted, public=False)


# ─── Файлы с проверкой доступа ───────────────────────────────────────────
def can_view_evidence_file(f: EvidenceFile) -> bool:
    u = g.user
    if u.is_admin or f.owner_id == u.id:
        return True
    ev = f.evidence
    if not ev:
        return False
    enr = ev.enrollment
    return ((enr.mentor_id == u.id and u.has_role("mentor", "trainer"))
            or (enr.cohort.trainer_id == u.id and u.has_role("trainer")))


@bp.route("/files/<int:file_id>")
@login_required
def evidence_file(file_id):
    f = db.session.get(EvidenceFile, file_id)
    if not f or not can_view_evidence_file(f):
        abort(404)
    path = storage.evidence_path(f)
    if not path.exists():
        abort(404)
    inline = storage.inline_ok(f.original_name) and request.args.get("dl") != "1"
    resp = send_file(path, mimetype=storage.safe_mime(f.original_name), conditional=True,
                     download_name=f.original_name, as_attachment=not inline)
    resp.headers["Content-Security-Policy"] = "sandbox; default-src 'none'; media-src 'self'; img-src 'self'"
    return resp


def _can_open_level(level_id: int) -> bool:
    return bool(g.user.has_role("methodist", "trainer", "mentor") or Enrollment.query.join(Cohort).filter(
        Enrollment.user_id == g.user.id, Cohort.level_id == level_id, Enrollment.status != "dropped").first())


@bp.route("/lesson-video/<int:lesson_id>/<name>")
@login_required
def lesson_video(lesson_id, name):
    """Видео урока, загруженное файлом в Студии. Отдается с поддержкой Range (перемотка)."""
    lesson = db.session.get(Lesson, lesson_id)
    if not lesson or name not in storage.lesson_video_names(lesson) or not _can_open_level(lesson.module.level_id):
        abort(404)
    path, mime = storage.lesson_video_file(name)
    if not path.exists():
        abort(404)
    resp = send_file(path, mimetype=mime, conditional=True, max_age=3600)
    resp.headers["Content-Security-Policy"] = "sandbox; default-src 'none'; media-src 'self'"
    resp.headers["Cache-Control"] = "private, max-age=3600"
    return resp


@bp.route("/materials/<int:material_id>")
@login_required
def material(material_id):
    m = db.session.get(LessonMaterial, material_id)
    if not m:
        abort(404)
    level_id = m.lesson.module.level_id
    allowed = g.user.has_role("methodist", "trainer", "mentor") or Enrollment.query.join(Cohort).filter(
        Enrollment.user_id == g.user.id, Cohort.level_id == level_id, Enrollment.status != "dropped").first()
    if not allowed:
        abort(404)
    path = storage.material_path(m)
    if not path.exists():
        abort(404)
    resp = send_file(path, mimetype="application/octet-stream", conditional=True,
                     download_name=m.original_name, as_attachment=True)
    resp.headers["Content-Security-Policy"] = "sandbox"
    return resp
