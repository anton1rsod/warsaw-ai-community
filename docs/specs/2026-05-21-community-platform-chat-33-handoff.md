# Chat-33 handoff: Meetup-#4 day-of verification + v0.5.0 Phase 4 closeout

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) §3 chat-brief shape.

**Status (drafted chat-32 closeout, 2026-05-20 T-20h pre-meetup):** Chat-32 executed **Option N pre-meetup slice anon-side** AND **v0.5.0 Phase 4 Tasks 4.1–4.3** (3-lane reviewer dispatch + triage + fixes; merge-gate distinction: 4.1–4.3 are branch-only, no production exposure). Anton's nudge "why did we decide to wait?" recalibrated me — only Task 4.6 (squash-merge + tag + Vercel auto-deploy on main) actually carries the meetup-window risk; everything else was conservatively over-gated.

Pre-meetup verification: 3 prod surfaces verified green via curl (`/events/2026-05-21-meetup-4` page + roster, `/api/calendar.ics` carries corrected `DTSTART:20260521T170000Z`, `community/members/anton-safronov.md` frontmatter intact). STATE.md row `meetup4_pre_meetup_verification` lands the evidence. Reviewer dispatch: 3 parallel agents on branch HEAD `e226b49`; cross-lane triage applied; real-bug fixes + i18n migration (event.create.* namespace, 21 strings) + minor LOWs committed at `ef71b7a` (Draft PR #35 picks up automatically). False positives documented: console.warn/error matches established server-action audit pattern; isAdmin from lib/content-snapshot is canonical. **1020/1020 tests still green; tsc + lint clean.**

**v0.5.0 implementation state at chat-32 close:** PR #35 Draft at branch HEAD **`ef71b7a`** (1 reviewer-fix commit on top of `e226b49`); Tasks 4.1–4.3 DONE; **Tasks 4.4–4.6 remain** = CHANGELOG `[0.5.0]` entry + STATE.md update + Anton manual smoke + squash-merge + tag + production smoke.

| Carry-forward | Owner | Window |
|---|---|---|
| Day-of subscriber calendar render check (any calendar app shows 19:00 local) | Me-driven (Playwright fetch or Anton report) | T-? before 2026-05-21 19:00 Warsaw |
| Anton signed-in flow validation on v0.4.8 deploy | Anton-driven (his browser) | T-? before 2026-05-21 19:00 Warsaw |
| v0.5.0 Phase 4 closeout (Tasks 4.4–4.6 only) | Me + Anton | ≥ 2026-05-21 21:30 Warsaw (post-meetup; merge-gate only) |

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

### Option v0.5 — v0.5.0 Phase 4 closeout (Tasks 4.4–4.6 only; merge ≥ 2026-05-21 21:30 Warsaw)

**~1 hour** (was "~½ day" before chat-32 did 4.1–4.3 early). Remaining tasks:

1. **4.4** CHANGELOG `[0.5.0]` entry. Plan template at `v0.5.0-plan.md` Task 4.4 — copy-and-fill: replace `<0 CRITICAL / 0 HIGH / N MEDIUM>` with chat-32 triage numbers (0C/0H/6M total → 5M applied + 1M accepted-as-project-convention).
2. **4.5** STATE.md update — bump `last_green` to merge SHA, `phase: "v0.5.0 shipped"`, add `v0_5_ship` row in `Last verified`. Flip PR #35 title from Draft → Ready via `gh pr ready 35`.
3. **4.6** **Anton manual smoke** (only Anton can do this — his admin session):
   - Sign in → `/admin/events/new`
   - Create test event (e.g., `2026-06-01-chat-33-smoke`)
   - Verify: `warsaw-ai-bot` commit lands on main with `Co-Authored-By: @anton1rsod <…>` trailer
   - Verify: `/events/2026-06-01-chat-33-smoke` renders
   - Verify: `/api/calendar.ics` includes the new VEVENT within ≤5 min
   - **Revert the test event** via `git rm community/events/2026-06-01-chat-33-smoke/ && git commit && git push` (or via the warsaw-ai-bot writeFile interface — TBD whether the bot exposes delete)
   - **Then** squash-merge PR #35 → push tag `community-platform-v0.5.0` at the merge SHA → 5-min production smoke against `/admin/events/new` (sign-in flow, page renders, form submits successfully — or revert if broken).

**Pre-merge gate (now mostly satisfied):**
- ✅ Reviewer findings 0 CRITICAL / 0 HIGH (chat-32 triage)
- ✅ 1020/1020 tests + tsc/lint clean (chat-32 verified)
- ⏳ Anton manual smoke (only blocker)
- ⏳ Time gate: ≥ 2026-05-21 21:30 Warsaw (Vercel auto-deploys on main; protects /events/2026-05-21-meetup-4 from build glitches during meetup)

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

- **Chat-32 pre-meetup verification commit:** `f2ab48e` (STATE + chat-33 handoff)
- **Chat-32 reviewer-triage commit:** `ef71b7a` on `chore/community-platform-v0-5-impl` (1020 tests green; H67 i18n complete)
- **Chat-31 v0.5.0 plan commit:** `bc5e97d`
- **v0.5.0 branch HEAD:** `ef71b7a` on `chore/community-platform-v0-5-impl` (10 commits since main)
- **Draft PR #35:** https://github.com/anton1rsod/warsaw-ai-community/pull/35
- **Memory:** `[[project_community_platform_v0_5_admin_events_seed]]` + `[[project_community_platform_v0_4_ship]]`
- **Bot RSVP proving v0.4.7 chain:** `fd6c2e4` on main
- **Meetup source:** `community/events/2026-05-21-meetup-4/README.md` (date 2026-05-21, 19:00, 120 min, Grzybowska 85a, host @anton1rsod)

---

*Authored 2026-05-20 22:37 CEST (chat-32 closeout, T-20.5h pre-meetup). Chat-33 fire date: 2026-05-21 (day-of meetup + post-meetup closeout windows).*
