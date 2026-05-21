import React from "react";
import { AmberTag } from "@/app/components/AmberTag";
import { MonoLabel } from "@/app/components/MonoLabel";
import { EventCard } from "@/app/components/EventCard";
import { s } from "@/lib/i18n/strings";

/**
 * v0.6 Phase 3.2 — signed-in `/home` "Your week" dashboard pane rewrite.
 *
 * Composes the v0.6 primitives (AmberTag, MonoLabel, EventCard) on top of the
 * v0.4.1 data layer (computeYourWeek → {nextRsvp, kudosWeekCount}). The
 * "Tonight," vs "This week," branch is driven by an injected `now` prop so
 * the runtime clock can't smuggle non-determinism into tests.
 *
 * §14.6 manipulation-resistance: passive surface. NO streak counter, NO
 * notifications, NO "you missed 2 weeks" guilt. Counts what HAPPENED;
 * never pressures what SHOULD. Forward-defense test asserts the DOM
 * contains no /streak|missed|don't break the chain/ copy.
 */
interface NextRsvp {
  slug: string;
  title: string;
  date: string;
  startTime?: string;
  location?: string;
}

interface YourWeekPaneProps {
  firstName: string;
  nextRsvp: NextRsvp | null;
  timeUntil?: string;
  kudosWeekCount: number;
  /** Injectable clock for deterministic tests; defaults to `new Date()`. */
  now?: Date;
}

function isSameDayISO(dateISO: string, now: Date): boolean {
  const parts = dateISO.split("-");
  const y = parseInt(parts[0] ?? "0", 10);
  const mo = parseInt(parts[1] ?? "1", 10);
  const d = parseInt(parts[2] ?? "1", 10);
  return (
    now.getFullYear() === y &&
    now.getMonth() === mo - 1 &&
    now.getDate() === d
  );
}

/** Last up-to-3 words of a title, suffixed with "." for the amber tag. */
function tailWords(title: string): string {
  const words = title.trim().split(/\s+/);
  return words.slice(-3).join(" ") + ".";
}

export function YourWeekPane({
  firstName,
  nextRsvp,
  timeUntil,
  kudosWeekCount: _kudosWeekCount,
  now = new Date(),
}: YourWeekPaneProps): React.JSX.Element {
  const isToday = nextRsvp ? isSameDayISO(nextRsvp.date, now) : false;
  const lead = isToday
    ? s("hero.home.tonightLead")
    : s("hero.home.tonightFallbackLead");
  const weekLabel = timeUntil
    ? s("hero.home.weekLabelWithEventFmt").replace("{timeUntil}", timeUntil)
    : s("hero.home.weekLabel");

  return (
    <section
      aria-labelledby="your-week"
      className="px-6 py-10 max-w-3xl mx-auto"
    >
      <MonoLabel>{weekLabel}</MonoLabel>
      <h1
        id="your-week"
        className="font-display italic font-black text-[40px] leading-[0.95] text-ink mt-3 tracking-tight"
      >
        {lead} {firstName}—
        {nextRsvp && (
          <>
            <br />
            <AmberTag>{tailWords(nextRsvp.title)}</AmberTag>
          </>
        )}
      </h1>

      {nextRsvp ? (
        <div className="mt-6">
          <EventCard
            slug={nextRsvp.slug}
            title={nextRsvp.title}
            date={nextRsvp.date}
            startTime={nextRsvp.startTime}
            location={nextRsvp.location}
            goingCount={0}
            showRsvpStateChip="going"
            hoverLift={false}
          />
        </div>
      ) : (
        <div className="mt-6 bg-paper border-[1.5px] border-ink p-4">
          <MonoLabel>{s("hero.home.weekLabel")}</MonoLabel>
          <p className="font-display italic text-ink mt-2 text-[14px]">
            {s("empty.home.nextEvent")}
          </p>
        </div>
      )}
    </section>
  );
}
