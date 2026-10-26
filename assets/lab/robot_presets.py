"""Задания симулятора роботов Unitree на MuJoCo: python3 assets/lab/robot_presets.py -> app/static/robots/presets/*.json.

В уроке задание вставляется блоком <div class="robot-sim-ИМЯ"></div> (ИМЯ без префикса robot-), песочница /lab/robots.
Поля задания: robot (go2 или g1), mode (low - LowCmd, sport - SportClient у Go2), start.pose (lie, stand),
hold (моторы в начале держат стартовую позу с усилениями из примера Unitree), hang (страховочный подвес G1),
world (boxes - стены и препятствия, marks - метки на полу), pushes (толчки корпуса), limit (время задания, с),
python (стартовая программа), checks (проверки, assets/lab/robots/checks.js). SOLUTIONS - эталоны для
tests/e2e/robot_solutions.mjs.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "app" / "static" / "robots" / "presets"

UPRIGHT = {"type": "upright", "text": "Робот не упал"}

# ─────────────── общие куски программ ───────────────

GO2_HEAD = """from unitree import *

robot = Robot()
cmd = LowCmd()

# позы из примера unitree_sdk2 go2_stand_example (порядок моторов FR, FL, RR, RL; в каждой ноге hip, thigh, calf)
LIE = [0.0, 1.36, -2.65, 0.0, 1.36, -2.65, -0.2, 1.36, -2.65, 0.2, 1.36, -2.65]
STAND = [0.0, 0.67, -1.3, 0.0, 0.67, -1.3, 0.0, 0.67, -1.3, 0.0, 0.67, -1.3]
"""

GO2_MOVE = """
def move(target, seconds, kp=60, kd=5):
    \"\"\"Плавно перевести все 12 моторов из текущих углов в target за seconds секунд.\"\"\"
    st = robot.read()
    start = [st.motor_state[i].q for i in range(12)]
    n = int(seconds / 0.02)
    for k in range(n + 1):
        s = k / n
        for i in range(12):
            m = cmd.motor_cmd[i]
            m.q = (1 - s) * start[i] + s * target[i]
            m.dq = 0.0
            m.kp = kp
            m.kd = kd
            m.tau = 0.0
        robot.write(cmd)
        robot.sleep(0.02)
"""

GO2_IK = """import math

L = 0.213               # длина бедра и голени Go2, м
HIP = 0.0955            # смещение бедра вбок от оси сустава hip, м
SIDE = [-1, 1, -1, 1]   # FR, FL, RR, RL: правая нога -1, левая +1


def ik(x, y, z, side):
    \"\"\"Обратная задача для ноги: точка стопы (x вперед, y влево, z вверх) в осях бедра -> углы hip, thigh, calf.\"\"\"
    l1 = HIP * side
    d = math.sqrt(max(y * y + z * z - l1 * l1, 1e-6))   # длина ноги в ее плоскости
    q0 = math.atan2(z, y) - math.atan2(-d, l1)          # hip: отвести ногу вбок
    r = min(math.sqrt(x * x + d * d), 2 * L * 0.999)    # от бедра до стопы
    c = (r * r - 2 * L * L) / (2 * L * L)               # теорема косинусов для колена
    q2 = -math.acos(max(-1.0, min(1.0, c)))             # calf: колено сгибается назад
    q1 = math.atan2(-x, d) - q2 / 2                      # thigh: направить ногу на стопу
    return q0, q1, q2


def pose(feet):
    \"\"\"feet - четыре пары (x, z) для FR, FL, RR, RL. Возвращает 12 углов.\"\"\"
    q = []
    for leg in range(4):
        x, z = feet[leg]
        q.extend(ik(x, HIP * SIDE[leg], z, SIDE[leg]))
    return q


def send(q, kp, kd):
    for i in range(12):
        m = cmd.motor_cmd[i]
        m.q = q[i]
        m.dq = 0.0
        m.kp = kp
        m.kd = kd
        m.tau = 0.0
    robot.write(cmd)
"""

G1_HEAD = """from unitree import *

robot = Robot()
cmd = LowCmd()
st = robot.read()
q0 = [st.motor_state[i].q for i in range(NUM_MOTOR)]   # стартовая стойка

