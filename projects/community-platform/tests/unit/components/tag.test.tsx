import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Tag } from "@/app/components/Tag";

afterEach(() => cleanup());

describe("H100: Tag warm reskin", () => {
  const src = readFileSync(resolve(__dirname, "../../../app/components/Tag.tsx"), "utf8");
  it("drops neutral-* and rounded scaffolding", () => {
    expect(src).not.toMatch(/\bneutral-/);
    expect(src).not.toMatch(/\brounded\b/);
  });
  it("keeps O12: status:proposed is the only accent-tinted value", () => {
    const proposed = render(<Tag label="proposed" variant="status" value="proposed" />).container.firstChild as HTMLElement;
    expect(proposed.className).toMatch(/accent/);
    const other = render(<Tag label="accepted" variant="status" value="accepted" />).container.firstChild as HTMLElement;
    expect(other.className).not.toMatch(/accent/);
  });
});

describe("Tag — O12 color map (v0.9 warm tokens)", () => {
  it("stage:active renders warm cream-deep background, ink text", () => {
    render(<Tag label="Active" variant="stage" value="active" />);
    const el = screen.getByText("Active");
    expect(el.className).toMatch(/bg-cream-deep/);
    expect(el.className).toMatch(/text-ink/);
    expect(el.className).not.toMatch(/accent/);
  });

  it("stage:complete renders de-emphasized dust text", () => {
    render(<Tag label="Complete" variant="stage" value="complete" />);
    expect(screen.getByText("Complete").className).toMatch(/text-dust/);
  });

  it("stage:paused renders de-emphasized dust text", () => {
    render(<Tag label="Paused" variant="stage" value="paused" />);
    expect(screen.getByText("Paused").className).toMatch(/text-dust/);
  });

  it("status:accepted renders cream-deep background, ink text", () => {
    render(<Tag label="Accepted" variant="status" value="accepted" />);
    const el = screen.getByText("Accepted");
    expect(el.className).toMatch(/bg-cream-deep/);
    expect(el.className).toMatch(/text-ink/);
  });

  it("status:proposed is THE accent-tinted variant (the single Q4.8 exception)", () => {
    render(<Tag label="Proposed" variant="status" value="proposed" />);
    const el = screen.getByText("Proposed");
    expect(el.className).toMatch(/bg-accent-50/);
    expect(el.className).toMatch(/text-accent-700/);
  });

  it("status:superseded renders strikethrough + de-emphasized dust text", () => {
    render(<Tag label="Superseded" variant="status" value="superseded" />);
    const el = screen.getByText("Superseded");
    expect(el.className).toMatch(/line-through/);
    expect(el.className).toMatch(/text-dust/);
  });

  it("type:weekly | special | workshop all render warm neutral", () => {
    for (const value of ["weekly", "special", "workshop"] as const) {
      render(<Tag label={value} variant="type" value={value} />);
      const el = screen.getByText(value);
      expect(el.className).toMatch(/bg-cream-deep/);
      expect(el.className).toMatch(/text-ink/);
      cleanup();
    }
  });

  it("variant omitted defaults to warm neutral", () => {
    render(<Tag label="Generic" />);
    expect(screen.getByText("Generic").className).toMatch(/bg-cream-deep/);
  });
});
