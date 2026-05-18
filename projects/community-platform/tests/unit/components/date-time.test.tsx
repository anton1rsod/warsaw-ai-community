import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { DateTime } from "@/app/components/DateTime";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function freezeNow(iso: string): void {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(iso));
}

describe("DateTime — Q5.4 list/detail split", () => {
  it("context='list' renders relative + absolute title attribute", () => {
    freezeNow("2026-05-18T10:00:00Z");
    render(<DateTime iso="2026-05-18" context="list" />);
    const el = screen.getByText("Today");
    expect(el.getAttribute("title")).toMatch(/2026|May/);
  });

  it("context='list' tomorrow", () => {
    freezeNow("2026-05-18T10:00:00Z");
    render(<DateTime iso="2026-05-19" context="list" />);
    expect(screen.getByText("Tomorrow")).toBeInTheDocument();
  });

  it("context='list' yesterday", () => {
    freezeNow("2026-05-18T10:00:00Z");
    render(<DateTime iso="2026-05-17" context="list" />);
    expect(screen.getByText("Yesterday")).toBeInTheDocument();
  });

  it("context='list' within a week shows weekday", () => {
    freezeNow("2026-05-18T10:00:00Z");
    render(<DateTime iso="2026-05-21" context="list" />);
    expect(screen.getByText(/Thu|Wed|Fri/)).toBeInTheDocument();
  });

  it("context='list' past >1 day shows 'Nd ago'", () => {
    freezeNow("2026-05-18T10:00:00Z");
    render(<DateTime iso="2026-05-10" context="list" />);
    expect(screen.getByText(/8d ago/)).toBeInTheDocument();
  });

  it("context='list' future >7 days shows D Mon", () => {
    freezeNow("2026-05-18T10:00:00Z");
    render(<DateTime iso="2026-06-15" context="list" />);
    expect(screen.getByText(/15 Jun|Jun 15/)).toBeInTheDocument();
  });

  it("context='detail' renders absolute with CEST suffix when start_time present", () => {
    render(
      <DateTime
        iso="2026-05-21"
        context="detail"
        startTime="18:30"
        durationMinutes={150}
      />,
    );
    expect(screen.getByText(/Thursday.*21.*May/)).toBeInTheDocument();
    expect(screen.getByText(/CEST/)).toBeInTheDocument();
    expect(screen.getByText(/18:30/)).toBeInTheDocument();
    expect(screen.getByText(/21:00/)).toBeInTheDocument();
  });

  it("context='detail' without start_time renders just date", () => {
    render(<DateTime iso="2026-05-21" context="detail" />);
    expect(screen.getByText(/Thursday.*21.*May/)).toBeInTheDocument();
    expect(screen.queryByText(/CEST/)).toBeNull();
  });
});
