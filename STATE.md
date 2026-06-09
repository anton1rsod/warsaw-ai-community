# STATE — Warsaw AI Community (repo-wide)

> **What this is:** the portfolio-wide "right now" snapshot — updated at each ship/phase gate. Full board: [`PROJECTS.md`](PROJECTS.md). Member weekly status lives in `community/status/`.
> **Resume:** read this → the named project's `STATE.md` (or `CHANGELOG.md` for gbrain) → the latest handoff below. Read directly; don't invoke a resume skill.

**Last updated:** 2026-06-09

## Active drivers
- **Anton (DRI):** gbrain · community-platform · `pulse` (reports + Notion — **P3 shipped; plan 22/22 complete; live activation pending Anton's secrets**).
- **Yuriy (peer co-founder):** community ops — onboarding as peer co-founder (see ADR-0017).

## Hot now
- **Community Platform v0.11.0 — meeting signup: READY TO EXECUTE** (Thu **2026-06-11** meetup). Brainstorm → spec (`spec.md §21`, R1–R7 / H123–H137) → plan (`v0.11.0-plan.md`, 6 phases / 18 tasks, real code per step) → ADR-0018 all DONE this chat. Multi-use "meeting" invite QR (one projected code), revocable + soft-capped + ~4h expiry, full-jitter redemption CAS, welcome-redirect first-use (sidesteps the build-snapshot `/no-access` lag). Validated vs 2026 best practices (OWASP / AWS backoff+jitter / Slack-Discord invite controls / quishing / CVE-2025-29927). **Next chat EXECUTES via `superpowers:subagent-driven-development`** (one Sonnet implementer/phase). Persona upload + rate-limit + fresh-member bridge deferred to v0.11.1. Handoff: `docs/specs/2026-06-09-community-platform-v0-11-0-implementation-handoff.md`.
- **`pulse`: P3 SHIPPED** (workflow merged dormant via PR #51 `14b7bb1` + dormant-commit fix PR #53 `e89a689`) — `.github/workflows/pulse.yml`: `mirror` (push → sync-notion) + monthly `digest` + nightly `snapshot` + `notify-failure`; +7 structural tests (97 total). **Plan complete: 22/22.** Merged dormant — the three scripts no-op without `NOTION_*` secrets; the dormant `mirror` run is **verified green in CI** ("no index changes", exit 0). **Next: live activation** — Anton sets the GitHub secrets (`SETUP.md` §5) on the paid Notion account, then §10.2/§10.3 verification.
- Repo operating foundation SHIPPED 2026-06-09 (AGENTS.md, this STATE.md, ADR-0017, collaboration playbook, `_template` parity).
- **Anton's open items (non-blocking):** fill Yuriy's handles in `roster.md`; confirm per-project DRI.
- **`pulse` live setup PAUSED** — internal Notion integrations need a paid plan; Anton will use a separate paid account. When ready: re-auth the connector (`/mcp`) against it, recreate the parent page + 5 DBs (DDL in `SETUP.md` §8) + Digests page, regenerate `.env.local` ids, then run the §10.2 live verification. A first structure was built on the current (free) account as a dry run.

## Blockers
- None.

## Latest handoff
- `docs/specs/2026-06-09-community-platform-v0-11-0-implementation-handoff.md` — **next chat** (community-platform): execute the v0.11.0 meeting-signup plan via `superpowers:subagent-driven-development` for the **Thu 2026-06-11** meetup. (Supersedes the 2026-06-09 brainstorm handoff — spec + plan + ADR-0018 now done.)
- `docs/specs/2026-06-09-pulse-p3-handoff.md` — **P3 done** (PR #51, squash `14b7bb1`). No open AI-collaborator handoff; the only remaining step is Anton's one-time **live activation** (`projects/pulse/SETUP.md`) on the paid Notion account.
