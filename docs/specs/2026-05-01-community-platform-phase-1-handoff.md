# Community Platform — Chat 2 (Phase 1: Auth + RBAC) handoff

**Purpose:** copy-paste this into a fresh Claude Code chat to execute Phase 1 (Auth + RBAC) of the community-platform v0.1 implementation.

**This chat does:** Phase 1 implementation — 13 tasks (1.1–1.13). Roster snapshot reader, governance reader, RBAC helpers, GitHub OAuth wiring, NextAuth v5 config, login/no-access pages, build-time content snapshot, auth middleware, /home shell page, E2E for the auth flow, and Phase 1 closeout.

**This chat does NOT:** revisit Phase 0 decisions, expand Lite slice scope, or start Phase 2.

---

## Copy-paste prompt (lines 14 onward, between the fences)

```
Community Platform v0.1 — Chat 2: Phase 1 (Auth + RBAC)

================================================================
State coming in
================================================================

Last green commit: a6c2ad0 (chore(community-platform): close Phase 0)
Branch: warsaw-org-and-stack-guide
Phase 0 complete — Bootstrap shipped, including:
- Next.js 16.2.4 + React 19.2.0 (NB: plan pinned 15.0.4; Vercel
  rejected at 15.0.4 due to CVE-2025-66478, bump landed at 528f24c)
- Vercel preview is Ready at:
  https://warsaw-ai-community-platform-anton-9351-anton-9351s-projects.vercel.app
  (alias) — gated by Vercel Deployment Protection on top of our
  upcoming roster gate
- 13 env vars set on production + on preview (preview-scoped to
  branch warsaw-org-and-stack-guide). GitHub OAuth + GitHub App
  values are placeholders; replaced in Tasks 1.4 + 4.1.
- Coverage gates active in vitest.config.ts: 80% lines/branches/
  functions/statements. Currently 100% on lib/env.ts +
  lib/classification.ts.
- Pre-launch state: founder is the only roster member with a real
  github_handle (@anton1rsod). Other 18 are *(TBD)*. Phase 1's
  Task 1.1 must skip those rows (per Plan amendment §9.1).

================================================================
This chat owns: Phase 1 — Auth + RBAC (13 tasks, ~1.5 days)
================================================================

Read in order:

1. projects/community-platform/HANDOFF.md
   — cold-pickup reference. Read once. §4 (architectural choices)
     and §7 (caveats) are the parts you'll re-reference.

2. projects/community-platform/execution-plan.md
   — dispatch playbook. Pay attention to:
     * §3 row for Phase 1 (default agent = tdd-guide; pages
       1.7/1.8/1.11 use general-purpose; 1.13 is doc-only)
     * §5 row for Task 1.4 (HUMAN BLOCKER — Anton creates
       GitHub OAuth App)
     * §6.1 risk register — NextAuth v5 + middleware silent
       misroute risk. E2E covers all four paths (non-roster,
       roster first-time, roster returning, admin) BEFORE
       Phase 1 closes.
     * §9 plan amendments — apply §9.1, §9.5, §9.6 in this
       chat.

3. projects/community-platform/plan.md, Phase 1 section only
   (around line 1163–2399). Skim Phase 0 if you need to verify
   what Phase 0 left in place; do not re-execute it.

4. projects/community-platform/CHANGELOG.md
   — current state. Phase 0 closeout entry shows what shipped.
     The Pending list shows what's still to do, including the
     two new amendments (§9.5 next 16.2.4, §9.6 preview branch
     scoping).

================================================================
Constraints (carry from session 0)
================================================================

- Stay within Lite slice (spec §3 non-goals). No profile editor,
  no kudos/badges/streaks, no admin/CM-distinct UI capabilities.
- 100% git in v0.1 — no DB. JWT sessions only.
- All HTML rendering via lib/markdown.ts + SafeHtml (Phase 2
  ships these — Phase 1 does NOT render any markdown).
- pnpm only.
- TDD discipline: red → green → refactor → commit. 100% coverage
  on auth middleware (lib/auth.ts), RBAC guards (lib/rbac.ts),
  classification helpers, and the snapshot script.
- Surgical edits.
- No "Warsaw" hardcoding (use COMMUNITY_NAME / COMMUNITY_SLUG).
- **Never echo or store secrets in chat.** OAuth Client ID is
  shareable; OAuth Client Secret is not. When Anton pastes the
  secret in step 1.4, do NOT repeat it back, log it, or commit
  it. Reference by env-var name only.

================================================================
Plan amendments to apply during this chat
================================================================

§9.1 (Task 1.1 parser fix) — community/members/roster.md is
5-column (Name | GitHub | Role | Telegram | Focus), NOT 4-column
as the plan's fixture suggests. Parser must:
- Read the table header row first; identify GitHub column by
  case-insensitive name match (/^github$/i).
- Skip rows whose Name cell is *(TBD)* (with literal asterisks +
  parentheses) or whose GitHub cell is empty.
- Add a unit test: tests/unit/roster.test.ts should include a
  fixture with a *(TBD)* row and assert it's excluded.

§9.5 (NextAuth v5 beta + Next 16 compatibility) — plan pinned
next-auth 5.0.0-beta.25 (released for Next 15 era). Verify the
latest 5.0.0-beta.X has been tested against Next 16 BEFORE Task
1.5; check authjs.dev release notes or the Auth.js GitHub repo.
If a newer beta is required for Next 16, bump in Task 1.5 (this
counts as an in-execution amendment, not a plan rewrite — record
in CHANGELOG).

§9.6 (preview env scope) — preview env vars currently scoped
only to branch warsaw-org-and-stack-guide. If Phase 1 needs to
deploy preview from any other branch (e.g., a temporary fork),
add env vars for that branch via:
  pnpm dlx vercel env add NAME preview <branch> --value VAL --yes
The Vercel Claude Code plugin intercepts the "all preview
branches" path with a git_branch_required action. Workarounds:
- pass the branch explicitly (working today)
- or use the Vercel dashboard
- or set production-only and accept that previews don't get the
  var (won't work for Phase 1)

================================================================
First moves
================================================================

1. Acknowledge state (one paragraph each, under 250 words total):
   - Phase 0 deliverables in place (link to commits).
   - The two amendments that landed in Phase 0 (next 16, preview
     branch scope).
   - The 13 Phase 1 tasks, broken into roughly four chunks
     (snapshot readers + RBAC, OAuth wiring, login pages,
     middleware + E2E).
   - The one human blocker (Task 1.4).

2. Confirm we're starting from a green Phase 0 closeout:
   cd "/Users/antonsafronov/Projects/Warsaw AI Comunity/projects/community-platform"
   pnpm install --frozen-lockfile
   pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm e2e
   If anything is red, stop and triage before any new code.

3. Walk Tasks 1.1 → 1.13 in order, dispatching one subagent per
   task. Default agent: tdd-guide. Exceptions per execution-plan
   §3.2: 1.7 + 1.8 + 1.11 → general-purpose (page implementations,
   not TDD-shaped); 1.13 doc-only.

4. After Task 1.4 (Anton creates the GitHub OAuth App), Anton
   pastes the new Client ID + Secret directly into Vercel via
   `pnpm dlx vercel env add GITHUB_OAUTH_CLIENT_ID` and
   `vercel env add GITHUB_OAUTH_CLIENT_SECRET --force` (force
   overwrites the placeholder values from Phase 0). Do NOT echo
   the secret back. After the env update, redeploy preview to
   pick up the new values:
   pnpm dlx vercel deploy

5. Phase 1 closeout: pnpm lint && pnpm typecheck &&
   pnpm test:coverage && pnpm build && pnpm e2e.
   - 100% coverage required on lib/auth.ts (middleware path),
     lib/rbac.ts, lib/roster.ts, lib/governance.ts (per spec §8).
   - All four E2E paths green (non-roster, roster first-time,
     roster returning, admin).

6. Update CHANGELOG with Phase 1 complete entry + last-green-SHA.

7. Write Chat 3 handoff at:
   docs/specs/2026-MM-DD-community-platform-phase-2-3-handoff.md
   (Phases 2 + 3 — Read surface — are bundled per execution-plan
   §10.2). Use this file as the template.

================================================================
Auto-execution policy
================================================================

Auto. Ask before any architectural decision (e.g., picking a
NextAuth v5 beta version not pinned in the plan). Auto-execute
mechanical tasks. If a subagent reports something unexpected,
report it to Anton and propose a path before proceeding.

================================================================
Done means
================================================================

- All 13 Phase 1 tasks committed.
- Phase 1 closeout green (lint + typecheck + test:coverage +
  build + e2e).
- 100% coverage on the named modules.
- CHANGELOG Phase 1 entry committed.
- Chat 3 handoff written and committed.
- Vercel preview redeployed with real GitHub OAuth values.
- Roster member can log in via Vercel preview URL and reach
  /home (or, if not yet consented, /consent — but consent ships
  in Phase 6, so just /no-access for any roster member without
  a github_handle yet, which is everyone except @anton1rsod).
```

