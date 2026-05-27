# Chat-49 handoff: v0.9.1 SHIPPED — prod visual smoke + followups

PROTOCOL: `projects/community-platform/HANDOFF_PROTOCOL.md` (loaded once at start)

## Status (set by chat-48)
**v0.9.1 is SHIPPED.** PR #45 squash-merged at `b29655c`; tag `community-platform-v0.9.1` pushed; STATE flipped post-merge (`b8f1f58`). Prod auto-deploys on merge. All automated gates green: 1439 unit (+77) · tsc/lint/h67 clean · prod `pnpm build` exit 0 · `dark:`=0 · full local `pnpm e2e` 72-pass/3-skip/0-fail · 3-lane reviewer triage (security 0C/0H). Full record: STATE.md snapshot + CHANGELOG `[0.9.1]` + memory `project_community_platform_v0_9_1_ship`.

## ★ This chat owns — the deferred authenticated visual smoke (PRIMARY)
The visual smoke could NOT run pre-merge: the Vercel **preview can't render any v0.9.1 surface** (all auth-gated; app sign-in uses a **prod-only** GitHub OAuth callback — GOTCHAS #3), and the orchestrator Playwright MCP was blocked by a locked browser profile. So it lands here, on **production**, signed in as a real member/admin.

**Priority checklist (per `feedback_visual_smoke_soft_nav_hover` — soft-nav + hover, not just `goto`+screenshot):**
1. **ConsentModal native `<dialog>`** (the one behavioral change, jsdom-untestable) — trigger by clearing the `waic-consented` cookie in DevTools (as in chat-15), reload `/consent` (or hit any gated route). Verify: dialog opens in the top layer over a `bg-ink/50` backdrop; focus moves INTO it on open; **Escape → sign-out** (the `cancel` handler); Accept/Cancel are warm `Pill`s; background is `inert`.
2. **`.prose-warm` previews — overflow watch** (the v0.9.0 `<pre>` bug class): `/me/edit` (ProfileEditor Preview tab) + `/admin/events/new` (EventForm body preview) — paste a long code block / long line, confirm no horizontal page overflow.
3. **`/admin/health`** — C9 metric tile (`border-l-[3px]` + big `tabular-nums` number) + tokenized 4-week trend table render cream/ink, no `rounded border`.
4. **`/no-access`**, **`/onboard`** (needs an invite cookie), **`/admin/invite`** — cream forms, `Pill` buttons, no neutral/gray leak.
5. **Hero `Pill` re-smoke** (`/`, `/home`, `/events`, `/events/[slug]`) — the `disabled:opacity-50` BASE change + `danger` variant are additive; confirm no hero CTA regression.
6. All under **macOS-dark emulation** (cream must hold — `dark:`=0) + a **soft-nav** click + a **hover** pass.

If the smoke finds a bug → fix as a v0.9.1.x point-release (className-only where possible; same subagent-driven discipline).

## ★ Deferred followups (recorded by chat-48 — optional, low priority)
1. **Extract the 4× local `isProductionRuntime()` helper** (`rsvp-event.ts`, `thank-status.ts`, `event-rsvp-state/route.ts`, `status.ts`) to one shared module. The v0.9.1 plan *explicitly instructed* local copies, so this is a clean post-ship DRY refactor (touches the pre-existing `status.ts` copy too).
2. **Align `this-week` `fetchStatuses` single-guard** (`isE2EMode()` only) to the double-guard (`!isProductionRuntime() && …`) for consistency with `loadViewerProfile` (security-accepted as zero-risk; pure hygiene).
3. **Routing-model doc fix:** the v0.9.1 plan/design §7 listed `/members`,`/decisions`,`/projects` as public; they are **gated** per `proxy.ts` `PUBLIC_PATHS` (the E2E impl corrected to reality, but the design doc still reads wrong if reused).

## ★ Then — V0_5_BACKLOG
With the warm-system rollout complete (`app/` is now ~0 `neutral-*`/`gray-*`/`rounded border`), the next feature cycle is open. Read `projects/community-platform/V0_5_BACKLOG.md` for queued items; brainstorm → spec → plan before implementing.

## ★ Anti-patterns (this chat)
- Don't re-run the full implementation — v0.9.1 is shipped. This chat is smoke + followups.
- Don't try to smoke v0.9.1 on a preview deploy (auth-gated; sign-in is prod-only). Use prod or a local `NEXT_PUBLIC_E2E_MODE=1` dev server with `/api/test-auth`.

## ★ Paste-ready prompt (next chat)
> v0.9.1 is shipped (merge `b29655c`, tag pushed, STATE flipped `b8f1f58`). Run the deferred authenticated visual smoke on production per this handoff's priority checklist — ConsentModal `<dialog>` (clear `waic-consented` cookie to trigger), `.prose-warm` previews on `/me/edit` + `/admin/events/new`, `/admin/health` C9, hero Pill re-smoke — signed in, with macOS-dark + soft-nav + hover. Report findings; fix any as v0.9.1.x. Then optionally pick up the deferred followups or open the V0_5_BACKLOG.
