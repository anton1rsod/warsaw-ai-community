import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { EmptyState } from "@/app/components/EmptyState";

afterEach(() => cleanup());

describe("EmptyState — Q3.5 codification", () => {
  it("renders headline always", () => {
    render(
      <EmptyState
        headline="No upcoming events."
        calibration="Next sync is Wednesday."
      />,
    );
    expect(screen.getByText("No upcoming events.")).toBeInTheDocument();
  });

  it("renders calibration when provided", () => {
    render(
      <EmptyState
        headline="No upcoming events."
        calibration="The next weekly sync is Wednesday at 18:30."
      />,
    );
    expect(
      screen.getByText(
        "The next weekly sync is Wednesday at 18:30.",
      ),
    ).toBeInTheDocument();
  });

  it("renders nextAction as a link with provided label + href", () => {
    render(
      <EmptyState
        headline="No upcoming events."
        nextAction={{ label: "Propose an event", href: "/calendar" }}
      />,
    );
    const link = screen.getByRole("link", { name: /Propose an event/ });
    expect(link.getAttribute("href")).toBe("/calendar");
  });

  it("appends ↗ glyph and rel=noopener on external nextAction", () => {
    render(
      <EmptyState
        headline="No charter yet."
        nextAction={{
          label: "Read the charter",
          href: "https://github.com/x/y",
          external: true,
        }}
      />,
    );
    const link = screen.getByRole("link", { name: /Read the charter ↗/ });
    expect(link.getAttribute("rel")).toMatch(/noopener/);
    expect(link.getAttribute("target")).toBe("_blank");
  });

  it("renders BOTH calibration AND nextAction when both provided", () => {
    render(
      <EmptyState
        headline="No upcoming events."
        calibration="Next sync is Wed 18:30."
        nextAction={{ label: "Propose an event", href: "/calendar" }}
      />,
    );
    expect(screen.getByText("Next sync is Wed 18:30.")).toBeInTheDocument();
    expect(screen.getByRole("link")).toBeInTheDocument();
  });

  it("Q3.5 invariant — when calibration AND nextAction both omitted, renders headline only", () => {
    // This pattern exists only when a surface deliberately accepts the
    // terminal state (e.g., /no-access). Phase A surfaces all pass at
    // least one of calibration or nextAction (spec §14.5 enforces).
    render(<EmptyState headline="No more items." />);
    expect(screen.getByText("No more items.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
