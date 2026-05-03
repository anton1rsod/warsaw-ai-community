import Link from "next/link";
import { notFound } from "next/navigation";
import { findDecisionBySlug, listDecisionsFromSnapshot } from "@/lib/content-snapshot";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { SafeHtml } from "@/app/components/SafeHtml";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return listDecisionsFromSnapshot().map((d) => ({ slug: d.slug }));
}

export default async function DecisionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const decision = findDecisionBySlug(slug);
  if (!decision) notFound();

  const html = await renderMarkdownToHtml(decision.body);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link href="/decisions" className="text-sm underline">
        ← Decisions
      </Link>
      <article className="mt-4">
        <SafeHtml
          html={html}
          className="prose prose-neutral dark:prose-invert max-w-none"
        />
      </article>
    </main>
  );
}
