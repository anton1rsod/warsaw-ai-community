# ADR-0007: GBrain Phase 1 architecture decisions

**Status:** Accepted
**Date:** 2026-04-24
**Deciders:** Anton Safronov (founder)
**Related:** [projects/gbrain/spec.md](../../projects/gbrain/spec.md)

## Context

GBrain is the Warsaw AI Community's first sub-project (see [ADR-0004](0004-commercial-track-accelerated.md)). Phase 1 must ship in ≤ 2 months and prove value to a 19-member community before we invest in Phase 2's Q&A infrastructure. The brainstorming session that produced the Phase 1 spec made eight decisions that this ADR crystallises for future reference and due-diligence trails.

## Options considered

For each of the eight decisions, multiple options were explored in the brainstorming session. The ones chosen:

| # | Area | Chosen | Rejected (summary) |
|---|---|---|---|
| 1 | Scope | Archive + Digest (+ Q&A later) | Q&A-first; archive-only; digest-only |
| 2 | Phase order | Archive + Digest together → Q&A → broader digest | Three other orderings |
| 3 | Storage | Markdown-first in repo; derived pgvector index in Phase 2 | Git-native DB; external DB day 1; Telegram-native |
| 4 | Consent | Topic-pre-consent (formal topics) + author-confirm (casual topics) | Author-only; tag-and-notify; core-organizers-only |
| 5 | LLM | Gemini primary via Vercel AI Gateway, Claude + OpenAI as fail-over | Single-provider; self-hosted OSS |
| 6 | Runtime | Vercel (Fluid Compute + Cron), Next.js App Router | Cloudflare; Fly/Railway; self-hosted VPS; GitHub Actions |
| 7 | Bot identity | Single dedicated `@WarsawAIBrainBot` via BotFather | Userbot; two-bot split; MTProto |
| 8 | Phase 1 success bar | Community-tested (≥5 non-organizer adopters, ≥10 archives, 14+ daily digests, "useful" poll) | MVP-only; organizer-dogfood; commercial-grade |

## Decision

**Accept the eight decisions as recorded in `projects/gbrain/spec.md`.** Summary:

1. **Scope:** Phased — v0.1 ships Archive + Digest together; v0.2 adds Q&A; v0.3 is backlog.
2. **Storage:** Markdown files in this repo (`community/archive/YYYY-MM/`), derived Neon Postgres + pgvector index added in v0.2.
3. **Consent:** Deterministic rules engine mapping `(topic class, tags, author preferences)` to `{allow, require_confirm, deny}`. Formal topics pre-consent with 48h `#skip` window; casual topics require author DM confirmation.
4. **LLM:** Google Gemini (`2.0-flash` for digest, `1.5-pro`/latest for Q&A) accessed via Vercel AI Gateway, with Claude Sonnet + OpenAI GPT-4o-mini configured as fail-over.
5. **Runtime:** Vercel, Next.js App Router, `vercel.ts` config, Vercel Cron for daily digest.
6. **Bot:** `@WarsawAIBrainBot` (single, dedicated, BotFather-issued).
7. **Repo layout:** `projects/gbrain/app/` holds the Next.js project; Vercel "Root Directory" points there. Archive writes to `community/archive/` via a fine-grained GitHub bot token scoped to that path.
8. **Phase 1 gates:** ≥ 5 non-organizer members archive content, ≥ 10 archived items, digest posts 14+ consecutive days, quick poll rates digest "useful" by ≥ 3 members, onboarding doc exists. No critical incidents in final 7 days.

## Consequences

**Easier:**
- All eight choices reinforce each other — docs-first storage pairs with OSS-first license and git-native audit trail; Vercel runtime pairs with AI Gateway pairs with Cron; deterministic consent engine is auditable and testable.
- Phase 1 scope is narrow enough to ship in 2 months at target cost (< €20/mo).
- Phase 2 is a pure additive layer (Postgres index over same markdown) — no rewrite.
- Commercial-trajectory posture preserved — if GBrain-as-a-service becomes a product, the stack scales cleanly.

**Harder:**
- Standalone Vercel project means GBrain doesn't (yet) share a runtime with other future community projects. If a shared runtime ("platform") emerges later, GBrain will need a migration or dual-home phase.
- Consent rule correctness is load-bearing — a bug that archives a `#skip`-tagged message is a P0 incident.
- Markdown-as-canonical creates bot-authored commits in the main branch; acceptable for v0.1 but may warrant a separate branch or repo if volume exceeds comfortable PR noise.
- Dependency on Gemini API pricing; Vercel AI Gateway fail-over is our insurance against provider outage, not price hikes.

## Implementation

Implementation plan produced by `superpowers:writing-plans` → [`projects/gbrain/plan.md`](../../projects/gbrain/plan.md) (to be written next).

### Supersedes / amends

None. This is the first GBrain-specific ADR.

### Change control

Any change to one of the eight decisions requires a superseding ADR. Small adjustments (e.g., digest time of day, specific model version within Gemini family) do not require a new ADR — they are operational parameters documented in the spec and in `projects/gbrain/app/.env.example`.
