"""Генератор заданий лаборатории: app/static/lab/presets/*.json.

Запуск: python3 assets/lab/presets.py
Координаты считаются здесь, чтобы ножки деталей точно попадали в отверстия макетной платы, а провода
шли аккуратно, с изгибами под прямым углом. В заданиях с Arduino плата стоит под макетной платой:
провода от цифровых пинов уходят вверх, к нижней половине макетки.
Эталонные решения (SOLUTIONS) используются только в тестах (tests/e2e/lab_solutions.py) и в браузер не попадают.
"""
from __future__ import annotations

import json
from pathlib import Path

P = 15
ROWS = {"tp": 1, "tn": 2, "a": 4, "b": 5, "c": 6, "d": 7, "e": 8, "f": 11, "g": 12, "h": 13, "i": 14, "j": 15, "bp": 17, "bn": 18}
PINS = {  # выводы деталей при повороте 0
    "resistor": {"1": (0, 0), "2": (4 * P, 0)}, "led": {"K": (0, 0), "A": (P, 0)}, "button": {"1": (0, 0), "2": (2 * P, 0)},
    "switch": {"1": (0, 0), "2": (2 * P, 0)}, "pot": {"1": (0, 0), "W": (P, 0), "2": (2 * P, 0)}, "ldr": {"1": (0, 0), "2": (P, 0)},
    "buzzer": {"+": (0, 0), "-": (2 * P, 0)}, "meter": {"COM": (0, 0), "IN": (3 * P, 0)}, "battery": {"+": (0, 0), "-": (2 * P, 0)},
    "rgbled": {"R": (0, 0), "COM": (P, 0), "G": (2 * P, 0), "B": (3 * P, 0)}, "servo": {"GND": (0, 0), "5V": (P, 0), "SIG": (2 * P, 0)},
    "sonar": {"VCC": (0, 0), "TRIG": (P, 0), "ECHO": (2 * P, 0), "GND": (3 * P, 0)}, "tmp36": {"+Vs": (0, 0), "Vout": (P, 0), "GND": (2 * P, 0)},
    "npn": {"E": (0, 0), "B": (P, 0), "C": (2 * P, 0)}, "motor": {"+": (0, 0), "-": (2 * P, 0)}, "diode": {"A": (0, 0), "K": (3 * P, 0)},
}
# Выводы Arduino Uno: x в шагах сетки; верхний ряд y = 1, нижний y = 20
UNO_TOP = {"GND.1": 12, "13": 13, "12": 14, "11": 15, "10": 16, "9": 17, "8": 18, "7": 20, "6": 21, "5": 22, "4": 23, "3": 24, "2": 25}
UNO_BOT = {"3.3V": 12, "5V": 13, "GND.2": 14, "GND.3": 15, "VIN": 16, "A0": 18, "A1": 19, "A2": 20, "A3": 21, "A4": 22, "A5": 23}
OUT = Path(__file__).resolve().parents[2] / "app" / "static" / "lab" / "presets"

RED, BLACK, GREEN, BLUE, ORANGE, PURPLE = "#dc2626", "#111827", "#16a34a", "#2563eb", "#f59e0b", "#a855f7"


