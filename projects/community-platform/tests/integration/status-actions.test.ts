import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as GitHubAppModule from "@/lib/github-app";
import { GitHubAppError } from "@/lib/github-app";

// Mock env so lib/env's Zod validation doesn't fire when this test file
// is run in isolation (e.g., `pnpm vitest run tests/integration/status-actions.test.ts`).
// pnpm test:coverage works without the mock because process.env is loaded
// from the developer environment, but isolation runs need the stub.
vi.mock("@/lib/env", () => ({
  env: {
    NEXTAUTH_SECRET: "x".repeat(32),
    NEXTAUTH_URL: "http://localhost:3000",
    NEXTAUTH_SESSION_MAX_AGE: 2_592_000,
    GITHUB_OAUTH_CLIENT_ID: "test-client-id",
    GITHUB_OAUTH_CLIENT_SECRET: "test-client-secret",
    GITHUB_APP_ID: "12345",
    GITHUB_APP_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----",
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

const mockClient = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  deleteFile: vi.fn(),
};

vi.mock("@/lib/github-app", async () => {
  const actual =
    await vi.importActual<typeof GitHubAppModule>("@/lib/github-app");
  return {
    ...actual,
    createGitHubApp: vi.fn(() => mockClient),
  };
});

vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: vi.fn((h: string) =>
    h === "anton1rsod"
      ? { slug: "anton-safronov", name: "Anton Safronov" }
      : undefined,
  ),
}));

import { auth } from "@/lib/auth";
import { deleteStatus, editStatus, postStatus } from "@/app/actions/status";

