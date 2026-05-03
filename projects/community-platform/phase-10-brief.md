# Phase 10 — Pre-launch + ship (brief)

Per-phase brief for Chat 6. Companion to `STATE.md` (state of play), `CONSTRAINTS.md` (locked rules), and `docs/playbooks/recurring-plan-defects.md` (patterns to avoid).

## Tasks

| # | Type | Owns | Plan ref |
|---|---|---|---|
| 10.1 | [D] | Spec §8 acceptance verification log in CHANGELOG | `plan.md` L7504–L7527 + `spec.md §8` |
| 10.2 | code | Lighthouse runs + perf tuning on `/home`, `/members`, `/this-week` | `plan.md` L7529–L7554 |
| 10.3 | [H] | Production deploy via `vercel --prod` + smoke-test | `plan.md` L7556–L7593 |
| 10.4 | [H] | Tag `community-platform-v0.1.0` + PR to main + announce | `plan.md` L7595–L7648 |

`[D]` = doc-only. `[H]` = needs Anton at the keyboard.

## Hard prerequisites (must clear before 10.3)

- **Task 4.1** — `warsaw-ai-bot` GitHub App + 3 env vars on **production** scope (preview already has the test PEM). Until set, `/this-week` + `/consent` + `/admin/health` + `/api/me/*` fail in production at installation-token acquisition.
- **Roster backfill** — at minimum the 5 members the §8 acceptance log will cross-check against `git log` (10.1 step 3). Full 18-member backfill is also v0.1 ship-blocking but can land in parallel with 10.2.

## Plan amendments to apply this phase

None new. All `§9.5–§9.18` and `§9.2` amendments are already in committed code through Phase 9.

If a new amendment is needed (e.g., Lighthouse flags a structural fix or production deploy surfaces a config gap), append as `§9.19+` in `execution-plan.md` with the Phase 10 task that triggered it.

## Risk register entries this phase

- **10.3 NEXTAUTH_URL scope.** Must be production URL on production scope, not the preview alias. Common mistake: forgetting to add it for production. Verify with `vercel env ls` before deploy.
- **10.3 GitHub App credentials.** Real values on production (not preview's test PEM). The smoke script (`pnpm tsx scripts/smoke-github-app.ts`) verifies the credential chain end-to-end.
- **10.3 Vercel Root Directory.** Must be `projects/community-platform` on the project (per `§9.10`). Currently set; if it ever resets to null, git-push auto-deploys fail with "No Next.js version detected."
- **10.4 git tag immutability.** Once `community-platform-v0.1.0` is pushed, semantic-version expectations attach. Confirm tag-target SHA matches the production-deployed SHA before push.

## Closeout

```bash
cd "/Users/antonsafronov/Projects/Warsaw AI Comunity/projects/community-platform"
pnpm install --frozen-lockfile
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm e2e --retries=2
```

E2E is implicit via the 10.3 production smoke-test; `pnpm e2e` here is safety-net only. The Phase 9 closeout had 281 tests + 19 E2E green at SHA `56e1cd3` — anything red on this run is environmental.

## After 10.4

1. Update `STATE.md`: `phase: "10 complete (v0.1.0 shipped)"`, `next_chat: none — v0.1 done`.
2. Update memory `project_community_platform.md`: shipped state.
3. Update repo `PROJECTS.md` (if it exists) with the production URL + ship date.
4. Decide whether to archive the old gbrain repo on GitHub (deferred decision per CHANGELOG Phase 0).

## Auto policy (this phase)

Auto on doc edits + Lighthouse runs + CHANGELOG updates. **Pause and ask Anton** before:
- `pnpm dlx vercel --prod` (10.3 step 2 — production promotion)
- `git push --tags` (10.4 step 1 — tag is non-rewindable)
- `gh pr create` against main (10.4 step 2 — final review opportunity)
- Telegram announcement (10.4 step 3 — Anton posts, not the agent)
