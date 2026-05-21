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
): Event => ({
  date,
  slug: slug as Event["slug"],
  title,
  status,
  body: "",
});

describe("H35: /events index", () => {
  it("renders Upcoming and Past section headings", async () => {
    const { listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([
      ev("2026-06-15", "2026-06-15-future", "Future event"),
      ev("2026-04-01", "2026-04-01-past", "Past event", "completed"),
    ]);
    const { default: EventsIndex } = await import("@/app/events/page");
    const ui = await EventsIndex();
    render(ui);
    expect(screen.getByRole("heading", { level: 2, name: /Upcoming/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Past/i })).toBeInTheDocument();
  });

  it("count badges sum publicSlugs.length + hiddenCount", async () => {
    const { listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([
      ev("2026-06-15", "2026-06-15-future", "Future event"),
      ev("2026-04-01", "2026-04-01-past", "Past event", "completed"),
    ]);
    const { default: EventsIndex } = await import("@/app/events/page");
    const ui = await EventsIndex();
    render(ui);
    // Future: 2 public + 1 hidden = 3 going
    expect(screen.getByText(/3 going/)).toBeInTheDocument();
    // Past: 1 public + 0 hidden = 1 went
    expect(screen.getByText(/1 went/)).toBeInTheDocument();
  });

  it("surfaces ICS subscribe link", async () => {
    const { listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([]);
    const { default: EventsIndex } = await import("@/app/events/page");
    const ui = await EventsIndex();
    render(ui);
    expect(screen.getByRole("link", { name: /Subscribe to calendar/i })).toHaveAttribute(
      "href",
      "/api/calendar.ics",
    );
  });

  it("empty state on both sections when no events", async () => {
    const { listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([]);
    const { default: EventsIndex } = await import("@/app/events/page");
    const ui = await EventsIndex();
    render(ui);
    expect(screen.getByText(/No upcoming events/i)).toBeInTheDocument();
    expect(screen.getByText(/No past events yet/i)).toBeInTheDocument();
  });

  it("countTotal returns 0 for unknown slug (defensive)", async () => {
    const { listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([
      ev("2026-06-15", "2026-06-15-unrostered", "Unrostered future event"),
    ]);
    const { default: EventsIndex } = await import("@/app/events/page");
    const ui = await EventsIndex();
    render(ui);
    expect(screen.getByText(/0 going/)).toBeInTheDocument();
  });
});

describe("H81: /events admin button", () => {
  it("admin sees + New event button when admin session present", async () => {
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
    const link = screen.queryByRole("link", { name: /\+ New event/ });
    expect(link).not.toBeNull();
    expect(link?.getAttribute("href")).toBe("/admin/events/new");
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
    expect(screen.queryByRole("link", { name: /\+ New event/ })).toBeNull();
  });

  it("anonymous viewer does NOT see button", async () => {
    const { listEventsFromSnapshot } = await import("@/lib/content-snapshot");
    const { auth } = await import("@/lib/auth");
    vi.mocked(listEventsFromSnapshot).mockReturnValue([]);
    vi.mocked(auth).mockResolvedValue(null);
    const { default: EventsIndex } = await import("@/app/events/page");
    const ui = await EventsIndex();
    render(ui);
    expect(screen.queryByRole("link", { name: /\+ New event/ })).toBeNull();
  });
});

describe("H86: /events force-dynamic export", () => {
  it("re-exports dynamic = 'force-dynamic'", async () => {
    const mod = await import("@/app/events/page");
    expect((mod as { dynamic?: string }).dynamic).toBe("force-dynamic");
  });
});
