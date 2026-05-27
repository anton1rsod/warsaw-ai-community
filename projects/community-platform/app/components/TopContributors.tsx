import Link from "next/link";
import type { ProjectContribution } from "@/lib/contributions";
import { Avatar } from "@/app/components/Avatar";
import { MonoLabel } from "@/app/components/MonoLabel";

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
      <section className="mt-6 border border-dashed border-ink p-4">
        <p className="font-voice text-[11px] text-dust">No contributors yet.</p>
      </section>
    );
  }

  return (
    <section className="mt-6 border-[1.5px] border-ink bg-paper p-4">
      <MonoLabel as="h2">Top contributors</MonoLabel>
      <p className="mt-1 font-voice text-[10px] text-dust">
        Derived from git history. Bot commits excluded.
      </p>
      <ol className="mt-3 space-y-1">
        {contributors.map((c) => (
          <li key={c.handle} className="flex items-center justify-between">
            <Link
              href={`/members/${slugFor(c.handle)}`}
              className="inline-flex items-center gap-2 font-voice text-[11px] text-ink underline underline-offset-2 hover:text-dust"
            >
              <Avatar name={c.handle} handle={c.handle} size={20} decorative />
              @{c.handle}
            </Link>
            <span className="font-voice text-[11px] text-dust tabular-nums">{c.commits}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
