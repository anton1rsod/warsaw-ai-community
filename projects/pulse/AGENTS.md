# AGENTS.md — pulse

> Canonical agent instructions for this sub-project. Claude Code reads `CLAUDE.md`, which imports this file. Follows the repo-root `AGENTS.md` + `docs/playbooks/collaboration.md`.

## Read order (lazy — only what your task needs)
1. `STATE.md` — current status + next actions.
2. `spec.md` — locked design decisions.
3. `plan.md` — phased task breakdown.
4. Latest handoff in `docs/specs/<date>-pulse-handoff.md`.

## Conventions
- Pure parsers in `lib/sources/*` (Zod fail-fast); no Notion dep in P1; relative imports only (no `@` alias — repo path has a space).
- Each `lib/sources/*` module exports a pure `parseX(input): X[]` (throws on shape mismatch) AND an async `loadX(repoRoot): Promise<X[]>` for fs reads.
- Unit tests target `parseX` with fixture strings (hermetic, fast); integration tests use `tests/fixtures/`.
- `REPO_ROOT` resolved via `import.meta.url` + `fileURLToPath`, never `process.cwd()`.
