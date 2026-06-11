import { render, screen, cleanup } from "@testing-library/react";
import { describe, expect, it, afterEach } from "vitest";
import { MemberKicker } from "@/app/components/MemberKicker";

afterEach(cleanup);

describe("MemberKicker (H157 — kickers ARE the headings)", () => {
  it("renders a level-2 heading whose accessible name excludes the // prefix", () => {
    render(<MemberKicker label="Expertise" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Expertise" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /\/\// })).toBeNull();
  });

  it("is never aria-hidden and has no sr-only twin (single-element semantics)", () => {
    const { container } = render(<MemberKicker label="Expertise" />);
    const h2 = container.querySelector("h2");
    expect(h2?.getAttribute("aria-hidden")).toBeNull();
    expect(container.querySelector(".sr-only")).toBeNull();
    expect(container.querySelectorAll("h2").length).toBe(1);
  });

  it("renders the decorative // prefix inside an aria-hidden span", () => {
    const { container } = render(<MemberKicker label="Expertise" />);
    const prefix = container.querySelector('h2 > span[aria-hidden="true"]');
    expect(prefix?.textContent).toBe("// ");
  });

  it("uppercases via CSS text-transform over sentence-case source text", () => {
    const { container } = render(<MemberKicker label="Evaluation posture" />);
    const h2 = container.querySelector("h2");
    expect(h2?.textContent).toBe("// Evaluation posture");
    expect(h2?.className).toContain("uppercase");
    expect(h2?.className).toContain("font-voice");
    expect(h2?.className).toContain("text-dust");
  });

  it("carries the ≥1080px marginalia classes (right-aligned catalog label)", () => {
    const { container } = render(<MemberKicker label="Story" />);
    const cls = container.querySelector("h2")?.className ?? "";
    expect(cls).toContain("min-[1080px]:absolute");
    expect(cls).toContain("min-[1080px]:-left-[164px]");
    expect(cls).toContain("min-[1080px]:w-[140px]");
    expect(cls).toContain("min-[1080px]:text-right");
  });

  it("forwards an optional id (aria-labelledby target for region callers)", () => {
    render(<MemberKicker label="Overlap" id="lens-kicker" />);
    expect(screen.getByRole("heading", { level: 2 }).id).toBe("lens-kicker");
  });
});
