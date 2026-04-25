# GBrain — Rehearsal handoff (for next chat)

**Date:** 2026-04-25
**Author:** session 2 closeout
**Supersedes:** [2026-04-25-gbrain-soft-launch-next-chat-prompt.md](./2026-04-25-gbrain-soft-launch-next-chat-prompt.md) (which assumed direct soft-launch on the real channel; we have since decided to do a dress rehearsal first)
**Audience:** Anton (first-time operator) + the next Claude Code session

---

## 1. Why we're not soft-launching yet

Phase 1 is feature-complete and 8/8 staging-test green from the prior session. But the prior staging only exercised:
- 1 topic (News & Signals, `message_thread_id=6`)
- 1 author (Anton)
- All `itemCount=0` digests (because the in-memory news-log was wiped on every cold start — fixed this session)

Before exposing the bot to 19 real members on the live Warsaw AI Community channel, we want a **dress rehearsal** in `gbrain-staging` that exercises:
- All 8 priority tiers (High formal / Medium / Low casual / General special case)
- Multi-author flows (cross-`#kb` confirmation DM)
- 48h defer flow (with `DEFER_MS=60s` override for tractable test)
- `/gbrain-forget` round-trip + tombstone
- Digest with **non-zero** item count (validates the news-log persistence fix)
- Failure modes (AI down, wrong webhook secret, kill switch on)

---

## 2. What this session shipped

### Code (all committed in `165b54d`)

| Change | Files |
|---|---|
| `ARCHIVE_NAMESPACE` env var (default empty; `_staging` for rehearsal). Threaded through pipeline + cron archive paths. | `src/config.ts`, `src/pipeline.ts`, `app/api/cron/daily-digest/route.ts`, `.env.example` |
| `news-log` persisted to GitHub. Replaces in-memory `LOG: ParsedMessage[]` (which was wiped on Vercel cold start, breaking digest). One JSON file per news message at `community/archive/<NS>/_news-log/<YYYY-MM-DD>/<ts>-<id>.json`. | `src/digest/news-log.ts`, `src/store/github.ts`, `src/store/index.ts`, `app/api/telegram/webhook/route.ts` |
| `GithubStore` extended with `readJson` + `listDir` (used by news-log snapshot). | `src/store/github.ts` |
| 13 new tests across config, store, news-log, integration. **91/91 vitest green, tsc clean.** | `tests/unit/{config,store,news-log,topics}.test.ts`, `tests/integration/webhook-ingest.test.ts` |
| **DEP0169 investigation** (no code change): grammY 1.42 has zero `url.parse` callers; warning is from Next.js 16.2.4 internals. Resolution: set `NODE_OPTIONS=--disable-warning=DEP0169` in Vercel env. | n/a |

### What broke this session (state to clean up)

| What | Where | Action needed |
|---|---|---|
| **Production `CRON_SECRET=""`** (empty). Anton accidentally set it during a rotation attempt where `$NEW` was unset. | Vercel → `warsaw_ai_community_gbrain` → Production env | **Re-rotate before tomorrow's 09:00 Warsaw cron**, otherwise the cron's auth check fails and the digest doesn't run. See §3. |
| Vercel project **not connected to a Git repo** | Vercel → project Settings → Git | Connect to `anton1rsod/warsaw-ai-community-gbrain`. Without this, preview env vars can't be branch-scoped (`vercel env add NAME preview` fails). |
| New preview deploys are **SSO-protected** | Vercel → project Settings → Deployment Protection | Either disable for previews during rehearsal, or generate a "Protection Bypass for Automation" token. |
| Several stale preview deployments from this session | Vercel → Deployments | Optional `vercel rm <url>` cleanup. They auto-expire. |

---

## 3. Pre-flight checklist for Anton (do these before the next chat)

These are 3 short manual actions in the Vercel UI. Each takes about a minute.

### 3.1 — Re-rotate `CRON_SECRET` (CRITICAL — do today)

1. Open <https://vercel.com/anton-9351s-projects/warsaw_ai_community_gbrain/settings/environment-variables>
2. Find `CRON_SECRET`. It's currently set to empty (per the screenshot from session 2).
3. Click the three-dot menu → **Edit**.
4. Generate a new secret in your terminal: `openssl rand -hex 32` (copy the 64-char output).
5. Paste into the value field. Make sure **Sensitive** is checked.
6. Set scope to **Production**, **Preview**, **Development** (all three).
7. Save.
8. **Save the same value in your password manager** so we don't repeat session-2's "lost secret" rabbit hole. Once it's marked Sensitive, Vercel won't show it again.
9. Trigger a redeploy: in the Deployments tab, find the latest production deployment, click the three-dot menu → **Redeploy**.

Why critical: tomorrow at ~09:00 Warsaw, the daily-digest cron fires. With `CRON_SECRET=""`, the route's auth check fails and the cron skips. Not the worst outcome (no Telegram post made), but it shouldn't be in this state.

