"""Проверка пути из конструктора Студии: этапы и шаги приходят JSON из pathedit.js."""
from __future__ import annotations

import re

from ..models import Program
from .paths import ICONS

KINDS = ("self", "connect", "course", "sim")
RULES = ("linked", "team", "roster", "registered", "number", "approved", "played", "award", "advanced")
EVENT_KINDS = ("qualifier", "regional", "national", "international", "festival", "scrimmage", "offseason",
               "training", "camp", "hackathon", "exhibition")
LOCALES = ("ru", "kk", "en")


class PathError(ValueError):
    pass


def _ml(v, required=False, limit=300) -> dict:
    v = v if isinstance(v, dict) else {}
    out = {l: str(v.get(l) or "").strip()[:limit] for l in LOCALES}
    if required and not out["ru"]:
        raise PathError("нужно название на русском")
    return {l: x for l, x in out.items() if x}


def _int(v, lo, hi, default):
    try:
        return max(lo, min(hi, int(v)))
    except (TypeError, ValueError):
        return default


def clean_stages(raw, known_preset) -> list[dict]:
    if not isinstance(raw, list) or len(raw) > 30:
        raise PathError("этапов должно быть до 30")
    used_stage, used_step = set(), set()
    courses = {p.slug for p in Program.query.all()}
    out = []
    for si, st in enumerate(raw):
        if not isinstance(st, dict):
            raise PathError("неверный этап")
        code = st.get("code") if re.fullmatch(r"[a-z0-9-]{1,40}", str(st.get("code") or "")) else f"s{si + 1}"
        while code in used_stage:
            code += "x"
        used_stage.add(code)
        stage = {"code": code, "icon": st.get("icon") if st.get("icon") in ICONS else "flag",
                 "title": _ml(st.get("title"), required=True), "steps": []}
        steps = st.get("steps") or []
        if not isinstance(steps, list) or len(steps) > 40:
            raise PathError("шагов в этапе должно быть до 40")
        for ki, sp in enumerate(steps):
            if not isinstance(sp, dict) or sp.get("kind") not in KINDS:
                raise PathError(f"этап {si + 1}: неизвестный вид шага")
            kind = sp["kind"]
            scode = sp.get("code") if re.fullmatch(r"[a-z0-9-]{1,40}", str(sp.get("code") or "")) else f"{code}-{ki + 1}"
            if kind == "connect" and sp.get("rule") == "linked":
                scode = "connect"  # общий шаг «подключить Connect» засчитывается один раз
            while scode in used_step:
                scode += "x"
            used_step.add(scode)
            step = {"code": scode, "kind": kind, "title": _ml(sp.get("title"), required=True),
                    "hint": _ml(sp.get("hint"), limit=500)}
            if kind in ("self", "connect"):
                step["xp"] = _int(sp.get("xp"), 0, 3000, 50)
            if kind == "self":
                step["photo"] = bool(sp.get("photo"))
            elif kind == "connect":
                if sp.get("rule") not in RULES:
                    raise PathError(f"этап {si + 1}: выберите, что проверить в Connect")
                step["rule"] = sp["rule"]
                kinds = [k for k in (sp.get("kinds") or []) if k in EVENT_KINDS]
                if kinds:
                    step["kinds"] = kinds
                if sp["rule"] == "roster":
                    step["min"] = _int(sp.get("min"), 1, 50, 2)
                    step["max"] = max(step["min"], _int(sp.get("max"), 1, 50, 10))
            elif kind == "course":
                if sp.get("course") not in courses:
                    raise PathError(f"этап {si + 1}: выберите курс")
                step["course"], step["level"] = sp["course"], _int(sp.get("level"), 1, 20, 1)
            elif kind == "sim":
                if not known_preset(str(sp.get("preset") or "")):
                    raise PathError(f"этап {si + 1}: нет задания симулятора «{sp.get('preset')}»")
                step["preset"] = sp["preset"]
            stage["steps"].append(step)
        out.append(stage)
    return out


def clean_programs(text: str) -> list[str]:
    return [c for c in dict.fromkeys(x.strip().upper() for x in (text or "").split(","))
            if re.fullmatch(r"[A-Z][A-Z0-9_]{1,31}", c)]
