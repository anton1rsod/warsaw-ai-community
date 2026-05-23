# Chat-36 handoff: Warsaw AI Community logo creation

**Date:** 2026-05-21 · **From:** chat-35 (v0.6.0 ship) · **To:** chat-36 (logo brainstorm + design + ship)

PROTOCOL: `projects/community-platform/HANDOFF_PROTOCOL.md` (loaded once at start)

## ★ Setup

Branch off `origin/main` (HEAD `5e29293` or later — v0.6.0 ship + signed-in smoke fully closed out). No prerequisites; v0.6.0 visual identity is live in production at `https://warsaw-ai-community-platform.vercel.app`.

**Scope guess (chat-36 decides during brainstorm):**

- **Smaller cut (v0.6.1)**: text-only / monogram wordmark + favicon/manifest icons + OG image. Update `Header.tsx` `warsaw.ai` slot if the new mark is text-stylized.
- **Larger cut (v0.7)**: full brand pass — primary mark + symbol + variants (lockup, monogram, favicon, OG, social cards) + brand-guidelines spec §17 + ADR amending or extending ADR-0014 (warm-amber posture) with logo-specific decisions.

Brainstorm decides the cut. Don't pre-commit to v0.6.1 or v0.7 before the brainstorm lands the scope.

## Read in order (~350 lines total)

1. **`projects/community-platform/STATE.md`** — current snapshot. Confirms v0.6.0 shipped + identifies what's tracked. ~110 lines.
2. **`projects/community-platform/spec.md` §16** — v0.6 warm-maximalist visual contract. The LOGO MUST inherit:
   - Color anchor: amber `#f59e0b` (ADR-0014 lock); supporting cream `#fef6e6` / ink `#1a1a2e` / dust `#886c37` (v0.6 tokens)
   - Typography: Fraunces italic (display), Inter (body), JetBrains Mono (voice)
   - Motif: rotated `-1.5°` amber tags / 0-radii / `1.5px` rules
3. **`docs/specs/2026-05-21-community-platform-v0-6-redesign-brainstorm.md`** — design preview ASCII + design-system one-liner ("Fraunces variable axes + rotated amber tag + editorial framing"). The logo must read in this language.
4. **`docs/decisions/0014-community-platform-v0-4-root-anonymous-landing.md`** — warm-amber posture lock. The logo is the inheritor; may amend or extend.
5. **`docs/decisions/0001-oss-first-licensing.md`** — MIT-first posture. Logo licensing should match (CC-BY or CC-BY-SA at minimum; ideally CC0 to allow merch + remix).
6. **`projects/community-platform/CONSTRAINTS.md`** — locked rules. Logo assets land at `community/branding/` (program-level) or `projects/community-platform/public/branding/` (platform-level).
7. **`projects/community-platform/app/layout.tsx`** — current favicon + manifest + apple-touch-icon wiring (the `metadata.icons` block). The logo work replaces the placeholder `#2563eb` solid icons at `/icons/icon-192.png` + `/icons/icon-512.png` (per v0.3 STATE row `v0_3_ship` "current placeholders are #2563eb solid").
8. **`projects/community-platform/app/components/Header.tsx`** — `warsaw.ai` lowercase text wordmark slot. If the logo replaces this, this is the integration point.

**Total read budget: ~350 lines.** Above that and the chat starts paying for stale-context overhead.

## ★ Verify-before-claiming queries (run early)

```bash
# v0.6 design tokens — the canonical source
grep -nE "color-(cream|ink|dust|accent-500)" projects/community-platform/app/globals.css

# Current favicon/icon wiring
grep -nE "icons|manifest" projects/community-platform/app/layout.tsx | head -10

# Header text wordmark slot
grep -nE 'chrome.header.logo|warsaw.ai' projects/community-platform/lib/i18n/strings.ts projects/community-platform/app/components/Header.tsx

# OG image current state (likely default Vercel social card)
ls projects/community-platform/public/ 2>&1 | grep -iE "og|social|share"
```

## ★ This chat owns

**Skill sequence (mandatory):**

1. **`superpowers:brainstorming`** first — explore logo direction. Don't skip per project memory [[feedback_dont_skip_brainstorming]] — even if my framing here suggests a direction, brainstorm before locking. Questions to expect:
   - Wordmark-only vs symbol-only vs lockup?
   - Inherit Fraunces italic vs custom letterforms?
   - Amber on cream vs amber on ink vs both?
   - Monogram (W / AI / W.AI / warsaw.ai) vs symbol (river / built-in-public sketch / hex / dot-graph)?
   - Static vs animated favicon (Vercel supports SVG favicons)?
   - Light-mode only (v0.6 posture) vs dark-mode variant?
   - License — CC0 (most permissive) vs CC-BY (attribution required) vs MIT-style?
   - Distribution — committed assets only vs Figma source + exports?
2. **`superpowers:writing-plans`** after brainstorm + spec section approved — task breakdown for asset generation + wiring.
3. **Optional: `design-html`** — generate HTML mockups of 4-6 logo iterations to compare side-by-side (the chat-34 v0.6 brainstorm used a similar gitignored-`.superpowers/brainstorm/` HTML mockup approach).
4. **TDD implementation** — assertion tests on metadata.icons paths + manifest.json contents + Header img tag if SVG.
5. **`code-review:code-review`** after substantive code changes.
6. **`superpowers:verification-before-completion`** before claiming done — Lighthouse pass on metadata + visual eyeball on prod.

**Skills to NOT invoke:**

- `superpowers:test-driven-development` for the design exploration phase — TDD is for the implementation phase (asset wiring), not brand direction.
- `vercel:shadcn` — v0.6 explicitly rejected shadcn adoption per spec §16.1 framework lock.

**Output expectations:**

