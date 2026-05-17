import rostersData from "@/lib/__generated__/event-rosters.json";
import { findMemberBySlug } from "@/lib/content-snapshot";

interface RosterEntry {
  going: { publicSlugs: string[]; hiddenCount: number };
  interested: { publicSlugs: string[]; hiddenCount: number };
}
const rosters: Record<string, RosterEntry> = rostersData as Record<string, RosterEntry>;

interface EventRosterProps {
  eventSlug: string;
}

function MemberAvatar({ slug }: { slug: string }): React.JSX.Element {
  const member = findMemberBySlug(slug);
  const name = member?.name ?? slug;
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <a
      href={`/members/${slug}`}
      title={name}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium dark:bg-neutral-800"
    >
      {initials || slug.slice(0, 2).toUpperCase()}
    </a>
  );
}

function SubRoster({
  label,
  side,
  total,
  publicSlugs,
  hiddenCount,
  eventSlug,
}: {
  label: string;
  side: "going" | "interested";
  total: number;
  publicSlugs: readonly string[];
  hiddenCount: number;
  eventSlug: string;
}): React.JSX.Element {
  const accent = side === "going" ? "border-green-500" : "border-amber-500";
  return (
    <div className={`rounded border-l-4 ${accent} pl-3`}>
      <h3 className="text-sm font-medium">
        {label} ({total} total)
      </h3>
      {total === 0 ? (
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {side === "going"
            ? "No one's marked going yet — be the first."
            : "No one's marked interested yet."}
        </p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {publicSlugs.map((s) => (
            <MemberAvatar key={s} slug={s} />
          ))}
          {hiddenCount > 0 ? (
            <a
              href={`/login?callbackUrl=/events/${eventSlug}`}
              className="flex h-10 items-center rounded-full bg-neutral-100 px-3 text-xs text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              + {hiddenCount} members (sign in to see)
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
}

export async function EventRoster({
  eventSlug,
}: EventRosterProps): Promise<React.JSX.Element> {
  const entry = rosters[eventSlug];
  const goingPublic = entry?.going.publicSlugs ?? [];
  const goingHidden = entry?.going.hiddenCount ?? 0;
  const interestedPublic = entry?.interested.publicSlugs ?? [];
  const interestedHidden = entry?.interested.hiddenCount ?? 0;
  const goingTotal = goingPublic.length + goingHidden;
  const interestedTotal = interestedPublic.length + interestedHidden;

  return (
    <section className="mt-8 space-y-4">
      <SubRoster
        label="Going"
        side="going"
        total={goingTotal}
        publicSlugs={goingPublic}
        hiddenCount={goingHidden}
        eventSlug={eventSlug}
      />
      <SubRoster
        label="Interested"
        side="interested"
        total={interestedTotal}
        publicSlugs={interestedPublic}
        hiddenCount={interestedHidden}
        eventSlug={eventSlug}
      />
    </section>
  );
}
