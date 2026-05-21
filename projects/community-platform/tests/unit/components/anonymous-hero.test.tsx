import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AnonymousHero } from "@/app/components/AnonymousHero";

afterEach(() => cleanup());

vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: vi.fn(),
  listMeetingsFromSnapshot: vi.fn(() => []),
  listEventsFromSnapshot: vi.fn(() => []),
}));

describe("AnonymousHero v0.6 — ADR-0014 / Q1.2 hero composition", () => {
  it("renders MonoLabel + Fraunces italic headline with AmberTag", () => {
    render(<AnonymousHero nextEvent={null} />);
    expect(screen.getByText(/Warsaw AI/)).toBeInTheDocument();
    expect(screen.getByText(/public\./)).toBeInTheDocument();
    expect(
      screen.getByText(/builders learn, ship, and find each other/),
    ).toBeInTheDocument();
  });

  it("renders next-event card when event provided", () => {
    render(
      <AnonymousHero
        nextEvent={{
          slug: "2026-05-21-meetup-4",
          title: "AI Community Meetup № 4",
          date: "2026-05-21",
          startTime: "19:00",
          location: "Grzybowska 85a",
          host: "anton1rsod",
        }}
      />,
    );
    expect(screen.getByText("AI Community Meetup № 4")).toBeInTheDocument();
    expect(screen.getByText(/19:00/)).toBeInTheDocument();
    expect(screen.getByText(/Grzybowska 85a/)).toBeInTheDocument();
    const rsvp = screen.getByRole("link", { name: /RSVP/ });
    expect(rsvp.getAttribute("href")).toBe("/events/2026-05-21-meetup-4");
  });

  it("renders sign-in + telegram CTAs", () => {
    render(<AnonymousHero nextEvent={null} />);
    const signIn = screen.getByRole("link", { name: /sign in with github/i });
    expect(signIn.getAttribute("href")).toBe("/login");
    const tg = screen.getByRole("link", { name: /join telegram/i });
    expect(tg.getAttribute("href")).toMatch(/^https:\/\/t\.me/);
    expect(tg.getAttribute("target")).toBe("_blank");
    expect(tg.getAttribute("rel")).toMatch(/noopener/);
  });

  it("renders no-event mono label when nextEvent is null (neutral framing — §14B)", () => {
    render(<AnonymousHero nextEvent={null} />);
    expect(screen.getByText(/no meetup scheduled/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/spots remaining|only \d+ spots|hurry|countdown/i),
    ).toBeNull();
  });

  it("renders 'next meetup' mono label with timeUntil when provided", () => {
    render(
      <AnonymousHero
        nextEvent={{
          slug: "2026-05-21-meetup-4",
          title: "AI Community Meetup № 4",
          date: "2026-05-21",
          startTime: "19:00",
        }}
        timeUntil="in 30m"
      />,
    );
    expect(screen.getByText(/next meetup · in 30m/i)).toBeInTheDocument();
  });
});
