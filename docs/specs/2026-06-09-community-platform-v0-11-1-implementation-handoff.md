# Chat handoff: Community Platform v0.11.1 — IMPLEMENT (persona attach + rich card)

PROTOCOL: `projects/community-platform/HANDOFF_PROTOCOL.md` (loaded once at start)

**Date:** 2026-06-09 · **Supersedes** the scoping handoff (`docs/specs/2026-06-09-community-platform-v0-11-1-handoff.md`), whose brainstorm/scope task is **DONE**. Scope is **LOCKED**: **Bundle B — persona attach + rich card**. Bundle A (meeting-path hardening) + (c) persona discovery are deferred (v0.11.2+).

## Context — done this chat (2026-06-09)
Brainstorm → spec → plan, all committed:
- **Spec §22** (R1–R9, H138–H150) + **ADR-0019** (Proposed) + **design doc** `docs/specs/2026-06-09-community-platform-persona-attach-design.md` — at `0dace0d`.
- **`projects/community-platform/v0.11.1-plan.md`** (5 phases, ~20 TDD tasks, full code) — at `0fdbfcc`.
- Standards-validated (OWASP / rehype / GDPR). The key correctness fix: render/attach **`.public.md` only** (persona-builder consent model) + GDPR erasure of the persona dir.

## ★ This chat owns
Execute `v0.11.1-plan.md` via **`superpowers:subagent-driven-development`** — ONE Sonnet implementer per phase (Phases 1–5), full gate (`pnpm tsc --noEmit && pnpm lint && pnpm test`) at every boundary. Closeout: **`security-reviewer` mandatory** (new write path + PII — H150), batch reviewer fixes per phase, PR, CI green.

⚠ **MERGE GATE — do NOT squash-merge before the post-meetup retro (Fri 2026-06-12, after the Thu 6/11 meetup).** The retro decides only whether Bundle A hardening preempts B (low odds — revocation + short expiry already cover the critical risk). Implementation + PR + CI may all proceed now; **hold the merge**. On merge: flip **ADR-0019 → Accepted**, push tag `community-platform-v0.11.1`, flip `STATE.md`, run the orchestrator **post-merge prod smoke** (the standing 5-for-5 ship gate), then memory + next handoff.

## Read in order (~500 lines, lazy)
1. `STATE.md` (right-now) · 2. `CONSTRAINTS.md` / `GOTCHAS.md` / `HANDOFF_PROTOCOL.md` (once) · 3. this handoff · 4. `v0.11.1-plan.md` (phase-by-phase, not all at once) · 5. spec §22 / ADR-0019 / design doc — by need.

## ★ Verify-before-claiming queries
- Inside `lib/`, use **relative** imports (`./markdown`), never `@/lib/*` (GOTCHAS #10 — breaks the `tsx` prebuild).
- Use `String.matchAll` for regex iteration, **never** the stateful `regex.exec` method — a global security hook rejects any write whose text places `exec` directly before an open-paren. (The plan's parser already uses `matchAll`.)
- `WriteOptions.sha` optionality in `lib/github-app.ts` (save-persona create-vs-overwrite): `grep -n "sha" lib/github-app.ts`.
- Commit with `git -C "$REPO"` (`$REPO` = repo root) — the test/cwd may sit inside `projects/community-platform`.
- `lib/markdown` is `allowDangerousHtml:false` + `rehype-sanitize` + no `rehype-raw` — render only through it + `SafeHtml` (H143; CONSTRAINTS).

## ★ Done means
5 phases green (tsc + lint + test + `pnpm e2e --retries=2`); `H138`–`H150` grep-verified; `lib/persona.ts` (+`lib/persona-editor.ts`) added to the **strict-list 100%** in STATE; `CHANGELOG.md` `[0.11.1]`; PR open + CI green; **HOLD for the 6/12 retro before merge**; then tag + STATE flip + prod smoke + memory + next handoff.

## ★ Anti-patterns
- Don't squash-merge before the 6/12 retro.
- Don't render the full `.md` — `.public.md` only (H138; the whole point of the consent fix).
- Don't add `dark:` variants (GOTCHAS #12 / H98 fs-walk guard fails CI).
- Don't build the full-file (frontmatter) round-trip on `/me/edit` re-attach — YAGNI, v0.11.2.
- Don't re-litigate Bundle B scope or ADR-0019's model.

## ★ Paste-ready prompt
> Open the Warsaw AI Community repo. Read order: root `STATE.md` → `projects/community-platform/STATE.md` → `CONSTRAINTS.md`/`GOTCHAS.md`/`HANDOFF_PROTOCOL.md` (once) → this handoff (`docs/specs/2026-06-09-community-platform-v0-11-1-implementation-handoff.md`). Read directly; don't invoke a resume skill.
>
> v0.11.1 scope is **LOCKED** — Bundle B (persona attach + rich card). Spec `§22`, ADR-0019 (Proposed), design doc, and `projects/community-platform/v0.11.1-plan.md` (5 phases) are committed (`0dace0d` + `0fdbfcc`). **Execute `v0.11.1-plan.md` via `superpowers:subagent-driven-development`** — one implementer per phase (1→5), full gate (tsc + lint + test) at each boundary; `security-reviewer` at closeout (H150); batch reviewer fixes per phase. PR + CI may proceed now, but **DO NOT squash-merge before the post-meetup retro (Fri 2026-06-12, after the Thu 6/11 meetup)** (which only decides whether Bundle A preempts B). On merge: ADR-0019 → Accepted, tag `community-platform-v0.11.1`, STATE flip, orchestrator post-merge prod smoke. Anti-patterns: `.public.md`-only (H138), relative imports inside `lib/`, `matchAll` not the `.exec` method, no `dark:` variants.
