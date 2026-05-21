import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { Event } from "@/lib/events";

vi.mock("@/lib/content-snapshot", () => ({
  listEventsFromSnapshot: vi.fn(),
  isAdmin: vi.fn(() => false),
}));
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => null),
}));
vi.mock("@/lib/__generated__/event-rosters.json", () => ({
  default: {
    "2026-06-15-future": {
      going: { publicSlugs: ["a", "b"], hiddenCount: 1 },
      interested: { publicSlugs: [], hiddenCount: 0 },
    },
    "2026-04-01-past": {
      going: { publicSlugs: ["c"], hiddenCount: 0 },
      interested: { publicSlugs: [], hiddenCount: 0 },
    },
  },
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const ev = (
  date: string,
  slug: string,
  title: string,
  status: "scheduled" | "completed" | "cancelled" = "scheduled",
  extra: Partial<Event> = {},
): Event => ({
  date,
  slug: slug as Event["slug"],
  title,
  status,
  body: "",
  ...extra,
});

describe("H35: /events index", () => {
  it("renders Upcoming and Past section landmarks", async () => {
    const { listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([
      ev("2026-06-15", "2026-06-15-future", "Future event"),
      ev("2026-04-01", "2026-04-01-past", "Past event", "completed"),
    ]);
    const { default: EventsIndex } = await import("@/app/events/page");
    const ui = await EventsIndex();
    render(ui);
    // v0.6: mono labels "// upcoming" and "// past" become visible section
    // markers; the sr-only h2 headings continue to back screen-reader nav.
    expect(screen.getByText(/\/\/ upcoming/i)).toBeInTheDocument();
    expect(screen.getByText(/\/\/ past/i)).toBeInTheDocument();
  });

  it("EventCard going-count chip reflects publicSlugs.length + hiddenCount", async () => {
    const { listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([
      ev("2026-06-15", "2026-06-15-future", "Future event"),
      ev("2026-04-01", "2026-04-01-past", "Past event", "completed"),
    ]);
    const { default: EventsIndex } = await import("@/app/events/page");
    const ui = await EventsIndex();
    render(ui);
    // Future: 2 public + 1 hidden = 3 going (EventCard "3 going" chip).
    expect(screen.getByText(/3 going/)).toBeInTheDocument();
    // Past: 1 public + 0 hidden = 1 going (EventCard same chip for past too).
    expect(screen.getByText(/1 going/)).toBeInTheDocument();
  });

  it("surfaces ICS subscribe Pill", async () => {
    const { listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([]);
    const { default: EventsIndex } = await import("@/app/events/page");
    const ui = await EventsIndex();
    render(ui);
    expect(screen.getByRole("link", { name: /subscribe \(ICS\)/i })).toHaveAttribute(
      "href",
      "/api/calendar.ics",
    );
  });

  it("countTotal returns 0 for unknown slug (defensive)", async () => {
    const { listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([
      ev("2026-06-15", "2026-06-15-unrostered", "Unrostered future event"),
    ]);
    const { default: EventsIndex } = await import("@/app/events/page");
    const ui = await EventsIndex();
    render(ui);
    // Zero-going EventCard does NOT render the count chip (EventCard
    // contract: `goingCount > 0` gates the chip). So we assert the slug
    // link is present without any "X going" chip beside this row.
    const link = screen.getByRole("link", { name: /Unrostered future event/ });
    expect(link).toBeInTheDocument();
    expect(screen.queryByText(/0 going/)).toBeNull();
  });
});

describe("H81: /events admin button", () => {
  it("admin sees + new event Pill when admin session present", async () => {
    const { listEventsFromSnapshot, isAdmin } = await import(
      "@/lib/content-snapshot"
    );
    const { auth } = await import("@/lib/auth");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([]);
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    vi.mocked(isAdmin).mockReturnValue(true);
    const { default: EventsIndex } = await import("@/app/events/page");
    const ui = await EventsIndex();
    render(ui);
    const link = screen.queryByRole("link", { name: /\+ new event/i });
    expect(link).not.toBeNull();
    expect(link?.getAttribute("href")).toBe("/admin/events/new");
    // chat-33 reviewer triage: assert isAdmin was called with the session
    // handle (not the slug, not the full session object, not undefined).
    expect(vi.mocked(isAdmin)).toHaveBeenCalledWith("anton1rsod");
  });

  it("signed-in non-admin does NOT see button", async () => {
    const { listEventsFromSnapshot, isAdmin } = await import(
      "@/lib/content-snapshot"
    );
    const { auth } = await import("@/lib/auth");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([]);
    vi.mocked(auth).mockResolvedValue({ githubHandle: "regular-member" } as never);
    vi.mocked(isAdmin).mockReturnValue(false);
    const { default: EventsIndex } = await import("@/app/events/page");
    const ui = await EventsIndex();
    render(ui);
    expect(screen.queryByRole("link", { name: /\+ new event/i })).toBeNull();
  });

  it("anonymous viewer does NOT see button", async () => {
    const { listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    const { auth } = await import("@/lib/auth");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([]);
    vi.mocked(auth).mockResolvedValue(null as never);
    const { default: EventsIndex } = await import("@/app/events/page");
    const ui = await EventsIndex();
    render(ui);
    expect(screen.queryByRole("link", { name: /\+ new event/i })).toBeNull();
  });
});

describe("H86: /events force-dynamic export", () => {
  it("re-exports dynamic = 'force-dynamic'", async () => {
    const mod = await import("@/app/events/page");
    expect((mod as { dynamic?: string }).dynamic).toBe("force-dynamic");
  });
});

describe("EventsPage v0.6", () => {
  it("renders Fraunces italic 'Events.' title via i18n", async () => {
    const { listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([]);
    const { default: EventsIndex } = await import("@/app/events/page");
    render(await EventsIndex());
    const heading = screen.getByRole("heading", { level: 1, name: "Events." });
    expect(heading).toBeInTheDocument();
    // Fraunces is wired via the `font-display` Tailwind family (Phase 0.3).
    expect(heading.className).toMatch(/font-display/);
    expect(heading.className).toMatch(/italic/);
  });

  it("renders MonoLabel '// events · N upcoming' with count", async () => {
    const { listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([
      ev("2026-06-15", "2026-06-15-future", "Future event"),
    ]);
    const { default: EventsIndex } = await import("@/app/events/page");
    render(await EventsIndex());
    expect(screen.getByText(/\/\/ events · 1 upcoming/i)).toBeInTheDocument();
  });

  it("renders evergreen empty-state when no upcoming", async () => {
    const { listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([
      ev("2026-04-01", "2026-04-01-past", "Past event", "completed"),
    ]);
    const { default: EventsIndex } = await import("@/app/events/page");
    render(await EventsIndex());
    expect(screen.getByText(/Telegram has the next signal/i)).toBeInTheDocument();
  });

  it("renders evergreen empty-state when no past", async () => {
    const { listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([
      ev("2026-06-15", "2026-06-15-future", "Future event"),
    ]);
    const { default: EventsIndex } = await import("@/app/events/page");
    render(await EventsIndex());
    expect(screen.getByText(/No past events yet/i)).toBeInTheDocument();
  });

  it("EventCard rows render upcoming events with title + slug link", async () => {
    const { listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([
      ev("2026-06-15", "2026-06-15-future", "Future event", "scheduled", {
        startTime: "18:30",
        location: "Campus",
      }),
    ]);
    const { default: EventsIndex } = await import("@/app/events/page");
    render(await EventsIndex());
    const link = screen.getByRole("link", { name: /Future event/i });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/events/2026-06-15-future");
  });
});
