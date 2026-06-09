# Design — Community Platform v0.11.0: Meeting signup (multi-use invite QR)

**Date:** 2026-06-09 (Tue) · **Chat:** community-platform meeting-signup brainstorm
**Status:** Design approved (Anton, 2026-06-09) — pending spec review → writing-plans
**Hard deadline:** Thursday **2026-06-11** weekly meetup
**Brainstorm input:** `docs/specs/2026-06-09-community-platform-meeting-signup-persona-handoff.md`
**Canonical spec section:** `projects/community-platform/spec.md §21`
**ADR:** `docs/decisions/0018-meeting-scoped-multi-use-invites.md` (Proposed → Accepted on v0.11.0 merge)

---

## 1. Goal & context

For Thursday's meetup, **attendees join the platform on the spot via GitHub**, with a smooth in-room experience (one QR on the projector, everyone scans the same code).

The platform is **invitation-only today** and that does not change here. Signup already works end-to-end for a *single* invited person (`/onboard?token=…` → GitHub OAuth → atomic roster commit). The gap is **cardinality**: invites are single-use, one-at-a-time bearer tokens with no batch and no multi-use anywhere in the codebase. A room of N attendees needs a *new surface* — but **not** a new membership model. True open self-signup (anyone with GitHub joins, no invite) remains a separate, deliberate, ADR-level decision and is explicitly out of scope.

