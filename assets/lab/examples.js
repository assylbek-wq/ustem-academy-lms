// Примеры проектов: схема (детали и провода) + программа. Координаты в клетках макетки (P = 15 px).
// Проверка: node tests/e2e/lab_examples.mjs (все выводы существуют, C++ компилируется, MicroPython запускается).
import { P } from "./parts/core.js";

const ROW = { tp: 1, tn: 2, a: 4, b: 5, c: 6, d: 7, e: 8, f: 11, g: 12, h: 13, i: 14, j: 15, bp: 17, bn: 18 };
export const wireColor = (a, b) => {
  const both = a + " " + b;
  if (/GND|\.-$|\.-\b|VSS|\.K\b|\.tn\d|\.bn\d|\.COM$/.test(both) && !/5V|3V|\.\+|VCC|VIN|VBUS|\.tp\d|\.bp\d/.test(both)) return "#212529";
  if (/5V|\.\+|3\.3V|3V3|VIN|VCC|VBUS|\.3V$|\.tp\d|\.bp\d|\+12V|\+Vs|VDD/.test(both)) return "#e03131";
  return "#2f9e44";
};

/**
 * Собрать проект.
 * parts: [id, type, где, props, rot]; где - [x, y] в клетках от платы или "e10" (отверстие макетки bb).
 * wires: ["a b"] или ["a b #цвет"]; ключи "деталь.вывод".
 */
function mk(s) {
  const bb = s.bb === false ? null : { type: s.bbType || "breadboard", at: s.bb || [0, -24] };
  const parts = [{ id: s.board, type: s.board, x: 0, y: 0, rot: 0 }];
  if (bb) parts.push({ id: "bb", type: bb.type, x: bb.at[0] * P, y: bb.at[1] * P, rot: 0 });
  const hole = (h) => {
    const m = /^(tp|tn|bp|bn|[a-j])(\d+)$/.exec(h);
    if (!m || !bb) throw new Error("Нет отверстия " + h + " в " + s.id);
    return [(bb.at[0] + +m[2]) * P, (bb.at[1] + ROW[m[1]]) * P];
  };
  for (const [id, type, at, props, rot] of s.parts || []) {
    const [x, y] = typeof at === "string" ? hole(at) : [at[0] * P, at[1] * P];
    parts.push({ id, type, x, y, rot: rot || 0, props: props || {} });
  }
  const wires = (s.wires || []).map((w, i) => {
    const [a, b, color] = w.split(/\s+/);
    return { id: `w${i + 1}`, a, b, pts: [], color: color || wireColor(a, b) };
  });
  return { id: s.id, title: s.title, group: s.group, board: s.board, desc: s.desc, parts, wires, code: s.code.replace(/^\n/, "") };
}

// Светодиод с резистором на макетке: катод в колонке c, анод в c+1, резистор от катода через канавку на минус
function ledAt(id, c, color = "red", r = 220) {
  return {
    parts: [[id, "led", `e${c}`, { color }], [id + "r", "resistor", `d${c}`, { r }, 90]],
    wires: [`bb.j${c} bb.bn${c}`],
    anode: `bb.a${c + 1}`,
  };
}
const merge = (...xs) => ({ parts: xs.flatMap((x) => x.parts), wires: xs.flatMap((x) => x.wires) });
// шины макетки: питание платы на обе пары шин
const rails = (vcc, gnd) => [`${vcc} bb.bp1`, `${gnd} bb.bn1`, `bb.bp30 bb.tp30`, `bb.bn29 bb.tn29`];

export const DEFAULT_CODE = {
  uno: `// Мигание встроенным светодиодом L (вывод 13)
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
}
`,
  pico: `# Raspberry Pi Pico: мигание встроенным светодиодом (GP25)
from machine import Pin
import time

led = Pin(25, Pin.OUT)

while True:
    led.toggle()
    time.sleep(0.5)
`,
  esp32: `# ESP32: мигание светодиодом на GPIO2
from machine import Pin
import time

led = Pin(2, Pin.OUT)

while True:
    led.value(not led.value())
    time.sleep(0.5)
`,
  microbit: `# micro:bit: сердце на матрице 5 x 5
from microbit import *

while True:
    display.show(Image.HEART)
    sleep(500)
    display.show(Image.HEART_SMALL)
    sleep(500)
`,
};
DEFAULT_CODE.nano = DEFAULT_CODE.uno;
DEFAULT_CODE.mega = DEFAULT_CODE.uno;

const L = [];
const add = (s) => L.push(mk(s));

// ═══════════════════════ Arduino Uno: основы ═══════════════════════
add({ id: "uno-blink", group: "Основы", board: "uno", title: "Мигающий светодиод", bb: false,
  desc: "Первый скетч: встроенный светодиод L на выводе 13.", code: DEFAULT_CODE.uno });

{ const a = ledAt("red", 6, "red"), b = ledAt("yel", 12, "yellow"), c = ledAt("grn", 18, "green");
  const m = merge(a, b, c);
  add({ id: "uno-traffic", group: "Основы", board: "uno", title: "Светофор",
    desc: "Три светодиода с резисторами 220 Ом, переключение по времени.",
    parts: m.parts, wires: [...m.wires, "uno.GND.1 bb.bn1", `uno.12 ${a.anode}`, `uno.11 ${b.anode}`, `uno.10 ${c.anode}`],
    code: `
const int RED = 12, YELLOW = 11, GREEN = 10;

void setup() {
  pinMode(RED, OUTPUT);
  pinMode(YELLOW, OUTPUT);
  pinMode(GREEN, OUTPUT);
}

void loop() {
  digitalWrite(RED, HIGH);              // красный
  delay(3000);
  digitalWrite(YELLOW, HIGH);           // красный + желтый
  delay(1000);
  digitalWrite(RED, LOW);
  digitalWrite(YELLOW, LOW);
  digitalWrite(GREEN, HIGH);            // зеленый
  delay(3000);
  for (int i = 0; i < 3; i++) {         // зеленый мигает
    digitalWrite(GREEN, LOW);  delay(400);
    digitalWrite(GREEN, HIGH); delay(400);
  }
  digitalWrite(GREEN, LOW);
  digitalWrite(YELLOW, HIGH);           // желтый
  delay(1000);
  digitalWrite(YELLOW, LOW);
}
` }); }

