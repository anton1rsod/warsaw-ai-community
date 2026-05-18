# v0.4 — gstack structural walkthrough of v0.3.1 prod

**Date:** 2026-05-18
**Chat:** 23 (v0.4 spec writing)
**Author:** AI collaborator
**Origin:** Substitute for the office-hours mandatory user-test session (recruited members + 30-min observation). Anton elected to skip user recruitment in chat-23 (2026-05-18); this structural walkthrough captures the *objective* friction signal in its place. Member user-test remains valid future input — re-evaluated post v0.4.0 ship per D44 before Phase B activation.

**Scope captured:**
- Anonymous flow on desktop (1440×900) and mobile (390×844): `/`, `/login`, `/home`, `/events`, `/meetings`, `/api/calendar.ics`.
- Gated-route anonymous probe: `/members` (confirmed 307→/login behavior).
- HTTP probe across all v0.3.1 routes + all v0.4-target NEW routes (`/calendar`, `/handbook`, `/feed/*`).
- Cache-Control header check on `/home` (signed-in dynamic posture) and `/` (anonymous redirect).
- Console error capture.

**Scope NOT captured (walkthrough limit):**
- Signed-in flow — Playwright has no Anton session cookie; signed-in `/home` dashboard ("Your week" pane), `/me/edit`, `/this-week` RSVP UX, `/admin/health` admin surface untouched here. Relies on chat-21 close-out smoke (Anton-verified, captured in STATE.md `last_verified.v0_3_1_ship`) + spec §13 composition.
- Subjective member-friction signal — what a real member *felt* confused by, *ignored*, or *clicked twice*. This is the ~30% gap a gstack walkthrough cannot fill. Re-evaluated post v0.4.0 ship.

**Artifacts:**
- `01-login-desktop.png` · `08-login-mobile.png`
- `02-home-anon-desktop.png` · `05-home-anon-mobile.png`
- `03-events-anon-desktop.png` · `03-events-anon-viewport.png` · `06-events-anon-mobile.png`
- `04-meetings-anon-desktop.png` · `07-meetings-anon-mobile.png`
- `snap-01..04-*.yml` — Playwright accessibility snapshots (semantic DOM tree)

---

## 1. Route map (v0.3.1 prod as of 2026-05-18 evening)

| Route | HTTP | Cache-Control | Notes |
|---|---|---|---|
| `/` | **307→/login** | `public, max-age=0, must-revalidate` | The dead surface ADR-0014 will flip. |
| `/home` | **200** | `private, no-cache, no-store, max-age=0, must-revalidate` | H30-amended dynamic-per-request posture (v0.3.1 chat-21 fix). |
| `/login` | 200 | (n/a) | No header/footer per Q3.1 exception — confirmed in DOM (just `<main>` + h1 + p + button). |
| `/events` | 200 | — | Discovery index per ADR-0012. |
| `/events/[slug]` | 404 | — | No event entries committed yet; SSG `generateStaticParams` returns empty. |
| `/meetings` | 200 | — | Discovery index per ADR-0012. |
| `/meetings/[slug]` | 404 | — | No meeting entries committed yet. |
| `/api/calendar.ics` | 200 `text/calendar` | `public, max-age=300` | Empty VCALENDAR body (no VEVENT blocks). |
| `/manifest.json`, `/icons/icon-*.png` | 200 | — | PWA assets per v0.3.0 Phase 4. |
| `/me/edit`, `/this-week`, `/admin/health`, `/api/me/export` | 307→/login | — | Personal/write/admin gates intact (correct). |
| `/projects`, `/decisions`, `/members` | 307→/login | — | Gated content (Q6.1 keeps gated in v0.4). |
| `/calendar` | **307→/login** | — | **NOT IMPLEMENTED in v0.3.1.** v0.4 Phase A creates as anon-public (D27). |
| `/handbook` | **307→/login** | — | **NOT IMPLEMENTED in v0.3.1.** v0.4 Phase A creates as anon-public (D26 + Q6.1 (i)). |
| `/feed/meetings.xml`, `/feed/events.xml` | **307→/login** | — | **NOT IMPLEMENTED in v0.3.1.** v0.4 Phase C creates as anon-public (D40). |

