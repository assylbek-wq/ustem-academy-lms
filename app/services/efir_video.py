"""Сцена «Видео» студии эфиров: ролик YouTube или файл, который играет прямо на экране эфира (на видеосервере).

Файлы лежат в UPLOAD_DIR/efir/<id эфира>/videos/<id>.<ext> (папка презентации efir_deck.folder), грузятся частями
через /api/uploads (докачка) и переносятся сюда. Состояние показа в EfirEvent.state: vid, pos (секунда ролика в момент
play_at), play_at (время сервера), paused. Экран и пульт считают текущую секунду сами: pos + (сейчас - play_at).
"""
from __future__ import annotations

import re
import secrets
import shutil
import time

from ..models import EfirEvent, EvidenceFile, Upload, db
from . import efir_deck, storage

MAX_VIDEOS = 30
FILE_EXT = ("mp4", "webm", "m4v", "mov")
YT_RE = re.compile(r"(?:v=|youtu\.be/|/live/|/embed/|/shorts/)([A-Za-z0-9_-]{11})")


class VideoError(ValueError):
    """Ошибка: ключ строки i18n."""


def items(ev: EfirEvent) -> list[dict]:
    return [dict(v) for v in (ev.videos or []) if isinstance(v, dict) and v.get("id")]


def get(ev: EfirEvent, vid: str) -> dict | None:
    return next((v for v in items(ev) if v["id"] == vid), None)


def folder(ev: EfirEvent):
    p = efir_deck.folder(ev) / "videos"
    p.mkdir(parents=True, exist_ok=True)
    return p


def path(ev: EfirEvent, v: dict):
    return folder(ev) / f"{v['id']}.{v['ext']}"


def _title(t: str | None, fallback: str) -> str:
    return " ".join(str(t or "").split())[:120] or fallback


def _dur(d) -> int | None:
    try:
        d = int(float(d))
    except (TypeError, ValueError):
        return None
    return d if 0 < d < 6 * 3600 else None


def _save(ev: EfirEvent, lst: list[dict]) -> None:
    ev.videos = lst
    db.session.commit()


def add_youtube(ev: EfirEvent, url: str, title: str | None = None, dur=None) -> dict:
    lst = items(ev)
    if len(lst) >= MAX_VIDEOS:
        raise VideoError("efir.v_err_many")
    raw = (url or "").strip()
    m = YT_RE.search(raw)
    yt = m.group(1) if m else (raw if re.fullmatch(r"[A-Za-z0-9_-]{11}", raw) else None)
    if not yt:
        raise VideoError("efir.v_err_yt")
    v = {"id": secrets.token_hex(6), "kind": "youtube", "yt": yt, "title": _title(title, "YouTube"), "dur": _dur(dur)}
    lst.append(v)
    _save(ev, lst)
    return v


def add_file(ev: EfirEvent, f: EvidenceFile, owner_id: int, title: str | None = None, dur=None) -> dict:
    """Загруженный частями файл (EvidenceFile без работы) переносим в папку эфира и забываем запись загрузки."""
    lst = items(ev)
    if len(lst) >= MAX_VIDEOS:
        raise VideoError("efir.v_err_many")
    if not f or f.owner_id != owner_id or f.evidence_id:
        raise VideoError("efir.v_err_file")
    ext = storage.ext_of(f.original_name)
    if ext not in FILE_EXT:
        raise VideoError("efir.v_err_ext")
    src = storage.evidence_path(f)
    if not src.exists():
        raise VideoError("efir.v_err_file")
    v = {"id": secrets.token_hex(6), "kind": "file", "ext": ext, "title": _title(title, f.original_name.rsplit(".", 1)[0]),
         "dur": _dur(dur), "size": f.size}
    shutil.move(str(src), str(path(ev, v)))
    Upload.query.filter_by(file_id=f.id).delete()
    db.session.delete(f)
    lst.append(v)
    _save(ev, lst)
    return v


def update(ev: EfirEvent, vid: str, title: str | None = None, dur=None) -> None:
    lst = items(ev)
    for v in lst:
        if v["id"] == vid:
            if title is not None:
                v["title"] = _title(title, v.get("title") or "")
            if dur is not None and _dur(dur):
                v["dur"] = _dur(dur)
    _save(ev, lst)


def remove(ev: EfirEvent, vid: str) -> None:
    lst = items(ev)
    v = get(ev, vid)
    if not v:
        return
    if v["kind"] == "file":
        path(ev, v).unlink(missing_ok=True)
    _save(ev, [x for x in lst if x["id"] != vid])


def copy(src: EfirEvent, dst: EfirEvent) -> None:
    out = []
    for v in items(src):
        if v["kind"] == "file":
            if not path(src, v).exists():
                continue
            shutil.copy2(path(src, v), folder(dst) / f"{v['id']}.{v['ext']}")
        out.append(v)
    dst.videos = out


def position(st: dict) -> float:
    """Текущая секунда ролика по состоянию эфира."""
    pos = float(st.get("pos") or 0)
    if st.get("paused") or not st.get("play_at"):
        return pos
    return pos + max(0.0, time.time() - float(st["play_at"]))
