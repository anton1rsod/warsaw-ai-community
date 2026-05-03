# Community Platform v0.1.1 — Chat 8 (invitation feature plan-writing) handoff

**Status:** spec §11 drafted in chat 7 (2026-05-03), committed at SHA `740be8e` on `phase-10-followups`. Plan-writing next.

**This file's job:** give the next chat (a fresh auto-mode Claude Code session) everything it needs to write the v0.1.1 implementation plan from the spec.

**How to use:** open a fresh Claude Code chat in this repo, paste the fenced block at the bottom.

---

## Why this chat exists

Chat 7 brainstormed the v0.1.1 invitation feature via `superpowers:brainstorming` and produced **spec §11** in `projects/community-platform/spec.md` (lines 457-1071, ~617 lines). All Q1-Q7 decisions, 13 hardenings (H1-H13), file paths (~27 files), data models, threat model, testing strategy, and release notes are locked.

Plan-writing (this chat) converts the spec into an implementable, TDD-structured plan with file paths, test-first task ordering, phase boundaries, and closeout criteria.

## What's LOCKED (do not re-litigate)

- **Spec §0–§10** — existing v0.1 surface (RBAC, storage, four-role access, gamification phasing, OSS-first).
- **Spec §11** (lines 457-1071) — the v0.1.1 invitation feature design. ALL of:
  - Q1-Q7 decisions (scope gating, issuance surface, ledger substrate, form fields, TTL+secret, retroactive coverage, bot-write authorship)
  - 13 hardenings (H1-H13) with `H<n>:` test-prefix convention
  - File paths (~27 files; 6 strict-list additions at 100% coverage)
  - Data model (token payload schema, RedeemFormSchema, ledger format, roster.md migration to 5-col Members table, slug derivation + RESERVED_SLUGS, 4-file commit)
  - Threat model + cookie security properties + response headers + error states
  - Testing strategy (~85 unit + 7 E2E; hardening-to-test mapping; mocking strategy)
  - Release notes (pre-release ops, smoke test, rollback plan, DoD)
- **Final-pass hardening fixes (commit 740be8e):** `session.githubHandle` (NOT `session.user.handle`); Zod chain order on link field; explicit ledger pre-check before commit (step 6); session-presence guard at start of redeem (step 1); explicit `expectedHeadSha` capture (step 5).
- **All artifacts under `projects/community-platform/`** — STATE, CONSTRAINTS, CHANGELOG, GOTCHAS.

## What this chat owns

