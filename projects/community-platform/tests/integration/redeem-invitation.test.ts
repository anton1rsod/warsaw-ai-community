import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type * as InvitationsModule from "@/lib/invitations";
import { mintToken } from "@/lib/invitations";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/content-snapshot", () => ({
  findMemberByHandle: vi.fn(),
}));
vi.mock("@/lib/env", () => ({
  env: {
    INVITE_SECRET: "x".repeat(32),
    GITHUB_APP_ID: "x",
    GITHUB_APP_PRIVATE_KEY: "x",
    GITHUB_APP_INSTALLATION_ID: "x",
    GITHUB_REPO_OWNER: "anton1rsod",
    GITHUB_REPO_NAME: "warsaw-ai-community",
    GITHUB_REPO_BRANCH: "main",
  },
}));
vi.mock("@/lib/github-app", () => ({
  createGitHubApp: vi.fn(),
}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`__redirect__:${url}`);
  }),
}));

// Partial-mock @/lib/invitations so the orchestrator can be stubbed for the
// "orchestrator returns ok:false" branch coverage. All other exports
// (mintToken/verifyToken/RedeemFormSchema/logRedemptionEvent) keep their real
// implementations — flipped per-test via vi.mocked().mockImplementation().
vi.mock("@/lib/invitations", async () => {
  const actual =
    await vi.importActual<typeof InvitationsModule>("@/lib/invitations");
  return {
    ...actual,
    redeemInvitation: vi.fn(actual.redeemInvitation),
  };
});

import { redeemInvitation as redeemAction } from "@/app/actions/redeem-invitation";
import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redeemInvitation as orchestrate } from "@/lib/invitations";
import { createGitHubApp } from "@/lib/github-app";

const SECRET = "x".repeat(32);

function validToken(): string {
  return mintToken(
    {
      jti: "11111111-2222-4333-8444-555555555555",
      iss: "anton1rsod",
      exp: Math.floor(Date.now() / 1000) + 7 * 86400,
    },
    SECRET,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_E2E_MODE = "1";
  // NODE_ENV is read-only in TS; vitest sets NODE_ENV="test" by default,
  // which already satisfies isE2EMockActive's "!== production" check.
});
afterEach(() => {
  delete process.env.NEXT_PUBLIC_E2E_MODE;
});

