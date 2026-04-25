# Next-chat prompt — GBrain rollout

Copy the block below into the next Claude Code session.

---

```
GBrain Phase 1 is code-complete, merged to main, and pushed to
https://github.com/anton1rsod/warsaw-ai-community-gbrain (private,
tag gbrain-v0.1.0). The handoff doc is at
docs/specs/2026-04-25-gbrain-phase-1-handoff.md and the auto-memory
project_gbrain_execution_state.md has the full state.

GEMINI_API_KEY was rotated. No deployment has happened yet — there
is no Telegram bot, no Vercel project, no webhook registered.

Walk me through docs/playbooks/gbrain-rollout.md from §1 onwards.
I'm typing into BotFather, the Vercel CLI, and curl; you're reading
back outputs and verifying each step. The order is:

  1. BotFather — create @WarsawAIBrainBot. I'll paste the bot
     username and a redacted token shape (not the token itself)
     so you can confirm.
  2. `vercel link` from projects/gbrain/app/ — name "gbrain", root
     "projects/gbrain/app". I'll paste the resulting URL.
  3. `vercel env add` for every var in .env.example. List the vars
     in order; I'll paste back vercel's confirmation lines so you
     can checklist them.
  4. Generate webhook secret with `openssl rand -hex 32`, store via
     `vercel env add TELEGRAM_WEBHOOK_SECRET`. Tell me when it's safe
     to paste the secret value (it shouldn't be).
  5. `npx vercel --prod` — I'll paste the URL.
  6. Register webhook with Telegram setWebhook + verify with
     getWebhookInfo. I'll paste the JSON; you read it back to me.
  7. Stage against a 2–3 person throwaway Telegram group, NOT the
     real Warsaw AI Community channel. Override CHAT_ID + TOPIC_NEWS_ID
     in vercel env to the staging group's values. Run the smoke
     scenarios from gbrain-rollout.md §4 and have me report each
     outcome.

Constraints / safety:

- Do NOT echo or write any token, secret, or API key into any file
  or commit. If I paste one by mistake, tell me to rotate it.
- Do NOT switch CHAT_ID to the real community channel until I say
  staging is green.
- Do NOT make changes outside the rollout — Phase 1 code is frozen.
  If you spot a Phase 2 issue while we test, log it but don't fix.
- The repo is private; gh auth status shows logged in as anton1rsod.

Start by reading the handoff doc and the rollout runbook, then ask
me when I'm ready to start at step 1 (BotFather).
```

---

## Why this prompt is shaped this way

- Names the artifacts (handoff doc, auto-memory, playbook) so the next session can self-orient.
- Encodes the safety rails the previous session enforced: never echo secrets, no real-channel switch before staging green, no Phase 2 drift.
- Asks the assistant to lead with reading the runbook before acting — keeps it from improvising.
- Specifies the input/output contract (user pastes outputs, assistant reads them back) so the rollout is co-driven, not assistant-driven.
