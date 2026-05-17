# Operations gotchas — community-platform

> Append-only catalog of ops-level patterns that bit us during ship-day or earlier phases. Pair with `docs/playbooks/recurring-plan-defects.md` (code-level patterns). Read once if new to the project; reference by number from per-phase briefs when relevant.

When you observe a new ops-level surprise, add a row. Keep recovery actionable.

---

## 1. Phase 0 scaffolding seeds placeholder env vars on production

**Symptom.** Production deploys succeed but runtime behavior is broken in subtle ways: OAuth `client_id=placeholder`, `redirect_uri=https://placeholder.vercel.app/...`, GitHub API 404s on every read because `GITHUB_REPO_OWNER=warsaw-ai-community` instead of `anton1rsod`.

**Root cause.** Phase 0 created production env vars with stub values "to be replaced." Replaced for preview during Phase 1 setup; never replaced for production scope. The preview's test PEM masked the bug for the entire ride to Phase 10.

**Recovery.** Before any production deploy: run `pnpm dlx vercel env pull .env.production-check --environment=production --yes` and grep for `placeholder`, `example.com`, empty quotes. Smoke-test credential chains via `scripts/smoke-github-app.ts` (already in repo). Future hardening: add a `scripts/preflight-deploy.ts` that asserts no production env var matches placeholder patterns.

**First observed.** Phase 10 production deploy attempt, 2026-05-03. Found `GITHUB_REPO_OWNER`, `GITHUB_OAUTH_CLIENT_ID`, `_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` all stale.

---

## 2. Vercel CLI uploads files without `.git`; build scripts that call `git log` crash

**Symptom.** `pnpm dlx vercel --prod` fails at build with `fatal: not a git repository`. `git push` deploys (auto via integration) succeed because they include `.git`. Looks like CLI deploys are broken; they're not — they're stripped.

**Root cause.** Vercel's CLI deploy uploads files only. Vercel's git integration (triggered by `git push`) clones with `.git`. Different build contexts.

**Recovery.** Wrap any `execFileSync("git ...")` in build scripts with try/catch + sensible fallback. Done for `scripts/build-contributions.ts` in commit `b26a8c2` — empty-array fallback yields all-zero counts on CLI builds; git-push deploys regenerate accurate counts. Pattern for future build-time scripts.

**First observed.** Phase 10, 2026-05-03, after Option C made local CLI deploys the canonical monorepo path.

---

## 3. GitHub OAuth Apps support exactly ONE callback URL

**Symptom.** GitHub `Be careful! The redirect_uri is not associated with this application` after sign-in works on production but breaks on preview (or vice versa). Comma-separating callback URLs in the OAuth App settings field doesn't work — GitHub treats it as one literal URL.

**Root cause.** GitHub Apps (used for `warsaw-ai-bot` git writes) support multiple callback URLs. GitHub OAuth Apps (used for user sign-in) support exactly ONE. Different products despite similar names.

**Recovery.** One OAuth App per environment, OR limit OAuth to production-only (preview sign-in breaks; acceptable when preview is gated by Vercel Deployment Protection). v0.1 chose production-only; revisit when preview-with-sign-in becomes useful.

**First observed.** Phase 10 production sign-in attempt, 2026-05-03.

---

## 4. Vercel CLI doubles `rootDirectory` paths when run from project subfolder

**Symptom.** `pnpm dlx vercel --prod` from `projects/community-platform/` fails with `The provided path '~/X/projects/community-platform/projects/community-platform' does not exist`. Vercel resolves `cwd + rootDirectory` literally.

**Root cause.** Vercel CLI walks up from cwd to find `.vercel/project.json`, then APPENDS the configured `rootDirectory` to the cwd. If cwd is already inside the project subfolder, the append doubles the path.

**Recovery.** Canonical monorepo setup: `.vercel/` at repo ROOT, run `vercel` commands from repo root, let `rootDirectory` resolve correctly. Migrated to this layout in commit `b22d2dd` (Option C). Add `.vercel/` to root `.gitignore` (also in `b22d2dd`).

**First observed.** Phase 10 deploy attempt, 2026-05-03.

---

## 5. Vercel "sensitive" env vars don't extract via `vercel env pull` (returns empty quotes)

**Symptom.** Trying to verify what value is set on production via `vercel env pull .env.production --environment=production` returns `MY_VAR=""` for sensitive vars. You can't tell if the value is correct or stale.

