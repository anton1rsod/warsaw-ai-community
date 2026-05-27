import { s } from "@/lib/i18n/strings";
import { FormalEntityMasthead } from "@/app/components/FormalEntityMasthead";
import { MonoLabel } from "@/app/components/MonoLabel";

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
    <>
      <FormalEntityMasthead />
      <main id="main" className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink mb-8">
          {s("handbook.title")}
        </h1>

        <section className="mb-10">
          <MonoLabel>{s("handbook.charter")}</MonoLabel>
          <p className="mt-2 font-voice text-[11px]">
            <a
              href={CHARTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline underline-offset-2 hover:text-dust"
            >
              {s("handbook.charterCta")}
            </a>
          </p>
        </section>

        <section className="mb-10">
          <MonoLabel>{s("handbook.roadmap")}</MonoLabel>
          <p className="mt-2 font-voice text-[11px]">
            <a
              href={PROJECTS_MD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline underline-offset-2 hover:text-dust"
            >
              {s("handbook.roadmapCta")}
            </a>
          </p>
        </section>

        <section className="mb-10">
          <MonoLabel>{s("handbook.decisions")}</MonoLabel>
          <p className="mt-2 font-voice text-[11px]">
            <a
              href={DECISIONS_TREE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline underline-offset-2 hover:text-dust"
            >
              {s("handbook.decisionsCta")}
            </a>
          </p>
        </section>

        <section>
          <ul className="font-voice text-[11px] text-dust space-y-2">
            <li>{s("handbook.placeholders.skills")}</li>
            <li>{s("handbook.placeholders.academy")}</li>
            <li>{s("handbook.placeholders.gbrain")}</li>
          </ul>
        </section>
      </main>
    </>
  );
}
