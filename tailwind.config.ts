import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        axe: {
          black: "#0A0A0A",
          dark: "#111111",
          charcoal: "#1C1C1C",
          grey: "#3A3A3A",
          muted: "#909090",
          light: "#F5F5F3",
          white: "#FFFFFF",
          accent: "#C8FF00",
          accentDark: "#A8D900",
          amber: "#FF9F0A",
          red: "#FF3B30",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
