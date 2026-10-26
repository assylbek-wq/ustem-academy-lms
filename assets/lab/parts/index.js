// Каталог деталей лаборатории: платы, макетирование, компоненты, модули, механика.
import { BASIC } from "./basic.js";
import { MODULES } from "./modules.js";
import { BOARDS } from "./boards.js";
export { P, MM, el, pinPos, installDefs, DEFS, LED_COLORS, RESISTOR_VALUES, fmtOhm } from "./core.js";

export const PARTS = { ...BOARDS, ...BASIC, ...MODULES };

// Порядок разделов в меню «+ Деталь»
export const GROUPS = ["Платы", "Макетирование", "Пассивные", "Полупроводники", "Индикация", "Дисплеи", "Ввод", "Датчики", "Движение", "Механика", "Питание", "Измерения"];
