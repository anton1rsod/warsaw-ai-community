# Community Platform — Chat 5 (Phases 7 + 8 + 9: Contributions + GDPR + Health) handoff

Copy-paste the fenced block into a fresh `auto`-mode Claude Code chat. 13 tasks across 3 phases per execution-plan §10.2 (~2 days). Token-lean by design — references CHANGELOG + execution-plan + project memory instead of restating Phase 1-6.

```
Community Platform v0.1 — Chat 5: Phases 7 + 8 + 9 (Contributions + GDPR + Health)

================================================================
State
================================================================

Branch: warsaw-org-and-stack-guide. Last green: pending Phase 6 closeout
commit (the one that lands "docs(community-platform): close Phase 6"
on top of 3862ace). Read commit at the start of this chat to confirm.

Phases 0–6 shipped end-to-end:
- Phase 0: bootstrap (Next 16 + pnpm + Vitest + Playwright + Tailwind +
  classification + env contract + Vercel link).
- Phase 1: NextAuth v5 (beta.31) + RBAC + content snapshot + proxy.ts
  + /home / /login / /no-access; OAuth round-trip validated live.
- Phase 2: members directory + profile pages + sanitized markdown
  pipeline (lib/markdown.ts → SafeHtml) + PersonaPanel.
- Phase 3: /projects, /decisions, /meetings readers (snapshot extended).
- Phase 4: lib/github-app.ts wrapper (Octokit + auth-app, MSW tests,
  100% coverage, GitHubAppError taxonomy with sha_conflict /
  not_found / forbidden / unknown). Anton's [H] Task 4.1 (GitHub App
  warsaw-ai-bot creation) still pending; smoke script awaits real env.
- Phase 5: lib/week.ts + lib/status-reader.ts + app/actions/status.ts
  + StatusEditor + /this-week page + E2E mock store (NEXT_PUBLIC_E2E_MODE
  on globalThis). dynamic = "force-dynamic" instead of revalidate = 60
  per amendment §9.16.
- Phase 6: app/actions/consent.ts (acceptConsent / hasConsent /
  acceptConsentAndSetCookie) + ConsentModal + /consent page +
  proxy.ts consent gate. waic-consented cookie + community/members/
  <slug>.md as durable record.

CLAUDE.md + project memory + execution-plan §9 already encode every
locked decision and the 18 plan amendments accumulated. Don't re-litigate.

This chat owns: 13 tasks across 3 phases, ~2 days
- Phase 7 (Contributions counter): 7.1, 7.2, 7.3, 7.4, 7.5
- Phase 8 (GDPR mechanisms): 8.1, 8.2, 8.3, 8.4, 8.5
- Phase 9 (Health metric): 9.1, 9.2, 9.3

================================================================
Read in order (do NOT re-read what's already loaded)
================================================================

1. projects/community-platform/CHANGELOG.md
   — Phase 6 entry shows the consent gate that's now live. Read once.

2. projects/community-platform/plan.md, ONLY lines 6325–7497
   (Phase 7 + Phase 8 + Phase 9 sections — adjust upper bound if the
   plan text exceeds; this is roughly the half from `## Phase 7` to
   `## Phase 10`). Skip the rest.

3. projects/community-platform/execution-plan.md, ONLY §3 rows for
   Phases 7 + 8 + 9, §6 risk register entries 6.5 (execFileSync) +
   6.6 (GDPR delete) + 6.7 (/admin/health rate limit), §9 amendments
   (active list — especially §9.2 revalidate-on-health).

4. SKIP HANDOFF.md unless something genuinely surprising — its content
   is fully reflected in memory + CHANGELOG by now.

================================================================
Token discipline (carries from Chat 4)
================================================================

- Trivial mechanical tasks (page files, single-import re-exports,
  config tweaks): write directly with Write/Edit. Don't dispatch
  subagents for <30-line files.
- Subagents are for: Task 7.1 (lib/contributions.ts — strict-list
  100% coverage), Task 7.2 (build-contributions script — execFileSync
  security surface), Task 8.1 (/api/me/export — PII scrubbing), Task 8.2
  (/api/me/delete — per-week scan + cross-user-deletion guard), Task 9.1
  (lib/health-metric.ts). Each gets a short brief (<100 lines)
  pointing at plan.md by line number.
- Don't run pnpm e2e between tasks. Only at phase closeouts.
- Don't run pnpm test:coverage after every commit. Only at phase
  closeouts. Use pnpm vitest run <single-file> while iterating.
- Batch reviewer-fix commits into one fix(...) commit per phase.
- Push after each task commit (carry from project memory:
  feedback_push_commits).
- Three closeouts in this chat (Phase 7 / 8 / 9); Phase 7 needs E2E,
  Phase 8 needs E2E, Phase 9 doesn't.

================================================================
Constraints (locked from prior chats — do not re-litigate)
================================================================

- Lite slice (spec §3 non-goals).
- 100% git in v0.1.
- ALL HTML rendering via lib/markdown.ts + SafeHtml. No bypass.
- pnpm only.
- TDD: red → green → refactor → commit.
- Surgical edits.
- No "Warsaw" hardcoding.
- proxy.ts (not middleware.ts); auth before consent before content.
- pretest / pretypecheck etc auto-run pnpm snapshot.
- Vercel env vars are sensitive-by-default. For non-secrets, use
  --no-sensitive --yes --value "..." flags.
