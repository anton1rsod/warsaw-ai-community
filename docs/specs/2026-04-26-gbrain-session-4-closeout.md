# GBrain — Session 4 closeout (0.1.1)

**Date:** 2026-04-26
**Author:** session 4 closeout
**Supersedes:** [`2026-04-26-gbrain-rehearsal-session-3-closeout.md`](./2026-04-26-gbrain-rehearsal-session-3-closeout.md) (drives §7 PRE-WORK + remaining tests + Phase D to completion)
**Audience:** Anton + the next Claude Code session (which is **brainstorming** in a fresh chat — not implementation)

---

## 1. What session 4 accomplished

Released as **`gbrain-v0.1.1`**.

### Phase 0 — Versioning ceremony
- `app/package.json` aligned (`0.0.1` → `0.1.0` mid-session, then `0.1.1` at tag).
- `CHANGELOG.md` rewritten with explicit versioning policy (stay in `0.x` indefinitely; `1.0.0` reserved).
- README documents the version table.

### Phase 1 — PRE-WORK (rotate + verify)
- ✅ `CRON_SECRET` rotated via Vercel REST API.
- ✅ `TELEGRAM_WEBHOOK_SECRET` rotated; webhook re-registered.
- ✅ Vercel API token: deferred revoke per Anton (24h scope, self-expires).
- ⏸ `TELEGRAM_BOT_TOKEN` rotation — deferred to Phase E (current token works; rotation pairs with the move to the real channel).
- ✅ Production alias verified at General-fix sha; webhook health: `pending=0`, no errors.

### Phase 1.5 — bonus discovery
Three production deploys had been silently ERRORing with `ENOENT package.json`: the Vercel project's `rootDirectory` was `null`, so git-push auto-deploys ran from repo root. PATCHed to `projects/gbrain/app`; both auto-deploys and API-triggered deploys now succeed without `projectSettings` overrides.

### Phase 2 — Rehearsal (C4-C6)
| Test | Status | Notes |
|---|---|---|
| C4 — `/gbrain-forget` round-trip | ✅ + bug fix | File deleted ✓. Discovered spec §10 tombstone gap (was never written). Fixed in 89e39ab + tested. |
| C5 — Daily digest with non-zero items | ✅ | `itemCount:3, in:340, out:1386 tokens` via `gemini-2.5-flash`. Real digest committed and posted. |
| C6a — AI down → graceful degrade | ✅ + new code | `runDigest` had no try/catch (would 500). Added graceful-degrade path; field-tested same hour against real AI Gateway "needs credit card" error. |
| C6b — wrong webhook secret → 401 | ✅ | Verified inline session 3. |
| C6c — Kill switch ON + cron | ✅ | `{ok:true, skipped:"disabled"}`, no LLM call. |
| C3 — Cross-`#kb` with Jurek | ⏸ Phase E | Needs Jurek in `gbrain-staging`. |

### Phase 3 — Phase D pre-launch cleanup
- ✅ `/api/debug/env` reverted (commit `0d5b993` undone).
- ✅ Webhook error-capture wrapper hardened: stack/path no longer in response body; logs to `console.error` (Vercel logs).
- ✅ `community/archive/_staging/` removed (twice — once mid-session, once at end after C4-C5 reused it).
- ✅ `ARCHIVE_NAMESPACE` env removed (twice, same reason).
- ⚠️ Vercel `commandForIgnoringBuildStep` path filter set then disabled — every deploy under it canceled with `ignoredBuildStep:null`, likely a shallow-clone interaction. Carried to 0.1.2 with `$VERCEL_GIT_PREVIOUS_SHA` approach.
- ✅ `NODE_OPTIONS=--disable-warning=DEP0169` left in place (cosmetic, near-zero cost).

### Phase 4 — Code review (clarification #3)
`code-reviewer` agent ran on session-4 commits. **Findings: 0 CRITICAL, 2 HIGH, 3 MEDIUM, 3 LOW.**

Fixed in commit `6d02ef2`:
- HIGH#1 — `gateway.ts`: `?? ""` fallback → lazy `getGoogle()` with explicit throw on missing `GEMINI_API_KEY`. Caches the provider after first call.
- HIGH#2 — `cron/daily-digest/route.ts`: auth before kill-switch (was reversed; was leaking deployment state to unauthenticated callers under kill-switch).
- MED#1 — `forget.ts`: tombstone-first ordering (partial-failure safety per GDPR audit needs).
- MED#2 — `webhook/route.ts`: command-prefix matching (`isCommand()` helper) so `/gbrain-forgetx` no longer dispatches to the forget path.
- LOW#1 — `commands-forget.test.ts`: `beforeEach` mockClear() on shared fixture.
- LOW#2 — `spec.md §10`: wording aligned with actual tombstone format.

Carried to 0.1.2 backlog:
- ai.test.ts: factory-args coverage (mock currently ignores `apiKey` arg).
- runDigest empty-vs-degraded paths produce same external Telegram signal — will matter when alerting is wired.
- Vercel ignoredBuildStep path filter — re-attempt with `$VERCEL_GIT_PREVIOUS_SHA`.

### Phase 5 — Brainstorming (clarification #4)
**Deferred to a fresh chat** by Anton's request — this session's context grew too large. See:
- [`docs/specs/2026-04-26-gbrain-extension-questionnaire.md`](./2026-04-26-gbrain-extension-questionnaire.md) — questionnaire for Anton to fill out
- [`docs/specs/2026-04-26-gbrain-next-chat-prompt.md`](./2026-04-26-gbrain-next-chat-prompt.md) — copy-paste prompt for the new chat

