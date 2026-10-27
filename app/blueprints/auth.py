"""Вход, регистрация, приглашения, восстановление пароля, профиль."""
from __future__ import annotations

import re
import time
from collections import defaultdict, deque

from flask import Blueprint, abort, current_app, flash, g, redirect, render_template, request, session, url_for
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from ..core import audit, login_required, safe_next
from ..i18n import LOCALES, t
from ..models import Cohort, Enrollment, User, db, utcnow
from ..services.mail import absolute, mail_enabled, send_mail
from ..services.importer import EMAIL_RE
from ..game.tracks import REGIONS
from ..services import connect

bp = Blueprint("auth", __name__)

PHONE_DIGITS = re.compile(r"\D")


def normalize_phone(raw: str) -> str | None:
    """Телефон в виде +7XXXXXXXXXX (Казахстан, Россия) или +<код страны><номер> для других стран; None - не похоже на номер."""
    raw = (raw or "").strip()
    d = PHONE_DIGITS.sub("", raw)
    if len(d) == 11 and d[0] == "8":
        d = "7" + d[1:]
    if len(d) == 10 and d[0] == "7" and not raw.startswith("+"):
        d = "7" + d          # 7XXXXXXXXX без кода страны: номер Казахстана
    if d.startswith("7"):
        return "+" + d if len(d) == 11 else None
    return "+" + d if 10 <= len(d) <= 15 and raw.startswith("+") else None


def _verify_serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"], salt="email-verify")


def send_verification(user: User) -> None:
    token = _verify_serializer().dumps({"uid": user.id, "email": user.email})
    link = absolute(url_for("auth.verify", token=token))
    send_mail(user.email, t("auth.verify_subject", locale=user.locale),
              t("auth.verify_body", locale=user.locale, name=user.full_name, link=link))


def needs_verification(user: User | None) -> bool:
    """Без SMTP проверка почты выключена: иначе никто не смог бы войти."""
    return bool(user) and not user.email_verified_at and mail_enabled()

_attempts: dict[str, deque] = defaultdict(deque)


def _rate_limited(key: str, limit: int = 8, window: int = 300) -> bool:
    now = time.time()
    q = _attempts[key]
    while q and now - q[0] > window:
        q.popleft()
    if len(q) >= limit:
        return True
    q.append(now)
    return False


def login_user(user: User) -> None:
    session.clear()
    session.permanent = True
    session["uid"] = user.id
    session["pwfp"] = (user.password_hash or "")[-12:]
    session["locale"] = user.locale or "ru"
    user.last_login_at = utcnow()
    db.session.commit()


def join_cohort(cohort: Cohort, user: User) -> str:
    """Самозапись по ссылке. Возвращает 'ok' | 'already' | 'closed' | 'full'."""
    if not cohort.is_open or cohort.status == "finished":
        return "closed"
    enr = Enrollment.query.filter_by(cohort_id=cohort.id, user_id=user.id).first()
    if enr and enr.status != "dropped":
        return "already"
    if enr:
        return "closed"  # отчисленного возвращает только администратор
    active = Enrollment.query.filter_by(cohort_id=cohort.id).filter(Enrollment.status != "dropped").count()
    if cohort.capacity and active >= cohort.capacity:
        return "full"
    db.session.add(Enrollment(cohort_id=cohort.id, user_id=user.id))
    db.session.commit()
    return "ok"


def _join_pending_cohort(user: User) -> Cohort | None:
    code = session.pop("join_code", None)
    if not code:
        return None
    cohort = Cohort.query.filter_by(invite_code=code).first()
    if not cohort:
        return None
    result = join_cohort(cohort, user)
    if result == "ok":
        flash(t("join.done", name=cohort.name), "success")
    elif result in ("closed", "full"):
        flash(t("join.full") if result == "full" else t("join.closed"), "error")
        return None
    return cohort


@bp.route("/login", methods=["GET", "POST"])
def login():
    if g.user:
        return redirect(url_for("learn.home"))
    if request.method == "POST":
        email = (request.form.get("email") or "").strip().lower()
        if _rate_limited(f"{request.remote_addr}:{email}"):
            flash(t("auth.too_many"), "error")
            return render_template("auth/login.html", email=email), 429
        user = User.query.filter_by(email=email).first()
        if user and user.is_active and user.check_password(request.form.get("password") or ""):
            join_code = session.get("join_code")
            login_user(user)
            if join_code:
                session["join_code"] = join_code
                _join_pending_cohort(user)
            return redirect(safe_next(request.args.get("next"), url_for("learn.home")))
        flash(t("auth.bad_credentials"), "error")
        return render_template("auth/login.html", email=email), 401
    return render_template("auth/login.html", email="")