class Board:
    """Макетная плата (и Arduino под ней). Отверстия: 'a12', 'tn5' и т. п."""

    def __init__(self, bx=0, by=0, uno=False):
        self.parts, self.wires, self.n = [], [], 0
        if uno:  # Uno в начале координат, макетная плата над ней
            bx, by = 0, -24 * P
            self.parts.append({"id": "uno1", "type": "uno", "x": 0, "y": 0})
        self.bx, self.by = bx, by
        self.parts.append({"id": "bb1", "type": "breadboard", "x": bx, "y": by})

    def hole(self, name):
        row = name.rstrip("0123456789")
        return self.bx + int(name[len(row):]) * P, self.by + ROWS[row] * P

    def put(self, pid, type_, pin, hole, rot=0, **props):
        """Ставит деталь так, чтобы вывод pin оказался в отверстии hole."""
        hx, hy = self.hole(hole)
        px, py = PINS[type_][pin]
        if rot == 90:
            px, py = -py, px
        elif rot == 180:
            px, py = -px, -py
        self.parts.append({"id": pid, "type": type_, "x": hx - px, "y": hy - py, "rot": rot, "props": props})
        return pid

    def free(self, pid, type_, x, y, **props):
        self.parts.append({"id": pid, "type": type_, "x": x, "y": y, "rot": 0, "props": props})

    def wire(self, a, b, color=GREEN, pts=()):
        self.n += 1
        a = a if "." in a else f"bb1.{a}"
        b = b if "." in b else f"bb1.{b}"
        self.wires.append({"id": f"w{self.n}", "a": a, "b": b, "pts": [{"x": x, "y": y} for x, y in pts], "color": color})

    # ── Провода от Arduino с изгибами ──
    def up(self, pin, hole, color=ORANGE, lane=1):
        """Пин верхнего ряда Uno -> отверстие нижней половины макетки: вверх до полосы lane, вбок, вверх."""
        px = UNO_TOP[pin] * P
        hx, hy = self.hole(hole)
        ly = -lane * P
        self.wire(f"uno1.{pin}", hole, color, [] if px == hx else [(px, ly), (hx, ly)])

    def around(self, pin, hole, color=BLUE, k=1):
        """Пин нижнего ряда Uno -> отверстие макетки: вниз, налево вдоль платы, вверх, к отверстию."""
        px = UNO_BOT[pin] * P
        hx, hy = self.hole(hole)
        dy, sx = (21.5 + 0.5 * k) * P, -(1.2 + 0.6 * k) * P
        self.wire(f"uno1.{pin}", hole, color, [(px, dy), (sx, dy), (sx, hy)])

    def gnd5v(self):
        """GND -> нижняя синяя шина, 5V -> нижняя красная шина, шины - и верхняя синяя соединены справа."""
        self.up("GND.1", "bn12", BLACK)
        self.around("5V", "bp1", RED, k=0)
        rx = self.bx + 32 * P
        self.wire("bn30", "tn30", BLACK, [(self.bx + 30 * P, self.by + 19.2 * P), (rx, self.by + 19.2 * P), (rx, self.hole("tn30")[1])])

    def led_channel(self, k, pin, color="red", pid=None, res=220, lane=1):
        """Светодиод в верхней половине (катод в колонке k), резистор через канавку, провод от пина к j{k+1}."""
        pid = pid or f"led{k}"
        self.put(pid, "led", "K", f"b{k}", color=color)
        self.put(f"r{k}", "resistor", "1", f"e{k + 1}", rot=90, r=res)
        self.up(pin, f"j{k + 1}", ORANGE, lane)
        self.wire(f"a{k}", f"tn{k}", BLACK)
        return pid


def preset(board, title, task, checks, code=""):
    return {"title": title, "task": task, "parts": board.parts, "wires": board.wires, "code": code, "checks": checks}


PRESETS, SOLUTIONS = {}, {}

# ───────────────────── Основы электричества (без Arduino) ─────────────────────
b = Board(0, 0)
b.free("bat1", "battery", -8 * P, 10 * P, v=9)
b.put("led1", "led", "K", "c12", color="red")
b.free("r1", "resistor", 36 * P, 6 * P, r=220)
PRESETS["battery-led"] = preset(b, "Светодиод от батарейки",
    "Соберите цепь: плюс батарейки - резистор - светодиод (длинная ножка, анод, к плюсу) - минус батарейки.\n"
    "Подберите резистор так, чтобы ток через светодиод был от 5 до 20 мА. Подсказка: R = (9 В - 1,8 В) / ток.\n"
    "Проверьте, что будет без резистора, и замените сгоревший светодиод в «Свойствах».",
    [{"type": "led_on", "part": "led1", "label": "Светодиод горит"},
     {"type": "led_current", "part": "led1", "min_ma": 5, "max_ma": 20, "label": "Ток от 5 до 20 мА (резистор подобран верно)"}])
SOLUTIONS["battery-led"] = {"move": {"r1": "d13"}, "props": {"r1": {"r": 470}}, "wires": [("bat1.+", "a17"), ("bat1.-", "a12")]}

b = Board(0, 0)
b.free("bat1", "battery", -8 * P, 10 * P, v=9)
b.put("r1", "resistor", "1", "c5", r=1000)
b.put("r2", "resistor", "1", "c9", r=2200)
b.free("m1", "meter", 36 * P, 8 * P, mode="V")
PRESETS["ohm-law"] = preset(b, "Закон Ома и мультиметр",
    "Резисторы R1 = 1 кОм (колонки 5-9) и R2 = 2,2 кОм (колонки 9-13) стоят последовательно. Подключите батарейку: плюс к a5, минус к a13.\n"
    "Мультиметром в режиме «Напряжение» измерьте напряжение на R2: красный щуп (IN) - к колонке 9, черный (COM) - к колонке 13.\n"
    "Сравните с расчетом делителя: 9 x 2,2 / (1 + 2,2). Потом измерьте ток: мультиметр в режиме «Ток» включают в разрыв цепи.",
    [{"type": "meter", "part": "m1", "mode": "V", "min": 6.0, "max": 6.4, "label": "Мультиметр показывает напряжение на R2 (около 6,2 В)"}])
