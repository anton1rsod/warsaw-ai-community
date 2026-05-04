# Git email aliases

Maps git author email addresses to roster `github_handle` values for the contributions counter at `projects/community-platform/lib/__generated__/contributions.json`.

## Why this file exists

Git commits carry a name + email, not a GitHub handle. The contributions counter resolves email → handle via:

1. This file — explicit alias (highest precedence, retroactive coverage of historical commits).
2. GitHub noreply pattern — `<id>+<handle>@users.noreply.github.com` or `<handle>@users.noreply.github.com` → extract `<handle>`.
3. Local-part fallback — the part before `@`. Members whose git author email's local-part already matches their roster handle don't need an alias entry.

A member whose resolved handle isn't on the roster is silently dropped, so junk-handle commits don't pollute counts.

## How to add yourself

Open a PR with a new row. Cells are case-insensitive. The notes column is optional (parser ignores anything beyond the two required columns); use it to explain why an alias is needed (multi-machine setup, employer email, legacy handle, etc.).

| Git email | GitHub handle | Notes |
|---|---|---|
| anton@rsod.solutions | anton1rsod | Founder; primary git author email |
| MARK_GIT_EMAIL_TBD | markspas | Backfilled per Q6 (v0.1.1 plan §11.7) — Telegram-then-PR predates invitation flow |

## Format rules

- Header row must contain `Git email` and `GitHub handle` (case-insensitive, optional whitespace) — column order doesn't matter.
- Rows with empty cells in either required column are skipped.
- Rows with `*(TBD)*` in either required column are skipped.
- Handles may carry a leading `@` — it is stripped during parsing.
- Multiple aliases can map to the same handle (a member with several git emails is fine).
