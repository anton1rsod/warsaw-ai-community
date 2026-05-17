# Chat-23 handoff: v0.4 spec-writer + ADR-0014 + user-test session

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) (loaded once at start; see §3 for chat-brief shape)

**Status (drafted in chat-22 close-out, 2026-05-18):** Chat-22 brainstorm is CLOSED. All 28 [blocking] Qs + 38 [tuning] Qs Anton-locked via interactive review. Brainstorm output at `docs/specs/2026-05-17-community-platform-v0-4-brainstorm-output.md` (~1180 lines: D21–D44 decision log + H56–H68 hardening list + ADR-0014 candidate + V0_5_BACKLOG additions + 14 open questions for chat-23).

Chat-23 turns the brainstorm-output into a spec §14 + ADR-0014. Critically, **chat-23 must run a 30-min user-test session BEFORE locking spec §14** — this gates the spec on real friction observations.

---

## Setup

Starts on `main` (chat-22 commit pushed). Branch off `main` for spec work.

```bash
cd "$HOME/Projects/Warsaw AI Comunity" && git fetch && git checkout main && git pull
git checkout -b chore/community-platform-v0-4-spec
```

## Read in order (~480 lines total, within budget)

1. **This handoff** (~200 lines).
2. **`projects/community-platform/STATE.md`** (~210 lines) — current state; chat-22 closure recorded.
3. **`projects/community-platform/CONSTRAINTS.md`** (~85 lines) — locked rules.
4. **`projects/community-platform/HANDOFF_PROTOCOL.md`** (~150 lines) — protocol; once-per-project read.
5. **`docs/specs/2026-05-17-community-platform-v0-4-brainstorm-output.md`** (~1180 lines) — THE source-of-truth for chat-23. Read decision log §14, hardenings §15, ADR-0014 candidate §16, open questions §18 carefully.
6. **`docs/decisions/0012-community-platform-v0-3-discovery-posture.md`** (LOCKED) — read to draft ADR-0014 amendments correctly.
7. **`docs/research/v0-4-benchmark-dossier.md`** — reference when wording spec sections that need to anchor on a platform pattern (PostHog primary + Linear/Claude/Notion accents).
8. **`docs/research/v0-4-ux-baseline/README.md`** + screenshots — current v0.3.1 baseline for the user-test session.

**Skip:** `spec.md` whole-doc; `plan.md`; `CHANGELOG.md`. Read specific §X.Y on demand only.

## Verify-before-claiming queries (run early)

| Query | Why |
|---|---|
| `Read projects/community-platform/spec.md` § structure | spec §13 is the v0.3 section; spec §14 is the v0.4 section to write. Identify the insertion point. |
| `grep -n "PUBLIC_PATHS" projects/community-platform/proxy.ts` | ADR-0014 implementation amends PUBLIC_PATHS — locate the existing list. |
| `Read community/charter/charter.md` | `/handbook` content references the charter — confirm content shape. |
| `ls docs/decisions/` | Confirm ADR-0013 does NOT exist (it was dropped); ADR-0014 is the new ADR number to claim. |
| `Read projects/community-platform/CHANGELOG.md` last 50 lines | Confirm v0.3.1 entry + chat-22 closure entry shape for v0.4 entry. |
| `grep -rn "PersonaPanel" projects/community-platform/` | Confirm v0.2 PersonaPanel component location for "preserve as-is" lock. |
| `ls persona-builder/personas/` | Confirm folders (`anton-s`, `mark-spasonov`, `dmitry-b`) for H68 CI integrity check spec. |

## This chat owns

### Pre-spec MANDATORY user-test session (per office-hours sharpening Q5)

**Run BEFORE writing any spec content:**
1. Recruit 2 existing Telegram members + 1 prospective member (non-member from Warsaw AI scene).
2. Show them production v0.3.1 (`https://warsaw-ai-community-platform.vercel.app`).
3. Anonymous flow first: land on `/` (redirects to `/login`), then on `/home`, then click around the 5-card nav.
4. Signed-in flow next (for the 2 existing members): `/me/edit`, `/this-week`, RSVP scenario.
5. Capture: what they CLICK, what CONFUSES them, what they IGNORE, what they ASK ABOUT.
6. Document findings at `docs/research/v0-4-user-test-2026-05-XX.md`.
7. **If findings contradict any chat-22 lock (D21–D44), amend the brainstorm-output BEFORE writing spec §14.** Cross-reference the finding to the specific D-id in the amendment.

This is the highest-leverage activity between chat-22 and chat-23 ship. ~1-2 days of out-of-band time (member-recruit + 30-min session + writeup). DO NOT skip.

### Spec §14 — written from chat-22 brainstorm-output + user-test findings

