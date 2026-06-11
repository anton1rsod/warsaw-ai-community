import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * v0.12 Phase 4.1 (H155 context) — vendored OG card fonts.
 *
 * satori (next/og ImageResponse) accepts only ttf/otf/woff — NOT woff2 —
 * so the next/font/google Geist in app/layout.tsx is unusable for the OG
 * card. Static-weight TTFs are vendored from the `geist` npm package
 * (OFL-1.1). Chosen source paths (recorded per plan Task 4.1; adjust this
 * comment if the package layout forced a different location):
 *   node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.ttf
 *   node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf
 *
 * Size gate: the whole ImageResponse bundle must stay under 500KB —
 * 300KB per font is the tripwire (two fonts + JSX leaves headroom).
 */

const OG_FONTS_DIR = resolve(__dirname, "../../assets/og");
const FONTS = ["Geist-SemiBold.ttf", "GeistMono-Regular.ttf"] as const;

describe("OG card vendored fonts (Phase 4.1)", () => {
  for (const file of FONTS) {
    const p = resolve(OG_FONTS_DIR, file);

    it(`${file} is committed at assets/og/`, () => {
      expect(existsSync(p)).toBe(true);
    });

    it(`${file} stays under 300KB (500KB ImageResponse budget, H155)`, () => {
      const { size } = statSync(p);
      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(300 * 1024);
    });
  }
});
