# Chat-40 → chat-41 handoff: Subploters brand v1.2 — Path Z (wordmark-only) locked

**Date:** 2026-05-25 · **From:** chat-40 (3 rounds × 16 candidates rejected) · **To:** chat-41 (Path Z execution — three sub-questions to lock, then implementation)

**★ Path locked 2026-05-25 (chat-40 close):** Anton picked **Path Z — wordmark-only, no standalone mark beyond favicon (Stripe / Substack lineage)**. The five-path triage section below is historical context; the operative work for chat-41 is in the "Path Z scope" and "Paste-ready prompt" sections at the bottom of this doc.

PROTOCOL: brand work; the eventual wire-in is platform work but not yet.

## ★ Setup

Branch off `origin/main`. Latest relevant commits:

- `4f91b40` — `docs(community-platform): chat-39 STATE — COMMUNITY_NAME flipped to "Professional Subploters Association"`
- `4d9d053` — `docs(brand): chat-39 closeout — chat-40 handoff for remaining Subploters follow-ups`
- `edf0335` — `docs(brand): chat-39 scope-pivot — brand v1.2 design handoff for chat-40`
- (this commit) — `docs(brand): chat-40 closeout — v1.2 design rounds rejected + chat-41 handoff`

## ★ State after chat-40

**v1.2 mark design STILL OPEN.** Three rounds of brainstorming with the visual companion + opentype.js + Geist SemiBold pipeline produced 16 candidates. **All 16 rejected.**

Trajectory:
1. Round 0 (Arial sketches, 4 directions): "A is ok but not even good. Others are wful." → quality bar gap revealed
2. Round 1 (4 PSA architectures, chat-37 quality): picked badge by elimination, not enthusiasm
3. Round 2 (6 badge variants): "I don't like any of those"
4. Round 3 (6 abstract glyphs): "wow that's shit"

Archive: `community/brand/explorations/chat-40/` — all 16 SVGs + 3 generator scripts + a README documenting what was tried and rejected. **Do not relitigate any of these forms in chat-41.**

## ★ Chat-41 scope — re-aim before any candidates

**HARD CONSTRAINT for chat-41:** Do NOT generate mark candidates first. Three failed rounds is signal that the problem isn't candidate quality, it's direction. Start with a brainstorm about what Subploters' mark should FEEL like, then narrow to a path.

### Five paths chat-41 can take

| Path | Approach | Cost | Risk |
|---|---|---|---|
| **X — External designer** | Hire a designer with all chat-36/37/38/40 archives as brief. Repackages chat-37's Path B. | EUR 2-8k, 2-6 weeks | External dependency, but high probability of landing |
| **Y — Restore PL, defer v1.2 to v2** | Roll back chat-39's PL retirement. Keep `community/brand/assets/subploters-mark.svg` live. Plan v2 brand refresh when second city actually launches (triggers per brand.md §3). | Zero | Multi-location architecture (§5) concern returns — but no second city yet, so the concern is hypothetical |
| **Z — Wordmark-only, no standalone mark** | Subploters as typographic-only brand (Stripe-2010, Substack, Apollo lineage). Favicon uses an extracted letter from the wordmark, or just "S" at small scale. | ~1-2 hours platform wire-in change | Loses the standalone-mark slot entirely; favicon may feel weaker than v1.1 PL |
| **W — Mood board first, candidates after** | Step way back. Compile references (brand marks Anton admires), establish FEEL before form, then generate candidates with explicit metaphor target. | 1-2 brainstorming chats | More structured but slower; risks producing another round-N rejection if the feel target itself is fuzzy |
| **V — Direction-level brainstorm without candidates** | One chat of structured questions only: what brand neighborhoods (modern venture / cultural seal / literary glyph / abstract gesture) feel right? What references? What does the mark NEED to do (favicon? social avatar? merch?)? No mockups. End with a brief that a designer or another chat can execute. | One short chat | May feel slow if Anton wants to see things, but cheapest way to land |

