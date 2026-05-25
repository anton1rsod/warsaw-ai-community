# Chat-40 — Subploters mark v1.2 exploration archive (REJECTED)

**Date:** 2026-05-25 · **Status:** All 16 candidates across 3 rounds rejected. v1.2 mark design STILL OPEN. Chat-41 to re-aim.

This directory archives chat-40's three-round exploration attempting to design replacements for the retired PL standalone mark + trailing `*` qualifier (per chat-39 v1.2 scope-pivot). **None of the candidates landed.** Preserved here so future chats can see exactly what's already been tried and avoid relitigation.

## Skill stack used (carried from chat-38)

| Skill | Phase | Outcome |
|---|---|---|
| **`superpowers:brainstorming`** | Whole chat (driver) | Visual companion server at port 62798, comparison boards across 3 rounds |
| `design-shotgun` | Loaded mid-chat after Anton said "use the same skill we did while creating the logo" | gstack `$D` binary unavailable (DESIGN_NOT_AVAILABLE); fell back to manual generator scripts |
| **opentype.js + Geist SemiBold pipeline** (`.scratch/`) | Round 1 onward, after round 0 sketch rejection | Same chat-38 path-drawing approach via `font.getPath(text, x, y, FONT_SIZE)` |
| **TaskCreate / TaskUpdate** | Throughout | 5 tasks tracked |

## Three rounds, 16 candidates, 0 winners

### Round 0 — Crude 4-direction sketches (Arial text + letter-spacing)

Initial round before quality-bar discovered. Four directions presented as schematic SVGs using `<text>` with system-ui sans-serif and color-only differentiation. **Anton's reaction: "A is ok. But it's not even good. Others are just wful."**

Directions presented:
- A: PSA monogram (P+S+A interlocked, text-based)
- B: Money/growth glyph (stock up-arrow)
- C: Hybrid (P with arrow accent)
- D: Narrative/punctuation (open bracket `[`)

**Lesson learned:** Arial-text approximations of mark forms read as sketches, not candidates. The chat-37/38 quality bar = real Geist glyph paths via opentype.js. Round 0 SVGs not preserved (deliberately not archived — they were process artifacts, not exploration candidates).

### Round 1 — PSA monogram architectures (chat-37 quality, real Geist paths)

After the round-0 quality complaint, the pipeline switched to opentype.js + Geist SemiBold. Four PSA monogram architectures generated, each at chat-37 quality with real path data:

Files in `round-1-psa-architectures/`:
- `psa-arch-1-interlocked.svg` — P/S/A tight-set in a row, -4% kerning, all ink
- `psa-arch-2-stacked.svg` — Vertical stack, ink P/A + amber S accent
- `psa-arch-3-badge.svg` — Cream PSA stacked inside amber rectangle (Stowarzyszenie seal lineage) **← Anton's round-1 pick**
- `psa-arch-4-pillars.svg` — Ink PSA with three amber vertical bars below

**Anton drilled into Architecture 3 (badge).** Reading the cadence: not enthusiasm, just least-bad option of four.

Generator script: `community/brand/scripts/build-psa-candidates.js` (preserved).

### Round 2 — Badge variants (6 sub-variants of Architecture 3)

Six badge sub-variants exploring aspect ratio, color treatment, and decoration. All chat-37 quality.

Files in `round-2-badge-variants/`:
- `psa-badge-va-square-stack-cream.svg` — Square badge, vertical PSA stack, cream on amber
- `psa-badge-vb-square-row-cream.svg` — Square badge, horizontal PSA row, cream on amber
- `psa-badge-vc-landscape-row-cream.svg` — Landscape (~2:1) badge, horizontal row, cream on amber (postal-stamp feel)
- `psa-badge-vd-square-row-ink.svg` — Square badge, INK letters on amber (high-contrast inversion)
- `psa-badge-ve-outline-square-ink.svg` — No fill, amber outline + ink letters (respects "amber as accent" rule)
- `psa-badge-vf-double-rule-seal.svg` — Amber field + thin ink inner border + cream letters (max Stowarzyszenie energy)

**Anton's reaction: "I don't like any of those."**

Generator script: `community/brand/scripts/build-psa-badge-variants.js` (preserved).

### Round 3 — Abstract Subploters glyphs (no letters, anti-pattern-clean)

After badge rejection, re-aimed via AskUserQuestion (D2) to abstract glyphs that carry brand semantic without spelling PSA. Anton chose "abstract Subploters glyph" over "non-badge PSA / fewer-letter / revisit-other-round-1-directions."

Six single-shape candidates explicitly avoiding anti-patterns:

Files in `round-3-abstract-glyphs/`:
- `abstract-1-asterism.svg` — Three filled amber dots in inverted triangle (classical scene-break mark)
- `abstract-2-twin-ascend.svg` — Two parallel amber diagonals (trajectory without literal arrow)
- `abstract-3-bracket-angle.svg` — Open amber bracket + ink plot-point dot (two-tone narrative aside)
- `abstract-4-hash-beats.svg` — Three short parallel horizontal amber lines (paragraph-break visual)
- `abstract-5-vertical-hatch.svg` — Three vertical amber strokes with varied heights (subplot threads)
- `abstract-6-single-arc.svg` — Single elegant amber curve (story-arc gesture)

