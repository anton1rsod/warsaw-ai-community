import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("@/lib/env", () => ({
  env: { COMMUNITY_NAME: "Warsaw AI Community", COMMUNITY_SLUG: "warsaw-ai" },
}));
vi.mock("@/lib/content-snapshot", () => ({
  listMeetingsFromSnapshot: () => [],
  listEventsFromSnapshot: () => [],
  findMemberByHandle: () => undefined,
}));
// HomeHeader is an async server component tested separately in HomeHeader.test.tsx.
// Mock it here so HomePage renders synchronously without async child suspension.
vi.mock("@/app/components/HomeHeader", () => ({
  HomeHeader: () => (
    <header>
      <h1>Warsaw AI Community</h1>
      <nav aria-label="Account">
        <a href="/login">Sign in</a>
      </nav>
    </header>
  ),
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("ADR-0012: /home anonymous accessibility (v0.3.1 — header amended)", () => {
  it("renders feed + nav for anonymous visitor without throwing or redirecting", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue(null as never);
    const { default: HomePage } = await import("@/app/home/page");
    const ui = await HomePage();
    render(ui);
    // Headline ADR-0012 requirement: anonymous render works.
    expect(screen.getByText(/Nothing scheduled this week/i)).toBeInTheDocument();
    // Anonymous header surfaces sign-in CTA.
    expect(screen.getByRole("link", { name: /Sign in/i })).toBeInTheDocument();
  });

  it("renders the community name in the header", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue(null as never);
    const { default: HomePage } = await import("@/app/home/page");
    const ui = await HomePage();
    render(ui);
    expect(screen.getByRole("heading", { level: 1, name: /Warsaw AI Community/ })).toBeInTheDocument();
  });

  it("nav grid includes Members card (v0.3.1 — restored)", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue(null as never);
    const { default: HomePage } = await import("@/app/home/page");
    const ui = await HomePage();
    render(ui);
    // Within the page-level Sections nav, Members card is present.
    const sectionsNav = screen.getByRole("navigation", { name: /Sections/i });
    expect(sectionsNav).toHaveTextContent(/Members/);
  });
});
