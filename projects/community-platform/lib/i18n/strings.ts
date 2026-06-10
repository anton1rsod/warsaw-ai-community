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
  // ─── header.* (chrome a11y/aria — actively used by Header + HeaderMobileMenu) ───
  // v0.6 deprecated header.signIn/yourWeek/editProfile/signOut + footer.* + nav.* —
  // migrated to chrome.header.*, chrome.header.dropdown.*, chrome.header.nav.*,
  // chrome.footer.* respectively (Phase 4.6 triage commit).
  "header.skipToContent": "Skip to content",
  "header.menu": "Menu",
  "header.menuClose": "Close menu",
  "header.userMenu": "Account",

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
  "calendar.title": "Calendar.",
  "calendar.kicker": "// calendar",
  "calendar.filter.all": "All",
  "calendar.filter.events": "Events",
  "calendar.filter.meetings": "Meetings",
  "calendar.upcoming": "// upcoming",
  "calendar.subscribe": "subscribe (ICS)",

  // ─── decisions.* (/decisions route) ─────────────────────────────────────
  "decisions.title": "Decisions.",
  "decisions.kicker": "// decisions · ADR log",
  "decisions.sectionLabel": "// all records",
  "decisions.detail.backLink": "← Decisions",

  // ─── meetings.index.* (/meetings route) ──────────────────────────────────
  "meetings.index.title": "Meetings.",
  "meetings.index.kicker": "// meetings",
  "meetings.index.subscribeIcs": "subscribe (ICS)",
  "meetings.detail.backLink": "← Meetings",
  "meetings.detail.addToCalendar": "Add to Calendar",

  // ─── members.index.* (/members route) ────────────────────────────────────
  "members.index.title": "Members.",
  "members.index.kickerFmt": "// members · {count}",
  "members.index.sectionLabel": "// community",
  "members.detail.backLink": "← Members",
  "members.detail.contributions": "Contributions",
  "members.detail.contributionsNote": "Derived from git history. Bot commits excluded.",
  "members.detail.editProfile": "Edit profile →",
  "members.detail.editYourProfile": "Edit your profile →",
  "members.detail.profileSection": "Profile",
  "members.detail.eventsSection": "// events",
  "members.detail.personaSection": "Persona",
  "members.detail.personaLanguages": "Languages",
  "members.detail.personaIndustries": "Industries",
  "members.detail.personaRoles": "Functional roles",
  "members.detail.personaStages": "Company stages",
  "members.detail.personaNiche": "Niche expertise",
  "members.detail.dataControls": "Data controls",
  "members.detail.noPersonaFmt": "No persona yet for {slug}. See the persona-builder process.",
  "members.detail.noProfileFmt": "{name} hasn't filled out a profile yet. Members can edit {path} directly via git.",
  "members.detail.noProfilePathFmt": "community/members/{slug}.md",
  "members.detail.expertiseSection": "Expertise",
  "members.detail.expertRow": "Expert",
  "members.detail.practitionerRow": "Practitioner",
  "members.detail.nicheRow": "Niche",
  "members.detail.languagesRow": "Languages",
  "members.detail.postureSection": "Evaluation posture",
  "members.detail.bullishRow": "Bullish when",
  "members.detail.skepticalRow": "Skeptical when",
  "members.detail.firstQuestionCaption": "the first question I ask",
  "members.detail.askYours": "ask yours →",
  "members.detail.storySection": "Story",
  "members.detail.continueReading": "continue reading",
  "members.detail.storyHardWon": "Hard-won knowledge",
  "members.detail.storyPatterns": "Patterns I keep seeing",
  "members.detail.storyDispositions": "Role dispositions",
  "members.detail.storyEvidence": "Verifiable evidence",
  "members.detail.storyMore": "More",
  "members.detail.dispositionBuyer": "Buyer",
  "members.detail.dispositionBuilder": "Builder",
  "members.detail.dispositionCompetitor": "Substitute",
  "members.detail.activityCommitsFmt": "{n} commits",
  "members.detail.activityAdrsFmt": "{n} ADRs",
  "members.detail.activityStatusFmt": "{n} status posts",
  "members.detail.activityThankedFmt": "♥ thanked {n}×",
  "members.detail.viewCard": "view card ↗",
  "members.detail.askAboutFmt": "ask {name} about… →",
  "members.detail.copyHandle": "copy @{handle}",
  "members.detail.copiedHandle": "copied",
  "members.detail.metaLink": "link ↗",

  // ─── projects.index.* (/projects route) ──────────────────────────────────
  "projects.index.title": "Projects.",
  "projects.index.kicker": "// projects",
  "projects.index.sectionLabel": "// active",
  "projects.detail.backLink": "← Projects",
  "projects.detail.topContributors": "Top contributors",
  "projects.detail.contributorsNote": "Derived from git history. Bot commits excluded.",
  "projects.detail.recognizeContributors": "// recognize contributors",
  "projects.detail.askGbrain": "Ask GBrain about this project →",
  "projects.detail.noContributors": "No contributors yet.",

  // ─── thisweek.* (/this-week route) ──────────────────────────────────────
  "thisweek.title": "This week.",
  "thisweek.kickerFmt": "// this week · {week}",
  "thisweek.yourUpdate": "// your update",
  "thisweek.othersLabelFmt": "// others · {count}",

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
  "hero.anon.taglineLead": "Subploters",
  "hero.anon.taglineHighlight": "public.",
  "hero.anon.taglineInfix": "ships in",
  "hero.anon.subtagline":
    "Where Subploters learn, ship, and find each other.",
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
  "events.detail.thisWeekSuffix": "this week.",
  "events.detail.interestedAnonLabel": "// interested (sign in to see)",

  // ─── events.card.* (EventCard primitive chips — used across surfaces) ──
  "events.card.goingChip": "✓ going",
  "events.card.interestedChip": "interested",
  "events.card.goingCountFmt": "{count} going",

  // ─── empty.* (v0.6 evergreen empty-state copy) ──────────────────────────
  "empty.home.nextEvent": "Next meetup lands soon. Watch this strip.",
  "empty.home.ships": "Next ship lands when somebody commits.",
  "empty.events.upcoming":
    "No upcoming meetup scheduled — Telegram has the next signal.",
  "empty.events.past": "No past events yet.",
  "empty.eventDetail.going": "Be the first to RSVP.",
  "empty.eventDetail.interested": "No one's marked interested yet.",

  // ─── chrome.header.* (v0.6 header chrome) ───────────────────────────────
  "chrome.header.logo": "Subploters",
  "chrome.header.signIn": "sign in",
  "chrome.header.nav.home": "home",
  "chrome.header.nav.calendar": "calendar",
  "chrome.header.nav.members": "members",
  "chrome.header.nav.projects": "projects",
  "chrome.header.nav.handbook": "handbook",
  "chrome.header.dropdown.yourWeek": "your week",
  "chrome.header.dropdown.editProfile": "edit profile",
  "chrome.header.dropdown.signOut": "sign out",

  // ─── chrome.footer.* (v0.6 footer chrome) ───────────────────────────────
  "chrome.footer.copyrightFmt": "© {year} Subploters",
  "chrome.footer.about": "about",
  "chrome.footer.telegram": "telegram",
  "chrome.footer.github": "github",
  "chrome.footer.license": "license",

  // ─── login.* (/login route — v0.9 reskin) ──────────────────────────────────
  "login.kicker": "// members only",
  "login.description":
    "Sign in with the GitHub account associated with your roster entry.",

  // ─── masthead.* (v0.7 — /handbook formal entity masthead per brand.md §4.4) ───────────────────
  "masthead.foundedFmt": "Founded 2026 · Warsaw",
  "masthead.formalEntityLead": "Professional",
  "masthead.formalEntityTail": "Association",
  "masthead.subtitleLead": "The Warsaw chapter of the Professional",
  "masthead.subtitleTail": "Association — for founders writing their next plot.",

  // ─── lens.* (v0.12 overlap lens — starter templates consumed by
  //     lib/persona-overlap.ts; remaining lens.* keys land with the
  //     OverlapLens component in Phase 3) ────────────────────────────────────
  "lens.starterShared":
    "You both work in {label} — compare notes from opposite vantage points.",
  "lens.starterComplementary":
    "Ask about {label} — expert where you're still mapping it.",
  "lens.starterNiche": "Their niche: {item} — ask how they got there.",

  // ─── lens.* (member-page overlap lens — v0.12 §4.2) ──────────────────────
  // Phase 1 added lens.starterShared / lens.starterComplementary /
  // lens.starterNiche (computeOverlap templates). These five are the band's
  // display strings; the component does the {placeholder} substitution
  // (same Fmt convention as members.index.kickerFmt).
  "lens.kicker": "you × {name}",
  "lens.kickerSr": "overlap: you and {name}",
  "lens.startersLinkFmt": "{count} conversation starters →",
  "lens.sharedFmt": "Shared ground in {labels}",
  "lens.complementaryFmt": "expert in {label} where you're {depth}",

  // ─── persona.editor.* (/me/edit — v0.11.1 persona attach) ──────────────────
  "persona.editor.heading": "Your persona",
  "persona.editor.help": "Paste the markdown your persona-builder run produced, or upload the .md file.",
  "persona.editor.consent": "Attaching publishes your persona to your public profile and to this public git repository. Hiding or deleting it clears the live site, but commit history is retained. Purpose: helping the community match the right peers to evaluate ideas.",
  "persona.editor.dataMin": "Attach the public version only — do not include a “Private notes” section or sensitive personal data (health, beliefs, etc.).",
  "persona.editor.attach": "Attach persona",
  "persona.editor.tooLarge": "Persona is too large (max 64KB).",
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
