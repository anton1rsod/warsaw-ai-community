import { SafeHtml } from "@/app/components/SafeHtml";
import { MonoLabel } from "@/app/components/MonoLabel";
import { s } from "@/lib/i18n/strings";

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
        <MonoLabel>{s("members.detail.personaSection")}</MonoLabel>
        <p className="mt-1 font-voice text-[11px] text-dust">
          {s("members.detail.noPersonaFmt").replace("{slug}", slug)}
        </p>
      </section>
    );
  }

  return (
    <section className="border-[1.5px] border-ink bg-paper p-4">
      <MonoLabel>{s("members.detail.personaSection")}</MonoLabel>
      <SafeHtml html={html} className="prose-warm mt-2" />
    </section>
  );
}
