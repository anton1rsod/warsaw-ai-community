# Brand

**Status:** v1.2 — locked 2026-05-25 (chat-41 / platform wire-in). Supersedes v1.1 (chat-38 mark + lockup lock), v1 (chat-36 identity lock), v0 (April 2026 "Warsaw AI Community" placeholder).

---

## 1. Architecture

| Layer | Value | Purpose |
|---|---|---|
| **Primary brand** | **Subploters** | The universal name. Domain, social handles, daily speech, the wordmark on every surface. |
| **Member identity** | **Subploter** (one) / **Subploters** (community) | What members call themselves. *"I'm a Subploter"* is the identity claim. |
| **Community name** *(per location)* | **Professional Subploter Community** | The community at any one location. Warsaw has one; future cities each get their own. |
| **Formal entity** | **Professional Subploters Association** | The formal association name. Used on About masthead, member welcome packets, and legal documents when/if the entity registers. *(v1.2: Stowarzyszenie references dropped from platform surfaces and from this spec — entity is not yet legally registered.)* |
| **Insider abbreviation** | **PSA** *(global)* / **PSC** *(per community)* | Member-to-member shorthand. *"I'm with PSA"* = global network, *"PSC Warsaw"* = a specific community. |
| **Tagline** | **Every venture is a subplot.** | Primary tagline. Declarative, on-metaphor. |
| **Founding** | Warsaw, Poland — 2026 | First community. Externally treated as equal among future locations (no "main" / "HQ" labeling in branding). |

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
- **−1.5° rotation** for standalone amber tags (the v0.6 motif): `AmberTag` in hero, §4.5 location sub-marks, deck covers, location landing pages — surfaces where the tag sits in calm whitespace and the tilt reads as deliberate accent. **Chrome surfaces are exempt** (v1.2): the platform Header city chip is upright (0°) because in the upright header grid a tilted chip reads as a rendering bug, not as accent. See §4.3 for the chrome variant.
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
3. **PL** — Poland country code; the brand is rooted in Warsaw and the formal association name carries the country lineage. (Legal registration as a Polish association is forward-looking, not current — see §1.)

Three layers of meaning in one glyph. Density that none of the chat-36 directions produced.

### When to use the lockup vs the standalone mark

| Context | Use |
|---|---|
| Brand wordmark anywhere it appears at readable size (header, deck cover, About page, marketing) | **Master lockup** `subploters-lockup.svg` |
| Body-text mention of "Subploters" (plain HTML/CSS, where loading the lockup SVG is overkill) | Render `Subploters` in Geist SemiBold ink + brand-signature `*` (see "Plain-text brand-signature" below) — the secondary plain wordmark `subploters-wordmark.svg` exists for SVG-only contexts |
| Favicon, social avatar (`@subploters`), member badge, app icon, deck-corner watermark — any compact context where the wordmark won't fit | **Standalone PL monogram** `subploters-mark.svg` |
| Formal entity ("Professional Subploters Association" on About masthead, legal docs) | See §4.4 |

### Plain-text brand-signature (v1.2)

The trailing `*` is part of the wordmark identity, not an optional flourish. Whenever "Subploters" appears as plain text — body copy, footer copyright, page titles, formal-entity headlines, member-facing strings — render the `*` alongside it as an amber superscript.

| Specification | Value |
|---|---|
| Mark | `*` (asterisk, U+002A) |
| Color | Amber `#f59e0b` |
| Size | `0.55em` of the surrounding text size |
| Position | Superscript (`vertical-align: 0.55em` in HTML/CSS; raised baseline in print) |
| Weight | Matches the surrounding text weight (typically Geist 500 or the inherited weight) |
| Spacing | `margin-left: 0.05em` from the final letter |

HTML pattern:
```html
Subploters<sup style="color:#f59e0b;font-size:0.55em;line-height:0;vertical-align:0.55em;margin-left:0.05em;">*</sup>
```

The master lockup already bakes the `*` into its SVG path data — never add a second `*` next to the lockup. The convention applies **only when "Subploters" is rendered as live text** (HTML, Markdown, plain-text strings). Internal documentation (this spec, ADRs, commit messages, code comments) may write plain "Subploters" without the `*` — the convention governs public surfaces, not meta-documentation.

