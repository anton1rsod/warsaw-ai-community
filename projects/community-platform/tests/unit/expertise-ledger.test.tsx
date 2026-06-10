import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { ExpertiseLedger } from "@/app/components/ExpertiseLedger";
import type { PersonaTags } from "@/lib/persona";

afterEach(cleanup);

const EMPTY: PersonaTags = {
  industries: [],
  functionalRoles: [],
  companyStages: [],
  niche: [],
};

const FULL: PersonaTags = {
  industries: [
    { label: "b2b-saas", depth: "expert" },
    { label: "fintech", depth: "practitioner" },
    { label: "gaming", depth: "familiar" },
  ],
  functionalRoles: [
    { label: "product-manager", depth: "expert" },
    { label: "growth-marketing", depth: null },
  ],
  companyStages: [{ label: "seed", depth: "practitioner" }],
  niche: ["AI-augmented sales ops", "Warsaw GTM"],
};

describe("ExpertiseLedger (D7 — ledger rows replace chips)", () => {
  it("renders an h2 kicker named Expertise (H157)", () => {
    render(<ExpertiseLedger tags={FULL} languages={["en"]} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Expertise" }),
    ).toBeInTheDocument();
  });

  it("pools industries + functional roles + company stages into the Expert row, joined by aria-hidden separators", () => {
    render(<ExpertiseLedger tags={FULL} languages={[]} />);
    const expertDd = screen.getByText("b2b-saas").closest("dd");
    expect(expertDd?.textContent).toBe("b2b-saas · product-manager");
    const seps = expertDd?.querySelectorAll('span[aria-hidden="true"]') ?? [];
    expect(seps.length).toBe(1);
    expect(seps[0]?.textContent).toBe(" · ");
    expect(seps[0]?.className).toContain("text-hairline-strong");
  });

  it("expert row is 16.5px medium ink; practitioner row is 15px ink-muted (depth hierarchy by tone)", () => {
    render(<ExpertiseLedger tags={FULL} languages={[]} />);
    const expertDd = screen.getByText("b2b-saas").closest("dd");
    expect(expertDd?.className).toContain("text-[16.5px]");
    expect(expertDd?.className).toContain("font-medium");
    expect(expertDd?.className).toContain("text-ink");
    const practitionerDd = screen.getByText("fintech").closest("dd");
    expect(practitionerDd?.textContent).toBe("fintech · seed");
    expect(practitionerDd?.className).toContain("text-[15px]");
    expect(practitionerDd?.className).toContain("text-ink-muted");
  });

  it("familiar-depth and depth-null tags are not rendered (approved mockup: expert + practitioner rows only)", () => {
    render(<ExpertiseLedger tags={FULL} languages={["en", "pl"]} />);
    expect(screen.queryByText(/gaming/)).toBeNull();
    expect(screen.queryByText(/growth-marketing/)).toBeNull();
  });

  it("each row uses the dt/dd ledger grammar with mono dust dt labels", () => {
    const { container } = render(<ExpertiseLedger tags={FULL} languages={["en", "pl"]} />);
    for (const label of ["Expert", "Practitioner", "Niche", "Languages"]) {
      const dt = screen.getByText(label);
      expect(dt.tagName).toBe("DT");
      expect(dt.className).toContain("font-voice");
      expect(dt.className).toContain("text-[11px]");
      expect(dt.className).toContain("uppercase");
      expect(dt.className).toContain("text-dust");
      expect(dt.parentElement?.className).toContain("min-[560px]:grid-cols-[120px_1fr]");
    }
    const dl = container.querySelector("dl");
    expect(dl?.className).toContain("divide-y");
    expect(dl?.className).toContain("divide-hairline");
    expect(dl?.className).toContain("border-y");
    expect(dl?.className).toContain("border-hairline");
  });

  it("Niche joins with · and Languages joins with comma", () => {
    render(<ExpertiseLedger tags={FULL} languages={["en", "pl"]} />);
    expect(screen.getByText("AI-augmented sales ops · Warsaw GTM")).toBeInTheDocument();
    expect(screen.getByText("en, pl")).toBeInTheDocument();
  });

  it("omits rows whose list is empty", () => {
    render(<ExpertiseLedger tags={EMPTY} languages={["en"]} />);
    expect(screen.queryByText("Expert")).toBeNull();
    expect(screen.queryByText("Practitioner")).toBeNull();
    expect(screen.queryByText("Niche")).toBeNull();
    expect(screen.getByText("Languages")).toBeInTheDocument();
  });

  it("returns null when every row is empty", () => {
    const { container } = render(<ExpertiseLedger tags={EMPTY} languages={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("does not import the Tag chip component (D7 — chips are gone on this page)", () => {
    const src = readFileSync(
      resolve(__dirname, "../../app/components/ExpertiseLedger.tsx"),
      "utf8",
    );
    expect(src).not.toMatch(/from "@\/app\/components\/Tag"/);
    expect(src).not.toMatch(/<Tag[\s/>]/);
  });
});
