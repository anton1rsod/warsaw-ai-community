# Community Platform v0.2 — Chat 7 (invitation feature brainstorm) handoff

**Status:** v0.1.0 shipped 2026-05-03. Tag `community-platform-v0.1.0` at SHA `1382fd2`. Production live at https://warsaw-ai-community-platform.vercel.app. v0.1 feature set is LOCKED — this chat brainstorms v0.2 only.

**This file's job:** give the next chat (a fresh auto-mode Claude Code session) everything it needs to start the v0.2 invitation feature brainstorm cleanly, without re-litigating v0.1 decisions or rediscovering ship-day gotchas.

**How to use:** open a fresh Claude Code chat in this repo, paste the fenced block at the bottom of this file, and let the agent take it from there.

---

## Why this chat exists

During v0.1.0 ship-day, **Phase 10 ship gate #2** (manual roster backfill of 18 outstanding members) was reframed: rather than stuffing the v0.1 ship with PRs to backfill each member's `github_handle`, Anton chose to ship with 2 of 19 backfilled (founder + Mark Spasonov) and defer the rest to a future "git-based personal-invitation self-registration" feature.

That deferred feature is what this chat designs.

**Seed concept (rough, pre-brainstorm):**

- Platform issues a one-time **invitation token** to a member (likely surfaced via Telegram bot DM or admin page).
- Member follows the link → signs in with GitHub OAuth → backend captures their handle + name + consent + optional `git_email_alias`.
- `warsaw-ai-bot` (existing GitHub App) commits the roster + alias updates to `main` server-side.
- Member receives confirmation. Their next sign-in to the platform Just Works.

**Why this is worth doing:** manual backfill is the v0.1 ship long-pole — coordination cost (Telegram cycle time + 18 PRs / commits) doesn't scale, and every new community member onboarding would otherwise need the same touch. Invitation-based self-onboarding scales without that cost.

## What's LOCKED (do not re-litigate)

- Spec §0–§10 of `projects/community-platform/spec.md` — the v0.1 surface, RBAC model, storage strategy (100% git for v0.1), four-role access, gamification phasing, OSS-first licensing.
- Plan amendments §9.5–§9.18 in `projects/community-platform/execution-plan.md` — Next 16 + NextAuth 5 reality, proxy.ts not middleware.ts, etc.
- All artifacts under `projects/community-platform/` — STATE, CONSTRAINTS, CHANGELOG, GOTCHAS, plan.md, execution-plan.md.

## What's open for brainstorming

The seed concept above is rough. Brainstorming should weigh, at minimum:

