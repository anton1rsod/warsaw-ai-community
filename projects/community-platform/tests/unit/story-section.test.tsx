import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { StorySection } from "@/app/components/StorySection";

afterEach(cleanup);

const NULLS = {
  careerArcHtml: null,
  hardWonHtml: null,
  patternsHtml: null,
  buyerHtml: null,
  builderHtml: null,
  competitorHtml: null,
  evidenceHtml: null,
  unrecognizedHtml: null,
  profileHtml: null,
};

describe("StorySection (D8 — progressive disclosure)", () => {
  it("renders nothing when every prop is null", () => {
    const { container } = render(<StorySection {...NULLS} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders an h2 kicker named Story (H157)", () => {
    render(<StorySection {...NULLS} profileHtml="<p>About me.</p>" />);
    expect(screen.getByRole("heading", { level: 2, name: "Story" })).toBeInTheDocument();
  });

  it("renders the profile body block on top when present", () => {
    render(
      <StorySection {...NULLS} profileHtml="<p>Profile body.</p>" careerArcHtml="<p>Arc.</p>" />,
    );
    const profile = screen.getByText("Profile body.");
    const arc = screen.getByText("Arc.");
    expect(
      profile.compareDocumentPosition(arc) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("career arc: first paragraph outside <details>, remainder inside with continue-reading summary (same-DOM, JS-free)", () => {
    const { container } = render(
      <StorySection {...NULLS} careerArcHtml="<p>Lead paragraph.</p><p>Deep history.</p>" />,
    );
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    expect(details?.textContent).toContain("Deep history.");
    expect(details?.textContent).not.toContain("Lead paragraph.");
    expect(details?.querySelector("summary")?.textContent).toContain("continue reading");
  });

  it("single-paragraph career arc renders no details and no fade", () => {
    const { container } = render(
      <StorySection {...NULLS} careerArcHtml="<p>Only paragraph.</p>" />,
    );
    expect(container.querySelector("details")).toBeNull();
    expect(container.querySelector(".bg-gradient-to-t")).toBeNull();
  });

  it("fade overlay is aria-hidden and un-clips when the details opens (group-has)", () => {
    const { container } = render(
      <StorySection {...NULLS} careerArcHtml="<p>Lead.</p><p>Rest.</p>" />,
    );
    const fade = container.querySelector('span[aria-hidden="true"].pointer-events-none');
    expect(fade?.className).toContain("bg-gradient-to-t");
    expect(fade?.className).toContain("group-has-[[open]]:hidden");
  });

  it("renders counted details rows only for provided sections", () => {
    render(
      <StorySection
        {...NULLS}
        hardWonHtml="<ul><li>a</li><li>b</li><li>c</li></ul>"
        evidenceHtml="<ul><li>repo</li></ul>"
      />,
    );
    expect(screen.getByText("Hard-won knowledge")).toBeInTheDocument();
    expect(screen.getByText("Verifiable evidence")).toBeInTheDocument();
    expect(screen.queryByText("Patterns I keep seeing")).toBeNull();
    expect(screen.queryByText("Role dispositions")).toBeNull();
  });

  it("decorative item counts are aria-hidden (H158)", () => {
    const { container } = render(
      <StorySection {...NULLS} hardWonHtml="<ul><li>a</li><li>b</li><li>c</li></ul>" />,
    );
    const count = [...container.querySelectorAll('summary span[aria-hidden="true"]')].find(
      (el) => (el.textContent ?? "").includes("3"),
    );
    expect(count).toBeDefined();
  });

  it("role dispositions row renders Buyer/Builder/Substitute sub-blocks", () => {
    render(
      <StorySection
        {...NULLS}
        buyerHtml="<p>buys tools</p>"
        builderHtml="<p>builds tools</p>"
        competitorHtml="<p>substitutes tools</p>"
      />,
    );
    const row = screen.getByText("Role dispositions").closest("details");
    expect(row?.textContent).toContain("Buyer");
    expect(row?.textContent).toContain("Builder");
    expect(row?.textContent).toContain("Substitute");
    expect(row?.textContent).toContain("buys tools");
  });

  it("unrecognized sections render verbatim under the More row (H148 posture)", () => {
    render(
      <StorySection {...NULLS} unrecognizedHtml="<p>kept verbatim</p>" />,
    );
    expect(screen.getByText("More").closest("details")?.textContent).toContain(
      "kept verbatim",
    );
  });

  it("H158: no headings inside summary, carets aria-hidden, native marker hidden", () => {
    const { container } = render(
      <StorySection
        {...NULLS}
        careerArcHtml="<p>a</p><p>b</p>"
        hardWonHtml="<ul><li>x</li></ul>"
      />,
    );
    expect(
      container.querySelectorAll(
        "summary h1, summary h2, summary h3, summary h4, summary h5, summary h6",
      ).length,
    ).toBe(0);
    const summaries = [...container.querySelectorAll("summary")];
    expect(summaries.length).toBeGreaterThan(0);
    for (const summary of summaries) {
      expect(summary.className).toContain("list-none");
      expect(summary.className).toContain("[&::-webkit-details-marker]:hidden");
      const glyph = [...summary.querySelectorAll("span")].find((sp) =>
        (sp.textContent ?? "").includes("▾"),
      );
      expect(glyph?.getAttribute("aria-hidden")).toBe("true");
    }
  });
});