@bp.route("/register", methods=["GET", "POST"])
def register():
    nxt = safe_next(request.args.get("next"), "")
    if g.user:
        return redirect(nxt or url_for("learn.home"))
    form = request.form
    if request.method == "POST":
        email = (form.get("email") or "").strip().lower()
        name = (form.get("full_name") or "").strip()
        pw = form.get("password") or ""
        phone = normalize_phone(form.get("phone"))
        errors = []
        if not EMAIL_RE.match(email):
            errors.append(t("auth.err_email"))
        if len(name) < 3:
            errors.append(t("auth.err_name"))
        if not phone:
            errors.append(t("auth.err_phone"))
        if len(pw) < 8:
            errors.append(t("auth.err_password"))
        if not form.get("consent"):
            errors.append(t("auth.err_consent"))
        existing = User.query.filter_by(email=email).first()
        if existing:
            # Никогда не "присваиваем" существующую запись: отправляем владельцу ссылку на вход.
            if existing.is_active and not errors:
                token = existing.issue_invite(days=2)
                db.session.commit()
                link = absolute(url_for("auth.invite", token=token))
                send_mail(existing.email, t("auth.reset_subject", locale=existing.locale),
                          t("auth.reset_body", locale=existing.locale, link=link))
            errors.append(t("auth.err_exists"))
        if errors:
            for e in errors:
                flash(e, "error")
            return render_template("auth/register.html", form=form), 400
        user = User(email=email)
        user.full_name = name
        user.phone = phone
        user.organization = (form.get("organization") or "").strip() or None
        user.city = (form.get("city") or "").strip() or None
        user.locale = g.locale
        user.consent_at = utcnow()
        user.set_password(pw)
        user.invite_token = None
        db.session.add(user)
        db.session.commit()
        if mail_enabled():  # у модели по умолчанию «подтверждена» (аккаунты от администратора), здесь - нет
            user.email_verified_at = None
            db.session.commit()
        join_code = session.get("join_code")
        login_user(user)
        if needs_verification(user):
            send_verification(user)
            if join_code:
                session["join_code"] = join_code  # запишем в группу после подтверждения почты
            if nxt.startswith("/live/"):
                return redirect(nxt)  # прямой эфир смотрят сразу, курсы откроются после подтверждения почты
            return redirect(url_for("auth.verify_needed"))
        if join_code:
            session["join_code"] = join_code
            cohort = _join_pending_cohort(user)
            if cohort:
                return redirect(url_for("learn.cohort", cohort_id=cohort.id))
        return redirect(nxt or url_for("learn.home"))
    return render_template("auth/register.html", form={})


@bp.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("public.home"))


@bp.route("/invite/<token>", methods=["GET", "POST"])
def invite(token):
    """Приглашение после импорта или сброс пароля: пользователь задает пароль сам."""
    user = User.query.filter_by(invite_token=token).first()
    if not user or not user.is_active or (user.invite_expires_at and user.invite_expires_at < utcnow()):
        return render_template("auth/invite_invalid.html"), 404
    if request.method == "POST":
        pw = request.form.get("password") or ""
        if len(pw) < 8:
            flash(t("auth.err_password"), "error")
        elif not request.form.get("consent") and not user.consent_at:
            flash(t("auth.err_consent"), "error")
        else:
            user.set_password(pw)
            user.invite_token = None
            user.invite_expires_at = None
            user.consent_at = user.consent_at or utcnow()
            user.email_verified_at = user.email_verified_at or utcnow()  # ссылка пришла на эту почту
            audit("user.invite_accepted", "user", user.id)
            db.session.commit()
            login_user(user)
            flash(t("auth.password_set"), "success")
            return redirect(url_for("learn.home"))
    return render_template("auth/invite.html", invited=user)


@bp.route("/confirm-email")
def verify_needed():
    """Страница «Подтвердите почту»: ссылка отправлена, можно отправить еще раз."""
    if not g.user:
        return redirect(url_for("auth.login"))
    if not needs_verification(g.user):
        return redirect(url_for("learn.home"))
    return render_template("auth/verify.html")


