# GBrain

> Telegram-accessible knowledge base for Warsaw AI Community. A shared brain the community owns, feeds, and queries.

**Status:** Spec drafted — awaiting founder review (see [`spec.md`](spec.md))
**Lead:** Anton Safronov
**Started:** 2026-04-24
**Telegram thread:** TBD

## What (v0 sketch — will be refined in the spec brainstorm)

- A Telegram bot accessible from within the Warsaw AI Community channel.
- Indexes community-approved content: meeting notes, guides, pitches, Q&A, news digests, projects.
- Exposes two modes: **ask** (natural-language query, RAG-style answer with citations) and **archive** (explicit `#kb` ingestion).
- Learns incrementally as the community ships content.

## Why

Right now, community knowledge lives in Telegram scroll-back. It's lossy, unsearchable at scale, and dies the moment someone new joins. GBrain turns conversation into durable, queryable memory — the community's actual asset.

## Phases

- **v0.1 (2 months):** Archive + Daily Digest. Telegram bot `@WarsawAIBrainBot`, Vercel runtime, Gemini via Vercel AI Gateway.
- **v0.2:** Q&A with RAG (Neon Postgres + pgvector as derived index over markdown).
- **v0.3:** Broader digest coverage (weekly, meetup-prep, per-topic).

See [`spec.md`](spec.md) for full design.

## Versioning

SemVer. `0.1.x` = pre-launch rehearsal. `0.2.x` = first real-channel soft launch + observation. `0.3.0+` = Phase 1 success gates met. `1.0.0` is reserved for a deliberate production-grade declaration. See [`CHANGELOG.md`](CHANGELOG.md) for the full version table and release log.

## Next step

Founder reviews [`spec.md`](spec.md). On approval, `writing-plans` produces [`plan.md`](plan.md).

## Links

- Spec: [`spec.md`](spec.md) *(drafted)*
- Plan: [`plan.md`](plan.md) *(follows spec approval)*
- Changelog: `CHANGELOG.md` (created on first release)
- Related ADRs: [0006 Secrets](../../docs/decisions/0006-secret-handling-and-rotation.md) · [0007 Phase 1 architecture](../../docs/decisions/0007-gbrain-phase-1-architecture.md)

## License

MIT. See [`../../LICENSE`](../../LICENSE).
