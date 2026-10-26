"""Задания симулятора SPIKE Prime: python3 assets/lab/spike_presets.py -> app/static/spikesim/presets/*.json.

В уроке задание вставляется блоком <div class="spike-sim-ИМЯ"></div> (ИМЯ без префикса spike-).
Мат 2362 x 1143 мм (assets/lab/spike/mat.js), начало в левом нижнем углу, y от домов. Курс робота h в градусах:
0 - смотрит вверх (+y), -90 - вправо (+x), положительный - против часовой стрелки.
SOLUTIONS - эталонные решения для tests/e2e/spike_solutions.py: код Python (функции те же, что в уроках курса)
или блоки, и нажатия кнопок хаба [[секунда симуляции, "left"|"right"], ...].
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "app" / "static" / "spikesim" / "presets"

HEAD = """from hub import port, motion_sensor, light_matrix, sound, button
import motor, motor_pair, color_sensor, runloop
"""

SETUP = """
WHEEL_MM = 56
DEG_PER_CM = 360 / (3.1416 * WHEEL_MM / 10)
PAIR = motor_pair.PAIR_1
"""

YAW = """

def yaw():
    return -motion_sensor.tilt_angles()[0] / 10   # направо - плюс, как в приложении
"""

DRIVE_CM = """

async def drive_cm(cm, speed=500):
    await motor_pair.move_for_degrees(PAIR, int(cm * DEG_PER_CM), 0, velocity=speed,
                                      acceleration=1500, deceleration=1500)
"""

TURN = """

async def turn(angle, max_speed=400):
    motion_sensor.reset_yaw(0)
    await runloop.sleep_ms(50)
    while abs(angle - yaw()) > 1:
        error = angle - yaw()
        speed = int(min(max_speed, max(80, abs(error) * 6)))
        if error > 0:
            motor_pair.move_tank(PAIR, speed, -speed)
        else:
            motor_pair.move_tank(PAIR, -speed, speed)
        await runloop.sleep_ms(10)
    motor_pair.stop(PAIR)
"""

STRAIGHT = """

async def straight_cm(cm, speed=450):
    motion_sensor.reset_yaw(0)
    motor.reset_relative_position(port.B, 0)
    target = abs(cm) * DEG_PER_CM
    direction = 1 if cm > 0 else -1
    while abs(motor.relative_position(port.B)) < target:
        steering = int(max(-100, min(100, -yaw() * 4 * direction)))
        motor_pair.move(PAIR, steering, velocity=speed * direction)
        await runloop.sleep_ms(10)
    motor_pair.stop(PAIR)
"""

SQUARE_LINE = """

async def square_on_line(target=50, k=4):
    # каждое колесо едет вперед, пока его датчик на белом, и назад, если заехал на черное
    stable = 0
    while stable < 20:
        el = color_sensor.reflection(port.E) - target
        er = color_sensor.reflection(port.F) - target
        left = int(max(-200, min(200, el * k)))
        right = int(max(-200, min(200, er * k)))
        motor_pair.move_tank(PAIR, left, right)
        stable = stable + 1 if abs(el) < 4 and abs(er) < 4 else 0
        await runloop.sleep_ms(5)
    motor_pair.stop(PAIR)
