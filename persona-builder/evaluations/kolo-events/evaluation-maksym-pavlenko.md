---
ai_generated: true
model: claude-sonnet-4-6 (draft) / claude-fable-5 (orchestration)
generated_at: 2026-06-11
persona_source: personas/maksym-pavlenko/persona-maksym-pavlenko.md (self-authored interview, schema 1.0, created 2026-04-27)
signed_by_member: false
---
# Evaluation: Kolo Events — Maksym Pavlenko

> **AI-ghostwritten simulation** drafted from Maksym's self-authored persona file.
> Maksym has NOT reviewed, edited, or endorsed this draft. Not a substitute for his actual judgment.
> Note: the validation methodology underlying the shared evidence pack was authored by Maksym himself (`validate-idea` skill).

Domain fit: **familiar** — my tags are fintech-payments and integration-heavy backend work, not consumer-social or local community apps; I can evaluate the payment infrastructure story and the "does demand exist before you build" question, but I have no direct experience running or scaling community products.

## My first question, answered
Show me where this already works on real data or real users — without a seen result, it's still just a model.

Kolo is live at kolo.events with a shipped PWA — feed, clubs, chat, profiles, friends, GCal, three languages, moderation queue, all deployed. That's a real product, not a wireframe. But the evidence pack contains zero usage data: no active user count, no organizer count, no RSVP volume, no retention signal. The product works technically; whether it works as a community is still a model. Per my own discipline — which this evaluation methodology reflects — I don't consider anything done until I see a result on real data. The absence of any usage/revenue number in the evidence means the most important question is unanswered.

## What makes me bullish here
Meetup's Jun 2024 pricing shock created a real, documented migration window — organizers with thousands of members loudly leaving, quoting exact price jumps [3][4][43]. Warsaw's RU/UA/EN audience is structurally underserved: 37k followers on a single Instagram account posting events [28] proves the demand for aggregation exists and someone has already captured it without even having a product. Distribution channels are named, sized, and cheap — first 100 users is one cross-post [34][35][36][38]. The team shipped a genuinely complete feature set before asking for money, which is rare and signals product discipline. The free incumbent (Telegram + Google Forms) is beatable on UX alone; the audience isn't loyal to it, just habituated.

## What makes me skeptical here
My first rule: no market analysis before building is a failure pattern — and while the product clearly has a target segment, there is zero first-person pain evidence in the pack. No verbatim Warsaw organizer complaints about signup admin, no quoted "I spent 3 hours on Google Forms this week" [evidence pack: Honest-Search Gaps, Dimension 3+4]. The WTP comparables exist [1][7][8][9] but none document actual spend from this specific audience. The concept's stated "free-first" principle (§7.1, §11) means the monetization hypothesis is fully unvalidated — and the planned Stripe Connect ticketing is the only line that could prove willingness-to-pay quickly. The Locals.md "closed" claim in the concept's competitive table is not verified [10*]; I flag this as a small but telling example of asserting market evidence without checking it.

## Failure patterns I recognize
**No market analysis before building [pattern 1]**: The evidence pack finds no verbatim organizer-pain quotes despite searching. The team built a full feature set (chat, profiles, friends, moderation) before validating that organizers would pay anything. The paying-side hypothesis (€10–20/mo Creator Pro or 5–10% ticket commission) has no direct confirmation in the evidence.

**Too much invention too early [pattern 2]**: A social graph, embedded chat, friend system, moderation queue, and multi-language support are all shipped before a single euro of revenue. Each of those features is a real system with state, callbacks, and edge cases. The minimum version that tests demand is just the feed + organizer signup tool, not a full social network.

**Chicken-and-egg / distribution [from postmortems]**: Plancast, Zvents, Google Neighbourly all died on this [51][52][54]. Single-city + language-cluster gives a denser bootstrap — but only if organizer supply is seeded, not waited for. The concept has no stated organizer acquisition plan beyond product quality.

