# Chat handoff: Community Platform v0.11.1 — MERGE (post-retro)

PROTOCOL: `projects/community-platform/HANDOFF_PROTOCOL.md` (loaded once at start)

**Date:** 2026-06-10 · **Supersedes** the implementation handoff (`docs/specs/2026-06-09-community-platform-v0-11-1-implementation-handoff.md`), whose implement task is **DONE**. This chat owns ONLY the gated merge + ship-out.

## Context — done already (2026-06-10)
v0.11.1 (Bundle B — persona attach + rich card) is **fully implemented, reviewed, and PR'd**. See memory [[project_community_platform_v0_11_1_impl]].
- Branch `chore/community-platform-v0-11-1-impl` (18 commits). **PR #55 OPEN as DRAFT**: https://github.com/anton1rsod/warsaw-ai-community/pull/55
- **1582 unit/int tests** + `e2e/persona-attach.spec.ts` 2/2. `lib/persona.ts` + `lib/persona-editor.ts` 100% (strict-list).
- Parallel security (mandatory, H150) + ts + code reviewers: **0 CRITICAL**; 2 HIGH + MEDIUMs fixed + batched (`2d0b5d3`).
- CHANGELOG `[0.11.1]` + the STATE `overall_coverage` strict-list line are already on the branch (marked merge-gated). ADR-0019 is still **Proposed**.

## ★ The merge gate (the whole reason this is a separate chat)
**The 2026-06-12 retro must have happened and decided NOT to let Bundle A preempt Bundle B** (low odds — revocation + short expiry already cover the v0.11.0 critical risk). Confirm that decision with Anton FIRST. If the retro says Bundle A preempts B, do NOT merge — re-scope instead.

## ★ This chat owns — the on-merge sequence (only after the gate clears)
1. Mark PR #55 **Ready for review** (it's a draft), confirm CI is green, then **squash-merge** it.
2. Flip **ADR-0019 → Accepted** (`docs/decisions/0019-persona-attach-consent-and-visibility.md`) — this is an ADR change, so per CONSTRAINTS auto-policy it's an explicit step, not auto.
3. Push tag **`community-platform-v0.11.1`** at the squash-merge SHA.
4. Flip `STATE.md`: `phase` → "v0.11.1 shipped", `tag`/`previous_tag`/`previous_previous_tag`, `tests` (→ 1582 + the persona test delta), `last_green` → merge SHA, and confirm the v0.11.1 strict-list line in `overall_coverage` (already staged on the branch). Update the `Last updated` narrative + root `STATE.md` "Hot now".
5. Run the orchestrator **post-merge prod smoke** (the standing 5-for-5 ship gate) — see protocol/precedent. Persona-specific checks: anon `/members/<a-member-with-a-public-persona>` renders the rich card (chips + languages + body, no XSS); signed-in `/me/edit` shows the PersonaEditor (consent + data-min copy) + the `persona_visible` toggle. A real attach round-trip on prod writes a real `.public.md` via the bot — optional (covered by E2E + integration); if run, use the orchestrator's own session/slug.
6. Update memory [[project_community_platform_v0_11_1_impl]] → SHIPPED; write the next handoff (next scope: the v0.11.2 fast-follows — see below).

## ★ Verify-before-claiming
- ADR-0019 filename/number: `grep -n "Status" docs/decisions/0019-*.md` before flipping.
- Tag target = the squash-merge commit SHA (not the branch tip).

## ★ Anti-patterns
- Don't merge before confirming the retro decision.
- Don't re-run the whole implementation review — it's done (0 CRITICAL). Only re-check CI green + a fast diff sanity-read before merge.
- Don't fix the persona-builder slug-convention mismatch here (out of scope — it's a data-alignment follow-up; see memory).

## Deferred to v0.11.2+ (for the post-ship next handoff)
Per-IP rate-limit (Vercel BotID/WAF) on the redemption path · signed "fresh-member" bridge cookie · persistent active-invite registry · meeting-token `iat` · revoke auto-retry-under-contention · persona-builder→roster slug alignment · i18n the PersonaEditor status strings (matches the ProfileEditor hardcode precedent today) · `vitest` devDep bump (dev-only CVE).

## ★ Paste-ready prompt
> Open the Warsaw AI Community repo. Read order: root `STATE.md` → `projects/community-platform/STATE.md` → this handoff (`docs/specs/2026-06-10-community-platform-v0-11-1-merge-handoff.md`). Read directly; don't invoke a resume skill. v0.11.1 (persona attach + rich card) is implemented + reviewed (0 CRITICAL) on PR #55 (draft). **First confirm the 2026-06-12 retro decided NOT to let Bundle A preempt Bundle B.** Then: mark PR #55 ready, confirm CI green, squash-merge; flip ADR-0019 → Accepted; push tag `community-platform-v0.11.1`; flip STATE.md (phase/tag/tests=1582/strict-list); run the orchestrator 5-for-5 prod smoke (incl. a persona rich card on `/members/<slug>` + the `/me/edit` PersonaEditor); update memory + write the v0.11.2 scoping handoff.
