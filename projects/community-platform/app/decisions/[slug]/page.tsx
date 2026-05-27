import Link from "next/link";
import { notFound } from "next/navigation";
import { findDecisionBySlug, listDecisionsFromSnapshot } from "@/lib/content-snapshot";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { SafeHtml } from "@/app/components/SafeHtml";
import { MonoLabel } from "@/app/components/MonoLabel";
import { Tag } from "@/app/components/Tag";
import { s } from "@/lib/i18n/strings";

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

  const adrNum = String(decision.number).padStart(4, "0");
  const kicker = `ADR-${adrNum}`;

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/decisions" className="font-voice text-[11px] text-dust underline underline-offset-2">
        {s("decisions.detail.backLink")}
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <MonoLabel as="span">{kicker}</MonoLabel>
        {decision.status ? (
          <Tag label={decision.status} variant="status" value={decision.status.toLowerCase()} />
        ) : null}
      </div>
      <h1 className="mt-2 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
        {decision.title}
      </h1>
      {decision.date ? (
        <p className="mt-2 font-voice text-[11px] text-dust">{decision.date}</p>
      ) : null}
      <article className="prose-warm mt-8 bg-paper border-[1.5px] border-ink p-5">
        <SafeHtml html={html} />
      </article>
    </main>
  );
}
