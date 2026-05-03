# Community Platform — Chat 6 (Phase 10: Pre-launch + ship) handoff

Lean handoff (v2). Replaces `2026-05-01-community-platform-phase-10-handoff.md` (v1) — the v1 inlined ~150 lines of state + constraints + risk-register that now live in `STATE.md` / `CONSTRAINTS.md` / `phase-10-brief.md`. Both versions remain in `docs/specs/` for comparison; v2 is the active one.

Paste the fenced block below into a fresh `auto`-mode Claude Code chat.

```
Community Platform v0.1 — Chat 6: Phase 10 (Pre-launch + ship)

================================================================
Read in order (each ~30–80 lines; total ~150 lines vs. v1's ~600+)
================================================================

1. projects/community-platform/STATE.md
   — last green commit, blockers, next chat. Single source of truth
     for "right now."

2. projects/community-platform/CONSTRAINTS.md
   — locked rules, secret handling, auto policy, self-review
     checklist. Stable across all chats.

3. projects/community-platform/phase-10-brief.md
   — this chat's 4 tasks with file paths, plan-ref line ranges,
     amendments to apply, closeout criteria.

4. docs/playbooks/recurring-plan-defects.md (skim if first time;
   skip if you've worked in this repo before — referenced by
   pattern number from the phase brief).

DO NOT pre-read CHANGELOG.md, plan.md, or execution-plan.md.
Read them only when phase-10-brief explicitly points at a line range,
or when actually working a specific task.

================================================================
This chat owns
================================================================

Phase 10 (4 tasks, ~0.5 day):
- 10.1 [D] — spec §8 acceptance verification log
- 10.2 — Lighthouse + perf
- 10.3 [H] — production deploy
- 10.4 [H] — tag v0.1.0 + PR to main + announce

Heavy Anton blockers on 10.3 + 10.4. Auto-execute 10.1 + 10.2; pause
before 10.3 / 10.4 per CONSTRAINTS.md "Auto policy."

================================================================
Hard prerequisites (read STATE.md "Blockers" before starting)
================================================================

- Task 4.1 [H] — warsaw-ai-bot env vars on production scope.
- Roster handle backfill — at least 5 members for §8 verification.

If either is unmet, do 10.1 + 10.2 and stop at 10.3 with a clear
"blocked on X" message. Don't try to deploy with placeholder creds.

================================================================
Done means
================================================================

- 10.1 verification log committed.
- 10.2 Lighthouse ≥ 90 on /home, /members, /this-week (or gap
  documented in CHANGELOG with reasoning).
- 10.3 production URL live; smoke-test green; README updated.
- 10.4 community-platform-v0.1.0 tag pushed; PR to main opened
  (and ideally merged); CHANGELOG flipped from [Unreleased] to
  [0.1.0].
- STATE.md updated: phase: "10 complete (v0.1.0 shipped)",
  next_chat: "none — v0.1 done."
- Memory project_community_platform.md updated to shipped state.
```

---

## Why this is leaner than v1

| Section v1 had inline | v2 location | Saved |
|---|---|---|
| State recap (~3 KB) | `STATE.md` | ~3 KB |
| Constraints + secret handling (~1 KB) | `CONSTRAINTS.md` | ~1 KB |
| Plan amendments to apply (~700 B) | `phase-10-brief.md` | ~700 B |
| Risk register (~700 B) | `phase-10-brief.md` | ~700 B |
| Self-review fallback (~1.5 KB) | `CONSTRAINTS.md` | ~1.5 KB |
| Token discipline (~1 KB) | `CONSTRAINTS.md` | ~1 KB |

Total inline savings: ~8 KB. The chat reads the same total information, but from purpose-fit artifacts instead of a monolithic prompt + a 285-line CHANGELOG sweep.

## Cache discipline (bonus)

Stable read order across chats (`CLAUDE.md → STATE.md → CONSTRAINTS.md → phase-N-brief.md`) lets Anthropic's prompt cache reuse the prefix between chats within a 5-minute window. Today's variable handoff structure misses this entirely.

## Comparison

To compare v1 vs v2 token cost:

```bash
wc -c docs/specs/2026-05-01-community-platform-phase-10-handoff.md
wc -c docs/specs/2026-05-03-community-platform-phase-10-handoff.md
wc -c projects/community-platform/STATE.md projects/community-platform/CONSTRAINTS.md projects/community-platform/phase-10-brief.md
```

v1 was 225 lines self-contained. v2 is ~75 lines + STATE.md (~75) + CONSTRAINTS.md (~120) + phase-10-brief.md (~80) = ~350 lines total — but those three companion artifacts are written ONCE and reused for every future chat. v1 would be re-authored for each chat (Phase 10 is one; future sub-projects would be many).

## Pattern carries forward

If Chat 6 ships clean, replicate the artifact set for any future sub-project:

- `projects/<name>/STATE.md`
- `projects/<name>/CONSTRAINTS.md`
- `projects/<name>/CLAUDE.md` (read-order pointer)
- `projects/<name>/phase-N-brief.md` per phase
- `docs/playbooks/recurring-plan-defects.md` (already monorepo-wide)
