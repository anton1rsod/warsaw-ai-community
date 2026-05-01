"use server";

import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { createGitHubApp } from "@/lib/github-app";
import { mockConsentStore } from "@/app/actions/_test-consent-store";

export type ConsentError =
  | "not_authenticated"
  | "not_a_member"
  | "unknown";

export type ConsentResult = { ok: true } | { ok: false; error: ConsentError };

/**
 * Cookie name is locked per execution-plan §6.4 risk mitigation: the
 * proxy-side check uses this exact name, so any drift here would either
 * trap consented users in a /consent redirect loop or let unconsented
 * users into /home. Don't rename without updating proxy.ts together.
 */
export const CONSENT_COOKIE = "waic-consented";

function client(): ReturnType<typeof createGitHubApp> {
  return createGitHubApp({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
    owner: env.GITHUB_REPO_OWNER,
    repo: env.GITHUB_REPO_NAME,
    branch: env.GITHUB_REPO_BRANCH,
  });
}

function profilePath(slug: string): string {
  return `community/members/${slug}.md`;
}

function stubBody(handle: string, name: string): string {
  return [
    "---",
    `name: ${name}`,
    `github_handle: ${handle}`,
    `consented_at: ${new Date().toISOString()}`,
    "---",
    "",
    "_Profile prose to come — open a PR to fill this in._",
    "",
  ].join("\n");
}

function isE2EMockActive(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_E2E_MODE === "1"
  );
}

/**
 * True iff the member's profile file (`community/members/<slug>.md`)
 * exists. Used by the /consent page to short-circuit if a stale cookie
 * was lost but the consent record is still in the repo.
 *
 * Returns false (without hitting the API) for handles not on the roster
 * — they shouldn't be calling this in the first place, but defending the
 * outer layers from accidental misuse keeps the call site terse.
 */
export async function hasConsent(handle: string): Promise<boolean> {
  const member = findMemberByHandle(handle);
  if (!member) return false;

  if (isE2EMockActive()) {
    return mockConsentStore.has(member.slug);
  }

  const result = await client().readFile(profilePath(member.slug));
  return result !== null;
}

export async function acceptConsent(): Promise<ConsentResult> {
  const session = await auth();
  if (!session?.githubHandle) return { ok: false, error: "not_authenticated" };

  const member = findMemberByHandle(session.githubHandle);
  if (!member) return { ok: false, error: "not_a_member" };

  if (isE2EMockActive()) {
    mockConsentStore.add(member.slug);
    return { ok: true };
  }

  try {
    const c = client();
    // Idempotent: skip the writeFile if the file already exists. Avoids
    // an empty-diff commit on retries (e.g., user double-clicks Accept).
    const existing = await c.readFile(profilePath(member.slug));
    if (existing) return { ok: true };

    await c.writeFile(
      profilePath(member.slug),
      stubBody(session.githubHandle, member.name),
      { message: `feat(community): ${session.githubHandle} platform consent` },
    );
    return { ok: true };
  } catch {
    return { ok: false, error: "unknown" };
  }
}

export async function acceptConsentAndSetCookie(): Promise<ConsentResult> {
  const result = await acceptConsent();
  if (result.ok) {
    const c = await cookies();
    c.set(CONSENT_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return result;
}
