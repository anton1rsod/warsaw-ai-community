"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { createGitHubApp, type GitHubAppClient } from "@/lib/github-app";
import {
  verifyToken,
  RedeemFormSchema,
  redeemInvitation as orchestrate,
  logRedemptionEvent,
  type RedemptionClient,
} from "@/lib/invitations";
import { mockInvitationStore } from "./_test-invitation-store";

const COOKIE_NAME = "__Secure-warsaw_invite";

// `"use server"` modules can only export async functions — keep types
// inline. `interface` (not `type`) per project lint rule
// `@typescript-eslint/consistent-type-definitions`.
interface ActionResult {
  ok?: boolean;
  error?: string;
}

function isE2EMockActive(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_E2E_MODE === "1"
  );
}

/**
 * Mock RedemptionClient used during E2E. Returns minimal seeded markdown
 * for the three roster files, and records redemption JTI + handle into the
 * shared mockInvitationStore. The orchestrator's CAS retry path is exercised
 * by integration tests against the real client; the mock returns a stable
 * head sha so the happy path always hits commit-success on the first attempt.
 */
function mockClient(): RedemptionClient {
  return {
    async readFile(path: string) {
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
    },
    async commitMultipleFiles(input) {
      const jtiMatch = input.message.match(/Invitation-JTI: ([0-9a-f-]+)/);
      if (jtiMatch?.[1]) {
        mockInvitationStore.recordRedemption(jtiMatch[1], "test");
      }
      return { commitSha: "mock-commit-sha" };
    },
    async getHeadSha() {
      return "mock-head-sha";
    },
  };
}

function productionClient(): RedemptionClient {
  const app: GitHubAppClient = createGitHubApp({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
    owner: env.GITHUB_REPO_OWNER,
    repo: env.GITHUB_REPO_NAME,
    branch: env.GITHUB_REPO_BRANCH,
  });
  return {
    async readFile(path) {
      const f = await app.readFile(path);
      return f ? { content: f.content, sha: f.sha, path: f.path } : null;
    },
    async commitMultipleFiles(input) {
      return app.commitMultipleFiles(input);
    },
    async getHeadSha() {
      return app.getHeadSha();
    },
  };
}

function clientFor(): RedemptionClient {
  return isE2EMockActive() ? mockClient() : productionClient();
}

/**
 * /onboard form submission target. Wires session + cookie + token verify
 * + orchestrator. On success: clear cookie + revalidate 3 routes + redirect
 * to /this-week. On terminal failures (auth, missing/invalid token,
 * already-member): single error string returned (info-leak prevention §11.5).
 * Form-validation failures keep the cookie so the user can retry without
 * re-clicking the original invitation link.
 */
export async function redeemInvitation(
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.githubHandle) {
    logRedemptionEvent({ jti: "(unknown)", event: "invalid", httpStatus: 401 });
    return { error: "Sign in required." };
  }

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(COOKIE_NAME)?.value;
  if (!cookieToken) {
    logRedemptionEvent({ jti: "(unknown)", event: "invalid", httpStatus: 404 });
    return { error: "Invitation not found." };
  }

  const payload = verifyToken(cookieToken, env.INVITE_SECRET);
  if (!payload) {
    cookieStore.delete({ name: COOKIE_NAME, path: "/onboard" });
    return { error: "Invitation not found." };
  }

  if (findMemberByHandle(session.githubHandle)) {
    cookieStore.delete({ name: COOKIE_NAME, path: "/onboard" });
    logRedemptionEvent({
      jti: payload.jti,
      event: "already-member",
      redeemerGh: session.githubHandle,
    });
    return { error: "Invitation not found." };
  }

  const formObj = {
    display_name: formData.get("display_name") ?? undefined,
    focus: formData.get("focus") ?? undefined,
    link: formData.get("link") ?? undefined,
    telegram: formData.get("telegram") ?? undefined,
    git_email_alias: formData.get("git_email_alias") ?? undefined,
    consent_accepted: formData.get("consent_accepted") === "true",
  };
  const parsed = RedeemFormSchema.safeParse(formObj);
  if (!parsed.success) {
    return { error: "Invalid form input. Please check your entries." };
  }

  const result = await orchestrate({
    payload,
    redeemerHandle: session.githubHandle,
    form: parsed.data,
    client: clientFor(),
    now: () => new Date(),
  });

  if (!result.ok) {
    cookieStore.delete({ name: COOKIE_NAME, path: "/onboard" });
    return { error: "Invitation not found." };
  }

  cookieStore.delete({ name: COOKIE_NAME, path: "/onboard" });
  revalidatePath("/members");
  revalidatePath("/this-week");
  revalidatePath("/admin/health");
  redirect("/this-week");
}
