# Brand

**Status:** v1.1 — locked 2026-05-23 (chat-37 — typographic-only resolution). Supersedes v1 (chat-36 — Subploters identity, mark form unresolved) and v0 (April 2026, "Warsaw AI Community" placeholder identity).

---

## 1. Architecture

| Layer | Value | Purpose |
|---|---|---|
| **Primary brand** | **Subploters** | The universal name. Domain, social handles, daily speech, the wordmark on every surface. |
| **Member identity** | **Subploter** (one) / **Subploters** (community) | What members call themselves. *"I'm a Subploter"* is the identity claim. |
| **Community name** *(per location)* | **Professional Subploter Community** | The community at any one location. Warsaw has one; future cities each get their own. |
| **Formal entity** | **Professional Subploters Association** | The Polish *Stowarzyszenie* (when registered). Used on legal docs, About-page masthead, registration plaque. |
| **Insider abbreviation** | **PSA** *(global)* / **PSC** *(per community)* | Member-to-member shorthand. *"I'm with PSA"* = global network, *"PSC Warsaw"* = a specific community. |
| **Tagline** | **Every venture is a subplot.** | Primary tagline. Declarative, on-metaphor. |
| **Founding** | Warsaw, Poland — 2024 | First community. Externally treated as equal among future locations (no "main" / "HQ" labeling in branding). |

The architecture is a **two-piece compositional system**: the universal wordmark `Subploters` plus a replaceable city stamp `PSA · CITY`. Used separately or together depending on context. **No separate symbol mark** — the brand is wordmark-led, in the family of Linear / Stripe / Notion / Vercel (see §3).

---

## 2. Visual identity

### Color palette

| Role | Color | Hex | Usage |
|---|---|---|---|
| Accent | Warm amber | `#f59e0b` | Asterisk, city tag background, accent rules. **Use as accent, not as field.** |
| Field | Cream | `#fef6e6` | Default background. Page, card, deck cover background. |
| Ink | Deep navy-ink | `#1a1a2e` | Text, wordmark, rules, tag text. |
| Supporting | Dust | `#886c37` | Captions, metadata, JetBrains Mono small text, dust-on-cream secondary text. |

### Typography

| Role | Typeface | Weight | Source |
|---|---|---|---|
| Display | **Geist** | 500 / 600 / 700 | Google Fonts (Vercel) |
| Body | **Inter** | 300–700 | Google Fonts |
| Voice / code / mono | **JetBrains Mono** | 400 / 500 / 600 | Google Fonts |

Fraunces italic is **dropped** as of 2026-05-23 (v0.7 brand revision).

### Geometric motifs

- **0 border-radius** on all elements — geometric, decisive, no rounded corners.
- **1.5px rules** for all dividers and underlines.
- **−1.5° rotation** for amber tags (the v0.6 motif, inherited).

---

## 3. No separate symbol mark — Subploters is a wordmark-led brand

The brand has **no separate symbol mark**. The wordmark `Subploters` (Geist 600, ink) is the primary identity on every surface. Small-surface treatments (favicon, social avatar, member badges) use a typographic `S` in Geist 700, amber on cream. The city stamp `PSA · CITY` (§4.3) provides location identification alongside the wordmark.

**Why wordmark-only:** Chat-36 explored ~7 mark directions (radial asterisk, dagger, reference mark, name-rooted glyphs, typographic alternatives, gem cuts, refined brilliants) across ~40 individual candidates. None landed. The pattern across rejections — every direction was a *separate symbol* — was the signal: the wordmark itself should *be* the brand. Chat-37 (2026-05-23) locked the wordmark-led decision; this places Subploters in the visual family of **Linear**, **Stripe**, **Notion**, and **Vercel** — restraint-led modern brands where type-as-identity does the work a symbol usually does.

This decision is reversible. A custom symbol mark can be commissioned at a later inflection (second city launch, formal *Stowarzyszenie* registration, brand refresh) without rework of the wordmark, color palette, or city-stamp system. The locked spec already aligns with a future symbol if one is added.

### What's locked

| Specification | Value |
|---|---|
| Primary mark | The wordmark `Subploters` itself — Geist 600 ink on cream |
| Small-surface treatment | Typographic `S` (single character) in Geist 700, amber `#f59e0b` on cream `#fef6e6` |
| Standalone usage | The wordmark stands alone — no glyph, no decoration after the name |

