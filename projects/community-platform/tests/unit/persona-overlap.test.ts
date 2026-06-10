import { describe, it, expect } from "vitest";
import { computeOverlap } from "@/lib/persona-overlap";
import type { ParsedPersona, PersonaTags } from "@/lib/persona";

function persona(tags: Partial<PersonaTags>): ParsedPersona {
  return {
    languages: [],
    body: "",
    tags: {
      industries: [],
      functionalRoles: [],
      companyStages: [],
      niche: [],
      ...tags,
    },
  };
}

describe("computeOverlap — shared", () => {
  it("matches labels case-insensitively with trim; label rendered from the subject side", () => {
    const viewer = persona({ industries: [{ label: "AI", depth: "familiar" }] });
    const subject = persona({ industries: [{ label: " ai ", depth: "expert" }] });
    const r = computeOverlap(viewer, subject);
    expect(r.shared).toEqual([
      { label: "ai", viewerDepth: "familiar", subjectDepth: "expert" },
    ]);
  });

  it("pools industries + functionalRoles + companyStages into one label space", () => {
    const viewer = persona({ functionalRoles: [{ label: "pm", depth: "expert" }] });
    const subject = persona({ industries: [{ label: "pm", depth: "familiar" }] });
    expect(computeOverlap(viewer, subject).shared).toHaveLength(1);
  });

  it("sorts by combined depth rank desc (expert 3 / practitioner 2 / familiar 1 / null 0), label tiebreak", () => {
    const viewer = persona({
      industries: [
        { label: "ai", depth: "familiar" },
        { label: "fintech", depth: "expert" },
      ],
      functionalRoles: [{ label: "pm", depth: "practitioner" }],
    });
    const subject = persona({
      industries: [
        { label: "ai", depth: "familiar" }, // combined 2
        { label: "fintech", depth: "practitioner" }, // combined 5
      ],
      functionalRoles: [{ label: "pm", depth: "expert" }], // combined 5
    });
    expect(computeOverlap(viewer, subject).shared.map((t) => t.label)).toEqual([
      "fintech",
      "pm",
      "ai",
    ]);
  });
});

describe("computeOverlap — complementary", () => {
  it("requires subjectDepth === 'expert' AND viewer holds the label at rank < 3", () => {
    const viewer = persona({
      industries: [
        { label: "a", depth: "familiar" }, // subject expert → complementary
        { label: "b", depth: "expert" }, // viewer already rank 3 → no
        { label: "c", depth: "familiar" }, // subject practitioner → no
      ],
    });
    const subject = persona({
      industries: [
        { label: "a", depth: "expert" },
        { label: "b", depth: "expert" },
        { label: "c", depth: "practitioner" },
        { label: "d", depth: "expert" }, // viewer lacks label → not shared, not complementary
      ],
    });
    const r = computeOverlap(viewer, subject);
    expect(r.complementary.map((t) => t.label)).toEqual(["a"]);
    expect(r.shared.map((t) => t.label)).not.toContain("d");
  });

  it("viewer depth null counts as rank 0 (< 3) → complementary", () => {
    const viewer = persona({ industries: [{ label: "x", depth: null }] });
    const subject = persona({ industries: [{ label: "x", depth: "expert" }] });
    expect(computeOverlap(viewer, subject).complementary).toEqual([
      { label: "x", viewerDepth: null, subjectDepth: "expert" },
    ]);
  });

  it("same label in two lists pools at the DEEPEST viewer depth (expert blocks complementary)", () => {
    const viewer = persona({
      industries: [{ label: "x", depth: "familiar" }],
      functionalRoles: [{ label: "x", depth: "expert" }],
    });
    const subject = persona({ industries: [{ label: "x", depth: "expert" }] });
    expect(computeOverlap(viewer, subject).complementary).toEqual([]);
  });
});

describe("computeOverlap — starters (O1: deterministic templates, 0-3, skip-when-empty)", () => {
  it("emits all 3 starters with the exact i18n template substitutions", () => {
    const viewer = persona({
      industries: [{ label: "b2b-saas", depth: "practitioner" }],
    });
    const subject = persona({
      industries: [{ label: "b2b-saas", depth: "expert" }],
      niche: ["pricing teardowns"],
    });
    expect(computeOverlap(viewer, subject).starters).toEqual([
      "You both work in b2b-saas — compare notes from opposite vantage points.",
      "Ask about b2b-saas — expert where you're still mapping it.",
      "Their niche: pricing teardowns — ask how they got there.",
    ]);
  });

  it("skips the shared + complementary starters when there is no overlap (niche-only → length 1)", () => {
    const viewer = persona({});
    const subject = persona({ niche: ["llm evals"] });
    expect(computeOverlap(viewer, subject).starters).toEqual([
      "Their niche: llm evals — ask how they got there.",
    ]);
  });

  it("skips the niche starter when subject has no niche items", () => {
    const viewer = persona({ industries: [{ label: "ai", depth: "familiar" }] });
    const subject = persona({ industries: [{ label: "ai", depth: "practitioner" }] });
    const r = computeOverlap(viewer, subject);
    expect(r.starters).toHaveLength(1); // shared only; no expert → no complementary
  });

  it("returns 0 starters for two empty personas", () => {
    expect(computeOverlap(persona({}), persona({}))).toEqual({
      shared: [],
      complementary: [],
      starters: [],
    });
  });

  it("is deterministic — identical inputs give deep-equal outputs", () => {
    const viewer = persona({
      industries: [
        { label: "ai", depth: "familiar" },
        { label: "fintech", depth: "expert" },
      ],
    });
    const subject = persona({
      industries: [
        { label: "fintech", depth: "expert" },
        { label: "ai", depth: "expert" },
      ],
      niche: ["x"],
    });
    expect(computeOverlap(viewer, subject)).toEqual(computeOverlap(viewer, subject));
  });
});
