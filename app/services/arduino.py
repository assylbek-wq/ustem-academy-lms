"""Компиляция скетчей Arduino Uno для лаборатории (симулятор работает в браузере на avr8js).

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
VARIANT = ROOT / "variants" / "standard"
LIBS = {"Servo.h": ROOT / "libraries" / "Servo"}
BUILD_DIR = Path(os.environ.get("ARDUINO_BUILD_DIR", Path(tempfile.gettempdir()) / "academy-arduino"))

MAX_SOURCE = 30_000
TIMEOUT = 25
ALLOWED_INCLUDES = {"Arduino.h", "Servo.h", "math.h", "stdlib.h", "string.h", "stdint.h", "avr/pgmspace.h"}
FORBIDDEN = re.compile(r"\b(asm|__asm__|__asm|incbin|_Pragma)\b|#\s*pragma|#\s*include_next|#\s*import|#\s*line")
INCLUDE_RE = re.compile(r'^\s*#\s*include\s*[<"]([^>"]+)[>"]', re.M)

FLAGS = ["-mmcu=atmega328p", "-DF_CPU=16000000L", "-DARDUINO=10819", "-DARDUINO_AVR_UNO", "-DARDUINO_ARCH_AVR",
         "-Os", "-w", "-ffunction-sections", "-fdata-sections"]
CXXFLAGS = ["-std=gnu++11", "-fpermissive", "-fno-exceptions", "-fno-threadsafe-statics"]

_core_lock = threading.Lock()
_cache: OrderedDict[str, dict] = OrderedDict()
_cache_lock = threading.Lock()


class CompileError(Exception):
    pass


def available() -> bool:
    return shutil.which("avr-gcc") is not None and CORE_SRC.is_dir()


def _run(cmd: list[str], cwd: Path) -> subprocess.CompletedProcess:
    env = {"PATH": os.environ.get("PATH", "/usr/bin:/bin"), "LANG": "C"}
    return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, timeout=TIMEOUT, env=env)


def _includes() -> list[str]:
    return ["-I", str(CORE_SRC), "-I", str(VARIANT)] + [a for d in LIBS.values() for a in ("-I", str(d))]


def _build_core() -> Path:
    """Собирает ядро Arduino (и библиотеки) один раз в core.a."""
    lib = BUILD_DIR / "core.a"
    if lib.exists():
        return lib
    with _core_lock:
        if lib.exists():
            return lib
        work = BUILD_DIR / "core-build"
        if work.exists():
            shutil.rmtree(work)
        work.mkdir(parents=True)
        sources = [p for p in CORE_SRC.iterdir() if p.suffix in (".c", ".cpp", ".S")]
        for d in LIBS.values():
            sources += [p for p in d.iterdir() if p.suffix in (".c", ".cpp")]
        objs = []
        for src in sources:
            obj = work / (src.name + ".o")
            if src.suffix == ".c":
                cmd = ["avr-gcc", "-c", *FLAGS, "-std=gnu11", *_includes(), str(src), "-o", str(obj)]
            elif src.suffix == ".S":
                cmd = ["avr-gcc", "-c", "-x", "assembler-with-cpp", *FLAGS, *_includes(), str(src), "-o", str(obj)]
            else:
                cmd = ["avr-g++", "-c", *FLAGS, *CXXFLAGS, *_includes(), str(src), "-o", str(obj)]
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
            raise CompileError(f"Библиотека {inc} недоступна в лаборатории. Можно: {', '.join(sorted(ALLOWED_INCLUDES))}.")


def _clean_errors(text: str) -> str:
    out = []
    for line in text.splitlines():
        line = re.sub(r"^.*?sketch\.cpp:", "sketch:", line)
        if "/vendor/" in line or line.startswith(("In file included", "                 from")):
            continue
        out.append(line)
    return "\n".join(out[:60]).strip()


def compile_sketch(code: str) -> dict:
    """Возвращает {"hex": ..., "size": байт} или поднимает CompileError с текстом ошибки."""
    check_source(code)
    key = hashlib.sha256(code.encode()).hexdigest()
    with _cache_lock:
        if key in _cache:
            _cache.move_to_end(key)
            return _cache[key]
    if not available():
        raise CompileError("Компилятор Arduino на сервере не установлен.")
    core = _build_core()
    with tempfile.TemporaryDirectory(prefix="sketch-", dir=BUILD_DIR) as d:
        work = Path(d)
        protos = _prototypes(_strip_comments(code))
        # #line 1 оставляем только себе: в коде ученика #line запрещен, номера строк в ошибках совпадают с редактором
        src = f'#include <Arduino.h>\n{protos}\n#line 1 "sketch.cpp"\n{code}\n'
        (work / "sketch.cpp").write_text(src)
        r = _run(["avr-g++", "-c", *FLAGS, *CXXFLAGS, *_includes(), "sketch.cpp", "-o", "sketch.o"], work)
        if r.returncode != 0:
            raise CompileError(_clean_errors(r.stderr) or "Ошибка компиляции.")
        r = _run(["avr-gcc", "-mmcu=atmega328p", "-Os", "-Wl,--gc-sections", "-o", "sketch.elf", "sketch.o",
                  str(core), "-lm"], work)
        if r.returncode != 0:
            raise CompileError(_clean_errors(r.stderr) or "Ошибка сборки.")
        r = _run(["avr-objcopy", "-O", "ihex", "-R", ".eeprom", "sketch.elf", "sketch.hex"], work)
        if r.returncode != 0:
            raise CompileError("Не удалось получить HEX.")
        size = _run(["avr-size", "-A", "sketch.elf"], work).stdout
        flash = sum(int(m.group(2)) for m in re.finditer(r"^\.(text|data)\s+(\d+)", size, re.M))
        result = {"hex": (work / "sketch.hex").read_text(), "size": flash}
    with _cache_lock:
        _cache[key] = result
        while len(_cache) > 200:
            _cache.popitem(last=False)
    return result
