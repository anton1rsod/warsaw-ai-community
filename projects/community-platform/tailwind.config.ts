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
        // v0.6 display/body/voice families (Fraunces / Inter / JetBrains_Mono).
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        voice: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
