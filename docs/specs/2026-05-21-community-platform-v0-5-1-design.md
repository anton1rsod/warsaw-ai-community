# Community Platform v0.5.1 — design spec

**Status:** Approved 2026-05-21 (chat-33 brainstorm)
**Author:** Anton Safronov + Claude (Opus 4.7)
**Predecessor:** v0.5.0 ship — see `projects/community-platform/CHANGELOG.md` `[0.5.0]` and `STATE.md`
**Successor work:** Phase B activation gate ≥ 2026-05-25 (PostHog evidence window)

## 1. Why v0.5.1 exists

v0.5.0 shipped `/admin/events/new` as the first admin write-surface. Anton-side smoke on real prod (2026-05-21 10:38 Warsaw) surfaced a discoverability gap — no UI button points to the new route; Anton noticed it during the smoke itself: *"do I have a button or did you just navigate?"* Chat-33's signed-in Playwright check additionally exposed a pre-existing v0.3/v0.4 EventRoster wart: `+N members (sign in to see)` link renders even when viewer is signed in.

Chat-32 reviewer triage also flagged 3 defense-in-depth items as INFO findings (lowest severity). One was deferred per YAGNI; two are folded here because v0.5.1 is the natural moment to migrate the 4 server actions that share the underlying pattern.

**Single PR ship.** Bundle is cheap because items 3+5 touch the same server-action files; items 1+2 are independent UI fixes. One CHANGELOG entry, one tag (`community-platform-v0.5.1`), one review cycle.

## 2. Scope — 4 active items + 1 documented-deferred

### Item 1: `/admin/events/new` discoverability

Add admin-only **"+ New event"** button to `/events` page header (top-right). Server-side `isAdmin()` gate; non-admins (signed-in members) and anonymous viewers see no button.

**Why /events and not Header?** Anton's actual discovery path was `/events → (looking for a button) → nothing`. Fixing that exact path is the smallest scope-disciplined move. `/admin/health` and `/admin/invite` have existed since v0.1 / v0.1.1 without discoverability complaints — Anton knows their URLs. Adding an `/admin` landing page or Header chip would pre-commit IA for v0.5.2+ admin features without evidence of need, violating [[feedback_ia_defer_future_placement]].

### Item 2: EventRoster signed-in wart

`EventRoster.tsx:67-74` renders `+N members (sign in to see)` chip unconditionally when `hiddenCount > 0`. For signed-in viewers this is doubly wrong: (a) the h3 already shows `({total} total)` so the count is duplicate info, and (b) clicking the chip sends them to `/login` when they're already signed in.

**Fix:** when viewer is signed-in AND `hiddenCount > 0`, hide the chip entirely. The h3 total already conveys count; the chip's sole purpose was the sign-up CTA, which is wrong for signed-in viewers. Anonymous viewers continue to see the chip exactly as today.

### Item 3: `safeHandle` extraction + 39-char cap

Current state: `.replace(/[\r\n]/g, "")` inlined 3× in `rsvp-event.ts:100`, `create-event.ts:124`, `thank-status.ts:98`. GitHub's 39-char username limit is currently enforced *structurally* (GitHub rejects longer at signup); chat-32 reviewer flagged this as defense-in-depth.

**Fix:** new `lib/handles.ts` exporting `safeHandle(input: string): string` that strips CRLF AND caps at 39 chars. Update 3 call-sites. Throws on empty-after-strip (every consumer has known-valid `githubHandle` from session or RSVP payload; silent empty would produce malformed git commits like `chore(events): @ created "slug"`).

### Item 4: `encodeURIComponent` slug — DEFERRED per YAGNI

Chat-32 reviewer flagged `router.push(\`/events/${result.slug}\`)` at `EventForm.tsx:89` as INFO — defense against URL-unsafe chars. `EventSlugSchema` regex `[a-z0-9-]+` makes URL-unsafe chars structurally impossible.

**v0.5.1 action:** add a 1-line code comment at `EventForm.tsx:89` documenting `EventSlugSchema` as the canonical defense. No `encodeURIComponent` call. Reasoning: accepting an INFO finding does not require implementing it; defending against a future regex change that would itself appear in a PR diff is over-engineering.

### Item 5: `lib/log.ts` thin wrapper

