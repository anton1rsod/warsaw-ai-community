import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormalEntityMasthead } from "@/app/components/FormalEntityMasthead";

describe("FormalEntityMasthead (v0.7 brand v1.2 — §4.4)", () => {
  it("renders the caption 'Founded 2026 · Warsaw'", () => {
    const { container } = render(<FormalEntityMasthead />);
    expect(container.textContent ?? "").toMatch(/Founded 2026 . Warsaw/);
  });

  it("does NOT mention 'Polish Stowarzyszenie' (v1.2 dropped)", () => {
    const { container } = render(<FormalEntityMasthead />);
    expect(container.textContent ?? "").not.toMatch(/Stowarzyszenie/i);
  });

  it("renders the formal entity headline with the * superscript", () => {
    const { container } = render(<FormalEntityMasthead />);
    const text = container.textContent ?? "";
    expect(text).toMatch(/Professional Subploters/);
    expect(text).toMatch(/Association/);
    const sups = container.querySelectorAll("sup");
    // Two BrandStars: one in headline, one in subtitle
    expect(sups.length).toBeGreaterThanOrEqual(2);
  });

  it("renders the subtitle 'for founders writing their next plot.'", () => {
    const { container } = render(<FormalEntityMasthead />);
    expect(container.textContent ?? "").toMatch(/for founders writing their next plot\./);
  });

  it("does NOT mention 'venture studio' (v1.2 spec drop)", () => {
    const { container } = render(<FormalEntityMasthead />);
    expect(container.textContent ?? "").not.toMatch(/venture studio/i);
  });

  it("uses font-display (Geist via v0.8 token) on the headline", () => {
    const { container } = render(<FormalEntityMasthead />);
    const h1 = container.querySelector("h1");
    // v0.8 §4.2: font-geist token retired; font-display is the unified Geist token
    expect(h1?.className).toMatch(/font-display/);
  });
});