{ const a = ledAt("led1", 10, "blue");
  add({ id: "uno-fade", group: "Основы", board: "uno", title: "Плавное свечение (ШИМ)",
    desc: "analogWrite на выводе 9 с ШИМ: яркость меняется от 0 до 255.",
    parts: a.parts, wires: [...a.wires, "uno.GND.1 bb.bn1", `uno.9 ${a.anode}`],
    code: `
const int LED = 9;   // вывод с ШИМ (значок ~ на плате)

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  for (int b = 0; b <= 255; b += 5) { analogWrite(LED, b); delay(20); }
  for (int b = 255; b >= 0; b -= 5) { analogWrite(LED, b); delay(20); }
}
` }); }

{ const a = ledAt("led1", 16, "green");
  add({ id: "uno-button", group: "Основы", board: "uno", title: "Кнопка и светодиод",
    desc: "INPUT_PULLUP: кнопка замыкает вывод 2 на землю, нажатия считаются в мониторе порта.",
    parts: [["btn", "button", "e6"], ...a.parts],
    wires: [...a.wires, ...rails("uno.5V", "uno.GND.1"), "uno.2 bb.a6", "bb.a8 bb.tn8", `uno.13 ${a.anode}`],
    code: `
const int BUTTON = 2, LED = 13;
int count = 0;
bool was = false;

void setup() {
  pinMode(BUTTON, INPUT_PULLUP);   // внутренний подтягивающий резистор
  pinMode(LED, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  bool pressed = digitalRead(BUTTON) == LOW;
  digitalWrite(LED, pressed);
  if (pressed && !was) {
    count++;
    Serial.print("Нажатий: ");
    Serial.println(count);
  }
  was = pressed;
  delay(10);   // защита от дребезга
}
` }); }

{ const a = ledAt("led1", 18, "yellow");
  add({ id: "uno-pot", group: "Основы", board: "uno", title: "Потенциометр: яркость и график",
    desc: "analogRead 0..1023 на A0, яркость светодиода через map(). Откройте плоттер.",
    parts: [["pot", "pot", "e6", { pos: 0.4 }], ...a.parts],
    wires: [...a.wires, ...rails("uno.5V", "uno.GND.1"), "bb.a6 bb.tp6", "bb.a8 bb.tn8", "bb.a7 uno.A0", `uno.9 ${a.anode}`],
    code: `
void setup() {
  Serial.begin(9600);
  pinMode(9, OUTPUT);
}

void loop() {
  int raw = analogRead(A0);              // 0..1023
  float volts = raw * 5.0 / 1023.0;
  analogWrite(9, map(raw, 0, 1023, 0, 255));
  Serial.print(raw);
  Serial.print(" ");
  Serial.println(volts);
  delay(50);
}
` }); }

add({ id: "uno-rgb", group: "Основы", board: "uno", title: "RGB-светодиод: радуга",
  desc: "Три канала ШИМ на одном светодиоде с общим катодом.",
  parts: [["rgb", "rgbled", "e10"], ["rr", "resistor", "d10", { r: 220 }, 90], ["rg", "resistor", "d12", { r: 220 }, 90], ["rb", "resistor", "d13", { r: 220 }, 90]],
  wires: ["uno.GND.1 bb.bn1", "bb.a11 bb.tn11", "bb.bn29 bb.tn29", "uno.11 bb.j10", "uno.10 bb.j12", "uno.9 bb.j13"],
  code: `
const int R = 11, G = 10, B = 9;

void color(int r, int g, int b) {
  analogWrite(R, r); analogWrite(G, g); analogWrite(B, b);
}

void setup() {}

void loop() {
  for (int i = 0; i < 256; i += 4) { color(255 - i, i, 0); delay(15); }   // красный -> зеленый
  for (int i = 0; i < 256; i += 4) { color(0, 255 - i, i); delay(15); }   // зеленый -> синий
  for (int i = 0; i < 256; i += 4) { color(i, 0, 255 - i); delay(15); }   // синий -> красный
}
` });

add({ id: "uno-melody", group: "Звук", board: "uno", title: "Мелодия на пищалке", bb: false,
  desc: "tone(вывод, частота, длительность): ноты по частотам.",
  parts: [["buz", "buzzer", [12, -5]]],
  wires: ["uno.8 buz.+", "uno.GND.1 buz.-"],
  code: `
// «В траве сидел кузнечик» (начало), ноты в герцах
const int BUZ = 8;
int notes[] = { 440, 330, 440, 330, 440, 415, 415, 0, 415, 330, 415, 330, 415, 440, 440, 0 };

void setup() {}

void loop() {
  for (int i = 0; i < 16; i++) {
    if (notes[i]) tone(BUZ, notes[i], 220);
    delay(260);
  }
  noTone(BUZ);
  delay(1000);
}
` });

// ═══════════════════════ Arduino Uno: датчики ═══════════════════════
add({ id: "uno-sonar", group: "Датчики", board: "uno", title: "Дальномер HC-SR04", bb: false,
  desc: "Импульс TRIG 10 мкс, ширина ECHO / 58 = сантиметры. Меняйте расстояние в свойствах датчика.",
  parts: [["son", "sonar", [12, -5], { dist: 35 }]],
  wires: ["uno.5V son.VCC", "uno.7 son.TRIG", "uno.6 son.ECHO", "uno.GND.1 son.GND"],
  code: `
const int TRIG = 7, ECHO = 6;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
}

void loop() {
  digitalWrite(TRIG, LOW);  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  int cm = us / 58;
  Serial.print("Расстояние: ");
  Serial.print(cm);
  Serial.println(" см");
  delay(200);
}
` });

