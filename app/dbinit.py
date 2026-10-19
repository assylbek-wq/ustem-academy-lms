"""Подготовка схемы базы при старте приложения.

- Тесты (TESTING): db.create_all() на пустой базе.
- Новая база: create_all() по моделям и отметка alembic «head».
- База, созданная до миграций (без таблицы alembic_version): отметка базовой ревизии и upgrade.
- Обычный запуск: alembic upgrade head.

Новые изменения схемы: flask --app wsgi db migrate -m "что изменилось", проверить файл в migrations/versions,
закоммитить. На сервере миграции применятся сами при старте контейнера.
"""
from __future__ import annotations

import logging
from pathlib import Path

from flask import Flask
from flask_migrate import Migrate, stamp, upgrade
from sqlalchemy import inspect

from .models import db

MIGRATIONS_DIR = str(Path(__file__).resolve().parent.parent / "migrations")
BASELINE_REVISION = "0001_baseline"
log = logging.getLogger("academy.db")
migrate = Migrate(directory=MIGRATIONS_DIR)


def init_db(app: Flask) -> None:
    migrate.init_app(app, db)
    if app.config.get("TESTING"):
        db.create_all()
        return
    if not app.config.get("DB_AUTO_INIT", True):
        return
    tables = set(inspect(db.engine).get_table_names())
    if "alembic_version" not in tables:
        if "users" in tables:
            log.info("База создана до миграций: отмечаю базовую ревизию %s", BASELINE_REVISION)
            stamp(directory=MIGRATIONS_DIR, revision=BASELINE_REVISION)
        else:
            log.info("Новая база: создаю схему по моделям")
            db.create_all()
            stamp(directory=MIGRATIONS_DIR, revision="head")
            return
    upgrade(directory=MIGRATIONS_DIR)
