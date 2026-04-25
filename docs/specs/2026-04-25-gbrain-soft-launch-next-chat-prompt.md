# Next-chat prompt — GBrain soft launch

Copy the block below into the next Claude Code session.

---

```
GBrain Phase 1 staging is GREEN as of 2026-04-25 ~16:30 Warsaw. 8/8
critical paths verified on a throwaway gbrain-staging Telegram supergroup
(chat_id -1003803365571, one News topic with message_thread_id=6).

Production deploy is live at https://warsawaicommunitygbrain.vercel.app
on Vercel project anton-9351s-projects/warsaw_ai_community_gbrain.
Webhook is registered at /api/telegram/webhook with secret_token verified.
All 22 env vars are set in Production + Preview; all secrets flagged
sensitive. CRON_SECRET was rotated and tested via curl (HTTP 200,
itemCount:0, also wrote digest log ead60f9). Latest staging archive
commits are 84b2479, 39a9c5f.

Repo: https://github.com/anton1rsod/warsaw-ai-community-gbrain (private,
gh logged in as anton1rsod). Bot handle: @WarsawAIBrainBot.

Full state, the 8 staging-test results, and the soft-launch playbook are
in the auto-memory file project_gbrain_execution_state.md. The repo's
playbook is docs/playbooks/gbrain-rollout.md §5 Soft launch. The 8
canonical real-channel topics and ingestion rules are in
community/telegram/topics.md (and ADR-0003).

I'm ready to do the soft launch on the real Warsaw AI Community channel.
The order:

  1. I add @WarsawAIBrainBot to the real Warsaw AI Community channel as
     admin (Send Messages permission only — NOT delete/restrict).
  2. I send a brief test message in the real channel's General topic so
     getUpdates has something to return.
  3. You walk me through deleteWebhook → getUpdates to extract the real
     chat_id, then re-register the webhook IMMEDIATELY (don't leave the
     bot deaf — Telegram queues only ~100 updates while webhook is off).
  4. We extract the 8 real TOPIC_*_ID values. Easiest path: I send one
     message in each topic; you call getUpdates after each (with webhook
     temporarily off), capture message_thread_id, then re-register webhook.
     Or one batch: I post in all 8, you do one delete-getUpdates-reregister
     cycle. Your call.
  5. You drive `vercel env rm/add` for CHAT_ID and all 8 TOPIC_*_IDs
     (you have project-level Bash(vercel *) permission per .claude/settings.json),
     then `vercel --prod`.

     The 8 topics → env var mapping per ADR-0003:
       1 General           → TOPIC_GENERAL_ID
       2 Questions & Answers → TOPIC_QA_ID
       3 Guides            → TOPIC_GUIDES_ID
       4 Meetups           → TOPIC_MEETUPS_ID
       5 Projects & Repos  → TOPIC_PROJECTS_ID
       6 News & Signals    → TOPIC_NEWS_ID
       7 Tools & Stacks    → TOPIC_TOOLS_ID
       8 Builds & Pitches  → TOPIC_PITCHES_ID

  6. I draft the soft-launch announcement text using the template in
     gbrain-rollout.md §5; you review/tighten before I post it in the
     real channel's Announcements topic (or pinned General if Announcements
     isn't a topic yet).
  7. I pin the link to community/telegram/onboarding-gbrain.md.

After step 7 we're live. Soft-launch observation period is 2 weeks
(organizer-only #kb tag use, members already have /gbrain-status and
/gbrain-optout in DM).

Constraints / safety:

- Do NOT echo or write any token, secret, or API key into any file or
  commit. All secrets are in Vercel env (sensitive); they never need
  to leave it. If I paste one by mistake, tell me to rotate it.
- Do NOT post anything to the real channel except (a) the brief test
  messages I send for chat_id/topic_id extraction in steps 2 and 4,
  and (b) the announcement I approve in step 6. Specifically: no
  digest, no auto reply, no /gbrain-status DM unsolicited.
- Do NOT change Phase 1 code. The url.parse() deprecation warning from
  grammY internals is logged as a Phase 2 carryover; do not fix it now.
  If you spot anything else, log it but don't fix.
- Do NOT delete the staging group's archive commits (84b2479, 39a9c5f,
  ead60f9) — they're historical artifacts and inform Phase 1 review.
- Do NOT change the canonical 8 topics on the real channel — they exist
  per ADR-0003 and any restructure needs a new ADR.
- Do NOT redeploy with stale env values; always vercel env rm before
  vercel env add (CLI 52 won't offer "overwrite" for envs that already
  contain a value).
- Tomorrow morning ~08:00 Warsaw the auto-cron will fire. If we soft-launch
  TODAY, it'll fire against the real channel tomorrow. That's fine — just
  be aware. If we want to pause, set DIGEST_ENABLED=false until ready.

Start by reading the auto-memory project_gbrain_execution_state.md and
docs/playbooks/gbrain-rollout.md, then ask me when I'm ready to start at
step 1 (add bot to real channel as admin).
```

---

## Why this prompt is shaped this way

- Names the live state explicitly (URLs, IDs, commits) so the next session can self-orient without re-discovery.
- Encodes the new safety rails specific to soft launch: no test posts on the real channel, no Phase 2 drift, no canonical topic restructure.
- Reuses the input/output contract: user does anything that requires a Telegram account or human judgment (adding bot, sending messages, posting announcement); assistant drives Vercel + curl + GitHub verification autonomously.
- Lists the topic→env-var mapping inline so the assistant doesn't need to re-derive it from `community/telegram/topics.md` each time it constructs an `env add` command.
- Flags the auto-cron timing implication so the user can decide whether to set `DIGEST_ENABLED=false` overnight if they want to delay the first real-channel digest.
