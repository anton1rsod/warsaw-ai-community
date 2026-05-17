# Chat 20 handoff: v0.3 Phase 2 (Read surfaces) → Phase 4 closeout

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) — operating discipline. Read once at session start.

**Status:** v0.3 Phase 1 (Foundation) shipped in chat-19 on branch `chore/community-platform-v0-3-impl` at HEAD `5384dd2`. 11 of 36 v0.3 tasks committed; preview deploy validated green. Chat-19 stopped at Phase 1 boundary because the mid-phase Vercel preview-deploy diagnostic detour (root-cause + 2-fix sequence captured as GOTCHAS row 10) consumed enough context that proceeding into Phase 2 risked sloppy execution. This chat (chat-20) owns Phases 2-4 — **25 remaining tasks**.

---

## Setup

Fresh chat. Existing branch `chore/community-platform-v0-3-impl` (off `main` at `7466673`); do NOT create a new branch. The Phase 1 commits are on this branch and have been validated green on Vercel preview at SHA `5384dd2` (42s build).

```bash
cd "$HOME/Projects/Warsaw AI Comunity"
git checkout chore/community-platform-v0-3-impl
git pull origin chore/community-platform-v0-3-impl
git log --oneline -15                                # confirms 5384dd2 at HEAD
```

Invoke **`superpowers:subagent-driven-development`** at the very start (per HANDOFF_PROTOCOL §8). Continue the per-task-implementer + spec-reviewer + code-quality-reviewer cadence from chat-19, with the lessons captured below applied to every dispatch.

## Read in order (~600 lines total)

