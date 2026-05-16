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
): Promise<AttemptResult> {
  const file = await gh.readFile(path);
  if (!file) return { kind: "error", error: "file_missing" };

  const { data } = parseFrontmatter(file.content);
  if (!hasRequiredFrontmatter(data)) {
    return { kind: "error", error: "frontmatter_corrupt" };
  }

  const newContent = composeProfile(data, newBody);

  try {
    const result = await gh.writeFile(path, newContent, {
      message: commitMessage(handle),
      sha: file.sha,
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
  const parsed = SaveProfileSchema.safeParse({ body: formData.get("body") });
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

  // H16: SHA-CAS optimistic locking. First attempt uses the SHA from readFile.
  // H20: On sha_conflict (concurrent edit), retry once with a fresh read.
  // Second conflict → refresh_needed (tell the user to reload).
  let attempt = await attemptSave(gh, path, parsed.data.body, handle);
  if (attempt.kind === "conflict") {
    attempt = await attemptSave(gh, path, parsed.data.body, handle);
    if (attempt.kind === "conflict") {
      console.warn("[save-profile]", {
        slug,
        success: false,
        error: "refresh_needed",
      });
      return { ok: false, error: "refresh_needed" };
    }
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
