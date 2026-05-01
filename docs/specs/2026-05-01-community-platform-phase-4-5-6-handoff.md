# Community Platform — Chat 4 (Phases 4 + 5 + 6: Writer + Status + Consent) handoff

Copy-paste the fenced block into a fresh `auto`-mode Claude Code chat. The longest single chat per execution-plan §10.2 (15 tasks, ~3 days). Token-lean by design — references CHANGELOG + execution-plan + project memory instead of restating Phase 1-3.

```
Community Platform v0.1 — Chat 4: Phases 4 + 5 + 6 (Writer + Status + Consent)

================================================================
State
================================================================

Branch: warsaw-org-and-stack-guide. Last green: pending Phase 3 closeout
commit (the one that lands "docs(community-platform): close Phase 3"
on top of b4475f0). Read commit at the start of this chat to confirm.

Phases 0–3 shipped end-to-end:
- Phase 0: bootstrap (Next 16 + pnpm + Vitest + Playwright + Tailwind +
  classification + env contract + Vercel link).
- Phase 1: NextAuth v5 (beta.31) + RBAC + content snapshot + proxy.ts
  + /home / /login / /no-access; OAuth round-trip validated live on
  https://warsaw-ai-platform.vercel.app.
- Phase 2: members directory + profile pages + sanitized markdown
  pipeline (lib/markdown.ts → SafeHtml) + PersonaPanel.
- Phase 3: /projects, /decisions, /meetings readers (snapshot extended).

CLAUDE.md + project memory + execution-plan §9 already encode every
locked decision and the 15 plan amendments accumulated. Don't re-litigate.

This chat owns: 15 tasks across 3 phases, ~3 days
- Phase 4 (GitHub App writer): 4.1 [H], 4.2, 4.3 [D]
- Phase 5 (Status updates): 5.1–5.7 (the largest phase by complexity)
- Phase 6 (Consent flow): 6.1–6.5

================================================================
Read in order (do NOT re-read what's already loaded)
================================================================

1. projects/community-platform/CHANGELOG.md
   — Phase 3 entry shows the read surface that's now live. Read once.

2. projects/community-platform/plan.md, ONLY lines 4234–6700
   (Phase 4 + Phase 5 + Phase 6 sections — adjust upper bound if the
   plan text exceeds; this is roughly the half from `## Phase 4` to
   `## Phase 7`). Skip the rest.

3. projects/community-platform/execution-plan.md, ONLY §3 rows for
   Phases 4 + 5 + 6, §6 risk register entries 6.2 (PEM) + 6.3 (status
   timing) + 6.4 (consent middleware), §9 amendments (active list —
   especially §9.3 keep-PEM-in-repo).

4. SKIP HANDOFF.md unless something genuinely surprising — its content
   is fully reflected in memory + CHANGELOG by now.

================================================================
Token discipline (carries from Chat 3)
================================================================

- Trivial mechanical tasks (page files, single-import re-exports,
  config tweaks): write directly with Write/Edit. Don't dispatch
  subagents for <30-line files.
- Subagents are for: Task 4.2 (GitHub App writer wrapper — security-
  critical, PEM handling — strict-list 100% coverage), Task 5.1
  (lib/week.ts — strict-list 100% coverage), Task 5.2 (status
  reader/writer with SHA-conflict logic), Task 5.3 (server actions
  post/edit/delete), Task 6.2 (consent middleware), Task 6.3 (consent
  modal). Each gets a short brief (<100 lines) pointing at plan.md by
  line number.
- Don't run pnpm e2e between tasks. Only at phase closeouts.
- Don't run pnpm test:coverage after every commit. Only at phase
  closeouts. Use pnpm vitest run <single-file> while iterating.
- Batch reviewer-fix commits into one fix(...) commit per phase.
- Push after each task commit (carry from project memory:
  feedback_push_commits).
- Three closeouts in this chat (Phase 4 / 5 / 6); each runs lint +
  typecheck + test:coverage + build + e2e.

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
- proxy.ts (not middleware.ts).
- pretest / pretypecheck etc auto-run pnpm snapshot.
- Vercel env vars are sensitive-by-default. For non-secrets, use
  --no-sensitive --yes --value "..." flags.

**Secret handling (REINFORCED — Phase 4 ships PEM-related code):**
- NEVER echo the PEM contents in chat or commit.
- Reference secrets by env var NAME only (GITHUB_APP_PRIVATE_KEY etc).
- Plan amendment §9.3 governs the test PEM-in-repo decision (keep with
  documented caveats; do NOT block Phase 4 over CI scanner noise).
- Run security-reviewer agent after Task 4.2 (PEM handling) and after
  Phase 6 closeout (consent middleware).

================================================================
Plan amendments to apply at execution time
================================================================

