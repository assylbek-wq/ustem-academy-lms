"""Задания симулятора FTC: python3 assets/lab/ftc_presets.py -> app/static/ftcsim/presets/*.json.

В уроке задание вставляется блоком <div class="ftc-sim-ИМЯ"></div> (ИМЯ без префикса ftc-).
"play": True - задание на игру пилота, код уже готов (в проверке --negative пропускается).
SOLUTIONS - эталонные решения для сквозной проверки (tests/e2e/ftc_solutions.py): код, робот и сценарий
геймпада [[t0, t1, {кнопки и стики}], ...] по времени симуляции после START.

Поле 144 x 144 дюйма, начало координат в центре, ось y от пилотов к дальней стене. Курс 0 - робот смотрит
от пилотов, положительный угол - поворот против часовой стрелки (как yaw у IMU).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "app" / "static" / "ftcsim" / "presets"

MECANUM = {"drive": "mecanum", "size": 18, "modules": ["intake", "launcher"], "names": {}}
TANK = {"drive": "tank", "size": 18, "modules": [], "names": {}}

HEAD = """package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.{kind};
import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.hardware.DcMotor;
"""

MOTORS4 = """        DcMotor fl = hardwareMap.get(DcMotor.class, "frontLeft");
        DcMotor fr = hardwareMap.get(DcMotor.class, "frontRight");
        DcMotor bl = hardwareMap.get(DcMotor.class, "backLeft");
        DcMotor br = hardwareMap.get(DcMotor.class, "backRight");
"""


def head(kind: str, extra: str = "") -> str:
    return HEAD.replace("{kind}", kind) + extra


# ─────────────── 1. Конфигурация ───────────────
CONFIG_CODE = head("Autonomous") + """
@Autonomous(name = "Проверка шасси")
public class DriveCheck extends LinearOpMode {
    @Override
    public void runOpMode() {
""" + MOTORS4 + """
        fl.setDirection(DcMotor.Direction.REVERSE);
        bl.setDirection(DcMotor.Direction.REVERSE);

        telemetry.addLine("Моторы найдены. Нажмите START");
        telemetry.update();
        waitForStart();

        // Едем вперед 1 секунду на половине мощности
        fl.setPower(0.5);
        fr.setPower(0.5);
        bl.setPower(0.5);
        br.setPower(0.5);
        sleep(1000);

        fl.setPower(0);
        fr.setPower(0);
        bl.setPower(0);
        br.setPower(0);
    }
}
"""

# ─────────────── 2. Первый TeleOp (танк) ───────────────
TANK_START = head("TeleOp") + """
@TeleOp(name = "Первый TeleOp")
public class FirstTeleOp extends LinearOpMode {
    @Override
    public void runOpMode() {
        DcMotor left = hardwareMap.get(DcMotor.class, "leftDrive");
        DcMotor right = hardwareMap.get(DcMotor.class, "rightDrive");

        waitForStart();

        while (opModeIsActive()) {
            double drive = gamepad1.left_stick_y;   // вперед-назад
            double turn = gamepad1.right_stick_x;   // поворот

            left.setPower(drive + turn);
            right.setPower(drive - turn);
        }
    }
}
"""

TANK_SOLUTION = TANK_START.replace(
    """        waitForStart();""",
    """        left.setDirection(DcMotor.Direction.REVERSE);

        waitForStart();""").replace(
    "double drive = gamepad1.left_stick_y;", "double drive = -gamepad1.left_stick_y;").replace(
    """            right.setPower(drive - turn);
""", """            right.setPower(drive - turn);

            telemetry.addData("Левый", "%.2f", drive + turn);
            telemetry.addData("Правый", "%.2f", drive - turn);
            telemetry.update();
""")

# ─────────────── 3. Mecanum TeleOp ───────────────
MEC_LOOP_START = """        while (opModeIsActive()) {
            double y = -gamepad1.left_stick_y;  // вперед (стик вверх дает минус)
            double r = gamepad1.right_stick_x;  // поворот
            // TODO: добавьте x = gamepad1.left_stick_x и езду вбок

            double max = Math.max(Math.abs(y) + Math.abs(r), 1.0);
            fl.setPower((y + r) / max);
            fr.setPower((y - r) / max);
            bl.setPower((y + r) / max);
            br.setPower((y - r) / max);

            telemetry.addData("y / r", "%.2f / %.2f", y, r);
            telemetry.update();
        }
