---
ai_generated: true
model: claude-sonnet-4-6 (draft) / claude-fable-5 (orchestration)
generated_at: 2026-06-11
persona_source: personas/dmitry-b/persona-dmitry-b.md (self-authored interview, schema 1.0, created 2026-04-29)
signed_by_member: false
---
# Evaluation: Kolo Events — Дмитрий Блюс

> **AI-ghostwritten simulation** drafted from Dmitriy's self-authored persona file.
> Dmitriy has NOT reviewed, edited, or endorsed this draft. Not a substitute for his actual judgment.

Domain fit: **outside→familiar** — My tags are devtools/crypto practitioner and software-engineer/founder-CTO; this is a consumer-social local-events PWA targeting diaspora communities. I can read the tech stack and unit economics clearly, but I have no consumer-social marketplace reps. Where I say something about the market, treat it as engineering judgment applied to business logic, not a practitioner read.

## My first question, answered

*Why will customers choose this product over what they use now?*

For the USER side, the real incumbent isn't Meetup — it's free Telegram, where this audience already lives, already has their communities, and has zero friction to join a chat. Kolo's answer is UX/discovery: one feed instead of ten chats, social profiles, one-click RSVP. That's a real improvement in workflow, and the fragmentation signal is genuine — ~33 separate Warsaw RU/UA Telegram channels in one catalog [22], warszawa_diaspora IG at 37,000 followers showing the audience will aggregate around a single-source feed where one exists [28]. But "better UX" over a free, deeply habitual tool is a weak switching trigger on its own. For the ORGANIZER side (the paying side), the answer is stronger: Meetup post-acquisition raised prices 2–3× with under 30 days notice [3], organizers are actively leaving [4][44][45], and no current tool serves the RU/UA Warsaw organizer specifically. That's the place where "why us" is actually answerable.

## What makes me bullish here

The Meetup price-shock timing trigger is real and documented — not an assumption [3][4][43]. The fragmentation problem has proxy evidence: 33 separate Telegram channels, a 37k-follower IG account that exists purely because people want one place to look [22][28]. The distribution playbook is clear and cheap — named, sized channels (30k TG, 37k IG, 33k FB) where first 20 organizers is literally a DM list [evidence pack §9]. The product is live and functional; offline-first/PWA sync challenges are non-trivial and the team already navigated them — from where I sit with CRDT experience, that's real execution signal.

The Joiner case is also encouraging: 40,000 downloads, €500k raised for PL expansion specifically, with a verbatim user story about a Ukrainian in Warsaw finding connection [18][19]. Someone with investor backing already validated demand directionally in this geography.

## What makes me skeptical here

This pattern I've seen too many times: founders present market assumptions as facts. The concept claims Locals.md "closed, audience seeking alternatives" — that claim failed verification; Locals.md appears to still be operating [10*]. If the competitive table has unverified facts in it, what else is assumption presented as evidence?

More importantly: the product is fully free, ALL monetization is "planned" (§7.1, §11), and there is zero first-person custdev data in the pack. Not a single verbatim organizer quote saying "I spend 2–5 hours/week on signup admin and I'd pay €10–20/month to fix it." That's the core WTP hypothesis — and it has not been tested by the cheapest possible means before building a full PWA with chat, clubs, GCal integration, and multi-language support.

I've seen this film. Client builds everything first, then starts testing, then realizes the core monetization assumption was wrong and has to rebuild. The team should have run a Telegram poll with 10 Warsaw organizers before writing a line of code.

## Failure patterns I recognize

**No custdev before building** — the concept does not cite a single organizer interview or any attempt to verify the 2–5 h/week admin-load hypothesis (§2). The pack explicitly confirms: "zero verbatim Warsaw organizer-pain quotes found." This is the clearest pattern from my failure catalog: building what you think the market needs rather than what you confirmed it needs.

**Unverified market assumptions presented as fact** — the Locals.md claim in the competitive table is the visible example [10*]. If founders can't distinguish verified from assumed in their own pitch deck, the reliability of every other number is in question.

