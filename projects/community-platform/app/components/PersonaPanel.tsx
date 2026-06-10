import { SafeHtml } from "@/app/components/SafeHtml";
import { MonoLabel } from "@/app/components/MonoLabel";
import { Tag } from "@/app/components/Tag";
import { s } from "@/lib/i18n/strings";
import type { ParsedPersona, PersonaTag } from "@/lib/persona";

const DEPTH_ORDER: Record<string, number> = { expert: 0, practitioner: 1, familiar: 2 };

function sortByDepth(tags: PersonaTag[]): PersonaTag[] {
  return [...tags].sort(
    (a, b) => (DEPTH_ORDER[a.depth ?? "z"] ?? 9) - (DEPTH_ORDER[b.depth ?? "z"] ?? 9),
  );
}

function ChipRow({ label, tags }: { label: string; tags: PersonaTag[] }): React.JSX.Element | null {
  if (tags.length === 0) return null;
  return (
    <div className="mt-3">
      <MonoLabel>{label}</MonoLabel>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {sortByDepth(tags).map((t) => (
          <Tag
            key={t.label}
            label={t.depth ? `${t.label} · ${t.depth}` : t.label}
            value={t.depth ?? undefined}
          />
        ))}
      </div>
    </div>
  );
}

export function PersonaPanel({
  persona,
  bodyHtml,
  slug,
}: {
  persona: ParsedPersona | null;
  bodyHtml: string | null;
  slug: string;
}): React.JSX.Element {
  if (!persona && !bodyHtml) {
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
      {persona ? (
        <>
          {persona.languages.length > 0 ? (
            <p className="mt-2 font-voice text-[11px] text-dust">
              {s("members.detail.personaLanguages")}: {persona.languages.join(", ")}
            </p>
          ) : null}
          <ChipRow label={s("members.detail.personaIndustries")} tags={persona.tags.industries} />
          <ChipRow label={s("members.detail.personaRoles")} tags={persona.tags.functionalRoles} />
          <ChipRow label={s("members.detail.personaStages")} tags={persona.tags.companyStages} />
          {persona.tags.niche.length > 0 ? (
            <div className="mt-3">
              <MonoLabel>{s("members.detail.personaNiche")}</MonoLabel>
              <ul className="mt-1 list-disc pl-5 font-body text-sm text-ink">
                {persona.tags.niche.map((n) => <li key={n}>{n}</li>)}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}
      {bodyHtml ? <SafeHtml html={bodyHtml} className="prose-warm mt-4" /> : null}
    </section>
  );
}
