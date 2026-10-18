"""Настройки приложения. Все значения берутся из переменных окружения."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _bool(name: str, default: bool = False) -> bool:
    v = os.environ.get(name)
    if v is None:
        return default
    return v.strip().lower() in ("1", "true", "yes", "on")


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    # PostgreSQL в продакшене: postgresql+psycopg://user:pass@host/db
    # SQLite по умолчанию для локальной разработки.
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", f"sqlite:///{BASE_DIR / 'academy.db'}"
    ).replace("postgres://", "postgresql+psycopg://", 1).replace(
        "postgresql://", "postgresql+psycopg://", 1
    )
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Файлы: видео уроков, доказательства, материалы. Хранятся на сервере в РК.
    UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", BASE_DIR / "uploads"))
    MAX_UPLOAD_BYTES = int(os.environ.get("MAX_UPLOAD_MB", "2048")) * 1024 * 1024
    CHUNK_BYTES = 5 * 1024 * 1024
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # один HTTP-запрос (чанк, форма, материал)

    # Время занятий вводится и показывается по местному времени Академии.
    TIMEZONE = os.environ.get("TIMEZONE", "Asia/Almaty")
    PUBLIC_BASE_URL = os.environ.get("PUBLIC_BASE_URL", "http://localhost:5080")

    # ИИ-помощник (API Claude). Без ключа помощник просто скрыт.
    ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
    AI_MODEL = os.environ.get("AI_MODEL", "claude-sonnet-5-5")
    AI_DAILY_LIMIT = int(os.environ.get("AI_DAILY_LIMIT", "40"))

    # Почта (необязательно). Без SMTP письма пишутся в лог, а ссылки показываются админу.
    SMTP_HOST = os.environ.get("SMTP_HOST", "")
    SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
    SMTP_USER = os.environ.get("SMTP_USER", "")
    SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
    MAIL_FROM = os.environ.get("MAIL_FROM", "USTEM Academy <academy@ustem.kz>")

    # Telegram-уведомления (необязательно)
    TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")

    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = _bool("SESSION_COOKIE_SECURE", False)
    PERMANENT_SESSION_LIFETIME = 60 * 60 * 24 * 30

    SEED_DEMO = _bool("SEED_DEMO", False)
    SEED_CONTENT = _bool("SEED_CONTENT", True)  # каталог программ при первом запуске
    TESTING = False


class TestConfig(Config):
    TESTING = True
    SEED_CONTENT = False
    SEED_DEMO = False
    SECRET_KEY = "test"
    SQLALCHEMY_DATABASE_URI = os.environ.get("TEST_DATABASE_URL", "sqlite://")
    ANTHROPIC_API_KEY = ""
