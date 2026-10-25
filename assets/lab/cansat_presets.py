"""Задания симулятора CanSat (WSO, глава 12): python3 assets/lab/cansat_presets.py -> app/static/cansat/presets/*.json.

В уроке задание вставляется блоком <div class="cansat-sim-ИМЯ"></div> (ИМЯ без префикса cansat-), песочница /lab/cansat.
config - стартовая сборка: items (id деталей банки из assets/lab/cansat/catalog.js), canChute - диаметр парашюта
CanSat, см, rocket - параметры ракеты (DEFAULT_ROCKET в catalog.js). flight - условия (DEFAULT_FLIGHT в model.js).
checks - проверки (assets/lab/cansat/checks.js). SOLUTIONS - эталоны для tests/e2e/sat_solutions.mjs.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "app" / "static" / "cansat" / "presets"

ROCKET = {"d": 75, "len": 100, "material": "paper", "nose": "ogive", "noseK": 3, "fins": 4, "finMat": "balsa",
          "root": 110, "tip": 50, "span": 70, "sweep": 50, "chute": 60, "rail": 3}
CAN = ["body-pla", "obc-pico", "bat-lipo1000", "eps-tp4056", "bme280", "imu", "gps", "sd", "radio-lora", "ant-whip433", "gs-yagi433"]


def cfg(items, can_chute=22, mode="sf7", tx=14, **rocket):
    return {"items": list(items), "radioMode": mode, "txDbm": tx, "canChute": can_chute, "rocket": {**ROCKET, **rocket}}


HELLO = """from sat import *

# Программа запускается, когда CanSat включают перед установкой в ракету.
# Старт через 40 секунд после включения.
print("CanSat включен")
"""

SLOW = """from sat import *

n = 0
while True:
    line = "%d,%.2f,%.2f" % (n, time(), bme.pressure())
    sd.write(line)
    radio.send(line)
    n += 1
    sleep(1)
"""

FAST = """from sat import *

imu.range(16)
n = 0
while True:
    a = imu.accel()
    line = "%d,%.2f,%.2f,%.2f,%.1f" % (n, time(), bme.pressure(), bme.temperature(), a[2])
    sd.write(line)
    if n % 4 == 0:
        radio.send(line)
    n += 1
    sleep(0.05)
"""

EVENTS_START = """from sat import *

# Задача: записать метку LAUNCH в момент старта и APOGEE в верхней точке.
# Старт: перегрузка больше 3 g. Апогей: высота по давлению начала падать.
# Подсказка: imu.range(16), иначе акселерометр упрется в 2 g.

n = 0
while True:
    line = "%d,%.2f,%.2f" % (n, time(), bme.pressure())
    sd.write(line)
    n += 1
    sleep(0.05)
"""

EVENTS = """from sat import *

imu.range(16)
p0 = 0
for i in range(10):
    p0 += bme.pressure()
    sleep(0.1)
p0 /= 10

n = 0
launched = False
apogee = False
top = 0
while True:
    p = bme.pressure()
    h = 44330 * (1 - (p / p0) ** 0.1903)
    a = imu.accel()
    g = (a[0] ** 2 + a[1] ** 2 + a[2] ** 2) ** 0.5 / 9.81
    mark = ""
    if not launched and g > 3:
        launched = True
        mark = "LAUNCH"
    if launched and h > top:
        top = h
    if launched and not apogee and h < top - 3:
        apogee = True
        mark = "APOGEE"
    line = "%d,%.2f,%.1f,%.1f,%s" % (n, time(), h, g, mark)
    sd.write(line)
    if mark or n % 4 == 0:
        radio.send(line)
    n += 1
    sleep(0.05)
"""

MISSION = """from sat import *

imu.range(16)
p0 = 0
for i in range(10):
    p0 += bme.pressure()
    sleep(0.1)
p0 /= 10

