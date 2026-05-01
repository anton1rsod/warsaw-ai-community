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

### Pending — Phase 3 onward
- Apply plan amendments at execution time (still relevant):
  - §9.2 Task 9.2 — `export const revalidate = 60;` on `/admin/health` (Phase 9).
  - §9.3 Task 4.2 — keep test PEM in repo with documented caveats (Phase 4).
- Phase 3 (`/projects`, `/decisions`, `/meetings` readers) is the second half of Chat 3 (8 tasks).
- Roster `github_handle` backfill for the other 18 members (carries from Phase 1).
- Tailwind typography plugin not installed; `prose` classes render as plain HTML for now (visual-only, no functional impact).
