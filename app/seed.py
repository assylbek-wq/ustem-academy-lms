"""Стартовый контент и демо-данные.

seed_content() - каталог программ: «Основа USTEM» и FLL Future Edition «Старт» с уроками,
тестом, заданием и рубрикой; остальные направления как черновики для методистов.
seed_demo()    - то же + демо-пользователи, заказчик и когорта (только для показа и разработки).
"""
from __future__ import annotations

from datetime import date, datetime, timedelta

from .models import (Assignment, Cohort, Customer, Enrollment, Lesson, Level, Module, Program, QuizQuestion,
                     RubricCriterion, Session, User, UserRole, db, utcnow)


def ml(ru, kk, en):
    return {"ru": ru, "kk": kk, "en": en}


START = ml("Старт", "Старт", "Start")
DEMO_PASSWORD = "demo12345"

RUBRIC = [
    (ml("Цель урока понятна детям", "Сабақ мақсаты балаларға түсінікті", "Students understand the lesson goal"),
     [ml("1 - Цель не прозвучала", "1 - Мақсат айтылмады", "1 - Goal not stated"),
      ml("2 - Цель названа, но дети ее не повторят", "2 - Мақсат аталды, бірақ балалар қайталай алмайды", "2 - Goal stated but students could not repeat it"),
      ml("3 - Цель ясна, дети знают, что будут строить", "3 - Мақсат анық, балалар не құрастыратынын біледі", "3 - Goal is clear, students know what they will build"),
      ml("4 - Дети сами формулируют задачу и критерий успеха", "4 - Балалар тапсырма мен табыс критерийін өздері тұжырымдайды", "4 - Students state the task and success criteria themselves")]),
    (ml("Дети работают руками, а учитель направляет", "Балалар қолмен жұмыс істейді, мұғалім бағыттайды", "Students build while the teacher guides"),
     [ml("1 - Учитель собирает и показывает сам", "1 - Мұғалім өзі құрастырып көрсетеді", "1 - The teacher builds and demonstrates alone"),
      ml("2 - Дети повторяют за учителем шаг в шаг", "2 - Балалар мұғалімнің артынан қадам-қадам қайталайды", "2 - Students copy the teacher step by step"),
      ml("3 - Дети собирают в парах, учитель подходит с вопросами", "3 - Балалар жұппен құрастырады, мұғалім сұрақпен келеді", "3 - Students build in pairs, the teacher circulates with questions"),
      ml("4 - Дети пробуют свои решения и объясняют их", "4 - Балалар өз шешімдерін сынап, түсіндіреді", "4 - Students try their own solutions and explain them")]),
    (ml("Открытые вопросы и разбор ошибок", "Ашық сұрақтар және қателерді талдау", "Open questions and learning from mistakes"),
     [ml("1 - Вопросов почти нет", "1 - Сұрақ жоқтың қасы", "1 - Hardly any questions"),
      ml("2 - Вопросы только с ответом да или нет", "2 - Тек иә не жоқ жауабы бар сұрақтар", "2 - Only yes/no questions"),
      ml("3 - Есть вопросы «почему» и «что будет, если»", "3 - «Неге» және «егер... не болады» сұрақтары бар", "3 - Includes why and what-if questions"),
      ml("4 - Ошибки робота становятся поводом для эксперимента", "4 - Робот қателері тәжірибеге себеп болады", "4 - Robot mistakes become prompts for experiments")]),
    (ml("Командная работа и ценности FIRST", "Командалық жұмыс және FIRST құндылықтары", "Teamwork and FIRST Core Values"),
     [ml("1 - Роли в команде не распределены", "1 - Командада рөлдер бөлінбеген", "1 - No team roles"),
      ml("2 - Роли есть, но работает один ребенок", "2 - Рөлдер бар, бірақ бір бала жұмыс істейді", "2 - Roles exist but one child does the work"),
      ml("3 - Все дети участвуют и меняются ролями", "3 - Барлық бала қатысады және рөл ауыстырады", "3 - All children take part and rotate roles"),
      ml("4 - Дети поддерживают друг друга и празднуют успехи команды", "4 - Балалар бір-біріне қолдау көрсетіп, команда жетістігін тойлайды", "4 - Children support each other and celebrate team success")]),
    (ml("Рефлексия в конце урока", "Сабақ соңындағы рефлексия", "Reflection at the end"),
     [ml("1 - Урок обрывается без итога", "1 - Сабақ қорытындысыз аяқталады", "1 - The lesson ends abruptly"),
      ml("2 - Учитель сам подводит итог", "2 - Мұғалім өзі қорытындылайды", "2 - The teacher sums up alone"),
      ml("3 - Дети рассказывают, что получилось", "3 - Балалар не шыққанын айтады", "3 - Students share what worked"),
      ml("4 - Дети записывают выводы в инженерный дневник", "4 - Балалар қорытындыны инженерлік күнделікке жазады", "4 - Students record conclusions in an engineering notebook")]),
]

