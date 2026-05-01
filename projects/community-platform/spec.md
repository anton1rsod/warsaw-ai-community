# Community Platform — Design Spec

**Status:** Stub — pending `superpowers:brainstorming` session
**Date:** 2026-05-01
**Author:** TBD (Anton Safronov, via brainstorm)
**Project:** [`projects/community-platform/`](.)
**Parent program:** [Warsaw AI Community](../../docs/specs/2026-04-24-warsaw-ai-community-program-design.md)

---

## ⚠️ Spec is intentionally empty

The next session opens a fresh chat and runs `superpowers:brainstorming` against the locked inputs in §0 below. **No content should be added to §1–§10 until that brainstorm completes** and the founder accepts the resulting draft.

If you (the AI collaborator) are reading this and the user has *not* explicitly asked for a brainstorm, do not start writing the spec — instead, point them to this file and confirm the brainstorm path.

---

## 0. Locked inputs (founder, pre-brainstorm)

These constraints are **fixed** before the brainstorm. The brainstorm explores everything else around them.

### 0.1 Roles (four-tier access model)

| Role | Who maps to it | Source of role assignment |
|---|---|---|
| **Admin** | Founder + designated core organizers | [governance.md](../../community/governance/governance.md) |
| **Community manager** | Subset of core organizers focused on member ops | Founder appoints |
| **Member** | Opt-in roster members | [`community/members/roster.md`](../../community/members/roster.md) |
| **Guest** | Anyone with a link or pending applicant | Self-serve / invite |

### 0.2 Gamification

- **In scope for v0.1.** Mechanic shape is open (points, badges, streaks, quests, leaderboards, reputation, reactions, etc.).
- **Constraint:** must reinforce the community's actual values (shipping, helping peers, attendance), not vanity metrics.
- **Anti-pattern to avoid:** gamification that incentivizes noise in Telegram or rewards Anton-bias.

### 0.3 Posture

- **OSS-first** (MIT) per [ADR-0001](../../docs/decisions/0001-oss-first-licensing.md).
- **Telegram-complementary** — Telegram remains the conversational surface; the platform handles structure.
- **Member consent** preserved — same opt-in posture as the roster, GBrain, and persona-builder.
- **Commercial trajectory aware** per [ADR-0004](../../docs/decisions/0004-commercial-track-accelerated.md) — design choices should not foreclose a future commercial offering, but commercial features are out of scope for v0.1.

### 0.4 Cross-project relationships

The platform sits at the centre of the community's structural surface. Brainstorm should explicitly address how it relates to:

- [`persona-builder/`](../../persona-builder/) — produces persona files; platform may host them.
- [`projects/gbrain/`](../gbrain/) — produces archive + Q&A; platform may surface or query it.
- [`community/members/roster.md`](../../community/members/roster.md) — current source of truth for membership.

### 0.5 Out of scope for v0.1 (explicit)

- Public marketing / external acquisition (Warsaw-only).
- Replacing Telegram as a chat surface.
- Monetization, paid tiers, or merchant features.
- Real-time mobile app (web-first if any UI is built).
- Cross-community / multi-tenant operation.

---

## 1. Problem

*(Empty — fill in brainstorm.)*

## 2. Goals (what success looks like)

*(Empty — fill in brainstorm.)*

## 3. Non-goals (explicit scope cuts)

*(Some captured in §0.5 above; expand in brainstorm.)*

## 4. Users / stakeholders

*(Roles locked in §0.1; flesh out personas + journeys in brainstorm.)*

## 5. Constraints

*(Some captured in §0.3; expand in brainstorm — technical, time, budget, ethical / consent.)*

## 6. Approach

*(Empty — fill in brainstorm. Architecture, components, data flow.)*

## 7. Data & consent

*(Empty — fill in brainstorm. Especially important given GDPR + community consent posture.)*

## 8. Testing & success criteria

*(Empty — fill in brainstorm.)*

## 9. Risks & open questions

*(Empty — fill in brainstorm.)*

## 10. Decisions log

To be linked once ADRs are written. Likely candidates after brainstorm:

- ADR-XXXX: Community Platform v0.1 architecture decisions.
- ADR-XXXX: Gamification mechanic choice + anti-abuse design.
- ADR-XXXX: Role-based access model + role-assignment authority.
