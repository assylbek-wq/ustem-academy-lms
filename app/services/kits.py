"""Урок под ключ: перевод между полем Lesson.kit и простой формой в Студии.

Форма построчная, чтобы методист правил план без JSON:
- prep, check, mistakes: по пункту на строку;
- plan: строка «минуты | этап | что делают»;
- slides: слайды через пустую строку, первая строка - заголовок, остальные - пункты.
"""
from __future__ import annotations

import re

LIST_FIELDS = ("prep", "check", "mistakes")
TEXT_FIELDS = ("goal", "group", "say", "homework")


def _lines(text: str) -> list[str]:
    return [re.sub(r"^\s*[-•*]\s*", "", ln).strip() for ln in (text or "").splitlines() if ln.strip()]


def to_form(kit: dict | None) -> dict:
    k = kit or {}
    task = k.get("task") or {}
    return {
        **{f: k.get(f, "") or "" for f in TEXT_FIELDS},
        "minutes": k.get("minutes") or 80,
        **{f: "\n".join(k.get(f) or []) for f in LIST_FIELDS},
        "plan": "\n".join(f"{m} | {t} | {d}" for m, t, d in (k.get("plan") or [])),
        "task_title": task.get("title", ""), "task_text": task.get("text", ""), "task_sim": task.get("sim") or "",
        "slides": "\n\n".join("\n".join([s.get("title", "")] + list(s.get("bullets") or [])) for s in (k.get("slides") or [])),
    }


def from_form(form) -> tuple[dict | None, list[str]]:
    """(урок под ключ или None, если форма пустая; список ошибок)."""
    errors: list[str] = []
    plan = []
    for ln in (form.get("plan") or "").splitlines():
        if not ln.strip():
            continue
        parts = [x.strip() for x in ln.split("|")]
        if len(parts) < 2 or not parts[0].isdigit():
            errors.append(ln.strip()[:60])
            continue
        plan.append([int(parts[0]), parts[1], " | ".join(parts[2:])])
    slides = []
    for block in re.split(r"\n\s*\n", (form.get("slides") or "").strip()):
        rows = _lines(block)
        if rows:
            slides.append({"title": rows[0], "bullets": rows[1:]})
    kit = {f: (form.get(f) or "").strip() for f in TEXT_FIELDS}
    kit.update({f: _lines(form.get(f)) for f in LIST_FIELDS})
    kit["plan"], kit["slides"] = plan, slides
    sim = (form.get("task_sim") or "").strip()
    kit["task"] = {"title": (form.get("task_title") or "").strip(), "text": (form.get("task_text") or "").strip(),
                   "sim": sim if re.fullmatch(r"(spike|ftc)-[a-z0-9-]{2,40}", sim) else None}
    try:
        kit["minutes"] = max(10, min(240, int(form.get("minutes") or 0)))
    except ValueError:
        kit["minutes"] = 80
    if plan and not form.get("keep_minutes"):
        kit["minutes"] = sum(p[0] for p in plan)
    if not (kit["goal"] or plan or slides):
        return None, errors
    return kit, errors
