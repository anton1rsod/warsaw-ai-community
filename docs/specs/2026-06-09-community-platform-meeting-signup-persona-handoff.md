# Handoff — Community Platform: meeting signup + persona integration

**Date:** 2026-06-09 (Tue)
**For:** the next chat — **START with `superpowers:brainstorming`** (do NOT skip; see memory `feedback_dont_skip_brainstorming`), then spec → plan → implement in-framework.
**Hard deadline:** Thursday **2026-06-11** weekly meetup.

## Goal (Anton, 2026-06-09)
1. **Member signup at the meeting via GitHub** — attendees join the platform on the spot.
2. **Persona upload / integration** — a member can attach (upload or integrate) their persona to their profile.

## Critical context — signup is ALREADY built (invite-gated, not open)
The platform is **invitation-only today**:
- `/onboard` requires a valid HMAC invite cookie (`INVITE_SECRET`, set by `app/api/auth/[...nextauth]/proxy.ts`). Redemption (`lib/invitations.ts:redeemInvitation`) auto-appends to `community/members/roster.md` + git-email-aliases + invitations ledger + a profile stub, all via the GitHub App. Admins issue invites at `/admin/invite`.
- ⇒ **GitHub-OAuth signup-via-invite already works end-to-end.** Thursday is an *operational* question, not greenfield.

**Key brainstorm decision (membership policy — likely an ADR):**
- **Path A — operationalize invites for the room (RECOMMENDED for Thursday):** a shareable/batch invite or a meeting-scoped link/QR so N attendees can redeem. Small, fits existing infra, low risk.
- **Path B — true open self-signup (anyone with GitHub joins):** removes/bypasses the invitation gate + new auto-roster write path (~200–400 LOC) and **changes the community membership model → ADR + reversibility cost.** Decide deliberately; do not rush for Thursday.

## Persona integration — render path already exists
- Personas live at `persona-builder/personas/<slug>/persona-<slug>.md` (+ optional `.public.md`); YAML frontmatter + markdown.
- `app/members/[slug]/page.tsx` **already renders** a member's persona when a folder matches their slug (name-match, no explicit link).
- Self editor `app/me/edit/page.tsx` commits `community/members/<slug>.md` via the GitHub App.
- ⇒ **New work = the upload/integrate path** (upload a file / paste / link from persona-builder) **+ consent gating** (personas carry personal info; repo principle: member consent for data use). Moderate; builds on existing surfaces. The real net-new feature.

## Surfaces to read (from 2026-06-09 recon)
- **Auth/gating:** `lib/auth.ts`, `app/onboard/page.tsx`, `app/api/auth/[...nextauth]/proxy.ts`, `lib/invitations.ts`, `lib/roster.ts`, `app/admin/invite/page.tsx`
- **Persona/profile:** `app/members/[slug]/page.tsx`, `app/me/edit/page.tsx`, `lib/profile-editor.ts`, `lib/roster.ts:readMemberPersona`, `persona-builder/personas/`
- **RBAC/roster:** `lib/rbac.ts`, `community/governance/`, `community/members/roster.md`

## Open questions for the brainstorm
1. Signup **Path A vs B** (above). If B → write an ADR for open membership first.
2. How attendees receive the invite at the meeting (QR / single link / batch issue).
3. Persona: **upload file vs paste vs link-to-persona-builder**; where it lands (in `/me/edit`?); the consent UX.
4. Is persona **Thursday-scope or fast-follow**? (Signup is the must-have for the meeting.)
5. Version / PR shape — next CP version after **v0.10.0.1** (v0.11?).

## Separate track (this chat)
The originating chat is **parked for pulse live verification** (`projects/pulse/SETUP.md` §10.2/§10.3), pending Anton's one-time Notion activation. Independent of this work.

## Pickup command (paste into the new chat)
> Open this repo and follow the read order: root `STATE.md` → `projects/community-platform/STATE.md` → this handoff (`docs/specs/2026-06-09-community-platform-meeting-signup-persona-handoff.md`). Read directly; don't invoke a resume skill.
>
> Goal — for **Thursday 2026-06-11's meetup**: members can **sign up via GitHub at the meeting** and **upload/integrate their persona** into their profile.
>
> **Start with `superpowers:brainstorming` — do not jump to a spec or code.** Two pieces are already partly built, so scope before building: (1) GitHub signup already works **invite-gated** (`/onboard`, `lib/invitations.ts`) — the Thursday must-have is probably *operational* (getting invites to a room of attendees), not greenfield; *true open self-signup* changes the membership model → ADR-level, not a 2-day rush, so flag it rather than assume it. (2) Persona **display** already exists (`/members/[slug]`); the net-new work is the **upload/integrate** path in `/me/edit` + **consent gating**.
>
> Resolve the 5 open questions in the handoff (esp. signup Path A vs B, and whether persona is Thursday-scope or fast-follow), scope tightly for Thursday, then spec → plan → implement in-framework. Next CP version after v0.10.0.1. (Separate track: the pulse chat is parked for live Notion verification — not part of this work.)
