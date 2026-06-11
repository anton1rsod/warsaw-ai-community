---
ai_generated: true
model: claude-sonnet-4-6 (draft) / claude-fable-5 (orchestration)
generated_at: 2026-06-11
persona_source: personas/nazar-k/persona-nazar-k.md (self-authored interview, schema 1.0, created 2026-05-21)
signed_by_member: false
---
# Evaluation: Kolo Events — Nazar K.

> **AI-ghostwritten simulation** drafted from Nazar's self-authored persona file.
> Nazar has NOT reviewed, edited, or endorsed this draft. Not a substitute for his actual judgment.

Domain fit: **practitioner → familiar** — my tags are iGaming media buying, PPC/UAC infrastructure, S2S attribution, and funnel economics. Kolo is consumer-social with a community-ops product layer. I can read the acquisition math and the monetization logic cold; I cannot speak to community product design, retention loops inside a social graph, or club management UX from experience.

## My first question, answered

**"Show me the minimal testable funnel we can push live this week with min budget. What's the exact CPA and first-purchase unit economics?"**

Here is the honest attempt from evidence only.

**Channels with audience sizes (dimension 9):**
- @thewwarsaw Telegram: 30,775 [34]
- warszawa_diaspora Instagram: 37,000 [28]
- ukrainianinpolandpl Facebook group: 33,662 [38]
- @afishawawa Telegram: 5,040 [35]
- UAinWarsawPL Telegram: 2,810 [36]
- warsawafisha Telegram: 950 [37]

Total named reachable audience: roughly 110,000 follows across those surfaces (deduplicated rough estimate from evidence: ~50,000 active uniques [dim 9]). First 100 users is one cross-post to a single channel. Zero paid spend required for cold acquisition at the user side.

**Comparable pricing for organizers (dimension 2):**
- Meetup Standard: ~$24–45/mo [1][2]; organizer exodus documented at €99 for 6 months [3]
- Luma Plus: $59/mo [7]
- Heylo Plus: $19/mo; Pro: $59/mo [9]
- InterNations: €60 first year [8] — proves expats in the same bracket pay for community access

**Raw addressable organizer market (dimension 5):** ~50 inferred active RU/UA event organizers in Warsaw (no registry exists, this is an inference from named sources). At Creator Pro €10–20/mo (concept §7.2), that ceiling is €500–1,000 MRR from organizers — on a good day, if 100% converted, which is fantasy. Realistic conversion on a free-first platform with zero-paid-wall principle: unknown, because there is no invoice on the table today.

**The CPA problem — where my math breaks down:**
For user-side User Pro (€3–7/mo), there is no comparable showing that THIS audience (RU/UA Warsaw diaspora) converts to a consumer social sub anywhere in the evidence. The IRL-social comparables (Timeleft €18M ARR, Partiful) are US/Western-Euro markets [23][24]. The only Warsaw-specific payment data point is InterNations at €60–100/yr [8], but that product has documented dark-pattern billing causing rage-quits [8].

**Verdict on the funnel math:** I can model a $1–2k organic test — one week of cross-posts across the named Telegram/IG channels, count registrations, measure D7 retention. CPA for free users = near zero on organic. CPA for first paying organizer = **unquantifiable today** because all monetization is "planned" (concept §7.1). There is no funnel to push live this week. That is the single biggest number missing.

## What makes me bullish here

The distribution channels are named, sized, and reachable without a developer or ad budget [dim 9]. One DM list gets you 20 organizers; one cross-post gets you the first 100 users. The Meetup price-shock is live and documented with quotable organizer anger [3][4][44][45] — that's a real migration window. The IRL-social wave has institutional tailwind and fresh VC money [23][24][25][48]. The Joiner data point (40,000 downloads, €500k raise, verbatim UA-in-Warsaw user story [18][19]) tells me the demand for this category is real and present in exactly this geography. warszawa_diaspora's 37,000 followers [28] proves that if you build a single-source event discovery feed for this audience, they find it and follow it.

## What makes me skeptical here

**The free-first principle kills my ability to run unit economics.** "Сначала вырастить сообщество, потом монетизировать" is the precise phrasing of the teams I've watched run out of runway before they ever saw a positive ROI. You cannot test WTP if you've stated publicly that the product is permanently free with advance warning before any change. When Couchsurfing flipped the paywall overnight the community forked [56] — Kolo has pre-committed to that same trust promise. That's a Couchsurfing trap in writing.

