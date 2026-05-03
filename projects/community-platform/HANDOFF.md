# Community Platform v0.1 — Handoff

**Status:** Spec + plan + minimal pre-launch landed. Implementation pending.
**Branch:** `warsaw-org-and-stack-guide`
**Last commits (newest first):**
- `847a6f8` docs(community-platform): handoff prompt for the next chat
- `a736b38` chore(community): minimal pre-launch (admins.md, community-managers.md, roster `github_handle` stub)
- `6f72f5c` plan(community-platform): v0.1 implementation plan — 74 tasks, 11 phases
- `97ccea2` spec(community-platform): v0.1 design — git-only stack, Lite slice

This document compresses the v0.1 design journey so a future reader can pick up cold without re-reading the 8,000-line spec+plan corpus. Read it once, keep [`spec.md`](spec.md) and [`plan.md`](plan.md) for reference.

---

## 1. Origin (2026-05-01)

The community ran on Telegram for conversation and a docs-first git monorepo for memory. Two failure modes followed.

**1.1 Memory loss + discoverability gap.** Substantive Telegram threads (project updates, who-is-working-on-what, decisions-by-thread) evaporate. The repo captures durable artifacts (ADRs, meeting notes, project specs) but reading them is repo-shaped — `git pull && cd && cat` — not member-shaped. With 19 members across varied focus areas, members don't easily see who is working on what, who has what skill, or what others have shipped. The roster is a list, not a portrait.

**1.2 Why a platform, why now.** Three pressures forced the decision (mirrors the GBrain framing of "what does Telegram lose?"):

1. *Identity is invisible.* Persona-builder produces files; the platform makes them queryable.
2. *Contribution doesn't compound.* Showing up to meetups, shipping projects, and helping peers are all ephemeral in Telegram scrollback. A git-derived counter turns those into durable signal.
3. *Roles need different surfaces.* A guest needs a frictionless preview. A member needs daily utility. A community manager needs moderation tools. An admin needs governance. One bot in one channel can't serve all four cleanly.

**1.3 What this is NOT.** Not a Telegram replacement. Not a public marketing surface. Not a multi-tenant offering. The platform is **complementary** — Telegram remains conversational; the platform becomes structural. Login-required for all read paths in v0.1.

---

## 2. Locked inputs (spec §0)

These were fixed *before* the brainstorm. The brainstorm explored everything around them.

**2.1 Four-role RBAC.**

| Role | Source of role |
|---|---|
| Admin | `community/governance/admins.md` |
| Community manager | `community/governance/community-managers.md` |
| Member | `community/members/roster.md` (`github_handle` field) |
| Guest | Anyone without a roster mapping |

In v0.1 the four roles are wired into `lib/rbac.ts` as identity, but capabilities are member-equivalent for admin/CM. Distinct admin/CM UI capabilities arrive in v0.2+. The four-role model exists in v0.1 to avoid retrofitting auth later.

**2.2 Gamification — in scope, anti-vanity.** Mechanic shape was open at brainstorm time. Lite-slice landing: observation-only contribution counter (commits, ADRs, meetings attended, status posts). No badges, kudos, streaks, leaderboards in v0.1. Anti-pattern explicitly avoided: gamification that incentivizes Telegram noise or rewards Anton-bias. Phasing locked in §10 (observation → badges → kudos → quests).

**2.3 Telegram-complementary + OSS-first.** Telegram identity is the source of truth for membership. Platform is MIT, repo-public (per ADR-0001). All bot writes are public commits attributable to `warsaw-ai-bot`. Member consent posture preserved: roster is opt-in, status updates require consent modal, GDPR mechanisms ship in v0.1.

**2.4 Cross-project relationships.** Persona-builder produces persona files; platform reads them at build time. GBrain coupling deferred to v0.1 (no Q&A panel embedded). Roster is the existing source of truth for membership and the gate.

---

## 3. Decision path

