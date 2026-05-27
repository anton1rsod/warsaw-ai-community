import { expect, test } from "@playwright/test";

test("unauthenticated visit to / renders the public hero landing (ADR-0014)", async ({
  page,
}) => {
  await page.goto("/");
  // ADR-0014: / is public — anonymous users land here, not redirected to /login.
  await expect(page).toHaveURL(/\/$/);
  // h1 carries the brand tagline "Subploters ships in public."
  await expect(
    page.getByRole("heading", { level: 1, name: /subploters/i }),
  ).toBeVisible();
  // CTA links rendered by AnonymousHero
  await expect(
    page.getByRole("link", { name: /sign in with github/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /join telegram/i }),
  ).toBeVisible();
});
