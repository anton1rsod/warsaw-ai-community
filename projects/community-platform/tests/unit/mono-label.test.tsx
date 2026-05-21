import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MonoLabel } from "@/app/components/MonoLabel";

afterEach(cleanup);

describe("MonoLabel", () => {
  it("renders as <p> by default with voice font + uppercase + dust color", () => {
    render(<MonoLabel>// next meetup</MonoLabel>);
    const el = screen.getByText("// next meetup");
    expect(el.tagName).toBe("P");
    expect(el).toHaveClass("font-voice");
    expect(el).toHaveClass("uppercase");
    expect(el).toHaveClass("text-dust");
  });

  it("renders as alternate element via `as` prop", () => {
    render(<MonoLabel as="div">// row label</MonoLabel>);
    expect(screen.getByText("// row label").tagName).toBe("DIV");
  });

  it("renders as <span> when as='span'", () => {
    render(<MonoLabel as="span">// inline</MonoLabel>);
    expect(screen.getByText("// inline").tagName).toBe("SPAN");
  });
});