FLL_START = [
    (ml("Знакомство с FLL Future Edition", "FLL Future Edition-мен танысу", "Meet FLL Future Edition"), [
        ("text", ml("Что такое FLL Future Edition", "FLL Future Edition деген не", "What is FLL Future Edition"), ml(
            "## Новая платформа FIRST LEGO League\n\nС сезона 2026-27 FIRST LEGO League идет в двух редакциях:\n\n- **Founders Edition** - привычная программа на LEGO Education SPIKE. Последний сезон: 2027-28.\n- **Future Edition** - новая программа на наборах **LEGO Education Computer Science & AI** с беспроводными моторами, датчиками и пультом.\n\nНаборы Future Edition **несовместимы со SPIKE**, поэтому методику нужно осваивать заново.\n\n### Возрастные категории\n\n| Категория | Возраст | Формат |\n| --- | --- | --- |\n| Future Edition 5+ | 5-7 лет | исследование и сборка модели сезона |\n| Future Edition 8+ | 8-16 лет | игра на поле, проект, ценности |\n\n> Тема сезона 2026-27: **BIOGLOW**.\n\nВ этом модуле вы разберетесь, как устроен сезон и что нужно для первого урока.",
            "## FIRST LEGO League жаңа платформасы\n\n2026-27 маусымынан бастап FIRST LEGO League екі нұсқада өтеді:\n\n- **Founders Edition** - LEGO Education SPIKE негізіндегі таныс бағдарлама. Соңғы маусымы: 2027-28.\n- **Future Edition** - сымсыз моторлары, датчиктері және пульті бар **LEGO Education Computer Science & AI** жинақтарындағы жаңа бағдарлама.\n\nFuture Edition жинақтары **SPIKE-пен үйлеспейді**, сондықтан әдістемені қайта меңгеру керек.\n\n### Жас санаттары\n\n| Санат | Жасы | Формат |\n| --- | --- | --- |\n| Future Edition 5+ | 5-7 жас | зерттеу және маусым моделін құрастыру |\n| Future Edition 8+ | 8-16 жас | алаңдағы ойын, жоба, құндылықтар |\n\n> 2026-27 маусымының тақырыбы: **BIOGLOW**.\n\nБұл модульде маусымның құрылымын және алғашқы сабаққа не керек екенін түсінесіз.",
            "## The new FIRST LEGO League platform\n\nFrom the 2026-27 season FIRST LEGO League runs in two editions:\n\n- **Founders Edition** - the familiar program on LEGO Education SPIKE. Final season: 2027-28.\n- **Future Edition** - a new program on **LEGO Education Computer Science & AI** kits with wireless motors, sensors and a controller.\n\nFuture Edition kits are **not compatible with SPIKE**, so the teaching approach has to be learned again.\n\n### Divisions\n\n| Division | Age | Format |\n| --- | --- | --- |\n| Future Edition 5+ | 5-7 | explore and build the season model |\n| Future Edition 8+ | 8-16 | robot game, project, Core Values |\n\n> 2026-27 season theme: **BIOGLOW**.\n\nIn this module you will see how the season works and what you need for your first lesson."), 12),
        ("text", ml("Набор Computer Science & AI: что внутри", "Computer Science & AI жинағы: ішінде не бар", "The Computer Science & AI kit: what is inside"), ml(
            "## Разбираем набор перед уроком\n\nПеред первым занятием разложите набор на столе и проверьте:\n\n1. Беспроводные моторы и датчики заряжены.\n2. Пульт подключается к моторам.\n3. Детали рассортированы по лоткам: так дети тратят меньше времени на поиск.\n\n### Правила хранения\n\n- Один набор на 2-4 ребенка.\n- После урока каждая команда проверяет комплектность по фото лотка.\n- Электронику заряжаем после каждого занятия.\n\nСкачайте чек-лист подготовки набора в материалах урока.",
            "## Сабақ алдында жинақты талдаймыз\n\nАлғашқы сабақ алдында жинақты үстелге жайып, тексеріңіз:\n\n1. Сымсыз моторлар мен датчиктер зарядталған.\n2. Пульт моторларға қосылады.\n3. Бөлшектер науаларға сұрыпталған: балалар іздеуге аз уақыт жұмсайды.\n\n### Сақтау ережелері\n\n- 2-4 балаға бір жинақ.\n- Сабақтан кейін әр команда науа фотосы бойынша толықтығын тексереді.\n- Электрониканы әр сабақтан кейін зарядтаймыз.\n\nЖинақты дайындау чек-парағын сабақ материалдарынан жүктеңіз.",
            "## Check the kit before the lesson\n\nBefore your first session lay the kit out and check:\n\n1. Wireless motors and sensors are charged.\n2. The controller pairs with the motors.\n3. Parts are sorted into trays so children spend less time searching.\n\n### Storage rules\n\n- One kit per 2-4 children.\n- After the lesson each team checks completeness against a photo of the tray.\n- Charge the electronics after every session.\n\nDownload the kit preparation checklist from the lesson materials."), 10),
        ("quiz", ml("Проверка: устройство сезона", "Тексеру: маусым құрылымы", "Check: how the season works"), None, 5),
    ]),
    (ml("Первый урок с детьми", "Балалармен алғашқы сабақ", "Your first lesson with children"), [
        ("text", ml("Структура урока на 45 минут", "45 минуттық сабақ құрылымы", "A 45-minute lesson plan"), ml(
            "## Урок по схеме «Вовлечь - Собрать - Улучшить - Рассказать»\n\n| Этап | Время | Что делает учитель |\n| --- | --- | --- |\n| Вовлечь | 5 мин | История или проблема из темы сезона |\n| Собрать | 20 мин | Дети собирают модель в парах |\n| Улучшить | 10 мин | Вопрос «что будет, если...» и эксперимент |\n| Рассказать | 10 мин | Команды показывают, что получилось |\n\n### Типичные ошибки\n\n- Учитель собирает за детей. Лучше задать вопрос.\n- Нет времени на рассказ. Ставьте таймер.\n- Один ребенок делает все. Распределите роли: сборщик, программист, исследователь.",
            "## «Қызықтыру - Құрастыру - Жетілдіру - Айту» схемасы бойынша сабақ\n\n| Кезең | Уақыт | Мұғалім не істейді |\n| --- | --- | --- |\n| Қызықтыру | 5 мин | Маусым тақырыбынан әңгіме не мәселе |\n| Құрастыру | 20 мин | Балалар жұппен модель құрастырады |\n| Жетілдіру | 10 мин | «Егер... не болады» сұрағы және тәжірибе |\n| Айту | 10 мин | Командалар нәтижесін көрсетеді |\n\n### Жиі кездесетін қателер\n\n- Мұғалім балалардың орнына құрастырады. Сұрақ қойған дұрыс.\n- Айтуға уақыт жоқ. Таймер қойыңыз.\n- Бәрін бір бала жасайды. Рөлдерді бөліңіз: құрастырушы, бағдарламашы, зерттеуші.",
            "## The Engage - Build - Improve - Share lesson\n\n| Stage | Time | What the teacher does |\n| --- | --- | --- |\n| Engage | 5 min | A story or problem from the season theme |\n| Build | 20 min | Children build the model in pairs |\n| Improve | 10 min | A what-if question and an experiment |\n| Share | 10 min | Teams show what they made |\n\n### Common mistakes\n\n- The teacher builds for the children. Ask a question instead.\n- No time to share. Use a timer.\n- One child does everything. Assign roles: builder, coder, researcher."), 15),
        ("text", ml("Как снять свой урок для задания", "Тапсырма үшін сабақты қалай түсіру керек", "How to film your lesson for the assignment"), ml(
            "## Видео для наставника\n\n- Снимайте на телефон горизонтально, со штатива или стопки книг.\n- Нужен весь урок или фрагменты по 3-5 минут каждого этапа.\n- Следите, чтобы были слышны вопросы учителя и ответы детей.\n- Перед съемкой получите согласие родителей. Видео увидят только вы и наставник.\n\nЗагрузка работает с телефона и продолжается после обрыва связи.",
            "## Тәлімгерге арналған бейне\n\n- Телефонмен көлденеңінен, штативтен не кітаптардың үстінен түсіріңіз.\n- Бүкіл сабақ не әр кезеңнен 3-5 минуттық үзінділер керек.\n- Мұғалімнің сұрақтары мен балалардың жауаптары естілетініне назар аударыңыз.\n- Түсірер алдында ата-аналардың келісімін алыңыз. Бейнені тек сіз бен тәлімгер көреді.\n\nЖүктеу телефоннан жұмыс істейді және байланыс үзілгеннен кейін жалғасады.",
            "## Video for your mentor\n\n- Film on a phone in landscape, on a tripod or a stack of books.\n- Record the whole lesson or 3-5 minute clips of each stage.\n- Make sure the teacher's questions and children's answers are audible.\n- Get parental consent before filming. Only you and your mentor will see the video.\n\nUploading works from a phone and resumes after a dropped connection."), 8),
    ]),
]