add({ id: "uno-parking", group: "Проекты", board: "uno", title: "Парктроник", bb: false,
  desc: "Чем ближе препятствие, тем чаще пищит. Ближе 10 см - сплошной сигнал.",
  parts: [["son", "sonar", [12, -5], { dist: 60 }], ["buz", "buzzer_mod", [22, -5]]],
  wires: ["uno.5V son.VCC", "uno.7 son.TRIG", "uno.6 son.ECHO", "uno.GND.1 son.GND", "uno.5V buz.VCC", "uno.4 buz.I/O", "uno.GND.1 buz.GND"],
  code: `
const int TRIG = 7, ECHO = 6, BUZ = 4;   // модуль пищалки включается уровнем LOW

int distance() {
  digitalWrite(TRIG, HIGH); delayMicroseconds(10); digitalWrite(TRIG, LOW);
  return pulseIn(ECHO, HIGH, 30000) / 58;
}

void setup() {
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT); pinMode(BUZ, OUTPUT);
  digitalWrite(BUZ, HIGH);
  Serial.begin(9600);
}

void loop() {
  int cm = distance();
  Serial.println(cm);
  if (cm > 0 && cm < 10) { digitalWrite(BUZ, LOW); delay(100); }
  else if (cm > 0 && cm < 100) {
    digitalWrite(BUZ, LOW);  delay(60);
    digitalWrite(BUZ, HIGH); delay(cm * 8);
  } else { digitalWrite(BUZ, HIGH); delay(100); }
}
` });

add({ id: "uno-dht-lcd", group: "Дисплеи", board: "uno", title: "Метеостанция: DHT22 и LCD 1602", bb: false,
  desc: "Температура и влажность на дисплее с I2C-переходником (адрес 0x27).",
  parts: [["dht", "dht22", [4, -5], { temp: 23.5, hum: 41 }], ["lcd", "lcd_i2c", [14, -5]]],
  wires: ["uno.5V dht.VCC", "uno.2 dht.DATA", "uno.GND.1 dht.GND", "uno.GND.1 lcd.GND", "uno.5V lcd.VCC", "uno.SDA lcd.SDA", "uno.SCL lcd.SCL"],
  code: `
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(2, DHT22);

void setup() {
  lcd.init();
  lcd.backlight();
  dht.begin();
  lcd.print("Meteostanciya");
  delay(1000);
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  lcd.clear();
  if (isnan(t)) { lcd.print("Net datchika"); delay(1000); return; }
  lcd.setCursor(0, 0);
  lcd.print("Temp: "); lcd.print(t, 1); lcd.print((char)223); lcd.print("C");
  lcd.setCursor(0, 1);
  lcd.print("Vlazh: "); lcd.print(h, 0); lcd.print(" %");
  delay(2000);
}
` });

add({ id: "uno-tmp36", group: "Датчики", board: "uno", title: "Термометр TMP36 и плоттер", bb: false,
  desc: "Аналоговый датчик: 10 мВ на градус, 0,5 В при 0 °C. Меняйте температуру в свойствах.",
  parts: [["tmp", "tmp36", [16, 25], { temp: 21 }]],
  wires: ["uno.5V tmp.+Vs", "uno.A0 tmp.Vout", "uno.GND.3 tmp.GND"],
  code: `
void setup() {
  Serial.begin(9600);
}

void loop() {
  float volts = analogRead(A0) * 5.0 / 1023.0;
  float celsius = (volts - 0.5) * 100.0;
  Serial.println(celsius);
  delay(200);
}
` });

add({ id: "uno-nightlight", group: "Проекты", board: "uno", title: "Ночник с реле и фоторезистором",
  desc: "Делитель LDR + 10 кОм на A0. Темно - реле включает лампу.",
  parts: [["ldr", "ldr", "e8", { light: 0.7 }], ["r1", "resistor", "d9", { r: 10000 }], ["rel", "relay", [30, -6]], ["lamp", "led", [35, -14], { color: "white" }], ["bat", "battery", [38, -10]]],
  wires: [...rails("uno.5V", "uno.GND.1"), "bb.a8 bb.tp8", "bb.a13 bb.tn13", "bb.c9 uno.A0", "uno.7 rel.S", "uno.5V rel.+", "uno.GND.1 rel.-",
    "bat.+ rel.COM", "rel.NO lamp.A", "lamp.K bat.-"],
  code: `
const int RELAY = 7;

void setup() {
  pinMode(RELAY, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int light = analogRead(A0);    // больше - светлее
  Serial.println(light);
  digitalWrite(RELAY, light < 400 ? HIGH : LOW);
  delay(200);
}
` });

add({ id: "uno-pir", group: "Датчики", board: "uno", title: "Сигнализация с датчиком движения", bb: false,
  desc: "HC-SR501 выдает 1 при движении. Нажмите на датчик во время симуляции.",
  parts: [["pir", "pir", [10, -5]], ["buz", "buzzer", [20, -5]]],
  wires: ["uno.5V pir.VCC", "uno.3 pir.OUT", "uno.GND.1 pir.GND", "uno.9 buz.+", "uno.GND.1 buz.-"],
  code: `
void setup() {
  pinMode(3, INPUT);
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (digitalRead(3) == HIGH) {
    Serial.println("Движение!");
    digitalWrite(LED_BUILTIN, HIGH);
    tone(9, 1800, 150); delay(200);
    tone(9, 1200, 150); delay(200);
  } else {
    digitalWrite(LED_BUILTIN, LOW);
    delay(100);
  }
}
` });

add({ id: "uno-joystick", group: "Датчики", board: "uno", title: "Джойстик и монитор порта", bb: false,
  desc: "Две оси на A0 и A1, кнопка на 2. Двигайте ползунки в свойствах.",
  parts: [["joy", "joystick", [14, 25]]],
  wires: ["uno.GND.3 joy.GND", "uno.5V joy.+5V", "uno.A0 joy.VRx", "uno.A1 joy.VRy", "uno.2 joy.SW"],
  code: `
void setup() {
  pinMode(2, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  int x = analogRead(A0), y = analogRead(A1);
  Serial.print(x); Serial.print(" "); Serial.println(y);
  if (digitalRead(2) == LOW) Serial.println("Кнопка");
  delay(100);
}
` });

