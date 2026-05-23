# Chat-37 → chat-38 handoff: Subploters brand mark — direction found, form NOT locked

**Date:** 2026-05-23 · **From:** chat-37 (PL+pilcrow direction exploration) · **To:** chat-38 (fresh-chat refinement OR designer hand-off)

PROTOCOL: `projects/community-platform/HANDOFF_PROTOCOL.md` (loaded once at start)

## ★ Setup

Branch off `origin/main`. Chat-37 ran 5 rounds, 14 mark candidates across 4 directions, atop chat-36's ~40 rejections. Direction landed conceptually: **PL+pilcrow fusion** (P bowl + L vertical = pilcrow + Polish country code + subplot embedded letters). Standalone glyph execution at chat-37 Concept 11 is the strongest mark artifact across both chats. Lockup execution (mark beside wordmark) didn't land due to SVG text/path width-alignment fragility.

## ★ Read order (~300 lines total)

1. **`community/brand/brand.md`** — v1 spec (chat-36 lock, §3 form OPEN + chat-37 update note at end of §3)
2. **`community/brand/explorations/chat-37/README.md`** — chat-37 archive overview, all 14 candidates indexed
3. **`community/brand/explorations/chat-37/concepts/concept-11-pl-refined-glyph.svg`** — strongest standalone glyph
4. **`community/brand/explorations/chat-37/comparison-marks.html`** — side-by-side comparison board (open in browser)
5. **`docs/specs/2026-05-23-subploters-brand-mark-handoff.md`** — chat-36 → chat-37 handoff (full original brief)
6. **Chat-36 archive** (gstack): `~/.gstack/projects/warsaw-ai-comunity/designs/subploters-brand-system-20260523/` — 8 HTML comparison boards covering chat-36's rounds

## ★ What's LOCKED (unchanged from chat-36)

| Layer | Value |
|---|---|
| Primary brand | **Subploters** |
| Member identity | **Subploter** / **Subploters** |
| Community name (per location) | **Professional Subploter Community** |
| Formal entity | **Professional Subploters Association** *(Polish Stowarzyszenie when registered)* |
| Insider abbreviation | **PSA** / **PSC** |
| Tagline | **"Every venture is a subplot."** |
| Founder role | **Co-Founder** |
| Color palette | Warm amber `#f59e0b`, cream `#fef6e6`, ink `#1a1a2e`, dust `#886c37` |
| Display type | **Geist** (500/600/700) |
| Body type | **Inter** |
| Voice/code type | **JetBrains Mono** |
| Motifs | Rotated `-1.5°` amber tags, `0` border-radius, `1.5px` rules |
| City stamp | `PSA · CITY` in JetBrains Mono caps, amber tag, rotated -1.5° |
| Multi-location architecture | Warsaw founding; future cities EQUAL externally |
| License | CC0 1.0 Universal (`community/brand/LICENSE.md`) |

## ★ What chat-37 found (concept-level, NOT locked)

### The PL+pilcrow fusion concept

A bold pilcrow's anatomy IS already a P (filled bowl + descender on the left) + L (right vertical stroke). Used as the signature mark, this triple-codes:

1. **Pilcrow ¶** — paragraph mark; subplots are paragraphs in the community's larger narrative.
2. **subPLot** — the embedded letters in "Subploters" highlighting the brand-name's narrative reference.
3. **PL** — Poland country code. Subploters registers as a Polish *Stowarzyszenie*.

Three layers of meaning in one glyph. None of chat-36's directions had this density. Strongest concept of the 54 explored across both chats.

### Concept 11 — refined PL monogram (the artifact that's worth picking up)

`community/brand/explorations/chat-37/concepts/concept-11-pl-refined-glyph.svg`

