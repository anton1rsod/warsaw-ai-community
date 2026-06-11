# Validation: Kolo Events — events/clubs discovery + one-click signup + social layer for RU/UA/EN-speaking residents of Warsaw

Date: 2026-06-11
Segment: PAYING side = organizers of recurring community events for Warsaw's RU/UA/EN-speaking residents (language clubs, sports, board games, cultural orgs), currently on Telegram + Google Forms. USER side = RU/UA/EN-speaking Warsaw residents (~250k foreigners, of whom ~160k Ukrainians [29]).
Hypothesis: "Warsaw RU/UA/EN event organizers lose ~2–5 h/week on signup/comms admin across Telegram+forms and would pay €10–20/mo (Creator Pro) or 5–10% ticket commission; a slice of active attendees would pay €3–7/mo (User Pro)."

> Method note: produced by Maksym's `validate-idea` skill run by the AI collaborator (desk research, 2026-06-11); 5 parallel research agents, 9 dimensions, 45 sources. Verdict computed by `scripts/scorecard.py` — see `scorecard.json`.

## Verdict: PIVOT (the one variable: **price model** — flip free-first-everything to ticketing-fee-first on paid events) — 13/25

## Evidence level reached: 3 / 7 (competitors with public pricing & customers) — next level requires: Mom Test interviews with 15–20 Warsaw organizers (level 4: current spend + documented workarounds)

## Scorecard (verified via scripts/scorecard.py)

| Pillar | Score | Key evidence (linked) |
|--------|-------|----------------------|
| Problem | 3/5 | Fragmentation structurally confirmed: ~33 Warsaw-specific RU/UA Telegram channels in one catalog [22]; 11% of Ukrainians in PL feel "fully integrated", 15.1% name "friendships" as the missing piece [20]; BUT zero verbatim organizer-pain quotes found (honest-search) |
| Market | 2/5 | bottom-up: organizer line 50 accounts × $195 ACV → year-1 SOM $780–2,340; User Pro line 50,000 reachable × $65 → SOM $3.3k–16.3k. Both under the script's $50K floor ("does not support a business — change one variable") |
| Demand | 3/5 | Joiner: 40k downloads Baltics+PL, €500k raise to expand into Poland, verbatim Ukrainian-in-Warsaw testimonial [18][19]; warszawa_diaspora IG 37k followers for RU-language Warsaw events [28]; IRL-social wave funded at scale [23][48]; BUT no first-person "too many Telegram chats" complaints found |
| Solution | 3/5 | wedge: only product combining RU/UA/EN localization + Warsaw density + social layer — gap confirmed by absence in 2 independent sweeps; Meetup's RU Warsaw group dormant since 2021 [16]; Meetup organizer exodus live [3][44]; BUT binding competitor for core audience is free Telegram, where the wedge is UX-only |
| Viability | 2/5 | comparable: Meetup Standard $24–45/mo [1][2], Heylo $19–59/mo [9], Luma free + 5% fee / Plus $59/mo [7], Fienta 3.5% [10], InterNations €60–100/yr [8]. Comparables exist — but Kolo is free-first by stated principle, deferring every WTP test; no path to first invoice <4 weeks |

## Red-team

1. **Already-solved?** — Slices, yes; the niche, no. Meetup = EN-only here, RU group dormant 4.5y [16], organizers fleeing price hikes [3]; Luma = event tooling, no discovery/social/local [7]; Eventbrite/Fienta/Konfeo = ticketing only [6][10][11]; InterNations = paid expat events with documented trust collapse [8]; Telegram+Google Forms = free, entrenched, structureless [13][15][22]. **No player serves RU/UA Warsaw** (confirmed twice by absence). Wedge vs paid tools: localization + free. Wedge vs Telegram: UX + discovery only — and Telegram is free and already open.
2. **WTP comparable** — Exists on both sides: organizers pay Meetup/Heylo/Luma $19–59/mo and 2–5% ticket fees today [1][7][9][10][11]; expats pay InterNations €60–100/yr [8]. But none of that spend is documented **for this audience in this city** — and the concept's own free-first principle postpones the test.
3. **Distribution (first 100)** — Strongest pillar. Named, sized, cheap: @thewwarsaw 30,775 [34], warszawa_diaspora IG 37k [28], ukrainianinpolandpl FB 33.7k [38], @afishawawa 5,040 [35], UAinWarsawPL 2,810 [36], Ukrainian House Warsaw [42], Warsaw International Meetup 5,278 [39], Meet & Speak (UA/RU tables) 985 [41]. First 100 users are one cross-post away; first 20 organizers are a DM list.
4. **Speed reality (<4 weeks to invoice?)** — **FAIL on the current model.** Everything monetizable is "planned"; free-first is a stated principle [concept §7.1, §11]. This is the variable to pivot: Fienta-style ticket fee (3.5–7.5%) on the paid events that already exist in this community (workshops, dinners, tours) produces an invoice in week 1 without violating "free for free events".
5. **Smallest viable niche** — Already geographically/linguistically narrow. Sharper still: the ~50–100 organizers who run **paid** events for this audience. Dominable via direct founder outreach through [42][34][28].

