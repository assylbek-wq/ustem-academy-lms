"""Путь сезона: этапы и шаги для FLL Challenge и FTC.

Шаг бывает четырех видов:
- connect: засчитывается сам по данным USTEM Connect (команда, заявки, приезд, места, награды), правило в `rule`;
- sim: задание симулятора прошло автопроверку (`preset`);
- course: получен сертификат уровня курса Академии (`course`, `level`);
- self: тренер отмечает сам, по желанию с фото (`photo`).
Опыт за connect и self начисляется за шаг; за sim и course - за сам факт (задание, сертификат), см. services/game.py.
"""
from __future__ import annotations


def ml(ru: str, kk: str, en: str) -> dict:
    return {"ru": ru, "kk": kk, "en": en}


def connect(code, xp, title, hint, rule, **kw):
    return {"code": code, "kind": "connect", "xp": xp, "title": title, "hint": hint, "rule": rule, **kw}


def sim(preset, title):
    return {"code": f"sim-{preset}", "kind": "sim", "preset": preset, "title": title}


def course(slug, level, title):
    return {"code": f"course-{slug}-{level}", "kind": "course", "course": slug, "level": level, "title": title}


def self_step(code, xp, title, hint, photo=False):
    return {"code": code, "kind": "self", "xp": xp, "title": title, "hint": hint, "photo": photo}


# ─── Общие шаги, которые засчитывает USTEM Connect ───────────────────────
LINK = connect("connect", 100, ml("Подключить USTEM Connect", "USTEM Connect қосу", "Connect USTEM Connect"),
               ml("Дальше шаги про команду и турниры отметятся сами.", "Әрі қарай команда мен турнир қадамдары өзі белгіленеді.",
                  "Team and tournament steps will then be checked automatically."), "linked")


def team_steps(roster_min: int, roster_max: int) -> list[dict]:
    return [
        connect("team", 150, ml("Создать команду в Connect", "Connect-те команда құру", "Create a team in Connect"),
                ml("Кабинет тренера в Connect: «Новая команда».", "Connect-тегі жаттықтырушы кабинеті: «Жаңа команда».",
                   "Coach cabinet in Connect: New team."), "team"),
        connect("roster", 150, ml(f"Собрать состав: {roster_min}-{roster_max} учеников", f"Құрам жинау: {roster_min}-{roster_max} оқушы",
                                  f"Build the roster: {roster_min}-{roster_max} students"),
                ml("И согласия родителей у всех учеников.", "Барлық оқушының ата-ана келісімі де.", "Plus parent consent for every student."),
                "roster", min=roster_min, max=roster_max),
        connect("registered", 200, ml("Зарегистрировать команду на сезон", "Команданы маусымға тіркеу", "Register the team for the season"),
                ml("Статус команды в Connect: зарегистрирована.", "Connect-тегі мәртебе: тіркелген.", "Team status in Connect: registered."),
                "registered"),
    ]


def tournament_stages() -> list[dict]:
    return [
        {"code": "qualifier", "icon": "flag-race", "title": ml("Отборочный этап", "Іріктеу кезеңі", "Qualifier"),
         "steps": [
             connect("qual-approved", 200, ml("Заявка на отборочный одобрена", "Іріктеуге өтінім мақұлданды", "Qualifier application approved"),
                     ml("Региональный или отборочный турнир в Connect.", "Connect-тегі өңірлік не іріктеу турнирі.", "A regional or qualifier event in Connect."),
                     "approved", kinds=["qualifier", "regional"]),
             connect("qual-played", 300, ml("Выступили на отборочном", "Іріктеуде өнер көрсеттік", "Competed at a qualifier"),
                     ml("Команду отметили на регистрации в день турнира.", "Турнир күні команда тіркеуде белгіленді.", "The team was checked in on event day."),
                     "played", kinds=["qualifier", "regional"]),
             connect("award", 500, ml("Получили награду", "Марапат алдық", "Won an award"),
                     ml("Любая награда команды на любом турнире.", "Кез келген турнирдегі кез келген марапат.", "Any team award at any event."), "award"),
             connect("advanced", 700, ml("Прошли на следующий этап", "Келесі кезеңге өттік", "Advanced to the next stage"),
                     ml("Отметка «проходит дальше» в итогах турнира.", "Турнир қорытындысындағы «әрі қарай өтеді» белгісі.",
                        "Marked as advancing in the event results."), "advanced"),
         ]},
        {"code": "national", "icon": "podium", "title": ml("Национальный чемпионат", "Ұлттық чемпионат", "National championship"),
         "steps": [
             connect("nat-approved", 300, ml("Приглашение на национальный", "Ұлттық чемпионатқа шақыру", "Invited to the national"),
                     ml("Заявка на национальный чемпионат одобрена.", "Ұлттық чемпионатқа өтінім мақұлданды.", "National application approved."),
                     "approved", kinds=["national"]),
             connect("nat-played", 500, ml("Выступили на национальном", "Ұлттық чемпионатта өнер көрсеттік", "Competed at the national"),
                     ml("Команду отметили на регистрации.", "Команда тіркеуде белгіленді.", "The team was checked in."), "played", kinds=["national"]),
             connect("nat-award", 800, ml("Награда национального чемпионата", "Ұлттық чемпионат марапаты", "National championship award"),
                     ml("Награда на национальном чемпионате.", "Ұлттық чемпионаттағы марапат.", "An award at the national championship."),
                     "award", kinds=["national"]),
         ]},
        {"code": "world", "icon": "globe", "title": ml("Международный этап", "Халықаралық кезең", "International stage"),
         "steps": [
             connect("world", 1500, ml("Едем на международный турнир", "Халықаралық турнирге барамыз", "Going to an international event"),
                     ml("Заявка на международное мероприятие одобрена.", "Халықаралық іс-шараға өтінім мақұлданды.",
                        "International event application approved."), "approved", kinds=["international"]),
         ]},
    ]


SCRIMMAGE = connect("scrimmage", 250, ml("Сыграли на тренировочном турнире", "Жаттығу турнирінде ойнадық", "Played a scrimmage"),
                    ml("Скримэдж, тренировочный или межсезонный турнир в Connect.", "Connect-тегі скримэдж, жаттығу не маусымаралық турнир.",
                       "A scrimmage, training or off-season event in Connect."), "played", kinds=["scrimmage", "training", "offseason"])

