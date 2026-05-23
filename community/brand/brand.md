# Brand

**Status:** v1.1 — locked 2026-05-23 (chat-38 / Path A). Supersedes v1 (chat-36 lock with mark form open) and v0 (April 2026, "Warsaw AI Community" placeholder identity).

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

The architecture is a **three-piece compositional system**: the universal wordmark `Subploters` (the inline-fused master lockup — PL monogram replacing the "pl" letters + trailing `*` amber qualifier), the standalone PL monogram mark for compact contexts (favicons, avatars), and a replaceable city stamp `PSA · CITY`. Used independently or in combination depending on context.

---

## 2. Visual identity

### Color palette

| Role | Color | Hex | Usage |
|---|---|---|---|
| Accent | Warm amber | `#f59e0b` | PL monogram (inline + standalone), trailing `*` qualifier, city tag background, accent rules. **Use as accent, not as field.** |
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
- **−3° rotation** for the PL monogram (baked into both the inline-fused lockup and the standalone mark assets — do not re-apply in CSS).

---

## 3. The signature mark and master lockup — v1.1 (Path A, chat-38 locked)

The brand mark is the **PL monogram** (chat-37 Concept 11). The master wordmark is the **inline-fused lockup**: path-drawn "Subploters" in Geist SemiBold (600) with the PL monogram replacing the "pl" letters + trailing `*` amber qualifier. Both the inline lockup and the standalone PL mark are canonical, used in different contexts.

This is the Path A execution from the chat-37 handoff — the lockup ambition resolved in chat-38 rather than deferred. The lockup is **path-drawn** (every letter is SVG path data, not `<text>` glyphs), so it renders identically across browsers, OS, and tools without font-availability dependencies.

### What's locked (v1.1)

| Specification | Value |
|---|---|
| Master lockup | `assets/subploters-lockup.svg` (ink letters, default — for cream/light backgrounds) + `assets/subploters-lockup-dark.svg` (cream letters — for ink/dark backgrounds like the platform header / footer) |
| Standalone mark | `assets/subploters-mark.svg` — PL monogram alone, with PNG exports at 16 / 32 / 180 / 192 / 512 px under `assets/` |
| Mark color | Amber `#f59e0b` |
| Letter color | Ink `#1a1a2e` (in the lockup, surrounding letters are ink) |
| Trailing `*` color | Amber `#f59e0b` (chat-37 round 5 footnote-style qualifier; small, superscript position) |
| Mark rotation | `-3°` (baked into both the lockup and the standalone asset; do not re-apply in CSS) |
| PL geometry | Real ring-shaped P bowl (interior daylight via `fill-rule="evenodd"`), trimmed L foot, 30px stem-to-stem gap (Concept 11 reference proportions) |
| PL inline scale | PL height = cap-height (matches lowercase l ascender), bottom aligned to baseline — no descender extension below baseline |
| PL inline slot | PL width + 80 unit padding (40 each side); slot is tighter than `pl` advance width so PL feels integrated, not isolated |

### Triple-coded semantics

The bold pilcrow `¶` anatomy naturally reads as **P** (filled bowl + stem on the left) + **L** (right vertical stroke). The mark triple-codes:

1. **Pilcrow ¶** — paragraph mark; each subploter's venture is a paragraph in the community's larger narrative.
2. **subPLot** — the embedded letters in "Subploters", highlighting the brand-name's narrative reference. The inline lockup makes this literal — the PL *replaces* the "pl" letters in the wordmark.
3. **PL** — Poland country code; Subploters registers as a Polish *Stowarzyszenie* (Professional Subploters Association).

Three layers of meaning in one glyph. Density that none of the chat-36 directions produced.

### When to use the lockup vs the standalone mark

| Context | Use |
|---|---|
| Brand wordmark anywhere it appears at readable size (header, deck cover, About page, marketing) | **Master lockup** `subploters-lockup.svg` |
| Body-text mention of "Subploters" (plain HTML/CSS, where loading the lockup SVG is overkill) | Render `Subploters` in Geist SemiBold ink — the secondary plain wordmark `subploters-wordmark.svg` exists for SVG-only contexts |
| Favicon, social avatar (`@subploters`), member badge, app icon, deck-corner watermark — any compact context where the wordmark won't fit | **Standalone PL monogram** `subploters-mark.svg` |
| Formal entity lockup ("Professional Subploters Association" on legal docs / Stowarzyszenie plaque) | See §4.4 |

