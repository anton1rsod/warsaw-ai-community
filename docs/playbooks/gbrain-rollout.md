# GBrain Rollout Runbook

Step-by-step guide for launching GBrain in three phases: staging, soft launch, full launch.

## Pre-launch — week 1–2

### 1. Create the Telegram bot
1. Open @BotFather in Telegram.
2. `/newbot` → name "GBrain" → username `@WarsawAIBrainBot`.
3. Save the bot token **directly to Vercel env vars** (see step 3). **Do not paste it anywhere else.**
4. `/setprivacy` → DISABLE (bot needs to read non-`/command` messages in groups).
5. `/setjoingroups` → ENABLE.

### 2. Set up Vercel project
1. `cd projects/gbrain/app`
2. `npx vercel link` — create new project, name `gbrain`, root directory `projects/gbrain/app`.
3. `npx vercel env add TELEGRAM_BOT_TOKEN production preview development` — paste the token here, once.
4. Repeat for every var in `.env.example` that is not optional. **Use `vercel env add` not files.**
5. `npx vercel --prod` — first production deploy. Note the URL.

### 3. Register Telegram webhook
```bash
# Generate a strong webhook secret
SECRET=$(openssl rand -hex 32)
# Store it as an env var:
npx vercel env add TELEGRAM_WEBHOOK_SECRET production preview development
# (paste $SECRET when prompted)

# Register with Telegram:
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://<your-prod-url>/api/telegram/webhook" \
  -d "secret_token=$SECRET" \
  -d "allowed_updates=[\"message\"]"
```

### 4. Stage against a throwaway group
1. Create a private Telegram group with 2–3 trusted people.
2. Add `@WarsawAIBrainBot` as admin with permissions: read messages + send messages.
3. Temporarily override `CHAT_ID` + `TOPIC_NEWS_ID` to the staging group's values.
4. Post test messages; confirm:
   - `#kb` in formal topics → immediate commit.
   - No tags in formal topics → 48h deferred (check pending store via log).
   - `#kb` from another member in casual topic → DM confirmation to author.
   - `/gbrain-status`, `/gbrain-optout` work.
   - Manual cron trigger produces a digest.

## Soft launch — week 3–4

### 5. Point at production channel, organizer-only
1. Update `CHAT_ID` to real `Warsaw AI Community` chat id.
2. Populate all `TOPIC_*_ID` vars using Telegram's `getUpdates` or the "forum topics" API.
3. Announce in Telegram **Announcements** (or pinned General post if Announcements not live):
   > "GBrain (@WarsawAIBrainBot) is joining the channel today. For the next 2 weeks **only core organizers will use the archive tags**; members can already use `/gbrain-status` and `/gbrain-optout` in DM to set preferences. Full consent rules unlock on <date>."
4. Pin the [onboarding doc](../../community/telegram/onboarding-gbrain.md) link.

## Full launch — week 5

1. Post update in Announcements:
   > "GBrain consent rules are now live for everyone. See pinned link for how it works. Questions in **Questions & Answers**."
2. Unrestrict tag handling (no code change needed — was never actually restricted in code; the soft-launch was a social agreement).
3. Start watching the weekly metrics check-list.

## Week 5–8 — observation window

- Daily: check digest posted.
- Weekly: run the check-list in [`gbrain-operations.md`](gbrain-operations.md).
- Tune prompt in `src/digest/prompt.ts` if digest quality is low. Each prompt change = new commit + ADR if the change is significant.
- Collect feedback in Questions & Answers. Consider a pinned "rate today's digest" poll.

## Week 8 — Phase 1 review

Run the shipping gates in [`gbrain-operations.md`](gbrain-operations.md) — if ≥ 80% green, open ADR-00NN to unlock Phase 2. If < 80%, write a retrospective ADR instead and adjust scope.

## Rollback

- **Panic button**: set `GBRAIN_KILL_SWITCH=true`.
- **Targeted**: `DIGEST_ENABLED=false` or delete webhook (`deleteWebhook`).
- **Full rollback**: revert Vercel deployment to previous good state (one click).
- **Data rollback**: `git revert` the offending bot commits; content is gone but a tombstone remains, which is correct.
