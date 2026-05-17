import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { Event } from "@/lib/events";

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

vi.mock("@/lib/content-snapshot", () => ({
  findEventBySlug: vi.fn(),
  listEventsFromSnapshot: () => [],
  findMemberBySlug: () => undefined,
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
// EventRsvpButton is a client component; mock it to avoid transitive env-var validation
// (EventRsvpButton → rsvp-event action → lib/auth → lib/env throws without real secrets).
vi.mock("@/app/components/EventRsvpButton", () => ({
  EventRsvpButton: ({ eventSlug, initialState }: { eventSlug: string; initialState: string }) =>
    initialState === "not-signed-in"
      ? <a href={`/login?callbackUrl=/events/${eventSlug}`}>Sign in to RSVP</a>
      : <div data-testid="rsvp-button" />,
}));
// EventRoster is an async server component; mock it to avoid async-in-client-render issues.
vi.mock("@/app/components/EventRoster", () => ({
  EventRoster: () => <p>No one&apos;s marked going yet — be the first.</p>,
}));

afterEach(() => { cleanup(); vi.resetAllMocks(); });

describe("H35: /events/[slug] detail", () => {
  it("renders title, date, startTime, location, AddToCalendar", async () => {
    const { findEventBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findEventBySlug).mockReturnValue(event);
    const { default: EventPage } = await import("@/app/events/[slug]/page");
    const ui = await EventPage({ params: Promise.resolve({ slug: "2026-06-15-hack" }) });
    render(ui);
    expect(screen.getByRole("heading", { level: 1, name: /AI Hackathon/ })).toBeInTheDocument();
    expect(screen.getByText("2026-06-15")).toBeInTheDocument();
    expect(screen.getByText(/18:00/)).toBeInTheDocument();
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