**Root cause.** Vercel marks env vars as sensitive by default; sensitive vars are encrypted at rest and only injected into the runtime, not extractable via the CLI. Runtime is unaffected (process.env gets the real value at function startup).

**Recovery.** For non-secret vars (community name, URL, owner, App ID, installation ID), set with `--no-sensitive` flag so they're inspectable via `env pull`. For real secrets (PEM, NEXTAUTH_SECRET, OAUTH client secret), keep sensitive — verify by re-setting from a known-good source rather than reading.

**First observed.** Phase 1 closeout (`NEXTAUTH_URL` flagged sensitive accidentally), 2026-05-01. Reaffirmed Phase 10 with `COMMUNITY_NAME` / `COMMUNITY_SLUG`.

---

## 6. `pbpaste > file` + `chmod 600` is the canonical secret-handoff pattern

**Symptom.** Need to move a credential (PEM, OAuth client secret) from clipboard to disk to a Vercel env var, without it appearing in chat with the agent.

**Recovery.** Standing pattern: while the secret is on clipboard from the source UI, run:
```bash
mkdir -p ~/Documents/secrets
chmod 700 ~/Documents/secrets
pbpaste > ~/Documents/secrets/<name>.txt
chmod 600 ~/Documents/secrets/<name>.txt
wc -c ~/Documents/secrets/<name>.txt   # confirm non-zero bytes
```
Then `vercel env add NAME production --yes < ~/Documents/secrets/<name>.txt`. The agent never sees the value; it lives only on disk and in Vercel's encrypted store. Project memory `feedback_secret_handling` formalizes this.

---

## 7. `vercel promote <preview-url>` triggers a rebuild, not a metadata-only flip

**Symptom.** You expect "promote this Ready preview to production" to be near-instant; CLI says `A new deployment will be built using your production environment` and waits 30–60s.

**Root cause.** Each Vercel deploy is built ONCE for a target environment (preview vs. production). Promoting a preview's source to production requires building it for the production environment (in case any build-time configs differ). Not metadata-only.

**Recovery.** For "apply new env vars without rebuild" → use Vercel UI **Redeploy** with "Use existing Build Cache" checked. The cached build artifacts are reused; only env vars apply at runtime to fresh function instances. For "build new code with production env" → CLI promote with `--yes` to skip prompt; rebuild is unavoidable.

**First observed.** Phase 10 redeploy after env-var fixes, 2026-05-03.

---

## 8. `vercel env add NAME preview` silently no-ops without an empty `""` branch positional

**Symptom.** `vercel env rm NAME preview --yes` succeeds; the matching `vercel env add NAME preview --no-sensitive --yes <<< "value"` does NOT add the row back. `vercel env ls preview` shows the var is gone. No error printed; the CLI exits cleanly.

**Root cause.** Preview env vars in Vercel are branch-scoped: each row carries a `gitBranch` field (specific branch name OR `null` for "all preview branches"). When the CLI is invoked in agent / non-interactive mode without an explicit branch positional, it cannot prompt for the branch and exits without writing the row. Production env vars don't carry `gitBranch`, so the same `add` syntax works on production.

**Recovery.** Add an empty positional `""` after the env name to mean "all preview branches" (i.e. `gitBranch=null`):

```bash
echo "Warsaw AI Community" | vercel env add COMMUNITY_NAME preview "" --no-sensitive --yes
```

To verify, `vercel env ls preview` should show the row, and `vercel env pull --environment=preview --git-branch=<any>` should return the value (any branch works because `gitBranch=null` matches all).

**First observed.** Chat-10 Option C, 2026-05-04. Production rm/add cycle completed cleanly; preview rm worked but preview add (without `""`) silently no-op'd, leaving preview Zod-validation broken until the empty-positional retry. Project memory `project_community_platform_invitation_feature.md` already noted the quirk for v0.1.1 INVITE_SECRET setup; this row makes it discoverable from `GOTCHAS.md` for future ops.

---

## 9. Transitive `@types/*` packages can implicitly fail Vercel builds

**Symptom.** Vercel build error like `Cannot find module 'mod.d.ts'`, or `noImplicitAny` errors on imports from a package whose own `.d.ts` is missing from the published tarball. Local dev passes if `node_modules` cache predates the upstream change. Production / fresh Vercel install fails. Failure mode is silent for weeks — the build error doesn't surface unless you specifically watch deploy notifications.

