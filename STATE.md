# STATE — Warsaw AI Community (repo-wide)

> **What this is:** the portfolio-wide "right now" snapshot — updated at each ship/phase gate. Full board: [`PROJECTS.md`](PROJECTS.md). Member weekly status lives in `community/status/`.
> **Resume:** read this → the named project's `STATE.md` (or `CHANGELOG.md` for gbrain) → the latest handoff below. Read directly; don't invoke a resume skill.

**Last updated:** 2026-06-09

## Active drivers
- **Anton (DRI):** gbrain · community-platform · `pulse` (reports + Notion — P2 shipped; P3 automation next).
- **Yuriy (peer co-founder):** community ops — onboarding as peer co-founder (see ADR-0017).

## Hot now
- **`pulse`: P2 SHIPPED** (merged to `main` via PR #50, squash `87e2623`). Notion mirror (4 context DBs) + read-only Tasks export + monthly digest page, plan Tasks 12–21. 90 tests, 99.66% lines / 90.84% branches; all mock-based (no live Notion to build/test). Plan `docs/specs/2026-06-09-pulse-implementation-plan.md` (22 tasks / 3 phases). **Next: P3 (automation — `.github/workflows/pulse.yml`, plan Task 22).**
- Repo operating foundation SHIPPED 2026-06-09 (AGENTS.md, this STATE.md, ADR-0017, collaboration playbook, `_template` parity).
- **Anton's open items (non-blocking):** fill Yuriy's handles in `roster.md`; confirm per-project DRI; one-time Notion setup (`projects/pulse/SETUP.md`) before any live `pulse` mirror/export/digest run.

## Blockers
- None.

## Latest handoff
- _none active_ — `pulse` P2 shipped (PR #50). Next unit = **P3** (plan Task 22, `pulse.yml`); the plan is the contract, no separate handoff needed. Live `pulse` runs await Anton's one-time `projects/pulse/SETUP.md`.