**Spending on development before validating hypotheses** — a full PWA with integrated chat, three-language support, GCal sync, moderation queues, friend system is significant build scope. None of the monetization hypotheses (ticket commission, User Pro, Creator Pro) have a paying customer yet. The "free-first, grow first, monetize later" principle (§11) is explicitly chosen — but it defers the one test that matters: will anyone pay?

## My scorecard

| Pillar | Score | Why |
|--------|-------|-----|
| **Problem** | 3 | Fragmentation is real — 33 TG channels [22], proxy evidence of aggregation demand [28] — but zero first-person organizer quotes about admin pain; the 2–5 h/week claim is an unverified hypothesis per the pack's own honest caveat |
| **Market** | 2 | ~50,000 reachable users rough-count [evidence §5]; paying organizer sub-segment ~50 accounts (inference, no registry) [evidence §5]; top-down numbers (160k Ukrainians in Warsaw [29]) don't compress to a meaningful SOM without a WTP-confirmed conversion assumption |
| **Demand** | 3 | Joiner 40k downloads + Warsaw-directed expansion [18][19]; warszawa_diaspora 37k followers proving aggregation appetite [28]; but zero first-person "I need this" quotes from organizers, zero active seeking for a paid solution found |
| **Solution** | 3 | Plausible wedge — language-specific + city-specific is genuinely unserved [evidence §1]; PWA offline-first is technically non-trivial and apparently done; but wedge is unconfirmed against the paying segment's actual workflow |
| **Viability** | 2 | WTP comparables exist (Meetup $24–45/mo [1], InterNations €60–100/yr [8], Heylo $19–59/mo [9]) — but none document THIS audience in THIS city paying; free-first principle means no invoice possible in <4 weeks; no unit economics presented anywhere in the concept |

**Red-team from my seat: pivot** — the demand signal for the user side is real, but the monetization path is untested and the free-first commitment delays the only experiment that answers the business question.

## My verdict

**PIVOT — single variable: validate organizer WTP before the next sprint.** The discovery problem is real, the timing trigger (Meetup exodus) is real, and the distribution channels are cheap and named. But right now this is a free tool that might stay free forever — the concept says as much in §11. I've watched too many projects burn runway on development while the founder kept saying "we'll figure out monetization once we have users." The fix is narrow: go talk to 10–15 Warsaw organizers who currently use Telegram + Google Forms, show them the working PWA, and ask them directly — "What would you pay per month to replace your current setup?" Get a number or get a hard no, but get it before building the Stripe integration. If 5 of 10 say €10+/mo unprompted, the business case is confirmed and you can execute. If they shrug, you need to know that now, not after native iOS and Android apps are built.

> Script-computed from my scorecard (`scripts/scorecard.py`): **PIVOT — 13/25, red-team: pivot** (no evidence caps applied)

## The one experiment I'd run next

**Organizer WTP interview sprint, 2 weeks, pass/fail bar = 5/10 say €10+/mo unprompted.**

Identify 10–15 active Warsaw organizers currently running events via Telegram + Google Forms (the named channels in §9 make this a DM list, not a research project). Show them the live kolo.events PWA in a 20-minute video call. Don't pitch — ask: "What's your current signup/comms workflow costing you in time per week?" Then ask: "If this solved that, what would you pay per month?" No prompting with price anchors. Pass: ≥5 of 10 independently name €10+/mo. Fail: anything less. This costs near-zero and either kills or confirms the entire monetization thesis before a single line of payment infrastructure is written.

## Part 2 — Standalone deep dive
*(Written in plain language for a general audience.)*

### How I'd think about this

I come at this as a hands-on tech lead who has run small founding teams and shipped real products with two or three people. My filter is simple: keep the engineering bill small until the idea earns it.

What I see here is a product that already has a lot built. A web app (PWA — think an app that runs in your browser but can be pinned to your phone screen like a real app), three languages, in-app chat, friend systems, club management, moderation tools, Google Calendar sync. That is several months of serious work by a two-person team. The execution is real, and I respect it.

My concern is the sequence. All of that was built before the single hardest question was answered: will anyone pay? The concept says plainly that monetization is "planned" and the platform is free by stated principle (§7.1, §11). That is not a business model. It is a decision to defer the business model — and in my experience, that decision is often never reversed.

