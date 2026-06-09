# Handoff — Community Platform v0.11.1 (scope TBD via brainstorm)

PROTOCOL: `projects/community-platform/HANDOFF_PROTOCOL.md` (loaded once at start)

**Date:** 2026-06-09 · **Predecessor:** v0.11.0 meeting signup **SHIPPED** (`2c79e90`, tag `community-platform-v0.11.0`, ADR-0018 Accepted, prod-verified).

## Timeline pinned (2026-06-09) — retro deferred to post-meetup; this chat only scheduled it
We are **pre-meetup** (today 2026-06-09 Tue; meetup Thu **2026-06-11**). Anton's calls:
- **QR minting → Thu 2026-06-11 19:30 Europe/Warsaw**, at `/admin/invite` → "Mint meeting QR" (works on phone). Deferred to meeting-time on purpose: the H127 ~4h expiry clamp would kill an early mint before Thursday. Default ~4h covers to ~23:30; bump `expiry_hours` (max 24h) at mint time if the evening runs late.
- **Retro → Fri 2026-06-12** (after the meetup). The retro re-ranks Bundle A vs B, so **scope / `superpowers:brainstorming` does NOT start until then.** The 2026-06-09 chat did not brainstorm — it only set up this deferral.
- **Two notify-only cloud reminders scheduled** (one-time, MCP-connectors stripped): `trig_01767t2XLP1RQQ4Q5mTnqGjb` (Thu 19:30 Warsaw — mint QR) + `trig_01VcZ2jgMZvQFNSKapg3FuhB` (Fri 10:00 Warsaw — retro + brainstorm). Manage/delete at https://claude.ai/code/routines.

## Context — what just shipped
v0.11.0 multi-use "meeting" invite QR is live + prod-smoke-verified (signed-in `/admin/invite` renders the meeting panel with no RSC-serialization 500; mint + revoke round-trip on prod). 1543 unit/int + 8/8 invitation E2E. Full detail: `projects/community-platform/STATE.md` + CHANGELOG `[0.11.0]` + `docs/decisions/0018-meeting-scoped-multi-use-invites.md`. **The Thu 2026-06-11 meetup is the feature's first real-world use.**

## ★ This chat owns
**Lock v0.11.1 scope via `superpowers:brainstorming`, then spec → plan → implement.** Nothing below is specced — do NOT jump to code (HANDOFF_PROTOCOL §8 + [[feedback_dont_skip_brainstorming]]).

**Step 0 (before brainstorming): post-meetup retro of meeting-signup.** Ask Anton: did the projected QR scan cleanly in the room? Did any attendee hit `/no-access`? Any sign the URL leaked / unexpected redemptions / soft-cap overshoot? The answers re-rank the backlog.

## v0.11.1 candidate backlog (the v0.11.0 deferral list) — two coherent bundles
- **Bundle A — meeting-path hardening:** per-IP rate-limit (Vercel BotID/WAF) on the redemption path · signed "fresh-member" bridge cookie (kills the ~1–2 min `/no-access` lag even past `/welcome`) · persistent active-invite registry (O1 — v0.11.0 only has inline-revoke on the mint screen) · meeting-token `iat` (accurate ledger `Issued At`, currently empty) · revoke auto-retry-under-contention.
- **Bundle B — persona upload/integration:** the original 2nd goal of the v0.11 brainstorm. Brainstorm input: `docs/specs/2026-06-09-community-platform-meeting-signup-persona-handoff.md`.
- **Trivial (fold into whichever ships first):** `vitest` devDependency CVE bump (dev-only, no prod-runtime impact).

**Recommendation:** if Step-0 retro surfaces leak/abuse/`/no-access`-lag pain → **Bundle A** first (revocation + short expiry already cover the *critical* risk, so this is robustness, not a P0). Otherwise → **Bundle B** (persona integration — the more valuable member-facing feature). State the recommendation with reasoning; let Anton pick. Do NOT bundle A+B into one release.

## Read in order (lean)
Root `STATE.md` → `projects/community-platform/STATE.md` (last-green `2c79e90`) → `CONSTRAINTS.md`/`GOTCHAS.md`/`HANDOFF_PROTOCOL.md` (once) → this handoff → then per bundle: **B** = the persona-handoff doc above; **A** = `spec.md §21` + ADR-0018 + `lib/invitations.ts`.

## ★ Verify-before-claiming queries (Bundle A)
- `appendRevocationRow` / `jtiIsRevoked` / `jtiRedemptionCount` / the `kind`-branch guard + full-jitter retry loop all live in `lib/invitations.ts` (v0.11.0). Mint/revoke actions: `app/actions/{mint-meeting-invitation,revoke-invitation}.ts`.
- A persistent active-invite registry needs **new minted-token tracking** — the ledger records only `redeemed`/`revoked`; minted tokens are stateless (O1).

## ★ Done means
Brainstorm output → spec (`§22`, or amend `§21`) → `v0.11.1-plan.md` → implement via `superpowers:subagent-driven-development` (one implementer/phase) → reviewer triage batched → PR → CI green → squash-merge → tag `community-platform-v0.11.1` → STATE flip → **orchestrator post-merge prod smoke** (the standing 5-for-5 ship gate) → memory + next handoff.

## ★ Anti-patterns
- Don't re-litigate v0.11.0's O1–O6 or ADR-0018 (Accepted).
- Don't skip brainstorming even though candidates are pre-listed ([[feedback_dont_skip_brainstorming]]).
- Don't ship A+B together — one coherent scope per release.

## ★ Paste-ready prompt
> Open the Warsaw AI Community repo. Follow the read order: root `STATE.md` → `projects/community-platform/STATE.md` → `CONSTRAINTS.md`/`GOTCHAS.md`/`HANDOFF_PROTOCOL.md` (once) → this handoff (`docs/specs/2026-06-09-community-platform-v0-11-1-handoff.md`). Read directly; don't invoke a resume skill.
>
> v0.11.0 meeting signup is SHIPPED (`2c79e90`, tag `community-platform-v0.11.0`, prod-verified). This chat scopes **v0.11.1**. First run a quick **post-meetup retro** of the meeting-signup feature with me (did the projected QR scan in the room? any attendee hit `/no-access`? any sign the URL leaked or got abused?). Then **brainstorm v0.11.1 scope via `superpowers:brainstorming`** and recommend (with reasoning) between **Bundle A — meeting-path hardening** (per-IP rate-limit + fresh-member bridge cookie + active-invite registry + meeting-token `iat` + revoke auto-retry) and **Bundle B — persona upload/integration** (the original 2nd goal; read `docs/specs/2026-06-09-community-platform-meeting-signup-persona-handoff.md`). Don't skip brainstorming, don't jump to code, don't re-litigate v0.11.0's O1–O6/ADR-0018, and don't bundle A+B into one release. After scope is locked: spec → `v0.11.1-plan.md` → implement via `superpowers:subagent-driven-development`.
