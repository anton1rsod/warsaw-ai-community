import { expect, test, type Page } from "@playwright/test";

async function loginAs(page: Page, handle: string): Promise<void> {
  // page.request shares cookies with page (same BrowserContext); the standalone
  // `request` fixture does NOT, so cookies set via request.post() would never
  // reach page.goto(). Always use page.request for E2E session forging.
  const res = await page.request.post("/api/test-auth", { data: { handle } });
  expect(res.ok()).toBe(true);
}

test.describe("members", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "anton1rsod");
  });

  test("directory lists members", async ({ page }) => {
    await page.goto("/members");
    await expect(page.getByRole("heading", { name: "Members" })).toBeVisible();
    expect(await page.locator("li").count()).toBeGreaterThan(0);
  });

  test("clicking a member opens profile with persona panel", async ({ page }) => {
    await page.goto("/members");
    const firstLink = page.locator("li a").first();
    await firstLink.click();
    await expect(page).toHaveURL(/\/members\/[\w-]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /persona/i, level: 3 })).toBeVisible();
  });
});