# усиления из примера unitree_sdk2 g1_low_level_example
KP = [60, 60, 60, 100, 40, 40,  60, 60, 60, 100, 40, 40,  60, 40, 40] + [40] * 14
KD = [1, 1, 1, 2, 1, 1,  1, 1, 1, 2, 1, 1,  1, 1, 1] + [1] * 14
"""

G1_SEND = """
def send(q, tau=None):
    for i in range(NUM_MOTOR):
        m = cmd.motor_cmd[i]
        m.q = q[i]
        m.dq = 0.0
        m.kp = KP[i]
        m.kd = KD[i]
        m.tau = tau[i] if tau else 0.0
    robot.write(cmd)
"""

G1_STIFF = """
# жесткая стойка: ноги и корпус сильнее, чем в примере
KP = [300] * 12 + [200, 200, 200] + [40] * 14
KD = [6] * 12 + [4, 4, 4] + [1] * 14
"""

G1_BALANCE = """

def balance(pitch, gy):
    \"\"\"Баланс по IMU: момент в голеностопах и бедрах против наклона корпуса вперед-назад.\"\"\"
    tau = [0.0] * NUM_MOTOR
    for leg in (0, 6):                        # левая нога 0-5, правая 6-11
        tau[leg + 4] = 100 * pitch + 10 * gy  # голеностоп: стратегия голеностопа
        tau[leg + 0] = 50 * pitch + 5 * gy    # бедро: стратегия бедра
    return tau
"""

# ─────────────── задания ───────────────

PRESETS: dict[str, dict] = {}
SOLUTIONS: dict[str, str] = {}


def preset(name: str, **pd) -> None:
    pd.setdefault("limit", 10)
    PRESETS["robot-" + name] = pd


# песочницы
preset("go2-sandbox", robot="go2", mode="low", start={"pose": "lie"}, limit=20, tab="code",
       title="Песочница Go2", task="Свободный режим: любые программы для Go2 на низком уровне (LowCmd). Кнопка «Пульт» над окном включает спортивный режим и управление с клавиатуры.",
       python=GO2_HEAD + GO2_MOVE + """
move(STAND, 2)
print("стою")
robot.sleep(2)
move(LIE, 2)
print("лежу")
""")

preset("g1-sandbox", robot="g1", mode="low", start={"pose": "stand"}, hold=True, hang=True, limit=20, tab="code",
       title="Песочница G1", task="Свободный режим для G1. Робот висит на страховочном подвесе, моторы держат стойку с усилениями из примера Unitree. Кнопка «Пульт» над окном включает ползунки суставов.",
       python=G1_HEAD + G1_SEND + """
import math

t = 0.0
while t < 10:
    q = list(q0)
    q[RightShoulderRoll] = -1.2                       # поднять правую руку в сторону
    q[RightElbow] = 0.6 * math.sin(2 * math.pi * t)   # махать предплечьем
    send(q)
    robot.sleep(0.02)
    t = robot.time()
""")

# ── Go2: спортивный режим ──

preset("go2-standup", robot="go2", mode="sport", start={"pose": "lie"}, limit=8,
       title="Go2: встать и лечь",
       task="Go2 включен и лежит. В спортивном режиме им управляет встроенный контроллер, а программа отдает команды, как пульт: StandUp, StandDown, Move.\n\nПоднимите робота, подержите стоя 2 секунды и положите обратно.",
       hint="sport.StandUp(), затем robot.sleep(3), затем sport.StandDown() и еще robot.sleep(2), чтобы робот успел лечь.",
       python="""from unitree import *

robot = Robot()
sport = SportClient()

print("робот лежит")
# напишите команды здесь
""",
       checks=[{"type": "height", "min": 0.24, "hold": 2, "text": "Робот стоит не меньше 2 с (корпус выше 0,24 м)"},
               {"type": "below", "z": 0.15, "from": 5, "text": "В конце робот лег (корпус ниже 0,15 м)"}, UPRIGHT])
SOLUTIONS["robot-go2-standup"] = """from unitree import *

