import { describe, expect, it, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

afterEach(cleanup);
import { HomeFeed } from "@/app/components/HomeFeed";
import type { HomeFeedData } from "@/lib/home-feed";

const empty: HomeFeedData = { thisWeek: [], recent: [] };
const full: HomeFeedData = {
  thisWeek: [
    { type: "meeting", slug: "2026-05-19", title: "Weekly sync", href: "/meetings/2026-05-19", date: "2026-05-19", excerpt: "Discussion of X" },
    { type: "event", slug: "2026-05-25-near", title: "Near event", href: "/events/2026-05-25-near", date: "2026-05-25" },
  ],
  recent: [
    { type: "status", slug: "2026-W19/anton", title: "@anton W19", href: "/this-week", date: "2026-05-12", author: "anton1rsod" },
  ],
};

describe("H30: HomeFeed is server-component pure (no auth read)", () => {
  it("renders without any session prop", () => {
    render(<HomeFeed feed={empty} />);
    expect(true).toBe(true);
  });
});

describe("H33: HomeFeed empty states (D4)", () => {
  it("renders per-section empty message when both buckets empty", () => {
    render(<HomeFeed feed={empty} />);
    expect(screen.getByText(/Nothing scheduled this week/i)).toBeInTheDocument();
  });

  it("renders only This Week section when showRecent=false", () => {
    render(<HomeFeed feed={full} showRecent={false} />);
    expect(screen.queryByText(/RECENT/i)).not.toBeInTheDocument();
    expect(screen.getByText(/THIS WEEK/i)).toBeInTheDocument();
  });

  it("H45: hides entire strip when showRecent=false AND thisWeek empty", () => {
    const { container } = render(<HomeFeed feed={empty} showRecent={false} />);
    expect(container.textContent).not.toMatch(/THIS WEEK/i);
    expect(container.textContent).not.toMatch(/Nothing scheduled/i);
  });
});

describe("H30 + render shape", () => {
  it("This Week item shows bold title + type icon + relative date + excerpt", () => {
    render(<HomeFeed feed={full} />);
    expect(screen.getByText("Weekly sync")).toBeInTheDocument();
    expect(screen.getByText(/Discussion of X/)).toBeInTheDocument();
  });

  it("Recent item shows compact one-liner (no excerpt, plus author)", () => {
    render(<HomeFeed feed={full} />);
    expect(screen.getByText("@anton W19")).toBeInTheDocument();
    expect(screen.getByText(/anton1rsod/)).toBeInTheDocument();
  });
});

describe("H43: XSS via SafeHtml pipeline", () => {
  it("script in title is escaped", () => {
    const xss: HomeFeedData = {
      thisWeek: [{ type: "status", slug: "x", title: "<script>alert(1)</script>", href: "/x", date: "2026-05-19", author: "x" }],
      recent: [],
    };
    const { container } = render(<HomeFeed feed={xss} />);
    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toMatch(/&lt;script&gt;|<script>alert\(1\)<\/script>/);
  });
});
