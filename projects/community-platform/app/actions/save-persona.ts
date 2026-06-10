"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { env } from "@/lib/env";
import { createGitHubApp, GitHubAppError, type GitHubAppClient } from "@/lib/github-app";
import { log } from "@/lib/log";
import { safeHandle as toSafeHandle } from "@/lib/handles";
import {
  SavePersonaSchema,
  validatePersonaFrontmatter,
  type PersonaSaveResult,
} from "@/lib/persona-editor";
import { mockPersonaStore } from "./_test-persona-store";

function isE2EMockActive(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_E2E_MODE === "1";
}

// H140: path is derived from the session slug only.
function personaPath(slug: string): string {
  return `persona-builder/personas/${slug}/persona-${slug}.public.md`;
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

export async function savePersona(formData: FormData): Promise<PersonaSaveResult> {
  const session = await auth();
  if (!session?.githubHandle) return { ok: false, error: "not_authenticated" };

  const handle = session.githubHandle;
  const member = findMemberByHandle(handle);
  if (!member) return { ok: false, error: "not_a_member" };
  const slug = member.slug; // H140: never from the request body

  const parsed = SavePersonaSchema.safeParse({ content: formData.get("content") });
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
    log.warn("save-persona", "saved", { slug, success: true });
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

  log.warn("save-persona", "saved", { slug, success: true });
  // Unlike save-profile (which also revalidates /members), persona save only
  // revalidates the detail page — the /members list doesn't render persona data.
  revalidatePath(`/members/${slug}`);
  return { ok: true, savedAt: new Date().toISOString() };
}
