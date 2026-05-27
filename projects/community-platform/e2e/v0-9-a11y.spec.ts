/**
 * v0.9 Phase 5.1 — a11y sweep for anonymously-accessible reader surfaces (H102).
 *
 * Surfaces covered: the genuinely-public reskinned pages reachable without
 * authentication per proxy.ts PUBLIC_PATHS. The authenticated reader surfaces
 * (/decisions, /members, /projects and their detail pages) redirect anonymous
 * visitors to /login, so axe-scanning them here would measure /login's
 * accessibility a second time — not the target pages. Authenticated reader a11y
 * is deferred to v0.9.1 / manual smoke (requires a signed-in context and a
 * dedicated authenticated a11y spec).
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const SURFACES = [
  "/calendar",
  "/meetings",
  "/handbook",
  "/login",
  "/events",
  "/home",
];

test.describe("H102: v0.9 reader surfaces — axe-core serious/critical (anonymous)", () => {
  for (const path of SURFACES) {
    test(`${path} — no serious/critical a11y violations`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: "networkidle" });
      expect(response?.status()).toBeLessThan(400);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .disableRules(["region"])
        .analyze();

      const serious = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
    });
  }
});
