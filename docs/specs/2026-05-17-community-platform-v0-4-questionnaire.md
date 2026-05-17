# Chat-22 brainstorm questionnaire — v0.4 world-class community platform

**Pre-brainstorm input:** `docs/research/v0-4-benchmark-dossier.md` — 12-platform reference.

**Tags:**
- **[blocking]** — must answer in chat-22 to unblock spec (chat-23). 24 total.
- **[tuning]** — can defer to chat-23 spec stage. Mostly visual + content decisions.
- **[locked]** — out of v0.4 scope; confirm only.

**Time budget:** 30 min for the 24 blocking Qs (~75 sec each); ~60 min for tuning. Use the dossier as anchor — many Qs reference specific platform patterns.

**Answer order rule:** Section -1 (vision) and Section 0 (foundation) before Section 2 (IA), before Section 4 (visual). Structure decides surface; surface decides paint.

---

## Section -1: Vision & identity (NEW for world-class scope) — answer FIRST

**Q-1.1 [blocking]** — In **one sentence**, what is the public-facing ambition of the Warsaw AI Community Platform? (Will appear in spec §14 intro, possibly in `/` hero copy.)

**Q-1.2 [blocking]** — Closest character match from the dossier (pick 1 primary + up to 2 accents):
- Lobste.rs (minimalist + tag-first + invite-tree visible)
- Linear (whitespace + restraint + premium-without-shouting)
- PostHog (human-centric + branded voice + radical transparency)
- Luma (event-forward + dual-path + outcome-messaging)
- Read.cv pattern (designer-grade member showcase)
- Hybrid: ____________

**Q-1.3 [blocking]** — Anti-character: name 1-2 platforms from the dossier the Warsaw AI Community Platform is explicitly **NOT** like, with a 1-line reason. (E.g., "Not Circle.so — too SaaS-y, no built-in commerce.")

**Q-1.4 [tuning]** — Brand language axis: where on the spectrum?
- minimalist-monochrome (Linear, Lobste.rs) ←→ branded-playful (PostHog hedgehog)

---

## Section 0: Foundation

**Q0.1 [blocking]** — Internal purpose (1 sentence): is the platform a **members-only collaboration hub**, **public showcase of community work**, or **both, weighted toward X**?

**Q0.2 [blocking]** — Personas ranked by importance for v0.4 (1 = highest):
- Anonymous visitor (potential member, recruiter, casual observer)
- Active member (regular meeting attendee, contributor)
- Admin/founder (Anton + future moderators)

**Q0.3 [tuning]** — Success metrics — pick 2-3:
- Time-to-find-next-meeting for a returning member
- Anonymous → applies-to-join conversion
- Member retention (meetings attended per month)
- Public profile reach (Search-visibility / inbound recruiting)

**Q0.4 [blocking] (NEW for world-class scope)** — Bilingual EN/PL — pick one:
- EN-first in v0.4 (PL added v0.5+)
- PL-first in v0.4 (EN added v0.5+)
- Both at v0.4 (`/` redirects by browser locale; `/en/`, `/pl/` routes; ~2x copy work)
- EN-only forever (assume audience is EN-fluent)

**Q0.5 [blocking] (NEW)** — Public face vs member face — pick one:
- **Same site, different routes** (current — `/home` anonymous, `/this-week` member-overlay)
- **Same site, different chrome** (anonymous sees marketing landing at `/`; signed-in sees dashboard at `/`)
- **Different sites** (e.g., `warsawai.com` public marketing, `app.warsawai.com` member platform) — out of scope for v0.4 probably

---

## Section 1: Home & entry

**Q1.1 [blocking]** — `/` (root) vs `/home` — pick one:
- Unify into `/` (most apps; cleanest URL)
- Unify into `/home` (`/` becomes a redirect)
- Keep both with different jobs (`/` marketing-style; `/home` feed) — specify the split

**Q1.2 [blocking]** — Anonymous landing — hero+CTA, feed-first, or hybrid?
- Hero + CTA above the fold (Luma-style "Delightful events start here"; feed below)
- Feed-first (current v0.3.1; HN-style minimalism)
- Hybrid (compact hero strip + feed below — most common pattern)

**Q1.3 [blocking]** — Signed-in `/home` — feed only, dashboard only (upcoming events + recent activity + next meeting), or both stacked?

