"""Лаборатория: макетная плата, симулятор схем и Arduino Uno (компиляция на сервере, запуск в браузере)."""
from __future__ import annotations

import re
import time
from pathlib import Path
from collections import defaultdict, deque

from flask import Blueprint, g, jsonify, render_template, request

from ..core import login_required
from ..services import arduino

bp = Blueprint("lab", __name__)
PRESET_DIR = Path(__file__).resolve().parents[1] / "static" / "lab" / "presets"
_hits: dict[int, deque] = defaultdict(deque)


def _limited(user_id: int, limit: int = 30, window: int = 60) -> bool:
    now = time.time()
    q = _hits[user_id]
    while q and now - q[0] > window:
        q.popleft()
    if len(q) >= limit:
        return True
    q.append(now)
    return False


@bp.route("/lab")
@login_required
def index():
    preset = request.args.get("preset", "")
    if not re.fullmatch(r"[a-z0-9-]{1,40}", preset or "") or not (PRESET_DIR / f"{preset}.json").exists():
        preset = ""
    return render_template("lab/index.html", preset=preset)


@bp.route("/lab/compile", methods=["POST"])
@login_required
def compile_sketch():
    if _limited(g.user.id):
        return jsonify(ok=False, error="Слишком часто. Подождите минуту и запустите снова."), 429
    code = (request.get_json(silent=True) or {}).get("code")
    if not isinstance(code, str) or not code.strip():
        return jsonify(ok=False, error="Пустой скетч."), 400
    try:
        res = arduino.compile_sketch(code)
    except arduino.CompileError as e:
        return jsonify(ok=False, error=str(e))
    except Exception:  # noqa: BLE001 - сбой компилятора не должен ронять страницу
        return jsonify(ok=False, error="Компилятор временно недоступен. Попробуйте позже."), 503
    return jsonify(ok=True, hex=res["hex"], size=res["size"])
