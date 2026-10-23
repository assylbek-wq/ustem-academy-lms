"""Хранение файлов на диске сервера и загрузка частями с докачкой."""
from __future__ import annotations

import fcntl
import os
import re
import secrets
import shutil
import subprocess
from pathlib import Path

from flask import current_app
from werkzeug.utils import secure_filename

from ..models import EvidenceFile, LessonMaterial, Upload, db

VIDEO_EXT = {"mp4", "mov", "m4v", "webm", "3gp", "avi", "mkv"}
IMAGE_EXT = {"jpg", "jpeg", "png", "webp", "heic", "gif"}
DOC_EXT = {"pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "zip", "csv",
           "sb3", "llsp", "llsp3", "lms", "py", "java", "stl", "f3d", "step", "md"}
ALLOWED_EXT = VIDEO_EXT | IMAGE_EXT | DOC_EXT
SAFE_INLINE = {"mp4": "video/mp4", "m4v": "video/mp4", "mov": "video/quicktime", "webm": "video/webm",
               "3gp": "video/3gpp", "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
               "webp": "image/webp", "gif": "image/gif"}


def safe_mime(name: str) -> str:
    """Тип файла только по расширению из белого списка; все прочее - octet-stream (скачивание)."""
    return SAFE_INLINE.get(ext_of(name), "application/octet-stream")


def inline_ok(name: str) -> bool:
    return ext_of(name) in SAFE_INLINE


class UploadError(ValueError):
    pass


def root() -> Path:
    p = Path(current_app.config["UPLOAD_DIR"])
    for sub in ("evidence", "materials", "tmp", "videos"):
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
                mime=safe_mime(name), total_size=size)
    db.session.add(up)
    db.session.commit()
    return up


def _tmp(up: Upload) -> Path:
    return root() / "tmp" / f"{up.id}.part"


def append_chunk(up: Upload, offset: int, data: bytes) -> int:
    """Пишет часть, если offset совпадает с уже полученным объемом. Возвращает новый объем."""
    path = _tmp(up)
    with open(path, "ab") as fh:
        fcntl.flock(fh, fcntl.LOCK_EX)  # параллельные запросы с одним offset не дублируют данные
        try:
            have = fh.seek(0, os.SEEK_END)
            if offset == have:
                if have + len(data) > up.total_size:
                    raise UploadError("size")
                fh.write(data)
                fh.flush()
                have += len(data)
        finally:
            fcntl.flock(fh, fcntl.LOCK_UN)
    up.received = have
    db.session.commit()
    return have


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
                     mime=safe_mime(name), size=dest.stat().st_size)
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


# ─── Видео урока, загруженное файлом ─────────────────────────────────────
# Файл лежит в videos/<24 hex>.<ext>, в уроке хранится ссылка /lesson-video/<id урока>/<имя>.
# После загрузки сервер в фоне готовит <имя без расширения>.web.mp4 (H.264 + AAC, перемотка с начала
# загрузки), который играет в любом браузере: видео с iPhone (HEVC, .mov) Chrome и Firefox часто не показывают.
# Пока версии .web.mp4 нет, отдается исходный файл.
LESSON_VIDEO_RE = re.compile(r"^/lesson-video/(\d+)/([0-9a-f]{24}\.[a-z0-9]{2,4})$")


def lesson_video_url(lesson_id: int, name: str) -> str:
    return f"/lesson-video/{lesson_id}/{name}"


def lesson_video_names(lesson) -> set[str]:
    """Имена загруженных файлов, на которые ссылается урок (на любом языке)."""
    out = set()
    for v in (lesson.video_url or {}).values():
        m = LESSON_VIDEO_RE.match(v or "")
        if m and int(m.group(1)) == lesson.id:
            out.add(m.group(2))
    return out


def lesson_video_file(name: str) -> tuple[Path, str]:
    """Путь к файлу для показа и его тип: готовая версия .web.mp4, если она уже есть."""
    d = root() / "videos"
    web = d / (name.rsplit(".", 1)[0] + ".web.mp4")
    if web.exists():
        return web, "video/mp4"
    return d / name, safe_mime(name) if ext_of(name) in SAFE_INLINE else "video/mp4"


def attach_lesson_video(f: EvidenceFile, lesson_id: int) -> str:
    """Переносит загруженный частями файл в видео урока и запускает подготовку версии для браузеров."""
    name = f"{secrets.token_hex(12)}.{ext_of(f.original_name)}"
    dest = root() / "videos" / name
    shutil.move(str(evidence_path(f)), str(dest))
    Upload.query.filter_by(file_id=f.id).delete()
    db.session.delete(f)
    start_transcode(dest)
    return lesson_video_url(lesson_id, name)


def delete_lesson_videos(names) -> None:
    d = root() / "videos"
    for name in names:
        base = name.rsplit(".", 1)[0]
        for p in (d / name, d / f"{base}.web.mp4", d / f"{base}.web.part.mp4"):
            delete_file(p)


TRANSCODE_SH = r"""
src="$1"; out="$2"; part="$3"
v=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,pix_fmt -of csv=p=0 "$src" | head -1)
if [ "$v" = "h264,yuv420p" ]; then vargs="-c:v copy"; else vargs="-c:v libx264 -preset veryfast -crf 23 -pix_fmt yuv420p -vf scale=w=if(gt(iw\,ih)\,-2\,min(1080\,iw)):h=if(gt(iw\,ih)\,min(1080\,ih)\,-2)"; fi
a=$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "$src" | head -1)
if [ "$a" = "aac" ]; then aargs="-c:a copy"; else aargs="-c:a aac -b:a 128k"; fi
nice -n 10 ffmpeg -nostdin -v error -y -i "$src" -map 0:v:0 -map "0:a:0?" $vargs $aargs -movflags +faststart "$part" \
  && mv "$part" "$out" || rm -f "$part"
"""


def start_transcode(src: Path) -> bool:
    """Фоновая подготовка .web.mp4. Без ffmpeg (dev) ничего не делает, видео играет как загружено."""
    if not shutil.which("ffmpeg") or current_app.config.get("TESTING"):
        return False
    base = src.with_suffix("")
    subprocess.Popen(["sh", "-c", TRANSCODE_SH, "transcode", str(src), f"{base}.web.mp4", f"{base}.web.part.mp4"],
                     stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                     start_new_session=True)
    return True
