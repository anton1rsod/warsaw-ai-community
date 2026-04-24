# GBrain Operations Playbook

Operational runbook for core organizers. Covers: deploying, monitoring, intervening, and recovering.

## Environments

| Env | URL pattern | Purpose |
|---|---|---|
| Production | `https://gbrain.<your-vercel-domain>` | Real Warsaw AI Community channel |
| Preview | per-PR Vercel preview URL | PR validation, never pointed at real channel |
| Local | `http://localhost:3005` | Development |

## Deploy (production)

1. Push to `main`.
2. Vercel auto-builds `projects/gbrain/app/` (root-directory setting).
3. On green deploy:
   - Vercel Cron picks up `vercel.json` schedule automatically.
   - Telegram webhook stays pointed at production.

## Switching on / off

| Control | How |
|---|---|
| Full kill | Set `GBRAIN_KILL_SWITCH=true` in Vercel env → redeploy not required for env-var reads but recommended. Webhook returns `{ok:true, killed:true}` without processing. |
| Pause digest only | Set `DIGEST_ENABLED=false`. Cron still fires but returns `skipped: disabled`. |
| Revoke Telegram webhook | `curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"` |
| Revoke GitHub PAT | GitHub Settings → Developer settings → Fine-grained tokens → revoke. |

## Common issues

**Issue: bot silent in the channel.**
1. Check Vercel deployments — is production green?
2. Check Telegram webhook status: `curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"`. Look for `last_error_message`.
3. Check Vercel logs for the webhook route.

**Issue: digest missed a day.**
1. Check Vercel Cron history.
2. Check AI Gateway dashboard for usage and errors.
3. Manual trigger: `curl -H "Authorization: Bearer <CRON_SECRET>" "https://<prod-url>/api/cron/daily-digest"`.

**Issue: cost spike.**
1. AI Gateway dashboard shows per-day tokens.
2. If unexpected: `DIGEST_ENABLED=false` immediately.
3. Check for prompt-injection attempt in recent News & Signals messages.
4. Open incident note in `community/archive/_removed/` (or as an ADR if precedent).

**Issue: member requests removal.**
1. DM channel, or direct request.
2. `/gbrain-forget <path>` from their DM — or, as core organizer, run manually:
   ```bash
   # Using the Octokit token or gh CLI equivalent:
   gh api -X DELETE /repos/<owner>/<repo>/contents/<path> \
     -f message="forget: <path> — organizer removal per request" \
     -f sha=<current-sha>
   ```
3. Write a line in `community/archive/_removed/YYYY-MM-DD.md` with date, path-hash, reason.

**Issue: secret leaked.**
1. Follow ADR-0006 rotation runbook.
2. Incident note as ADR.

## Weekly check-list

- [ ] Digest posted every day this week?
- [ ] Any entries in `_removed/`?
- [ ] AI Gateway cost under weekly target?
- [ ] Any errors in Vercel logs for webhook or cron?
- [ ] Pending queue size — is anything stuck?

## Phase 1 shipping gates (from spec §11)

- [ ] ≥ 5 non-organizer members have archived content.
- [ ] ≥ 10 archived items total.
- [ ] ≥ 14 consecutive digest posts.
- [ ] Poll: "is the daily digest useful?" — ≥ 3 positive.
- [ ] Onboarding doc linked from channel welcome.
- [ ] No critical incident in last 7 days.

## Contacts

- Primary: Anton (founder).
- Core organizers: nominated per ADR-0002 — fill in here as they're onboarded.
