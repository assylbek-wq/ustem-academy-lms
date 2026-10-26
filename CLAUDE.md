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
- Лаборатория: `/lab` - одна страница со всеми симуляторами (`lab/hub.html`, список `LABS` в `blueprints/lab.py`), в меню
  один пункт. Каждый симулятор оформлен как программа, которую копирует: Arduino - Arduino IDE 2 + симуляция схемы,
  SPIKE - приложение SPIKE, FTC - OnBot Java + Driver Station, CanSat - конструктор ракеты как OpenRocket, программа
  как Thonny. Над приложением узкая строка `lab/_bar.html` вместо большого заголовка.
- Arduino и схемы (`/lab/arduino`, старые ссылки `/lab?preset=` перенаправляются): исходники `assets/lab/` (avr8js, CodeMirror), сборка `bash deploy/build-lab.sh`
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
- Лаборатория спутников WSO: CubeSat 1U (глава 13 регламента) и CanSat с ракетой-носителем (глава 12). Общее ядро
  `assets/lab/sat/` (`core.js` - атмосфера, радиолиния, эфир LoRa по формуле Semtech, батарея с просадкой, тепло корпуса;
  `onboard.js` - бортовая электроника и датчики; `pyapi.js` - модуль `sat` для MicroPython; `vm.js` - запуск программы;
  `checks.js` - общие проверки; `blueprint.js` - чертежи; `scene.js` - сцена полета; `ui.js` + `worker.js` - интерфейс).
  Виды: `assets/lab/cubesat/` (аэростат, ветер и трос, оценка FLT) и `assets/lab/cansat/` (`model.js` - массы, ЦТ и ЦД по
  Barrowman, `physics.js` - полет на РД1-100-7М, замедлитель 7 с, парашюты и снос, `score.js` - критерии B, C, D, E), в каждом
  `catalog.js`, `sim.js`, `checks.js`, `kind.js` (что показывает интерфейс). Сборка `bash deploy/build-lab.sh` ->
  `app/static/js/satsim.js`, `satworker.js` (MicroPython из `static/spikesim/`). Задания: `python3 assets/lab/cubesat_presets.py`
  и `cansat_presets.py` -> `app/static/<вид>/presets/*.json`. В уроке блок `<div class="cubesat-sim-ИМЯ"></div>` или
  `<div class="cansat-sim-ИМЯ"></div>`, песочницы `/lab/cubesat`, `/lab/cansat`. Сквозная проверка без браузера:
  `node tests/e2e/sat_solutions.mjs` и `--negative`. Пути `wso-cubesat` и `wso-cansat` (программы Connect `WSO_CUBESAT`,
  `WSO_CANSAT`) открываются вместо общего WSO: самый точный путь по коду программы.
- Роботы Unitree на MuJoCo (`/lab/robots`, Go2 и G1): физика MuJoCo 3 WASM (`@mujoco/mujoco`, копируется в
  `app/static/robots/mujoco.*`), модели Menagerie упакованы в `app/static/robots/<робот>/<робот>.pack` скриптом
  `python3 assets/lab/robots/prepare_models.py <mujoco_menagerie>` (сетки .msh, у G1 приводы position -> motor, LICENSE Unitree
  рядом обязателен). Исходники `assets/lab/robots/` (`engine.js` - физика, моторы ПД 500 Гц, SportClient Go2 с рысью из
  `gait.js`, запись; `pyapi.js` - модуль `unitree` как unitree_sdk2: LowCmd, LowState, SportClient; `vm.js`, `checks.js`,
  `worker.js`, `view.js` - Three.js, `ui.js`), сборка `bash deploy/build-lab.sh` -> `robotsim.js`, `robotworker.js`.
  Задания: `python3 assets/lab/robot_presets.py` -> `app/static/robots/presets/robot-*.json`, в уроке
  `<div class="robot-sim-ИМЯ"></div>`. Курс `app/content/unitree_mujoco.py` (slug `unitree-mujoco`). Сквозная проверка без
  браузера: `node tests/e2e/robot_solutions.mjs` и `--negative`.
- Геймификация для тренеров («Мой путь»): общий опыт, звания, значки, серия дней и рейтинг считаются от любого курса
  (`services/game.py`, опыт пересчитывается из фактов функцией `refresh`, не начисляйте его вручную). Пути
  (`app/game/paths.py`): сезоны программ и рост тренера хранятся в `journey_paths`, их собирает методист в Студии
  (Студия -> Пути, `pathedit.js`, проверка `app/game/pathedit.py`; первые FLL, FTC, WSO из `SEED_PATHS` в
  `app/game/tracks.py`); пути курсов (`c-<slug>`) строятся сами из уровней курса. У тренера свои пути: выбранные на
  `/journey/setup` (`user_paths`) + курсы, на которые записан, + программы его команд в Connect (код WSO включает
  WSO_CANSAT и т.д.). Шаги про команду и турниры засчитывает USTEM Connect (`services/connect.py`: подключение
  `/connect/start` -> Connect `/link/academy` -> `/connect/callback`, данные `GET /api/v1/academy/journey`, ключ
  `CONNECT_API_KEY` = ключ academy из `CERT_API_KEYS` Connect). Решенные задания симуляторов приходят в
  `POST /api/sim/solved` (`window.academySolved` в app.js).
- Урок под ключ (план занятия с учениками, слайды для проектора, печать плана): поле `Lesson.kit` = `{"ru": {...}}`,
  шаблон `learn/_kit.html`, в уроке вкладка «Провести занятие с учениками». Для «FTC с нуля» данные в
  `app/content/ftc_kits/level*.py` (ключ - русское название урока), подключаются `attach()` в `ftc_start_2026.py`.
- Миграции для SQLite: не используйте `batch_alter_table` для таблиц, на которые ссылаются ON DELETE CASCADE
  (users, lessons, programs): SQLite пересоздает таблицу и каскадно удаляет связанные записи. Добавляйте колонки
  через `op.add_column`, уникальность - через `op.create_index(..., unique=True)`.
