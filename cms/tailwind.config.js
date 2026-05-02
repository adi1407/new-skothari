/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#BB1919", dark: "#941313", light: "#FAF0F0" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        "drawer": "cubic-bezier(0.32, 0.72, 0, 1)",
        "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      boxShadow: {
        "mobile-header": "0 1px 0 rgba(15, 23, 42, 0.06), 0 10px 28px -14px rgba(15, 23, 42, 0.14)",
        drawer: "8px 0 40px -8px rgba(0, 0, 0, 0.45)",
        "card-mobile": "0 2px 20px -4px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04)",
        "dash-panel": "0 1px 0 rgba(255,255,255,0.85) inset, 0 18px 48px -22px rgba(15, 23, 42, 0.12)",
      },
    },
  },
  plugins: [],
};
