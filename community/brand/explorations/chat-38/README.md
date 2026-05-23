# Chat-38 — Subploters mark resolution archive

**Date:** 2026-05-23 · **Status:** Path A inline-fused lockup LOCKED at `brand.md §3`

This archive documents the chat-38 process that closed the brand-mark question opened in chat-36 and continued through chat-37. The canonical assets (`subploters-lockup.svg`, `subploters-lockup-dark.svg`, `subploters-mark.svg` + PNGs, `subploters-wordmark.svg`) live at `community/brand/assets/`; this archive captures the *process* — skill choice, decision path, visual iteration, technical approach — so the work is recoverable and the locked decisions are auditable.

## Skill stack used

| Skill | Phase | Outcome |
|---|---|---|
| **`superpowers:brainstorming`** | After Anton overrode the handoff's "pick early" guidance with "but will you show me some options?" | Engaged the skill mid-execution; replaced Path D commitment with a structured 4-path comparison |
| **Brainstorming visual companion** (`scripts/start-server.sh` from the brainstorming skill) | Showing the 4 paths visually + iterating on the lockup | Local HTTP server at http://localhost:51643 served comparison cards (4 paths) → v1 lockup mockup → v2 lockup mockup |
| **TaskCreate / TaskUpdate** | Tracking the multi-step Path A execution + platform wire-in | 15 tasks across both commits |
| Subagents | NOT used | Per the project's token-discipline feedback memory ("no subagents for trivial tasks") — the work was bounded enough for direct execution |

The brainstorming skill's HARD-GATE ("do not invoke implementation skill or take action until design is approved") was honored: after the v1 lockup was generated, the visual companion was used to present it for approval before continuing.

## Decision path (4 options → Path A)

The chat-37 → chat-38 handoff (`docs/specs/2026-05-23-subploters-brand-mark-chat37-handoff.md`) offered four paths:

| Path | Description | Effort | Risk | Recommendation in handoff |
|---|---|---|---|---|
| **A** | Path-draw the entire wordmark so PL aligns inline (Concept 14 idea, executed correctly) | 1-2 chats SVG path work | Medium — chat-37 alignment fragility | — |
| **B** | Hire a designer with Concept 11 + chat-37 README as brief | 2-8k EUR / 2-6 weeks | Low / external dependency | — |
| **C** | Ship Concept 11 standalone + plain wordmark separately (Linear/Stripe family) | Zero | Low | — |
| **D** | C now + path-drawn lockup scheduled as v2 brand refresh | Zero now | Low | ✅ Recommended |

The chat first committed Path D (drafted brand.md edits, created Path-D asset set). Anton then asked **"but will you show me some options?"** — overriding the "pick early" guidance. The brainstorming visual companion rendered the 4 paths side-by-side with previews of what each would ship visually (Concept 11 mark at scale + lockup approximations). **Anton picked Path A.**

This is exactly the chat-34 v0.6 redesign lesson encoded in the feedback memory: even when a handoff says "pick early", invoke brainstorming when the user signals they want to see options.

## Visual iteration (v1 → v2)

Two render cycles in chat-38, with one round of feedback between them:

### v1 — PL spans cap-height to descender (rejected)

- `plScale = (capHeightPx + descenderDepth) / PL_HEIGHT` = 3.589× (in Geist SemiBold at FONT_SIZE=1000)
- PL vertical extent: from cap-height TOP (y=295) to descender BOTTOM (y=1300)
- Total PL height ~1005 units
- Slot width = `font.getAdvanceWidth('pl')` = 913 units
- Wordmark width = 5279 units
- Rationale: Concept 11 was DESIGNED with a P descender extending below baseline (pilcrow anatomy). v1 honored that by aligning the PL bottom to text descender bottom.

Anton's feedback: **"PL too tall — cap at cap-height matching lowercase l height."**

### v2 — PL capped at cap-height (approved)

- `plScale = capHeightPx / PL_HEIGHT` = 2.536× (~30% smaller than v1)
- PL vertical extent: from cap-height TOP (y=295) to baseline (y=1005)
- Total PL height = capHeightPx = 710 units
- Slot width = `plScaledWidth + 80 padding` = 714 units (vs 913 in v1; ~22% tighter)
- Wordmark width = 5080 units (~4% shorter than v1)
- viewBox tightened: -27 199 5389 902 (cropped to actual content; no wasted descender padding)
- Rationale: PL bottom aligned to baseline matches lowercase l ascender height; PL no longer extends below baseline. The Concept 11 P descender is now part of the PL's internal stem geometry (sitting between cap-height and baseline) rather than projecting below the text line.

