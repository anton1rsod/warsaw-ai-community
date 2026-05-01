import { expect, test, type Page } from "@playwright/test";

async function loginAs(page: Page, handle: string): Promise<void> {
  // page.request shares cookies with page (same BrowserContext); the standalone
  // `request` fixture does NOT, so cookies set via request.post() would never
  // reach page.goto(). Always use page.request for E2E session forging.
  const res = await page.request.post("/api/test-auth", { data: { handle } });
  expect(res.ok()).toBe(true);
}

test.describe("auth flow", () => {
  test("unauthenticated visit to a gated path redirects to /login", async ({
    page,
  }) => {
    await page.goto("/home");
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Warsaw AI Community" }),
    ).toBeVisible();
  });

  test("non-roster handle redirects to /no-access", async ({ page }) => {
    await loginAs(page, "stranger-not-on-roster");
    await page.goto("/home");
    await expect(page).toHaveURL(/\/no-access$/);
    await expect(
      page.getByRole("heading", { name: /no platform access/i }),
    ).toBeVisible();
  });

  test("roster member (anton1rsod) reaches /home", async ({ page }) => {
    await loginAs(page, "anton1rsod");
    await page.goto("/home");
    await expect(page).toHaveURL(/\/home$/);
    await expect(
      page.getByRole("heading", { name: "Warsaw AI Community" }),
    ).toBeVisible();
    // Role label rendered for the founder (admin since anton1rsod is in admins.md)
    await expect(page.getByText(/role:/i)).toBeVisible();
    await expect(page.getByText(/admin/i)).toBeVisible();
  });
});
