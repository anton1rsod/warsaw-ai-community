# Chat-39 → chat-40 handoff: Subploters brand v1.2 design (mark + trailing glyph + location)

**Date:** 2026-05-25 · **From:** chat-39 (env closeout shipped + brand v1.2 scope-pivot) · **To:** chat-40 (brand v1.2 design — brainstorm → spec)

PROTOCOL: `projects/community-platform/HANDOFF_PROTOCOL.md` (loaded once when entering platform scope; chat-40 is brand work but the eventual wire-in is platform work).

## ★ Setup

Branch off `origin/main`. Latest relevant commits:

- `4f91b40` — `docs(community-platform): chat-39 STATE — COMMUNITY_NAME flipped to "Professional Subploters Association"`
- `4d9d053` — `docs(brand): chat-39 closeout — chat-40 handoff` *(this file before chat-39 rewrite)*
- (this rewrite) — `docs(brand): chat-39 brand v1.2 scope-pivot — chat-40 handoff rewritten`

## ★ State after chat-39

**Env flip closed** (chat-38 §1): `COMMUNITY_NAME` = `Professional Subploters Association` on Vercel prod + preview; verified `vercel env pull` + prod HTTP smoke green. STATE.md `v1_1_brand_env_flip` row.

**Brand v1.2 work BEGINS here** (Anton's mid-chat scope-pivot 2026-05-25). Three intertwined design moves:

1. **PL monogram is OUT.** v1.1 standalone mark (`community/brand/assets/subploters-mark.svg`) reads as too-on-the-nose Poland reference; works against the multi-location architecture (§5) that *deliberately* equalizes all cities (PL = founding-city national code → wrong primary-identity layer).
2. **Trailing `*` is OUT.** v1.1 asterisk qualifier (in wordmark + formal entity lockup) gets replaced with a money/growth emoji or minimal glyph.
3. **Location identification needs to LAND on the platform.** Brand system already specifies city stamps (§4.3), formal entity lockup with subtitle (§4.4), location sub-marks stacked (§4.5), deck cover applications, and email signature treatment — *none* currently used on the platform Header. Anton wants them deployed.

## ★ Chat-40 scope — brand v1.2 design (brainstorm → spec)

Skill sequence: **`superpowers:brainstorming`** for the design exploration → spec-writer for `brand.md §12` v1.2 section. Same brainstorm → spec → impl flow as chat-36/37/38.

**Five sub-questions Anton needs to lock during chat-40:**

| ID | Question | Options surfaced in chat-39 |
|---|---|---|
| Q1 | **Mark direction** (replaces PL) | (a) **PSA monogram** — P+S+A interlocked; acronym-identity heritage; risk = PSA is overloaded ("Public Service Announcement" / "Power of Sale Agreement" / etc.) so visual context must carry meaning. (b) **Money/growth glyph** — upward arrow, sprout, line-trending-up, custom minimal glyph; risk = cliché in venture aesthetic. (c) **Hybrid** — PSA monogram with embedded growth element (arrow inside the P, etc.). |
| Q2 | **Trailing glyph** (replaces `*`) | (a) Same as mark — visual unity, one symbol used standalone + as wordmark qualifier. (b) Distinct — mark = identity, trailing = expressive accent. **Semantic warning:** `*` currently reads as footnote pointer matching the "sub**PLOT**ers" word — the new glyph either preserves narrative subtlety (subplot reference) OR trades it for venture-growth signaling. Make the trade-off explicit; don't drift. |
| Q3 | **Location identification — platform placement** | (a) Header chip right of wordmark (`Subploters[GLYPH]  PSA · WARSAW`). (b) Footer chip. (c) About page full formal lockup with `POLISH STOWARZYSZENIE · FOUNDED 2024 · WARSAW` subtitle. (d) All three (recommended — different surfaces serve different roles). |
| Q4 | **Mark proportions** | Same -3° rotation as v1.1? Same amber `#f59e0b`? Same role (favicon + standalone + PWA icons + apple-touch-icon)? Path-drawn (font-independent — chat-38 lesson) or font-loadable? |
| Q5 | **Brand version bump** | (a) **v1.2 incremental** (mark + trailing glyph + location wire-in) — recommended. (b) v2 broader (also pulls in the Fraunces → Geist platform-side swap from chat-38 §2). Default to v1.2; Fraunces stays a separate platform revision. |

## ★ Locked (do NOT change in chat-40)

- Master wordmark "Subploters" typographic form — Geist SemiBold path-drawn, ink color, current letter geometry.
- Tagline `Every venture is a subplot.` (Anton confirmed locked, chat-39 2026-05-25).
- Typography rules — Geist + Inter + JetBrains Mono per `brand.md §2`.
- Color palette — amber `#f59e0b` / cream `#fef6e6` / ink `#1a1a2e` / dust `#886c37`.
- City stamp visual treatment — -1.5° rotation, JetBrains Mono caps, amber field per `§4.3`.
- Naming architecture — Subploters (brand wordmark) / Professional Subploters Association (formal entity) / PSA (insider). Domain `subploters.com` maps to primary brand. Three names for one organization is intentional layering (parallel to Anthropic/Claude/claude.ai), NOT a conflict.
- ADR-0001 OSS-first; CC0 brand asset license.

## ★ Read order for chat-40 (lazy)

1. **This handoff** — current document.
2. **`community/brand/brand.md`** — full v1.1 system; chat-40 likely writes §12.
3. **`community/brand/explorations/{chat-36-archive,chat-37,chat-38}/`** — prior design exploration archives. **Do NOT relitigate decided directions** — chat-37 README especially documents anti-patterns from 14 rejected candidates across 5 rounds.
4. **`~/.gstack/projects/warsaw-ai-comunity/designs/subploters-brand-system-20260523/`** — gstack-rendered brand system from chat-36 (4 HTML comparison pages + screenshots). Anton's chat-39 screenshots came from these.
5. **`projects/community-platform/app/components/Header.tsx`** — future wire-in surface; context only for chat-40 (code work is chat-41+ scope).

## ★ What NOT to do in chat-40

- Don't change the master wordmark typographic form. Locked v1.1.
- Don't change the tagline. Locked.
- Don't relitigate v1.1 typography rules, color palette, or city stamp visual treatment.
- Don't pre-commit to a specific mark or trailing glyph — this is a brainstorming chat; generate 5-10 candidates per Q1/Q2, comparison-board them, Anton picks.
- Don't wire anything into the platform yet (chat-41+ scope). Brand v1.2 design freezes in `community/brand/` first, then wire-in is its own chat.
- Don't run `pnpm build` while a dev server is running (use `pnpm tsc --noEmit`).

## ★ Backlog (NOT chat-40 scope)

- **Fraunces → Geist v0.7 platform revision** (chat-38 §2) — `app/layout.tsx` still loads Fraunces; v0.6 hero design uses Fraunces italic for emphasis; Geist has no true italic. Needs separate brainstorm before code. Park for chat-41+ or parallel chat.
- **`COMMUNITY_NAME` env decoupling refactor** (chat-39 surfaced) — split wordmark vs entity slots in `lib/env.ts`. ~1-2 hours code work. STATE.md `v1_1_brand_env_flip` row captures the tension. Park for after brand v1.2 locks.
- **Platform wire-in of v1.2 brand** — Header (location stamp), favicon + PWA + apple-touch icons (new mark), /about (formal lockup component). Chat-41+ after design locks.
- **Different sub-project entirely** — gbrain phased rollout, persona-builder personas, W.A.Y. extraction continuation. Available if Anton pivots.

## ★ Paste-ready prompt for chat-40

```
Start chat-40 — Subploters brand v1.2 design (mark + trailing glyph + location).

Skill: superpowers:brainstorming (design exploration) → spec-writer for brand.md §12.

Read order:
1. docs/specs/2026-05-25-subploters-brand-followups-handoff.md (this handoff)
2. community/brand/brand.md (full read — chat-40 likely writes §12)
3. community/brand/explorations/{chat-36-archive,chat-37,chat-38}/ — prior archives (don't relitigate)
4. ~/.gstack/projects/warsaw-ai-comunity/designs/subploters-brand-system-20260523/ — chat-36 brand system HTMLs

Lock during this chat (5 sub-questions, see handoff Q1-Q5):
  Q1 mark direction (PSA monogram / money-growth glyph / hybrid)
  Q2 trailing glyph (same as mark OR distinct; semantic trade-off — narrative vs trajectory)
  Q3 location identification placement (Header / Footer / About / all three)
  Q4 mark proportions (rotation / color / role / path-drawn?)
  Q5 brand version (v1.2 incremental recommended)

Locked (don't touch): master wordmark Geist typographic form, tagline ("Every venture is a subplot."), v1.1 typography rules, color palette, city stamp visual treatment, naming architecture, ADR-0001 OSS-first.

Output: SVG assets in community/brand/assets/ for new mark + (if asterisk replacement requires) new wordmark variants; brand.md §12 v1.2 lock; updated gstack comparison HTMLs if Anton wants regen.

Wire-in to platform is chat-41+ scope (separate handoff after brand v1.2 locks).
```

---

*Drafted 2026-05-25 in chat-39 after Anton's mid-chat pivot from env closeout to brand v1.2 design. Prior chat-40 handoff (env-decouple / Fraunces / different-sub-project menu) at this same path was superseded by this content.*
