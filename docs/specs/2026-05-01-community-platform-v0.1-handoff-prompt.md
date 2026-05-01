# Community Platform v0.1 — handoff & execution-planning chat prompt

**Purpose:** copy-paste this into a fresh Claude Code chat to (a) write the structured documentation of the brainstorm + spec + plan journey, and (b) prepare the subagent-driven execution plan for Phase 0.4 onwards.

**This chat does:** synthesis (handoff doc) + execution strategy (subagent dispatch plan). May start Phase 0.4 execution if Anton agrees after both deliverables are reviewed.

**This chat does NOT:** re-litigate brainstorm decisions, rewrite the spec, restructure the plan. Those are settled.

---

## Copy-paste prompt (lines 12 onward, between the fences)

```
Read these files in order, then propose the structure of two deliverables before writing either.

1. projects/community-platform/plan.md
   — the implementation plan. 74 tasks across 11 phases (0–10).
     Each task has Files, a failing test, a run command, a minimal
     implementation, a passing-test verification, and a commit message.
     Read Conventions section + Phase 0 in full; skim Phase 1 + 2 + 3
     headers; read Phase 4 (GitHub App writer) + Phase 5 (status updates)
     + Phase 6 (consent flow) carefully; skim Phases 7–10.

2. projects/community-platform/spec.md
   — the design spec. §0 locked inputs (4-role RBAC, gamification,
     Telegram-complementary, OSS-first). §6.1 storage classification
     rule (the architectural backbone). §6.5 status update lifecycle.
     §6.13 GDPR mechanisms. §10 long-term commitments (storage
     trajectory, federation horizon, OSS/commercial separation,
     gamification phasing, health metric).

3. projects/community-platform/CHANGELOG.md
   — current state. Phase 0 entry shows what's been scaffolded.
     The Pending list shows what's still to do.

4. projects/community-platform/README.md
   — project entry point. Status line + v0.1 highlights.

The previous chat (2026-05-01) ran superpowers:brainstorming →
spec.md → superpowers:writing-plans → plan.md. Three commits on
branch warsaw-org-and-stack-guide:

- 97ccea2  spec(community-platform): v0.1 design
- 6f72f5c  plan(community-platform): v0.1 implementation plan (74 tasks)
- a736b38  chore(community): minimal pre-launch (Anton-only roster
           + admins.md + community-managers.md; @anton1rsod is the
           founder's GitHub handle; Task 0.3 attendees-format
           deferred to Phase 7 prep)

Founder is solo for now; expects 7-8 onboarding members initially.
Pre-launch tasks 0.1 and 0.2 done minimally; 0.3 explicitly skipped.

================================================================
Two deliverables for THIS chat
================================================================

DELIVERABLE A — Handoff documentation
   Path proposal: projects/community-platform/HANDOFF.md
   Audience: future AI collaborators (and Anton, in 6 months)
   Goal: anyone reading this file understands the v0.1 journey
         WITHOUT re-reading the full spec or plan.

   Required sections (refine the structure before writing — propose
   a TOC first):
   - Origin: why the platform exists (the B+A problem framing)
   - Locked inputs: §0 constraints
   - Decision path: B+A → C-hybrid → C-write-everything-to-git → Lite slice
   - Architectural choices that mattered:
     * git-only storage with §6.1 classification rule for v0.2+
     * NextAuth v5 JWT sessions (no DB sessions)
     * GitHub App writer pattern (warsaw-ai-bot)
     * Sanitization pipeline + SafeHtml component
     * Status-update lifecycle (commit-direct-to-main, no archival job)
   - Scope cuts: what was deferred (kudos, badges, GBrain panel, RSVPs,
     public/guest view, profile editor, admin UI capabilities) and why
   - Long-term commitments: spec §10 storage trajectory + 5 rules
     + strategic commitments (federation horizon, OSS/commercial
     separation, Telegram bridge, persona feedback loop, gamification
     phasing, health metric, governance integration)
   - Known caveats picked up during plan-writing:
     * Phase 1.1 parser-vs-roster schema discrepancy (header-aware fix)
     * Phase 9 /admin/health needs revalidate=60 (one-line fix)
     * NextAuth v5 beta risk (rough App Router edges)
     * Test PEM in repo triggers security scanners (acceptable for v0.1)
     * Build-time snapshot triggers ~50 deploys/month at full status
       cadence
     * Git author email → handle mapping is best-effort (private
       emails undercount in contributions)
   - "Where to start" cheat sheet for someone picking up cold

DELIVERABLE B — Subagent-driven execution plan
   Path proposal: projects/community-platform/execution-plan.md
   Goal: a concrete dispatch plan for the 74 tasks: which subagent
         takes which task, sequence, parallelization opportunities,
         review checkpoints, rollback strategy.

   Required content:
   - Sequence: tasks within a phase are mostly serial (each builds
     on the previous). Some phases can parallelize:
     * Phase 2 + Phase 3 are independent (both read snapshot, neither
       writes) — could run in parallel after Phase 1.
     * Phase 4 (GitHub App) is independent of Phase 2/3, blocks 5+6+8.
     * Phases 8 + 9 are independent of each other; both depend on
       Phase 4 + 5.
   - Subagent type: implementation tasks → general-purpose with
     Read/Write/Edit/Bash. TDD-heavy tasks → tdd-guide.
     Type errors → typescript-reviewer (post-Phase 0).
     Build failures → build-error-resolver.
   - Review checkpoints: end of each phase. Run pnpm lint &&
     pnpm typecheck && pnpm test:coverage && pnpm build && pnpm e2e
     before marking phase complete.
   - Rollback: if a phase breaks the build,
     git reset --hard <last-green-commit-sha-from-CHANGELOG>
     and revisit that phase's plan tasks. NEVER force-push.
   - Human-in-the-loop steps that block all execution until done:
     * Phase 0.12: Vercel project link + env var setup (Anton at keyboard)
     * Phase 1.4: GitHub OAuth App creation (Anton creates app at
       github.com/settings/developers, copies Client ID/Secret to
       Vercel env)
     * Phase 4.1: GitHub App creation + private key download (Anton
       creates app at github.com/settings/apps, generates PEM, gets
       installation ID, sets all three env vars on Vercel)
     * Phase 10.3: Production deploy promotion (Anton's go/no-go)
   - Per-phase risk register: which phases have non-obvious failure
     modes. Top three:
     * Phase 1 (NextAuth v5 + middleware) — can silently misroute
     * Phase 4 (GitHub App auth) — JWT signing edge cases with the
       PEM
     * Phase 5 (status flow) — concurrent edit + ISR cache + bot
       commit timing all interact
   - Estimated duration per phase (rough): Phase 0 1d, Phase 1 1.5d,
     Phase 2 1d, Phase 3 1d, Phase 4 0.5d, Phase 5 2d, Phase 6 0.5d,
     Phase 7 1d, Phase 8 0.5d, Phase 9 0.5d, Phase 10 0.5d. Total
     ~10 days focused solo work.

After both deliverables are written and committed, ASK Anton whether
to begin Phase 0.4 execution in this chat or start a fresh execution
chat. Do NOT auto-start execution.

================================================================
Constraints (carry from previous chats)
================================================================

- Stay within the Lite slice. Spec §3 lists explicit non-goals; do
  not propose adding any of them in v0.1. Examples of out-of-scope
  things to push back on if surfaced: kudos, peer endorsements,
  badges, quests, streaks, leaderboards, GBrain Q&A panel, RSVPs /
  events, public/guest read view, comments, notifications, search,
  full profile editor, admin/CM-distinct UI capabilities.

- 100% git for v0.1. No DB introduction. The §6.1 classification
  rule activates in v0.2+. If a feature seems to need DB, it's
  v0.2+, not v0.1.

- All HTML rendering MUST go through lib/markdown.ts and SafeHtml.
  No parallel rendering paths. No bypassing rehype-sanitize.

- pnpm only. Don't switch to npm or yarn.

- Bot account name: warsaw-ai-bot (locked). Don't propose alternatives.

- No hardcoded "Warsaw" in URLs, schemas, or env-derived runtime
  values. Use COMMUNITY_NAME / COMMUNITY_SLUG env vars (federation
  horizon hedge per spec §5).

- TDD discipline (failing test → run → expect fail → minimal
  implementation → run → expect pass → commit). Don't skip the red
  phase. 80%+ coverage; 100% on auth/RBAC/classification/GitHub
  App writer/week-helpers.

- Surgical edits. Touch only what each task requires. Don't
  drive-by refactor.

- Don't create new ADRs without asking. The spec §10 lists ADR
  candidates for v0.2+; if a v0.1 task surfaces an ADR-worthy
  decision, stop and ask Anton.

================================================================
Anton's preferences (from
/Users/antonsafronov/.claude/projects/
-Users-antonsafronov-Projects-Warsaw-AI-Comunity/memory/)
================================================================

- never echo/store API keys pasted in chat
  (feedback_secret_handling)
- explain impact + recommend on decisions, don't present neutral
  menus (feedback_decisions_with_recommendation)

================================================================
Open issues to address in either deliverable
================================================================

1. Phase 1.1 parser-vs-roster schema mismatch.
   The actual roster.md has 5 columns:
     Name | GitHub | Role | Telegram | Focus
   The plan's lib/roster.ts fixture has 4 columns:
     Name | GitHub | Joined | Notes
   The plan's parser uses cell index 1 for GitHub. With the real
   schema, that's correct, but it will misparse the placeholder
   *(TBD)* rows (cell-filtering removes empties → "Core organizer"
   becomes the GitHub handle). Fix in Task 1.1: parse table headers,
   find the GitHub column by name, skip rows whose name is *(TBD)*
   or whose GitHub cell is empty.

2. Phase 9 /admin/health makes 4 GitHub API calls per page load.
   Add `export const revalidate = 60;` to that page (matching
   /this-week). One-line fix; should be in execution.

3. Test PEM committed under tests/fixtures/test-app.private-key.pem
   will trip security scanners (Snyk, GitGuardian). Acceptable for
   v0.1 (the key signs JWTs GitHub rejects), but if a scanner
   blocks CI, switch to a per-CI-run generated PEM instead.

4. NextAuth v5 beta (5.0.0-beta.25) — if Phase 1 hits weird auth
   bugs, check Auth.js GitHub issues before deep-debugging.

5. JWT sessions can't be invalidated server-side. Acceptable at 19
   members; v0.2 candidate to switch to DB sessions when DB arrives.

6. Build-time snapshot rebuilds on every push to main filtered to
   relevant paths (NOT community/status/, which is runtime). Watch
   Vercel deploy frequency once status updates start landing.

================================================================
First moves
================================================================

Acknowledge the four files in your own words (one paragraph each
on plan, spec, changelog, README — what they cover, what's
already settled). Then propose the TOC for both deliverables.
Wait for Anton's confirmation before writing either.

After Anton approves the TOCs:
- Write Deliverable A (HANDOFF.md). Commit with message:
  docs(community-platform): handoff documentation for v0.1 journey
- Write Deliverable B (execution-plan.md). Commit with message:
  plan(community-platform): subagent-driven execution plan for v0.1

Then ask: "Begin Phase 0.4 execution now or start a fresh chat?"
```

