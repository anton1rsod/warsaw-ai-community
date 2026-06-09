# STATE — Warsaw AI Community (repo-wide)

> **What this is:** the portfolio-wide "right now" snapshot — updated at each ship/phase gate. Full board: [`PROJECTS.md`](PROJECTS.md). Member weekly status lives in `community/status/`.
> **Resume:** read this → the named project's `STATE.md` (or `CHANGELOG.md` for gbrain) → the latest handoff below. Read directly; don't invoke a resume skill.

**Last updated:** 2026-06-09

## Active drivers
- **Anton (DRI):** gbrain · community-platform · `pulse` (reports + Notion — **P3 shipped; plan 22/22 complete; live activation pending Anton's secrets**).
- **Yuriy (peer co-founder):** community ops — onboarding as peer co-founder (see ADR-0017).

## Hot now
- **Community Platform — next work: meeting signup + persona integration** (Thu **2026-06-11** meetup). Members sign up via GitHub + attach their persona. Signup is already built **invite-gated**, so Thursday is mostly operational (invite flow for the room) + a persona upload/consent path; true open self-signup is a deliberate ADR-level call, not a rush. Next chat **starts with brainstorming**. Handoff: `docs/specs/2026-06-09-community-platform-meeting-signup-persona-handoff.md`.
- **`pulse`: P3 SHIPPED** (workflow merged dormant via PR #51 `14b7bb1` + dormant-commit fix PR #53 `e89a689`) — `.github/workflows/pulse.yml`: `mirror` (push → sync-notion) + monthly `digest` + nightly `snapshot` + `notify-failure`; +7 structural tests (97 total). **Plan complete: 22/22.** Merged dormant — the three scripts no-op without `NOTION_*` secrets; the dormant `mirror` run is **verified green in CI** ("no index changes", exit 0). **Next: live activation** — Anton sets the GitHub secrets (`SETUP.md` §5) on the paid Notion account, then §10.2/§10.3 verification.
- Repo operating foundation SHIPPED 2026-06-09 (AGENTS.md, this STATE.md, ADR-0017, collaboration playbook, `_template` parity).
- **Anton's open items (non-blocking):** fill Yuriy's handles in `roster.md`; confirm per-project DRI.
- **`pulse` live setup PAUSED** — internal Notion integrations need a paid plan; Anton will use a separate paid account. When ready: re-auth the connector (`/mcp`) against it, recreate the parent page + 5 DBs (DDL in `SETUP.md` §8) + Digests page, regenerate `.env.local` ids, then run the §10.2 live verification. A first structure was built on the current (free) account as a dry run.

## Blockers
- None.

## Latest handoff
- `docs/specs/2026-06-09-community-platform-meeting-signup-persona-handoff.md` — **next chat** (community-platform): brainstorm → spec → plan → implement member GitHub signup + persona integration for the **Thu 2026-06-11** meetup.
- `docs/specs/2026-06-09-pulse-p3-handoff.md` — **P3 done** (PR #51, squash `14b7bb1`). No open AI-collaborator handoff; the only remaining step is Anton's one-time **live activation** (`projects/pulse/SETUP.md`) on the paid Notion account.
