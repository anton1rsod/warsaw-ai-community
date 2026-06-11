---
ai_generated: true
model: claude-sonnet-4-6 (draft) / claude-fable-5 (orchestration)
generated_at: 2026-06-11
persona_source: personas/mark-spasonov/persona-mark-spasonov.md (self-authored interview, schema 1.0, created 2026-04-29)
signed_by_member: false
---
# Evaluation: Kolo Events — Mark Spasonov

> **AI-ghostwritten simulation** drafted from Mark's self-authored persona file.
> Mark has NOT reviewed, edited, or endorsed this draft. Not a substitute for his actual judgment.

Domain fit: **familiar → practitioner gap** — my commercial tags (B2B SaaS, RevOps, SMB sales, quantitative capacity work) sit next to consumer-social, not inside it; I can read the unit economics and the chicken-and-egg dynamics but I will not pretend I have deep intuition on social-graph retention curves.

## My first question, answered
What's your definition of done in numbers, and how will you prove it?

The concept document has no answer. Zero. No MAU target, no organizer count, no revenue milestone, no cohort retention bar. Section 7 reads "planned" for every monetization line — which means today there is no invoice possible in under four weeks [evidence pack red-team, item 4]. When I ask this question in a sales org, most people cannot answer it. Kolo fails the same test. That is not a reason to kill it, but it is a reason to demand a one-page acceptance-criteria sheet before the next conversation.

## What makes me bullish here
Two things turn me from neutral to leaning in. First, the problem is structurally real: fragmentation across 30+ Telegram channels [22] is not a founder's claim — it is a documented distribution pattern. When warszawa_diaspora alone has 37,000 followers [28] for a single-source events feed, you know the demand to aggregate exists; people already voted with follows. Second, the incumbent pain on the organizer side is live and quotable: Meetup's price shock (from $29 to $99 for a six-month sub) generated named anger threads [3][4], active migration, and -50% new-member acquisition for affected groups [45]. A triggered organizer exodus is the cleanest WTP signal I know — it means someone was already paying and is now looking for an alternative.

## What makes me skeptical here
Free-first as a stated principle combined with zero monetization shipped [§7.1, §11] is not a product principle — it is a deferred test. I have watched operators call "we will grow first, monetize later" a strategy when they have not modeled whether the audience they are growing will ever pay, at what trigger, at what price. No A/B, no pricing page, no intent survey. The WTP evidence in the pack is for comparable products in adjacent markets [1][7][8][9] — none of it is for this audience in this city at this price point. That is a critical gap. Additionally, the total addressable organizer pool is inferred at ~50 accounts [pack §5]; even at Creator Pro €15/mo that is €750/month MRR ceiling before any churn. Not a business — an experiment. Someone needs to model what happens at 200 organizers before claiming the economics work.

## Failure patterns I recognize
*Operators who diagnose problems by accusation instead of by data.* The concept asserts organizers lose "2–5 h/week on signup/comms admin" as the core pain — but the evidence pack explicitly flags "zero verbatim Warsaw organizer-pain quotes" found [§3, HONEST-SEARCH GAPS]. That is the same pattern: a felt bottleneck stated as a fact, not a measured one. Before building the organizer toolset any further, run ten organizer interviews with a defined script and a measurable outcome: "do ≥7/10 name signup admin in their top-3 pains without prompting?" That is your acceptance criterion.

*Managers who set goals as conversation, not as acceptance criteria.* The roadmap [§10] is a feature list, not a milestone plan. "Платные события → подписки → другие города" is a wishlist, not a sequenced plan with a measurable gate at each step. Without acceptance criteria, the team will ship activity, report growth, and miss the metric that actually matters — first paying organizer at a positive retention curve.

*Decisions on instinct, not data.* The Locals.md claim in the competitive table [§8] is stated as "closed, audience seeking alternatives" — the evidence pack flagged this as NOT VERIFIED [§7, 10*]. Citing an unverified exit as a distribution opportunity is exactly the "decisions on vibes" pattern I watch for.

## My scorecard