robot = Robot()
sport = SportClient()
sport.StandUp()
robot.sleep(3.5)
sport.StandDown()
robot.sleep(2)
"""

preset("go2-walk", robot="go2", mode="sport", start={"pose": "lie"}, limit=12,
       world={"marks": [{"pos": [2, 0], "r": 0.3}]},
       title="Go2: дойти до метки",
       task="Желтая метка лежит в 2 метрах впереди. Командой Move(vx, vy, vyaw) задается скорость: vx вперед в м/с, vy вбок, vyaw - поворот в рад/с. Робот идет, пока не придет StopMove().\n\nДоведите Go2 до метки и остановите его на ней.",
       hint="Путь = скорость × время. При vx = 0,5 м/с до метки 4 секунды. После StopMove() дайте роботу секунду, чтобы остановиться.",
       python="""from unitree import *

robot = Robot()
sport = SportClient()

sport.StandUp()
robot.sleep(1.5)

sport.Move(0.3, 0, 0)
robot.sleep(1)
sport.StopMove()
""",
       checks=[{"type": "zone", "x": 2, "y": 0, "r": 0.3, "text": "В конце робот стоит на метке"},
               {"type": "still", "v": 0.08, "text": "Робот остановился"}, UPRIGHT])
SOLUTIONS["robot-go2-walk"] = """from unitree import *

robot = Robot()
sport = SportClient()
sport.StandUp()
robot.sleep(1.5)
sport.Move(0.5, 0, 0)
robot.sleep(4.2)
sport.StopMove()
robot.sleep(2)
"""

preset("go2-square", robot="go2", mode="sport", start={"pose": "lie"}, limit=40,
       world={"marks": [{"pos": [1.5, 0], "r": 0.3}, {"pos": [1.5, 1.5], "r": 0.3}, {"pos": [0, 1.5], "r": 0.3}, {"pos": [0, 0], "r": 0.3, "rgba": [0.3, 0.8, 0.4, 0.9]}]},
       title="Go2: квадрат по IMU",
       task="Пройдите квадрат 1,5 × 1,5 м против часовой стрелки по меткам и вернитесь в зеленую метку старта.\n\nПовороты по времени неточны: робот проскальзывает. Поворачивайте, пока угол курса из IMU (st.imu_state.rpy[2]) не изменится на 90 градусов.",
       hint="Курс растет при повороте влево. Держите цель курса: goal = 0, затем math.pi/2, math.pi, -math.pi/2 (угол из IMU лежит в пределах от -pi до pi). Поворачивайте Move(0, 0, 0.8), пока ошибка больше 0,05 рад.",
       python="""from unitree import *
import math

robot = Robot()
sport = SportClient()

def yaw():
    return robot.read().imu_state.rpy[2]

sport.StandUp()
robot.sleep(1.5)

# первая сторона
sport.Move(0.5, 0, 0)
robot.sleep(3)
sport.StopMove()
robot.sleep(0.5)

# дальше: поворот на 90 градусов по yaw() и следующие стороны
""",
       checks=[{"type": "visit", "points": [[1.5, 0], [1.5, 1.5], [0, 1.5], [0, 0]], "r": 0.35, "text": "Пройдены все углы квадрата по порядку и робот вернулся к старту"}, UPRIGHT])
SOLUTIONS["robot-go2-square"] = """from unitree import *
import math

robot = Robot()
sport = SportClient()

def yaw():
    return robot.read().imu_state.rpy[2]

def wrap(a):
    while a > math.pi:
        a -= 2 * math.pi
    while a < -math.pi:
        a += 2 * math.pi
    return a

def turn_to(goal):
    while abs(wrap(goal - yaw())) > 0.05:
        e = wrap(goal - yaw())
        sport.Move(0, 0, max(-1.0, min(1.0, 2.5 * e)))
        robot.sleep(0.02)
    sport.StopMove()
    robot.sleep(0.5)

def side(goal):
    t0 = robot.time()
    while robot.time() - t0 < 3.1:
        e = wrap(goal - yaw())
        sport.Move(0.5, 0, 1.5 * e)
        robot.sleep(0.02)
    sport.StopMove()
    robot.sleep(0.7)

sport.StandUp()
robot.sleep(1.5)
goal = 0.0
for k in range(4):
    side(goal)
    goal = wrap(goal + math.pi / 2)
    if k < 3:
        turn_to(goal)