---

## Why this prompt is shaped the way it is

- **Reads four files in order** (plan first, spec second, CHANGELOG third, README fourth) — same pattern as the gbrain 0.1.2 prompt that successfully kicked off the gbrain execution chat. Plan-first because the plan is the action document; spec is reference; CHANGELOG is "where we are"; README is the entry point.
- **Two distinct deliverables** named upfront — prevents the chat from defaulting to "just start coding." The user explicitly asked for documentation + execution-plan, not implementation.
- **Proposed file paths** (`HANDOFF.md`, `execution-plan.md`) — both at the project root, both with paths the chat can override. The chat will negotiate the structure, but starting with concrete paths reduces back-and-forth.
- **Explicit non-goals** — the constraints section repeats §3 of the spec because at this stage it's tempting to "improve" things. The list closes off improvements that would re-open brainstorm questions.
- **Open issues surfaced** — the parser schema bug, the `revalidate` fix, the test PEM scanner risk, NextAuth v5 beta. These were caught during plan-writing and should land in HANDOFF.md's caveats section so they're not lost.
- **Acknowledgment-first** — same as the gbrain prompt: paragraph-each on the four files, then propose TOCs, then wait. Gives Anton a confirm-or-redirect handle before any writing starts.
- **No auto-execution** — the prompt explicitly says "do NOT auto-start execution." The next chat is for synthesis, not implementation. Execution may follow in this chat or a fresh one — Anton's call.

## What's deliberately NOT in the prompt

- Detailed task contents — those live in the plan; duplicating here would rot.
- The full spec text — it's a 480-line document; pointer is enough.
- Brainstorm questions/answers — settled; only the *outcomes* matter.
- The /loop, /schedule cadence proposals from earlier — out of scope for the next chat.

## Tip for Anton

Open the next chat in `auto` mode. Auto + this prompt + a 1M-context Opus or Sonnet 4.6 will produce both deliverables in one chat with one or two checkpoints. The deliverable structure is designed so that, after both are written, the third chat (execution) has a single canonical plan to dispatch from.

If you want to keep the next chat tight (just Deliverable A), tell the chat "skip Deliverable B for now" after the TOC is approved — the prompt is structured to allow either pacing.
