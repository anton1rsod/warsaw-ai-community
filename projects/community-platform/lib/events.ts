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
