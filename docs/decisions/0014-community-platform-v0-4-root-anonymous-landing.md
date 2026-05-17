# 0014. community-platform v0.4 — `/` flips to anonymous-public hero landing

- Status: Proposed
- Date: 2026-05-18
- Amends: [ADR-0012](./0012-community-platform-v0-3-discovery-posture.md) (root path default posture)

## Context

[ADR-0012](./0012-community-platform-v0-3-discovery-posture.md) flipped six discovery surfaces (`/home`, `/events`, `/meetings`, `/api/calendar.ics`, `/manifest.json`, `/icons/*`) to anonymous-public for v0.3.0. The platform's *root* `/` route remained gated — anonymous `GET /` returns `307` to `/login`. Verified on production v0.3.1 (deploy `ivbncdcvq`, captured 2026-05-18 in `docs/research/v0-4-gstack-walkthrough-2026-05-18/findings.md` §1):

```
GET /  →  307  →  /login
```

This is a dead surface — the URL most likely to be shared on Telegram / Twitter / blog posts / LinkedIn lands a prospective member on a sign-in page with no community context, no value proposition, and no way to reach the Telegram channel that *is* the actual community surface. Anonymous → applies-to-join conversion (one of v0.4's two locked success metrics per chat-22 Q0.3 lock) cannot improve while `/` remains content-free.

v0.4 (spec §14) introduces a `<Header>` + `<Footer>` global shell, a `/calendar` unified events+meetings index, a `/handbook` charter pointer, a warm amber accent token system, and a wordmark. The thesis is "lift v0.3.1 into a community platform with a warmer, more transparent identity" (chat-22 brainstorm §0). The `/` route is the structural fulcrum: it is the first surface a new prospective member sees, and v0.4 needs it to be the surface that orients them.

Brainstorm chat-22 Q1.1 + Q1.2 + Q0.5 (D24 in §14) locked the posture: anonymous `/` serves a hero+CTA landing; signed-in `/` redirects to `/home`. ADR-0012's "selected surfaces public" posture amends naturally to include `/` — the same per-route opt-in pattern, applied to the root path. No new authentication mechanism is introduced. No new PII pipe is opened.

This ADR amends [ADR-0012](./0012-community-platform-v0-3-discovery-posture.md) to add `/` to the anonymous-public set. It does not amend CONSTRAINTS line 12 again — ADR-0012 already established the precedent for selective discovery flips.

## Decision

Add `/` to the anonymous-public route set:

- **Anonymous `GET /`** → **200**, serves a hero composition (value proposition + dual CTA + next-event ribbon + below-hero discovery strips), per chat-22 Q1.2 lock.
- **Signed-in `GET /`** → **302** → `/home`, per chat-22 Q0.5 lock. Preserves any `?from=…` query parameter for return-to handling (H57).

`proxy.ts` `PUBLIC_PATHS` is the single source of truth — adding `"/"` to the existing `Set<string>` is the structural change.

The hero composition (chat-22 Q1.2):

| Slot | Content |
|---|---|
| **Wordmark** (top-left of header) | `Warsaw AI` in Inter Semibold, links to `/` |
| **Value-prop headline** | "Where Warsaw's AI builders learn, ship, and find each other." (Q-1.1 lock) |
| **Sub-line** | "Member-led. Meets weekly in Warsaw. Free. Open-source platform." |
| **Primary CTA** | `[Sign in with GitHub]` |
| **Secondary CTA** | `[Join Telegram →]` (links to Telegram invite URL; chat-23 spec §14.3 locks the URL) |
| **Next-event ribbon** (right-aligned on desktop) | "Next: Wed May 21 · 18:30 — RSVP →" linking to `/events/<slug>`. Neutral framing only (H56-adjacent manipulation-resistance: no countdown, no "spots remaining" unless seats are actually limited). |
| **Below-hero strips** | "This week" + "Recent activity" (last 5 status post excerpts, ADR-0012 D7 public-excerpt posture) + 5-card section nav |

The hero is a *layout* of existing data sources: the next-event ribbon reads the next future event from the same data layer as `/calendar` + `/api/calendar.ics`; "Recent activity" reads the same status excerpts as `/home`. No new persistence surface; no new data flow.

## Consequences

### Easier

- **Discovery friction eliminated for prospective members.** A `warsaw-ai-community-platform.vercel.app` link shared on Telegram / LinkedIn / Twitter lands on a 200 with community context — value-prop sentence + Telegram CTA + next event — not a sign-in detour with no orientation.
- **SEO-canonical surface.** `/` becomes the OG `<meta>` + canonical URL home; search engines have a meaningful page to index. The README.md community description (chat-22 Q-1.1) propagates naturally.
- **Telegram visibility on the platform.** Today, a Telegram-curious visitor has no way to reach the channel from the platform; the secondary CTA closes the gap. This honors §14A Q2 lock that "real status quo is **Telegram**, not v0.3.1" — the platform competes with Telegram for new-member onboarding, not for existing-member chat.
- **One-route consolidation.** `/` (marketing) + `/home` (discovery) have explicit different jobs — marketing-leaning vs. discovery-feed — preventing the v0.5+ pressure to introduce a third "landing" route. Brainstorm Q1.1 lock: "Keep both with different jobs in v0.4. Consolidate to `/home` (with `/` retiring or simplifying) in v0.5+ if the dual-route pattern doesn't earn its keep."

### Harder

- **Session-coupled rendering risk.** `/` becomes auth-aware (signed-in branch → 302; anonymous branch → 200 hero). A Server Component that mistakenly caches the signed-in branch could leak session state into an anonymous response. **Mitigation:** H56 (`/` anonymous render asserts no `auth()` side-effects in the hero composition path; `Cache-Control` posture matches `/home`'s `private, no-cache, no-store, max-age=0, must-revalidate`). v0.3.1's `/home` already runs this pattern post-chat-21 amendment (verified in `findings.md` §7); `/` adopts the same posture.
- **Return-to query preservation.** Signed-in `/` 302→`/home` must preserve `?from=…` query parameters if present so deep-links from anonymous shares survive the redirect chain. **Mitigation:** H57 (test `?from=…` round-trip through the 302).
- **Hero coupling to event-data freshness.** The next-event ribbon reads the same data layer as `/api/calendar.ics`. If the data layer goes stale (no upcoming events committed; or build-time snapshot misses a new event), the hero shows "No upcoming events — next weekly sync is Wednesday at 18:30" (Q3.5 empty-state pattern). Calibrated empty-state, not broken UI.
- **Cache-Control divergence between anonymous and signed-in.** The anonymous response can be `public, max-age=N` (the hero is identical for all anonymous users) but the signed-in 302 must be `private` (don't cache the redirect that points to a user-specific surface). Phase A test covers both branches.
- **Marketing surface evolves over time.** A hero on `/` invites future "redesign the hero" pressure that the previous 307→/login surface didn't. v0.4 ships the hero design; v0.5+ revisions stay scoped to the route. Brainstorm Q-1.1 / Q1.2 lock the v0.4 hero shape; any future change is per-PR design pass.

### Implementation

`proxy.ts` (current location of `PUBLIC_PATHS` per [`projects/community-platform/proxy.ts:20`](../../projects/community-platform/proxy.ts)):

```diff
 const PUBLIC_PATHS = new Set<string>([
+  "/",                // ADR-0014 — anonymous hero landing
   "/home",            // ADR-0012
   "/events",          // ADR-0012
   "/meetings",        // ADR-0012
   "/login",
   "/no-access",
   "/consent",
   "/api/consent/recover",
   "/manifest.json",   // ADR-0012
   …
 ]);
```

`app/page.tsx` (the root route) gains a hero composition. The Server Component checks the auth state at the top:

```ts
// app/page.tsx — composed sketch, not literal final code
export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/home");  // H57 — preserve ?from=… via headers
  }
  return <AnonymousHero />;  // hero composition per Q1.2
}
```

The anonymous render path **must not** invoke any `auth()` side-effects beyond the gate check, and **must** return `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` to prevent edge-cache poisoning across the signed-in / anonymous branches (H56). Pattern-8 (per `docs/playbooks/recurring-plan-defects.md`) — the route ships as `ƒ Dynamic` (auth-aware → forces dynamic).

The hero data sources:
- **Next-event ribbon:** reads from the same event-data layer that backs `/calendar` (new in v0.4 Phase A) + `/api/calendar.ics`. No new persistence.
- **"This week" + "Recent activity" strips:** reuse the existing v0.3 components from `/home`.

E2E coverage (spec §14.9 hardening table + chat-24 Plan task):
- **H56** anonymous `GET /` returns 200 with hero markup; no session-leak in response body or headers; `Cache-Control: private, no-cache, no-store, …` matches `/home`'s posture.
- **H57** signed-in `GET /` returns 302 with `Location: /home` and preserves `?from=…` query parameter.
- **H58** `<Header>` shows correct auth-state UI on `/` for both branches without flash (no anonymous-then-signed-in hydration flicker).

## Change-control

**Reversal cost: LOW.**

To revert `/` to the v0.3.1 posture (gated, 307→/login):
1. Remove `"/"` from `PUBLIC_PATHS` in `proxy.ts`.
2. Optionally simplify or remove `app/page.tsx` body — the proxy gate takes precedence regardless.
3. Update CHANGELOG with the revert SHA.

No data migration. No schema change. No session-cookie reformat. No CSP / OAuth-callback / OG-meta config drift outside the file diff.

**When to reverse this ADR:**
- A privacy incident demonstrates that hero-included data (e.g., a future variant that surfaces member names or counts on `/`) leaks identifying information across the anonymous boundary.
- Phase A v0.4.0 user-test feedback (per D44 lock) shows that the dual-route `/` vs `/home` pattern confuses members more than it helps; in that case v0.5+ may consolidate `/` and `/home` (per Q1.1 lock), at which point this ADR is superseded by a new ADR rather than reversed.

**Extending this ADR:**
- Flipping `/decisions` to anonymous-public requires its own ADR (the proposed-but-dropped ADR-0013 from chat-22; deferred to v0.5+ subject to a PII audit task — captured in `projects/community-platform/V0_5_BACKLOG.md`).
- Flipping `/members` or `/projects` to anonymous-public requires its own ADR with per-member opt-in collection (v0.5+ scope, also in V0_5_BACKLOG).
