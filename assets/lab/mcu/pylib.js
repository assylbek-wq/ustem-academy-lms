// Модули MicroPython для плат ESP32 и micro:bit в лаборатории. Программа ученика выполняется настоящим
// MicroPython (WebAssembly), а «железо» (выводы, ШИМ, АЦП, I2C, датчики) - схема лаборатории через модуль _hw.
// Время виртуальное и идет вместе со схемой: sleep() ждет, пока симуляция догонит.

export const PRELUDE = `
import sys, _hw, __vtime
sys.modules['time'] = __vtime
sys.modules['utime'] = __vtime

async def __aw(x):
    if type(x).__name__ in ('generator', 'coroutine'):
        return await x
    if type(x).__name__ == 'JsProxy':
        return await x
    return x

async def __tick():
    p = _hw.tick()
    if p is not None:
        await p
`;

export const LIBS = {
  __vtime: `
import _hw

def sleep(s):
    return _hw.sleep(s)

def sleep_ms(ms):
    return _hw.sleep(ms / 1000)

def sleep_us(us):
    return _hw.sleep(us / 1000000)

def ticks_ms():
    return int(_hw.now() * 1000)

def ticks_us():
    return int(_hw.now() * 1000000)

def ticks_cpu():
    return int(_hw.now() * 1000000)

def ticks_diff(a, b):
    return a - b

def ticks_add(a, b):
    return a + b

def time():
    return int(_hw.wall())

def time_ns():
    return int(_hw.now() * 1e9)

def localtime(secs=None):
    t = _hw.localtime() if secs is None else _hw.localtime(secs)
    return tuple(t[i] for i in range(8))
`,

  machine: `
import _hw

def _name(p):
    return p._n if isinstance(p, Pin) else str(p)

def _s(b):
    # байты -> строка для JS: код + 1, потому что символ 0 обрезает строку при передаче в JS
    return ''.join([chr(x + 1) for x in b])

class Pin:
    IN = 1
    OUT = 3
    OPEN_DRAIN = 7
    PULL_UP = 2
    PULL_DOWN = 1
    IRQ_RISING = 1
    IRQ_FALLING = 2
    def __init__(self, id, mode=-1, pull=-1, value=None):
        self._n = str(id)
        if not _hw.has_pin(self._n):
            raise ValueError("invalid pin " + self._n)
        if mode != -1:
            self.init(mode, pull, value)
    def init(self, mode=-1, pull=-1, value=None):
        _hw.pin_mode(self._n, mode, pull)
        if value is not None:
            self.value(value)
    def value(self, v=None):
        if v is None:
            return 1 if _hw.pin_read(self._n) else 0
        _hw.pin_write(self._n, 1 if v else 0)
    def __call__(self, v=None):
        return self.value(v)
    def on(self):
        _hw.pin_write(self._n, 1)
    def off(self):
        _hw.pin_write(self._n, 0)
    def high(self):
        _hw.pin_write(self._n, 1)
    def low(self):
        _hw.pin_write(self._n, 0)
    def toggle(self):
        _hw.pin_write(self._n, 0 if _hw.pin_read(self._n) else 1)
    def irq(self, handler=None, trigger=3):
        _hw.pin_irq(self._n, handler, trigger, self)
    def __repr__(self):
        return "Pin(%s)" % self._n

class Signal:
    def __init__(self, pin, invert=False):
        self._p = pin
        self._inv = invert
    def value(self, v=None):
        if v is None:
            return self._p.value() ^ self._inv
        self._p.value((1 if v else 0) ^ self._inv)
    def on(self):
        self.value(1)
    def off(self):
        self.value(0)

class PWM:
    def __init__(self, pin, freq=1000, duty=None, duty_u16=None, duty_ns=None):
        self._n = _name(pin)
        self._f = freq
        self._d = 0.0
        if duty is not None:
            self._d = duty / 1023
        if duty_u16 is not None:
            self._d = duty_u16 / 65535
        if duty_ns is not None:
            self._d = duty_ns * 1e-9 * freq
        self._apply()
    def _apply(self):
        _hw.pwm(self._n, self._f, self._d)
    def freq(self, f=None):
        if f is None:
            return self._f
        self._f = f
        self._apply()
    def duty(self, d=None):
        if d is None:
            return int(self._d * 1023)
        self._d = max(0, min(1023, d)) / 1023
        self._apply()
    def duty_u16(self, d=None):
        if d is None:
            return int(self._d * 65535)
        self._d = max(0, min(65535, d)) / 65535
        self._apply()
    def duty_ns(self, ns=None):
        if ns is None:
            return int(self._d / self._f * 1e9)
        self._d = min(1, ns * 1e-9 * self._f)
        self._apply()
    def init(self, freq=None, duty_u16=None):
        if freq is not None:
            self._f = freq
        if duty_u16 is not None:
            self._d = duty_u16 / 65535
        self._apply()
    def deinit(self):
        _hw.pwm(self._n, 0, 0)

class ADC:
    ATTN_0DB = 0
    ATTN_2_5DB = 1
    ATTN_6DB = 2
    ATTN_11DB = 3
    WIDTH_9BIT = 9
    WIDTH_10BIT = 10
    WIDTH_11BIT = 11
    WIDTH_12BIT = 12
    def __init__(self, pin, atten=3):
        self._n = _name(pin)
        if not _hw.has_adc(self._n):
            raise ValueError("pin %s has no ADC" % self._n)
        self._bits = 12
    def atten(self, a):
        pass
    def width(self, w):
        self._bits = w
    def read_u16(self):
        return int(min(1, _hw.adc(self._n) / 3.3) * 65535)
    def read(self):
        return int(min(1, _hw.adc(self._n) / 3.3) * ((1 << self._bits) - 1))
    def read_uv(self):
        return int(_hw.adc(self._n) * 1e6)

class DAC:
    def __init__(self, pin):
        self._n = _name(pin)
    def write(self, v):
        _hw.pwm(self._n, 100000, max(0, min(255, v)) / 255)

class TouchPad:
    def __init__(self, pin):
        self._n = _name(pin)
    def read(self):
        return 100 if _hw.pin_read(self._n) else 600

class I2C:
    def __init__(self, id=0, scl=None, sda=None, freq=400000):
        self._scl = _name(scl) if scl is not None else None
        self._sda = _name(sda) if sda is not None else None
    def scan(self):
        r = _hw.i2c_scan()
        return [r[i] for i in range(len(r))]
    def writeto(self, addr, buf, stop=True):
        if not _hw.i2c_write(addr, _s(bytes(buf))):
            raise OSError(19)
        return len(buf)
    def readfrom(self, addr, n, stop=True):
        r = _hw.i2c_read(addr, n)
        if r is None:
            raise OSError(19)
        return bytes([r[i] for i in range(len(r))])
    def readfrom_into(self, addr, buf, stop=True):
        d = self.readfrom(addr, len(buf))
        for i in range(len(buf)):
            buf[i] = d[i]
    def writeto_mem(self, addr, reg, buf, addrsize=8):
        return self.writeto(addr, bytes([reg]) + bytes(buf))
    def readfrom_mem(self, addr, reg, n, addrsize=8):
        self.writeto(addr, bytes([reg]))
        return self.readfrom(addr, n)
    def readfrom_mem_into(self, addr, reg, buf, addrsize=8):
        d = self.readfrom_mem(addr, reg, len(buf))
        for i in range(len(buf)):
            buf[i] = d[i]
    def writevto(self, addr, vector, stop=True):
        b = b''
        for v in vector:
            b += bytes(v)
        return self.writeto(addr, b)

SoftI2C = I2C

class UART:
    def __init__(self, id, baudrate=9600, tx=None, rx=None):
        pass
    def write(self, b):
        print(b.decode() if isinstance(b, bytes) else b, end='')
    def any(self):
        return 0
    def read(self, n=None):
        return None

def time_pulse_us(pin, level, timeout_us=1000000):
    return int(_hw.pulse_in(_name(pin), level, timeout_us))

def freq(f=None):
    return 240000000

def reset():
    raise SystemExit

def unique_id():
    return b'\\x24\\x0a\\xc4\\x00\\x00\\x01'

def disable_irq():
    return 0

def enable_irq(s=0):
    pass
`,

  neopixel: `
import _hw

class NeoPixel:
    ORDER = (1, 0, 2, 3)
    def __init__(self, pin, n, bpp=3, timing=1):
        self._n = pin._n
        self.n = n
        self.bpp = bpp
        self._px = [(0, 0, 0)] * n
    def __len__(self):
        return self.n
    def __setitem__(self, i, v):
        self._px[i] = tuple(v)
    def __getitem__(self, i):
        return self._px[i]
    def fill(self, v):
        self._px = [tuple(v)] * self.n
    def write(self):
        flat = []
        for p in self._px:
            flat.append(p[0]); flat.append(p[1]); flat.append(p[2])
        _hw.np_write(self._n, ''.join([chr(max(0, min(255, int(v))) + 1) for v in flat]))
`,

  dht: `
import _hw

class _DHT:
    def __init__(self, pin):
        self._n = pin._n
        self._t = 0
        self._h = 0
    def measure(self):
        r = _hw.dht_read(self._n, self._kind)
        if r is None:
            raise OSError(110)
        self._t = r[0]
        self._h = r[1]
    def temperature(self):
        return self._t
    def humidity(self):
        return self._h

class DHT11(_DHT):
    _kind = 11
    def temperature(self):
        return int(self._t)
    def humidity(self):
        return int(self._h)

class DHT22(_DHT):
    _kind = 22
`,

  hcsr04: `
import machine, time

class HCSR04:
    def __init__(self, trigger_pin, echo_pin, echo_timeout_us=30000):
        self.trigger = machine.Pin(trigger_pin, machine.Pin.OUT, pull=None)
        self.trigger.value(0)
        self.echo = machine.Pin(echo_pin, machine.Pin.IN, pull=None)
        self.timeout = echo_timeout_us
    def _pulse(self):
        self.trigger.value(1)
        self.trigger.value(0)
        t = machine.time_pulse_us(self.echo, 1, self.timeout)
        if t < 0:
            raise OSError('Out of range')
        return t
    def distance_mm(self):
        return self._pulse() * 100 // 582
    def distance_cm(self):
        return self._pulse() / 58.2
`,

  network: `
import _hw
STA_IF = 0
AP_IF = 1

class WLAN:
    def __init__(self, i=0):
        self._on = False
        self._ok = False
    def active(self, v=None):
        if v is None:
            return self._on
        self._on = bool(v)
    def connect(self, ssid, key=None):
        _hw.log("Wi-Fi: подключение к " + str(ssid) + " (в симуляторе сети нет, подключение условное)")
        self._ok = True
        self._ssid = ssid
    def isconnected(self):
        return self._ok
    def disconnect(self):
        self._ok = False
    def ifconfig(self):
        return ('192.168.4.23', '255.255.255.0', '192.168.4.1', '8.8.8.8')
    def scan(self):
        return [(b'USTEM-Lab', b'\\x00' * 6, 6, -48, 3, False)]
    def config(self, *a, **k):
        return 'esp32-lab'
`,

  // Драйвер OLED SSD1306 из micropython-lib (MIT), только I2C
  ssd1306: `
from micropython import const
import framebuf

SET_CONTRAST = const(0x81)
SET_ENTIRE_ON = const(0xA4)
SET_NORM_INV = const(0xA6)
SET_DISP = const(0xAE)
SET_MEM_ADDR = const(0x20)
SET_COL_ADDR = const(0x21)
SET_PAGE_ADDR = const(0x22)
SET_DISP_START_LINE = const(0x40)
SET_SEG_REMAP = const(0xA0)
SET_MUX_RATIO = const(0xA8)
SET_COM_OUT_DIR = const(0xC0)
SET_DISP_OFFSET = const(0xD3)
SET_COM_PIN_CFG = const(0xDA)
SET_DISP_CLK_DIV = const(0xD5)
SET_PRECHARGE = const(0xD9)
SET_VCOM_DESEL = const(0xDB)
SET_CHARGE_PUMP = const(0x8D)

class SSD1306(framebuf.FrameBuffer):
    def __init__(self, width, height, external_vcc):
        self.width = width
        self.height = height
        self.external_vcc = external_vcc
        self.pages = self.height // 8
        self.buffer = bytearray(self.pages * self.width)
        super().__init__(self.buffer, self.width, self.height, framebuf.MONO_VLSB)
        self.init_display()

    def init_display(self):
        for cmd in (SET_DISP, SET_MEM_ADDR, 0x00, SET_DISP_START_LINE, SET_SEG_REMAP | 0x01, SET_MUX_RATIO, self.height - 1,
                    SET_COM_OUT_DIR | 0x08, SET_DISP_OFFSET, 0x00, SET_COM_PIN_CFG, 0x02 if self.width > 2 * self.height else 0x12,
                    SET_DISP_CLK_DIV, 0x80, SET_PRECHARGE, 0x22 if self.external_vcc else 0xF1, SET_VCOM_DESEL, 0x30,
                    SET_CONTRAST, 0xFF, SET_ENTIRE_ON, SET_NORM_INV, SET_CHARGE_PUMP, 0x10 if self.external_vcc else 0x14, SET_DISP | 0x01):
            self.write_cmd(cmd)
        self.fill(0)
        self.show()

    def poweroff(self):
        self.write_cmd(SET_DISP)

    def poweron(self):
        self.write_cmd(SET_DISP | 0x01)

    def contrast(self, contrast):
        self.write_cmd(SET_CONTRAST)
        self.write_cmd(contrast)

    def invert(self, invert):
        self.write_cmd(SET_NORM_INV | (invert & 1))

    def rotate(self, rotate):
        self.write_cmd(SET_COM_OUT_DIR | ((rotate & 1) << 3))
        self.write_cmd(SET_SEG_REMAP | (rotate & 1))

    def show(self):
        x0 = 0
        x1 = self.width - 1
        if self.width != 128:
            col_offset = (128 - self.width) // 2
            x0 += col_offset
            x1 += col_offset
        self.write_cmd(SET_COL_ADDR)
        self.write_cmd(x0)
        self.write_cmd(x1)
        self.write_cmd(SET_PAGE_ADDR)
        self.write_cmd(0)
        self.write_cmd(self.pages - 1)
        self.write_data(self.buffer)

class SSD1306_I2C(SSD1306):
    def __init__(self, width, height, i2c, addr=0x3C, external_vcc=False):
        self.i2c = i2c
        self.addr = addr
        self.temp = bytearray(2)
        self.write_list = [b"\\x40", None]
        super().__init__(width, height, external_vcc)

    def write_cmd(self, cmd):
        self.temp[0] = 0x80
        self.temp[1] = cmd
        self.i2c.writeto(self.addr, self.temp)

    def write_data(self, buf):
        self.i2c.writeto(self.addr, b"\\x40" + bytes(buf))
`,

  // ЖК 1602 с переходником PCF8574 (API как у популярного драйвера I2cLcd)
  i2c_lcd: `
import time

class I2cLcd:
    def __init__(self, i2c, i2c_addr, num_lines, num_columns):
        self.i2c = i2c
        self.addr = i2c_addr
        self.num_lines = num_lines
        self.num_columns = num_columns
        self.bl = 0x08
        self.cx = 0
        self.cy = 0
        for n in (0x30, 0x30, 0x30, 0x20):
            self._nib(n, 0)
        self.cmd(0x28)
        self.cmd(0x0C)
        self.cmd(0x06)
        self.clear()

    def _nib(self, n, rs):
        b = (n & 0xF0) | rs | self.bl
        self.i2c.writeto(self.addr, bytes([b | 0x04, b]))

    def _byte(self, v, rs):
        self._nib(v & 0xF0, rs)
        self._nib((v << 4) & 0xF0, rs)

    def cmd(self, c):
        self._byte(c, 0)

    def clear(self):
        self.cmd(0x01)
        self.cx = 0
        self.cy = 0

    def home(self):
        self.cmd(0x02)
        self.cx = 0
        self.cy = 0

    def move_to(self, x, y):
        self.cx = x
        self.cy = y
        self.cmd(0x80 | (x + (0x40 if y & 1 else 0) + (self.num_columns if y & 2 else 0)))

    def putchar(self, ch):
        if ch == '\\n':
            self.move_to(0, (self.cy + 1) % self.num_lines)
            return
        self._byte(ord(ch), 1)
        self.cx += 1
        if self.cx >= self.num_columns:
            self.move_to(0, (self.cy + 1) % self.num_lines)

    def putstr(self, s):
        for ch in str(s):
            self.putchar(ch)

    def backlight_on(self):
        self.bl = 0x08
        self.i2c.writeto(self.addr, bytes([self.bl]))

    def backlight_off(self):
        self.bl = 0x00
        self.i2c.writeto(self.addr, bytes([0]))

    def display_on(self):
        self.cmd(0x0C)

    def display_off(self):
        self.cmd(0x08)

    def custom_char(self, location, charmap):
        self.cmd(0x40 | ((location & 7) << 3))
        for b in charmap:
            self._byte(b, 1)
        self.move_to(self.cx, self.cy)
`,

  // micro:bit v2: модуль microbit
  microbit: `
import _hw, __vtime

def sleep(ms):
    return __vtime.sleep_ms(ms)

def running_time():
    return __vtime.ticks_ms()

def temperature():
    return int(_hw.mb_temp())

def panic(n=0):
    raise SystemExit

def reset():
    raise SystemExit

class Image:
    def __init__(self, s=None, h=None):
        if isinstance(s, int):
            self.w = s
            self.h = h
            self.p = [0] * (s * h)
            return
        s = s or "00000:00000:00000:00000:00000"
        rows = [r for r in s.strip(':').split(':')]
        self.h = len(rows)
        self.w = len(rows[0])
        self.p = []
        for r in rows:
            for c in r:
                self.p.append(int(c))
    def width(self):
        return self.w
    def height(self):
        return self.h
    def get_pixel(self, x, y):
        return self.p[y * self.w + x]
    def set_pixel(self, x, y, v):
        self.p[y * self.w + x] = v
    def shift_left(self, n):
        r = Image(self.w, self.h)
        for y in range(self.h):
            for x in range(self.w):
                if 0 <= x + n < self.w:
                    r.p[y * self.w + x] = self.p[y * self.w + x + n]
        return r
    def shift_right(self, n):
        return self.shift_left(-n)
    def shift_up(self, n):
        r = Image(self.w, self.h)
        for y in range(self.h):
            if 0 <= y + n < self.h:
                for x in range(self.w):
                    r.p[y * self.w + x] = self.p[(y + n) * self.w + x]
        return r
    def shift_down(self, n):
        return self.shift_up(-n)
    def invert(self):
        r = Image(self.w, self.h)
        r.p = [9 - v for v in self.p]
        return r
    def copy(self):
        r = Image(self.w, self.h)
        r.p = list(self.p)
        return r
    def __add__(self, o):
        r = Image(self.w, self.h)
        r.p = [min(9, a + b) for a, b in zip(self.p, o.p)]
        return r
    def __mul__(self, k):
        r = Image(self.w, self.h)
        r.p = [min(9, int(a * k)) for a in self.p]
        return r
    def __repr__(self):
        return "Image('%s')" % ':'.join(''.join(str(self.p[y * self.w + x]) for x in range(self.w)) for y in range(self.h))

_IMG = {
    'HEART': '09090:99999:99999:09990:00900', 'HEART_SMALL': '00000:09090:09990:00900:00000',
    'HAPPY': '00000:09090:00000:90009:09990', 'SMILE': '00000:00000:00000:90009:09990',
    'SAD': '00000:09090:00000:09990:90009', 'CONFUSED': '00000:09090:00000:09090:90909',
    'ANGRY': '90009:09090:00000:99999:90909', 'ASLEEP': '00000:99099:00000:09990:00000',
    'SURPRISED': '09090:00000:00900:09090:00900', 'SILLY': '90009:00000:99999:00909:00999',
    'FABULOUS': '99999:99099:00000:09090:09990', 'MEH': '09090:00000:00090:00900:09000',
    'YES': '00000:00009:00090:90900:09000', 'NO': '90009:09090:00900:09090:90009',
    'ARROW_N': '00900:09990:90909:00900:00900', 'ARROW_E': '00900:00090:99999:00090:00900',
    'ARROW_S': '00900:00900:90909:09990:00900', 'ARROW_W': '00900:09000:99999:09000:00900',
    'TRIANGLE': '00000:00900:09090:99999:00000', 'SQUARE': '99999:90009:90009:90009:99999',
    'SQUARE_SMALL': '00000:09990:09090:09990:00000', 'DIAMOND': '00900:09090:90009:09090:00900',
    'CHESSBOARD': '09090:90909:09090:90909:09090', 'TARGET': '00900:09990:99099:09990:00900',
    'SKULL': '09990:90909:99999:09990:09990', 'UMBRELLA': '09990:99999:00900:90900:09900',
    'SNAKE': '99000:99099:09090:09990:00000', 'RABBIT': '90900:90900:99990:99090:99990',
    'COW': '90009:90009:99999:09990:00900', 'DUCK': '09900:99900:09999:09990:00000',
    'HOUSE': '00900:09990:99999:09990:09090', 'TORTOISE': '00000:09990:99999:09090:00000',
    'BUTTERFLY': '99099:99999:00900:99999:99099', 'GIRAFFE': '99000:09000:09000:09990:09090',
    'GHOST': '99999:90909:99999:99999:90909', 'SWORD': '00900:00900:00900:09990:00900',
    'PITCHFORK': '90909:90909:99999:00900:00900', 'MUSIC_CROTCHET': '00900:00900:00900:99900:99900',
    'MUSIC_QUAVER': '00900:00990:00909:99900:99900', 'XMAS': '00900:09990:00900:09990:99999',
    'STICKFIGURE': '00900:99999:00900:09090:90009', 'ROLLERSKATE': '00099:00099:99999:99999:09090',
    'TSHIRT': '99099:99999:09990:09990:09990', 'CLOCK12': '00900:00900:00900:00000:00000',
}
for _k, _v in _IMG.items():
    setattr(Image, _k, Image(_v))
Image.ALL_ARROWS = [Image.ARROW_N, Image.ARROW_E, Image.ARROW_S, Image.ARROW_W]

_FONT = {
    ' ': '00000:00000:00000:00000:00000', '!': '09000:09000:09000:00000:09000', '.': '00000:00000:00000:00000:09000',
    ',': '00000:00000:00000:09000:90000', '?': '09900:00090:00900:00000:00900', '-': '00000:00000:09990:00000:00000',
    '+': '00000:00900:09990:00900:00000', ':': '00000:09000:00000:09000:00000', '=': '00000:09990:00000:09990:00000',
    '0': '09900:90090:90090:90090:09900', '1': '00900:09900:00900:00900:09990', '2': '99900:00090:09900:90000:99990',
    '3': '99990:00090:00900:90090:09900', '4': '00990:09090:90090:99999:00090', '5': '99999:90000:99990:00009:99990',
    '6': '00090:00900:09990:90009:09990', '7': '99999:00090:00900:09000:90000', '8': '09990:90009:09990:90009:09990',
    '9': '09990:90009:09990:00900:09000', 'A': '09900:90090:99990:90090:90090', 'B': '99900:90090:99900:90090:99900',
    'C': '09990:90000:90000:90000:09990', 'D': '99900:90090:90090:90090:99900', 'E': '99990:90000:99900:90000:99990',
    'F': '99990:90000:99900:90000:90000', 'G': '09990:90000:90099:90009:09990', 'H': '90090:90090:99990:90090:90090',
    'I': '99900:09000:09000:09000:99900', 'J': '99999:00090:00090:90090:09900', 'K': '90090:90900:99000:90900:90090',
    'L': '90000:90000:90000:90000:99990', 'M': '90009:99099:90909:90009:90009', 'N': '90009:99009:90909:90099:90009',
    'O': '09900:90090:90090:90090:09900', 'P': '99900:90090:99900:90000:90000', 'Q': '09900:90090:90090:09900:00990',
    'R': '99900:90090:99900:90090:90009', 'S': '09990:90000:09900:00090:99900', 'T': '99999:00900:00900:00900:00900',
    'U': '90090:90090:90090:90090:09900', 'V': '90009:90009:90009:09090:00900', 'W': '90009:90009:90909:99099:90009',
    'X': '90090:90090:09900:90090:90090', 'Y': '90009:09090:00900:00900:00900', 'Z': '99990:00900:09000:90000:99990',
}

def _glyph(ch):
    s = _FONT.get(ch.upper(), _FONT['?'])
    return Image(s)

class _Display:
    def __init__(self):
        self._p = [0] * 25
        self._on = True
    def _push(self):
        _hw.mb_display(''.join([chr(v + 1) for v in self._p]) if self._on else chr(1) * 25)
    def clear(self):
        self._p = [0] * 25
        self._push()
    def set_pixel(self, x, y, v):
        self._p[y * 5 + x] = v
        self._push()
    def get_pixel(self, x, y):
        return self._p[y * 5 + x]
    def _img(self, img):
        for y in range(5):
            for x in range(5):
                self._p[y * 5 + x] = img.get_pixel(x, y) if x < img.width() and y < img.height() else 0
        self._push()
    async def show(self, v, delay=400, wait=True, loop=False, clear=False):
        if isinstance(v, Image):
            self._img(v)
            return
        if isinstance(v, (list, tuple)):
            for im in v:
                self._img(im)
                await sleep(delay)
            return
        s = str(v)
        for ch in s:
            self._img(_glyph(ch))
            if len(s) > 1:
                await sleep(delay)
        if clear:
            self.clear()
    async def scroll(self, text, delay=150, wait=True, loop=False, monospace=False):
        cols = []
        for ch in str(text):
            g = _glyph(ch)
            w = 5
            for x in range(w):
                cols.append([g.get_pixel(x, y) for y in range(5)])
            cols.append([0] * 5)
        cols = [[0] * 5] * 5 + cols
        for start in range(len(cols)):
            for x in range(5):
                c = cols[start + x] if start + x < len(cols) else [0] * 5
                for y in range(5):
                    self._p[y * 5 + x] = c[y]
            self._push()
            await sleep(delay)
    def on(self):
        self._on = True
        self._push()
    def off(self):
        self._on = False
        self._push()
    def is_on(self):
        return self._on
    def read_light_level(self):
        return int(_hw.mb_light())

display = _Display()

class _Button:
    def __init__(self, n):
        self._n = n
        self._count = 0
    def is_pressed(self):
        return bool(_hw.mb_button(self._n, 0))
    def was_pressed(self):
        return bool(_hw.mb_button(self._n, 1))
    def get_presses(self):
        return int(_hw.mb_button(self._n, 2))

button_a = _Button('A')
button_b = _Button('B')

class _Pin:
    def __init__(self, n):
        self._n = 'P%d' % n
        self._period = 20000
        self._pull_set = False
    def write_digital(self, v):
        _hw.pin_mode(self._n, 3, -1)
        _hw.pin_write(self._n, 1 if v else 0)
    def read_digital(self):
        if not self._pull_set:
            _hw.pin_mode(self._n, 1, 1)
        return 1 if _hw.pin_read(self._n) else 0
    def write_analog(self, v):
        _hw.pwm(self._n, 1000000 / self._period, max(0, min(1023, v)) / 1023)
    def read_analog(self):
        return int(min(1, _hw.adc(self._n) / 3.3) * 1023)
    def set_analog_period(self, ms):
        self._period = ms * 1000
    def set_analog_period_microseconds(self, us):
        self._period = us
    def is_touched(self):
        return not _hw.pin_read(self._n)
    def set_pull(self, p):
        self._pull_set = True
        _hw.pin_mode(self._n, 1, {0: -1, 1: 2, 2: 1}.get(p, -1))
    NO_PULL = 0
    PULL_UP = 1
    PULL_DOWN = 2

for _i in (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 19, 20):
    globals()['pin%d' % _i] = _Pin(_i)
pin_logo = _Pin(0)

class _Accel:
    def get_x(self):
        return int(_hw.mb_accel(0))
    def get_y(self):
        return int(_hw.mb_accel(1))
    def get_z(self):
        return int(_hw.mb_accel(2))
    def get_values(self):
        return (self.get_x(), self.get_y(), self.get_z())
    def current_gesture(self):
        z = self.get_z()
        x = self.get_x()
        if z > 700:
            return 'face down'
        if z < -700:
            return 'face up'
        if x > 500:
            return 'right'
        if x < -500:
            return 'left'
        return 'up'
    def is_gesture(self, g):
        return self.current_gesture() == g
    def was_gesture(self, g):
        return self.current_gesture() == g

accelerometer = _Accel()

class _Compass:
    def heading(self):
        return int(_hw.mb_accel(3))
    def calibrate(self):
        pass
    def is_calibrated(self):
        return True

compass = _Compass()

class _Sound:
    def sound_level(self):
        return int(_hw.mb_sound())

microphone = _Sound()

class _Speaker:
    def on(self):
        pass
    def off(self):
        pass

speaker = _Speaker()
`,

  music: `
import _hw, __vtime

BA_DING = ['b5:1', 'e6:3']
POWER_UP = ['g4:1', 'c5', 'e5', 'g5:2', 'e5:1', 'g5:3']
POWER_DOWN = ['g5:1', 'd#5', 'c5', 'g4:2', 'b4:1', 'c5:3']
JUMP_UP = ['c5:1', 'd5', 'e5', 'f5', 'g5']
JUMP_DOWN = ['g5:1', 'f5', 'e5', 'd5', 'c5']
BIRTHDAY = ['c4:3', 'c4:1', 'd4:4', 'c4:4', 'f4', 'e4:8', 'c4:3', 'c4:1', 'd4:4', 'c4:4', 'g4', 'f4:8']
ODE = ['e4', 'e4', 'f4', 'g4', 'g4', 'f4', 'e4', 'd4', 'c4', 'c4', 'd4', 'e4', 'e4:6', 'd4:2', 'd4:8']
NYAN = ['f#5:2', 'g#5', 'c#5:1', 'd#5:2', 'b4:1', 'd5:1', 'c#5', 'b4:2', 'b4', 'c#5']
ENTERTAINER = ['d4:1', 'd#4', 'e4', 'c5:2', 'e4:1', 'c5:2', 'e4:1', 'c5:3']
_NOTES = {'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11}
_st = {'octave': 4, 'dur': 4, 'bpm': 120, 'ticks': 4}

def set_tempo(ticks=4, bpm=120):
    _st['ticks'] = ticks
    _st['bpm'] = bpm

def _pin(pin):
    return pin._n if pin is not None else 'P0'

def stop(pin=None):
    _hw.pwm(_pin(pin), 0, 0)

async def pitch(frequency, duration=-1, pin=None, wait=True):
    _hw.pwm(_pin(pin), frequency, 0.5 if frequency > 0 else 0)
    if duration >= 0:
        await __vtime.sleep_ms(duration)
        _hw.pwm(_pin(pin), 0, 0)

async def play(music, pin=None, wait=True, loop=False):
    if isinstance(music, str):
        music = [music]
    tick_ms = 60000 // _st['bpm'] // _st['ticks']
    for note in music:
        n = note.split(':')
        if len(n) > 1:
            _st['dur'] = int(n[1])
        name = n[0].lower()
        if name and name[0] != 'r':
            semi = _NOTES.get(name[0], 0)
            rest = name[1:]
            if rest.startswith('#'):
                semi += 1
                rest = rest[1:]
            elif rest.startswith('b'):
                semi -= 1
                rest = rest[1:]
            if rest:
                _st['octave'] = int(rest)
            f = 440 * 2 ** ((semi - 9) / 12 + _st['octave'] - 4)
            _hw.pwm(_pin(pin), f, 0.5)
        else:
            _hw.pwm(_pin(pin), 0, 0)
        await __vtime.sleep_ms(tick_ms * _st['dur'])
    _hw.pwm(_pin(pin), 0, 0)
`,
};

// вызовы, которые нужно ждать (их делает асинхронными pytransform)
export const ASYNC_CALLS = ["sleep", "sleep_ms", "sleep_us", "time.sleep", "time.sleep_ms", "time.sleep_us", "utime.sleep",
  "utime.sleep_ms", "utime.sleep_us", "display.scroll", "display.show", "music.play", "music.pitch"];
