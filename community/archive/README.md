# Archive

GBrain-managed archive of opt-in Telegram content from the Warsaw AI Community.

## Layout

- `YYYY-MM/` — one markdown file per archived message.
- `digests/YYYY-MM-DD.md` — daily digest of News & Signals.
- `_removed/YYYY-MM-DD.md` — removal records (hash-only; content is redacted).

## Consent

See [`../telegram/topics.md`](../telegram/topics.md) and [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md).

- Formal topics (Guides, Meetups, Projects & Repos, News & Signals, Tools & Stacks, Builds & Pitches) — pre-consent with a 48h `#skip` window.
- Casual topics (General, Questions & Answers) — require author confirmation via DM.
- Universal `#kb` / `#archive` tag forces ingestion; `#skip` forces exclusion.
- `/gbrain-forget` to remove your own content; core organizers can remove any content.
- `/gbrain-optout` hard-disables archiving of your future messages.

## Integrity

Every file in `YYYY-MM/` was committed by the `gbrain-bot` committer identity, not by a human contributor. Branch protection limits the bot token to this directory (and `digests/`, `_removed/`).

## License

Content is licensed under the repository's MIT license (see [`../../LICENSE`](../../LICENSE)). Individual authors retain personal rights per [`CONTRIBUTING.md`](../../CONTRIBUTING.md).
