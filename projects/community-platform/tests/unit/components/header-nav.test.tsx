/**
 * v0.8.1 (chat-44 followup) — HeaderNav client-side active-page reactivity.
 *
 * Replaces the v0.6 server-side `headers().get("x-pathname")` approach with a
 * `usePathname()`-driven Client Component so the active link stays correct
 * across Next.js soft `<Link>` navigations (cached root layout would
 * otherwise pin the indicator to the first hard-nav pathname).
 *
 * Tests mock `next/navigation.usePathname` to simulate each path the matcher
 * should recognize.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { HeaderNav } from "@/app/components/HeaderNav";
import type { Route } from "next";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

const { usePathname } = await import("next/navigation");
const mockedUsePathname = vi.mocked(usePathname);

afterEach(() => {
  cleanup();
  mockedUsePathname.mockReset();
});

const NAV_ITEMS = [
  { key: "home", href: "/" as Route, label: "home" },
  { key: "calendar", href: "/calendar" as Route, label: "calendar" },
  { key: "projects", href: "/projects" as Route, label: "projects" },
  { key: "members", href: "/members" as Route, label: "members" },
  { key: "handbook", href: "/handbook" as Route, label: "handbook" },
];

describe("HeaderNav v0.8.1 — client-side active-page indicator", () => {
  it("marks home as active when pathname is '/'", () => {
    mockedUsePathname.mockReturnValue("/");
    render(<HeaderNav items={NAV_ITEMS} />);
    expect(
      screen.getByRole("link", { name: /^home$/ }).className,
    ).toMatch(/text-accent-500/);
    expect(
      screen.getByRole("link", { name: /^calendar$/ }).className,
    ).not.toMatch(/text-accent-500/);
  });

  it("marks home as active when pathname is '/home' (signed-in landing)", () => {
    mockedUsePathname.mockReturnValue("/home");
    render(<HeaderNav items={NAV_ITEMS} />);
    expect(
      screen.getByRole("link", { name: /^home$/ }).className,
    ).toMatch(/text-accent-500/);
  });

  it("marks calendar as active when on /calendar", () => {
    mockedUsePathname.mockReturnValue("/calendar");
    render(<HeaderNav items={NAV_ITEMS} />);
    expect(
      screen.getByRole("link", { name: /^calendar$/ }).className,
    ).toMatch(/text-accent-500/);
    expect(
      screen.getByRole("link", { name: /^home$/ }).className,
    ).not.toMatch(/text-accent-500/);
  });

  it("marks projects as active on a nested /projects/[slug] route", () => {
    mockedUsePathname.mockReturnValue("/projects/community-platform");
    render(<HeaderNav items={NAV_ITEMS} />);
    expect(
      screen.getByRole("link", { name: /^projects$/ }).className,
    ).toMatch(/text-accent-500/);
  });

  it("renders no link as active when pathname is empty (defensive guard)", () => {
    // Current next/navigation types declare `usePathname(): string`; the
    // `!pathname` guard in isCurrent() also covers the empty-string case,
    // which is what we simulate here. (Older Next.js declared it as
    // `string | null` — guard retained for defense-in-depth.)
    mockedUsePathname.mockReturnValue("");
    render(<HeaderNav items={NAV_ITEMS} />);
    for (const item of NAV_ITEMS) {
      expect(
        screen.getByRole("link", { name: new RegExp(`^${item.label}$`) }).className,
      ).not.toMatch(/text-accent-500/);
    }
  });

  it("renders middot separators between nav items (v0.6 chrome)", () => {
    mockedUsePathname.mockReturnValue("/");
    render(<HeaderNav items={NAV_ITEMS} />);
    const nav = screen.getByRole("navigation", { name: /primary/i });
    const middots = nav.querySelectorAll('[aria-hidden="true"]');
    // N items → N-1 middot separators.
    expect(middots.length).toBe(NAV_ITEMS.length - 1);
  });

  it("inactive links carry the cream + hover-opacity classes (v0.6 contract)", () => {
    mockedUsePathname.mockReturnValue("/calendar");
    render(<HeaderNav items={NAV_ITEMS} />);
    const home = screen.getByRole("link", { name: /^home$/ });
    expect(home.className).toMatch(/text-cream/);
    expect(home.className).toMatch(/opacity-85/);
    expect(home.className).toMatch(/hover:opacity-100/);
  });
});
