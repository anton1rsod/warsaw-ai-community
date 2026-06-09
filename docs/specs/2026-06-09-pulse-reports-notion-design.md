# Pulse — Reports + Notion PM — Design Spec

**Date:** 2026-06-09
**Status:** Draft (pending founder review)
**Author:** Anton Safronov (with Claude Code)
**Scope:** A standalone ops sub-project that mirrors repo data one-way into read-only Notion context databases and generates periodic digest reports. The fast-follow to the repo operating foundation.
**Related:** `docs/specs/2026-06-09-repo-operating-foundation-design.md` (§2.4 / L10 built-to-feed constraint), `community/cadence.md` (monthly review ritual), `docs/playbooks/collaboration.md`, `BACKLOG.md`.

---

## §0 — Context & goal

The foundation made the repo the single source of truth with consistently-structured `PROJECTS.md` / `STATE.md` / `CHANGELOG.md` + community-platform's committed JSON aggregates. This sub-project turns that data into (a) **automated reports to leaders** and (b) a **professional Notion PM surface** — without coupling to the member-facing platform.

**Goal:** Anton + Yuriy open Notion and see live, interactive dashboards of project status, decisions, shipping, and engagement (mirrored from the repo, never stale), and manage their **task board natively in Notion** — while a generated monthly review lands in the repo on cadence.

**Validated against 2026 standards** (see §7). The architecture — *git = system of record, Notion = system of engagement, one-way mirror, split source-of-truth by data type* — is a recognized pattern (Red Hat, Harness, Temporal/Notion).

---

## §1 — Locked decisions

| # | Decision | Rationale |
|---|---|---|
| **L1** | **Standalone sub-project `projects/pulse/`** (name placeholder), scaffolded from `_template/`. TS + `tsx` + Zod + `@notionhq/client@^5.x`; own `package.json`. Reads repo canonical markdown + community-platform's **committed** `lib/__generated__/*.json` as data (no code import → no hard coupling). | Clean separation (leader/PM tooling vs member app) while reusing existing aggregates. |
| **L2** | **Split source-of-truth by data type.** Repo = system of record → one-way mirror into **read-only** Notion context DBs. Notion = system of engagement → **native Tasks board**. No two-way sync. | The recognized SSoT pattern; avoids fragile bidirectional sync. |
| **L3** | **Notion DBs:** mirrored read-only — **Projects, Decisions (ADRs), Shipping Log, Engagement**; Notion-native — **Tasks**. The integration token is shared with the 4 context DBs **only** — never the Tasks DB (boundary enforced at the permission layer). | The sync structurally cannot touch the human-owned board. |
| **L4** | **Notion mechanism (corrected for the 2025-09-03 API):** pin `@notionhq/client@^5.x` (API `2025-09-03`). Resolve `database_id → data_source_id` once at setup; use `dataSources.query()` + `parent: { type: "data_source_id", data_source_id }`. Idempotent upsert = query-by-external-id → update-or-create. `notion-index.json` = `{ "<sourceKey>": { "pageId": "...", "dataSourceId": "..." } }`. Throttle with `p-limit` (≤2–3 req/s) + exponential backoff honoring `Retry-After` on 429/529. | Notion split databases (containers) from data sources (tables); `database_id` writes break silently once a DB gains a 2nd data source. No native upsert; 3 req/s, no bulk endpoint. |
| **L5** | **Reports:** monthly review → `docs/playbooks/monthly-review.md` (fills the `cadence.md` ritual) + a Notion digest page. Weekly "what shipped" digest + Telegram push are **optional** (Phase 3). Telegram uses a small standalone wrapper (no community-platform import). | Derived, never authored; fills an already-specified cadence gap. |
| **L6** | **Automation:** new `.github/workflows/pulse.yml` (additive; `ci.yml`/`gbrain-ci.yml` untouched). On-push to `main` **path-filtered** to data files → mirror. `workflow_dispatch` + cron weekly `30 9 * * 1` + monthly `30 9 1 * *` → digests (off the top-of-hour peak; dispatch co-trigger so a dropped fire is re-runnable). `concurrency: { group: pulse-mirror, cancel-in-progress: false }`. Write generated files back with **`GITHUB_TOKEN`** + `[skip ci]`; `paths-ignore` the generated output. | GH `schedule` is best-effort (drops/delays; monthly = 12 fires/yr); `GITHUB_TOKEN` commits don't re-trigger workflows → no loop; queue-not-cancel avoids partial writes. |
| **L7** | **Secrets:** `NOTION_TOKEN` + each context-DB id as GitHub **repo secrets** (ids out of plaintext YAML); token scoped to the 4 context DBs only; ~90-day rotation reminder. Workflows run on push-to-`main` + schedule (not fork PRs) → public-repo safe. | Notion has no OIDC; scoped static token in secrets is the norm. |
| **L8** | **Fail loud + observability:** Zod-validate **every** input at startup; **throw** on shape mismatch (loud CI failure, not silent garbage in Notion). Write `last_synced_at` into Notion each run; notify on workflow failure. Mirror **overwrites computed fields every run** (accidental hand-edits to read-only DBs are transient). Absent token/file → logged no-op (graceful degrade, like `telegram-notify`). | The top silent-failure risk is an upstream JSON shape change; convert it to a loud failure. |
| **L9** | **One-time setup runbook** (`projects/pulse/SETUP.md`): create the dedicated Notion space + 5 DBs (via the Notion connector/MCP interactively or manually), create the internal integration, share the 4 context DBs, capture token + ids into GH secrets, seed `notion-index.json` data_source_ids. | MCP needs interactive auth (unavailable in Actions); runtime uses the token. |
| **L10** | **Phasing:** P1 core + monthly review (no Notion dep) → P2 Notion mirror → P3 automation + delivery. | Lands value before external dependency; de-risks. |