The brainstorm stepped through four progressively-narrowing decisions.

**3.1 B+A: read-everything → C-hybrid.** Original premise was "B" (a richer member-facing read of the repo) plus "A" (a richer write surface). C-hybrid landed: read-everything (members, projects, decisions, meetings, personas) **plus one minimal write surface** for status updates. Multiple write surfaces (project comments, decision votes, peer kudos, RSVPs) were considered and cut.

**3.2 C-hybrid → C-write-everything-to-git.** The crucial architectural decision: **no DB in v0.1**. Status updates commit directly to `community/status/YYYY-WW/<slug>.md` via the bot. JWT sessions instead of DB-backed sessions. The §6.1 classification rule was articulated here as a forward-looking principle: *durable / audit-worthy → git; ephemeral / social / high-frequency → DB.* In v0.1 there's no live boundary to police because everything is git.

**3.3 C-write → Lite slice.** Even with one write surface, the read surface alone could have ballooned. Lite slice locked: **identity + memory spine + ONE write surface**. Identity = auth + roster. Memory spine = members, projects, decisions, meetings, personas (read). One write = `/this-week`. Everything else (kudos, badges, GBrain panel, RSVPs, public/guest view, profile editor, admin/CM-distinct UI) explicitly cut to v0.2+.

**3.4 What survived the cut.**

| Survived in v0.1 | Cut to v0.2+ |
|---|---|
| Auth + roster gate | Profile editor UI |
| Member directory + profiles | Kudos / peer endorsements |
| Persona panel (read) | Badges / streaks / quests / leaderboards |
| Project / decision / meeting readers | GBrain Q&A panel |
| `/this-week` status flow | RSVPs / events surface |
| Git-derived contributions counter | Public / guest read view |
| Membership consent flow | Comments on projects/decisions/status |
| GDPR export + delete | Notifications |
| Health metric `/admin/health` | Search across content |
| Four-role RBAC marker | Admin/CM-distinct UI capabilities |

---

## 4. Architectural choices that matter

**4.1 Git-only storage + the §6.1 classification rule (dormant in v0.1, active in v0.2+).**

> **Rule:** If the data would naturally be an ADR, meeting note, roster change, project spec, persona file, member-authored profile prose, or member-authored status update, it belongs in **git**. If it's a session token, draft, rate-limit counter, ephemeral notification, search index, or high-frequency reaction, it belongs in **DB or KV**.

For v0.1 the rule is dormant — everything is git. The rule is *active as a spec commitment* for v0.2+ when DB-shaped data returns. New data types after v0.1 that don't fit cleanly require an ADR. The five v0.2+ rules in spec §10 are the enforcement teeth — most importantly: *DB is restorable from git snapshots; git is never restorable from DB.*

**4.2 NextAuth v5 JWT sessions (no DB sessions).** GitHub OAuth → NextAuth issues a signed JWT cookie (30-day default, configurable via `NEXTAUTH_SESSION_MAX_AGE`). Middleware checks the GitHub handle in the JWT against the build-time roster snapshot. Non-roster → `/no-access`. First-time roster member → `/consent`. Returning member → `/home`. Admin / CM gates check the handle against `community/governance/admins.md` / `community-managers.md` (build-time read).

JWT trade-off: sessions can't be invalidated server-side. Acceptable at 19 members. v0.2 candidate to switch to DB sessions when DB arrives.

**4.3 GitHub App writer (`warsaw-ai-bot`).** One writer, one scope: `contents: write` on the warsaw-ai-community repo only. No webhooks (no inbound traffic). All writes use SHA-based optimistic locking — read current SHA, write with that SHA, 409 on conflict surfaces "Refresh — someone else updated this." `lib/github-app.ts` wraps Octokit + auth-app; `GitHubAppError` maps statuses to `{kind: 'sha_conflict' | 'not_found' | 'forbidden' | 'unknown'}`.

