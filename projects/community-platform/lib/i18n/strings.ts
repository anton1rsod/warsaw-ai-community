/**
 * v0.4 Phase A — single source of UI text (H67).
 *
 * Flat keys with surface prefix (O10 lock — chat-24 plan):
 *   "<surface>.<element>[.<modifier>]"
 *
 * Consumed via `s(key)` helper. `StringKey` is the compile-time type union
 * of every key in the map — call sites are checked at typecheck time so a
 * typo never reaches runtime.
 *
 * v0.5+ migration: next-intl will consume an ICU MessageFormat JSON
 * dictionary; this flat-key TypeScript export projects cleanly into JSON
 * by reading the dot-separated key as a nested path.
 *
 * Anti-pattern (forward-defense): NO interpolation, NO formatting at this
 * layer. If a Phase A component needs to inject a number / name / date,
 * compose the string in the component (e.g., template literals on top of
 * static fragments). i18n composition is a v0.5+ next-intl concern.
 */
export const strings = {
  // ─── header.* (chrome) ──────────────────────────────────────────────────
  "header.signIn": "Sign in",
  "header.skipToContent": "Skip to content",
  "header.menu": "Menu",
  "header.menuClose": "Close menu",
  "header.userMenu": "Account",
  "header.yourWeek": "Your week",
  "header.editProfile": "Edit profile",
  "header.signOut": "Sign out",

  // ─── footer.* (chrome) ──────────────────────────────────────────────────
  "footer.copyright": "© 2026 Warsaw AI Community",
  "footer.about": "About",
  "footer.telegram": "Telegram",
  "footer.rss": "RSS",
  "footer.github": "GitHub",
  "footer.mit": "MIT-licensed",

  // ─── nav.* (top-nav labels) ─────────────────────────────────────────────
  "nav.home": "Home",
  "nav.calendar": "Calendar",
  "nav.projects": "Projects",
  "nav.members": "Members",
  "nav.handbook": "Handbook",

  // ─── home.* (/home route) ───────────────────────────────────────────────
  "home.thisWeek.heading": "This Week",
  "home.recent.heading": "Recent",
  "home.yourWeek.heading": "Your week",
  "home.yourWeek.nextRsvp": "Next event you RSVPed:",
  "home.yourWeek.statusCta": "Post your weekly status →",
  "home.yourWeek.kudosWeek": "Kudos this week",
  "home.yourWeek.empty":
    "No commitments this week — check the calendar for upcoming events.",

  // ─── landing.* (/ hero) ─────────────────────────────────────────────────
  "landing.headline":
    "Where Warsaw's AI builders learn, ship, and find each other.",
  "landing.subline":
    "Member-led. Meets weekly in Warsaw. Free. Open-source platform.",
  "landing.signIn": "Sign in with GitHub",
  "landing.telegram": "Join Telegram →",
  "landing.nextEvent.label": "Next:",
  "landing.nextEvent.cta": "RSVP →",
  "landing.nextEvent.empty":
    "No upcoming events — next weekly sync is Wednesday at 18:30.",

  // ─── calendar.* (/calendar route) ───────────────────────────────────────
  "calendar.title": "Calendar",
  "calendar.filter.all": "All",
  "calendar.filter.events": "Events",
  "calendar.filter.meetings": "Meetings",
  "calendar.upcoming": "Upcoming",
  "calendar.subscribe": "Subscribe to calendar",

  // ─── handbook.* (/handbook route) ───────────────────────────────────────
  "handbook.title": "Handbook",
  "handbook.charter": "Charter",
  "handbook.charterCta": "Read the charter ↗",
  "handbook.roadmap": "Roadmap",
  "handbook.roadmapCta": "Active and planned sub-projects ↗",
  "handbook.decisions": "Decisions",
  "handbook.decisionsCta":
    "Decisions live in our public git repo at github.com/anton1rsod/warsaw-ai-community/tree/main/docs/decisions ↗",
  "handbook.placeholders.skills": "Skills (TBD placement)",
  "handbook.placeholders.academy": "Academy (TBD placement)",
  "handbook.placeholders.gbrain": "GBrain Q&A (TBD placement)",

  // ─── empty.* (<EmptyState> defaults) ────────────────────────────────────
  "empty.calendar.headline": "No upcoming events.",
  "empty.calendar.calibration":
    "The next weekly sync is Wednesday at 18:30; standalone events appear here as they get scheduled.",
  "empty.events.headline": "No upcoming events.",
  "empty.events.calibration":
    "The next weekly sync is Wed 18:30; standalone events appear here as they get scheduled. Propose an event ↗",
  "empty.meetings.headline": "No meetings yet.",
  "empty.meetings.calibration":
    "The next sync will appear here once the first meeting note lands.",
  "empty.decisions.headline": "No decisions yet.",
  "empty.decisions.calibration":
    "ADRs land in docs/decisions/ as they get written.",
  "empty.projects.headline":
    "Member projects appear here as they get added.",

  // ─── avatar.* (<Avatar> a11y) ───────────────────────────────────────────
  "avatar.altSuffix": "'s avatar",

  // ─── datetime.* (<DateTime>) ────────────────────────────────────────────
  "datetime.today": "Today",
  "datetime.tomorrow": "Tomorrow",
  "datetime.yesterday": "Yesterday",
  "datetime.daysAgo": "d ago",

  // ─── auth.* (shared) ────────────────────────────────────────────────────
  "auth.signInWithGitHub": "Sign in with GitHub",

  // ─── events.list.* (v0.5.1; /events route surfaces) ────────────────────
  "events.list.newEventButton": "+ New event",

  // ─── event.create.* (v0.5; /admin/events/new route + form) ─────────────
  "event.create.heading": "New event",
  "event.create.intro":
    "Commit a new event to the community calendar. Subscribers see updates within 5 minutes.",
  "event.create.field.title": "Title",
  "event.create.field.date": "Date",
  "event.create.field.startTime": "Start time",
  "event.create.field.duration": "Duration (min)",
  "event.create.field.location": "Location",
  "event.create.field.host": "Host (GitHub handle)",
  "event.create.field.url": "URL (optional)",
  "event.create.field.slug": "Slug",
  "event.create.field.body": "Body (markdown)",
  "event.create.slug.hint": "Leave blank to auto-derive from title + date.",
  "event.create.preview.show": "Preview",
  "event.create.preview.hide": "Hide preview",
  "event.create.preview.loading": "Loading…",
  "event.create.preview.failed": "Preview failed.",
  "event.create.submit.idle": "Create event",
  "event.create.submit.pending": "Creating…",
  "event.create.error.notAuthorized":
    "You are not authorized to create events.",
  "event.create.error.invalidInput":
    "Some fields look invalid. Check the form and try again.",
  "event.create.error.invalidSlug":
    "That slug isn't a valid YYYY-MM-DD-kebab form.",
  "event.create.error.slugExists": "An event with that slug already exists.",
  "event.create.error.internalError": "Something went wrong. Try again.",
  "event.create.error.unknown": "Unknown error.",
  "event.create.error.requestFailed": "Request failed. Try again.",

  // ═══════════════════════════════════════════════════════════════════════
  // v0.6 visual redesign — Phase 1.5 (H88; chat-35).
  // Surface-prefixed namespaces: hero.*, events.*, empty.*, chrome.*.
  // ═══════════════════════════════════════════════════════════════════════

  // ─── hero.anon.* (anon landing hero copy) ───────────────────────────────
  "hero.anon.taglineLead": "Warsaw AI",
  "hero.anon.taglineHighlight": "public.",
  "hero.anon.taglineInfix": "ships in",
  "hero.anon.subtagline":
    "Where Warsaw's AI builders learn, ship, and find each other.",
  "hero.anon.signInCta": "sign in with github",
  "hero.anon.telegramCta": "join telegram",
  "hero.anon.nextEventMonoFmt": "// next meetup · {timeUntil}",
  "hero.anon.noNextEventMono": "// no meetup scheduled",
  "hero.anon.tonightLabel": "// tonight",

  // ─── hero.home.* (signed-in /home hero copy) ────────────────────────────
  "hero.home.weekLabel": "// your week",
  "hero.home.weekLabelWithEventFmt": "// your week · meetup {timeUntil}",
  "hero.home.tonightLead": "Tonight,",
  "hero.home.tonightFallbackLead": "This week,",
  "hero.home.shipsLabelFmt": "// this week · {count} ships",
  "hero.home.shipsLabelNone": "// no recent ships",
  "hero.home.shipsEmpty": "Next ship lands when somebody commits.",

  // ─── events.index.* (/events route chrome) ──────────────────────────────
  "events.index.title": "Events.",
  "events.index.upcomingLabel": "// upcoming",
  "events.index.pastLabel": "// past",
  "events.index.eventsLabelFmt": "// events · {count} upcoming",
  "events.index.newEvent": "+ new event",
  "events.index.subscribeIcs": "subscribe (ICS)",

  // ─── events.detail.* (/events/[slug] route chrome) ──────────────────────
  "events.detail.monoLeadFmt": "// meetup № {num} · {date} · {time} sharp",
  "events.detail.goingRosterFmt": "// going ({count})",
  "events.detail.interestedRosterFmt": "// interested ({count})",
  "events.detail.tonightSuffix": "tonight.",
  "events.detail.todaySuffix": "today.",
  "events.detail.thisWeekSuffix": "this week.",

  // ─── empty.* (v0.6 evergreen empty-state copy) ──────────────────────────
  "empty.home.nextEvent": "Next meetup lands soon. Watch this strip.",
  "empty.home.ships": "Next ship lands when somebody commits.",
  "empty.events.upcoming":
    "No upcoming meetup scheduled — Telegram has the next signal.",
  "empty.events.past": "No past events yet.",
  "empty.eventDetail.going": "Be the first to RSVP.",
  "empty.eventDetail.interested": "No one's marked interested yet.",

  // ─── chrome.header.* (v0.6 header chrome) ───────────────────────────────
  "chrome.header.logo": "warsaw.ai",
  "chrome.header.signIn": "[ sign in ]",
  "chrome.header.nav.home": "home",
  "chrome.header.nav.calendar": "calendar",
  "chrome.header.nav.members": "members",
  "chrome.header.nav.projects": "projects",
  "chrome.header.nav.handbook": "handbook",
  "chrome.header.dropdown.yourWeek": "your week",
  "chrome.header.dropdown.editProfile": "edit profile",
  "chrome.header.dropdown.signOut": "sign out",

  // ─── chrome.footer.* (v0.6 footer chrome) ───────────────────────────────
  "chrome.footer.copyrightFmt": "© {year} Warsaw AI Community",
  "chrome.footer.builtInPublic": "built in public, MIT",
  "chrome.footer.about": "about",
  "chrome.footer.telegram": "telegram",
  "chrome.footer.github": "github",
  "chrome.footer.license": "license",
} as const;

export type StringKey = keyof typeof strings;

/**
 * Returns the UI string for a known key. Compile-time-checked via StringKey.
 *
 * Phase A consumes via:
 *   import { s } from "@/lib/i18n/strings";
 *   <button>{s("header.signIn")}</button>
 *
 * Phase A components MUST NOT inline string literals as JSX text-node
 * children for keys that exist in this map (H67 grep-based assertion).
 */
export function s(key: StringKey): string {
  return strings[key];
}
