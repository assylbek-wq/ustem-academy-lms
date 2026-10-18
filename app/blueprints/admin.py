"""Администратор Академии: когорты, занятия, слушатели, импорт, пользователи и роли, заказчики,
сертификаты, заявки, журнал действий."""
from __future__ import annotations

from datetime import datetime

from flask import Blueprint, Response, abort, flash, g, redirect, render_template, request, url_for
from sqlalchemy import func, or_

from ..core import audit, notify, role_required
from ..i18n import LOCALES, t
from ..models import (ROLES, AuditLog, Certificate, Cohort, Customer, Enrollment, Evidence, Lead, Level, Program,
                      Session, User, UserRole, db, utcnow)
from ..services import importer, progress
from ..services.certificates import issue_for_enrollment
from ..services.importer import EMAIL_RE
from ..services.mail import absolute, send_mail

bp = Blueprint("admin", __name__, url_prefix="/admin")

CUSTOMER_KINDS = ("akimat", "edu_dept", "school", "fund", "company", "other")
COHORT_STATUSES = ("planned", "active", "finished")


def get_or_404(model, id_):
    obj = db.session.get(model, id_)
    if not obj:
        abort(404)
    return obj


def users_with_role(role: str):
    return (User.query.join(UserRole).filter(UserRole.role == role, User.is_active.is_(True))
            .order_by(User.full_name).all())


def invite_link(user: User) -> str | None:
    return absolute(url_for("auth.invite", token=user.invite_token)) if user.invite_token else None


def send_invite(user: User, cohort: Cohort | None = None) -> None:
    if not user.invite_token:
        user.issue_invite()
    link = invite_link(user)
    body = t("invite.body", locale=user.locale, name=user.full_name,
             cohort=cohort.name if cohort else "USTEM Academy", link=link)
    send_mail(user.email, t("invite.subject", locale=user.locale), body)


@bp.route("")
@role_required("admin")
def index():
    stats = {
        "users": User.query.count(),
        "cohorts_active": Cohort.query.filter(Cohort.status == "active").count(),
        "enrollments": Enrollment.query.filter(Enrollment.status != "dropped").count(),
        "pending": Evidence.query.filter_by(status="submitted").count(),
        "certificates": Certificate.query.filter_by(status="valid").count(),
        "leads": Lead.query.filter_by(status="new").count(),
        "programs": Program.query.filter_by(status="published").count(),
    }
    cohorts = Cohort.query.filter(Cohort.status != "finished").order_by(Cohort.start_date).limit(8).all()
    log = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(12).all()
    return render_template("admin/index.html", stats=stats,
                           cohorts=[(c, progress.cohort_summary(c)) for c in cohorts], log=log)


# ─── Когорты ─────────────────────────────────────────────────────────────
@bp.route("/cohorts")
@role_required("admin")
def cohorts():
    status = request.args.get("status")
    q = Cohort.query
    if status in COHORT_STATUSES:
        q = q.filter_by(status=status)
    items = q.order_by(Cohort.start_date.desc()).all()
    return render_template("admin/cohorts.html", items=[(c, progress.cohort_summary(c)) for c in items],
                           status=status, statuses=COHORT_STATUSES)


def _parse_date(v):
    try:
        return datetime.strptime(v, "%Y-%m-%d").date() if v else None
    except ValueError:
        return None


def _fill_cohort(c: Cohort, f) -> list[str]:
    errors = []
    c.name = (f.get("name") or "").strip()[:255]
    level = db.session.get(Level, f.get("level_id", type=int) or 0)
    if not c.name:
        errors.append(t("admin.err_cohort_name"))
    if not level:
        errors.append(t("admin.err_cohort_level"))
    else:
        if c.level_id != level.id:
            c.program_version = level.program.version
        c.level_id, c.program_id = level.id, level.program_id
    cust = f.get("customer_id", type=int)
    c.customer_id = cust if cust and db.session.get(Customer, cust) else None
    tr = f.get("trainer_id", type=int)
    trainer = db.session.get(User, tr) if tr else None
    c.trainer_id = trainer.id if trainer and trainer.has_role("trainer") else None
    c.language = f.get("language") if f.get("language") in LOCALES else "ru"
    c.city = (f.get("city") or "").strip() or None
    c.start_date = _parse_date(f.get("start_date"))
    c.end_date = _parse_date(f.get("end_date"))
    c.capacity = f.get("capacity", type=int) or None
    c.status = f.get("status") if f.get("status") in COHORT_STATUSES else "planned"
    c.is_open = bool(f.get("is_open"))
    if not c.start_date:
        errors.append(t("admin.err_cohort_date"))
    return errors