### 3.2 — Connect Vercel project to GitHub

1. Same project → Settings → Git
2. Click **Connect Git Repository**.
3. Authorize Vercel for `anton1rsod/warsaw-ai-community-gbrain`.
4. Don't enable auto-deploy on push yet (we want explicit deploys). Or enable and live with it — your call.

This unblocks branch-scoped preview env vars and removes a class of friction we hit in session 2.

### 3.3 — (Optional) Disable Deployment Protection on previews during rehearsal

1. Same project → Settings → Deployment Protection
2. Under **Vercel Authentication**, choose **Standard Protection** off, or set to **Only Production Deployments Protected**.
3. We don't need preview SSO during rehearsal because previews aren't user-facing.

If you'd rather keep preview SSO on, generate a bypass token instead and we'll use it. Either works.

---

## 4. Step-by-step rehearsal plan (for the next chat)

This is what the next-chat agent will drive. Each step is small and either you (Anton) or the agent owns it.

### Phase A — staging topology (Anton does this in Telegram UI)

**Why manual not automated:** session 2 spent an hour trying to call `createForumTopic` via API and hit four orthogonal Vercel issues. Manual creation is 30 seconds and bypasses all of that.

A1. Open `gbrain-staging` supergroup in Telegram desktop client.

A2. Tap the topic name at the top of the chat (or hamburger menu → Manage Topics) → **Create Topic**.

A3. Create these 6 topics, exactly named (we already have General + News):
   - `Questions & Answers`
   - `Guides`
   - `Meetups`
   - `Projects & Repos`
   - `Tools & Stacks`
   - `Builds & Pitches`

A4. In each of all 8 topics (including the existing General + News), send a short test message — the contents don't matter, e.g. "test 1", "test 2", etc.

A5. Right-click each test message → **Copy Message Link**. Paste all 8 URLs into the next chat. The agent extracts `message_thread_id` from each URL — `https://t.me/c/<chat>/<THREAD_ID>/<msg>` — no API, no secrets.

### Phase B — staging env update + redeploy (agent drives, Anton authorizes)