### Build pipeline

The lockup is regenerated by `community/brand/scripts/build-lockup.js` (committed). It depends on `opentype.js` + Vercel's `geist` npm package (for the SemiBold TTF) + `png-to-ico` (for favicon rebuild), which live in the gitignored `community/brand/.scratch/node_modules/`. Both color variants (light/dark) are emitted from a single run.

To set up a fresh checkout for rebuilding:

```bash
mkdir -p community/brand/.scratch && cd community/brand/.scratch
npm init -y && npm install opentype.js geist png-to-ico
cd ../../..
node community/brand/scripts/build-lockup.js
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

For body-text mentions of "Subploters" (HTML/CSS where loading the lockup SVG is overkill), render `Subploters` in Geist SemiBold ink directly **plus the brand-signature `*` per §3** — every plain-text wordmark mention wears the `*`. The secondary `assets/subploters-wordmark.svg` exists for SVG-only contexts where the lockup is too expressive but a vector wordmark is needed.

### 4.2 Standalone PL monogram mark

The **PL monogram** at `assets/subploters-mark.svg` — amber `#f59e0b`, rotated `-3°` (baked into the asset transform; do not re-apply in CSS). Available as vector + PNG exports at 16 / 32 / 180 / 192 / 512 px under `assets/`.

Used on: favicons, social avatars (`@subploters`), member badges, deck-corner watermarks, app icons, signage — anywhere the brand needs to be present at small sizes or independent of the wordmark.

### 4.3 City stamp

The amber tag treatment with `PSA · CITY` inside — two variants since v1.2.

#### Standalone variant (default — non-chrome surfaces)

| Specification | Value |
|---|---|
| Format | `PSA · CITY` (interpunct between PSA and city name) |
| Typography | JetBrains Mono, weight 500, all caps, letter-spacing 0.18em–0.20em |
| Background | Amber `#f59e0b` |
| Text color | Ink `#1a1a2e` |
| Padding | `12px 24px` standard, `18px 32px` large, `6px 14px` small |
| Border-radius | `0` |
| Rotation | `-1.5°` |

Used on: §4.5 location sub-marks, deck cover location tag, member badges, location-specific signage, social profile city designation, posters, merch.

#### Chrome variant (v1.2 — platform header, adjacent to master wordmark)