TRACKS: dict[str, dict] = {
    "fll": {
        "code": "fll", "program": "FLL_CHALLENGE", "color": "#e5322d", "glow": "#ff6b5e",
        "title": ml("FIRST LEGO League Challenge", "FIRST LEGO League Challenge", "FIRST LEGO League Challenge"),
        "season": ml("Сезон BIOGLOW 2026-2027", "BIOGLOW 2026-2027 маусымы", "BIOGLOW 2026-2027 season"),
        "course": "spike-prime-fll", "sim_url": "/lab/spike?preset=",
        "stages": [
            {"code": "start", "icon": "flag", "title": ml("Старт сезона", "Маусым басы", "Season start"), "steps": [
                LINK,
                course("spike-prime-fll", 1, ml("Уровень 1 курса «SPIKE Prime для FLL»", "«FLL үшін SPIKE Prime» курсының 1-деңгейі",
                                                "Level 1 of SPIKE Prime for FLL")),
                self_step("rules", 30, ml("Прочитать правила игры BIOGLOW", "BIOGLOW ойын ережелерін оқу", "Read the BIOGLOW game rules"),
                          ml("Robot Game Rulebook и описание миссий сезона.", "Robot Game Rulebook және маусым миссиялары.",
                             "The Robot Game Rulebook and season missions.")),
            ]},
            {"code": "team", "icon": "team", "title": ml("Команда", "Команда", "Team"), "steps": team_steps(2, 10)},
            {"code": "kit", "icon": "box", "title": ml("Оборудование", "Жабдық", "Equipment"), "steps": [
                self_step("kit", 50, ml("Набор SPIKE Prime и набор поля сезона", "SPIKE Prime жиынтығы және маусым алаңы",
                                        "SPIKE Prime set and the season field kit"),
                          ml("Сфотографируйте наборы, когда они у вас.", "Жиынтықтар қолыңызға тигенде суретке түсіріңіз.",
                             "Take a photo once you have the sets."), photo=True),
                self_step("field", 50, ml("Собрали поле и модели миссий", "Алаң мен миссия модельдерін жинадық", "Field and mission models built"),
                          ml("Стол, мат и все модели миссий на своих местах.", "Үстел, төсеніш және барлық миссия модельдері орнында.",
                             "Table, mat and every mission model in place."), photo=True),
                self_step("app", 30, ml("Приложение SPIKE и обновленные хабы", "SPIKE қосымшасы және жаңартылған хабтар", "SPIKE app and updated hubs"),
                          ml("Хабы заряжены и обновлены, у каждого свое имя.", "Хабтар зарядталған, жаңартылған, әрқайсысының аты бар.",
                             "Hubs charged, updated and named.")),
            ]},
            {"code": "robot", "icon": "robot", "title": ml("Робот", "Робот", "Robot"), "steps": [
                sim("spike-first", ml("Симулятор: первая программа", "Симулятор: алғашқы бағдарлама", "Simulator: first program")),
                sim("spike-ruler", ml("Симулятор: ровно 50 см", "Симулятор: дәл 50 см", "Simulator: exactly 50 cm")),
                sim("spike-gyro", ml("Симулятор: поворот по гироскопу", "Симулятор: гироскоппен бұрылу", "Simulator: gyro turn")),
                self_step("base", 50, ml("Собрали приводную базу", "Жетек базасын жинадық", "Drive base built"),
                          ml("Робот едет прямо на 1 метр с ошибкой меньше 2 см.", "Робот 1 метр түзу жүреді, қатесі 2 см-ден аз.",
                             "The robot drives 1 m straight within 2 cm."), photo=True),
                course("spike-prime-fll", 2, ml("Уровень 2 курса: робот для FLL", "Курстың 2-деңгейі: FLL роботы", "Course level 2: an FLL robot")),
            ]},
            {"code": "missions", "icon": "code", "title": ml("Миссии и код", "Миссиялар мен код", "Missions and code"), "steps": [
                sim("spike-line", ml("Симулятор: езда по линии", "Симулятор: сызық бойымен жүру", "Simulator: line following")),
                sim("spike-square", ml("Симулятор: выравнивание по линии", "Симулятор: сызыққа түзелу", "Simulator: squaring on a line")),
                sim("spike-wall", ml("Симулятор: выравнивание о стену", "Симулятор: қабырғаға түзелу", "Simulator: wall squaring")),
                sim("spike-menu", ml("Симулятор: программа на весь матч", "Симулятор: бүкіл матчқа бағдарлама", "Simulator: a whole-match program")),
                course("spike-prime-fll", 3, ml("Уровень 3 курса: точная езда", "Курстың 3-деңгейі: дәл жүру", "Course level 3: precise driving")),
                self_step("run", 50, ml("Первый полный прогон за 2:30", "2:30 ішінде алғашқы толық жүгіріс", "First full 2:30 run"),
                          ml("Все запуски подряд, с таймером, как на турнире.", "Барлық іске қосу қатарынан, таймермен, турнирдегідей.",
                             "All runs back to back with a timer, like at an event."), photo=True),
            ]},
            {"code": "project", "icon": "bulb", "title": ml("Проект и ценности", "Жоба және құндылықтар", "Project and Core Values"), "steps": [
                self_step("problem", 40, ml("Выбрали проблему для проекта", "Жобаға мәселе таңдадық", "Picked a project problem"),
                          ml("Проблема по теме сезона, понятная в одном предложении.", "Маусым тақырыбындағы, бір сөйлеммен түсінікті мәселе.",
                             "A season-themed problem explained in one sentence.")),
                self_step("expert", 60, ml("Встретились с экспертом", "Сарапшымен кездестік", "Met an expert"),
                          ml("Фото встречи или звонка с профессионалом.", "Маманмен кездесу не қоңырау суреті.", "A photo of the meeting or call."), photo=True),
                self_step("pitch", 60, ml("Презентация проекта на 5 минут", "5 минуттық жоба таныстырылымы", "A 5-minute project presentation"),
                          ml("Команда рассказала ее родителям или классу.", "Команда оны ата-аналарға не сыныпқа айтып берді.",
                             "The team presented it to parents or a class."), photo=True),
                self_step("values", 40, ml("Core Values: как команда работает вместе", "Core Values: команда қалай бірге жұмыс істейді",
                                           "Core Values: how the team works together"),
                          ml("Плакат или рассказ с примерами из сезона.", "Маусымнан мысалдары бар плакат не әңгіме.", "A poster or story with season examples.")),
            ]},
            {"code": "practice", "icon": "swords", "title": ml("Тренировочные матчи", "Жаттығу матчтары", "Practice matches"), "steps": [
                SCRIMMAGE,
                self_step("mock-judging", 50, ml("Пробное судейство", "Сынақ төрешілік", "Mock judging"),
                          ml("Коллега или родитель задает вопросы как судья Robot Design и проекта.",
                             "Әріптес не ата-ана Robot Design және жоба төрешісі сияқты сұрақ қояды.",
                             "A colleague or parent asks questions like a Robot Design and project judge.")),
            ]},
            *tournament_stages(),
        ],
    },
    "ftc": {
        "code": "ftc", "program": "FTC", "color": "#f27c1c", "glow": "#ffad5c",
        "title": ml("FIRST Tech Challenge", "FIRST Tech Challenge", "FIRST Tech Challenge"),
        "season": ml("Сезон BIOBUZZ 2026-2027", "BIOBUZZ 2026-2027 маусымы", "BIOBUZZ 2026-2027 season"),
        "course": "ftc-start-2026", "sim_url": "/lab/ftc?preset=",
        "stages": [
            {"code": "start", "icon": "flag", "title": ml("Старт сезона", "Маусым басы", "Season start"), "steps": [
                LINK,
                course("ftc-start-2026", 1, ml("Уровень 1 курса «FTC с нуля»", "«FTC нөлден» курсының 1-деңгейі", "Level 1 of FTC from Scratch")),
                self_step("rules", 30, ml("Прочитать Competition Manual BIOBUZZ", "BIOBUZZ Competition Manual оқу", "Read the BIOBUZZ Competition Manual"),
                          ml("Разделы про игру, робота и награды.", "Ойын, робот және марапаттар бөлімдері.", "The game, robot and award sections.")),
            ]},
            {"code": "team", "icon": "team", "title": ml("Команда", "Команда", "Team"), "steps": [
                *team_steps(2, 15),
                connect("number", 100, ml("Номер команды FIRST", "FIRST команда нөмірі", "FIRST team number"),
                        ml("Команда зарегистрирована на сайте FIRST, номер внесен в Connect.", "Команда FIRST сайтында тіркелген, нөмір Connect-ке енгізілген.",
                           "Registered with FIRST, the number is in Connect."), "number"),
            ]},
            {"code": "kit", "icon": "box", "title": ml("Оборудование", "Жабдық", "Equipment"), "steps": [
                self_step("kit", 50, ml("Control Hub, моторы и набор деталей", "Control Hub, моторлар және бөлшектер жиынтығы", "Control Hub, motors and a parts kit"),
                          ml("Сфотографируйте, когда набор у вас.", "Жиынтық қолыңызға тигенде суретке түсіріңіз.", "Take a photo once you have the kit."), photo=True),
                self_step("field", 50, ml("Поле: плитки и элементы сезона", "Алаң: плиталар және маусым элементтері", "Field: tiles and season elements"),
                          ml("Хотя бы четверть поля для тренировок.", "Жаттығуға кемінде алаңның төрттен бірі.", "At least a quarter field for practice."), photo=True),
                self_step("driver", 30, ml("Driver Hub и геймпады", "Driver Hub және геймпадтар", "Driver Hub and gamepads"),
                          ml("Driver Hub и Control Hub обновлены и спарены.", "Driver Hub пен Control Hub жаңартылған және жұптастырылған.",
                             "Driver Hub and Control Hub updated and paired.")),
            ]},
            {"code": "robot", "icon": "robot", "title": ml("Робот", "Робот", "Robot"), "steps": [
                sim("ftc-builder", ml("Симулятор: собрать шасси", "Симулятор: шассиді жинау", "Simulator: build a chassis")),
                sim("ftc-config", ml("Симулятор: конфигурация портов", "Симулятор: порттар конфигурациясы", "Simulator: port configuration")),
                sim("ftc-first-teleop", ml("Симулятор: первый TeleOp", "Симулятор: алғашқы TeleOp", "Simulator: first TeleOp")),
                self_step("drivetrain", 50, ml("Собрали шасси и проехали на геймпаде", "Шассиді жинап, геймпадпен жүрдік", "Chassis built and driven with a gamepad"),
                          ml("Фото или видео первой езды.", "Алғашқы жүрістің суреті не бейнесі.", "A photo or video of the first drive."), photo=True),
                course("ftc-start-2026", 2, ml("Уровень 2 курса: электроника и первая программа", "Курстың 2-деңгейі: электроника және алғашқы бағдарлама",
                                               "Course level 2: electronics and first program")),
            ]},
            {"code": "code", "icon": "code", "title": ml("Механизмы и код", "Механизмдер мен код", "Mechanisms and code"), "steps": [
                sim("ftc-encoder", ml("Симулятор: езда по энкодерам", "Симулятор: энкодермен жүру", "Simulator: encoder driving")),
                sim("ftc-imu", ml("Симулятор: поворот по IMU", "Симулятор: IMU бойынша бұрылу", "Simulator: IMU turn")),
                sim("ftc-mecanum", ml("Симулятор: меканум", "Симулятор: меканум", "Simulator: mecanum")),
                sim("ftc-mechanisms", ml("Симулятор: механизмы", "Симулятор: механизмдер", "Simulator: mechanisms")),
                sim("ftc-auto", ml("Симулятор: автономка", "Симулятор: автономды кезең", "Simulator: autonomous")),
                sim("ftc-match", ml("Симулятор: полный матч", "Симулятор: толық матч", "Simulator: full match")),
                course("ftc-start-2026", 3, ml("Уровень 3 курса: механика", "Курстың 3-деңгейі: механика", "Course level 3: mechanics")),
                course("ftc-start-2026", 4, ml("Уровень 4 курса: программирование", "Курстың 4-деңгейі: бағдарламалау", "Course level 4: programming")),
            ]},
            {"code": "portfolio", "icon": "bulb", "title": ml("Портфолио и outreach", "Портфолио және outreach", "Portfolio and outreach"), "steps": [
                self_step("notebook", 40, ml("Начали инженерное портфолио", "Инженерлік портфолио бастадық", "Started the engineering portfolio"),
                          ml("Первые страницы: цели, команда, стратегия.", "Алғашқы беттер: мақсат, команда, стратегия.", "First pages: goals, team, strategy."), photo=True),
                self_step("outreach", 60, ml("Провели outreach-событие", "Outreach-іс-шара өткіздік", "Ran an outreach event"),
                          ml("Показали робота школе, детям или на выставке.", "Роботты мектепке, балаларға не көрмеде көрсеттік.",
                             "Showed the robot at a school, to kids or at an expo."), photo=True),
                self_step("sponsor", 60, ml("Нашли партнера команды", "Команда серіктесін таптық", "Found a team partner"),
                          ml("Компания, вуз или фонд помогает деньгами, местом или менторами.", "Компания, ЖОО не қор ақшамен, орынмен не тәлімгерлермен көмектеседі.",
                             "A company, university or foundation helps with money, space or mentors.")),
            ]},
            {"code": "practice", "icon": "swords", "title": ml("Тренировочные матчи", "Жаттығу матчтары", "Practice matches"), "steps": [
                SCRIMMAGE,
                self_step("drive-practice", 50, ml("10 часов практики пилотов", "Пилоттардың 10 сағат жаттығуы", "10 hours of driver practice"),
                          ml("Журнал тренировок пилотов и лучшие очки матча.", "Пилоттар жаттығу журналы және матчтың үздік ұпайы.",
                             "A driver practice log and the best match score.")),
            ]},
            *tournament_stages(),
        ],
    },
}

