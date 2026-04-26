# GBrain extension brainstorm — questionnaire

**Date:** 2026-04-26
**For:** Anton, to fill out before the next chat
**Purpose:** Surface what we're optimizing for so brainstorming converges on ideas that actually matter.

> **How to use:** Skim sections 1-5. Answer with as much or as little detail as you want — bullet points are fine. Mark **[skip]** for any question you don't want to answer; brainstorming will work around it. Save your answers in this file (overwrite the questions, or fill below each one), commit, and reference it from the next chat's opening prompt.
>
> Estimated time to fill: **15-25 min** thoughtful, or **5-10 min** quick.

---

## 1. The community at a glance

### 1.1 Who is the community for, in one sentence?
*(e.g., "Warsaw-based founders/engineers building or shipping AI products")*

> **Anton:** Warsaw-based builders, researchers, and operators serious about practical AI/ML — talking to each other, sharing news, meeting weekly in person, and shipping member projects (per [charter.md](../../community/charter/charter.md)).

### 1.2 What's the actual current pain that members complain about (or that you observe)?
*Pick top 2-3 from this list, add your own:*
- [ ] Knowledge dies in scrollback (hard to find what someone said last week)
- [ ] No good way to discover what other members are working on
- [x] Hard to know which meetups/events are coming
- [x] Onboarding new members is repetitive
- [ ] Nobody reads long messages
- [ ] News & links flood the channel; signal lost in noise
- [x] Q&A answers don't carry forward (next person re-asks)
- [ ] Cross-language friction (PL/EN)
- [x] Other: assistant-style access to the internal KB and meeting history

> **Anton:** Honest framing: the community is very early (only 1 offline meeting so far, low post volume), so most of the listed pains aren't *complaints yet* — they're things I'd rather build before they become pains. Concretely:
>
> 1. **No onboarding** — would be cool to have; new members currently get no structured intro.
> 2. **Assistant-style KB access** — a chat where members ask questions and get answers grounded in the internal KB. Same surface should let them ask "when's the next meeting?" or "what was discussed at the last one?".
> 3. **Meeting overview / continuity** — gather and surface past meetings so context carries forward instead of being re-asked.
>
> So the shape of the answer is less "fix this pain" and more "build the assistant + onboarding rails before the community scales and the pains arrive."

### 1.3 What's the single most-valuable thing GBrain could do for members in the next 90 days?
*Force-rank one. Think about which feature, if it shipped, would make ≥5 members say "ok this is now indispensable."*

> **Anton:** A **Telegram-native, KB-grounded assistant** that members can ask questions and get answers cited from the community's own archive (`#kb` items, meeting notes, ADRs, member projects).
>
> Onboarding and meeting continuity are valuable but subordinate — they ride on top of the assistant once it exists. The assistant compounds (more tagged content → better answers → more reasons to tag); onboarding scales linearly with new arrivals.

#### What GBrain ideally is (90-day vision)

A community brain that lives inside Telegram (where conversation already happens) and exposes the community's own accumulated knowledge as a conversational surface.

**Core promise to a member:** "Anything the community has explicitly preserved, you can ask GBrain about. It answers in plain language and cites the source messages."

**Surfaces members see (target end-state at day 90):**

1. **Q&A in DM or topic** — `/ask <question>` returns a grounded answer with citations to archive items. Default scope: the whole archive. Optional scope: a single topic.
2. **Onboarding flow** — new members trigger a short interactive intro (charter, current focus, who-builds-what, how `#kb` tagging works). Powered by the same archive the assistant uses.
3. **Meeting continuity** — "What was discussed at the last meeting?", "What's next?", "What's the cadence?" — answered from meeting notes + Meetups topic.
4. **Filtered news feed (per-topic)** — members subscribe to interest tags (e.g., "LLM training research", "agent frameworks", "Polish AI startups"). GBrain filters the incoming news firehose against those tags via Gemini and delivers a personalized stream (per-member DM or per-topic digest). Extension of the existing news digest, not a replacement.
5. **Existing daily digest** — keeps running; the assistant becomes the way members *interrogate* the digest's contents instead of just reading them.

