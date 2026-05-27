import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import CalendarPage from "@/app/calendar/page";

afterEach(() => cleanup());

function isoOffsetDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const UPCOMING_MEETING_DATE = isoOffsetDays(2);
const PAST_MEETING_DATE = isoOffsetDays(-7);
const UPCOMING_EVENT_DATE = isoOffsetDays(25);

vi.mock("@/lib/content-snapshot", () => ({
  listMeetingsFromSnapshot: vi.fn(() => [
    { date: UPCOMING_MEETING_DATE, slug: UPCOMING_MEETING_DATE, title: "Weekly sync", body: "" },
    { date: PAST_MEETING_DATE, slug: PAST_MEETING_DATE, title: "Last sync", body: "" },
  ]),
  listEventsFromSnapshot: vi.fn(() => [
    {
      date: UPCOMING_EVENT_DATE,
      slug: `${UPCOMING_EVENT_DATE}-ai-hackathon`,
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

  it("renders subscribe ICS link → /api/calendar.ics", async () => {
    render(await CalendarPage({ searchParams: Promise.resolve({}) }));
    const link = screen.getByRole("link", { name: /subscribe/i });
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

  it("filter chips render with current selection highlighted (Pill going = bg-ink)", async () => {
    render(
      await CalendarPage({
        searchParams: Promise.resolve({ filter: "events" }),
      }),
    );
    // Active filter uses Pill variant="going" (bg-ink text-cream) for visual distinction.
    const eventsChip = screen.getByRole("link", { name: "Events" });
    expect(eventsChip.className).toMatch(/bg-ink/);
  });
});

describe("/calendar v0.9 — warm-aesthetic, no dark:/scaffolding (H99)", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/calendar/page.tsx"),
    "utf8",
  );
  it("uses no Tailwind `dark:` variants", () => { expect(src).not.toMatch(/\bdark:/); });
  it("uses no neutral-* / gray-* color scale", () => {
    expect(src).not.toMatch(/\b(text|bg|border)-neutral-/);
    expect(src).not.toMatch(/\b(text|bg|border)-gray-/);
  });
  it("uses no rounded-border scaffolding", () => { expect(src).not.toMatch(/\brounded\b/); });
  it("uses recipe tokens (font-display heading on ink)", () => {
    expect(src).toMatch(/font-display/);
    expect(src).toMatch(/text-ink|text-dust/);
  });
  it("uses Pill for filter chips (not raw accent-600/neutral-200)", () => {
    expect(src).toMatch(/Pill/);
    expect(src).not.toMatch(/filterChipClasses/);
  });
});
