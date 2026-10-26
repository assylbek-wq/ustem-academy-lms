"""Задания по урокам Competition Ready приложения LEGO Education SPIKE (раздел для FIRST LEGO League Challenge).

Роботы - как в уроках LEGO: приводная база (колеса C и D, рука E, датчик расстояния F, датчик цвета B) и продвинутая
приводная база (колеса A и E 88 мм, отвал C, подъемная рука D, датчики цвета B и F), см. assets/lab/spike/robots.js.
Подключаются в spike_presets.py (PRESETS, SOLUTIONS). Координаты - тренировочный мат (assets/lab/spike/mat.js) или
поле BIOGLOW, курс h: 0 - к дальнему борту, -90 - вправо.
"""
from __future__ import annotations

HEAD = """from hub import port, motion_sensor, light_matrix, sound, button
import motor, motor_pair, color_sensor, distance_sensor, color, runloop
"""
END = "\n\nrunloop.run(main())\n"

# приводная база: колесо 56 мм - 17,5 см за оборот, как в блоке «установить поворот одного мотора на 17,5 см»
DB = """
PAIR = motor_pair.PAIR_1
DEG_PER_CM = 360 / 17.5
"""
# продвинутая база: колесо 88 мм - 27,63 см за оборот (так в уроке LEGO)
ADB = """
PAIR = motor_pair.PAIR_1
DEG_PER_CM = 360 / 27.63
"""

GO = """
import math
X, Y = {x}, {y}
H0 = {h0}   # курс робота на старте: 0 - к дальнему борту, 90 - вправо


def heading():
    return H0 - motion_sensor.tilt_angles()[0] / 10


async def turn_to(h, max_speed=300):
    while True:
        e = (h - heading() + 540) % 360 - 180
        if abs(e) <= 0.8:
            break
        sp = int(min(max_speed, max(50, abs(e) * 6)))
        if e > 0:
            motor_pair.move_tank(PAIR, sp, -sp)
        else:
            motor_pair.move_tank(PAIR, -sp, sp)
        await runloop.sleep_ms(5)
    motor_pair.stop(PAIR)


async def go(x, y, speed=400):
    global X, Y
    dx, dy = x - X, y - Y
    await turn_to(math.degrees(math.atan2(dx, dy)))
    await motor_pair.move_for_degrees(PAIR, int(math.sqrt(dx * dx + dy * dy) / 10 * DEG_PER_CM), 0, velocity=speed)
    X, Y = x, y
"""


def prog(pair: str, setup: str, body: str, extra: str = "") -> str:
    return HEAD + setup + extra + "\n\nasync def main():\n    motor_pair.pair(PAIR, " + pair + ")\n" + body + END


DB_PAIR = "port.C, port.D"
ADB_PAIR = "port.A, port.E"
LEFT_HOME = {"x0": 0, "y0": 0, "x1": 380, "y1": 320}

