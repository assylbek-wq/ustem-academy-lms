"""Задания симулятора CubeSat 1U (WSO): python3 assets/lab/cubesat_presets.py -> app/static/cubesat/presets/*.json.

В уроке задание вставляется блоком <div class="cubesat-sim-ИМЯ"></div> (ИМЯ без префикса cubesat-), песочница
/lab/cubesat. Задание: config - стартовая сборка (id деталей из assets/lab/cubesat/catalog.js), flight - условия
полета (высота аэростата altMax, удаление станции station, висение hold и т.д., см. DEFAULT_FLIGHT в model.js),
python - стартовая бортовая программа, checks - проверки (assets/lab/cubesat/checks.js), mission - задачи миссии
для оценки FLT3. SOLUTIONS - эталонные сборки и программы для tests/e2e/cubesat_solutions.mjs.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "app" / "static" / "cubesat" / "presets"

BASE = ["frame-print", "obc-stm32", "bat-18650", "eps-bms", "radio-lora", "ant-whip433", "bme280", "sd", "gs-whip433"]


def cfg(parts, mode="sf7", tx=14):
    return {"items": list(parts), "radioMode": mode, "txDbm": tx}


HELLO = """from sat import *

# Бортовая программа запускается, когда спутник включают на старте.
# Аэростат поднимается через 60 секунд после включения.
print("Спутник включен")
"""

TELEMETRY = """from sat import *

n = 0
while True:
    line = "%d,%.2f,%.2f" % (n, bme.pressure(), bme.temperature())
    radio.send(line)
    n += 1
    sleep(1)
"""

TELEMETRY_SD = """from sat import *

n = 0
while True:
    line = "%d,%.1f,%.2f,%.2f" % (n, time(), bme.pressure(), bme.temperature())
    sd.write(line)
    radio.send(line)
    n += 1
    sleep(1)
"""

ALTITUDE_START = """from sat import *

# 1. Пока спутник на земле, измерьте давление у земли p0 (среднее из нескольких замеров).
# 2. В полете считайте высоту по формуле: h = 44330 * (1 - (p / p0) ** 0.1903)
# 3. Передавайте высоту в каждом пакете телеметрии.

n = 0
while True:
    p = bme.pressure()
    line = "%d,%.2f" % (n, p)
    radio.send(line)
    n += 1
    sleep(1)
"""

ALTITUDE = """from sat import *

s = 0
for i in range(10):
    s += bme.pressure()
    sleep(0.5)
p0 = s / 10

n = 0
while True:
    p = bme.pressure()
    h = 44330 * (1 - (p / p0) ** 0.1903)
    line = "%d,%.2f,%.1f" % (n, p, h)
    sd.write(line)
    radio.send(line)
    n += 1
    sleep(1)
"""

MISSION = """from sat import *

s = 0
for i in range(10):
    s += bme.pressure()
    sleep(0.5)
p0 = s / 10

n = 0
last_photo = -100
while True:
    p = bme.pressure()
    h = 44330 * (1 - (p / p0) ** 0.1903)
    line = "%d,%.1f,%.1f,%.2f" % (n, time(), h, bme.temperature())
    sd.write(line)
    radio.send(line)
    if h > 550 and time() - last_photo > 15:
        camera.capture()
        last_photo = time()
    n += 1
    sleep(1)
"""

SANDBOX_CODE = """from sat import *

# Телеметрия раз в секунду: номер пакета, время, давление, температура.
# Каждая строка пишется на борт (microSD) и уходит по радио на наземную станцию.
n = 0
while True:
    line = "%d,%.1f,%.2f,%.2f" % (n, time(), bme.pressure(), bme.temperature())
    sd.write(line)
    radio.send(line)
    n += 1
    sleep(1)
