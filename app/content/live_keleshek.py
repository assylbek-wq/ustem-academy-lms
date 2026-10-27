"""Эфир «Келешек Лигасы: кіріспе семинар» (27 октября 2026, 11:00 Астана).

Вопросы составлены по двум презентациям семинара: «Келешек Лигасы · жол картасы 2026-2028» и «FIRST Kazakhstan».
Ключи вопросов не меняйте после начала эфира: по ним сохраняются ответы. Тексты можно править,
при старте приложения они обновятся (services/live.py: ensure_events).
"""
from datetime import datetime

EVENT = {
    "slug": "keleshek",
    "title": {"kk": "Келешек Лигасы · кіріспе семинар", "ru": "Лига Келешек · вводный семинар", "en": "Keleshek League · intro seminar"},
    "subtitle": {"kk": "«Келешек» мектептеріндегі STEM бағытын дамыту жол картасы · 2026-2028",
                 "ru": "Дорожная карта развития STEM в школах «Келешек» · 2026-2028",
                 "en": "STEM roadmap for Keleshek schools · 2026-2028"},
    "starts_at": datetime(2026, 10, 27, 11, 0),
    "links": {"connect": "https://connect.ustem.kz/register", "bot": "https://t.me/UstemConnectBot"},
}


def _q(key, block, text, options, correct, note, seconds=30):
    return {"key": key, "block": block, "text": text, "options": options, "correct": correct, "note": note, "seconds": seconds}


def _o(kk, ru, en):
    return {"kk": kk, "ru": ru, "en": en}


BLOCKS = {
    1: _o("Келешек Лигасы", "Лига Келешек", "Keleshek League"),
    2: _o("FIRST деген не", "Что такое FIRST", "What is FIRST"),
    3: _o("Мұғалім мен мектеп жолы", "Путь учителя и школы", "Teacher and school path"),
    4: _o("Қорытынды", "Итог", "Final"),
}

