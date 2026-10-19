# CLAUDE.md

USTEM Academy - LMS для подготовки учителей. Flask + SQLAlchemy + Jinja2 + Tailwind, PostgreSQL (прод) / SQLite (dev).
Устроена в стиле USTEM Connect, чтобы команда работала с одним стеком. Карта кода: [docs/architecture.md](docs/architecture.md).

Быстрые факты:

- Запуск: `SEED_DEMO=1 python wsgi.py` -> http://localhost:5080 (порт 5060 браузеры блокируют, не используйте).
- Тесты: `python -m unittest discover tests -v`; на Postgres - с `TEST_DATABASE_URL`.
- После правки Tailwind-классов в `app/templates/` или `app/static/js/` - `bash deploy/build-css.sh` (собранный CSS в гите).
- Все строки интерфейса - через `t("ключ")`, словарь в `app/i18n_strings.py` (ru, kk, en). Тест `tests/test_i18n.py`
  ловит пропущенные ключи и пустые переводы.
- Русские тексты: без буквы «ё» и без длинного тире (тест это проверяет).
- Контент (названия, тексты уроков, рубрики) хранится как JSON `{"ru","kk","en"}`, выводится фильтром `|loc`.
- Права: декораторы `login_required` / `role_required(...)` в `app/core.py`; админ проходит любую роль.
- CSRF: каждый POST/PUT/DELETE несет `_csrf` в форме или заголовок `X-CSRF-Token` (JS берет из `<meta name="csrf-token">`).
- В шаблонах не называйте переменные `p`: в `base.html` есть `cur_path`, а имена из базового шаблона перекрывают
  переменные страницы.
- Прогресс и выдача сертификата - только через `services/progress.py` (`state`, `maybe_complete`).
- Схема: миграции Alembic (Flask-Migrate) в `migrations/`, применяются сами при старте (`app/dbinit.py`).
  Изменили модели - `DB_AUTO_INIT=0 flask --app wsgi db migrate -m "..."`, проверьте файл (для Boolean в Postgres
  `server_default=sa.false()`, не `'0'`), закоммитьте. Тесты (`TESTING`) работают через `create_all()`.
- Программа «в своем темпе» (`Program.self_paced`): у каждого уровня постоянный открытый поток без дат и дедлайнов,
  потоки создает и закрывает `services/selfpaced.py` (`sync_program`). Включается галочкой в Студии.
- Готовые курсы хранятся в коде: `app/content/<курс>.py`, фото в `app/static/course/<курс>/`. При старте
  недостающие курсы загружаются сами (`ensure_all`); пересоздать вручную: `flask --app wsgi load-course canopy-2026 --replace`.
