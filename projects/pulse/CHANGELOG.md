# Changelog

All notable changes to this project.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org/spec/v2.0.0.html) once shipped; until then, date-based entries are fine.

## [Unreleased]
- P2 (Notion mirror + Tasks export + digest page) and P3 (automation) — see the plan.

## [0.1.0] — 2026-06-09 — P1: repo parsers + monthly review

### Added
- Standalone `projects/pulse/` sub-project (TypeScript ESM + tsx + Zod + Vitest; pnpm). Relative imports only (no `@` alias — repo path has a space).
- `lib/types.ts` — domain Zod schemas (Project, Adr, Release, Engagement, Driver, RepoState) + Member.
- `lib/sources/*` fail-fast parsers: `repo-io`, `iso-week`, `portfolio` (PROJECTS.md), `states` (root STATE.md), `decisions` (docs/decisions index), `shipping` (CHANGELOG + tag-set helper), `engagement` (contributions/kudos/event-rosters/status/roster → 4 locked metrics).
- `lib/reports/monthly.ts` — deterministic monthly-review markdown builder.
- `scripts/build-report.ts` — `pnpm build-report --period=monthly` → `docs/playbooks/monthly-review.md` (weekly rejected per O2).
- 65 tests; coverage 100% lines / 90.35% branches (gate ≥80%). Zero Notion dependency.
