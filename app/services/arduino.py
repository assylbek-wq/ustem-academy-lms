"""Компиляция скетчей Arduino (Uno, Nano, Mega 2560) для лаборатории (симулятор работает в браузере на avr8js).

Сервер только компилирует код avr-gcc в Intel HEX. Код ученика на сервере не выполняется.
Защита: только разрешенные #include, запрет asm/.incbin/#pragma (иначе через компилятор можно
прочитать файлы сервера), ограничения размера и времени, отдельная временная папка.
"""
from __future__ import annotations

import hashlib
import os
import re
import shutil
import subprocess
import tempfile
import threading
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "vendor" / "arduino-avr"
CORE_SRC = ROOT / "cores" / "arduino"
LIB_DIR = ROOT / "libraries"
BUILD_DIR = Path(os.environ.get("ARDUINO_BUILD_DIR", Path(tempfile.gettempdir()) / "academy-arduino"))

# Платы: процессор, вариант выводов, макросы как в Arduino IDE, объем flash для отчета
BOARDS = {
    "uno": {"mcu": "atmega328p", "variant": "standard", "define": "ARDUINO_AVR_UNO", "flash": 32256, "title": "Arduino Uno"},
    "nano": {"mcu": "atmega328p", "variant": "eightanaloginputs", "define": "ARDUINO_AVR_NANO", "flash": 30720, "title": "Arduino Nano"},
    "mega": {"mcu": "atmega2560", "variant": "mega", "define": "ARDUINO_AVR_MEGA2560", "flash": 253952, "title": "Arduino Mega 2560"},
}
# Библиотеки: заголовок -> папка в vendor/arduino-avr/libraries
LIBS = {
    "Servo.h": "Servo", "Wire.h": "Wire", "SPI.h": "SPI", "EEPROM.h": "EEPROM", "SoftwareSerial.h": "SoftwareSerial",
    "LiquidCrystal.h": "LiquidCrystal", "LiquidCrystal_I2C.h": "LiquidCrystal_I2C", "Stepper.h": "Stepper",
    "Adafruit_NeoPixel.h": "Adafruit_NeoPixel", "DHT.h": "DHT", "Adafruit_GFX.h": "Adafruit_GFX",
    "Adafruit_SSD1306.h": "Adafruit_SSD1306", "TM1637Display.h": "TM1637", "Keypad.h": "Keypad",
}
LIB_DIRS = sorted(set(LIBS.values())) + ["Adafruit_BusIO"]

MAX_SOURCE = 40_000
TIMEOUT = 40
ALLOWED_INCLUDES = set(LIBS) | {"Arduino.h", "math.h", "stdlib.h", "string.h", "stdint.h", "avr/pgmspace.h", "Fonts/FreeSans9pt7b.h"}
FORBIDDEN = re.compile(r"\b(asm|__asm__|__asm|incbin|_Pragma)\b|#\s*pragma|#\s*include_next|#\s*import|#\s*line")
INCLUDE_RE = re.compile(r'^\s*#\s*include\s*[<"]([^>"]+)[>"]', re.M)
CXXFLAGS = ["-std=gnu++11", "-fpermissive", "-fno-exceptions", "-fno-threadsafe-statics"]


def _flags(board: str) -> list[str]:
    b = BOARDS[board]
    return [f"-mmcu={b['mcu']}", "-DF_CPU=16000000L", "-DARDUINO=10819", f"-D{b['define']}", "-DARDUINO_ARCH_AVR",
            "-Os", "-w", "-ffunction-sections", "-fdata-sections"]


_core_lock = threading.Lock()
_cache: OrderedDict[str, dict] = OrderedDict()
_cache_lock = threading.Lock()


class CompileError(Exception):
    pass


def available() -> bool:
    return shutil.which("avr-gcc") is not None and CORE_SRC.is_dir()


def _lib_paths() -> list[Path]:
    out = []
    for name in LIB_DIRS:
        d = LIB_DIR / name
        out.append(d)
        if (d / "utility").is_dir():
            out.append(d / "utility")
    return out


def _run(cmd: list[str], cwd: Path) -> subprocess.CompletedProcess:
    env = {"PATH": os.environ.get("PATH", "/usr/bin:/bin"), "LANG": "C"}
    return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=TIMEOUT, env=env)


def _includes(board: str) -> list[str]:
    variant = ROOT / "variants" / BOARDS[board]["variant"]
    return ["-I", str(CORE_SRC), "-I", str(variant)] + [a for d in _lib_paths() for a in ("-I", str(d))]


def _build_core(board: str) -> Path:
    """Собирает ядро Arduino и все библиотеки для платы один раз в core-<плата>.a."""
    lib = BUILD_DIR / f"core-{board}.a"
    if lib.exists():
        return lib
    with _core_lock:
        if lib.exists():
            return lib
        work = BUILD_DIR / f"core-build-{board}"
        if work.exists():
            shutil.rmtree(work)
        work.mkdir(parents=True)
        sources = [p for p in CORE_SRC.iterdir() if p.suffix in (".c", ".cpp", ".S")]
        for d in _lib_paths():
            sources += [p for p in d.iterdir() if p.suffix in (".c", ".cpp")]
        flags, inc = _flags(board), _includes(board)
        objs = []
        for src in sources:
            obj = work / (src.parent.name + "_" + src.name + ".o")
            if src.suffix == ".c":
                cmd = ["avr-gcc", "-c", *flags, "-std=gnu11", *inc, str(src), "-o", str(obj)]
            elif src.suffix == ".S":
                cmd = ["avr-gcc", "-c", "-x", "assembler-with-cpp", *flags, *inc, str(src), "-o", str(obj)]
            else:
                cmd = ["avr-g++", "-c", *flags, *CXXFLAGS, *inc, str(src), "-o", str(obj)]
            r = _run(cmd, work)
            if r.returncode != 0:
                raise RuntimeError(f"core build failed on {src.name}: {r.stderr[-2000:]}")
            objs.append(str(obj))
        tmp = work / "core.a"
        r = _run(["avr-ar", "rcs", str(tmp), *objs], work)
        if r.returncode != 0:
            raise RuntimeError("avr-ar failed: " + r.stderr)
        os.replace(tmp, lib)
        return lib