"""

MAIN_END = "\n\nrunloop.run(main())\n"


def prog(*parts: str, main: str) -> str:
    return HEAD + "".join(parts) + "\n\nasync def main():\n    motor_pair.pair(PAIR, port.A, port.B)\n" + main + MAIN_END


# ─── Блоки: помощник для цепочки блоков Blockly ───
def num(v):
    return {"shadow": {"type": "math_number", "fields": {"NUM": v}}}


def chain(*blocks):
    """Связывает блоки в цепочку next."""
    head = None
    for b in reversed(blocks):
        if head:
            b = {**b, "next": {"block": head}}
        head = b
    return head


def program_blocks(*blocks):
    start = {"type": "spike_start", "x": 30, "y": 30}
    if blocks:
        start["next"] = {"block": chain(*blocks)}
    return {"blocks": {"languageVersion": 0, "blocks": [start]}}


WRITE_HI = {"type": "spike_write", "inputs": {"TEXT": {"shadow": {"type": "text", "fields": {"TEXT": "Hi"}}}}}
BEEP = {"type": "spike_beep", "inputs": {"NOTE": num(72), "SEC": num(0.3)}}
FWD_30 = {"type": "spike_move_for", "fields": {"DIR": "1", "UNIT": "cm"}, "inputs": {"N": num(30)}}

BLACK_LINE = "BLACK = 25\n"

PRESETS = {
    "spike-sandbox": {
        "title": "Свободная тренировка",
        "mode": "blocks",
        "start": {"x": 190, "y": 220, "h": -90},
        "box": {"x": 1300, "y": 220},
        "lever": {"x": 900, "y": 760},
        "blocks": program_blocks(WRITE_HI, FWD_30),
        "python": prog(SETUP, DRIVE_CM, main="    await light_matrix.write(\"Hi\")\n    await drive_cm(30)\n"),
        "checks": [],
    },
    "spike-first": {
        "title": "Первая программа: матрица, звук, движение",
        "task": "Соберите программу из блоков: написать Hi на матрице, сыграть сигнал и проехать вперед на 30 см.\n"
                "Блоки «написать» - в разделе «Свет и звук», «двигаться» - в разделе «Движение». Нажмите «Запуск».",
        "mode": "blocks",
        "start": {"x": 190, "y": 160, "h": -90},
        "blocks": program_blocks(WRITE_HI),
        "python": "",
        "checks": [
            {"type": "matrix", "text": "HI", "label": "На матрице хаба Hi"},
            {"type": "beep", "label": "Хаб сыграл сигнал"},
            {"type": "moved", "mm": 280, "label": "Робот проехал вперед 30 см"},
        ],
    },
    "spike-sensors": {
        "title": "Датчик цвета: найти красный квадрат",
        "task": "Робот смотрит на красный квадрат. Программа печатает отражение датчика E, но не останавливается.\n"
                "Сделайте так, чтобы робот ехал, пока датчик E не увидит красный (color_sensor.color(port.E) == color.RED), "
                "и остановился. Отражение продолжайте выводить в консоль.",
        "mode": "python",
        "start": {"x": 553, "y": 620, "h": 0},
        "python": HEAD.replace("runloop", "runloop, color") + SETUP + """

async def main():
    motor_pair.pair(PAIR, port.A, port.B)
    motor_pair.move(PAIR, 0, velocity=250)
    for i in range(6):
        print("отражение", color_sensor.reflection(port.E))
        await runloop.sleep_ms(200)
    # TODO: ехать, пока датчик E не увидит красный, потом остановиться
""" + MAIN_END,
        "checks": [
            {"type": "print_nums", "n": 5, "label": "В консоли не меньше 5 значений отражения"},
            {"type": "sensor_on", "port": "E", "zone": {"x0": 450, "y0": 960, "x1": 600, "y1": 1110},
             "label": "Робот остановился, датчик E над красным квадратом"},
        ],
    },
    "spike-ruler": {
        "title": "Ровно 50 см по линейке",
        "task": "Ось колес робота стоит на стартовой линии линейки. Программа едет «по времени» и промахивается.\n"
                "Перепишите ее на градусы колес: функция drive_cm из урока, DEG_PER_CM для колеса 56 мм. "
                "Центр робота должен остановиться на отметке 50 см с точностью 5 мм.",
        "mode": "python",
        "start": {"x": 450, "y": 200, "h": -90},
        "marks": [{"x": 950, "y": 200, "r": 18, "label": "50 см"}],
        "python": HEAD + SETUP + """

async def main():
    motor_pair.pair(PAIR, port.A, port.B)
    # «По времени»: результат зависит от заряда и трения
    await motor_pair.move_for_time(PAIR, 2000, 0, velocity=500)
