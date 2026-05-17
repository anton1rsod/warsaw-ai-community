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
});
