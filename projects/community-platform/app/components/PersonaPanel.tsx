import { SafeHtml } from "@/app/components/SafeHtml";

export function PersonaPanel({
  html,
  slug,
}: {
  html: string | null;
  slug: string;
}): React.JSX.Element {
  if (!html) {
    return (
      <section className="rounded border p-4">
        <h3 className="text-lg font-medium">Persona</h3>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          No persona yet for <code>{slug}</code>. See the persona-builder process.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded border p-4">
      <h3 className="text-lg font-medium">Persona</h3>
      <SafeHtml html={html} className="prose prose-neutral dark:prose-invert mt-2 max-w-none" />
    </section>
  );
}
