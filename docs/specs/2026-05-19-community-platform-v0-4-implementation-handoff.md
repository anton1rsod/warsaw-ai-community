# Chat-25 handoff: v0.4.0 Phase A implementation (subagent-driven-development)

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) (loaded once at start; see §3 for chat-brief shape)

**Status (drafted in chat-24 close-out, 2026-05-18):** Chat-24 plan writing CLOSED. `projects/community-platform/v0.4.0-plan.md` (5035 lines) committed at SHA `42ad76b` on `chore/community-platform-v0-4-plan`. 21 tasks across 4 phases. H56-H68 mapped (12 IDs; H63 retired; H61 deferred to Phase C — 11 active in Phase A) via `describe("H<n>:")` test-prefix convention. 14 spec open questions O1–O14 (from chat-23) + 2 plan-level (O8 defer, O10 flat-keys) all locked. ADR-0014 currently `Status: Proposed` — flips to `Status: Accepted` at Phase A.0.1.

Chat-25 turns the plan into shipped Phase A (v0.4.0).

---

## Setup

Starts on `chore/community-platform-v0-4-impl`. Branch off `main` once chat-23 spec PR + chat-24 plan PR both land; otherwise branch off `chore/community-platform-v0-4-plan` (chain).

```bash
cd "$HOME/Projects/Warsaw AI Comunity" && git fetch && git checkout main && git pull
# IF chat-24 PR merged:
git checkout -b chore/community-platform-v0-4-impl
# IF chat-24 PR still open:
git checkout chore/community-platform-v0-4-plan && git pull
git checkout -b chore/community-platform-v0-4-impl
```

## Read in order (~520 lines total)

1. **This handoff** (~110 lines).
2. **`projects/community-platform/STATE.md`** (~240 lines) — chat-24 row recorded.
3. **`projects/community-platform/CONSTRAINTS.md`** (~85 lines) — locked rules.
4. **`projects/community-platform/HANDOFF_PROTOCOL.md`** (~165 lines) — protocol; once-per-project read.
5. **`projects/community-platform/v0.4.0-plan.md`** Header + Locks + Open questions + File structure + Hardening grep target (lines 1–~470). Then read each task by line range as you execute it — do NOT pre-read all 21 task bodies.
6. **`projects/community-platform/spec.md` §14** (lines 2517–3045) — by-need; the plan cites specific subsections.
7. **`docs/decisions/0014-community-platform-v0-4-root-anonymous-landing.md`** — read once at Phase A.0.1.

**Skip:** chat-22 brainstorm-output (already crystallized into spec §14); walkthrough findings (already crystallized into spec §14 + ADR-0014). CHANGELOG (read on demand only).

## Verify-before-claiming queries (run early)

| Query | Why |
|---|---|
| `grep -n "PUBLIC_PATHS" projects/community-platform/proxy.ts` | Confirm current state before Phase A.0.5 diff (two arrays — production lines 22–35 and dev lines 37–56). |
| `grep -rn "HomeHeader" projects/community-platform/app/ projects/community-platform/tests/` | Before Phase A.2.4 deletion — confirm no consumer outside the home-page test file. |
| `cat .github/workflows/ci.yml \| grep "validate-events"` | Phase A.3.2 mirrors the existing pattern; verify the name + working-directory. |
| `grep -n "NextResponse.next()" projects/community-platform/proxy.ts` | Phase A.2.5 sub-edit — confirm all `next()` paths get the `x-pathname` header. |
| `Read projects/community-platform/v0.3.0-plan.md` line range for Task 1.1 | Mirror the task-body structural pattern. |

## This chat owns

### Implementation of Phase A only (v0.4.0)

Execute the 21 tasks in `v0.4.0-plan.md` via `superpowers:subagent-driven-development`. Order: A.0 → A.1 → A.2 → A.3. Within each phase, task order is locked (later tasks consume earlier outputs).

