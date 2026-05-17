# Chat-21 handoff: v0.3.0 + v0.3.1 shipped — follow-ups menu

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) — operating discipline. Read once at session start.

**Status (post-chat-20):** v0.3.0 + v0.3.1 BOTH SHIPPED.
- **v0.3.0** — PR #20 merged at `acb57c5`, tag `community-platform-v0.3.0` pushed. 35 of 36 v0.3 tasks shipped (Task 4.2 / 14 E2E scenarios deferred). 822 unit tests green.
- **v0.3.1 hotfix** — PR #21 merged at `e720268`, tag `community-platform-v0.3.1` pushed. Closed v0.3.0 UX defect on `/home`: added auth-aware `HomeHeader` (anonymous Sign-in CTA + signed-in member nav with Your week / Members / Edit profile / Sign out) and restored Members card. `/home` flipped from `force-static` to dynamic per-request rendering. H30 hardening amended ("anonymous accessible" instead of "no auth() read"). 825 unit tests green.
- **Production deploy `ivbncdcvq`** is live (promoted from PR #21 preview because Vercel Free-tier 100/day API rate limit was exhausted — see new GOTCHAS row 11).
- **Anonymous smoke green** on both ships (HTTP-layer); signed-in flows still PENDING Anton's session.

---

## Setup

Fresh chat. Branch off `main` at HEAD `35d00c7` (or later — `git pull` first).

```bash
cd "$HOME/Projects/Warsaw AI Comunity"
git fetch
git checkout main && git pull
git log --oneline -8
```

## Read in order (~550 lines)

1. `projects/community-platform/STATE.md` — `Last verified.v0_3_1_ship` row carries the v0.3.1 outcomes + the `vercel promote` recovery footnote.
2. `projects/community-platform/CONSTRAINTS.md` — locked rules (line 12 references ADR-0012).
3. `projects/community-platform/GOTCHAS.md` — row 10 (tsx prebuild chicken-and-egg) for `lib/` work + **row 11 (Vercel 100/day deploy rate limit + `vercel promote` recovery)** for ship-day operations.
4. `projects/community-platform/HANDOFF_PROTOCOL.md` — operating discipline.
5. `projects/community-platform/CHANGELOG.md` — `[0.3.0]` entry recaps everything shipped (v0.3.1 not yet in CHANGELOG — add when next chat closes if scoping a follow-up that touches it).
6. This handoff doc.
7. Memory: `project_community_platform_v0_3_ship.md` — chat-20 outcomes + locked decisions.

DO NOT pre-read the 5734-line `v0.3.0-plan.md`. Phase-specific load by line range when relevant.

## Menu of follow-up options

Anton picks scope at chat start. Pick one or more.

### A — Signed-in /home smoke (Anton-side, 5 minutes)

The auth-aware header from v0.3.1 has anonymous smoke verified but the signed-in branch is untested in production. Sign in as anton1rsod and verify on `/home`:
- Top-right shows: `Your week | Members | Edit profile · @anton1rsod | Sign out`.
- Click each link → correct route.
- Click `Sign out` → returns to anonymous `/home` (with the `Sign in` button top-right).

Update `STATE.md Last verified.v0_3_1_ship` with results. ~10 lines of doc change.

### B — Task 4.2: `e2e/v0-3-discovery.spec.ts` (14 Playwright scenarios)

Original Phase 4 task deferred from chat-20 for token discipline. Plan section at `projects/community-platform/v0.3.0-plan.md:4998-5196`. Scenarios:
1. Anonymous /home renders feed.
2. /this-week L2 strip above compose.
3. RSVP toggle (sign-in → mark going → roster updates).
4. RSVP toggle (mark going → revert).
5. Concurrent RSVP race → REFRESH_NEEDED.
6. Orphan slug graceful.
7. ICS subscribe endpoint returns valid VCALENDAR.
8. AddToCalendar button on event detail downloads .ics file.
9. Thank a status post.
10. Self-thank blocked.
11. Duplicate-thank dedup.
12. RSVP tri-state transitions.
13. RSVP privacy posture.
14. PWA install (manifest + link tag).

Prerequisites: `app/api/test-reset-profile/route.ts` may need creating per Pattern 10. Run with `pnpm e2e --retries=2`. Adds ~14 E2E scenarios to the existing 33 → 47 total green.

### C — Brand-asset PWA icons

Current `public/icons/icon-192.png` + `icon-512.png` are solid #2563eb placeholders. Replace with a real community logo asset. Source: ask the community Telegram for a brand mark, or commission one. Replace files in-place; manifest already references the correct paths.

### D — Dynamic viewer-state on /projects/[slug] + /meetings/[slug] ThankButton

Currently both surfaces ship `<ThankButton initialState="not-signed-in">` (SSG-safe) — signed-in users see "+ Thanks" but click is a no-op without a profileSha. To fully wire:
1. Flip the pages to `export const dynamic = "force-dynamic"`.
2. Add `loadViewerProfile()` calls (same pattern as `/this-week`).
3. Pass `initialState={deriveThankInitialState(...)}` + `profileSha={file.sha}`.

Trade-off: drops SSG for these pages. Lighthouse perf impact should be measured.

### E — typescript-reviewer + code-reviewer dispatch

Chat-20 dispatched security-reviewer (Task 3.9) on the write surfaces; broader code-quality review is still outstanding. Per CONSTRAINTS line 41, these are optional after the security-relevant scope was covered, but a clean v0.3.0 PR review is the right finisher.

```
Agent(subagent_type="typescript-reviewer", description="v0.3.0 closeout review",
      prompt="Review all v0.3 additions for type safety, immutability, async correctness. Strict-list at 100% lines per coverage. Flag any defects-pattern violations.")
```

Then `code-reviewer` for general quality. If Anthropic monthly cap blocks (Phase 6+7 history), fall back to CONSTRAINTS self-review checklist.

### F — `e2e/v0-3-discovery.spec.ts` Scenario 5 (RSVP race) requires a test-helper route

Specifically `app/api/test-reset-profile/route.ts` per Pattern 10 (production-gated). May need to extend `mockProfileStore` + add an HTTP shim. Small standalone task that unblocks Scenario 5.

### G — HomeFeed line 81 + meetings.ts gray-matter defensive lines

To push v0.3 strict-list to literal 100% lines (currently HomeFeed.tsx 98.86% + meetings.ts 98.61%):
- HomeFeed.tsx:81 — `relativeDate("Today" branch)` — fixture test asserting `Math.round` of `today + 12h` ≈ `now`.
- meetings.ts:90, 143 — gray-matter parsing fixtures with explicitly malformed `start_time` / `duration_minutes` values to exercise the `typeof !== "string"` / `Number.isInteger` guards.

Cosmetic — current 98.6% lines + 93%+ branches is within the v0.1+v0.2 precedent of "branches ≥80% is acceptable for unreachable-defensive-fallback branches".

### H — Convert /projects/[slug] + /meetings/[slug] SSG → dynamic OR document v0.3.1 PWA scope

Pick one direction for the v0.3.1 polish chat:
- **Dynamic**: flip both pages to `force-dynamic` for full ThankButton viewer-state derivation (Option D above).
- **Keep SSG**: drop the ThankButton from these surfaces and document that thanks are /this-week-only in v0.3.0.

The plan implied dynamic; chat-20 shipped SSG-safe for token discipline. Anton's call which direction v0.3.1 commits to.

### I — Unify Events + Meetings nav (Anton critique 1 from chat-20)

Anton's observation post-v0.3.0 ship: from a user perspective, `Events` and `Meetings` cards next to each other look duplicative. The split is org-internal (Meetings = recurring weekly syncs; Events = one-off RSVP-able hackathons/talks/workshops) but the user-facing labels don't communicate the distinction.

Recommendation: keep `/events` and `/meetings` as separate technical surfaces (different schemas, different SSG paths) but **collapse the nav surface** to one entry. Options:

- **One "Calendar" card** linking to a unified merged-list view at `/calendar` or similar. The `/api/calendar.ics` aggregate already does this server-side; the UI should mirror it.
- **Drop one** — make Meetings a subtype of Event with `type: "meeting"`. Heavier refactor; touches lib/meetings.ts + lib/events.ts + 3+ pages.
- **Keep separate routes, single "Schedule" nav** that lands on a unified index with filter tabs.

Scope: ~2-3 commits if going with the "Calendar" merged-list approach. Spec amendment needed (lock the user-facing nav decision in spec §13.x).

### J — DONE in v0.3.1: Signed-in /home variant (formerly recommended in this menu)

~~Auth-aware header on `/home` with anonymous Sign-in CTA + signed-in member nav.~~ Shipped in v0.3.1 (PR #21, commit `a558eb9`). See `STATE.md Last verified.v0_3_1_ship`. Anonymous smoke green; signed-in smoke pending Option A above.

## Anti-patterns (chat-21 specific)

- Don't bundle v0.2.x retroactive cleanup (Mark Spasonov PR #3 still open as Draft on `chore/mark-spasonov-backfill`).
- Don't reopen plan O1-O8 locks (chat-18 brainstorm output, ADR-0012-anchored).
- Don't re-add `force-static` to `/home` (v0.3.1 explicitly removed it to enable the auth-aware header; H30 hardening was amended to "anonymous accessible" rather than "no auth() read").
- Don't introduce `@/lib/*` imports inside files under `lib/` (GOTCHAS row 10).
- Don't bypass v0.2.2 SHA-passthrough contract in `rsvp-event` or `thank-status` (409 = `REFRESH_NEEDED` with NO retry).
- **Don't expect `git push` to auto-deploy to Vercel until midnight UTC reset.** GOTCHAS row 11 — the Free-tier 100/day deploy limit is exhausted. Use `pnpm dlx vercel promote <preview-url> --yes` for any hotfix that needs to ship today.

## Done means

Pick from menu; "done" depends on scope. Each option has its own DoD:

- **A**: signed-in /home smoke green (top-right has member nav + Sign-out → click each → all routes land correctly); STATE `Last verified.v0_3_1_ship` updated.
- **B**: `pnpm e2e --retries=2 e2e/v0-3-discovery.spec.ts` green; 14 scenarios on top of existing 33.
- **C**: real icon files committed; lighthouse `/home` PWA score = 100.
- **D**: pages render dynamic; viewer state derived; lighthouse perf within ±5% of SSG baseline.
- **E**: reviewer findings (if any) fixed inline; final CHANGELOG note.
- **F**: test helper route landed; Scenario 5 of Option B unblocks.
- **G**: 100% lines literal on strict-list.
- **H**: v0.3.x direction chosen + documented.
- **I**: nav surface unified; spec amendment landed.
- **J**: ~~done in v0.3.1~~

## Reference pointers

- **Production:** https://warsaw-ai-community-platform.vercel.app — currently serves deploy `ivbncdcvq` (v0.3.1, promoted from PR #21 preview)
- **Tag chain:** `community-platform-v0.3.0` (`acb57c5`) → **`community-platform-v0.3.1`** (`e720268`)
- **Main HEAD:** `35d00c7` (STATE.md update for v0.3.1 smoke results)
- **CHANGELOG `[0.3.0]`:** `projects/community-platform/CHANGELOG.md` (v0.3.1 not yet entered — next chat closure should add a `[0.3.1]` entry)
- **ADR-0012:** `docs/decisions/0012-community-platform-v0-3-discovery-posture.md`
- **GOTCHAS row 11:** Vercel 100/day deploy limit + `vercel promote` recovery pattern
- **Vercel deploy rate-limit status:** EXHAUSTED for 2026-05-17. Resets midnight UTC. Until then, use `vercel promote` for production swaps.

---

*Drafted 2026-05-17 in chat-20 at v0.3.0 closeout; extended at v0.3.1 closeout same chat. Mirrors chat-13 + chat-19 handoff template structure.*

## Paste-ready prompt for chat 21

```
Warsaw AI Community Platform — Chat 21: v0.3.x follow-ups

v0.3.0 (PR #20 → acb57c5, tag community-platform-v0.3.0) and v0.3.1
(PR #21 → e720268, tag community-platform-v0.3.1) BOTH SHIPPED in
chat-20. Production deploy ivbncdcvq is live; anonymous /home smoke
green on both releases. 825 unit/integration tests + 33 v0.2 E2E green.

Working dir: ~/Projects/Warsaw\ AI\ Comunity/projects/community-platform/
Branch: main (HEAD 35d00c7). Branch off as needed.

Full handoff: docs/specs/2026-05-17-community-platform-v0-3-shipped-followups-handoff.md

Read sections "Setup", "Read in order", "Menu of follow-up options",
"Anti-patterns", "Done means" before starting.

CRITICAL ops awareness (from chat-20 ship-day):
- GOTCHAS row 11 — Vercel Free-tier 100/day deploy quota was exhausted
  on 2026-05-17 by v0.3.0 + v0.3.1 development. Until midnight UTC reset,
  expect `git push → main` auto-deploys to be silently rate-limited.
  Recovery: `pnpm dlx vercel promote <preview-url> --yes` reuses the
  built preview artifact without consuming a build slot. Anton may also
  upgrade to Pro before resuming heavy shipping.

Menu options (A-J, J done in v0.3.1). Pick what to scope:
- A: signed-in /home smoke (5 min Anton-side)
- B: e2e/v0-3-discovery.spec.ts (14 Playwright scenarios)
- C: brand-asset PWA icons (replace #2563eb placeholders)
- D: dynamic viewer-state on /projects/[slug] + /meetings/[slug]
- E: typescript-reviewer + code-reviewer dispatch
- F: app/api/test-reset-profile/route.ts (unblocks B Scenario 5)
- G: HomeFeed/meetings literal 100% lines
- H: SSG-vs-dynamic direction lock for /projects + /meetings
- I: unify Events + Meetings nav (Anton critique chat-20)

Anti-patterns:
- Don't re-add force-static to /home (v0.3.1 amended H30).
- Don't expect git push to auto-deploy until midnight UTC (GOTCHAS 11).
- Don't reopen plan O1-O8 locks (ADR-0012-anchored).
- Don't bundle v0.2.x retroactive cleanup (Mark Spasonov PR #3 Draft).

Token discipline: per-task subagent dispatches; lean handoffs; batch
fix commits per option closure. If touching docs-only files, push direct
to main (project memory feedback_pr_vs_direct).

Done means: option(s) shipped with CHANGELOG + STATE updates + PR
merged (where applicable). Update v0_3_1_ship row with Option A
results if Anton runs signed-in smoke.
```