SOLUTIONS["ohm-law"] = {"wires": [("bat1.+", "a5"), ("bat1.-", "a13"), ("m1.IN", "b9"), ("m1.COM", "b13")], "seconds": 3}

b = Board(0, 0)
b.free("bat1", "battery", -8 * P, 10 * P, v=9)
b.put("ra", "resistor", "1", "c4", r=470)
b.put("la", "led", "K", "b8", color="red")
b.put("rb", "resistor", "1", "h4", r=330)
b.put("lb", "led", "K", "i8", color="blue")
PRESETS["parallel"] = preset(b, "Два светодиода параллельно",
    "Верхняя ветка: резистор 470 Ом (c4-c8) и красный светодиод (катод b8, анод b9). Нижняя ветка: резистор 330 Ом (h4-h8) и синий светодиод (катод i8, анод i9).\n"
    "Подключите ветки к батарейке параллельно: плюс - к колонке 9 (аноды), минус - к колонке 4 (начало резисторов). Верхняя и нижняя половины платы не связаны: соедините их перемычками в колонках 9 и 4.\n"
    "Каждый светодиод должен светиться с током 5-20 мА. Почему у синего свой резистор другого номинала?",
    [{"type": "led_current", "part": "la", "min_ma": 5, "max_ma": 20, "label": "Красный: ток 5-20 мА"},
     {"type": "led_current", "part": "lb", "min_ma": 5, "max_ma": 20, "label": "Синий: ток 5-20 мА"}])
SOLUTIONS["parallel"] = {"wires": [("bat1.+", "a9"), ("e9", "f9"), ("bat1.-", "a4"), ("e4", "f4")]}

b = Board(0, 0)
b.free("bat1", "battery", -8 * P, 10 * P, v=9)
b.put("btn1", "button", "1", "c5")
b.put("r1", "resistor", "1", "c9", r=470)
b.put("led1", "led", "K", "c14", color="green")
PRESETS["button-led"] = preset(b, "Кнопка включает свет",
    "Детали уже на плате: кнопка (c5-c7), резистор (c9-c13) и светодиод (катод c14, анод c15).\n"
    "Соедините проводами в одну цепь: плюс батарейки - кнопка - резистор - светодиод - минус батарейки.\n"
    "Запустите симуляцию и нажимайте кнопку: светодиод должен гореть, только пока кнопка нажата.",
    [{"type": "button_led", "part": "led1", "label": "Светодиод горит только при нажатой кнопке"}])
SOLUTIONS["button-led"] = {"wires": [("bat1.+", "a5"), ("a7", "a9"), ("a13", "a15"), ("a14", "bat1.-")], "press": "btn1"}

b = Board(0, 0)
b.free("bat1", "battery", -8 * P, 10 * P, v=9)
b.put("pot1", "pot", "1", "c5", r=10000)
b.put("r1", "resistor", "1", "c9", r=220)
b.put("led1", "led", "K", "c14", color="yellow")
PRESETS["pot-dimmer"] = preset(b, "Регулятор яркости",
    "Потенциометр работает как переменный резистор: используйте крайний вывод (c5) и средний (c6).\n"
    "Цепь: плюс батарейки - потенциометр - резистор 220 Ом - светодиод - минус.\n"
    "Во время симуляции выберите потенциометр и двигайте ручку в «Свойствах»: яркость должна меняться плавно.",
    [{"type": "fade", "part": "led1", "levels": 4, "label": "Яркость меняется (не меньше 4 уровней)"}])
SOLUTIONS["pot-dimmer"] = {"wires": [("bat1.+", "a5"), ("a6", "a9"), ("a13", "a15"), ("a14", "bat1.-")], "pot_sweep": "pot1"}

# ───────────────────── Arduino: первые программы ─────────────────────
b = Board(uno=True); b.gnd5v(); b.led_channel(12, "13")
PRESETS["blink"] = preset(b, "Мигаем светодиодом",
    "Светодиод подключен к пину 13 через резистор 220 Ом.\n"
    "Измените код так, чтобы светодиод мигал ровно раз в секунду: полсекунды горит, полсекунды не горит.",
    [{"type": "blink", "part": "led12", "min_ms": 900, "max_ms": 1100, "label": "Светодиод мигает с периодом 1 секунда"}],
    "void setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(200);\n  digitalWrite(13, LOW);\n  delay(200);\n}\n")
