/**
 * v0.6 Phase 2.2 — HeaderMobileMenu cream + mono restyle tests.
 *
 * Asserts the v0.6 palette + mono nav contracts on the mobile slide-in panel.
 * H58 hydration-stability lock (the `useEffect` shape) is enforced by the v0.4
 * baseline test in `tests/unit/components/header.test.tsx` + the E2E in
 * `e2e/v0-4-shell.spec.ts`; this file focuses on the v0.6 visual contract:
 *
 *   - Backdrop: bg-ink/40
 *   - Panel: bg-cream + text-ink
 *   - Nav links: font-voice + text-[12px] + uppercase
 *   - Active-page indicator: text-accent-500 (H90 parity with desktop Header)
 *   - Hamburger trigger: aria-label resolves from i18n
 *   - Open/close behavior: backdrop click + ESC + hamburger toggle
 */

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { Route } from "next";
import { HeaderMobileMenu } from "@/app/components/HeaderMobileMenu";

afterEach(() => cleanup());

const NAV: { href: Route; label: string; current?: boolean }[] = [
  { href: "/" as Route, label: "home" },
  { href: "/calendar" as Route, label: "calendar", current: true },
  { href: "/projects" as Route, label: "projects" },
  { href: "/members" as Route, label: "members" },
  { href: "/handbook" as Route, label: "handbook" },
];

function openPanel(): void {
  const trigger = screen.getByRole("button", { name: /menu/i });
  fireEvent.click(trigger);
}

describe("HeaderMobileMenu — v0.6 palette", () => {
  it("renders hamburger trigger with aria-label from i18n", () => {
    render(<HeaderMobileMenu navItems={NAV} />);
    const trigger = screen.getByRole("button", { name: /menu/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens the panel on hamburger click and updates aria-expanded", () => {
    render(<HeaderMobileMenu navItems={NAV} />);
    openPanel();
    const trigger = screen.getByRole("button", { name: /close menu/i });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("applies bg-ink/40 to the backdrop when open", () => {
    const { container } = render(<HeaderMobileMenu navItems={NAV} />);
    openPanel();
    const backdrop = container.querySelector("div.fixed.inset-0");
    expect(backdrop?.className).toMatch(/bg-ink\/40/);
  });

  it("applies bg-cream + text-ink to the panel", () => {
    render(<HeaderMobileMenu navItems={NAV} />);
    openPanel();
    const panel = screen.getByRole("navigation", { name: /menu/i });
    expect(panel.className).toMatch(/bg-cream/);
    expect(panel.className).toMatch(/text-ink/);
  });
});

describe("HeaderMobileMenu — v0.6 mono nav", () => {
  it("renders nav items with font-voice + uppercase + text-[12px]", () => {
    render(<HeaderMobileMenu navItems={NAV} />);
    openPanel();
    const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink.className).toMatch(/font-voice/);
    expect(homeLink.className).toMatch(/uppercase/);
    expect(homeLink.className).toMatch(/text-\[12px\]/);
  });

  it("preserves lowercase label text from i18n (case lives in CSS, not data)", () => {
    render(<HeaderMobileMenu navItems={NAV} />);
    openPanel();
    // Label is "home" lowercase; uppercase rendering is a CSS transform.
    expect(screen.getByRole("link", { name: /home/i }).textContent).toBe("home");
    expect(screen.getByRole("link", { name: /calendar/i }).textContent).toBe(
      "calendar",
    );
  });

  it("links route to the correct hrefs", () => {
    render(<HeaderMobileMenu navItems={NAV} />);
    openPanel();
    expect(
      screen.getByRole("link", { name: /^home$/i }).getAttribute("href"),
    ).toBe("/");
    expect(
      screen.getByRole("link", { name: /^calendar$/i }).getAttribute("href"),
    ).toBe("/calendar");
  });
});

describe("HeaderMobileMenu — v0.6 H90 active-page indicator", () => {
  it("applies text-accent-500 to the active nav link", () => {
    render(<HeaderMobileMenu navItems={NAV} />);
    openPanel();
    const active = screen.getByRole("link", { name: /^calendar$/i });
    expect(active.className).toMatch(/text-accent-500/);
  });

  it("does NOT apply unconditional text-accent-500 to non-active nav links", () => {
    render(<HeaderMobileMenu navItems={NAV} />);
    openPanel();
    const inactive = screen.getByRole("link", { name: /^home$/i });
    // Inactive links use `text-ink` as the base color; the only `text-accent-500`
    // utility on this link is the `hover:text-accent-500` prefix variant.
    // Assert: there is no UNPREFIXED `text-accent-500` class token on the link.
    const tokens = inactive.className.split(/\s+/);
    expect(tokens).toContain("text-ink");
    expect(tokens).not.toContain("text-accent-500");
  });
});

describe("HeaderMobileMenu — close behavior (v0.4 H58 preserved)", () => {
  it("closes the panel on backdrop click", () => {
    const { container } = render(<HeaderMobileMenu navItems={NAV} />);
    openPanel();
    expect(screen.getByRole("button", { name: /close menu/i })).toBeInTheDocument();
    const backdrop = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    fireEvent.click(backdrop);
    expect(
      screen.getByRole("button", { name: /^menu$/i }).getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("closes the panel on Escape keydown", () => {
    render(<HeaderMobileMenu navItems={NAV} />);
    openPanel();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(
      screen.getByRole("button", { name: /^menu$/i }).getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("closes the panel when a nav link is clicked", () => {
    render(<HeaderMobileMenu navItems={NAV} />);
    openPanel();
    const link = screen.getByRole("link", { name: /^home$/i });
    fireEvent.click(link);
    expect(
      screen.getByRole("button", { name: /^menu$/i }).getAttribute("aria-expanded"),
    ).toBe("false");
  });
});
