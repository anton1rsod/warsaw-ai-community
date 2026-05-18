# W.A.Y. — Backlog

> Ideas, experiments, and scope additions that aren't ready to be decisions yet. Append-only by default. Ideas graduate to `spec.md` (or trigger a new brainstorm session) when they're ready to be locked.
>
> **Why this file exists:** [`spec.md`](spec.md) captures *what the product is and why right now*. [`plan.md`](plan.md) captures *how we build the current release*. This file captures *everything Anton wants to consider for the future without locking it into either*. Mixing the three produces specs that rot or plans that stall.

## Status legend

- **idea** — captured, no exploration yet
- **exploring** — under active discussion or research
- **promoting** — actively moving toward spec/plan
- **parked** — explicitly deferred (with reason)
- **rejected** — explored and dropped (with reason)

## Promotion workflow

When an idea moves from BACKLOG → spec/plan/ADR:

1. Open a new brainstorm session for the idea (`superpowers:brainstorming subject="W.A.Y. — [idea name]"`).
2. Update the BACKLOG entry's status to `promoting`.
3. Once the brainstorm output lands in `spec.md` (new section or version bump) and/or an ADR is written, remove the entry from BACKLOG (or mark `shipped` with a link).
4. If the idea is rejected after exploration, mark `rejected` with the reason.

---

## Product features / scope additions

- **Multi-axis questionnaire variants (sector × industry × position × depth)** *(approved direction — Anton 2026-05-18, dedicated brainstorm required)* — heavily improve the questionnaire to ship multiple variants tuned to user's sector (tech / finance / health / commerce / etc.) × industry (fintech-payments, devtools, biotech-pharma, etc., per persona-builder vocab) × position (founder, CEO, COO, dev, marketer, sales, etc.) × depth (15-min light / 45-min standard / 90-min deep). Goal: be on the top of the market for persona quality. **Architecture implication:** questionnaire engine in v0 must be designed so variants are config-only additions (not engine rewrites) — the v0 founder-default-config is just one of many future variants. **Next step:** dedicated brainstorm session, separate from this one.
- **Gamified skill-tree UX** *(idea)* — Anton's original pitch mentioned a "mindmap of skills (like in computer game) which you can unblock by paying." Visual exploration of the marketplace. Not v0 (questionnaire is form-based). Could ship in v1+ as the marketplace browsing surface.
- **Multi-language persona authoring** *(idea)* — community `persona-builder` already supports EN/UK; W.A.Y. could inherit. PL/DE/ES expansion plausible for European founder cohort. v0.5+.
- **Voice persona / audio synthesis** *(idea)* — persona includes voice samples; LLM responses can be spoken in user's voice via TTS partner. Speculative; v1+ pending audio-clone vendor partnership.
- **Mobile questionnaire experience** *(idea)* — onboarding-on-mobile lowers friction. Desktop-only assumed by default. v0.5+.
- **Persona preview/test chat (in-product)** *(idea — Anton 2026-05-18, v0.5+ candidate)* — brief in-product chat that lets the user test/validate their newly-created persona BEFORE downloading the zip. "Does this sound like me? Let me ask it 3 questions." Distinct from a "destination chat product" (Replika-style) — it's a brief on-the-way-out validation utility. Build cost: BYOK or rate-limited free LLM tier (would partially intersect with L2 "no hosted inference"; needs careful design). Could substantially raise persona quality + first-experience wow factor.
- **Persona update / re-onboarding path** *(idea, needs ADR)* — when a user re-runs the questionnaire (career evolved, new role), how do existing installed skills update? Architecture decision before v1.
- **Persona-builder schema extension layer (L11)** *(parked — v1)* — workflows / tools / tone-per-audience / authority-boundaries section added on top of inherited persona-builder schema. Locked direction; awaits v0/v0.5 user feedback before designing concretely.

## Marketplace / monetization experiments

