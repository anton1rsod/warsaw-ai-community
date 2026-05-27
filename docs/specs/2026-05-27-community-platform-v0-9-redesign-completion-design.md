# Community Platform v0.9 — Redesign completion (reader surfaces) + `dark:` landmine resolution

**Status:** Approved — brainstorm complete (chat-45, 2026-05-27)
**Date:** 2026-05-27
**Author:** Anton Safronov (founder), via brainstorm with AI collaborator
**Project:** [`projects/community-platform/`](../../projects/community-platform/)
**Canonical spec section:** `projects/community-platform/spec.md` §19 (summary points here)
**Plan (next):** `projects/community-platform/v0.9.0-plan.md` — produced by `superpowers:writing-plans`
**Baseline:** main HEAD `408fa11` · 1237 tests green · ships as **v0.9.0** (forms/admin slice → v0.9.1)

---

## 0. TL;DR

v0.6→v0.8 redesigned the 4 hero surfaces (`/`, `/home`, `/events`, `/events/[slug]`) + shared chrome to a warm-maximalist system (cream/ink/dust tokens + Geist/Inter/JetBrains + primitives). v0.9 **applies that already-locked system to the un-redesigned reader surfaces** and **resolves a platform-wide `dark:` Tailwind landmine** that has been latent since v0.1. This is *application, not invention* — the design language, tokens, and primitives all exist and are live in production. §18.1 of the spec already named this "a future v0.9 page-by-page sweep."

**Two debts, one cycle:**
1. **`dark:` landmine** — 27 files in `app/` carry 74 `dark:` variants. Tailwind defaults to `darkMode: "media"`, so they fire under macOS dark mode against a palette that was never built (no `@media (prefers-color-scheme: dark)` overrides exist) → broken contrast. The v0.8.1 `/projects` hover bug was one instance.
2. **Un-redesigned reader templates** — ~11 reader page surfaces + their components still wear v0.1 scaffolding (`neutral-*`/`gray-*` + `rounded border`) instead of the cream/ink/dust + Geist/mono + MonoLabel/Pill/ListItem system.

**Scope decision:** v0.9.0 = readers + `/login`; stateful forms/admin (`/me/edit`, `/consent`, `/onboard`, `/admin/*`, `/no-access`) defer to **v0.9.1**. The Phase-1 dark-mode flip neutralizes the landmine **platform-wide**, so deferred surfaces stay *safe and functional* — just visually old.

---

## 1. Context & problem

### 1.1 The `dark:` landmine (confirmed)
- **27 files, 74 `dark:` occurrences** (`grep -rln 'dark:' app/`).
- `tailwind.config.ts` has **no `darkMode` key** → silently defaults to `"media"`, so every `dark:` variant is live whenever the OS is in dark mode.
- `app/globals.css` sets `color-scheme: light` and contains **zero** `@media (prefers-color-scheme: dark)` token overrides — only two anticipatory comments (lines 25, 38). `color-scheme: light` does **not** suppress `prefers-color-scheme` media variants, so the variants fire against an unbuilt palette → broken contrast.
- **Even a redesigned hero surface is dirty:** `app/events/[slug]/page.tsx` still carries `dark:` leftovers.

### 1.2 The un-redesigned reader templates
Live redesigned reference set: `/`, `/home`, `/events`, `/events/[slug]` + chrome (Header/HeaderNav/HeaderMobileMenu/Footer + brand components). Everything else is on v0.1 scaffolding. An Explore inventory verified **all 11 reader surfaces are pure RE-SKINS — zero layout rethinks needed** (the existing layouts — list/grid/prose/feed — already fit the token system). `ListItem.tsx`'s own docstring (lines 18-20) names `/calendar`, `/members`, `/projects`, `/decisions` as its intended "Phase B" consumers; they were designed for this work and never wired.

### 1.3 Why a brainstorm (not a code task)
The dark-mode question is a *posture* decision (does dark mode exist at all?), not a styling task; the scope is large (~20 surfaces) and must be phased. Both were locked via brainstorm before any code, per project discipline and `feedback_dont_skip_brainstorming`.