add({ id: "uno-keypad", group: "Проекты", board: "uno", title: "Кодовый замок на клавиатуре 4 x 4", bb: false,
  desc: "Библиотека Keypad. Код 1234 и # открывает замок (сервопривод).",
  parts: [["kp", "keypad", [12, -6]], ["srv", "servo", [-6, 8]]],
  wires: ["uno.9 kp.R1", "uno.8 kp.R2", "uno.7 kp.R3", "uno.6 kp.R4", "uno.5 kp.C1", "uno.4 kp.C2", "uno.3 kp.C3", "uno.2 kp.C4",
    "uno.GND.2 srv.GND", "uno.5V srv.5V", "uno.10 srv.SIG"],
  code: `
#include <Keypad.h>
#include <Servo.h>

const byte ROWS = 4, COLS = 4;
char keys[ROWS][COLS] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte rowPins[ROWS] = {9, 8, 7, 6};
byte colPins[COLS] = {5, 4, 3, 2};
Keypad pad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);
Servo lock;
String code = "";

void setup() {
  Serial.begin(9600);
  lock.attach(10);
  lock.write(0);
  Serial.println("Введите код и #");
}

void loop() {
  char k = pad.getKey();
  if (!k) return;
  Serial.print(k);
  if (k == '#') {
    Serial.println();
    if (code == "1234") { Serial.println("Открыто"); lock.write(90); delay(3000); lock.write(0); }
    else Serial.println("Неверный код");
    code = "";
  } else if (k == '*') { code = ""; Serial.println(" сброс"); }
  else code += k;
}
` });

// ═══════════════════════ Дисплеи и свет ═══════════════════════
add({ id: "uno-oled", group: "Дисплеи", board: "uno", title: "OLED SSD1306: графика", bb: false,
  desc: "Библиотеки Adafruit_GFX и Adafruit_SSD1306, экран 128 x 64 по I2C (0x3C).",
  parts: [["oled", "oled", [14, -5]], ["pot", "pot", [16, 25]]],
  wires: ["uno.GND.1 oled.GND", "uno.5V oled.VCC", "uno.SCL oled.SCL", "uno.SDA oled.SDA", "uno.5V pot.1", "uno.A0 pot.W", "uno.GND.3 pot.2"],
  code: `
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setup() {
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.setTextColor(SSD1306_WHITE);
}

void loop() {
  int v = analogRead(A0);
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("USTEM Lab");
  display.setTextSize(2);
  display.setCursor(0, 16);
  display.print(v);
  display.drawRect(0, 40, 128, 14, SSD1306_WHITE);
  display.fillRect(2, 42, map(v, 0, 1023, 0, 124), 10, SSD1306_WHITE);
  display.drawCircle(110, 22, 10, SSD1306_WHITE);
  display.display();
  delay(50);
}
` });

add({ id: "uno-neopixel", group: "Дисплеи", board: "uno", title: "Кольцо NeoPixel: радуга", bb: false,
  desc: "Adafruit_NeoPixel, 12 адресных светодиодов WS2812B на выводе 6.",
  parts: [["ring", "neopixel", [16, -9], { count: 12, shape: "ring" }]],
  wires: ["uno.GND.1 ring.GND", "uno.6 ring.DIN", "uno.5V ring.VCC"],
  code: `
#include <Adafruit_NeoPixel.h>

Adafruit_NeoPixel ring(12, 6, NEO_GRB + NEO_KHZ800);

void setup() {
  ring.begin();
  ring.setBrightness(80);
}

void loop() {
  for (long hue = 0; hue < 65536; hue += 1024) {
    for (int i = 0; i < 12; i++) {
      ring.setPixelColor(i, ring.gamma32(ring.ColorHSV(hue + i * 65536L / 12)));
    }
    ring.show();
    delay(20);
  }
}
` });

add({ id: "uno-tm1637", group: "Дисплеи", board: "uno", title: "Секундомер на TM1637", bb: false,
  desc: "TM1637Display: 4 разряда и двоеточие. Кнопка на 4 сбрасывает отсчет.",
  parts: [["disp", "tm1637", [14, -5]], ["btn", "button", [5, -4]]],
  wires: ["uno.2 disp.CLK", "uno.3 disp.DIO", "uno.5V disp.VCC", "uno.GND.1 disp.GND", "uno.4 btn.1", "uno.GND.1 btn.2"],
  code: `
#include <TM1637Display.h>

TM1637Display disp(2, 3);   // CLK, DIO
unsigned long start;

void setup() {
  disp.setBrightness(7);
  pinMode(4, INPUT_PULLUP);
  start = millis();
}

void loop() {
  if (digitalRead(4) == LOW) start = millis();
  unsigned long s = (millis() - start) / 1000;
  int mmss = (s / 60) * 100 + s % 60;
  disp.showNumberDecEx(mmss, 0b01000000, true);   // точка-двоеточие
  delay(100);
}
` });

add({ id: "uno-lcd-parallel", group: "Дисплеи", board: "uno", title: "LCD 1602 без I2C (4 бита)", bb: false,
  desc: "Классическое подключение LiquidCrystal: RS, E, D4-D7, контраст V0 на землю.",
  parts: [["lcd", "lcd_par", [6, -5]]],
  wires: ["uno.GND.1 lcd.VSS", "uno.5V lcd.VDD", "uno.GND.1 lcd.V0", "uno.12 lcd.RS", "uno.GND.1 lcd.RW", "uno.11 lcd.E",
    "uno.5 lcd.D4", "uno.4 lcd.D5", "uno.3 lcd.D6", "uno.2 lcd.D7", "uno.5V lcd.A", "uno.GND.1 lcd.K"],
  code: `
#include <LiquidCrystal.h>

LiquidCrystal lcd(12, 11, 5, 4, 3, 2);   // RS, E, D4, D5, D6, D7

void setup() {
  lcd.begin(16, 2);
  lcd.print("Hello, USTEM!");
}

void loop() {
  lcd.setCursor(0, 1);
  lcd.print("Vremya: ");
  lcd.print(millis() / 1000);
  lcd.print(" s");
  delay(250);
}
` });

