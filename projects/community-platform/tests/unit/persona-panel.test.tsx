import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PersonaPanel } from "@/app/components/PersonaPanel";

describe("PersonaPanel", () => {
  it("renders sanitized HTML when persona present", () => {
    render(<PersonaPanel html="<h1>Alice</h1><p>PM</p>" slug="alice" />);
    expect(screen.getByRole("heading", { level: 1, name: /alice/i })).toBeInTheDocument();
    expect(screen.getByText(/pm/i)).toBeInTheDocument();
  });

  it("renders fallback when html is null", () => {
    render(<PersonaPanel html={null} slug="alice" />);
    expect(screen.getByText(/no persona yet/i)).toBeInTheDocument();
  });
});