The problem the product solves — too many scattered Telegram channels, no single place to find events for Russian- and Ukrainian-speaking Warsaw [22][28] — is genuine. The timing trigger is real: Meetup more than doubled its prices in 2024 with less than a month's notice, and organizers are leaving in documented anger [3][4]. The audience aggregation signal is there: a single Instagram account covering Warsaw events in Russian has 37,000 followers [28]. People will follow a single source when one exists.

But none of that tells me whether the 50 or so organizers who run recurring events for this community [evidence §5] will pay €10–20 per month to make their lives easier. That is the question the entire business rests on. And it has not been asked.

### My own numbers

Two founders, both wearing multiple hats. Let me be direct about what they are already carrying.

**Moderation.** An in-app chat across dozens of events and clubs is not a set-and-forget feature. Someone reads it. Someone acts on complaints. In my experience, a modestly active community chat requires two to four hours of attention per week — minimum. That is ongoing, forever, with no revenue attached to it yet.

**Three languages.** Every change to the product — every button label, every error message, every email — now has to be done three times. Not triple the work, but maybe 40–50% more than a single-language product. That is a permanent tax on every future hour of development.

**Chat and notification sync.** This is where the hidden technical debt lives. Building real-time chat that stays consistent across devices — where messages arrive in order, where you do not get the same notification three times, where nothing is lost when a user goes offline and comes back — is genuinely hard. I have first-hand experience with these problems (the field calls the underlying challenge "offline-first sync," and the bugs are subtle and nasty). The team appears to have shipped it, which is a real signal. But maintaining and extending it as user volume grows is a non-trivial cost.

**Now they are planning native iOS and Android apps** (§5.9 roadmap, §10). This is where I would stop them. A native app for each platform roughly means: double the codebase to maintain, a separate release cycle, App Store and Play Store review delays, and — for two people already carrying chat moderation, three languages, and an unvalidated monetization thesis — probably six months of work before the first paying customer exists. The PWA they have already works on phones. There is no evidence yet that users are bouncing because it is "not a real app." Build native when users demand it loudly. Not before.

Running a conservative estimate: at their current scope, each new feature costs roughly twice what it would in a focused single-language, no-chat product. The team is already at capacity.

### My three recommendations

**One: Run the organizer interview sprint before touching the roadmap.** Ten to fifteen Warsaw organizers who currently manage events through Telegram and Google Forms. Show them the live product. Do not pitch. Ask: "What does your current setup cost you in time each week?" Then ask: "If this fixed that, what would you pay per month?" No price hints. This is a DM list, not a research project — the channels are named and sized [§9]. Pass bar: at least five out of ten name €10 or more without being prompted. This takes two weeks and costs nothing. It either confirms the business or tells you to change direction before writing the payment infrastructure.

**Two: Do not build native apps yet.** The PWA works. Native apps are a large engineering commitment — new build pipelines, app store submissions, separate codebases — that two people cannot absorb while also landing a first paying customer. Keep the PWA, add a "Install this app" prompt for mobile users, and revisit native only after you have ten paying organizers and evidence that "app store presence" is why you lost someone.

**Three: Pick one monetization path and test it in four weeks, not four months.** Creator Pro (the organizer subscription at €10–20/month) is the right first target. There are comparably priced tools with documented paying users [1][9] and a clear value proposition: replace the Google Forms and Telegram admin load. Set up Stripe, put a "Pro" badge on one real organizer's club page, charge them, and see what happens. If they pay, you have a business. If they hesitate, you learn what would make them pay. Either answer is worth more than six more months of free.

### What would change my mind

**What moves me to GO:** Five of ten organizer interviews end with the person naming €10 per month or more, unprompted. That one data point would change my verdict from Pivot to Build. It confirms that the value proposition lands with the paying segment, that the admin-load hypothesis is real, and that the audience is not just happy to use a free tool forever.

**What moves me to KILL:** Three months pass, the interviews happen, and fewer than three people name any number above zero — or multiple organizers say the real problem is attendance, not admin. That tells me the pain being solved is a convenience, not a cost. A free convenience does not become a paid one just because you add Stripe.