**Anton's reaction: "wow that's shit. Ok. Closing this session."**

Generator script: `community/brand/scripts/build-abstract-glyphs.js` (preserved).

## What was tried, summarised

| Round | Candidates | Direction | Anton's verdict |
|---|---|---|---|
| 0 | 4 (PSA / money-growth / hybrid / narrative) at Arial sketch quality | All directions at low fidelity | A "ok but not even good"; B/C/D "wful" |
| 1 | 4 PSA monogram architectures at Geist path quality | PSA monogram direction | Picked badge by elimination |
| 2 | 6 badge sub-variants | Drilling into badge | "I don't like any of those" |
| 3 | 6 abstract single-shape glyphs | Re-aimed off PSA, off letters | "wow that's shit" |

## Combined anti-patterns (chat-36 + chat-37 + chat-38 + chat-40)

Future chats must NOT re-explore any of these (already rejected, documented):

**From chat-36** (~40 candidates rejected across 7 rounds):
- 🚫 Radial sparkle / 6-point asterisks (Claude/Anthropic-adjacent)
- 🚫 Cross-shaped marks (dagger, reference mark `※`)
- 🚫 Name-rooted ornaments (subscript dot, parenthetical, fork-Y diagram, S monogram alone)
- 🚫 Gem cuts (rhombus, marquise, round brilliant, princess)
- 🚫 Pictorial / illustrative marks
- 🚫 Mascot / character marks

**From chat-37** (14 candidates):
- 🚫 Custom S with sweep tail (Concept 2)
- 🚫 Em-dash compositional marks (Concept 5)
- 🚫 Single period (Concept 6)
- 🚫 Single vertical bar (Concept 7)
- 🚫 Pilcrow without PL anatomy (Concept 4 — only worked because of PL coincidence in Concept 11)

**From chat-40** (16 candidates — NEW):
- 🚫 PSA 3-letter monogram, any architecture (interlocked, stacked, badge, pillars)
- 🚫 Block badge container (square, landscape, outline, double-rule) — feels institutional, fights venture-studio aesthetic
- 🚫 Asterism / 3-dot inverted triangle
- 🚫 Twin parallel ascending diagonals
- 🚫 Bracket angle + plot-point dot
- 🚫 Hash beats (3 horizontal lines)
- 🚫 Vertical hatch (3 verticals, varied heights)
- 🚫 Single sweeping arc

## What was NOT tried in chat-40 (open for chat-41+)

- 2-letter monograms (PS, PA, SA — anti-pattern only rules out S alone)
- 1-letter mark (P or A — S alone is anti-pattern)
- Money/growth direction at chat-37 quality (only sketched in round 0, rejected at Arial-text level)
- Narrative/punctuation direction at chat-37 quality with NEW glyphs not yet tried (not pilcrow, asterism, bracket, hash, em-dash, period, vertical bar — what's left?)
- Custom invented glyph driven by a specific brand metaphor session-first (mood board / references before candidates)
- Wordmark-only approach (no standalone mark; favicon uses an extracted letter or initial)
- External designer (chat-37 handoff Path B at EUR 2-8k, 2-6 weeks)
- Restoring PL monogram, deferring v1.2 to v2 brand refresh (when second city actually launches)

## Process lessons for chat-41+

1. **Crude sketches don't communicate at this brand's quality bar.** Anton needs chat-37-level path-drawn renders to evaluate a candidate. Arial-text approximations are wasted tokens. Skip round 0 entirely; first candidates should be path-drawn.

2. **Anton's "ok" is yellow light, not green.** When Anton says "ok but not even good" — that's a rejection in disguise. Stop drilling into the "ok" direction; ask "what would make it actually good?" before generating variants.

3. **Visual companion comparison boards work.** The HTML + favicon-strip preview pattern surfaces scale problems. Keep this pattern.

4. **3 failed rounds = step way back, don't generate round 4 immediately.** The cadence so far is: cards rejected → re-aim → more cards rejected. Chat-41 should start with a brainstorm about what Subploters' mark should FEEL like (mood, references, neighborhoods) before any candidate generation.

5. **opentype.js + Geist pipeline works.** `.scratch/` is already set up. Generator scripts in `community/brand/scripts/` are reusable templates.

## Generator scripts (preserved in `community/brand/scripts/`)

- `build-psa-candidates.js` — round 1 (4 PSA architectures)
- `build-psa-badge-variants.js` — round 2 (6 badge variants)
- `build-abstract-glyphs.js` — round 3 (6 abstract glyphs)

All three accept `--screen-dir PATH` to write the comparison HTML to the brainstorming visual companion's content directory.

## Cross-references

- **Chat-39 → chat-40 handoff:** `docs/specs/2026-05-25-subploters-brand-followups-handoff.md`
- **Chat-40 → chat-41 handoff:** `docs/specs/2026-05-25-subploters-brand-v1-2-chat40-closeout-handoff.md`
- **Brand spec:** `community/brand/brand.md` §10 (v1.2 still OPEN as of chat-40 close)
- **Prior archives:** `community/brand/explorations/{chat-36-archive,chat-37,chat-38}/`
- **Triple-coded PL monogram (retired):** `community/brand/explorations/chat-37/concepts/concept-11-pl-refined-glyph.svg` — still available if Anton picks "restore PL, defer v1.2 to v2" path.
