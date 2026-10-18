/** Палитра бренда USTEM - та же, что в USTEM Connect. */
module.exports = {
  content: ["./app/templates/**/*.html", "./app/static/js/**/*.js", "./app/**/*.py"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      colors: {
        brand: {
          50: "#f0f7ff", 100: "#e1efff", 200: "#b9dfff", 300: "#8ccbff", 400: "#47a9ff",
          500: "#1a94ff", 600: "#0085ff", 700: "#0066c3", 800: "#00529c", 900: "#003d75",
        },
        accent: { 500: "#10b981", 600: "#059669" },
        ink: "#11181c",
      },
    },
  },
};
