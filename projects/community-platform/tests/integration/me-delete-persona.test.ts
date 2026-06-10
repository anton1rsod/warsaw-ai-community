/**
 * H146: GDPR delete route must also erase persona files for the member.
 *
 * Tests:
 * 1. Real branch: deleteFile called for both persona-<slug>.public.md and
 *    persona-<slug>.md when readFile returns a sha for them.
 * 2. Tolerant: if readFile returns null for a persona file, deleteFile is NOT
 *    called for that path.
 * 3. E2E mock branch: mockPersonaStore.remove(slug) is invoked.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as GitHubAppModule from "@/lib/github-app";
import { mockPersonaStore } from "@/app/actions/_test-persona-store";

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

// Minimal status-reader mock: no statuses → no status deletes (keeps focus on persona).
vi.mock("@/lib/status-reader", () => ({
  readWeekStatuses: vi.fn(async () => []),
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

const REQ = new Request("http://localhost/api/me/delete", { method: "POST" });

describe("H146: POST /api/me/delete — persona file erasure", () => {
  beforeEach(() => {
    mockClient.readFile.mockReset();
    mockClient.writeFile.mockReset();
    mockClient.deleteFile.mockReset();
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
  });

  it("deletes both persona files when readFile returns a sha for each", async () => {
    // Profile file absent (null) to keep test focused on persona deletes.
    mockClient.readFile.mockImplementation(async (path: string) => {
      if (path === "community/members/anton-safronov.md") return null;
      if (
        path ===
        "persona-builder/personas/anton-safronov/persona-anton-safronov.public.md"
      ) {
        return { content: "public content", sha: "pub-sha", path };
      }
      if (
        path ===
        "persona-builder/personas/anton-safronov/persona-anton-safronov.md"
      ) {
        return { content: "full content", sha: "full-sha", path };
      }
      return null;
    });
    mockClient.deleteFile.mockResolvedValue(undefined);

    const res = await POST(REQ);
    expect(res.status).toBe(200);

    expect(mockClient.deleteFile).toHaveBeenCalledWith(
      "persona-builder/personas/anton-safronov/persona-anton-safronov.public.md",
      expect.objectContaining({ sha: "pub-sha" }),
    );
    expect(mockClient.deleteFile).toHaveBeenCalledWith(
      "persona-builder/personas/anton-safronov/persona-anton-safronov.md",
      expect.objectContaining({ sha: "full-sha" }),
    );
  });

  it("does NOT call deleteFile for a persona file when readFile returns null (tolerant)", async () => {
    // Profile absent, public persona absent, full persona present.
    mockClient.readFile.mockImplementation(async (path: string) => {
      if (
        path ===
        "persona-builder/personas/anton-safronov/persona-anton-safronov.md"
      ) {
        return { content: "full", sha: "full-sha", path };
      }
      return null;
    });
    mockClient.deleteFile.mockResolvedValue(undefined);

    const res = await POST(REQ);
    expect(res.status).toBe(200);

    // Only the present file should be deleted.
    expect(mockClient.deleteFile).toHaveBeenCalledWith(
      "persona-builder/personas/anton-safronov/persona-anton-safronov.md",
      expect.objectContaining({ sha: "full-sha" }),
    );
    // .public.md was absent → must NOT be deleted.
    const publicDeleteCalls = mockClient.deleteFile.mock.calls.filter(([p]) =>
      p.endsWith("persona-anton-safronov.public.md"),
    );
    expect(publicDeleteCalls).toHaveLength(0);
  });

  it("skips both persona deletes when readFile returns null for both (tolerant — member never had persona)", async () => {
    mockClient.readFile.mockResolvedValue(null);
    mockClient.deleteFile.mockResolvedValue(undefined);

    const res = await POST(REQ);
    expect(res.status).toBe(200);

    const personaCalls = mockClient.deleteFile.mock.calls.filter(([p]) =>
      (p as string).startsWith("persona-builder/"),
    );
    expect(personaCalls).toHaveLength(0);
  });

  describe("E2E mock branch", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_E2E_MODE", "1");
      mockPersonaStore.reset();
    });
    afterEach(() => {
      vi.unstubAllEnvs();
      mockPersonaStore.reset();
    });

    it("clears mockPersonaStore for the member's slug", async () => {
      // Seed a persona entry; after DELETE it must be removed.
      mockPersonaStore.write("anton-safronov", "Some AI persona content");
      expect(mockPersonaStore.get("anton-safronov")).not.toBeNull();

      const res = await POST(REQ);
      expect(res.status).toBe(200);

      expect(mockPersonaStore.get("anton-safronov")).toBeNull();
      // Real client must NOT be called in E2E mode.
      expect(mockClient.deleteFile).not.toHaveBeenCalled();
    });
  });
});
