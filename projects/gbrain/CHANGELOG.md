# Changelog

All notable changes to GBrain are recorded here. The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## Versioning policy

GBrain stays in `0.x` indefinitely. The major version `1.0.0` is reserved — Anton's call to issue when GBrain is ready to be claimed production-grade. Minor and patch bumps are issued at session-close time:

| Version | Meaning |
|---|---|
| `0.1.0` | Phase 1 scaffold — feature complete, never run on real channel |
| `0.1.x` | Rehearsal / staging fixes |
| `0.2.0` | First real-channel soft launch (Phase E) |
| `0.2.x` | Real-channel patches, observation-window fixes |
| `0.3.0` | Phase 1 success gates met (≥5 archivers, ≥10 items, 14d digest streak) |
| `0.4.0` | Phase 2 — Q&A with RAG, basic |
| `0.5.0+` | Phase 2 mature, Phase 3 features |
| `1.0.0` | Reserved (production-grade declaration) |

---

## [Unreleased] — 0.1.2 work in progress

> Renamed to `## [0.1.2] — YYYY-MM-DD — ...` at tag time. See `docs/specs/2026-05-NN-gbrain-0.1.2-rehearsal-closeout.md` for the closeout sequence.

**Theme:** Day-30 member surfaces — RAG Q&A, semantic search, command discoverability, pinned-message scaffolding. First file-based-index architecture (no Postgres in 0.1.x).

### Added
- `/ask <question>` — RAG Q&A with cited answers from the community archive (top-K=5, similarity-threshold gated, XML `<citation id=N/>` markers, out-of-range citations pruned).
- `/search <query>` — semantic ranked retrieval (top-K snippets, no LLM call — fast and rate-limit-cheap).
- `/help` and `/help <command>` — typed `COMMAND_REGISTRY` enforces compile-time discoverability invariant; per-command detail pages.
- `community/archive/_index/{index.json,manifest.json}` — file-based embeddings index (768-dim, `gemini-embedding-001`). Built by GitHub Actions, committed to repo, copied into Vercel deploy bundle at prebuild.
- GitHub Action `.github/workflows/build-index.yml` — incremental rebuild with retry/skip and `assertAllowedPath` defense-in-depth. Uses `GBRAIN_BOT_INDEX_PAT` (separate identity from `GITHUB_BOT_TOKEN`).
- `next.config.mjs` — `outputFileTracingIncludes` so the deploy bundle ships the index alongside the function.
- `prompts/{ask,digest}.ts` — all model prompts consolidated as pure functions with dual injection guards (user + archive content) and XML delimiters.
- `retrieval/` module — `chunk`, `cosine`, `cite`, `load`, `schema` (Zod-validated index format), module-level `cachedIndex` singleton.
- `help/` module — `registry.ts` (typed `CommandHandler` + `RateLimitKey`), `topics.ts` (per-topic blurbs), `pinned.ts` (`generatePinnedMessage`).
- `rate-limit/` module — per-user sliding-window counters (10 `/ask`/hour + 30 `/search`/hour, in-memory ring buffer).
- `telegram/format.ts` — MarkdownV2 escaping (`escapeMd`, `formatLinkMd`, `formatBoldMd`).
- `scripts/build-index.ts` — incremental embed + retry/skip with manifest.
- `scripts/copy-index.ts` — prebuild/predev hook that copies `community/archive/_index/` into `app/data/_index/`.
- `scripts/regen-pinned.ts` — pinned-message ops with `--confirm-chat-id` allowlist + `STAGING_CHAT_IDS` guard.
- `scripts/calibrate-threshold.ts` + `tests/fixtures/calibration-queries.json` — empirical threshold tuning harness for `ASK_SIMILARITY_THRESHOLD` (OQ-1).
- `scripts/calibrate-fixtures.ts` — sandbox calibration variant: builds an index from the fixture corpus in a temp dir, scores the seed queries, prints SUGGESTED THRESHOLD. Use when the real staging archive is too thin (cf. plan §15.1 + spec §9.3 OQ-1).
- `app/api/debug/index-presence/` — time-boxed bundle-verification endpoint.
- `tests/safety/injection-cases.test.ts` — Cat A/B/C corpus (7 live-gated by `GEMINI_API_KEY`).
- spec.md prologue `## At a glance — 90-day vision` with 5-surface end-state, 30/60/90 day plan, non-goals, and indispensability criteria. Filtered per-topic news feed added as fifth member-facing surface. Sourced from [`docs/specs/2026-04-26-gbrain-extension-questionnaire.md`](../../docs/specs/2026-04-26-gbrain-extension-questionnaire.md) §1.3.
- spec.md §6/§12/§15/§20 deltas covering the file-based-index architecture, command surfaces, observability, and risk register.
- Version-line mapping committed: 0.2.0 = real-channel launch (day 30), 0.3.x = onboarding + meeting continuity (day 60), 0.4.x = personalization (day 90). 1.0.0 stays reserved for production-grade declaration.

