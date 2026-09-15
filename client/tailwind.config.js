/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#172554",
        secondary: "#312E81",
        accent: "#D4A72C",
        canvas: "#F8F7F2",
        ink: "#172033",
        muted: "#64748B",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(23, 37, 84, 0.18)",
      },
    },
  },
  plugins: [],
};
