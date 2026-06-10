# Chat handoff: Community Platform — post-v0.11.1 (smoke confirm · 6/12 retro · v0.11.2 scope)

PROTOCOL: `projects/community-platform/HANDOFF_PROTOCOL.md` (loaded once at start)

**Date:** 2026-06-10 · **Supersedes** the merge handoff (`docs/specs/2026-06-10-community-platform-v0-11-1-merge-handoff.md`, now DONE — v0.11.1 shipped).

## Done already — v0.11.1 SHIPPED (2026-06-10)
Persona attach + rich card (Bundle B). See memory [[project_community_platform_v0_11_1_impl]].
- PR #55 squash-merged at `616ba6f`; tag `community-platform-v0.11.1`; **ADR-0019 Accepted**; STATE + CHANGELOG `[0.11.1]` flipped. **Anton (DRI) overrode the documented 6/12 retro gate** to ship now (the gate was Bundle A-vs-B priority only, not readiness).
- **1582 unit/int + e2e/persona-attach 2/2**; `lib/persona.ts`+`lib/persona-editor.ts` 100% (strict-list). Security (mandatory H150)+ts+code review **0 CRITICAL** (2 HIGH fixed, `2d0b5d3`). **CI green** (run 27268375219).
- **Slug aligned** `anton-s`→`anton-safronov` (folder == `persona_id` == slugify(display_name)=="Anton Safronov" == roster slug). Ship-day catch: the folder-rename first broke the H68 invariant test (display_name still "Anton S.") → red CI → fixed `4ccf874`. Lesson: re-run the suite after any data migration touching test-scanned paths.

## ★ Signed-in prod smoke — DONE + GREEN (2026-06-10)
Closed: Anton re-authed the orchestrator Playwright browser (GitHub OAuth), then the orchestrator ran the signed-in smoke on prod. All green — `/members/anton-safronov` + `/members/mark-spasonov` render the full rich card (depth-sorted chips + "Languages: en" + niche list + full SafeHtml body with `## Tags` stripped + `# <Name>` heading; no 500/overflow/XSS); `/me/edit` renders the PersonaEditor (consent + "do not include private notes" copy + re-attachable seeded textarea) + the **checked** `persona_visible` toggle. **The standing prod-smoke gate is 5-for-5 for v0.11.1 — nothing left to verify.** (If Anton later hits a regression in normal use → v0.11.1.1 point-release.)

## Context — 6/11 meetup + 6/12 retro
- **Thu 2026-06-11 meetup** = first real-world use of v0.11.0 meeting-signup (mint the QR at go-time per the ~4h H127 clamp). Reminder `trig_01767t2XLP1RQQ4Q5mTnqGjb` (Thu 19:30 Warsaw).
- **Fri 2026-06-12 retro + brainstorm** reminder `trig_01VcZ2jgMZvQFNSKapg3FuhB` (Fri 10:00). The retro **no longer gates v0.11.1** (shipped) — it's now (a) the meeting-signup retro + (b) the next-scope brainstorm.

## ★ Next substantive work (pick per Anton) — v0.11.2 scope (brainstorm first)
Deferred fast-follows: per-IP rate-limit on redemption (BotID/WAF) · signed fresh-member bridge cookie · persistent active-invite registry · meeting-token `iat` · revoke auto-retry. **Persona-specific:** persona-builder should generate `persona_id`/folder == the member's roster slug (so future persona alignment isn't manual — the H68 + readMemberPersona conventions then hold automatically). **Infra:** ~~Node-20→24 CI bump~~ **DONE 2026-06-10** as a standalone PR (#56, squash `f914c13`): all three workflows on `checkout@v6`/`setup-node@v6`/`pnpm/action-setup@v6` (node24). Compat verified — checkout v6 keeps `persist-credentials: true` (pulse write-back unaffected); setup-node v6 still supports explicit `cache: pnpm` (its v6 breaking change narrows *automatic* caching to npm only); pnpm stays pinned `version: 10`. PR CI + post-merge pulse dormant run green. **Polish:** i18n the PersonaEditor status strings. Per [[feedback_dont_skip_brainstorming]], run `superpowers:brainstorming` before any v0.11.2 spec.

## ★ Verify-before-claiming
- Stale-doc: `content-snapshot.json` is **gitignored** (`.gitignore:16`); CONSTRAINTS §"Generated artifacts" + the v0.11.1 plan's Task 2.2 wrongly list it as committed — correct CONSTRAINTS when convenient.
- Persona consent model is enforced by `persona-builder/.gitignore` (only `*.public.md` tracked; full `*.md` private/untracked).

## ★ Anti-patterns
- Don't re-open v0.11.1 (shipped, reviewed 0C) unless the signed-in smoke finds a real bug.
- Don't manually re-align the 3 non-roster personas (`dmitry-b`/`heorhii-k`/`maksym-pavlenko`) — they correctly don't display (no member page); they align on roster admission.
- Inside `lib/` relative imports (GOTCHAS #10); `matchAll` not the `.exec` method; no `dark:` variants; render only via `lib/markdown`+`SafeHtml`.

## ★ Paste-ready prompt
> Open the Warsaw AI Community repo. Read order: root `STATE.md` → `projects/community-platform/STATE.md` → `CONSTRAINTS.md`/`GOTCHAS.md`/`HANDOFF_PROTOCOL.md` (if new) → this handoff (`docs/specs/2026-06-10-community-platform-post-v0-11-1-handoff.md`). Read directly; don't invoke a resume skill.
>
> **v0.11.1 (persona attach + rich card) is SHIPPED** (PR #55 `616ba6f`, tag `community-platform-v0.11.1`, ADR-0019 Accepted, CI green; slug aligned `anton-s`→`anton-safronov`; **signed-in prod smoke 5-for-5** — both members' rich cards + `/me/edit` PersonaEditor + `persona_visible` toggle verified live; nothing left to verify, a regression in normal use → v0.11.1.1). The next substantive work is **v0.11.2 scoping** (brainstorm first per the deferred fast-follows: rate-limit · bridge cookie · active-invite registry · persona-builder→roster-slug convention; the Node-20→24 CI bump is already DONE — PR #56 `f914c13`) and/or processing the **Fri 6/12 retro + brainstorm**. Tell me which.
