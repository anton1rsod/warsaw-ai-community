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
    // /this-week is gated (not in PUBLIC_PATHS); anonymous users → /login.
    // /home is public per ADR-0014, so we use a definitively gated route here.
    await page.goto("/this-week");
    await expect(page).toHaveURL(/\/login$/);
    // Login page renders the community name as h1 + a "Sign in with GitHub" button.
    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toBeVisible();
  });

  test("non-roster handle redirects to /no-access", async ({ page }) => {
    await loginAs(page, "stranger-not-on-roster");
    // /this-week is gated; non-roster handle → /no-access.
    await page.goto("/this-week");
    await expect(page).toHaveURL(/\/no-access$/);
    await expect(
      page.getByRole("heading", { name: /no platform access/i }),
    ).toBeVisible();
  });

  test("roster member (anton1rsod) reaches /home", async ({ page }) => {
    await loginAs(page, "anton1rsod");
    await page.goto("/home");
    await expect(page).toHaveURL(/\/home$/);
    // /home renders the discovery feed for signed-in members (ADR-0012).
    // The page has no branded h1; assert the main landmark is present
    // and the signed-in header chip shows the handle (proof of auth state).
    await expect(page.getByRole("main")).toBeVisible();
    // Header dropdown shows @{handle} — use first() since button + menu-item both match.
    await expect(page.getByText(/anton1rsod/i).first()).toBeVisible();
  });
});