WSO = {
    "code": "wso", "programs": ["WSO"], "color": "#2563eb",
    "title": ml("World Space Olympiad", "World Space Olympiad", "World Space Olympiad"),
    "season": ml("Олимпиада 2026-2027", "Олимпиада 2026-2027", "Olympiad 2026-2027"),
    "stages": [
        {"code": "start", "icon": "flag", "title": ml("Старт", "Басы", "Start"), "steps": [
            LINK,
            self_step("rules", 30, ml("Прочитать регламент олимпиады", "Олимпиада регламентін оқу", "Read the olympiad rules"),
                      ml("Этапы, сроки, лист оценки и список материалов.", "Кезеңдер, мерзімдер, бағалау парағы және материалдар тізімі.",
                         "Stages, deadlines, the score sheet and the materials list.")),
            self_step("category", 30, ml("Выбрать категорию", "Санатты таңдау", "Choose a category"),
                      ml("CanSat, CubeSat, Rovers, Inventors или Outer Worlds.", "CanSat, CubeSat, Rovers, Inventors не Outer Worlds.",
                         "CanSat, CubeSat, Rovers, Inventors or Outer Worlds.")),
        ]},
        {"code": "team", "icon": "team", "title": ml("Команда", "Команда", "Team"), "steps": [
            connect("team", 150, ml("Команда в USTEM Connect", "USTEM Connect-тегі команда", "Team in USTEM Connect"),
                    ml("Капитан или тренер создает команду в категории WSO и собирает состав.", "Капитан не жаттықтырушы WSO санатында команда құрып, құрамды жинайды.",
                       "The captain or coach creates a team in a WSO category and builds the roster."), "team"),
            connect("approved", 200, ml("Заявка на олимпиаду одобрена", "Олимпиадаға өтінім мақұлданды", "Olympiad application approved"),
                    ml("Команда попала в возрастную группу и допущена.", "Команда жас тобына кіріп, жіберілді.", "The team fits an age group and is admitted."),
                    "approved"),
        ]},
        {"code": "project", "icon": "bulb", "title": ml("Проект", "Жоба", "Project"), "steps": [
            self_step("idea", 40, ml("Идея и план работ", "Идея және жұмыс жоспары", "Idea and work plan"),
                      ml("Цель миссии, роли в команде и график до отбора.", "Миссия мақсаты, командадағы рөлдер және іріктеуге дейінгі кесте.",
                         "Mission goal, team roles and a schedule to the selection.")),
            self_step("prototype", 60, ml("Первый прототип", "Алғашқы прототип", "First prototype"),
                      ml("Фото прототипа или схемы.", "Прототиптің не сызбаның суреті.", "A photo of the prototype or diagram."), photo=True),
            self_step("test", 60, ml("Испытания и замеры", "Сынақтар мен өлшеулер", "Tests and measurements"),
                      ml("Таблица результатов испытаний.", "Сынақ нәтижелерінің кестесі.", "A table of test results."), photo=True),
        ]},
        {"code": "selection", "icon": "code", "title": ml("Отбор", "Іріктеу", "Selection"), "steps": [
            self_step("sel-sent", 80, ml("Материалы отбора сданы", "Іріктеу материалдары тапсырылды", "Selection materials submitted"),
                      ml("Команда загрузила файлы в кабинете Connect, раздел «Этапы олимпиады».", "Команда файлдарды Connect кабинетіндегі «Олимпиада кезеңдері» бөліміне жүктеді.",
                         "The team uploaded files in Connect, section Olympiad stages.")),
            self_step("precheck", 80, ml("Предварительная проверка пройдена", "Алдын ала тексеру өтті", "Preliminary check passed"),
                      ml("Команду допустили к следующему этапу.", "Команда келесі кезеңге жіберілді.", "The team was admitted to the next stage.")),
        ]},
        {"code": "final", "icon": "podium", "title": ml("Финал", "Финал", "Final"), "steps": [
            connect("played", 400, ml("Выступили в финале", "Финалда өнер көрсеттік", "Competed in the final"),
                    ml("Команду отметили на регистрации в день финала.", "Финал күні команда тіркеуде белгіленді.", "The team was checked in on the final day."),
                    "played"),
            self_step("stand", 60, ml("Защита у стенда", "Стенд жанындағы қорғау", "Stand presentation"),
                      ml("Фото команды на защите.", "Қорғаудағы команда суреті.", "A photo of the team presenting."), photo=True),
        ]},
        {"code": "results", "icon": "trophy", "title": ml("Итоги", "Қорытынды", "Results"), "steps": [
            connect("award", 600, ml("Награда олимпиады", "Олимпиада марапаты", "Olympiad award"),
                    ml("Место, награда категории или Impact Award.", "Орын, санат марапаты не Impact Award.", "A place, category award or Impact Award."), "award"),
            connect("advanced", 800, ml("Прошли на следующий уровень", "Келесі деңгейге өттік", "Advanced to the next level"),
                    ml("Отметка «проходит дальше» в итогах.", "Қорытындыдағы «әрі қарай өтеді» белгісі.", "Marked as advancing in the results."), "advanced"),
        ]},
    ],
}

