# Community Platform v0.9.1 — Forms/admin warm reskin + write-path E2E + E2E hygiene

**Status:** Approved — brainstorm complete (chat-47, 2026-05-27)
**Date:** 2026-05-27
**Author:** Anton Safronov (founder), via brainstorm with AI collaborator
**Project:** [`projects/community-platform/`](../../projects/community-platform/)
**Canonical spec section:** `projects/community-platform/spec.md` §19.1 (summary points here)
**Plan (next):** `projects/community-platform/v0.9.1-plan.md` — produced by `superpowers:writing-plans`
**Baseline:** main HEAD `a97eb8a` (v0.9.0 shipped @ merge `6a804a0`; tag `community-platform-v0.9.0`) · 1362 tests green · `dark:` in `app/` = 0

---

## 0. TL;DR

v0.9.0 applied the locked warm-maximalist system to every **reader** surface and dead-coded the `dark:` landmine platform-wide. v0.9.1 **finishes the rollout on the stateful write/admin surfaces v0.9.0 deliberately deferred**, **backfills the authenticated write-path E2E** (RSVP + Thanks), and **cleans the stale E2E specs** v0.9 surfaced. Like v0.9.0 this is **application, not invention** — the design language is frozen; the only genuinely new *shapes* (input/textarea fields, modal overlay, admin metric tile + table) all map onto existing tokens, and the canonical form precedent (`StatusEditor`) already shipped in v0.9.

**Three workstreams, one cycle:**
1. **Forms/admin warm reskin** — the last v0.1 neutral scaffolding in `app/` (className-only).
2. **Write-path E2E** — un-skip the RSVP/Thanks cases by giving `rsvp-event.ts` / `thank-status.ts` the same in-memory E2E-mode mock the status write already has.
3. **E2E hygiene** — make `pnpm e2e` honest-green locally (9 pre-existing red specs assert an obsolete routing model or a prod-only header).

**Scope decision (Anton, chat-47):** **complete rollout** — every remaining scaffolding-dirty surface, so `app/` reaches ~0 `neutral-*`/`gray-*`/`rounded border`. **E2E decision (Anton, chat-47):** **build the mocks** — truly green functional E2E for the two highest-value member writes.

---

## 1. Context & problem

### 1.1 The last scaffolding (confirmed by survey, 2026-05-27)
`dark:` in `app/` = **0** (H98 holds). Remaining `neutral-*`/`gray-*`/`rounded border` is concentrated on the deferred forms/admin surfaces:

| File | LOC | Scaffolding hits | Shape |
|---|---|---|---|
| `app/components/EventForm.tsx` | 272 | 13 | multi-field admin form (heaviest reskin) |
| `app/components/OnboardForm.tsx` | 146 | 8 | multi-field registration form |
| `app/components/ProfileEditor.tsx` | 228 | 7 | textarea + Edit/Preview tabs + no-op `prose prose-neutral` preview |
| `app/components/InviteForm.tsx` | 74 | 4 | admin invite form |
| `app/onboard/page.tsx` | 108 | 3 | onboard shell |
| `app/components/InviteUrlDisplay.tsx` | 52 | 3 | invite-URL result panel |
| `app/admin/health/page.tsx` | 119 | 3 | metric tile + 4-week trend table |
| `app/no-access/page.tsx` | 28 | 2 | gate page + back button |
| `app/components/ConsentModal.tsx` | 57 | 2 | **modal overlay** (`bg-black/40` scrim + `bg-white rounded` card) |
| `app/me/edit/page.tsx`, `app/consent/ConsentClient.tsx`, `app/admin/invite/page.tsx`, `app/admin/events/new/page.tsx` | — | 1 each | page chrome (intro text / `bg-neutral-50` main) |

**False positives (no action):** `app/globals.css` (7) = the `--color-neutral-*` token *definitions* + doc comments, not usages; `app/actions/create-event.ts` (2) = `import matter from "gray-matter"` + a comment. The className-only guard holds — no server-action logic to touch.

