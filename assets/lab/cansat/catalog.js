// Каталог CanSat и ракеты-носителя для WSO CanSat (регламент, глава 12). Массы, размеры и потребление -
// типичные значения распространенных модулей (ориентир для расчетов, не паспорт конкретного изделия).
// h - высота в стеке внутри банки (мм), idle - потребление (мВт), mass - граммы.

export const CAN = { d: 66, h: 115, stack: 100, maxMass: 300 }; // форм-фактор банки 330 мл, масса по 12.5.1

export const CATEGORIES = [
  { id: "body", title: "Корпус банки", one: true, required: true },
  { id: "obc", title: "Бортовой компьютер", one: true, required: true },
  { id: "power", title: "Питание", required: true },
  { id: "sensor", title: "Датчики" },
  { id: "storage", title: "Накопитель", one: true },
  { id: "radio", title: "Радио", one: true },
  { id: "antenna", title: "Антенна", one: true },
  { id: "station", title: "Наземная станция", one: true, outside: true },
];

export const PARTS = [
  // ─── Корпус ───
  { id: "body-pla", cat: "body", name: "Корпус PLA, 3D-печать", mass: 34, color: "#e2e8f0",
    note: "Стенка 1,6 мм, крышки на винтах. Самый частый вариант." },
  { id: "body-petg", cat: "body", name: "Корпус PETG, 3D-печать", mass: 38, color: "#cbd5e1",
    note: "Прочнее PLA на удар при посадке, чуть тяжелее." },
  { id: "body-frame", cat: "body", name: "Каркас: стойки и платы-этажи", mass: 22, color: "#1f7a4d",
    note: "Легкий, но открытый: электроника без защиты при жесткой посадке." },
  // ─── Бортовой компьютер ───
  { id: "obc-nano", cat: "obc", name: "Arduino Nano", mass: 7, h: 9, idle: 100, color: "#0e7490",
    note: "Простой и надежный, 2 КБ памяти: без камеры." },
  { id: "obc-pico", cat: "obc", name: "Raspberry Pi Pico", mass: 4, h: 6, idle: 90, color: "#15803d",
    note: "Легкий и быстрый, MicroPython из коробки." },
  { id: "obc-esp32", cat: "obc", name: "ESP32 DevKit", mass: 10, h: 10, idle: 160, color: "#111827",
    note: "Быстрый, Wi-Fi для настройки на земле." },
  { id: "obc-esp32cam", cat: "obc", name: "ESP32-CAM: камера и microSD", mass: 10, h: 12, idle: 240, camera: true, storage: true,
    sensors: ["camera"], shot: 0.6, shotW: 0.5, videoW: 0.55, color: "#7f1d1d",
    note: "Камера OV2640 и слот microSD на плате: видео полета за дополнительные баллы." },
  // ─── Питание ───
  { id: "bat-lipo400", cat: "power", name: "LiPo 1S 400 мА·ч", mass: 10, h: 6, wh: 1.48, rint: 0.25, battery: true, color: "#f59e0b",
    note: "1,5 Вт·ч. Плоский и легкий, хватает на подготовку и полет." },
  { id: "bat-lipo1000", cat: "power", name: "LiPo 1S 1000 мА·ч", mass: 22, h: 8, wh: 3.7, rint: 0.15, battery: true, color: "#d97706",
    note: "3,7 Вт·ч. С запасом на долгое ожидание старта." },
  { id: "bat-18650", cat: "power", name: "Li-ion 18650 с держателем", mass: 54, h: 68, wh: 11.1, rint: 0.06, battery: true, color: "#16a34a",
    note: "Банка 65 мм стоит вертикально и занимает почти весь стек." },
  { id: "eps-tp4056", cat: "power", name: "Плата заряда и защиты TP4056", mass: 3, h: 4, idle: 5, bms: true, color: "#7c3aed",
    note: "Защита от переразряда и короткого замыкания, зарядка от USB." },
  // ─── Датчики ───
  { id: "bmp280", cat: "sensor", name: "BMP280: давление и температура", mass: 1, h: 3, idle: 2, sensors: ["bme"], color: "#9333ea",
    note: "По давлению считают высоту и ловят апогей." },
  { id: "bme280", cat: "sensor", name: "BME280: давление, температура, влажность", mass: 1.5, h: 3, idle: 2, sensors: ["bme", "bme_h"], color: "#a855f7",
    note: "То же, что BMP280, плюс влажность." },
  { id: "imu", cat: "sensor", name: "MPU-6050: акселерометр и гироскоп", mass: 2, h: 3, idle: 15, sensors: ["imu"], color: "#db2777",
    note: "Перегрузка на старте, раскрытие парашюта, вращение. Диапазон по умолчанию 2 g." },
  { id: "gps", cat: "sensor", name: "GPS NEO-6M с антенной", mass: 12, h: 8, idle: 140, sensors: ["gps"], color: "#ea580c",
    note: "Координаты раз в секунду: по ним находят CanSat в поле." },
  { id: "ds18b20", cat: "sensor", name: "DS18B20 на выносе", mass: 3, h: 1, idle: 3, sensors: ["therm"], color: "#0891b2",
    note: "Наружная температура без нагрева от электроники." },
  { id: "bh1750", cat: "sensor", name: "BH1750: освещенность", mass: 1, h: 2, idle: 1, sensors: ["light"], color: "#ca8a04",
    note: "По свету видно вращение CanSat под парашютом." },
  // ─── Накопитель ───
  { id: "sd", cat: "storage", name: "Модуль microSD", mass: 3, h: 4, idle: 25, color: "#475569",
    note: "Запись на борт. Вместе с радио дает полные баллы за хранение данных." },
  // ─── Радио ───
  { id: "radio-lora", cat: "radio", name: "LoRa Ra-02 SX1278, 433 МГц", mass: 3, h: 4, idle: 40, freq: 433, maxlen: 255, color: "#0f766e",
    modes: [{ id: "sf7", name: "SF7: 5,5 кбит/с", sf: 7, kbps: 5.47, sens: -123 }, { id: "sf9", name: "SF9: 1,8 кбит/с", sf: 9, kbps: 1.76, sens: -129 }],
    note: "Дальняя связь. На SF9 пакет летит в 3 раза дольше: частота телеметрии падает." },
  { id: "radio-apc220", cat: "radio", name: "APC220, 433 МГц", mass: 6, h: 6, idle: 60, freq: 433, maxlen: 120, color: "#334155",
    modes: [{ id: "9600", name: "9,6 кбит/с", kbps: 9.6, sens: -113 }, { id: "19200", name: "19,2 кбит/с", kbps: 19.2, sens: -107 }],
    note: "Классика CanSat: прозрачный UART, пакет до 120 байт." },
  { id: "radio-nrf", cat: "radio", name: "nRF24L01+ PA/LNA, 2,4 ГГц", mass: 6, h: 5, idle: 45, freq: 2400, maxlen: 32, color: "#0369a1",
    modes: [{ id: "250k", name: "250 кбит/с", kbps: 250, sens: -104 }, { id: "1m", name: "1 Мбит/с", kbps: 1000, sens: -94 }],
    note: "Очень быстрый, но пакет всего 32 байта, а 2,4 ГГц хуже проходит сквозь корпус." },
  // ─── Антенна ───
  { id: "ant-spring433", cat: "antenna", name: "Спиральная 433 МГц внутри банки", mass: 1, gain: -3, freq: 433, omni: true, color: "#cbd5e1",
    note: "Ничего не торчит, но слабее." },
  { id: "ant-whip433", cat: "antenna", name: "Гибкий штырь 1/4 волны 433 МГц", mass: 3, gain: 2.1, freq: 433, omni: true, color: "#e5e7eb",
    note: "17 см провода сверху банки, складывается в отсеке ракеты." },
  { id: "ant-24", cat: "antenna", name: "Антенна 2,4 ГГц, 2 дБи", mass: 4, gain: 2, freq: 2400, omni: true, color: "#cbd5e1", note: "Для nRF24." },
  // ─── Наземная станция ───
  { id: "gs-whip433", cat: "station", name: "Станция 433 МГц, штырь", gain: 2.1, freq: 433, omni: true, color: "#0f172a",
    note: "Приемник у ноутбука на столе команды." },
  { id: "gs-yagi433", cat: "station", name: "Станция 433 МГц, ручная Яги", gain: 9, freq: 433, color: "#0f172a",
    note: "Оператор ведет антенну за ракетой и парашютом: +7 дБ." },
  { id: "gs-24", cat: "station", name: "Станция 2,4 ГГц, панель", gain: 12, freq: 2400, color: "#0f172a", note: "Для nRF24." },
];
export const part = (id) => PARTS.find((p) => p.id === id);

