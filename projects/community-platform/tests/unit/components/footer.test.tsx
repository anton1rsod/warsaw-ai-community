import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Footer } from "@/app/components/Footer";

afterEach(() => cleanup());

describe("Footer v0.8 — dark band, mono copyright + mono links", () => {
  it("renders dark band with mono copyright left + mono links right", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("bg-ink");
    expect(footer).toHaveClass("text-cream");
    // v0.8: copyright row is now mono (font-voice), no serif-italic
    const copyrightRow = footer.querySelector(".font-voice.text-\\[11px\\]") ??
      footer.querySelector("[class*='font-voice'][class*='11px']");
    expect(copyrightRow).not.toBeNull();
    expect(copyrightRow?.className).toMatch(/font-voice/);
    expect(copyrightRow?.className).not.toMatch(/font-display/);
    expect(copyrightRow?.className).not.toMatch(/\bitalic\b/);
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
    const { container } = render(<Footer />);
    expect(container.textContent).toMatch(/© 2026 Subploters/);
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

describe("Footer — v0.7 brand v1.2 wire-in (chat-41)", () => {
  it("renders the formal entity line above the copyright row", () => {
    const { container } = render(<Footer />);
    const text = container.textContent ?? "";
    expect(text).toMatch(/Professional Subploters/);
    expect(text).toMatch(/Association/);
  });

  it("does NOT render 'built in public, MIT' (deleted in v0.7)", () => {
    const { container } = render(<Footer />);
    expect(container.textContent ?? "").not.toMatch(/built in public/i);
  });

  it("renders the brand-signature * on the copyright (Subploters*)", () => {
    const { container } = render(<Footer />);
    const sups = container.querySelectorAll("sup");
    // Two BrandStars expected: one in formal entity line, one in copyright
    expect(sups.length).toBeGreaterThanOrEqual(2);
    // All BrandStars are aria-hidden (H93)
    sups.forEach((sup) => {
      expect(sup.getAttribute("aria-hidden")).toBe("true");
    });
  });

  it("formal entity line uses font-voice caps treatment (JetBrains Mono)", () => {
    const { container } = render(<Footer />);
    const formalLine = container.querySelector("[data-testid='formal-entity-line']");
    expect(formalLine).not.toBeNull();
    expect(formalLine?.className).toMatch(/font-voice/);
    expect(formalLine?.className).toMatch(/uppercase/);
  });
});
