/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#F0F7FF",
          100: "#E0EFFF",
          200: "#BADAFF",
          300: "#7EB6FF",
          400: "#4E91FF",
          500: "#3182F6", // Primary
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
        },
        warm: {
          50: "#FFF9F5",
          100: "#FFF1E7",
          200: "#FED7BD",
          300: "#FDB38A",
          400: "#FB8852",
          500: "#F97316",
        },
        soft: {
          blue: "#F5F9FF",
          pink: "#FFF5F8",
          green: "#F5FFF9",
          yellow: "#FFFDF5",
          purple: "#F9F5FF",
        },
        background: "#FAFAFB",
        surface: "#FFFFFF",
        "text-main": "#1A1D23",
        "text-sub": "#6B7280",
        "text-muted": "#9CA3AF",
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(0, 0, 0, 0.04)',
        'premium': '0 20px 50px rgba(0, 0, 0, 0.03), 0 4px 12px rgba(0, 0, 0, 0.02)',
      },
      fontFamily: {
        sans: ["SUIT", "Pretendard", "sans-serif"],
      },
    },
  },
  plugins: [],
}