**Root cause.** Without an explicit `types` field in `tsconfig.json`, TypeScript auto-loads every `@types/*` package found in `node_modules`. Two failure modes observed:
1. A package declares `"types": "mod.d.ts"` in its own `package.json` but ships no `.d.ts` in the tarball (e.g., `@grammyjs/types@3.26.0` is Deno-targeted; its `"prepare"` script generates types via `deno task build`, which Vercel doesn't run).
2. A `@types/*` package gets pulled transitively (e.g., `@types/aws-lambda` via `@octokit/oauth-app`) and requires its own entry points that don't resolve.

**Recovery.** Add `"types": ["node"]` to `compilerOptions` in `tsconfig.json`. Explicit `import type` statements still resolve normally; only implicit `@types/*` auto-loading is scoped out. If a specific type package needs auto-loading for the framework (e.g., `vitest/globals`), add it to the array (`["node", "vitest/globals"]`). For a package missing types from its tarball, write an ambient module shim (e.g., `src/types/<pkg>.d.ts` with the minimal surface you actually import) and remove it once upstream ships proper types.

**First observed.** gbrain production builds broken 2026-05-01 → 2026-05-16 (15 days; daily Vercel error notification ignored as noise) via `@grammyjs/types@3.26.0` + transitive `@types/aws-lambda`. Fixed in PR #14 (commit `8eaa6b0`) with shim + tsconfig scope. Same scope-fix applied prophylactically to community-platform in v0.3 per spec §13.7 + H50/H51.

---

## 10. `@/lib/*` path aliases unresolvable by tsx when imported *from within* `lib/`

**Symptom.** Vercel preview deploys fast-fail in 6–12s during the `prebuild` step with `Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@/lib' imported from <repo>/projects/community-platform/lib/content-snapshot.ts`. Local `pnpm build` passes (Next bundler tolerates the alias); local `pnpm test` passes (Vitest tolerates it via its own resolver). Only the tsx-executed `pnpm snapshot` / `pnpm contributions` prebuild chain on Vercel surfaces the failure — and only when a new dependency edge causes a `lib/` file to be imported transitively from a tsx-run script.

**Root cause.** When tsx resolves `@/lib/foo` from `scripts/snapshot-content.ts`, the alias resolves cleanly (the file lives outside the `lib/` directory). When tsx resolves the same `@/lib/foo` from `lib/content-snapshot.ts` (i.e., self-referencing back into the directory it lives in), tsx's `resolveTsPaths` falls through to package-resolution and the error message reports `Cannot find package '@/lib'` — treating the alias prefix as a scoped npm package name. The issue is latent until something pulls a `lib/` file into the tsx-script graph; v0.3 Task 1.3 (`lib/meetings.ts` adding `import { listMeetingsFromSnapshot } from "./content-snapshot"`) created exactly that edge, breaking preview deploys silently from Task 1.3 onward until the post-Task-1.11 fix.

**Recovery.** Inside `lib/`, ALWAYS use relative imports (`./roster`, `./events`, `./__generated__/foo.json`) — never the `@/lib/*` alias. The alias is fine from `app/`, `scripts/`, and tests. Pattern: aliases are for crossing directory boundaries; within a directory, relative imports are not only sufficient but required for tsx-build-chain compatibility. Forward-defense: when adding a new lib→lib import or a new build script that imports any `lib/*` file, run `pnpm snapshot` locally to exercise the tsx prebuild path before pushing.

**First observed.** v0.3 Phase 1 push of Task 1.3 (2026-05-17, commit `ee5df9f`) silently broke 11 preview deploys in a row. Surfaced by Vercel email notification, diagnosed via `vercel inspect --logs`, fixed by converting 8 `@/lib/*` imports in `lib/content-snapshot.ts` to relative `./` imports (commit `b46af5b`). The pattern is forward-defending in v0.3 Phase 1 — implementers should not introduce `@/lib/*` imports inside files under `lib/`.

---

## 11. Vercel Free-tier 100/day deploy rate limit silently swallows merge-triggered auto-deploys

**Symptom.** A `git push` to a Vercel-watched branch (preview or production) succeeds to GitHub but no new deploy appears in `vercel ls`. No build runs, no preview URL, no production alias swap. Production keeps serving the previous deploy. A `pnpm dlx vercel redeploy` / `vercel --prod` attempt returns `Error: Resource is limited - try again in 24 hours (more than 100, code: "api-deployments-free-per-day"). (402)`. The Vercel UI's "Usage / Last 30 days" panel shows ALL resource metrics (Edge Requests, Function Invocations, ISR Writes, Fast Origin Transfer, Fluid CPU, etc.) at 1-2% of monthly cap — looks healthy. The actual rate-limit signal is buried in a small red "Rate Limit Reached" banner bottom-left of the project sidebar: *"Your team exceeded the rate limit for API: Deployments per day (Free)."* Two separate counters: the Usage panel measures monthly resource consumption (totally fine); the rate limit is a daily counter on the `POST /v13/deployments` API that has zero visibility in the Usage tile.

**Root cause.** Vercel Free (Hobby) plan limits new deploy creation to **100 per day per team**, counted by midnight UTC. Every `git push` to a Vercel-watched branch fires exactly one deploy. With two Vercel projects (`warsaw-ai-community-platform` + `warsaw_ai_community_gbrain`) both watching the same monorepo, **each push triggers ~2 deploys in parallel**. A normal feature-development day with subagent-driven shipping (35-task v0.3 release) generates 40+ commits across feature + hotfix branches, easily breaching 100. The 402 is silently absorbed by the GitHub-integration webhook — no email alert, no GitHub PR comment about the failed Vercel build, no notification anywhere except the dashboard banner.

**Recovery.** Three options, in order of preference:

1. **`pnpm dlx vercel promote <preview-url> --yes`** — promotes an already-built preview deploy to production. The build artifact is reused; **no new build runs, so this does NOT count against the 100/day limit.** Pattern used to ship v0.3.1 after the merge auto-deploy was silently rate-limited: `pnpm dlx vercel promote https://warsaw-ai-community-platform-<preview-hash>-anton-9351s-projects.vercel.app --yes` returned `Successfully created new deployment` and the production alias swapped within 30s. **This is the canonical hotfix path when the limit hits.**

2. **Wait for the limit to reset** (midnight UTC). Cheap, but blocks development for hours. Only viable if there's no urgency.

3. **Upgrade to Pro** ($20/mo/member) — raises the limit to 6000/day per team (effectively unlimited at our cadence) and unlocks longer builds, password-protected previews, and better analytics. For this project's velocity (35-task v0.3 + frequent hotfixes), this is the right structural fix once the rate-limit pattern recurs.

**Forward-defense / monitoring.**
- No reliable real-time API for the daily counter. The red banner is the only signal.
- Rough proxy: `pnpm dlx vercel ls 2>&1 | grep -E "Ready|Building|Queued" | wc -l` — counts recent deploys (covers ~50 most recent; multiply mental estimate accordingly).
- Operational habit to delay the limit: **squash trivial fix commits before pushing.** Single-line backfills (e.g., test describe-prefix backfill, regenerated artifact churn, typo fixes) each burn a deploy slot otherwise.
- Don't rely on PR previews when over the limit. Hit the existing preview URL directly if you need to test before merging.

**First observed.** v0.3.1 hotfix push (2026-05-17, commit `e720268`). The day had already consumed 100 deploys across v0.3.0 implementation (Phases 1-4: ~35 pushes × 2 projects = ~70) + v0.3.1 hotfix branch + an in-flight gbrain hotfix branch + the v0.3.0 PR merge production deploy. The PR #21 merge to main silently no-op'd — `vercel ls` showed no new deploy with a SHA later than the merge, and the production alias kept pointing at the pre-merge build. Diagnosed in ~5 minutes via `pnpm dlx vercel redeploy` → 402 with `api-deployments-free-per-day` error code. Fixed via `vercel promote` of the PR #21 preview (`ljxhqz5ce` → production deploy `ivbncdcvq`), which bypassed the limit and shipped the v0.3.1 markup within 1 minute. Total cost ~30 minutes including the initial confusion about why the smoke kept returning v0.3.0 markup with `age: 1371s` on `x-vercel-cache: HIT`.

---

## Meta — when to add a row

A new gotcha earns a row when ALL of:
1. It cost ≥10 minutes of debugging *because it was non-obvious*.
2. The recovery is reusable across future deploys / chats / contributors.
3. The pattern is operational (env, CLI, CI, deploy, auth) — code-level patterns belong in `docs/playbooks/recurring-plan-defects.md`.

Don't add rows for things that are obvious from `vercel ls` / `gh pr view` output, or that a re-read of CONSTRAINTS.md would have caught.
