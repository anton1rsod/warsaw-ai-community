import Link from "next/link";
import { listDecisionsFromSnapshot } from "@/lib/content-snapshot";

export default function DecisionsPage(): React.JSX.Element {
  const decisions = listDecisionsFromSnapshot();
  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">Decisions</h1>
        <Link href="/home" className="text-sm underline">
          Home
        </Link>
      </header>
      <ul className="mt-6 space-y-2">
        {decisions.map((d) => (
          <li
            key={d.slug}
            className="rounded border p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <Link href={`/decisions/${d.slug}`} className="block">
              <div className="font-medium">{d.title}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                {d.status ?? "—"} · {d.date ?? "—"}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
