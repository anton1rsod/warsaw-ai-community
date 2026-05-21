import React from "react";

interface EventCardProps {
  slug: string;
  title: string;
  date: string;
  startTime?: string;
  location?: string;
  goingCount: number;
  hoverLift?: boolean;
  showRsvpStateChip?: "going" | "interested" | null;
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function parseDateBadge(dateISO: string): { day: string; month: string } {
  const parts = dateISO.split("-");
  const mm = parts[1] ?? "1";
  const dd = parts[2] ?? "1";
  const monthIndex = Math.max(0, Math.min(11, parseInt(mm, 10) - 1));
  return { day: String(parseInt(dd, 10)), month: MONTHS[monthIndex] as string };
}

export function EventCard({
  slug,
  title,
  date,
  startTime,
  location,
  goingCount,
  hoverLift = true,
  showRsvpStateChip = null,
}: EventCardProps): React.JSX.Element {
  const { day, month } = parseDateBadge(date);
  const metaParts: string[] = [];
  if (startTime) metaParts.push(startTime);
  if (location) metaParts.push(location);

  const hoverClasses = hoverLift
    ? "hover:translate-y-[-2px] hover:shadow-[0_4px_0_0_#1a1a2e] focus-visible:translate-y-[-2px] focus-visible:shadow-[0_4px_0_0_#1a1a2e] transition-transform duration-150"
    : "";

  return (
    <a
      href={`/events/${slug}`}
      className={`bg-paper border-[1.5px] border-ink p-3 flex items-center gap-3 no-underline text-ink ${hoverClasses}`}
    >
      <div className="bg-accent-500 px-[9px] py-[6px] font-voice font-bold text-[10px] text-center flex flex-col leading-tight -rotate-[1.5deg] text-ink">
        <span>{day}</span>
        <span className="text-[8px] font-normal">{month}</span>
      </div>
      <div className="flex-1">
        <div className="font-display italic font-bold text-[14px] text-ink">{title}</div>
        {metaParts.length > 0 && (
          <div className="font-voice text-[10px] text-ink mt-1">{metaParts.join(" · ")}</div>
        )}
      </div>
      {showRsvpStateChip === "going" && (
        <span className="bg-ink text-cream font-voice font-bold text-[9px] px-2 py-1">✓ going</span>
      )}
      {showRsvpStateChip === "interested" && (
        <span className="border-[1.5px] border-ink text-ink font-voice font-bold text-[9px] px-2 py-1">interested</span>
      )}
      {goingCount > 0 && showRsvpStateChip === null && (
        <span className="bg-ink text-cream font-voice font-bold text-[9px] px-2 py-1">{goingCount} going</span>
      )}
    </a>
  );
}
