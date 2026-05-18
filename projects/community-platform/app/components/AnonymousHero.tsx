import Link from "next/link";
import { s } from "@/lib/i18n/strings";
import { DateTime } from "@/app/components/DateTime";

const TELEGRAM_URL = "https://t.me/warsaw_ai";

interface NextEventSummary {
  slug: string;
  title: string;
  date: string;
  startTime?: string;
}

interface AnonymousHeroProps {
  nextEvent: NextEventSummary | null;
}

/**
 * Anonymous `/` hero composition per ADR-0014 + Q1.2 hero lock.
 *
 * Renders the Q-1.1 ambition sentence, sub-line, dual CTA, and next-event
 * ribbon (when an upcoming event exists). The ribbon framing is NEUTRAL
 * only — no scarcity, no countdown, no "spots remaining" (§14B
 * manipulation-resistance audit).
 *
 * H56: this component is rendered ONLY in the anonymous branch of
 * app/page.tsx. The page handler asserts session is null before
 * mounting; no auth-derived state can leak in via props.
 */
export async function AnonymousHero({
  nextEvent,
}: AnonymousHeroProps): Promise<React.JSX.Element> {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="grid gap-8 md:grid-cols-[2fr_1fr] md:items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900 leading-tight">
            {s("landing.headline")}
          </h1>
          <p className="mt-4 text-lg text-neutral-700">{s("landing.subline")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center rounded bg-accent-500 px-5 py-3 text-sm font-semibold text-white hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2"
            >
              {s("landing.signIn")}
            </Link>
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium text-neutral-900 underline"
            >
              {s("landing.telegram")}
            </a>
          </div>
        </div>
        <aside aria-label="Next event">
          {nextEvent ? (
            <div className="rounded border border-neutral-200 p-4">
              <p className="text-sm text-neutral-500">
                {s("landing.nextEvent.label")}
              </p>
              <p className="mt-1 text-neutral-900 font-medium">
                <DateTime
                  iso={nextEvent.date}
                  context="list"
                  startTime={nextEvent.startTime}
                />{" "}
                — {nextEvent.title}
              </p>
              <Link
                href={`/events/${nextEvent.slug}` as never}
                className="mt-3 inline-block text-sm text-accent-700 underline"
              >
                {s("landing.nextEvent.cta")}
              </Link>
            </div>
          ) : (
            <p className="text-sm text-neutral-600">
              {s("landing.nextEvent.empty")}
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
