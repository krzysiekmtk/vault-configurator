import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark SaaS palette
        bg: {
          DEFAULT: "#0a0a0f",
          soft: "#12121a",
          card: "#16161f",
          hover: "#1d1d28",
        },
        border: {
          DEFAULT: "#262633",
          soft: "#1e1e29",
        },
        brand: {
          DEFAULT: "#7c5cff",
          hover: "#8f72ff",
          soft: "#2a2350",
        },
        accent: "#3dd9b0",
        muted: "#8a8aa0",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