describe("status actions", () => {
  beforeEach(() => {
    mockClient.readFile.mockReset();
    mockClient.writeFile.mockReset();
    mockClient.deleteFile.mockReset();
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
  });

  describe("postStatus", () => {
    it("creates a file at community/status/<week>/<slug>.md with frontmatter body", async () => {
      mockClient.writeFile.mockResolvedValueOnce({ sha: "newsha" });
      const result = await postStatus({ week: "2026-W18", body: "Hello" });
      expect(result).toEqual({ ok: true, sha: "newsha" });
      expect(mockClient.writeFile).toHaveBeenCalledTimes(1);
      const call = mockClient.writeFile.mock.calls[0];
      if (!call) throw new Error("expected one writeFile call");
      const [path, content, options] = call;
      expect(path).toBe("community/status/2026-W18/anton-safronov.md");
      expect(content).toContain("week: 2026-W18");
      expect(content).toContain("author: anton1rsod");
      expect(content).toContain("updated_at:");
      expect(content).toContain("Hello");
      expect(options).toMatchObject({
        message: expect.stringContaining("status"),
      });
      // First post should not pass a SHA.
      expect(options).not.toHaveProperty("sha");
    });

    it("rejects when not signed in", async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as never);
      const result = await postStatus({ week: "2026-W18", body: "x" });
      expect(result).toEqual({ ok: false, error: "not_authenticated" });
    });

    it("rejects when signed in but not on the roster", async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        githubHandle: "stranger",
      } as never);
      const result = await postStatus({ week: "2026-W18", body: "x" });
      expect(result).toEqual({ ok: false, error: "not_a_member" });
    });

    it("rejects malformed week token", async () => {
      const result = await postStatus({ week: "not-a-week", body: "x" });
      expect(result).toEqual({ ok: false, error: "invalid_input" });
    });

    it("rejects empty body", async () => {
      const result = await postStatus({ week: "2026-W18", body: "" });
      expect(result).toEqual({ ok: false, error: "invalid_input" });
    });

    it("maps GitHubAppError(forbidden) to forbidden", async () => {
      mockClient.writeFile.mockRejectedValueOnce(
        new GitHubAppError("forbidden", "no scope"),
      );
      const result = await postStatus({ week: "2026-W18", body: "x" });
      expect(result).toEqual({ ok: false, error: "forbidden" });
    });

    it("maps unknown rejection to unknown", async () => {
      mockClient.writeFile.mockRejectedValueOnce(new Error("network"));
      const result = await postStatus({ week: "2026-W18", body: "x" });
      expect(result).toEqual({ ok: false, error: "unknown" });
    });
  });

  describe("editStatus", () => {
    it("passes SHA for optimistic locking", async () => {
      mockClient.writeFile.mockResolvedValueOnce({ sha: "newsha" });
      const result = await editStatus({
        week: "2026-W18",
        body: "Updated",
        sha: "old-sha",
      });
      expect(result).toEqual({ ok: true, sha: "newsha" });
      expect(mockClient.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({ sha: "old-sha" }),
      );
    });

    it("surfaces sha_conflict cleanly", async () => {
      mockClient.writeFile.mockRejectedValueOnce(
        new GitHubAppError("sha_conflict", "boom"),
      );
      const result = await editStatus({
        week: "2026-W18",
        body: "x",
        sha: "stale",
      });
      expect(result).toEqual({ ok: false, error: "sha_conflict" });
    });

    it("rejects missing sha as invalid_input", async () => {
      const result = await editStatus({
        week: "2026-W18",
        body: "x",
        sha: "",
      });
      expect(result).toEqual({ ok: false, error: "invalid_input" });
    });

    it("rejects when not signed in", async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as never);
      const result = await editStatus({
        week: "2026-W18",
        body: "x",
        sha: "abc",
      });
      expect(result).toEqual({ ok: false, error: "not_authenticated" });
    });

    it("rejects when not on the roster", async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        githubHandle: "stranger",
      } as never);
      const result = await editStatus({
        week: "2026-W18",
        body: "x",
        sha: "abc",
      });
      expect(result).toEqual({ ok: false, error: "not_a_member" });
    });
  });

  describe("deleteStatus", () => {
    it("removes the member's file", async () => {
      mockClient.deleteFile.mockResolvedValueOnce(undefined);
      const result = await deleteStatus({ week: "2026-W18", sha: "abc" });
      expect(result).toEqual({ ok: true, sha: "" });
      expect(mockClient.deleteFile).toHaveBeenCalledWith(
        "community/status/2026-W18/anton-safronov.md",
        expect.objectContaining({ sha: "abc" }),
      );
    });

    it("maps not_found cleanly (file already deleted)", async () => {
      mockClient.deleteFile.mockRejectedValueOnce(
        new GitHubAppError("not_found", "gone"),
      );
      const result = await deleteStatus({ week: "2026-W18", sha: "abc" });
      expect(result).toEqual({ ok: false, error: "not_found" });
    });

    it("rejects when not signed in", async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as never);
      const result = await deleteStatus({ week: "2026-W18", sha: "abc" });
      expect(result).toEqual({ ok: false, error: "not_authenticated" });
    });

    it("rejects when not on the roster", async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        githubHandle: "stranger",
      } as never);
      const result = await deleteStatus({ week: "2026-W18", sha: "abc" });
      expect(result).toEqual({ ok: false, error: "not_a_member" });
    });

    it("rejects malformed input", async () => {
      const result = await deleteStatus({ week: "bad", sha: "x" });
      expect(result).toEqual({ ok: false, error: "invalid_input" });
    });

    it("maps unknown rejection to unknown", async () => {
      mockClient.deleteFile.mockRejectedValueOnce(new Error("network"));
      const result = await deleteStatus({ week: "2026-W18", sha: "abc" });
      expect(result).toEqual({ ok: false, error: "unknown" });
    });
  });

  describe("E2E mock mode (NEXT_PUBLIC_E2E_MODE=1)", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_E2E_MODE", "1");
    });

    it("postStatus delegates to the mock store and bypasses the writer", async () => {
      const result = await postStatus({ week: "2026-W18", body: "Hi" });
      expect(result.ok).toBe(true);
      // The real writer must not be called in E2E mode.
      expect(mockClient.writeFile).not.toHaveBeenCalled();
    });

    it("editStatus delegates to the mock store", async () => {
      const post = await postStatus({ week: "2026-W18", body: "v1" });
      expect(post.ok).toBe(true);
      const edit = await editStatus({
        week: "2026-W18",
        body: "v2",
        sha: post.ok ? post.sha : "",
      });
      expect(edit.ok).toBe(true);
      expect(mockClient.writeFile).not.toHaveBeenCalled();
    });

    it("deleteStatus delegates to the mock store", async () => {
      const post = await postStatus({ week: "2026-W18", body: "x" });
      expect(post.ok).toBe(true);
      const del = await deleteStatus({
        week: "2026-W18",
        sha: post.ok ? post.sha : "",
      });
      expect(del.ok).toBe(true);
      expect(mockClient.deleteFile).not.toHaveBeenCalled();
    });
  });
});