Anton's response: **"approved"** → moved to brand.md edits and commit.

## Technical approach — path-drawing via opentype.js

The chat-37 lockup attempts (Concepts 12/13/14) failed because SVG `<text>` element glyph widths vary by render context — system font fallbacks, browser quirks, font-loading races. Anton's chat-37 round 5 concept 14 had a PL monogram inline-replacing the "pl" letters in Subploters, but the PL path's x-coordinates were calibrated for one width estimate while the actual render produced different widths, causing the PL to overlap "Sub" and "oters" letters.

Chat-38 fixed this by **path-drawing every letter**:

1. **Font source.** Vercel's `geist` npm package (NOT `@fontsource/geist` — that ships only woff/woff2, which opentype.js can't read without extra unpacking). The Vercel package has `node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.ttf`.
2. **Path extraction.** `opentype.js` `font.getPath(text, x, y, fontSize)` returns SVG-compatible path data for any text + position + size. `font.getAdvanceWidth(text, fontSize)` returns the advance width.
3. **Composition.** Render "Sub" at x=0; reserve a slot of computed width for the PL monogram; render "oters" after the slot. The PL monogram path is the chat-37 Concept 11 verbatim (`M 140 116 L 190 116 C 234 116 270 146 270 184 C 270 222 234 252 190 252 L 190 396 L 140 396 Z M 190 144 L 220 144 C 235 144 248 162 248 184 C 248 206 235 224 220 224 L 190 224 Z M 300 116 L 350 116 L 350 360 L 390 360 L 390 396 L 300 396 Z`).
4. **Trailing `*` qualifier.** Rendered via opentype for the asterisk glyph at 0.42× font size, positioned at cap-height level (chat-37 round 5 idea — small footnote-style amber qualifier).
5. **viewBox computation.** Bounding boxes from opentype's `Path.getBoundingBox()` for each letter group; union them to compute the SVG viewBox tightly around content.

Result: a font-independent SVG. Every letter is an SVG path, no `<text>` element, no font lookup at render time, renders identically in any browser / OS / tool.

## What's locked (cross-reference `brand.md §3`)

Both the **mark form** (PL monogram, Concept 11) and the **master inline-fused lockup** are LOCKED. The v2 brand refresh that Path D would have scheduled no longer exists — the lockup ambition is resolved in v1.1.

Verbatim from `brand.md §3` "What's locked":

| Specification | Value |
|---|---|
| Master lockup | `assets/subploters-lockup.svg` (ink letters, default) + `assets/subploters-lockup-dark.svg` (cream letters, for dark backgrounds) |
| Standalone mark | `assets/subploters-mark.svg` + PNG exports at 16 / 32 / 180 / 192 / 512 px |
| Mark color | Amber `#f59e0b` |
| Letter color | Ink `#1a1a2e` (default variant) / Cream `#fef6e6` (dark-mode variant) |
| Trailing `*` color | Amber `#f59e0b` |
| Mark rotation | `-3°` (baked into asset transform; do not re-apply in CSS) |
| PL geometry | Real ring-shaped P bowl (interior daylight via `fill-rule="evenodd"`), trimmed L foot, 30px stem-to-stem gap (Concept 11 reference proportions) |
| PL inline scale | PL height = cap-height (matches lowercase l ascender, no descender extension below baseline) |
| PL inline slot | PL width + 80 unit padding (40 each side) |

## Build pipeline

Canonical script: **`community/brand/scripts/build-lockup.js`** (committed, ~190 lines).

Dependencies live in the gitignored `community/brand/.scratch/node_modules/` directory (~331 MB — opentype.js + Vercel geist + png-to-ico). To set up a fresh checkout:

```bash
# 1. Install deps in gitignored scratch dir
mkdir -p community/brand/.scratch && cd community/brand/.scratch
npm init -y
npm install opentype.js geist png-to-ico

# 2. Run the canonical script from anywhere
cd ../../..
node community/brand/scripts/build-lockup.js
```

