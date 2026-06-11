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