## Competitive landscape

| Competitor | Price | Gap / why users complain |
|------------|-------|--------------------------|
| Meetup | Standard ~$24–45/mo, Pro ~$30–35/mo [1][2] | Price ~2× since 2024 acquisition [3][16]; social features paywalled into Meetup+ [4][5]; organizer exodus, "ghost town" outside top cities [44][45]; RU/UA Warsaw coverage effectively zero [16][20] |
| Luma | Free + 5% paid-ticket fee; Plus $59/mo [7] | Primary Meetup refuge; no discovery, no social graph, no PL/RU/UA localization |
| Eventbrite | 3.7% + $1.79/ticket + 2.9% processing [6] | ~11–16% all-in on small tickets; ticketing only, no community |
| Fienta | 3.5% flat [10] | Cheapest ticketing in PL; no discovery, no social |
| Heylo | Free–$199/mo tiers + txn fees [9] | Closest to "club management"; US-centric, no discovery, no PL presence |
| Konfeo | €1/attendee free events; 2–5% paid [11] | PL-local registration tool; no community layer |
| InterNations | €60–100/yr membership [8] | The cautionary tale: paid expat community with dark-pattern billing, 1.3/5 reviews |
| Telegram + Google Forms (status quo) | Free [13][14][15] | No discovery, no RSVP structure, no profiles; but free, installed, and where the audience already lives — **the real incumbent** |
| Facebook Groups/Events | Free | Organic reach 1–2% [47]; Community Chats killed Oct 2025 [46]; declining community investment [9*] |

## Timing triggers

- **Meetup/Bending Spoons price shock** (Jun 2024, ongoing): subscriptions ~2×, <30 days notice, mass organizer anger with names and quotes [2][3][4][43][44][45] — a live migration list, mostly EN-side organizers.
- **Facebook Community Chats shutdown** (Oct 2025) + organic reach collapse to 1–2% [46][47].
- **Ukrainian population in PL stabilized** (~1.55M nationally [31], ~160k in Warsaw [29]; 3+ years post-displacement → community-building phase [13][49][67]).
- **IRL-social funding wave 2024–2026**: Timeleft €18M ARR [24], Posh $22M [48], Joiner €500k into Poland specifically [19], loneliness recognized at WHO level [25].

## Top risks

1. **Cold-start density** — 4 named deaths in this exact failure mode (Plancast, Zvents, IRL, Google Neighbourly) [50][51][52][54]; geographic focus helps only if supply is actively seeded.
2. **WTP of a price-sensitive segment unproven** — refugees/students; every paying comparable serves wealthier expats; zero level-4+ evidence.
3. **Founder economics** — free product, no revenue line until "planned" monetization; the slow version of the postmortems above.
4. **Concept-doc claim failed verification** — Locals.md is alive (Chișinău media outlet), not a closed platform with an orphaned audience [10*]. Founders' evidence discipline needs tightening.

## Pre-mortem (top 3 causes of death → mitigation experiment)

1. Empty-feed cold start → audience bounces → seed 30 days of supply by hand (founders import/curate every RU/UA/EN event in Warsaw) before any user-acquisition push; measure D7 return rate.
2. Monetization never arrives; founders burn out running free infra → ticketing-fee pilot in month 1 (3–5 paid-event organizers; real invoices), not after "growth".
3. Audience won't leave Telegram → don't fight it: Telegram bot/mini-app + channel auto-posting as the front door (concept §6.5 already gestures here); measure signups originating in TG.

## Next 30 days (sequenced, each with a pass/fail bar)

