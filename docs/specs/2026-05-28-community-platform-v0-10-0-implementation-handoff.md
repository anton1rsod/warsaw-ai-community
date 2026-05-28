# Chat-52 handoff — v0.10.0 implementation via subagent-driven-development

**Read order (skip the `claude-soul-resume` skill — direct reads only):**

1. `projects/community-platform/STATE.md` snapshot block (~lines 1–45) — current state at `c3c8829` (chat-51 plan committed).
2. `projects/community-platform/v0.10.0-plan.md` — **the plan you execute.** 3115 lines, 25 tasks, 5 phases.
3. `docs/specs/2026-05-28-community-platform-engagement-brainstorm.md` §1.5 (stocktake) + §4–§6 (the 3 feature specs) — only as background if a task seems ambiguous.
4. `projects/community-platform/CLAUDE.md` for read-order discipline; `GOTCHAS.md` for ops landmines; `HANDOFF_PROTOCOL.md` §verify-before-claiming.

## Where things stand (set by chat-51, 2026-05-28)

Chat-51 produced two artifacts, both on `main`:

- **Engagement brainstorm v3** — `docs/specs/2026-05-28-community-platform-engagement-brainstorm.md` at `e382da1`. Industry-best-practice validated (5 patterns + 3 v3 amendments: §3.5b introductions seed, §8 4-cadence framework + direction-flip, §10 Day-30 soft target). Anton-approved.
- **v0.10.0 plan** — `projects/community-platform/v0.10.0-plan.md` at `c3c8829`. 5 phases / 25 tasks. Anton-approved.

v0.9.1.1 line stays as production tag (`community-platform-v0.9.1.1` at `8b12e83`). v0.10.0 ships engagement bootstrap (Starter Pack + one-line shipping log + Telegram echo + ADR-0016).

## What chat-52 owns

Execute v0.10.0 via `superpowers:subagent-driven-development`. Recommended dispatch:

| Subagent | Phase | Model | Scope |
|---|---|---|---|
| A | A (ADR-0016 + env vars) | sonnet | 2 tasks; trivial — orchestrator-direct acceptable as token-discipline carve-out |
| B | B (Starter Pack) | sonnet | 7 tasks; new lib + Server Component + /home wiring + H113 build-time guard |
| C | C (one-line shipping-log) | sonnet | 6 tasks; lib + status-action mode field + /this-week render + StatusEditor toggle |
| D | D (Telegram echo) | sonnet | 6 tasks; lib/telegram-notify + profile-schema field + ProfileEditor UI + postStatus wiring + integration test |
| (orchestrator) | E (closeout) | — | Reviewer-triage dispatch + PR + tag + STATE flip — direct, no subagent |

Phase A is small enough that the trivial-task carve-out per `feedback_token_discipline` applies (orchestrator-direct, no subagent). Phases B/C/D each get a dedicated sonnet subagent. Phase E is orchestrator-direct per the v0.8 / v0.9.1 precedent.

## Verification at phase boundaries

After each phase: `pnpm tsc --noEmit` + `pnpm vitest run` + (Phase E only) `pnpm build`. Plan tasks already specify the per-task `pnpm vitest run <path>` commands; phase-boundary suite is the catch-net.

## Reviewer triage (Phase E)

Per `agents.md` "ALWAYS use parallel Task execution for independent operations": dispatch `typescript-reviewer` + `code-reviewer` in parallel against the v0.10.0 strict-list (the 12 modified files + 7 new files). Triage findings into:
- CRITICAL + HIGH → apply as new commits (one per fix).
- MEDIUM → accept with reason if defensible, otherwise apply.
- INFO → record as v0.10.1 candidates in `V0_5_BACKLOG.md`.

Batched triage commit pattern (per v0.5.1 / v0.6.0 / v0.8.0 / v0.9.1 precedent): `chore(community-platform): v0.10.0 reviewer-triage — N applied / M accepted` with one-liner per finding.

## Anti-patterns (skip)

- **Don't invoke `claude-soul-resume`** (per `feedback_skip_claude_soul_resume`).
- **Don't re-derive scope** from the engagement brainstorm — the plan is authoritative.
- **Don't expand v0.10.0 scope** (member-introductions feature stays as v0.10.1 per spec §12-O9 Option β; full MSW migration stays deferred per `feedback_token_discipline` chat-47).
- **Don't ship to main without reviewer triage** + Vercel preview smoke (per project ship convention).
- **Don't break dev server** while running tests (per `~/.claude/CLAUDE.md`: use `pnpm tsc --noEmit`, not `pnpm build`, when a dev server is active).

## Deferred (NOT in chat-52 scope)

- Step 1 (seed 5 artifacts) + Step 3 (manual alpha recruiting) + Step 4 (founder cadence) — Anton-paced ops work; calendar item, not a plan task.
- H120 rate-limit on echo-per-edit — v0.10.0 accepts echo-per-edit; v0.10.1 hardens.
- Member-introductions surface (§3.5b Option α) — defer to v0.10.1.
- Vercel-side: setting `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` / `TELEGRAM_TOPIC_ID` as Sensitive — Anton-paced ops step pre-merge per `feedback_vercel_prod_mutations`.