**Q1.4 [tuning]** — First-time signed-in experience — onboarding tour added in v0.4, or stick with existing `/consent` → `/onboard` flow + empty-state hints?

**Q1.5 [tuning] (NEW)** — Anonymous discovery surface — equivalent of Luma's `/discover`. Where do potential members land if they Google "Warsaw AI community" and click around?
- `/home` itself (combine feed + discovery)
- Dedicated `/discover` route
- `/projects` or `/members` (showcase-led discovery)

---

## Section 2: Information architecture

**Q2.1 [blocking]** — Top nav items in order, left-to-right. Pick 4-7 (mobile-safe) from:
Home / Feed / Calendar / Events / Meetings / Projects / Members / Decisions / This Week / Knowledge / About / Search

**Q2.2 [blocking]** — Events + Meetings — pick one:
- Unify under "Calendar" (chat-21 Option I, merge `/api/calendar.ics` UI; matches Luma single-event-stream model)
- Replace both with "Schedule" landing on unified filterable index
- Keep split (current; chat-20 critique said they look duplicative)

**Q2.3 [blocking]** — Where do Projects, Decisions, This Week live?
- Top nav (compete for 4-7 slots from Q2.1)
- Secondary nav / sub-page of /home
- Footer link only
- Hidden in v0.4 (still URL-accessible)

**Q2.4 [tuning]** — User menu location: avatar dropdown top-right (most apps), separate `/me` page (current), or both?

**Q2.5 [tuning]** — Mobile nav style: hamburger top-right, bottom tab bar (3-5 items), or both?

**Q2.6 [tuning]** — Anonymous nav differences from signed-in: hide member-only items, gray them out, or show with sign-in prompt on click?

**Q2.7 [blocking] (NEW)** — Search — where does it live, what does it index?
- Top-nav search-box (always visible, opens command palette)
- Dedicated `/search` page only (lower priority)
- No search in v0.4 (defer to v0.5; rely on nav + browse)

Index scope (if yes): meetings + events + projects + decisions + members? GBrain-powered (semantic) or string-match? Anonymous searchable or sign-in-gated?

---

## Section 3: Page shell consistency

**Q3.1 [blocking]** — Should every page share a global header + footer shell? Currently most pages render bare without consistent chrome.

**Q3.2 [blocking]** — Detail pages (`/projects/[slug]`, `/meetings/[slug]`, `/events/[slug]`, `/members/[slug]`, `/decisions/[slug]`) — same template (hero / metadata / body / related), or per-entity custom?

**Q3.3 [tuning]** — Breadcrumbs on detail pages? (e.g., `Home > Projects > GBrain`)

**Q3.4 [tuning]** — Loading states — global top-bar spinner, per-section skeleton, or none?

**Q3.5 [tuning]** — Empty states — illustration + friendly copy, copy only, or none?

---

## Section 4: Visual language

**Q4.1 [blocking]** — Brand identity — does the community have a logo / colors / typography settled (ask Telegram?), or use shadcn+Tailwind defaults in v0.4 and revisit brand identity in v0.5?

**Q4.2 [blocking]** — Primary brand color — keep #2563eb (placeholder), pick a new color (specify), or go neutral monochromatic (Linear-style)?

**Q4.3 [tuning]** — Dark mode in v0.4 or defer?

**Q4.4 [tuning]** — Typography — single font (Inter?) or display + body split? Custom or system stack?

**Q4.5 [tuning]** — Card styles for lists: flat / bordered / shadowed / hover-elevated?

**Q4.6 [tuning] (NEW)** — Imagery posture — Linear "functional imagery" (screenshots, data viz only), PostHog "custom illustrations" (mascot, illustrated states), or Lobste.rs "no imagery" (text only)?

**Q4.7 [tuning] (NEW)** — Logo direction — wordmark only ("Warsaw AI"), mark only (geometric/symbolic), or wordmark + mark? Crowdsource from Telegram or design it?

**Q4.8 [tuning] (NEW)** — Accent color usage — where does it appear? Pick all that apply: CTAs / links / tags / current-page nav state / hover states / focus rings.

---

## Section 5: Component patterns

**Q5.1 [blocking]** — List views (Members, Projects, Meetings, Events, Decisions) — share **one card component** with content slots, or per-entity custom cards?

**Q5.2 [blocking]** — Avatars — initials (current), photos, or both? If photos: where stored (Gravatar / Vercel-uploaded / Telegram-sourced)?