- **Paid tier launch (Stripe + subscription)** *(parked — Anton 2026-05-18, deferred until "future release when monetization makes sense")* — v0 and v0.5 are entirely free; paid tier launch becomes a separate brainstorm + spec + ADR cycle when v0.5 user signal justifies it. Triggers: revenue conviction from v0.5 demand signal (waitlist depth, unsolicited "I'd pay" messages, Track 2 consult demand). Blocks until then: no Stripe, no entity, no ToS lawyer review.
- **Commercial entity setup decision** *(parked — pairs with paid tier launch decision)* — sp. z o.o. (Polish) / Estonian e-residency LLC / sole prop / other EU-friendly. Setup 2-4 weeks; runs in parallel with paid-tier brainstorm when monetization trigger fires. No longer blocks v0.5 per 2026-05-18.
- **Enterprise compliance suite** *(parked — Track 2 candidate, v1+)* — SOC 2 / ISO 27001 / HIPAA / sector certifications. May become Track 2 deliverable for specific enterprise consulting clients (custom enterprise persona engagements). Not a self-service product feature. Moved here from §3 Non-goals on 2026-05-18.
- **Per-skill one-off purchases vs. monthly** *(parked — pitch mention)* — Anton's pitch mentioned per-skill SKUs as one-off OR monthly subscription. v0.5+ deferred; pricing model TBD with real user signal.
- **Lifetime license tier** *(idea)* — pay once, keep forever, no monthly. Alternative to subscription; could be price-discriminator for one-time-purchase-preferring founders.
- **Marketplace creator revenue share** *(idea, design needed)* — when third parties sell skills, what's the take rate? 30 % / 15 % / 50 %? Standard marketplace design question; deferred to S2 spec.
- **Referral / affiliate program** *(idea)* — founder shares W.A.Y., earns commission on conversions. Common SaaS growth lever.
- **Enterprise persona bundles** *(parked — Track 2 v1)* — custom personas + custom skills + consulting wrapper. Sold by Anton directly to C-suite clients.
- **White-label personas for VC firms** *(idea)* — VCs offer "your founder a W.A.Y. persona" as a portfolio service. Speculative.

## New ICPs (beyond v0 founder)

> All v0.5+/v1 territory. Each requires its own brainstorm + spec section before shipping.

- **Developers / engineers** *(idea — surfaced in Q2 brainstorm 2026-05-17)* — Claude Code reach; persona for dev workflow.
- **Marketers** *(idea — Q2 brainstorm)* — campaign drafting, brand-voice persona.
- **Sales operators** *(idea — Q2 brainstorm)* — outbound, follow-up, deal-stage automation.
- **Consultants / agency operators** *(idea — Q2 brainstorm)* — client-work persona; highest LTV per customer.
- **C-suite as direct B2C users** *(parked — Track 2 v1)* — CEOs/COOs/CFOs/VPs as direct SaaS users vs. consulting clients.

## Integration / platform expansion

> Tracked separately via [`research/2026-05-18-platform-compatibility-matrix.md`](research/2026-05-18-platform-compatibility-matrix.md). This list catches ideas that are *speculative beyond research scope*:

- **Slack persona bot** *(idea)* — install your persona as a Slack bot that drafts messages in your voice when DM'd. Different runtime (not a Claude Skill folder); needs custom adapter.
- **Email-native persona** *(idea)* — persona drafts email replies inside Gmail / Outlook via browser extension. Different distribution model.
- **Voice meeting assistant** *(idea)* — your persona listens to your meetings and drafts follow-up notes / next-steps in your voice. Audio processing layer required.

## Brand / marketing experiments

- **Platform partnership badges / certifications** *(idea — Anton 2026-05-18, v1+ candidate)* — pursue official partner status with Anthropic (Claude Partner Network), Notion (custom-skills partner directory), OpenAI (Codex CLI partner), Atlassian (skills partner), etc. Each badge = trust signal on landing page + funnel from partner directories. Requires meeting each program's certification requirements (revenue / customer count / technical review). Tied to v1 partnership push when revenue + customer base justify the application cost.
- **"Persona as content"** *(idea)* — Anton's W.A.Y. persona becomes a content series itself ("what my W.A.Y. persona said today"). Dogfooding-as-marketing.
- **Public persona gallery** *(idea — privacy review required)* — opt-in showcase of founders who consent to share their personas publicly. Marketing + community + competitor-research uses. Privacy review will need ADR.
- **Anti-AI-sludge positioning** *(idea)* — pitch W.A.Y. as the antidote to generic AI content: "your real voice, not a hallucinated one." Brand-experiment framing.

## Methodology / process

- **Synthetic persona QA** *(idea — Anton 2026-05-18)* — use the 4 existing Warsaw AI Community personas (Heorhii K., Dmitry B., Maksym P., Mark S.) as test users for v0 build. Runs as part of QA without needing real users; complements the 5-10 founder-friends private test cohort.

## Long-term / category-shifting ideas

> These could redefine what W.A.Y. is. They're not feature additions; they're potential pivots or expansions. Bring back when v0/v0.5 has produced enough signal to consider them.

- **Persona as a portable identity standard** — W.A.Y. defines an open persona format that competitors adopt. Anton becomes the standards-setter for "AI identity."
- **W.A.Y. as a B2B-only product** — drop B2C entirely; focus on enterprise C-suite persona consulting. Track 2 becomes the whole company.
- **W.A.Y. as a community-network feature** — personas connect founders to each other based on persona-overlap (your persona finds 5 other founders you should talk to). Matchmaking layer.

---

## How to add an idea

Anything counts. Tiny brand experiment. Big architectural shift. Speculative idea you want to remember. Use this format:

```markdown
- **[Name of idea]** *(status)* — one-line description. Why it matters / where it might land. v0? v0.5+? v1+? Backlog only?
```

When unsure of section, drop it under a section that looks closest. We'll regroup as the file grows.
