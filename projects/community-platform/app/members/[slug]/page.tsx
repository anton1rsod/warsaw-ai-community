import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  findMemberByHandle,
  findMemberBySlug,
  getContributions,
  listMembers,
  listEventsFromSnapshot,
} from "@/lib/content-snapshot";
import { computeOverlap, overlapHasContent } from "@/lib/persona-overlap";
import { OverlapLens } from "@/app/components/OverlapLens";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { parsePersona } from "@/lib/persona";
import { parsePersonaSections } from "@/lib/persona-sections";
import { isProductionRuntime } from "@/lib/runtime-env";
import { isE2EMode, mockPersonaStore } from "@/app/actions/_test-persona-store";
import { ActivityLine } from "@/app/components/ActivityLine";
import { CopyHandle } from "@/app/components/CopyHandle";
import { ExpertiseLedger } from "@/app/components/ExpertiseLedger";
import { FirstQuestionQuote } from "@/app/components/FirstQuestionQuote";
import { GdprPanel } from "@/app/components/GdprPanel";
import { MonoLabel } from "@/app/components/MonoLabel";
import { PostureLedger } from "@/app/components/PostureLedger";
import { StorySection } from "@/app/components/StorySection";
import { s } from "@/lib/i18n/strings";
import { filterOrphanSlugs, type EventSlug } from "@/lib/events";
import { ProfileFrontmatterSchema } from "@/lib/profile-editor";
import kudosData from "@/lib/__generated__/kudos.json";

const kudos: Record<string, { total: number }> = kudosData as Record<
  string,
  { total: number }
>;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return listMembers().map((m) => ({ slug: m.slug }));
}

// generateStaticParams precomputes the slug list, but we still call auth()
// inside the page for the self-only GdprPanel — Next.js falls back to dynamic
// rendering when a server component reads the session.
export const dynamic = "force-dynamic";

/** H143: every markdown section renders ONLY through lib/markdown → SafeHtml. */
async function htmlOrNull(md: string | null): Promise<string | null> {
  if (md === null || md.trim() === "") return null;
  return renderMarkdownToHtml(md);
}

