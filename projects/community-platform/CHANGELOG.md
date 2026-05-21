# Changelog

All notable changes to Community Platform will be recorded here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org/spec/v2.0.0.html) once shipped; until then, date-based entries are fine.

## Versioning policy (placeholder — finalize during plan-writing)

| Version | Meaning |
|---|---|
| `0.0.x` | Pre-spec scaffolding, no implementation |
| `0.1.0` | First implementation pass — identity + roles + minimal gamification |
| `0.2.0` | Project / contribution tracking |
| `0.3.0+` | TBD |
| `1.0.0` | Reserved (production-grade declaration) |

---

## [0.5.1] — 2026-05-21 (chat-33 — admin discoverability + EventRoster wart + safeHandle/log libs)

**Post-v0.5.0 polish patch.** Bundles 4 active items + 1 doc-deferred into one PR-required squash-merge. Spec at `docs/specs/2026-05-21-community-platform-v0-5-1-design.md` SHA `29cec8d` (chat-33 brainstorm output, amended mid-plan-write with item 1b + H86 force-dynamic flip). Plan at `projects/community-platform/v0.5.1-plan.md` SHA `5d9c430` (12 tasks across 3 phases).

### Added

- **`lib/handles.ts`** — `safeHandle(input: string): string` with CRLF strip + 39-char cap (GitHub username max). Throws on empty-after-strip per O4 (silent empty would produce malformed commits like `chore(events): @ created "slug"`). Hardenings H83 (post-condition: ≤39 chars + no CRLF or throw) + H84 (idempotency on already-safe input).
- **`lib/log.ts`** — thin structured-logger wrapper around `console.warn` / `console.error`. Format: `[tag] event {...fields}` single-line, JSON-stringified fields (Vercel logs auto-prepend timestamp + region). Empty tag rejected at runtime per H85. O6 contract: callers pass JSON-serializable fields; circular refs / functions / symbols are caller responsibility. Future pino swap is a single-file edit. ~20 LOC, zero deps.
- **`/events` admin "+ New event" button** — admin-only Server Component button in top-right of `/events` page header. Server-side `isAdmin(session.githubHandle)` gate; non-admins (members) and anonymous viewers see no button. New i18n key `events.list.newEventButton` (`+ New event`). Hardening H81 (RBAC re-check at component render — no client-only gate).

### Changed

- **`/events` page → `force-dynamic`** (item 1b — amended mid-plan-write). Was `force-static`. Required for H81 admin-button request-time gate; side-benefit closes a latent v0.4.7 Header-flicker bug that's been live on `/events` since v0.4.7 (SSG of /events propagated through layout, briefly showing "Sign in" chip to signed-in viewers). Same chat-30 fix pattern applied to `/events/[slug]`. Hardening H86 (grep-verifiable `dynamic = "force-dynamic"` export).
- **`EventRoster`** — hides `+N members (sign in to see)` chip when viewer is signed-in. The h3 `({total} total)` already conveys count; chip's sole purpose was the sign-up CTA, which is wrong for signed-in viewers. Anonymous viewers continue to see the chip exactly as today. Internal `auth()` call inside async Server Component (per O3); parent `/events/[slug]/page.tsx` force-dynamic propagates, so viewer-state read matches request cookie (H82).
- **`create-event.ts`, `rsvp-event.ts`, `thank-status.ts`** — consume `safeHandle()` from `lib/handles.ts`; consume `log.warn` / `log.error` from `lib/log.ts`. Three inline `.replace(/[\r\n]/g, "")` sites consolidated.
- **`save-profile.ts`** — (a) consume `log.warn` from `lib/log.ts` for the 6 audit-log call-sites; (b) **chat-33 reviewer triage HIGH fix**: `commitMessage()` now consumes `safeHandle` from `lib/handles.ts`. The spec originally excluded save-profile from safeHandle migration ("uses different handle source — log migration only"), but the code-reviewer caught that `commitMessage()` interpolates the raw `${handle}` into the git commit body + Co-Authored-By trailer — same injection surface as the 3 other actions. Spec scope oversight; closing here for consistency.

### Deferred (documented in code)

- **Item 4: `encodeURIComponent` slug at `EventForm.tsx:88-91`** — YAGNI. `EventSlugSchema` regex `[a-z0-9-]+` makes URL-unsafe chars structurally impossible. Code comment added in-place: "If the regex relaxes, revisit here."

### Security

- **3-lane parallel reviewer dispatch** (chat-33 Task 3.1 on branch HEAD `cd4d5ba`, scope = full diff): **0 CRITICAL / 0 HIGH unresolved / 1 HIGH applied (save-profile commitMessage migration) + 3 MEDIUM applied** (lib/log.ts narrowing trap inlined; event-roster.test.tsx mock pattern standardized to `vi.mocked()`; events-page.test.tsx H81 added `expect(isAdmin).toHaveBeenCalledWith("anton1rsod")` to close harness gap) + **10 INFO accepted** (handle sanitization, log injection defanged by JSON.stringify, force-dynamic admin gate, viewer-state at render-time, save-profile PII payload preserved, Readonly<Record> correctness, safeHandle string boundary, alias `as toSafeHandle` necessity, EventRoster async signature canonical, tsc clean). All applied in single triage commit `fa248ce`.
- All 6 hardenings (H81-H86) grep-verifiable via `describe("H<n>:")` blocks across `tests/unit/handles.test.ts`, `tests/unit/log.test.ts`, `tests/unit/event-roster.test.tsx`, `tests/unit/events-page.test.tsx`, `tests/integration/save-profile.test.ts`.

### Tests

- **1047/1047 unit+integration green** (1020 v0.5.0 baseline + 27 new: 10 handles + 8 log + 4 event-roster + 4 events-page admin button + 1 save-profile H83 from chat-33 triage). Coverage gates hold.
- `lib/handles.ts` 100% lines / 100% branches; `lib/log.ts` 100% lines / 100% branches.

### Known limitations

- Multi-call-site logger migration scope tight to server actions; client-side `console.warn` / `console.error` in components NOT migrated (orthogonal concern; logger is server-action audit pattern).
- save-profile.ts now goes through `safeHandle` in `commitMessage` but the audit-log payloads still take `handle` (not `safeHandle`) — log payload isn't a commit-injection surface (JSON.stringify defangs newlines per chat-33 security review), so no further migration needed.

---

## [0.5.0] — 2026-05-21 (chat-31 + chat-32 — admin event-creation UI ships; spec §15 + ADR-0015 Accepted)

**First admin write-surface on the platform.** Members already have RSVP / profile edit / status post; v0.5.0 adds admin event creation at `/admin/events/new` — bot commits the event folder to git via the GitHub App. Closes a real Anton-side workflow gap: pre-v0.5, creating an event meant ~5 min on the mobile GitHub web editor (frontmatter typos common); the form takes ~30 sec with Zod validation, live slug derivation, and body preview.

Spec authored in chat-31 (§15, +239 lines); ADR-0015 written via `adr-writer` skill at same SHA `7c3d46f` (Accepted at spec lock per the v0.4 ADR-0014 precedent). Plan via `superpowers:writing-plans` at SHA `bc5e97d` (2447 lines, 35 tasks, 5 phases). Phases 0-3 executed inline in chat-31 (9 commits to `e226b49`); Phase 4 reviewer triage in chat-32 (commit `ef71b7a`).

### Added

- **`/admin/events/new`** (`app/admin/events/new/page.tsx`) — admin-only Server Component page (`force-dynamic` + RBAC redirect gate via `auth()` → `isAdmin()`). Non-admins redirect to `/home`; unauth to `/login`. Renders `<EventForm />` with project defaults loaded server-side via `getDefaults()`.
- **`<EventForm />`** (`app/components/EventForm.tsx`) — controlled client form. Fields: title (required), date (required, today default), startTime, durationMinutes, location, host (default = signed-in admin's handle), url (optional), slug (optional override; live-derived from date+title when blank), body (markdown, 50000-char cap, pre-filled template). Body preview via existing v0.2 `/api/preview-markdown` route + centralized `<SafeHtml />` wrapper (no parallel sanitization surface).
- **`createEvent` server action** (`app/actions/create-event.ts`) — server action with 12 numbered hardenings (H69-H80), 1:1 test-block mapping. RBAC re-verify before I/O; Zod parse with field-level bounds; slug derivation via `deriveEventSlug` + `EventSlugSchema` (regex + calendar-validity refine); snapshot collision check (`listEventsFromSnapshot()`); round-trip parse safeguard via `parseEventFrontmatter`; CRLF strip on session-derived handle; path constraint (slug-branded → no traversal); status hardcoded `"scheduled"` (tier 3 lifecycle deferred); GitHub-level pre-existence guard (`gh.readFile`); H79 revalidate fan-out across `/events`, `/events/[slug]`, `/home`, `/`, `/api/calendar.ics`.
- **`lib/event-author.ts`** — pure compose lib. `composeEventReadme(input)` builds YAML frontmatter + markdown body; `deriveEventSlug(date, title)` produces canonical slug (NFKD + lowercase + alphanumeric strip + space-to-dash + dedup + trim + 60-char cap). Zero I/O imports; 100% lines + branches coverage.
- **`event.create.*` i18n namespace** (`lib/i18n/strings.ts`) — 23 keys for the admin-events-new page + EventForm component. Migrated from inline strings during chat-32 code-reviewer triage (H67 satisfied across all v0.5 surfaces).

### Changed

- **`lib/events.ts`** — exported `normalizeEventFrontmatter` (was function-private; re-used by `create-event.ts` for the H72 round-trip-parse safeguard).

### Security

- **3-lane parallel reviewer dispatch** (chat-32 Tasks 4.1-4.3 on branch HEAD `e226b49`, scope = 5 new files): **0 CRITICAL / 0 HIGH / 6 unique MEDIUM findings**. **5 MEDIUM applied** inline (commit `ef71b7a`): body field via `readField()` helper (security; closes silent File→string coercion); `as Record` cast comment + `buildClient` explicit return type (typescript); page.tsx + EventForm.tsx i18n migration of 21 strings (code; H67); `revalidatePath("/")` H79 doc comment (code). **1 MEDIUM accepted with rationale**: `console.warn`/`console.error` server-action audit pattern matches established convention (save-profile.ts, thank-status.ts, rsvp-event.ts, invitations.ts all use the same `[prefix-tag]` pattern — project-level override of generic TS no-console rule).
- **All 12 hardenings (H69-H80) grep-verifiable** via `describe("H<n>:")` blocks in `tests/unit/create-event-action.test.ts` + `tests/unit/event-author.test.ts`.

### Tests

- **1020/1020 unit+integration green** (978 v0.4.8 baseline + 42 new across 4 v0.5 test files: 13 event-author + 18 create-event + 4 admin-events-new-page + 5 EventForm + 2 preview).
- **Coverage**: `lib/event-author.ts` 100% lines / 100% branches; `app/actions/create-event.ts` 100% lines / 86.66% branches; `app/components/EventForm.tsx` 97.73% lines / 83.87% branches; `app/admin/events/new/page.tsx` 100% lines.
- **E2E happy-path scenario deferred to v0.5.1** per O6 (sandbox-repo decision pending).

### Known limitations

- **Multi-admin slug race** (spec §15.9): two admins creating the same slug within ~1 sec → second sees `internal_error`; retry produces clear `slug_exists`. Acceptable for admin pool ≤3.
- **Tier 2 (edit existing event) deferred to v0.5.1** per ADR-0015; ships as separate `<EventEditForm />` (NOT polymorphic `<EventForm mode>`).
- **Tier 3 (status lifecycle: scheduled → cancelled / completed) deferred to v0.5.2** per ADR-0015; ICS-notification-sensitive surface.
- **Member-proposed events deferred to a future ADR** (own brainstorm; v1.0+ candidate).

### v0.5.1 backlog captured during chat-32 reviewer triage

- `safeHandle` length cap (GitHub 39-char limit currently enforces structurally; add explicit Zod refine for belt-and-suspenders)
- `encodeURIComponent(result.slug)` defensive in `router.push` (EventSlugSchema regex already excludes URL-unsafe chars; cheap DiD)
- Structured logger to replace bare `console.error` around octokit error.message wrap (cross-cuts other server actions; defer until a logger lib is chosen)

### Why no separate v0.5 brainstorm chat

Single-chat seed→spec→ADR→plan→Phase-0-3 execution in chat-31 (vs the v0.4 three-chat sequence) because v0.5 surface is smaller: one new route, one new server action, one new component, no design-shotgun, no user-test session (ADR-0015 inherits the v0.2 `/me/edit` + v0.1.1 `/admin/invite` patterns directly). Token discipline per `feedback_token_discipline` memory.

### Verified

- **CI Lint+typecheck+test+build PASS** pre-merge; Vercel community-platform preview SUCCESS; Vercel gbrain co-deploy SUCCESS. PR #35 `mergeStateStatus: CLEAN`.
- **Anton-side manual smoke on prod** (post-merge): sign in → /admin/events/new → create test event → verify warsaw-ai-bot commit on main + Co-Authored-By trailer + `/events/<test-slug>` renders + `/api/calendar.ics` includes new VEVENT within 5 min → revert test event.

---

## [0.4.8] — 2026-05-20 (chat-30 — flip /events/[slug] to force-dynamic; closes SSG-Header anomaly; PR #34 MERGED at SHA `6ddee8d`; tag `community-platform-v0.4.8` pushed; prod dynamic-page probe green; signed-in flow PENDING Anton's browser test)

**Second SSG limitation surfaced by Anton's chat-30 dogfooding.** After v0.4.7 successfully hydrated the EventRsvpButton client-side (Anton's first RSVP committed to main at `fd6c2e4` — the warsaw-ai-bot wrote `events_going: [2026-05-21-meetup-4]` to his profile), he noticed the Header still showed "Sign in" top-right while the RSVP button worked. Diagnosis: `force-static` on the page propagates to the layout's `<Header />` server component, baking the anon-Header HTML at build time when `auth()` returns null. v0.4.7's hydration could reach the button (client component) but not the Header (server component). Same v0.3.1 deferral as the original RSVP bug — just on a different surface.

**Fix shape**: `/events/[slug]` flipped from `force-static` → `force-dynamic`. Side effect: the Header now reads `auth()` at request time and renders the signed-in chip correctly. Bonus: server-rendering EventRsvpButton with real `initialState` + `profileSha` removes the v0.4.7 hydration flicker on this specific page. The v0.4.7 client hydration stays in place as defense-in-depth.

### Fixed

- **`app/events/[slug]/page.tsx`** — `export const dynamic = "force-dynamic"`. New `loadViewerRsvp(eventSlug)` helper: `auth()` → `findMemberByHandle()` → `gh.readFile("community/members/<slug>.md")` → `parseProfileFrontmatter()` → derive `state` from `events_going`/`events_interested` includes → return `{state, profileSha}`. Returns null on any failure (anon viewer, no roster entry, readFile fails) → button falls back to `"not-signed-in"` and the v0.4.7 hydration kicks in as fallback. Page passes real `initialState` + `profileSha` to EventRsvpButton.

### Added

- **`tests/unit/events-slug-page.test.tsx` (+6 tests)** — signed-in with no/going/interested RSVP all wire correct `initialState` + `profileSha`; signed-in but not-a-roster-member falls back to `"not-signed-in"` without GitHub call; signed-in but `readFile` null also falls back (graceful degrade on API failure); contract guard `expect(page.dynamic).toBe("force-dynamic")` so accidental ISR re-enable fails CI. Pre-existing `vi.doMock` in the `generateStaticParams` test was patched to preserve the dynamic `findMemberByHandle` wiring (so subsequent v0.4.8 tests can configure auth/profile per test through the same shared mocks).

### Verified

- **Tests**: 978/978 unit+integration green (was 972 + 6 new). `pnpm tsc --noEmit` clean. `pnpm lint` clean. CI Lint+typecheck+test+build PASS in 1m20s pre-merge.
- **Prod dynamic-page probe**: `curl -sIS https://warsaw-ai-community-platform.vercel.app/events/2026-05-21-meetup-4` returns `cache-control: private, no-cache, no-store, max-age=0, must-revalidate` + `x-vercel-cache: MISS` + `age: 0` — same H56 posture as `/home`. Vercel-edge `private` injection confirmed; page is now per-request rendered. Playwright anon-snapshot confirms the page still renders correctly for anonymous visitors (Header "Sign in" + body "Sign in to RSVP" link → /login?callbackUrl).

### Verified post-merge (signed-in flow — PENDING Anton's browser)

- **Header server-renders signed-in chip**: Anton signs in → navigates to `/events/2026-05-21-meetup-4` → expects top-right Account dropdown (not "Sign in") on first paint (no flicker).
- **EventRsvpButton server-renders Going state**: because Anton already RSVPed in chat-30 v0.4.7 (`fd6c2e4`), his profile has `events_going: [2026-05-21-meetup-4]` → the page now reads this server-side and renders the button as **✓ Going** (active green) on first paint. No client-hydration flicker on this page anymore.

### Trade-offs

- **Per-request render for `/events/[slug]`** (loses anon edge cache). Discovery posture (ADR-0012/0014) is preserved — page still renders identically for anon visitors, just on the dynamic code path. Acceptable at current community scale; if hot, optimize to snapshot-only state (snapshot already carries `member.profile.data.events_going`) + separate SHA fetch on first interaction only.
- **+1 GitHub API call per signed-in page view** (the `readFile` for SHA). Fine at current scale; ~50-200ms latency per view.

### Why this over Header client-hydration

- Smaller code (~30 LOC vs ~150 LOC for client-hydrating the universal Header).
- Eliminates the flicker on this page entirely (Header AND button render correctly on first paint).
- Affects only `/events/[slug]` — doesn't change Header behavior on every other page.
- The Header-anomaly pattern (SSG page + auth-aware Header) would apply to `/projects/[slug]` and `/meetings/[slug]` too — same fix can be cherry-picked there in v0.5 if/when needed.

---

## [0.4.7] — 2026-05-20 (chat-30 Option B unblock — EventRsvpButton client-side hydration; PR #33 MERGED at SHA `2852827`; tag `community-platform-v0.4.7` pushed; prod hydration probe green; signed-in RSVP click PENDING Anton's browser test)

**Pre-meetup deadline hotfix #2.** Closes the chat-30 Option B blocker discovered during Playwright reconnaissance: signed-in members could not click "Going" on `/events/2026-05-21-meetup-4` — the page showed "Sign in to RSVP" instead, and clicking bounced to `/login` (no global Header), making it look like a logout. Session cookie was actually intact; the button was an SSG stub for every visitor.

**Root cause**: `/events/[slug]` is `force-static` SSG (v0.3.0 O6 lock) — page HTML ships with `EventRsvpButton initialState="not-signed-in"` for every visitor. Per `EventRsvpButton.tsx`, that state renders an `<a href="/login?callbackUrl=…">` element, not a button. Chat-20 (v0.3.0 ship row) flagged this gap as deferred: *"dynamic viewer-state on `/projects/[slug]` + `/meetings/[slug]` ThankButton mounts (currently SSG-safe `not-signed-in` initialState)"*. The events page inherited the same gap. Now closed for events; meetings will follow the same pattern when needed.

### Fixed

- **`app/components/EventRsvpButton.tsx`** — client-side hydration. On mount, when `initialState === "not-signed-in"`, the component fetches `/api/event-rsvp-state?slug=…` and swaps `state` + `profileSha` from the response. Defensive `isHydrationResponse` type guard rejects null, missing fields, wrong state enum, or empty profileSha so API schema drift can't crash or render a half-state. Anonymous visitors receive 307 (proxy) → fetch resolves not-ok → button stays on the Sign-in CTA.

### Added

- **`app/api/event-rsvp-state/route.ts` (new)** — auth-gated GET handler. Reads the signed-in viewer's profile via GitHub App, derives RSVP state from `events_going` / `events_interested`, returns `{ state, profileSha }`. Response codes: 401 not_authenticated, 403 not_a_member, 400 invalid_slug, 404 event_not_found, 500 internal_error. `Cache-Control: private, no-store` so the user-specific payload is never edge-cached. Strict-list 100/100/100/100 (65/65 lines, 21/21 branches).
- **`tests/unit/event-rsvp-state.test.ts` (new, 11 tests)** — auth gates, slug validation (missing / malformed / calendar-invalid / not-in-snapshot), state derivation from frontmatter (`events_going` → `going`, `events_interested` → `interested`, neither → `none`), `readFile === null → internal_error`, Cache-Control header assertion.
- **`tests/unit/EventRsvpButton.test.tsx` (+9 tests, +1 `realFetch` save/restore)** — mount-time fetch with `same-origin` credentials; state-flip to active Going on 200; inactive Going + Interested on `state: "none"`; post-hydration click uses the hydrated profileSha (not the missing prop); 401 keeps the Sign-in CTA; network failure keeps the Sign-in CTA; null body keeps the Sign-in CTA; malformed payload keeps the Sign-in CTA; no double hydration when `initialState !== "not-signed-in"`. Branches restored to 41/41.
- **`vitest.config.ts`** — new route added to `coverage.include` (matches `app/api/preview-markdown/route.ts` precedent).

### Verified

- **Tests**: 972/972 unit+integration green (was 952 v0.4.6 baseline + 11 new route + 9 new hydration). `pnpm tsc --noEmit` clean. `pnpm lint` clean. CI Lint+typecheck+test+build PASS in 1m13s pre-merge.
- **Coverage**: `app/api/event-rsvp-state/route.ts` at 100/100/100/100 (65/65 lines, 21/21 branches); `app/components/EventRsvpButton.tsx` branches at 41/41 (restored after the defensive guards).
- **Prod hydration probe (Playwright, anonymous)**: navigated to `/events/2026-05-21-meetup-4`; network panel confirms the new client bundle fired `GET /api/event-rsvp-state?slug=2026-05-21-meetup-4` on mount, received 307 (proxy redirect to /login because no session), client correctly early-exited and kept the Sign-in CTA. Proves the v0.4.7 client code is shipped + the wiring is intact.

### Verified post-merge (signed-in flow — PENDING Anton's browser)

- **Signed-in RSVP click**: Anton signs in as `anton1rsod` → navigates to `/events/2026-05-21-meetup-4` → expects "Sign in to RSVP" for ~100-300ms (SSG render before hydration), then Going + Interested toggle buttons appear. Click Going → expects optimistic green ✓ Going + server-action commit on main updating `community/members/anton1rsod/profile.md events_going` + prebuild surfaces `event-rosters.json` entry. STATE row to be back-filled with browser-side evidence after the test.

### Trade-off documented

- **Brief flicker (~100-300ms)** where signed-in users see "Sign in to RSVP" before the button hydrates to Going/Interested. Acceptable for v0.4.7 hotfix; mitigation deferred to v0.5 (skeleton placeholder via `useState<undefined>` for the loading state).

### Why this over `force-dynamic` on the page

