# Handoff — Pulse P3 (automation workflow)

**Date:** 2026-06-09
**From:** chat that shipped P2 (Notion mirror + Tasks export + digest, PR #50)
**To:** next chat — execute **P3 (plan Task 22)**

## Where we are
- **P1 + P2 shipped to `main`.** P2 = PR #50 (squash `87e2623`) + post-merge STATE flip. Pulse is **21/22 plan tasks done — Task 22 (P3) is the last.**
- **Live Notion runs are PAUSED** (internal integrations need a paid Notion plan; Anton is using a separate paid account). This does **NOT** block P3. The live-setup resume recipe lives in root `STATE.md` + `projects/pulse/SETUP.md` §8 (exact DB DDL). A dry-run structure was built on the current free account.

## What P3 builds (Task 22 = the contract)
- `.github/workflows/pulse.yml` — push-mirror (on push → `sync-notion`) + monthly cron (`publish-digest`) + nightly cron (`export-tasks`) — **plus a structural test** (validates the YAML shape; not a live Notion call).
- Exact file contents + test are in **`docs/specs/2026-06-09-pulse-implementation-plan.md`, Task 22 (lines ~2942–end)**. The plan is the build contract — don't re-brainstorm or re-derive.

## Why it's unblocked (no paid account needed)
- The three scripts **no-op gracefully without `NOTION_*` secrets**, so the workflow runs in CI immediately and simply does nothing until secrets exist.
- The test is **structural** (YAML), not a live run.
- Build + merge it **dormant**; it **activates with zero further code** once Anton sets the GitHub secrets (`SETUP.md` §5) on the paid account.

## How (execution)
- Branch `chore/pulse-p3` off `main`.
- One task → one implementer (or orchestrator-direct) via `superpowers:subagent-driven-development` + TDD (structural test first). Phase-boundary spec + code-quality review. Per `feedback_token_discipline`, don't over-fan-out a single task.
- Gotchas carried: no `@` alias (repo path has a space) → relative imports with `.js`; if a file's contents include a regex match-call or a Node process-spawning import, create it via a Bash heredoc (the YAML + its test likely don't, but watch the test).
- **Do NOT set live GitHub secrets** — that's Anton's, on the paid account.

## Done-when (P3)
- `pulse.yml` + structural test written; test green; `tsc` + `lint` + full suite green; PR opened (then merged per the usual squash flow). **Pulse plan = 22/22 complete.**
- CHANGELOG `[Unreleased]` → a P3 entry; post-merge STATE flip ("pulse: plan complete; live activation pending Anton's secrets").
- Live activation (set secrets → first real run) deferred to Anton's paid Notion account.

## Pickup command
> Open this repo, follow the read order. Resume `pulse` at **P3** — execute plan **Task 22** (the `.github/workflows/pulse.yml` automation workflow + structural test). Live Notion is paused pending a paid account, but P3 is unblocked (scripts no-op without secrets; the test is structural) — build it and merge it dormant.
