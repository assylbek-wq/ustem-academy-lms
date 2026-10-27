"""Прямой эфир: видео с YouTube + анкета, викторина «как Kahoot», вопросы спикеру и счетчики в Академии.

Страницы:
- /live/<slug>            учитель (видео + панель); без входа - приглашение зарегистрироваться
- /live/<slug>/screen     экран для OBS (Browser Source, 1920x1080), доступ по ключу ?key=...
- /live/<slug>/overlay    маленький счетчик и QR в углу поверх камеры спикера (прозрачный фон)
- /live/<slug>/control    пульт оператора (методист, тренер, админ)
"""
from __future__ import annotations

import io
import re
import secrets
from datetime import datetime

import segno
from flask import Blueprint, abort, g, jsonify, redirect, render_template, request, send_file, url_for
from markupsafe import Markup

from ..core import audit, role_required
from ..i18n import t
from ..models import LiveAnswer, LiveAsk, LiveEvent, LiveQuestion, LiveViewer, User, db, utcnow
from ..services import live as svc
from ..services.mail import absolute

bp = Blueprint("live", __name__, url_prefix="/live")

YT_RE = re.compile(r"(?:v=|youtu\.be/|/live/|/embed/|/shorts/)([A-Za-z0-9_-]{11})")


def _event(slug: str) -> LiveEvent:
    ev = LiveEvent.query.filter_by(slug=slug).first()
    if not ev:
        abort(404)
    return ev


def _screen_ok(ev: LiveEvent) -> bool:
    key = request.args.get("key") or ""
    if key and secrets.compare_digest(key, ev.screen_key):
        return True
    return bool(g.user and g.user.has_role("methodist", "trainer"))


def qr_svg(url: str, dark: str = "#0b0b12", light: str = "#ffffff") -> Markup:
    return Markup(segno.make(url, error="m").svg_inline(scale=10, border=2, dark=dark, light=light, omitsize=True))


def _links(ev: LiveEvent) -> dict:
    links = dict(ev.links or {})
    links["academy"] = absolute(url_for("live.watch", slug=ev.slug, lang="kk"))
    return links


def _pretty(url: str) -> str:
    return re.sub(r"^https?://", "", url).split("?")[0].rstrip("/")


# ─── Учитель ─────────────────────────────────────────────────────────────
@bp.route("/<slug>")
def watch(slug):
    ev = _event(slug)
    if not g.user:
        nxt = url_for("live.watch", slug=slug)
        return render_template("live/gate.html", ev=ev, nxt=nxt)
    v = svc.viewer_for(ev, g.user)
    return render_template("live/watch.html", ev=ev, v=v, regions=svc.KZ_REGIONS, subjects=svc.SUBJECTS,
                           positions=svc.POSITIONS, robotics=svc.ROBOTICS, links=_links(ev))


@bp.route("/<slug>/state")
def state(slug):
    st = svc.public_state(slug)
    if st is None:
        abort(404)
    out = dict(st)
    out["yt"] = _yt_id(slug)
    if g.user:
        ev_id = _event_id(slug)
        v = LiveViewer.query.filter_by(event_id=ev_id, user_id=g.user.id).first()
        if v:
            svc.heartbeat(v)
        me = {"score": v.score if v else 0, "profile": bool(v and v.profile_at)}
        q = st.get("q")
        if q:
            a = LiveAnswer.query.filter_by(question_id=q["id"], user_id=g.user.id).first()
            if a:
                me["answer"] = {"choice": a.choice}
                if st["mode"] == "reveal":
                    me["answer"].update({"correct": a.is_correct, "points": a.points})
        if st["mode"] in ("leaderboard", "finish") and v:
            ev = db.session.get(LiveEvent, ev_id)
            me["rank"], me["total"] = svc.rank_of(ev, g.user)
        out["me"] = me
        if st["mode"] in ("leaderboard", "finish"):
            s = svc.stats(slug) or {}
            out["top"] = s.get("top", [])[:5]
    resp = jsonify(out)
    resp.headers["Cache-Control"] = "no-store"
    return resp