- Invoke **`superpowers:writing-plans`** skill (per project CLAUDE.md "Brainstorming → spec → writing-plans → TDD" sequence).
- Read `projects/community-platform/spec.md §11` (lines 457-1071) as the canonical input spec.
- Produce a TDD-structured implementation plan covering:
  - **Test-first task ordering** (Red → Green → Refactor per CONSTRAINTS line 26).
  - **Phase boundaries** — likely 1-3 phases for v0.1.1 (smaller scope than v0.1's 10). Suggested decomposition: Phase 11.1 (token crypto + ledger primitives), Phase 11.2 (admin + onboard surfaces + redemption orchestrator), Phase 11.3 (E2E + security review + release ops). Plan-writing decides final shape.
  - **File-by-file implementation order** with explicit dependencies (`lib/invitations.ts` before pages; `commitMultipleFiles` before redemption orchestrator; etc.).
  - **Closeout criteria per phase** — coverage gates verified, hardening tests present, E2E green at appropriate phases.
  - **The 13 hardening tests (H1-H13)** mapped to specific test files per spec §11.6 hardening coverage map.
  - **Pre-release ops sequencing** — `INVITE_SECRET` provisioning, branch protection, 2FA confirmation (per spec §11.7) — when each happens relative to PR-merge.
- **Decide WHERE to put the plan:** extend `projects/community-platform/plan.md` (e.g., new "Phase 11" section) OR sibling `v0.1.1-plan.md` OR `execution-plan.md §10`-style amendment block. Plan-writing's discretion based on what fits best with v0.1's existing structure.

## Done means

- Implementation plan committed.
- `STATE.md` updated: `phase: "v0.1.1 plan written; implementation next"`.
- Memory entry `project_community_platform_invitation_feature.md` updated: status → "plan written, implementation next" + link to plan section.
- A draft `chat-N+2-brief.md` (or equivalent) for the implementation chat that follows this one.

## Reference pointers

- **Spec:** `projects/community-platform/spec.md` §11 (lines 457-1071) at SHA `740be8e`
- **Brainstorm handoff (chat 7 input):** `docs/specs/2026-05-03-community-platform-v02-invitation-handoff.md`
- **v0.1 plan reference:** `projects/community-platform/plan.md` (existing 7700+ line structure)
- **v0.1 execution amendments:** `projects/community-platform/execution-plan.md` §9
- **v0.1.1 release scope memory:** `project_community_platform_invitation_feature.md` (this feature's status across chats)
- **Production:** https://warsaw-ai-community-platform.vercel.app
- **Recurring code-level plan defects:** `docs/playbooks/recurring-plan-defects.md`
- **Operational gotchas:** `projects/community-platform/GOTCHAS.md`

## Hard prerequisites

- **spec §11 must be readable.** It's at SHA `740be8e` on `phase-10-followups`. If PR #2 has merged to main, branch off main; otherwise branch off `origin/phase-10-followups`.
- **v0.1.0 production live** (already true since 2026-05-03).
- `INVITE_SECRET` provisioning is an ops step BEFORE merging the v0.1.1 PR, NOT before plan-writing. Plan-writing schedules it in the release-phase tasks.

---

## Paste-ready prompt for chat 8

```
Warsaw AI Community Platform v0.1.1 — Chat 8: invitation feature plan-writing

================================================================
Setup
================================================================

Branch: if PR #2 has merged to main, branch off `origin/main`; otherwise
branch off `origin/phase-10-followups` (where spec §11 was committed at
SHA 740be8e on 2026-05-03).

================================================================
Read in order (each ~50-200 lines; total ~700 lines)
================================================================

1. projects/community-platform/STATE.md
   — current state (v0.1.0 shipped; v0.1.1 spec drafted, plan-writing
     next). Read first.

2. projects/community-platform/CONSTRAINTS.md
   — locked rules. TDD discipline (line 26), surgical edits (line 27),
     coverage gates (line 28), reviewer-fix batching (line 31).

3. projects/community-platform/GOTCHAS.md
   — operational patterns from prior chats. Reference by number where
     relevant.

4. projects/community-platform/spec.md §11
   — THE input. Lines 457-1071, ~617 lines. All Q1-Q7 decisions,
     13 hardenings, file paths, data model, threat model, testing
     strategy, release notes locked.

5. memory: project_community_platform_invitation_feature.md
   — feature status across chats.

DO NOT pre-read CHANGELOG.md or v0.1's plan.md in full. Read v0.1
plan.md only on-demand if a structural question arises (e.g., "how
does v0.1 organize phase boundaries?").

================================================================
This chat owns
================================================================

Write the v0.1.1 implementation plan via the
`superpowers:writing-plans` skill. Spec §11 is the input; produce
a TDD-structured, phase-boundaried plan that an implementation chat
can execute task-by-task.

Suggested decomposition (plan-writing decides final shape):
- Phase 11.1: lib primitives — token crypto, ledger parser/serializer,
  RedeemFormSchema, yamlString helper, generateConsentMarkdown
  extraction, commitMultipleFiles helper, lib/rbac.ts isAdmin extension.
  Heavy unit-test phase; lib/invitations.ts joins strict-list at 100%.
- Phase 11.2: surfaces + orchestrator — /admin/invite page + components,
  /onboard page + redirect-to-clean-URL handoff + components, error
  page, both server actions, redemption orchestrator integration,
  proxy.ts changes (PUBLIC_PATHS + response headers), roster.md +
  fixtures schema migration.
- Phase 11.3: E2E + closeout — Playwright scenarios (7 required per
  spec §11.6), security-reviewer agent dispatch on lib/invitations.ts,
  pre-release ops checklist, release PR.

Output: implementation plan committed; STATE.md updated; memory
updated; chat-9 brief drafted.

================================================================
Hard prerequisites
================================================================

- spec §11 readable on the working branch ✓
- v0.1.0 production live ✓
- INVITE_SECRET provisioning is in §11.7 release-ops; plan schedules
  it. Anton has NOT yet provisioned it; that's a release-day action.

================================================================
Done means
================================================================

- Implementation plan committed.
- STATE.md: phase: "v0.1.1 plan written; implementation next".
- Memory: status → "plan written, implementation next" + plan link.
- chat-9-brief.md (or equivalent) drafted for the implementation chat.

================================================================
Adaptation: if next chat is something else
================================================================

If the next chat is a one-off cleanup (e.g., Mark Spasonov backfill
PR, CI workflow merge): skip the plan-writing framing; use a tight
task-list prompt referencing STATE+CONSTRAINTS+GOTCHAS only.

If the next chat is gbrain or a new sub-project: mirror this template
pointing at that sub-project's artifacts.
```

---

*Drafted 2026-05-03 by the chat-7 brainstorming session, immediately after spec §11 commit + final hardening pass (SHA 740be8e). Updates: append below if chat 8 changes its scope.*