"""

MEC_LOOP = """        while (opModeIsActive()) {
            double y = -gamepad1.left_stick_y;  // вперед (стик вверх дает минус)
            double x = gamepad1.left_stick_x;   // вбок
            double r = gamepad1.right_stick_x;  // поворот
            double speed = gamepad1.left_bumper ? 0.4 : 1.0;  // медленный режим

            double max = Math.max(Math.abs(y) + Math.abs(x) + Math.abs(r), 1.0);
            fl.setPower((y + x + r) / max * speed);
            fr.setPower((y - x - r) / max * speed);
            bl.setPower((y - x + r) / max * speed);
            br.setPower((y + x - r) / max * speed);

            telemetry.addData("y / x / r", "%.2f / %.2f / %.2f", y, x, r);
            telemetry.update();
        }
"""


def mec_teleop(loop: str, name: str = "TeleOp Mecanum", cls: str = "TeleOpMecanum") -> str:
    return head("TeleOp") + f"""
@TeleOp(name = "{name}")
public class {cls} extends LinearOpMode {{
    @Override
    public void runOpMode() {{
""" + MOTORS4 + """
        fl.setDirection(DcMotor.Direction.REVERSE);
        bl.setDirection(DcMotor.Direction.REVERSE);
        for (DcMotor m : new DcMotor[]{fl, fr, bl, br}) {
            m.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        }

        telemetry.addLine("Готов. Нажмите START");
        telemetry.update();
        waitForStart();

""" + loop + """    }
}
"""


# ─────────────── 4. Механизмы ───────────────
MECH_START_LOOP = """        while (opModeIsActive()) {
            double y = -gamepad1.left_stick_y;
            double x = gamepad1.left_stick_x;
            double r = gamepad1.right_stick_x;
            double speed = gamepad1.left_bumper ? 0.4 : 1.0;

            double max = Math.max(Math.abs(y) + Math.abs(x) + Math.abs(r), 1.0);
            fl.setPower((y + x + r) / max * speed);
            fr.setPower((y - x - r) / max * speed);
            bl.setPower((y - x + r) / max * speed);
            br.setPower((y + x - r) / max * speed);

            // TODO 1. Захват: правый бампер - затянуть (мощность 1), B - выбросить (-1), иначе 0
            // TODO 2. Маховик: правый триггер нажат больше чем на половину - мощность 1, иначе 0
            // TODO 3. Заслонка: пока нажата A - setPosition(1), иначе setPosition(0)

            telemetry.addData("Пыльца", "заберите с поля и забросьте в улей");
            telemetry.update();
        }
"""

MECH_LOOP = """        while (opModeIsActive()) {
            double y = -gamepad1.left_stick_y;
            double x = gamepad1.left_stick_x;
            double r = gamepad1.right_stick_x;
            double speed = gamepad1.left_bumper ? 0.4 : 1.0;

            double max = Math.max(Math.abs(y) + Math.abs(x) + Math.abs(r), 1.0);
            fl.setPower((y + x + r) / max * speed);
            fr.setPower((y - x - r) / max * speed);
            bl.setPower((y - x + r) / max * speed);
            br.setPower((y + x - r) / max * speed);

            // Захват: правый бампер - затянуть, B - выбросить
            if (gamepad1.right_bumper) {
                intake.setPower(1);
            } else if (gamepad1.b) {
                intake.setPower(-1);
            } else {
                intake.setPower(0);
            }

            // Маховик раскручивается, пока нажат правый триггер
            launcher.setPower(gamepad1.right_trigger > 0.5 ? 1 : 0);

            // Заслонка открыта, пока нажата A
            gate.setPosition(gamepad1.a ? 1 : 0);

            telemetry.addData("Маховик", "%.0f тиков/с", launcher.getVelocity());
            telemetry.addData("Заслонка", gate.getPosition());
            telemetry.update();
        }
"""


def mech_teleop(loop: str, name: str, cls: str) -> str:
    return head("TeleOp", "import com.qualcomm.robotcore.hardware.DcMotorEx;\nimport com.qualcomm.robotcore.hardware.Servo;\n") + f"""
@TeleOp(name = "{name}")
public class {cls} extends LinearOpMode {{
    @Override
    public void runOpMode() {{
""" + MOTORS4 + """        DcMotor intake = hardwareMap.get(DcMotor.class, "intake");
        DcMotorEx launcher = hardwareMap.get(DcMotorEx.class, "launcher");
        Servo gate = hardwareMap.get(Servo.class, "gate");

        fl.setDirection(DcMotor.Direction.REVERSE);
        bl.setDirection(DcMotor.Direction.REVERSE);
        gate.setPosition(0);

        waitForStart();

""" + loop + """    }
}
"""


# ─────────────── 5. Энкодеры ───────────────
ENC_START = head("Autonomous") + """
@Autonomous(name = "Ровно 48 дюймов")
public class DriveDistance extends LinearOpMode {
    @Override
    public void runOpMode() {
""" + MOTORS4 + """        fl.setDirection(DcMotor.Direction.REVERSE);
        bl.setDirection(DcMotor.Direction.REVERSE);

        waitForStart();

        // Едем «по времени»: результат зависит от заряда аккумулятора и пола
        for (DcMotor m : new DcMotor[]{fl, fr, bl, br}) {
            m.setPower(0.5);
        }
        sleep(1800);
        for (DcMotor m : new DcMotor[]{fl, fr, bl, br}) {
            m.setPower(0);
        }
    }
}
"""

ENC_SOLUTION = head("Autonomous") + """
@Autonomous(name = "Ровно 48 дюймов")
public class DriveDistance extends LinearOpMode {
    static final double TICKS_PER_REV = 537.7;
    static final double WHEEL_MM = 104;
    static final double TICKS_PER_INCH = TICKS_PER_REV / (Math.PI * WHEEL_MM / 25.4);

