import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  findMemberBySlug,
  getContributions,
  listMembers,
  listEventsFromSnapshot,
} from "@/lib/content-snapshot";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { ContributionCard } from "@/app/components/ContributionCard";
import { GdprPanel } from "@/app/components/GdprPanel";
import { KudosCount } from "@/app/components/KudosCount";
import { PersonaPanel } from "@/app/components/PersonaPanel";
import { SafeHtml } from "@/app/components/SafeHtml";
import { filterOrphanSlugs, type EventSlug } from "@/lib/events";
import { ProfileFrontmatterSchema } from "@/lib/profile-editor";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return listMembers().map((m) => ({ slug: m.slug }));
}

// generateStaticParams precomputes the slug list, but we still call auth()
// inside the page for the self-only GdprPanel — Next.js falls back to dynamic
// rendering when a server component reads the session.
export const dynamic = "force-dynamic";

export default async function MemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const member = findMemberBySlug(slug);
  if (!member) notFound();

  const profileHtml = member.profile?.body
    ? await renderMarkdownToHtml(member.profile.body)
    : null;
  const personaHtml = member.persona ? await renderMarkdownToHtml(member.persona) : null;
  const contributions = getContributions(member.githubHandle);
  const session = await auth();
  const isSelf = session?.githubHandle === member.githubHandle;

  // H34, H39: parse v0.3 frontmatter fields; safeParse so a malformed profile
  // doesn't crash the page — it just renders no Events section.
  const parsedProfile = ProfileFrontmatterSchema.safeParse(
    member.profile?.data ?? {},
  );
  const fm = parsedProfile.success ? parsedProfile.data : undefined;

  const knownEventSlugs = new Set<EventSlug>(
    listEventsFromSnapshot().map((e) => e.slug),
  );
  const validGoing = fm ? filterOrphanSlugs(fm.events_going, knownEventSlugs) : [];
  const validInterested = fm
    ? filterOrphanSlugs(fm.events_interested, knownEventSlugs)
    : [];

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/members" className="text-sm underline">
        ← Members
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{member.name}</h1>
      <p className="mt-1 text-neutral-600 dark:text-neutral-400">
        <a className="underline" href={`https://github.com/${member.githubHandle}`}>
          @{member.githubHandle}
        </a>
      </p>

      <div className="mt-6">
        <ContributionCard contributions={contributions} />
      </div>

      {profileHtml ? (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium">Profile</h2>
            {isSelf ? (
              <Link
                href="/me/edit"
                className="text-sm underline"
              >
                Edit profile →
              </Link>
            ) : null}
          </div>
          <SafeHtml
            html={profileHtml}
            className="prose prose-neutral dark:prose-invert mt-2 max-w-none"
          />
        </section>
      ) : (
        <section className="mt-6 rounded border border-dashed p-4 text-sm text-neutral-600 dark:text-neutral-400">
          {isSelf ? (
            <Link href="/me/edit" className="underline">
              Edit your profile →
            </Link>
          ) : (
            <>
              {member.name} hasn&apos;t filled out a profile yet. Members can edit{" "}
              <code>community/members/{member.slug}.md</code> directly via git.
            </>
          )}
        </section>
      )}

      <div className="mt-6">
        <PersonaPanel html={personaHtml} slug={member.slug} />
      </div>

      {isSelf ? (
        <div className="mt-6">
          <GdprPanel />
        </div>
      ) : null}

      {validGoing.length + validInterested.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Events
          </h2>
          <ul className="mt-2 space-y-1">
            {validGoing.map((slug) => (
              <li key={slug}>
                <a className="hover:underline" href={`/events/${slug}`}>
                  ✓ Going — {slug}
                </a>
              </li>
            ))}
            {validInterested.map((slug) => (
              <li key={slug}>
                <a className="hover:underline" href={`/events/${slug}`}>
                  ★ Interested — {slug}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6">
        <KudosCount memberSlug={member.slug} />
      </section>
    </main>
  );
}
