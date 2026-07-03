import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Marka paleti — lüks, feminen, sıcak tonlar
        bordeaux: {
          DEFAULT: "#2C1A1A", // ana koyu bordo (metin, header, footer)
          light: "#4A2E2E",
          soft: "#6B4545",
        },
        cream: {
          DEFAULT: "#F5F0EB", // ana zemin
          light: "#FAF7F3",
          dark: "#EDE5DC",
        },
        rosegold: {
          DEFAULT: "#D4AF88", // vurgu rengi (butonlar, çizgiler, hover)
          light: "#E5CBAD",
          dark: "#B8935F",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
      },
      boxShadow: {
        soft: "0 4px 24px rgba(44, 26, 26, 0.06)",
        card: "0 8px 32px rgba(44, 26, 26, 0.10)",
        lifted: "0 16px 48px rgba(44, 26, 26, 0.14)",
      },
      letterSpacing: {
        luxe: "0.18em",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.7)", opacity: "0" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
