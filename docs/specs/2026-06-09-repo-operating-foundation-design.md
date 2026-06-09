# Repo Operating Foundation — Design Spec

**Date:** 2026-06-09
**Status:** Draft (pending founder review)
**Author:** Anton Safronov (with Claude Code)
**Scope:** Foundation pass — navigation, continuity, collaboration. Reports + Notion deferred to a fast-follow.
**Related:** `community/governance/governance.md`, ADR-0002 (governance), ADR-0004 (commercial track), `PROJECTS.md`, `docs/playbooks/ai-collaborator-stack.md`

---

## §0 — Context & goal

This monorepo is the canonical home for the community and its sub-projects, and it's growing. Anton + Yuriy (peer co-founders) and community members need to open this folder — in Claude Code, another agent, or just an editor — and become productive in ~30 seconds, know **who is driving what**, and never collide.

The repo is already ~70% "Claude Soul Shape B" (docs-first monorepo): `community/` + `projects/` + `docs/`, per-project `STATE.md`/`CLAUDE.md`, dated handoffs, 16 numbered ADRs, timestamped specs, `PROJECTS.md` portfolio board, per-project `CHANGELOG.md`, status vocabulary. **This pass completes the operating foundation and adds a thin collaboration layer — it does not restructure what already works.**

The design was validated against current (2025–2026) industry standards (see §6). The standards *confirmed* the core; the only real gap was the cross-tool agent-entry standard (`AGENTS.md`).

### Goal (one line)
Anyone (Anton, Yuriy, a member, or any AI agent) opens this repo and is oriented to "what's the state, who's on it, what's next" from a single read-order, on any tool.

### Non-goals (this pass)
Building the reports layer or Notion sync; renaming the community to the Subploters brand; touching sub-project source code.

---

## §1 — Locked decisions