**Implication for spec §14.3 (Routes added/changed):** all four NEW route handlers (`/calendar`, `/handbook`, `/feed/meetings.xml`, `/feed/events.xml`) are net-new files — not just `proxy.ts` PUBLIC_PATHS additions. Each needs `app/<route>/page.tsx` or `app/<route>/route.ts` plus a `proxy.ts` PUBLIC_PATHS entry. Phase A delivers `/calendar` + `/handbook`; Phase C delivers `/feed/*`. Confirms brainstorm scope envelope (Q10.1).

---

## 2. Anonymous `/home` shape (the page anonymous landing currently fails to anchor)

DOM excerpt (`snap-02-home-anon-desktop.yml`):

```
main
  ├─ heading "Warsaw AI Community" (h1)
  ├─ paragraph "Discovery + decisions + ship cadence"
  ├─ navigation "Account"
  │   └─ link "Sign in" → /login
  ├─ section "This Week" (h2)
  │   └─ "Nothing scheduled this week — browse all events."
  ├─ section "Recent" (h2)
  │   └─ "No recent activity. — browse projects."
  └─ navigation "Sections"
      ├─ Events / Meetings / Members / Projects / Decisions
```

**What it does well (preserve in v0.4):**
- Friendly empty-state copy with calibrated next action — per Q3.5 lock ("Always offer a next action OR a calibration").
- Auth-state-aware top-right: anonymous shows `[Sign in]`; signed-in (per chat-21 smoke) shows account dropdown.
- `Cache-Control: private, no-cache, no-store` — already correctly dynamic per H30 amendment.
- Mobile snapshot at 390×844 renders cleanly — no horizontal scroll, no clipped text.

**What it lacks (v0.4 must add):**

| Gap | Q-lock that addresses it | v0.4 Phase A delivery |
|---|---|---|
| **No global `<Header>`** (top-of-`<main>` heading is not a shared chrome — orphans every other page) | Q3.1 / D30 | Phase A `<Header>` component with wordmark left + 5-nav center + avatar/Sign-in right |
| **No global `<Footer>`** | Q3.1 / D30 | Phase A `<Footer>` component with copyright + Telegram link + RSS pointer slot |
| **No value-prop hero** — anonymous lands cold on "Discovery + decisions + ship cadence" with no orientation | Q-1.1 / Q1.2 / D24 (ADR-0014) | Phase A `/` route gains hero — but `/home` stays as discovery feed. The decision tree: anonymous-cold-arrival → `/` (hero), anonymous-came-from-link → `/home` (feed). |
| **No next-event ribbon** | Q1.2 | Phase A `/` hero includes ribbon; `/home` This-Week strip continues to serve the same job for repeat anonymous arrivals |
| **No `[Join Telegram →]` CTA** anywhere — Telegram is the actual community status quo (§14A Q2 lock) but it's invisible to platform visitors | Q1.2 dual-CTA hero | Phase A `/` hero dual CTA includes Telegram secondary; footer "Telegram" link adds backstop everywhere |
| **No wordmark** ("Warsaw AI" in Inter Semibold per Q4.7) — h1 "Warsaw AI Community" is the visual identity by default | Q4.7 / D34 | Phase A `<Header>` wordmark |
| **Top-nav has 5 sections, not the 5 Q2.1 locked ones** | Q2.1 / D26 | Phase A `<Header>` top-nav: Home / Calendar / Projects / Members / Handbook (drops Decisions, adds Calendar + Handbook). Note: /home's *in-page* 5-card section grid is separate from `<Header>` top-nav — spec §14.3 should clarify whether /home retains its in-page card grid or removes it once the global top-nav is the canonical traversal surface. |
| **Tagline copy** "Discovery + decisions + ship cadence" doesn't match Q-1.1 lock "Where Warsaw's AI builders learn, ship, and find each other." | Q-1.1 / D21 | Phase A `/` hero gets the locked sentence; `/home` h1 can stay terse ("Warsaw AI Community") or adopt the tagline |

---

## 3. Empty-state asymmetry (one drift from Q3.5 lock)

`/events` empty state: `"No upcoming events."` / `"No past events yet."` — both **terminal** (no calibration, no next action).

