# v0.9.1 execution handoff — forms/admin reskin + write-path E2E + E2E hygiene

**For the next chat.** Brainstorm + 2026-standards validation + spec §19.1 + `v0.9.1-plan.md` are DONE (chat-47). This chat *executes* the plan via `superpowers:subagent-driven-development`. It is not a re-design — scope/posture are locked.

## Read order
1. `projects/community-platform/STATE.md` — current = **v0.9.0 @ `6a804a0`**; 1362 tests; `dark:`=0. (Local `main` is ahead by the chat-47 docs commits — see **Push** below.)
2. This handoff.
3. `projects/community-platform/v0.9.1-plan.md` — **THE plan** (6 phases, bite-sized TDD steps, H104–H111). Reuses `v0.9.0-plan.md` conventions **C1–C6**; defines **C7** (form-field) / **C8** (modal, native `<dialog>`) / **C9** (metric-tile) inline.
4. `docs/specs/2026-05-27-community-platform-v0-9-1-forms-admin-design.md` — design rationale + the standards-validation appendix (native `<dialog>` decision, MSW backlog).
5. `spec.md` §19.1 — locked summary.
6. `CONSTRAINTS.md` / `GOTCHAS.md` / `HANDOFF_PROTOCOL.md` — once if new to the project.

## Execute
- **Branch:** `chore/community-platform-v0-9-1-forms-admin` off `main` HEAD.
- **`superpowers:subagent-driven-development`** — ONE Sonnet implementer per **phase** (not per micro-task — token discipline). 6 phases:
  1. `Pill` (`disabled` visual + `danger`) + StatusEditor/GdprPanel de-dup → **re-smoke heroes**.
  2. Member forms — incl. **ConsentModal → native `<dialog>`** (Task 2.1).
  3. Admin — health (C9), invite, events/new (`EventForm` heaviest).
  4. Write-path E2E mocks (`_test-rsvp-store` + `_test-thank-store` + forks + reset routes + un-skip).
  5. E2E hygiene (routing assertions → ADR-0012/0014; prod-gate `v0-4-shell`).
  6. Followup (`members/[slug]` `<code>`) + closeout.
- Full-suite verify (**C5**) at every phase boundary.

## Guards (carry from v0.9)
- **className-only** on auth/consent/RBAC/save/write **logic**. The only behavioral changes: ConsentModal → native `<dialog>` (Task 2.1, leaf component — `ConsentClient` logic untouched) + the **test-mode-guarded** mock forks (Phase 4 — prod double-guard `!isProductionRuntime() && isE2EMode()`, H109).
- **H98** `dark:`=0 must hold (fs-walk guard). **H103** one `main#main` + one `<h1>` per recipe page (extend `PAGES`).
- **Authenticated C6 smoke MANDATORY** on every new surface via `/api/test-auth` against a `NEXT_PUBLIC_E2E_MODE=1` dev server (handle `anton1rsod`; roster slug `anton-safronov`): cream/Geist/no-neutral-leak + soft-nav + hover + macOS-dark emulation. Watch `.prose-warm` overflow (the v0.9 `/projects/[slug] <pre>` bug). **Re-smoke the 4 hero surfaces** after the Pill change.
- **Pre-merge:** C5 + `pnpm build` + `pnpm e2e` honest-green + **3-lane reviewer triage** (security lane confirms mock forks can't fire in prod + no auth/RBAC/write logic moved) + authenticated smoke → PR → tag `community-platform-v0.9.1` → post-merge STATE flip.

## Read-and-confirm items (the plan names the exact file + transform — not placeholders)
`app/api/event-rsvp-state/route.ts` response shape (Phase 4 read-fork) · `EventRsvpButton` selected-state label + `ThankButton` post-click name + `/this-week` E2E seeding (Phase 4 un-skip) · `OnboardForm`/`InviteForm`/`EventForm` field inventories (Phases 2.4/3.2/3.3) · whether `pnpm h67:scan` flags the rewritten ConsentModal/GdprPanel copy (migrate to i18n only if so).

## Push (chat-47 left local commits — the harness classifier gated direct-to-main)
Local `main` is **ahead of `origin` by 3 docs commits** (`df93cd1` MSW backlog + plan + C-renumber). These are docs-only (matches `feedback_pr_vs_direct`). **Run `git push origin main`** before branching so the plan/spec/design are on `origin` for the execution chat (or push them however you prefer — they must reach `origin`).
