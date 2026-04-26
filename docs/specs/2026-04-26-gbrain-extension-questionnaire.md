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

> **Anton:**

### 1.2 What's the actual current pain that members complain about (or that you observe)?
*Pick top 2-3 from this list, add your own:*
- [ ] Knowledge dies in scrollback (hard to find what someone said last week)
- [ ] No good way to discover what other members are working on
- [ ] Hard to know which meetups/events are coming
- [ ] Onboarding new members is repetitive
- [ ] Nobody reads long messages
- [ ] News & links flood the channel; signal lost in noise
- [ ] Q&A answers don't carry forward (next person re-asks)
- [ ] Cross-language friction (PL/EN)
- [ ] Other: ____________

> **Anton:**

### 1.3 What's the single most-valuable thing GBrain could do for members in the next 90 days?
*Force-rank one. Think about which feature, if it shipped, would make ≥5 members say "ok this is now indispensable."*

> **Anton:**

---

## 2. Strategic priorities

### 2.1 Which of these matters more in the next 6 months?
*Pick one ranking:*
- [ ] **Depth** — make GBrain phenomenal for the existing 19 members (delight current users, slow growth ok)
- [ ] **Breadth** — make GBrain attractive enough that the community grows to 100+ (member acquisition is the metric)
- [ ] **Fork-readiness** — make GBrain a template other communities can clone (OSS distribution is the metric)
- [ ] **Commercial viability** — start exploring what's monetizable (paid tier, premium features, B2B sale)

> **Anton:**

### 2.2 What's your time budget for GBrain over the next 30 days?
*This shapes which ideas are realistic.*
- [ ] < 4h/week (small features, infra fixes only)
- [ ] 4-10h/week (one medium feature)
- [ ] 10-20h/week (one big feature or two medium ones)
- [ ] 20+h/week (substantial expansion)

> **Anton:**

### 2.3 What's your monthly cost ceiling for GBrain operating costs (LLM, hosting, etc.)?
*Spec §5 said < €20/mo for v0.1; restate or revise.*

> **Anton:**

### 2.4 Are you open to *replacing* parts of the current architecture, or strict additions only?
- [ ] Replace freely — best architecture wins
- [ ] Additions only — current architecture is settled
- [ ] Replace with explicit ADR + my approval per change

> **Anton:**

---

## 3. What to add (or rule out)

### 3.1 Bot capabilities — for each, mark Want / Maybe / Skip / Already-thought-about-this:

| # | Capability | Want | Maybe | Skip | Note |
|---|---|---|---|---|---|
| B1 | `/ask <question>` — RAG Q&A over the archive |  |  |  |  |
| B2 | `/related <message>` — find similar archived posts |  |  |  |  |
| B3 | `/summarize` (reply to a thread) — Gemini summarizes long Telegram threads |  |  |  |  |
| B4 | `/event-rsvp` — bot manages event RSVPs in Meetups topic |  |  |  |  |
| B5 | `/poll <question>` — quick poll, results archived |  |  |  |  |
| B6 | `/translate <to>` — bilingual support (PL ↔ EN) |  |  |  |  |
| B7 | `/onboard` — interactive onboarding for new members |  |  |  |  |
| B8 | Voice-note → transcribed archive |  |  |  |  |
| B9 | `/search <query>` — semantic search over archive |  |  |  |  |
| B10 | Other (your idea): _________ |  |  |  |  |

### 3.2 Digest extensions:

| # | Capability | Want | Maybe | Skip | Note |
|---|---|---|---|---|---|
| D1 | Per-topic digests (e.g., Tools & Stacks weekly) |  |  |  |  |
| D2 | Weekly recap digest |  |  |  |  |
| D3 | Per-member "what did I miss?" DM |  |  |  |  |
| D4 | Auto-categorize `#kb` items into sub-topics via Gemini |  |  |  |  |
| D5 | Edit-aware ingestion (re-archive on Telegram edit) |  |  |  |  |
| D6 | Other: _________ |  |  |  |  |

### 3.3 Repurpose / adjacent products:

| # | Capability | Want | Maybe | Skip | Note |
|---|---|---|---|---|---|
| P1 | Public-facing community blog (archive → warsawai.community) |  |  |  |  |
| P2 | Community newsletter (archive → Substack/Buttondown) |  |  |  |  |
| P3 | Job board (Builds & Pitches → /jobs page) |  |  |  |  |
| P4 | Events calendar (Meetups → public iCal) |  |  |  |  |
| P5 | Member spotlight automation |  |  |  |  |
| P6 | Multi-community fork template (OSS distribution) |  |  |  |  |
| P7 | Sponsor/CRM webhook from archive |  |  |  |  |
| P8 | Other: _________ |  |  |  |  |

### 3.4 Archive-as-data:

| # | Capability | Want | Maybe | Skip | Note |
|---|---|---|---|---|---|
| A1 | Embeddings index → Q&A (Phase 2 in spec) |  |  |  |  |
| A2 | Knowledge graph (entities: people, tools, projects) |  |  |  |  |
| A3 | Stale-knowledge detector (flag items > N months old) |  |  |  |  |
| A4 | Conflict detector (contradicting items in archive) |  |  |  |  |
| A5 | Member contribution leaderboard |  |  |  |  |
| A6 | AI-assisted moderation (review `#kb` for quality) |  |  |  |  |
| A7 | Other: _________ |  |  |  |  |

---

## 4. Constraints to surface

### 4.1 What MUST stay invariant in any new feature?
*(e.g., "consent rules", "OSS-first", "no PII", "≤€20/mo", "no commercial offering yet")*

> **Anton:**

### 4.2 What's currently broken or annoying that you want addressed alongside any new feature?
*(e.g., "the `_news-log` JSON files clutter git history", "bot commits trigger noisy auto-deploys", "I wish I could see digest cost in real-time")*

> **Anton:**

### 4.3 Are there any features you've seen in another bot/community/product that you want? (Inspiration is welcome.)

> **Anton:**

### 4.4 Anything you explicitly DON'T want, even if it's technically feasible?
*(e.g., "no LLM in DMs", "no automated moderation actions", "no commercial features yet")*

> **Anton:**

---

## 5. Open-ended

### 5.1 In one sentence — what would make 0.2.0 (real-channel launch) a clear "yes ship it"?

> **Anton:**

### 5.2 In one sentence — what would make 1.0.0 a clear "yes ship it" (knowing 1.0 is reserved for production-grade declaration)?

> **Anton:**

### 5.3 Anything else you want to surface that the questions didn't cover?

> **Anton:**

---

## What happens next

After you fill this out:

1. Commit this file with your answers.
2. Open a fresh chat and paste the prompt from [`2026-04-26-gbrain-next-chat-prompt.md`](./2026-04-26-gbrain-next-chat-prompt.md).
3. The new chat reads this filled questionnaire, runs the `superpowers:brainstorming` skill, generates 8-12 candidate ideas grouped by your priorities, and proposes a top-3 to take through full design + plan + implementation in subsequent sessions.

The next chat will NOT implement anything. Brainstorming → spec → plan → implement is the canonical flow per CLAUDE.md. We're at the brainstorming entry.
