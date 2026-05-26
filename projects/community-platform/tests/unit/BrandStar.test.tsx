import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandStar } from "@/app/components/BrandStar";

describe("BrandStar (v0.7 brand v1.2 — H93 aria-hidden, brand.md §3 plain-text *)", () => {
  it("renders an asterisk inside a <sup> element", () => {
    const { container } = render(<BrandStar />);
    const sup = container.querySelector("sup");
    expect(sup).not.toBeNull();
    expect(sup?.textContent).toBe("*");
  });

  it("is hidden from screen readers (H93 — brand-signature is decorative)", () => {
    const { container } = render(<BrandStar />);
    const sup = container.querySelector("sup");
    expect(sup?.getAttribute("aria-hidden")).toBe("true");
  });

  it("applies amber color by default", () => {
    const { container } = render(<BrandStar />);
    const sup = container.querySelector("sup");
    expect(sup?.getAttribute("style")).toMatch(/color:\s*#f59e0b/i);
  });

  it("applies superscript geometry per brand.md §3", () => {
    const { container } = render(<BrandStar />);
    const sup = container.querySelector("sup");
    const style = sup?.getAttribute("style") ?? "";
    expect(style).toMatch(/font-size:\s*0\.55em/);
    expect(style).toMatch(/vertical-align:\s*0\.55em/);
    expect(style).toMatch(/margin-left:\s*0\.05em/);
    expect(style).toMatch(/line-height:\s*0/);
  });

  it("accepts a color override for non-cream backgrounds", () => {
    const { container } = render(<BrandStar color="#1a1a2e" />);
    const sup = container.querySelector("sup");
    expect(sup?.getAttribute("style")).toMatch(/color:\s*#1a1a2e/i);
  });
});
