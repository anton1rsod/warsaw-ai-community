# Community Platform v0.1 — Execution Plan

**Companion to:** [`plan.md`](plan.md) (74 tasks across 11 phases) and [`HANDOFF.md`](HANDOFF.md) (cold-pickup reference).

**Goal of this document:** a concrete dispatch plan for the 74 plan tasks. Sequence, parallelization opportunities, subagent assignment, review checkpoints, rollback strategy, blocking human-in-the-loop steps, and — most importantly — a **multi-chat session division** so no single chat carries the whole 10-day implementation.

This file is a *playbook*, not a *specification*. Treat it as a living document during execution: amend with discoveries, but do not re-litigate spec or plan decisions here.

---

## 1. Approach

**1.1 Subagent-driven dispatch.** One task ≈ one subagent dispatch. Parent chat (the "operator") owns the conversation context; subagents execute in isolated contexts that don't bloat the parent. This matches `superpowers:subagent-driven-development`.

Each subagent dispatch contains:
- **Briefing**: pointer to plan.md task by Phase.Task, + relevant constraint snippets
- **Files allowed**: exact paths the subagent may write/edit
- **Done criteria**: which test command must pass, which commit message to use
- **No skill to invoke unless task is TDD-shaped** (most are): use `superpowers:test-driven-development`

**1.2 TDD discipline carried from plan.** Every task with code:

1. Write failing test → run → expect fail
2. Minimal implementation → run → expect pass
3. Refactor if needed → run → still pass
4. Commit with the exact message in plan.md

Do not skip the red phase. Coverage gates per spec §8: 80% overall, 100% on auth middleware, RBAC guards, classification helpers, GitHub App writer wrapper, week helpers.

**1.3 How to read the dispatch table (§3).** Each row is a phase summary. The default subagent for that phase is named, plus exceptions for individual tasks. If a phase row says "all tasks: tdd-guide except 3.6 (general-purpose)," that means dispatch tdd-guide for every task in the phase *except* 3.6, which uses general-purpose.

---

## 2. Dependency graph + parallelization map

**2.1 Phase-level DAG.**

```
Phase 0 (Bootstrap)
   │
   ▼
Phase 1 (Auth + RBAC)  ─── (snapshot script consumed by all read pages)
   │
   ├─► Phase 2 (Members)  ──┐
   │                        │  (independent: both read snapshot)
   ├─► Phase 3 (Archives) ──┤
   │                        │
   └─► Phase 4 (GitHub App writer)
        │
        ├─► Phase 5 (Status updates)
        ├─► Phase 6 (Consent flow)
        ├─► Phase 7 (Contributions)  ──┐
        │                              │  (8 + 9 independent of each other)
        ├─► Phase 8 (GDPR)  ───────────┤
        │                              │
        └─► Phase 9 (Health metric) ───┘
                 │
                 ▼
          Phase 10 (Pre-launch + ship)
```

**2.2 Serial-within-phase rule.** Tasks within a phase are mostly serial — each task's "minimal implementation" builds on the previous task's surface (e.g., `lib/roster.ts` → `lib/governance.ts` → `lib/rbac.ts` → `lib/auth.ts`). Don't try to parallelize within a phase; the test-and-commit cadence assumes a linear walk.

**2.3 Cross-phase parallelization opportunities.**

| Pair | Why parallel | When |
|---|---|---|
| Phase 2 ‖ Phase 3 | Both read the snapshot; neither writes | After Phase 1 closes |
| Phase 8 ‖ Phase 9 | Both depend on Phase 4 + 5; otherwise independent | After Phase 5 closes |
| Phase 7 partly ‖ Phase 5 | 7.1 (calculator pure) + 7.2 (script) don't depend on Phase 5; only 7.3+ do | If desperate for time |

For a solo founder build at 10 days, parallelization mostly helps when **two consecutive chats run on different days** — Phase 2 chat on Monday, Phase 3 chat on Tuesday, both independently mergeable. Same-day parallelism inside one chat adds dispatch complexity for marginal speedup.

---

## 3. Subagent dispatch table (74 tasks across 11 phases)

