# Chat-30 handoff: v0.4.5 follow-ups menu (ICS timezone hotfix + Anton-side I+J + residual)

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) (§3 chat-brief shape; loaded once at start)

**Status (drafted chat-29 closeout, 2026-05-20):** Chat-29 shipped **PR #31 MERGED at SHA `78cb58e`** — first real event seed + v0.3.0 silent-regression fix that wired `community/events/` into `content-snapshot.json`. Tag `community-platform-v0.4.5` pushed at the merge SHA. Suite 946/946 green; tsc + lint clean; CI 1m22s pass. Prod smoke anon-side via curl all green: `/api/calendar.ics` 1 VEVENT, `/events` index surfaces Meetup #4, AnonymousHero "Next event" slot flips from empty-state to populated.

**Chat-29 also shipped (same PR):**

- `community/events/2026-05-21-meetup-4/README.md` — AI Community Meetup #4, 2026-05-21 19:00 Europe/Warsaw at Grzybowska 85a, Warsaw.
- `lib/events.ts` `listEventsFromDisk(repoRoot)` (+63 LOC) mirroring `listMeetingsFromDisk` pattern; 11 new unit tests in `tests/unit/events-from-disk.test.ts`.
- `lib/content-snapshot.ts` interface gains `events: readonly Event[]`; defensive cast dropped at read site; snapshot const cast moves to `as unknown as ContentSnapshot` with inline comment (Zod brand can't roundtrip through JSON.parse).
- `scripts/snapshot-content.ts` wired to call `listEventsFromDisk` in `Promise.all` + snapshot object key + log line.
- `V0_5_BACKLOG.md` gains chat-29 section with Option β (admin event-creation UI at `/admin/events/new`).
- PR #30 v0.4.4 merge SHA back-fill (`5c6ac94e` confirmed) in CHANGELOG `[0.4.4]` header + STATE `v0_4_4_reviewer_fixes` row.

**KNOWN BUG surfaced in chat-29 prod smoke — chat-30 Option A (TOP PRIORITY):** ICS timezone. Production-built `calendar.ics` emits `DTSTART:20260521T190000Z` (UTC literal) instead of `20260521T170000Z` (intended 19:00 Warsaw CEST = 17:00 UTC). Root cause: `lib/ical.ts dateToIcsParts(dateISO, hhmm)` returns naive 5-element tuple `[y, mo, d, hh, mm]` which the `ics` package interprets as **build-host local timezone**. Vercel builds run UTC → tuple serializes as UTC literal; chat-29 author's local CEST machine produced the correct UTC offset (-2h shift). **User impact:** anyone subscribed to the ICS feed via calendar app sees the meetup at 21:00 Warsaw instead of 19:00 Warsaw. Wide enough impact to warrant a v0.4.6 hotfix **before tomorrow's 19:00 meetup**. Same bug latent in `meetingToIcsEvent` — surfaces once any meeting is scheduled.

**Pending Anton-side before chat-30 starts:** None blocking. v0.4.5 is fully shipped and tag-pushed. The ICS bug is a v0.4.6 hotfix that's chat-30's responsibility, not a chat-29 leftover.

---

## Setup

```bash
cd "$HOME/Projects/Warsaw AI Comunity" && git fetch && git checkout main && git pull
git checkout -b fix/community-platform-v0-4-6-ics-timezone   # if picking Option A
```

## Read order (~500 lines)

1. **This handoff** (~80 lines).
2. **`projects/community-platform/STATE.md`** — `v0_4_5_*` rows under Last verified, Last updated 2026-05-20.
3. **`projects/community-platform/CHANGELOG.md`** — `[0.4.5]` entry (Known caveat section describes the ICS timezone bug fully).
4. **`projects/community-platform/CONSTRAINTS.md`** — Generated artifacts section + Staging E2E targeting.
5. **`projects/community-platform/HANDOFF_PROTOCOL.md`**.
6. **`projects/community-platform/lib/ical.ts`** — the buggy `dateToIcsParts` + `meetingToIcsEvent` + `eventToIcsEvent` for Option A planning.
7. **`projects/community-platform/lib/__generated__/calendar.ics`** — current local-build output (for diff comparison post-fix).
8. **`projects/community-platform/tests/unit/ical.test.ts`** (if exists) — model new tests after this pattern.

## Chat 30 owns: pick Option A (TOP) + others as time allows

### Option A (TOP — pre-meetup deadline) — ICS timezone hotfix `v0.4.6`

**~45 min with TDD. Must ship before 2026-05-21 19:00 Europe/Warsaw or ICS subscribers see wrong time.**

Acceptance criteria:
- `/api/calendar.ics` on production emits `DTSTART:20260521T170000Z` (17:00 UTC = 19:00 Warsaw CEST) OR uses TZID-aware VEVENT with `TZID:Europe/Warsaw` + `DTSTART;TZID=Europe/Warsaw:20260521T190000`.
- Identical behavior on the chat-29 author's CEST machine AND a UTC build host (Vercel). Add a TZ-independence test that asserts the output is byte-identical regardless of `process.env.TZ`.
- Same fix applies to `meetingToIcsEvent` (not just `eventToIcsEvent`) — both call `dateToIcsParts`.

Recommended fix shape (per `ics` package docs):

```typescript
// Option 1 — TZID-aware VEVENT (preferred; preserves local-time intent):
{
  start: [y, mo, d, hh, mm],
  startInputType: 'local',
  startOutputType: 'local',  
  // emit `BEGIN:VTIMEZONE` block + `DTSTART;TZID=Europe/Warsaw:...` in VEVENT
}

// Option 2 — pre-convert local Warsaw → UTC explicitly:
// Need TZ-aware library (date-fns-tz / luxon / @date-fns/utc) to compute
// offset on the specific event date (+2 CEST during DST, +1 CET outside).
// Pass to ics as: { start: [...], startInputType: 'utc' }
```

The `ics` package's TZID support is limited; verify behavior in Apple Calendar / Google Calendar / Outlook before shipping. If TZID emission proves fragile, fall back to Option 2 with explicit offset computation.

Tests:
- New `tests/unit/ical-timezone.test.ts` (or extend existing): asserting `DTSTART` line content for known event/meeting fixtures. Run twice with `process.env.TZ='Europe/Warsaw'` and `process.env.TZ='UTC'` → byte-identical output.
- E2E (optional): probe production `/api/calendar.ics` post-deploy, assert `DTSTART:` line matches expected UTC. Skip if Vercel rebuild is non-deterministic on the same SHA.

Closeout:
- Bump tag `community-platform-v0.4.6` at merge SHA.
- CHANGELOG `[0.4.6]` entry — Fixed: ICS timezone bug (root-cause analysis from chat-29 + chat-30 fix shape).
- STATE.md `v0_4_6_ics_timezone_fix` row in Last verified.
- Remove the `v0_4_5_ics_timezone_caveat` row OR mark it CLOSED.

### Option B — Anton-side I+J completion (signed-in RSVP + YourWeekPane validation)

**~20 min, Anton-driven.** Carry-over from chat-25/27/28/29.

Steps (run in real browser session against `https://warsaw-ai-community-platform.vercel.app`):

```
1. Visit /login → sign in with GitHub as anton1rsod → land on /home.
2. /home: YourWeekPane visible. Expect empty state pre-RSVP ("No upcoming RSVPs" or similar).
3. Top-right account dropdown — verify 4 items: Your week / Members / Edit profile · @anton1rsod / Sign out.
4. Mobile viewport (DevTools, ≤768px) — hamburger replaces top-right; opens menu with same 4 items + nav.
5. /?from=/calendar (signed-in) — expect 302 to /calendar (exercises resolveSafeReturnTo).
6. /?from=//evil.example (signed-in) — expect 302 to /home (SAFE_RETURN_TO regex rejects `//`).
7. Visit /events/2026-05-21-meetup-4. Click "Going". Expect button-state update + commit on main updating
   community/members/anton1rsod/profile.md events_going + lib/__generated__/event-rosters.json regen.
8. Hard-refresh /home. Expect YourWeekPane "Your next RSVP: AI Community | Meetup #4" + date/time.
9. Incognito visit /. Expect AnonymousHero shows Meetup #4 in "Next event" slot (already verified anon
   chat-29; this is a re-verification under fresh deploy from the RSVP commit's prebuild).
```

Note: ICS timezone bug (Option A) is independent of YourWeekPane — YourWeekPane reads from snapshot's `events` field directly (correct camelCase `startTime`), not from the calendar.ics output. So YourWeekPane displays the correct 19:00 Warsaw time. Only ICS subscribers are affected by the bug.

Closeout:
- STATE.md `v0_4_5_signed_in_smoke` row in Last verified.
- Note any UX gaps observed for v0.5+ brainstorm fodder.

### Option F — Phase B activation gate decision

Per D44 — Phase B (detail-template family, member team-page, project portfolio framing, per-project Decisions section) is CONDITIONAL on Phase A landing data + post-ship user-test. **Window opened 2026-05-25** (7 days post v0.4.0 ship at 2026-05-18). Chat-30 might run before 2026-05-25 (chat-29 was 2026-05-20) — re-evaluate at chat-31+ when window has opened AND post-window landing data exists.

### Option A.PWA — PWA textured "WA" icons

Same as chat-26/27/28 Option A. **Still blocked on chat-author host tooling** (no `magick` / `convert` / `sharp` / `canvas`). Realistic resolution: offline Figma/Photoshop pass → commit PNGs, not installing 30MB+ of native binaries for one-off icon-gen.

### Option M — Vercel preview-protection bypass token

**RECOMMEND SKIP** — chat-27 production-URL pattern remains canonical and sufficient for the smoke-probe needs of v0.4.x. Mint only if an upcoming feature requires pre-merge edge-behavior verification.

---

## NOT for chat-30

- Re-litigating chat-22/23/24 D21–D44 / O1–O14 locks or chat-29 Option β backlog framing.
- Re-running chat-27's a11y E2E gate unless Option A changes any a11y-relevant surfaces (it shouldn't; `lib/ical.ts` is a build-time module, no DOM impact).
- Spec §14 changes beyond what Option A surfaces about the ICS contract (if any).
- v0.5+ scope: admin event-creation UI (Option β backlog), member-proposed events, dark mode, Polish localization — see V0_5_BACKLOG.md.

## Done means

- Chat-30 picked Option A (recommended; pre-meetup deadline) and any others.
- Each option executed per its Acceptance criteria.
- Commits pushed; PR opened if code-bearing (per `feedback_pr_vs_direct`); direct-to-main for docs-only.
- STATE.md `Last verified` rows added per surface.
- If material work surfaces outside scope → `pending follow-ups` in STATE, chat-31 picks.

## Anti-patterns (chat-30 specific)

- **Don't ship Option A without TZ-independence test.** The root cause was a host-TZ-dependent build; fix verification MUST prove it's TZ-independent.
- **Don't skip Option A.** Tomorrow's meetup is the immediate deadline; ICS subscribers seeing 21:00 Warsaw instead of 19:00 Warsaw is a real coordination cost.
- **Don't conflate Option A (ICS feed) with YourWeekPane display.** They read from different data paths; YourWeekPane is correct, ICS is wrong. Don't "fix" YourWeekPane.
- **Don't bypass TDD** for Option A (CONSTRAINTS line 25 — applies to all code changes).
- **Don't run more than 1-3 options per chat** (token discipline).

## Reference pointers

- **Chat-29 PR (merged):** [#31](https://github.com/anton1rsod/warsaw-ai-community/pull/31).
- **Chat-28 → Chat-29 handoff:** [`docs/specs/2026-05-20-community-platform-v0-4-3-shipped-followups-handoff.md`](2026-05-20-community-platform-v0-4-3-shipped-followups-handoff.md).
- **STATE.md** — `v0_4_5_*` rows (events_snapshot_fix, prod_smoke_anon, ics_timezone_caveat) under Last verified.
- **CHANGELOG.md** — `[0.4.5]` entry (full root-cause + fix description + Known caveat section).
- **Memory:** `project_community_platform_v0_4_ship` — to be updated with chat-29 closeout row.
- **`ics` npm package docs:** https://github.com/adamgibbons/ics — `startInputType`, `startOutputType`, TZID support.
