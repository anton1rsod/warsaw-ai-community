# GBrain — how it works

Welcome. GBrain is our community's knowledge bot. This page explains what it does, when it does it, and how to control what it remembers about you.

## TL;DR

- GBrain **is** a bot in our Telegram channel that can (a) save useful messages to our repo's archive, and (b) post a daily News & Signals digest.
- GBrain **is not** watching private DMs. It reads messages in our channel; it writes nothing unless consent rules say it can.
- You can opt out at any time, and you can ask for specific messages to be removed.

## What GBrain does

1. **Daily digest** in **News & Signals** — once a day GBrain posts a short summary of the last 24h of News & Signals messages. No digest on quiet days.
2. **Archive of opt-in content** — messages you (or other members) tag `#kb` end up in `community/archive/` in our repo. Frontmatter records author, timestamp, topic, and a source link.
3. **Commands** (DM the bot):
   - `/gbrain-status` — see your current preferences.
   - `/gbrain-optout` — no future message of yours is archived.
   - `/gbrain-optin` — reverse the above.
   - `/gbrain-forget <archive-url-or-path>` — remove your own archived content.

## Consent rules — short version

| Where you post | Default |
|---|---|
| **General** or **Questions & Answers** | Nothing is archived unless **you** post or react with `#kb`. If someone else tags you, GBrain DMs you to confirm. |
| **Guides, Meetups, Projects & Repos, News & Signals, Tools & Stacks, Builds & Pitches** | Pre-consent applies: your message is **archive-eligible after 48h**. Reply `#skip` (or edit the message to add `#skip`) within 48h to exclude it. |
| Any topic | `#kb` or `#archive` tag forces immediate ingestion. `#skip` forces exclusion. |
| Any topic, if opted out | Nothing is archived. |

## Commands walk-through

1. **Start the bot** — DM `@WarsawAIBrainBot` once and send `/start`. This lets the bot DM you later for confirmations.
2. **Check your status** — DM `/gbrain-status`.
3. **Opt out** — DM `/gbrain-optout`.
4. **Remove a specific message** — find the archive URL on GitHub, DM `/gbrain-forget <url>`.

## Where the archive lives

- Repo: [`community/archive/`](../archive/).
- Public, MIT-licensed, version-controlled, auditable.
- Removal = real file deletion + a removal record in [`_removed/`](../archive/_removed/).

## Questions

Ping any core organizer, or post in **Questions & Answers**.
