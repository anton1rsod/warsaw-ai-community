# Chat-38 → chat-39 handoff: Subploters brand v1.1 wired into community-platform — follow-ups

**Date:** 2026-05-23 · **From:** chat-38 (Path A lockup + platform wire-in shipped) · **To:** chat-39 (follow-ups)

PROTOCOL: `projects/community-platform/HANDOFF_PROTOCOL.md` (loaded once when entering platform scope)

## ★ Setup

Branch off `origin/main`. Latest commits:

- `e46428d` — `feat(community-platform): wire Subploters v1.1 brand into platform UI`
- `1d98ee9` — `docs(brand): chat-38 Subploters brand v1.1 — Path A inline-fused lockup locked`

Both deployed cleanly to Vercel (`● Ready` on `warsaw-ai-community-platform` + `warsaw_ai_community_gbrain`). Production smoke: `https://warsaw-ai-community-platform.vercel.app/` returns `<title>Subploters</title>`, the dark-mode lockup SVG, the new favicon, and no remaining "Warsaw AI" copy in user-facing text controlled by code.

## ★ State after chat-38

| Layer | State |
|---|---|
| Brand mark | **LOCKED** at v1.1 (Path A inline-fused lockup) — `brand.md §3` |
| Master lockup | `community/brand/assets/subploters-lockup.svg` (ink letters) + `subploters-lockup-dark.svg` (cream letters) |
| Standalone mark | `community/brand/assets/subploters-mark.svg` + 5 PNG exports |
| Build pipeline | `community/brand/scripts/build-lockup.js` (committed); deps in gitignored `.scratch/` |
| Platform wire-in | Header uses dark-mode lockup; favicon + apple-touch + PWA icons replaced; manifest + layout metadata + i18n strings flipped to "Subploters"; 1191/1191 tests green |
| Process archive | `community/brand/explorations/chat-38/README.md` documents the decision path, visual iteration, technical approach |

## ★ Two deferred items (from chat-38 closeout)

### 1. Vercel env: flip `COMMUNITY_NAME` to "Subploters"

**Status:** Anton-side, not in any commit yet.

**What:** `app/login/page.tsx` and `app/no-access/page.tsx` both render `{env.COMMUNITY_NAME}` directly. The code path is correct (env-routed); the env var itself is still set to "Warsaw AI Community" on Vercel.

**How:**

```bash
# Confirm current value
vercel env ls production
# Expect a line: COMMUNITY_NAME ... Encrypted ... Production

# Pull, edit, push (chat-38 verified Vercel CLI works; previous prod env mutation pattern preserved)
vercel env rm COMMUNITY_NAME production  # interactive confirm
vercel env add COMMUNITY_NAME production
# When prompted, paste: Subploters
```

Per `feedback_vercel_prod_mutations` memory: the harness gates `vercel env rm/add production`. Hand the exact two commands to Anton terminal-side, verify via read-only `env pull` after.

**Effort:** 1-2 minutes once Anton is on the Vercel dashboard or has CLI access. No PR, no test changes needed (env value is just a default, not a tested string).

### 2. Fraunces → Geist font swap (v0.7 brand revision)

**Status:** Documented in `brand.md §2` as "Fraunces italic is **dropped** as of 2026-05-23 (v0.7 brand revision)". Code still loads Fraunces in `app/layout.tsx`.

**What changes:**

