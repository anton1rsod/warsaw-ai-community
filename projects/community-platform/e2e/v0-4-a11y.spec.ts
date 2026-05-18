import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const SURFACES = ["/", "/home", "/calendar", "/handbook", "/login", "/events", "/meetings"];

for (const path of SURFACES) {
  test(`a11y baseline — ${path} has no serious/critical axe-core violations`, async ({
    page,
  }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious).toEqual([]);
  });
}
