import type { Route } from "next";
import { AmberTag } from "@/app/components/AmberTag";
import { MonoLabel } from "@/app/components/MonoLabel";
import { Pill } from "@/app/components/Pill";
import { s } from "@/lib/i18n/strings";

const TELEGRAM_URL = "https://t.me/warsaw_ai";

interface NextEventSummary {
  slug: string;
  title: string;
  date: string;
  startTime?: string;
  location?: string;
  host?: string;
}

interface AnonymousHeroProps {
  nextEvent: NextEventSummary | null;
  timeUntil?: string;
}

/**
 * Anonymous `/` hero — v0.6 visual redesign (chat-35 Phase 3.1).
 *
 * Composes the Phase 1 primitives (MonoLabel, AmberTag, Pill) per spec §16:
 * mono pre-header, Fraunces italic Q1.2 ambition sentence with amber-tag
 * accent on "public.", subtagline, optional "tonight" next-event card, dual
 * CTA row (sign-in + telegram).
 *
 * The next-event card framing is NEUTRAL only — no scarcity, no countdown
 * urgency, no "spots remaining" (§14B manipulation-resistance audit). Past
 * events collapse to "now" upstream in `formatTimeUntil`, never to a
 * negative duration.
 *
 * H56: this component is rendered ONLY in the anonymous branch of
 * app/page.tsx — page handler asserts no signed-in member before mounting,
 * so no auth-derived state can leak in via props. The component MUST NOT
 * import `@/lib/auth` (h-v0-4.test.tsx asserts this at the source level).
 */
export function AnonymousHero({
  nextEvent,
  timeUntil,
}: AnonymousHeroProps): React.JSX.Element {
  const monoLabel =
    nextEvent && timeUntil
      ? s("hero.anon.nextEventMonoFmt").replace("{timeUntil}", timeUntil)
      : s("hero.anon.noNextEventMono");

  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto max-w-3xl px-6 py-10"
    >
      <MonoLabel>{monoLabel}</MonoLabel>
      <h1
        id="hero-title"
        className="font-display italic font-black text-[40px] leading-[0.95] text-ink mt-3 tracking-tight"
      >
        {s("hero.anon.taglineLead")} {s("hero.anon.taglineInfix")}{" "}
        <AmberTag>{s("hero.anon.taglineHighlight")}</AmberTag>
      </h1>
      <p className="font-body italic text-[14px] text-ink mt-4 max-w-md">
        {s("hero.anon.subtagline")}
      </p>

      {nextEvent ? (
        <div className="mt-6 bg-paper border-[1.5px] border-ink p-4">
          <MonoLabel>{s("hero.anon.tonightLabel")}</MonoLabel>
          <div className="font-display italic font-bold text-[18px] text-ink mt-1 leading-tight">
            {nextEvent.title}
          </div>
          <div className="font-voice text-[10px] text-ink mt-2">
            {[
              nextEvent.startTime,
              nextEvent.location,
              nextEvent.host ? `@${nextEvent.host}` : undefined,
            ]
              .filter((seg): seg is string => Boolean(seg))
              .join(" · ")}
          </div>
          <div className="mt-3 flex gap-2">
            <Pill variant="solid" href={`/events/${nextEvent.slug}` as Route}>
              {s("landing.nextEvent.cta")}
            </Pill>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex gap-2 flex-wrap">
        <Pill variant="going" href={"/login" as Route}>
          {s("hero.anon.signInCta")}
        </Pill>
        <Pill variant="dashed" href={TELEGRAM_URL} external>
          {s("hero.anon.telegramCta")}
        </Pill>
      </div>
    </section>
  );
}
