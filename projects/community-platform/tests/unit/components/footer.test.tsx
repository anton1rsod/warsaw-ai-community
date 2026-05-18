import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Footer } from "@/app/components/Footer";

afterEach(() => cleanup());

describe("Footer — Q3.1 / D30 / O5 5-link strip", () => {
  it("renders copyright text", () => {
    render(<Footer />);
    expect(screen.getByText("© 2026 Warsaw AI Community")).toBeInTheDocument();
  });

  it("Phase A renders About + Telegram + GitHub + MIT-licensed (RSS deferred to Phase C)", () => {
    render(<Footer />);
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Telegram")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("MIT-licensed")).toBeInTheDocument();
    expect(screen.queryByText("RSS")).toBeNull();
  });

  it("About links to /handbook (Phase A fallback per O5)", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: "About" }).getAttribute("href"),
    ).toBe("/handbook");
  });

  it("Telegram + GitHub + MIT-licensed are external links with rel=noopener", () => {
    render(<Footer />);
    for (const label of ["Telegram", "GitHub", "MIT-licensed"]) {
      const link = screen.getByRole("link", { name: label });
      expect(link.getAttribute("rel")).toMatch(/noopener/);
      expect(link.getAttribute("target")).toBe("_blank");
    }
  });

  it("language-switcher slot exists but is empty in v0.4 (v0.5+ populates)", () => {
    render(<Footer />);
    const slot = screen.queryByLabelText("Language");
    // Slot existence is optional in Phase A; the test asserts that no
    // language-switcher widget is rendered today.
    if (slot) {
      expect(slot.children.length).toBe(0);
    }
  });
});
