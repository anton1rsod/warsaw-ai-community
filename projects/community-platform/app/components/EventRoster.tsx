import rostersData from "@/lib/__generated__/event-rosters.json";
import { findMemberBySlug } from "@/lib/content-snapshot";
import { auth } from "@/lib/auth";
import { MonoLabel } from "@/app/components/MonoLabel";
import { Avatar } from "@/app/components/Avatar";
import { s } from "@/lib/i18n/strings";

interface RosterEntry {
  going: { publicSlugs: string[]; hiddenCount: number };
  interested: { publicSlugs: string[]; hiddenCount: number };
}
const rosters: Record<string, RosterEntry> = rostersData as Record<
  string,
  RosterEntry
>;

interface EventRosterProps {
  eventSlug: string;
}

function MemberTile({ slug }: { slug: string }): React.JSX.Element {
  const member = findMemberBySlug(slug);
  const name = member?.name ?? slug;
  const handle = member?.githubHandle ?? slug;
  return (
    <a href={`/members/${slug}`} title={name} className="inline-block">
      <Avatar name={name} handle={handle} size={40} decorative />
    </a>
  );
}

function HiddenChip({
  hiddenCount,
  eventSlug,
}: {
  hiddenCount: number;
  eventSlug: string;
}): React.JSX.Element {
  // H85 chip: "+ N members (sign in to see)" — only renders when caller decides
  // (anonymous viewer with hiddenCount > 0). The chip's purpose is the sign-up
  // CTA; meaningless for signed-in viewers.
  return (
    <a
      href={`/login?callbackUrl=/events/${eventSlug}`}
      className="font-voice text-[10px] uppercase tracking-[1.5px] text-dust inline-flex items-center rounded-full bg-cream px-3 py-1 hover:text-ink"
    >
      + {hiddenCount} members (sign in to see)
    </a>
  );
}

export async function EventRoster({
  eventSlug,
}: EventRosterProps): Promise<React.JSX.Element> {
  // v0.5.1 H82: read viewer state at request time. Page parent (/events/[slug])
  // is force-dynamic per v0.4.8 / chat-30, so this auth() runs per-request and
  // matches the request cookie.
  const session = await auth();
  const viewerIsSignedIn = session?.githubHandle != null;

  const entry = rosters[eventSlug];
  const goingPublic = entry?.going.publicSlugs ?? [];
  const goingHidden = entry?.going.hiddenCount ?? 0;
  const interestedPublic = entry?.interested.publicSlugs ?? [];
  const interestedHidden = entry?.interested.hiddenCount ?? 0;
  const goingTotal = goingPublic.length + goingHidden;
  const interestedTotal = interestedPublic.length + interestedHidden;

  // Going label: always shows count (no anon gating per spec §16.4).
  const goingLabel = s("events.detail.goingRosterFmt").replace(
    "{count}",
    String(goingTotal),
  );
  // Interested label: signed-in sees count; anonymous sees "(sign in to see)" (H82).
  const interestedLabel = viewerIsSignedIn
    ? s("events.detail.interestedRosterFmt").replace(
        "{count}",
        String(interestedTotal),
      )
    : s("events.detail.interestedAnonLabel");

  return (
    <section
      aria-labelledby={`${eventSlug}-roster`}
      className="mt-8 grid grid-cols-2 gap-6 text-[11px]"
    >
      <h2 id={`${eventSlug}-roster`} className="sr-only">
        Roster
      </h2>
      <div>
        <MonoLabel>{goingLabel}</MonoLabel>
        {goingTotal === 0 ? (
          <p className="font-display italic text-dust mt-2">
            {s("empty.eventDetail.going")}
          </p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1">
            {goingPublic.map((slug) => (
              <MemberTile key={slug} slug={slug} />
            ))}
            {/* H85 chip: anonymous viewer + hiddenCount > 0 → sign-in CTA */}
            {goingHidden > 0 && !viewerIsSignedIn ? (
              <HiddenChip
                hiddenCount={goingHidden}
                eventSlug={eventSlug}
              />
            ) : null}
          </div>
        )}
      </div>
      <div>
        <MonoLabel>{interestedLabel}</MonoLabel>
        {/* Interested list: signed-in viewer sees roster; anonymous sees nothing
            (label already says "(sign in to see)"). Empty state only renders for
            signed-in viewer with count 0. */}
        {viewerIsSignedIn ? (
          interestedTotal === 0 ? (
            <p className="font-display italic text-dust mt-2">
              {s("empty.eventDetail.interested")}
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1">
              {interestedPublic.map((slug) => (
                <MemberTile key={slug} slug={slug} />
              ))}
            </div>
          )
        ) : null}
      </div>
    </section>
  );
}
