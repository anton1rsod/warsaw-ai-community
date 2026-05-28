# Chat-50 handoff — v0.9.1.1 merge + tag + Anton prod smoke

**Read order (skip the `claude-soul-resume` skill — direct reads only):**
1. `projects/community-platform/STATE.md` snapshot block (~lines 1–45)
2. This file
3. `docs/specs/2026-05-28-community-platform-v0-9-1-prod-smoke-script.md` (Anton's prod-side checklist; reference, not chat-50's work)

## Where things stand (set by chat-49, 2026-05-28)

**PR #46 OPEN** — `https://github.com/anton1rsod/warsaw-ai-community/pull/46` — branch `chore/community-platform-v0-9-1-followups`, 5 commits:

1. `0c9eb78` `fix(community-platform): v0.9.1.1 — reskin /onboard/not-found.tsx … (H112)` — orchestrator-side smoke found the regression (v0.1 `text-2xl`+sans leaked when the sibling `/onboard/error/page.tsx` got the warm reskin in PR #45). Mirror + parity test.
2. `8c77c60` `test(community-platform): v0.9.1 — restore 6 per-surface skin tests left out of PR #45` (admin-events-new-page-skin, admin-health-page, admin-invite-page-skin, event-form-skin, invite-form-skin, invite-url-display-skin — chat-48 leftover).
3. `aba1cd0` `refactor(community-platform): extract isProductionRuntime + align this-week guards` — followups 1+2: `lib/runtime-env.ts` (helper) + fetchStatuses double-guard + hermetic guard test that walks `app/`+`lib/` and asserts the function is defined in exactly one file.
4. `edcc1d8` `docs(community-platform): v0.9.1 design+plan §7 — correct routing-model` — followup 3: `/members`,`/decisions`,`/projects` are GATED per `proxy.ts:PUBLIC_PATHS`, not public; the chat-48 E2E impl verified reality, only the docs read wrong.
5. `3a7270f` `docs(community-platform): v0.9.1 prod smoke script` — Anton-side DevTools+click checklist at `docs/specs/2026-05-28-community-platform-v0-9-1-prod-smoke-script.md`.

**Gates green locally:** `pnpm tsc --noEmit` 0, `pnpm lint` 0, `pnpm test` **1450/1450** (+11 vs 1439 v0.9.1 baseline: 6 onboard-not-found-page + 5 runtime-env).

**Orchestrator-side smoke summary** (local-E2E-mode dev on `:3010`, signed in as `anton1rsod` via `/api/test-auth`, against merged v0.9.1 code): all 6 priority items + macOS-dark + soft-nav + hover PASS. The single FAIL was `/onboard/not-found.tsx` — fixed in commit 1.

## What chat-50 owns

1. **Check PR #46 CI.** If green → squash-merge. If red → triage the CI error (likely environmental on the runner; nothing local would have flagged).
2. **Post-merge** — tag `community-platform-v0.9.1.1` at the merge SHA + push tag, delete the branch local+remote, **flip `projects/community-platform/STATE.md`** snapshot (last_green, phase, tag, previous_tag — same shape as the v0.9.1 flip `b8f1f58`), and append a `[0.9.1.1]` entry to `projects/community-platform/CHANGELOG.md`. STATE flip + CHANGELOG entry are the same commit, direct-to-main (docs-only per `[[feedback_pr_vs_direct]]`).
3. **Hand Anton the prod smoke script** — point him at `docs/specs/2026-05-28-community-platform-v0-9-1-prod-smoke-script.md` (signed-in flow as `anton1rsod`, macOS-dark emulation, DevTools cookie+console commands inline). One short paste should suffice.
4. **Bugs Anton finds** → v0.9.1.2 point-release (className-only where possible; same orchestrator discipline). If none → close v0.9.x and the next surface is `projects/community-platform/V0_5_BACKLOG.md`.

## Anti-patterns (this chat)

- **Don't invoke `claude-soul-resume`.** Read STATE.md + this handoff directly (per `[[feedback_skip_claude_soul_resume]]`).
- Don't re-run the orchestrator-side smoke — chat-49 already covered every surface local-E2E can render. The remaining gap is prod-runtime, which only Anton's signed-in browser can exercise.
- Don't bundle prod-smoke fixes with new v0.X feature work — let v0.9.x close cleanly before opening v0.10/v1.0 brainstorming.

## Pre-existing flag (not chat-50 scope)

ConsentModal title hardcodes "Opt in to the Warsaw AI Community platform" in `app/components/ConsentModal.tsx` since `871b4f9` (v0.1). The chat-39 `COMMUNITY_NAME` env flip never threaded into this string. Same class as other un-swept hardcoded strings. Backlog for a brand-rename string sweep — no ETA.