SOLUTIONS["blink"] = {"code": "void setup(){pinMode(13,OUTPUT);}\nvoid loop(){digitalWrite(13,HIGH);delay(500);digitalWrite(13,LOW);delay(500);}\n"}

b = Board(uno=True); b.gnd5v()
b.led_channel(13, "12", "red", "red", lane=1); b.led_channel(16, "11", "yellow", "yellow", lane=2); b.led_channel(19, "10", "green", "green", lane=1)
PRESETS["traffic"] = preset(b, "Светофор",
    "Красный светодиод на пине 12, желтый на 11, зеленый на 10.\n"
    "Напишите программу светофора: красный 3 секунды, красный и желтый 1 секунда, зеленый 3 секунды, желтый 1 секунда, и снова.",
    [{"type": "led_on", "part": "red", "label": "Красный загорается"}, {"type": "led_on", "part": "yellow", "label": "Желтый загорается"},
     {"type": "led_on", "part": "green", "label": "Зеленый загорается"}],
    "const int RED = 12;\nconst int YELLOW = 11;\nconst int GREEN = 10;\n\nvoid setup() {\n  pinMode(RED, OUTPUT);\n  pinMode(YELLOW, OUTPUT);\n  pinMode(GREEN, OUTPUT);\n}\n\nvoid loop() {\n  // ваш код светофора\n}\n")
SOLUTIONS["traffic"] = {"code": "void setup(){pinMode(10,OUTPUT);pinMode(11,OUTPUT);pinMode(12,OUTPUT);}\nvoid loop(){digitalWrite(12,1);delay(300);digitalWrite(11,1);delay(100);digitalWrite(12,0);digitalWrite(11,0);digitalWrite(10,1);delay(300);digitalWrite(10,0);digitalWrite(11,1);delay(100);digitalWrite(11,0);}\n"}

b = Board(uno=True); b.gnd5v()
b.led_channel(12, "13", "red", "slow", lane=1); b.led_channel(15, "12", "green", "fast", lane=2)
PRESETS["two-blink"] = preset(b, "Два светодиода без delay",
    "Красный светодиод на пине 13 должен мигать с периодом 1 секунда, зеленый на пине 12 - с периодом 0,4 секунды. Одновременно!\n"
    "С delay так не получится: пока программа ждет один светодиод, второй стоит. Используйте millis(): у каждого светодиода своя переменная «когда переключали в последний раз».",
    [{"type": "blink", "part": "slow", "min_ms": 900, "max_ms": 1100, "label": "Красный: период 1 секунда"},
     {"type": "blink", "part": "fast", "min_ms": 350, "max_ms": 450, "label": "Зеленый: период 0,4 секунды"}],
    "const int SLOW = 13;\nconst int FAST = 12;\n\nunsigned long lastSlow = 0;\nbool slowOn = false;\n\nvoid setup() {\n  pinMode(SLOW, OUTPUT);\n  pinMode(FAST, OUTPUT);\n}\n\n"
    "void loop() {\n  if (millis() - lastSlow >= 500) {\n    lastSlow = millis();\n    slowOn = !slowOn;\n    digitalWrite(SLOW, slowOn);\n  }\n  // добавьте такой же блок для FAST с полупериодом 200 мс\n}\n")
SOLUTIONS["two-blink"] = {"code": "unsigned long a=0,b=0;bool x=0,y=0;\nvoid setup(){pinMode(13,OUTPUT);pinMode(12,OUTPUT);}\nvoid loop(){if(millis()-a>=500){a=millis();x=!x;digitalWrite(13,x);}if(millis()-b>=200){b=millis();y=!y;digitalWrite(12,y);}}\n"}

# ───────────────────── Arduino: входы ─────────────────────
b = Board(uno=True); b.gnd5v(); b.led_channel(12, "13", "green", "led1")
b.put("btn1", "button", "1", "g22")
b.up("2", "j22", BLUE, lane=2); b.wire("j24", "bn24", BLACK)
PRESETS["button-arduino"] = preset(b, "Кнопка и Arduino",
    "Кнопка подключена к пину 2 и к GND. Включите встроенный подтягивающий резистор: pinMode(2, INPUT_PULLUP).\n"
    "Тогда digitalRead(2) возвращает LOW, когда кнопка нажата. Сделайте так, чтобы светодиод на пине 13 горел, пока кнопка нажата.",
    [{"type": "button_led", "part": "led1", "label": "Светодиод горит только при нажатой кнопке"}],
    "void setup() {\n  pinMode(13, OUTPUT);\n  pinMode(2, INPUT_PULLUP);\n}\n\nvoid loop() {\n  // прочитайте кнопку и управляйте светодиодом\n}\n")
