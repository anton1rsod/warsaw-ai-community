# Handoff — Community Platform typography + UI/UX brand alignment (chat-43)

**Date:** 2026-05-26 · **From:** chat-42 (v0.7.0 brand v1.2 wire-in) · **For:** the next chat.

## Goal

Change the platform **display font** and do a round of **UI/UX work** so the website matches the **Subploters logo style**. The logo is clean **Geist** sans (see assets); the platform's display type is still **Fraunces** (serif) from the v0.6 "warm-maximalist" redesign. The job is to close that gap and make the site feel like the brand.

## The central tension (read this first)

The platform is currently **split-brain on typography**:

- **Logo / brand** = **Geist** (the lockup is path-drawn Geist SemiBold; brand.md §2 names Geist as the display family).
- **Platform display** = **Fraunces** (a serif). The v0.6 redesign (chat-35) wired `font-display` → Fraunces for all headings/heroes.
- **v0.7 (chat-42)** loaded real **Geist** via `next/font/google` as `--font-geist` + a `font-geist` Tailwind token, but **scoped it to only the Header nav + the /handbook masthead headline**. Everything else still uses Fraunces.

So "match the logo style" most likely means **migrating display typography Fraunces → Geist** across the platform — the migration that's been flagged as "pending" since chat-38/39. That is a real visual redesign (think **v0.8**), not a one-line swap, because the whole v0.6 aesthetic (Fraunces italic display, warm-maximalist personality) was built around the serif. Decide deliberately how far to take it.

## Open scope question for the brainstorm (the main decision)

How far does "match the logo" go? Sketch options, get Anton's call:
1. **Minimal** — repoint `font-display` Fraunces → Geist globally (drop Fraunces), keep everything else. Fastest; but Geist is not italic-friendly, and lots of v0.6 surfaces lean on Fraunces italic — they'll need rework.
2. **Typographic realignment (likely v0.8)** — Geist for display + headings, keep Inter body / JetBrains Mono voice, re-tune sizes/weights/letter-spacing to sit right next to the lockup, revisit the Fraunces-italic flourishes.
3. **Broader visual pass** — typography + spacing + dialing the warm-maximalist personality toward the cleaner Geist logo aesthetic (hero treatments, cards, chrome). Biggest; closest to "feels like the brand."

Also decide: keep the warm-maximalist amber/cream/ink palette (it's on-brand) — this is about *type + feel*, not colour.

**Definitely in scope regardless of the above:** the platform still ships the **old PL-monogram favicon + PWA icons** (`projects/community-platform/public/icons/` + `public/favicon.ico` were generated from `subploters-mark*`). v1.2 retired the standalone PL monogram → swap these to the **amber-field S** from `community/brand/exports/symbol/` (`favicon.ico` + `subploters-symbol-{192,512}.png`, apple-touch from the 180px). Also grep the platform for any standalone `subploters-mark` / PL-monogram usage and move it to the S symbol. Update `app/layout.tsx` metadata icons + `manifest.json` if paths change.

## What's already done (don't redo)

- **v0.7.0 brand v1.2 wire-in** — PR **#41** (`chore/community-platform-v0-7-brand-v1-2-wire-in`). **Verify it's merged before starting** (`gh pr view 41`). It added: BrandStar (`*`), CityChip (WARSAW chrome chip), FormalEntityMasthead, Geist nav + /handbook masthead, footer formal-entity line. Spec at `projects/community-platform/spec.md` §17; CHANGELOG `[0.7.0]`.
- **Geist is already loaded** (`app/layout.tsx`, `--font-geist`, weights 400/500/600) and there's a `font-geist` Tailwind token. JetBrains Mono now also has weight 500.
- **Production asset kit already exists at `community/brand/exports/`** (Anton, commit `dad816e`) — the canonical, path-drawn (font-independent) SVG + PDF + multi-res PNG set: `lockup/` (light+dark), `symbol/` (amber-field S + `favicon.ico`), `wordmark/`, `city-stamp/` (tilted + upright chrome), `location-submark/` (Warsaw, vector), `og/` (1200×630), `telegram/`. See `exports/README.md`. **This is the source of truth for assets — use it, don't re-export.**
- **NEW v1.2 standalone symbol = the amber-field "S"** (`assets/subploters-symbol.svg` + `exports/symbol/`). It **retires the standalone PL monogram** (`subploters-mark.svg` is now deprecated/inline-only). See brand.md §4.2. The "S" is what shows up small: favicon, avatar, app icon, Telegram photo.
- `community/brand/explorations/chat-41/boards-png/` — PNGs of all 10 exploration boards (favicon, S-colour, trailing-`*`, wire-in v1–v5, §4.5 sub-marks, 34-mark contact sheet). **Open these to SEE the intended style.**

## Read order for the next chat

1. **This handoff.**
2. **`community/brand/brand.md`** — §2 typography, §3 lockup, §4 elements, §10 v1.2. The brand source of truth.
3. **`community/brand/exports/`** (+ `exports/README.md`) — the production asset kit + the amber-field S symbol you're matching. And **`community/brand/explorations/chat-41/boards-png/`** — eyeball the explorations (esp. `q3-wire-in-execution-v5.png` = how the logo sits in the platform chrome).
4. **`projects/community-platform/STATE.md`** — current platform state (v0.7).
5. **`projects/community-platform/app/layout.tsx`** + **`tailwind.config.ts`** — current font loading + tokens (`font-display`=Fraunces, `font-body`=Inter, `font-voice`=JetBrains, `font-geist`=Geist).
6. **`projects/community-platform/spec.md` §16 (v0.6 redesign) + §17 (v0.7 wire-in)** — the aesthetic this builds on.

## Process

- **Brainstorm FIRST** (`superpowers:brainstorming`) — this is design/scope/feature discovery; do NOT jump to code, even if it feels obvious (see memory `feedback_dont_skip_brainstorming`). Lock the scope question above.
- Then `superpowers:spec-writer` → `superpowers:writing-plans` → `superpowers:subagent-driven-development`.
- Consider `design-shotgun` / `design-html` for visual options on the new type system (Anton responds well to seeing real mockups, not abstract choices).
- This is a CI-triggered code path → ships via a PR + version bump (likely **v0.8.0** if it's a real redesign).
- TDD discipline preserved; full suite must stay green (v0.7 baseline = 1216 tests).

## Notable gotchas carried from chat-42

- **`font-display` ≠ Geist** — it's Fraunces. Don't assume a token's name matches its font; check `tailwind.config.ts`.
- **Tests live in `tests/unit/`** (e.g. `tests/unit/components/footer.test.tsx`, `header-v0-6.test.tsx`, `layout-fonts.test.tsx`) — NOT co-located. Run the **full** suite (`pnpm test -- --run`), not narrow globs, to catch stale-string failures.
- **Geist has no true italic** — any Fraunces-italic surface migrating to Geist needs a non-italic treatment decision.
- **Use `community/brand/exports/` as the asset source, not `assets/` ad-hoc.** The exports are path-drawn vector (SVG/PDF) + multi-res PNG. (chat-42 briefly created a redundant `assets/locations/` PNG set before spotting `exports/location-submark/` already had Warsaw as vector — that redundant folder was removed.)
- The **standalone symbol is the amber-field S** (`exports/symbol/`), NOT the PL monogram (retired v1.2, inline-only). Don't wire the PL monogram anywhere standalone.
