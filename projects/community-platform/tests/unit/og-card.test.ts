import { describe, it, expect } from "vitest";
import { buildOgCardModel } from "@/lib/og-card";
import type { MemberWithProfile } from "@/lib/content-snapshot";

const PERSONA = `---
persona_id: jane-d
display_name: Jane D
languages: [en]
schema_version: 1.0
---
# Jane D

## Tags

### Industries
- b2b-saas — expert
- fintech — practitioner

### Functional roles
- product-manager — expert
- founder — expert

### Company stages
- seed — expert
- series-a — expert
- growth — expert

## Background

### One-line bio

PM who ships.

### Career arc

Long story here.
`;

function member(overrides: Partial<MemberWithProfile> = {}): MemberWithProfile {
  return {
    name: "Jane D",
    githubHandle: "jane",
    slug: "jane-d",
    telegram: null,
    link: null,
    focus: null,
    profile: { data: {}, body: "" },
    persona: PERSONA,
    ...overrides,
  };
}

describe("buildOgCardModel (H155: in-route H147/H146 gate)", () => {
  it("renders bio + expert tags pooled across industries/roles/stages, capped at 5", () => {
    const m = buildOgCardModel(member());
    expect(m.name).toBe("Jane D");
    expect(m.bio).toBe("PM who ships.");
    // Pool order: industries → functional roles → company stages; 6 experts → 5.
    expect(m.expertTags).toEqual([
      "b2b-saas",
      "product-manager",
      "founder",
      "seed",
      "series-a",
    ]);
  });

  it("excludes non-expert depths from the tag row", () => {
    const m = buildOgCardModel(member());
    expect(m.expertTags).not.toContain("fintech"); // practitioner
  });

  it("H147: persona_visible:false ⇒ name-only fallback (no bio, no tags)", () => {
    const m = buildOgCardModel(
      member({ profile: { data: { persona_visible: false }, body: "" } }),
    );
    expect(m).toEqual({ name: "Jane D", bio: null, expertTags: [] });
  });

  it("H146: absent persona (erased) ⇒ name-only fallback", () => {
    const m = buildOgCardModel(member({ persona: null }));
    expect(m).toEqual({ name: "Jane D", bio: null, expertTags: [] });
  });

  it("malformed profile frontmatter ⇒ safeParse fails ⇒ visible default (page parity)", () => {
    const m = buildOgCardModel(
      member({ profile: { data: { events_going: "not-an-array" }, body: "" } }),
    );
    expect(m.bio).toBe("PM who ships.");
  });

  it("missing One-line bio section ⇒ bio null, tags still render", () => {
    const noBio = PERSONA.replace(/### One-line bio\n\nPM who ships\.\n\n/, "");
    const m = buildOgCardModel(member({ persona: noBio }));
    expect(m.bio).toBeNull();
    expect(m.expertTags.length).toBe(5);
  });

  it("null profile ⇒ visible default (absent ⇒ visible)", () => {
    const m = buildOgCardModel(member({ profile: null }));
    expect(m.bio).toBe("PM who ships.");
  });
});
