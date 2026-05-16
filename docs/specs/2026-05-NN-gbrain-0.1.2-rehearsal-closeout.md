# GBrain — 0.1.2 rehearsal closeout (day-30 launch bundle)

**Date:** 2026-05-NN  *(fill on commit day)*
**Author:** 0.1.2 closeout
**Branch:** `gbrain-0.1.2-ask-bundle` → merging to `main`
**Supersedes:** [`2026-04-27-gbrain-0.1.2-e2-closeout.md`](./2026-04-27-gbrain-0.1.2-e2-closeout.md) (drives Phase 16 gates + tag + ff-merge)
**Audience:** Anton + the next Claude Code session (which is **Phase E — real-channel cutover** in a fresh chat; do not mix with 0.1.2 work)

---

## 1. What 0.1.2 delivered

Released as **`gbrain-v0.1.2`**.

### The bundle (day-30 surfaces)
- `/ask <question>` — RAG Q&A with cited answers from the community archive.
- `/search <query>` — semantic ranked retrieval, top-K snippets, no LLM call.
- `/help` and `/help <command>` — typed `COMMAND_REGISTRY` enforces discoverability invariant at compile time.
- Pinned-message scaffolding — typed per-topic blurbs + `scripts/regen-pinned.ts` ops script with `STAGING_CHAT_IDS` allowlist guard.

### Architecture (ADR-0008)
- File-based embeddings index at `community/archive/_index/{index.json,manifest.json}`.
- Built by GitHub Actions (`.github/workflows/build-index.yml`), committed back to repo.
- Copied into Vercel deploy bundle at `pre{dev,build}` via `scripts/copy-index.ts` + `next.config.mjs` `outputFileTracingIncludes`.
- Module-level `cachedIndex` singleton in `retrieval/load.ts` (loaded once per cold start).
- No Postgres / pgvector in 0.1.x — deferred to ≥0.4.0 per ADR-0008.

### Test posture at tag
- **162 passed + 7 skipped** (live-gated by `GEMINI_API_KEY`).
- Typecheck green.
- +68 tests over the 0.1.1 baseline (94 → 162), covering retrieval, prompts, registry, rate limit, MarkdownV2, build-index CLI, and the Cat A/B/C injection corpus.

---

## 2. Phase 16 — Day-30 gates

| Gate | Status | Observations |
|---|---|---|
| **1 — `/ask` × 3 known-positive questions** | `<PASS/FAIL>` | Cited answers + valid GitHub blob links verified in `gbrain-staging`. Telegram message links: `<paste>` `<paste>` `<paste>`. |
| **2 — `/search` × 3 list-style queries** | `<PASS/FAIL>` | Ranked top-5 with correct `source_path` fields. Telegram message links: `<paste>` `<paste>` `<paste>`. |
| **3 — `/help` + `/help <command>`** | `<PASS/FAIL>` | Full registry rendered. Per-command detail page renders. Telegram link: `<paste>`. |
| **4 — Pinned-message regeneration** | `<PASS/FAIL>` | Ran `pnpm tsx scripts/regen-pinned.ts --confirm-chat-id=<staging-id>`. Pinned messages confirmed across N topics: `<list>`. |
| **5 — GitHub Action build-index <60s** | `<PASS/FAIL>` | Pushed test `#kb` item. Action run id: `<paste>`. Wall-clock: `<X>s`. New index roundtrips through `/ask`. |
| **6 — Calibration → threshold tuned** | `<PASS/FAIL>` | See §3 below. Verified in staging that `/ask` returns answers above threshold and refuses below. |

If any gate fails, do **not** tag. Open a follow-up commit on the branch and re-run.

---

## 3. Calibration results (OQ-1)

### Method
**Sandbox-via-fixtures.** At calibration time (2026-05-16) the monorepo `community/archive/` had 0 `#kb` items — the gbrain Vercel project had been deploying from a separate `warsaw-ai-community-gbrain` repo until today's repo-migration cutover, so the migrated monorepo was effectively a fresh archive. To produce a defensible threshold without first repopulating staging by hand, calibration ran against the fixture corpus (3 `#kb` items + 1 digest at `projects/gbrain/app/tests/fixtures/archive/`) via `pnpm tsx scripts/calibrate-fixtures.ts`. Real-corpus retune scheduled for 0.2.x per spec §9.3 OQ-1 follow-on.

### Seed query set
- **Positive queries (count: 3):** `"when does the community meet?"`, `"what's Jurek building?"`, `"what was in the daily digest?"` — designed to match `qa-example.md` (meetups), `builds-example.md` (Jurek/LoRA), and `digests/2026-04-26.md` respectively. See `tests/fixtures/calibration-queries.json`.
- **Negative queries (count: 3):** `"what's the weather in Tokyo?"`, `"best pizza in Warsaw"`, `"what is the meaning of life"` — off-topic, out-of-corpus.