`/meetings` empty state: `"No meetings yet. The next sync will appear here once the first meeting note lands. View template ↗"` — **calibrated** (says what unblocks it) + offers external GitHub template link.

**Q3.5 lock:** "Always offer a next action OR a calibration ('next thing is X')."

**Recommendation for spec §14.5:** `/events` should mirror `/meetings` pattern — e.g., `"No upcoming events. The next weekly sync is Wed 18:30; standalone events appear here as they get scheduled. Propose an event ↗"`. Phase A Empty-State component (`<EmptyState>` per Q5.x list) can lock this contract programmatically so future surfaces inherit.

**No D-id contradiction.** Q3.5 / D43 (no breadcrumbs, etc.) hold. This is a refinement, not a re-litigation.

---

## 4. Console / favicon / network

`/login` produced **1 console error**: `Failed to load resource: the server responded with a status of 404 () @ https://warsaw-ai-community-platform.vercel.app/favicon.ico:0`.

**Impact assessment:**
- v0.3.1 ships no `/favicon.ico` (only `/icons/icon-192.png` + `/icons/icon-512.png` per manifest).
- Browser default behavior: every page request triggers `GET /favicon.ico` → 404 → console error.
- Not a security or correctness issue; not visible to non-DevTools users.
- v0.4 Q4.7 lock: "Favicon: same `WA` 32×32." Phase A regenerates this. Resolves the console error as a side-effect.

**No D-id contradiction.** Reinforces D34 (wordmark + PWA icon regen are in Phase A).

---

## 5. Signed-in fallback observation (limited)

Signed-in `/home` was anton-verified 2026-05-17 (chat-21 prep, captured in STATE.md `last_verified.v0_3_1_ship`):

> "top-right Account section shows Your week / Members / Edit profile · @anton1rsod / Sign out; each link routes correctly; Sign out returns anonymous /home with Sign in CTA top-right."

**Q2.4 lock:** dropdown items "handle (with `@`) → Your week (→ /this-week) → Edit profile (→ /me/edit) → Sign out. 4 items max."

**v0.3.1 currently has 5 items** (Your week / Members / Edit profile / handle / Sign out). v0.4 Phase A `<Header>` needs to:
- Drop the "Members" dropdown item (member directory is reachable via top-nav).
- Reorder to Q2.4: handle → Your week → Edit profile → Sign out.
- 4 items total.

**No D-id contradiction; tighten in spec §14.4 (`<Header>` component).** Adds an explicit Q2.4 enforcement item to the Phase A `<Header>` test suite (H58 — header auth-state stability includes correct dropdown contents).

---

## 6. Mobile viewport check (390×844)

`/home`, `/events`, `/meetings`, `/login` all render cleanly on 390-wide. No horizontal scroll. No clipped text. Single-column layout flows naturally.

**Observation for spec §14.4 (mobile nav):** v0.3.1 has no top-nav at all in `<main>` — there's no hamburger to test, no slide-in panel. Q2.5 lock (hamburger top-right + slide-in panel) is a v0.4 Phase A addition with NO precedent to compare against. **Recommendation for design-shotgun O7:** include 3 motion variants at the slide-in animation step (no precedent forces conservative pick).

**No D-id contradiction.**

---

## 7. Security headers (cross-cutting)