CR_PRESETS = {
    "spike-cr-square": {
        "title": "Тренировочный лагерь 1: квадрат",
        "task": "Урок Competition Ready «Тренировочный лагерь 1: езда». Приводная база (колеса на портах C и D) стоит в левом доме "
                "и смотрит к дальнему борту. Проедьте квадрат со стороной 30 см, поворачивая направо, и вернитесь на старт "
                "тем же курсом.\nПодсказка: 1 оборот колеса - 17,5 см; поворот на месте на 90 градусов - около 182 градусов "
                "мотора с рулем 100.",
        "mode": "python", "robot": "driving-base", "start": {"x": 190, "y": 160, "h": 0},
        "python": prog(DB_PAIR, DB, "    # одна сторона квадрата\n    await motor_pair.move_for_degrees(PAIR, int(30 * DEG_PER_CM), 0, velocity=300)\n"),
        "checks": [
            {"type": "visit", "points": [[190, 460], [490, 460], [490, 160]], "tol": 45, "label": "Три угла квадрата пройдены"},
            {"type": "pose_end", "x": 190, "y": 160, "tol": 45, "label": "Робот вернулся на старт (±4,5 см)"},
            {"type": "heading_end", "deg": 0, "tol": 8, "label": "Смотрит туда же, куда на старте (±8°)"},
            {"type": "finished", "label": "Программа завершилась без ошибок"},
        ],
    },
    "spike-cr-slalom": {
        "title": "Тренировочный лагерь 1: объезд препятствий",
        "task": "Объедьте три метки змейкой и остановитесь в фиолетовом круге справа. Метки трогать нельзя.\n"
                "Подсказка: спланируйте путь на листе псевдокода, затем подбирайте углы и расстояния.",
        "mode": "python", "robot": "driving-base", "start": {"x": 190, "y": 200, "h": -90},
        "objects": [{"kind": "marker", "x": 650, "y": 200}, {"kind": "marker", "x": 900, "y": 380}, {"kind": "marker", "x": 1150, "y": 200}],
        "marks": [{"x": 1400, "y": 260, "r": 90, "label": "финиш"}],
        "python": prog(DB_PAIR, DB, "    await motor_pair.move_for_degrees(PAIR, int(25 * DEG_PER_CM), 0, velocity=300)\n"),
        "checks": [
            {"type": "pose_end", "x": 1400, "y": 260, "tol": 90, "label": "Робот в круге финиша"},
            {"type": "no_touch", "label": "Ни одна метка не задета"},
            {"type": "finished", "label": "Программа завершилась без ошибок"},
        ],
    },
    "spike-cr-stop": {
        "title": "Тренировочный лагерь 2: стоп у метки",
        "task": "Урок «Тренировочный лагерь 2: работа с предметами». На порту F датчик расстояния. Поезжайте к метке и "
                "остановитесь ближе 10 см, не задев ее.\nПодсказка: начать движение, ждать, пока расстояние меньше 100 мм "
                "(distance_sensor.distance(port.F) возвращает мм), остановить.",
        "mode": "python", "robot": "driving-base", "start": {"x": 190, "y": 200, "h": -90},
        "objects": [{"id": "marker", "kind": "marker", "x": 1100, "y": 200}],
        "python": prog(DB_PAIR, DB, "    await motor_pair.move_for_degrees(PAIR, int(40 * DEG_PER_CM), 0, velocity=300)\n"),
        "checks": [
            {"type": "near_obj", "id": "marker", "max": 100, "min": 5, "label": "Робот остановился ближе 10 см от метки"},
            {"type": "no_touch", "label": "Метка не задета"},
            {"type": "code_has", "re": "distance_sensor\\.distance", "label": "Программа использует датчик расстояния"},
        ],
    },
    "spike-cr-cube": {
        "title": "Тренировочный лагерь 2: привезти кубик",
        "task": "Синий кубик лежит в 40 см перед роботом. Подъедьте к нему по датчику расстояния, опустите руку (мотор E на 90 "
                "градусов вперед) за кубик и привезите его в левый дом.\nРука опущена - кубик едет с роботом; поднимете "
                "руку - робот поднимет кубик; опустите снова - отпустит.",
        "mode": "python", "robot": "driving-base", "start": {"x": 190, "y": 200, "h": -90},
        "objects": [{"id": "cube", "kind": "cube", "x": 700, "y": 200}],
        "python": prog(DB_PAIR, DB, "    motor_pair.move(PAIR, 0, velocity=300)\n    await runloop.until(lambda: 0 < distance_sensor.distance(port.F) < 60)\n    motor_pair.stop(PAIR)\n"),
        "checks": [
            {"type": "obj_zone", "id": "cube", "zone": LEFT_HOME, "end": True, "label": "Кубик в левом доме"},
            {"type": "finished", "label": "Программа завершилась без ошибок"},
        ],
    },
    "spike-cr-line-stop": {
        "title": "Тренировочный лагерь 3: стоп на линии",
        "task": "Урок «Тренировочный лагерь 3: реакция на линии». Датчик цвета на порту B. Поезжайте вперед и остановитесь, "
                "когда датчик увидит черную линию.\nДва способа: color_sensor.color(port.B) == color.BLACK или "
                "color_sensor.reflection(port.B) < 30. Второй точнее.",
        "mode": "python", "robot": "driving-base", "start": {"x": 900, "y": 160, "h": 0},
        "python": prog(DB_PAIR, DB, "    motor_pair.move(PAIR, 0, velocity=300)\n    await runloop.sleep_ms(500)\n    motor_pair.stop(PAIR)\n"),
        "checks": [
            {"type": "sensor_on", "port": "B", "zone": {"x0": 850, "y0": 412, "x1": 950, "y1": 448}, "label": "Датчик B остановился на черной линии"},
            {"type": "finished", "label": "Программа завершилась без ошибок"},
        ],
    },
    "spike-cr-line-follow": {
        "title": "Тренировочный лагерь 3: по линии до финиша",
        "task": "Датчик B стоит на верхнем краю кривой линии. Проедьте по краю до зеленого финиша. Способ из урока LEGO: "
                "зигзаг (на черном - одно колесо, на белом - другое) или плавнее - P-регулятор по отражению.",
        "mode": "python", "robot": "driving-base", "start": {"x": 375, "y": 650, "h": -90}, "trackLine": "B",
        "python": prog(DB_PAIR, DB, "    await motor_pair.move_for_degrees(PAIR, int(100 * DEG_PER_CM), 0, velocity=300)\n"),
        "checks": [
            {"type": "sensor_on", "port": "B", "zone": {"x0": 1870, "y0": 810, "x1": 2000, "y1": 940}, "label": "Датчик B на зеленом финише"},
            {"type": "line_track", "max": 40, "label": "Не сходил с линии дальше 4 см"},
        ],
    },
    "spike-cr-guided": {
        "title": "Миссия с подсказками на поле BIOGLOW",
        "task": "Как урок «The Guided Mission» в приложении SPIKE: приводная база с датчиком цвета стартует в левой зоне "
                "запуска, доезжает до исследовательской платформы (М09), поднимает ее рукой E и заканчивает в правом доме.\n"
                "Подсказка: функция go(x, y) из стартовой программы, платформу поднимают с точки (686, 889), курс 0, рука E "
                "сначала вниз на 90 градусов, потом вверх.",
        "mode": "python", "robot": "driving-base", "field": "bioglow", "start": {"x": 330, "y": 150, "h": 0},
        "python": prog(DB_PAIR, DB, "    await go(500, 600)\n    # дальше: к платформе, поднять ее, в правый дом\n", GO.replace("{x}", "330.0").replace("{y}", "150.0").replace("{h0}", "0")),
        "checks": [
            {"type": "mission", "m": 9, "min": 10, "label": "Исследовательская платформа поднята"},
            {"type": "mission_keep", "m": 10, "min": 20, "label": "Хрупкие микроэкосистемы целы"},
            {"type": "home_end", "side": "right", "label": "Робот закончил в правом доме"},
        ],
    },
    "spike-cr-shapes": {
        "title": "Продвинутая база: квадрат вокруг метки",
        "task": "Урок «My Code, Our Program». Продвинутая приводная база (колеса 88 мм на A и E) объезжает метку квадратом: "
                "4 раза по 41 см вперед и поворот направо на 90 градусов, и возвращается на старт. Метку не задевать.\n"
                "В уроке LEGO: сторона - 540 градусов мотора, поворот - 145 градусов с рулем 100. Лучше сделать «Мой блок» "
                "(или функцию) square().",
        "mode": "python", "robot": "advanced", "start": {"x": 300, "y": 200, "h": 0},
        "objects": [{"kind": "marker", "x": 507, "y": 407}],
        "python": prog(ADB_PAIR, ADB, "    await motor_pair.move_for_degrees(PAIR, 540, 0, velocity=500)\n"),
        "checks": [
            {"type": "visit", "points": [[300, 614], [714, 614], [714, 200]], "tol": 55, "label": "Три угла квадрата пройдены"},
            {"type": "pose_end", "x": 300, "y": 200, "tol": 55, "label": "Робот вернулся на старт"},
            {"type": "no_touch", "label": "Метка не задета"},
        ],
    },
    "spike-cr-dozer": {
        "title": "Продвинутая база: отвал и ящики",
        "task": "Урок «Time for an Upgrade»: на порту C отвал бульдозера. Опустите отвал (мотор C на 90 градусов) и "
                "сдвиньте оба ящика в серую зону ящика справа внизу.",
        "mode": "python", "robot": "advanced", "start": {"x": 300, "y": 220, "h": -90},
        "objects": [{"id": "crate1", "kind": "crate", "x": 1050, "y": 190}, {"id": "crate2", "kind": "crate", "x": 1200, "y": 250}],
        "python": prog(ADB_PAIR, ADB, "    await motor.run_for_degrees(port.C, 90, 500)\n"),
        "checks": [
            {"type": "obj_zone", "id": "crate1", "zone": {"x0": 1600, "y0": 120, "x1": 1850, "y1": 320}, "end": True, "label": "Первый ящик в зоне"},
            {"type": "obj_zone", "id": "crate2", "zone": {"x0": 1600, "y0": 120, "x1": 1850, "y1": 320}, "end": True, "label": "Второй ящик в зоне"},
        ],
    },
}