_ids: dict[str, tuple[int, str | None]] = {}


def _event_id(slug: str) -> int:
    if slug not in _ids:
        ev = _event(slug)
        _ids[slug] = (ev.id, ev.youtube_id)
    return _ids[slug][0]


def _yt_id(slug: str) -> str | None:
    import time
    key = "yt:" + slug
    hit = svc._cache.get(key)
    if hit and time.monotonic() - hit[0] < 5:
        return hit[1]
    ev = LiveEvent.query.filter_by(slug=slug).first()
    val = ev.youtube_id if ev else None
    svc._cache[key] = (time.monotonic(), val)
    return val


def _need_user():
    if not g.user:
        abort(401)


@bp.route("/<slug>/profile", methods=["POST"])
def profile(slug):
    _need_user()
    ev = _event(slug)
    f = request.get_json(silent=True) or request.form
    region = (f.get("region") or "").strip()
    school = (f.get("school") or "").strip()[:255]
    subjects = [s for s in (f.get("subjects") or []) if s in svc.SUBJECTS] if isinstance(f.get("subjects"), list) \
        else [s for s in request.form.getlist("subjects") if s in svc.SUBJECTS]
    if region not in svc.REGION_KEYS or len(school) < 2 or not subjects:
        return jsonify({"ok": False, "error": t("live.err_profile")}), 400
    v = svc.viewer_for(ev, g.user)
    v.region, v.school, v.subjects = region, school, subjects
    v.city = (f.get("city") or "").strip()[:128] or v.city
    pos = f.get("position")
    v.position = pos if pos in svc.POSITIONS else None
    rb = f.get("robotics")
    v.robotics = rb if rb in svc.ROBOTICS else None
    v.profile_at = v.profile_at or utcnow()
    # заполняем профиль Академии, если он пуст: школа и город пригодятся в курсах и отчетах
    if not g.user.organization:
        g.user.organization = school
    if not g.user.city and v.city:
        g.user.city = v.city
    if not g.user.region:
        g.user.region = svc.region_name(region, "ru")
    db.session.commit()
    return jsonify({"ok": True})


@bp.route("/<slug>/answer", methods=["POST"])
def answer(slug):
    _need_user()
    ev = _event(slug)
    f = request.get_json(silent=True) or {}
    q = db.session.get(LiveQuestion, int(f.get("qid") or 0))
    if not q or q.event_id != ev.id:
        abort(404)
    try:
        choice = int(f.get("choice"))
        ms = int(f["ms"]) if f.get("ms") is not None else None
    except (TypeError, ValueError):
        abort(400)
    return jsonify(svc.answer(ev, q, g.user, choice, ms))


@bp.route("/<slug>/ask", methods=["POST"])
def ask(slug):
    _need_user()
    ev = _event(slug)
    f = request.get_json(silent=True) or request.form
    text = (f.get("text") or "").strip()
    if len(text) < 3:
        return jsonify({"ok": False}), 400
    recent = LiveAsk.query.filter_by(event_id=ev.id, user_id=g.user.id).count()
    if recent >= 10:
        return jsonify({"ok": False, "error": t("live.ask_limit")}), 429
    db.session.add(LiveAsk(event_id=ev.id, user_id=g.user.id, text=text[:600]))
    db.session.commit()
    return jsonify({"ok": True})


# ─── Экран для OBS ───────────────────────────────────────────────────────
@bp.route("/<slug>/screen")
def screen(slug):
    ev = _event(slug)
    if not _screen_ok(ev):
        abort(403)
    links = _links(ev)
    qrs = {k: qr_svg(links[k]) for k in ("academy", "connect", "bot") if links.get(k)}
    return render_template("live/screen.html", ev=ev, links=links, qrs=qrs, pretty=_pretty,
                           key=request.args.get("key", ""), subjects=svc.SUBJECTS, blocks_json=svc.blocks(slug),
                           starts=ev.starts_at.strftime("%Y-%m-%dT%H:%M:%S") if ev.starts_at else "")


