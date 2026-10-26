"""Лаборатория: макетная плата и Arduino Uno (компиляция на сервере), симуляторы SPIKE, FTC, спутников WSO и роботов Unitree."""
from __future__ import annotations

import re
import time
from pathlib import Path
from collections import defaultdict, deque

from flask import Blueprint, g, jsonify, redirect, render_template, request, url_for

from ..core import login_required
from ..services import arduino

bp = Blueprint("lab", __name__)
PRESET_DIR = Path(__file__).resolve().parents[1] / "static" / "lab" / "presets"
SPIKE_DIR = Path(__file__).resolve().parents[1] / "static" / "spikesim" / "presets"
FTC_DIR = Path(__file__).resolve().parents[1] / "static" / "ftcsim" / "presets"
CUBESAT_DIR = Path(__file__).resolve().parents[1] / "static" / "cubesat" / "presets"
CANSAT_DIR = Path(__file__).resolve().parents[1] / "static" / "cansat" / "presets"
ROBOT_DIR = Path(__file__).resolve().parents[1] / "static" / "robots" / "presets"
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


STATIC = Path(__file__).resolve().parents[1] / "static"
# Лаборатории на главной странице: ключ, раздел, префикс задания в SimSolve, папка заданий
LABS = [
    {"key": "arduino", "group": "robotics", "endpoint": "lab.arduino", "solved": "lab-", "dir": "lab/presets", "glob": "*.json"},
    {"key": "spike", "group": "robotics", "endpoint": "lab.spike", "solved": "spike-", "dir": "spikesim/presets", "glob": "spike-*.json"},
    {"key": "ftc", "group": "robotics", "endpoint": "lab.ftc", "solved": "ftc-", "dir": "ftcsim/presets", "glob": "ftc-*.json"},
    {"key": "robots", "group": "robotics", "endpoint": "lab.robots", "solved": "robot-", "dir": "robots/presets", "glob": "robot-*.json"},
    {"key": "cubesat", "group": "space", "endpoint": "lab.cubesat", "solved": "cubesat-", "dir": "cubesat/presets", "glob": "cubesat-*.json"},
    {"key": "cansat", "group": "space", "endpoint": "lab.cansat", "solved": "cansat-", "dir": "cansat/presets", "glob": "cansat-*.json"},
]


def _hub_rows(user_id: int) -> list[dict]:
    from ..models import SimSolve
    solved = [s.preset for s in SimSolve.query.filter_by(user_id=user_id)]
    rows = []
    for lab in LABS:
        total = sum(1 for p in (STATIC / lab["dir"]).glob(lab["glob"]) if "sandbox" not in p.stem)
        done = sum(1 for s in solved if s.startswith(lab["solved"]))
        rows.append({**lab, "total": total, "done": min(done, total)})
    return rows


@bp.route("/lab")
@login_required
def index():
    """Все симуляторы и лаборатории на одной странице. Старые ссылки /lab?preset=... ведут в Arduino."""
    if request.args.get("preset"):
        return redirect(url_for("lab.arduino", preset=request.args["preset"]))
    return render_template("lab/hub.html", rows=_hub_rows(g.user.id))


@bp.route("/lab/arduino", endpoint="arduino")
@login_required
def arduino_lab():  # не arduino: так называется модуль компиляции services.arduino
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


@bp.route("/lab/cubesat")
@login_required
def cubesat():
    preset = request.args.get("preset", "")
    if not re.fullmatch(r"cubesat-[a-z0-9-]{1,40}", preset or "") or not (CUBESAT_DIR / f"{preset}.json").exists():
        preset = "cubesat-sandbox"
    return render_template("lab/sat.html", kind="cubesat", preset=preset.removeprefix("cubesat-"))


@bp.route("/lab/cansat")
@login_required
def cansat():
    preset = request.args.get("preset", "")
    if not re.fullmatch(r"cansat-[a-z0-9-]{1,40}", preset or "") or not (CANSAT_DIR / f"{preset}.json").exists():
        preset = "cansat-sandbox"
    return render_template("lab/sat.html", kind="cansat", preset=preset.removeprefix("cansat-"))


@bp.route("/lab/robots")
@login_required
def robots():
    """Unitree Go2 и G1 на MuJoCo (WebAssembly): программа на MicroPython с API как unitree_sdk2."""
    preset = request.args.get("preset", "")
    if not re.fullmatch(r"robot-[a-z0-9-]{1,40}", preset or "") or not (ROBOT_DIR / f"{preset}.json").exists():
        preset = "robot-g1-sandbox" if request.args.get("robot") == "g1" else "robot-go2-sandbox"
    robot = "g1" if preset.startswith("robot-g1") else "go2"
    return render_template("lab/robots.html", preset=preset.removeprefix("robot-"), robot=robot)


@bp.route("/lab/compile", methods=["POST"])
@login_required
def compile_sketch():
    if _limited(g.user.id):
        return jsonify(ok=False, error="Слишком часто. Подождите минуту и запустите снова."), 429
    data = request.get_json(silent=True) or {}
    code, board = data.get("code"), data.get("board") or "uno"
    if not isinstance(code, str) or not code.strip():
        return jsonify(ok=False, error="Пустой скетч."), 400
    if board not in arduino.BOARDS:
        return jsonify(ok=False, error="Неизвестная плата."), 400
    try:
        res = arduino.compile_sketch(code, board)
    except arduino.CompileError as e:
        return jsonify(ok=False, error=str(e))
    except Exception:  # noqa: BLE001 - сбой компилятора не должен ронять страницу
        return jsonify(ok=False, error="Компилятор временно недоступен. Попробуйте позже."), 503
    return jsonify(ok=True, hex=res["hex"], size=res["size"], flash=res["flash"])