    @Override
    public void runOpMode() {
""" + MOTORS4 + """        fl.setDirection(DcMotor.Direction.REVERSE);
        bl.setDirection(DcMotor.Direction.REVERSE);
        DcMotor[] all = new DcMotor[]{fl, fr, bl, br};

        waitForStart();

        int target = (int) (48 * TICKS_PER_INCH);
        for (DcMotor m : all) {
            m.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
            m.setTargetPosition(target);
            m.setMode(DcMotor.RunMode.RUN_TO_POSITION);
            m.setPower(0.5);
        }
        while (opModeIsActive() && fl.isBusy()) {
            telemetry.addData("Цель", target);
            telemetry.addData("Позиция", fl.getCurrentPosition());
            telemetry.update();
        }
        for (DcMotor m : all) {
            m.setPower(0);
        }
    }
}
"""

# ─────────────── 6. IMU ───────────────
IMU_IMPORTS = """import com.qualcomm.hardware.rev.RevHubOrientationOnRobot;
import com.qualcomm.robotcore.hardware.IMU;
import com.qualcomm.robotcore.util.Range;
import org.firstinspires.ftc.robotcore.external.navigation.AngleUnit;
"""

IMU_START = head("Autonomous", IMU_IMPORTS) + """
@Autonomous(name = "Поворот на 90")
public class Turn90 extends LinearOpMode {
    @Override
    public void runOpMode() {
""" + MOTORS4 + """        fl.setDirection(DcMotor.Direction.REVERSE);
        bl.setDirection(DcMotor.Direction.REVERSE);

        IMU imu = hardwareMap.get(IMU.class, "imu");
        imu.initialize(new IMU.Parameters(new RevHubOrientationOnRobot(
                RevHubOrientationOnRobot.LogoFacingDirection.UP,
                RevHubOrientationOnRobot.UsbFacingDirection.FORWARD)));

        waitForStart();
        imu.resetYaw();

        // Поворот налево «по времени» - угол получается каждый раз разный
        double turn = -0.4;
        fl.setPower(turn);
        fr.setPower(-turn);
        bl.setPower(turn);
        br.setPower(-turn);
        sleep(700);
        fl.setPower(0);
        fr.setPower(0);
        bl.setPower(0);
        br.setPower(0);

        telemetry.addData("Угол", imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.DEGREES));
        telemetry.update();
        sleep(1000);
    }
}
"""

IMU_SOLUTION = head("Autonomous", IMU_IMPORTS) + """
@Autonomous(name = "Поворот на 90")
public class Turn90 extends LinearOpMode {
    @Override
    public void runOpMode() {
""" + MOTORS4 + """        fl.setDirection(DcMotor.Direction.REVERSE);
        bl.setDirection(DcMotor.Direction.REVERSE);
        for (DcMotor m : new DcMotor[]{fl, fr, bl, br}) {
            m.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.BRAKE);
        }