@bp.route("/<slug>/overlay")
def overlay(slug):
    ev = _event(slug)
    if not _screen_ok(ev):
        abort(403)
    links = _links(ev)
    return render_template("live/overlay.html", ev=ev, links=links, qr=qr_svg(links["academy"]), pretty=_pretty,
                           key=request.args.get("key", ""))


@bp.route("/<slug>/screen.json")
def screen_json(slug):
    ev = _event(slug)
    if not _screen_ok(ev):
        abort(403)
    out = {"state": svc.public_state(slug), "stats": svc.stats(slug)}
    picked = (LiveAsk.query.filter_by(event_id=ev.id, status="picked").order_by(LiveAsk.created_at.desc()).first())
    if picked:
        v = LiveViewer.query.filter_by(event_id=ev.id, user_id=picked.user_id).first()
        out["picked"] = {"text": picked.text, "name": svc.short_name(picked.user.full_name),
                         "school": (v.school if v else "") or ""}
    resp = jsonify(out)
    resp.headers["Cache-Control"] = "no-store"
    return resp


# ─── Пульт ───────────────────────────────────────────────────────────────
@bp.route("/<slug>/control")
@role_required("methodist", "trainer")
def control(slug):
    ev = _event(slug)
    qs = LiveQuestion.query.filter_by(event_id=ev.id).order_by(LiveQuestion.position).all()
    links = _links(ev)
    return render_template("live/control.html", ev=ev, qs=qs, blocks=svc.blocks(slug), links=links,
                           qsec={str(q.id): q.seconds for q in qs},
                           screen_url=absolute(url_for("live.screen", slug=slug, key=ev.screen_key, lang="kk")),
                           overlay_url=absolute(url_for("live.overlay", slug=slug, key=ev.screen_key, lang="kk")))


@bp.route("/<slug>/control.json")
@role_required("methodist", "trainer")
def control_json(slug):
    ev = _event(slug)
    from sqlalchemy import func
    per_q = dict(db.session.query(LiveAnswer.question_id, func.count(LiveAnswer.id))
                 .filter(LiveAnswer.event_id == ev.id).group_by(LiveAnswer.question_id).all())
    right = dict(db.session.query(LiveAnswer.question_id, func.count(LiveAnswer.id))
                 .filter(LiveAnswer.event_id == ev.id, LiveAnswer.is_correct.is_(True)).group_by(LiveAnswer.question_id).all())
    st = dict(ev.state or {})
    return jsonify({"state": st, "now": __import__("time").time(), "stats": svc.stats(slug),
                    "per_q": {str(k): [n, right.get(k, 0)] for k, n in per_q.items()}, "asks": svc.asks(ev)})


@bp.route("/<slug>/control/state", methods=["POST"])
@role_required("methodist", "trainer")
def control_state(slug):
    import time
    ev = _event(slug)
    f = request.get_json(silent=True) or {}
    mode = f.get("mode")
    if mode not in svc.MODES:
        abort(400)
    extra = {}
    if mode == "question":
        q = db.session.get(LiveQuestion, int(f.get("qid") or 0))
        if not q or q.event_id != ev.id:
            abort(400)
        extra = {"qid": q.id, "at": time.time(), "block": q.block}
    elif mode == "reveal":
        st = ev.state or {}
        if not st.get("qid"):
            abort(400)
        extra = {"qid": st["qid"], "at": st.get("at", 0), "block": st.get("block")}
    elif mode == "profile":
        extra = {}
    audit("live.state", "live_event", ev.id, mode=mode, qid=extra.get("qid"))
    svc.set_state(ev, mode, **extra)
    return jsonify({"ok": True, "state": ev.state})


