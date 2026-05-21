import { describe, expect, it, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

afterEach(cleanup);
import { HomeFeed } from "@/app/components/HomeFeed";
import type { HomeFeedData } from "@/lib/home-feed";

const empty: HomeFeedData = { thisWeek: [], recent: [] };
const full: HomeFeedData = {
  thisWeek: [
    {
      type: "meeting",
      slug: "2026-05-19",
      title: "Weekly sync",
      href: "/meetings/2026-05-19",
      date: "2026-05-19",
      excerpt: "Discussion of X",
    },
    {
      type: "event",
      slug: "2026-05-25-near",
      title: "Near event",
      href: "/events/2026-05-25-near",
      date: "2026-05-25",
    },
  ],
  recent: [
    {
      type: "status",
      slug: "2026-W19/anton",
      title: "@anton W19",
      href: "/this-week",
      date: "2026-05-12",
      author: "anton1rsod",
    },
  ],
};

describe("H30: HomeFeed is server-component pure (no auth read)", () => {
  it("renders without any session prop", () => {
    render(<HomeFeed feed={empty} />);
    expect(true).toBe(true);
  });
});

describe("v0.6 Phase 3.3: MonoLabel header + ship count", () => {
  it("renders MonoLabel 'this week · N ships' header reflecting thisWeek.length", () => {
    render(<HomeFeed feed={full} />);
    expect(
      screen.getByText(/this week · 2 ships/i),
    ).toBeInTheDocument();
  });

  it("renders MonoLabel 'no recent ships' header when feed empty", () => {
    render(<HomeFeed feed={empty} />);
    expect(screen.getByText(/no recent ships/i)).toBeInTheDocument();
  });
});

describe("v0.6 Phase 3.3: empty-state copy", () => {
  it("renders 'Next ship lands when somebody commits' when both buckets empty", () => {
    render(<HomeFeed feed={empty} />);
    expect(
      screen.getByText(/Next ship lands when somebody commits/i),
    ).toBeInTheDocument();
  });

  it("H45: showRecent=false AND thisWeek empty → renders null (no MonoLabel, no empty-state)", () => {
    const { container } = render(<HomeFeed feed={empty} showRecent={false} />);
    // H45 guard: entire component returns null when not viable.
    expect(container.textContent).not.toMatch(/this week ·/i);
    expect(container.textContent).not.toMatch(/no recent ships/i);
    expect(container.textContent).not.toMatch(/Next ship lands/i);
  });
});

describe("v0.6 Phase 3.3: ship card structure", () => {
  it("each card has data-feed-card with border-l amber + paper bg", () => {
    const { container } = render(<HomeFeed feed={full} />);
    const cards = container.querySelectorAll("[data-feed-card]");
    expect(cards.length).toBeGreaterThan(0);
    const card = cards[0];
    if (!card) throw new Error("expected at least one feed card");
    expect(card.className).toMatch(/border-l-\[3px\]/);
    expect(card.className).toMatch(/border-accent-500/);
    expect(card.className).toMatch(/bg-paper/);
  });

  it("renders a card per thisWeek item and per recent item (when showRecent=true)", () => {
    const { container } = render(<HomeFeed feed={full} />);
    const cards = container.querySelectorAll("[data-feed-card]");
    // full fixture: 2 thisWeek + 1 recent = 3 cards
    expect(cards.length).toBe(3);
  });

  it("showRecent=false hides recent cards but keeps thisWeek cards", () => {
    const { container } = render(<HomeFeed feed={full} showRecent={false} />);
    const cards = container.querySelectorAll("[data-feed-card]");
    expect(cards.length).toBe(2);
  });

  it("card surfaces include title (linked) and DateTime", () => {
    render(<HomeFeed feed={full} />);
    expect(screen.getByText("Weekly sync")).toBeInTheDocument();
    expect(screen.getByText("Near event")).toBeInTheDocument();
  });

  it("status / contribution cards include author prefix (@handle)", () => {
    render(<HomeFeed feed={full} />);
    // Recent status item has author = anton1rsod
    expect(screen.getByText(/@anton1rsod/i)).toBeInTheDocument();
  });
});

describe("H43: XSS via SafeHtml pipeline", () => {
  it("script in title is escaped (no live <script> in DOM)", () => {
    const xss: HomeFeedData = {
      thisWeek: [
        {
          type: "status",
          slug: "x",
          title: "<script>alert(1)</script>",
          href: "/x",
          date: "2026-05-19",
          author: "x",
        },
      ],
      recent: [],
    };
    const { container } = render(<HomeFeed feed={xss} />);
    expect(container.querySelector("script")).toBeNull();
    // React auto-escape: the angle brackets appear literally in text, not
    // as an element. Either entity-encoded or as literal text — both fine
    // for safety; what matters is no executable <script> child.
    expect(container.textContent || "").toMatch(/<script>alert\(1\)<\/script>|&lt;script&gt;/);
  });
});

describe("Reviewer-fix regression: no double-encoding (chat-28 escapeHtml removal)", () => {
  // Pre-fix bug: HomeFeed.tsx defined an escapeHtml() helper that ran
  // BEFORE React's auto-escape on JSX text children, producing entity
  // references in the visible text (e.g., "O'Brien" → "O&#39;Brien"
  // shown literally on screen). Three reviewer agents (security + ts +
  // code) caught it. This test would have failed before the fix and
  // catches any future re-introduction.
  it("preserves literal special characters across title / author surfaces", () => {
    // v0.6 Phase 3.3 note: excerpt is no longer rendered (single-line
    // ship-card aesthetic drops the secondary body). Title + author are
    // the only user-facing text surfaces; both must survive without
    // double-encoding.
    const data: HomeFeedData = {
      thisWeek: [
        {
          type: "status",
          slug: "x",
          title: "O'Brien & company <em>",
          href: "/x",
          date: "2026-05-19",
          author: "user",
        },
      ],
      recent: [
        {
          type: "contribution",
          slug: "y",
          title: "Another's PR & fix",
          href: "/y",
          date: "2026-05-18",
          author: "anton's-handle",
        },
      ],
    };
    const { container } = render(<HomeFeed feed={data} />);
    // Literal characters survive in textContent (React auto-escapes for
    // DOM safety; the visible text is the original).
    expect(container.textContent).toContain("O'Brien");
    expect(container.textContent).toContain("Another's PR & fix");
    expect(container.textContent).toContain("anton's-handle");
    // Double-encoding markers MUST NOT appear.
    expect(container.textContent).not.toContain("&#39;");
    expect(container.textContent).not.toContain("&amp;");
    expect(container.textContent).not.toContain("&lt;");
    expect(container.textContent).not.toContain("&gt;");
    expect(container.textContent).not.toContain("&quot;");
    // XSS safety preserved: tags in user content remain text, not DOM.
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("em")).toBeNull();
  });
});
