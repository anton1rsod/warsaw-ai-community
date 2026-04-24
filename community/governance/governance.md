# Governance

## Model

**Founding organizer with a small core team.**

- **Founder / BDFL:** Anton Safronov. Sets direction, owns vision, breaks ties.
- **Core organizers (2–4):** Trusted members who share operational responsibility. To be nominated by the founder within the first 2 weeks of formal program launch.
- **Members:** Everyone else in the Telegram channel. Contribute through pitches, projects, guides, Q&A, and attendance.

Roles are roles, not titles. A core organizer who stops showing up rotates out. A member who consistently carries load gets invited to the core.

## Decision classes

| Class | Who decides | How | Logged? |
|---|---|---|---|
| **Routine ops** (meetup logistics, moderation calls, topic cleanup) | Any core organizer | Unilateral | Meeting notes if relevant |
| **Program-level** (new topics, rule changes, cadence changes, template changes) | Core-team lazy consensus | PR or Telegram thread; silence = consent after 48h | ADR |
| **License / IP / legal-entity** | Founder | Founder call, recorded | ADR |
| **Commercial / monetization / partnership** | Founder, consulted with core | Founder call, recorded | ADR |
| **Removals (code of conduct)** | Core-team lazy consensus | Anonymized case log | ADR (sanitized) |
| **Spending community funds** (when this becomes relevant) | Founder | Receipts tracked | Separate ledger, linked from ADR |

## Lazy consensus protocol

Used for program-level decisions:

1. Proposer opens a PR (preferred) or a Telegram thread in **Builds & Pitches**.
2. Core organizers review.
3. **48-hour silence from core = consent.** Explicit approvals shorten it.
4. Any core organizer may raise a block — this moves the decision to founder call.

## ADR policy

Any decision with reversibility cost goes in [`docs/decisions/`](../../docs/decisions/) using this template:

```markdown
# ADR-NNNN: Title

**Status:** Proposed | Accepted | Superseded by ADR-NNNN
**Date:** YYYY-MM-DD
**Deciders:** Founder, core organizers involved

## Context
Why this decision is being made.

## Options considered
1. Option A — pros / cons
2. Option B — pros / cons

## Decision
What we chose and why.

## Consequences
What becomes easier, what becomes harder.
```

File naming: `NNNN-short-title.md`, zero-padded to 4 digits. Numbered in order of acceptance.

## Moderation

See [`moderation-playbook.md`](moderation-playbook.md) (to be written — first draft when we hit 30 members or the first moderation incident, whichever comes first).

## Escalation

- **Minor friction** (off-topic posts, tone slip-ups): any organizer nudges publicly, then privately if needed.
- **Code of conduct breach**: see [`CODE_OF_CONDUCT.md`](../../CODE_OF_CONDUCT.md). Core team decides by lazy consensus.
- **Disagreement between core organizers**: founder breaks ties.
- **Disagreement with founder**: member may propose a governance-amending ADR. Founder still holds final veto, but repeated overrides should trigger a governance review.

## Amending governance

This file can only be changed via an ADR (e.g., `ADR-NNNN: Amend governance to add X`). Governance is the one thing we don't hot-patch.
