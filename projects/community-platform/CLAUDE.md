# CLAUDE.md — Community Platform sub-project

This file auto-loads when Claude Code runs anywhere under `projects/community-platform/`. It establishes the read order so token usage stays predictable across chats.

## Read order for new chats

1. **`STATE.md`** — current snapshot (last green commit, blockers, next chat). ~30 lines.
2. **`CONSTRAINTS.md`** — locked rules, secret handling, auto policy, self-review checklist. ~80 lines.
3. **`phase-N-brief.md`** (where N is the phase this chat owns) — task list with file paths, amendments to apply this phase, closeout criteria. ~50 lines.
4. **`plan.md` line ranges** — only the ranges the phase brief points at. Don't read the whole 7700-line plan.
5. **Source files** — read as the work demands, not preemptively.

Skip `CHANGELOG.md` unless you specifically need history. CHANGELOG is canonical for history; STATE.md is the curated index for "right now."

## Companion artifacts in the monorepo

- `docs/playbooks/recurring-plan-defects.md` — patterns observed during Phases 0–9 that future plans should pre-empt. Read once if you're new to the project.
- `docs/specs/<date>-community-platform-phase-N-handoff.md` — per-chat handoffs. The latest one points to the active per-phase brief.

## What this project is

`projects/community-platform/` is the Warsaw AI Community's Lite-slice platform — auth + member directory + project / decision / meeting readers + status updates + GDPR mechanisms + admin health metric. v0.1 target: ship a working preview that 19 roster members can use to authenticate, browse community state, and post weekly status updates.

Stack: Next.js 16 + Vercel + GitHub OAuth + GitHub App (`warsaw-ai-bot`) for git writes. Storage: 100% git for v0.1.

See `README.md` for the project map; see `spec.md` for §1–§10 requirements; see `CONSTRAINTS.md` for what's locked.

## Update protocol

- `STATE.md` — every phase closeout, same commit as the CHANGELOG entry.
- `CONSTRAINTS.md` — only when locked rules change (which should be rare; if it happens, also write an ADR).
- `phase-N-brief.md` — once, before chat N starts. Stays as a record.
- `docs/playbooks/recurring-plan-defects.md` — append a new pattern when you observe one.

## What NOT to do

- Don't restate `CONSTRAINTS.md` content in handoffs. Reference instead.
- Don't restate `STATE.md` content in handoffs. Reference instead.
- Don't update `STATE.md` mid-chat unless the phase has actually closed. The "right now" snapshot is for known-good states only.
- Don't delete prior handoffs. They're history; rename or supersede instead.
