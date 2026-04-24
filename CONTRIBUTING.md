# Contributing

Welcome. This doc explains how to participate in the Warsaw AI Community and how contributions are licensed.

## Ways to contribute

| What | Where | Notes |
|---|---|---|
| Ask a question | Telegram → **Questions & Answers** | One question per thread |
| Share a guide / tutorial | Telegram → **Guides** + PR to `community/` or a project | Author + date required; OSS license |
| Drop news / paper / signal | Telegram → **News & Signals** | Source link + 1-sentence "why it matters" |
| Discuss tools / frameworks | Telegram → **Tools & Stacks** | No affiliate spam |
| Pitch a product / idea | Telegram → **Builds & Pitches** | Use the pitch template (problem / solution / ask) |
| Publish a project | `projects/<your-name>/` + Telegram → **Projects & Repos** | Use [`projects/_template/`](projects/_template/). Must link repo + license. |
| Attend a meetup | Telegram → **Meetups** | Weekly, offline in Warsaw |
| Save something to GBrain | Tag message `#kb` or `#archive` in any topic | Explicit opt-in per message |

## Starting a new project

```bash
cp -R projects/_template projects/<your-project-name>
```

Then fill in:
- `README.md` — what it is, why, who runs it.
- `spec.md` — design (use the brainstorming process if the scope is non-trivial).
- `plan.md` — implementation plan.
- `CHANGELOG.md` — track meaningful changes.

Open a thread in **Builds & Pitches** to announce and collect feedback.

## Licensing & IP

**Repo license:** MIT (see [LICENSE](LICENSE)).

**Your contributions:**
- You retain **personal rights** to anything you create (code, writing, designs).
- By contributing, you grant the community a **broad, perpetual, royalty-free license** to use, display, adapt, and include your contribution in community products (including GBrain).
- All code contributions in this repo are understood to be OSS-compatible (MIT or permissive-compatible).

When the community launches its first commercial product line, we may introduce a standard Contributor License Agreement (CLA). This does not apply retroactively without explicit consent.

**GBrain ingestion:**
- GBrain does not ingest Telegram messages by default.
- Ingestion requires either: (a) a `#kb` / `#archive` tag on the message, or (b) topic-level consent encoded in [`community/telegram/topics.md`](community/telegram/topics.md).
- You can request removal of your content from GBrain at any time via a core organizer.

## Code of conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). TL;DR — be kind, be specific, attack ideas not people, no spam, no discrimination, no doxxing.

## Decisions

Big decisions (topic changes, license changes, monetization, partnerships) are recorded as ADRs in [`docs/decisions/`](docs/decisions/). Members can propose ADRs via a PR or a thread in **Builds & Pitches**.

## Questions?

Ping Anton (founder) on Telegram, or open a thread in **Questions & Answers**.
