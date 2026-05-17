# Chat-22 handoff: v0.4 UX/IA brainstorm — organize what's there

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) — operating discipline. Read once at session start.

**Status (drafted in chat-21 prep, before chat-21 has run):** Platform is at v0.3.1 with **14 user-facing surfaces but no cohesive information architecture or visual shell**. Anton's instinct: *"it's just laying on different sub pages."* This chat brainstorms how to **organize the current surfaces into a usable platform** — NOT a redesign or feature expansion. Output feeds a v0.4 spec amendment.

**Scope guardrail:** v0.4 = organize. NOT redesign. NOT new features. The questionnaire below is the constraint — every brainstorm output should map back to one of the questions, all of which fit within "structure the existing 14 surfaces."

---

## Setup

This chat **starts AFTER chat-21 closes** (v0.3.x technical follow-ups complete — at minimum Option A signed-in /home smoke landed in STATE.md). That confirms the v0.3.1 baseline is real before reorganizing on top of it.

```bash
cd "$HOME/Projects/Warsaw AI Comunity"
git fetch
git checkout main && git pull
git log --oneline -8
```

## Read in order (~300 lines)

1. **This handoff** — full read. The questionnaire is the brainstorm input.
2. **Run gstack dogfood first** (see "Pre-brainstorm: capture evidence" below — generates artifacts).
3. `projects/community-platform/STATE.md` — current live state (verify Option A landed).
4. `projects/community-platform/CONSTRAINTS.md` — locked rules that bound visual/IA work.
5. `projects/community-platform/HANDOFF_PROTOCOL.md` — operating discipline.
6. `docs/decisions/0012-community-platform-v0-3-discovery-posture.md` — anonymous-accessible posture is LOCKED; IA may amend but not remove.
7. Memory: `project_community_platform_v0_3_ship.md` — chat-20 outcomes, locked decisions.

**DO NOT** pre-read `v0.3.0-plan.md` or prior brainstorm handoffs. This chat is fresh on UX/IA.

---

## Current platform surfaces (14 user-facing + 2 admin)

Map of routes as of v0.3.1:

**Anonymous-accessible content (per ADR-0012):**
- `/home` — auth-aware feed (v0.3.1 hotfix added header)
- `/this-week` — weekly digest with signed-in overlay
- `/projects` + `/projects/[slug]` — sub-project portfolio
- `/meetings` + `/meetings/[slug]` — weekly meeting notes
- `/events` + `/events/[slug]` — one-off events with RSVP
- `/members` + `/members/[slug]` — member roster
- `/decisions` + `/decisions/[slug]` — ADR index

**Auth flow:**
- `/` (root) — landing variant
- `/login`, `/consent`, `/onboard` + `/onboard/error`, `/no-access`, `/me/edit`

**Admin (out of v0.4 scope):**
- `/admin/health`, `/admin/invite`

14 user-facing surfaces with no shared shell, inconsistent navigation between routes, and no visual hierarchy across detail pages.

---

## Pre-brainstorm: capture evidence with gstack (30 min, BEFORE answering Qs)

Memory will mislead you. Evidence won't. Dogfood the live platform first.

```
Skill(skill="gstack",
      args="dogfood warsaw-ai-community-platform.vercel.app as both anonymous and signed-in. Screenshot: (1) top of every user-facing page (14 routes listed in handoff §'Current platform surfaces'), (2) every nav transition between them, (3) anything that feels inconsistent or 'broken'. Output: 14-screenshot grid saved to docs/research/v0-4-ux-baseline/. Annotate each with one-line friction observation.")
```

Reference screenshots by filename in your brainstorm answers. The cost-floor for "we should change X" is 1 screenshot showing X is broken.

---

## Skill stack for chat-22 + downstream

Recommended sequence (organize-track, NOT redesign-track):

| Chat | Skill | Purpose | Output |
|------|-------|---------|--------|
| chat-22 (pre) | `gstack` | Evidence capture | `docs/research/v0-4-ux-baseline/` screenshots |
| **chat-22** | `superpowers:brainstorming` | Drive questionnaire below | `docs/specs/<date>-community-platform-v0-4-brainstorm-output.md` |
| chat-22 (opt) | `plan-ceo-review` | Only if scope-expansion pressure emerges | Decision recorded in brainstorm output |
| chat-23 | `superpowers:spec-writer` | Turn brainstorm into spec §14 amendment | `v0.4.0-spec.md` section + chat-24 plan-writing handoff |
| chat-23 or chat-24 (opt) | `design-shotgun` | AI visual variants — **only AFTER IA is locked** | Mockup grid for visual decision |
| chat-24 | `superpowers:writing-plans` | Task breakdown | `v0.4.0-plan.md` + impl handoff |
| chat-25+ | `superpowers:test-driven-development` + `design-html` | Implementation | Code |