{ const leds = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ledAt(`l${i}`, 13 + i * 2, i < 4 ? "green" : "red"));
  const m = merge(...leds);
  const q = ["bb.a5", "bb.j4", "bb.j5", "bb.j6", "bb.j7", "bb.j8", "bb.j9", "bb.j10"];   // Q0..Q7
  add({ id: "uno-595", group: "Основы", board: "uno", title: "Регистр 74HC595: бегущий огонь",
  desc: "Три провода управляют восемью светодиодами: shiftOut на SER, SRCLK, RCLK.",
  parts: [["sr", "hc595", "e4"], ...m.parts],
  wires: [...m.wires, ...rails("uno.5V", "uno.GND.1"),
    "bb.a4 bb.tp4", "bb.j11 bb.bn11", "bb.a7 bb.tn7", "bb.a10 bb.tp10",
    "uno.11 bb.a6", "uno.12 bb.a8", "uno.13 bb.a9", ...leds.map((l, i) => `${q[i]} ${l.anode}`)],
  code: `
const int DATA = 11, LATCH = 12, CLOCK = 13;   // SER, RCLK, SRCLK

void show(byte b) {
  digitalWrite(LATCH, LOW);
  shiftOut(DATA, CLOCK, MSBFIRST, b);
  digitalWrite(LATCH, HIGH);
}

void setup() {
  pinMode(DATA, OUTPUT); pinMode(LATCH, OUTPUT); pinMode(CLOCK, OUTPUT);
}

void loop() {
  for (int i = 0; i < 8; i++) { show(1 << i); delay(120); }
  for (int i = 6; i > 0; i--) { show(1 << i); delay(120); }
}
` }); }

// ═══════════════════════ Движение и механика ═══════════════════════
add({ id: "uno-servo", group: "Движение", board: "uno", title: "Сервопривод: качание", bb: false,
  desc: "Библиотека Servo: угол 0..180 градусов, импульс 0,5-2,4 мс каждые 20 мс.",
  parts: [["srv", "servo", [14, -6]]],
  wires: ["uno.GND.1 srv.GND", "uno.5V srv.5V", "uno.9 srv.SIG"],
  code: `
#include <Servo.h>

Servo s;

void setup() {
  s.attach(9);
}

void loop() {
  for (int a = 0; a <= 180; a += 2) { s.write(a); delay(15); }
  for (int a = 180; a >= 0; a -= 2) { s.write(a); delay(15); }
}
` });

add({ id: "uno-servo-pot", group: "Движение", board: "uno", title: "Сервопривод следует за ручкой", bb: false,
  desc: "map(analogRead(A0), 0, 1023, 0, 180): поверните потенциометр в свойствах.",
  parts: [["srv", "servo", [14, -6]], ["pot", "pot", [16, 25], { pos: 0.3 }]],
  wires: ["uno.GND.1 srv.GND", "uno.5V srv.5V", "uno.9 srv.SIG", "uno.5V pot.1", "uno.A0 pot.W", "uno.GND.3 pot.2"],
  code: `
#include <Servo.h>

Servo s;

void setup() {
  s.attach(9);
}

void loop() {
  s.write(map(analogRead(A0), 0, 1023, 0, 180));
  delay(15);
}
` });

add({ id: "uno-stepper", group: "Движение", board: "uno", title: "Шаговый мотор 28BYJ-48", bb: false,
  desc: "Библиотека Stepper, 2048 шагов на оборот через драйвер ULN2003.",
  parts: [["stp", "stepper", [12, -6]]],
  wires: ["uno.8 stp.IN1", "uno.9 stp.IN2", "uno.10 stp.IN3", "uno.11 stp.IN4", "uno.GND.1 stp.-", "uno.5V stp.+"],
  code: `
#include <Stepper.h>

const int STEPS = 2048;
Stepper motor(STEPS, 8, 10, 9, 11);   // IN1, IN3, IN2, IN4

void setup() {
  motor.setSpeed(12);    // оборотов в минуту
  Serial.begin(9600);
}

void loop() {
  Serial.println("Пол-оборота вперед");
  motor.step(STEPS / 2);
  delay(500);
  Serial.println("Пол-оборота назад");
  motor.step(-STEPS / 2);
  delay(500);
}
` });

add({ id: "uno-motor", group: "Движение", board: "uno", title: "Мотор через транзистор", bb: false,
  desc: "Мотор нельзя питать от вывода: ключ на MOSFET, диод от обратного тока, скорость ШИМ.",
  parts: [["q", "mosfet", [16, -8]], ["m", "motor", [22, -14]], ["d", "diode", [22, -7], {}, 0], ["bat", "aapack", [30, -10]]],
  wires: ["uno.9 q.G", "q.S uno.GND.1", "bat.- uno.GND.1", "bat.+ m.+", "m.- q.D", "d.A q.D", "d.K bat.+"],
  code: `
void setup() {
  pinMode(9, OUTPUT);
}

void loop() {
  for (int s = 0; s <= 255; s += 5) { analogWrite(9, s); delay(40); }
  delay(1000);
  for (int s = 255; s >= 0; s -= 5) { analogWrite(9, s); delay(40); }
  delay(1000);
}
` });

add({ id: "uno-car", group: "Движение", board: "uno", title: "Робот 2WD на L298N", bb: false,
  desc: "Два мотор-редуктора, драйвер L298N и 4 батарейки AA. Едет квадратом: смотрите 3D-вид.",
  parts: [["drv", "l298n", [8, -6]], ["car", "car", [10, -24]], ["bat", "aapack", [28, -6]]],
  wires: ["drv.OUT1 car.ML+", "drv.OUT2 car.ML-", "drv.OUT3 car.MR+", "drv.OUT4 car.MR-", "bat.+ drv.+12V", "bat.- drv.GND", "drv.GND uno.GND.1",
    "uno.5 drv.ENA", "uno.7 drv.IN1", "uno.8 drv.IN2", "uno.12 drv.IN3", "uno.13 drv.IN4", "uno.6 drv.ENB"],
  code: `
const int ENA = 5, IN1 = 7, IN2 = 8, IN3 = 12, IN4 = 13, ENB = 6;

void drive(int left, int right) {     // -255..255
  digitalWrite(IN1, left > 0);  digitalWrite(IN2, left < 0);
  digitalWrite(IN3, right > 0); digitalWrite(IN4, right < 0);
  analogWrite(ENA, abs(left));  analogWrite(ENB, abs(right));
}

void setup() {
  int pins[] = {ENA, IN1, IN2, IN3, IN4, ENB};
  for (int p : pins) pinMode(p, OUTPUT);
}

void loop() {
  drive(160, 160);  delay(1200);   // прямо
  drive(140, -140); delay(700);    // поворот на месте
}
` });

