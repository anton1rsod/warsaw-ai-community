# Handoff — Community Platform v0.11.0: meeting signup (IMPLEMENTATION)

**Date:** 2026-06-09 (Tue) · **For:** the next chat — **execute the plan via `superpowers:subagent-driven-development`**.
**Hard deadline:** Thursday **2026-06-11** weekly meetup.

## What's done (this chat: brainstorm → spec → plan, all on `main`)
- **Spec** `projects/community-platform/spec.md §21` (R1–R7, H123–H137) — committed `34f6425`, hardened `48ceb43`, aligned `e0f63a0`.
- **Design** `docs/specs/2026-06-09-community-platform-meeting-signup-design.md` — full design + 2026 best-practices validation (OWASP signed-tokens, AWS backoff+jitter, Slack/Discord invite controls, quishing, CVE-2025-29927 defense-in-depth) + decisions D1–D6.
- **ADR-0018** `docs/decisions/0018-meeting-scoped-multi-use-invites.md` (Proposed → Accepted on merge) + README index row.
- **Plan** `projects/community-platform/v0.11.0-plan.md` (`e0f63a0`) — 6 phases, 18 tasks, TDD, **real code in every step**, O1–O6 locked, self-review done.

## What the next chat does
Execute `v0.11.0-plan.md` via `superpowers:subagent-driven-development`. Per token-discipline + the v0.8/v0.10 precedent: **one Sonnet implementer subagent per PHASE** (not per micro-task), full suite (`pnpm test` + `pnpm tsc --noEmit` + `pnpm lint`) verified at each phase boundary. Phase 6 (E2E + reviewer-triage + PR + merge + tag + STATE flip) is orchestrator-direct.

## Read order (lean)
Root `STATE.md` → `projects/community-platform/` CLAUDE.md read order: `STATE.md` (last-green = v0.10.0.1) → `CONSTRAINTS.md` + `GOTCHAS.md` + `HANDOFF_PROTOCOL.md` (once) → **this handoff** → **`v0.11.0-plan.md`**. Read `spec.md §21` only if a task needs the requirement text; the plan embeds everything. Read directly; don't invoke a resume skill.

## Locked decisions (do not re-litigate — see plan "Open questions locked")
- **O1** H135 = inline-revoke on the mint screen for v0.11.0; persistent active-invite registry → v0.11.1 (ledger records only redeemed/revoked; minted tokens are stateless).
- **O2** redeem redirect `/this-week`→`/welcome` for **both** single + meeting kinds (intentional; fixes the pre-existing single-invite `/no-access` wart). Existing redirect tests are updated by the plan.
- **O3** live dup-handle guard is **meeting-only** (single keeps the snapshot-based action guard — backward-compat).
- **O4** soft cap is best-effort under OCC; revocation + short expiry are the hard bounds.
- **O5** QR = server-side **PNG data-URI `<img>`** (not inline SVG — avoids raw-HTML injection flagged by the write-time security hook; PNG @1024px is crisp for projection).
- **O6** backoff: MAX_ATTEMPTS=6, base 75ms, cap 2000ms, full jitter; injectable `sleep`/`rng`.

## Watch-items (gotchas the plan already accounts for — don't re-discover)
- `appendRevocationRow` + `revoked` ledger semantics **already exist** in `lib/invitations.ts` — revocation is wiring, not new ledger code.
- The redemption orchestrator's retry-loop re-read check must branch on `kind` (meeting: only `jtiIsRevoked` aborts; single: `jtiHasFinalRow`) — in the plan (Task 2.2).
- `app/onboard/page.tsx` needs **no change** (kind-agnostic) — confirm with a quick read during Task 2.1.
- `pnpm test`/`pnpm e2e` run a `contributions` pre-hook that rewrites `lib/__generated__/*` — benign; don't commit those.
- Local Playwright may be browser-profile-locked (GOTCHAS) — if so, document and defer E2E to CI/Anton-side; do NOT mark E2E green without a real run.

## Closeout criteria (Phase 6)
`pnpm tsc --noEmit` 0 · `pnpm lint` 0 · `pnpm test` all green (~1509 + new) · `pnpm exec playwright test e2e/invitation.spec.ts` green (or documented defer) · reviewer triage (`code-review` + `security-reviewer` on redeem/mint/revoke) batched into one commit · PR → CI green → squash-merge → tag `community-platform-v0.11.0` → flip `STATE.md` snapshot + `Last verified` → **orchestrator-side post-merge prod smoke** (mint a meeting invite on prod, redeem as a test handle, confirm `/welcome` + no `/no-access`). The post-merge prod smoke is the standing ship gate (4-for-4).

## Not in scope (documented v0.11.1 fast-follows)
Persona upload/integrate (the original handoff's 2nd goal); Vercel BotID/WAF rate-limit on the redemption path; the signed "fresh-member" bridge cookie for instant gated-surface access; persistent active-invite registry.

## Pickup command (paste into the new chat)
> Open this repo. Follow the read order: root `STATE.md` → `projects/community-platform/STATE.md` → `CONSTRAINTS.md`/`GOTCHAS.md`/`HANDOFF_PROTOCOL.md` (once) → this handoff (`docs/specs/2026-06-09-community-platform-v0-11-0-implementation-handoff.md`) → the plan (`projects/community-platform/v0.11.0-plan.md`). Read directly; don't invoke a resume skill.
>
> **Execute `v0.11.0-plan.md` (meeting signup — multi-use invite QR) via `superpowers:subagent-driven-development`.** One Sonnet implementer subagent per phase; full suite (`pnpm test` + `pnpm tsc --noEmit` + `pnpm lint`) green at each phase boundary; Phase 6 (E2E + reviewer triage + PR + merge + tag `community-platform-v0.11.0` + STATE flip + post-merge prod smoke) orchestrator-direct.
>
> Hard deadline **Thu 2026-06-11** meetup. Decisions O1–O6 are LOCKED (plan "Open questions locked") — don't re-litigate. The plan has real code in every step; follow it task-by-task. Persona upload + rate-limiting + fresh-member bridge are v0.11.1 fast-follows, NOT this ship.