### Phase 6 — Tag + closeout
- ✅ This document.
- ✅ Tagged `gbrain-v0.1.1` and pushed to origin.

---

## 2. The biggest architectural change in 0.1.1: bypass Vercel AI Gateway

`@ai-sdk/google` direct call replaces gateway-routed Gemini. Reason: AI Gateway requires a credit card on file even for the free tier — Anton declined. Gemini's own free tier (15 RPM, 1M tokens/day for Flash) covers v0.1.x volumes (measured: ~1.7k tokens/day per 3-message digest, ~0.17% of daily quota).

Trade-off documented in spec §6 + §16 + §20: Gemini outage risk Low → Medium because multi-provider fail-over is no longer in the path. The C6a graceful-degrade fix mitigates user-visible impact (no 500 cascade; tombstone digest committed, Telegram skipped).

Re-evaluate at 0.3.0+ if outage frequency becomes operationally painful. Re-entry path is reversible: AI_GATEWAY_API_KEY env left set-but-unused.

---

## 3. Vercel deployment state at session-end

- Production alias `warsawaicommunitygbrain.vercel.app` → sha `6d02ef2` (READY).
- `rootDirectory` permanently `projects/gbrain/app`.
- `commandForIgnoringBuildStep`: null (deferred to 0.1.2).
- Env state (production):
  - Set: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `CRON_SECRET`, `GEMINI_API_KEY`, `GITHUB_BOT_TOKEN`, `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME`, `CHAT_ID`, `TOPIC_*_ID` (all 8), `DIGEST_*`, `GBRAIN_KILL_SWITCH=false`, `DIGEST_ENABLED=true`, `NODE_OPTIONS=--disable-warning=DEP0169`.
  - Removed: `ARCHIVE_NAMESPACE` (was `_staging`, now empty — production paths apply).
  - Set-but-unused: `AI_GATEWAY_API_KEY` (rollback insurance).

---

## 4. Open backlog after 0.1.1

```
0.1.2 (next code session, follows real-channel decisions):
  □ Vercel commandForIgnoringBuildStep with $VERCEL_GIT_PREVIOUS_SHA
  □ ai.test.ts: assert createGoogleGenerativeAI called with valid apiKey shape
  □ runDigest: distinguish "quiet day" vs "degraded" in cron response telemetry
  □ Onboarding doc at community/telegram/onboarding-gbrain.md (spec §11)
  □ Playbook at docs/playbooks/gbrain-operations.md (spec §11)
  □ ADR-0006 (secrets), ADR-0007 (architecture) updates per 0.1.1 changes

PHASE E — real-channel soft launch (separate dedicated chat):
  □ Rotate TELEGRAM_BOT_TOKEN (BotFather /revoke + Vercel PATCH)
  □ Remove AI_GATEWAY_API_KEY env
  □ Switch CHAT_ID + topic IDs to real Warsaw AI Community channel
  □ Pin onboarding post in real channel
  □ Spec §11 7-step soft launch sequence
  □ Tag 0.2.0 once stable in real channel
```

---

## 5. Lessons learned in session 4

1. **`?? ""` is a silent-fail trap for sensitive env vars.** An empty string passes a `string` zod check but produces a 401 from the upstream API. Lazy-init with explicit throw at use-site is the right pattern (HIGH#1 above).

2. **Auth-before-flag is a fixed pattern.** Any route that has both auth and feature-flag checks should authenticate first; otherwise unauthenticated callers can probe for "is this deployment killed?" via response shape (HIGH#2 above).

3. **Tombstone-first ordering is the GDPR-safe choice.** `remove → commit-tombstone` would risk "file gone, no audit trail" on partial failure. Always commit the audit handle before the destructive op.

4. **Vercel project-level `rootDirectory: null` is a silent footgun in monorepos.** Auto-deploys ran from repo root and ERRORed with `ENOENT package.json`; API-triggered deploys with `projectSettings.rootDirectory` succeeded and masked the issue. PATCHing the project-level setting fixes both paths.

5. **Vercel AI Gateway free tier requires a credit card on file.** Spec §5 budget assumed AI Gateway; reality required either credit-card-on-file or a provider switch. Direct Gemini bypasses this with its own no-card free tier.

6. **`text.startsWith()` is not a command match.** `/gbrain-forgetx` matched `/gbrain-forget` and silently entered the forget code path. Always require end-of-string or whitespace after a command token.

7. **The graceful-degrade fix paid off the same hour it shipped.** C6a was added speculatively for "AI down" testing; the real AI Gateway billing failure tripped it for real on the next cron run. Defensive coding caught a real failure within an hour.

8. **Vercel runtime logs aren't accessible via `/v3/deployments/<id>/events`** — only build logs are. For runtime diagnosis, briefly expose error fields in the response (gated, time-boxed, reverted) — the same pattern from session 3.

9. **`commandForIgnoringBuildStep` with `git diff HEAD^ HEAD` doesn't work in shallow Vercel clones.** Every deploy under the filter canceled with `ignoredBuildStep:null`. Use `$VERCEL_GIT_PREVIOUS_SHA` instead.

---

## 6. Where to start the next chat

The next chat is **brainstorming + planning**, not implementation. See:
- [`docs/specs/2026-04-26-gbrain-extension-questionnaire.md`](./2026-04-26-gbrain-extension-questionnaire.md) — Anton fills this out
- [`docs/specs/2026-04-26-gbrain-next-chat-prompt.md`](./2026-04-26-gbrain-next-chat-prompt.md) — copy-paste this into the new chat

---

*End of session 4 closeout. Next: brainstorming in a fresh chat (questionnaire-driven), then writing-plans for the chosen feature, then implementation.*
