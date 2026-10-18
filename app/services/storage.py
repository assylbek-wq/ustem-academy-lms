"""Хранение файлов на диске сервера и загрузка частями с докачкой."""
from __future__ import annotations

import mimetypes
import os
import secrets
import shutil
from pathlib import Path

from flask import current_app
from werkzeug.utils import secure_filename

from ..models import EvidenceFile, LessonMaterial, Upload, db

VIDEO_EXT = {"mp4", "mov", "m4v", "webm", "3gp", "avi", "mkv"}
IMAGE_EXT = {"jpg", "jpeg", "png", "webp", "heic", "gif"}
DOC_EXT = {"pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "zip", "csv",
           "sb3", "llsp", "llsp3", "lms", "py", "java", "stl", "f3d", "step", "md"}
ALLOWED_EXT = VIDEO_EXT | IMAGE_EXT | DOC_EXT


class UploadError(ValueError):
    pass


def root() -> Path:
    p = Path(current_app.config["UPLOAD_DIR"])
    for sub in ("evidence", "materials", "tmp"):
        (p / sub).mkdir(parents=True, exist_ok=True)
    return p


def ext_of(name: str) -> str:
    return name.rsplit(".", 1)[-1].lower() if "." in name else ""


def kind_of(name: str) -> str:
    e = ext_of(name)
    if e in VIDEO_EXT:
        return "video"
    if e in IMAGE_EXT:
        return "image"
    return "file"


def check_name(name: str) -> str:
    name = (name or "").strip()
    if not name or ext_of(name) not in ALLOWED_EXT:
        raise UploadError("ext")
    return name[:255]


def evidence_path(f: EvidenceFile) -> Path:
    return root() / "evidence" / f.stored_name


def material_path(m: LessonMaterial) -> Path:
    return root() / "materials" / m.stored_name


# ─── Загрузка частями ────────────────────────────────────────────────────
def start_upload(owner_id: int, name: str, size: int, mime: str | None) -> Upload:
    name = check_name(name)
    if size <= 0 or size > current_app.config["MAX_UPLOAD_BYTES"]:
        raise UploadError("size")
    up = Upload(id=secrets.token_hex(16), owner_id=owner_id, original_name=name,
                mime=mime or mimetypes.guess_type(name)[0], total_size=size)
    db.session.add(up)
    db.session.commit()
    return up


def _tmp(up: Upload) -> Path:
    return root() / "tmp" / f"{up.id}.part"


def append_chunk(up: Upload, offset: int, data: bytes) -> int:
    """Пишет часть, если offset совпадает с уже полученным объемом. Возвращает новый объем."""
    path = _tmp(up)
    have = path.stat().st_size if path.exists() else 0
    if offset != have:
        up.received = have
        db.session.commit()
        return have  # клиент продолжит с правильного места
    if have + len(data) > up.total_size:
        raise UploadError("size")
    with open(path, "ab") as fh:
        fh.write(data)
    up.received = have + len(data)
    db.session.commit()
    return up.received


def finish_upload(up: Upload) -> EvidenceFile:
    if up.file_id:
        return db.session.get(EvidenceFile, up.file_id)
    path = _tmp(up)
    if not path.exists() or path.stat().st_size != up.total_size:
        raise UploadError("incomplete")
    stored = f"{secrets.token_hex(12)}.{ext_of(up.original_name)}"
    shutil.move(str(path), str(root() / "evidence" / stored))
    f = EvidenceFile(owner_id=up.owner_id, kind=kind_of(up.original_name), original_name=up.original_name,
                     stored_name=stored, mime=up.mime, size=up.total_size)
    db.session.add(f)
    db.session.flush()
    up.file_id = f.id
    db.session.commit()
    return f


def save_small_file(file_storage, owner_id: int) -> EvidenceFile:
    """Обычная загрузка формы (фото, документы) без докачки."""
    name = check_name(file_storage.filename or "")
    stored = f"{secrets.token_hex(12)}.{ext_of(name)}"
    dest = root() / "evidence" / stored
    file_storage.save(dest)
    f = EvidenceFile(owner_id=owner_id, kind=kind_of(name), original_name=name, stored_name=stored,
                     mime=file_storage.mimetype, size=dest.stat().st_size)
    db.session.add(f)
    db.session.flush()
    return f


def save_material(file_storage, lesson_id: int) -> LessonMaterial:
    name = check_name(file_storage.filename or "")
    stored = f"{secrets.token_hex(12)}_{secure_filename(name) or 'file'}"
    dest = root() / "materials" / stored
    file_storage.save(dest)
    m = LessonMaterial(lesson_id=lesson_id, original_name=name, stored_name=stored, size=dest.stat().st_size)
    db.session.add(m)
    return m


def delete_file(path: Path) -> None:
    try:
        os.remove(path)
    except FileNotFoundError:
        pass
