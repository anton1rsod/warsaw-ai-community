import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { ExpertiseLedger } from "@/app/components/ExpertiseLedger";
import { FirstQuestionQuote } from "@/app/components/FirstQuestionQuote";
import { PostureLedger } from "@/app/components/PostureLedger";
import { StorySection } from "@/app/components/StorySection";
import type { ParsedPersona } from "@/lib/persona";

afterEach(cleanup);

type PersonaTags = ParsedPersona["tags"];

const TAGS: PersonaTags = {
  industries: [{ label: "ai", depth: "expert" }],
  functionalRoles: [],
  companyStages: [],
  niche: [],
};

/** The §3 page order with controlled section HTML (no headings in content). */
function Dossier(): React.JSX.Element {
  return (
    <main>
      <h1>Anton Safronov</h1>
      <ExpertiseLedger tags={TAGS} languages={["en"]} />
      <FirstQuestionQuote question="What breaks first?" askHref={null} />
      <PostureLedger
        bullish="clear ICP"
        skeptical="no users"
        failurePatterns={null}
        successPatterns={null}
      />
      <StorySection
        careerArcHtml="<p>one</p><p>two</p>"
        hardWonHtml="<ul><li>a</li></ul>"
        patternsHtml={null}
        buyerHtml={null}
        builderHtml={null}
        competitorHtml={null}
        evidenceHtml={null}
        unrecognizedHtml={null}
        profileHtml={null}
      />
    </main>
  );
}

describe("H157 — heading outline (h1 → h2 per section, nothing hidden)", () => {
  it("renders exactly h1 + one h2 per dossier section, in order", () => {
    render(<Dossier />);
    const headings = screen.getAllByRole("heading");
    const levels = headings.map((h) => Number(h.tagName.slice(1)));
    expect(levels[0]).toBe(1);
    expect(levels.slice(1).every((l) => l === 2)).toBe(true);
    // h1 + Expertise + Evaluation posture + Story (FirstQuestionQuote has no heading)
    expect(headings.length).toBe(4);
    // present in the a11y tree = none of the kickers is aria-hidden
    for (const h of headings) {
      expect(h.getAttribute("aria-hidden")).toBeNull();
    }
  });

  it("H158: no heading element inside any <summary>", () => {
    const { container } = render(<Dossier />);
    expect(
      container.querySelectorAll(
        "summary h1, summary h2, summary h3, summary h4, summary h5, summary h6",
      ).length,
    ).toBe(0);
  });
});
