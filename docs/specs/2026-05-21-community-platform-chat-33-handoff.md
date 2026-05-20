# Chat-33 handoff: Meetup-#4 day-of verification + v0.5.0 Phase 4 closeout

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) §3 chat-brief shape.

**Status (drafted chat-32 closeout, 2026-05-20 T-20.5h pre-meetup):** Chat-32 executed **Option N pre-meetup slice anon-side**: 3 prod surfaces verified green via curl (`/events/2026-05-21-meetup-4` page + roster, `/api/calendar.ics` carries corrected `DTSTART:20260521T170000Z`, `community/members/anton-safronov.md` frontmatter intact). STATE.md row `meetup4_pre_meetup_verification` lands the evidence. **v0.5.0 implementation state UNCHANGED from chat-31 close**: PR #35 Draft at branch `chore/community-platform-v0-5-impl` HEAD `e226b49`, 1020/1020 tests green, Phase 4 closeout (4.1–4.6) still pending.

| Carry-forward | Owner | Window |
|---|---|---|
| Day-of subscriber calendar render check (any calendar app shows 19:00 local) | Me-driven (Playwright fetch or Anton report) | T-? before 2026-05-21 19:00 Warsaw |
| Anton signed-in flow validation on v0.4.8 deploy | Anton-driven (his browser) | T-? before 2026-05-21 19:00 Warsaw |
| v0.5.0 Phase 4 closeout (Tasks 4.1–4.6, merge PR #35, push tag) | Me + Anton | ≥ 2026-05-21 21:30 Warsaw (post-meetup) |

## Setup

```bash
cd "$HOME/Projects/Warsaw AI Comunity" && git fetch && git checkout main && git pull
# main HEAD should be at the chat-32 closeout SHA or later
git checkout chore/community-platform-v0-5-impl && git pull  # for Option v0.5
```

## Read order (~350 lines)

1. **This handoff** (~80 lines).
2. **`projects/community-platform/STATE.md`** Snapshot block + `meetup4_pre_meetup_verification` row + `v0_4_8_event_page_dynamic` row.
3. **`docs/specs/2026-05-21-community-platform-chat-32-handoff.md`** §"Option N" + §"Option v0.5" (acceptance criteria — re-use, don't re-write).
4. **If Option v0.5 picked:** `projects/community-platform/v0.5.0-plan.md` lines 1-100 (overview) + Phase 4 section (Tasks 4.1–4.6).

## Chat 33 owns: pick 1–2 (token discipline)

### Option N-day-of — Day-of Meetup #4 final verification (MANDATORY before 19:00 Warsaw)

**~5 min me-driven + 5 min Anton-driven.** Closes the two carry-forwards:

- Pull `/api/calendar.ics` and confirm `DTSTART:20260521T170000Z` still holds (no late-build regression). Subscribers' apps auto-refresh on 300s TTL.
- Roster spot-check: prod `/events/2026-05-21-meetup-4` `Going (N total)` where N ≥ 1; capture any new RSVPs accumulated since chat-32 (currently N=1, only `anton1rsod` from `fd6c2e4`).
- **Anton's signed-in flow** (browser, ~3 min): sign in → `/events/2026-05-21-meetup-4` → expect Header signed-in chip + EventRsvpButton already showing ✓ Going (server-rendered, no flicker). This is the final unverified canonical surface for v0.4.8.
- Append findings to STATE.md as **new row** `meetup4_day_of_verification` — do NOT mutate the pre-meetup row.

### Option v0.5 — v0.5.0 Phase 4 closeout (ONLY AFTER 2026-05-21 21:30 Warsaw)

**~½ day.** Plan tasks 4.1–4.6:
1. **4.1** security-reviewer dispatch on the 5 new files (`app/admin/events/new/page.tsx`, `app/components/EventForm.tsx`, `app/actions/create-event.ts`, `lib/event-author.ts`, `lib/events.ts` export edit).
2. **4.2** typescript-reviewer dispatch (same scope).
3. **4.3** code-reviewer dispatch (same scope).
4. **4.4** CHANGELOG `[0.5.0]` entry.
5. **4.5** STATE.md update + PR #35 title flip from Draft → Ready.
6. **4.6** Anton manual smoke (sign in → /admin/events/new → create test event → verify warsaw-ai-bot commit on main + Co-Authored-By trailer + `/events/<test-slug>` renders + `/api/calendar.ics` includes new VEVENT within 5 min) → revert test event → squash-merge PR #35 → push tag `community-platform-v0.5.0` → production smoke.

**Pre-merge gate:** Reviewer findings 0 CRITICAL / 0 HIGH / ≤1 MEDIUM (close inline or accept with comment).

### Option F — Phase B activation gate (window opens 2026-05-25 = 4d post-meetup)

**Defer to chat-34+ unless chat-33 fires after 2026-05-25.** If green data → plan Phase B (detail-template family + member team-page + project portfolio + per-project Decisions). If not → defer to v0.6 brainstorm.

## NOT for chat-33

- Re-running the anon-side pre-meetup checks chat-32 already cleared (event page roster, ICS DTSTART, anton-safronov frontmatter). Reference `meetup4_pre_meetup_verification`.
- Re-litigating ADR-0015 / Q-locks / H69-H80 / plan task ordering. Plan is self-reviewed; execute as written.
- Pre-emptive force-dynamic on `/meetings/[slug]` or `/projects/[slug]` (chat-30 anti-pattern list).
- Mutating the chat-32 STATE row when capturing day-of findings — add a new row.

## Anti-patterns (chat-33 specific)

- **Don't start v0.5 Phase 4 before meetup ends.** Vercel auto-deploys on main; mid-merge build glitch could break `/events/2026-05-21-meetup-4` for arriving attendees. Hold all v0.5 merges to main until ≥ 21:30 Warsaw.
- **Don't ship a hotfix unless prod is actually broken.** Three back-to-back chat-30 hotfixes was already the limit; cleanup → v0.5.1.
- **Don't claim Option N done without Anton's signed-in flow report.** The anon-side curl smoke from chat-32 covers structure; the signed-in render is the last canonical surface.

## Done means

- Option N-day-of: subscriber check + Anton signed-in flow report captured in STATE.md `meetup4_day_of_verification` row.
- Option v0.5 (if reached): PR #35 squash-merged, tag `community-platform-v0.5.0` pushed, production smoke green, CHANGELOG + STATE flipped.
- Commits pushed; PR only for code-bearing branches (per `[[feedback_pr_vs_direct]]`); direct-to-main for docs-only (STATE.md update).
- Chat-33 → chat-34 handoff drafted if anything material remains pending.

## Reference pointers

- **Chat-32 verification commit:** (set after this commit)
- **Chat-31 v0.5.0 closeout commit:** `a2524db` (handoff revision)
- **v0.5.0 branch HEAD:** `e226b49` on `chore/community-platform-v0-5-impl`
- **Draft PR #35:** https://github.com/anton1rsod/warsaw-ai-community/pull/35
- **Memory:** `[[project_community_platform_v0_5_admin_events_seed]]` + `[[project_community_platform_v0_4_ship]]`
- **Bot RSVP proving v0.4.7 chain:** `fd6c2e4` on main
- **Meetup source:** `community/events/2026-05-21-meetup-4/README.md` (date 2026-05-21, 19:00, 120 min, Grzybowska 85a, host @anton1rsod)

---

*Authored 2026-05-20 22:37 CEST (chat-32 closeout, T-20.5h pre-meetup). Chat-33 fire date: 2026-05-21 (day-of meetup + post-meetup closeout windows).*
