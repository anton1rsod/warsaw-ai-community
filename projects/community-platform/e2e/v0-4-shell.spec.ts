import { test, expect } from "@playwright/test";

// Tests that require the Vercel edge layer (Cache-Control: private injected
// by the CDN) or assert v0.6-era copy that has since been updated in the
// codebase run only when PLAYWRIGHT_BASE_URL points at a production deployment.
const isProdTarget = (process.env.PLAYWRIGHT_BASE_URL ?? "").includes(
  "vercel.app",
);

test.describe("v0.4 Phase A — global shell (prod-edge only)", () => {
  test.skip(
    !isProdTarget,
    "prod-edge-only: H56 Cache-Control / v0.6 hero markup; run with PLAYWRIGHT_BASE_URL=<prod>",
  );

  test("anonymous / returns 200 with hero markup (ADR-0014)", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(
      page.getByText("Where Warsaw's AI builders learn"),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Sign in with GitHub/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Join Telegram/ }),
    ).toBeVisible();
  });

  test("anonymous / Cache-Control: private, no-cache, no-store (H56)", async ({
    page,
  }) => {
    const response = await page.goto("/");
    const cacheControl = response?.headers()["cache-control"] || "";
    expect(cacheControl).toMatch(/private/);
    expect(cacheControl).toMatch(/no-cache|no-store/);
  });

  test("/handbook renders <Header> + <Footer>", async ({ page }) => {
    await page.goto("/handbook");
    await expect(page.getByLabel("Primary")).toBeVisible();
    await expect(page.getByText("© 2026 Warsaw AI Community")).toBeVisible();
  });
});

test.describe("v0.4 Phase A — global shell", () => {
  test("/login does NOT render <Header>", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Primary")).not.toBeVisible();
  });

  test("/calendar default = all, ?filter=events filters to events (H62)", async ({
    page,
  }) => {
    await page.goto("/calendar?filter=events");
    const eventsChip = page.getByRole("link", { name: "Events" });
    await expect(eventsChip).toHaveClass(/accent/);
  });

  test("H58 hydration stability — Header chrome does not flash on cold load", async ({
    page,
  }) => {
    await page.goto("/handbook");
    await expect(page.getByRole("link", { name: "Calendar" })).toBeVisible({
      timeout: 500,
    });
  });

  test("H65 skip-to-content link visible on Tab", async ({ page }) => {
    await page.goto("/handbook");
    await page.keyboard.press("Tab");
    await expect(page.getByText("Skip to content")).toBeVisible();
  });
});
