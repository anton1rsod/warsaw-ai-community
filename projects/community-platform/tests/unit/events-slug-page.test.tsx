import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Event } from "@/lib/events";
import type * as GitHubAppModule from "@/lib/github-app";

const event: Event = {
  date: "2026-06-15",
  slug: "2026-06-15-hack" as Event["slug"],
  title: "AI Hackathon",
  status: "scheduled",
  body: "Body content",
  startTime: "18:00",
  durationMinutes: 180,
  location: "Office",
};

const mockAuth = vi.fn();
const mockReadFile = vi.fn();
const mockFindMemberByHandle = vi.fn();

vi.mock("@/lib/auth", () => ({ auth: () => mockAuth() }));
vi.mock("@/lib/env", () => ({
  env: {
    GITHUB_APP_ID: "x",
    GITHUB_APP_PRIVATE_KEY: "x",
    GITHUB_APP_INSTALLATION_ID: "x",
    GITHUB_REPO_OWNER: "anton1rsod",
    GITHUB_REPO_NAME: "warsaw-ai-community",
    GITHUB_REPO_BRANCH: "main",
  },
}));
vi.mock("@/lib/github-app", async () => {
  const actual = await vi.importActual<typeof GitHubAppModule>("@/lib/github-app");
  return {
    ...actual,
    createGitHubApp: () => ({ readFile: mockReadFile }),
  };
});
vi.mock("@/lib/content-snapshot", () => ({
  findEventBySlug: vi.fn(),
  listEventsFromSnapshot: () => [],
  findMemberBySlug: () => undefined,
  findMemberByHandle: (h: string) => mockFindMemberByHandle(h),
}));
vi.mock("@/lib/markdown", () => ({
  renderMarkdownToHtml: async (s: string) => `<p>${s}</p>`,
}));
vi.mock("@/lib/community-defaults", () => ({
  getDefaults: () => ({
    timezone: "Europe/Warsaw",
    meetings: { defaultStartTime: "18:00", defaultDurationMinutes: 60, defaultLocation: "x" },
    events: { defaultStartTime: "18:00", defaultDurationMinutes: 120, defaultLocation: "x" },
  }),
}));
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));
vi.mock("@/lib/__generated__/event-rosters.json", () => ({
  default: {},
}));
// EventRsvpButton is a client component; capture props for v0.4.8 assertions
// and render a minimal anon-vs-signed-in surface for the existing render tests.
const eventRsvpButtonCalls: { eventSlug: string; initialState: string; profileSha?: string }[] = [];
vi.mock("@/app/components/EventRsvpButton", () => ({
  EventRsvpButton: (props: { eventSlug: string; initialState: string; profileSha?: string }) => {
    eventRsvpButtonCalls.push(props);
    return props.initialState === "not-signed-in"
      ? <a href={`/login?callbackUrl=/events/${props.eventSlug}`}>Sign in to RSVP</a>
      : <div data-testid="rsvp-button" data-state={props.initialState} data-sha={props.profileSha ?? ""} />;
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  eventRsvpButtonCalls.length = 0;
  // Default: anonymous viewer (preserves existing test behavior).
  mockAuth.mockResolvedValue(null);
  mockFindMemberByHandle.mockReturnValue(undefined);
});
// EventRoster is an async server component; mock it to avoid async-in-client-render issues.
vi.mock("@/app/components/EventRoster", () => ({
  EventRoster: () => <p>No one&apos;s marked going yet — be the first.</p>,
}));

afterEach(() => { cleanup(); vi.resetAllMocks(); });

describe("H35: /events/[slug] detail", () => {
  it("renders title, monoLead with date+startTime, durationMinutes+location meta, AddToCalendar", async () => {
    const { findEventBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findEventBySlug).mockReturnValue(event);
    const { default: EventPage } = await import("@/app/events/[slug]/page");
    const ui = await EventPage({ params: Promise.resolve({ slug: "2026-06-15-hack" }) });
    render(ui);
    expect(screen.getByRole("heading", { level: 1, name: /AI Hackathon/ })).toBeInTheDocument();
    // v0.6 redesign: date+time live in the monoLead pre-header, not raw ISO.
    expect(screen.getByText(/meetup № 00 · 15 jun · 18:00 sharp/i)).toBeInTheDocument();
    // v0.6 meta line excludes startTime (avoid duplication with monoLead); shows duration + location.
    expect(screen.getByText(/180 min/)).toBeInTheDocument();
    expect(screen.getByText(/Office/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add to Calendar/i })).toBeInTheDocument();
  });

  it("returns notFound for unknown slug", async () => {
    const { findEventBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findEventBySlug).mockReturnValue(undefined);
    const { default: EventPage } = await import("@/app/events/[slug]/page");
    await expect(EventPage({ params: Promise.resolve({ slug: "nope" }) })).rejects.toThrow();
  });

  it("renders cancelled banner when status is cancelled", async () => {
    const { findEventBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findEventBySlug).mockReturnValue({ ...event, status: "cancelled" });
    const { default: EventPage } = await import("@/app/events/[slug]/page");
    const ui = await EventPage({ params: Promise.resolve({ slug: "2026-06-15-hack" }) });
    render(ui);
    expect(screen.getByText(/This event has been cancelled/i)).toBeInTheDocument();
  });

  it("renders host attribution when host is set", async () => {
    const { findEventBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findEventBySlug).mockReturnValue({ ...event, host: "anton1rsod" });
    const { default: EventPage } = await import("@/app/events/[slug]/page");
    const ui = await EventPage({ params: Promise.resolve({ slug: "2026-06-15-hack" }) });
    render(ui);
    expect(screen.getByText(/hosted by @anton1rsod/i)).toBeInTheDocument();
  });

  it("renders external URL link when url is set", async () => {
    const { findEventBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findEventBySlug).mockReturnValue({ ...event, url: "https://example.com/hack" });
    const { default: EventPage } = await import("@/app/events/[slug]/page");
    const ui = await EventPage({ params: Promise.resolve({ slug: "2026-06-15-hack" }) });
    render(ui);
    expect(screen.getByRole("link", { name: /External page/i })).toHaveAttribute("href", "https://example.com/hack");
  });

  it("generateStaticParams returns slugs from snapshot", async () => {
    // Override listEventsFromSnapshot via vi.doMock for this test
    vi.resetModules();
    vi.doMock("@/lib/content-snapshot", () => ({
      findEventBySlug: vi.fn(),
      listEventsFromSnapshot: () => [{ slug: "2026-06-15-hack", date: "2026-06-15", title: "x", body: "", status: "scheduled" }],
      // Preserve dynamic wiring so v0.4.8 tests downstream can still
      // configure auth/profile per test via the same shared mocks.
      findMemberByHandle: (h: string) => mockFindMemberByHandle(h),
      findMemberBySlug: () => undefined,
    }));
    const { generateStaticParams } = await import("@/app/events/[slug]/page");
    const params = await generateStaticParams();
    expect(params).toEqual([{ slug: "2026-06-15-hack" }]);
  });

  it("Task 3.4: mounts EventRsvpButton in 'not-signed-in' state by default (O6 lock)", async () => {
    const { findEventBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findEventBySlug).mockReturnValue(event);
    const { default: EventPage } = await import("@/app/events/[slug]/page");
    const ui = await EventPage({ params: Promise.resolve({ slug: "2026-06-15-hack" }) });
    render(ui);
    expect(
      screen.getByRole("link", { name: /Sign in to RSVP/i }),
    ).toHaveAttribute("href", "/login?callbackUrl=/events/2026-06-15-hack");
  });

  it("v0.4.8: signed-in member with no prior RSVP gets initialState='none' + profileSha", async () => {
    const { findEventBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findEventBySlug).mockReturnValue(event);
    mockAuth.mockResolvedValue({ githubHandle: "anton1rsod" });
    mockFindMemberByHandle.mockReturnValue({ slug: "anton-safronov", name: "Anton" });
    mockReadFile.mockResolvedValue({
      content: "---\nname: Anton\n---\n",
      sha: "sha-abc",
      path: "community/members/anton-safronov.md",
    });
    const { default: EventPage } = await import("@/app/events/[slug]/page");
    const ui = await EventPage({ params: Promise.resolve({ slug: "2026-06-15-hack" }) });
    render(ui);
    const lastCall = eventRsvpButtonCalls.at(-1);
    expect(lastCall?.initialState).toBe("none");
    expect(lastCall?.profileSha).toBe("sha-abc");
  });

  it("v0.4.8: signed-in member with going RSVP gets initialState='going' + profileSha", async () => {
    const { findEventBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findEventBySlug).mockReturnValue(event);
    mockAuth.mockResolvedValue({ githubHandle: "anton1rsod" });
    mockFindMemberByHandle.mockReturnValue({ slug: "anton-safronov", name: "Anton" });
    mockReadFile.mockResolvedValue({
      content: "---\nname: Anton\nevents_going:\n  - 2026-06-15-hack\n---\n",
      sha: "sha-def",
      path: "x",
    });
    const { default: EventPage } = await import("@/app/events/[slug]/page");
    const ui = await EventPage({ params: Promise.resolve({ slug: "2026-06-15-hack" }) });
    render(ui);
    const lastCall = eventRsvpButtonCalls.at(-1);
    expect(lastCall?.initialState).toBe("going");
    expect(lastCall?.profileSha).toBe("sha-def");
  });

  it("v0.4.8: signed-in member with interested RSVP gets initialState='interested' + profileSha", async () => {
    const { findEventBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findEventBySlug).mockReturnValue(event);
    mockAuth.mockResolvedValue({ githubHandle: "anton1rsod" });
    mockFindMemberByHandle.mockReturnValue({ slug: "anton-safronov", name: "Anton" });
    mockReadFile.mockResolvedValue({
      content: "---\nname: Anton\nevents_interested:\n  - 2026-06-15-hack\n---\n",
      sha: "sha-ghi",
      path: "x",
    });
    const { default: EventPage } = await import("@/app/events/[slug]/page");
    const ui = await EventPage({ params: Promise.resolve({ slug: "2026-06-15-hack" }) });
    render(ui);
    const lastCall = eventRsvpButtonCalls.at(-1);
    expect(lastCall?.initialState).toBe("interested");
  });

  it("v0.4.8: signed-in but not a roster member falls back to 'not-signed-in' (defensive)", async () => {
    const { findEventBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findEventBySlug).mockReturnValue(event);
    mockAuth.mockResolvedValue({ githubHandle: "stranger" });
    mockFindMemberByHandle.mockReturnValue(undefined);
    const { default: EventPage } = await import("@/app/events/[slug]/page");
    const ui = await EventPage({ params: Promise.resolve({ slug: "2026-06-15-hack" }) });
    render(ui);
    const lastCall = eventRsvpButtonCalls.at(-1);
    expect(lastCall?.initialState).toBe("not-signed-in");
    expect(lastCall?.profileSha).toBeUndefined();
    expect(mockReadFile).not.toHaveBeenCalled();
  });

  it("v0.4.8: signed-in member but readFile returns null falls back to 'not-signed-in' (defensive — degrade gracefully on GitHub API failure)", async () => {
    const { findEventBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findEventBySlug).mockReturnValue(event);
    mockAuth.mockResolvedValue({ githubHandle: "anton1rsod" });
    mockFindMemberByHandle.mockReturnValue({ slug: "anton-safronov", name: "Anton" });
    mockReadFile.mockResolvedValue(null);
    const { default: EventPage } = await import("@/app/events/[slug]/page");
    const ui = await EventPage({ params: Promise.resolve({ slug: "2026-06-15-hack" }) });
    render(ui);
    const lastCall = eventRsvpButtonCalls.at(-1);
    expect(lastCall?.initialState).toBe("not-signed-in");
  });

  it("v0.4.8: page exports force-dynamic (no longer force-static — Header needs request-time auth)", async () => {
    const mod = await import("@/app/events/[slug]/page");
    expect((mod as { dynamic?: string }).dynamic).toBe("force-dynamic");
  });

  it("Task 3.4: mounts EventRoster section", async () => {
    const { findEventBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findEventBySlug).mockReturnValue(event);
    const { default: EventPage } = await import("@/app/events/[slug]/page");
    const ui = await EventPage({ params: Promise.resolve({ slug: "2026-06-15-hack" }) });
    render(ui);
    // The roster section will render based on the json mock — events-slug-page.test.tsx
    // doesn't mock event-rosters.json with data, so EventRoster will see {} for the eventSlug
    // and render the empty-state copy.
    expect(
      screen.getByText(/No one's marked going yet/i),
    ).toBeInTheDocument();
  });
});

describe("EventDetailPage v0.6 (Task 3.5 — visual redesign + H89 contract)", () => {
  // Use the same shared mocks established at module-load time above.
  const meetup4: Event = {
    date: "2026-05-21",
    slug: "2026-05-21-meetup-4" as Event["slug"],
    title: "AI Community | Meetup #4",
    status: "scheduled",
    body: "Body content",
    startTime: "19:00",
    durationMinutes: 120,
    location: "Grzybowska 85a",
    host: "anton1rsod",
  };

  afterEach(() => { vi.useRealTimers(); });

  it("renders MonoLabel '// meetup № 04 · 21 may · 19:00 sharp' (events.detail.monoLeadFmt)", async () => {
    const { findEventBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findEventBySlug).mockReturnValue(meetup4);
    const { default: EventPage } = await import("@/app/events/[slug]/page");
    const ui = await EventPage({ params: Promise.resolve({ slug: "2026-05-21-meetup-4" }) });
    render(ui);
    expect(screen.getByText(/meetup № 04 · 21 may · 19:00 sharp/i)).toBeInTheDocument();
  });

  it("renders Fraunces italic title with AmberTag 'tonight.' suffix on event-day", async () => {
    // Pin now to event day (2026-05-21 noon Warsaw-ish) so todaySuffix() yields tonight.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 21, 12, 0, 0));
    const { findEventBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findEventBySlug).mockReturnValue(meetup4);
    const { default: EventPage } = await import("@/app/events/[slug]/page");
    const ui = await EventPage({ params: Promise.resolve({ slug: "2026-05-21-meetup-4" }) });
    render(ui);
    expect(screen.getByText("tonight.")).toBeInTheDocument();
  });

  it("renders AmberTag 'this week.' suffix 1–6 days before event-day", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 18, 12, 0, 0)); // 3 days before
    const { findEventBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findEventBySlug).mockReturnValue(meetup4);
    const { default: EventPage } = await import("@/app/events/[slug]/page");
    const ui = await EventPage({ params: Promise.resolve({ slug: "2026-05-21-meetup-4" }) });
    render(ui);
    expect(screen.getByText("this week.")).toBeInTheDocument();
  });

  it("omits AmberTag suffix for events more than 6 days out", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 14, 12, 0, 0)); // 7 days before
    const { findEventBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findEventBySlug).mockReturnValue(meetup4);
    const { default: EventPage } = await import("@/app/events/[slug]/page");
    const ui = await EventPage({ params: Promise.resolve({ slug: "2026-05-21-meetup-4" }) });
    render(ui);
    expect(screen.queryByText("tonight.")).not.toBeInTheDocument();
    expect(screen.queryByText("this week.")).not.toBeInTheDocument();
  });

  it("preserves force-dynamic + loadViewerRsvp (v0.4.7 + v0.4.8 contract — H89 grep)", () => {
    const src = readFileSync(
      resolve(__dirname, "../../app/events/[slug]/page.tsx"),
      "utf-8",
    );
    expect(src).toMatch(/export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/);
    expect(src).toMatch(/loadViewerRsvp/);
  });
});
