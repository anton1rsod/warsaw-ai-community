/**
 * v0.9 Phase 5.2 — discovery / nav happy path E2E.
 *
 * Anonymous: verify each public surface loads and exposes its page-level h1.
 * Note: /home renders an anonymous feed (YourWeekPane is signed-in-only, so
 * no h1 is present for anonymous visitors). We assert the page loads cleanly
 * and the feed section heading is visible instead.
 *
 * Soft-nav: from /home, click Header nav links and assert the resulting URL
 * and content are correct. Gated routes (/projects, /members) redirect
 * anonymous to /login — we assert that outcome honestly.
 */

import { test, expect } from "@playwright/test";

test.describe("v0.9 discovery — public surfaces load with correct h1", () => {
  // /handbook has two h1s: FormalEntityMasthead + the page heading. Use the
  // named locator so strict-mode doesn't raise a "resolved to 2 elements" error.
  const PUBLIC_WITH_H1: { path: string; h1Name: RegExp | string }[] = [
    { path: "/", h1Name: /./i },                      // AnonymousHero h1 — any text
    { path: "/events", h1Name: /events/i },
    { path: "/meetings", h1Name: /meetings/i },
    { path: "/calendar", h1Name: /calendar/i },
    { path: "/handbook", h1Name: /handbook/i },
    { path: "/login", h1Name: /./i },                 // community name from env
  ];

  for (const { path, h1Name } of PUBLIC_WITH_H1) {
    test(`${path} — h1 is visible`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: "networkidle" });
      expect(response?.status()).toBeLessThan(400);
      await expect(
        page.getByRole("heading", { level: 1, name: h1Name }),
      ).toBeVisible();
    });
  }

  test("/home (anonymous) — page loads and feed section visible", async ({
    page,
  }) => {
    // /home is public per ADR-0012 / proxy.ts PUBLIC_PATHS.
    // Anonymous visitors see the HomeFeed strip without YourWeekPane (which
    // carries the h1). Asserting 200 + the ships-feed section is sufficient
    // to confirm the page rendered correctly.
    const response = await page.goto("/home", { waitUntil: "networkidle" });
    expect(response?.status()).toBeLessThan(400);
    // HomeFeed renders a section with a sr-only h2; assert it exists in the DOM
    // (doesn't need to be visible — it's sr-only by design).
    await expect(page.locator("#ships-feed")).toBeAttached();
  });
});

test.describe("v0.9 discovery — Header soft-nav from /home (anonymous)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/home", { waitUntil: "networkidle" });
  });

  test("nav: Calendar → /calendar h1 visible", async ({ page }) => {
    await page
      .getByRole("navigation")
      .getByRole("link", { name: /calendar/i })
      .click();
    await expect(page).toHaveURL(/\/calendar$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /calendar/i,
    );
  });

  test("nav: Handbook → /handbook h1 visible", async ({ page }) => {
    await page
      .getByRole("navigation")
      .getByRole("link", { name: /handbook/i })
      .click();
    await expect(page).toHaveURL(/\/handbook$/);
    // /handbook has two h1 elements (FormalEntityMasthead + page heading);
    // select by name to avoid strict-mode "resolved to 2 elements" error.
    await expect(
      page.getByRole("heading", { level: 1, name: /handbook/i }),
    ).toBeVisible();
  });

  test("nav: Projects (gated) → anonymous lands on /login", async ({
    page,
  }) => {
    await page
      .getByRole("navigation")
      .getByRole("link", { name: /projects/i })
      .click();
    await expect(page).toHaveURL(/\/login$/);
    // /login renders the community name as h1
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("nav: Members (gated) → anonymous lands on /login", async ({
    page,
  }) => {
    await page
      .getByRole("navigation")
      .getByRole("link", { name: /members/i })
      .click();
    await expect(page).toHaveURL(/\/login$/);
    // /login renders the community name as h1
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
