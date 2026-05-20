# ADR-0015: Admin write permissions for events

**Status:** Accepted
**Date:** 2026-05-20
**Deciders:** Anton Safronov (founder)
**Related:**
- [`projects/community-platform/spec.md`](../../projects/community-platform/spec.md) §15 (v0.5.0 — admin event-creation UI)
- [`docs/specs/2026-05-20-community-platform-v0-5-admin-events-new-brainstorm.md`](../specs/2026-05-20-community-platform-v0-5-admin-events-new-brainstorm.md) (chat-31 brainstorm seed; rationale narrative)
- [ADR-0001](./0001-oss-first-licensing.md) (OSS-first; underpins the audit-via-git-history posture)
- [ADR-0012](./0012-community-platform-v0-3-discovery-posture.md) (anonymous discovery surfaces — `/events` reads what this ADR's events are written into)
- Chat-29 `V0_5_BACKLOG.md` entry (deferral that this ADR closes)

## Context

Events — `community/events/YYYY-MM-DD-slug/README.md` folders — are canonical community content. They drive `/events`, `/events/[slug]`, `/api/calendar.ics`, the anonymous landing's "Next event" slot, and (via the v0.3+ `events_going`/`events_interested` fields on member profiles) the RSVP roster + YourWeekPane.

Today, event creation requires a git workflow: clone the repo, create a folder under `community/events/`, write `README.md` with valid frontmatter, commit, push. Vercel rebuilds. Works fine at the desktop with a checkout. **Fails as a mobile path** — chat-29 measured ~5 min of multi-step UX in the GitHub.com web editor to create a single new file in a new folder.

Cadence is rising. Meetup #4 (2026-05-21) is the 4th community event; toward a weekly cadence + ad-hoc additions (guest speakers, news-driven bursts), the per-event mobile-creation tax matters.

The decision space: **who can author events, and through which mechanism?** Three options were considered (chat-31 brainstorm seed §6).

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A. Admin-only direct commit via warsaw-ai-bot** *(chosen)* | Matches every other write surface in the codebase (saveProfile, rsvpEvent, thankStatus, consent — all direct commits). Audit trail = git log + bot identity + Co-Authored-By the admin's GitHub handle. Latency: ~30 sec to land + ≤5 min for ICS subscribers. Admin pool small (~3) → low spam risk. | Single admin can spam events (manipulation-resistance vector). Member-proposed event flow doesn't exist yet — members must go through an admin. |
| B. Admin-only PR-based | "Reviewable" workflow; admin merges own PR. Slightly higher process visibility. | Admin reviewing own PR is theater. PR creation + merge round-trip adds latency without value. Inconsistent with the rest of the codebase's write pattern. Cosmetic process surface adds no real check. |
| C. Member-proposed + admin moderation | Members surface events from Telegram conversations; admin moderates before commit. Aligns with community-ownership ethos. | Requires a moderation queue, spam-detection heuristics, admin-notification surface, governance for rejected proposals, and an own brainstorm — all v1.0+ scope. Premature for v0.5. |

Option B was rejected because direct-commit is already the codebase's write pattern (consistency wins) and the PR layer adds zero net check. Option C was deferred — not rejected — because the design surface is too large to bundle with v0.5.0; it warrants its own brainstorm covering governance, permissions, spam risk, moderation flow, and member-notification UX.

## Decision

**Adopt Option A: admin-only direct commit via the warsaw-ai-bot GitHub App, surfaced through `/admin/events/new`.**

The action layer (`app/actions/create-event.ts`) is the real RBAC boundary (`auth()` + `isAdmin()` re-verified; oracle defense per H69). Commits land on `main` with `warsaw-ai-bot` as author and `Co-Authored-By: @<admin-handle>` trailer. ICS subscribers and the discovery surfaces auto-update within 5 minutes via the existing v0.3 cache TTL + Vercel rebuild.

Member-proposed events are explicitly deferred to a future ADR (own brainstorm); this ADR is the **standing decision** until that future ADR is drafted and adopted.

## Consequences

**Easier:**

- Event creation latency drops from ~5 min (mobile git web editor) to ~30 sec (form submit).
- Mobile event creation becomes viable — admin can create events from Telegram conversations on a phone in real-time.
- Consistent write pattern with profile-edit / RSVP / thank-status / consent — one mental model for all platform writes; one audit trail shape (git log + warsaw-ai-bot identity + Co-Authored-By).
- ICS subscribers see new events within ≤5 min (existing 300 s public-cache TTL on `/api/calendar.ics`) — no separate subscriber-notification surface needed.
- The audit trail satisfies ADR-0001 (OSS-first): every commit is in the public git history, signed by the bot identity, attributed to the admin handle.

**Harder:**

- Single admin can spam events (manipulation-resistance vector). **Mitigations:** (a) admin pool is short (≤3 names) and stored in `community/members/<slug>.md` `admin: true` flag — transparent + auditable; (b) twelve numbered hardenings H69-H80 in spec §15.4 prevent injection-style abuse; (c) git history is the spam-detection surface (large commit volume by one admin is observable post-hoc).
- Member-proposed events require a future ADR + design pass before they can ship. The chat-29 `V0_5_BACKLOG.md` entry is the parking spot.
- No atomic compare-and-create at the GitHub Contents API layer — `readFile` + `writeFile` is racy (spec §15.9 accepts this for v0.5.0 because admin pool ≤3; failure mode is non-destructive — second admin sees `internal_error`, retries, gets clear `slug_exists`).
- Status flip (`scheduled → cancelled` / `completed`) is **not** in v0.5.0 — admins must edit frontmatter via git for status changes. This is intentional (notification-sensitive ICS surface), but it does mean cancellation cannot be done from the form. v0.5.2 candidate per spec §15.0 tier 3.

## Implementation

This ADR is **implementing** via v0.5.0:

- New surface: `app/admin/events/new/page.tsx` — Server Component with `force-dynamic` + `auth()` + `isAdmin()` redirect gate, mirroring `/admin/invite`.
- New action: `app/actions/create-event.ts` — Server Action with RBAC re-verify + Zod input validation + slug derivation + snapshot+GitHub pre-existence guards + GitHub App `writeFile` (new-file semantics, no SHA) + revalidate fan-out.
- New form: `app/components/EventForm.tsx` — client form with native HTML5 date/time inputs + live slug derivation + body preview via existing `/api/preview-markdown` route.
- New pure lib: `lib/event-author.ts` — `composeEventReadme()` + `deriveEventSlug()`.
- Twelve numbered hardenings H69-H80 (spec §15.4) → 1:1 test blocks (`describe("H<n>:")`).
- Pre-existing dependency: `lib/events.ts normalizeEventFrontmatter` must be exported (Phase 0 task in `v0.5.0-plan.md`; 1-character edit).

No changes to authentication, RBAC infrastructure, or the GitHub App integration. The `warsaw-ai-bot` app's existing scopes (repo write) suffice. No new env vars.

### Supersedes / amends

None as a forward decision.

### Change control

This ADR should be revisited when **any** of the following conditions are observed:

- **Admin pool grows to ≥5 names.** Larger admin pools change the manipulation-resistance calculus — spam-detection patterns shift from "audit by inspection" to "needs tooling." Trigger a brainstorm for either (a) member-proposed flow with moderation queue, or (b) admin-action-rate observability.
- **A member explicitly requests the ability to propose events** AND **cadence ≥1 event/week is established**. Both conditions matter: the request signals demand; the cadence signals ROI on the moderation-flow design work.
- **The admin pool spams the calendar with low-quality events** (operational evidence — high event-creation rate paired with low actual attendance). Surface as a CHANGELOG.md observation; a recurring pattern would trigger this ADR's supersede.

The supersede shape (when triggered): a new ADR drafted from a member-proposed-events brainstorm, marking this ADR as `Superseded by ADR-NNNN` and laying out the moderation flow + permissions model.

**Reverting** the ADR (going back to git-only event creation) would require disabling the `/admin/events/new` surface; this is reversible in code but breaks the mobile-creation user contract once that contract has been advertised. Trigger to revert: only if a security incident proves admin-direct-commit untrustworthy in a way that cannot be mitigated with additional hardenings.
