# Arduino AVR core и библиотеки (vendored)

Источники для компиляции скетчей в лаборатории Академии (Arduino Uno и Nano - ATmega328P, Mega 2560 - ATmega2560):

- `cores/arduino`, `variants/standard` - [arduino/ArduinoCore-avr](https://github.com/arduino/ArduinoCore-avr), тег 1.8.6;
  `variants/eightanaloginputs`, `variants/mega` и библиотеки `Wire`, `SPI`, `EEPROM`, `SoftwareSerial` - из той же
  репозитории (ветка master). LGPL 2.1.
- `libraries/Servo` - [arduino-libraries/Servo](https://github.com/arduino-libraries/Servo), тег 1.2.2 (только AVR),
  исправлен путь `avr/ServoTimers.h` в `Servo.h`.
- `libraries/LiquidCrystal`, `libraries/Stepper` - [arduino-libraries](https://github.com/arduino-libraries), LGPL.
- `libraries/LiquidCrystal_I2C` - [johnrickman/LiquidCrystal_I2C](https://github.com/johnrickman/LiquidCrystal_I2C).
- `libraries/Adafruit_NeoPixel` (LGPL 3, без файлов для ESP, K210, PSoC6, RP2040), `libraries/DHT` (MIT, без
  `DHT_U`), `libraries/Adafruit_GFX`, `libraries/Adafruit_SSD1306` (BSD), `libraries/Adafruit_BusIO` (MIT) - Adafruit.
- `libraries/TM1637` - [avishorp/TM1637](https://github.com/avishorp/TM1637), LGPL 3.
- `libraries/Keypad` - [Chris--A/Keypad](https://github.com/Chris--A/Keypad), GPL 3.

Тексты лицензий - в папке `licenses/`. Кроме указанного, файлы не изменялись.

Для других плат лаборатории (не компилируются, лежат в статике): `app/static/lab/pico/micropython.uf2` - официальная
прошивка [MicroPython](https://micropython.org/download/RPI_PICO/) v1.24.1 для Raspberry Pi Pico (MIT), эмулятор
RP2040 [rp2040js](https://github.com/wokwi/rp2040js) (MIT) и загрузочное ПЗУ RP2040 B1 (BSD 3, Raspberry Pi) в
`assets/lab/mcu/bootrom.js`.
