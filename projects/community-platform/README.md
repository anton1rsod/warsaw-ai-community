# Community Platform

> Member-facing platform with gamification, role-based access (admin / community manager / member / guest), and a structured engagement layer that complements Telegram.

**Status:** Proposed — pending brainstorm
**Lead:** Anton Safronov
**Started:** 2026-05-01
**Telegram thread:** TBD (Builds & Pitches)

---

## Heads-up to AI collaborators

> **Do not write spec content yet.** The spec is intentionally a stub. The next session is a [`superpowers:brainstorming`](https://github.com/) cycle that will fill `spec.md`. Until that happens, this folder only captures the **shape** of the project, not its design.
>
> See [`spec.md`](spec.md) §0 for the inputs already locked by the founder.

---

## What (sketch — to be refined in brainstorm)

A community platform that surfaces what Telegram cannot: structured member profiles, persistent project state, gamified contribution loops, and tiered access for the four operating roles in the community.

The platform is **complementary** to Telegram — Telegram remains the conversational surface, the platform becomes the **structural** surface (who you are, what you've shipped, where you stand).

## Why

Three pressures motivate this project (same flow that gave us GBrain — *what does Telegram lose?*):

1. **Identity is invisible.** Members don't know who knows what. The persona-builder skill produces files; the platform makes them queryable.
2. **Contribution doesn't compound.** Showing up to meetups, shipping projects, and helping peers are all ephemeral in Telegram scrollback. Gamification turns those into a durable signal.
3. **Roles need different surfaces.** A guest needs a frictionless preview. A member needs daily utility. A community manager needs moderation tools. An admin needs governance. One bot in one channel can't serve all four cleanly.

## Who (locked inputs from founder)

Four access roles, locked **before** brainstorm so that role boundaries shape the spec:

| Role | Who | Default access |
|---|---|---|
| **Admin** | Founder + designated core organizers (per [governance.md](../../community/governance/governance.md)) | Full read/write/configure/audit |
| **Community manager** | Subset of core organizers handling member ops | Member management, moderation, gamification tuning, content curation |
| **Member** | Opt-in roster members | Profile, contributions, leaderboard, project participation, peer features |
| **Guest** | Anyone with a link / pending applicant | Read-only preview, opt-in to apply |

## Locked design parameters

These four parameters are **inputs** to the brainstorm, not outputs:

- **Four-role access model** above (locked).
- **Gamification is in scope for v0.1.** Mechanic shape (points / badges / streaks / quests / leaderboards / reputation) is open.
- **Telegram-complementary, not replacing.** Telegram identity is the source of truth for membership.
- **OSS-first.** MIT-licensed, lives in this repo. (Per [ADR-0001](../../docs/decisions/0001-oss-first-licensing.md).)

Everything else — runtime, storage, UI surface, hosting, member journey, gamification mechanic — is open until brainstorm.

## Phases (placeholder — to be sized in brainstorm)

- **v0.1** — Identity + roles + minimal gamification. Foundational.
- **v0.2** — Project / contribution tracking (cross-link to GBrain archive + sub-projects).
- **v0.3+** — TBD.

## Next step

1. Open a fresh chat and run `superpowers:brainstorming` against [`spec.md`](spec.md) §0 inputs.
2. On founder approval of the spec, run `superpowers:writing-plans` to produce [`plan.md`](plan.md).
3. Implementation follows the stack defined in [`docs/playbooks/ai-collaborator-stack.md`](../../docs/playbooks/ai-collaborator-stack.md).

## Links

- Spec: [`spec.md`](spec.md) *(stub — pending brainstorm)*
- Plan: [`plan.md`](plan.md) *(follows spec approval)*
- Changelog: [`CHANGELOG.md`](CHANGELOG.md)
- Stack guide: [`docs/playbooks/ai-collaborator-stack.md`](../../docs/playbooks/ai-collaborator-stack.md)
- Sister project (identity feed-in): [`persona-builder/`](../../persona-builder/)
- Sister project (knowledge feed-in): [`projects/gbrain/`](../gbrain/)
- Governance: [`community/governance/governance.md`](../../community/governance/governance.md)

## License

MIT. See [`../../LICENSE`](../../LICENSE).