        IMU imu = hardwareMap.get(IMU.class, "imu");
        imu.initialize(new IMU.Parameters(new RevHubOrientationOnRobot(
                RevHubOrientationOnRobot.LogoFacingDirection.UP,
                RevHubOrientationOnRobot.UsbFacingDirection.FORWARD)));

        waitForStart();
        imu.resetYaw();

        double target = 90;  // налево - положительный угол
        while (opModeIsActive()) {
            double heading = imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.DEGREES);
            double error = target - heading;
            if (Math.abs(error) < 1) {
                break;
            }
            // P-регулятор: чем ближе к цели, тем медленнее поворот
            double turn = Range.clip(error * 0.02, -0.5, 0.5);
            if (Math.abs(turn) < 0.08) {
                turn = Math.signum(turn) * 0.08;
            }
            fl.setPower(-turn);
            fr.setPower(turn);
            bl.setPower(-turn);
            br.setPower(turn);
            telemetry.addData("Угол", "%.1f", heading);
            telemetry.update();
        }
        fl.setPower(0);
        fr.setPower(0);
        bl.setPower(0);
        br.setPower(0);
        sleep(500);
    }
}
"""

# ─────────────── 7. Автономный режим ───────────────
AUTO_IMPORTS = "import com.qualcomm.robotcore.hardware.Servo;\n"

AUTO_START = head("Autonomous", AUTO_IMPORTS) + """
@Autonomous(name = "Auto Пыльца")
public class AutoPollen extends LinearOpMode {
    DcMotor fl, fr, bl, br, launcher;
    Servo gate;

    @Override
    public void runOpMode() {
        fl = hardwareMap.get(DcMotor.class, "frontLeft");
        fr = hardwareMap.get(DcMotor.class, "frontRight");
        bl = hardwareMap.get(DcMotor.class, "backLeft");
        br = hardwareMap.get(DcMotor.class, "backRight");
        launcher = hardwareMap.get(DcMotor.class, "launcher");
        gate = hardwareMap.get(Servo.class, "gate");
        fl.setDirection(DcMotor.Direction.REVERSE);
        bl.setDirection(DcMotor.Direction.REVERSE);
        gate.setPosition(0);

        waitForStart();

        // TODO 1. Раскрутите маховик, откройте заслонку и забросьте 4 пыльцы в улей
        // TODO 2. Закройте заслонку и припаркуйтесь в зоне PARK (правый нижний угол)

        strafe(0.5, 1000);  // пока только сдвиг вправо
    }

    // Езда вбок: мощность вправо (минус - влево) и время в мс
    void strafe(double power, long ms) {
        fl.setPower(power);
        fr.setPower(-power);
        bl.setPower(-power);
        br.setPower(power);
        sleep(ms);
        stopDrive();
    }

    void stopDrive() {
        fl.setPower(0);
        fr.setPower(0);
        bl.setPower(0);
        br.setPower(0);
    }
}
"""

AUTO_SOLUTION = AUTO_START.replace(
    """        // TODO 1. Раскрутите маховик, откройте заслонку и забросьте 4 пыльцы в улей
        // TODO 2. Закройте заслонку и припаркуйтесь в зоне PARK (правый нижний угол)

        strafe(0.5, 1000);  // пока только сдвиг вправо
""", """        // 1. Маховик раскручивается около секунды, потом открываем заслонку
        launcher.setPower(1);
        sleep(1200);
        gate.setPosition(1);
        sleep(2000);
        gate.setPosition(0);
        launcher.setPower(0);

