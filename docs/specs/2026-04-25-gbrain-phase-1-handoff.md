# GBrain Phase 1 — code-complete handoff (2026-04-25)

Snapshot of the state of the GBrain sub-project at the end of the implementation session, before manual rollout begins.

## Status

**Code-complete and pushed.** Awaiting Anton's hands on the keyboard for BotFather + Vercel + webhook setup.

- Repo: https://github.com/anton1rsod/warsaw-ai-community-gbrain (private)
- Main HEAD: `c99e02f` — `chore(gbrain): mark 0.1.0 — phase 1 feature-complete`
- Tag: `gbrain-v0.1.0`
- Branch `feat/gbrain-phase-1` fully merged into `main` (fast-forward).

## What was built

Plan: `projects/gbrain/plan.md` — 23 tasks, 143 steps. All committed.

| # | Task | Commit(s) |
|---|---|---|
| 1 | Scaffold Next.js + tsconfig + vitest + .env.example | `8d49809`, `d13af83` (review fixes) |
| 2 | CI: lint + typecheck + test + secret scan | `19da5af` |
| 3 | Config layer (zod) + 3 tests | `55b6bb8` |
| 4 | Shared types + topics map + 3 tests | `469d282` |
| 5 | Consent rules engine — 10 decision-table cases | `76ec124`, `c18c2a1` (review) |
| 6 | In-memory preferences store + 3 tests | `7a4c8fe` |
| 7 | Slug generator + 4 tests | `f6a4933` |
| 8 | toMarkdown + frontmatter + 5 tests | `e97902c`, `6bfa811` (review) |
| 9 | Webhook secret verifier (constant-time) + 4 tests | `ff53599` |
| 10 | grammY client wrapper | `8caddce` |
| 11 | Octokit GitHub store with `community/archive/` scoping + traversal rejection + 7 tests | `abd401d`, `61d8084` (review) |
| 12 | Vercel AI Gateway summarise() wrapper + 1 test | `ac3605a` |
| 13 | Digest pipeline: select + prompt + render + runDigest + 11 tests | `9e9984b`, `3d87d37` (review) |
| 14 | 48h pending queue (in-memory) + 5 tests | `c120043` |
| 15 | Commands (forget/optout/optin/status/confirm) + 11 tests | `02ec64c` |
| 16 | Webhook route + pipeline + 4 integration tests | `01dfc5c`, `4b03e28`, `8d07ca6` (review + cleanup) |
| 17 | Daily digest cron route + news log + vercel.json + 2 integration tests | `8ff75db` |
| 18 | `community/archive/` scaffolding + README | `ae207a1` |
| 19 | Member-facing onboarding doc | `c02ce74` |
| 20 | Operations playbook | `d294097` |
| 21 | Rollout runbook | `e2117bb` |
| 22 | Manual smoke script | `99a042b` |
| 23 | Final verification + 0.1.0 release marker | `c99e02f` |

## Quality gates

- 20 test files, **72 tests** passing
- Coverage: **91.65% lines / 84.31% branches / 87.5% functions / 91.65% stmts** (threshold 80%)
- `npm run lint` clean (eslint with `eslint-config-next` v16)
- `npm run typecheck` clean (`strict` + `noImplicitReturns` + `exactOptionalPropertyTypes` + `noUncheckedIndexedAccess`)
- `npm run build` clean (Next 16 with Turbopack); 2 dynamic API routes + 1 static page

## Plan-text deviations applied

Documented in commit bodies; summary:

- `.ts` extension stripping in all internal imports (tsc strict).
- `T | undefined` annotations or conditional spreads for `exactOptionalPropertyTypes`.
- Task 3: lengthened synthetic env values to satisfy schema `.min()` guards.
- Task 5: replaced `raw: {} as never` test fixture with a real `TelegramMessage`; exported `DEFER_MS`; tightened `confirmFrom`/`reason` assertions.
- Task 7: `MAX_BODY_CHARS` 40 → 34 (plan's expected output didn't match plan's constant).
- Task 10: `disable_web_page_preview` → `link_preview_options` (grammY 1.30+); `ReactionEmoji` narrowed from `string` to literal union.
- Task 11: added `..` segment rejection in `assertAllowedPath` (security review found traversal bypass); exported `ALLOWED_PREFIX`; explicit sha guard on returned commits.
- Task 13: fixed `//` double-slash in `digest/select.ts` source URL when `message_thread_id` absent.
- Task 16: `handleForget` ownerOfPath stub returns `msg.from.id` (Phase 2 = read frontmatter); added `dynamic`/`runtime` route exports; wired `/yes`/`/no`; swapped 🧠→👀 and ⏳→🤔 (former pair not in Telegram's reaction set).
- Task 17: used `vercel.json` instead of `vercel.ts` (`@vercel/config@0.2.1` is too young / canary-tagged).

## Phase 2 carryovers (logged, not blocking)

1. Cron route TG-then-commit ordering risks duplicate post on partial failure — spec accepts the retry semantic; consider try/finally + reordering in Phase 2.
2. `/yes`/`/no` author→entry lookup is a heuristic; needs proper index when `taggerIsAuthor: true` hardcode is removed.
3. `telegramLink` URL builder duplicated across `ingest/index.ts` and `digest/select.ts`.
4. In-memory `preferences` + `pending` → migrate to Vercel KV.
5. `isoDay()` duplicated in `digest/prompt.ts` and `digest/render.ts`.
6. LLM prompt lacks output-language constraint (assumes English).
7. YAML frontmatter not escaped — strict parsers would break on `:`/`&`/etc. in topic names.
8. `/gbrain-forget` ownership stub: read `author_id` from the file's frontmatter via the store.
9. `isCoreOrganizer: false` hardcode — wire to roster per ADR-0002.
10. Cron schedule comment in `vercel.json` says "≈09:00/10:00 Warsaw" — actual is 08:00 (CET) / 09:00 (CEST). One-hour doc fix.

## Manual steps remaining (next session)

Per `docs/playbooks/gbrain-rollout.md`:

1. BotFather: `/newbot` → @WarsawAIBrainBot, `/setprivacy` DISABLE, `/setjoingroups` ENABLE.
2. `vercel link` from `projects/gbrain/app/`.
3. `vercel env add` for every var in `.env.example`.
4. `npx vercel --prod` first deploy.
5. `setWebhook` with a generated secret; verify with `getWebhookInfo`.
6. Stage against a 2–3 person throwaway Telegram group; smoke-test all consent paths.
7. After staging passes: point at real channel; soft launch (organizer-only tag use, 2 weeks); full launch.
