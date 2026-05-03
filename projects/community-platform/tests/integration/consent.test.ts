import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as GitHubAppModule from "@/lib/github-app";

vi.mock("@/lib/env", () => ({
  env: {
    NEXTAUTH_SECRET: "x".repeat(32),
    NEXTAUTH_URL: "http://localhost:3000",
    NEXTAUTH_SESSION_MAX_AGE: 2_592_000,
    GITHUB_OAUTH_CLIENT_ID: "test-client-id",
    GITHUB_OAUTH_CLIENT_SECRET: "test-client-secret",
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

const cookieStore = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

import { auth } from "@/lib/auth";
import {
  acceptConsent,
  acceptConsentAndSetCookie,
  hasConsent,
} from "@/app/actions/consent";

describe("consent actions", () => {
  beforeEach(() => {
    mockClient.readFile.mockReset();
    mockClient.writeFile.mockReset();
    cookieStore.set.mockReset();
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("acceptConsent", () => {
    it("creates community/members/<slug>.md when file does not exist", async () => {
      mockClient.readFile.mockResolvedValueOnce(null);
      mockClient.writeFile.mockResolvedValueOnce({ sha: "newsha" });

      const result = await acceptConsent();

      expect(result).toEqual({ ok: true });
      expect(mockClient.writeFile).toHaveBeenCalledTimes(1);
      const call = mockClient.writeFile.mock.calls[0];
      if (!call) throw new Error("expected one writeFile call");
      const [path, content, options] = call;
      expect(path).toBe("community/members/anton-safronov.md");
      expect(content).toContain('name: "Anton Safronov"');
      expect(content).toContain("github_handle: anton1rsod");
      expect(content).toContain("consented_at:");
      expect(options).toMatchObject({
        message: expect.stringContaining("consent"),
      });
    });

    it("skips writeFile when file already exists (idempotent)", async () => {
      mockClient.readFile.mockResolvedValueOnce({
        content: "# existing",
        sha: "s",
        path: "community/members/anton-safronov.md",
      });

      const result = await acceptConsent();

      expect(result).toEqual({ ok: true });
      expect(mockClient.writeFile).not.toHaveBeenCalled();
    });

    it("rejects when not authenticated", async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as never);
      const result = await acceptConsent();
      expect(result).toEqual({ ok: false, error: "not_authenticated" });
    });

    it("rejects when authenticated but not on roster", async () => {
      vi.mocked(auth).mockResolvedValueOnce({
        githubHandle: "stranger",
      } as never);
      const result = await acceptConsent();
      expect(result).toEqual({ ok: false, error: "not_a_member" });
    });

    it("maps writer errors to unknown", async () => {
      mockClient.readFile.mockResolvedValueOnce(null);
      mockClient.writeFile.mockRejectedValueOnce(new Error("network"));
      const result = await acceptConsent();
      expect(result).toEqual({ ok: false, error: "unknown" });
    });
  });

  describe("hasConsent", () => {
    it("returns true when profile file exists", async () => {
      mockClient.readFile.mockResolvedValueOnce({
        content: "# existing",
        sha: "s",
        path: "community/members/anton-safronov.md",
      });
      expect(await hasConsent("anton1rsod")).toBe(true);
    });

    it("returns false when profile file missing", async () => {
      mockClient.readFile.mockResolvedValueOnce(null);
      expect(await hasConsent("anton1rsod")).toBe(false);
    });

    it("returns false when handle is not on roster", async () => {
      expect(await hasConsent("stranger")).toBe(false);
      expect(mockClient.readFile).not.toHaveBeenCalled();
    });
  });

  describe("acceptConsentAndSetCookie", () => {
    it("sets waic-consented cookie on success", async () => {
      mockClient.readFile.mockResolvedValueOnce(null);
      mockClient.writeFile.mockResolvedValueOnce({ sha: "newsha" });

      const result = await acceptConsentAndSetCookie();

      expect(result).toEqual({ ok: true });
      expect(cookieStore.set).toHaveBeenCalledWith(
        "waic-consented",
        "1",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        }),
      );
    });

    it("does NOT set cookie on failure", async () => {
      vi.mocked(auth).mockResolvedValueOnce(null as never);
      const result = await acceptConsentAndSetCookie();
      expect(result.ok).toBe(false);
      expect(cookieStore.set).not.toHaveBeenCalled();
    });
  });

  describe("E2E mock mode (NEXT_PUBLIC_E2E_MODE=1)", () => {
    beforeEach(() => {
      vi.stubEnv("NEXT_PUBLIC_E2E_MODE", "1");
    });

    it("hasConsent reads from mock store, not GitHub", async () => {
      // Fresh mock store starts empty.
      const { mockConsentStore } = await import(
        "@/app/actions/_test-consent-store"
      );
      mockConsentStore.reset();
      expect(await hasConsent("anton1rsod")).toBe(false);
      expect(mockClient.readFile).not.toHaveBeenCalled();

      mockConsentStore.add("anton-safronov");
      expect(await hasConsent("anton1rsod")).toBe(true);
      expect(mockClient.readFile).not.toHaveBeenCalled();
    });

    it("acceptConsent writes to mock store, not GitHub", async () => {
      const { mockConsentStore } = await import(
        "@/app/actions/_test-consent-store"
      );
      mockConsentStore.reset();
      const result = await acceptConsent();
      expect(result.ok).toBe(true);
      expect(mockClient.writeFile).not.toHaveBeenCalled();
      expect(mockConsentStore.has("anton-safronov")).toBe(true);
    });
  });
});
