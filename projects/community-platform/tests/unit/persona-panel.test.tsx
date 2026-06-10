import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { PersonaPanel } from "@/app/components/PersonaPanel";

afterEach(cleanup);

describe("PersonaPanel", () => {
  it("renders sanitized HTML when persona present", () => {
    render(<PersonaPanel persona={null} bodyHtml="<h1>Alice</h1><p>PM</p>" slug="alice" />);
    expect(screen.getByRole("heading", { level: 1, name: /alice/i })).toBeInTheDocument();
    expect(screen.getByText(/pm/i)).toBeInTheDocument();
  });

  it("renders fallback when html is null", () => {
    render(<PersonaPanel persona={null} bodyHtml={null} slug="alice" />);
    expect(screen.getByText(/no persona yet/i)).toBeInTheDocument();
  });
});