- §9.2 Task 9.2 — `export const revalidate = 60;` on `/admin/health`
  (Phase 9, NOT this chat — but be aware).
- §9.3 Task 4.2 — keep test PEM in repo with documented caveats. If a
  CI security scanner flags it, switch to per-CI-run `openssl genrsa`
  in test setup. Do NOT block Phase 4 over scanner noise.
- §9.13 — E2E auth helper uses page.request.post() (carries forward;
  status + consent E2E must use loginAs).
- All other §9.x amendments are already applied in committed code.

================================================================
First moves
================================================================

1. cd "/Users/antonsafronov/Projects/Warsaw AI Comunity/projects/community-platform"
   pnpm install --frozen-lockfile
   pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm e2e
   If anything red, stop and triage.

2. Wait for Anton's [H] Task 4.1 (GitHub App `warsaw-ai-bot` creation +
   PEM + GITHUB_APP_ID/PRIVATE_KEY/INSTALLATION_ID on Vercel preview).
   Don't try to fake the PEM or use a placeholder — the wrapper smoke
   test in Task 4.2 hits the real GitHub API and will fail with 401 if
   PEM is wrong. Anton will paste the PEM into Vercel dashboard;
   acknowledge by env-var-name reference only.

3. Walk Tasks 4.2 → 6.5 in order, per execution-plan §3 dispatch table.
   Phase 4 closeout after 4.3, Phase 5 closeout after 5.7, Phase 6
   closeout after 6.5.

4. Update CHANGELOG with Phase 4 entry, then 5, then 6.

5. Run typescript-reviewer + code-reviewer in parallel after each
   phase closeout. Address HIGH issues; defer LOW. Add §9.16+ amendments
   to execution-plan.md only for architectural deviations, not
   implementation-bug fixes (which the commit messages already capture).

6. Write Chat 5 handoff (Phases 7 + 8 + 9 — Contributions counter +
   GDPR + Health metric, 13 tasks per execution-plan §10.2) at
   docs/specs/2026-MM-DD-community-platform-phase-7-8-9-handoff.md.
   Use this file as the template — keep it lean.

================================================================
Auto policy
================================================================

Auto. Ask only on architectural decisions:
- If the GitHub App auth path (Octokit + auth-app + PEM) needs a
  different lib, ask before swapping.
- If status edit-conflict resolution requires a UX shift away from "409
  → refresh and retry", ask.
- If consent middleware redirect logic needs to extend the proxy.ts
  matcher beyond what spec §6 prescribes, ask.

Auto-execute everything else (mechanical tasks).

================================================================
Risk register (per execution-plan §6)
================================================================

- §6.2 PEM CRLF / whitespace: scripts/smoke-github-app.ts hits the real
  API and surfaces silent 401s. Run smoke before closing Phase 4.
- §6.3 status timing: SHA-conflict + ISR (60s) + bot commit
  propagation interact. Status actions read SHA fresh per call (no
  cached SHA in client state). E2E covers concurrent-edit explicitly.
- §6.4 consent matcher: cookie name `waic-consented` is locked; matcher
  excludes _next, favicon.ico, /api/auth, /api/test-auth, /login,
  /no-access, /consent. Wrong matcher = trap-loop OR consent-bypass.

================================================================
Done means
================================================================

- All 15 tasks committed + pushed.
- Three closeouts green (lint + typecheck + test:coverage + build + e2e).
- 100% coverage on lib/github-app.ts (strict-list per spec §8) and
  lib/week.ts (strict-list).
- Phase 1-3 modules retain their 100% coverage.
- CHANGELOG Phase 4 + 5 + 6 entries committed.
- Chat 5 handoff written at docs/specs/.
- security-reviewer signed off on Phase 4 (PEM) and Phase 6 (consent).
```

---

## Why this prompt is leaner than Chat 3's

- **No Phase 1-2-3 recap** — CHANGELOG has it; loading the chat reads it once.
- **No re-statement of architectural amendments** — §9.1–§9.15 are in execution-plan.md, loaded automatically when the chat reads §9.
- **Token-discipline section retained** — same as Chat 3 with adjustments for the larger phase scope (3 closeouts vs 2; explicit security-reviewer cadence).
- **Read scope narrowed** — plan.md only lines covering Phases 4–6, execution-plan §3+§6+§9 only, CHANGELOG full. Skip HANDOFF.md.
- **Risk register inlined** — Phase 4-5-6 are the highest-risk phases (PEM + status timing + consent matcher); the §6.2-§6.4 entries are pulled in directly so the chat doesn't need to re-derive them.
- **Secret handling reinforced** — Phase 4 is the first phase that touches secrets at runtime; the constraints section calls this out explicitly.

Estimated savings vs Chat 3: ~25–35% fewer tokens on the same work, primarily from the same token-discipline rules + 3 closeouts being individually cheaper than spread-the-work.
