# BACKLOG — pulse

> Parked ideas for this project. Tags: `[exploring]` `[idea]` `[parked]` `[rejected]`.

## Deferred from P1 code review (2026-06-09)
- `[parked]` `portfolio.ts` table-row filter doesn't skip centered-alignment separators (`| :---: |`); the real `PROJECTS.md` uses `|---|`, so it's latent. Extend the separator regex if a future table uses alignment markers.
- `[parked]` `decisions.ts` builds the ADR path via string concat (`docs/decisions/${file}`); `path.join` would normalize. Trusted repo content (always `NNNN-title.md`), no traversal risk — cosmetic.
- `[parked]` `monthly.ts` `monthLabel` is not defensive against a non-`YYYY-MM` period; unreachable via the CLI (`main` always passes `YYYY-MM`). Add a guard only if `buildMonthlyReview` gains external callers.

## P2 / P3 (tracked in the plan, not here)
- See `docs/specs/2026-06-09-pulse-implementation-plan.md` — Phase P2 (Notion mirror + Tasks export + digest page) and Phase P3 (GitHub Actions automation).
