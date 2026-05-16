# Chat 19 handoff: v0.3.0 implementation — Discovery+ release

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) — operating discipline. Read once at session start.

**Status:** v0.3 plan-written (chat-18, 2026-05-17). `projects/community-platform/v0.3.0-plan.md` at branch `chore/community-platform-v0-3-plan` (PR Draft). This chat owns implementation.

---

## Setup

Fresh chat. Branch off `main` (after the v0.3 plan PR merges) OR off `chore/community-platform-v0-3-plan` if the plan PR is still Draft. The plan branch contains all the artifacts chat-19 needs to reference (the plan file itself, updated STATE.md, memory entry, this handoff).

Invoke **`superpowers:subagent-driven-development`** at the very start (per HANDOFF_PROTOCOL §8 sub-skill sequence). Brainstorming → spec → plan → implement is four chats minimum; this chat is step 4.

## Read in order (~700 lines total)

1. `projects/community-platform/STATE.md` — current state (phase = "v0.3 plan-written").
2. `projects/community-platform/CONSTRAINTS.md` — locked rules.
3. `projects/community-platform/GOTCHAS.md` — operational patterns (includes row 9 for transitive `@types/*`).
4. `projects/community-platform/HANDOFF_PROTOCOL.md` — operating discipline.
5. `projects/community-platform/v0.3.0-plan.md` — **primary input** (5734 lines; read header + Locks + O1–O8 + file structure up front, then load per-phase task content as the dispatch progresses).
6. `docs/playbooks/recurring-plan-defects.md` — code-level patterns to guard against.
7. Memory: `project_community_platform_v0_3_plan.md` — plan-writing decisions to honor.

DO NOT pre-read `plan.md`, `v0.1.1-plan.md`, `v0.2.0-plan.md`, `CHANGELOG.md`. All historical.

## Verify-before-claiming queries (run early)

```bash
# Confirm plan-writing state
git log --oneline -5 chore/community-platform-v0-3-plan
ls projects/community-platform/v0.3.0-plan.md
grep -c "^### Task " projects/community-platform/v0.3.0-plan.md  # expected: 36

# Confirm v0.2.2 / v0.3-brainstorm ship state
git tag -l community-platform-v0.2.2
git log --oneline -3 main
grep -n "^## 13" projects/community-platform/spec.md

# Confirm prerequisite files don't exist yet (plan input)
ls projects/community-platform/lib/events.ts 2>/dev/null     # expected: not found
ls projects/community-platform/lib/home-feed.ts 2>/dev/null   # expected: not found
ls projects/community-platform/app/events 2>/dev/null          # expected: not found
ls projects/community-platform/app/components/EventRsvpButton.tsx 2>/dev/null  # expected: not found

# Confirm tsconfig current state (Task 1.11 input)
grep -n '"types"' projects/community-platform/tsconfig.json

# Confirm ics dep is NOT installed yet (Task 1.6 input)
grep '"ics"' projects/community-platform/package.json   # expected: empty
```

## This chat owns

Execute `projects/community-platform/v0.3.0-plan.md` end-to-end. 36 tasks across 4 phases. Use `superpowers:subagent-driven-development` for fresh-subagent-per-task with two-stage review.

The plan defines the work; **do not improvise outside the plan**. If a plan step is ambiguous or wrong, surface it BEFORE writing code (this is what the plan's "Self-review" section flagged — particularly the `serializeFrontmatter` signature in Phase 3 Task 3.1).

### Phase-by-phase exit criteria (from plan)

**Phase 1 — Foundation (11 tasks)**: all unit tests pass, `pnpm typecheck` green, `pnpm build` green, ADR-0012 merged, GOTCHAS row 9 verified, tsconfig types scope landed.

**Phase 2 — Read surfaces (10 tasks)**: read surfaces render with mock data; E2E scenarios 1, 2, 6, 7 pass; Lighthouse `/home` within ±5% of v0.2 baseline (99/100 mobile/desktop).

**Phase 3 — Write surfaces (9 tasks)**: RSVP + Thanks E2E scenarios pass (3, 4, 5, 9, 10, 11, 12, 13); security-reviewer 0 CRITICAL / 0 HIGH on `rsvp-event` + `thank-status`; coverage gates met on strict-list.

**Phase 4 — PWA + Closeout (6 tasks)**: all DoD items checked; tag `community-platform-v0.3.0` pushed; production smoke green; memory entry written; chat-N+1 handoff drafted.

### Hardening grep target (at DoD)

```bash
grep -rn 'describe("H3[0-9]:\|describe("H4[0-9]:\|describe("H5[0-5]:' \
  projects/community-platform/{tests,lib,app,scripts} \
  | sed 's/.*describe("\(H[0-9]\+\):.*/\1/' | sort -u | wc -l
# Expected: 26 (H30–H55)
```

## Done means

- **All 36 tasks committed** to a feature branch (e.g., `chore/community-platform-v0-3-impl`) and pushed.
- **PR opened** for v0.3.0 ship (Draft until Phase 4 closeout; then Ready + merge).
- **CHANGELOG entry** for v0.3.0 (Task 4.5).
- **STATE.md updated** — phase: "v0.3.0 shipped"; new `v0_3_ship` `Last verified` row.
- **Tag `community-platform-v0.3.0` pushed** at merge SHA.
- **Production smoke** executed Anton-side per §13.11.2 step 4.
- **Project memory** added: `project_community_platform_v0_3_ship.md` (template in plan Task 4.6).
- **Chat-N+1 follow-on handoff drafted** at `docs/specs/<YYYY-MM-DD>-community-platform-v0-3-shipped-followups-handoff.md` (template in plan Task 4.6 with menu options A–H).

## Anti-patterns (chat-specific — beyond protocol §7 universals)

- **Don't deviate from the plan without flagging.** The plan locks O1–O8 with reasoning. If a step is wrong, surface it; don't silently choose differently. Spec amendments require ADR.
- **Don't reopen §13 decisions** (Q1-Q6, D1-D20). Those are brainstorm output.
- **Don't predetermine v0.3.0 / v0.3.1 split** unless implementation actually exceeds 50 tasks OR 2 weeks (the plan settled at 36 tasks; default = single v0.3.0).
- **Don't bundle retroactive v0.2.x cleanup** (Mark Spasonov PR #3 backfill, branch-protection PR-required gate). Those are explicit chat-N+1 menu items (A, C in plan's chat-N+1 handoff template).
- **Don't skip tests.** Plan is TDD-disciplined (Red → Green → Refactor → Commit per step). Coverage gates are gating (Phase exit criteria).
- **Don't bypass v0.2.2 SHA-passthrough contract** in `rsvp-event` or `thank-status`. 409 = `REFRESH_NEEDED` with NO retry (H31, H40, H53).
- **Don't introduce `auth()` in new SSG read surfaces** (H30 forward-defending Pattern 8 — auth() forces dynamic and breaks SSG caching).

