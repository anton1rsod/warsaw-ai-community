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
import { MonoLabel } from "@/app/components/MonoLabel";
import { s } from "@/lib/i18n/strings";
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
    <main id="main" className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/members" className="font-voice text-[11px] text-dust underline underline-offset-2">
        {s("members.detail.backLink")}
      </Link>
      <h1 className="mt-4 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
        {member.name}
      </h1>
      <p className="mt-1 font-voice text-[11px] text-dust">
        <a className="underline underline-offset-2 hover:text-ink" href={`https://github.com/${member.githubHandle}`}>
          @{member.githubHandle}
        </a>
      </p>

      <div className="mt-6">
        <ContributionCard contributions={contributions} />
      </div>

      {profileHtml ? (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <MonoLabel>{s("members.detail.profileSection")}</MonoLabel>
            {isSelf ? (
              <Link
                href="/me/edit"
                className="font-voice text-[11px] text-dust underline underline-offset-2 hover:text-ink"
              >
                {s("members.detail.editProfile")}
              </Link>
            ) : null}
          </div>
          <SafeHtml
            html={profileHtml}
            className="prose-warm mt-2"
          />
        </section>
      ) : (
        <section className="mt-6 border border-dashed border-ink p-4">
          <p className="font-voice text-[11px] text-dust">
            {isSelf ? (
              <Link href="/me/edit" className="underline underline-offset-2 hover:text-ink">
                {s("members.detail.editYourProfile")}
              </Link>
            ) : (
              (() => {
              const tmpl = s("members.detail.noProfileFmt").replace("{name}", member.name);
              const parts = tmpl.split("{path}");
              const pre = parts[0] ?? "";
              const post = parts[1] ?? "";
              const path = s("members.detail.noProfilePathFmt").replace("{slug}", member.slug);
              return (<>{pre}<code className="font-voice text-ink">{path}</code>{post}</>);
            })()
            )}
          </p>
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
          <MonoLabel>{s("members.detail.eventsSection")}</MonoLabel>
          <ul className="mt-2 space-y-1">
            {validGoing.map((evtSlug) => (
              <li key={evtSlug}>
                <a className="font-voice text-[11px] text-ink hover:underline" href={`/events/${evtSlug}`}>
                  ✓ Going — {evtSlug}
                </a>
              </li>
            ))}
            {validInterested.map((evtSlug) => (
              <li key={evtSlug}>
                <a className="font-voice text-[11px] text-dust hover:underline" href={`/events/${evtSlug}`}>
                  ★ Interested — {evtSlug}
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