""" + MAIN_END,
        "checks": [
            {"type": "code_has", "re": "DEG_PER_CM|move_for_degrees", "label": "Путь задан в градусах колес"},
            {"type": "axis_end", "axis": "x", "value": 950, "tol": 5, "label": "Робот остановился на отметке 50 см (±5 мм)"},
        ],
    },
    "spike-gyro": {
        "title": "Гироскоп: поворот и прямая",
        "task": "У этого робота правое колесо на 3% больше левого: без гироскопа он уходит в сторону.\n"
                "Поверните направо на 90° функцией turn и проедьте 100 см прямо функцией straight_cm (код в уроке). "
                "В конце робот должен смотреть вправо (±2°) и уйти от прямой не больше чем на 30 мм.",
        "mode": "python",
        "start": {"x": 500, "y": 600, "h": 0},
        "drift": 0.03,
        "marks": [{"x": 1500, "y": 600, "r": 20, "label": "финиш"}],
        "python": prog(SETUP, YAW, DRIVE_CM, main="    await motor_pair.move_for_degrees(PAIR, 185, 100, velocity=300)  # поворот «на глаз»\n    await drive_cm(100)\n"),
        "checks": [
            {"type": "code_has", "re": "tilt_angles", "label": "Код использует гироскоп"},
            {"type": "heading_end", "deg": -90, "tol": 2, "label": "Робот смотрит вправо (±2°)"},
            {"type": "axis_end", "axis": "y", "value": 600, "tol": 30, "label": "Отклонение от прямой не больше 30 мм"},
            {"type": "axis_end", "axis": "x", "value": 1500, "tol": 40, "label": "Проехал 100 см (±40 мм)"},
        ],
    },
    "spike-line": {
        "title": "Езда по линии до финиша",
        "task": "Датчик E стоит на верхнем краю кривой черной линии. Проедьте по краю линии до зеленого финиша и остановитесь.\n"
                "Подсказка: P-регулятор из урока (руль = (отражение - цель) x k) в цикле, пока датчик E не увидит зеленый. "
                "Робот не должен сходить с линии дальше 35 мм.",
        "mode": "python",
        "start": {"x": 375, "y": 622, "h": -90},
        "trackLine": "E",
        "python": HEAD.replace("runloop", "runloop, color") + SETUP + """

async def main():
    motor_pair.pair(PAIR, port.A, port.B)
    # Пока робот едет прямо и теряет линию
    await motor_pair.move_for_degrees(PAIR, int(150 * DEG_PER_CM), 0, velocity=300)
""" + MAIN_END,
        "checks": [
            {"type": "line_track", "max": 35, "label": "Датчик E держался у линии (не дальше 35 мм)"},
            {"type": "sensor_on", "port": "E", "zone": {"x0": 1850, "y0": 800, "x1": 2010, "y1": 960}, "label": "Остановился на зеленом финише"},
        ],
    },
    "spike-square": {
        "title": "Выравнивание по линии двумя датчиками",
        "task": "Робот стоит наискосок перед черной линией. Подъезд одним датчиком оставляет его кривым.\n"
                "Выровняйтесь двумя датчиками (E и F): каждое колесо едет к краю линии по своему датчику (функция square_on_line из урока). "
                "В конце робот должен стоять ровно поперек линии (±2,5°).",
        "mode": "python",
        "start": {"x": 1000, "y": 230, "h": 14},
        "python": HEAD + SETUP + BLACK_LINE + """

async def main():
    motor_pair.pair(PAIR, port.A, port.B)
    motor_pair.move(PAIR, 0, velocity=200)
    await runloop.until(lambda: color_sensor.reflection(port.E) < BLACK)
    motor_pair.stop(PAIR)
