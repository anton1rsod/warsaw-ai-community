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

## What's already done (don't redo)

- **v0.7.0 brand v1.2 wire-in** — PR **#41** (`chore/community-platform-v0-7-brand-v1-2-wire-in`). **Verify it's merged before starting** (`gh pr view 41`). It added: BrandStar (`*`), CityChip (WARSAW chrome chip), FormalEntityMasthead, Geist nav + /handbook masthead, footer formal-entity line. Spec at `projects/community-platform/spec.md` §17; CHANGELOG `[0.7.0]`.
- **Geist is already loaded** (`app/layout.tsx`, `--font-geist`, weights 400/500/600) and there's a `font-geist` Tailwind token. JetBrains Mono now also has weight 500.
- **Brand assets are all exported + committed on `main`:**
  - `community/brand/assets/` — lockup (light/dark), PL mark, wordmark, PNG icon exports.
  - `community/brand/assets/locations/` — Warsaw/Kraków/Gdańsk location sub-marks (PNG).
  - `community/brand/explorations/chat-41/boards-png/` — PNGs of all 10 exploration boards (favicon, S-colour, trailing-`*`, wire-in v1–v5, §4.5 sub-marks, 34-mark contact sheet). **Open these to SEE the intended style.**

## Read order for the next chat

1. **This handoff.**
2. **`community/brand/brand.md`** — §2 typography, §3 lockup, §4 elements, §10 v1.2. The brand source of truth.
3. **`community/brand/explorations/chat-41/boards-png/`** — eyeball the logo style you're matching (esp. `q3-wire-in-execution-v5.png` = how the logo sits in the platform chrome).
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
- A vector **SVG** export of the location sub-marks is still pending (the city stamp uses the JetBrains Mono web font; pathing it needs the JetBrains Mono TTF). Only PNGs exist so far.