### What's deliberately NOT in the brand

- A separate glyph, monogram, asterisk, or signature mark following the wordmark
- A radial/sparkle/star symbol of any kind (rejected as Claude/Anthropic-adjacent in chat-36)
- Any pictorial logo, illustration, or photographic identity element

The `assets/asterisk.svg` file in this directory is a **chat-36 rejected iteration candidate** retained as archive. It is NOT part of the brand. See `docs/specs/2026-05-23-subploters-brand-mark-handoff.md` for the full iteration history.

---

## 4. Elements

### 4.1 Master wordmark

`Subploters` — the universal global mark. Geist 600 ink on cream. Set in regular caps-with-descenders (the "Subploters" word, not all-caps). Letter-spacing kept at the font's natural value; no tracking adjustment.

Used on: domain, social profiles, marketing, merch, primary brand contexts.

### 4.2 Favicon & small-surface treatment

A single character `S` set in **Geist 700**, color **amber `#f59e0b`** on **cream `#fef6e6`** field, no rotation, no decoration. Used at small sizes where the full wordmark would be illegible.

| Specification | Value |
|---|---|
| Glyph | Capital `S` only |
| Typeface | Geist (variable, weight 700) |
| Glyph color | Amber `#f59e0b` |
| Field color | Cream `#fef6e6` |
| Border-radius | `0` (square edges; PWA platforms add their own corner masks) |
| Padding | Glyph optically centered; ~10–14% of canvas as breathing room on each side |
| Sizes | 16×16, 32×32, 180×180 (apple-touch), 192×192, 512×512 (PWA) |

