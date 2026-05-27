import { groupMeetingsByMonth, listMeetings } from "@/lib/meetings";
import { listMeetingsFromSnapshot } from "@/lib/content-snapshot";
import { s } from "@/lib/i18n/strings";
import { MonoLabel } from "@/app/components/MonoLabel";
import { Pill } from "@/app/components/Pill";
import { ListItem } from "@/app/components/ListItem";
import { EmptyState } from "@/app/components/EmptyState";

export const dynamic = "force-static";

function monthLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split("-").map(Number);
  if (!y || !m) return yyyymm;
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(
    new Date(Date.UTC(y, m - 1, 1)),
  );
}

export default async function MeetingsIndex(): Promise<React.JSX.Element> {
  const meetings = listMeetings(listMeetingsFromSnapshot());
  const grouped = groupMeetingsByMonth(meetings);

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-10">
      <MonoLabel>{s("meetings.index.kicker")}</MonoLabel>
      <h1 className="mt-2 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
        {s("meetings.index.title")}
      </h1>
      <div className="mt-3 flex flex-wrap gap-2">
        <Pill variant="dashed" href="/api/calendar.ics">
          {s("meetings.index.subscribeIcs")}
        </Pill>
      </div>

      {grouped.size === 0 ? (
        <div className="mt-8">
          <EmptyState
            headline={s("empty.meetings.headline")}
            calibration={s("empty.meetings.calibration")}
          />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-8">
          {Array.from(grouped.entries()).map(([month, mtgs]) => {
            const headingId = `month-${month}`;
            return (
              <section key={month} aria-labelledby={headingId}>
                <MonoLabel>{monthLabel(month)}</MonoLabel>
                <h2 id={headingId} className="sr-only" aria-hidden="true">
                  {monthLabel(month)}
                </h2>
                <ul className="mt-2 flex flex-col gap-2">
                  {mtgs.map((m) => (
                    <li key={m.slug}>
                      <ListItem
                        href={`/meetings/${m.slug}`}
                        title={m.title}
                        meta={m.date}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
