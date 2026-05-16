# Chat-12 handoff: v0.2.0 plan-writing

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) — operating discipline. Read once at session start.

**Status:** v0.2 brainstorm COMPLETE (chat 11). Spec §12 committed at SHA `70d98b4` on branch `chore/community-platform-v0-2-brainstorm`; Draft PR #11 open at https://github.com/anton1rsod/warsaw-ai-community/pull/11. This chat takes spec §12 → implementation plan via `superpowers:writing-plans`. Per HANDOFF_PROTOCOL §8 sub-skill sequence, chat-12 is step 2 of 4 (brainstorm → plan → implement → review).

---

## Setup

Fresh chat. Branch off either:
- `main` after PR #11 merges (preferred — cleaner base), OR
- `chore/community-platform-v0-2-brainstorm` if §12 not yet merged (allows the plan to land alongside the spec)

Invoke **`superpowers:writing-plans`** at the very start.

## Read in order (~640 lines total)

1. `projects/community-platform/STATE.md` — `phase: "v0.2 brainstorm"`; v0_2_spec_sha; pending follow-ups.
2. `projects/community-platform/CONSTRAINTS.md` — locked rules. Specifically lines 17-30 (stack, process, coverage) still apply unchanged.
3. `projects/community-platform/GOTCHAS.md` — ops patterns. Reference by row number from per-phase brief when relevant.
4. `projects/community-platform/HANDOFF_PROTOCOL.md` — operating discipline.
5. **`projects/community-platform/spec.md` §12** (lines 1075-1561, ~486 lines) — THE source for this plan. Read all of it.
6. `projects/community-platform/v0.1.1-plan.md` SAMPLED — read §A (overview) + ONE phase (e.g., Phase 11.1) to calibrate plan depth + task atomicity. NOT in full (5858 lines).

DO NOT pre-read: `plan.md` (v0.1, 7700+ lines), `CHANGELOG.md`. All historical.

## Verify-before-claiming queries (run early)

```bash
# Confirm spec §12 is committed + complete
git log --oneline projects/community-platform/spec.md | head -3
grep -n "^### 12\.\|^#### 12\." projects/community-platform/spec.md | wc -l   # Expected: ≥20

# Confirm 16 hardenings present in §12
grep -oE "\*\*H[12][0-9]\*\*" projects/community-platform/spec.md | sort -u | wc -l   # Expected: 16

# Confirm referenced files still exist
for p in lib/slug.ts lib/content-snapshot.ts lib/contributions.ts lib/markdown.ts \
         lib/github-app.ts lib/env.ts lib/rbac.ts \
         app/members/[slug]/page.tsx app/projects/[slug]/page.tsx \
         app/components/SafeHtml.tsx app/components/ContributionCard.tsx \
         app/actions/consent.ts; do
  test -f "projects/community-platform/$p" && echo "OK $p" || echo "MISS $p"
done

# Confirm E2E path is e2e/ (NOT tests/e2e/)
ls projects/community-platform/e2e/*.spec.ts | head -3
```

## This chat owns

`projects/community-platform/v0.2.0-plan.md` — implementation plan for §12. Likely shape:

- **Phase 1 — lib primitives:** `lib/profile-editor.ts` (schema + helpers), `lib/contributions.ts` extension (per-project), `lib/env.ts` extension (`GBRAIN_BASE_URL`). 100% strict-list coverage on new exports.
- **Phase 2 — server surfaces:** `app/me/edit/page.tsx`, `app/actions/save-profile.ts`, `app/api/me/export/route.ts` verify-only, `app/members/[slug]/page.tsx` edit-link integration. Includes `security-reviewer` dispatch for `save-profile.ts` per CONSTRAINTS line 42.
- **Phase 3 — client + projects + GBrain:** `app/components/ProfileEditor.tsx`, `app/components/TopContributors.tsx`, `app/components/AskGBrainButton.tsx`, `app/projects/[slug]/page.tsx` extensions, `scripts/build-contributions.ts` extension.
- **Phase 4 (optional, if needed):** E2E + perf + release prep. May fold into Phase 3 if tight.

Plan-writing decides actual phase split based on dep order + task atomicity. Each task = one file or tightly coupled trio (subagent-driven dev needs atomic units).

**Hardening test mapping (load-bearing):** every H14–H29 maps to exactly one `describe("H<n>: <invariant>", …)` block in exactly one named test file. Plan locks (test file × describe block × invariant prose) per hardening. DoD grep (§12.6) returns 16 unique IDs.

**Re-split decision (§12 standing authority):** if estimated task count > 50 OR estimated wall-time > 2 weeks, exercise the §12 re-split. Default split: v0.2.0 = editor only (B + H14-H24, H29); v0.2.1 = A + GBrain link (H25-H28).

## Open spec questions plan-writing locks

Spec §12 deliberately defers three locks to plan-writing — exercise them with rationale:

1. **Preview tab implementation** (§12.3.3): client-side rehype pipeline (no roundtrip; fatter client bundle) vs `/api/preview-markdown` route (server-side; thin client; auth-required). Both MUST go through `lib/markdown.ts` audit boundary either way.
2. **`_projectContributions` JSON shape** (§12.4.1): nested under `_`-prefixed key in `lib/__generated__/contributions.json` vs sibling file `project-contributions.json`. Trade-off: single file = single JSON.parse + single revalidate; sibling = cleaner type boundaries.
3. **Frontmatter parsing helper** (§12.3.4 step 5): reuse existing `lib/content-snapshot.ts` helper / extend `lib/markdown.ts` / new `lib/profile-editor.ts:parseFrontmatter`. Constraint: must be safe-YAML (no executable tags) — verify the v0.1 chain.

## Done means

- **`v0.2.0-plan.md` committed** to a feature branch (e.g., `chore/community-platform-v0-2-plan`).
- **PR opened** Draft is fine; plan output is reviewable before implementation.
- **STATE.md updated** — `phase: "v0.2 plan-writing"` (or "v0.2.0 plan-ready").
- **Project memory entry updated** — `project_community_platform_v0_2_brainstorm.md` extended with plan timeline row.
- **Chat-13 implementation handoff drafted** at `docs/specs/<date>-community-platform-v0-2-implementation-handoff.md` following HANDOFF_PROTOCOL §3 template.

## Anti-patterns (chat-specific)

- **Don't write code.** Plan = task list, not implementation.
- **Don't write the plan before verifying spec §12 is committed + valid.** Run §verify queries first.
- **Don't re-litigate Q1-Q5 / D1-D9 / H14-H29.** All locked in §12.
- **Don't merge v0.1.x cleanup into v0.2 plan.** Persona slug fixes, Mark backfill, etc. are separate.
- **Don't decide the three open questions without rationale.** §12 left them on purpose; plan-writing locks them with reasoning.
- **Don't pre-read `v0.1.1-plan.md` in full** (5858 lines). Sample for pattern; reference by section.

## Token discipline (project memory `feedback_token_discipline`)

- Plan-writing chat is single-purpose; no subagent dispatch.
- v0.1.1's plan was 5858 lines / 37 tasks. v0.2's plan will likely be similar or slightly smaller given §12 is ~80% of §11's size.
- Inline self-review per HANDOFF_PROTOCOL §1 — fix references inline, don't surface in a separate message.

## Reference pointers

- **Spec:** `projects/community-platform/spec.md` §12 (lines 1075-1561, SHA `70d98b4`)
- **Brainstorm PR:** https://github.com/anton1rsod/warsaw-ai-community/pull/11
- **v0.1.1-plan model:** `projects/community-platform/v0.1.1-plan.md` (5858 lines, 37 tasks, 191 checkboxes; mapped H1-H13 to specific test files via `describe("H<n>:")` prefix)
- **Defects playbook:** `docs/playbooks/recurring-plan-defects.md`
- **Vercel project:** `prj_UT1RQ1Bn9XuMV7UnwWSFS0THiLHS` in team `team_iEUo3hzS0aASHR0TEAB70Z8W`, Root Directory `projects/community-platform`

---

## Paste-ready prompt for chat 12

```
Warsaw AI Community Platform — Chat 12: v0.2.0 plan-writing

Chat-11 brainstorm complete. Spec §12 at projects/community-platform/spec.md
lines 1075-1561 (SHA 70d98b4); Draft PR #11 open.

Working dir: ~/Projects/Warsaw\ AI\ Comunity/projects/community-platform/
(auto-loads root CLAUDE.md + this dir's CLAUDE.md — follow its Read order.)

Invoke `superpowers:writing-plans` at the very start (HANDOFF_PROTOCOL §8 step 2).

Full handoff doc: docs/specs/2026-05-16-community-platform-v0-2-plan-writing-handoff.md
Read its "This chat owns", "Done means", "Anti-patterns", and "Open spec
questions" sections (the project CLAUDE.md already encodes the canonical
read order — skip duplicate "Read in order" lists in handoffs).

This chat owns: projects/community-platform/v0.2.0-plan.md, likely
3-4 phases covering ~25 files + 16 hardenings (H14-H29). Task
atomicity is load-bearing for subagent-driven implementation in chat 13+.

§12 deliberately left three open questions for plan-writing to lock
with rationale:
- Preview tab impl (client rehype vs /api/preview-markdown)
- _projectContributions JSON shape (nested vs sibling file)
- Frontmatter parsing helper placement

§12 also grants you standing authority to re-split into v0.2.0 + v0.2.1
if implementation estimate exceeds 50 tasks or 2 weeks. Default split:
v0.2.0 = editor (B); v0.2.1 = A + GBrain link.

Anti-patterns:
- Don't write code (chat 13+ owns).
- Don't re-litigate Q1-Q5 / D1-D9 / H14-H29.
- Don't decide the three open questions without rationale.
- Don't pre-read v0.1.1-plan.md in full (5858 lines).

Token discipline: single-purpose plan chat; no subagents. Plan likely
3000-5000 lines (v0.1.1's was 5858 for 37 tasks).
```

---

*Drafted 2026-05-16 in chat-11 at v0.2 brainstorm closeout. Spec §12 SHA `70d98b4` (PR #11). References HANDOFF_PROTOCOL §8 sub-skill sequence; chat-12 is the v0.2 plan-writing step (brainstorm → plan → implement → review).*
