/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#E6F9EE",
          100: "#CEF3DE",
          200: "#9DE7BD",
          300: "#6CDB9C",
          400: "#3BCF7B",
          500: "#06C755", // LDS Primary Green
          600: "#05B34C",
          700: "#049F43",
          800: "#038B3B",
          900: "#027732",
        },
        gray: {
          50: "#F8F8F8",
          100: "#F0F0F0",
          200: "#E5E5E5",
          300: "#D1D1D1",
          400: "#A1A1A1",
          500: "#6B6B6B",
          600: "#424242",
          700: "#262626",
          800: "#1A1A1A",
          900: "#111111",
        },
        warm: {
          50: "#FFF9F5",
          100: "#FFF1E7",
          200: "#FED7BD",
          300: "#FDB38A",
          400: "#FB8852",
          500: "#F97316",
        },
        background: "#FFFFFF",
        surface: "#FFFFFF",
        "text-main": "#111111", // LDS Black
        "text-sub": "#6B6B6B",
        "text-muted": "#A1A1A1",
      },
      borderRadius: {
        'sm': '4px',    // LDS Small (Buttons, Inputs)
        'md': '8px',    // LDS Medium
        'lg': '12px',   // LDS Large (Cards)
        'xl': '16px',
        '2xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'lds': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'sm': '0 2px 4px rgba(0, 0, 0, 0.02)',
      },
      fontFamily: {
        sans: ["SUIT", "Pretendard", "sans-serif"],
      },
    },
  },
  plugins: [],
}
