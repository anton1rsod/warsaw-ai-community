/**
 * v0.9 Phase 5.4 — RSVP toggle, Thanks, and status post write-path E2E.
 *
 * Auth pattern (same as status.spec.ts / members.spec.ts):
 *   await page.request.post("/api/test-auth", { data: { handle } })
 *   — forges a session cookie in the BrowserContext without real OAuth.
 *   Uses page.request (not standalone request fixture) so the cookie
 *   is shared with subsequent page.goto() calls.
 *
 * E2E mode notes:
 *   • status.ts   → in-memory mock (mockStatusActions) — fully testable.
 *   • rsvp-event.ts → in-memory mock (mockRsvpActions) — fully testable.
 *     /api/event-rsvp-state also forks to mockRsvpActions.getState() so
 *     the hydration round-trip is deterministic and side-effect-free.
 *   • thank-status.ts → in-memory mock (mockThankActions) — fully testable.
 *     /this-week loadViewerProfile forks to mockThankActions.getProfileSha()
 *     so ThankButton receives a non-empty profileSha from the server render.
 */

import { expect, test, type Page } from "@playwright/test";

const EVENT_SLUG = "2026-05-21-meetup-4";

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

async function resetRsvpStore(page: Page): Promise<void> {
  const res = await page.request.post("/api/test-reset-rsvp");
  expect(res.ok()).toBe(true);
}

async function resetThankStore(page: Page): Promise<void> {
  const res = await page.request.post("/api/test-reset-thank");
  expect(res.ok()).toBe(true);
}

// ─── 5.4a: RSVP button toggle (E2E-mode in-memory mock) ───────────────────
//
// rsvp-event.ts and /api/event-rsvp-state both fork to mockRsvpActions when
// NEXT_PUBLIC_E2E_MODE=1. The button hydrates from "not-signed-in" to the
// mock state (initially "none" → Going/Interested visible) via the forked
// /api/event-rsvp-state route.

test.describe("5.4a: RSVP button — authenticated view", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await resetRsvpStore(page);
    await loginAs(page, "anton1rsod");
  });

  test(`/events/${EVENT_SLUG} — RSVP control area is present`, async ({
    page,
  }) => {
    await page.goto(`/events/${EVENT_SLUG}`, { waitUntil: "networkidle" });

    // The event page should load cleanly (no 404 / 500).
    // RSVP control renders either: Going+Interested buttons (signed-in +
    // GitHub App configured) or "Sign in to RSVP" link (fallback). Either
    // way, one of these locators should be present.
    const goingBtn = page.getByRole("button", { name: /going/i });
    const signInCta = page.getByRole("link", { name: /sign in to rsvp/i });

    // Use .or() — passes if either locator matches (covers both code paths).
    await expect(goingBtn.or(signInCta)).toBeVisible({ timeout: 8000 });
  });

  test("RSVP toggle write — Going → ✓ Going → back to Going", async ({
    page,
  }) => {
    // The event page is SSG (force-static), so the server HTML ships
    // initialState="not-signed-in". On mount the client hydrates via
    // /api/event-rsvp-state (forked to mockRsvpActions.getState) and
    // transitions to the "none" state (Going + Interested buttons, both
    // in outline style).
    await page.goto(`/events/${EVENT_SLUG}`, { waitUntil: "networkidle" });

    // Wait for hydration: the "not-signed-in" CTA should disappear and
    // the Going button (outline state) should appear.
    const goingBtn = page.getByRole("button", { name: "Going" }).first();
    await expect(goingBtn).toBeVisible({ timeout: 8000 });

    // Click Going → selected state label is "✓ Going"
    await goingBtn.click();
    await expect(
      page.getByRole("button", { name: "✓ Going" }).first(),
    ).toBeVisible({ timeout: 5000 });

    // Click again to toggle off → back to outline "Going"
    await page.getByRole("button", { name: "✓ Going" }).first().click();
    await expect(
      page.getByRole("button", { name: "Going" }).first(),
    ).toBeVisible({ timeout: 5000 });
  });
});

// ─── 5.4b: Thanks button toggle (E2E-mode in-memory mock) ─────────────────
//
// thank-status.ts forks to mockThankActions when NEXT_PUBLIC_E2E_MODE=1.
// /this-week's loadViewerProfile also forks to mockThankActions.getProfileSha()
// so the ThankButton receives a non-empty profileSha from the server render.
//
// Seeding strategy: log in as "markspas" (Mark Spasonov, the second member in
// the production snapshot) and post a status; then switch to "anton1rsod"
// (Anton) who can thank Mark's post. The giver ≠ recipient invariant holds.

test.describe("5.4b: Thanks button — authenticated view", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await resetStatusStore(page);
    await resetThankStore(page);
    await loginAs(page, "anton1rsod");
  });

  test("/this-week — page loads for signed-in user", async ({ page }) => {
    await page.goto("/this-week", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /this week/i,
    );
  });

  test("Thanks write — click + Thanks → ♥ Thanked", async ({ page }) => {
    // Step 1: seed a status from Mark (the second member) so Anton can thank it.
    // Log in as markspas, post a status, then switch to anton1rsod.
    await loginAs(page, "markspas");
    await page.goto("/this-week");
    await page.getByLabel(/shipping log/i).fill(
      "Mark's status for Thanks E2E test.",
    );
    await page.getByRole("button", { name: /post/i }).click();
    await expect(page.getByRole("status")).toContainText(/posted/i);

    // Step 2: switch to Anton (the viewer who will thank Mark's post).
    await loginAs(page, "anton1rsod");
    await page.goto("/this-week", { waitUntil: "networkidle" });

    // The "+ Thanks" button should be visible for Mark's status card.
    const thankBtn = page.getByRole("button", { name: "+ Thanks" }).first();
    await expect(thankBtn).toBeVisible({ timeout: 8000 });

    // Click "+ Thanks" → post-click state is "♥ Thanked"
    await thankBtn.click();
    await expect(
      page.getByRole("button", { name: "♥ Thanked" }).first(),
    ).toBeVisible({ timeout: 5000 });
  });
});

// ─── 5.4c: Status post — fully E2E-testable via in-memory mock ────────────
//
// status.ts routes through isE2EMode() → mockStatusActions when
// NEXT_PUBLIC_E2E_MODE=1 (set by playwright.config.ts webServer). The in-
// memory store persists across the same dev-server process, so reset before
// each test.

test.describe("5.4c: Status post — E2E mode in-memory mock", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(async ({ page }) => {
    await resetStatusStore(page);
    await loginAs(page, "anton1rsod");
  });

  test("post a status update and see it appear", async ({ page }) => {
    await page.goto("/this-week");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /this week/i,
    );
    await page.getByLabel(/shipping log/i).fill(
      "v0.9 Phase 5 E2E backfill.",
    );
    await page.getByRole("button", { name: /post/i }).click();
    await expect(page.getByRole("status")).toContainText(/posted/i);
  });
});
