# Community Platform — current state

> **Curated index of "right now."** CHANGELOG remains canonical for history; this file is the entry point a fresh chat reads first. Update at every phase closeout, in the same commit as the CHANGELOG entry.

**Last updated**: 2026-05-16 (chat-15 v0.2.1-track `/consent` snapshot-stale recovery — `v0_2_1_consent_recover` row added; PR opened, awaiting merge)

## Snapshot

```yaml
last_green: 69362e9                 # main HEAD — merge of PR #13 (v0.2.0 release)
last_code_only_green: 89e732b       # CI fix (catch fetch rejection in loadPreview) — last code-touching commit on feat branch before merge
phase: "v0.2.0 shipped"             # 22 tasks across 4 phases complete; tag pushed
spec_sha: 740be8e                   # spec §11 (v0.1.1) — frozen
v0_2_spec_sha: 95197dc              # spec §12 brainstorm merged via PR #11
v0_2_plan_sha: e700d19              # v0.2.0-plan.md merged via PR #12
plan_sha: 2201dd9                   # v0.1.1-plan.md (frozen)
branch: main                        # post-merge; feat/community-platform-v0-2-0 is now historical
tests: "562 unit/integration + 26 E2E (v0.1.1) + 6 E2E (v0.2 — 5 passing, 1 documented skip)"
overall_coverage: "90% lines / 94% branches  (gate: 80%)"
amendments_applied: "§9.2, §9.5–§9.18"
production: "https://warsaw-ai-community-platform.vercel.app"
tag: "community-platform-v0.2.0"   # at merge SHA 69362e9
previous_tag: "community-platform-v0.1.1"   # at SHA 036695c
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
ci_workflow: "2026-05-04 — .github/workflows/ci.yml shipped via PR #4, merged to main at SHA ef19b65; Build step uses stub env vars (run bb959a0 green); workflow now runs on every PR touching projects/community-platform/**, community/**, persona-builder/personas/**/*.public.md, or .github/workflows/ci.yml itself"
pii_log_scan_24h: "2026-05-04 — chat-10 Option G; vercel logs --environment=production --since=24h returned 6 entries (low traffic — Anton's smoke test only); zero matches for token/email/cookie patterns; one 'error' log was Auth.js InvalidCheck (PKCE flow interrupted) with stack frames but no PII. Re-run when real traffic accumulates."
lighthouse_baseline_login: "2026-05-04 — chat-10 Option H; lighthouse 12.8.2 against production /login. Mobile: Performance 99 / Accessibility 100 / Best Practices 96 / SEO 91, LCP 1.5s, TBT 60ms, CLS 0. Desktop: Performance 100 / same others. All categories exceed spec §10 90+ budget. Authenticated-route measurement deferred (cookie-handoff). Reports at projects/community-platform/perf-baselines/."
repo_visibility: "2026-05-04 — chat-10 Option B; flipped from private to public via `gh repo edit --visibility public --accept-visibility-change-consequences` per ADR-0001. Pre-flip secret scan against full git history was clean (zero realistic-looking PEM/OAuth-secret/NEXTAUTH_SECRET/INVITE_SECRET/AWS-key/JWT/Bearer/api-key matches; only test placeholders + allowlisted test PEM)."
branch_protection_main: "2026-05-04 — chat-10 Option B; legacy branch-protection rule on main: allow_force_pushes=false, allow_deletions=false, enforce_admins=false. NO PR-required gate yet — user-owned repos can't use `bypass_pull_request_allowances` (org-only via legacy API), and modern Rulesets API needs warsaw-ai-bot's numeric App ID (not exposed via gh OAuth scope). Follow-up: paste App ID from GitHub Settings → Developer settings → GitHub Apps → warsaw-ai-bot, then create a Ruleset with `bypass_actors: [{actor_id: <id>, actor_type: Integration, bypass_mode: always}]` + `pull_request: required`."
v0_2_ship: "2026-05-16 SHA 69362e9 — PR #13 merged to main; tag community-platform-v0.2.0 pushed; CI green (lint+tsc+test+build 1m11s); Vercel preview pass. Production smoke deferred to user-side execution (sign in as anton1rsod → /me/edit → save → verify commit; /projects/community-platform → Top Contributors renders; Ask GBrain renders iff GBRAIN_BASE_URL set). Coverage: §12.7 strict-list 100% lines (save-profile.ts, profile-editor.ts, preview-markdown/route.ts, ProfileEditor.tsx, TopContributors.tsx, AskGBrainButton.tsx). 16 hardening IDs (H14–H29) grep-verified. Security review 0 CRITICAL / 0 HIGH (Next.js bumped 16.2.4 → 16.2.6 to patch middleware bypass CVEs)."
v0_2_smoke_unauth: "2026-05-16 (chat-14) — HTTP-layer smoke green. Tag `community-platform-v0.2.0` → SHA `69362e9` verified via `git rev-parse`. PR #13 MERGED to main at 2026-05-16T16:49:25Z (gh pr view 13). Production deploy `aohvw75w8` Ready in 42s, 10m before smoke (vercel ls --prod). Public route `/login` 200 + cache HIT + 7529B (Next.js routed via `x-matched-path: /login`). Auth-gated paths `/`, `/members`, `/projects/community-platform`, `/me/edit`, `/api/preview-markdown` all 307→/login (proxy.ts gate working including v0.2.0's `/me/edit` route — proves new build is serving). Cannot HTTP-distinguish 'route registered' from 'route missing' because proxy gates all non-PUBLIC paths uniformly (good security posture). Auth-gated user flows (sign-in → /me/edit → save → verify commit on main; TopContributors render on /projects/community-platform; AskGBrainButton render iff GBRAIN_BASE_URL set) still PENDING Anton — separate row when run. `GBRAIN_BASE_URL` env var status NOT verified (`vercel env ls production` blocked by harness; safe-by-design — leave as user-side check)."
v0_2_1_consent_recover: "2026-05-16 (chat-15) — `/consent` snapshot-stale recovery shipped on branch `fix/community-platform-consent-recover` (HEAD `1672178`); closes the edge case explicitly deferred from chat-14 (proxy hotfix `d0e60e1`): profile committed but build-time content snapshot rebuild pending (60-90s window). New route handler `/api/consent/recover` sets `waic-consented` cookie on its own response — Route Handlers are the only Next 16 surface that can mutate cookies on a redirect (Server Components cannot). `/consent/page.tsx` now redirects to the recovery endpoint when `hasConsent()` is true; the chat-14 hotfix path (proxy re-seeds cookie when `member.profile` in snapshot) remains the fast path for the common case. Tests: +5 integration + 2 unit + 1 E2E (575 + 32 total green); also fixes pre-existing E2E breakage in 'first-time roster member redirects to /consent' (was using anton1rsod whose profile.md was committed at SHA `29954f4` 2026-05-03; switched to `markspas` whose profile is genuinely absent from snapshot). Playwright MCP browser drive confirmed the 4-hop redirect chain (`/home 307 → /consent 307 → /api/consent/recover 307 → /home 200`); cookie persists across reloads. PR opened, awaiting merge."
```