**Chat-40 does not recommend a path** — the 3-round failure is too strong a signal to make confident recommendations. Chat-41 should open with `superpowers:brainstorming` and ask Anton which path matches his current appetite (time, money, ambition).

## ★ What's been tried + locked + open

### Already tried + rejected (don't repeat)

- ❌ Arial-text sketches of any direction (round 0 quality fail)
- ❌ PSA 3-letter monogram in any architecture (round 1 + 2)
  - ❌ Interlocked horizontal ligature
  - ❌ Stacked vertical (with or without amber S accent)
  - ❌ Block badge (square / landscape / outline / double-rule / cream-on-amber / ink-on-amber)
  - ❌ Architectural pillars
- ❌ Abstract single-shape glyphs (round 3)
  - ❌ Asterism / 3-dot inverted triangle
  - ❌ Twin parallel ascending diagonals
  - ❌ Bracket angle + plot-point dot
  - ❌ Hash beats (3 horizontal lines)
  - ❌ Vertical hatch (3 verticals, varied heights)
  - ❌ Single sweeping arc

### Locked (from v1.1, do not relitigate)

- Master wordmark "Subploters" typographic form — Geist SemiBold path-drawn, ink color, current letter geometry
- Tagline `Every venture is a subplot.`
- Typography (Geist + Inter + JetBrains Mono)
- Color palette (`#f59e0b` amber, `#fef6e6` cream, `#1a1a2e` ink, `#886c37` dust)
- City stamp visual treatment (-1.5° rotation, JetBrains Mono caps, amber field)
- Naming architecture (Subploters / Professional Subploters Association / PSA / PSC)
- ADR-0001 OSS-first + CC0 brand asset license

### Open in v1.2 (still needs decision)

- Standalone mark (the favicon / avatar slot — what replaces the retired PL?)
- Trailing glyph (the wordmark qualifier — what replaces the retired `*`?)
- Platform wire-in of location identification (§4.3 city stamp + §4.4 formal entity lockup + §4.5 location sub-marks) — currently the platform Header only renders the wordmark; nothing changed in chat-40 since marks weren't designed

## ★ Untried angles for chat-41 if Path V / W / X is picked

These remain candidate-space if chat-41 decides to keep exploring (rather than going Path X to a designer, Path Y restoring PL, or Path Z wordmark-only):

- **2-letter monogram** — PS (Professional Subploters), PA (Professional Association), SA (Subploters Association). Anti-pattern only rules out S alone, not 2-letter PS-style ligatures.
- **1-letter mark** — P or A alone (S alone is anti-pattern). Could be a custom geometric P or A with distinctive treatment.
- **Money/growth direction at chat-37 quality** — round 0 only sketched it in Arial; could land if executed with strong non-cliché geometry. Risk: Antler/Hexa/TechStars neighborhood.
- **Narrative/punctuation glyphs not yet tried** — what's left after pilcrow, asterism, bracket, hash, em-dash, period, vertical bar? Possibly: section sign §, double dagger ‡ (but cross anti-pattern), pilcrow with completely new anatomy, custom invented punctuation.
- **Pattern / system instead of mark** — a brand SYSTEM (color, type, micro-elements) without a singular mark. Linear's approach pre-2023.

## ★ Read order for chat-41 (lazy)

1. **This handoff** — current document
2. **`community/brand/explorations/chat-40/README.md`** — full chat-40 archive with what was tried + rejected
3. **`community/brand/brand.md`** — §10 v1.2 entry updated; v1.1 system intact
4. **`community/brand/explorations/chat-37/README.md`** + concept-11 SVG — PL monogram lineage that could be RESTORED (Path Y)
5. **Chat-38 process archive** at `community/brand/explorations/chat-38/README.md` — quality-bar reference

## ★ What NOT to do in chat-41