// ═══════════════════════ Arduino Nano и Mega ═══════════════════════
add({ id: "nano-mpu", group: "Датчики", board: "nano", title: "Nano: наклон по MPU6050", bb: false,
  desc: "Регистры MPU6050 по Wire: ускорение по осям, углы наклона в плоттере. Наклоняйте датчик в свойствах.",
  parts: [["imu", "mpu6050", [6, -6], { pitch: 15, roll: -10 }]],
  wires: ["nano.5V imu.VCC", "nano.GND.2 imu.GND", "nano.A5 imu.SCL", "nano.A4 imu.SDA"],
  code: `
#include <Wire.h>

const int MPU = 0x68;

void setup() {
  Wire.begin();
  Wire.beginTransmission(MPU);
  Wire.write(0x6B); Wire.write(0);    // разбудить датчик
  Wire.endTransmission();
  Serial.begin(9600);
}

void loop() {
  Wire.beginTransmission(MPU);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU, 6);
  int16_t ax = Wire.read() << 8 | Wire.read();
  int16_t ay = Wire.read() << 8 | Wire.read();
  int16_t az = Wire.read() << 8 | Wire.read();
  float pitch = atan2(-ax, sqrt((float)ay * ay + (float)az * az)) * 57.3;
  float roll = atan2(ay, az) * 57.3;
  Serial.print(pitch); Serial.print(" "); Serial.println(roll);
  delay(100);
}
` });

add({ id: "nano-rtc", group: "Дисплеи", board: "nano", title: "Nano: часы DS3231 на OLED", bb: false,
  desc: "Время из часов реального времени (BCD по I2C, адрес 0x68) на OLED 0x3C.",
  parts: [["rtc", "ds3231", [2, -6]], ["oled", "oled", [12, -6]]],
  wires: ["nano.5V rtc.VCC", "nano.GND.2 rtc.GND", "nano.A5 rtc.SCL", "nano.A4 rtc.SDA", "nano.5V oled.VCC", "nano.GND.2 oled.GND", "nano.A5 oled.SCL", "nano.A4 oled.SDA"],
  code: `
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 oled(128, 64, &Wire, -1);
byte bcd(byte b) { return (b >> 4) * 10 + (b & 15); }

void setup() {
  Wire.begin();
  oled.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  oled.setTextColor(SSD1306_WHITE);
}

void loop() {
  Wire.beginTransmission(0x68);
  Wire.write(0);
  Wire.endTransmission();
  Wire.requestFrom(0x68, 3);
  byte s = bcd(Wire.read()), m = bcd(Wire.read()), h = bcd(Wire.read() & 0x3F);
  char buf[9];
  sprintf(buf, "%02d:%02d:%02d", h, m, s);
  oled.clearDisplay();
  oled.setTextSize(2);
  oled.setCursor(16, 24);
  oled.print(buf);
  oled.display();
  delay(200);
}
` });

{ const leds = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ledAt(`l${i}`, 7 + i * 4, ["red", "orange", "yellow", "green", "blue", "white", "green", "red"][i]));
  const m = merge(...leds);
  add({ id: "mega-chase", group: "Основы", board: "mega", title: "Mega: бегущий огонь на 8 выводах", bbType: "breadboard_full", bb: [0, -24],
    desc: "Выводы 22-29 двойного разъема Mega, 8 светодиодов на большой макетке.",
    parts: m.parts, wires: [...m.wires, "mega.GND.1 bb.bn1", ...leds.map((l, i) => `mega.${22 + i * 2} ${l.anode}`)],
    code: `
// Выводы 22, 24, ... 36 - ряд двойного разъема справа
int pins[] = {22, 24, 26, 28, 30, 32, 34, 36};

void setup() {
  for (int p : pins) pinMode(p, OUTPUT);
}

void loop() {
  for (int i = 0; i < 8; i++) { digitalWrite(pins[i], HIGH); delay(90); digitalWrite(pins[i], LOW); }
  for (int i = 6; i > 0; i--) { digitalWrite(pins[i], HIGH); delay(90); digitalWrite(pins[i], LOW); }
}
` }); }

add({ id: "mega-pantilt", group: "Движение", board: "mega", title: "Mega: поворотная платформа", bb: false,
  desc: "Два сервопривода и джойстик: оси X и Y управляют поворотом и наклоном.",
  parts: [["pan", "servo", [10, -6]], ["tilt", "servo", [18, -6]], ["joy", "joystick", [34, 25]]],
  wires: ["mega.GND.1 pan.GND", "mega.5V pan.5V", "mega.9 pan.SIG", "mega.GND.1 tilt.GND", "mega.5V tilt.5V", "mega.10 tilt.SIG",
    "mega.GND.3 joy.GND", "mega.5V joy.+5V", "mega.A0 joy.VRx", "mega.A1 joy.VRy", "mega.2 joy.SW"],
  code: `
#include <Servo.h>

Servo pan, tilt;

void setup() {
  pan.attach(9);
  tilt.attach(10);
  Serial.begin(115200);
}

void loop() {
  int x = analogRead(A0), y = analogRead(A1);
  pan.write(map(x, 0, 1023, 0, 180));
  tilt.write(map(y, 0, 1023, 30, 150));
  Serial.print(x); Serial.print(" "); Serial.println(y);
  delay(20);
}
` });

// ═══════════════════════ Raspberry Pi Pico (MicroPython) ═══════════════════════
add({ id: "pico-blink", group: "Raspberry Pi Pico", board: "pico", title: "Pico: встроенный светодиод", bb: false,
  desc: "MicroPython 1.24 на эмуляции RP2040: Pin(25) - светодиод на плате.", code: DEFAULT_CODE.pico });