"""

CORRIDOR = {"boxes": [
    {"name": "r", "pos": [1.25, -0.5, 0.2], "size": [1.75, 0.05, 0.2]},
    {"name": "l", "pos": [0.8, 0.5, 0.2], "size": [1.3, 0.05, 0.2]},
    {"name": "end", "pos": [3.05, 1.0, 0.2], "size": [0.05, 1.55, 0.2]},
    {"name": "in", "pos": [2.1, 1.3, 0.2], "size": [0.05, 0.85, 0.2]},
    {"name": "back", "pos": [-0.55, 0, 0.2], "size": [0.05, 0.55, 0.2]},
], "marks": [{"pos": [2.6, 2.0], "r": 0.3}]}

preset("go2-corridor", robot="go2", mode="sport", start={"pose": "lie"}, limit=30, world=CORRIDOR,
       title="Go2: коридор с поворотом",
       task="Коридор шириной 1 м: 2,6 м прямо, поворот налево и еще 2 м до желтой метки. Касаться стен нельзя.\n\nИдите прямо, держа курс по IMU, повернитесь на месте на 90 градусов и дойдите до метки.",
       hint="Держите курс поправкой поворота: Move(0.5, 0, 1.5 * (goal - yaw)). Так робот не уйдет к стене из-за проскальзывания.",
       python="""from unitree import *
import math

robot = Robot()
sport = SportClient()

sport.StandUp()
robot.sleep(1.5)
sport.Move(0.5, 0, 0)
robot.sleep(8)
sport.StopMove()
""",
       checks=[{"type": "reach", "x": 2.6, "y": 2.0, "r": 0.3, "text": "Робот дошел до метки"},
               {"type": "nohit", "text": "Ни одного касания стен"}, UPRIGHT])
SOLUTIONS["robot-go2-corridor"] = """from unitree import *
import math

robot = Robot()
sport = SportClient()

def yaw():
    return robot.read().imu_state.rpy[2]

def go(goal, seconds):
    t0 = robot.time()
    while robot.time() - t0 < seconds:
        sport.Move(0.5, 0, 1.5 * (goal - yaw()))
        robot.sleep(0.02)
    sport.StopMove()
    robot.sleep(0.6)

sport.StandUp()
robot.sleep(1.5)
go(0.0, 5.3)
while abs(math.pi / 2 - yaw()) > 0.05:
    sport.Move(0, 0, max(-1.0, min(1.0, 2.5 * (math.pi / 2 - yaw()))))
    robot.sleep(0.02)
sport.StopMove()
robot.sleep(0.5)
go(math.pi / 2, 4.2)
robot.sleep(1)
"""

# ── Go2: низкий уровень ──

preset("go2-stand", robot="go2", mode="low", start={"pose": "lie"}, limit=6,
       title="Go2: плавный подъем",
       task="Низкий уровень: программа сама задает угол каждого из 12 моторов. Если сразу отправить позу «стоя», моторы рванут с места: в настоящем роботе это удар по редукторам.\n\nКак в примере Unitree go2_stand_example, переведите моторы из текущих углов в позу STAND плавно, за 1-2 секунды.",
       hint="Прочитайте стартовые углы st.motor_state[i].q и в цикле отправляйте (1 - s) * start + s * STAND, где s растет от 0 до 1 за 100 шагов по 0,02 с.",
       python=GO2_HEAD + """
for i in range(12):
    m = cmd.motor_cmd[i]
    m.q = STAND[i]
    m.kp = 60
    m.kd = 5
robot.write(cmd)
robot.sleep(5)
""",
       checks=[{"type": "height", "min": 0.3, "hold": 2, "text": "Робот стоит не меньше 2 с (корпус выше 0,3 м)"},
               {"type": "smooth", "maxdq": 4, "text": "Плавно: скорость суставов не выше 4 рад/с"}, UPRIGHT])
SOLUTIONS["robot-go2-stand"] = GO2_HEAD + GO2_MOVE + """
move(STAND, 2)
robot.sleep(3)
"""

preset("go2-pd", robot="go2", mode="low", start={"pose": "lie"}, limit=8,
       title="Go2: подбор kp и kd",
       task="Мотор считает момент tau = kp * (q - q_изм) + kd * (dq - dq_изм). Малый kp - сустав мягкий и проседает под весом, малый kd - робот качается.\n\nВ стартовой программе усиления слишком малы: робот не может встать. Подберите kp и kd так, чтобы он стоял высоко и суставы thigh и calf отставали от цели меньше чем на 0,035 рад.",
       hint="Откройте вкладку «Графики» и выберите сустав 1 FR_1: видно, как угол отстает от цели. С kp = 60 из примера Unitree ошибка около 0,05 рад: ошибка обратно пропорциональна kp.",
       python=GO2_HEAD + GO2_MOVE.replace("kp=60, kd=5", "kp=8, kd=0.5") + """
