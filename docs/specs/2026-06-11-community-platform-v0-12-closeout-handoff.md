# Chat handoff: Community Platform — post-v0.12.0 (retro + v0.11.2/v0.12.1 scoping)

PROTOCOL: `projects/community-platform/HANDOFF_PROTOCOL.md` (loaded once at start)

**Date:** 2026-06-11 · **Supersedes** the v0.12 implementation handoff (DONE — executed same-day).

## Done already (this chat, v0.12.0 SHIPPED)

- **PR #57 squash-merged `ca684f0`** · tag `community-platform-v0.12.0` pushed · branch deleted · STATE flipped. Spec §23 (D1–D9, R1–R6, **H151–H160**); CHANGELOG `[0.12.0]`; design doc flipped to Implemented.
- 1808 unit/int (+226) + persona-attach E2E 4/4 · coverage 89.77% · 3-lane triage **0 CRITICAL** (8 applied `4e4c4e4`, 9 accepted-with-reason in the PR body) · orchestrator prod smoke green (anon 6/6 + signed-in dossier/lens/editor/OG + soft-nav/hover/dark-OS).
- **Routing decision (Anton 2026-06-11):** `/members`+`/members/[slug]` STAY auth-gated; only `^/members/[slug]/opengraph-image$` public (`OG_IMAGE_PATH`). Design §3's "anon viewers" = render states only.

## ★ Next work (pick at chat start with Anton)

1. **Fri 6/12 retro + v0.11.2 scoping** (the standing track from the post-v0.11.1 handoff). Agenda additions from this ship:
   - **Public-dossier ADR question** — should `/members/[slug]` go anonymous? (1-line proxy flip + ADR extending ADR-0012/0014; the page already renders anon-gracefully.)
   - **E2E hygiene** — `status.spec.ts` + `v0-9-write-paths` 5.4b/5.4c stale since v0.10's Quick-mode default (`getByLabel(/what are you working on/i)` no longer matches; baseline-verified failing on main). `members.spec.ts` was fixed in this ship.
   - **vitest devDep bump** (2.x → ≥3.2.6, GHSA-5xrq-8626-4rwp; dev-only, standing deferral since v0.11.0).
   - **resyncPersona / save-persona rate-limit** — joins the existing v0.11.2 rate-limit item (H120 pattern; 2 GitHub reads + 1 write + outbound fetch per call).
   - **`log.info`** — `lib/log.ts` only has warn/error; success events log at warn (pre-existing; 2 new call sites in v0.12).
2. **Anton-side:** VoiceOver pass over the dossier `<details>` rows + heading rotor (spec §3 a11y constraint — the smoke verified the accessibility tree h1→h2 outline as proxy).

## ★ Verify-before-claiming

- Member pages gated / OG route public: `curl -s -o /dev/null -w '%{http_code}' https://warsaw-ai-community-platform.vercel.app/members/anton-safronov` → 307; same path + `/opengraph-image` → 200.
- Test baseline is now **1808** unit/int.

## ★ Anti-patterns

- Don't re-open D1–D9 / O1–O5 / the routing decision — Anton-locked. The public-dossier question is a NEW ADR discussion, not a re-litigation.
- Don't bump vitest casually mid-feature — it's a major-version test-runner change; own chat/task.

## ★ Paste-ready prompt

> Open the Warsaw AI Community repo. Read order: root `STATE.md` → `projects/community-platform/STATE.md` → this handoff (`docs/specs/2026-06-11-community-platform-v0-12-closeout-handoff.md`) → the 6/12-retro section of `docs/specs/2026-06-10-community-platform-post-v0-11-1-handoff.md`. Read directly; don't invoke a resume skill. Run the retro + scope v0.11.2/v0.12.1 with Anton (brainstorming skill), folding in this handoff's agenda additions.
