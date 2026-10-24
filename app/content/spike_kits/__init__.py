"""Уроки под ключ курса «SPIKE Prime для FLL Challenge» (формат как в app/content/ftc_kits)."""
from __future__ import annotations

import importlib

from ..ftc_kits import attach_kits

KITS: dict[str, dict] = {}
for _name in ("level1", "level23", "level45"):
    try:
        KITS.update(importlib.import_module(f"{__name__}.{_name}").KITS)
    except ModuleNotFoundError:
        pass


def attach(program: dict) -> dict:
    return attach_kits(program, KITS)
