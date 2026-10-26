// Модуль wb.py для MicroPython симулятора: общая часть программ из блоков SPIKE 3 (Word Blocks).
// Генератор блоков (blocks.js) пишет короткий код вида `await wb.move("forward", 10, "cm")`, а здесь живет
// то, что приложение SPIKE 3 держит в скрытом состоянии программы:
//  - скорость движения 50 %, скорость мотора 75 %, 1 оборот = 17,5 см, моторы движения A+B;
//  - % скорости -> градусы в секунду по наибольшей скорости мотора (motor.info: большой 1050, средний 1110, малый 660);
//  - каждый блок-шапка - отдельная подпрограмма, все идут одновременно; события проверяются каждые 10 мс по фронту
//    (условие стало истинным), подпрограмма не перезапускается, пока работает; «когда я получу» перезапускается;
//  - «остановить все» и «выйти из программы» завершают программу, ошибка в подпрограмме останавливает все и
//    уходит в консоль через _sim.fail.
export const WB_PY = `
import _sim
import asyncio
import io
import math
import random
import sys
import runloop
import motor
import motor_pair
import color_sensor
import distance_sensor
import force_sensor
import color
from hub import port, motion_sensor, light_matrix, sound, button, light

PAIR = motor_pair.PAIR_1
move_speed = 50
cm_per_rotation = 17.5
_pair_ports = (port.A, port.B)
_paired = False
_move_stop = motor.BRAKE
_move_accel = None
_motor_speed = {}
_motor_stop = {}
_motor_accel = {}
_UNIT_CM = {"cm": 1.0, "in": 2.54}
_ACCEL = {"slow": 1000, "medium": 3000, "fast": 10000}
_STOP = {"brake": motor.BRAKE, "hold": motor.HOLD, "coast": motor.COAST}


class StopStack(Exception):
    pass


def _ports(p):
    if isinstance(p, (tuple, list)):
        return tuple(p)
    return (p,)


def _clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


def max_speed(p):
    return motor.info(p)[1]


def _velocity(pct, ports):
    mx = min(max_speed(p) for p in ports)
    return int(_clamp(float(pct), -100, 100) * mx / 100)


def _kw(stop, accel):
    kw = {"stop": stop}
    if accel:
        kw["acceleration"] = accel
        kw["deceleration"] = accel
    return kw


# ---------- Movement ----------

def _ensure_pair():
    global _paired
    if not _paired:
        motor_pair.pair(PAIR, _pair_ports[0], _pair_ports[1])
        _paired = True


def set_move_motors(left, right):
    global _pair_ports, _paired
    _pair_ports = (left, right)
    if _paired:
        motor_pair.unpair(PAIR)
    _paired = False
    _ensure_pair()


def set_move_speed(pct):
    global move_speed
    move_speed = _clamp(float(pct), -100, 100)


def set_rotation_distance(value, unit="cm"):
    global cm_per_rotation
    cm_per_rotation = float(value) * _UNIT_CM.get(unit, 1.0)


def set_move_stop(mode):
    global _move_stop
    _move_stop = _STOP.get(mode, motor.BRAKE)


def set_move_acceleration(mode):
    global _move_accel
    _move_accel = _ACCEL.get(mode, 3000)


def to_degrees(value, unit):
    value = float(value)
    if unit == "rotations":
        return value * 360
    if unit in _UNIT_CM:
        return value * _UNIT_CM[unit] / cm_per_rotation * 360
    return value


async def steer(steering, value, unit="cm", direction=1):
    _ensure_pair()
    steering = int(_clamp(float(steering), -100, 100))
    v = _velocity(move_speed, _pair_ports)
    value = float(value)
    if unit == "seconds":
        if value <= 0:
            return
        await motor_pair.move_for_time(PAIR, int(value * 1000), steering, velocity=v * direction, **_kw(_move_stop, _move_accel))
    else:
        deg = int(to_degrees(value, unit)) * direction
        if deg == 0:
            return
        await motor_pair.move_for_degrees(PAIR, deg, steering, velocity=v, **_kw(_move_stop, _move_accel))


async def move(direction, value, unit="cm"):
    await steer(0, value, unit, -1 if direction == "back" else 1)


def start_steer(steering):
    _ensure_pair()
    kw = {"acceleration": _move_accel} if _move_accel else {}
    motor_pair.move(PAIR, int(_clamp(float(steering), -100, 100)), velocity=_velocity(move_speed, _pair_ports), **kw)


def start_move(direction):
    _ensure_pair()
    v = _velocity(move_speed, _pair_ports)
    kw = {"acceleration": _move_accel} if _move_accel else {}
    motor_pair.move(PAIR, 0, velocity=-v if direction == "back" else v, **kw)


def start_tank(left, right):
    _ensure_pair()
    kw = {"acceleration": _move_accel} if _move_accel else {}
    motor_pair.move_tank(PAIR, _velocity(left, _pair_ports), _velocity(right, _pair_ports), **kw)


def stop_move():
    _ensure_pair()
    motor_pair.stop(PAIR, stop=_move_stop)


async def turn_gyro(angle, max_speed=400):
    _ensure_pair()
    angle = float(angle)
    motion_sensor.reset_yaw(0)
    await runloop.sleep_ms(50)
    while abs(angle - yaw()) > 1:
        error = angle - yaw()
        sp = int(min(max_speed, max(80, abs(error) * 6)))
        if error > 0:
            motor_pair.move_tank(PAIR, sp, -sp)
        else:
            motor_pair.move_tank(PAIR, -sp, sp)
        await runloop.sleep_ms(10)
    motor_pair.stop(PAIR)


# ---------- Motors ----------

def _mvel(p, pct=None):
    return _velocity(_motor_speed.get(p, 75) if pct is None else pct, (p,))


def _mkw(p):
    return _kw(_motor_stop.get(p, motor.BRAKE), _motor_accel.get(p))


async def _all(tasks):
    for t in tasks:
        await t


async def motor_run_for(ports, direction, value, unit="rotations", speed=None):
    value = float(value)
    sign = -1 if direction == "counterclockwise" else 1
    if value < 0:
        sign, value = -sign, -value
    tasks = []
    for p in _ports(ports):
        v = _mvel(p, speed) * sign
        if unit == "seconds":
            tasks.append(motor.run_for_time(p, int(value * 1000), v, **_mkw(p)))
        else:
            tasks.append(motor.run_for_degrees(p, int(to_degrees(value, unit)), v, **_mkw(p)))
    await _all(tasks)


async def motor_go_to(ports, direction, position):
    position = int(float(position)) % 360
    tasks = []
    for p in _ports(ports):
        v = _mvel(p)
        if direction == "shortest":
            tasks.append(motor.run_to_absolute_position(p, position, v, **_mkw(p)))
        else:
            cur = motor.absolute_position(p) % 360
            d = (position - cur) % 360 if direction == "clockwise" else -((cur - position) % 360)
            if d:
                tasks.append(motor.run_for_degrees(p, d, v, **_mkw(p)))
    await _all(tasks)


def motor_start(ports, direction="clockwise", speed=None):
    for p in _ports(ports):
        v = _mvel(p, speed)
        motor.run(p, -v if direction == "counterclockwise" else v)


def motor_stop(ports):
    for p in _ports(ports):
        motor.stop(p, stop=_motor_stop.get(p, motor.BRAKE))


def motor_set_speed(ports, pct):
    for p in _ports(ports):
        _motor_speed[p] = _clamp(float(pct), -100, 100)


def motor_position(p):
    a = motor.absolute_position(p)
    return a + 360 if a < 0 else a


def motor_speed(p):
    return int(motor.velocity(p) * 100 / max_speed(p))


def motor_start_power(ports, pct):
    for p in _ports(ports):
        motor.set_duty_cycle(p, int(_clamp(float(pct), -100, 100) * 100))


def motor_power(p):
    return int(motor.get_duty_cycle(p) / 100)


def motor_set_stop(ports, mode):
    for p in _ports(ports):
        _motor_stop[p] = _STOP.get(mode, motor.BRAKE)


def motor_set_acceleration(ports, mode):
    for p in _ports(ports):
        _motor_accel[p] = _ACCEL.get(mode, 3000)


def motor_set_relative(ports, value):
    for p in _ports(ports):
        motor.reset_relative_position(p, int(float(value)))


async def motor_go_relative(ports, position, speed=75):
    await _all([motor.run_to_relative_position(p, int(float(position)), _mvel(p, speed), **_mkw(p)) for p in _ports(ports)])


# ---------- Light ----------

_img = [0] * 25
_bright = 100
_orient = 0


def _rot(px, k):
    for _ in range(k % 4):
        px = [px[(4 - c) * 5 + r] for r in range(5) for c in range(5)]
    return px


def _draw():
    light_matrix.show([int(v * _bright / 100) for v in _rot(_img, _orient)])


def show_image(pattern):
    global _img
    s = str(pattern)
    _img = [int(s[i]) * 100 // 9 if i < len(s) and s[i].isdigit() else 0 for i in range(25)]
    _draw()


async def show_image_for(pattern, seconds):
    show_image(pattern)
    await runloop.sleep_ms(int(float(seconds) * 1000))
    clear()


async def write(text):
    global _img
    _img = [0] * 25
    await light_matrix.write(str(text), _bright)


def clear():
    global _img
    _img = [0] * 25
    light_matrix.clear()


def set_brightness(pct):
    global _bright
    _bright = int(_clamp(float(pct), 0, 100))
    if any(_img):
        _draw()


def set_pixel(x, y, pct):
    x, y = int(float(x)) - 1, int(float(y)) - 1
    if 0 <= x < 5 and 0 <= y < 5:
        _img[y * 5 + x] = int(_clamp(float(pct), 0, 100))
        _draw()


def rotate(direction):
    global _orient
    _orient = (_orient + (1 if direction == "clockwise" else -1)) % 4
    _draw()


def set_orientation(o):
    global _orient
    _orient = {"upright": 0, "right": 1, "upside_down": 2, "left": 3}.get(o, 0)
    _draw()


def power_light(c):
    light.color(light.POWER, c)


def distance_light(p, values):
    v = [int(_clamp(float(x), 0, 100)) for x in str(values).split()][:4]
    distance_sensor.show(p, v + [0] * (4 - len(v)))


# ---------- Sound ----------

volume = 100
_SOUNDS = {
    "Cat Meow 1": ((76, 120), (72, 220)), "Bonk": ((45, 80),), "Doorbell 1": ((76, 300), (72, 450)),
    "Hello": ((67, 150), (72, 250)), "Robot 1": ((60, 90), (64, 90), (67, 90), (72, 200)),
    "Triumph": ((60, 150), (64, 150), (67, 150), (72, 400)),
}


def _freq(note):
    return int(440 * 2 ** ((float(note) - 69) / 12))


async def beep_for(note, seconds):
    await sound.beep(_freq(note), int(float(seconds) * 1000), volume)


def start_beep(note):
    sound.beep(_freq(note), 1000, volume)


def stop_sound():
    sound.stop()


async def play_sound(name):
    for n, ms in _SOUNDS.get(name, ((60, 200),)):
        await sound.beep(_freq(n), ms, volume)


def start_sound(name):
    asyncio.create_task(play_sound(name))


def set_volume(v):
    global volume
    volume = int(_clamp(float(v), 0, 100))
    sound.volume(volume)


def change_volume(d):
    set_volume(volume + float(d))


# ---------- Sensors ----------

_t0 = _sim.now()


def timer():
    return (_sim.now() - _t0) / 1000


def reset_timer():
    global _t0
    _t0 = _sim.now()


def yaw():
    return -motion_sensor.tilt_angles()[0] / 10


def angle(axis):
    t = motion_sensor.tilt_angles()
    if axis == "yaw":
        return -t[0] / 10
    return t[1 if axis == "pitch" else 2] / 10


def reset_yaw():
    motion_sensor.reset_yaw(0)


def distance(p, unit="cm"):
    mm = distance_sensor.distance(p)
    if mm < 0:
        mm = 2000
    if unit == "%":
        return int(mm / 20)
    if unit == "in":
        return round(mm / 25.4, 1)
    return round(mm / 10, 1)


def is_distance(p, comparator, value, unit="cm"):
    mm = distance_sensor.distance(p)
    if mm < 0:
        return comparator == "farther"
    d = distance(p, unit)
    value = float(value)
    if comparator == "closer":
        return d < value
    if comparator == "farther":
        return d > value
    return abs(d - value) < (1 if unit == "%" else 0.5)


def force(p, unit="%"):
    f = force_sensor.force(p)
    return f / 10 if unit == "N" else f


def is_force(p, option):
    f = force_sensor.force(p)
    if option == "hard_pressed":
        return f > 50
    if option == "released":
        return f == 0
    return force_sensor.pressed(p)


def is_reflection(p, comparator, value):
    r = color_sensor.reflection(p)
    value = float(value)
    return r < value if comparator == "<" else r > value if comparator == ">" else r == value


def raw_color(p, channel):
    return color_sensor.rgbi(p)[{"red": 0, "green": 1, "blue": 2}.get(channel, 0)]


def button_pressed(b):
    return button.pressed(b) > 0


_FACES = {"top": 0, "front": 1, "right": 2, "bottom": 3, "back": 4, "left": 5}


def is_up(face):
    return motion_sensor.up_face() == _FACES.get(face, 0)


def orientation():
    f = motion_sensor.up_face()
    for k in _FACES:
        if _FACES[k] == f:
            return k
    return ""


def is_tilted(direction):
    t = motion_sensor.tilt_angles()
    pitch, roll = t[1] / 10, t[2] / 10
    if direction == "forward":
        return pitch < -15
    if direction == "backward":
        return pitch > 15
    if direction == "left":
        return roll < -15
    if direction == "right":
        return roll > 15
    return abs(pitch) > 15 or abs(roll) > 15


_GESTURES = {"tapped": 0, "double_tapped": 1, "shaken": 2, "falling": 3}


def is_gesture(g):
    return motion_sensor.gesture() == _GESTURES.get(g, -9)


def gesture():
    g = motion_sensor.gesture()
    for k in _GESTURES:
        if _GESTURES[k] == g:
            return k
    return ""


def acceleration(axis):
    return motion_sensor.acceleration()["xyz".find(axis)]


def angular_velocity(axis):
    return motion_sensor.angular_velocity()["xyz".find(axis)]


def set_yaw_face(face):
    f = getattr(motion_sensor, "set_yaw_face", None)
    if f:
        f(_FACES.get(face, 0))


# ---------- Operators and lists ----------

def num(v):
    if isinstance(v, (int, float)):
        return v
    try:
        f = float(v)
        return int(f) if f == int(f) and "." not in str(v) else f
    except Exception:
        return 0


def pick_random(a, b):
    a, b = num(a), num(b)
    if a > b:
        a, b = b, a
    if isinstance(a, float) or isinstance(b, float):
        return a + random.random() * (b - a)
    return random.randint(a, b)


def mathop(op, x):
    x = num(x)
    if op == "abs":
        return abs(x)
    if op == "floor":
        return math.floor(x)
    if op == "ceiling":
        return math.ceil(x)
    if op == "sqrt":
        return math.sqrt(x)
    if op in ("sin", "cos", "tan"):
        return round(getattr(math, op)(math.radians(x)), 10)
    if op in ("asin", "acos", "atan"):
        return math.degrees(getattr(math, op)(x))
    if op == "ln":
        return math.log(x)
    if op == "log":
        return math.log(x) / math.log(10)
    if op == "e ^":
        return math.exp(x)
    if op == "10 ^":
        return 10 ** x
    return x


def div(a, b):
    a, b = num(a), num(b)
    if b == 0:
        return math.inf if a > 0 else -math.inf if a < 0 else math.nan
    return a / b


def mod(a, b):
    a, b = num(a), num(b)
    return a % b if b else math.nan


def equals(a, b):
    try:
        return float(a) == float(b)
    except Exception:
        return str(a).lower() == str(b).lower()


def letter(i, s):
    s, i = str(s), int(num(i))
    return s[i - 1] if 1 <= i <= len(s) else ""


def contains(s, part):
    return str(part).lower() in str(s).lower()


def item(lst, i):
    i = int(num(i))
    return lst[i - 1] if 1 <= i <= len(lst) else ""


def delete_item(lst, i):
    i = int(num(i))
    if 1 <= i <= len(lst):
        lst.pop(i - 1)


def insert_item(lst, i, v):
    i = int(num(i))
    if 1 <= i <= len(lst) + 1:
        lst.insert(i - 1, v)


def replace_item(lst, i, v):
    i = int(num(i))
    if 1 <= i <= len(lst):
        lst[i - 1] = v


def index_of(lst, v):
    for i, x in enumerate(lst):
        if equals(x, v):
            return i + 1
    return 0


def list_contains(lst, v):
    return index_of(lst, v) > 0


# ---------- Stacks and events ----------

_hats = []
_tasks = []
_pollers = []
_running = {}
_state = {"exit": False, "error": None}


def when_program_starts(fn):
    _hats.append(("start", None, fn))
    return fn


def when(condition, initial=False):
    def deco(fn):
        _hats.append(("edge", (condition, initial), fn))
        return fn
    return deco


def when_button(b, event="pressed"):
    if event == "released":
        return when(lambda: button.pressed(b) == 0, True)
    return when(lambda: button.pressed(b) > 0)


def when_force(p, option="pressed"):
    if option == "changed":
        last = [None]

        def changed():
            f = force_sensor.force(p)
            ch = last[0] is not None and f != last[0]
            last[0] = f
            return ch
        return when(changed)
    return when(lambda: is_force(p, option), option == "released")


def when_receive(message):
    def deco(fn):
        _hats.append(("msg", str(message), fn))
        return fn
    return deco


def _shutdown(cur=None):
    _state["exit"] = True
    for t in _tasks + _pollers:
        if t is not cur and not t.done():
            t.cancel()


async def _guard(fn):
    try:
        await fn()
    except StopStack:
        pass
    except SystemExit:
        _shutdown(asyncio.current_task())
    except asyncio.CancelledError:
        pass
    except Exception as e:
        buf = io.StringIO()
        sys.print_exception(e, buf)
        if _state["error"] is None:
            _state["error"] = buf.getvalue()
        _shutdown(asyncio.current_task())


def _spawn(fn):
    t = asyncio.create_task(_guard(fn))
    _tasks.append(t)
    _running[fn] = t
    return t


async def _poll(condition, initial, fn):
    prev = initial
    while not _state["exit"]:
        try:
            v = bool(condition())
        except Exception as e:
            buf = io.StringIO()
            sys.print_exception(e, buf)
            if _state["error"] is None:
                _state["error"] = buf.getvalue()
            _shutdown(asyncio.current_task())
            return
        if v and not prev:
            t = _running.get(fn)
            if t is None or t.done():
                _spawn(fn)
        prev = v
        await runloop.sleep_ms(10)


def _start_receivers(message):
    started = []
    for kind, arg, fn in _hats:
        if kind == "msg" and arg == str(message):
            t = _running.get(fn)
            if t is not None and not t.done():
                t.cancel()
            started.append(_spawn(fn))
    return started


def broadcast(message):
    _start_receivers(message)


async def broadcast_wait(message):
    started = _start_receivers(message)
    while not _state["exit"] and any(not t.done() for t in started):
        await runloop.sleep_ms(10)


def stop_other_stacks():
    cur = asyncio.current_task()
    for t in _tasks:
        if t is not cur and not t.done():
            t.cancel()


async def main():
    for kind, arg, fn in _hats:
        if kind == "start":
            _spawn(fn)
        elif kind == "edge":
            _pollers.append(asyncio.create_task(_poll(arg[0], arg[1], fn)))
    while not _state["exit"]:
        if not _pollers and all(t.done() for t in _tasks):
            break
        await runloop.sleep_ms(20)
    _shutdown()
    if _state["error"]:
        _sim.fail(_state["error"])
`;
