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
  findMemberByHandle: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("HomeHeader: anonymous", () => {
  it("renders title + subtitle + Sign-in CTA when no session", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue(null as never);
    const { HomeHeader } = await import("@/app/components/HomeHeader");
    const ui = await HomeHeader();
    render(ui);
    expect(screen.getByRole("heading", { level: 1, name: /Warsaw AI Community/ })).toBeInTheDocument();
    expect(screen.getByText(/Discovery \+ decisions \+ ship cadence/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sign in/i })).toHaveAttribute("href", "/login");
    expect(screen.queryByText(/Sign out/i)).not.toBeInTheDocument();
  });

  it("renders Sign-in CTA when session exists but member is not on roster (defensive)", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue({ githubHandle: "stranger" } as never);
    const { findMemberByHandle } = await import("@/lib/content-snapshot");
    vi.mocked(findMemberByHandle).mockReturnValue(undefined);
    const { HomeHeader } = await import("@/app/components/HomeHeader");
    const ui = await HomeHeader();
    render(ui);
    expect(screen.getByRole("link", { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.queryByText(/@stranger/)).not.toBeInTheDocument();
  });
});

describe("HomeHeader: signed-in member", () => {
  it("renders member nav + handle + Sign-out button when session + roster match", async () => {
    const { auth } = await import("@/lib/auth");
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    const { findMemberByHandle } = await import("@/lib/content-snapshot");
    vi.mocked(findMemberByHandle).mockReturnValue({
      slug: "anton-safronov",
      name: "Anton Safronov",
      githubHandle: "anton1rsod",
    } as never);
    const { HomeHeader } = await import("@/app/components/HomeHeader");
    const ui = await HomeHeader();
    render(ui);
    expect(screen.getByRole("link", { name: /Your week/i })).toHaveAttribute("href", "/this-week");
    expect(screen.getByRole("link", { name: /^Members$/i })).toHaveAttribute("href", "/members");
    expect(screen.getByRole("link", { name: /Edit profile/i })).toHaveAttribute("href", "/me/edit");
    expect(screen.getByText(/@anton1rsod/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign out/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Sign in$/i })).not.toBeInTheDocument();
  });
});