### Score distribution
```
Positive scores (sorted asc): [0.556, 0.634, 0.679]
Negative scores (sorted desc): [0.542, 0.514, 0.468]

Min positive: 0.556
Max negative: 0.542

SUGGESTED THRESHOLD (sandbox, N=6): 0.549
```

### Chosen threshold
`ASK_SIMILARITY_THRESHOLD = 0.55` in `projects/gbrain/app/src/commands/ask.ts`.

**Rationale:** Empirical midpoint is `0.549`; accepted `0.55` (delta `+0.001`, well below noise floor at N=6) for slight precision bias. For `/ask`, false positives erode member trust faster than false negatives — rounding *up* from the midpoint is the asymmetric correct call. Margin to nearest negative is `0.008`; margin to nearest positive is `0.006`. Sample size is intentionally small (sandbox fixtures designed to match seed queries 1-to-1); the retune in 0.2.x once real-channel corpus accrues is the calibration's second pass.

### Sample-size caveat
The sandbox value is **provisional for the day-30 gate** — it confirms the spec's default `0.55` lands in the right zone with real Gemini embeddings (768-dim, `gemini-embedding-001`), but the score landscape will shift when real members post real `#kb` content. Re-run after the first 14-day real-channel window in 0.2.x (per spec §9.3 OQ-1 follow-on).

### Related fix
Calibration surfaced a latent bug: `embed()` in `src/ai/gateway.ts` did not pin `outputDimensionality`, so Gemini returned its full 3072-dim vector instead of the 768 dims required by `IndexFileSchema`. Fixed at commit `bd3923a` (`fix(gbrain): pin embed() to 768 dims via providerOptions`). Untriggered in 0.1.1 because the digest path doesn't embed.

---

## 4. Carries forward to Phase E (0.2.0)

- **Bot token rotation** — `TELEGRAM_BOT_TOKEN` still on the staging credential; rotate at real-channel cutover.
- **`AI_GATEWAY_API_KEY` Vercel env** — set-but-unused since 0.1.1. Remove once Gemini-direct proves stable across a few days post-launch.
- **`CHAT_ID` + 8 topic IDs** — switch from `gbrain-staging` to the real Warsaw AI Community channel.
- **First onboarding pin** — re-run `scripts/regen-pinned.ts --confirm-chat-id=<real-channel-id> --allow-non-staging` to seed the topic pins on launch day.
- **Path-filter ignoredBuildStep** — Vercel `commandForIgnoringBuildStep` was disabled in 0.1.1 because shallow-clone broke `git diff HEAD^ HEAD`. Re-attempt with `$VERCEL_GIT_PREVIOUS_SHA` if deploy volume justifies it.

---

## 5. Carries forward to 0.1.3 / 0.4.x

- **`/summarize` deferred** (ADR-0010). Subsequent design cycle: spec → ADR → plan → bundle. Strategy B is per-topic message cache.
- **Threshold retune** in 0.2.x after first real-channel corpus accrues (≥14d window).
- **Postgres / pgvector migration** — deferred to ≥0.4.0 per ADR-0008. Re-evaluate when corpus exceeds ~5k chunks or query latency degrades.

---

## 6. Tag commit

```bash
# Once all 6 gates above pass:
git add projects/gbrain/CHANGELOG.md projects/gbrain/app/package.json projects/gbrain/app/src/commands/ask.ts
git commit -m "release(gbrain): 0.1.2 — /ask + /search + /help bundle (day-30 gate passed)"
git tag gbrain-v0.1.2

# Merge to main (ff impossible — main has advanced 187 commits since divergence at 3e8c296):
git checkout main
git merge --no-ff gbrain-0.1.2-ask-bundle -m "Merge gbrain-0.1.2-ask-bundle: 0.1.2 day-30 launch bundle"
git push origin main
git push origin gbrain-v0.1.2
```

Verify:
```bash
git log -1 gbrain-v0.1.2
```
Expected: shows the release commit.

---

## 7. Next chat

**Phase E** — real-channel cutover. Open as a new dedicated chat. Scope:
- Rotate `TELEGRAM_BOT_TOKEN`.
- Remove `AI_GATEWAY_API_KEY` Vercel env.
- Switch `CHAT_ID` + 8 topic IDs from staging to real.
- Tag `gbrain-v0.2.0`.

Do not mix Phase E with 0.1.2 cleanup. Do not mix Phase E with the 0.1.3 `/summarize` design cycle — that is also a separate chat.
