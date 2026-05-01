import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SafeHtml } from "@/app/components/SafeHtml";

describe("SafeHtml", () => {
  it("renders pre-sanitized HTML", () => {
    const { container } = render(<SafeHtml html="<p>Hello</p>" />);
    expect(container.querySelector("p")?.textContent).toBe("Hello");
  });

  it("applies className to wrapper", () => {
    const { container } = render(<SafeHtml html="<p>x</p>" className="prose" />);
    expect(container.firstChild).toHaveClass("prose");
  });
});
