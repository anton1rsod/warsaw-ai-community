import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { StatusUpdate } from "@/lib/status-reader";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({ githubHandle: "anton1rsod" })),
}));
vi.mock("@/lib/env", () => ({
  env: {
    GITHUB_REPO_OWNER: "anton1rsod",
    GITHUB_REPO_NAME: "warsaw-ai-community",
    GITHUB_REPO_BRANCH: "main",
    GITHUB_APP_ID: "x",
    GITHUB_APP_PRIVATE_KEY: "x",
    GITHUB_APP_INSTALLATION_ID: "x",
  },
}));
vi.mock("@/lib/content-snapshot", () => ({
  listMeetingsFromSnapshot: vi.fn(),
  listEventsFromSnapshot: vi.fn(),
  findMemberByHandle: () => ({ slug: "anton-safronov", name: "Anton", githubHandle: "anton1rsod" }),
}));
vi.mock("@/lib/week", () => ({ currentWeek: () => "2026-W21" }));
vi.mock("@/lib/status-reader", () => ({ readWeekStatuses: vi.fn(async () => []) }));
vi.mock("@/lib/markdown", () => ({
  parseMarkdown: (body: string) => ({ body }),
  renderMarkdownToHtml: async (s: string) => `<p>${s}</p>`,
}));
vi.mock("@/app/actions/status", () => ({
  deleteStatus: vi.fn(),
  editStatus: vi.fn(),
  postStatus: vi.fn(),
}));
const mockList = vi.fn((): StatusUpdate[] => []);
vi.mock("@/app/actions/_test-status-store", () => ({
  isE2EMode: () => true,
  mockStatusActions: { list: mockList },
}));
vi.mock("@octokit/auth-app", () => ({
  createAppAuth: () => async () => ({ token: "fake" }),
}));
vi.mock("@/app/components/ThankButton", () => ({
  ThankButton: ({
    recipient,
    itemType,
    itemId,
    initialState,
  }: {
    recipient: string;
    itemType: string;
    itemId: string;
    initialState: string;
  }) => (
    <span
      data-testid={`thank-${itemType}-${itemId}`}
      data-recipient={recipient}
      data-state={initialState}
    >
      [thank]
    </span>
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mockList.mockReturnValue([]);
});

describe("D7: /this-week L2 strip (Task 2.8)", () => {
  it("renders HomeFeed strip above the compose box when This Week has items", async () => {
    const { listMeetingsFromSnapshot, listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    const today = new Date().toISOString().slice(0, 10);
    vi.mocked(listMeetingsFromSnapshot).mockReturnValue([
      { date: today, slug: today, title: "Todays sync", body: "", attendees: [] },
    ]);
    vi.mocked(listEventsFromSnapshot).mockReturnValue([]);
    const { default: ThisWeekPage } = await import("@/app/this-week/page");
    const ui = await ThisWeekPage();
    render(ui);
    // The strip h2 is more specific than the page h1 — use getByRole
    expect(screen.getByRole("heading", { name: "This Week" })).toBeInTheDocument();
    expect(screen.getByText(/Todays sync/)).toBeInTheDocument();
  });

  it("H45: hides strip entirely when This Week empty", async () => {
    const { listMeetingsFromSnapshot, listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listMeetingsFromSnapshot).mockReturnValue([]);
    vi.mocked(listEventsFromSnapshot).mockReturnValue([]);
    const { default: ThisWeekPage } = await import("@/app/this-week/page");
    const ui = await ThisWeekPage();
    const { container } = render(ui);
    // HomeFeed returns null — no strip-level "This Week" h2 in the DOM.
    // The compose box's "Your update" h2 should still be present.
    expect(screen.getByRole("heading", { name: /Your update/i })).toBeInTheDocument();
    // The strip-level "This Week" header should NOT appear.
    const stripHeaders = container.querySelectorAll("h2.uppercase");
    const stripText = Array.from(stripHeaders).map((h) => h.textContent).join(",");
    expect(stripText).not.toMatch(/THIS WEEK/i);
  });
});

describe("H53: ThankButton on /this-week (Task 3.7)", () => {
  it("renders a ThankButton for each 'other' status post with correct itemId", async () => {
    const { listMeetingsFromSnapshot, listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listMeetingsFromSnapshot).mockReturnValue([]);
    vi.mocked(listEventsFromSnapshot).mockReturnValue([]);
    // Seed two statuses: viewer's own (anton-safronov) + one other (bob)
    // viewer slug = "anton-safronov" (from findMemberByHandle mock above)
    mockList.mockReturnValue([
      { slug: "anton-safronov", body: "---\n---\nmy update", sha: "sha1", lastModified: "2026-05-17" },
      { slug: "bob", body: "---\n---\nbob update", sha: "sha2", lastModified: "2026-05-17" },
    ]);
    const { default: ThisWeekPage } = await import("@/app/this-week/page");
    const ui = await ThisWeekPage();
    render(ui);
    // ThankButton should appear for "bob" (week 2026-W21), not for the viewer's own post
    const btn = screen.getByTestId("thank-status-2026-W21/bob");
    expect(btn).toBeInTheDocument();
    expect(btn.getAttribute("data-recipient")).toBe("bob");
    // In E2E mode loadViewerProfile returns fm=undefined → deriveThankInitialState → "not-thanked"
    // (viewerSlug="anton-safronov" is set so it's not "not-signed-in"; thanks_given=[] → not-thanked)
    expect(btn.getAttribute("data-state")).toBe("not-thanked");
    // No ThankButton for own post (self → ThankButton returns null)
    expect(screen.queryByTestId("thank-status-2026-W21/anton-safronov")).not.toBeInTheDocument();
  });
});
