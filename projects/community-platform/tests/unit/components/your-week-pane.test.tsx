import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { YourWeekPane } from "@/app/components/YourWeekPane";

afterEach(() => cleanup());

describe("YourWeekPane v0.6 — Q1.3 / D25 / O9", () => {
  it("renders 'Tonight, <firstName>—' when event today + same-day mono label", () => {
    render(
      <YourWeekPane
        firstName="Anton"
        nextRsvp={{
          slug: "2026-05-21-meetup-4",
          title: "AI Community Meetup № 4",
          date: "2026-05-21",
          startTime: "19:00",
          location: "Grzybowska 85a",
        }}
        timeUntil="in 6h"
        kudosWeekCount={0}
        now={new Date(2026, 4, 21)}
      />,
    );
    expect(screen.getByText(/Tonight, Anton—/)).toBeInTheDocument();
    expect(screen.getByText(/AI Community Meetup № 4/)).toBeInTheDocument();
  });

  it("renders 'This week, <firstName>—' fallback when event is >1d away", () => {
    render(
      <YourWeekPane
        firstName="Anton"
        nextRsvp={{
          slug: "future",
          title: "Future event",
          date: "2026-05-28",
          startTime: "19:00",
          location: "TBD",
        }}
        timeUntil="in 6d 12h"
        kudosWeekCount={0}
        now={new Date(2026, 4, 21)}
      />,
    );
    expect(screen.getByText(/This week, Anton—/)).toBeInTheDocument();
  });

  it("renders empty-state when no nextRsvp", () => {
    render(
      <YourWeekPane
        firstName="Anton"
        nextRsvp={null}
        timeUntil={undefined}
        kudosWeekCount={0}
        now={new Date(2026, 4, 21)}
      />,
    );
    expect(screen.getByText(/Next meetup lands soon/)).toBeInTheDocument();
  });

  describe("§14.6 manipulation-resistance — NO streak / notifications / comparison", () => {
    it("DOM contains no streak / missed / chain copy", () => {
      const { container } = render(
        <YourWeekPane
          firstName="Anton"
          nextRsvp={{ slug: "x", title: "X event", date: "2026-05-21" }}
          timeUntil="in 6h"
          kudosWeekCount={3}
          now={new Date(2026, 4, 21)}
        />,
      );
      const text = container.textContent || "";
      expect(text).not.toMatch(/streak/i);
      expect(text).not.toMatch(/missed/i);
      expect(text).not.toMatch(/don't break the chain/i);
      expect(text).not.toMatch(/keep your/i);
    });
  });
});
