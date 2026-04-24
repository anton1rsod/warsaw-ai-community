# Moderation Playbook

**Status:** Stub — flesh out on the first moderation incident or when we hit 30 members.

## Purpose

A repeatable process for handling the common moderation scenarios so core organizers don't improvise under pressure and members see consistent treatment.

## Current scope (while small, 19 → 50 members)

Moderation is mostly ambient — direct messages, friendly nudges. Write things down when:

- We hit a repeat offender.
- A decision sets a precedent.
- A member formally raises a concern.

## Baseline rules (inherited from Code of Conduct)

See [`CODE_OF_CONDUCT.md`](../../CODE_OF_CONDUCT.md).

## Common scenarios (to be expanded)

| Scenario | First action | Escalation |
|---|---|---|
| Off-topic spam | Public nudge + link to the right topic | DM after 2nd offense |
| Affiliate / undisclosed promotion | Remove post + DM with rule | 2-week mute after 2nd offense |
| Tone violation (rude, dismissive) | DM, ask to edit/apologize | Public reminder + mute if repeated |
| Harassment / doxxing | Immediate removal from channel | Log in ADR (sanitized) |
| Gbrain ingestion dispute | Remove content from gbrain on request | Log resolution in ADR |

## Tools

- Telegram native: mute, restrict, remove.
- Gbrain: per-user removal request handled via a core organizer.

## Record keeping

- Sanitized case summaries in `docs/decisions/` as ADRs (one per precedent-setting case, not per incident).
- No personal data in the repo. Names of offenders stay in Telegram.

## To be written

- [ ] Standard nudge template (public + private).
- [ ] Removal process (who notifies who, Telegram mechanics).
- [ ] Appeals process.
- [ ] Core-organizer rotation / conflict-of-interest handling.
