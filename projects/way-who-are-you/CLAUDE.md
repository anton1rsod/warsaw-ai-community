# CLAUDE.md — W.A.Y. (Who Are You?) sub-project

> This file auto-loads when working under `projects/way-who-are-you/`. W.A.Y. is a **commercial-track product** being scoped on top of the Warsaw AI Community [persona-builder](../../persona-builder/) skill. It is **pre-brainstorm** as of 2026-05-17 — no product surface is decided yet.

## Read order for new chats

1. **[`founder-pitch.md`](founder-pitch.md)** — Anton's original verbatim pitch. **Read first.** Source of truth for the brainstorm.
2. **[`README.md`](README.md)** — one-line description, status, links. Status placeholders are intentionally unfilled until brainstorm runs.
3. **`spec.md`** — currently template placeholders. Filled by `superpowers:brainstorming` → `/spec-writer`.
4. **`plan.md`** — empty until spec is locked. Filled by `superpowers:writing-plans`.
5. **`CHANGELOG.md`** — append-only history.
6. **`../../persona-builder/README.md`** — the underlying skill being productized. Read when the brainstorm needs to know what already exists.
7. **`../gbrain/`** — referenced by Anton as the framework template (spec-driven development reference).
8. **`../../docs/decisions/`** — ADRs (especially ADR-0004 on commercial-entity posture, ADR-0001 on MIT/OSS-first stance).

Don't pre-read 1–8 on every turn. Read by need. **For the first brainstorm chat, read 1 + 2 + 6 + ADR-0001 + ADR-0004 only.**

## Current state (verify with `git log` before acting)

**Phase:** Pre-brainstorm. Scaffold exists; no product decisions locked.
**Visibility:** **Personal/private to Anton.** W.A.Y. is NOT (yet?) a Warsaw AI Community sub-project — it's Anton's personal commercial venture using this repo as a working surface. Implications:
  - Don't reflexively apply community OSS/MIT defaults to W.A.Y. artifacts. The repo-level LICENSE covers community content; W.A.Y.'s licensing is a spec-time decision.
  - Don't announce W.A.Y. in community channels (no #Builds & Pitches thread, no roster updates, no meeting-notes references) without Anton's explicit say-so.
  - Don't ingest community persona files or member data into W.A.Y. design without an explicit ADR.
**Branch:** Work directly on `main` for the scaffold commit + brainstorm-fills-spec commit. Open a feature branch once we move to implementation (post-plan).
**Next gate:** First brainstorming session — explore the wedge, expose the ICP, surface the open questions (Q1, Q2…) and hardenings (H1, H2…) into `spec.md`.

## Operating principles specific to W.A.Y.

These extend the repo-level principles in [`../../CLAUDE.md`](../../CLAUDE.md) — they do not replace them.

1. **Pre-brainstorm discipline.** Until the brainstorm runs, no product-surface, pricing, or architecture decisions get committed to spec / plan / code. The founder pitch is **input**, not law.
2. **Commercial track ≠ community-licensed track.** W.A.Y. is exploring monetization. Anything that touches Warsaw AI Community member data, persona files, or shared infrastructure must respect the existing consent model (ADR-0001, MIT/OSS-first) and the no-commercial-entity-yet posture (ADR-0004). If W.A.Y.'s direction requires a commercial entity or a license change, that's an ADR — not a hot-patch.
3. **Persona-builder is a sibling, not a parent.** W.A.Y. **productizes** the persona-creation skill but should not assume it owns or rewrites it. If the brainstorm concludes that W.A.Y. should fork the skill, license it, or layer on top of it, that's a spec-time decision logged as an ADR.
4. **ICP is not "everyone."** Anton's pitch says "ICP is quite wide" — the brainstorm's job is to **narrow it**. The first spec must name the sharpest wedge ICP, not the broadest possible audience.
5. **Two business motions are not free.** B2C SaaS + B2B consulting in parallel doubles the surface area. The brainstorm + `/plan-ceo-review` should pressure-test whether one motion should lead and the other should defer (or be cut).
6. **Spec-driven, like GBrain.** Anton named the framework explicitly. Brainstorm → spec → plan → implement. No code before plan. No plan before spec. No spec before brainstorm.

## Skill discipline (token economy)

**Use these (the only skills that apply during early W.A.Y. phases):**