QUIZ = [
    (ml("Какие наборы используются в FLL Future Edition?", "FLL Future Edition-де қандай жинақтар қолданылады?", "Which kits does FLL Future Edition use?"),
     [ml("LEGO Education SPIKE Prime", "LEGO Education SPIKE Prime", "LEGO Education SPIKE Prime"),
      ml("LEGO Education Computer Science & AI", "LEGO Education Computer Science & AI", "LEGO Education Computer Science & AI"),
      ml("LEGO Mindstorms EV3", "LEGO Mindstorms EV3", "LEGO Mindstorms EV3")], [1],
     ml("Future Edition работает на новых наборах Computer Science & AI и несовместима со SPIKE.", "Future Edition жаңа Computer Science & AI жинақтарында жұмыс істейді және SPIKE-пен үйлеспейді.", "Future Edition runs on the new Computer Science & AI kits and is not compatible with SPIKE.")),
    (ml("Сколько детей оптимально на один набор?", "Бір жинаққа неше бала оңтайлы?", "How many children per kit works best?"),
     [ml("1", "1", "1"), ml("2-4", "2-4", "2-4"), ml("8-10", "8-10", "8-10")], [1],
     ml("2-4 ребенка на набор: все заняты, и есть с кем обсудить решение.", "Бір жинаққа 2-4 бала: бәрі бос емес, шешімді талқылайтын адам бар.", "2-4 per kit keeps everyone busy and gives them someone to discuss ideas with.")),
    (ml("Что делать, если робот работает не так, как задумано?", "Робот ойлағандай жұмыс істемесе, не істеу керек?", "What should you do when the robot does not behave as planned?"),
     [ml("Сразу показать правильное решение", "Дұрыс шешімді бірден көрсету", "Show the correct solution right away"),
      ml("Спросить, что изменилось, и предложить эксперимент", "Не өзгергенін сұрап, тәжірибе ұсыну", "Ask what changed and suggest an experiment"),
      ml("Попросить детей начать сборку заново", "Балалардан құрастыруды қайта бастауды сұрау", "Ask the children to rebuild from scratch")], [1],
     ml("Ошибка робота - лучший повод для исследования. Помогайте вопросом, а не готовым ответом.", "Робот қатесі - зерттеуге ең жақсы себеп. Дайын жауаппен емес, сұрақпен көмектесіңіз.", "A robot mistake is the best reason to investigate. Help with a question, not an answer.")),
]

