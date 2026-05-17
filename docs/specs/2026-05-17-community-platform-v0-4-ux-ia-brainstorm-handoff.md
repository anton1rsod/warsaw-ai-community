# Chat-22 handoff: v0.4 — world-class community platform redesign

**PROTOCOL:** [`projects/community-platform/HANDOFF_PROTOCOL.md`](../../projects/community-platform/HANDOFF_PROTOCOL.md)

**Status (drafted in chat-21 prep, post-CEO-review):** Anton escalated v0.4 from "organize 14 surfaces" to **"best community platform in Europe, world-class UX, inspired by global best examples."** SCOPE EXPANSION mode locked via `plan-ceo-review` (chat-21 prep). Chat-22 brainstorms IA + visual identity + member showcase + event UX + brand language as a *coupled* set — IA and visual decisions inform each other; splitting wastes time.

**Scope guardrail:** Every brainstorm output must map to a v0.4.0-implementable scope OR get explicitly deferred to v0.5+ backlog. Failure mode to avoid: 6 months of design exploration with no shipping. The questionnaire is the constraint envelope.

---

## Setup

Starts AFTER chat-21 closes (Option A signed-in /home smoke verified in STATE.md). Branch off `main` at chat-21's HEAD.

```bash
cd "$HOME/Projects/Warsaw AI Comunity" && git fetch && git checkout main && git pull
```

## Read in order

1. **This handoff** (full).
2. **`docs/research/v0-4-benchmark-dossier.md`** — 12 platforms across 4 axes; live-fetched + training-data; cross-cutting traits + anti-patterns. Anchor when answering Qs.
3. **`docs/specs/2026-05-17-community-platform-v0-4-questionnaire.md`** — 60+ Qs by section, 28 marked `[blocking]`. The work product.
4. **Run `gstack` dogfood** on live v0.3.1 platform → save annotated screenshots to `docs/research/v0-4-ux-baseline/`.
5. `projects/community-platform/STATE.md` (verify chat-21 Option A landed) + `CONSTRAINTS.md` + `HANDOFF_PROTOCOL.md`.
6. `docs/decisions/0012-community-platform-v0-3-discovery-posture.md` (LOCKED — anonymous posture).

DO NOT pre-read v0.3.0-plan.md or prior brainstorm handoffs. This chat is fresh on world-class UX/IA.

## Skill sequence

- **Pre-brainstorm:** `gstack` dogfood + read dossier. ~30 min.
- **Brainstorm:** `superpowers:brainstorming` driven by the questionnaire; `plan-ceo-review` mid-stream IF scope-expansion pressure emerges. ~2-3 hr.
- **Output:** brainstorm doc saved to `docs/specs/<chat-22-date>-community-platform-v0-4-brainstorm-output.md` + chat-23 spec-writing handoff drafted.

Downstream chats:
- **Chat-23:** `superpowers:spec-writer` + **`design-shotgun`** (AI visual variants — only AFTER IA locked) + optional `office-hours` Builder mode.
- **Chat-24:** `superpowers:writing-plans` + `frontend-patterns` + `coding-standards` loaded.
- **Chat-25+:** `superpowers:test-driven-development` + **`design-html`** (production HTML/CSS) + `typescript-reviewer` agent + `e2e-runner` agent + `seo-technical` (if public-facing scope confirmed Q0.5).

**Skills NOT to activate in chat-22:** `frontend-slides`, `feature-dev:feature-dev`, full marketing/ads skills library, `design-html` (post-spec only), `design-shotgun` (post-IA only).

## Anti-patterns (chat-22 specific)

- Don't start before chat-21 closes Option A.
- Don't propose features outside the questionnaire envelope — log to v0.5 backlog.
- Don't lock visual (Section 4) before structure (Section 2) — answer Qs in order.
- Don't reopen ADR-0012 (anonymous posture locked).
- Don't generate `design-html` or `design-shotgun` outputs (post-spec, post-IA).
- Don't expand v0.4 timeline indefinitely — must be shippable in 2-4 weeks of CC-time per scope envelope Q10.1.
- Don't bundle v0.2.x/v0.3.x retroactive cleanup.

## Done means

- Brainstorm output saved to `docs/specs/<chat-22-date>-community-platform-v0-4-brainstorm-output.md`.
- All **28 [blocking]** Qs answered (see questionnaire checklist at bottom).
- ≥70% **[tuning]** Qs answered (rest defer to chat-23).
- **[locked]** out-of-scope items (Section 11) confirmed.
- Chat-23 spec-writing handoff drafted at `docs/specs/<chat-22-date>-community-platform-v0-4-spec-writing-handoff.md`.
- v0.5 backlog file started at `projects/community-platform/V0_5_BACKLOG.md` capturing every "good idea, not v0.4" surfaced.

## Reference pointers

- **Production:** https://warsaw-ai-community-platform.vercel.app (v0.3.1 deploy `ivbncdcvq`)
- **Tag chain:** `community-platform-v0.3.0` → `community-platform-v0.3.1`
- **Chat-21 handoff (precedes):** `docs/specs/2026-05-17-community-platform-v0-3-shipped-followups-handoff.md`
- **ADR-0012 (LOCKED):** `docs/decisions/0012-community-platform-v0-3-discovery-posture.md`
- **Memory:** `project_community_platform_v0_3_ship.md`

---

*Drafted 2026-05-17 alongside benchmark dossier + questionnaire. Replaces the organize-only v0.4 handoff scoped earlier in chat-21 prep — Anton escalated mid-prep to world-class redesign; `plan-ceo-review` SCOPE EXPANSION mode locked the new envelope.*

## Paste-ready prompt for chat 22

```
Warsaw AI Community Platform — Chat 22: v0.4 world-class redesign brainstorm

Status: v0.3.1 SHIPPED. Chat-21 v0.3.x technical follow-ups should be
CLOSED before this chat (verify Option A signed-in /home smoke landed
in STATE.md). Scope: "best community platform in Europe, world-class
UX, inspired by global best examples" (SCOPE EXPANSION mode locked
chat-21 prep via plan-ceo-review).

Working dir: ~/Projects/Warsaw\ AI\ Comunity/projects/community-platform/

Three input docs (read in order):
1. docs/specs/2026-05-17-community-platform-v0-4-ux-ia-brainstorm-handoff.md
2. docs/research/v0-4-benchmark-dossier.md (12 platforms, live-fetched)
3. docs/specs/2026-05-17-community-platform-v0-4-questionnaire.md
   (60+ Qs, 28 blocking)

Then: gstack dogfood on live v0.3.1 → docs/research/v0-4-ux-baseline/
screenshots. CONSTRAINTS.md + HANDOFF_PROTOCOL.md + STATE.md.
ADR-0012 (locked).

CRITICAL constraints:
- v0.4 world-class but SHIPPABLE in 2-4 wks CC-time (Q10.1 envelope).
- Anonymous-accessible posture per ADR-0012 is LOCKED.
- Every output maps to v0.4.0 scope OR explicit v0.5+ backlog.
- Questionnaire is the constraint envelope.

Skills:
- gstack (evidence)
- superpowers:brainstorming (Qs)
- plan-ceo-review (mid-stream if pressure)
- NOT yet: design-shotgun, design-html (post-IA / post-spec).

Anti-patterns:
- Don't propose features outside the questionnaire.
- Don't lock Sec 4 (visual) before Sec 2 (structure).
- Don't reopen ADR-0012.
- Don't expand timeline — v0.4 must ship in 2-4 wks.

Done means: 28 blocking Qs answered + brainstorm doc saved + chat-23
spec-writing handoff drafted + V0_5_BACKLOG.md started.
```
