import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/content-snapshot", () => ({ isAdmin: vi.fn() }));
vi.mock("@/lib/env", () => ({ env: { GITHUB_APP_ID: "x", GITHUB_APP_PRIVATE_KEY: "x", GITHUB_APP_INSTALLATION_ID: "x", GITHUB_REPO_OWNER: "o", GITHUB_REPO_NAME: "r", GITHUB_REPO_BRANCH: "main" } }));
vi.mock("@/lib/github-app", () => ({ createGitHubApp: vi.fn() }));

import { revokeInvitation } from "@/app/actions/revoke-invitation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/content-snapshot";
import { createGitHubApp } from "@/lib/github-app";

const LH = "# Invitations Ledger\n\n| JTI | Status | Issued At | Issued By | Hint (Telegram) | Redeemed At | Redeemed By | Notes |\n|---|---|---|---|---|---|---|---|\n";
const JTI = "11111111-2222-4333-8444-555555555555";

beforeEach(() => vi.clearAllMocks());
afterEach(() => vi.restoreAllMocks());

describe("revokeInvitation server action (H125)", () => {
  it("appends a revoked row via the GitHub App for an admin", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    vi.mocked(isAdmin).mockReturnValue(true);
    const writeFile = vi.fn().mockResolvedValue({ commitSha: "x" });
    vi.mocked(createGitHubApp).mockReturnValue({ readFile: vi.fn().mockResolvedValue({ content: LH, sha: "s", path: "p" }), writeFile, getHeadSha: vi.fn(), commitMultipleFiles: vi.fn(), deleteFile: vi.fn() } as never);
    const fd = new FormData();
    fd.set("jti", JTI);
    const r = await revokeInvitation(fd);
    expect(r.ok).toBe(true);
    const writtenContent = writeFile.mock.calls[0]?.[1] as string;
    expect(writtenContent).toContain(`| ${JTI} | revoked |`);
  });
  it("rejects a non-admin (H134-parity)", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "regular" } as never);
    vi.mocked(isAdmin).mockReturnValue(false);
    const fd = new FormData();
    fd.set("jti", JTI);
    expect((await revokeInvitation(fd)).error).toMatch(/not authorized/i);
  });
  it("is idempotent when already revoked (no second write)", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    vi.mocked(isAdmin).mockReturnValue(true);
    const writeFile = vi.fn();
    vi.mocked(createGitHubApp).mockReturnValue({ readFile: vi.fn().mockResolvedValue({ content: LH + `| ${JTI} | revoked | i | @a | | | | x |\n`, sha: "s", path: "p" }), writeFile, getHeadSha: vi.fn(), commitMultipleFiles: vi.fn(), deleteFile: vi.fn() } as never);
    const fd = new FormData();
    fd.set("jti", JTI);
    expect((await revokeInvitation(fd)).ok).toBe(true);
    expect(writeFile).not.toHaveBeenCalled();
  });
});