""" + MAIN_END,
        "checks": [
            {"type": "heading_end", "deg": 0, "tol": 2.5, "label": "Робот стоит ровно поперек линии (±2,5°)"},
            {"type": "zone", "end": True, "zone": {"x0": 900, "y0": 290, "x1": 1150, "y1": 350}, "label": "Датчики у линии"},
        ],
    },
    "spike-wall": {
        "title": "Выравнивание о стену",
        "task": "Робот стоит криво. Отъедьте назад к нижнему борту и продавите его: робот встанет ровно. Затем сбросьте "
                "гироскоп и проедьте 30 см вперед. В конце робот должен смотреть строго вверх (±2°) в 30 см от борта.",
        "mode": "python",
        "start": {"x": 1100, "y": 260, "h": 12},
        "marks": [{"x": 1100, "y": 375, "r": 18, "label": "30 см"}],
        "python": prog(SETUP, YAW, DRIVE_CM, main="    await drive_cm(-15)\n    await drive_cm(30)\n"),
        "checks": [
            {"type": "heading_end", "deg": 0, "tol": 2, "label": "Робот смотрит строго вверх (±2°)"},
            {"type": "axis_end", "axis": "y", "value": 375, "tol": 12, "label": "Центр робота в 30 см от борта (±12 мм)"},
        ],
    },
    "spike-menu": {
        "title": "Одна программа, два запуска",
        "task": "Сделайте программу с меню: левая кнопка хаба выбирает запуск, правая запускает, номер на матрице.\n"
                "Запуск 1: дотолкать ящик в серую зону и вернуться домой. Запуск 2: доехать до рычага и опустить его рукой "
                "на моторе C (90 градусов). Шаблон меню - в уроке «Одна программа на весь матч».",
        "mode": "python",
        "start": {"x": 190, "y": 220, "h": -90},
        "box": {"x": 1300, "y": 220},
        "lever": {"x": 900, "y": 760},
        "python": prog(SETUP, YAW, DRIVE_CM, TURN, main="    await drive_cm(30)\n    # TODO: запуски run_1 и run_2 и меню на кнопках хаба\n"),
        "checks": [
            {"type": "code_has", "re": "button\\.pressed", "label": "Запуск выбирается кнопками хаба"},
            {"type": "box_zone", "zone": {"x0": 1600, "y0": 120, "x1": 1850, "y1": 320}, "label": "Ящик в серой зоне"},
            {"type": "lever", "label": "Рычаг опущен"},
        ],
    },
}

SOL_SENSORS = HEAD.replace("runloop", "runloop, color") + SETUP + """

async def main():
    motor_pair.pair(PAIR, port.A, port.B)
    motor_pair.move(PAIR, 0, velocity=250)
    while color_sensor.color(port.E) != color.RED:
        print("отражение", color_sensor.reflection(port.E))
        await runloop.sleep_ms(100)
    motor_pair.stop(PAIR)
""" + MAIN_END

SOL_LINE = HEAD.replace("runloop", "runloop, color") + SETUP + """

async def main():
    motor_pair.pair(PAIR, port.A, port.B)
    target, k = 50, 1.5
    while color_sensor.color(port.E) != color.GREEN:
        error = color_sensor.reflection(port.E) - target
        steering = int(max(-100, min(100, error * k)))
        motor_pair.move(PAIR, steering, velocity=250)
        await runloop.sleep_ms(5)
    motor_pair.stop(PAIR)
""" + MAIN_END

MENU_MAIN = """

async def run_1():
    await drive_cm(137.5)
    await drive_cm(-137.5)


async def run_2():
    await turn(-90)
    await drive_cm(54)
    await turn(90)
    await drive_cm(49.5)
    await motor.run_for_degrees(port.C, 90, 500)
    await motor.run_for_degrees(port.C, -90, 500)
    await drive_cm(-20)


RUNS = [run_1, run_2]


async def main():
    motor_pair.pair(PAIR, port.A, port.B)
    n, shown = 0, -1
    while True:
        if shown != n:
            await light_matrix.write(str(n + 1))
            shown = n
        if button.pressed(button.LEFT):
            await runloop.until(lambda: not button.pressed(button.LEFT))
            n = (n + 1) % len(RUNS)
        elif button.pressed(button.RIGHT):
            await runloop.until(lambda: not button.pressed(button.RIGHT))
            await sound.beep(880, 100, 60)
            await RUNS[n]()
            n = (n + 1) % len(RUNS)
        await runloop.sleep_ms(20)
