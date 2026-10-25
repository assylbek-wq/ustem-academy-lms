// Каталог компонентов CubeSat 1U для конструктора. Массы, размеры и потребление - типичные значения
// распространенных модулей (ориентир для бюджетов, не паспорт конкретного изделия).
// h - высота в стеке плат (мм), idle - постоянное потребление (мВт), mass - граммы.
export const FRAME_STACK = 85; // внутренняя высота под стек плат в каркасе 1U, мм

export const CATEGORIES = [
  { id: "frame", title: "Каркас", one: true, required: true },
  { id: "obc", title: "Бортовой компьютер", one: true, required: true },
  { id: "power", title: "Питание", required: true },
  { id: "radio", title: "Радио", one: true, required: true },
  { id: "antenna", title: "Антенна спутника", one: true, required: true },
  { id: "payload", title: "Полезная нагрузка и датчики" },
  { id: "storage", title: "Накопитель", one: true },
  { id: "station", title: "Наземная станция", one: true, required: true, outside: true },
];

export const PARTS = [
  // ─── Каркас ───
  { id: "frame-print", cat: "frame", name: "Каркас 1U, 3D-печать PETG", mass: 95, size: 100, stack: 82, color: "#e2e8f0",
    note: "Легкий и дешевый. Стенки 2 мм, рельсы по углам." },
  { id: "frame-pcb", cat: "frame", name: "Каркас 1U из стенок-плат", mass: 120, size: 100, stack: 84, color: "#1f7a4d",
    note: "Стенки из стеклотекстолита: на них можно ставить солнечные панели и датчики." },
  { id: "frame-alu", cat: "frame", name: "Каркас 1U, алюминий", mass: 165, size: 100, stack: 85, color: "#94a3b8",
    note: "Прочный, хорошо отводит тепло, но тяжелый." },
  // ─── Бортовой компьютер ───
  { id: "obc-nano", cat: "obc", name: "Arduino Nano (ATmega328P)", mass: 7, h: 10, idle: 100, ram: 2, color: "#0e7490",
    note: "Простой и экономичный, но мало памяти: камеру не потянет." },
  { id: "obc-stm32", cat: "obc", name: "STM32 Blue Pill", mass: 8, h: 10, idle: 120, ram: 20, color: "#1d4ed8",
    note: "Быстрый микроконтроллер, хватает на датчики и радио." },
  { id: "obc-esp32", cat: "obc", name: "ESP32 DevKit", mass: 10, h: 12, idle: 170, ram: 320, camera: true, color: "#111827",
    note: "Хватает памяти для камеры OV2640." },
  { id: "obc-rpi", cat: "obc", name: "Raspberry Pi Zero 2 W", mass: 11, h: 14, idle: 600, ram: 512000, camera: true, storage: true, color: "#be123c",
    note: "Linux и своя microSD для данных, но потребляет много." },
  // ─── Питание ───
  { id: "bat-lipo", cat: "power", name: "Аккумулятор LiPo 1S 1000 мА·ч", mass: 22, h: 8, wh: 3.7, battery: true, color: "#f59e0b",
    note: "3,7 Вт·ч. Легкий, но небольшой запас." },
  { id: "bat-18650", cat: "power", name: "Li-ion 18650, 3000 мА·ч, с держателем", mass: 58, h: 22, wh: 11.1, battery: true, color: "#16a34a",
    note: "11,1 Вт·ч. Хороший запас на полет." },
  { id: "bat-18650x2", cat: "power", name: "2 × Li-ion 18650, с держателем", mass: 115, h: 22, wh: 22.2, battery: true, color: "#15803d",
    note: "22,2 Вт·ч. Большой запас, но тяжело." },
  { id: "eps-bms", cat: "power", name: "Плата питания: защита BMS и DC-DC 5 В", mass: 8, h: 8, idle: 15, bms: true, color: "#7c3aed",
    note: "Защита от короткого замыкания и переразряда. Нужна по правилам безопасности." },
  { id: "solar", cat: "power", name: "Солнечная панель на грань, 0,5 Вт", mass: 15, face: true, solar: 0.5, max: 4, color: "#1e3a8a",
    note: "Ставится на боковую грань, до 4 штук." },
  // ─── Радио ───
  { id: "radio-lora", cat: "radio", name: "LoRa SX1278, 433 МГц", mass: 4, h: 6, idle: 40, freq: 433, maxlen: 255, color: "#0f766e",
    modes: [{ id: "sf7", name: "SF7: 5,5 кбит/с", kbps: 5.47, sens: -123 }, { id: "sf9", name: "SF9: 1,8 кбит/с", kbps: 1.76, sens: -129 },
            { id: "sf12", name: "SF12: 0,3 кбит/с", kbps: 0.29, sens: -137 }],
    note: "Дальняя связь на малой скорости. Чем больше SF, тем дальше, но медленнее." },
  { id: "radio-hc12", cat: "radio", name: "HC-12, 433 МГц", mass: 5, h: 6, idle: 50, freq: 433, maxlen: 60,
    modes: [{ id: "fu3", name: "9,6 кбит/с", kbps: 9.6, sens: -112 }, { id: "fu4", name: "1,2 кбит/с", kbps: 1.2, sens: -117 }], color: "#334155",
    note: "Простой модуль UART. Пакет до 60 байт." },
  { id: "radio-nrf", cat: "radio", name: "nRF24L01+ PA/LNA, 2,4 ГГц", mass: 6, h: 6, idle: 45, freq: 2400, maxlen: 32,
    modes: [{ id: "250k", name: "250 кбит/с", kbps: 250, sens: -104 }, { id: "1m", name: "1 Мбит/с", kbps: 1000, sens: -94 }], color: "#0369a1",
    note: "Быстрый, но на 2,4 ГГц потери больше, а пакет всего 32 байта." },
  // ─── Антенна спутника ───
  { id: "ant-whip433", cat: "antenna", name: "Штырь 1/4 волны 433 МГц (17 см)", mass: 5, gain: 2.1, freq: 433, omni: true, color: "#e5e7eb",
    note: "Может выступать за куб: антеннам это разрешено." },
  { id: "ant-spring433", cat: "antenna", name: "Спиральная антенна 433 МГц", mass: 2, gain: -2, freq: 433, omni: true, color: "#cbd5e1",
    note: "Короткая, помещается внутри, но слабее штыря." },
  { id: "ant-24", cat: "antenna", name: "Антенна 2,4 ГГц, 2 дБи", mass: 4, gain: 2, freq: 2400, omni: true, color: "#cbd5e1", note: "Для nRF24." },
  // ─── Полезная нагрузка ───
  { id: "bme280", cat: "payload", name: "BME280: давление, температура, влажность", mass: 3, h: 3, idle: 2, sensor: "bme", color: "#9333ea",
    note: "По давлению считают высоту." },
  { id: "imu", cat: "payload", name: "MPU-6050: акселерометр и гироскоп", mass: 3, h: 3, idle: 15, sensor: "imu", color: "#db2777",
    note: "Ускорения и вращение спутника на тросе." },
  { id: "gps", cat: "payload", name: "GPS NEO-6M с антенной", mass: 14, h: 8, idle: 140, sensor: "gps", color: "#ea580c",
    note: "Координаты и высота. Первая фиксация около 30 с." },
  { id: "light", cat: "payload", name: "BH1750: освещенность", mass: 2, h: 2, idle: 1, sensor: "light", color: "#ca8a04",
    note: "Освещенность в люксах: видно вращение спутника." },
  { id: "co2", cat: "payload", name: "SCD40: CO2", mass: 5, h: 4, idle: 60, sensor: "co2", color: "#65a30d",
    note: "Концентрация CO2 по высоте." },
  { id: "camera", cat: "payload", name: "Камера OV2640", mass: 6, h: 4, idle: 20, sensor: "camera", shot: 0.8, shotW: 0.45, color: "#525252",
    note: "Снимок около 30 КБ. Нужен ESP32 или Raspberry Pi и накопитель." },
  // ─── Накопитель ───
  { id: "sd", cat: "storage", name: "Модуль microSD", mass: 3, h: 4, idle: 25, color: "#475569",
    note: "Все данные миссии пишутся на борт. Их сравнивают с телеметрией." },
  // ─── Наземная станция ───
  { id: "gs-whip433", cat: "station", name: "Станция 433 МГц, штыревая антенна", gain: 2.1, freq: 433, omni: true, color: "#0f172a",
    note: "Приемник, антенна и ноутбук с программой приема. Вертикальный штырь плохо принимает прямо над собой." },
  { id: "gs-yagi433", cat: "station", name: "Станция 433 МГц, антенна Яги", gain: 9, freq: 433, color: "#0f172a",
    note: "Направленная антенна: +7 дБ к линии. Оператор держит ее на спутник." },
  { id: "gs-24", cat: "station", name: "Станция 2,4 ГГц, панельная антенна", gain: 12, freq: 2400, color: "#0f172a",
    note: "Для nRF24." },
];

export const part = (id) => PARTS.find((p) => p.id === id);
