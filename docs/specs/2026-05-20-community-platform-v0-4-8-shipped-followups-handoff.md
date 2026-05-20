# Chat-31 handoff: post-Meetup-#4 follow-ups + Phase B activation gate

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) (§3 chat-brief shape; loaded once at start)

**Status (drafted chat-30 closeout, 2026-05-20):** Chat-30 shipped **THREE hotfixes back-to-back** between 12:30–21:15 Europe/Warsaw, all merged + tagged + prod-verified, all driven by Anton's Playwright dogfooding of the first real event (Meetup #4 tomorrow 19:00 Warsaw).

- **v0.4.6 ICS timezone** — PR #32 `9f6d1a6` + tag pushed; `/api/calendar.ics` now emits `DTSTART:20260521T170000Z` (17:00 UTC = 19:00 Warsaw CEST). Closed the v0.4.5 known caveat. Fix shape: `Intl.DateTimeFormat({timeZone})` pre-convert + `startInputType:"utc"`. Canonical TZ-independence test via `withTz` helper.
- **v0.4.7 EventRsvpButton hydration** — PR #33 `2852827` + tag pushed; new auth-gated `GET /api/event-rsvp-state` route + client useEffect on mount. Anton's first RSVP committed at `fd6c2e4` (warsaw-ai-bot wrote `events_going:[2026-05-21-meetup-4]` to his profile).
- **v0.4.8 page force-dynamic** — PR #34 `6ddee8d` + tag pushed; closes the Header SSG anomaly Anton spotted post-v0.4.7 (force-static had propagated to layout's auth-aware `<Header />`). Page now reads `auth()` at request time; `loadViewerRsvp` helper server-renders real `initialState` + `profileSha`. v0.4.7 hydration kept as defense-in-depth. **978/978 tests green; CI 1m20s; prod cache-control `private, no-store` confirmed.**

**Pending Anton-side before chat-31 starts:** Final canonical sign-in flow validation on the v0.4.8 deploy. Sign in as `anton1rsod` → /events/2026-05-21-meetup-4 → expect Header signed-in chip top-right (no "Sign in") + EventRsvpButton at ✓ Going server-rendered (no flicker on either) → toggle off + re-toggle → confirm bot commits land. YourWeekPane on /home should show "Your next RSVP: AI Community | Meetup #4" after a reload.

---

## Setup

```bash
cd "$HOME/Projects/Warsaw AI Comunity" && git fetch && git checkout main && git pull
# Branch only if picking a code-bearing option.
```

## Read order (~400 lines)

1. **This handoff** (~80 lines).
2. **`projects/community-platform/STATE.md`** — `v0_4_6_*` / `v0_4_7_*` / `v0_4_8_*` rows under Last verified; Snapshot tag chain.
3. **`projects/community-platform/CHANGELOG.md`** — `[0.4.6]` / `[0.4.7]` / `[0.4.8]` entries (full root-cause + fix shape + trade-offs).
4. **`projects/community-platform/CONSTRAINTS.md`** — Generated artifacts + Auto policy unchanged.
5. **`projects/community-platform/HANDOFF_PROTOCOL.md`**.
6. **V0_5_BACKLOG.md** — Option β (admin event-creation UI) + carryovers.

## Chat 31 owns: pick 1–3 options (token discipline)

### Option N — Day-of meetup verification (2026-05-21, mandatory if ≥1 attendee subscribed via ICS)

**~10 min Anton-driven + 10 min me-driven via Playwright.** On meetup day:
- Subscribers' calendar apps should display the event at 19:00 their local time when Warsaw is also at 19:00 (i.e. their local rendering matches Warsaw rendering for events that day).
- Prod `/events/2026-05-21-meetup-4` roster: "Going (N total)" where N = anton1rsod + any other RSVPs.
- `community/members/anton-safronov.md` should show `events_going: [2026-05-21-meetup-4]` (already true post-v0.4.7).
- If any attendee reports time mismatch in their calendar, capture screenshots + tz reports as `v0_4_6_ics_subscriber_evidence` STATE row.