B1. Agent runs `vercel env rm` + `vercel env add` for each of:
   - `ARCHIVE_NAMESPACE=_staging`
   - `NODE_OPTIONS=--disable-warning=DEP0169` (silences Next.js's url.parse noise)
   - `CHAT_ID` stays at the staging supergroup id `-1003803365571`
   - All 8 `TOPIC_*_ID` from Phase A

B2. Agent runs `vercel --prod` — **Anton authorizes per-action** (or pre-adds permission to `.claude/settings.json`).

B3. Agent verifies webhook still registered: `curl https://api.telegram.org/bot$TOKEN/getWebhookInfo` (using the bot token from `@BotFather`, in Anton's terminal — token never enters chat).

### Phase C — 8 rehearsal tests (mostly Anton posts, agent observes)

| # | Test | Anton does | Agent verifies |
|---|---|---|---|
| C1 | Priority-tier `#kb` routing | Posts `#kb` in Guides (High), Meetups (Medium), General (Low) | Each commits at `community/archive/_staging/<YYYY-MM>/`, frontmatter has correct topic name, bot reacts 👀 |
| C2 | 48h defer flow | (After agent sets `DEFER_MS=60000`) posts plain message in Guides | Bot reacts 🤔. After ~60s, deferred entry auto-commits. Agent restores `DEFER_MS`. |
| C3 | Cross-`#kb` with Jurek | Jurek joins gbrain-staging. Anton posts plain message in General. Jurek replies/reacts `#kb`. | Bot DMs Anton for confirm. Anton replies `/yes` → commit lands. Test `/no` separately. |
| C4 | `/gbrain-forget` round-trip | DMs the bot `/gbrain-forget <archive-url-from-C1>` | File deleted, tombstone in `_removed/`, bot replies confirmation |
| C5 | Digest with non-zero items | Posts 3 News & Signals messages with sources + "why it matters" | Agent curls `/api/cron/daily-digest` with Bearer. Verifies `itemCount=3`, digest is sensible, posts to staging News topic. **This validates the news-log persistence fix.** |
| C6a | AI down → graceful degrade | (Agent sets `AI_GATEWAY_API_KEY` + `GEMINI_API_KEY` to bogus values) Anton triggers archive + cron | Archive still commits. Digest endpoint returns `ok:false` with reason; no broken Telegram post. |
| C6b | Wrong webhook secret → 401 | Agent curls webhook with wrong `X-Telegram-Bot-Api-Secret-Token` | 401 |
| C6c | Kill switch ON + cron | Agent sets `GBRAIN_KILL_SWITCH=true`, triggers cron | Returns ok, posts nothing, logs suppression |

### Phase D — pre-launch sweep

D1. After C1–C6 all pass: `git rm -rf community/archive/_staging`, commit, push.

D2. Agent rotates Vercel envs:
   - Remove `ARCHIVE_NAMESPACE`
   - Replace `CHAT_ID` + 8 `TOPIC_*_ID` with real-channel values (TBD by Anton during launch)

D3. **STOP.** Phase D2 turns this into the real-channel soft launch — that's a separate chat session.

### Phase E — real-channel soft launch (separate chat after D)

The original 7 steps from [2026-04-25-gbrain-soft-launch-next-chat-prompt.md](./2026-04-25-gbrain-soft-launch-next-chat-prompt.md):
1. Anton adds bot to real channel as admin (Send Messages only)
2. Anton sends test message in General
3. Agent: deleteWebhook → getUpdates → re-register webhook (capture chat_id)
4. Anton + agent: extract 8 topic IDs (one batched cycle, similar to Phase A)
5. Agent: Vercel env update + `vercel --prod`
6. Anton + agent: draft + post soft-launch announcement
7. Anton: pin `community/telegram/onboarding-gbrain.md` link

---

## 5. Lessons learned from session 2 (so the next session doesn't repeat them)

1. **Vercel sensitive env vars are write-only after creation.** Both the dashboard and `vercel env pull` redact them. The only retrievals are: from your password manager OR rotation. **Always save the value in your password manager when you create it.**

2. **Vercel CLI `--yes` flag is harness-blocked for production deploys** (auto-approve = can't be bypassed). Either remove `--yes` and accept interactive (which Bash hangs on), or get explicit per-action authorization, or pre-allow specific commands in `.claude/settings.json`.

3. **`vercel env add NAME preview` requires a Git connection** to scope by branch. Without Git connected, preview envs can't be added via CLI at all.

4. **Vercel preview SSO** intercepts curl requests with HTML auth pages. Either disable for previews or use Protection Bypass Tokens.

5. **Don't try to retrieve sensitive env vars via the agent.** It's blocked, and the harness denial costs more time than just accepting the rotate-or-have-it-saved constraint.

6. **For Telegram operations that need the bot token, get it directly from @BotFather** (`/mybots → bot → API Token`) — it's not an irretrievable secret like Vercel's. Run the curl in your terminal; pbpaste-pipe so the literal value never enters chat.

---

## 6. Open task list (carried into next chat)

```
COMPLETED in session 2:
  ✅ Phase 1 code: introduce ARCHIVE_NAMESPACE env var
  ✅ Phase 1 hardening: DEP0169 resolution (NODE_OPTIONS — apply at env update)
  ✅ Phase 1 reliability: persist news-log (now writes one JSON file per news msg)
  ✅ Anton: bot promoted to admin (Manage Topics) in gbrain-staging

PRE-FLIGHT (Anton, before next chat):
  □ Re-rotate CRON_SECRET (CRITICAL — currently empty in production)
  □ Connect Vercel project to GitHub
  □ (Optional) Disable preview SSO

REHEARSAL (next chat):
  □ Phase A: create 7 topics in Telegram UI, paste 8 message-links
  □ Phase B: env update + vercel --prod (with auth)
  □ Phase C1: priority-tier #kb routing
  □ Phase C2: 48h defer with DEFER_MS=60s
  □ Phase C3: cross-#kb with Jurek
  □ Phase C4: /gbrain-forget round-trip
  □ Phase C5: digest with seeded News items (validates news-log persistence)
  □ Phase C6: failure-mode bundle (AI down + wrong secret + kill switch)
  □ Phase D: pre-launch sweep (delete _staging dir, prepare prod envs)
  □ Update plan.md + CHANGELOG with rehearsal scope

REAL CHANNEL (after rehearsal, separate chat):
  □ Original 7-step soft launch
```

---

## 7. Next-chat prompt (copy this verbatim into the new session)

```
Read docs/specs/2026-04-25-gbrain-rehearsal-handoff.md and pick up from
section 4 Phase A. I've completed the pre-flight (§3): CRON_SECRET is
re-rotated, Vercel is Git-connected, preview SSO is [on/off].

I'm a first-time operator on this. Walk me through each step before I do
it; tell me exactly what to click or type; pause for my output before
moving on. Don't run multi-step shell commands without explaining each
piece — I lost trust in the auto-execute path during session 2.

Constraints (carry over from prior sessions):
- Never echo or write tokens/secrets/API keys to chat or files.
- No production deploys without my explicit per-action authorization.
- No code changes to Phase 1 beyond what's already committed in 165b54d
  (ARCHIVE_NAMESPACE, news-log persistence). Phase 2 carryovers are still
  out of scope.
- Don't touch the canonical 8 topics on the real channel; that's a
  separate chat session after rehearsal passes.

Start by acknowledging which pre-flight items I've completed, then
restate Phase A so I can begin creating topics in Telegram.
```

---

*End of handoff. The next chat picks up from §4 Phase A.*
