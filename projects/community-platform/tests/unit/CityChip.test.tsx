import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CityChip } from "@/app/components/CityChip";

describe("CityChip (v0.7 brand v1.2 — §4.3 chrome variant)", () => {
  it("renders the city name in uppercase", () => {
    const { getByText } = render(<CityChip city="Warsaw" />);
    expect(getByText("WARSAW")).toBeTruthy();
  });

  it("does NOT include 'PSA ·' prefix (chrome variant)", () => {
    const { container } = render(<CityChip city="Warsaw" />);
    expect(container.textContent).not.toMatch(/PSA/);
  });

  it("renders with amber background + ink text (Tailwind tokens)", () => {
    const { container } = render(<CityChip city="Warsaw" />);
    const chip = container.firstElementChild as HTMLElement;
    expect(chip.className).toMatch(/bg-accent-500/);
    expect(chip.className).toMatch(/text-ink/);
  });

  it("renders as JetBrains Mono caps with §4.3 letter-spacing (font-voice)", () => {
    const { container } = render(<CityChip city="Warsaw" />);
    const chip = container.firstElementChild as HTMLElement;
    expect(chip.className).toMatch(/font-voice/);
    expect(chip.className).toMatch(/uppercase/);
  });

  it("is upright (chrome variant — no rotation)", () => {
    const { container } = render(<CityChip city="Warsaw" />);
    const chip = container.firstElementChild as HTMLElement;
    expect(chip.getAttribute("style") ?? "").not.toMatch(/rotate/);
  });

  it("has zero border-radius (§4.3)", () => {
    const { container } = render(<CityChip city="Warsaw" />);
    const chip = container.firstElementChild as HTMLElement;
    expect(chip.getAttribute("style") ?? "").toMatch(/border-radius:\s*0/);
  });
});
