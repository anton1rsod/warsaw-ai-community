# Community Platform — Chat 3 (Phases 2 + 3: Read surface) handoff

Copy-paste the fenced block into a fresh `auto`-mode Claude Code chat. Designed to be **token-lean** — references project memory + CHANGELOG instead of restating Phase 1 context.

```
Community Platform v0.1 — Chat 3: Phases 2 + 3 (Read surface)

================================================================
State
================================================================

Branch: warsaw-org-and-stack-guide. Last green: cdab72e.
Phase 0 + Phase 1 shipped, live OAuth validated on
https://warsaw-ai-platform.vercel.app. CLAUDE.md + project memory
already encode all locked decisions (§9.5–§9.11 amendments,
proxy.ts not middleware.ts, next-auth@5.0.0-beta.31, manual JWT
decode in proxy, build-time content snapshot, pnpm pre-hooks).

This chat owns: 16 tasks across 2 phases, ~2 days
- Phase 2 (members + profiles): 2.1–2.8
- Phase 3 (projects/decisions/meetings readers): 3.1–3.8

================================================================
Read in order (do NOT re-read what's already loaded)
================================================================

1. projects/community-platform/CHANGELOG.md
   — Phase 1 entry shows everything shipped. Read once.

2. projects/community-platform/plan.md, ONLY lines 2382–4234
   (Phase 2 + Phase 3 sections). Skip the rest.

3. projects/community-platform/execution-plan.md, ONLY §3 row for
   Phases 2 + 3, §6 risk register entries for those phases, §9
   amendments (active list).

Skip HANDOFF.md unless you hit something genuinely surprising —
its content is fully reflected in memory + CHANGELOG by now.

================================================================
Token discipline (NEW for this chat)
================================================================

- Trivial mechanical tasks (page files, single-import re-exports,
  config tweaks): write directly with Write/Edit. Don't dispatch
  subagents for <30-line files.
- Subagents are for: Task 2.1 (markdown sanitization — security-
  critical), Task 2.2 + 2.4 (data shape + component logic), and
  Task 3.1 / 3.3 / 3.5 (the three readers). Each gets a short
  brief (<100 lines) pointing at plan.md by line number.
- Don't run pnpm e2e between tasks. Only at phase closeouts.
- Don't run pnpm test:coverage after every commit. Only at phase
  closeouts. Use pnpm vitest run <single-file> while iterating.
- Don't re-read CHANGELOG, execution-plan, or plan after first read
  unless something specific changed.
- Batch reviewer-fix commits into one fix(...) commit per phase,
  not per finding.
- Push after each task commit (carry from project memory:
  feedback_push_commits).
- Final phase closeout: lint + typecheck + test:coverage + build
  + e2e. Single sequence.

================================================================
Constraints (locked from prior chats — do not re-litigate)
================================================================

- Lite slice (spec §3 non-goals).
- 100% git in v0.1.
- ALL HTML rendering via lib/markdown.ts + SafeHtml. No bypass.
  Sanitization is the gate every other render path goes through —
  100% coverage required on lib/markdown.ts.
- pnpm only.
- TDD: red → green → refactor → commit.
- Surgical edits.
- No "Warsaw" hardcoding.
- Don't echo / commit secrets.
- proxy.ts (not middleware.ts).
- pretest / pretypecheck etc auto-run pnpm snapshot.
- Vercel env vars are sensitive-by-default. For non-secrets like
  NEXTAUTH_URL etc., use --no-sensitive --yes --value "..." flags
  if you ever need to verify post-set.

================================================================
First moves
================================================================

1. cd "/Users/antonsafronov/Projects/Warsaw AI Comunity/projects/community-platform"
   pnpm install --frozen-lockfile
   pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm e2e
   If anything red, stop and triage.

2. Walk Tasks 2.1 → 3.8 in order, per execution-plan §3 dispatch
   table. Phase 2 closeout midway, Phase 3 closeout at end.

3. Update CHANGELOG with Phase 2 entry, then Phase 3 entry.

4. Run typescript-reviewer + code-reviewer in parallel after Phase 3
   green. Address HIGH issues; defer LOW.

5. Write Chat 4 handoff (Phases 4 + 5 + 6 — Writer + Status +
   Consent, the longest single chat per execution-plan §10.2,
   includes Task 4.1 [H] GitHub App blocker) at
   docs/specs/2026-MM-DD-community-platform-phase-4-5-6-handoff.md.
   Use this file as the template — keep it lean.

================================================================
Auto policy
================================================================

Auto. Ask only on architectural decisions (e.g., picking a
sanitization schema that diverges from rehype-sanitize defaultSchema,
or a markdown renderer beyond unified+remark+rehype). Auto-execute
mechanical tasks.

================================================================
Done means
================================================================

- All 16 tasks committed + pushed.
- Two closeouts green (lint + typecheck + test:coverage + build + e2e).
- 100% coverage on lib/markdown.ts (security-critical).
- Phase 1 modules retain their 100% coverage.
- CHANGELOG Phase 2 + Phase 3 entries committed.
- Chat 4 handoff written.
```

---

## Why this prompt is leaner than Chat 2's

- **No Phase 1 recap** — CHANGELOG has it; loading the chat reads it once.
- **No re-statement of architectural amendments** — they're in project memory + execution-plan.md, both loaded automatically.
- **Explicit token-discipline section** — the prior chat over-dispatched subagents and re-ran E2E too often. Direct-tool work for trivial tasks; subagents only for non-trivial ones; E2E only at phase boundaries.
- **Read scope narrowed** — plan.md only lines 2382–4234, execution-plan.md §3+§6+§9 only, CHANGELOG full. Skip HANDOFF.md unless genuinely needed.
- **No "first moves" prose** — direct command sequence.

Estimated savings vs Chat 2: ~30-40% fewer tokens on the same work, primarily from eliminated subagent dispatches for trivial tasks, fewer redundant test runs, and tighter doc reads.
