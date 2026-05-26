# Design — Community Platform v0.8: Typography realignment + brand polish

**Date:** 2026-05-26 · **Chat:** 43 · **Status:** Design (awaiting Anton review → spec-writer §18 → writing-plans)
**Brand source-of-truth:** `community/brand/brand.md` §2 (typography), §4.2 (amber-field S), §10 (v1.2).
**Builds on:** v0.6.0 (`spec.md` §16, warm-maximalist) + v0.7.0 brand chrome wire-in (`spec.md` §17, PR #41).

---

## 1. Problem / context

The platform is **split-brain on typography**. The Subploters logo is clean geometric **Geist** (brand.md §2: *Display = Geist; "Fraunces italic is dropped as of 2026-05-23"*). But the platform's display type is still **Fraunces** (serif italic) from the v0.6 warm-maximalist redesign — so every headline ("This week, Anton—", "Events.", "AI Community | Meetup #4"), accent line, and empty state renders in a swashy serif sitting directly under the geometric Geist wordmark.

The platform is therefore **out of compliance with its own brand**. Dogfooding (signed-in `/home`, `/events`, `/events/[slug]`, mobile) confirmed:
- The single consistently off-brand element is the **Fraunces display type**. The palette (amber/cream/ink/dust), amber date chips, ink "going" pills, 1.5px-bordered 0-radius cards, and mono `//` section labels are all already on-brand.
- A secondary, type-independent bug: `main` lacks `flex-1`, so on sparse pages the footer floats mid-viewport with dead cream below ("top-loaded emptiness").
- The favicon/PWA icons are still the **retired PL monogram** (v1.1 standalone, dropped in v1.2 → §4.2 amber-field S).

This work brings the platform into brand compliance. It is a **typographic realignment**, not a redesign — the brand-correct non-type elements are left untouched.

## 2. Scope (locked)

**In scope:**
1. Migrate display type **Fraunces → Geist** across the platform.
2. Deliberately re-treat the Fraunces-**italic** surfaces (Geist has no true italic).
3. Fix the footer/density layout bug.
4. Swap favicon/PWA icons to the **amber-field S**.

**Out of scope (explicit):**
- Colour palette (amber/cream/ink/dust stays — this is about *type + feel*, not colour).
- Chips, pills, cards, 0-radius motifs, 1.5px rules, mono `//` labels.
- Body / markdown prose (already Inter — untouched).
- New content modules, card/hero re-layout, navigation changes (the "broader visual pass" was declined; nav→Geist chrome stays in PR #41's lane — see §9).

## 3. Decisions (locked via visual brainstorm, chat-43)

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Headline treatment | **Geist SemiBold 600**, tight tracking (≈ −0.026em), trailing flourish (`—` / `.`) **recolored amber** | Matches the lockup weight; warmth moves from serif → amber punctuation |
| 2 | Accent / empty-state lines | **JetBrains Mono, dust** ("system voice") | Ties to the `//` labels; leans into the brand's terminal voice |
| 3 | Layout density | **Footer pinned** (`flex-1`); content **anchored top** with breathing room | Safe as activity grows; footer-pin alone kills most empty feeling |
| 4 | Favicon / PWA | **Amber-field S** byte-swap from `exports/symbol/` | §4.2; PL monogram retired |
| A | Token strategy | Keep token name **`font-display`**, repoint family → Geist; retire any `font-geist` token | 19 usages already reference `font-display` vs 2 for `font-geist` — least churn |
| B | PR #41 relationship | **Self-contained** — v0.8 loads Geist itself and ships independently of #41 | #41 may linger; v0.8 must not block on it (see §9) |

## 4. Type system

### 4.1 Font loading — `app/layout.tsx`
- **Add Geist** via `next/font/google` (`Geist`, weights `400/500/600`, `--font-geist`, `display: "swap"`). *(Self-contained: Geist is NOT loaded on current `main`.)*
- **Remove Fraunces** entirely: drop the `Fraunces` import, `--font-fraunces`, `style: ["normal","italic"]`, and the `SOFT`/`WONK` axes. One fewer font payload.
- Keep **Inter** (`--font-inter`) and **JetBrains Mono** (`--font-jetbrains`) unchanged. Update the `<html>` `className` to expose `--font-geist` instead of `--font-fraunces`.

### 4.2 Tokens — `tailwind.config.ts`
- `fontFamily.display` → `["var(--font-geist)", "system-ui", "sans-serif"]` (was Fraunces/Georgia/serif). **Token name `display` is preserved** so all 19 existing `font-display` usages flip to Geist automatically.
- `fontFamily.body` = Inter (unchanged); `fontFamily.voice` = JetBrains Mono (unchanged).
- No standalone `font-geist` token on the self-contained base. (If #41 merged first, fold its `font-geist` into `display` — §9.)

### 4.3 Headline rendering (decision 1)
Display headlines currently carry `font-display italic font-black` (Fraunces ~900 italic). New contract:
- `font-display` (now Geist) + weight **600** (`font-semibold`) — drop `font-black`/`italic`.
- Tight tracking via the existing `tracking-tight` utility (or a tuned value if 600 needs it).
- Trailing flourish punctuation (`—`, `.`) wrapped and colored **amber** (`text-accent-500`) where it exists today (hero em-dash, "Events.").

## 5. Italic migration (the careful part)

Geist and JetBrains Mono have **no true italic** → **zero `italic` classes may remain** on `font-display`/`font-voice` surfaces after this work. Inter italic is **not** introduced. Each usage below is mapped; plan-writing produces the line-level edits + a test per surface.

### 5.1 Display titles → **Geist 600 roman** (drop `italic`, drop `font-black`→`font-semibold`)
| File:line | Surface |
|---|---|
| `AnonymousHero.tsx:58` | Anonymous hero ambition headline (40px) |
| `AnonymousHero.tsx:70` | Anonymous hero sub-headline (18px) |
| `YourWeekPane.tsx:78` | `/home` "This week, {name}—" hero (40px) |
| `events/page.tsx:62` | `/events` "Events." headline (40px) |
| `events/[slug]/page.tsx:185` | Event-detail title (36px) |
| `EventCard.tsx:54` | Event card title (14px) |
| `ListItem.tsx:66` | List-item title (13px) |
| `HomeFeed.tsx:55` | Ship-item linked title |
| `HomeFeed.tsx:91` | Ship-item title (14px) |

### 5.2 Accent / empty-state copy → **JetBrains Mono (`font-voice`), dust** (drop `italic`)
| File:line | Surface |
|---|---|
| `YourWeekPane.tsx:105` | "Next meetup lands soon. Watch this strip." |
| `events/page.tsx:82` | `/events` upcoming empty-state ("No upcoming meetup scheduled…") |
| `events/page.tsx:109` | `/events` secondary empty-state |
| `EmptyState.tsx:40` | Generic empty-state headline |
| `EmptyState.tsx:42` | Generic empty-state sub-line |
| `EventRoster.tsx:93` | Roster empty-state ("No one's going yet") |
| `EventRoster.tsx:118` | Roster empty-state ("No one's marked interested yet.") |

Mono accent lines render slightly smaller (mono runs large) and keep their existing `text-dust` / `text-ink` color per context (empty states = dust). These are **short "system voice" asides** — the mono treatment from decision 2.

### 5.2b Body paragraph that was italic → **Inter roman** (drop `italic`, stay body)
| File:line | Surface |
|---|---|
| `AnonymousHero.tsx:63` | Login-hero supporting value-prop paragraph (currently `font-body italic`) — it's body copy, not a short aside; a full paragraph in mono would read heavily, so it simply drops the italic and stays Inter roman |

**Note — non-italic `font-display` usages:** the ~10 `font-display` usages that are *not* italic flip to Geist automatically when the token is repointed (§4.2) — no per-line edit, but tests assert the new family.

### 5.3 Footer copyright (chrome) → **`font-voice` (mono)**, drop `italic`
| File:line | Surface |
|---|---|
| `Footer.tsx:61` | "© 2026 Subploters · …" copyright (currently `font-display italic`) — joins the footer's existing `font-voice` links for chrome consistency |

### 5.4 Stale comments / config
- `layout.tsx:10` — removed with the Fraunces config.
- Doc-comment mentions of "Fraunces" / "serif italic": `ListItem.tsx:10`, `Footer.tsx:5`, `EmptyState.tsx:7`, `AnonymousHero.tsx:27` — update to reflect Geist / mono.

## 6. Layout / density fix — `app/components/RootShell.tsx`

Today `RootShell` renders `<Header/>{children}<Footer/>` and each page owns a `<main className="mx-auto max-w-3xl px-4 py-8">` with **no `flex-1`**. In the `min-h-screen flex flex-col` body, `main` doesn't grow → footer floats up on short pages.

**Fix:** wrap `{children}` in a `flex-1` container in `RootShell` (single change, applies to every route) so the footer pins to the viewport bottom. Content stays **top-anchored** with a comfortable top offset (breathing room, not jammed under the header). No per-page `<main>` changes required beyond the wrapper; the `/login` (no-chrome) variant is unaffected (it returns `{children}` directly).

## 7. Favicon / PWA swap — `public/`

Byte-copy from `community/brand/exports/symbol/` (already rendered at every size) over the current PL-monogram files, **keeping filenames** so `layout.tsx` `metadata.icons` + `manifest.json` need no code change:

| Source (`exports/symbol/`) | Destination (`public/`) |
|---|---|
| `favicon.ico` | `favicon.ico` |
| `subploters-symbol-192.png` | `icons/icon-192.png` |
| `subploters-symbol-512.png` | `icons/icon-512.png` |
| `subploters-symbol-180.png` | `icons/apple-touch-icon.png` |

`manifest.json` `theme_color` (`#f59e0b`) + `background_color` (`#fef6e6`) already correct. The dormant `public/branding/subploters-mark.svg` (PL) is not wired anywhere standalone — left as-is.

## 8. Surfaces & components touched

`app/layout.tsx`, `tailwind.config.ts`, `app/components/RootShell.tsx`, `public/favicon.ico` + `public/icons/*`, and the type-bearing components/pages: `HomeFeed`, `AnonymousHero`, `YourWeekPane`, `EmptyState`, `ListItem`, `EventCard`, `EventRoster`, `Footer`, `events/page`, `events/[slug]/page`. Markdown/prose body is **not** touched.

## 9. Relationship to PR #41 (self-contained)

v0.8 is built on current `main` and does **not** depend on PR #41 (v0.7.0 brand chrome wire-in: BrandStar, CityChip WARSAW, FormalEntityMasthead, Geist nav, footer entity line). v0.8 owns the **display-type migration + accent lines + density + favicon**; #41 owns the **brand chrome wire-in** (incl. nav→Geist). They are complementary, not overlapping.

**Reconciliation (whichever merges second rebases):**
- If **#41 merges first:** v0.8 rebase folds #41's `font-geist` token + its 2 usages into `font-display` (decision A), de-dupes Geist loading (load once), and keeps #41's chrome additions. v0.8's display migration then also covers #41's masthead/nav consistently.
- If **v0.8 merges first:** #41 rebase finds Geist already loaded as `font-display`; its nav/masthead changes reference `font-display` instead of adding `font-geist`.

Recommended order remains **#41 first** (it's READY-TO-SHIP), but v0.8 does not block on it.

## 10. Testing strategy (TDD)

- **Baseline:** full suite must stay green (v0.6 = 1191; v0.7/#41 adds ~25 → ~1216 if merged). Tests live in `tests/unit/` (NOT co-located). Run the **full** suite (`pnpm test -- --run`), never narrow globs — stale-string failures are the primary hazard (GOTCHAS).
- **Update** existing assertions referencing `font-display`(=Fraunces semantics), `italic`, `--font-fraunces`, `font-fraunces` → new contract.
- **New assertions:**
  - `tailwind.config` `display` token resolves to `var(--font-geist)`; no Fraunces import in `layout.tsx`.
  - No `italic` class on any `font-display`/`font-voice` element (grep-style + render assertions on the §5 surfaces).
  - Accent/empty-state surfaces render `font-voice` + dust (not `italic`).
  - `RootShell` emits the `flex-1` wrapper around children (footer-pin contract).
  - Icon metadata + manifest reference the S files (paths unchanged; assert files exist & are the S, not PL — e.g., byte-size/hash sanity or a marker).
- **Coverage:** maintain ≥80% gate; keep v0.6/v0.7 strict-list files at 100% where they were.

## 11. Accessibility / contrast

- **dust `#886c37` on cream `#fef6e6`** for the mono accent lines: must hold **AA 4.5:1** for body-size text. v0.6 already darkened dust (`#8b6f3a` → `#886c37`) for exactly this gate (`#886c37` ≈ 4.5:1) — re-verify after the migration since accent copy is now mono (re-confirm at the rendered sizes; mono at 12–14px is "normal" text, needs 4.5:1).
- Geist headlines are large/bold (600, ≥18px) → "large text" 3:1, comfortably met by ink-on-cream.
- Preserve `focus-visible` parity (H88) and existing a11y specs (`v0-6-a11y.spec.ts`).

## 12. Version & ship mechanics

- CI-triggered path (`projects/community-platform/**`) → ships via **PR + version bump to v0.8.0**, tag `community-platform-v0.8.0`.
- `spec.md` gains **§18**; `CHANGELOG.md` `[0.8.0]`; `STATE.md` flipped at closeout (same commit as CHANGELOG).
- Lighthouse: keep the v0.6 budget (LCP ≤ 2.5s mobile); dropping Fraunces is a net perf win.

## 13. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Stale-string test failures across many files | Run full suite; treat test updates as part of each surface's task; TDD |
| Geist metrics differ from Fraunces → headlines mis-sized | `tracking-tight` + per-surface size review; the brainstorm mock validated 600/−0.026em |
| Mono accent lines fail dust-on-cream AA at small sizes | §11 contrast re-verify; bump size or darken dust if needed (precedent exists) |
| PR #41 rebase conflict on fonts/Header/Footer | §9 reconciliation; whichever lands second rebases; recommend #41 first |
| Footer/Header wordmark visual shift | Intended (→ Geist, ties to logo); verify in preview |

## 14. Out of scope / backlog

- Nav → Geist (PR #41 chrome wire-in).
- BrandStar `*` on plain-text wordmark mentions (PR #41 / brand convention §3).
- Markdown prose heading hierarchy ("Agenda/When/Where" render flat) — note only; not a brand item.
- Any colour/layout "broader visual pass" (declined).

## 15. Success criteria (verifiable)

1. No `Fraunces`/`--font-fraunces`/`font-fraunces` references remain in the platform (grep clean).
2. No `italic` class on any `font-display`/`font-voice` element (grep clean).
3. `font-display` resolves to Geist; Geist loaded via `next/font`.
4. Footer pins to viewport bottom on a sparse page (e.g., signed-in `/home`) — visually + `RootShell` `flex-1` test.
5. Favicon + PWA icons render the amber-field S (not PL) in a real browser tab.
6. Full test suite green; coverage ≥80%; Lighthouse budget held.
7. Signed-in `/home`, `/events`, `/events/[slug]` headlines render Geist 600 with amber flourish; accent/empty-state lines render mono dust — confirmed in preview.