"""

SOLUTIONS = {
    "spike-first": {"blocks": program_blocks(WRITE_HI, BEEP, FWD_30), "mode": "blocks", "seconds": 6},
    "spike-sensors": {"python": SOL_SENSORS, "seconds": 8},
    "spike-ruler": {"python": prog(SETUP, DRIVE_CM, main="    await drive_cm(50)\n"), "seconds": 4},
    "spike-gyro": {"python": prog(SETUP, YAW, TURN, STRAIGHT, main="    await turn(90)\n    await straight_cm(100)\n"), "seconds": 8},
    "spike-line": {"python": SOL_LINE, "seconds": 20},
    "spike-square": {"python": HEAD + SETUP + BLACK_LINE + SQUARE_LINE + "\n\nasync def main():\n    motor_pair.pair(PAIR, port.A, port.B)\n    await square_on_line()\n" + MAIN_END, "seconds": 5},
    "spike-wall": {"python": prog(SETUP, YAW, DRIVE_CM, main="""    motor_pair.move(PAIR, 0, velocity=-250)
    await runloop.sleep_ms(1800)
    motor_pair.stop(PAIR)
    motion_sensor.reset_yaw(0)
    await drive_cm(30)
"""), "seconds": 5},
    "spike-menu": {"python": HEAD + SETUP + YAW + DRIVE_CM + TURN + MENU_MAIN + MAIN_END, "seconds": 34,
                   "press": [[1.0, "right"], [15.0, "right"]], "stop_after": 32},
}


# ─── Поле сезона BIOGLOW (2026-2027): assets/lab/spike/bioglow.js ───
# Координаты на столе: x от левого борта (мат начинается с x = 181), y от борта домов. Курс в программе:
# 0 - к дальнему борту, 90 - вправо (плюс - по часовой стрелке, как motion_sensor в SPIKE 3).
BIO_START = {"x": 330, "y": 150, "h": 0}

NAV = """from hub import port, motion_sensor
import motor, motor_pair, runloop, math

PAIR = motor_pair.PAIR_1
DEG_PER_MM = 360 / (3.1416 * 56)   # колесо 56 мм
X, Y = 330.0, 150.0                # где робот сейчас (мм на столе)


def heading():
    # курс по гироскопу: 0 - к дальнему борту, 90 - вправо
    return -motion_sensor.tilt_angles()[0] / 10


async def turn_to(h, max_speed=400):
    # поворот на месте до курса h (градусы)
    while True:
        e = (h - heading() + 540) % 360 - 180
        if abs(e) <= 0.6:
            break
        sp = int(min(max_speed, max(50, abs(e) * 7)))
        if e > 0:
            motor_pair.move_tank(PAIR, sp, -sp)
        else:
            motor_pair.move_tank(PAIR, -sp, sp)
        await runloop.sleep_ms(5)
    motor_pair.stop(PAIR)


async def fwd(mm, speed=600):
    # проехать mm вперед (минус - назад) и запомнить, где оказались
    global X, Y
    await motor_pair.move_for_degrees(PAIR, int(mm * DEG_PER_MM), 0, velocity=speed,
                                      acceleration=2000, deceleration=2000)
    h = math.radians(heading())
    X += mm * math.sin(h)
    Y += mm * math.cos(h)


async def go(x, y):
    # доехать до точки (x, y): повернуть к ней и проехать по прямой
    dx, dy = x - X, y - Y
    await turn_to(math.degrees(math.atan2(dx, dy)))
    await fwd(math.sqrt(dx * dx + dy * dy))


def setpos(x, y):
    # после упора в модель робот знает, где стоит
    global X, Y
    X, Y = x, y


async def arm(p=port.C):
    # опустить навесное и поднять обратно
    await motor.run_for_degrees(p, 90, 700)
    await motor.run_for_degrees(p, -90, 700)
