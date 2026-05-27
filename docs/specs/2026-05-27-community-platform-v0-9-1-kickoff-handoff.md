# v0.9.1 kickoff handoff — forms/admin reskin + write-path E2E + E2E hygiene

**For the next chat.** v0.9.0 (reader-redesign + `dark:` landmine) shipped. v0.9.1 finishes the warm-system rollout on the **write/admin** surfaces that v0.9 deliberately deferred, backfills the **authenticated write-path E2E**, and cleans up the **stale E2E specs** v0.9 surfaced. This is *not* a pre-written plan — start with a (brief) brainstorm, then spec → plan → implement.

## Read order
1. `projects/community-platform/STATE.md` — current = **v0.9.0 @ `67b4a98`** (main; tag `community-platform-v0.9.0` @ merge `6a804a0`); **1362 tests green; `dark:` in `app/` = 0**.
2. This handoff.
3. `projects/community-platform/V0_5_BACKLOG.md` — the v0.9.1 item (forms/admin + write-path E2E).
4. `docs/specs/2026-05-27-community-platform-v0-9-redesign-completion-design.md` + `spec.md` §19 — the **locked warm system + recipe** (reuse verbatim). `GOTCHAS.md` row 12 = darkMode `selector` note.
5. `CONSTRAINTS.md` / `HANDOFF_PROTOCOL.md` — once if new to the project.

## Baseline & what's already locked (reuse, don't re-invent)
- Warm tokens (cream/ink/dust/paper/accent + Geist/Inter/JetBrains), primitives (`MonoLabel` [now supports `as="h2"|"h3"`], `Pill` [≥24px], `ListItem`, `EventCard`, `EmptyState`, `Tag`, `Avatar`, `DateTime`).
- **Reader-page recipe (C1)** + **token-mapping (C3)** + **per-file source-scan test template (C4)** — all in `v0.9.0-plan.md` "Conventions & shared contracts". `.prose-warm` for markdown (with `<pre> overflow-x-auto`). H98 fs-walk + H103 invariant guards are live.
- **Form precedent already shipped in v0.9:** `StatusEditor` (`app/components/StatusEditor.tsx`) is the canonical reskinned form — `bg-paper`/`bg-cream-deep` field, `font-body text-ink` textarea, Pill-style `min-h-[24px]` submit/delete buttons, `text-alert` errors. Mirror it.

## v0.9.1 scope
1. **Forms/admin reskin** (className-only — these are still v0.1 neutral scaffolding; `dark:` already stripped by v0.9 Phase 6):
   - `app/me/edit/page.tsx` (+ `ProfileEditor.tsx` — note its markdown preview still uses no-op `prose prose-neutral` → migrate to `prose-warm`), `app/consent/ConsentClient.tsx` (+ `ConsentModal.tsx`), `app/onboard*` (multi-step?), `app/admin/health/page.tsx` (metrics display — needs its own treatment; has a residual `text-neutral-600`), `app/no-access/page.tsx`.
   - These need patterns the reader recipe didn't cover: input/textarea fields, **modal overlay** (ConsentModal), **admin metric tiles** (health). Brainstorm these (building on StatusEditor) before specing.
2. **Write-path E2E** — un-skip the v0.9 `e2e/v0-9-write-paths.spec.ts` authenticated cases (RSVP toggle / Thanks / status post). They were skip-gated because `rsvp-event.ts` + `thank-status.ts` call the real GitHub App with no in-memory E2E mock. Decide: add E2E-mode mocks for those write paths (like `_test-status-store.ts` does for status), or keep documented manual smoke.
3. **Stale-E2E-spec cleanup** — 9 specs are red locally (baseline-verified pre-existing, NOT v0.9 regressions): `smoke.spec.ts` + `auth.spec.ts`×3 + `consent.spec.ts` assert the **obsolete pre-ADR-0014 "everything → /login" routing model**; `v0-4-shell.spec.ts`×3 test **prod-only H56 Cache-Control** (designed for `PLAYWRIGHT_BASE_URL`=prod) + v0.6-era hero markup; `members.spec.ts:22`. Update assertions to current routing / gate prod-only specs behind an env flag so `pnpm e2e` is honest-green locally. (E2E is NOT in CI, which is why these went unnoticed.)
4. **Small followups:** restore `<code>` monospace on `/members/[slug]` empty-state slug (flattened when v0.9 wired the `noPersonaFmt`/`noProfileFmt` i18n keys to flat text); extend `Pill` to accept a `disabled` prop cleanly (so `GdprPanel`/`StatusEditor` stop hand-rolling Pill's look).

## Recommended approach
`superpowers:brainstorming` (forms/modal/admin patterns on the StatusEditor precedent — keep it brief if precedent covers it; do NOT skip per the chat-34 lesson) → `spec-writer` (amend spec §19 or new §20) → `superpowers:writing-plans` → `superpowers:subagent-driven-development` (one Sonnet implementer per phase). Fold the E2E + cleanup items into the plan as their own phases.

## Guards (carry forward from v0.9)
- **className-only** on auth/data/form *logic* — `/me/edit`, `/consent`, `/onboard`, `/admin/*` are auth-gated + have server actions (GDPR export/delete, profile save, consent). Touch classNames + element wrappers only.
- **Authenticated smoke is mandatory and doable** — the v0.9 lesson: gated surfaces redirect anon Playwright to `/login`. Smoke signed-in via the repo's `/api/test-auth` pattern against an `NEXT_PUBLIC_E2E_MODE=1` dev server (`page.request.post('/api/test-auth', { data: { handle: 'anton1rsod' } })`; Anton's roster slug = `anton-safronov`). Per-surface: cream/Geist/no-overflow/no-neutral-leak + soft-nav + hover + dark-emulation (per [[feedback_visual_smoke_soft_nav_hover]]). Watch for `prose-warm`/content overflow on content-heavy surfaces (the v0.9 `/projects/[slug]` bug).
- **H98 keeps `dark:` at 0** — the fs-walk test fails CI if any `dark:` returns. **H103** keeps one `main#main` + one `<h1>` per page (extend `PAGES` if forms get the recipe).
- Pre-merge: C5 gates + `pnpm build` + 3-lane reviewer triage + authenticated smoke of the new surfaces. PR → tag `community-platform-v0.9.1` → post-merge STATE flip.
