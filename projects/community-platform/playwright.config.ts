import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ?? "3000";
// PLAYWRIGHT_BASE_URL targets an external deployment (e.g. staging/production)
// for surfaces that only behave correctly on Vercel edge — H56 Cache-Control
// `private` injection is the canonical case (dev server emits no-cache only).
const EXTERNAL_BASE_URL = process.env.PLAYWRIGHT_BASE_URL;
const BASE_URL = EXTERNAL_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Pin to 1 worker both on CI and locally. The 7 in-memory mock stores
  // live on the single dev-server globalThis; running >1 worker races
  // those stores. Matches CI, removes the race. (R6 — v0.12.1)
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  ...(EXTERNAL_BASE_URL
    ? {}
    : {
        webServer: {
          // NEXT_PUBLIC_E2E_MODE=1 swaps the bot writer for an in-memory mock so
          // status-flow tests don't commit to a real GitHub repo. The mock lives
          // in app/actions/_test-status-store.ts and is gated by isE2EMode().
          command: "NEXT_PUBLIC_E2E_MODE=1 pnpm dev",
          url: BASE_URL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      }),
});