**Q5.3 [tuning]** — RSVP / Thanks buttons — fixed location on every applicable page, or contextual?

**Q5.4 [tuning]** — Date/time formatting — relative ("3 days ago") + absolute on hover, absolute-only, or relative-only?

**Q5.5 [tuning]** — Tags/categories visibility — Projects have stage; Meetings have type — surface in list views, detail headers, both, or neither?

**Q5.6 [blocking] (NEW)** — Member profile structure (`/members/[slug]`) — pick the closest:
- Read.cv-style canvas (CV-as-content, work showcase, sparse social signals)
- PostHog-style spotlight (team-page format, photo + bio + role)
- LinkedIn-style résumé (formal, sectioned)
- Lobste.rs-style minimal (handle + bio + activity feed only)

**Q5.7 [blocking] (NEW)** — Event detail page (`/events/[slug]`) — Luma-style outcome-focused (big visual + RSVP CTA + minimal copy) or generic doc-page (heading + body + metadata sidebar)?

**Q5.8 [tuning] (NEW)** — Project detail page (`/projects/[slug]`) — portfolio-style (visual showcase + outcomes + team) or README-style (current; markdown body + frontmatter metadata)?

---

## Section 6: Anonymous vs signed-in experience

**Q6.1 [blocking]** — How much of `/projects/[slug]`, `/meetings/[slug]`, `/events/[slug]` is anonymous-readable vs sign-in-gated? Currently ALL are anonymous per ADR-0012. Lock or amend?

**Q6.2 [tuning]** — Anonymous CTA on member-content pages — "Sign in to RSVP," "Request invite," "Read more about the community," or none?

**Q6.3 [tuning]** — Anonymous can see `@handles` + names + bios on `/members/[slug]` — full reveal (current), partial (handle + name only), or gate the bio?