- E2E uses loginAs(page, handle, { consented }) helper with
  page.request.post (per §9.13). Default consented:true so existing
  tests stay green.

**Secret handling (carries from Chat 4 — Phase 4 PEM concerns still
relevant if Anton's Task 4.1 lands during this chat):**
- NEVER echo PEM contents in chat or commit.
- Reference secrets by env var NAME only.
- Run security-reviewer after Task 7.2 (execFileSync subprocess) and
  Task 8.1 + 8.2 (GDPR endpoints — PII handling).

================================================================
Plan amendments to apply at execution time
================================================================

- §9.2 Task 9.2 — `export const revalidate = 60;` on `/admin/health`
  (Phase 9). Without this, refresh-spamming /admin/health blows the
  GitHub API rate limit (4 calls per render).
- §9.13 — E2E auth helper uses page.request.post() (carries forward;
  GDPR + contributions E2E must use loginAs).
- §9.16 — /this-week ships dynamic, not revalidate. Pattern carries
  to /admin/health in the OPPOSITE direction (DO add revalidate=60
  there because Phase 9's read load is heavier).
- §9.18 — proxy.ts conditionally admits dev-only public paths under
  NODE_ENV. Phase 8 GDPR routes (/api/me/export, /api/me/delete)
  must NOT be in PUBLIC_PATHS — they're authenticated endpoints.
- All other §9.x amendments are already applied in committed code.

================================================================
First moves
================================================================

1. cd "/Users/antonsafronov/Projects/Warsaw AI Comunity/projects/community-platform"
   pnpm install --frozen-lockfile
   pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm e2e
   If anything red, stop and triage.

2. Walk Tasks 7.1 → 9.3 in order, per execution-plan §3 dispatch table.
   Phase 7 closeout after 7.5, Phase 8 closeout after 8.5, Phase 9
   closeout after 9.3.

3. Update CHANGELOG with Phase 7 entry, then 8, then 9.

4. Run typescript-reviewer + code-reviewer in parallel after each
   phase closeout. Address HIGH issues; defer LOW. Add §9.19+ amendments
   to execution-plan.md only for architectural deviations, not
   implementation-bug fixes (which the commit messages already capture).

5. Write Chat 6 handoff (Phase 10 — Pre-launch + ship, 4 tasks) at
   docs/specs/2026-MM-DD-community-platform-phase-10-handoff.md.
   Use this file as the template — keep it lean.

================================================================
Auto policy
================================================================

Auto. Ask only on architectural decisions:
- If the contributions calculator design needs a different aggregation
  (e.g., status counts vs commit counts vs PR counts), ask.
- If GDPR delete needs to reach beyond `community/status/<W>/<slug>.md`
  + `community/members/<slug>.md` (e.g., redact roster.md), ask.
- If /admin/health needs additional metrics beyond what spec §6.12
  prescribes, ask.

Auto-execute everything else (mechanical tasks).

================================================================
Risk register (per execution-plan §6)
================================================================

- §6.5 Task 7.2 execFileSync: subprocess exec is a security surface.
  Plan locks execFileSync (no shell) with all hardcoded args — no
  user input passes to git. Run security-reviewer after 7.2.
- §6.6 Task 8.2 GDPR delete: per-week scan iterates last 52 weeks,
  fetches each week's status files, filters by s.slug === member.slug.
  Profile delete uses session-derived slug — cross-user deletion is
  structurally impossible by construction.
- §6.7 Task 9.2 /admin/health rate limit: 4 GitHub API calls per
  render. revalidate = 60 (per §9.2) keeps it within 5000/hr quota
  even under refresh-spam.

================================================================
Done means
================================================================

- All 13 tasks committed + pushed.
- Three closeouts green (lint + typecheck + test:coverage + build,
  + e2e on 7 + 8).
- 100% coverage on lib/contributions.ts (strict-list per spec §8) and
  lib/health-metric.ts (strict-list).
- Phase 1-6 modules retain their 100% coverage.
- CHANGELOG Phase 7 + 8 + 9 entries committed.
- Chat 6 handoff written at docs/specs/.
- security-reviewer signed off on Phase 7 (execFileSync) and Phase 8
  (GDPR endpoints).
```

---

## Why this prompt is leaner than Chat 4's

- **No Phase 1-6 recap** — CHANGELOG has it; loading the chat reads it once.
- **No re-statement of architectural amendments** — §9.1–§9.18 are in execution-plan.md, loaded automatically when the chat reads §9.
- **Token-discipline section retained** — same as Chat 4 with adjustments for the 3 closeouts (E2E only on 7 + 8).
- **Read scope narrowed** — plan.md only lines covering Phases 7–9, execution-plan §3+§6+§9 only, CHANGELOG full. Skip HANDOFF.md.
- **Risk register inlined** — §6.5–§6.7 are the relevant entries for this chat.
- **Secret handling reinforced** — Phase 4 PEM concerns may be live if Anton's Task 4.1 lands during this chat.

Estimated savings vs Chat 4: ~20–30% fewer tokens on the same work, primarily from one fewer phase + lighter security surface (no PEM-handling here, only execFileSync + PII).
