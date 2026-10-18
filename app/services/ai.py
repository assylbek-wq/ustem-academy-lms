"""ИИ-помощник слушателя на API Claude.

Отвечает по материалам урока и технике наборов, на языке слушателя.
Все диалоги сохраняются (AiMessage). Дневной лимит на пользователя - AI_DAILY_LIMIT.
"""
from __future__ import annotations

import logging
from datetime import timedelta

from flask import current_app

from ..core import loc
from ..models import AiMessage, Lesson, db, utcnow

log = logging.getLogger("academy.ai")

LANG_NAMES = {"ru": "русском", "kk": "казахском", "en": "английском"}


class AiUnavailable(RuntimeError):
    pass


def enabled() -> bool:
    return bool(current_app.config.get("ANTHROPIC_API_KEY"))


def used_today(user_id: int) -> int:
    since = utcnow() - timedelta(days=1)
    return AiMessage.query.filter(AiMessage.user_id == user_id, AiMessage.role == "user",
                                  AiMessage.created_at >= since).count()


def history(user_id: int, lesson_id: int, limit: int = 12) -> list[AiMessage]:
    rows = (AiMessage.query.filter_by(user_id=user_id, lesson_id=lesson_id)
            .order_by(AiMessage.created_at.desc(), AiMessage.id.desc()).limit(limit).all())
    return list(reversed(rows))


def system_prompt(lesson: Lesson, locale: str) -> str:
    level = lesson.module.level
    program = level.program
    body = loc(lesson.body, locale) or ""
    return (
        "Ты помощник слушателя USTEM Academy - академии подготовки учителей инженерного образования "
        "(робототехника, FIRST, дроны, 3D, ИИ) в Казахстане.\n"
        f"Программа: {loc(program.title, locale)}. Уровень {level.number}: {loc(level.title, locale)}.\n"
        f"Модуль: {loc(lesson.module.title, locale)}. Урок: {loc(lesson.title, locale)}.\n\n"
        "Правила:\n"
        f"- Отвечай на {LANG_NAMES.get(locale, 'русском')} языке, коротко и по делу, как опытный тренер.\n"
        "- Опирайся на материалы урока ниже и на общую практику работы с учебными наборами.\n"
        "- Помогай с техникой (сборка, подключение, программирование, типичные неисправности) "
        "и методикой (как провести урок, как объяснить детям).\n"
        "- Не выполняй за слушателя задания с доказательством и не выставляй оценки: это делает наставник.\n"
        "- Если вопрос не относится к обучению, вежливо верни разговор к уроку.\n"
        "- Если не уверен, так и скажи и посоветуй спросить наставника.\n\n"
        f"Материалы урока:\n<lesson>\n{body[:12000]}\n</lesson>"
    )


def ask(user, lesson: Lesson, question: str, locale: str) -> str:
    if not enabled():
        raise AiUnavailable("disabled")
    question = question.strip()[:2000]
    msgs = [{"role": m.role, "content": m.content} for m in history(user.id, lesson.id)]
    msgs.append({"role": "user", "content": question})
    db.session.add(AiMessage(user_id=user.id, lesson_id=lesson.id, role="user", content=question))
    db.session.commit()
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=current_app.config["ANTHROPIC_API_KEY"], timeout=60)
        resp = client.messages.create(
            model=current_app.config["AI_MODEL"], max_tokens=1200,
            system=system_prompt(lesson, locale), messages=msgs,
        )
        answer = "".join(b.text for b in resp.content if getattr(b, "type", "") == "text").strip()
    except Exception as exc:
        log.exception("AI request failed")
        raise AiUnavailable(str(exc)) from exc
    db.session.add(AiMessage(user_id=user.id, lesson_id=lesson.id, role="assistant", content=answer))
    db.session.commit()
    return answer
