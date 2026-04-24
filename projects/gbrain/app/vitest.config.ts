import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      all: true,
      reporter: ["text", "html", "lcov"],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/types.ts"]
    }
  },
  resolve: { alias: { "@": new URL("./src/", import.meta.url).pathname } }
});
