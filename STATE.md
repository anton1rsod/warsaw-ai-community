# STATE — Warsaw AI Community (repo-wide)

> **What this is:** the portfolio-wide "right now" snapshot — updated at each ship/phase gate. Full board: [`PROJECTS.md`](PROJECTS.md). Member weekly status lives in `community/status/`.
> **Resume:** read this → the named project's `STATE.md` (or `CHANGELOG.md` for gbrain) → the latest handoff below. Read directly; don't invoke a resume skill.

**Last updated:** 2026-06-09

## Active drivers
- **Anton (DRI):** gbrain · community-platform · `pulse` (reports + Notion — **P3 shipped; plan 22/22 complete; live activation pending Anton's secrets**).
- **Yuriy (peer co-founder):** community ops — onboarding as peer co-founder (see ADR-0017).

## Hot now
- **Community Platform v0.11.0 — meeting signup: SHIPPED 2026-06-09** (ahead of the Thu **2026-06-11** meetup). Multi-use "meeting" invite QR (one projected code), revocable + soft-capped + ~4h expiry, full-jitter redemption CAS, `/welcome` first-use redirect (sidesteps the build-snapshot `/no-access` lag). PR #54 squash-merged at `2c79e90`; tag `community-platform-v0.11.0` pushed; ADR-0018 Accepted. Executed via `superpowers:subagent-driven-development` (one Sonnet implementer/phase, 6 phases); **1543 unit/int + 8/8 invitation E2E green**; reviewer triage 0C/0-exploitable; **orchestrator post-merge prod smoke 5-for-5** (signed-in /admin/invite renders the meeting panel with no RSC-serialization 500 + Mint/Revoke round-trip live on prod). **v0.11.1 fast-follows deferred:** persona upload/integration (→ now IMPLEMENTED, see below) · per-IP rate-limit (BotID/WAF) · signed fresh-member bridge cookie · persistent active-invite registry · meeting-token `iat` · revoke auto-retry. See `projects/community-platform/STATE.md` + CHANGELOG `[0.11.0]`.
- **Community Platform v0.11.1 — persona attach + rich card: IMPLEMENTED + PR #55 (draft) CI-green, 2026-06-10.** Bundle B (the v0.11.0-deferred persona fast-follow). Members self-attach a persona (paste/`.md` upload) with consent + a hide toggle; renders as a rich card (chips + body). subagent-driven (one Sonnet impl/phase, 5 phases, 18 commits); 1582 unit/int + `e2e/persona-attach` 2/2; security (mandatory H150) + ts + code review **0 CRITICAL** (2 HIGH fixed); `lib/persona.ts`+`lib/persona-editor.ts` 100%. ADR-0019 still **Proposed**. **⚠ Squash-merge HELD to the Fri 2026-06-12 post-meetup retro** (gates only Bundle A-vs-B priority). On merge → ADR-0019 Accepted + tag `community-platform-v0.11.1` + STATE flip + prod smoke. See the merge handoff under "Latest handoff" + CHANGELOG `[0.11.1]`.
- **`pulse`: P3 SHIPPED** (workflow merged dormant via PR #51 `14b7bb1` + dormant-commit fix PR #53 `e89a689`) — `.github/workflows/pulse.yml`: `mirror` (push → sync-notion) + monthly `digest` + nightly `snapshot` + `notify-failure`; +7 structural tests (97 total). **Plan complete: 22/22.** Merged dormant — the three scripts no-op without `NOTION_*` secrets; the dormant `mirror` run is **verified green in CI** ("no index changes", exit 0). **Next: live activation** — Anton sets the GitHub secrets (`SETUP.md` §5) on the paid Notion account, then §10.2/§10.3 verification.
- Repo operating foundation SHIPPED 2026-06-09 (AGENTS.md, this STATE.md, ADR-0017, collaboration playbook, `_template` parity).
- **Anton's open items (non-blocking):** fill Yuriy's handles in `roster.md`; confirm per-project DRI.
- **`pulse` live setup PAUSED** — internal Notion integrations need a paid plan; Anton will use a separate paid account. When ready: re-auth the connector (`/mcp`) against it, recreate the parent page + 5 DBs (DDL in `SETUP.md` §8) + Digests page, regenerate `.env.local` ids, then run the §10.2 live verification. A first structure was built on the current (free) account as a dry run.

## Blockers
- None.

## Latest handoff
- `docs/specs/2026-06-10-community-platform-v0-11-1-merge-handoff.md` — **next chat** (community-platform): **MERGE v0.11.1** (Bundle B — persona attach + rich card). Implementation is **DONE**: branch `chore/community-platform-v0-11-1-impl` (18 commits), **PR #55 OPEN as DRAFT, CI green**, 1582 unit/int + `e2e/persona-attach.spec.ts` 2/2, security (mandatory H150) + ts + code review **0 CRITICAL** (2 HIGH fixed, batched `2d0b5d3`), `lib/persona.ts`+`lib/persona-editor.ts` 100%. **⚠ Squash-merge GATED on the Fri 2026-06-12 post-meetup retro** (decides only whether Bundle A preempts B — low odds). On merge: ADR-0019 → Accepted, tag `community-platform-v0.11.1`, flip STATE, prod smoke. The implementation handoff (`…-v0-11-1-implementation-handoff.md`) is superseded. Reminders already scheduled (Thu 19:30 mint QR · Fri 10:00 retro+brainstorm).
- `docs/specs/2026-06-09-pulse-p3-handoff.md` — **P3 done** (PR #51, squash `14b7bb1`). No open AI-collaborator handoff; the only remaining step is Anton's one-time **live activation** (`projects/pulse/SETUP.md`) on the paid Notion account.
