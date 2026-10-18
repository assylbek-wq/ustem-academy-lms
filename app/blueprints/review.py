"""Проверка заданий наставником: очередь и экран проверки с рубрикой и комментариями по таймкодам."""
from __future__ import annotations

from flask import Blueprint, abort, flash, g, redirect, render_template, request, url_for
from sqlalchemy import or_

from ..core import audit, notify, role_required
from ..i18n import t
from ..models import Cohort, Enrollment, Evidence, Review, db
from ..services import progress

bp = Blueprint("review", __name__, url_prefix="/review")


def reviewable_query():
    q = Evidence.query.join(Enrollment, Evidence.enrollment_id == Enrollment.id).join(Cohort)
    if not g.user.is_admin:
        q = q.filter(or_(Enrollment.mentor_id == g.user.id,
                         (Cohort.trainer_id == g.user.id)))
    return q


def can_review(ev: Evidence) -> bool:
    enr = ev.enrollment
    u = g.user
    return (u.is_admin or (enr.mentor_id == u.id and u.has_role("mentor", "trainer"))
            or (enr.cohort.trainer_id == u.id and u.has_role("trainer")))


@bp.route("")
@role_required("mentor", "trainer")
def queue():
    status = request.args.get("status", "submitted")
    cohort_id = request.args.get("cohort", type=int)
    q = reviewable_query()
    if status in ("submitted", "returned", "accepted"):
        q = q.filter(Evidence.status == status)
    if cohort_id:
        q = q.filter(Enrollment.cohort_id == cohort_id)
    items = q.order_by(Evidence.submitted_at.asc() if status == "submitted" else Evidence.submitted_at.desc()).limit(300).all()
    cohort_ids = {r[0] for r in reviewable_query().with_entities(Enrollment.cohort_id).distinct().all()}
    cohorts = Cohort.query.filter(Cohort.id.in_(cohort_ids)).order_by(Cohort.start_date.desc()).all() if cohort_ids else []
    counts = {s: reviewable_query().filter(Evidence.status == s).count() for s in ("submitted", "returned", "accepted")}
    return render_template("review/queue.html", items=items, status=status, cohorts=cohorts,
                           cohort_id=cohort_id, counts=counts)


@bp.route("/<int:evidence_id>", methods=["GET", "POST"])
@role_required("mentor", "trainer")
def detail(evidence_id):
    ev = db.session.get(Evidence, evidence_id)
    if not ev or not can_review(ev):
        abort(404)
    a = ev.assignment
    enr = ev.enrollment
    if request.method == "POST":
        if ev.status != "submitted":
            flash(t("review.already"), "error")
            return redirect(request.url)
        decision = request.form.get("decision")
        if decision not in ("accepted", "returned"):
            abort(400)
        scores = {}
        for c in a.criteria:
            v = request.form.get(f"c{c.id}", type=int)
            if v is None or not 1 <= v <= 4:
                flash(t("review.need_scores"), "error")
                return redirect(request.url)
            scores[str(c.id)] = v
        summary = (request.form.get("summary") or "").strip()
        if decision == "accepted" and scores and min(scores.values()) < a.pass_min_level:
            flash(t("review.below_min", n=a.pass_min_level), "error")
            return redirect(request.url)
        if decision == "returned" and not summary:
            flash(t("review.need_summary"), "error")
            return redirect(request.url)
        db.session.add(Review(evidence_id=ev.id, reviewer_id=g.user.id, decision=decision,
                              scores=scores, summary=summary))
        ev.status = decision
        audit(f"evidence.{decision}", "evidence", ev.id)
        key = "notify.accepted" if decision == "accepted" else "notify.returned"
        notify(enr.user_id, "review", t(key, title=_title(a, enr.user.locale), locale=enr.user.locale),
               url=url_for("learn.assignment", cohort_id=enr.cohort_id, assignment_id=a.id))
        db.session.flush()
        if decision == "accepted":
            progress.maybe_complete(enr, issued_by=g.user.id)
        db.session.commit()
        flash(t("review.saved"), "success")
        nxt = reviewable_query().filter(Evidence.status == "submitted").order_by(Evidence.submitted_at).first()
        return redirect(url_for("review.detail", evidence_id=nxt.id) if nxt else url_for("review.queue"))
    attempts = sorted([e for e in enr.evidence if e.assignment_id == a.id], key=lambda e: e.attempt)
    return render_template("review/detail.html", ev=ev, a=a, enr=enr, attempts=attempts)


def _title(a, locale):
    from ..core import loc
    return loc(a.title, locale)
