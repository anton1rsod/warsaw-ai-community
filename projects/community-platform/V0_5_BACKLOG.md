# v0.5+ Backlog

> Items that are NOT in v0.4 scope. Captures the "good ideas, not v0.4" log from chat-21 menu closeout + (will append) chat-22 brainstorm deferrals.

**Update protocol:** Append-only when items get explicitly deferred. Each entry: source chat, scope rationale, suggested chat to re-address.

---

## From chat-21 menu (closed 2026-05-17 in chat-21-prep)

### Deferred because v0.4 likely restructures the surface

- **Task 4.2 — 14 Playwright E2E scenarios** (chat-21 Option B) — `e2e/v0-3-discovery.spec.ts` covering anonymous `/home`, `/this-week` L2 strip, RSVP toggle, RSVP race, orphan slug, ICS subscribe, AddToCalendar download, Thanks, self-thank blocked, duplicate-thank dedup, RSVP tri-state transitions, RSVP privacy posture, PWA install. **Why defer:** v0.4 will likely restructure `/home`, `/events/[slug]`, `/meetings/[slug]`, `/projects/[slug]` page templates (questionnaire Q3.2 + Q5.7 + Q5.8); E2E tests written today against v0.3.1 markup need re-authoring against v0.4 templates. Plan section reference: `projects/community-platform/v0.3.0-plan.md:4998-5196`. **Re-evaluate:** after v0.4 ships, against v0.4 strict-list.

- **test-reset-profile API route** (chat-21 Option F) — only needed to unblock RSVP race E2E scenario; paired with Task 4.2. Defers with it.

- **Dynamic viewer-state on `/projects/[slug]` + `/meetings/[slug]` ThankButton mounts** (chat-21 Option D) — currently both surfaces ship `<ThankButton initialState="not-signed-in">` (SSG-safe). **Why defer:** v0.4 Q3.2 may unify detail-page templates and Q5.8 may restructure project pages to portfolio-style; flipping these to `force-dynamic` now bakes in an SSG-vs-dynamic decision that v0.4 should make holistically. **Re-evaluate:** post-Q3.2 lock.

### Deferred because cosmetic / low-leverage

- **HomeFeed.tsx + meetings.ts literal 100% line coverage** (chat-21 Option G) — currently 98.86% + 98.61% (defensive fallbacks for relativeDate's "Today" branch and gray-matter malformed-frontmatter guards). **Why defer:** within v0.1+v0.2 strict-list precedent ("branches ≥80% acceptable for unreachable-defensive-fallback branches"). No bug correlation.

### Already done (preserved for traceability)

- ~~Signed-in `/home` smoke~~ (chat-21 Option A) — DONE 2026-05-17 by Anton; recorded in STATE.md `Last verified.v0_3_1_ship` and CHANGELOG `[0.3.1]`.
- ~~`[0.3.1]` CHANGELOG entry~~ — DONE 2026-05-17 (this commit).

### Folded into v0.4 brainstorm (NOT v0.5 backlog — on chat-22 questionnaire)

- **SSG-vs-dynamic direction lock for detail pages** (chat-21 Option H) — folds into questionnaire Q3.2 (detail page templates unified?) and indirectly Q8.x.
- **Unify Events + Meetings nav** (chat-21 Option I) — folds into questionnaire Q2.2.
- **Brand-asset PWA icons** (chat-21 Option C) — folds into questionnaire Q4.7 (logo direction; crowdsource from Telegram or design). v0.3.1 ships `#2563eb` solid placeholders.

### Open follow-up (waiting on external input or v0.4 outcome)

- **typescript-reviewer + code-reviewer dispatch on v0.3 strict-list** (chat-21 Option E) — quality finalization pass. **Why defer:** surfaces touched by v0.3 may get restructured in v0.4 (Q3.2 / Q5.6 / Q5.7 / Q5.8); reviewer findings on soon-to-change code would be re-litigated. **Re-evaluate:** dispatch against v0.4 strict-list after v0.4 ships.

- **Mark Spasonov roster backfill** (chat-10 Option A — still open) — PR #3 Draft on `chore/mark-spasonov-backfill`; placeholders `@MARK_TELEGRAM_HANDLE_TBD` + `MARK_GIT_EMAIL_TBD` need real values from Mark out-of-band. **Re-evaluate:** when Mark sends values.

---

## From chat-22 brainstorm (TBA)

> Chat-22 brainstorm will append "good idea, not v0.4" items here as they surface during the questionnaire walkthrough. Categories likely: features beyond IA scope, brand work beyond v0.4 envelope, search beyond initial scope, native-app considerations, real-time messaging, etc.

---

*Drafted 2026-05-17 in chat-21-prep close-out alongside v0.4 brainstorm scaffold. Lives at `projects/community-platform/V0_5_BACKLOG.md` per "lean handoffs + deferred items get a home" convention.*
