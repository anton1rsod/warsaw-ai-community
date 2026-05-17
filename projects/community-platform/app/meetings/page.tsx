import { groupMeetingsByMonth, listMeetings } from "@/lib/meetings";
import { listMeetingsFromSnapshot } from "@/lib/content-snapshot";

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
    <main className="mx-auto max-w-3xl p-8">
      <header className="mb-6 flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">Meetings</h1>
        <a className="text-sm underline hover:no-underline" href="/api/calendar.ics">
          Subscribe to calendar (ICS)
        </a>
      </header>

      {grouped.size === 0 ? (
        <p className="text-neutral-600 dark:text-neutral-400">
          No meetings yet. The next sync will appear here once the first meeting note lands.{" "}
          <a
            className="underline"
            href="https://github.com/anton1rsod/warsaw-ai-community/blob/main/community/meetings/weekly/_template.md"
          >
            View template ↗
          </a>
        </p>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([month, mtgs]) => (
            <section key={month}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {monthLabel(month)}
              </h2>
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {mtgs.map((m) => (
                  <li key={m.slug} className="py-2">
                    <a className="block hover:underline" href={`/meetings/${m.slug}`}>
                      <span className="font-medium">{m.date}</span>
                      <span className="ml-2">— {m.title}</span>
                    </a>
                    {m.body ? (
                      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        {m.body.split("\n").find((l) => l.trim())?.slice(0, 120) ?? ""}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
