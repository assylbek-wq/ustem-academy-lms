// Модули SPIKE 3 для MicroPython симулятора. Имена и параметры как в приложении LEGO Education SPIKE 3:
// hub (port, motion_sensor, light_matrix, button, sound, light), motor, motor_pair, color_sensor,
// distance_sensor, force_sensor, color, runloop. Внутри все вызывает модуль _sim (JavaScript).
// wb.py (wbpy.js) - общая часть программ из блоков SPIKE (Word Blocks).
import { WB_PY } from "./wbpy.js";

export const PY_FILES = {
  "wb.py": WB_PY,
  "hub.py": `
import _sim

class _Port:
    A = 0
    B = 1
    C = 2
    D = 3
    E = 4
    F = 5

port = _Port()


class _Motion:
    TOP = 0
    FRONT = 1
    RIGHT = 2
    BOTTOM = 3
    BACK = 4
    LEFT = 5
    TAPPED = 0
    DOUBLE_TAPPED = 1
    SHAKEN = 2
    FALLING = 3
    UNKNOWN = -1

    def tilt_angles(self):
        t = _sim.tilt()
        return (int(t[0]), int(t[1]), int(t[2]))

    def reset_yaw(self, angle):
        _sim.reset_yaw(int(angle))

    def angular_velocity(self, raw=False):
        t = _sim.gyro()
        return (int(t[0]), int(t[1]), int(t[2]))

    def acceleration(self, raw=False):
        return (0, 0, 1000)

    def up_face(self):
        return 0

    def stable(self):
        return True

    def gesture(self):
        return -1

    def tap_count(self):
        return 0


motion_sensor = _Motion()


class _Matrix:
    IMAGE_HEART = 1
    IMAGE_HEART_SMALL = 2
    IMAGE_HAPPY = 3
    IMAGE_SMILE = 4
    IMAGE_SAD = 5
    IMAGE_CONFUSED = 6
    IMAGE_ANGRY = 7
    IMAGE_ASLEEP = 8
    IMAGE_SURPRISED = 9
    IMAGE_SILLY = 10
    IMAGE_FABULOUS = 11
    IMAGE_MEH = 12
    IMAGE_YES = 13
    IMAGE_NO = 14
    IMAGE_ARROW_N = 29
    IMAGE_ARROW_E = 31
    IMAGE_ARROW_S = 33
    IMAGE_ARROW_W = 35
    IMAGE_SQUARE = 43
    IMAGE_TARGET = 46

    def write(self, text, intensity=100, time_per_character=500):
        return _sim.matrix_write(str(text), int(intensity), int(time_per_character))

    def show_image(self, image):
        _sim.matrix_image(int(image))

    def clear(self):
        _sim.matrix_clear()

    def set_pixel(self, x, y, intensity=100):
        _sim.matrix_pixel(int(x), int(y), int(intensity))

    def get_pixel(self, x, y):
        return int(_sim.matrix_get(int(x), int(y)))

    def show(self, pixels):
        _sim.matrix_show([int(p) for p in pixels])

    def set_orientation(self, top):
        return 0

    def get_orientation(self):
        return 0


light_matrix = _Matrix()


class _Button:
    LEFT = 1
    RIGHT = 2

    def pressed(self, button):
        return int(_sim.button(int(button)))


button = _Button()


class _Sound:
    ANY = -2
    DEFAULT = -1
    WAVEFORM_SINE = 1

    def beep(self, freq=440, duration=500, volume=100, **kwargs):
        return _sim.beep(int(freq), int(duration), int(volume))

    def stop(self):
        pass

    def volume(self, volume):
        pass


sound = _Sound()


class _Light:
    POWER = 0
    CONNECT = 1

    def color(self, light, color):
        pass


light = _Light()


def temperature():
    return 250


def device_uuid():
    return "USTEM-SIM"


def hardware_id():
    return "SIM"


def power_off():
    pass
`,
  "motor.py": `
import _sim

READY = 0
RUNNING = 1
STALLED = 2
CANCELLED = 3
ERROR = 4
DISCONNECTED = 5
COAST = 0
BRAKE = 1
HOLD = 2
CONTINUE = 3
SMART_COAST = 4
SMART_BRAKE = 5
CLOCKWISE = 0
COUNTERCLOCKWISE = 1
SHORTEST_PATH = 2
LONGEST_PATH = 3


def run(port, velocity, *, acceleration=1000):
    _sim.m_run(port, velocity, acceleration)


def stop(port, *, stop=BRAKE):
    _sim.m_stop(port, stop)


def run_for_degrees(port, degrees, velocity, *, stop=BRAKE, acceleration=1000, deceleration=1000):
    return _sim.m_deg(port, degrees, velocity, acceleration, deceleration)


def run_for_time(port, duration, velocity, *, stop=BRAKE, acceleration=1000, deceleration=1000):
    return _sim.m_time(port, duration, velocity, acceleration)


def run_to_relative_position(port, position, velocity, *, stop=BRAKE, acceleration=1000, deceleration=1000):
    return _sim.m_rel(port, position, velocity)


def run_to_absolute_position(port, position, velocity, *, direction=SHORTEST_PATH, stop=BRAKE, acceleration=1000, deceleration=1000):
    return _sim.m_abs(port, position, velocity)


def relative_position(port):
    return int(_sim.m_relpos(port))


def reset_relative_position(port, position):
    _sim.m_reset(port, position)


def absolute_position(port):
    return int(_sim.m_abspos(port))


def velocity(port):
    return int(_sim.m_vel(port))


def set_duty_cycle(port, pwm):
    _sim.m_run(port, int(pwm * 1050 / 10000), 10000)


def get_duty_cycle(port):
    return 0


def info(port):
    return tuple(_sim.m_info(port))
`,
  "motor_pair.py": `
import _sim

PAIR_1 = 0
PAIR_2 = 1
PAIR_3 = 2


def pair(pair, left_motor, right_motor):
    _sim.p_pair(pair, left_motor, right_motor)


def unpair(pair):
    _sim.p_unpair(pair)


def move(pair, steering, *, velocity=360, acceleration=1000):
    _sim.p_move(pair, steering, velocity, acceleration)


def move_tank(pair, left_velocity, right_velocity, *, acceleration=1000):
    _sim.p_tank(pair, left_velocity, right_velocity, acceleration)


def stop(pair, *, stop=1):
    _sim.p_stop(pair, stop)


def move_for_degrees(pair, degrees, steering, *, velocity=360, stop=1, acceleration=1000, deceleration=1000):
    return _sim.p_deg(pair, degrees, steering, velocity, acceleration, deceleration)


def move_tank_for_degrees(pair, degrees, left_velocity, right_velocity, *, stop=1, acceleration=1000, deceleration=1000):
    return _sim.p_tank_deg(pair, degrees, left_velocity, right_velocity, acceleration, deceleration)


def move_for_time(pair, duration, steering, *, velocity=360, stop=1, acceleration=1000, deceleration=1000):
    return _sim.p_time(pair, duration, steering, velocity, acceleration)


def move_tank_for_time(pair, left_velocity, right_velocity, duration, *, stop=1, acceleration=1000, deceleration=1000):
    return _sim.p_tank_time(pair, duration, left_velocity, right_velocity, acceleration)
`,
  "color_sensor.py": `
import _sim


def reflection(port):
    return int(_sim.reflection(port))


def color(port):
    return int(_sim.color(port))


def rgbi(port):
    t = _sim.rgbi(port)
    return (int(t[0]), int(t[1]), int(t[2]), int(t[3]))
`,
  "distance_sensor.py": `
import _sim


def distance(port):
    return int(_sim.distance(port))


def show(port, pixels):
    pass


def clear(port):
    pass


def get_pixel(port, x, y):
    return 0


def set_pixel(port, x, y, intensity):
    pass
`,
  "force_sensor.py": `
import _sim


def force(port):
    return int(_sim.force(port))


def pressed(port):
    return bool(_sim.pressed(port))


def raw(port):
    return int(_sim.force(port)) * 10
`,
  "color.py": `
BLACK = 0
MAGENTA = 1
PURPLE = 2
BLUE = 3
AZURE = 4
TURQUOISE = 5
GREEN = 6
YELLOW = 7
ORANGE = 8
RED = 9
WHITE = 10
UNKNOWN = -1
`,
  "runloop.py": `
import _sim

_tasks = []


def run(*functions):
    for f in functions:
        _tasks.append(f)


def sleep_ms(duration):
    return _sim.sleep(int(duration))


async def until(function, timeout=0):
    t0 = _sim.now()
    while not function():
        if timeout and _sim.now() - t0 >= timeout:
            return False
        await _sim.tick()
    return True
`,
};
