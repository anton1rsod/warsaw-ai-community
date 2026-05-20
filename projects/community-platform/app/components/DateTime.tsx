import { strings } from "@/lib/i18n/strings";

/**
 * <DateTime> — Q5.4 list/detail rendering split.
 *
 * context='list':   relative ("3 days ago" / "Today" / "Thu") with the
 *                   absolute date as the `title` attribute (hover reveals).
 *                   Used by /home Recent activity, /calendar rows, /handbook
 *                   v0.5+ placeholder sections.
 *
 * context='detail': absolute as primary ("Wednesday, May 21 · 18:30 - 21:00 CEST")
 *                   Used by /events/[slug] hero (Phase A wrap; Phase B
 *                   upgrades to event-led variant).
 *
 * All times rendered in CEST in v0.4 (community is Warsaw-only). v0.5+
 * Polish + per-user timezone via next-intl.
 */
interface DateTimeProps {
  iso: string; // YYYY-MM-DD
  context: "list" | "detail";
  startTime?: string; // HH:MM 24h
  durationMinutes?: number;
}

function relativeDate(iso: string, now: Date): string {
  const date = new Date(`${iso}T12:00:00Z`);
  const diffDays = Math.round(
    (date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays === 0) return strings["datetime.today"];
  if (diffDays === 1) return strings["datetime.tomorrow"];
  if (diffDays === -1) return strings["datetime.yesterday"];
  if (diffDays > 1 && diffDays <= 6) {
    return new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date);
  }
  if (diffDays < 0) {
    return `${Math.abs(diffDays)}${strings["datetime.daysAgo"]}`;
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function absoluteDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function timeRange(start: string, duration: number | undefined): string {
  if (duration == null || duration <= 0) return start;
  const [h, m] = start.split(":").map(Number);
  const total = (h ?? 0) * 60 + (m ?? 0) + duration;
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${start} - ${pad(endH)}:${pad(endM)}`;
}

export function DateTime({
  iso,
  context,
  startTime,
  durationMinutes,
}: DateTimeProps): React.JSX.Element {
  if (context === "list") {
    return (
      <time dateTime={iso} title={absoluteDate(iso)}>
        {relativeDate(iso, new Date())}
      </time>
    );
  }

  // context === "detail"
  const absolute = absoluteDate(iso);
  if (!startTime) {
    return <time dateTime={iso}>{absolute}</time>;
  }
  const range = timeRange(startTime, durationMinutes);
  return (
    <time dateTime={`${iso}T${startTime}`}>
      {absolute} · {range} CEST
    </time>
  );
}