- [ ] Mom Test interviews: 15–20 Warsaw RU/UA/EN organizers (source via [42][34][39]); PASS = ≥7/10 report ≥2h/week signup admin AND name current spend (tool, ads, time)
- [ ] Ticketing-fee pilot (the pivot variable): 3–5 organizers run a real paid event through Kolo at 5–7.5% fee; PASS = ≥3 events, ≥€100 total platform commission collected (level-7 evidence)
- [ ] Fake door for Creator Pro at €15/mo inside the pilot cohort + channels [34][28]; read with `scripts/smoke_test.py`; PASS = per script benchmark bands (cold-traffic, call-acceptance)
- [ ] Compliance prep gate (before pilot): Stripe Connect agent-model setup (no PSD2 license needed [60]), VAT-on-commission registration check [61], DAC7 seller-data collection design [63], ToS 16+ age gate [58]

## Assumptions made

- Organizer count 50 is an informed inference (10–20 RU/UA + ~30 EN-expat recurring organizers) — no registry exists; flagged by research agent as inference, not count.
- User Pro reachable base 50,000 = deduplicated channel audiences [28][34][35][36][38]; capture band 0.1–0.5% (consumer freemium norm).
- Demand scored 3 despite missing verbatim complaints: Joiner's funded traction in this exact geography/audience [18][19] + 37k-follower RU events channel [28] treated as active-seeking proxies. Reddit was tool-blocked (data gap, not absence).
- red_team="pivot" (not "kill"/"survived"): distribution and timing genuinely strong; failure concentrated in one variable (price model); per skill §3, a broad idea failing on monetization speed "almost never needs killing — it needs a sharper edge."
- Locals.md closure claim from the concept doc EXCLUDED from evidence (failed verification).

## Sources

