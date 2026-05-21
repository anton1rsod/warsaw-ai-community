import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { EventCard } from "@/app/components/EventCard";

afterEach(cleanup);

describe("EventCard", () => {
  const baseProps = {
    slug: "2026-05-21-meetup-4",
    title: "AI Community Meetup № 4",
    date: "2026-05-21",
    startTime: "19:00",
    location: "Grzybowska 85a",
    goingCount: 1,
  };

  it("links to /events/<slug>", () => {
    render(<EventCard {...baseProps} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/events/2026-05-21-meetup-4");
  });

  it("renders Fraunces italic title with the event title", () => {
    render(<EventCard {...baseProps} />);
    const title = screen.getByText(baseProps.title);
    expect(title.className).toMatch(/font-display/);
    expect(title.className).toMatch(/italic/);
  });

  it("date-badge shows day + 3-char uppercase month", () => {
    render(<EventCard {...baseProps} />);
    expect(screen.getByText("21")).toBeInTheDocument();
    expect(screen.getByText("MAY")).toBeInTheDocument();
  });

  it("month uses MAY for May, JUN for June", () => {
    render(<EventCard {...baseProps} date="2026-06-15" />);
    expect(screen.getByText("JUN")).toBeInTheDocument();
  });

  it("meta line shows startTime + location", () => {
    render(<EventCard {...baseProps} />);
    expect(screen.getByText(/19:00/)).toBeInTheDocument();
    expect(screen.getByText(/Grzybowska 85a/)).toBeInTheDocument();
  });

  it("renders going-count pill with numeric label", () => {
    render(<EventCard {...baseProps} goingCount={3} />);
    expect(screen.getByText("3 going")).toBeInTheDocument();
  });

  it("hides going-count pill when goingCount=0", () => {
    render(<EventCard {...baseProps} goingCount={0} />);
    expect(screen.queryByText(/going/)).not.toBeInTheDocument();
  });

  describe("hoverLift", () => {
    it("includes hover translate + focus parity by default", () => {
      render(<EventCard {...baseProps} />);
      const card = screen.getByRole("link");
      expect(card.className).toMatch(/hover:translate-y-\[-2px\]/);
      expect(card.className).toMatch(/focus-visible:translate-y-\[-2px\]/);
    });

    it("omits hover lift when hoverLift=false", () => {
      render(<EventCard {...baseProps} hoverLift={false} />);
      expect(screen.getByRole("link").className).not.toMatch(/hover:translate-y/);
    });
  });

  describe("defensive date parsing", () => {
    it("clamps malformed month to JAN", () => {
      render(<EventCard {...baseProps} date="2026" />);
      expect(screen.getByText("JAN")).toBeInTheDocument();
    });
  });

  describe("showRsvpStateChip", () => {
    it("renders ✓ going chip when state=going", () => {
      render(<EventCard {...baseProps} showRsvpStateChip="going" />);
      expect(screen.getByText("✓ going")).toBeInTheDocument();
    });

    it("renders interested chip when state=interested", () => {
      render(<EventCard {...baseProps} showRsvpStateChip="interested" />);
      expect(screen.getByText(/interested/i)).toBeInTheDocument();
    });

    it("no chip when state=null", () => {
      render(<EventCard {...baseProps} showRsvpStateChip={null} />);
      expect(screen.queryByText("✓ going")).not.toBeInTheDocument();
    });
  });
});