- Don't generate mark candidates in the first response. Brainstorm direction first.
- Don't relitigate any of the 16 rejected chat-40 forms (see anti-pattern list above + in archive README).
- Don't relitigate chat-36's ~40 rejections or chat-37's 14 rejections (combined anti-pattern list in archive README).
- Don't use Arial/system-font sketches — only opentype.js + Geist path-drawn renders match this brand's quality bar.
- Don't assume PSA-as-mark is viable — chat-40 closed that direction.
- Don't try to "fix" the wordmark — locked from v1.1.
- Don't auto-route to a designer — Path X is one of five options, not the default; ask Anton.

## ★ Path Z scope — wordmark-only architecture

Anton locked Path Z at end of chat-40. The work for chat-41 is to brainstorm three sub-questions, then write the spec amendments + asset regeneration plan.

### Q1 — Favicon slot under wordmark-only architecture

There's no standalone mark, but the favicon (16/32/180/192/512 px) still needs SOMETHING. Reference brands:

| Brand | Favicon approach |
|---|---|
| **Substack** | "S" first letter from wordmark (typographic, not stylized) |
| **Stripe** | "/" — abstracted slash from old logo |
| **Linear** | "L" / minimal slash |
| **Notion** | "N" first letter (typographic) |
| **Mailchimp** | Chimp icon (they DO keep a mark — counter-example) |

Options:
- (a) **"S" extracted from wordmark** — Geist SemiBold S, path-drawn, amber or ink, -3° rotation. Substack lineage. Most natural.
- (b) **"Sub" wordmark fragment** — first three letters of wordmark at large size, cropped to square. Reads as wordmark-fragment, not as letter.
- (c) **Trailing `*` rendered standalone** — only if Q2 keeps the `*` as wordmark accent.
- (d) **Minimal abstract glyph reserved for favicon-only use** — something distinct from chat-40 abstract glyphs (asterism / twin ascend / bracket / hash beats / vertical hatch / single arc all rejected).
- (e) **No favicon** — use just a solid amber square or no favicon at all (rare; weakens the brand).

**Anti-pattern clarification:** chat-37 rejected "S monogram" as **a custom stylized S with sweep tails treated as a signature mark**. Option (a) here is different — it's the FIRST LETTER OF THE WORDMARK rendered in the SAME typeface as the wordmark (Geist SemiBold), no custom anatomy. That's typography, not monogram design. Substack does this; it's safe to revisit.

### Q2 — Trailing `*` status under Path Z

The trailing `*` qualifier in `Subploters*` was retired per chat-39 v1.2 scope-pivot. Under Path Z:

- (a) **Retire entirely** — clean `Subploters` wordmark, no trailing glyph. Maximum Stripe/Substack purity.
- (b) **Keep as wordmark typographic accent** — `Subploters*` always renders together, the `*` is part of the wordmark composition (not a separate "mark" or "qualifier"). Preserves the chat-37/38 typographic detail without it being a separate compositional element.

Q1 and Q2 interact — if Q2 keeps `*`, Q1 option (c) becomes available.

### Q3 — Platform location wire-in (still part of v1.2 scope)

Chat-39 scope-pivot named three intertwined moves for v1.2: (1) mark replacement, (2) trailing glyph replacement, (3) location identification wire-in. Path Z dissolves (1); Q2 resolves (2); (3) still needs locking.

Where do §4.3 city stamp + §4.4 formal entity lockup + §4.5 location sub-marks land on the platform?

- (a) Header chip right of wordmark (`Subploters  PSA · WARSAW`)
- (b) Footer chip
- (c) About page full formal lockup (`POLISH STOWARZYSZENIE · FOUNDED 2024 · WARSAW`)
- (d) All three (recommended in chat-39 handoff — different surfaces serve different roles)

### Implementation work after Q1-Q3 lock

