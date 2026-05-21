import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));
vi.mock("@/lib/__generated__/event-rosters.json", () => ({
  default: {
    "with-hidden": {
      going: { publicSlugs: ["alice"], hiddenCount: 2 },
      interested: { publicSlugs: [], hiddenCount: 0 },
    },
    "no-hidden": {
      going: { publicSlugs: ["alice", "bob"], hiddenCount: 0 },
      interested: { publicSlugs: [], hiddenCount: 0 },
    },
  },
}));
vi.mock("@/lib/content-snapshot", () => ({
  findMemberBySlug: (slug: string) => ({ slug, name: slug.toUpperCase() }),
}));

import { auth } from "@/lib/auth";
import { EventRoster } from "@/app/components/EventRoster";

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("H82: EventRoster viewer-state at render-time", () => {
  it("anonymous viewer sees +N (sign in to see) chip when hiddenCount > 0", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const el = await EventRoster({ eventSlug: "with-hidden" });
    render(el);
    expect(screen.queryByText(/members \(sign in to see\)/)).not.toBeNull();
  });

  it("signed-in viewer does NOT see +N (sign in to see) chip", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "anton1rsod",
    } as never);
    const el = await EventRoster({ eventSlug: "with-hidden" });
    render(el);
    expect(screen.queryByText(/members \(sign in to see\)/)).toBeNull();
  });

  it("signed-in viewer still sees h3 totals", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "anton1rsod",
    } as never);
    const el = await EventRoster({ eventSlug: "with-hidden" });
    render(el);
    // Going: 1 public + 2 hidden = 3 total
    expect(screen.queryByText(/Going \(3 total\)/)).not.toBeNull();
  });

  it("hiddenCount === 0 means no chip in either viewer state", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const el = await EventRoster({ eventSlug: "no-hidden" });
    render(el);
    expect(screen.queryByText(/members \(sign in to see\)/)).toBeNull();
  });
});