Add §14 to `projects/community-platform/spec.md` after spec §13. Section layout:
- **§14.0** Intro — quote Q-1.1 ambition sentence; frame v0.4 thesis.
- **§14.1** Visual character — D22 character lock; cite dossier; visual-language tokens (wordmark, accent ramp `#f59e0b`, Inter typography).
- **§14.2** Information architecture — D26 top nav; D27 calendar unify; D28 /decisions gated; D29 /projects+/members gated; D31 detail template family.
- **§14.3** Routes added/changed — `/` (NEW), `/calendar` (NEW), `/handbook` (NEW), `/feed/meetings.xml` (NEW), `/feed/events.xml` (NEW), `/home` (signed-in dashboard pane added), `/members/[slug]` (PersonaPanel v0.2 preserved); old `/events` + `/meetings` URL-accessible aliases preserved.
- **§14.4** Components — `<Header>`, `<Footer>`, `<Avatar>`, `<ListItem>`, `<DateTime>`, `<Tag>`, `<EmptyState>` (Phase A list).
- **§14.5** Anonymous vs members-only posture — cite ADR-0014; Q6.1 A1 lock table.
- **§14.6** Manipulation-resistance section — passive "Your week", neutral event ribbon, no-scarcity defaults (chat-22 §14B audit).
- **§14.7** GDPR / threat-model — GitHub-avatar-via-Vercel-proxy data flow; opt-out (`photo: false`); H59 allowlist; H66 RSVP roster visibility.
- **§14.8** Strict-list (100% coverage) — Phase A files; v0.4.0 ship subset.
- **§14.9** Hardening table — H56–H62 + H64–H68 (12 entries); test-prefix `describe("H<n>: ...")` convention.
- **§14.10** Scope envelope — Phase A committed + Phase B + C conditional table (per D44).
- **§14.11** Out-of-scope confirmation — Q11.1–Q11.6 + the dropped ADR-0013 (deferred to v0.5+).

### ADR-0014 — write at `docs/decisions/0014-community-platform-v0-4-root-anonymous-landing.md`

Use ADR-0012's structure as the template. Sections:
- Context (current `/` 307→login; v0.4 thesis needs anonymous landing).
- Decision (`/` anonymous-public with hero+CTA; signed-in `/` 302→`/home`).
- Consequences (easier: anonymous discovery; harder: session-coupled rendering risk → H56 mitigation).
- Implementation (proxy.ts PUBLIC_PATHS addition; `app/page.tsx` hero composition).
- Change-control (reversal cost low; remove from PUBLIC_PATHS).

Cite Q-1.1 (ambition sentence) and Q1.2 (hero layout) for the hero design rationale.

### `design-shotgun` mid-stream for visual lock

Run after §14.1 visual character is drafted, before §14.2 IA section. Resolve open questions:
- **O2** wordmark setting (kerning, weight)
- **O3** accent ramp exact hex values (verify `#f59e0b` ramp)
- **O7** mobile slide-in nav animation
- **O12** `<Tag>` color mapping

The skill produces ~3 visual variants for each → pick + commit.

### Lock the 14 open questions (O1–O14)

Each open question (per brainstorm-output §18) needs a lock in spec §14. Some lock via design-shotgun (O1, O2, O3, O7, O12). Some via spec-writing decisions (O4–O6, O8–O11, O13). One via the user-test session (O14).

### Three threat-audit tasks (chat-22 §14C requirement)

1. Spec §14.7 — document GitHub-avatar-via-Vercel-proxy data flow + `photo: false` opt-out.
2. Hardening H56-H68 mapped to specific test files (e.g., `tests/unit/h-v0-4.spec.ts` describe blocks).
3. Cache-Control headers verified on ADR-0014 `/` — confirm `Cache-Control: private, no-cache, no-store` posture per v0.3.1 `/home` baseline.

### Draft chat-24 plan-writing handoff

At `docs/specs/<chat-24-date>-community-platform-v0-4-plan-writing-handoff.md`. Includes:
- Spec §14 + ADR-0014 references (locked sources).
- User-test findings reference.
- Phase A task decomposition target (~20-25 tasks; each maps to a Phase A file).
- TDD discipline reminder (CONSTRAINTS line 25).
- 4-phase rollout reminder (Phase A committed; B/C conditional post user-test).

## Done means

1. `docs/research/v0-4-user-test-<date>.md` written (user-test findings captured).
2. Brainstorm-output amended in-place if user-test contradicts any lock (cross-referenced to specific D-id).
3. `projects/community-platform/spec.md` has §14 added (~600-900 lines).
4. `docs/decisions/0014-community-platform-v0-4-root-anonymous-landing.md` written (~50-80 lines).
5. `design-shotgun` artifacts saved to `docs/research/v0-4-design-shotgun-<date>/` (3 variants per visual decision).
6. 14 open questions (O1–O14) all locked in spec §14.
7. STATE.md updated (`phase` field → `v0.4 spec drafted`; `v0_4_spec_sha` row added).
8. V0_5_BACKLOG.md continues to capture any new deferrals.
9. Memory entry `project_community_platform_v0_4_spec.md` written.
10. Chat-24 plan-writing handoff drafted at `docs/specs/<chat-24-date>-community-platform-v0-4-plan-writing-handoff.md`.
11. Commit + push (single PR per chat-22 PR-vs-direct memory exception: spec is a CI-trigger path).

## Anti-patterns (chat-23 specific)