QUESTIONS = [
    # ─── Блок 1: после рассказа о серии вебинаров и Лиге ─────────────────
    _q("q1", 1,
       _o("Келешек Лигасында мектеп неше деңгейден өтеді?", "Сколько уровней проходит школа в Лиге Келешек?", "How many levels does a school pass in the Keleshek League?"),
       [_o("3", "3", "3"), _o("4", "4", "4"), _o("5", "5", "5"), _o("8", "8", "8")], 2,
       _o("Бастау, Үйірме, Аренада, Көпсалалы мектеп және FIRST Robotics School.",
          "Старт, Кружок, На арене, Многопрофильная школа и FIRST Robotics School.",
          "Start, Club, In the arena, Multi-track school and FIRST Robotics School.")),
    _q("q2", 1,
       _o("Жолдың соңында мектеп қандай мәртебе алады?", "Какой статус получает школа в конце пути?", "What status does a school earn at the end of the path?"),
       [_o("«FIRST Robotics School»", "«FIRST Robotics School»", "“FIRST Robotics School”"),
        _o("«Smart School»", "«Smart School»", "“Smart School”"),
        _o("«STEM Hub»", "«STEM Hub»", "“STEM Hub”"),
        _o("«Robo Leader»", "«Robo Leader»", "“Robo Leader”")], 0,
       _o("Қатарынан 2 маусым белсенді болған мектеп акрил марапат алады.",
          "Школа, активная 2 сезона подряд, получает акриловую награду.",
          "A school active for 2 seasons in a row receives an acrylic award.")),
    _q("q3", 1,
       _o("Keleshek Championship қашан өтеді?", "Когда пройдет Keleshek Championship?", "When is the Keleshek Championship?"),
       [_o("Қарашада", "В ноябре", "November"), _o("Қаңтарда", "В январе", "January"),
        _o("Наурызда", "В марте", "March"), _o("Мамырда", "В мае", "May")], 1,
       _o("III тоқсан: Keleshek Championship · қаңтар.", "III четверть: Keleshek Championship, январь.", "Term III: Keleshek Championship, January.")),

    # ─── Блок 2: FIRST ────────────────────────────────────────────────────
    _q("q4", 2,
       _o("FIRST-тің негізін кім қалады?", "Кто основал FIRST?", "Who founded FIRST?"),
       [_o("Илон Маск", "Илон Маск", "Elon Musk"), _o("Дин Кеймен", "Дин Кеймен", "Dean Kamen"),
        _o("Билл Гейтс", "Билл Гейтс", "Bill Gates"), _o("Вуди Флауэрс", "Вуди Флауэрс", "Woodie Flowers")], 1,
       _o("Өнертапқыш Дин Кеймен FIRST-ті 1989 жылы құрды. Вуди Флауэрс - қозғалыстың құндылықтарын берген MIT профессоры.",
          "Изобретатель Дин Кеймен основал FIRST в 1989 году. Вуди Флауэрс - профессор MIT, давший движению ценности.",
          "Inventor Dean Kamen founded FIRST in 1989. Woodie Flowers is the MIT professor who gave the movement its values.")),
    _q("q5", 2,
       _o("2026/27 маусымының тақырыбы қандай?", "Какая тема сезона 2026/27?", "What is the 2026/27 season theme?"),
       [_o("FIRST DIVE · Мұхит", "FIRST DIVE · Океан", "FIRST DIVE · Ocean"),
        _o("FIRST AGE · Археология", "FIRST AGE · Археология", "FIRST AGE · Archaeology"),
        _o("FIRST CANOPY · Табиғат", "FIRST CANOPY · Природа", "FIRST CANOPY · Nature"),
        _o("FIRST ENERGIZE · Энергетика", "FIRST ENERGIZE · Энергетика", "FIRST ENERGIZE · Energy")], 2,
       _o("Тақырып жыл сайын ауысады: биылғы маусым - FIRST CANOPY.", "Тема меняется каждый год: в этом сезоне FIRST CANOPY.", "The theme changes every year: this season is FIRST CANOPY.")),
    _q("q6", 2,
       _o("FTC матчының алғашқы 30 секундында робот қалай жұмыс істейді?", "Как работает робот в первые 30 секунд матча FTC?", "How does the robot work in the first 30 seconds of an FTC match?"),
       [_o("Пилот пультпен басқарады", "Пилот управляет с пульта", "A driver controls it"),
        _o("Толық өз бетінше, өз кодымен", "Полностью сам, по своему коду", "Fully on its own code"),
        _o("Мұғалім басқарады", "Управляет учитель", "The teacher controls it"),
        _o("Тоқтап тұрады", "Стоит на месте", "It stays still")], 1,
       _o("Автономды кезеңде робот камера арқылы өзі бағдар табады, кейін 2 минут пилоттармен ойналады.",
          "В автономном периоде робот ориентируется сам по камере, затем 2 минуты играют пилоты.",
          "In autonomous the robot navigates by camera on its own, then drivers play for 2 minutes.")),
    _q("q7", 2,
       _o("FLL Challenge-те робот ойыны бағаның қандай бөлігі?", "Какую долю оценки в FLL Challenge дает игра роботов?", "What share of the FLL Challenge score is the robot game?"),
       [_o("25%", "25%", "25%"), _o("50%", "50%", "50%"), _o("75%", "75%", "75%"), _o("100%", "100%", "100%")], 0,
       _o("4 × 25%: роботтар ойыны, робот құрылымы, инновациялық жоба және негізгі құндылықтар.",
          "4 × 25%: игра роботов, конструкция робота, инновационный проект и базовые ценности.",
          "4 × 25%: robot game, robot design, innovation project and core values.")),

    # ─── Блок 3: учитель и школа ──────────────────────────────────────────
    _q("q8", 3,
       _o("FIRST командасын жүргізу үшін мұғалімге не міндетті?", "Что обязательно учителю, чтобы вести команду FIRST?", "What does a teacher need to lead a FIRST team?"),
       [_o("Инженер дипломы", "Диплом инженера", "An engineering degree"),
        _o("Бағдарламалауды жетік білу", "Свободно программировать", "Fluent programming"),
        _o("Мұғалім-фасилитатор болу жеткілікті", "Достаточно быть учителем-фасилитатором", "Being a facilitator is enough"),
        _o("Ағылшын тілі C1", "Английский C1", "English C1")], 2,
       _o("Инженер болу міндетті емес: әдістеме дайын, шешімді балалар өздері іздейді.",
          "Быть инженером не обязательно: методика готова, решение ищут сами дети.",
          "You don't need to be an engineer: the method is ready and the kids find the solution.")),
    _q("q9", 3,
       _o("Мұғалім бір бағыт бойынша вебинарға қатысса, мектеп «Келешек» кубогына қанша ұпай алады?",
          "Сколько очков в кубок «Келешек» получает школа, если учитель посетил вебинар по одному направлению?",
          "How many Keleshek Cup points does a school get when a teacher attends one track webinar?"),
       [_o("10", "10", "10"), _o("20", "20", "20"), _o("30", "30", "30"), _o("50", "50", "50")], 0,
       _o("Вебинар - 10 ұпай, жаңа бағыт бойынша команда - 30, 80 сағаттық курс - 50.",
          "Вебинар - 10 очков, команда по новому направлению - 30, курс 80 часов - 50.",
          "Webinar - 10 points, a team in a new track - 30, the 80-hour course - 50.")),
    _q("q10", 3,
       _o("80 сағаттық курстар қашан және қалай өтеді?", "Когда и как пройдут курсы на 80 часов?", "When and how are the 80-hour courses held?"),
       [_o("Онлайн, қарашада", "Онлайн, в ноябре", "Online, in November"),
        _o("Офлайн, желтоқсанда", "Офлайн, в декабре", "In person, in December"),
        _o("Онлайн, наурызда", "Онлайн, в марте", "Online, in March"),
        _o("Офлайн, маусымда", "Офлайн, в июне", "In person, in June")], 1,
       _o("Алматы мен Астанада, №175 бұйрық аясында, сертификатпен.", "В Алматы и Астане, по приказу №175, с сертификатом.", "In Almaty and Astana, under order No. 175, with a certificate.")),

    # ─── Блок 4: итог ─────────────────────────────────────────────────────
    _q("q11", 4,
       _o("Қазақстан FIRST Global Challenge-те қатарынан неше рет әлем чемпионы болды?",
          "Сколько раз подряд Казахстан становился чемпионом мира на FIRST Global Challenge?",
          "How many times in a row has Kazakhstan won FIRST Global Challenge?"),
       [_o("2", "2", "2"), _o("3", "3", "3"), _o("4", "4", "4"), _o("5", "5", "5")], 2,
       _o("Женева 2022, Сингапур 2023, Афина 2024, Панама 2025 - алтын.", "Женева 2022, Сингапур 2023, Афины 2024, Панама 2025 - золото.", "Geneva 2022, Singapore 2023, Athens 2024, Panama 2025 - gold.")),
    _q("q12", 4,
       _o("Gracious Professionalism (ізгі кәсіпқойлық) деген не?", "Что такое Gracious Professionalism?", "What is Gracious Professionalism?"),
       [_o("Кез келген жолмен жеңу", "Победить любой ценой", "Win at any cost"),
        _o("Барыңды сал, бірақ қарсыласыңды құрметтеп, оған көмектес", "Выкладывайся, но уважай соперника и помогай ему", "Do your best, but respect and help your rival"),
        _o("Тек өз командаңа көмектес", "Помогай только своей команде", "Help only your own team"),
        _o("Жарыста сөйлемеу", "Молчать на соревнованиях", "Stay silent at events")], 1,
       _o("Бұл FIRST-тің басты құндылығы, ол әр командаға бағаланады.", "Это главная ценность FIRST, ее оценивают у каждой команды.", "It is FIRST's core value and every team is judged on it.")),
    _q("q13", 4,
       _o("Мектеп командасын қай жерде тіркейді?", "Где регистрируют команду школы?", "Where is a school team registered?"),
       [_o("egov.kz", "egov.kz", "egov.kz"), _o("kundelik.kz", "kundelik.kz", "kundelik.kz"),
        _o("connect.ustem.kz", "connect.ustem.kz", "connect.ustem.kz"), _o("daryn.kz", "daryn.kz", "daryn.kz")], 2,
       _o("USTEM Connect - барлық жарыс бір платформада: тіркеу, өтінім, нәтижелер және сертификаттар.",
          "USTEM Connect - все соревнования на одной платформе: регистрация, заявки, результаты и сертификаты.",
          "USTEM Connect - every event in one place: registration, applications, results and certificates.")),
]
