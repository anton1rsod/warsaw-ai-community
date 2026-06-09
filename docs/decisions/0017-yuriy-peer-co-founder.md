# ADR-0017 — Yuriy as peer co-founder (W.A.Y. excepted) + founder-class decision boundary

**Status:** Accepted
**Date:** 2026-06-09
**Deciders:** Anton Safronov (founder)
**Drivers:** Repo operating foundation spec (`docs/specs/2026-06-09-repo-operating-foundation-design.md`) §1 L4–L5 — formalize the co-founder relationship and a decision-rights boundary for two peers.

## Context

Yuriy is the community co-founder, but governance (`community/governance/governance.md`) lists only a Founder/BDFL plus 2–4 TBD core organizers — Yuriy has no defined role, and there is no written boundary for which decisions are shared vs founder-reserved. Two peers working without an explicit decision-rights boundary is the most common co-founder failure mode (implicit joint ownership, tiebreak entropy).

## Options considered

1. **Core organizer** — slot Yuriy into an existing core-organizer role. Pros: lightest change. Cons: understates a co-founder; no peer-level ownership.
2. **Peer co-founder, founder retains founder-class tiebreak (CHOSEN)** — Yuriy co-owns direction and all monorepo projects as a peer; the founder retains the final call only on a narrow, written set of "founder-class" decisions. Pros: real shared ownership + a bounded escalation path. Cons: must keep governance/roster in sync; one exception to remember (W.A.Y.).
3. **Full co-BDFL, equal on everything incl. founder-class** — no founder reservation. Pros: maximal symmetry. Cons: removes a clean tiebreaker on legal/IP/mission decisions where one accountable party is safer pre-incorporation.

## Decision

Yuriy is a **peer co-founder** across the Warsaw AI Community monorepo — co-owning direction and projects with the founder. **W.A.Y. (`way-who-are-you`) is excepted**: it is a separate, founder-solo repository, so the exception is enforced at the repo boundary.

A decision is **founder-class** if it affects: legal form, equity/IP, mission scope, or the decision-rights framework itself. Founder-class decisions rest with the founder (Anton); **all other decisions are resolved by the project DRI** (the accountable owner/driver per project, per the DRI model). This maps onto the existing decision-classes table in `governance.md` (license/IP/legal-entity + commercial = founder; routine + program-level = DRI / lazy consensus).

## Consequences

**Easier:**
- Clear shared ownership and a 30-second "who decides this?" answer.
- Two co-founders can drive parallel projects without collision (one DRI per project, claimed in root `STATE.md`).
- A bounded, written escalation path prevents tiebreak entropy.

**Harder:**
- `governance.md` and `members/roster.md` must be kept in sync with this ADR.
- The W.A.Y. exception is a special case to remember.
- Yuriy's roster handles (GitHub/Telegram) are pending and must be filled in.

## Implementation

- `community/governance/governance.md` — add the Co-founder (peer) role under "## Model" + the founder-class boundary sentence.
- `community/members/roster.md` — add Yuriy to the Core organizers table as Co-founder (peer).
- `docs/playbooks/collaboration.md` — codifies the DRI model + tie-break in operational terms.

## Change control

Amend via a superseding ADR. Yuriy's specific role boundaries or the founder-class set can be refined by a future ADR co-signed by both co-founders.

## Supersedes / Superseded by

- Complements ADR-0002 (governance — founder + small core team); does not supersede it.
