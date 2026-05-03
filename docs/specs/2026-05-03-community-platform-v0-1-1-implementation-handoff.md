# Chat 9 handoff: v0.1.1 invitation feature implementation

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) — operating discipline (hardening checklist, output conventions, anti-patterns). Read once at session start.

**Status:** plan committed at SHA `2201dd9` on `phase-10-followups`. Implementation next.

---

## Setup

Branch is `phase-10-followups` (where the spec + plan both live). Stay on this branch through Phase 11.1 + 11.2; Phase 11.3 ends with the release PR merging this branch to `main` (Task 11.3.9).

If the v0.1.0 follow-up PR (#2) has merged to `main` by the time you start, your branch is already aligned — keep going on `phase-10-followups`.

## Read in order (~530 lines total — per protocol §5)

1. `projects/community-platform/STATE.md` — current state. `phase: "v0.1.1 plan written; implementation next"`.
2. `projects/community-platform/CONSTRAINTS.md` — locked rules. **TDD mandatory (line 26), surgical edits (line 27), coverage gates (line 28), push after substantive commits (line 30), batched reviewer fixes (line 30b).**
3. `projects/community-platform/GOTCHAS.md` — operational patterns; reference by number when a task hits one.
4. `projects/community-platform/HANDOFF_PROTOCOL.md` — hardening checklist (§1), assumption pitfalls (§2), output conventions (§4), sub-skill sequence (§8 — TDD per task), wrap-up artifacts (§9).
5. **`projects/community-platform/v0.1.1-plan.md`** — THE input. 5858 lines, 37 tasks, 191 checkboxes, all 13 hardenings mapped. Read by phase: Phase 11.1 first.
6. **`projects/community-platform/spec.md` §11** — reference for "why". Don't pre-read; consult when a task cites a §11.X subsection.
7. Memory: `project_community_platform_invitation_feature.md` — feature status timeline + plan-writing reconciliations.

DO NOT pre-read full `plan.md` (v0.1.0's 7700-line plan). DO NOT pre-read `CHANGELOG.md`. The v0.1.1 plan is self-contained.

## This chat owns

- **Invoke `superpowers:subagent-driven-development`** (recommended per the plan's Execution Handoff section). Alternative: `superpowers:executing-plans` (inline batch).
- Implement Phase 11.1 → Phase 11.2 → Phase 11.3 in strict order.
- Each task in 11.1 + 11.2 follows the TDD steps printed in the plan: write failing test → run failing → implement → run passing → commit + push.
- **Hardening grep gate at Task 11.3.4 is non-negotiable.** Before opening the release PR, `grep -rn 'describe("H[0-9]' lib/ app/ tests/ | sort -u` returns rows for H1–H13 (13+ hits). Fix any missing before proceeding.
- Phase closeout includes: typecheck + test + coverage + (Phase 11.2 onward) build + (Phase 11.3) E2E. Closeout commit batches reviewer fixes into one `fix(community-platform): batched reviewer fixes — Phase 11.<N>` commit.

## Verify-before-claiming queries (chat-specific)

Per protocol §2 + chat scope, run these EARLY (before any TDD cycle):

```bash
# 1. Confirm session shape (used by both server actions)
grep -n "session\." projects/community-platform/lib/auth.ts

# 2. Confirm existing isAdmin location (Task 11.1.11 plan refinement)
grep -n "isAdmin" projects/community-platform/lib/content-snapshot.ts
grep -n "isAdmin" projects/community-platform/app/admin/health/page.tsx

# 3. Confirm proxy.ts session handling (Task 11.2.2 will modify)
grep -n "PUBLIC_PATHS" projects/community-platform/proxy.ts

# 4. Confirm consent.ts stubBody location (Task 11.1.3 will replace)
grep -n "stubBody" projects/community-platform/app/actions/consent.ts

# 5. Confirm slugify location (Task 11.1.1 will promote)
grep -n "slugify" projects/community-platform/lib/roster.ts

# 6. Confirm github-app.ts wrapper API (Task 11.1.12 extends)
grep -n "writeFile\|GitHubAppClient" projects/community-platform/lib/github-app.ts

# 7. Confirm E2E mock pattern (Task 11.2.10 mirrors)
cat projects/community-platform/app/actions/_test-consent-store.ts
```

Plus protocol §2's full pitfall table — apply any that touch this chat's scope.

## Execution mode (subagent-driven)

Per the plan's "Execution Handoff" + `superpowers:subagent-driven-development`:

1. **One task = one subagent.** Pass the task's full text from `v0.1.1-plan.md` (e.g., Task 11.1.1 = ~80 lines).
2. **Two-stage review** between tasks:
   - Stage 1: subagent's diff is reviewed by the parent — does the test catch the right contract? Is the implementation surgical?
   - Stage 2: re-run the test suite locally; confirm green.
3. **Push after every commit** (CONSTRAINTS line 30). Subagents do this themselves; verify in the post-task review.
4. **Phase boundaries are hard checkpoints.** After Task 11.1.16 (Phase 11.1 closeout), pause for typecheck + coverage report + H-grep partial check (10 of 13 in Phase 11.1) before kicking off Phase 11.2.

## Done means

- All 37 tasks completed (commits + pushes).
- Phase 11.3 closes with: release PR merged to main; tag `community-platform-v0.1.1` pushed; Vercel auto-deploy succeeded; production ALREADY-MEMBER smoke passes; first real invitation sent.
- `STATE.md` updated: `phase: "v0.1.1 shipped"`; tag bumped; new last-verified rows for INVITE_SECRET prod/preview, branch protection, hardening grep count.
- Memory `project_community_platform_invitation_feature.md` status → "shipped" with timeline row.
- Mark Spasonov backfill PR opened separately (Task 11.3.8) — can be a follow-up chat.
- Optional: drift `chat-10` brief if any v0.2 prep work emerges.

## Anti-patterns (chat-specific — beyond protocol §7 universals)

- **Don't deviate from the plan's TDD step order** within a task. Each task's "Step 1: write failing test" must run before "Step 3: implement". Skipping the failing-test step is a TDD discipline violation per CONSTRAINTS line 26.
- **Don't extend `plan.md`** (the v0.1.0 plan). All v0.1.1 work lands in `v0.1.1-plan.md`.
- **Don't introduce new components/files beyond §11.3 + plan reconciliation table.** If you discover one is needed, pause and propose an amendment to the plan first.
- **Don't run security-reviewer until Task 11.3.5.** It's expensive token-wise and the plan reserves it for the final security surface review (CONSTRAINTS line 41-46).
- **Don't push the v0.1.1 tag without Anton's confirmation.** Per CONSTRAINTS auto policy: tags to public remotes need explicit approval.
- **Don't change Z spec wording in CHANGELOG.** The plan's Task 11.3.7 prescribes the exact CHANGELOG entry — copy it verbatim, fill in the SHAs.
- **Don't skip the H1-H13 grep gate.** Task 11.3.4. Single command, hard pass/fail.

## Reference pointers

- **Plan:** `projects/community-platform/v0.1.1-plan.md` at SHA `2201dd9` (5858 lines)
- **Spec §11:** `projects/community-platform/spec.md` lines 457-1071 at SHA `740be8e`
- **Brainstorm handoff (chat 7):** `docs/specs/2026-05-03-community-platform-v02-invitation-handoff.md`
- **Plan-writing handoff (chat 8):** `docs/specs/2026-05-03-community-platform-v0-1-1-plan-writing-handoff.md`
- **Protocol:** `projects/community-platform/HANDOFF_PROTOCOL.md`
- **Production:** https://warsaw-ai-community-platform.vercel.app
- **Defects playbook:** `docs/playbooks/recurring-plan-defects.md` — code-level patterns to avoid
- **Vercel project Root Directory:** `projects/community-platform` — preserved (do not change)

## Hard prerequisites

- Plan readable on `phase-10-followups` ✓ (SHA `2201dd9`)
- v0.1.0 production live ✓
- Spec §11 hardening fixes applied ✓ (SHA `740be8e`)
- `INVITE_SECRET` provisioning is in §11.7 — Task 11.3.6 schedules it. **NOT blocking start of Phase 11.1.** Anton provisions before Task 11.3.6 (or as part of it).

## Phase ordering

```
Phase 11.1 (TDD lib bottom-up)        ──> 16 tasks, ends with closeout commit
                  │
                  ▼
Phase 11.2 (surfaces + actions)       ──> 12 tasks, ends with E2E_MODE smoke
                  │
                  ▼
Phase 11.3 (E2E + release)            ──> 9 tasks, ends with prod smoke
                                            (Mark backfill PR is separate)
```

Phases are STRICTLY SEQUENTIAL (cross-phase parallelism is unsafe — surfaces import lib symbols defined in 11.1; release ops require 11.2 surfaces live).

**Within a phase, tasks are mostly sequential too** because each task's commit is a unit of progress; reordering breaks the TDD-discipline narrative. Two exceptions in Phase 11.1:
- 11.1.11 (verify isAdmin reuse) is verification-only; can run anytime once `lib/content-snapshot.ts` is unchanged.
- 11.1.15 (seed `community/members/invitations.md`) can run anywhere in 11.1; the orchestrator (11.1.13) only needs the file at runtime via Octokit, not at build.

## Token discipline (project memory `feedback_token_discipline`)

- Don't dispatch subagents for trivial verification (e.g., the H-grep gate at 11.3.4 is a single command — run it inline).
- Lean phase closeouts: typecheck + coverage report + grep + (optional) self-review. The full security-reviewer dispatch is ONE task in Phase 11.3, not per-phase.
- Batch reviewer fixes per phase: ONE `fix(community-platform): batched reviewer fixes — Phase 11.<N>` commit.

---

## Paste-ready prompt for chat 9

```
Warsaw AI Community Platform v0.1.1 — Chat 9: invitation feature implementation

Read in order (~530 lines):
1. projects/community-platform/STATE.md
2. projects/community-platform/CONSTRAINTS.md
3. projects/community-platform/GOTCHAS.md
4. projects/community-platform/HANDOFF_PROTOCOL.md  ← apply hardening checklist (§1) to all output; verify common assumptions (§2)
5. projects/community-platform/v0.1.1-plan.md (5858 lines — read Phase 11.1 first; lazy-load 11.2/11.3 at phase boundaries)
6. memory: project_community_platform_invitation_feature.md

This chat owns: invoke superpowers:subagent-driven-development;
implement Phase 11.1 → 11.2 → 11.3 strictly in order. Each task is
ONE subagent + two-stage review. TDD per task: red → green → commit
→ push. Hardening grep gate at Task 11.3.4 is non-negotiable.

Done means:
- 37 tasks committed + pushed
- v0.1.1 release PR merged to main
- tag community-platform-v0.1.1 pushed
- production smoke (ALREADY-MEMBER path) passes
- STATE.md: phase → "v0.1.1 shipped"
- memory updated; chat-10 brief drafted only if v0.2 prep emerges

Hardening discipline (per HANDOFF_PROTOCOL §1): every commit message,
test, and implementation passes the 4-category check (codebase
verification, security, internal consistency, ambiguity) BEFORE
publishing. Catches fixed inline.

Anti-patterns (per HANDOFF_PROTOCOL §7 + this chat):
- Don't skip the failing-test step (TDD discipline)
- Don't extend v0.1's plan.md (use v0.1.1-plan.md only)
- Don't push the tag without Anton's confirmation
- Don't run security-reviewer until Task 11.3.5
- Don't skip Task 11.3.4 grep gate
```

---

*Drafted 2026-05-03 by chat 8 (plan-writing session) immediately after `v0.1.1-plan.md` commit at SHA `2201dd9`. References HANDOFF_PROTOCOL.md as the operating discipline; defines chat-specific scope, anti-patterns, and verification queries.*
