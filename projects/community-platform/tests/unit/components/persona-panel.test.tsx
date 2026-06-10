import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { PersonaPanel } from "@/app/components/PersonaPanel";
import type { ParsedPersona } from "@/lib/persona";

afterEach(cleanup);

const PERSONA: ParsedPersona = {
  languages: ["en"],
  tags: {
    industries: [{ label: "b2b-saas", depth: "expert" }, { label: "fintech", depth: "familiar" }],
    functionalRoles: [{ label: "product-manager", depth: "expert" }],
    companyStages: [],
    niche: ["AI Voice PaaS"],
  },
  body: "## Background\n\nbio",
};

describe("PersonaPanel", () => {
  it("renders tag chips with their labels", () => {
    render(<PersonaPanel persona={PERSONA} bodyHtml="<h2>Background</h2><p>bio</p>" slug="x" />);
    expect(screen.getByText(/b2b-saas/)).toBeInTheDocument();
    expect(screen.getByText(/product-manager/)).toBeInTheDocument();
    expect(screen.getByText("AI Voice PaaS")).toBeInTheDocument();
  });

  it("renders the languages line", () => {
    render(<PersonaPanel persona={PERSONA} bodyHtml="" slug="x" />);
    expect(screen.getByText(/en/i)).toBeInTheDocument();
  });

  it("renders the body html via SafeHtml", () => {
    render(<PersonaPanel persona={PERSONA} bodyHtml="<p>bio</p>" slug="x" />);
    expect(screen.getByText("bio")).toBeInTheDocument();
  });

  it("H148 fallback: null persona + bodyHtml renders plain body", () => {
    render(<PersonaPanel persona={null} bodyHtml="<p>raw</p>" slug="x" />);
    expect(screen.getByText("raw")).toBeInTheDocument();
  });

  it("renders the empty state when there is no persona at all", () => {
    render(<PersonaPanel persona={null} bodyHtml={null} slug="x" />);
    expect(screen.getAllByText(/persona/i).length).toBeGreaterThan(0);
  });
});
