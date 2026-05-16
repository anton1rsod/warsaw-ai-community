"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { env } from "@/lib/env";
import {
  createGitHubApp,
  GitHubAppError,
  type GitHubAppClient,
} from "@/lib/github-app";
import {
  SaveProfileSchema,
  parseFrontmatter,
  composeProfile,
  hasRequiredFrontmatter,
  type SaveErrorCode,
  type SaveResult,
} from "@/lib/profile-editor";
import { mockProfileStore } from "./_test-profile-store";

function isE2EMockActive(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_E2E_MODE === "1"
  );
}

function profilePath(slug: string): string {
  return `community/members/${slug}.md`;
}

function buildClient(): GitHubAppClient {
  return createGitHubApp({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
    owner: env.GITHUB_REPO_OWNER,
    repo: env.GITHUB_REPO_NAME,
    branch: env.GITHUB_REPO_BRANCH,
  });
}

function commitMessage(handle: string): string {
  return (
    `chore(community): update profile prose for @${handle}\n\n` +
    `Co-Authored-By: ${handle} <${handle}@users.noreply.github.com>\n`
  );
}

function isShaConflict(err: unknown): boolean {
  return err instanceof GitHubAppError && err.kind === "sha_conflict";
}

type AttemptResult =
  | { kind: "ok"; sha: string }
  | { kind: "conflict" }
  | { kind: "error"; error: SaveErrorCode };

async function attemptSave(
  gh: GitHubAppClient,
  path: string,
  newBody: string,
  handle: string,
  expectedSha: string,
): Promise<AttemptResult> {
  if (isE2EMockActive()) {
    // Extract slug from path: "community/members/<slug>.md"
    const slug = path
      .replace("community/members/", "")
      .replace(".md", "");
    const current = mockProfileStore.get(slug);
    if (!current) return { kind: "error", error: "file_missing" };
    if (current.sha !== expectedSha) return { kind: "conflict" };
    const written = mockProfileStore.write(slug, newBody, expectedSha);
    if (!written) return { kind: "conflict" };
    return { kind: "ok", sha: written.sha };
  }

  const file = await gh.readFile(path);
  if (!file) return { kind: "error", error: "file_missing" };
  // H16: optimistic-lock check. If the file moved between /me/edit render
  // and save submit, the user's view is stale — refuse the write.
  if (file.sha !== expectedSha) return { kind: "conflict" };

  const { data } = parseFrontmatter(file.content);
  if (!hasRequiredFrontmatter(data)) {
    return { kind: "error", error: "frontmatter_corrupt" };
  }

  const newContent = composeProfile(data, newBody);

  try {
    const result = await gh.writeFile(path, newContent, {
      message: commitMessage(handle),
      sha: expectedSha,
    });
    return { kind: "ok", sha: result.sha };
  } catch (err: unknown) {
    if (isShaConflict(err)) return { kind: "conflict" };
    return { kind: "error", error: "unknown" };
  }
}

export async function saveProfile(formData: FormData): Promise<SaveResult> {
  // H29: auth() runs first — the JWT session cookie acts as the CSRF token.
  // Cross-origin POSTs cannot carry the HttpOnly cookie, so unauthenticated
  // requests are rejected before any state-mutating operation occurs.
  const session = await auth();
  if (!session?.githubHandle) {
    console.warn("[save-profile]", {
      success: false,
      error: "not_authenticated",
    });
    return { ok: false, error: "not_authenticated" };
  }

  // H15: slug is derived entirely from the authenticated session handle.
  // Any slug field in the form body is intentionally ignored.
  const handle = session.githubHandle;
  const member = findMemberByHandle(handle);
  if (!member) {
    console.warn("[save-profile]", {
      slug: null,
      success: false,
      error: "not_a_member",
    });
    return { ok: false, error: "not_a_member" };
  }

  const slug = member.slug;

  // H18: 64KB cap (defined in SaveProfileSchema) prevents commit-size DoS.
  // H16: schema also requires expectedSha (the SHA the client loaded at SSR).
  const parsed = SaveProfileSchema.safeParse({
    body: formData.get("body"),
    expectedSha: formData.get("sha"),
  });
  if (!parsed.success) {
    console.warn("[save-profile]", {
      slug,
      success: false,
      error: "invalid_body",
    });
    return { ok: false, error: "invalid_body" };
  }

  const gh = buildClient();
  const path = profilePath(slug);

  // H16/H20: single-attempt SHA-CAS. Any conflict (stale client SHA or
  // GitHub-side TOCTOU at write time) maps to refresh_needed. The prior
  // retry-on-409 path silently overwrote concurrent commits — removed.
  const attempt = await attemptSave(
    gh,
    path,
    parsed.data.body,
    handle,
    parsed.data.expectedSha,
  );
  if (attempt.kind === "conflict") {
    console.warn("[save-profile]", {
      slug,
      success: false,
      error: "refresh_needed",
    });
    return { ok: false, error: "refresh_needed" };
  }

  if (attempt.kind === "error") {
    // H24: log only {slug, success, error} — never body content.
    console.warn("[save-profile]", {
      slug,
      success: false,
      error: attempt.error,
    });
    return { ok: false, error: attempt.error };
  }

  // H24: log only {slug, sha, success} — body is deliberately omitted.
  // H17: sha in the log provides an audit-trail link to the git commit.
  console.warn("[save-profile]", {
    slug,
    sha: attempt.sha,
    success: true,
  });
  revalidatePath(`/members/${slug}`);
  revalidatePath("/members");
  return { ok: true, savedAt: new Date().toISOString() };
}
