import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const src = readFileSync(
  resolve(__dirname, "../../app/members/[slug]/page.tsx"),
  "utf8",
);

describe("member page v0.12 — typeset dossier composition (spec §3)", () => {
  it("uses the 688px column, not max-w-3xl", () => {
    expect(src).toMatch(/max-w-\[688px\]/);
    expect(src).not.toMatch(/max-w-3xl/);
  });

  it("composes the dossier components in spec §3 order", () => {
    const order = [
      "<ExpertiseLedger",
      "<FirstQuestionQuote",
      "<PostureLedger",
      "<StorySection",
      "<GdprPanel",
      "<ActivityLine",
    ];
    const idx = order.map((tag) => src.indexOf(tag));
    expect(idx.every((i) => i >= 0)).toBe(true);
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
  });

  it("no longer renders PersonaPanel or ContributionCard", () => {
    expect(src).not.toMatch(/PersonaPanel/);
    expect(src).not.toMatch(/ContributionCard/);
  });

  it("keeps the H147 persona_visible gate", () => {
    expect(src).toMatch(/persona_visible !== false/);
  });

  it("keeps the double-guarded E2E mockPersonaStore fork", () => {
    expect(src).toMatch(/!isProductionRuntime\(\) && isE2EMode\(\)/);
    expect(src).toMatch(/mockPersonaStore\.get/);
  });

  it("keeps the events orphan filter", () => {
    expect(src).toMatch(/filterOrphanSlugs/);
  });

  it("O5: statement renders only when oneLineBio is non-empty", () => {
    expect(src).toMatch(/statement !== ""/);
  });

  it("O2: t.me deep-link with CopyHandle fallback", () => {
    expect(src).toMatch(/https:\/\/t\.me\//);
    expect(src).toMatch(/<CopyHandle/);
  });

  it("view card links to the OG image route (Phase 4 target)", () => {
    expect(src).toMatch(/opengraph-image/);
  });

  it("persona-hidden/absent renders the dashed empty state in place of dossier sections", () => {
    expect(src).toMatch(/border-dashed/);
    expect(src).toMatch(/noPersonaFmt/);
  });

  it("avatar initials are decorative (aria-hidden, spec §3)", () => {
    expect(src).toMatch(/aria-hidden="true"[\s\S]{0,200}initialsFor/);
  });

  it("no dark: variants, no Fraunces, H143 markdown path only", () => {
    expect(src).not.toMatch(/\bdark:/);
    expect(src).toMatch(/renderMarkdownToHtml/);
  });
});