1. `projects/community-platform/STATE.md` — phase = "v0.3 Phase 1 shipped"; `v0_3_phase_1_ship` row carries the full Phase 1 verified state.
2. `projects/community-platform/CONSTRAINTS.md` — locked rules (line 12 now references ADR-0012).
3. `projects/community-platform/GOTCHAS.md` — **READ ROW 10 CAREFULLY** (chat-19's debug findings — applies to every Phase 2-4 task that touches `lib/`).
4. `projects/community-platform/HANDOFF_PROTOCOL.md` — operating discipline.
5. `projects/community-platform/v0.3.0-plan.md` — load per-phase task content as you dispatch.
6. `projects/community-platform/CHANGELOG.md` — top `[Unreleased] — v0.3.0 Phase 1` entry recaps what's already shipped.
7. `docs/playbooks/recurring-plan-defects.md` — code-level pattern guard.
8. Memory: `project_community_platform_v0_3_phase_1.md` (to be written by chat-19 closeout) — Phase 1 outcomes + chat-19 chat-19 debugging story.

DO NOT pre-read the whole `v0.3.0-plan.md` (5734 lines). Load by phase as you go.

## Verify-before-claiming queries (run early)

```bash
# Confirm Phase 1 shipped state
git log --oneline -15 chore/community-platform-v0-3-impl   # 5384dd2 at HEAD; 4ea31fc GOTCHAS row 10
git tag -l community-platform-v0.2.2                        # baseline tag still at 7cd87c3

# Confirm Phase 1 deliverables present
ls projects/community-platform/lib/{events,home-feed,ical,community-defaults}.ts
ls projects/community-platform/lib/__generated__/{event-rosters,kudos}.json
ls projects/community-platform/lib/__generated__/calendar.ics
ls projects/community-platform/scripts/{build-event-rosters,build-calendar,build-kudos-aggregate,validate-events-folders}.ts
ls projects/community-platform/tests/unit/{events,home-feed,ical,community-defaults,build-event-rosters,build-calendar,build-kudos-aggregate,validate-events-folders,build-reliability}.test.ts
ls docs/decisions/0012-community-platform-v0-3-discovery-posture.md
ls community/community-defaults.json community/events/_template/README.md
grep -q '"types"' projects/community-platform/tsconfig.json && echo "✓ tsconfig types scoped" || echo "✗ MISSING"
grep -q "## 10. \`@/lib/\*\` path aliases" projects/community-platform/GOTCHAS.md && echo "✓ GOTCHAS row 10 present" || echo "✗ MISSING"

# Confirm tests still green
cd projects/community-platform && pnpm test 2>&1 | tail -3   # expect 678/678 (no Phase 2 tests yet)
cd projects/community-platform && pnpm tsc --noEmit 2>&1 | tail -3   # expect clean

# Phase 2 prerequisite files MUST NOT exist yet
ls projects/community-platform/app/events 2>/dev/null         # expected: not found
ls projects/community-platform/app/components/HomeFeed.tsx 2>/dev/null  # expected: not found
ls projects/community-platform/app/components/AddToCalendarButton.tsx 2>/dev/null  # expected: not found
ls projects/community-platform/app/components/KudosCount.tsx 2>/dev/null  # expected: not found
ls projects/community-platform/app/api/calendar.ics 2>/dev/null  # expected: not found
```

## This chat owns

Execute the **remaining 25 tasks** in `projects/community-platform/v0.3.0-plan.md`:

- **Phase 2 (10 tasks, plan lines 2087-3414)** — Read surfaces.
  Exit criteria: read surfaces render with mock data; E2E scenarios 1, 2, 6, 7 pass; Lighthouse `/home` within ±5% of v0.2 baseline (99/100 mobile/desktop).
- **Phase 3 (9 tasks, plan lines 3415-4896)** — Write surfaces (RSVP + Kudos).
  Exit criteria: RSVP + Thanks E2E scenarios pass (3, 4, 5, 9, 10, 11, 12, 13); security-reviewer 0 CRITICAL / 0 HIGH on `rsvp-event` + `thank-status`; coverage gates met on strict-list.
- **Phase 4 (6 tasks, plan lines 4897-5489)** — PWA + Closeout.
  Final exit: tag `community-platform-v0.3.0` pushed; CHANGELOG + STATE updated; production smoke green; memory + chat-N+1 handoff written.

Use `superpowers:subagent-driven-development` with fresh-subagent-per-task + two-stage review.

## Lessons from chat-19 (apply to every dispatch)

These are NOT optional. Each one was learned the hard way in Phase 1; pre-bake them into your subagent prompts to avoid a third rediscovery.

1. **Test files go under `tests/unit/`** — vitest config's `include` glob is `tests/unit/**` + `tests/integration/**`. The plan repeatedly writes `lib/X.test.ts` paths; correct them to `tests/unit/X.test.ts` in every dispatch prompt. (No co-located tests in this project.)
2. **ESM, not CommonJS** — `"type": "module"`. Scripts MUST use `import { fileURLToPath } from "node:url"; const __dirname = path.dirname(fileURLToPath(import.meta.url));` instead of CJS globals. Entry-point guard: `if (process.argv[1]?.endsWith("script-name.ts")) { main(); }` instead of `require.main === module`.
3. **The plan's `scripts/build-snapshot.ts` does NOT exist** — the orchestrator is `scripts/snapshot-content.ts`. Phase 2 doesn't add new build scripts, but if a future task wires one in, target `snapshot-content.ts`.
4. **`pnpm-lock.yaml` lives in `projects/community-platform/`, NOT at the repo root** (no workspace file).
5. **The plan's verbatim git push command uses stale branch `chore/community-platform-v0-3`** — actual branch is `chore/community-platform-v0-3-impl`. Substitute in every dispatch.
6. **GOTCHAS row 10 — `@/lib/*` aliases inside `lib/` break the tsx prebuild on Vercel.** When ANY new file is added under `lib/`, use relative imports (`./roster`, `./events`, etc.) for files in the same directory, even if the existing siblings use `@/lib/*`. Aliases are fine from `app/`, `scripts/`, and tests.
7. **Coverage gates** — 80% overall (vitest global threshold gates `pnpm test`); 100% lines on the v0.3 strict-list per §13.9. v0.1 + v0.2 strict-list precedent: branches ≥80% is acceptable for unreachable-defensive-fallback branches; functions/statements ≥80% likewise. Prioritize 100% lines.
8. **Pre-push smoke** — before every `git push`, run `rm -f projects/community-platform/lib/__generated__/content-snapshot.json && cd projects/community-platform && pnpm snapshot && pnpm tsc --noEmit` to exercise the Vercel-like fresh-state prebuild chain. Catches the chicken-and-egg pattern locally before it surfaces on Vercel as a 6-12s fast-fail.
9. **Don't use `!` non-null assertions** — ESLint enforces `@typescript-eslint/no-non-null-assertion`. Use guarded access (`if (!entry) continue;`) or a `getEntry()` test helper that throws with a clear message.
10. **`gray-matter` is already a dep** — no need to install. Used by `lib/profile-editor.ts`.

## Phase 2 first-task pointer (plan lines 2087-3414)

The 10 Phase 2 tasks in order:

| ID | File | Strict? | Plan lines | Notes |
|---|---|---|---|---|
| 2.1 | `app/components/HomeFeed.tsx` | yes | 2095-2311 | D-layout renderer; XSS-defended via `SafeHtml` |
| 2.2 | `app/home/page.tsx` + `proxy.ts` PUBLIC | no | 2312-2483 | First task touching `proxy.ts` — H30 lands here |
| 2.3 | `app/meetings/page.tsx` | no | 2484-2622 | Calls the new `listMeetings(listMeetingsFromSnapshot())` — note signature requires source arg |
| 2.4 | `app/meetings/[slug]/page.tsx` extend + `proxy.ts` `/meetings/` PREFIX | no | 2623-2724 | Extended frontmatter render + `<AddToCalendarButton>` |
| 2.5 | `app/events/page.tsx` | no | 2725-2885 | Upcoming + Past sections |
| 2.6 | `app/events/[slug]/page.tsx` | no | 2886-3032 | Read-only detail; RSVP UI wired in 3.4 |
| 2.7 | `app/components/AddToCalendarButton.tsx` | yes | 3033-3146 | Client; downloads per-event ICS string |
| 2.8 | `app/this-week/page.tsx` L2 strip | no | 3147-3236 | Mount `<HomeFeed showRecent={false}>` above compose |
| 2.9 | `app/api/calendar.ics/route.ts` | yes | 3237-3307 | Serves build-time ICS artifact |
| 2.10 | `app/components/KudosCount.tsx` | yes | 3308-3414 | Reads `kudos.json` build-time artifact |

Recommended order: 2.1 (HomeFeed component) → 2.2 (`/home` page that mounts it + makes `/home` public) → 2.3-2.6 (index + detail pages) → 2.7+2.9 (Add-to-Calendar + ICS route) → 2.8 (this-week strip) → 2.10 (KudosCount). 2.1 ships the most-reused component; subsequent pages mount it.

## Done means

- **All 25 remaining tasks committed** on `chore/community-platform-v0-3-impl`.
- **PR opened** (Draft until Phase 4 closeout; then Ready + merge).
- **CHANGELOG entry** for v0.3.0 (Task 4.5) replacing the chat-19 `[Unreleased]` block.
- **STATE.md updated** — phase: "v0.3.0 shipped"; new `v0_3_ship` row.
- **Tag `community-platform-v0.3.0` pushed** at merge SHA.
- **Production smoke** executed Anton-side per §13.11.2 step 4.
- **Project memory** added: `project_community_platform_v0_3_ship.md`.
- **Chat-N+1 follow-on handoff** drafted (Task 4.6 menu options A–H).

## Anti-patterns (chat-specific — beyond protocol §7 universals)

- Don't deviate from plan O1-O8 locks without flagging.
- Don't reopen §13 Q1-Q6 / D1-D20 (brainstorm output).
- Don't bundle v0.2.x retroactive cleanup (Mark Spasonov PR #3, branch-protection PR-required gate).
- Don't bypass v0.2.2 SHA-passthrough contract in `rsvp-event` or `thank-status` (Phase 3). 409 = `REFRESH_NEEDED` with NO retry (H31, H40, H53).
- Don't introduce `auth()` in new SSG read surfaces (H30 forward-defending Pattern 8).
- Don't introduce `@/lib/*` imports inside files under `lib/` (GOTCHAS row 10).

## Token discipline

- Fresh subagent per task; batched reviewer-fix commits per phase (Phase 2 closeout + Phase 3 closeout + Phase 4 closeout = three fix commits max).
- Self-review per HANDOFF_PROTOCOL §1 inline; don't surface as separate "findings" turns.
- E2E retries `--retries=2` only at closeout per CONSTRAINTS line 28.
- If you hit the same Vercel preview failure mode after a push: STOP, read GOTCHAS row 10, run the pre-push smoke (lessons §8) before re-pushing — don't reproduce chat-19's diagnostic detour.

## Reference pointers

- **Plan:** `projects/community-platform/v0.3.0-plan.md` (5734 lines, 36 tasks).
- **Spec:** `projects/community-platform/spec.md` §13.
- **ADR-0012:** `docs/decisions/0012-community-platform-v0-3-discovery-posture.md` (shipped chat-19).
- **CHANGELOG:** chat-19's `[Unreleased]` block at top (replace with v0.3.0 final at Task 4.5).
- **Production:** https://warsaw-ai-community-platform.vercel.app (still at v0.2.2 = `community-platform-v0.2.2` tag at SHA `7cd87c3`).
- **Vercel project:** `prj_UT1RQ1Bn9XuMV7UnwWSFS0THiLHS` in team `team_iEUo3hzS0aASHR0TEAB70Z8W`, Root Directory `projects/community-platform`.

---

## Paste-ready prompt for chat 20

```
Warsaw AI Community Platform — Chat 20: v0.3 Phase 2-4 implementation

v0.3 Phase 1 (Foundation) shipped chat-19 on branch chore/community-platform-v0-3-impl
HEAD 5384dd2. Vercel preview validated green at 5384dd2 (42s build).
11 of 36 v0.3 tasks committed; 25 remaining.

Working dir: ~/Projects/Warsaw\ AI\ Comunity/projects/community-platform/
Branch: chore/community-platform-v0-3-impl (off main 7466673). DO NOT create
a new branch — continue on this one.

Invoke `superpowers:subagent-driven-development` at the very start
(per HANDOFF_PROTOCOL §8).

Full handoff: docs/specs/2026-05-17-community-platform-v0-3-phase-2-handoff.md
Read sections "Setup", "Lessons from chat-19", "Phase 2 first-task pointer",
"Done means", "Anti-patterns".

This chat owns: execute 25 remaining tasks in projects/community-platform/v0.3.0-plan.md.
Phases: 2 Read surfaces (10) → 3 Write surfaces (9) → 4 PWA + Closeout (6).

CRITICAL chat-19 lessons (apply to every dispatch):
- Tests go in tests/unit/ (vitest include glob).
- ESM only: __dirname via fileURLToPath(import.meta.url).
- Orchestrator is scripts/snapshot-content.ts (NOT the plan's "build-snapshot.ts").
- pnpm-lock.yaml at projects/community-platform/ (not repo root).
- Plan's "chore/community-platform-v0-3" branch ref is stale → use "chore/community-platform-v0-3-impl".
- GOTCHAS row 10 — NO @/lib/* imports inside files under lib/ (breaks tsx prebuild on Vercel).
- Pre-push smoke: `rm lib/__generated__/content-snapshot.json && pnpm snapshot && pnpm tsc --noEmit`.

Done means: PR merged; tag community-platform-v0.3.0 pushed; CHANGELOG +
STATE updated; production smoke green; memory + chat-N+1 handoff written.

Coverage gates: 80% overall + 100% lines strict-list (§13.9).
Hardening grep target at DoD: 26 unique IDs (H30–H55). Chat-19 landed 13;
chat-20 lands the remaining 13.

Token discipline: fresh subagent per task; batched reviewer-fix commits per phase;
--retries=2 at closeout only.
```

---

*Drafted 2026-05-17 in chat-19 at Phase 1 boundary. Mirrors chat-13 + chat-19 handoff template structure.*
