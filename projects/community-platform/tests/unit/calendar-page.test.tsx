import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import CalendarPage from "@/app/calendar/page";

afterEach(() => cleanup());

vi.mock("@/lib/content-snapshot", () => ({
  listMeetingsFromSnapshot: vi.fn(() => [
    { date: "2026-05-21", slug: "2026-05-21", title: "Weekly sync", body: "" },
    { date: "2026-05-14", slug: "2026-05-14", title: "Last sync", body: "" },
  ]),
  listEventsFromSnapshot: vi.fn(() => [
    {
      date: "2026-06-15",
      slug: "2026-06-15-ai-hackathon",
      title: "AI Hackathon",
      body: "",
    },
  ]),
}));

describe("/calendar — Q2.2 / D27 unified events+meetings", () => {
  it("default render (filter=all) shows both meetings and events", async () => {
    render(await CalendarPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText("Weekly sync")).toBeInTheDocument();
    expect(screen.getByText("AI Hackathon")).toBeInTheDocument();
  });

  it("filter=events hides meetings", async () => {
    render(
      await CalendarPage({
        searchParams: Promise.resolve({ filter: "events" }),
      }),
    );
    expect(screen.queryByText("Weekly sync")).toBeNull();
    expect(screen.getByText("AI Hackathon")).toBeInTheDocument();
  });

  it("filter=meetings hides events", async () => {
    render(
      await CalendarPage({
        searchParams: Promise.resolve({ filter: "meetings" }),
      }),
    );
    expect(screen.getByText("Weekly sync")).toBeInTheDocument();
    expect(screen.queryByText("AI Hackathon")).toBeNull();
  });

  it("renders Subscribe-to-calendar button → /api/calendar.ics", async () => {
    render(await CalendarPage({ searchParams: Promise.resolve({}) }));
    const link = screen.getByRole("link", { name: /Subscribe to calendar/ });
    expect(link.getAttribute("href")).toBe("/api/calendar.ics");
  });

  it("renders empty-state when no upcoming items", async () => {
    vi.mocked(
      (await import("@/lib/content-snapshot")).listMeetingsFromSnapshot,
    ).mockReturnValueOnce([]);
    vi.mocked(
      (await import("@/lib/content-snapshot")).listEventsFromSnapshot,
    ).mockReturnValueOnce([]);
    render(await CalendarPage({ searchParams: Promise.resolve({}) }));
    expect(
      screen.getByText(/No upcoming events/),
    ).toBeInTheDocument();
  });

  it("filter chips render with current selection highlighted", async () => {
    render(
      await CalendarPage({
        searchParams: Promise.resolve({ filter: "events" }),
      }),
    );
    const eventsChip = screen.getByRole("link", { name: "Events" });
    expect(eventsChip.className).toMatch(/accent/);
  });
});
