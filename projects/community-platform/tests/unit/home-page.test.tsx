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
  findMemberByHandle: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("ADR-0012: /home anonymous accessibility (v0.4 — HomeHeader dropped)", () => {
  it("renders feed for anonymous visitor without throwing or redirecting", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue(null as never);
    const { default: HomePage } = await import("@/app/home/page");
    const ui = await HomePage();
    render(ui);
    // Headline ADR-0012 requirement: anonymous render works.
    expect(screen.getByText(/Nothing scheduled this week/i)).toBeInTheDocument();
  });

  it("anonymous render does NOT mount YourWeekPane", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue(null as never);
    const { default: HomePage } = await import("@/app/home/page");
    const ui = await HomePage();
    render(ui);
    expect(screen.queryByText("Your week")).toBeNull();
  });

  it("anonymous render does NOT include Sections nav (global Header supersedes)", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue(null as never);
    const { default: HomePage } = await import("@/app/home/page");
    const ui = await HomePage();
    render(ui);
    expect(screen.queryByRole("navigation", { name: /Sections/i })).toBeNull();
  });
});

describe("/home — signed-in Your week pane (Phase A.2.4 / Q1.3 / D25)", () => {
  it("signed-in render mounts YourWeekPane above HomeFeed", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    const { findMemberByHandle } = await import("@/lib/content-snapshot");
    vi.mocked(findMemberByHandle).mockReturnValue({
      slug: "anton-safronov",
      name: "Anton Safronov",
      githubHandle: "anton1rsod",
    } as never);
    const { default: HomePage } = await import("@/app/home/page");
    const ui = await HomePage();
    render(ui);
    expect(screen.getByText("Your week")).toBeInTheDocument();
  });

  it("signed-in render still shows the feed", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    const { findMemberByHandle } = await import("@/lib/content-snapshot");
    vi.mocked(findMemberByHandle).mockReturnValue({
      slug: "anton-safronov",
      name: "Anton Safronov",
      githubHandle: "anton1rsod",
    } as never);
    const { default: HomePage } = await import("@/app/home/page");
    const ui = await HomePage();
    render(ui);
    expect(screen.getByText(/Nothing scheduled this week/i)).toBeInTheDocument();
  });

  it("§14.6 forward-defense: signed-in render DOM has no streak/missed copy", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    const { findMemberByHandle } = await import("@/lib/content-snapshot");
    vi.mocked(findMemberByHandle).mockReturnValue({
      slug: "anton-safronov",
      name: "Anton Safronov",
      githubHandle: "anton1rsod",
    } as never);
    const { default: HomePage } = await import("@/app/home/page");
    const ui = await HomePage();
    const { container } = render(ui);
    expect(container.textContent || "").not.toMatch(
      /streak|missed|don't break the chain/i,
    );
  });

  it("session exists but member not on roster — YourWeekPane NOT mounted", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue({ githubHandle: "stranger" } as never);
    const { findMemberByHandle } = await import("@/lib/content-snapshot");
    vi.mocked(findMemberByHandle).mockReturnValue(undefined);
    const { default: HomePage } = await import("@/app/home/page");
    const ui = await HomePage();
    render(ui);
    expect(screen.queryByText("Your week")).toBeNull();
  });
});