- `app/layout.tsx` — remove `Fraunces` import + font config; remove `--font-fraunces` CSS variable.
- `app/globals.css` / Tailwind config — anywhere `font-display` resolves to Fraunces (italic), point it at Geist 600/700 instead.
- Component classes — any explicit `italic` or `font-display italic` that was visually depending on Fraunces needs review (Geist doesn't have a true italic; it has roman + Italic variants but the v0.6 Fraunces italic was the entire point).
- Tests — snapshot tests that match `font-fraunces` className will break; update.
- Component design — anywhere v0.6 used Fraunces italic for emphasis (hero headline, About copy, taglines), pick the v0.7 replacement (probably Geist 700 + amber tag, or Geist italic, or some other treatment).

**Effort:** Medium-large. This is design + implementation work. Brand spec says "dropped" but doesn't prescribe the replacement vibe. Recommended to **brainstorm the v0.7 hero/display treatment FIRST** before code changes — what does "Subploters ships in public." look like without Fraunces italic?

**Read for chat-39:**

- `projects/community-platform/spec.md §16` (v0.6 visual identity, the Fraunces-italic treatment)
- `community/brand/brand.md §2` (current typography rules)
- `app/components/AnonymousHero.tsx` (the v0.6 Fraunces hero — biggest visual surface affected)
- `app/components/Header.tsx` + `Footer.tsx` (also use `font-display`; might be Geist-compatible already)

## ★ Recommended chat-39 scope (pick one)

### Option A — Lightweight closeout (Recommended if Anton wants to move on from brand for now)

1. Anton flips Vercel `COMMUNITY_NAME` env var (1-2 min).
2. Verify the prod /login + /no-access pages now say "Subploters".
3. Commit a small STATE.md update in community-platform noting the v1.1 brand wire-in.
4. Done. Defer Fraunces → Geist to a dedicated chat-40 (or whenever the v0.7 design feels right).

**Effort:** 15-30 min. No code changes besides STATE.md.

### Option B — v0.7 brand revision (full Fraunces → Geist + display treatment update)

1. Brainstorm with the user: what replaces Fraunces italic in the hero / AnonymousHero / About copy?
2. Spec out the v0.7 typography (might want amber tag emphasis, weight contrast, mono accent — TBD).
3. Implement: font config swap, classname updates, snapshot test updates, component visual review.
4. Verify visually (visual companion or browser smoke).
5. Commit + push.

**Effort:** Multi-hour to multi-chat. Brainstorming → spec → implementation cycle per `projects/community-platform/CLAUDE.md` discipline.

### Option C — Different sub-project entirely

Memory contains many open tracks (gbrain phased rollout, community-platform v0.7 feature work, persona-builder personas, W.A.Y. extraction). If Anton has a different priority, skip both A and B.

## ★ Read order for chat-39 (lazy; only what your task needs)

1. **This handoff** — current document.
2. **`community/brand/brand.md` §3 + §10** — confirm v1.1 lock, see version history.
3. **`community/brand/explorations/chat-38/README.md`** — full chat-38 process documentation (cross-refs everything).
4. **`projects/community-platform/STATE.md`** if entering platform scope — read first per `projects/community-platform/CLAUDE.md`.
5. **The deferred item docs above** — only the one you're picking up.

Don't pre-read source. Read on-demand.

## ★ What NOT to do in chat-39

- Don't relitigate the brand mark. v1.1 is locked across `brand.md §3` + `community/brand/explorations/chat-38/README.md`. Anti-patterns documented in both.
- Don't run `pnpm build` in the platform while a dev server is running (use `pnpm tsc --noEmit` per `projects/community-platform/CLAUDE.md`).
- Don't update STATE.md mid-chat unless a phase actually closes.
- Don't commit auto-generated content from `lib/__generated__/` unless that's the task.
- Don't push the script's `node_modules` to git (`.scratch/` is gitignored for a reason; 331 MB of deps).
- Don't skip pre-commit hooks (lint-staged runs ESLint --fix; let it run).

## ★ Paste-ready prompt for chat-39

```
Start chat-39 — Subploters brand v1.1 wire-in follow-ups.

Read order:
1. docs/specs/2026-05-23-subploters-brand-wire-in-followups-handoff.md (this handoff)
2. community/brand/brand.md §3 + §10 (v1.1 lock state)
3. community/brand/explorations/chat-38/README.md (full chat-38 process)
4. projects/community-platform/STATE.md if scope touches platform

Two deferred items from chat-38:
  (A) Anton-side: flip Vercel env COMMUNITY_NAME from "Warsaw AI Community" → "Subploters"
  (B) Fraunces → Geist font swap (v0.7 brand revision per brand.md §2)

Pick (A) lightweight closeout, OR (B) v0.7 brand revision (full brainstorm → spec → implementation), OR a different sub-project entirely.

Do NOT relitigate brand v1.1. Do NOT re-explore mark candidates. The lockup is locked.
```

---

*Drafted 2026-05-23 in chat-38 by Claude Code after the Path A wire-in landed on main. Both `1d98ee9` and `e46428d` deployed cleanly to Vercel; prod smoke confirms the brand is live.*