def _cubesat(preset, ru, kk, en):
    return sim(preset, ml("Симулятор: " + ru, "Симулятор: " + kk, "Simulator: " + en))


# CubeSat 1U: регламент WSO, глава 13 (масса до 800 г, своя наземная станция, полет на привязном аэростате)
WSO_CUBESAT = {
    "code": "wso-cubesat", "programs": ["WSO_CUBESAT"], "color": "#1e40af",
    "title": ml("WSO: CubeSat 1U", "WSO: CubeSat 1U", "WSO: CubeSat 1U"),
    "season": ml("Олимпиада 2026-2027, категория CubeSat", "Олимпиада 2026-2027, CubeSat санаты", "Olympiad 2026-2027, CubeSat category"),
    "sim_url": "/lab/cubesat?preset=",
    "stages": [
        {"code": "start", "icon": "flag", "title": ml("Старт", "Басы", "Start"), "steps": [
            LINK,
            self_step("rules", 30, ml("Прочитать главу CubeSat в регламенте", "Регламенттегі CubeSat тарауын оқу", "Read the CubeSat chapter of the rules"),
                      ml("Требования 1U, предстартовая проверка и лист оценки финала.", "1U талаптары, ұшу алдындағы тексеру және финалдың бағалау парағы.",
                         "1U requirements, pre-launch inspection and the final score sheet.")),
            _cubesat("cubesat-build", "соберите CubeSat 1U", "CubeSat 1U құрастырыңыз", "build a CubeSat 1U"),
        ]},
        {"code": "team", "icon": "team", "title": ml("Команда", "Команда", "Team"), "steps": [
            connect("team", 150, ml("Команда CubeSat в USTEM Connect", "USTEM Connect-тегі CubeSat командасы", "CubeSat team in USTEM Connect"),
                    ml("Тренер создает команду в категории CubeSat и собирает состав.", "Жаттықтырушы CubeSat санатында команда құрып, құрамды жинайды.",
                       "The coach creates a team in the CubeSat category and builds the roster."), "team"),
            connect("approved", 200, ml("Заявка на олимпиаду одобрена", "Олимпиадаға өтінім мақұлданды", "Olympiad application approved"),
                    ml("Команда попала в возрастную группу и допущена.", "Команда жас тобына кіріп, жіберілді.", "The team fits an age group and is admitted."),
                    "approved"),
        ]},
        {"code": "design", "icon": "chip", "title": ml("Проект спутника", "Серік жобасы", "Satellite design"), "steps": [
            self_step("mission", 40, ml("Миссия и полезная нагрузка", "Миссия және пайдалы жүктеме", "Mission and payload"),
                      ml("Что спутник измеряет в полете и зачем.", "Серік ұшуда нені және не үшін өлшейді.", "What the satellite measures in flight and why.")),
            _cubesat("cubesat-budget", "бюджеты массы и энергии", "масса мен энергия бюджеттері", "mass and power budgets"),
            _cubesat("cubesat-link", "бюджет радиолинии", "радиожелі бюджеті", "radio link budget"),
            self_step("parts", 60, ml("Закупили компоненты", "Компоненттер сатып алынды", "Components purchased"),
                      ml("Фото компонентов: компьютер, радио, датчики, аккумулятор с защитой.", "Компоненттер суреті: компьютер, радио, датчиктер, қорғалған аккумулятор.",
                         "Photo of the parts: computer, radio, sensors, protected battery."), photo=True),
        ]},
        {"code": "software", "icon": "code", "title": ml("Бортовая программа", "Борттық бағдарлама", "Flight software"), "steps": [
            _cubesat("cubesat-telemetry", "первая телеметрия", "алғашқы телеметрия", "first telemetry"),
            _cubesat("cubesat-sd", "запись на борт и сверка", "бортқа жазу және салыстыру", "on-board log and match"),
            _cubesat("cubesat-altitude", "высота по давлению", "қысым бойынша биіктік", "altitude from pressure"),
            self_step("station", 60, ml("Своя наземная станция принимает пакеты", "Өз жер станциясы пакеттерді қабылдайды", "Own ground station receives packets"),
                      ml("Скриншот программы приема с живой телеметрией.", "Тірі телеметриясы бар қабылдау бағдарламасының скриншоты.",
                         "A screenshot of the receiving software with live telemetry."), photo=True),
        ]},
        {"code": "selection", "icon": "book", "title": ml("Отбор", "Іріктеу", "Selection"), "steps": [
            self_step("docs", 80, ml("Техническая документация", "Техникалық құжаттама", "Technical documentation"),
                      ml("Описание миссии, схема, бюджеты массы и энергии, план испытаний.", "Миссия сипаттамасы, сызба, масса мен энергия бюджеттері, сынақ жоспары.",
                         "Mission, diagram, mass and power budgets, test plan.")),
            self_step("step", 60, ml("3D-модель STEP и видео", "STEP 3D-моделі және бейне", "STEP 3D model and video"),
                      ml("Модель спутника и видео о проекте сданы в Connect.", "Серік моделі мен жоба туралы бейне Connect-ке тапсырылды.",
                         "The satellite model and project video are submitted in Connect.")),
        ]},
        {"code": "tests", "icon": "box", "title": ml("Испытания", "Сынақтар", "Tests"), "steps": [
            self_step("bench", 60, ml("Стендовые испытания", "Стендтік сынақтар", "Bench tests"),
                      ml("Полный цикл работы на столе от аккумулятора: время, связь, запись.", "Үстелде аккумулятордан толық жұмыс циклы: уақыт, байланыс, жазу.",
                         "A full run on the bench from the battery: time, link, logging."), photo=True),
            self_step("range", 60, ml("Проверка связи на дальности", "Қашықтықта байланысты тексеру", "Range test"),
                      ml("Пакеты доходят с расстояния не меньше 1 км.", "Пакеттер кемінде 1 км қашықтықтан жетеді.", "Packets arrive from at least 1 km away.")),
        ]},
        {"code": "final", "icon": "podium", "title": ml("Финал", "Финал", "Final"), "steps": [
            _cubesat("cubesat-mission", "финальная миссия", "финалдық миссия", "final mission"),
            connect("played", 400, ml("Выступили в финале", "Финалда өнер көрсеттік", "Competed in the final"),
                    ml("Команду отметили на регистрации в день финала.", "Финал күні команда тіркеуде белгіленді.", "The team was checked in on the final day."),
                    "played"),
            self_step("flight", 80, ml("Спутник отлетал на аэростате", "Серік аэростатпен ұшты", "The satellite flew on the aerostat"),
                      ml("Фото на старте и график принятой телеметрии.", "Стартта түскен сурет және қабылданған телеметрия графигі.",
                         "A launch photo and a chart of the received telemetry."), photo=True),
        ]},
        {"code": "results", "icon": "trophy", "title": ml("Итоги", "Қорытынды", "Results"), "steps": [
            connect("award", 600, ml("Награда олимпиады", "Олимпиада марапаты", "Olympiad award"),
                    ml("Место или награда категории.", "Орын не санат марапаты.", "A place or category award."), "award"),
            connect("advanced", 800, ml("Прошли на следующий уровень", "Келесі деңгейге өттік", "Advanced to the next level"),
                    ml("Отметка «проходит дальше» в итогах.", "Қорытындыдағы «әрі қарай өтеді» белгісі.", "Marked as advancing in the results."), "advanced"),
        ]},
    ],
}