## Token discipline (project memory `feedback_token_discipline`)

- Use `superpowers:subagent-driven-development` with fresh subagent per task (limits per-task context bleed).
- Batch reviewer-fix commits per phase (one `fix(community-platform): batched reviewer fixes — Phase N` commit at phase end).
- Self-review per HANDOFF_PROTOCOL §1 inline; don't surface as a separate "findings" turn.
- E2E retries use `--retries=2` only at closeout per CONSTRAINTS line 28 + Pattern 9.

## Reference pointers

- **Plan:** `projects/community-platform/v0.3.0-plan.md` (5734 lines, 36 tasks).
- **Spec:** `projects/community-platform/spec.md` §13 (chat-17 brainstorm at SHA `00faca9`).
- **ADR-0012 location** (will be created by Task 1.1): `docs/decisions/0012-community-platform-v0-3-discovery-posture.md`.
- **CHANGELOG:** v0.2.2 entry at top; v0.3.0 appended at Task 4.5.
- **Production:** https://warsaw-ai-community-platform.vercel.app
- **Defects playbook:** `docs/playbooks/recurring-plan-defects.md`
- **Vercel project:** `prj_UT1RQ1Bn9XuMV7UnwWSFS0THiLHS` in team `team_iEUo3hzS0aASHR0TEAB70Z8W`, Root Directory `projects/community-platform`.

---

## Paste-ready prompt for chat 19

```
Warsaw AI Community Platform — Chat 19: v0.3.0 implementation

v0.2.2 shipped 2026-05-16 (tag community-platform-v0.2.2 at SHA 7cd87c3).
v0.3 brainstorm merged 2026-05-17 (PR #18 at SHA 3bfa5da).
v0.3 plan-written 2026-05-17 (chat-18, branch chore/community-platform-v0-3-plan).

Working dir: ~/Projects/Warsaw\ AI\ Comunity/projects/community-platform/
(auto-loads root CLAUDE.md + this dir's CLAUDE.md — follow its Read order).

Invoke `superpowers:subagent-driven-development` at the very start (per HANDOFF_PROTOCOL §8).

Full handoff: docs/specs/2026-05-17-community-platform-v0-3-implementation-handoff.md
Read sections "Setup", "This chat owns", "Done means", "Anti-patterns".

This chat owns: execute 36 tasks in projects/community-platform/v0.3.0-plan.md.
Phases: 1 Foundation (11) → 2 Read surfaces (10) → 3 Write surfaces (9) → 4 PWA + Closeout (6).

Done means: PR merged; tag community-platform-v0.3.0 pushed; CHANGELOG +
STATE updated; production smoke green; memory + chat-N+1 handoff written.

Coverage gates: 80% overall + 100% strict-list (18 files per §13.9).
Hardening grep: 26 unique IDs (H30–H55).

Anti-patterns:
- Don't deviate from plan locks O1-O8 without surfacing first.
- Don't reopen Q1-Q6 / D1-D20 (brainstorm output).
- Don't bundle v0.2.x retroactive cleanup.
- Don't bypass v0.2.2 SHA-passthrough; 409 = REFRESH_NEEDED (no retry).
- Don't introduce auth() in new SSG read surfaces (H30).

Token discipline: fresh subagent per task; batched reviewer-fix commits per phase; --retries=2 at closeout only.
```

---

*Drafted 2026-05-17 in chat-18 (v0.3 plan-writing). Mirrors chat-13 handoff template structure.*