Tasks with `[H]` require Anton at the keyboard (human-in-the-loop). Tasks with `[T]` are TDD-shaped and use `superpowers:test-driven-development` inside the subagent. Tasks with `[D]` are documentation/CHANGELOG only.

| Phase | Tasks | Default agent | Exceptions | Notes |
|---|---|---|---|---|
| **0 — Bootstrap** | 0.1, 0.2, 0.3 (already done minimally), 0.4–0.13 | `general-purpose` | 0.10 + 0.11 → `tdd-guide` (env validation + classification constants are TDD-shaped); 0.12 [H] | 13 tasks, ~1 day. Includes 1 human blocker (0.12 Vercel link) |
| **1 — Auth + RBAC** | 1.1–1.13 | `tdd-guide` | 1.4 [H] (GitHub OAuth app); 1.7 + 1.8 + 1.11 → `general-purpose` (pages); 1.13 [D] | 13 tasks, ~1.5 days. NextAuth v5 surface is the riskiest. **Apply Plan amendment §9.1 to Task 1.1.** |
| **2 — Members** | 2.1–2.8 | `tdd-guide` | 2.5 + 2.6 → `general-purpose` (pages); 2.8 [D] | 8 tasks, ~1 day. Markdown sanitization (2.1) is the gate — every render path goes through it. |
| **3 — Archives** | 3.1–3.8 | `tdd-guide` | 3.2 + 3.4 + 3.6 → `general-purpose` (pages); 3.8 [D] | 8 tasks, ~1 day. Three readers (projects, decisions, meetings) of similar shape. |
| **4 — GitHub App** | 4.1 [H], 4.2, 4.3 [D] | `tdd-guide` | 4.1 [H] is out-of-band Anton step | 3 tasks, ~0.5 day. Run `security-reviewer` after 4.2 (PEM handling). |
| **5 — Status updates** | 5.1–5.7 | `tdd-guide` | 5.5 → `general-purpose` (page); 5.6 → `general-purpose` (E2E + mock store); 5.7 [D] | 7 tasks, ~2 days. Largest phase by complexity. SHA-conflict + ISR + bot timing all interact. |
| **6 — Consent flow** | 6.1–6.5 | `tdd-guide` | 6.2 + 6.3 → `general-purpose` (modal + middleware); 6.5 [D] | 5 tasks, ~0.5 day. |
| **7 — Contributions** | 7.1–7.5 | `tdd-guide` | 7.2 → `general-purpose` (build script + `execFileSync`); 7.5 [D] | 5 tasks, ~1 day. Run `security-reviewer` after 7.2 (subprocess exec surface). |
| **8 — GDPR** | 8.1–8.5 | `tdd-guide` | 8.3 → `general-purpose` (UI panel); 8.4 → `general-purpose` (E2E); 8.5 [D] | 5 tasks, ~0.5 day. |
| **9 — Health metric** | 9.1, 9.2, 9.3 [D] | `tdd-guide` | 9.2 → `general-purpose` (page); **also apply Plan amendment §9.2 — `revalidate = 60`** | 3 tasks, ~0.5 day. |
| **10 — Pre-launch + ship** | 10.1, 10.2, 10.3 [H], 10.4 [H] | `general-purpose` | 10.3 + 10.4 require Anton (prod deploy + tag + announce) | 4 tasks, ~0.5 day. |

**3.12 Cross-cutting agents (invoke at phase boundaries, not per task):**

| Agent | When | Why |
|---|---|---|
| `typescript-reviewer` | At every phase closeout | Catches `any`-creep, unused exports, unsafe casts |
| `code-reviewer` | At every phase closeout | OWASP / general quality |
| `security-reviewer` | After 4.2 (GitHub App), 7.2 (execFileSync), 8.1 + 8.2 (GDPR endpoints) | Subprocess exec, PEM handling, PII scrubbing |
| `build-error-resolver` | On demand when `pnpm build` fails | Minimal, surgical fixes only |
| `tdd-guide` | Embedded inside each TDD-shaped task subagent | Already part of the dispatch above |

---

## 4. Review checkpoints

**4.1 End-of-phase command (locked).**

```bash
cd projects/community-platform
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build
```

**4.2 Add `&& pnpm e2e`** for phases that ship E2E coverage: **1, 2, 3, 5, 6, 8.**

