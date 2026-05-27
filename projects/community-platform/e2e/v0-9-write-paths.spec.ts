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
 *   • status.ts HAS an in-memory E2E mock → postStatus is fully testable.
 *   • rsvp-event.ts calls the real GitHub App (no E2E mock). The RSVP button
 *     renders for signed-in users (Going / Interested buttons visible) and
 *     the hydration fetch to /api/event-rsvp-state also calls the real GitHub App.
 *     We assert the button UI is present (what can be observed), and skip the
 *     toggle-write assertion that would trigger a real git commit.
 *   • thank-status.ts also calls the real GitHub App — Thanks write is skipped.
 *
 * Manual smoke (for Anton) when running against production or a fully-keyed
 * dev server:
 *   1. RSVP: visit /events/2026-05-21-meetup-4 signed in → click "Going" →
 *      expect button fills to "✓ Going"; click again → reverts to outline.
 *   2. Thanks: visit /this-week signed in, find a status post by another member,
 *      click "+ Thanks" → expect "♥ Thanked" state.
 *   3. Status post: visit /this-week signed in → fill textarea → click "Post" →
 *      expect the success status toast says "posted".
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

// ─── 5.4a: RSVP button visibility (authenticated) ─────────────────────────
//
// The toggle-write test (clicking Going/Interested and asserting state change)
// is skip-gated because rsvp-event.ts calls the real GitHub App — it would
// commit to the live repo. The hydration fetch (/api/event-rsvp-state) also
// calls the real GitHub App to read profileSha.
//
// What IS testable without real GitHub writes: the button renders in "not-
// signed-in" state initially (force-dynamic SSG renders initialState based on
// the server-side loadViewerRsvp call, which in E2E mode may or may not have
// GitHub App env vars set). We assert the RSVP control area is present.
//
// If GITHUB_APP_ID / GITHUB_APP_PRIVATE_KEY are configured in the dev server,
// loadViewerRsvp will succeed and render the Going/Interested buttons;
// otherwise it falls back to the "Sign in to RSVP" CTA (which is still the
// correct RSVP control area).

test.describe("5.4a: RSVP button — authenticated view", () => {
  test.beforeEach(async ({ page }) => {
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

  test("RSVP toggle write — skip: real GitHub App required", async () => {
    // rsvp-event.ts calls the real GitHub App (no E2E mock). Skipped.
    // Manual smoke: sign in → /events/${EVENT_SLUG} → click Going →
    // expect '✓ Going' button state; click again → reverts to outline.
    test.skip(
      true,
      "rsvp-event.ts calls real GitHub App (no E2E mock). " +
        "Run manually against a fully-keyed dev server.",
    );
  });
});

// ─── 5.4b: Thanks write — skip-gated ──────────────────────────────────────
//
// thank-status.ts calls the real GitHub App. No in-memory E2E mock exists.
// Asserting the Thanks UI exists (visible) IS possible; asserting the write
// succeeds requires a real GitHub App token.

test.describe("5.4b: Thanks button — authenticated view", () => {
  test.beforeEach(async ({ page }) => {
    await resetStatusStore(page);
    await loginAs(page, "anton1rsod");
  });

  test("/this-week — page loads for signed-in user", async ({ page }) => {
    await page.goto("/this-week", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /this week/i,
    );
  });

  test("Thanks write — skip: real GitHub App required", async () => {
    // thank-status.ts calls the real GitHub App (no E2E mock). Skipped.
    // Manual smoke: sign in → /this-week → find a status card by another
    // member → click '+ Thanks' → expect '♥ Thanked' state.
    test.skip(
      true,
      "thank-status.ts calls real GitHub App (no E2E mock). " +
        "Run manually against a fully-keyed dev server.",
    );
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
    await page.getByLabel(/what are you working on/i).fill(
      "v0.9 Phase 5 E2E backfill.",
    );
    await page.getByRole("button", { name: /post/i }).click();
    await expect(page.getByRole("status")).toContainText(/posted/i);
  });
});