        // 2. Парковка: вправо до зоны PARK
        strafe(0.8, 1400);
        telemetry.addLine("AUTO готов");
        telemetry.update();
""")

PARK_ZONES = "Зона PARK - правый нижний угол поля (желтая штриховка)."

PRESETS = {
    "ftc-sandbox": {
        "title": "Свободная тренировка",
        "robot": MECANUM,
        "start": {"x": 0, "y": -60, "h": 0},
        "code": mech_teleop(MECH_LOOP, "TeleOp Main", "TeleOpMain"),
        "checks": [],
    },
    "ftc-config": {
        "title": "Конфигурация: робот не стартует",
        "task": "Нажмите INIT: программа падает, потому что не находит моторы. Сравните имена в коде и в "
                "конфигурации (вкладка «Робот») и исправьте то или другое.\nКогда INIT пройдет, нажмите START: "
                "робот должен проехать вперед примерно на 30 дюймов до отметки.",
        "robot": {**MECANUM, "modules": [], "names": {"frontLeft": "frontleft", "backRight": "back_right"}},
        "start": {"x": 0, "y": -60, "h": 0},
        "pollen": "none",
        "code": CONFIG_CODE,
        "marks": [{"x": 0, "y": -30, "r": 5, "label": "Финиш"}],
        "checks": [
            {"type": "init_ok", "label": "INIT проходит без ошибок"},
            {"type": "pose_end", "x": 0, "y": -30, "tol": 5, "label": "Робот остановился у отметки «Финиш»"},
        ],
    },
    "ftc-first-teleop": {
        "title": "Первый TeleOp: танковое шасси",
        "task": "Робот едет назад и крутится не в ту сторону. Исправьте код: минус перед стиком Y и REVERSE "
                "для левого мотора. Добавьте telemetry с мощностями «Левый» и «Правый».\nЗатем нажмите INIT, "
                "START и проедьте через три флажка (W/S - вперед-назад, стрелки - поворот).",
        "robot": TANK,
        "start": {"x": 0, "y": -60, "h": 0},
        "pollen": "none",
        "code": TANK_START,
        "marks": [{"x": -40, "y": -40, "r": 9, "label": "1"}, {"x": -44, "y": 30, "r": 9, "label": "2"},
                  {"x": 30, "y": 44, "r": 9, "label": "3"}],
        "checks": [
            {"type": "telemetry", "text": "Левый", "label": "В telemetry видна мощность «Левый»"},
            {"type": "zones", "zones": [{"x": -40, "y": -40, "r": 9}, {"x": -44, "y": 30, "r": 9}, {"x": 30, "y": 44, "r": 9}],
             "label": "Робот проехал через все три флажка"},
        ],
    },
    "ftc-builder": {
        "title": "Конструктор: робот для практики",
        "task": "Соберите робота для учебной игры: шасси mecanum, захват-ролик и пусковая установка. Робот должен "
                "пройти осмотр: старт в кубе 18 дюймов, не больше 8 моторов и 8 сервоприводов.\nСейчас собран "
                "танк с рамой 19 дюймов и длинной рукой: он осмотр не пройдет. Все меняется на вкладке «Робот».",
        "robot": {"drive": "tank", "size": 19, "modules": ["arm"], "names": {}},
        "start": {"x": 0, "y": -60, "h": 0},
        "code": mec_teleop(MEC_LOOP),
        "tab": "robot",
        "checks": [
            {"type": "builder_has", "drive": "mecanum", "label": "Шасси mecanum"},
            {"type": "builder_has", "modules": ["intake", "launcher"], "label": "Есть захват-ролик и пусковая установка"},
            {"type": "inspection", "label": "Робот проходит осмотр"},
        ],
    },
    "ftc-mecanum": {
        "title": "TeleOp для mecanum: езда вбок",
        "task": "В программе есть только езда вперед и поворот. Добавьте x = gamepad1.left_stick_x в формулы "
                "колес (FL = y + x + r, FR = y - x - r, BL = y - x + r, BR = y + x - r) и выведите x в telemetry.\n"
                "Проверьте: A/D двигают робота вбок без поворота. Доберитесь до обоих флажков у стенки пилотов.",
        "robot": {**MECANUM, "modules": []},
        "start": {"x": 0, "y": -60, "h": 0},
        "pollen": "none",
        "code": mec_teleop(MEC_LOOP_START),
        "marks": [{"x": -50, "y": -60, "r": 7, "label": "L"}, {"x": 50, "y": -60, "r": 7, "label": "R"}],
        "checks": [
            {"type": "telemetry", "text": " x ", "label": "В telemetry есть значение x"},
            {"type": "strafe", "dist": 24, "label": "Робот проехал вбок 24 дюйма, не поворачивая"},
            {"type": "zones", "zones": [{"x": -50, "y": -60, "r": 7}, {"x": 50, "y": -60, "r": 7}],
             "label": "Робот побывал у обоих флажков"},
        ],
    },
    "ftc-mechanisms": {
        "title": "Механизмы на геймпаде: захват и пуск",
        "task": "Допишите управление механизмами: захват (правый бампер - E, выброс - K), маховик (правый триггер - C) "
                "и заслонку (A - J). Робот начинает без пыльцы.\nСоберите хотя бы 3 пыльцы у боковой стены, "
                "встаньте лицом к улью на расстоянии 24-84 дюйма и забросьте 2 в улей.",
        "robot": MECANUM,
        "start": {"x": 0, "y": -60, "h": 0},
        "preload": 0,
        "code": mech_teleop(MECH_START_LOOP, "TeleOp Механизмы", "TeleOpMechanisms"),
        "checks": [
            {"type": "collect", "n": 3, "label": "Захват собрал 3 пыльцы"},
            {"type": "hits", "n": 2, "label": "2 попадания в улей"},
        ],
    },
    "ftc-encoder": {
        "title": "Энкодеры: ровно 48 дюймов",
        "task": "Программа едет «по времени» и проезжает лишнее. Перепишите ее на энкодерах: посчитайте тики на "
                "48 дюймов (537,7 тика на оборот, колесо 104 мм), используйте RUN_TO_POSITION и isBusy().\n"
                "Робот должен остановиться у отметки с точностью 1,5 дюйма.",
        "robot": {**MECANUM, "modules": []},
        "start": {"x": -36, "y": -60, "h": 0},
        "pollen": "none",
        "code": ENC_START,
        "marks": [{"x": -36, "y": -12, "r": 1.5, "label": "48"}],
        "checks": [
            {"type": "code_has", "re": "RUN_TO_POSITION|getCurrentPosition", "label": "Код использует энкодеры"},
            {"type": "pose_end", "x": -36, "y": -12, "tol": 1.5, "label": "Робот проехал 48 дюймов (точность 1,5)"},
        ],
    },
    "ftc-imu": {
        "title": "IMU: поворот на 90 градусов",
        "task": "Поворот «по времени» каждый раз дает разный угол. Сделайте поворот по IMU: читайте yaw в цикле и "
                "уменьшайте мощность у цели (P-регулятор).\nНалево - положительный угол. Робот должен остановиться "
                "на 90 градусах с точностью 2 градуса.",
        "robot": {**MECANUM, "modules": []},
        "start": {"x": -36, "y": -36, "h": 0},
        "pollen": "none",
        "code": IMU_START,
        "checks": [
            {"type": "code_has", "re": "getYaw", "label": "Код читает угол IMU"},
            {"type": "heading_end", "deg": 90, "tol": 2, "label": "Итоговый угол 90 ± 2 градуса"},
        ],
    },
    "ftc-auto": {
        "title": "Автономный режим: заброс и парковка",
        "task": "Робот стоит лицом к улью в 60 дюймах и везет 4 пыльцы. За 30 секунд AUTO: раскрутите маховик, "
                "откройте заслонку, забросьте пыльцу, затем припаркуйтесь.\n" + PARK_ZONES,
        "robot": MECANUM,
        "start": {"x": 0, "y": -60, "h": 0},
        "code": AUTO_START,
        "checks": [
            {"type": "hits", "n": 3, "within": 30, "label": "Не меньше 3 попаданий в улей"},
            {"type": "park", "label": "Робот в зоне PARK в конце AUTO"},
            {"type": "finished", "label": "Программа завершилась сама за 30 секунд"},
        ],
    },
    "ftc-match": {
        "title": "Тренировочный матч: 2 минуты",
        "task": "Полная программа TeleOp уже готова. Сыграйте тренировочный матч: забросьте 4 стартовые пыльцы, "
                "соберите еще и забросьте, в конце встаньте в зону PARK.\nЦель - 20 очков и больше. Попадание 3 очка, "
                "парковка 5. " + PARK_ZONES,
        "robot": MECANUM,
        "start": {"x": 0, "y": -60, "h": 0},
        "limit": 120,
        "play": True,
        "code": mech_teleop(MECH_LOOP, "TeleOp Match", "TeleOpMatch"),
        "checks": [
            {"type": "hits", "n": 4, "label": "4 попадания в улей"},
            {"type": "score", "n": 20, "label": "20 очков и больше"},
            {"type": "park", "label": "В конце матча робот в зоне PARK"},
        ],
    },
}

# Сценарии геймпада: [начало, конец, ввод] в секундах после START
# Робот не поворачивается: сдвиг влево к стене, проезд вперед вдоль ряда пыльцы с захватом, назад,
# сдвиг к центру (улей прямо по курсу), заброс, сдвиг в зону PARK.
COLLECT_SCRIPT = [
    [0.0, 1.1, {"left_stick_x": -1}],
    [1.3, 2.65, {"left_stick_y": -1, "right_bumper": True}],
    [2.85, 4.05, {"left_stick_y": 1}],
    [4.2, 5.3, {"left_stick_x": 1}],
    [5.5, 8.5, {"right_trigger": 1}], [6.8, 8.5, {"a": True}],
]


def shifted(script, dt):
    return [[a + dt, b + dt, v] for a, b, v in script]


MATCH_SCRIPT = [[0.0, 3.2, {"right_trigger": 1}], [1.2, 3.2, {"a": True}]] + shifted(COLLECT_SCRIPT, 3.3) + [
    [11.9, 13.0, {"left_stick_x": 1}]]

SOLUTIONS = {
    "ftc-config": {"robot": {**PRESETS["ftc-config"]["robot"], "names": {}}, "code": CONFIG_CODE, "seconds": 3},
    "ftc-first-teleop": {"code": TANK_SOLUTION, "seconds": 8, "script": [
        [0.0, 0.6, {"right_stick_x": -0.3}], [0.8, 1.75, {"left_stick_y": -1}],
        [1.95, 2.55, {"right_stick_x": 0.3}], [2.75, 3.95, {"left_stick_y": -1}],
        [4.15, 4.79, {"right_stick_x": 0.3}], [4.95, 6.2, {"left_stick_y": -1}]]},
    "ftc-builder": {"robot": MECANUM, "code": mec_teleop(MEC_LOOP), "seconds": 0.5},
    "ftc-mecanum": {"code": mec_teleop(MEC_LOOP), "seconds": 5, "script": [
        [0.2, 1.4, {"left_stick_x": -1}], [1.6, 4.4, {"left_stick_x": 1}]]},
    "ftc-mechanisms": {"code": mech_teleop(MECH_LOOP, "TeleOp Механизмы", "TeleOpMechanisms"), "seconds": 9.5,
                       "script": COLLECT_SCRIPT},
    "ftc-encoder": {"code": ENC_SOLUTION, "seconds": 6},
    "ftc-imu": {"code": IMU_SOLUTION, "seconds": 6},
    "ftc-auto": {"code": AUTO_SOLUTION, "seconds": 30},
    "ftc-match": {"code": mech_teleop(MECH_LOOP, "TeleOp Match", "TeleOpMatch"), "seconds": 14, "script": MATCH_SCRIPT},
}


def write() -> list[Path]:
    OUT.mkdir(parents=True, exist_ok=True)
    paths = []
    for name, data in PRESETS.items():
        p = OUT / f"{name}.json"
        p.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        paths.append(p)
    return paths


if __name__ == "__main__":
    if "--solutions" in sys.argv:
        print(json.dumps({"presets": PRESETS, "solutions": SOLUTIONS}, ensure_ascii=False))
    else:
        for p in write():
            print(p.relative_to(OUT.parents[3]))