#### 30 / 60 / 90 day plan

| Window | Theme | Ships | Success signal |
|---|---|---|---|
| **Days 0–30** | Foundation: assistant MVP + real-channel rollout | • `/ask` MVP grounded in current archive (markdown files), citations included<br>• Real-channel soft launch (**0.2.0**) on Warsaw AI Community Telegram<br>• Bot-token rotation done as part of launch hygiene | ≥3 organic `/ask` invocations from non-Anton members; consent flow validated on real channel |
| **Days 31–60** | Onboarding + meeting continuity | • Interactive `/onboard` flow for new members<br>• Meeting notes ingested into archive; "next meeting?" / "last meeting recap?" answered<br>• Topic-scoped `/ask --topic=<name>` | ≥5 distinct members ask real questions; ≥1 new member completes `/onboard` end-to-end |
| **Days 61–90** | Personalization + compounding | • Filtered per-topic news feed (subscribe → curated stream)<br>• Per-topic digests (D1 from §3.2)<br>• Per-member "what did I miss?" DM (D3 from §3.2) | News feed has ≥3 active subscribers; ≥10 distinct `/ask` users cumulative; vision criteria below met |

#### Non-goals for these 90 days

- Public-facing surfaces (blog, newsletter, public iCal) — Phase 2+ once the assistant is solid.
- Auto-moderation or auto-categorization actions — read-only is the default; nothing the bot does should require trust we haven't earned yet.
- Commercial features — covered by ADR-0004; not in scope.
- Multi-community fork distribution — only after our own deployment is battle-tested.

#### What "indispensable" looks like by day 90

≥5 members have asked GBrain a real question that saved them scrollback time *and* got a useful, cited answer. New members report onboarding felt structured rather than thrown-in. Meeting context is no longer something Anton has to re-explain in chat. ≥3 members get personalized news they wouldn't have seen otherwise.

---

## 2. Strategic priorities

### 2.1 Which of these matters more in the next 6 months?
*Pick one ranking:*
- [ ] **Depth** — make GBrain phenomenal for the existing 19 members (delight current users, slow growth ok)
- [x] **Breadth** — make GBrain attractive enough that the community grows to 100+ (member acquisition is the metric)
- [ ] **Fork-readiness** — make GBrain a template other communities can clone (OSS distribution is the metric)
- [ ] **Commercial viability** — start exploring what's monetizable (paid tier, premium features, B2B sale)