### Changed
- ADR-0007 decision 3 amended by ADR-0008: file-based index in 0.1.x; Postgres/pgvector deferred to ≥0.4.0.
- ADR-0009 logged: prompts/ as the single home for model prompts.
- ADR-0010 logged: `/summarize` deferred (Telegram Bot API doesn't expose per-topic message lists; Strategy B per-topic message cache is a 0.1.3 design cycle).

### Internal
- 162 passing + 7 skipped (live-gated). Up from 94 at 0.1.1 tag — +68 tests covering retrieval, prompts, registry, rate limit, MarkdownV2, build-index CLI, and injection cases.
- Closed quick-debt items QD-1/2/5/7/8 in the cleanup commit before tag (net code reduction, no behavior change).
- `app/package.json` version bumped to `0.1.2`.

### Deferred
- `/summarize` — see ADR-0010. Subsequent design cycle (0.1.3).
- Real-channel cutover — Phase E (separate dedicated chat) covers bot-token rotation, `CHAT_ID` switch to the real Warsaw AI Community channel, onboarding pin, and the `gbrain-v0.2.0` tag.

### Calibration note
- `ASK_SIMILARITY_THRESHOLD` set to `0.55` (commands/ask.ts, commit `e16a60d`). Tuned via sandbox-via-fixtures using `scripts/calibrate-fixtures.ts` — the monorepo archive had 0 `#kb` items at calibration time, so a real-corpus retune is scheduled for 0.2.x (per spec §9.3 OQ-1 follow-on). See closeout doc `docs/specs/2026-05-NN-gbrain-0.1.2-rehearsal-closeout.md` §3 for the seed query set, sample size, and the chosen value's rationale.

## [0.1.1] - 2026-04-26 — rehearsal complete + Phase D cleanup + Gemini direct

### Fixed
- `parse.ts`: treat undefined `message_thread_id` as General topic when `TOPIC_GENERAL_ID` is configured (commits `b78f454`, `630c557`). Without this, `#kb` posts in General were denied as "unknown topic".
- `runDigest()`: graceful degrade on AI-provider exhaustion. Previously the cron 500'd on AI failure and Vercel Cron retry-stormed; now `runDigest` catches `summarise()` rejections, returns `{degraded:true}`, and the cron route commits a `(degraded)` tombstone digest while skipping the Telegram post (avoids "unavailable" spam if AI is down for many days). Spec §16 metric `gbrain.digest.run` outcomes now actually fire.
- `handleForget()`: spec §10 tombstone now actually written. The forget command had been removing the file but not committing the removal record. Now commits `community/archive/<namespace>/_removed/YYYY-MM-DD.md` with SHA-256(path) + author id + ISO timestamp — hash-only audit trail, no original content.
- Webhook error-capture: stops echoing `error.message`/`error.stack`/`error.name` in the response body. Now logs full error to `console.error` (Vercel logs) and returns generic `{ok:false}`. Stops Telegram retry storms while removing the leak surface.

### Changed
- **Bypass Vercel AI Gateway** — call Gemini directly via `@ai-sdk/google`. Reason: AI Gateway requires a credit card on file even for the free tier. Gemini's own free tier (15 RPM, 1M tokens/day for Flash) covers v0.1.x volumes (~1.7k tokens/day measured during C5 rehearsal). Default model swapped from `google/gemini-2.0-flash` (gateway-routed) to `gemini-2.5-flash` (direct, current cheap-fast model). Trade-off documented in spec §16 + §20: Gemini outage moves Low → Medium severity since multi-provider fail-over is no longer in the path; the new graceful-degrade above mitigates the user-visible impact.
- `Config.ai` shape: `gatewayKey: string | undefined`, `geminiKey: string` (was the reverse). `AI_GATEWAY_API_KEY` is now optional, `GEMINI_API_KEY` required.
- Digest footer no longer mentions "Vercel AI Gateway".

### Added
- Rehearsal staging: 8 topics + env vars in `gbrain-staging`.
- `@ai-sdk/google` dependency (`^3.0`).

### Removed
- `/api/debug/env` diagnostic endpoint (was `0d5b993`, reverted in this release).
- `community/archive/_staging/` initial cleanup commit (rehearsal artifacts; namespace was re-added later this session for C4-C5 testing — will be removed at the end of Phase D in the closeout).
- (Brief, in-session) temporary diagnostic field that surfaced AI errors in the cron response — reverted before tag.

### Security
- Rotated `CRON_SECRET`, `TELEGRAM_WEBHOOK_SECRET`, and Vercel API token (all exposed in session 3 chat history per [`docs/specs/2026-04-26-gbrain-rehearsal-session-3-closeout.md`](../../docs/specs/2026-04-26-gbrain-rehearsal-session-3-closeout.md) §6).

### Internal
- Aligned `app/package.json` version (`0.0.1` → `0.1.0`) with the existing `gbrain-v0.1.0` git tag and `[0.1.0]` CHANGELOG entry to remove the three-source-of-truth drift.
- Adopted explicit versioning policy (this CHANGELOG header).
- Fixed Vercel project `rootDirectory` to `projects/gbrain/app` (was `null`). All git-push auto-deploys had been ERROR-ing with `ENOENT package.json` because the build was running from repo root. Now auto-deploys and API-triggered deploys both succeed without per-call `projectSettings.rootDirectory` overrides.
- Added Vercel `commandForIgnoringBuildStep` path filter (only deploy on `projects/gbrain/app/**` changes), then disabled it after every deploy under it canceled with `ignoredBuildStep:null` — likely a shallow-clone interaction with `git diff HEAD^ HEAD`. Will revisit using `$VERCEL_GIT_PREVIOUS_SHA` in 0.1.2.

### Carries to Phase E
- `TELEGRAM_BOT_TOKEN` rotation — deferred to the real-channel launch session (current token still works; rotation paired with the move to the real channel).
- `AI_GATEWAY_API_KEY` Vercel env — left set-but-unused as rollback insurance. Remove once Gemini-direct proves stable across a few days.
- Path-filter ignoredBuildStep — re-attempt with a more robust diff approach.

## [0.1.0] - 2026-04-24 — Phase 1 scaffold
- Scaffold Next.js project at `projects/gbrain/app/`.
- CI pipeline + secret scan workflow.
- Config layer + shared types.
- `consent`, `ingest`, `store`, `telegram`, `digest`, `ai`, `commands`, `pending` modules.
- Telegram webhook + daily digest cron endpoints.
- Soft-launch rollout runbook.

Tagged as `gbrain-v0.1.0`. Feature complete — never run on the real Warsaw AI Community channel; only in `gbrain-staging`.
