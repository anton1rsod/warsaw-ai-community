# ADR-0016 — Telegram echo for /this-week statuses (opt-in, supergroup topic)

**Status:** Proposed
**Date:** 2026-05-28
**Deciders:** Anton Safronov + community alpha cohort (post-Day-14 ratification)
**Drivers:** Engagement brainstorm (`docs/specs/2026-05-28-community-platform-engagement-brainstorm.md`) §6 + §3.2 — close the audience-uncertainty loop on `/this-week` writes.

## Context

`/this-week` accepts authenticated status writes; today, a member posts and has no signal that anyone read it. Telegram has 19 members already + an established conversational culture; auto-echoing platform statuses to the supergroup gives the writer a visible audience and lets Telegram-only members peek at platform activity without crossing the GitHub OAuth bridge.

## Decision

Subploters MAY auto-echo new `/this-week` statuses (and edits) to a designated topic inside the existing Subploters supergroup. The echo is **opt-in per-member**, **default OFF**, and gated on profile-frontmatter `telegramEcho: true`. Echo failures do NOT block the status write (fire-and-forget). Member body content is mirrored verbatim up to 200 characters; longer bodies are truncated with `…` and link back to the platform.

## Consequences

**Easier:**
- Members get an immediate audience signal without checking platform analytics.
- Telegram members see platform activity without auth friction.
- Cross-channel loop reinforces Subploters' "every venture is a subplot" identity.

**Harder:**
- New env vars required (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, optional `TELEGRAM_TOPIC_ID`) — Sensitive.
- New privacy surface: a member's status body crosses a channel boundary. Mitigations: opt-in default OFF (H118), no echo without a fresh-fetched opt-in record at write time (H121), rate-limit `(handle, week)` to prevent edit-spam echo (H120).
- Telegram outage failure mode: status writes must persist on Telegram API failure (H119).

## Implementation

- `lib/telegram-notify.ts` — Bot API wrapper (POST `/bot{token}/sendMessage`).
- `app/actions/status.ts` — calls `notifyTelegram()` after a successful write iff opt-in.
- `lib/profile-editor.ts` SaveProfileSchema — adds `telegramEcho: boolean`.
- `app/components/ProfileEditor.tsx` — adds the opt-in checkbox.
- `lib/env.ts` — adds the 3 env vars as `.optional()` (echo no-ops when absent, see §6 H119 fallback).

## Change control

This ADR is Proposed at v0.10.0 ship. Flip to **Accepted** only after ≥2 weeks of clean operation in production with no privacy complaints from members. Member feedback collected via the §7 manual recruiting walkthrough (per engagement brainstorm).

## Supersedes / Superseded by

- None at proposal time.
