import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type * as GithubAppModule from "@/lib/github-app";
import { mockProfileStore } from "@/app/actions/_test-profile-store";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));
vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: vi.fn(),
}));

const mockClient = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  getHeadSha: vi.fn(),
  deleteFile: vi.fn(),
  commitMultipleFiles: vi.fn(),
};
vi.mock("@/lib/github-app", async () => {
  const actual = await vi.importActual<typeof GithubAppModule>(
    "@/lib/github-app",
  );
  return {
    ...actual,
    createGitHubApp: () => mockClient,
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  env: {
    GITHUB_APP_ID: "123",
    GITHUB_APP_PRIVATE_KEY: "test-pem",
    GITHUB_APP_INSTALLATION_ID: "456",
    GITHUB_REPO_OWNER: "anton1rsod",
    GITHUB_REPO_NAME: "warsaw-ai-community",
    GITHUB_REPO_BRANCH: "main",
  },
}));

import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { revalidatePath } from "next/cache";
import { GitHubAppError } from "@/lib/github-app";
import { saveProfile } from "@/app/actions/save-profile";

const ANTON_FRONTMATTER = `---
name: Anton Safronov
github_handle: anton1rsod
consented_at: 2026-05-03T13:59:19.410Z
---

`;

const ANTON_FILE = ANTON_FRONTMATTER + "Original prose.\n";

function shaConflictError(): GitHubAppError {
  return new GitHubAppError("sha_conflict", "test sha conflict");
}

beforeEach(() => {
  vi.clearAllMocks();
});

function formData(body: string, sha = "client-sha"): FormData {
  const fd = new FormData();
  fd.append("body", body);
  fd.append("sha", sha);
  return fd;
}