move(STAND, 2)
robot.sleep(5)
""",
       checks=[{"type": "height", "min": 0.31, "hold": 3, "text": "Робот стоит не меньше 3 с (корпус выше 0,31 м)"},
               {"type": "track", "joints": [1, 2, 4, 5, 7, 8, 10, 11], "tol": 0.035, "from": 3, "text": "Ошибка суставов thigh и calf меньше 0,035 рад"}, UPRIGHT])
SOLUTIONS["robot-go2-pd"] = GO2_HEAD + GO2_MOVE + """
move(STAND, 2, kp=100, kd=5)
robot.sleep(5)
"""

preset("go2-sit", robot="go2", mode="low", start={"pose": "lie"}, limit=8,
       title="Go2: сидеть",
       task="Составьте свою позу: робот встает, а потом садится, как собака: задние лапы сложены, передние почти прямые, нос поднят. Тангаж корпуса (наклон вперед-назад) берите из IMU.\n\nУдержите робота сидя 2 секунды: нос поднят хотя бы на 20 градусов.",
       hint="Тангаж отрицательный, когда нос поднят. Попробуйте передние thigh около 0,3, calf -1,0, задние thigh около 1,9, calf -2,6.",
       python=GO2_HEAD + GO2_MOVE + """
SIT = list(STAND)   # измените углы ног

move(STAND, 2)
move(SIT, 2)
robot.sleep(3)
print("тангаж, градусы:", robot.read().imu_state.rpy[1] * 57.3)
""",
       checks=[{"type": "rp", "axis": "pitch", "max": -20, "hold": 2, "text": "Нос поднят на 20 градусов и больше не меньше 2 с"},
               {"type": "smooth", "maxdq": 4, "text": "Плавно: скорость суставов не выше 4 рад/с"}, UPRIGHT])
SOLUTIONS["robot-go2-sit"] = GO2_HEAD + GO2_MOVE + """
SIT = [0.0, 0.3, -1.0, 0.0, 0.3, -1.0, 0.0, 1.9, -2.6, 0.0, 1.9, -2.6]
move(STAND, 2)
move(SIT, 2)
robot.sleep(3)
"""

preset("go2-ik", robot="go2", mode="low", start={"pose": "lie"}, limit=10,
       title="Go2: приседания по формуле",
       task="Обратная кинематика: по нужной точке стопы найти углы суставов. В программе есть функция ik() по теореме косинусов и pose(), которая считает все 12 углов из высот стоп.\n\nСделайте два приседания: опустите корпус до 0,2 м и поднимите до 0,32 м. В конце робот должен стоять высоко.",
       hint="Высота корпуса H задает стопы: pose([(0, -H)] * 4). Меняйте H по синусу или по шагам и отправляйте send(pose(...), 60, 5) каждые 0,02 с.",
       python=GO2_HEAD + GO2_IK + """
# встать плавно
st = robot.read()
start = [st.motor_state[i].q for i in range(12)]
target = pose([(0.0, -0.3)] * 4)
for k in range(101):
    s = k / 100
    send([(1 - s) * start[i] + s * target[i] for i in range(12)], 60, 5)
    robot.sleep(0.02)

# здесь приседания: меняйте высоту H от 0,3 до 0,2 и обратно
robot.sleep(6)
""",
       checks=[{"type": "below", "z": 0.22, "text": "Корпус опускался ниже 0,22 м"},
               {"type": "height", "min": 0.3, "hold": 1, "from": 7, "text": "В конце робот стоит (корпус выше 0,3 м)"},
               {"type": "code", "re": "pose\\(|ik\\(", "text": "Углы считаются через ik() или pose()"}, UPRIGHT])
SOLUTIONS["robot-go2-ik"] = GO2_HEAD + GO2_IK + """
st = robot.read()
start = [st.motor_state[i].q for i in range(12)]
target = pose([(0.0, -0.3)] * 4)
for k in range(101):
    s = k / 100
    send([(1 - s) * start[i] + s * target[i] for i in range(12)], 60, 5)
    robot.sleep(0.02)