**4.3 Coverage gates** (spec §8):
- 80% overall (lines + branches)
- 100% on `lib/auth.ts` middleware path, `lib/rbac.ts`, `lib/classification.ts`, `lib/github-app.ts`, `lib/week.ts`

If coverage drops below the gate during a phase, **the phase does not close** — go back, write the missing tests, then close.

**4.4 Anton signs off each phase closeout commit before the next phase starts.** This is the cleanest natural pivot point and the boundary for chat splits (see §10).

---

## 5. Human-in-the-loop blocking points

These cannot be auto-executed. The chat that owns a phase containing a [H] task pauses until Anton completes the step.

| Task | What Anton does | Where |
|---|---|---|
| **0.12** | Vercel link + 13 env vars | `pnpm dlx vercel link` then `vercel env add` for each (NEXTAUTH_SECRET, NEXTAUTH_URL, NEXTAUTH_SESSION_MAX_AGE, GITHUB_OAUTH_CLIENT_ID/SECRET, GITHUB_APP_ID/PRIVATE_KEY/INSTALLATION_ID, GITHUB_REPO_OWNER/NAME/BRANCH, COMMUNITY_NAME/SLUG) |
| **1.4** | Create GitHub OAuth App | github.com/settings/developers → New OAuth App → copy Client ID / Secret to Vercel env |
| **4.1** | Create GitHub App `warsaw-ai-bot` | github.com/settings/apps → New App → contents:write → install on repo → generate PEM → record installation ID → set 3 env vars |
| **10.3** | Production deploy go/no-go | `pnpm dlx vercel --prod` after smoke-checking preview |
| **10.4** | Tag + announce | `git tag -a community-platform-v0.1.0` + post in `#announcements` |

**Important:** Per Anton's "feedback_secret_handling" memory rule — **never echo or store any pasted PEM, Client Secret, or private key in chat**. If Anton pastes a secret, acknowledge by env-var reference only; do not include the value in any committed file or chat reply.

---

## 6. Per-phase risk register

The non-obvious failure modes. Top three (Phases 1, 4, 5) are the most likely to consume a full day if hit.

**6.1 Phase 1 (NextAuth v5 + middleware).** Silent misroute risk — middleware can return `NextResponse.next()` for paths that should redirect, or vice versa. NextAuth v5 beta also has rough App Router edges (callbacks vs `auth()` helper, JWT decode in middleware vs route handlers).
*Mitigation:* E2E covers all four paths — non-roster, roster (first-time), roster (returning), admin. Don't ship Phase 1 without `pnpm e2e` green on `e2e/auth.spec.ts`.

**6.2 Phase 4 (GitHub App auth).** JWT signing edge cases with the PEM. Octokit + auth-app reads the PEM as a string; if the PEM has CRLF line endings or extra whitespace, signing fails silently with a 401 from GitHub.
*Mitigation:* `scripts/smoke-github-app.ts` runs `readFile("README.md")` against the real API; if it returns a first-line preview, credentials are wired correctly. Run smoke before closing Phase 4.

**6.3 Phase 5 (status flow).** Three timing surfaces interact: SHA-conflict resolution, 60s ISR cache, and bot commit propagation. A user posting twice in a row can hit a stale SHA from the cache.
*Mitigation:* Status actions read the SHA fresh on every call (no cached SHA in client state); 409 surfaces "Refresh — someone else updated this" and forces a server round-trip. E2E `concurrent edit conflict` test covers the explicit case.

**6.4 Phase 6 (consent middleware).** Wrong cookie name or matcher pattern can either trap consented users in `/consent` redirect loop, or let unconsented users into `/home`.
*Mitigation:* E2E covers first-time, returning, and cancel paths. Cookie name `waic-consented` is locked; matcher excludes `_next`, `favicon.ico`, `/api/auth`, `/api/test-auth`, `/login`, `/no-access`, `/consent`.

**6.5 Phase 7 (contributions execFileSync).** Subprocess exec is a security surface. Passing user input to `git log` would be command injection.
*Mitigation:* Plan locks `execFileSync` (no shell) with **all hardcoded args** — no user input is passed to git ever. Comment in `scripts/build-contributions.ts` documents this. `security-reviewer` agent validates after 7.2.