CR_SOLUTIONS = {
    "spike-cr-square": {"python": prog(DB_PAIR, DB, """    for _ in range(4):
        await motor_pair.move_for_degrees(PAIR, int(30 * DEG_PER_CM), 0, velocity=300)
        await runloop.sleep_ms(200)
        await motor_pair.move_for_degrees(PAIR, 182, 100, velocity=300)
"""), "seconds": 16},
    "spike-cr-slalom": {"python": prog(DB_PAIR, DB, """    for x, y in [(450, 200), (650, 360), (900, 210), (1150, 380), (1400, 260)]:
        await go(x, y)
""", GO.replace("{x}", "190.0").replace("{y}", "200.0").replace("{h0}", "90")), "seconds": 25},
    "spike-cr-stop": {"python": prog(DB_PAIR, DB, """    motor_pair.move(PAIR, 0, velocity=300)
    await runloop.until(lambda: 0 < distance_sensor.distance(port.F) < 80)
    motor_pair.stop(PAIR)
"""), "seconds": 8},
    "spike-cr-cube": {"python": prog(DB_PAIR, DB, """    motor_pair.move(PAIR, 0, velocity=300)
    await runloop.until(lambda: 0 < distance_sensor.distance(port.F) < 60)
    motor_pair.stop(PAIR)
    await motor.run_for_degrees(port.E, 90, 300)
    await motor_pair.move_for_degrees(PAIR, -int(40 * DEG_PER_CM), 0, velocity=300)
"""), "seconds": 12},
    "spike-cr-line-stop": {"python": prog(DB_PAIR, DB, """    motor_pair.move(PAIR, 0, velocity=250)
    await runloop.until(lambda: color_sensor.reflection(port.B) < 30)
    motor_pair.stop(PAIR)
"""), "seconds": 6},
    "spike-cr-line-follow": {"python": prog(DB_PAIR, DB, """    while color_sensor.color(port.B) != color.GREEN:
        error = color_sensor.reflection(port.B) - 55
        motor_pair.move(PAIR, int(max(-100, min(100, error * 1.6))), velocity=220)
        await runloop.sleep_ms(5)
    motor_pair.stop(PAIR)
"""), "seconds": 30},
    "spike-cr-guided": {"python": prog(DB_PAIR, DB, """    await go(500, 600)
    await go(686, 889)
    await turn_to(0)
    await motor.run_for_degrees(port.E, 90, 400)
    await motor.run_for_degrees(port.E, -90, 400)
    await go(686, 800)
    await go(1500, 820)
    await go(1760, 820)
    await go(1760, 300)
    await go(2000, 200)
""", GO.replace("{x}", "330.0").replace("{y}", "150.0").replace("{h0}", "0")), "seconds": 45},
    "spike-cr-shapes": {"python": prog(ADB_PAIR, ADB, """    for _ in range(4):
        await motor_pair.move_for_degrees(PAIR, 540, 0, velocity=500)
        await motor_pair.move_for_degrees(PAIR, 145, 100, velocity=300)
"""), "seconds": 14},
    "spike-cr-dozer": {"python": prog(ADB_PAIR, ADB, """    await motor.run_for_degrees(port.C, 90, 500)
    await motor_pair.move_for_degrees(PAIR, int(128 * DEG_PER_CM), 0, velocity=400)
"""), "seconds": 12},
}
