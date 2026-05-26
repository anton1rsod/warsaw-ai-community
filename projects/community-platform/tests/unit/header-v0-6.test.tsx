/**
 * v0.6 Phase 2.1 — Header rewrite tests.
 *
 * Supplements `tests/unit/components/header.test.tsx` (v0.4 baseline). Covers:
 *
 *   - Mono strip palette + warsaw.ai logo + lowercase nav + middot separators
 *   - H90 active-page indicator computed from `headers().get('x-pathname')`
 *   - anon vs signed-in chrome distinction
 *
 * v0.4 contracts (H56 / H64 / H66 / skip-to-content) remain covered by the
 * v0.4 baseline file; this file ONLY adds the v0.6-specific behavior.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Header } from "@/app/components/Header";

afterEach(() => cleanup());

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Map([["x-pathname", "/calendar"]])),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: vi.fn(),
}));

const { auth } = await import("@/lib/auth");
const { findMemberByHandle } = await import("@/lib/content-snapshot");

describe("Header v0.6 — mono strip chrome", () => {
  it("renders mono strip with Subploters lockup + nav with middots", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(await Header());
    // v1.1 brand (chat-38): logo is the path-drawn Subploters lockup (dark variant for bg-ink header).
    const logo = screen.getByRole("link", { name: /Subploters/ });
    expect(logo.querySelector("img")?.getAttribute("src")).toBe(
      "/branding/subploters-lockup-dark.svg",
    );
    const nav = screen.getByRole("navigation", { name: /primary/i });
    expect(nav).toHaveTextContent(/home/i);
    expect(nav).toHaveTextContent(/calendar/i);
    expect(nav).toHaveTextContent(/members/i);
    // middot separators present between nav items
    const middots = nav.querySelectorAll('[aria-hidden="true"]');
    expect(middots.length).toBeGreaterThan(0);
  });

  it("applies v0.6 chrome tokens to the header element", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const { container } = render(await Header());
    const header = container.querySelector("header");
    expect(header?.className).toMatch(/bg-ink/);
    expect(header?.className).toMatch(/text-cream/);
    // v0.8 §4.2: font-geist token retired; header now uses font-display (= Geist)
    expect(header?.className).toMatch(/font-display/);
  });
});

describe("Header v0.6 — H90: active-page indicator from headers()", () => {
  it("renders the current page in amber via x-pathname", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(await Header());
    // x-pathname is mocked to /calendar above
    const current = screen.getByRole("link", { name: /^calendar$/ });
    expect(current.className).toMatch(/text-accent-500/);
  });

  it("does NOT mark non-active pages in amber", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(await Header());
    const homeLink = screen.getByRole("link", { name: /^home$/ });
    expect(homeLink.className).not.toMatch(/text-accent-500/);
    expect(homeLink.className).toMatch(/text-cream/);
  });
});

describe("Header v0.6 — anon vs signed-in", () => {
  it("shows sign in when no session", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(await Header());
    expect(screen.getByText("sign in")).toBeInTheDocument();
  });

  it("shows avatar chip + handle when signed in", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      githubHandle: "anton1rsod",
    });
    (findMemberByHandle as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      slug: "anton-safronov",
      handle: "anton1rsod",
      name: "Anton Safronov",
    });
    render(await Header());
    expect(screen.queryByText("sign in")).not.toBeInTheDocument();
    // The handle (or "@handle") must appear somewhere in the signed-in chrome.
    const matches = screen.getAllByText(/anton1rsod/);
    expect(matches.length).toBeGreaterThan(0);
  });
});

describe("Header — v0.7 brand v1.2 wire-in (chat-41)", () => {
  it("renders the WARSAW city chip next to the lockup", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const { findByText } = render(await Header({ activePath: "/" }));
    const chip = await findByText("Warsaw");
    expect(chip).toBeTruthy();
    // H95 — chip is rendered via CityChip (JetBrains Mono via font-voice)
    expect(chip.className).toMatch(/font-voice/);
  });

  it("does NOT wrap sign-in text in brackets (Geist sans treatment)", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const { findByText, queryByText } = render(await Header({ activePath: "/" }));
    await findByText("sign in");
    expect(queryByText("[ sign in ]")).toBeNull();
  });

  it("uses font-display (Geist via v0.8 token) on the parent header, not font-voice", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    const { container } = render(await Header({ activePath: "/" }));
    const header = container.querySelector("header");
    // v0.8 §4.2: font-geist token retired; font-display is the unified Geist token
    expect(header?.className).toMatch(/font-display/);
    expect(header?.className).not.toMatch(/font-voice/);
    expect(header?.className).not.toMatch(/font-geist/);
  });
});