**Skills NOT to use in chat-22:**
- `frontend-slides` — irrelevant (presentations).
- `feature-dev:feature-dev` — too feature-narrow.
- `design-shotgun` BEFORE IA decision — variants on the wrong surfaces waste tokens.
- `design-html` — that's for finalizing approved designs, not exploring structure.

---

## The questionnaire — 40 questions

Each question is tagged **[blocking]** (must answer in chat-22 to unblock spec) or **[tuning]** (can defer to chat-23 spec stage) or **[locked]** (out of v0.4 scope — confirm only).

Time budget: answer all 9 blocking in 30 min, ~70% of tuning in another 60 min.

---

### Section 0. Foundation (answer FIRST)

**Q0.1 [blocking]** — In **one sentence**, what is the Warsaw AI Community Platform for? Members-only collaboration hub? Public showcase of community work? Both?

**Q0.2 [blocking]** — Rank personas by importance for v0.4 (1 = highest):
- Anonymous visitor (potential member, casual observer)
- Active member (regular meeting attendee, contributor)
- Admin/founder (you + future moderators)

**Q0.3 [tuning]** — What's the success metric for "v0.4 = usable"? (Time-to-find-meeting? Member self-onboards without help? Sub-30s for a returning member to find their next event?)

---

### Section 1. Home & entry

**Q1.1 [blocking]** — `/` (root) vs `/home` — unify into one route, or keep both? If both: what does each do?

**Q1.2 [blocking]** — Anonymous landing — headline + primary CTA? Currently `/home` shows feed for anonymous; should it show a marketing-style hero above-the-fold first?

**Q1.3 [blocking]** — Signed-in `/home` — feed only, dashboard only (upcoming events + recent activity), or both?

**Q1.4 [tuning]** — First-time signed-in experience — explicit onboarding tour in v0.4, or stick with `/consent` → `/onboard` + empty-state hints?

---

### Section 2. Top-level information architecture

**Q2.1 [blocking]** — Top nav items in order, left-to-right. Pick 4-7 (mobile-safe) from: Home / Feed / Calendar / Events / Meetings / Projects / Members / Decisions / This Week / Knowledge Base / About.

**Q2.2 [blocking]** — Events + Meetings — pick one:
- Unify under "Calendar" (chat-21 Option I, merge `/api/calendar.ics` UI)
- Keep split (current; user feedback says they look duplicative)
- Replace both with "Schedule" landing on a unified filterable index

**Q2.3 [blocking]** — Where do Projects, Decisions, This Week live?
- Top nav (compete for 4-7 slots)
- Secondary nav / sub-page of /home
- Footer link only
- Hidden in v0.4 (still accessible by direct URL)

**Q2.4 [tuning]** — User menu location: avatar dropdown top-right (most apps), separate `/me` page (current), or both?

**Q2.5 [tuning]** — Mobile nav: hamburger top-right, bottom tab bar (3-5 items), or both?

**Q2.6 [tuning]** — Anonymous nav differences from signed-in: hide member-only items, gray them out, or show with sign-in prompt on click?

---

### Section 3. Page shell consistency

**Q3.1 [blocking]** — Should every page (anonymous + signed-in) share a global header + footer shell? Currently most pages render bare without consistent chrome.

**Q3.2 [blocking]** — Detail pages (`/projects/[slug]`, `/meetings/[slug]`, `/events/[slug]`, `/members/[slug]`) — same template structure (hero / metadata / body / related), or per-entity custom?

**Q3.3 [tuning]** — Breadcrumbs on detail pages? (e.g., `Home > Projects > GBrain`)

**Q3.4 [tuning]** — Loading states — global top-bar spinner, per-section skeleton, or none (current)?

**Q3.5 [tuning]** — Empty states — illustration + friendly copy, copy only, or none?

---

### Section 4. Visual language

**Q4.1 [blocking]** — Brand identity — does the community have a logo / colors / typography settled (ask Telegram?), or use shadcn+Tailwind defaults in v0.4 and revisit brand in v0.5?

**Q4.2 [blocking]** — Primary brand color — keep #2563eb (current placeholder), pick a new brand color, or go neutral (slate/zinc)?

**Q4.3 [tuning]** — Dark mode in v0.4 or defer?

**Q4.4 [tuning]** — Typography: single font (Inter) or display + body split? Custom or system stack?

**Q4.5 [tuning]** — Card styles for lists: flat / bordered / shadowed / hover-elevated?

---

### Section 5. Component patterns

