/**
 * Стиль: Notion (теплые серые, тонкие линии, белые страницы) + бренд USTEM (синий #0085ff, Inter).
 * Палитра slate переопределена теплыми оттенками Notion, поэтому все шаблоны получают их автоматически.
 * Цвета тегов (amber, emerald, rose, brand-100) подобраны под мягкие теги Notion.
 */
module.exports = {
  content: ["./app/templates/**/*.html", "./app/static/js/**/*.js", "./app/**/*.py"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "-apple-system", "Segoe UI", "Helvetica", "Arial", "sans-serif"] },
      colors: {
        slate: {
          50: "#fbfbfa", 100: "#f7f7f5", 200: "#ebebea", 300: "#dfdedc", 400: "#a9a8a4",
          500: "#787774", 600: "#62615d", 700: "#4a4944", 800: "#37352f", 900: "#2b2a26",
        },
        brand: {
          50: "#f0f7ff", 100: "#e6f2ff", 200: "#b9dfff", 300: "#8ccbff", 400: "#47a9ff",
          500: "#1a94ff", 600: "#0085ff", 700: "#006bd1", 800: "#00529c", 900: "#003d75",
        },
        accent: { 500: "#4c9a6a", 600: "#3f8a5b" },
        emerald: { 50: "#f2f7f3", 100: "#edf3ec", 200: "#d4e6d6", 600: "#448361", 700: "#3b7356", 800: "#2f5f46" },
        amber: { 50: "#fdf9ee", 100: "#fbf3db", 200: "#f3e2b0", 600: "#cb912f", 700: "#a8761f", 800: "#8a5f14" },
        rose: { 50: "#fef6f6", 100: "#fdebec", 200: "#f7cfd1", 500: "#d44c47", 600: "#c4413c", 700: "#b33a35", 800: "#93302c" },
        ink: "#37352f",
      },
      borderRadius: { xl: "8px", "2xl": "10px" },
    },
  },
};
