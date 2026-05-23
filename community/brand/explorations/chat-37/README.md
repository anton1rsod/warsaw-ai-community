# Chat-37 — Subploters mark exploration archive

**Date:** 2026-05-23 · **Status:** Direction explored, form NOT locked (returned to brand.md §3 "form OPEN")

This directory archives 5 rounds × 14 mark candidates from chat-37, after chat-36's ~40 rejections. Direction found (PL+pilcrow fusion); final lockup execution didn't land. Preserved for chat-38 / designer continuation.

## Files

| Path | Purpose |
|---|---|
| `concepts/concept-1-pl-ligature-{glyph,lockup}.svg` | Round 1, Direction A — `pl` letterpair highlight inside wordmark |
| `concepts/concept-2-modified-s-{glyph,lockup}.svg` | Round 1, Direction A — custom S with sweep tail |
| `concepts/concept-3-story-bracket-{glyph,lockup}.svg` | Round 1, Direction B — bracket `⟩` after wordmark |
| `concepts/concept-4-pilcrow-glyph.svg` | Round 2, Direction C — pilcrow `¶` (semantic standout) |
| `concepts/concept-5-emdash-anchor-glyph.svg` | Round 2, Direction C — em-dash + vertical anchor `—\|` |
| `concepts/concept-6-period-glyph.svg` | Round 2, Direction C — period `.` (minimalist) |
| `concepts/concept-7-vertical-bar-glyph.svg` | Round 2, Direction D — vertical bar `▌` (brutalist) |
| `concepts/concept-8-pilcrow-pl-monogram-glyph.svg` | Round 3 — pilcrow that reads as "Pl" (rough execution) |
| `concepts/concept-9-wordmark-pl-pilcrow-lockup.svg` | Round 3 — wordmark with amber pl + system pilcrow superscript |
| `concepts/concept-10-bold-pl-monogram-glyph.svg` | Round 3 — bold PL monogram (pre-refinement) |
| `concepts/concept-11-pl-refined-glyph.svg` | **Round 4 — refined PL monogram with ring bowl, trimmed L foot, -3° rotation. Strongest standalone glyph in this archive.** |
| `concepts/concept-12-lockup-amber-pl-with-pl-superscript.svg` | Round 4 — wordmark amber pl + PL monogram superscript |
| `concepts/concept-13-lockup-all-ink-with-pl-superscript.svg` | Round 4 — all-ink wordmark + PL monogram superscript |
| `concepts/concept-14-lockup-pl-inline-replacement.svg` | Round 5 — PL inline replacing "pl" + trailing `*` qualifier (alignment failed) |
| `comparison-marks.html` | Side-by-side comparison board for all candidates |

## Triple-semantic concept (the direction that landed)

The bold pilcrow `¶` anatomy naturally reads as **P** (filled bowl + descender on left) + **L** (right vertical stroke). This triple-codes:

1. **Pilcrow ¶** — paragraph mark. Each subploter's venture is a paragraph in the community's larger story.
2. **subPLot** — the embedded letters in "Subploters" highlight the brand-name's narrative reference.
3. **PL** — Poland country code. Subploters is a Polish-registered *Stowarzyszenie* (Professional Subploters Association).

This concept is conceptually strong. The strongest standalone glyph execution is `concept-11-pl-refined-glyph.svg` (real ring-shaped P bowl with interior daylight, trimmed L foot, -3° rotation).

## What's still open

The **lockup composition** (signature mark adjacent to the wordmark) didn't land in chat-37. Three lockup variants attempted (concepts 12, 13, 14), each with execution issues:

- **Concept 12/13**: PL monogram in superscript position after wordmark — works but feels redundant alongside the amber `pl` inline (12) or generic in pure-superscript form (13).
- **Concept 14**: PL monogram REPLACES the inline `pl` letters (most elegant concept) — but SVG `<text>` + `<path>` alignment is fragile because system-font character widths vary by render context. The PL path overlapped the trailing edge of `Sub` and the leading edge of `oters`. Reliable execution requires path-drawing the entire wordmark.

Trailing `*` asterisk qualifier (chat-37 round 5) — semantic role *different* from chat-36's rejected primary-mark asterisks (this one is a small footnote-style reference indicator, not a foreground signature). Not yet tested in a working lockup.

## Anti-patterns (chat-36 + chat-37 combined)

Do NOT re-explore (rejected across both chats):
- 🚫 Radial sparkle asterisks (Claude/Anthropic-adjacent)
- 🚫 Cross-shaped marks (dagger, reference mark `※` — religious/medical reading)
- 🚫 Name-rooted ornaments (subscript dot, parenthetical, fork-Y diagram)
- 🚫 Gem cuts (rhombus, marquise, round brilliant)
- 🚫 Custom S with sweep tail (Concept 2 — execution was rough; concept itself never landed)
- 🚫 Em-dash compositional marks (Concept 5 — generic at favicon scale)
- 🚫 Single period (Concept 6 — too generic)
- 🚫 Single vertical bar (Concept 7 — too generic)

## See also

- Chat-36 archive at `~/.gstack/projects/warsaw-ai-comunity/designs/subploters-brand-system-20260523/` (8 HTML comparison boards covering chat-36's rounds)
- Chat-37 handoff: `docs/specs/2026-05-23-subploters-brand-mark-chat37-handoff.md`
- Brand spec: `community/brand/brand.md` (v1 — chat-36 lock, §3 form still OPEN)
