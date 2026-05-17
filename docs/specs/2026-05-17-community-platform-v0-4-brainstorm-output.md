# Chat-22 brainstorm output — community-platform v0.4 "world-class community platform"

**Date:** 2026-05-17
**Chat:** 22 (v0.4 brainstorm — `superpowers:brainstorming`)
**Branch:** drafted on `main` (chat-21 chain head `e2faeea`)
**Inputs:**
- `docs/specs/2026-05-17-community-platform-v0-4-ux-ia-brainstorm-handoff.md`
- `docs/research/v0-4-benchmark-dossier.md` (12-platform reference)
- `docs/specs/2026-05-17-community-platform-v0-4-questionnaire.md` (28 blocking + 38 tuning Qs)
- `docs/research/v0-4-ux-baseline/` (5 v0.3.1 production screenshots + README)
- `docs/decisions/0012-community-platform-v0-3-discovery-posture.md` (LOCKED)
- `projects/community-platform/{STATE,CONSTRAINTS,HANDOFF_PROTOCOL}.md`

**Output:** Anton-locked decisions + rationale + ADR candidate + scope envelope + v0.5+ deferrals + chat-23 open questions.

**NOT in this doc:** the spec §14 itself (chat-23 owns), wireframes (chat-23 `design-shotgun`), the implementation plan (chat-24).

**Authorship note:** every blocking decision below is Anton-locked via interactive review in chat-22. Where Anton's lock differed from the brainstorming default, the "Why" line cites the reasoning Anton supplied.

---

## 0. Executive summary

**v0.4 thesis:** Lift v0.3.1's already-restrained text-first surface into a community platform with a warmer, more transparent identity by adding:

1. **Global navigation shell** (header + footer everywhere except `/login`) — closes the v0.3.1 orphan-page gap.
2. **Anonymous `/` landing** with hero + dual CTA (Sign in / Join Telegram) + next-event ribbon (currently `/` 307→`/login`).
3. **`/handbook` top-nav slot** — anchor for community charter + roadmap + future strategic surfaces (Skills+Tools+Reps directory, Academy, GBrain Q&A — placement TBD).
4. **`/calendar` unified events + meetings index** (preserves old URLs).
5. **Token-based CSS variable system** + warm amber accent (`~#f59e0b`) + wordmark (`Warsaw AI` in Inter Semibold).
6. **CI slug-folder integrity check (H68)** + PWA icon regeneration (warm amber replaces cool blue).

**Character lock:** PostHog primary + Linear accent + Claude/Notion accents. NOT dev.to (cluttered feeds) + NOT Slack-as-chat-replacement (Telegram stays the chat layer).

**Scope envelope (Q10.1):** **Phase A COMMITTED** as v0.4.0; Phase B (detail-page upgrades) and Phase C (full brand + RSS + illustrations) are **CONDITIONAL** on Phase A user-test feedback. Total v0.4 timeline: 2.5-4 wks CC-time.

**One latent ADR (chat-23 to write):**
- **ADR-0014** — `/` flips to anonymous-public with hero+CTA landing; signed-in `/` 302→`/home`.