| # | Decision | Rationale |
|---|---|---|
| **L1** | **`AGENTS.md` is the canonical repo-root agent-instructions file.** Move the current root `CLAUDE.md` content into `AGENTS.md`; replace `CLAUDE.md` with a thin file whose body is `@AGENTS.md` (a Claude Code import). | `AGENTS.md` is the cross-tool open standard (Linux Foundation; read natively by Codex, Cursor, Copilot, Gemini CLI, Aider, Zed). The `@import` pointer keeps Claude Code working and is **portable** — a symlink would break for Windows contributors without `core.symlinks`. Zero content change, zero Claude feature loss. |
| **L2** | **New root `STATE.md`** = portfolio-wide *temporal* snapshot: "what's hot now," **active drivers**, a `Latest handoff:` pointer, and any cross-cutting blockers. Cap ~30 lines; a cadence note at the top; link to `PROJECTS.md` for the full board — **never duplicate its status rows**. | Markdown working-memory is the documented continuity pattern. The ≤30-line cap + temporal/structural split (`STATE.md` temporal, `PROJECTS.md` structural) is the consensus anti-duplication mitigation. Distinct from `community/status/` (member weekly engagement). |
| **L3** | **Resume ritual = a documented read-order**, read directly: root `STATE.md` → the named project's `STATE.md` (or `CHANGELOG.md`, e.g. gbrain) → latest dated handoff (`docs/specs/*-handoff.md`, glob-resolved). Root `STATE.md` + latest handoff are declared "always load at session start" in `AGENTS.md`. **Do NOT invoke the `claude-soul-resume` skill** here. | Honors the standing preference to read state directly in this repo (avoids skill ceremony). The glob + `Latest handoff:` pointer make discovery O(1) and prevent reading a stale handoff. |
| **L4** | **Collaboration = peer co-founders** (Anton + Yuriy) on the whole monorepo, **W.A.Y. excepted** (it's a separate repo — exception enforced at the repo boundary). DRI model: one **owner/driver per project**. `PROJECTS.md` `Lead` column = accountable DRI; root `STATE.md` `Active drivers` = who's hands-on right now. Soft rule: one driver per project at a time, claimed in `STATE.md`. | DRI (Apple/GitLab) is the standard for small high-trust teams; explicit per-project ownership is the documented fix for the co-founder "implicit joint ownership" failure mode. |
| **L5** | **Governance ADR-0017** amends `community/governance/governance.md` to add Yuriy as **peer co-founder** and writes the **founder-class boundary** in one sentence: *a decision is founder-class if it affects legal form, equity/IP, mission scope, or the decision-rights framework itself; all others are resolved by the project DRI.* Map to the existing decision-classes table. Add Yuriy to `community/members/roster.md`. | Writing the boundary is the #1 documented mitigation against tiebreak entropy in co-founder pairs. Amending governance requires an ADR per `governance.md`. |
| **L6** | **New `docs/playbooks/collaboration.md`** = the co-founder working agreement: DRI/ownership, **branch naming + PR-vs-direct-to-main policy** (codifies the currently-tribal rule so Yuriy follows it), claim/handoff protocol, and the **anti-staleness rule**: *bumping a project's `CHANGELOG.md`/version ⇒ touch its `STATE.md` in the same PR.* | Turns Anton's in-head conventions into a shared contract. The anti-staleness rule is the consensus mitigation for "context rot"; documented now, automated with the reports fast-follow. |
| **L7** | **New root `BACKLOG.md`** = cross-cutting / community-level parked ideas, status-tagged (`[exploring] / [idea] / [parked] / [rejected]`). Per-project `BACKLOG.md` only when a project accumulates them. | Parking lot keeps specs from sprawling mid-implementation. |
| **L8** | **ADR template unchanged** (16 ADRs already use Context → Options → Decision → Consequences — consistency wins). Add an optional **Confirmation** line going forward; note **MADR 4.0.0** as its lineage. | Switching templates would churn 16 ADRs for marginal gain. MADR explicitly endorses ADRs for non-architecture/governance decisions. |
| **L9** | **Members = read + PRs** (unchanged from current governance). | Already written policy; no change needed. |
| **L10** | **Built-to-feed-reports constraint:** keep `PROJECTS.md`, per-project `STATE.md`, `CHANGELOG.md`, and `community/status/` consistently structured + parseable. Reports will be **derived, never authored**; Notion will be a **one-way repo→Notion mirror** with a stable `docs/.notion-index.json` page-id map + idempotent upsert (`notionreposync`/`mdsync`, not hand-rolled). **Deferred** — design constraint only. | The docs-as-code SSOT pattern; designing the index now avoids broken Notion bookmarks later. |
| **L11** | **Refresh root `README.md`:** fix stale statuses, make "Start here" point to root `STATE.md` first, point AI collaborators to `AGENTS.md`. **Do not rename the community** (Subploters rename is parked — avoid a half-migration). | Entry doc must match reality; brand rename is a separate migration. |

---

## §2 — Component design

### 2.1 Navigation ("front door")
- **`README.md`** (human entry): refreshed repo-map + "Start here → root `STATE.md`"; "For AI collaborators → `AGENTS.md`." Fix stale rows (e.g. Community Platform is Live, not "Proposed"). No brand rename.
- **`AGENTS.md`** (agent entry, canonical): the current `CLAUDE.md` content moved verbatim (**content-preserving — nothing dropped**) **plus** an explicit read-order block and the "always load root `STATE.md` + latest handoff" instruction. Tool-agnostic.
- **`CLAUDE.md`** (Claude Code shim): body is `@AGENTS.md`.

### 2.2 Continuity (the core — makes "resume where we left off" real)
- **Root `STATE.md`** (NEW, ≤~30 lines): cadence note · Active drivers (Anton / Yuriy) · `Latest handoff:` pointer · 2–4 "hot now" lines · cross-cutting blockers · link to `PROJECTS.md`.
- **Per-project "right now" file** (`community-platform/STATE.md`; `gbrain` uses `CHANGELOG.md` per existing convention — unchanged): add a one-line cadence note at top ("updated at each ship/phase gate") and an `Owner/DRI` line.
- **Dated handoffs** stay monorepo-level in `docs/specs/*-handoff.md` (convention unchanged); discovered via the root `STATE.md` `Latest handoff:` pointer; format documented in `collaboration.md`.
- **`BACKLOG.md`** (NEW root): parked ideas.

### 2.3 Collaboration overlay
- **ADR-0017** (NEW): Yuriy peer co-founder + founder-class boundary.
- **`governance.md`** (EDIT, via ADR): add the co-founder role + boundary.
- **`roster.md`** (EDIT): add Yuriy to core/co-founder row.
- **`PROJECTS.md`** (EDIT): clarify `Lead` = accountable DRI; refresh stale statuses.
- **`docs/playbooks/collaboration.md`** (NEW): working agreement (DRI, branch/PR policy, claim/handoff, anti-staleness rule).

### 2.4 Built to feed reports + Notion (constraint only — not built)
The continuity/board files above are the **data source** for the deferred reports layer. `community/status/YYYY-Www/<member>.md` (member weekly engagement, app-generated) is a second source the reports layer will aggregate. Notion = one-way mirror, later.

---

## §3 — File inventory

**New (root):** `AGENTS.md` (from `CLAUDE.md` + read-order) · `CLAUDE.md` (replaced → `@AGENTS.md`) · `STATE.md` · `BACKLOG.md`
**New (docs):** `docs/decisions/0017-yuriy-peer-co-founder.md` · `docs/playbooks/collaboration.md`
**New (`projects/_template/`):** `STATE.md` · `BACKLOG.md` · `AGENTS.md` (+ `CLAUDE.md` → `@AGENTS.md`) — so new projects are standard-compliant (template currently has only README/spec/plan/CHANGELOG). Handoffs stay monorepo-level in `docs/specs/`; their format is documented in `collaboration.md`.
**Edit:** `README.md` · `community/governance/governance.md` · `community/members/roster.md` · `PROJECTS.md` · `community-platform/STATE.md` (cadence note + DRI line; `gbrain` keeps `CHANGELOG.md`)

---

## §4 — Out of scope / parked (seed `BACKLOG.md`)

- `[parked]` **Subploters brand rename** across community-facing docs (README, charter) — its own migration.
- `[parked]` **Reports layer** (medium, cadence, audience) + **Notion sync** implementation — the fast-follow.
- `[idea]` Full **MADR 4.0.0** template migration + `log4brains` ADR-index tooling.
- `[idea]` Mirror `AGENTS.md` into **existing** sub-projects (`community-platform`, `gbrain`); `_template` adopts it now for new ones.
- `[idea]` **Automate** the anti-staleness rule (CI/commit hook); rule is documented now.

---

## §5 — Open questions

- **O1 — Per-project DRI:** who is the current DRI for `gbrain` vs `community-platform` (Anton, Yuriy, or shared with Anton as DRI)? Anton/Yuriy fill in `PROJECTS.md` + `STATE.md`. Default until decided: **Anton DRI, Yuriy peer**.
- **O2 — Existing sub-project `AGENTS.md`:** mirror into `community-platform`/`gbrain` now, or defer (parked)? Default: **defer**; `_template` adopts it.
- **O3 — Reports input:** confirm the reports fast-follow aggregates both project-execution (`PROJECTS.md`/`STATE.md`/`CHANGELOG`/git) **and** community-engagement (`community/status/`, events, roster). Design assumes **yes**.

---

## §6 — Standards validation (2025–2026)

| Design choice | Verdict | Source |
|---|---|---|
| `STATE.md` + handoff + read-order continuity | ✅ documented markdown working-memory pattern | Anthropic eng. guidance; [Augment — agent handoff patterns](https://www.augmentcode.com/guides/agent-handoff-patterns-human-agent-interface) |
| `AGENTS.md` as cross-tool entry | ⚠️ gap → adopt (L1) | [agents.md](https://agents.md/) |
| ADR for a governance decision | ✅ explicitly endorsed | [adr.github.io/madr](https://adr.github.io/madr/) |
| Owner/driver + founder tiebreak | ✅ DRI model | [GitLab handbook — DRI](https://handbook.gitlab.com/handbook/people-group/directly-responsible-individuals/) |
| Repo→Notion one-way derived reports | ✅ docs-as-code SSOT | [sourcegraph/notionreposync](https://github.com/sourcegraph/notionreposync) |
| `docs/` layout (playbooks=how-to, specs=explanation) | ✅ maps to Diátaxis | [diataxis.fr](https://diataxis.fr/) |
| `STATE.md` naming (phase-level) | ✅ correct vs `PROGRESS.md` (session-level) | research synthesis |

---

## §7 — Success criteria (verifiable)

1. A cold `git pull` + "open this repo, follow the read order" yields a correct current-state report from **one read path** (`AGENTS.md` → root `STATE.md`), no repo spelunking.
2. `AGENTS.md` exists at root; `CLAUDE.md` imports it; a non-Claude tool (e.g. Cursor) gets the same orientation.
3. Root `STATE.md` ≤ ~30 lines, with cadence note + `Latest handoff:` pointer + Active drivers.
4. ADR-0017 written; `governance.md` + `roster.md` reflect Yuriy as peer co-founder with the founder-class boundary in writing.
5. `docs/playbooks/collaboration.md` documents branch/PR policy + DRI + anti-staleness rule.
6. `projects/_template/` has `STATE.md` + `BACKLOG.md` + `AGENTS.md` so a new project is standard-compliant on copy.
7. `README.md` "Start here" points to `STATE.md` first; stale statuses fixed; community **not** renamed.

---

## §8 — ADR candidates

- **ADR-0017 — Yuriy as peer co-founder (W.A.Y. excepted) + founder-class decision boundary.** To be written with the `adr-writer` skill during implementation; amends governance per L5.
