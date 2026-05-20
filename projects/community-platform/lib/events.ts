import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const EventSlugRegex = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-([a-z0-9]+(?:-[a-z0-9]+)*)$/;

export const EventSlugSchema = z
  .string()
  .regex(EventSlugRegex, "EventSlug must match YYYY-MM-DD-kebab format")
  .refine((s) => {
    const parts = s.split("-", 3);
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    if (!year || !month || !day) return false;
    const d = new Date(Date.UTC(year, month - 1, day));
    return (
      d.getUTCFullYear() === year &&
      d.getUTCMonth() === month - 1 &&
      d.getUTCDate() === day
    );
  }, "EventSlug date component must be a calendar-valid date")
  .brand<"EventSlug">();

export type EventSlug = z.infer<typeof EventSlugSchema>;

export const EventStatusSchema = z.enum(["scheduled", "cancelled", "completed"]);

export const EventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slug: EventSlugSchema,
  title: z.string().min(1),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  durationMinutes: z.number().int().positive().optional(),
  location: z.string().optional(),
  host: z.string().optional(),
  url: z.string().url().optional(),
  status: EventStatusSchema.default("scheduled"),
  body: z.string().default(""),
});

export type Event = z.infer<typeof EventSchema>;

export function parseEventFrontmatter(
  folderName: string,
  raw: unknown,
): Event {
  const parsed = EventSchema.parse(raw);
  if (parsed.slug !== folderName) {
    throw new Error(
      `Event folder "${folderName}" does not match frontmatter slug "${parsed.slug}"`,
    );
  }
  return parsed;
}

export function isKnownEventSlug(
  slug: EventSlug,
  known: ReadonlySet<EventSlug>,
): boolean {
  return known.has(slug);
}

export function filterOrphanSlugs(
  raw: readonly string[],
  known: ReadonlySet<EventSlug>,
): EventSlug[] {
  const out: EventSlug[] = [];
  for (const s of raw) {
    const parsed = EventSlugSchema.safeParse(s);
    if (parsed.success && known.has(parsed.data)) {
      out.push(parsed.data);
    }
  }
  return out;
}

const SNAKE_TO_CAMEL_KEYS: readonly (readonly [string, string])[] = [
  ["start_time", "startTime"],
  ["duration_minutes", "durationMinutes"],
];

function normalizeEventFrontmatter(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const snakeKeys = new Set(SNAKE_TO_CAMEL_KEYS.map(([snake]) => snake));
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (snakeKeys.has(key)) continue;
    out[key] = value;
  }
  for (const [snake, camel] of SNAKE_TO_CAMEL_KEYS) {
    if (snake in data && !(camel in out)) {
      out[camel] = data[snake];
    }
  }
  if (out.date instanceof Date) {
    out.date = out.date.toISOString().slice(0, 10);
  }
  return out;
}

export async function listEventsFromDisk(repoRoot: string): Promise<Event[]> {
  const eventsDir = path.join(repoRoot, "community", "events");
  let entries: Awaited<ReturnType<typeof fs.readdir>> extends infer T ? T : never;
  try {
    entries = await fs.readdir(eventsDir, { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }

  const events: Event[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("_")) continue;
    const readmePath = path.join(eventsDir, entry.name, "README.md");
    let raw: string;
    try {
      raw = await fs.readFile(readmePath, "utf-8");
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw err;
    }
    const { data, content } = matter(raw);
    const normalized = {
      ...normalizeEventFrontmatter(data as Record<string, unknown>),
      body: content,
    };
    const event = parseEventFrontmatter(entry.name, normalized);
    events.push(event);
  }

  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}
