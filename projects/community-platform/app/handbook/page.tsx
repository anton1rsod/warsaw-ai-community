import { s } from "@/lib/i18n/strings";

/**
 * /handbook — Q2.3 / D29 / Q6.1 (i) / O4.
 *
 * Community-wide governance pointers. NO ADR markdown content surfaced
 * via this page (Q6.1 (i) lock preserves Anton's "hide all possible PII"
 * stance until v0.5+ PII audit). Decisions section is a GitHub external
 * link only.
 *
 * O4 lock: Roadmap pointer = monorepo PROJECTS.md (existing portfolio
 * source). A separate community/roadmap.md is NOT created in v0.4.
 *
 * Renders as SSG (no auth() read). Wrapped in global shell via
 * app/layout.tsx (Phase A.2.5).
 */
const CHARTER_URL = "https://github.com/anton1rsod/warsaw-ai-community/blob/main/community/charter/charter.md";
const PROJECTS_MD_URL = "https://github.com/anton1rsod/warsaw-ai-community/blob/main/PROJECTS.md";
const DECISIONS_TREE_URL = "https://github.com/anton1rsod/warsaw-ai-community/tree/main/docs/decisions";

export default async function HandbookPage(): Promise<React.JSX.Element> {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold mb-8">{s("handbook.title")}</h1>

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wider text-neutral-500 mb-3">
          {s("handbook.charter")}
        </h2>
        <p className="text-sm text-neutral-700">
          <a
            href={CHARTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-700 underline"
          >
            {s("handbook.charterCta")}
          </a>
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wider text-neutral-500 mb-3">
          {s("handbook.roadmap")}
        </h2>
        <p className="text-sm text-neutral-700">
          <a
            href={PROJECTS_MD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-700 underline"
          >
            {s("handbook.roadmapCta")}
          </a>
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wider text-neutral-500 mb-3">
          {s("handbook.decisions")}
        </h2>
        <p className="text-sm text-neutral-700">
          <a
            href={DECISIONS_TREE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-700 underline"
          >
            {s("handbook.decisionsCta")}
          </a>
        </p>
      </section>

      <section>
        <ul className="text-sm text-neutral-600 space-y-2">
          <li>{s("handbook.placeholders.skills")}</li>
          <li>{s("handbook.placeholders.academy")}</li>
          <li>{s("handbook.placeholders.gbrain")}</li>
        </ul>
      </section>
    </main>
  );
}
