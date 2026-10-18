"""Отчеты заказчика: прогресс когорт, посещаемость, сертификаты, выгрузка в Excel."""
from __future__ import annotations

from flask import Blueprint, Response, abort, g, render_template

from ..core import login_required, loc
from ..i18n import t
from ..models import Certificate, Cohort, db
from ..services import importer, progress

bp = Blueprint("reports", __name__, url_prefix="/reports")


def visible_cohorts():
    q = Cohort.query
    if not g.user.is_admin:
        ids = g.user.customer_ids
        if not ids:
            abort(403)
        q = q.filter(Cohort.customer_id.in_(ids))
    return q.order_by(Cohort.start_date.desc())


def get_cohort(cohort_id: int) -> Cohort:
    c = db.session.get(Cohort, cohort_id)
    if not c or not (g.user.is_admin or c.customer_id in g.user.customer_ids):
        abort(404)
    return c


@bp.route("")
@login_required
def index():
    cohorts = visible_cohorts().all()
    rows = [(c, progress.cohort_summary(c)) for c in cohorts]
    totals = {
        "learners": sum(s["count"] for _, s in rows),
        "completed": sum(s["completed"] for _, s in rows),
        "cohorts": len(rows),
    }
    return render_template("reports/index.html", rows=rows, totals=totals)


@bp.route("/cohort/<int:cohort_id>")
@login_required
def cohort(cohort_id):
    c = get_cohort(cohort_id)
    certs = (Certificate.query.join(Certificate.enrollment).filter_by(cohort_id=c.id)
             .filter(Certificate.status == "valid").count())
    return render_template("reports/cohort.html", c=c, summary=progress.cohort_summary(c), certs=certs)


@bp.route("/cohort/<int:cohort_id>.xlsx")
@login_required
def cohort_xlsx(cohort_id):
    c = get_cohort(cohort_id)
    summary = progress.cohort_summary(c)
    labels = {
        "sheet": t("report.sheet"), "program": t("report.program"),
        "program_value": f"{loc(c.program.title)} - {loc(c.level.title)}",
        "dates": t("report.dates"),
        "dates_value": f"{c.start_date:%d.%m.%Y}" + (f" - {c.end_date:%d.%m.%Y}" if c.end_date else ""),
        "learners": t("report.learners"), "completed": t("report.completed"), "avg": t("report.avg"),
        "with_email": g.user.is_admin,
        "columns": [t("col.name"), *(["Email"] if g.user.is_admin else []), t("col.org"), t("col.city"), t("col.lessons"), t("col.assignments"),
                    t("col.attendance"), t("col.progress"), t("col.status")],
        "status": {"active": t("enr.active"), "completed": t("enr.completed"), "dropped": t("enr.dropped")},
    }
    data = importer.cohort_report_xlsx(c, summary, labels)
    return Response(data, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    headers={"Content-Disposition": f'attachment; filename="report-cohort-{c.id}.xlsx"'})