@bp.route("/<slug>/control/settings", methods=["POST"])
@role_required("methodist", "trainer")
def control_settings(slug):
    ev = _event(slug)
    f = request.get_json(silent=True) or request.form
    raw = (f.get("youtube") or "").strip()
    if raw:
        m = YT_RE.search(raw)
        yid = m.group(1) if m else (raw if re.fullmatch(r"[A-Za-z0-9_-]{11}", raw) else None)
        if not yid:
            return jsonify({"ok": False, "error": t("live.err_youtube")}), 400
        ev.youtube_id = yid
    elif "youtube" in f:
        ev.youtube_id = None
    starts = (f.get("starts_at") or "").strip()
    if starts:
        try:
            ev.starts_at = datetime.strptime(starts, "%Y-%m-%dT%H:%M")
        except ValueError:
            return jsonify({"ok": False, "error": "starts_at"}), 400
    audit("live.settings", "live_event", ev.id, youtube_id=ev.youtube_id)
    db.session.commit()
    svc.drop_cache(ev.slug)
    svc._cache.pop("yt:" + ev.slug, None)
    _ids.pop(ev.slug, None)
    return jsonify({"ok": True, "youtube_id": ev.youtube_id})


@bp.route("/<slug>/control/ask/<int:ask_id>", methods=["POST"])
@role_required("methodist", "trainer")
def control_ask(slug, ask_id):
    ev = _event(slug)
    a = db.session.get(LiveAsk, ask_id)
    if not a or a.event_id != ev.id:
        abort(404)
    status = (request.get_json(silent=True) or {}).get("status")
    if status not in ("new", "picked", "done", "hidden"):
        abort(400)
    if status == "picked":
        LiveAsk.query.filter_by(event_id=ev.id, status="picked").update({"status": "done"})
    a.status = status
    db.session.commit()
    return jsonify({"ok": True})


@bp.route("/<slug>/export.xlsx")
@role_required("methodist", "trainer")
def export(slug):
    from openpyxl import Workbook
    ev = _event(slug)
    qs = LiveQuestion.query.filter_by(event_id=ev.id).order_by(LiveQuestion.position).all()
    answers: dict[tuple[int, int], LiveAnswer] = {(a.user_id, a.question_id): a
                                                  for a in LiveAnswer.query.filter_by(event_id=ev.id)}
    wb = Workbook()
    ws = wb.active
    ws.title = "Участники"
    head = ["ФИО", "Email", "Телефон", "Регион", "Город", "Школа", "Предметы", "Должность", "Опыт робототехники",
            "Анкета", "Впервые на эфире", "Минут на странице", "Баллы"] + [f"{q.key}" for q in qs]
    ws.append(head)
    rows = (db.session.query(LiveViewer, User).join(User, User.id == LiveViewer.user_id)
            .filter(LiveViewer.event_id == ev.id).order_by(LiveViewer.score.desc()).all())
    for v, u in rows:
        line = [u.full_name, u.email, u.phone or "", svc.region_name(v.region, "ru"), v.city or "", v.school or "",
                ", ".join(t(f"live.subj_{s}", locale="ru") for s in (v.subjects or [])),
                t(f"live.pos_{v.position}", locale="ru") if v.position else "",
                t(f"live.rob_{v.robotics}", locale="ru") if v.robotics else "",
                "да" if v.profile_at else "нет", svc.local_hm(v.first_seen), round((v.seconds or 0) / 60), v.score]
        for q in qs:
            a = answers.get((u.id, q.id))
            line.append("" if not a else ("+" if a.is_correct else "-"))
        ws.append(line)
    ws2 = wb.create_sheet("Вопросы спикеру")
    ws2.append(["Время", "ФИО", "Школа", "Вопрос", "Статус"])
    for a in svc.asks(ev, limit=10000):
        ws2.append([a["at"], a["name"], a["school"], a["text"], a["status"]])
    buf = io.BytesIO()
    wb.save(buf)
    buf.seek(0)
    return send_file(buf, as_attachment=True, download_name=f"live-{ev.slug}.xlsx",
                     mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