| Phase | Skill | When |
|---|---|---|
| Brainstorm | `superpowers:brainstorming` | **Mandatory** — first creative move. Explores wedge, ICP, open questions. |
| Brainstorm | `office-hours` (startup mode) | YC's six forcing questions on a new product: demand, status quo, narrowest wedge. |
| Brainstorm | `plan-ceo-review` | CEO-mode stress test — scope expansion vs. reduction, find the 10-star product. |
| Spec | `spec-writer` | Brainstorm output → `spec.md`. |
| Plan | `superpowers:writing-plans` | Spec → `plan.md`. |
| Decisions | `adr-writer` | Each reversibility-cost decision becomes an ADR (pricing, entity, persona portability, payment processor, GDPR posture). |
| Design exploration | `design-shotgun` → `design-html` | When the "gamified skill tree" UI needs visual exploration. |
| Pitch | `frontend-slides` | When the B2B consulting motion needs a board-pitch deck. |
| Implementation | `superpowers:test-driven-development`, `superpowers:subagent-driven-development`, `superpowers:systematic-debugging`, `superpowers:verification-before-completion` | Standard repo TDD discipline. |
| Review | `code-review:code-review`, `security-review` | After substantive changes. Security required because persona data + payments + auth. |

**Don't use** the marketing / ads / SEO / blog skill clusters here — they're not symlinked into this repo. Repo stack is Next.js + TypeScript only.

## Stack (TBD — set by the brainstorm + spec)

- **Frontend:** Likely Next.js (matches gbrain + community-platform); the brainstorm may revisit.
- **Persona schema:** Likely Markdown (matches persona-builder's existing schema); the brainstorm decides whether W.A.Y. extends or forks it.
- **Marketplace:** TBD — private Git library? npm-style registry? custom?
- **LLM:** TBD — likely BYOK to keep the "low API spend" pitch credible.
- **Payments:** TBD.
- **Hosting:** Likely Vercel (repo convention); the brainstorm decides.

**Do not lock any of the above before the brainstorm.**

## Conventions

- **ADRs:** numbered globally — `docs/decisions/NNNN-short-title.md`. Cross-project. New ADRs for W.A.Y. **continue the existing sequence**, they don't start a new one.
- **Specs:** project-internal spec lives at `projects/way-who-are-you/spec.md`. Cross-project / external-facing design docs go in `docs/specs/YYYY-MM-DD-way-<topic>.md`.
- **Handoffs:** when a chat ends mid-phase, write `docs/specs/YYYY-MM-DD-way-<phase>-handoff.md` (≤ 80 lines per the token-discipline rule).
- **Pricing / monetary numbers:** never in code; only in spec / ADRs. Never in commit messages.

## What NOT to do

- **Don't invent the spec.** Brainstorm first. The founder pitch is input, not output.
- **Don't pre-commit pricing.** "€250 / 1.5h consult" is a starting hypothesis; price discovery belongs to the brainstorm.
- **Don't merge W.A.Y. with `persona-builder/`.** Separate folders, separate licenses, separate audiences (community vs. commercial). If a merge is ever proposed, it's an ADR.
- **Don't assume a commercial entity exists.** ADR-0004 still holds. If W.A.Y. needs one, that's a spec-time decision.
- **Don't ingest community member personas without consent.** The persona-builder file format is shared, but member files are member property. The W.A.Y. product builds *new* personas for paying users, not on top of member archives.
- **Don't echo or store API keys.** Repo-wide rule (see memory `feedback_secret_handling`).
- **Don't expand scope mid-brainstorm without explicit `plan-ceo-review` invocation.** Anton's pitch is broad; the brainstorm's first move is to **narrow**, not to widen further.
- **Don't write code in chat-2 (brainstorm chat).** Brainstorm outputs are markdown only.

## Gotchas (carried from repo-level memory)

- **Member data + commercial product = legal sensitivity.** Anything that hints at using community personas for commercial training, evaluation, or showcasing must pass an explicit consent + ADR loop.
- **Persona-builder is "Live (v1)" and members rely on it.** Don't break its file schema by accident. Any schema delta is an ADR + a migration plan for existing personas.
- **Vercel root-directory trap.** When (if) W.A.Y. ships a Next.js app, its Vercel `rootDirectory` must be set to `projects/way-who-are-you/app` (or wherever the Next app lives) — same trap that hit gbrain and community-platform. See repo-level memory `project_community_platform_vercel_root_dir`.
- **Push commits proactively** per repo memory `feedback_push_commits`.
- **Token discipline** per repo memory `feedback_token_discipline` — no subagents for trivial tasks, heavy verification only at phase boundaries.
- **Recommend, don't menu** per `feedback_decisions_with_recommendation` — when offering choices to Anton, lead with the recommendation + reasoning.

## Founder

Anton Safronov (self-described as experienced CEO running this brainstorm). Lead, founder, sole decision-maker until cofounders / contributors join.