---

## §2 — Component design (small, testable units)

```
projects/pulse/
├── package.json                 # tsx + zod + @notionhq/client@^5 + p-limit
├── SETUP.md                     # one-time Notion runbook (L9)
├── notion-index.json            # { sourceKey: { pageId, dataSourceId } } (committed)
├── lib/
│   ├── sources/                 # typed parsers (Zod), one per source — fail-fast (L8)
│   │   ├── portfolio.ts         # PROJECTS.md → Project[]
│   │   ├── states.ts            # root + projects/*/STATE.md → drivers, hot-now
│   │   ├── decisions.ts         # docs/decisions/*.md → Adr[]
│   │   ├── shipping.ts          # projects/*/CHANGELOG.md + git tags → Release[]
│   │   └── engagement.ts        # community-platform JSON + community/status + events + roster → Engagement[]
│   ├── notion/
│   │   ├── client.ts            # v5 client; database_id → data_source_id resolution
│   │   ├── upsert.ts            # query-by-external-id → update|create; throttle + backoff
│   │   └── index-store.ts       # read/write notion-index.json
│   └── reports/
│       ├── monthly.ts           # → docs/playbooks/monthly-review.md + Notion digest page
│       └── weekly.ts            # optional "what shipped"
├── scripts/
│   ├── sync-notion.ts           # mirror the 4 context DBs
│   └── build-report.ts          # --period=monthly|weekly
└── tests/                       # vitest; mock @notionhq/client
```

Each `lib/sources/*` parser: one responsibility, Zod-typed output, independently testable, no Notion dependency. `lib/notion/*` depends only on typed structs. Reports depend on sources, not on Notion.

---

## §3 — Notion database schemas (proposed; lock in plan)

- **Projects** (mirror): `Name` (title), `Status` (select: Proposed/In design/Building/Live/Archived), `DRI` (select), `Version`, `Current focus`, `Next gate`, `Repo path`, `last_synced_at` (date).
- **Decisions** (mirror): `ADR` (title, e.g. `ADR-0017`), `Title`, `Status` (select), `Date`, `Link` (url), `last_synced_at`.
- **Shipping Log** (mirror): `Version` (title), `Project` (select), `Date`, `Summary`, `last_synced_at`.
- **Engagement** (mirror): `Member` (title), `Contributions` (number), `Kudos` (number), `Last status week`, `Events attended` (number), `last_synced_at`.
- **Tasks** (Notion-native, **not** mirrored): `Name`, `Status`, `Assignee` (Anton/Yuriy), `Project` (relation → Projects), `Priority`, `Due`. Humans own it.

External-id key per mirrored row: a stable slug (e.g. project slug, `ADR-NNNN`, `project@version`, member handle).

---

## §4 — Data flow

```
repo markdown + community-platform JSON
        │  (lib/sources, Zod fail-fast)
        ▼
   typed structs ───────────────► lib/notion/upsert (throttled, idempotent)
        │                                   │
        │                                   ▼
        │                         Notion context DBs (read-only, last_synced_at)
        ▼
   lib/reports ─► docs/playbooks/monthly-review.md + Notion digest page (+ optional Telegram)

Notion Tasks DB ── native (Anton/Yuriy author) ── read by dashboards alongside mirrored DBs
```

