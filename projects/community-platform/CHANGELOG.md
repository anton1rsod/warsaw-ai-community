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

### Pending — Phase 1 onward
- Apply plan amendments at execution time:
  - §9.1 Task 1.1 — header-aware roster parser (skip `*(TBD)*` rows).
  - §9.2 Task 9.2 — `export const revalidate = 60;` on `/admin/health`.
  - §9.3 Task 4.2 — keep test PEM in repo with documented caveats.
  - **§9.5 (NEW)** Plan pinned `next 15.0.4`; superseded to `next 16.2.4` per commit `528f24c`. Phase 1 NextAuth v5 beta selection should target a beta release that's been tested against Next 16 — verify before Task 1.5.
  - **§9.6 (NEW)** Preview env vars are scoped to branch `warsaw-org-and-stack-guide`. To deploy preview from any other branch in Phase 1+, either re-add env vars for that branch or omit the branch when adding (requires bypassing Vercel Claude Code plugin's `git_branch_required` intercept).
- Roster `github_handle` backfill for the other 18 members (Phase 1 prerequisite for non-founder logins).
