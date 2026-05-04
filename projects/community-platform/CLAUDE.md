# CLAUDE.md — Community Platform sub-project

This file auto-loads when Claude Code runs anywhere under `projects/community-platform/`. It establishes the read order so token usage stays predictable across chats.

## Read order for new chats

1. **`STATE.md`** — current snapshot (last green commit, last verified state, blockers, next chat). ~110 lines. Includes a `Last verified` block listing state checks (env vars, OAuth callback, App install, etc.) and when they were last confirmed; if an entry is recent and your task doesn't depend on the surface, you can SKIP re-verifying.
2. **`CONSTRAINTS.md`** — locked rules, secret handling, auto policy, self-review checklist. ~85 lines.
3. **`GOTCHAS.md`** — operational patterns that bit prior chats (env, CLI, deploy, auth). ~105 lines. Read once if you're new to the project; reference by number from the per-phase brief when relevant.
4. **`HANDOFF_PROTOCOL.md`** — operating discipline every chat in this sub-project follows (hardening checklist, verify-before-claiming pitfalls, chat-brief template, output conventions, anti-patterns). ~150 lines. Read once per project; reference by section number from per-chat briefs.
5. **`phase-N-brief.md`** OR **`docs/specs/<date>-...-handoff.md`** (per-chat) — task list with file paths, scope, closeout criteria. ~80-150 lines.
6. **`plan.md` line ranges** — only the ranges the per-chat brief points at. Don't read the whole 7700-line plan.
7. **`spec.md` sections** — read specific §X.Y when the chat scope touches it. Don't pre-read full spec.
8. **Source files** — read as the work demands, not preemptively.

Skip `CHANGELOG.md` unless you specifically need history. CHANGELOG is canonical for history; STATE.md is the curated index for "right now."

**Total read budget:** ~500 lines is the sweet spot for context-window efficiency. STATE + CONSTRAINTS + GOTCHAS + HANDOFF_PROTOCOL + per-chat brief = ~530 lines. Above ~800 lines and the chat starts paying for stale-context overhead.

## Companion artifacts in the monorepo

- `docs/playbooks/recurring-plan-defects.md` — code-level patterns (regex, casts, fixtures, mocks). Pair with `GOTCHAS.md` (ops-level patterns) above.
- `docs/specs/<date>-community-platform-phase-N-handoff.md` — per-chat handoffs. The latest one points to the active per-phase brief.

## What this project is

`projects/community-platform/` is the Warsaw AI Community's Lite-slice platform — auth + member directory + project / decision / meeting readers + status updates + GDPR mechanisms + admin health metric. v0.1 target: ship a working preview that 19 roster members can use to authenticate, browse community state, and post weekly status updates.

Stack: Next.js 16 + Vercel + GitHub OAuth + GitHub App (`warsaw-ai-bot`) for git writes. Storage: 100% git for v0.1.

See `README.md` for the project map; see `spec.md` for §1–§10 requirements; see `CONSTRAINTS.md` for what's locked.

## Update protocol

- `STATE.md` — every phase closeout, same commit as the CHANGELOG entry. Includes the `Last verified` block — refresh entries when you re-verify or extend.
- `CONSTRAINTS.md` — only when locked rules change (which should be rare; if it happens, also write an ADR).
- `GOTCHAS.md` — append a row when you hit a non-obvious operational pattern that meets the criteria at the bottom of that file.
- `phase-N-brief.md` — once, before chat N starts. Stays as a record.
- `docs/playbooks/recurring-plan-defects.md` — append a code-level pattern when you observe one.

## What NOT to do

- Don't restate `CONSTRAINTS.md` content in handoffs. Reference instead.
- Don't restate `STATE.md` content in handoffs. Reference instead.
- Don't update `STATE.md` mid-chat unless the phase has actually closed. The "right now" snapshot is for known-good states only.
- Don't delete prior handoffs. They're history; rename or supersede instead.