SOLUTIONS["button-arduino"] = {"code": "void setup(){pinMode(13,OUTPUT);pinMode(2,INPUT_PULLUP);}\nvoid loop(){digitalWrite(13, digitalRead(2)==LOW);}\n", "press": "btn1"}

b = Board(uno=True); b.gnd5v()
b.put("pot1", "pot", "1", "g3")
b.wire("j3", "bn3", BLACK); b.wire("j5", "bp5", RED); b.around("A0", "i4", BLUE)
PRESETS["pot-serial"] = preset(b, "Потенциометр и Serial",
    "Потенциометр подключен к 5V, GND и аналоговому входу A0.\n"
    "Каждые 200 мс выводите в Serial строку вида «A0: 512». Откройте вкладку Serial (кнопка «График» рисует числа) и крутите ручку в «Свойствах».",
    [{"type": "serial", "text": "A0: ", "label": "В Serial приходят строки «A0: число»"}],
    "void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int value = analogRead(A0);\n  // выведите значение в Serial\n  delay(200);\n}\n")
SOLUTIONS["pot-serial"] = {"code": "void setup(){Serial.begin(9600);}\nvoid loop(){Serial.print(\"A0: \");Serial.println(analogRead(A0));delay(200);}\n"}

b = Board(uno=True); b.gnd5v(); b.led_channel(12, "13", "white", "led1")
b.put("ldr1", "ldr", "1", "g3", light=0.8)
b.put("rl", "resistor", "1", "h4", r=10000)
b.wire("j3", "bp3", RED); b.wire("j8", "bn8", BLACK); b.around("A0", "i4", BLUE)
PRESETS["night-light"] = preset(b, "Ночник с фоторезистором",
    "Фоторезистор (g3-g4) и резистор 10 кОм (h4-h8) образуют делитель напряжения на входе A0: чем темнее, тем меньше значение analogRead(A0).\n"
    "Включайте светодиод на пине 13, когда темно, и выключайте, когда светло. Меняйте освещенность в «Свойствах» фоторезистора: проверка смотрит обе ситуации.",
    [{"type": "follow", "part": "led1", "src": "ldr1", "prop": "light", "lt": 0.3, "label": "В темноте светодиод горит, на свету не горит"}],
    "void setup() {\n  pinMode(13, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int light = analogRead(A0);\n  Serial.println(light);\n  // если темно - включите светодиод, иначе выключите\n  delay(100);\n}\n")
SOLUTIONS["night-light"] = {"code": "void setup(){pinMode(13,OUTPUT);}\nvoid loop(){digitalWrite(13, analogRead(A0) < 400);delay(50);}\n",
                            "sweep": {"ldr1": ["light", [0.05, 0.9]]}, "seconds": 8}

b = Board(uno=True); b.gnd5v()
b.put("us1", "sonar", "VCC", "g19", dist=50)
b.wire("j19", "bp19", RED); b.wire("j22", "bn22", BLACK)
b.up("7", "j20", BLUE); b.up("6", "j21", PURPLE)
PRESETS["sonar"] = preset(b, "Ультразвуковой датчик расстояния",
    "HC-SR04: TRIG на пине 7, ECHO на пине 6, питание 5V и GND.\n"
    "Код уже запускает замер и измеряет длину ответного импульса pulseIn. Переведите микросекунды в сантиметры (звук проходит 1 см туда и обратно примерно за 58 мкс) и выводите расстояние в Serial.\n"
    "Меняйте расстояние до препятствия в «Свойствах» датчика: число в Serial должно совпадать.",
    [{"type": "serial_num", "part": "us1", "prop": "dist", "tol": 2, "label": "Serial показывает расстояние в сантиметрах (точность 2 см)"}],
    "const int TRIG = 7;\nconst int ECHO = 6;\n\nvoid setup() {\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  Serial.begin(9600);\n}\n\n"
    "void loop() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n\n"
    "  long duration = pulseIn(ECHO, HIGH);   // длина импульса в микросекундах\n  // long cm = ...\n  Serial.println(duration);\n  delay(200);\n}\n")
SOLUTIONS["sonar"] = {"code": "void setup(){pinMode(7,OUTPUT);pinMode(6,INPUT);Serial.begin(9600);}\nvoid loop(){digitalWrite(7,LOW);delayMicroseconds(2);digitalWrite(7,HIGH);delayMicroseconds(10);digitalWrite(7,LOW);long d=pulseIn(6,HIGH);Serial.println(d/58);delay(100);}\n",
                      "props": {"us1": {"dist": 37}}}

