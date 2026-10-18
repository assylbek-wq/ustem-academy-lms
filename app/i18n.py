"""Переводы интерфейса ru / kk / en.

Словарь строк лежит в i18n_strings.py: ключ -> {"ru": ..., "kk": ..., "en": ...}.
Если перевода нет, показывается русский вариант, а если нет и его - сам ключ.
Проверка полноты: `python -m unittest tests.test_i18n`.
"""
from __future__ import annotations

from flask import g, has_request_context

from .i18n_strings import STRINGS

LOCALES = ("ru", "kk", "en")
LOCALE_NAMES = {"ru": "Русский", "kk": "Қазақша", "en": "English"}
DEFAULT_LOCALE = "ru"


def current_locale() -> str:
    if has_request_context():
        return g.get("locale", DEFAULT_LOCALE)
    return DEFAULT_LOCALE


def t(key: str, locale: str | None = None, **params) -> str:
    lang = locale or current_locale()
    entry = STRINGS.get(key)
    if entry is None:
        text = key
    else:
        text = entry.get(lang) or entry.get(DEFAULT_LOCALE) or key
    if params:
        try:
            text = text.format(**params)
        except (KeyError, IndexError, ValueError):
            pass
    return text