### Build pipeline

The lockup is regenerated by `community/brand/.scratch/build-lockup.js` (gitignored npm scaffold; uses `opentype.js` + Vercel's `geist` npm package for the SemiBold TTF + `png-to-ico` for favicon rebuild). Both color variants (light/dark) are emitted from a single run. To set up a fresh checkout for rebuilding:

```bash
mkdir -p community/brand/.scratch && cd community/brand/.scratch
npm init -y && npm install opentype.js geist png-to-ico
# Re-create build-lockup.js (locally, gitignored) — recover from git history of a deleted .scratch
# OR check community/brand/CHANGELOG (future) for the canonical script form.
node build-lockup.js
```

To change the lockup (PL scale, slot padding, trailing `*` size, letter color variants), edit the script and re-run.

### Provenance

- **v0 (rejected):** chat-36 6-point asterisk — archived at `explorations/chat-36-archive/asterisk.svg`.
- **v1.1 mark (locked):** chat-37 Concept 11 PL monogram — `assets/subploters-mark.svg`.
- **v1.1 lockup (locked):** chat-38 Path A — `assets/subploters-lockup.svg` (path-drawn from Geist SemiBold + Concept 11 PL inline + chat-37 round 5 trailing `*`).
- **Concept archive:** `explorations/chat-37/` (14 SVGs across 5 rounds, README with anti-patterns list).
- **Handoffs:** `docs/specs/2026-05-23-subploters-brand-mark-handoff.md` (chat-36 → chat-37) and `docs/specs/2026-05-23-subploters-brand-mark-chat37-handoff.md` (chat-37 → chat-38).

---

## 4. Elements

### 4.1 Master wordmark (inline-fused lockup)

`Subploters` — the universal global mark. Path-drawn in Geist SemiBold (600) ink, with the PL monogram inline-fused replacing the "pl" letters + trailing `*` amber qualifier. Source vector at `assets/subploters-lockup.svg` (path-drawn, font-independent, renders identically anywhere).

Used on: domain wordmark renders, social-profile cover graphics, marketing materials, merch, deck covers, About-page header, hero banners — anywhere the brand wordmark appears at readable size.

For body-text mentions of "Subploters" (HTML/CSS where loading the lockup SVG is overkill), render `Subploters` in Geist SemiBold ink directly. The secondary `assets/subploters-wordmark.svg` exists for SVG-only contexts where the lockup is too expressive but a vector wordmark is needed.

### 4.2 Standalone PL monogram mark

The **PL monogram** at `assets/subploters-mark.svg` — amber `#f59e0b`, rotated `-3°` (baked into the asset transform; do not re-apply in CSS). Available as vector + PNG exports at 16 / 32 / 180 / 192 / 512 px under `assets/`.

Used on: favicons, social avatars (`@subploters`), member badges, deck-corner watermarks, app icons, signage — anywhere the brand needs to be present at small sizes or independent of the wordmark.

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
| Typography | Geist 500 ink for "Professional" and "Association"; the master inline-fused lockup (`subploters-lockup.svg`) embedded inline for the "Subploters" portion |
| Size | Large but not dominant — 28–36px for headers, scaled proportionally elsewhere |
| Inline mark | The "Subploters" portion uses the master lockup with its inline PL + trailing `*` — the formal entity inherits the wordmark composition (no separate inline-mark treatment) |

Used on: About-page masthead, legal documents, annual reports, Polish Stowarzyszenie registration plaque, member welcome packet covers.

### 4.5 Location sub-marks (composition)

Master wordmark (the inline-fused lockup from §4.1) **plus** city stamp, stacked. The standalone PL monogram may additionally sit beside or above the composition (deck-corner watermark, page-header glyph).

```
Subploters         ← master lockup wordmark (assets/subploters-lockup.svg)
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

When opening a new city, the only design work needed is creating a new `PSA · [CITY]` tag — the wordmark, standalone PL monogram mark, and overall system carry over unchanged.

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
| Use the inline-fused master lockup `subploters-lockup.svg` as the wordmark wherever it appears at readable size | Substitute plain "Subploters" text where the lockup belongs |
| Use the standalone PL monogram `subploters-mark.svg` at compact sizes (favicons, social avatars, member badges) | Scale the full lockup down to favicon size — it goes illegible |
| Use the amber tag for location identification | Spell out city names in Geist next to the wordmark |
| Treat Warsaw as one location among future N | Label Warsaw as "main" or "HQ" externally |
| Use *Subploters* as the brand wordmark | Use *PSA* alone as the primary external brand mark |
| Keep PL amber `#f59e0b` and surrounding letters ink `#1a1a2e` | Recolor either fill |
| Respect the baked-in `-3°` PL rotation in both lockup and standalone | Re-rotate or upright the PL in CSS |
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
    subploters-lockup.svg        ← MASTER inline-fused wordmark (path-drawn Geist SemiBold + inline PL + trailing *) — ink letters, for cream/light backgrounds
    subploters-lockup-dark.svg   ← Dark-mode variant — cream letters, for ink/dark backgrounds (platform header, footer, dark hero)
    subploters-mark.svg          ← Standalone PL monogram (compact contexts: favicons, avatars, badges)
    subploters-mark-16.png       ← favicon (browser tab)
    subploters-mark-32.png       ← favicon (high-DPI)
    subploters-mark-180.png      ← apple-touch-icon
    subploters-mark-192.png      ← PWA icon
    subploters-mark-512.png      ← PWA icon / og-image fallback
    subploters-wordmark.svg      ← Secondary plain wordmark (Geist 600 ink text-based; font-dependent — for SVG-only contexts where the lockup is too expressive)
    [future]
    psa-warsaw-tag.svg
    og-image-1200x630.png
  exports/              ← (future) PNG / PDF exports for non-web use
  explorations/
    chat-36-archive/             ← rejected chat-36 mark candidates (incl. the 6-point asterisk)
    chat-37/                     ← chat-37 PL+pilcrow exploration (14 SVG candidates + comparison board + README)
  .scratch/                      ← gitignored — npm scaffold for build-lockup.js (opentype.js + Vercel geist TTFs)
```

Web-optimized assets for the community platform live at `projects/community-platform/public/branding/`.

---

## 9. License

All brand assets in this directory are dedicated to the public domain under **CC0 1.0 Universal**. See `LICENSE.md`. Anyone may use, remix, fork, or commercialize the assets without restriction. Aligns with ADR-0001 (OSS-first / MIT licensing posture).

---

## 10. Version history

- **v1.1 — 2026-05-23 (chat-38 / Path A).** Signature mark form AND master lockup BOTH locked. **Master wordmark is the inline-fused lockup**: path-drawn "Subploters" in Geist SemiBold (600) ink with the PL monogram (chat-37 Concept 11) inline-fused replacing the "pl" letters + trailing `*` amber qualifier (chat-37 round 5 idea, refined in chat-38 visual iteration). Architecture: **three-piece** (inline-fused lockup wordmark + standalone PL mark + city stamp). PL inline is capped at cap-height (matches lowercase l ascender, no descender extension below baseline — chat-38 v2 iteration after Anton's "PL too tall" feedback on v1). Assets: `assets/subploters-lockup.svg` (path-drawn, font-independent), `assets/subploters-mark.svg` + 5 PNG exports, `assets/subploters-wordmark.svg` (secondary plain variant). Build pipeline: `community/brand/.scratch/build-lockup.js` (gitignored — opentype.js + Vercel geist TTFs). Rejected chat-36 6-point asterisk archived to `explorations/chat-36-archive/asterisk.svg`.
- **v1 — 2026-05-23 (chat-36).** Subploters identity locked. Name architecture, brand voice, color palette, typography (Geist + Inter + JetBrains Mono), motifs (rotated amber tags), city stamp system (PSA · CITY), two-piece compositional system for multi-location scaling, Co-Founder role in default signatures. **Signature mark form NOT locked** — iterated through ~7 design directions, none approved. See chat-37 handoff for continuation.
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
- ADR-0001 (OSS-first licensing): `docs/decisions/0001-oss-first-licensing.md`
