"use server";

import { z } from "zod";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { createGitHubApp } from "@/lib/github-app";
import { isAdmin, listEventsFromSnapshot } from "@/lib/content-snapshot";
import {
  EventSlugSchema,
  parseEventFrontmatter,
  normalizeEventFrontmatter,
} from "@/lib/events";
import { composeEventReadme, deriveEventSlug } from "@/lib/event-author";
import { safeHandle as toSafeHandle } from "@/lib/handles";
import { log } from "@/lib/log";

const CreateEventInputSchema = z.object({
  title: z.string().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional(),
  durationMinutes: z.coerce.number().int().positive().max(600).optional(),
  location: z.string().max(200).optional(),
  host: z.string().max(80).optional(),
  url: z.string().url().optional(),
  slug: z.string().optional(),
  body: z.string().max(50_000),
});

export type CreateEventResult =
  | { ok: true; slug: string }
  | {
      ok: false;
      error:
        | "not_authorized"
        | "invalid_input"
        | "invalid_slug"
        | "slug_exists"
        | "internal_error";
    };

function buildClient(): ReturnType<typeof createGitHubApp> {
  return createGitHubApp({
    appId: env.GITHUB_APP_ID,
    privateKey: env.GITHUB_APP_PRIVATE_KEY,
    installationId: env.GITHUB_APP_INSTALLATION_ID,
    owner: env.GITHUB_REPO_OWNER,
    repo: env.GITHUB_REPO_NAME,
    branch: env.GITHUB_REPO_BRANCH,
  });
}

function readField(fd: FormData, name: string): string | undefined {
  const v = fd.get(name);
  if (v === null) return undefined;
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  return trimmed === "" ? undefined : trimmed;
}

export async function createEvent(
  formData: FormData,
): Promise<CreateEventResult> {
  const session = await auth();
  if (!session?.githubHandle || !isAdmin(session.githubHandle)) {
    return { ok: false, error: "not_authorized" };
  }

  const raw = {
    title: readField(formData, "title"),
    date: readField(formData, "date"),
    startTime: readField(formData, "startTime"),
    durationMinutes: readField(formData, "durationMinutes"),
    location: readField(formData, "location"),
    host: readField(formData, "host"),
    url: readField(formData, "url"),
    slug: readField(formData, "slug"),
    body: readField(formData, "body") ?? "",
  };
  const parsed = CreateEventInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  const slugCandidate =
    parsed.data.slug ?? deriveEventSlug(parsed.data.date, parsed.data.title);
  const slugParsed = EventSlugSchema.safeParse(slugCandidate);
  if (!slugParsed.success) return { ok: false, error: "invalid_slug" };
  const slug = slugParsed.data;

  const existing = listEventsFromSnapshot().some((e) => e.slug === slug);
  if (existing) return { ok: false, error: "slug_exists" };

  const readmeContent = composeEventReadme({
    date: parsed.data.date,
    slug,
    title: parsed.data.title,
    startTime: parsed.data.startTime,
    durationMinutes: parsed.data.durationMinutes,
    location: parsed.data.location,
    host: parsed.data.host,
    url: parsed.data.url,
    status: "scheduled",
    body: parsed.data.body,
  });

  try {
    const { data, content } = matter(readmeContent);
    parseEventFrontmatter(slug, {
      // gray-matter types .data as { [key: string]: any }; the narrowing cast
      // is safe because normalizeEventFrontmatter accepts any string-keyed bag.
      ...normalizeEventFrontmatter(data as Record<string, unknown>),
      body: content,
    });
  } catch {
    return { ok: false, error: "invalid_input" };
  }

  const gh = buildClient();
  const path = `community/events/${slug}/README.md`;
  const file = await gh.readFile(path);
  if (file !== null) return { ok: false, error: "slug_exists" };

  const safeHandle = toSafeHandle(session.githubHandle);
  try {
    await gh.writeFile(path, readmeContent, {
      message:
        `chore(events): @${safeHandle} create "${slug}"\n\n` +
        `Co-Authored-By: ${safeHandle} <${safeHandle}@users.noreply.github.com>\n`,
    });
  } catch (err) {
    log.error("create-event", "writeFile_failed", {
      reason: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, error: "internal_error" };
  }

  // H79 fan-out: every surface that renders event data. `/` surfaces the next
  // upcoming event via AnonymousHero (v0.4.5+); the rest are direct event-data
  // routes (index, detail, /home weekly view, ICS feed).
  revalidatePath("/events");
  revalidatePath(`/events/${slug}`);
  revalidatePath("/home");
  revalidatePath("/");
  revalidatePath("/api/calendar.ics");

  log.warn("create-event", "created", { handle: safeHandle, slug });
  return { ok: true, slug };
}
