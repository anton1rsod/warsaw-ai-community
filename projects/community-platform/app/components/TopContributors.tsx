import Link from "next/link";
import type { ProjectContribution } from "@/lib/contributions";

interface TopContributorsProps {
  contributors: readonly ProjectContribution[];
  /**
   * Maps a GitHub handle to the member's roster slug for the
   * `/members/<slug>` link. Defaults to identity (handle as slug surrogate),
   * which 404s when the slug generator doesn't match the handle (typical
   * case — e.g., `anton1rsod` vs `anton-safronov`). Callers SHOULD pass a
   * real resolver derived from `findMemberByHandle`.
   */
  slugFor?: (handle: string) => string;
}

export function TopContributors({
  contributors,
  slugFor = (h) => h,
}: TopContributorsProps): React.JSX.Element {
  if (contributors.length === 0) {
    return (
      <section className="mt-6 rounded border border-dashed p-4 text-sm text-neutral-600 dark:text-neutral-400">
        No contributors yet.
      </section>
    );
  }

  return (
    <section className="mt-6 rounded border p-4">
      <h2 className="text-lg font-medium">Top contributors</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Derived from git history. Bot commits excluded.
      </p>
      <ol className="mt-3 space-y-1">
        {contributors.map((c) => (
          <li key={c.handle} className="flex items-center justify-between">
            <Link
              href={`/members/${slugFor(c.handle)}`}
              className="text-sm underline"
            >
              @{c.handle}
            </Link>
            <span className="text-sm tabular-nums">{c.commits}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
