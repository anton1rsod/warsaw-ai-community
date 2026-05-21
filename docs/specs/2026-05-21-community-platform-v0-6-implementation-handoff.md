# v0.6.0 Implementation Handoff (chat-34 → chat-35)

**Date:** 2026-05-21 · **From:** chat-34 (brainstorm + spec + plan) · **To:** chat-35 (subagent-driven implementation)

## Status at handoff

- `main` HEAD: `1d48d06` — PR #37 squash-merge bringing in spec §16 + handoff + v0.6.0-plan.md
- v0.5.1 baseline preserved: tag `community-platform-v0.5.1` at `ef009d5`; 1047/1047 tests; all H81-H86 grep-verifiable
- Production: https://warsaw-ai-community-platform.vercel.app (running v0.5.1)
- **Meetup #4 deadline:** 2026-05-21 19:00 Warsaw — **no merges to main during meetup window** per [[feedback_merge_gate_vs_work_gate]]. Branch commits and PR-Draft pushes are fine; final squash-merge waits until after 21:00 Warsaw.

## Read order for chat-35

1. `projects/community-platform/STATE.md` — current snapshot (v0.5.1 shipped state; v0.6 not yet flipped)
2. `projects/community-platform/spec.md` §16 — visual redesign contract (locks aesthetic, hierarchy, typography, tokens, primitives, hardenings H87-H92, 8 open questions O1-O8)
3. `docs/specs/2026-05-21-community-platform-v0-6-redesign-brainstorm.md` — ASCII design preview + brainstorm decision log
4. `projects/community-platform/v0.6.0-plan.md` — 22 TDD tasks across 6 phases (the canonical execution plan)
5. THIS handoff (you're here)
6. `projects/community-platform/CLAUDE.md` + `CONSTRAINTS.md` + `GOTCHAS.md` + `HANDOFF_PROTOCOL.md` — project-level discipline

**Token discipline per [[feedback_token_discipline]]:** read steps 1-5 once at chat start; don't re-read on every turn. Phase-by-phase, reference specific spec sections via §16.X anchors.

## What's locked

Per spec §16.1 + §16.11 — 0 open questions remain:

- Aesthetic: **D — Warm maximalist** (PostHog amber pushed, serif italic + mono voice)
- Hierarchy: **Event-first** (next meetup is the hero)
- Display: **Fraunces variable** (SOFT + WONK axes)
- Mono voice: **JetBrains Mono** (new)
- Body: **Inter** (kept from v0.4)
- Color anchor: amber `#f59e0b` + cream `#fef6e6` + ink `#1a1a2e` + dust `#8b6f3a`
- Surface scope: **All 4** — `/` + `/home` + `/events` + `/events/[slug]` + shared Header/Footer
- All 4 hero surfaces use `force-dynamic` (H90)
- Dark mode: light-only for v0.6; token slots laid for v0.7+ override
- Motion: sober — static `-1.5°` tilt + EventCard hover/focus-visible translateY; `prefers-reduced-motion` honored
- ADR-0014 amended (warm-amber posture extended); no new ADR
- Self-review fixups in `5095807`: typed primitive contracts, evergreen empty-state copy, focus-visible parity, concrete Lighthouse budget, Fraunces `weight: "variable"` API fix

## Execution mechanics

**Recommended skill:** `superpowers:subagent-driven-development` — one fresh sonnet subagent per task with the task's full brief inline (extracted from v0.6.0-plan.md task body). Review between tasks before dispatching the next.

**Branch setup at chat-35 open:**

```bash
cd "/Users/antonsafronov/Projects/Warsaw AI Comunity"
git fetch origin
git switch main
git pull --ff-only origin main      # expect HEAD 1d48d06 or later
git checkout -b chore/community-platform-v0-6-redesign-impl
git push -u origin chore/community-platform-v0-6-redesign-impl
cd projects/community-platform
pnpm install
pnpm test                            # expect 1047/1047 v0.5.1 baseline green
pnpm tsc --noEmit
```

**PR Draft to open at first commit:**

```bash
gh pr create --draft \
  --title "feat(community-platform): v0.6.0 — warm-maximalist visual redesign (4 hero surfaces + shared chrome)" \
  --body "$(cat <<'EOF'
## Summary

v0.6.0 visual redesign per spec §16. 4 hero surfaces (\`/\`, \`/home\`, \`/events\`, \`/events/[slug]\`) + shared Header/Footer chrome + 4 new primitives (\`AmberTag\`, \`MonoLabel\`, \`Pill\`, \`EventCard\`) + 3 new fonts via \`next/font/google\` + 6 new hardenings H87-H92.

Spec: \`projects/community-platform/spec.md\` §16 at \`1d48d06\`.
Plan: \`projects/community-platform/v0.6.0-plan.md\` (22 tasks across 6 phases, ~5 days).

## Hardenings preserved

- H56-H68 (v0.4 chrome/a11y), H69-H80 (v0.5 admin events), H81-H86 (v0.5.1 polish)
- v0.4.7 EventRsvpButton hydration + v0.4.8 + v0.5.1 H86 force-dynamic posture

## Hardenings added (H87-H92)

- H87 — Three \`next/font/google\` fonts with display:swap
- H88 — i18n coverage gate on all v0.6 surfaces
- H89 — Functional contract preservation (EventRsvpButton + EventForm + ProfileEditor)
- H90 — Header active-page indicator server-side via headers().get('x-pathname')
- H91 — axe-core serious-violations gate on all 4 surfaces
- H92 — WCAG AA 4.5:1 contrast on every token pair

## Test plan

- [ ] Phase 0 commits land; \`pnpm test\` 1050/1050 (1047 + 3 new)
- [ ] Phase 1 commits land; 4 primitives at 100% lines / ≥95% branches
- [ ] Phase 2 commits land; Header/Footer/HeaderMobileMenu rewritten; v0.4 a11y baseline preserved
- [ ] Phase 3 commits land; 4 hero surfaces + 6 component restyles
- [ ] Phase 4 axe-core + Lighthouse + 3-lane reviewer dispatch green
- [ ] Phase 5 CHANGELOG + STATE + tag at squash-merge SHA

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## Phase order + checkpoints

Per v0.6.0-plan.md:

| Phase | Tasks | Output | Checkpoint |
|---|---|---|---|
| 0 — Pre-flight | 0.1–0.4 | fonts + tokens + tailwind | `pnpm build` green, 1050 tests |
| 1 — Primitives | 1.1–1.5 | 4 components + i18n strings | 100% strict-list cov |
| 2 — Shared chrome | 2.1–2.3 | Header + HeaderMobileMenu + Footer | Vercel preview inherits across all pages |
| 3 — Hero surfaces | 3.1–3.9 | 4 page.tsx + 6 component rewrites | Anton + chat eyeball preview vs §16.4 ASCII |
| 4 — Quality gates | 4.1–4.6 | axe + Lighthouse + H89 + H88 + 3-lane review | All gates green; triage commit |
| 5 — Ship | 5.1–5.3 | CHANGELOG + STATE + tag + memory | Smoke prod after squash-merge |

**Phase boundaries are the natural checkpoint** for verification-before-completion (per [[feedback_token_discipline]] — heavy verification only at phase boundaries, not per-task).

## Risks + watchouts

1. **Fraunces `weight: "variable"` + axes API** — Next 16 may reject the SOFT/WONK axes. If Phase 0.1 `pnpm build` fails on font load, fall back to static weights (spec §16.2 documents this). Don't burn time chasing the variable axes if the build is red.
2. **`force-dynamic` on `/` and `/home`** — preview Vercel deployments are sensitive to dynamic-rendering quotas. If preview fails with "exhausted build quota", fall back to `revalidate = 0` per surface (achieves same per-request render without explicitly marking dynamic).
3. **LCP regression from 3 Google Fonts** — if Lighthouse mobile LCP > 2.5s on `/events/[slug]` (which has the heaviest agenda markup), apply the §16.2 fallback: drop `font-variation-settings` and use Inter for body weight 400 only.
4. **HeaderMobileMenu hydration** — v0.4 H58 is hydration-stability-locked. Don't change the `useEffect` shape; just swap class names. Run E2E v0-4-shell.spec.ts to verify.
5. **EventRsvpButton class-swap (Task 3.9)** — DO NOT touch any of: `initialState` prop, `profileSha` prop, `useEffect` hydration logic, the fetch URL, the form action. H89 is grep-tested.
6. **Meetup window constraint** — if chat-35 runs during 18:00-22:00 Warsaw on 2026-05-21, do branch commits but DO NOT squash-merge to main. Squash-merge waits until 22:00+ Warsaw at the earliest.

## Worker skills during impl

During phase execution, dispatch worker skills as needed:

- `superpowers:test-driven-development` — every primitive + every surface (already encoded in plan tasks)
- `superpowers:systematic-debugging` — if any test or build unexpectedly fails
- `code-review:code-review` — Phase 4.6 (3-lane reviewer dispatch)
- `superpowers:verification-before-completion` — Phase 5 before tag push
- `vercel:react-best-practices` — invoke after Phase 3 TSX edits land (mostly auto-triggers post-edit)
- `vercel:shadcn` — DO NOT invoke. v0.6 explicitly rejects shadcn adoption per §16.1 framework lock.
- `design-shotgun` / `design-html` — DO NOT invoke. Design decisions are locked in §16; chat-35 implements, doesn't re-explore.

## Anton-side validation expected

After Phase 4 axe-core + Lighthouse passes + before tag-push, Anton:

1. Sign in to Vercel preview as `anton1rsod`
2. Eyeball `/` (anon, in private window) → confirm warm-maximalist hero matches §16.4 ASCII
3. Eyeball `/home` signed-in → confirm "Tonight, Anton—" headline + ✓ going EventCard
4. Eyeball `/events` signed-in → confirm "+ new event" button + amber date-badge on Meetup #4 EventCard
5. Eyeball `/events/2026-05-21-meetup-4` → confirm AmberTag suffix "tonight." + Agenda card + RSVP roster

If any surface drifts from §16.4 ASCII intent, iterate within Phase 3 (one or two surfaces) without re-opening §16.

## Memory entries to update at v0.6 ship

- Rename `project_community_platform_v0_6_brainstorm.md` → `project_community_platform_v0_6_ship.md` (or write a new ship entry per v0.5.1 precedent and leave brainstorm entry as history)
- Update MEMORY.md index line

## Closeout artifacts at v0.6 ship

- `CHANGELOG.md` `[0.6.0]` entry (template in plan Task 5.1)
- `STATE.md` snapshot flip (plan Task 5.2)
- Tag `community-platform-v0.6.0` at squash-merge SHA
- Memory entry per above

---

*Drafted 2026-05-21 in chat-34 at SHA `1d48d06`. Chat-35 owns Phase 0 onward.*
