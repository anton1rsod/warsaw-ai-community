# Chat-24 handoff: v0.4 Phase A implementation plan (writing-plans)

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) (loaded once at start; see §3 for chat-brief shape)

**Status (drafted in chat-23 close-out, 2026-05-18):** Chat-23 spec writing CLOSED. Spec §14 added (~530 lines; spec.md: 2516 → 3045) at `projects/community-platform/spec.md`. ADR-0014 written at `docs/decisions/0014-community-platform-v0-4-root-anonymous-landing.md` (~123 lines, status Proposed). All 14 open questions O1–O14 locked inline in spec §14 (some with structured proposal variants where Anton picks at PR review). User-test recruitment skipped per Anton call 2026-05-18; structural Playwright walkthrough of v0.3.1 production substituted as compensating control (`docs/research/v0-4-gstack-walkthrough-2026-05-18/findings.md` — 237 lines + 8 screenshots; zero D-id contradictions; brainstorm-output preserved unchanged).

Chat-24 turns spec §14 + ADR-0014 into a Phase A implementation plan via `superpowers:writing-plans`.

---

## Setup

Starts on `chore/community-platform-v0-4-spec` (chat-23 PR pending merge). Branch off main once chat-23 PR lands; otherwise branch off `chore/community-platform-v0-4-spec`.

```bash
cd "$HOME/Projects/Warsaw AI Comunity" && git fetch && git checkout main && git pull
# IF chat-23 PR already merged:
git checkout -b chore/community-platform-v0-4-plan
# IF chat-23 PR still open:
git checkout chore/community-platform-v0-4-spec && git pull
git checkout -b chore/community-platform-v0-4-plan
```

## Read in order (~700 lines total — bounded by HANDOFF_PROTOCOL §5)

1. **This handoff** (~200 lines).
2. **`projects/community-platform/STATE.md`** (~220 lines) — current state; chat-23 closure recorded.
3. **`projects/community-platform/CONSTRAINTS.md`** (~85 lines) — locked rules.
4. **`projects/community-platform/HANDOFF_PROTOCOL.md`** (~165 lines) — protocol; once-per-project read.
5. **`projects/community-platform/spec.md` §14** (~530 lines, lines 2517–3045) — THE source of truth for chat-24. Read each subsection in order (§14.0 → §14.11).
6. **`docs/decisions/0014-community-platform-v0-4-root-anonymous-landing.md`** (~123 lines, Proposed) — read once.
7. **`docs/research/v0-4-gstack-walkthrough-2026-05-18/findings.md`** §9 only (refinements for spec §14) — ~30 lines.
8. **Skim `projects/community-platform/v0.3.0-plan.md`** structure (NOT content) — chat-18 produced 5734 lines, 36 tasks, 4 phases; chat-24 mirrors the structural pattern. Look at table-of-contents only; don't pre-read task bodies.

**Skip:** earlier spec sections (§§1–§13); CHANGELOG (read on demand only); chat-22 brainstorm-output (already crystallized into §14).

## Verify-before-claiming queries (run early)

| Query | Why |
|---|---|
| `grep -n "PUBLIC_PATHS" projects/community-platform/proxy.ts` | Confirm current state before specifying the Phase A diff. |
| `Read projects/community-platform/v0.3.0-plan.md` line range for Task 1.1 (or first task) | Mirror the structural pattern: Goal / Acceptance / Steps / Tests / Hardenings-mapped / Risk. |
| `ls projects/community-platform/app/components/` | Confirm v0.3.1 component inventory (which 7 NEW components add vs which existing files modify). |
| `Read projects/community-platform/app/page.tsx` | The root route file ADR-0014 + H56 + H57 + Phase A hero composition refactors. |
| `grep -rn "describe(\"H" projects/community-platform/tests/ \| wc -l` | Current hardening test count (should be 55 hits across H1–H55; chat-24 plan adds 12 H56–H68 describe blocks). |

## This chat owns

### Implementation plan for Phase A only

Write `projects/community-platform/v0.4.0-plan.md` (mirrors v0.3.0-plan.md structure). Target: **~20-25 tasks** decomposed across:

- **Phase A.0 — Foundation** (~5 tasks): token CSS variable system + Tailwind config + `lib/i18n/strings.ts` scaffold + axe-core setup + `proxy.ts` PUBLIC_PATHS diff.
- **Phase A.1 — Shared components** (~7 tasks): `<Header>` / `<Footer>` / `<Avatar>` / `<ListItem>` / `<DateTime>` / `<Tag>` / `<EmptyState>` — one task per component with TDD + 100% strict-list.
- **Phase A.2 — Routes** (~5 tasks): `/` (ADR-0014 hero) + `/calendar` (new) + `/handbook` (new) + `/home` signed-in dashboard "Your week" pane + global shell wrap on existing routes.
- **Phase A.3 — Asset / CI / closeout** (~4 tasks): PWA icon + favicon regen with `WA` on `#f59e0b`; manifest theme color update; `scripts/validate-persona-folders.ts` (H68) + CI workflow add; CHANGELOG + STATE.md update.

**Task body template (per v0.3 precedent):**

```
### Task N.M — <Title>

**Goal:** one-sentence outcome.

**Acceptance criteria** (checkbox list):
- [ ] [behavior]
- [ ] [behavior]

**Steps** (numbered, ~3-7 per task):
1. [step] → verify via [check]
2. [step] → verify via [check]

**Tests:**
- `tests/unit/.../X.spec.ts` — `describe("Task N.M: ...")` covers acceptance
- `tests/unit/h-v0-4.spec.ts` — `describe("H<n>: ...")` covers hardening (if applicable)

**Hardenings mapped:** H<n>, H<m>

**Risk / rollback:** what breaks if this lands wrong + how to revert.
```

