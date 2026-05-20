# Chat-28 handoff: v0.4.3 follow-ups menu (residual chat-27 + tag bumps + Phase B window)

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md) (§3 chat-brief shape; loaded once at start)

**Status (drafted chat-27 closeout, 2026-05-20):** Chat-27 shipped three PRs in sequence:

1. **PR #26 — v0.4.2 Option K** (a11y baseline regressions): Footer dropped `aria-label="Language"` on the empty `<div>` placeholder (axe `aria-prohibited-attr`); AnonymousHero CTA flipped `text-white` → `text-neutral-900` on `bg-accent-500` (contrast 2.15→8.35:1 AAA base, 3.19→5.63:1 AA hover). Merged at SHA `91f772f` 2026-05-18T20:30:50Z. Production a11y E2E gate **7/7 GREEN in 3.7s** against `https://warsaw-ai-community-platform.vercel.app` post-merge.
2. **PR #27 — v0.4.2 closeout docs**: STATE.md `v0_4_2_a11y_baseline` row flipped to prod-confirmed + CHANGELOG `[0.4.2]` Verified section updated with the 3.7s result + Vercel-SSO-on-previews finding documented for chat-28+. Merged at SHA `044c1bd` 2026-05-19T07:26:41Z.
3. **PR #28 — v0.4.3 Option C** (HomeFeed → DateTime consolidation): dropped v0.3's inline `relativeDate()` helper from `app/components/HomeFeed.tsx`; replaced two render sites with `<DateTime context="list">` from Phase A. Net -14 lines; semantic `<time dateTime title>` markup upgrade; H67-compliant i18n strings; zero behavior change; zero test delta (934/934 unit+integration green). Merged at SHA `52b60a6` 2026-05-19T07:50:43Z. Production a11y E2E re-run **7/7 GREEN in 3.5s** post-merge — confirms no axe regression from the `<time>` element addition.

**Side cleanup (chat-27):** stray folder `/Users/antonsafronov/Projects/Warsaw\ AI\ Comunity` (literal backslashes in name; chat-25 subagent shell-escaping artifact 18 May 20:01 containing one byte-identical duplicate of `tests/unit/handbook-page.test.tsx`) removed at Anton's request.

**Pending Anton-side before chat-28 starts:**

