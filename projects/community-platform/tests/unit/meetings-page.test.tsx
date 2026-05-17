import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { Meeting } from "@/lib/meetings";

const m = (date: string, title: string): Meeting => ({
  slug: date,
  date,
  title,
  body: "",
  attendees: [],
});

vi.mock("@/lib/content-snapshot", () => ({
  listMeetingsFromSnapshot: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.resetModules();
});

describe("H36: meetings index", () => {
  it("renders month-grouped reverse-chrono list", async () => {
    const { listMeetingsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listMeetingsFromSnapshot).mockReturnValue([
      m("2026-05-19", "May sync"),
      m("2026-05-12", "Other May sync"),
      m("2026-04-28", "April sync"),
    ]);
    const { default: MeetingsIndex } = await import("@/app/meetings/page");
    const ui = await MeetingsIndex();
    render(ui);
    expect(screen.getByRole("heading", { level: 1, name: /Meetings/ })).toBeInTheDocument();
    expect(screen.getByText("May 2026")).toBeInTheDocument();
    expect(screen.getByText("April 2026")).toBeInTheDocument();
    expect(screen.getAllByText(/May sync/).length).toBeGreaterThan(0);
  });

  it("surfaces ICS subscribe link", async () => {
    const { listMeetingsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listMeetingsFromSnapshot).mockReturnValue([m("2026-05-19", "May sync")]);
    const { default: MeetingsIndex } = await import("@/app/meetings/page");
    const ui = await MeetingsIndex();
    render(ui);
    expect(screen.getByRole("link", { name: /Subscribe to calendar/i })).toHaveAttribute(
      "href",
      "/api/calendar.ics",
    );
  });

  it("renders empty state when no meetings", async () => {
    const { listMeetingsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listMeetingsFromSnapshot).mockReturnValue([]);
    const { default: MeetingsIndex } = await import("@/app/meetings/page");
    const ui = await MeetingsIndex();
    render(ui);
    expect(screen.getByText(/No meetings yet/i)).toBeInTheDocument();
  });
});