The real incumbent is Telegram + Google Forms — **free, installed, where the audience already lives** [13][14][15]. The switching cost to Kolo is low on paper, but the organizer habit is already set and costs zero. Zero WTP comparables exist for THIS specific audience in THIS city (evidence pack red-team fact #2). The organizer monetization TAM at ~50 reachable accounts [dim 5] is €500–1,000 MRR ceiling at 100% conversion — that is a feature, not a business.

## Failure patterns I recognize

**The "infinite runway" trap** maps directly. Free-first with a social graph = burn runway growing a DAU metric before a single euro is invoiced. I've watched teams obsess over user count and feature polish while the P&L stayed empty. The concept is feature-rich (clubs, chats, friends, GCal, moderation, HEIC upload, 3 languages) — that is a lot of engineering before first dollar.

**Tracking architecture before launch** — there is no mention of an attribution or conversion-event setup anywhere in the concept. If you can't instrument which acquisition channel produced your first paying organizer, you cannot optimize spend or effort. I would not push a single dollar of paid acquisition into this without S2S-equivalent analytics on organizer conversion.

**LTV over first-purchase thinking (inverted here):** I believe in high-LTV retention. But the concept has no retention hook tied to payment — User Pro benefits (priority in attendee list, earlier notifications) are weak enough that I'd predict high churn at month 2. The LTV math only works if the social graph lock-in (friends + clubs + chat history) genuinely raises switching cost. That is a product assumption, not a marketing one — I can't validate it from my seat.

## My scorecard

| Pillar | Score | Why |
|---|---|---|
| **Problem** | 3 | Telegram fragmentation is real and structurally documented [22][27]; Joiner verbatim UA-in-Warsaw loneliness story [18]. But zero first-person "too many chats" complaint quotes found in desk research [dim 3 honest gap]; no organizer verbatim admin-pain quote in evidence. Institutional proxy, not screaming demand. |
| **Market** | 2 | ~50,000 reachable users [dim 9]; ~50 inferred organizers [dim 5]. At Creator Pro €10–20/mo and realistic conversion, SOM is sub-€10k MRR. User Pro math is entirely unconfirmed WTP. Bottom-up doesn't reach $1M SOM without aggressive assumptions not in evidence. |
| **Demand** | 3 | warszawa_diaspora 37k followers [28] + Joiner 40k downloads + €500k raise [18][19] + IRL-social VC wave [23][24][25] confirm category demand. Meetup organizer exodus is live [3][4][44][45]. But zero direct "I would pay for Kolo" signal — all proxy. |
| **Solution** | 3 | Geographic+language wedge is unoccupied (confirmed zero direct competitors [dim 1+2]); PWA live; feature set ships the core loop. Claim about Locals.md closure is unverified [dim 7, 10*] — weakens one competitive argument. Wedge is plausible, unproven. |
| **Viability** | 1 | All monetization "planned" (concept §7.1). Free-first principle actively delays the test. No invoice possible in <4 weeks. Comparable WTP data exists for adjacent tools [1][7][8][9] but none documented for this specific audience. CAC-to-LTV model does not exist yet. |

**Red-team from my seat: pivot** — the product and niche are real; the revenue model needs to be tested before the social graph grows large enough that switching costs make it uncomfortable to add a paywall.

## My verdict

**PIVOT on timing of monetization.** The audience is there, the channels are cheap [dim 9], the Meetup migration window is open right now [3][4][44][45], and the niche is genuinely unoccupied [dim 1+2]. I don't kill this. But I've personally burned $100k of investor money by optimizing the wrong metric before hitting stable ROI, and this founding team has publicly committed to a free product with advance-notice paywalls — that is the exact "beautiful corporate structure before stable revenue" trap I've watched kill rounds. Pick one monetizable segment (organizers), run a $0-cost DM campaign to 20 of them this week, ask for €15/mo for Creator Pro right now, and count YESes. If 5 of 50 say yes without a feature being built, the business exists. If zero say yes, you have a community project, not a startup.

> Script-computed from my scorecard (`scripts/scorecard.py`): **PIVOT — 12/25, red-team: pivot** (no evidence caps applied)

## The one experiment I'd run next

**Cold-outreach WTP test. Budget: €0 cash, 3 hours of time. Timeline: 7 days. Pass bar: 3 paid commitments (card on file or bank transfer received) from organizers at €15/mo.**

DM the organizers of the 10 named Warsaw clubs and recurring groups visible in the evidence (Ukrainian House Warsaw [42], Meet & Speak [41], Board Game Hub, Warsaw International [39], Language Exchange [40], plus 5 inferred RU/UA organizers via @afishawawa [35] and warsawafisha [37]). Pitch one sentence: "Kolo replaces Telegram signup chaos — €15/mo, cancel anytime, no contract." No deck, no demo video. If they ask to see it, send go.kolo.events. Count how many say yes and put a card down before you build another feature. That single data point buys every subsequent decision. Anything less than 3 paying accounts in 7 days from a warm list that size tells me the hypothesis is wrong at the price point — and I'd rather know that for €0 than for €10k of paid traffic.
