# Warsaw AI Community — Program Design

**Status:** Draft v1 · awaiting founder review
**Date:** 2026-04-24
**Owner:** Anton Safronov (Founding Organizer)
**Type:** Program-level spec (enduring entity, not a project)

---

## 1. Vision

Warsaw AI Community is a Warsaw-based, commercially-minded community of builders, researchers, and open-minded operators focused on practical AI/ML. We gather offline weekly, run event-driven bursts around the fastest-moving parts of the field, and treat the community as an **incubator pipeline** that can evolve into a platform (paid workshops, hiring, product spinouts, knowledge services) on an accelerated timeline.

The community is not a hobby. It is an early-stage venture whose first "product" is the community itself and whose second product is GBrain — a Telegram-accessible knowledge base built from everything the community produces.

## 2. Mission (12-month horizon)

1. Grow from **19 → 200+ engaged members** in Warsaw and aligned diaspora.
2. Ship **GBrain v1** (Telegram bot, RAG over community knowledge) within the first 2 months.
3. Run **weekly offline meetups** without a single missed week.
4. Publish **≥ 12 member-built projects** in `projects/` within 12 months.
5. Establish **commercial readiness** — brand, legal structure options, OSS license posture, contribution norms — so the community can monetize when it chooses without retroactive cleanup.

## 3. Operating Principles

1. **OSS-first, commercial-compatible.** All community-built code/content is MIT/Apache licensed. Members retain rights to their own contributions; the community has a broad license to use, display, and include in products like GBrain. CLA is introduced when the first commercial product line forms.
2. **Docs-first.** The repo is the single source of truth for the community's operating state. Telegram is the conversation layer; the repo is the memory layer.
3. **Speed over polish (early).** We optimize for shipping, not for completeness. v1s are expected to be rough.
4. **One project, one folder, one template.** Every sub-project follows `projects/_template/` — no bespoke structures.
5. **Decisions are written.** Any choice with reversibility cost becomes an ADR in `docs/decisions/`. Tribal knowledge is a bug.
6. **Member consent for data use.** Nothing ingested into GBrain or public products without explicit opt-in by message tag (`#kb`, `#archive`) or topic-level consent baked into rules.

## 4. Governance

**Model:** Founding organizer with a small core team.

- **Founder / BDFL:** Anton Safronov — sets direction, owns vision, breaks ties.
- **Core organizers:** 2–4 trusted members (TBD) — share operational responsibility (moderation, meetups, content, gbrain).
- **Members:** everyone else. Contribute via pitches, projects, guides, Q&A, attendance.

**Decision flow:**
- Routine ops (weekly meetup logistics, moderation calls) — any core organizer decides.
- Program-level changes (new topics, rule changes, license changes) — core-team lazy consensus, founder breaks ties.
- Commercial / IP / legal-entity decisions — founder call, recorded as ADR.

**ADR policy:** Decisions that affect the whole community (topic changes, license changes, moderation policy, monetization moves, external partnerships) are recorded in `docs/decisions/NNNN-title.md` using the standard ADR template.

## 5. Cadence

- **Weekly offline meetup** in Warsaw. Anchor event. Every week. Logged in `community/meetings/weekly/YYYY-MM-DD.md`.
- **Event-driven online bursts** for major AI news, product launches, guest speakers, hackathon-style sprints. Logged in `community/events/<slug>/`.
- **No mandatory online sync calls.** Telegram topics carry async communication 24/7.

## 6. Telegram Channel — Canonical Topic Set

Existing topics preserved; 3 new ones added; Git Repos renamed.

| # | Topic | Purpose | Moderation rule | Gbrain priority |
|---|---|---|---|---|
| 1 | General | Open chat, welcomes, off-topic | Light | Low (skip unless `#kb`) |
| 2 | Questions & Answers | Member Q&A on AI/ML/tools | One Q per thread | High (FAQ fuel) |
| 3 | Guides | Long-form how-tos, tutorials | Must include author + date; OSS license | High |
| 4 | Meetups | Weekly offline logistics, RSVPs, post-event notes | Pinned rolling agenda | Medium (event records) |
| 5 | Projects & Repos *(renamed from Git Repos)* | Member-built projects, code drops, collab calls | Must link repo + license | High |
| 6 | News & Signals *(new)* | Daily AI/ML news, papers, model releases | Source link + 1-sentence "why it matters" | High (signal digest) |
| 7 | Tools & Stacks *(new)* | Hands-on discussion of LLMs, frameworks, APIs, infra | No affiliate spam | High |
| 8 | Builds & Pitches *(new)* | Member pitches, demos, feedback requests | Pitch template required (problem/solution/ask) | High (pitch library) |

**Deferred (add when volume demands):** Hiring & Gigs, Announcements (read-only).

**Universal rule:** Messages tagged `#kb` or `#archive` signal explicit "save this" intent regardless of topic.

## 7. Repository Structure

