# Chat 18 handoff: v0.3 plan-writing — Discovery+ release

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) — operating discipline. Read once at session start.

**Status:** v0.2.2 SHIPPED on `main` at SHA `7cd87c3`, tag `community-platform-v0.2.2`. v0.3 brainstorm closed (chat 17). This chat owns plan-writing — does NOT write code.

---

## Setup

Fresh chat. Branch off `main` (after the v0.3 brainstorm PR merges) or off the brainstorm branch if not yet merged.

Invoke **`superpowers:writing-plans`** at the very start (per HANDOFF_PROTOCOL §8 sub-skill sequence). Brainstorming → spec → plan → implement is four chats minimum; this chat is step 3.

## Read in order (~700 lines total)

1. `projects/community-platform/STATE.md` — current state.
2. `projects/community-platform/CONSTRAINTS.md` — locked rules.
3. `projects/community-platform/GOTCHAS.md` — operational patterns (now includes row 9 for transitive `@types/*`).
4. `projects/community-platform/HANDOFF_PROTOCOL.md` — operating discipline.
5. `projects/community-platform/spec.md` **§13 v0.3.0 Discovery+** — primary input. ~600 lines.
6. `projects/community-platform/spec.md` **§11 v0.1.1 invitation** + **§12 v0.2.0 profile editor** — precedent patterns plan-writing should mirror.
7. Memory: `project_community_platform_v0_2_brainstorm.md` + `project_community_platform_v0_2_plan.md` — for shape comparisons (§13 should produce a comparable plan, ~22-28 tasks across 4-5 phases).
8. `docs/playbooks/recurring-plan-defects.md` — code-level patterns plan-writing must guard against.

DO NOT pre-read `plan.md`, `v0.1.1-plan.md`, `v0.2.0-plan.md`, `CHANGELOG.md`. All historical.

## Verify-before-claiming queries (run early)

```bash
# Confirm v0.2.2 ship state
git log --oneline -5 main
git tag -l community-platform-v0.2.2

# Confirm spec §13 is in place
grep -n "^## 13" projects/community-platform/spec.md

# Confirm new files don't exist yet (plan input)
ls projects/community-platform/app/events 2>/dev/null     # expected: not found
ls projects/community-platform/app/meetings 2>/dev/null   # expected: only [slug] subfolder
ls projects/community-platform/lib/events.ts 2>/dev/null  # expected: not found

# Confirm tsconfig current state (informs H50 step in Phase 1)
grep -n '"types"' projects/community-platform/tsconfig.json
```

## This chat owns

Write `projects/community-platform/v0.3.0-plan.md` per §13 spec.

The writing-plans skill will walk through:

1. **Phase decomposition.** Likely 4 phases (mirrors v0.2.0's 4-phase structure):
   - **Phase 1: Foundation** — `lib/events.ts`, `lib/meetings.ts`, `lib/home-feed.ts`, `lib/ical.ts`, `lib/community-defaults.ts`, `community/community-defaults.yaml`, tsconfig types scope (H50), build scripts (`build-event-rosters.ts`, `build-calendar.ts`, `validate-events-folders.ts`), `ics` npm dep vetting (H52).
   - **Phase 2: Read surfaces** — `/home` rewrite, `/events` index, `/events/[slug]` detail (without RSVP wiring), `/meetings` index, `/this-week` L2 strip mount, AddToCalendarButton, /api/calendar.ics route.
   - **Phase 3: Write surface (RSVP L3)** — `app/actions/rsvp-event.ts`, `EventRsvpButton.tsx`, `EventRoster.tsx`, `events_going` profile frontmatter, integration with `EventDetail` page from Phase 2.
   - **Phase 4: Closeout** — E2E suite (8 scenarios per §13.10), coverage gates, hardenings grep verification (23 IDs), security review, GOTCHAS row 9 commit, ship-day runbook prep.

2. **Per-task definition.** Each task: scope, files touched, hardenings tested, coverage gate, exit criteria. Mirror v0.2.0-plan.md structure (3156 lines, 22 tasks).

3. **Open spec questions to lock during plan-writing:**
   - **O1: ICS generator package.** Spec proposes `ics` (MIT, npm). Verify type-completeness checklist (§13.7.2) passes; lock specific version.
   - **O2: event-rosters.json storage.** Spec says "plan-writing chooses" — committed (v0.2 precedent for diff visibility) vs gitignored (cleaner repo). Default: committed.
   - **O3: `/home` in PUBLIC_PATHS or auth-gated.** Spec §13.5.3 says anonymous can see `/home`; verify against `proxy.ts` current state; if currently auth-gated, decide whether to relax (publicizes the feed) or keep auth-gated.
   - **O4: `/api/calendar.ics` in PUBLIC_PATHS.** ICS feed must be publicly subscribable; confirm proxy.ts route allowlist.
   - **O5: community-defaults.yaml vs .json.** Spec proposes YAML; .json offers tighter Zod validation. Plan-writing locks.

4. **Test-file-per-hardening mapping.** Each H30–H52 ID gets a specific test file + `describe("H<n>:")` block. Plan-writing produces the grep-verifiable contract.

5. **Versioning split trigger.** Per §13 header: re-split into v0.3.0 + v0.3.1 if implementation estimate exceeds 50 tasks OR 2 weeks elapsed wall-time. Default split point if forced = (v0.3.0 = meeting + event surfacing + /home + L2 + GCal V-static / v0.3.1 = event RSVP L3).

The plan DOES NOT:
- Write code.
- Lock decisions that re-open §13 (those need a brainstorm amendment, not a plan decision).

## Done means

- **`v0.3.0-plan.md` written** in `projects/community-platform/` covering: phase decomposition, per-task definition, hardenings mapping, coverage targets, exit criteria per phase.
- **Plan committed** to a feature branch (e.g., `chore/community-platform-v0-3-plan`) and pushed.
- **PR opened** — Draft is fine; reviewable before implementation.
- **STATE.md updated** — phase: "v0.3 plan-written", new `Last verified` row referencing the plan SHA.
- **Project memory** added: `project_community_platform_v0_3_plan.md`.
- **Chat-19 implementation handoff drafted** at `docs/specs/2026-MM-DD-community-platform-v0-3-implementation-handoff.md`.

## Anti-patterns (chat-specific — beyond protocol §7 universals)

- **Don't reopen §13 decisions** (Q1-Q6, D1-D18). Those are brainstorm output; plan locks the *how*, not the *what*.
- **Don't write code.** Plan-writing → plan.md. If you find yourself writing TS, switch chats.
- **Don't bundle retroactive v0.2.x cleanup** (Mark Spasonov PR #3 backfill, branch-protection PR-required gate). Separate scope.
- **Don't predetermine the v0.3.0 / v0.3.1 split.** Per §13 header — only split if estimate exceeds 50 tasks OR 2 weeks; otherwise single v0.3.0 ship.

## Token discipline (project memory `feedback_token_discipline`)

- Plan-writing chat is single-purpose; no subagent dispatch.
- Plan file ~2500-3500 lines is typical for a v0.x major brainstorm-derived plan (compare v0.2.0-plan.md at 3156 lines).
- Inline self-review per HANDOFF_PROTOCOL §1.

## Reference pointers

- **Spec:** `projects/community-platform/spec.md` §13 (this chat's input)
- **CHANGELOG:** v0.2.2 entry at top
- **Production:** https://warsaw-ai-community-platform.vercel.app
- **Tag:** `community-platform-v0.2.2` at merge SHA `7cd87c3`
- **Defects playbook:** `docs/playbooks/recurring-plan-defects.md`
- **Vercel project:** `prj_UT1RQ1Bn9XuMV7UnwWSFS0THiLHS` in team `team_iEUo3hzS0aASHR0TEAB70Z8W`, Root Directory `projects/community-platform`

---

## Paste-ready prompt for chat 18

```
Warsaw AI Community Platform — Chat 18: v0.3 plan-writing

v0.2.2 shipped 2026-05-16 (tag community-platform-v0.2.2 at SHA 7cd87c3).
v0.3 brainstorm closed (chat 17, spec §13 merged at <SHA-TBD>).

Working dir: ~/Projects/Warsaw\ AI\ Comunity/projects/community-platform/
(auto-loads root CLAUDE.md + this dir's CLAUDE.md — follow its Read order).

Invoke `superpowers:writing-plans` at the very start (per HANDOFF_PROTOCOL §8).

Full handoff: docs/specs/2026-05-16-community-platform-v0-3-brainstorm-handoff.md
Read sections "This chat owns", "Done means", "Anti-patterns".

This chat owns: v0.3.0-plan.md drafted + committed + Draft PR + STATE.md
update + project memory + chat-19 implementation handoff.

Scope (from §13): Discovery+ v0.3 = meeting surfacing + events surface +
unified /home feed (D layout) + /this-week strip (L2) + event RSVP (L3) +
V-static GCal feed. 23 hardenings (H30-H52). ~30 files touched.

Spec §13 produces ~22-28 tasks across 4 phases. Mirror v0.2.0-plan.md structure
(3156 lines, 22 tasks, 4 phases).

Open questions to lock during plan-writing: O1-O5 per handoff "open spec questions".

Anti-patterns:
- Don't reopen §13 decisions (Q1-Q6, D1-D18 are brainstorm output).
- Don't write code. Don't predetermine v0.3.0/v0.3.1 split (only if >50 tasks / >2 weeks).
- Don't bundle retroactive v0.2.x cleanup (Mark Spasonov PR #3, branch protection).

Token discipline: single-purpose; no subagents. Plan ~2500-3500 lines.
```

---

*Drafted 2026-05-16 in chat-17 (v0.3 brainstorm). Mirrors chat-11 handoff template structure.*
