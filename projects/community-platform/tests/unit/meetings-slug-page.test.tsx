import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { Meeting } from "@/lib/meetings";

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

const meeting: Meeting = {
  date: "2026-05-19",
  slug: "2026-05-19",
  title: "Weekly sync",
  body: "Notes",
  attendees: [],
  startTime: "18:00",
  durationMinutes: 60,
  location: "Telegram #voice",
};

vi.mock("@/lib/content-snapshot", () => ({
  findMeetingBySlug: vi.fn(),
  listMeetingsFromSnapshot: () => [],
}));
vi.mock("@/lib/markdown", () => ({
  renderMarkdownToHtml: async (s: string) => `<p>${s}</p>`,
}));
vi.mock("@/lib/community-defaults", () => ({
  getDefaults: () => ({
    timezone: "Europe/Warsaw",
    meetings: { defaultStartTime: "18:00", defaultDurationMinutes: 60, defaultLocation: "Telegram #voice" },
    events: { defaultStartTime: "18:00", defaultDurationMinutes: 120, defaultLocation: "x" },
  }),
}));

afterEach(() => { cleanup(); vi.resetAllMocks(); });

describe("H36: meeting detail extension", () => {
  it("renders startTime, durationMinutes, location", async () => {
    const { findMeetingBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findMeetingBySlug).mockReturnValue(meeting);
    const { default: MeetingPage } = await import("@/app/meetings/[slug]/page");
    const ui = await MeetingPage({ params: Promise.resolve({ slug: "2026-05-19" }) });
    render(ui);
    expect(screen.getByText(/18:00/)).toBeInTheDocument();
    expect(screen.getByText(/60 min/)).toBeInTheDocument();
    expect(screen.getByText(/Telegram #voice/)).toBeInTheDocument();
  });

  it("renders AddToCalendarButton (D16) on the detail page", async () => {
    const { findMeetingBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findMeetingBySlug).mockReturnValue(meeting);
    const { default: MeetingPage } = await import("@/app/meetings/[slug]/page");
    const ui = await MeetingPage({ params: Promise.resolve({ slug: "2026-05-19" }) });
    render(ui);
    expect(screen.getByRole("button", { name: /Add to Calendar/i })).toBeInTheDocument();
  });

  it("renders without metadata row when extended fields absent (no crash)", async () => {
    const { findMeetingBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findMeetingBySlug).mockReturnValue({ ...meeting, startTime: undefined, durationMinutes: undefined, location: undefined });
    const { default: MeetingPage } = await import("@/app/meetings/[slug]/page");
    const ui = await MeetingPage({ params: Promise.resolve({ slug: "2026-05-19" }) });
    render(ui);
    // AddToCalendarButton still renders (uses defaults from getDefaults())
    expect(screen.getByRole("button", { name: /Add to Calendar/i })).toBeInTheDocument();
    expect(screen.queryByText(/18:00/)).not.toBeInTheDocument();
  });
});

describe("H53 / D19: ThankButton on /meetings/[slug] (Task 3.7)", () => {
  it("renders ThankButton when meeting.host is set", async () => {
    const { findMeetingBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findMeetingBySlug).mockReturnValue({ ...meeting, host: "anton-safronov" });
    const { default: MeetingPage } = await import("@/app/meetings/[slug]/page");
    const ui = await MeetingPage({ params: Promise.resolve({ slug: "2026-05-19" }) });
    render(ui);
    const btn = screen.getByTestId("thank-meeting-2026-05-19");
    expect(btn.getAttribute("data-recipient")).toBe("anton-safronov");
    expect(btn.getAttribute("data-state")).toBe("not-signed-in");
  });

  it("renders NO ThankButton when meeting.host is absent", async () => {
    const { findMeetingBySlug } = await import("@/lib/content-snapshot");
    vi.mocked(findMeetingBySlug).mockReturnValue({ ...meeting, host: undefined });
    const { default: MeetingPage } = await import("@/app/meetings/[slug]/page");
    const ui = await MeetingPage({ params: Promise.resolve({ slug: "2026-05-19" }) });
    render(ui);
    expect(screen.queryByTestId("thank-meeting-2026-05-19")).not.toBeInTheDocument();
  });
});