| Pillar | Score | Why |
|--------|-------|-----|
| Problem | 3 | Fragmentation documented via Telegram channel catalog [22] + warszawa_diaspora traction [28]; integration isolation quantified [20]. But zero first-person organizer-pain quotes [pack §3] — institutional/proxy evidence only. Cannot score 4. |
| Market | 2 | ~50 inferred paying organizers [pack §5] at €15/mo = €750/mo ceiling. Reachable user audience ~50,000 [pack §5]. Both are inference-grade, not census. Comparable expat membership products exist (InterNations ~€100/yr [8]) proving spend in category, but this niche is unproven. Bottom-up SOM feels sub-$1M without a strong user-sub conversion rate I can't model. |
| Demand | 3 | Meetup exodus = live organizer-side trigger [3][4][45]; IRL-social wave with named-company proof (Timeleft €18M ARR [24], Joiner 40k downloads [18]). User side has passive signal (37k followers [28]) but zero active-seeking quotes for THIS product. |
| Solution | 3 | Plausible wedge: RU/UA/EN localization + social layer fills a confirmed gap [pack §1, §2 / 16][17]. PWA live with core features shipped [§10]. But free-first delays the only test that matters — will organizers pay? Unproven. |
| Viability | 1 | All monetization "planned" [§7.1]. No invoice possible in <4 weeks [pack red-team 4]. Comparable ACV exists in the market [1][7][9] but none documented for this specific audience in this city. No unit economics slide. Cannot score above 1 without a single paying customer. |

Red-team from my seat: **pivot** — the product has a real problem and a live distribution trigger, but the free-first posture means viability is a thesis, not a fact; one pricing experiment separates pivot from kill.

## My verdict
PIVOT — one variable: charge one organizer this month. Everything else can wait. The fragmentation pain is real [22][28], the Meetup exodus is a live trigger [3][4], and the localization gap is uncontested [pack §1]. But "free-first by principle" with all monetization deferred is not a strategy — it is an untested assumption that this audience will pay once the community exists. Couchsurfing built 16 years of trust and collapsed the day they introduced a paywall [56]. The conversion question is not solved by waiting; it is solved by a pricing test run today on the five most active organizers currently on the platform. Define what "success" looks like: ≥3/5 organizers pay €10+/mo for Creator Pro within 30 days. Run it, measure it, then decide whether the rest of the roadmap is worth funding.

> Script-computed from my scorecard (`scripts/scorecard.py`): **PIVOT — 12/25, red-team: pivot** (no evidence caps applied; evidence refs normalized to numbered sources by the orchestrator)

## The one experiment I'd run next
**Organizer WTP cohort test.** Take the top 10 most active organizers on the platform today — ranked by events created and attendee count. Send each a personal DM (from the founder, not a notification) offering early access to Creator Pro at €10/mo in exchange for a 20-minute call. Pass bar: ≥4/10 agree to the call, ≥2/10 convert to a paid account within 14 days. Fail bar: <2 calls booked = the organizer pain narrative is not strong enough to generate even conversation-level pull, and the free-first hypothesis needs to be revisited before any further feature investment. Cost: zero. Timeline: two weeks. Output: a number, not a feeling.

## Part 2 — Standalone deep dive
*(Written in plain language for a general audience.)*

### How I'd think about this

I come at every business idea the same way: define what success looks like in a number, and tell me how you will prove it by a specific date. Part 1 of this evaluation already scored Kolo at 12/25 and said "pivot." I am not re-litigating that. What I want to do here is give the founders the practical tools to run the pivot — specifically, the numbers sheet they do not have, a real 90-day bar, and a time-allocation framework for a two-person team.

My lens is sales operations and commercial systems. I have run capacity planning and cohort analysis for teams across eight markets. The discipline is the same whether you are managing 200 sales agents or 50 community organizers: you identify the five numbers that tell you weekly whether the machine is working, you set a pass/fail bar at 90 days, and you do not celebrate activity — only movement in those five numbers.

One framing note before the numbers. In my experience, the biggest risk for a product like Kolo is not the technology — it is what I call the "free-to-paid conversion cliff." Platforms that promise "free first, monetize later" often find that their users built their habits around free, and any paywall breaks trust [56]. The organizer side is especially sensitive: if the first organizer who ever gets a payment request feels surprised or manipulated, word travels fast in a community this small.

### My own numbers

Here is the one-page number sheet I would build for these founders. Five weekly metrics, in plain language.