1. **Amend `community/brand/brand.md`** §1 architecture description (currently says "three-piece compositional system: inline-fused lockup + standalone PL + city stamp" — rewrite for wordmark-only)
2. **Amend §3** — retire "The signature mark and master lockup — v1.1" section; replace with v1.2 wordmark-only spec
3. **Amend §4.1/§4.2** — wordmark becomes single canonical element; standalone-mark section either retires entirely OR redirects to favicon-only spec
4. **Amend §8** — asset directory tree updated for new file set
5. **Add §10 v1.2 entry** marking Path Z shipped
6. **Asset regeneration:**
   - `subploters-lockup.svg` + `subploters-lockup-dark.svg` — rebuild WITHOUT inline PL (and with/without trailing `*` per Q2). `community/brand/scripts/build-lockup.js` needs amendment.
   - `subploters-mark.svg` + 5 PNG exports + favicon.ico — replace with Q1 favicon choice (or retire entirely with Q1=(e))
7. **Platform wire-in (per Q3):**
   - `projects/community-platform/app/components/Header.tsx` — possibly add city chip
   - `projects/community-platform/app/components/Footer.tsx` — possibly add formal entity treatment
   - `/about` page — possibly add formal lockup component
   - Updated `subploters-lockup-dark.svg` propagates to Header automatically via existing wire-in

## ★ Paste-ready prompt for chat-41

```
Start chat-41 — Subploters brand v1.2, Path Z (wordmark-only, Stripe/Substack lineage) confirmed by Anton at end of chat-40.

Read order:
1. docs/specs/2026-05-25-subploters-brand-v1-2-chat40-closeout-handoff.md (this handoff — Path Z scope section)
2. community/brand/explorations/chat-40/README.md (3 rounds × 16 rejected candidates + combined chat-36/37/40 anti-pattern list)
3. community/brand/brand.md (v1.1 system, §10 v1.2 OPEN)

Skill: superpowers:brainstorming for the three Q1-Q3 sub-questions, then writing-plans for asset-regeneration + platform-wire-in.

Three sub-questions to lock in chat-41 (full options in handoff §"Path Z scope"):
  Q1) Favicon slot — "S" extracted (Substack-style) / "Sub" fragment / standalone * / new minimal glyph / no favicon
  Q2) Trailing * — retired entirely / kept as wordmark typographic accent
  Q3) Platform location wire-in — Header / Footer / About / all three

Reference brands (Path Z lineage): Stripe (early), Substack, Linear, Notion, Apollo. Wordmark-centric brands with minimal or extracted-letter favicons.

Anti-pattern clarification: chat-37 rejected "S monogram" as a CUSTOM STYLIZED S with sweep tails treated as primary mark. First-letter-of-wordmark in Geist SemiBold (Substack-style) is typography, not monogram design — safe to revisit.

Locked from v1.1 (do NOT change):
- Master wordmark typographic form: "Subploters" Geist SemiBold path-drawn, ink color, current letter geometry
- Tagline: "Every venture is a subplot."
- Color palette: amber #f59e0b / cream #fef6e6 / ink #1a1a2e / dust #886c37
- Typography: Geist + Inter + JetBrains Mono
- City stamp visual: -1.5° rotation, JetBrains Mono caps, amber field
- Naming architecture: Subploters / Professional Subploters Association / PSA / PSC
- ADR-0001 OSS-first + CC0 brand license

Don't relitigate: PSA letter monograms (any architecture), badge containers (any variant), the 6 chat-40 abstract glyphs (asterism, twin ascend, bracket angle, hash beats, vertical hatch, single arc), plus combined chat-36 + chat-37 anti-patterns at the archive README.

Pipeline available: opentype.js + Geist SemiBold path-drawing via community/brand/.scratch/. `build-lockup.js` needs amendment (no inline PL; * status TBD per Q2).

Output: spec amendments to community/brand/brand.md (§1/§3/§4/§8/§10) + amended build-lockup.js + regenerated assets (subploters-lockup{,-dark}.svg + subploters-mark.svg/PNGs/favicon.ico per Q1) + platform wire-in per Q3.
```

---

*Drafted 2026-05-25 in chat-40 after three rounds of brand-mark exploration produced 16 candidates and zero winners. Anton picked Path Z (wordmark-only) at session close. Handoff amended to scope Path Z specifically.*