### 1.2 The write-path E2E gap
`e2e/v0-9-write-paths.spec.ts` has three blocks. **5.4c (status post) already runs green** via `app/actions/_test-status-store.ts` (in-memory mock) gated by `NEXT_PUBLIC_E2E_MODE=1`. **5.4a (RSVP toggle)** and **5.4b (Thanks)** are `test.skip`-gated because `rsvp-event.ts` / `thank-status.ts` call the real GitHub App — no in-memory path. They are the only member-write actions still missing an in-memory mock — the `_test-*-store` family already covers status / profile / invitation / consent.

### 1.3 The stale E2E specs (9, pre-existing — NOT v0.9 regressions)
E2E is not in CI, so red-locally went unnoticed. Two root causes:
- **Obsolete routing model** — `smoke.spec.ts`, `auth.spec.ts` (×3), `consent.spec.ts`, `members.spec.ts:22` assert the pre-ADR-0014 "everything → `/login`" gate. ADR-0012/0014 made `/home`, `/events`, `/meetings`, `/calendar`, `/members`, `/decisions`, `/projects` publicly readable; only truly-gated routes redirect.
- **Prod-only assertions** — `v0-4-shell.spec.ts` (×3) assert the H56 `Cache-Control: private, no-cache, no-store` that **only Vercel's edge injects** (the dev server emits `no-cache, must-revalidate`) + v0.6-era hero markup; they were authored for `PLAYWRIGHT_BASE_URL`=prod.

### 1.4 Why a brainstorm (not straight to plan)
Two material decisions changed the plan's size and risk — scope breadth (named-5 vs complete) and E2E posture (mocks vs manual). Both were Anton's call and are now locked. Per `feedback_dont_skip_brainstorming`, the brainstorm ran even though the kickoff said "keep it brief if precedent covers it."

---