@bp.route("/confirm-email/resend", methods=["POST"])
def verify_resend():
    if not g.user:
        return redirect(url_for("auth.login"))
    if needs_verification(g.user):
        if _rate_limited(f"verify:{g.user.id}", limit=3, window=900):
            flash(t("auth.too_many_verify"), "error")
        else:
            send_verification(g.user)
            flash(t("auth.verify_resent", email=g.user.email), "success")
    return redirect(url_for("auth.verify_needed"))


@bp.route("/confirm-email/<token>")
def verify(token):
    try:
        data = _verify_serializer().loads(token, max_age=7 * 24 * 3600)
    except SignatureExpired:
        flash(t("auth.verify_expired"), "error")
        return redirect(url_for("auth.verify_needed") if g.user else url_for("auth.login"))
    except BadSignature:
        abort(404)
    user = db.session.get(User, data.get("uid"))
    if not user or not user.is_active or user.email != data.get("email"):
        abort(404)
    if not user.email_verified_at:
        user.email_verified_at = utcnow()
        audit("user.email_verified", "user", user.id)
        db.session.commit()
    join_code = session.get("join_code")
    if not g.user or g.user.id != user.id:
        login_user(user)
    if join_code:
        session["join_code"] = join_code
        cohort = _join_pending_cohort(user)
        flash(t("auth.verified"), "success")
        if cohort:
            return redirect(url_for("learn.cohort", cohort_id=cohort.id))
        return redirect(url_for("learn.home"))
    flash(t("auth.verified"), "success")
    return redirect(url_for("learn.home"))


@bp.route("/forgot", methods=["GET", "POST"])
def forgot():
    sent = False
    if request.method == "POST":
        email = (request.form.get("email") or "").strip().lower()
        # лимит на почту и общий лимит на адрес: учителя одной школы или зала часто выходят в сеть с одного IP
        if not _rate_limited(f"forgot:{email}", limit=5, window=900) and not _rate_limited(f"forgot-ip:{request.remote_addr}", limit=60, window=900):
            user = User.query.filter_by(email=email, is_active=True).first()
            if user:
                token = user.issue_invite(days=2)
                db.session.commit()
                link = absolute(url_for("auth.invite", token=token))
                send_mail(user.email, t("auth.reset_subject", locale=user.locale),
                          t("auth.reset_body", locale=user.locale, link=link))
        sent = True  # не раскрываем, есть ли такой email
    return render_template("auth/forgot.html", sent=sent)


@bp.route("/account", methods=["GET", "POST"])
@login_required
def account():
    u = g.user
    if request.method == "POST":
        action = request.form.get("action")
        if action == "profile":
            name = (request.form.get("full_name") or "").strip()
            if len(name) >= 3:
                u.full_name = name
            phone = normalize_phone(request.form.get("phone"))
            if phone:
                u.phone = phone
            elif (request.form.get("phone") or "").strip() or u.phone:
                flash(t("auth.err_phone"), "error")
            u.organization = (request.form.get("organization") or "").strip() or None
            u.city = (request.form.get("city") or "").strip() or None
            lang = request.form.get("locale")
            if lang in LOCALES:
                u.locale = lang
                session["locale"] = lang
            u.portfolio_public = bool(request.form.get("portfolio_public"))
            region = (request.form.get("region") or "").strip()
            u.region = region if region in REGIONS else None
            u.leaderboard_hidden = bool(request.form.get("leaderboard_hidden"))
            db.session.commit()
            flash(t("account.saved"), "success")
        elif action == "password":
            if not u.check_password(request.form.get("current") or ""):
                flash(t("account.bad_current"), "error")
            elif len(request.form.get("new") or "") < 8:
                flash(t("auth.err_password"), "error")
            else:
                u.set_password(request.form["new"])
                db.session.commit()
                session["pwfp"] = u.password_hash[-12:]
                flash(t("account.password_changed"), "success")
        return redirect(url_for("auth.account"))
    return render_template("auth/account.html", regions=REGIONS, connect_on=connect.enabled())


@bp.route("/notifications")
@login_required
def notifications():
    from ..models import Notification
    items = (Notification.query.filter_by(user_id=g.user.id)
             .order_by(Notification.created_at.desc()).limit(100).all())
    unread_ids = {n.id for n in items if not n.read_at}
    for n in items:
        if not n.read_at:
            n.read_at = utcnow()
    db.session.commit()
    return render_template("auth/notifications.html", items=items, unread_ids=unread_ids)
