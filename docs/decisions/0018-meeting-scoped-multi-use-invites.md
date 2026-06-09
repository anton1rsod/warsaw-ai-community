# ADR-0018: Meeting-scoped multi-use invites

**Status:** Proposed
**Date:** 2026-06-09
**Deciders:** Anton Safronov (founder)
**Related:**
- [`projects/community-platform/spec.md`](../../projects/community-platform/spec.md) §21 (v0.11.0 — meeting signup)
- [`docs/specs/2026-06-09-community-platform-meeting-signup-design.md`](../specs/2026-06-09-community-platform-meeting-signup-design.md) (full design + 2026 best-practices validation; decisions D1–D6)
- [`docs/specs/2026-06-09-community-platform-meeting-signup-persona-handoff.md`](../specs/2026-06-09-community-platform-meeting-signup-persona-handoff.md) (brainstorm input)
- [ADR-0001](./0001-oss-first-licensing.md) (OSS-first; underpins the git-history audit posture for the redemption ledger)
- [ADR-0012](./0012-community-platform-v0-3-discovery-posture.md) (public discovery surfaces — the `/welcome` landing extends `PUBLIC_PATHS`)

## Context

Membership is **invitation-only**. Single invites work end-to-end (`/onboard?token=…` → GitHub OAuth → atomic roster commit), but they are **single-use, one-at-a-time bearer tokens** — `lib/invitations.ts` mints exactly one URL per admin click and the `jti` is burned in the ledger on first redemption. There is **no batch and no multi-use anywhere** in the codebase.

Thursday's meetup (2026-06-11) needs **a room of attendees to join on the spot**. Distributing N single-use URLs to a room is operationally hostile; the natural artifact is **one QR on the projector that everyone scans**. That requires invites that accept **many redemptions**.

A second, harder constraint surfaced in recon: membership recognition reads the **build-time content snapshot** (`content-snapshot.json`), regenerated only by a Vercel build, not by `revalidatePath`. The proxy gates non-public routes membership-first (`/no-access` before `/consent`), so a just-redeemed member — not yet in the snapshot — currently lands on **`/no-access`** until the next rebuild (~1–2 min). A room-signup feature that dumps new members on `/no-access` reads as rejection; the membership policy decision is therefore coupled to a first-use UX decision.

The decision space: **what cardinality and what membership posture do at-meeting invites carry?** Three options were considered.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A. Meeting-scoped multi-use token** *(chosen)* | One projected QR; everyone scans the same code. Stays **invite-gated** (admin-issued) → no membership-model change. Bounded, testable redemption-path change (one `kind` branch). Industry-standard shape (Slack/Discord multi-use links with expiry + revocation + cap). | Touches the security-sensitive redemption path. A leaked link admits randos until expiry (mitigated: short expiry + revocation + soft cap + OAuth). Multi-redemption audit shape (N rows per `jti`). |
| B. Batch of single-use QR codes | Leaves the crypto/redemption path untouched (lowest code risk). | Clunky room UX — a grid of QRs, collisions show "already used, scan another." Same concurrency contention on the shared files. Distribution of N distinct codes to a room is awkward. |
| C. Open self-signup (no invite) | Best long-term IF the community wants open membership. | **Changes the membership model** → needs anti-abuse design (the proxy/onboard gates removed, a new auto-roster path). Reversibility cost. Not a 2-day decision. |

Option B was rejected on UX for equal concurrency cost. Option C was **deferred, not rejected** — it is a deliberate membership-model change that warrants its own brainstorm and ADR; it must not be back-doored through a meeting-signup rush.

## Decision

**Adopt Option A: meeting-scoped multi-use invites.**

- Extend the invite payload with optional `kind: "single" | "meeting"` — **absent ⇒ `single`**, so existing tokens and the single-use path are untouched. `meeting` tokens carry a short `exp` and a soft `max_uses`.
- `meeting` redemption is **multi-use** (skip the single-use `jtiHasFinalRow` rejection) but bounded by **three guards**: (a) **revocation** — an admin-appended `revoked` ledger row rejects all further redemptions (revocation beats multi-use); (b) **soft `max_uses` cap** — best-effort count of `redeemed` rows for the `jti`; (c) **short expiry** — the primary bound, default ~3–4h, admin-set, clamped.
- **Expiry, not a strict count, is the primary bound.** Counting under the optimistic-concurrency redemption path is racy; the cap is defense-in-depth, not a security boundary. The security boundaries are: HMAC-signed token (unforgeable), short expiry, revocation, and **GitHub-OAuth** (each redemption needs a distinct real GitHub account — the primary abuse deterrent).
- **First-use:** redemption sets the `waic-consented` cookie and redirects to a **public `/welcome`** page (not gated `/this-week`), so new members never hit the `/no-access` snapshot-lag bounce.
- **This stays invite-gated.** Open self-signup remains a separate, unscheduled decision (a future ADR).

