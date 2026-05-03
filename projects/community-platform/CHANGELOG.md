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

### Phase 5 — Status updates (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `75ce520`.

**6 implementation tasks shipped + 1 batched reviewer-fix commit, 221 unit + integration tests + 12 E2E pass, 100% coverage on `lib/week.ts` (spec §8 strict-list).**

- **Task 5.1** (commit `9c7c07f`) — `lib/week.ts` ISO 8601 helpers. Thursday-shift algorithm; year-cross + W53 boundary tests; `WEEK_REGEX` exported as the canonical token shape so Zod schemas don't drift. 16 unit tests; 100/100/100/100.
- **Task 5.2** (commit `2232990`) — `lib/status-reader.ts` runtime read via GitHub Contents API + commits API per file (parallel). Returns `[]` on 404 / on path-resolves-to-file (defensive); skips non-md entries; encoding=none (>1 MB) entries skipped; non-404 errors propagate. 6 MSW integration tests; 100/100/100/100.
- **Task 5.3** (commit `139db9f`) — `app/actions/status.ts` `postStatus` / `editStatus` / `deleteStatus`. Zod validation with `WEEK_REGEX` + `parseWeek`-refined week range (1..53); discriminated `StatusActionResult` union; `resolveAuthor` ensures member can only modify their own status; SHA-based optimistic locking maps `GitHubAppError.kind` → typed action errors. Frontmatter format: `week` / `author` / `updated_at`. 21 integration tests with mocked github-app + auth + content-snapshot; 100% lines / 97.56% branches (production NODE_ENV branch unreachable from the test runner).
- **Task 5.4** (commit `2cc5b54`) — `app/components/StatusEditor.tsx` client component with optimistic UI. Post / Update / Delete buttons; sha_conflict surfaces "Someone else updated this — refresh to see the latest."; `useTransition` for pending state. 10 RTL unit tests; 100/100/100/100.
- **Task 5.5** (commit `6ad9133`) — `/this-week` page (server component). Fetches installation token via `createAppAuth` (renamed locally to `ghAppAuth` to avoid shadowing imported `lib/auth`); reads current ISO week's statuses; splits self vs others; strips frontmatter via `parseMarkdown`; passes `postStatus` / `editStatus` / `deleteStatus` actions to `StatusEditor`. **`dynamic = "force-dynamic"`** for v0.1 (deferring 60s ISR per amendment §9.16; bot commit + propagation + cache + SHA-conflict timing risks captured in execution-plan §6.3 are easier to verify operationally without ISR). `<time dateTime={...}>` for lastModified rendering.
- **Task 5.6** (commit `be4822b`) — E2E status flow. `app/actions/_test-status-store.ts` in-memory mock on `globalThis` (required because Next 16's `"use server"` files bundle into a separate module graph from server components / route handlers; without `globalThis`, action writes and page reads land in different module instances). Mock gated on `NEXT_PUBLIC_E2E_MODE=1` + production NODE_ENV guard. `playwright.config.ts` sets the flag in `webServer.command`. `/api/test-reset-status` route handler (dev/E2E-only; in PUBLIC_PATHS only when NODE_ENV !== production). `e2e/status.spec.ts` 3 tests (post / edit / delete) with `describe.configure({ mode: "serial" })` + `beforeEach` reset+login. Uses `getByRole("status").toContainText()` for message assertions (getByText was strict-matching multiple elements).
- **Reviewer fixes** (commit `75ce520`) — typescript-reviewer + code-reviewer HIGH/MEDIUM addressed:
  - HIGH `app/actions/status.ts`: `WeekSchema` refined via `parseWeek` so W00/W54/W99 are rejected by Zod (the bare regex accepted them; writes would land at directory paths no reader surfaces).
  - HIGH `app/actions/_test-status-store.ts` `mockStatusActions.edit`: returns `not_found` when key absent (production semantics: GitHub returns 404 for SHA-bearing writes to missing files); without this the E2E happy path could exercise a success branch production never reaches.
  - HIGH `app/actions/_test-status-store.ts` `resolveAuthState`: distinguishes `not_authenticated` vs `not_a_member`. Without the split an unauthenticated Playwright call would return `not_a_member` and any guard test would pass for the wrong reason.
  - HIGH `app/actions/status.ts`: frontmatter field renamed `posted_at` → `updated_at` because both post and edit emit the current timestamp; `posted_at` would be misleading once an entry is edited. Phase 7 contributions counter reads git log dates, not this field, so renaming is safe.
  - MEDIUM `app/actions/status.ts`: production NODE_ENV guard wraps each `isE2EMode` branch as defense-in-depth.
  - MEDIUM `proxy.ts`: `/api/test-auth` + `/api/test-reset-status` removed from `PUBLIC_PATHS` when NODE_ENV === production. If `NEXT_PUBLIC_E2E_MODE` leaks to prod, proxy still redirects unauthenticated callers to /login and the route returns 404.
  - MEDIUM `lib/week.ts`: `WEEK_REGEX` exported as a single source of truth.
  - MEDIUM `app/this-week/page.tsx`: `<time dateTime>` for `lastModified` rendering.

**Phase 5 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 21 files, 221 tests pass. **100% on `lib/{auth,classification,content-snapshot,env,github-app,markdown,rbac,status-reader,week}.ts` + `proxy.ts` + `app/components/{PersonaPanel,SafeHtml,StatusEditor}.tsx`** (spec §8 strict-list + Phase 2-5 critical components). `app/actions/status.ts` 100% lines / 97.56% branches; `lib/governance.ts` 100% / 94.28% branches; `lib/{decisions,meetings,projects,roster}.ts` above 80% / 84% gate (defensive guards). Overall 87.28% lines / 93.59% branches. `scripts/{snapshot-content,smoke-github-app}.ts` at 0% (CLI tools); `app/actions/_test-status-store.ts` excluded from coverage (E2E-only).
- `pnpm build` — 14 routes (5 static + 8 SSG + `/this-week` ƒ Dynamic) + 3 functions (`/api/auth/[...nextauth]`, `/api/test-auth`, `/api/test-reset-status`) + `ƒ Proxy (Middleware)`.
- `pnpm e2e` — 12 tests pass: smoke + 3 auth-flow + 2 members + 3 archives + 3 status.

**Plan amendment applied during this phase (§9.16 in `execution-plan.md`):**
- §9.16 Phase 5 — `/this-week` ships with `dynamic = "force-dynamic"` instead of plan's `revalidate = 60`. Reason: ISR + bot commit propagation + 60s cache + SHA-conflict resolution interact in subtle ways (per execution-plan §6.3); a later iteration can re-introduce caching once the timing is operationally understood. Also: the E2E mock store leaks across cache windows in dev, which the dynamic path avoids.

**Outstanding:**
- Task 4.1 [H] still pending Anton (GitHub App + 3 env vars). `/this-week` works against the real bot once env vars are real; the smoke script (`pnpm tsx scripts/smoke-github-app.ts`) verifies end-to-end.
- Roster `github_handle` backfill for the other 18 members (carries from Phase 1).

### Phase 6 — Membership consent flow (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `3862ace` + the e2e accept test added in the closeout commit.

**4 implementation tasks shipped, 242 unit + integration tests + 16 E2E pass, 100% coverage on `proxy.ts` (spec §8 strict-list).**

- **Task 6.1** (commit `a9fa889`) — `app/actions/consent.ts` — `acceptConsent` (idempotent — skips writeFile when profile exists), `hasConsent(handle)` (false without API call for non-roster), `acceptConsentAndSetCookie` (sets `waic-consented` on success). E2E mock branch via `mockConsentStore` on `globalThis` per amendment §9.17 (Next 16's `"use server"` module split). 12 integration tests; 100/100/100/100 coverage on `consent.ts`.
- **Task 6.2** (commit `871b4f9`) — `ConsentModal` (aria-modal + labelledby + disabled prop forwards to both buttons during pending) + `/consent` page (server component redirect chain: unauth → /login, non-roster → /no-access, hasConsent → /home; `dynamic = "force-dynamic"` because `hasConsent`'s value can change between requests) + `ConsentClient` (useTransition wraps action; Accept routes to /home or /login on failure; Cancel calls `signOut({ callbackUrl: "/login" })`). `lib/consent-cookie.ts` exposes `CONSENT_COOKIE` (lives in `lib/` because `"use server"` modules can only export async functions). 5 RTL unit tests; 100/100/100/100 on `ConsentModal.tsx`.
- **Task 6.3** (commit `76d3027`) — `proxy.ts` consent gate. `/consent` added to `PUBLIC_PATHS`. After member check, redirects to `/consent` when `waic-consented` cookie is missing. Auth gate runs before consent gate so unauthenticated → `/login` not `/consent`. `/api/test-auth` route extended with optional `consented` field (defaults to `true` so existing E2E specs keep landing on their target pages; consent-flow tests opt out with `consented: false`). 21 unit tests on `proxy.ts` (4 new for the consent gate + 1 for the production NODE_ENV branch via `vi.stubEnv`).
- **Task 6.4** (commit `3862ace` + closeout commit) — `e2e/consent.spec.ts` 4 tests: first-time member sees modal, returning member skips, cancel lands on /login, **accept records consent and persists on next /home visit**. `loginAs(page, handle, { consented })` extended; `/api/test-reset-consent` reset endpoint mirrors `/api/test-reset-status`; `/api/test-reset-consent` added to dev-only `PUBLIC_PATHS`.

**Phase 6 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 23 files, 242 tests pass. **100% on `lib/{auth,classification,content-snapshot,env,github-app,markdown,rbac,status-reader,week}.ts` + `proxy.ts` + `app/actions/consent.ts` + `app/components/{ConsentModal,PersonaPanel,SafeHtml,StatusEditor}.tsx`** (spec §8 strict-list + Phase 2-6 critical components). `app/actions/status.ts` 100% lines / 97.56% branches; `lib/governance.ts` 100% / 94.28% branches; filesystem readers above 80% gate. Overall 86.7% lines / 93.28% branches.
- `pnpm build` — 16 routes (5 static + 8 SSG + `/this-week` + `/consent` ƒ Dynamic) + 4 functions (`/api/auth/[...nextauth]`, `/api/test-auth`, `/api/test-reset-status`, `/api/test-reset-consent`) + `ƒ Proxy (Middleware)`.
- `pnpm e2e` — 16 tests pass: smoke + 3 auth-flow + 2 members + 3 archives + 3 status + 4 consent.

**Plan amendments referenced (existing):**
- §9.7 + §9.9 — `proxy.ts` (NOT `middleware.ts`) with manual `decode()`. Consent gate folded into the existing pattern. ✓
- §9.13 — E2E auth helper uses `page.request.post()` so cookies propagate. `loginAs(page, handle, { consented })` extends the helper. ✓
- §9.17 — globalThis-backed mock store. `mockConsentStore` follows the same pattern. ✓
- §9.18 — proxy conditionally admits dev-only public paths under NODE_ENV. `/api/test-reset-consent` added under the same gate. ✓

**Reviewer note:**
- typescript-reviewer + code-reviewer agents were dispatched at closeout but both hit the org's monthly Claude usage limit before completing. Self-review pass instead: cookie name single source of truth ✓, auth precedes consent in proxy ✓, hasConsent skips GitHub for non-roster ✓, accept action is idempotent ✓. Added a 4th E2E test exercising the Accept happy path (the original 3 only covered redirect / skip / cancel — the Accept-then-/home flow was a gap).

**Outstanding:**
- Task 4.1 [H] still pending Anton (GitHub App + 3 env vars). `/this-week` and `/consent` work end-to-end against the real bot once env vars are real. The smoke script (`pnpm tsx scripts/smoke-github-app.ts`) verifies the full credential chain.
- Roster `github_handle` backfill for the other 18 members (carries from Phase 1).

### Phase 7 — Contributions counter (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `c850ec8`.

**4 implementation tasks shipped + security-reviewer signoff, 259 unit + integration tests + 16 E2E pass, 100% coverage on `lib/contributions.ts` (spec §8 strict-list addition).**

- **Task 7.1** (commit `d3c4aa8`) — `lib/contributions.ts` calculator: `computeContributions({ commits, meetings, roster })` returns per-handle `{ projectCommits, adrsFiled, meetingsAttended, statusPosts }`. Bot commits (`warsaw-ai-bot`, `warsaw-ai-bot[bot]`) excluded; non-roster authors dropped; author casing normalized to lowercase before lookup. ADR / status path matching via anchored regex literals. 10 unit tests; 100/100/100/100 coverage.
- **Task 7.2** (commit `825c6da`) — `scripts/build-contributions.ts` parses git log via `execFileSync('git', ['log', '--pretty=format:COMMIT|%H|%ae|%aI', '--name-only'])` — no shell, all args hardcoded constants, cwd is build-time `REPO_ROOT`. Email→handle mapping is best-effort (GitHub noreply pattern + local-part heuristic); junk handles drop because non-roster authors are ignored downstream. Output written to gitignored `lib/__generated__/contributions.json`. `package.json` `precontributions: pnpm snapshot` chains; all `pre*` hooks now invoke `pnpm contributions` (which transitively runs snapshot). `lib/content-snapshot.ts` exposes `getContributions(handle)` with case-insensitive normalization + `ZERO_CONTRIBUTIONS` fallback. 4 new content-snapshot tests; both `lib/contributions.ts` and `lib/content-snapshot.ts` retain 100% coverage.
- **Task 7.3** (commit `b7773a1`) — `app/components/ContributionCard.tsx`: 4-cell grid (project commits, ADRs filed, meetings attended, status posts) with `tabular-nums` digits; dark-mode borders. 3 RTL tests with `afterEach(cleanup)`; 100/100/100/100.
- **Task 7.4** (commit `c850ec8`) — `<ContributionCard>` wired into `app/members/[slug]/page.tsx` between the handle line and profile section. Card renders unconditionally (zeros for members with no signals).

**Phase 7 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 25 files, 259 tests pass. **100% on `lib/{auth,classification,content-snapshot,contributions,env,github-app,markdown,rbac,status-reader,week}.ts` + `proxy.ts` + `app/actions/consent.ts` + `app/components/{ConsentModal,ContributionCard,PersonaPanel,SafeHtml,StatusEditor}.tsx`** (spec §8 strict-list + Phase 2-7 critical components). `app/actions/status.ts` 100% lines / 97.56% branches; `lib/governance.ts` 100% / 94.28% branches; filesystem readers above 80% gate. Overall 83.74% lines / 94.37% branches. `scripts/build-contributions.ts` at 0% (CLI tool, transitively tested via consumers — same convention as `snapshot-content.ts` and `smoke-github-app.ts`).
- `pnpm build` — 16 routes (5 static + 8 SSG + `/this-week` + `/consent` ƒ Dynamic) + 4 functions + `ƒ Proxy (Middleware)`.
- `pnpm e2e` — 16 tests pass: smoke + 3 auth-flow + 2 members + 3 archives + 3 status + 4 consent. (First run hit 3 dev-mode cold-start timing flakes — `members.spec.ts:22`, `status.spec.ts:36`, `consent.spec.ts:52`. All passed on `--retries=2`. No regression.)

**Security review (Task 7.2 execFileSync surface, per execution-plan §6.5):**
- security-reviewer dispatched after Task 7.2 commit. Verdict: **CLEAN** across subprocess invocation (no shell, hardcoded args, build-time cwd), git-log output parsing (file paths never used for fs ops, only regex-tested), email→handle mapping (anchored regexes — no ReDoS, empty/malformed inputs drop at the `result[author]` lookup in `lib/contributions.ts`), JSON output handling (Record<string, Contributions> with numeric fields only — no injection vector). `.gitignore` `lib/__generated__/` correctly excludes the generated JSON.

**Reviewer note (carried-forward Phase 6 caveat):**
- typescript-reviewer + code-reviewer not dispatched at this closeout to preserve Anton's monthly Claude usage budget (Phase 6 closeout exhausted both before completing). Self-review against the handoff §"Self-review fallback" checklist: spec §8 strict-list at 100% ✓, subprocess exec hardcoded-args-only ✓, RTL tests include `afterEach(cleanup)` ✓, no new public paths in proxy.ts ✓.

**Outstanding:**
- Task 4.1 [H] still pending Anton (GitHub App + 3 env vars). `/this-week` and `/consent` work end-to-end against the real bot once env vars are real; Phase 8 GDPR delete needs them too.
- Roster `github_handle` backfill for the other 18 members (carries from Phase 1).

### Phase 8 — GDPR mechanisms (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `0436755` (security-reviewer fix).

**4 implementation tasks shipped + 1 batched security-reviewer fix, 275 unit + integration tests + 19 E2E pass, 100% coverage retained on the spec §8 strict-list.**

- **Task 8.1** (commit `4132c56`) — `app/api/me/export/route.ts` GET endpoint returns JSON for the authenticated caller only: `{ exportedAt, handle, member { name, slug, githubHandle, profile, persona }, contributions, statuses[], currentWeek }`. 401 when no session; 403 when authenticated but not on roster. Statuses scanned across last 12 ISO weeks (deduped) and filtered by `member.slug` derived from the session handle — no other member's data can leak. Token acquisition mirrors `/this-week`'s `getInstallationToken`. 3 integration tests with mocked `auth`, `github-app`, `status-reader`, `content-snapshot`, `@octokit/auth-app`.
- **Task 8.2** (commit `98e0260`) — `app/api/me/delete/route.ts` POST endpoint deletes `community/members/<slug>.md` (profile, may be absent — null-skip) and `community/status/<week>/<slug>.md` across the last 52 weeks. `slug` derived from session via `findMemberByHandle` — never from request body, so cross-user deletion is structurally impossible (execution-plan §6.6). `GitHubAppError.kind === 'not_found'` during status delete is treated as idempotent (TOCTOU-tolerant); other errors propagate. Profile delete uses read-time SHA so the write is consistent with what `readFile` observed. 7 integration tests covering 401, 403, profile happy path, profile-absent skip, cross-user filter, not_found idempotency, non-not_found propagation.
- **Task 8.3** (commit `0c83b49`) — `app/components/GdprPanel.tsx` client component (Export downloads JSON via Blob URL; Delete prompts `window.confirm` before POSTing). Wired into `app/members/[slug]/page.tsx` conditional on `isSelf` (session-derived). The page now reads `auth()` and ships `dynamic = "force-dynamic"`; `generateStaticParams` retained as documentation. 6 RTL tests with `URL.createObjectURL` assigned directly (jsdom doesn't expose it as a spy-able prototype method) + `afterEach` `restoreAllMocks`. 100/80/100/100 (defensive `unknown error` branches uncovered).
- **Task 8.4** (commit `faefc2e`) — `e2e/gdpr.spec.ts` 3 tests: proxy gate redirects unauthenticated callers (`maxRedirects: 0` + Location header assertion — the route's own 401 branch is unreachable in normal traffic because proxy short-circuits before the route runs); JSON return for authenticated caller (tolerates 5xx when real bot creds are unset — Anton's Task 4.1 still pending); `GdprPanel` renders on viewer's own profile.
- **Security-reviewer fix** (commit `0436755`) — defense-in-depth `WEEK_REGEX` guard at top of `readWeekStatuses`. The reviewer flagged `dirPath = \`community/status/\${opts.week}\`` as a future-refactor risk: all current callers derive `week` from `weekFromDate` / `currentWeek` so not exploitable today, but a refactor that threaded user-supplied input through the function would silently introduce path injection. Throws `'invalid week token'` before octokit is invoked; `lib/status-reader.ts` retained at 100/100/100/100 with 1 new test covering 3 malformed inputs (path traversal, empty, single-digit).

**Phase 8 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 28 files, 275 tests pass. **100% on `lib/{auth,classification,content-snapshot,contributions,env,github-app,markdown,rbac,status-reader,week}.ts` + `proxy.ts` + `app/actions/consent.ts` + `app/components/{ConsentModal,ContributionCard,PersonaPanel,SafeHtml,StatusEditor}.tsx`** (spec §8 strict-list + Phase 2-7 critical components). `app/components/GdprPanel.tsx` 100% lines / 80% branches (defensive `unknown error` fallbacks, well above 80% gate). Overall 84.41% lines / 94.06% branches. New `app/api/me/{export,delete}/route.ts` not in coverage `include` (route handlers; tested via integration tests).
- `pnpm build` — 17 routes (`/members/[slug]` flipped from SSG to ƒ Dynamic because the page reads `auth()` for the GdprPanel conditional) + 5 functions + `ƒ Proxy (Middleware)`.
- `pnpm e2e` — 19 tests pass: smoke + 3 auth-flow + 2 members + 3 archives + 3 status + 4 consent + 3 GDPR.

**Security review (Phase 8 GDPR endpoints, per execution-plan §6.6):**
- security-reviewer dispatched after Task 8.4 commit. Verdict on `/api/me/export` + `/api/me/delete`: **CLEAN** on cross-user slug derivation (session-only), self-only filters before mapping, SHA-locked deletes, token sanitization, proxy auth gate. **MEDIUM** on `lib/status-reader.ts` line 36 — defense-in-depth gap on the week format (already shipped as `0436755`). **LOW** on commit message handle embedding (already mitigated by `normalizeHandle` in `lib/roster.ts`; no shell involvement at the GitHub Contents API).

**Reviewer note (carried-forward Phase 6 caveat):**
- typescript-reviewer + code-reviewer not dispatched at this closeout (Anton's monthly Claude usage budget). Self-review against the handoff §"Self-review fallback" checklist: spec §8 strict-list at 100% ✓, GDPR delete slug from session not body ✓, GDPR export response includes only caller's data ✓, no new public paths in proxy.ts ✓, RTL tests include `afterEach` cleanup + restore ✓.

**Outstanding:**
- Task 4.1 [H] still pending Anton (GitHub App + 3 env vars). The export+delete endpoints work end-to-end against the real bot once env vars are real; Phase 8 E2E tolerates the credential gap with a 5xx-also-acceptable assertion.
- Roster `github_handle` backfill for the other 18 members (carries from Phase 1).

### Phase 9 — Health metric (complete, 2026-05-01)

Last green commit (pending closeout): this entry's commit. Last code-only green: `18b0d9e`.

**2 implementation tasks shipped, 281 unit + integration tests pass, 100% coverage on `lib/health-metric.ts` (spec §8 strict-list addition). E2E not required for Phase 9 per execution-plan §4.2 (only phases 1, 2, 3, 5, 6, 8 ship E2E coverage).**

- **Task 9.1** (commit `1148fec`) — `lib/health-metric.ts` calculator: `computeHealthMetric({ roster, weekStatuses })` returns `HealthMetric { activePosters, totalMembers, ratio }`. Each member counted at most once per week (slug-deduped via `Set`); statuses whose slug is not on the roster ignored; `ratio = 0` when roster empty (no division-by-zero). Spec §2 goal 8, §10. 5 unit tests; 100/100/100/100.
- **Task 9.2** (commit `18b0d9e`) — `app/admin/health/page.tsx` admin-only page (`isAdmin` gate; redirect to `/home` for non-admins, `/login` for unauthenticated). Renders this-week's `activePosters / totalMembers` headline + 4-week trend table. Per execution-plan §9.2 — `export const revalidate = 60` set as documented. 4 `readWeekStatuses` calls fired in parallel via `Promise.all` (one per trend row, i=0 doubling as the current-week row) — 4 calls instead of plan's 5, also halves wall-clock time on cold caches.

**Phase 9 closeout green check (this commit):**
- `pnpm install --frozen-lockfile` — clean
- `pnpm lint` — 0 errors / 0 warnings
- `pnpm typecheck` — clean
- `pnpm test:coverage` — 29 files, 281 tests pass. **100% on `lib/{auth,classification,content-snapshot,contributions,env,github-app,health-metric,markdown,rbac,status-reader,week}.ts` + `proxy.ts` + `app/actions/consent.ts` + `app/components/{ConsentModal,ContributionCard,PersonaPanel,SafeHtml,StatusEditor}.tsx`** (spec §8 strict-list + Phase 2-9 critical components). `app/components/GdprPanel.tsx` 100%/80% (defensive `unknown error` fallbacks). Overall 84.6% lines / 94.16% branches (above 80% gate).
- `pnpm build` — 18 routes (5 static + 8 SSG + `/this-week` + `/consent` + `/members/[slug]` + `/home` + `/admin/health` ƒ Dynamic) + 5 functions (`/api/auth/[...nextauth]`, `/api/test-auth`, `/api/test-reset-status`, `/api/test-reset-consent`, `/api/me/export`, `/api/me/delete`) + `ƒ Proxy (Middleware)`.
- E2E intentionally skipped (Phase 9 not in §4.2 list). The 19 E2E from Phase 8 closeout cover the rest of the surface.

**Caching note (carries forward):**
- `/admin/health` ships as ƒ (Dynamic) because the server component reads `auth()` for the admin gate — that read forces dynamic rendering, which in turn makes `export const revalidate = 60` ineffective as Next 16's ISR cache key. The amendment is still applied (export present + behavior documented) and the surface is small (admin-only, 4 GitHub API calls per render, low refresh frequency expected) so the 5000/hr rate-limit budget is not at practical risk for v0.1. A future iteration that wants stricter caching can wrap the four `readWeekStatuses` calls in `unstable_cache` or migrate to Next 16's Cache Components, leaving the auth gate at the dynamic boundary.

**Reviewer note:**
- typescript-reviewer + code-reviewer not dispatched at this closeout (carry-forward Anton's monthly Claude usage budget). Self-review against the handoff §"Self-review fallback" checklist: spec §8 strict-list at 100% ✓, isAdmin gate runs before any GitHub API call ✓, no new public paths in proxy.ts ✓, ratio computation handles empty roster ✓.

**Outstanding:**
- Task 4.1 [H] still pending Anton (GitHub App + 3 env vars). `/admin/health` will return real metrics once env vars are real; until then the page either shows zero metrics (no statuses fetched because the bot can't authenticate) or fails at `getInstallationToken`.
- Roster `github_handle` backfill for the other 18 members (carries from Phase 1).

### Phase 10 — Pre-launch + ship (verification in progress, 2026-05-03)

Last green commit (pending closeout): this entry's commit. Last code-only green: `56e1cd3`.

**Task 10.1 — Spec §8 acceptance verification log (this entry).** Per-item status:

| § | Acceptance criterion | Status | Evidence / gap |
|---|---|---|---|
| 8.1 | All 19 roster members have `github_handle`; all can log in | **FAIL — ship-blocking** | `community/members/roster.md` has 1 of 19 backfilled (`@anton1rsod`); 2 organizer slots `*(TBD)*`; members table empty. Roster backfill PR required before 10.3. |
| 8.2 | Status flow works E2E incl. delete + concurrent edit | **VERIFIED** | `e2e/status.spec.ts` covers post → list → edit → delete + concurrent-edit conflict (Phase 5 + 6). 19 E2E green at SHA `56e1cd3`. |
| 8.3 | Contribution counter matches `git log` for ≥5 members | **DEFERRED + flagged** | (a) Blocked by 8.1 — only 1 backfilled handle is verifiable. (b) `lib/__generated__/contributions.json` currently shows `anton1rsod: { projectCommits: 0, adrsFiled: 0, meetingsAttended: 0, statusPosts: 0 }` despite 151 commits across the repo + 5 ADRs filed. Likely missing email/name→`github_handle` mapping or stale snapshot — investigate `lib/contributions.ts` + snapshot script before 10.3. Without a mapping the counter cannot pass for any member after backfill. |
| 8.4 | Persona panel renders for 4 personas in `persona-builder/personas/` | **PARTIAL → ship-blocking** | `app/components/PersonaPanel.tsx` covered by tests (Phase §8 strict-list 100%). 4 persona folders (`dmitry-b`, `heorhii-k`, `maksym-p`, `mark-s`) exist on disk (created 2026-04-30) but are **untracked** in git as of SHA `4f0c735`. Commit + visual render verification required before 10.3. |
| 8.5 | Lighthouse ≥ 90 on `/home`, `/members`, `/this-week` | **DEFERRED to post-deploy** | Preview URL `warsaw-ai-platform.vercel.app` returns **HTTP 401** (Vercel Deployment Protection); unauthenticated Lighthouse cannot crawl. Target routes also redirect to `/login` for unauthenticated GETs, so authenticated runs require Lighthouse `--extra-headers='{"Cookie":"next-auth.session-token=…"}'` against the production URL. Run plan in Task 10.2 below. |
| 8.6 | No PII in error logs | **PARTIAL → defer log scan to post-deploy** | Code path covered: Phase 8 `security-reviewer` dispatch over `/api/me/{export,delete}`; GDPR endpoints derive identity from session, never request body (per `CONSTRAINTS.md` self-review item). Runtime log review against the first 24-hour window of production traffic happens after 10.3. |
| 8.7 | Health metric viewable by admins | **VERIFIED** | `/admin/health` ships as ƒ Dynamic at `app/admin/health/page.tsx`; `isAdmin` gate runs before any GitHub API call (Phase 9 closeout, SHA `18b0d9e`). 100% coverage on `lib/health-metric.ts` (spec §8 strict-list addition). |

**Verification summary:** VERIFIED 2/7 (8.2, 8.7) · PARTIAL 2/7 (8.4, 8.6) · DEFERRED 2/7 (8.3, 8.5) · FAIL 1/7 (8.1).

**Pre-deploy ship gates (must clear before Task 10.3):**

1. **Roster backfill** — the 18 outstanding members get `github_handle` populated in `community/members/roster.md` (current: 1 of 19). Closes §8.1; unblocks §8.3 prerequisite.
2. **Persona commits** — the 4 untracked persona folders under `persona-builder/personas/` (`dmitry-b`, `heorhii-k`, `maksym-p`, `mark-s`) committed so §8.4 can be live-verified. PR or direct commit, Anton's call.
3. **Contributions counter audit** — confirm `lib/contributions.ts` snapshot logic actually maps git authors → roster handles. If the all-zeros result is a real logic gap, ship a §9.x amendment + bugfix; else document the intended scoping in the snapshot script comment so future readers don't trip on it. Without this, §8.3 cannot pass even after backfill.
4. **Task 4.1 production env vars** — `GITHUB_APP_ID` / `_PRIVATE_KEY` / `_INSTALLATION_ID` set on Vercel **production** scope (preview already has the test PEM). Verify with `vercel env ls` immediately before `vercel --prod`. Until set, `/this-week` + `/consent` + `/admin/health` + `/api/me/*` fail at installation-token acquisition in production.

**Task 10.2 — Lighthouse + perf — DEFERRED to post-10.3** with reasoning (per phase brief: "score ≥ 90 OR documented gap"):

- Preview URL gated at the Vercel edge (HTTP 401) → Lighthouse cannot crawl pre-deploy.
- Production routes (`/home`, `/members`, `/this-week`) require an authenticated session; unauthenticated runs would measure the `/login` redirect target rather than the actual page payload.
- **Run plan post-10.3:** Anton signs in to production once → captures the `next-auth.session-token` cookie value (DevTools → Application → Cookies) → runs:
  ```bash
  pnpm dlx lighthouse https://<prod-url>/home    --extra-headers='{"Cookie":"next-auth.session-token=<…>"}' --output=json --output-path=lighthouse-home.json    --view
  pnpm dlx lighthouse https://<prod-url>/members --extra-headers='{"Cookie":"next-auth.session-token=<…>"}' --output=json --output-path=lighthouse-members.json --view
  pnpm dlx lighthouse https://<prod-url>/this-week --extra-headers='{"Cookie":"next-auth.session-token=<…>"}' --output=json --output-path=lighthouse-this-week.json --view
  ```
- Score ≥ 90 on all three → proceed to 10.4. Score < 90 → apply plan.md L7543–L7547 fixes (`next/image`, `loading="lazy"`, `next.config.ts` cache headers), redeploy, re-run, then 10.4.
- Fallback if cookie injection is brittle: use Vercel "Protection Bypass for Automation" or an authenticated headless run via Playwright + Lighthouse-CI. Decision deferred to the post-10.3 chat.

**Tasks 10.3 + 10.4 — BLOCKED on the four pre-deploy ship gates above.** Auto-mode policy (per `CONSTRAINTS.md`) also pauses at `vercel --prod`, `git push --tags`, and `gh pr create` against main regardless of gate state — these need Anton at the keyboard.

**Phase 10 partial closeout (verification log only — no code changes in this commit):**
- `pnpm lint / typecheck / test:coverage / build` not re-run for this commit; doc-only edit. Last full green check at SHA `56e1cd3` (Phase 9 closeout): 281 unit/integration tests + 19 E2E green; coverage 84.6% lines / 94.16% branches; spec §8 strict-list at 100%.
- This entry establishes the v0.1.0 readiness state at SHA `4f0c735`.

**Outstanding (Phase 10 ship-readiness gate):**
- The 4 pre-deploy ship gates above (roster backfill, persona commits, contributions audit, prod env vars).
- Tailwind typography plugin still not installed; `prose` classes render as plain HTML (cosmetic, non-blocking).
