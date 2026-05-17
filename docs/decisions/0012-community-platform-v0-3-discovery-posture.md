# 0012. community-platform v0.3 Discovery+ posture — selected surfaces public

- Status: Accepted
- Date: 2026-05-17
- Supersedes: (partial amendment to ADR-0001 + CONSTRAINTS line 12 "Members-only")

## Context

community-platform v0.1.x + v0.2.x shipped as members-only: every route except `/login`, `/no-access`, `/consent`, `/api/consent/recover`, `/onboard*` is gated by `proxy.ts` (auth → roster → consent). This posture made sense for the v0.1 thesis (gated authoring + private profile editing) and is enforced by CONSTRAINTS line 12.

v0.3.0 (spec §13) adds discovery surfaces — `/home` activity feed, `/events` + `/meetings` indexes, `/events/[slug]` + `/meetings/[slug]` detail pages, `/api/calendar.ics` ICS feed, and PWA `/manifest.json`. Brainstorm chat-17 locked anonymous /home (D1 + H30) on the grounds that *discovery is the v0.3 thesis* — external interest should be able to land on the platform directly.

This ADR amends CONSTRAINTS line 12 to reflect the new posture without weakening member-personal write-side gates.

## Decision

Public-by-default for **discovery surfaces** (read-only listings + RSS-like calendar subscribe):
- `/home` — unified activity feed (D layout)
- `/events`, `/events/[slug]` — events index + detail
- `/meetings`, `/meetings/[slug]` — meetings index + detail
- `/api/calendar.ics` — ICS subscribe feed
- `/manifest.json`, `/icons/*` — PWA install metadata

Auth-gated (members-only) for **personal + write surfaces**:
- `/me/edit`, `/me/*` — profile editing
- `/api/me/export`, `/api/me/delete` — GDPR endpoints (session-derived slug)
- `/admin/*` — admin surfaces (health metric, etc.)
- `/this-week` — status compose box (write surface; D7 mounts HomeFeed strip above the compose, but the compose remains members-only)
- `/members`, `/members/[slug]` — member directory (preserves existing posture)
- `/projects`, `/projects/[slug]`, `/decisions/[slug]` — preserves existing v0.1 posture (member-curated content; not part of v0.3 scope to flip)
- `/consent`, `/onboard*` — same as v0.1.x

## Consequences

### Easier
- External "warsaw-ai-community.vercel.app" link surfacing on Telegram / Twitter / blog posts now lands on `/home` without a sign-in detour. Discovery friction eliminated.
- Calendar subscription works in any ICS-compatible client (Apple Calendar, Google Calendar, Fastmail, Thunderbird) without per-client API keys or auth flows.
- PWA install prompt fires on the public landing surface (`/home`), maximizing install rate.

### Harder
- Status post EXCERPTS surface to anonymous viewers via /home This-Week roll-up. Members posting in `/this-week` should treat the excerpt (first 150 chars) as effectively public. (Status post DETAIL pages remain members-only — `/status/[week]/[slug]` is NOT in this ADR.)
- Per-event RSVPs default to `event_rsvp_visibility: "members_only"` (D12) — the public event page shows count + 5-wide avatar grid of `"public"`-flagged members; hidden members contribute to a `+M members (sign in to see)` badge. Privacy default preserved.
- Member directory (`/members/[slug]`) NOT flipped to public in v0.3. Justification: profile pages contain bio/photo/social links — finer-grained opt-in would be required before flipping. Out of scope.

### Implementation
- `proxy.ts` PUBLIC_PATHS / PUBLIC_PREFIXES amendments (Tasks 2.2, 2.4, 2.5, 2.6, 2.9, 4.1).
- `CONSTRAINTS.md` line 12 updates to reference this ADR.
- E2E scenario covering "anonymous visitor renders /home + /events + /meetings without redirect" (Task 4.2 scenario 1, 13).

### Change-control
- Reversing this ADR (returning to fully members-only) is reversible: remove the new entries from `proxy.ts` PUBLIC_PATHS. No data migration. SHOULD only be reversed if a privacy incident demonstrates that excerpt-leakage matters.
- Extending this ADR to flip `/members` or `/projects` to public requires a new ADR (NOT covered here).