`/home` response headers verified:
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` ✓
- `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` ✓
- (no `X-Frame-Options`, no `Content-Security-Policy`, no `Referrer-Policy` on this response)

**v0.4 spec §14.7 (GDPR / threat-model) should NOT pull CSP into scope** — adding CSP is a security-mode lift on its own. Note as v0.5+ backlog candidate.

**No D-id contradiction.** Reinforces H56 (Cache-Control posture on new `/` must match `/home`'s `private, no-cache` for the signed-in 302 branch).

---

## 8. D-id contradiction scan (the gate that decides if §14 amends brainstorm-output)

For each D21–D44, does this walkthrough surface evidence that contradicts the lock?

| D-id | Decision | Walkthrough verdict |
|---|---|---|
| D21 | Public ambition sentence | **No contradiction.** Current tagline ("Discovery + decisions + ship cadence") drifts from the lock; v0.4 hero replaces. |
| D22 | PostHog primary + Linear + Claude/Notion accents | **No contradiction.** v0.3.1 is shadcn-default neutral; v0.4 character work is pure-add. |
| D23 | EN-only in v0.4; i18n structure prepared | **No contradiction.** All copy observed is EN. |
| D24 | `/` flips anonymous-public (ADR-0014) | **REINFORCED.** `/` currently 307→/login — dead surface confirmed. |
| D25 | `/home` is unified discovery feed | **REINFORCED.** Current `/home` is anonymous-public discovery feed; v0.4 adds signed-in dashboard above. |
| D26 | 5-item top nav: Home / Calendar / Projects / Members / Handbook | **REINFORCED.** Current `/home` in-page Sections nav uses different 5 (Events/Meetings/Members/Projects/Decisions). v0.4 globalizes Q2.1 5-nav as `<Header>`. |
| D27 | `/calendar` unifies events + meetings | **REINFORCED.** `/calendar` 307→/login today (NOT IMPLEMENTED) — v0.4 Phase A creates. |
| D28 | `/decisions` stays GATED | **REINFORCED.** `/decisions` 307→/login today; v0.4 preserves. |
| D29 | `/projects` + `/members` stay GATED | **REINFORCED.** Both 307→/login today; v0.4 preserves. |
| D30 | Global header + footer everywhere except `/login` | **REINFORCED.** Today: zero pages have global chrome (`<main>` only). v0.4 net-add. |
| D31 | Detail template family (3 variants, Phase B target) | **No contradiction.** No detail entries exist yet (`/events/[slug]` 404, `/meetings/[slug]` 404). Phase A wraps existing v0.3 detail templates in new shell; Phase B upgrades. |
| D32 | Token-based CSS variables | **No contradiction.** Today: Tailwind defaults + inline classes. v0.4 net-add. |
| D33 | Warm amber `#f59e0b` accent ramp | **No contradiction.** Today: v0.3 ships `#2563eb` placeholder via manifest theme + PWA icons. Phase A regen. |
| D34 | Wordmark only for v0.4 | **No contradiction.** No wordmark today; Phase A net-add. |
| D35 | Inter via `next/font` | **No contradiction.** v0.3.1 already uses Inter (verifiable via `next.config.ts`). Phase A consolidates. |
| D36 | `<ListItem>` shared component | **No contradiction.** No shared list component today; each page builds inline. Phase A consolidates. |
| D37 | Avatars from GitHub URL + initials fallback | **No contradiction.** v0.2/v0.3 already does this. Phase A consolidates into `<Avatar>`. |
| D38 | Member profile = pure PostHog team-page; PersonaPanel v0.2 preserved | **No contradiction.** v0.3 member profile renders as-is (verifiable post-signin). Phase B upgrade target. |
| D39 | Event detail = Luma-style outcome-focused (Phase B) | **No contradiction.** No event detail to compare; Phase A wraps existing v0.3 template. |
| D40 | RSS for meetings + events only | **No contradiction.** `/feed/*.xml` 307→/login today; Phase C creates. |
| D41 | NO analytics | **No contradiction.** No analytics scripts observed in DOM. |
| D42 | NO search | **No contradiction.** No search affordance present. |
| D43 | NO breadcrumbs / Storybook / tour / dark mode | **No contradiction.** None present. |
| D44 | Phase A committed; B+C conditional on user-test feedback | **No contradiction; reinforced by walkthrough scope:** the structural walkthrough validates Phase A *adds* (header/footer/wordmark/`/` hero/etc.). Phase B+C concern detail-template upgrades and brand-illustration polish — both invisible to anonymous gstack on v0.3.1. |

**Verdict: zero D-id contradictions. Brainstorm-output requires NO amendment.** Spec §14 can proceed directly without an amendment cycle.

---

## 9. Refinements for spec §14 (not contradictions; tighten the lock)

These observations refine the brainstorm without overturning anything:

1. **Spec §14.5 (Empty states)** — codify the "calibrated empty state with next-action link" pattern across all surfaces (currently asymmetric: `/meetings` good, `/events` thin). `<EmptyState>` component in Phase A `<EmptyState>` deliverables list (per Q3.5).

