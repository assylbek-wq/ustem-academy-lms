// Модуль unitree для программ на MicroPython. Повторяет структуры unitree_sdk2 (LowCmd, LowState, MotorCmd,
// SportClient), но время виртуальное: robot.sleep() продвигает симуляцию MuJoCo. Внутри вызывает _robot (JavaScript).
import { ROBOTS } from "./models.js";

export function pyModule(robotId) {
  const R = ROBOTS[robotId];
  const consts = R.labels.map((l, i) => `${l} = ${i}`).join("\n");
  const go2 = robotId === "go2";
  return `
import _robot

ROBOT = "${R.id}"
NUM_MOTOR = ${R.motors.length}
${consts}

class SimOver(BaseException):
    """Время задания закончилось: программа останавливается."""
    pass

def _r(v):
    if isinstance(v, str):
        if v == "__over__":
            raise SimOver()
        if v.startswith("__err__:"):
            raise RuntimeError(v[8:])
    return v

class MotorCmd:
    def __init__(self):
        self.mode = 1
        self.q = 0.0
        self.dq = 0.0
        self.kp = 0.0
        self.kd = 0.0
        self.tau = 0.0

class LowCmd:
    """Команда всем моторам: для каждого q, dq, kp, kd, tau (как unitree_go/unitree_hg LowCmd_)."""
    def __init__(self):
        self.motor_cmd = [MotorCmd() for _ in range(NUM_MOTOR)]

class MotorState:
    def __init__(self):
        self.q = 0.0
        self.dq = 0.0
        self.tau_est = 0.0

class IMUState:
    def __init__(self):
        self.rpy = (0.0, 0.0, 0.0)
        self.gyroscope = (0.0, 0.0, 0.0)
        self.accelerometer = (0.0, 0.0, 0.0)
        self.quaternion = (1.0, 0.0, 0.0, 0.0)

class LowState:
    """Состояние робота: motor_state[i].q / dq / tau_est, imu_state.rpy / gyroscope / accelerometer / quaternion${go2 ? ", foot_force[4]" : ", foot_force[2]"}."""
    def __init__(self):
        self.motor_state = [MotorState() for _ in range(NUM_MOTOR)]
        self.imu_state = IMUState()
        self.foot_force = []
        self.tick = 0

def _fill(st, v):
    n = NUM_MOTOR
    ms = st.motor_state
    for i in range(n):
        m = ms[i]
        m.q = v[i]
        m.dq = v[n + i]
        m.tau_est = v[2 * n + i]
    k = 3 * n
    st.imu_state.rpy = (v[k], v[k + 1], v[k + 2])
    st.imu_state.gyroscope = (v[k + 3], v[k + 4], v[k + 5])
    st.imu_state.accelerometer = (v[k + 6], v[k + 7], v[k + 8])
    st.imu_state.quaternion = (v[k + 9], v[k + 10], v[k + 11], v[k + 12])
    nf = len(v) - k - 14
    st.foot_force = [v[k + 13 + j] for j in range(nf)]
    st.tick = int(v[len(v) - 1] * 1000)
    return st

class Robot:
    """Робот в симуляторе. read() - LowState, write(cmd) - LowCmd, sleep(с) - ждать, time() - время задания."""
    def __init__(self):
        self.name = ROBOT
        self.num_motor = NUM_MOTOR
        self._st = LowState()

    def read(self):
        v = _r(_robot.state())
        return _fill(self._st, [v[i] for i in range(len(v))])

    def write(self, cmd):
        m = cmd.motor_cmd
        s = ",".join([str(c.q) for c in m]) + ";" + ",".join([str(c.dq) for c in m]) + ";" + ",".join([str(c.kp) for c in m]) + ";" + ",".join([str(c.kd) for c in m]) + ";" + ",".join([str(c.tau) for c in m])
        _r(_robot.write(s))

    def sleep(self, seconds):
        _r(_robot.sleep(float(seconds)))

    def time(self):
        return _r(_robot.now())

def sleep(seconds):
    _r(_robot.sleep(float(seconds)))

def now():
    return _r(_robot.now())

class SportClient:
    """Высокий уровень Go2 (как unitree_sdk2 SportClient): StandUp, StandDown, Damp, BalanceStand, Move(vx, vy, vyaw), StopMove."""
    def __init__(self, robot=None):
        pass
    def SetTimeout(self, t):
        pass
    def Init(self):
        pass
    def _c(self, name, a=0.0, b=0.0, c=0.0):
        return _r(_robot.sport(name, float(a), float(b), float(c)))
    def StandUp(self):
        return self._c("StandUp")
    def StandDown(self):
        return self._c("StandDown")
    def Damp(self):
        return self._c("Damp")
    def BalanceStand(self):
        return self._c("BalanceStand")
    def RecoveryStand(self):
        return self._c("RecoveryStand")
    def StopMove(self):
        return self._c("StopMove")
    def Move(self, vx, vy, vyaw):
        return self._c("Move", vx, vy, vyaw)
`;
}
