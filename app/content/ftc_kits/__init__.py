"""Уроки под ключ курса «FTC с нуля»: план занятия с учениками, слайды для проектора, чек-лист.

KITS в модулях level*.py: русское название урока -> {goal, minutes, group, prep, plan, say, task, check,
mistakes, homework, slides}. attach() кладет их в уроки программы как lesson["kit"] = {"ru": {...}}.
"""
from __future__ import annotations

import importlib

KITS: dict[str, dict] = {}
for _name in ("level12", "level34", "level45"):
    try:
        KITS.update(importlib.import_module(f"{__name__}.{_name}").KITS)
    except ModuleNotFoundError:
        pass


def attach_kits(program: dict, kits: dict) -> dict:
    """Положить уроки под ключ в уроки программы (по русскому названию урока)."""
    for lv in program["levels"]:
        for mod in lv["modules"]:
            for les in mod["lessons"]:
                kit = kits.get(les["title"]["ru"])
                if kit:
                    les["kit"] = {"ru": kit}
    return program


def attach(program: dict) -> dict:
    return attach_kits(program, KITS)