def _cansat(preset, ru, kk, en):
    return sim(preset, ml("Симулятор: " + ru, "Симулятор: " + kk, "Simulator: " + en))


# CanSat: регламент WSO, глава 12 (банка до 300 г, ракета до 1500 г, двигатель РД1-100-7М, устойчивость от 1,5 калибра)
WSO_CANSAT = {
    "code": "wso-cansat", "programs": ["WSO_CANSAT"], "color": "#c2410c",
    "title": ml("WSO: CanSat", "WSO: CanSat", "WSO: CanSat"),
    "season": ml("Олимпиада 2026-2027, категория CanSat", "Олимпиада 2026-2027, CanSat санаты", "Olympiad 2026-2027, CanSat category"),
    "sim_url": "/lab/cansat?preset=",
    "stages": [
        {"code": "start", "icon": "flag", "title": ml("Старт", "Басы", "Start"), "steps": [
            LINK,
            self_step("rules", 30, ml("Прочитать главу CanSat в регламенте", "Регламенттегі CanSat тарауын оқу", "Read the CanSat chapter of the rules"),
                      ml("Требования к ракете и CanSat, предстартовая проверка, критерии финала.", "Зымыран мен CanSat талаптары, ұшу алдындағы тексеру, финал критерийлері.",
                         "Rocket and CanSat requirements, safety check, final criteria.")),
            _cansat("cansat-build", "соберите CanSat", "CanSat құрастырыңыз", "build a CanSat"),
        ]},
        {"code": "team", "icon": "team", "title": ml("Команда", "Команда", "Team"), "steps": [
            connect("team", 150, ml("Команда CanSat в USTEM Connect", "USTEM Connect-тегі CanSat командасы", "CanSat team in USTEM Connect"),
                    ml("Тренер создает команду в категории CanSat: от 1 до 4 участников.", "Жаттықтырушы CanSat санатында команда құрады: 1-ден 4 қатысушыға дейін.",
                       "The coach creates a CanSat team of 1 to 4 participants."), "team"),
            connect("approved", 200, ml("Заявка на олимпиаду одобрена", "Олимпиадаға өтінім мақұлданды", "Olympiad application approved"),
                    ml("Команда попала в возрастную группу и допущена.", "Команда жас тобына кіріп, жіберілді.", "The team fits an age group and is admitted."),
                    "approved"),
        ]},
        {"code": "rocket", "icon": "flag-race", "title": ml("Ракета-носитель", "Зымыран-тасығыш", "Launch vehicle"), "steps": [
            _cansat("cansat-rocket", "устойчивая ракета", "орнықты зымыран", "a stable rocket"),
            _cansat("cansat-recovery", "парашюты и вышибной заряд", "парашюттер мен лақтыру заряды", "parachutes and ejection"),
            self_step("ork", 80, ml("Проект в OpenRocket", "OpenRocket жобасы", "OpenRocket project"),
                      ml("Файл .ork со стандартным двигателем, устойчивость не меньше 1,5 калибра на всем активном участке.",
                         "Стандартты қозғалтқышы бар .ork файлы, белсенді бөлікте орнықтылық кемінде 1,5 калибр.",
                         "An .ork file with the standard motor, stability of at least 1.5 calibers in powered flight.")),
            self_step("rocket-built", 60, ml("Ракета собрана", "Зымыран жиналды", "Rocket built"),
                      ml("Фото ракеты рядом с рулеткой и весами: длина, диаметр, масса как в проекте.", "Зымыранның рулетка мен таразы жанындағы суреті: ұзындығы, диаметрі, массасы жобадағыдай.",
                         "A photo of the rocket with a tape and scales: length, diameter and mass as designed."), photo=True),
        ]},
        {"code": "cansat", "icon": "chip", "title": ml("CanSat и программа", "CanSat және бағдарлама", "CanSat and software"), "steps": [
            self_step("schematic", 50, ml("Схема электроники", "Электроника сызбасы", "Electronics schematic"),
                      ml("PDF со всеми компонентами, выводами и напряжениями питания.", "Барлық компоненттер, шығыстар және қоректену кернеулері бар PDF.",
                         "A PDF with all components, pins and supply voltages.")),
            _cansat("cansat-telemetry", "запись 10 раз в секунду", "секундына 10 рет жазу", "10 Hz logging"),
            _cansat("cansat-events", "старт и апогей", "старт пен апогей", "launch and apogee"),
            self_step("can-built", 60, ml("CanSat собран и пишет данные", "CanSat жиналды және деректер жазады", "CanSat built and logging"),
                      ml("Фото банки и файл с SD после проверки на столе.", "Банка суреті және үстелде тексерілгеннен кейінгі SD файлы.",
                         "A photo of the can and the SD file after a bench test."), photo=True),
        ]},
        {"code": "selection", "icon": "book", "title": ml("Отбор", "Іріктеу", "Selection"), "steps": [
            self_step("docs", 80, ml("Документация отборочного этапа", "Іріктеу кезеңінің құжаттамасы", "Selection documentation"),
                      ml("Файл .ork, 3D-модели ракеты и CanSat, схема и презентация сданы в Connect.", "Файл .ork, зымыран мен CanSat 3D-модельдері, сызба және презентация Connect-ке тапсырылды.",
                         "The .ork file, 3D models, schematic and presentation are submitted in Connect.")),
        ]},
        {"code": "tests", "icon": "box", "title": ml("Испытания", "Сынақтар", "Tests"), "steps": [
            self_step("drop", 60, ml("Сброс CanSat с высоты", "CanSat-ты биіктіктен тастау", "CanSat drop test"),
                      ml("Парашют раскрывается, скорость снижения как в расчете, данные сохранились.", "Парашют ашылады, түсу жылдамдығы есептегідей, деректер сақталды.",
                         "The parachute opens, the descent rate matches the calculation, data survive."), photo=True),
            self_step("ejection", 60, ml("Проверка спасательной системы", "Құтқару жүйесін тексеру", "Recovery system test"),
                      ml("Пыж, амортизатор и парашют ракеты укладываются и выходят без заеданий.", "Пыж, амортизатор және зымыран парашюты кептелмей жиналады және шығады.",
                         "Wadding, shock cord and rocket parachute pack and deploy freely.")),
        ]},
        {"code": "final", "icon": "podium", "title": ml("Финал", "Финал", "Final"), "steps": [
            _cansat("cansat-mission", "финальный запуск", "финалдық ұшыру", "final launch"),
            connect("played", 400, ml("Выступили в финале", "Финалда өнер көрсеттік", "Competed in the final"),
                    ml("Команду отметили на регистрации в день финала.", "Финал күні команда тіркеуде белгіленді.", "The team was checked in on the final day."),
                    "played"),
            self_step("launch", 80, ml("Ракета стартовала, CanSat найден", "Зымыран ұшты, CanSat табылды", "Rocket launched, CanSat recovered"),
                      ml("Фото старта и график высоты по данным CanSat.", "Старт суреті және CanSat деректері бойынша биіктік графигі.",
                         "A launch photo and an altitude chart from the CanSat data."), photo=True),
        ]},
        {"code": "results", "icon": "trophy", "title": ml("Итоги", "Қорытынды", "Results"), "steps": [
            connect("award", 600, ml("Награда олимпиады", "Олимпиада марапаты", "Olympiad award"),
                    ml("Место или награда категории.", "Орын не санат марапаты.", "A place or category award."), "award"),
            connect("advanced", 800, ml("Прошли на следующий уровень", "Келесі деңгейге өттік", "Advanced to the next level"),
                    ml("Отметка «проходит дальше» в итогах.", "Қорытындыдағы «әрі қарай өтеді» белгісі.", "Marked as advancing in the results."), "advanced"),
        ]},
    ],
}

