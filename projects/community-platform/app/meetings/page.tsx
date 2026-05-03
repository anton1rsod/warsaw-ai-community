import Link from "next/link";
import { listMeetingsFromSnapshot } from "@/lib/content-snapshot";

export default function MeetingsPage(): React.JSX.Element {
  const meetings = listMeetingsFromSnapshot();
  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">Meetings</h1>
        <Link href="/home" className="text-sm underline">
          Home
        </Link>
      </header>
      {meetings.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
          No meeting notes yet. Notes are committed under{" "}
          <code>community/meetings/weekly/YYYY-MM-DD.md</code>.
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {meetings.map((m) => (
            <li
              key={m.slug}
              className="rounded border p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              <Link href={`/meetings/${m.slug}`} className="block">
                <div className="font-medium">{m.title}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  {m.attendees.length}{" "}
                  {m.attendees.length === 1 ? "attendee" : "attendees"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
