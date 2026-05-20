import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  test: {
    environmentMatchGlobs: [
      ["tests/unit/**/*.test.tsx", "jsdom"],
      ["tests/integration/**/*.test.tsx", "jsdom"],
    ],
    environment: "node",
    server: { deps: { inline: ["next-auth", "@auth/core"] } },
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e", "tests/fixtures"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "lib/**/*.ts",
        "app/actions/**/*.ts",
        "app/components/**/*.tsx",
        "app/api/preview-markdown/route.ts",
        "app/api/event-rsvp-state/route.ts",
        "scripts/**/*.ts",
        "proxy.ts",
      ],
      exclude: [
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "app/api/test-auth/**",
        // E2E-only mock store; exercised by Playwright, not Vitest.
        "app/actions/_test-status-store.ts",
      ],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
    setupFiles: ["./tests/setup.ts"],
  },
});
