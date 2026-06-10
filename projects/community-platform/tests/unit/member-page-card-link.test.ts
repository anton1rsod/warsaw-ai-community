import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * v0.12 Phase 4.3 — `view card ↗` actions-row link + /me/edit embed snippet.
 * Source-scan pattern (cf. projects-page.test.tsx): async server pages with
 * auth() are asserted by source, not render.
 */

const page = readFileSync(
  resolve(__dirname, "../../app/members/[slug]/page.tsx"),
  "utf8",
);
const meEdit = readFileSync(
  resolve(__dirname, "../../app/me/edit/page.tsx"),
  "utf8",
);

describe("view card ↗ link (Phase 4.3)", () => {
  it("member-page actions row links to the OG card route via i18n", () => {
    expect(page).toMatch(/\/opengraph-image/);
    expect(page).toMatch(/s\("members\.detail\.viewCard"\)/);
  });

  it("card link is a ≥24px hit target (H159: min-h + padding-block)", () => {
    const idx = page.indexOf('s("members.detail.viewCard")');
    expect(idx).toBeGreaterThan(-1);
    const anchor = page.slice(Math.max(0, idx - 400), idx);
    expect(anchor).toMatch(/min-h-\[24px\]/);
  });

  it("/me/edit renders the CardEmbedSnippet near the PersonaEditor", () => {
    expect(meEdit).toMatch(/CardEmbedSnippet/);
    expect(meEdit).toMatch(/s\("persona\.editor\.embedHint"\)/);
  });
});
