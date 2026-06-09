export interface IsoWeek {
  year: number;
  week: number;
}

const WEEK_RE = /^(\d{4})-W(\d{2})$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export function parseIsoWeek(value: string): IsoWeek {
  const m = WEEK_RE.exec(value.trim());
  if (!m) throw new Error(`Invalid ISO week: ${value}`);
  return { year: Number(m[1]), week: Number(m[2]) };
}

/** Monday (00:00 UTC) of the given ISO week. ISO rule: week 1 contains the year's first Thursday. */
export function isoWeekMonday(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Dow = jan4.getUTCDay() || 7; // Mon=1..Sun=7
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4Dow + 1);
  const monday = new Date(week1Monday);
  monday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
  return monday;
}

function mondayOf(week: string): number {
  const { year, week: w } = parseIsoWeek(week);
  return isoWeekMonday(year, w).getTime();
}

/**
 * Length of the run of consecutive ISO weeks ending at the most recent week present.
 * Deterministic from the data alone (no "now"): streak = trailing consecutive count.
 */
export function trailingStreak(weeks: readonly string[]): number {
  if (weeks.length === 0) return 0;
  const sorted = [...new Set(weeks)].map(mondayOf).sort((a, b) => a - b);
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const cur = sorted[i] as number;
    const prev = sorted[i - 1] as number;
    if (Math.round((cur - prev) / DAY_MS) === 7) streak++;
    else break;
  }
  return streak;
}
