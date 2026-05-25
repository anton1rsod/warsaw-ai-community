# Chat-39 → chat-40 handoff: Subploters brand follow-ups (after env closeout)

**Date:** 2026-05-25 · **From:** chat-39 (Option A lightweight closeout — env flip shipped) · **To:** chat-40 (next scope, picked at start)

PROTOCOL: `projects/community-platform/HANDOFF_PROTOCOL.md` (loaded once when entering platform scope)

## ★ Setup

Branch off `origin/main`. Latest commits:

- `4f91b40` — `docs(community-platform): chat-39 STATE — COMMUNITY_NAME flipped to "Professional Subploters Association"`
- `e8de7fd` — `docs(brand): chat-38 closeout — process archive + chat-39 handoff + build script committed`
- `e46428d` — `feat(community-platform): wire Subploters v1.1 brand into platform UI`

Production deploy `qu1om6wpf` Ready; prod HTTP smoke confirms `/login` h1 renders `Professional Subploters Association` (and `/no-access` body transitively, since both pages interpolate the same env var via the same module).

## ★ State after chat-39

`COMMUNITY_NAME` on Vercel production + preview now reads `Professional Subploters Association` (no asterisk literal). See STATE.md `v1_1_brand_env_flip` row for the full verification chain (read-only `vercel env pull` byte-check on both scopes, prod HTTP smoke, redeploy SHA).

**Chat-38 deferred items status:**

| Item | State |
|---|---|
| §1 Vercel `COMMUNITY_NAME` env flip | **CLOSED** (chat-39) |
| §2 Fraunces → Geist v0.7 brand revision | **PENDING** (chat-40 candidate) |

**New tension surfaced by chat-39 (also a chat-40 candidate):**

`COMMUNITY_NAME` is structurally one env var driving two semantic slots — the brand wordmark slot (`/login` h1, where short "Subploters" per `brand.md §1` fits) and the org-roster slot (`/no-access` body "Your GitHub account isn't on the {COMMUNITY_NAME} roster yet", where the formal entity name reads cleanly because plain "Subploters roster" is redundant since *Subploters = the people*). Anton picked the formal entity name for both as the lower-friction compromise. Cleaner fix: decouple into `BRAND_WORDMARK` + `LEGAL_ENTITY_NAME` env vars (or hardcode the wordmark in JSX and keep `COMMUNITY_NAME` for the org-roster slot only).

## ★ Recommended chat-40 scope (pick one)

### Option A — Fraunces → Geist v0.7 brand revision (Recommended)

Per `community/brand/brand.md §2`, Fraunces is **dropped** as of 2026-05-23 but `app/layout.tsx` still loads it and v0.6 hero design uses Fraunces *italic* for emphasis. Geist has no true italic, so the visual treatment needs re-design (amber tag? weight contrast? mono accent?). **Brainstorm BEFORE code.** Brainstorm → spec → impl → review.

**Effort:** Multi-hour to multi-chat.

### Option B — `COMMUNITY_NAME` env decoupling

Single-chat refactor: introduce a `BRAND_WORDMARK` env var (or hardcode "Subploters" in JSX) for the wordmark slot, leave `COMMUNITY_NAME` for `/no-access`. Tests + STATE row + closeout. Could chain with the env-pull verification pattern from chat-39.

**Effort:** ~1-2 hours.

### Option C — Different sub-project

GBrain phased rollout, persona-builder personas, W.A.Y. extraction continuation, or any other open track from MEMORY.md.

## ★ Read order for chat-40 (lazy)

1. **This handoff** — current document.
2. **`projects/community-platform/STATE.md`** — entry point per platform CLAUDE.md.
3. **For Option A:** `community/brand/brand.md §2`; `projects/community-platform/app/layout.tsx` (Fraunces import); `app/components/AnonymousHero.tsx` (biggest visual surface affected); `projects/community-platform/spec.md §16` (v0.6 visual identity).
4. **For Option B:** `projects/community-platform/lib/env.ts` (Zod schema); `app/login/page.tsx` + `app/no-access/page.tsx` (current env interpolation sites); STATE.md `community_vars_no_sensitive` + `v1_1_brand_env_flip` rows.

## ★ What NOT to do in chat-40

- Don't relitigate brand v1.1. v1.1 is locked across `brand.md §3` + `explorations/chat-38/README.md`.
- Don't re-flip `COMMUNITY_NAME` env var unless the value itself is changing (chat-39's pick is durable).
- Don't update STATE.md mid-chat unless a phase actually closes.
- Don't commit auto-generated content from `lib/__generated__/` (chat-38 anti-pattern carries forward).
- Don't run `pnpm build` while a dev server is running (use `pnpm tsc --noEmit`).

## ★ Paste-ready prompt for chat-40

```
Start chat-40 — Subploters brand follow-ups after chat-39 env closeout.

Read order:
1. docs/specs/2026-05-25-subploters-brand-followups-handoff.md (this handoff)
2. projects/community-platform/STATE.md
3. brand.md §2 + spec §16 (Option A) OR lib/env.ts + login/no-access pages (Option B)

Chat-38 / chat-39 deferred items remaining:
  (A) Fraunces → Geist v0.7 brand revision — bigger; needs brainstorm before code
  (B) COMMUNITY_NAME env decoupling — smaller; lib/env.ts + JSX refactor
  (C) Different sub-project (gbrain / persona-builder / W.A.Y. / other)

Pick A, B, or C. v0.7 brand revision (A) is the canonical next chunk.

Do NOT relitigate brand v1.1 mark / lockup. Do NOT re-flip the env var.
```

---

*Drafted 2026-05-25 in chat-39 after the env flip landed cleanly and prod smoke confirmed `/login` renders the new value within the first 5s poll window post-push.*
