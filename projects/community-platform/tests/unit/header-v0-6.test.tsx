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
  it("renders mono strip with warsaw.ai logo + nav with middots", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(await Header());
    expect(screen.getByText("warsaw.ai")).toBeInTheDocument();
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
    expect(header?.className).toMatch(/font-voice/);
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
  it("shows [ sign in ] when no session", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(await Header());
    expect(screen.getByText("[ sign in ]")).toBeInTheDocument();
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
    expect(screen.queryByText("[ sign in ]")).not.toBeInTheDocument();
    // The handle (or "@handle") must appear somewhere in the signed-in chrome.
    const matches = screen.getAllByText(/anton1rsod/);
    expect(matches.length).toBeGreaterThan(0);
  });
});