1. https://www.meetup.com/blog/introducing-meetup-starter/ (2024-10)
2. https://help.meetup.com/hc/en-us/articles/28677808413197-Organizer-Subscription-prices-overview
3. https://news.ycombinator.com/item?id=40854275 (2024-07)
4. https://medium.com/@hoffbits/pay-to-skip-why-meetup-risks-undermining-its-own-community-635cb1c25f9c (2025-04)
5. https://www.meetup.com/blog/new-to-meetup-plus-october-2024/ (2024-10)
6. https://www.eventbrite.com/organizer/pricing/ (2026-06)
7. https://luma.com/pricing (2026-06)
8. https://internations.pissedconsumer.com/review.html (2024–2025)
9. https://www.heylo.com/pricing (2026-06)
9*. https://magicbrief.com/post/facebook-updates-2024-top-features-and-whats-coming-in-2025 (2024)
10. https://fienta.com/p/pricing (2026-06)
10*. https://production.locals.md (2026-06, Locals.md alive — claim check)
11. https://www.konfeo.com/en/event-registration-software-pricing/ (2026-06)
12. https://www.bilety24.pl/cms/organizator (2026-06)
13. https://t.me/warszawa4ua (2026-06)
14. https://t.me/ITWarsawCommunity (2026-06)
15. https://bazucompany.com/blog/telegram-as-a-platform-for-event-management/ (undated)
16. https://www.meetup.com/warsaw-russian-language-meetup-group/ (dormant since 2021-10)
17. https://www.meetup.com/find/pl--warsaw/ (2026-06)
18. https://getjoiner.com/ (2026-06)
19. https://techfundingnews.com/startup-in-spotlight-joiner-snaps-e500k-to-expand-its-friendship-first-social-platform-beyond-the-baltics/ (2025-09-30)
20. https://polandinsight.com/ukrainians-in-poland-a-growing-divide-between-economic-role-and-social-integration-94698/ (2025-06-11)
21. https://www.rescue.org/eu/press-release/new-research-reveals-ukrainian-adolescents-poland-battle-language-barriers-social (2024-02-22, STALE-adjacent)
22. https://telegid.me/catalog/polsha (2026-06)
23. https://www.futureparty.com/p/irl-social-apps-partiful-timeleft (2025-01-02)
24. https://timfrin.substack.com/p/inside-timelefts-journey-to-connecting (2025-10-09)
25. https://fortune.com/2026/03/20/loneliness-epidemic-gen-z-millennials-460-billion-problem/ (2026-03-20)
26. https://www.meetup.com/blog/2025-meetup-progress-report/ (2025-07-23)
27. https://gojammin.com/en-PL (2026-06)
28. https://www.instagram.com/warszawa_diaspora/ (2026-06, 37k followers)
29. https://wbj.pl/warsaws-population-exceeds-estimates/post/143922 (2024-10)
30. https://mostmedia.pl/nowosci/warszawa-przyciaga-bialorusinow-juz-druga-co-do-wielkosci-grupa-cudzoziemcow/ (2025-08)
31. https://notesfrompoland.com/2026/04/26/two-million-foreigners-now-legally-resident-in-poland-making-up-5-of-the-population/ (2026-04-26)
32. https://en.um.warszawa.pl/-/statistics (2024-12-31, chart-embedded)
33. https://reliefweb.int/report/poland/regional-refugee-response-ukraine-situation-2024-poland-chapter-enpl (2024)
34. https://t.me/thewwarsaw (2026-06, 30,775 subs)
35. https://t.me/s/afishawawa (2026-06, 5,040 subs)
36. https://t.me/s/UAinWarsawPL (2026-06, 2,810 subs)
37. https://t.me/s/warsawafisha (2026-06, 950 subs)
38. https://www.facebook.com/ukrainianinpolandpl/ (33,662 likes)
39. https://www.meetup.com/warsawinternational/ (2026-06, 5,278 members)
40. https://www.meetup.com/social-hall/ (2026-06, 2,688 members)
41. https://www.meetup.com/meet-speak-warsaw-social-language-exchange/ (2026-06, 985 members)
42. https://ukrainskidom.pl/ (2026-06)
43. https://news.ycombinator.com/item?id=38953242 (2024-01-31)
44. https://andypiper.co.uk/2024/10/18/meetup-com-is-so-over/ (2024-10-18)
45. https://www.caseywatts.com/blog/event-pages-2024/ (2024)
46. https://www.socialmediatoday.com/news/facebook-removing-facebook-group-chats-messenger/759856/ (2025-09)
47. https://campaignpros.io/learning-center/facebook-organic-reach-decline (2025)
48. https://techcrunch.com/2024/07/23/event-startup-posh-raises-22m-in-to-focus-on-personalisation-and-event-diversification/ (2024-07-23)
49. https://nsz.wat.edu.pl/Migrations-of-Ukrainian-citizens-to-Poland-between-2022-2025-in-terms-of-the-scale,209422,0,2.html (2025)
50. https://techcrunch.com/2023/06/26/irl-shut-down-fake-users/ (2023, STALE — postmortem)
51. https://techcrunch.com/2012/01/22/post-mortem-for-plancast/ (2012, STALE — postmortem)
52. https://startupguys.co.uk/why-did-zvents-shut-down-the-real-reasons-behind-the-closure/ (postmortem)
53. https://waxy.org/2013/04/the_death_of_upcomingorg/ (2013, STALE — postmortem)
54. https://www.failory.com/google/neighbourly (2020, STALE — postmortem)
55. https://aminoka.com/blog/amino-shut-down (2025)
56. https://brenontheroad.com/the-end-of-couchsurfing/ (2020, STALE — postmortem)
57. https://iclg.com/practice-areas/data-protection-laws-and-regulations/poland (2025–2026)
58. https://www.linklaters.com/en/insights/data-protected/data-protected---poland (current; PL digital consent age = 16)
59. https://www.eu-digital-services-act.com/Digital_Services_Act_Article_19.html (small/micro platform exemptions)
60. https://stripe.com/guides/frequently-asked-questions-about-stripe-connect-and-psd2 (current)
61. https://polishtax.com/place-of-supply-of-services/ (2025; VAT agent-vs-deemed-supplier)
62. https://www.vatupdate.com/2026/05/23/poland-aligns-vat-rules-with-vida-directive-2025-516-expansion-of-oss-and-clarifications-for-digital-trade/ (2026-05-23; event ticketing NOT in ViDA deemed-supplier scope)
63. https://www.rsm.global/poland/en/insights/tax/DAC7-Q-and-A (2024–2025; de minimis <30 txn AND <€2,000/seller)
64. https://www.biznes.gov.pl/en/portal/004510 (event tickets excluded from 14-day withdrawal right)
65. https://www.edpb.europa.eu/system/files/2025-04/edpb_statement_20250211ageassurance_v1-2_en.pdf (2025-02-11)
66. https://miamidaily.life/business/irl-social-apps-address-growing-loneliness/ (2024–2025)
67. https://visitukraine.today/blog/5540/a-dangerous-trend-ukrainians-are-creating-their-own-communities-in-big-cities-and-this-scares-poles (2024)
