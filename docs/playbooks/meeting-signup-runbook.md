# Meeting Signup Runbook (live QR onboarding)

**Purpose:** the on-site procedure for letting people join the community platform from one projected QR at an in-person meetup. Follow this top-to-bottom on event day.

**Feature:** v0.11.0 meeting-signup (spec §21, ADR-0018). **Last validated:** 2026-06-11 (prod pre-flight: mint + proxy handoff verified live; standards audit folded into §Known limits).

> First real-world use is **2026-06-11**. The fresh-attendee redeem path (sign-in → form → roster write → `/welcome`) runs live for the first time tonight — the §6 fallback is the safety net, not a formality.

---

## Per-event settings — fill these before each event

| Setting | This event (2026-06-11) | Notes |
|---|---|---|
| Event window | 19:30–23:00 Warsaw | start → end |
| Expected attendees | ~10 | drives `max_uses` |
| **`Max uses`** | **50** | 5× headroom; never set this tight — a low cap blocks legitimate re-scans |
| **`Expires in (hours)`** | **5** | covers the whole window + stragglers regardless of when you mint (clamp range 0.5–24h) |
| Admin account | `anton1rsod` | must be signed in + admin |
| Prod base URL | `https://warsaw-ai-community-platform.vercel.app` | |

---

## 1. Setup — before signup opens

- [ ] On the laptop driving the projector, sign in to prod as the **admin** (`anton1rsod`).
- [ ] Reach **`/admin/invite`** — ⚠️ **there is no nav link to it yet**, so **bookmark the full URL before the event**: `https://warsaw-ai-community-platform.vercel.app/admin/invite` (works once you're signed in as admin). Scroll to the **"Meeting invite"** section (the *second* form; the top "Mint invitation" form is the personal single-use one — not this).
- [ ] Set **Expires in (hours) = 5**, **Max uses = 50**.
- [ ] Click **"Mint meeting QR."** You'll get: the QR image + the **Meeting URL** + a **"Revoke this invite"** button.
- [ ] ⚠️ **Do not refresh or close that browser tab.** The QR is session-bound (no persistent registry yet, v0.11.0) — refresh = QR gone, you'll have to re-mint.
- [ ] Mint right around signup-open. (5h expiry also covers earlier minting, so minting during setup is fine too.)

## 2. The 30-second pitch — say this while projecting

> "To join the platform, scan this QR. You'll need **a GitHub account** and **your Telegram handle** — takes about a minute. No GitHub? Come see me, I'll add you. Your camera will preview the link — it should read **warsaw-ai-community-platform.vercel.app**; that's us."

- GitHub is required (dev/AI community — members open PRs). Set the expectation up front.
- The "preview the domain" line is the anti-quishing check — worth saying out loud.

## 3. Project this

- The **QR image AND the full URL** — **don't shorten the URL.** (The camera preview showing the real domain is the phishing check. The in-app note says the same.)
- Leave it up for the whole signup window.

## 4. What each attendee does (happy path)

1. **Scan the QR** → lands on `/onboard` (the token is auto-stripped from the URL).
2. **"Sign in with GitHub"** → authorize on GitHub → back to `/onboard`.
3. **Registration form** ("Complete your registration"):
   - **Display name** (required)
   - Focus area *(optional — can skip)*
   - Link *(optional — can skip)*
   - **Telegram handle** (required, `@handle`)
   - **"git email alias"** (required) → **tell them: "any email you use with git — your GitHub email is fine."** (This label confuses people; pre-empt it.)
   - **Consent checkbox** (required) — "listed publicly on the roster"
4. **Submit** → lands on **"You're in."** (`/welcome`).
5. Member-only areas unlock **~1 minute later** (the site rebuilds). Tell them: "explore meanwhile; full access in a minute."

## 5. Watch for / troubleshoot

- **"This invitation can't be completed."** — the **catch-all** error. By design it does NOT tell you which check failed (no info leak). It can mean: *already a member* (existing members can't re-join — e.g. **if you scan it yourself, you'll see this; that's expected**), expired/revoked token, or cap hit. For 10 people none of these should fire → if someone hits it, go to §6.
- **QR vanished (you refreshed the tab):** re-mint a fresh one. The old token stays valid until expiry, but you can't see it anymore — just use the new QR.
- **Cap / expiry:** 50 uses / 5h won't be reached by ~10 people in 3.5h. For a bigger/longer future event, raise both at mint.
- **Weak wifi + GitHub OAuth:** the redirect can stall on bad connections. Have them retry on cellular, or fall back to §6.

## 6. Fallback — no GitHub, or signup failed

The safety net for: no GitHub account, OAuth stalls, or anyone who hits the generic error.

- [ ] Collect on paper/notes: **name + Telegram handle** (+ GitHub handle if they have one).
- [ ] Add them after the event via a normal roster PR, or DM them a **personal single-use invite** (the top form on `/admin/invite`) later.

## 7. After the event

- [ ] New members' roster rows were written automatically by the bot (`warsaw-ai-bot`) — sanity-check `community/members/roster.md`.
- [ ] **Revoke is optional** — the QR auto-expires in 5h. Revoking writes a `revoked` ledger row; skipping just lets it expire (cleaner). Only revoke if you want it dead immediately.
- [ ] **Retro hook (feeds v0.11.2 scope):** capture *how many scanned vs completed*, *where people stalled* (GitHub sign-in? the form? the "git email alias" field?), and any errors. That real-world signal sequences the fast-follows below.

---

## Known limits (v0.11.0) — from the 2026-06-11 standards audit

The security design is sound and current (defense-in-depth vs CVE-2025-29927, no-info-leak errors, quishing posture, append-only revocation). The known gaps are UX/inclusion + one deferred security item — all **candidates for v0.11.2, scope locked after the 6/12 retro**:

- **On-site form is heavier than best practice** (OAuth + 6 fields; industry on-site target is ≤2 fields). → v0.11.2: defer focus/link/git-email to a post-event "finish your profile" step.
- **"git email alias" is jargon.** → tonight: explain it verbally (§4); v0.11.2: rename + derive from the GitHub API.
- **GitHub-only excludes non-devs.** → tonight: §6 fallback; pending ADR: email magic-link, with GitHub as *authorization* (write-path) rather than *authentication* (entry).
- **No per-IP rate-limit on redemption** (only the soft `max_uses` cap). → already deferred in §21 (edge Vercel WAF). Low-risk in a controlled room; matters for larger/public events.

Full audit + sources: this chat's standards review (QR/token security, event-signup UX, auth friction). Spec: `projects/community-platform/spec.md` §21. Decision record: `docs/decisions/0018-*`.
