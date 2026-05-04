# Chat 10 handoff: post-v0.1.1 follow-ups + v0.2 prep

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) — operating discipline. Read once at session start.

**Status:** v0.1.1 SHIPPED 2026-05-04 at merge SHA `036695c` on `main`; tag `community-platform-v0.1.1`; production deploy `fg6rfweki` Ready; ALREADY-MEMBER smoke verified.

This chat covers low-priority cleanup that doesn't fit a single rigid scope. **Anton picks the scope at chat start** — see "This chat owns" below for menu.

---

## Setup

Branch off `main` per task. None of these items belong on a long-running feature branch — they're small, independent, mergeable in any order.

If `phase-10-followups` still exists locally, it can be deleted (`git branch -D phase-10-followups`) — it merged into main as part of PR #2.

## Read in order (~530 lines total)

1. `projects/community-platform/STATE.md` — current state. `phase: "v0.1.1 shipped"`. The "Pending follow-ups" list under Next chat is the menu.
2. `projects/community-platform/CONSTRAINTS.md` — locked rules. No new ones since v0.1.0 — TDD, surgical edits, push after substantive commits, batched reviewer-fix commits, secret handling.
3. `projects/community-platform/GOTCHAS.md` — operational patterns; reference by number when a task hits one.
4. `projects/community-platform/HANDOFF_PROTOCOL.md` — hardening checklist (§1), assumption pitfalls (§2), output conventions (§4), wrap-up artifacts (§9).
5. `docs/playbooks/recurring-plan-defects.md` — code-level patterns from v0.1.0 + v0.1.1.
6. Memory: `project_community_platform_invitation_feature.md` — v0.1.1 shipped status + lessons learned (test paths, lint quirks, Next 16 cookies-in-server-components, Vercel branch scoping, etc.).

DO NOT pre-read `plan.md` (v0.1.0) or `v0.1.1-plan.md` (v0.1.1) — both are historical now.

## This chat owns (menu — pick one or batch a few)

### Option A — finalise Mark Spasonov backfill (≤15 min)

PR #3 is open as Draft on branch `chore/mark-spasonov-backfill` with two placeholders. Anton needs to gather:
- Mark's Telegram handle (e.g. `@username`)
- Mark's primary git author email

Then either:
- Edit the PR via GitHub web UI to replace `@MARK_TELEGRAM_HANDLE_TBD` and `MARK_GIT_EMAIL_TBD` → mark Ready → merge.
- OR push a fixup commit + mark Ready + merge.

Acceptance: `grep -rn '_TBD' community/members/` returns 0 hits on main; future Mark commits resolve to `@markspas` in the contributions counter.

### Option B — branch protection on `main`

GitHub Settings → Branches → main → Add rule:
- Require pull request before merging: ON.
- Allow specified actors to bypass required pull requests: add `warsaw-ai-bot` GitHub App (so the bot's writes from `/onboard` redemption don't need a PR per commit).
- Restrict deletions: ON.
- Block force pushes: ON.

Acceptance: confirm via `gh api repos/anton1rsod/warsaw-ai-community/branches/main/protection` returns the rules.

### Option C — `COMMUNITY_NAME` / `COMMUNITY_SLUG` re-set with `--no-sensitive`

Currently flagged sensitive on production, so `vercel env pull` returns empty quotes. Not blocking runtime; affects ops inspectability.

```bash
# For each: rm + add with --no-sensitive
vercel env rm COMMUNITY_NAME production --yes
vercel env add COMMUNITY_NAME production --value "Warsaw AI Community" --no-sensitive --yes
# Repeat for COMMUNITY_SLUG and the preview-scope counterparts
```

Acceptance: `vercel env pull .env.production-check --environment=production` returns the actual values for both.

### Option D — Persona slug↔folder mismatch fix

`Mark Spasonov` slugifies to `mark-spasonov` but his persona folder is `mark-s` → `PersonaPanel` won't render his persona. Same for `Maksym Pavlenko` (would slugify to `maksym-pavlenko`, folder `maksym-p`). Two solutions:

1. **Rename folders** to match display-name slugs — simplest, breaks any external links to the old folder paths.
2. **Add a `persona_id` lookup** in `lib/roster.ts` analogous to `lib/git-email-aliases.ts` — robust, more code.

Recommend Option 1 unless someone's bookmarked the old paths. Anton's call.

Acceptance: visiting `/members/mark-spasonov` (post-Mark-backfill) renders his persona panel.

### Option E — Merge drafted CI workflow

`.github/workflows/ci.yml` is in the working tree (untracked). It runs `pnpm install --frozen-lockfile`, `pnpm tsc --noEmit`, `pnpm vitest run`, `pnpm e2e --retries=2`, and the H-grep gate on PRs.

Acceptance: a fresh PR triggers the workflow + reports green.

### Option F — v0.2 brainstorm

