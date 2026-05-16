# Community Platform — post-v0.2.2 handoff (chat 17+)

**Written:** 2026-05-16 by chat 16, immediately after the v0.2.2 ship.
**For:** the next chat (chat 17). Designed for minimum read budget — STATE.md + this file is enough to start productively.

## State of play

v0.2 chapter is sealed:

- **v0.2.0** (PR #13, `69362e9`) — profile editor + project contribution surface + GBrain link.
- **v0.2.1** (PR #16, `dd3a675`) — consent redirect chain hardening (chat-14 hotfix + chat-15 recovery route).
- **v0.2.2** (PR #17, `7cd87c3`) — profile editor SHA passthrough; closes Scenario 2 E2E + retry-on-409 lost-update window.

Tag at HEAD: `community-platform-v0.2.2`. Tests: 578 unit/integration + 33 E2E (0 skips).

## Read order (lazy — only what your scope needs)

1. `projects/community-platform/STATE.md` — snapshot + last_verified + pending follow-ups (this file's menu is a subset of STATE's). ~170 lines.
2. (skip unless scope hits them) `CONSTRAINTS.md`, `GOTCHAS.md`, `HANDOFF_PROTOCOL.md`.
3. (skip entirely) `plan.md` — frozen for v0.1.1; v0.2.0 plan in `v0.2.0-plan.md` is also frozen.
4. Source files as the work demands.

## Scope menu (pick at chat start; none are blockers)

1. **v0.3 brainstorm** *(recommended — natural next step)*. Invoke `superpowers:brainstorming`. Seed: spec §6.1 (storage move) is dormant; §12 (v0.2) covered profile editor + project contributions + GBrain link. v0.3 candidates worth exploring: events surface, meeting-notes surfacing, status gamification, Telegram ↔ platform link. Output: spec §13 patch + hardening IDs continuing from H29 (so H30+ once v0.2.1's H30–H31 are accounted for — actually H32+). Stays 100% git unless §6.1 wakes.
2. **Sec-review surgical follow-ups** (from v0.2.0 security review, all still open):
   - MEDIUM-1: narrow `previewEndpoint` prop type to literal `"/api/preview-markdown"` — forward-defense only.
   - MEDIUM-2: rate-limit `/api/preview-markdown` — Vercel WAF can do this at infra layer, or in-route token-bucket.
   - LOW-1: `_test-status-store.ts` `isE2EMode()` consistency — call sites are safe today.
   - LOW-2: defensive slug assertion in `profilePath()` — `slugify` + roster filter already protect.
   - ~30 min each; bundle as a single cleanup PR or one PR per fix.
3. **Production smoke for v0.2.2** — sign in as `anton1rsod` → `/me/edit` → save → verify a commit lands on `main`; concurrent-edit race needs two browser sessions (tab A saves → tab B saves with stale page → expect "Someone else updated this — refresh"). Anton-side flow; chat records evidence to a new `v0_2_2_prod_smoke` row in STATE.md.
4. **Mark Spasonov backfill on PR #3 (Draft)** — needs real values for `@MARK_TELEGRAM_HANDLE_TBD` + `MARK_GIT_EMAIL_TBD` (out-of-band from Mark). Once provided: replace placeholders, mark PR Ready, merge.
5. **`GBRAIN_BASE_URL` on Vercel production** — gates AskGBrain link visibility on `/projects/[slug]`. User-terminal-side `vercel env add` per `feedback_vercel_prod_mutations` memory (harness gates `vercel env rm/add` on production).
6. **Branch protection PR-required gate on `main`** — needs `warsaw-ai-bot` numeric App ID (paste from GitHub Settings → Developer settings → GitHub Apps → warsaw-ai-bot). Then create a Ruleset via REST API with `bypass_actors: [{actor_id: <id>, actor_type: Integration, bypass_mode: always}]` + `pull_request: required`.

## Routing & discipline hints

- Scope #1 → `superpowers:brainstorming` then `superpowers:writing-plans` then `superpowers:subagent-driven-development` for implementation. Standard v0.2 cycle.
- Scopes #2–6 → small surgical diff, single commit, PR if CI-triggered paths (anything under `projects/community-platform/**`); direct-to-main is fine for docs-only / meta-config (`feedback_pr_vs_direct` memory).
- **Token discipline** (`feedback_token_discipline` memory): no subagents for trivial mechanical tasks; phase-boundary verification only; lean handoffs ≤80 lines; batch reviewer-fix commits.
- **Push proactively** (`feedback_push_commits` memory): push to origin after substantive commits without waiting for explicit instruction (overrides global DO-NOT-push default for this project).

## Drop-in chat-opening prompt

Copy-paste this at the start of chat 17:

```
Community Platform: v0.2 chapter sealed (v0.2.2 shipped 2026-05-16, PR #17 at 7cd87c3, tag community-platform-v0.2.2). 0 documented test skips. Pick scope.

Read just projects/community-platform/STATE.md and docs/specs/2026-05-16-community-platform-v0-2-2-shipped-followups-handoff.md — the menu is there. Skip CONSTRAINTS/GOTCHAS/HANDOFF_PROTOCOL unless your scope hits them; skip plan.md entirely.

I want to <pick #1 / #2 / #3 / #4 / #5 / #6 — see handoff>.
```