t0 = robot.time()
while robot.time() - t0 < 6:
    t = robot.time() - t0
    H = 0.26 + 0.06 * math.cos(2 * math.pi * t / 3)   # 0,32 - 0,2 - 0,32, два раза
    send(pose([(0.0, -H)] * 4), 60, 5)
    robot.sleep(0.02)
"""

preset("go2-trot", robot="go2", mode="low", start={"pose": "lie"}, limit=12,
       title="Go2: своя рысь",
       task="Рысь - походка, в которой ноги по диагонали (FR с RL и FL с RR) шагают вместе. Пока одна пара стоит и толкает корпус, другая летит вперед по дуге.\n\nДопишите цикл походки: каждая стопа половину периода едет назад по земле (опора), половину летит вперед с подъемом (перенос). Пройдите вперед 1,5 м.",
       hint="Фаза ph от 0 до 1. Опора (ph < 0,5): x = STEP * (0,5 - s), z = -H. Перенос: x = STEP * (-0,5 + s), z = -H + LIFT * sin(pi * s). Для рыси нужны жесткие ноги: kp = 150, kd = 4.",
       python=GO2_HEAD + GO2_IK + """
H = 0.27
st = robot.read()
start = [st.motor_state[i].q for i in range(12)]
stand = pose([(0.0, -H)] * 4)
for k in range(101):
    s = k / 100
    send([(1 - s) * start[i] + s * stand[i] for i in range(12)], 60, 5)
    robot.sleep(0.02)

T = 0.36      # период шага, с
STEP = 0.12   # длина шага, м
LIFT = 0.07   # подъем стопы, м
phase = 0.0
dt = 0.02
while True:
    phase = (phase + dt / T) % 1
    feet = []
    for leg in range(4):
        ph = (phase + (0.0 if leg in (0, 3) else 0.5)) % 1   # FR и RL вместе, FL и RR вместе
        x = 0.0
        z = -H
        # допишите опору и перенос
        feet.append((x, z))
    send(pose(feet), 150, 4)
    robot.sleep(dt)
""",
       checks=[{"type": "reach", "x": 1.5, "text": "Робот прошел вперед 1,5 м"}, UPRIGHT])
SOLUTIONS["robot-go2-trot"] = GO2_HEAD + GO2_IK + """
H = 0.27
st = robot.read()
start = [st.motor_state[i].q for i in range(12)]
stand = pose([(0.0, -H)] * 4)
for k in range(101):
    s = k / 100
    send([(1 - s) * start[i] + s * stand[i] for i in range(12)], 60, 5)
    robot.sleep(0.02)

T = 0.36
STEP = 0.12
LIFT = 0.07
phase = 0.0
dt = 0.02
while True:
    phase = (phase + dt / T) % 1
    feet = []
    for leg in range(4):
        ph = (phase + (0.0 if leg in (0, 3) else 0.5)) % 1
        if ph < 0.5:
            s = ph / 0.5
            x = STEP * (0.5 - s)
            z = -H
        else:
            s = (ph - 0.5) / 0.5
            x = STEP * (-0.5 + s)
            z = -H + LIFT * math.sin(math.pi * s)
        feet.append((x, z))
    send(pose(feet), 150, 4)
    robot.sleep(dt)
"""

# ── G1 ──

preset("g1-wave", robot="g1", mode="low", start={"pose": "stand"}, hold=True, hang=True, limit=8,
       title="G1: помахать рукой",
       task="G1 висит на страховочном подвесе, как на стенде при первой настройке. Моторы держат стойку с усилениями из примера Unitree.\n\nПоднимите правую руку в сторону и помашите предплечьем: не меньше 3 взмахов с размахом больше 40 градусов.",
       hint="Правое плечо в сторону: q[RightShoulderRoll] = -1.2. Локоть по синусу: q[RightElbow] = 0.5 + 0.5 * math.sin(2 * math.pi * t). Отправляйте send(q) каждые 0,02 с.",
       python=G1_HEAD + G1_SEND + """
import math

t = 0.0
while t < 7:
    q = list(q0)
    # поднимите руку и помашите
    send(q)
    robot.sleep(0.02)
    t = robot.time()
