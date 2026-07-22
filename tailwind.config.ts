import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de The Marvella Club: crema, dorado, navy oscuro.
        ink: {
          DEFAULT: "#1E2530",
          light: "#3A4354",
        },
        paper: {
          DEFAULT: "#F6F1E6",
          card: "#FCFAF3",
        },
        gold: {
          DEFAULT: "#B6935B",
          dark: "#96753F",
          light: "#E4D3AE",
        },
        pine: {
          DEFAULT: "#41603F",
          dark: "#324A31",
        },
        wine: {
          DEFAULT: "#8C3B34",
          dark: "#712E28",
        },
        line: "#E3D9C4",
        // Alias retro-compatible; el código existente referencia brand-*.
        brand: {
          50: "#F6F1E6",
          100: "#E4D3AE",
          500: "#B6935B",
          600: "#B6935B",
          700: "#96753F",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};

export default config;