| Artifact | Location | Owner |
|---|---|---|
| Logo direction spec | `projects/community-platform/spec.md` §17 (or `community/branding/SPEC.md` if program-level) | chat-36 |
| ADR (if amending posture) | `docs/decisions/0016-warsaw-ai-community-brand-identity.md` | chat-36 |
| Logo source files | `community/branding/logo-source.{svg,fig,sketch}` (SVG primary; design-tool source optional) | chat-36 |
| Exports | `community/branding/exports/` (PNG, PDF, monochrome variants) + `projects/community-platform/public/branding/` (web-optimized) | chat-36 |
| Favicon | Replace `projects/community-platform/public/favicon.ico` + `public/icons/icon-{192,512}.png` + `apple-touch-icon.png` | chat-36 |
| OG image | `projects/community-platform/public/og-image.png` (1200×630) + `metadata.openGraph.images` wired in layout.tsx | chat-36 |
| Header replacement (optional) | If the logo replaces the text `warsaw.ai` slot, modify `app/components/Header.tsx` to render `<img>` or inline `<svg>` | chat-36 |
| License | `community/branding/LICENSE.md` — recommend CC0 (per OSS-first ADR-0001) | chat-36 |
| Memory entry | `~/.claude/projects/.../memory/project_community_platform_v0_7_logo.md` (or `v0_6_1_` per scope decision) | chat-36 |

## ★ Done means

A merge to main containing all of:

1. Spec section locked (either spec.md §17 or community/branding/SPEC.md)
2. Logo source SVG committed
3. Web exports replace `#2563eb` placeholder icons (`favicon.ico`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`)
4. OG image 1200×630 PNG committed + wired into `metadata.openGraph.images`
5. License file
6. Header integration (if direction is wordmark/symbol replacing text slot) — OR explicit "keep current text `warsaw.ai` slot" decision documented
7. Tests green (1191+ baseline)
8. Prod smoke: favicon visible in browser tab, OG image renders in Telegram link-share + Twitter card preview
9. STATE.md flipped with new version SHA
10. Memory entry written
11. Tag pushed (`community-platform-v0.6.1` OR `community-platform-v0.7.0` per scope decision)

## ★ Anti-patterns (chat-specific)

- **Don't bypass brainstorm.** Per [[feedback_dont_skip_brainstorming]] — even if you think you know the direction, run brainstorming first.
- **Don't lock the v0.7 scope upfront.** Brainstorm decides between v0.6.1 (tiny — favicon swap only) vs v0.7 (full brand pass). Either is valid; pick during brainstorm.
- **Don't invent new design tokens.** v0.6 §16.2 locked the palette + type system; the logo INHERITS it. Adding a new color or new font outside that set requires ADR amendment.
- **Don't shed Fraunces' v0.6 character.** If the logo is wordmark, lean into Fraunces italic SOFT/WONK axes — that's the v0.6 identity signature. Departing requires explicit rationale.
- **Don't inject raw HTML for inline SVG.** Inline SVG in JSX is fine — React supports `<svg>` natively as JSX elements. The `SafeHtml` sanitization pipeline (CONSTRAINTS line 16) is for user-content paths only; a static logo SVG is JSX, not user content.
- **Don't ship a PNG-only logo.** Vector (SVG) is canonical; PNG/JPG are EXPORTS. Mockup vendor lock-in (Figma-only / Sketch-only) is fine if the SVG source ships alongside.
- **Don't skip the License file.** Per ADR-0001 OSS-first posture, any committed brand asset needs an explicit license. CC0 is recommended.
- **Don't introduce favicon-generator scripts as build deps.** Pre-generate exports once, commit them, done.

## ★ Paste-ready prompt for chat-36

```
Start chat-36 — Warsaw AI Community logo brainstorm + design + ship.

Read order (read sequentially, ~350 lines total):
1. projects/community-platform/STATE.md (v0.6.0 shipped at SHA 500aa45)
2. projects/community-platform/spec.md §16 (v0.6 visual contract — locks amber/cream/ink palette + Fraunces/Inter/JetBrains type)
3. docs/specs/2026-05-21-community-platform-v0-6-redesign-brainstorm.md (design preview ASCII)
4. docs/decisions/0014-community-platform-v0-4-root-anonymous-landing.md (warm-amber posture lock)
5. docs/decisions/0001-oss-first-licensing.md (MIT/OSS-first posture)
6. projects/community-platform/CONSTRAINTS.md (locked rules)
7. projects/community-platform/app/layout.tsx (current favicon/icons wiring — #2563eb solid placeholders)
8. projects/community-platform/app/components/Header.tsx (current "warsaw.ai" text wordmark slot)

THEN invoke superpowers:brainstorming first.

Per project memory feedback_dont_skip_brainstorming — even if you have a strong direction, brainstorm before locking. Ask me about:
- Wordmark vs symbol vs lockup
- Inherit Fraunces italic vs custom letterforms
- Amber on cream vs amber on ink vs both
- Monogram (W / W.AI / warsaw.ai) vs symbol (river / hex / dot-graph / something else)
- License (CC0 recommended per OSS-first)
- Scope (v0.6.1 minimal favicon swap vs v0.7 full brand pass)

After brainstorm locks the direction, write the spec section (§17) and run superpowers:writing-plans for the implementation breakdown. Done means: tag pushed (v0.6.1 or v0.7.0), prod smoke green, OG image rendering in Telegram link-share.

Handoff doc at docs/specs/2026-05-21-warsaw-ai-community-logo-brainstorm-handoff.md.
```

---

*Drafted 2026-05-21 18:08 CEST in chat-35 at SHA `5e29293`. v0.6.0 ship fully closed; meetup #4 starting in ~50 min at Grzybowska 85a, Warsaw. Chat-36 owns logo work.*
