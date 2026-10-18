"""JSON API для страниц: загрузка частями, ИИ-помощник, комментарии по таймкодам, посещаемость."""
from __future__ import annotations

from flask import Blueprint, abort, current_app, g, request

from ..core import audit, login_required
from ..i18n import t
from ..models import (Attendance, Enrollment, EvidenceFile, Lesson, Session, TimecodeComment, Upload, db,
                      utcnow)
from ..services import ai, progress, storage

bp = Blueprint("api", __name__, url_prefix="/api")


def _err(key: str, code: int = 400):
    return {"ok": False, "error": t(key)}, code


# ─── Загрузка частями ────────────────────────────────────────────────────
@bp.post("/uploads")
@login_required
def upload_start():
    data = request.get_json(silent=True) or {}
    try:
        up = storage.start_upload(g.user.id, data.get("name", ""), int(data.get("size") or 0), data.get("type"))
    except (storage.UploadError, ValueError) as e:
        key = "upload.err_size" if str(e) == "size" else "upload.err_ext"
        return _err(key)
    return {"ok": True, "id": up.id, "received": 0, "chunk": current_app.config["CHUNK_BYTES"]}


def _my_upload(upload_id: str) -> Upload:
    up = db.session.get(Upload, upload_id)
    if not up or up.owner_id != g.user.id:
        abort(404)
    return up


@bp.get("/uploads/<upload_id>")
@login_required
def upload_status(upload_id):
    up = _my_upload(upload_id)
    path = storage.root() / "tmp" / f"{up.id}.part"
    received = path.stat().st_size if path.exists() else (up.total_size if up.file_id else 0)
    return {"ok": True, "id": up.id, "received": received, "total": up.total_size, "file_id": up.file_id}


@bp.put("/uploads/<upload_id>")
@login_required
def upload_chunk(upload_id):
    up = _my_upload(upload_id)
    if up.file_id:
        return {"ok": True, "received": up.total_size, "file_id": up.file_id}
    offset = request.args.get("offset", type=int)
    if offset is None:
        return _err("upload.err_generic")
    try:
        received = storage.append_chunk(up, offset, request.get_data(cache=False))
    except storage.UploadError:
        return _err("upload.err_size")
    out = {"ok": True, "received": received}
    if received == up.total_size:
        f = storage.finish_upload(up)
        out.update(file_id=f.id, kind=f.kind, name=f.original_name)
    return out


@bp.delete("/files/<int:file_id>")
@login_required
def file_delete(file_id):
    f = db.session.get(EvidenceFile, file_id)
    if not f or f.owner_id != g.user.id or f.evidence_id:
        abort(404)
    storage.delete_file(storage.evidence_path(f))
    Upload.query.filter_by(file_id=f.id).delete()
    db.session.delete(f)
    db.session.commit()
    return {"ok": True}


# ─── ИИ-помощник ─────────────────────────────────────────────────────────
@bp.post("/ai/<int:cohort_id>/<int:lesson_id>")
@login_required
def ai_ask(cohort_id, lesson_id):
    enr = Enrollment.query.filter_by(cohort_id=cohort_id, user_id=g.user.id).first()
    lesson = db.session.get(Lesson, lesson_id)
    if not enr or not lesson or lesson.module.level_id != enr.cohort.level_id:
        abort(404)
    if not ai.enabled():
        return _err("ai.disabled", 503)
    if ai.used_today(g.user.id) >= current_app.config["AI_DAILY_LIMIT"]:
        return _err("ai.limit", 429)
    q = ((request.get_json(silent=True) or {}).get("message") or "").strip()
    if not q:
        return _err("ai.empty")
    try:
        answer = ai.ask(g.user, lesson, q, g.locale)
    except ai.AiUnavailable:
        return _err("ai.failed", 502)
    return {"ok": True, "answer": answer}


# ─── Комментарии наставника по таймкодам ─────────────────────────────────
def _reviewable_file(file_id: int) -> EvidenceFile:
    f = db.session.get(EvidenceFile, file_id)
    if not f or not f.evidence:
        abort(404)
    enr = f.evidence.enrollment
    if not (g.user.is_admin or enr.mentor_id == g.user.id or enr.cohort.trainer_id == g.user.id):
        abort(403)
    return f


@bp.post("/files/<int:file_id>/comments")
@login_required
def comment_add(file_id):
    f = _reviewable_file(file_id)
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()[:2000]
    if not text:
        return _err("review.comment_empty")
    c = TimecodeComment(file_id=f.id, author_id=g.user.id, seconds=max(0.0, float(data.get("seconds") or 0)),
                        text=text)
    db.session.add(c)
    db.session.commit()
    return {"ok": True, "id": c.id, "seconds": c.seconds, "text": c.text, "author": g.user.full_name}


@bp.delete("/comments/<int:comment_id>")
@login_required
def comment_delete(comment_id):
    c = db.session.get(TimecodeComment, comment_id)
    if not c or (c.author_id != g.user.id and not g.user.is_admin):
        abort(404)
    db.session.delete(c)
    db.session.commit()
    return {"ok": True}


# ─── Посещаемость (тренер, работает и из офлайн-очереди) ──────────────────
@bp.post("/sessions/<int:session_id>/attendance")
@login_required
def attendance(session_id):
    s = db.session.get(Session, session_id)
    if not s:
        abort(404)
    if not (g.user.is_admin or s.cohort.trainer_id == g.user.id):
        abort(403)
    data = request.get_json(silent=True) or {}
    marks = data.get("marks") or [{"enrollment_id": data.get("enrollment_id"), "present": data.get("present")}]
    valid = {e.id: e for e in s.cohort.enrollments}
    changed = []
    for m in marks:
        try:
            eid = int(m.get("enrollment_id"))
        except (TypeError, ValueError):
            continue
        if eid not in valid:
            continue
        row = Attendance.query.filter_by(session_id=s.id, enrollment_id=eid).first()
        if not row:
            row = Attendance(session_id=s.id, enrollment_id=eid)
            db.session.add(row)
        row.present = bool(m.get("present"))
        row.marked_by = g.user.id
        row.marked_at = utcnow()
        changed.append(eid)
    db.session.flush()
    for eid in changed:
        progress.maybe_complete(valid[eid], issued_by=g.user.id)
    audit("attendance.marked", "session", s.id, count=len(changed))
    db.session.commit()
    return {"ok": True, "saved": changed}