_FUNC_RE = re.compile(
    r"^[ \t]*((?:static\s+|inline\s+|unsigned\s+|signed\s+|const\s+|long\s+)*"
    r"[A-Za-z_][\w:<>]*[\s\*&]+)([A-Za-z_]\w*)\s*\(([^;{}()]*)\)\s*(?=\{)", re.M)


def _prototypes(code: str) -> str:
    """Как Arduino IDE: объявляет функции заранее, чтобы их можно было вызывать до определения."""
    depth, top = 0, []
    for i, ch in enumerate(code):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth = max(0, depth - 1)
        top.append(depth)
    protos = []
    for m in _FUNC_RE.finditer(code):
        if top[m.start()] != 0 or m.group(2) in ("setup", "loop", "if", "while", "for", "switch"):
            continue
        ret = m.group(1).strip()
        if ret in ("return", "else", "new", "delete"):
            continue
        protos.append(f"{ret} {m.group(2)}({m.group(3).strip()});")
    return "\n".join(dict.fromkeys(protos))


def _strip_comments(code: str) -> str:
    code = re.sub(r"/\*.*?\*/", " ", code, flags=re.S)
    return re.sub(r"//[^\n]*", "", code)


def check_source(code: str) -> None:
    if len(code) > MAX_SOURCE:
        raise CompileError(f"Скетч слишком длинный (больше {MAX_SOURCE} символов).")
    plain = _strip_comments(code)
    if FORBIDDEN.search(plain):
        raise CompileError("В лаборатории нельзя использовать asm, #pragma и похожие директивы.")
    if len(re.findall(r"#\s*include", plain)) != len(INCLUDE_RE.findall(plain)):
        raise CompileError("Подключайте библиотеки так: #include <Servo.h>")
    for inc in INCLUDE_RE.findall(plain):
        if inc not in ALLOWED_INCLUDES:
            raise CompileError(f"Библиотека {inc} недоступна в лаборатории. Можно: {', '.join(sorted(LIBS))}.")


def _clean_errors(text: str) -> str:
    out = []
    for line in text.splitlines():
        line = re.sub(r"^.*?sketch\.cpp:", "sketch:", line)
        if "/vendor/" in line or line.startswith(("In file included", "                 from")):
            continue
        out.append(line)
    return "\n".join(out[:60]).strip()


def compile_sketch(code: str, board: str = "uno") -> dict:
    """Возвращает {"hex": ..., "size": байт, "flash": всего} или поднимает CompileError с текстом ошибки."""
    if board not in BOARDS:
        raise CompileError("Неизвестная плата.")
    check_source(code)
    key = hashlib.sha256((board + "\0" + code).encode()).hexdigest()
    with _cache_lock:
        if key in _cache:
            _cache.move_to_end(key)
            return _cache[key]
    if not available():
        raise CompileError("Компилятор Arduino на сервере не установлен.")
    core = _build_core(board)
    flags, inc = _flags(board), _includes(board)
    with tempfile.TemporaryDirectory(prefix="sketch-", dir=BUILD_DIR) as d:
        work = Path(d)
        protos = _prototypes(_strip_comments(code))
        # #line 1 оставляем только себе: в коде ученика #line запрещен, номера строк в ошибках совпадают с редактором
        src = f'#include <Arduino.h>\n{protos}\n#line 1 "sketch.cpp"\n{code}\n'
        (work / "sketch.cpp").write_text(src)
        r = _run(["avr-g++", "-c", *flags, *CXXFLAGS, *inc, "sketch.cpp", "-o", "sketch.o"], work)
        if r.returncode != 0:
            raise CompileError(_clean_errors(r.stderr) or "Ошибка компиляции.")
        r = _run(["avr-gcc", f"-mmcu={BOARDS[board]['mcu']}", "-Os", "-Wl,--gc-sections", "-o", "sketch.elf", "sketch.o",
                  str(core), "-lm"], work)
        if r.returncode != 0:
            raise CompileError(_clean_errors(r.stderr) or "Ошибка сборки.")
        r = _run(["avr-objcopy", "-O", "ihex", "-R", ".eeprom", "sketch.elf", "sketch.hex"], work)
        if r.returncode != 0:
            raise CompileError("Не удалось получить HEX.")
        size = _run(["avr-size", "-A", "sketch.elf"], work).stdout
        flash = sum(int(m.group(2)) for m in re.finditer(r"^\.(text|data)\s+(\d+)", size, re.M))
        result = {"hex": (work / "sketch.hex").read_text(), "size": flash, "flash": BOARDS[board]["flash"]}
    with _cache_lock:
        _cache[key] = result
        while len(_cache) > 200:
            _cache.popitem(last=False)
    return result
