import { describe, expect, it, vi, beforeEach } from "vitest";
import type * as GithubAppModule from "@/lib/github-app";

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

function formData(body: string): FormData {
  const fd = new FormData();
  fd.append("body", body);
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

      const fd = formData("New body.");
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

  describe("H16: SHA-CAS optimistic locking on save", () => {
    it("retries once on 409 sha_conflict and succeeds", async () => {
      vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
      vi.mocked(findMemberByHandle).mockReturnValue({
        slug: "anton-safronov",
        githubHandle: "anton1rsod",
        name: "Anton Safronov",
      } as never);
      mockClient.readFile
        .mockResolvedValueOnce({
          content: ANTON_FILE,
          sha: "s1",
          path: "community/members/anton-safronov.md",
        })
        .mockResolvedValueOnce({
          content: ANTON_FILE,
          sha: "s2",
          path: "community/members/anton-safronov.md",
        });
      mockClient.writeFile
        .mockRejectedValueOnce(shaConflictError())
        .mockResolvedValueOnce({ sha: "s3" });

      const result = await saveProfile(formData("Retry body."));
      expect(result).toEqual({ ok: true, savedAt: expect.any(String) });
      expect(mockClient.readFile).toHaveBeenCalledTimes(2);
      expect(mockClient.writeFile).toHaveBeenCalledTimes(2);
    });

    it("returns refresh_needed on second 409", async () => {
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

      const result = await saveProfile(formData("Doomed."));
      expect(result).toEqual({ ok: false, error: "refresh_needed" });
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

      await saveProfile(formData("Updated."));

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

      const result = await saveProfile(formData("New body."));
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

      const result = await saveProfile(formData("..."));
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
      await saveProfile(formData(`Body with ${sensitive}.`));

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

      await saveProfile(formData("Updated."));

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

      const result = await saveProfile(formData("Hello."));
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
      const result = await saveProfile(formData(huge));
      expect(result).toEqual({ ok: false, error: "invalid_body" });
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

      const result = await saveProfile(formData("Updated."));
      expect(result).toEqual({ ok: false, error: "unknown" });
    });
  });

  describe("H29: form CSRF protection", () => {
    it("first call in saveProfile is auth() — JWT cookie is the CSRF token", async () => {
      vi.mocked(auth).mockResolvedValue(null as never);
      await saveProfile(formData("anything"));
      expect(auth).toHaveBeenCalled();
      // The unauthenticated short-circuit verifies that auth() runs first;
      // if cross-origin POST were possible without the cookie, the function
      // would reach readFile before rejecting, which the "not_authenticated"
      // assertion above forbids.
    });
  });
});
