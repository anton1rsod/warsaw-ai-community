# Handoff — Pulse (reports + Notion PM): spec → plan → build

**Date:** 2026-06-09
**From:** chat that brainstormed + specced `pulse` (and shipped the repo operating foundation)
**To:** next chat — writing-plans → implementation

## Where we are
- `pulse` design **spec approved + committed**: `docs/specs/2026-06-09-pulse-reports-notion-design.md` (rev `0c267fe`).
- Repo operating **foundation shipped** this session (AGENTS.md, root `STATE.md` + resume read-order, ADR-0017 Yuriy peer co-founder, `docs/playbooks/collaboration.md`, `_template` parity).

## What's next (this chat's job)
1. Read root `STATE.md` → this handoff → the pulse spec. (Don't re-derive — the spec is the contract.)
2. Invoke **`superpowers:writing-plans`** → implementation plan for phases P1→P2→P3 (spec §6).
3. Then implement (TDD, 80% coverage on `lib/`; inline or `superpowers:subagent-driven-development` per token-discipline).

## Spec at a glance (detail in the spec)
- Standalone `projects/pulse/` (scaffold from `_template/`); TS + tsx + Zod + `@notionhq/client@^5`.
- Split source-of-truth: repo→Notion one-way mirror (read-only context DBs: Projects/Decisions/Shipping/Engagement) + **Notion-native Tasks** board.
- **Two-token least-privilege:** mirror token (write → 4 context DBs) + read-only export token (Tasks only).
- Tasks backup: nightly Notion→git read-only snapshot (`snapshots/tasks-snapshot.json`; git history = audit trail).
- Notion **v5 `data_source_id`** API + idempotent upsert + `notion-index.json` + `p-limit` throttle/backoff.
- Automation: `.github/workflows/pulse.yml` (path-filtered push mirror + cron/dispatch digests at `:30` + nightly snapshot; `GITHUB_TOKEN` write-back, `concurrency` queue).
- Reports: monthly review → `docs/playbooks/monthly-review.md` + Notion digest page. **No Telegram** (parked §8).

## Locked founder calls (already in the spec)
- Tasks backup = YES (L9). Engagement metrics = contributions · kudos · status-streak · events-attended (§3). Telegram push = dropped (§8).

## Defaults standing (don't re-ask unless changing)
- O1 name `pulse`; O2 weekly digest deferred (monthly first); O3 exact Notion field types locked during plan-writing.

## Anton-side dependencies (flag; don't block planning or P1)
- **P2 live-run needs one-time Notion setup** (spec L10): dedicated space + 5 DBs + TWO integrations (mirror read+write → 4 context DBs; export read-only → Tasks) + GH secrets `NOTION_TOKEN`, `NOTION_READ_TOKEN`, DB ids. Plan + P1 can proceed without it.
- Non-blocking foundation items: Yuriy's roster handles; per-project DRI confirm.

## Pickup command
> "Open this repo, follow the read order. Resume `pulse` at writing-plans."
