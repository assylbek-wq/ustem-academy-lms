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
SPIKE_DIR = Path(__file__).resolve().parents[1] / "static" / "spikesim" / "presets"
FTC_DIR = Path(__file__).resolve().parents[1] / "static" / "ftcsim" / "presets"
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


@bp.route("/lab/ftc")
@login_required
def ftc():
    preset = request.args.get("preset", "")
    if not re.fullmatch(r"ftc-[a-z0-9-]{1,40}", preset or "") or not (FTC_DIR / f"{preset}.json").exists():
        preset = "ftc-sandbox"
    return render_template("lab/ftc.html", preset=preset.removeprefix("ftc-"))


@bp.route("/lab/spike")
@login_required
def spike():
    preset = request.args.get("preset", "")
    if not re.fullmatch(r"spike-[a-z0-9-]{1,40}", preset or "") or not (SPIKE_DIR / f"{preset}.json").exists():
        preset = "spike-sandbox"
    return render_template("lab/spike.html", preset=preset.removeprefix("spike-"))


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
