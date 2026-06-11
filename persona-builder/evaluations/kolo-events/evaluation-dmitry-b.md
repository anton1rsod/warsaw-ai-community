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