### NOT for chat-24

- Phase B implementation plan (deferred per D44 lock).
- Phase C implementation plan (deferred per D44 lock).
- Re-litigating any D21–D44 lock — chat-23 spec is the source of truth.
- Re-running design-shotgun — spec §14 already locks O2/O3/O6/O7/O12 inline.

### Open questions chat-24 owns

- **O8 (sidebar collapse breakpoint, Phase B target)** — explicit defer to Phase B; chat-24 records it as a Phase B-prep note in the plan but doesn't lock the breakpoint.
- **O10 (i18n namespace structure: flat keys vs nested by surface)** — chat-24 mechanical decision; recommend **flat keys with surface-prefix** (e.g., `header.signIn`, `home.thisWeek.empty`) for grep-ability + type-safe export pattern.

## Done means

1. `projects/community-platform/v0.4.0-plan.md` drafted (~3000-5000 lines per v0.3 precedent; ~20-25 tasks).
2. Each task has Goal / Acceptance / Steps / Tests / Hardenings mapped / Risk per template.
3. All 12 H56–H68 hardenings mapped to specific test files via `describe("H<n>: ...")` prefix.
4. STATE.md updated (`phase` field → `v0.4 plan drafted`; `v0_4_plan_sha` row added).
5. Memory entry `project_community_platform_v0_4_plan.md` written.
6. Chat-25 implementation handoff drafted at `docs/specs/<chat-25-date>-community-platform-v0-4-implementation-handoff.md` — invokes `superpowers:subagent-driven-development` for Phase A.
7. Commit + push. Plan-doc PR can ship direct-to-main per `feedback_pr_vs_direct` memory exception (`*.md` only, no CI-trigger code path).

## Anti-patterns (chat-24 specific)

- **Don't expand the spec mid-plan.** If a spec ambiguity surfaces, file it as a chat-24 open question OR write a §9.x amendment in `execution-plan.md`. Don't add to spec §14.
- **Don't pre-stage Phase B / Phase C tasks.** Per D44 lock, B + C are CONDITIONAL post-ship. Phase A plan is self-contained.
- **Don't drift from v0.3.0-plan.md structure.** Mirror task-body template; mirror Phase numbering convention.
- **Don't re-invent shared component test patterns.** v0.3 already covers RTL + `afterEach(cleanup)` + mock restoration; Phase A inherits.
- **Don't expand strict-list silently.** §14.8 is the canonical Phase A strict-list. If a task touches a file outside that list, document the why in the task body.

## Skill sequence (chat-24)

1. **Plan writing:** `superpowers:writing-plans` for `v0.4.0-plan.md`.
2. **Self-review:** HANDOFF_PROTOCOL §1 C1–C4 pass.
3. **Commit + push.** Plan-doc PR optional (path is `.md`-only — `feedback_pr_vs_direct` exception applies).

## Reference pointers

- **Spec §14 (chat-23 source):** `projects/community-platform/spec.md` lines 2517–3045 (~530 lines).
- **ADR-0014:** `docs/decisions/0014-community-platform-v0-4-root-anonymous-landing.md`.
- **Brainstorm output (chat-22):** `docs/specs/2026-05-17-community-platform-v0-4-brainstorm-output.md` (cite for D-id rationale; don't re-litigate).
- **Walkthrough findings (chat-23 compensating control):** `docs/research/v0-4-gstack-walkthrough-2026-05-18/findings.md`.
- **v0.3 plan precedent:** `projects/community-platform/v0.3.0-plan.md` (5734 lines, 36 tasks across 4 phases — chat-24 mirrors structure).
- **Production v0.3.1:** `https://warsaw-ai-community-platform.vercel.app` (deploy `ivbncdcvq`, tag `community-platform-v0.3.1`).
- **Memory:** `project_community_platform_v0_4_brainstorm.md`, `project_community_platform_v0_4_spec.md` (chat-23 writes this).

## Paste-ready prompt for chat 24

```
Warsaw AI Community Platform — Chat 24: v0.4 Phase A implementation plan

Status: chat-23 spec §14 + ADR-0014 + structural walkthrough committed. User-test recruitment was SKIPPED per Anton (2026-05-18); structural Playwright walkthrough substituted. Zero D-id contradictions. 14 open questions O1–O14 locked inline in spec §14.

Working dir: ~/Projects/Warsaw\ AI\ Comunity/projects/community-platform/

Read in order:
1. This handoff (~200 lines)
2. STATE.md / CONSTRAINTS.md / HANDOFF_PROTOCOL.md (~470 lines)
3. spec.md §14 (lines 2517–3045, ~530 lines)
4. ADR-0014 (~123 lines)
5. v0.3.0-plan.md TOC only (mirror structure)

Skill: superpowers:writing-plans for v0.4.0-plan.md (~3000-5000 lines, ~20-25 Phase A tasks).

Output:
- projects/community-platform/v0.4.0-plan.md
- STATE update + memory entry
- chat-25 implementation handoff

Anti-patterns:
- Don't re-litigate D21–D44 or O1–O14 locks (spec §14 is the source).
- Don't pre-stage Phase B / C tasks (D44 — CONDITIONAL post-ship).
- Don't drift from v0.3.0-plan.md structural pattern.

Done means: v0.4.0-plan.md drafted, STATE bumped, chat-25 handoff drafted, commit/push.
```
