// Модуль sat для бортовой программы CubeSat (MicroPython). Внутри вызывает _sat (JavaScript, runner.js).
// Время виртуальное: sleep() и каждый вызов датчика продвигают часы полета, программа работает весь полет.
export const SAT_PY = `
import _sat

class FlightOver(BaseException):
    """Полет закончился или аккумулятор разряжен: программа останавливается."""
    pass

def _r(v):
    if isinstance(v, str):
        if v == "__over__":
            raise FlightOver()
        if v.startswith("__err__:"):
            raise RuntimeError(v[8:])
    return v

def _t(v):
    v = _r(v)
    if v is None:
        return None
    return tuple(v[i] for i in range(len(v)))

def sleep(seconds):
    """Ждать seconds секунд (можно дробные: 0.5)."""
    _r(_sat.sleep(float(seconds)))

def sleep_ms(ms):
    _r(_sat.sleep(ms / 1000))

def time():
    """Секунды с включения спутника."""
    return _r(_sat.now())

def millis():
    return int(_r(_sat.now()) * 1000)


class _BME:
    def pressure(self):
        """Давление, гПа."""
        return _r(_sat.read("bme_p"))
    def temperature(self):
        """Температура, градусы Цельсия."""
        return _r(_sat.read("bme_t"))
    def humidity(self):
        """Относительная влажность, %."""
        return _r(_sat.read("bme_h"))


class _IMU:
    def accel(self):
        """Ускорение (x, y, z), м/с2. В покое z около 9.8."""
        return _t(_sat.vec("accel"))
    def gyro(self):
        """Угловая скорость (x, y, z), градусов в секунду."""
        return _t(_sat.vec("gyro"))


class _GPS:
    def position(self):
        """(широта, долгота, высота над морем в м) или None, пока нет фиксации."""
        return _t(_sat.vec("gps"))


class _Light:
    def lux(self):
        """Освещенность, люкс."""
        return _r(_sat.read("lux"))


class _CO2:
    def ppm(self):
        """Концентрация CO2, ppm (новое значение раз в 5 секунд)."""
        return _r(_sat.read("co2"))


class _Camera:
    def capture(self):
        """Сделать снимок и сохранить на накопитель. Возвращает имя файла."""
        return _r(_sat.photo())


class _Radio:
    def send(self, data):
        """Передать пакет на наземную станцию. Строка или байты, не длиннее лимита модуля."""
        _r(_sat.send(data if isinstance(data, str) else str(data)))


class _SD:
    def write(self, line):
        """Записать строку в файл миссии на борту (data.csv)."""
        _r(_sat.log(str(line)))


class _Battery:
    def voltage(self):
        """Напряжение аккумулятора, В."""
        return _r(_sat.read("bat_v"))
    def percent(self):
        """Оставшийся заряд, %."""
        return _r(_sat.read("bat_pct"))


bme = _BME()
imu = _IMU()
gps = _GPS()
light = _Light()
co2 = _CO2()
camera = _Camera()
radio = _Radio()
sd = _SD()
battery = _Battery()
`;
