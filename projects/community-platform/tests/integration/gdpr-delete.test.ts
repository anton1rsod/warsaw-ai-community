import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as GitHubAppModule from "@/lib/github-app";
import { GitHubAppError } from "@/lib/github-app";

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
        }
      : undefined,
  ),
}));

const mockClient = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  deleteFile: vi.fn(),
};

vi.mock("@/lib/github-app", async () => {
  const actual =
    await vi.importActual<typeof GitHubAppModule>("@/lib/github-app");
  return { ...actual, createGitHubApp: vi.fn(() => mockClient) };
});

vi.mock("@/lib/status-reader", () => ({
  readWeekStatuses: vi.fn(async (opts: { week: string }) =>
    opts.week === "2026-W18"
      ? [
          {
            slug: "anton-safronov",
            body: "Hi",
            sha: "anton-w18-sha",
            lastModified: "x",
          },
          {
            slug: "someone-else",
            body: "No",
            sha: "stranger-sha",
            lastModified: "x",
          },
        ]
      : opts.week === "2026-W17"
        ? [
            {
              slug: "anton-safronov",
              body: "Older",
              sha: "anton-w17-sha",
              lastModified: "y",
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

import { POST } from "@/app/api/me/delete/route";
import { auth } from "@/lib/auth";

describe("POST /api/me/delete", () => {
  beforeEach(() => {
    mockClient.readFile.mockReset();
    mockClient.writeFile.mockReset();
    mockClient.deleteFile.mockReset();
    vi.mocked(auth).mockResolvedValue({
      githubHandle: "anton1rsod",
    } as never);
  });

  it("returns 401 when no session", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    const res = await POST(
      new Request("http://localhost/api/me/delete", { method: "POST" }),
    );
    expect(res.status).toBe(401);
    expect(mockClient.deleteFile).not.toHaveBeenCalled();
  });

  it("returns 403 when authenticated but not on roster", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      githubHandle: "stranger",
    } as never);
    const res = await POST(
      new Request("http://localhost/api/me/delete", { method: "POST" }),
    );
    expect(res.status).toBe(403);
    expect(mockClient.deleteFile).not.toHaveBeenCalled();
  });

  it("deletes the profile file at community/members/<slug>.md", async () => {
    mockClient.readFile.mockResolvedValueOnce({
      content: "x",
      sha: "profilesha",
      path: "community/members/anton-safronov.md",
    });
    mockClient.deleteFile.mockResolvedValue(undefined);

    const res = await POST(
      new Request("http://localhost/api/me/delete", { method: "POST" }),
    );
    expect(res.status).toBe(200);
    expect(mockClient.deleteFile).toHaveBeenCalledWith(
      "community/members/anton-safronov.md",
      expect.objectContaining({ sha: "profilesha" }),
    );
  });

  it("does not call deleteFile for the profile when the file does not exist", async () => {
    mockClient.readFile.mockResolvedValueOnce(null);
    mockClient.deleteFile.mockResolvedValue(undefined);
    await POST(
      new Request("http://localhost/api/me/delete", { method: "POST" }),
    );
    const profileCalls = mockClient.deleteFile.mock.calls.filter(
      ([p]) => p === "community/members/anton-safronov.md",
    );
    expect(profileCalls).toHaveLength(0);
  });

  it("deletes the caller's status files only — never another member's", async () => {
    mockClient.readFile.mockResolvedValueOnce(null);
    mockClient.deleteFile.mockResolvedValue(undefined);
    await POST(
      new Request("http://localhost/api/me/delete", { method: "POST" }),
    );
    expect(mockClient.deleteFile).toHaveBeenCalledWith(
      "community/status/2026-W18/anton-safronov.md",
      expect.objectContaining({ sha: "anton-w18-sha" }),
    );
    expect(mockClient.deleteFile).toHaveBeenCalledWith(
      "community/status/2026-W17/anton-safronov.md",
      expect.objectContaining({ sha: "anton-w17-sha" }),
    );
    // Cross-user deletion guard: someone-else's file is NEVER touched.
    for (const call of mockClient.deleteFile.mock.calls) {
      expect(call[0]).not.toContain("someone-else");
      expect(call[0]).not.toBe("community/status/2026-W18/someone-else.md");
    }
  });

  it("treats a not_found error during status delete as idempotent", async () => {
    mockClient.readFile.mockResolvedValueOnce(null);
    // First status delete throws not_found (race: file removed since the read).
    mockClient.deleteFile.mockImplementation(async (path: string) => {
      if (path === "community/status/2026-W18/anton-safronov.md") {
        throw new GitHubAppError("not_found", "vanished");
      }
      return undefined;
    });
    const res = await POST(
      new Request("http://localhost/api/me/delete", { method: "POST" }),
    );
    expect(res.status).toBe(200);
  });

  it("propagates non-not_found errors during status delete", async () => {
    mockClient.readFile.mockResolvedValueOnce(null);
    mockClient.deleteFile.mockImplementation(async (path: string) => {
      if (path.startsWith("community/status/")) {
        throw new GitHubAppError("forbidden", "no perms");
      }
      return undefined;
    });
    await expect(
      POST(new Request("http://localhost/api/me/delete", { method: "POST" })),
    ).rejects.toThrow("no perms");
  });
});