- **Don't re-litigate chat-22 locks (D21–D44).** Anton spent 30+ rounds locking these via interactive review.
- **Don't expand v0.4 scope beyond Phase A committed + B/C conditional.** Q10.1 lock is firm.
- **Don't write ADR-0013.** It was dropped per Q6.1 A1 (`/decisions` stays gated).
- **Don't surface ADR markdown content on `/handbook` UI in v0.4.** Per Q6.1 (i) resolution: links to GitHub for ADRs.
- **Don't skip the user-test session.** It's MANDATORY per office-hours sharpening Q5. Even a 30-min observation pass is the single highest-leverage v0.4 input.
- **Don't pre-commit v0.5+ placement.** Per [[feedback_ia_defer_future_placement]] — Skills/Academy/GBrain Q&A/Personas v2 all have "TBD placement" in V0_5_BACKLOG.
- **Don't expand the design-shotgun beyond visual locks.** Don't use it to revisit IA decisions; those are D26+ locked.
- **Don't use AskUserQuestion to walk Anton through every Q1–O14.** chat-22 already locked the brainstorm; chat-23 should converge on the spec with one or two AskUserQuestion only for genuine ambiguity in the brainstorm.

## Skill sequence (chat-23)

1. **Pre-spec:** user-test session ~30 min + writeup ~1 hr.
2. **Spec writing:** `superpowers:spec-writer` for spec §14 + ADR-0014.
3. **Visual lock:** `design-shotgun` mid-stream for O1/O2/O3/O7/O12.
4. **Open-question locks:** spec-writer inline for O4/O5/O6/O8/O9/O10/O11/O13.
5. **Self-review:** HANDOFF_PROTOCOL §1 C1–C4 pass.
6. **Commit + push** (PR for cross-cutting code-touched paths).

## Reference pointers

- **Brainstorm output (chat-22):** `docs/specs/2026-05-17-community-platform-v0-4-brainstorm-output.md`
- **Chat-22 handoff (input):** `docs/specs/2026-05-17-community-platform-v0-4-ux-ia-brainstorm-handoff.md`
- **Benchmark dossier:** `docs/research/v0-4-benchmark-dossier.md`
- **UX baseline (chat-22 pre-brainstorm prep):** `docs/research/v0-4-ux-baseline/`
- **Questionnaire (chat-22 input):** `docs/specs/2026-05-17-community-platform-v0-4-questionnaire.md`
- **ADR-0012 (LOCKED — amended by ADR-0014):** `docs/decisions/0012-community-platform-v0-3-discovery-posture.md`
- **Production v0.3.1:** `https://warsaw-ai-community-platform.vercel.app` (deploy `ivbncdcvq`, tag `community-platform-v0.3.1`)
- **Memory:** `project_community_platform_v0_3_ship.md`, [[feedback_ia_defer_future_placement]]

## Paste-ready prompt for chat 23

```
Warsaw AI Community Platform — Chat 23: v0.4 spec writing + ADR-0014 + user-test session

Status: chat-22 brainstorm CLOSED. All 28 blocking + 38 tuning Qs Anton-locked.
Brainstorm output committed to main at
docs/specs/2026-05-17-community-platform-v0-4-brainstorm-output.md (D21–D44 +
H56–H68 + ADR-0014 candidate + V0_5_BACKLOG additions + 14 open questions).
v0.4 thesis: lift v0.3.1 into PostHog + Linear + Claude/Notion character with
global shell + `/` anonymous landing + `/handbook` + `/calendar` + warm amber
accent. Phase A COMMITTED; Phase B + C CONDITIONAL on user-test feedback.

Working dir: ~/Projects/Warsaw\ AI\ Comunity/projects/community-platform/

Read in order:
1. This handoff (~200 lines)
2. STATE.md / CONSTRAINTS.md / HANDOFF_PROTOCOL.md (~480 lines total)
3. docs/specs/2026-05-17-community-platform-v0-4-brainstorm-output.md (~1180 lines)
4. ADR-0012 (locked); benchmark dossier (reference)

MANDATORY pre-spec deliverable: 30-min user-test session with 2 existing
members + 1 prospective member. Capture friction. Amend brainstorm-output if
findings contradict any chat-22 lock. THEN write spec §14.

Skills:
- superpowers:spec-writer (spec §14 + ADR-0014)
- design-shotgun (mid-stream for visual locks O1/O2/O3/O7/O12)
- NOT yet: superpowers:writing-plans (chat-24), design-html (post-spec)

Anti-patterns:
- Don't re-litigate D21–D44 (chat-22 locks).
- Don't write ADR-0013 (dropped per Q6.1 A1).
- Don't surface ADR content on /handbook UI (per Q6.1 (i)).
- Don't pre-commit v0.5+ placement (per feedback_ia_defer_future_placement).
- Don't skip the user-test session.

Done means: spec §14 added + ADR-0014 written + 14 open questions locked +
3 threat-audit tasks done + design-shotgun artifacts saved + STATE updated +
chat-24 plan-writing handoff drafted + commit/push.
```
