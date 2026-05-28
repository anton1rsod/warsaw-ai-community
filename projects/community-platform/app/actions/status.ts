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
import { isProductionRuntime } from "@/lib/runtime-env";
import {
  STATUS_MODES,
  STATUS_BODY_MAX_RICH,
  STATUS_BODY_MAX_SHIPPING_LOG,
  sanitizeShippingLogBody,
  type StatusMode,
} from "@/lib/shipping-log";
import { notifyTelegram } from "@/lib/telegram-notify";
import { readTelegramEcho } from "@/lib/profile-editor";
import { loadMemberProfileFresh } from "@/lib/content-snapshot";

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
const PostSchema = z
  .object({
    week: WeekSchema,
    body: z.string().min(1).max(STATUS_BODY_MAX_RICH),
    mode: z.enum(STATUS_MODES).default("rich"),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "shipping-log" && data.body.length > STATUS_BODY_MAX_SHIPPING_LOG) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `shipping-log mode body exceeds ${STATUS_BODY_MAX_SHIPPING_LOG} chars`,
        path: ["body"],
      });
    }
  });
const EditSchema = z
  .object({
    week: WeekSchema,
    body: z.string().min(1).max(STATUS_BODY_MAX_RICH),
    mode: z.enum(STATUS_MODES).default("rich"),
    sha: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.mode === "shipping-log" && data.body.length > STATUS_BODY_MAX_SHIPPING_LOG) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `shipping-log mode body exceeds ${STATUS_BODY_MAX_SHIPPING_LOG} chars`,
        path: ["body"],
      });
    }
  });
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

function fileBody(
  handle: string,
  week: string,
  body: string,
  mode: StatusMode,
): string {
  // Frontmatter uses `updated_at` (not `posted_at`) because both post and
  // edit emit the current timestamp — `posted_at` would be misleading once
  // an entry is edited. Phase 7 contributions counter reads commit-level
  // dates from git log, not this field, so renaming is safe.
  const sanitizedBody = mode === "shipping-log" ? sanitizeShippingLogBody(body) : body;
  return [
    "---",
    `week: ${week}`,
    `author: ${handle}`,
    `mode: ${mode}`,
    `updated_at: ${new Date().toISOString()}`,
    "---",
    "",
    sanitizedBody,
    "",
  ].join("\n");
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
  mode?: string;
}): Promise<StatusActionResult> {
  const parsed = PostSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  if (!isProductionRuntime() && isE2EMode()) {
    return fromMock(await mockStatusActions.post(parsed.data));
  }

  const author = await resolveAuthor();
  if ("error" in author) return { ok: false, error: author.error };

  const c = client();
  try {
    const result = await c.writeFile(
      pathFor(parsed.data.week, author.slug),
      fileBody(author.handle, parsed.data.week, parsed.data.body, parsed.data.mode),
      { message: `status: ${author.handle} for ${parsed.data.week}` },
    );
    // H118 + H121: check opt-in flag via fresh GitHub fetch (not stale snapshot).
    // H119: fire-and-forget — echo failure never blocks the status write.
    try {
      const fresh = await loadMemberProfileFresh(author.slug, c);
      if (fresh && readTelegramEcho(fresh.data)) {
        // Mirror what was written to the git file: shipping-log bodies
        // are sanitized at write time (H116); the echo body must match.
        const echoBody =
          parsed.data.mode === "shipping-log"
            ? sanitizeShippingLogBody(parsed.data.body)
            : parsed.data.body;
        // H120 — rate-limit deferred to v0.10.1 (echo-per-edit acceptable).
        void notifyTelegram({
          handle: author.handle,
          week: parsed.data.week,
          body: echoBody,
          url: `${env.NEXTAUTH_URL}/this-week`,
          botToken: env.TELEGRAM_BOT_TOKEN,
          chatId: env.TELEGRAM_CHAT_ID,
          topicId: env.TELEGRAM_TOPIC_ID,
        });
      }
    } catch {
      // H119 — never block the status write on echo wiring failure
    }
    return { ok: true, sha: result.sha };
  } catch (err: unknown) {
    return { ok: false, error: mapWriteError(err) };
  }
}

export async function editStatus(input: {
  week: string;
  body: string;
  mode?: string;
  sha: string;
}): Promise<StatusActionResult> {
  const parsed = EditSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  if (!isProductionRuntime() && isE2EMode()) {
    return fromMock(await mockStatusActions.edit(parsed.data));
  }

  const author = await resolveAuthor();
  if ("error" in author) return { ok: false, error: author.error };

  const ec = client();
  try {
    const result = await ec.writeFile(
      pathFor(parsed.data.week, author.slug),
      fileBody(author.handle, parsed.data.week, parsed.data.body, parsed.data.mode),
      {
        message: `status: ${author.handle} edits ${parsed.data.week}`,
        sha: parsed.data.sha,
      },
    );
    // H118 + H121: check opt-in flag via fresh GitHub fetch (not stale snapshot).
    // H119: fire-and-forget — echo failure never blocks the status write.
    // H120 — rate-limit deferred to v0.10.1 (echo-per-edit acceptable).
    try {
      const fresh = await loadMemberProfileFresh(author.slug, ec);
      if (fresh && readTelegramEcho(fresh.data)) {
        // Mirror what was written to the git file (H116 sanitize parity).
        const echoBody =
          parsed.data.mode === "shipping-log"
            ? sanitizeShippingLogBody(parsed.data.body)
            : parsed.data.body;
        void notifyTelegram({
          handle: author.handle,
          week: parsed.data.week,
          body: echoBody,
          url: `${env.NEXTAUTH_URL}/this-week`,
          botToken: env.TELEGRAM_BOT_TOKEN,
          chatId: env.TELEGRAM_CHAT_ID,
          topicId: env.TELEGRAM_TOPIC_ID,
        });
      }
    } catch {
      // H119 — never block the status write on echo wiring failure
    }
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