Used on: favicons (`favicon.ico`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`), social avatars (`@subploters`), member badges, watermarks, signage, anywhere the brand needs to be present at small sizes.

The `S` is **not a separate mark** — it is the wordmark's first letter, isolated for size constraints. At medium and large sizes, the full wordmark always replaces the single-character treatment.

### 4.3 City stamp

The amber tag treatment with `PSA · CITY` inside.

| Specification | Value |
|---|---|
| Format | `PSA · CITY` (interpunct between PSA and city name) |
| Typography | JetBrains Mono, weight 500, all caps, letter-spacing 0.18em–0.20em |
| Background | Amber `#f59e0b` |
| Text color | Ink `#1a1a2e` |
| Padding | Generous: `12px 24px` standard, `18px 32px` large, `6px 14px` small |
| Border-radius | `0` |
| Rotation | `-1.5°` |

Used on: location sub-marks, deck cover location tag, member badges, location-specific signage, social profile city designation.

### 4.4 Formal entity lockup

`Professional Subploters Association`

| Specification | Value |
|---|---|
| Typography | Geist 500, ink |
| Size | Large but not dominant — 28–36px for headers, scaled proportionally elsewhere |
| Composition | Three words on a single line; no symbol; no decoration |

Used on: About-page masthead, legal documents, annual reports, Polish *Stowarzyszenie* registration plaque, member welcome packet covers.

### 4.5 Location sub-marks (composition)

Master wordmark **plus** city stamp, stacked.

```
Subploters
[ PSA · WARSAW ]   ← amber tag, rotated -1.5°
```

Used on: location-specific landing pages, local deck covers, city member portals, location-specific social profiles (e.g., `@subploters_warsaw`).

---

## 5. Multi-location scaling

Each city receives identical visual treatment — the system is **stamp-replaceable**:

- `Subploters` + `PSA · WARSAW`
- `Subploters` + `PSA · BERLIN`
- `Subploters` + `PSA · LONDON`
- `Subploters` + `PSA · NYC`

No city is privileged in the visual system. Warsaw is the **founding** community (preserved in narrative and history) but not labeled "main" or "HQ" in brand assets.

When opening a new city, the only design work needed is creating a new `PSA · [CITY]` tag — the wordmark and overall system carry over unchanged.

---

## 6. Voice (writing)

- **Confident, plain-spoken, craft-aware.** Direct without being clinical.
- **Slightly playful** — the brand name itself is a wink ("Professional Subploters" reads in the family of "Professional Hugger" — comedy by juxtaposing institutional frame with invented profession). Match the wink in tone where appropriate.
- **Specific over generic.** "Hospitality" beats "people-focused." "Subploter" beats "member."
- **Warm but not effusive.** Modern collegial energy. Not corporate-clinical. Not bro-tech. Not 1894-club.
- **No em dashes in writing** (use the en-dash with spaces, or just sentences). [project convention]
- **No AI vocabulary**: avoid *delve, crucial, robust, comprehensive, nuanced, multifaceted, pivotal, landscape, tapestry*.

---

## 7. Do / Don't

| Do | Don't |
|---|---|
| Set the wordmark in Geist 600, ink color | Set the wordmark in any other typeface, weight, or color |
| Render `Subploters` as a single word, single line | Hyphenate, line-break, or stretch the wordmark |
| Use the amber tag for location identification | Spell out city names in Geist next to the wordmark |
| Use the typographic `S` (Geist 700, amber on cream) at favicon sizes | Use a glyph, monogram, asterisk, or symbol after the wordmark |
| Treat Warsaw as one location among future N | Label Warsaw as "main" or "HQ" externally |
| Use *Subploters* as the brand wordmark | Use *PSA* alone as the primary external brand mark |
| Rotate the city tag -1.5° | Use the city tag flat |
| Keep `0` border-radius across all elements | Add rounded corners |
| Use amber as accent only | Use amber as a background field |

---

## 8. Asset directory

```
community/brand/
  brand.md              ← this document (single source of truth)
  LICENSE.md            ← CC0 dedication (per ADR-0001 OSS-first)
  assets/
    asterisk.svg        ← chat-36 rejected iteration; archive only, NOT in brand
    [future]
    subploters-wordmark.svg
    psa-warsaw-tag.svg
    favicon-S.svg       ← typographic S (Geist 700, amber on cream)
  exports/              ← (future) PNG / PDF exports for non-web use
```

Web-optimized assets for the community platform live at `projects/community-platform/public/branding/`.

---

## 9. License

All brand assets in this directory are dedicated to the public domain under **CC0 1.0 Universal**. See `LICENSE.md`. Anyone may use, remix, fork, or commercialize the assets without restriction. Aligns with ADR-0001 (OSS-first / MIT licensing posture).

---

## 10. Version history

- **v1.1 — 2026-05-23 (chat-37).** Resolved the signature-mark question by **removing it**. Brand is now wordmark-led (Linear / Stripe / Notion / Vercel family). The §3 "signature mark — placement locked, form OPEN" hole was closed by locking "no separate symbol mark." Small-surface treatment formalized as typographic `S` (Geist 700, amber on cream). All `Subploters✱` references in §§1, 4.1, 4.4, 4.5, 5, 7 stripped to `Subploters`. Decision is reversible: a custom symbol can be commissioned at a later inflection (second city launch, formal Stowarzyszenie registration) without rework of the wordmark or city-stamp system.
- **v1 — 2026-05-23 (chat-36).** Subploters identity locked. Name architecture, brand voice, color palette, typography (Geist + Inter + JetBrains Mono), motifs (rotated amber tags), city stamp system (PSA · CITY), two-piece compositional system for multi-location scaling, Co-Founder role in default signatures. **Signature mark form NOT locked** — iterated through ~7 design directions, none approved. Resolved in v1.1.
- **v0 — 2026-04-24.** Placeholder Warsaw AI Community identity. No logo. Iterated to v1 after the chat-36 brand brainstorm in May.

---

## 11. References

- Design exploration archive: `~/.gstack/projects/warsaw-ai-comunity/designs/subploters-brand-system-20260523/`
  - `comparison.html` — round 1 (5 system variants, Fraunces italic)
  - `comparison-fonts.html` — round 2 (5 fonts, asterisk position v1)
  - `comparison-fonts-v2.html` — round 3 (5 fonts differentiated, asterisk fixed)
  - `system-locked.html` — final locked system (Geist + asterisk + amber tag)
  - `approved.json` — locked system metadata
- v0.6 visual identity inheritance: `projects/community-platform/spec.md §16`
- Chat-36 handoff: `docs/specs/2026-05-21-warsaw-ai-community-logo-brainstorm-handoff.md`
- Chat-37 handoff (wordmark-only resolution): `docs/specs/2026-05-23-subploters-brand-mark-handoff.md`
- ADR-0001 (OSS-first licensing): `docs/decisions/0001-oss-first-licensing.md`
