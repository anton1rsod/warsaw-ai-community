# STATE — Warsaw AI Community (repo-wide)

> **What this is:** the portfolio-wide "right now" snapshot — updated at each ship/phase gate. Full board: [`PROJECTS.md`](PROJECTS.md). Member weekly status lives in `community/status/`.
> **Resume:** read this → the named project's `STATE.md` (or `CHANGELOG.md` for gbrain) → the latest handoff below. Read directly; don't invoke a resume skill.

**Last updated:** 2026-06-09

## Active drivers
- **Anton (DRI):** gbrain · community-platform · `pulse` (reports + Notion — **P3 shipped; plan 22/22 complete; live activation pending Anton's secrets**).
- **Yuriy (peer co-founder):** community ops — onboarding as peer co-founder (see ADR-0017).

## Hot now
- **Community Platform v0.11.0 — meeting signup: SHIPPED 2026-06-09** (ahead of the Thu **2026-06-11** meetup). Multi-use "meeting" invite QR (one projected code), revocable + soft-capped + ~4h expiry, full-jitter redemption CAS, `/welcome` first-use redirect (sidesteps the build-snapshot `/no-access` lag). PR #54 squash-merged at `2c79e90`; tag `community-platform-v0.11.0` pushed; ADR-0018 Accepted. Executed via `superpowers:subagent-driven-development` (one Sonnet implementer/phase, 6 phases); **1543 unit/int + 8/8 invitation E2E green**; reviewer triage 0C/0-exploitable; **orchestrator post-merge prod smoke 5-for-5** (signed-in /admin/invite renders the meeting panel with no RSC-serialization 500 + Mint/Revoke round-trip live on prod). **v0.11.1 fast-follows deferred:** persona upload/integration · per-IP rate-limit (BotID/WAF) · signed fresh-member bridge cookie · persistent active-invite registry · meeting-token `iat` · revoke auto-retry. See `projects/community-platform/STATE.md` + CHANGELOG `[0.11.0]`.
- **`pulse`: P3 SHIPPED** (workflow merged dormant via PR #51 `14b7bb1` + dormant-commit fix PR #53 `e89a689`) — `.github/workflows/pulse.yml`: `mirror` (push → sync-notion) + monthly `digest` + nightly `snapshot` + `notify-failure`; +7 structural tests (97 total). **Plan complete: 22/22.** Merged dormant — the three scripts no-op without `NOTION_*` secrets; the dormant `mirror` run is **verified green in CI** ("no index changes", exit 0). **Next: live activation** — Anton sets the GitHub secrets (`SETUP.md` §5) on the paid Notion account, then §10.2/§10.3 verification.
- Repo operating foundation SHIPPED 2026-06-09 (AGENTS.md, this STATE.md, ADR-0017, collaboration playbook, `_template` parity).
- **Anton's open items (non-blocking):** fill Yuriy's handles in `roster.md`; confirm per-project DRI.
- **`pulse` live setup PAUSED** — internal Notion integrations need a paid plan; Anton will use a separate paid account. When ready: re-auth the connector (`/mcp`) against it, recreate the parent page + 5 DBs (DDL in `SETUP.md` §8) + Digests page, regenerate `.env.local` ids, then run the §10.2 live verification. A first structure was built on the current (free) account as a dry run.

## Blockers
- None.

## Latest handoff
- `docs/specs/2026-06-09-community-platform-v0-11-0-implementation-handoff.md` — **DONE** (v0.11.0 SHIPPED at `2c79e90`, tag pushed, prod smoke green). No open community-platform handoff; the next scope is the v0.11.1 fast-follows (persona upload · rate-limit · fresh-member bridge cookie · active-invite registry) — start a fresh brainstorm→spec→plan when picked up.
- `docs/specs/2026-06-09-pulse-p3-handoff.md` — **P3 done** (PR #51, squash `14b7bb1`). No open AI-collaborator handoff; the only remaining step is Anton's one-time **live activation** (`projects/pulse/SETUP.md`) on the paid Notion account.
