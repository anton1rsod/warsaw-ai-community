# ADR-0005: Cadence — weekly offline + event-driven, no mandatory online sync

**Status:** Accepted
**Date:** 2026-04-24
**Deciders:** Anton Safronov (founder)

## Context

Community cadence determines glue, member load, organizer load, and knowledge-flywheel throughput. Options range from high-frequency (weekly online + monthly offline) to event-only.

## Options considered

1. **Weekly online + monthly offline** — highest frequency, strongest glue, heavy organizer load.
2. **Bi-weekly online + monthly offline** — sustainable middle ground.
3. **Monthly offline + async-first online** — lowest load.
4. **Event-driven, no fixed cadence** — flexible, low predictability.
5. **Weekly offline + event-driven (no mandatory online sync).** — proposed by founder.

## Decision

**Option 5 — Weekly offline + event-driven bursts. No mandatory online sync.**

- One in-person meetup per week in Warsaw. Non-negotiable rhythm.
- Event-driven bursts (online or offline) around major AI news, launches, guest speakers, hackathons.
- Telegram topics carry 24/7 async communication.
- No recurring online call on the calendar.

## Consequences

**Easier:**
- Strong in-person glue without online-call fatigue.
- Proximity (Warsaw) becomes the community's competitive moat.
- Weekly meeting notes become the GBrain flywheel — consistent, dated, structured.

**Harder:**
- Every missed week is visible. Requires backup hosts (core organizers rotate).
- Members outside Warsaw feel peripheral. Acceptable trade-off given the "Warsaw" in the name, but worth monitoring.
- Needs a reliable venue + scheduling routine (open item — see `community/cadence.md`).

## Implementation

- [x] `community/cadence.md` codifies the rhythm.
- [x] `community/meetings/weekly/` exists with a template.
- [ ] Founder picks default day + time (proposal: Tuesdays 19:00 — pending).
- [ ] Founder picks default venue / rotation policy (pending).
- [ ] Core-organizer rotation for hosting (pending).