Persona upload/integration (the handoff's second goal) is **deferred to v0.11.1** (decided 2026-06-09). Signup is the meeting must-have; persona carries personal data with real consent design + two latent display bugs (see §10) that should not be rushed alongside the meeting deadline.

## 2. Scope decision

**In (v0.11.0):** multi-use "meeting" invite token; admin QR surface; redemption-path changes (guard branch, concurrency hardening, dup-handle guard); new-member first-use fix (welcome-redirect + consent cookie); revocation; soft max-uses cap; tightened expiry; ADR-0018; tests.

**Deferred (v0.11.1+, documented in §10):** persona upload/integrate path; Vercel BotID / WAF rate-limit toggle; the "live bridge" cookie for *instant* gated-surface access during the snapshot-lag window.

**Out (separate ADR, not scheduled):** open self-signup / removing the invite gate.

## 3. Current-state mechanics (verified 2026-06-09)

Read directly from source; these constraints shaped the design.

- **Invite token** (`lib/invitations.ts`): HMAC-SHA256 over `base64url(canonicalJson(payload))`, `timingSafeEqual` compare (line 136). Payload = `{ jti: uuid, iss: handle, exp: unix, hint_telegram?, hint_display_name? }`. **Single-use** (ledger `jti` final-row guard `jtiHasFinalRow`), **bearer** (not identity-bound — whoever holds it + signs in redeems), **7-day** default TTL. Mint = `mintInvitation` server action → one `${NEXTAUTH_URL}/onboard?token=…` URL. **No batch, no multi-use** anywhere.
- **Redemption** (`redeemInvitation` orchestrator): atomic **4-file commit** via the GitHub App bot directly to `main` — `roster.md` row + `git-email-aliases.md` row + `invitations.md` `redeemed` row + new `community/members/<slug>.md` profile (with `consented_at`). Optimistic CAS with **one immediate retry, no backoff** (`attempt >= 2`, line 563). `revalidatePath` on `/members`,`/this-week`,`/admin/health`, then `redirect("/this-week")`.
- **The make-or-break constraint — build-time snapshot lag.** `findMemberByHandle` / `isAdmin` / `hasConsent` read the **baked `content-snapshot.json`** (regenerated only by a Vercel *build*, not by `revalidatePath`). The proxy gates non-public routes in order (`proxy.ts:216–258`): **(1)** signed-in? else `/login` → **(2)** `findMemberByHandle` in snapshot? else **`/no-access`** → **(3)** consent cookie? else `/consent`. A just-redeemed member is **not yet in the snapshot**, so `redirect("/this-week")` lands them on **`/no-access`** until the bot commit triggers a rebuild (~1–2 min; builds supersede under a commit storm so the floor is ~1–2 min after the *last* signup). Setting the consent cookie alone is insufficient — the **membership gate (2) fires before consent (3)**.
- **Admin** = single handle `anton1rsod` (from `community/governance/admins.md` → snapshot `adminSet`). `/admin/invite` re-checks `isAdmin` server-side on POST.

## 4. Best-practices validation (2026)

Validated the security-sensitive choices against current standards before locking. Sources at the bottom of this section.

**Confirmed correct (no change):**
- Signed-token construction matches OWASP: HMAC-SHA256, `timingSafeEqual` constant-time compare, UUIDv4 `jti` (~122 bits ≥ 128-bit-class entropy via the HMAC), `exp` enforced.
- Token-in-URL handling matches "don't expose tokens in logs/cache": proxy clean-URL redirect + HttpOnly cookie + `Cache-Control: no-store` + `Referrer-Policy: no-referrer`.
- Short expiry on an event link is correct — an expired-but-still-resolving event link is itself an attack surface (2025 Check Point campaign hijacked *expired* Discord invites). Ours fails `verifyToken` → generic 404 (no live destination).
- GitHub-OAuth gate is a strong abuse deterrent in its own right (each redemption needs a distinct real GitHub account; a leaked link can't trivially farm accounts).

**Improvements folded in (vs. the initial design):**
1. **Revocation** — both Slack and Discord support immediate invite kill; "expiry-only" was below standard. Non-racy: admin revoke → ledger `revoked` row → guard rejects. (H125)
2. **Rate-limit / bot protection posture** — Discord's *lack* of rate-limiting on multi-use links is a documented raid/spam vector. Primary deterrents shipped now (OAuth + short expiry + revocation + soft cap); **Vercel BotID / WAF rate-rule documented as recommended fast-follow** (not hand-rolling a stateful limiter under deadline).
3. **Soft max-uses cap** — Slack caps 400/link, Discord settable; a generous best-effort cap bounds a leaked link's blast radius. Best-effort because counting under OCC is slightly racy (acceptable for a cap). (H126)
4. **Tighter default expiry** — meeting window (~3–4h, admin-adjustable, clamped), not "end of day." Shorter = safer. (H127)
5. **Backoff precision + honesty** — exponential backoff with **full jitter** + capped retries (today = one immediate retry). Honest ceiling: OCC under high contention is O(N²) work (AWS Builders' Library); a synchronized 20-at-once spike would strain it — for a normal trickle it's fine; mitigation if a spike is expected is to stagger the ask. (H129)
6. **QR hygiene (anti-quishing)** — encode the **full real URL, no shortener** (camera preview shows the legit domain); project on screen / keep printed codes attended (sticker-overlay is the top physical quishing vector); expired token → clean `/onboard/error`. (H132, H133)
7. **Defense-in-depth on the proxy (deeper validation round).** The Next.js middleware-bypass class (CVE-2025-29927, CVSS 9.1; patched in 15.2.3+, repo is on **16.2.6**) means the proxy is *not* a security boundary — every privileged Server Action must re-verify auth independently, and the new `/welcome` route must carry no member-only data. Both hold. (H136) See §5.8.

Sources: OWASP Authentication Cheat Sheet; AWS "Exponential Backoff and Jitter" + Builders' Library "Timeouts, retries, backoff with jitter"; Slack invite controls; Check Point Research "hijacked Discord invites" (2025); Security.org quishing guide (2026); Datadog Security Labs + JFrog on CVE-2025-29927; Next.js "How to Think About Security in Server Components & Actions" + Data Security guide; QR-insights / QRLynx QR design (ISO 18004); Cloudflare WAF rate-limiting best practices.

## 5. The design

### 5.1 Multi-use "meeting" invite token
Extend `InvitePayloadSchema` with an **optional** `kind: "single" | "meeting"`. **Absent ⇒ `"single"`** so every existing token, mint path, and test is unchanged (H123). `meeting` tokens additionally carry `max_uses` (soft cap) and a short `exp`. One mint path, one verify path, one cookie/handoff path — only the *redemption guard* branches.

### 5.2 Expiry, revocation, soft cap
- **Expiry** (H127): admin sets a duration at mint; default ~3–4h; clamped to a sane min/max (e.g. ≥30min, ≤24h). `verifyToken` already enforces `exp`.
- **Revocation** (H125): a new admin action appends a `revoked` row for the `jti`. The meeting guard rejects redemption if the `jti` has a `revoked` row — revocation beats multi-use (H124).
- **Soft cap** (H126): meeting guard counts `redeemed` rows for the `jti` in the freshly-read ledger; rejects beyond `max_uses` (default generous, e.g. 50). Best-effort under concurrency.

### 5.3 Admin QR surface
Extend `/admin/invite` (already admin-gated; re-check `isAdmin` server-side on the new action — H134) with a **"Mint meeting invite"** panel: pick expiry + cap → renders the `/onboard?token=…` URL **and a large projectable QR** (server-rendered PNG data-URI shown as a plain `<img>`; full canonical URL, no shortener — H132). Below it, an **inline Revoke** for the just-minted invite — a persistent cross-session registry is deferred to v0.11.1 (minted tokens are stateless); the "QR registry" best practice (H135).

### 5.4 Redemption guard branch + dup-handle guard
In `redeemInvitation` orchestrator, branch on `payload.kind`:
- `single` (or absent) → existing single-use behavior, untouched.
- `meeting` → skip single-use rejection; enforce **revoked** (H124) + **soft cap** (H126); append a `redeemed` audit row per attendee (multi-row per `jti`).
- **Live duplicate-handle guard** (H128): the orchestrator already reads `roster.md` live to append; for meeting redemptions, reject if the signed-in handle is already present in that live roster. Closes the "same person double-scans inside the snapshot-lag window → duplicate roster row" edge (the snapshot-based `findMemberByHandle` can't catch it).

### 5.5 Concurrency hardening (H129)
Replace the single immediate CAS retry with **exponential backoff + full jitter, capped retries** (e.g. up to ~6 attempts, base ~75ms, cap ~2s, full jitter). Applies to all redemptions (single + meeting). Honest ceiling documented (§4.5).

### 5.6 New-member first-use — welcome-redirect (H130, H131)
Two parts, both small, that make signup actually *work* in a live room:
- **Set `waic-consented=1` at redemption** (H130): the member consented in the form; reflect it (reuse the consent-cookie helper). Belt-and-suspenders once the snapshot catches up.
- **Redirect to a public `/welcome` page, not gated `/this-week`** (H131): new public route (added to `PUBLIC_PATHS`) with "🎉 You're in" + next-steps + links to public surfaces (`/home`,`/events`,`/calendar`,`/handbook`) + "member-only areas unlock in ~1 minute." This avoids the `/no-access` bounce entirely (the membership gate never fires on a public route), gives a celebratory landing, and lets gated surfaces unlock when the rebuild lands. Bonus: fixes the existing single-invite `/no-access` wart.

> The heavier alternative — a signed "fresh member" bridge cookie the proxy trusts for *instant* gated access — is deferred to v0.11.1 (it adds an auth-bypass surface needing its own security review). Welcome-redirect is the right Thursday call.

### 5.7 QR hygiene / anti-quishing (H132, H133)
Full canonical URL in the QR (no shortener); rendered server-side as a PNG data-URI `<img>` (no inline markup; no third-party QR service that could see tokens); expired/invalid meeting token → clean `/onboard/error` ("this invitation has expired"), no info leak, no live-resolving destination. Operational note for the run-of-show: **project the QR on screen** (or keep any printed copy attended). **QR robustness (H137):** render at ECC level **Q** (use **H** only if a center logo is added) with a **≥4-module quiet zone**, sized to ~1/10 of the scan distance for projection; do a multi-distance / angle / lighting scan test before the meeting (ISO 18004).

### 5.8 Security model (defense-in-depth)

The proxy/middleware gate is a **convenience layer, not the security boundary**. The Next.js middleware-bypass class (CVE-2025-29927, CVSS 9.1; patched in 15.2.3+, repo is on **16.2.6**) means a crafted request could in principle skip the proxy — so:

- **Every privileged Server Action re-verifies independently** (H136): `mint-meeting` + `revoke` re-check `isAdmin` (H134); `redeem-invitation` re-checks session + already-member + live dup-handle (H128). None trust the proxy.
- The new public **`/welcome`** route is designed to carry **no member-only data** (celebratory copy + links to already-public surfaces) — safe in `PUBLIC_PATHS` even under a proxy bypass.
- **Keep Next.js patched** — the bypass is mitigated at the data/action layer regardless, but the patched runtime is the first line.
- **Server Action CSRF:** Next.js's default protection (POST-only + `Origin`===`Host`/`X-Forwarded-Host`) is active and working in prod for the single Vercel host (no `allowedOrigins` config needed); setting `serverActions.allowedOrigins` to the prod host is an optional DiD hardening. All action inputs stay Zod-validated and treated as hostile.

## 6. Hardenings (H123–H137)

| ID | Hardening | Source/rationale |
|---|---|---|
| H123 | `kind` absent ⇒ `"single"`; existing tokens/tests unaffected | backward-compat |
| H124 | `revoked` row beats multi-use (revocation wins) | Slack/Discord control |
| H125 | Admin revoke → ledger `revoked` row → guard rejects | Slack/Discord revocation |
| H126 | Soft `max_uses` cap (best-effort count under OCC) | Slack/Discord cap |
| H127 | Meeting expiry default ~3–4h, clamped min/max | OWASP short-lived links |
| H128 | Live duplicate-handle guard for meeting redemptions | snapshot-lag double-join |
| H129 | CAS: exponential backoff + full jitter + capped retries | AWS backoff-and-jitter |
| H130 | Redemption sets `waic-consented` cookie | first-use correctness |
| H131 | Post-redeem → public `/welcome`, not gated `/this-week` | avoids `/no-access` bounce |
| H132 | QR encodes full canonical URL, no shortener; PNG data-URI `<img>`, server-side | anti-quishing |
| H133 | Expired/invalid meeting token → clean `/onboard/error` | no info leak / no live destination |
| H134 | New mint **and revoke** actions re-check `isAdmin` server-side | privilege-escalation guard |
| H135 | Mint screen surfaces the minted invite + inline Revoke (persistent registry → v0.11.1) | QR registry best practice |
| H136 | Proxy ≠ sole auth boundary; all privileged actions re-verify; Next.js patched (CVE-2025-29927); `/welcome` carries no member-only data | defense-in-depth |
| H137 | QR at ECC Q (H if logo) + ≥4-module quiet zone, sized for projection; pre-meeting scan test | QR robustness (ISO 18004) |

## 7. ADR-0018

`docs/decisions/0018-meeting-scoped-multi-use-invites.md` — records the invite-cardinality change (single-use → meeting-scoped multi-use), the expiry-not-count primary bound (OCC raciness), revocation + cap + OAuth as the defense layers, and the explicit boundary that **this stays invite-gated** (open membership remains a separate future ADR). Status **Proposed** at spec time → **Accepted** on v0.11.0 merge (per ADR-0015 precedent).

## 8. Testing strategy

- **Unit:** `kind` discriminator default (H123); meeting guard — revoked rejection (H124/H125), soft-cap rejection (H126), expiry clamp (H127); backoff/jitter retry sequence (H129, deterministic via injected sleeper/RNG); QR URL builder (H132).
- **Integration:** multi-use redemption (2+ attendees same `jti`), CAS conflict → retry → success, consent-cookie set (H130), live dup-handle rejection (H128), `isAdmin` re-check on mint (H134).
- **E2E (Playwright, mock invitation store):** meeting happy path (mint → onboard → `/welcome`), already-member rejection, expired token → `/onboard/error`, revoked token rejection. Existing single-use E2E must stay green (backward-compat).
- **Backward-compat gate:** all existing single-use invitation tests pass unchanged.
- Coverage ≥80% gate maintained.

## 9. Version, PR shape, rollout

- **Version:** `v0.11.0` (minor — new feature). CHANGELOG `[0.11.0]`.
- **PR:** single PR (touches `lib/`, `app/`, `proxy.ts` → CI-triggered paths → PR, not direct-to-main, per repo policy).
- **Rollout:** merge → Vercel prod auto-deploy → orchestrator-side prod smoke (the 4-for-4 ship gate) → tag `community-platform-v0.11.0` → STATE flip.
- **Run-of-show (Thursday):** admin mints a meeting invite at the meeting (expiry covering the session), projects the QR; attendees scan → GitHub OAuth → fill form → land on `/welcome`; gated surfaces unlock within ~1–2 min. Admin can revoke post-meeting (or let it expire).

## 10. Fast-follows (v0.11.1+)

- **Persona upload/integrate** (the handoff's 2nd goal): cleanest integration is a `save-persona` Server Action writing `persona-builder/personas/<slug>/persona-<slug>.md` via the bot (mirrors `save-profile`), a "show to members" consent step, **and fixing two latent display bugs**: (a) `.public.md` is currently *inert* (`.md` sorts before `.public.md` so the private file always wins the `readMemberPersona` alphabetical pick) and (b) `truncateToFirstH2` truncates persona display to the pre-`##` intro (today shows almost nothing). Paste-into-textarea, not file upload (file upload is a brand-new primitive; YAGNI for Markdown).
- **Live-bridge cookie** for instant gated-surface access during snapshot lag (signed, short-TTL, handle-bound; needs its own security review).
- **Vercel WAF rate-limit** on the redemption path — edge-level + multi-instance-correct + error-response counting + sliding window (a Vercel-native limiter, **not** an in-memory per-function counter, which is silently broken on Vercel's multi-instance runtime); **Vercel BotID** complements it against automated-bot signups.

## 11. Decisions log

- **D1** Signup = **multi-use meeting QR** (not batch single-use, not open self-signup). — Anton 2026-06-09
- **D2** Persona = **fast-follow v0.11.1** (signup is the Thursday must-have). — Anton 2026-06-09
- **D3** First-use = **welcome-redirect** Thursday; live-bridge deferred. — Anton 2026-06-09
- **D4** Rate-limit = **OAuth + expiry + revocation + soft cap** Thursday; **BotID/WAF fast-follow**. — Anton 2026-06-09
- **D5** Multi-use bound primarily by **short expiry**, not a strict count (OCC raciness); cap is best-effort defense-in-depth.
- **D6** Stays **invite-gated** — open membership is a separate, unscheduled ADR.