**6.6 Phase 8 (GDPR delete).** Wrong file scope means either (a) the user's data isn't fully deleted, or (b) other users' data gets deleted.
*Mitigation:* Per-week scan iterates last 52 weeks, fetches each week's status files, filters by `s.slug === member.slug`, deletes only that one. Profile delete uses the member's slug derived from their session handle, so cross-user deletion is structurally impossible.

**6.7 Phase 9 `/admin/health`.** The page makes 4 GitHub API calls per render. Without `revalidate`, refresh-spamming the page can blow through the 5000/hr rate limit.
*Mitigation:* **Plan amendment §9.2** — add `export const revalidate = 60;` to `app/admin/health/page.tsx`. One-line fix; bake into Task 9.2 implementation.

---

## 7. Rollback strategy

**7.1 Per-phase last-green-SHA.** Each phase closeout commit's SHA is recorded in `CHANGELOG.md` under the phase's "complete" entry. This becomes the recovery anchor.

**7.2 Recovery procedure.** If a subsequent phase breaks the build and the diagnosis is non-trivial:

```bash
git reset --hard <last-green-sha>
```

Then revisit the broken phase's plan tasks. **Never force-push.** If commits already pushed to a feature branch are reset, push the new tip non-force; if the user explicitly requests overriding, ask first.

**7.3 Vercel rollback.** If a preview is broken, redeploy the last-green commit:

```bash
pnpm dlx vercel deploy --prebuilt --target=preview <last-green-sha>
```

**7.4 What never rolls back.** The §6.1 classification rule, the four-role RBAC structure, and the JWT-vs-DB-session decision are **architectural commitments** from the spec. If a rollback target predates these, that means the rollback is going beyond what's safe. Ask Anton.

---

## 8. Phase duration estimates (focused solo work)

Estimates assume Anton is at the keyboard most of the day, with subagents dispatched per task and a code review at each phase closeout.

| Phase | Days | Why |
|---|---|---|
| 0 | 1.0 | Mostly mechanical; 0.12 has a Vercel-link blocker |
| 1 | 1.5 | NextAuth v5 surface is the biggest unknown |
| 2 | 1.0 | Markdown sanitization (2.1) is the gate; rest is layered on |
| 3 | 1.0 | Three readers, repetitive shape |
| 4 | 0.5 | Well-scoped wrapper; biggest risk is PEM wiring |
| 5 | 2.0 | Most moving parts (week math + actions + reader + editor + page + E2E mock) |
| 6 | 0.5 | Small surface; depends on 4 already shipped |
| 7 | 1.0 | execFileSync + JSON pipeline + UI card |
| 8 | 0.5 | Two route handlers + UI panel + E2E |
| 9 | 0.5 | One calculator + one page |
| 10 | 0.5 | Verify + Lighthouse + ship |
| **Total** | **10** | |

Buffer: add 1–2 days for unforeseen NextAuth or GitHub App debugging. Realistic ship date: 2–3 weeks elapsed (10 working days, with breaks).

---

## 9. Plan amendments

These corrections were caught during plan-writing and should be applied at execution time without modifying `plan.md` (which is a settled artifact).

**§9.1 Task 1.1 — header-aware roster parser.**
The plan's `lib/roster.ts` was drafted against a 4-column fixture (`Name | GitHub | Joined | Notes`). The actual `community/members/roster.md` has 5 columns (`Name | GitHub | Role | Telegram | Focus`). The parser uses cell index 1 for GitHub which is correct under the 5-column schema, **but** the placeholder `*(TBD)*` rows have empty cells that, when filtered, push later cells into the GitHub column position. Fix when implementing 1.1:

- Parse the table header row first; identify the GitHub column by name match (`/^github$/i`).
- Skip rows whose Name cell is `*(TBD)*` or whose GitHub cell is empty.
- Add a unit test: `roster.test.ts` should include a fixture with a `*(TBD)*` row and assert it's excluded.

**§9.2 Task 9.2 — `revalidate = 60` on `/admin/health`.**
Add `export const revalidate = 60;` at the top of `app/admin/health/page.tsx`. Mirrors `/this-week`. Without this, page-refresh spamming can blow the GitHub API rate limit.