## Consequences

**Easier:**

- A room joins from one projected QR in seconds each — the meetup signup moment works.
- No membership-model change: the community stays admin-gated; the audit trail (git log + bot identity + ledger rows) is unchanged in shape, just multi-row per meeting `jti`.
- Fixes a pre-existing wart: single invitees also stop hitting `/no-access` immediately post-redeem (welcome-redirect benefits both kinds).
- Invite control reaches industry parity (Slack/Discord): expiry + revocation + cap.

**Harder:**

- A leaked meeting link admits unwanted GitHub accounts until expiry. **Mitigations:** short default expiry; admin **revoke**; soft cap; OAuth (no trivial account farming); roster entries are removable via git. Rate-limiting (Vercel BotID / WAF) is a documented fast-follow if abuse is observed.
- The redemption path gains a `kind` branch + multi-row ledger semantics — a slightly larger security surface, covered by hardenings H123–H137 and a security review.
- Concurrency: a room redeeming in one window contends on the shared roster/aliases/ledger files (optimistic CAS). Mitigated by exponential backoff + full jitter + capped retries; the honest ceiling is O(N²) work under a synchronized spike, so a "everyone scan *now*" burst of 20+ should be staggered.
- First-use is eventually-consistent: gated surfaces (`/members`, `/this-week`) unlock for a new member only after the rebuild (~1–2 min); writes (post status, RSVP) lag likewise. Accepted for v0.11.0; the instant-access "fresh-member bridge" cookie is a v0.11.1 fast-follow.

## Implementation

Implementing via **v0.11.0** (spec §21; design doc §5):

- `lib/invitations.ts` — `kind` discriminator (default `single`); meeting redemption guard (revoked + soft cap + live duplicate-handle); exponential-backoff-full-jitter CAS retry.
- New admin mint action (re-checks `isAdmin` server-side, H134) + revoke action (appends `revoked` row).
- `/admin/invite` — "Mint meeting invite" panel (expiry + cap) → server-rendered PNG-data-URI QR (`<img>`) of the full canonical URL (no shortener) + inline Revoke for the minted invite (a persistent cross-session registry is deferred to v0.11.1).
- `app/actions/redeem-invitation.ts` — set `waic-consented` cookie; redirect to `/welcome`.
- New public `app/welcome/page.tsx` + `PUBLIC_PATHS` entry in `proxy.ts`.
- Hardenings H123–H137 (spec §21) → 1:1 test blocks (`describe("H<n>:")`).
- Defense-in-depth: the proxy is treated as an optimization, not the security boundary (Next.js middleware-bypass class CVE-2025-29927, patched in 16.2.6); `mint` / `revoke` / `redeem` actions re-verify auth independently; the new public `/welcome` route carries no member-only data.

No changes to authentication, the GitHub App scopes, or the membership model. No new env vars (a QR-rendering dependency, MIT, is added).

### Supersedes / amends

None as a forward decision. Does **not** amend the invite-gated membership posture — it extends invite *cardinality* only.

### Change control

Revisit when **any** of the following is observed:

- **A leaked meeting link is abused** (spam roster entries traced to a single shared link). Trigger: ship the documented Vercel BotID / WAF rate-limit fast-follow; if persistent, add a strict server-side redemption counter or per-IP limit.
- **Demand for open membership** (members ask to drop the invite gate) — trigger a separate brainstorm + ADR for open self-signup (Option C), which this ADR explicitly left unscheduled.
- **Synchronized-spike contention causes redemption failures at a meetup** — trigger the durable-write redesign (queue or per-member-only commit) flagged in the design doc §5.5.

This ADR flips **Proposed → Accepted on v0.11.0 merge** (per the ADR-0015 precedent of a build decision recorded at spec time). **Reverting** (back to single-use-only) means disabling the meeting-mint surface — reversible in code; the `kind`-absent default means existing single-use invites keep working untouched.
