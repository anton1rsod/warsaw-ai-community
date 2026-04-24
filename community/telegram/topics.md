# Telegram — Canonical Topics

**Channel:** Warsaw AI Community (Telegram, topic-structured)
**Last updated:** 2026-04-24 — via ADR-0003

## Topic set (8 live + 2 deferred)

| # | Topic | Purpose | Moderation rule | Gbrain priority |
|---|---|---|---|---|
| 1 | **General** | Open chat, welcomes, small talk, off-topic | Light | Low (skip unless `#kb`) |
| 2 | **Questions & Answers** | Member Q&A on AI/ML/tools | One question per thread | **High** — FAQ fuel |
| 3 | **Guides** | Long-form how-tos, tutorials, writeups | Must include author + date; OSS license | **High** |
| 4 | **Meetups** | Weekly offline logistics, RSVPs, post-event notes | Pinned rolling agenda | Medium — event records |
| 5 | **Projects & Repos** *(renamed from "Git Repos")* | Member-built projects, code drops, collaboration calls | Must link repo + license | **High** |
| 6 | **News & Signals** *(new)* | Daily AI/ML news, papers, model releases | Source link + 1-sentence "why it matters" | **High** — signal digest |
| 7 | **Tools & Stacks** *(new)* | Hands-on discussion of LLMs, frameworks, APIs, infra (Claude, GPT, Gemini, n8n, Cursor, etc.) | Pricing/subscription talk welcome; no affiliate spam | **High** |
| 8 | **Builds & Pitches** *(new)* | Member pitches, demos, feedback requests | Pitch template required: **Problem → Solution → Ask** | **High** — pitch library |

## Deferred (add when volume demands)

- **Hiring & Gigs** — add when ≥ 3 hiring posts land in General.
- **Announcements** (read-only, organizers post) — add when `#kb` digest broadcasts prove the need.

## Universal rules

1. **`#kb` / `#archive` tag** on any message signals explicit "save this to GBrain" intent. Applies across all topics including `General`.
2. **Pitch template** in **Builds & Pitches**:
   ```
   Problem: What you're solving, for whom.
   Solution: What you're building.
   Ask: What you want from the community (feedback, collaborators, users, funding).
   ```
3. **Citation rule** in **News & Signals**: every post includes a source link and a 1-sentence "why it matters".
4. **No affiliate links** without explicit [AD] tag and disclosure — applies across all topics.
5. **Opt-in ingestion** — GBrain does not scrape the channel blindly. Ingestion rules are encoded per topic in the table above.

## Topic change procedure

1. Propose in **Builds & Pitches** or open a PR to this file.
2. Core organizers review (see [`governance.md`](../governance/governance.md)).
3. Lazy consensus (48h).
4. If approved, update this file + log an ADR in [`docs/decisions/`](../../docs/decisions/).
5. Apply change in Telegram.

## GBrain ingestion priority explained

| Priority | Meaning |
|---|---|
| **High** | Ingested by default. Assumed to be knowledge-worthy. |
| Medium | Ingested with light filtering (e.g., event records, not casual banter). |
| Low | Ignored by default. Only ingested when `#kb` tagged. |

Priority is per-topic, per-message overrides always apply (`#skip` to exclude, `#kb` to include).
