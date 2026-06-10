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
