import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { OverlapLens } from "@/app/components/OverlapLens";
import type { OverlapResult } from "@/lib/persona-overlap";

afterEach(cleanup);

const EMPTY: OverlapResult = { shared: [], complementary: [], starters: [] };

const FULL: OverlapResult = {
  shared: [
    { label: "fintech", viewerDepth: "practitioner", subjectDepth: "expert" },
    { label: "b2b-saas", viewerDepth: "familiar", subjectDepth: "practitioner" },
  ],
  complementary: [
    { label: "fintech", viewerDepth: "practitioner", subjectDepth: "expert" },
  ],
  starters: [
    "You both work in fintech — compare notes from opposite vantage points.",
    "Ask about fintech — expert where you're still mapping it.",
    "Their niche: chargeback dispute automation — ask how they got there.",
  ],
};

describe("OverlapLens (v0.12 §4.2 — H156/H157/H158/H159/H160)", () => {
  it("renders null when the overlap has no content", () => {
    const { container } = render(<OverlapLens overlap={EMPTY} subjectName="Nadia K" />);
    expect(container.firstChild).toBeNull();
  });

  it("kicker is a real h2 whose accessible name is the sr-only alternative (× never announced)", () => {
    render(<OverlapLens overlap={FULL} subjectName="Nadia K" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "overlap: you and Nadia K" }),
    ).toBeInTheDocument();
    // Visual "you × Nadia K" is present for sighted users but aria-hidden.
    expect(screen.getByText(/you × Nadia K/)).toHaveAttribute("aria-hidden", "true");
  });

  it("band is a labelled region with surface-soft background + 10px radius", () => {
    render(<OverlapLens overlap={FULL} subjectName="Nadia K" />);
    const region = screen.getByRole("region", { name: "overlap: you and Nadia K" });
    expect(region.className).toContain("bg-surface-soft");
    expect(region.className).toContain("rounded-[10px]");
  });

  it("shared labels render at 500 weight inside the sharedFmt sentence", () => {
    const { container } = render(<OverlapLens overlap={FULL} subjectName="Nadia K" />);
    const bold = [...container.querySelectorAll("span.font-medium")].map(
      (el) => el.textContent,
    );
    expect(bold).toEqual(["fintech", "b2b-saas"]);
    expect(screen.getByText(/Shared ground in/)).toBeInTheDocument();
  });

  it("renders exactly one complementary sentence (first entry) in ink-muted", () => {
    render(<OverlapLens overlap={FULL} subjectName="Nadia K" />);
    const sentence = screen.getByText("expert in fintech where you're practitioner");
    expect(sentence.className).toContain("text-ink-muted");
  });

  it("reads a null viewer depth as 'familiar' (lowest spoken rung)", () => {
    const result: OverlapResult = {
      shared: [],
      complementary: [{ label: "agents", viewerDepth: null, subjectDepth: "expert" }],
      starters: [],
    };
    render(<OverlapLens overlap={result} subjectName="Nadia K" />);
    expect(
      screen.getByText("expert in agents where you're familiar"),
    ).toBeInTheDocument();
  });

  it("starters live inside a native <details>; summary = startersLinkFmt with count", () => {
    const { container } = render(<OverlapLens overlap={FULL} subjectName="Nadia K" />);
    const details = container.querySelector("details");
    expect(details).not.toBeNull();
    if (!details) return;
    expect(details.open).toBe(false);
    const summary = details.querySelector("summary");
    expect(summary).not.toBeNull();
    if (!summary) return;
    expect(summary.textContent).toContain("3 conversation starters →");
    // Content is in the DOM with no JS — native disclosure.
    for (const starter of FULL.starters) {
      expect(screen.getByText(starter)).toBeInTheDocument();
    }
  });

  it("H158: no heading inside summary; caret aria-hidden — H159: ≥24px summary hit box", () => {
    const { container } = render(<OverlapLens overlap={FULL} subjectName="Nadia K" />);
    const summary = container.querySelector("summary");
    expect(summary).not.toBeNull();
    if (!summary) return;
    expect(summary.querySelector("h1,h2,h3,h4,h5,h6")).toBeNull();
    expect(summary.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(summary.className).toContain("min-h-[24px]");
  });

  it("H156: no dust / accent-700 text tones anywhere on the surface-soft band", () => {
    const { container } = render(<OverlapLens overlap={FULL} subjectName="Nadia K" />);
    expect(container.innerHTML).not.toMatch(/text-dust/);
    expect(container.innerHTML).not.toMatch(/text-accent-700/);
  });

  it("skips the starters block entirely when starters is empty", () => {
    const { container } = render(
      <OverlapLens
        overlap={{ shared: FULL.shared, complementary: [], starters: [] }}
        subjectName="Nadia K"
      />,
    );
    expect(container.querySelector("details")).toBeNull();
  });
});
