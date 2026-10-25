"""Путь сезона, рейтинг и связь с USTEM Connect (геймификация для тренеров)."""
from __future__ import annotations

import re
import secrets
from pathlib import Path

from flask import Blueprint, abort, current_app, flash, g, redirect, render_template, request, session, url_for

from ..core import audit, login_required
from ..game import mapgeo
from ..game import paths as gpaths
from ..game.tracks import BADGES, all_steps
from ..i18n import t
from ..models import JourneyMark, SimSolve, User, UserPath, db, utcnow
from ..services import connect, game, storage

bp = Blueprint("game", __name__)

STATIC = Path(__file__).resolve().parents[1] / "static"
SIM_DIRS = {"spike-": ("spikesim/presets", ""), "ftc-": ("ftcsim/presets", ""), "lab-": ("lab/presets", "lab-")}


def _flash_badges(codes: list[str]) -> None:
    for code in codes:
        flash(t("game.badge_new", name=BADGES[code]["title"].get(g.locale) or BADGES[code]["title"]["ru"]), "success")


def default_path(user: User) -> dict | None:
    """Путь, который открыть первым: последний открытый, иначе первый в списке тренера."""
    mine = gpaths.for_user(user)
    last = session.get("journey_track")
    return next((p for p in mine if p["key"] == last), None) or (mine[0] if mine else None)


@bp.route("/journey")
@login_required
def journey_index():
    if not g.user.journey_setup_at and not gpaths.connect_programs(g.user):
        return redirect(url_for("game.setup"))
    p = default_path(g.user)
    return redirect(url_for("game.journey", track=p["key"]) if p else url_for("game.setup"))


@bp.route("/journey/setup", methods=["GET", "POST"])
@login_required
def setup():
    """Какие пути показывать: сезоны программ и рост тренера. Курсы добавляются сами, когда тренер на них записан."""
    season = gpaths.published_db_paths()
    chosen = {u.key for u in UserPath.query.filter_by(user_id=g.user.id)}
    if request.method == "POST":
        want = {k for k in request.form.getlist("path") if any(p["key"] == k for p in season)}
        for u in UserPath.query.filter_by(user_id=g.user.id):
            if not u.key.startswith("c-") and u.key not in want:
                db.session.delete(u)
        for k in want - chosen:
            db.session.add(UserPath(user_id=g.user.id, key=k))
        g.user.journey_setup_at = utcnow()
        db.session.commit()
        if request.form.get("courses_only") and not want:
            return redirect(url_for("learn.catalog") if not gpaths.for_user(g.user) else url_for("game.journey_index"))
        return redirect(url_for("game.journey_index"))
    auto = {p["key"] for p in season if any(gpaths.program_matches(p, c) for c in gpaths.connect_programs(g.user))}
    courses = [p for p in gpaths.for_user(g.user) if p["kind"] == "course"]
    return render_template("game/setup.html", season=season, chosen=chosen, auto=auto, courses=courses)


@bp.route("/journey/<track>")
@login_required
def journey(track):
    tr = gpaths.get(track, include_drafts=g.user.has_role("methodist")) or abort(404)
    if not tr["stages"]:
        flash(t("paths.empty"), "error")
        return redirect(url_for("game.setup"))
    session["journey_track"] = track
    _flash_badges(game.refresh(g.user))
    mine = gpaths.for_user(g.user)
    if not any(p["key"] == track for p in mine):
        mine = mine + [tr]  # чужой путь можно посмотреть, в список он не добавляется
    state = game.track_state(g.user, tr)
    links = _course_links(g.user, tr) if tr["kind"] == "course" else {}
    summary = game.summary(g.user)
    board = game.leaderboard(limit=None, path=tr)
    region = summary["region"]
    me_path = next((r["place"] for r in board if r["user"].id == g.user.id), None)
    region_board = [r for r in board if region and r["region"] == region]
    me_region = next((i for i, r in enumerate(region_board, 1) if r["user"].id == g.user.id), None)
    sel = request.args.get("stage", type=int)
    sel = sel if sel is not None and 0 <= sel < len(state["stages"]) else state["current"]
    return render_template("game/journey.html", tr=tr, state=state, s=summary, sel=sel, mine=mine,
                           badges=game.badge_list(summary["badges"]), top=(region_board or board)[:5],
                           board_region=region if region_board else None,
                           me_country=me_path, me_region=me_region, connect_on=connect.enabled(),
                           geo={"wide": mapgeo.wide(len(state["stages"])), "tall": mapgeo.tall(len(state["stages"]))},
                           connect_url=current_app.config["CONNECT_URL"],
                           uses_connect=any(st["kind"] == "connect" for _, st in all_steps(tr)), links=links,
                           sim_url=sim_url)


def sim_url(preset: str) -> str:
    if preset.startswith("spike-"):
        return url_for("lab.spike", preset=preset)
    if preset.startswith("ftc-"):
        return url_for("lab.ftc", preset=preset)
    return url_for("lab.index", preset=preset.removeprefix("lab-"))


def _course_links(user: User, tr: dict) -> dict:
    """Ссылки на уроки и задания пути курса в потоке, куда записан тренер (или на страницу курса)."""
    from ..models import Assignment, Cohort, Enrollment, Lesson, Module
    cohort_by_level = {c.level_id: c.id for c in Cohort.query.join(Enrollment, Enrollment.cohort_id == Cohort.id)
                       .filter(Enrollment.user_id == user.id, Enrollment.status != "dropped")}
    out = {}
    for _, st in all_steps(tr):
        if st["kind"] == "lesson":
            les = db.session.get(Lesson, st["lesson_id"])
            cid = les and cohort_by_level.get(les.module.level_id)
            if cid:
                out[st["code"]] = url_for("learn.lesson", cohort_id=cid, lesson_id=les.id)
        elif st["kind"] == "evidence":
            a = db.session.get(Assignment, st["assignment_id"])
            cid = a and cohort_by_level.get(a.level_id)
            if cid:
                out[st["code"]] = url_for("learn.assignment", cohort_id=cid, assignment_id=a.id)
    return out


