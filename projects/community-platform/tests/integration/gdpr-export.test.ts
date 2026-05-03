import { beforeEach, describe, expect, it, vi } from "vitest";

// Stub env so lib/env's Zod gate doesn't fire in isolation runs.
vi.mock("@/lib/env", () => ({
  env: {
    NEXTAUTH_SECRET: "x".repeat(32),
    NEXTAUTH_URL: "http://localhost:3000",
    NEXTAUTH_SESSION_MAX_AGE: 2_592_000,
    GITHUB_OAUTH_CLIENT_ID: "c",
    GITHUB_OAUTH_CLIENT_SECRET: "s",
    GITHUB_APP_ID: "12345",
    GITHUB_APP_PRIVATE_KEY:
      "-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----",
    GITHUB_APP_INSTALLATION_ID: "67890",
    GITHUB_REPO_OWNER: "owner",
    GITHUB_REPO_NAME: "repo",
    GITHUB_REPO_BRANCH: "main",
    COMMUNITY_NAME: "Test Community",
    COMMUNITY_SLUG: "test",
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({ githubHandle: "anton1rsod" })),
}));

vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: vi.fn((h: string) =>
    h === "anton1rsod"
      ? {
          slug: "anton-safronov",
          name: "Anton Safronov",
          githubHandle: "anton1rsod",
          profile: { data: { focus: "AI" }, body: "Hello." },
          persona: null,
        }
      : undefined,
  ),
  getContributions: vi.fn(() => ({
    projectCommits: 5,
    adrsFiled: 1,
    meetingsAttended: 2,
    statusPosts: 3,
  })),
}));

vi.mock("@/lib/status-reader", () => ({
  readWeekStatuses: vi.fn(async (opts: { week: string }) =>
    opts.week === "2026-W18"
      ? [
          {
            slug: "anton-safronov",
            body: "Working on it.",
            sha: "s1",
            lastModified: "2026-04-30T12:00:00Z",
          },
          {
            slug: "someone-else",
            body: "Nope.",
            sha: "s2",
            lastModified: "2026-04-30T13:00:00Z",
          },
        ]
      : [],
  ),
}));

vi.mock("@octokit/auth-app", () => ({
  createAppAuth: vi.fn(
    () =>
      async (_opts: { type: string }) => ({
        token: "ghs_test",
        type: "token",
      }),
  ),
}));

import { GET } from "@/app/api/me/export/route";
import { auth } from "@/lib/auth";

describe("GET /api/me/export", () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "anton1rsod",
    } as never);
  });

  it("returns 401 when there's no session", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    const res = await GET(new Request("http://localhost/api/me/export"));
    expect(res.status).toBe(401);
  });

  it("returns 403 when authenticated but not on roster", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      githubHandle: "stranger",
    } as never);
    const res = await GET(new Request("http://localhost/api/me/export"));
    expect(res.status).toBe(403);
  });

  it("returns JSON with member, contributions, and self-only statuses", async () => {
    const res = await GET(new Request("http://localhost/api/me/export"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.handle).toBe("anton1rsod");
    expect(body.member.name).toBe("Anton Safronov");
    expect(body.member.slug).toBe("anton-safronov");
    expect(body.contributions.projectCommits).toBe(5);
    expect(Array.isArray(body.statuses)).toBe(true);
    // Only the caller's own statuses are returned — never other members'.
    for (const s of body.statuses) {
      expect(s.slug).toBe("anton-safronov");
    }
    expect(typeof body.exportedAt).toBe("string");
    expect(typeof body.currentWeek).toBe("string");
  });
});
