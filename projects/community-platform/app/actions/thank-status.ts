"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import {
  createGitHubApp,
  GitHubAppError,
  type GitHubAppClient,
} from "@/lib/github-app";
import { safeHandle as toSafeHandle } from "@/lib/handles";
import { log } from "@/lib/log";
import {
  findMemberByHandle,
  findMemberBySlug,
  findProjectBySlug,
  findMeetingBySlug,
} from "@/lib/content-snapshot";
import {
  composeProfile,
  parseProfileFrontmatter,
  type ProfileFrontmatter,
} from "@/lib/profile-editor";

const ItemTypeSchema = z.enum(["status", "contribution", "meeting"]);
type ItemType = z.infer<typeof ItemTypeSchema>;

const ThankInputSchema = z.object({
  recipient: z.string().min(1),
  item_type: ItemTypeSchema,
  item_id: z.string().min(1),
  profileSha: z.string().min(1),
});
export type ThankInput = z.infer<typeof ThankInputSchema>;

export type ThankResult =
  | { ok: true; already_thanked?: boolean }
  | {
      ok: false;
      error:
        | "not_authenticated"
        | "not_a_member"
        | "recipient_not_found"
        | "self_thank_blocked"
        | "item_not_found"
        | "invalid_input"
        | "refresh_needed"
        | "internal_error";
    };

// O8 lock: per item_type item_id shape validators.
// Status posts are NOT in the snapshot (read live via status-reader.ts),
// so we validate shape only — no existence check needed.
const STATUS_ITEM_ID_RE = /^\d{4}-W\d{2}\/[a-z0-9_-]+$/i;

function isValidItemId(item_type: ItemType, item_id: string): boolean {
  if (item_type === "status") {
    return STATUS_ITEM_ID_RE.test(item_id);
  }
  if (item_type === "contribution") {
    const parts = item_id.split(":");
    if (parts.length !== 2) return false;
    const [projectSlug, contributorSlug] = parts;
    if (!projectSlug || !contributorSlug) return false;
    return (
      findProjectBySlug(projectSlug) != null &&
      findMemberBySlug(contributorSlug) != null
    );
  }
  // meeting
  return findMeetingBySlug(item_id) != null;
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

function profilePath(slug: string): string {
  return `community/members/${slug}.md`;
}

function commitMessage(
  handle: string,
  recipient: string,
  item_type: ItemType,
  item_id: string,
): string {
  // Defense-in-depth: strip CR/LF + cap at 39 chars via lib/handles. GitHub
  // already enforces alphanumeric+hyphen + ≤39 char on login, but the
  // injection boundary should not rely on an external party's invariant.
  const safeHandle = toSafeHandle(handle);
  return (
    `chore(community): @${safeHandle} thanks @${recipient} for ${item_type} "${item_id}"\n\n` +
    `Co-Authored-By: ${safeHandle} <${safeHandle}@users.noreply.github.com>\n`
  );
}

export async function thankStatus(input: ThankInput): Promise<ThankResult> {
  const parsed = ThankInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };
  const { recipient, item_type, item_id, profileSha } = parsed.data;

  const session = await auth();
  const handle = session?.githubHandle;
  if (!handle || typeof handle !== "string") {
    return { ok: false, error: "not_authenticated" };
  }
  const giver = findMemberByHandle(handle);
  if (!giver) return { ok: false, error: "not_a_member" };

  // H53: self-thank blocked
  if (recipient === giver.slug) {
    return { ok: false, error: "self_thank_blocked" };
  }

  // Non-roster recipient blocked
  if (!findMemberBySlug(recipient)) {
    return { ok: false, error: "recipient_not_found" };
  }

  // O8: validate item_id shape per item_type
  if (!isValidItemId(item_type, item_id)) {
    return { ok: false, error: "item_not_found" };
  }

  const path = profilePath(giver.slug);
  const gh = buildClient();
  const file = await gh.readFile(path);
  if (!file) return { ok: false, error: "internal_error" };

  // H53: SHA pre-check — defense in depth alongside writeFile sha gate
  if (file.sha !== profileSha) {
    log.warn("thank-status", "sha_mismatch", {
      slug: giver.slug,
      loaded: profileSha,
      current: file.sha,
    });
    return { ok: false, error: "refresh_needed" };
  }

  const { fm, body } = parseProfileFrontmatter(file.content);

  // O7: profile re-read dedup. Triple = (recipient, item_type, item_id).
  const existing = fm.thanks_given.find(
    (t) =>
      t.recipient === recipient &&
      t.item_type === item_type &&
      t.item_id === item_id,
  );
  if (existing) {
    log.warn("thank-status", "dedup", {
      slug: giver.slug,
      recipient,
      item_type,
      item_id,
    });
    return { ok: true, already_thanked: true };
  }

  const newRecord = {
    recipient,
    item_type,
    item_id,
    given_at: new Date().toISOString(),
  };
  const newFm: ProfileFrontmatter = {
    ...fm,
    thanks_given: [...fm.thanks_given, newRecord],
  };
  const newContent = composeProfile(
    newFm as unknown as Parameters<typeof composeProfile>[0],
    body,
  );

  try {
    await gh.writeFile(path, newContent, {
      message: commitMessage(handle, recipient, item_type, item_id),
      sha: profileSha,
    });
  } catch (err: unknown) {
    if (err instanceof GitHubAppError && err.kind === "sha_conflict") {
      log.warn("thank-status", "sha_conflict", { slug: giver.slug });
      return { ok: false, error: "refresh_needed" };
    }
    log.error("thank-status", "writeFile_failed", {
      reason: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, error: "internal_error" };
  }

  revalidatePath(`/members/${recipient}`);
  if (item_type === "meeting") revalidatePath(`/meetings/${item_id}`);
  // status / contribution revalidate handled at page-cache layer

  log.warn("thank-status", "thanked", {
    slug: giver.slug,
    recipient,
    item_type,
    item_id,
  });
  return { ok: true };
}