**Q5.1 [blocking]** — List views (Members, Projects, Meetings, Events) — share **one card component** with content slots, or per-entity custom cards?

**Q5.2 [blocking]** — Avatars — initials (current), photos, or both? If photos: where stored (Gravatar / uploaded / Telegram-sourced)?

**Q5.3 [tuning]** — RSVP / Thanks buttons — fixed location on every applicable page, or contextual?

**Q5.4 [tuning]** — Date/time formatting — relative ("3 days ago") + absolute on hover, absolute-only, or relative-only?

**Q5.5 [tuning]** — Tags/categories visibility — Projects have stage; Meetings have type — surface in list views, detail headers, both, or neither?

---

### Section 6. Anonymous vs signed-in experience

**Q6.1 [blocking]** — How much of `/projects/[slug]`, `/meetings/[slug]`, `/events/[slug]` is anonymous-readable vs sign-in-gated? Currently ALL anonymous-accessible per ADR-0012. Lock or amend?

**Q6.2 [tuning]** — Anonymous CTA on member-content pages — "Sign in to RSVP," "Request invite," "Read more about the community," or none?

**Q6.3 [tuning]** — Anonymous can see `@handles` + names + bios on `/members/[slug]` — keep full reveal, partial (handle + name only), or gate the bio?

---

### Section 7. Content density & hierarchy

**Q7.1 [tuning]** — `/home` feed — chronological (current), prioritized (RSVPs first, then announcements), or filterable?

**Q7.2 [tuning]** — Above-the-fold on `/home` — feed first, upcoming-week strip first, or hero+CTA first (anonymous variant only)?

**Q7.3 [tuning]** — Hero/header on detail pages — full-bleed image, contained image, text-only?

---

### Section 8. Tech & implementation envelope

**Q8.1 [blocking]** — Design system primitives — stick with shadcn/ui only (recommended), or add others (Radix directly, Headless UI, etc.)?

**Q8.2 [tuning]** — Design tokens — Tailwind classes inline (current) or extract to CSS variables for theming?

**Q8.3 [tuning]** — Component organization — colocate per-route in `app/<route>/_components/`, or central `components/` (current)?

**Q8.4 [tuning]** — Storybook — add in v0.4, defer to v0.5, or skip?

---

### Section 9. Scope & rollout

**Q9.1 [blocking]** — v0.4 scope envelope — pick one:
- **Shell + nav only** (smallest — ~10 files, single PR)
- **Shell + nav + detail page template unification** (~20 files)
- **Shell + nav + visual brand pass** (locks brand identity)
- **All of the above** (largest — multi-PR or multi-phase)

**Q9.2 [blocking]** — Brand visual work — happens in v0.4 (single disruption) or v0.5 (after structure is proven)?

**Q9.3 [tuning]** — Migration strategy — feature-flag new shell behind `?ui=v2` or `localStorage.flag`, or hard-cut on merge?

**Q9.4 [tuning]** — Chat sequencing — separate chats for brainstorm → spec → plan (3 chats), or fold spec + plan into one (2 chats)?

**Q9.5 [tuning]** — Single PR for v0.4 or split into v0.4.0 (shell/nav) + v0.4.1 (detail templates) + v0.4.2 (brand visual)?

---

### Section 10. Out-of-scope confirmation ([locked] — confirm only, do not discuss)

**Q10.1 [locked]** — New features (KB, search, notifications, etc.): NOT IN v0.4 SCOPE. Confirm.
**Q10.2 [locked]** — Member acquisition / marketing copy: NOT IN v0.4 SCOPE. Confirm.
**Q10.3 [locked]** — Removing existing routes: only if IA brainstorm reveals an obvious win AND CHANGELOG documents the rationale.
**Q10.4 [locked]** — Backend/data shape changes: NOT IN v0.4 SCOPE. Confirm.

---

## Anti-patterns (chat-22 specific)

- **Don't start chat-22 until chat-21 closes** (at minimum Option A signed-in /home smoke landed in STATE.md).
- **Don't propose features.** Every brainstorm output maps to organization, not addition. If a "feature idea" appears, log it for v0.5 spec backlog and move on.
- **Don't lock visual choices before IA is decided.** Order is structure → visual. Q4.x answers should defer until Q2.x are set.
- **Don't promise SSG preservation** if dynamic shells are needed (auth-aware nav requires `force-dynamic` or `proxy.ts`).
- **Don't expand to full redesign.** The questionnaire is the constraint envelope — if a Q feels outside the 40, that's a signal you're drifting.
- **Don't generate `design-html` outputs in chat-22.** That comes after spec is locked (chat-25+).
- **Don't reopen ADR-0012** (Discovery posture). Anonymous-accessible is locked. v0.4 may amend nav surfacing but not auth-gating.

