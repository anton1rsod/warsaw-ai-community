# ADR-0003: Telegram canonical topic structure (8 live, 2 deferred)

**Status:** Accepted
**Date:** 2026-04-24
**Deciders:** Anton Safronov (founder)

## Context

The Telegram channel already had 5 topics: General, Questions & Answers, Guides, Meetups, Git Repos. To support the community's trajectory (news flow, tool-focused discussion, member pitches) and to give GBrain a clean ingestion model, we need a canonical topic set with explicit moderation rules and per-topic ingestion priority.

## Options considered

1. **All 10 topics** — adds News, Tools, Pitches, Hiring, Announcements.
2. **8 topics** — adds News, Tools, Pitches. Defers Hiring + Announcements.
3. **Only 3 additions** — *equivalent to option 2*.
4. **Keep existing 5 only.**
5. **Custom.**

## Decision

**Option 2/3 — 8 live topics. Defer Hiring & Announcements.**

**Live topics:**
1. General
2. Questions & Answers
3. Guides
4. Meetups
5. Projects & Repos *(renamed from "Git Repos")*
6. News & Signals *(new)*
7. Tools & Stacks *(new)*
8. Builds & Pitches *(new)*

**Deferred:**
- Hiring & Gigs — add when ≥ 3 hiring posts land in General.
- Announcements (read-only) — add when `#kb` digest broadcasts prove the need.

**Universal conventions:**
- `#kb` / `#archive` tag = explicit GBrain ingestion, any topic.
- Per-topic GBrain priority (High / Medium / Low) documented in `community/telegram/topics.md`.
- Builds & Pitches requires the **Problem → Solution → Ask** template.
- News & Signals requires a source link + 1-sentence "why it matters".
- No undisclosed affiliate promotion anywhere.

## Consequences

**Easier:**
- Clear ingestion priority per topic for GBrain.
- Each topic has a stated purpose and moderation rule — fewer judgment calls.
- Gradual topic growth (Hiring/Announcements later) keeps channel navigable.

**Harder:**
- Adds 3 new topics at once — requires a brief announcement and a short adjustment period for members.
- Renaming "Git Repos" → "Projects & Repos" requires a Telegram admin action and a member-facing note.

## Implementation

- [x] `community/telegram/topics.md` documents the canonical set.
- [ ] Anton to apply topic changes in Telegram (rename + 3 new topics).
- [ ] Announcement post in General explaining new topics + `#kb` convention.
