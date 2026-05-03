import { expect, test } from "@playwright/test";

test("unauthenticated visit to / redirects to /login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Warsaw AI Community" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /sign in with github/i }),
  ).toBeVisible();
});
