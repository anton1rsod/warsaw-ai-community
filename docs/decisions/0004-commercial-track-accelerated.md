# ADR-0004: Commercial trajectory, accelerated timeline

**Status:** Accepted
**Date:** 2026-04-24
**Deciders:** Anton Safronov (founder)

## Context

At formation, the founder defined the community's ambition not as a hobby group but as a community-to-platform trajectory — potentially monetizing via paid workshops, hiring board, accelerator, consulting collective, commercial GBrain-as-a-service, and member-built spinouts. Explicitly: "evolving into something much faster with today's motion and speed in which everything operates."

This is a **material** decision that shapes every downstream choice: licensing posture, brand consistency, data consent, roster tracking, legal-entity readiness, record-keeping.

## Options considered

1. **Casual hobby** — no commercial intent. Rejected: doesn't match founder's vision.
2. **Serious community, non-commercial** — grow, meetup, but not a business. Rejected: founder wants the commercial option.
3. **Community → platform on accelerated timeline.** Build commercial readiness from day one without monetizing yet.
4. **Incubator-without-being-one** — community stays non-commercial, projects spin out. Partial overlap with (3) but weaker commercial posture at the community level.

## Decision

**Option 3 — community-to-platform on accelerated timeline.**

- We do not monetize today.
- We build **commercial readiness** from day one:
  - OSS-first licensing (ADR-0001).
  - Brand consistency (`community/brand/`).
  - Opt-in roster tracking (`community/members/roster.md`).
  - ADR-based decision log for future due diligence.
  - Consent-based data handling (GBrain ingestion requires opt-in).
- **Time horizon signals:**
  - 3 months: 50 members, GBrain v1, 2 shipped projects.
  - 12 months: 200 members, GBrain v2 with monetization path, 12 shipped projects.
  - 24+ months: Legal entity exercised, first commercial product line.

## Consequences

**Easier:**
- Future monetization doesn't require retroactive cleanup.
- Members who join understand the trajectory up front.
- Investment, sponsorship, or partnership offers can be evaluated quickly against a stated direction.

**Harder:**
- Slightly more documentation overhead today (ADRs, licensing clarity, brand) than a hobby group would carry.
- "Commercial-track but not monetizing yet" is a nuanced position members must understand — CONTRIBUTING.md and charter must make it clear.
- Ethically obligates the founder to actually pursue commercialization responsibly, not to cash in opportunistically without member input.

## Implementation

- [x] Program spec (`docs/specs/2026-04-24-warsaw-ai-community-program-design.md`) states the trajectory in Section 2 and Section 9.
- [x] Charter states it plainly (`community/charter/charter.md`).
- [x] CONTRIBUTING.md explains the CLA-later clause.
- [ ] First legal-entity evaluation triggered by first commercial revenue signal (new ADR at that moment).