App private key is a long-lived secret in Vercel env. Rotation cadence: at least annually. PEM is generated by Anton out-of-band and pasted into `GITHUB_APP_PRIVATE_KEY`.

**4.4 Sanitization pipeline + SafeHtml component.** Single rendering path: `lib/markdown.ts` parses with unified + remark-* + rehype-sanitize, returns sanitized HTML, consumed by `<SafeHtml html={...}>`. **No parallel rendering paths. No bypassing rehype-sanitize.** Every place that renders user-shaped markdown (status updates, profile prose, meeting notes) goes through this pipeline.

**4.5 Status-update lifecycle: commit-direct-to-main, no archival job.** Posts commit `community/status/YYYY-WW/<slug>.md` directly to `main` via the bot. No staging branch, no PR. Edits and deletes are commits. Display reads via the GitHub API at runtime with a 60s ISR cache. No archival job — files persist in git indefinitely; "monthly digest" is rendered at read time from `community/status/YYYY-WW/*` files.

ISO week math (`lib/week.ts`) uses `YYYY-Www` per ISO 8601. Boundaries: Monday 00:00 Europe/Warsaw → Sunday 23:59:59 Europe/Warsaw. Tests cover W1 / W53 transitions.

**4.6 Build-time vs runtime read split.** Vercel rebuilds on push to `main` *filtered to specific paths* — `community/members/`, `community/governance/`, `community/meetings/`, `docs/decisions/`, `projects/`, `persona-builder/personas/`. A push to `community/status/` does **not** trigger a rebuild — that path is read at runtime. Build artifact `lib/__generated__/contributions.json` is generated from `git log` at build time and consumed by RSC pages. This split avoids a redeploy-on-every-status-post storm.

---

## 5. Scope cuts (deferred, with reasons)

The most important "no" was *no DB*, which forced cascading cuts.

**5.1 No DB → no kudos, no badges, no streaks, no leaderboards, no search index.** All of those want fast reads on small ephemeral records — git-as-DB would degrade. They land in v0.2+ with the DB introduction.

**5.2 No GBrain coupling.** No Q&A panel embedded in the platform; no archive-quote on profiles. Risk: tight coupling between two early projects creates correlated failure. v0.2 candidate: "Ask GBrain about this project" link on project pages.

**5.3 No public / guest view.** Login-required everywhere. Reason: v0.1 is community-internal; commercial-readiness surfaces (a guest preview) land at v0.3 per spec §10.

**5.4 No profile editor UI.** The consent flow creates a stub `community/members/<slug>.md` (frontmatter only). Members who want to flesh out prose edit the markdown directly via a normal git workflow. v0.2 ships the editor against the same file.

**5.5 No admin / CM-distinct UI capabilities.** RBAC marker only in v0.1. Roles are wired so v0.2+ features can gate without rewriting auth.

**5.6 No notifications, comments, RSVPs, search.** All v0.2+. The Lite slice deliberately ships *without* engagement-loop features so the **health metric** (weekly active posters / total roster) measures the bare-minimum value proposition.

---

## 6. Long-term commitments (spec §10, distilled)

**6.1 Storage trajectory.** Each new feature lands at a specific version with a specific storage decision.

| Feature | When | Where |
|---|---|---|
| Status, profiles, roster, projects, decisions, meetings, personas | v0.1 | git |
| Contributions counter | v0.1 | derived from git log |
| Kudos / reactions / peer endorsements | v0.2 | DB |
| Milestone badges | v0.2 | derived from git + DB |
| Notifications queue | v0.2 | DB or KV |
| Streaks | v0.3 | DB |
| Search index | v0.3 | Postgres FTS or MeiliSearch |
| DB-backed sessions | when scale or invalidation matters | DB |
| Presence / real-time | v0.4 | KV + websockets |
| Quests / directed gamification | v0.4 | DB |
| Public / guest read view | v0.3 (for commercial conversations) | static + edge cache |

