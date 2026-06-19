# USTEM Academy LMS — гид для Claude Code

> Этот файл автоматически читается Claude Code при работе с проектом. Здесь — архитектура, договорённости, ловушки и история решений.

## Что это

Полнофункциональная **Learning Management System** (LMS) для **USTEM Academy** — образовательной организации STEM в Казахстане (Алматы). Бесплатные курсы по робототехнике, программированию, AI и инженерии.

Платформа полностью **статическая**: HTML + Tailwind (CDN) + Vanilla JS + LocalStorage. Никаких сборщиков, бэкенда или баз данных. Деплоится как набор файлов на любой статический хостинг (Netlify, GitHub Pages, Vercel, S3).

## Стек

| Слой | Решение |
|---|---|
| Стили | Tailwind CSS через CDN + кастомный `assets/css/styles.css` |
| Шрифты | Inter (body) + Space Grotesk (заголовки) + JetBrains Mono (код) |
| JS | Vanilla ES6+, без сборки |
| Хранилище | `localStorage` под ключом `ustem_lms_vN` |
| WYSIWYG | [Quill 2.0.2](https://cdn.jsdelivr.net/npm/quill@2.0.2/) (CDN) — в редакторе уроков и постов |
| Подсветка кода | [Prism.js 1.29](https://prismjs.com/) (CDN) — на `course.html` и `post.html` |
| i18n | Свой модуль `assets/js/i18n.js`, 3 языка (ru / kk / en) |

## Структура файлов

```
LMS/
├── CLAUDE.md                  # ⟵ ты здесь
├── README.md                  # инструкция для разработчика
│
├── index.html                 # Главная (лендинг)
├── courses.html               # Каталог курсов
├── course.html                # Страница курса + плеер уроков + квизы
├── blog.html                  # Каталог постов блога
├── post.html                  # Страница одного поста
├── dashboard.html             # Дашборд студента
├── auth.html                  # Вход / регистрация
│
├── admin.html                 # Админка: список курсов
├── admin-blog.html            # Админка: список постов
├── admin-edit.html            # Редактор курса (Quill, уроки, квизы)
├── admin-post-edit.html       # Редактор поста
│
└── assets/
    ├── css/styles.css         # Кастомные стили, prose-content, action-btn и т.д.
    ├── img/
    │   ├── logo.png           # Оригинальный квадратный логотип
    │   ├── logo-full.png      # Высокого разрешения 3024×1730
    │   └── logo-symbol.png    # Только символ, прозрачный фон (используется в UI)
    └── js/
        ├── i18n.js            # Модуль i18n + словари ru/kk/en
        ├── data.js            # Seed-данные + Store API + хранилище
        └── app.js             # Header, footer, helpers, рендеринг карточек
```

## Архитектура

### Точки входа

Каждая страница — самостоятельный HTML с инлайн-скриптом внизу:

```html
<script src="assets/js/i18n.js"></script>
<script src="assets/js/data.js"></script>
<script src="assets/js/app.js"></script>
<script>
  // Рендер страницы через USTEM.renderHeader, USTEM.renderCourseCard, и т.д.
</script>
```

Порядок загрузки строгий: `i18n.js` → `data.js` (использует `localStorage`) → `app.js` (использует `Store`, `i18n`, `t()`, `loc()`).

### Store (`data.js`)

Глобальный объект `window.Store` — единственное место работы с данными:

```js
Store.getCourses()       // массив курсов
Store.getCourseById(id)  // один курс
Store.saveCourse(c)      // upsert
Store.deleteCourse(id)   // удаление

Store.getPosts()         // массив постов блога
Store.getPostById(id)
Store.savePost(p)
Store.deletePost(id)

Store.getUsers()
Store.getUserByEmail()
Store.saveUser(u)

Store.getSession()       // текущий залогиненный пользователь или null
Store.setSession(userId)
Store.clearSession()

Store.reset()            // вернуть seed-данные, разлогинить
```

### i18n (`i18n.js`)

```js
i18n.lang                       // 'ru' | 'kk' | 'en'
i18n.setLang('en')              // переключить + перерендер
i18n.t(key, params)             // строка из словаря
i18n.apply(root = document)     // пройти по [data-i18n], [data-i18n-placeholder], и т.д.
i18n.loc(obj)                   // {ru, kk, en} → строка на текущем языке

// глобальные алиасы:
window.t('nav.home')
window.loc(course.title)
```

Словари в `i18n.js` — три объекта (`ru`, `kk`, `en`), ~300+ ключей в каждом.

### Мультиязычные поля

Текстовые поля в курсах и постах хранятся как объекты:

```js
const ml = (ru, kk, en) => ({ ru, kk, en });

{
  title: ml('Основы Python', 'Python негіздері', 'Python Basics'),
  description: ml('Подробное описание...', '...', '...'),
}
```

Чтение через `loc(field)` — возвращает текущий язык с фоллбэком на `ru` → `en` → первое доступное.

Хелпер `asMl(v)` в редакторах нормализует поле: если строка — оборачивает в `{ru: v}`, если уже объект — копирует.

### Версионирование LocalStorage

`STORAGE_KEY = 'ustem_lms_vN'` в `data.js`. При **любом** изменении схемы данных или важного контента нужно:

1. Бампнуть номер версии: `'ustem_lms_v8'` → `'ustem_lms_v9'`
2. Добавить старую версию в массив cleanup в `Store.init()`:
   ```js
   ['ustem_lms_v1', ..., 'ustem_lms_v8'].forEach(k => {
     if (localStorage.getItem(k)) { localStorage.removeItem(k); ... }
   });
   ```

Это **критично** — иначе у существующих пользователей будут устаревшие данные. История версий: v1 (первая) → v8 (текущая на момент написания).

## Договорённости (read this first)

### 1) Каждая страница рендерит шапку и футер из JS
```js
document.getElementById('header-root').innerHTML = USTEM.renderHeader('home');
document.getElementById('footer-root').innerHTML = USTEM.renderFooter();
```
`renderHeader(activeKey)` сама подставит активную ссылку + переключатель языков + кнопку логина/профиля.

### 2) Все Tailwind-классы + кастомные классы из styles.css
Не пиши inline-стили, кроме градиентных фонов (`style="background:${Covers[cover]}"`) и одноразовых динамических значений.

### 3) Квалифицированные иконки — эмодзи
Дизайн-система использует эмодзи (📚 📝 🎬 💡 ⚠️) вместо SVG-иконок. Это сознательно — теплее и быстрее. SVG только для функциональных иконок (стрелки, меню), они в `USTEM.Icons` в `app.js`.

### 4) Контент уроков и постов = HTML
Сохраняется как HTML-строка. Поддерживаются теги: `<h2>`, `<h3>`, `<h4>`, `<p>`, `<ul>`, `<ol>`, `<pre><code>`, `<blockquote>`, `<table>`, `<iframe>`, `<img>`, `<hr>`, `<a>`, `<div class="callout">`, `<div class="callout warning">`.

Все эти теги стилизованы в `styles.css` под классом `.prose-content`.

### 5) Статусы публикации
Курсы и посты имеют `status: 'draft' | 'published'`. Студенты видят только опубликованные:
```js
.filter(c => isAdmin || c.status !== 'draft')
```

### 6) Видео embed-парсер
`parseVideoUrl(url)` в `admin-edit.html` и `admin-post-edit.html` поддерживает 7 платформ + прямые MP4. Если меняешь — обнови оба места.

## Ловушки и FAQ

### `file://` и YouTube
Если открыть HTML напрямую (file://), YouTube и Vimeo iframe не загружаются — отдают «Ошибка 153». Это политика самого YouTube, не починить кодом. В `admin-edit.html` и `course.html` есть жёлтые баннеры-предупреждения. **Лечение:** запускать через HTTP-сервер.

```bash
python3 -m http.server 8000
# затем http://localhost:8000
```

### Прозрачность логотипа
Исходный `logo.png` имел **сплошной белый фон** в PNG. Когда показывали на тёмной шапке — был белый квадрат. Я пересоздал `logo-symbol.png` через Python+PIL: автодетект границ символа и замена всех `alpha=255 + RGB>248` пикселей на прозрачные. Если хочешь подменить логотип — либо повтори процедуру, либо убедись, что прозрачность реальная.

### Quill в модалках курса
Quill инициализируется в `admin-edit.html` через `renderLessonModal()`. При переключении языковой вкладки в модалке Quill **пересоздаётся** — это нормально, контент сохраняется в `model.lessons[idx].content[lang]` через `text-change` хендлер до переключения.

### Авто-сохранение
В редакторах — таймер 30 сек. Срабатывает только если есть title хотя бы на одном языке, чтобы не плодить пустые «черновики». `Ctrl+S` (Cmd+S на Mac) — мгновенное сохранение.

## Демо-аккаунты

| Роль | Email | Пароль |
|---|---|---|
| Студент | `student@ustem.kz` | `student123` |
| Админ | `admin@ustem.kz` | `admin123` |

Регистрация новых пользователей работает (создаются с ролью `student`).

## Запуск

```bash
cd LMS
python3 -m http.server 8000
# открыть http://localhost:8000
```

Можно открыть и через `open index.html`, но **встроенные видео не будут работать** (YouTube блокирует embed с file://).

## Деплой

Сейчас задеплоено на Netlify: `silly-biscochitos-290aa3.netlify.app`.

Поскольку всё статическое — любой `cp -r LMS/ /var/www/html/` или drag-and-drop в Netlify dashboard. Никаких билд-команд.

## Бренд

- **Основной логотип:** `assets/img/logo-symbol.png` (диамант + раскрытая книга, синий градиент)
- **Полная версия с текстом:** `assets/img/logo-full.png`
- **Фирменные цвета:** фиолетово-синий градиент `linear-gradient(135deg, #6d28d9, #2563eb)` — это `gradient-brand` и `gradient-text-dark` в `styles.css`
- **Hero-фон:** трёхцветный radial gradient на тёмном `#0f172a`, класс `gradient-hero`
- **Бренд-маркер шапки:** `<span class="brand-mark"><img src="assets/img/logo-symbol.png" /></span>`

## Курсы в комплекте (9)

База `posts` + `courses` пересеивается из `data.js` при первом запуске или после бампа версии. Список курсов:

1. **🧱 FIRST LEGO League** — соревнования, начальный, 8 нед
2. **🔧 FIRST Tech Challenge** — соревнования, средний, 12 нед
3. **🏆 WSO Robotics** — соревнования, продвинутый, 16 нед (WorldSkills)
4. **🤖 Робототехника с нуля** — робототехника, начальный, 6 нед
5. **🔌 Arduino: от нуля до проекта** — электроника, начальный, 6 нед
6. **👩‍🔬 STEM Hanym** — инициативы, начальный, 10 нед (программа для девушек)
7. **🟦 LEGO Education** — робототехника, начальный, 8 нед (для педагогов)
8. **🐢 ROS 2** — робототехника, продвинутый, 12 нед
9. **🦿 Unitree G1/Go2** — робототехника, эксперт, 10 нед (гуманоиды + квадропеды)

## Посты блога (6 на момент написания)

1. `p_robotics_lab_discussion` — публичное обсуждение программы Robotics Lab (актуальное)
2. `p_1` admissions-2026 — открыт набор
3. `p_2` platform-v6-update — release notes
4. `p_3` ai-almaty-hackathon-results
5. `p_4` stem-hanym-200-graduates
6. `p_5` fll-world-festival-prep

## Основатель / контакты

- **Қуатов Даулет** — основатель USTEM Academy
- Алматы, Казахстан · `info@ustem.kz`

## Состояние / возможные следующие шаги

Что сделано (всё стабильно):
- ✅ Лендинг, каталог, страница курса, плеер уроков, квизы, прогресс, сертификаты (HTML), дашборд студента
- ✅ Авторизация (демо), админ-панель курсов и блога
- ✅ Редактор уроков с Quill (drag-drop, шаблоны, 8 видео-платформ, Prism)
- ✅ Редактор постов с тем же тулбаром
- ✅ Drag-and-drop порядка уроков, мультиязычность РУ/ҚАЗ/EN, авто-сохранение
- ✅ Экспорт/импорт курсов в JSON, дубликат
- ✅ Поиск в админке

Возможные направления развития (не сделано):
- 📋 Полноценный бэкенд (сейчас всё в localStorage — данные не синхронизируются между устройствами)
- 📋 Реальная аутентификация (сейчас пароли в открытом виде в localStorage)
- 📋 Загрузка картинок на CDN (сейчас base64 или внешние URL)
- 📋 Видео-плеер с прогрессом (сейчас iframe + placeholder)
- 📋 Бэйджи и геймификация
- 📋 Прокторинг для экзаменов
- 📋 Email-уведомления

## Когда что менять

| Хочу… | Меняю в… |
|---|---|
| Добавить курс | Через UI: `admin-edit.html`. Или вручную в `data.js` → `seedData.courses[]` + бамп `STORAGE_KEY` |
| Добавить пост | Через UI: `admin-post-edit.html`. Или в `data.js` → `seedData.posts[]` + бамп |
| Поменять название/цвет бренда | `index.html` (hero), `i18n.js` (тексты), `assets/css/styles.css` (`--brand-primary`, `gradient-hero`, `gradient-brand`) |
| Добавить язык | `i18n.js`: добавить ключ в `AVAILABLE_LANGS`, словарь, и `setLang` обработчик. + добавить кнопку в `renderLangSwitcher()` в `app.js` |
| Добавить категорию курса/поста | `i18n.js`: добавить `cat.X` ключ в 3 языках. Курсы используют `categoryKey`, посты — `categoryKey`. + список опций в редакторе |
| Добавить новую страницу | Скопируй `blog.html` как шаблон. Не забудь `<script>` теги в нужном порядке и `i18n.apply()` после рендера |
| Поменять иконку курса/категории | `assets/js/app.js` → `CoverIcons` и `Covers` |

## Полезные команды разработки

```bash
# Локальный сервер
python3 -m http.server 8000

# Поиск по проекту
grep -rn "TODO" --include="*.html" --include="*.js"

# Сброс БД пользователя (в консоли браузера)
localStorage.clear(); location.reload();

# Проверить, какая версия БД сохранена
Object.keys(localStorage).filter(k => k.startsWith('ustem_'))

# Re-extract symbol-only лого из полного PNG (если меняли logo-full.png)
python3 -c "
from PIL import Image
img = Image.open('assets/img/logo-full.png').convert('RGBA')
# ... (см. историю — там есть скрипт обрезки с очисткой белого фона)
"
```

## Что я (Claude) сделал недавно

Последние крупные изменения:
1. **Блог** — полноценный раздел: `blog.html` + `post.html` + админка (`admin-blog.html` + `admin-post-edit.html`). 5 категорий с эмодзи, мультиязычность, Featured-посты на главной
2. **Расширенный редактор Quill** — панель шаблонов, видео-парсер на 8 платформ, drag-drop, подсветка кода Prism.js, счётчик слов
3. **UX улучшения** — Esc закрывает модалку, Ctrl+S сохраняет, клик-снаружи закрывает, поиск в админке
4. **Карточки курсов в админке** — переделаны с таблицы на гибкие card-rows (action-кнопки больше не вылезают)
5. **Основатель** — Қуатов Даулет (правка по скрину от пользователя 19.06.2026)
6. **Версия БД:** v8 (на момент написания CLAUDE.md)

---

Если что-то непонятно — посмотри в существующих файлах, скорее всего там уже есть пример того, что нужно. Везде один паттерн: `Store.X → loc(field) → renderHeader/Card → i18n.apply()`.
