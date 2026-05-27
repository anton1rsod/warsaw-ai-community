/**
 * v0.9 Phase 5.3 — ICS subscribe and AddToCalendar E2E.
 *
 * Covers:
 *   1. GET /api/calendar.ics returns 200 + text/calendar content-type.
 *   2. /events page carries a Subscribe pill link pointing to /api/calendar.ics.
 *   3. /events/2026-05-21-meetup-4 (public) renders an AddToCalendarButton.
 *
 * Note on AddToCalendarButton: the component renders a <button> (via Pill with
 * type="button") that generates a blob URL and triggers a programmatic click on
 * a hidden anchor — no href is emitted in the HTML. We assert the button exists
 * and is clickable, which is the testable contract for a client-side blob download.
 */

import { test, expect } from "@playwright/test";

const EVENT_SLUG = "2026-05-21-meetup-4";

test.describe("v0.9 ICS / AddToCalendar", () => {
  test("GET /api/calendar.ics → 200 + text/calendar", async ({ page }) => {
    const response = await page.request.get("/api/calendar.ics");
    expect(response.status()).toBe(200);
    const contentType = response.headers()["content-type"] ?? "";
    expect(contentType).toContain("text/calendar");
    const body = await response.text();
    expect(body).toContain("BEGIN:VCALENDAR");
  });

  test("/events Subscribe pill links to /api/calendar.ics", async ({ page }) => {
    await page.goto("/events", { waitUntil: "networkidle" });
    const subscribeLink = page.getByRole("link", { name: /subscribe/i });
    await expect(subscribeLink).toBeVisible();
    const href = await subscribeLink.getAttribute("href");
    expect(href).toContain("/api/calendar.ics");
  });

  test(`/events/${EVENT_SLUG} — AddToCalendar button is present and enabled`, async ({
    page,
  }) => {
    await page.goto(`/events/${EVENT_SLUG}`, { waitUntil: "networkidle" });
    // AddToCalendarButton renders as a <button> via Pill type="button".
    // It generates a blob URL on click (no static href in DOM).
    const btn = page.getByRole("button", { name: /add to calendar/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });
});
