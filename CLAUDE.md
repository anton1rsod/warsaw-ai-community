# CLAUDE.md — Warsaw AI Community

Docs-first monorepo. Repo = single source of truth; Telegram = conversation.
**Three artifact types:** (a) community state under `community/`, (b) sub-projects under `projects/<name>/`, (c) decisions in `docs/decisions/` (ADRs) and specs in `docs/specs/`.

## Read order (lazy — only what your task needs)

1. **`README.md`** (~80 lines) — repo map. Read once per fresh chat.
2. **`projects/<name>/CLAUDE.md`** if working in a sub-project — has its own read order.
3. **`projects/<name>/STATE.md`** (or `CHANGELOG.md` for gbrain) for "right now" status. Don't re-derive from history.
4. **Latest handoff** in `docs/specs/<date>-*-handoff.md` — the active unit of work for most chats.
5. **`community/charter/charter.md`**, **`governance/governance.md`**, **`telegram/topics.md`** — only when scope touches community ops.
6. **ADRs** in `docs/decisions/` — by number when referenced.

Don't pre-read 1–6 on every turn. Read by need.

## Operating principles (enforced)

1. **OSS-first (MIT)** — ADR-0001.
2. **Docs-first** — any decision with reversibility cost becomes an ADR.
3. **One project, one folder, one template** — copy `projects/_template/`.
4. **Brainstorm → spec → plan → implement** for non-trivial work. Don't jump to code.
5. **Member consent for data use** — GBrain ingests only `#kb`/`#archive` or topic-consented content.

## Skill discipline (token economy)

**Use these (the only ones that apply to this repo):**
- `superpowers:brainstorming` — new feature or sub-project (before spec).
- `superpowers:writing-plans` — after spec is approved.
- `superpowers:test-driven-development` — when writing code (80% coverage).
- `superpowers:subagent-driven-development` — executing a written plan with independent tasks.
- `superpowers:systematic-debugging` — stack traces / "why does this fail".
- `superpowers:verification-before-completion` — before claiming a phase done.
- `code-review:code-review` — after substantive code changes.
- `claude-md-management:claude-md-improver` — when CLAUDE.md drifts.

**Don't pattern-match these (wrong domain for this repo):** SEO/blog/ads/copywriting/sales-enablement/CRO/marketing-psychology/social-content/email-sequence/content-strategy/referral-program/churn-prevention/free-tool-strategy/pricing-strategy/ab-test-setup/analytics-tracking/programmatic-seo/site-architecture/schema-markup, and language-stack skills for Django/Laravel/Spring Boot/Kotlin/Rust/Go/C++/Flutter/Perl. **Stack is Next.js + TypeScript only** (community-platform + gbrain).

## Conventions

- ADR filenames: `NNNN-short-title.md` (4-digit padded).
- Project folders: lowercase-kebab-case under `projects/`.
- Meeting notes: `community/meetings/weekly/YYYY-MM-DD.md`.
- Events: `community/events/YYYY-MM-DD-slug/`.
- Specs: `docs/specs/YYYY-MM-DD-<topic>-design.md`.

## Working in this repo

- **New sub-project** → copy `projects/_template/`; brainstorm → spec → plan.
- **Governance / license / topics / cadence change** → new or superseding ADR.
- **Meeting notes** → `community/meetings/weekly/_template.md`.
- **Adding a member** → PR to `community/members/roster.md`, opt-in only.
- **Anything else** → read the latest handoff in `docs/specs/`.

## What NOT to do

- Don't ingest Telegram content without consent gating.
- Don't commit PII (roster is opt-in; moderation cases sanitized in ADRs).
- Don't hot-patch governance — ADRs only.
- Don't assume a commercial entity exists (ADR-0004).
- Don't inline current state (sub-project status, member count, etc.) in this file — drift trap. Point at `STATE.md` / `CHANGELOG.md`.

## Founder

Anton Safronov.