2. **Spec §14.4 (Components → `<Header>`)** — explicit Q2.4 enforcement: dropdown is exactly 4 items (handle → Your week → Edit profile → Sign out). v0.3.1 ships 5 (extra "Members"); v0.4 must drop. H58 test extends to dropdown-contents check.

3. **Spec §14.3 (Routes added/changed)** — be explicit that `/calendar`, `/handbook`, `/feed/meetings.xml`, `/feed/events.xml` are net-new route files (not just proxy.ts PUBLIC_PATHS entries). Each needs an `app/<route>/page.tsx` (or `route.ts` for the RSS feeds) created from scratch.

4. **Spec §14.3 (`/home` vs `/` separation)** — disambiguate the relationship between the new global top-nav (5 items, Q2.1 lock) and the existing in-page Sections card grid on `/home` (5 cards, Events/Meetings/Members/Projects/Decisions). Options:
   - **(a)** /home keeps its in-page Sections card grid as a discovery-feed component below the activity strip. The top-nav and the card grid are different affordances (global wayfinding vs. local discovery).
   - **(b)** /home drops its in-page Sections card grid once the global top-nav is the canonical traversal surface (avoid double-nav).
   - **Recommendation: (a) preserve, but re-order cards to Q2.1 order (Home gets dropped since you're there; Calendar / Projects / Members / Handbook are the 4 + Events + Meetings split out separately if /home's card grid stays explicit).** Locks in spec §14.3 with rationale.

5. **Spec §14.6 (Manipulation-resistance)** — current `/home` This-Week + Recent strips are already passive (no streak counter, no notifications, no comparison). Phase A "Your week" signed-in dashboard must preserve this. Cite this finding as forward-defense.

6. **`design-shotgun` O7 (mobile slide-in animation):** no v0.3.1 precedent to match — propose 3 motion variants (subtle slide-fade / overlay-with-backdrop-blur / drawer-from-edge) at the design-shotgun step. No conservative pick is forced.

7. **`design-shotgun` O3 (accent ramp exact hex):** v0.3.1 currently ships `#2563eb` placeholders. The proposed `#f59e0b` ramp is a 180° shift on the accent angle. The design-shotgun should produce 2-3 candidate ramps that anchor on `#f59e0b` but show the `-50` `-100` `-500` `-600` `-700` `-900` stops with explicit contrast ratios (axe-core verification) so Phase A token CSS can ship with confidence.

8. **Favicon:** Phase A regen task includes the `WA` 32×32 favicon (resolves the console 404 observed in walkthrough §4).

---

## 10. Compensating-control caveat for spec §14.0

Spec §14.0 must explicitly note:

> User-test deferred per Anton's chat-23 call (2026-05-18). Structural walkthrough captured at `docs/research/v0-4-gstack-walkthrough-2026-05-18/findings.md` substituted as primary empirical input. Member user-test re-evaluated post v0.4.0 ship per D44, before Phase B activation. The walkthrough captures objective friction (broken affordances, redirect chains, route gaps, layout regressions, accessibility gaps) but NOT subjective member reactions ("I felt confused here", "I ignored this", "I'd never click this"). Phase A landing data + Phase A user-test together gate Phase B activation; the structural walkthrough is the chat-23 input only.

---

## 11. Net findings (summary)

- **0 D-id contradictions.** Brainstorm-output requires no amendment.
- **8 refinements** for spec §14 (numbered §9 above) — each strengthens an existing D-lock without overturning it.
- **2 design-shotgun seeds** clarified (O3 accent ramp contrast verification; O7 mobile slide-in motion variants).
- **3 fresh observations to incorporate in Phase A:**
  - Empty-state `<EmptyState>` component contract (Q3.5 codification).
  - `<Header>` auth-state dropdown must be exactly 4 items per Q2.4 (drop "Members" from v0.3.1 dropdown).
  - All 4 new routes (`/calendar`, `/handbook`, `/feed/meetings.xml`, `/feed/events.xml`) are net-new route handler files — explicit in spec §14.3.
- **Spec §14.0 caveat** locked in for traceability.

**Status:** ready to proceed to chat-23 next step (design-shotgun for O1/O2/O3/O7/O12 + spec §14 drafting).