---

## §5 — Tech & testing

TS + `tsx` + Zod + `@notionhq/client@^5` + `p-limit`. **TDD** on `lib/sources/` (parse fixtures → typed structs; malformed → throws) and `lib/notion/upsert.ts` (mock the client: create-when-absent, update-when-present, no-dupes-on-rerun, 429 backoff). **≥80% coverage on `lib/`.** `tsc --noEmit` + eslint clean.

---

## §6 — Phasing

1. **Core + monthly review** — scaffold `projects/pulse/` from `_template/`; `lib/sources/*` parsers + tests; `build-report.ts --period=monthly` → `docs/playbooks/monthly-review.md`. **Zero Notion dependency**, immediately useful.
2. **Notion mirror** — `SETUP.md` runbook; dedicated space + 5 DBs + integration; `lib/notion/*` (v5 data-source, upsert, index) + `notion-index.json`; `sync-notion.ts`. Idempotent re-run verified.
3. **Automation + delivery** — `.github/workflows/pulse.yml` (on-push mirror + cron/dispatch digests, concurrency + GITHUB_TOKEN write-back); `last_synced_at` + failure notify; optional weekly digest + Telegram push.

---

## §7 — Standards validation (2025–2026)

| Choice | Verdict | Source |
|---|---|---|
| Split SoT (git=record, Notion=engagement, one-way) | ✅ recognized pattern | [Red Hat SSoT](https://www.redhat.com/en/blog/single-source-truth-architecture) · [Harness](https://walkinglabs.github.io/learn-harness-engineering/en/lectures/lecture-03-why-the-repository-must-become-the-system-of-record/) · [Temporal/Notion sync](https://dev.to/temporalio/sync-github-repos-to-notion-142n) |
| `@notionhq/client` v5 + **data_source_id** | ⚠️ corrected (L4) | [Notion upgrade 2025-09-03](https://developers.notion.com/docs/upgrade-guide-2025-09-03) |
| Query-then-upsert + index (no native upsert) | ✅ canonical | [API request limits](https://developers.notion.com/reference/request-limits) |
| Internal token + GH secret, no OIDC | ✅ correct | [Notion integration](https://developers.notion.com/docs/create-a-notion-integration/) · [GH OIDC](https://docs.github.com/en/actions/concepts/security/openid-connect) |
| GH `schedule` best-effort → `workflow_dispatch` + `:30` | ✅ mitigated (L6) | [GH schedule docs](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#schedule) |
| `concurrency` queue + `GITHUB_TOKEN` write-back | ✅ standard | [GH concurrency](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency) |

---

## §8 — Out of scope / parked

- Member-facing dashboards (this is leader/PM-facing); two-way sync (rejected).
- `_schemaVersion` field on community-platform's generated JSON — strengthens L8 fail-fast; **parked** to avoid editing another sub-project now (pulse Zod-validates shape regardless).
- Notion Workers hosted sync (requires Notion-hosted runtime; incompatible with the git-centric approach).

---

## §9 — Open questions

- **O1 — Name:** `pulse` ok, or prefer another slug (`ops`, `dashboard`, `command-center`, …)?
- **O2 — Weekly digest:** in v1 (Phase 3) or defer? Default: ship monthly first, weekly optional.
- **O3 — Notion DB field schemas (§3):** proposed; lock exact fields during plan-writing.
- **O4 — Engagement metrics:** which signals matter most (contributions, kudos, status streaks, event attendance)? Default to the four in §3.

---

## §10 — Success criteria

1. **P1:** `pnpm build-report --period=monthly` produces a correct `docs/playbooks/monthly-review.md` from real repo data; parsers Zod-validated, ≥80% coverage; malformed input throws.
2. **P2:** `pnpm sync-notion` mirrors the 4 context DBs; **re-run produces no duplicates** (idempotent); `notion-index.json` maps each row → `{pageId, dataSourceId}`; the Tasks DB is untouched (and not shared with the token).
3. **P3:** `pulse.yml` runs on path-filtered push + cron + `workflow_dispatch`; concurrency queues (never cancels mid-write); write-back via `GITHUB_TOKEN` causes no loop; `last_synced_at` visible in Notion; a forced failure fires the notification.