```
.
├── README.md                       # Program overview + onboarding
├── LICENSE                         # MIT (repo-level OSS-first)
├── CONTRIBUTING.md                 # How members contribute
├── CODE_OF_CONDUCT.md              # Community norms (baseline)
├── community/
│   ├── charter/                    # Mission, values, principles
│   │   └── charter.md
│   ├── governance/                 # Roles, decision-making, moderation
│   │   ├── governance.md
│   │   └── moderation-playbook.md
│   ├── cadence.md                  # Meeting rhythm, event policy
│   ├── meetings/
│   │   └── weekly/
│   │       └── YYYY-MM-DD.md       # One file per weekly meetup
│   ├── events/                     # Ad-hoc events (one folder each)
│   ├── members/                    # Roster, onboarding
│   │   └── roster.md
│   ├── telegram/                   # Topic config, bot integrations, rules
│   │   └── topics.md
│   └── brand/                      # Name, logo, voice, asset refs
│       └── brand.md
├── projects/
│   ├── _template/                  # Standard project scaffold
│   │   ├── README.md
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── CHANGELOG.md
│   └── gbrain/                     # First sub-project
│       └── README.md
├── docs/
│   ├── specs/                      # Design specs (this file lives here)
│   ├── decisions/                  # ADRs (numbered)
│   └── playbooks/                  # Runbooks, how-tos for organizers
└── .github/                        # Repo metadata (issue templates later)
```

## 8. Metrics (Program-level, reviewed monthly)

| Metric | Baseline (today) | 3-month target | 12-month target |
|---|---|---|---|
| Active members (Telegram) | 19 | 50 | 200 |
| Weekly meetup attendance | TBD | 10 avg | 25 avg |
| Member-shipped projects in `projects/` | 0 | 2 | 12 |
| GBrain status | not built | v1 live, daily usage | v2 with monetization path |
| ADRs recorded | 0 | ≥ 5 | ≥ 20 |
| Guides in `community/` + Telegram | 0 | 10 | 50 |

## 9. Commercialization Readiness (foundational, not active)

We do not monetize yet. But because the community is on a commercial trajectory, we bake in the following from day one to avoid retroactive pain:

- **OSS-first licensing** on all community-built code (MIT at the repo level).
- **Member contribution norms** documented in CONTRIBUTING.md — personal rights retained, broad community license granted.
- **Brand consistency** — name, voice, visual identity in `community/brand/`.
- **Roster tracking** — `community/members/roster.md` with opt-in visibility (preserves ability to reach members when commercial option appears).
- **Decision log** — ADRs create a paper trail for future due diligence.
- **Data consent hygiene** — GBrain does not ingest personal messages without explicit opt-in tags.

When the first commercial product line emerges, we will: introduce a CLA, select a Polish legal entity (likely sp. z o.o. or fundacja — to be evaluated), and assign IP cleanly.

## 10. Scope Boundaries (what this program is NOT, today)

- **Not a registered legal entity yet.** Operates as an informal community.
- **Not accepting sponsorships / revenue yet.** Track those options in ADRs when proposed.
- **Not operating outside Warsaw + Telegram.** Expansion to other channels (Discord, Slack, regional chapters) is a future decision, not current scope.
- **Not a general tech community.** Focus is AI/ML practical work — builders, researchers, operators. Adjacent topics (web dev, devops) welcome only insofar as they serve AI work.

## 11. Sub-Project Pipeline

| # | Sub-project | Status | Spec location |
|---|---|---|---|
| 1 | GBrain (Telegram knowledge base) | Spec pending (next) | `projects/gbrain/spec.md` |
| 2+ | TBD — member-proposed | — | `projects/<name>/spec.md` |

Every sub-project gets its own brainstorming → spec → plan → implementation cycle.

## 12. Open Questions / Deferred

- Identity of the 2–4 core organizers (deferred — founder to nominate within 2 weeks).
- Hiring & Gigs topic launch trigger (deferred — add when ≥ 3 requests land in General).
- Announcements topic launch trigger (deferred — add when `#kb` ingestion proves the write-once broadcast need).
- Polish legal entity selection (deferred — decide at first commercial revenue signal).
- Sponsorship policy (deferred — decide at first inbound offer).

## 13. Success Criteria for This Spec

This program spec is "done" when:
- [ ] Repo scaffold matches section 7.
- [ ] Charter, governance, cadence, topics, contributing, license files exist and reflect sections 1–6.
- [ ] ADR-0001 (OSS-first licensing) and ADR-0002 (governance model) are recorded.
- [ ] `projects/_template/` exists and is usable.
- [ ] `projects/gbrain/` exists with a stub `README.md` pointing to its own spec (to be written next).
- [ ] Founder has reviewed and approved.
- [ ] `/init` generates an accurate `CLAUDE.md` from this reality.

---

**Next step after approval:** Brainstorm GBrain sub-project spec (its own brainstorming cycle, saved to `projects/gbrain/spec.md`).
