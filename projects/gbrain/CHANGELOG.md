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

## [0.1.1] - Unreleased — rehearsal complete + Phase D cleanup

### Fixed
- `parse.ts`: treat undefined `message_thread_id` as General topic when `TOPIC_GENERAL_ID` is configured (commits `b78f454`, `630c557`). Without this, `#kb` posts in General were denied as "unknown topic".

### Added
- Webhook error-capture wrapper (logs only — no stack in response body) — kept after Phase D refinement.
- Rehearsal staging: 8 topics + env vars in `gbrain-staging`.
- Vercel `commandForIgnoringBuildStep` path filter — only deploy when `projects/gbrain/app/**` changes.

### Removed
- `/api/debug/env` diagnostic endpoint (was `0d5b993`, reverted in this release).
- `community/archive/_staging/` (rehearsal-only test data).
- `ARCHIVE_NAMESPACE` env var (no longer needed post-staging).

### Security
- Rotated `CRON_SECRET`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_BOT_TOKEN`, and Vercel API token (all exposed in session 3 chat history per [`docs/specs/2026-04-26-gbrain-rehearsal-session-3-closeout.md`](../../docs/specs/2026-04-26-gbrain-rehearsal-session-3-closeout.md) §6).

### Internal
- Aligned `app/package.json` version (`0.0.1` → `0.1.0`) with the existing `gbrain-v0.1.0` git tag and `[0.1.0]` CHANGELOG entry to remove the three-source-of-truth drift.
- Adopted explicit versioning policy (this CHANGELOG header).
- Fixed Vercel project `rootDirectory` to `projects/gbrain/app` (was `null`). All git-push auto-deploys had been ERROR-ing with `ENOENT package.json` because the build was running from repo root. Now auto-deploys and API-triggered deploys both succeed without per-call `projectSettings.rootDirectory` overrides.

### Carries to Phase E
- `TELEGRAM_BOT_TOKEN` rotation — deferred to the real-channel launch session (current token still works; rotation paired with the move to the real channel).

## [0.1.0] - 2026-04-24 — Phase 1 scaffold
- Scaffold Next.js project at `projects/gbrain/app/`.
- CI pipeline + secret scan workflow.
- Config layer + shared types.
- `consent`, `ingest`, `store`, `telegram`, `digest`, `ai`, `commands`, `pending` modules.
- Telegram webhook + daily digest cron endpoints.
- Soft-launch rollout runbook.

Tagged as `gbrain-v0.1.0`. Feature complete — never run on the real Warsaw AI Community channel; only in `gbrain-staging`.