> **Anton:** **Breadth.** (Chose against admin-hat recommendation of Depth — the divergence is intentional. Anton's read: 19 members + 1 meeting is too thin a base; the community needs an inflow before features-for-current-members compound.)
>
> **Implication for §1.3's 30/60/90 plan** — the plan was written depth-first. Under a breadth orientation, the same surfaces ship but the success metrics and prioritization shift:
>
> - **Day 30** isn't *just* `/ask` MVP for current members — it's the assistant being *demonstrable* enough that prospective members joining the channel see value within their first session. Onboarding rises in priority (currently planned for day 60).
> - **Day 60** should fold onboarding *forward* (into days 0–30 if possible) so every new arrival hits a structured intro. Meeting continuity stays at day 60 as a retention layer.
> - **Day 90** personalization (filtered news feed) is now also a *member-acquisition* lever: prospective members can be told "subscribe to AI/ML tags relevant to you and you'll get curated signal."
> - **Public surfaces** that were marked non-goals (blog, public iCal) become candidates again, because breadth depends on outside-the-channel discoverability. Likely candidates for §3.3 P1/P4 to lift from "skip" to "want."
> - **Member acquisition mechanics** (referral/invite flow, public landing page, "what's GBrain?" demo) become explicit work items the depth plan didn't have.

### 2.2 What's your time budget for GBrain over the next 30 days?
*This shapes which ideas are realistic.*
- [ ] < 4h/week (small features, infra fixes only)
- [ ] 4-10h/week (one medium feature)
- [ ] 10-20h/week (one big feature or two medium ones)
- [x] 20+h/week (substantial expansion)

> **Anton:** 20+h/week. Combined with §2.1 = breadth, this is a substantial-expansion bet — the time budget is sufficient to ship the assistant *and* member-acquisition surfaces (onboarding, demo, public surfaces) in parallel. Brainstorming should treat L-effort items as feasible if they map directly to the §1.3 vision; should still flag the cost-of-context-switching risk if too many parallel tracks are proposed.

### 2.3 What's your monthly cost ceiling for GBrain operating costs (LLM, hosting, etc.)?
*Spec §5 said < €20/mo for v0.1; restate or revise.*

> **Anton:** **Phased ceiling — €50/mo by day 60.**
>
> | Window | Ceiling | Rationale |
> |---|---|---|
> | Days 0–60 | Stay on Gemini free tier (effectively €0–€20/mo) | Foundation phase + onboarding/meeting features run within current usage envelope (~1.7k tok/day measured). No need to spend yet. |
> | Day 60 onward | **€50/mo** | Unlocks for the personalization phase (filtered news feed, per-member DMs, scaled `/ask` traffic from breadth-driven member growth). Aligns with the 30/60/90 plan's day-60 inflection. |
>
> Brainstorming should: (a) prefer free-tier-first designs for days 0–60 features; (b) treat €50/mo as the binding constraint for days 60–90 features; (c) not propose anything that requires sustained spend above €50/mo within these 90 days.

### 2.4 Are you open to *replacing* parts of the current architecture, or strict additions only?
- [x] Replace freely — best architecture wins
- [ ] Additions only — current architecture is settled
- [ ] Replace with explicit ADR + my approval per change

> **Anton:** **Replace freely.** (Chose the most permissive option, against admin-hat recommendation of ADR-gated replacement.) Combined with §2.1 breadth + §2.2 20+h/week + §2.3 €50 by day 60, this is a "optimize for the right outcome, don't be sentimental about 0.1.x architecture" stance.
>
> **Brainstorming guidance:**
> - Treat the current architecture (direct-Gemini, archive-as-markdown, consent machine, Telegram-as-only-interface) as **default but negotiable**. Propose replacements when they materially serve the §1.3 vision under §2.1 breadth.
> - Do NOT propose change-for-change's-sake — replacement must have a clear win (cost, capability, simplicity, distribution).
> - Reconciling with CLAUDE.md docs-first principle: any *accepted* replacement still gets an ADR at the spec/plan-writing gate (i.e., after brainstorming converges, before implementation begins). This preserves the written-decisions trail without slowing brainstorming itself. ADRs can be retroactive within the same session as long as they precede `superpowers:writing-plans`.

---

## 3. What to add (or rule out)

### 3.1 Bot capabilities — for each, mark Want / Maybe / Skip / Already-thought-about-this:

| # | Capability | Want | Maybe | Skip | Note |
|---|---|---|---|---|---|
| B1 | `/ask <question>` — RAG Q&A over the archive | x |  |  | Core of §1.3 vision. Non-negotiable. Day-30 ship. |
| B2 | `/related <message>` — find similar archived posts |  | x |  | Useful as a `/ask` byproduct, not separate command in v1. |
| B3 | `/summarize` (reply to a thread) — Gemini summarizes long Telegram threads | x |  |  | High-utility, demoable, strong "wow" for breadth. |
| B4 | `/event-rsvp` — bot manages event RSVPs in Meetups topic |  | x |  | Telegram has native polls; build only if it solves meeting-overview better. |
| B5 | `/poll <question>` — quick poll, results archived |  |  | x | Telegram native polls already exist. |
| B6 | `/translate <to>` — bilingual support (**EN ↔ UK**, not PL) | x |  |  | **Anton specified EN + Ukrainian, not EN + Polish.** Signal about community composition: target audience is international/Ukrainian-Polish-bridge tech crowd in Warsaw, not native-Polish-only. Affects member-acquisition channels under §2.1 breadth. |
| B7 | `/onboard` — interactive onboarding for new members | x |  |  | Day-30 priority under breadth (member acquisition needs structured intro). |
| B8 | Voice-note → transcribed archive |  | x |  | Consent + cost + multi-language complexity (EN/UK voices). Defer. |
| B9 | `/search <query>` — semantic search over archive | x |  |  | Companion to `/ask` for list-style queries. |
| B10 | **News feed commands** — `/feed-subscribe <tag>`, `/feed-list`, `/feed-unsubscribe <tag>` to manage filtered per-topic feed subscriptions. **Source: best free AI feeds** (RSS, public APIs, GitHub trending, etc.) — no paid aggregators. | x |  |  | Member-facing surface for the §1.3 day-61-90 personalization layer. Sourcing pinned to free feeds for §2.3 cost discipline. |

### 3.2 Digest extensions:

| # | Capability | Want | Maybe | Skip | Note |
|---|---|---|---|---|---|
| D1 | Per-topic digests (e.g., Tools & Stacks weekly) | x |  |  | In §1.3 day 61–90 plan. |
| D2 | Weekly recap digest | x |  |  | Low-effort retention layer; complements daily digest at member-friendly cadence. |
| D3 | Per-member "what did I miss?" DM | x |  |  | In §1.3 day 61–90 plan. Compounds with B10 feed subscriptions. |
| D4 | Auto-categorize `#kb` items into sub-topics via Gemini |  | x |  | Useful for archive quality but invisible to members. Defer unless `/ask` quality demands it. |
| D5 | Edit-aware ingestion (re-archive on Telegram edit) | x |  |  | Quiet quality win — "bot is reliable" trust signal under breadth. Cheap to add. |
| D6 | Other |  |  | x | None for now. |

### 3.3 Repurpose / adjacent products:

| # | Capability | Want | Maybe | Skip | Note |
|---|---|---|---|---|---|
| P1 | Public-facing community blog (archive → warsawai.community) | x |  |  | SEO + discoverability moat under breadth. Member acquisition with no extra writing cost. **Lifted from "skip" per §2.1.** |
| P2 | Community newsletter (archive → Substack/Buttondown) |  | x |  | Complements P1 but adds operational overhead. Defer until P1 has traffic. |
| P3 | Job board (Builds & Pitches → /jobs page) |  | x |  | Strong long-term differentiator but premature at 19 members. |
| P4 | Events calendar (Meetups → public iCal) | x |  |  | Public iCal = "next Warsaw AI meetup" discoverable on Google + iOS Calendar = passive member acquisition. **Lifted from "skip" per §2.1.** |
| P5 | Member spotlight automation |  | x |  | Automated spotlight risks feeling spammy without curation taste. Defer. |
| P6 | Multi-community fork template (OSS distribution) |  |  | x | Out of scope under §1.3 non-goals + §2.1 (fork-readiness not chosen). Revisit at 0.4.x+. |
| P7 | Sponsor/CRM webhook from archive |  |  | x | ADR-0004 defers commercial. Out of scope. |
| P8 | Other |  |  | x | None for now. |

### 3.4 Archive-as-data:

| # | Capability | Want | Maybe | Skip | Note |
|---|---|---|---|---|---|
| A1 | Embeddings index → Q&A (Phase 2 in spec) | x |  |  | Required for `/ask` quality. Currently Phase 2 in spec; under breadth + 20+h/week ships at day 30 alongside `/ask` MVP. |
| A2 | Knowledge graph (entities: people, tools, projects) |  | x |  | Powerful for "who's working on X?" queries but heavy build. Defer unless `/ask` quality plateaus. |
| A3 | Stale-knowledge detector (flag items > N months old) |  | x |  | Archive too young (started 2026-04-25) for staleness to matter. Revisit at 6-month mark. |
| A4 | Conflict detector (contradicting items in archive) |  |  | x | Premature at current archive size. |
| A5 | Member contribution leaderboard |  |  | x | Incentivizes volume over quality. Wrong signal for "shipping over talking" community. |
| A6 | AI-assisted moderation (review `#kb` for quality) |  |  | x | §1.3 non-goal: read-only default; no automated moderation actions. |
| A7 | Other |  |  | x | None for now. |

---

## 4. Constraints to surface

### 4.1 What MUST stay invariant in any new feature?
*(e.g., "consent rules", "OSS-first", "no PII", "≤€20/mo", "no commercial offering yet")*

> **Anton:**
>
> 1. **Consent rules** — `#kb`/`#archive` tagging or topic-level consent only; `/gbrain-forget` always works. Per CLAUDE.md. Inviolable.
> 2. **OSS-first (MIT)** — per ADR-0001. New components default OSS unless explicit ADR exception.
> 3. **Docs-first** — every non-trivial decision becomes an ADR. Per CLAUDE.md.
> 4. **No PII in archive** — handles + timestamps + content only. Per spec §3 + §10.
> 5. **Telegram is the canonical conversation surface** — public web/blog/etc. are *outputs* of the archive, never replacements for the in-Telegram experience. Members shouldn't have to leave Telegram to participate.
> 6. **Cost discipline** — €50/mo ceiling at day 60 binding (per §2.3). No feature ships if it pushes over.
> 7. **Read-only by default** — bot does not take auto-actions on the channel (no auto-moderation, no auto-categorization that changes member-visible state).
> 8. **Founder approval gate** — no public surface (P1 blog, P4 iCal) goes live without explicit Anton go.
> 9. **Discoverability** — every member-facing command ships with `/help` integration *and* pinned-topic documentation. Goal: a member who joined yesterday can find every available capability without asking. Hidden / undocumented commands = no ship. *(Inverse framing in §4.4 item 9.)*

### 4.2 What's currently broken or annoying that you want addressed alongside any new feature?
*(e.g., "the `_news-log` JSON files clutter git history", "bot commits trigger noisy auto-deploys", "I wish I could see digest cost in real-time")*

> **Anton:** All of these — brainstorming should fold them into the relevant feature work or schedule them as standalone hygiene items.
>
> 1. **Bot-token rotation deferred to Phase E** — must happen at real-channel launch (carries to 0.2.0 launch session, not this brainstorm).
> 2. **`AI_GATEWAY_API_KEY` Vercel env left set-but-unused** — cleanup task; remove once Gemini-direct proves stable.
> 3. **Path-filter `ignoredBuildStep`** — disabled because `git diff HEAD^ HEAD` mis-handles Vercel shallow clones; re-attempt with `$VERCEL_GIT_PREVIOUS_SHA`.
> 4. **`_news-log/*.json` files clutter git history** — every digest commits ~3 JSON files into the archive, inflating `git log`. Decide: keep for audit / gitignore / move to derived runtime store.
> 5. **Bot commits trigger noisy auto-deploys** — proper fix is item 3 (path-filter).
> 6. **No real-time digest cost visibility** — need a `/cost` or dashboard surface to track spend against §2.3 €50 ceiling.
> 7. **`projects/gbrain/` monorepo deploy model undocumented** — Vercel project root was wrong in 0.1.0 (now fixed to `projects/gbrain/app/`); needs an ADR documenting the monorepo deploy convention.

### 4.3 Are there any features you've seen in another bot/community/product that you want? (Inspiration is welcome.)

> **Anton:** Selected 1, 2, 3, 7 from the admin-hat list. Will add more along the way during brainstorming.
>
> 1. **Slackbot-style `/onboard` carousel** — interactive-button flow as the UX bar for `/onboard` (B7).
> 2. **Discord's "rules gate"** — new members react to a charter message to confirm they read it before full channel access. Light-touch onboarding gate; pairs with B7.
> 3. **Notion AI's "ask the workspace"** — exact parallel to `/ask` (B1) including citation-style answers with source links. Reference UX for the assistant.
> 7. **Hacker News' "ask HN" / "show HN" tagging** — tag-based filtered surfaces; potential future extension via `#ask` / `#show` Telegram tags.
>
> *(Items 4–6 from the admin-hat list — Substack recommendation graph, Linear weekly recap, Pragmatic Engineer curation style — not selected this round.)*

### 4.4 Anything you explicitly DON'T want, even if it's technically feasible?
*(e.g., "no LLM in DMs", "no automated moderation actions", "no commercial features yet")*

> **Anton:**
>
> 1. **No LLM in DMs without explicit member opt-in.** Members shouldn't be DM'd by GBrain unless they invoked something or subscribed.
> 2. **No automated moderation actions** — no auto-delete, auto-ban, auto-warn. Read + summarize only.
> 3. **No commercial features yet** — no paywalls, no premium tiers, no sponsor placement. ADR-0004 stands.
> 4. **No scraping non-consented Telegram content** — `#kb` / topic-consent only. No silent ingestion of older messages without explicit opt-in.
> 5. **No proprietary lock-in** — anything we build should be exportable / forkable by members. No SaaS-only dependencies that hold the archive hostage.
> 6. **No real names by default** — handles only. If a member writes their real name in a message, that's their choice; we don't enrich.
> 7. **No analytics on member behavior beyond aggregate counts** — we don't track "who asked what" individually, only "N questions asked this week."
> 8. **No public exposure of `#kb` items without member consent** — even though OSS, the archive is currently private-by-default-public-by-readable-repo. Public blog (P1) gates per-item.
> 9. **No discovery-hostile UX.** Every command/feature ships with discoverable documentation — at minimum a `/help` listing all commands with descriptions, and pinned message in the relevant topic. Hidden commands or undocumented features = no ship. *(Positive framing: discoverability is invariant — see §4.1 item 9.)*

---

## 5. Open-ended

### 5.1 In one sentence — what would make 0.2.0 (real-channel launch) a clear "yes ship it"?

> **Anton:** *Bot deployed on the real Warsaw AI Community Telegram channel, `#kb` consent flow validated end-to-end with at least one non-Anton member, daily digest streaks for 3 consecutive days without intervention, and `/ask` MVP returning grounded cited answers to ≥3 sample questions Anton has pre-tested.*
>
> **Velocity note:** With Claude Code as primary executor, "day 30" is likely 1–2 weeks of focused sessions, not 4 calendar weeks. Brainstorming should treat the 30/60/90 labels as **ordered milestones**, not calendar deadlines. The criterion above is the gate; the date is whenever the gate is met.

### 5.2 In one sentence — what would make 1.0.0 a clear "yes ship it" (knowing 1.0 is reserved for production-grade declaration)?

> **Anton:** *GBrain operates reliably on the real channel for ≥30 consecutive days with no founder intervention required, ≥3 of the 5 surfaces (§1.3 vision) used weekly by ≥10 distinct members, the public-facing surface (P1 blog or P4 iCal) is live and producing measurable inbound member acquisition, and the architecture has been forked at least once by a third party (validates fork-readiness even though it wasn't a 6-month priority).*

### 5.3 Anything else you want to surface that the questions didn't cover?

> **Anton:**
>
> 1. **Community composition signal (EN/UK)** — captured in §3.1 B6 but reiterated: breadth targets EN + Ukrainian-Polish-bridge tech in Warsaw, not native-Polish-only. Affects member-acquisition channels.
> 2. **Velocity multiplier** — Claude Code as primary executor compresses the 30/60/90 timeline 2–3x. Brainstorming should bias toward more parallel tracks than a solo human could realistically do.
> 3. **Community is in pre-pain stage** — surfaced in §1.2: planned features are anticipatory, not corrective. Validate ideas against "would this matter at 100 members?" not "does this fix a current complaint?"
> 4. **Founder-as-primary-user risk** — for the next ~30 days Anton is both builder and one of the heaviest users. Brainstorming should explicitly check each idea for "does this work when Anton is *not* the only one using it?" to avoid building Anton-only invokables.
> 5. **Phase E firewall** — anything brainstorming proposes that touches the real channel (token rotation, first deploy) gets routed to a separate Phase E session, not implemented in the brainstorm chat.

---

## What happens next

After you fill this out:

1. Commit this file with your answers.
2. Open a fresh chat and paste the prompt from [`2026-04-26-gbrain-next-chat-prompt.md`](./2026-04-26-gbrain-next-chat-prompt.md).
3. The new chat reads this filled questionnaire, runs the `superpowers:brainstorming` skill, generates 8-12 candidate ideas grouped by your priorities, and proposes a top-3 to take through full design + plan + implementation in subsequent sessions.

The next chat will NOT implement anything. Brainstorming → spec → plan → implement is the canonical flow per CLAUDE.md. We're at the brainstorming entry.
