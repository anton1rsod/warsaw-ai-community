import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Header } from "@/app/components/Header";

afterEach(() => cleanup());

// v0.8.1 (chat-44): active-page indicator moved client-side via
// `usePathname()` in HeaderNav + HeaderMobileMenu. The legacy `next/headers`
// mock is no longer the source of truth for the active state but is kept here
// as a defensive no-op (some test branches may still indirectly touch it).
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Map([["x-pathname", "/"]])),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: vi.fn(),
  isAdmin: vi.fn().mockReturnValue(false),
}));

const { auth } = await import("@/lib/auth");
const { findMemberByHandle } = await import("@/lib/content-snapshot");
const { usePathname } = await import("next/navigation");

describe("Header — anonymous render", () => {
  it("shows sign in link when no session", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(await Header());
    // v0.7 Geist-sans treatment: plain "sign in" (no brackets); v0.6 copy was bracketed.
    expect(screen.getByText("sign in")).toBeInTheDocument();
    expect(screen.queryByLabelText("Account")).toBeNull();
  });

  it("renders wordmark linking to /", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(await Header());
    // v1.1 brand (chat-38): logo is the path-drawn Subploters inline-fused lockup (dark variant).
    const wordmark = screen.getByRole("link", { name: /Subploters/ });
    expect(wordmark.getAttribute("href")).toBe("/");
    const img = wordmark.querySelector("img");
    expect(img?.getAttribute("src")).toBe("/branding/subploters-lockup-dark.svg");
    expect(img?.getAttribute("alt")).toBe("Subploters");
  });

  it("renders 5-item top nav (Q2.1)", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(await Header());
    // v0.6 nav labels are lowercase per chrome.header.nav.* i18n keys.
    const navLinks = screen
      .getAllByRole("link")
      .filter((l) => /^(home|calendar|projects|members|handbook)$/.test(l.textContent || ""));
    expect(navLinks).toHaveLength(5);
    expect(navLinks.map((l) => l.textContent)).toEqual([
      "home",
      "calendar",
      "projects",
      "members",
      "handbook",
    ]);
  });
});

describe("H58: header auth-state stability + dropdown shape (Q2.4)", () => {
  it("shows account dropdown with exactly 4 items (Q2.4)", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      githubHandle: "anton1rsod",
    });
    (findMemberByHandle as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      slug: "anton-safronov",
      handle: "anton1rsod",
      name: "Anton Safronov",
    });
    render(await Header());
    const account = screen.getByLabelText("Account");
    expect(account).toBeInTheDocument();
    const dropdownItems = screen.getAllByRole("menuitem");
    expect(dropdownItems).toHaveLength(4);
    expect(dropdownItems[0]?.textContent).toMatch(/@anton1rsod/);
    // v0.6 lowercase labels per chrome.header.dropdown.* i18n keys.
    expect(dropdownItems[1]?.textContent).toBe("your week");
    expect(dropdownItems[2]?.textContent).toBe("edit profile");
    expect(dropdownItems[3]?.textContent).toBe("sign out");
  });

  it("does NOT render 'Members' in the dropdown (drops v0.3.1's 5th item)", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      githubHandle: "anton1rsod",
    });
    (findMemberByHandle as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      slug: "anton-safronov",
      handle: "anton1rsod",
      name: "Anton Safronov",
    });
    render(await Header());
    const dropdownItems = screen
      .getAllByRole("menuitem")
      .map((item) => item.textContent);
    expect(dropdownItems).not.toContain("members");
    expect(dropdownItems).not.toContain("Members");
  });
});

describe("Header — signed-in render (chrome only)", () => {
  it("renders signed-in chrome with the handle visible", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      githubHandle: "anton1rsod",
    });
    (findMemberByHandle as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      slug: "anton-safronov",
      handle: "anton1rsod",
      name: "Anton Safronov",
    });
    render(await Header());
    // v0.6 replaces the 32px Avatar trigger with an 18px amber initial chip
    // alongside the handle text inside the dropdown trigger button.
    const account = screen.getByLabelText("Account");
    expect(account.textContent).toMatch(/anton1rsod/);
  });
});

describe("H65: skip-to-content link", () => {
  it("renders skip-to-content as first focusable element", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    render(await Header());
    const skip = screen.getByText("Skip to content");
    expect(skip).toBeInTheDocument();
    expect(skip.getAttribute("href")).toBe("#main");
    expect(skip.className).toMatch(/sr-only|focus:not-sr-only/);
  });
});

describe("Header — current-page state (v0.8.1: usePathname-driven)", () => {
  it("applies accent-500 highlight to the active nav link when usePathname matches", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue("/calendar");
    render(await Header());
    const active = screen.getByRole("link", { name: /^calendar$/ });
    // v0.6 active-page indicator (H90) — amber text (text-accent-500), no underline.
    // v0.8.1: source-of-truth migrated from headers() to usePathname() so soft
    // `<Link>` navigation re-evaluates without re-rendering the cached layout.
    expect(active.className).toMatch(/accent-500/);
  });

  it("re-evaluates the active link when usePathname changes (soft-nav contract)", async () => {
    (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
    (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValueOnce("/members");
    render(await Header());
    const active = screen.getByRole("link", { name: /^members$/ });
    expect(active.className).toMatch(/accent-500/);
  });
});