---

## Why this prompt is shaped the way it is

- **Same four-files read order** as the previous handoffs (HANDOFF, execution-plan, plan-this-phase-only, CHANGELOG). Plan-this-phase-only — not the whole 7,713-line plan — keeps the chat's plan-content read at ~10–20K tokens instead of ~80K.
- **Plan amendments listed upfront** — three to apply, with the source-of-truth pointer to execution-plan.md §9. Carrying these forward via the handoff prompt is what keeps amendments from getting lost between chats.
- **Human blocker is named explicitly** — Task 1.4 needs Anton at the keyboard. The handoff explains exactly what's expected (Client ID + Secret, env update, redeploy).
- **Secret-handling rule restated** — even though it's in HANDOFF.md, repeating in the per-chat prompt makes it impossible to miss. Anton's "feedback_secret_handling" memory rule is the policy here.
- **Closeout deliverables enumerated** — including the next handoff write. Each chat ends by writing its successor's prompt; that's the pattern that makes the 7-chat split viable.

## Tip for Anton

Open the next chat in `auto` mode. The prompt is ~150 lines; copy-paste from the fenced block. After the chat acknowledges state, expect dispatches to start landing within 1–2 minutes.

Tasks 1.1, 1.2, 1.3 are TDD-tight (parsers + RBAC) — fast turnaround, ~10–15 min each via subagent. Task 1.5 (NextAuth config) is the longest single task in Phase 1 and the one most likely to surface a NextAuth v5 + Next 16 quirk. Pause for triage if it does. Tasks 1.6–1.11 should each take ~5–10 min once 1.5 is settled.
