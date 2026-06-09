# STATE — pulse

> Updated at each ship/phase gate. Resume: read this → latest handoff in `docs/specs/`.

**Last updated:** 2026-06-09
**Owner / DRI:** Anton
**Status:** Built (dormant) — plan 22/22 complete
**Branch:** main (P3 #51 `14b7bb1` + dormant-commit fix #53 `e89a689`)

## What just happened
- **P3 SHIPPED** (Task 22, PR #51 squash `14b7bb1`): `.github/workflows/pulse.yml` — `mirror` (push → `sync-notion`) + `digest` (monthly cron `30 9 1 * *`) + `snapshot` (nightly cron `30 4 * * *`) + `notify-failure` (opens/comments a GH issue); `tests/unit/workflow.test.ts` (7 structural invariants). 97 tests; coverage 99.66% lines / 90.84% branches. **Merged dormant** — the three scripts no-op without `NOTION_*` secrets, so every job runs green until activated. **Plan complete: 22/22.**
- **Dormant-commit fix** (PR #53 squash `e89a689`): first post-merge runs caught a `git add` exit-128 on the not-yet-created index (the dormant case, under `bash -e`); gated each commit-back `git add` on `[ -f ]`. Dormant `mirror` run now **verified green in CI** (`sync-notion` no-ops → "no index changes" → exit 0). Issue #52 (auto-opened by the failing runs) closed.
- **P2** (Tasks 12–21, PR #50 squash `87e2623`): `lib/notion/*` + `scripts/{sync-notion,export-tasks,publish-digest}.ts` + `SETUP.md`. git→Notion mirror (4 context DBs) + read-only Tasks export + monthly digest. 90 tests; all mock-based.
- _P1 (Tasks 1–11):_ parsers + monthly review; `pnpm build-report --period=monthly` → `docs/playbooks/monthly-review.md`.

## What's next
- **Live activation (Anton, one-time):** set the 8 GitHub secrets (`SETUP.md` §5) on the paid Notion account; recreate the parent page + 5 DBs + Digests page (`SETUP.md` §8 DDL); regenerate `.env.local` ids. Then §10.2 (idempotent re-run = no dupes; read-only export) + §10.3 (workflow live smoke) verification + confirm the digest `replace_content` body shape. Activates with **zero further code**.
- Plan: `docs/specs/2026-06-09-pulse-implementation-plan.md` (complete — 22/22).

## Latest handoff
- `docs/specs/2026-06-09-pulse-p3-handoff.md` — P3 (plan Task 22): `.github/workflows/pulse.yml` + structural test. Build dormant; activates on Anton's GitHub secrets (paid account).
