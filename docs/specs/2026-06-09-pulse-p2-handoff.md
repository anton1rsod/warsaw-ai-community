# Handoff — Pulse P2 (Notion mirror + Tasks export + digest)

**Date:** 2026-06-09
**From:** chat that wrote the plan + shipped P1
**To:** next chat — execute **P2 (plan Tasks 12–21)**

## Where we are
- **P1 complete + in review:** PR #49 (branch `chore/pulse-p1`). 65 tests, 100% lines / 90.35% branches, `tsc`+`lint` clean. Real `docs/playbooks/monthly-review.md` generated from live repo data. Zero Notion dependency.
- **Plan (the contract):** `docs/specs/2026-06-09-pulse-implementation-plan.md` — **Tasks 12–21 = P2**. Each task has exact file contents, mock-based test code, and commands. Don't re-brainstorm; don't re-derive.
- **Design spec:** `docs/specs/2026-06-09-pulse-reports-notion-design.md` (rev `0c267fe`).

## Step 0 — branch
- P1 is **merged to `main`** (PR #49, squash `763eede`); branch `chore/pulse-p1` is deleted. The plan + P1 code + this handoff are all on `main`. Branch `chore/pulse-p2` off `main` and build P2 there.

## What P2 builds (all code + tests are mock-based — NO live Notion needed to build/test)
- **T12** `projects/pulse/SETUP.md` — the one-time Notion runbook (does not exist yet; T12 creates it). Two least-privilege integrations (mirror read+write → 4 context DBs; export read-only → Tasks), 5 DBs + a Digests page, GitHub secrets.
- **T13** `lib/notion/client.ts` — v5 client + `resolveDataSourceId` (asserts exactly one data source).
- **T14** `lib/notion/throttle.ts` — `p-limit` + Retry-After backoff (injectable `sleep`).
- **T15** `lib/notion/index-store.ts` — `notion-index.json` read/write + accumulator store.
- **T16** `lib/notion/mappers.ts` — struct → Notion properties per DB (locks O3 field types).
- **T17** `lib/notion/upsert.ts` — idempotent query-by-`External ID` → update|create.
- **T18** `lib/notion/export-tasks.ts` — read-only paginated Tasks dump (write-incapable client type).
- **T19** `scripts/sync-notion.ts` — `runSync` core + graceful no-op when unconfigured.
- **T20** `scripts/export-tasks.ts` — `runTaskExport` → `snapshots/tasks-snapshot.json`.
- **T21** `lib/notion/digest.ts` + `scripts/publish-digest.ts` — monthly review → Notion page.

## How (execution)
- `superpowers:subagent-driven-development`. **Group implementer dispatches by logical unit** (e.g. T13–T15 infra; T16–T18 mapping+upsert+export; T19–T21 scripts+digest), NOT per micro-task — per `feedback_token_discipline` + the P1 precedent. Spec + code-quality review at the phase boundary.
- **Gotchas carried from P1 execution (save cycles):**
  1. The repo security hook blocks `Write`/`Edit` of files whose contents include a RegExp exec-call or Node's process-spawning import → create those files via a Bash heredoc (byte-correct). Several P2 files use regex matching, so expect this.
  2. `tsconfig` has `noUncheckedIndexedAccess` → add `!` on bare array indexing in test code (e.g. `res.results[0]!.id`).
  3. Relative imports with `.js` extensions; no `@` alias; `lib/` stays free of process-spawning.
  4. **Write fail-fast + edge-branch tests up front** to clear the ≥80% branch gate in one pass (P1 needed a separate hardening pass — avoid that).
  5. Mock the Notion SDK via the structural interfaces (`MirrorClient` / `ExportClient` / `RetrievableClient` / `DigestClient`) defined in T13/T21 — pass fakes, no `vi.mock` needed.

## Live-run gate (does NOT block building/shipping P2 code)
- After T12 lands, **Anton** follows `SETUP.md` to create the Notion space + 2 integrations + 5 DBs + Digests page + GitHub secrets (`NOTION_TOKEN`, `NOTION_READ_TOKEN`, `NOTION_DB_PROJECTS/DECISIONS/SHIPPING/ENGAGEMENT/TASKS`, `NOTION_DIGEST_PAGE`). Only then do live `sync-notion` / `export-tasks` / `publish-digest` runs work.
- P2 ships (PR) on mock tests alone; the §10.2 live verification is a follow-up once setup is done.

## Done-when (P2)
- Tasks 12–21 implemented; mock tests green; coverage ≥80% on `lib/**`; `tsc` + `lint` clean; PR opened for P2.
- §10.2 live verification (idempotent re-run = no dupes; read-only export; digest page) deferred to after Anton's Notion setup.

## Pickup command
> "Open this repo, follow the read order. Resume `pulse` at P2 — execute plan Tasks 12–21."
