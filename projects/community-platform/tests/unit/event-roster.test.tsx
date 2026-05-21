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

  it("signed-in viewer still sees v0.6 going-count label", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "anton1rsod",
    } as never);
    const el = await EventRoster({ eventSlug: "with-hidden" });
    render(el);
    // v0.6 markup: "// going (3)" — 1 public + 2 hidden = 3 total
    expect(screen.queryByText(/\/\/ going \(3\)/)).not.toBeNull();
  });

  it("hiddenCount === 0 means no chip in either viewer state", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const el = await EventRoster({ eventSlug: "no-hidden" });
    render(el);
    expect(screen.queryByText(/members \(sign in to see\)/)).toBeNull();
  });
});

describe("H85: anonymous interested-label and hidden-count chip", () => {
  // H85 here = the v0.5.1 "(sign in to see)" surface contract carried into v0.6:
  //   1. anonymous viewer interested label shows "// interested (sign in to see)"
  //   2. anonymous viewer sees the "+N members (sign in to see)" chip on the
  //      going column when hiddenCount > 0
  // Both are the v0.6 restyle of the v0.5.1 H82+H85 chip behaviors.
  it("anonymous viewer sees `// interested (sign in to see)` label", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const el = await EventRoster({ eventSlug: "with-hidden" });
    render(el);
    expect(
      screen.queryByText(/\/\/ interested \(sign in to see\)/),
    ).not.toBeNull();
  });

  it("signed-in viewer sees `// interested (N)` label, not the sign-in label", async () => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "anton1rsod",
    } as never);
    const el = await EventRoster({ eventSlug: "with-hidden" });
    render(el);
    expect(screen.queryByText(/\/\/ interested \(0\)/)).not.toBeNull();
    expect(
      screen.queryByText(/\/\/ interested \(sign in to see\)/),
    ).toBeNull();
  });

  it("+N chip is a sign-in link to /login?callbackUrl=/events/<slug>", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const el = await EventRoster({ eventSlug: "with-hidden" });
    render(el);
    const chip = screen.getByRole("link", {
      name: /\+ 2 members \(sign in to see\)/i,
    });
    expect(chip.getAttribute("href")).toBe(
      "/login?callbackUrl=/events/with-hidden",
    );
  });
});
