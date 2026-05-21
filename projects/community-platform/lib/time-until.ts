/**
 * v0.6 Phase 3.1 — relative time formatter for hero / week-pane mono labels.
 *
 * Shape: parses a `YYYY-MM-DD` date + optional `HH:mm` startTime and returns a
 * short human-readable distance ("in 30m", "in 6h 30m", "in 2d 4h", "now").
 * `now` is passed in explicitly so callers (Server Components, tests) control
 * the clock — no hidden `new Date()` inside this helper.
 *
 * Strict-null-checks contract (noUncheckedIndexedAccess): every array access
 * goes through `??` fallback so `parseInt(undefined, 10)` (which yields NaN)
 * cannot leak out.
 *
 * Past events collapse to "now" rather than emitting "in -2h" — H56 anonymous
 * branch should never show a negative duration, which would be a manipulation
 * signal (scarcity / "missed the train" framing).
 */
export function formatTimeUntil(
  dateISO: string,
  startTime: string | undefined,
  now: Date,
): string {
  const parts = dateISO.split("-");
  const y = parseInt(parts[0] ?? "0", 10);
  const mo = parseInt(parts[1] ?? "1", 10);
  const d = parseInt(parts[2] ?? "1", 10);
  const timeParts = (startTime ?? "00:00").split(":");
  const hh = parseInt(timeParts[0] ?? "0", 10);
  const mm = parseInt(timeParts[1] ?? "0", 10);

  const target = new Date(y, mo - 1, d, hh, mm);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs < 0) return "now";

  const diffMin = Math.floor(diffMs / 60_000);
  const days = Math.floor(diffMin / 1440);
  const hours = Math.floor((diffMin % 1440) / 60);
  const mins = diffMin % 60;

  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${mins}m`;
  return `in ${mins}m`;
}