def _cohort_form_ctx():
    levels = (Level.query.join(Program).filter(Program.status != "archived")
              .order_by(Program.position, Program.id, Level.number).all())
    return {"levels": levels, "customers": Customer.query.order_by(Customer.name).all(),
            "trainers": users_with_role("trainer"), "statuses": COHORT_STATUSES}


@bp.route("/cohorts/new", methods=["GET", "POST"])
@role_required("admin")
def cohort_new():
    c = Cohort()
    if request.method == "POST":
        errors = _fill_cohort(c, request.form)
        if not errors:
            db.session.add(c)
            db.session.flush()
            audit("cohort.created", "cohort", c.id)
            db.session.commit()
            flash(t("admin.cohort_created"), "success")
            return redirect(url_for("admin.cohort", cohort_id=c.id))
        for e in errors:
            flash(e, "error")
    return render_template("admin/cohort_form.html", c=c, **_cohort_form_ctx())


@bp.route("/cohorts/<int:cohort_id>", methods=["GET", "POST"])
@role_required("admin")
def cohort(cohort_id):
    c = get_or_404(Cohort, cohort_id)
    f = request.form
    if request.method == "POST":
        action = f.get("action")
        if action == "meta":
            errors = _fill_cohort(c, f)
            for e in errors:
                flash(e, "error")
            if not errors:
                audit("cohort.updated", "cohort", c.id)
                flash(t("studio.saved"), "success")
            else:
                db.session.rollback()
        elif action == "add_session":
            try:
                starts = datetime.strptime(f.get("starts_at", ""), "%Y-%m-%dT%H:%M")
                ends = datetime.strptime(f["ends_at"], "%Y-%m-%dT%H:%M") if f.get("ends_at") else None
            except ValueError:
                flash(t("admin.err_session_date"), "error")
            else:
                db.session.add(Session(cohort_id=c.id, title=(f.get("title") or "").strip() or t("session.default"),
                                       kind=f.get("kind") if f.get("kind") in ("intensive", "online") else "intensive",
                                       starts_at=starts, ends_at=ends, location=(f.get("location") or "").strip(),
                                       notes=(f.get("notes") or "").strip()))
        elif action == "delete_session":
            s = get_or_404(Session, f.get("session_id", type=int))
            if s.cohort_id == c.id:
                db.session.delete(s)
        elif action == "add_learner":
            email = (f.get("email") or "").strip().lower()
            name = (f.get("full_name") or "").strip()
            if not EMAIL_RE.match(email):
                flash(t("auth.err_email"), "error")
            else:
                u = User.query.filter_by(email=email).first()
                if not u:
                    if len(name) < 3:
                        flash(t("auth.err_name"), "error")
                        return redirect(url_for("admin.cohort", cohort_id=c.id) + "#roster")
                    u = User(email=email, full_name=name, locale=c.language or "ru")
                    u.issue_invite()
                    db.session.add(u)
                    db.session.flush()
                    send_invite(u, c)
                enr = Enrollment.query.filter_by(cohort_id=c.id, user_id=u.id).first()
                if enr:
                    enr.status = "active" if enr.status == "dropped" else enr.status
                else:
                    db.session.add(Enrollment(cohort_id=c.id, user_id=u.id))
                    notify(u.id, "enrolled", t("notify.enrolled", name=c.name, locale=u.locale),
                           url=url_for("learn.cohort", cohort_id=c.id), email=bool(u.password_hash))
                flash(t("admin.learner_added"), "success")
        elif action in ("drop", "restore"):
            enr = get_or_404(Enrollment, f.get("enrollment_id", type=int))
            if enr.cohort_id == c.id:
                enr.status = "dropped" if action == "drop" else "active"
                audit(f"enrollment.{action}", "enrollment", enr.id)
        elif action == "send_invites":
            n = 0
            for enr in c.enrollments:
                if not enr.user.password_hash and enr.status != "dropped":
                    send_invite(enr.user, c)
                    n += 1
            flash(t("admin.invites_sent", n=n), "success")
        db.session.commit()
        return redirect(url_for("admin.cohort", cohort_id=c.id) + (f"#{f.get('anchor')}" if f.get("anchor") else ""))
    summary = progress.cohort_summary(c)
    dropped = [e for e in c.enrollments if e.status == "dropped"]
    pending_invites = [e.user for e in c.enrollments if not e.user.password_hash and e.status != "dropped"]
    return render_template("admin/cohort.html", c=c, summary=summary, dropped=dropped,
                           pending_invites=pending_invites, invite_link=invite_link,
                           join_url=absolute(url_for("public.join", code=c.invite_code)), **_cohort_form_ctx())


