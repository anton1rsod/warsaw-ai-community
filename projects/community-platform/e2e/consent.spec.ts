import { expect, test, type Page } from "@playwright/test";

interface LoginOpts {
  consented?: boolean;
}

async function loginAs(
  page: Page,
  handle: string,
  opts: LoginOpts = {},
): Promise<void> {
  // page.request shares cookies with page (same BrowserContext); the
  // standalone `request` fixture does NOT (per execution-plan §9.13).
  // For consent flow we need to opt out of the default consent cookie.
  const data: { handle: string; consented?: boolean } = { handle };
  if (opts.consented !== undefined) data.consented = opts.consented;
  const res = await page.request.post("/api/test-auth", { data });
  expect(res.ok()).toBe(true);
}

async function resetConsentStore(page: Page): Promise<void> {
  const res = await page.request.post("/api/test-reset-consent");
  expect(res.ok()).toBe(true);
}

test.describe.configure({ mode: "serial" });

test.describe("consent flow", () => {
  test.beforeEach(async ({ page }) => {
    await resetConsentStore(page);
  });

  test("first-time roster member is redirected to /consent and sees the modal", async ({
    page,
  }) => {
    await loginAs(page, "anton1rsod", { consented: false });
    await page.goto("/home");
    await expect(page).toHaveURL(/\/consent$/);
    await expect(
      page.getByRole("heading", { name: /opt in/i }),
    ).toBeVisible();
  });

  test("returning member with consent cookie reaches /home directly", async ({
    page,
  }) => {
    await loginAs(page, "anton1rsod", { consented: true });
    await page.goto("/home");
    await expect(page).toHaveURL(/\/home$/);
  });

  test("cancel from /consent signs out and lands on /login", async ({
    page,
  }) => {
    await loginAs(page, "anton1rsod", { consented: false });
    await page.goto("/consent");
    await expect(
      page.getByRole("heading", { name: /opt in/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
