# Kolo Events — persona-panel synthesis

**Date:** 2026-06-11 · **Idea:** kolo.events (founders: Ivan + Marat) · **Panel:** 6 community personas + 1 script baseline

> **Provenance & label:** All six evaluations are **AI-ghostwritten simulations** drafted from members' self-authored persona files (persona-creation interviews, schema 1.0, created 2026-04-27…2026-05-21). **No member has reviewed, edited, or endorsed their draft.** Evidence base: Maksym Pavlenko's `validate-idea` methodology, 45+ linked sources, desk research only (evidence level 3/7). Persona verdicts were formed **blind** — the drafts saw the evidence pack but not the script verdict or each other. All scorecards computed by `scripts/scorecard.py`, no evidence caps triggered. One base model drafted all six (stylistic-convergence caveat applies).

## Headline: 7 of 7 say PIVOT — and they converge on the same variable

| Evaluator | Lens | Problem | Market | Demand | Solution | Viability | Total | Verdict (script-computed) |
|---|---|---|---|---|---|---|---|---|
| `scorecard.py` baseline | evidence only | 3 | 2 | 3 | 3 | 2 | **13/25** | PIVOT |
| Anton Safronov | PM / community-platform founder (familiar; conflict disclosed) | 3 | 2 | 3 | 3 | **1** | **12/25** | PIVOT |
| Дмитрий Блюс | engineer / founder-CTO (outside→familiar) | 3 | 2 | 3 | 3 | 2 | **13/25** | PIVOT |
| Heorhii K. | platform engineering (practitioner) | 3 | 2 | 3 | 3 | 2 | **13/25** | PIVOT |
| Maksym Pavlenko | payments / methodology author (familiar) | 3 | **3** | 3 | 3 | 2 | **14/25** | PIVOT |
| Mark Spasonov | quantitative commercial (familiar) | 3 | 2 | 3 | 3 | **1** | **12/25** | PIVOT |
| Nazar K. | user acquisition / funnel economics (practitioner→familiar) | 3 | 2 | 3 | 3 | **1** | **12/25** | PIVOT |

Six blind judgments landing within ±1 of the script baseline, with zero KILL and zero GO, is strong convergent signal — the disagreement budget went where it should: judgment about *viability*, not facts.

## Where the panel is unanimous

1. **Problem = 3, everywhere.** The fragmentation is structurally documented (33 Warsaw RU/UA Telegram channels; 37k-follower diaspora events account) — but **nobody found a single verbatim organizer-pain quote**, and every persona flagged it. The "2–5 h/week admin" hypothesis is still an assumption.
2. **The real incumbent is free Telegram, not Meetup.** Five of six drafts independently centered this. The wedge vs. paid tools (RU/UA localization, social layer) is real; the wedge vs. a free habit is UX only.
3. **Free-first is the flaw — and it's fixable.** Every persona's PIVOT lands on the same variable family: **monetization timing / price model**. Several invoked the same evidence: Couchsurfing's trust collapse shows monetize-later is also trust-risky later; the postmortem cluster (Plancast, Zvents, Neighbourly, IRL) shows waiting doesn't de-risk.
4. **Distribution is the strongest pillar.** Named, sized, near-free channels; first 100 users ≈ one cross-post; first 20 organizers ≈ a DM list.
5. **The Locals.md claim must come out of the founders' deck** — it failed verification (the platform appears alive). Three personas independently flagged it as an evidence-discipline signal.

## Where the panel splits

- **Viability 1 vs 2 — a clean lens split.** The three commercially-tagged personas (Anton, Mark, Nazar) scored Viability **1** ("no invoice possible, no documented spend from this segment = cannot score higher"); the three engineering-tagged personas (Dmitriy, Heorhii, Maksym) gave **2** (comparables exist, economics merely untested). The commercial seats are harsher on monetization-by-promise.
- **Market 2 vs 3.** Maksym alone scored Market 3, crediting the comparable density; the rest held at 2 on the bottom-up math (~50 inferred organizers × €15/mo ≈ €750 MRR ceiling; user-side SOM thin).

## The one experiment (panel-converged)

All six independently proposed variants of the same experiment: **ask organizers for money now, before building anything else.** Sequenced composite with the panel's own pass bars:

1. **7-day WTP DM test (Nazar / Mark / Heorhii variant):** DM ~10–20 named Warsaw organizers; offer Creator Pro at €10–15/mo, invoice today. PASS: ≥3 paid commitments. Cost €0.
2. **30-day paid-ticket pilot (Anton / Maksym variant):** 2–3 organizers already running paid events route one event each through Kolo on Stripe Connect at 5–10% commission. PASS: ≥3 paid transactions cleared + organizer asks to repeat. (Stripe Connect agent model avoids PSD2 licensing; VAT applies to commission only; DAC7 de minimis likely covers pilot scale.)
3. **In parallel (Dmitriy / Mark variant):** 10–15 Mom-Test organizer interviews to finally capture the missing verbatim pain. PASS: ≥7/10 name signup admin in top-3 pains unprompted.

This matches the validation report's own pivot recommendation (price model: ticketing-fee-first) — reached independently by the blind panel.

## Methodological notes (for the community retro)

- **Blind-verdict design worked:** anchoring was removed and the panel still converged — disagreement shows up in pillar scores, not invented facts.
- **Voice vs. monoculture:** drafts keep distinct postures (Nazar's funnel math vs. Mark's acceptance-criteria framing vs. Maksym's payment-lifecycle lens), but one base model wrote all six — treat tonal convergence with suspicion until members edit their drafts.
- **What this is NOT:** validation. Desk research caps at evidence level 3/7. The panel generates hypotheses and pass bars; only the founders' field work (interviews → invoices) produces levels 4–7.
- **Next for members:** each member may edit and sign their draft (or disown it) — the files carry `signed_by_member: false` until then.