DRAFTS = [
    ("ftc", "ftc-start", ml("FIRST Tech Challenge", "FIRST Tech Challenge", "FIRST Tech Challenge"), "#e11d48",
     ml("Подготовка тренеров команд FTC: сборка шасси, Blocks и Java, стратегия сезона.", "FTC команда жаттықтырушыларын даярлау: шасси құрастыру, Blocks және Java, маусым стратегиясы.", "Training FTC team coaches: chassis building, Blocks and Java, season strategy.")),
    ("battle-bots", "battle-of-bots", ml("Battle of Bots", "Battle of Bots", "Battle of Bots"), "#f97316",
     ml("Проектирование боевых роботов в Fusion 360, 3D-печать Bambu Lab и электроника на ESP32.", "Fusion 360-та жауынгер роботтарды жобалау, Bambu Lab 3D-басып шығару және ESP32 электроникасы.", "Designing combat robots in Fusion 360, Bambu Lab 3D printing and ESP32 electronics.")),
    ("physical-ai", "physical-ai", ml("Physical AI", "Physical AI", "Physical AI"), "#7c3aed",
     ml("Роботы Unitree, ROS 2 и симуляция в Isaac Sim для преподавателей колледжей и вузов.", "Колледж және ЖОО оқытушыларына арналған Unitree роботтары, ROS 2 және Isaac Sim симуляциясы.", "Unitree robots, ROS 2 and Isaac Sim simulation for college and university instructors.")),
    ("drones", "alem-drone-league", ml("Alem Drone League", "Alem Drone League", "Alem Drone League"), "#0891b2",
     ml("Учебные дроны, безопасность полетов и подготовка команд к лиге.", "Оқу дрондары, ұшу қауіпсіздігі және командаларды лигаға дайындау.", "Training drones, flight safety and preparing teams for the league.")),
    ("wso", "wso-space", ml("WSO: ракеты, космос, спутники, роверы", "WSO: зымырандар, ғарыш, серіктер, роверлер", "WSO: rockets, space, satellites, rovers"), "#1e3a8a",
     ml("Модели ракет, наноспутники формата CanSat и роверы для World Space Olympiad.", "World Space Olympiad үшін зымыран модельдері, CanSat форматындағы наносерiктер және роверлер.", "Model rockets, CanSat-style nanosatellites and rovers for the World Space Olympiad.")),
    ("future-race", "future-race", ml("Future Race", "Future Race", "Future Race"), "#16a34a",
     ml("ИИ-машины с компьютерным зрением и цифровое производство.", "Компьютерлік көруі бар ЖИ-машиналар және цифрлық өндіріс.", "AI cars with computer vision and digital manufacturing.")),
    ("fll-challenge", "fll-challenge-founders", ml("FLL Challenge (Founders Edition)", "FLL Challenge (Founders Edition)", "FLL Challenge (Founders Edition)"), "#ca8a04",
     ml("Короткий курс для тренеров на SPIKE Prime до перехода на Future Edition (до 2028).", "Future Edition-ге көшкенге дейін SPIKE Prime жаттықтырушыларына арналған қысқа курс (2028-ге дейін).", "A short course for SPIKE Prime coaches until the move to Future Edition (through 2028).")),
    ("fll-explore", "fll-explore-founders", ml("FLL Explore (Founders Edition)", "FLL Explore (Founders Edition)", "FLL Explore (Founders Edition)"), "#65a30d",
     ml("Короткий курс на SPIKE Essential для младших школьников (до 2028).", "Бастауыш сынып оқушыларына арналған SPIKE Essential қысқа курсы (2028-ге дейін).", "A short SPIKE Essential course for younger students (through 2028).")),
]


