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

## Meta — when to add a row

A new gotcha earns a row when ALL of:
1. It cost ≥10 minutes of debugging *because it was non-obvious*.
2. The recovery is reusable across future deploys / chats / contributors.
3. The pattern is operational (env, CLI, CI, deploy, auth) — code-level patterns belong in `docs/playbooks/recurring-plan-defects.md`.

Don't add rows for things that are obvious from `vercel ls` / `gh pr view` output, or that a re-read of CONSTRAINTS.md would have caught.