Per spec versioning policy: `0.2.0` = "Project / contribution tracking". Could brainstorm via `superpowers:brainstorming` to lock scope. Likely surfaces:
- Project pages with structured contribution rollups.
- Per-member contribution counters integrated into the roster page (currently they exist in `contributions.json` but aren't surfaced UI-side).
- The DB return decision (spec §6.1 classification rule) — git-only is fine for v0.1; v0.2 may benefit from a DB.

If picking F, this is a fresh brainstorming chat with `superpowers:brainstorming`. The output is `spec.md` §12 (or a v0.2-specific section) plus a fresh handoff doc.

### Option G — 24-hour PII log scan

Spec §8.6 commitment. Run `vercel logs` over a 24h production window post-traffic; grep for any leakage of tokens, emails, or PII. Empty result = ship the §8.6 row to "complete" in CHANGELOG.

### Option H — Lighthouse perf measurement against production

Spec §10 commitment. Measure CWV against authenticated routes (with cookie-injected lighthouse). Document numbers; flag any that miss the 90+ Performance budget.

## Verify-before-claiming queries (chat-specific)

Per protocol §2, run these EARLY if the chat scope touches them:

```bash
# Confirm v0.1.1 is the current production state
git log --oneline -3 main
git tag -l community-platform-v0.1.1

# Confirm Mark backfill PR state
gh pr view 3 --json state,isDraft,title

# Confirm branch protection state (Option B)
gh api repos/anton1rsod/warsaw-ai-community/branches/main/protection 2>&1 | head -20

# Confirm env-var inspectability (Option C)
vercel env pull /tmp/prod-check --environment=production --yes && grep -E "COMMUNITY_(NAME|SLUG)" /tmp/prod-check; rm /tmp/prod-check
```

## Anti-patterns (chat-specific — beyond protocol §7 universals)

- **Don't reopen v0.1.1 architecture decisions.** The 13 hardenings + spec §11 are locked at SHA `740be8e`. Any deviation needs an ADR amendment.
- **Don't batch security-sensitive options into one PR.** Branch protection (B), persona slug fix (D), CI workflow merge (E) are independent — open separate PRs. Mark backfill (A) is its own PR (#3) by Q6 lock.
- **Don't run `security-reviewer` on cleanup PRs unless they touch security-relevant surfaces.** Save the agent budget; CONSTRAINTS line 41-46 self-review is sufficient for cosmetic / config changes.
- **For Option F (v0.2 brainstorm):** start a fresh chat invoking `superpowers:brainstorming`, NOT this one. Brainstorm + plan + implement is three chats minimum per HANDOFF_PROTOCOL §8.

## Done means

For the chosen option(s):

- Acceptance criteria met (per option).
- Commit + push.
- STATE.md updated if the option changes "Pending follow-ups" or `Last verified` rows.
- If Option F: spec §12 drafted; new chat-11 handoff written; this chat closes with handoff to chat 11.

## Reference pointers

- **Spec:** `projects/community-platform/spec.md` (§11 v0.1.1 invitation at SHA `740be8e`)
- **Plan:** `projects/community-platform/v0.1.1-plan.md` at SHA `2201dd9` (historical)
- **CHANGELOG:** `projects/community-platform/CHANGELOG.md` — v0.1.1 entry at the top
- **Production:** https://warsaw-ai-community-platform.vercel.app
- **Tag:** `community-platform-v0.1.1` at merge SHA `036695c`
- **Defects playbook:** `docs/playbooks/recurring-plan-defects.md`
- **Vercel project:** `prj_UT1RQ1Bn9XuMV7UnwWSFS0THiLHS` in team `team_iEUo3hzS0aASHR0TEAB70Z8W`, Root Directory `projects/community-platform`

## Hard prerequisites

- v0.1.1 production live ✓ (deploy `fg6rfweki`, verified 2026-05-04)
- Tag pushed ✓
- Mark backfill PR #3 open as Draft ✓

## Token discipline (project memory `feedback_token_discipline`)

- Each option above is small enough to NOT need subagent dispatch — implement inline.
- Phase closeouts: typecheck + (if code touched) full vitest run.
- Don't batch unrelated options into one commit.

---

## Paste-ready prompt for chat 10

```
Warsaw AI Community Platform — Chat 10: post-v0.1.1 follow-ups + v0.2 prep

v0.1.1 shipped 2026-05-04 at merge SHA 036695c on main, tag
community-platform-v0.1.1, production live at fg6rfweki.

Read in order (~530 lines):
1. projects/community-platform/STATE.md
2. projects/community-platform/CONSTRAINTS.md
3. projects/community-platform/GOTCHAS.md
4. projects/community-platform/HANDOFF_PROTOCOL.md
5. docs/playbooks/recurring-plan-defects.md
6. memory: project_community_platform_invitation_feature.md

This chat is a MENU — Anton picks scope. Options A–H in
docs/specs/2026-05-04-community-platform-v0-1-1-shipped-followups-handoff.md:
A=Mark backfill (PR #3), B=branch protection, C=env --no-sensitive,
D=persona slug fix, E=CI workflow, F=v0.2 brainstorm,
G=24h PII log scan, H=Lighthouse perf.

A–E are inline-implement small PRs. F is a brainstorming chat
(start fresh with superpowers:brainstorming). G+H are ops checks
that close out v0.1.0 §8.6 / §10 commitments.

Done means: acceptance criteria met for chosen option(s); commit +
push; STATE updated; if Option F, chat-11 handoff drafted.

Anti-patterns:
- Don't reopen v0.1.1 architecture decisions
- Don't batch unrelated options into one PR
- Don't run security-reviewer on cosmetic cleanup
- For Option F: brainstorm + plan + implement is three chats
```

---

*Drafted 2026-05-04 immediately after v0.1.1 ship (merge `036695c`, tag `community-platform-v0.1.1`). References HANDOFF_PROTOCOL.md as the operating discipline; menu structure documents all known v0.1.1 carryovers + v0.2 entry point so the next chat doesn't re-discover them.*
