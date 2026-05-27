import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "selector",
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
        // v0.6 additions — see app/globals.css for the underlying CSS vars.
        cream: "var(--color-cream)",
        "cream-deep": "var(--color-cream-deep)",
        ink: "var(--color-ink)",
        dust: "var(--color-dust)",
        paper: "var(--color-paper)",
        alert: "var(--color-alert)",
      },
      fontFamily: {
        // Loaded via next/font in app/layout.tsx; --font-* vars are exposed
        // for chained fallback stacks in globals.css.
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        // v0.8 display = Geist (brand.md §2 typography realignment; v0.8 §4.2).
        // v0.7's separate `geist` token retired — font-display is the unified token.
        display: ["var(--font-geist)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        voice: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
