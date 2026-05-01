# Changelog

All notable changes to Community Platform will be recorded here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer](https://semver.org/spec/v2.0.0.html) once shipped; until then, date-based entries are fine.

## Versioning policy (placeholder — finalize during plan-writing)

| Version | Meaning |
|---|---|
| `0.0.x` | Pre-spec scaffolding, no implementation |
| `0.1.0` | First implementation pass — identity + roles + minimal gamification |
| `0.2.0` | Project / contribution tracking |
| `0.3.0+` | TBD |
| `1.0.0` | Reserved (production-grade declaration) |

---

## [Unreleased] — 2026-05-01

### Added — Spec, plan, pre-launch, and handoff documentation
- Project scaffold: `README.md`, `spec.md` (stub), `plan.md` (stub), this changelog.
- Locked inputs in `spec.md` §0: four-role access model, gamification in scope, OSS-first, Telegram-complementary posture.
- Cross-links to sister projects (`persona-builder/`, `projects/gbrain/`) and program governance.
- **`spec.md` §1–§10 written** via `superpowers:brainstorming` (commit `97ccea2`, 2026-05-01).
  - Lite slice locked: identity + memory spine + one write surface (status updates).
  - Stack: Next.js 15 + Vercel + GitHub OAuth (JWT sessions) + GitHub App `warsaw-ai-bot`.
  - Storage: 100% git for v0.1; classification rule documented for v0.2+ DB return.
  - Long-term commitments captured in §10 (storage trajectory, federation horizon, OSS/commercial separation, gamification phasing, health metric).
- **`plan.md` written** via `superpowers:writing-plans` (commit `6f72f5c`, 2026-05-01).
  - 74 tasks across 11 phases (0–10). Each task: Files / failing test / run command / minimal implementation / passing-test verification / commit message.
  - Conventions section locks pnpm-only, ESM, strict TS, coverage gates (80% / 100% on auth-RBAC-classification-bot-week).
- **Minimal pre-launch landed** (commit `a736b38`, 2026-05-01).
  - Task 0.1: founder added to `community/members/roster.md` with handle `@anton1rsod`. Other 18 members remain `*(TBD)*` and cannot log in until updated.
  - Task 0.2: `community/governance/admins.md` created with founder; `community/governance/community-managers.md` created empty.
  - Task 0.3: deferred to Phase 7 prep (meeting attendees format will be retrofitted when contributions counter ships).
- **Handoff documentation** (commit `0fe4e78`, 2026-05-01): `HANDOFF.md` — cold-pickup reference compressing brainstorm + spec + plan journey for future readers (227 lines).
- **Execution plan** (commit `3194925`, 2026-05-01): `execution-plan.md` — subagent dispatch playbook with 7-chat session-division strategy, plan amendments, and per-phase risk register (396 lines).

### Phase 0 — Bootstrap (complete, 2026-05-01)

Last green commit: pending closeout (this entry's commit).

- **Pre-launch (already done minimally pre-Phase 0, commit `a736b38`):** founder added to `community/members/roster.md` (`@anton1rsod`); `community/governance/admins.md` and `community/governance/community-managers.md` created. Task 0.3 (meeting `## Attendees` format) deferred to Phase 7 prep.
- **Task 0.4** (commit `5412025`) — Next.js App Router skeleton (TS strict, ESM, pnpm).
- **Task 0.5** (commit `caa360e`) — ESLint 9 flat config + `next-env.d.ts` / `*.tsbuildinfo` gitignore extras.
- **Task 0.6** (commit `93be948`) — Husky + lint-staged pre-commit hook with monorepo-aware `core.hooksPath` set via `prepare` script.
- **Task 0.7** (commit `31eecc2`) — Vitest 2 + v8 coverage + smoke test (`pnpm test`, `pnpm test:coverage`).
- **Task 0.8** (commit `67651a3`) — Playwright + Chromium browser + smoke E2E (`pnpm e2e` green).
- **Task 0.9** (commit `b2a5fd1`) — Tailwind 3.4 + PostCSS + autoprefixer.
- **Task 0.10** (commit `359ff3d`) — TDD: `lib/env.ts` Zod env contract; 100% coverage. Root `.gitignore` allows `.env.local.example`.
- **Task 0.11** (commit `486508d`) — TDD: `lib/classification.ts` §6.1 rule as code; 100% coverage.
- **Plan amendment** (commit `528f24c`) — Bumped `next` from `15.0.4` → `16.2.4` because Vercel rejected the deploy at 15.0.4 (CVE-2025-66478). Companion bumps: `react` `19.0.0` → `19.2.0`, `eslint-config-next` to `16.2.4`. Config tweaks: `next.config.ts` `experimental.typedRoutes` → top-level `typedRoutes` (now stable in 16); `tsconfig.json` `jsx: preserve` → `react-jsx` (auto-applied by Next 16); `package.json` `lint` script: `next lint` → `eslint .` (next lint removed in 16).
- **Task 0.12** (commit `b3c5386`) — Vercel project linked: `anton-9351s-projects/warsaw-ai-community-platform`. Git-connected to `github.com/anton1rsod/warsaw-ai-community-gbrain`. 13 env vars on production + 13 on preview (preview-scoped to `warsaw-org-and-stack-guide` branch — broaden to all preview branches in Phase 1 if needed). `vercel.json` written. First successful preview deploy: `dpl_3gcrBvwKFFHSEKB8MouoRKHmwpx9` — Ready. URL is gated by Vercel Deployment Protection (default for Hobby plan); roster-only NextAuth gate ships in Phase 1.

**Phase 0 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 6 tests pass; 100% lines/branches/functions/statements on `lib/env.ts` + `lib/classification.ts`. 80% coverage thresholds enabled in `vitest.config.ts`.
- `pnpm build` — 4 routes, all static
- `pnpm e2e` — 1 pass (home page renders)

**Repo migration (post-closeout, 2026-05-01):**
- Created new private repo: https://github.com/anton1rsod/warsaw-ai-community (umbrella name; replaces the legacy `warsaw-ai-community-gbrain` repo whose name no longer reflects its monorepo scope).
- All commits + tags (`gbrain-v0.1.0`, `gbrain-v0.1.1`) pushed.
- Vercel project `anton-9351s-projects/warsaw-ai-community-platform` reconnected to new repo URL.
- Vercel env `GITHUB_REPO_NAME` updated from `warsaw-ai-community-gbrain` → `warsaw-ai-community` (production + preview-on-warsaw-org-and-stack-guide).
- Re-deploy verified Ready: `dpl_3hXeCEef8eSUvmZm9MTm4q6HpKp5`.
- Old repo `anton1rsod/warsaw-ai-community-gbrain` left untouched on GitHub (decision deferred — likely archive after v0.1.0 ship).
- Repo will flip to public at v0.1.0 ship per spec §0.5 (OSS-first / no public marketing pre-v0.1) + ADR-0001 (MIT licensing).

### Phase 1 — Auth + RBAC (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `5b03e4b` (review fixes).

**13 tasks shipped, 75 unit tests + 4 E2E green, 100% coverage on the spec §8 strict-list modules.**

- **Task 1.1** (commit `226ec27`) — `lib/roster.ts` header-aware parser per §9.1 amendment. Detects GitHub column by `/^github$/i` per table; multi-table-aware; skips `*(TBD)*` rows + empty/TBD handles. Mirrors actual `community/members/roster.md` two-table layout in fixture. 10 unit tests.
- **Task 1.2** (commit `955ca3d`) — `lib/governance.ts` reads `admins.md` + `community-managers.md`. Set-backed `isAdmin` / `isCommunityManager` predicates. 8 unit tests.
- **Task 1.3** (commit `e749660`) — `lib/rbac.ts` resolves admin / community_manager / member / guest. Admin-must-be-on-roster invariant. 14 unit tests; 100% coverage.
- **Task 1.4 [H]** — Anton creates GitHub OAuth App + sets `GITHUB_OAUTH_CLIENT_ID` / `_SECRET` on Vercel preview. **Pending Anton's manual step at closeout time**; OAuth callback URL is `https://warsaw-ai-platform.vercel.app/api/auth/callback/github` (short alias claimed in §9.11).
- **Task 1.5** (commit `9ea1ee1`) — `lib/auth.ts` NextAuth config. **Bumped to `next-auth@5.0.0-beta.31`** per amendment §9.8. JWT session strategy; `session.maxAge` from env; jwt callback writes lowercase `githubHandle` from GitHub `profile.login`; session callback exposes it to client via Module augmentation. Vitest config required `server.deps.inline: ["next-auth", "@auth/core"]`. 9 unit tests; 100% coverage.
- **Task 1.6** (commit `adb4ef4`) — NextAuth catch-all route at `app/api/auth/[...nextauth]/route.ts` re-exports `handlers` from `lib/auth.ts`.
- **Task 1.7** (commit `c0993bf`) — `/login` page. Server Component (env access) + Client Component (`LoginForm.tsx` with CSRF dance). **Client-side form POST to `/api/auth/signin/github`** instead of broken `signIn` server action per amendment §9.8 (Issue #13388).
- **Task 1.8** (commit `5132ec0`) — `/no-access` page for non-roster users; server-action `signOut` (signOut is unaffected by #13388).
- **Task 1.9** (commit `a31d3b3`) — Build-time content snapshot. `scripts/snapshot-content.ts` reads roster + governance from monorepo root, writes `lib/__generated__/content-snapshot.json`. `lib/content-snapshot.ts` wraps it with synchronous helpers (`snapshot`, `isAdmin`, `isCommunityManager`, `findMemberByHandle`). pnpm pre-hooks (`predev`, `prebuild`, `prelint`, `pretypecheck`, `pretest`, `pretest:coverage`, `pree2e`) auto-run snapshot. Generated dir gitignored. 12 unit tests.
- **Task 1.10** (commit `d59906d`) — Auth proxy middleware. **`proxy.ts`, not `middleware.ts`**, per amendment §9.7 (Next 16 deprecated middleware filename). 14 unit tests; 100% coverage per spec §8.
- **Task 1.11** (commit `56a49c5`) — `/home` shell page (server-rendered with `auth()` for session); root `/` now redirects to `/home`. Smoke E2E updated: unauthenticated visit to `/` follows redirect chain to `/login`.
- **Task 1.12** (commit `961b507`) — E2E auth flow + dev-only `/api/test-auth` route. Three paths covered: unauthenticated → `/login`, non-roster → `/no-access`, roster member (`anton1rsod`, also founder/admin) → `/home`. The test-auth route encodes a NextAuth-compatible JWT cookie via `next-auth/jwt` `encode()` with matching salt; hard-gated to `NODE_ENV !== "production"`. **Proxy refactored to use manual JWT `decode()`** instead of `auth()` helper (which only works in RSC / Route Handlers) per amendment §9.9.
- **Reviewer fixes** (commit `5b03e4b`) — typescript-reviewer + code-reviewer HIGH/MEDIUM addressed:
  - `proxy.ts`: `console.error` for decode failures + JWT-shape-drift signal (cookie-name-drift visibility); `/.well-known` added to `PUBLIC_PREFIXES`.
  - `lib/content-snapshot.ts`: Set-backed `isAdmin` / `isCommunityManager` for O(1) lookups (matching governance.ts).
  - `LoginForm.tsx`: validate CSRF response shape before reading `csrfToken`.
  - `lib/auth.ts`: drop superfluous session-callback cast (Session augmentation makes direct property assignment compile cleanly).
  - `app/api/test-auth/route.ts`: comment on `secure: false` localhost intent.

**Phase 1 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 9 test files, 75 tests pass. Coverage: 86.86% all files; **100% on `lib/{auth,rbac,classification,content-snapshot,env,governance,roster}.ts` + `proxy.ts`** (governance.ts and roster.ts have unreachable defensive `??` branches at 94% and 84% respectively — structurally unreachable with valid markdown). `scripts/snapshot-content.ts` at 0% (CLI tool; transitively tested via consumers).
- `pnpm build` — 5 routes (`/`, `/home`, `/login`, `/no-access`, `/api/auth/[...nextauth]`, `/api/test-auth`) + `ƒ Proxy (Middleware)` detected by Next 16
- `pnpm e2e` — 4 tests pass: smoke + 3 auth-flow

**Plan amendments applied during this phase (§9.5–§9.11 in `execution-plan.md`):**
- §9.5 Phase 0 closeout — `next 15.0.4 → 16.2.4` bump (Vercel rejected at 15.0.4 per CVE-2025-66478)
- §9.6 Phase 0 closeout — preview env vars scoped per-branch
- §9.7 Phase 1 — `proxy.ts` (Next 16 canonical) replaces `middleware.ts`
- §9.8 Phase 1 — `next-auth@5.0.0-beta.31` (bumped from plan's beta.25); client-side form POST sign-in (Issue #13388 workaround)
- §9.9 Phase 1 — proxy uses manual `decode()` from `next-auth/jwt`, not `auth()` helper
- §9.10 Phase 1 — Vercel project Root Directory must be `projects/community-platform` (currently null after repo migration; Anton fixes in dashboard)
- §9.11 Phase 1 — short alias `warsaw-ai-platform.vercel.app` claimed for the project

**Phase 1 live-validation update (2026-05-01, post-closeout commits):**
- §9.10 Vercel Root Directory fix landed. Anton set `rootDirectory: "projects/community-platform"` in dashboard. Verified via `vercel pull` + empty-commit `2e0ddab` triggered a successful auto-deploy in 30s (previous attempts failed in 2-3s with "No Next.js version detected").
- Task 1.4 GitHub OAuth App created. Callback URL: `https://warsaw-ai-platform.vercel.app/api/auth/callback/github`. Client ID + Secret force-overwritten on Vercel preview env. NEXTAUTH_URL discovered as empty (Vercel sensitive-env interaction); reset to `https://warsaw-ai-platform.vercel.app` via `vercel env add ... --value ... --no-sensitive --yes`. Redeploy `qknxzwpbn` aliased to `warsaw-ai-platform.vercel.app`.
- **Live OAuth round-trip validated end-to-end on preview**: `@anton1rsod` signs in with GitHub → callback → `/home` with role label "admin". Phase 1 acceptance loop closed.

**Outstanding (parallel to Phase 2):**
- Roster `github_handle` backfill for the other 18 members (`*(TBD)*` placeholders) — non-founder logins require this. Tracked outside Phase 1 acceptance.

### Phase 2 — Member directory + profiles (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `b215eab`.

**7 implementation tasks shipped, 96 unit tests + 6 E2E green, 100% coverage on the markdown sanitization gate and SafeHtml/PersonaPanel components.**

- **Task 2.1** (commit `d88c3a2`) — `lib/markdown.ts` parser via gray-matter + sanitized renderer (unified pipeline: `remark-parse` → `remark-gfm` → `remark-rehype{allowDangerousHtml:false}` → `rehype-sanitize{defaultSchema}` → `rehype-stringify`) + `truncateToFirstH2`. Output is safe-by-construction; downstream rendering reads pre-sanitized strings. 8 unit tests; 100% coverage.
- **Task 2.2** (commit `2c21e12`) — `readMemberProfile` + `readMemberPersona` helpers in `lib/roster.ts`; snapshot script extended to embed profile + persona per member; `lib/content-snapshot.ts` exposes `MemberWithProfile`, `findMemberBySlug`, `listMembers`. +17 tests; `lib/content-snapshot.ts` 100% coverage maintained.
- **Task 2.3** (commit `af56dea`) — `app/components/SafeHtml.tsx` centralizes sanitized HTML insertion (single audit-bounded React HTML-insertion site — the `react/no-danger` surface). Vitest config gains `environmentMatchGlobs` (jsdom for `.tsx` tests) + `setupFiles` (jest-dom matchers); coverage `include` adds `app/components/**/*.tsx`. **Vitest config preserves Phase-1's `server.deps.inline: ["next-auth", "@auth/core"]`** (the plan's drop-in replacement omitted it and would have broken auth tests). 2 unit tests; 100% coverage.
- **Task 2.4** (commit `47445ea`) — `PersonaPanel` component (uses `SafeHtml`; renders fallback section on null persona). 2 unit tests; 100% coverage.
- **Task 2.5** (commit `35dc709`) — `/members` directory page (server component listing roster from snapshot).
- **Task 2.6** (commit `42e1f08`) — `/members/[slug]` profile page with `generateStaticParams`; renders profile via `SafeHtml` + `PersonaPanel`; profile-fallback when no `community/members/<slug>.md`.
- **Task 2.7** (commit `b215eab`) — E2E `e2e/members.spec.ts` covers directory + profile navigation + persona panel visibility. **Plan's `test.beforeEach({ request })` pattern fixed to use `page.request.post()`** via a local `loginAs(page, handle)` helper (matching Phase 1's auth.spec.ts pattern); standalone `request` fixture cookies don't transfer to `page`.

**Phase 2 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 12 files, 96 tests pass. Coverage: 86.8% all files; **100% on `lib/{auth,classification,content-snapshot,env,markdown,rbac}.ts` + `proxy.ts` + `app/components/{PersonaPanel,SafeHtml}.tsx`**. `governance.ts` 94.28% branches (Phase-1 unreachable defensive branches); `roster.ts` 81.39% branches / 96.42% lines (Task 2.2 added defensive ENOENT/non-Error paths — both above the 80% gate). `scripts/snapshot-content.ts` at 0% (CLI tool; transitively tested via consumers, same as Phase 1).
- `pnpm build` — 7 routes (`/`, `/home`, `/login`, `/members`, `/members/[slug]` SSG → `/members/anton-safronov`, `/no-access`, `/_not-found`) + 2 functions (`/api/auth/[...nextauth]`, `/api/test-auth`) + `ƒ Proxy (Middleware)`.
- `pnpm e2e` — 6 tests pass: smoke + 3 auth-flow + 2 members.

**Plan amendments applied during this phase (§9.12 + §9.13 in `execution-plan.md`):**
- §9.12 Phase 2 — `vitest.config.ts` merge preserves Phase-1 `server.deps.inline`; coverage `include` scoped to `app/components/**/*.tsx` (not full `app/**` — would dilute overall coverage from uncovered server-component pages).
- §9.13 Phase 2 — E2E auth-via-test-auth must use `page.request.post()` (cookies on standalone `request` fixture don't reach `page`).

### Phase 3 — Document readers (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `b4475f0`.

**8 implementation tasks shipped + 1 batched reviewer-fix commit, 137 unit tests + 9 E2E green, 100% coverage on the spec §8 strict-list.**

- **Task 3.1** (commit `1a386fb`) — `lib/projects.ts` reads `projects/<slug>/{README,spec,plan,CHANGELOG}.md` (all optional); `listProjects` excludes `_template`-prefixed and dotted dirs; `readProject` rejects path traversal. Snapshot extended with `projects: readonly ProjectDetail[]` + `listProjectDetails` + `findProjectBySlug`. +22 tests; `lib/projects.ts` at 94.52% (defensive non-ENOENT throws unreachable without fs mocking).
- **Task 3.2** (commit `44a3a76`) — `/projects` index + `/projects/[slug]` detail page with `generateStaticParams`; renders README/spec/plan/CHANGELOG sections via `SafeHtml`. Build SSG'd `/projects/community-platform` (self-reference) + `/projects/gbrain`.
- **Task 3.3** (commit `d2244e7`) — `lib/decisions.ts` reads `docs/decisions/NNNN-*.md`; extracts `**Status:**` and `**Date:**` from body. Snapshot extended with `decisions` + helpers. +20 tests; 11 production ADRs in built snapshot.
- **Task 3.4** (commit `e29bb29`) — `/decisions` index + `/decisions/[slug]` detail; SSG'd 11 ADR pages.
- **Task 3.5** (commit `6c4b1a1`) — `lib/meetings.ts` reads `community/meetings/weekly/YYYY-MM-DD.md`; `parseAttendees` extracts `## Attendees` section bullets, ignoring HTML-comment placeholders. **Plan's regex used invalid `\z` anchor** — replaced with JS-valid `$(?![\s\S])` end-of-string assertion. **Plan also reused `FILE_RE` (with `.md$`) on bare slug in `readMeeting`** — added separate `SLUG_RE`. +14 tests; `lib/meetings.ts` at 97.53%; production weekly dir is empty (`_template.md` and `README.md` skipped) so snapshot reports 0 meetings until Anton publishes notes.
- **Task 3.6** (commit `66f9878`) — `/meetings` index (with empty-state copy) + `/meetings/[slug]` detail.
- **Task 3.7** (commit `06fd62e`) — E2E `e2e/archives.spec.ts` covers `/projects` listing, `/decisions` listing + ADR open, `/meetings` heading visibility (empty-state tolerant). Uses `loginAs(page, "anton1rsod")` per §9.13.
- **Reviewer fixes** (commit `b4475f0`) — `typescript-reviewer` + `code-reviewer` HIGH/MEDIUM addressed:
  - HIGH `lib/content-snapshot.ts`: Set-backed `isAdmin` / `isCommunityManager` restored (Task 2.2 lost the O(1) contract during wholesale replacement; auth path runs per protected request).
  - HIGH `scripts/snapshot-content.ts`: 3 `as` casts that hid `null` branches from `readProject` / `readDecision` replaced with explicit null-throws (`Error("[snapshot] readX returned null for slug \"…\" — listX/readX contract violation")`).
  - MEDIUM `lib/decisions.ts` + `lib/meetings.ts`: bare `catch {}` replaced with isENOENT-rethrow (non-ENOENT errors now surface as 500s rather than silently 404ing).
  - MEDIUM `lib/roster.ts`: path-traversal guards on `readMemberProfile` + `readMemberPersona`; deterministic `.md` pick in persona reader (sort first; `readdir` order isn't guaranteed alphabetical across filesystems).

**Phase 3 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 15 files, 137 tests pass. Coverage: 85.47% all files; **100% on `lib/{auth,classification,content-snapshot,env,markdown,rbac}.ts` + `proxy.ts` + `app/components/{PersonaPanel,SafeHtml}.tsx`** (spec §8 strict-list + Phase 2-3 critical components). Filesystem readers above 80% gate: `lib/decisions.ts` 93.44% / 66.66% branches (defensive guards unreachable), `lib/meetings.ts` 97.53% / 89.65% branches, `lib/projects.ts` 94.52% / 88.88% branches, `lib/roster.ts` 96.55% / 84.31% branches. `governance.ts` 94.28% branches. `scripts/snapshot-content.ts` at 0% (CLI tool, transitively tested via consumers).
- `pnpm build` — 13 routes (5 static + 8 SSG): `/`, `/_not-found`, `/home`, `/login`, `/no-access`, `/members` (+ `/members/anton-safronov`), `/projects` (+ `/projects/community-platform`, `/projects/gbrain`), `/decisions` (+ 11 ADR pages), `/meetings` (0 detail paths until notes ship) + 2 functions (`/api/auth/[...nextauth]`, `/api/test-auth`) + `ƒ Proxy (Middleware)`.
- `pnpm e2e` — 9 tests pass: smoke + 3 auth-flow + 2 members + 3 archives.

**Plan amendments applied during this phase (§9.14 + §9.15 in `execution-plan.md`):**
- §9.14 Phase 3 — `lib/meetings.ts` regex fixes: `parseAttendees` `\z` → `$(?![\s\S])`; `readMeeting` separate `SLUG_RE` for bare slugs.
- §9.15 Phase 3 — snapshot script throws on `readProject`/`readDecision` null instead of casting (the plan's `as` casts hid the null branch and would emit a `null` entry typed as non-null into the JSON snapshot).

### Phase 4 — GitHub App writer (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `5e07373`.

**1 implementation task shipped (Task 4.2) + 1 batched reviewer-fix commit, 167 unit + integration tests pass, 100/100/100/100 coverage on `lib/github-app.ts` (spec §8 strict-list).**

- **Task 4.1 [H]** — Anton creates `warsaw-ai-bot` GitHub App + PEM + sets `GITHUB_APP_ID` / `_PRIVATE_KEY` / `_INSTALLATION_ID` on Vercel preview. **Pending Anton's manual step**; the wrapper integration tests use a self-generated PEM at `tests/fixtures/test-app.private-key.pem` (signs JWTs that GitHub would reject — no matching App ID — and grants no real privileges, per plan amendment §9.3). The `scripts/smoke-github-app.ts` real-API verification is gated on Anton's manual step.
- **Task 4.2** (commit `7e1ee81`) — `lib/github-app.ts` Octokit + auth-app wrapper. `createGitHubApp(config)` returns `{ readFile, writeFile, deleteFile }`. `GitHubAppError` taxonomy: `sha_conflict` (409) / `not_found` (404) / `forbidden` (401, 403) / `unknown`. SHA-based optimistic locking maps 409 → `kind: 'sha_conflict'` for Phase 5 status edits. Author / committer default to `warsaw-ai-bot@users.noreply.github.com`. MSW-based integration coverage (12 tests) + `mapError` unit coverage via synthetic inputs (10 tests). Adds `@octokit/rest@^21`, `@octokit/auth-app@^7`, `msw@^2`. `pretest:coverage` snapshot runs unaffected.
- **Reviewer fixes** (commit `5e07373`) — typescript-reviewer + code-reviewer + security-reviewer HIGH/MEDIUM addressed:
  - HIGH `lib/github-app.ts` `readFile`: distinguish directory (Array → null), symlink/submodule (non-file `type` → throw `unknown`), and >1MB `encoding=none` (→ throw `unknown` with size hint). Avoids silent null-on-non-file traps that Phase 5/6 callers could not diagnose.
  - HIGH `lib/github-app.ts` `mapError`: 401 → `forbidden` (token expiry mapped same as missing-scope for v0.1; future callers can split off an `unauthorized` kind without breaking existing handlers).
  - MEDIUM `lib/github-app.ts` `sanitizeCause`: strips `Authorization` header from the Octokit error before attaching as `cause`. Prevents installation token (`ghs_xxx`, 1h TTL, `contents:write`) from leaking via `console.error` or structured loggers.
  - MEDIUM `scripts/smoke-github-app.ts`: print char count + SHA only (never README content); exit 1 with clear message if README empty.
  - HIGH `eslint.config.js`: `no-console` error-level rule on production paths; allow `console.error` / `console.warn` (proxy.ts uses these for cookie / JWT decode signals so on-call has something to grep). `scripts/**` override allows `console.log` for CLI tools.
  - 8 additional tests for the new code paths (readFile non-file types, encoding=none, deleteFile 403/500, mapError 401, sanitizeCause edge cases).

**Phase 4 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings (with new `no-console` rule)
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 17 files, 167 tests pass. **`lib/github-app.ts` 100% lines / 100% branches / 100% functions / 100% statements** (spec §8 strict-list). Phase 1-3 strict-list modules retain 100% (`lib/{auth,classification,content-snapshot,env,markdown,rbac}.ts` + `proxy.ts` + `app/components/{PersonaPanel,SafeHtml}.tsx`). Overall: 84.10% lines / 91.66% branches (above 80% gate).
- `pnpm build` — 13 routes (no new pages this phase) + `ƒ Proxy (Middleware)`. `lib/github-app.ts` is server-only; `scripts/smoke-github-app.ts` is excluded from build.
- `pnpm e2e` — not required for Phase 4 per execution-plan §4.2 (only phases 1, 2, 3, 5, 6, 8 ship E2E coverage).

**Plan amendments applied during this phase (§9.3 in `execution-plan.md`):**
- §9.3 Phase 4 — test PEM committed to `tests/fixtures/test-app.private-key.pem`. Existing `.gitignore` exception (`!tests/fixtures/**/*.pem`) covers it. The key signs JWTs GitHub would reject (no matching App ID); MSW intercepts every test network call. No new amendments needed (all reviewer-fix changes are implementation bugs captured in commit messages, not architectural deviations).

**Outstanding (Anton-blocked, parallel to Phases 5-6):**
- Task 4.1 [H]: create `warsaw-ai-bot` GitHub App, install on `warsaw-ai-community` repo, set 3 env vars on Vercel preview. After env vars are real, run `pnpm tsx scripts/smoke-github-app.ts` to verify auth end-to-end. Phase 5's `/this-week` page and Phase 6's `/consent` page need this to work in preview.
- Roster `github_handle` backfill for the other 18 members (carries from Phase 1).

### Pending — Phase 5 onward
- Apply plan amendments at execution time (still relevant):
  - §9.2 Task 9.2 — `export const revalidate = 60;` on `/admin/health` (Phase 9).
- Phases 5 + 6 (Status updates + Consent flow) remain in this chat per execution-plan §10.2.
- Tailwind typography plugin not installed; `prose` classes render as plain HTML for now (visual-only, no functional impact).