// ─── Ракета-носитель (12.4) ───
// Стандартный двигатель РД1-100-7М (Real Rockets): суммарный импульс 92-100 Н·с, средняя тяга 50 Н, максимальная 120 Н,
// работа 2 с, замедлитель 7 с до вышибного заряда, масса 180 г, диаметр 29 мм, длина 220 мм.
// Масса топлива в паспорте не указана: принята 84 г (оценка по импульсу).
export const MOTOR = { name: "РД1-100-7М", mass: 180, prop: 84, len: 220, d: 29, burn: 2.0, delay: 7, impulse: 96,
  // таблица тяги [с, Н]: пик на старте, затем ровный участок
  curve: [[0, 0], [0.04, 120], [0.12, 92], [0.25, 52], [0.5, 47], [1.0, 46], [1.6, 45], [1.85, 30], [2.0, 0]] };

export const MATERIALS = {
  paper: { name: "Картон, крафт-бумага", wall: 1.2, rho: 700, rf: 2, note: "Дешево и легко, радио проходит." },
  pla: { name: "PLA, 3D-печать", wall: 1.6, rho: 1240, fill: 0.85, rf: 3, note: "Точная форма, тяжелее картона." },
  glass: { name: "Стеклоткань", wall: 0.8, rho: 1850, rf: 3, note: "Прочно и тонко, радио проходит." },
  carbon: { name: "Углеткань (карбон)", wall: 0.5, rho: 1550, rf: 35, note: "Легко и прочно, но экранирует радио и GPS." },
};
export const FIN_MATERIALS = {
  balsa: { name: "Бальза 3 мм", t: 3, rho: 160 },
  ply: { name: "Фанера 3 мм", t: 3, rho: 650 },
  pla: { name: "PLA 3 мм, заполнение 40%", t: 3, rho: 600 },
  eps: { name: "Пенопласт 5 мм", t: 5, rho: 35 },
};
export const NOSES = {
  cone: { name: "Конус", cp: 0.666, cd: 0.06, vol: 0.33 },
  ogive: { name: "Оживало (оживальный)", cp: 0.466, cd: 0.03, vol: 0.55 },
  parabolic: { name: "Парабола", cp: 0.5, cd: 0.02, vol: 0.5 },
};
export const DIAMETERS = [50, 66, 75, 80, 90, 100];

export const DEFAULT_ROCKET = { d: 75, len: 100, material: "paper", nose: "ogive", noseK: 3, fins: 4, finMat: "balsa",
  root: 110, tip: 50, span: 70, sweep: 50, chute: 60, rail: 3 };