n = 0
lat = 0
lon = 0
while True:
    p = bme.pressure()
    h = 44330 * (1 - (p / p0) ** 0.1903)
    a = imu.accel()
    g = (a[0] ** 2 + a[1] ** 2 + a[2] ** 2) ** 0.5 / 9.81
    w = imu.gyro()
    if n % 10 == 0:
        pos = gps.position()
        if pos:
            lat = pos[0]
            lon = pos[1]
    line = "%d,%.2f,%.2f,%.1f,%.2f,%.1f,%.2f,%.1f,%.5f,%.5f" % (n, time(), p, h, bme.temperature(), bme.humidity(), g, w[2], lat, lon)
    sd.write(line)
    if n % 4 == 0:
        radio.send(line)
    n += 1
    sleep(0.05)
"""

SANDBOX = MISSION

PRESETS = {
    "cansat-sandbox": {
        "title": "Свободная сборка и запуск",
        "task": "Соберите CanSat и ракету-носитель, напишите бортовую программу и запустите на стандартном двигателе "
                "РД1-100-7М. Ветер и удаление станции можно менять в «Условиях запуска».",
        "config": cfg(CAN), "python": SANDBOX, "checks": [], "free_flight": True, "tab": "build",
    },
    "cansat-build": {
        "title": "Соберите CanSat",
        "task": "Соберите CanSat в форм-факторе банки 66 × 115 мм: корпус, бортовой компьютер, питание, датчик давления "
                "и температуры, запись на SD или радио на свою наземную станцию, парашют. Масса не больше 300 г.\n"
                "Совет: лучше сразу и SD, и радио: по регламенту за одновременную запись и передачу дают полные баллы.",
        "config": cfg([], can_chute=0), "python": HELLO, "tab": "build",
        "checks": [
            {"type": "inspect_group", "group": "can", "label": "Проверка CanSat пройдена по всем пунктам"},
            {"type": "sensor", "sensor": "bme", "label": "Есть датчик давления и температуры"},
            {"type": "can_mass_max", "g": 300, "label": "Масса CanSat не больше 300 г"},
        ],
    },
    "cansat-rocket": {
        "title": "Устойчивая ракета-носитель",
        "task": "Ракету собрали в корпусе 66 мм с маленькими стабилизаторами. Банка CanSat в такой отсек не входит, "
                "а центр давления оказался впереди центра тяжести: ракета закувыркается.\n"
                "Подберите диаметр, длину, стабилизаторы и материалы: запас устойчивости от 1,5 до 4 калибров, масса "
                "не больше 1500 г, отсек вмещает банку. Это проверяют на предстартовой проверке по OpenRocket (12.4.1).",
        "config": cfg(CAN, d=66, len=80, span=35, root=80, tip=40, sweep=40), "python": HELLO, "tab": "rocket",
        "checks": [
            {"type": "stability", "min": 1.5, "max": 4, "label": "Устойчивость от 1,5 до 4 калибров"},
            {"type": "inspect", "key": "compartment", "label": "Отсек вмещает банку CanSat"},
            {"type": "inspect_group", "group": "rocket", "label": "Проверка ракеты пройдена по всем пунктам"},
        ],
    },
    "cansat-recovery": {
        "title": "Парашюты и вышибной заряд",
        "task": "Тяжелая ракета из PLA с маленьким парашютом: вышибной заряд срабатывает через 7 с после выгорания "
                "двигателя, когда ракета уже падает, а приземляется она слишком быстро. Купол CanSat огромный: "
                "банку унесет ветром далеко от поля.\n"
                "Подберите ракету и оба парашюта: CanSat снижается 6-10 м/с, падает не дальше 250 м от старта, "
                "скорость на выбросе не больше 12 м/с, ракета садится не быстрее 6,5 м/с.",
        "config": cfg(CAN, can_chute=60, material="pla", len=130, chute=30), "python": HELLO, "tab": "rocket",
        "checks": [
            {"type": "descent", "min": 6, "max": 10, "label": "CanSat снижается 6-10 м/с"},
            {"type": "drift_max", "m": 250, "label": "CanSat падает не дальше 250 м от старта"},
            {"type": "eject_max", "v": 12, "label": "Скорость на выбросе не больше 12 м/с"},
            {"type": "rocket_land_max", "v": 6.5, "label": "Ракета садится не быстрее 6,5 м/с"},
        ],
    },
    "cansat-telemetry": {
        "title": "Запись 10 раз в секунду",
        "task": "Полет от старта до раскрытия парашюта длится около 9 секунд: записи раз в секунду мало. Пишите на SD "
                "не реже 10 раз в секунду и отправляйте на станцию каждую 4-ю строку: пакет LoRa летит около 80 мс, "
                "все строки в эфир не помещаются.\n"
                "Радио не должно молчать дольше 2 секунд за весь полет.",
        "config": cfg(CAN), "python": SLOW, "tab": "flight",
        "checks": [
            {"type": "no_error", "label": "Программа работает без ошибок"},
            {"type": "sd_rate", "hz": 10, "label": "Запись на SD не реже 10 раз в секунду"},
            {"type": "rx_rate", "hz": 2, "label": "Станция принимает не реже 2 пакетов в секунду"},
            {"type": "max_gap", "s": 2, "label": "В телеметрии нет пауз дольше 2 с"},
            {"type": "sd_match", "share": 0.95, "label": "Принятые пакеты совпадают со строками на SD"},
        ],
    },
    "cansat-events": {
        "title": "Старт и апогей",
        "task": "Бортовая программа сама должна понять, что ракета стартовала и прошла верхнюю точку. Запишите на SD "
                "метку LAUNCH в момент старта (перегрузка больше 3 g) и APOGEE в апогее (высота по давлению начала "
                "уменьшаться).\nПроверка сравнивает метки с настоящими моментами: старт не позже 0,5 с, апогей не "
                "позже 1,5 с.",
        "config": cfg(CAN), "python": EVENTS_START, "tab": "flight",
        "checks": [
            {"type": "no_error", "label": "Программа работает без ошибок"},
            {"type": "accel_range", "g": 8, "label": "Акселерометр настроен на старт: диапазон не меньше 8 g"},
            {"type": "event", "token": "LAUNCH", "at": "tLaunch", "before": 0.05, "after": 0.5, "label": "Метка LAUNCH в момент старта"},
            {"type": "event", "token": "APOGEE", "at": "tApogee", "before": 0.5, "after": 1.5, "label": "Метка APOGEE в апогее"},
        ],
    },
    "cansat-mission": {
        "title": "Финальный запуск",
        "task": "Финал WSO CanSat: один запуск. Нужен устойчивый полет, раскрытие обоих парашютов, CanSat найден в поле, "
                "данные полные и частые, на SD и на станции совпадают.\n"
                "Наберите не меньше 62 из 75 баллов, которые оценивает симулятор (критерии B, C, D, E). Ветер 5 м/с.",
        "config": cfg(CAN, can_chute=60, material="pla", len=130, chute=30), "python": FAST, "tab": "build",
        "flight": {"wind": 5},
        "checks": [
            {"type": "inspect_all", "label": "Предстартовая проверка пройдена"},
            {"type": "no_error", "label": "Программа работает без ошибок"},
            {"type": "found", "label": "CanSat нашли в поле"},
            {"type": "score_min", "points": 62, "label": "Не меньше 62 из 75 баллов"},
        ],
    },
}

SOLUTIONS = {
    "cansat-build": {"config": cfg(CAN)},
    "cansat-rocket": {"config": cfg(CAN)},
    "cansat-recovery": {"config": cfg(CAN, can_chute=22, chute=60)},
    "cansat-telemetry": {"python": FAST},
    "cansat-events": {"python": EVENTS},
    "cansat-mission": {"config": cfg(CAN, can_chute=22, chute=60), "python": MISSION},
}


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
