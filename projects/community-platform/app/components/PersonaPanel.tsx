import { SafeHtml } from "@/app/components/SafeHtml";
import { MonoLabel } from "@/app/components/MonoLabel";

export function PersonaPanel({
  html,
  slug,
}: {
  html: string | null;
  slug: string;
}): React.JSX.Element {
  if (!html) {
    return (
      <section className="border border-dashed border-ink p-4">
        <MonoLabel>Persona</MonoLabel>
        <p className="mt-1 font-voice text-[11px] text-dust">
          No persona yet for <code className="font-voice text-dust">{slug}</code>. See the persona-builder process.
        </p>
      </section>
    );
  }

  return (
    <section className="border-[1.5px] border-ink bg-paper p-4">
      <MonoLabel>Persona</MonoLabel>
      <SafeHtml html={html} className="prose-warm mt-2" />
    </section>
  );
}