Current state: 4 server actions use `console.warn("[tag] event ...")` / `console.error(...)` for audit/operational logging. Project-level rule overrides TS coding-style `no-console` — chat-32 typescript reviewer accepted as "project convention". v0.5.1 standardizes the pattern in a single helper before more server actions accumulate ad-hoc usage.

**Fix:** new `lib/log.ts` exporting `log.warn(tag, event, fields?)` and `log.error(tag, event, fields?)`. Single-line output format: `[tag] event {...fields}` (JSON-stringified fields, grep-friendly; Vercel logs add their own timestamp). Zero deps. Migrate 4 server actions: `create-event.ts`, `rsvp-event.ts`, `save-profile.ts`, `thank-status.ts`. Future pino swap is a single-file edit.

## 3. Open questions — locked inline

| O-ID | Question | Lock | Reasoning |
|---|---|---|---|
| O1 | Button copy on `/events` | `+ New event` | Matches v0.3 `+ RSVP` button pattern; explicit verb |
| O2 | Button placement | Top-right of `/events` page header, aligned with existing h1 | Consistent with v0.4 header rhythm; admin context = right-side affordance |
| O3 | EventRoster viewer-auth pattern | Internal `auth()` call inside `async function EventRoster` | Consistent with chat-30 `/events/[slug]/page.tsx` self-auth pattern (vs prop-drilling viewer state through page → roster) |
| O4 | `safeHandle` empty-input behavior | Throw `Error("empty handle")` | Every call-site has a known-valid `githubHandle`; silent empty produces malformed commits — loud failure preferred |
| O5 | `lib/log.ts` API surface | `log.warn(tag, event, fields?)` + `log.error(tag, event, fields?)` | Splits operational warnings (`.warn`) from real failures (`.error`); matches existing call-site semantics |
| O6 | Production output format | `[tag] event {...fields}` single-line string with `JSON.stringify(fields)`; callers must pass JSON-serializable fields (primitives, plain objects, arrays) — circular refs / functions / symbols are caller responsibility | grep-friendly; Vercel logs auto-prepend timestamp + region; pino-compatible swap-point later |

## 4. Hardenings H81-H85

| H-ID | Rule | Surface | Test block |
|---|---|---|---|
| H81 | `/events` admin button: RBAC re-check at Server Component render (no client-only gate) | `app/events/page.tsx` | `describe("H81:")` in `tests/unit/events-page.test.tsx` |
| H82 | EventRoster viewer-state read at render-time matches request cookie at render-time (force-dynamic propagates from `/events/[slug]/page.tsx` per chat-30 v0.4.8 fix) | `app/components/EventRoster.tsx` | `describe("H82:")` in `tests/unit/event-roster.test.tsx` |
| H83 | `safeHandle` valid output post-condition: ≤39 chars AND contains no CRLF (or throws on empty-after-strip per O4) | `lib/handles.ts` | `describe("H83:")` in `tests/unit/handles.test.ts` |
| H84 | `safeHandle` is idempotent on already-safe input | `lib/handles.ts` | `describe("H84:")` in `tests/unit/handles.test.ts` |
| H85 | `log.warn` / `log.error` reject empty tag at runtime | `lib/log.ts` | `describe("H85:")` in `tests/unit/log.test.ts` |

## 5. Files touched

### New (4)

- `lib/handles.ts` — `safeHandle(input: string): string` with CRLF strip + 39-char cap + empty-throw
- `lib/log.ts` — `log.warn(tag, event, fields?)` + `log.error(tag, event, fields?)`
- `tests/unit/handles.test.ts` — H83 + H84 + happy path + edge cases (~8 tests)
- `tests/unit/log.test.ts` — H85 + format check + JSON serialization (~10 tests)

### Modified (8)

- `app/actions/create-event.ts` — replace inline CRLF strip with `safeHandle()`; replace `console.warn`/`console.error` with `log.*`
- `app/actions/rsvp-event.ts` — same pattern
- `app/actions/thank-status.ts` — same pattern
- `app/actions/save-profile.ts` — replace `console.warn` with `log.*` (no safeHandle change — uses different handle source)
- `app/components/EventRoster.tsx` — add internal `auth()` call; conditional hide of `+N members` chip when signed-in + `hiddenCount > 0`
- `app/components/EventForm.tsx` — 1-line code comment at line 89 documenting EventSlugSchema as URL-safety defense
- `app/events/page.tsx` — admin-only "+ New event" button in top-right of page header
- `lib/i18n/strings.ts` — new key: `events.list.newEventButton: "+ New event"` (single key; no other copy changes)

