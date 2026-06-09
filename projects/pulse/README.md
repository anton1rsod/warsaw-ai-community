# Pulse — Reports + Notion PM

> Standalone ops sub-project that parses repo data into typed structs, generates a monthly review, and (P2+) mirrors four read-only context databases into Notion while snapshotting the Notion Tasks board back to git.

**Status:** Building
**Lead:** Anton Safronov
**Started:** 2026-06-09

Pulse turns the repo's structured data (`PROJECTS.md`, `STATE.md`, `docs/decisions/`, `CHANGELOG.md`, community-platform's committed JSON aggregates) into (a) automated periodic reports and (b) a professional Notion PM surface — without coupling to the member-facing platform. Architecture: git = system of record, Notion = system of engagement, one-way flows only.

See the design spec for full architecture, data sources, and phasing: [`docs/specs/2026-06-09-pulse-reports-notion-design.md`](../../docs/specs/2026-06-09-pulse-reports-notion-design.md).

## Links

- Spec: [`spec.md`](spec.md) (pointer to canonical design spec)
- Plan: [`plan.md`](plan.md) (pointer to canonical implementation plan)
- Changelog: [`CHANGELOG.md`](CHANGELOG.md)

## License

MIT unless stated otherwise. See [`../../LICENSE`](../../LICENSE).