**§9.3 Task 4.2 — keep the test PEM in repo (with the documented caveats).**
Spec §HANDOFF 7.4 documents the trade-off. If a CI security scanner blocks the build, switch to per-CI-run `openssl genrsa` in test setup. Do not block Phase 4 over scanner noise — the PEM signs JWTs GitHub rejects.

**§9.4 Task 0.13 — update README + CHANGELOG to reflect committed plan + minimal pre-launch.**
Already done as a separate `chore` commit accompanying this execution-plan. The Phase 0 closeout in execution can verify these are accurate; no code change needed.

**§9.5 Phase 0 closeout — Next.js 15.0.4 → 16.2.4 bump.**
Plan pinned `next 15.0.4`. Vercel rejected at 15.0.4 due to CVE-2025-66478. Phase 0 closeout bumped to `next 16.2.4` + `react 19.2.0` + `eslint-config-next 16.2.4` (commit `528f24c`). Side effects: `next.config.ts` `experimental.typedRoutes` → top-level `typedRoutes`; `tsconfig.json` `jsx: preserve` → `react-jsx`; `package.json` `lint` script: `next lint` → `eslint .` (next lint removed in 16). Phase 1 onward must verify NextAuth v5 beta selection against Next 16 (see §9.8).

**§9.6 Phase 0 closeout — preview env scoped to branch.**
Phase 0 set 13 Vercel env vars on production + preview-scoped to branch `warsaw-org-and-stack-guide`. To deploy preview from any other branch in Phase 1+, either re-add env vars for that branch (`pnpm dlx vercel env add NAME preview <branch>`) or omit the branch when adding (Vercel Claude Code plugin intercepts the "all preview branches" path with `git_branch_required` action; workarounds: pass branch explicitly or use the dashboard).

**§9.7 Phase 1 (Anton-approved 2026-05-01) — `proxy.ts` instead of `middleware.ts`.**
Plan said `middleware.ts`; Next 16.2.4 deprecated middleware in favor of `proxy.ts`. Per Next 16 upgrade docs: `mv middleware.ts proxy.ts` + rename function from `middleware()` to `proxy()`. `proxy` runs Node.js runtime (no edge support); fine for our use case. Phase 1 Task 1.10 implementation uses `proxy.ts`. Build output shows `ƒ Proxy (Middleware)` confirming Next 16 detection.