b = Board(uno=True); b.gnd5v()
b.put("t1", "tmp36", "+Vs", "g3", temp=25)
b.wire("j3", "bp3", RED); b.wire("j5", "bn5", BLACK); b.around("A0", "i4", BLUE)
PRESETS["tmp36"] = preset(b, "Термометр на TMP36",
    "Датчик температуры TMP36: питание 5V, выход на A0. Его выход - 0,5 В при 0 °C и плюс 10 мВ на каждый градус.\n"
    "Переведите analogRead(A0) в вольты, а вольты в градусы и выводите температуру в Serial раз в полсекунды.\n"
    "Меняйте температуру в «Свойствах» датчика и следите, чтобы показания совпадали.",
    [{"type": "serial_num", "part": "t1", "prop": "temp", "tol": 1.5, "label": "Serial показывает температуру в °C (точность 1,5 °C)"}],
    "void setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int raw = analogRead(A0);\n  float volts = raw * 5.0 / 1023.0;\n  // float tempC = ...\n  Serial.println(volts);\n  delay(500);\n}\n")
SOLUTIONS["tmp36"] = {"code": "void setup(){Serial.begin(9600);}\nvoid loop(){float v=analogRead(A0)*5.0/1023.0;Serial.println((v-0.5)*100.0);delay(200);}\n", "props": {"t1": {"temp": 31}}}

# ───────────────────── Arduino: выходы ─────────────────────
b = Board(uno=True); b.gnd5v(); b.led_channel(16, "9", "blue", "led1")
PRESETS["fade"] = preset(b, "Плавное мигание (ШИМ)",
    "Светодиод подключен к пину 9: он поддерживает ШИМ (значок ~ на плате).\n"
    "С помощью analogWrite(9, яркость) от 0 до 255 сделайте плавное разгорание и затухание.",
    [{"type": "fade", "part": "led1", "levels": 5, "label": "Яркость меняется плавно (5+ уровней)"}],
    "void setup() {\n  pinMode(9, OUTPUT);\n}\n\nvoid loop() {\n  for (int b = 0; b <= 255; b++) {\n    // analogWrite(...)\n    delay(5);\n  }\n}\n")
SOLUTIONS["fade"] = {"code": "void setup(){pinMode(9,OUTPUT);}\nvoid loop(){for(int b=0;b<=255;b+=5){analogWrite(9,b);delay(20);}for(int b=255;b>=0;b-=5){analogWrite(9,b);delay(20);}}\n"}

b = Board(uno=True); b.gnd5v()
b.put("rgb1", "rgbled", "R", "c15")
for col in (15, 17, 18):
    b.put(f"r{col}", "resistor", "1", f"e{col}", rot=90, r=220)
b.wire("a16", "tn16", BLACK)
b.up("11", "j15", ORANGE); b.up("10", "j17", GREEN, lane=2); b.up("9", "j18", BLUE, lane=1)
PRESETS["rgb"] = preset(b, "RGB-светодиод: смешиваем цвета",
    "RGB-светодиод с общим катодом: красный канал на пине 11, зеленый на 10, синий на 9 (все с ШИМ), у каждого свой резистор.\n"
    "Допишите функцию setColor(r, g, b) и покажите по очереди хотя бы три разных цвета: например красный, зеленый, синий, желтый (красный + зеленый).",
    [{"type": "colors", "part": "rgb1", "count": 3, "label": "Светодиод показывает 3 и больше разных цвета"}],
    "const int R = 11;\nconst int G = 10;\nconst int B = 9;\n\nvoid setColor(int r, int g, int b) {\n  // analogWrite на каждый канал\n}\n\n"
    "void setup() {\n  pinMode(R, OUTPUT);\n  pinMode(G, OUTPUT);\n  pinMode(B, OUTPUT);\n}\n\nvoid loop() {\n  setColor(255, 0, 0);\n  delay(700);\n  // еще цвета\n}\n")
SOLUTIONS["rgb"] = {"code": "void c(int r,int g,int b){analogWrite(11,r);analogWrite(10,g);analogWrite(9,b);}\nvoid setup(){}\nvoid loop(){c(255,0,0);delay(400);c(0,255,0);delay(400);c(0,0,255);delay(400);c(255,255,0);delay(400);}\n"}

