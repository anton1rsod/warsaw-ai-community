# Chat handoff: Community Platform — v0.12.0 implementation (persona engagement + member-page redesign)

PROTOCOL: `projects/community-platform/HANDOFF_PROTOCOL.md` (loaded once at start)

**Date:** 2026-06-10 · **Supersedes** the post-v0.11.1 handoff *as next-chat pointer only* (its 6/12-retro + v0.11.2-scoping section stays current as a separate track).

## Done already (this chat, all on main)
- **Design**: `docs/specs/2026-06-10-community-platform-persona-engagement-design.md` (`393ecc1`, standards-verified `00dd366`+`e2a1404` — adversarial 3-lane WCAG/Next16/OWASP pass, 27 findings triaged). Approved mockup: `community/brand/explorations/2026-06-10-member-page-typeset-dossier-mockup.html` (open in a browser — it IS the visual reference).
- **Plan**: `projects/community-platform/v0.12.0-plan.md` (`d7154e8`) — 6 phases / 35 tasks / strict-TDD steps with complete code; O1–O5 locked in the header; hardening ids **H151–H160** locked; branch `chore/community-platform-v0-12-impl`.
- Also today (separate work): Node-24 CI actions bump SHIPPED (PR #56 `f914c13`); v0.11.1 signed-in smoke closed 5-for-5.

## ★ Next work — execute the plan
- `superpowers:subagent-driven-development`, **one Sonnet implementer per PHASE** (not per task — token discipline), orchestrator verifies `pnpm tsc --noEmit && pnpm lint && pnpm test` at every phase boundary. Phase 6 is orchestrator-direct (process tasks).
- Phase order matters: 1 (tokens/parsers/libs) → 2 (dossier page) → 3 (lens) → 4 (OG card) → 5 (link attach/re-sync) → 6 (closeout/ship).
- **Reconciliation notes inside the plan are normative**: Task 3.3 carries an assembler note (CopyHandle ships in 2.6; 3.3 replaces its test with a fuller suite + adds the integration test — skip duplicate creation steps after verifying). Task 2.3's PostureLedger deliberately voids failure/successPatterns (they render in StorySection).
- Plan baselines say "≥1450 tests" in Phase 1's gate — actual baseline is **1582** unit/int at v0.11.1; treat plan counts as lower bounds.

## ★ Verify-before-claiming
- Persona section parser keys off the REAL `.public.md` heading skeleton (typographic apostrophe in "I've", slash in "Competitor / substitute contexts") — fixtures in Task 1.2 encode this; don't "simplify" the normalizer.
- `content-snapshot.json` is gitignored; `lib/__generated__/*` churn from the pretest hook is benign noise — don't commit unless the diff is the new roster fields (Task 1.3 note).
- The global `:focus-visible` flip (accent-500→700) touches EVERY page — expect no test breakage (H91 tests assert presence, not color) but eyeball one non-member page in the Phase 2 smoke.

## ★ Anti-patterns
- Don't re-open design decisions (D1–D9 + O1–O5 are Anton-locked; v3's dark band / asterisk separators / member numbers are REJECTED).
- Don't add an in-platform persona builder (explicitly out — D3) or touch the persona file schema (ADR-0019 §3: needs its own ADR).
- Inside `lib/` relative imports (GOTCHAS #10) · no `dark:` variants · markdown only via `lib/markdown`+`SafeHtml` (H143) · single-file bot commits (H149).
- Security review is MANDATORY at closeout (new outbound fetch + public OG endpoint) — Task 6.3.

## ★ Paste-ready prompt
> Open the Warsaw AI Community repo. Read order: root `STATE.md` → `projects/community-platform/STATE.md` → `CONSTRAINTS.md`/`GOTCHAS.md`/`HANDOFF_PROTOCOL.md` (if new) → this handoff (`docs/specs/2026-06-10-community-platform-v0-12-implementation-handoff.md`) → the plan header + Phase 1 of `projects/community-platform/v0.12.0-plan.md` (read later phases at their boundaries, not upfront). Read directly; don't invoke a resume skill.
>
> Execute `v0.12.0-plan.md` (persona engagement + member-page redesign; spec = `docs/specs/2026-06-10-community-platform-persona-engagement-design.md`, mockup = `community/brand/explorations/2026-06-10-member-page-typeset-dossier-mockup.html`) via `superpowers:subagent-driven-development` — one implementer per phase, branch `chore/community-platform-v0-12-impl`, full gate at each phase boundary. The plan's reconciliation notes (Task 3.3) are normative. Phase 6 ships it (spec §23 + CHANGELOG + 3-lane triage w/ mandatory security + PR + tag `community-platform-v0.12.0` + the standing post-merge orchestrator prod smoke).
