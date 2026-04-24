# GBrain

> Telegram-accessible knowledge base for Warsaw AI Community. A shared brain the community owns, feeds, and queries.

**Status:** Proposed — spec pending (next brainstorming cycle)
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

## Next step

This project's spec is the next brainstorming cycle. After the program-level spec is approved, we open a fresh brainstorming session for GBrain and save the result to [`spec.md`](spec.md).

## Links

- Spec: `spec.md` (to be written)
- Plan: `plan.md` (follows spec)
- Changelog: `CHANGELOG.md` (to be created)
- Related ADRs: TBD (expect one for ingestion consent model, one for stack choice)

## License

MIT. See [`../../LICENSE`](../../LICENSE).
