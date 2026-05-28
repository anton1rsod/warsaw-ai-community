# Anton-side prod smoke script — v0.9.1 + v0.9.1.1

Use after PR #46 merges (the v0.9.1.1 closeout). Targets prod at
`https://warsaw-ai-community-platform.vercel.app` signed in as
`anton1rsod`.

**Setup:** Chrome / Safari signed into GitHub as `anton1rsod`. Open
DevTools (Cmd-Opt-I). Enable macOS dark-mode emulation: DevTools →
"…" → More tools → Rendering → "Emulate CSS media feature
prefers-color-scheme" → dark.

---

## 1. ConsentModal native `<dialog>` — Escape → sign-out

Confirmed locally that `:modal` matches, focus moves INTO the dialog,
Escape fires the cancel handler. Verify on prod:

1. Sign in as `anton1rsod`, land on `/home`.
2. DevTools → Application → Cookies → `warsaw-ai-community-platform.vercel.app`
   → delete `waic-consented`.
3. Cmd-R reload `/home`. Expect: redirected to `/consent` and the
   ConsentModal renders centered, cream bg, ink border, ink/50 backdrop
   wash. **First focusable button ("Accept and continue") has the amber
   focus ring** (proves focus auto-moved into the dialog).
4. Confirm background is inert: try to scroll the page — only the dialog
   stays interactive. Try Tab — focus cycles only through the two Pills.
5. Press **Escape**. Expect: sign-out (you land on `/login` or anon `/`).
   Network panel should show `POST /api/auth/signout 200`.
6. Sign back in. Cookie reset itself — confirm `/home` renders without
   another modal.

**FAIL signals:** dialog renders as inline section (top-layer missing,
content not centered above body); focus stays on Header avatar button
after open; Escape just closes the dialog without signing out.

## 2. `.prose-warm` previews — page-level overflow watch (v0.9.0 `<pre>` bug class)

Two surfaces; same shape: paste a long code block, switch to Preview,
verify page width never exceeds viewport width.

### 2a. `/me/edit`

1. Navigate `/me/edit`. Edit tab is default.
2. In the textarea, paste:
   ```
   ```bash
   echo "a very long line: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
   ```
   plus a long inline word: supercalifragilisticexpialidociousantidisestablishmentarianismfloccinaucinihilipilificationfoobar
   ```
3. Click **Preview**. Expect: long word wraps; bash line stays inside
   the cream-deep `<pre>` (overflows internally, scrolls on hover).
4. DevTools Console:
   ```js
   ({ doc: document.documentElement.scrollWidth, win: innerWidth, overflowing: document.documentElement.scrollWidth > innerWidth })
   ```
   Expect: `doc === win`, `overflowing: false`.
5. Don't click Save — switch back to Edit and discard.

### 2b. `/admin/events/new`

1. Navigate `/admin/events/new`.
2. Fill Title = "Smoke", Body = same long-line payload as 2a.
3. Click **Preview** below the body textarea (`Hide preview` Pill replaces
   it).
4. Same DevTools probe as 2a — expect `overflowing: false`.

**FAIL signals:** page-level horizontal scrollbar appears; preview text
extends past the cream-deep container; long inline word forces
horizontal overflow.

## 3. `/admin/health` — C9 tile + 4-week trend table

This surface couldn't run in local-E2E mode (no GitHub App
installationId locally). Source-scan verified the structure; prod is
where it actually renders.

1. Navigate `/admin/health`.
2. Expect: "Admin" MonoLabel + "Health metric" Geist 600 headline.
3. C9 tile: white bg (`bg-paper`) with 3px ink left border (`border-l-[3px]
   border-l-ink`); big `tabular-nums` count (e.g. "3 / 12") with `text-[40px]`;
   "X% active posters this week" sublabel in mono dust; "Targets:" line.
4. 4-week trend table: tokenized cream/ink with mono-dust uppercase
   headers, `border-b border-ink/15` row separators, **no `rounded`
   class anywhere**.

**FAIL signals:** the tile shows a 500 (env / installationId issue);
table has rounded corners or neutral-gray rows.

## 4. `/no-access` + `/onboard` + `/admin/invite`

Three small form / chrome surfaces.

- **`/no-access`** (sign out first, or visit anon): "// ACCESS" mono
  accent + "No platform access" Geist 600 + body in dust + dashed "Sign
  out" Pill. Body should say "Your GitHub account isn't on the **Professional
  Subploters Association** roster yet" (chat-39 env flip — confirms prod env
  reads the new COMMUNITY_NAME).
- **`/admin/invite`**: "ADMIN" mono + "Mint invitation" Geist 600 +
  two cream-deep inputs + solid "Mint invitation URL" Pill. Optionally
  click Mint to exercise InviteUrlDisplay — confirm the URL renders in
  the cream/ink boxed style; copy button is a `Pill`.
- **`/onboard`** (direct GET as a member): expect the cream not-found
  page now matches /error styling — "// onboard" MonoLabel + "This
  invitation can't be completed." Geist 600 headline + body in dust.
  **This is the v0.9.1.1 fix being verified.**

## 5. Hero `Pill` re-smoke

Quick sanity on the 4 hero surfaces — the v0.9.1 `disabled:opacity-50`
BASE addition + new `danger` variant are additive. No existing hero CTA
should change.

| Surface | Pill | Variant |
|---|---|---|
| `/` (anon) | "Sign in with GitHub" | solid |
| `/` (anon) | "Join Telegram" | dashed |
| `/home` (signed-in, no upcoming event) | (no hero Pill; empty-state copy) | n/a |
| `/events` | "subscribe (ICS)" | dashed |
| `/events/2026-05-21-meetup-4` (anon) | "Sign in to RSVP" / "Add to Calendar" | solid / dashed |
| `/events/2026-05-21-meetup-4` (signed-in) | "Going" / "Interested" / "Not going" | varies by state |

Visual: no neutral-gray leak, cream holds, Geist 600 headlines.

## 6. macOS dark-mode + soft-nav + hover

- All of 1–5 above should render identically with dark-mode emulation
  active. If anything turns dark/gray, that's a `dark:` leak.
- After /home, **click** the desktop nav "calendar" link (don't reload —
  soft nav). Expect "calendar" gains the amber underline + amber text
  immediately. Then **click** "projects" — same.
- On `/projects`, hover Community Platform card. Expect cream-deep bg
  on hover, ink text stays readable.

## What to flag back

- **Real regressions (cream→white/gray, broken Escape, page overflow, missing focus ring):** open a v0.9.1.2 issue with the surface + screenshot.
- **String mismatches** (e.g. "Warsaw AI Community" anywhere in prod UI): note for the brand-rename pass — not a v0.9.1.x scope.
- **Anything else weird:** screenshot + paste into the next chat. The /admin/health source-scan was the only surface I couldn't exercise locally, so trust your eyes more on that one.
