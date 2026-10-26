// Описание роботов Unitree для симулятора: порядок моторов как в unitree_sdk2, усиления ПД из примеров Unitree,
// стартовые позы, правила падения. Модели (MJCF) - MuJoCo Menagerie, лицензия BSD-3-Clause, Unitree Robotics.

// Go2: в unitree_sdk2 моторы идут FR, FL, RR, RL (в модели MuJoCo - FL, FR, RL, RR)
const GO2_LEGS = ["FR", "FL", "RR", "RL"];
const GO2_PARTS = ["hip", "thigh", "calf"];

export const ROBOTS = {
  go2: {
    id: "go2",
    title: "Unitree Go2",
    pack: "go2/go2.pack",
    model: "go2.xml",
    base: "base",
    imu: "imu",
    motors: GO2_LEGS.flatMap((l) => GO2_PARTS.map((p) => `${l}_${p}`)), // имена приводов в модели
    labels: GO2_LEGS.flatMap((l) => GO2_PARTS.map((p, j) => `${l}_${j}`)), // FR_0 ... RL_2, как в примерах Unitree
    feet: ["FR", "FL", "RR", "RL"], // геометрии стоп (foot_force в том же порядке)
    // поза «лежа» и «стоя» из примера unitree_sdk2 go2_stand_example
    poses: {
      lie: [0, 1.36, -2.65, 0, 1.36, -2.65, -0.2, 1.36, -2.65, 0.2, 1.36, -2.65],
      stand: [0, 0.67, -1.3, 0, 0.67, -1.3, 0, 0.67, -1.3, 0, 0.67, -1.3],
      home: [0, 0.9, -1.8, 0, 0.9, -1.8, 0, 0.9, -1.8, 0, 0.9, -1.8],
    },
    startZ: { lie: 0.11, stand: 0.33, home: 0.28 },
    kp: 60, kd: 5,
    fallTilt: 1.2, // рад: корпус перевернулся
    fallZ: 0.0,
    sport: true,
    camera: { dist: 1.6, elev: -20, azim: 140, lookZ: 0.15 },
  },
  g1: {
    id: "g1",
    title: "Unitree G1",
    pack: "g1/g1.pack",
    model: "g1.xml",
    base: "pelvis",
    imu: "imu_in_pelvis",
    motors: [
      "left_hip_pitch_joint", "left_hip_roll_joint", "left_hip_yaw_joint", "left_knee_joint", "left_ankle_pitch_joint", "left_ankle_roll_joint",
      "right_hip_pitch_joint", "right_hip_roll_joint", "right_hip_yaw_joint", "right_knee_joint", "right_ankle_pitch_joint", "right_ankle_roll_joint",
      "waist_yaw_joint", "waist_roll_joint", "waist_pitch_joint",
      "left_shoulder_pitch_joint", "left_shoulder_roll_joint", "left_shoulder_yaw_joint", "left_elbow_joint",
      "left_wrist_roll_joint", "left_wrist_pitch_joint", "left_wrist_yaw_joint",
      "right_shoulder_pitch_joint", "right_shoulder_roll_joint", "right_shoulder_yaw_joint", "right_elbow_joint",
      "right_wrist_roll_joint", "right_wrist_pitch_joint", "right_wrist_yaw_joint",
    ],
    // имена индексов как в G1JointIndex из примеров unitree_sdk2
    labels: [
      "LeftHipPitch", "LeftHipRoll", "LeftHipYaw", "LeftKnee", "LeftAnklePitch", "LeftAnkleRoll",
      "RightHipPitch", "RightHipRoll", "RightHipYaw", "RightKnee", "RightAnklePitch", "RightAnkleRoll",
      "WaistYaw", "WaistRoll", "WaistPitch",
      "LeftShoulderPitch", "LeftShoulderRoll", "LeftShoulderYaw", "LeftElbow", "LeftWristRoll", "LeftWristPitch", "LeftWristYaw",
      "RightShoulderPitch", "RightShoulderRoll", "RightShoulderYaw", "RightElbow", "RightWristRoll", "RightWristPitch", "RightWristYaw",
    ],
    feet: ["left_ankle_roll_link", "right_ankle_roll_link"], // тела стоп
    poses: {
      stand: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.2, 0.2, 0, 1.28, 0, 0, 0, 0.2, -0.2, 0, 1.28, 0, 0, 0],
      zero: new Array(29).fill(0),
    },
    startZ: { stand: 0.79, zero: 0.79 },
    // усиления из примера g1_low_level_example (unitree_sdk2)
    kp: [60, 60, 60, 100, 40, 40, 60, 60, 60, 100, 40, 40, 60, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40],
    kd: [1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    fallTilt: 0.9,
    fallZ: 0.45,
    sport: false,
    camera: { dist: 2.6, elev: -12, azim: 150, lookZ: 0.7 },
  },
};

export const quatToRpy = (w, x, y, z) => [
  Math.atan2(2 * (w * x + y * z), 1 - 2 * (x * x + y * y)),
  Math.asin(Math.max(-1, Math.min(1, 2 * (w * y - z * x)))),
  Math.atan2(2 * (w * z + x * y), 1 - 2 * (y * y + z * z)),
];