### Option F — Phase B activation gate (D44; window opens 2026-05-25)

**Re-evaluate at chat-31+ ONLY IF run after 2026-05-25** (7d post-v0.4.0 ship + 4d post-meetup landing data). Inputs: PostHog event volume / surfaces touched / user-test session notes from meetup retro. If green, plan Phase B (detail-template family, member team-page, project portfolio framing, per-project Decisions section); if not, document carryover reasons in CHANGELOG and defer to v0.5 brainstorm.

### Option β — v0.5 brainstorm seed (admin event-creation UI)

**~45 min `superpowers:brainstorming`.** V0_5_BACKLOG.md chat-29 section flagged `/admin/events/new` as v0.5+ candidate — admin UI for committing `community/events/<slug>/README.md` without manual git work. Pattern precedent: `/admin/invite` (chat-9). Member-proposed events (Option γ) explicitly deferred — needs its own larger brainstorm (governance, permissions, spam risk, moderation flow). Run brainstorm only if v0.5 scope is on the chat agenda.

### Option Z — Residual cleanup carryovers

Same A.PWA (textured WA icons — still blocked on host tooling) / M (Vercel preview-protection bypass token — recommend SKIP) from chat-30 menu. Do **not** spend chat-31 cycles unless landing data justifies.

---

## NOT for chat-31

- Re-litigating chat-22/23/24 D-locks or any chat-29/30 fix-shape decisions.
- New SSG-on-auth-aware surfaces — pattern is now: dynamic page when Header needs viewer state; SSG only when surface is genuinely anon-only (e.g. `/`).
- Re-running prod cache-control gates unless a change touches an H56 surface.
- v0.5+ scope creep (admin event UI is brainstorm-only at chat-31; no implementation).

## Anti-patterns (chat-31 specific)

- **Don't ship a 4th chat-30-style hotfix unless prod is actually broken.** Three back-to-back hotfixes in one chat is enough; further cleanup → v0.5.
- **Don't pre-emptively flip `/meetings/[slug]` or `/projects/[slug]` to dynamic** — wait until they actually need viewer-state Header rendering. Same pattern reusable; cherry-pick when triggered.
- **Don't re-add the v0.4.7 hydration as the primary RSVP read path** — page-level server-render is now canonical for `/events/[slug]`; hydration is defense-in-depth only.

## Done means

- Chat-31 picked one of N / F / β / Z (or a combination per token discipline).
- Each option executed per its acceptance criteria.
- Commits pushed; PR opened only if code-bearing (per `feedback_pr_vs_direct`); direct-to-main for docs-only.
- STATE.md `Last verified` rows added per surface; closeout commit lands the CHANGELOG + STATE + (if needed) chat-32 handoff.

## Reference pointers

- **Chat-30 PRs (merged):** [#32](https://github.com/anton1rsod/warsaw-ai-community/pull/32) (v0.4.6), [#33](https://github.com/anton1rsod/warsaw-ai-community/pull/33) (v0.4.7), [#34](https://github.com/anton1rsod/warsaw-ai-community/pull/34) (v0.4.8).
- **Chat-29 → Chat-30 handoff:** [`docs/specs/2026-05-20-community-platform-v0-4-5-shipped-followups-handoff.md`](2026-05-20-community-platform-v0-4-5-shipped-followups-handoff.md).
- **STATE.md** — `v0_4_6_*` + `v0_4_7_*` + `v0_4_8_*` rows under Last verified.
- **CHANGELOG.md** — `[0.4.6]` + `[0.4.7]` + `[0.4.8]` entries.
- **Memory:** `project_community_platform_v0_4_ship` — chat-30 v0.4.6+v0.4.7+v0.4.8 sections at end.
- **Bot RSVP commit:** `fd6c2e4` on main (proof v0.4.7 chain works end-to-end).
- **First real event:** `community/events/2026-05-21-meetup-4/README.md`.
