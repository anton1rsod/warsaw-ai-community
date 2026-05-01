import Link from "next/link";
import { listMembers } from "@/lib/content-snapshot";

export default function MembersPage(): React.JSX.Element {
  const members = listMembers();
  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-semibold">Members</h1>
        <Link href="/home" className="text-sm underline">
          Home
        </Link>
      </header>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        {members.length} {members.length === 1 ? "member" : "members"}.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {members.map((m) => (
          <li
            key={m.slug}
            className="rounded border p-4 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <Link href={`/members/${m.slug}`} className="block">
              <div className="font-medium">{m.name}</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">
                @{m.githubHandle}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