---

## 2. Locked decisions

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| D1 | Dark-mode posture | **Flip `darkMode` → `"selector"` + opportunistic purge during reskins + one final sweep** | The flip is the root-cause fix (dead-codes all 74 variants); purging is hygiene on dead code. |
| D2 | Dark-mode config value | **`"selector"`** (not `"class"`) | `selector` replaced `class` in Tailwind **v3.4.1**; we're on 3.4.19. Both neutralize identically here (no `.dark` ancestor is ever rendered — proven §8.2), but `selector` is the documented current value. |
| D3 | v0.9 scope | **Readers + `/login`; defer stateful forms/admin → v0.9.1** | The Phase-1 flip makes deferred surfaces safe regardless, so slicing is low-risk; a 20-surface PR would be ~5× v0.6 and brutal to review. |
| D4 | Functional E2E | **Per-slice — authored against the redesigned reader surfaces this cycle** | Platform has ZERO functional E2E today; authoring against *final* templates avoids re-authoring. Write-path E2E (save/invite/event-create) lands with the forms in v0.9.1. |
| D5 | `Pill` & WCAG 2.5.8 | **Enlarge hit target to ≥24px** (`min-h-[24px]` + `inline-flex items-center`) | WCAG 2.2 SC 2.5.8 Target Size (AA) = 24×24px. Current Pill ≈18px tall — borderline via the Spacing exception, and axe's `target-size` rule is experimental/unreliable. Durable fix. Touches the **shipped** Pill → re-smoke the 4 hero surfaces. |
| D6 | `Tag.tsx` | **Re-skin in place** | Keep its status/stage/type *label* role + the O12 accent-for-`status:proposed` rule; move to dust/cream/ink + zero radii. Tag is a non-interactive label, not an action — replacing with Pill (an action chip) would muddy accent semantics. |
| D7 | `/members` directory | **Re-skin the 2-col card grid** | Avatars-at-a-glance read better for a people directory than thin `ListItem` rows. |
| D8 | `StatusEditor` post-status E2E | **Author in v0.9** | `/this-week` is in v0.9 scope → test its write path against the final template now. |

---

## 3. Architecture — the "reader page recipe"

Not a new component: a **documented convention** every reader surface converges on, lifted verbatim from the shipped `/events` (`app/events/page.tsx`). This gives subagent implementers one unambiguous target and makes all surfaces cohesive.

### 3.1 Index / list surfaces
```tsx
<main id="main" className="mx-auto max-w-3xl px-6 py-10">
  <MonoLabel>{kicker}</MonoLabel>                                  {/* mono uppercase tracking dust */}
  <h1 className="mt-2 font-display font-semibold text-[40px] leading-[0.95] tracking-tight text-ink">
    {title}
  </h1>
  <div className="mt-3 flex flex-wrap gap-2">{/* <Pill> CTAs: solid / dashed / going */}</div>

  <section aria-labelledby="…-heading" className="mt-8">
    <MonoLabel>{sectionLabel}</MonoLabel>
    <h2 id="…-heading" className="sr-only">{sectionLabel}</h2>
    {items.length === 0
      ? <EmptyState headline=… calibration?=… nextAction?=… />   {/* or inline font-voice text-[12px] text-dust */}
      : <ul className="mt-2 flex flex-col gap-2">{/* <ListItem> or <EventCard> rows */}</ul>}
  </section>
</main>
```

### 3.2 Detail / prose surfaces (`*/[slug]`, `/handbook`)
Same `<main>` shell + `MonoLabel`/`font-display` h1, then a **tokenized prose container** replacing the scaffolding `prose-neutral dark:prose-invert`:
- prose body → `font-body text-ink`; headings → `font-display text-ink`; links → ink underline (accent reserved per Q4.8); code/meta → `font-voice text-dust`. Define a reusable prose class (e.g. `.prose-warm` in `globals.css` or a Tailwind `@layer`) so all four detail pages share one source of truth rather than repeating utility soup.
- Metadata rows (dates, status, host) → `MonoLabel` + `Tag` (status) + `font-voice text-dust`.

