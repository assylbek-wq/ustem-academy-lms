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
  недостающие курсы загружаются сами (`ensure_all`). Обновить уроки уже загруженного курса, сохранив потоки и
  прогресс: `flask --app wsgi load-course canopy-2026 --update` (уроки сопоставляются по русскому названию внутри уровня).
  Полностью пересоздать (прогресс теряется): `--replace`.
- Лаборатория (схемы + Arduino Uno): исходники `assets/lab/` (avr8js, CodeMirror), сборка `bash deploy/build-lab.sh`
  -> `app/static/js/lab.js` (в гите). Задания: `python3 assets/lab/presets.py` -> `app/static/lab/presets/*.json`.
  В уроке блок `<div class="lab-preset-ИМЯ"></div>`. Скетчи компилирует сервер (`services/arduino.py`, avr-gcc
  в Dockerfile, ядро Arduino в `vendor/arduino-avr`), выполняются они в браузере.
  Сквозная проверка всех заданий в браузере: сервер с `SEED_DEMO=1`, затем
  `python3 tests/e2e/lab_solutions.py http://localhost:5080` (эталоны) и с `--negative` (стартовый код не проходит).
- Симулятор FTC (шасси, механизмы, Java OpMode, Driver Hub): исходники `assets/lab/ftc/` (`java.js` - перевод
  подмножества Java в async JS, `field.js` - поле BIOBUZZ по CAD FIRST, `core.js` - SDK, физика, очки и проверки
  без DOM, `sim.js` - интерфейс), та же сборка
  `bash deploy/build-lab.sh` -> `app/static/js/ftcsim.js`. Задания: `python3 assets/lab/ftc_presets.py` ->
  `app/static/ftcsim/presets/*.json`. В уроке блок `<div class="ftc-sim-ИМЯ"></div>` (задание `ftc-ИМЯ`),
  песочница `/lab/ftc`. Сквозная проверка: `python3 tests/e2e/ftc_solutions.py http://localhost:5080` и `--negative`.
- Симулятор SPIKE Prime (блоки Blockly + Python, настоящий MicroPython WASM с API SPIKE 3, тренировочный мат FLL):
  исходники `assets/lab/spike/` (`mat.js` - поле, `physics.js` - робот и проверки, `pyapi.js` - модули hub/motor/...,
  `runner.js` + `worker.js` - запуск в Web Worker, `blocks.js` - блоки и генератор Python, `ui.js` - интерфейс),
  сборка `bash deploy/build-lab.sh` -> `app/static/js/spikesim.js`, `spikeworker.js`, `app/static/spikesim/micropython.*`.
  Задания: `python3 assets/lab/spike_presets.py` -> `app/static/spikesim/presets/*.json`. В уроке блок
  `<div class="spike-sim-ИМЯ"></div>` (задание `spike-ИМЯ`), песочница `/lab/spike`. Сквозная проверка:
  `python3 tests/e2e/spike_solutions.py http://localhost:5080` и `--negative`.
- Геймификация для тренеров: путь сезона FLL Challenge и FTC (`app/game/tracks.py` - этапы и шаги, звания, значки;
  `services/game.py` - опыт пересчитывается из фактов функцией `refresh`, не начисляйте его вручную), страницы
  `/journey/<fll|ftc>` и `/leaderboard`. Шаги про команду и турниры засчитывает USTEM Connect (`services/connect.py`:
  подключение `/connect/start` -> Connect `/link/academy` -> `/connect/callback`, данные `GET /api/v1/academy/journey`,
  ключ `CONNECT_API_KEY` = ключ academy из `CERT_API_KEYS` Connect). Решенные задания симуляторов приходят
  в `POST /api/sim/solved` (`window.academySolved` в app.js).
