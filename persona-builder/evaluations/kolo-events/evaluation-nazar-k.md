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

## Part 2 — Standalone deep dive
*(Written in plain language for a general audience.)*

### How I'd think about this

I'm a media buyer. I've managed over $1.5M in ad spending across Facebook and Google, mostly in high-stakes industries where every euro has to earn back more than it costs. My job is to find out, as cheaply as possible, whether a bet is worth making — and then scale hard once the numbers say yes. I do not scale before the numbers say yes. I did that once. It cost me $100k of investor money, and it nearly ended my career.

When I look at Kolo, I see a product that has real distribution channels sitting there, named and sized, for free. There's a 37,000-follower Instagram account for Warsaw events in Russian [28]. There's a Facebook group with 33,662 members for Ukrainians in Poland [38]. There's a Telegram channel with 30,775 followers [34]. In my world, that's not a challenge — that's a gift. Getting your first 500 users costs zero ad spend. One well-written cross-post to the right channel, and you're there.

Here's what I'd do in the first 30 days. Not theory — a literal test script.

**Days 1–7: Measure what you have.** Before posting a single thing, set up tracking that tells you exactly where each new signup came from. Not Google Analytics. A direct source tag on every link — one link for @thewwarsaw, a different one for the Facebook group, a different one for @afishawawa. If you can't tell me on day 8 which channel gave you which users, you've already wasted the experiment. I've watched teams run campaigns for weeks and then argue about "which channel worked" because nobody tagged the links. Don't be that team.

**Days 8–14: Post one piece of content to each of the three biggest channels**, in that order — @thewwarsaw first (30k, Telegram, most direct), then the Facebook group (33k), then warszawa_diaspora Instagram (37k, but Instagram organic reach is slower). Each post is one specific value proposition: "Kolo is a single feed of all RU/UA/EN events in Warsaw. No more checking 10 Telegram chats." Include the tagged link. Count how many people click it, sign up, and come back exactly 7 days later. That last number — who came back — is the only one that matters.

**Days 15–21: DM 20 organizers.** Not email. Not a form. A direct message to the organizers running the clubs you can already see: Ukrainian House Warsaw [42], Meet & Speak [41], the board game group, the language exchange groups. One sentence: "We built a free tool that replaces your Telegram signup chaos. Try it for a month, and if you want to unlock the analytics and priority features, it's €15/mo, cancel anytime." Count how many say yes and give you a card.

**Days 22–30: Count three things, nothing else.** Total signups (by source). Day-7 return rate. Number of organizers who paid or committed verbally. Everything else is noise.

### My own numbers

Here's the honest math.

The combined audience across the named channels is roughly 110,000 follows [dim 9]. In my experience, a single organic cross-post to a warm, relevant community converts to clicks at around 1–3%. That's 1,100 to 3,300 clicks. Of those, maybe 20–40% complete a signup — call it 220 to 1,320 new registered users from a single campaign week. Let's be conservative: 300 real signups.

Now the harder question: how many come back in 7 days? In community and social apps I've studied, D7 retention — the share of new users who return one week later without being pushed — is typically 10–25% for products that genuinely solve a daily habit. For apps that are interesting once but don't create a reason to return, it drops to 3–5%. At 300 signups and 10% D7 retention, you have 30 active weekly users after one push. At 25%, you have 75.

That is honest. That is not failure. That is data. The question is whether those 30–75 people are the seed of something self-reinforcing, or whether you need to keep pumping the top of the funnel forever.

For organizers: the inferred pool is ~50 active, reachable accounts [dim 5]. At a realistic 10% conversion to a paid Creator Pro tier at €15/mo, you're looking at 5 paying organizers — €75 MRR. At 20% conversion, €150 MRR. That is not a business. It's a signal. If the signal is strong, the next question is whether there are more organizers in other Warsaw communities you haven't found yet, or whether you need to look at a different monetization path entirely.

The free User Pro math (€3–7/mo from attendees) is not testable yet. There is no comparable showing that this specific audience — RU/UA Warsaw diaspora — pays for a consumer social subscription anywhere in the evidence. InterNations gets €60/year from expats [8], but it has 20 years of brand and a global network. You do not have that. I would not build a business model on that assumption until someone has paid you once.

### My three recommendations

**One: Add source tracking before the first post goes live.** Not optional. I don't care if it takes a day to set up. Without it, you will not be able to make a single data-driven decision after the test. Every link that goes into a Telegram channel, a Facebook group, or an Instagram bio needs a unique tag so you can see, in a simple spreadsheet, which channel gave you which users — and which of those users came back. This is the equivalent of what I call server-side tracking in paid campaigns (where the server confirms a real conversion, not just a click). Here, your "conversion" is a D7 return visit, and you need to trace it back to its source.

**Two: Run the WTP test (willingness to pay — meaning: are people actually ready to hand over money?) this week, before building anything else.** DM 20 organizers. Ask for €15/mo. Record every response word for word. If 3 of them say yes and give you a payment method, the organizer model is real and you should build toward it. If zero say yes, you have a community project that may still be worth running — but you should stop calling it a startup until you understand why nobody paid. This test costs nothing except your time. Running it later, after you've built more features, costs you months of misdirected work.

**Three: Define your retention number before your growth number.** The trap I've fallen into, and watched others fall into, is optimizing for signups when the only number that matters early is whether people come back. 500 signups means nothing if 480 of them never open the app again. Before your next public push — before you post to the Instagram account with 37,000 followers — agree on a D7 retention target. In my experience, anything above 20% for a new community app is a strong signal. Below 10% means the product is not yet creating a habit. Post to the big channels only after you know the retention number from the small-channel test, because once you've burned the big audience's attention once, you can't get it back cheaply.

### What would change my mind

**What moves me to GO:** Three paying organizer accounts — card on file, first payment processed — within 14 days of outreach to the 20-person DM list. That single data point proves that at least some part of the intended monetizable audience sees enough value to give you money before features exist. Combined with a D7 retention rate above 15% from the first organic post, that's enough for me to say the business hypothesis is real and worth building toward at speed.

**What moves me to KILL:** Zero paid commitments from organizers after direct outreach to 20 warm accounts, AND a D7 retention rate below 8% from the channel test. Both signals together tell me the core hypothesis is wrong in its current form — either the audience doesn't feel the problem sharply enough to pay, or the product doesn't create enough reason to return, or both. At that point, the smart move is not to build more features. It's to have an honest conversation with the founding team about whether this is a community project or a startup — because those are two different things with two different success criteria, and there is nothing wrong with either one.