| Specification | Value |
|---|---|
| Format | `CITY` only (no PSA prefix — PSA is implied by the adjacent wordmark; doubling reads redundant) |
| Typography | JetBrains Mono, weight 500, all caps, letter-spacing 0.18em |
| Background | Amber `#f59e0b` |
| Text color | Ink `#1a1a2e` |
| Padding | `3px 8px` (small chrome footprint) |
| Border-radius | `0` |
| Rotation | `0°` (upright — chrome's upright grid would read the tilt as a rendering bug) |
| Spacing from wordmark | `10px` (chip belongs to the brand group, sits inside the wordmark's visual orbit) |

Used on: platform Header (immediately right of the master lockup). Reserved for chrome contexts where the master wordmark is also present in the same row. **Anti-pattern:** don't apply the chrome variant outside chrome surfaces; don't tilt the chrome variant; don't include `PSA · ` in the chip when the wordmark is right there.

### 4.4 Formal entity treatment (v1.2 — plain text)

`Professional Subploters* Association`

| Specification | Value |
|---|---|
| Typography | Plain Geist 500 ink for the entire line — `Professional`, `Subploters`, and `Association` all rendered as live text in the same weight |
| Size | Masthead: 40px (About-page hero). Headers: 28–36px. Body mentions: inherit surrounding text size. |
| Brand-signature `*` | Trailing `*` on "Subploters" per §3 brand-signature convention — amber, 0.55em, superscript |
| Inline lockup | **None.** v1.2 drops the v1.1 rule of embedding `subploters-lockup.svg` inline for the "Subploters" portion. The master lockup is reserved for hero / cover / chrome contexts; body-context formal entity uses plain text. |

Used on: About masthead, legal documents (when registered), member welcome packet covers, governance pages, footer formal-entity line (caps mono variant).

**v1.1 → v1.2 change:** v1.1 specified the "Subploters" portion as an embedded master lockup composition (Geist 500 framing + path-drawn lockup in the middle). v1.2 simplifies to plain Geist 500 throughout, with the brand-signature `*` carrying the wordmark identity. Rationale: the lockup is a logo, not a typographic substitution token — embedding it in body composition felt overly decorative.

### 4.5 Location sub-marks (composition)

Master wordmark (the inline-fused lockup from §4.1) **plus** city stamp standalone variant (§4.3), stacked. The standalone PL monogram may additionally sit beside or above the composition (deck-corner watermark, page-header glyph).

```
Subploters         ← master lockup (assets/subploters-lockup.svg — PL inline + trailing *)
[ PSA · WARSAW ]   ← city stamp standalone variant, -1.5° tilt, standard size
```

Used on: location-specific landing pages, local deck covers, city member portals, location-specific social profiles (e.g., `@subploters_warsaw`).

**Scope (v1.2):** Polish cities only for now — Warsaw is live; Kraków / Gdańsk / Wrocław / Poznań / Łódź / etc. are stamp-replaceable extensions when communities open in those cities. Cities outside Poland are out of scope until the brand internationalizes (see §5).

**Why the city stamp is tilted here but upright in the platform header chip:** different visual contexts. Here the stamp sits in calm whitespace below the wordmark — the -1.5° reads as deliberate accent. In chrome (§4.3 chrome variant) the upright header grid would read the tilt as a rendering bug. Same content, two variants for two contexts.

---

## 5. Multi-location scaling

Each city receives identical visual treatment — the system is **stamp-replaceable**:

- `Subploters` + `PSA · WARSAW`
- `Subploters` + `PSA · KRAKÓW`
- `Subploters` + `PSA · GDAŃSK`
- `Subploters` + `PSA · WROCŁAW`

**Polish-only scope (v1.2):** the brand and association are currently scoped to Polish cities. Warsaw is the founding community; Kraków / Gdańsk / Wrocław / Poznań / Łódź are stamp-replaceable extensions when communities open in those cities. Cities outside Poland are out of scope until a future internationalization decision (which would also revisit naming, legal structure, and visual treatment).

No city is privileged in the visual system. Warsaw is the **founding** community (preserved in narrative and history) but not labeled "main" or "HQ" in brand assets.

When opening a new Polish city, the only design work needed is creating a new `PSA · [CITY]` tag — the wordmark, standalone PL monogram mark, and overall system carry over unchanged. Polish diacritics (Ó, Ń, Ł, etc.) render natively in JetBrains Mono.

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
| Render plain-text "Subploters*" with the brand-signature `*` (§3) in every body-context mention | Drop the `*` from plain-text references — the `*` is part of the wordmark, not an option |
| Use the standalone PL monogram `subploters-mark.svg` at compact sizes (favicons, social avatars, member badges) | Scale the full lockup down to favicon size — it goes illegible |
| Use the city stamp standalone variant (-1.5° tilt, `PSA · CITY`, standard size) on landing pages, deck covers, social, posters | Tilt the chrome chip variant in the platform header — the upright grid reads it as broken |
| Use the city stamp chrome variant (upright, `CITY`-only, small size, 10px from the master wordmark) in the platform header | Spell out city names in Geist next to the wordmark |
| Treat Warsaw as one Polish location among future Polish locations | Label Warsaw as "main" or "HQ" externally; or extend the city system outside Poland in v1.2 |
| Use plain Geist 500 for the formal-entity treatment (`Professional Subploters* Association`) | Embed the master lockup inline in the formal entity composition (that was v1.1 — v1.2 simplifies to plain text) |
| Use *Subploters* as the brand wordmark | Use *PSA* alone as the primary external brand mark |
| Keep PL amber `#f59e0b` and surrounding letters ink `#1a1a2e` | Recolor either fill |
| Respect the baked-in `-3°` PL rotation in both lockup and standalone | Re-rotate or upright the PL in CSS |
| Keep `0` border-radius across all elements | Add rounded corners |
| Use amber as accent only | Use amber as a background field (exception: the city stamp's amber field is the established treatment) |
| Reference the brand as "Professional Subploters Association" without claiming Stowarzyszenie status until the entity is registered | Claim "Polish Stowarzyszenie" on platform surfaces — not legally true yet (v1.2 lock) |

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
  scripts/
    build-lockup.js              ← Canonical build script for the lockup (regenerates both variants)
  explorations/
    chat-36-archive/             ← rejected chat-36 mark candidates (incl. the 6-point asterisk)
    chat-37/                     ← chat-37 PL+pilcrow exploration (14 SVG candidates + comparison board + README)
    chat-38/                     ← chat-38 Path A process documentation + decision archive
  .scratch/                      ← gitignored — node_modules host for build-lockup.js (opentype.js + Vercel geist TTFs + png-to-ico)
```

Web-optimized assets for the community platform live at `projects/community-platform/public/branding/`.

---

## 9. License

All brand assets in this directory are dedicated to the public domain under **CC0 1.0 Universal**. See `LICENSE.md`. Anyone may use, remix, fork, or commercialize the assets without restriction. Aligns with ADR-0001 (OSS-first / MIT licensing posture).

---

## 10. Version history

- **v1.2 — LOCKED 2026-05-25 (chat-41 / platform wire-in).** Path Z (wordmark-only) was provisionally locked at chat-40 close after 3 rounds × 16 mark candidates × 0 winners, but chat-41 walked it back: seeing the v1.1 lockup next to plain-text alternatives, Anton concluded v1.1 is already good and the chat-39 "retire PL + retire *" scope-pivot was premature. **v1.1 mark architecture stays intact** — PL inline + trailing `*` + standalone PL favicon all preserved. v1.2's actual scope is platform location wire-in plus typographic refinements:

  - **§1 founding** year corrected 2024 → 2026; "Polish Stowarzyszenie" reference dropped (entity not yet registered).
  - **§2 motif rule** amended: `-1.5°` rotation now applies only to standalone amber tags (AmberTag in hero, §4.5 location sub-marks, deck covers, posters). Chrome surfaces are exempt — the platform Header chip is upright (0°).
  - **§3 NEW Plain-text brand-signature `*`** convention: every plain-text "Subploters" mention wears the trailing `*` (amber, 0.55em, superscript via HTML `<sup>`). Internal documentation may omit the `*`; public surfaces must include it.
  - **§4.3 City stamp** gains a chrome variant: upright, `CITY`-only (no PSA prefix when adjacent to the master wordmark), small size (3px 8px padding), 10px gap from the wordmark.
  - **§4.4 Formal entity** simplified to plain Geist 500 throughout — no embedded master lockup. The `*` carries the wordmark identity in body context.
  - **§4.5 Location sub-marks** scoped to Polish cities (Kraków, Gdańsk, Wrocław, Poznań, Łódź) until internationalization is decided.
  - **§5 Multi-location** scoped to Poland for now.

  **Platform wire-in (community-platform implementation, follows in writing-plans):**
  - Header gets the new chrome chip (`WARSAW`, upright, amber field, ink text) 10px right of the lockup.
  - Header nav font changes from `font-voice` (JetBrains Mono) to Geist 500 — visual continuity with the lockup. **This is a header-chrome exception to §2 voice typography**; running nav text is "near-display" not "voice/code/metadata", so it inherits the lockup family.
  - Footer adds the formal entity line (`PROFESSIONAL SUBPLOTERS* ASSOCIATION` — JetBrains Mono caps, uppercase, 10px, 0.18em letter-spacing) above the copyright row.
  - Footer drops the `built in public, MIT` string (delete `chrome.footer.builtInPublic` i18n key).
  - Footer copyright gets the `*` (`© 2026 Subploters*`).
  - `/handbook` page header gains a formal-entity masthead: caption `FOUNDED 2026 · WARSAW` (JetBrains Mono caps, dust color) above headline `Professional Subploters* Association` (Geist 500, 40px, ink) above subtitle `The Warsaw chapter of the Professional Subploters* Association — for founders writing their next plot.` (Inter, 14px). When `/about` ships in a later phase, the same component moves over.

  Chat-40 archive (still relevant as anti-pattern reference for future mark-replacement attempts): `community/brand/explorations/chat-40/` (16 rejected candidates). Chat-41 mockup scripts: `community/brand/.scratch/build-q1-*.js`, `build-q2-trailing-board.js`, `build-q3-wire-in-board-v{1..5}.js`, `build-section-45-location-submarks.js` (gitignored throwaway).
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
