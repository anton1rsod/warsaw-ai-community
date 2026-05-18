import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { YourWeekPane } from "@/app/components/YourWeekPane";

afterEach(() => cleanup());

describe("YourWeekPane — Q1.3 / D25 / O9", () => {
  it("renders 'Your week' heading", () => {
    render(
      <YourWeekPane
        nextRsvp={null}
        kudosWeekCount={0}
      />,
    );
    expect(screen.getByText("Your week")).toBeInTheDocument();
  });

  it("shows next-RSVP commitment when present", () => {
    render(
      <YourWeekPane
        nextRsvp={{ slug: "2026-05-21-sync", title: "Wednesday sync", date: "2026-05-21" }}
        kudosWeekCount={0}
      />,
    );
    expect(screen.getByText(/Wednesday sync/)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Wednesday sync/ });
    expect(link.getAttribute("href")).toBe("/events/2026-05-21-sync");
  });

  it("shows calibrated empty-state copy when no commitments", () => {
    render(<YourWeekPane nextRsvp={null} kudosWeekCount={0} />);
    expect(screen.getByText(/No commitments this week/)).toBeInTheDocument();
  });

  it("renders status compose CTA → /this-week", () => {
    render(<YourWeekPane nextRsvp={null} kudosWeekCount={0} />);
    const cta = screen.getByRole("link", { name: /Post your weekly status/ });
    expect(cta.getAttribute("href")).toBe("/this-week");
  });

  it("renders kudos-this-week count when > 0", () => {
    render(<YourWeekPane nextRsvp={null} kudosWeekCount={3} />);
    expect(screen.getByText(/Kudos this week/)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it("omits kudos count when 0", () => {
    render(<YourWeekPane nextRsvp={null} kudosWeekCount={0} />);
    expect(screen.queryByText(/Kudos this week/)).toBeNull();
  });

  describe("§14.6 manipulation-resistance — NO streak / notifications / comparison", () => {
    it("DOM contains no streak / missed / chain copy", () => {
      const { container } = render(
        <YourWeekPane
          nextRsvp={{ slug: "x", title: "X", date: "2026-05-21" }}
          kudosWeekCount={3}
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