**6.2 Five rules for v0.2+.**

1. *Durable / audit-worthy → git. Ephemeral / social / high-frequency → DB.*
2. *Each new feature requires an ADR if classification is non-obvious.*
3. *DB writes may derive from git. Git writes never depend on DB.*
4. *DB is restorable from git snapshots; git is never restorable from DB.*
5. *Before launching commercial features (per ADR-0004), audit DB schema for PII and add a data-handling ADR.*

**6.3 Strategic commitments.**

- **Federation horizon.** §0.5 forbids multi-tenant in v0.1. The constraint locked: no hardcoded "Warsaw" in URLs, schemas, or env-derived runtime values. Configurable via `COMMUNITY_NAME` / `COMMUNITY_SLUG`. Cheap insurance for the v0.5+ multi-tenant horizon.
- **Data portability as a differentiator.** Members can fork the repo and run their own instance. Distinct from Discord / Circle / Mighty Networks. Mentioned in commercial-readiness materials.
- **OSS / commercial separation (ADR-0004).** Platform stays MIT; the hosted multi-tenant offering with billing / SSO / analytics is a separate commercial layer in a separate repo. ADR before commercial work starts.
- **Telegram bridge (v0.2 candidate).** Bot posts daily platform-activity summary to a `#platform` topic; lets members `/status` from Telegram. Closes the loop without forcing migration.
- **Persona feedback loop (v0.3 candidate).** Members regenerate personas from accumulated platform data (status, contributions, projects).
- **Gamification phasing.** v0.1 = observation. v0.2 = milestone badges. v0.3 = peer kudos. v0.4 = directed quests. Phasing avoids §0.2 anti-pattern.
- **Health metric, locked from day one.** Weekly active posters / total roster members. v0.1 launch target 50%+ posting once. v0.2 sustained 60%+ across 4 weeks. v0.3 sustained 70%+. The metric tells us whether the platform is working *before* commercial conversations begin.
- **Governance integration (v0.3+).** Decisions reader is read-only in v0.1. v0.2/v0.3 can add a "propose ADR" or "vote" surface that integrates with the existing governance flow.

---

## 7. Known caveats picked up during plan-writing

These are non-obvious traps. Future readers should expect to hit each one if they don't pre-empt it.

**7.1 Phase 1.1 parser-vs-roster schema discrepancy.** The actual `community/members/roster.md` has 5 columns: `Name | GitHub | Role | Telegram | Focus`. The plan's `lib/roster.ts` parser fixture documented 4 columns: `Name | GitHub | Joined | Notes`. The parser uses cell index 1 for GitHub — with the real schema that's correct, but it will misparse the placeholder `*(TBD)*` rows (cell-filtering removes empties → "Core organizer" becomes the GitHub handle). **Fix in Task 1.1: parse table headers, find the GitHub column by name, skip rows whose name is `*(TBD)*` or whose GitHub cell is empty.** This is captured in `execution-plan.md` under "Plan amendments."

**7.2 Phase 9 `/admin/health` makes 4 GitHub API calls per page load.** Add `export const revalidate = 60;` to that page (matching `/this-week`). One-line fix; should be in execution.

**7.3 NextAuth v5 beta (`5.0.0-beta.25`).** Pinned in plan; if Phase 1 hits weird auth bugs, check Auth.js GitHub issues before deep-debugging. App Router + v5 still has rough edges (callbacks, middleware integration, JWT decode).

**7.4 Test PEM committed at `tests/fixtures/test-app.private-key.pem`.** Will trip security scanners (Snyk, GitGuardian). Acceptable for v0.1 because (a) the key signs JWTs GitHub rejects (no matching App ID), (b) all API calls in tests are intercepted by MSW, (c) the PEM grants no real privileges. If a scanner blocks CI, switch to a per-CI-run generated PEM via `openssl genrsa` in the test setup.

