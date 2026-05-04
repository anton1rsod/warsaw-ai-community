# Chat 11 handoff: v0.2 brainstorm — project / contribution tracking

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) — operating discipline. Read once at session start.

**Status:** v0.1.1 SHIPPED on `main` at SHA `036695c`, tag `community-platform-v0.1.1`. Chat-10 follow-ups closed (PR #4 + PR #5 merged at `efbc85b`). This chat opens v0.2 scope via the brainstorming skill — does NOT write plan or code.

---

## Setup

Fresh chat. Branch off `main` only when committing the spec section.

Invoke **`superpowers:brainstorming`** at the very start (per HANDOFF_PROTOCOL §8 sub-skill sequence). Brainstorming → spec → plan → implement is four chats minimum; this chat is step 1.

## Read in order (~620 lines total)

1. `projects/community-platform/STATE.md` — current state. `phase: "v0.1.1 shipped"`. Pending follow-ups list confirms v0.2 brainstorm is the open item.
2. `projects/community-platform/CONSTRAINTS.md` — locked rules. Lite-slice, 100% git, members-only, etc. — v0.2 may RELAX some of these (specifically the "100% git" constraint via the §6.1 classification rule); other constraints stand.
3. `projects/community-platform/GOTCHAS.md` — operational patterns. Reference by number when relevant.
4. `projects/community-platform/HANDOFF_PROTOCOL.md` — hardening checklist (§1), pitfalls (§2), output conventions (§4), wrap-up artifacts (§9).
5. `projects/community-platform/spec.md` **§6.1 Storage classification rule** (lines 137-156). The architectural backbone — defines git-vs-DB-vs-KV. Active commitment for v0.2.
6. `projects/community-platform/spec.md` **§6.6 Contribution counter** (lines 221-231). Existing build-time mechanism; v0.2 candidate is to surface the counts UI-side.
7. `projects/community-platform/spec.md` **§6.7 Persona panel** (lines 232-238) + **§6.8 GBrain integration** (lines 240-242). v0.2 candidates noted in spec already.
8. `projects/community-platform/spec.md` **§3 Non-goals for v0.1** (lines 81-105) — many of these are v0.2 candidates (full profile editor, admin/CM-distinct UI, DM, kudos, badges, leaderboard, etc.). Use as the menu of "things explicitly deferred".
9. `projects/community-platform/spec.md` **§9 Risks & open questions** (lines 381-407) — includes v0.2 escape hatches (e.g., bot commit volume, rate limits).
10. Memory: `project_community_platform.md` (v0.1.0 ship learnings) + `project_community_platform_invitation_feature.md` (v0.1.1 lessons learned). Both inform what worked vs. what bit during v0.1.x.

DO NOT pre-read `plan.md`, `v0.1.1-plan.md`, `CHANGELOG.md`. All historical.

## Verify-before-claiming queries (run early)

```bash
# Confirm v0.1.1 ship state + chat-10 closures
git log --oneline -8 main
git tag -l community-platform-v0.1.1
gh pr list --state=closed --search "merged:>=2026-05-04" --json number,title

# Confirm spec §11 is fully closed (no v0.2 sneaking in early)
grep -n "^## 11\|^## 12" projects/community-platform/spec.md

# Confirm contribution data already exists (don't reinvent)
ls projects/community-platform/lib/__generated__/contributions.json
head -20 projects/community-platform/lib/__generated__/contributions.json
```

## This chat owns

Brainstormed v0.2 scope captured as **spec §12** (or the appropriate next-section number).

The brainstorming skill will walk through:

1. **Problem framing.** What's the strongest pull for v0.2? Three candidates from chat-10 + spec:
   - **(A) Project / contribution tracking surfaced** — per-member counts already exist in `contributions.json` but aren't displayed; project pages don't aggregate. This is the chat-10 menu's nominal v0.2 framing.
   - **(B) Profile editor UI** — §3 non-goal #1 ("Full profile editor UI"). Members today edit their `community/members/<slug>.md` via direct git PR.
   - **(C) Admin / CM-distinct UI** — §6.10 says "admin-distinct features arrive in v0.2+". Examples: roster editor, member-ops UI, moderation surfaces.
2. **Decisions the brainstorm must surface and lock (Q1, Q2, …):**
   - Which of (A)/(B)/(C) is v0.2's primary thrust? Single-thrust release vs. bundled?
   - **DB return decision** (§6.1): does v0.2 introduce DB or KV-shaped data? If yes, what specifically (rate limits? draft autosave? notification queue?). If no, defer to v0.3.
   - GBrain coupling (§6.8): does the "Ask GBrain about this project" link land in v0.2, or stay deferred?
3. **Hardenings.** As with v0.1.1's `H1`–`H13`, surface security/correctness invariants worth a `describe("H<n>: …")` test contract. Example candidates if v0.2 introduces a profile editor: idempotent CSRF, GitHub App write race, slug-conflict on rename.
4. **Versioning split.** v0.2.0 vs v0.2.1+ if the brainstorm scope is too big for one release.

The brainstorm DOES NOT:
- Write the implementation plan (that's chat-12 via `superpowers:writing-plans`).
- Write code.
- Lock decisions that touch v0.1.x already-shipped surfaces (those need an ADR amendment, not a brainstorm decision).

## Done means

- **Spec §12 (or appropriate section) drafted** in `projects/community-platform/spec.md` covering: locked decisions (Q1, Q2, …), hardenings (H<n>), data shape changes, DB return decision, scope split.
- **Spec committed** to a feature branch (e.g. `chore/community-platform-v0-2-brainstorm`) and pushed.
- **PR opened** — Draft is fine; the brainstorm output is reviewable before plan-writing.
- **STATE.md updated** — `phase: "v0.2 brainstorm"`, new `Last verified` row referencing the spec section + SHA.
- **Project memory** added: `project_community_platform_v0_2_brainstorm.md` with locked Q-decisions, summary, status timeline.
- **Chat-12 handoff drafted** at `docs/specs/2026-05-04-community-platform-v0-2-plan-writing-handoff.md` (or appropriate date) following HANDOFF_PROTOCOL §3 template — points to the spec §12 SHA + lists what plan-writing will own.

## Anti-patterns (chat-specific — beyond protocol §7 universals)

- **Don't reopen v0.1 / v0.1.1 architecture decisions.** Auth flow, RBAC, GitHub App writes, JWT sessions, proxy.ts pattern, classification rule — all locked. v0.2 brainstorm extends; does not refactor.
- **Don't predetermine the DB return.** §6.1 is a forward-looking commitment; whether v0.2 actually triggers it depends on the data shapes the brainstorm surfaces. Let the question be answered, not assumed.
- **Don't write code.** Brainstorming → spec section. If you find yourself writing TS, switch chats.
- **Don't write the plan.** Chat-12 owns plan-writing via `superpowers:writing-plans`.
- **Don't try to land all of (A)/(B)/(C) in one v0.2 release.** Likely outcome is one primary thrust + 1-2 small tag-alongs; the brainstorm surfaces the right split.
- **Don't bundle v0.2 with retroactive v0.1.x cleanup** (e.g., persona slug fix, Mark backfill). Those are chat-10 leftovers; they merge or wait, but they don't pollute v0.2 scope.

## Token discipline (project memory `feedback_token_discipline`)

- Brainstorm chat is single-purpose; no subagent dispatch needed.
- Spec section ~400-700 lines is typical for a v0.x major brainstorm (compare v0.1.1's §11 at ~617 lines).
- Inline self-review per HANDOFF_PROTOCOL §1 — don't surface findings in a separate post-publish message.

## Reference pointers

- **Spec:** `projects/community-platform/spec.md` (§11 v0.1.1 invitation at SHA `740be8e`, fully shipped)
- **CHANGELOG:** v0.1.1 entry at top
- **Production:** https://warsaw-ai-community-platform.vercel.app
- **Tag:** `community-platform-v0.1.1` at merge SHA `036695c`
- **Defects playbook:** `docs/playbooks/recurring-plan-defects.md`
- **Vercel project:** `prj_UT1RQ1Bn9XuMV7UnwWSFS0THiLHS` in team `team_iEUo3hzS0aASHR0TEAB70Z8W`, Root Directory `projects/community-platform`

---

## Paste-ready prompt for chat 11

```
Warsaw AI Community Platform — Chat 11: v0.2 brainstorm

v0.1.1 shipped 2026-05-04. Chat-10 follow-ups closed (PR #4 + PR #5
merged). v0.2 scope is OPEN — to be brainstormed in this chat.

Invoke superpowers:brainstorming at the very start.

Read in order (~620 lines):
1. projects/community-platform/STATE.md
2. projects/community-platform/CONSTRAINTS.md
3. projects/community-platform/GOTCHAS.md
4. projects/community-platform/HANDOFF_PROTOCOL.md
5. projects/community-platform/spec.md §6.1, §6.6, §6.7, §6.8, §3, §9
6. memory: project_community_platform.md +
   project_community_platform_invitation_feature.md

This chat owns: spec §12 (v0.2 scope) drafted + committed + Draft PR
+ STATE update + project memory + chat-12 plan-writing handoff.

Three v0.2 candidates from spec + chat-10 menu:
(A) Project / contribution tracking surfaced UI-side
(B) Profile editor UI (deferred from v0.1 §3 non-goals)
(C) Admin / CM-distinct UI capabilities (§6.10)

The brainstorm must lock:
Q1 — Which of (A)/(B)/(C) is the primary thrust? Bundle or single?
Q2 — DB return decision (§6.1 classification rule trigger?)
Q3 — GBrain coupling (§6.8 candidate) — in or deferred?
Q4 — Hardenings (H<n>) for security/correctness invariants
Q5 — Versioning split (v0.2.0 vs v0.2.1+) if scope is too big

Done means: spec §12 lines committed; chat-12 plan-writing handoff
drafted at docs/specs/.

Anti-patterns:
- Don't reopen v0.1.x architecture
- Don't predetermine DB return
- Don't write code or plan
- Don't bundle retroactive v0.1.x cleanup
```

---

*Drafted 2026-05-04 in chat-10 (closure session for Options F+G+D+H+B). References HANDOFF_PROTOCOL.md as the operating discipline; chat-11 is the v0.2 brainstorming step in the protocol §8 sub-skill sequence (brainstorm → plan → implement → review).*
