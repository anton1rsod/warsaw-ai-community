# Chat-21 handoff: v0.3.0 shipped — follow-ups menu

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) — operating discipline. Read once at session start.

**Status:** v0.3.0 implementation complete on branch `chore/community-platform-v0-3-impl` at HEAD `3b012a7` (PR pending merge to main). 35 of 36 v0.3 tasks shipped; Task 4.2 (Playwright E2E spec — 14 scenarios) deferred to this chat or later. 822/822 unit/integration tests green; coverage 89.6% lines / 93.77% branches (gate 80%); v0.3 strict-list 100% lines on 11/13 files. 50 unique hardening IDs grep-verified. security-reviewer on rsvp-event + thank-status: 0 CRITICAL / 0 HIGH / 1 MEDIUM closed.

---

## Setup

Fresh chat. If v0.3.0 PR has been merged: branch off `main` at the merge SHA. If still pending: continue on `chore/community-platform-v0-3-impl`. Ask Anton which.

```bash
cd "$HOME/Projects/Warsaw AI Comunity"
git fetch
git checkout main && git pull   # if v0.3.0 merged
# OR
git checkout chore/community-platform-v0-3-impl && git pull   # if still open
git log --oneline -5
```

## Read in order (~500 lines)

1. `projects/community-platform/STATE.md` — v0.3.0 ship state; `Last verified.v0_3_ship` row carries full chat-20 outcomes.
2. `projects/community-platform/CONSTRAINTS.md` — locked rules (line 12 now references ADR-0012).
3. `projects/community-platform/GOTCHAS.md` — row 10 (tsx prebuild chicken-and-egg) most relevant to lib/ work.
4. `projects/community-platform/HANDOFF_PROTOCOL.md` — operating discipline.
5. `projects/community-platform/CHANGELOG.md` — top `[0.3.0]` entry recaps everything shipped + deferred.
6. This handoff doc.
7. Memory: `project_community_platform_v0_3_ship.md` — chat-20 outcomes + locked decisions.

DO NOT pre-read the 5734-line `v0.3.0-plan.md`. Phase-specific load by line range when relevant.

## Menu of follow-up options

Anton picks scope at chat start. Pick one or more.

### A — Production smoke + tag push (CRITICAL, if v0.3.0 PR is merged)

If the v0.3.0 PR has been merged to main but the tag isn't pushed yet:

```bash
git checkout main && git pull
git tag community-platform-v0.3.0
git push origin community-platform-v0.3.0
```

Then run the smoke flow listed in `CHANGELOG.md [0.3.0]` "Production smoke" section (5 scenarios). Update `STATE.md Last verified.v0_3_ship` with smoke results.

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

## Anti-patterns (chat-21 specific)

- Don't bundle v0.2.x retroactive cleanup (Mark Spasonov PR #3 still open as Draft on `chore/mark-spasonov-backfill`).
- Don't reopen plan O1-O8 locks (chat-18 brainstorm output, ADR-0012-anchored).
- Don't introduce `auth()` in /home, /events, /meetings read surfaces (H30 forward-defense — these are ADR-0012 public).
- Don't introduce `@/lib/*` imports inside files under `lib/` (GOTCHAS row 10).
- Don't bypass v0.2.2 SHA-passthrough contract in `rsvp-event` or `thank-status` (409 = `REFRESH_NEEDED` with NO retry).

## Done means

Pick from menu; "done" depends on scope. Each option has its own DoD:

- **A**: tag pushed, smoke results in STATE `Last verified`.
- **B**: `pnpm e2e --retries=2 e2e/v0-3-discovery.spec.ts` green; 14 scenarios on top of existing 33.
- **C**: real icon files committed; lighthouse `/home` PWA score = 100.
- **D**: pages render dynamic; viewer state derived; lighthouse perf within ±5% of SSG baseline.
- **E**: reviewer findings (if any) fixed inline; final CHANGELOG note.
- **F**: test helper route landed; Scenario 5 of Option B unblocks.
- **G**: 100% lines literal on strict-list.
- **H**: v0.3.1 direction chosen + documented.

## Reference pointers

- **Production:** https://warsaw-ai-community-platform.vercel.app (at v0.2.2 tag `7cd87c3`; v0.3.0 deploys when PR merges)
- **v0.3.0 branch:** `chore/community-platform-v0-3-impl` HEAD `3b012a7`
- **v0.3.0 PR:** Draft — `gh pr view` for status
- **CHANGELOG `[0.3.0]`:** `projects/community-platform/CHANGELOG.md`
- **ADR-0012:** `docs/decisions/0012-community-platform-v0-3-discovery-posture.md`

---

*Drafted 2026-05-17 in chat-20 at v0.3.0 closeout. Mirrors chat-13 + chat-19 handoff template structure.*
