import { expect, test, type Page } from "@playwright/test";

async function loginAs(page: Page, handle: string): Promise<void> {
  // page.request shares cookies with page (same BrowserContext); the standalone
  // `request` fixture does NOT, so cookies set via request.post() would never
  // reach page.goto(). Always use page.request for E2E session forging.
  const res = await page.request.post("/api/test-auth", { data: { handle } });
  expect(res.ok()).toBe(true);
}

test.describe("archives", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "anton1rsod");
  });

  test("/projects lists projects", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
    expect(await page.locator("li").count()).toBeGreaterThan(0);
  });

  test("/decisions lists ADRs and opens one", async ({ page }) => {
    await page.goto("/decisions");
    await expect(page.getByRole("heading", { name: "Decisions" })).toBeVisible();
    const first = page.locator("li a").first();
    await first.click();
    await expect(page).toHaveURL(/\/decisions\/\d{4}-/);
    await expect(page.locator("article")).toBeVisible();
  });

  test("/meetings shows the page (may be empty)", async ({ page }) => {
    await page.goto("/meetings");
    await expect(page.getByRole("heading", { name: "Meetings" })).toBeVisible();
  });
});