### Release (2)

- `projects/community-platform/CHANGELOG.md` — `[0.5.1]` entry
- `projects/community-platform/STATE.md` — Snapshot block flip + Last verified row

## 6. Tests

**Baseline:** 1020/1020 unit+integration at v0.5.0 ship.
**Target:** ~1050/1050 at v0.5.1 ship.

Net new tests:
- `lib/handles.test.ts` — 8 (happy path, CRLF strip, length cap, empty throw, idempotency, post-conditions H83+H84)
- `lib/log.test.ts` — 10 (warn + error API, format check, JSON serialization, empty-tag throw H85, optional fields)
- `EventRoster.test.tsx` — 4 new scenarios (signed-in hides chip; anonymous shows chip; signed-in + 0 hidden = no chip either way; non-signed-in fallback)
- `events-page.test.tsx` — 3 (admin sees button; member doesn't; anonymous doesn't — H81)
- Server-action integration updates — ~5 (re-anchor existing safeHandle/log expectations against new helpers)

Coverage gates (existing 80% line, 80% branch) hold.

## 7. PR vs direct: PR-required

Code touches `projects/community-platform/app/**`, `lib/**`, `tests/**` — CI-triggered paths. Per [[feedback_pr_vs_direct]]: PR-required for cross-cutting work touching CI-triggered paths.

- Branch: `chore/community-platform-v0-5-1-impl` (off `main` at `0840e43`)
- 3-lane reviewer dispatch on full branch HEAD (security + typescript + code) before squash-merge
- Tag `community-platform-v0.5.1` at squash-merge SHA

## 8. Non-goals (explicit)

- **No `/admin` landing page** — defers per [[feedback_ia_defer_future_placement]]; Phase B may revisit
- **No Header admin chip** — only one reported discoverability gap; fix the specific path
- **No `/admin/health` or `/admin/invite` discoverability work** — no reported gap; existed since v0.1 / v0.1.1
- **No pino adoption** — defer until observability tool gets wired (current scale doesn't justify the dep)
- **No `encodeURIComponent` defensive wrap** — YAGNI; regex defense documented inline instead
- **No Phase B PostHog / audit-dashboard work** — gate is 2026-05-25 (4d PostHog data window post-meetup-4)
- **No structured-logger migration outside server actions** — keep scope tight; expand if needed when observability tool lands

## 9. Acceptance criteria

A v0.5.1 ship is complete when:

1. All 4 active items + 1 doc-deferred item land per the scope above
2. 5 hardenings H81-H85 each have a `describe("H<n>:")` block (grep-verifiable)
3. ~1050 unit+integration tests green; coverage gates hold
4. 3-lane reviewer dispatch on full branch HEAD: 0 CRITICAL / 0 HIGH; MEDIUM/LOW triaged per chat-32 convention
5. Anton-side smoke on preview deployment: `/events` shows admin button only when signed-in-as-admin; click → /admin/events/new loads; `/events/2026-05-21-meetup-4` signed-in view no longer shows "+ N members (sign in to see)" chip
6. PR squash-merged; tag `community-platform-v0.5.1` pushed; STATE.md flipped; CHANGELOG `[0.5.1]` entry present

## 10. Estimated effort

~½ day implementation + ~½ day review/triage/merge = ~1 day total. Small enough to compress brainstorm-spec-plan into a single chat per [[feedback_token_discipline]]; plan-writing is the next phase.

## 11. References

- [[project_community_platform_v0_5_1_backlog]] — the 5-item consolidated backlog this spec implements
- [[project_community_platform_v0_5_admin_events_seed]] — v0.5.0 ship context + the merge-gate lesson
- [[feedback_token_discipline]] — single-chat compression rationale
- [[feedback_pr_vs_direct]] — code-touching → PR-required
- [[feedback_ia_defer_future_placement]] — scope discipline for the `/admin` decision