def _program_fll() -> Program:
    p = Program(slug="fll-future-edition", direction="fll-future", status="published", version=1,
                published_at=utcnow(), color="#0085ff", position=1,
                title=ml("FLL Future Edition", "FLL Future Edition", "FLL Future Edition"),
                summary=ml("Подготовка тренеров FIRST LEGO League на новых наборах LEGO Education Computer Science & AI.",
                           "LEGO Education Computer Science & AI жаңа жинақтарында FIRST LEGO League жаттықтырушыларын даярлау.",
                           "Training FIRST LEGO League coaches on the new LEGO Education Computer Science & AI kits."),
                description=ml("С сезона 2026-27 FIRST LEGO League переходит на Future Edition. Программа помогает учителю уверенно провести первые уроки, вести кружок и подготовить команду к фестивалю.",
                               "2026-27 маусымынан бастап FIRST LEGO League Future Edition-ге көшеді. Бағдарлама мұғалімге алғашқы сабақтарды сенімді өткізуге, үйірме жүргізуге және команданы фестивальге дайындауға көмектеседі.",
                               "From the 2026-27 season FIRST LEGO League moves to Future Edition. This program helps teachers run their first lessons with confidence, lead a club and prepare a team for a festival."),
                audience=ml("- Учителя начальных и средних классов\n- Педагоги дополнительного образования\n- Тренеры, переходящие со SPIKE",
                            "- Бастауыш және орта сынып мұғалімдері\n- Қосымша білім беру педагогтері\n- SPIKE-тен көшетін жаттықтырушылар",
                            "- Primary and middle school teachers\n- After-school educators\n- Coaches moving from SPIKE"),
                equipment=ml("- LEGO Education Computer Science & AI 8+ или 11+\n- Набор сезона BIOGLOW\n- Планшет или ноутбук", "- LEGO Education Computer Science & AI 8+ не 11+\n- BIOGLOW маусым жинағы\n- Планшет не ноутбук", "- LEGO Education Computer Science & AI 8+ or 11+\n- BIOGLOW season set\n- A tablet or laptop"))
    db.session.add(p)
    db.session.flush()
    lv = Level(program_id=p.id, number=1, title=START, min_quiz_score=70, require_attendance=True,
               description=ml("Первые уроки на новой платформе", "Жаңа платформадағы алғашқы сабақтар", "First lessons on the new platform"),
               outcomes=ml("- Знает устройство сезона Future Edition\n- Готовит набор к уроку\n- Проводит урок на 45 минут по готовому плану",
                           "- Future Edition маусымының құрылымын біледі\n- Жинақты сабаққа дайындайды\n- Дайын жоспар бойынша 45 минуттық сабақ өткізеді",
                           "- Knows how a Future Edition season works\n- Prepares the kit for a lesson\n- Runs a 45-minute lesson from a ready plan"),
               duration=ml("4-6 недель", "4-6 апта", "4-6 weeks"))
    db.session.add(lv)
    db.session.flush()
    for mi, (mtitle, lessons) in enumerate(FLL_START):
        m = Module(level_id=lv.id, position=mi, title=mtitle)
        db.session.add(m)
        db.session.flush()
        for li, (kind, title, body, minutes) in enumerate(lessons):
            lesson = Lesson(module_id=m.id, position=li, kind=kind, title=title, body=body or {}, duration_min=minutes)
            db.session.add(lesson)
            db.session.flush()
            if kind == "quiz":
                for qi, (prompt, opts, correct, expl) in enumerate(QUIZ):
                    db.session.add(QuizQuestion(lesson_id=lesson.id, position=qi, prompt=prompt, options=opts,
                                                correct=correct, explanation=expl))
    a = Assignment(level_id=lv.id, position=0, evidence_kind="video", due_days=28, pass_min_level=2,
                   title=ml("Видео вашего первого урока", "Алғашқы сабағыңыздың бейнесі", "Video of your first lesson"),
                   description=ml("Проведите урок на 45 минут по схеме «Вовлечь - Собрать - Улучшить - Рассказать» в своем классе и загрузите видео.\n\nВ комментарии укажите класс, число детей и наборов, тему урока.",
                                  "Өз сыныбыңызда «Қызықтыру - Құрастыру - Жетілдіру - Айту» схемасы бойынша 45 минуттық сабақ өткізіп, бейнесін жүктеңіз.\n\nТүсініктемеде сыныпты, балалар мен жинақтар санын, сабақ тақырыбын көрсетіңіз.",
                                  "Teach a 45-minute Engage - Build - Improve - Share lesson in your class and upload the video.\n\nIn the note, add the grade, number of children and kits, and the lesson topic."))
    db.session.add(a)
    db.session.flush()
    for ci, (title, descriptors) in enumerate(RUBRIC):
        db.session.add(RubricCriterion(assignment_id=a.id, position=ci, title=title, descriptors=descriptors))
    return p