""",
       checks=[{"type": "wave", "joint": 25, "amp": 0.7, "count": 3, "from": 0.5, "text": "Три взмаха правым локтем (RightElbow) с размахом больше 40°"},
               {"type": "pose", "joints": [23], "target": [0.0] * 23 + [-1.2] + [0.0] * 5, "tol": 0.3, "text": "В конце правая рука поднята в сторону (RightShoulderRoll около -1,2)"}])
SOLUTIONS["robot-g1-wave"] = G1_HEAD + G1_SEND + """
import math

t = 0.0
while True:
    q = list(q0)
    q[RightShoulderRoll] = -1.2
    q[RightElbow] = 0.5 + 0.5 * math.sin(2 * math.pi * t)
    send(q)
    robot.sleep(0.02)
    t = robot.time()
"""

preset("g1-stiff", robot="g1", mode="low", start={"pose": "stand"}, hold=True, limit=8,
       title="G1: стойка без подвеса",
       task="Подвес сняли. С усилениями из примера Unitree G1 падает через 2 секунды: голеностопы слишком мягкие для человека ростом 1,3 м. Мотор голеностопа должен перебороть момент веса, когда корпус чуть наклонился.\n\nПодберите kp и kd ног так, чтобы G1 простоял 6 секунд.",
       hint="Оцените: вес около 33 кг, центр масс на высоте 0,7 м. Момент веса при наклоне на угол a: 33 × 9,8 × 0,7 × a ≈ 230 × a Н·м. Два голеностопа с kp каждый дают 2 × kp × a. Значит, kp заметно больше 115, с запасом. Не забудьте kd.",
       python=G1_HEAD + G1_SEND + """
while True:
    send(q0)
    robot.sleep(0.02)
""",
       checks=[{"type": "height", "min": 0.74, "hold": 6, "text": "Робот стоит 6 с (таз выше 0,74 м)"}, UPRIGHT])
SOLUTIONS["robot-g1-stiff"] = G1_HEAD + G1_STIFF + G1_SEND + """
while True:
    send(q0)
    robot.sleep(0.02)
"""

preset("g1-balance", robot="g1", mode="low", start={"pose": "stand"}, hold=True, limit=8,
       title="G1: баланс по IMU",
       task="Жесткие суставы - не единственный путь. Настоящие роботы оставляют суставы мягкими (так безопаснее и тише), а равновесие держат обратной связью: IMU в тазу меряет наклон, контроллер добавляет момент.\n\nОставьте kp ног не выше 100 (как в примере Unitree) и удержите G1 6 секунд: добавляйте момент tau в голеностопы и бедра против тангажа и скорости наклона.",
       hint="Каждые 0,01 с читайте pitch = st.imu_state.rpy[1] и gy = st.imu_state.gyroscope[1]. Голеностопам (4 и 10) tau = 100 * pitch + 10 * gy, бедрам (0 и 6) tau = 50 * pitch + 5 * gy.",
       python=G1_HEAD + G1_SEND + """
while True:
    st = robot.read()
    roll, pitch, yaw = st.imu_state.rpy
    gx, gy, gz = st.imu_state.gyroscope
    tau = [0.0] * NUM_MOTOR
    # добавьте момент против наклона
    send(q0, tau)
    robot.sleep(0.01)
""",
       checks=[{"type": "height", "min": 0.74, "hold": 6, "text": "Робот стоит 6 с (таз выше 0,74 м)"},
               {"type": "kpmax", "joints": list(range(12)), "max": 100, "text": "kp ног не выше 100"}, UPRIGHT])
SOLUTIONS["robot-g1-balance"] = G1_HEAD + G1_SEND + G1_BALANCE + """
while True:
    st = robot.read()
    send(q0, balance(st.imu_state.rpy[1], st.imu_state.gyroscope[1]))
    robot.sleep(0.01)
"""

preset("g1-squat", robot="g1", mode="low", start={"pose": "stand"}, hold=True, limit=8,
       title="G1: присед",
       task="Присед - согласованное движение трех суставов каждой ноги: бедро вперед, колено назад в два раза больше, голеностоп возвращает стопу горизонтально. Тогда стопы стоят плоско, а таз опускается почти вертикально.\n\nПрисядьте до высоты таза 0,65 м и плавно встаньте. В конце G1 должен стоять.",
       hint="Для обеих ног (0 и 6): q[leg] = -d, q[leg + 3] = 2 * d, q[leg + 4] = -d. Глубина d до 0,7 рад. Возьмите жесткую стойку из прошлого задания.",
       python=G1_HEAD + G1_SEND + """