b = Board(uno=True); b.gnd5v()
b.put("bz1", "buzzer", "+", "g22")
b.up("8", "j22", ORANGE, lane=2); b.wire("j24", "bn24", BLACK)
PRESETS["buzzer"] = preset(b, "Пищалка и мелодия",
    "Пьезопищалка подключена к пину 8. Функция tone(8, частота, длительность) играет ноту.\n"
    "Сыграйте короткую мелодию из 4-5 нот (например, 262, 294, 330, 349, 392 Гц) с паузами между ними.",
    [{"type": "tone", "part": "bz1", "label": "Пищалка звучит"}],
    "void setup() {\n}\n\nvoid loop() {\n  // tone(8, 262, 200);\n  delay(1000);\n}\n")
SOLUTIONS["buzzer"] = {"code": "void setup(){}\nvoid loop(){tone(8,440);delay(300);noTone(8);delay(100);}\n"}

b = Board(uno=True); b.gnd5v()
b.put("pot1", "pot", "1", "g3")
b.wire("j3", "bn3", BLACK); b.wire("j5", "bp5", RED); b.around("A0", "i4", BLUE)
b.put("servo1", "servo", "GND", "g20")
b.wire("j20", "bn20", BLACK); b.wire("j21", "bp21", RED); b.up("9", "j22", ORANGE, lane=2)
PRESETS["servo"] = preset(b, "Сервопривод и ручка",
    "Сервопривод подключен к пину 9, потенциометр к A0.\n"
    "Сделайте так, чтобы угол сервопривода повторял положение ручки: от 0 до 180 градусов. Используйте map().",
    [{"type": "servo_track", "part": "servo1", "src": "pot1", "tol": 12, "label": "Угол сервопривода повторяет ручку: в начале, середине и конце хода"}],
    "#include <Servo.h>\n\nServo servo;\n\nvoid setup() {\n  servo.attach(9);\n}\n\nvoid loop() {\n  int value = analogRead(A0);\n  // переведите 0-1023 в 0-180 и поверните сервопривод\n  delay(15);\n}\n")
SOLUTIONS["servo"] = {"code": "#include <Servo.h>\nServo s;\nvoid setup(){s.attach(9);}\nvoid loop(){s.write(map(analogRead(A0),0,1023,0,180));delay(15);}\n",
                      "sweep": {"pot1": ["pos", [0.1, 0.5, 0.9]]}, "seconds": 8}

b = Board(uno=True); b.gnd5v()
b.free("bat1", "battery", -9 * P, -27 * P, v=9)
b.wire("bat1.+", "tp1", RED, [(-9 * P, -23 * P)]); b.wire("bat1.-", "tn2", BLACK, [(-7 * P, -22 * P)])
b.put("q1", "npn", "E", "g4")
b.put("rb", "resistor", "1", "i5", r=1000)
b.wire("j4", "bn4", BLACK)
b.up("9", "j9", ORANGE, lane=2)
b.put("m1", "motor", "+", "c10")
b.wire("a10", "tp10", RED)
b.put("d1", "diode", "A", "d12", rot=180)
b.wire("a9", "tp9", RED)
b.wire("f6", "e12", GREEN, [(6 * P, b.hole("f6")[1] - 1.5 * P), (12 * P, b.hole("f6")[1] - 1.5 * P)])
PRESETS["motor"] = preset(b, "Мотор через транзистор",
    "Мотор питается от отдельной батарейки 9 В (верхняя красная шина), а Arduino только «открывает кран»: пин 9 через резистор 1 кОм управляет базой транзистора NPN.\n"
    "Коллектор транзистора соединен с минусом мотора, эмиттер - с общим GND. Диод параллельно мотору защищает транзистор от выброса напряжения.\n"
    "Меняйте скорость мотора через analogWrite(9, ...): разгон, полный ход, торможение.",
    [{"type": "motor_levels", "part": "m1", "levels": 3, "label": "Скорость мотора меняется (3 и больше уровней)"}],
    "const int MOTOR = 9;\n\nvoid setup() {\n  pinMode(MOTOR, OUTPUT);\n}\n\nvoid loop() {\n  analogWrite(MOTOR, 255);   // полный ход\n  delay(1000);\n  // добавьте другие скорости\n}\n")
SOLUTIONS["motor"] = {"code": "void setup(){pinMode(9,OUTPUT);}\nvoid loop(){for(int s=0;s<=255;s+=15){analogWrite(9,s);delay(60);}analogWrite(9,0);delay(300);}\n", "seconds": 7}

