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
| D2 | Write-path E2E | **Build E2E-mode in-memory mocks** for `rsvpEvent` + `thankStatus`; un-skip 5.4a/5.4b | Literally what "backfill the write-path E2E" means; the `_test-status-store` precedent proves the pattern is clean; functional E2E for the two highest-value member writes is exactly the safety net the platform lacks. |
| D3 | Form-field styling | **`StatusEditor` verbatim (C6)** | Already the canonical shipped reskinned form; its buttons are byte-identical to `Pill` `solid`/`dashed` + `disabled:opacity-50`. No invention. |
| D4 | Modal styling | **Warm modal recipe (C7)** — `bg-ink/50` scrim + centered `bg-cream border border-ink` (zero radius) card + `font-display` title + `Pill` buttons | The one genuinely new *shape*; tokenizes the raw `bg-black/40` + `bg-white rounded` + `neutral-900`/`neutral-100` buttons. |
| D5 | Admin metrics | **Metric-tile + table recipe (C8)** — `bg-paper border-l-[3px] border-l-ink` tile + `font-voice tabular-nums text-ink` number + tokenized table | Maps cleanly onto existing tokens; drops `rounded border` + `neutral-600/500`. |
| D6 | `Pill` extension | **Add `disabled:opacity-50` (BASE) + a `danger` variant; refactor `StatusEditor` + `GdprPanel` to consume `Pill`** | The followup's "accept `disabled` cleanly": Pill already takes a `disabled` *prop* but has no disabled *visual*; `GdprPanel` also hand-rolls an alert-bordered delete → needs a `danger` variant. Touches the shipped `Pill` → re-smoke heroes (same discipline as v0.9 D5). |
| D7 | ConsentModal focus management | **Keep reskin className-only; log focus-trap/Escape as a v0.9.2 a11y followup** | The modal has no focus-trap/Escape/return-focus today — a pre-existing a11y defect, not introduced by v0.9.1. Adding it is behavior beyond a reskin; surgical-changes says don't expand scope. |
| D8 | Spec doc home | **§19.1 sub-section** (matching the §18.1 point-release precedent) | v0.9.1 is §19's own explicitly-deferred slice ("forms/admin slice → v0.9.1"), not a new theme. |

---

## 3. Architecture — three new recipe conventions

The reader recipe (`v0.9.0-plan.md` **C1**–**C5**) is reused verbatim. v0.9.1 documents three additions in the plan's Conventions block. None is a new component; each is a documented convention lifted from shipped code + tokens.

### C6 — form-field recipe (= `StatusEditor` verbatim)
```
form:     bg-paper border-l-[3px] border-l-ink px-4 py-4
label:    block font-voice text-[11px] uppercase tracking-[1px] text-dust
field:    bg-cream-deep border-l-[2px] border-l-ink px-3 py-2 font-body text-ink text-sm
          focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-50
buttons:  <Pill variant="solid|dashed" type="submit|button" disabled={…}>
message:  font-voice text-[11px]  →  text-alert (error) | text-dust (ok)
```
Applies to: `ProfileEditor` (textarea + tabs), `OnboardForm`, `EventForm`, `InviteForm`. Markdown previews use **`.prose-warm`** (C2) — `@tailwindcss/typography` is not installed, so `prose prose-neutral` is a no-op today.

### C7 — modal recipe
```
overlay:  fixed inset-0 z-50 flex items-center justify-center bg-ink/50
card:     mx-4 max-w-md bg-cream border border-ink p-6        (zero radius)
title:    font-display font-semibold text-ink
body:     font-body text-ink / font-voice text-dust meta
buttons:  <Pill variant="solid">Accept</Pill>  <Pill variant="dashed">Cancel</Pill>
a11y:     role="dialog" aria-modal aria-labelledby  (preserved; focus-trap = D7 followup)
```
Applies to: `ConsentModal`.

### C8 — metric-tile + table recipe
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
- **ConsentModal focus-trap/Escape** → v0.9.2 a11y followup (D7).
- **Dead `--color-neutral-*` token definitions in `globals.css`** — once forms stop using them, the CSS-var *definitions* may be removable; that's a separate dead-code task (harmless to leave). Log as a followup, not v0.9.1 scope.
- **Tailwind v4 migration / real dark mode / CSP** — unchanged from §19 non-goals.

---

## 5. Phasing (subagent-driven — one Sonnet implementer per phase, token discipline)

| Phase | Work | Notes |
|---|---|---|
| **1 — Shared contracts + Pill** | Add `disabled:opacity-50` + `danger` to `Pill`; document C6/C7/C8; refactor `StatusEditor` (solid+dashed) + `GdprPanel` (solid+danger) to consume `Pill` | Touches shipped `Pill` → **re-smoke the 4 hero surfaces** |
| **2 — Member forms** | `/me/edit`+`ProfileEditor` (incl. `.prose-warm` preview + tabs), `/consent`+`ConsentClient`+`ConsentModal` (C7), `/onboard`+`OnboardForm`+`/onboard/error`, `/no-access` | className-only on auth/consent/save logic |
| **3 — Admin surfaces** | `/admin/health` (C8), `/admin/invite`+`InviteForm`+`InviteUrlDisplay`, `/admin/events/new`+`EventForm` (C6 ×many fields) | admin-gated; className-only on RBAC + write actions |
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

---

## 7. E2E hygiene approach

