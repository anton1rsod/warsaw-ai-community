import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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
    expect(screen.getAllByText("May 2026").length).toBeGreaterThan(0);
    expect(screen.getAllByText("April 2026").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/May sync/).length).toBeGreaterThan(0);
  });

  it("surfaces ICS subscribe link", async () => {
    const { listMeetingsFromSnapshot } = await import("@/lib/content-snapshot");
    vi.mocked(listMeetingsFromSnapshot).mockReturnValue([m("2026-05-19", "May sync")]);
    const { default: MeetingsIndex } = await import("@/app/meetings/page");
    const ui = await MeetingsIndex();
    render(ui);
    expect(screen.getByRole("link", { name: /subscribe/i })).toHaveAttribute(
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

describe("/meetings v0.9 — warm-aesthetic, no dark:/scaffolding (H99)", () => {
  const src = readFileSync(
    resolve(__dirname, "../../app/meetings/page.tsx"),
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
  it("uses MonoLabel for month-group headers", () => { expect(src).toMatch(/MonoLabel/); });
});
