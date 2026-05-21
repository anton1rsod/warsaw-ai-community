import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Footer } from "@/app/components/Footer";

afterEach(() => cleanup());

describe("Footer v0.6 — dark band, serif italic + mono links", () => {
  it("renders dark band with serif italic left + mono links right", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("bg-ink");
    expect(footer).toHaveClass("text-cream");
    expect(footer.className).toMatch(/font-display/);
    expect(footer.className).toMatch(/italic/);
  });

  it("includes built-in-public mono badge", () => {
    render(<Footer />);
    expect(screen.getByText(/built in public, MIT/i)).toBeInTheDocument();
  });

  it("preserves v0.4.2 a11y fix — no aria-label on empty div", () => {
    const { container } = render(<Footer />);
    const emptyDivs = Array.from(container.querySelectorAll("div"))
      .filter((d) => d.children.length === 0 && d.textContent === "");
    for (const d of emptyDivs) {
      expect(d.hasAttribute("aria-label")).toBe(false);
    }
  });

  it("uses i18n keys for all footer copy (H88)", () => {
    render(<Footer />);
    expect(screen.getByText(/about/i)).toBeInTheDocument();
    expect(screen.getByText(/telegram/i)).toBeInTheDocument();
    expect(screen.getByText(/github/i)).toBeInTheDocument();
    expect(screen.getByText(/license/i)).toBeInTheDocument();
  });
});

describe("Footer v0.6 — link wiring + external safety", () => {
  it("renders copyright text via chrome.footer.copyrightFmt", () => {
    render(<Footer />);
    expect(screen.getByText("© 2026 Warsaw AI Community")).toBeInTheDocument();
  });

  it("About links to /handbook (Phase A fallback per O5)", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: /about/i }).getAttribute("href"),
    ).toBe("/handbook");
  });

  it("Telegram + GitHub + License are external links with rel=noopener", () => {
    render(<Footer />);
    for (const label of [/telegram/i, /github/i, /license/i]) {
      const link = screen.getByRole("link", { name: label });
      expect(link.getAttribute("rel")).toMatch(/noopener/);
      expect(link.getAttribute("target")).toBe("_blank");
    }
  });
});
