# Chat-32 handoff: Meetup-#4 day-of verification + v0.5.0 ready-to-execute

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) §3 chat-brief shape (loaded once at start).

**Status (drafted chat-31 closeout, 2026-05-21 — meetup day):** Chat-31 produced the full pre-implementation pipeline for v0.5.0 in one session — seed → spec §15 → ADR-0015 (Accepted) → `v0.5.0-plan.md` (2447 lines, 35 tasks, ~3.5 days). All docs-only, all direct-to-main pushed.

| Artifact | Commit |
|---|---|
| Brainstorm seed + V0_5_BACKLOG entry | `2b9bcb5` |
| spec.md §15 + ADR-0015 Accepted + README ADR index | `7c3d46f` |
| `v0.5.0-plan.md` via `superpowers:writing-plans` | `bc5e97d` |

**Pending Anton-side before chat-32 starts:** Signed-in flow on v0.4.8 deploy (carried over from chat-30→chat-31 handoff): sign in as `anton1rsod` → `/events/2026-05-21-meetup-4` → expect Header signed-in chip top-right + EventRsvpButton at ✓ Going server-rendered (no flicker). This is the last canonical surface validation before v0.4.x is fully done.

---

## Setup

```bash
cd "$HOME/Projects/Warsaw AI Comunity" && git fetch && git checkout main && git pull
# main HEAD should be at bc5e97d or later
```

## Read order (~400 lines budget)

1. **This handoff** (~120 lines).
2. **`projects/community-platform/STATE.md`** Snapshot block + `v0_4_8_*` row (current production state).
3. **`docs/specs/2026-05-20-community-platform-v0-4-8-shipped-followups-handoff.md`** §"Option N" (acceptance criteria mostly unchanged — re-use).
4. **If Option v0.5 picked:** `projects/community-platform/v0.5.0-plan.md` lines 1-100 (overview + Phase 0 tasks) + `spec.md` §15.0–§15.4 + `docs/decisions/0015-admin-write-permissions-for-events.md`.

## Chat 32 owns: pick 1-3 options (token discipline)

### Option N — Day-of Meetup #4 verification (TODAY, MANDATORY if ≥1 ICS subscriber attends)

**~10 min Anton-driven + 10 min me-driven via Playwright.** Today before 19:00 Europe/Warsaw:

- Subscribers' calendar apps display the event at 19:00 their local time (where their tz currently matches Warsaw — CEST UTC+2). Capture any time-mismatch report as `v0_4_6_ics_subscriber_evidence` STATE row.
- Prod `/events/2026-05-21-meetup-4` roster: "Going (N total)" where N = `anton1rsod` + any other RSVPs accumulated since `fd6c2e4`.
- `community/members/anton-safronov.md` frontmatter `events_going: [2026-05-21-meetup-4]` (already true; sanity check it didn't get clobbered).
- Final v0.4.8 signed-in flow validation (the carried-over pending Anton-side check from above): sign in → page → Header signed-in chip + ✓ Going server-rendered.

### Option v0.5 — v0.5.0 admin-events-new execution (READY-TO-EXECUTE; lower priority than N today)

**~3.5 days, single-chat-feasible via `superpowers:subagent-driven-development`.** All preconditions met by chat-31:
- Spec locked (§15, `7c3d46f`)
- ADR-0015 Accepted (same commit)
- Plan written (`bc5e97d`, 2447 lines, 35 tasks across 5 phases)
- 12 hardenings H69-H80 mapped 1:1 to test blocks
- Source-vs-spec verifications already done

**Branch:** `chore/community-platform-v0-5-impl`. **Recommended trigger:** AFTER Option N completes today + Phase B gate (Option F) is decided 2026-05-25. Premature v0.5.0 start risks under-prioritizing today's meetup. **Acceptable trigger:** if Option N completes early and Anton wants to start Phase 0+1 (the lib-only days; ~½ day each) before Option F window opens.

### Option F — Phase B activation gate (window opens 2026-05-25)

**Defer to chat-33+ unless run after 2026-05-25.** 4d post-meetup landing data required (PostHog volume + retro notes). If green → plan Phase B (detail-template family + member team-page + project portfolio + per-project Decisions). If not → defer to v0.6 brainstorm.

### Option Z — Residual cleanup (skip)

A.PWA blocked on host tooling; M Vercel bypass token = recommend SKIP. Don't spend chat-32 cycles unless meetup retro surfaces a new operational need.

---

## NOT for chat-32

- Re-litigating chat-22/23/24/31 D-locks / Q-locks / O-locks / H-IDs / ADR-0015.
- Modifying `v0.5.0-plan.md` task ordering — execute as written or flag a Phase-N self-review gap.
- Pre-emptive force-dynamic on `/meetings/[slug]` or `/projects/[slug]` (still on the chat-30 anti-pattern list).
- New SSG-on-auth-aware surfaces — pattern is now dynamic page when Header needs viewer state.

## Anti-patterns (chat-32 specific)

- **Don't start v0.5.0 implementation before Option N completes** unless the meetup verification finishes very early. Today's meetup IS production; v0.5.0 work is non-urgent.
- **Don't ship a hotfix unless prod is actually broken during Option N.** Three back-to-back hotfixes in chat-30 was already at the limit; further cleanup → v0.5.1.
- **Don't merge `community-platform-v0.5.0` PR before the meetup ends.** Vercel auto-deploys on main; a build glitch mid-merge could break `/events/2026-05-21-meetup-4` for arriving attendees. Hold any v0.5 main merges until ≥21:30 Warsaw (post-meetup wind-down).
- **Don't re-write the chat-31 plan.** It's been self-reviewed; execute as-is.

## Done means

- Chat-32 picked at least Option N; ideally also began v0.5 Phase 0+1 if time permits.
- Each picked option executed per its acceptance criteria.
- Option N findings captured in STATE.md `Last verified` (one new row per surface checked).
- Commits pushed; PR opened only if code-bearing (per [[feedback_pr_vs_direct]]); direct-to-main for docs-only.
- Closeout commit lands a chat-32→chat-33 handoff if anything material remains pending.

## Reference pointers

- **Chat-31 commits:** `2b9bcb5` seed · `7c3d46f` spec+ADR · `bc5e97d` plan
- **Chat-30→chat-31 handoff:** [`2026-05-20-community-platform-v0-4-8-shipped-followups-handoff.md`](2026-05-20-community-platform-v0-4-8-shipped-followups-handoff.md)
- **v0.4.x production state:** STATE.md `v0_4_8_event_page_dynamic` row
- **v0.5.0 read bundle:** `spec.md` §15 + `0015-admin-write-permissions-for-events.md` + `v0.5.0-plan.md` (~3000 lines combined for full execution context)
- **Meetup event source:** `community/events/2026-05-21-meetup-4/README.md`
- **Bot RSVP commit:** `fd6c2e4` on main (proves the v0.4.7 chain works end-to-end)
- **Memory:** `[[project_community_platform_v0_5_admin_events_seed]]` — full chat-31 outcome captured

---

*Authored 2026-05-21 (chat-31 closeout, meetup day). Anton corrected the date mid-chat — "Not tomorrow, today" — confirming the system-prompt `currentDate` had rolled past midnight Warsaw-local. Chat-32 trigger: whenever today; primary task = Option N before 19:00 Europe/Warsaw.*