"""

PRESETS = {
    "cubesat-sandbox": {
        "title": "Свободная сборка и полет",
        "task": "Соберите свой CubeSat 1U на вкладке «Конструктор», напишите бортовую программу и отправьте спутник в полет "
                "на привязном аэростате. Высоту подъема, удаление станции и время висения можно менять в «Условиях полета».",
        "config": cfg(BASE), "python": SANDBOX_CODE, "checks": [], "free_flight": True, "tab": "build",
    },
    "cubesat-build": {
        "title": "Соберите CubeSat 1U",
        "task": "Соберите спутник, который пройдет предстартовую проверку WSO: каркас 1U, бортовой компьютер, питание "
                "с защитой, радио с антенной, датчик BME280, запись данных на борт и своя наземная станция.\n"
                "Масса не больше 800 г, все платы должны поместиться в стек каркаса.",
        "config": cfg([]), "python": HELLO, "tab": "build",
        "checks": [
            {"type": "inspect_all", "label": "Предстартовая проверка пройдена по всем пунктам"},
            {"type": "sensor", "sensor": "bme", "label": "Установлен BME280: давление и температура"},
            {"type": "mass_max", "g": 800, "label": "Масса не больше 800 г"},
        ],
    },
    "cubesat-budget": {
        "title": "Бюджеты массы и энергии",
        "task": "Команда собрала тяжелый спутник с Raspberry Pi и маленьким аккумулятором. На финале аэростат будет "
                "висеть на высоте целый час. Переделайте сборку: масса не больше 300 г, энергии в 3 раза больше, "
                "чем нужно на полет, GPS оставьте.\n"
                "Скачайте таблицу бюджетов (кнопка «Бюджет CSV»): она нужна в технической документации отборочного этапа.",
        "config": cfg(["frame-alu", "obc-rpi", "bat-lipo", "eps-bms", "solar", "solar", "solar", "solar", "radio-lora",
                       "ant-whip433", "bme280", "gps", "co2", "camera", "gs-whip433"]),
        "flight": {"altMax": 500, "hold": 3600}, "python": HELLO, "tab": "build",
        "checks": [
            {"type": "mass_max", "g": 300, "label": "Масса не больше 300 г"},
            {"type": "energy_ratio", "ratio": 3, "label": "Энергии в 3 раза больше, чем нужно на полет"},
            {"type": "sensor", "sensor": "gps", "label": "GPS на борту"},
            {"type": "inspect_all", "label": "Предстартовая проверка пройдена"},
            {"type": "budget_export", "label": "Таблица бюджетов скачана"},
        ],
    },
    "cubesat-link": {
        "title": "Бюджет радиолинии",
        "task": "Аэростат поднимет спутник на 2000 м (максимум по правилам WSO), наземная станция стоит в 500 м "
                "от точки старта. С модулем HC-12 на малой мощности и короткой спиральной антенной запаса почти нет: "
                "при вращении и раскачке спутника пакеты будут теряться. Подберите радио, режим, мощность и антенны так, "
                "чтобы запас линии в худшей точке был не меньше 15 дБ.\n"
                "Подсказка: смотрите на шкалу «Связь» в конструкторе. Направленная антенна станции и больший SF у LoRa "
                "добавляют запас.",
        "config": cfg(["frame-print", "obc-stm32", "bat-18650", "eps-bms", "radio-hc12", "ant-spring433", "bme280", "sd",
                       "gs-whip433"], mode="fu3", tx=10),
        "flight": {"altMax": 2000, "station": 500, "ascent": 5, "descent": 5, "hold": 120}, "python": TELEMETRY_SD, "tab": "build",
        "checks": [
            {"type": "link_margin", "db": 15, "label": "Запас радиолинии не меньше 15 дБ"},
            {"type": "inspect_all", "label": "Предстартовая проверка пройдена"},
        ],
    },
    "cubesat-telemetry": {
        "title": "Первая телеметрия",
        "task": "Спутник уже собран. Напишите бортовую программу: раз в секунду передавайте на наземную станцию пакет "
                "с номером, давлением и температурой.\n"
                "Судьи оценивают связь сразу после старта и телеметрию в течение всего полета (FLT1 и FLT2).",
        "config": cfg(BASE), "python": HELLO, "tab": "flight",
        "checks": [
            {"type": "no_error", "label": "Программа работает без ошибок"},
            {"type": "first_after_launch", "s": 30, "label": "Первый пакет после старта не позже чем через 30 с"},
            {"type": "max_gap", "s": 10, "label": "В полете нет перерывов в телеметрии дольше 10 с"},
            {"type": "received_min", "n": 150, "label": "Станция приняла не меньше 150 пакетов за полет"},
            {"type": "unique_packets", "label": "У каждого пакета свой номер"},
        ],
    },
    "cubesat-sd": {
        "title": "Запись на борт и сверка",
        "task": "По правилам WSO данные пишутся на борт, а после полета их сравнивают с принятой телеметрией (FLT5). "
                "В этой сборке нет накопителя. Добавьте модуль microSD в конструкторе и записывайте каждую строку "
                "телеметрии в файл: sd.write(line).",
        "config": cfg([x for x in BASE if x != "sd"]), "python": TELEMETRY, "tab": "flight",
        "checks": [
            {"type": "no_error", "label": "Программа работает без ошибок"},
            {"type": "sd_min", "n": 300, "label": "На борт записано не меньше 300 строк"},
            {"type": "sd_match", "share": 0.95, "label": "95% принятых пакетов совпадают с записью на борту"},
            {"type": "unique_packets", "label": "У каждого пакета свой номер"},
        ],
    },
    "cubesat-altitude": {
        "title": "Высота по давлению",
        "task": "GPS на спутнике нет, но высоту можно посчитать по давлению. Пока спутник стоит на земле, измерьте "
                "давление p0. В полете считайте высоту h = 44330 * (1 - (p / p0) ** 0.1903) и передавайте ее в каждом "
                "пакете.\nПроверка сравнивает вашу высоту с настоящей: ошибка не больше 15 м.",
        "config": cfg(BASE), "python": ALTITUDE_START, "tab": "flight",
        "checks": [
            {"type": "no_error", "label": "Программа работает без ошибок"},
            {"type": "alt_in_packets", "tol": 15, "share": 0.8, "label": "В пакетах высота с ошибкой не больше 15 м"},
        ],
    },
    "cubesat-mission": {
        "title": "Финальная миссия",
        "task": "Финал WSO: аэростат поднимет спутник на 1000 м и подержит 5 минут. Миссия: профиль атмосферы "
                "(высота и температура по слоям) и не меньше 8 снимков выше 500 м.\n"
                "Доработайте сборку (камере нужен ESP32 или Raspberry Pi), напишите программу и наберите не меньше "
                "34 из 40 баллов за работу в полете (FLT).",
        "config": cfg(BASE), "python": TELEMETRY_SD, "flight": {"altMax": 1000, "ascent": 4, "descent": 4}, "tab": "build",
        "mission": {"photos": 8},
        "checks": [
            {"type": "inspect_all", "label": "Предстартовая проверка пройдена"},
            {"type": "no_error", "label": "Программа работает без ошибок"},
            {"type": "alive", "label": "Спутник работает до посадки"},
            {"type": "photos_high", "n": 8, "label": "Не меньше 8 снимков выше 500 м"},
            {"type": "profile", "points": 9, "label": "Профиль атмосферы по всей высоте"},
            {"type": "flt_min", "points": 34, "label": "Работа в полете: не меньше 34 из 40"},
        ],
    },
}

MISSION_CFG = cfg(["frame-print", "obc-esp32", "bat-18650", "eps-bms", "radio-lora", "ant-whip433", "bme280", "camera",
                   "sd", "gs-yagi433"])

# Эталоны для сквозной проверки: config (если не указан - стартовый), python, export (скачать бюджет)
SOLUTIONS = {
    "cubesat-build": {"config": cfg(BASE)},
    "cubesat-budget": {"config": cfg(["frame-print", "obc-stm32", "bat-18650", "eps-bms", "radio-lora", "ant-whip433",
                                      "bme280", "gps", "sd", "gs-whip433"]), "export": True},
    "cubesat-link": {"config": cfg(["frame-print", "obc-stm32", "bat-18650", "eps-bms", "radio-lora", "ant-whip433",
                                    "bme280", "sd", "gs-yagi433"], mode="sf9", tx=17)},
    "cubesat-telemetry": {"python": TELEMETRY},
    "cubesat-sd": {"config": cfg(BASE), "python": TELEMETRY_SD},
    "cubesat-altitude": {"python": ALTITUDE},
    "cubesat-mission": {"config": MISSION_CFG, "python": MISSION},
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