**Q6.4 [tuning] (NEW)** — Anonymous can read decisions/ADRs (`/decisions/[slug]`) — keep open or sign-in gate? (Bias to open: ADRs are the community's governance memory; gating implies secrets.)

**Q6.5 [tuning] (NEW)** — Anonymous RSVP — allow via magic-link email confirm, or require sign-in first? (Luma allows; most invite-only communities don't.)

---

## Section 7: Content density & hierarchy

**Q7.1 [tuning]** — `/home` feed order — chronological (current), prioritized (RSVPs first, then announcements), or filterable by content type?

**Q7.2 [tuning]** — Above-the-fold on `/home` — feed first, upcoming-week strip first, or hero+CTA first (anonymous variant only)?

**Q7.3 [tuning]** — Hero/header on detail pages — full-bleed image, contained image, text-only?

---

## Section 8: Tech & implementation envelope

**Q8.1 [blocking]** — Design system primitives — stick with shadcn/ui only (recommended), or add Radix directly / Headless UI / other?

**Q8.2 [tuning]** — Design tokens — Tailwind classes inline (current) or extract to CSS variables for theming (enables dark mode + brand swaps)?

**Q8.3 [tuning]** — Component organization — colocate per-route in `app/<route>/_components/`, or central `components/` (current)?

**Q8.4 [tuning]** — Storybook — add in v0.4, defer to v0.5, or skip?

**Q8.5 [tuning] (NEW)** — Image hosting — Vercel Image (`<Image>` from `next/image`), Cloudinary, or self-host static files? (Bias to next/image — already configured.)

**Q8.6 [blocking] (NEW)** — i18n approach if Q0.4 = bilingual — `next-intl`, server-side locale detection, manual route prefixes, or other?

---

## Section 9: Cross-cutting concerns (NEW for world-class scope)

**Q9.1 [blocking]** — Accessibility (a11y) target — WCAG 2.1 AA across the strict-list? Or AAA where feasible? (Bias: AA, with keyboard nav + visible focus rings + 4.5:1 contrast on text.)

**Q9.2 [tuning]** — Performance budget — LCP <2.5s, CLS <0.1, TTI <3s on 4G? Or per-page targets?

**Q9.3 [tuning]** — GDPR / EU-DSA posture — explicit in spec or implicit in design? (Current: consent gate for member content; opt-in roster. v0.4 may need cookie banner if analytics added.)

**Q9.4 [tuning]** — Analytics — Posthog (community-aligned), Plausible (lightweight), Vercel Analytics (built-in), or none?

**Q9.5 [tuning]** — RSS / Atom feeds — for `/meetings`, `/events`, `/decisions`, `/projects`? Costs ~0, signal to developer-audience high.

---

## Section 10: Scope & rollout

**Q10.1 [blocking]** — v0.4 scope envelope — pick one:
- **Phase A only (shell + nav + IA):** smallest — ~15 files, single PR, 1-2 wks CC-time
- **Phase A + B (shell + nav + detail page templates unified):** ~30 files, 2-3 wks
- **Phase A + B + C (shell + nav + detail templates + brand visual pass):** ~45 files, locks brand identity, 3-4 wks
- **Phase A + B + C + D (everything + search + member showcase upgrade):** largest, multi-phase, ~4-6 wks

**Q10.2 [blocking]** — Brand visual work — happens in v0.4 (single disruption) or v0.5 (after structure proven)?

**Q10.3 [tuning]** — Migration strategy — feature-flag new shell behind `?ui=v2` or `localStorage.flag`, or hard-cut on merge?

**Q10.4 [tuning]** — Chat sequencing for v0.4 — separate brainstorm/spec/plan chats (3 chats), or fold spec + plan into one (2 chats)?

**Q10.5 [tuning]** — Single PR for v0.4 or split into v0.4.0 (shell/nav) + v0.4.1 (detail templates) + v0.4.2 (brand visual) + v0.4.3 (search)?

---

## Section 11: Out-of-scope confirmation [locked] — confirm only

**Q11.1 [locked]** — Payments / commerce / subscriptions — NOT in v0.4 scope.
**Q11.2 [locked]** — Built-in KB / Q&A feature — NOT in v0.4 (GBrain's job, separate sub-project).
**Q11.3 [locked]** — Removing existing routes — only if IA brainstorm reveals an obvious win AND CHANGELOG documents rationale.
**Q11.4 [locked]** — Backend / data shape changes — NOT in v0.4 (no schema migrations; frontmatter format stable).
**Q11.5 [locked]** — Native iOS/Android apps — NOT in v0.4 (web-only; mobile-web responsive only).
**Q11.6 [locked]** — Real-time messaging / DMs — NOT in v0.4 (Telegram is the primary conversation channel; ADR-required to change).

---

## Blocking-question checklist (24 total — answer all before chat-23 spec-write)

- [ ] Q-1.1 (public ambition sentence)
- [ ] Q-1.2 (character match)
- [ ] Q-1.3 (anti-character)
- [ ] Q0.1 (internal purpose)
- [ ] Q0.2 (personas ranked)
- [ ] Q0.4 (bilingual posture)
- [ ] Q0.5 (public vs member face)
- [ ] Q1.1 (root vs home)
- [ ] Q1.2 (anonymous landing)
- [ ] Q1.3 (signed-in /home)
- [ ] Q2.1 (top nav items)
- [ ] Q2.2 (events+meetings unify)
- [ ] Q2.3 (projects/decisions/this-week placement)
- [ ] Q2.7 (search posture)
- [ ] Q3.1 (global shell)
- [ ] Q3.2 (detail page templates unified)
- [ ] Q4.1 (brand identity status)
- [ ] Q4.2 (primary color)
- [ ] Q5.1 (shared list card component)
- [ ] Q5.2 (avatars)
- [ ] Q5.6 (member profile structure)
- [ ] Q5.7 (event detail page style)
- [ ] Q6.1 (anonymous-readable scope)
- [ ] Q8.1 (design system primitives)
- [ ] Q8.6 (i18n approach if bilingual)
- [ ] Q9.1 (a11y target)
- [ ] Q10.1 (v0.4 scope envelope)
- [ ] Q10.2 (brand work in v0.4 or v0.5)

Wait — 28 items listed, header said 24. Recount on chat-22 entry: there are 28 [blocking] tagged questions. (Q-1 section adds 3; Q0 has 4 blocking; Q1 has 3; Q2 has 4; Q3 has 2; Q4 has 2; Q5 has 4; Q6 has 1; Q8 has 2; Q9 has 1; Q10 has 2 = 28.) Updated count: **28 blocking**.

---

*Drafted 2026-05-17 alongside chat-22 handoff and benchmark dossier. Reflects SCOPE EXPANSION mode locked via `plan-ceo-review` after Anton escalated v0.4 from "organize" to "world-class community platform."*
