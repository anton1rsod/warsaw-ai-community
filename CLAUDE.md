# CLAUDE.md — Warsaw AI Community

This file is loaded automatically at the start of every Claude Code session in this repo. It's the "what this repo is and how to work in it" pointer for AI collaborators.

## What this repo is

The **Warsaw AI Community** program repository. It contains:

1. **The community's operating state** — charter, governance, cadence, meeting notes, member roster, Telegram topic config, brand.
2. **Sub-projects** — one folder per project under `projects/`, each using the standard template (`README.md`, `spec.md`, `plan.md`, `CHANGELOG.md`). First project: **GBrain** (Telegram knowledge base).
3. **Decisions and designs** — ADRs in `docs/decisions/`, design specs in `docs/specs/`, organizer runbooks in `docs/playbooks/`.

**This is a docs-first monorepo.** The repo is the single source of truth for how the community operates. Telegram is conversation; the repo is memory.

## Read these first

- [`README.md`](README.md) — repo map and onboarding.
- [`docs/specs/2026-04-24-warsaw-ai-community-program-design.md`](docs/specs/2026-04-24-warsaw-ai-community-program-design.md) — the full program spec.
- [`community/charter/charter.md`](community/charter/charter.md) — mission, values, horizon.
- [`community/governance/governance.md`](community/governance/governance.md) — roles, decisions.
- [`community/telegram/topics.md`](community/telegram/topics.md) — canonical topic set + ingestion rules.
- [`docs/decisions/`](docs/decisions/) — ADRs 0001–0005 encode the foundational decisions.

## Operating principles (enforced)

1. **OSS-first (MIT).** See ADR-0001.
2. **Docs-first.** Any decision with reversibility cost becomes an ADR.
3. **One project, one folder, one template.** Copy `projects/_template/`.
4. **Brainstorming before implementation.** For any non-trivial sub-project, run the `superpowers:brainstorming` skill → write spec → write plan → implement. Don't jump to code.
5. **Member consent for data use.** GBrain only ingests content that is `#kb`/`#archive` tagged or topic-consented.

## Conventions

- **ADR file names:** `NNNN-short-title.md`, zero-padded to 4 digits.
- **Project folders:** lowercase-kebab-case, under `projects/`.
- **Meeting notes:** `community/meetings/weekly/YYYY-MM-DD.md`.
- **Events:** `community/events/YYYY-MM-DD-slug/`.
- **Specs:** `docs/specs/YYYY-MM-DD-<topic>-design.md`.

## Working in this repo

When a user (typically Anton) asks for:

- **Starting a new project** → copy `projects/_template/` and walk them through spec/plan via brainstorming.
- **Modifying governance / license / topics / cadence** → write or supersede an ADR in `docs/decisions/`. Don't silently edit the governance/topics files without an ADR.
- **Writing meeting notes** → use `community/meetings/weekly/_template.md`.
- **Adding a member** → PR to `community/members/roster.md`, opt-in only.
- **Setting up the first GBrain build** → open a fresh brainstorming session for `projects/gbrain/spec.md`, then writing-plans for `projects/gbrain/plan.md`.

## What NOT to do

- Don't write code that ingests Telegram content without consent gating (`#kb`/`#archive` tags or topic-level consent).
- Don't commit PII. Roster is opt-in only. Moderation cases are sanitized in ADRs.
- Don't hot-patch governance. Changes require an ADR.
- Don't assume a commercial entity exists. None does yet (see ADR-0004).

## Context snippet

- **Community size:** 19 members (2026-04-24).
- **Channel:** Telegram, topic-structured. 5 existing topics, 3 new ones approved (see ADR-0003).
- **Commercial status:** not monetizing; building commercial readiness (ADR-0004).
- **First sub-project:** GBrain. Spec pending — next brainstorming cycle.
- **Founder:** Anton Safronov.

## Session workflow hints for AI collaborators

1. When helping with a sub-project, always check `projects/<name>/spec.md` and `plan.md` first.
2. When helping with community ops, check `community/` before suggesting changes; respect the ADR trail.
3. Use the `superpowers:brainstorming` skill for any new feature or project.
4. Use the `superpowers:writing-plans` skill after a spec is approved.
5. Use the `superpowers:test-driven-development` skill when writing code (80%+ coverage, tests first).
6. Record every non-trivial decision as an ADR.
