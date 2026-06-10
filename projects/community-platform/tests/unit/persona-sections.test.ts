import { describe, it, expect } from "vitest";
import { parsePersonaSections } from "@/lib/persona-sections";

// Mirrors the REAL production .public.md heading skeleton. The ' in "I've"
// is U+2019 (typographic apostrophe) — intentional, do not "fix" to ASCII.
const FIXTURE = `# Anton Safronov

## Background

### One-line bio

Founder-operator who ships docs-first.

### Career arc

Fifteen years from sysadmin to founder.

More arc detail.

### Domains of hard-won knowledge

- threat intel
- community ops

### Recurring patterns I see

Hype precedes infrastructure.

## Evaluation posture

### What makes me bullish

Distribution-first founders.

### What makes me skeptical

Demo-driven roadmaps.

### Patterns of failure I’ve seen recur

Building for an imagined buyer.

### Patterns of success I’ve seen recur

Tight feedback loops.

### My typical first question

Who pays, and why now?

## Role dispositions

### Buyer contexts

Security tooling.

### Builder contexts

Platforms and docs systems.

### Competitor / substitute contexts

Spreadsheets are the substitute.

## Verifiable evidence

- shipped v0.11.1
- 19 ADRs

## Hobby projects

Restores fountain pens.
`;

describe("parsePersonaSections — real heading skeleton", () => {
  const got = parsePersonaSections(FIXTURE);

  it("parses all Background subsections", () => {
    expect(got.oneLineBio).toBe("Founder-operator who ships docs-first.");
    expect(got.careerArc).toBe(
      "Fifteen years from sysadmin to founder.\n\nMore arc detail.",
    );
    expect(got.hardWonKnowledge).toBe("- threat intel\n- community ops");
    expect(got.recurringPatterns).toBe("Hype precedes infrastructure.");
  });

  it("parses all Evaluation posture subsections (typographic apostrophe normalized)", () => {
    expect(got.bullish).toBe("Distribution-first founders.");
    expect(got.skeptical).toBe("Demo-driven roadmaps.");
    expect(got.failurePatterns).toBe("Building for an imagined buyer.");
    expect(got.successPatterns).toBe("Tight feedback loops.");
    expect(got.firstQuestion).toBe("Who pays, and why now?");
  });

  it("parses Role dispositions incl. the slash heading", () => {
    expect(got.buyerContexts).toBe("Security tooling.");
    expect(got.builderContexts).toBe("Platforms and docs systems.");
    expect(got.competitorContexts).toBe("Spreadsheets are the substitute.");
  });

  it("captures Verifiable evidence as a whole-section string", () => {
    expect(got.verifiableEvidence).toBe("- shipped v0.11.1\n- 19 ADRs");
  });

  it("routes unknown H2 sections to unrecognized verbatim, drops the # Name H1", () => {
    expect(got.unrecognized).toContain("## Hobby projects");
    expect(got.unrecognized).toContain("Restores fountain pens.");
    expect(got.unrecognized).not.toContain("## Background");
    expect(got.unrecognized).not.toContain("# Anton Safronov");
  });
});

describe("parsePersonaSections — normalization", () => {
  it("accepts ASCII apostrophe variants of the posture headings", () => {
    const body =
      "## Evaluation posture\n\n### Patterns of failure I've seen recur\n\nascii apostrophe\n";
    expect(parsePersonaSections(body).failurePatterns).toBe("ascii apostrophe");
  });

  it("collapses heading whitespace before comparison", () => {
    const body = "## Background\n\n###   Career   arc\n\nspaced out\n";
    expect(parsePersonaSections(body).careerArc).toBe("spaced out");
  });

  it("returns null for a present-but-empty subsection", () => {
    const body = "## Background\n\n### One-line bio\n\n### Career arc\n\narc\n";
    const r = parsePersonaSections(body);
    expect(r.oneLineBio).toBeNull();
    expect(r.careerArc).toBe("arc");
  });

  it("returns null for missing subsections", () => {
    const body = "## Background\n\n### One-line bio\n\nbio only\n";
    const r = parsePersonaSections(body);
    expect(r.oneLineBio).toBe("bio only");
    expect(r.careerArc).toBeNull();
    expect(r.firstQuestion).toBeNull();
    expect(r.verifiableEvidence).toBeNull();
  });
});

describe("parsePersonaSections — H148 never throws, never drops content", () => {
  it("degenerate no-headings body → all null + everything in unrecognized", () => {
    const body = "just some prose\n\nwith paragraphs";
    const r = parsePersonaSections(body);
    expect(r.oneLineBio).toBeNull();
    expect(r.verifiableEvidence).toBeNull();
    expect(r.unrecognized).toBe("just some prose\n\nwith paragraphs");
  });

  it("empty string → all null + empty unrecognized", () => {
    const r = parsePersonaSections("");
    expect(r.unrecognized).toBe("");
    expect(r.careerArc).toBeNull();
  });

  it("routes pre-H3 prose and unknown H3s inside a recognized H2 to unrecognized (lossless)", () => {
    const body =
      "## Background\n\nintro prose\n\n### One-line bio\n\nbio\n\n### Mystery sub\n\nkept\n";
    const r = parsePersonaSections(body);
    expect(r.oneLineBio).toBe("bio");
    expect(r.unrecognized).toContain("intro prose");
    expect(r.unrecognized).toContain("### Mystery sub");
    expect(r.unrecognized).toContain("kept");
  });

  it("never throws on garbage input", () => {
    expect(() => parsePersonaSections("###### deep\n## \n|||\0")).not.toThrow();
    expect(() => parsePersonaSections("## Background")).not.toThrow();
  });
});
