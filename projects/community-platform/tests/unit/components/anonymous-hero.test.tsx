import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AnonymousHero } from "@/app/components/AnonymousHero";

afterEach(() => cleanup());

vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: vi.fn(),
  listMeetingsFromSnapshot: vi.fn(() => []),
  listEventsFromSnapshot: vi.fn(() => []),
}));

describe("AnonymousHero — ADR-0014 / Q1.2 hero composition", () => {
  it("renders the Q-1.1 ambition sentence verbatim", async () => {
    render(await AnonymousHero({ nextEvent: null }));
    expect(
      screen.getByText(
        "Where Warsaw's AI builders learn, ship, and find each other.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the sub-line", async () => {
    render(await AnonymousHero({ nextEvent: null }));
    expect(
      screen.getByText(
        "Member-led. Meets weekly in Warsaw. Free. Open-source platform.",
      ),
    ).toBeInTheDocument();
  });

  it("renders primary CTA [Sign in with GitHub] linking to /login", async () => {
    render(await AnonymousHero({ nextEvent: null }));
    const primary = screen.getByRole("link", { name: /Sign in with GitHub/ });
    expect(primary.getAttribute("href")).toBe("/login");
  });

  it("renders secondary CTA [Join Telegram →] linking external", async () => {
    render(await AnonymousHero({ nextEvent: null }));
    const tg = screen.getByRole("link", { name: /Join Telegram/ });
    expect(tg.getAttribute("href")).toMatch(/^https:\/\/t\.me/);
    expect(tg.getAttribute("target")).toBe("_blank");
    expect(tg.getAttribute("rel")).toMatch(/noopener/);
  });

  it("renders next-event ribbon when an upcoming event exists", async () => {
    render(
      await AnonymousHero({
        nextEvent: {
          slug: "2026-05-21-sync",
          title: "Wednesday sync",
          date: "2026-05-21",
          startTime: "18:30",
        },
      }),
    );
    expect(screen.getByText(/Next:/)).toBeInTheDocument();
    const rsvp = screen.getByRole("link", { name: /RSVP/ });
    expect(rsvp.getAttribute("href")).toBe("/events/2026-05-21-sync");
  });

  it("renders calibrated empty-state when no upcoming events (anti-manipulation §14B — neutral framing)", async () => {
    render(await AnonymousHero({ nextEvent: null }));
    expect(
      screen.getByText(/next weekly sync is Wednesday at 18:30/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/spots remaining|only \d+ spots|hurry/i)).toBeNull();
    expect(screen.queryByText(/countdown/i)).toBeNull();
  });
});
