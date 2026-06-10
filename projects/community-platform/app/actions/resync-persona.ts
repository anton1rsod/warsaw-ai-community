"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { env } from "@/lib/env";
import { createGitHubApp, GitHubAppError, type GitHubAppClient } from "@/lib/github-app";
import { log } from "@/lib/log";
import { safeHandle as toSafeHandle } from "@/lib/handles";
import { fetchPersonaFromUrl } from "@/lib/persona-fetch";
import {
  SavePersonaSchema,
  validatePersonaFrontmatter,
  type PersonaSaveResult,
} from "@/lib/persona-editor";
import { parseFrontmatter } from "@/lib/profile-editor";

// H140: path is derived from the session slug only ("use server" files may
// only export async functions, so this stays local rather than shared with
// save-persona.ts).
function personaPath(slug: string): string {
  return `persona-builder/personas/${slug}/persona-${slug}.public.md`;
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

/**
 * Re-sync the member's persona from the stored source URL.
 *
 * H153 (TOCTOU): persona_source_url lives in publicly-editable git and is
 * UNTRUSTED on every read — this action reads it fresh, then re-runs the FULL
 * H151 URL guard (inside fetchPersonaFromUrl) before any network fetch.
 * Attach-time validation is never trusted. A stored URL failing the guard
 * errors cleanly with no fetch.
 *
 * No E2E fork: /me/edit only renders the Re-sync pill when the (synthetic,
 * URL-less in E2E mode) profile frontmatter carries persona_source_url.
 */
export async function resyncPersona(): Promise<PersonaSaveResult> {
  const session = await auth();
  if (!session?.githubHandle) return { ok: false, error: "not_authenticated" };

  const handle = session.githubHandle;
  const member = findMemberByHandle(handle);
  if (!member) return { ok: false, error: "not_a_member" };
  const slug = member.slug; // H140 parity: slug from the session, never from input

  const gh = buildClient();

  let sourceUrl: string;
  try {
    const profile = await gh.readFile(profilePath(slug));
    if (!profile) {
      log.warn("resync-persona", "invalid_url", { slug, success: false, error: "invalid_url" });
      return { ok: false, error: "invalid_url" };
    }
    const { data } = parseFrontmatter(profile.content);
    const raw = data.persona_source_url;
    if (typeof raw !== "string" || raw.length === 0) {
      log.warn("resync-persona", "invalid_url", { slug, success: false, error: "invalid_url" });
      return { ok: false, error: "invalid_url" };
    }
    sourceUrl = raw;
  } catch (err: unknown) {
    const reason = err instanceof GitHubAppError ? err.kind : "unknown";
    log.warn("resync-persona", "write_failed", { slug, success: false, error: reason });
    return { ok: false, error: "write_failed" };
  }

  // H153 + H151/H152: fetchPersonaFromUrl re-runs the full guard + byte cap.
  const fetched = await fetchPersonaFromUrl(sourceUrl);
  if (!fetched.ok) {
    log.warn("resync-persona", fetched.error, { slug, success: false, error: fetched.error });
    return { ok: false, error: fetched.error };
  }

  // H154: identical validation pipeline as paste/upload/URL-attach.
  const parsed = SavePersonaSchema.safeParse({ content: fetched.content });
  if (!parsed.success) {
    log.warn("resync-persona", "invalid_content", { slug, success: false, error: "invalid_content" });
    return { ok: false, error: "invalid_content" };
  }
  const check = validatePersonaFrontmatter(parsed.data.content, slug);
  if (!check.ok) {
    log.warn("resync-persona", check.error, { slug, success: false, error: check.error });
    return { ok: false, error: check.error };
  }

  const path = personaPath(slug); // H153: slug-derived write path only
  try {
    const existing = await gh.readFile(path);
    const safe = toSafeHandle(handle);
    await gh.writeFile(path, parsed.data.content, {
      message: `chore(persona): re-sync persona from source for @${safe}\n`,
      sha: existing?.sha,
    });
  } catch (err: unknown) {
    const reason = err instanceof GitHubAppError ? err.kind : "unknown";
    log.warn("resync-persona", "write_failed", { slug, success: false, error: reason });
    return { ok: false, error: "write_failed" };
  }

  log.warn("resync-persona", "saved", { slug, success: true });
  revalidatePath(`/members/${slug}`);
  return { ok: true, savedAt: new Date().toISOString() };
}