- Keeps the event page cacheable for anonymous visitors (the ADR-0012 / ADR-0014 discovery posture). Only signed-in users pay the small round-trip on mount. Same pattern reusable for `/meetings/[slug]` ThankButton + `/projects/[slug]` viewer-state surfaces in v0.5+.

---

## [0.4.6] — 2026-05-20 (chat-30 Option A — ICS timezone hotfix; PR #32 MERGED at SHA `9f6d1a6`; tag `community-platform-v0.4.6` pushed; prod smoke green)

**Pre-meetup deadline hotfix.** Closes the v0.4.5 Known caveat: `/api/calendar.ics` on production emitted `DTSTART:20260521T190000Z` (treated as 19:00 UTC = 21:00 Warsaw CEST) instead of the intended `DTSTART:20260521T170000Z` (17:00 UTC = 19:00 Warsaw). User impact: ICS subscribers seeing the meetup 2 hours late. Root cause analysis is in `[0.4.5] § Known caveat` — the `ics` package's default `startInputType: 'local'` interpreted the wall-clock tuple as the build host's local time, and Vercel runs UTC.

### Fixed

- **`lib/ical.ts`** — `IcsEvent` gains a required `tz: string` field (IANA timezone). New `wallClockInTzToUtcParts` helper uses `Intl.DateTimeFormat({timeZone: tz})` (V8 ICU bundle → full IANA TZ database, DST-aware, no `process.env.TZ` dependence) to convert wall-clock `[y, mo, d, h, m]` → UTC tuple. `generateIcs` now passes `startInputType: "utc"` so the `ics` package no longer applies host-local conversion. `meetingToIcsEvent` and `eventToIcsEvent` populate `tz` from `defaults.timezone` automatically — the same fix covers both event and meeting paths (both call `dateToIcsParts`, both now wired through the new conversion at the `generateIcs` boundary).

### Added

- **`tests/unit/ical.test.ts`** — new describe block `v0.4.6: ICS DTSTART output is TZ-independent (build-host-agnostic)` (+6 tests, +1 `withTz` helper). Coverage:
  - **Byte-identical TZ-independence**: `withTz("UTC")` and `withTz("Europe/Warsaw")` runs against the Meetup #4 fixture produce identical `DTSTART:20260521T170000Z`. Canonical regression guard — pre-fix it failed because the two host TZs produced divergent output.
  - **DST awareness**: a winter event (`2026-01-15 19:00 Europe/Warsaw`) emits `DTSTART:20260115T180000Z` (CET = UTC+1), not the CEST +2h offset. Wrapped in `withTz("UTC")` to force Vercel build-host context (a CEST dev machine would coincidentally produce correct output without the fix, masking the regression).
  - **UTC identity**: `tz: "UTC"` events produce wall-clock = UTC literal (no shift).
  - **Foreign TZ flow**: `tz: "Asia/Tokyo"` (UTC+9, no DST) on `eventToIcsEvent` flows through and produces `DTSTART:20260521T100000Z` for a 19:00 Tokyo wall-clock.
  - **Wiring**: `eventToIcsEvent` and `meetingToIcsEvent` populate `tz` from `CommunityDefaults.timezone`.

### Verified

- **Tests**: 952/952 unit+integration green (was 946 + 6 new). `pnpm tsc --noEmit` clean. `pnpm lint` clean.
- **Generated artifact**: `lib/__generated__/calendar.ics` regenerated locally — `DTSTART:20260521T170000Z` (DTSTAMP-only diff committed; the DTSTART value was coincidentally correct pre-fix on a CEST host but wrong on Vercel UTC). Empirical TZ-independence confirmed: `TZ=UTC pnpm tsx scripts/build-calendar.ts` produces identical `DTSTART` line.

### Verified post-merge (prod smoke — GREEN)

- **`/api/calendar.ics` on production** — `curl -sIS https://warsaw-ai-community-platform.vercel.app/api/calendar.ics` returns `HTTP/2 200` + `content-type: text/calendar; charset=utf-8` + `cache-control: public, max-age=300` + `x-vercel-cache: MISS` (correctly never edge-cached on this fresh deploy at SHA `9f6d1a6`). Body emits `DTSTART:20260521T170000Z` — the corrected 17:00 UTC = 19:00 Warsaw CEST literal. The 300s public-cache TTL means any subscriber who already pulled the buggy version auto-recovers within 5 minutes; no manual action needed from members. CI green (Lint+typecheck+test+build PASS in 1m26s) pre-merge.

### Surface contract change

- **`IcsEvent.start` semantics**: stays as wall-clock tuple `[YYYY, M, D, H, m]`. Previously implicitly "wall-clock in the build host's TZ"; now "wall-clock in the `tz` field" — conversion to UTC happens at the `generateIcs` boundary. Callers using `meetingToIcsEvent`/`eventToIcsEvent` (all production callers — `app/meetings/[slug]/page.tsx`, `app/events/[slug]/page.tsx`, `scripts/build-calendar.ts`) need no change; tests that construct `IcsEvent` literals directly must now include `tz`.

### Not in this release

- TZID-aware VEVENT emission (Option 1 in the chat-30 handoff). The `ics` package's TZID support is limited; pre-converting to UTC produces the same calendar-app behavior (subscribers see correct local time on their device) with simpler output and no `BEGIN:VTIMEZONE` block to maintain. If a future case needs to preserve "this is at 19:00 Warsaw" semantics in the wire format (e.g., users relocating mid-event between TZs), revisit.

---

## [0.4.5] — 2026-05-20 (chat-29 I+J bundle — first real event seed surfaces + fixes v0.3.0 silent regression; PR #31 MERGED at SHA `78cb58e`; tag `community-platform-v0.4.5` pushed; prod smoke green)

**Anton-confirmed chat-29 compound pick (I+J) expanded mid-chat into a v0.3.0 silent-regression fix.** Original scope: seed first real event (`community/events/2026-05-21-meetup-4/` — AI Community Meetup #4, 2026-05-21 19:00 Europe/Warsaw at Grzybowska 85a, Warsaw) and exercise the YourWeekPane data path. Recon surfaced that `scripts/snapshot-content.ts` never wired `community/events/` into `content-snapshot.json` — all 20+ consumers of `listEventsFromSnapshot()` (`/events`, `/events/[slug]`, `/api/calendar.ics`, `/home`, `/this-week`, RSVP write surface, YourWeekPane, AnonymousHero "Next event") returned `[]` always since v0.3.0 ship 2026-05-17. The empty-state path rendered correctly because no events were ever committed, so the silent regression survived 3 days (v0.3.0 → v0.4.4) until the first real event commit surfaced it.

### Fixed (root-cause regression)

- **`scripts/snapshot-content.ts`** — read `community/events/` into the snapshot via new `listEventsFromDisk(REPO_ROOT)`. Promise.all + snapshot object key + log line. Mirrors the meetings precedent (line 8 + 31-38 pattern).
- **`lib/events.ts`** — add `listEventsFromDisk(repoRoot: string): Promise<Event[]>` (+~50 LOC). Reads each event folder's `README.md`, normalizes snake_case frontmatter (`start_time` → `startTime`, `duration_minutes` → `durationMinutes`) to camelCase Event field names, coerces YAML auto-parsed `Date` objects back to ISO date strings (js-yaml's DEFAULT_SCHEMA converts unquoted `date: 2026-05-21` to a Date), validates via existing `parseEventFrontmatter` (Zod `EventSchema` + folder/slug match). Sort ascending by date. ENOENT-safe for missing `community/events/` dir and missing per-folder `README.md`. Mirrors `lib/meetings.ts`'s `listMeetingsFromDisk` pattern exactly.
- **`lib/content-snapshot.ts`** — add `events: readonly Event[]` field to `ContentSnapshot` interface (now structurally complete vs the bag-of-other-entities shape). Drop the defensive `((snapshot as unknown as { events?: readonly Event[] }).events ?? [])` cast in `listEventsFromSnapshot` — direct `snapshot.events` read. The snapshot const cast moves from `as ContentSnapshot` to `as unknown as ContentSnapshot` (with explaining comment) because JSON.parse cannot preserve Zod brand markers (`EventSlug` is `string & BRAND<"EventSlug">`). Runtime values are real branded strings because they pass through `EventSchema.parse` during snapshot generation, but the type system can't prove it across the JSON-roundtrip boundary. Other entity types (RosterMember/ProjectDetail/Decision/Meeting) avoid this because they don't use Zod-branded slugs.

### Added

- **`tests/unit/events-from-disk.test.ts`** — 11 new unit tests using `mkdtemp` fixtures for isolation. Coverage: missing dir → `[]`, empty dir → `[]`, single event with minimal frontmatter (Date coercion path), snake_case → camelCase mapping, `_template` folder skip, non-directory entry skip, ascending date sort across multiple events, folder/slug mismatch throws (H44 propagation), missing required fields throws (Zod), `status` field default + override (cancelled/completed), subfolder files (`artifacts/`) ignored.
- **`community/events/2026-05-21-meetup-4/README.md`** — first real event committed to the public repo. Frontmatter: `date`, `slug`, `title`, `start_time: "19:00"`, `duration_minutes: 120`, `location: "Grzybowska 85a, Warsaw"`, `host: anton1rsod`, `status: scheduled`. Body: 4-item agenda (Persona setup / NDA signing / Idea round / Validation skill) + when/where. Public-safe (no `@`-handles, no private Telegram channel links) per CLAUDE.md member-consent operating principle.
- **`projects/community-platform/V0_5_BACKLOG.md`** — new section `## From chat-29 (first real event seed — 2026-05-20)` with Option β entry: `/admin/events/new` admin event-creation UI as the v0.5+ candidate that surfaced from this exercise. Pattern precedent: `/admin/invite` (chat-9). ~1 wk dev + tests + ADR for write-permission model. Member-proposed events (Option γ) explicitly deferred — too large for backlog one-liner; needs own brainstorm (governance, permissions, spam risk, moderation flow).

### Verified

- **CI**: `Lint, typecheck, test, build` PASS in 1m22s on PR #31. Vercel previews complete (warsaw-ai-community-platform + warsaw_ai_community_gbrain).
- **Tests**: 946/946 unit+integration green (935 prior + 11 new). `pnpm tsc --noEmit` clean. `pnpm lint` clean.
- **Generated artifacts regenerated locally + committed** per CONSTRAINTS.md `Generated artifacts` section discipline:
  - `lib/__generated__/calendar.ics`: 0 → 1 `VEVENT` block for Meetup #4. `DURATION:PT120M`. (Build-host TZ caveat below.)
  - `lib/__generated__/contributions.json` + `project-contributions.json`: prebuild drift (+1 commit each, from `pnpm contributions` runs during test gate).
  - `lib/__generated__/content-snapshot.json` is gitignored; Vercel regenerates via `prebuild` → `contributions` → `precontributions` → `snapshot`.
- **Prod HTTP smoke (curl, post-merge)** vs `https://warsaw-ai-community-platform.vercel.app`:
  - `/api/calendar.ics` → HTTP/2 200 with `text/calendar; charset=utf-8`, `cache-control: public, max-age=300`, `x-vercel-cache: MISS`, **1 `BEGIN:VEVENT` block** for Meetup #4. (Timezone caveat below.)
  - `/events` index → HTTP/2 200 with `Upcoming`, `2026-05-21`, `AI Community | Meetup #4` markers present in markup. First real event now surfaces in the Upcoming section.
  - `/` AnonymousHero → HTTP/2 200; `aria-label="Next event"` slot now reads `AI Community | Meetup #4` + `2026-05-21` instead of the prior `"No upcoming events — next weekly sync is Wednesday at 18:30."` empty-state. The clean before/after observable promised at chat-29 start landed.
  - `/events/2026-05-21-meetup-4/` (with trailing slash) → HTTP/2 308 → `/events/2026-05-21-meetup-4` (Next.js trailing-slash redirect; normal behavior).

### Known caveat — chat-30 Option A (v0.4.6 hotfix candidate)

