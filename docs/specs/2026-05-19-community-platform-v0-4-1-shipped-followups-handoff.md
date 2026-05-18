# Chat-27 handoff: v0.4.1 follow-ups menu (residual options + Phase B gate)

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) (§3 chat-brief shape; loaded once at start)

**Status (drafted chat-26 closeout, 2026-05-18):** Chat-26 shipped the **B + E + H** bundle from the chat-25 menu on `chore/community-platform-v0-4-1-followups` (3 commits: `8c028c6` E / `6ba3033` H / `11e8a36` B). 934/934 tests green; coverage 88.69% lines / 92.97% branches. CHANGELOG entry `[0.4.1]` drafted. PR pending Anton open.

**Pending Anton-side before chat-27 starts:**

1. Open PR `chore/community-platform-v0-4-1-followups` → main.
2. CI verification (lint + tsc + test + build + persona-folder check).
3. Merge PR.
4. **Optional:** push tag `community-platform-v0.4.1` at merge SHA. (Chat-26 did NOT push — Anton's call whether 3 follow-up patches warrant a tag bump.)
5. Production smoke if v0.4.1 tag pushed (anonymous `/` re-verifies; signed-in `/home` shows the wired YourWeekPane with real data — once any RSVP / kudos accumulates).
6. Update memory `project_community_platform_v0_4_ship` to add a `chat-26 closeout` row (merge SHA, tag bump y/n).

Chat-27 owns the residual menu BELOW. None blocks v0.4.1; they're chat-27 or v0.5 candidates.

---

## Setup

```bash
cd "$HOME/Projects/Warsaw AI Comunity" && git fetch && git checkout main && git pull
git checkout -b chore/community-platform-v0-4-2-followups
```

## Read in order (~500 lines)

1. **This handoff** (~120 lines).
2. **`projects/community-platform/STATE.md`** — `v0_4_1_*` rows under Last verified.
3. **`projects/community-platform/CONSTRAINTS.md`** — `Generated artifacts` + Staging E2E targeting (new in v0.4.1).
4. **`projects/community-platform/HANDOFF_PROTOCOL.md`**.
5. **`projects/community-platform/CHANGELOG.md`** — `[0.4.1]` entry for chat-26 context.

## Chat 27 owns: pick ONE OR a small bundle from the residual menu

### Option A — PWA icon textured "WA" upgrade

Same as chat-26 Option A (local-only; needs ImageMagick or `sharp`). ~30 min. Replace solid `#f59e0b` placeholders in `public/icons/icon-{192,512}.png` + `apple-touch-icon.png` + `favicon.ico` per v0.4.0-plan A.3.1.

### Option C — HomeFeed `relativeDate()` → `<DateTime context="list">` migration

Same as chat-26 Option C. ~30 min. `app/components/HomeFeed.tsx` still ships v0.3's inline `relativeDate()` helper; Phase A's `<DateTime context="list">` does the same via `lib/i18n/strings.ts` (H67-compliant).

### Option D — Reviewer-agent dispatch (security + typescript + code)

Same as chat-26 Option D, now with v0.4.1 surfaces included. ~1 hr. Scope: chat-26 commits (`page.tsx` adapter, `lib/your-week.ts`, `playwright.config.ts` patch) + chat-25 v0.4 surfaces (Phase A wrap-up). Anti-pattern: skip if monthly Claude cap near exhaustion.

### Option G — typescript-reviewer-flagged tech-debt sweep

Same as chat-26 Option G. ~30 min. Code-quality nits not security-relevant.

### Option F — Phase B activation gate decision

Per D44 — Phase B (detail-template family, member team-page, project portfolio framing, per-project Decisions section) is CONDITIONAL on Phase A landing data + post-ship user-test. **Premature on day-0 of v0.4.0 ship.** Activate this option only IF Anton has 7-14 days of post-ship traffic data + a user-test session done.

### Option I (NEW) — Anton-side staging smoke checklist

~30 min. Chat-25's deferred Anton-side TODOs: signed-in flow smoke (sign in → `/home` shows YourWeekPane with real data once Anton RSVPs an event; `?from=/calendar` round-trip; dropdown 4-item shape; mobile hamburger); `pnpm a11y:baseline` against staging for axe-core 0-violations gate; visual PWA icon check in DevTools manifest panel. Record `v0_4_1_signed_in_smoke` row in STATE.md `Last verified`.

### Option J (NEW) — first real event RSVP to exercise YourWeekPane data path

~15 min + scheduling. Chat-26's Option B wired YourWeekPane to real data, but `event-rosters.json` is `{}` because no events exist on prod yet. Anton seeds the first event (e.g., `community/events/2026-06-XX-some-meetup/`), commits, redeploys; then RSVPs via `/events/<slug>` → confirms YourWeekPane shows the next-RSVP commitment. Closes the end-to-end loop.

---

## NOT for chat-27

- Re-litigating chat-22/23/24's D21–D44 / O1–O14 locks.
- Phase B implementation (Option F decides activation; implementation = chat-28+).
- Re-opening v0.4.0 / v0.4.1 PRs.
- Spec §14 changes beyond what Option F decides about §14.10.

## Done means

- Anton picked options (1+) at chat-27 start.
- Each option executed per its Acceptance criteria.
- Commits pushed; PR opened if code-bearing (per `feedback_pr_vs_direct`); direct-to-main if docs/assets only.
- STATE.md `Last verified` rows added.
- If material work surfaces outside scope → `pending follow-ups` in STATE, chat-28 picks.

## Anti-patterns (chat-27 specific)

- **Don't re-run chat-26's Option E.** Staging E2E was verified at `8c028c6`; only re-run if Vercel re-deploy or `/` hero change.
- **Don't activate Phase B without 7-day landing-data review.** D44 lock is binding.
- **Don't run all residual options in one chat.** Pick 1–3 to keep context budget reasonable (`feedback_token_discipline`).
- **Don't bypass TDD if any option grows code.** TDD discipline applies (CONSTRAINTS line 25).

## Reference pointers

- **Chat-26 PR (open):** TBD — Anton opens after chat-26 closeout commit.
- **Chat-25 → Chat-26 handoff:** [`docs/specs/2026-05-19-community-platform-v0-4-shipped-followups-handoff.md`](2026-05-19-community-platform-v0-4-shipped-followups-handoff.md) — original 8-option menu.
- **STATE.md** `v0_4_1_*` Last verified rows — what chat-26 actually shipped.
- **CHANGELOG.md** `[0.4.1]` entry — patch summary.
- **Memory:** `project_community_platform_v0_4_ship` — Anton updates after merge.