**Skill sequence:**
1. **`superpowers:subagent-driven-development`** (primary) — one fresh subagent per task; two-stage review between tasks (first subagent implements; reviewer subagent checks before marking complete).
2. **`superpowers:systematic-debugging`** (on red tests) — debug-then-fix; don't bypass safety checks. Pattern 9 (Playwright cold-start flakes) → use `--retries=2` for E2E.
3. **`superpowers:verification-before-completion`** (before claiming Phase A done) — full DoD walk.
4. **`code-review:code-review`** (after Phase A.3.3 reviewer-agent dispatch — only if monthly Claude cap permits; otherwise CONSTRAINTS self-review checklist lines 50–59).

### NOT for chat-25

- Phase B implementation (per D44 — conditional on landing data; chat-27+ owns).
- Phase C implementation (per D44 — conditional on A+B reception; chat-28+ owns).
- Re-litigating any D21–D44, O1–O14, O8, or O10 lock — chat-23/chat-24 are source of truth.
- Re-running design-shotgun — spec §14 + plan "Open questions LOCKED" section lock variants inline.
- Brand-asset polish beyond what Phase A.3.1 specifies (custom illustrations etc. are Phase C).
- Re-litigating ADR-0014 amendments to ADR-0012 (ADR-0014 is the source of truth for the `/` flip + extends ADR-0012's posture set).

## Done means

1. All 21 tasks in `v0.4.0-plan.md` committed and pushed to `chore/community-platform-v0-4-impl`.
2. Coverage gate met: ≥80% overall (lines + branches) AND Phase A strict-list (15 files per spec §14.8 + plan File structure) at **100% lines / 100% functions / 100% statements / ≥80% branches**.
3. Hardening grep returns 11 unique Phase A IDs:
   ```bash
   grep -rn 'describe("H5[6-9]:\|describe("H6[0-2]:\|describe("H6[4-8]:' \
     projects/community-platform/{tests,lib,app,scripts} \
     | sed 's/.*describe("\(H[0-9]\+\):.*/\1/' | sort -u | wc -l
   # Expected: 11 (H56, H57, H58, H59, H60, H62, H64, H65, H66, H67, H68)
   ```
4. `pnpm test` green; `pnpm tsc --noEmit` green; `pnpm build` green; `pnpm e2e --retries=2` green; `pnpm a11y:baseline` 0 serious/critical violations.
5. PR opened, reviewed (security-reviewer + typescript-reviewer + code-reviewer OR self-review per CONSTRAINTS lines 50–59), merged to main.
6. Tag `community-platform-v0.4.0` pushed.
7. STATE.md `phase` → `v0.4.0 shipped`; `v0_4_ship` row added in `Last verified`.
8. Memory entry `project_community_platform_v0_4_ship.md` written.
9. Chat-26 follow-on handoff drafted at `docs/specs/<date>-community-platform-v0-4-shipped-followups-handoff.md` — menu of options including Phase B activation gate (per D44 — read Phase A landing data + run user-test before activating).

## Anti-patterns (chat-25 specific)

- **Don't drift from the plan.** If a task's test code or implementation needs adjustment, document the adjustment in `execution-plan.md §9.x` (amendment slot); don't quietly diverge. The plan's task bodies are agent-friendly — drift defeats the purpose.
- **Don't bypass TDD.** Red → green → refactor → commit per task. No code commit without a failing test first. CONSTRAINTS line 26.
- **Don't pre-stage Phase B/C tasks.** Per D44, Phase A is self-contained. v0.4.0 alone is shippable if B/C never activate.
- **Don't expand the strict-list silently.** §14.8 + plan File-structure section are canonical; any new strict-list addition needs an `execution-plan.md §9.x` amendment.
- **Don't bypass H67.** Every new UI string lands in `lib/i18n/strings.ts` first; THEN the component consumes via `s()`. The grep-scan at A.3.3 fails the build if you forget.
- **Don't skip reviewer-agent dispatch lightly.** Phase A.3.3 specifies the dispatch; only fall back to CONSTRAINTS self-review checklist if the monthly cap is genuinely hit (chat-21+ pattern).
- **Don't add CSP / X-Frame-Options / Content-Security-Policy headers.** §14.7 explicitly notes CSP is a v0.5+ V0_5_BACKLOG item; adding it in Phase A is scope creep.
- **Don't flip `/decisions`, `/projects`, or `/members` to anonymous-public.** ADR-0014 only flips `/`. The other gated routes each need their own ADR (V0_5_BACKLOG).
- **Don't introduce `next-intl` or any other i18n runtime.** Phase A scaffolds `lib/i18n/strings.ts` as TS export only.

## Reference pointers

- **Plan (chat-24 source):** [`projects/community-platform/v0.4.0-plan.md`](../../projects/community-platform/v0.4.0-plan.md) at SHA `42ad76b` (5035 lines, 21 tasks).
- **Spec §14 (chat-23 source):** [`projects/community-platform/spec.md`](../../projects/community-platform/spec.md) lines 2517–3045 (~530 lines) at SHA `971f0d2`.
- **ADR-0014:** [`docs/decisions/0014-community-platform-v0-4-root-anonymous-landing.md`](../decisions/0014-community-platform-v0-4-root-anonymous-landing.md) (Proposed → Accepted at A.0.1).
- **Brainstorm output (chat-22):** [`docs/specs/2026-05-17-community-platform-v0-4-brainstorm-output.md`](./2026-05-17-community-platform-v0-4-brainstorm-output.md).
- **Walkthrough findings (chat-23 compensating control):** [`docs/research/v0-4-gstack-walkthrough-2026-05-18/findings.md`](../research/v0-4-gstack-walkthrough-2026-05-18/findings.md).
- **v0.3.0-plan.md precedent:** [`projects/community-platform/v0.3.0-plan.md`](../../projects/community-platform/v0.3.0-plan.md) (5734 lines, 36 tasks) — chat-25 mirrors the task-body template + 2-step TDD pattern.
- **Production v0.3.1:** `https://warsaw-ai-community-platform.vercel.app` (deploy `ivbncdcvq`, tag `community-platform-v0.3.1`).
- **Memory:** `project_community_platform_v0_4_brainstorm`, `project_community_platform_v0_4_spec`, `project_community_platform_v0_4_plan` (this chat writes `project_community_platform_v0_4_ship`).

## Paste-ready prompt for chat 25

```
Warsaw AI Community Platform — Chat 25: v0.4 Phase A implementation (subagent-driven-development)

Status: chat-24 plan v0.4.0-plan.md drafted at SHA 42ad76b on chore/community-platform-v0-4-plan. 5035 lines, 21 tasks across 4 phases (A.0 Foundation 5 / A.1 Components 7 / A.2 Routes 5 / A.3 Closeout 4). H56-H68 mapped (12 IDs; H63 retired; H61 deferred to Phase C — 11 active in Phase A). 14 spec open questions + 2 plan-level (O8, O10) all locked.

Working dir: ~/Projects/Warsaw\ AI\ Comunity/projects/community-platform/

Read in order:
1. This handoff (~110 lines)
2. STATE.md / CONSTRAINTS.md / HANDOFF_PROTOCOL.md (~490 lines)
3. v0.4.0-plan.md Header + Locks + Open questions + File structure + Hardening grep (~470 lines)
4. Task bodies by-need — execute A.0 → A.1 → A.2 → A.3

Skill: superpowers:subagent-driven-development — one fresh subagent per task; two-stage review between tasks.

Output:
- 21 commits on chore/community-platform-v0-4-impl
- Coverage >=80% overall + 100% on Phase A strict-list (15 files per spec §14.8)
- Tag community-platform-v0.4.0 pushed
- STATE.md / memory / chat-26 follow-on handoff updated

Anti-patterns:
- Don't drift from the plan (use execution-plan.md §9.x amendments for deviations).
- Don't bypass TDD.
- Don't pre-stage Phase B/C tasks (D44 lock).
- Don't expand the strict-list silently.
- Don't bypass H67 (all UI strings in lib/i18n/strings.ts).
- Don't add CSP headers (§14.7 V0_5_BACKLOG item).
- Don't flip /decisions, /projects, /members (ADR-0014 only flips /; others need separate ADRs).

Done means: 21 tasks shipped, tag pushed, STATE bumped, memory entry written, chat-26 handoff drafted.
```