def _program_base() -> Program:
    p = Program(slug="ustem-foundations", direction="base", status="published", version=1, published_at=utcnow(),
                color="#11181c", position=0, self_paced=True, title=ml("Основа USTEM", "USTEM негізі", "USTEM Foundations"),
                summary=ml("Общий блок перед любым направлением: инженерный процесс, ценности FIRST, безопасность, рубрики, ИИ в уроке.",
                           "Кез келген бағыт алдындағы ортақ блок: инженерлік процесс, FIRST құндылықтары, қауіпсіздік, рубрикалар, сабақтағы ЖИ.",
                           "The shared block before any track: engineering process, FIRST Core Values, safety, rubrics, AI in lessons."))
    db.session.add(p)
    db.session.flush()
    lv = Level(program_id=p.id, number=1, title=START, require_attendance=False,
               duration=ml("1-2 недели", "1-2 апта", "1-2 weeks"))
    db.session.add(lv)
    db.session.flush()
    topics = [
        ml("Инженерный процесс и инженерный дневник", "Инженерлік процесс және инженерлік күнделік", "Engineering process and notebook"),
        ml("Ценности FIRST и командная работа", "FIRST құндылықтары және командалық жұмыс", "FIRST Core Values and teamwork"),
        ml("Безопасность: мастерская, 3D-печать, дроны, роботы", "Қауіпсіздік: шеберхана, 3D-басып шығару, дрондар, роботтар", "Safety: workshop, 3D printing, drones, robots"),
        ml("Оценивание по рубрикам и портфолио ученика", "Рубрика бойынша бағалау және оқушы портфолиосы", "Rubric assessment and student portfolios"),
        ml("ИИ в уроке", "Сабақтағы ЖИ", "AI in the lesson"),
        ml("Работа с родителями и набор группы", "Ата-аналармен жұмыс және топ жинау", "Working with parents and recruiting a group"),
    ]
    m = Module(level_id=lv.id, position=0, title=ml("Модули основы", "Негіз модульдері", "Foundation modules"))
    db.session.add(m)
    db.session.flush()
    for i, title in enumerate(topics):
        db.session.add(Lesson(module_id=m.id, position=i, kind="text", title=title, duration_min=15,
                              body=ml("Материал урока готовит методист.", "Сабақ материалын әдіскер дайындайды.", "The curriculum designer is preparing this lesson.")))
    return p