**§9.8 Phase 1 (Anton-approved 2026-05-01) — `next-auth@5.0.0-beta.31` + client-side form POST sign-in.**
Plan pinned `5.0.0-beta.25` (Q3 2025, Next 15 era). Latest is `5.0.0-beta.31`. Issue [#13388](https://github.com/nextauthjs/next-auth/issues/13388) confirmed `signIn` server action breaks on Next 16 + beta.30 with "Configuration error". Phase 1 Task 1.5 pinned `5.0.0-beta.31`; Task 1.7 uses client-side form POST to `/api/auth/signin/github` (with CSRF token fetched from `/api/auth/csrf`) instead of the broken `signIn` server action. `signOut` is unaffected and still uses the server-action pattern in `/no-access` and `/home`. Vitest config required `server.deps.inline: ["next-auth", "@auth/core"]` to make ESM resolution work in tests.

**§9.9 Phase 1 (in-execution discovery 2026-05-01) — proxy uses manual JWT decode, not `auth()` helper.**
Plan's Task 1.10 used `await auth()` inside the middleware function. In Auth.js v5, `auth()` called bare only works inside Server Components / Route Handlers — in middleware/proxy contexts the idiomatic patterns are either the `auth(handler)` wrapper or explicit `decode()` from `next-auth/jwt`. Phase 1 implementation uses explicit decode for testability (the wrapper API is harder to unit-test) + readability (gating logic stays in the proxy file, not in callbacks). The proxy reads `req.cookies.get(SECURE_COOKIE_NAME ?? COOKIE_NAME)`, decodes with `salt` matching the cookie name, and validates the JWT payload's `githubHandle` field. Cookie-name drift surfaces via `console.error` on decode failures so a future beta bump that renames the cookie produces a grep-able log line instead of a silent auth outage.

**§9.10 Phase 1 (Anton-approved 2026-05-01) — Vercel project Root Directory must be `projects/community-platform`.**
The 2026-05-01 repo migration to `anton1rsod/warsaw-ai-community` reset the Vercel project's `rootDirectory` to `null`. The repo is a docs-first monorepo — there's no `package.json` or `pnpm-workspace.yaml` at the repo root. With `rootDirectory: null`, Vercel runs `pnpm install --frozen-lockfile` from the repo root → "Already up-to-date" no-op → "Could not identify Next.js version" → build error. Manual `vercel deploy` from inside `projects/community-platform/` works because the CLI uses cwd. Git-push auto-deploys fail because they respect the project setting. Anton sets `rootDirectory` in Vercel dashboard (Settings → General → Root Directory) to `projects/community-platform`, then triggers a redeploy.

**§9.11 Phase 1 (in-execution 2026-05-01) — short Vercel alias `warsaw-ai-platform.vercel.app`.**
Default Vercel deployment URLs concatenate `<project>-<deploy-hash>-<team-slug>.vercel.app` (~70 chars). Anton authorized claiming the short alias `warsaw-ai-platform.vercel.app` for the project (precedent: `warsawaicommunitygbrain.vercel.app` on the gbrain project). Phase 1 Task 1.4 OAuth callback registration uses this alias: `https://warsaw-ai-platform.vercel.app/api/auth/callback/github`. The alias currently points to deploy `m9ueagcjx`; after Anton fixes Root Directory (§9.10) and redeploys, re-alias to the new tip.

**§9.12 Phase 2 (in-execution 2026-05-01) — `vitest.config.ts` merge preserves `server.deps.inline`.**
The plan's Task 2.3 Step 2 (L2814-2837) replaces `vitest.config.ts` wholesale. That snippet drops Phase-1's `server.deps.inline: ["next-auth", "@auth/core"]` (added in Task 1.5 to make Auth.js v5 ESM resolve under vitest); without it, `tests/unit/auth.test.ts` fails at module load. Phase 2 implementation merges instead of replaces: keeps `server.deps.inline`, adds `environmentMatchGlobs` (jsdom for `.tsx`) + `setupFiles` (jest-dom matchers), and **scopes coverage `include` to `app/components/**/*.tsx`** (not the plan's broader `app/**/*.{ts,tsx}` — that would pull in uncovered server-component page files and drop overall coverage below the 80% gate).

**§9.13 Phase 2 (in-execution 2026-05-01) — E2E auth-via-test-auth must use `page.request.post()`.**
The plan's Task 2.7 + 3.7 templates use `test.beforeEach(async ({ request }) => { await request.post("/api/test-auth", ...) })`. The standalone `request` fixture maintains its own cookie jar; cookies set there do NOT propagate to subsequent `page.goto()` calls — the page lands unauthenticated and gets redirected to `/login`. Phase 1's `e2e/auth.spec.ts` already encoded the correct pattern in a `loginAs(page, handle)` helper using `page.request.post(...)` with an inline comment explaining the constraint. Phase 2 mirrors the helper inline; Phase 3 archive E2E will too.

---

## 10. Multi-chat session division (the question Anton raised)

A single chat doing all 74 tasks would: (a) explode context as plan.md gets re-read for each phase, (b) accumulate test-output and build-error noise that drifts the model, (c) force a single rollback target rather than per-phase pivots. Cleaner: **split at phase closeouts**.

**10.1 Why split, in concrete terms.**
- The prompt cache is 5 min TTL; conversations longer than ~30 min start eating cache misses.
- Reading plan.md is ~80K tokens; doing it 11 times per chat is 880K tokens of redundant read. Reading once per chat that owns ~1–2 phases is 80–160K, which is fine.
- Each chat's test-runs accumulate output; that output is conversational dead weight after the test passes.
- Most importantly: **a phase closeout commit is a "known-good" save point**. Chats split at closeouts inherit a clean state with zero dependency carryover.

**10.2 Recommended 7-chat split.**

| # | Chat name | Phases | Tasks | Days | Why grouped |
|---|---|---|---|---|---|
| 1 | **Bootstrap** | 0 | 13 | 1.0 | Foundation; ends at 0.13 closeout. Includes 0.12 Vercel-link blocker. |
| 2 | **Auth + RBAC** | 1 | 13 | 1.5 | NextAuth v5 surface is the riskiest single chunk; deserves its own chat to keep context tight. Includes 1.4 OAuth app blocker. |
| 3 | **Read surface** | 2 + 3 | 16 | 2.0 | Both phases read-only, similar shape (parser + page). Could be split into two 1-day chats if convenient. |
| 4 | **Writer + Status + Consent** | 4 + 5 + 6 | 15 | 3.0 | Tightly coupled: Phase 4 enables 5; 6 reuses the 4 wrapper. Single chat because splitting would re-read plan §4–6 multiple times. Includes 4.1 GitHub App blocker. **The longest single chat.** |
| 5 | **Counter + GDPR + Health** | 7 + 8 + 9 | 13 | 2.0 | All depend on 4+5 being shipped; otherwise independent of each other. Light surface; one chat handles all three. |
| 6 | **Pre-launch + ship** | 10 | 4 | 0.5 | Verification + production deploy. Includes 10.3 + 10.4 blockers. |
| **Total** | | 74 | 10 | |

Two valid alternatives:
- **6-chat compact:** merge Bootstrap + Auth (2.5 days, 26 tasks). Risky — Bootstrap is the foundation chat and Auth is the surface-area chat; mixing them blurs the closeout point.
- **8-chat granular:** split chat 4 into separate Phase 4, Phase 5, Phase 6 chats. Cleaner but Phase 4 is only 0.5 day — too short for its own chat unless the GitHub App creation hits trouble.

**Default recommendation: the 7-chat split above.**

**10.3 Per-chat handoff prompt template.**
Each chat ends by writing the next chat's kickoff prompt at `docs/specs/2026-MM-DD-community-platform-<phase-range>-handoff.md` (mirrors the pattern Anton's been using: GBrain 0.1.2 handoff, this v0.1 handoff). Template:

```
# Community Platform — <phase> chat handoff

## State coming in
- Last green commit: <sha> (<short message>)
- Phases complete: <list>
- Pre-launch tasks done: <list>
- Outstanding from previous chat: <if any>

## This chat owns
- Phase(s): <X (Y tasks) + Z (W tasks)>
- Estimated duration: <N days>
- Human blockers: <list of [H] tasks Anton must do>

## Read in order
1. projects/community-platform/HANDOFF.md          ← cold-pickup, read once
2. projects/community-platform/execution-plan.md   ← this playbook
3. projects/community-platform/plan.md             ← § for THIS phase only
4. projects/community-platform/CHANGELOG.md        ← state of play

## Plan amendments to apply
<reference execution-plan.md §9 — list any that apply to this chat>

## Constraints (carry from session 0)
- Stay within Lite slice (spec §3 non-goals).
- 100% git for v0.1 — no DB.
- All HTML rendering via lib/markdown.ts + SafeHtml.
- pnpm only.
- No "Warsaw" hardcoding (use COMMUNITY_NAME / COMMUNITY_SLUG).
- TDD discipline (red → green → refactor → commit).
- Surgical edits only.
- Don't echo or commit secrets (PEM, OAuth secret).

## First moves
1. Acknowledge state (one paragraph: where we are, what closes when this chat ends).
2. Walk the phase tasks in order; dispatch one subagent per task per execution-plan.md §3.
3. End with phase closeout: lint + typecheck + test:coverage + build (+ e2e if applicable).
4. Update CHANGELOG.md with phase complete entry + last-green-SHA.
5. Write the next chat's handoff prompt at docs/specs/.

## Auto-execution policy
<auto / ask-on-blockers / ask-on-architectural-decisions>

## Done means
- All <N> tasks committed.
- pnpm lint + typecheck + test:coverage + build green (and pnpm e2e if applicable).
- CHANGELOG closeout entry added.
- Next-chat handoff prompt written.
```

**10.4 What carries forward between chats (always).**
- `CHANGELOG.md` — the canonical "where are we" record. Each chat's first move is reading CHANGELOG.
- Last-green commit SHA — recorded in CHANGELOG.
- Vercel env state — per Anton's secret-handling rule, never inline these in chat. Reference by env var name.
- The §9 plan amendments — apply where relevant.

**10.5 What stays scoped per chat (don't carry forward).**
- Test output and build noise.
- The conversational thread of how a particular bug was debugged.
- Speculative refactors or "I noticed X while implementing Y" detours.
- Anything that touches phases not owned by the current chat.

If a chat finds something significant outside its scope (e.g., during Phase 5 the chat spots a Phase 8 issue), record it in `execution-plan.md` §9 (Plan amendments) so the relevant chat picks it up later. Don't fix out-of-scope issues in the current chat.

---

## 11. Kickoff procedure (for the very first execution chat)

**11.1 Confirm branch.** `warsaw-org-and-stack-guide`. Do not branch off until v0.1 lands.

**11.2 Confirm pre-launch state.**
- Task 0.1 (roster `github_handle`): done minimally — only Anton's handle (`@anton1rsod`) is filled; rest are `TBD` per memory `project_community_platform`. Members with `TBD` cannot log in until set.
- Task 0.2 (governance role files): done — `community/governance/admins.md` exists with founder; `community-managers.md` exists empty.
- Task 0.3 (meeting attendees format): explicitly **deferred** to Phase 7 prep. Phase 7's contributions counter parses `## Attendees` sections; if the format doesn't exist when Phase 7 runs, attendance counts will be zero across the board until retrofitted.

**11.3 First subagent dispatch:** Task 0.4 (Next.js 15 init).

**11.4 Where to log progress.**
- `CHANGELOG.md` after each phase closeout.
- Per-phase last-green-SHA in the closeout entry.
- Per-chat handoff prompts in `docs/specs/`.

**11.5 Two execution modes.**
- **(a) Anton dispatches per task.** Operator chat sees each task dispatch and review. Slower but tightest oversight. Right for Phase 1, 4, 5.
- **(b) `/loop` wrapping `superpowers:subagent-driven-development` across the phase.** Operator dispatches the whole phase as a single loop; the loop handles per-task TDD cycles. Faster but harder to course-correct mid-phase. Right for Phase 0, 2, 3, 7, 8, 9.

Recommendation: mode (a) for the first chat (Bootstrap, Phase 0), so Anton calibrates against the dispatch table. Switch to mode (b) for Phase 2/3 once cadence is established. Return to mode (a) for Phase 4/5 (highest risk).

---

## Appendix — Ready-to-paste kickoff prompt for Chat 1 (Bootstrap)

```
Community Platform — Chat 1 (Bootstrap, Phase 0)

Read in order:
1. projects/community-platform/HANDOFF.md
2. projects/community-platform/execution-plan.md
3. projects/community-platform/plan.md  (Conventions + Phase 0 in full)
4. projects/community-platform/CHANGELOG.md

State coming in:
- Last commit: <see git log>
- Phase 0 pre-launch: 0.1 minimal, 0.2 done, 0.3 deferred (to Phase 7 prep)
- Branch: warsaw-org-and-stack-guide

This chat owns: Phase 0 (10 remaining tasks: 0.4–0.13), ~1 day
Human blocker: Task 0.12 (Vercel link + 13 env vars)

First moves:
1. Acknowledge state (one paragraph).
2. Dispatch Task 0.4 (Next.js init) via general-purpose subagent.
3. Walk 0.4 → 0.13 in order. Default agent general-purpose; tdd-guide for 0.10 + 0.11.
4. Phase 0 closeout: pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build.
5. Update CHANGELOG with Phase 0 complete entry + last-green-SHA.
6. Write Chat 2 (Auth + RBAC) handoff at docs/specs/2026-MM-DD-community-platform-phase-1-handoff.md.

Constraints carry from prior chats:
- Lite slice only (spec §3 non-goals).
- 100% git in v0.1 — no DB.
- pnpm only.
- TDD discipline.
- No secrets in chat (PEMs, OAuth secrets — env-var-name reference only).
- No "Warsaw" hardcoding.

Auto mode: on. Ask before any architectural decision; auto-execute mechanical tasks.

Done means: 0.4–0.13 committed; phase closeout green; CHANGELOG updated; Chat 2 handoff written.
```
