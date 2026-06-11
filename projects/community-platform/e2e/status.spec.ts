import { expect, test, type Page } from "@playwright/test";

async function loginAs(page: Page, handle: string): Promise<void> {
  // page.request shares cookies with page (same BrowserContext); the
  // standalone `request` fixture does NOT (per execution-plan §9.13).
  // Always use page.request for E2E session forging.
  const res = await page.request.post("/api/test-auth", { data: { handle } });
  expect(res.ok()).toBe(true);
}

async function resetStatusStore(page: Page): Promise<void> {
  const res = await page.request.post("/api/test-reset-status");
  expect(res.ok()).toBe(true);
}

test.describe.configure({ mode: "serial" });

test.describe("status flow", () => {
  test.beforeEach(async ({ page }) => {
    await resetStatusStore(page);
    await loginAs(page, "anton1rsod");
  });

  test("post a status update", async ({ page }) => {
    await page.goto("/this-week");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /this week/i,
    );
    await page.getByLabel(/shipping log/i).fill(
      "Building the platform.",
    );
    await page.getByRole("button", { name: /post/i }).click();
    await expect(page.getByRole("status")).toContainText(/posted/i);
  });

  test("edit posted status", async ({ page }) => {
    await page.goto("/this-week");
    await page.getByLabel(/shipping log/i).fill("Initial draft.");
    await page.getByRole("button", { name: /post/i }).click();
    await expect(page.getByRole("status")).toContainText(/posted/i);

    // After post, reload so the page renders with current = posted content;
    // the "Update" button replaces "Post". On edit the StatusEditor defaults
    // to Rich mode (current set → "What are you working on"); a NEW post
    // defaults to Quick ("Shipping log") since v0.10 — hence the two
    // different field labels in this test.
    await page.reload();
    await expect(page.getByRole("button", { name: /update/i })).toBeVisible();
    await page.getByLabel(/what are you working on/i).fill("Updated content.");
    await page.getByRole("button", { name: /update/i }).click();
    await expect(page.getByRole("status")).toContainText(/updated/i);
  });

  test("delete posted status", async ({ page }) => {
    await page.goto("/this-week");
    await page.getByLabel(/shipping log/i).fill("Will be deleted.");
    await page.getByRole("button", { name: /post/i }).click();
    await expect(page.getByRole("status")).toContainText(/posted/i);

    await page.reload();
    await expect(page.getByRole("button", { name: /delete/i })).toBeVisible();
    await page.getByRole("button", { name: /delete/i }).click();
    await expect(page.getByRole("status")).toContainText(/deleted/i);
  });
});
