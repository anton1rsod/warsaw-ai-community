# Community Platform — Chat 6 (Phase 10: Pre-launch + ship) handoff

Copy-paste the fenced block into a fresh `auto`-mode Claude Code chat. 4 tasks, ~0.5 day. Heavy Anton-blockers (10.3 prod deploy + 10.4 tag/announce). This is the shortest chat in the multi-chat split.

```
Community Platform v0.1 — Chat 6: Phase 10 (Pre-launch + ship)

================================================================
State
================================================================

Branch: warsaw-org-and-stack-guide. Last green commit: 56e1cd3
("docs(community-platform): close Phase 9"). Confirm with `git log -1`
before starting.

Phases 0–9 shipped end-to-end (281 unit + integration tests + 19 E2E
all green; 100% coverage on the spec §8 strict-list):
- Phases 0–6 per CHANGELOG and Chat 5 handoff (auth + RBAC + members
  + archives + writer + status + consent — already audited).
- Phase 7 (Contributions counter): lib/contributions.ts (calc) +
  scripts/build-contributions.ts (execFileSync, no shell — security-
  reviewer CLEAN) + ContributionCard on profiles. Pre-hooks chain
  pnpm contributions → snapshot.
- Phase 8 (GDPR): /api/me/export + /api/me/delete (session-derived
  slug; cross-user deletion structurally impossible). GdprPanel on
  own profile. /members/[slug] flipped from SSG to ƒ Dynamic because
  the page reads auth() for the panel conditional. Defense-in-depth
  WEEK_REGEX guard added to lib/status-reader.ts (security-reviewer
  MEDIUM, fixed in 0436755). 19 E2E pass.
- Phase 9 (Health metric): lib/health-metric.ts (calc) + /admin/health
  (isAdmin gate, 4-week parallel readWeekStatuses). revalidate=60
  applied per amendment §9.2 (caching note in CHANGELOG: auth() forces
  dynamic so ISR doesn't engage at the page level — acceptable for
  v0.1 admin-only surface).

CLAUDE.md + project memory + execution-plan §9 already encode every
locked decision. Don't re-litigate.

This chat owns: 4 tasks, ~0.5 day
- Task 10.1 [D]: spec §8 acceptance verification log
- Task 10.2: Lighthouse + perf tuning
- Task 10.3 [H]: production deploy (Anton — vercel --prod + smoke)
- Task 10.4 [H]: tag v0.1.0 + open PR to main + announce

Outstanding from prior chats (now BLOCKING for this chat):
- **Task 4.1 [H]**: warsaw-ai-bot GitHub App + PEM + 3 env vars on
  Vercel preview (GITHUB_APP_ID / _PRIVATE_KEY / _INSTALLATION_ID)
  AND production. Without this, /this-week + /consent + /admin/health +
  /api/me/export + /api/me/delete won't work in production. The
  smoke-github-app.ts script verifies the credential chain end-to-end.
- Roster `github_handle` backfill for the other 18 members. Required
  for non-founder logins. v0.1 ship-blocking.

================================================================
Read in order (do NOT re-read what's already loaded)
================================================================

1. projects/community-platform/CHANGELOG.md
   — Phase 7 + 8 + 9 entries are the state of play. Read once.

2. projects/community-platform/plan.md, ONLY the Phase 10 section
   (~lines 7497–7650). Skip the rest.

3. projects/community-platform/spec.md, §8 (Testing + acceptance).
   Phase 10 walks the §8 list as a checklist.

4. projects/community-platform/execution-plan.md, ONLY §5 (human
   blockers — 10.3 + 10.4) and §9 (plan amendments — only those still
   unapplied; everything ≤§9.18 is already in committed code).

================================================================
Token discipline (carries from Chat 5)
================================================================

- Trivial mechanical tasks: write directly with Write/Edit. Don't
  dispatch subagents for verification or doc-only work.
- Subagents are unnecessary for Phase 10 — every task is either
  documentation (10.1, 10.4) or operational (10.2 Lighthouse, 10.3
  Anton-driven deploy).
- Don't run pnpm e2e during Phase 10 unless 10.2 perf changes touch
  app code. Use the Phase 9 closeout numbers (281 tests + 19 E2E) as
  the canonical green state.
- One closeout in this chat (Phase 10 = ship). E2E is implicit via
  10.3 production smoke-test, not via pnpm e2e.

================================================================
Constraints (locked from prior chats — do not re-litigate)
================================================================

- Lite slice (spec §3 non-goals).
- 100% git in v0.1.
- ALL HTML rendering via lib/markdown.ts + SafeHtml.
- pnpm only.
- TDD discipline — but Phase 10 has no new code paths to test.
- Surgical edits — only fix Lighthouse blockers if found.
- No "Warsaw" hardcoding.

**Secret handling:**
- NEVER echo PEM contents in chat or commit.
- Reference secrets by env var NAME only.
- Production env vars must be set via `vercel env add ... production`
  (not via `--no-sensitive` for credentials).

================================================================
Plan amendments to apply at execution time
================================================================

All §9.1–§9.18 amendments already shipped in committed code through
Phase 9. No new amendments expected for Phase 10 unless Lighthouse
flags a structural fix or production deploy surfaces a config gap.

If a new amendment is needed, append it as §9.19+ in execution-plan.md
with the Phase 10 task that triggered it.

================================================================
First moves
================================================================

1. cd "/Users/antonsafronov/Projects/Warsaw AI Comunity/projects/community-platform"
   pnpm install --frozen-lockfile
   pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm e2e
   (Last full-green check before ship. If anything red, stop and
   triage; the Phase 9 closeout was green at 56e1cd3, so any red is
   environmental.)

2. Walk Tasks 10.1 → 10.4 in order.
   - 10.1: write spec §8 acceptance verification log into CHANGELOG.
     Five of seven items (status E2E, persona panel, contributions
     counter, no-PII-in-logs, health metric viewable) are already
     verified by Phase 5–9 closeouts; documenting is mostly
     cross-referencing existing CHANGELOG entries.
   - 10.2: run `pnpm dlx lighthouse <preview-url>/{home,members,this-week}`.
     Tune any score < 90. Most likely fix is a `next/image` or
     `loading="lazy"` adjustment.
   - 10.3 [H]: ASK Anton before running `vercel --prod`. Verify all
     13 env vars set for production via `vercel env ls`. After deploy,
     smoke-test the production URL. If Task 4.1 still pending,
     /this-week + /admin/health will fail in prod — Anton must finish
     4.1 BEFORE 10.3.
   - 10.4 [H]: tag v0.1.0; open PR to main; Anton announces in
     Telegram #announcements; flip [Unreleased] to [0.1.0] in
     CHANGELOG.

3. Update CHANGELOG with Phase 10 verification log + final [0.1.0]
   release section.

4. Memory updates: at the very end (after release), update
   /Users/antonsafronov/.claude/projects/-Users-antonsafronov-Projects-Warsaw-AI-Comunity/memory/
   - project_community_platform.md → reflect v0.1.0 shipped state
   - Drop project_community_platform_phase1_amendments.md if all
     amendments are now committed (carry forward only forward-looking
     state).

5. **Decide Chat 7 (or no Chat 7).** If v0.1.0 ships clean, this
   handoff template doesn't need to spawn another chat — Phase 10 is
   the last execution chat. Post-ship work (roster backfill, GBrain
   sub-project kickoff) belongs to a NEW spec/plan cycle, not the
   community-platform v0.1 cycle.

================================================================
Auto policy
================================================================

Auto. Pause and ask before:
- Running `vercel --prod` (10.3 — Anton authorizes; this is a
  one-shot promotion to a production URL Anton will share publicly).
- Pushing the v0.1.0 tag (10.4 — once pushed, semantic-version
  expectations attach).
- Opening the PR to main (10.4 — final review opportunity).

Auto-execute everything else (verification log, Lighthouse runs,
CHANGELOG edits).

================================================================
Risk register (per execution-plan §6)
================================================================

- 10.3 production deploy: requires Task 4.1 completion (real bot
  credentials). If 4.1 still pending, /this-week + /consent +
  /admin/health + /api/me/* will all fail in production with
  installation-token errors. Verify on preview first.
- 10.3 NEXTAUTH_URL must be the production URL, not the preview
  alias. Common mistake: forgetting to set it for production scope.
- 10.4 git tag is non-rewindable on the public remote. Confirm
  tag-target SHA matches the production-deployed SHA before pushing.

================================================================
Self-review fallback (carries from Chat 5)
================================================================

For Phase 10 closeout, audit:
- Spec §8 strict-list still at 100% (lib/{auth,classification,
  content-snapshot,contributions,env,github-app,health-metric,
  markdown,rbac,status-reader,week}.ts + proxy.ts + critical
  components). Phase 9 closeout had this green — verify nothing
  drifted.
- Production env vars match the preview env vars in count (13) and
  in shape (no placeholders for secrets, real bot credentials).
- README production URL set after 10.3.
- CHANGELOG [0.1.0] section dated 2026-05-DD (whatever today is when
  10.4 ships).

================================================================
Done means
================================================================

- 10.1 verification log committed.
- 10.2 Lighthouse ≥ 90 on /home, /members, /this-week (or documented
  gap if accepted).
- 10.3 production deploy live; smoke-test green; README updated.
- 10.4 v0.1.0 tag pushed; PR to main opened (and ideally merged);
  CHANGELOG flipped to [0.1.0].
- Memory updated to reflect shipped v0.1.0 state.
```

---

## Why this prompt is leaner than Chat 5's

- **No new test surface to introduce** — Phase 10 is verification + perf + deploy, not feature work. Token discipline section trims to "no E2E during Phase 10".
- **No subagent dispatches needed** — every task is doc/ops; no security-reviewer surface (the GDPR + execFileSync surfaces were audited in prior phases).
- **Heavy Anton blockers** — 10.3 + 10.4 require human authorization. Auto-policy explicitly carves these out.
- **Risk register narrowed to deploy-time concerns** — Task 4.1 dependency, NEXTAUTH_URL scope, tag immutability.

Estimated chat duration: ≤2 hours of active work, plus Anton's deploy + announce time. Shorter than the Chat 5 estimate by ~75% because most surface is documentation + verification.
