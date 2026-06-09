"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { isAdmin } from "@/lib/content-snapshot";
import { createGitHubApp } from "@/lib/github-app";
import { parseInvitationsLedger, jtiIsRevoked, appendRevocationRow } from "@/lib/invitations";

interface RevokeResult {
  ok?: boolean;
  error?: string;
}

const RevokeInputSchema = z.object({ jti: z.string().uuid() });
const LEDGER_PATH = "community/members/invitations.md";

export async function revokeInvitation(formData: FormData): Promise<RevokeResult> {
  const session = await auth();
  // H134-parity: revoke is admin-only, re-verified server-side.
  if (!session?.githubHandle || !isAdmin(session.githubHandle)) {
    return { error: "Not authorized." };
  }

  const parsed = RevokeInputSchema.safeParse({ jti: formData.get("jti") });
  if (!parsed.success) return { error: "Invalid request." };

  const app = createGitHubApp({
    appId: env.GITHUB_APP_ID, privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID, owner: env.GITHUB_REPO_OWNER,
    repo: env.GITHUB_REPO_NAME, branch: env.GITHUB_REPO_BRANCH,
  });

  const file = await app.readFile(LEDGER_PATH);
  if (!file) return { error: "Ledger unavailable." };

  const rows = parseInvitationsLedger(file.content);
  if (jtiIsRevoked(rows, parsed.data.jti)) return { ok: true }; // idempotent

  const newLedger = appendRevocationRow(file.content, {
    jti: parsed.data.jti, issuedAt: "", issuedBy: `@${session.githubHandle}`,
    hintTelegram: "", revokedBy: session.githubHandle, reason: "admin revoke (meeting invite)",
  });
  await app.writeFile(LEDGER_PATH, newLedger, {
    message: `invitation: revoke ${parsed.data.jti}`, sha: file.sha,
  });
  return { ok: true };
}