describe("redeemInvitation server action", () => {
  it("redirects to /this-week on a successful redemption", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "newmember" } as never);
    vi.mocked(findMemberByHandle).mockReturnValue(undefined);
    const cookieStore = {
      get: vi.fn(() => ({ value: validToken() })),
      delete: vi.fn(),
    };
    vi.mocked(cookies).mockResolvedValue(cookieStore as never);

    const formData = new FormData();
    formData.set("display_name", "New Member");
    formData.set("telegram", "@newmember");
    formData.set("git_email_alias", "new@member.com");
    formData.set("consent_accepted", "true");

    await expect(redeemAction(formData)).rejects.toThrow(
      /__redirect__:\/this-week/,
    );
    expect(cookieStore.delete).toHaveBeenCalledWith({
      name: "warsaw_invite",
      path: "/onboard",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/members");
    expect(revalidatePath).toHaveBeenCalledWith("/this-week");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/health");
  });

  it("returns { error } when not authenticated (no leak)", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => ({ value: validToken() })),
      delete: vi.fn(),
    } as never);
    const result = await redeemAction(new FormData());
    expect(result.error).toBeDefined();
  });

  it("returns { error } when cookie missing", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "newmember" } as never);
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => undefined),
      delete: vi.fn(),
    } as never);
    const result = await redeemAction(new FormData());
    expect(result.error).toBeDefined();
  });

  it("returns { error } when redeemer ALREADY in roster", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "anton1rsod" } as never);
    vi.mocked(findMemberByHandle).mockReturnValue({
      name: "Anton",
      githubHandle: "anton1rsod",
      slug: "anton-safronov",
    } as never);
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => ({ value: validToken() })),
      delete: vi.fn(),
    } as never);
    const result = await redeemAction(new FormData());
    expect(result.error).toBeDefined();
  });

  it("returns { error } on RedeemFormSchema fail (form-validation-fail keeps cookie)", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "newmember" } as never);
    vi.mocked(findMemberByHandle).mockReturnValue(undefined);
    const cookieStore = {
      get: vi.fn(() => ({ value: validToken() })),
      delete: vi.fn(),
    };
    vi.mocked(cookies).mockResolvedValue(cookieStore as never);
    const formData = new FormData();
    formData.set("display_name", "");
    formData.set("telegram", "@x"); // invalid (too short)
    formData.set("git_email_alias", "not-an-email");
    formData.set("consent_accepted", "true");
    const result = await redeemAction(formData);
    expect(result.error).toMatch(/invalid/i);
    expect(cookieStore.delete).not.toHaveBeenCalled();
  });

  it("coerces missing form fields to undefined (RedeemFormSchema rejects)", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "newmember" } as never);
    vi.mocked(findMemberByHandle).mockReturnValue(undefined);
    const cookieStore = {
      get: vi.fn(() => ({ value: validToken() })),
      delete: vi.fn(),
    };
    vi.mocked(cookies).mockResolvedValue(cookieStore as never);
    // Empty FormData — every formData.get() returns null, exercising the
    // `?? undefined` null branches at lines 153/156-157. Schema rejects.
    const result = await redeemAction(new FormData());
    expect(result.error).toMatch(/invalid/i);
    expect(cookieStore.delete).not.toHaveBeenCalled();
  });

  it("returns { error } and clears cookie when token is invalid (signature mismatch)", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "newmember" } as never);
    const cookieStore = {
      // Plausible-looking token shape but signature won't verify.
      get: vi.fn(() => ({ value: "abc.def" })),
      delete: vi.fn(),
    };
    vi.mocked(cookies).mockResolvedValue(cookieStore as never);
    const result = await redeemAction(new FormData());
    expect(result.error).toBeDefined();
    expect(cookieStore.delete).toHaveBeenCalledWith({
      name: "warsaw_invite",
      path: "/onboard",
    });
  });

  it("returns { error } and clears cookie when orchestrator fails (ok:false)", async () => {
    vi.mocked(auth).mockResolvedValue({ githubHandle: "newmember" } as never);
    vi.mocked(findMemberByHandle).mockReturnValue(undefined);
    vi.mocked(orchestrate).mockResolvedValueOnce({ ok: false });

    const cookieStore = {
      get: vi.fn(() => ({ value: validToken() })),
      delete: vi.fn(),
    };
    vi.mocked(cookies).mockResolvedValue(cookieStore as never);

    const formData = new FormData();
    formData.set("display_name", "New Member");
    formData.set("telegram", "@newmember");
    formData.set("git_email_alias", "new@member.com");
    formData.set("consent_accepted", "true");

    const result = await redeemAction(formData);
    expect(result.error).toBeDefined();
    expect(cookieStore.delete).toHaveBeenCalledWith({
      name: "warsaw_invite",
      path: "/onboard",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("uses productionClient when NEXT_PUBLIC_E2E_MODE !== '1'", async () => {
    // Disable the E2E mock branch — exercise productionClient() closure.
    delete process.env.NEXT_PUBLIC_E2E_MODE;

    const readFile = vi.fn().mockImplementation(async (path: string) => {
      if (path.endsWith("invitations.md")) {
        return {
          content:
            "# Invitations Ledger\n\n| JTI | Status | Issued At | Issued By | Hint (Telegram) | Redeemed At | Redeemed By | Notes |\n|---|---|---|---|---|---|---|---|\n",
          sha: "x",
          path,
        };
      }
      if (path.endsWith("roster.md")) {
        return {
          content:
            "# Roster\n\n## Members (opt-in)\n\n| Name | GitHub | Telegram | Link | Focus |\n|---|---|---|---|---|\n",
          sha: "x",
          path,
        };
      }
      if (path.endsWith("git-email-aliases.md")) {
        return {
          content:
            "# Git email aliases\n\n| Git email | GitHub handle | Notes |\n|---|---|---|\n",
          sha: "x",
          path,
        };
      }
      return null;
    });
    const commitMultipleFiles = vi
      .fn()
      .mockResolvedValue({ commitSha: "prod-sha" });
    const getHeadSha = vi.fn().mockResolvedValue("prod-head");
    vi.mocked(createGitHubApp).mockReturnValue({
      readFile,
      commitMultipleFiles,
      getHeadSha,
      writeFile: vi.fn(),
      deleteFile: vi.fn(),
    } as never);

    vi.mocked(auth).mockResolvedValue({ githubHandle: "newmember" } as never);
    vi.mocked(findMemberByHandle).mockReturnValue(undefined);
    const cookieStore = {
      get: vi.fn(() => ({ value: validToken() })),
      delete: vi.fn(),
    };
    vi.mocked(cookies).mockResolvedValue(cookieStore as never);

    const formData = new FormData();
    formData.set("display_name", "New Member");
    formData.set("telegram", "@newmember");
    formData.set("git_email_alias", "new@member.com");
    formData.set("consent_accepted", "true");

    await expect(redeemAction(formData)).rejects.toThrow(
      /__redirect__:\/this-week/,
    );
    expect(createGitHubApp).toHaveBeenCalled();
    expect(readFile).toHaveBeenCalled();
    expect(commitMultipleFiles).toHaveBeenCalled();
    // getHeadSha is invoked by the orchestrator's CAS preamble — ensure
    // the production wrapper bridged it through.
    expect(getHeadSha).toHaveBeenCalled();
  });
});
