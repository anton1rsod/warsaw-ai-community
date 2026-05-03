"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { findMemberByHandle } from "@/lib/content-snapshot";
import { createGitHubApp, GitHubAppError } from "@/lib/github-app";
import { WEEK_REGEX, parseWeek } from "@/lib/week";
import {
  isE2EMode,
  mockStatusActions,
  type MockResult,
} from "@/app/actions/_test-status-store";

export type StatusActionError =
  | "not_authenticated"
  | "not_a_member"
  | "invalid_input"
  | "sha_conflict"
  | "not_found"
  | "forbidden"
  | "unknown";

export type StatusActionResult =
  | { ok: true; sha: string }
  | { ok: false; error: StatusActionError };

const WeekSchema = z
  .string()
  .regex(WEEK_REGEX)
  // `parseWeek` enforces 1..53 (matches ISO 8601). The bare regex would
  // accept W00 / W54 / W99 and create writes at directory paths that no
  // reader will ever surface — refine to the same range.
  .refine((s) => parseWeek(s) !== null, "Invalid ISO week number");
const PostSchema = z.object({
  week: WeekSchema,
  body: z.string().min(1).max(4000),
});
const EditSchema = PostSchema.extend({ sha: z.string().min(1) });
const DeleteSchema = z.object({
  week: WeekSchema,
  sha: z.string().min(1),
});

interface ResolvedAuthor {
  handle: string;
  slug: string;
}

async function resolveAuthor(): Promise<
  ResolvedAuthor | { error: "not_authenticated" | "not_a_member" }
> {
  const session = await auth();
  if (!session?.githubHandle) return { error: "not_authenticated" };
  const member = findMemberByHandle(session.githubHandle);
  if (!member) return { error: "not_a_member" };
  return { handle: session.githubHandle, slug: member.slug };
}

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

function pathFor(week: string, slug: string): string {
  return `community/status/${week}/${slug}.md`;
}

function fileBody(handle: string, week: string, body: string): string {
  // Frontmatter uses `updated_at` (not `posted_at`) because both post and
  // edit emit the current timestamp — `posted_at` would be misleading once
  // an entry is edited. Phase 7 contributions counter reads commit-level
  // dates from git log, not this field, so renaming is safe.
  return [
    "---",
    `week: ${week}`,
    `author: ${handle}`,
    `updated_at: ${new Date().toISOString()}`,
    "---",
    "",
    body,
    "",
  ].join("\n");
}

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

function mapWriteError(err: unknown): StatusActionError {
  if (err instanceof GitHubAppError) return err.kind;
  return "unknown";
}

/**
 * Translates the mock store's discriminated `MockResult` into the strict
 * `StatusActionResult` union. The mock only emits a closed set of error
 * strings (not_authenticated, not_a_member, sha_conflict, not_found) so
 * the cast to `StatusActionError` is sound.
 */
function fromMock(result: MockResult): StatusActionResult {
  return result.ok
    ? { ok: true, sha: result.sha }
    : { ok: false, error: result.error as StatusActionError };
}

export async function postStatus(input: {
  week: string;
  body: string;
}): Promise<StatusActionResult> {
  const parsed = PostSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  if (!isProductionRuntime() && isE2EMode()) {
    return fromMock(await mockStatusActions.post(parsed.data));
  }

  const author = await resolveAuthor();
  if ("error" in author) return { ok: false, error: author.error };

  try {
    const result = await client().writeFile(
      pathFor(parsed.data.week, author.slug),
      fileBody(author.handle, parsed.data.week, parsed.data.body),
      { message: `status: ${author.handle} for ${parsed.data.week}` },
    );
    return { ok: true, sha: result.sha };
  } catch (err: unknown) {
    return { ok: false, error: mapWriteError(err) };
  }
}

export async function editStatus(input: {
  week: string;
  body: string;
  sha: string;
}): Promise<StatusActionResult> {
  const parsed = EditSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  if (!isProductionRuntime() && isE2EMode()) {
    return fromMock(await mockStatusActions.edit(parsed.data));
  }

  const author = await resolveAuthor();
  if ("error" in author) return { ok: false, error: author.error };

  try {
    const result = await client().writeFile(
      pathFor(parsed.data.week, author.slug),
      fileBody(author.handle, parsed.data.week, parsed.data.body),
      {
        message: `status: ${author.handle} edits ${parsed.data.week}`,
        sha: parsed.data.sha,
      },
    );
    return { ok: true, sha: result.sha };
  } catch (err: unknown) {
    return { ok: false, error: mapWriteError(err) };
  }
}

export async function deleteStatus(input: {
  week: string;
  sha: string;
}): Promise<StatusActionResult> {
  const parsed = DeleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  if (!isProductionRuntime() && isE2EMode()) {
    return fromMock(await mockStatusActions.remove(parsed.data));
  }

  const author = await resolveAuthor();
  if ("error" in author) return { ok: false, error: author.error };

  try {
    await client().deleteFile(pathFor(parsed.data.week, author.slug), {
      message: `status: ${author.handle} deletes ${parsed.data.week}`,
      sha: parsed.data.sha,
    });
    return { ok: true, sha: "" };
  } catch (err: unknown) {
    return { ok: false, error: mapWriteError(err) };
  }
}