## My scorecard

| Pillar | Score | Why |
|--------|-------|-----|
| Problem | 3 | Audience fragmentation is real [22][28], but zero first-person "too many Telegram chats" complaints found; no verbatim organizer time-cost quotes; proxy evidence only |
| Market | 3 | ~50k reachable users [Dim 5], ~50 inferred organizers; bottom-up SOM is low single-digit €k ARR at stated prices unless expansion is factored in; WTP comparables exist [1][7][8][9] but are not this segment |
| Demand | 3 | Active following of aggregation accounts [28][34] + Joiner's Warsaw expansion signal [18][19] + Meetup exodus [3][4] = proxy demand; no direct seeking evidence for THIS product |
| Solution | 3 | Plausible unproven wedge: RU/UA/EN specificity + social layer is genuinely absent in current tools [Dim 1+2]; but free Telegram remains the real incumbent and switching cost is unclear |
| Viability | 2 | WTP comparables exist [1][7][8][9]; but stated free-first principle defers the test entirely; organizer pool (~50 inferred) is too small for SaaS economics without expansion; payment integration not yet built |

Red-team from my seat: **pivot** — the problem and distribution story survive, but the monetization path needs to be tested before the product grows wider.

## My verdict
PIVOT on one variable: monetization sequencing. The product is real, the distribution surface is real, and the timing window from Meetup's collapse is real [3][4]. What's missing is any evidence that the paying side — organizers — will convert. The free-first principle is a reasonable community-building stance, but it also means the team can run indefinitely without learning whether the hypothesis is true. My recommendation: pick the 10 most active organizers on the platform right now, offer them Creator Pro at €10/mo or the ticketing commission model, and observe. Not a survey — a payment attempt. Until that data exists, everything else is still a model.

> Script-computed from my scorecard (`scripts/scorecard.py`): **PIVOT — 14/25, red-team: pivot** (no evidence caps applied; highest score on the panel)

## The one experiment I'd run next
**Paid-ticket pilot with 3 organizers, Stripe Connect, 30 days.** Find three organizers running recurring paid or capacity-limited events (language clubs, sports groups, board game nights with a venue cost). Wire up Stripe Connect — the evidence pack confirms this avoids PSD2 licensing under the agent model [60] and the VAT story is clean at low volume [61][62]. Charge 5–10% commission, issue payouts. Define pass/fail: ≥1 organizer completes ≥3 paid-ticket transactions and reports the flow as less effort than their current Google Forms + bank-transfer workflow. Failure bar: zero completions, or all organizers revert to the old flow. This is squarely the payment-status lifecycle problem I know well — the interesting failure modes are not the happy path but the async payout states, the failed-payment recovery screen the attendee sees, and whether the organizer can diagnose a disputed transaction without calling support. Ship the simplest version of that lifecycle correctly and you have a real monetization datapoint. Overbuild it before getting one paying organizer and you've repeated pattern 2.

## Part 2 — Standalone deep dive
*(Written in plain language for a general audience.)*

### How I'd think about this

My day job is connecting products to payment providers and making sure money moves cleanly: charges, callbacks, refunds, payouts. So when I read that Kolo plans to add paid tickets, I stop caring about the features and start asking: how does the money actually flow, and what breaks?

Here is how the simple, safe version works. Stripe Connect is a service where Stripe does the hard job — holding the money, processing the card, paying out the organizer. Kolo acts as the middleman, not the bank. This matters because it means Kolo does not need a banking license under the EU's payment rules [60]. The platform collects a fee on each ticket sale; VAT applies only to that fee, not to the full ticket price [61]. Poland's registration threshold is PLN 200,000 — roughly €45,000 — before VAT registration is even required [61]. At 5–10% commission on small community events, you'd need tens of thousands of euros in ticket volume to get there, so the tax story is clean for a very long time.