**1. Active organizers** — how many organizers posted at least one event in the last 30 days. Target for week 12: 20. This is your supply side. Without supply, users have nothing to attend and never come back.

**2. Event fill rate** — what percentage of events with a stated capacity actually reached 70%+ of that cap. Target for week 12: 40% of events filled. A low fill rate means supply is there but demand is thin, or the match between organizers and users is broken.

**3. User return rate** — of users who attended one event, how many attended a second event within 30 days. Target for week 12: 30%. In my experience, the second event is the retention signal that matters most. First event is curiosity; second event is habit.

**4. Organizer retention** — how many organizers who posted in month 1 are still posting in month 3. Target: 60%. If organizers churn fast, the supply side is a treadmill you can never get off.

**5. WTP signal rate** — of organizers personally offered a paid Creator Pro trial at €10/month, what percentage say yes or ask to hear more. Target by week 8: 40% positive response rate. This is not paying customers yet — it is intent. Below 40% means the pain narrative is weaker than the concept assumes.

Now the math on the ceiling. The inferred organizer pool is approximately 50 accounts [pack §5]. At Creator Pro €15/month that is €750/month maximum revenue if every organizer converts and none churns. That is not a business — it is a proof-of-concept budget. To reach €5,000/month in organizer subscription revenue, you need roughly 330 active paying organizers. The evidence pack does not show that pool exists in Warsaw today. So the user subscription (User Pro, €3–7/month) matters more than it looks in the concept. If 2% of a 50,000-person reachable audience [pack §5] converts to €5/month, that is €5,000/month — but 2% conversion on a consumer social app requires genuine habit, not just registration. In my experience that rate takes 12–18 months of retention work to reach, not 90 days.

Ticket commission (5–10% on paid events) is the most realistic near-term revenue line, because it charges only on value delivered and does not require a separate payment decision from the organizer. But it requires the payment infrastructure to be live — which today it is not [concept §7.1].

### My three recommendations

**One. Build the number sheet this week, track it weekly.** Not monthly, not "we'll look at it before the next investor conversation." Weekly. Print it on one sheet. Every Monday, five numbers. If you cannot fill in all five because you do not have the data yet, that is the first thing to fix — not a new feature.

**Two. Set a binary 90-day bar, not a wish.** In my work I distinguish between a target ("we hope to reach X") and an acceptance criterion ("if we do not hit X by date Y, we change direction"). For Kolo, the 90-day bar I would set is: 20 active organizers + 3 paying Creator Pro accounts + user return rate above 25%. All three, not two out of three. If you miss any one of them, the free-first hypothesis is not holding and you need to revisit the model. Write this down, sign it, and do not move the goalposts.

**Three. Split the two founders' time explicitly.** A two-person team building and selling simultaneously will default to building, because building feels like progress and selling feels like rejection. In my experience the right split at this stage is 60% selling / 40% building. "Selling" here means: DM organizers personally, run the WTP cohort test from Part 1, attend the events that are already on the platform, sit next to real organizers and watch where they lose time. Ivan (product/strategy) should own 100% of the selling time. Marat (technical) should build only what the selling conversations say is blocking payment. Every sprint that ships a feature no organizer asked for in the last two weeks is budget burned on a hypothesis, not a fact.

### What would change my mind

**What moves me to GO.** Three of five organizers personally DM'd by the founder agree to a 20-minute call within one week, and two of those three pay €10 or more within 30 days — even symbolically, even as a pre-order. That single data point collapses the free-to-paid uncertainty. It does not have to be a polished payment flow; a manual bank transfer counts. Two paying organizers in 30 days means the pain is real and the WTP is real, and I would revise viability from 1 to 3 in my scorecard immediately.

**What moves me to KILL.** The organizer WTP test runs for six weeks — the founders DM every active organizer on the platform — and fewer than two express any interest in paying anything. Zero payment intent after direct personal outreach in a pool of real, active users is not a distribution problem or a product problem. It means the value proposition does not create enough pain relief to justify a charge, and no amount of feature-building changes that. At that point I would tell the founders: the user side might still have legs as an acquisition tool for a different commercial model (sponsorships, venue partnerships, B2B), but the organizer SaaS thesis is dead and should be buried cleanly rather than kept on life support while the team burns time.
