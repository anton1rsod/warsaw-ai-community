/**
 * ISO 8601 week helpers.
 *
 * Week starts on Monday (day 1) and ends on Sunday (day 7). Week 1 of a given
 * year is the week containing that year's first Thursday — equivalently, the
 * first 7-day span with at least 4 days in the new year. This means a date
 * late in December may belong to week 1 of the following year, and an early-
 * January date may belong to week 52 or 53 of the previous year.
 *
 * Format: `YYYY-Www` (e.g. `2026-W18`, `2026-W01`).
 */

export interface ParsedWeek {
  year: number;
  week: number;
}

/**
 * ISO 8601 week token for a given Date.
 *
 * Algorithm: shift the input to the nearest Thursday (date + 4 - dayOfWeek),
 * then count weeks since Jan 1 of that Thursday's calendar year. The shift
 * is what makes year-boundary semantics correct — the Thursday determines
 * the ISO year, not the original date's calendar year.
 */
export function weekFromDate(date: Date): string {
  // Strip time-of-day so DST/timezone artifacts can't bump the week.
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  // ISO day numbers: Monday = 1, Sunday = 7. JS getUTCDay() returns 0 for
  // Sunday; the `|| 7` fallback maps Sunday to ISO 7.
  const dayNum = d.getUTCDay() || 7;
  // Move to the Thursday of the same ISO week.
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function currentWeek(): string {
  return weekFromDate(new Date());
}

/**
 * Parses a `YYYY-Www` token. Returns `null` for any malformed input
 * (wrong shape, week number outside 1..53). Stricter than just a regex
 * match so callers can branch on the null without a separate validation
 * pass.
 */
export function parseWeek(s: string): ParsedWeek | null {
  const m = s.match(/^(\d{4})-W(\d{2})$/);
  if (!m || !m[1] || !m[2]) return null;
  const year = Number.parseInt(m[1], 10);
  const week = Number.parseInt(m[2], 10);
  if (week < 1 || week > 53) return null;
  return { year, week };
}

/**
 * Returns the half-open `[start, end)` UTC range for a given ISO week token.
 * `start` is the Monday (00:00 UTC) of that week; `end` is the following
 * Monday (00:00 UTC). Use `< end` not `<= end` to test membership.
 *
 * Throws on invalid input — call `parseWeek` first if you need null-safe
 * handling.
 */
export function weekToRange(s: string): { start: Date; end: Date } {
  const parsed = parseWeek(s);
  if (!parsed) throw new Error(`Invalid week: ${s}`);
  // ISO week 1 always contains January 4. The Monday of W1 is therefore
  // Jan 4 minus its weekday offset (Monday = 1, so subtract 0; Sunday = 7,
  // so subtract 6).
  const jan4 = new Date(Date.UTC(parsed.year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  const start = new Date(week1Monday);
  start.setUTCDate(week1Monday.getUTCDate() + (parsed.week - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);
  return { start, end };
}