1. **Token issuance surface** — Telegram bot DM (admin types `/invite @user` and bot DMs them a link) vs. platform admin page (admin pastes a Telegram username + clicks Invite) vs. CLI script (admin runs `pnpm tsx scripts/invite.ts`)? Tradeoffs: discoverability, audit trail, ergonomics.
2. **Security model** — One-time vs. multi-use token, expiration window (24h? 7d?), what the token authorizes (sign-in only vs. sign-in + roster-write), revocation flow.
3. **Data captured at sign-up** — handle only (minimal) vs. handle + name + focus + consent + git-email alias (full onboarding). Where does each piece come from (GitHub profile vs. user entry)?
4. **Git-write authorship** — does `warsaw-ai-bot` commit directly to `main`, or open a PR for an admin to merge, or open an auto-merging PR with branch protection bypass? CI implications.
5. **Retroactive coverage** — does the same flow let *existing* roster members add their `git-email-alias` retroactively (currently a manual PR to `community/members/git-email-aliases.md`)?
6. **Reuse vs. new auth** — does the invitation flow reuse the existing GitHub OAuth App + GitHub App credentials, or introduce a separate auth surface? Implications for multi-environment (preview now uses production OAuth callback only — see `GOTCHAS.md` #3).
7. **Scope gating** — ship as v0.1.x point release (small, targeted) before v0.2's broader gamification cycle, OR bundle into v0.2 as one integrated release? Affects how the spec is structured.
8. **GitHub-App rate limit budget** — current bot does ~4 reads/render on `/admin/health` and 1 write per status post. Invitation flow adds 1–3 writes per onboarded member. Worth a back-of-envelope check that we're not approaching limits at 19+ members onboarding in a tight window.

Brainstorming may surface other questions; treat the list above as seeds, not boundaries.

## Done means

- A v0.2 spec section produced via `superpowers:brainstorming`. Either as `spec.md §11 v0.2 — invitation registration` (extending the existing spec) or as `projects/community-platform/spec-v0.2.md` (sibling). Brainstorming decides the structure.
- Each brainstorming question above resolved with a decision + rationale (or explicitly deferred to plan-writing with reasoning).
- `STATE.md` updated: `phase: "v0.2 spec drafted; plan-writing next"` and `Last verified` block extended if new state checks were performed.
- Memory entry `project_community_platform_invitation_feature.md` updated: status: "spec drafted, plan-writing next" + link to spec section.
- A draft `chat-N+2-brief.md` (or equivalent) for the writing-plans chat that follows this one.

## Reference pointers

- Production: https://warsaw-ai-community-platform.vercel.app
- v0.1.0 tag: `community-platform-v0.1.0` (SHA `1382fd2`)
- v0.1.0 PR: https://github.com/anton1rsod/warsaw-ai-community/pull/1 (merged)
- Seed memory: `project_community_platform_invitation_feature.md`
- Lessons from ship-day: `projects/community-platform/GOTCHAS.md` (7 ops patterns)

---

## Paste this into a fresh auto-mode Claude Code chat to start

```
Warsaw AI Community Platform v0.2 — Chat 7: Invitation feature brainstorm

================================================================
Setup (skip if PR #2 already merged)
================================================================

If PR #2 (post-v0.1.0 handoff hardening) is still open on origin,
branch off `origin/phase-10-followups` instead of `origin/main` so
GOTCHAS.md and STATE Last-verified are present at chat start. Once
PR #2 merges, branch off main as usual.

================================================================
Read in order (each ~30–120 lines; total ~270 lines)
================================================================

1. projects/community-platform/STATE.md
   — current state (v0.1.0 shipped; Last verified block; known
     post-ship follow-ups). Single source of truth for "right now."

2. projects/community-platform/CONSTRAINTS.md
   — locked rules. Spec §0–§10 + amendments §9.5–§9.18 are LOCKED;
     don't re-litigate.

3. projects/community-platform/GOTCHAS.md
   — operational patterns from prior chats (read once if first time
     in this repo; reference by number from any decision that
     touches deploy / env / auth surfaces).

4. memory: project_community_platform_invitation_feature.md
   — the deferred-feature seed concept. This is where the
     brainstorm starts.

5. docs/specs/2026-05-03-community-platform-v02-invitation-handoff.md
   — this file (full framing, brainstorming questions, done
     criteria). Skim if not already read.

DO NOT pre-read CHANGELOG.md, plan.md, or spec.md. Read on-demand
only if brainstorming surfaces a specific question that needs them.

================================================================
This chat owns
================================================================

Brainstorm the v0.2 "git-based personal-invitation self-registration"
feature using the `superpowers:brainstorming` skill. Output: a spec
for this feature (either as `spec.md §11` extending the existing
spec, or as a sibling `spec-v0.2.md` — brainstorming decides).

DO NOT jump to plan.md or implementation. Brainstorming → spec →
writing-plans → TDD is the locked workflow per project CLAUDE.md.

================================================================
Brainstorming questions to weigh (seed list; expand as you go)
================================================================

See section "What's open for brainstorming" in the handoff file
above (§5). Eight seed questions covering: token issuance surface,
security model, data captured at sign-up, git-write authorship,
retroactive alias coverage, OAuth reuse vs. new surface, scope
gating (v0.1.x vs v0.2), GitHub App rate-limit budget.

================================================================
Hard prerequisites
================================================================

- v0.1.0 shipped ✓ (production at warsaw-ai-community-platform.vercel.app).
- PR #1 merged to main ✓.
- PR #2 (handoff hardening + this handoff doc) preferred merged but
  not strictly required (see Setup above).

================================================================
Done means
================================================================

- Spec section / file for the invitation feature, written via
  `superpowers:brainstorming`. Each brainstorming question resolved
  with a decision + rationale (or explicitly deferred to
  plan-writing).
- STATE.md updated: phase: "v0.2 spec drafted; plan-writing next".
- Memory `project_community_platform_invitation_feature.md` updated
  to: status: "spec drafted, plan-writing next" + spec link.
- A draft brief for the writing-plans chat that follows.
```
