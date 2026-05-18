import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          50: "var(--color-accent-50)",
          100: "var(--color-accent-100)",
          500: "var(--color-accent-500)",
          600: "var(--color-accent-600)",
          700: "var(--color-accent-700)",
          900: "var(--color-accent-900)",
        },
      },
      fontFamily: {
        // Loaded via next/font in app/layout.tsx; --font-inter is exposed
        // as a CSS variable for the body chain in globals.css.
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
