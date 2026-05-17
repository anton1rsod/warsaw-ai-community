import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("@/lib/env", () => ({
  env: { COMMUNITY_NAME: "Warsaw AI Community", COMMUNITY_SLUG: "warsaw-ai" },
}));
vi.mock("@/lib/content-snapshot", () => ({
  listMeetingsFromSnapshot: () => [],
  listEventsFromSnapshot: () => [],
}));

afterEach(cleanup);

describe("H30: /home is SSG / no auth() read", () => {
  it("renders without calling auth()", async () => {
    const { default: HomePage } = await import("@/app/home/page");
    const ui = await HomePage();
    render(ui);
    const { auth } = await import("@/lib/auth");
    expect(auth).not.toHaveBeenCalled();
  });

  it("renders HomeFeed empty state when there are no meetings/events", async () => {
    const { default: HomePage } = await import("@/app/home/page");
    const ui = await HomePage();
    render(ui);
    expect(screen.getByText(/Nothing scheduled this week/i)).toBeInTheDocument();
  });

  it("renders the community name in the header", async () => {
    const { default: HomePage } = await import("@/app/home/page");
    const ui = await HomePage();
    render(ui);
    expect(screen.getByRole("heading", { level: 1, name: /Warsaw AI Community/ })).toBeInTheDocument();
  });
});
