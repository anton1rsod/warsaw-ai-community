# Chat-13 handoff: v0.2.0 implementation

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) — operating discipline. Read once at session start.

**Status:** v0.2.0 plan COMPLETE (chat 12). Plan committed at SHA `8bab9eb` on branch `chore/community-platform-v0-2-plan`; Draft PR #12 open at https://github.com/anton1rsod/warsaw-ai-community/pull/12. Per HANDOFF_PROTOCOL §8 sub-skill sequence, chat-13 is step 3 of 4 (brainstorm → plan → **implement** → review).

---

## Setup

Fresh chat. Branch off either:
- `main` after PR #12 merges (preferred — cleaner base), OR
- `chore/community-platform-v0-2-plan` if plan not yet merged (allows implementation commits on top of the plan)

Invoke **`superpowers:subagent-driven-development`** at the very start (RECOMMENDED) OR `superpowers:executing-plans` (alternative inline mode).

## Read in order (~700 lines total)

1. `projects/community-platform/STATE.md` — `phase: "v0.2 plan-writing"`; `v0_2_spec_sha: 95197dc`; `v0_2_plan_sha: pending` (populated on PR #12 merge).
2. `projects/community-platform/CONSTRAINTS.md` — locked rules; specifically lines 25-30 (TDD, surgical edits, coverage gates).
3. `projects/community-platform/GOTCHAS.md` — ops patterns; reference by row number when relevant (esp. row 8 for the `vercel env add preview "" --no-sensitive` quirk if setting `GBRAIN_BASE_URL`).
4. `projects/community-platform/HANDOFF_PROTOCOL.md` — operating discipline.
5. **`projects/community-platform/v0.2.0-plan.md`** (3156 lines, 22 tasks across 4 phases) — THE source for implementation. Read by task as you go; don't pre-read all 3156 lines.
6. **`projects/community-platform/spec.md` §12** (lines 1075-1569) — referenced from plan for rationale; read sections specifically cited by the task you're working on.

DO NOT pre-read: `plan.md` (v0.1, 7700+ lines), `v0.1.1-plan.md` (5858 lines), `CHANGELOG.md`. Reference any of them only if a specific task points there.

## Verify-before-claiming queries (run early)

```bash
# Confirm v0.2.0-plan.md is committed and complete
git log --oneline projects/community-platform/v0.2.0-plan.md | head -3
grep -c "^### Task " projects/community-platform/v0.2.0-plan.md   # Expected: 22

# Confirm spec §12 still on main (locked)
grep -n "^## 12\." projects/community-platform/spec.md | head -3

# Confirm existing files referenced by the plan still exist
for p in lib/slug.ts lib/content-snapshot.ts lib/contributions.ts \
         lib/markdown.ts lib/github-app.ts lib/env.ts lib/rbac.ts \
         scripts/build-contributions.ts \
         app/members/\[slug\]/page.tsx app/projects/\[slug\]/page.tsx \
         app/components/SafeHtml.tsx app/components/ContributionCard.tsx \
         app/actions/consent.ts app/actions/redeem-invitation.ts \
         app/api/me/delete/route.ts app/api/me/export/route.ts \
         e2e/invitation.spec.ts e2e/gdpr.spec.ts; do
  test -f "projects/community-platform/$p" && echo "OK $p" || echo "MISS $p"
done

# Confirm Next.js + Auth.js versions match spec assumptions
grep -E '"next":|"next-auth":|"react":|"gray-matter":' projects/community-platform/package.json
# Expected: next 16.2.4, next-auth 5.0.0-beta.31, react 19.2.0, gray-matter ^4.0.3
```

## This chat owns

Execution of the 22 tasks in `v0.2.0-plan.md` per the recommended order documented in the plan's self-review section:

**1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 2.1 → 2.3 → 3.1 → 2.2 → 2.4 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 → 3.7 → 2.5 → 2.6 → 4.1 → 4.2 → 4.3 → 4.4**

Each task is TDD-shaped (Red → Green → Refactor → Commit per CONSTRAINTS line 26) with exact file paths + complete code in every step.

### Execution mode (per `superpowers:subagent-driven-development`)

For each task:

1. Read the task block from `v0.2.0-plan.md`.
2. Dispatch a fresh subagent (model: `sonnet` per global CLAUDE.md routing) with the task block as the brief.
3. Subagent executes Steps 1-N TDD-style within an isolated worktree OR shared workspace (project precedent: shared workspace, sequential commits — verify with subagent-driven-development skill's worktree heuristics).
4. Review the diff before next task; fix any test gaps or stylistic deviations inline.
5. Move to next task.

### Reviewer agent dispatch (Task 2.6 + 4.2)

- **Task 2.6 — `security-reviewer`** at end of Phase 2 (after Task 2.4 + 2.5 close). Scope: `app/actions/save-profile.ts`, `lib/profile-editor.ts`, `app/api/preview-markdown/route.ts`. Apply CRITICAL/HIGH findings inline.
- **Task 4.2 — `typescript-reviewer` + `code-reviewer`** at the end of Phase 4. If monthly Claude cap is reached (per `project_community_platform`'s Phase 6 pattern), fall back to CONSTRAINTS self-review checklist (lines 50-59).

## Done means

- All 22 tasks executed; coverage gates met; hardening grep returns 16 unique IDs (H14-H29).
- E2E green with `--retries=2`.
- PR opened, CI green, merged to `main`, tag `community-platform-v0.2.0` pushed.
- Production smoke per §12.9.2 / Task 4.3 step 8 clean.
- `STATE.md` bumped to `phase: "v0.2.0 shipped"` with new `last_verified` row.
- `CHANGELOG.md` entry committed.
- Memory entry: `~/.claude/projects/.../memory/project_community_platform_v0_2_ship.md` with ship timeline, PR #, tag SHA, key learnings.

## Anti-patterns (chat-specific)

- **Don't deviate from the plan without an ADR-able reason.** If a task can't be implemented as written, surface the gap; don't paper over.
- **Don't relitigate Q1-Q5 / D1-D9 / O1-O3 / H14-H29.** All locked in spec §12 + plan.
- **Don't skip reviewer dispatch.** Task 2.6 (`security-reviewer`) is load-bearing per CONSTRAINTS line 42 — the save-profile surface is privileged-write.
- **Don't merge until coverage + grep + E2E gates all pass.** §12.10 / Task 4.1.
- **Don't push secrets** (e.g., GBrain prod URL, even though `GBRAIN_BASE_URL` is non-sensitive — apply the `--no-sensitive` flag explicitly to keep the value extractable for ops debugging per GOTCHAS row 5).

## Open questions to surface (NOT to lock)

If implementation surfaces a task gap or unclear requirement, surface it as a comment on PR #12 OR a new ADR draft. Specifically watch for:

- **`/api/preview-markdown` performance:** auth check + rehype render per preview click. If preview latency is >1s, consider client-side debounce or short cache (~5s) on the response — defer to v0.2.1 ADR if it bites.
- **localStorage draft staleness:** if a user's draft references a since-deleted profile (post-GDPR-delete), the draft restoration could confuse. The plan's H21 + D4 redirect to `/consent` handles the page-level case, but the localStorage entry persists. Plan doesn't explicitly clear drafts on GDPR delete. If observed, add `clearDraft(slug)` to the GDPR delete client handler.
- **Top-N contributors slug↔handle mapping:** Task 3.2 uses handle as the `/members/<slug>` link param. If GitHub handle ≠ roster slug (e.g., `anton1rsod` vs `anton-safronov`), the link 404s. Plan-writing flagged this; executor should add a handle→slug lookup via `findMemberByHandle(handle).slug` either in the component or in `getProjectContributions` data shape.

## Token discipline (project memory `feedback_token_discipline`)

- Subagent dispatch ONE per task (haiku for trivial mechanical tasks; sonnet for non-trivial implementation).
- Don't pre-read all 3156 plan lines into the orchestrator context — read by task.
- Batch reviewer-fix commits per phase (one `fix(community-platform): batched reviewer fixes — Phase N` commit, not one per finding).
- Inline self-review per HANDOFF_PROTOCOL §1.

## Reference pointers

- **Plan:** `projects/community-platform/v0.2.0-plan.md` (3156 lines; SHA `8bab9eb` on branch `chore/community-platform-v0-2-plan`)
- **Spec:** `projects/community-platform/spec.md` §12 (lines 1075-1569, merged at SHA `95197dc` via PR #11)
- **Plan PR:** https://github.com/anton1rsod/warsaw-ai-community/pull/12 (Draft)
- **Brainstorm PR:** https://github.com/anton1rsod/warsaw-ai-community/pull/11 (merged)
- **v0.1.1 plan model:** `projects/community-platform/v0.1.1-plan.md` (5858 lines; reference for subagent-driven execution pattern)
- **Defects playbook:** `docs/playbooks/recurring-plan-defects.md`
- **Vercel project:** `prj_UT1RQ1Bn9XuMV7UnwWSFS0THiLHS` in team `team_iEUo3hzS0aASHR0TEAB70Z8W`, Root Directory `projects/community-platform`

---

## Paste-ready prompt for chat 13

```
Warsaw AI Community Platform — Chat 13: v0.2.0 implementation

Chat-12 plan-writing complete. Plan at projects/community-platform/v0.2.0-plan.md
(3156 lines, 22 tasks, 4 phases; SHA 8bab9eb); Draft PR #12 open.

Working dir: ~/Projects/Warsaw\ AI\ Comunity/projects/community-platform/
(auto-loads root CLAUDE.md + this dir's CLAUDE.md — follow its Read order.)

Invoke `superpowers:subagent-driven-development` at the very start
(HANDOFF_PROTOCOL §8 step 3).

Full handoff doc: docs/specs/2026-05-16-community-platform-v0-2-implementation-handoff.md
Read its "This chat owns", "Execution mode", "Done means", "Anti-patterns",
and "Open questions to surface" sections.

This chat owns: full execution of the 22 tasks per the recommended order
documented in the plan's self-review section. Each task is TDD-shaped.

Task 2.6 (security-reviewer dispatch on save-profile.ts) is load-bearing
per CONSTRAINTS line 42 — don't skip even if previous reviewer runs were
clean for v0.1.1.

DoD gates (verify before merge):
- Hardening grep returns 16 unique IDs (H14-H29 per spec §12.6)
- Coverage 80% overall, 100% on §12.7 strict-list (6 new + 7 extended files)
- E2E green with --retries=2 (6 scenarios per §12.8)
- security-reviewer 0 CRITICAL / 0 HIGH (Task 2.6)
- Ship-day runbook per §12.9.2 / Task 4.3 executed
- Tag community-platform-v0.2.0 pushed
- Production smoke clean

Anti-patterns:
- Don't deviate from plan without ADR-able reason
- Don't relitigate Q1-Q5 / D1-D9 / O1-O3 / H14-H29
- Don't merge until all gates pass

Token discipline: subagent-per-task (haiku for trivial; sonnet for non-trivial);
batch reviewer-fix commits per phase; don't pre-read 3156 plan lines into
the orchestrator context — read by task.
```

---

*Drafted 2026-05-16 in chat-12 at v0.2.0 plan-writing closeout. Plan at SHA `8bab9eb` (PR #12). References HANDOFF_PROTOCOL §8 sub-skill sequence; chat-13 is the v0.2.0 implementation step (brainstorm → plan → implement → review).*
