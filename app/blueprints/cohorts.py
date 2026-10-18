"""Кабинет мастер-тренера: свои когорты, прогресс слушателей, наставники, посещаемость."""
from __future__ import annotations

from flask import Blueprint, abort, flash, g, redirect, render_template, request, url_for

from ..core import audit, notify, role_required
from ..i18n import t
from ..models import Attendance, Cohort, Enrollment, Session, User, UserRole, db
from ..services import progress

bp = Blueprint("cohorts", __name__, url_prefix="/cohorts")


def my_cohort(cohort_id: int) -> Cohort:
    c = db.session.get(Cohort, cohort_id)
    if not c or not (g.user.is_admin or c.trainer_id == g.user.id):
        abort(404)
    return c


def mentors_list():
    return (User.query.join(UserRole).filter(UserRole.role.in_(("mentor", "trainer")), User.is_active.is_(True))
            .order_by(User.full_name).distinct().all())


@bp.route("")
@role_required("trainer")
def index():
    q = Cohort.query
    if not g.user.is_admin:
        q = q.filter(Cohort.trainer_id == g.user.id)
    cohorts = q.order_by(Cohort.start_date.desc()).all()
    return render_template("cohorts/index.html", cohorts=[(c, progress.cohort_summary(c)) for c in cohorts])


@bp.route("/<int:cohort_id>", methods=["GET", "POST"])
@role_required("trainer")
def detail(cohort_id):
    c = my_cohort(cohort_id)
    if request.method == "POST" and request.form.get("action") == "mentors":
        mentor_ids = {u.id for u in mentors_list()}
        for enr in c.enrollments:
            v = request.form.get(f"mentor_{enr.id}", type=int)
            new = v if v in mentor_ids else None
            if enr.mentor_id != new:
                enr.mentor_id = new
                if new:
                    notify(new, "mentor", t("notify.mentor_assigned", name=enr.user.full_name), url="/review",
                           email=False)
        audit("cohort.mentors_set", "cohort", c.id)
        db.session.commit()
        flash(t("cohort.mentors_saved"), "success")
        return redirect(url_for("cohorts.detail", cohort_id=c.id))
    summary = progress.cohort_summary(c)
    return render_template("cohorts/detail.html", c=c, summary=summary, mentors=mentors_list())


@bp.route("/<int:cohort_id>/learner/<int:enrollment_id>")
@role_required("trainer")
def learner(cohort_id, enrollment_id):
    c = my_cohort(cohort_id)
    enr = db.session.get(Enrollment, enrollment_id)
    if not enr or enr.cohort_id != c.id:
        abort(404)
    return render_template("cohorts/learner.html", c=c, enr=enr, st=progress.state(enr))


@bp.route("/<int:cohort_id>/attendance/<int:session_id>")
@role_required("trainer")
def attendance(cohort_id, session_id):
    c = my_cohort(cohort_id)
    s = db.session.get(Session, session_id)
    if not s or s.cohort_id != c.id:
        abort(404)
    marks = {a.enrollment_id: a.present for a in Attendance.query.filter_by(session_id=s.id)}
    learners = sorted([e for e in c.enrollments if e.status != "dropped"], key=lambda e: e.user.full_name.lower())
    return render_template("cohorts/attendance.html", c=c, s=s, learners=learners, marks=marks)
