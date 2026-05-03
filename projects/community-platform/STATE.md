# Community Platform — current state

> **Curated index of "right now."** CHANGELOG remains canonical for history; this file is the entry point a fresh chat reads first. Update at every phase closeout, in the same commit as the CHANGELOG entry.

**Last updated**: 2026-05-03 (post-Phase 9 closeout)

## Snapshot

```yaml
last_green: 56e1cd3                # docs(community-platform): close Phase 9
last_code_only_green: 18b0d9e      # Task 9.2 /admin/health page
phase: "9 complete  →  10 next"
branch: warsaw-org-and-stack-guide
tests: "281 unit/integration + 19 E2E"
overall_coverage: "84.6% lines / 94.16% branches  (gate: 80%)"
amendments_applied: "§9.2, §9.5–§9.18"
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

## Blockers (carry forward; both required for Phase 10)

- **[H] Task 4.1** — `warsaw-ai-bot` GitHub App + `GITHUB_APP_ID` / `_PRIVATE_KEY` / `_INSTALLATION_ID` on Vercel **preview AND production**. Until set: `/this-week` + `/consent` + `/admin/health` + `/api/me/*` fail at installation-token acquisition. Preview is currently using a self-generated test PEM (`tests/fixtures/test-app.private-key.pem`) that signs JWTs GitHub rejects.
- **Roster `github_handle` backfill** — 18 of 19 members are `*(TBD)*`. Required for non-founder logins. v0.1 ship-blocking.

## Known caveats (non-blocking)

- Tailwind typography plugin not installed; `prose` classes render as plain HTML (visual-only).
- Preview env vars scoped to branch `warsaw-org-and-stack-guide` (per amendment §9.6) — broaden if any other branch needs preview deploys.
- `typescript-reviewer` + `code-reviewer` agents both hit Anton's monthly Claude usage cap at Phase 6 + 7 closeouts. Self-review fallback (in `CONSTRAINTS.md`) is the standing pattern from Phase 6 onward.

## Next chat

- **Chat 6** — Phase 10 (Pre-launch + ship), 4 tasks, ~0.5 day. Heavy Anton blockers on 10.3 (`vercel --prod`) and 10.4 (tag + announce).
- Handoff (v2 lean): `docs/specs/2026-05-03-community-platform-phase-10-handoff.md`.
- Per-phase brief: `projects/community-platform/phase-10-brief.md`.

## After Chat 6

- v0.1.0 ships. The `[Unreleased]` section in CHANGELOG flips to `[0.1.0] — <date>`.
- This file should update to `phase: "10 complete (v0.1.0 shipped)"` with `next_chat: none`.
- Any post-ship work (roster backfill, GBrain v0.2 kickoff, dashboard) belongs to a NEW spec/plan cycle, not the v0.1 cycle.

## Update protocol

When you close a phase:

1. Update CHANGELOG with the phase entry (canonical history).
2. Update this file's `Snapshot`, `Spec §8 strict-list`, `Live routes`, `Blockers`, and `Next chat` sections.
3. Bump `Last updated`.
4. Commit both in the same `docs(community-platform): close Phase N` commit.

If STATE.md drifts from CHANGELOG, treat CHANGELOG as authoritative and refresh STATE.md.