@bp.route("/cohorts/<int:cohort_id>/import", methods=["GET", "POST"])
@role_required("admin")
def cohort_import(cohort_id):
    c = get_or_404(Cohort, cohort_id)
    report = None
    if request.method == "POST":
        fs = request.files.get("file")
        if not fs or not fs.filename:
            flash(t("import.err_file"), "error")
        else:
            try:
                rows = importer.read_rows(fs.filename, fs.read())
            except ValueError:
                flash(t("import.err_headers"), "error")
            except Exception:
                flash(t("import.err_file"), "error")
            else:
                report = importer.import_into_cohort(c, rows)
                if request.form.get("send"):
                    for u in report["created"]:
                        send_invite(u, c)
                audit("cohort.imported", "cohort", c.id, enrolled=report["enrolled"], created=len(report["created"]))
                db.session.commit()
    return render_template("admin/import.html", c=c, report=report, invite_link=invite_link)


@bp.route("/import-template.xlsx")
@role_required("admin")
def import_template():
    return Response(importer.template_xlsx(),
                    mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    headers={"Content-Disposition": 'attachment; filename="ustem-academy-learners.xlsx"'})


# ─── Пользователи и роли ─────────────────────────────────────────────────
@bp.route("/users")
@role_required("admin")
def users():
    q = User.query
    s = (request.args.get("q") or "").strip()
    role = request.args.get("role")
    if s:
        like = f"%{s.lower()}%"
        q = q.filter(or_(func.lower(User.full_name).like(like), func.lower(User.email).like(like),
                         func.lower(User.organization).like(like)))
    if role in ROLES:
        q = q.join(UserRole).filter(UserRole.role == role)
    items = q.order_by(User.created_at.desc()).limit(300).all()
    return render_template("admin/users.html", items=items, q=s, role=role, roles=ROLES)


@bp.route("/users/new", methods=["GET", "POST"])
@role_required("admin")
def user_new():
    if request.method == "POST":
        email = (request.form.get("email") or "").strip().lower()
        name = (request.form.get("full_name") or "").strip()
        if not EMAIL_RE.match(email) or len(name) < 3:
            flash(t("admin.err_user"), "error")
        elif User.query.filter_by(email=email).first():
            flash(t("auth.err_exists"), "error")
        else:
            u = User(email=email, full_name=name, organization=(request.form.get("organization") or "").strip() or None,
                     locale=request.form.get("locale") if request.form.get("locale") in LOCALES else "ru")
            u.issue_invite()
            db.session.add(u)
            db.session.flush()
            _apply_roles(u, request.form)
            send_invite(u)
            audit("user.created", "user", u.id)
            db.session.commit()
            flash(t("admin.user_created"), "success")
            return redirect(url_for("admin.user", user_id=u.id))
    return render_template("admin/user_form.html", u=None, roles=ROLES,
                           customers=Customer.query.order_by(Customer.name).all())


def _apply_roles(u: User, form) -> None:
    wanted = {r for r in form.getlist("roles") if r in ROLES and r != "customer"}
    if u.id == g.user.id:
        wanted.add("admin")  # нельзя снять админа с самого себя
    cust_ids = {int(x) for x in form.getlist("customer_ids") if x.isdigit()}
    for r in list(u.roles):
        if (r.role == "customer" and r.customer_id not in cust_ids) or (r.role != "customer" and r.role not in wanted):
            u.roles.remove(r)
    have = {(r.role, r.customer_id) for r in u.roles}
    for r in wanted:
        if (r, None) not in have:
            u.roles.append(UserRole(role=r))
    for cid in cust_ids:
        if ("customer", cid) not in have and db.session.get(Customer, cid):
            u.roles.append(UserRole(role="customer", customer_id=cid))


