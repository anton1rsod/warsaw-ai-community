# Chat-51 handoff — engagement brainstorm (c) then Phase B (a)

**Read order (skip the `claude-soul-resume` skill — direct reads only):**
1. `projects/community-platform/STATE.md` snapshot block (~lines 1–45)
2. This file
3. `projects/community-platform/V0_5_BACKLOG.md` — Phase B source (chat-22 deferrals + chat-44 candidates)

## Where things stand (set by chat-50, 2026-05-28)

**v0.9.x CLOSED.** v0.9.1.1 SHIPPED via PR #46 squash-merge at `8b12e83`; tag `community-platform-v0.9.1.1` pushed; STATE+CHANGELOG flipped at `3345fb1`. 1450/1450 tests; CI green 1m41s; Vercel previews green both projects.

**Orchestrator-side prod smoke (chat-50) — 5/5 PASS** against `warsaw-ai-community-platform.vercel.app` as `anton1rsod` (Playwright MCP session retained):

| Section | Surface | Result |
|---|---|---|
| 3 | `/admin/health` | C9 tile + 4-week table; no 500; rounded=0 / neutral=0 / dark=0 |
| 4 | `/onboard` not-found | **v0.9.1.1 primary fix verified** — Geist 600 40px h1 + `// onboard` MonoLabel + dust body |
| 4 | `/admin/invite` | C7 cream-deep inputs + 2px ink left border; Pill min-h 24px (H101) |
| 5 | `/events` + `/events/[slug]` signed-in | Pills correct; RSVP UI correctly gated to upcoming events (meetup #4 is past) |
| 6 | Soft-nav `/home → /calendar → /projects` | H90 amber-migration works on prod (chat-44 v0.8.1 fix holds) |

Screenshots at repo root: `v0-9-1-1-prod-no-access-signed-in.png`, `v0-9-1-1-prod-admin-health.png`, `v0-9-1-1-prod-onboard-not-found.png`, `v0-9-1-1-prod-admin-invite.png`, `v0-9-1-1-prod-projects-active.png`.

**Anton-side prod smoke (still pending, NOT blockers for chat-51):** Section 1 ConsentModal Escape (destroys session), Section 2a/2b `.prose-warm` overflow (textarea paste), Section 5 anon parts, Section 6 macOS dark + hover. **Any regression → v0.9.1.2 hotfix on its own branch; does NOT belong in this chat.**

**Strategic signal that motivated path (c)**: chat-50 `/admin/health` probe surfaced **0/2 active posters this week (0%)** vs. the v0.1 launch target of 50%+. Platform UI is at a high bar; engagement is the binding constraint.

## What chat-51 owns

### Phase (c) FIRST — engagement brainstorm via `superpowers:brainstorming`

**Question:** "What would move the active-poster rate from 0% → 25% in 4 weeks?"

Surface levers across three axes (don't pre-decide):
- **Demand-side**: invitation cadence, Telegram funnel quality, moderator outreach, content seeding, member-onboarding follow-up cadence
- **Platform-side**: first-post UX friction, status-update prompts on `/this-week`, weekly digest email, RSVP follow-up nudges, "your week" empty-state CTA strength
- **Org-side**: programming cadence (events, meetings), member onboarding interview, opt-in cohort outreach, content commitments

**Output:** brainstorm doc at `docs/specs/2026-05-28-community-platform-engagement-brainstorm.md`. Identify top 1-2 highest-leverage levers + their axis (platform / demand / org).

**If platform-side levers win** → they become the sharpened brief for Phase (a), possibly **overriding the chat-22 Phase B scope** in V0_5_BACKLOG.
**If org-side levers win** → no PR this chat; Phase (a) proceeds as the V0_5_BACKLOG-defined Phase B unchanged.

### Phase (a) SECOND — Phase B detail-page upgrades (scope source: V0_5_BACKLOG.md line 104)

After (c) lands:
- **Q3.2** — unified 3-variant detail-page template family
- **Q5.6** — PostHog team-page-style member profile (`/members/[slug]`)
- **Q5.7** — Luma-style event detail (`/events/[slug]`)
- **Q5.8** — project portfolio framing with per-project Decisions section

V0_5_BACKLOG estimate: ~15 files, ~1 wk. **May get re-scoped by (c) findings.**

**Recommended skill chain**: `superpowers:brainstorming` (scope Phase B against (c) findings) → `superpowers:writing-plans` → handoff to chat-52 for `superpowers:subagent-driven-development`. If all three fit one chat, ship together; otherwise let plan-writing slip to chat-52 and execute in chat-53.

## Anti-patterns (this chat)

- **Don't invoke `claude-soul-resume`** (per `[[feedback_skip_claude_soul_resume]]`).
- **Don't skip brainstorming** (per `[[feedback_dont_skip_brainstorming]]`). Even though Phase B is enumerated in V0_5_BACKLOG, re-brainstorm its scope against (c) findings before spec-locking.
- **Don't pre-commit Phase B v0.10 placement** if (c) surfaces a more leveraged demand-side lever (per `[[feedback_ia_defer_future_placement]]`).
- **Don't bundle (c) findings into a Phase B PR.** (c) is brainstorm-only this chat; its PR (if any) is docs-only direct-to-main.
- **Don't burn the chat on Anton-side residual prod smoke** — those go through a v0.9.1.2 hotfix if any regression surfaces, separately.

## Deferred-from-chat-50 (not in scope here)

- Anton-side residual prod smoke (Section 1 + 2a/2b + 5 anon + 6 dark) → v0.9.1.2 if needed
- MSW migration of `_test-*-store` family (chat-47 deferral) → own version (v0.9.2 or v0.10 candidate)
- Mark Spasonov roster backfill (PR #3 Draft) → blocked on Mark's external data
- CSP + security headers (chat-23 §7) → own security-mode pass