import math

t = 0.0
while True:
    d = 0.0   # глубина приседа, рад
    q = list(q0)
    for leg in (0, 6):
        q[leg + 0] = -d       # бедро
        q[leg + 3] = 2 * d    # колено
        q[leg + 4] = -d       # голеностоп
    send(q)
    robot.sleep(0.01)
    t = robot.time()
""",
       checks=[{"type": "below", "z": 0.65, "text": "Таз опускался ниже 0,65 м"},
               {"type": "height", "min": 0.74, "hold": 1.5, "from": 6, "text": "В конце робот стоит (таз выше 0,74 м)"}, UPRIGHT])
SOLUTIONS["robot-g1-squat"] = G1_HEAD + G1_STIFF + G1_SEND + """
import math

t = 0.0
while True:
    d = 0.7 * (1 - math.cos(2 * math.pi * t / 5)) / 2 if t < 5 else 0.0
    q = list(q0)
    for leg in (0, 6):
        q[leg + 0] = -d
        q[leg + 3] = 2 * d
        q[leg + 4] = -d
    send(q)
    robot.sleep(0.01)
    t = robot.time()
"""

preset("g1-arms", robot="g1", mode="low", start={"pose": "stand"}, hold=True, limit=8,
       title="G1: руки вперед",
       task="Итоговое задание по G1. Робот вытягивает обе руки вперед, как будто держит коробку. Центр масс уходит вперед на 4 см, и одной жесткости ног уже не хватает: нужен еще баланс по IMU.\n\nПоднимите обе руки вперед за 3 секунды (ShoulderPitch -1,5, Elbow 1,3: у G1 ноль локтя - рука, согнутая под прямым углом) и стойте до конца задания.",
       hint="Соедините жесткую стойку (задание «Стойка без подвеса») и момент по IMU (задание «Баланс по IMU»). Руки поднимайте плавно: q = (1 - s) * q0 + s * up.",
       python=G1_HEAD + G1_SEND + """
up = list(q0)
up[LeftShoulderPitch] = -1.5
up[RightShoulderPitch] = -1.5
up[LeftElbow] = 1.3
up[RightElbow] = 1.3

n = 300
for k in range(n + 1):
    s = k / n
    send([(1 - s) * q0[i] + s * up[i] for i in range(NUM_MOTOR)])
    robot.sleep(0.01)
while True:
    send(up)
    robot.sleep(0.01)
""",
       checks=[{"type": "pose", "joints": [15, 22], "target": [0.0] * 15 + [-1.5] + [0.0] * 6 + [-1.5] + [0.0] * 6, "tol": 0.2, "text": "Обе руки вытянуты вперед"},
               {"type": "height", "min": 0.74, "hold": 7, "text": "Робот стоит все задание (таз выше 0,74 м)"}, UPRIGHT])
SOLUTIONS["robot-g1-arms"] = G1_HEAD + G1_STIFF + G1_SEND + G1_BALANCE + """
up = list(q0)
up[LeftShoulderPitch] = -1.5
up[RightShoulderPitch] = -1.5
up[LeftElbow] = 1.3
up[RightElbow] = 1.3

k = 0
while True:
    s = min(1.0, k / 300)
    k += 1
    st = robot.read()
    q = [(1 - s) * q0[i] + s * up[i] for i in range(NUM_MOTOR)]
    send(q, balance(st.imu_state.rpy[1], st.imu_state.gyroscope[1]))
    robot.sleep(0.01)
"""


def write() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("robot-*.json"):
        if old.stem not in PRESETS:
            old.unlink()
    for name, pd in PRESETS.items():
        (OUT / f"{name}.json").write_text(json.dumps(pd, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(PRESETS)} заданий -> {OUT}")


if __name__ == "__main__":
    if "--solutions" in sys.argv:
        print(json.dumps({"presets": PRESETS, "solutions": SOLUTIONS}, ensure_ascii=False))
    else:
        write()
