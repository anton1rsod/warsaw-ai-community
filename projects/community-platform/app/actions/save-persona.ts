"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { env } from "@/lib/env";
import { createGitHubApp, GitHubAppError, type GitHubAppClient } from "@/lib/github-app";
import { log } from "@/lib/log";
import { safeHandle as toSafeHandle } from "@/lib/handles";
import { fetchPersonaFromUrl, validatePersonaUrl } from "@/lib/persona-fetch";
import {
  SavePersonaSchema,
  validatePersonaFrontmatter,
  type PersonaSaveResult,
} from "@/lib/persona-editor";
import { composeProfile, parseFrontmatter } from "@/lib/profile-editor";
import { mockPersonaStore } from "./_test-persona-store";

function isE2EMockActive(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_E2E_MODE === "1";
}

// H140: path is derived from the session slug only.
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

// E2E mode substitutes a fixture for the NETWORK fetch only — the H151 URL
// guard still runs for real. persona_id templates from the session slug so
// H142 passes for whichever member the spec signs in as.
function e2eFixturePersona(slug: string): string {
  return [
    "---",
    `persona_id: ${slug}`,
    "display_name: E2E URL Attach",
    "languages: [en]",
    "schema_version: 1.0",
    "---",
    "# E2E URL Attach",
    "",
    "## Tags",
    "",
    "### Industries",
    "- e2e-url-attach — expert",
    "",
    "## Background",
    "",
    "### One-line bio",
    "",
    "Attached from URL in E2E mode.",
    "",
  ].join("\n");
}

// O4: persist the re-sync source in the profile frontmatter via a SECOND
// single-file commit (H149: every write stays single-file — never a
// multi-file commit for this pair).
async function writeSourceUrlToProfile(
  gh: GitHubAppClient,
  slug: string,
  sourceUrl: string,
  handle: string,
): Promise<boolean> {
  try {
    const profile = await gh.readFile(profilePath(slug));
    if (!profile) return false;
    const { data, body } = parseFrontmatter(profile.content);
    // Immutable update; composeProfile preserves all other frontmatter keys (H19).
    const next = { ...data, persona_source_url: sourceUrl };
    const safe = toSafeHandle(handle);
    await gh.writeFile(profilePath(slug), composeProfile(next, body), {
      message: `chore(persona): record persona_source_url for @${safe}\n`,
      sha: profile.sha,
    });
    return true;
  } catch {
    return false;
  }
}

export async function savePersona(formData: FormData): Promise<PersonaSaveResult> {
  const session = await auth();
  if (!session?.githubHandle) return { ok: false, error: "not_authenticated" };

  const handle = session.githubHandle;
  const member = findMemberByHandle(handle);
  if (!member) return { ok: false, error: "not_a_member" };
  const slug = member.slug; // H140: never from the request body

  const rawContent = formData.get("content");
  const rawSourceUrl = formData.get("source_url");
  const hasContent = typeof rawContent === "string" && rawContent.length > 0;
  const hasSourceUrl = typeof rawSourceUrl === "string" && rawSourceUrl.length > 0;

  // content XOR source_url — both present is ambiguous and rejects.
  if (hasContent && hasSourceUrl) {
    log.warn("save-persona", "invalid_content", { slug, success: false, error: "invalid_content" });
    return { ok: false, error: "invalid_content" };
  }

  let candidate: string;
  if (hasSourceUrl) {
    // H151: URL guard runs in EVERY mode — E2E mocks the network, never the guard.
    if (validatePersonaUrl(rawSourceUrl) === null) {
      log.warn("save-persona", "invalid_url", { slug, success: false, error: "invalid_url" });
      return { ok: false, error: "invalid_url" };
    }
    if (isE2EMockActive()) {
      candidate = e2eFixturePersona(slug);
    } else {
      // H152 inside: streamed byte cap + redirect/timeout rejection.
      const fetched = await fetchPersonaFromUrl(rawSourceUrl);
      if (!fetched.ok) {
        log.warn("save-persona", fetched.error, { slug, success: false, error: fetched.error });
        return { ok: false, error: fetched.error };
      }
      candidate = fetched.content;
    }
  } else {
    if (!hasContent) {
      log.warn("save-persona", "invalid_content", { slug, success: false, error: "invalid_content" });
      return { ok: false, error: "invalid_content" };
    }
    candidate = rawContent;
  }

  // H154: single validation pipeline — schema + H142 are identical for paste,
  // upload, URL-attach, and re-sync. No second path.
  const parsed = SavePersonaSchema.safeParse({ content: candidate });
  if (!parsed.success) {
    log.warn("save-persona", "invalid_content", { slug, success: false, error: "invalid_content" });
    return { ok: false, error: "invalid_content" };
  }

  const check = validatePersonaFrontmatter(parsed.data.content, slug);
  if (!check.ok) {
    log.warn("save-persona", check.error, { slug, success: false, error: check.error });
    return { ok: false, error: check.error };
  }

  const path = personaPath(slug);

  if (isE2EMockActive()) {
    mockPersonaStore.write(slug, parsed.data.content);
    log.info("save-persona", "saved", { slug, success: true });
    revalidatePath(`/members/${slug}`);
    return { ok: true, savedAt: new Date().toISOString() };
  }

  const gh = buildClient();
  try {
    const existing = await gh.readFile(path); // re-attach overwrites (H149: single file)
    const safe = toSafeHandle(handle);
    await gh.writeFile(path, parsed.data.content, {
      message: `chore(persona): update persona for @${safe}\n`,
      sha: existing?.sha,
    });
  } catch (err: unknown) {
    const reason = err instanceof GitHubAppError ? err.kind : "unknown";
    log.warn("save-persona", "write_failed", { slug, success: false, error: reason });
    return { ok: false, error: "write_failed" };
  }

  // O4: record the source AFTER the persona commit (the persona write is the
  // consent act; the pointer is bookkeeping). Failure surfaces as write_failed
  // so the member retries — re-attach is idempotent (H149).
  if (hasSourceUrl) {
    const recorded = await writeSourceUrlToProfile(gh, slug, rawSourceUrl, handle);
    if (!recorded) {
      log.warn("save-persona", "write_failed", {
        slug,
        success: false,
        error: "source_url_record_failed",
      });
      return { ok: false, error: "write_failed" };
    }
  }

  log.info("save-persona", "saved", { slug, success: true });
  // Unlike save-profile (which also revalidates /members), persona save only
  // revalidates the detail page — the /members list doesn't render persona data.
  revalidatePath(`/members/${slug}`);
  return { ok: true, savedAt: new Date().toISOString() };
}