# Пути, которые создаются при первом запуске; дальше их правят в Студии (Студия -> Пути)
SEED_PATHS = [
    {**TRACKS["fll"], "programs": [TRACKS["fll"]["program"]]},
    {**TRACKS["ftc"], "programs": [TRACKS["ftc"]["program"]]},
    WSO,
    WSO_CUBESAT,
    WSO_CANSAT,
]

# Звания тренера по опыту
RANKS = [
    (0, ml("Тренер-новичок", "Жаңадан бастаған жаттықтырушы", "Rookie coach")),
    (300, ml("Механик", "Механик", "Mechanic")),
    (750, ml("Программист", "Бағдарламашы", "Programmer")),
    (1400, ml("Стратег", "Стратег", "Strategist")),
    (2300, ml("Капитан альянса", "Альянс капитаны", "Alliance captain")),
    (3600, ml("Наставник чемпионов", "Чемпиондар тәлімгері", "Mentor of champions")),
    (5500, ml("Легенда FIRST", "FIRST аңызы", "FIRST legend")),
]

# Значки: код -> название, описание, ступень (bronze, silver, gold), рисунок
BADGES: dict[str, dict] = {
    "first-lesson": {"tier": "bronze", "glyph": "book", "title": ml("Первый урок", "Алғашқы сабақ", "First lesson"),
                     "desc": ml("Пройден первый урок курса.", "Курстың алғашқы сабағы өтілді.", "Finished a first course lesson.")},
    "connected": {"tier": "bronze", "glyph": "link", "title": ml("На связи", "Байланыста", "Connected"),
                  "desc": ml("Подключен кабинет USTEM Connect.", "USTEM Connect кабинеті қосылды.", "USTEM Connect account linked.")},
    "first-sim": {"tier": "bronze", "glyph": "chip", "title": ml("Первый запуск", "Алғашқы іске қосу", "First run"),
                  "desc": ml("Решено первое задание симулятора.", "Симулятордың алғашқы тапсырмасы шешілді.", "Solved a first simulator task.")},
    "sim-5": {"tier": "silver", "glyph": "chip", "title": ml("Инженер симулятора", "Симулятор инженері", "Simulator engineer"),
              "desc": ml("Решено 5 заданий симуляторов.", "Симулятордың 5 тапсырмасы шешілді.", "Solved 5 simulator tasks.")},
    "spike-master": {"tier": "gold", "glyph": "robot", "title": ml("Мастер SPIKE", "SPIKE шебері", "SPIKE master"),
                     "desc": ml("Все задания симулятора SPIKE Prime.", "SPIKE Prime симуляторының барлық тапсырмасы.", "Every SPIKE Prime simulator task.")},
    "ftc-master": {"tier": "gold", "glyph": "robot", "title": ml("Мастер FTC", "FTC шебері", "FTC master"),
                   "desc": ml("Все задания симулятора FTC.", "FTC симуляторының барлық тапсырмасы.", "Every FTC simulator task.")},
    "cubesat-master": {"tier": "gold", "glyph": "chip", "title": ml("Мастер CubeSat", "CubeSat шебері", "CubeSat master"),
                       "desc": ml("Все задания симулятора CubeSat.", "CubeSat симуляторының барлық тапсырмасы.", "Every CubeSat simulator task.")},
    "cansat-master": {"tier": "gold", "glyph": "flag-race", "title": ml("Мастер CanSat", "CanSat шебері", "CanSat master"),
                      "desc": ml("Все задания симулятора CanSat.", "CanSat симуляторының барлық тапсырмасы.", "Every CanSat simulator task.")},
    "certified": {"tier": "silver", "glyph": "medal", "title": ml("Сертифицирован", "Сертификатталған", "Certified"),
                  "desc": ml("Получен первый сертификат уровня.", "Алғашқы деңгей сертификаты алынды.", "Earned a first level certificate.")},
    "team": {"tier": "bronze", "glyph": "team", "title": ml("Своя команда", "Өз командам", "Own team"),
             "desc": ml("Команда зарегистрирована на сезон.", "Команда маусымға тіркелді.", "A team registered for the season.")},
    "first-event": {"tier": "silver", "glyph": "flag", "title": ml("Первый турнир", "Алғашқы турнир", "First event"),
                    "desc": ml("Команда выступила на турнире.", "Команда турнирде өнер көрсетті.", "The team competed at an event.")},
    "award": {"tier": "gold", "glyph": "trophy", "title": ml("С наградой", "Марапатпен", "Award winner"),
              "desc": ml("Команда получила награду.", "Команда марапат алды.", "The team won an award.")},
    "advanced": {"tier": "gold", "glyph": "arrow", "title": ml("Дальше!", "Әрі қарай!", "Moving on!"),
                 "desc": ml("Команда прошла на следующий этап.", "Команда келесі кезеңге өтті.", "The team advanced.")},
    "national": {"tier": "gold", "glyph": "podium", "title": ml("Национальный уровень", "Ұлттық деңгей", "National level"),
                 "desc": ml("Команда выступила на национальном чемпионате.", "Команда ұлттық чемпионатта өнер көрсетті.", "Competed at the national.")},
    "world": {"tier": "gold", "glyph": "globe", "title": ml("Мировая сцена", "Әлемдік сахна", "World stage"),
              "desc": ml("Команда едет на международный этап.", "Команда халықаралық кезеңге барады.", "Going international.")},
    "stage": {"tier": "silver", "glyph": "check", "title": ml("Этап пройден", "Кезең өтілді", "Stage cleared"),
              "desc": ml("Все шаги одного этапа пути сезона.", "Маусым жолының бір кезеңінің барлық қадамы.", "Every step of one season stage.")},
    "chronicler": {"tier": "silver", "glyph": "camera", "title": ml("Летописец", "Шежіреші", "Chronicler"),
                   "desc": ml("10 шагов пути отмечены с фото.", "Жолдың 10 қадамы суретпен белгіленді.", "10 journey steps marked with a photo.")},
    "streak-7": {"tier": "silver", "glyph": "flame", "title": ml("Неделя в ритме", "Ырғақтағы апта", "Week streak"),
                 "desc": ml("7 дней подряд с прогрессом.", "7 күн қатарынан прогресс.", "Progress 7 days in a row.")},
    "streak-30": {"tier": "gold", "glyph": "flame", "title": ml("Месяц в ритме", "Ырғақтағы ай", "Month streak"),
                  "desc": ml("30 дней подряд с прогрессом.", "30 күн қатарынан прогресс.", "Progress 30 days in a row.")},
}

