import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

/**
 * v0.12 Phase 4.2 — H155 source-scan for the OG card route.
 *
 * The route is public + CDN-cached: it must never read the session or
 * request headers (auth()/next/headers would flip it dynamic and leak
 * viewer context into a cacheable PNG), and it must route ALL member
 * data through buildOgCardModel, which re-applies the H147/H146 gate.
 */

const src = readFileSync(
  resolve(__dirname, "../../app/members/[slug]/opengraph-image.tsx"),
  "utf8",
);

describe("opengraph-image route (H155)", () => {
  it("exports the metadata-route contract (alt/size/contentType)", () => {
    expect(src).toMatch(/export const alt = "Member card"/);
    expect(src).toMatch(/width: 1200/);
    expect(src).toMatch(/height: 630/);
    expect(src).toMatch(/export const contentType = "image\/png"/);
  });

  it("awaits the params Promise (Next 16 breaking change)", () => {
    expect(src).toMatch(/params: Promise<\{ slug: string \}>/);
    expect(src).toMatch(/await params/);
  });

  it("never calls auth() or next/headers (cacheable, viewer-blind)", () => {
    expect(src).not.toMatch(/@\/lib\/auth/);
    expect(src).not.toMatch(/\bauth\(\)/);
    expect(src).not.toMatch(/next\/headers/);
  });

  it("routes member data through the H147/H146 gate (buildOgCardModel)", () => {
    expect(src).toMatch(/buildOgCardModel/);
    // No parallel parse path that could bypass the gate:
    expect(src).not.toMatch(/parsePersona\(/);
  });

  it("never imports the E2E mock persona store (snapshot-only data path)", () => {
    expect(src).not.toMatch(/_test-persona-store/);
  });

  it("loads both vendored TTFs via literal process.cwd() joins (traceable)", () => {
    expect(src).toMatch(
      /join\(process\.cwd\(\), "assets\/og\/Geist-SemiBold\.ttf"\)/,
    );
    expect(src).toMatch(
      /join\(process\.cwd\(\), "assets\/og\/GeistMono-Regular\.ttf"\)/,
    );
  });

  it("does not set runtime='edge' (readFile needs Node)", () => {
    expect(src).not.toMatch(/runtime/);
  });
});
