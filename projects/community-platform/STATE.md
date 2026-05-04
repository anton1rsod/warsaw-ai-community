# Community Platform — current state

> **Curated index of "right now."** CHANGELOG remains canonical for history; this file is the entry point a fresh chat reads first. Update at every phase closeout, in the same commit as the CHANGELOG entry.

**Last updated**: 2026-05-04 (chat-10 follow-ups: Option C closed; Option E PR #4 open + green)

## Snapshot

```yaml
last_green: 036695c                # main HEAD — merge of PR #2 (v0.1.1 release)
last_code_only_green: 399e1a8      # security-reviewer M1+M2 fixes (last code-touching commit)
phase: "v0.1.1 shipped"
spec_sha: 740be8e                   # spec §11 + final-pass hardening fixes
plan_sha: 2201dd9                   # v0.1.1-plan.md (37 tasks across 3 phases)
branch: main                        # post-merge; phase-10-followups is now historical
tests: "475 unit/integration + 26 E2E"
overall_coverage: "88% lines / 92% branches  (gate: 80%)"
amendments_applied: "§9.2, §9.5–§9.18"
production: "https://warsaw-ai-community-platform.vercel.app"
tag: "community-platform-v0.1.1"   # at merge SHA 036695c, deployed to prod (fg6rfweki)
```

## Last verified

> Tracks state checks that future chats can SKIP re-running if recent (< ~7 days) and current task doesn't depend on the verified surface. Update when a check is performed; don't update without performing it.

```yaml
prod_env_vars: "2026-05-03 SHA 1b063ce — all 13 set, no placeholders, smoke green"
oauth_callback_url: "2026-05-03 — production-only callback registered; preview OAuth disabled by design"
github_app_install: "2026-05-03 — warsaw-ai-bot installed on anton1rsod/warsaw-ai-community"
github_app_credentials: "2026-05-03 — scripts/smoke-github-app.ts returns OK end-to-end against real GitHub API"
build_chain_no_git: "2026-05-03 — build-contributions.ts try/catch fix landed; CLI deploys succeed (b26a8c2)"
contributions_alias_file: "2026-05-03 — community/members/git-email-aliases.md seeded with anton@rsod.solutions → anton1rsod"
vercel_root_dir: "2026-05-03 — .vercel/ at repo root; rootDirectory=projects/community-platform; CLI deploys must run from repo root"
prod_url_alias: "2026-05-03 — warsaw-ai-community-platform.vercel.app pointing at deploy fq36nrp5w"
production_runtime: "2026-05-03 — full credential chain operational under real traffic (consent commit 29954f4 + status post 5b5699b + admin/health rendering 1/2)"
phase_11_1_lib_primitives: "2026-05-03 SHA 47f7045 — lib/invitations.ts 100% lines/functions/statements (branches 92.55% — 7 unreachable post-guard fallbacks); H1, H2, H3, H7, H8, H9, H10, H11, H12, H13 tested; 406 unit tests green"
phase_11_2_surfaces_actions: "2026-05-03 SHA aec8328 — all 13 hardenings (H1-H13) tested; 5 of 6 strict-list additions 100% lines/branches; lib/invitations.ts 100% lines (branch gap = post-guard unreachable fallbacks, accepted); pnpm build green; 467 unit/integration tests passing"
phase_11_3_e2e_security_review: "2026-05-04 SHA 399e1a8 — 7 E2E scenarios (26 total); security review 0 CRITICAL / 0 HIGH; M1+M2 fixed inline; H1-H13 grep returns 16 hits across 13 unique IDs"
invite_secret_prod: "2026-05-04 — set, sensitive, 32+ bytes (Vercel CLI add)"
invite_secret_preview: "2026-05-04 — set, sensitive, distinct from prod, gitBranch=null (all preview branches)"
preview_env_branch_scope: "2026-05-04 — 13 vars re-scoped from warsaw-org-and-stack-guide → all preview branches via Vercel REST API PATCH on gitBranch field (no value handling)"
community_vars_no_sensitive: "2026-05-04 — COMMUNITY_NAME + COMMUNITY_SLUG re-set with --no-sensitive on production AND preview (gitBranch=null); env pull returns 'Warsaw AI Community' / 'warsaw-ai' on both scopes"
ci_workflow: "2026-05-04 — .github/workflows/ci.yml shipped via PR #4 (chore/community-platform-ci-workflow); Build step uses stub env vars (run bb959a0 green); awaiting merge to main"
```

## Spec §8 strict-list — 100% coverage

- `lib/{auth,classification,content-snapshot,contributions,env,github-app,health-metric,markdown,rbac,status-reader,week}.ts`
- `proxy.ts`
- `app/actions/consent.ts`
- `app/components/{ConsentModal,ContributionCard,PersonaPanel,SafeHtml,StatusEditor}.tsx`
- `app/components/GdprPanel.tsx` — 100% lines / 80% branches (defensive `unknown error` fallbacks; well above 80% gate)

## Live routes

18 routes total. Key shapes:

- `ƒ /admin/health` (Dynamic, admin-only — `auth()` forces dynamic; `revalidate=60` documentation-only per pattern 8 in `docs/playbooks/recurring-plan-defects.md`)
- `ƒ /api/me/{export,delete}` (GDPR — session-derived slug; cross-user deletion structurally impossible)
- `ƒ /members/[slug]` (flipped from SSG to Dynamic in Phase 8 because the page reads `auth()` for the GdprPanel conditional)
- `ƒ /this-week`, `ƒ /consent`, `ƒ /home` (Phase 5–6)
- 8 SSG routes for `/projects/[slug]`, `/decisions/[slug]`, `/meetings/[slug]`
- 5 static routes (`/`, `/login`, `/no-access`, `/members`, `/projects`, `/decisions`, `/meetings`, `/_not-found`)
- `ƒ Proxy (Middleware)` (proxy.ts gates all non-PUBLIC_PATHS routes)

## Blockers — none for v0.1.0 (all cleared in Phase 10)

- ~~**[H] Task 4.1**~~ — Cleared 2026-05-03. Real `warsaw-ai-bot` GitHub App credentials set on Vercel production scope; smoke verified via `scripts/smoke-github-app.ts` + live consent + status writes.
- ~~**Roster backfill**~~ — Reframed to v0.2+ scope. Founder + Mark Spasonov on roster (2 of 19); rest deferred to a future "git-based personal-invitation self-registration" feature (memory: `project_community_platform_invitation_feature.md`).

## Known caveats (non-blocking, post-v0.1.0 follow-ups)

- **Persona slug↔folder mismatch:** `Mark Spasonov` slugifies to `mark-spasonov` but his persona folder is `mark-s` → `PersonaPanel` won't render his persona. Same for `Maksym Pavlenko` (would be `maksym-pavlenko` vs `maksym-p`) when added later. Resolution options: rename folders to display-name slugs, or add a `persona_id` lookup mechanism in `lib/roster.ts` analogous to `lib/git-email-aliases.ts`.
- ~~**`COMMUNITY_NAME` / `COMMUNITY_SLUG` on production stored as sensitive**~~ — RESOLVED 2026-05-04 (chat-10 Option C). Both vars re-set with `--no-sensitive` on production + preview; `vercel env pull` now returns the actual values on both scopes. (Caveat surfaced a CLI v52 quirk on the preview side — see `GOTCHAS.md` row 8.)
- **Old preview alias** `warsaw-ai-platform.vercel.app` still points at a stale 2-day-old preview deploy; OAuth App Homepage URL also references it. Cosmetic only — production sign-in works.
- ~~**Preview deploys are broken on every branch except `warsaw-org-and-stack-guide`**~~ — RESOLVED 2026-05-04. All 13 preview env vars re-scoped from `warsaw-org-and-stack-guide` → `gitBranch=null` (all preview branches) via Vercel REST API PATCH (no value handling needed). Recovery method (PATCH `/v9/projects/{id}/env/{envId}` with `{"gitBranch": null}`) is the canonical fix for branch-scoped-env-blocks-preview-builds — preferred over rm/add cycle because it leaves encrypted values untouched. Add row to GOTCHAS.md if pattern recurs.
- **Lighthouse perf scores not yet measured against production.** Plan documented in CHANGELOG Phase 10 §8.5 row (cookie-injected lighthouse against authenticated routes).
- **24-hour PII log scan** still pending (§8.6). Run after the platform sees a day of real traffic.
- **OAuth App callback URL is now production-only** (preview sign-in via OAuth would 404). Vercel Deployment Protection on preview makes this acceptable for now; revisit if you want preview sign-in (separate OAuth App per scope).
- ~~**CI workflow drafted but uncommitted**~~ — IN FLIGHT 2026-05-04 (chat-10 Option E). Workflow shipped via PR #4 on `chore/community-platform-ci-workflow`; first run failed because `next build` page-data collection imports `lib/env.ts` (Zod-validated at module init); fixed in fix-up commit `bb959a0` adding stub env vars to the Build step only. Run `bb959a0` green. Awaiting merge to main.
- Tailwind typography plugin not installed; `prose` classes render as plain HTML (visual-only).
- `typescript-reviewer` + `code-reviewer` agents both hit Anton's monthly Claude usage cap at Phase 6 + 7 closeouts. Self-review fallback (in `CONSTRAINTS.md`) is the standing pattern from Phase 6 onward.

## Next chat

**Chat 9 (DONE):** v0.1.1 invitation feature implementation via `superpowers:subagent-driven-development`. All 37 tasks shipped: PR #2 merged at `036695c`; tag `community-platform-v0.1.1` pushed; production deploy `fg6rfweki` Ready; ALREADY-MEMBER smoke verified by Anton on production.

**Chat 8 (DONE):** v0.1.1 plan-writing via `superpowers:writing-plans`. Produced [`v0.1.1-plan.md`](v0.1.1-plan.md) at SHA `2201dd9` — 5858 lines, 37 tasks, 191 checkboxes, all 13 hardenings mapped to specific test files via `describe("H<n>:")` prefix.

**Chat 7 (DONE):** v0.1.1 invitation feature brainstorm via `superpowers:brainstorming`. Produced spec §11 (lines 457-1071, ~617 lines) at SHA `740be8e`. All Q1-Q7 decisions locked; 13 hardenings (H1-H13) numbered for testable contract.

**Chat 10 handoff:** [`docs/specs/2026-05-04-community-platform-v0-1-1-shipped-followups-handoff.md`](../../docs/specs/2026-05-04-community-platform-v0-1-1-shipped-followups-handoff.md). Menu of 8 small options (A–H) — Anton picks scope at chat start. **Chat 10 picked C + E:** Option C closed; Option E in flight (PR #4 open + green at SHA `bb959a0`).

**Pending follow-ups (mapped to chat-10 options):**
- **A — Mark Spasonov backfill** (PR #3 open as Draft on `chore/mark-spasonov-backfill`): placeholders `@MARK_TELEGRAM_HANDLE_TBD` + `MARK_GIT_EMAIL_TBD` need real values from Mark out-of-band; mark Ready + merge.
- **B — Branch protection on `main`**: PR-required + warsaw-ai-bot bypass + no force-push. **Prerequisite:** repo public flip per ADR-0001 (or GitHub Pro upgrade) — branch protection is gated on private-repo Free tier.
- ~~**C — `COMMUNITY_NAME`/`SLUG` `--no-sensitive`**~~ — DONE 2026-05-04 (this chat). Both vars re-set on production + preview with `--no-sensitive`.
- **D — Persona slug↔folder mismatch** (Łukasz/Maksym).
- ~~**E — CI workflow merge**~~ — IN FLIGHT 2026-05-04 (this chat). PR #4 open at SHA `bb959a0`, run green. Awaiting merge to main.
- **F — v0.2 brainstorm** (project / contribution tracking — fresh `superpowers:brainstorming` chat).
- **G — 24-hour PII log scan** (spec §8.6 carryover from v0.1.0).
- **H — Lighthouse perf measurement** against production (spec §10 carryover).
- **First real invitation** (Anton's choice): mint for one of the 17 outstanding members; verify ledger gains a row after redemption — separate from chat scope.

## Production

- **URL:** https://warsaw-ai-community-platform.vercel.app
- **Tag:** `community-platform-v0.1.1` at merge SHA `036695c`, deploy `fg6rfweki`
- **Previous tag:** `community-platform-v0.1.0` at SHA `b26a8c2`
- **Released:** 2026-05-04 via PR #2 merge → Vercel auto-deploy
- **Repo flips to public** at v0.1.0 ship per spec §0.5 + ADR-0001 (MIT licensing)

## Update protocol

When you close a phase:

1. Update CHANGELOG with the phase entry (canonical history).
2. Update this file's `Snapshot`, `Last verified`, `Spec §8 strict-list`, `Live routes`, `Blockers`, and `Next chat` sections.
3. Bump `Last updated`.
4. If you observed a non-obvious operational gotcha during the phase, append a row to `GOTCHAS.md`.
5. Commit STATE + CHANGELOG + GOTCHAS in the same `docs(community-platform): close Phase N` commit.

If STATE.md drifts from CHANGELOG, treat CHANGELOG as authoritative and refresh STATE.md.

## Where to find things

| Need | Read |
|---|---|
| Right-now state of play | `STATE.md` (this file) — read first |
| What this chat owns | `phase-N-brief.md` (the per-phase brief) |
| Locked rules | `CONSTRAINTS.md` |
| Operational gotchas (env, CLI, deploy, auth) | `GOTCHAS.md` |
| Recurring code-level plan defects | `../../docs/playbooks/recurring-plan-defects.md` |
| Phase tasks | `plan.md` — read by line range from the phase brief |
| Plan amendments | `execution-plan.md §9` |
| History | `CHANGELOG.md` — read on demand only |
| Cold-pickup reference | `HANDOFF.md` — pre-Phase 0 archive; rarely needed |