/** Decorative initials for the identity tile (the name is adjacent in the h1). */
function initialsFor(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w !== "")
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const member = findMemberBySlug(slug);
  if (!member) notFound();

  const contributions = getContributions(member.githubHandle);
  const session = await auth();
  const isSelf = session?.githubHandle === member.githubHandle;

  // ── Phase 3 (spec §4.2): overlap lens viewer load ───────────────────────
  // H160: computed per-request for THIS viewer only — never persisted,
  // never logged. Gates (all required): session exists · viewer has a
  // persona · viewer is not the subject · overlap has content (checked at
  // the render slot). Subject side reuses the H147-gated parse above.
  const viewerMember = session?.githubHandle
    ? findMemberByHandle(session.githubHandle)
    : undefined;
  // E2E mock-fork parity with the subject persona read above (double-guarded,
  // inert in production).
  const viewerPersonaRaw = viewerMember
    ? ((!isProductionRuntime() && isE2EMode()
        ? mockPersonaStore.get(viewerMember.slug)
        : null) ?? viewerMember.persona)
    : null;
  const viewerPersona = viewerPersonaRaw ? parsePersona(viewerPersonaRaw) : null;

  // H34, H39: safeParse so a malformed profile doesn't crash the page.
  const parsedProfile = ProfileFrontmatterSchema.safeParse(
    member.profile?.data ?? {},
  );
  const fm = parsedProfile.success ? parsedProfile.data : undefined;

  const e2ePersonaRaw =
    !isProductionRuntime() && isE2EMode() ? mockPersonaStore.get(member.slug) : null;
  const personaRaw = e2ePersonaRaw ?? member.persona;
  const parsedPersona = personaRaw ? parsePersona(personaRaw) : null;
  // H147: gate on persona_visible (absent ⇒ visible).
  const personaVisible = fm?.persona_visible !== false;
  const persona = personaVisible ? parsedPersona : null;

  const overlap =
    session && viewerMember && viewerPersona && personaVisible && parsedPersona &&
    viewerMember.slug !== member.slug
      ? computeOverlap(viewerPersona, parsedPersona)
      : null;

  // v0.12 §4.1: sections from the known .public.md heading skeleton; H148 —
  // parsePersonaSections never throws; unknown headings land in `unrecognized`.
  const sections = persona ? parsePersonaSections(persona.body) : null;

  const profileHtml = member.profile?.body
    ? await renderMarkdownToHtml(member.profile.body)
    : null;
  const careerArcHtml = await htmlOrNull(sections?.careerArc ?? null);
  const hardWonHtml = await htmlOrNull(sections?.hardWonKnowledge ?? null);
  // Task 2.3 lock: failure/success patterns live in the Story "Patterns I
  // keep seeing" details row, concatenated after recurringPatterns.
  const patternsMd = sections
    ? [sections.recurringPatterns, sections.failurePatterns, sections.successPatterns]
        .filter((p): p is string => p !== null)
        .join("\n\n")
    : "";
  const patternsHtml = await htmlOrNull(patternsMd === "" ? null : patternsMd);
  const buyerHtml = await htmlOrNull(sections?.buyerContexts ?? null);
  const builderHtml = await htmlOrNull(sections?.builderContexts ?? null);
  const competitorHtml = await htmlOrNull(sections?.competitorContexts ?? null);
  const evidenceHtml = await htmlOrNull(sections?.verifiableEvidence ?? null);
  const unrecognizedHtml = await htmlOrNull(
    sections && sections.unrecognized.trim() !== "" ? sections.unrecognized : null,
  );

  const knownEventSlugs = new Set<EventSlug>(
    listEventsFromSnapshot().map((e) => e.slug),
  );
  const validGoing = fm ? filterOrphanSlugs(fm.events_going, knownEventSlugs) : [];
  const validInterested = fm
    ? filterOrphanSlugs(fm.events_interested, knownEventSlugs)
    : [];

  const kudosTotal = kudos[member.slug]?.total ?? 0;

  // O2: t.me deep-link when the roster carries a Telegram handle; CopyHandle
  // fallback otherwise. Phase 1 parses "TBD"-ish cells to null. Reviewer
  // triage: the handle is pinned to Telegram's username alphabet (5-32 of
  // [A-Za-z0-9_]) so a malformed roster cell can't inject path segments
  // into the t.me URL — it degrades to the CopyHandle fallback instead.
  const telegramHandle =
    member.telegram?.trim().match(/^@?([A-Za-z0-9_]{5,32})$/)?.[1] ?? null;
  const askHref = telegramHandle ? `https://t.me/${telegramHandle}` : null;
  // O5: statement omitted when one_line_bio is missing.
  const statement = sections?.oneLineBio?.trim() ?? "";

  return (
    <main id="main" className="mx-auto max-w-[688px] px-6 py-10">
      <Link
        href="/members"
        className="inline-flex min-h-[24px] items-center py-1 font-voice text-[11px] text-dust underline underline-offset-2"
      >
        {s("members.detail.backLink")}
      </Link>

      {/* identity zone — spec §3: decorative initials tile (aria-hidden; the
          name is adjacent in the h1) on cream-deep with ink-muted (dust is
          only 4.22:1 there — pair-pinned contrast, H156) */}
      <div className="mt-10 flex items-center gap-5">
        <span
          aria-hidden="true"
          className="flex h-[68px] w-[68px] shrink-0 items-center justify-center bg-cream-deep font-voice text-[24px] text-ink-muted"
        >
          {initialsFor(member.name)}
        </span>
        <div>
          <h1 className="font-display text-[30px] font-semibold leading-[1.05] tracking-[-0.025em] text-ink min-[560px]:text-[38px]">
            {member.name}
          </h1>
          <p className="mt-1 font-voice text-[12px] text-dust">
            <a
              href={`https://github.com/${member.githubHandle}`}
              className="inline-flex min-h-[24px] items-center py-1 underline underline-offset-2 hover:text-ink"
            >
              @{member.githubHandle}
            </a>
            {member.telegram ? (
              <>
                <span aria-hidden="true" className="text-hairline-strong">
                  {" · "}
                </span>
                {member.telegram}
              </>
            ) : null}
            {member.focus ? (
              <>
                <span aria-hidden="true" className="text-hairline-strong">
                  {" · "}
                </span>
                {member.focus}
              </>
            ) : null}
            {member.link ? (
              <>
                <span aria-hidden="true" className="text-hairline-strong">
                  {" · "}
                </span>
                <a
                  href={member.link}
                  className="inline-flex min-h-[24px] items-center py-1 underline underline-offset-2 hover:text-ink"
                >
                  {s("members.detail.metaLink")}
                </a>
              </>
            ) : null}
          </p>
        </div>
      </div>

      {/* statement — O5 */}
      {statement !== "" ? (
        <p className="mt-8 font-display text-[19px] font-medium leading-snug tracking-[-0.018em] text-ink-body min-[560px]:text-[22px]">
          {statement}
        </p>
      ) : null}

      {/* quiet actions row */}
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1">
        <a
          href={`/members/${member.slug}/opengraph-image`}
          className="inline-flex min-h-[24px] items-center py-1 font-voice text-[12px] text-ink underline decoration-accent-500 underline-offset-2 hover:text-dust"
        >
          {s("members.detail.viewCard")}
        </a>
        {askHref !== null ? (
          <a
            href={askHref}
            className="inline-flex min-h-[24px] items-center py-1 font-voice text-[12px] text-ink underline decoration-accent-500 underline-offset-2 hover:text-dust"
          >
            {s("members.detail.askAboutFmt").replace("{name}", member.name)}
          </a>
        ) : (
          <CopyHandle handle={member.githubHandle} />
        )}
        {isSelf ? (
          <Link
            href="/me/edit"
            className="inline-flex min-h-[24px] items-center py-1 font-voice text-[12px] text-dust underline underline-offset-2 hover:text-ink"
          >
            {s("members.detail.editProfile")}
          </Link>
        ) : null}
      </div>

      {overlap && overlapHasContent(overlap) ? (
        <OverlapLens overlap={overlap} subjectName={member.name} />
      ) : null}

      {persona ? (
        <>
          <ExpertiseLedger tags={persona.tags} languages={persona.languages} />
          {sections?.firstQuestion ? (
            <FirstQuestionQuote
              question={sections.firstQuestion.trim()}
              askHref={askHref}
            />
          ) : null}
          <PostureLedger
            bullish={sections?.bullish ?? null}
            skeptical={sections?.skeptical ?? null}
            failurePatterns={sections?.failurePatterns ?? null}
            successPatterns={sections?.successPatterns ?? null}
          />
        </>
      ) : (
        // H147/H146: hidden or absent persona — dashed empty state in place
        // of the dossier sections.
        <section className="mt-10 border border-dashed border-ink p-4">
          <MonoLabel>{s("members.detail.personaSection")}</MonoLabel>
          <p className="mt-1 font-voice text-[11px] text-dust">
            {s("members.detail.noPersonaFmt").replace("{slug}", member.slug)}
          </p>
        </section>
      )}

      <StorySection
        careerArcHtml={careerArcHtml}
        hardWonHtml={hardWonHtml}
        patternsHtml={patternsHtml}
        buyerHtml={buyerHtml}
        builderHtml={builderHtml}
        competitorHtml={competitorHtml}
        evidenceHtml={evidenceHtml}
        unrecognizedHtml={unrecognizedHtml}
        profileHtml={profileHtml}
      />

      {isSelf ? (
        <div className="mt-10">
          <GdprPanel />
        </div>
      ) : null}

      <ActivityLine
        contributions={contributions}
        goingSlugs={validGoing}
        interestedSlugs={validInterested}
        kudosTotal={kudosTotal}
      />
    </main>
  );
}
