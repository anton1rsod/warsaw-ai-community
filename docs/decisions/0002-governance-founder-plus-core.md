# ADR-0002: Governance — founding organizer with small core team

**Status:** Accepted
**Date:** 2026-04-24
**Deciders:** Anton Safronov (founder)

## Context

With a commercial-track ambition at accelerated pace (see ADR-0004), the community needs a governance model that moves fast but scales past one person. A flat collective slows decisions; a pure BDFL bottlenecks at the founder; a formal board is premature at 19 members.

## Options considered

1. **Sole founder / BDFL.** Founder decides everything. Simple, fastest early, but bottleneck as it grows.
2. **Founding organizer + small core team (2–4 co-organizers).** Founder owns direction; core shares ops; lazy consensus for program-level decisions; founder breaks ties.
3. **Flat collective.** 19 peers. Votes or lazy consensus only. Democratic but slow; weak accountability.
4. **Legal entity with board.** Premature at this size.

## Decision

**Option 2 — Founding organizer with a small core team.**

- Founder (Anton) sets direction, owns vision, breaks ties.
- 2–4 core organizers share operational responsibility (moderation, meetups, gbrain, content).
- Lazy consensus (48h silence = consent) for program-level decisions among core.
- Founder call for license / IP / commercial decisions.
- Core organizers nominated by founder within 2 weeks of formal program launch.

## Consequences

**Easier:**
- Routine ops don't block on the founder.
- Scales to 50–200 members without restructuring.
- Clear accountability (owners of each function).
- Lazy consensus is cheap overhead.

**Harder:**
- Requires 2–4 members willing and able to take on core responsibility — must identify and recruit them.
- Dependence on personal trust and goodwill early on.
- Will need re-evaluation at 200+ members or when a legal entity is formed.

## Implementation

- [x] `community/governance/governance.md` codifies roles, decision classes, lazy consensus.
- [ ] Founder nominates initial 2–4 core organizers within 2 weeks (new ADR when they accept).
- [x] Moderation playbook stub in `community/governance/moderation-playbook.md`.
