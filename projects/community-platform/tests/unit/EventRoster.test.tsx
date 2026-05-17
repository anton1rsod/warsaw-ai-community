import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/lib/__generated__/event-rosters.json", () => ({
  default: {
    "2026-06-15-hack": {
      going: { publicSlugs: ["anton-safronov", "alice"], hiddenCount: 3 },
      interested: { publicSlugs: ["bob"], hiddenCount: 0 },
    },
    "2026-07-04-empty": {
      going: { publicSlugs: [], hiddenCount: 0 },
      interested: { publicSlugs: [], hiddenCount: 0 },
    },
  },
}));
vi.mock("@/lib/content-snapshot", () => ({
  findMemberBySlug: (slug: string) =>
    slug === "anton-safronov"
      ? { slug, name: "Anton Safronov" }
      : slug === "alice"
        ? { slug, name: "Alice" }
        : slug === "bob"
          ? { slug, name: "Bob" }
          : undefined,
}));

import { EventRoster } from "@/app/components/EventRoster";

afterEach(cleanup);

describe("H32: EventRoster (D10, D12)", () => {
  it("renders Going + Interested sub-rosters with totals", async () => {
    const ui = await EventRoster({ eventSlug: "2026-06-15-hack" });
    render(ui);
    // Going: 2 public + 3 hidden = 5 total. Interested: 1 + 0 = 1.
    expect(screen.getByText(/Going \(5 total\)/)).toBeInTheDocument();
    expect(screen.getByText(/Interested \(1 total\)/)).toBeInTheDocument();
  });

  it("renders avatars for public slugs (initials)", async () => {
    const ui = await EventRoster({ eventSlug: "2026-06-15-hack" });
    render(ui);
    // Avatar links use title attribute for the full name; accessible name is the initials text.
    expect(screen.getByTitle("Anton Safronov")).toHaveAttribute(
      "href",
      "/members/anton-safronov",
    );
    expect(screen.getByTitle("Alice")).toHaveAttribute(
      "href",
      "/members/alice",
    );
  });

  it("D12: renders hidden-count CTA when hiddenCount > 0", async () => {
    const ui = await EventRoster({ eventSlug: "2026-06-15-hack" });
    render(ui);
    expect(
      screen.getByRole("link", { name: /\+ 3 members \(sign in to see\)/i }),
    ).toHaveAttribute("href", "/login?callbackUrl=/events/2026-06-15-hack");
  });

  it("hidden CTA absent when hiddenCount = 0", async () => {
    const ui = await EventRoster({ eventSlug: "2026-06-15-hack" });
    render(ui);
    // Interested side has 0 hidden — no '+ 0 members' link should appear.
    expect(
      screen.queryByText(/0 members \(sign in to see\)/i),
    ).not.toBeInTheDocument();
  });

  it("empty state on both sides when totals are 0", async () => {
    const ui = await EventRoster({ eventSlug: "2026-07-04-empty" });
    render(ui);
    expect(
      screen.getByText(/No one's marked going yet/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No one's marked interested yet/i),
    ).toBeInTheDocument();
  });

  it("graceful handling when eventSlug has no roster entry", async () => {
    const ui = await EventRoster({ eventSlug: "no-such-event" });
    render(ui);
    // Falls through to empty path (0 total on both sides).
    expect(
      screen.getByText(/No one's marked going yet/i),
    ).toBeInTheDocument();
  });

  it("avatar initials fall back to slug prefix when member missing", async () => {
    vi.doMock("@/lib/__generated__/event-rosters.json", () => ({
      default: {
        "x-event": {
          going: { publicSlugs: ["unknown-slug"], hiddenCount: 0 },
          interested: { publicSlugs: [], hiddenCount: 0 },
        },
      },
    }));
    vi.resetModules();
    const Mod = await import("@/app/components/EventRoster");
    const ui = await Mod.EventRoster({ eventSlug: "x-event" });
    render(ui);
    // unknown-slug → no member found → title falls back to slug itself.
    expect(screen.getByTitle("unknown-slug")).toBeInTheDocument();
  });
});
