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
// v0.5.1 H82: EventRoster now calls auth() internally to gate the "+N members
// (sign in to see)" chip on viewer state. Default mock returns null = anonymous,
// which preserves the existing test expectations (chip shows when hiddenCount > 0).
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => null),
}));

import { EventRoster } from "@/app/components/EventRoster";

afterEach(cleanup);

describe("H32: EventRoster (D10, D12)", () => {
  it("renders Going + Interested sub-rosters with v0.6 mono labels", async () => {
    const ui = await EventRoster({ eventSlug: "2026-06-15-hack" });
    render(ui);
    // v0.6 markup: "// going (5)" (2 public + 3 hidden); anonymous viewer
    // sees "// interested (sign in to see)" rather than the count.
    expect(screen.getByText(/\/\/ going \(5\)/)).toBeInTheDocument();
    expect(
      screen.getByText(/\/\/ interested \(sign in to see\)/),
    ).toBeInTheDocument();
  });

  it("renders avatars for public slugs (link wrappers carry member name as title)", async () => {
    const ui = await EventRoster({ eventSlug: "2026-06-15-hack" });
    render(ui);
    // v0.6: Avatar primitive wrapped in <a href="/members/<slug>" title={name}>
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

  it("empty state on going side when totals are 0 (v0.6 i18n copy)", async () => {
    const ui = await EventRoster({ eventSlug: "2026-07-04-empty" });
    render(ui);
    // v0.6 empty-state copy from `s("empty.eventDetail.going")`.
    expect(screen.getByText(/Be the first to RSVP\./i)).toBeInTheDocument();
    // Anonymous viewer with 0-total interested side: NO empty-state copy renders
    // (label already says "(sign in to see)" — list is suppressed entirely).
    expect(
      screen.queryByText(/No one's marked interested yet/i),
    ).not.toBeInTheDocument();
  });

  it("graceful handling when eventSlug has no roster entry", async () => {
    const ui = await EventRoster({ eventSlug: "no-such-event" });
    render(ui);
    // Falls through to empty path (0 total on both sides).
    expect(screen.getByText(/Be the first to RSVP\./i)).toBeInTheDocument();
  });

  it("avatar tile falls back to slug when member missing", async () => {
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
