# v0.9 execution handoff — redesign completion (readers) + `dark:` landmine

**For the next chat.** Run `superpowers:subagent-driven-development` against `projects/community-platform/v0.9.0-plan.md`. **One Sonnet implementer per phase** (NOT per task — token discipline, v0.8 precedent); full-suite verification at each phase boundary.

## Read order
1. `projects/community-platform/STATE.md` — current = v0.8.1 @ `16c7e06`; **this cycle baseline = main @ `6921c34`, 1237 tests green**.
2. This handoff.
3. `projects/community-platform/v0.9.0-plan.md` — start at "Conventions & shared contracts" (C1 recipe / C3 token-map / C4 test template / C5 gates / C6 smoke), then the 6 phases.
4. `docs/specs/2026-05-27-community-platform-v0-9-redesign-completion-design.md` (canonical design) + `spec.md` §19 — only for the "why".
5. `CONSTRAINTS.md` / `GOTCHAS.md` / `HANDOFF_PROTOCOL.md` — once if new to the project.

## Branch & baseline
- **Branch:** `chore/community-platform-v0-9-redesign-impl` (created off main @ `6921c34`, pushed). `git checkout` it.
- Baseline: 1237 unit/integration green; coverage gate ≥80%. Ships as **v0.9.0** (forms/admin slice → v0.9.1).

## What & scope
Apply the locked v0.6→v0.8 warm system (cream/ink/dust + Geist/Inter/JetBrains + MonoLabel/Pill/ListItem/EventCard/EmptyState) to reader surfaces + `/login`; flip `darkMode "media"→"selector"` to kill the 27-file / 74-variant `dark:` landmine. Application, not invention.
- **IN:** `/calendar`, `/decisions`(+`[slug]`), `/meetings`(+`[slug]`), `/members`(+`[slug]`), `/this-week`, `/handbook`, `/projects`(+`[slug]`, finish), `/login` + reader-slice components.
- **OUT → v0.9.1:** `/me/edit`, `/consent`, `/onboard`, `/admin/*`, `/no-access` + their components + write-path E2E (all kept SAFE by the Phase-1 flip).

## Phases (detail in the plan)
1. **Foundation:** `darkMode:"selector"` (H97) + `Tag` reskin (H100) + `Pill` ≥24px WCAG 2.2 SC 2.5.8 (H101) + `/events/[slug]` dark cleanup + `.prose-warm` + recipe.
2. **Reader indexes** (6) + `StatusEditor`.
3. **Reader details + handbook** (5) + host components (`.prose-warm`).
4. **`/login`** (AA-safe CTA — not `text-white` on amber).
5. **Per-slice E2E** + a11y sweep extension (H102).
6. **`dark:` final sweep** (H98, hermetic fs-walk test) + recipe a11y guard (H103) + closeout.

## Guards
- **C5** (every phase boundary): `pnpm test` + `tsc --noEmit` + `lint` + `h67:scan`.
- **C6 visual smoke** per surface: `goto` + **soft-nav `browser_click`** a Header nav link + **`browser_hover`** cards/buttons (per `feedback_visual_smoke_soft_nav_hover` — NOT just a screenshot; test in macOS dark mode too).
- All surface work is **className-only** — do NOT touch auth/data/form logic (esp. force-dynamic `/this-week`, `/members/[slug]`).

## Pre-merge
- H98 fs-walk test green (zero `dark:` in `app/`); full `pnpm e2e` green.
- **3-lane reviewer triage** (`typescript-reviewer` + `code-reviewer` + `security-reviewer`).
- **Re-smoke the 4 hero surfaces** (`/`, `/home`, `/events`, `/events/[slug]`) for the `Pill` 24px height delta (D5 blast radius).
- PR → on merge: tag `community-platform-v0.9.0` → flip `STATE.md` post-merge (same commit as CHANGELOG).
