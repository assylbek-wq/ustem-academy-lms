"""Публичные страницы: главная, программы, заявка, запись по ссылке, проверка сертификата, портфолио."""
from __future__ import annotations

from datetime import date
from pathlib import Path

from flask import Blueprint, Response, abort, flash, g, redirect, render_template, request, session, url_for

from ..core import loc
from ..i18n import t
from ..models import Certificate, Cohort, Enrollment, Evidence, Lead, Program, User, db, local_today
from ..services.certificates import render_pdf
from ..services.mail import absolute

bp = Blueprint("public", __name__)


def _published():
    return Program.query.filter_by(status="published").order_by(Program.position, Program.id).all()


@bp.route("/")
def home():
    if g.user:
        # вошедшим пользователям каталог показываем в рабочем интерфейсе
        return redirect(url_for("learn.catalog" if request.args.get("public") else "learn.home"))
    programs = _published()
    upcoming = (Cohort.query.filter(Cohort.is_open.is_(True), Cohort.status != "finished", Cohort.self_paced.is_(False),
                                    Cohort.start_date >= local_today())
                .order_by(Cohort.start_date).limit(6).all())
    return render_template("public/home.html", programs=programs, upcoming=upcoming)


@bp.route("/programs/<slug>")
def program(slug):
    p = Program.query.filter_by(slug=slug).first_or_404()
    if p.status != "published" and not (g.user and g.user.has_role("methodist")):
        abort(404)
    cohorts = (Cohort.query.filter(Cohort.program_id == p.id, Cohort.is_open.is_(True),
                                   Cohort.status != "finished").order_by(Cohort.start_date).all())
    return render_template("public/program.html", program=p, cohorts=cohorts)


@bp.route("/request", methods=["POST"])
def lead():
    f = request.form
    org, contact = (f.get("org_name") or "").strip(), (f.get("contact_name") or "").strip()
    if not org or not contact or not ((f.get("email") or "").strip() or (f.get("phone") or "").strip()):
        flash(t("lead.err"), "error")
        return redirect(url_for("public.home") + "#request")
    try:
        count = int(f.get("teachers_count") or 0) or None
    except ValueError:
        count = None
    pid = f.get("program_id", type=int)
    db.session.add(Lead(org_name=org[:255], contact_name=contact[:255], email=(f.get("email") or "").strip()[:255],
                        phone=(f.get("phone") or "").strip()[:64], teachers_count=count,
                        program_id=pid if pid and db.session.get(Program, pid) else None,
                        message=(f.get("message") or "").strip()[:4000]))
    db.session.commit()
    flash(t("lead.thanks"), "success")
    return redirect(url_for("public.home") + "#request")


@bp.route("/join/<code>")
def join(code):
    cohort = Cohort.query.filter_by(invite_code=code).first_or_404()
    if not cohort.is_open or cohort.status == "finished":
        return render_template("public/join_closed.html", cohort=cohort), 410
    if not g.user:
        session["join_code"] = code
        return render_template("public/join.html", cohort=cohort)
    from .auth import join_cohort
    result = join_cohort(cohort, g.user)
    if result in ("full", "closed"):
        return render_template("public/join_closed.html", cohort=cohort, full=result == "full"), 409
    if result == "ok":
        flash(t("join.done", name=cohort.name), "success")
    return redirect(url_for("learn.cohort", cohort_id=cohort.id))


@bp.route("/verify", methods=["GET", "POST"])
def verify_form():
    code = (request.values.get("code") or "").strip().upper()
    if code:
        return redirect(url_for("public.verify", code=code))
    return render_template("public/verify.html", cert=None, code="")


@bp.route("/verify/<code>")
def verify(code):
    cert = Certificate.query.filter_by(code=code.upper()).first()
    return render_template("public/verify.html", cert=cert, code=code), (200 if cert else 404)


@bp.route("/verify/<code>.pdf")
def verify_pdf(code):
    cert = Certificate.query.filter_by(code=code.upper()).first_or_404()
    url = absolute(url_for("public.verify", code=cert.code))
    pdf = render_pdf(cert, url, locale=g.locale)
    return Response(pdf, mimetype="application/pdf",
                    headers={"Content-Disposition": f'inline; filename="USTEM-Academy-{cert.code}.pdf"'})


@bp.route("/badges/<code>.json")
def badge(code):
    """Упрощенное утверждение в духе Open Badges 3.0 для внешней проверки."""
    cert = Certificate.query.filter_by(code=code.upper()).first_or_404()
    url = absolute(url_for("public.verify", code=cert.code))
    return {
        "@context": ["https://www.w3.org/ns/credentials/v2",
                     "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json"],
        "type": ["VerifiableCredential", "OpenBadgeCredential"],
        "id": url,
        "issuer": {"type": ["Profile"], "id": absolute("/"), "name": "USTEM Academy"},
        "validFrom": cert.issued_at.isoformat() + "Z",
        "credentialSubject": {
            "type": ["AchievementSubject"], "name": cert.recipient_name,
            "achievement": {
                "type": ["Achievement"],
                "name": f'{loc(cert.program_title, "en") or loc(cert.program_title, "ru")} - '
                        f'{loc(cert.level_title, "en") or loc(cert.level_title, "ru")}',
                "criteria": {"narrative": "Completed online modules, attended the intensive and passed "
                                          "mentor-reviewed teaching evidence."},
            },
        },
        "credentialStatus": {"status": cert.status},
    }


@bp.route("/p/<token>")
def portfolio(token):
    user = User.query.filter_by(portfolio_token=token).first_or_404()
    if not user.portfolio_public and not (g.user and (g.user.id == user.id or g.user.is_admin)):
        abort(404)
    certs = Certificate.query.filter_by(user_id=user.id, status="valid").order_by(Certificate.issued_at.desc()).all()
    accepted = (Evidence.query.join(Enrollment).filter(Enrollment.user_id == user.id, Evidence.status == "accepted")
                .order_by(Evidence.submitted_at.desc()).all())
    return render_template("public/portfolio.html", owner=user, certs=certs, accepted=accepted, public=True)


@bp.route("/robots.txt")
def robots():
    return Response("User-agent: *\nDisallow: /my\nDisallow: /admin\nDisallow: /review\nDisallow: /files\n",
                    mimetype="text/plain")


@bp.route("/healthz")
def healthz():
    db.session.execute(db.text("select 1"))
    # REVISION пишет deploy/autodeploy.sh перед сборкой: по нему видно, какая версия выложена
    rev = Path(__file__).resolve().parents[2] / "REVISION"
    return {"ok": True, "version": rev.read_text().strip() if rev.exists() else ""}
