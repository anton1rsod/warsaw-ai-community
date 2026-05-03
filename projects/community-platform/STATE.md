# Community Platform — current state

> **Curated index of "right now."** CHANGELOG remains canonical for history; this file is the entry point a fresh chat reads first. Update at every phase closeout, in the same commit as the CHANGELOG entry.

**Last updated**: 2026-05-03 (v0.1.0 shipped)

## Snapshot

```yaml
last_green: b26a8c2                # fix: tolerate missing .git in build-contributions.ts
last_code_only_green: b26a8c2      # same; release commit is doc-only
phase: "10 complete (v0.1.0 shipped)"
branch: warsaw-org-and-stack-guide
tests: "294 unit/integration + 19 E2E"
overall_coverage: "84.73% lines / 93.7% branches  (gate: 80%)"
amendments_applied: "§9.2, §9.5–§9.18"
production: "https://warsaw-ai-community-platform.vercel.app"
tag: "community-platform-v0.1.0"
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
- **`COMMUNITY_NAME` / `COMMUNITY_SLUG` on production stored as sensitive** — `vercel env pull` returns empty quotes for them. Runtime is unaffected (Vercel injects sensitive vars at function startup). Re-set with `--no-sensitive` for ops inspectability.
- **Old preview alias** `warsaw-ai-platform.vercel.app` still points at a stale 2-day-old preview deploy; OAuth App Homepage URL also references it. Cosmetic only — production sign-in works.
- **Lighthouse perf scores not yet measured against production.** Plan documented in CHANGELOG Phase 10 §8.5 row (cookie-injected lighthouse against authenticated routes).
- **24-hour PII log scan** still pending (§8.6). Run after the platform sees a day of real traffic.
- **OAuth App callback URL is now production-only** (preview sign-in via OAuth would 404). Vercel Deployment Protection on preview makes this acceptable for now; revisit if you want preview sign-in (separate OAuth App per scope).
- **CI workflow drafted** at `.github/workflows/ci.yml` but uncommitted. Add as a follow-up PR after merge to main.
- Tailwind typography plugin not installed; `prose` classes render as plain HTML (visual-only).
- `typescript-reviewer` + `code-reviewer` agents both hit Anton's monthly Claude usage cap at Phase 6 + 7 closeouts. Self-review fallback (in `CONSTRAINTS.md`) is the standing pattern from Phase 6 onward.

## Next chat

**None for v0.1.** Post-ship work (v0.2+ invitation feature, follow-ups above, CI gate) belongs to a NEW spec/plan cycle.

## Production

- **URL:** https://warsaw-ai-community-platform.vercel.app
- **Tag:** `community-platform-v0.1.0` at SHA `b26a8c2`
- **Released:** 2026-05-03 via Vercel UI promote, then CLI redeploy after env-var fixes
- **Repo will flip to public** at v0.1.0 ship per spec §0.5 + ADR-0001 (MIT licensing)

## Update protocol

When you close a phase:

1. Update CHANGELOG with the phase entry (canonical history).
2. Update this file's `Snapshot`, `Spec §8 strict-list`, `Live routes`, `Blockers`, and `Next chat` sections.
3. Bump `Last updated`.
4. Commit both in the same `docs(community-platform): close Phase N` commit.

If STATE.md drifts from CHANGELOG, treat CHANGELOG as authoritative and refresh STATE.md.
