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
      // Production paths must not log to stdout (a leak surface). console.error
      // / console.warn are allowed — used by proxy.ts for cookie/JWT-decode
      // signals so on-call has something to grep.
      "no-console": ["error", { allow: ["error", "warn"] }],
    },
  },
  {
    // CLI scripts run out-of-band (snapshot generation, smoke checks). They
    // are not production paths and routinely print progress to stdout.
    files: ["scripts/**/*.ts"],
    rules: { "no-console": "off" },
  },
];