"""


def bio_prog(body: str) -> str:
    return NAV + "\n\nasync def main():\n    motor_pair.pair(PAIR, port.A, port.B)\n" + body + "\n\nrunloop.run(main())\n"


def bio(title, task, checks, start_body, **extra):
    return {"title": title, "mode": "python", "field": "bioglow", "start": BIO_START, "task": task,
            "python": bio_prog(start_body), "blocks": None, "checks": checks, **extra}


KEEP10 = {"type": "mission_keep", "m": 10, "min": 20, "label": "Хрупкие микроэкосистемы целы (20 очков)"}
FINISHED = {"type": "finished", "label": "Программа завершилась без ошибок"}

BIO_RUNS = {
    "m13": """    # M13: ключевой вид на ферму, молодые деревья
    await go(365, 300); await turn_to(90); await fwd(480)
    await fwd(-60); await go(915, 147); await turn_to(29); await fwd(407); await arm(); await fwd(-150)
""",
    "m02": """    # M02: семена
    await go(820, 330); await turn_to(0); await fwd(60); await fwd(-60)
""",
    "m03": """    # M03: камень
    await go(520, 661); await turn_to(-90); await fwd(110); setpos(426, Y); await fwd(-60)
""",
    "m04": """    # M04: листья
    await go(496, 965); await turn_to(-90); await arm()
    await fwd(-70); await arm()
""",
    "m05": """    # M05: корни
    await go(587, 880); await turn_to(0); await fwd(110); setpos(X, 981); await fwd(-100)
""",
    "m0809": """    # M09 платформа, M08 лиана, M09 фотоловушка и семечко
    await go(686, 847); await turn_to(0); await arm()
    await go(759, 800); await turn_to(0); await arm()
    await go(833, 862); await turn_to(0); await arm()
    await go(803, 812); await turn_to(0); await arm()
""",
    "m01": """    # M01: дрон и карта
    await go(650, 700); await go(600, 450); await go(900, 300)
    await go(1100, 135); await turn_to(90); await fwd(150); setpos(1195, 135); await fwd(-61); await arm()
""",
    "m11": """    # M11: окно в прошлое
    await go(1408, 415); await turn_to(45); await arm()
""",
    "m0607": """    # M06 муравей, M07 мицелий
    await go(1720, 430); await go(1787, 848); await turn_to(0); await arm()
    await go(1843, 900); await turn_to(0); await fwd(120); setpos(X, 967); await fwd(-100)
""",
    "m15": """    # M15 на доке «Шахта»: люк, навес, окно сада
    await go(1868, 852); await turn_to(40); await arm()
    await go(1908, 799); await turn_to(40); await arm()
    await go(1926, 871); await turn_to(40); await fwd(55); await fwd(-55)
""",
    "m12": """    # M12: подпорка и стяжка
    await go(1862, 757); await turn_to(90); await arm()
    await go(1906, 712); await turn_to(90); await arm()
    await go(1922, 546); await turn_to(90); await arm()