1. (Optional, Anton's discretion) push tags `community-platform-v0.4.2` at `91f772f` and/or `community-platform-v0.4.3` at `52b60a6`. Chat-26 also left v0.4.1 tag-bump optional precedent — Anton hasn't pushed v0.4.1 either. **Recommended:** push both at chat-28 start to mark canonical ship SHAs (one-liner each: `git tag community-platform-v0.4.2 91f772f && git push origin community-platform-v0.4.2`).
2. Signed-in flow smoke (carry-over from chat-25 deferred list): sign in as `anton1rsod` → `/home` shows YourWeekPane with real data once Anton has RSVP'd an event; `?from=/calendar` round-trip; dropdown 4-item shape (Your week / Members / Edit profile / Sign out); mobile hamburger.

Chat-28 owns the residual menu below. None of these blocks v0.4.3 ship.

---

## Setup

```bash
cd "$HOME/Projects/Warsaw AI Comunity" && git fetch && git checkout main && git pull
git checkout -b chore/community-platform-v0-4-4-followups   # or v0.5-prep depending on Option F outcome
```

## Read order (~500 lines)

1. **This handoff** (~140 lines).
2. **`projects/community-platform/STATE.md`** — `v0_4_2_*` + `v0_4_3_*` rows under Last verified, Last updated 2026-05-20.
3. **`projects/community-platform/CONSTRAINTS.md`** — Generated artifacts + Staging E2E targeting (Vercel SSO finding from chat-27 may motivate adding a `Preview E2E gating` section).
4. **`projects/community-platform/HANDOFF_PROTOCOL.md`**.
5. **`projects/community-platform/CHANGELOG.md`** — `[0.4.2]` and `[0.4.3]` entries for chat-27 context.

## Chat 28 owns: pick ONE OR a small bundle from the residual menu

### Option L (NEW — top recommended) — Tag bumps `v0.4.2` + `v0.4.3`

**~5 min, zero-risk.** Push the deferred tags at their canonical merge SHAs. Marks ship state cleanly so chat-28+ can reference tags instead of SHAs.

```bash
git tag community-platform-v0.4.2 91f772f
git tag community-platform-v0.4.3 52b60a6
git push origin community-platform-v0.4.2 community-platform-v0.4.3
```

Verify both tags appear on the GitHub Releases page. No further action needed.

### Option A — PWA textured "WA" icons

Same as chat-26 + chat-27 Option A. **Blocked on chat-27 host (no ImageMagick / sharp)** — `which magick` / `which convert` / `npm ls sharp` all empty. Re-check on chat-28 host; if either tool is now installed, ~30 min to replace solid `#f59e0b` placeholders in `public/icons/icon-{192,512}.png` + `apple-touch-icon.png` + `favicon.ico` per v0.4.0-plan A.3.1.

### Option D — Reviewer-agent dispatch (security + typescript + code)

Scope now spans **v0.4.0 + v0.4.1 + v0.4.2 + v0.4.3** surfaces. ~1 hr token-heavy. Anti-pattern: skip if monthly Claude cap near exhaustion. Consider batching with v0.5+ surfaces once Phase B lands.

### Option F — Phase B activation gate decision

Per D44 — Phase B (detail-template family, member team-page, project portfolio framing, per-project Decisions section) is CONDITIONAL on Phase A landing data + post-ship user-test. **Window opened 2026-05-25** (7 days post v0.4.0 ship at 2026-05-18). If chat-28 runs on or after 2026-05-25 AND Anton has accumulated traffic + completed a user-test session, activate the Phase B brainstorm → spec → plan pipeline. If not, defer to chat-29+.

### Option G — typescript-reviewer-flagged tech-debt sweep

Same as chat-27 G. ~30 min. Code-quality nits not security-relevant. Honest assessment: low value relative to F if F is gate-open.

### Option I — Anton-side staging smoke checklist

Same as chat-27 I. ~30 min. Chat-25's deferred signed-in TODOs (see Pending Anton-side above). Closes the v0.4 ship loop. Anton-driven (his session); chat-28 documents the result.

### Option J — first real event RSVP to exercise YourWeekPane data path

Same as chat-27 J. ~15 min + scheduling. `event-rosters.json` is `{}` on prod because no events exist. Anton seeds first event (e.g., `community/events/2026-06-XX-some-meetup/`), commits, redeploys, RSVPs via `/events/<slug>`, then confirms `YourWeekPane` shows the next-RSVP commitment. End-to-end loop closure.

### Option M (NEW) — Vercel preview-protection bypass token decision

Chat-27 surfaced: Vercel SSO globally protects PR previews on this team (`https://…-git-….vercel.app/` returns 401 Auth Required), so preview-URL Playwright runs require either `vercel curl`, the Vercel MCP Server, or a `VERCEL_PROTECTION_BYPASS_FOR_AUTOMATION` token Anton would mint via Vercel dashboard. **~10 min if Anton chooses to mint.** Trade-off: pre-merge preview Playwright unlocks earlier verification (catches edge-only regressions before merge) at the cost of one more secret to rotate. RECOMMEND: skip unless an upcoming feature needs edge-behavior verification pre-merge.

---

## NOT for chat-28

- Re-litigating chat-22 / 23 / 24's D21–D44 / O1–O14 locks.
- Re-running chat-27's a11y E2E gate (`v0_4_3_a11y_baseline` row in STATE captures the 7/7 result canonically; only re-run if Vercel re-deploy or hero/Footer/HomeFeed change).
- Re-opening v0.4.0 / v0.4.1 / v0.4.2 / v0.4.3 PRs.
- Spec §14 changes beyond what Option F decides about §14.10.

## Done means

- Anton picked options (1+) at chat-28 start.
- Each option executed per its Acceptance criteria.
- Commits pushed; PR opened if code-bearing (per `feedback_pr_vs_direct`); harness-gated direct-to-main goes via PR (chat-27 lesson).
- STATE.md `Last verified` rows added per surface.
- If material work surfaces outside scope → `pending follow-ups` in STATE, chat-29 picks.

## Anti-patterns (chat-28 specific)

- **Don't push tags retroactively without verifying merge SHA.** v0.4.2 = `91f772f`, v0.4.3 = `52b60a6` (per CHANGELOG headers). Verify before `git tag`.
- **Don't activate Phase B without confirming 7-day landing-data window.** D44 lock is binding; gate-open date is 2026-05-25.
- **Don't run all residual options in one chat.** Pick 1–3 to keep context budget reasonable (`feedback_token_discipline`). L + I + J is a sensible tight bundle if Anton has time.
- **Don't bypass TDD if any option grows code.** TDD discipline applies (CONSTRAINTS line 25). Option A is the only code-bearing option likely picked; everything else is config / docs / Anton-side.

## Reference pointers

- **Chat-27 PRs (all merged):** #26 / #27 / #28.
- **Chat-26 → Chat-27 handoff:** [`docs/specs/2026-05-19-community-platform-v0-4-1-shipped-followups-handoff.md`](2026-05-19-community-platform-v0-4-1-shipped-followups-handoff.md) — original 7-option residual menu (A/C/D/F/G/I/J + K + L).
- **STATE.md** `v0_4_2_*` + `v0_4_3_*` Last verified rows — what chat-27 actually shipped.
- **CHANGELOG.md** `[0.4.2]` + `[0.4.3]` entries — patch summaries.
- **Memory:** `project_community_platform_v0_4_ship` — chat-27 closeout row added (PR #26/27/28 merge SHAs).
