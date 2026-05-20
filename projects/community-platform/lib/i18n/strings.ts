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