**7.5 Build-time snapshot deploy frequency.** Vercel rebuilds on push to `main` filtered to relevant paths (NOT `community/status/`, which is runtime). At full status cadence (~50 commits/month), that's ~50 deploys/month if status files DID trigger rebuilds — they don't, but the path filter must be set correctly in Vercel project config. Verify the filter once status updates start landing.

**7.6 Git author email → handle mapping is best-effort.** The contributions calculator parses `git log --pretty=format:COMMIT|%H|%ae|%aI` and maps the email's local-part to a GitHub handle. GitHub noreply emails are `<id>+<handle>@users.noreply.github.com` or `<handle>@users.noreply.github.com` — both handled. Members with a private (non-noreply) email and a non-matching local-part will undercount in contributions. Documented as a known limitation in spec §9 risk 8.

**7.7 JWT sessions can't be invalidated server-side.** Logout clears the cookie client-side, but a stolen cookie remains valid until expiry (30 days default). Acceptable at 19 members; v0.2 candidate to switch to DB sessions when DB arrives.

**7.8 README + CHANGELOG drift from current commits.** Until this handoff lands, `README.md` says "Status: Spec approved — pending implementation plan" and "Next step: run writing-plans." Both stale (plan exists at `6f72f5c`, minimal pre-launch at `a736b38`). `CHANGELOG.md`'s `[Unreleased]` Pending list still mentions writing-plans + the three pre-launch tasks. Fix bundled with this handoff commit; downstream chats read CHANGELOG to know where they are.

---

## 8. Where to start (cold-pickup cheat sheet)

**8.1 "I want to understand the v0.1 architecture."**
Read this doc §4 (architectural choices) and spec §6 (Approach). 30 minutes total.

**8.2 "I'm taking the next plan task."**
Read [`execution-plan.md`](execution-plan.md). Find your phase. Find your task. Each task in `plan.md` is self-contained: Files / failing test / run command / minimal implementation / passing-test verification / commit message.

**8.3 "I'm reviewing a v0.2 PR."**
Read this doc §6.2 (the five rules) and spec §10. Most v0.2 reviews come down to: does this respect the §6.1 classification rule? Does it require an ADR? Does it derive DB from git or vice versa?

**8.4 "Production is broken."**
Check `CHANGELOG.md` for the most recent green-build SHA at the closeout of the last shipped phase. `git checkout <sha>`, redeploy. Then triage from there. Do not force-push to main.

**8.5 Repo map (where each thing lives).**

| Thing | Path |
|---|---|
| Spec (architecture reference) | `projects/community-platform/spec.md` |
| Plan (74 tasks) | `projects/community-platform/plan.md` |
| Execution dispatch playbook | `projects/community-platform/execution-plan.md` |
| This handoff | `projects/community-platform/HANDOFF.md` |
| Phase log + verification | `projects/community-platform/CHANGELOG.md` |
| Next.js source | `projects/community-platform/app/` |
| Shared logic | `projects/community-platform/lib/` |
| Build scripts | `projects/community-platform/scripts/` |
| Vitest tests | `projects/community-platform/tests/` |
| Playwright E2E | `projects/community-platform/e2e/` |
| Roster (member source) | `community/members/roster.md` |
| Admin / CM source | `community/governance/{admins,community-managers}.md` |
| Status updates (runtime) | `community/status/YYYY-WW/<slug>.md` |
| Personas | `persona-builder/personas/<slug>/` |

**8.6 How to verify a phase is actually shipped (the locked 5-command sequence).**

```bash
cd projects/community-platform
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build
# Plus pnpm e2e for phases 1, 2, 3, 5, 6, 8
```

Coverage gates per spec §8: 80% overall, 100% on auth middleware, RBAC guards, classification helpers, GitHub App writer wrapper, and week helpers. The CHANGELOG closeout for each phase records the last-green commit SHA so the next chat (or a rollback) has a known anchor point.