---

## Done means

- Brainstorm output saved to `docs/specs/<chat-22-date>-community-platform-v0-4-brainstorm-output.md`.
- All **18 [blocking] questions** answered: Q0.1, Q0.2, Q1.1, Q1.2, Q1.3, Q2.1, Q2.2, Q2.3, Q3.1, Q3.2, Q4.1, Q4.2, Q5.1, Q5.2, Q6.1, Q8.1, Q9.1, Q9.2. (Note: answer Q2.x before Q4.x — structure before visual.)
- ≥70% of **[tuning]** Qs answered (the rest defer to chat-23 spec stage).
- Out-of-scope items (Q10.1-Q10.4) confirmed locked.
- Chat-23 handoff drafted at `docs/specs/<chat-22-date>-community-platform-v0-4-spec-writing-handoff.md`.
- ≥1 spec amendment proposed (likely §14 in `community-platform.md` spec).

---

## Reference pointers

- **Production:** https://warsaw-ai-community-platform.vercel.app
- **Latest tag chain:** `community-platform-v0.3.0` → `community-platform-v0.3.1`
- **Chat-21 handoff (precedes this):** `docs/specs/2026-05-17-community-platform-v0-3-shipped-followups-handoff.md`
- **ADR-0012 (locked):** `docs/decisions/0012-community-platform-v0-3-discovery-posture.md`
- **CONSTRAINTS:** `projects/community-platform/CONSTRAINTS.md`
- **GOTCHAS (esp. row 10 tsx prebuild, row 11 Vercel rate-limit):** `projects/community-platform/GOTCHAS.md`
- **Memory snapshots:** `project_community_platform_v0_3_ship.md`, `project_community_platform_v0_3_brainstorm.md` (for tone/template reference)

---

*Drafted 2026-05-17 in chat-21 prep at Anton's instruction, pre-scaffolded for chat-22 (UX/IA brainstorm session). Mirrors chat-13 + chat-19 + chat-21 handoff template structure with brainstorm-specific sections.*

---

## Paste-ready prompt for chat 22

```
Warsaw AI Community Platform — Chat 22: v0.4 UX/IA brainstorm

Status: v0.3.1 SHIPPED in chat-20 (PR #21 → e720268, tag
community-platform-v0.3.1). Chat-21 v0.3.x technical follow-ups
should be CLOSED before this chat starts (verify Option A
signed-in /home smoke landed in STATE.md). Platform is at 14
user-facing surfaces with no cohesive IA — Anton's instinct:
"it's just laying on different sub pages."

v0.4 = ORGANIZE what's there, NOT redesign or feature-add.

Working dir: ~/Projects/Warsaw\ AI\ Comunity/projects/community-platform/
Branch: main (HEAD after chat-21 closeout). Branch off as needed.

Full handoff: docs/specs/2026-05-17-community-platform-v0-4-ux-ia-brainstorm-handoff.md

Read sections in this order:
1. This handoff (full)
2. Run gstack dogfood → screenshots
3. STATE.md (verify Option A landed)
4. CONSTRAINTS.md + HANDOFF_PROTOCOL.md
5. ADR-0012 (locked posture)
6. Memory: project_community_platform_v0_3_ship.md

CRITICAL constraints:
- v0.4 = organize, NOT redesign. Questionnaire (40 Qs) is the
  scope envelope.
- Anonymous-accessible posture per v0.3 charter is LOCKED
  (ADR-0012); IA may amend surfacing but not auth-gating.
- No new features. No backend shape changes. No marketing copy.

Skill sequence:
- Pre-brainstorm: gstack dogfood + screenshots to
  docs/research/v0-4-ux-baseline/
- Brainstorm: superpowers:brainstorming driven by 40 Qs.
- Optional: plan-ceo-review if scope-expansion pressure emerges.
- Output: brainstorm doc saved + chat-23 spec-writing handoff.

Anti-patterns:
- Don't start before chat-21 closes (Option A signed-in smoke).
- Don't propose features — every output maps to organization.
- Don't lock visual (Q4.x) before structure (Q2.x).
- Don't expand to full redesign — questionnaire is the constraint.
- Don't generate design-html in this chat (post-spec).
- Don't reopen ADR-0012.

Token discipline: brainstorm doc ≤500 lines; per-question
answers ≤3 sentences; defer tuning Qs that don't unlock
blocking decisions.

Done means: 18 blocking Qs answered + ≥70% tuning Qs answered
+ chat-23 spec-writing handoff drafted + brainstorm output
saved to docs/specs/<date>-community-platform-v0-4-brainstorm-output.md.
```