@bp.post("/journey/<track>/mark")
@login_required
def mark(track):
    tr = gpaths.get(track) or abort(404)
    code = request.form.get("step", "")
    step = next((s for _, s in all_steps(tr) if s["code"] == code and s["kind"] == "self"), None)
    if not step:
        abort(404)
    m = JourneyMark.query.filter_by(user_id=g.user.id, track=track, step=code).first()
    if request.form.get("action") == "undo":
        if m:
            db.session.delete(m)
            db.session.commit()
            game.refresh(g.user, sync_connect=False)
        return redirect(url_for("game.journey", track=track, stage=request.form.get("stage", type=int)))
    if not m:
        m = JourneyMark(user_id=g.user.id, track=track, step=code)
        db.session.add(m)
    m.note = (request.form.get("note") or "").strip()[:1000] or m.note
    photo = request.files.get("photo")
    if photo and photo.filename:
        try:
            if storage.kind_of(photo.filename) not in ("image", "video"):
                raise storage.UploadError("ext")
            m.photo = storage.save_small_file(photo, g.user.id)
        except storage.UploadError:
            flash(t("upload.err_ext", name=photo.filename), "error")
    db.session.commit()
    before = game.total_xp(g.user)
    _flash_badges(game.refresh(g.user, sync_connect=False))
    gained = game.total_xp(g.user) - before
    if gained > 0:
        flash(t("game.step_done", xp=gained), "success")
    return redirect(url_for("game.journey", track=track, stage=request.form.get("stage", type=int)))


@bp.route("/leaderboard")
@login_required
def leaderboard():
    game.refresh(g.user, sync_connect=False)
    regions = game.regions_in_board()
    region = request.args.get("region") or ""
    if region not in regions:
        region = ""
    paths = gpaths.published_db_paths() + [p for p in gpaths.for_user(g.user) if p["kind"] == "course"]
    path = next((p for p in paths if p["key"] == request.args.get("path")), None)
    rows = game.leaderboard(region or None, limit=None, path=path)
    me = next((r for r in rows if r["user"].id == g.user.id), None)
    return render_template("game/leaderboard.html", rows=rows[:100], me=me, regions=regions, region=region,
                           my_region=connect.region_of(g.user), paths=paths, path=path)


# ─── USTEM Connect ───────────────────────────────────────────────────────
@bp.route("/connect/start")
@login_required
def connect_start():
    if not connect.enabled():
        flash(t("game.connect_off"), "error")
        return redirect(url_for("game.journey_index"))
    session["connect_state"] = secrets.token_urlsafe(24)
    return redirect(connect.link_url(session["connect_state"]))


@bp.route("/connect/callback")
@login_required
def connect_callback():
    claims = connect.verify_link(request.args.get("t"), session.pop("connect_state", None))
    if not claims:
        flash(t("game.connect_bad"), "error")
        return redirect(url_for("game.journey_index"))
    other = User.query.filter(User.connect_person_id == claims["p"], User.id != g.user.id).first()
    if other:
        flash(t("game.connect_taken"), "error")
        return redirect(url_for("game.journey_index"))
    g.user.connect_person_id = claims["p"]
    g.user.connect_linked_at = g.user.connect_linked_at or utcnow()
    audit("user.connect_linked", "user", g.user.id)
    db.session.commit()
    connect.sync(g.user, force=True)
    _flash_badges(game.refresh(g.user, sync_connect=False))
    flash(t("game.connect_ok"), "success")
    return redirect(url_for("game.journey_index"))


@bp.post("/connect/unlink")
@login_required
def connect_unlink():
    u = g.user
    u.connect_person_id = u.connect_snapshot = u.connect_synced_at = u.connect_linked_at = None
    audit("user.connect_unlinked", "user", u.id)
    db.session.commit()
    game.refresh(u, sync_connect=False)
    flash(t("game.connect_unlinked"), "success")
    return redirect(url_for("auth.account"))


@bp.post("/connect/sync")
@login_required
def connect_sync():
    connect.sync(g.user, force=True)
    _flash_badges(game.refresh(g.user, sync_connect=False))
    return redirect(request.referrer if (request.referrer or "").startswith(request.host_url) else url_for("game.journey_index"))


# ─── Задания симуляторов ─────────────────────────────────────────────────
def known_preset(name: str) -> bool:
    if not re.fullmatch(r"[a-z0-9-]{3,64}", name or "") or "sandbox" in name:
        return False
    for prefix, (folder, strip) in SIM_DIRS.items():
        if name.startswith(prefix):
            return (STATIC / folder / f"{name[len(strip):]}.json").is_file()
    return False


@bp.post("/api/sim/solved")
@login_required
def sim_solved():
    preset = ((request.get_json(silent=True) or {}).get("preset") or "").strip()
    if not known_preset(preset):
        return {"ok": False, "error": "preset"}, 400
    if SimSolve.query.filter_by(user_id=g.user.id, preset=preset).first():
        return {"ok": True, "xp": 0, "badges": []}
    db.session.add(SimSolve(user_id=g.user.id, preset=preset))
    db.session.commit()
    before = game.total_xp(g.user)
    new = game.refresh(g.user, sync_connect=False)
    names = [BADGES[c]["title"].get(g.locale) or BADGES[c]["title"]["ru"] for c in new]
    return {"ok": True, "xp": game.total_xp(g.user) - before, "badges": names, "total": game.total_xp(g.user)}
