# Repo Operating Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Complete the repo's operating foundation — navigation, continuity, and a peer co-founder collaboration layer — so anyone (Anton, Yuriy, a member, or any AI agent) opens the folder and is oriented in ~30 seconds.

**Architecture:** Doc-only, surgical. Adopt the `AGENTS.md` cross-tool standard, add a portfolio-wide root `STATE.md` + read-order, formalize Yuriy as peer co-founder via an ADR, and a collaboration playbook. Reports + Notion are deferred.

**Tech Stack:** Markdown + git. No code, no CI-triggered paths → all commits **direct to `main`** (docs-only, per `collaboration.md` PR policy). Commits batched **per phase**.

**Spec:** `docs/specs/2026-06-09-repo-operating-foundation-design.md`

---

## Phase 1 — Continuity core (root STATE.md + BACKLOG.md)

### Task 1.1: Create root `STATE.md`
**Files:** Create `STATE.md`

- [ ] **Step 1: Write the file** (≤30 lines, temporal snapshot; links to `PROJECTS.md`, never duplicates its rows)

```markdown
# STATE — Warsaw AI Community (repo-wide)

> **What this is:** the portfolio-wide "right now" snapshot — updated at each ship/phase gate. Full board: [`PROJECTS.md`](PROJECTS.md). Member weekly status lives in `community/status/`.
> **Resume:** read this → the named project's `STATE.md` (or `CHANGELOG.md` for gbrain) → the latest handoff below. Read directly; don't invoke a resume skill.

**Last updated:** 2026-06-09

## Active drivers
- **Anton (DRI):** gbrain · community-platform · repo operating foundation (this change).
- **Yuriy (peer co-founder):** community ops — onboarding as peer co-founder (see ADR-0017).

## Hot now
- Repo operating foundation pass shipping (navigation + continuity + collaboration). Spec: `docs/specs/2026-06-09-repo-operating-foundation-design.md`.

## Blockers
- None.

## Latest handoff
- _none in flight_ — when pausing mid-task, add `docs/specs/<date>-<topic>-handoff.md` here.
```

- [ ] **Step 2: Verify** — `test -f STATE.md && wc -l STATE.md` (expect ≤ ~30) and `grep -q "Active drivers" STATE.md && grep -q "Latest handoff" STATE.md`

### Task 1.2: Create root `BACKLOG.md`
**Files:** Create `BACKLOG.md`

- [ ] **Step 1: Write the file** (seed with the parked items from spec §4)

```markdown
# BACKLOG — cross-cutting / community-level

> Parked ideas not tied to a single sub-project. Tags: `[exploring]` `[idea]` `[parked]` `[rejected]`.
> Sub-project ideas live in that project's own `BACKLOG.md`.

- `[parked]` Reconcile community-facing docs (README, charter) with the **Subploters** brand v1.2 — its own migration.
- `[parked]` **Reports layer** to community leaders (medium, cadence, audience) — fast-follow on this foundation; derives from `PROJECTS.md` + `STATE.md` + `CHANGELOG.md` + `community/status/`.
- `[parked]` **Notion PM mirror** — one-way repo→Notion, stable `docs/.notion-index.json` page-id map + idempotent upsert (`notionreposync` / `mdsync`, not hand-rolled).
- `[idea]` Full **MADR 4.0.0** ADR template migration + `log4brains` auto-index.
- `[idea]` Mirror `AGENTS.md` into existing sub-projects (`community-platform`, `gbrain`).
- `[idea]` **Automate** the anti-staleness rule (CI/commit hook: CHANGELOG/version bump ⇒ `STATE.md` touched).
```

- [ ] **Step 2: Verify** — `test -f BACKLOG.md && grep -q "Subploters" BACKLOG.md`

- [ ] **Step 3: Commit Phase 1**

```bash
git add STATE.md BACKLOG.md
git commit -m "docs: add repo-wide STATE.md + BACKLOG.md (continuity core)"
```

---

## Phase 2 — Agent entry (AGENTS.md standard)

### Task 2.1: Move `CLAUDE.md` → `AGENTS.md` (content-preserving) + shim
**Files:** Rename `CLAUDE.md` → `AGENTS.md`; create new `CLAUDE.md`

- [ ] **Step 1: Preserve history** — `git mv CLAUDE.md AGENTS.md`
- [ ] **Step 2: Retitle** `AGENTS.md` — change the H1 from `# CLAUDE.md — Warsaw AI Community` to `# AGENTS.md — Warsaw AI Community` and add a 1-line subtitle: `> Canonical agent instructions (cross-tool open standard). Claude Code reads CLAUDE.md, which imports this file.`
- [ ] **Step 3: Update the existing "Read order" section** in `AGENTS.md` so **step 1 is the root `STATE.md`**, and add the resume guidance. Replace the current read-order intro list's first item with:

```markdown
0. **Root `STATE.md`** — the portfolio-wide "what's hot now + who's driving + latest handoff." ALWAYS load this first, every session.
```

  …and append this line under that section:

```markdown
**Resume:** root `STATE.md` → named project's `STATE.md` (or `CHANGELOG.md` for gbrain) → latest handoff (`docs/specs/*-handoff.md`, newest). Read directly — do NOT invoke `claude-soul-resume` in this repo.
```

- [ ] **Step 4: Add collaboration pointer** — under the existing "Working in this repo" or "Conventions" section, add: `- **Co-founder working agreement** → docs/playbooks/collaboration.md (ownership/DRI, branch & PR policy, handoff + anti-staleness rule).`
- [ ] **Step 5: Create new `CLAUDE.md`**

```markdown
<!-- Claude Code entry point. Canonical agent instructions live in AGENTS.md (cross-tool open standard). -->
@AGENTS.md
```

- [ ] **Step 6: Verify** — all of:
  - `grep -q "AGENTS.md — Warsaw AI Community" AGENTS.md`
  - `grep -q "OSS-first" AGENTS.md` (proves operating-principles content preserved)
  - `grep -q "Root .STATE.md." AGENTS.md` (read-order updated)
  - `grep -q "@AGENTS.md" CLAUDE.md`
  - content parity: `git show HEAD:CLAUDE.md | grep -c "."` vs new `AGENTS.md` line count (AGENTS.md should be ≥ old CLAUDE.md — nothing dropped, only added)

- [ ] **Step 7: Commit Phase 2**

```bash
git add AGENTS.md CLAUDE.md
git commit -m "docs: adopt AGENTS.md cross-tool standard; CLAUDE.md imports it"
```

---

## Phase 3 — Collaboration & governance

### Task 3.1: Write ADR-0017 (use `adr-writer` skill)
**Files:** Create `docs/decisions/0017-yuriy-peer-co-founder.md`

- [ ] **Step 1:** Invoke the `adr-writer` skill with this decision; it auto-numbers (next = 0017) and updates the ADR index. Required content:
  - **Title:** Yuriy as peer co-founder (W.A.Y. excepted) + founder-class decision boundary
  - **Status:** Accepted · **Date:** 2026-06-09 · **Deciders:** Anton (founder)
  - **Context:** Yuriy is the community co-founder; governance lists only Founder + TBD core organizers. Two peers need explicit roles + a decision boundary.
  - **Options:** (A) Core organizer; (B) **Peer co-founder, founder retains founder-class tiebreak (CHOSEN)**; (C) Full co-BDFL incl. founder-class.
  - **Decision:** B. Yuriy is a peer co-founder across the monorepo. **W.A.Y. is excepted** (separate repo, Anton-solo). **Founder-class** = affects legal form, equity/IP, mission scope, or the decision-rights framework itself → Anton; all else → the project DRI.
  - **Consequences — Easier:** clear shared ownership, fewer collisions, defined escalation. **Harder:** keep `roster.md`/`governance.md` in sync; remember the W.A.Y. exception.
  - **Implementation:** amend `governance.md` (Task 3.2); add Yuriy to `roster.md` (Task 3.3).
- [ ] **Step 2: Verify** — `test -f docs/decisions/0017-yuriy-peer-co-founder.md && grep -q "founder-class" docs/decisions/0017-yuriy-peer-co-founder.md`

### Task 3.2: Amend `governance.md`
**Files:** Modify `community/governance/governance.md` (the "## Model" section)

- [ ] **Step 1:** Under "## Model", add a co-founder bullet above Core organizers:
  `- **Co-founder (peer):** Yuriy — peer co-founder across the monorepo (W.A.Y. excepted, separate repo). Co-owns direction and projects with the founder.`
  And add, after the role list:
  `**Founder-class decisions** (legal form, equity/IP, mission scope, or this decision-rights framework itself) rest with the founder; all other decisions are resolved by the project DRI. See ADR-0017.`
- [ ] **Step 2: Verify** — `grep -q "Co-founder (peer): Yuriy" community/governance/governance.md && grep -q "Founder-class decisions" community/governance/governance.md`

### Task 3.3: Add Yuriy to `roster.md`
**Files:** Modify `community/members/roster.md` (Core organizers table)

- [ ] **Step 1:** Add a row to the Core organizers table:
  `| Yuriy *(surname TBD)* | *(TBD)* | Co-founder (peer) | *(TBD)* | Community |`
  (Handles are real-world data pending from Anton — flagged at handoff, not a plan defect.)
- [ ] **Step 2: Verify** — `grep -q "Co-founder (peer)" community/members/roster.md`

### Task 3.4: Create `docs/playbooks/collaboration.md`
**Files:** Create `docs/playbooks/collaboration.md`

- [ ] **Step 1: Write the file**

```markdown
# Collaboration Playbook

> How Anton + Yuriy (peer co-founders) and members work in this repo. Governance: `community/governance/governance.md` + ADR-0017.

## Ownership (DRI model)
- One **owner/driver (DRI)** per project — decides in their lane, consults freely.
- `PROJECTS.md` `Lead` = accountable DRI. Root `STATE.md` `Active drivers` = who's hands-on right now.
- Soft rule: **one driver per project at a time** — claim it in root `STATE.md` before starting.
- Anton + Yuriy are peer co-founders across the monorepo; **W.A.Y. is excepted** (separate repo).
- Tie-break: the project DRI decides; **founder-class** decisions (legal form, equity/IP, mission scope, or the decision-rights framework itself) → Anton, per ADR-0017.

## Branches & PRs
- Branch naming: `<type>/<project>-<short-topic>` — e.g. `feat/community-platform-v0-11-rsvp`, `chore/repo-foundation`. Types: feat, fix, chore, docs, refactor.
- **PR vs direct-to-main:** docs-only / meta-config (CI path-filter excludes them) → direct to `main`. Code touching CI-triggered paths or cross-cutting work → PR + review.
- Commits: conventional `<type>: <description>`; no attribution trailer; push after substantive commits.

## Resuming work
- Read order: root `STATE.md` → project `STATE.md` (or `CHANGELOG.md`) → latest handoff. Read directly.
- Pausing mid-task: write `docs/specs/<date>-<project>-<topic>-handoff.md` (≤80 lines: where we stopped · done/not-done/in-flight · pickup steps) and add a `Latest handoff:` line to root `STATE.md`.

## Keeping state honest (anti-staleness rule)
- **Bump a project's `CHANGELOG.md` / version ⇒ touch its `STATE.md` (gbrain: its `CHANGELOG.md`) in the same PR.** Update root `STATE.md` at each ship/phase gate.
- (Automating this check is parked in `BACKLOG.md`.)

## Members
- Read + PRs. Add yourself via the invitation flow or a PR to `community/members/roster.md` (opt-in). Pitch projects in Telegram `#Builds & Pitches`.
```

- [ ] **Step 2: Verify** — `test -f docs/playbooks/collaboration.md && grep -q "anti-staleness" docs/playbooks/collaboration.md`

- [ ] **Step 3: Commit Phase 3**

```bash
git add docs/decisions/ community/governance/governance.md community/members/roster.md docs/playbooks/collaboration.md
git commit -m "docs: ADR-0017 Yuriy peer co-founder + governance amend + collaboration playbook"
```

---

## Phase 4 — Template parity (`projects/_template/`)

### Task 4.1: Add continuity files to the template
**Files:** Create `projects/_template/STATE.md`, `projects/_template/BACKLOG.md`, `projects/_template/AGENTS.md`, `projects/_template/CLAUDE.md`

- [ ] **Step 1: `projects/_template/STATE.md`**

```markdown
# STATE — <project-name>

> Updated at each ship/phase gate. Resume: read this → latest handoff in `docs/specs/`.

**Last updated:** <YYYY-MM-DD>
**Owner / DRI:** <name>
**Status:** Proposed | In design | Building | Live | Archived
**Branch:** <branch or main>

## What just happened
- <last completed milestone>

## What's next
- <next 1-3 actions>

## Latest handoff
- _none_ — link `docs/specs/<date>-<project>-handoff.md` when pausing mid-task.
```

- [ ] **Step 2: `projects/_template/BACKLOG.md`**

```markdown
# BACKLOG — <project-name>

> Parked ideas for this project. Tags: `[exploring]` `[idea]` `[parked]` `[rejected]`.

- `[idea]` <example parked idea>
```

- [ ] **Step 3: `projects/_template/AGENTS.md`**

```markdown
# AGENTS.md — <project-name>

> Canonical agent instructions for this sub-project. Claude Code reads `CLAUDE.md`, which imports this file. Follows the repo-root `AGENTS.md` + `docs/playbooks/collaboration.md`.

## Read order (lazy — only what your task needs)
1. `STATE.md` — current status + next actions.
2. `spec.md` — locked design decisions.
3. `plan.md` — phased task breakdown.
4. Latest handoff in `docs/specs/<date>-<project>-handoff.md`.

## Conventions
- <project-specific conventions>
```

- [ ] **Step 4: `projects/_template/CLAUDE.md`**

```markdown
<!-- Claude Code entry point. Canonical agent instructions: AGENTS.md -->
@AGENTS.md
```

- [ ] **Step 5: Verify** — `for f in STATE BACKLOG AGENTS CLAUDE; do test -f projects/_template/$f.md && echo "ok $f"; done` (expect 4 oks) and `grep -q "@AGENTS.md" projects/_template/CLAUDE.md`

- [ ] **Step 6: Commit Phase 4**

```bash
git add projects/_template/
git commit -m "docs: add STATE/BACKLOG/AGENTS/CLAUDE to project template (standard-compliant scaffold)"
```

---

## Phase 5 — Navigation refresh (no brand rename)

### Task 5.1: Refresh root `README.md`
**Files:** Modify `README.md`

- [ ] **Step 1:** In the "## Start here" section, make the **first item** "Read the repo-wide `STATE.md` — what's hot now + who's driving." Keep charter/governance/program-spec as following items.
- [ ] **Step 2:** Update "For AI collaborators: read `CLAUDE.md`" → "read `AGENTS.md` (Claude Code reads `CLAUDE.md`, which imports it)".
- [ ] **Step 3:** Fix stale repo-map / status rows: Community Platform → **Live** (current shipped version, not "Proposed, pending brainstorm"); gbrain → its real status; persona-builder → Live. **Do NOT rename the community** (Subploters rename is parked).
- [ ] **Step 4: Verify** — `grep -q "STATE.md" README.md && grep -q "AGENTS.md" README.md && ! grep -q "pending brainstorm" README.md`

### Task 5.2: Refresh `PROJECTS.md`
**Files:** Modify `PROJECTS.md`

- [ ] **Step 1:** Add a one-line note under the header: `> **Lead = accountable DRI** (decision owner per project). "Active drivers" (who's hands-on now) live in the repo-wide STATE.md.`
- [ ] **Step 2:** Update "Last updated" to 2026-06-09 and refresh the status rows to current reality (Community Platform Live + current version; gbrain current; persona-builder Live).
- [ ] **Step 3: Verify** — `grep -q "Lead = accountable DRI" PROJECTS.md`

### Task 5.3: Per-project STATE cadence + DRI line
**Files:** Modify `projects/community-platform/STATE.md`

- [ ] **Step 1:** Read the file first. Add (if absent) a top blockquote `> Updated at each ship/phase gate.` and an `**Owner / DRI:** Anton` line near the top. (gbrain uses `CHANGELOG.md` — leave unchanged.)
- [ ] **Step 2: Verify** — `grep -qi "DRI" projects/community-platform/STATE.md`

- [ ] **Step 3: Commit Phase 5**

```bash
git add README.md PROJECTS.md projects/community-platform/STATE.md
git commit -m "docs: refresh README/PROJECTS navigation (STATE-first, AGENTS.md, DRI, current statuses)"
```

- [ ] **Step 4: Push everything** — `git push origin main`

---

## Self-Review (run before executing)

**Spec coverage (§3 file inventory vs tasks):**
- L1 AGENTS.md + CLAUDE.md shim → Task 2.1 ✓
- L2/L3 root STATE.md + read-order/resume → Task 1.1 + 2.1 ✓
- L4 DRI/owner-driver → Task 3.4 + 5.2 ✓
- L5 ADR-0017 + governance + roster → Tasks 3.1–3.3 ✓
- L6 collaboration.md + anti-staleness rule → Task 3.4 ✓
- L7 root BACKLOG.md → Task 1.2 ✓
- L8 ADR template (kept) → no task needed (no change) ✓
- L9 members read+PR → documented in collaboration.md ✓
- L10 built-to-feed (deferred) → parked in BACKLOG (Task 1.2) ✓
- L11 README refresh, no rename → Task 5.1 ✓
- `_template` parity → Phase 4 ✓

**Placeholder scan:** `<project-name>`/`<YYYY-MM-DD>` etc. in Phase 4 are intentional *template tokens*. Yuriy's handles in roster (Task 3.3) are real-world-data-pending (flag to Anton), not plan defects.

**Type/name consistency:** "DRI", "Active drivers", "Owner / DRI", "founder-class", `Latest handoff:` used consistently across STATE.md, collaboration.md, governance.md, ADR-0017.

**Open item for Anton at handoff:** Yuriy's surname + GitHub + Telegram handles for `roster.md`; confirm per-project DRI split (O1 — default Anton DRI, Yuriy peer).
