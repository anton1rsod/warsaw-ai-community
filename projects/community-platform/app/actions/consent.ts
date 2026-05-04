"use server";

import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { createGitHubApp } from "@/lib/github-app";
import { CONSENT_COOKIE } from "@/lib/consent-cookie";
import { mockConsentStore } from "@/app/actions/_test-consent-store";
import { generateConsentMarkdown } from "@/lib/consent-content";

// `"use server"` modules can only export async functions — keep types
// inline (not exported) and import the cookie name from lib/.
type ConsentError = "not_authenticated" | "not_a_member" | "unknown";
type ConsentResult = { ok: true } | { ok: false; error: ConsentError };

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
      generateConsentMarkdown({
        name: member.name,
        githubHandle: session.githubHandle,
      }),
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