""",
}

PRESETS.update({
    "spike-bio-field": {**bio("Поле BIOGLOW: свободный заезд",
        "Поле сезона BIOGLOW, все 15 миссий. Робот стоит в левой зоне запуска. Функции go(x, y), turn_to(курс), fwd(мм) "
        "и arm() уже написаны: координаты в мм, x от левого борта (мат начинается с 181), y от борта домов.\n"
        "Очки матча считаются на вкладке «Табло».",
        [], "    await go(330, 450)\n    await arm()\n")},
    "spike-bio-rock": bio("M03 Переворот камня",
        "Камень лежит у левого края мата на высоте y = 661. Подъедьте справа на той же высоте, повернитесь влево "
        "(курс -90) и толкните камень корпусом: флажок исследования опустится (20 очков).\n"
        "Не задевайте домики паука и улитки (M10).",
        [{"type": "mission", "m": 3, "min": 20, "label": "Флажок исследования опущен (M03, 20 очков)"}, KEEP10, FINISHED],
        "    await go(520, 450)\n    # допишите: доехать до (520, 661), повернуть на курс -90 и толкнуть камень\n"),
    "spike-bio-roots": bio("M05 Разрастающиеся корни",
        "Корни у дальнего борта, x = 587. Подъезжайте снизу (курс 0) и толкайте: неглубоко - 10 очков, до упора - 20.\n"
        "После упора робот знает, где стоит: setpos(X, 981).",
        [{"type": "mission", "m": 5, "min": 20, "end": True, "label": "Корень вытянут полностью (M05, 20 очков)"}, KEEP10, FINISHED],
        "    await go(587, 700)\n    await turn_to(0)\n    # допишите: подъехать к корням и толкнуть их до упора\n"),
    "spike-bio-tree": bio("M08 и M09: дерево и платформа",
        "У большого дерева четыре дела для навесного на моторе C: поднять платформу, опустить лиану, поставить "
        "фотоловушку и стряхнуть семечко. Навесное достает на 200 мм вперед от центра робота, когда опускается.\n"
        "Точки для центра робота (курс 0): платформа (686, 847), лиана (759, 800), фотоловушка (833, 862), семечко (803, 812).",
        [{"type": "mission", "m": 8, "min": 30, "label": "Лиана касается мата (M08, 30 очков)"},
         {"type": "mission", "m": 9, "min": 30, "end": True, "label": "Платформа, фотоловушка и семечко (M09, 30 очков)"}, KEEP10, FINISHED],
        "    await go(686, 847)\n    await turn_to(0)\n    await arm()\n    # допишите: лиана, фотоловушка, семечко\n"),
    "spike-bio-elder": bio("M12 Лесной старейшина",
        "Справа старое дерево (центр 2121, 757) и столбик (2122, 546). Поднимите подпорку навесным (20 очков), "
        "снимите стяжку с дерева и наденьте на столбик (еще 10). Подсказка: подпорку цепляют с точки (1862, 757), "
        "стяжку - с (1906, 712), столбик - с (1922, 546), курс 90.",
        [{"type": "mission", "m": 12, "min": 30, "end": True, "label": "Подпорка поднята, стяжка на столбике (M12, 30 очков)"}, KEEP10, FINISHED],
        "    await go(1720, 430)\n    # допишите: подпорка, стяжка, столбик\n"),
    "spike-bio-match": bio("Матч BIOGLOW: 2 минуты 30 секунд",
        "Полный матч Robot Game: соберите не меньше 300 очков за 2:30. В счет уже входят 6 жетонов точности (50) "
        "и инспекция оборудования (20), а M10 дает 20, пока домики целы.\n"
        "Планируйте заезд как команда FLL: порядок миссий, путь без столкновений, запас по времени. Блоки заездов "
        "готовы в уроках курса, соберите их в одну программу.",
        [{"type": "score_total", "min": 300, "label": "Не меньше 300 очков"}, KEEP10, FINISHED],
        "    await go(330, 450)\n    # соберите заезды: камень, корни, дерево, дрон, окно, муравейник, старейшина...\n"),
})

SOLUTIONS.update({
    "spike-bio-rock": {"python": bio_prog(BIO_RUNS["m03"]), "seconds": 25},
    "spike-bio-roots": {"python": bio_prog(BIO_RUNS["m05"]), "seconds": 25},
    "spike-bio-tree": {"python": bio_prog(BIO_RUNS["m0809"]), "seconds": 45},
    "spike-bio-elder": {"python": bio_prog("    await go(1720, 430)\n" + BIO_RUNS["m12"]), "seconds": 45},
    "spike-bio-match": {"python": bio_prog("".join(BIO_RUNS[k] for k in ["m13", "m02", "m03", "m04", "m05", "m0809", "m01", "m11", "m0607", "m15", "m12"])),
                        "seconds": 152},
})


def write() -> list[Path]:
    OUT.mkdir(parents=True, exist_ok=True)
    paths = []
    for name, data in PRESETS.items():
        p = OUT / f"{name}.json"
        p.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        paths.append(p)
    return paths


if __name__ == "__main__":
    if "--solutions" in sys.argv:
        print(json.dumps({"presets": PRESETS, "solutions": SOLUTIONS}, ensure_ascii=False))
    else:
        for p in write():
            print(p.relative_to(OUT.parents[3]))