def seed_content() -> None:
    if Program.query.first():
        return
    _program_base()
    _program_fll()
    for i, (direction, slug, title, color, summary) in enumerate(DRAFTS, start=2):
        p = Program(slug=slug, direction=direction, title=title, summary=summary, color=color, position=i, status="draft")
        db.session.add(p)
        db.session.flush()
        db.session.add(Level(program_id=p.id, number=1, title=START))
    db.session.commit()


def _user(email, name, roles=(), org=None, customer=None) -> User:
    u = User.query.filter_by(email=email).first()
    if not u:
        u = User(email=email, full_name=name, organization=org, city="Алматы", consent_at=utcnow())
        u.set_password(DEMO_PASSWORD)
        db.session.add(u)
        for r in roles:
            u.roles.append(UserRole(role=r, customer=customer if r == "customer" else None))
    return u


def seed_demo(force: bool = False) -> None:
    if User.query.filter_by(email="admin@academy.demo").first() and not force:
        return
    seed_content()
    customer = Customer.query.filter_by(name="Демо: управление образования").first() or Customer(
        name="Демо: управление образования", kind="edu_dept", contact_name="Демо Заказчик")
    db.session.add(customer)
    db.session.flush()
    _user("admin@academy.demo", "Админ Академии", ["admin"])
    _user("methodist@academy.demo", "Айгерим Методист", ["methodist"])
    trainer = _user("trainer@academy.demo", "Ерлан Тренер", ["trainer", "mentor"])
    mentor = _user("mentor@academy.demo", "Динара Наставник", ["mentor"])
    _user("customer@academy.demo", "Представитель Заказчика", ["customer"], customer=customer)
    learners = [_user(f"teacher{i}@academy.demo", name, org=org) for i, (name, org) in enumerate([
        ("Асель Нурланова", "Школа-гимназия № 12"), ("Тимур Ахметов", "Лицей № 165"),
        ("Сауле Бекова", "Школа № 54")], start=1)]
    db.session.flush()
    lv = Level.query.join(Program).filter(Program.slug == "fll-future-edition", Level.number == 1).first()
    cohort = Cohort.query.filter_by(name="Демо: Алматы, FLL Future Edition").first()
    if not cohort:
        start = date.today() - timedelta(days=7)
        cohort = Cohort(name="Демо: Алматы, FLL Future Edition", program_id=lv.program_id, level_id=lv.id,
                        program_version=lv.program.version, customer_id=customer.id, trainer_id=trainer.id,
                        language="ru", city="Алматы", start_date=start, end_date=start + timedelta(days=42),
                        status="active", is_open=True, capacity=25)
        db.session.add(cohort)
        db.session.flush()
        day = datetime.combine(date.today() + timedelta(days=5), datetime.min.time())
        db.session.add(Session(cohort_id=cohort.id, title="Очный интенсив, день 1", kind="intensive",
                               starts_at=day.replace(hour=10), ends_at=day.replace(hour=17),
                               location="Алматы, USTEM Lab", notes="Ноутбук, зарядка для телефона"))
        for i, u in enumerate(learners):
            db.session.add(Enrollment(cohort_id=cohort.id, user_id=u.id, mentor_id=mentor.id if i < 2 else trainer.id))
    db.session.commit()
