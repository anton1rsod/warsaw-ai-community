import { describe, it, expect } from "vitest";
import { parsePersona } from "@/lib/persona";

const SAMPLE = `---
persona_id: anton-s
display_name: Anton S.
languages: [en]
schema_version: 1.0
---

# Anton S.

## Tags

### Industries
- ai-ml-applications — expert
- b2b-saas — expert
- cybersecurity — practitioner

### Functional roles
- product-manager — expert

### Company stages
- seed — expert

### Niche expertise
- B2B Revenue Operations architecture
- AI Voice PaaS product management

## Background

### One-line bio
B2B AI GTM Operator.
`;

describe("parsePersona", () => {
  it("extracts languages from frontmatter", () => {
    expect(parsePersona(SAMPLE).languages).toEqual(["en"]);
  });

  it("parses Industries with depth", () => {
    const { tags } = parsePersona(SAMPLE);
    expect(tags.industries).toEqual([
      { label: "ai-ml-applications", depth: "expert" },
      { label: "b2b-saas", depth: "expert" },
      { label: "cybersecurity", depth: "practitioner" },
    ]);
  });
});

describe("parsePersona — full schema + fallback", () => {
  it("parses functionalRoles, companyStages, and niche (no depth)", () => {
    const { tags } = parsePersona(SAMPLE);
    expect(tags.functionalRoles).toEqual([{ label: "product-manager", depth: "expert" }]);
    expect(tags.companyStages).toEqual([{ label: "seed", depth: "expert" }]);
    expect(tags.niche).toEqual([
      "B2B Revenue Operations architecture",
      "AI Voice PaaS product management",
    ]);
  });

  it("strips the ## Tags block from body but keeps narrative sections", () => {
    const { body } = parsePersona(SAMPLE);
    expect(body).not.toMatch(/## Tags/);
    expect(body).not.toMatch(/### Industries/);
    expect(body).toMatch(/## Background/);
    expect(body).toMatch(/One-line bio/);
  });

  it("H148: a persona with no ## Tags returns empty tags + full body (fallback)", () => {
    const noTags = "---\nlanguages: [en]\n---\n\n# X\n\n## Background\n\nHi.\n";
    const p = parsePersona(noTags);
    expect(p.tags.industries).toEqual([]);
    expect(p.tags.niche).toEqual([]);
    expect(p.body).toMatch(/## Background/);
  });

  it("tolerates an unknown depth qualifier (depth=null)", () => {
    const weird = "---\nlanguages: []\n---\n\n## Tags\n\n### Industries\n- fintech — guru\n";
    expect(parsePersona(weird).tags.industries).toEqual([{ label: "fintech", depth: null }]);
  });

  it("handles a missing languages frontmatter key", () => {
    expect(parsePersona("## Tags\n").languages).toEqual([]);
  });

  it("parses a tag line with no em-dash (label only, depth=null)", () => {
    const noDepth =
      "---\nlanguages: []\n---\n\n## Tags\n\n### Industries\n- fintech\n";
    expect(parsePersona(noDepth).tags.industries).toEqual([
      { label: "fintech", depth: null },
    ]);
  });

  it("parseNiche: niche followed by another ### subsection (nextSub !== -1)", () => {
    const withAfter =
      "---\nlanguages: []\n---\n\n## Tags\n\n### Niche expertise\n- AI ops\n### Other\n- foo\n";
    expect(parsePersona(withAfter).tags.niche).toEqual(["AI ops"]);
  });
});