# ───────────────────── Проекты ─────────────────────
b = Board(uno=True); b.gnd5v(); b.led_channel(12, "13", "red", "led1")
b.put("us1", "sonar", "VCC", "g19", dist=80)
b.wire("j19", "bp19", RED); b.wire("j22", "bn22", BLACK)
b.up("7", "j20", BLUE); b.up("6", "j21", PURPLE)
b.put("bz1", "buzzer", "+", "g25")
b.up("2", "j25", ORANGE, lane=1); b.wire("j27", "bn27", BLACK)
PRESETS["parking"] = preset(b, "Проект: парктроник",
    "Датчик HC-SR04 (TRIG 7, ECHO 6), пищалка на пине 2 и светодиод на пине 13.\n"
    "Сделайте парктроник: если препятствие ближе 20 см - пищалка звучит и светодиод горит, если дальше - тишина. Для плюса: чем ближе, тем чаще пищит.\n"
    "Во время симуляции двигайте расстояние в «Свойствах» датчика туда и обратно через отметку 20 см: проверка смотрит обе ситуации.",
    [{"type": "follow", "part": "bz1", "src": "us1", "prop": "dist", "lt": 20, "settle": 0.6, "label": "Ближе 20 см пищалка звучит, дальше молчит"},
     {"type": "follow", "part": "led1", "src": "us1", "prop": "dist", "lt": 20, "settle": 0.6, "label": "Ближе 20 см светодиод горит, дальше не горит"}],
    "const int TRIG = 7;\nconst int ECHO = 6;\nconst int BUZZ = 2;\nconst int LED = 13;\n\nlong readCm() {\n  digitalWrite(TRIG, LOW);\n  delayMicroseconds(2);\n  digitalWrite(TRIG, HIGH);\n  delayMicroseconds(10);\n  digitalWrite(TRIG, LOW);\n  return pulseIn(ECHO, HIGH) / 58;\n}\n\n"
    "void setup() {\n  pinMode(TRIG, OUTPUT);\n  pinMode(ECHO, INPUT);\n  pinMode(LED, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  long cm = readCm();\n  Serial.println(cm);\n  // ваша логика парктроника\n  delay(100);\n}\n")
SOLUTIONS["parking"] = {"code": "long cm(){digitalWrite(7,LOW);delayMicroseconds(2);digitalWrite(7,HIGH);delayMicroseconds(10);digitalWrite(7,LOW);return pulseIn(6,HIGH)/58;}\n"
                        "void setup(){pinMode(7,OUTPUT);pinMode(6,INPUT);pinMode(13,OUTPUT);}\nvoid loop(){long d=cm();if(d<20){tone(2,1000);digitalWrite(13,HIGH);}else{noTone(2);digitalWrite(13,LOW);}delay(50);}\n",
                        "sweep": {"us1": ["dist", [10, 60]]}, "seconds": 9}

b = Board(uno=True); b.gnd5v()
b.led_channel(12, "13", "red", "hot", lane=1); b.led_channel(15, "12", "blue", "cold", lane=2)
b.put("t1", "tmp36", "+Vs", "g3", temp=22)
b.wire("j3", "bp3", RED); b.wire("j5", "bn5", BLACK); b.around("A0", "i4", BLUE)
PRESETS["thermo"] = preset(b, "Проект: термометр с сигналами",
    "TMP36 на A0, красный светодиод на пине 13, синий на пине 12.\n"
    "Если температура выше 30 °C - горит красный, если ниже 15 °C - синий, в остальное время оба выключены. Выводите температуру в Serial и смотрите «График».",
    [{"type": "follow", "part": "hot", "src": "t1", "prop": "temp", "gt": 30, "label": "Выше 30 °C горит красный"},
     {"type": "follow", "part": "cold", "src": "t1", "prop": "temp", "lt": 15, "label": "Ниже 15 °C горит синий"}],
    "const int HOT = 13;\nconst int COLD = 12;\n\nvoid setup() {\n  pinMode(HOT, OUTPUT);\n  pinMode(COLD, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  float volts = analogRead(A0) * 5.0 / 1023.0;\n  float tempC = (volts - 0.5) * 100.0;\n  Serial.println(tempC);\n  // включите нужный светодиод\n  delay(200);\n}\n")
SOLUTIONS["thermo"] = {"code": "void setup(){pinMode(13,OUTPUT);pinMode(12,OUTPUT);}\nvoid loop(){float t=(analogRead(A0)*5.0/1023.0-0.5)*100.0;digitalWrite(13,t>30);digitalWrite(12,t<15);delay(50);}\n",
                       "sweep": {"t1": ["temp", [10, 22, 35]]}, "seconds": 10}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.json"):
        if old.stem not in PRESETS:
            old.unlink()
    for name, data in PRESETS.items():
        (OUT / f"{name}.json").write_text(json.dumps(data, ensure_ascii=False, indent=1))
    print("presets:", ", ".join(PRESETS))