### 3.3 Primitive vocabulary (all already shipped)
`MonoLabel` (kicker/section label) · `Pill` (CTA — *to be enlarged to 24px*) · `ListItem` (paper bg + 3px ink left-border row) · `EventCard` (event row) · `EmptyState` (mono dust empty + optional dashed Pill) · `AmberTag` (amber highlight span) · `DateTime` (semantic `<time>`) · `Avatar` (amber monogram tile) · `Tag` (*to be re-skinned in place*).

---

## 4. Scope

### 4.1 IN — v0.9.0
**Reader page surfaces (11):** `/calendar`, `/decisions`, `/decisions/[slug]`, `/meetings`, `/meetings/[slug]`, `/members`, `/members/[slug]`, `/this-week`, `/handbook`, `/projects` (finish — partial since v0.8.1), `/projects/[slug]`.
**Funnel entry (1):** `/login`.
**Dark cleanup:** `/events/[slug]` `dark:` leftover (already-redesigned surface).
**Reader-slice components re-skinned:** `AddToCalendarButton`, `AskGBrainButton`, `ContributionCard`, `EventRoster` (verify post-v0.8), `GdprPanel`, `KudosCount`, `PersonaPanel`, `StatusEditor`, `ThankButton`, `TopContributors`, `Tag` (in-place re-skin), `Pill` (24px target — touches shipped primitive), `EventRsvpButton` (dark cleanup only).
**Already done (don't touch unless a reskin requires it):** `DateTime`, `EmptyState`, `HomeFeed`, `YourWeekPane`, `ListItem`, `EventCard`, `MonoLabel`, `AmberTag`, `Avatar`, `AnonymousHero`, `Header*`, `Footer`, `BrandStar`, `CityChip`, `FormalEntityMasthead`, `RootShell`.

### 4.2 OUT — defer to v0.9.1
**Pages:** `/me/edit`, `/consent`, `/onboard` (+`/onboard/error`), `/admin/health`, `/admin/invite`, `/admin/events/new`, `/no-access`.
**Components:** `ProfileEditor`, `OnboardForm`, `InviteForm`, `ConsentModal`, `ConsentClient`, `EventForm`, `InviteUrlDisplay`.
**Write-path E2E:** profile-save, invite, event-create, RSVP-race + the `test-reset-profile` route.
> All of the above are **safe after the Phase-1 flip** — just visually on old scaffolding until v0.9.1.

---

## 5. Phasing (subagent-driven, one Sonnet implementer per phase — token discipline)

- **Phase 1 — Foundation:** flip `tailwind.config.ts` `darkMode: "selector"`; re-skin `Tag.tsx`; enlarge `Pill` target to 24px; clean `dark:` on `/events/[slug]`; write the reader-page recipe + `.prose-warm` convention. *(Neutralizes the landmine platform-wide on line 1.)*
- **Phase 2 — Reader indexes:** `/calendar`, `/decisions`, `/meetings`, `/members`, `/projects` (finish), `/this-week`.
- **Phase 3 — Reader details + handbook:** `/decisions/[slug]`, `/meetings/[slug]`, `/members/[slug]`, `/projects/[slug]`, `/handbook`.
- **Phase 4 — `/login`** (anonymous funnel entry; sign-in CTA via Pill or ink-on-amber — **not** `text-white` on `bg-accent-500`, which failed AA in the v0.4 a11y baseline).
- **Phase 5 — Functional E2E** (per-slice; see §10).
- **Phase 6 — Closeout:** `dark:` final sweep (grep-guard) + CHANGELOG + STATE flip + tag `community-platform-v0.9.0`.

---

## 6. Per-surface notes (from Explore inventory — all RESKIN)

| Surface | Current layout | Re-skin action | Render |
|---|---|---|---|
| `/calendar` | filtered list (events+meetings) | recipe; replace raw filter chips (`accent-600`/`neutral-200`) with `Pill`/chip; already uses `ListItem`+`EmptyState` | static |
| `/decisions` | single-column list | recipe + `ListItem` rows + `Tag` for status; **has `dark:`** | static |
| `/decisions/[slug]` | prose/markdown | recipe shell + `.prose-warm` (drop `prose-neutral dark:prose-invert`); **has `dark:`** | SSG |
| `/meetings` | month-grouped list | recipe mirroring `/events` (MonoLabel month headers + rows); **has `dark:`** | force-static |
| `/meetings/[slug]` | prose detail | recipe + `.prose-warm` + reskin `AddToCalendarButton`/`ThankButton`; **has `dark:`** | SSG |
| `/members` | 2-col card grid | recipe header + **reskin cards** (Avatar monogram, ink/dust, zero radii — keep grid per D7); **has `dark:`** | static |
| `/members/[slug]` | prose + metadata | recipe + `.prose-warm` + reskin `ContributionCard`/`GdprPanel`/`PersonaPanel`/`KudosCount`; **className-only** (force-dynamic, auth-aware — watch-item §13); **has `dark:`** | force-dynamic |
| `/this-week` | feed + form + list | recipe + reskin `StatusEditor` (+ its E2E, D8); `HomeFeed` done; **className-only** (force-dynamic); **has `dark:`** | force-dynamic |
| `/handbook` | section links | recipe shell around `FormalEntityMasthead` (done v0.7); tokenize section links | static |
| `/projects` | card grid (partial) | **finish** §18.1 deferred items: Geist h1, drop duplicate "Home" link, replace `rounded border` with flat aesthetic, full card reskin | static |
| `/projects/[slug]` | prose + contributors | recipe + `.prose-warm` + reskin `AskGBrainButton`/`TopContributors`/`ThankButton`; **has `dark:`** | SSG |
| `/login` | sign-in form | recipe-lite shell; CTA via `Pill` (AA-safe ink-on-amber) | — |

---

## 7. Dark-mode resolution

### 7.1 The fix
One line in `tailwind.config.ts`: add `darkMode: "selector"`. Under `selector`, `dark:` variants compile to selectors requiring a `.dark` ancestor; since none is ever rendered, all 74 variants become dead.

### 7.2 Safety proof (grep-verified 2026-05-27)
| Check | Result |
|---|---|
| Quoted `"dark"`/`'dark'` class literal (a toggle would use this) | none |
| `next-themes` / `useTheme` / `ThemeProvider` / `classList` / `data-theme` | none |
| `@media (prefers-color-scheme: dark)` CSS rule | none (only 2 anticipatory comments) |
| existing `darkMode` key | none (defaults to media) |

→ No `.dark` ancestor is ever rendered, so `media → selector` is **provably safe** (zero risk of activating the broken variants).

### 7.3 Purge strategy
- **Opportunistic:** strip dead `dark:` classes from each file as it's re-skinned (Phases 2-4).
- **Final sweep (Phase 6):** `grep -rln 'dark:' app/` must return zero. Any residue on surfaces v0.9 didn't touch (e.g., deferred forms/admin) gets a single mechanical strip pass so the book is fully closed (the flip already made them safe; this removes the grep noise that would re-trip a future smoke reviewer).

---

## 8. Accessibility & standards compliance (verified against current standards, 2026-05-27)

**Standards baseline:** WCAG **2.2** is the current W3C Recommendation (WCAG 3.0 remains a Working Draft — not a standard). Tailwind **v3.4.19** (latest v3); Next.js **16.2.6**; React **19.2.0**; Playwright **1.59**; axe-core **4.11**.

### 8.1 Target Size — WCAG 2.2 SC 2.5.8 (AA, 24×24px)
- **`Pill`** (~18px tall, the recipe's universal CTA) → enlarge to `min-h-[24px]` + `inline-flex items-center` (**D5**). Touches shipped Pill → re-smoke hero surfaces.
- **`Tag`** is a non-interactive `<span>` → 2.5.8 does **not** apply (contrast only).
- **`ListItem`** rows (`py-3` → ≥24px) and `EventCard` already pass.
- Audit other interactive chips during reskin: `KudosCount`, `ThankButton`, `AddToCalendarButton`, `AskGBrainButton`, `EventRsvpButton`.
- **Note:** axe-core's `target-size` rule is experimental and not a reliable gate — conformance is verified manually + by the 24px target contract.

### 8.2 Contrast — WCAG 1.4.3 (text AA 4.5:1) / 1.4.11 (non-text AA 3:1)
`dust` (`#886c37`) was tuned for AA on `cream`. The recipe uses `dust` on **multiple** backgrounds (e.g., `paper #ffffff` in `ListItem`, `cream-deep #fdebc9`) at 10-12px. Each `dust`-on-bg pairing for small text must hold 4.5:1 — gated empirically by the axe sweep (§8.3); implementers must not introduce `dust` on an untested background without re-running it.

### 8.3 a11y E2E coverage gap (improvement)
The existing `v0-4-a11y`/`v0-6-a11y` specs sweep only the redesigned hero surfaces. **v0.9 extends the axe sweep to every new reader surface** (anonymous-accessible ones directly; auth-gated ones via the per-slice functional E2E with `@axe-core/playwright`). This is the empirical gate for §8.1 + §8.2 + focus.

### 8.4 Focus — WCAG 2.2 SC 2.4.7 (focus visible, AA) / 2.4.11 (focus not obscured, AA)
`:focus-visible` rings already global (globals.css). Recipe a11y invariant requires focus-visible on every interactive element. If the Header is sticky, verify in-page focus targets after skip-link/anchor nav are not obscured (2.4.11) — verification item.

### 8.5 Already meeting current standards (affirmed)
Semantic CSS-var design tokens · `prefers-reduced-motion` handling · `<main id="main">` + skip-link + `aria-labelledby` landmark structure · `force-dynamic` for auth surfaces (correct under Next 16 — no Cache Components needed for a CSS reskin).

---

## 9. Rendering & framework posture (Next 16 / React 19 — preserved)

The reskin is **className-only**; no rendering-strategy changes. Each surface keeps its current route-segment config (from the Explore inventory):
- **Static / SSG:** `/calendar`, `/decisions` (+`[slug]`), `/members`, `/handbook`, `/projects` (+`[slug]`), `/meetings/[slug]`.
- **`force-static`:** `/meetings`.
- **`force-dynamic`:** `/members/[slug]`, `/this-week` (request-time `auth()` — correct under Next 16; **no** Cache Components / `use cache` migration needed for a CSS reskin).

No Server↔Client component boundary changes except where a surface already required them. React 19.2.0 + Next 16.2.6 stay as-is. This keeps the cache/edge posture (ADR-0012/0014 discovery surfaces) intact.

---

## 10. E2E plan — Phase 5 (per-slice, D4)

**Author against the redesigned reader surfaces** (Playwright 1.59 standards: **role-based locators** `getByRole`, **web-first auto-retrying assertions** `await expect(locator).toBeVisible()`, **no `waitForTimeout`**, trace-on-first-retry, browser projects):
- Discovery / nav happy path (`/`, `/home`, `/events`, `/meetings`, `/calendar`, `/members`, `/decisions`, `/projects` render + cross-nav).
- ICS subscribe (`/api/calendar.ics`) + AddToCalendar download.
- RSVP toggle on `/events/[slug]` (already redesigned — testable now).
- Thanks click (`/this-week`, `/meetings/[slug]`, `/projects/[slug]`).
- Status post on `/this-week` (D8).
- Re-run `v0-4`/`v0-6` a11y specs **plus the extended sweep** (§8.3) after each phase.

**Defer to v0.9.1:** profile-save, invite, event-create, RSVP-race + `test-reset-profile` route.

---

## 11. Testing & verification

- **Per-surface source-scan tests** generalizing the v0.8.1 `projects-page.test.tsx` pattern: assert no `dark:`, no `neutral-*`/`gray-*`/`rounded border` scaffolding, recipe tokens present.
- **Per-phase full-suite verification** (the v0.6/v0.8 discipline — `pnpm test` + `pnpm tsc --noEmit` + `pnpm lint` green at every phase boundary).
- **a11y axe sweep** extended to all v0.9 reader surfaces, run after each phase (§8.3).
- **3-lane reviewer triage** (security / typescript / code-quality) before merge.
- **Mandatory soft-nav + hover/focus smoke** on every re-skinned surface before claiming done — `browser_click` a nav link (soft-nav active-state) + `browser_hover` cards/buttons (hover-state), not just `goto`+screenshot (per `feedback_visual_smoke_soft_nav_hover` — exactly what missed the v0.8.1 bugs).
- **Re-smoke the 4 hero surfaces** after the Pill 24px change (D5 blast radius).

---

## 12. Hardenings (H97–H103 — H96 is the current max)

| ID | Hardening | Test approach |
|---|---|---|
| **H97** | `tailwind.config.ts` `darkMode === "selector"` | config source-scan test (can never silently revert to media) |
| **H98** | Zero `dark:` variants remain in `app/` after final sweep | grep-guard test |
| **H99** | Reader surfaces use recipe tokens — no `neutral-*`/`gray-*`/`rounded border` scaffolding | per-surface source-scan |
| **H100** | `Tag.tsx` re-skin meets AA contrast on its background | unit + axe |
| **H101** | Interactive chips meet 24×24 target (or documented Spacing exception) | `Pill` source-scan asserts `min-h-[24px]`; manual conformance note |
| **H102** | a11y axe sweep covers every v0.9 reader surface | E2E spec asserts surface list |
| **H103** | Recipe a11y invariant: `<main id="main">`, single `<h1>`, `MonoLabel` section labels, focus-visible on interactives | per-surface source-scan + axe |

---

## 13. Risks & watch-items

- **`/this-week` + `/members/[slug]`** are `force-dynamic` with live interactive components (`StatusEditor`, `ThankButton`, `GdprPanel`, `PersonaPanel`) — keep reskins **className-only** to avoid disturbing write/auth behavior.
- **Shared components** (`SafeHtml`, `ThankButton`, `StatusEditor`) get done in v0.9 → already finished when v0.9.1 touches forms (bonus), but v0.9 tests must cover their **reader** usage.
- **`Pill` 24px change** touches a shipped primitive used on hero surfaces → re-smoke `/`, `/home`, `/events`, `/events/[slug]` for the (small) height delta.
- **`Tag.tsx`** is the only non-mechanical reskin (variant API + O12 `status:proposed` accent rule to preserve).
- **`/login` CTA** must not regress to `text-white` on `bg-accent-500` (the v0.4 a11y baseline failure ~1.88:1) — use `Pill` (ink-on-amber) or a tokenized AA-safe button.

---

## 14. Non-goals (deliberate, current-standards-aware)

- **Tailwind v4 migration.** v4 (CSS-first `@theme`) is the industry-current major; we're on the latest v3 (3.4.19). Migrating is a breaking, repo-wide effort — **out of scope** for a CSS reskin (surgical-changes). Logged as its own future backlog cycle.
- **Real dark mode.** The v0.4-deferred 200+-contrast-pair + toggle build. Contradicts the deliberate fixed-cream brand (brand.md, v0.6 O8); deserves its own cycle if ever.
- **Forms / admin redesign** → v0.9.1 (safe after the flip).
- **CSP / security headers** (backlog, chat-23 §7) — separate security-mode scope.

---

## 15. Decisions log / ADR note

**No new ADR.** The `darkMode: "selector"` flip is reversible config; the redesign applies the locked v0.6 warm-maximalist system (ADR-0014's amber posture) to more surfaces. The "no dark mode" posture was already implicit in v0.6 O8. Should a real dark-mode build ever be greenlit, *that* needs an ADR.

---

## 16. Execution & handoff

Next: `superpowers:writing-plans` produces `projects/community-platform/v0.9.0-plan.md` referencing this design doc + spec §19. The implementation chat runs `superpowers:subagent-driven-development` against the 6 phases above (one Sonnet implementer per phase, full-suite verification at each boundary), then 3-lane reviewer triage → PR → tag `community-platform-v0.9.0` → post-merge STATE flip. Same playbook as v0.6/v0.8.