The situations that actually hurt are not the ones founders usually think about. The happy path — someone buys a ticket, attends, done — almost never causes problems. The four situations I'd prepare for are: (1) the organizer cancels the event after people have paid — who refunds whom, and how fast? (2) the organizer wants their money before the event takes place — do you hold it until after, or pay out immediately? (3) a buyer calls their bank and claims the charge was unauthorized — a chargeback, meaning the bank pulls the money back automatically while it investigates; (4) the event sells out but the platform shows one seat left for thirty seconds because two people bought simultaneously. Each of these is a defined, well-understood problem with known solutions. But all four need an explicit answer in the system design before launch, not after the first complaint.

The minimum viable payment feature is: organizer sets a ticket price and seat count; buyer pays by card; Stripe holds the money; organizer gets paid out after the event; Kolo keeps its percentage. That is it. You do not need a payout dashboard, detailed transaction history, QR-code scanning, or analytics on revenue by club type — not for the first paying organizer. The over-built version is everything on the roadmap at once. The simple version proves willingness-to-pay in four weeks.

### My own numbers

In my experience, back-of-envelope checks on community products almost always reveal the same problem: the paying organizer pool is tiny.

The evidence puts the reachable organizer count at roughly 50 [Dim 5]. Let's say 10 of them run paid events — a generous assumption before anyone has tried. If a typical paid event sells 20 tickets at €10 each, that is €200 per event. Ten organizers running one paid event per month is €2,000 in total ticket volume. At 7.5% commission, Kolo earns €150 that month. Even if those organizers each run two events per month, you reach €300/month in commission revenue. That is not a business yet — it is a proof of concept.

Where it gets interesting: if 20 organizers adopt ticketing and average two events per month at €15 per ticket with 30 attendees, monthly ticket volume reaches €18,000 and commission reaches roughly €1,350/month — about €16,000/year. Still small, but now you have a real monetization signal. The point is not to plan for that number; it is to understand how many paying events you need before the math works. The answer is: far more than the initial organizer pool contains [Dim 5].

One more check: DAC7 reporting — the EU rule requiring platforms to report seller income to tax authorities — has a de minimis exemption below 30 transactions and €2,000 per organizer per year [63]. Most organizers in this pool will stay well under that threshold. No compliance burden for the first year.

### My three recommendations

**One: launch paid tickets before Creator Pro subscriptions.** Ticket commission proves willingness-to-pay with a single transaction. A subscription requires an organizer to believe the product is worth €10–20 every month before they have seen any return. Commission aligns incentives — Kolo earns only if the organizer succeeds. That is a much easier first conversation.

**Two: decide the payout timing policy before you write a line of payment code.** Hold funds until after the event is the safest rule — it avoids the case where you pay out an organizer who then cancels and has already spent the money. Stripe Connect supports this natively. Write it into the organizer terms on day one. Changing it after you have paying organizers is painful.

**Three: instrument every payment event from day one.** Every charge, every refund, every payout, every failed card — log it with the event ID, organizer ID, amount, and timestamp. Not for analytics. For support. When an organizer emails to say "someone paid but isn't showing up in my attendee list," you need to look up the payment state in under two minutes or you will spend hours on it. In my experience, the teams that skip observability at launch spend the next three months rebuilding it under pressure.

### What would change my mind

**What moves me to GO:** three organizers complete a paid-ticket flow without contacting support, at least one runs a second paid event on their own, and post-event payout lands without manual intervention. That sequence proves the payment lifecycle is stable enough to scale and that organizers find the tool easier than their current Google Forms plus bank-transfer workflow. If I see that in 30 days, I increase my confidence on the viability pillar from a 2 to a 4.

**What moves me to KILL:** zero organizers attempt a paid event after a direct offer, or every organizer who tries reverts to the old flow citing friction. That tells me the problem is not the tool — it is that this audience has a strong enough free alternative (Telegram, cash at the door) that no fee model survives. If the free incumbent is that sticky, the entire monetization hypothesis needs to be replaced, not refined.