## 2. Locked decisions

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| D1 | Reskin scope | **Complete rollout** — all remaining scaffolding-dirty surfaces incl. `/admin/invite`+`InviteForm`+`InviteUrlDisplay` and `/admin/events/new`+`EventForm` | "Finish the rollout" + the grep-discipline philosophy (close the book) + a warm admin page wrapping a neutral form reads as broken. Admin forms are admin-only (low blast radius); the cost of a third cleanup chat > one more implementer phase now. |
| D2 | Write-path E2E | **Build E2E-mode in-memory mocks** for `rsvpEvent` + `thankStatus`; un-skip 5.4a/5.4b (keep the repo's `_test-*-store` pattern) | Literally what "backfill the write-path E2E" means; the `_test-status-store` precedent proves the pattern is clean; functional E2E for the two highest-value member writes is exactly the safety net the platform lacks. *Standards note:* the cleaner 2026 pattern is MSW server-side interception (mock the GitHub RPC boundary; no test forks in action code), but introducing it for only 2 of 6 write actions would fracture the suite + add a dep + non-trivial wiring → kept the consistent in-app pattern; suite-wide MSW migration logged to backlog (§13). |
| D3 | Form-field styling | **`StatusEditor` verbatim (C7)** | Already the canonical shipped reskinned form; its buttons are byte-identical to `Pill` `solid`/`dashed` + `disabled:opacity-50`. No invention. |
| D4 | Modal styling | **Native `<dialog>` + `.showModal()` (C8)** — warm tokens (`backdrop:bg-ink/50`, `bg-cream`/`border-ink` card, `font-display` title, `Pill` buttons) | Standards upgrade (2026 best practice): replaces the hand-rolled `role="dialog"` div with the native element → built-in Escape, top-layer, `inert` background, `::backdrop`; no manual focus trap needed (modern WAI-APA consensus). Closes the modal a11y gap **in v0.9.1** with *less* code than the raw `bg-black/40` + `bg-white rounded` + `neutral-*` buttons it replaces. |
| D5 | Admin metrics | **Metric-tile + table recipe (C9)** — `bg-paper border-l-[3px] border-l-ink` tile + `font-voice tabular-nums text-ink` number + tokenized table | Maps cleanly onto existing tokens; drops `rounded border` + `neutral-600/500`. |
| D6 | `Pill` extension | **Add `disabled:opacity-50` (BASE) + a `danger` variant; refactor `StatusEditor` + `GdprPanel` to consume `Pill`** | The followup's "accept `disabled` cleanly": Pill already takes a `disabled` *prop* but has no disabled *visual*; `GdprPanel` also hand-rolls an alert-bordered delete → needs a `danger` variant. Touches the shipped `Pill` → re-smoke heroes (same discipline as v0.9 D5). |
| D7 | ConsentModal a11y | **REVISED after standards validation → adopt native `<dialog>` now (no v0.9.2 deferral)** | Originally I deferred focus management to keep the reskin className-only. The 2026 standards check showed native `<dialog>` + `.showModal()` delivers conformant modal behavior with *less* code than a manual trap — so it's both the standard and the smaller change. ConsentModal is a leaf presentational component (logic in `ConsentClient` untouched), so the behavioral upgrade is low-risk and in-scope. |
| D8 | Spec doc home | **§19.1 sub-section** (matching the §18.1 point-release precedent) | v0.9.1 is §19's own explicitly-deferred slice ("forms/admin slice → v0.9.1"), not a new theme. |

---

## 3. Architecture — three new recipe conventions

The reader recipe (`v0.9.0-plan.md` **C1**–**C5**) is reused verbatim. v0.9.1 documents three additions in the plan's Conventions block. None is a new component; each is a documented convention lifted from shipped code + tokens.

### C7 — form-field recipe (= `StatusEditor` verbatim)
```
form:     bg-paper border-l-[3px] border-l-ink px-4 py-4
label:    block font-voice text-[11px] uppercase tracking-[1px] text-dust
field:    bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm
          focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50
buttons:  <Pill variant="solid|dashed" type="submit|button" disabled={…}>
message:  font-voice text-[11px]  →  text-alert (error) | text-dust (ok)
```
Applies to: `ProfileEditor` (textarea + tabs), `OnboardForm`, `EventForm`, `InviteForm`. Markdown previews use **`.prose-warm`** (C2) — `@tailwindcss/typography` is not installed, so `prose prose-neutral` is a no-op today.

### C8 — modal recipe (native `<dialog>` — standards upgrade)
**Use the native HTML `<dialog>` element opened with `.showModal()`** — the current (2026) best practice for accessible modals (W3C APG / WCAG 2.2). It puts the dialog in the top layer, marks background content `inert`, and provides Escape-to-close + `::backdrop` natively; the modern WAI-APA consensus is that a manual JS focus trap is **not** needed (and is discouraged — users must retain access to browser chrome). This *replaces* the hand-rolled `role="dialog"` div, which today has **no** focus management at all.
```
element:  <dialog ref> — ref.showModal() on mount; .close() via onAccept/onCancel
scrim:    backdrop:bg-ink/50           (Tailwind `backdrop:` variant → dialog::backdrop)
card:     bg-cream border border-ink p-6 max-w-md   (zero radius; the <dialog> IS the card)
title:    font-display font-semibold text-ink + id → aria-labelledby
body:     font-body text-ink / font-voice text-dust meta
buttons:  <Pill variant="solid" autoFocus>Accept</Pill>  <Pill variant="dashed">Cancel</Pill>
a11y:     implicit role="dialog" + aria-modal="true" (from showModal); keep explicit aria-labelledby;
          Escape → onCancel (cancel event); browser returns focus to trigger on .close() (verify in smoke)
```
Applies to: `ConsentModal` (leaf presentational component — `ConsentClient`'s consent *logic* untouched).

### C9 — metric-tile + table recipe
```
tile:     bg-paper border-l-[3px] border-l-ink p-4
number:   font-voice text-[40px] tabular-nums text-ink
sublabel: font-voice text-[11px] text-dust
table:    th → MonoLabel-style (font-voice uppercase tracking text-dust);
          td → font-voice text-ink/text-dust; row sep → border-b border-ink/15
          (drops rounded border + neutral-600/500)
```
Applies to: `/admin/health`.

### Primitive vocabulary (all shipped)
`MonoLabel` · `Pill` (*gains `disabled` visual + `danger` variant*) · `ListItem` · `EventCard` · `EmptyState` · `AmberTag` · `DateTime` · `Avatar` · `Tag` · `.prose-warm`.

---

## 4. Scope

### 4.1 IN — v0.9.1
**Pages (8):** `/me/edit`, `/consent`, `/onboard` (+ `/onboard/error`), `/no-access`, `/admin/health`, `/admin/invite`, `/admin/events/new`.
**Components (7):** `ProfileEditor`, `ConsentModal`, `ConsentClient`, `OnboardForm`, `InviteForm`, `InviteUrlDisplay`, `EventForm`.
**Primitive (1):** `Pill` (`disabled:opacity-50` + `danger` variant) → `StatusEditor` + `GdprPanel` de-dup.
**Write-path E2E:** `_test-rsvp-store.ts` + `_test-thank-store.ts` + forks in `rsvp-event.ts`/`thank-status.ts` + `api/test-reset-{rsvp,thank}` routes + un-skip 5.4a/5.4b.
**E2E hygiene:** routing-assertion update (`smoke`, `auth`×3, `consent`, `members:22`) + prod-gating (`v0-4-shell`×3).
**Followup:** `members/[slug]` empty-state `<code>` restore.

### 4.2 OUT — deferred
- **MSW server-side E2E interception (suite-wide)** → own cycle (D2; cleaner 2026 standard, applied across *all* `_test-*-store` actions — not piecemeal in v0.9.1). *(ConsentModal a11y is no longer deferred — D7 was revised to adopt native `<dialog>` in-scope.)*
- **Dead `--color-neutral-*` token definitions in `globals.css`** — once forms stop using them, the CSS-var *definitions* may be removable; that's a separate dead-code task (harmless to leave). Log as a followup, not v0.9.1 scope.
- **Tailwind v4 migration / real dark mode / CSP** — unchanged from §19 non-goals.

---

## 5. Phasing (subagent-driven — one Sonnet implementer per phase, token discipline)

| Phase | Work | Notes |
|---|---|---|
| **1 — Shared contracts + Pill** | Add `disabled:opacity-50` + `danger` to `Pill`; document C7/C8/C9; refactor `StatusEditor` (solid+dashed) + `GdprPanel` (solid+danger) to consume `Pill` | Touches shipped `Pill` → **re-smoke the 4 hero surfaces** |
| **2 — Member forms** | `/me/edit`+`ProfileEditor` (incl. `.prose-warm` preview + tabs), `/consent`+`ConsentClient`+`ConsentModal` (C8 — **upgrade to native `<dialog>`**), `/onboard`+`OnboardForm`+`/onboard/error`, `/no-access` | className-only on auth/consent/save logic; ConsentModal `<dialog>` upgrade is a leaf-component behavioral change (consent logic untouched) |
| **3 — Admin surfaces** | `/admin/health` (C9), `/admin/invite`+`InviteForm`+`InviteUrlDisplay`, `/admin/events/new`+`EventForm` (C7 ×many fields) | admin-gated; className-only on RBAC + write actions |
| **4 — Write-path E2E mocks** | `_test-rsvp-store.ts` + `_test-thank-store.ts` + `fromMock` forks + reset routes; un-skip 5.4a/5.4b | mirror `_test-status-store` exactly (prod double-guard + `globalThis` hop) |
| **5 — E2E hygiene** | Update routing assertions to ADR-0012/0014 model; `test.skip` prod-only `v0-4-shell` specs when `PLAYWRIGHT_BASE_URL` ≠ prod | no coverage deleted |
| **6 — Followup + closeout** | `members/[slug]` `<code>`; final `dark:` grep-guard (still 0); per-surface source-scan tests (H104–H110); CHANGELOG + STATE flip + tag `community-platform-v0.9.1` | |

---

## 6. Write-path E2E mock design (mirror `_test-status-store.ts`)

The pattern is proven across four actions (status / profile / invitation / consent). Faithful replication for RSVP + Thanks:

- **`app/actions/_test-rsvp-store.ts`** — in-memory `Map` on `globalThis` (`__waicMockRsvpStore`), models the `events_going`/`events_interested` tri-state per member (mirroring `rsvpEvent`'s `reconcileArrays`), `nextSha()`, `resolveAuthState()` (not_authenticated/not_a_member split), `reset()`. Coverage-excluded in `vitest.config.ts` (E2E-only).
- **`app/actions/_test-thank-store.ts`** — same shape; models thanker→item kudos (mirroring `thankStatus`'s `item_type`/`item_id` + self-thank + dedup).
- **Fork** at the top of `rsvpEvent` / `thankStatus`, after Zod parse, before `resolveAuthor`:
  ```ts
  if (!isProductionRuntime() && isE2EMode()) {
    return fromMock(await mockRsvpActions.toggle(parsed.data));
  }
  ```
  — `isProductionRuntime()` = `NODE_ENV === "production"` is the **critical double-guard**: even if `NEXT_PUBLIC_E2E_MODE=1` leaked into a prod build, the mock can't fire. `isE2EMode()` reuses the shared helper (or a local copy per the existing pattern).
- **`globalThis` hop is mandatory** — Next 16 `"use server"` files are a separate module graph from server components/route handlers; without it the action-write and the page-read see different instances and Playwright reads stale state (documented in `_test-status-store.ts:28-32`).
- **Reset routes** `app/api/test-reset-rsvp/route.ts` + `app/api/test-reset-thank/route.ts` (mirror `test-reset-status`).
- **Un-skip** `e2e/v0-9-write-paths.spec.ts` 5.4a (RSVP toggle going↔none) + 5.4b (Thanks click), wiring `/api/test-auth` (handle `anton1rsod`) + reset between runs; Playwright 1.59 standards (role-based locators, web-first assertions, no `waitForTimeout`).

**Standards notes (2026 validation):**
- *Pattern choice:* the in-app mock keeps consistency with the four existing `_test-*-store` actions and is proven green (5.4c). The cleaner emerging standard is **MSW** server-side interception (mock the GitHub HTTP boundary; action code runs unchanged) — logged as a suite-wide backlog migration (§13), not adopted piecemeal here.
- *Auth:* the suite's programmatic `/api/test-auth` login is a recommended pattern (avoids UI-login flakiness). Optional optimization: cache it once via a Playwright setup-project + `storageState` reused across specs; not required for v0.9.1.

---

## 7. E2E hygiene approach

- **Routing specs** (`smoke`, `auth`×3, `consent`, `members:22`): rewrite assertions to the current ADR-0012/0014 public-discovery routing — public reader routes return 200 for anon; only genuinely-gated routes (`/this-week`, `/me/edit`, `/admin/*`, `/consent` flow) redirect. Verify against the live route segment configs, not the obsolete model.
- **Prod-only specs** (`v0-4-shell`×3): guard with `test.skip(!isProdTarget, "prod-edge-only: H56 Cache-Control / v0.6 hero markup")` keyed off `PLAYWRIGHT_BASE_URL`. Local `pnpm e2e` skips them (honest-green); `PLAYWRIGHT_BASE_URL=https://…vercel.app pnpm e2e` still runs them. No coverage deleted — coverage made *conditional on its valid target*.

**Outcome gate (H111):** `pnpm e2e` against a local `NEXT_PUBLIC_E2E_MODE=1` dev server is **green** (0 unexpected failures; prod-only specs skipped with a reason).

---

## 8. Accessibility & standards (current as of 2026-05-27)

- **Target size (WCAG 2.2 SC 2.5.8, AA 24×24):** `Pill` already meets it (H101). Audit form buttons + the new `danger` Pill keep `min-h-[24px]`.
- **Contrast (1.4.3 / 1.4.11):** `dust`(`#886c37`) on the new backgrounds — `bg-paper`(`#fff`) and `bg-cream`/`bg-cream-deep` — must hold 4.5:1 for small text; gated by the extended axe sweep (don't introduce `dust` on an untested bg). `text-alert` on cream verified for the danger-button + error copy.
- **Forms a11y:** preserve `<label htmlFor>` ↔ field `id`, `role="status"` on async messages, `aria-selected` on ProfileEditor tabs. **ConsentModal:** native `<dialog>`+`.showModal()` provides implicit `role="dialog"` + `aria-modal="true"` + Escape + `inert` background; keep an explicit `aria-labelledby` for the title and `autoFocus` on the primary action. Per the 2026 WAI-APA consensus, do **not** add a manual focus trap (users must retain access to browser chrome).
- **a11y E2E:** extend the axe sweep to the auth-gated form surfaces via the per-slice functional E2E (`@axe-core/playwright`), signed-in through `/api/test-auth`.

---

## 9. Rendering & framework posture (Next 16 / React 19 — preserved)

className-only; no rendering-strategy changes. `/me/edit`, `/this-week`, `/members/[slug]`, `/admin/*` stay `force-dynamic` (request-time `auth()` / RBAC). `/consent`, `/onboard`, `/no-access` keep their current segment configs. The only *behavioral* additions are the **test-mode-guarded** mock forks in the two write actions (Phase 4) — production code paths are unchanged when `NODE_ENV=production`.

---

## 10. Hardenings (H104–H111 — H103 is the current max)

| ID | Hardening | Test approach |
|---|---|---|
| **H104** | `Pill` gains `disabled:opacity-50` + `danger` variant; no consumer hand-rolls the Pill look (`StatusEditor`/`GdprPanel` migrated) | `Pill` source-scan + grep: hand-rolled `border-[1.5px] … border-ink` button classes absent from `StatusEditor`/`GdprPanel` |
| **H105** | Form surfaces use the C7 recipe — no `neutral-*`/`gray-*`/`rounded border`; `bg-paper`/`bg-cream-deep` fields + `Pill` buttons | per-surface source-scan (C4-derived) |
| **H106** | `ConsentModal` uses native `<dialog>`+`.showModal()` (C8) — `backdrop:bg-ink/50`, `bg-cream`/`border-ink` card, `Pill` buttons, explicit `aria-labelledby`; no manual focus-trap lib | source-scan (`<dialog>` + `showModal` present; old `role="dialog"` div absent) + a11y assertion |
| **H107** | `/admin/health` tile + table tokenized (C9) — `border-l-ink` tile, `tabular-nums` number, no `rounded border`/`neutral-*` | source-scan |
| **H108** | `ProfileEditor` preview uses `.prose-warm` (replaces no-op `prose prose-neutral`) | source-scan |
| **H109** | RSVP + Thanks E2E mocks carry the prod double-guard `!isProductionRuntime() && isE2EMode()` | source-scan asserts the guard literal; E2E green |
| **H110** | `members/[slug]` empty-state path/slug rendered in `<code>` (mono affordance restored) | source-scan + render test |
| **H111** | `pnpm e2e` honest-green locally — routing assertions current; prod-only specs skip with a reason off `PLAYWRIGHT_BASE_URL` | E2E run exit 0; skip-count assertion |

**Carried-forward guards:** H98 (`dark:` = 0 — fs-walk grep-guard must still pass after forms reskin) · H103 (one `main#main` + one `<h1>` per page that gains the recipe shell — extend `PAGES`).

---

## 11. Testing & verification

- **Per-surface source-scan tests** (generalize `projects-page.test.tsx` / the v0.9.0 C4 template): assert no `dark:`, no `neutral-*`/`gray-*`/`rounded border`, recipe tokens present.
- **Per-phase full-suite verify** (`pnpm test` + `pnpm tsc --noEmit` + `pnpm lint` green at every boundary) — the v0.6/v0.8/v0.9 discipline.
- **Write-path E2E** green under `NEXT_PUBLIC_E2E_MODE=1` (Phase 4); extended axe sweep on the new form surfaces (signed-in).
- **3-lane reviewer triage** (security / typescript / code-quality) before merge — **security lane must confirm the mock forks can't fire in prod** and that no auth/RBAC/write logic moved.
- **Mandatory authenticated soft-nav + hover/focus + dark-emulation smoke** on every reskinned surface via `/api/test-auth` (handle `anton1rsod`; roster slug `anton-safronov`) against a `NEXT_PUBLIC_E2E_MODE=1` dev server — per `feedback_visual_smoke_soft_nav_hover`. Watch for `.prose-warm`/content overflow (the v0.9 `/projects/[slug] <pre>` bug). **Re-smoke the 4 hero surfaces** after the `Pill` change (D6 blast radius).

---

## 12. Risks & watch-items

- **`Pill` change touches a shipped primitive** used on heroes → re-smoke `/`, `/home`, `/events`, `/events/[slug]` (the `danger` variant is additive; existing 3 variants untouched, but `disabled:opacity-50` is new on BASE).
- **`EventForm` (272 LOC, 13 hits) is the heaviest reskin** — many fields; mechanical via C7 but the largest single diff. Keep the create-event server action + Zod schema untouched.
- **Mock forks add behavior to write-path logic** — strictly test-mode-guarded (D2/H109); the security lane gates this. Mirror `_test-status-store` rather than inventing.
- **`/me/edit`, `/admin/*`, `/this-week`, `/members/[slug]`** are `force-dynamic` + auth/RBAC — reskins stay className-only.
- **ConsentModal `<dialog>` upgrade** (D7, standards-driven) is the one behavioral change across the reskin phases — wire `.showModal()` on mount + map Escape/`cancel` → `onCancel` + the two `Pill` actions; verify in smoke that focus moves into the dialog on open and returns to the trigger on `.close()`. `ConsentClient`'s consent logic stays untouched.

---

## 13. Non-goals (deliberate) / backlog

- **MSW server-side interception (suite-wide E2E migration)** → own cycle (D2). The cleaner 2026 standard for server-action E2E ("mock the RPC boundary, not the action"), but a consistency pass across *all* `_test-*-store` actions (status/profile/invitation/consent + the new rsvp/thank), not a piecemeal v0.9.1 change.
- **Removing dead `--color-neutral-*` token definitions** → separate dead-code followup.
- **Tailwind v4 / real dark mode / CSP** → unchanged from §19 non-goals (own future cycles).

---

## 14. Decisions log / ADR note

**No new ADR.** v0.9.1 applies ADR-0014's locked warm-amber system to the remaining surfaces (className-only) and adds test-mode-guarded E2E mocks (no production behavior change). The E2E-mode pattern is an established repo convention (`_test-*-store` family), not a new architectural posture.

---

## 15. Execution & handoff

Next: `superpowers:writing-plans` produces `projects/community-platform/v0.9.1-plan.md` referencing this design doc + spec §19.1 + the reused `v0.9.0-plan.md` conventions (C1–C5). The implementation chat runs `superpowers:subagent-driven-development` against the 6 phases above (one Sonnet implementer per phase, full-suite verification at each boundary), then 3-lane reviewer triage → authenticated smoke of the new form surfaces → PR → tag `community-platform-v0.9.1` → post-merge STATE flip. Same playbook as v0.6/v0.8/v0.9.

---

## Appendix — Standards validation (2026-05-27)

Validated the spec's pattern choices against current industry standards (Anton's request). Method: parallel web search + authoritative-source fetch (W3C WAI, Playwright docs, CSS-Tricks, Next.js docs).

| Area | Verdict | Action |
|---|---|---|
| **Modal** | Native `<dialog>`+`.showModal()` is the 2026 best practice (top-layer, `inert` background, Escape, `::backdrop`); modern WAI-APA consensus: **no manual focus trap** (that guidance predates `<dialog>`/`inert`; users must keep browser-chrome access). | **Improved** — C8 now uses native `<dialog>`; retired the D7 v0.9.2 focus-mgmt deferral (the standard *and* less code). |
| **Playwright** | `getByRole` + web-first assertions + `trace:'on-first-retry'` + programmatic auth confirmed current; `storageState` setup-project is the caching optimization. | **Confirmed** — already in spec; added `storageState` as an optional optimization (§6). |
| **Server-action E2E mocking** | Two valid patterns: in-app flag-gated mock (repo's `_test-*-store`) vs MSW server-side RPC interception (cleaner; "mock the boundary, not the action"). | **Confirmed + backlogged** — kept the consistent in-app pattern (4-store precedent, proven, scope-contained); suite-wide MSW migration → §13. Prod double-guard (H109) is defense-in-depth, already aligned. |
| **WCAG 2.2** | Target 2.5.8 (24px), contrast 1.4.3/1.4.11, focus 2.4.7/2.4.11, dialog name/role/value 4.1.2 — all already addressed. | **Confirmed** — no corrections. |

**Sources:** [W3C APG Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) · [CSS-Tricks — There Is No Need to Trap Focus on a `<dialog>`](https://css-tricks.com/there-is-no-need-to-trap-focus-on-a-dialog-element/) · [Playwright — Best Practices](https://playwright.dev/docs/best-practices) · [Playwright — Authentication](https://playwright.dev/docs/auth) · [Next.js — Testing (Playwright)](https://nextjs.org/docs/app/guides/testing) · [SafeDep — E2E Next.js + MSW + Playwright (Feb 2026)](https://safedep.io/end-to-end-test-nextjs-msw-playwright/) · [Next.js discussion #67136 — mocking server actions](https://github.com/vercel/next.js/discussions/67136)