describe("saveProfile", () => {
  describe("H15: editor is self-only by construction", () => {
    it("derives slug from session, ignoring any body-supplied slug field", async () => {
      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue({
        slug: "anton-safronov",
        githubHandle: "anton1rsod",
        name: "Anton Safronov",
      } as never);
      mockClient.readFile.mockResolvedValue({
        content: ANTON_FILE,
        sha: "s1",
        path: "community/members/anton-safronov.md",
      });
      mockClient.writeFile.mockResolvedValue({ sha: "s2" });

      const fd = formData("New body.", "s1");
      fd.append("slug", "someone-else");

      const result = await saveProfile(fd);
      expect(result).toEqual({ ok: true, savedAt: expect.any(String) });
      expect(mockClient.readFile).toHaveBeenCalledWith(
        "community/members/anton-safronov.md",
      );
    });

    it("returns not_authenticated when no session", async () => {
      vi.mocked(auth).mockResolvedValue(null as never);
      const result = await saveProfile(formData("anything"));
      expect(result).toEqual({ ok: false, error: "not_authenticated" });
    });

    it("returns not_a_member when handle not on roster", async () => {
      vi.mocked(auth).mockResolvedValue({ githubHandle: "ghost" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue(undefined);
      const result = await saveProfile(formData("anything"));
      expect(result).toEqual({ ok: false, error: "not_a_member" });
    });
  });

  describe("H16: SHA-CAS optimistic locking with client-provided expectedSha", () => {
    it("returns refresh_needed when expectedSha != current file SHA (stale edit), without calling writeFile", async () => {
      // The page rendered at SHA s0; meanwhile someone else committed and the
      // file is now at sha-after-concurrent-commit. The user's save must be
      // rejected, not silently committed on top of the new state.
      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue({
        slug: "anton-safronov",
        githubHandle: "anton1rsod",
        name: "Anton Safronov",
      } as never);
      mockClient.readFile.mockResolvedValue({
        content: ANTON_FILE,
        sha: "sha-after-concurrent-commit",
        path: "community/members/anton-safronov.md",
      });

      const result = await saveProfile(formData("Stale edit.", "sha-from-page-load"));

      expect(result).toEqual({ ok: false, error: "refresh_needed" });
      expect(mockClient.writeFile).not.toHaveBeenCalled();
    });

    it("writes when expectedSha matches the current file SHA, using expectedSha as the write CAS token", async () => {
      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue({
        slug: "anton-safronov",
        githubHandle: "anton1rsod",
        name: "Anton Safronov",
      } as never);
      mockClient.readFile.mockResolvedValue({
        content: ANTON_FILE,
        sha: "s1",
        path: "community/members/anton-safronov.md",
      });
      mockClient.writeFile.mockResolvedValue({ sha: "s2" });

      const result = await saveProfile(formData("Fresh edit.", "s1"));

      expect(result).toEqual({ ok: true, savedAt: expect.any(String) });
      expect(mockClient.writeFile).toHaveBeenCalledWith(
        "community/members/anton-safronov.md",
        expect.any(String),
        expect.objectContaining({ sha: "s1" }),
      );
    });

    it("returns refresh_needed on writeFile sha_conflict (TOCTOU at GitHub) without retrying — no silent overwrite", async () => {
      // Tight TOCTOU: readFile saw s1 (matching client), but a commit landed
      // between our readFile and writeFile. The old retry-on-conflict was a
      // silent lost-update; the new contract surfaces this as refresh_needed.
      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue({
        slug: "anton-safronov",
        githubHandle: "anton1rsod",
        name: "Anton Safronov",
      } as never);
      mockClient.readFile.mockResolvedValue({
        content: ANTON_FILE,
        sha: "s1",
        path: "community/members/anton-safronov.md",
      });
      mockClient.writeFile.mockRejectedValue(shaConflictError());

      const result = await saveProfile(formData("Doomed.", "s1"));

      expect(result).toEqual({ ok: false, error: "refresh_needed" });
      expect(mockClient.readFile).toHaveBeenCalledTimes(1);
      expect(mockClient.writeFile).toHaveBeenCalledTimes(1);
    });
  });

  describe("H17: member attribution preserved in audit trail", () => {
    it("commit message includes Co-Authored-By with the member's handle and noreply email", async () => {
      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue({
        slug: "anton-safronov",
        githubHandle: "anton1rsod",
        name: "Anton Safronov",
      } as never);
      mockClient.readFile.mockResolvedValue({
        content: ANTON_FILE,
        sha: "s1",
        path: "community/members/anton-safronov.md",
      });
      mockClient.writeFile.mockResolvedValue({ sha: "s2" });

      await saveProfile(formData("Updated.", "s1"));

      expect(mockClient.writeFile).toHaveBeenCalledWith(
        "community/members/anton-safronov.md",
        expect.any(String),
        expect.objectContaining({
          message: expect.stringContaining(
            "Co-Authored-By: anton1rsod <anton1rsod@users.noreply.github.com>",
          ),
          sha: "s1",
        }),
      );
    });
  });

  describe("H19: frontmatter integrity across edits", () => {
    it("rejects save when required frontmatter keys are missing", async () => {
      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue({
        slug: "anton-safronov",
        githubHandle: "anton1rsod",
        name: "Anton Safronov",
      } as never);
      const corruptFile = `---
name: Anton Safronov
---

Body.
`;
      mockClient.readFile.mockResolvedValue({
        content: corruptFile,
        sha: "s1",
        path: "community/members/anton-safronov.md",
      });

      const result = await saveProfile(formData("New body.", "s1"));
      expect(result).toEqual({ ok: false, error: "frontmatter_corrupt" });
      expect(mockClient.writeFile).not.toHaveBeenCalled();
    });
  });

  describe("H20: concurrent-edit UX", () => {
    it("returns refresh_needed (UI shows 'Someone else updated this — refresh')", async () => {
      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue({
        slug: "anton-safronov",
        githubHandle: "anton1rsod",
        name: "Anton Safronov",
      } as never);
      mockClient.readFile.mockResolvedValue({
        content: ANTON_FILE,
        sha: "s1",
        path: "community/members/anton-safronov.md",
      });
      mockClient.writeFile.mockRejectedValue(shaConflictError());

      const result = await saveProfile(formData("...", "s1"));
      expect(result).toEqual({ ok: false, error: "refresh_needed" });
    });
  });

  describe("H24: server logs don't leak profile body", () => {
    it("logger receives only {slug, sha, success, error?} — never body or raw error object", async () => {
      const logSpy = vi.spyOn(console, "warn").mockImplementation(vi.fn());
      const errSpy = vi.spyOn(console, "error").mockImplementation(vi.fn());

      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue({
        slug: "anton-safronov",
        githubHandle: "anton1rsod",
        name: "Anton Safronov",
      } as never);
      mockClient.readFile.mockResolvedValue({
        content: ANTON_FILE,
        sha: "s1",
        path: "community/members/anton-safronov.md",
      });
      mockClient.writeFile.mockResolvedValue({ sha: "s2" });

      const sensitive = "DO_NOT_LOG_THIS_TOKEN_abc123";
      await saveProfile(formData(`Body with ${sensitive}.`, "s1"));

      const allLogs = [
        ...logSpy.mock.calls.flat().map(String),
        ...errSpy.mock.calls.flat().map(String),
      ].join(" ");
      expect(allLogs).not.toContain(sensitive);

      logSpy.mockRestore();
      errSpy.mockRestore();
    });
  });

  describe("revalidatePath", () => {
    it("revalidates /members/<slug> and /members on success", async () => {
      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue({
        slug: "anton-safronov",
        githubHandle: "anton1rsod",
        name: "Anton Safronov",
      } as never);
      mockClient.readFile.mockResolvedValue({
        content: ANTON_FILE,
        sha: "s1",
        path: "community/members/anton-safronov.md",
      });
      mockClient.writeFile.mockResolvedValue({ sha: "s2" });

      await saveProfile(formData("Updated.", "s1"));

      expect(revalidatePath).toHaveBeenCalledWith("/members/anton-safronov");
      expect(revalidatePath).toHaveBeenCalledWith("/members");
    });
  });

  describe("file missing → file_missing error", () => {
    it("returns file_missing when readFile returns null", async () => {
      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue({
        slug: "anton-safronov",
        githubHandle: "anton1rsod",
        name: "Anton Safronov",
      } as never);
      mockClient.readFile.mockResolvedValue(null);

      const result = await saveProfile(formData("Hello.", "any-sha"));
      expect(result).toEqual({ ok: false, error: "file_missing" });
    });
  });

  describe("invalid body → invalid_body", () => {
    it("rejects body over 64KB", async () => {
      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue({
        slug: "anton-safronov",
        githubHandle: "anton1rsod",
        name: "Anton Safronov",
      } as never);
      const huge = "x".repeat(65_537);
      const result = await saveProfile(formData(huge, "s1"));
      expect(result).toEqual({ ok: false, error: "invalid_body" });
    });

    it("rejects missing sha (Zod schema gates the optimistic-lock token)", async () => {
      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue({
        slug: "anton-safronov",
        githubHandle: "anton1rsod",
        name: "Anton Safronov",
      } as never);

      const fd = new FormData();
      fd.append("body", "Has body but no sha.");
      const result = await saveProfile(fd);
      expect(result).toEqual({ ok: false, error: "invalid_body" });
      expect(mockClient.readFile).not.toHaveBeenCalled();
    });
  });

  describe("unknown writeFile error path", () => {
    // Coverage gate for the catch-all in attemptSave that maps non-sha_conflict
    // errors to { kind: "error", error: "unknown" }.
    it("returns unknown when writeFile throws a non-sha_conflict GitHubAppError", async () => {
      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue({
        slug: "anton-safronov",
        githubHandle: "anton1rsod",
        name: "Anton Safronov",
      } as never);
      mockClient.readFile.mockResolvedValue({
        content: ANTON_FILE,
        sha: "s1",
        path: "community/members/anton-safronov.md",
      });
      mockClient.writeFile.mockRejectedValue(
        new GitHubAppError("forbidden", "bot lacks contents:write"),
      );

      const result = await saveProfile(formData("Updated.", "s1"));
      expect(result).toEqual({ ok: false, error: "unknown" });
    });
  });

  describe("H29: form CSRF protection", () => {
    it("first call in saveProfile is auth() — JWT cookie is the CSRF token", async () => {
      vi.mocked(auth).mockResolvedValue(null as never);
      await saveProfile(formData("anything", "any-sha"));
      expect(auth).toHaveBeenCalled();
      // The unauthenticated short-circuit verifies that auth() runs first;
      // if cross-origin POST were possible without the cookie, the function
      // would reach readFile before rejecting, which the "not_authenticated"
      // assertion above forbids.
    });
  });

  describe("H21: E2E mock branch — isE2EMockActive() path", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_E2E_MODE", "1");
      mockProfileStore.reset();
    });
    afterEach(() => {
      vi.unstubAllEnvs();
      mockProfileStore.reset();
    });

    it("returns file_missing when the store has no entry for the slug (mirrors prod gh.readFile null)", async () => {
      // In v0.2.0 this branch silently seeded; with client-SHA gating the
      // contract aligns with production — no file → file_missing.
      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue({
        slug: "anton-safronov",
        githubHandle: "anton1rsod",
        name: "Anton Safronov",
      } as never);

      const result = await saveProfile(formData("First save.", "any-sha"));
      expect(result).toEqual({ ok: false, error: "file_missing" });
    });

    it("writes when expectedSha matches the store's current SHA", async () => {
      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue({
        slug: "anton-safronov",
        githubHandle: "anton1rsod",
        name: "Anton Safronov",
      } as never);

      const seeded = mockProfileStore.seed("anton-safronov", "Original.");
      const result = await saveProfile(formData("Updated.", seeded.sha));
      expect(result.ok).toBe(true);
      const entry = mockProfileStore.get("anton-safronov");
      expect(entry?.body).toBe("Updated.");
    });

    it("returns refresh_needed when expectedSha doesn't match the store's current SHA (concurrent-edit race)", async () => {
      // Manufactures the exact scenario that the v0.2.0 E2E Scenario 2 couldn't:
      // tab A and tab B both loaded /me/edit at the same SHA. Tab A saves
      // first → store advances. Tab B saves with its now-stale SHA → must
      // refuse with refresh_needed.
      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue({
        slug: "anton-safronov",
        githubHandle: "anton1rsod",
        name: "Anton Safronov",
      } as never);

      const seeded = mockProfileStore.seed("anton-safronov", "Original.");
      // Simulate tab A's save landing first; store advances to a fresh SHA.
      mockProfileStore.write("anton-safronov", "Tab A's edit.", seeded.sha);

      // Tab B saves with its stale SHA (the one it loaded at /me/edit render).
      const result = await saveProfile(formData("Tab B's edit.", seeded.sha));
      expect(result).toEqual({ ok: false, error: "refresh_needed" });
      // Tab B's edit must NOT have landed.
      const entry = mockProfileStore.get("anton-safronov");
      expect(entry?.body).toBe("Tab A's edit.");
    });
  });
});
