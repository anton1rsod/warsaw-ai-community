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
  listDecisionsFromSnapshot: () => [],
  listProjectDetails: () => [],
  listMembers: () => [],
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
    // v0.6 Phase 3.3: HomeFeed renders MonoLabel "no recent ships" header
    // + evergreen empty-state when no items. Either marker confirms the
    // feed mounted without throwing.
    expect(screen.getByText(/no recent ships/i)).toBeInTheDocument();
  });

  it("anonymous render does NOT mount YourWeekPane", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue(null as never);
    const { default: HomePage } = await import("@/app/home/page");
    const ui = await HomePage();
    render(ui);
    // v0.6 Phase 3.2: YourWeekPane heading is <h1 id="your-week">; absent for anon.
    expect(document.getElementById("your-week")).toBeNull();
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
    // v0.8.1: hero <h1 id="your-week"> with first-name lead + ink period ("This week, Anton.").
    const hero = document.getElementById("your-week");
    expect(hero).not.toBeNull();
    expect(hero?.textContent ?? "").toMatch(/Anton\./);
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
    // v0.6 Phase 3.3: feed-still-mounted assertion via the MonoLabel header.
    expect(screen.getByText(/no recent ships/i)).toBeInTheDocument();
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
    // v0.6 Phase 3.2: no hero rendered when roster lookup fails.
    expect(document.getElementById("your-week")).toBeNull();
  });
});

describe("/home page mounts StarterPack for signed-in viewers (Phase B.7)", () => {
  it("imports StarterPack alongside HomeFeed", async () => {
    const { promises: fs } = await import("node:fs");
    const path = (await import("node:path")).default;
    const src = await fs.readFile(
      path.resolve(process.cwd(), "app/home/page.tsx"),
      "utf8",
    );
    expect(src).toMatch(/import\s+\{\s*StarterPack\s*\}\s+from\s+"@\/app\/components\/StarterPack"/);
    expect(src).toMatch(/<StarterPack\b/);
  });
});
