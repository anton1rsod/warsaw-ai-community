import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AmberTag } from "@/app/components/AmberTag";

afterEach(cleanup);

describe("AmberTag", () => {
  it("renders children inside a span with amber bg + tilt", () => {
    render(<AmberTag>tonight.</AmberTag>);
    const el = screen.getByText("tonight.");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveClass("bg-accent-500");
    expect(el.className).toMatch(/-rotate-\[1\.5deg\]/);
    expect(el).toHaveClass("inline-block");
  });

  it("forwards className prop", () => {
    render(<AmberTag className="text-2xl">hi</AmberTag>);
    expect(screen.getByText("hi")).toHaveClass("text-2xl");
  });
});
