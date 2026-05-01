import Link from "next/link";
import { notFound } from "next/navigation";
import { findProjectBySlug, listProjectDetails } from "@/lib/content-snapshot";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { SafeHtml } from "@/app/components/SafeHtml";

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

  const sections: { title: string; body: string | null }[] = [
    { title: "README", body: project.readme },
    { title: "Spec", body: project.spec },
    { title: "Plan", body: project.plan },
    { title: "Changelog", body: project.changelog },
  ];

  const rendered: RenderedSection[] = await Promise.all(
    sections.map(async (s) => ({
      title: s.title,
      html: s.body ? await renderMarkdownToHtml(s.body) : null,
    })),
  );

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/projects" className="text-sm underline">
        ← Projects
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{project.title}</h1>
      <p className="mt-1 font-mono text-sm text-neutral-600 dark:text-neutral-400">
        projects/{project.slug}/
      </p>

      {rendered.map((s) => (
        <section key={s.title} className="mt-8">
          <h2 className="text-xl font-medium">{s.title}</h2>
          {s.html ? (
            <SafeHtml
              html={s.html}
              className="prose prose-neutral dark:prose-invert mt-2 max-w-none"
            />
          ) : (
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              No <code>{s.title.toLowerCase()}.md</code>.
            </p>
          )}
        </section>
      ))}
    </main>
  );
}
