# Community Platform — locked constraints

> Decisions that don't change between chats. Don't re-litigate; don't restate in handoffs. If you need to override, write an ADR or add a new `§9.x` execution-plan amendment.

This file is companion to `STATE.md` (current state) and `docs/playbooks/recurring-plan-defects.md` (patterns to avoid).

## Scope

- **Lite slice** (spec §3 non-goals). No DM, no kudos, no badges, no GBrain panel in v0.1.
- **100% git for v0.1.** No DB. Status updates commit to `community/status/YYYY-Wnn/<slug>.md`. The classification rule (§6.1) is documented but dormant until v0.2 introduces a DB.
- **No "Warsaw" hardcoding** in URLs / schemas / env values. Use `COMMUNITY_NAME` / `COMMUNITY_SLUG`.
- **Members-only** (with v0.3 amendment per [ADR-0012](../../docs/decisions/0012-community-platform-v0-3-discovery-posture.md)). Roster admission via `community/members/roster.md`. Consent gate on first login. Discovery surfaces (`/home`, `/events`, `/meetings`, `/api/calendar.ics`, `/manifest.json`) are public per ADR-0012.

## Stack

- **pnpm only.** No npm, no yarn.
- **Next.js 16.x** App Router. ESM (`"type": "module"`). Strict TypeScript with `noUncheckedIndexedAccess`.
- **NextAuth/Auth.js 5.0.0-beta.31.** JWT sessions. Client-side form POST sign-in (Issue #13388 workaround). `signOut` server action OK.
- **`proxy.ts` (NOT `middleware.ts`).** Manual `decode()` from `next-auth/jwt`, not the bare `auth()` helper.
- **All HTML rendering through `lib/markdown.ts` + `app/components/SafeHtml.tsx`.** No bypass — the sanitization pipeline is the single audit-bounded React HTML-insertion site.
- **GitHub App `warsaw-ai-bot`** for git writes (`contents: write` scope). Octokit + auth-app wrapper at `lib/github-app.ts`.

## Process

- **TDD.** Red → green → refactor → commit. No exceptions for new code paths.
- **Surgical edits.** Don't refactor adjacent code. Don't fix things the task didn't ask for. If you spot a defect outside scope, record it in `execution-plan.md §9` for a future chat.
- **Coverage gates** (spec §8): 80% overall, 100% on the strict-list (canonical list lives in `STATE.md`).
- **E2E required at closeout** for phases 1, 2, 3, 5, 6, 8 only. Use `pnpm e2e --retries=2` for closeout runs (Next 16 dev-server cold-start flakes — pattern 9 in the defects playbook).
- **Push to origin after every substantive commit.** Project memory `feedback_push_commits` overrides global DO-NOT-push default.
- **Reviewer-fix commits batched per phase.** One `fix(community-platform): batched reviewer fixes` commit at the end of a phase, not one per finding (project memory `feedback_token_discipline`).

## Secrets

- **NEVER** echo PEM, OAuth secret, GitHub App private key, or API key contents in chat or commits.
- Reference secrets by env-var name only: `GITHUB_APP_PRIVATE_KEY`, `NEXTAUTH_SECRET`, etc.
- For non-secrets on Vercel, set with `--no-sensitive --yes --value "..."` flags. Sensitive vars are NOT extractable via `vercel env pull` (returns empty quotes) so they need this annotation if they're meant to be inspectable.
- Test PEM at `tests/fixtures/test-app.private-key.pem` is allowlisted via `.gitignore` exception (`!tests/fixtures/**/*.pem`). It signs JWTs GitHub rejects — never grants real privileges.

## Reviewer agents

- **`security-reviewer`** runs after specific surfaces only:
  - Phase 4.2 — GitHub App writes (PEM handling).
  - Phase 7.2 — `execFileSync` (subprocess exec).
  - Phase 8.1 + 8.2 — GDPR endpoints (PII handling).
  Not at every closeout.
- **`typescript-reviewer` + `code-reviewer`** were dispatched at Phases 1–5 closeouts; both hit Anton's monthly Claude usage cap at Phases 6 + 7 closeouts. **Self-review checklist (below) is the standing fallback for Phase 6 onward.** Save the agent budget for genuinely security-relevant surfaces.

## Self-review checklist (use when reviewer agents are unavailable)

For each closeout:
- [ ] Spec §8 strict-list still at 100% (see `STATE.md` for the canonical list).
- [ ] New components include `afterEach(cleanup)` in their RTL tests; mocks restored in `afterEach`.
- [ ] New public paths added to `proxy.ts` `PUBLIC_PATHS` are gated on `NODE_ENV !== "production"` if dev-only.
- [ ] Subprocess exec uses `execFileSync` with hardcoded args, no shell, no user input.
- [ ] GDPR-style endpoints derive identity from session, never request body.
- [ ] New routes that read `auth()` ship as ƒ Dynamic; ISR (`revalidate`) on dynamic routes is documentation-only (pattern 8 in defects playbook).
- [ ] `Pick<X, "k">` test fixtures don't include extra props (pattern 5).
- [ ] No `\z` regex anchors (pattern 3).
- [ ] No `as` casts hiding null branches (pattern 2).

## Auto policy

- **Auto-execute** mechanical work: file writes, test runs, builds, commits, pushes.
- **Pause and ask** before:
  - `vercel --prod` (production deploy)
  - `git tag` push to a public remote
  - Any change to `community/governance/*`, `docs/decisions/*`, or `community/charter/*` — these need an ADR.
  - Any architectural deviation from spec / plan that doesn't fit an existing `§9.x` amendment slot.
  - Any rotation of secrets visible in chat.

## Where to find things

| Need | Read |
|---|---|
| State of play | `STATE.md` (this file's sibling) — read first |
| What this chat owns | `phase-N-brief.md` (the per-phase brief) |
| Locked rules | `CONSTRAINTS.md` (this file) |
| Recurring plan defects | `docs/playbooks/recurring-plan-defects.md` |
| Phase tasks | `plan.md` — read by line range from the phase brief |
| Plan amendments | `execution-plan.md §9` |
| Risk register | `execution-plan.md §6` |
| History | `CHANGELOG.md` — read on demand only |
| Cold-pickup reference | `HANDOFF.md` — pre-Phase 0 archive; rarely needed |