{ const a = ledAt("led1", 16, "red", 100);   // 3,3 В: резистор меньше, чтобы светодиод был ярким
  add({ id: "pico-pwm", group: "Raspberry Pi Pico", board: "pico", title: "Pico: ШИМ и потенциометр",
    desc: "ADC(26).read_u16() 0..65535 задает яркость светодиода через PWM на GP15.",
    parts: [["pot", "pot", "e6", { pos: 0.6 }], ...a.parts],
    wires: [...a.wires, ...rails("pico.3V3", "pico.GND.3"), "bb.a6 bb.tp6", "bb.a8 bb.tn8", "bb.a7 pico.GP26", `pico.GP15 ${a.anode}`],
    code: `
from machine import Pin, PWM, ADC
import time

pot = ADC(26)            # GP26 = ADC0
led = PWM(Pin(15))
led.freq(1000)

while True:
    v = pot.read_u16()   # 0..65535
    led.duty_u16(v)
    print(v * 3.3 / 65535)
    time.sleep(0.1)
` }); }

add({ id: "pico-lcd", group: "Raspberry Pi Pico", board: "pico", title: "Pico: LCD 1602 по I2C", bb: false,
  desc: "I2C(0) на GP0/GP1, драйвер i2c_lcd (как в уроках по Pico).",
  parts: [["lcd", "lcd_i2c", [6, -6]]],
  wires: ["pico.GND.1 lcd.GND", "pico.VBUS lcd.VCC", "pico.GP0 lcd.SDA", "pico.GP1 lcd.SCL"],
  code: `
from machine import I2C, Pin
from i2c_lcd import I2cLcd
import time

i2c = I2C(0, sda=Pin(0), scl=Pin(1), freq=400000)
print("I2C:", [hex(a) for a in i2c.scan()])
lcd = I2cLcd(i2c, 0x27, 2, 16)
lcd.putstr("Raspberry Pi Pico")

n = 0
while True:
    lcd.move_to(0, 1)
    lcd.putstr("Schet: %d   " % n)
    n += 1
    time.sleep(1)
` });

add({ id: "pico-sonar-oled", group: "Raspberry Pi Pico", board: "pico", title: "Pico: дальномер и OLED", bb: false,
  desc: "hcsr04 + ssd1306: расстояние крупными цифрами и полоска.",
  parts: [["son", "sonar", [2, -6], { dist: 80 }], ["oled", "oled", [12, -6]]],
  wires: ["pico.VBUS son.VCC", "pico.GP2 son.TRIG", "pico.GP3 son.ECHO", "pico.GND.1 son.GND",
    "pico.3V3 oled.VCC", "pico.GND.6 oled.GND", "pico.GP5 oled.SCL", "pico.GP4 oled.SDA"],
  code: `
from machine import Pin, I2C
from hcsr04 import HCSR04
from ssd1306 import SSD1306_I2C
import time

sonar = HCSR04(trigger_pin=2, echo_pin=3)
oled = SSD1306_I2C(128, 64, I2C(0, sda=Pin(4), scl=Pin(5)))

while True:
    try:
        cm = sonar.distance_cm()
    except OSError:
        cm = 0
    oled.fill(0)
    oled.text("Rasstoyanie", 0, 0)
    oled.text("%.1f cm" % cm, 0, 20)
    oled.rect(0, 44, 128, 12, 1)
    oled.fill_rect(2, 46, int(min(cm, 200) / 200 * 124), 8, 1)
    oled.show()
    time.sleep(0.2)
` });

add({ id: "pico-servo", group: "Raspberry Pi Pico", board: "pico", title: "Pico: сервопривод через PWM", bb: false,
  desc: "50 Гц, импульс 0,5-2,5 мс через duty_ns.",
  parts: [["srv", "servo", [8, -6]]],
  wires: ["pico.GND.3 srv.GND", "pico.VBUS srv.5V", "pico.GP16 srv.SIG"],
  code: `
from machine import Pin, PWM
import time

servo = PWM(Pin(16))
servo.freq(50)

def angle(a):
    servo.duty_ns(int(500000 + a / 180 * 2000000))

while True:
    for a in range(0, 181, 30):
        angle(a)
        time.sleep(0.4)
` });

// ═══════════════════════ ESP32 (MicroPython) ═══════════════════════
add({ id: "esp32-blink", group: "ESP32", board: "esp32", title: "ESP32: мигание", bb: false,
  desc: "Встроенный синий светодиод на GPIO2.", code: DEFAULT_CODE.esp32 });

add({ id: "esp32-weather", group: "ESP32", board: "esp32", title: "ESP32: DHT22 и OLED", bb: false,
  desc: "Модули dht и ssd1306, I2C на GPIO21/22 (SDA/SCL по умолчанию).",
  parts: [["dht", "dht22", [3, -6], { temp: 26, hum: 55 }], ["oled", "oled", [11, -6]]],
  wires: ["esp32.3V3 dht.VCC", "esp32.4 dht.DATA", "esp32.GND.2 dht.GND", "esp32.3V3 oled.VCC", "esp32.GND.2 oled.GND", "esp32.22 oled.SCL", "esp32.21 oled.SDA"],
  code: `
from machine import Pin, SoftI2C
import dht, ssd1306, time

sensor = dht.DHT22(Pin(4))
oled = ssd1306.SSD1306_I2C(128, 64, SoftI2C(scl=Pin(22), sda=Pin(21)))

while True:
    sensor.measure()
    t, h = sensor.temperature(), sensor.humidity()
    print(t, h)
    oled.fill(0)
    oled.text("ESP32 meteo", 0, 0)
    oled.text("T: %.1f C" % t, 0, 24)
    oled.text("H: %.0f %%" % h, 0, 40)
    oled.show()
    time.sleep(2)
` });

add({ id: "esp32-neopixel", group: "ESP32", board: "esp32", title: "ESP32: лента NeoPixel", bb: false,
  desc: "Модуль neopixel: 16 светодиодов, бегущая точка и заливка.",
  parts: [["strip", "neopixel", [4, -5], { count: 16, shape: "strip" }]],
  wires: ["esp32.GND.2 strip.GND", "esp32.5 strip.DIN", "esp32.5V strip.VCC"],
  code: `
from machine import Pin
from neopixel import NeoPixel
import time

np = NeoPixel(Pin(5), 16)

def wheel(p):
    p %= 255
    if p < 85:
        return (255 - p * 3, p * 3, 0)
    if p < 170:
        p -= 85
        return (0, 255 - p * 3, p * 3)
    p -= 170
    return (p * 3, 0, 255 - p * 3)

k = 0
while True:
    for i in range(16):
        np[i] = wheel(k + i * 16)
    np.write()
    k += 5
    time.sleep_ms(30)
` });

