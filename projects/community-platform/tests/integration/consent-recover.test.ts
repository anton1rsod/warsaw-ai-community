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

import { auth } from "@/lib/auth";
import { GET } from "@/app/api/consent/recover/route";

function reqGET(): Request {
  return new Request("http://localhost:3000/api/consent/recover", {
    method: "GET",
  });
}

function locationOf(res: Response): string {
  return res.headers.get("location") ?? "";
}

function setCookieOf(res: Response): string {
  return res.headers.get("set-cookie") ?? "";
}

describe("GET /api/consent/recover", () => {
  beforeEach(() => {
    mockClient.readFile.mockReset();
    mockClient.writeFile.mockReset();
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("redirects to /login when no session", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);
    const res = await GET(reqGET());
    expect(res.status).toBeGreaterThanOrEqual(300);
    expect(res.status).toBeLessThan(400);
    expect(locationOf(res)).toMatch(/\/login$/);
    // Should NOT set the consent cookie on a /login bounce.
    expect(setCookieOf(res).toLowerCase()).not.toContain("waic-consented");
  });

  it("redirects to /no-access when authenticated but not on roster", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      githubHandle: "stranger",
    } as never);
    const res = await GET(reqGET());
    expect(locationOf(res)).toMatch(/\/no-access$/);
    expect(setCookieOf(res).toLowerCase()).not.toContain("waic-consented");
  });

  it("redirects to /consent when roster member has NOT consented yet (live API)", async () => {
    // hasConsent reads via mockClient.readFile — null = no profile = not
    // consented. The handler must bounce back to /consent so the modal
    // renders, not silently land them on /home.
    mockClient.readFile.mockResolvedValueOnce(null);
    const res = await GET(reqGET());
    expect(locationOf(res)).toMatch(/\/consent$/);
    expect(setCookieOf(res).toLowerCase()).not.toContain("waic-consented");
  });

  it("sets waic-consented cookie and redirects to /home when consented (snapshot-stale recovery)", async () => {
    // Live API confirms the profile exists — i.e., the user has consented,
    // their cookie was lost (cleared / new device / different browser),
    // and the build-time snapshot may not yet reflect the profile.
    mockClient.readFile.mockResolvedValueOnce({
      content: "# existing",
      sha: "s",
      path: "community/members/anton-safronov.md",
    });
    const res = await GET(reqGET());
    expect(locationOf(res)).toMatch(/\/home$/);
    const sc = setCookieOf(res);
    expect(sc).toContain("waic-consented=1");
    expect(sc.toLowerCase()).toContain("httponly");
    expect(sc.toLowerCase()).toContain("samesite=lax");
    expect(sc.toLowerCase()).toContain("path=/");
    // Max-Age = 1 year (60 * 60 * 24 * 365 = 31536000) — must persist
    // so a second cookie-loss doesn't re-trigger the recovery.
    expect(sc.toLowerCase()).toContain("max-age=31536000");
  });

  it("does NOT write a new profile (idempotent — recovery is read-only on the data layer)", async () => {
    // Even on the happy "set cookie + 307 /home" path, the route must NOT
    // call writeFile — the profile already exists; we're only re-issuing
    // the cookie. Any write would be a regression.
    mockClient.readFile.mockResolvedValueOnce({
      content: "# existing",
      sha: "s",
      path: "community/members/anton-safronov.md",
    });
    await GET(reqGET());
    expect(mockClient.writeFile).not.toHaveBeenCalled();
  });
});
