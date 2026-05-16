# CLAUDE.md — GBrain sub-project

This file auto-loads under `projects/gbrain/`. GBrain is the Warsaw AI Community's Telegram knowledge-base bot (archive + digest + Q&A).

## Read order for new chats

1. **`CHANGELOG.md`** — canonical history. Last released: `gbrain-v0.1.1`.
2. **`plan-0.1.2-ask-bundle.md`** — active plan when working on 0.1.2.
3. **`spec.md` sections** — read specific `§X` when scope touches it. Don't pre-read.
4. **`../../docs/specs/2026-04-26-gbrain-ask-search-help-design.md` v2.1** — 0.1.2 design.
5. **`app/`** source — by need (routes, retrieval, telegram, ai/gateway).

Don't pre-read 1–5. Read by task.

## Current state (verify with `git log` before acting)

**Branch:** `gbrain-0.1.2-ask-bundle` (NOT `main`). E1+E2 done; most of E3 done.

**Pending to close 0.1.2:**
1. Anton-tuned `ASK_SIMILARITY_THRESHOLD` (still plan-default `0.55` in `commands/ask.ts`).
2. Six day-30 rehearsal gates on staging (3 `/ask` + 3 `/search` + `/help` + pinned regen + GitHub Action build-index round-trip < 60s).
3. CHANGELOG entry + `gbrain-v0.1.2` tag + ff-merge to `main`.

**Don't switch off `gbrain-0.1.2-ask-bundle` until 0.1.2 ships and ff-merges.**

## Stack

Next.js + Vercel + Telegram bot. AI: direct `@ai-sdk/google` (`gemini-2.5-flash`) — AI Gateway bypassed since 0.1.1; don't re-introduce until 0.3.0+. No Postgres/pgvector for v0.1.x.

- Vercel `rootDirectory`: `projects/gbrain/app` (permanent since 0.1.1).
- Embeddings index: file-based at `community/archive/_index/` (ADR-0008). Built by GitHub Action, copied into Vercel deploy via `outputFileTracingIncludes` + `predev`/`prebuild` scripts.

## Commands (from `projects/gbrain/app/`)

- `pnpm tsc --noEmit` — typecheck.
- `pnpm test` — vitest (160 passing + 7 live-only skipped).
- `pnpm test -- safety` — injection corpus only.
- `tsx scripts/build-index.ts` — rebuild embeddings index locally.
- `tsx scripts/calibrate-threshold.ts` — Anton's tuning harness.

## Skill choice (per scope)

- 0.1.2 finalization (threshold tuning + gates + tag) → no skill; direct edits.
- Bug / test failure → `superpowers:systematic-debugging`.
- New scope (Phase E, 0.3.0+) → `superpowers:brainstorming` then `superpowers:writing-plans`.

## What NOT to do

- Don't introduce new ADRs without asking. ADR-0008/0009/0010 cover 0.1.2.
- Don't expand scope to `/summarize` (ADR-0010 defers it).
- Don't echo or store API keys (PAT, bot token, `GEMINI_API_KEY`).
- Don't bump `app/package.json` to `0.1.2` yet — happens in the tag commit.
- Don't mix Phase E (rotation + real channel switch) with 0.1.2 cleanup.

## Gotchas (carried from prior chats)

- `vitest.config.ts` `@`-alias must use `fileURLToPath` (workspace path has a space).
- Vitest 3 needs `.test.ts` suffix to auto-discover.
- `BotClient.sendMessage` is 4-arg: `(chatId, threadId, text, parseMode?)`; `parseMode` is the literal `"MarkdownV2"`.
- `text.startsWith()` is not a command match — use `isCommand()` helper.
- `?? ""` on a sensitive env var is a silent-fail trap — fail-fast at use-site.
- Auth-before-flag on every route.
- Vercel sensitive env vars are write-only via API; runtime logs live in build logs only (not `/v3/deployments/<id>/events`).
- `git diff HEAD^ HEAD` doesn't work in Vercel's shallow clones — no path-filter ignoredBuildStep.