- **ICS timezone bug** — `lib/__generated__/calendar.ics` on production emits `DTSTART:20260521T190000Z` (19:00 UTC = 21:00 Europe/Warsaw CEST), but the intended event time is 19:00 Warsaw = 17:00 UTC = `DTSTART:20260521T170000Z` (which is what `pnpm snapshot` produced locally on the chat-29 author's CEST machine). Root cause: `lib/ical.ts`'s `dateToIcsParts(dateISO, hhmm)` returns a 5-element `[y, mo, d, hh, mm]` tuple that the `ics` package interprets as the **build host's local timezone**. Vercel builds run UTC → tuple gets serialized as UTC literal; my local CEST → tuple gets shifted by -2h to UTC. **User impact: anyone subscribed to `/api/calendar.ics` via their calendar app sees the meetup at 21:00 Warsaw instead of 19:00 Warsaw.** Wide enough impact to warrant a v0.4.6 hotfix before tomorrow's 19:00 meetup. Recommended fix shape: use the `ics` package's `startInputType` + emit a TZID-aware VEVENT (`startInputType: 'local'` + `TZID:Europe/Warsaw` block) OR pre-convert Warsaw local to UTC explicitly using a TZ-aware library. Same bug affects `meetingToIcsEvent` (line 29 of `lib/ical.ts`) — meetings would have the same problem once any meeting is scheduled. Captured as chat-30 handoff Option A. Anti-pattern note: the bug was carried by v0.3.0 (chat-19, 2026-05-17) but only surfaced now because zero events existed in any prior build.

### Not in this release (deferred to chat-30+)

- **Anton-side I+J completion (signed-in flow smoke + first RSVP)** — chat-29 closed the data-path validation HTTP-side (events visible on `/events`, `/api/calendar.ics`, AnonymousHero), but the actual member RSVP that exercises YourWeekPane "next RSVP" remains pending Anton's browser session. Chat-30 handoff Option B.
- **A** (PWA textured "WA" icons — still blocked on tooling per chat-26/27/28; offline designer pass needed).
- **F** (Phase B activation gate — window opens 2026-05-25; needs 7d landing data post-window).
- **M** (Vercel preview-protection bypass token — recommend SKIP unless feature requires pre-merge edge-behavior verification).

### Note on commit hygiene

- **PR #30 v0.4.4 merge** — confirmed `community-platform-v0.4.4` tag at SHA `5c6ac94e` (PR #30 merge commit). Updates the `[0.4.4]` header's `merge SHA TBD` notation (stale at chat-28 closeout since `d9eaeda` was authored on the branch pre-merge); kept the header's PRE-MERGE text untouched per "don't retroactively rewrite history" hygiene, but the v0.4.4 ship is canonically the `5c6ac94` merge commit.

---

## [0.4.4] — 2026-05-20 (chat-28 Option D — reviewer-agent dispatch on v0.4.0–v0.4.3 surfaces; PR #30 MERGED at SHA `5c6ac94` 2026-05-20; tag `community-platform-v0.4.4` pushed)

**v0.4.x patch — chat-28 Option L tag bumps + Option D reviewer-fix bundle.** Three parallel reviewer agents (security + typescript + code-quality) ran on the 18 code files changed in the `e720268..main` (v0.3.1 → v0.4.3) diff range. 25 findings returned across the three lanes; cross-lane convergence triage applied (e.g., HomeFeed `escapeHtml` flagged by ALL THREE reviewers = high-confidence bug). 14 findings applied; 4 intentionally skipped (1 false positive, 3 design-call deferrals). Branch: `chore/community-platform-v0-4-3-reviewer-fixes`. Tests: **935/935 unit+integration green** (was 934 chat-26 baseline + 1 new escapeHtml-removal regression test).

### Fixed (real bugs — would have manifested in production)

- **`app/components/HomeFeed.tsx`** — drop the `escapeHtml(s)` helper that ran HTML-entity encoding BEFORE React's auto-escape on JSX text children, producing double-encoded entities in visible text (e.g., `"O'Brien"` rendered as literal `O&#39;Brien` on screen). The bug was hidden by an empty content snapshot on production (`event-rosters.json` is `{}`); the first real meeting/event/status with a title containing `&`, `<`, `>`, `'`, or `"` would have made it visible. All three reviewer lanes (security LOW, typescript LOW, code-quality MEDIUM) independently flagged this — high-confidence convergence.
- **`app/page.tsx`** — replace `listEventsFromSnapshot() as unknown as { date: string; slug: string; title: string; body: string }[]` with explicit `.map((e) => ({ date: e.date, slug: e.slug, title: e.title, body: "" }))`. The double-cast hid that v0.4 `Event` records have no `body` field; `home-feed.ts` `eventToFeedItem` calls `e.body.split('\n')` for excerpt extraction, which would have thrown `TypeError: Cannot read properties of undefined (reading 'split')` on the first real event commit. Body genuinely doesn't exist in the v0.4 schema (events are calendar entries, not articles), so `body: ""` yields `excerpt: undefined` downstream (empty-string split returns `[""]` which fails the `.find(l => l.trim())` check) — semantically honest.
- **`app/components/AnonymousHero.tsx`** — remove unnecessary `async` keyword + change return type from `Promise<React.JSX.Element>` to `React.JSX.Element`. There were zero `await` expressions in the body; Next.js 16's App Router forces async components onto the async render path on every request even when there's no actual async work to do. TypeScript reviewer rated HIGH because of the silent perf degradation under load.
- **`app/components/DateTime.tsx`** — change `if (!duration) return start;` to `if (duration == null || duration <= 0) return start;`. The pathological `durationMinutes={0}` case (`0` is falsy) silently fell through the no-duration branch instead of being rejected/handled as a data error.

### Changed (type safety + maintainability)

- **`app/components/AnonymousHero.tsx`** — replace `href={... as never}` with `href={... as Route}` (Next 16 typed routes). `as never` widens to the bottom type and silently suppresses all future type errors at the call site.
- **`app/components/Avatar.tsx`** — change `import { strings }` (raw map; bypasses the `StringKey` union check at call sites) to `import { s }` (typed helper). Export `AvatarSize` type for downstream coupling.
- **`app/components/ListItem.tsx`** — import `AvatarSize` from `Avatar.tsx` instead of duplicating the `20 | 24 | 32 | 40 | 96` union literal. Prevents the two definitions from drifting if `Avatar` adds a new size.
- **`app/components/HeaderMobileMenu.tsx`** + **`app/components/Header.tsx`** — drop the unused `signedIn` prop from `HeaderMobileMenuProps` interface, destructuring, and the call site in Header. The prop was destructured as `_signedIn` (acknowledging the suppression) and did nothing — false-contract maintainability hazard.
- **`app/components/HomeFeed.tsx`** — wire `s("home.thisWeek.heading")` + `s("home.recent.heading")` (H67 compliance — the literal "This Week" / "Recent" strings were hardcoded while the matching i18n keys existed unused). Remove `dark:text-neutral-400` and `dark:divide-neutral-800` Tailwind classes (no `darkMode` key in `tailwind.config.ts`; the classes were either always-inactive or remnants from a copy-paste — code-quality reviewer LOW). The empty-state JSX with embedded anchor links stays inline since `lib/i18n/strings.ts` comment explicitly defers ICU-MessageFormat composition to v0.5+ next-intl.
- **`app/components/YourWeekPane.tsx`** — wrap `nextRsvp.date` (rendered as raw ISO string `2026-05-28`) in `<DateTime iso={nextRsvp.date} context="list" />` for consistency with the other date surfaces.
- **`lib/your-week.ts`** — ternary sort comparator `(a.date < b.date ? -1 : a.date > b.date ? 1 : 0)` → `a.date.localeCompare(b.date)`. Idiomatic for `YYYY-MM-DD` ISO strings.
- **`app/page.tsx`** — add explicit `export const dynamic = "force-dynamic"`. The route was already dynamic in practice (calls `auth()` which reads cookies), but stating the intent makes the H56 `Cache-Control: private` posture regression-proof against future refactors that extract the anonymous branch above the auth check.

### Removed

- **`lib/i18n/strings.ts`** — drop 5 unused keys with no consumers anywhere in the codebase (grep-verified): `home.title`, `home.thisWeek.empty` (didn't match JSX — JSX has embedded anchor link, string did not), `home.recent.empty` (same mismatch), `calendar.past`, `calendar.empty` (no consumer; no Phase-C annotation). `footer.rss` retained (documented as Phase C deferred).

### Added

- **`tests/unit/HomeFeed.test.tsx`** — new regression test `Reviewer-fix regression: no double-encoding (chat-28 escapeHtml removal)` asserting that titles, excerpts, and authors containing `&`, `<`, `>`, `'`, `"` (e.g., `"O'Brien & company <em>"`, `"5 < 10 & 6 > 4"`, `"anton's-handle"`) render with the literal characters in `container.textContent` and NEVER contain `&#39;`, `&amp;`, `&lt;`, `&gt;`, or `&quot;` markers. XSS safety preserved (`querySelector("script")` + `querySelector("em")` both null). The existing H43 test (`script in title is escaped`) used an OR regex that passed regardless of whether `escapeHtml` was present; the new test fails specifically when double-encoding is reintroduced.

### Also (Option L tag bumps)

- Pushed lightweight tags `community-platform-v0.4.2` → `91f772f` (PR #26 merge SHA) and `community-platform-v0.4.3` → `52b60a6` (PR #28 merge SHA) at chat-28 start. Visible on https://github.com/anton1rsod/warsaw-ai-community/releases under the Tags subsection. `gh api repos/anton1rsod/warsaw-ai-community/git/refs/tags/...` round-trips clean on both. Tag-style note: v0.4.0 is annotated (carries `^{}` peeled ref); v0.4.1/2/3 are lightweight. Inconsistency tolerated — chat-25 created v0.4.0 via UI; chat-26/27/28 used CLI lightweight push.

### Skipped (intentional triage)

- **security-reviewer Finding #1 (MEDIUM)** — `proxy.ts:205` x-pathname allegedly missing on `/consent` redirect path. False positive: redirects don't render shells; the subsequent request to `/consent` goes through `proxy.ts` again, hits `PUBLIC_PATHS.has("/consent")` on line 202, and sets `x-pathname` to `/consent` on line 204. Verified by code-read.
- **typescript-reviewer Finding #3 (MEDIUM)** — kudosJson Zod schema validation. Deferred — broader refactor touching the kudos generation pipeline; v0.5+ scope.
- **code-reviewer Finding #10 (LOW)** — HomeFeed emoji literals (`📅 🎟 ✍ 🛠`) as inline `TypeIcon` strings. Design call; `aria-hidden="true"` wrapper makes them a11y-correct; v0.5+ next-intl migration concern.
- **security-reviewer Finding #4 (LOW)** — `app/page.tsx:56` `from` redirect logic sources from Referer query param (unreachable in practice). Design call (remove vs implement properly with current-request `searchParams`); deferred.

### Verified

- `pnpm tsc --noEmit` clean (no output).
- `pnpm lint` clean (ESLint pass; prelint regenerated `__generated__` artifacts).
- `pnpm test` **935/935 green across 95 files** in 8.83s (was 934 at chat-26 baseline; +1 from new HomeFeed regression test). One pre-existing jsdom navigation stderr from `AddToCalendarButton.test.tsx` (unrelated; known jsdom limitation when components call `Window.navigate`).
- `lib/__generated__/contributions.json` + `project-contributions.json` updated by +1 commit count each (anton1rsod's natural drift from chat-26/27 closeouts); committed per chat-26 Option H + CONSTRAINTS.md `Generated artifacts` section discipline.
- **CI verification (Lint+typecheck+test+build + Vercel preview): in progress at commit time; PR #30 will mark ready post-CI; production a11y E2E re-run scheduled post-merge to confirm zero regression on the chat-27 7/7 baseline.**

### Not in this release (deferred to chat-29 or v0.5+)

- A (PWA textured "WA" icons — still blocked locally on chat-28 host: `which magick` / `which convert` / `npm ls sharp` / `npm ls canvas` all empty. Realistic call: offline designer pass via Figma/Photoshop export → commit PNGs, rather than installing 30MB+ of native binaries as a dev dep for a one-time icon-gen script).
- F (Phase B activation gate — D44 lock requires 7-day post-ship landing-data window; v0.4.0 shipped 2026-05-18 so window opens 2026-05-25 — chat-29's earliest).
- I (Anton-side signed-in flow smoke checklist — requires browser session: sign in as `anton1rsod`, verify `/home` YourWeekPane shows real data after RSVP'ing an event, `?from=/calendar` round-trip, dropdown 4-item shape, mobile hamburger).
- J (first real event RSVP to exercise YourWeekPane data path — Anton seeds `community/events/2026-06-XX-some-meetup/`, commits, redeploys, RSVPs via `/events/<slug>`, confirms YourWeekPane shows next-RSVP commitment. End-to-end loop closure; would also have exercised the `app/page.tsx` event-mapper change in real production HTML).
- M (Vercel preview-protection bypass token — recommend SKIP unless an upcoming feature needs pre-merge edge-behavior verification; chat-27 production-URL pattern is sufficient as canonical confirmation).
- Tag decision for `community-platform-v0.4.4` — Anton's discretion post-merge; mirrors v0.4.1/2/3 lightweight tag-push precedent.

---

## [0.4.3] — 2026-05-19 (chat-27 Option C — HomeFeed → DateTime consolidation; PR #28 MERGED at SHA `52b60a6` 2026-05-19T07:50:43Z; production a11y gate 7/7 GREEN post-deploy)

**v0.4.x refactor — chat-27 Option C from the chat-26 menu.** Consolidates two near-identical `relativeDate()` helpers (HomeFeed.tsx's inline copy + DateTime.tsx's i18n-aware version) into a single `<DateTime context="list">` mount in HomeFeed. Branch: `chore/community-platform-v0-4-2-followup-c-homefeed-datetime`. Tests: 934/934 unit+integration green (zero delta — no date-format strings asserted in any test fixture; HomeFeed.test.tsx and home-feed.test.ts assert on titles/excerpts/authors/structure only).

### Changed

- **`app/components/HomeFeed.tsx`** — drop the v0.3-era inline `relativeDate(iso, now)` helper (was lines 13-26 in v0.4.2); import `<DateTime>` from `./DateTime`; replace the two render sites (`ThisWeekItem` `<div>` body + `RecentItem` trailing `<span>`) with `<DateTime iso={item.date} context="list" />`. Net -14 lines. The two `relativeDate()` implementations were semantically identical (same date math, same string outputs); the only delta the migration introduces is that the output now ships inside `<time dateTime={iso} title={absoluteDate(iso)}>` semantic markup (hover reveals absolute date — pure accessibility upgrade), and the "Today"/"Tomorrow"/"Yesterday"/"d ago" tokens flow through `lib/i18n/strings.ts` (H67-compliant; one canonical source of these strings instead of two).

### Verified

- Targeted suite (`HomeFeed.test.tsx` + `home-feed.test.ts` + `home-page.test.tsx` + `this-week-page.test.tsx`): 41/41 green in 1.3s.
- Full suite: **934/934 green in 11.56s** — exact same count as v0.4.2 baseline, confirming pure refactor.
- `tsc --noEmit` + `eslint app/components/HomeFeed.tsx` + `pnpm h67:scan` all green.
- **Post-merge production a11y E2E re-run — `PLAYWRIGHT_BASE_URL=https://warsaw-ai-community-platform.vercel.app pnpm e2e e2e/v0-4-a11y.spec.ts` returned 7/7 GREEN in 3.5s** against production HEAD `52b60a6`. Confirms zero axe regression from the `<time>` element addition (axe doesn't flag `<time dateTime title>` markup, even with the new `title` hover-reveal pattern).
- **Visual probe blocked by empty feed.** The HomeFeed migration is structurally undetectable in prod HTML right now because `event-rosters.json` is `{}` (no events on prod yet) — `Nothing scheduled` / `No recent activity` empty states render instead of `<time>` elements. Verified by tests + CI + prod a11y rather than by prod HTML diff. Option J (first real event RSVP) would exercise the path end-to-end.

### Not in this release (deferred to chat-28 or v0.5+)

- A (PWA textured "WA" icons — confirmed ImageMagick/sharp not locally installed on the chat-27 host: `which magick` / `which convert` / `npm ls sharp` all empty).
- D (reviewer-agent dispatch — token-heavy; batches better with v0.5+).
- F (Phase B activation gate — D44 lock requires 7-14 days of post-ship landing data; v0.4.0 shipped 2026-05-18 so window opens earliest 2026-05-25).
- G (typescript-reviewer tech-debt sweep — true nits, no production impact).
- I (Anton-side staging smoke checklist — requires signed-in browser session).
- J (first real event RSVP to exercise YourWeekPane data path — requires Anton to seed an event under `community/events/`).
- Tag decisions for `community-platform-v0.4.2` and `community-platform-v0.4.3` — Anton's discretion, mirrors chat-26 v0.4.1-tag-bump-optional pattern.

---

## [0.4.2] — 2026-05-18 (chat-27 follow-up; PR #26 MERGED at SHA `91f772f` 2026-05-18T20:30:50Z; production a11y gate 7/7 GREEN)

**v0.4.x patch — chat-27 Option K only (a11y baseline regressions).** Closes the chat-26 [0.4.1] "Surfaced" carry-over: 6 of 7 anon-public surfaces had failed `e2e/v0-4-a11y.spec.ts` against production on two pre-existing v0.4.0 serious axe-core violations. Branch: `chore/community-platform-v0-4-2-followups`. Tests: 934/934 unit+integration green (no delta — Footer test passes via the existing `if (slot)` guard authored in v0.4 anticipating this cleanup; AnonymousHero test queries by role/href, never className). Other residual options (A / C / D / F / G / I / J from chat-27's menu) deferred to chat-28 or v0.5+.

### Fixed

- **`aria-prohibited-attr` violation on every anon-public surface** (`app/components/Footer.tsx`) — drop `aria-label="Language"` from the empty `<div>` reserved as a v0.5+ next-intl placeholder. Axe rule: `aria-label` requires a valid role on a generic `<div>`. The slot itself (div + className) stays as the third flex child so `justify-between` keeps positioning the copyright at left and the link strip at center; v0.5 next-intl re-adds the label once a real labelled control mounts in this slot. Unit test `tests/unit/components/footer.test.tsx` "slot exists but is empty in v0.4" continues to pass via its `if (slot)` guard (the v0.4 author hedged for exactly this cleanup).
- **`color-contrast` violation on `/`** (`app/components/AnonymousHero.tsx`) — primary CTA `bg-accent-500` + `text-white` (~2.15:1; fails WCAG AA 4.5:1) flipped to `bg-accent-500` + `text-neutral-900` (~8.35:1 AAA on base; ~5.63:1 AA on `hover:bg-accent-600`). Preserves D33 "warm amber prominent" intent — the bright amber bg stays dominant; only the text color inverts. Matches the `text-neutral-900` treatment already used elsewhere in this same component (`<aside>` next-event title + `<h1>` headline). Considered and rejected: darker `bg-accent-700` + white text would have required a second hover-color change (`white` on `bg-accent-600` is only ~3.19:1, also AA-fail), so the text-flip is strictly the smaller patch.

### Changed

- **`lib/__generated__/contributions.json` + `project-contributions.json`** — re-synced post-merge of YourWeekPane (chat-26 `11e8a36`) + the v0.4.2 a11y fix; `anton1rsod` projectCommits 305→307; `community-platform` commits 256→258. Mirrors chat-26's `6ba3033` pattern (the snapshot lags real count by 1 — its own commit — per Option H accepted invariant).

### Verified

- **Local dev-server a11y baseline — `pnpm e2e e2e/v0-4-a11y.spec.ts` returned 7/7 GREEN in 8.1s** at branch HEAD `173b591`. All 7 surfaces (`/`, `/home`, `/calendar`, `/handbook`, `/login`, `/events`, `/meetings`) cleared axe-core's serious-violations gate. Dev server emits identical DOM to Vercel edge for these static-rendered surfaces (the only edge-injected divergence is the H56 Cache-Control `private` header, which the a11y spec does NOT check), so the local 7/7 is strong evidence the post-merge production E2E will also be 7/7.
- **Production a11y baseline — `PLAYWRIGHT_BASE_URL=https://warsaw-ai-community-platform.vercel.app pnpm e2e e2e/v0-4-a11y.spec.ts` returned 7/7 GREEN in 3.7s** against production HEAD `91f772f` (PR #26 merge SHA). Vercel auto-deploy completed within ~30-40s of merge at 2026-05-18T20:30:50Z; production response headers confirmed: `cache-control: private, no-cache, no-store, max-age=0, must-revalidate` (H56 — Vercel edge `private` injection) + `x-vercel-cache: MISS`. All 7 anon-public surfaces clear axe-core's serious-violations gate. STATE.md `v0_4_2_a11y_baseline` row updated with this canonical confirmation.
- **Vercel SSO finding (chat-28+ relevant):** PR previews on this team are globally SSO-protected — probed `https://warsaw-ai-community-platform-git-ch-32744e-…vercel.app/` returned 401 "Authentication Required". For any future axe / cache / edge-behavior gate that requires browser-driven verification, the canonical strategy is **prod-URL Playwright runs post-merge**, not preview-URL pre-merge. Pre-merge confidence comes from local dev-server runs (also 7/7 green in 8.1s at branch HEAD `173b591` in this release). Mint a Vercel protection-bypass token only if pre-merge preview Playwright becomes necessary.

### Not in this release (deferred to chat-28 or v0.5+)

- A (PWA textured "WA" icons — still needs local ImageMagick / sharp).
- C (HomeFeed `relativeDate()` → `<DateTime context="list">` migration).
- D (reviewer-agent dispatch — batched with v0.5+ per `feedback_token_discipline`).
- F (Phase B activation gate — D44 lock requires 7-14 days of post-ship landing data + user-test session before flipping).
- G (typescript-reviewer-flagged tech-debt sweep).
- I (Anton-side staging smoke checklist beyond the a11y baseline).
- J (first real event RSVP to exercise the YourWeekPane data path).

---

## [0.4.1] — 2026-05-18 (chat-26 follow-ups; PR pending Anton review)

**v0.4.x patch — selected follow-ups from chat-25's 8-option menu.** Anton picked the recommended **B + E + H** bundle. Other options (A / C / D / F / G) deferred to chat-27 or v0.5+. Branch: `chore/community-platform-v0-4-1-followups`. Tests: 934/934 unit+integration green (+9). Coverage: 88.69% lines / 92.97% branches (+0.10 / +0.08 vs v0.4.0).

### Added

- **`lib/your-week.ts`** (Option B / O9 wire-up) — pure compute function `computeYourWeek({ goingSlugs, events, kudosRecent, now }) → { nextRsvp, kudosWeekCount }`. Mirrors the home-feed.ts pattern (pure compute lib + I/O glue in page.tsx). Coverage 100% lines / 93.75% branches / 100% functions.
- **`tests/unit/your-week.test.ts`** — 9 tests covering soonest-upcoming, empty `goingSlugs`, all-past events, today-inclusive boundary, unknown-slug filter, week-boundary kudos count (Mon + Sun edges), empty kudos, Sunday-UTC `dayOfWeek=0` edge case.
- **`CONSTRAINTS.md` — `Generated artifacts (lib/__generated__/*)` section** (Option H) — documents the deterministic-but-data-dependent regen pattern: artifacts are committed (per v0.3 O2 lock) and rebuilt by `pnpm contributions` via `prebuild` / `prelint` / `pretest` / `pre*` hooks. Drift on every fresh checkout is data-dependent (new commits, ADRs, branches); resolution = commit the fresh snapshot.
- **`CONSTRAINTS.md` — Staging E2E targeting rule** (Option E) — documents `PLAYWRIGHT_BASE_URL=https://warsaw-ai-community-platform.vercel.app pnpm e2e <spec>` for running suites against production. Required for H56 Cache-Control `private` verification (Vercel-edge-only).

### Changed

- **`app/home/page.tsx`** (Option B) — drops the chat-25 stub functions (`nextRsvpForMember` returning null / `kudosThisWeekFor` returning 0); adds `loadYourWeekData(member)` adapter that reads `member.profile?.data.events_going` (own-profile source — bypasses the `event-rosters.json` aggregate which strips `members_only`-visibility RSVPs into `hiddenCount`, leaving private-visibility members invisible to themselves via the aggregate) and `kudosJson[member.slug]?.recent`. Gating simplified to `{yourWeek && <YourWeekPane …>}` since `yourWeek` non-null implies `member` non-undefined.
- **`playwright.config.ts`** (Option E) — `BASE_URL` reads `PLAYWRIGHT_BASE_URL` env var with fallback to `http://localhost:${PORT}`; `webServer` block is conditionally omitted when targeting an external URL so no local `pnpm dev` spin-up.
- **`lib/__generated__/contributions.json` + `project-contributions.json`** (Option H) — synced with fresh values: `anton1rsod` projectCommits 253→301, adrsFiled 12→14 (chat-25/26 closeouts); `community-platform` commits 206→252; `way-who-are-you` (2 commits) surfaces via the scaffold branch preserved per §9.22.

### Verified

- **H56 Cache-Control `private` on Vercel edge** — `e2e/v0-4-shell.spec.ts` 7/7 scenarios green vs `https://warsaw-ai-community-platform.vercel.app` in 2.6s (anonymous `/` hero, H56 cache header, `/login` no-Header, `/handbook` full shell, `/calendar?filter=events` H62, H58 hydration, H65 skip-to-content). Closes the chat-25 deferred staging-only verification.

### Surfaced (NOT fixed in this release — chat-27 Option K)

- **axe-core a11y baseline against production** — `e2e/v0-4-a11y.spec.ts` returned 6 of 7 surfaces FAILING (only `/login`, which doesn't render the global shell, passed). Two distinct serious violations, both pre-existing v0.4.0 regressions: (1) `aria-prohibited-attr` on `<div aria-label="Language">` in the global `<Footer>` (present on all 6 failed surfaces — empty aria-label on a div without a valid role); (2) `color-contrast` on the `/` `Sign in with GitHub` CTA — `text-white` on `bg-accent-500` (`#f59e0b`) is ~1.88:1, fails WCAG AA 4.5:1. Surfaced to chat-27 with a fix recipe (`docs/specs/2026-05-19-community-platform-v0-4-1-shipped-followups-handoff.md` §Option K). NOT fixed in chat-26 per the bundle-scope discipline (B + E + H only).

### Known limitations

- **kudos.recent[] cap** — `lib/your-week.ts.countKudosThisWeek` filters `recent[]` which is capped at 5 most-recent by `build-kudos-aggregate.ts`. A member receiving 6+ kudos in a single ISO week is silently undercounted. Acceptable while community is small (2-3 active members); revisit by emitting per-week buckets in the build script when growth makes this visible.

### Not in this release (deferred to chat-27 or v0.5+)

- A (PWA textured "WA" icons — needs local ImageMagick)
- C (HomeFeed `relativeDate()` → `<DateTime>` migration — dominated by B's user value at same cost)
- D (reviewer-agent dispatch — `feedback_token_discipline` says batch with v0.5+ for token efficiency)
- F (Phase B activation gate — premature day-0 post-ship; needs 7-14 days of landing data + user-test session)
- G (typescript-reviewer-flagged tech-debt sweep — true nits with no production impact)

---

## [0.4.0] — 2026-05-18 (ready-to-ship; PR pending Anton merge)

**v0.4 Phase A — global navigation shell + ADR-0014 anonymous landing.** Wraps every page (except `/login`) in `<Header>` + `<Footer>`. Flips `/` from 307→/login to a 200 hero composition for anonymous users; signed-in `/` redirects to `/home` preserving `?from=…` against a safe allowlist. Introduces `/calendar` (unified events+meetings) and `/handbook` (charter + roadmap + GitHub external for ADRs). Centralizes UI text in `lib/i18n/strings.ts` (H67). Establishes warm-amber accent token system (`#f59e0b` canonical) layered as CSS variables for v0.5+ dark-mode upgrade. Drops the v0.3.1 `<HomeHeader>` + 5-card section nav from `/home` — global header supersedes. 21 plan tasks shipped across 4 phases (A.0 Foundation × 5 / A.1 Components × 7 / A.2 Routes × 5 / A.3 Closeout × 4). Tests: 925/925 unit+integration green (94 test files). Coverage: 88.59% lines / 92.89% branches overall (gate 80%); Phase A strict-list mostly at 100% lines (Header.tsx 97.41% / HeaderMobileMenu.tsx 86.79% / RootShell.tsx 0% — known-uncoverable client-interactive + next/headers paths, accepted per A.1.1 precedent). Hardening grep returns the expected 11 Phase A IDs (H56, H57, H58, H59, H60, H62, H64, H65, H66, H67, H68). Plan amendments §9.19–§9.24 captured the realities the plan didn't anticipate (test-file extensions, file relocations, vitest environment, persona-folder semantics, scope-leak revert).

### Added

- **ADR-0014** — `/` flips to anonymous-public hero landing (amends ADR-0012). Q-1.1 ambition sentence `"Where Warsaw's AI builders learn, ship, and find each other."` now lives on the SEO-canonical surface. Status flipped Proposed → Accepted at Phase A.0.1.
- **Global navigation shell** — `<Header>` (wordmark + 5-nav: Home/Calendar/Projects/Members/Handbook + auth state + mobile slide-in) and `<Footer>` (4-link strip: About/Telegram/GitHub/MIT-licensed) mounted on every page except `/login` via `<RootShell>` server-component composer reading `headers().get("x-pathname")`. `/no-access` and `/consent` render Header in compact mode (auth-state-only, no top-nav).
- **`/` rewrite** (`app/page.tsx`) — anonymous render: Q-1.1 hero + sub-line + dual CTA (`[Sign in with GitHub]` + `[Join Telegram →]`) + next-event ribbon + below-hero HomeFeed. Signed-in render: 302→`/home` preserving `?from=…` against `^/[a-z0-9-_/]*$` allowlist (H57). `app/components/AnonymousHero.tsx` extracted for testability.
- **`/calendar`** (NEW) — unified events + meetings index with filter chips (`?filter=all|events|meetings` per H62; share + reload-stable). Subscribe CTA → `/api/calendar.ics`. Old `/events` + `/meetings` indexes remain URL-accessible as filtered views (D27 — no 301 redirects).
- **`/handbook`** (NEW) — charter pointer + roadmap pointer (PROJECTS.md per O4) + GitHub external link for ADRs (Q6.1 (i) lock — NO ADR markdown content surfaced in UI; preserves PII posture). v0.5+ placeholder labels for Skills / Academy / GBrain Q&A.
- **Signed-in `/home` "Your week" dashboard pane** — `<YourWeekPane>` mounts above `<HomeFeed>` when session+roster present. Renders next-RSVP commitment (stub returning null; v0.4.x wires `event_rsvps.json`) + status compose CTA → `/this-week` + optional kudos-this-week count (stub returning 0; v0.4.x wires `lib/kudos.ts`). **Passive surface** per §14.6 manipulation-resistance: NO streak counter, NO notifications, NO "you missed N weeks" copy. Forward-defense test asserts DOM contains no `/streak|missed|don't break the chain/i`.
- **Warm-amber accent ramp** (`#f59e0b` canonical per Q4.2 / D33) — token CSS variables in `app/globals.css` (`--color-accent-50/100/500/600/700/900` + neutral ramp slot for v0.5+ dark mode). Tailwind `theme.extend.colors.accent` references the vars so component authors use `bg-accent-500` / `text-accent-700` / `ring-accent-500` utility classes (H64). Accent appears ONLY on primary CTAs / focus rings / current-page nav / RSVP "Going" pill per Q4.8.
- **`Warsaw AI` wordmark** — Inter Semibold 18px loaded via `next/font/google` (Reg 400 + Semibold 600 only); CSS var `--font-inter` exposed for the body font chain (Q4.7 / D34).
- **6 shared layout primitives** in `app/components/`: `<Avatar>` (H59 / H60 / O6 single-char initials), `<ListItem>` (Q5.1 / D36), `<DateTime>` (Q5.4 CEST), `<Tag>` (O12 — only `status:proposed` carries accent tint), `<EmptyState>` (Q3.5 codification), `<HeaderMobileMenu>` (Q2.5 / O7 variant A slide-in).
- **`lib/i18n/strings.ts`** — single source of UI text with **flat keys + surface prefix** (O10 lock); `s(key: StringKey): string` helper with compile-time-checked literal-string-key type union (H67). 82 keys across 11 surface prefixes (header / footer / nav / home / landing / calendar / handbook / empty / avatar / datetime / auth).
- **`tests/integration/anonymous-event-detail.test.ts`** — H66 Phase A wrap-only stub.
- **PWA assets regen** — `icon-192.png` + `icon-512.png` (replacing v0.3.0 `#2563eb` placeholders) + NEW `apple-touch-icon.png` + NEW `favicon.ico` (resolves v0.3.1 console 404 per walkthrough §4). Solid `#f59e0b` placeholders generated via `scripts/regen-pwa-icons.ts` (pure-JS `pngjs`; textured "WA" overlay deferred to v0.4.x once ImageMagick/sharp is locally available). Manifest `theme_color` → `#f59e0b`.
- **`e2e/v0-4-shell.spec.ts`** — Playwright E2E covering: anonymous `/` 200 + hero, anonymous `/` Cache-Control posture (H56), `/login` no-Header, `/handbook` full shell, `/calendar?filter=events` chip-highlighting (H62 E2E), H58 hydration stability, H65 skip-to-content on Tab. Ran 6/7 green locally on dev (H56 Cache-Control verified in staging; Vercel-edge injects `private`).
- **`e2e/v0-4-a11y.spec.ts`** — axe-core baseline across 7 anon-public surfaces with `wcag2a/aa wcag21a/aa` tags; serious + critical violations gate. Deferred execution to staging/production smoke.
- **`scripts/check-h67-inline-strings.ts`** + npm script `h67:scan` — grep-based scan over Phase A strict-list `.tsx` files (H67 second half).
- **`scripts/regen-pwa-icons.ts`** + `pngjs` devDep — pure-JS PWA-asset regenerator.

### Changed

- **`proxy.ts`** — `PUBLIC_PATHS` gains `/`, `/calendar`, `/handbook` (both production and dev arrays). All 4 `NextResponse.next()` sites tag `x-pathname` request header for the global shell to read.
- **`next.config.ts`** — adds `images.remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }]` (H59 SSRF gate).
- **`app/layout.tsx`** — mounts `<RootShell>` wrapping `{children}`, loads Inter via `next/font/google`, exports `viewport.themeColor = "#f59e0b"` (themeColor moved from Metadata to viewport per Next.js 13.4+ API). Adds `<link rel="icon" />` + apple-touch-icon references via Metadata `icons` field.
- **`app/home/page.tsx`** — drops `<HomeHeader>` import + the v0.3.1 5-card section nav grid. Mounts `<YourWeekPane>` conditionally for signed-in users.
- **`app/globals.css`** — replaces v0.3 body styling with token-vars-aware contract per H64; legend comment documents `--color-<role>-<weight>` naming.
- **`tailwind.config.ts`** — `theme.extend.colors.accent` references CSS vars (not hex codes). `fontFamily.sans` chain includes `var(--font-inter)`.
- **`public/manifest.json`** — `theme_color` flipped from `#2563eb` to `#f59e0b`.
- **`tests/unit/persona-folder-slug-consistency.test.ts`** — describe block prefix backfilled to `describe("H68: …")` so the hardening grep returns ≥1 hit. The PR #7 forward-defense logic ALREADY enforces H68; A.3.2's planned separate validator was redundant and reverted.
- **`CONSTRAINTS.md`** — line 12 extends discovery-surface list to include `/`, `/calendar`, `/handbook` per ADR-0014.
- **`docs/decisions/README.md`** — ADR-0014 row updated to `Accepted`.

### Hardenings (Phase A — 11 of 12 active; H63 retired, H61 deferred to Phase C)

H56 (`/` no session leak), H57 (`/` redirect safe `?from=…`), H58 (`<Header>` auth-state stability + 4-item dropdown), H59 (next.config images.remotePatterns + Avatar SSRF gate), H60 (photo opt-out → initials), H62 (`/calendar` filter URL state), H64 (token CSS variable contract), H65 (skip-to-content link), H66 (RSVP visibility wrap-only stub), H67 (i18n centralization + strict-list grep), H68 (persona folder ↔ slug consistency).

### Plan amendments (`execution-plan.md §9`)

§9.19 (test-file extension), §9.20 (i18n test relocation), §9.21 (component tests `.test.tsx`), §9.22 (dd887f3 revert), §9.23 (h-v0-4 rename to `.test.tsx` for jsdom), §9.24 (A.3.2 collapse to existing test + describe-prefix backfill).

### Tests

- 925 unit / integration tests across 94 test files — all green.
- 5 E2E test files; shell E2E ran 6/7 green on dev; a11y baseline deferred to staging.
- Coverage: 88.59% lines / 92.89% branches / 92.41% functions / 88.59% statements (gate ≥80%).
- Phase A strict-list mostly 100%; Header.tsx 97.41% / HeaderMobileMenu.tsx 86.79% / RootShell.tsx 0% — accepted per A.1.1 precedent.

### Plan / Spec

- Spec §14 at SHA `971f0d2` (chat-23) — pending merge as PR #22.
- ADR-0014 (Accepted at A.0.1) at `docs/decisions/0014-community-platform-v0-4-root-anonymous-landing.md`.
- v0.4.0-plan.md (5035 lines, 21 tasks) at SHA `42ad76b` — chat-24 plan; pending merge.
- Implementation handoff at `docs/specs/2026-05-19-community-platform-v0-4-implementation-handoff.md`.

### Production smoke (Anton-side, post-merge)

Anonymous `/` 200 hero + dual CTA + next-event ribbon. Anonymous `/calendar`, `/handbook` 200; filter chip state preserves on reload. Signed-in `/` 302→`/home`; `?from=/calendar` round-trips. Signed-in `/home` shows YourWeekPane above HomeFeed; no streak / notification copy. `<Header>` shape per auth state (4-item dropdown signed-in). PWA install prompt shows amber-themed icon. axe-core 0 serious/critical violations on 7 anon-public surfaces. H56 Cache-Control: `private, no-cache, no-store` on `/` (Vercel edge injects `private`).

---

## [0.3.1] — 2026-05-17

**Hotfix.** `/home` auth-aware header (anonymous Sign-in CTA + signed-in `Your week / Members / Edit profile · @handle / Sign out`) + restored Members card. `/home` flipped from `force-static` to dynamic per-request rendering. H30 hardening amended ("anonymous accessible" rather than "no `auth()` read"). PR #21 merged at `e720268`; tag `community-platform-v0.3.1` pushed.

### Added

- **`app/components/HomeHeader.tsx`** — auth-aware top-right nav surface; anonymous shows Sign-in CTA; signed-in shows `Your week / Members / Edit profile · @handle / Sign out`. 3 unit tests for the auth-state-derived render contract.

### Changed

- **`app/home/page.tsx`** — dropped `export const dynamic = "force-static"` to enable per-request `auth()` read for HomeHeader. Restored Members card in the 5-card nav grid (was dropped during v0.3.0 layout pass).
- **H30 amended in spec §13** — discovery posture for `/home` reads "anonymous accessible" rather than "no `auth()` read." Original wording over-constrained the hardening — surfaces can be anonymous-accessible AND read `auth()` to enrich the signed-in experience.

### Verified

- 825/825 unit/integration tests green (v0.3.1 adds 3 unit tests for HomeHeader + updated home-page contract).
- Production deploy `ivbncdcvq` (promoted from PR #21 preview via `pnpm dlx vercel promote --yes` because Vercel Free-tier 100/day deploy quota was exhausted — see GOTCHAS row 11).
- Anonymous `/home` smoke green: 200 with `cache-control: private, no-cache, no-store` (page now dynamic per request); markup contains `aria-label="Account"`, `aria-label="Sections"` (5-card nav grid), `href="/login">Sign in` (anonymous CTA), `href="/members">Members` (restored card), and all 5 nav cards (Events / Meetings / Members / Projects / Decisions).
- Signed-in `/home` smoke green 2026-05-17 by Anton (chat-21 prep, Option A from chat-20 follow-ups menu): top-right Account section shows `Your week / Members / Edit profile · @anton1rsod / Sign out`; each link routes correctly; `Sign out` returns anonymous `/home` with `Sign in` CTA top-right.

---

## [0.3.0] — 2026-05-17

**Discovery+ release.** Anonymous `/home` unified activity feed + `/events` + `/meetings` indexes + read-only detail pages + `/this-week` L2 strip + V-static GCal `/api/calendar.ics` + RSVP tri-state (Going / Interested / none, mutually exclusive) + Kudos primitive (♥ Thanks) on status/contribution/meeting items + PWA installability via manifest + 192/512 icons.

35 of 36 v0.3 tasks shipped (E2E spec deferred to v0.3.1 — unit + integration coverage carries the safety net). Tests 822/822 green. Coverage: 89.6% lines / 93.77% branches overall (gate 80%); v0.3 strict-list at 100% lines on 11 of 13 files (HomeFeed.tsx 98.86% / meetings.ts 98.61% — the remaining lines are defensive frontmatter fallbacks accepted per the v0.1+v0.2 strict-list precedent). 50 unique hardening IDs grep-verified across `tests/unit/`.

### Added

- **ADR-0012** — v0.3 Discovery+ posture amendment to CONSTRAINTS line 12 (selected surfaces public). (Task 1.1)
- **`/home`** — public SSG unified activity feed via `HomeFeed` (This Week + Recent, D layout per spec §13.3). H30 (no `auth()` read), H33 (per-section empty states), H43 (XSS via escapeHtml). (Tasks 2.1, 2.2)
- **`/events`** — public SSG index, Upcoming + Past sections, count badges from build-time roster (H35). (Task 2.5)
- **`/events/[slug]`** — public SSG detail page, extended frontmatter render (startTime/duration/location/host), `<AddToCalendarButton>`, cancelled banner, RSVP slot + roster slot wired in Phase 3 (H35). (Tasks 2.6, 3.4)
- **`/meetings`** — public SSG index, month-grouped reverse-chrono list, ICS subscribe link in header (H36). (Task 2.3)
- **`/meetings/[slug]`** — extended frontmatter render (startTime/duration/location) + `<AddToCalendarButton>` + ThankButton (host) (H36). (Tasks 2.4, 3.7)
- **`/this-week` L2 strip** — `<HomeFeed showRecent={false}>` mounted above status compose; hidden entirely when This Week empty (H45). (Task 2.8)
- **`/api/calendar.ics`** — public Route Handler serving build-time aggregate ICS; `Content-Type: text/calendar; charset=utf-8`, public/300s cache headers (H37, H48). (Task 2.9)
- **`<AddToCalendarButton>`** — client download component; Blob+ObjectURL flow with cleanup in `finally` (H46, H48). Strict-list 100%. (Task 2.7)
- **`<KudosCount>`** — read-only D19 display component; "♥ Thanked N times" pill + recent givers from `lib/__generated__/kudos.json` (H51). Strict-list 100%. (Task 2.10)
- **RSVP tri-state write surface** — `<EventRsvpButton>` client UI + `rsvp-event` server action; SHA-passthrough write contract (v0.2.2 idiom); mutual exclusion reconciliation per D11; visibility default `members_only` on first RSVP (H31, H37, H40, H46). Strict-list 100% on both files. (Tasks 3.2, 3.3)
- **`<EventRoster>` server component** — Going + Interested sub-rosters with hidden-count CTA (D10, D12, H32). Wired into `/events/[slug]`. (Task 3.4)
- **Thanks/Kudos write surface** — `<ThankButton>` client UI + `thank-status` server action; idempotent dedup on `(recipient, item_type, item_id)` (O7); self-thank blocked + non-roster recipient blocked + 409 = `REFRESH_NEEDED` (H53). Item_id validators per O8: status regex / contribution `projectSlug:contributorSlug` / meeting `findMeetingBySlug`. Strict-list 100% on both files. (Tasks 3.5, 3.6, 3.7)
- **`lib/profile-editor.ts` v0.3 schema** — `ProfileFrontmatterSchema` (+ `.passthrough()` to preserve v0.2 fields), `ThanksRecordSchema`, `parseProfileFrontmatter`, `validateProfileInvariants` (D11 mutual exclusion), `deriveThankInitialState` (D19 viewer-aware state). Existing v0.2 signatures (`parseFrontmatter`, `serializeFrontmatter`, `composeProfile`) unchanged. (Task 3.1)
- **`/members/[slug]` v0.3 additions** — events_going / events_interested render (orphan-filtered via `filterOrphanSlugs` per H34, H39) + `<KudosCount>`. (Task 3.8)
- **PWA installability** — `public/manifest.json` (start_url `/home`, display standalone, theme #2563eb), 192/512 PNG placeholder icons (#2563eb solid; replace with brand asset in v0.3.1), `app/layout.tsx` `metadata.manifest` link (D20, H55). (Task 4.1)
- **Library primitives, build scripts, generated artifacts** — `lib/events.ts`, `lib/home-feed.ts`, `lib/ical.ts`, `lib/community-defaults.ts`, `lib/meetings.ts` host/startTime/duration/location extension; `scripts/build-event-rosters.ts`, `build-calendar.ts`, `build-kudos-aggregate.ts`, `validate-events-folders.ts`; `lib/__generated__/{event-rosters,kudos}.json` + `calendar.ics` (seeded empty/baseline).
- **Community config** — `community/community-defaults.json` (timezone Europe/Warsaw, meeting + event default times); `community/events/_template/README.md`.
- **`tsconfig.json` `types: ["node"]`** — forward-defense against transitive `@types/*` build failures (H50, Gotcha 9 pre-empt).
- **`tests/unit/build-reliability.test.ts`** — invariants for tsconfig types scope, GOTCHAS row 9 documentation, and PWA manifest validity (H50, H55).
- **`ics` npm dep** (3.12.0, MIT, ~7KB) — V-static ICS generator (O1 selection per spec §13.7.2).

### Changed

- **`proxy.ts` PUBLIC_PATHS + PUBLIC_PREFIXES** — extended for v0.3 Discovery+ surfaces per ADR-0012: `/home`, `/events`, `/meetings`, `/api/calendar.ics`, `/manifest.json` added to PUBLIC_PATHS; `/events/`, `/meetings/`, `/icons/` added to PUBLIC_PREFIXES (both production + non-production scopes).
- **`tests/unit/proxy.test.ts`** — 17 `/home` auth-gate tests migrated to `/this-week` (still gated); new v0.3 describe block asserts the 5 new PUBLIC_PATHS + 3 new PUBLIC_PREFIXES.
- **`app/home/page.tsx`** — rewritten; v0.1 role-display dropped; mounts `<HomeFeed>` from SSG-computed feed data.
- **`app/this-week/page.tsx`** — mounts `<HomeFeed showRecent={false}>` strip above compose + ThankButton per "others" row (viewer-derived state via `parseProfileFrontmatter` + `deriveThankInitialState`).
- **`app/projects/[slug]/page.tsx`** — "Recognize contributors" section with ThankButton per row (SSG-safe `initialState="not-signed-in"`; dynamic viewer-state derivation deferred to v0.3.1).
- **`app/members/[slug]/page.tsx`** — Events section (filtered v0.3 fields) + `<KudosCount>`.
- **`lib/meetings.ts`** — Meeting interface gains optional `startTime`, `durationMinutes`, `location`, `host`; `listMeetingsFromDisk` + `readMeeting` parse them from gray-matter frontmatter with type guards.
- **CONSTRAINTS line 12** — amended to reference ADR-0012 (members-only with discovery surface exception).

### Fixed

- **Vercel preview deploys broken since Phase 1 Task 1.3 push** — tsx-resolution chicken-and-egg in the prebuild chain. Two fixes shipped:
  - `lib/content-snapshot.ts` — converted 8 `@/lib/*` imports to relative `./*` (commit `b46af5b`).
  - `lib/meetings.ts` — `listMeetings(source)` now requires explicit source arg to decouple it from `lib/content-snapshot.ts` (commit `5384dd2`).
  - GOTCHAS row 10 documents the pattern for future ops.
- **Security review (Task 3.9)** — `rsvp-event` + `thank-status` commit messages now strip CR/LF from session-derived handle before interpolation. Defense-in-depth (GitHub enforces alphanumeric+hyphen, but the injection boundary should not rely on an external party's invariant). 0 CRITICAL / 0 HIGH / 1 MEDIUM closed.

### Verified

- 822/822 unit/integration tests green (79 test files).
- Coverage: **89.6% lines / 93.77% branches** overall (gate: 80%); strict-list at 100% on 11/13 v0.3 files (HomeFeed.tsx 98.86% / meetings.ts 98.61% — defensive frontmatter fallbacks accepted per v0.1+v0.2 precedent).
- `pnpm tsc --noEmit` clean.
- Pre-push smoke (`rm content-snapshot.json && pnpm snapshot && pnpm tsc --noEmit`) clean.
- Hardening grep: **50 unique IDs** across `tests/unit/` (`describe("H<n>:")` blocks). v0.3 IDs landed: H30, H31, H32, H33, H35, H36, H37, H38, H39, H40, H42, H43, H44, H46, H47, H48, H49, H50, H51, H53, H54 (21 of 26; H34 + H41 + H45 + H52 + H55 covered via `it()` blocks or indirect tests).
- security-reviewer on rsvp-event + thank-status + profile-editor v0.3 additions + meetings.ts host extension: **0 CRITICAL / 0 HIGH / 1 MEDIUM** (closed in `4286be6`).

### Deferred to v0.3.1

- **`e2e/v0-3-discovery.spec.ts`** — Task 4.2 (14 Playwright scenarios). Unit + integration coverage on every surface carries the v0.3.0 safety net. The 33 v0.2.2 E2E scenarios still pass and exercise the auth + consent + profile-editor + roster flows that v0.3 inherits unchanged.
- **Brand-asset PWA icons** — current 192/512 PNGs are solid #2563eb placeholders. Replace when a community brand asset lands.
- **Dynamic viewer-state derivation on `/projects/[slug]` + `/meetings/[slug]`** — ThankButton ships `initialState="not-signed-in"` everywhere (sign-in CTA visible to anonymous; signed-in users see "+ Thanks" but click is currently a no-op without dynamic profile load). `/this-week` already supports the full viewer-derived flow.
- **typescript-reviewer + code-reviewer dispatch** — security-reviewer ran on the write surfaces (the security-relevant scope). Broader code-quality review carried by per-task spec-compliance reviews + CONSTRAINTS self-review checklist.

### Production smoke (Anton-side, post-merge)

1. Anonymous: visit `/home` → activity feed renders without redirect to `/login`.
2. Anonymous: `/events`, `/meetings` index pages → 200, content renders.
3. Anonymous: `GET /api/calendar.ics` → 200, `Content-Type: text/calendar`, body begins `BEGIN:VCALENDAR`.
4. Signed in: visit `/events/<slug>` → click Going → reload → expect "✓ Going" persists; the commit message on `community/members/<slug>.md` includes `Co-Authored-By: <handle>`.
5. Signed in: visit `/this-week`, click "+ Thanks" on someone else's post → expect "♥ Thanked" persistence on reload; verify commit on main.
6. Chrome DevTools → Application → Manifest: parsed, install prompt available on `/home`.

---

## [0.3.0-foundation-archive] — 2026-05-17 (Phase 1 only, superseded)

> Phase 1 foundation primitives originally shipped under an `[Unreleased]` block at chat-19 closeout. Superseded by the v0.3.0 entry above which consolidates Phases 1–4. Preserved here for traceability of the mid-ship state.

11 of 36 v0.3 tasks shipped at chat-19 HEAD `5384dd2`: ADR-0012, community-defaults, listMeetings+groupByMonth, events reader + EventSlug brand, home-feed aggregator, ical + ics dep, build-event-rosters, build-calendar, build-kudos-aggregate, validate-events-folders CI guard, tsconfig types scope. 13 unique hardening IDs (H32, H33, H34, H36, H38, H39, H42, H44, H47, H49, H50, H52, H54).

Two preview-blocking defects fixed mid-phase: (i) `content-snapshot.ts` `@/lib/*` → relative imports (`b46af5b`); (ii) `lib/meetings.ts` `listMeetings(source)` decouple (`5384dd2`). Captured as GOTCHAS row 10.

### Added

- **ADR-0012** — v0.3 Discovery+ posture (selected surfaces public). Amends CONSTRAINTS line 12. (Task 1.1)
- **`lib/community-defaults.ts`** — Zod-validated reader for `community/community-defaults.json` (timezone + meeting/event defaults). O5 = JSON not YAML. (Task 1.2)
- **`lib/meetings.ts`** — `listMeetings(source)` (sync wrapper, source required per Vercel-tsx constraint) + `groupMeetingsByMonth()`. (Task 1.3) **Strict-list 100%.**
- **`lib/events.ts`** — `EventSlug` branded type, Zod-validated frontmatter, `parseEventFrontmatter` folder/slug invariant (H44), `filterOrphanSlugs` (H34, H39). (Task 1.4) **Strict-list 100%.**
- **`lib/home-feed.ts`** — pure `computeHomeFeed()` aggregator with This-Week / Recent bucket logic + 30-day cutoff (H33, H38). (Task 1.5) **Strict-list 100% lines.**
- **`lib/ical.ts` + `ics` npm dep (3.12.0, MIT, ~7KB)** — RFC 5545 generator via `meetingToIcsEvent` + `eventToIcsEvent` + `generateIcs` (H47, H49). O1 checklist all-green. (Task 1.6) **Strict-list 100%.**
- **`scripts/build-event-rosters.ts`** — build-time aggregator (orphan filter + visibility split) → `lib/__generated__/event-rosters.json` (H32, H39). (Task 1.7)
- **`scripts/build-calendar.ts`** — build-time ICS aggregator (cancelled-event exclusion + 30-day cutoff) → `lib/__generated__/calendar.ics`. (Task 1.8)
- **`scripts/build-kudos-aggregate.ts`** — build-time aggregator (bot+non-roster filter + recent-cap-5 + by_type counts) → `lib/__generated__/kudos.json` (H54). (Task 1.9)
- **`scripts/validate-events-folders.ts`** — CI guard for `YYYY-MM-DD-slug/` folder pattern (H44). Wired into `.github/workflows/ci.yml`. (Task 1.10)
- **`tsconfig.json` `types: ["node"]`** — forward-defense against transitive `@types/*` build failures (H50 / Gotcha 9). (Task 1.11)
- **`tests/unit/build-reliability.test.ts`** — asserts tsconfig types scope + GOTCHAS row 9 documentation invariants (H50).
- **GOTCHAS row 10** — `@/lib/*` path aliases unresolvable by tsx when imported from inside `lib/`. Recovery: relative imports inside `lib/`; aliases fine elsewhere.

### Fixed

- **Vercel preview deploys broken since Task 1.3 push** — tsx-resolution chicken-and-egg in the prebuild chain. Two fixes shipped:
  - `lib/content-snapshot.ts` — converted 8 `@/lib/*` imports to relative `./*` (commit `b46af5b`).
  - `lib/meetings.ts` — removed the `?? listMeetingsFromSnapshot()` default; `listMeetings(source)` now requires explicit source (commit `5384dd2`). Decouples `lib/meetings.ts` from `lib/content-snapshot.ts` to prevent transitive load of the gitignored `content-snapshot.json` during the prebuild script run.

### Verified

- 678/678 tests green (62 test files; up from 575 + 32 E2E at v0.2.2 baseline).
- Strict-list 100% coverage on all five Phase-1 strict-list files (meetings.ts, events.ts, home-feed.ts, ical.ts, community-defaults.ts).
- `pnpm tsc --noEmit` green.
- `pnpm build` green locally (39 pages).
- Vercel preview build green at `5384dd2` (42s — matches pre-Phase-1 baseline of 40-57s).
- Hardening grep so far: 13 unique IDs present (H32, H33, H34, H36, H38, H39, H42, H44, H47, H49, H50, H52, H54). H30 partial — landed by Task 2.2 (proxy.ts PUBLIC_PATHS for `/home`).

### Not yet shipped (deferred to chat-20 — Phase 2-4)

- Phase 2 (10 tasks): Read surfaces — `/home` rewrite, `/events`, `/meetings` indexes, `/events/[slug]`, `/this-week` L2 strip, `/api/calendar.ics` route, `KudosCount` component, `AddToCalendarButton`.
- Phase 3 (9 tasks): Write surfaces — RSVP tri-state, Thanks/Kudos primitive, EventRoster, profile schema extension, security-reviewer dispatch.
- Phase 4 (6 tasks): PWA + 14 E2E scenarios + coverage verification + reviewer dispatch + CHANGELOG/tag/handoff.

Handoff: `docs/specs/2026-05-17-community-platform-v0-3-phase-2-handoff.md`.

---

## [0.2.2] — 2026-05-16

**Profile editor SHA passthrough — closes v0.2.0's documented Scenario 2 E2E skip + plugs a production lost-update window.** Client now echoes the SHA loaded at SSR (`/me/edit`) as a `sha` field in the save FormData; `saveProfile` gates writes on that token instead of re-reading at save time. The prior retry-on-409 loop in `saveProfile` silently overwrote concurrent commits — removed.

### Fixed

- **Production lost-update on `/me/edit` save** — when an external commit (PR merge or a second tab) landed between page-load and save, the v0.2.0 code path would re-read the new SHA at save time, compose the user's stale body against the new frontmatter, and write — overwriting the concurrent change with no warning. With client-SHA gating, this surfaces as `refresh_needed` ("Someone else updated this — refresh") instead.
- **E2E `Scenario 2: concurrent edit → REFRESH_NEEDED message`** — was `test.skip` in v0.2.0 because `attemptSave` re-read the mock store's CURRENT SHA at save time, making the race unreachable via sequential `.click()` calls. Now deterministic: both tabs load the same SHA at mount, tab A's save advances the store, tab B's save echoes the now-stale SHA, server returns `refresh_needed`.

### Changed

- **`SaveProfileSchema`** (`lib/profile-editor.ts`) — adds `expectedSha: z.string().min(1)`. Missing, empty, or non-string → `invalid_body`.
- **`saveProfile` server action** (`app/actions/save-profile.ts`) — single-attempt SHA-CAS. Any conflict (stale client SHA at read-time OR TOCTOU at GitHub write-time) maps to `refresh_needed`. The prior retry-on-409 loop is gone — it was a lost-update vulnerability that silently overwrote concurrent commits.
- **`ProfileEditor`** (`app/components/ProfileEditor.tsx`) — new required `initialSha: string` prop; `onSave` calls `fd.append("sha", initialSha)`.
- **`/me/edit` page** (`app/me/edit/page.tsx`) — passes `initialSha={file.sha}` (production: from `gh.readFile`; E2E mock: from store entry).
- **E2E mock branch in `attemptSave`** — no longer seeds the store when the entry is missing; returns `file_missing` instead, aligning with production's `gh.readFile === null` behavior.

### Hardenings — H16 (revised)

H16 in v0.2.0 was "SHA-CAS optimistic locking on save with single retry." v0.2.2 keeps the SHA-CAS but **drops the single retry**: the retry was unsafe (it re-read the new SHA after a concurrent commit and wrote the user's stale body on top, silently overwriting the remote change). The corrected contract is: client passes the SHA loaded at SSR; server rejects with `refresh_needed` on any mismatch. The H16 hardening row in `spec.md` §12 is otherwise unchanged.

### Test infrastructure

- `tests/unit/profile-editor.test.ts` — 3 new H16 tests verifying schema requires non-empty `expectedSha`.
- `tests/unit/ProfileEditor.test.tsx` — new test asserting `initialSha` is appended to FormData on save.
- `tests/unit/me-edit-page.test.tsx` — mock `ProfileEditor` to capture props; new test asserts `file.sha` flows through as `initialSha`.
- `tests/integration/save-profile.test.ts` — reshapes H16/H20/H21 tests for the new no-retry semantic; new "stale-SHA → refresh_needed" tests on both production and E2E mock paths; new "rejects missing sha" test.
- `e2e/profile-editor.spec.ts` — Scenario 2 unskipped; the structural skip-comment explaining the v0.2.0 limitation is removed.

### Verification

- `pnpm test` — 578 unit + integration green (575 → 578, +3 schema H16 tests).
- `pnpm e2e` — 33 passing, 0 skipped (was 32 active + 1 documented skip).
- `pnpm tsc --noEmit` + `pnpm lint` — clean.
- §12.7 strict-list coverage holds: `lib/profile-editor.ts` 100/100/100, `app/actions/save-profile.ts` 100% lines, `app/components/ProfileEditor.tsx` 100% lines (functions 91.66% / branches 94% match the v0.2.0 baseline).
- CI on PR will run lint + typecheck + test + build.

### Migration / release

- No env-var changes.
- Action contract change (`saveProfile` now requires `sha` in FormData) is scoped to its only in-app caller (`ProfileEditor`), updated in the same commit. No external API surface.
- Tag: `community-platform-v0.2.2` at merge SHA `7cd87c3` (PR #17).

---

## [0.2.1] — 2026-05-16

**Consent redirect chain hardening.** Two follow-up commits to close the redirect-loop class of bugs that surfaced after `community-platform-v0.2.0` (`69362e9`). Tag `community-platform-v0.2.1` at merge SHA `dd3a675`.

### Fixed

- **`/home` ↔ `/consent` redirect loop** (chat-14 hotfix, SHA `d0e60e1`) — `proxy.ts` re-seeds `waic-consented` cookie inline when the build-time content snapshot already shows the bot-written profile (`member.profile` non-null). Common case (cookie cleared in a browser that's been signed-in for weeks; profile committed long ago and present in the snapshot) collapses to a single hop, no `/consent` round-trip.
- **`/consent` snapshot-stale recovery** (chat-15, SHA `1672178`) — closes the edge case explicitly deferred by chat-14: profile committed but build-time snapshot rebuild pending (the 60-90s window between commit and Vercel build). Added `/api/consent/recover` Route Handler; `/consent/page.tsx` now redirects there when `hasConsent()` (live GitHub read) is true. The handler re-runs auth + roster + `hasConsent` checks, sets `Set-Cookie: waic-consented=1` on its own response, and 307s to `/home` — Route Handlers are the canonical Next 16 surface for cookie mutation on a redirect (Server Components cannot `cookies().set()`).

### Added

- **`/api/consent/recover`** GET route handler — defense in depth (re-runs `auth()` + `findMemberByHandle()` + `hasConsent()` on every request; does not trust the `/consent` page to have already verified).
- **`/api/consent/recover` added to `PUBLIC_PATHS`** in `proxy.ts` (production + dev branches) — the proxy's consent gate would otherwise bounce the recovery endpoint to `/consent`, re-creating the loop. The handler enforces auth + roster + consent itself, so bypassing the proxy gate is safe.
- **`/api/test-mark-consented`** dev helper — `POST { slug }` calls `mockConsentStore.add(slug)` so an E2E can simulate "profile committed but snapshot not yet rebuilt" without going through `/consent`. Hard-gated to `NODE_ENV !== "production"` AND `NEXT_PUBLIC_E2E_MODE === "1"`.

### Hardenings — H30–H31 (continues v0.2.0's H14–H29)

| ID | Property |
|---|---|
| H30 | `/api/consent/recover` is a Route Handler that sets `Set-Cookie` on its own response — the canonical Next 16 pattern for cookie mutation on redirect. Server Components cannot mutate cookies; the previous `redirect("/home")` from `/consent/page.tsx` could not commit the cookie and therefore could not break the loop. |
| H31 | `/api/consent/recover` re-runs `auth()` + `findMemberByHandle()` + `hasConsent()` (live GitHub read) on every request; does not trust the caller (`/consent` page) to have already verified anything. TOCTOU race between page check and handler check is bounded by the handler's own consent check. |

### Test infrastructure

- `tests/integration/consent-recover.test.ts` — 5 integration tests covering all handler branches (`/login` redirect when no session, `/no-access` redirect when off-roster, `/consent` redirect when `hasConsent=false`, `/home` redirect + cookie attributes when `hasConsent=true`, no `writeFile` on the recovery path).
- `tests/unit/proxy.test.ts` — 2 new tests for `/api/consent/recover` and `/api/test-mark-consented` `PUBLIC_PATHS` passthrough.
- `e2e/consent.spec.ts` — 1 new snapshot-stale recovery scenario; fixed pre-existing breakage in "first-time roster member redirects to /consent" (anton-safronov.md was committed at SHA `29954f4` on 2026-05-03, so anton's profile is in the snapshot and the chat-14 hotfix re-seeds his cookie before `/consent` is reached — defeating the test's "first-time" intent). Now uses `markspas`, whose profile is genuinely absent from the snapshot. CI doesn't run E2E so this break went unnoticed.

### Verification

- `pnpm test` — 575 unit + integration green (562 before fix; +13 net).
- `pnpm e2e` — 32 passing, 1 documented skip (Scenario 2 from v0.2.0).
- `pnpm tsc --noEmit` + `pnpm lint` — clean.
- Playwright MCP manual browser drive — 4-hop redirect chain confirmed (`GET /home 307 → /consent 307 → /api/consent/recover 307 → /home 200`); second `/home` fetch with `redirect: manual` returns `200 / null` (cookie persisted); anton chat-14 hotfix path verified separately (1 hop, no `/api/consent/recover` involvement).
- CI on PR #16 green (Lint+typecheck+test+build).

### Migration / release

- No env-var changes required.
- Tag: `community-platform-v0.2.1` at merge SHA `dd3a675`.
- Production smoke (Anton-side, post-tag): clear `waic-consented` cookie in a logged-in browser → visit `/home` → expect 4-hop chain ending at `/home 200`. The chat-14 hotfix already covers the common case (cookie cleared, profile committed long ago) at 1 hop.

---

## [0.2.0] — 2026-05-16

**Self-service profile editor shipped (B + thin A + GBrain link tag-along).** Members sign in at `/me/edit`, edit `community/members/<slug>.md` body prose with markdown preview, save via `warsaw-ai-bot` with SHA-CAS optimistic locking + single retry. Project pages now surface top-5 contributors derived from git history (bot commits excluded). Optional outbound "Ask GBrain about this project" link on project pages, env-gated by `GBRAIN_BASE_URL`.

### Added

- **Profile editor at `/me/edit`** (spec §12.3) — session-derived slug (D1, cross-user URL structurally impossible); textarea + Preview tab; localStorage drafts client-side only; post-save UX surfaces 60-90s rebuild-lag from `lib/__generated__/content-snapshot.json`. Body-only edits; frontmatter (`name`, `github_handle`, `consented_at`) is read-only.
- **`/api/preview-markdown`** auth-gated POST route (O1 lock) — same `lib/markdown.ts` + `SafeHtml` pipeline as SSR rendering.
- **Top-N=5 contributors card on `/projects/[slug]`** (spec §12.4) — per-project aggregation from `git log`, sibling JSON at `lib/__generated__/project-contributions.json` (O2 lock).
- **Outbound "Ask GBrain about this project" link** on `/projects/[slug]` (spec §12.5) — env-gated by `GBRAIN_BASE_URL` (optional). `target=_blank rel="noopener noreferrer"` (H27 prevents Referer leakage + reverse-tabnabbing). Zero state coupling.
- **Edit-profile link on `/members/[slug]`** when viewing self — `Edit profile →` next to the Profile heading; `Edit your profile →` in the placeholder when prose is absent.

### Hardenings — H14–H29 (16 IDs, continues v0.1.1's H1–H13)

| ID | Property |
|---|---|
| H14 | Profile prose XSS-safe at render — existing `lib/markdown.ts` + `SafeHtml` pipeline; editor adds no parallel HTML-insertion site |
| H15 | Editor is self-only by construction — session-derived slug; body-supplied slug field ignored |
| H16 | SHA-CAS optimistic locking on save with single retry |
| H17 | Member attribution preserved — `Co-Authored-By: <handle> <handle>@users.noreply.github.com` in every save commit |
| H18 | Profile body size cap 64KB — Zod schema enforced |
| H19 | Frontmatter integrity across edits — required keys preserved verbatim; missing keys → `frontmatter_corrupt` error (refuses to overwrite) |
| H20 | Concurrent-edit UX — `refresh_needed` error → "Someone else updated this — refresh" message |
| H21 | GDPR delete preserved — editor doesn't bypass `/api/me/delete`; deleted file → `/me/edit` redirects to `/consent` (D4) |
| H22 | Markdown link sanitization — `rehype-sanitize defaultSchema` strips `javascript:` and other unsafe schemes |
| H23 | Draft data stays local — localStorage only; `fetch` is never called on textarea typing |
| H24 | Server logs don't leak profile body — log emits only `{slug, sha, success, error?}` |
| H25 | Project-slug to commit-path mapping uses current path — renamed projects: pre-rename commits stay under old slug |
| H26 | Bot commits excluded from per-project aggregation |
| H27 | Referer not leaked to GBrain — `rel="noopener noreferrer"` + `target=_blank` |
| H28 | Env-gated rendering — `AskGBrainButton` returns `null` when `GBRAIN_BASE_URL` is unset/empty |
| H29 | Form CSRF protection — Auth.js JWT cookie + same-origin (auth() runs first in saveProfile) |

### Changed

- `lib/contributions.ts` — exports `computeProjectContributions`, `ProjectContribution`, `ProjectContributions`, `TOP_CONTRIBUTORS_LIMIT`.
- `lib/content-snapshot.ts` — exports `getProjectContributions(slug)`.
- `lib/env.ts` — accepts optional `GBRAIN_BASE_URL` (`z.string().url().optional()`).
- `scripts/build-contributions.ts` — writes sibling `project-contributions.json` at build time.
- `app/projects/[slug]/page.tsx` — renders `<TopContributors>` + `<AskGBrainButton>`.
- `app/members/[slug]/page.tsx` — renders "Edit profile" link when viewing self.

### Test infrastructure

- `_test-profile-store.ts` + `/api/test-reset-profile` — in-memory SHA-CAS mock for E2E save flow (mirrors `_test-consent-store.ts` pattern).
- `app/actions/save-profile.ts`, `app/me/edit/page.tsx`, `app/api/me/delete/route.ts` — `isE2EMockActive()` branches for E2E mode (gated on `NEXT_PUBLIC_E2E_MODE === "1"` AND `NODE_ENV !== "production"`).

### Not changed

- `lib/markdown.ts` audit boundary remains the single HTML-insertion site.
- `proxy.ts` PUBLIC_PATHS — `/me/edit` is authenticated by default (no carve-out).
- GDPR endpoints (`/api/me/{export,delete}`) — no API change.
- §6.1 classification rule remains dormant (no DB; v0.3+ scope).
- Health metric §2 goal 8 — still weekly active posters / total roster.

### Migration / release

- Set `GBRAIN_BASE_URL` on Vercel production + preview if GBrain prod URL is ready. Otherwise leave unset (button silently absent — graceful degradation).
- See spec §12.9.2 ship-day runbook.
- Tag: `community-platform-v0.2.0`.

---

## [0.1.1] — 2026-05-04

**Personal-invitation registration shipped.** Admin mints HMAC-signed `/onboard?token=…` URL → invitee redeems → `warsaw-ai-bot` writes 4 files atomically (roster + git-email-aliases + invitations ledger + member profile). Replaces the manual Telegram-then-PR roster backfill workflow.

- **Architecture (spec §11):** stateless tokens — HMAC-SHA-256 over canonical-JSON payload, base64url-encoded, RFC 4122 v4 JTI, 7-day TTL. Trust = signature valid + `exp > now()` + JTI not in ledger + redeemer-handle not in roster. The token IS the state.
- **Surfaces:** `/admin/invite` (admin RBAC), `/onboard` (3 render branches: signin / form / 404), `/onboard/error` (generic info-leak-resistant 404). `/admin/health` pattern reused for the admin gate.
- **13 hardenings (H1–H13)** under `describe("H<n>: …")` test prefixes — single grep at DoD verifies all present:

  | ID | Property |
  |---|---|
  | H1 | HMAC-SHA-256 + canonical-JSON + `crypto.timingSafeEqual` |
  | H2 | JTI replay defense via append-only ledger |
  | H3 | Manual revocation via append-only ledger |
  | H4 | `Referrer-Policy: no-referrer` + `X-Frame-Options: DENY` + `Cache-Control: no-store` on `/onboard*` |
  | H5 | First-GET handoff in `proxy.ts` (token consumed → cookie set → 302 to clean URL) |
  | H6 | `__Secure-warsaw_invite` cookie (HttpOnly + Secure + SameSite=Strict + Path=/onboard + 24h) — dev fallback `warsaw_invite` (no Secure) |
  | H7 | `logRedemptionEvent` whitelist logger — never emits token / secret / form PII |
  | H8 | Zod `.object({})` whitelist (mass-assignment defense) |
  | H9 | https-only link validation + max 200 chars |
  | H10 | Newline rejection on display_name + focus |
  | H11 | YAML-safe emitter (`yamlString` = `JSON.stringify`) — closes YAML 1.1 implicit-typing risks |
  | H12 | Slug collision + reserved-slug policy (`-2` … cap at `-9`) |
  | H13 | Retry-once on 409 sha_conflict, with re-read of ledger before re-attempt |

- **Tests:** 475 unit/integration (was 294 in v0.1.0) + 26 E2E (was 19). Coverage: 88% lines / 92% branches; v0.1.1 strict-list additions at 100% lines (lib/invitations.ts has 7 unreachable post-guard branches, accepted).
- **Security review (2026-05-04):** 0 CRITICAL / 0 HIGH / 2 MEDIUM (M1 + M2 fixed inline at SHA `399e1a8`) / 3 LOW (deferred — no blocking issue). All 13 hardenings verified clean.

### Added

- `lib/slug.ts` — promoted `slugify` from `lib/roster.ts`; new `RESERVED_SLUGS` + `nextAvailableSlug`.
- `lib/yaml-string.ts` — H11 helper.
- `lib/consent-content.ts` — extracted `generateConsentMarkdown` (DRY for consent + redemption flows).
- `lib/invitations.ts` — `canonicalJson`, `mintToken`, `verifyToken`, `RedeemFormSchema`, ledger parser + row generators, `logRedemptionEvent`, orchestrator `redeemInvitation`.
- `lib/roster.ts` — `appendMember` (5-col Members table writer).
- `lib/git-email-aliases.ts` — `appendAlias` with case-insensitive duplicate guard.
- `lib/github-app.ts` — `commitMultipleFiles` (atomic blob×N → tree → commit → updateRef with CAS) + `getHeadSha`.
- `lib/env.ts` — `INVITE_SECRET` required (min 32 chars, sensitive).
- Routes: `app/admin/invite/page.tsx`, `app/onboard/page.tsx`, `app/onboard/error/page.tsx`, `app/onboard/not-found.tsx`, `app/api/test-reset-invitations/route.ts` (dev only), `app/api/test-mint-expired/route.ts` (dev only).
- Components: `app/components/InviteUrlDisplay.tsx`, `app/components/InviteForm.tsx`, `app/components/OnboardForm.tsx` (with soft-binding banner).
- Server actions: `app/actions/mint-invitation.ts`, `app/actions/redeem-invitation.ts`, `app/actions/_test-invitation-store.ts`.
- `community/members/invitations.md` — empty append-only ledger seed.
- E2E: `e2e/invitation.spec.ts` (7 scenarios — happy + invalid + expired + replayed + already-member + form-fail + soft-binding banner with H4 header assertion).

### Changed

- `community/members/roster.md` — Members table migrated 4-col → 5-col (Telegram added). Mark Spasonov's Telegram cell intentionally blank (backfilled via separate PR per Q6 lock).
- `app/actions/consent.ts` — uses extracted `generateConsentMarkdown`. Member profile YAML frontmatter `name` + `consented_at` now double-quoted (H11) — closes YAML 1.1 implicit-typing risks.
- `proxy.ts` — `/onboard` + `/onboard/error` added to PUBLIC_PATHS; `/api/test-reset-invitations` + `/api/test-mint-expired` added to dev-only PUBLIC_PATHS; H5 invite handoff (cookie-set + redirect-to-clean-URL) moved into proxy because Next 16 disallows `cookies().set()` in Server Components.
- `app/onboard/page.tsx` — three render branches with `notFound()` short-circuits; soft-binding banner conditionally rendered when `hint_telegram` present.

### Reused (plan refinement, not addition)

- Existing `isAdmin` from `lib/content-snapshot.ts` (matches `/admin/health` pattern). Spec §11.3 said "Add isAdmin" but v0.1 already had a synchronous, governance-snapshot-backed version. Admin semantics for v0.1.1 = handle in `community/governance/admins.md`.

### Pre-release ops

- `INVITE_SECRET` provisioned on production + preview (distinct values, sensitive).
- Preview env vars re-scoped from `warsaw-org-and-stack-guide` → all preview branches via Vercel REST API PATCH on `gitBranch` (no value handling required).
- §11.7 DoD checklist verified; H1–H13 grep returns 16 hits across 13 unique hardening identifiers.

### Spec + plan

- Spec §11 at SHA `740be8e`. Plan: `v0.1.1-plan.md` at SHA `2201dd9`.

---

## [0.1.0] — 2026-05-03

**Released.** Lite-slice platform shipped to https://warsaw-ai-community-platform.vercel.app — see Phase 10 entries below for the ship sequence + acceptance verification log.

- **Surface:** GitHub OAuth + JWT sessions, roster-only proxy gate, member directory + profile, project / decision / meeting archive readers, status updates with GitHub App writer to `community/status/YYYY-Wnn/`, GDPR export/delete on own profile, admin health metric (`/admin/health`).
- **Stack:** Next.js 16.2.4 + Vercel + NextAuth 5.0.0-beta.31 + GitHub App `warsaw-ai-bot` for git writes. 100% git-resident storage (no DB) — classification rule documented for v0.2+.
- **Tests:** 294 unit/integration + 19 E2E green at SHA `b26a8c2`; coverage 84.73% lines / 93.7% branches; spec §8 strict-list at 100%.
- **Live verification (production, 2026-05-03):** OAuth round-trip → consent commit (bot write to `main`) → status post (bot commit `5b5699b status: anton1rsod for 2026-W18`) → admin health metric rendering 1/2 = 50% active posters (hits v0.1 launch target). Every layer of the credential chain operational under real production traffic.

(Phase-by-phase notes below — preserved from the running `[Unreleased]` log as the v0.1.0 historical record.)

### Added — Spec, plan, pre-launch, and handoff documentation
- Project scaffold: `README.md`, `spec.md` (stub), `plan.md` (stub), this changelog.
- Locked inputs in `spec.md` §0: four-role access model, gamification in scope, OSS-first, Telegram-complementary posture.
- Cross-links to sister projects (`persona-builder/`, `projects/gbrain/`) and program governance.
- **`spec.md` §1–§10 written** via `superpowers:brainstorming` (commit `97ccea2`, 2026-05-01).
  - Lite slice locked: identity + memory spine + one write surface (status updates).
  - Stack: Next.js 15 + Vercel + GitHub OAuth (JWT sessions) + GitHub App `warsaw-ai-bot`.
  - Storage: 100% git for v0.1; classification rule documented for v0.2+ DB return.
  - Long-term commitments captured in §10 (storage trajectory, federation horizon, OSS/commercial separation, gamification phasing, health metric).
- **`plan.md` written** via `superpowers:writing-plans` (commit `6f72f5c`, 2026-05-01).
  - 74 tasks across 11 phases (0–10). Each task: Files / failing test / run command / minimal implementation / passing-test verification / commit message.
  - Conventions section locks pnpm-only, ESM, strict TS, coverage gates (80% / 100% on auth-RBAC-classification-bot-week).
- **Minimal pre-launch landed** (commit `a736b38`, 2026-05-01).
  - Task 0.1: founder added to `community/members/roster.md` with handle `@anton1rsod`. Other 18 members remain `*(TBD)*` and cannot log in until updated.
  - Task 0.2: `community/governance/admins.md` created with founder; `community/governance/community-managers.md` created empty.
  - Task 0.3: deferred to Phase 7 prep (meeting attendees format will be retrofitted when contributions counter ships).
- **Handoff documentation** (commit `0fe4e78`, 2026-05-01): `HANDOFF.md` — cold-pickup reference compressing brainstorm + spec + plan journey for future readers (227 lines).
- **Execution plan** (commit `3194925`, 2026-05-01): `execution-plan.md` — subagent dispatch playbook with 7-chat session-division strategy, plan amendments, and per-phase risk register (396 lines).

### Phase 0 — Bootstrap (complete, 2026-05-01)

Last green commit: pending closeout (this entry's commit).

- **Pre-launch (already done minimally pre-Phase 0, commit `a736b38`):** founder added to `community/members/roster.md` (`@anton1rsod`); `community/governance/admins.md` and `community/governance/community-managers.md` created. Task 0.3 (meeting `## Attendees` format) deferred to Phase 7 prep.
- **Task 0.4** (commit `5412025`) — Next.js App Router skeleton (TS strict, ESM, pnpm).
- **Task 0.5** (commit `caa360e`) — ESLint 9 flat config + `next-env.d.ts` / `*.tsbuildinfo` gitignore extras.
- **Task 0.6** (commit `93be948`) — Husky + lint-staged pre-commit hook with monorepo-aware `core.hooksPath` set via `prepare` script.
- **Task 0.7** (commit `31eecc2`) — Vitest 2 + v8 coverage + smoke test (`pnpm test`, `pnpm test:coverage`).
- **Task 0.8** (commit `67651a3`) — Playwright + Chromium browser + smoke E2E (`pnpm e2e` green).
- **Task 0.9** (commit `b2a5fd1`) — Tailwind 3.4 + PostCSS + autoprefixer.
- **Task 0.10** (commit `359ff3d`) — TDD: `lib/env.ts` Zod env contract; 100% coverage. Root `.gitignore` allows `.env.local.example`.
- **Task 0.11** (commit `486508d`) — TDD: `lib/classification.ts` §6.1 rule as code; 100% coverage.
- **Plan amendment** (commit `528f24c`) — Bumped `next` from `15.0.4` → `16.2.4` because Vercel rejected the deploy at 15.0.4 (CVE-2025-66478). Companion bumps: `react` `19.0.0` → `19.2.0`, `eslint-config-next` to `16.2.4`. Config tweaks: `next.config.ts` `experimental.typedRoutes` → top-level `typedRoutes` (now stable in 16); `tsconfig.json` `jsx: preserve` → `react-jsx` (auto-applied by Next 16); `package.json` `lint` script: `next lint` → `eslint .` (next lint removed in 16).
- **Task 0.12** (commit `b3c5386`) — Vercel project linked: `anton-9351s-projects/warsaw-ai-community-platform`. Git-connected to `github.com/anton1rsod/warsaw-ai-community-gbrain`. 13 env vars on production + 13 on preview (preview-scoped to `warsaw-org-and-stack-guide` branch — broaden to all preview branches in Phase 1 if needed). `vercel.json` written. First successful preview deploy: `dpl_3gcrBvwKFFHSEKB8MouoRKHmwpx9` — Ready. URL is gated by Vercel Deployment Protection (default for Hobby plan); roster-only NextAuth gate ships in Phase 1.

**Phase 0 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 6 tests pass; 100% lines/branches/functions/statements on `lib/env.ts` + `lib/classification.ts`. 80% coverage thresholds enabled in `vitest.config.ts`.
- `pnpm build` — 4 routes, all static
- `pnpm e2e` — 1 pass (home page renders)

**Repo migration (post-closeout, 2026-05-01):**
- Created new private repo: https://github.com/anton1rsod/warsaw-ai-community (umbrella name; replaces the legacy `warsaw-ai-community-gbrain` repo whose name no longer reflects its monorepo scope).
- All commits + tags (`gbrain-v0.1.0`, `gbrain-v0.1.1`) pushed.
- Vercel project `anton-9351s-projects/warsaw-ai-community-platform` reconnected to new repo URL.
- Vercel env `GITHUB_REPO_NAME` updated from `warsaw-ai-community-gbrain` → `warsaw-ai-community` (production + preview-on-warsaw-org-and-stack-guide).
- Re-deploy verified Ready: `dpl_3hXeCEef8eSUvmZm9MTm4q6HpKp5`.
- Old repo `anton1rsod/warsaw-ai-community-gbrain` left untouched on GitHub (decision deferred — likely archive after v0.1.0 ship).
- Repo will flip to public at v0.1.0 ship per spec §0.5 (OSS-first / no public marketing pre-v0.1) + ADR-0001 (MIT licensing).

### Phase 1 — Auth + RBAC (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `5b03e4b` (review fixes).

**13 tasks shipped, 75 unit tests + 4 E2E green, 100% coverage on the spec §8 strict-list modules.**

- **Task 1.1** (commit `226ec27`) — `lib/roster.ts` header-aware parser per §9.1 amendment. Detects GitHub column by `/^github$/i` per table; multi-table-aware; skips `*(TBD)*` rows + empty/TBD handles. Mirrors actual `community/members/roster.md` two-table layout in fixture. 10 unit tests.
- **Task 1.2** (commit `955ca3d`) — `lib/governance.ts` reads `admins.md` + `community-managers.md`. Set-backed `isAdmin` / `isCommunityManager` predicates. 8 unit tests.
- **Task 1.3** (commit `e749660`) — `lib/rbac.ts` resolves admin / community_manager / member / guest. Admin-must-be-on-roster invariant. 14 unit tests; 100% coverage.
- **Task 1.4 [H]** — Anton creates GitHub OAuth App + sets `GITHUB_OAUTH_CLIENT_ID` / `_SECRET` on Vercel preview. **Pending Anton's manual step at closeout time**; OAuth callback URL is `https://warsaw-ai-platform.vercel.app/api/auth/callback/github` (short alias claimed in §9.11).
- **Task 1.5** (commit `9ea1ee1`) — `lib/auth.ts` NextAuth config. **Bumped to `next-auth@5.0.0-beta.31`** per amendment §9.8. JWT session strategy; `session.maxAge` from env; jwt callback writes lowercase `githubHandle` from GitHub `profile.login`; session callback exposes it to client via Module augmentation. Vitest config required `server.deps.inline: ["next-auth", "@auth/core"]`. 9 unit tests; 100% coverage.
- **Task 1.6** (commit `adb4ef4`) — NextAuth catch-all route at `app/api/auth/[...nextauth]/route.ts` re-exports `handlers` from `lib/auth.ts`.
- **Task 1.7** (commit `c0993bf`) — `/login` page. Server Component (env access) + Client Component (`LoginForm.tsx` with CSRF dance). **Client-side form POST to `/api/auth/signin/github`** instead of broken `signIn` server action per amendment §9.8 (Issue #13388).
- **Task 1.8** (commit `5132ec0`) — `/no-access` page for non-roster users; server-action `signOut` (signOut is unaffected by #13388).
- **Task 1.9** (commit `a31d3b3`) — Build-time content snapshot. `scripts/snapshot-content.ts` reads roster + governance from monorepo root, writes `lib/__generated__/content-snapshot.json`. `lib/content-snapshot.ts` wraps it with synchronous helpers (`snapshot`, `isAdmin`, `isCommunityManager`, `findMemberByHandle`). pnpm pre-hooks (`predev`, `prebuild`, `prelint`, `pretypecheck`, `pretest`, `pretest:coverage`, `pree2e`) auto-run snapshot. Generated dir gitignored. 12 unit tests.
- **Task 1.10** (commit `d59906d`) — Auth proxy middleware. **`proxy.ts`, not `middleware.ts`**, per amendment §9.7 (Next 16 deprecated middleware filename). 14 unit tests; 100% coverage per spec §8.
- **Task 1.11** (commit `56a49c5`) — `/home` shell page (server-rendered with `auth()` for session); root `/` now redirects to `/home`. Smoke E2E updated: unauthenticated visit to `/` follows redirect chain to `/login`.
- **Task 1.12** (commit `961b507`) — E2E auth flow + dev-only `/api/test-auth` route. Three paths covered: unauthenticated → `/login`, non-roster → `/no-access`, roster member (`anton1rsod`, also founder/admin) → `/home`. The test-auth route encodes a NextAuth-compatible JWT cookie via `next-auth/jwt` `encode()` with matching salt; hard-gated to `NODE_ENV !== "production"`. **Proxy refactored to use manual JWT `decode()`** instead of `auth()` helper (which only works in RSC / Route Handlers) per amendment §9.9.
- **Reviewer fixes** (commit `5b03e4b`) — typescript-reviewer + code-reviewer HIGH/MEDIUM addressed:
  - `proxy.ts`: `console.error` for decode failures + JWT-shape-drift signal (cookie-name-drift visibility); `/.well-known` added to `PUBLIC_PREFIXES`.
  - `lib/content-snapshot.ts`: Set-backed `isAdmin` / `isCommunityManager` for O(1) lookups (matching governance.ts).
  - `LoginForm.tsx`: validate CSRF response shape before reading `csrfToken`.
  - `lib/auth.ts`: drop superfluous session-callback cast (Session augmentation makes direct property assignment compile cleanly).
  - `app/api/test-auth/route.ts`: comment on `secure: false` localhost intent.

**Phase 1 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 9 test files, 75 tests pass. Coverage: 86.86% all files; **100% on `lib/{auth,rbac,classification,content-snapshot,env,governance,roster}.ts` + `proxy.ts`** (governance.ts and roster.ts have unreachable defensive `??` branches at 94% and 84% respectively — structurally unreachable with valid markdown). `scripts/snapshot-content.ts` at 0% (CLI tool; transitively tested via consumers).
- `pnpm build` — 5 routes (`/`, `/home`, `/login`, `/no-access`, `/api/auth/[...nextauth]`, `/api/test-auth`) + `ƒ Proxy (Middleware)` detected by Next 16
- `pnpm e2e` — 4 tests pass: smoke + 3 auth-flow

**Plan amendments applied during this phase (§9.5–§9.11 in `execution-plan.md`):**
- §9.5 Phase 0 closeout — `next 15.0.4 → 16.2.4` bump (Vercel rejected at 15.0.4 per CVE-2025-66478)
- §9.6 Phase 0 closeout — preview env vars scoped per-branch
- §9.7 Phase 1 — `proxy.ts` (Next 16 canonical) replaces `middleware.ts`
- §9.8 Phase 1 — `next-auth@5.0.0-beta.31` (bumped from plan's beta.25); client-side form POST sign-in (Issue #13388 workaround)
- §9.9 Phase 1 — proxy uses manual `decode()` from `next-auth/jwt`, not `auth()` helper
- §9.10 Phase 1 — Vercel project Root Directory must be `projects/community-platform` (currently null after repo migration; Anton fixes in dashboard)
- §9.11 Phase 1 — short alias `warsaw-ai-platform.vercel.app` claimed for the project

**Phase 1 live-validation update (2026-05-01, post-closeout commits):**
- §9.10 Vercel Root Directory fix landed. Anton set `rootDirectory: "projects/community-platform"` in dashboard. Verified via `vercel pull` + empty-commit `2e0ddab` triggered a successful auto-deploy in 30s (previous attempts failed in 2-3s with "No Next.js version detected").
- Task 1.4 GitHub OAuth App created. Callback URL: `https://warsaw-ai-platform.vercel.app/api/auth/callback/github`. Client ID + Secret force-overwritten on Vercel preview env. NEXTAUTH_URL discovered as empty (Vercel sensitive-env interaction); reset to `https://warsaw-ai-platform.vercel.app` via `vercel env add ... --value ... --no-sensitive --yes`. Redeploy `qknxzwpbn` aliased to `warsaw-ai-platform.vercel.app`.
- **Live OAuth round-trip validated end-to-end on preview**: `@anton1rsod` signs in with GitHub → callback → `/home` with role label "admin". Phase 1 acceptance loop closed.

**Outstanding (parallel to Phase 2):**
- Roster `github_handle` backfill for the other 18 members (`*(TBD)*` placeholders) — non-founder logins require this. Tracked outside Phase 1 acceptance.

### Phase 2 — Member directory + profiles (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `b215eab`.

**7 implementation tasks shipped, 96 unit tests + 6 E2E green, 100% coverage on the markdown sanitization gate and SafeHtml/PersonaPanel components.**

- **Task 2.1** (commit `d88c3a2`) — `lib/markdown.ts` parser via gray-matter + sanitized renderer (unified pipeline: `remark-parse` → `remark-gfm` → `remark-rehype{allowDangerousHtml:false}` → `rehype-sanitize{defaultSchema}` → `rehype-stringify`) + `truncateToFirstH2`. Output is safe-by-construction; downstream rendering reads pre-sanitized strings. 8 unit tests; 100% coverage.
- **Task 2.2** (commit `2c21e12`) — `readMemberProfile` + `readMemberPersona` helpers in `lib/roster.ts`; snapshot script extended to embed profile + persona per member; `lib/content-snapshot.ts` exposes `MemberWithProfile`, `findMemberBySlug`, `listMembers`. +17 tests; `lib/content-snapshot.ts` 100% coverage maintained.
- **Task 2.3** (commit `af56dea`) — `app/components/SafeHtml.tsx` centralizes sanitized HTML insertion (single audit-bounded React HTML-insertion site — the `react/no-danger` surface). Vitest config gains `environmentMatchGlobs` (jsdom for `.tsx` tests) + `setupFiles` (jest-dom matchers); coverage `include` adds `app/components/**/*.tsx`. **Vitest config preserves Phase-1's `server.deps.inline: ["next-auth", "@auth/core"]`** (the plan's drop-in replacement omitted it and would have broken auth tests). 2 unit tests; 100% coverage.
- **Task 2.4** (commit `47445ea`) — `PersonaPanel` component (uses `SafeHtml`; renders fallback section on null persona). 2 unit tests; 100% coverage.
- **Task 2.5** (commit `35dc709`) — `/members` directory page (server component listing roster from snapshot).
- **Task 2.6** (commit `42e1f08`) — `/members/[slug]` profile page with `generateStaticParams`; renders profile via `SafeHtml` + `PersonaPanel`; profile-fallback when no `community/members/<slug>.md`.
- **Task 2.7** (commit `b215eab`) — E2E `e2e/members.spec.ts` covers directory + profile navigation + persona panel visibility. **Plan's `test.beforeEach({ request })` pattern fixed to use `page.request.post()`** via a local `loginAs(page, handle)` helper (matching Phase 1's auth.spec.ts pattern); standalone `request` fixture cookies don't transfer to `page`.

**Phase 2 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 12 files, 96 tests pass. Coverage: 86.8% all files; **100% on `lib/{auth,classification,content-snapshot,env,markdown,rbac}.ts` + `proxy.ts` + `app/components/{PersonaPanel,SafeHtml}.tsx`**. `governance.ts` 94.28% branches (Phase-1 unreachable defensive branches); `roster.ts` 81.39% branches / 96.42% lines (Task 2.2 added defensive ENOENT/non-Error paths — both above the 80% gate). `scripts/snapshot-content.ts` at 0% (CLI tool; transitively tested via consumers, same as Phase 1).
- `pnpm build` — 7 routes (`/`, `/home`, `/login`, `/members`, `/members/[slug]` SSG → `/members/anton-safronov`, `/no-access`, `/_not-found`) + 2 functions (`/api/auth/[...nextauth]`, `/api/test-auth`) + `ƒ Proxy (Middleware)`.
- `pnpm e2e` — 6 tests pass: smoke + 3 auth-flow + 2 members.

**Plan amendments applied during this phase (§9.12 + §9.13 in `execution-plan.md`):**
- §9.12 Phase 2 — `vitest.config.ts` merge preserves Phase-1 `server.deps.inline`; coverage `include` scoped to `app/components/**/*.tsx` (not full `app/**` — would dilute overall coverage from uncovered server-component pages).
- §9.13 Phase 2 — E2E auth-via-test-auth must use `page.request.post()` (cookies on standalone `request` fixture don't reach `page`).

### Phase 3 — Document readers (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `b4475f0`.

**8 implementation tasks shipped + 1 batched reviewer-fix commit, 137 unit tests + 9 E2E green, 100% coverage on the spec §8 strict-list.**

- **Task 3.1** (commit `1a386fb`) — `lib/projects.ts` reads `projects/<slug>/{README,spec,plan,CHANGELOG}.md` (all optional); `listProjects` excludes `_template`-prefixed and dotted dirs; `readProject` rejects path traversal. Snapshot extended with `projects: readonly ProjectDetail[]` + `listProjectDetails` + `findProjectBySlug`. +22 tests; `lib/projects.ts` at 94.52% (defensive non-ENOENT throws unreachable without fs mocking).
- **Task 3.2** (commit `44a3a76`) — `/projects` index + `/projects/[slug]` detail page with `generateStaticParams`; renders README/spec/plan/CHANGELOG sections via `SafeHtml`. Build SSG'd `/projects/community-platform` (self-reference) + `/projects/gbrain`.
- **Task 3.3** (commit `d2244e7`) — `lib/decisions.ts` reads `docs/decisions/NNNN-*.md`; extracts `**Status:**` and `**Date:**` from body. Snapshot extended with `decisions` + helpers. +20 tests; 11 production ADRs in built snapshot.
- **Task 3.4** (commit `e29bb29`) — `/decisions` index + `/decisions/[slug]` detail; SSG'd 11 ADR pages.
- **Task 3.5** (commit `6c4b1a1`) — `lib/meetings.ts` reads `community/meetings/weekly/YYYY-MM-DD.md`; `parseAttendees` extracts `## Attendees` section bullets, ignoring HTML-comment placeholders. **Plan's regex used invalid `\z` anchor** — replaced with JS-valid `$(?![\s\S])` end-of-string assertion. **Plan also reused `FILE_RE` (with `.md$`) on bare slug in `readMeeting`** — added separate `SLUG_RE`. +14 tests; `lib/meetings.ts` at 97.53%; production weekly dir is empty (`_template.md` and `README.md` skipped) so snapshot reports 0 meetings until Anton publishes notes.
- **Task 3.6** (commit `66f9878`) — `/meetings` index (with empty-state copy) + `/meetings/[slug]` detail.
- **Task 3.7** (commit `06fd62e`) — E2E `e2e/archives.spec.ts` covers `/projects` listing, `/decisions` listing + ADR open, `/meetings` heading visibility (empty-state tolerant). Uses `loginAs(page, "anton1rsod")` per §9.13.
- **Reviewer fixes** (commit `b4475f0`) — `typescript-reviewer` + `code-reviewer` HIGH/MEDIUM addressed:
  - HIGH `lib/content-snapshot.ts`: Set-backed `isAdmin` / `isCommunityManager` restored (Task 2.2 lost the O(1) contract during wholesale replacement; auth path runs per protected request).
  - HIGH `scripts/snapshot-content.ts`: 3 `as` casts that hid `null` branches from `readProject` / `readDecision` replaced with explicit null-throws (`Error("[snapshot] readX returned null for slug \"…\" — listX/readX contract violation")`).
  - MEDIUM `lib/decisions.ts` + `lib/meetings.ts`: bare `catch {}` replaced with isENOENT-rethrow (non-ENOENT errors now surface as 500s rather than silently 404ing).
  - MEDIUM `lib/roster.ts`: path-traversal guards on `readMemberProfile` + `readMemberPersona`; deterministic `.md` pick in persona reader (sort first; `readdir` order isn't guaranteed alphabetical across filesystems).

**Phase 3 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 15 files, 137 tests pass. Coverage: 85.47% all files; **100% on `lib/{auth,classification,content-snapshot,env,markdown,rbac}.ts` + `proxy.ts` + `app/components/{PersonaPanel,SafeHtml}.tsx`** (spec §8 strict-list + Phase 2-3 critical components). Filesystem readers above 80% gate: `lib/decisions.ts` 93.44% / 66.66% branches (defensive guards unreachable), `lib/meetings.ts` 97.53% / 89.65% branches, `lib/projects.ts` 94.52% / 88.88% branches, `lib/roster.ts` 96.55% / 84.31% branches. `governance.ts` 94.28% branches. `scripts/snapshot-content.ts` at 0% (CLI tool, transitively tested via consumers).
- `pnpm build` — 13 routes (5 static + 8 SSG): `/`, `/_not-found`, `/home`, `/login`, `/no-access`, `/members` (+ `/members/anton-safronov`), `/projects` (+ `/projects/community-platform`, `/projects/gbrain`), `/decisions` (+ 11 ADR pages), `/meetings` (0 detail paths until notes ship) + 2 functions (`/api/auth/[...nextauth]`, `/api/test-auth`) + `ƒ Proxy (Middleware)`.
- `pnpm e2e` — 9 tests pass: smoke + 3 auth-flow + 2 members + 3 archives.

**Plan amendments applied during this phase (§9.14 + §9.15 in `execution-plan.md`):**
- §9.14 Phase 3 — `lib/meetings.ts` regex fixes: `parseAttendees` `\z` → `$(?![\s\S])`; `readMeeting` separate `SLUG_RE` for bare slugs.
- §9.15 Phase 3 — snapshot script throws on `readProject`/`readDecision` null instead of casting (the plan's `as` casts hid the null branch and would emit a `null` entry typed as non-null into the JSON snapshot).

### Phase 4 — GitHub App writer (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `5e07373`.

**1 implementation task shipped (Task 4.2) + 1 batched reviewer-fix commit, 167 unit + integration tests pass, 100/100/100/100 coverage on `lib/github-app.ts` (spec §8 strict-list).**

- **Task 4.1 [H]** — Anton creates `warsaw-ai-bot` GitHub App + PEM + sets `GITHUB_APP_ID` / `_PRIVATE_KEY` / `_INSTALLATION_ID` on Vercel preview. **Pending Anton's manual step**; the wrapper integration tests use a self-generated PEM at `tests/fixtures/test-app.private-key.pem` (signs JWTs that GitHub would reject — no matching App ID — and grants no real privileges, per plan amendment §9.3). The `scripts/smoke-github-app.ts` real-API verification is gated on Anton's manual step.
- **Task 4.2** (commit `7e1ee81`) — `lib/github-app.ts` Octokit + auth-app wrapper. `createGitHubApp(config)` returns `{ readFile, writeFile, deleteFile }`. `GitHubAppError` taxonomy: `sha_conflict` (409) / `not_found` (404) / `forbidden` (401, 403) / `unknown`. SHA-based optimistic locking maps 409 → `kind: 'sha_conflict'` for Phase 5 status edits. Author / committer default to `warsaw-ai-bot@users.noreply.github.com`. MSW-based integration coverage (12 tests) + `mapError` unit coverage via synthetic inputs (10 tests). Adds `@octokit/rest@^21`, `@octokit/auth-app@^7`, `msw@^2`. `pretest:coverage` snapshot runs unaffected.
- **Reviewer fixes** (commit `5e07373`) — typescript-reviewer + code-reviewer + security-reviewer HIGH/MEDIUM addressed:
  - HIGH `lib/github-app.ts` `readFile`: distinguish directory (Array → null), symlink/submodule (non-file `type` → throw `unknown`), and >1MB `encoding=none` (→ throw `unknown` with size hint). Avoids silent null-on-non-file traps that Phase 5/6 callers could not diagnose.
  - HIGH `lib/github-app.ts` `mapError`: 401 → `forbidden` (token expiry mapped same as missing-scope for v0.1; future callers can split off an `unauthorized` kind without breaking existing handlers).
  - MEDIUM `lib/github-app.ts` `sanitizeCause`: strips `Authorization` header from the Octokit error before attaching as `cause`. Prevents installation token (`ghs_xxx`, 1h TTL, `contents:write`) from leaking via `console.error` or structured loggers.
  - MEDIUM `scripts/smoke-github-app.ts`: print char count + SHA only (never README content); exit 1 with clear message if README empty.
  - HIGH `eslint.config.js`: `no-console` error-level rule on production paths; allow `console.error` / `console.warn` (proxy.ts uses these for cookie / JWT decode signals so on-call has something to grep). `scripts/**` override allows `console.log` for CLI tools.
  - 8 additional tests for the new code paths (readFile non-file types, encoding=none, deleteFile 403/500, mapError 401, sanitizeCause edge cases).

**Phase 4 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings (with new `no-console` rule)
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 17 files, 167 tests pass. **`lib/github-app.ts` 100% lines / 100% branches / 100% functions / 100% statements** (spec §8 strict-list). Phase 1-3 strict-list modules retain 100% (`lib/{auth,classification,content-snapshot,env,markdown,rbac}.ts` + `proxy.ts` + `app/components/{PersonaPanel,SafeHtml}.tsx`). Overall: 84.10% lines / 91.66% branches (above 80% gate).
- `pnpm build` — 13 routes (no new pages this phase) + `ƒ Proxy (Middleware)`. `lib/github-app.ts` is server-only; `scripts/smoke-github-app.ts` is excluded from build.
- `pnpm e2e` — not required for Phase 4 per execution-plan §4.2 (only phases 1, 2, 3, 5, 6, 8 ship E2E coverage).

**Plan amendments applied during this phase (§9.3 in `execution-plan.md`):**
- §9.3 Phase 4 — test PEM committed to `tests/fixtures/test-app.private-key.pem`. Existing `.gitignore` exception (`!tests/fixtures/**/*.pem`) covers it. The key signs JWTs GitHub would reject (no matching App ID); MSW intercepts every test network call. No new amendments needed (all reviewer-fix changes are implementation bugs captured in commit messages, not architectural deviations).

**Outstanding (Anton-blocked, parallel to Phases 5-6):**
- Task 4.1 [H]: create `warsaw-ai-bot` GitHub App, install on `warsaw-ai-community` repo, set 3 env vars on Vercel preview. After env vars are real, run `pnpm tsx scripts/smoke-github-app.ts` to verify auth end-to-end. Phase 5's `/this-week` page and Phase 6's `/consent` page need this to work in preview.
- Roster `github_handle` backfill for the other 18 members (carries from Phase 1).

### Phase 5 — Status updates (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `75ce520`.

**6 implementation tasks shipped + 1 batched reviewer-fix commit, 221 unit + integration tests + 12 E2E pass, 100% coverage on `lib/week.ts` (spec §8 strict-list).**

- **Task 5.1** (commit `9c7c07f`) — `lib/week.ts` ISO 8601 helpers. Thursday-shift algorithm; year-cross + W53 boundary tests; `WEEK_REGEX` exported as the canonical token shape so Zod schemas don't drift. 16 unit tests; 100/100/100/100.
- **Task 5.2** (commit `2232990`) — `lib/status-reader.ts` runtime read via GitHub Contents API + commits API per file (parallel). Returns `[]` on 404 / on path-resolves-to-file (defensive); skips non-md entries; encoding=none (>1 MB) entries skipped; non-404 errors propagate. 6 MSW integration tests; 100/100/100/100.
- **Task 5.3** (commit `139db9f`) — `app/actions/status.ts` `postStatus` / `editStatus` / `deleteStatus`. Zod validation with `WEEK_REGEX` + `parseWeek`-refined week range (1..53); discriminated `StatusActionResult` union; `resolveAuthor` ensures member can only modify their own status; SHA-based optimistic locking maps `GitHubAppError.kind` → typed action errors. Frontmatter format: `week` / `author` / `updated_at`. 21 integration tests with mocked github-app + auth + content-snapshot; 100% lines / 97.56% branches (production NODE_ENV branch unreachable from the test runner).
- **Task 5.4** (commit `2cc5b54`) — `app/components/StatusEditor.tsx` client component with optimistic UI. Post / Update / Delete buttons; sha_conflict surfaces "Someone else updated this — refresh to see the latest."; `useTransition` for pending state. 10 RTL unit tests; 100/100/100/100.
- **Task 5.5** (commit `6ad9133`) — `/this-week` page (server component). Fetches installation token via `createAppAuth` (renamed locally to `ghAppAuth` to avoid shadowing imported `lib/auth`); reads current ISO week's statuses; splits self vs others; strips frontmatter via `parseMarkdown`; passes `postStatus` / `editStatus` / `deleteStatus` actions to `StatusEditor`. **`dynamic = "force-dynamic"`** for v0.1 (deferring 60s ISR per amendment §9.16; bot commit + propagation + cache + SHA-conflict timing risks captured in execution-plan §6.3 are easier to verify operationally without ISR). `<time dateTime={...}>` for lastModified rendering.
- **Task 5.6** (commit `be4822b`) — E2E status flow. `app/actions/_test-status-store.ts` in-memory mock on `globalThis` (required because Next 16's `"use server"` files bundle into a separate module graph from server components / route handlers; without `globalThis`, action writes and page reads land in different module instances). Mock gated on `NEXT_PUBLIC_E2E_MODE=1` + production NODE_ENV guard. `playwright.config.ts` sets the flag in `webServer.command`. `/api/test-reset-status` route handler (dev/E2E-only; in PUBLIC_PATHS only when NODE_ENV !== production). `e2e/status.spec.ts` 3 tests (post / edit / delete) with `describe.configure({ mode: "serial" })` + `beforeEach` reset+login. Uses `getByRole("status").toContainText()` for message assertions (getByText was strict-matching multiple elements).
- **Reviewer fixes** (commit `75ce520`) — typescript-reviewer + code-reviewer HIGH/MEDIUM addressed:
  - HIGH `app/actions/status.ts`: `WeekSchema` refined via `parseWeek` so W00/W54/W99 are rejected by Zod (the bare regex accepted them; writes would land at directory paths no reader surfaces).
  - HIGH `app/actions/_test-status-store.ts` `mockStatusActions.edit`: returns `not_found` when key absent (production semantics: GitHub returns 404 for SHA-bearing writes to missing files); without this the E2E happy path could exercise a success branch production never reaches.
  - HIGH `app/actions/_test-status-store.ts` `resolveAuthState`: distinguishes `not_authenticated` vs `not_a_member`. Without the split an unauthenticated Playwright call would return `not_a_member` and any guard test would pass for the wrong reason.
  - HIGH `app/actions/status.ts`: frontmatter field renamed `posted_at` → `updated_at` because both post and edit emit the current timestamp; `posted_at` would be misleading once an entry is edited. Phase 7 contributions counter reads git log dates, not this field, so renaming is safe.
  - MEDIUM `app/actions/status.ts`: production NODE_ENV guard wraps each `isE2EMode` branch as defense-in-depth.
  - MEDIUM `proxy.ts`: `/api/test-auth` + `/api/test-reset-status` removed from `PUBLIC_PATHS` when NODE_ENV === production. If `NEXT_PUBLIC_E2E_MODE` leaks to prod, proxy still redirects unauthenticated callers to /login and the route returns 404.
  - MEDIUM `lib/week.ts`: `WEEK_REGEX` exported as a single source of truth.
  - MEDIUM `app/this-week/page.tsx`: `<time dateTime>` for `lastModified` rendering.

**Phase 5 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 21 files, 221 tests pass. **100% on `lib/{auth,classification,content-snapshot,env,github-app,markdown,rbac,status-reader,week}.ts` + `proxy.ts` + `app/components/{PersonaPanel,SafeHtml,StatusEditor}.tsx`** (spec §8 strict-list + Phase 2-5 critical components). `app/actions/status.ts` 100% lines / 97.56% branches; `lib/governance.ts` 100% / 94.28% branches; `lib/{decisions,meetings,projects,roster}.ts` above 80% / 84% gate (defensive guards). Overall 87.28% lines / 93.59% branches. `scripts/{snapshot-content,smoke-github-app}.ts` at 0% (CLI tools); `app/actions/_test-status-store.ts` excluded from coverage (E2E-only).
- `pnpm build` — 14 routes (5 static + 8 SSG + `/this-week` ƒ Dynamic) + 3 functions (`/api/auth/[...nextauth]`, `/api/test-auth`, `/api/test-reset-status`) + `ƒ Proxy (Middleware)`.
- `pnpm e2e` — 12 tests pass: smoke + 3 auth-flow + 2 members + 3 archives + 3 status.

**Plan amendment applied during this phase (§9.16 in `execution-plan.md`):**
- §9.16 Phase 5 — `/this-week` ships with `dynamic = "force-dynamic"` instead of plan's `revalidate = 60`. Reason: ISR + bot commit propagation + 60s cache + SHA-conflict resolution interact in subtle ways (per execution-plan §6.3); a later iteration can re-introduce caching once the timing is operationally understood. Also: the E2E mock store leaks across cache windows in dev, which the dynamic path avoids.

**Outstanding:**
- Task 4.1 [H] still pending Anton (GitHub App + 3 env vars). `/this-week` works against the real bot once env vars are real; the smoke script (`pnpm tsx scripts/smoke-github-app.ts`) verifies end-to-end.
- Roster `github_handle` backfill for the other 18 members (carries from Phase 1).

### Phase 6 — Membership consent flow (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `3862ace` + the e2e accept test added in the closeout commit.

**4 implementation tasks shipped, 242 unit + integration tests + 16 E2E pass, 100% coverage on `proxy.ts` (spec §8 strict-list).**

- **Task 6.1** (commit `a9fa889`) — `app/actions/consent.ts` — `acceptConsent` (idempotent — skips writeFile when profile exists), `hasConsent(handle)` (false without API call for non-roster), `acceptConsentAndSetCookie` (sets `waic-consented` on success). E2E mock branch via `mockConsentStore` on `globalThis` per amendment §9.17 (Next 16's `"use server"` module split). 12 integration tests; 100/100/100/100 coverage on `consent.ts`.
- **Task 6.2** (commit `871b4f9`) — `ConsentModal` (aria-modal + labelledby + disabled prop forwards to both buttons during pending) + `/consent` page (server component redirect chain: unauth → /login, non-roster → /no-access, hasConsent → /home; `dynamic = "force-dynamic"` because `hasConsent`'s value can change between requests) + `ConsentClient` (useTransition wraps action; Accept routes to /home or /login on failure; Cancel calls `signOut({ callbackUrl: "/login" })`). `lib/consent-cookie.ts` exposes `CONSENT_COOKIE` (lives in `lib/` because `"use server"` modules can only export async functions). 5 RTL unit tests; 100/100/100/100 on `ConsentModal.tsx`.
- **Task 6.3** (commit `76d3027`) — `proxy.ts` consent gate. `/consent` added to `PUBLIC_PATHS`. After member check, redirects to `/consent` when `waic-consented` cookie is missing. Auth gate runs before consent gate so unauthenticated → `/login` not `/consent`. `/api/test-auth` route extended with optional `consented` field (defaults to `true` so existing E2E specs keep landing on their target pages; consent-flow tests opt out with `consented: false`). 21 unit tests on `proxy.ts` (4 new for the consent gate + 1 for the production NODE_ENV branch via `vi.stubEnv`).
- **Task 6.4** (commit `3862ace` + closeout commit) — `e2e/consent.spec.ts` 4 tests: first-time member sees modal, returning member skips, cancel lands on /login, **accept records consent and persists on next /home visit**. `loginAs(page, handle, { consented })` extended; `/api/test-reset-consent` reset endpoint mirrors `/api/test-reset-status`; `/api/test-reset-consent` added to dev-only `PUBLIC_PATHS`.

**Phase 6 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 23 files, 242 tests pass. **100% on `lib/{auth,classification,content-snapshot,env,github-app,markdown,rbac,status-reader,week}.ts` + `proxy.ts` + `app/actions/consent.ts` + `app/components/{ConsentModal,PersonaPanel,SafeHtml,StatusEditor}.tsx`** (spec §8 strict-list + Phase 2-6 critical components). `app/actions/status.ts` 100% lines / 97.56% branches; `lib/governance.ts` 100% / 94.28% branches; filesystem readers above 80% gate. Overall 86.7% lines / 93.28% branches.
- `pnpm build` — 16 routes (5 static + 8 SSG + `/this-week` + `/consent` ƒ Dynamic) + 4 functions (`/api/auth/[...nextauth]`, `/api/test-auth`, `/api/test-reset-status`, `/api/test-reset-consent`) + `ƒ Proxy (Middleware)`.
- `pnpm e2e` — 16 tests pass: smoke + 3 auth-flow + 2 members + 3 archives + 3 status + 4 consent.

**Plan amendments referenced (existing):**
- §9.7 + §9.9 — `proxy.ts` (NOT `middleware.ts`) with manual `decode()`. Consent gate folded into the existing pattern. ✓
- §9.13 — E2E auth helper uses `page.request.post()` so cookies propagate. `loginAs(page, handle, { consented })` extends the helper. ✓
- §9.17 — globalThis-backed mock store. `mockConsentStore` follows the same pattern. ✓
- §9.18 — proxy conditionally admits dev-only public paths under NODE_ENV. `/api/test-reset-consent` added under the same gate. ✓

**Reviewer note:**
- typescript-reviewer + code-reviewer agents were dispatched at closeout but both hit the org's monthly Claude usage limit before completing. Self-review pass instead: cookie name single source of truth ✓, auth precedes consent in proxy ✓, hasConsent skips GitHub for non-roster ✓, accept action is idempotent ✓. Added a 4th E2E test exercising the Accept happy path (the original 3 only covered redirect / skip / cancel — the Accept-then-/home flow was a gap).

**Outstanding:**
- Task 4.1 [H] still pending Anton (GitHub App + 3 env vars). `/this-week` and `/consent` work end-to-end against the real bot once env vars are real. The smoke script (`pnpm tsx scripts/smoke-github-app.ts`) verifies the full credential chain.
- Roster `github_handle` backfill for the other 18 members (carries from Phase 1).

### Phase 7 — Contributions counter (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `c850ec8`.

**4 implementation tasks shipped + security-reviewer signoff, 259 unit + integration tests + 16 E2E pass, 100% coverage on `lib/contributions.ts` (spec §8 strict-list addition).**

- **Task 7.1** (commit `d3c4aa8`) — `lib/contributions.ts` calculator: `computeContributions({ commits, meetings, roster })` returns per-handle `{ projectCommits, adrsFiled, meetingsAttended, statusPosts }`. Bot commits (`warsaw-ai-bot`, `warsaw-ai-bot[bot]`) excluded; non-roster authors dropped; author casing normalized to lowercase before lookup. ADR / status path matching via anchored regex literals. 10 unit tests; 100/100/100/100 coverage.
- **Task 7.2** (commit `825c6da`) — `scripts/build-contributions.ts` parses git log via `execFileSync('git', ['log', '--pretty=format:COMMIT|%H|%ae|%aI', '--name-only'])` — no shell, all args hardcoded constants, cwd is build-time `REPO_ROOT`. Email→handle mapping is best-effort (GitHub noreply pattern + local-part heuristic); junk handles drop because non-roster authors are ignored downstream. Output written to gitignored `lib/__generated__/contributions.json`. `package.json` `precontributions: pnpm snapshot` chains; all `pre*` hooks now invoke `pnpm contributions` (which transitively runs snapshot). `lib/content-snapshot.ts` exposes `getContributions(handle)` with case-insensitive normalization + `ZERO_CONTRIBUTIONS` fallback. 4 new content-snapshot tests; both `lib/contributions.ts` and `lib/content-snapshot.ts` retain 100% coverage.
- **Task 7.3** (commit `b7773a1`) — `app/components/ContributionCard.tsx`: 4-cell grid (project commits, ADRs filed, meetings attended, status posts) with `tabular-nums` digits; dark-mode borders. 3 RTL tests with `afterEach(cleanup)`; 100/100/100/100.
- **Task 7.4** (commit `c850ec8`) — `<ContributionCard>` wired into `app/members/[slug]/page.tsx` between the handle line and profile section. Card renders unconditionally (zeros for members with no signals).

**Phase 7 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 25 files, 259 tests pass. **100% on `lib/{auth,classification,content-snapshot,contributions,env,github-app,markdown,rbac,status-reader,week}.ts` + `proxy.ts` + `app/actions/consent.ts` + `app/components/{ConsentModal,ContributionCard,PersonaPanel,SafeHtml,StatusEditor}.tsx`** (spec §8 strict-list + Phase 2-7 critical components). `app/actions/status.ts` 100% lines / 97.56% branches; `lib/governance.ts` 100% / 94.28% branches; filesystem readers above 80% gate. Overall 83.74% lines / 94.37% branches. `scripts/build-contributions.ts` at 0% (CLI tool, transitively tested via consumers — same convention as `snapshot-content.ts` and `smoke-github-app.ts`).
- `pnpm build` — 16 routes (5 static + 8 SSG + `/this-week` + `/consent` ƒ Dynamic) + 4 functions + `ƒ Proxy (Middleware)`.
- `pnpm e2e` — 16 tests pass: smoke + 3 auth-flow + 2 members + 3 archives + 3 status + 4 consent. (First run hit 3 dev-mode cold-start timing flakes — `members.spec.ts:22`, `status.spec.ts:36`, `consent.spec.ts:52`. All passed on `--retries=2`. No regression.)

**Security review (Task 7.2 execFileSync surface, per execution-plan §6.5):**
- security-reviewer dispatched after Task 7.2 commit. Verdict: **CLEAN** across subprocess invocation (no shell, hardcoded args, build-time cwd), git-log output parsing (file paths never used for fs ops, only regex-tested), email→handle mapping (anchored regexes — no ReDoS, empty/malformed inputs drop at the `result[author]` lookup in `lib/contributions.ts`), JSON output handling (Record<string, Contributions> with numeric fields only — no injection vector). `.gitignore` `lib/__generated__/` correctly excludes the generated JSON.

**Reviewer note (carried-forward Phase 6 caveat):**
- typescript-reviewer + code-reviewer not dispatched at this closeout to preserve Anton's monthly Claude usage budget (Phase 6 closeout exhausted both before completing). Self-review against the handoff §"Self-review fallback" checklist: spec §8 strict-list at 100% ✓, subprocess exec hardcoded-args-only ✓, RTL tests include `afterEach(cleanup)` ✓, no new public paths in proxy.ts ✓.

**Outstanding:**
- Task 4.1 [H] still pending Anton (GitHub App + 3 env vars). `/this-week` and `/consent` work end-to-end against the real bot once env vars are real; Phase 8 GDPR delete needs them too.
- Roster `github_handle` backfill for the other 18 members (carries from Phase 1).

### Phase 8 — GDPR mechanisms (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `0436755` (security-reviewer fix).

**4 implementation tasks shipped + 1 batched security-reviewer fix, 275 unit + integration tests + 19 E2E pass, 100% coverage retained on the spec §8 strict-list.**

- **Task 8.1** (commit `4132c56`) — `app/api/me/export/route.ts` GET endpoint returns JSON for the authenticated caller only: `{ exportedAt, handle, member { name, slug, githubHandle, profile, persona }, contributions, statuses[], currentWeek }`. 401 when no session; 403 when authenticated but not on roster. Statuses scanned across last 12 ISO weeks (deduped) and filtered by `member.slug` derived from the session handle — no other member's data can leak. Token acquisition mirrors `/this-week`'s `getInstallationToken`. 3 integration tests with mocked `auth`, `github-app`, `status-reader`, `content-snapshot`, `@octokit/auth-app`.
- **Task 8.2** (commit `98e0260`) — `app/api/me/delete/route.ts` POST endpoint deletes `community/members/<slug>.md` (profile, may be absent — null-skip) and `community/status/<week>/<slug>.md` across the last 52 weeks. `slug` derived from session via `findMemberByHandle` — never from request body, so cross-user deletion is structurally impossible (execution-plan §6.6). `GitHubAppError.kind === 'not_found'` during status delete is treated as idempotent (TOCTOU-tolerant); other errors propagate. Profile delete uses read-time SHA so the write is consistent with what `readFile` observed. 7 integration tests covering 401, 403, profile happy path, profile-absent skip, cross-user filter, not_found idempotency, non-not_found propagation.
- **Task 8.3** (commit `0c83b49`) — `app/components/GdprPanel.tsx` client component (Export downloads JSON via Blob URL; Delete prompts `window.confirm` before POSTing). Wired into `app/members/[slug]/page.tsx` conditional on `isSelf` (session-derived). The page now reads `auth()` and ships `dynamic = "force-dynamic"`; `generateStaticParams` retained as documentation. 6 RTL tests with `URL.createObjectURL` assigned directly (jsdom doesn't expose it as a spy-able prototype method) + `afterEach` `restoreAllMocks`. 100/80/100/100 (defensive `unknown error` branches uncovered).
- **Task 8.4** (commit `faefc2e`) — `e2e/gdpr.spec.ts` 3 tests: proxy gate redirects unauthenticated callers (`maxRedirects: 0` + Location header assertion — the route's own 401 branch is unreachable in normal traffic because proxy short-circuits before the route runs); JSON return for authenticated caller (tolerates 5xx when real bot creds are unset — Anton's Task 4.1 still pending); `GdprPanel` renders on viewer's own profile.
- **Security-reviewer fix** (commit `0436755`) — defense-in-depth `WEEK_REGEX` guard at top of `readWeekStatuses`. The reviewer flagged `dirPath = \`community/status/\${opts.week}\`` as a future-refactor risk: all current callers derive `week` from `weekFromDate` / `currentWeek` so not exploitable today, but a refactor that threaded user-supplied input through the function would silently introduce path injection. Throws `'invalid week token'` before octokit is invoked; `lib/status-reader.ts` retained at 100/100/100/100 with 1 new test covering 3 malformed inputs (path traversal, empty, single-digit).

**Phase 8 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 28 files, 275 tests pass. **100% on `lib/{auth,classification,content-snapshot,contributions,env,github-app,markdown,rbac,status-reader,week}.ts` + `proxy.ts` + `app/actions/consent.ts` + `app/components/{ConsentModal,ContributionCard,PersonaPanel,SafeHtml,StatusEditor}.tsx`** (spec §8 strict-list + Phase 2-7 critical components). `app/components/GdprPanel.tsx` 100% lines / 80% branches (defensive `unknown error` fallbacks, well above 80% gate). Overall 84.41% lines / 94.06% branches. New `app/api/me/{export,delete}/route.ts` not in coverage `include` (route handlers; tested via integration tests).
- `pnpm build` — 17 routes (`/members/[slug]` flipped from SSG to ƒ Dynamic because the page reads `auth()` for the GdprPanel conditional) + 5 functions + `ƒ Proxy (Middleware)`.
- `pnpm e2e` — 19 tests pass: smoke + 3 auth-flow + 2 members + 3 archives + 3 status + 4 consent + 3 GDPR.

**Security review (Phase 8 GDPR endpoints, per execution-plan §6.6):**
- security-reviewer dispatched after Task 8.4 commit. Verdict on `/api/me/export` + `/api/me/delete`: **CLEAN** on cross-user slug derivation (session-only), self-only filters before mapping, SHA-locked deletes, token sanitization, proxy auth gate. **MEDIUM** on `lib/status-reader.ts` line 36 — defense-in-depth gap on the week format (already shipped as `0436755`). **LOW** on commit message handle embedding (already mitigated by `normalizeHandle` in `lib/roster.ts`; no shell involvement at the GitHub Contents API).

**Reviewer note (carried-forward Phase 6 caveat):**
- typescript-reviewer + code-reviewer not dispatched at this closeout (Anton's monthly Claude usage budget). Self-review against the handoff §"Self-review fallback" checklist: spec §8 strict-list at 100% ✓, GDPR delete slug from session not body ✓, GDPR export response includes only caller's data ✓, no new public paths in proxy.ts ✓, RTL tests include `afterEach` cleanup + restore ✓.

**Outstanding:**
- Task 4.1 [H] still pending Anton (GitHub App + 3 env vars). The export+delete endpoints work end-to-end against the real bot once env vars are real; Phase 8 E2E tolerates the credential gap with a 5xx-also-acceptable assertion.
- Roster `github_handle` backfill for the other 18 members (carries from Phase 1).

### Phase 9 — Health metric (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `18b0d9e`.

**2 implementation tasks shipped, 281 unit + integration tests pass, 100% coverage on `lib/health-metric.ts` (spec §8 strict-list addition). E2E not required for Phase 9 per execution-plan §4.2 (only phases 1, 2, 3, 5, 6, 8 ship E2E coverage).**

- **Task 9.1** (commit `1148fec`) — `lib/health-metric.ts` calculator: `computeHealthMetric({ roster, weekStatuses })` returns `HealthMetric { activePosters, totalMembers, ratio }`. Each member counted at most once per week (slug-deduped via `Set`); statuses whose slug is not on the roster ignored; `ratio = 0` when roster empty (no division-by-zero). Spec §2 goal 8, §10. 5 unit tests; 100/100/100/100.
- **Task 9.2** (commit `18b0d9e`) — `app/admin/health/page.tsx` admin-only page (`isAdmin` gate; redirect to `/home` for non-admins, `/login` for unauthenticated). Renders this-week's `activePosters / totalMembers` headline + 4-week trend table. Per execution-plan §9.2 — `export const revalidate = 60` set as documented. 4 `readWeekStatuses` calls fired in parallel via `Promise.all` (one per trend row, i=0 doubling as the current-week row) — 4 calls instead of plan's 5, also halves wall-clock time on cold caches.

**Phase 9 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 29 files, 281 tests pass. **100% on `lib/{auth,classification,content-snapshot,contributions,env,github-app,health-metric,markdown,rbac,status-reader,week}.ts` + `proxy.ts` + `app/actions/consent.ts` + `app/components/{ConsentModal,ContributionCard,PersonaPanel,SafeHtml,StatusEditor}.tsx`** (spec §8 strict-list + Phase 2-9 critical components). `app/components/GdprPanel.tsx` 100%/80% (defensive `unknown error` fallbacks). Overall 84.6% lines / 94.16% branches (above 80% gate).
- `pnpm build` — 18 routes (5 static + 8 SSG + `/this-week` + `/consent` + `/members/[slug]` + `/home` + `/admin/health` ƒ Dynamic) + 5 functions (`/api/auth/[...nextauth]`, `/api/test-auth`, `/api/test-reset-status`, `/api/test-reset-consent`, `/api/me/export`, `/api/me/delete`) + `ƒ Proxy (Middleware)`.
- E2E intentionally skipped (Phase 9 not in §4.2 list). The 19 E2E from Phase 8 closeout cover the rest of the surface.

**Caching note (carries forward):**
- `/admin/health` ships as ƒ (Dynamic) because the server component reads `auth()` for the admin gate — that read forces dynamic rendering, which in turn makes `export const revalidate = 60` ineffective as Next 16's ISR cache key. The amendment is still applied (export present + behavior documented) and the surface is small (admin-only, 4 GitHub API calls per render, low refresh frequency expected) so the 5000/hr rate-limit budget is not at practical risk for v0.1. A future iteration that wants stricter caching can wrap the four `readWeekStatuses` calls in `unstable_cache` or migrate to Next 16's Cache Components, leaving the auth gate at the dynamic boundary.

**Reviewer note:**
- typescript-reviewer + code-reviewer not dispatched at this closeout (carry-forward Anton's monthly Claude usage budget). Self-review against the handoff §"Self-review fallback" checklist: spec §8 strict-list at 100% ✓, isAdmin gate runs before any GitHub API call ✓, no new public paths in proxy.ts ✓, ratio computation handles empty roster ✓.

**Outstanding:**
- Task 4.1 [H] still pending Anton (GitHub App + 3 env vars). `/admin/health` will return real metrics once env vars are real; until then the page either shows zero metrics (no statuses fetched because the bot can't authenticate) or fails at `getInstallationToken`.
- Roster `github_handle` backfill for the other 18 members (carries from Phase 1).

### Phase 10 — Pre-launch + ship (verification in progress, 2026-05-03)

Last green commit (pending closeout): this entry's commit. Last code-only green: `56e1cd3`.

**Task 10.1 — Spec §8 acceptance verification log (this entry).** Per-item status:

| § | Acceptance criterion | Status | Evidence / gap |
|---|---|---|---|
| 8.1 | All 19 roster members have `github_handle`; all can log in | **FAIL — ship-blocking** | `community/members/roster.md` has 1 of 19 backfilled (`@anton1rsod`); 2 organizer slots `*(TBD)*`; members table empty. Roster backfill PR required before 10.3. |
| 8.2 | Status flow works E2E incl. delete + concurrent edit | **VERIFIED** | `e2e/status.spec.ts` covers post → list → edit → delete + concurrent-edit conflict (Phase 5 + 6). 19 E2E green at SHA `56e1cd3`. |
| 8.3 | Contribution counter matches `git log` for ≥5 members | **DEFERRED + flagged** | (a) Blocked by 8.1 — only 1 backfilled handle is verifiable. (b) `lib/__generated__/contributions.json` currently shows `anton1rsod: { projectCommits: 0, adrsFiled: 0, meetingsAttended: 0, statusPosts: 0 }` despite 151 commits across the repo + 5 ADRs filed. Likely missing email/name→`github_handle` mapping or stale snapshot — investigate `lib/contributions.ts` + snapshot script before 10.3. Without a mapping the counter cannot pass for any member after backfill. |
| 8.4 | Persona panel renders for 4 personas in `persona-builder/personas/` | **PARTIAL → ship-blocking** | `app/components/PersonaPanel.tsx` covered by tests (Phase §8 strict-list 100%). 4 persona folders (`dmitry-b`, `heorhii-k`, `maksym-p`, `mark-s`) exist on disk (created 2026-04-30) but are **untracked** in git as of SHA `4f0c735`. Commit + visual render verification required before 10.3. |
| 8.5 | Lighthouse ≥ 90 on `/home`, `/members`, `/this-week` | **DEFERRED to post-deploy** | Preview URL `warsaw-ai-platform.vercel.app` returns **HTTP 401** (Vercel Deployment Protection); unauthenticated Lighthouse cannot crawl. Target routes also redirect to `/login` for unauthenticated GETs, so authenticated runs require Lighthouse `--extra-headers='{"Cookie":"next-auth.session-token=…"}'` against the production URL. Run plan in Task 10.2 below. |
| 8.6 | No PII in error logs | **PARTIAL → defer log scan to post-deploy** | Code path covered: Phase 8 `security-reviewer` dispatch over `/api/me/{export,delete}`; GDPR endpoints derive identity from session, never request body (per `CONSTRAINTS.md` self-review item). Runtime log review against the first 24-hour window of production traffic happens after 10.3. |
| 8.7 | Health metric viewable by admins | **VERIFIED** | `/admin/health` ships as ƒ Dynamic at `app/admin/health/page.tsx`; `isAdmin` gate runs before any GitHub API call (Phase 9 closeout, SHA `18b0d9e`). 100% coverage on `lib/health-metric.ts` (spec §8 strict-list addition). |

**Verification summary:** VERIFIED 2/7 (8.2, 8.7) · PARTIAL 2/7 (8.4, 8.6) · DEFERRED 2/7 (8.3, 8.5) · FAIL 1/7 (8.1).

**Pre-deploy ship gates (must clear before Task 10.3):**

1. **Roster backfill** — the 18 outstanding members get `github_handle` populated in `community/members/roster.md` (current: 1 of 19). Closes §8.1; unblocks §8.3 prerequisite.
2. **Persona commits** — the 4 untracked persona folders under `persona-builder/personas/` (`dmitry-b`, `heorhii-k`, `maksym-p`, `mark-s`) committed so §8.4 can be live-verified. PR or direct commit, Anton's call.
3. **Contributions counter audit** — confirm `lib/contributions.ts` snapshot logic actually maps git authors → roster handles. If the all-zeros result is a real logic gap, ship a §9.x amendment + bugfix; else document the intended scoping in the snapshot script comment so future readers don't trip on it. Without this, §8.3 cannot pass even after backfill.
4. **Task 4.1 production env vars** — `GITHUB_APP_ID` / `_PRIVATE_KEY` / `_INSTALLATION_ID` set on Vercel **production** scope (preview already has the test PEM). Verify with `vercel env ls` immediately before `vercel --prod`. Until set, `/this-week` + `/consent` + `/admin/health` + `/api/me/*` fail at installation-token acquisition in production.

**Task 10.2 — Lighthouse + perf — DEFERRED to post-10.3** with reasoning (per phase brief: "score ≥ 90 OR documented gap"):

- Preview URL gated at the Vercel edge (HTTP 401) → Lighthouse cannot crawl pre-deploy.
- Production routes (`/home`, `/members`, `/this-week`) require an authenticated session; unauthenticated runs would measure the `/login` redirect target rather than the actual page payload.
- **Run plan post-10.3:** Anton signs in to production once → captures the `next-auth.session-token` cookie value (DevTools → Application → Cookies) → runs:
  ```bash
  pnpm dlx lighthouse https://<prod-url>/home    --extra-headers='{"Cookie":"next-auth.session-token=<…>"}' --output=json --output-path=lighthouse-home.json    --view
  pnpm dlx lighthouse https://<prod-url>/members --extra-headers='{"Cookie":"next-auth.session-token=<…>"}' --output=json --output-path=lighthouse-members.json --view
  pnpm dlx lighthouse https://<prod-url>/this-week --extra-headers='{"Cookie":"next-auth.session-token=<…>"}' --output=json --output-path=lighthouse-this-week.json --view
  ```
- Score ≥ 90 on all three → proceed to 10.4. Score < 90 → apply plan.md L7543–L7547 fixes (`next/image`, `loading="lazy"`, `next.config.ts` cache headers), redeploy, re-run, then 10.4.
- Fallback if cookie injection is brittle: use Vercel "Protection Bypass for Automation" or an authenticated headless run via Playwright + Lighthouse-CI. Decision deferred to the post-10.3 chat.

**Tasks 10.3 + 10.4 — BLOCKED on the four pre-deploy ship gates above.** Auto-mode policy (per `CONSTRAINTS.md`) also pauses at `vercel --prod`, `git push --tags`, and `gh pr create` against main regardless of gate state — these need Anton at the keyboard.

**Phase 10 partial closeout (verification log only — no code changes in this commit):**
- `pnpm lint / typecheck / test:coverage / build` not re-run for this commit; doc-only edit. Last full green check at SHA `56e1cd3` (Phase 9 closeout): 281 unit/integration tests + 19 E2E green; coverage 84.6% lines / 94.16% branches; spec §8 strict-list at 100%.
- This entry establishes the v0.1.0 readiness state at SHA `4f0c735`.

**Outstanding (Phase 10 ship-readiness gate):**
- The 4 pre-deploy ship gates above (roster backfill, persona commits, contributions audit, prod env vars).
- Tailwind typography plugin still not installed; `prose` classes render as plain HTML (cosmetic, non-blocking).

#### Update — Ship gate #1 cleared (2026-05-03)

`fix(community-platform): resolve git author email → roster handle via alias file` lands the resolver that §8.3 was blocked on.

- New module `lib/git-email-aliases.ts` (`parseAliases` + `resolveHandle` + `readAliases`; 13 unit tests at 96.47% lines / 85.71% branches). Resolution order: explicit alias from `community/members/git-email-aliases.md` → GitHub noreply pattern (`<id>+<handle>@…` or `<handle>@…`) → local-part fallback. Roster-membership filter in `computeContributions` still drops unknown handles, so unaliased third-party authors don't pollute counts.
- `scripts/build-contributions.ts` consults aliases via the new resolver. Missing alias file → empty map (soft enhancement; doesn't break the build).
- `community/members/git-email-aliases.md` seeded with `anton@rsod.solutions → anton1rsod` and onboarding instructions for future contributors.
- Snapshot regen confirms `anton1rsod: { projectCommits: 127, adrsFiled: 11, meetingsAttended: 0, statusPosts: 0 }` — non-zero counts spot-check against `git log --author="Anton Safronov"` (151 total commits; 127 land in `projects/*` per the counter's projectCommits scope; 11 file-edits across the 5 ADRs per the per-file-touch semantic at `lib/contributions.ts:58`).
- **§8.3 status:** DEFERRED + flagged → **PARTIAL — verified for 1 of 19**; reaching ≥5 needs §8.1 roster backfill plus an alias entry for each member whose git author email's local-part ≠ their roster handle.
- **Verification summary:** VERIFIED 2/7 (8.2, 8.7) · PARTIAL 3/7 (8.3, 8.4, 8.6) · DEFERRED 1/7 (8.5) · FAIL 1/7 (8.1).
- **Ship gates remaining:** #2 roster backfill (Anton — Telegram outreach), #3 persona commits (Anton — `git add` the 4 untracked persona folders), #4 prod env vars (Anton — Vercel UI). Gate #1 closed.

#### Update — Ship gate #2 reframed: minimum founder + Mark Spasonov; broader backfill deferred to v0.2+ invitation feature (2026-05-03)

Anton's decision: skip the manual Telegram-then-PR backfill of the 18 outstanding members for v0.1.0. Instead:

- **Now:** Mark Spasonov (`@markspas`) added to `community/members/roster.md` (2 of 19 backfilled — founder + Mark).
- **Deferred:** the remaining 17 members onboard via a future "git-based personal-invitation self-registration" feature — platform issues a one-time invitation, member signs in with GitHub, `warsaw-ai-bot` commits the roster + alias updates. Belongs to v0.2+ scope.
- **Brainstorm cadence:** fresh chat → `superpowers:brainstorming` → spec → `superpowers:writing-plans` → TDD implementation. **Don't roll the brainstorm into a Phase 10 chat — that violates the "spec before code" rule from the project CLAUDE.md.**
- **§8 impact:** §8.1 stays FAIL (still 2/19, not 19/19) — the path changed from "manual backfill PR" to "v0.2+ feature ship" but the gate doesn't close. §8.3 stays PARTIAL — Mark has no commits in the repo yet, so the contributions counter spot-check still passes only for `anton1rsod`. §8.4 stays PARTIAL — Mark's persona folder is `mark-s` (slug mismatch with display_name `Mark Spasonov` → `mark-spasonov`), flagged as known issue below.

**v0.1.0 ship policy:** spec §8.1 ships **as a documented gap**, not as a passing criterion. Acceptable because the platform's RBAC layer + sign-in proxy already enforce roster-only access — non-roster members simply cannot sign in. The "all 19 can log in" criterion is satisfied as soon as a member is added; for v0.1.0 the live count is 2 (Anton + Mark).

**Ship gates remaining after this update:** #3 persona commits, #4 prod env vars. Gates #1 + #2 closed (gate #2 by reframing scope, not by clearing).

#### Update — Ship gate #3 partially cleared: 3 of 4 personas committed (2026-05-03)

`feat(persona-builder): commit public personas for heorhii-k, maksym-p, mark-s` lands the consent-stripped `.public.md` variants for the three personas Anton confirmed. Dmitry deferred per Anton's call.

- Added `persona-builder/.gitignore` excluding `personas/*/persona-*.md` (private full versions) and re-including `personas/*/persona-*.public.md` (consent-stripped variants). Verified via `git check-ignore`: private files ignored, public files allowed. The non-public files stay on disk as Anton's working copies and never enter the repo.
- 3 public personas committed: `heorhii-k`, `maksym-p`, `mark-s`. Dmitry's public file is allowed by the gitignore but intentionally not staged in this commit.

**Known issue — slug↔folder mismatch (flagged for follow-up):**
- `lib/roster.ts:181-201` (`readMemberPersona`) resolves the persona file by `persona-builder/personas/<roster-slug>/`. Roster slugs come from `slugify(member.name)`.
- Mark Spasonov's slug is `mark-spasonov` but his persona folder is `mark-s` → `PersonaPanel` won't render his persona at runtime. Same mismatch will hit Maksym Pavlenko (`maksym-pavlenko` vs `maksym-p`) once he joins the roster. Heorhii K. (`heorhii-k`) matches.
- Resolution options for a follow-up commit (out of scope for v0.1.0 ship):
  1. Rename folders + `persona_id` frontmatter to match display-name slugs (cleanest; small touch on persona-builder skill conventions).
  2. Add a `persona_id` lookup mechanism in `lib/roster.ts` analogous to `lib/git-email-aliases.ts` (decouples folder name from display name; mirrors the existing alias pattern).
- §8.4 status: stays PARTIAL. Heorhii K. would render correctly *if* she were on the roster, but she's gated behind the future invitation feature. Mark is on the roster but his persona doesn't render due to the mismatch above. Maksym is in neither.

**§8 verification table after this update:** unchanged at VERIFIED 2 / PARTIAL 3 / DEFERRED 1 / FAIL 1 — gate #3 cleared the *committing* part of §8.4 but not the *rendering* part.

**Ship gates remaining:** #4 prod env vars only. Gates #1, #2, #3 closed.

#### Update — Ship gate #4 cleared + bonus fix: `GITHUB_REPO_OWNER` (2026-05-03)

`scripts/smoke-github-app.ts` returned `[smoke] README.md chars: 2708` / `SHA: ae0649…` / `OK` end-to-end against the real GitHub API using the 3 production `GITHUB_APP_*` env vars Anton just set on Vercel (App ID, Installation ID, Private Key from a real PEM downloaded for `warsaw-ai-bot`).

**Bonus finding + fix during smoke:** `GITHUB_REPO_OWNER` was misconfigured to `warsaw-ai-community` (the repo *name*) instead of `anton1rsod` (the owner) — wrong on `.env.local`, Vercel preview (`warsaw-org-and-stack-guide`), AND Vercel production. Almost certainly a Phase 0 repo-migration artifact: `GITHUB_REPO_NAME` was updated from the old `warsaw-ai-community-gbrain` to the new `warsaw-ai-community` per CHANGELOG, but `GITHUB_REPO_OWNER` quietly stayed at the wrong value. The preview's test PEM masked the bug — every GitHub call failed at *auth* before reaching path-construction. Once the real PEM was in place, the smoke 404'd on `GET /repos/warsaw-ai-community/warsaw-ai-community/contents/README.md` (owner=name, repo=name) before `[smoke] OK` confirmed `anton1rsod/warsaw-ai-community` is the correct path. Fixed all three places: production + preview (both Vercel scopes) now `anton1rsod`; `.env.local` sed-patched.

This bug would have made the deployed app 404 on every git read/write — `/this-week`, `/consent`, `/admin/health`, `/api/me/*` all broken silently. Catching it pre-deploy is the win.

**Cosmetic finding for follow-up (non-blocking):** `COMMUNITY_NAME` and `COMMUNITY_SLUG` on production were set as sensitive — `vercel env pull` returns empty quotes for them. Runtime is unaffected (Vercel injects sensitive vars into `process.env` at function startup), but ops inspectability is broken. Re-set with `--no-sensitive` post-ship hygiene.

**All 4 pre-deploy ship gates closed:**
- #1 Contributions counter alias mechanism — commit `65bb9ce`.
- #2 Mark Spasonov on roster + invitation feature deferred to v0.2+ — commit `f5b8136`.
- #3 3 of 4 personas committed (heorhii-k, maksym-p, mark-s; Dmitry deferred) — commit `012a75f`.
- #4 GitHub App credentials + `GITHUB_REPO_OWNER` fix — Vercel state, no code commit.

**Next:** Phase 10.3 (production deploy) is unblocked pending Anton's authorize on `pnpm dlx vercel --prod`.

Closeout green check (this commit):
- `pnpm lint` — 0 errors / 0 warnings.
- `pnpm typecheck` — clean.
- `pnpm test:coverage` — 30 files, **294 tests** pass (up from 281). Spec §8 strict-list still 100%. Overall 84.73% lines / 93.7% branches.
- `pnpm build` — 18 routes (5 static + 8 SSG + 5 ƒ Dynamic) + ƒ Proxy (Middleware), clean.
- E2E not re-run (this commit doesn't touch any E2E-covered surface; last 19 E2E green at SHA `56e1cd3`).
