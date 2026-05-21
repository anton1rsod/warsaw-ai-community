import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const SURFACES = ["/", "/home", "/events", "/events/2026-05-21-meetup-4"];

test.describe("H91: v0.6 surfaces clear axe-core serious/critical violations", () => {
  for (const path of SURFACES) {
    test(`${path} — anonymous`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: "networkidle" });
      expect(response?.status()).toBeLessThan(400);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .disableRules(["region"])
        .analyze();
      const serious = results.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );
      expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
    });
  }
});