- **Routing specs** (`smoke`, `auth`×3, `consent`, `members:22`): rewrite assertions to the current ADR-0012/0014 public-discovery routing — public reader routes return 200 for anon; only genuinely-gated routes (`/this-week`, `/me/edit`, `/admin/*`, `/consent` flow) redirect. Verify against the live route segment configs, not the obsolete model.
- **Prod-only specs** (`v0-4-shell`×3): guard with `test.skip(!isProdTarget, "prod-edge-only: H56 Cache-Control / v0.6 hero markup")` keyed off `PLAYWRIGHT_BASE_URL`. Local `pnpm e2e` skips them (honest-green); `PLAYWRIGHT_BASE_URL=https://…vercel.app pnpm e2e` still runs them. No coverage deleted — coverage made *conditional on its valid target*.

**Outcome gate (H111):** `pnpm e2e` against a local `NEXT_PUBLIC_E2E_MODE=1` dev server is **green** (0 unexpected failures; prod-only specs skipped with a reason).

---

## 8. Accessibility & standards (current as of 2026-05-27)

- **Target size (WCAG 2.2 SC 2.5.8, AA 24×24):** `Pill` already meets it (H101). Audit form buttons + the new `danger` Pill keep `min-h-[24px]`.
- **Contrast (1.4.3 / 1.4.11):** `dust`(`#886c37`) on the new backgrounds — `bg-paper`(`#fff`) and `bg-cream`/`bg-cream-deep` — must hold 4.5:1 for small text; gated by the extended axe sweep (don't introduce `dust` on an untested bg). `text-alert` on cream verified for the danger-button + error copy.
- **Forms a11y:** preserve `<label htmlFor>` ↔ field `id`, `role="status"` on async messages, `aria-selected` on ProfileEditor tabs, `role="dialog"`/`aria-modal`/`aria-labelledby` on ConsentModal (focus-trap = D7 followup).
- **a11y E2E:** extend the axe sweep to the auth-gated form surfaces via the per-slice functional E2E (`@axe-core/playwright`), signed-in through `/api/test-auth`.

---

## 9. Rendering & framework posture (Next 16 / React 19 — preserved)

className-only; no rendering-strategy changes. `/me/edit`, `/this-week`, `/members/[slug]`, `/admin/*` stay `force-dynamic` (request-time `auth()` / RBAC). `/consent`, `/onboard`, `/no-access` keep their current segment configs. The only *behavioral* additions are the **test-mode-guarded** mock forks in the two write actions (Phase 4) — production code paths are unchanged when `NODE_ENV=production`.

---

## 10. Hardenings (H104–H111 — H103 is the current max)

| ID | Hardening | Test approach |
|---|---|---|
| **H104** | `Pill` gains `disabled:opacity-50` + `danger` variant; no consumer hand-rolls the Pill look (`StatusEditor`/`GdprPanel` migrated) | `Pill` source-scan + grep: hand-rolled `border-[1.5px] … border-ink` button classes absent from `StatusEditor`/`GdprPanel` |
| **H105** | Form surfaces use the C6 recipe — no `neutral-*`/`gray-*`/`rounded border`; `bg-paper`/`bg-cream-deep` fields + `Pill` buttons | per-surface source-scan (C4-derived) |
| **H106** | `ConsentModal` uses C7 — `bg-cream`/`border-ink` card + `Pill` buttons + `bg-ink/50` scrim; `role="dialog"`/`aria-modal` preserved | source-scan + a11y assertion |
| **H107** | `/admin/health` tile + table tokenized (C8) — `border-l-ink` tile, `tabular-nums` number, no `rounded border`/`neutral-*` | source-scan |
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
- **`EventForm` (272 LOC, 13 hits) is the heaviest reskin** — many fields; mechanical via C6 but the largest single diff. Keep the create-event server action + Zod schema untouched.
- **Mock forks add behavior to write-path logic** — strictly test-mode-guarded (D2/H109); the security lane gates this. Mirror `_test-status-store` rather than inventing.
- **`/me/edit`, `/admin/*`, `/this-week`, `/members/[slug]`** are `force-dynamic` + auth/RBAC — reskins stay className-only.
- **ConsentModal focus management** is a known pre-existing a11y gap, deliberately deferred (D7) — don't let the reskin silently regress the existing `role`/`aria` attributes.

---

## 13. Non-goals (deliberate)

- **ConsentModal focus-trap/Escape** → v0.9.2 (D7).
- **Removing dead `--color-neutral-*` token definitions** → separate dead-code followup.
- **Tailwind v4 / real dark mode / CSP** → unchanged from §19 non-goals (own future cycles).

---

## 14. Decisions log / ADR note

**No new ADR.** v0.9.1 applies ADR-0014's locked warm-amber system to the remaining surfaces (className-only) and adds test-mode-guarded E2E mocks (no production behavior change). The E2E-mode pattern is an established repo convention (`_test-*-store` family), not a new architectural posture.

---

## 15. Execution & handoff

Next: `superpowers:writing-plans` produces `projects/community-platform/v0.9.1-plan.md` referencing this design doc + spec §19.1 + the reused `v0.9.0-plan.md` conventions (C1–C5). The implementation chat runs `superpowers:subagent-driven-development` against the 6 phases above (one Sonnet implementer per phase, full-suite verification at each boundary), then 3-lane reviewer triage → authenticated smoke of the new form surfaces → PR → tag `community-platform-v0.9.1` → post-merge STATE flip. Same playbook as v0.6/v0.8/v0.9.