**No ADR-0013** — Q6.1 locked A1 (`/decisions` stays GATED per Anton's "hide all possible PII" posture). The proposed `/decisions` flip is deferred to v0.5+ subject to a PII audit.

**Hardening candidates (H56–H62 + H64–H68 = 12 net):** see §15.

**Mandatory chat-23 deliverable** (per office-hours sharpening): a **30-min user-test session** with 2 existing Telegram members + 1 prospective member BEFORE locking spec §14.

**v0.5+ deferred (substantial list):** dark mode, search/cmd-K with GBrain integration, member directory anonymous flip, project detail anonymous flip, `/decisions` anonymous flip (post PII audit), native apps, real-time messaging, Polish localization, full brand identity (logo mark + illustrations + motion), Storybook, analytics, profile photo upload UI, Personas v2 (external repos + own pages + sharing + refresh), Community Skills+Tools+Reps directory, Academy linking, AI moderation/onboarding agents.

---

## 1. Vision & identity (Section -1 answers)

### Q-1.1 [blocking] — Public ambition sentence — LOCKED

> **"Where Warsaw's AI builders learn, ship, and find each other."**

**Why this sentence:**
- Three verbs map to platform surfaces: *learn* → `/calendar` (meetings + events); *ship* → `/projects`; *find each other* → `/members` + activity in `/home` feed.
- Outcome-first, avoids self-aggrandizing "best/world-class" copy.
- "Warsaw" anchors identity; "AI builders" filters audience.
- Localizes cleanly to PL in v0.5+.

**Hero copy implementation note:** because `/members` is gated (Q6.1 lock), the "find each other" promise is sign-in-gated. The `/` hero pairs this with a dual CTA — primary `[Sign in with GitHub]` + secondary `[Join Telegram →]` — so the promise has visible paths to fulfillment.

**Where the sentence appears in v0.4:**
- Spec §14 intro (chat-23 frames around it).
- `/` hero primary headline.
- README.md description.
- OG `<meta>` description on anonymous-readable pages.

**NOT this sentence in v0.4:**
- Footer slogan (footer stays terse — `© 2026 Warsaw AI Community · MIT-licensed`).
- Subtitle on signed-in `/home` (members don't need re-pitching).

### Q-1.2 [blocking] — Character match — LOCKED

> **PostHog primary + Linear accent + Claude/Notion accents. NOT Lobste.rs.**

**What each contributes to v0.4 surfaces:**

| Element | PostHog primary | Linear accent | Claude/Notion accents |
|---|---|---|---|
| Voice / copy | Warm, branded, opinionated empty states | Crisp short sentences | Conversational ("If you've never been to a sync, here's what to expect") |
| Color | Branded palette (warm, not cold corporate) | One accent + generous whitespace | Warm grays + soft accents |
| Typography | Identifiable display + body | Single typeface, generous spacing | Editorial moments allowed (serif option, deferred to v0.5) |
| Imagery | Custom illustrations OK (1-2 v0.4 touches) | Functional screenshots | Simple line drawings for empty states |
| Layout density | Editorial — content can breathe | Generous whitespace, no clutter | Block-based composition |
| Member profile | "Team page" feel (Q5.6 lock) | Whitespace around showcase | Editorial bio formatting |
| Empty states | Friendly + on-brand ("No meetings yet — the next sync is Wednesday 18:30") | Crisp | Helpful + occasionally illustrated |

**Downstream impact on visual decisions:**
- Q4.1 (brand status) → light brand work in v0.4 (not shadcn defaults).
- Q4.2 (primary color) → warm amber `~#f59e0b` (not cool blue `#2563eb`).
- Q4.6 (imagery posture) → functional imagery + 1-2 line-drawing illustrated touches for empty states.
- Q4.7 (logo) → wordmark only (`Warsaw AI` in Inter Semibold).

### Q-1.3 [blocking] — Anti-character — LOCKED

> **NOT dev.to + NOT Slack-as-chat-replacement.**

**What "NOT dev.to" rules out:**
- Cluttered feed with multiple competing CTAs.
- "🔥 trending" engagement bait.
- Banner-stacking.
- Density over breathing room.

**What "NOT Slack-as-chat-replacement" rules out:**
- Real-time messaging built into the platform.
- Channels-and-threads UX inside community-platform.
- Telegram-replacement ambitions.

**What we explicitly DO NOT anti-frame against (per Anton's long-term ambitions):**
- AI moderation/onboarding/support bots — v0.5+ candidate; do not rule out.
- Marketplace of skills/reps/tools — v0.5+ candidate; do not rule out.
- Internal + external Academy linking — v0.5+ candidate; do not rule out.
- Reasonable retention mechanics (non-manipulative) — v0.5+ candidate; do not rule out.

### Q-1.4 [tuning] — Brand language axis — LOCKED

> **~60% PostHog warmth + ~25% Linear restraint + ~15% Claude/Notion editorial softness.**

The 60% PostHog warmth lives in: branded voice, warm color palette, optional illustrations, "team page" member profile, public handbook posture. The 25% Linear restraint lives in: whitespace, typography hierarchy, generous spacing. The 15% Claude/Notion editorial softness lives in: conversational copy on first-time empty states, optional line-drawings, block-based composition on `/handbook`.

NO mascot in v0.4. NO playful copy on system error messages.

---

## 2. Foundation (Section 0 answers)

### Q0.1 [blocking] — Internal purpose — LOCKED

> **Both, weighted toward members-only collaboration hub + honest discovery surface.**

Codifies ADR-0012 + amends with ADR-0014 (`/` flip). Discovery surfaces (`/`, `/home`, `/calendar`, `/events/[slug]`, `/meetings/[slug]`, `/handbook`, `/api/calendar.ics`) are public. Write surfaces (`/me/edit`, `/this-week`, RSVPs, Kudos) + member directory + projects + decisions are members-only.

### Q0.2 [blocking] — Personas ranked — LOCKED

| Rank | Persona | Reason | v0.4 surface budget |
|---|---|---|---|
| 1 | **Active member** | Pays attention costs weekly; retention = community health | ~60% — signed-in /home dashboard, /this-week, RSVP UX, persona-aware member showcase |
| 2 | **Anonymous visitor** | The next member; bouncing on `/` = no community growth | ~30% — `/` hero, `/home` discovery, `/calendar`, `/events/[slug]`, `/handbook` |
| 3 | **Admin/founder** (Anton + future moderators) | Rare distinct surface; `/admin/health` preserved | ~10% — no v0.4 admin redesign |

### Q0.3 [tuning] — Success metrics — LOCKED

> **Pick 2 + 1 deferred:**
> 1. **Member retention** — meetings RSVPed-and-attended per active member per month. Primary leading indicator.
> 2. **Anonymous → applies-to-join conversion** — measured via Telegram invite ledger.
> 3. *(Deferred to v0.5+ when analytics lands)* Time-to-find-next-meeting for a returning member.

### Q0.4 [blocking] — Bilingual posture — LOCKED

> **EN-only in v0.4. PL added v0.5+.**

Telegram conversation + GitHub README/ADR archive are already English. Warsaw AI scene's working language is English. PL adds ~2× content cost for marginal first-90-days gain. Polish-first speakers in the technical niche are reliably EN-fluent. i18n *structure* (Q8.6) scaffolds in v0.4; *translations* land v0.5+.

### Q0.5 [blocking] — Public face vs member face — LOCKED

> **Same site, different chrome.**

`/` (anonymous) = marketing-leaning hero landing. `/home` (anonymous + signed-in) = discovery feed. Signed-in `/` → 302 → `/home`. Both share global header/footer; body composition differs by route + auth state.

NOT a separate `app.warsawai.com` site. One Vercel project, one origin, one auth context.

---

## 3. Home & entry (Section 1 answers)

### Q1.1 [blocking] — `/` vs `/home` — LOCKED

> **Keep both with different jobs in v0.4. Consolidate to `/home` (with `/` retiring or simplifying) in v0.5+ if the dual-route pattern doesn't earn its keep.**

Mechanics:
- Anonymous GET `/` → 200, hero+CTA template (NEW v0.4, requires ADR-0014).
- Signed-in GET `/` → 302 → `/home`.
- Either user GET `/home` → 200, discovery feed (signed-in adds dashboard).

### Q1.2 [blocking] — Anonymous landing layout — LOCKED

> **Hybrid: editorial hero strip + feed below (Notion-style marketing-page composition).**

Hero strip (~360-480px tall on desktop, ~520px on mobile):
- Wordmark (top-left, links to `/`)
- Value prop (Q-1.1 sentence) — large display type
- Sub-line: "Member-led. Meets weekly in Warsaw. Free. Open-source platform."
- Dual CTA: **[Sign in with GitHub]** (primary) + **[Join Telegram →]** (secondary, links to Telegram invite URL — chat-23 locks the exact link)
- Next-event ribbon (right-aligned): "Next: Wed May 21 · 18:30 — RSVP →" linking to `/events/<slug>`
- One illustrated touch (Notion-style line drawing) — placement chat-23 design-shotgun decides

Below hero:
- "This week" strip (current v0.3.1 component)
- "Recent activity" strip (last 5 status post excerpts; ADR-0012 D7 public excerpts)
- 5-card section nav (Events/Meetings/Members/Projects/Decisions; clicking gated routes triggers sign-in on destination)
- Footer

### Q1.3 [blocking] — Signed-in `/home` composition — LOCKED

> **Both stacked: dashboard pane first, feed below.**

Dashboard pane "Your week" (~120-160px tall, above-the-fold on most viewports):
- "Your week" label (small caps, neutral-500)
- Next RSVP commitment ("You're going to Wed 5/21 → Add to calendar / Cancel")
- Status compose CTA ("Post an update → /this-week")
- Optional: kudos given/received count this week
- Passive surface — no streak counter, no notifications, no "you missed 2 weeks" guilt-tripping (per §14B manipulation-audit hardening)

Below the dashboard: the existing discovery feed component, same as anonymous `/home`.

### Q1.4 [tuning] — Onboarding — LOCKED

> **Keep current `/consent` + `/onboard` flow. NO tour in v0.4. Add better EMPTY-STATE hints on `/home` for first-time-signed-in members.**

Hint examples:
- "Welcome — your profile is at /me/edit. Add a one-line bio."
- "Nothing scheduled this week. The next weekly meeting is Wednesday at 18:30."
- "No status posts yet — be the first this week."

### Q1.5 [tuning] — Anonymous discovery surface — LOCKED

> **`/home` is the anonymous discovery feed. No separate `/discover` route.**

`/` handles marketing; `/home` handles discovery. Two URLs, two jobs. Adding `/discover` would create three landings and split SEO.

---

## 4. Information architecture (Section 2 answers)

### Q2.1 [blocking] — Top nav items — LOCKED

> **5 items, left-to-right: Home / Calendar / Projects / Members / Handbook.**

Anonymous + signed-in see all 5; gated routes (Projects, Members) trigger sign-in flow on destination page (Q2.6 tuning). About → footer. This-Week → folded into signed-in `/home` dashboard. Search → v0.5+ (Q2.7).

**Mobile (390px viewport):** 5 items at ~58-78px per slot + avatar/Sign-in slot. Tight but mobile-safe.

### Q2.2 [blocking] — Events + Meetings — LOCKED

> **Unify under `/calendar` (NEW top-nav target). Preserve `/events` + `/meetings` as URL-accessible aliases (no 301).**

`/calendar`:
- Top filter chips: All / Events / Meetings
- Default view: chronological merge of upcoming meetings + events
- Past section: collapsible "Show past" toggle
- Subscribe-to-calendar button (same `/api/calendar.ics` data source, unchanged)

`/events` and `/meetings` indexes:
- Stay live as filtered views (not in nav).
- Old bookmarks + ICS-subscribers continue working.
- Detail pages stay canonical at `/events/[slug]` and `/meetings/[slug]`.

### Q2.3 [blocking] — Projects / Decisions / This-Week placement — LOCKED

> **Handbook (top nav) holds community-wide governance pointers; per-project Decisions section on `/projects/[slug]` (gated); This-Week folded into signed-in `/home` dashboard.**

`/handbook` content (v0.4 — see Q6.1 (i) lock for the constraint):
- Community charter pointer (links to `community/charter/charter.md` content)
- Roadmap pointer (chat-23 resolves: link `PROJECTS.md` or a new `roadmap.md`)
- "Decisions are kept in the public git repo at github.com/.../docs/decisions" external link — NOT surfaced via platform UI in v0.4
- Clearly-marked v0.5+ placeholders for "Community Skills · Academy · Ask GBrain" with TBD-placement caveat

Per-project Decisions section (`/projects/[slug]`, gated):
- Each project's page surfaces its scoped ADRs in a "Decisions" subsection
- Pulls from `docs/decisions/*.md` matched on frontmatter `project:` field (chat-23 resolves data model)
- Future GitHub-API integration for live pull-through (post-v0.4)

This-Week:
- URL `/this-week` stays accessible (members-only, no change)
- Top-nav slot NOT used (folded into signed-in `/home` dashboard "Your week" pane)

### Q2.4 [tuning] — User menu — LOCKED

> **Avatar dropdown top-right** (signed-in). Anonymous shows `[Sign in]` button in the same slot.

Dropdown items: handle (with `@`) → "Your week" (→ /this-week) → "Edit profile" (→ /me/edit) → "Sign out". 4 items max.

### Q2.5 [tuning] — Mobile nav — LOCKED

> **Hamburger top-right (slide-in panel).** No bottom tab bar.

### Q2.6 [tuning] — Anonymous nav differences — LOCKED

> **Show all 5 nav items; clicking gated routes triggers sign-in prompt on the destination page (NOT in nav).**

Don't gray out (looks broken). Don't hide (loses discoverability).

### Q2.7 [blocking] — Search — LOCKED

> **No search in v0.4. Defer to v0.5+ with cmd-K command palette + GBrain semantic search.**

Catalog by v0.4 ship is ~12 events / ~6 meetings / ~3 projects / ~12 ADRs — browse > search at this scale. cmd-K + GBrain is the target.

---

## 5. Page shell consistency (Section 3 answers)

### Q3.1 [blocking] — Global header + footer shell — LOCKED

> **YES — every page except `/login` ships the same global header + footer.**

**Global header (`<Header>` component):**
- Left: wordmark `Warsaw AI` (Q-1.2 + Q4.7 lock) → links to `/`
- Center: 5-item top nav (Home / Calendar / Projects / Members / Handbook)
- Right: avatar dropdown (signed-in) OR `[Sign in]` button (anonymous)
- Mobile: wordmark left + hamburger right; slide-in nav.

**Global footer (`<Footer>` component):**
- Left: `© 2026 Warsaw AI Community · MIT-licensed` + link to GitHub repo
- Center: `About · Telegram · RSS · Subscribe to calendar`
- Right: language switcher slot (v0.5+ — empty in v0.4)
- Compact: ~80px tall on desktop, ~140px on mobile (wraps).

**Exception:** `/login` is distraction-free auth — no header, no footer (current v0.3.1 pattern preserved).

### Q3.2 [blocking] — Detail page templates — LOCKED (Phase B target state)

> **3 variants share the global shell. v0.4 Phase A wraps existing v0.3 detail templates in the new shell; Phase B upgrades to the 3-variant family.**

| Variant | Routes | Composition |
|---|---|---|
| **A — content-led** | `/projects/[slug]`, `/decisions/[slug]` | Title + meta strip + markdown body + sidebar |
| **B — event-led** | `/events/[slug]`, `/meetings/[slug]` | Hero with date/time/location + RSVP CTA + roster strip + agenda/notes body + sidebar |
| **C — person-led** | `/members/[slug]` | Photo + name + handle + role + bio body + Working-on + (Persona links — Personas v2 is v0.5+) |

**Phase A ship reality:** existing v0.3 detail templates remain content-wise; only the OUTER shell (global header + footer) wraps them. Phase B activates the unified template family if user-test validates.

### Q3.3 [tuning] — Breadcrumbs — LOCKED

> **NO breadcrumbs in v0.4.**

IA is 2 levels deep (index → detail); breadcrumbs add ink for low value. Reconsider in v0.5+ if 3rd level emerges.

### Q3.4 [tuning] — Loading states — LOCKED

> **Skeleton placeholders on long lists (>5 items). No top-bar spinner.**

Most surfaces are SSG/SSR. Inline skeletons for client-side data.

### Q3.5 [tuning] — Empty states — LOCKED

> **Copy only (Linear-style). No illustrations as empty-state default. Optional 1-2 illustrated touches across the whole platform for first-impression surfaces — chat-23 design-shotgun decides where.**

Examples:
- `/calendar`: "No upcoming events. The next weekly meeting is Wednesday at 18:30."
- `/decisions` (gated): "No decisions yet. ADRs land in docs/decisions/ as they get written."
- `/projects` (gated): "Member projects appear here as they get added."

Always offer a next action OR a calibration ("next thing is X").

---

## 6. Visual language (Section 4 answers)

### Q4.1 [blocking] — Brand identity status — LOCKED

> **Light brand work in v0.4 (Phase A): wordmark + warm accent palette + token system + 1-2 illustrated touches for first-impression surfaces. Full brand identity (mascot/character + illustration system + extended palette + custom motion) → v0.5+.**

v0.4 Phase A brand work:
- **Wordmark** — `Warsaw AI` set in Inter Semibold (Q4.7 lock).
- **Accent ramp** — warm amber CSS variable system (`--color-accent-50` through `--color-accent-900`; Q4.2 lock).
- **Token extraction** — CSS variables in `app/globals.css` referenced by Tailwind config (Q8.2 lock).
- **PWA icons** — regenerated as `WA` initials on `#f59e0b` square (replaces current `#2563eb` placeholders).
- **1-2 illustrated touches** — placement chat-23 design-shotgun decides; restrained Notion-style line drawings only.

v0.5+ brand work (deferred):
- Logo mark (geometric/symbolic — designed inline, crowdsourced, or commissioned).
- Custom motion (focus-ring fade-in, nav-link underline transition).
- Extended palette (semantic colors: success/warning/danger).
- Mascot/character (PostHog hedgehog inspiration, if community wants one).
- Illustration system if 1-2 touches expand to a full set.

### Q4.2 [blocking] — Primary accent color — LOCKED

> **Warm amber/orange family. Canonical: `#f59e0b` (PostHog amber). Ramp defined as CSS variables.**

```css
--color-accent-50:  #fffbeb;
--color-accent-100: #fef3c7;
--color-accent-500: #f59e0b;  /* canonical */
--color-accent-600: #d97706;
--color-accent-700: #b45309;
--color-accent-900: #78350f;
```

Used SPARINGLY per Q4.8 lock: primary CTAs / focus rings / current-page nav state / RSVP "Going" pill / active-link underline.

Body remains monochromatic (Tailwind neutral-50 through neutral-900). Migration in Phase A:
- Update `app/globals.css` with the ramp.
- Update `tailwind.config.ts` to alias `theme.extend.colors.accent` to the CSS vars.
- Regenerate PWA icons (`/icons/icon-192.png` + `/icons/icon-512.png`) with `WA` on amber square.
- Update `manifest.json` `theme_color` from `#2563eb` to `#f59e0b`.
- Note in chat-23 spec: existing browser-installed PWA users may need re-install for the new theme to take effect.

### Q4.3 [tuning] — Dark mode — LOCKED

> **Defer to v0.5+.** Token foundation (Q8.2 + Q4.2) lays groundwork; design pass (200+ contrast pairs to verify; toggle UX) is its own scope. v0.4 ships light-only.

### Q4.4 [tuning] — Typography — LOCKED

> **Inter (sans-serif) loaded via `next/font`. Body 16px, h1 30-36px, h2 18-20px, h3 16px semibold. Single font; no serif in v0.4.**

System fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.

Reserve a serif slot in CSS variables for v0.5+ editorial pages (`/about` redesign) but don't ship one.

### Q4.5 [tuning] — Card styles — LOCKED

> **Bordered flat (current v0.3.1). Hover: subtle background tint `hover:bg-neutral-50`. No shadows on cards.**

Shadows reserved for dialog / popover / tooltip / dropdown overlays only.

### Q4.6 [tuning] — Imagery posture — LOCKED

> **Functional imagery (avatars, optional project screenshots) + 1-2 line-drawing illustrated touches for first-impression surfaces. NO mascots, NO stock photography in v0.4.**

The 1-2 illustrated touches are Notion-style — simple, restrained, not whimsical.

### Q4.7 [tuning] — Logo direction — LOCKED

> **Wordmark only for v0.4: `Warsaw AI` in Inter Semibold 18-20px, neutral-900.**

Variants:
- Desktop header: full text.
- Mobile header: full text (fits at 18px on 390px viewport).
- PWA icons (192/512): `WA` initials, white, on `#f59e0b` square.
- Favicon: same `WA` 32×32.

Mark/symbolic icon → v0.5+ after wordmark settles.

### Q4.8 [tuning] — Accent color usage — LOCKED

> **Where accent appears:**
> - Primary CTAs (Sign in, RSVP Going button, Apply to join, "Add to calendar" buttons)
> - Focus rings (keyboard nav visibility, WCAG 2.1 AA per Q9.1)
> - Current-page nav state (underline or background tint)
> - RSVP "Going" pill (Q5.7 hero)
> - Active-link underline
>
> **Where accent does NOT appear:**
> - Links (remain `underline` neutral-900)
> - Tags (neutral background, neutral-700 text)
> - Section headers (uppercase tracking-wider, neutral-500 — v0.3.1 pattern preserved)
> - Body text (always neutral-900)

Restraint is the brand even with warmth. Anywhere accent appears, it should mean "action" or "you are here."

---

## 7. Component patterns (Section 5 answers)

### Q5.1 [blocking] — Shared list card — LOCKED

> **ONE `<ListItem>` component with content slots.**

Props:
```typescript
type ListItemProps = {
  href: string;
  title: string;
  subtitle?: string;
  meta?: string;        // e.g., "Wed May 21 · 18:30" OR "3 contributors"
  avatar?: AvatarProps; // optional leading avatar
  trailing?: ReactNode; // optional trailing chip (stage / status / type)
};
```

Used by `/members` (Phase B), `/calendar` (Phase A), `/projects` index (Phase B), `/decisions` index (Phase B; gated), `/home` Recent activity (Phase A), `/handbook` index sections (Phase A).

### Q5.2 [blocking] — Avatars — LOCKED

> **Photos by default (GitHub avatar URL via session). Initials fallback. Members can opt out via profile frontmatter `photo: false`.**

Implementation (Phase A):
- `<Avatar>` component renders `<Image src={photoUrl}>` if set + not opted-out, else initials in neutral square.
- `next/image` config: `images.remotePatterns` allows `avatars.githubusercontent.com` only (H59 hardening — SSRF prevention).
- Initials algorithm — chat-23 O6 open question.
- No upload UI in v0.4. GitHub avatar is canonical.

Avatar appears on:
- `/home` This Week strip (compact 20px)
- `/home` Recent activity (24px)
- `/calendar` items (32px)
- `/events/[slug]` RSVP roster strip (40px in 5-wide grid per ADR-0012 D12)
- `/meetings/[slug]` attendee list (40px)
- `/members/[slug]` profile header (96px)
- Global header avatar dropdown (32px)

### Q5.3 [tuning] — RSVP / Thanks button placement — LOCKED

> **Fixed location: RSVP above the fold on event detail (after title strip). Thanks at the end of items (status / project / meeting card).**

### Q5.4 [tuning] — Date format — LOCKED

> **Relative for recency cues + absolute on hover. Absolute on detail pages.**

Examples:
- `/home` Recent activity: `3 days ago` (visible) / `Wed, May 14 · 11:30` (title attribute)
- `/calendar` items: `Wed, May 21 · 18:30 CEST` (absolute primary)
- `/events/[slug]` hero: `Wednesday, May 21 · 18:30 - 21:00 CEST`

### Q5.5 [tuning] — Tags visibility — LOCKED

> **Surface tags in BOTH list views and detail headers.**

- Projects: stage chip (`active` / `complete` / `paused`)
- Meetings: type chip (`weekly` / `special` / `workshop`)
- Decisions: status (`Accepted` / `Proposed` / `Superseded`)
- Members: no tags surfaced

### Q5.6 [blocking] — Member profile structure — LOCKED

> **Pure PostHog team-page layout. NO activity feed in v0.4.**

`/members/[slug]` composition (signed-in only per ADR-0012; Phase B target state):
```
[Header card — 96px tall]
  ┌──────┐  Mark Spasonov                        [Edit your profile →]
  │  96px│  @markspas · Member since 2026-04                 (if own profile)
  │Avatar│  Researcher · Working on GBrain
  └──────┘

[Bio section — markdown body from community/members/<slug>.md]

[Working on — list of projects the member contributes to]
  Auto-aggregated from git contributions + project frontmatter.
  Cards link to /projects/[slug].

[Social links — from profile frontmatter]
  GitHub · LinkedIn · Personal site · Telegram handle (no link unless explicit opt-in)
```

**Activity feed DROPPED from v0.4** per Anton's lock. Cleaner; less surface area; less per-member visibility-opt-out complexity.

**Persona integration (v0.4):** `PersonaPanel` v0.2 component is preserved AS-IS in `/members/[slug]`. NO upgrade to the persona pages route (`/members/[slug]/<persona-id>`); NO refresh button; NO external-repo architecture. **Personas v2 deferred to v0.5+** (per Anton's Q5.6 lock on v0.5+ persona scope including external git repos).

**The ONE persona-related v0.4 deliverable:** CI slug-folder integrity check (H68) — assert every `persona-builder/personas/<X>/` folder maps to a roster slug. ~1 hour of work; prevents the `mark-s` → `mark-spasonov` mismatch class.

### Q5.7 [blocking] — Event detail page — LOCKED (Phase B target state)

> **Luma-style outcome-focused.**

`/events/[slug]` composition (Phase B target — Phase A wraps existing v0.3 template in new shell):
```
[Hero — above the fold, 280-360px tall]
  Wednesday, May 21 · 18:30 - 21:00 CEST
  Warsaw AI Weekly Sync #34                          [RSVP Going (3) ▼]
  📍 Campus Warsaw, Marszałkowska 142

  [RSVP avatar strip — 5-wide grid, public-visibility members
   + "+M members (sign in to see)" pill for hidden]

[Body — markdown agenda/notes]

[Footer of page]
  [Add to Apple Calendar] [Add to Google Calendar] [Subscribe to feed]
  Tags: weekly, sync, hybrid
```

Sidebar (desktop only, 280px right rail):
- Organizers (avatar + handle)
- Venue details (address, map link, accessibility notes)
- Share: [Telegram] [Twitter/X] [LinkedIn] [Copy link]

`/meetings/[slug]` mirrors but replaces RSVP with attendee list (drop-in convention; no RSVP overhead) and "Past attendees" replaces "Going avatar strip" for past meetings.

**Manipulation-resistance hardening:** the next-event ribbon on `/` + event detail page shows NEUTRAL framing ("Next: Wed May 21 · 18:30") NOT scarcity ("Only 2 spots left"). No countdown timers. No "spots remaining" if seats aren't actually limited.

### Q5.8 [tuning] — Project detail page — LOCKED (Phase B target state)

> **Hybrid README + portfolio header.**

`/projects/[slug]` composition (signed-in per ADR-0012; Phase B target):
```
[Header — 160-200px tall]
  GBrain                                          [stage: active]
  Telegram knowledge base · 2 contributors

  [Contributor avatar strip — overlapping 32px circles]
  [Quick links: GitHub repo · Demo · ADRs referenced]

[Body — markdown README from projects/gbrain/README.md]
  (preserve the canonical project README content)

[Decisions section — per-project ADRs (Q2.3 lock)]
  ADR-NNNN: title · status · 1-line summary
  Pulled from docs/decisions/*.md with frontmatter project: matching.

[Sidebar — desktop only]
  Stage · Tags · Last updated · Tech stack (from frontmatter)
  Related meetings · Recent contributors
```

---

## 8. Anonymous vs signed-in (Section 6 answers)

### Q6.1 [blocking] — Anonymous-readable scope — LOCKED A1

> **Only `/` flips to anonymous-public in v0.4 (ADR-0014 NEW). `/decisions` stays GATED. `/members` + `/projects` stay GATED.**

**v0.4 anonymous-public routes:**
- `/` (NEW v0.4 — ADR-0014)
- `/home` (per ADR-0012)
- `/calendar` (NEW — extends ADR-0012 data layer)
- `/events` + `/events/[slug]` (per ADR-0012)
- `/meetings` + `/meetings/[slug]` (per ADR-0012)
- `/api/calendar.ics` (per ADR-0012)
- `/manifest.json`, `/icons/*` (per ADR-0012)
- `/handbook` (per Q2.1 lock + Q6.1 resolution (i) — anon-public but NO ADR content surfaced via UI; charter pointer + roadmap + external GitHub link for ADRs + v0.5+ placeholders)
- `/feed/meetings.xml`, `/feed/events.xml` (Q9.5 lock; gated content excluded per H61)

**v0.4 GATED routes** (no change from v0.3.1):
- `/decisions` + `/decisions/[slug]` (Anton's "hide all possible PII" stance per Q6.1)
- `/members` + `/members/[slug]` (per-member opt-in needed for any flip — v0.5+)
- `/projects` + `/projects/[slug]` (privacy review needed — v0.5+)
- `/me/*`, `/this-week`, `/admin/*`, GDPR endpoints (always gated)

### Q6.2 [tuning] — Anonymous CTAs on member-content pages — LOCKED

> **Per surface:**
> - Event detail (anonymous): hero shows event normally; RSVP slot shows `[Sign in to RSVP]` button.
> - Meeting detail (anonymous): notes visible; attendee list shows `+N members (sign in to see)` badge.
> - `/projects` gated landing: "Member projects — sign in to see" + `[Sign in with GitHub]`.
> - `/members` gated landing: "Member directory — sign in to see profiles" + `[Sign in with GitHub]`.
> - `/decisions` gated landing: "Decisions live in our public git repo — link here" + `[Sign in to see in-app]`.
> - `/` hero: dual CTA — `[Sign in with GitHub]` primary + `[Join Telegram →]` secondary.
>
> NO "Read more" CTAs (cluttery). Trust members to scroll.

### Q6.3 [tuning] — Anonymous member detail reveal — LOCKED

> **MOOT — `/members/[slug]` stays members-only. No v0.4 anonymous reveal.**

### Q6.4 [tuning] — Anonymous decisions — LOCKED

> **MOOT — `/decisions` stays GATED per Q6.1 A1.**

The proposed ADR-0013 flip to public is **deferred to v0.5+** subject to a PII audit task (grep `docs/decisions/` for member-identifying fragments; sanitize before any future flip).

### Q6.5 [tuning] — Anonymous RSVP magic-link — LOCKED

> **NO. Members-only RSVP. Anonymous CTA = "Sign in to RSVP" (per Q6.2).**

---

## 9. Content density & hierarchy (Section 7 answers)

### Q7.1 [tuning] — `/home` feed order — LOCKED

> **Prioritized: This Week strip → Recent activity → 5-card section nav.**

This Week always top (even if empty — "Nothing scheduled this week — next on Wed 5/21"). Recent activity newest-first. Section nav at the bottom.

### Q7.2 [tuning] — Above-the-fold — LOCKED

| Surface | Above-the-fold |
|---|---|
| Anonymous `/` | Hero (value prop + dual CTA + next-event ribbon) |
| Anonymous `/home` | This Week strip |
| Signed-in `/home` | "Your week" dashboard pane |
| Detail pages (Phase B) | Hero (title + meta strip + primary CTA) |

### Q7.3 [tuning] — Detail page hero — LOCKED

> **Contained image (NOT full-bleed).** Title + meta strip + optional 16:9 image card below (most cases: no image — text only). `hero_image:` slot in frontmatter, populated sparingly.

---

## 10. Tech & implementation envelope (Section 8 answers)

### Q8.1 [blocking] — Design system primitives — LOCKED

> **shadcn/ui + direct Radix UI for advanced primitives shadcn hasn't wrapped.**

shadcn is the primary. Add Radix imports directly when shadcn lacks a wrapper (Tabs, Toast, advanced focus management). Adds package.json direct dependencies for `@radix-ui/react-*` components as needed.

No Headless UI, no Mantine, no Chakra.

### Q8.2 [tuning] — Design tokens — LOCKED

> **Extract to CSS variables in `app/globals.css`; Tailwind config references via `var()`.**

Migration (Phase A) per Q4.2:
1. Define `:root { --color-accent-50: #fffbeb; ... }` in `app/globals.css`.
2. Reference via Tailwind config: `theme.extend.colors.accent = { 500: 'var(--color-accent-500)' }`.
3. Component classes use Tailwind utilities (`bg-accent-500`) which resolve through CSS vars.
4. Future dark mode = define `[data-theme="dark"] { --color-accent-500: <adjusted>; ... }`.

Surgical scope: ~30 lines of CSS + Tailwind config update.

### Q8.3 [tuning] — Component organization — LOCKED

> **Central `components/` directory (current v0.3 layout).**

Shared components (`<Header>`, `<Footer>`, `<Avatar>`, `<ListItem>`, `<EmptyState>`, `<DateTime>`, `<Tag>`) don't belong to a single route. Reconsider in v0.5+ if a route grows >5 unique components.

### Q8.4 [tuning] — Storybook — LOCKED

> **Skip in v0.4.** RTL tests + on-page usage suffice for <30 shared components.

### Q8.5 [tuning] — Image hosting — LOCKED

> **`next/image` (already configured).** Member avatars proxy GitHub URLs; project README images load relative to repo. `next.config.ts` `images.remotePatterns` allowlist: `avatars.githubusercontent.com` (H59).

### Q8.6 [blocking] — i18n approach — LOCKED

> **Q0.4 = EN-only in v0.4, so i18n NOT implemented but PREPARED.**

Phase A preparation:
- Recommend `next-intl` for v0.5+ (best Next.js 16 App Router integration; ICU MessageFormat; type-safe).
- Centralize UI strings into `lib/i18n/strings.ts` (TypeScript module with named exports).
- All v0.4 components import from `lib/i18n/strings.ts`; no inline strings (H67 hardening).
- v0.5+ work: install `next-intl`, scaffold `messages/en.json` + `messages/pl.json`, swap to `useTranslations()` hooks, add `/en/` `/pl/` route prefixes.

---

## 11. Cross-cutting concerns (Section 9 answers)

### Q9.1 [blocking] — Accessibility target — LOCKED

> **WCAG 2.1 AA across the strict-list. AAA where feasible.**

Specifics for v0.4 (Phase A):
- **Keyboard nav:** all interactive elements reachable; visible focus rings (Tailwind `ring-accent-500 ring-offset-2`).
- **Contrast:** body text neutral-900 on white = 19:1 (AAA); section labels neutral-500 = 6:1 (AA large); chips/CTAs verified per element.
- **ARIA:** icon-only buttons get `aria-label`; `<nav>` / `<main>` / `<header>` / `<footer>` semantic landmarks.
- **Skip-to-content link** in global header (H65 hardening).
- **Focus management:** dialog/dropdown focus traps; close-on-Escape.
- **alt text:** member avatars `alt={`${name}'s avatar`}` or empty alt if decorative.

Verification: axe-core run on each strict-list surface; fix all "serious" + "critical" issues before ship.

### Q9.2 [tuning] — Performance budget — LOCKED

> **Per-page targets** (Lighthouse 4G throttling):

| Surface | LCP | CLS | TTI |
|---|---|---|---|
| Anonymous `/`, `/home`, `/calendar`, `/events/[slug]`, `/meetings/[slug]`, `/handbook` | <2.0s | <0.05 | <3.0s |
| Signed-in `/home`, `/me/edit`, `/members/[slug]`, `/projects/[slug]`, `/decisions/[slug]` | <2.5s | <0.1 | <4.0s |
| Auth gate (`/login`, `/consent`) | <3.0s | <0.1 | <4.0s |

Verify after v0.4 ships against `projects/community-platform/perf-baselines/`.

### Q9.3 [tuning] — GDPR / EU-DSA posture — LOCKED

> **Explicit in spec §14.**
> - v0.4 adds NO analytics (Q9.4) → no cookie banner needed.
> - ADR-0012 consent gate stays unchanged.
> - New v0.4 surfaces (hero, global shell, RSS for meetings + events) are content-only — no PII processing.
> - GitHub avatar fetch (Q5.2) is server-side proxy via `next/image` — no third-party tracking pixel.

### Q9.4 [tuning] — Analytics — LOCKED

> **NONE in v0.4.** v0.5+ backlog: consider Plausible (cookieless option) when traffic justifies + GDPR/DPA review.

### Q9.5 [tuning] — RSS feeds — LOCKED

> **YES — `/feed/meetings.xml` + `/feed/events.xml`.** Both anon-public per ADR-0012.

**DROPPED:** `/feed/decisions.xml` (Q6.1 A1 lock — `/decisions` gated; can't surface gated content via public RSS).
**NOT included:** `/feed/projects.xml` (`/projects` gated).

Cost: ~30 LOC per feed. Discoverability: `<link rel="alternate" type="application/rss+xml" href="/feed/meetings.xml" title="Warsaw AI Meetings">` in global header on anon-public surfaces.

H61 hardening: RSS feeds NEVER include gated content; meeting/event excerpts capped at 280 chars (mirroring ADR-0012 D7 status excerpt limits).

---

## 12. Scope & rollout (Section 10 answers)

### Q10.1 [blocking] — v0.4 scope envelope — LOCKED

> **Phase A COMMITTED as v0.4.0. Phase B + Phase C are CONDITIONAL on Phase A user-test feedback.**

| Phase | Status | Scope | Files (approx) | Tag |
|---|---|---|---|---|
| **A — Shell + landing + Handbook + Calendar + token + wordmark** | **COMMITTED** | Global `<Header>`/`<Footer>`, `<Avatar>`, `<ListItem>`, token CSS variables, warm accent, `/calendar` route, `/` anonymous landing (ADR-0014), `/handbook` thin curation page, wordmark, PWA icons regen, favicon, signed-in `/home` "Your week" dashboard pane, skip-to-content + axe-core, `lib/i18n/strings.ts` centralization, H56-H62 + H64-H68 hardenings, CI slug-folder integrity check | ~20-25 files | `v0.4.0` |
| **B — Detail templates** | **CONDITIONAL** on Phase A user-test feedback | Unified detail template family (3 variants A/B/C), PostHog team-page member profile (Q5.6), Luma-style event detail (Q5.7), project detail framing with per-project Decisions section (Q5.8 + Q2.3) | ~15 files | `v0.4.1` |
| **C — Brand visual + RSS + illustrations** | **CONDITIONAL** on Phase A + B reception | 1-2 illustrated touches (Notion-style line drawings), `/about` page, RSS feeds (`/feed/meetings.xml` + `/feed/events.xml`) | ~10 files | `v0.4.2` |

**Why this conditional split (per office-hours sharpening §14A):**
- Phase A alone is shippable AND coherent — closes the v0.3.1 orphan-page gap, provides the anonymous landing thesis, locks the visual identity foundation.
- Phase B + C earn their slot only if user-test feedback validates the direction.
- Worst case (Phase B + C don't activate): v0.4.0 is the v0.4 ship; v0.4.1+ are deferred to v0.5 cycle.
- Best case: 2-5 wks CC-time total (median ~3-4 wks).

### Q10.2 [blocking] — Brand work in v0.4 or v0.5 — LOCKED

> **Wordmark + accent ramp + tokens + PWA icons in v0.4 Phase A (pulled into A from C — v0.4.0 needs visual coherence at ship). Full brand identity (mark + illustration system + extended palette + motion) → v0.5+.**

Why pulled into Phase A: Phase A is the committed ship. v0.4.0 has to look coherent on day one — the new shell would clash with cool corporate blue PWA icons and shadcn default neutral if we shipped Phase A without the visual foundation.

### Q10.3 [tuning] — Migration strategy — LOCKED

> **Hard-cut on Phase A merge.** No feature flags. Each phase tag = checkpoint; v0.4.0 alone is shippable if Phase B/C never activate.

### Q10.4 [tuning] — Chat sequencing — LOCKED

> **3 chats minimum + N implementation chats:**
> - **chat-22** (this chat): brainstorm via `superpowers:brainstorming`. ✓
> - **chat-23**: spec via `superpowers:spec-writer` + `design-shotgun` mid-stream for visual lock + draft ADR-0014. **Mandatory: 30-min user-test session before spec lock.**
> - **chat-24**: implementation plan for Phase A via `superpowers:writing-plans`.
> - **chat-25**: Phase A implementation (v0.4.0) via `superpowers:subagent-driven-development`.
> - **chat-26+**: Phase A user-test review; decide Phase B activation.
> - **chat-27+**: Phase B implementation (v0.4.1) if activated.
> - **chat-28+**: Phase C implementation (v0.4.2) if activated.

### Q10.5 [tuning] — Single PR vs split — LOCKED

> **Split per phase. v0.4.0 ships as PR; v0.4.1 + v0.4.2 each ship as separate PRs if/when their phases activate.**

Smaller PRs = faster typescript-reviewer + code-reviewer dispatch. Each tag = checkpoint. Bisecting regressions easier.

---

## 13. Out-of-scope confirmation (Section 11 answers)

All [locked] confirmed:

- **Q11.1 [locked]** — Payments / commerce / subscriptions NOT in v0.4. ✓
- **Q11.2 [locked]** — Built-in KB / Q&A NOT in v0.4 (GBrain sub-project owns this; v0.4 may extend the existing `Ask GBrain` CTA placement). ✓
- **Q11.3 [locked]** — Route removal NOT in v0.4. ✓ (v0.4 ADDS routes `/`, `/calendar`, `/handbook`, `/feed/*`; doesn't remove anything.)
- **Q11.4 [locked]** — Backend / data shape changes NOT in v0.4. ✓ (Pure UI/IA. Frontmatter format stable. Generated JSON artifacts stable.)
- **Q11.5 [locked]** — Native iOS / Android NOT in v0.4. ✓ (PWA install from v0.3.1 is the mobile story.)
- **Q11.6 [locked]** — DMs / real-time messaging NOT in v0.4. ✓ (Telegram remains conversation channel — see Q-1.3 lock.)

---

## 14. Decision log (D21–D44 — continues from v0.3 spec §13 D1–D20)

| ID | Decision | Reference Q | Why |
|---|---|---|---|
| **D21** | Public ambition = "Where Warsaw's AI builders learn, ship, and find each other." | Q-1.1 | Outcome verbs map to surfaces; localizes; no overclaiming. |
| **D22** | Character: PostHog primary + Linear + Claude/Notion accents. NOT Lobste.rs primary. NOT dev.to / Slack-as-chat-replacement. | Q-1.2 / Q-1.3 | Anton's lock: warmer + branded + transparent + editorial-soft. Linear restraint as accent for layout. Lobste.rs activity-feed-style member profile dropped accordingly (Q5.6). |
| **D23** | EN-only in v0.4; i18n STRUCTURE prepared (centralized strings); next-intl recommended for v0.5+. | Q0.4 / Q8.6 | Working language is EN; halves content cost; structure preserved. |
| **D24** | `/` flips to anonymous-public with hero+CTA landing (ADR-0014 NEW). Signed-in `/` → 302 → `/home`. | Q1.1 / Q0.5 | Currently dead surface (307→login); anonymous discovery deserves a proper landing. |
| **D25** | `/home` is the unified discovery feed (anonymous + signed-in). Signed-in adds "Your week" dashboard above. | Q1.3 | One route, two contexts; reuses v0.3.1 work. |
| **D26** | 5-item top nav: Home / Calendar / Projects / Members / Handbook. | Q2.1 | Mobile-safe; Handbook replaces Decisions slot (Anton's call: Decisions doesn't earn the slot). |
| **D27** | `/calendar` unifies events + meetings UI. `/events` `/meetings` indexes stay URL-accessible (no 301). | Q2.2 | Single canonical surface; back-compat preserved for ICS subscribers + Telegram links. |
| **D28** | `/decisions` + `/decisions/[slug]` STAY GATED (members-only). ADR-0013 DROPPED. | Q6.1 / Q6.4 | Anton's "hide all possible PII" stance; ADRs still public via direct GitHub repo URL. |
| **D29** | `/projects` + `/members` STAY members-only in v0.4. v0.5+ backlog for re-evaluation. | Q6.1 | Privacy review depth + per-member opt-in not feasible in v0.4 envelope. |
| **D30** | Global header + footer on every page except `/login`. | Q3.1 | Closes the v0.3.1 orphan-page gap. |
| **D31** | Detail template family: 3 variants (content / event / person) sharing global shell. Phase B target state. | Q3.2 | Phase A wraps existing v0.3 templates; Phase B upgrades if user-test validates. |
| **D32** | Token-based CSS variable system in `app/globals.css` referenced by Tailwind config. | Q8.2 / Q4.2 | Dark mode foundation; brand-swap flexibility; surgical migration. |
| **D33** | Warm amber `#f59e0b` accent ramp replaces cool `#2563eb`. PWA icons + `manifest.json` regen in Phase A. | Q4.2 | PostHog character + Anton's warmth pick. |
| **D34** | Wordmark only for v0.4: `Warsaw AI` in Inter Semibold. PWA icons get `WA` initials on amber square. | Q4.7 | Locks visual identity without crowdsourcing delay; mark designed in v0.5+. |
| **D35** | Inter (sans-serif) loaded via `next/font`. System fallback stack. No serif in v0.4. | Q4.4 | Single font; CLS-free; widely available. |
| **D36** | `<ListItem>` shared component with slots (title/subtitle/meta/avatar/trailing). | Q5.1 | Half the code paths; consistent affordances across list views. |
| **D37** | Member avatars use GitHub URL with initials fallback. No upload UI. Opt-out via `photo: false` frontmatter. | Q5.2 | Zero new infra; GitHub avatar is already public; privacy escape hatch. |
| **D38** | Member profile = pure PostHog team-page. NO activity feed in v0.4. PersonaPanel v0.2 preserved as-is. Personas v2 (external repos + own pages + sharing + refresh) → v0.5+. | Q5.6 | Anton's lock: simpler v0.4; defer the activity feed complexity; defer the persona-v2 external-repo architecture entirely. |
| **D39** | Event detail = Luma-style outcome-focused (hero with RSVP CTA + roster). Phase B target state. | Q5.7 | Event detail is platform spine for v0.4 acquisition + commitment. |
| **D40** | RSS feeds for `/meetings` + `/events` only. NOT for `/decisions` (gated). NOT for `/projects` (gated). | Q9.5 / Q6.1 | High-signal for developer audience; ~30 LOC per feed; restraint on gated surfaces. |
| **D41** | NO analytics in v0.4. NO cookie banner. v0.5+ backlog: consider Plausible cookieless. | Q9.4 / Q9.3 | First-impression friction; community-scale doesn't justify yet. |
| **D42** | NO search in v0.4. cmd-K command palette + GBrain semantic search → v0.5+. | Q2.7 | Catalog too small; GBrain integration earns own scope. |
| **D43** | NO breadcrumbs, NO Storybook, NO tour, NO dark mode in v0.4. Each deferred to v0.5+. | Q3.3 / Q8.4 / Q1.4 / Q4.3 | Envelope discipline. |
| **D44** | Phase A COMMITTED as v0.4.0; Phase B + Phase C CONDITIONAL on Phase A user-test feedback. Hard-cut, no feature flag. | Q10.1 / Q10.5 / Q10.3 | Office-hours sharpening: smaller commitment up-front + checkpoint after Phase A landing. 2-5 wks CC-time total (median 3-4 wks). |

---

## 14A. Office-hours sharpening — six forcing questions applied to the v0.4 thesis

Self-critique pass on the brainstorm output. Treats Anton's locked thesis as the "founder pitch" and runs YC forcing questions as adversarial audit.

### Q1 — Demand reality

> "What's the strongest evidence Warsaw AI Community NEEDS a world-class platform redesign vs sticking with v0.3.1 + minor polish?"

**Answer:** Weak demand evidence. v0.4 is founder-triggered (Anton's escalation + `plan-ceo-review` SCOPE EXPANSION mode), not member-demand triggered. v0.3.1 shipped 2 days ago with zero member-feedback cycle. Member count ≈20 — small audience absorbs UX changes slowly. CC-time is the constraint.

**Sharpening (acted on):** Phase A committed + Phase B/C conditional on user-test feedback (Q10.1 A lock). User-test session mandatory before chat-23 spec lock.

### Q2 — Status quo

> "What do members do today without a world-class platform?"

**Answer:** Real status quo is **Telegram** (not v0.3.1). Members RSVP via Telegram comments, check events via Telegram pinned message.

**Sharpening (acted on):** `/` hero dual CTA includes `[Join Telegram →]` (Q1.2 lock). v0.4 competes with Telegram convenience, not v0.3.1.

### Q3 — Desperate specificity

> "Name the actual human who needs v0.4."

**Three named roles:**
1. **Anton** (member-1; uses daily; builds because he wants to)
2. **Mark Spasonov** (active researcher; would benefit from project showcase + persona surface — Personas v2 deferred to v0.5+)
3. **New prospective member X** (Telegram referral; lands on `/`; ~3 per month at current growth rate)

**Sharpening (acted on):** anonymous `/` landing prioritized for persona #3 (Q1.2 + ADR-0014). Member profile upgrade prioritized for persona #2 (Phase B conditional).

### Q4 — Narrowest wedge

> "What's the smallest v0.4 ship that already earns the upgrade?"

**Answer:** Phase A alone (~20-25 files, 2-3 wks CC-time). Closes orphan-page gap, anchors anonymous discovery, locks visual identity foundation.

**Sharpening (acted on):** Phase A committed; Phase B/C earn their slot only after user-test feedback (Q10.1 A lock).

### Q5 — Observation & surprise

> "Have you actually watched someone use v0.3.1 without helping them?"

**Answer:** No. Pre-brainstorm `gstack` dogfood was me on empty anonymous platform; no community feedback.

**Sharpening — MANDATORY chat-23 deliverable:** 30-min user-test session with 2 existing Telegram members + 1 prospective member BEFORE locking spec §14. Captures friction observed; amends brainstorm output before chat-23 writes spec. Single highest-leverage activity between chat-22 and chat-23 ship.

### Q6 — Future-fit

> "Where does Warsaw AI Community look in 3 years (2029)?"

**Answer:** 100-300 members; 5-10 active sub-projects; GBrain mature; Telegram still chat. v0.4's structural lift scales to this.

**Sharpening (acted on):** Token system (Q8.2) + i18n prep (Q8.6) + Handbook nav slot (Q2.1) — all bets-on-future. Brand identity v0.5+ defer (Q4.1) — premature lock wastes design budget at 20 members.

---

## 14B. Manipulation-risk audit (marketing-psychology principle applied inline)

Scan v0.4 surfaces for retention loops, gamification, dark patterns, or attention-capture defaults.

| Surface | Risk | Mitigation in v0.4 |
|---|---|---|
| Kudos system (v0.3) | Could become leaderboard pressure | Already minimal; NO v0.4 escalation. No streak counter, no public count, no notifications. |
| RSVP "Going (3)" count | Social-proof pressure to attend | ADR-0012 D12 `event_rsvp_visibility` opt-out preserved. v0.4 inherits unchanged. |
| "Your week" dashboard | Could grow into streak gamification | **HARDENING (H67-derivative; chat-23 spec):** passive surface — no streak counter, no notifications, no "you missed 2 weeks" guilt. Counts what HAPPENED, doesn't pressure SHOULD. |
| Member-profile activity feed | Cross-member comparison pressure | **DROPPED entirely from v0.4** per Q5.6 lock. Defer to v0.5+ with explicit anti-comparison design pass. |
| "Apply to join" CTA on `/` | Friction — not manipulative if honest | OK. Telegram invite ledger preserves provenance; no fake exclusivity ("we accept only 5%"). |
| Hero "Next event" ribbon | Could induce FOMO | **HARDENING (chat-23 spec):** NEUTRAL framing ("Next: Wed May 21 · 18:30") NOT scarcity ("Only 2 spots left"). No countdown timers. No "spots remaining" unless seats are actually limited. |
| PWA install prompt | Could nag | Browser-native prompt only. No custom modal pestering. |
| Email / push notifications | Out of v0.4 (no email infra) | N/A — absence is the mitigation. v0.5+ if ever, defaults OFF. |
| Persona sharing (v0.5+ deferred) | Status-signaling via persona showcase | V0_5_BACKLOG entry tagged `[anti-manipulation review required]`. |
| Lobste.rs-style invite tree (v0.5+ deferred) | Status-signaling | V0_5_BACKLOG entry tagged `[anti-manipulation review required]`. |

**Verdict:** v0.4 passes manipulation audit at **low risk**. Three explicit hardening constraints added to chat-23 spec (passive "Your week", neutral event ribbon, no-scarcity defaults).

---

## 14C. PII + RBAC threat-model preview (CSO principle applied inline)

### New attack surface from v0.4

| Surface | PII / leak risk | Hardening reference |
|---|---|---|
| **ADR-0014 `/` anonymous-public flip** | Session-coupled rendering could leak signed-in identity to anonymous responses (cache poisoning, server-component drift) | H56 (`/` anonymous render asserts no auth() side-effects + `Cache-Control: private` posture) + H57 (signed-in `/` 302→`/home` preserves return-to query params) |
| **`/handbook` anonymous render** | If Handbook ever surfaces ADR markdown content, must respect ADR-0012 / Anton's PII stance | v0.4 Handbook does NOT surface ADR content via UI (Q6.1 resolution (i)); links to GitHub instead. No PII risk. |
| **Member avatar URL via `next/image` proxy** | SSRF risk; Vercel optimization caches member-controlled content | H59 (`avatars.githubusercontent.com` allowlist in `next.config.ts` `images.remotePatterns`) — strict deny-by-default |
| **GitHub avatar served via Vercel proxy** | Vercel caches avatars on edge → third-party data exposure of member photos | Acceptable per v0.1.0 GDPR posture (GitHub avatar is public web data). Document in spec §14. Opt-out via `photo: false` (H60). |
| **RSS feeds** (Q9.5) | Could leak gated content if title/excerpt logic isn't strict | H61 (RSS NEVER includes gated content; meeting/event excerpts capped at 280 chars mirroring ADR-0012 D7) |
| **Anonymous render of event detail with `event_rsvp_visibility` opt-out** | Anonymous viewer might see "Going" members tagged `private` | H66 (RSVP roster strip on anonymous render respects ADR-0012 D12 — only `public` visibility surfaced) |
| **`/calendar` unified index** | Could leak meeting attendees if data layer pre-includes attendee blocks | Confirm ADR-0012's existing data-layer split (events public + attendee lists members-only); chat-23 spec audit |
| **`/home` dashboard "Your week"** (signed-in) | Server Component rendering session data — must NOT cache | Already pattern-8-compliant per `docs/playbooks/recurring-plan-defects.md`; H58 stability check |
| **`<Avatar>` initials fallback** | Could leak last-name info from members who only published a first name | Open question O6 — define handle-first-letter-only algorithm |
| **`persona-builder/personas/*/` slug-folder mismatch** | Could expose persona content to wrong member's profile | H68 NEW: CI integrity check (~1 hour) |

### RBAC posture for v0.4

No new role added. Existing tiers stay:
- **anonymous** → discovery surfaces only (per ADR-0012 + ADR-0014).
- **member** (roster.md entry + consent) → all discovery + RSVP + Kudos + own profile edit + this-week posting + members-only directory + projects + decisions.
- **admin** → `/admin/health` + future admin surfaces.
- **owner** (`anton1rsod`) → all of admin + governance ADR commits.

`proxy.ts` gates remain single source of truth. v0.4 adds entries to PUBLIC_PATHS for `/`, `/calendar`, `/handbook`, `/feed/meetings.xml`, `/feed/events.xml`. No new auth-coupled mechanism.

### CHAT-23 mandatory threat audit tasks (3, down from 4)

1. ~~**ADR audit for ADR-0013** — DROPPED (no `/decisions` flip in v0.4).~~
2. **Spec §14 explicit GDPR section:** document the GitHub-avatar-via-Vercel-proxy data flow and member opt-out (`photo: false`).
3. **Hardening H56-H68 mapped to test files** (per HANDOFF_PROTOCOL §4 convention `describe("H<n>: ...")`); chat-24 plan task includes test scaffolding.
4. **Cache-Control headers verified** on ADR-0014 `/` to prevent edge-cache identity leak.

### Threat-model verdict

v0.4 expands anonymous surface area modestly (`/` + `/handbook` + `/calendar` + `/feed/meetings.xml` + `/feed/events.xml`) with **all new surfaces traceable to specific hardenings**. No introduced authentication mechanism. No introduced PII pipe. Acceptable risk profile if chat-23 honors the three audit tasks above.

---

## 15. Hardening list (H56–H68 — net 12 hardenings; continues v0.3's H30–H55)

| ID | Hardening | Surface | Test prefix |
|---|---|---|---|
| **H56** | `/` anonymous render asserts no auth() side-effects (no session leak); Cache-Control: private posture | `app/page.tsx` (refactored for ADR-0014) | `describe("H56: / anonymous render")` |
| **H57** | Signed-in `/` 302→`/home` preserves return-to query params if present | `proxy.ts` or `app/page.tsx` | `describe("H57: / signed-in redirect")` |
| **H58** | Global `<Header>` shows correct auth-state UI without flash | `app/components/Header.tsx` | `describe("H58: header auth-state stability")` |
| **H59** | Member avatar URL allowlist limited to `avatars.githubusercontent.com` (SSRF prevention) | `next.config.ts` images.remotePatterns + `<Avatar>` | `describe("H59: avatar remote allowlist")` |
| **H60** | `photo: false` frontmatter opts out of avatar render (initials shown) | `lib/members.ts` + `<Avatar>` | `describe("H60: photo opt-out")` |
| **H61** | RSS feeds NEVER include gated content; meeting/event excerpts capped at 280 chars (mirroring ADR-0012 D7) | `app/feed/meetings/route.ts`, `app/feed/events/route.ts` | `describe("H61: RSS no-leak + excerpt cap")` |
| **H62** | `/calendar` filter chip state encoded in URL query (`?filter=events`) — preserves on share | `app/calendar/page.tsx` | `describe("H62: calendar filter URL")` |
| ~~**H63**~~ | ~~`/decisions` anonymous render~~ — **DROPPED** (Q6.1 A1 lock; no `/decisions` flip in v0.4) | — | — |
| **H64** | Token CSS variables documented in `app/globals.css` with naming convention + comment legend | `app/globals.css` | `describe("H64: token variable contract")` |
| **H65** | Skip-to-content link visible on Tab focus (keyboard a11y) | `app/components/Header.tsx` | `describe("H65: skip-to-content visibility")` |
| **H66** | Event RSVP avatar strip respects ADR-0012 D12 `event_rsvp_visibility` defaults (anonymous sees public-flagged only) | `app/events/[slug]/page.tsx` | `describe("H66: RSVP roster visibility")` |
| **H67** | `lib/i18n/strings.ts` is SINGLE source of UI text; grep for inline strings in JSX returns no v0.4 hits in strict-list components | `lib/i18n/strings.ts` + Phase A components | `describe("H67: i18n string centralization")` |
| **H68** | CI slug-folder integrity check — every `persona-builder/personas/<X>/` folder maps to a roster slug | `scripts/validate-persona-folders.ts` + CI workflow | `describe("H68: persona slug-folder integrity")` |

**Net v0.4 hardenings: 12** (H56-H62 + H64-H68; H63 retired).
**Total platform hardenings now: 67** (v0.1: 13 + v0.2: 16 + v0.3: 26 + v0.4: 12).

---

## 16. ADR candidate for chat-23 (just ONE — ADR-0013 dropped)

### ADR-0014 — `/` flips to anonymous-public

- **Status:** Proposed (write in chat-23).
- **Amends:** ADR-0012 (root path default posture).
- **Decision:** `/` anonymous-public, serves a hero+CTA landing. Signed-in `/` 302→`/home`.
- **Consequences:** anonymous discovery has a proper landing; SEO-canonical surface; marketing-aware "What is this community" anchoring. Reversal cost: low (remove from PUBLIC_PATHS).
- **Implementation:** `proxy.ts` PUBLIC_PATHS adds `/`; `app/page.tsx` (root) gains hero composition; signed-in branch via Server Component check.

### NO ADR-0013

Per Q6.1 A1 lock, `/decisions` stays gated. The `/decisions` flip ADR is **deferred to v0.5+ subject to a PII audit task** (grep `docs/decisions/` for member-identifying fragments; sanitize before any future flip). Recorded in V0_5_BACKLOG.

---

## 17. V0_5_BACKLOG additions surfaced by chat-22

(Appended to `projects/community-platform/V0_5_BACKLOG.md` in chat-22 close-out commit.)

### Strategic open questions (placement TBD per [[feedback_ia_defer_future_placement]])

| Item | Why deferred from v0.4 | Re-evaluate when |
|---|---|---|
| **Community Skills + Tools + Reps directory** (option (iii) framing: combined member-capability + tool-stack + referrer surface) | v0.5+ strategic feature aligned with marketplace-of-skills long-term ambition. Anton confirmed defer. | v0.5 brand+structure pass; could land under `/handbook` OR own top-nav slot OR `/members` extension — placement TBD. |
| **Personas v2** (external git repos per member + own pages `/members/[slug]/<persona-id>` + sharing model + refresh button from active git repo + cross-member granting) | ~1-2 wks of external-repo plumbing on top of route + UI work. Out of v0.4 envelope. v0.4 keeps PersonaPanel v0.2 as-is. | v0.5+ when persona-builder skill matures. CI slug-folder integrity check (H68) is the v0.4 prerequisite. |
| **Academy linking** (internal + external course material) | v0.5+ strategic feature. Placement under `/handbook` OR own top-nav slot OR external — TBD. | v0.5+ when first Academy content lands. |
| **GBrain Q&A integration with cmd-K** (semantic search across meetings + events + projects + decisions + members) | Catalog too small for v0.4; GBrain integration earns own scope. Anton confirmed defer. | v0.5+ when GBrain Q&A surface is production-ready; could land in `/handbook` OR cmd-K palette anywhere. |
| **AI moderation/onboarding/support bots** | v0.5+ candidate; Anton confirmed implement intent. Could live in Telegram OR platform OR both. | v0.5+ design discussion. |

### Privacy-flip deferrals (each requires its own ADR when re-evaluated)

| Item | Why deferred from v0.4 | Re-evaluate when |
|---|---|---|
| **`/decisions` + `/decisions/[slug]` anonymous flip** | Anton's "hide all possible PII" stance in chat-22. Markdown still public in git repo. | v0.5+ subject to PII audit task: grep `docs/decisions/*.md` for member-identifying fragments + sanitize. ADRs are sanitized governance memory per ADR-0001; flip should be safe post-audit. |
| **`/members` + `/members/[slug]` anonymous flip** | Per-member opt-in privacy collection (~2 wks of out-of-band work) needed | v0.5+ post member opt-in collection. |
| **`/projects` + `/projects/[slug]` anonymous flip** | Refs individual contributors + git handles; privacy review needed | v0.5+ once project showcase patterns settle. |

### v0.4-deferred features (placement clearer)

| Item | Why deferred from v0.4 | Re-evaluate when |
|---|---|---|
| **Search via cmd-K command palette (GBrain-powered)** | Catalog too small; v0.5+ feature with GBrain integration | v0.5 when content density justifies + GBrain stable |
| **Dark mode** | Token system foundation in v0.4 lays groundwork; design pass adds 200+ contrast pairs | v0.5+ after structure proves stable |
| **Full brand identity** (logo mark + illustrations + motion + extended palette + mascot decision) | v0.4 locks wordmark + accent ramp; full pass needs design or crowdsource | v0.5+ brand pass |
| **Polish localization** | EN-only v0.4; doubles content cost for marginal gain | v0.5+ with next-intl + community PL contributors |
| **Member-profile activity feed** | Q5.6 dropped from v0.4 per Anton's pure-PostHog-team-page lock | v0.5+ with explicit anti-comparison design pass |
| **Storybook component documentation** | <30 shared components; RTL tests + on-page usage suffice | v0.6+ if multi-dev onboarding becomes friction |
| **Analytics (Plausible cookieless)** | First-impression friction; community scale doesn't justify | v0.5+ with traffic justification + GDPR/DPA review |
| **Member photo upload UI** | GitHub avatar suffices; upload adds storage + moderation | v0.6+ if requested + storage decision lands |
| **Onboarding tour** | Empty-state hints + existing flow suffice | v0.6+ if first-time UX metrics show drop-off |
| **Lobste.rs-style invite tree visibility** | Status-signaling risk per manipulation audit | v0.5+ once 20+ invitations accumulate AND with anti-manipulation design pass |
| **`/about` content depth** | v0.4 Phase C ships thin `/about` (charter pointer + roadmap); full editorial later | v0.5+ if anonymous→apply conversion lags |
| **3-level IA breadcrumbs** | v0.4 IA shallow (2 levels) | v0.6+ if entity nesting deepens |
| **Per-language language switcher in footer** | Slot reserved in v0.4 but empty | v0.5+ with next-intl |
| **Editorial photography for detail page heroes** | Full-bleed hero requires asset library we lack | v0.6+ optional |
| **Bottom tab bar mobile nav** | Hamburger preserves scroll real estate | v0.6+ only if mobile traffic dominates + member feedback supports |
| **Onboarding tour (interactive)** | Empty-state hints suffice in v0.4 | v0.6+ |
| **Phase B + Phase C of v0.4 if not activated post user-test** | Conditional on Phase A landing data | After Phase A v0.4.0 ships + user-test review |

---

## 18. Open questions for chat-23 (spec-writer)

Items chat-22 brainstorm leaves for spec-writing decisions:

| Q | Surface | Note |
|---|---|---|
| **O1** | Hero copy beyond Q-1.1 sentence (sub-line, dual CTA labels, next-event ribbon copy) | `design-shotgun` mid-spec; Telegram CTA URL needs Anton |
| **O2** | Exact wordmark setting (kerning, letter-spacing, weight choice between Semibold and Bold) | `design-shotgun` visual lock |
| **O3** | Accent ramp exact hex values — verify the proposed `#f59e0b` ramp or pick alternates | `design-shotgun` color lock |
| **O4** | `/handbook` content — does Warsaw have a separate `roadmap.md` for the roadmap pointer? Or does it reference `PROJECTS.md`? | spec § with chat-23 community input |
| **O5** | Footer link choices (RSS index? Charter? License? GitHub repo? Telegram invite?) | spec §, low-stakes |
| **O6** | `<Avatar>` initials algorithm (handle-first-letter only — DO NOT derive from name parts; H59-aligned to avoid pseudo-identification) | spec §, mechanical |
| **O7** | Mobile slide-in nav animation curve + duration | spec §, design-shotgun |
| **O8** | Detail page sidebar collapse breakpoint (Phase B target) | spec §, mechanical |
| **O9** | "Your week" dashboard data sources — derive from `event_rsvps.json` + `lib/kudos.ts` + `/this-week` link — confirm composition | spec § |
| **O10** | i18n string namespace structure (flat keys? nested by surface?) | spec § |
| **O11** | RSS feed item shapes — title + link + description + pubDate; do we add author? guid? | spec § |
| **O12** | `<Tag>` color mapping (stage/status/type chips — single neutral or per-value tint?) | `design-shotgun` |
| **O13** | Per-project Decisions section data model — which frontmatter field maps ADRs to projects? `project:` field? Match-by-keyword? | spec § + chat-23 ADR data layer audit |
| **O14** | 30-min user-test session findings (MANDATORY per office-hours sharpening) | chat-23 owns; amend brainstorm if needed before spec lock |

---

## 19. Done-criteria check (per handoff §"Done means")

- [x] **Brainstorm output saved** to `docs/specs/2026-05-17-community-platform-v0-4-brainstorm-output.md` (this file).
- [x] **All 28 [blocking] Qs answered.** (Q-1.1, Q-1.2, Q-1.3, Q0.1, Q0.2, Q0.4, Q0.5, Q1.1, Q1.2, Q1.3, Q2.1, Q2.2, Q2.3, Q2.7, Q3.1, Q3.2, Q4.1, Q4.2, Q5.1, Q5.2, Q5.6, Q5.7, Q6.1, Q8.1, Q8.6, Q9.1, Q10.1, Q10.2 — 28 ✓.)
- [x] **≥70% [tuning] Qs answered.** All 38 tuning Qs in the questionnaire are answered (100% ≥ 70%).
- [x] **[locked] out-of-scope items confirmed** (§13 — Q11.1–Q11.6 all ✓).
- [ ] **Chat-23 spec-writing handoff drafted** at `docs/specs/2026-05-18-community-platform-v0-4-spec-writing-handoff.md` (next step in this chat).
- [x] **V0_5_BACKLOG.md** updated with chat-22 deferrals (§17 above; appended in same commit as this doc).

---

## 20. Self-review (per HANDOFF_PROTOCOL §1 C1–C4)

**C1. Codebase verification:**
- ADR-0012 path verified (`docs/decisions/0012-community-platform-v0-3-discovery-posture.md` read). ✓
- Current routes verified against STATE.md "Live routes" section. ✓
- `proxy.ts` PUBLIC_PATHS pattern verified. ✓
- `next/font` + `next/image` config approach matches existing `next.config.ts` conventions. ✓
- `app/globals.css` + Tailwind config + shadcn/ui stack verified per CONSTRAINTS line 17–19. ✓
- `persona-builder/personas/<slug>/*.public.md` convention verified (mark-spasonov, anton-s, dmitry-b folders exist). ✓
- v0.2.0 `Ask GBrain` CTA location verified (memory `project_community_platform.md` referenced). ✓

**C2. Security self-review:**
- ADR-0014 amendment increases anonymous surface area; H56/H57 hardenings guard against session leak in `/` anonymous render. ✓
- Avatar URL allowlist (H59) prevents SSRF via arbitrary `<Image src>`. ✓
- RSS feed surface (H61) explicitly excludes gated content with excerpt length cap. ✓
- `/handbook` anonymous-public surface does NOT include ADR markdown content (Q6.1 (i) lock); links to GitHub only. ✓
- ADR-0013 dropped → no `/decisions` flip → no new attack surface for gated content. ✓
- No new write surfaces in v0.4; no new authentication paths. ✓
- Manipulation-risk audit (§14B) yields three new hardening constraints (passive "Your week", neutral ribbon framing, no-scarcity defaults). ✓

**C3. Internal consistency:**
- Q1.1 + Q0.5 coordinate: `/` anonymous landing + signed-in 302→`/home`. ✓
- Q2.1 + Q2.3 coordinate: top-nav "Handbook" slot + Handbook content scope (no ADR UI per Q6.1 (i)). ✓
- Q2.2 (`/calendar` unify) + Q9.5 (RSS) coordinate: `/feed/meetings.xml` + `/feed/events.xml` plus optional `/feed/calendar.xml` union (chat-23 O5). ✓
- Q5.6 + Q5.7 + Q3.2 Phase B note: all consistent (Phase B activates detail-template upgrades; Phase A wraps existing v0.3 templates). ✓
- Q6.1 + Q9.5 coordinate: drop `/feed/decisions.xml` (gated source). ✓
- H63 dropped (no `/decisions` flip) + H68 added (CI slug-folder integrity); H66 still applies for `/events/[slug]` anon-public RSVP roster visibility. ✓
- Phase A scope (~20-25 files) consistent with Q10.1 + Q10.2 (brand work pulled into Phase A). ✓
- D-numbering continues v0.3's D1–D20 (this doc starts at D21 — D21-D44 = 24 IDs). ✓
- H-numbering continues v0.3's H30–H55 (this doc starts at H56 — H56-H68 minus H63 = 11 IDs). ✓
- V0_5_BACKLOG additions cover every "good idea, not v0.4" surfaced. ✓

**C4. Ambiguity check:**
- "Pure PostHog team-page" member profile (Q5.6) decomposed into specific layout sections (header card / bio / Working-on / social links). ✓
- "Token-based CSS variables" (Q8.2) decomposed into specific migration steps. ✓
- "Hard-cut migration" (Q10.3) explicitly contrasted with feature-flag alternative. ✓
- "WCAG 2.1 AA" (Q9.1) decomposed into 6 specific verifiable elements. ✓
- "Phase A committed; B + C conditional" (Q10.1) decomposed into 3 phase tables with deliverables. ✓
- Q5.6 PersonaPanel v0.2 preserved as-is + Personas v2 deferred to v0.5+ explicitly named. ✓
- `/handbook` content scope (Q6.1 (i) resolution) explicitly stated: charter + roadmap + GitHub-link-for-ADRs + v0.5+ placeholders; NO ADR content surfaced via UI. ✓
- ADR-0014 has status / amends / decision / consequences / implementation lines so chat-23 doesn't have to invent them. ✓
- All 14 open questions (O1-O14) have surface + note so chat-23 knows which skill resolves each. ✓

---

*Drafted 2026-05-17 in chat-22 via `superpowers:brainstorming`. Replaces the "organize 14 surfaces" v0.4 scope earlier in chat-21 prep — Anton escalated mid-prep to "world-class community platform" per `plan-ceo-review` SCOPE EXPANSION mode.*

*Next chat (23): `superpowers:spec-writer` writes spec §14 from this doc + drafts ADR-0014 + runs `design-shotgun` mid-stream for visual lock + runs MANDATORY 30-min user-test session before spec lock. Handoff at `docs/specs/2026-05-18-community-platform-v0-4-spec-writing-handoff.md` (drafted in same chat-22 commit).*
