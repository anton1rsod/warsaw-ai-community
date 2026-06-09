# Collaboration Playbook

> How Anton + Yuriy (peer co-founders) and members work in this repo. Governance: `community/governance/governance.md` + ADR-0017.

## Ownership (DRI model)
- One **owner/driver (DRI)** per project — decides in their lane, consults freely.
- `PROJECTS.md` `Lead` = accountable DRI. Root `STATE.md` `Active drivers` = who's hands-on right now.
- Soft rule: **one driver per project at a time** — claim it in root `STATE.md` before starting.
- Anton + Yuriy are peer co-founders across the monorepo; **W.A.Y. is excepted** (separate repo).
- Tie-break: the project DRI decides; **founder-class** decisions (legal form, equity/IP, mission scope, or the decision-rights framework itself) → Anton, per ADR-0017.

## Branches & PRs
- Branch naming: `<type>/<project>-<short-topic>` — e.g. `feat/community-platform-v0-11-rsvp`, `chore/repo-foundation`. Types: feat, fix, chore, docs, refactor.
- **PR vs direct-to-main:** docs-only / meta-config (CI path-filter excludes them) → direct to `main`. Code touching CI-triggered paths or cross-cutting work → PR + review.
- Commits: conventional `<type>: <description>`; no attribution trailer; push after substantive commits.

## Resuming work
- Read order: root `STATE.md` → project `STATE.md` (or `CHANGELOG.md`) → latest handoff. Read directly.
- Pausing mid-task: write `docs/specs/<date>-<project>-<topic>-handoff.md` (≤80 lines: where we stopped · done/not-done/in-flight · pickup steps) and add a `Latest handoff:` line to root `STATE.md`.

## Keeping state honest (anti-staleness rule)
- **Bump a project's `CHANGELOG.md` / version ⇒ touch its `STATE.md` (gbrain: its `CHANGELOG.md`) in the same PR.** Update root `STATE.md` at each ship/phase gate.
- (Automating this check is parked in `BACKLOG.md`.)

## Members
- Read + PRs. Add yourself via the invitation flow or a PR to `community/members/roster.md` (opt-in). Pitch projects in Telegram `#Builds & Pitches`.
