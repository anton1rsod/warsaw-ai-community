# v0.4 UX baseline — annotated v0.3.1 production screenshots

Captured 2026-05-17 (chat-22 pre-brainstorm prep) via Playwright MCP against production `warsaw-ai-community-platform.vercel.app` (deploy `ivbncdcvq`, tag `community-platform-v0.3.1`, merge SHA `e720268`).

Used in chat-22 to anchor brainstorm answers in observed state — *not* re-derived from spec memory.

## Files

| File | Surface | Viewport | Notes |
|---|---|---|---|
| `v0_3_1-home-desktop.png` | `/home` (anonymous) | 1280×800 | Landing for unauthenticated visitors per ADR-0012 |
| `v0_3_1-home-mobile.png` | `/home` (anonymous) | 390×844 | iPhone 14 viewport — 5-card nav collapses to 1-col |
| `v0_3_1-events-desktop.png` | `/events` (anonymous) | 1280×800 | Upcoming + Past; empty state ("No upcoming events") |
| `v0_3_1-meetings-desktop.png` | `/meetings` (anonymous) | 1280×800 | Empty state ("No meetings yet. The next sync will appear here once the first meeting note lands.") |
| `v0_3_1-login-desktop.png` | `/login` (entry point) | 1280×800 | `max-w-md` (narrower than other surfaces); GitHub OAuth POST form |

## Structural observations

### Shell (cross-cutting)

- **Every surface uses `<main class="mx-auto max-w-3xl p-8">`** (768px content width, 32px padding). `/login` narrower at `max-w-md` (448px).
- **NO global persistent nav.** `/events`, `/meetings`, `/login` have *no* top nav, *no* sidebar, *no* footer chrome — once you arrive, you cannot navigate to any other surface except via the browser back button. The 5-card nav grid only appears as in-body content on `/home`.
- **No logo / wordmark / brand mark.** Every page renders the bare text `Warsaw AI Community` as `<h1>` (3xl semibold).
- **No favicon.** Console error `Failed to load resource: 404 /favicon.ico` on every navigation.

### Visual character (v0.3.1)

- **Already strongly Linear / Lobste.rs-aligned in restraint:**
  - Monochromatic (black text on white, `neutral-500` for labels, no chromatic accents in evidence on the anonymous home — `#2563eb` lives only in `manifest.json` theme color + PWA icon placeholders).
  - Typography-driven hierarchy: 3xl semibold h1, uppercase tracking-wider `text-xs` section labels (`THIS WEEK`, `RECENT`).
  - Generous whitespace; content occupies <50% of desktop viewport width.
  - Flat bordered cards (no shadows, no hover-elevation evident in CSS classes — `<nav class="grid sm:grid-cols-2">`).
  - No imagery, no avatars, no decoration.

### Anonymous landing (`/home`) — current shape

```
Warsaw AI Community  [Sign in]
Discovery + decisions + ship cadence

THIS WEEK
Nothing scheduled this week — browse all events.

RECENT
No recent activity. — browse projects.

┌─────────────┬─────────────┐
│   Events    │   Meetings  │
├─────────────┼─────────────┤
│   Members   │   Projects  │
├─────────────┼─────────────┤
│       Decisions           │
└───────────────────────────┘
```

Below the 5-card nav, the rest of the viewport is empty. Page total height ≈ 480px in a 800px viewport (60% blank).

### Gaps observed for v0.4 brainstorm

| Gap | Evidence | Question(s) it informs |
|---|---|---|
| No global nav chrome | `/events`, `/meetings`, `/login` are nav-orphans | Q3.1 (global shell) — yes |
| No value proposition for anonymous | `/home` says "Discovery + decisions + ship cadence" — opaque jargon to a Telegram-arrived visitor | Q1.2 (hero+CTA), Q-1.1 (public ambition) |
| No member visibility | Zero avatars, zero names on `/home` — community feels abstract | Q5.2 (avatars), Q5.6 (member profile) |
| No brand mark | Bare text h1 only | Q4.7 (logo direction) |
| No date anchoring | "This week" is conceptual; no "Week of 2026-05-18" | Q5.4 (date format) |
| No favicon | 404 on `/favicon.ico` | trivial fix; in PWA icon work scope |
| Empty page below the fold | 60% blank space on desktop | Q7.2 (above-the-fold composition) |

### Strengths to preserve

- Restraint is intentional and already on-brand-by-default (matches Linear / Lobste.rs / HN).
- Typography hierarchy is clean.
- Empty states are friendly text not error-y boilerplate ("Nothing scheduled this week — browse all events.").
- Mobile collapse of 5-card nav to 1-col works fine.
- `aria-label="Account"` and `aria-label="Sections"` are present (accessibility hygiene).

## Methodology

- `curl -sL --compressed` for HTML structure inspection (saved to `/tmp/v0_3_1-*.html`).
- Playwright MCP (chromium) for visual screenshots, fullPage:true.
- Anonymous session (no cookie). Members-only surfaces (`/members`, `/projects/[slug]`, `/decisions/[slug]`, `/me/edit`, `/this-week`) NOT screenshotted — out of ADR-0012 anonymous read scope.

*Drafted 2026-05-17 in chat-22 pre-brainstorm prep. Source for brainstorm-output sections "Vision" and "Visual language".*
