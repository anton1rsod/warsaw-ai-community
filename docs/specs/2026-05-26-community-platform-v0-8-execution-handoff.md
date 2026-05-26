# Handoff — Community Platform v0.8 execution (chat-43 → next chat)

**Date:** 2026-05-26 · **From:** chat-43 (v0.8 brainstorm + design + plan; shipped v0.7.0) · **For:** the implementation chat.

## What chat-43 did

- **Shipped v0.7.0.** Merged PR #41 (`cfaf576`), tagged `community-platform-v0.7.0`, flipped `STATE.md`. Prod auto-deployed (serving 200). **Anton-side visual prod smoke of the brand chrome (WARSAW chip / Geist nav / formal-entity masthead + footer) is still pending** — do it signed-in.
- **Designed + planned v0.8** (typography realignment + brand polish) via `superpowers:brainstorming` (with a visual-companion mockup pass) + a `gstack`-methodology design review.

## Your job: execute v0.8 via `superpowers:subagent-driven-development`

- **Plan:** `projects/community-platform/v0.8.0-plan.md` (9 phases, ~18 TDD tasks, exact code + verified test paths).
- **Design (canonical):** `docs/specs/2026-05-26-community-platform-v0-8-typography-ui-ux-design.md`.
- Anton chose **subagent-driven-development** (fresh agent per task, review between).

## Locked decisions (don't re-litigate)

1. Headlines → **Geist SemiBold 600**, tight tracking, trailing **em-dash** recolored amber (periods stay ink).
2. Accent / empty-state lines → **JetBrains Mono, dust** ("system voice").
3. Density → **footer pinned** (`flex-1` wrapper in `RootShell`); content anchored top.
4. Favicon / PWA → **amber-field S** (byte-swap from `community/brand/exports/symbol/`).
5. Token: keep `font-display` (repointed to Geist); retire the `geist` token.

## Critical: the plan is already reconciled against merged #41

`main` now has Geist loaded (400/500/600, `--font-geist`) + a `geist` Tailwind token (Header nav + masthead). **Phase 1 of the plan is rewritten for this base** — Task 1.1 removes Fraunces only; Task 1.2 consolidates `display`→Geist + retires the `geist` token. **Task 4.1 must re-read the #41-restructured `Footer.tsx`.** Phases 2/3/5/6 (content components, RootShell, favicon) were untouched by #41 — verify line numbers, they hold. See the plan's "⚠️ Post-#41 reconciliation" callout.

## Guardrails (from GOTCHAS / this project)

- Tests live in `tests/unit/` (NOT co-located). Run the **full** suite (`pnpm test -- --run`), never narrow globs — stale-string failures cascade.
- `pnpm tsc --noEmit` (not `build`) while iterating. Baseline ≈ 1216 tests green; keep ≥80% coverage.
- Ships via PR + tag `community-platform-v0.8.0`. Closeout (Phase 9): fold `spec.md` **§18** + CHANGELOG `[0.8.0]` + flip STATE.
- `package.json` stays `0.0.1` (this project versions via git tags) — no bump.
- Verify gates (Phase 7): grep no `Fraunces`, no `italic` on display/voice surfaces; dust-on-cream AA 4.5:1 for the mono accent sizes.

## Read order for the next chat

1. This handoff.
2. `projects/community-platform/STATE.md` (v0.7.0 shipped snapshot).
3. `projects/community-platform/v0.8.0-plan.md` (the plan — start at the reconciliation callout, then Phase 1).
4. `docs/specs/2026-05-26-community-platform-v0-8-typography-ui-ux-design.md` (design, if you need the "why").