## Spec §8 strict-list — 100% coverage

**v0.1 strict-list (all 100% lines):**
- `lib/{auth,classification,content-snapshot,contributions,env,github-app,health-metric,markdown,rbac,status-reader,week}.ts`
- `proxy.ts`
- `app/actions/consent.ts`
- `app/components/{ConsentModal,ContributionCard,PersonaPanel,SafeHtml,StatusEditor}.tsx`
- `app/components/GdprPanel.tsx` — 100% lines / 80% branches (defensive `unknown error` fallbacks; well above 80% gate)

**v0.1.1 additions:** `lib/invitations.ts` — 100% lines / 93% branches (7 unreachable post-guard fallbacks, accepted).

**v0.2.0 additions (per §12.7):**
- `lib/profile-editor.ts` — 100/100/100
- `app/actions/save-profile.ts` — 100/100/100
- `app/api/preview-markdown/route.ts` — 100/100/100
- `app/components/{ProfileEditor,TopContributors,AskGBrainButton}.tsx` — 100% lines (ProfileEditor: 91.66% functions / 94% branches, acceptable per ≥80% allowance)

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
- ~~**Lighthouse perf scores not yet measured against production**~~ — RESOLVED 2026-05-04 (chat-10 Option H). Anonymous-route baseline at `projects/community-platform/perf-baselines/`: Performance 99/100 mobile, 100/100 desktop. Authenticated-route measurement still deferred (needs cookie handoff per `perf-baselines/README.md`).
- ~~**24-hour PII log scan still pending**~~ — RUN 2026-05-04 (chat-10 Option G). Zero token/email/cookie leaks across the 24h window. **Caveat:** only 6 logs captured (low traffic — Anton's smoke test only); structural verification rather than stress test. Re-run when real traffic accumulates per spec §8.6.
- **OAuth App callback URL is now production-only** (preview sign-in via OAuth would 404). Vercel Deployment Protection on preview makes this acceptable for now; revisit if you want preview sign-in (separate OAuth App per scope).
- ~~**CI workflow drafted but uncommitted**~~ — RESOLVED 2026-05-04 (chat-10 Option E). Workflow shipped via PR #4, merged at SHA `ef19b65`. First run failed because `next build` page-data collection imports `lib/env.ts` (Zod-validated at module init); fixed in fix-up commit `bb959a0` adding stub env vars to the Build step only. Run `bb959a0` green pre-merge.
- Tailwind typography plugin not installed; `prose` classes render as plain HTML (visual-only).
- `typescript-reviewer` + `code-reviewer` agents both hit Anton's monthly Claude usage cap at Phase 6 + 7 closeouts. Self-review fallback (in `CONSTRAINTS.md`) is the standing pattern from Phase 6 onward.

## Next chat

**Chat 9 (DONE):** v0.1.1 invitation feature implementation via `superpowers:subagent-driven-development`. All 37 tasks shipped: PR #2 merged at `036695c`; tag `community-platform-v0.1.1` pushed; production deploy `fg6rfweki` Ready; ALREADY-MEMBER smoke verified by Anton on production.

**Chat 8 (DONE):** v0.1.1 plan-writing via `superpowers:writing-plans`. Produced [`v0.1.1-plan.md`](v0.1.1-plan.md) at SHA `2201dd9` — 5858 lines, 37 tasks, 191 checkboxes, all 13 hardenings mapped to specific test files via `describe("H<n>:")` prefix.

**Chat 7 (DONE):** v0.1.1 invitation feature brainstorm via `superpowers:brainstorming`. Produced spec §11 (lines 457-1071, ~617 lines) at SHA `740be8e`. All Q1-Q7 decisions locked; 13 hardenings (H1-H13) numbered for testable contract.

**Chat 10 handoff:** [`docs/specs/2026-05-04-community-platform-v0-1-1-shipped-followups-handoff.md`](../../docs/specs/2026-05-04-community-platform-v0-1-1-shipped-followups-handoff.md). Menu of 8 small options (A–H) — Anton picks scope at chat start. **Chat 10 picked everything except A** (B + C + D + E + F + G + H). All seven done or merged-pending in chat 10.

**Chat 11 (DONE):** v0.2 brainstorm via `superpowers:brainstorming`. Spec §12 lines 1075-1569 (~495 lines incl. Vercel/Next-16 reality-pass amendments) merged via PR #11 at SHA `95197dc`. Locked Q1-Q5 + D1-D9: primary thrust = Profile editor (B) + thin (A) contribution surfacing + GBrain link tag-along; **stays 100% git** (§6.1 dormant); single v0.2.0 release; **16 hardenings H14–H29** (continues §11's H1–H13).

**Chat 12 (DONE):** v0.2.0 plan-writing via `superpowers:writing-plans`. `projects/community-platform/v0.2.0-plan.md` (3156 lines, 22 tasks across 4 phases) merged via PR #12 at SHA `e700d19`. Open spec questions locked with rationale: O1 = server-side `/api/preview-markdown` route; O2 = sibling file `lib/__generated__/project-contributions.json`; O3 = `parseFrontmatter` + `serializeFrontmatter` in `lib/profile-editor.ts` via `gray-matter`.

**Chat 13 (DONE):** v0.2.0 implementation via `superpowers:subagent-driven-development`. 22 tasks shipped: PR #13 merged to main at SHA `69362e9`; tag `community-platform-v0.2.0` pushed. 562 unit/integration + 5/6 E2E green (Scenario 2 documented skip — concurrent-edit user-flow needs client-side SHA passthrough, v0.2.1). Security review 0 CRITICAL / 0 HIGH (Next.js bumped 16.2.4 → 16.2.6 for middleware bypass CVEs). Production smoke: deferred to user-side post-merge (sign in → /me/edit → save → verify commit; project page TopContributors + AskGBrain rendering).

**Chat 14 (DONE):** v0.2.0 post-ship hotfix — `/home` ↔ `/consent` redirect loop. PR #15 merged at SHA `592b2cb`; `proxy.ts` re-seeds `waic-consented` cookie inline when `member.profile` in snapshot. Covers the common case (cookie cleared after profile committed long ago). Edge case (snapshot rebuild pending) explicitly deferred to chat-15.

**Chat 15 (DONE):** v0.2.1-track `/consent` snapshot-stale recovery via `/api/consent/recover` Route Handler. Branch `fix/community-platform-consent-recover` (HEAD `1672178`). Closes chat-14's deferred edge case; both code paths (proxy hotfix for snapshot-fresh + recovery route for snapshot-stale) preserved as defense in depth. Tests: 575 unit/integration + 32 E2E green. Verified via Playwright MCP browser drive (4-hop redirect chain). PR open, awaiting merge + Vercel preview deploy.

**Chat 11 handoff:** [`docs/specs/2026-05-04-community-platform-v0-2-brainstorm-handoff.md`](../../docs/specs/2026-05-04-community-platform-v0-2-brainstorm-handoff.md).
**Chat 13 handoff:** [`docs/specs/2026-05-16-community-platform-v0-2-implementation-handoff.md`](../../docs/specs/2026-05-16-community-platform-v0-2-implementation-handoff.md).

**Pending follow-ups (mapped to chat-10 options):**
- **A — Mark Spasonov backfill** (PR #3 open as Draft on `chore/mark-spasonov-backfill`): placeholders `@MARK_TELEGRAM_HANDLE_TBD` + `MARK_GIT_EMAIL_TBD` need real values from Mark out-of-band; mark Ready + merge. **Only chat-10 option NOT picked** — explicit Anton call.
- ~~**B — repo public flip + branch protection**~~ — PARTIAL 2026-05-04 (this chat). Repo flipped to public per ADR-0001 (secret scan clean). Branch protection on `main` set to: force-push=false, deletions=false. **PR-required gate deferred** — needs warsaw-ai-bot's numeric App ID for the modern Rulesets API (legacy `bypass_pull_request_allowances` is org-only and doesn't apply to user-owned repos). One-line follow-up commit lands the ruleset once the App ID is available.
- ~~**C — `COMMUNITY_NAME`/`SLUG` `--no-sensitive`**~~ — DONE 2026-05-04. Both vars re-set on production + preview with `--no-sensitive`.
- ~~**D — Persona slug↔folder mismatch**~~ — DONE 2026-05-04 (this chat). PR #7 — `mark-s` → `mark-spasonov`, `maksym-p` → `maksym-pavlenko`; forward-defending invariant test added.
- ~~**E — CI workflow merge**~~ — DONE 2026-05-04. PR #4 merged at SHA `ef19b65`.
- ~~**F — v0.2 brainstorm**~~ — HANDOFF DRAFTED 2026-05-04 (chat-11 invocation queued via `superpowers:brainstorming`). PR #6.
- ~~**G — 24-hour PII log scan**~~ — RUN 2026-05-04. Zero leaks; structural-verification only (low traffic).
- ~~**H — Lighthouse perf measurement**~~ — DONE 2026-05-04. /login Performance 99 mobile / 100 desktop; auth-routes deferred.
- **First real invitation** (Anton's choice): mint for one of the 17 outstanding members; verify ledger gains a row after redemption — separate from chat scope.

## Production

- **URL:** https://warsaw-ai-community-platform.vercel.app
- **Tag:** `community-platform-v0.2.0` at merge SHA `69362e9`
- **Previous tags:** `community-platform-v0.1.1` (`036695c`, deploy `fg6rfweki`), `community-platform-v0.1.0` (`b26a8c2`)
- **Released:** 2026-05-16 via PR #13 merge → Vercel auto-deploy
- **Repo is public** as of 2026-05-04 (chat-10 Option B) per spec §0.5 + ADR-0001 (MIT licensing)
- **Branch protection on `main`:** force-push blocked, deletion blocked. PR-required gate is a follow-up (needs warsaw-ai-bot App ID for Rulesets API bypass).

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