{ const a = ledAt("led1", 16, "red");
  add({ id: "esp32-irq", group: "ESP32", board: "esp32", title: "ESP32: прерывание от кнопки",
    desc: "Pin.irq: счетчик нажатий без опроса в цикле, светодиод переключается.",
    parts: [["btn", "button", "e6"], ...a.parts],
    wires: [...a.wires, ...rails("esp32.3V3", "esp32.GND.2"), "esp32.15 bb.a6", "bb.a8 bb.tn8", `esp32.13 ${a.anode}`],
    code: `
from machine import Pin
import time

led = Pin(13, Pin.OUT)
btn = Pin(15, Pin.IN, Pin.PULL_UP)
count = 0

def pressed(pin):
    global count
    count += 1
    led.value(not led.value())

btn.irq(trigger=Pin.IRQ_FALLING, handler=pressed)

while True:
    print("Нажатий:", count)
    time.sleep(1)
` }); }

add({ id: "esp32-fan", group: "ESP32", board: "esp32", title: "ESP32: вентилятор по температуре", bb: false,
  desc: "Термистор NTC в делителе на АЦП GPIO34, вентилятор через транзистор с ШИМ.",
  parts: [["th", "thermistor", [3, -4], { temp: 30 }], ["r1", "resistor", [3, -7], { r: 10000 }], ["q", "npn", [12, -4]], ["rb", "resistor", [12, -8], { r: 1000 }], ["fan", "fan", [18, -10]]],
  wires: ["esp32.3V3 r1.1", "r1.2 th.1", "th.2 esp32.GND.1", "r1.2 esp32.34", "esp32.25 rb.1", "rb.2 q.B", "q.E esp32.GND.2", "fan.- q.C", "fan.+ esp32.5V"],
  code: `
from machine import Pin, ADC, PWM
import math, time

adc = ADC(Pin(34))
adc.atten(ADC.ATTN_11DB)
fan = PWM(Pin(25), freq=1000)

def celsius():
    v = adc.read_u16() / 65535 * 3.3
    r = max(1, 10000 * v / max(0.01, 3.3 - v))   # сопротивление термистора
    return 1 / (math.log(r / 10000) / 3950 + 1 / 298.15) - 273.15

while True:
    t = celsius()
    duty = 0 if t < 25 else min(1, (t - 25) / 10)
    fan.duty_u16(int(duty * 65535))
    print("%.1f" % t, int(duty * 100))
    time.sleep(0.5)
` });

// ═══════════════════════ BBC micro:bit (MicroPython) ═══════════════════════
add({ id: "mb-heart", group: "micro:bit", board: "microbit", title: "micro:bit: сердце", bb: false,
  desc: "Матрица 5 x 5 и встроенные картинки Image.", code: DEFAULT_CODE.microbit });

add({ id: "mb-buttons", group: "micro:bit", board: "microbit", title: "micro:bit: счетчик на кнопках", bb: false,
  desc: "A - плюс, B - минус, A+B - сброс. Нажимайте кнопки на плате мышью.",
  code: `
from microbit import *

n = 0
while True:
    if button_a.is_pressed() and button_b.is_pressed():
        n = 0
        sleep(300)
    elif button_a.was_pressed():
        n += 1
    elif button_b.was_pressed():
        n -= 1
    display.show(str(n) if 0 <= n < 10 else "?")
    sleep(50)
` });

add({ id: "mb-level", group: "micro:bit", board: "microbit", title: "micro:bit: уровень", bb: false,
  desc: "Акселерометр: точка катится в сторону наклона. Наклон - ползунки в свойствах платы.",
  code: `
from microbit import *

while True:
    x = accelerometer.get_x()
    y = accelerometer.get_y()
    col = min(4, max(0, (x + 1024) * 5 // 2048))
    row = min(4, max(0, (y + 1024) * 5 // 2048))
    display.clear()
    display.set_pixel(col, row, 9)
    sleep(50)
` });

add({ id: "mb-music", group: "micro:bit", board: "microbit", title: "micro:bit: мелодия", bb: false,
  desc: "Модуль music, встроенный динамик на P0. Кнопка A - играть.",
  code: `
from microbit import *
import music

display.show(Image.MUSIC_QUAVER)
while True:
    if button_a.was_pressed():
        music.play(music.BIRTHDAY)
    if button_b.was_pressed():
        music.play(music.POWER_UP)
    sleep(50)
` });

add({ id: "mb-light", group: "micro:bit", board: "microbit", title: "micro:bit: светомер и температура", bb: false,
  desc: "display.read_light_level() как столбики, temperature() в монитор порта.",
  code: `
from microbit import *

while True:
    level = display.read_light_level()   # 0..255
    print(level, temperature())
    bars = level * 5 // 256 + 1
    display.clear()
    for x in range(5):
        for y in range(5 - bars, 5):
            display.set_pixel(x, y, 7)
    sleep(200)
` });

add({ id: "mb-servo", group: "micro:bit", board: "microbit", title: "micro:bit: сервопривод от наклона", bb: false,
  desc: "write_analog на P1 с периодом 20 мс: угол следует за наклоном по X.",
  parts: [["srv", "servo", [6, -6]]],
  wires: ["microbit.GND.1 srv.GND", "microbit.3V srv.5V", "microbit.P1 srv.SIG"],
  code: `
from microbit import *

pin1.set_analog_period(20)

def angle(a):
    # 0,5..2,5 мс из 20 мс -> 26..128 из 1023
    pin1.write_analog(int(26 + a / 180 * 102))

while True:
    x = accelerometer.get_x()
    a = min(180, max(0, (x + 1024) * 180 // 2048))
    angle(a)
    sleep(30)
` });

export const EXAMPLES = L;
