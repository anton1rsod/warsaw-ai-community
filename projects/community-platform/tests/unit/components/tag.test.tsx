import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Tag } from "@/app/components/Tag";

afterEach(() => cleanup());

describe("Tag — O12 color map", () => {
  it("stage:active renders neutral background, neutral-700 text", () => {
    render(<Tag label="Active" variant="stage" value="active" />);
    const el = screen.getByText("Active");
    expect(el.className).toMatch(/bg-neutral-100/);
    expect(el.className).toMatch(/text-neutral-700/);
    expect(el.className).not.toMatch(/accent/);
  });

  it("stage:complete renders de-emphasized neutral-500 text", () => {
    render(<Tag label="Complete" variant="stage" value="complete" />);
    expect(screen.getByText("Complete").className).toMatch(/text-neutral-500/);
  });

  it("stage:paused renders de-emphasized neutral-500 text", () => {
    render(<Tag label="Paused" variant="stage" value="paused" />);
    expect(screen.getByText("Paused").className).toMatch(/text-neutral-500/);
  });

  it("status:accepted renders neutral background, neutral-700 text", () => {
    render(<Tag label="Accepted" variant="status" value="accepted" />);
    const el = screen.getByText("Accepted");
    expect(el.className).toMatch(/bg-neutral-100/);
    expect(el.className).toMatch(/text-neutral-700/);
  });

  it("status:proposed is THE accent-tinted variant (the single Q4.8 exception)", () => {
    render(<Tag label="Proposed" variant="status" value="proposed" />);
    const el = screen.getByText("Proposed");
    expect(el.className).toMatch(/bg-accent-50/);
    expect(el.className).toMatch(/text-accent-700/);
  });

  it("status:superseded renders strikethrough + de-emphasized neutral-400", () => {
    render(<Tag label="Superseded" variant="status" value="superseded" />);
    const el = screen.getByText("Superseded");
    expect(el.className).toMatch(/line-through/);
    expect(el.className).toMatch(/text-neutral-400/);
  });

  it("type:weekly | special | workshop all render neutral", () => {
    for (const value of ["weekly", "special", "workshop"] as const) {
      render(<Tag label={value} variant="type" value={value} />);
      const el = screen.getByText(value);
      expect(el.className).toMatch(/bg-neutral-100/);
      expect(el.className).toMatch(/text-neutral-700/);
      cleanup();
    }
  });

  it("variant omitted defaults to neutral", () => {
    render(<Tag label="Generic" />);
    expect(screen.getByText("Generic").className).toMatch(/bg-neutral-100/);
  });
});
