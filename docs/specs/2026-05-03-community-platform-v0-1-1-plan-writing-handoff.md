# Chat 8 handoff: v0.1.1 invitation feature plan-writing

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) — operating discipline (hardening checklist, output conventions, anti-patterns). Read once at session start.

**Status:** spec §11 drafted in chat 7 (2026-05-03), committed at SHA `740be8e` on `phase-10-followups`. Plan-writing next.

---

## Setup

Branch off `origin/phase-10-followups` (where spec §11 lives). If PR #2 has merged to main by the time you start, branch off `origin/main` instead.

## Read in order (~530 lines total — per protocol §5)

1. `projects/community-platform/STATE.md` — current state (v0.1.1 spec drafted, plan-writing next). Read first.
2. `projects/community-platform/CONSTRAINTS.md` — locked rules. TDD discipline (line 26), surgical edits (line 27), coverage gates (line 28).
3. `projects/community-platform/GOTCHAS.md` — operational patterns, reference by number.
4. `projects/community-platform/HANDOFF_PROTOCOL.md` — hardening checklist (§1), common assumption pitfalls (§2), output conventions (§4).
5. **`projects/community-platform/spec.md` §11** — THE input. Lines 457-1071, ~617 lines. All Q1-Q7 decisions, 13 hardenings, file paths, data model, threat model, testing strategy, release notes locked.
6. Memory: `project_community_platform_invitation_feature.md` — feature status across chats.

DO NOT pre-read full `plan.md`, `CHANGELOG.md`, or `spec.md` §0-§10. Read v0.1 plan.md only on-demand if a structural question arises (e.g., "how does v0.1 organize phase boundaries?" → `head -200 plan.md`).

## Verify-before-claiming queries (chat-specific)

Per protocol §2 + chat scope, run these early:

```bash
# v0.1 plan structure (decide whether to extend or write sibling)
head -200 projects/community-platform/plan.md

# Existing phase brief format
cat projects/community-platform/phase-10-brief.md

# Session shape — spec §11 uses session.githubHandle, verify still current
grep -n "session\." projects/community-platform/lib/auth.ts
```

Plus protocol §2's full pitfall table — apply any that touch this chat's scope.

## This chat owns

- Invoke **`superpowers:writing-plans`** skill (per project CLAUDE.md sub-skill sequence).
- Read `spec.md §11` (lines 457-1071) as canonical input.
- Produce TDD-structured implementation plan covering:
  - Test-first task ordering (Red → Green → Refactor per CONSTRAINTS line 26).
  - Phase boundaries — likely 1-3 phases. Suggested decomposition:
    - **Phase 11.1** — lib primitives (token crypto, ledger parser, RedeemFormSchema, yamlString, generateConsentMarkdown extraction, commitMultipleFiles, isAdmin extension).
    - **Phase 11.2** — surfaces + orchestrator (/admin/invite + /onboard pages + components, both server actions, redemption orchestrator integration, proxy.ts changes, roster.md migration).
    - **Phase 11.3** — E2E + closeout (Playwright scenarios, security-reviewer agent dispatch, pre-release ops, release PR).
  - File-by-file implementation order with explicit dependencies.
  - Closeout criteria per phase.
  - 13 hardening tests (H1-H13) mapped to specific test files per spec §11.6.
  - Pre-release ops sequencing (when each item from §11.7 happens relative to PR-merge).
- Decide WHERE to put the plan: extend `plan.md` (new "Phase 11" section) OR sibling `v0.1.1-plan.md` OR `execution-plan.md §10`-style amendment block. Plan-writing's discretion.

## Done means

- Implementation plan committed.
- `STATE.md` updated: `phase: "v0.1.1 plan written; implementation next"`.
- Memory entry updated: status → "plan written, implementation next" + link to plan section.
- Draft `chat-9` handoff at `docs/specs/<date>-community-platform-v0-1-1-implementation-handoff.md` for the implementation chat.

## Anti-patterns (chat-specific — beyond protocol §7 universals)

- **Don't re-litigate Q1-Q7** — locked in spec §11 preamble.
- **Don't redesign hardening list** — H1-H13 frozen with named test prefixes.
- **Don't change file paths from §11.3** — strict-list additions are committed to.
- **Don't introduce new components/files beyond §11.3** without explicit user approval.
- **Don't skip the sub-skill sequence** — invoke `superpowers:writing-plans`, don't go straight to TDD implementation.

## Reference pointers

- **Spec:** `projects/community-platform/spec.md` §11 (lines 457-1071) at SHA `740be8e`
- **Brainstorm handoff (chat 7 input):** `docs/specs/2026-05-03-community-platform-v02-invitation-handoff.md`
- **Protocol:** `projects/community-platform/HANDOFF_PROTOCOL.md`
- **v0.1 plan reference:** `projects/community-platform/plan.md` (existing 7700+ line structure)
- **v0.1 execution amendments:** `projects/community-platform/execution-plan.md` §9
- **Production:** https://warsaw-ai-community-platform.vercel.app

## Hard prerequisites

- spec §11 readable on the working branch ✓
- v0.1.0 production live ✓
- `INVITE_SECRET` provisioning is in §11.7 release-ops; plan schedules it but Anton hasn't yet provisioned. NOT blocking plan-writing.

---

## Paste-ready prompt for chat 8

```
Warsaw AI Community Platform v0.1.1 — Chat 8: invitation feature plan-writing

Read in order (~530 lines):
1. projects/community-platform/STATE.md
2. projects/community-platform/CONSTRAINTS.md
3. projects/community-platform/GOTCHAS.md
4. projects/community-platform/HANDOFF_PROTOCOL.md  ← apply hardening checklist (§1) to all output; verify common assumptions (§2)
5. projects/community-platform/spec.md §11 (lines 457-1071)
6. memory: project_community_platform_invitation_feature.md

This chat owns: invoke superpowers:writing-plans skill; produce TDD-structured
implementation plan from spec §11 (Q1-Q7 + 13 hardenings + file paths LOCKED).
Suggested phase decomposition: 11.1 lib primitives, 11.2 surfaces + orchestrator,
11.3 E2E + closeout. Plan-writing decides location (extend plan.md vs sibling).

Done means:
- plan committed
- STATE.md: phase → "v0.1.1 plan written; implementation next"
- memory entry updated
- chat-9 implementation handoff drafted

Hardening discipline (per HANDOFF_PROTOCOL §1): every section self-reviewed
across 4 categories (codebase verification, security, internal consistency,
ambiguity) BEFORE presenting. Catches fixed inline; not surfaced as separate
post-publish messages.

Anti-patterns (per HANDOFF_PROTOCOL §7 + this chat):
- Don't re-litigate Q1-Q7 (locked in §11)
- Don't redesign H1-H13
- Don't change file paths from §11.3
- Don't go straight to implementation; writing-plans first
```

---

*Drafted 2026-05-03 by chat 7 (brainstorming session) immediately after spec §11 commit + final hardening pass (SHA 740be8e). Restructured 2026-05-03 evening to reference HANDOFF_PROTOCOL.md (extracted from this doc + general lessons).*
