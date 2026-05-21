import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type * as ContentSnapshotModule from "@/lib/content-snapshot";

vi.mock("@/lib/env", () => ({
  env: {
    NEXTAUTH_SECRET: "x".repeat(32),
    NEXTAUTH_URL: "http://localhost:3000",
    GITHUB_OAUTH_CLIENT_ID: "x",
    GITHUB_OAUTH_CLIENT_SECRET: "x",
    GITHUB_APP_ID: "x",
    GITHUB_APP_PRIVATE_KEY: "x",
    GITHUB_APP_INSTALLATION_ID: "x",
    GITHUB_REPO_OWNER: "anton1rsod",
    GITHUB_REPO_NAME: "warsaw-ai-community",
    GITHUB_REPO_BRANCH: "main",
    COMMUNITY_NAME: "Warsaw AI",
    COMMUNITY_SLUG: "warsaw-ai",
    INVITE_SECRET: "x".repeat(32),
  },
}));
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/content-snapshot", async (importOriginal) => {
  const actual = await importOriginal<typeof ContentSnapshotModule>();
  return {
    ...actual,
    isAdmin: vi.fn(),
  };
});
vi.mock("@/lib/community-defaults", () => ({
  getDefaults: () => ({
    timezone: "Europe/Warsaw",
    events: {
      defaultStartTime: "18:00",
      defaultDurationMinutes: 120,
      defaultLocation: "TBD",
    },
    meetings: {
      defaultStartTime: "18:00",
      defaultDurationMinutes: 60,
      defaultLocation: "",
    },
  }),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`__redirect__:${url}`);
  }),
  useRouter: () => ({ push: vi.fn() }),
}));

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/content-snapshot";

afterEach(cleanup);

describe("/admin/events/new page", () => {
  it("redirects to /login when not signed in", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const { default: Page } = await import("@/app/admin/events/new/page");
    await expect(Page()).rejects.toThrow("__redirect__:/login");
  });

  it("redirects to /home when signed in but not admin", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "joe" } as never);
    vi.mocked(isAdmin).mockReturnValue(false);
    const { default: Page } = await import("@/app/admin/events/new/page");
    await expect(Page()).rejects.toThrow("__redirect__:/home");
  });

  it("renders the New event heading for admin", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    vi.mocked(isAdmin).mockReturnValue(true);
    const { default: Page } = await import("@/app/admin/events/new/page");
    const tree = await Page();
    render(tree);
    expect(screen.getByRole("heading", { name: /new event/i })).toBeTruthy();
  });
});

describe("/admin/events/new page — form wiring", () => {
  it("renders all EventForm fields under the heading", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    vi.mocked(isAdmin).mockReturnValue(true);
    const { default: Page } = await import("@/app/admin/events/new/page");
    const tree = await Page();
    render(tree);

    expect(screen.getByLabelText(/title/i)).toBeTruthy();
    expect(screen.getByLabelText(/date/i)).toBeTruthy();
    expect(screen.getByLabelText(/start time/i)).toBeTruthy();
    expect(screen.getByLabelText(/duration/i)).toBeTruthy();
    expect(screen.getByLabelText(/host/i)).toBeTruthy();
    expect(screen.getByLabelText(/body/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /create event/i })).toBeTruthy();
  });
});
