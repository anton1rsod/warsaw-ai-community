# Community Platform — engagement brainstorm (chat-51)

**Date:** 2026-05-28
**Chat:** 51
**Author:** Anton Safronov + Claude (Opus 4.7)
**Origin signal:** chat-50 `/admin/health` probe surfaced 0/2 active posters this week (0%) vs. v0.1 launch target ≥50%; chat-51 handoff opened the engagement question.
**Status:** Brainstorm — design approved by Anton; next step `superpowers:writing-plans` for v0.10.0 platform lifts (§4-§6 below).
**Output of:** `superpowers:brainstorming` per chat-51 handoff (`docs/specs/2026-05-28-community-platform-engagement-brainstorm-handoff.md`).
**Timeline note:** Original chat-51 handoff framed this as "4 weeks." With Claude-Code-paced dev (chat-52 plan + chat-53 ship = ~1-2 calendar days for v0.10.0), the calendar collapses to **~2 weeks total**, gated by Anton-paced ops (content seeding + alpha outreach), not by engineering throughput.

---

## §1 — Context: this is cold-start, not low-engagement

### What the metric actually says

`/admin/health` shows 0/2 active posters this week. The "2" is the **opt-in public roster** (Anton + Mark Spasonov per `community/members/roster.md:11-22`), not the 19 Telegram members. The metric tangles two distinct funnels: (a) opt-in conversion (currently 2/19 ≈ 10.5%) and (b) posting frequency among the opted-in (currently 0%).

### What `git ls-files` says

- **Statuses ever posted:** **1 total.** `community/status/2026-W18/anton-safronov.md`, content = `Hey Folks`, written 2026-05-03 14:04 UTC on ship day. That was a smoke test, not authentic content.
- **Statuses W19-W22 (last 25 days):** zero from anyone, including Anton.
- **Consents granted:** only Anton's (`29954f4 feat(community): anton1rsod platform consent`).
- **Member profiles edited / RSVPs / Thanks:** all platform write commits trace back to Anton's seeding + smoke-test runs. **Zero non-Anton write activity.**

### The honest framing

This is **not** an engagement problem where high-quality platform meets disinterested members. This is **cold-start before opening the door**: Anton has intentionally not invited the 17 Telegram members because the platform doesn't yet have enough content/value for their time. The brainstorm question becomes:

> **What content + features make Subploters' community platform valuable to its first 3-5 power users so they pull in the next cohort?**

This is the canonical cold-start problem and 2024-2026 industry best practice converges on a clear recipe (see §14 for citations).

### Locked decisions from chat-51 brainstorm dialogue

| Q | Decision | Implication |
|---|---|---|
| Target denominator | Signed-in members (not opt-in roster, not Telegram membership) | 25% target is against ~4-6 signed-in members by Day 14 |
| Binding constraint | Post UX friction *(refined to)* content sparsity + uninvited members | Lever family = platform-side small lifts + content-side seeding |
| Stall moment | None of the proposed UI-friction moments; reframed | Industry-best-practice playbook (research §14) |
| Approach | A — Seed → Lift → Recruit → Cadence (recommended) | v0.10.0 ships the 3 platform lifts; rest is Anton-paced ops work |

---

## §1.5 — Stocktake: what already exists in repo

The seed step (§3) isn't a blank canvas. Subploters has substantial already-shipped artifacts that should be surfaced for first-time visitors. Pre-fill the seed work against this inventory:

### Projects (`projects/` + repo root)

