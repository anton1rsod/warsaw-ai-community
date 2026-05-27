import { listProjectDetails } from "@/lib/content-snapshot";
import { s } from "@/lib/i18n/strings";
import { MonoLabel } from "@/app/components/MonoLabel";
import { ListItem } from "@/app/components/ListItem";
import { EmptyState } from "@/app/components/EmptyState";

export default function ProjectsPage(): React.JSX.Element {
  const projects = listProjectDetails();
  return (
    <main id="main" className="mx-auto max-w-3xl px-6 py-10">
      <MonoLabel>{s("projects.index.kicker")}</MonoLabel>
      <h1 className="mt-2 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
        {s("projects.index.title")}
      </h1>

      <section aria-labelledby="projects-heading" className="mt-8">
        <MonoLabel>{s("projects.index.sectionLabel")}</MonoLabel>
        <h2 id="projects-heading" className="sr-only">
          Active
        </h2>
        {projects.length === 0 ? (
          <EmptyState headline={s("empty.projects.headline")} />
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {projects.map((p) => (
              <li key={p.slug}>
                <ListItem
                  href={`/projects/${p.slug}`}
                  title={p.title}
                  subtitle={p.slug}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