Both lockup variants emit in one run.

To rebuild the **standalone-mark PNG exports** (`subploters-mark-{16,32,180,192,512}.png`) and the **favicon.ico**:

```bash
# From inside community/brand/.scratch/ (where node_modules lives)
node -e "
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const svg = fs.readFileSync('../assets/subploters-mark.svg');
const sizes = [16, 32, 180, 192, 512];
(async () => {
  for (const size of sizes) {
    await sharp(svg, { density: Math.max(72, Math.round(size / 512 * 600)) })
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile('../assets/subploters-mark-' + size + '.png');
  }
})();
"
```

(Sharp comes from the gbrain project's node_modules, not the brand .scratch. Substitute with `npm install sharp` in .scratch if running fresh.)

Favicon.ico regeneration via png-to-ico:

```bash
# From .scratch/
node -e "
const pngToIco = require('png-to-ico').default;
const fs = require('fs');
pngToIco(['../assets/subploters-mark-16.png', '../assets/subploters-mark-32.png']).then(buf =>
  fs.writeFileSync('../../../projects/community-platform/public/favicon.ico', buf)
);
"
```

## Anti-patterns (chat-36 + chat-37 + chat-38 combined)

Do NOT re-explore any of these in future brand-mark iterations (already rejected, documented):

- 🚫 Radial sparkle / 6-point asterisks (Claude/Anthropic-adjacent)
- 🚫 Cross-shaped marks (dagger, reference mark `※` — religious/medical reading)
- 🚫 Name-rooted ornaments (subscript dot, parenthetical, fork-Y diagram, S monogram)
- 🚫 Gem cuts (rhombus, marquise, round brilliant, princess)
- 🚫 Custom S with sweep tail (chat-37 Concept 2)
- 🚫 Em-dash compositional marks (chat-37 Concept 5)
- 🚫 Single period, single vertical bar (chat-37 Concepts 6, 7 — too generic)
- 🚫 Pictorial / illustrative marks (drift from venture-studio aesthetic)
- 🚫 Mascot / character marks

Do NOT relitigate the locked spec — Subploters / Geist / amber / cream / PSA · CITY / Stowarzyszenie / Co-Founder / PL+pilcrow are settled. Build forward.

Do NOT inline-fuse the lockup using `<text>` SVG elements — chat-37 burned on this. Only path-drawing works.

## Triggers for future revisions

If the brand mark needs to revisit any of the locked specs, the trigger conditions are recorded in `brand.md §3`:

- **Second-city launch** (e.g., Berlin / London / NYC)
- **Formal *Stowarzyszenie* registration** (Polish association)
- **Calendar trigger:** Q3 2026

Whichever fires first kicks off a v2 brand refresh. Until then, v1.1 is the locked system.

## Files in this archive

| File | Purpose |
|---|---|
| `README.md` | This document |

No SVG candidates in chat-38 archive — chat-38 went directly from Concept 11 (in `community/brand/explorations/chat-37/concepts/concept-11-pl-refined-glyph.svg`) to the path-drawn lockup with one visual iteration (v1 → v2). The chat-37 archive holds the 14-concept exploration that landed Concept 11.

## See also

- **Canonical brand spec:** `community/brand/brand.md` (v1.1 with §3 locked)
- **Lockup assets:** `community/brand/assets/subploters-lockup{,-dark}.svg`
- **Standalone mark:** `community/brand/assets/subploters-mark.svg` + 5 PNG exports
- **Build script:** `community/brand/scripts/build-lockup.js`
- **Chat-36 → chat-37 handoff:** `docs/specs/2026-05-23-subploters-brand-mark-handoff.md`
- **Chat-37 → chat-38 handoff:** `docs/specs/2026-05-23-subploters-brand-mark-chat37-handoff.md`
- **Chat-37 archive (14 candidates):** `community/brand/explorations/chat-37/`
- **Chat-36 archive (rejected asterisk):** `community/brand/explorations/chat-36-archive/`
- **Chat-38 → chat-39 handoff:** `docs/specs/2026-05-23-subploters-brand-wire-in-followups-handoff.md`
- **Path A wire-in commits on main:** `1d98ee9` (brand resolution) + `e46428d` (community-platform wire-in)
