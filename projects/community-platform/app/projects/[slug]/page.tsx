import Link from "next/link";
import { notFound } from "next/navigation";
import {
  findProjectBySlug,
  listProjectDetails,
  getProjectContributions,
  findMemberByHandle,
} from "@/lib/content-snapshot";
import { TopContributors } from "@/app/components/TopContributors";
import { AskGBrainButton } from "@/app/components/AskGBrainButton";
import { ThankButton } from "@/app/components/ThankButton";
import { MonoLabel } from "@/app/components/MonoLabel";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { SafeHtml } from "@/app/components/SafeHtml";
import { env } from "@/lib/env";
import { s } from "@/lib/i18n/strings";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return listProjectDetails().map((p) => ({ slug: p.slug }));
}

interface RenderedSection {
  title: string;
  html: string | null;
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const project = findProjectBySlug(slug);
  if (!project) notFound();

  const contributors = getProjectContributions(slug);
  const slugFor = (handle: string): string =>
    findMemberByHandle(handle)?.slug ?? handle;

  const sections: { title: string; body: string | null }[] = [
    { title: "README", body: project.readme },
    { title: "Spec", body: project.spec },
    { title: "Plan", body: project.plan },
    { title: "Changelog", body: project.changelog },
  ];

  const rendered: RenderedSection[] = await Promise.all(
    sections.map(async (sec) => ({
      title: sec.title,
      html: sec.body ? await renderMarkdownToHtml(sec.body) : null,
    })),
  );

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/projects" className="font-voice text-[11px] text-dust underline underline-offset-2">
        {s("projects.detail.backLink")}
      </Link>
      <h1 className="mt-4 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
        {project.title}
      </h1>
      <p className="mt-1 font-voice text-[11px] text-dust">
        projects/{project.slug}/
      </p>

      <div className="mt-3">
        <AskGBrainButton
          projectSlug={project.slug}
          baseUrl={env.GBRAIN_BASE_URL ?? null}
        />
      </div>

      <TopContributors contributors={contributors} slugFor={slugFor} />

      {contributors.length > 0 ? (
        <section className="mt-6">
          <MonoLabel>{s("projects.detail.recognizeContributors")}</MonoLabel>
          <ul className="mt-2 space-y-1">
            {contributors.map((c) => (
              <li key={c.handle} className="flex items-center gap-3">
                <span className="font-voice text-[11px] text-ink">
                  @{slugFor(c.handle)}
                </span>
                <ThankButton
                  recipient={slugFor(c.handle)}
                  itemType="contribution"
                  itemId={`${slug}:${slugFor(c.handle)}`}
                  initialState="not-signed-in"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {rendered.map((sec) => (
        <section key={sec.title} className="mt-8">
          <MonoLabel>{sec.title}</MonoLabel>
          {sec.html ? (
            <SafeHtml
              html={sec.html}
              className="prose-warm mt-2"
            />
          ) : (
            <p className="mt-2 font-voice text-[11px] text-dust">
              No <code className="font-voice text-dust">{sec.title.toLowerCase()}.md</code>.
            </p>
          )}
        </section>
      ))}
    </main>
  );
}