- Single compound SVG path, `fill-rule="evenodd"` cuts the P bowl interior daylight
- P with real ring-shaped bowl (chat-37 round 4 refinement of round 3's solid-block bowl)
- L with subtle 40×36px foot (trimmed from round 3's chunky 80×50px)
- 30px P-stem-to-L-stem gap (tight but readable letterpair)
- Whole mark rotated -3° around canvas center
- 512×512 viewBox, ready for use as standalone glyph
- Works at 64/32px favicon sizes (16px starts to compress but PL letters still readable)

### What's NOT solved

**The lockup composition** — placing the mark adjacent to the "Subploters" wordmark. Three placement variants tried (chat-37 round 4):

- **Concept 12** — Subploters wordmark with amber `pl` tspan inline + PL monogram in superscript. Works but TWO PL references (inline + superscript) feel redundant.
- **Concept 13** — Subploters all-ink + PL monogram in superscript. Cleanest but the PL feels disconnected from the wordmark (no inline echo).
- **Concept 14** — PL monogram REPLACES the inline `pl` letters (most elegant unification). Plus trailing `*` asterisk as a "Subploters\*-affiliated" qualifier (chat-37 round 5). **Failed in execution** — SVG `<text>` elements have render-context-dependent widths; the PL path coordinates were calibrated for one width estimate and the path overlapped both "Sub" and "oters" in the actual render.

The trailing `*` asterisk qualifier idea is **new and good** — fundamentally different role from chat-36's rejected primary-mark asterisks. Worth preserving as a candidate gesture.

## ★ Recommended chat-38 paths

### Path A — Path-draw the entire wordmark (only chat-38 fix that bypasses the text-width problem)

Dispatch one careful agent (or yourself) to write `Subploters` as a single compound SVG path where every letter is hand-drawn in Geist 700 geometry. Then the PL monogram can be precisely positioned inline because all glyphs share the same coordinate system. Trailing `*` similarly path-drawn. This is the only execution that will land Concept 14 reliably.

**Effort:** moderate — ~600-line SVG path covering 10 letters. Could take 1-2 chats to refine glyph proportions.

### Path B — Hire a designer (Concept 11 as the brief)

Concept 11's PL monogram + the chat-37 README's triple-semantic explanation is enough for a freelance designer to execute the lockup professionally. The mark direction is locked; only the execution needs human-grade typography skill. Budget per chat-36 handoff: 2,000-8,000 EUR.

**Effort:** low Anton-side (find/vet designer); 2-6 weeks designer-side.

### Path C — Ship Concept 11 as glyph + ship plain wordmark + accept no inline lockup

Use Concept 11 as the standalone brand mark (favicon, social avatar, member badge). Use plain "Subploters" wordmark in Geist 600 ink wherever the wordmark appears — no inline PL replacement, no superscript mark. The PL monogram remains a *standalone* brand mark that lives separately from the wordmark, not adjacent.

This is what Linear does (`Linear` wordmark + their square monogram are never inline-fused). Stripe similarly. Mailchimp's M IS inline-fused, but they're an outlier.

**Effort:** zero — Concept 11 is ready to ship. Compromise on the inline-unification ambition.

### Path D — Combine A + C — ship Concept 11 now, path-draw the lockup later

Treat Concept 11 as the v1 brand mark (ship it, use it, build the platform around it). Schedule path-drawn lockup as a v2 brand refresh (e.g., Q3 2026 when second city or formal Stowarzyszenie registration triggers a brand update). De-risks shipping; preserves the lockup ambition.

**Recommendation:** Path D is the lowest-risk and highest-velocity move. The brand mark question has been open for two chats and 54+ candidates; the strongest artifact (Concept 11) is in hand; shipping it unblocks every dependent work. Lockup polish becomes a discrete future task.

## ★ Anti-patterns (chat-36 + chat-37 combined)

DO NOT re-explore these directions in chat-38:

- 🚫 Radial sparkle / 6-point asterisks (Claude/Anthropic-adjacent)
- 🚫 Cross-shaped marks (dagger, reference mark `※` — religious/medical)
- 🚫 Name-rooted ornaments (subscript dot, parenthetical, fork-Y, S monogram)
- 🚫 Gem cuts (rhombus, marquise, round brilliant, princess)
- 🚫 Custom S with sweep tail
- 🚫 Em-dash compositional marks
- 🚫 Single period, single vertical bar (too generic)
- 🚫 Pictorial / illustrative marks (drift from venture-studio aesthetic)
- 🚫 Mascot / character marks

DO NOT relitigate the locked spec — Subploters / Geist / amber / cream / PSA-CITY / Stowarzyszenie / Co-Founder are settled. Build forward.

DO NOT lock the mark form without designer involvement OR a successful path-drawn lockup execution. Concept 11 standalone is shippable as Path C/D, but committing to a specific lockup composition without it actually rendering correctly is the trap chat-37 fell into.

## ★ Done means (for chat-38)

One of these landing patterns:

**Path A done means:** A working lockup SVG that renders correctly across browsers (Chrome / Safari / Firefox), with the path-drawn wordmark and the PL monogram precisely aligned. Either committed at `community/brand/assets/subploters-wordmark.svg` and `community/brand/assets/subploters-mark.svg`, OR a clean handoff to chat-39 if path-drawing the wordmark takes more than one chat.

**Path B done means:** `community/brand/DESIGNER_BRIEF.md` written with: timeline, budget, deliverables list, Concept 11 reference, brand.md spec link, examples of brands in the desired family (Linear / Stripe / Notion / Vercel). brand.md §3 updated to "mark commissioned, in flight."

**Path C done means:** Concept 11 PL monogram copied to `community/brand/assets/subploters-mark.svg` + `community/brand/assets/subploters-mark.png` (at 16/32/180/192/512 px). Plain wordmark also at `community/brand/assets/subploters-wordmark.svg`. brand.md §3 updated to "wordmark + standalone mark; no inline lockup committed; designer engagement queued."

**Path D done means:** All of Path C, plus an open scheduled task in the project backlog: "path-drawn lockup refresh, target Q3 2026 / second-city launch / Stowarzyszenie registration whichever first."

## ★ Resources

- **Locked brand spec:** `community/brand/brand.md`
- **License:** `community/brand/LICENSE.md`
- **Chat-37 archive:** `community/brand/explorations/chat-37/` (14 SVGs + comparison HTML + README)
- **Chat-37 strongest artifact:** `community/brand/explorations/chat-37/concepts/concept-11-pl-refined-glyph.svg`
- **Chat-36 archive (gstack):** `~/.gstack/projects/warsaw-ai-comunity/designs/subploters-brand-system-20260523/`
- **Chat-36 → chat-37 handoff:** `docs/specs/2026-05-23-subploters-brand-mark-handoff.md`
- **ADR-0001 (OSS-first licensing):** `docs/decisions/0001-oss-first-licensing.md`

## ★ Paste-ready prompt for chat-38

```
Start chat-38 — Subploters brand mark resolution (continuation from chat-37).

Read order:
1. community/brand/brand.md (v1 spec + chat-37 update note in §3)
2. community/brand/explorations/chat-37/README.md (chat-37 archive overview)
3. community/brand/explorations/chat-37/concepts/concept-11-pl-refined-glyph.svg (strongest artifact)
4. docs/specs/2026-05-23-subploters-brand-mark-chat37-handoff.md (this handoff)

Chat-37 found the direction — PL+pilcrow fusion — but didn't land the lockup. Concept 11 standalone PL monogram glyph is the strongest artifact. Three path-forward options in the handoff: Path A (path-draw entire wordmark) / Path B (designer brief) / Path C (ship Concept 11 standalone, no inline lockup) / Path D (C now + path-drawn lockup deferred). Recommended: Path D.

Decide path early. Do NOT re-iterate already-rejected directions (see handoff Anti-patterns section).
```

---

*Drafted 2026-05-23 in chat-37 by Claude Code after Anton signaled chat exhaustion. Chat-37 produced 14 mark candidates across 5 rounds; the PL+pilcrow concept density is the chat's primary contribution.*