@bp.route("/users/<int:user_id>", methods=["GET", "POST"])
@role_required("admin")
def user(user_id):
    u = get_or_404(User, user_id)
    if request.method == "POST":
        action = request.form.get("action")
        if action == "save":
            name = (request.form.get("full_name") or "").strip()
            email = (request.form.get("email") or "").strip().lower()
            if len(name) >= 3:
                u.full_name = name
            if EMAIL_RE.match(email) and email != u.email:
                if User.query.filter_by(email=email).first():
                    flash(t("auth.err_exists"), "error")
                else:
                    u.email = email
            u.organization = (request.form.get("organization") or "").strip() or None
            u.city = (request.form.get("city") or "").strip() or None
            u.phone = (request.form.get("phone") or "").strip() or None
            _apply_roles(u, request.form)
            if u.id != g.user.id:
                u.is_active = bool(request.form.get("is_active"))
            audit("user.updated", "user", u.id, roles=sorted(u.role_names))
            flash(t("studio.saved"), "success")
        elif action == "invite":
            u.issue_invite()
            send_invite(u)
            flash(t("admin.invite_ready"), "success")
        db.session.commit()
        return redirect(url_for("admin.user", user_id=u.id))
    enrollments = Enrollment.query.filter_by(user_id=u.id).all()
    return render_template("admin/user_form.html", u=u, roles=ROLES, enrollments=enrollments,
                           customers=Customer.query.order_by(Customer.name).all(), invite_link=invite_link(u))


# ─── Заказчики ───────────────────────────────────────────────────────────
@bp.route("/customers", methods=["GET", "POST"])
@role_required("admin")
def customers():
    if request.method == "POST":
        cid = request.form.get("customer_id", type=int)
        c = db.session.get(Customer, cid) if cid else Customer()
        if c is None:
            abort(404)
        name = (request.form.get("name") or "").strip()
        if not name:
            flash(t("admin.err_customer"), "error")
        else:
            c.name = name[:255]
            c.kind = request.form.get("kind") if request.form.get("kind") in CUSTOMER_KINDS else "other"
            c.contact_name = (request.form.get("contact_name") or "").strip() or None
            c.contact_email = (request.form.get("contact_email") or "").strip() or None
            c.contact_phone = (request.form.get("contact_phone") or "").strip() or None
            db.session.add(c)
            db.session.commit()
            flash(t("studio.saved"), "success")
        return redirect(url_for("admin.customers"))
    items = Customer.query.order_by(Customer.name).all()
    return render_template("admin/customers.html", items=items, kinds=CUSTOMER_KINDS,
                           edit=db.session.get(Customer, request.args.get("edit", type=int) or 0))


# ─── Сертификаты ─────────────────────────────────────────────────────────
@bp.route("/certificates", methods=["GET", "POST"])
@role_required("admin")
def certificates():
    if request.method == "POST":
        action = request.form.get("action")
        if action in ("revoke", "restore"):
            cert = get_or_404(Certificate, request.form.get("certificate_id", type=int))
            cert.status = "revoked" if action == "revoke" else "valid"
            audit(f"certificate.{action}", "certificate", cert.id)
        elif action == "issue":
            enr = get_or_404(Enrollment, request.form.get("enrollment_id", type=int))
            cert = issue_for_enrollment(enr, issued_by=g.user.id)
            if enr.status == "active":
                enr.status, enr.completed_at = "completed", utcnow()
            audit("certificate.issued_manually", "certificate", cert.id)
            notify(enr.user_id, "certificate", t("notify.certificate", locale=enr.user.locale), url="/my/certificates")
            flash(t("admin.cert_issued", code=cert.code), "success")
        db.session.commit()
        return redirect(request.referrer or url_for("admin.certificates"))
    s = (request.args.get("q") or "").strip()
    q = Certificate.query
    if s:
        like = f"%{s.lower()}%"
        q = q.filter(or_(func.lower(Certificate.recipient_name).like(like), func.lower(Certificate.code).like(like)))
    items = q.order_by(Certificate.issued_at.desc()).limit(300).all()
    return render_template("admin/certificates.html", items=items, q=s)


# ─── Заявки и журнал ─────────────────────────────────────────────────────
@bp.route("/leads", methods=["GET", "POST"])
@role_required("admin")
def leads():
    if request.method == "POST":
        lead = get_or_404(Lead, request.form.get("lead_id", type=int))
        if request.form.get("status") in ("new", "in_progress", "done"):
            lead.status = request.form["status"]
            db.session.commit()
        return redirect(url_for("admin.leads"))
    items = Lead.query.order_by(Lead.created_at.desc()).limit(300).all()
    return render_template("admin/leads.html", items=items)


@bp.route("/audit")
@role_required("admin")
def audit_log():
    items = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(300).all()
    return render_template("admin/audit.html", items=items)
