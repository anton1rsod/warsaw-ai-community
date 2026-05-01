# Community Platform

> Member-facing platform with gamification, role-based access (admin / community manager / member / guest), and a structured engagement layer that complements Telegram.

**Status:** Spec + plan + minimal pre-launch landed — Phase 0 implementation pending
**Lead:** Anton Safronov
**Started:** 2026-05-01
**Telegram thread:** TBD (Builds & Pitches)

---

## What

The Warsaw AI Community platform — a member-shaped read of the community's git-resident structure (members, projects, decisions, meetings, personas), plus one minimal write surface ("what I'm working on this week") that drives discoverability without competing with Telegram for conversation.

The platform is **complementary** to Telegram — Telegram remains the conversational surface, the platform becomes the **structural** surface (who you are, what you've shipped, where you stand).

**v0.1 design highlights** (full spec in [`spec.md`](spec.md)):

- Lite slice: identity + memory spine + one write surface.
- Stack: Next.js 15 + Vercel + GitHub OAuth (JWT sessions) + GitHub App `warsaw-ai-bot` for git writes.
- Storage: 100% git for v0.1; classification rule documented for v0.2+ when DB-shaped data returns.
- Four-role RBAC wired in code; admin/CM-distinct UI capabilities deferred to v0.2+.
- Gamification at v0.1 is observation-only: a git-derived contributions counter on each profile. Badges, kudos, streaks, quests are v0.2+.

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

Originally locked **before** the brainstorm; preserved as `spec.md` §0:

- **Four-role access model** above (locked).
- **Gamification is in scope for v0.1.** v0.1 mechanic: observation-only contributions counter. Mechanic phasing detailed in `spec.md` §10.
- **Telegram-complementary, not replacing.** Telegram identity is the source of truth for membership.
- **OSS-first.** MIT-licensed, lives in this repo. (Per [ADR-0001](../../docs/decisions/0001-oss-first-licensing.md).)

## Phases

- **v0.1 (current)** — Lite slice: auth + member directory + profile pages + project / decision / meeting readers + status updates + git-derived contributions counter. See `spec.md` §2.
- **v0.2** — Kudos / peer endorsements / milestone badges / Telegram bridge. First DB introduction (per `spec.md` §10 storage trajectory).
- **v0.3** — Streaks / search / public-guest read view (commercial-readiness surface).
- **v0.4+** — Quests, real-time presence, governance integration.

## Next step

1. ~~Founder reviews [`spec.md`](spec.md).~~ Done 2026-05-01 (commit `97ccea2`).
2. ~~Run `superpowers:writing-plans` to produce [`plan.md`](plan.md).~~ Done 2026-05-01 (commit `6f72f5c`, 74 tasks across 11 phases).
3. ~~Pre-launch tasks (per `spec.md` §9 risk 3).~~ Done minimally 2026-05-01 (commit `a736b38`): admins.md and community-managers.md created, founder added to roster with `@anton1rsod` handle. Task 0.3 (meeting attendees format) deferred to Phase 7 prep.
4. **Begin Phase 0 implementation** per [`execution-plan.md`](execution-plan.md) §11 (Kickoff procedure). First subagent dispatch: Task 0.4 (Next.js 15 init).
5. Implementation follows the stack defined in [`docs/playbooks/ai-collaborator-stack.md`](../../docs/playbooks/ai-collaborator-stack.md).

## Deployments

- **Preview:** https://warsaw-ai-community-platform-anton-9351-anton-9351s-projects.vercel.app (alias) / https://warsaw-ai-community-platform-gam0f92n3-anton-9351s-projects.vercel.app (deployment) — *gated by Vercel Deployment Protection (preview-only); roster-only NextAuth gate added in Phase 1.*
- **Production:** _(set after Phase 10)_

## Links

- Spec: [`spec.md`](spec.md)
- Plan: [`plan.md`](plan.md)
- Handoff (cold-pickup reference): [`HANDOFF.md`](HANDOFF.md)
- Execution playbook: [`execution-plan.md`](execution-plan.md)
- Changelog: [`CHANGELOG.md`](CHANGELOG.md)
- Stack guide: [`docs/playbooks/ai-collaborator-stack.md`](../../docs/playbooks/ai-collaborator-stack.md)
- Sister project (identity feed-in): [`persona-builder/`](../../persona-builder/)
- Sister project (knowledge feed-in): [`projects/gbrain/`](../gbrain/)
- Governance: [`community/governance/governance.md`](../../community/governance/governance.md)

## License

MIT. See [`../../LICENSE`](../../LICENSE).