| Project | Path | State |
|---|---|---|
| Community Platform | `projects/community-platform/` | v0.9.1.1 shipped 2026-05-28 (this very platform — meta but real; 1450 tests; production at https://warsaw-ai-community-platform.vercel.app) |
| GBrain | `projects/gbrain/` | v0.1.2-ask-bundle on draft PR #25; staging-gated rollout pending; first real-channel soft launch in `0.2.0` |
| Persona Builder | `persona-builder/personas/` | 5 personas: anton-s, dmitry-b, heorhii-k, maksym-pavlenko, mark-spasonov |
| Subploters Brand | `community/brand/` (v1.2) | Brand v1.2 locked 2026-05-25; full identity (wordmark + PL monogram + amber-field S + tagline "Every venture is a subplot.") |

### Decisions (`docs/decisions/`)

15 ADRs ratified: 0001 OSS-first · 0002 Governance (founder+core) · 0003 Telegram topic structure · 0004 Commercial-track accelerated · 0005 Cadence (weekly offline + events) · 0006 Secret handling · 0007 gbrain Phase 1 · 0008 File-based embeddings · 0009 Prompt modules · 0010 Summarize deferred · 0011 Code-graph layer · 0012 Community-platform discovery posture · 0014 v0.4 anonymous landing · 0015 Admin write permissions for events. *(0013 dropped; ADR-0016 candidate proposed below in §3.2.)*

### Events (`community/events/`)

- 1 past: `2026-05-21-meetup-4` (AI Community Meetup #4)
- **0 upcoming** — `[TBD: Anton picks next event date + topic]` is a Step 1 deliverable (§3.4)

### Roster (`community/members/`)

- Public roster: 2 (Anton + Mark Spasonov)
- Telegram channel: 19 total
- Signed-in / consented platform members: 1 (Anton only)

### Subploters brand (`community/brand/`)

- v1.2 locked 2026-05-25 (chat-41); wordmark + standalone S + per-city stamp; built-in-public footnote stripped
- Geist + JetBrains Mono on platform headlines and nav (v0.7-v0.8 typography realignment)
- Warm-maximalist palette (cream/ink/dust/accent-amber) shipped v0.6-v0.9.1.1
- COMMUNITY_NAME env flipped to "Professional Subploters Association" on prod + preview

**Implication:** the platform isn't "feature-rich, content-empty." It's "feature-rich, content-curated-but-private + ops-undocumented." The seed step's job is making the existing artifacts visible and inviting, not generating from scratch.

---

## §2 — Strategy: 4-step recipe (Claude-Code-paced)

| # | Step | Owner | Calendar | Output |
|---|---|---|---|---|
| 1 | Seed 5 behavioral-template artifacts (§3) | Anton (no dev) | Day 0-3 (parallel to dev) | 5 content artifacts in repo |
| 2 | Ship 3 platform lifts (§4-§6) | Dev via chat-52 plan + chat-53 ship | Day 1-3 (~2 chats / 1-2 working days) | v0.10.0 tagged & deployed |
| 3 | Manually recruit 3-5 alphas (§7) | Anton | Day 3-10 | 3-5 signed-in members with at least one engagement |
| 4 | Founder weekly cadence (§8) | Anton | Day 0 onward, indefinitely | ≥1 Anton-authored status / week sustained |

**Sequencing principle:** content seeding (Step 1) **starts immediately** in parallel with the v0.10.0 plan-write (Step 2); manual recruiting (Step 3) starts once seed + at least Starter Pack ships; founder cadence (Step 4) is the daily/weekly discipline throughout — not a milestone, an ongoing posture.

**Checkpoint target (~Day 14):** 5 signed-in alphas × ~50% weekly posting (Anton + 1-2 alphas authentically engaging) ≥ 25% target. The math holds *if* Anton's cadence holds.

**Why ~2 weeks, not 4:** Claude-Code-paced dev compresses Step 2 from "1 wk human-engineer" → "~1-2 chats / 1-2 calendar days." The binding constraint is Anton-time for ops (Steps 1, 3, 4), not engineering throughput. Realistic floor is set by relationship-building speed for Step 3 (cold DMs need response windows + walkthrough scheduling).

---

## §3 — Step 1: Seed 5 behavioral-template artifacts

Per cmgr.live's research: *"Your first five posts aren't 'content' in the traditional sense; they are behavioral templates."* The first 5 posts model what participation looks like; they tell new members "this is the bar, this is the tone, this is the format." Translation to Subploters' write surfaces, pre-filled with real repo state where available:

### 3.1 — Weekly status (`/this-week`)

- **What:** Anton posts one `/this-week` status before any alpha is invited.
- **Tone:** invitation, not broadcast. Vulnerability acceptable. Specific asks welcome.
- **Format:** prefer the one-line shipping log primitive (§5) once it ships; before then, plain text in the existing editor.
- **Pre-fill (suggested seed content — Anton's voice to taste):**
  > "Shipped Subploters platform v0.9.1.1 — forms/admin warm reskin closeout. Drafted the cold-start brainstorm (§docs/specs/2026-05-28-...). Next: ship v0.10.0 (Starter Pack + one-line shipping log + Telegram echo) and DM 3-5 of you to come kick the tires. Open question: which AI-community member would you most want to see post here? Reply in Telegram #subploters-meta."

### 3.2 — Decision-in-motion (`docs/decisions/`)

- **What:** Anton publishes a **draft** ADR that visibly invites input before being marked Accepted.
- **Pre-fill — ADR-0016 candidate** "Telegram echo for /this-week statuses (opt-in, supergroup topic)":
  - File path: `docs/decisions/0016-telegram-echo-statuses.md` (status: **Proposed**)
  - Drives §6 (Telegram echo platform lift); doubles as the demonstrated-governance seed
  - Authors: Anton; reviewers TBD by §3.4 recruit
  - **Tone discipline:** publish as Proposed, NOT Accepted; mark Accepted only after ≥2 weeks of clean operation with no privacy complaints (per O6 below)
- **Why this works as a seed:** existing ADRs (0001-0015) are all post-decision artifacts; a Proposed-status ADR is something members can react to. That's behavioral-template gold.

### 3.3 — Project showcases (link to `projects/<slug>/` + `community/brand/`)

The platform's `/projects` page reads from `projects/` and `persona-builder/`. Pre-fill the showcase list with real WIP work that's already in repo:

- **GBrain** (`projects/gbrain/`) — v0.1.2-ask-bundle on draft PR #25; describe state, surface staging gates as the visible work-in-progress.
- **Persona Builder** (`persona-builder/personas/`) — 5 personas already drafted (anton-s, dmitry-b, heorhii-k, maksym-pavlenko, mark-spasonov); show how the framework + the in-progress personas compose.
- **Subploters Brand v1.2** (`community/brand/brand.md`) — full identity locked, wordmark + PL monogram + amber-field S + city-stamp architecture; link to the explorations folder showing the chat-36 → chat-41 design journey.
- **Community Platform itself** (`projects/community-platform/`) — meta but legitimate; surface that it's open-source and members can contribute (link to v0.10.0 plan once chat-52 lands).
- **Per-project ask:** each showcase entry names a "what would unblock a 2nd contributor?" question (1-line max). For GBrain: "soft-launch gate participation." For Persona Builder: "your own persona — pair with anton-s to draft." Etc.

### 3.4 — Event (`community/events/`)

- **Current state:** only `2026-05-21-meetup-4` (past). **No upcoming events.** This is the real cold-start gap on the events axis.
- **Pre-fill — placeholder for next event:** `[TBD: Anton picks date in Day 0-3 window]`. Concrete suggested seeds (pick one):
  - **"Subploters office hours #1 — open Q&A on platform direction"** — 30-60 min, online, Anton hosts, low-prep
  - **"GBrain v0.1.2 demo + Q&A"** — anchors gbrain's PR #25 review with a public moment
  - **"Persona Builder workshop — draft your persona in 60 minutes"** — pairs with §3.3's persona-builder ask
  - **"AI Community Meetup #5 — Warsaw IRL"** — the natural continuation of meetup-4
- **Operationalize:** Anton creates `community/events/[DATE]-[slug]/README.md` via `/admin/events/new` (admin UI exists per ADR-0015) or via direct PR.

### 3.5 — "Open question" status

- **What:** 1 discussion-starter status naming a specific question + asking for response in `/this-week`, in Telegram, or via PR comment.
- **Pre-fill — strongest seed (also doubles as ADR-0016 cross-reference):**
  > "Open Q for the bootstrap: should `/this-week` echo to a Telegram topic automatically (opt-in)? Trade-off: visibility loop (members see their posts mirrored; Telegram members peek at platform activity without auth) vs. cross-channel noise (Telegram already gets enough threads). Reply on `/this-week` or in Telegram #subploters-meta. Drafting ADR-0016 either way; your input shapes the default."
- **Alternative seed:** "Which 3 of the 19 of you should I invite as platform alphas first? Reply in DM if you'd rather not say publicly." (More personal; risks framing as kingmaking — Anton's call which posture fits.)

### 3.6 — Tone discipline (applies to all 5 seeds)

For every seed: **invitation > broadcast**, **vulnerability > polish**, **specific ask > general post**, **one-line shipping > paragraph essays**. Per cmgr.live: *"A good host sets the table, pours the first drink, and offers the first three provocative questions to get the gears turning."*

---

## §4 — Step 2a: Starter Pack (~2-3 days dev → ~1 chat in Claude-Code time)

### Pattern source

Bluesky Starter Packs (June 2024 → present). arXiv:2501.11605 found starter packs *accounted for up to 43% of follows during peak periods*, and *users included in starter packs posted 60% more than similar non-included users.* The mechanic: one-click bridge to a populated feed without asking the new user to curate.

### Translation to Subploters

There's no follow-graph on Subploters; the equivalent affordance is **a curated "Start here" panel** that surfaces 3-5 hand-picked artifacts a new signed-in member should engage with first. Echo of Bluesky's one-click affordance but for **read engagement**, not network formation.

### Implementation sketch

- New component `app/components/StarterPack.tsx` (Server Component).
- Reads `community/starter-pack.yaml` (or JSON per O3) listing 3-5 artifact references by type + slug, e.g.:
  ```yaml
  items:
    - { type: "decision", slug: "0016-telegram-echo-statuses" }
    - { type: "project", slug: "gbrain" }
    - { type: "event", slug: "[NEXT_EVENT_TBD]" }
    - { type: "status", slug: "2026-W22/anton1rsod" }
    - { type: "member", slug: "anton-safronov" }
  ```
- Renders above existing `<HomeFeed>` on `/home` when the viewer is signed-in. Hidden for anonymous.
- Each entry: title, MonoLabel type-tag, 1-line excerpt, link to detail surface. Re-uses existing `<EventCard>`, `<ListItem>`, `<Pill>` primitives — no new design tokens.
- Curated by Anton manually; updates land via PR. Admin UI deferred to v0.10.1 (manual YAML edit is fine for v0.10.0).
- **Pre-fillable from §1.5 stocktake:** the first starter-pack.yaml ships with concrete entries above (no `[TBD]` except next-event-slug).

### Out of scope (v0.10.0)

- Admin UI for editing the starter pack (defer to v0.10.1 if friction shows up)
- Per-member personalization (always-curated is correct for cold-start; personalization is a v0.11+ problem)
- Analytics on click-through

### Hardenings

- **H113** (proposed): `starter-pack.yaml` referenced slugs must resolve to real artifacts; build-time check + test asserting every entry has a real target.
- **H114** (proposed): YAML schema validated with Zod at boot; bad schema fails fast.
- **H115** (proposed): Server Component only — no client state; renders fully under SSG-with-revalidation per existing `/home` pattern.

---

## §5 — Step 2b: One-line shipping-log primitive (~2 days dev → ~1 chat-task in Claude-Code time)

### Pattern source

Discord 2025-2026 community-growth research: *"someone might hesitate to start a conversation cold but readily responds to a thoughtful question."* Low-barrier entry beats high-barrier entry. Twitter/X's 280-char limit + Bluesky's similar constraint are the canonical "lower the bar" mechanic.

### Why this fits

Current `<StatusEditor>` is a rich Markdown editor with a 4-row textarea. It's well-built but signals "write something thoughtful." For members who shipped a thing yesterday and want to say so in 8 words, the rich editor over-promises. A parallel one-line primitive lets them post without ceremony.

### Implementation sketch

- Existing `<StatusEditor>` gains a second input mode: a single-line input next to the rich textarea, labeled "Shipping log: 1 line, plain text".
- Capped 280 chars; no Markdown rendering; renders as a `<blockquote>` on `/this-week` (visually distinct from rich Markdown posts).
- Same `postStatus` action; same `community/status/<week>/<handle>.md` storage path; frontmatter gains a `mode: "shipping-log"` field so render-time can pick the right output style.
- Toggle UI: two `<Pill>` buttons "Quick" / "Rich" above the inputs; default = "Quick" for first-time posters; "Rich" sticks per-session via cookie.

### Storage contract

```yaml
---
week: 2026-W22
author: anton1rsod
mode: shipping-log  # or "rich" (default if absent)
updated_at: 2026-05-28T18:00:00.000Z
---

Shipped Subploters v0.9.1.1 + drafted the cold-start brainstorm.
```

### Out of scope

- Append-only "shipping log timeline" view (defer to v0.11+; per-week is fine for v0.10.0)
- Emoji prefix shortcuts (✨🚀💡 — defer; no taxonomy yet)
- Mentions / hashtags

### Hardenings

- **H116** (proposed): plain text only — server-side strip of `<>` characters + Markdown control chars before persist; renders as `<blockquote>` with `textContent` interpolation only.
- **H117** (proposed): `mode` frontmatter validated; unknown values reject at write time, default to "rich" at read time (forward-compat).

---

## §6 — Step 2c: Telegram echo (~1-2 days dev → ~1 chat-task in Claude-Code time)

### Pattern source

Discord research: *"create engagement hooks that give members reasons to return daily."* For Subploters, the audience-uncertainty problem is real — members post and don't know if anyone reads. Telegram has 19 members already; auto-echoing platform statuses to Telegram closes the visibility loop *and* gives non-platform Telegram members a peek at platform activity without crossing the auth bridge.

### Implementation sketch

- After `postStatus` returns ok, fire `notifyTelegram({ handle, week, body, url })`.
- `notifyTelegram` posts a quote to a Telegram channel or topic — see O2 for which.
- Body format: `📝 @{handle} posted /this-week ({week}): "{body up to 200 chars}…" — {url}`. No PII beyond GitHub handle (matches `/this-week` itself).
- Opt-in toggle on `/me/edit` — new field `telegramEcho: boolean` in member profile; default OFF (per Anton's hide-PII default stance). Each member opts in explicitly.
- Re-uses gbrain's existing Telegram bot infrastructure for the API call.

### Privacy model

- The Telegram channel is the existing Subploters supergroup (or a dedicated topic within it) — already-public-to-19-members; not a public Telegram channel.
- Members already in Telegram see the echo; signed-in platform members see their own posts mirrored if they're also in Telegram.
- Opt-in default OFF respects ADR-0014's hide-PII posture.
- **ADR-0016** (proposed in §3.2): "Telegram echo for /this-week statuses (opt-in, supergroup topic)" — draft as part of seed step; mark Accepted only after ≥2 weeks of clean operation.

### Hardenings

- **H118** (proposed): opt-in required; profile-frontmatter `telegramEcho: true` is the only trigger.
- **H119** (proposed): Telegram API failure does NOT block the status write — `notifyTelegram` is fire-and-forget; status persists regardless.
- **H120** (proposed): rate-limit guard — max 1 echo per `(handle, week)` (prevents accidental edit-spam echo).
- **H121** (proposed): no member's body is echoed without prior opt-in record present at write time.

### Out of scope

- Reverse echo (Telegram → platform): defer; one-way echo first.
- Image/file attachments: not supported on /this-week, not in scope here.
- Multi-channel echo (Discord, X, etc.): no.

---

## §7 — Step 3: Manual alpha recruiting (Anton, Day 3-10)

### Pattern source

Paul Graham, *Do Things That Don't Scale*: *"The most common unscalable thing founders have to do at the start is to recruit users manually."* Courtland Allen sent 150 personal emails to launch Indie Hackers. Discord guides: *"The first 50 are your foundation"* — manually, 1-by-1.

### Pre-filled candidate pool (from `persona-builder/personas/`)

Anton has already done 1-on-1 discovery with 5 people (the persona-builder roster). 4 of them are non-Anton and prima facie alpha candidates because they passed the 1-on-1 bar already:

| Persona | Path | Why a fit |
|---|---|---|
| **Mark Spasonov** | `persona-builder/personas/mark-spasonov/` | Already on public roster; RevOps / AI-augmented sales ops; will tolerate alpha rough edges |
| **Dmitry B.** | `persona-builder/personas/dmitry-b/` | Status in folder — Anton confirms recency + tolerance |
| **Heorhii K.** | `persona-builder/personas/heorhii-k/` | Anton's call on recency |
| **Maksym Pavlenko** | `persona-builder/personas/maksym-pavlenko/` | Anton's call on recency |

Plus any of the other 15 Telegram members Anton has had at least one 1-on-1 with. **`[TBD: Anton's pick of 3-5]`.**

### How

- **Whom:** 3-5 hand-picked from the candidate pool above. Criteria: (a) Anton has had ≥1 1-on-1 with them; (b) tolerant of alpha rough edges; (c) participation models behavior for others (prefer practitioners who'll post about shipping vs. lurkers).
- **What:** personal Telegram DM (not group-channel post). Suggested template (Anton's voice; adjust to taste):
  > "Hey [name], been working on Subploters — the AI-community platform I've been mentioning. It's ready enough that I want a small group to try it before I open it up to the rest of the channel. 5-10 min walkthrough whenever's good? Also: happy to seed your first /this-week post if you'd rather see one go up than write one."
- **What's the ask:** sign in once via GitHub OAuth, take a look, optionally post a status. Not a commitment to weekly cadence — that comes later.
- **Anton offers:** screen-share walkthrough; seed-their-first-post-for-them option; respond to their first post within 24h with a `<ThankButton>` press.

### Measure

- **Don't measure conversion %.** Measure relationships: who said yes, who said no, who said "maybe later," what did they say about the platform.
- **Track:** signed-in count by week (Anton manually counts new consent commits — they land in git so it's just `git log --grep "platform consent"`).
- **Anti-pattern:** group-blast in `#general` to "save time." The cmgr.live research is explicit: *"Manual recruiting forces you to focus on tightly-defined groups."*

### Out of scope

- Automated invitation email sequences
- Telegram bot blast (use existing 1-on-1 DM)
- Conversion-optimized landing pages

---

## §8 — Step 4: Founder cadence (Anton, starting now — ongoing)

### Pattern source

cmgr.live: *"If you aren't willing to be the most active person in your room for the first 90 days, you haven't built a community; you've just built an empty digital warehouse."* Paul Graham's HN model: dang has been doing the same moderating job every single day for over a decade.

### Commitment

- **At least 1 `/this-week` status per week, starting now**, sustained indefinitely.
- **Prefer the one-line shipping-log primitive (§5) once it ships** — models the low bar.
- **Post even on slow weeks.** "Nothing new shipped this week — pulled into [other thing]" is itself a behavioral template (it's OK to have slow weeks).
- **Respond within 24h** to any non-Anton status with a `<ThankButton>` press + optional comment in Telegram if discussion warrants.

### Why this is the wedge

Members watch what the founder does, not what the founder says. Empirical: Anton has posted **once** (the "Hey Folks" smoke). Until Anton posts authentically and consistently, no member-recruiting outreach (Step 3) carries weight. Step 4 isn't a milestone, it's the daily/weekly discipline that makes Steps 1-3 land.

---

## §9 — Phase B (chat-22 Q5.6/5.7/5.8/Q3.2) — deferred to "Step 5"

### What chat-22 Phase B was

Per `V0_5_BACKLOG.md:103-106`:
- Q3.2 — unified 3-variant detail-page template family
- Q5.6 — PostHog team-page-style member profile (`/members/[slug]`)
- Q5.7 — Luma-style event detail (`/events/[slug]`)
- Q5.8 — project portfolio framing with per-project Decisions section

### Why defer

Detail-page polish **amplifies content that exists.** With sparse content + no posting cadence, polished detail pages risk Potemkin-village criticism from sharp alpha members. The research (§14) is explicit: content + recruiting beat features at cold-start.

### When to re-evaluate

At the **~Day-14 checkpoint** review (§10):
- If alphas are posting and reading: pick up Phase B with their feedback informing tightened scope (likely Q5.7 event detail + Q5.8 project portfolio first; Q5.6 PostHog member only if `/members` traffic justifies).
- If alphas are NOT posting: re-open the brainstorm. Engagement question isn't features; deeper diagnosis needed.

### Scope discipline

Phase B is **preserved-but-resequenced, not subtracted.** chat-22's design analysis is still valid; the timing is what changed.

---

## §10 — Success metrics

### Hard metric (existing)

- `/admin/health` active-poster ratio ≥ 25% of signed-in members at the **~Day-14 checkpoint**.
- Computation source: `lib/health-metric.ts` — unchanged.

### Funnel metrics (new, Anton-tracked manually)

- **Signed-in count by week**: `git log --all --grep "platform consent" --oneline | wc -l` (or read `community/consents/` once it's populated).
- **Weekly status count**: `find community/status/<week>/ -name "*.md" | wc -l`.
- **First-post conversion**: % of new sign-ins who post a status within their first 7 days. (Manual tally for v0.10.0; lib helper at v0.11+ if signal proves useful.)

### Soft metrics (Anton-perceived, qualitative)

- Vibe: does `/home` feel populated when Anton lands on it as a logged-in member?
- Alpha feedback: what do recruited alphas say in 1-on-1 follow-ups about platform-vs-Telegram value?
- Organic non-Anton writes: any RSVPs, Thanks, profile-edits, or status posts from members other than Anton.

### Anti-metrics

- **Don't measure** Telegram-channel views, vanity-style follower counts, or page-view totals.
- **Don't add** PostHog/Plausible analytics this cycle (deferred per `V0_5_BACKLOG.md:78`).

---

## §11 — Out of scope (chat-52 do-not-build)

- Gamification, streaks, leaderboards, scarcity framing (`V0_5_BACKLOG.md:113-114` manipulation-resistance gate; would need its own ADR before any consideration).
- Email digest (Telegram echo first; revisit if signed-in count > 10 and Telegram engagement saturates).
- Analytics (PostHog/Plausible) — deferred per `V0_5_BACKLOG.md:78`.
- Read-surface polish (chat-22 Phase B Q5.6/5.7/5.8/Q3.2) — deferred to Step 5 post-Day-14 review (§9).
- Onboarding tour, photo upload, lobste.rs-style invite-tree visibility (`V0_5_BACKLOG.md:81, 84, 137-142`).
- Search via cmd-K (catalog still too small per `V0_5_BACKLOG.md:66`).
- Dark-mode design pass (`V0_5_BACKLOG.md:68` — own scope).
- Full brand-identity v2 (`V0_5_BACKLOG.md:70` — own scope; brand v1.2 stays locked).

---

## §12 — Open questions (chat-52 writing-plans locks)

| ID | Question | Recommended default |
|---|---|---|
| O1 | One-line shipping-log primitive alongside existing rich editor, or replace it? | Alongside (preserves richness for those who want it; mode-toggle defaults to one-line for first-time posters) |
| O2 | Telegram echo: dedicated channel, or topic in existing supergroup? Opt-in default ON or OFF? | Topic in existing supergroup (reuses existing trust boundary); opt-in default OFF (matches hide-PII posture) |
| O3 | Starter Pack config: `community/starter-pack.yaml`, JSON, or first-class admin UI? | YAML (matches `community/events/` pattern); admin UI deferred to v0.10.1 |
| O4 | Anton's posting cadence: Sunday weekly, or "whenever shipped" (more authentic)? | Whenever shipped, with a soft commitment to ≥1/wk; demonstrates that the one-line primitive is for moment-of-shipping use |
| O5 | Day-14 review re-trigger criteria for Phase B: who decides, against what? | Anton + brief check vs. metrics in §10; if hard metric ≥ 25% AND ≥3 non-Anton signed-in, trigger Phase B; otherwise re-open this brainstorm |
| O6 | ADR-0016 (Telegram echo) — Proposed or Accepted at v0.10.0 ship? | Proposed; flip to Accepted only after ≥2 weeks of clean operation with no privacy complaints |
| O7 | Next event date + topic (§3.4 placeholder) | `[TBD: Anton picks during Day 0-3]` from the 4 candidates in §3.4 |
| O8 | Alpha picks (§7 placeholder) | `[TBD: Anton's pick of 3-5 from persona-builder roster + other 1-on-1-prior Telegram members]` |

---

## §13 — Version naming + chain

- **v0.9.1.x** — current line; v0.9.1.2 reserved for Anton-side prod-smoke regressions only (not engagement work).
- **v0.10.0** — engagement bootstrap (Step 2 = §4 Starter Pack + §5 one-line shipping log + §6 Telegram echo). Hardenings H113-H121.
- **v0.11.0** — re-scoped Phase B (chat-22 Q5.6/5.7/5.8/Q3.2) IF triggered by Day-14 review (§9).
- ADR candidates: **ADR-0016** — Telegram echo for `/this-week` statuses.

---

## §14 — Research basis (industry best practice 2024-2026)

The 4-step recipe converges across 5 independent sources:

1. **First-5-posts as behavioral templates.** [cmgr.live — "The Great Seeding Misconception"](https://cmgr.live/blog/reddit/the-great-seeding-misconception-why-your-first-five-posts-matter-more-than-your-first-500-members/). *"Your first five posts aren't 'content' in the traditional sense; they are behavioral templates."* Specific seed types: weekly intro (host shares first), this-or-that poll, TIL, top-5 resources, newbie-vs-expert prompt. → Step 1 (§3).

2. **Founder most-active for 90 days.** Same source: *"If you aren't willing to be the most active person in your room for the first 90 days, you haven't built a community; you've just built an empty digital warehouse."* HN's dang precedent (daily moderation since 2007). → Step 4 (§8).

3. **Manual recruiting / Paul Graham doctrine.** [Paul Graham — "Do Things That Don't Scale"](https://www.paulgraham.com/ds.html). *"The most common unscalable thing founders have to do at the start is to recruit users manually."* Courtland Allen sent 150 personal emails for Indie Hackers; Airbnb went door-to-door. → Step 3 (§7).

4. **Bluesky Starter Packs.** [arXiv 2501.11605 — "Bootstrapping Social Networks: Lessons from Bluesky Starter Packs"](https://arxiv.org/abs/2501.11605). Starter packs *accounted for up to 43% of follows during peak periods*; *users included in starter packs posted 60% more*. One-click curation lets new users skip the cold-curation tax. → Step 2a (§4).

5. **Discord small-server growth playbook.** [Hashmeta — Discord Server Growth Complete Guide](https://hashmeta.com/blog/discord-server-growth-the-complete-guide-to-building-from-zero-to-10000-members/). *"The first 50 people are your foundation."* + *"Daily discussion prompts, weekly questions, or themed conversation days give members easy participation opportunities — someone might hesitate to start a conversation cold but readily responds to a thoughtful question."* → Step 2b (§5) + Step 2c (§6).

---

## §15 — Tradeoffs considered (Approaches B and C — why not picked)

### Approach B: chat-22 Phase B as-defined first, then seed

- **Pros:** preserves existing plan momentum; pretty read surfaces may impress alphas; chat-22 design analysis still valid.
- **Cons:** research consensus (§14) is explicit — polish without content is Potemkin village; dev work consumes Anton's time that should go to content seeding + manual outreach in cold-start phase.
- **Verdict:** not now. Phase B is preserved (§9) but re-sequenced to Step 5.

### Approach C: parallel Phase B + seeding + recruiting

- **Pros:** ambitious; covers more surface area; ships more in the ~2-week window.
- **Cons:** "Founder must be most-active" (§14, pattern 2) is incompatible with founder-spending-week-on-dev — Anton's time as engineer AND community-builder is finite. Even with Claude-Code-paced dev, sequencing matters: §3 + §8 (Anton ops work) need Day 0-3 mindshare; §4-§6 dev work is parallel-acceptable but must NOT crowd out content seeding.
- **Verdict:** not picked. Sequential is a feature, not a constraint.

### Approach not considered: "just keep building, defer engagement"

- Anton's chat-50 signal is unambiguous: engagement is the binding constraint. The platform is already at high quality. More features without content + members would be working on the wrong axis.

---

## §16 — Self-review (per `superpowers:brainstorming` checklist)

### Placeholder scan

- §3.4 has `[TBD: Anton picks next event date + topic]` — Anton-decision placeholder, listed in §12-O7 as an open question. Acceptable.
- §3.5 has alternative seed content — clearly marked as such; Anton picks. Acceptable.
- §4 starter-pack YAML example references `[NEXT_EVENT_TBD]` — links back to §3.4 / §12-O7. Acceptable (placeholder for a decision Anton makes during seed step, not a content gap in the doc).
- §7 has `[TBD: Anton's pick of 3-5]` for alpha picks — Anton-decision placeholder, listed in §12-O8 as an open question. Acceptable.
- §12 has 8 explicit Os with recommended defaults — those ARE the open questions; not placeholders elsewhere in the doc.
- No `TODO`, `XXX`, `FIXME`.

### Internal consistency

- §2 strategy table = §3-§8 deep dive — same 4 steps, same owners, same calendar (Day 0-3 seed, Day 1-3 dev, Day 3-10 recruit, Day 0+ cadence). ✓
- §4 (~2-3d → ~1 chat) + §5 (~2d → ~1 chat-task) + §6 (~1-2d → ~1 chat-task) ≈ 1 chat-plan + 1 chat-ship for v0.10.0. ✓
- §9 Phase B disposition matches §11 Out-of-scope row. ✓
- §13 v0.10.0 = §4+§5+§6 hardenings H113-H121 — matches sub-section hardenings. ✓
- §1.5 stocktake feeds §3 seed pre-fills (projects, ADRs, brand, persona-builder personas → §3.3 + §7). ✓
- Timeline anchors are consistent throughout: "Day 0-3 seed window," "Day 1-3 v0.10.0 dev," "Day 3-10 recruit," "Day-14 checkpoint."

### Scope check

- Single implementation plan: v0.10.0 with 3 features (Starter Pack + one-line primitive + Telegram echo). Step 1 (seed content) + Step 3 (recruit) + Step 4 (cadence) are Anton-paced ops work and do NOT go into a writing-plans pass — they go into Anton's personal calendar.
- v0.10.0 is plan-able in 1 chat (chat-52) and shippable in 1 chat (chat-53). ✓

### Ambiguity check

- "Alpha" defined in §7 as "hand-picked Telegram member with prior 1-on-1 contact, pre-filled candidates from persona-builder roster" — not ambiguous.
- "Active poster" = `/admin/health` metric per `lib/health-metric.ts` — unchanged definition, anchored to existing code.
- "25%" applies to denominator "signed-in members" — locked in §1, restated in §10.
- "Founder cadence" = ≥1 weekly status per §8 — explicit numeric commitment.
- "Day-14 checkpoint" used consistently throughout (§9, §10, §11, §12-O5).

### Outcome

No fixes needed; doc is internally consistent, ready for user review.

---

## §17 — Next step

Per `superpowers:brainstorming` checklist: user reviews this spec; if approved, hand off to `superpowers:writing-plans` for **v0.10.0 platform lifts** (§4 Starter Pack + §5 one-line shipping log + §6 Telegram echo) → produce `projects/community-platform/v0.10.0-plan.md`.

Step 1 (seed content), Step 3 (manual recruiting), Step 4 (founder cadence) do NOT need a plan-writing pass — they go straight into Anton's personal calendar. Suggested commitments:

- **Day 0-3 (now → +72h):** seed 5 artifacts per §3, including filling §12-O7 (next event) and §12-O8 (alpha picks)
- **Day 0 onward:** post ≥1 weekly status per §8
- **Day 3-10:** DM 3-5 alphas per §7 once at least Starter Pack ships
- **~Day 14:** Day-14 checkpoint review per §10 → decide Phase B re-trigger per §9
