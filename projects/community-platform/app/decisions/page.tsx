import { listDecisionsFromSnapshot } from "@/lib/content-snapshot";
import { s } from "@/lib/i18n/strings";
import { MonoLabel } from "@/app/components/MonoLabel";
import { ListItem } from "@/app/components/ListItem";
import { EmptyState } from "@/app/components/EmptyState";
import { Tag } from "@/app/components/Tag";

export default function DecisionsPage(): React.JSX.Element {
  const decisions = listDecisionsFromSnapshot();
  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-10">
      <MonoLabel>{s("decisions.kicker")}</MonoLabel>
      <h1 className="mt-2 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
        {s("decisions.title")}
      </h1>

      <section aria-labelledby="decisions-heading" className="mt-8">
        <MonoLabel>{s("decisions.sectionLabel")}</MonoLabel>
        <h2 id="decisions-heading" className="sr-only">
          All records
        </h2>
        {decisions.length === 0 ? (
          <EmptyState
            headline={s("empty.decisions.headline")}
            calibration={s("empty.decisions.calibration")}
          />
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {decisions.map((d) => (
              <li key={d.slug}>
                <ListItem
                  href={`/decisions/${d.slug}`}
                  title={d.title}
                  meta={d.date}
                  trailing={
                    d.status ? (
                      <Tag
                        label={d.status}
                        variant="status"
                        value={d.status}
                      />
                    ) : undefined
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
