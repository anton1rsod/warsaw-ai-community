# ADR-0008: File-based embeddings index, with Postgres migration deferred

**Status:** Accepted
**Date:** 2026-04-26
**Deciders:** Anton Safronov (founder)
**Related:** [`projects/gbrain/spec.md`](../../projects/gbrain/spec.md), [`docs/specs/2026-04-26-gbrain-ask-search-help-design.md`](../specs/2026-04-26-gbrain-ask-search-help-design.md), [ADR-0007](0007-gbrain-phase-1-architecture.md)

## Context

ADR-0007 (Phase 1 architecture, decision 3) committed to **markdown-first in repo, with a derived pgvector index added in Phase 2** for Q&A. The 0.1.2 brainstorm under §2.1 breadth orientation lifted Q&A (`/ask` + `/search`) from Phase 2 into the 0.1.x line as the day-30 launch bundle. This forces a re-evaluation of the Phase 2 storage decision: at the time-shifted ship-date (day-30 not Phase 2), what's the right embeddings index?

Two factors changed since ADR-0007:

1. **Scale clarity.** The community has 19 members today (1 offline meeting, low post volume — questionnaire §1.2). Realistic projection: ~250 archive items in 90 days, ~1k items in a year, ~3MB–10MB index size. pgvector exists to solve "100k+ vectors, brute-force-too-slow, need HNSW/IVFFlat indexes." At 1k vectors that machinery is dead weight.

2. **Lock-in posture sharpened.** Questionnaire §4.4 item 5 ("no proprietary lock-in — anything we build should be exportable / forkable by members") and §1.3 day-90 vision item ("the architecture has been forked at least once by a third party") raise the bar for storage choices: a fork of the repo should produce a working `/ask` without provisioning external infrastructure.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A. File-based index in repo** (`community/archive/_index/`) — derived from markdown, rebuilt by GitHub Action, copied into Vercel deploy bundle. | Zero-infra; forkable; single source of truth (markdown canonical, index derived); cheap (free Actions tier); reuses git for audit + backup; no new failure modes beyond git/Actions; aligned with §4.4 item 5 + §1.3 fork goal. | Bot-on-bot commits trigger Vercel auto-deploys (~30s extra per index update; redundant deploys accepted as cost of clean architecture); index lifecycle is asynchronous from archive lifecycle (~30s lag commit → live). |
| **B. Vercel Blob (managed object store), written by Vercel Cron** | Cleaner `git log` (no bot-commits-bot loop); smaller deploy bundle. | New infrastructure dependency (Vercel Blob), against §4.4 item 5; 10-min poll latency; two failure modes (Blob down ≠ repo down); metered storage cost; not forkable without re-provisioning. |
| **C. Postgres + pgvector via Vercel Marketplace** (the original ADR-0007 Phase 2 plan) | Battle-tested; scales to 100k+ vectors; standard tooling; HNSW + filtering supports advanced retrieval. | Massively over-engineered at 1k vectors (brute-force cosine = ~1ms); new database to provision, secret to manage, schema to migrate, connection pool to tune; not forkable; metered cost. |
| **D. On-demand request-time embeddings, no persistent index** | Zero index-build infrastructure. | Re-embedding source chunks on cache miss wastes API calls; per-request latency 1–3s; fails §1.3 "demonstrable in first session" criterion; cost scales with traffic, not with content. |

## Decision

**Adopt Option A: file-based index in repo, lifted from Phase 2 to 0.1.x.**

The index lives at `community/archive/_index/index.json` + `manifest.json`, built by `.github/workflows/build-index.yml` on push to `community/archive/**` (excluding `_index/**`, `_removed/**`), committed by a distinct identity `gbrain-index-bot` (separate fine-grained PAT), and copied into the Vercel deploy bundle at build time via a `prebuild` script writing to `projects/gbrain/app/data/_index/`. Next.js bundles the file via explicit `outputFileTracingIncludes` config (without which file tracing would skip it).

Postgres + pgvector is **deferred** — not abandoned. It remains the migration target when any of these triggers fires:

1. **Volume:** archive crosses ~10k chunks (file-based query latency starts pushing 100ms in brute-force cosine).
2. **Quality plateau on `/ask`:** top-K-on-cosine misses correct chunks and hybrid search / metadata-faceted retrieval becomes painful in JSON.
3. **Multi-tenancy:** if the §1.3 "multi-community fork" non-goal flips to a goal and one deployment serves multiple communities.
4. **Real-time write contention:** if multiple writers need concurrent index writes (currently: one Action committer, one Vercel reader — no contention).

None are realistic inside the next 90 days. The migration path is preserved in spec §12 as the Phase 2 trigger.

## Consequences

**Easier:**

- A fork of the repo produces a working `/ask` immediately — no Vercel Blob, no Postgres, no external secrets. Forkability is a property of the architecture, not a feature to build.
- The index is grep-able, diff-able, git-revertable. Operational debugging benefits from the same tools that cover the markdown archive.
- Cost stays at €0 for the day-0–60 window (within free Gemini quota); ≤€15/mo projected at day-60+ traffic vs §2.3's €50 cap.
- ADR-0007's "markdown canonical, derived index" principle holds with no architectural rewrite — Phase 1 vs Phase 2 boundary blurs into a continuous line.

**Harder:**

- The Vercel deploy bundle inflates by ~10MB (the `data/_index/` payload). At ~10k chunks (~50MB) this approaches Vercel's function bundle ceiling — the upgrade trigger is also the bundle-size trigger.
- Bot-on-bot commits add deploy noise (an index commit triggers a Vercel auto-deploy that's a no-op for code). Initial v2 design tried to suppress this with `$VERCEL_GIT_PREVIOUS_SHA` path-filter; the spec dropped that filter (it inherits a known-broken approach from 0.1.1 under shallow clones). Redundant deploys are accepted; revisit if pain materializes.
- Index drift is possible (markdown changed but index stale during the ~30s Action runtime). Mitigation: `manifest.source_files_hash` mismatch detection at module init.

**Rolled back assumptions from ADR-0007:**

- ADR-0007 decision 3 said "Phase 2 adds Postgres + pgvector." This ADR amends that to: "Phase 1 (0.1.x) adds file-based index; Phase 2 *conditionally* migrates to Postgres + pgvector if migration triggers fire."

## Implementation

Implementation plan produced by `superpowers:writing-plans` → [`projects/gbrain/plan-0.1.2-ask-bundle.md`](../../projects/gbrain/plan-0.1.2-ask-bundle.md) (to be written next). Spec deltas land in `projects/gbrain/spec.md` §6, §12, §15, §20.

### Supersedes / amends

Amends ADR-0007 decision 3 (storage) and decision 1 (scope, regarding Phase boundary).

### Change control

Migration to Postgres requires a superseding ADR (not an amendment). Tuning the file-based index parameters (chunk size, K, cosine threshold, embedding model snapshot) is operational and does not require a new ADR — they are spec parameters documented in `projects/gbrain/spec.md` and tested via the §1 day-30 calibration gate.
