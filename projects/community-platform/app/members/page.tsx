import Link from "next/link";
import { listMembers } from "@/lib/content-snapshot";
import { s } from "@/lib/i18n/strings";
import { MonoLabel } from "@/app/components/MonoLabel";
import { Avatar } from "@/app/components/Avatar";

export default function MembersPage(): React.JSX.Element {
  const members = listMembers();
  const kickerText = s("members.index.kickerFmt").replace(
    "{count}",
    String(members.length),
  );

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-10">
      <MonoLabel>{kickerText}</MonoLabel>
      <h1 className="mt-2 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
        {s("members.index.title")}
      </h1>

      <section aria-labelledby="members-heading" className="mt-8">
        <MonoLabel>{s("members.index.sectionLabel")}</MonoLabel>
        <h2 id="members-heading" className="sr-only">
          Community
        </h2>
        <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {members.map((m) => (
            <li key={m.slug}>
              <Link
                href={`/members/${m.slug}`}
                className="flex items-center gap-3 px-4 py-3 bg-paper border-l-[3px] border-l-ink no-underline hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
              >
                <Avatar
                  name={m.name}
                  handle={m.githubHandle}
                  size={32}
                  decorative
                />
                <span className="flex-1 min-w-0">
                  <span className="block font-display font-semibold text-ink text-[13px] truncate">
                    {m.name}
                  </span>
                  <span className="block font-voice text-[10px] text-dust truncate">
                    @{m.githubHandle}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
