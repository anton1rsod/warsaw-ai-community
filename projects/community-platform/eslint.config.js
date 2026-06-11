import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "playwright-report/**", "tests/fixtures/**"],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": "error",
      // Production paths must not log to stdout via stray console.log/debug
      // (a leak surface). console.info / console.warn / console.error are
      // allowed — the lib/log wrapper routes intentional, contract-bound
      // signals through them (info = completed actions, warn = problems,
      // error = failures); proxy.ts also uses warn/error for JWT-decode signals.
      "no-console": ["error", { allow: ["error", "warn", "info"] }],
    },
  },
  {
    // CLI scripts run out-of-band (snapshot generation, smoke checks). They
    // are not production paths and routinely print progress to stdout.
    files: ["scripts/**/*.ts"],
    rules: { "no-console": "off" },
  },
];