XP_LESSON, XP_QUIZ, XP_LEVEL, XP_EVIDENCE, XP_SIM, XP_PHOTO_BONUS = 10, 15, 200, 120, 25, 20


def all_steps(track: dict):
    for stage in track["stages"]:
        for step in stage["steps"]:
            yield stage, step


def sim_presets(prefix: str) -> list[str]:
    """Все задания симулятора с этим префиксом (для значков «Мастер SPIKE», «Мастер FTC», «Мастер CubeSat»)."""
    from pathlib import Path
    folder = {"spike-": "spikesim/presets", "ftc-": "ftcsim/presets", "cubesat-": "cubesat/presets", "cansat-": "cansat/presets"}[prefix]
    return sorted(p.stem for p in (Path(__file__).resolve().parents[1] / "static" / folder).glob(f"{prefix}*.json")
                  if "sandbox" not in p.stem)


# Регионы для рейтинга: те же названия, что в справочнике USTEM Connect (regions.name.ru)
REGIONS = (
    "Астана|Алматы|Шымкент|Абайская область|Акмолинская область|Актюбинская область|Алматинская область|Атырауская область|"
    "Восточно-Казахстанская область|Жамбылская область|Жетысуская область|Западно-Казахстанская область|Карагандинская область|"
    "Костанайская область|Кызылординская область|Мангистауская область|Павлодарская область|Северо-Казахстанская область|"
    "Туркестанская область|Улытауская область|Ташкент|Республика Каракалпакстан|Андижанская область|Бухарская область|"
    "Ферганская область|Джизакская область|Кашкадарьинская область|Хорезмская область|Наманганская область|Навоийская область|"
    "Самаркандская область|Сурхандарьинская область|Сырдарьинская область|Ташкентская область|Бишкек|Ош|Баткенская область|"
    "Чуйская область|Иссык-Кульская область|Джалал-Абадская область|Нарынская область|Ошская область|Таласская область"
).split("|")
