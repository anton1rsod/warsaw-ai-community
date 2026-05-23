# Brand

**Status:** v1 — locked 2026-05-23 (chat-36). Supersedes v0 (April 2026, "Warsaw AI Community" placeholder identity).

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

The architecture is a **two-piece compositional system**: the universal wordmark `Subploters✱` plus a replaceable city stamp `PSA · CITY`. Used separately or together depending on context.

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
- **−3° rotation** for the asterisk symbol mark.

---

## 3. The signature mark — placement locked, form OPEN

The brand has a signature glyph mark that sits in the asterisk position after "Subploters". The **placement, color, behavior, and attachment rules are locked**. The **specific visual form is NOT locked** — chat-36 explored ~7 directions (geometric radial asterisk, dagger, reference mark, name-rooted glyphs, typographic alternatives, gem cuts, refined brilliants) and the founder rejected all of them. The mark-form decision is handed off to the next iteration.

### What's locked

| Specification | Value |
|---|---|
| Color | Amber `#f59e0b` |
| Size relative to text | `0.42em–0.6em` of parent text size (exact value depends on final form) |
| Vertical position | Superscript — above baseline, around cap-height |
| Rotation | `-3°` (slight visible tilt) |
| Attachment rule | **Always attached to "Subploters"**. Never to a city name, never to "Association", never standing alone in the middle of a phrase (except when used as standalone monogram). |

### Where it attaches (rules)

| Lockup | Mark position | Example pattern |
|---|---|---|
| Master wordmark | After "Subploters" | `Subploters[mark]` |
| Location sub-mark | After "Subploters" (not after the city) | `Subploters[mark] Warsaw` |
| Formal entity lockup | After "Subploters" (inside the formal name) | `Professional Subploters[mark] Association` |
| Standalone monogram | The mark alone | `[mark]` |

### What's NOT locked

- The specific visual form of `[mark]` (the glyph itself)
- The exact size within the 0.42–0.6em range
- Whether to use Unicode ✱ as digital fallback or commission custom SVG everywhere

The `assets/asterisk.svg` file in this directory is a **chat-36 iteration candidate (6-point geometric line asterisk)** — NOT the final form. The founder rejected it as too close to Claude/Anthropic visually. See `docs/specs/2026-05-23-subploters-brand-mark-handoff.md` for the full iteration history and next-chat brief.

---

## 4. Elements

### 4.1 Master wordmark

`Subploters✱` — the universal global mark. Geist 600 ink, superscript amber asterisk.

Used on: domain, social profiles, marketing, merch, primary brand contexts.

### 4.2 Standalone asterisk monogram

`✱` alone — amber, rotated -3°, on cream or any field.

Used on: favicons (16/32/180px), social avatars (`@subploters`), member badges, watermarks in deck corners, signage, anywhere the brand needs to be present at small sizes.

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

`Professional Subploters✱ Association`

| Specification | Value |
|---|---|
| Typography | Geist 500, ink |
| Size | Large but not dominant — 28–36px for headers, scaled proportionally elsewhere |
| Asterisk position | **Inside the name, after "Subploters"** — not at the end |

Used on: About-page masthead, legal documents, annual reports, Polish Stowarzyszenie registration plaque, member welcome packet covers.

### 4.5 Location sub-marks (composition)

Master wordmark **plus** city stamp, stacked.

```
Subploters✱
[ PSA · WARSAW ]   ← amber tag, rotated -1.5°
```

Used on: location-specific landing pages, local deck covers, city member portals, location-specific social profiles (e.g., `@subploters_warsaw`).

---

## 5. Multi-location scaling

Each city receives identical visual treatment — the system is **stamp-replaceable**:

- `Subploters✱` + `PSA · WARSAW`
- `Subploters✱` + `PSA · BERLIN`
- `Subploters✱` + `PSA · LONDON`
- `Subploters✱` + `PSA · NYC`

No city is privileged in the visual system. Warsaw is the **founding** community (preserved in narrative and history) but not labeled "main" or "HQ" in brand assets.

When opening a new city, the only design work needed is creating a new `PSA · [CITY]` tag — the wordmark, asterisk, and overall system carry over unchanged.

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
| Attach the asterisk to "Subploters" always | Attach the asterisk to a city name or "Association" |
| Use the amber tag for location identification | Spell out city names in Geist next to the wordmark |
| Treat Warsaw as one location among future N | Label Warsaw as "main" or "HQ" externally |
| Use *Subploters* as the brand wordmark | Use *PSA* alone as the primary external brand mark |
| Render the asterisk at superscript position | Render the asterisk at baseline or mid-line |
| Rotate the asterisk -3° | Use the asterisk upright |
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
    asterisk.svg        ← canonical custom asterisk (vector)
    [future]
    subploters-wordmark.svg
    psa-warsaw-tag.svg
    favicon-16.png  ... favicon-512.png
    og-image-1200x630.png
  exports/              ← (future) PNG / PDF exports for non-web use
```

Web-optimized assets for the community platform live at `projects/community-platform/public/branding/`.

---

## 9. License

All brand assets in this directory are dedicated to the public domain under **CC0 1.0 Universal**. See `LICENSE.md`. Anyone may use, remix, fork, or commercialize the assets without restriction. Aligns with ADR-0001 (OSS-first / MIT licensing posture).

---

## 10. Version history

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
