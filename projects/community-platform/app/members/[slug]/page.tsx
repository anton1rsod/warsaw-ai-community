import Link from "next/link";
import { notFound } from "next/navigation";
import { findMemberBySlug, listMembers } from "@/lib/content-snapshot";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { PersonaPanel } from "@/app/components/PersonaPanel";
import { SafeHtml } from "@/app/components/SafeHtml";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return listMembers().map((m) => ({ slug: m.slug }));
}

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

      {profileHtml ? (
        <section className="mt-6">
          <h2 className="text-xl font-medium">Profile</h2>
          <SafeHtml
            html={profileHtml}
            className="prose prose-neutral dark:prose-invert mt-2 max-w-none"
          />
        </section>
      ) : (
        <section className="mt-6 rounded border border-dashed p-4 text-sm text-neutral-600 dark:text-neutral-400">
          {member.name} hasn&apos;t filled out a profile yet. Members can edit{" "}
          <code>community/members/{member.slug}.md</code> directly via git.
        </section>
      )}

      <div className="mt-6">
        <PersonaPanel html={personaHtml} slug={member.slug} />
      </div>
    </main>
  );
}
