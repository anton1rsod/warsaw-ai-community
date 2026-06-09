# Changelog

All notable changes to this project.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org/spec/v2.0.0.html) once shipped; until then, date-based entries are fine.

## [0.3.0] — 2026-06-09 — P3: GitHub Actions automation

### Added
- `.github/workflows/pulse.yml` — additive automation (`ci.yml` / `gbrain-ci.yml` untouched): three event-gated jobs — `mirror` (push → `sync-notion`), `digest` (monthly cron `30 9 1 * *` → `publish-digest`), `snapshot` (nightly cron `30 4 * * *` → `export-tasks`) — plus a `notify-failure` job that opens-or-comments a GitHub issue. Push path filter on data files only; write-back targets (`notion-index.json`, `monthly-review.md`, `tasks-snapshot.json`) sit outside that filter and carry `[skip ci]` (no self-trigger loop); `concurrency: pulse` + `cancel-in-progress: false` (a cancelled run can't half-write Notion); two least-privilege tokens (`NOTION_TOKEN` mirror, `NOTION_READ_TOKEN` read-only export); all crons at `:30` (off the top-of-hour peak); manual `workflow_dispatch` with a `task` choice.
- `tests/unit/workflow.test.ts` — 6 structural invariants over the YAML (queue-not-cancel, all crons `:30`, push-path-filter + dispatch, `[skip ci]`, two tokens, failure notify). 96 tests total (+6); coverage 99.66% lines / 90.84% branches (gate ≥80%).

### Notes
- Merged **dormant**: the three scripts gracefully no-op without `NOTION_*` secrets, so every job runs green and does nothing until activation. Live activation needs **no further code** — Anton sets the GitHub secrets (`SETUP.md` §5) on his paid Notion account, then the §10.3 live smoke confirms first real runs.
- **Plan complete: 22/22 tasks.**

## [0.2.0] — 2026-06-09 — P2: Notion mirror + Tasks export + digest

### Added
- `SETUP.md` — one-time Notion runbook: two least-privilege integrations (mirror read+write → 4 context DBs + Digests page; export read-only → Tasks), 5 DBs, GitHub secrets, 90-day rotation.
- `lib/notion/client.ts` — `@notionhq/client` v5 factory + `resolveDataSourceId` (asserts exactly one data source); structural `MirrorClient`/`ExportClient`/`RetrievableClient` interfaces (fake-testable, no `vi.mock`).
- `lib/notion/throttle.ts` — `p-limit` concurrency + exponential backoff honoring `Retry-After` on 429/529 (injectable `sleep`).
- `lib/notion/index-store.ts` — `notion-index.json` read/write (Zod-validated, stable key order) + accumulator store.
- `lib/notion/mappers.ts` — struct → Notion properties per DB (O3 types locked; every row carries `External ID` rich_text + `last_synced_at` date).
- `lib/notion/upsert.ts` — idempotent query-by-`External ID` → update|create (re-run = no duplicates).
- `lib/notion/export-tasks.ts` — read-only paginated Tasks dump (write-incapable by type).
- `lib/notion/digest.ts` — create-or-reuse a monthly Notion page + overwrite its body via markdown.
- `scripts/{sync-notion,export-tasks,publish-digest}.ts` — thin orchestrators (testable core + `main()` that gracefully no-ops when Notion env is unset).
- +25 tests (90 total); coverage 99.66% lines / 90.84% branches (gate ≥80%). All mock-based — no live Notion needed to build/test.

### Notes
- Live `sync-notion` / `export-tasks` / `publish-digest` runs require Anton's one-time `SETUP.md` (tokens + DB ids + Digests page). §10.2 live verification is the follow-up.
- Digest body write uses `pages.updateMarkdown` `replace_content` (matched to `@notionhq/client@5.22.0` types); confirm exact body shape in the first live run.

## [0.1.0] — 2026-06-09 — P1: repo parsers + monthly review

### Added
- Standalone `projects/pulse/` sub-project (TypeScript ESM + tsx + Zod + Vitest; pnpm). Relative imports only (no `@` alias — repo path has a space).
- `lib/types.ts` — domain Zod schemas (Project, Adr, Release, Engagement, Driver, RepoState) + Member.
- `lib/sources/*` fail-fast parsers: `repo-io`, `iso-week`, `portfolio` (PROJECTS.md), `states` (root STATE.md), `decisions` (docs/decisions index), `shipping` (CHANGELOG + tag-set helper), `engagement` (contributions/kudos/event-rosters/status/roster → 4 locked metrics).
- `lib/reports/monthly.ts` — deterministic monthly-review markdown builder.
- `scripts/build-report.ts` — `pnpm build-report --period=monthly` → `docs/playbooks/monthly-review.md` (weekly rejected per O2).
- 65 tests; coverage 100% lines / 90.35% branches (gate ≥80%). Zero Notion dependency.
