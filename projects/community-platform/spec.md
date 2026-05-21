# Warsaw AI Community — Platform Design Spec

**Status:** Approved (brainstorm complete, 2026-05-01)
**Date:** 2026-05-01
**Author:** Anton Safronov (founder), via brainstorm with AI collaborator
**Project:** [`projects/community-platform/`](.)
**Parent program:** [Warsaw AI Community](../../docs/specs/2026-04-24-warsaw-ai-community-program-design.md)

The platform shares its name with the parent program. "Warsaw AI Community" refers to the community itself; in this spec, "the platform" refers to this sub-project specifically when disambiguation is needed.

---

## 0. Locked inputs (founder, pre-brainstorm)

These constraints were **fixed** before the brainstorm. The brainstorm explored everything else around them.

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

The platform sits at the centre of the community's structural surface. The brainstorm explicitly addressed how it relates to:

- [`persona-builder/`](../../persona-builder/) — produces persona files; platform reads them.
- [`projects/gbrain/`](../gbrain/) — produces archive + Q&A; **deferred for v0.1** (no coupling).
- [`community/members/roster.md`](../../community/members/roster.md) — current source of truth for membership.

### 0.5 Out of scope for v0.1 (explicit)

- Public marketing / external acquisition (Warsaw-only).
- Replacing Telegram as a chat surface.
- Monetization, paid tiers, or merchant features.
- Real-time mobile app (web-first if any UI is built).
- Cross-community / multi-tenant operation.

---

## 1. Problem

Warsaw AI Community runs on Telegram for conversation and a docs-first git monorepo for memory. Two failure modes follow:

1. **Memory loss.** Substantive Telegram threads (project updates, who-is-working-on-what, decisions-by-thread) evaporate. The repo captures durable artifacts (ADRs, meeting notes, project specs) but reading them is repo-shaped — `git pull && cd && cat` — not member-shaped.
2. **Discoverability gap.** With 19 members across varied focus areas, members don't easily see who is working on what, who has what skill, or what others have shipped. The roster is a list, not a portrait.

The community's structural surface (members, projects, decisions, meetings, personas) lives in git but is unnavigable to anyone not at the command line. Members need a member-shaped read of their own community, plus one minimal write surface ("what I'm working on this week") that drives discoverability without competing with Telegram for conversation.

---

## 2. Goals (what success looks like for v0.1)

1. Every roster member can sign in with GitHub and see their own profile, the member directory, and the project / decision / meeting archives within 30 seconds of first login.
2. Each member's profile shows a git-derived contribution count (commits to project folders, ADRs filed, meetings attended) — accurate to within ±1 commit, validated against `git log`.
3. A "this week" page lets any member post a status update ("what I'm working on") and see everyone else's. Posts commit directly to git via the platform's bot account.
4. Profile pages render the member's persona file from `persona-builder/personas/<slug>/` if it exists, link to the persona-builder process if it doesn't.
5. Project pages render from `projects/<name>/` (README + spec + plan + CHANGELOG) without manual sync.
6. Decisions and meeting notes pages render from `docs/decisions/` and `community/meetings/weekly/` without manual sync.
7. 80%+ test coverage with E2E covering: login → post status → see status in feed → contributions counter renders correctly → non-roster user gets denied.
8. Health metric instrumented from day one: **weekly active posters / total roster members**. Baseline ~0; v0.1 launch target 50%+ posting once.

---

## 3. Non-goals (explicit scope cuts for v0.1)

Inherited from §0.5:
- Public marketing / external acquisition surface
- Replacing Telegram as a chat surface
- Monetization / paid tiers
- Mobile app
- Cross-community / multi-tenant operation

Added by Lite slice:
- Kudos, peer endorsements, reputation
- Badges, quests, streaks, leaderboards
- GBrain Q&A panel embedded in the platform (no link, no embed in v0.1)
- RSVPs / events surface
- Public / guest read view (login-required for everything)
- Comments on projects / decisions / status updates
- Notifications (in-platform or email)
- Search across content (URL navigation only in v0.1)
- Onboarding flow for non-roster GitHub users (only roster members can log in)
- Editing personas through the platform (read-only render)
- Full profile editor UI (consent flow creates a stub `community/members/<slug>.md`; members who want to flesh it out edit the markdown directly via a normal git workflow until the v0.2 editor ships)
- Admin / CM-distinct UI capabilities (the four-role model is wired in RBAC but most differentiated capabilities arrive in v0.2+)

---

## 4. Users / stakeholders

| Role | v0.1 capabilities | Source of role |
|---|---|---|
| **Admin** | Member capabilities. RBAC marker only in v0.1 (no admin-only UI surface yet); admin-distinct features arrive in v0.2+. Operational access (Vercel env, GitHub App config) is out-of-band, not a platform capability. | `community/governance/admins.md`, sourced from governance.md |
| **Community manager** | Member capabilities. RBAC marker only in v0.1; CM-distinct features (member-ops UI, roster editor) arrive in v0.2+. | `community/governance/community-managers.md` |
| **Member** | Read everything; post / edit / delete own status updates; view own contribution counter; trigger GDPR export / delete on self. | Mapped via `roster.md` `github_handle` field |
| **Guest** | Logged-out OR logged-in non-roster GitHub user. Sees `/login` or `/no-access` only. Non-roster login shows "Reach out in Telegram to join the roster." No site access. | Default if no roster mapping |

Notes on v0.1 role surface:
- **Profile editing** is *not* a member capability in v0.1 (see §3 non-goals and §6.11). The consent flow creates a stub; full editor arrives in v0.2.
- **Persona file ownership:** a member's persona is owned by them; admin / CM cannot edit member persona files in v0.1.
- **Why surface roles at all in v0.1?** RBAC code (`lib/rbac.ts`) recognizes the four roles so v0.2+ features can gate on role without rewriting auth. The four-role model from §0.1 is implemented as identity, even where capabilities aren't yet differentiated.

---

## 5. Constraints

- **Stack:** Next.js 15 App Router, Vercel, NextAuth/Auth.js v5 with GitHub OAuth, JWT sessions (no DB-backed sessions in v0.1), GitHub App `warsaw-ai-bot` for git writes. TypeScript strict mode. ESM. pnpm.
- **Storage:** 100% git for v0.1. No Postgres, no KV. The §6.1 classification rule is documented as a forward-looking principle; it activates when v0.2+ introduces DB-shaped data.
- **Deployment:** Separate Vercel project from GBrain. Vercel-assigned domain for v0.1 (e.g., `warsaw-ai-community-platform.vercel.app`). Custom domain deferred to a later ADR.
- **OSS:** MIT license, repo-public. All bot writes are public commits attributable to `warsaw-ai-bot`.
- **Consent:** Roster opt-in is the gate. Membership consent flow on first login (see §6.11). No data ingestion without an opt-in roster entry.
- **GDPR:** Members can request data export and delete; mechanisms detailed in §6.13.
- **Time / budget:** Solo founder build; 2–3 week target for Lite v0.1.
- **No "Warsaw" hardcoding.** Per §10 forward-looking commitment, no hardcoded community name in URLs, schemas, or env-derived runtime values. Configurable via env. Cheap insurance against the v0.5+ multi-tenant horizon.

---

## 6. Approach

### 6.1 Storage classification rule (the architectural backbone)

> **Rule:** If the data would naturally be an ADR, meeting note, roster change, project spec, persona file, member-authored profile prose, or member-authored status update, it belongs in **git**. If it's a session token, draft, rate-limit counter, ephemeral notification, search index, or high-frequency reaction, it belongs in **DB or KV**.

For v0.1: **all data is git**. JWT sessions are stateless (signed cookies, no server-side store). Rate limits are skipped at v0.1's 19-member scale; if abuse appears, mitigation is route-level middleware backed by Vercel KV (small footprint, no schema migration).

The rule is dormant in v0.1 (no live boundary to police) but **active as a spec commitment** for v0.2+ when DB-shaped data returns. New data types after v0.1 require an ADR if their classification is non-obvious.

| Data | Lives in | Path |
|---|---|---|
| Roster | Git | `community/members/roster.md` (existing) |
| Member profile prose | Git | `community/members/<slug>.md` (new, opt-in. v0.1: bot creates the consent stub; members edit via direct git. v0.2: profile editor in UI.) |
| Personas | Git | `persona-builder/personas/<slug>/` (existing) |
| Projects | Git | `projects/<name>/` (existing) |
| ADRs | Git | `docs/decisions/NNNN-*.md` (existing) |
| Meeting notes | Git | `community/meetings/weekly/YYYY-MM-DD.md` (existing) |
| Status updates | Git | `community/status/YYYY-WW/<slug>.md` (new, one file per member per ISO week, bot-written) |
| Admin / CM lists | Git | `community/governance/admins.md`, `community/governance/community-managers.md` (new) |
| GitHub OAuth sessions | Stateless JWT (signed cookie) | N/A — no server-side session store in v0.1 |

### 6.2 Architecture

```
┌─────────────────────────────────────────────────────┐
│  Vercel (Next.js 15 App Router)                     │
│  ─────────────────────────────                      │
│  • Server Components for read pages                 │
│  • Server Actions for status post / edit / delete   │
│  • NextAuth/Auth.js v5 (JWT sessions, GitHub OAuth) │
│  • Middleware: roster gate (non-roster → /no-access)│
└──────────┬──────────────────────────────┬───────────┘
           │                              │
   build-time read                  runtime read + write
   (members, projects,              (status updates)
    decisions, meetings,                    │
    personas, governance)                   │
           │                                │
           ▼                                ▼
┌──────────────────────────────────────────────────┐
│  GitHub repo: warsaw-ai-community                │
│  ─────────────────────────────                   │
│  • community/members/                            │
│  • community/status/YYYY-WW/<slug>.md            │
│  • community/governance/                         │
│  • community/meetings/weekly/                    │
│  • docs/decisions/                               │
│  • projects/<name>/                              │
│  • persona-builder/personas/<slug>/              │
└──────────────────────────────────────────────────┘
                     ▲
                     │
            writes via GitHub App
            "warsaw-ai-bot"
            (contents: write on this repo only)
```

Two boxes, one writer. No DB.

### 6.3 Build-time vs runtime reads

- **Build-time read** for slow-changing content: members, projects, decisions, meeting notes, personas, governance lists. Vercel rebuilds on push to `main` via deploy hook, **filtered to these specific paths** (a push to `community/status/` does NOT trigger a rebuild — that path is read at runtime).
- **Runtime read via GitHub API** for status updates (`community/status/`). 60-second HTTP cache; status appears in the feed within 60s of a post. Avoids the redeploy-on-every-post storm that pure build-time reads would cause.
- **Build artifact:** `lib/contributions.json` generated at build time from `git log`, consumed by RSC pages.

### 6.4 Auth flow

1. Visitor lands on `/` → if no session, redirect to `/login` → GitHub OAuth button.
2. GitHub OAuth callback → NextAuth issues a signed JWT cookie (30-day expiry, configurable via `NEXTAUTH_SESSION_MAX_AGE`).
3. Middleware checks the GitHub handle in the JWT against the build-time roster snapshot:
   - Roster member → first-time? show consent modal (§6.11). Returning? `/home`.
   - Non-roster → `/no-access` with Telegram instructions.
4. Admin / CM gates check the handle against `community/governance/admins.md` and `community/governance/community-managers.md` (build-time read).

### 6.5 Status update lifecycle (git-native)

1. **Post.** Member visits `/this-week`, sees a textarea (one per ISO week per member, edit-in-place after first post). Server Action calls the GitHub App, which commits `community/status/YYYY-WW/<slug>.md` to `main` directly. Optimistic UI shows "Posted" immediately; commit completes in 1–3s.
2. **Display.** `/this-week` page lists current-week status files via the GitHub API (60s cache), ordered by **most recent commit time** for each file (descending). Commit time is derived from the GitHub API `commits` endpoint per path, not from filesystem mtime.
3. **Edit.** Server Action fetches current SHA, writes new content with that SHA. If SHA mismatch (someone else edited concurrently), UI shows "Refresh — someone else updated this."
4. **Delete.** Bot commits removal of the file. UI shows "Deleted."
5. **Archive.** No archival job. Status files persist in git indefinitely; a derived "monthly digest" is rendered at read time from `community/status/YYYY-WW/*` files.
6. **Retention.** Permanent (it's git). GDPR delete (§6.13) removes the file across all weeks the member posted in.

ISO week math uses `YYYY-WW` per ISO 8601. `lib/week.ts` provides `currentWeek(): string` and `weekFromDate(d: Date): string`. Boundaries: Monday 00:00 Europe/Warsaw → Sunday 23:59:59 Europe/Warsaw. Tests cover week 1 / week 53 transitions.

### 6.6 Contribution counter

- **Source:** `git log` on the warsaw-ai-community repo, parsed at build time.
- **Per-member counts:**
  - Commits authored by `<github_handle>` (matched via roster `github_handle` field), excluding bot commits.
  - ADRs authored (commits adding files matching `docs/decisions/NNNN-*.md`).
  - Meeting notes participation. Each meeting note must contain an `## Attendees` H2 section followed by a markdown bullet list of attendee names (one per line, e.g., `- Anton Safronov`). The parser matches each bullet against the roster's `name` field. Notes that don't follow this format produce a warning at build time and don't contribute to anyone's count (members aren't penalized for organizers' formatting drift). The format is documented in `community/meetings/weekly/_template.md`.
  - Status updates posted (count of `community/status/*/<slug>.md` files; build-time + runtime adjustment for current week).
- **Display:** A small card on each member's profile. No leaderboard in v0.1.
- **Implementation:** `scripts/build-contributions.ts` runs at build time, writes `lib/contributions.json`, consumed by RSC pages. Status update count layered in at request time from runtime read.

### 6.7 Persona panel

- Profile page reads `persona-builder/personas/<slug>/` at build time.
- If files exist: render summary (first markdown file's content up to the first H2) with a "View full persona" link.
- If absent: "No persona yet — see persona-builder process."
- Editing personas is out of scope for v0.1; they're owned by `persona-builder/`.
- Orphan personas (persona file exists but no roster entry) are not exposed by the platform.

### 6.8 GBrain integration

Deferred per Lite. v0.1 ships with no GBrain coupling. v0.2 candidate: "Ask GBrain about this project" link on project pages.

### 6.9 Repository layout

```
projects/community-platform/
├── README.md
├── spec.md                      ← this file
├── plan.md                      ← writing-plans skill writes this next
├── CHANGELOG.md
├── app/                         ← Next.js source
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   ├── no-access/
│   ├── home/
│   ├── members/
│   │   └── [slug]/
│   ├── projects/
│   │   └── [slug]/
│   ├── decisions/
│   ├── meetings/
│   ├── this-week/
│   └── api/
│       └── auth/[...nextauth]/
├── lib/                         ← shared logic
│   ├── github-app.ts            ← bot writer wrapper
│   ├── markdown.ts              ← content parsing
│   ├── rbac.ts                  ← role guards
│   ├── week.ts                  ← ISO week helpers
│   ├── classification.ts        ← §6.1 rule (lib-level for future)
│   └── contributions.ts         ← counter logic
├── scripts/
│   ├── build-contributions.ts   ← build-time git log → JSON
│   └── snapshot-content.ts      ← build-time content read
├── tests/                       ← unit + integration (Vitest)
├── e2e/                         ← Playwright
├── package.json                 ← own pnpm workspace
└── vercel.json                  ← build config
```

### 6.10 Admin / community-manager source

Admin and CM lists live in git, not env vars:

- `community/governance/admins.md` — markdown table with `name | github_handle | appointed_date | notes`.
- `community/governance/community-managers.md` — same shape.

Build-time read produces `lib/governance-snapshot.json` consumed by RBAC guards.

Rationale: governance lists are governance artifacts — auditable, ADR-able, reviewable via PR. Env vars are not.

### 6.11 Membership consent flow (first login)

On a roster-mapped GitHub user's first login (no `community/members/<slug>.md` exists yet), the platform shows a consent modal:

> By continuing, you opt into the Warsaw AI Community platform.
>
> - Your status updates will be committed to a public MIT-licensed repository.
> - You can edit or delete them at any time.
> - You can request full data export or deletion at any time (§6.13).
>
> [Accept and continue] [Cancel — go back]

Acceptance creates `community/members/<slug>.md` with a minimal stub (frontmatter: `name`, `github_handle`, `consented_at`; body: empty) committed by the bot, and redirects to `/home`. Cancel returns to `/login`.

Returning members (file already exists) skip the modal.

**The stub is the file's existence**, not its contents. v0.1 does not ship a profile editor (see §3 non-goals); members who want to flesh out their profile prose can do so by editing the markdown directly in the repo via a normal git workflow. The v0.2 profile editor will read and write this same file.

### 6.12 Concurrent writes

GitHub API SHA-based optimistic locking. All writes:

1. Read the file's current SHA via GitHub API.
2. Write with that SHA via the GitHub App.
3. If the API returns 409 (SHA mismatch): UI shows "Someone else updated this — refresh to see latest."

For the v0.1 19-member scale, conflict probability is near-zero. The pattern is documented for the larger scale a later release will see.

### 6.13 GDPR mechanisms

| Right | Mechanism | Latency |
|---|---|---|
| **Access** | `/api/me/export` returns JSON containing roster entry, profile prose, all status updates, persona link, and contribution counts | Synchronous |
| **Erasure (member-owned data)** | Delete button on profile → server action → bot commits removal of `community/members/<slug>.md` and all `community/status/*/<slug>.md` files directly to `main`. No PR; deletion is the member's right. | 1–3s per file commit |
| **Erasure (roster entry)** | Roster removal triggers a separate **PR** for admin merge (governance change requires admin oversight). Statutory 30-day window covered. | Up to 30 days; admin notified |
| **Erasure (digest mentions)** | The status files are themselves the digest — removing them removes the mentions. Meeting notes mentioning the member by name remain (governance artifact); members are notified that historic meeting attendance is non-erasable. | Documented in consent modal |
| **Public commits** | Cannot be rewritten. Documented as a known and accepted limitation in the consent modal. Member can rename author by changing GitHub handle (their right). | N/A |

---

## 7. Data & consent

| Data | Source | Consent gate | Retention | Export | Delete |
|---|---|---|---|---|---|
| Roster entry | `roster.md` | Opt-in PR | Permanent (git) | Member fork | Member-initiated PR; admin merges |
| Profile prose (`members/<slug>.md`) | v0.1: bot stub on consent; member edit via direct git. v0.2: member edit via UI. | Created on first login consent (§6.11) | Permanent (git) | Always (markdown file) | UI delete → bot commits removal |
| Persona file | Persona-builder process | Already consented at persona creation | Permanent (git) | Always | Out of scope (handled by persona-builder) |
| GitHub OAuth identity | Sign-in flow | OAuth consent dialog | JWT 30 days; no server store | Self via GitHub | Logout + admin removes from roster |
| Status updates | Member-authored | Consent modal §6.11 | Permanent (git) | UI export | UI delete → bot commits removal across all weeks |
| Contribution counts | Public git history | Already public | Permanent | Public via `git log` | Cannot rewrite history; member can rename git author by changing GitHub handle |
| Admin / CM membership | Governance files (git) | Founder appointment → ADR | Permanent (git) | Always | PR removing entry |

---

## 8. Testing & success criteria

### Coverage targets (per global rules)

- 80%+ overall (lines + branches)
- 100% on auth middleware, RBAC guards, classification helpers, GitHub App writer wrapper, week-math helpers

### Test layers

- **Unit (Vitest):** markdown parsers, contributions counter, RBAC guards, week-math, classification helpers, GitHub App wrapper (mocked).
- **Integration (Vitest + MSW):** auth flow with GitHub OAuth (mocked), GitHub App writer with a fixture repo (`tests/fixtures/repo/`), runtime status read via GitHub API (mocked). No Testcontainers (no DB).
- **E2E (Playwright):**
  1. Roster member logs in → consent modal → `/home` lands.
  2. Posts a status update → sees it in `/this-week` feed within 60s.
  3. Edits the status → reflected.
  4. Deletes the status → removed.
  5. Visits own profile → contribution counter renders, persona panel renders or shows fallback.
  6. Visits a project page → reads the project's spec.md content.
  7. Non-roster GitHub user logs in → `/no-access` with Telegram instructions.
  8. Concurrent edit conflict → second writer sees "refresh" message.

### Acceptance criteria (verifiable)

1. All 19 current roster members have a `github_handle` field; all can log in (validated via pre-launch PR; see §9 risk 3).
2. Status update flow works end-to-end including delete and concurrent-edit edge cases.
3. Contribution counter matches `git log` for at least 5 members (validated by hand against the build-time JSON).
4. Persona panel renders for the 4 personas already in `persona-builder/personas/`.
5. Lighthouse score ≥ 90 on `/home`, `/members`, `/this-week`.
6. No PII in error logs (validated via log review).
7. Health metric (weekly active posters / total roster members) instrumented and viewable by admins.

---

## 9. Risks & open questions

### Risks

1. **NextAuth/Auth.js v5 + App Router edge cases.** Mitigation: keep auth surface minimal; pin to a stable v5 release; rely on JWT sessions to avoid the most fragile DB-session paths.
2. **GitHub App permission scope creep.** Mitigation: app has `contents: write` only on the warsaw-ai-community repo, no org-level scopes. Documented in an ADR; reviewed before any v0.2 work.
3. **Roster ↔ GitHub handle bootstrap gap.** Most existing roster entries probably lack `github_handle`. **Mitigation: pre-launch PR adds `github_handle` to every roster entry as a hard prerequisite for v0.1 launch.** Members without handles cannot log in until added; the spec treats this as a launch-blocking task.
   - **Companion launch-blocking task:** create `community/governance/admins.md` and `community/governance/community-managers.md` (§6.10). Empty CM list is acceptable for v0.1 launch; admin list must contain at least the founder.
   - **Companion launch-blocking task:** add an `## Attendees` section format to `community/meetings/weekly/_template.md` and retrofit existing meeting notes that diverge (or accept that historic meetings don't contribute to attendance counts).
4. **Bot commit volume on `main`.** ~50 commits/month from `warsaw-ai-bot` (status updates + occasional profile edits). Reads as community heartbeat OR noise depending on viewer. v0.2 escape hatch: separate `community/bot` branch merged to main weekly via squash if it bothers anyone.
5. **GitHub API rate limits.** GitHub App tokens get 5000 req/hr. Worst case at 19 members × 1 status post + 5 reads per minute is well below. v0.2 adds caching headers on read paths if needed.
6. **Status update PII drift.** Members may post things they regret. Mitigation: explicit consent at first post (§6.11) and the ability to delete at any time (§6.13). v0.2 may add a 24-hour grace window via a `pending` branch if PII drift becomes a real incident.
7. **Erosion of classification rule.** When v0.2 introduces DB, the temptation is to migrate git-side data to DB for ergonomics. Mitigation: §6.1 cited in PR template; new data types require ADR if classification is non-obvious; rule 4 in §10 is hard ("DB is restorable from git snapshots; git is never restorable from DB").
8. **Contribution counter undercounts non-git work.** Known and accepted for v0.1. Frames gamification as observation, not incentive. v0.2 may add DB-side signals (kudos, peer recognition) that complement the git-derived counter.
9. **Build-time read of governance and roster files = stale lists until next deploy.** New roster entries, new admins, or new CMs activate only after the next deploy completes. Mitigation: pushes to `community/governance/*` and `community/members/roster.md` trigger a deploy; expected lag < 2 minutes. Acceptable for v0.1 cadence.
10. **GitHub App key rotation.** App private key is a long-lived secret in Vercel env. Mitigation: documented rotation procedure in `projects/community-platform/README.md` (planned in writing-plans output); rotation cadence at least annually.

### Open questions deferred to writing-plans / implementation

- Exact NextAuth/Auth.js v5 patterns for App Router (latest examples in their docs).
- GitHub App setup steps and Vercel env wiring (mechanical, not architectural).
- E2E test runner config and CI integration.
- Specific error-page copy and tone.
- Lighthouse-compliant font / asset strategy.

---

## 10. Decisions log + long-term commitments

### ADR candidates that follow from this spec

- **ADR-XXXX:** Warsaw AI Community platform v0.1 architecture — git-only storage, JWT sessions, GitHub App writer (this spec, distilled).
- **ADR-XXXX:** Storage classification rule — the §6.1 boundary, dormant in v0.1, active when v0.2 introduces DB.
- **ADR-XXXX:** GitHub App `warsaw-ai-bot` — permission scope, key rotation, and write surface.
- **ADR-XXXX:** Member profile file convention — `community/members/<slug>.md` opt-in pattern.
- **ADR-XXXX:** Admin / community-manager source files — moving role lists from env to git.

### Long-term commitments (forward-looking, applied in v0.2+)

These are spec-level commitments documented in v0.1 but applied later. Citing them in v0.2+ reviews is the mechanism that keeps the program coherent over time.

#### Storage trajectory (v0.2+)

| Feature | When | Where it lives |
|---|---|---|
| Status updates, member profiles, roster, projects, decisions, meetings, personas | v0.1 | git |
| Contributions counter | v0.1 | derived from git log |
| Kudos / reactions / peer endorsements | v0.2 | DB |
| Milestone badges | v0.2 | derived from git + DB |
| Notifications queue | v0.2 | DB or KV |
| Streaks | v0.3 | DB |
| Search index | v0.3 | Postgres FTS or MeiliSearch |
| DB-backed sessions (replace JWT) | when scale or invalidation matters | DB |
| Presence / real-time | v0.4 | KV + websockets |
| Quests / directed gamification | v0.4 | DB |
| Public / guest read view | v0.3 (when commercial conversations need it) | static + edge cache |

#### Five rules for v0.2+ (spec-level commitments)

1. **Durable / audit-worthy → git. Ephemeral / social / high-frequency → DB.** §6.1 classification rule activates as a live policy when DB returns.
2. **Each new feature requires an ADR if classification is non-obvious.** Spec citation in PR template.
3. **DB writes may derive from git** (e.g., recompute streaks from git history at boot). **Git writes never depend on DB.** Preserves git as the source of truth and keeps the program restorable if the DB dies.
4. **DB is restorable from git snapshots; git is never restorable from DB.** Hard rule. No DB schema may be the *only* place a piece of community memory exists.
5. **Before launching commercial features (per ADR-0004), audit DB schema for PII and add an explicit data-handling ADR.** Commercial layer doesn't compromise consent posture.

#### Strategic commitments (longer horizon)

- **Federation horizon.** §0.5 forbids multi-tenant in v0.1. The constraint locked now (in §5): no hardcoded "Warsaw" in URLs, schemas, or env-derived runtime values. Configurable via env. Cheap insurance for the v0.5+ multi-tenant horizon.
- **Data portability as a differentiator.** Because content lives in git, members can fork the repo and run their own instance. This is a deliberate product property, distinct from Discord / Circle / Mighty Networks. Mentioned in the program-level README and a future commercial-readiness surface.
- **OSS / commercial separation (per ADR-0004).** When commercialization arrives, the *platform* (this Next.js app) stays MIT and forkable; the *hosted multi-tenant offering* with billing / SSO / analytics is a separate commercial layer in a separate repo. ADR before commercial work starts. Keeps ADR-0001 (OSS-first) and ADR-0004 (commercial track) non-conflicting.
- **Telegram bridge (v0.2 candidate).** A bot that posts daily platform-activity summary to a `#platform` topic and lets members `/status` from Telegram. Closes the loop without forcing migration. Telegram-complementary per §0.3.
- **Persona feedback loop (v0.3 candidate).** Members regenerate personas from accumulated platform data (status, contributions, project pages). Ties persona-builder + gbrain + community-platform into a coherent identity layer.
- **Gamification phasing (anti-vanity).** v0.1 = observation (counter). v0.2 = milestone badges (light incentive). v0.3 = peer kudos (social incentive). v0.4 = directed quests aligned to community goals. Phasing avoids the §0.2 anti-pattern (vanity metrics, Anton-bias, Telegram noise).
- **Health metric, locked from day one.** Weekly active posters / total roster members. Baseline ~0. v0.1 launch target 50%+. v0.2 sustained 60%+ across 4 weeks. v0.3 sustained 70%+. The metric tells us whether the platform is working before commercial conversations begin.
- **Governance integration (v0.3+).** Decisions reader is read-only in v0.1. v0.2 / v0.3 can add a "propose ADR" or "vote" surface that integrates with the existing governance flow.

## 11. v0.1.1 — Invitation registration

> **Scope:** v0.1.x point release. 100% git (per §5 + CONSTRAINTS line 10), no DB, no new infrastructure.
> **Brainstormed:** 2026-05-03 via `superpowers:brainstorming` (chat 7).
> **Replaces:** the manual roster-backfill workflow (Telegram-then-PR cycle, v0.1.0). 17 outstanding members are unblocked by this feature.
> **Locked decisions:** Q1-Q7 from `chat-7-brief.md`, applied below.

### 11.1 Architecture

Stateless 4-stage flow. No DB; the token IS the state. Trust = HMAC signature + JTI ledger lookup.

```
1. MINT                2. DELIVER         3. ARRIVE                  4. COMPLETE
────────────────────   ──────────────     ──────────────────────     ─────────────────────
Admin opens            Admin copies       Invitee opens link →       Invitee submits form →
/admin/invite →        URL into a         GitHub OAuth (cookie-      server action verifies
fills handle/hint →    Telegram DM        scoped Path=/onboard) →    token, runs warsaw-ai-bot
server action          to invitee         /onboard renders           commit (4 files atomic)
HMAC-signs payload                        prefilled form             → revalidate + redirect
→ returns URL                                                        to /this-week
```

Three architectural pillars:

1. **Stateless tokens.** `INVITE_SECRET`-keyed HMAC over `{jti, exp, iss, hint_telegram?, hint_display_name?}`. Verification = signature valid + `exp > now()` + `jti` not in ledger + redeemer-GH-handle not in roster.
2. **`warsaw-ai-bot` is the only privileged writer.** Reuses `lib/github-app.ts`. New helper `commitMultipleFiles({owner, repo, branch, files, message, expectedHeadSha})` — v0.1 only commits single files; this is REQUIRED net-new functionality.
3. **Admin gate at issuance, member gate at redemption.** `/admin/invite` admin-RBAC at page level (matches `/admin/health` pattern). `/onboard` is in `proxy.ts` PUBLIC_PATHS (auth-optional); server-side checks gate before any write.

**Alternatives considered + rejected** (decision references):
- DB-backed token state (Q1 → v0.2)
- Telegram bot for issuance (Q2 → manual copy-paste)
- Roster.md as implicit ledger (Q3 → dedicated ledger for audit trail)
- Token reuse for self-update (Q6 → no retroactive coverage)
- PR-based commit (Q7 → atomic direct commit)

### 11.2 Token format and lifecycle

#### Format

```
<base64url(canonicalJson(payload))>.<base64url(hmacSha256(thatBase64UrlString, INVITE_SECRET))>
```

- **base64url** = RFC 4648 §5, no padding.
- **HMAC algorithm** = HMAC-SHA-256 (RFC 2104) via Node `crypto.createHmac("sha256", …)`.
- **Signature scope** = HMAC computed over the base64url-no-padding STRING of the payload (NOT raw JSON bytes). Avoids padding-canonicalization ambiguity; matches JWS conventions while not being a JWT.

**Format intentionally resembles JWT but is NOT a JWT** — no header, no `alg` field, no library negotiation. Custom HMAC envelope (~30 lines in `lib/invitations.ts`) closes the `alg=none` / library-confusion attack class.

#### Payload schema (Zod-validated on sign + verify)

```typescript
const InvitePayloadSchema = z.object({
  jti:               z.string().uuid(),                          // RFC 4122 v4, lowercase
  iss:               z.string().regex(/^[a-zA-Z0-9-]{1,39}$/),    // GH handle of issuer
  exp:               z.number().int().positive(),                 // UNIX seconds
  hint_telegram:     z.string().regex(/^@[a-zA-Z0-9_]{5,32}$/).optional(),
  hint_display_name: z.string().min(1).max(80).optional(),
});
```

Canonical JSON serialization shared between sign + verify (single `canonicalJson(p)` function); fixed key order; only present keys included; no whitespace.

#### Sign + verify (constant-time)

`mintToken(payload, secret)` runs Zod validation → canonical JSON → HMAC → format. `verifyToken(token, secret)` runs split → HMAC compute → `crypto.timingSafeEqual` (constant-time; length-mismatch short-circuits — length isn't secret) → JSON parse → Zod safeParse → `exp` check.

#### Lifecycle states

```
MINTED → DELIVERED → ARRIVED → AUTHENTICATED → SUBMITTED → REDEEMED ∎
                          ↘ INVALID ∎    ↘ ALREADY-MEMBER ∎
                          ↘ EXPIRED ∎
                          ↘ REVOKED ∎
```

| State | Where | Mechanics |
|---|---|---|
| MINTED | server action on `/admin/invite` | `crypto.randomUUID()` for `jti`; `exp = floor(now()/1000) + 7*86400`; `iss = session.githubHandle` (v0.1's Auth.js session shape, per `lib/auth.ts`). **Zero persistence at mint** — token IS the state. |
| DELIVERED | out of system | admin copy-pastes URL into Telegram DM |
| ARRIVED | first GET to `/onboard?token=…` | (see "Redirect-to-clean-URL" below) |
| AUTHENTICATED | post-NextAuth callback | User has GitHub session; cookie carries token; render form (or already-member error) |
| SUBMITTED | server action on form POST | Re-verify token; commit 4 files atomically; clear cookie |
| REDEEMED | terminal | Ledger has redeemed row; redirect to `/this-week` |
| INVALID/EXPIRED/REVOKED/ALREADY-MEMBER | any verify call | Same generic-error page (`app/onboard/error/page.tsx`), HTTP 404. **No info-leak about which check failed.** |

#### Redirect-to-clean-URL (load-bearing token-leakage mitigation)

First GET to `/onboard?token=<token>`:

1. Server reads `token` from query string.
2. `verifyToken(token, INVITE_SECRET)` → if `null`, render `/onboard/error` (HTTP 404).
3. Read ledger via Octokit GET; if `jti` is in ledger as `redeemed` or `revoked` → render `/onboard/error`.
4. Set cookie:
   ```
   __Secure-warsaw_invite=<token>;
     HttpOnly; Secure; SameSite=Strict;
     Path=/onboard;
     Max-Age=86400
   ```
5. 302-redirect to `/onboard` (clean URL, no query string).

**Result:** the original token-bearing URL touches Vercel access logs ONCE per redemption. URL bar is cleaned after redirect. External resources loaded by `/onboard` get no `Referer` (per §11.5 H4 header).

#### Auth integration with NextAuth

`/onboard` is in `proxy.ts` `PUBLIC_PATHS` — must be reachable BEFORE the user is in roster. Inside the route handler:
- **No GH session + valid cookie token**: render form with action `signIn("github", { callbackUrl: "/onboard" })` (NextAuth client-form-POST signin per CONSTRAINTS line 18). `callbackUrl` is server-supplied (hardcoded `"/onboard"`), not user-supplied — closes open-redirect surface.
- **Valid GH session + valid cookie + redeemer NOT in roster**: render prefilled form.
- **Valid GH session + valid cookie + redeemer IN roster**: render `/onboard/error` (ALREADY-MEMBER).
- **No cookie token** (direct GET to `/onboard`): render `/onboard/error`.

#### Redemption (atomic 4-file commit + retry)

Form submit → server action `redeemInvitation(formData)`:

1. Read session via `await auth()`; if `!session?.githubHandle` → generic error (no session, no leak).
2. Read token from `__Secure-warsaw_invite` cookie; if absent → generic error.
3. `verifyToken()` again (defense-in-depth).
4. Check `session.githubHandle` is NOT in roster.md (ALREADY-MEMBER).
5. **Capture `expectedHeadSha`** = current HEAD SHA of `main` via Octokit `git.getRef`.
6. **Read ledger** at `expectedHeadSha`; if `jti` is in ledger as `redeemed` or `revoked` → abort (REPLAYED / REVOKED). Defense-in-depth before CAS at commit.
7. Validate form fields via Zod (RedeemFormSchema, §11.4).
8. Octokit `commitMultipleFiles({owner, repo, branch: "main", files, message, expectedHeadSha})` with 4 file mutations (paths in §11.4).
9. Commit message + trailers (§11.4).
10. **On 409 conflict (HEAD advanced between step 5 and step 8): retry ONCE** — re-fetch HEAD ref + ledger; re-verify JTI not now-redeemed; abort with generic error if it is, else re-attempt commit with new `expectedHeadSha`. Hard cap at 1 retry.
11. On success: `cookies().delete("__Secure-warsaw_invite", { path: "/onboard" })`; `revalidatePath` on `/members`, `/this-week`, `/admin/health`; redirect to `/this-week` (hardcoded; no user-supplied destination).
12. On any error path post-cookie-set: also delete cookie.

#### Manual revocation

No `/admin/revoke` UI in v0.1.x. Revocation = admin appends row to `community/members/invitations.md`:

```markdown
| <jti> | revoked | <iso8601> | revoked by @<admin_gh_handle> | <reason> |
```

Verifier rejects any `jti` with a `revoked` row.

#### Locked standards

| Concern | Standard |
|---|---|
| HMAC algorithm | HMAC-SHA-256 (RFC 2104) |
| HMAC encoding | base64url no-padding (RFC 4648 §5) |
| UUID format | v4 (RFC 4122 §4.4), lowercased |
| Comparison | `crypto.timingSafeEqual` (constant-time) |
| Cookie prefix | `__Secure-` (RFC 6265bis) |

### 11.3 Components / files (~27 touched)

#### New TS source files (6)

| Path | Responsibility | Coverage gate |
|---|---|---|
| `lib/invitations.ts` | Token crypto, `RedeemFormSchema`, ledger parser/serializer, redemption orchestrator, revoke helper, `logRedemptionEvent`. ~310 lines. | **100% (strict-list)** |
| `app/admin/invite/page.tsx` | Server component. `auth()` + `isAdmin(handle)`; non-admin → `redirect('/no-access')`. ƒ Dynamic. | 80% |
| `app/onboard/page.tsx` | ƒ Dynamic. Reads cookie via `cookies()` from `next/headers`. Three render branches; first-GET handler does redirect-to-clean-URL handoff. | 80% |
| `app/onboard/error/page.tsx` | Generic-error page for ALL error states. HTTP 404. Single message. | 80% |
| `app/actions/mint-invitation.ts` | Admin-only server action. Validates Zod; mints token; returns URL. | **100% (strict-list)** |
| `app/actions/redeem-invitation.ts` | Member-side server action. Reads cookie; re-verifies; checks redeemer not in roster; validates form; calls `lib/invitations.ts:redeemInvitation`; clears cookie; `revalidatePath`; redirects to `/this-week` (hardcoded). | **100% (strict-list)** |

#### New components (3)

| Path | Coverage gate |
|---|---|
| `app/components/InviteForm.tsx` | **100% (strict-list)** |
| `app/components/InviteUrlDisplay.tsx` | **100% (strict-list)** |
| `app/components/OnboardForm.tsx` (renders soft-binding banner; see §11.5) | **100% (strict-list)** |

#### New data file (1)

| Path | Initial content |
|---|---|
| `community/members/invitations.md` | Empty ledger; schema in §11.4 |

#### Modified TS files (5)

| Path | Change |
|---|---|
| `lib/rbac.ts` | Add `isAdmin(handle: string): Promise<boolean>` — reads roster.md; true if Role ∈ {`Founder / BDFL`, `Core organizer`}. |
| `lib/roster.ts` | Add `appendMember({name, gh_handle, telegram, link, focus})`. Update parser for 5-col Members table. |
| `lib/git-email-aliases.ts` | Add `appendAlias({email, gh_handle})` — rejects duplicates; preserves email case. |
| `lib/github-app.ts` | **Add new helper** `commitMultipleFiles({owner, repo, branch, files, message, expectedHeadSha})`. Implements blob × N → tree → commit → updateRef. CAS via `expectedHeadSha`. |
| `app/actions/consent.ts` (or new `lib/consent.ts`) | Extract `generateConsentMarkdown(ghHandle, formData): string` as a pure helper (DRY for consent-file content). Migrate existing `stubBody` to use `yamlString`. |

#### Modified routing + headers + helper

| Path | Change |
|---|---|
| `proxy.ts` | (a) `/onboard`, `/onboard/error` in PUBLIC_PATHS. (b) `/admin/invite` is normal authenticated path (admin gate is page-level). (c) Header injection for `/onboard*`: `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, `Cache-Control: no-store`. |
| `lib/markdown.ts` (or new `lib/yaml-string.ts`) | Add `yamlString(v: string): string` — produces YAML 1.2-compatible double-quoted string via `JSON.stringify`. Used by `generateConsentMarkdown`. |

#### Modified data/config files

| Path | Change |
|---|---|
| `community/members/roster.md` | Schema migration: 5-col Members table (Name + GitHub + **Telegram** + Link + Focus). Mark Spasonov's row gets empty Telegram cell; backfilled separately (per Q6). |
| `community/members/<slug>.md` (existing) | Regenerated using `yamlString`; no content change for Anton's profile (already YAML-safe). |
| `.env.example` | Add `INVITE_SECRET=` placeholder with comment. |
| `CHANGELOG.md` | v0.1.1 entry. |
| `STATE.md` | Bump phase; add `INVITE_SECRET` row to last-verified. |

#### Test files (11)

| Path | Coverage focus |
|---|---|
| `lib/invitations.test.ts` | **100% lines + branches.** Token crypto, canonical JSON, ledger parser, redeem orchestrator (happy + retry + abort), revoke, schemas, snapshot tests for row generators, logging discipline test. |
| `lib/rbac.test.ts` | `isAdmin` for {Founder, Core organizer, regular member, unknown, malformed}. |
| `lib/roster.test.ts` (extension) | `appendMember` snapshot; 5-col parser; empty-Telegram-cell tolerance. |
| `lib/git-email-aliases.test.ts` (extension) | `appendAlias` snapshot; rejects duplicates; preserves case. |
| `lib/github-app.test.ts` (extension) | `commitMultipleFiles` happy + 409. |
| `app/actions/mint-invitation.test.ts` | **100%.** Zod input; mint; URL return. |
| `app/actions/redeem-invitation.test.ts` | **100%.** Mocked Octokit; 4-file commit shape; trailers; ledger row format; revalidatePath; redirect target. |
| `app/admin/invite/page.test.tsx` | RTL: admin sees form; non-admin → `/no-access`. |
| `app/onboard/page.test.tsx` | RTL: three render branches; cookie-handoff first-GET; soft-binding banner present. |
| `app/onboard/error/page.test.tsx` | RTL: generic message; HTTP 404; no query-param leakage. |
| `tests/e2e/invitation.spec.ts` | Playwright: 7 scenarios (§11.6). |

#### Strict-list additions to spec §8

`lib/invitations.ts`, `app/actions/mint-invitation.ts`, `app/actions/redeem-invitation.ts`, `app/components/InviteForm.tsx`, `app/components/OnboardForm.tsx`, `app/components/InviteUrlDisplay.tsx` — all at 100% lines + branches.

#### Test-count budget

~85 unit/integration tests + 7 E2E. ~30% growth on v0.1's 294/19 baseline.

#### No new npm packages

Reuses Node `crypto`, `zod`, `@octokit/*`, NextAuth/Auth.js v5, Tailwind.

### 11.4 Data model

#### Form input schema (Zod, validated server-side)

```typescript
const emptyToUndef = (v: unknown) =>
  (typeof v === "string" && v.trim() === "" ? undefined : v);

const noNewlines = z.string().refine(s => !/[\r\n]/.test(s), {
  message: "must be a single line",
});

const RedeemFormSchema = z.object({
  display_name:     noNewlines.transform(s => s.trim()).pipe(z.string().min(1).max(80)),
  focus:            z.preprocess(emptyToUndef, noNewlines.transform(s => s.trim()).pipe(z.string().max(120)).optional()),
  link:             z.preprocess(emptyToUndef, z.string().trim().max(200).url().refine(s => s.startsWith("https://")).optional()),
  telegram:         z.string().regex(/^@[a-zA-Z0-9_]{5,32}$/),
  git_email_alias:  z.string().email().max(120),  // case preserved
  consent_accepted: z.literal(true),
});
```

**3-boundary sanitization model:**

| Boundary | Defense |
|---|---|
| Input | Zod schema rejects newlines, validates URL syntax + https scheme, validates email + telegram regex |
| Write | Markdown row generators escape `\|` → `&#124;`; YAML frontmatter quoted via `yamlString()` |
| Display | Existing `lib/markdown.ts` + `app/components/SafeHtml.tsx` pipeline (CONSTRAINTS line 22) sanitizes at view |

#### `roster.md` schema migration

| Before (v0.1.0, 4-col) | After (v0.1.1, 5-col) |
|---|---|
| `Name \| GitHub \| Link \| Focus` | `Name \| GitHub \| Telegram \| Link \| Focus` |

- Mark Spasonov's row gets empty Telegram cell at migration; backfilled separately (per Q6).
- Core organizers table unchanged.
- Migration in v0.1.1 release commit, atomic with parser update.

`appendMember` row format:
```
| <display_name_escaped> | @<gh_handle> | @<telegram> | <link_or_empty> | <focus_escaped_or_empty> |
```

#### `git-email-aliases.md` (existing format — locked)

```markdown
| Git email | GitHub handle | Notes |
|---|---|---|
| <new-email> | <handle-no-@> | <empty for invitation-flow appends> |
```

`appendAlias` rules: strip leading `@` from handle; preserve email case; case-insensitive duplicate check; pre-append rejection on duplicate.

#### `invitations.md` ledger format (NEW)

Initial content:
```markdown
# Invitations Ledger

Append-only audit trail of personal invitations. Rows are NEVER edited or deleted.

Lifecycle states tracked:
- `redeemed` — bot-appended automatically when invitee completes redemption.
- `revoked` — admin-appended manually (PR) to invalidate an unredeemed token.

Pending (minted-but-not-yet-redeemed) tokens are stateless and NOT in this ledger.
Expired tokens are not recorded; expiry is `Issued At + 7 days`.

| JTI | Status | Issued At | Issued By | Hint (Telegram) | Redeemed At | Redeemed By | Notes |
|---|---|---|---|---|---|---|---|
```

**Field schema:**

| Field | Format | Required for |
|---|---|---|
| JTI | UUID v4 lowercase, hyphenated | Both |
| Status | `redeemed` \| `revoked` | Both |
| Issued At | `Date.prototype.toISOString()` (ms-precision UTC) | Both |
| Issued By | `@<gh_handle>` | Both |
| Hint (Telegram) | `@<handle>` or empty | Both |
| Redeemed At | ISO 8601 UTC w/ ms | `redeemed` only |
| Redeemed By | `@<gh_handle>` | `redeemed` only |
| Notes | Free text (escape `\|`); no newlines | Optional |

**Append-only invariant:** even when both `redeemed` and `revoked` rows exist for same JTI (operationally weird, post-redemption admin revocation), neither row is modified. Verifier rejects the JTI either way.

#### Member profile / consent file (`community/members/<slug>.md`)

Format matches v0.1.0 byte-for-byte (extracted from `app/actions/consent.ts:stubBody`):

```markdown
---
name: "<display_name_yaml_safe>"
github_handle: <gh_handle>
consented_at: "<ISO 8601 UTC with ms>"
---

_Profile prose to come — open a PR to fill this in._
```

**YAML safety (v0.1.x bug-fix):**
- `<display_name_yaml_safe>` produced by `yamlString(displayName)` — uses `JSON.stringify(...)` for YAML 1.2-compatible double-quoted string with proper escaping.
- `consented_at` ISO timestamp wrapped in double quotes — prevents YAML 1.1 implicit timestamp typing.
- v0.1's existing `stubBody` migrates to use `yamlString` in same release commit.

Generation: single helper `generateConsentMarkdown({name, gh_handle})` — both consent action and redemption orchestrator consume.

#### Slug derivation

`slug = slugify(display_name)` using v0.1's existing helper (plan-writing locks call site).

**Reserved slugs:**
```typescript
const RESERVED_SLUGS = new Set(["roster", "git-email-aliases", "invitations"]);
```

**Collision policy:** before writing `community/members/<slug>.md`:
1. If `slug ∈ RESERVED_SLUGS` → use `<slug>-2` as starting point.
2. Octokit `git.getContent` on target path; 404 → write at `<slug>.md`; exists → increment suffix.
3. Hard cap at suffix `-9`; abort with generic error if hit.

#### The 4-file commit (final)

Single Octokit commit by `warsaw-ai-bot`:

| # | Path | Operation | Generated by |
|---|---|---|---|
| 1 | `community/members/roster.md` | Append row | `lib/roster.ts:appendMember` |
| 2 | `community/members/git-email-aliases.md` | Append row | `lib/git-email-aliases.ts:appendAlias` |
| 3 | `community/members/invitations.md` | Append row | `lib/invitations.ts:appendRedemptionRow` |
| 4 | `community/members/<slug>.md` | Create file | `generateConsentMarkdown` helper |

All under `community/members/` — single-directory cohesion.

Commit message:
```
invitation: redeem invite for @<gh_handle>

Invited-By: @<iss>
Invitation-JTI: <jti>
Invitation-Hint-Telegram: @<hint_telegram>     # only if hint was present at mint
```

### 11.5 Threat model, hardenings, error handling

#### Trusted assumptions

| Trust | Source | Conditional on |
|---|---|---|
| HTTPS in transit | Vercel-managed; required by `__Secure-` cookie prefix | — |
| Vercel function isolation | Platform-provided | — |
| GitHub OAuth identity assertion | OAuth 2.0 + GH-issued signed tokens, verified by Auth.js v5 | — |
| `INVITE_SECRET` confidentiality | Vercel encrypted env var; provisioned via Gotcha-6 | — |
| `warsaw-ai-bot` GH App credentials | Inherited v0.1 trust; Phase 4.2 reviewed | — |
| `git log` history immutability | Standard git | **Branch protection on `main` with no-force-push** (§11.7 ops checklist) |
| Admin trust (Role ∈ {Founder/BDFL, Core organizer}) | Members-table-vetted | **GitHub 2FA on admin accounts** (§11.7 ops checklist) |

#### Accepted risks (out of scope, documented)

| Risk | Mitigation in place | Why acceptable |
|---|---|---|
| **Soft binding** — stolen Telegram DM within 7-day TTL can be redeemed by attacker as their own GH identity | TTL caps window; ledger records hint+actual; manual revocation; UX banner on `<OnboardForm>` ("This invitation was issued to @\<hint_telegram\>. If that's not you, please don't proceed.") | 10-member trust-based community; cost of cryptographic binding (admin must know all GH handles upfront) defeats purpose; detection post-hoc via audit. v0.2 path: optional email-confirmation step. |
| Compromised admin Vercel session | NextAuth session expiry + browser security | General admin-session security; not invitation-specific |
| `INVITE_SECRET` compromise | Vercel encrypted env var; never echoed in chat | Standard secret-management; rotate-on-suspect |
| GitHub OAuth phishing | Out of scope | General OAuth phishing risk |
| Compromised `warsaw-ai-bot` App credentials | Inherited v0.1 risk; Phase 4.2 reviewed | Same blast radius as v0.1 consent + status writes |

#### Hardenings (13 total) — testable contract

Each hardening has ≥1 `describe("H<n>: ...")` block; single grep at plan-writing-DoD verifies all 13 present.

| H# | Hardening | Surface |
|---|---|---|
| H1 | HMAC-SHA-256 + `crypto.timingSafeEqual` + canonical-JSON | `lib/invitations.ts:verifyToken` |
| H2 | JTI replay defense via ledger lookup | `lib/invitations.ts:redeemInvitation` |
| H3 | Manual revocation via ledger row + verifier check | `lib/invitations.ts:verifyToken` |
| H4 | `Referrer-Policy: no-referrer` on `/onboard*` | `proxy.ts` |
| H5 | Redirect-to-clean-URL handoff | `app/onboard/page.tsx` first-GET handler |
| H6 | Cookie security: `__Secure-warsaw_invite`, HttpOnly, Secure, SameSite=Strict, Path=/onboard, Max-Age=86400 | `app/onboard/page.tsx` + redeem action |
| H7 | Whitelist-based event logger; never emits token contents or `INVITE_SECRET` | `lib/invitations.ts:logRedemptionEvent` + console-mock test |
| H8 | Zod server-side validation of ALL form fields (mass-assignment defense via `.object({})` whitelist) | `app/actions/redeem-invitation.ts` |
| H9 | URL syntax + `^https://` scheme check on `link` | `RedeemFormSchema` |
| H10 | Newline rejection on `display_name` + `focus` | `RedeemFormSchema` |
| H11 | YAML-safe emit (`yamlString`) for frontmatter | `lib/markdown.ts` (or `lib/yaml-string.ts`) |
| H12 | Slug collision pre-check + `-N` suffix (cap N=9); RESERVED_SLUGS set | `lib/invitations.ts:redeemInvitation` |
| H13 | Concurrent-redemption: retry-once-on-409 (re-read ledger; abort if JTI now-redeemed) | `lib/invitations.ts:redeemInvitation` |

#### Cookie security properties (deep-dive on H6)

```
Set-Cookie: __Secure-warsaw_invite=<token>;
              HttpOnly;
              Secure;
              SameSite=Strict;
              Path=/onboard;
              Max-Age=86400
```

**OAuth flow integration:** cookie set on first GET to `/onboard?token=…` (before user has session). Auth.js `signIn("github", { callbackUrl: "/onboard" })` triggers OAuth round-trip. Both pre-OAuth and post-OAuth requests target `/onboard`, so `Path=/onboard` doesn't drop the cookie across the OAuth chain. `Max-Age=86400` (24h) outlives a typical OAuth ceremony + reasonable user pause.

**Cookie clearing:** `cookies().delete("__Secure-warsaw_invite", { path: "/onboard" })` on success AND on any error path post-cookie-set.

#### Response headers (proxy.ts)

For ALL `/onboard*` paths:
```
Referrer-Policy: no-referrer
X-Frame-Options: DENY
Cache-Control: no-store
```

Platform-wide headers (HSTS via Vercel, `X-Content-Type-Options: nosniff`, CSP if configured) are inherited.

#### Error states and responses

| State | Trigger | UI response | HTTP status | Cookie action |
|---|---|---|---|---|
| INVALID | Token signature fail / format malformed / payload schema fail | Generic-error page | 404 | Delete |
| EXPIRED | `exp < now()` | Generic-error page | 404 | Delete |
| REVOKED | JTI has revoked row | Generic-error page | 404 | Delete |
| REPLAYED | JTI has redeemed row | Generic-error page | 404 | Delete |
| ALREADY-MEMBER | Redeemer's GH handle in roster | Generic-error page | 404 | Delete |
| NO-COOKIE | Direct GET to `/onboard` (no query, no cookie) | Generic-error page | 404 | (none to delete) |
| FORM-VALIDATION-FAIL | Zod schema rejection on submit | In-place form with field-level errors | 200 | Keep (user can fix and retry) |
| COMMIT-RETRY-EXHAUSTED | Two 409 conflicts during commit | Generic-error page (retry-later guidance) | 503 | Delete |

**Generic-error UI** (`app/onboard/error/page.tsx`):

```
This invitation can't be completed.

Please reach out to a community organizer if you need a new invitation.
```

Single message; no enumeration of failure modes (info-leak prevention).

#### Logging discipline (deep-dive on H7)

A single helper `logRedemptionEvent({jti, event, ...metadata})` in `lib/invitations.ts` whitelists fields.

**Permitted:** `jti`, `event` (∈ `{minted, redeemed, revoked, invalid, expired, replayed, commit-retry, commit-success, already-member}`), `redeemer_gh`, `issuer_gh`, `iso_timestamp`, `http_status`.

**Prohibited:** Full token strings (signature + payload), `INVITE_SECRET`, GitHub OAuth tokens, cookie values, stack traces with token strings, ***form-supplied PII*** (`git_email_alias`, `telegram_handle`, `display_name`, `focus`, `link` — public in git but kept out of runtime logs to minimize egress + simplify GDPR audit).

**Test enforcement:** `lib/invitations.test.ts` mocks `console.{log,warn,error}` and asserts no emissions contain `INVITE_SECRET` or full token strings on any error path.

#### Rate limiting

DEFERRED to v0.2. UUIDv4 = 122-bit JTI; brute-force infeasible (HMAC-validated first → no valid attempts without `INVITE_SECRET`). 10-member community; legitimate traffic ≤ 1/day. Vercel platform DDoS protection at edge.

#### Audit-log tamper resistance

`community/members/invitations.md` is the *convenience* audit layer. The *immutable* audit layer is `git log -p community/members/invitations.md`.

Branch protection on `main` (no force-push) is the precondition (§11.7 ops checklist).

### 11.6 Testing strategy

#### TDD discipline (CONSTRAINTS line 26)

Red → green → refactor → commit. No exceptions for new code. HMAC verify, redeem orchestrator, form validation: tests BEFORE implementation.

#### Coverage gates

| Surface | Gate |
|---|---|
| Spec §8 strict-list (6 additions per §11.3) | **100% lines + branches** |
| Other new code (pages, lib extensions) | 80% (matches v0.1 precedent — pages NOT in v0.1 strict-list) |
| Overall project | 80% (existing gate; must not regress) |

#### Hardening coverage map

| H# | Primary | Smoke / integration |
|---|---|---|
| H1, H2, H3, H7, H11, H12, H13 | `lib/invitations.test.ts` | — |
| H4 | `tests/e2e/invitation.spec.ts` (response-header assert) | — |
| H5, H6 | `app/onboard/page.test.tsx` | E2E first-hit |
| H8, H9, H10 | `lib/invitations.test.ts` (`RedeemFormSchema` direct) | `app/actions/redeem-invitation.test.ts` (1 case each) |

#### Mocking strategy

| What | Mock |
|---|---|
| Octokit (`createGitHubApp`) | Manual stub; record calls; canned responses; `OctokitError(status=409)` for retry tests |
| `auth()` from NextAuth | Existing v0.1 pattern (`app/actions/_test-consent-store.ts`) |
| `cookies()` from `next/headers` | Next 16 test utilities |
| `crypto.randomUUID()` | Fixed UUID via `vi.spyOn` |
| `Date.now()` / `new Date().toISOString()` | `vi.useFakeTimers()` |
| Markdown row format regressions | **Snapshot tests** in `lib/__snapshots__/` for `appendRedemptionRow`, `appendMember`, `appendAlias`, `generateConsentMarkdown` |

#### E2E test environment

Per §11.7 (Gotcha 3): E2E runs are **dev-only** (Playwright + dev server + `E2E_MODE=1`). Reuses existing v0.1 mock pattern. No real git writes; no real OAuth.

**Required scenarios:**
1. Happy path: admin mints → invitee redeems → `/this-week` shows new member.
2. Invalid token → `/onboard/error`.
3. Expired token → `/onboard/error`.
4. Replayed JTI → `/onboard/error`.
5. Already-member redeemer → `/onboard/error`.
6. Form validation fail (invalid email) → in-place errors.
7. Soft-binding banner visibility check.

E2E command: `pnpm e2e --retries=2` (Next 16 cold-start flake mitigation per defects-playbook pattern 9).

#### Reviewer agents

- **`security-reviewer`** at v0.1.1 closeout against `lib/invitations.ts`, `app/actions/redeem-invitation.ts`, `proxy.ts` deltas.
- **`typescript-reviewer` + `code-reviewer`**: hit Anton's monthly Claude usage cap per CONSTRAINTS line 46. **Self-review checklist (CONSTRAINTS lines 50-59) is the standing fallback.**

#### Test isolation

`afterEach(cleanup)` for RTL tests; `vi.restoreAllMocks()` in `afterEach` for unit tests; no module-level mutable singletons under test; E2E tests independent.

### 11.7 Migration / release notes

#### Pre-release operations checklist

- [ ] Generate `INVITE_SECRET` (production):
  ```bash
  openssl rand -base64 32 > ~/Documents/secrets/invite-secret-prod.txt
  chmod 600 ~/Documents/secrets/invite-secret-prod.txt
  vercel env add INVITE_SECRET production --yes < ~/Documents/secrets/invite-secret-prod.txt
  ```
- [ ] Generate `INVITE_SECRET` (preview, **different value**); same pattern with `--environment=preview`.
- [ ] Enable branch protection on `main`: PR-required EXCEPT `warsaw-ai-bot` bypass (matches v0.1's existing direct-commit pattern); disable force-push; disable branch deletion.
- [ ] Confirm GitHub 2FA on Anton's account.
- [ ] Verify env-var presence: `vercel env pull .env.production-check --environment=production --yes`. `INVITE_SECRET=""` is expected (sensitive — empty quotes per Gotcha 5).
- [ ] Local test gates:
  - [ ] `pnpm tsc --noEmit` clean
  - [ ] `pnpm test` green; coverage gates met
  - [ ] `pnpm e2e --retries=2` green
  - [ ] `grep -r "describe(\"H[0-9]" lib/ app/` returns 13 hardenings

#### v0.1.1 release PR contents

PR title: `release(community-platform): v0.1.1 invitation feature`. ~27 files touched (per §11.3 budget). Single PR; merged to main; auto-deploys.

#### Post-deploy operations (within 24h)

- [ ] **Production smoke test (non-polluting):** Anton mints token with `hint_telegram=@antonsafronov`; clicks own URL; Auth.js sees Anton's session; redeem flow triggers ALREADY-MEMBER → renders `/onboard/error` (HTTP 404). Verifies token + cookie + redirect chain without polluting roster/aliases/ledger. Token expires unused in 7d.
- [ ] **Manual PR — Mark Spasonov backfill** (per Q6 + Q4 locks): `chore(community): backfill Mark Spasonov's git-email alias + telegram handle`. Adds row to `git-email-aliases.md`; fills Telegram cell in roster.md.
- [ ] **First real invitation:** Anton mints + sends to one of the 17 outstanding members.

#### Operational handoff (Telegram-DM playbook)

| Before (v0.1.0) | After (v0.1.1) |
|---|---|
| Anton DM's invitee → asks for name + GH handle + focus + email → manually opens 2-3 PRs per member | Anton opens `/admin/invite`, fills `hint_telegram`, gets URL, copy-pastes into Telegram DM. Invitee redeems on their own time. |

#### Rollback plan

| Trigger | Mitigation |
|---|---|
| Redemptions fail in production | Vercel UI → previous deploy → Redeploy "with existing Build Cache" (~30s; `INVITE_SECRET` stays set, idempotent) |
| Flagrant security issue (e.g., HMAC bypass) | `git revert <v0.1.1-merge-sha>` + push; rotate `INVITE_SECRET` (invalidates outstanding tokens) |
| Half-completed multi-file commit (Octokit `updateRef` after `createCommit` succeeds) | Dangling commit harmless; GitHub gc reaps; no state corruption |
| Ledger row written but roster row missing | Shouldn't happen (atomic commit); investigate via `git log -p`; manual cleanup PR |

#### Future migration notes (v0.2 references — not in scope)

| Trigger | Migration |
|---|---|
| DB introduced (per §6.1) | Token state migrates to DB; `invitations.md` becomes audit-only (one-time import) |
| Email-confirmation step | Mitigates soft-binding accepted risk (§11.5); admin enters invitee email; token bound to email |
| Branch protection tightens (no bot bypass) | All bot-write surfaces (consent + status + invitations) migrate to PR-based; system-wide change |
| TTL changes | Ledger gains `Exp` column; existing rows pre-Exp-era treated as expired |
| Self-service member updates | New `/me/edit` surface (Q6 deferred); auth-only, no token; same `warsaw-ai-bot` mechanism |

#### Definition of Done for v0.1.1

- [ ] All 7 §11 sections committed.
- [ ] All ~27 files implemented per §11.3.
- [ ] All 13 hardenings (H1-H13) tested with `H<n>:` prefix.
- [ ] Coverage gates met (80% overall, 100% on 6 strict-list additions).
- [ ] E2E green with `--retries=2`.
- [ ] §11.7 pre-release ops checklist complete.
- [ ] PR merged to main; CHANGELOG, STATE updated.
- [ ] Production smoke (§11.7) passes ALREADY-MEMBER path.
- [ ] Mark Spasonov backfill PR opened (separate from release PR).
- [ ] First real invitation sent; ledger entry confirmed.

---

## 12. v0.2.0 — Profile editor + contribution surfacing + GBrain link

> **Scope:** v0.2.0 release. 100% git (per §5 + CONSTRAINTS line 10), no DB / KV. §6.1 classification rule stays dormant.
> **Brainstormed:** 2026-05-16 via `superpowers:brainstorming` (chat 11).
> **Closes:** §3 v0.1 non-goal *"Full profile editor UI … until the v0.2 editor ships"*; §6.8 GBrain *"Ask GBrain about this project"* link candidate; §11.7 future-migration row *"Self-service member updates (Q6 deferred); new /me/edit surface"*.
> **Locked decisions:** Q1–Q5 + D1–D9 from chat-11; applied below.
> **Versioning:** single v0.2.0 ship. Plan-writing (chat 12) has standing authority to re-split into v0.2.0 + v0.2.1 if implementation estimate exceeds 50 tasks OR 2 weeks elapsed wall-time; default split point if forced = (v0.2.0 = editor / v0.2.1 = contribution surfacing + GBrain link).
> **Hardening ID namespace:** §12 uses **H14–H29** (continues from §11's H1–H13 to avoid cross-section grep collisions).

### 12.1 Locked decisions

| ID | Lock | Decision |
|---|---|---|
| Q1 | Primary thrust | (B) Profile editor + thin (A) project contribution surface + GBrain link tag-along |
| Q2 | DB / KV return | NO. 100% git. §6.1 stays dormant. DB-trigger re-evaluated in v0.3 brainstorm contingent on observed scale/abuse |
| Q3 | GBrain coupling | Outbound link, env-gated by `GBRAIN_BASE_URL`; no embed; no auth/token coupling |
| Q4 | Hardenings | H14–H29 (see §12.6) |
| Q5 | Versioning | Single v0.2.0 ship; plan-writing may re-split per trigger criteria above |
| D1 | Editor page placement | `/me/edit` — session-derived slug (mirrors `/api/me/{export,delete}`) |
| D2 | Editor scope | Prose body of `community/members/<slug>.md` ONLY; frontmatter is read-only |
| D3 | Editor UX | Textarea + Preview tab (existing `lib/markdown.ts` + `SafeHtml`); no rich-text editor library |
| D4 | File-not-exists edge case | Redirect to `/consent` to re-create stub; editor never auto-creates |
| D5 | Project page surface | Top-N (N=5) contributors card on `/projects/[slug]` |
| D6 | GBrain link placement | Header-level button on `/projects/[slug]` |
| D7 | Health metric (§2 goal 8) | NO change; editor independent of posting cadence |
| D8 | GDPR (§6.13) | NO endpoint change; `/api/me/export` re-fetches current prose at export time |
| D9 | Launch-blockers | NONE (unlike v0.1.1 §9 risk 3) |

**§6.1 clarification (forward-looking, applied this brainstorm):** the classification rule's *"drafts → DB territory"* line applies iff drafts must persist *cross-device*. v0.2 profile-editor drafts are single-device by intent (browser localStorage); rule stays dormant. Cross-device draft requirements (e.g., mobile + desktop) become a v0.3 DB-trigger candidate.

### 12.2 Architecture

v0.2.0 extends v0.1 + v0.1.1 surfaces; no new infrastructure. New env var: `GBRAIN_BASE_URL` (optional; controls GBrain link rendering).

```
┌──────────────────────────────────────────────────┐
│  Existing v0.1.x surfaces (unchanged)            │
│  • Auth (Auth.js v5 + GitHub OAuth, JWT)         │
│  • proxy.ts (manual decode, PUBLIC_PATHS)        │
│  • lib/markdown.ts + SafeHtml                    │
│    (audit-bounded HTML-insertion site,           │
│    CONSTRAINTS line 20)                          │
│  • lib/github-app.ts (warsaw-ai-bot writer):     │
│      readFile, writeFile, deleteFile,            │
│      commitMultipleFiles, getHeadSha             │
│  • lib/rbac.ts (4-role + isAdmin / isCM)         │
│  • lib/content-snapshot.ts:                      │
│      findMemberByHandle, findMemberBySlug,       │
│      listProjectDetails, getContributions        │
│  • lib/contributions.ts (4-count per member)     │
│  • scripts/build-contributions.ts                │
└─────────────────┬────────────────────────────────┘
                  │
                  ▼ v0.2.0 additions
┌──────────────────────────────────────────────────┐
│  /me/edit  (new ƒ Dynamic route)                 │
│  • server component: derives slug from session   │
│  • renders ProfileEditor (client component)      │
│  • Save → server action saveProfile() → bot      │
│    writeFile with HEAD-CAS retry                 │
│  • Draft persistence: localStorage only          │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  /projects/[slug]  (extended page)               │
│  • TopContributors (build-time derived)          │
│  • AskGBrainButton (env-gated; renders iff       │
│    GBRAIN_BASE_URL set)                          │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  /members/[slug]  (extended page)                │
│  • "Edit profile" link rendered when isSelf      │
│    (existing line 39 derivation)                 │
└──────────────────────────────────────────────────┘
```

Three architectural pillars (analog to §11.1):

1. **Editor is self-only by construction.** `/me/edit` derives `slug` from `session.githubHandle` → `slugify()` (existing `lib/slug.ts` helper; single-source per `lib/roster.ts:4` import) — never from URL, never from request body. Cross-user edit structurally impossible (H15). Same pattern v0.1 took for `/api/me/{export,delete}` (§6.13).
2. **`warsaw-ai-bot` remains the only privileged writer.** Editor reuses existing `lib/github-app.ts:writeFile()` for the single-file commit (no need for `commitMultipleFiles` — only one path mutates per save). `getHeadSha()` provides the CAS anchor; the orchestrator does the single retry on 409.
3. **No DB; localStorage covers draft autosave.** §6.1 dormancy preserved (Q2). Drafts are intentionally single-device per §12.1 clarification.

**Alternatives considered + rejected:**
- DB-backed drafts (Q2 → defer to v0.3+; localStorage covers single-device need at v0.2 scale)
- Rich-text editor library (D3 → textarea + preview tab sufficient; library is audit overhead + bundle weight)
- Roster-field editing (Telegram, link, focus) in same surface (D2 → roster.md stays governance-PR territory; ADR-able artifact)
- Inline edit on `/members/[slug]` (D1 → dedicated `/me/edit` keeps cross-user URL impossible)
- GBrain iframe embed (Q3 → outbound link only; zero state coupling)

### 12.3 Profile editor (B)

#### 12.3.1 Routing

- New route: `app/me/edit/page.tsx`. Authenticated; not in `proxy.ts` `PUBLIC_PATHS` (standard auth gate applies via existing JWT decode + roster check).
- ƒ Dynamic (server component reads `auth()`).
- Slug derived: `slugify(session.githubHandle)` via existing `lib/slug.ts:slugify`.

#### 12.3.2 Page behaviors

| Pre-condition | Behavior |
|---|---|
| No session | `proxy.ts` redirects to `/login` (existing v0.1) |
| Session, not on roster | `proxy.ts` redirects to `/no-access` (existing v0.1) |
| Session, on roster, profile file exists | Render `ProfileEditor` initialized with current body |
| Session, on roster, profile file MISSING | Redirect to `/consent` (D4) — re-consent re-creates stub via existing `app/actions/consent.ts`; editor never auto-creates files |

#### 12.3.3 ProfileEditor component

`app/components/ProfileEditor.tsx` (client component, `"use client"`).

Three regions:

1. **Edit tab** (default): `<textarea>` with raw markdown. Initial value from server-rendered prop OR localStorage draft if present (draft takes precedence with "Restored draft from <localized time>" banner). Native CSS resize handle.
2. **Preview tab**: renders body via `renderMarkdownToHtml()` + `SafeHtml` (existing audit pipeline, CONSTRAINTS line 20). On-demand render (tab click), not live. Plan-writing locks the render mechanism: client-side rehype pipeline (no roundtrip) OR `/api/preview-markdown` (server-side; must be auth-gated and session-slug-derived, never body-slug-trusted). Either choice MUST go through the same `lib/markdown.ts` audit boundary.
3. **Save / Cancel** action row. Save submits to `saveProfile` server action; Cancel reverts to last-saved or localStorage draft.

Post-save UX (rebuild-lag transparency):

- On successful save, display: *"Saved. Your profile is rebuilding and will appear on `/members/<slug>` in ~60-90s after the next deploy completes."*
- Rationale: profile prose lives in `lib/__generated__/content-snapshot.json` (build-time bundled per `pnpm prebuild → pnpm snapshot`). The bot commit triggers a Vercel rebuild via §6.3 path filter, but the running deployment continues serving the OLD snapshot until the new deploy aliases to production. `revalidatePath` (see §12.3.4) clears Next's RSC payload cache but cannot refresh the bundled snapshot — the rebuild does. Without this UX message, members will click Save, reload `/members/<slug>`, and be confused by the stale prose.
- Member's edit is committed to git immediately; the rebuild-lag is purely cosmetic. The editor's localStorage draft (cleared on save) is sufficient evidence the save succeeded.
- Inherits the same lag pattern v0.1.1 invitation flow has for `community/members/roster.md` updates (admin sees new roster row only after the next deploy).

Draft persistence (H23):

- localStorage key: `warsaw-profile-draft-<slug>` (slug from server-rendered prop, NOT from session — slug is already self-derived server-side).
- Restore on mount if draft exists; show banner.
- Save handler clears the draft on success.
- "Discard draft" button if draft exists; user-explicit clear.
- Draft data never sent to the server except on Save submission. No autosave-to-server endpoint.

#### 12.3.4 Save server action

`app/actions/save-profile.ts`:

1. `await auth()` → `session.githubHandle` (else `not_authenticated` → generic error; no info leak).
2. `findMemberByHandle(handle)` → resolve `slug` (else `not_a_member` → generic error; mirrors v0.1.1 consent action).
3. `SaveProfileSchema.safeParse(formData.get("body"))` → typed error if invalid (H18).
4. `client().readFile(profilePath(slug))` → captures `{content, sha}`. If `null` (file missing), redirect to `/consent` (D4).
5. Parse frontmatter from current file (using existing helper in `lib/content-snapshot.ts` or `lib/markdown.ts`; plan-writing locks the helper).
6. Reject if required keys (`name`, `github_handle`, `consented_at`) missing (H19 — corrupt-file diagnosis path; refuse to save rather than silently rewrite).
7. Compose new file content: `<original-frontmatter-block>\n\n<new-body>\n`.
8. Commit message + Co-Authored-By trailer (§12.3.6).
9. `client().writeFile(profilePath(slug), newContent, {message, expectedSha: <step-4-sha>})`.
10. On `sha_conflict` (409): re-execute steps 4-7 (re-read file; re-validate frontmatter) → retry once. On second 409, return `REFRESH_NEEDED` error (H20).
11. On success: `revalidatePath("/members/<slug>")`, `revalidatePath("/members")`. Return `{ok: true, savedAt: <iso8601>}`. **Note:** `revalidatePath` is defense-in-depth — it clears Next's RSC payload cache, but cannot refresh `lib/__generated__/content-snapshot.json` (bundled at build time). Actual prose freshness comes from the **Vercel rebuild** triggered by the bot's push to `community/members/` per §6.3 path filter. Expected freshness lag: 60-90s. The rebuild-lag UX message in §12.3.3 sets this expectation client-side.
12. Log discipline (H24): log only `{slug, sha, success: true|false, error?: "code"}`. Never log body content, raw error object, or stack trace contents.

#### 12.3.5 Form schema

```typescript
// lib/profile-editor.ts
import { z } from "zod";

export const SaveProfileSchema = z.object({
  body: z
    .string()
    .max(65_536, "Profile body too large (max 64KB)"), // H18 — DoS cap
});

export type SaveProfileInput = z.infer<typeof SaveProfileSchema>;
```

Allowed body characters: any UTF-8 string. No additional sanitization at submit time — `lib/markdown.ts` is the audit-bounded sanitization site at **render** time (CONSTRAINTS line 20). Markdown source is intentionally plaintext-stored; rendering is the single audit boundary.

#### 12.3.6 Commit message + attribution

```
chore(community): update profile prose for @<gh-handle>

Co-Authored-By: <gh-handle> <gh-handle@users.noreply.github.com>
```

H17 invariant: `Co-Authored-By` trailer includes member's GitHub handle so audit trails recover member-attributed edits (e.g., `git log --grep='@anton1rsod' community/members/`). Bot remains commit author (no commit signing required). Email format `<handle>@users.noreply.github.com` is GitHub's privacy-preserving no-reply convention.

#### 12.3.7 Members page integration

`app/members/[slug]/page.tsx` extension (existing file, lines 33-70 region):

- When `isSelf` (existing derivation at line 39) AND profile body present: render "Edit profile" link to `/me/edit` adjacent to the Profile section heading.
- When `isSelf` AND profile body absent: replace the current fallback text *"Members can edit `community/members/{slug}.md` directly via git"* (lines 67-69) with "Edit your profile →" link to `/me/edit`. For non-self viewers, the existing fallback text stays unchanged.
- No other changes to `/members/[slug]/page.tsx`. `force-dynamic` stays (line 22).

### 12.4 Project page contribution aggregation (thin A)

#### 12.4.1 Build-time aggregation extension

`lib/contributions.ts` extension:

```typescript
export interface ProjectContribution {
  handle: string;
  commits: number;
}

export interface ProjectContributions {
  // projectSlug → top-N contributors, sorted desc by commits
  [projectSlug: string]: readonly ProjectContribution[];
}

export const TOP_CONTRIBUTORS_LIMIT = 5;

export interface ComputeProjectContributionsInput {
  commits: readonly GitCommit[];
  roster: readonly RosterMember[];
}

export function computeProjectContributions(
  input: ComputeProjectContributionsInput,
): ProjectContributions { /* ... */ }
```

Algorithm:

- For each commit, derive the set of distinct project slugs touched: `commit.files.filter(f => f.startsWith("projects/")).map(f => f.split("/")[1]).filter(Boolean)` → de-duplicate to a `Set<string>` per commit (so one commit touching `projects/foo/{a,b,c}.md` counts once for `foo`, not three times).
- For each (commit, projectSlug) pair, increment `result[projectSlug][handle]` (handle resolved via existing `parseGitLog` + `resolveHandle` chain in `scripts/build-contributions.ts`).
- After all commits are processed, sort each project's contributor list desc by `commits` and slice to `TOP_CONTRIBUTORS_LIMIT` (D5; N=5).
- Bot commits excluded via the existing `BOT_AUTHORS` set in `lib/contributions.ts` line 18 (H26).
- Members not on the current roster are dropped from per-project counts (consistent with `computeContributions`).

`scripts/build-contributions.ts` extension: writes the per-project bucket alongside the existing per-member counts. JSON shape (sibling vs. nested under a sentinel key is a plan-writing choice; example shown nested):

```json
{
  "<handle>": { "projectCommits": N, "adrsFiled": N, "meetingsAttended": N, "statusPosts": N },
  "_projectContributions": {
    "<projectSlug>": [
      { "handle": "<gh>", "commits": N }
    ]
  }
}
```

The `_`-prefixed key segregates the structural field from the member-keyed map without forcing a new file. Plan-writing may instead choose `projects/community-platform/lib/__generated__/project-contributions.json` as a sibling file if cleaner.

#### 12.4.2 TopContributors component

`app/components/TopContributors.tsx`:

```typescript
interface TopContributorsProps {
  contributors: readonly ProjectContribution[];
}
```

Rendering:

- Section heading "Top contributors" (`<h2>`).
- Subtext "Derived from git history. Bot commits excluded." (matches `ContributionCard.tsx` pattern at line 20-22).
- `<ol>` with member name + `@handle` (linked to `/members/<slug>` via slug derived from handle through roster lookup) + commit count.
- Empty state: "No contributors yet" (when `contributors.length === 0` — possible for a fresh project folder with no committed files).

Surface placement: `app/projects/[slug]/page.tsx` — added as a new section between the project metadata (lines 44-47) and the README section (lines 49+). Contributors appear above-the-fold to reinforce *who's working on what* — the original §1 problem statement.

#### 12.4.3 Caveats

- **H25** — aggregation uses *current* path. Renamed/moved project folders lose their pre-rename commits from the new path's aggregate. Documented as a known limitation; v0.3 may add a `community/projects/renames.yaml` shim if it bites in practice.
- A commit that touches a single project's files AND top-level paths (e.g., `community/decisions/`) is counted once per project for that commit, not once per file. De-duplication is per (commit, project) pair, not per (commit, file) pair.

### 12.5 GBrain link (Q3 thin tag-along)

#### 12.5.1 AskGBrainButton component

`app/components/AskGBrainButton.tsx`:

```typescript
interface AskGBrainButtonProps {
  projectSlug: string;
}
```

Rendering:

- Reads `process.env.GBRAIN_BASE_URL` at server-render time (passed via prop from the page server component, NOT read in a client component — keeps env var server-only).
- If `GBRAIN_BASE_URL` is unset OR empty: component returns `null` (H28).
- If set: renders `<a>` element with:
  - `href={\`${GBRAIN_BASE_URL}/?project=${encodeURIComponent(projectSlug)}\`}` (slug URL-encoded)
  - `target="_blank"`
  - `rel="noopener noreferrer"` (H27 — no Referer leakage)
  - Visible text "Ask GBrain about this project →"
  - Button-styled (matches existing CTA patterns).

Surface placement: `app/projects/[slug]/page.tsx` — header region, immediately beneath the project title + path (lines 44-47 region). High visibility; pairs with the Top Contributors card as the page's two interactive affordances.

#### 12.5.2 Env wiring

`lib/env.ts` extension:

```typescript
GBRAIN_BASE_URL: z.string().url().optional(),
```

Optional; absence is the no-render default. Validated only if set (must be parsable URL — guards against `"placeholder"`-class values per GOTCHAS row 1).

Vercel env-var setup (out-of-band, NOT a v0.2 implementation task):

```bash
# Production (when GBrain prod ships)
echo "https://<gbrain-prod-url>" | vercel env add GBRAIN_BASE_URL production "" --no-sensitive --yes

# Preview (matches GBrain preview URL or omit)
echo "https://<gbrain-preview-url>" | vercel env add GBRAIN_BASE_URL preview "" --no-sensitive --yes
```

GOTCHAS row 8 applies: preview env add requires the empty positional `""` for `gitBranch=null`. CLI must run from repo root (`.vercel/` at root; `rootDirectory=projects/community-platform`).

### 12.6 Threat model and hardenings (H14–H29)

H14–H29 are the testable invariants every code change in v0.2 preserves. Each maps to a `describe("H<n>: …")` block per HANDOFF_PROTOCOL §4. Grep-verifiable at DoD:

```bash
grep -rn 'describe("H1[4-9]:\|describe("H2[0-9]:' \
  projects/community-platform/tests \
  projects/community-platform/lib \
  projects/community-platform/app \
  | sed 's/.*describe("\(H[0-9]\+\):.*/\1/' | sort -u | wc -l
# Expected: 16
```

#### Profile editor (B) — H14–H24

| ID | Invariant | Defender | Test surface |
|---|---|---|---|
| **H14** | Profile prose XSS-safe at render | Existing `lib/markdown.ts` + `SafeHtml` pipeline (CONSTRAINTS line 20). Editor adds no new HTML-insertion site. | `lib/markdown.test.ts` (existing) + new `ProfileEditor.test.tsx` asserting raw HTML insertion stays gated behind `SafeHtml` (no React unsafe-HTML-injection prop outside the audit pipeline) |
| **H15** | Editor is self-only by construction | `/me/edit` derives slug from `session.githubHandle` → `slugify()`. Server action does the same. Cross-user URL impossible. | `app/me/edit/page.test.tsx` (session A → slug A, never slug B); `save-profile.test.ts` (body's `slug` field, if present, ignored — session-slug used) |
| **H16** | SHA-CAS optimistic locking on save | `writeFile({expectedSha})`; orchestrator retries ONCE on 409. | `save-profile.test.ts` (409-once-retry-success path; 409-twice-abort path) |
| **H17** | Member attribution preserved in audit trail | Commit `Co-Authored-By: <gh-handle> <gh-handle@users.noreply.github.com>` trailer (§12.3.6). | `save-profile.test.ts` (snapshot of commit message format) |
| **H18** | Profile body size cap (64KB) | `SaveProfileSchema.body.max(65_536)`. | `lib/profile-editor.test.ts` (schema rejects 65_537-byte body; accepts 65_536-byte body) |
| **H19** | Frontmatter integrity across edits | Server action reads original frontmatter, preserves required keys verbatim; rejects save if required keys absent. | `save-profile.test.ts` (required-keys-present pass; required-keys-missing reject) |
| **H20** | Concurrent-edit UX | On 409 after retry, return `REFRESH_NEEDED`; UI shows "Someone else updated this — refresh." | `save-profile.test.ts` + ProfileEditor RTL on error message |
| **H21** | GDPR delete preserved | `/api/me/delete` (existing) still removes the profile file; editor doesn't bypass. | Extend `e2e/gdpr.spec.ts` (existing E2E surface — `/api/me/delete` has no unit test in v0.1.x) with edit-then-delete sequence |
| **H22** | Markdown link sanitization | Existing `lib/markdown.ts` strips unsafe URI schemes at render time. Editor inherits via pipeline. | `lib/markdown.test.ts` (existing); verify Preview tab uses the same pipeline |
| **H23** | Draft data stays local | localStorage key only; no server-side draft endpoint; no draft data logged. | `ProfileEditor.test.tsx` (no `fetch` calls on typing; localStorage round-trip works); grep-check for "draft" in server logs at code-review |
| **H24** | Server logs don't leak profile body | `save-profile` logs only `{slug, sha, success, error?: code}`. Mock logger; assert `body` never appears in log args. | `save-profile.test.ts` (mock logger; spy assertions on every log call) |

#### Project page contribution surface (thin A) — H25–H26

| ID | Invariant | Defender | Test surface |
|---|---|---|---|
| **H25** | Project-slug to commit-path mapping uses current path | `computeProjectContributions` keys by current path; renamed folders' pre-rename commits dropped from the new path. Documented behavior. | `lib/contributions.test.ts` (fixture extended with a rename scenario; assert pre-rename commits NOT in post-rename bucket) |
| **H26** | Bot commits excluded from per-project aggregation | Same `BOT_AUTHORS` set as existing `computeContributions` (line 18). Verify invariant holds under path-bucket. | `lib/contributions.test.ts` (commit by `warsaw-ai-bot` author with `projects/foo/x.md` → not in `_projectContributions[foo]`) |

#### GBrain link — H27–H28

| ID | Invariant | Defender | Test surface |
|---|---|---|---|
| **H27** | Referer not leaked to GBrain | `rel="noopener noreferrer" target="_blank"` on link element | `AskGBrainButton.test.tsx` (assert rel attribute + target on rendered `<a>`) |
| **H28** | Env-gated rendering | Component returns `null` when `GBRAIN_BASE_URL` unset/empty | `AskGBrainButton.test.tsx` (env unset → null; env empty string → null; env set → renders) |

#### Cross-cutting — H29

| ID | Invariant | Defender | Test surface |
|---|---|---|---|
| **H29** | Form CSRF protection | Auth.js JWT cookie + same-origin (Next.js server-action default). Document chain; test doesn't regress under future Next/Auth upgrade. | `save-profile.test.ts` (integration: cross-origin POST rejected by Next.js boundary) |

### 12.7 Components / files (~25 touched)

#### New TS source files (6)

| Path | Responsibility | Coverage gate |
|---|---|---|
| `app/me/edit/page.tsx` | Server component. Resolves slug from session; reads existing profile; handles file-missing → `/consent` redirect. ƒ Dynamic. | 80% |
| `app/components/ProfileEditor.tsx` | Client component. Textarea + Preview tab; localStorage drafts; save state. | **100% (strict-list)** |
| `app/actions/save-profile.ts` | Server action. Reads file, preserves frontmatter, writes via warsaw-ai-bot with HEAD-CAS; revalidates. | **100% (strict-list)** |
| `lib/profile-editor.ts` | Pure helpers: `SaveProfileSchema`, frontmatter-preserving compose, typed error code enum. ~80 lines. | **100% (strict-list)** |
| `app/components/TopContributors.tsx` | Server-renderable list of contributors per project. | **100% (strict-list)** |
| `app/components/AskGBrainButton.tsx` | Env-gated outbound link. | **100% (strict-list)** |

#### Modified TS files (7)

| Path | Change |
|---|---|
| `lib/contributions.ts` | Add `computeProjectContributions`, `ProjectContributions`, `ProjectContribution`, `TOP_CONTRIBUTORS_LIMIT` exports. |
| `scripts/build-contributions.ts` | Compute + write extended JSON shape (or sibling file per plan-writing decision). |
| `lib/content-snapshot.ts` | Surface `getProjectContributions(slug)` consumer helper; extend snapshot JSON type. |
| `lib/env.ts` | Add `GBRAIN_BASE_URL: z.string().url().optional()`. |
| `app/members/[slug]/page.tsx` | When `isSelf`, render "Edit profile" link to `/me/edit` (replaces line 67-69 fallback for self viewers). |
| `app/projects/[slug]/page.tsx` | Add `<TopContributors>` and `<AskGBrainButton>` sections. |
| `app/api/me/export/route.ts` | (Verify-only — re-fetch profile body at export time per D8; if existing implementation already re-fetches at request time, no diff.) |

#### Test files (8)

| Path | Coverage focus |
|---|---|
| `lib/profile-editor.test.ts` | **100%.** Schema, frontmatter preservation, compose snapshot, error-code typing. |
| `app/actions/save-profile.test.ts` | **100%.** Session derivation, file-missing redirect, CAS happy + 409-once + 409-twice-abort, commit message snapshot, revalidate calls, log discipline. |
| `app/me/edit/page.test.tsx` | RTL: non-roster → /no-access; roster + file → form; roster + no file → /consent. |
| `app/components/ProfileEditor.test.tsx` | **100%.** Edit/Preview tab toggle; localStorage restore + clear; save handler; cancel handler; Discard draft button. |
| `lib/contributions.test.ts` (extension) | `computeProjectContributions` happy, per-commit dedup, bot exclusion (H26), rename caveat (H25), top-N truncation. |
| `app/components/TopContributors.test.tsx` | **100%.** Empty list; full list; N-truncated list; links to `/members/<slug>`. |
| `app/components/AskGBrainButton.test.tsx` | **100%.** Env unset → null; env empty string → null; env set → renders with correct attributes. |
| `e2e/profile-editor.spec.ts` | Playwright: 6 scenarios (§12.8). |

#### Modified data/config files

| Path | Change |
|---|---|
| `.env.example` | Add `GBRAIN_BASE_URL=` placeholder with comment ("Leave unset to hide the 'Ask GBrain' button on /projects/[slug] pages"). |
| `CHANGELOG.md` | v0.2.0 entry. |
| `STATE.md` | Bump `phase` to "v0.2.0 shipped"; add `last_verified` rows. |

#### Routing + middleware

| Path | Change |
|---|---|
| `proxy.ts` | NO change. `/me/edit` is authenticated (standard route handling); not in `PUBLIC_PATHS`. |

### 12.8 Testing strategy

#### Unit tests

Per §12.7 table — every new source file at 100% (strict-list); extensions at ≥80% lines + branches.

**Hardening-specific tests (grep-verifiable):** every H14–H29 has a `describe("H<n>: <invariant>", …)` block in a relevant test file. DoD verifies the grep command in §12.6 returns 16 unique IDs.

#### Integration tests

- `save-profile.test.ts` mocks Octokit (existing `tests/fixtures/repo/` pattern from v0.1.1); asserts full call sequence (`readFile` → frontmatter parse → compose → `writeFile`); covers HEAD-CAS retry once.
- Build-time integration: `scripts/build-contributions.ts` against a fixture repo with synthetic commits; assert extended JSON shape + correct per-project bucketing.

#### E2E (Playwright)

New scenarios (build on existing v0.1.1 E2E pattern in `e2e/`):

1. **Roster member edits profile** → save → reload `/members/<slug>` → body updated.
2. **Concurrent edit conflict** — dual-tab; second-save sees `REFRESH_NEEDED` → UI message.
3. **Discard draft** — type body → navigate away → return → draft restored → click Discard → editor empty → reload → still empty.
4. **GDPR delete after edit** — edit profile → delete via `GdprPanel` → file removed → next `/me/edit` visit → `/consent` redirect (D4 / H21).
5. **Project page top contributors** — visit `/projects/community-platform` → see anton1rsod with N commits in Top Contributors section.
6. **GBrain link gating** — with `GBRAIN_BASE_URL` set in test env, link renders with correct attributes; without env, no link.

Recommend `pnpm e2e --retries=2` for closeout per CONSTRAINTS line 28 (Next 16 cold-start flakes).

#### Coverage targets

Per spec §8 + CONSTRAINTS line 27:

- Overall: 80% lines + branches.
- Strict-list additions (§12.7): 100% lines; branches ≥80% where defensive branches are unreachable post-guard (same accepted gap as v0.1.1 `lib/invitations.ts` per STATE.md line 37-38).

#### Reviewer agents

Per CONSTRAINTS lines 40-46:

- **`security-reviewer`** runs at end of editor implementation (`save-profile.ts` is a privileged-write surface; warrants explicit audit even if monthly cap is generous).
- **`typescript-reviewer` + `code-reviewer`** dispatched at v0.2.0 closeout if monthly Claude cap allows; otherwise CONSTRAINTS self-review checklist (lines 50-59) is the standing fallback per Phase 6 pattern.

### 12.9 Migration / release notes

#### 12.9.1 Pre-release tasks

NONE that are launch-blocking (D9). Optional:

- Set `GBRAIN_BASE_URL` on Vercel production + preview if GBrain prod URL is ready by v0.2.0 ship date. Otherwise leave unset — `AskGBrainButton` renders `null`, and the env var can be set later without a platform redeploy.
- Verify v0.1.1 invitation flow has propagated profile files for 5+ members beyond Anton + Mark (cosmetic — editor still works at any roster size).

#### 12.9.2 Ship-day runbook

1. Merge v0.2.0 PR (chat-12 plan's implementation).
2. Tag `community-platform-v0.2.0`.
3. Vercel auto-deploys (existing git-push integration; see GOTCHAS rows 1-2).
4. Smoke test:
   - Sign in as Anton → `/me/edit` → save a no-op body → verify commit lands on `main` → `/members/anton-safronov` shows updated body.
   - `/projects/community-platform` → Top Contributors card renders → Ask GBrain button renders iff `GBRAIN_BASE_URL` set.
5. Update `STATE.md`: `phase` → "v0.2.0 shipped", new `tag` row, refresh `last_verified` rows.
6. Append CHANGELOG entry.
7. Memory entry: `project_community_platform_v0_2_ship.md` with timeline, PR #, tag SHA.

#### 12.9.3 Forward-looking migration notes (v0.3+, NOT in v0.2 scope)

| Trigger | Migration |
|---|---|
| Cross-device drafts requested | §6.1 activates; drafts move to KV (per-handle, per-slug, 24h TTL); `ProfileEditor` reads + writes via fetch instead of localStorage |
| Image uploads in profile prose | New `/api/me/upload` endpoint + Vercel Blob (or similar); H23 extended to "no image data in localStorage" |
| Telegram handle field-level edit | Roster.md row mutation surface; needs admin/CM workflow (Option C territory) |
| Rate-limit observed abuse | §6.1 activates; KV per-IP throttle middleware on `save-profile` action |
| Per-project commit path-history shim | New `community/projects/renames.yaml` consulted by `computeProjectContributions` to merge pre/post-rename commits |
| Draft autosave for status posts (consistency) | Same draft pattern + storage scope; reusable abstraction |
| Cross-coupling beyond outbound links (e.g., GBrain Q&A embed) | Architectural ADR before any iframe / SSO / API integration; outbound link is the v0.2 precedent |
| Admin / CM-distinct UI (Option C deferred from chat-11) | v0.2.1 / v0.3 brainstorm; roster editor, member-ops UI, moderation surfaces |
| Next.js 16 Cache Components adoption | v0.3+ candidate: enable `cacheComponents: true` in `next.config.ts`; migrate `force-dynamic` pages + the build-time-snapshot pattern to `'use cache'` + `cacheTag` directives. Would enable `updateTag(profile-<slug>)` in the save action for **immediate** post-save freshness (eliminates the 60-90s rebuild-lag captured in §12.3.3). Substantial change touching `next.config.ts`, every snapshot-consuming page, the build pipeline, and reviewer surface — out of v0.2.0 scope. Reference: Next.js 16 Cache Components docs + `vercel:next-cache-components` skill. |

### 12.10 Definition of Done for v0.2.0

- [ ] All §12 sections committed (this section).
- [ ] All ~25 files implemented per §12.7.
- [ ] All 16 hardenings (H14–H29) tested with `H<n>:` prefix; grep (§12.6) returns 16 unique IDs.
- [ ] Coverage gates met (80% overall, 100% on §12.7 strict-list additions).
- [ ] E2E green with `--retries=2`.
- [ ] §12.9.2 ship-day runbook executed.
- [ ] PR merged to `main`; `CHANGELOG.md`, `STATE.md` updated.
- [ ] Tag `community-platform-v0.2.0` pushed.
- [ ] Production smoke (§12.9.2 step 4) passes.
- [ ] Memory entry `project_community_platform_v0_2_ship.md` written.

## 13. v0.3.0 — Discovery+ (meeting + event surfacing, /home activity feed, RSVP, GCal feed)

> **Scope:** v0.3.0 release. 100% git (per §5 + CONSTRAINTS line 10), no DB / KV. §6.1 classification rule stays dormant.
> **Brainstormed:** 2026-05-16 via `superpowers:brainstorming` (chat 17).
> **Closes:** none from §11/§12 forward-looking rows; opens new entry points (`/home` as a content surface; `/events` and `/meetings` indexes; event RSVP affordance; ICS subscribe feed).
> **Locked decisions:** Q1–Q6 + D1–D18 from chat-17; applied below.
> **Versioning:** single v0.3.0 ship. Plan-writing (chat 18) has standing authority to re-split into v0.3.0 + v0.3.1 if implementation estimate exceeds 50 tasks OR 2 weeks elapsed wall-time; default split point if forced = (v0.3.0 = meeting + event surfacing + /home + L2 + GCal V-static / v0.3.1 = event RSVP L3).
> **Hardening ID namespace:** §13 uses **H30–H55** (continues from §12's H14–H29 to avoid cross-section grep collisions). 26 IDs (H53–H55 added in chat-17 self-review for modern-platform fold-in: Kudos, RSVP tri-state, roster privacy, PWA).

### 13.1 Locked decisions

| ID | Lock | Decision |
|---|---|---|
| Q1 | Primary thrust | Ambitious Hardened A1 — Discovery+ v0.3 = B (meeting surfacing) + A (events surface) + L1 (unified /home feed) + L2 (/this-week strip) + L3 (event RSVP) + V-static (GCal ICS feed) |
| Q2 | §6.1 classification trigger | NO. 100% git stays. §6.1 stays dormant. v0.3 adds build-time-generated derived indexes; no per-request DB/KV state. RSVP writes go through the v0.2 SHA-passthrough write path on the member's profile.md |
| Q3 | Telegram bridge | NO. Defer to v0.4 (separate thread). Telegram-handle-on-profile dropped from this brainstorm in favor of L1 unified /home feed (chat-17 hardening pass) |
| Q4 | Status gamification | NO. Cultural risk too high (charter is collaborative; gamification is competitive). v0.3 ships discovery + member-action (RSVP); engagement via social proof, not leaderboards |
| Q5 | Google Calendar integration | V-static only — generate ICS from git frontmatter + serve a subscribable feed at `/api/calendar.ics`. NO GCal API pull (changes source-of-truth; defer to v0.4 bundled with Telegram bridge if pursued). Community confirmed (chat-17): personal GCals, no shared one → V-static fits |
| Q6 | Versioning | Single v0.3.0 ship; plan-writing may re-split per trigger criteria above |
| D1 | /home feed layout | D — This-Week Roll-up (time-anchored: "This Week" + "Recent"; bounded scroll). Rejected: A (vertical timeline, unbounded), B (categorized panels, no temporal anchor) |
| D2 | "This Week" definition | Current calendar week (Mon-Sun, Europe/Warsaw) for meetings; + 14-day forward window for upcoming events |
| D3 | "Recent" definition | Last 30 days, EXCLUDING the This-Week window |
| D4 | Feed empty states | Per-section: "Nothing scheduled this week — browse all events." with link to `/events`. Never render an empty section block silently |
| D5 | "This Week" item shape | Type icon + bold title (link to detail) + relative time (`Today`, `Tue`) + 1-line summary excerpt |
| D6 | "Recent" item shape | Compact one-liner: icon + title (link) + author (where applicable) + relative time |
| D7 | /this-week L2 placement | Strip mounted ABOVE the status compose box (content-as-prompt flow). Single `HomeFeed` component, two pages (`/home`, `/this-week`) |
| D8 | /meetings index | Reverse-chronological list grouped by month. No pagination v0.3 (revisit at ~50 entries) |
| D9 | /events index | "Upcoming" section (nearest first) + "Past" section (reverse chronological). No pagination v0.3 |
| D10 | Event RSVP UI | B — prominent CTA below event title (toggles "Mark as Going" ↔ "✓ Going"). Roster as avatar grid below event content |
| D11 | RSVP state | TRI-STATE: `events_going` (committed) OR `events_interested` (soft signal) OR absent (no signal). Mutually exclusive per slug. Reversal-pass on initial binary lock (chat-17 self-review): "Interested" tier is widely validated on modern event platforms (Lu.ma, Eventbrite, FB Events) and captures the most common pre-event state |
| D12 | RSVP roster visibility | Per-member, profile-frontmatter-configurable via `event_rsvp_visibility: "public" \| "members_only"`. NEW RSVPs from v0.3 forward default to `"members_only"` (chat-17 self-review: trust posture is opt-in for event-attendance visibility). Existing public `/members/[slug]` directory itself stays public for v0.1 precedent; event-attendance is a finer-grained opt-in |
| D13 | Avatar fallback | Initials when profile photo absent (existing v0.1 pattern) |
| D14 | GCal integration shape | V-static — ICS generation from git frontmatter only. No GCal API |
| D15 | ICS subscribe URL | `/api/calendar.ics` (public, cache-controlled, build-time-generated artifact) |
| D16 | Add-to-Calendar buttons | On `/meetings/[slug]` + `/events/[slug]` detail pages. Triggers download of a single-event `.ics` file |
| D17 | Frontmatter additions | Meeting + event notes add `start_time`, `duration_minutes`, `location` (all optional). Defaults via community-defaults file |
| D18 | Community defaults | `community/community-defaults.yaml` (new) — keys: `meeting_default_time`, `meeting_default_duration`, `meeting_default_location`, `events.*` equivalents, `timezone`. Used when frontmatter omits the field |
| D19 | Member-to-member recognition (Kudos / Thanks) | `+ Thanks` affordance on status posts, contributions, and meeting notes. Stored in giver's profile frontmatter `thanks_given: [{recipient, item_type, item_id, given_at}]`. Aggregated build-time → `lib/__generated__/kudos.json`. Displayed on `/members/[slug]` as "Thanked N times" + per-item button state. Recognition primitive (no leaderboard surface — explicitly distinct from Q4-rejected gamification) |
| D20 | PWA manifest | `public/manifest.json` + 192/512 icons + `<link rel="manifest">` via Next 16 `metadata.manifest` in `app/layout.tsx`. Installable on mobile/desktop. NO service worker / offline mode v0.3 (Next.js default caching is sufficient); installability is the goal |

**§6.1 dormancy preserved.** All v0.3 surfaces read derived data computed at build time. `events_going` lists are stored in member profiles (git, not DB). RSVP toggles use v0.2.2's SHA-passthrough write contract on member profile files.

**Telegram-handle-on-profile dropped** (chat-17 hardening pass): originally proposed as the v0.3 tag-along; replaced by the L1 unified /home feed which addresses the same "drive engagement" weakness with stronger spec coherence. Telegram bridge belongs to v0.4 if pursued.

### 13.2 Architecture

v0.3.0 extends v0.1.x + v0.2.x surfaces; no new infrastructure. New env vars: NONE (community defaults configured in-repo YAML).

```
┌──────────────────────────────────────────────────┐
│  Existing v0.1.x / v0.2.x surfaces (unchanged)   │
│  • Auth, proxy.ts, lib/markdown.ts + SafeHtml    │
│  • lib/github-app.ts (warsaw-ai-bot writer):     │
│      readFile, writeFile, getHeadSha (SHA-CAS)   │
│  • lib/content-snapshot.ts (build-time JSON)     │
│  • lib/contributions.ts (4-count per member)     │
│  • lib/profile-editor.ts (v0.2 SaveProfileSchema │
│      + SHA-passthrough write contract)           │
│  • app/actions/save-profile.ts (v0.2.2 SHA       │
│      passthrough; reused for events_going write) │
└─────────────────┬────────────────────────────────┘
                  │
                  ▼ v0.3.0 additions
┌──────────────────────────────────────────────────┐
│  lib/events.ts (new)                             │
│  • Frontmatter validator (date, slug, time)     │
│  • EventSlug branded type                        │
│  • Event reader (community/events/*/README.md)   │
│  • Orphan-slug filter (H34, H39)                 │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│  lib/meetings.ts (new — extract from existing)   │
│  • Meeting reader + frontmatter validator        │
│  • Date-grouping helper for index page           │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│  lib/home-feed.ts (new)                          │
│  • Aggregator: meetings + events + statuses +    │
│    contributions → { thisWeek, recent } shape    │
│  • Pure function over content-snapshot           │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│  lib/ical.ts (new)                               │
│  • ICS generation (RFC 5545) via `ics` npm pkg   │
│  • Frontmatter → VEVENT mapping                  │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│  lib/__generated__/event-rosters.json (new)      │
│  • Build-time derived: {<event-slug>: [<slug>…]} │
│  • Source: roster's events_going arrays          │
│                                                  │
│  lib/__generated__/calendar.ics (new)            │
│  • Build-time aggregate ICS for /api endpoint    │
└──────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────┐
│  /home          (rewrite: SSG → HomeFeed)        │
│  /this-week     (extend: HomeFeed strip above)   │
│  /events        (new ƒ SSG: events index)        │
│  /events/[slug] (new ƒ SSG: detail + RSVP UI)    │
│  /meetings      (new ƒ SSG: meetings index)      │
│  /api/calendar.ics  (new: serves build-time      │
│                      artifact w/ cache headers)  │
└──────────────────────────────────────────────────┘
```

Five architectural pillars (analog to §11.1, §12.2):

1. **Build-time aggregation, not per-request.** `lib/home-feed.ts` runs as part of the existing snapshot pipeline; serves derived `{ thisWeek, recent }` from `content-snapshot.json`. No per-request git read; no per-request roster scan. `event-rosters.json` and `calendar.ics` are built the same way (H32, H38, H48).
2. **RSVP reuses v0.2 save-profile contract.** `events_going` is a frontmatter field in `community/members/<slug>.md`. The `rsvp-event` server action thin-wraps `save-profile.ts`'s SHA-passthrough write pattern — same lost-update protection (v0.2.2; H31, H40), same audit trail (member `Co-Authored-By`), same revalidation lag UX (60-90s rebuild before roster surfaces refresh on `/events/[slug]`).
3. **RSVP state is binary by construction.** `events_going: [slug]` — slug present means going; absence means not-going. No `maybe` state, no per-event timestamp on profile (commit history holds the timestamp). Reversal-cost analysis: adding richer states later requires a frontmatter migration; we accept that cost iff member feedback explicitly demands it.
4. **ICS feed is build-time generated; route serves the artifact.** `/api/calendar.ics` is a Route Handler (not SSG, because it must return `Content-Type: text/calendar` with cache headers) that reads `lib/__generated__/calendar.ics` (text file). Build pipeline emits the .ics from the same `lib/ical.ts` used by per-event AddToCalendarButton.
5. **Build reliability is a v0.3 invariant.** v0.3 adds at least one new npm dependency (`ics` for ICS generation). Per chat-17 finding (gbrain PR #14, 15 days of broken production builds via `@grammyjs/types` + transitive `@types/aws-lambda`), `projects/community-platform/tsconfig.json` MUST scope `types` to prevent implicit `@types/*` loading. See §13.7.

**Alternatives considered + rejected:**
- GCal API pull / OAuth-bind a service account (Q5 → defers to v0.4; changes source-of-truth and adds Vercel env-var surface for API keys)
- "Maybe" / "not-going" RSVP states (D11 → YAGNI; reversal cost real)
- Telegram-handle-on-profile (originally chat-17 tag-along; dropped → replaced by L1 unified feed)
- Per-event RSVP timestamps in profile frontmatter (D11 → only `events_going: [slug]` list; commit history holds the timestamp via member's profile.md commits)
- Status streak / leaderboard (Q4 → cultural risk; charter is collaborative not competitive)
- iframe-embed of public GCal (Q5 V-embed → no; dual source-of-truth between git and external GCal)
- Vertical timeline `/home` (D1 → unbounded scroll grows with project activity; chose D for week-bounded scannability)

### 13.3 Meeting surfacing (B)

#### 13.3.1 Routing

- New route: `app/meetings/page.tsx` — meetings index (currently only `/meetings/[slug]` exists per v0.1's 8 SSG routes). SSG, no `auth()` read.
- Existing route: `app/meetings/[slug]/page.tsx` — extended to render extended frontmatter (start_time, duration, location) and surface `<AddToCalendarButton>`.

#### 13.3.2 Meeting frontmatter (extended; additive migration)

```yaml
---
date: 2026-05-19           # required, ISO 8601, must match filename
title: "Weekly sync"        # required
start_time: "18:00"        # optional, HH:MM 24h Europe/Warsaw; falls back to community-defaults
duration_minutes: 60       # optional; falls back to community-defaults
location: "Telegram #voice" # optional; falls back to community-defaults
host: "anton1rsod"          # optional, GitHub handle
attendees: ["anton1rsod"]  # optional, GitHub handles
---
```

Migration posture (additive): existing meeting notes lacking `start_time` / `duration_minutes` / `location` continue to render and to be aggregated by `/home`; ICS generation uses community defaults for missing fields. No backfill blocker. `community/meetings/weekly/_template.md` updated with commented-out slots so future notes adopt the extended shape.

#### 13.3.3 /meetings index page

`app/meetings/page.tsx`:

- Server component, SSG (`force-static`).
- Reads via `lib/meetings.ts:listMeetings()` from content-snapshot.
- Renders header + month-grouped list (reverse chrono).
- Each row: date · title link to `/meetings/[slug]` · 1-line summary excerpt.
- Empty state: "No meetings yet. The next sync will appear here once the first meeting note lands." with link to `community/meetings/weekly/_template.md` (GitHub web URL).
- Top-right: "Subscribe to calendar (ICS)" link to `/api/calendar.ics` (D15).

#### 13.3.4 /meetings/[slug] extension

Existing detail page extended:
- Render `start_time`, `duration_minutes`, `location` if present in frontmatter.
- Add `<AddToCalendarButton meeting={meeting}>` near the header (D16).
- No layout overhaul; surgical additions.

### 13.4 Events surface + RSVP (A + L3)

#### 13.4.1 Events folder convention (formalized from existing `community/events/README.md`)

- Folder: `community/events/YYYY-MM-DD-slug/` (validated; H44).
- Files:
  - `README.md` — main content + frontmatter (REQUIRED).
  - `pitch.md` — original proposal (optional).
  - `outcomes.md` — `#kb` outcomes (optional).
  - `artifacts/` — files (optional).

v0.3 reads `README.md` for surfacing. `pitch.md` / `outcomes.md` are surfaced as sub-section links on the detail page only.

`community/events/_template/README.md` (new) mirrors the meetings template.

#### 13.4.2 Event frontmatter (new)

```yaml
---
date: 2026-06-15              # required, ISO 8601, must match folder name
slug: "ai-hackathon-kickoff"  # required, must match folder slug
title: "AI Hackathon Kickoff" # required
start_time: "18:00"           # optional, falls back to community-defaults
duration_minutes: 180         # optional, falls back to community-defaults
location: "Quointelligence office" # optional, falls back to community-defaults
host: "anton1rsod"            # optional
url: "https://..."            # optional — RSVP link or external page
status: "scheduled"           # optional: scheduled (default) | cancelled | completed
---
```

`EventSlug` branded type in `lib/events.ts` validates: format `YYYY-MM-DD-<kebab>`, date parseable, folder name matches frontmatter slug (H42).

#### 13.4.3 /events index page

`app/events/page.tsx`:

- SSG (`force-static`).
- Two sections rendered in order:
  1. **Upcoming** — `date >= today` (build time), nearest first. Each row: date · title link · `[N] going` count badge derived from `event-rosters.json`.
  2. **Past** — `date < today` (build time), reverse chronological. Each row: date · title link · `[N] went` count.
- Empty states: "No upcoming events" / "No past events yet" inline.
- Top-right: "Subscribe to calendar (ICS)" link to `/api/calendar.ics`.

#### 13.4.4 /events/[slug] detail page

`app/events/[slug]/page.tsx`:

- SSG with `generateStaticParams()` enumerating event folders.
- Renders: frontmatter metadata (date, time, location, host), `<EventRsvpButton>` below title (D10), body content via `lib/markdown.ts`, `<EventRoster>` below content, `<AddToCalendarButton event={event}>` near header.
- Sub-section links to `pitch.md` / `outcomes.md` if those files exist in the folder.
- 404 handled gracefully (H34): if slug appears in any member's `events_going` but folder is missing, profile page renders with the orphan slug filtered.

#### 13.4.5 EventRsvpButton component

`app/components/EventRsvpButton.tsx` (client component, `"use client"`):

```typescript
interface EventRsvpButtonProps {
  eventSlug: EventSlug;
  initialState: "going" | "interested" | "none" | "not-signed-in";
  memberSlug?: string;  // undefined when not-signed-in
  profileSha?: string;  // required when signed in (SHA-passthrough; H31)
}
```

Tri-state UI per D11 (two adjacent buttons): `[Going]` + `[Interested]`. Mutually exclusive — member is in `events_going` OR `events_interested`, never both. Click on a non-active button transitions through `rsvp-event` action with `desiredState`.

States (signed in):
- `"none"`: both buttons inactive. Click `Going` → desiredState="going"; click `Interested` → desiredState="interested".
- `"going"`: `[✓ Going]` active (green). Click `[✓ Going]` → desiredState="none" (clears). Click `[Interested]` → desiredState="interested" (atomic switch via mutual exclusion).
- `"interested"`: `[★ Interested]` active (amber). Click `[★ Interested]` → desiredState="none". Click `[Going]` → desiredState="going" (atomic switch).
- `"not-signed-in"`: renders disabled-styled link "Sign in to RSVP" → `/login?callbackUrl=/events/<slug>`.

Optimistic UI: flip immediately on click; revert on action error. On 409 SHA conflict: revert + show "Someone else updated your profile — refresh." inline.

#### 13.4.6 rsvp-event server action

`app/actions/rsvp-event.ts`:

Input: `{eventSlug: EventSlug, desiredState: "going" | "interested" | "none", profileSha: string}`.

1. `await auth()` → `session.githubHandle` (else `not_authenticated`).
2. `findMemberByHandle(handle)` → resolve `slug` (else `not_a_member`).
3. Validate `eventSlug` is known: `isKnownEventSlug(eventSlug)` against current events list (H37). Else return `event_not_found`.
4. Thin-wrap `save-profile` write path:
   - Read profile via `client().readFile(profilePath(slug))` → capture `{content, sha}`.
   - Parse frontmatter; read `events_going` AND `events_interested` arrays (defaults `[]`).
   - **Mutual exclusion reconciliation:** remove `eventSlug` from BOTH arrays first. If `desiredState === "going"`, add to `events_going`. If `desiredState === "interested"`, add to `events_interested`. If `desiredState === "none"`, leave removed from both. Idempotent regardless of prior state.
   - If frontmatter lacks `event_rsvp_visibility` (first RSVP from v0.3 forward), set it to `"members_only"` per D12 (H46).
   - Serialize new frontmatter; preserve body verbatim.
   - `client().writeFile(profilePath(slug), newContent, {message, expectedSha: <step-4-sha>})`.
5. On `sha_conflict` (409): NO retry (per v0.2.2 contract; H40) — return `REFRESH_NEEDED`.
6. On success: `revalidatePath("/events/" + eventSlug)`, `revalidatePath("/members/" + slug)`. Return `{ok: true, state: desiredState}`.
7. Log discipline: log only `{slug, eventSlug, desiredState, prior_state, sha, success, error?: code}`. No body content logged.

Commit message:
```
chore(community): @<gh-handle> RSVP <going|interested|none> "<event-slug>"

Co-Authored-By: <gh-handle> <gh-handle@users.noreply.github.com>
```

#### 13.4.7 EventRoster component

`app/components/EventRoster.tsx` (server component):

```typescript
interface EventRosterProps {
  eventSlug: EventSlug;
}
```

Renders two sub-rosters per D11 tri-state + D12 privacy:
- **Going (N total)** — public avatar grid of members whose `event_rsvp_visibility === "public"` + count badge `+ M members (sign in to see)` for hidden (`"members_only"`) members. The hidden-count CTA links to `/login?callbackUrl=/events/<slug>`.
- **Interested (P total)** — same shape; styled distinctly (amber accent vs green for Going).
- Avatar grid: 5-wide responsive; each tile links to `/members/[slug]`.
- Reads from `lib/__generated__/event-rosters.json` (build-time derived; H32).
- Empty states: "No one's marked going yet — be the first." / "No one's marked interested yet."

`event-rosters.json` shape per event:

```json
{
  "<event-slug>": {
    "going": { "publicSlugs": ["..."], "hiddenCount": N },
    "interested": { "publicSlugs": ["..."], "hiddenCount": M }
  }
}
```

The split keeps `/events/[slug]` SSG (no auth read on page). Reveal-on-auth UX (whether hidden names appear after sign-in) is locked at plan-writing per O6. Options: (a) keep SSG with sign-in CTA hint only, (b) add a Dynamic auth-aware roster route, (c) client-side fetch after hydration. Default: (a) — simplest, ships v0.3.

Public visibility posture: `/members/[slug]` directory itself remains public per v0.1.x precedent (D12 amendment); event-attendance is the new finer-grained opt-in.

#### 13.4.8 events_going + events_interested + event_rsvp_visibility fields on member profile

Frontmatter additions to `community/members/<slug>.md`:

```yaml
events_going: ["2026-06-15-ai-hackathon-kickoff", ...]      # optional, default []
events_interested: ["2026-07-04-some-other-event", ...]    # optional, default []  (D11 tri-state)
event_rsvp_visibility: "members_only"                       # optional: "public" | "members_only"; default "members_only" for new RSVPs from v0.3 forward (D12)
```

Migration: members without these fields don't break — absence equals empty array (slug lists) OR `"members_only"` (visibility default, applied on first write).

**Mutual exclusion invariant (D11):** for any given `eventSlug`, the member is in EITHER `events_going` OR `events_interested`, never both. Server action enforces (§13.4.6 step 4). Plan-writing adds a profile-validator check in `lib/profile-editor.ts` that flags violations at save time.

Stale-slug protection (H39 — extended to both arrays): build-time `scripts/build-event-rosters.ts` only includes slugs present in `community/events/`; orphan slugs are filtered out of both `events_going` and `events_interested` for roster purposes. Member profile may temporarily contain a stale slug after an event folder is deleted — no harm done (next save by the member cleans up).

### 13.5 Unified /home feed + /this-week strip (L1 + L2)

#### 13.5.1 HomeFeed component

`app/components/HomeFeed.tsx` (server component):

```typescript
interface HomeFeedProps {
  feed: HomeFeedData;
  showRecent?: boolean;  // default true; /this-week strip sets false
}

interface HomeFeedData {
  thisWeek: FeedItem[];
  recent: FeedItem[];
}

interface FeedItem {
  type: "meeting" | "event" | "status" | "contribution";
  slug: string;          // for link target
  title: string;
  href: string;          // resolved link
  date: string;          // ISO 8601
  author?: string;       // GitHub handle (status, contribution)
  excerpt?: string;      // 1-line, for "This Week" section only
}
```

Renders the D layout: "THIS WEEK" header → "This Week" items in D5 shape (bold + type icon + relative-time + excerpt) → "RECENT" header → "Recent" items in D6 shape (compact + icon + title + author + relative-time). Icon strategy locked at plan-writing (SVG over emoji recommended for accessibility; let plan-writing finalize).

#### 13.5.2 home-feed aggregator

`lib/home-feed.ts:computeHomeFeed()`:

Pure function over content-snapshot. Inputs: meetings list, events list, status posts list, contributions list. Output: `HomeFeedData`.

This-Week bucket (D2):
- Meetings with `date` in current calendar week (Mon-Sun, Europe/Warsaw).
- Events with `date` in next 14 days from `now()`.

Recent bucket (D3):
- Items with `date` in last 30 days, EXCLUDING the This-Week window.
- Sort desc by date; cap at 10 items.

`now()` is computed at build time (call time of `computeHomeFeed`). Build cadence: every git push triggers a Vercel deploy → snapshot refresh → fresh `now()`. Acceptable freshness lag (60-90s rebuild window per v0.2's pattern).

#### 13.5.3 /home page rewrite

`app/home/page.tsx`:
- Existing implementation inspected by plan-writing to determine diff scope; rewrite replaces page body with `<HomeFeed feed={feed}>`.
- SSG (`force-static`). No `auth()` read (anonymous visitor sees the same feed — public-by-default; H30).
- If current `/home` is in `proxy.ts` PUBLIC_PATHS, no change. If not, plan-writing locks (O3).
- Empty states: per-section "Nothing scheduled this week — browse all events" link to `/events`.

#### 13.5.4 /this-week L2 strip

`app/this-week/page.tsx` extension:
- Mount `<HomeFeed feed={feed} showRecent={false}>` ABOVE the existing status compose box (D7).
- Pass only the This-Week bucket; do not render Recent (avoid duplicating the status list which is the page's primary content).
- Empty state (H45): if This-Week is empty, render nothing — no "Nothing happening" label between compose and post list.

### 13.6 GCal V-static

#### 13.6.1 lib/ical.ts

```typescript
// Pseudocode shape; plan-writing finalizes
import { createEvents, type EventAttributes } from "ics";

export interface IcsEvent {
  uid: string;        // stable: "meeting-<slug>" or "event-<slug>"
  title: string;
  start: EventAttributes["start"];
  duration: { minutes: number };
  location?: string;
  description?: string;
  url?: string;       // canonical URL on platform
}

export function meetingToIcsEvent(meeting: Meeting, defaults: CommunityDefaults): IcsEvent { ... }
export function eventToIcsEvent(event: Event, defaults: CommunityDefaults): IcsEvent { ... }
export function generateIcs(events: IcsEvent[]): string { ... }  // returns RFC 5545 string
```

Plan-writing locks the specific `ics` package version (latest stable on npm); type-completeness vetted per §13.7.2 checklist (H52).

#### 13.6.2 Community defaults

`community/community-defaults.yaml` (new):

```yaml
timezone: "Europe/Warsaw"
meetings:
  default_start_time: "18:00"
  default_duration_minutes: 60
  default_location: "Telegram #voice"
events:
  default_start_time: "18:00"
  default_duration_minutes: 120
  default_location: "TBD — see event description"
```

Read by `lib/ical.ts` and `lib/community-defaults.ts` when frontmatter omits the field (H49). Plan-writing may choose JSON instead of YAML for tighter Zod validation (O5).

#### 13.6.3 /api/calendar.ics route

`app/api/calendar.ics/route.ts`:

```typescript
import { readFile } from "node:fs/promises";

export async function GET() {
  const ics = await readFile("lib/__generated__/calendar.ics", "utf-8");
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
```

Build step: `scripts/build-calendar.ts` generates `lib/__generated__/calendar.ics` aggregating all upcoming meetings + events (past items excluded after 30 days to keep the file small). Plan-writing locks whether this route is `force-static` or `force-dynamic` based on Vercel route-handler constraints (H48).

Public (no auth gate); must be in `proxy.ts` PUBLIC_PATHS (O4).

#### 13.6.4 AddToCalendarButton component

`app/components/AddToCalendarButton.tsx` (client component for download trigger):

```typescript
interface AddToCalendarButtonProps {
  ics: string;          // pre-rendered single-event ICS string (server-rendered)
  filename: string;     // e.g., "weekly-sync-2026-05-19.ics"
}
```

Renders a button that triggers a client-side download of the inline `ics` prop (no server round-trip). Pre-rendering the ICS string on the server avoids leaking event-detail data into per-click API requests and keeps the click responsive.

#### 13.6.5 Subscribe URL UX

`/events` and `/meetings` index pages each surface a "Subscribe to calendar (ICS)" link pointing to `/api/calendar.ics`. Subtitle: "Add to Google Calendar, Apple Calendar, or any ICS-compatible app."

### 13.7 Build reliability + dependency vetting

**Trigger.** Chat-17 investigation found gbrain production builds had been broken for 15 days (2026-05-01 → 2026-05-16) via two transitive type-dep failures: `@grammyjs/types` (Deno-targeted, no `.d.ts` in the published tarball) and `@types/aws-lambda` (auto-loaded by TypeScript when `tsconfig.json` has no `types` field). Fixed in PR #14 with an ambient module shim + `"types": ["node"]`.

v0.3 adds at least one new npm dependency (`ics` for V-static GCal). Without proactive scoping, the same failure mode can bite community-platform.

#### 13.7.1 tsconfig types scoping (H50)

`projects/community-platform/tsconfig.json` adds (verify; current state may already be partially scoped):

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

Effect: prevents implicit loading of every `@types/*` package. Explicit imports (`import type { X } from "some-types"`) still work. If a test framework needs auto-loading (e.g., `vitest/globals`), it's added to the array (`["node", "vitest/globals"]`).

#### 13.7.2 Dependency vetting checklist (plan-writing input; H52)

For each new npm dep proposed by v0.3 implementation:

- [ ] Ships `.d.ts` in the published tarball (verify via `npm pack <pkg> --dry-run` or by inspecting the tarball after install).
- [ ] No transitive `@types/*` that conflict with the explicit `types` scope.
- [ ] `pnpm typecheck` passes on a fresh `pnpm install` (CI test; H51).
- [ ] `pnpm build` passes on a Vercel preview before merge.

Candidate ICS generator: `ics` (npm, MIT). Pre-vetted shape: ships `.d.ts`, no transitive `@types/*`, ~5KB minified. Plan-writing locks the final choice (and version) after running the checklist (O1).

#### 13.7.3 GOTCHAS row 9 (committed alongside §13)

A new row appended to `projects/community-platform/GOTCHAS.md` captures the transitive-types failure pattern recovered in gbrain PR #14. Grep-recoverable for future ops.

### 13.8 Threat model + hardenings (H30–H52)

H30–H55 are the testable invariants every v0.3 code change preserves. Each maps to a `describe("H<n>: …")` block per HANDOFF_PROTOCOL §4. 26 IDs total (H53–H55 added in chat-17 self-review for modern-platform fold-in: Kudos atomicity + aggregator, PWA manifest). Grep verification at DoD:

```bash
grep -rn 'describe("H3[0-9]:\|describe("H4[0-9]:\|describe("H5[0-5]:' \
  projects/community-platform/tests \
  projects/community-platform/lib \
  projects/community-platform/app \
  | sed 's/.*describe("\(H[0-9]\+\):.*/\1/' | sort -u | wc -l
# Expected: 26
```

#### /home unified feed (L1) — H30, H33, H38, H41

| ID | Invariant | Defender | Test surface |
|---|---|---|---|
| **H30** | `/home` feed is SSG; no `auth()` read | `force-static` directive; `HomeFeed` is a pure server component over snapshot data | `app/home/page.test.tsx` (build-time render; no session-derived branches) |
| **H33** | Empty states tested per section | `HomeFeed` renders empty-section copy or skips section (D4) | `HomeFeed.test.tsx` (empty `thisWeek`; empty `recent`; both empty) |
| **H38** | Feed data freshness via build pipeline | `computeHomeFeed` runs in the snapshot prebuild phase; no per-request git read | `lib/home-feed.test.ts` (pure function over snapshot input; integration test asserts called from build script) |
| **H41** | Performance — `/home` LCP doesn't regress beyond v0.2 baseline | Lighthouse CI assertion on `/home` mobile + desktop; baseline = v0.2 (99 mobile / 100 desktop per STATE row `lighthouse_baseline_login`) | `e2e/lighthouse-home.spec.ts` (new); thresholds enforced |

#### RSVP (L3) — H31, H32, H34, H37, H39, H40

| ID | Invariant | Defender | Test surface |
|---|---|---|---|
| **H31** | RSVP write SHA-gated (v0.2.2 contract reused) | `rsvp-event` action uses `client().writeFile({expectedSha})`; on 409 returns `REFRESH_NEEDED` (NO retry per v0.2.2 lost-update fix) | `rsvp-event.test.ts` (mock Octokit 200; 409 → REFRESH_NEEDED) |
| **H32** | Event roster reads from generated index, not roster scan | `EventRoster` reads `lib/__generated__/event-rosters.json`; no per-request `listMembers()` call | `EventRoster.test.tsx` (no network/git calls during render); build pipeline integration |
| **H34** | Stale slug in member profile renders gracefully | `lib/events.ts:isKnownEventSlug()` filters orphans; profile page skips struck-through orphan slugs | `events.test.ts` (orphan slug → filtered); `app/members/[slug]/page.test.tsx` (member with orphan slug renders without throw) |
| **H37** | RSVP write validates event slug exists | `rsvp-event` action calls `isKnownEventSlug(eventSlug)` before any write; returns `event_not_found` if absent | `rsvp-event.test.ts` (unknown slug → error code) |
| **H39** | Event removal doesn't corrupt member profiles | Members may have stale slugs in `events_going`; reads filter, writes preserve (until member next saves) | `events.test.ts` (orphan slug retained on read; profile unchanged) |
| **H40** | Concurrent RSVP race uses v0.2.2 SHA passthrough | Same code path as `save-profile`; conflict surface = same `REFRESH_NEEDED` | `rsvp-event.test.ts` (concurrent edit scenario) |

#### Events surface (A) — H35, H42, H44

| ID | Invariant | Defender | Test surface |
|---|---|---|---|
| **H35** | Strict-list 100% lines: `lib/events.ts`, `app/events/page.tsx`, `app/events/[slug]/page.tsx`, `EventRsvpButton.tsx`, `EventRoster.tsx`, `rsvp-event.ts` | Strict-list discipline per §12.7 pattern | Per-file `.test.ts(x)` |
| **H42** | `EventSlug` branded type enforces format | Validator: `YYYY-MM-DD-<kebab>`, date parseable, folder name matches frontmatter slug | `events.test.ts` (valid + invalid samples) |
| **H44** | Events folder structure validated in CI | CI test fails if `community/events/X/` doesn't match `YYYY-MM-DD-slug/` shape | `scripts/validate-events-folders.ts` (new); CI step |

#### Meetings surface (B) — H36

| ID | Invariant | Defender | Test surface |
|---|---|---|---|
| **H36** | Strict-list 100% lines: `lib/meetings.ts`, `lib/home-feed.ts`, `HomeFeed.tsx`, `app/meetings/page.tsx`, `app/home/page.tsx` | Strict-list discipline | Per-file tests |

#### Cross-cutting — H43, H45, H46

| ID | Invariant | Defender | Test surface |
|---|---|---|---|
| **H43** | All rendered titles + excerpts via `SafeHtml` pipeline | `HomeFeed` renders markdown via existing audit boundary (CONSTRAINTS line 20) | `HomeFeed.test.tsx` (script tag in title → escaped) |
| **H45** | `/this-week` L2 strip empty-state | When feed empty, strip hides (no "Nothing happening" between compose + post list) | `this-week/page.test.tsx` (empty feed scenario) |
| **H46** | Roster visibility posture per-member configurable | Per-member `event_rsvp_visibility` profile field (D12); new RSVPs default to `"members_only"` set by `rsvp-event` action on first write; `/members/[slug]` directory remains public per v0.1.x precedent | `rsvp-event.test.ts` (first-RSVP defaults applied); `events.test.ts` (rosters filter by visibility) |

#### GCal V-static — H47, H48, H49

| ID | Invariant | Defender | Test surface |
|---|---|---|---|
| **H47** | ICS output is RFC 5545 valid | Use `ics` npm package; assert via structural checks on key VEVENT properties | `lib/ical.test.ts` (snapshot + structural assertions) |
| **H48** | `/api/calendar.ics` serves build-time artifact, cache-controlled | Route handler reads `lib/__generated__/calendar.ics`; `Cache-Control: public, max-age=300, s-maxage=300` | `app/api/calendar.ics/route.test.ts` (response shape + headers) |
| **H49** | Frontmatter migration is additive | `lib/ical.ts` falls back to community-defaults when frontmatter omits `start_time` / `duration_minutes` / `location` | `lib/ical.test.ts` (omitted fields → defaults applied) |

#### Build reliability — H50, H51, H52

| ID | Invariant | Defender | Test surface |
|---|---|---|---|
| **H50** | `tsconfig.json` `types` field scoped | `"types": ["node"]` in `projects/community-platform/tsconfig.json` | `tests/build-reliability.test.ts` (reads tsconfig; asserts types array set) |
| **H51** | New deps pass typecheck + build on clean install | CI runs `pnpm install --frozen-lockfile && pnpm typecheck && pnpm build` on any branch that modifies `package.json` | CI workflow update |
| **H52** | V-static ICS generator chosen on type-completeness criteria | Plan-writing locks specific package (candidate: `ics`); criteria documented in §13.7.2 | Plan-writing artifact (O1) |

#### Kudos (D19) — H53, H54

| ID | Invariant | Defender | Test surface |
|---|---|---|---|
| **H53** | `thanks_given` write: SHA-passthrough + idempotent on `(recipient, item_type, item_id)` triple | `thank-status` action uses `client().writeFile({expectedSha})`; pre-check dedup against current `thanks_given` array; returns `already_thanked: true` (no commit) on duplicate | `thank-status.test.ts` (happy-path commit; duplicate triple → already_thanked no-commit; 409 → REFRESH_NEEDED) |
| **H54** | Kudos aggregator excludes bot commits + non-roster members | `build-kudos-aggregate` filters via `BOT_AUTHORS` (same set as `lib/contributions.ts:18`; H26 pattern) + drops thanks records where giver or recipient is not on current roster | `build-kudos-aggregate.test.ts` (bot author → excluded; non-roster giver/recipient → excluded) |

#### PWA install (D20) — H55

| ID | Invariant | Defender | Test surface |
|---|---|---|---|
| **H55** | `public/manifest.json` valid against W3C Web App Manifest spec | CI test parses manifest; asserts `name`, `short_name`, `start_url`, `display`, `icons[192]`, `icons[512]` present and well-typed | `tests/build-reliability.test.ts` extended with manifest validity assertions |

### 13.9 Components / files (~50 touched)

#### New TS source files (14)

| Path | Responsibility | Coverage gate |
|---|---|---|
| `lib/events.ts` | Event reader, frontmatter validator, `EventSlug` branded type, orphan-slug filter | **100% (strict-list)** |
| `lib/meetings.ts` | Meeting reader, frontmatter validator, date grouping helper | **100% (strict-list)** |
| `lib/home-feed.ts` | `computeHomeFeed()` aggregator | **100% (strict-list)** |
| `lib/ical.ts` | Frontmatter → ICS event mapper; uses `ics` npm package | **100% (strict-list)** |
| `lib/community-defaults.ts` | Read `community/community-defaults.yaml` (or .json); expose typed defaults | 80% |
| `app/components/HomeFeed.tsx` | D layout renderer (server component) | **100% (strict-list)** |
| `app/components/EventRsvpButton.tsx` | B UI (client component); toggle action invocation | **100% (strict-list)** |
| `app/components/EventRoster.tsx` | Avatar grid (server component); reads `event-rosters.json` | **100% (strict-list)** |
| `app/components/AddToCalendarButton.tsx` | Inline ICS download trigger (client component) | **100% (strict-list)** |
| `app/actions/rsvp-event.ts` | Server action; SHA-passthrough write to member profile | **100% (strict-list)** |
| `app/api/calendar.ics/route.ts` | Route handler serving build-time ICS artifact | **100% (strict-list)** |
| `scripts/build-event-rosters.ts` | Build-time: aggregates roster `events_going` → `lib/__generated__/event-rosters.json` | 80% |
| `scripts/build-calendar.ts` | Build-time: aggregates meetings + events → `lib/__generated__/calendar.ics` | 80% |
| `scripts/validate-events-folders.ts` | CI guard: enforces `YYYY-MM-DD-slug/` pattern in `community/events/` | 80% |

#### New routes (4)

| Path | Type | Purpose |
|---|---|---|
| `app/home/page.tsx` (REWRITE) | SSG | Mounts `<HomeFeed>` |
| `app/events/page.tsx` | SSG | Events index (upcoming + past) |
| `app/events/[slug]/page.tsx` | SSG | Event detail with RSVP UI |
| `app/meetings/page.tsx` | SSG | Meetings index grouped by month |

#### Modified TS files

| Path | Change |
|---|---|
| `app/this-week/page.tsx` | Mount `<HomeFeed feed showRecent={false}>` above status compose box (L2 strip) |
| `app/meetings/[slug]/page.tsx` | Render extended frontmatter (start_time, duration, location); add `<AddToCalendarButton>` |
| `app/members/[slug]/page.tsx` | Render `events_going` list (links to /events/[slug]); filter orphan slugs |
| `lib/content-snapshot.ts` | Extend with `getMeetings()`, `getEvents()` consumers; integrate `event-rosters.json` |
| `scripts/build-snapshot.ts` (or equivalent existing) | Invoke `build-event-rosters.ts` + `build-calendar.ts` in the prebuild pipeline |
| `projects/community-platform/tsconfig.json` | Add `"types": ["node"]` to `compilerOptions` (H50) |
| `community/meetings/weekly/_template.md` | Add commented-out `start_time` / `duration_minutes` / `location` frontmatter slots |
| `package.json` | Add `ics` dependency (plan-writing locks version) |
| `proxy.ts` | Add `/home`, `/events`, `/events/[slug]`, `/meetings`, `/api/calendar.ics` to PUBLIC_PATHS if not already (plan-writing locks O3, O4) |

#### New data/config files (4)

| Path | Purpose |
|---|---|
| `community/community-defaults.yaml` | Meeting + event default time/duration/location/timezone (or .json per O5) |
| `community/events/_template/README.md` | Event template (mirrors meetings template) |
| `lib/__generated__/event-rosters.json` | Build-time derived; committed for diff visibility (v0.2 precedent; plan-writing confirms O2) |
| `lib/__generated__/calendar.ics` | Build-time derived ICS aggregate |

#### Test files (12)

| Path | Coverage focus |
|---|---|
| `lib/events.test.ts` | **100%.** EventSlug validator, frontmatter, orphan filter (H34, H39, H42) |
| `lib/meetings.test.ts` | **100%.** Reader + grouping helper |
| `lib/home-feed.test.ts` | **100%.** Bucket boundaries (H38), empty cases (H33), sort + cap |
| `lib/ical.test.ts` | **100%.** ICS validity (H47), defaults fallback (H49) |
| `app/components/HomeFeed.test.tsx` | **100%.** D layout render, XSS via SafeHtml (H43), empty states (H33, H45) |
| `app/components/EventRsvpButton.test.tsx` | **100%.** State transitions, optimistic UI, 409 revert |
| `app/components/EventRoster.test.tsx` | **100%.** Grid render, link to `/members/[slug]`, empty state |
| `app/components/AddToCalendarButton.test.tsx` | **100%.** Download trigger, filename |
| `app/actions/rsvp-event.test.ts` | **100%.** Session derivation, slug validation (H37), SHA-gated write (H31), 409 (H40), commit message |
| `app/api/calendar.ics/route.test.ts` | **100%.** Response body + headers (H48) |
| `tests/build-reliability.test.ts` | tsconfig types scope (H50) |
| `e2e/v0-3-discovery.spec.ts` | 8 scenarios (§13.10) |

#### Routing + middleware

| Path | Change |
|---|---|
| `proxy.ts` | Add `/home`, `/events`, `/events/[slug]`, `/meetings`, `/api/calendar.ics` to PUBLIC_PATHS if necessary (plan-writing locks per O3, O4) |

#### Chat-17 fold-in additions (Kudos D19 + PWA D20)

**New TS source files (+4 → 18 total):**

| Path | Responsibility | Coverage gate |
|---|---|---|
| `app/components/ThankButton.tsx` | `+ Thanks` affordance (client component); state-aware UI; calls thank-status action | **100% (strict-list)** |
| `app/components/KudosCount.tsx` | Renders "Thanked N times" on /members/[slug] (server component); reads kudos.json | **100% (strict-list)** |
| `app/actions/thank-status.ts` | Server action; SHA-passthrough write to giver's profile; idempotent on `(recipient, item_type, item_id)` dedup | **100% (strict-list)** |
| `scripts/build-kudos-aggregate.ts` | Build-time: aggregates giver profiles' `thanks_given` → `lib/__generated__/kudos.json` | 80% |

**New data/config files (+4 → 8 total):**

| Path | Purpose |
|---|---|
| `public/manifest.json` | PWA install manifest (D20) |
| `public/icons/icon-192.png` | PWA 192×192 icon |
| `public/icons/icon-512.png` | PWA 512×512 icon |
| `lib/__generated__/kudos.json` | Build-time derived kudos aggregate per recipient |

**Test files (+4 → 16 total):**

| Path | Coverage focus |
|---|---|
| `app/components/ThankButton.test.tsx` | **100%.** State transitions (thanked / not-thanked / not-signed-in / self); optimistic UI; duplicate no-op |
| `app/components/KudosCount.test.tsx` | **100%.** Renders count + recent-givers row; empty state |
| `app/actions/thank-status.test.ts` | **100%.** SHA-passthrough (H53); idempotent dedup; self-thank rejected; 409 → REFRESH_NEEDED |
| `scripts/build-kudos-aggregate.test.ts` | Bot-author exclusion (H54); non-roster exclusion (H54) |

**Additional modifications (added to Modified TS files):**

| Path | Change |
|---|---|
| `app/layout.tsx` | Add `metadata.manifest = "/manifest.json"` for PWA install (D20) |
| `app/this-week/page.tsx` | + mount `<ThankButton>` per status post (D19) |
| `app/meetings/[slug]/page.tsx` | + mount `<ThankButton>` at top of meeting note (D19) |
| `app/members/[slug]/page.tsx` | + mount `<KudosCount>` component (D19) |
| `app/projects/[slug]/page.tsx` | Extend `<TopContributors>` rendering to mount `<ThankButton>` per contributor row (D19) |
| `lib/profile-editor.ts` | Add `thanks_given` schema; validate mutual exclusion (`events_going` ∩ `events_interested` = ∅) per D11 |
| `scripts/build-snapshot.ts` (or equivalent existing) | + invoke `build-kudos-aggregate.ts` in prebuild pipeline |

### 13.10 Testing strategy

#### Unit + integration

Per §13.9 — every new source file at 100% strict-list (lines + functions; branches ≥80% where defensive branches are unreachable post-guard, same accepted gap as v0.1.1 `lib/invitations.ts`).

**Hardening-specific (grep-verifiable):** every H30–H52 has a `describe("H<n>: …")` block. DoD verifies the §13.8 grep returns 23 unique IDs.

#### E2E (Playwright)

`e2e/v0-3-discovery.spec.ts` — 14 new scenarios (8 v0.3 base + 6 chat-17 fold-in):

1. **Anonymous /home renders feed** — no sign-in; feed surfaces meetings + events + statuses + contributions per D1.
2. **/this-week strip above compose** — signed in; feed strip appears above status compose box; compose still works.
3. **Event RSVP (sign-in → mark going → roster updates)** — full path through B UI + server action.
4. **RSVP toggle (mark going → revert)** — idempotent both directions.
5. **Concurrent RSVP race** — two-tab; second save 409 → REFRESH_NEEDED inline message.
6. **Orphan slug graceful** — manually edit a roster profile to include nonexistent event slug; visit member page → orphan filtered.
7. **Subscribe to calendar (ICS)** — request `/api/calendar.ics` → valid response, correct Content-Type, parses as ICS.
8. **Add to Calendar button on event detail** — click button → file download with VEVENT for that event.
9. **Thank a status post (D19)** — sign in as member A; click `+ Thanks` on member B's status post; reload `/members/B` → "Thanked 1 times" after rebuild.
10. **Self-thank blocked (D19)** — member A's own status post does not render `+ Thanks` button (initialState="self").
11. **Duplicate-thank dedup (D19)** — member A clicks `+ Thanks` twice on same item; second click no-op (`already_thanked: true`).
12. **RSVP tri-state transitions (D11)** — member RSVPs Going → Interested (atomic switch) → none → Going; verify profile frontmatter reflects each state.
13. **RSVP privacy posture (D12)** — new member with default `members_only` RSVPs; verify name appears in hidden count for anonymous viewer (not in public avatar grid).
14. **PWA install (D20)** — `curl /manifest.json` returns valid JSON with required fields; Lighthouse PWA audit passes; Chrome devtools install prompt fires on `/home`.

Recommend `pnpm e2e --retries=2` for closeout per CONSTRAINTS line 28 (Next 16 cold-start flakes).

#### Coverage targets

Per spec §8 + CONSTRAINTS line 27:
- Overall: 80% lines + branches.
- Strict-list additions (§13.9): 100% lines; branches ≥80% where unreachable post-guard.

#### Build reliability (chat-17 finding)

`tests/build-reliability.test.ts` asserts `tsconfig.json` has `types: ["node"]` (H50). CI workflow extended with `pnpm typecheck` + `pnpm build` step that fails on any branch modifying `package.json` (H51). Dependency vetting checklist in §13.7.2 (plan-writing artifact; H52).

#### Reviewer agents

Per CONSTRAINTS lines 40-46:
- **`security-reviewer`** at end of RSVP implementation (`rsvp-event.ts` is a privileged-write surface inheriting v0.2.2 audit; verify no regression).
- **`typescript-reviewer` + `code-reviewer`** at v0.3.0 closeout if Anthropic monthly cap allows; CONSTRAINTS self-review fallback otherwise (standing pattern from Phase 6).

### 13.11 Migration / release notes

#### 13.11.1 Pre-release tasks

NONE launch-blocking. Optional:
- Seed at least one event under `community/events/2026-MM-DD-slug/` and one extended-frontmatter meeting under `community/meetings/weekly/2026-MM-DD.md` so v0.3 surfaces have non-empty content on ship day.
- Confirm `community/community-defaults.yaml` matches actual community practice (default meeting time, location).

#### 13.11.2 Ship-day runbook

1. Merge v0.3.0 PR.
2. Tag `community-platform-v0.3.0`.
3. Vercel auto-deploys (existing git-push integration; see GOTCHAS rows 1-2).
4. Smoke test:
   - Anonymous: visit `/home` → feed renders (or per O3 — sign-in if proxy-gated).
   - Signed in as Anton: `/home` → feed; `/this-week` → strip above compose.
   - `/events` → upcoming + past sections.
   - `/events/[slug]` → RSVP toggle → reload → roster shows your avatar.
   - `/api/calendar.ics` → `curl` returns text/calendar; parse OK.
   - `/meetings` → index grouped by month.
5. Update `STATE.md`: phase → "v0.3.0 shipped", new tag row, refresh `last_verified` rows.
6. Append CHANGELOG entry.
7. Memory: `project_community_platform_v0_3_ship.md` with timeline, PR #, tag SHA.

#### 13.11.3 Forward-looking migration notes (v0.4+, NOT in v0.3 scope)

| Trigger | Migration |
|---|---|
| Telegram bridge — handle on profile / cross-posting / message ingest | v0.4 thread; member consent + storage-class re-evaluation (§6.1 may activate for ingest depth) |
| Google Calendar API pull (V-pull) | v0.4 if community adopts a shared GCal; service-account creds + cache layer; rendering path swaps from build-time-static to per-request-with-cache |
| RSVP states beyond binary (maybe / waitlist / declined) | v0.4+ frontmatter migration; per-event timestamps via member profile commit log if needed |
| Event reminders / notifications | Wakes §6.1 (notification queue) OR Telegram-bridge dependency (post via bot) |
| Meeting attendance tracking from frontmatter `attendees` field | Derive engagement metrics; pairs with status gamification if revisited |
| Status streak / leaderboards (Q4 rejected for v0.3) | v0.4+ only if explicit member feedback signals demand AND cultural shift is socialized |
| Pagination on `/events` past / `/meetings` index | When entries exceed ~50 items per spec line 9 (no v0.3 pagination by design) |

### 13.12 Definition of Done for v0.3.0

- [ ] All §13 sections committed (this section).
- [ ] All ~30 files implemented per §13.9.
- [ ] All 23 hardenings (H30–H52) tested with `H<n>:` prefix; grep (§13.8) returns 23 unique IDs.
- [ ] Coverage gates met (80% overall, 100% on §13.9 strict-list additions).
- [ ] E2E green with `--retries=2`.
- [ ] §13.11.2 ship-day runbook executed.
- [ ] `tsconfig.json` `"types": ["node"]` scoped (H50).
- [ ] `community/community-defaults.yaml` (or .json) reflects actual community practice.
- [ ] `community/events/_template/README.md` documents event folder convention.
- [ ] GOTCHAS.md row 9 committed (transitive types pattern).
- [ ] PR merged to `main`; `CHANGELOG.md`, `STATE.md` updated.
- [ ] Tag `community-platform-v0.3.0` pushed.
- [ ] Production smoke (§13.11.2 step 4) passes.
- [ ] Memory entry `project_community_platform_v0_3_ship.md` written.
- [ ] Kudos primitive (D19) tested end-to-end: thank → kudos.json aggregator → /members/[slug] kudos count after rebuild.
- [ ] RSVP tri-state (D11) validated: Going/Interested/none transitions; mutual exclusion enforced.
- [ ] Event roster privacy (D12) validated: `members_only` RSVPs hidden from anonymous viewer; reveal-on-auth per O7 default.
- [ ] PWA install (D20) validated: `/manifest.json` valid; Chrome devtools install prompt fires.

### 13.13 Member-to-member recognition (Kudos) — D19

**Trigger.** Chat-17 self-review (2026-modern lens). Recognition is table-stakes for community platforms; Top Contributors (v0.2) is auto-derived from commits and doesn't capture *intentional* acknowledgment between members.

#### 13.13.1 thanks_given field on member profile

Frontmatter addition to `community/members/<slug>.md`:

```yaml
thanks_given:                                              # optional, default []
  - recipient: "anton-safronov"                            # member slug
    item_type: "status" | "contribution" | "meeting"
    item_id: "2026-05-19-anton-status-3" | "0123abc..." | "2026-05-19"  # status post id, commit SHA, or meeting date
    given_at: "2026-05-19T18:23:00Z"                       # ISO 8601
```

Mutually distinct from `events_going` / `events_interested`; orthogonal to RSVP semantics.

Idempotency: server action enforces unique `(recipient, item_type, item_id)` triples per giver — re-clicking `+ Thanks` on an already-thanked item is a no-op (returns `{ok: true, already_thanked: true}` without committing). Plan-writing locks the dedup mechanism (in-memory set scan vs. profile re-read) per O7.

#### 13.13.2 thank-status server action

`app/actions/thank-status.ts`:

Input: `{recipient: string, item_type: "status" | "contribution" | "meeting", item_id: string, profileSha: string}`.

1. `await auth()` → `session.githubHandle`; resolve giver slug.
2. Reject if `recipient === giver` (self-thanks blocked; H53).
3. Reject if `findMemberBySlug(recipient)` returns null (recipient must be on current roster).
4. Validate `item_id` exists for the `item_type`: status post in content-snapshot, commit SHA reachable, meeting note path resolves. Plan-writing locks validator implementations per O8.
5. Read giver profile; parse `thanks_given` array.
6. If `(recipient, item_type, item_id)` already present: return `{ok: true, already_thanked: true}` — no commit.
7. Append the thanks record (with `given_at = new Date().toISOString()`).
8. Write via SHA-passthrough (v0.2.2 contract).
9. On success: `revalidatePath("/members/" + recipient)` + the item's own page.
10. Log discipline: `{giver, recipient, item_type, item_id, sha, success, error?: code}`. No content logged.

Commit message:
```
chore(community): @<giver-gh> thanks @<recipient-gh> for <item_type> "<item_id>"

Co-Authored-By: <giver-gh> <giver-gh@users.noreply.github.com>
```

#### 13.13.3 Kudos aggregator

`scripts/build-kudos-aggregate.ts` (build-time):

Reads all member profiles' `thanks_given` arrays → produces `lib/__generated__/kudos.json`:

```json
{
  "<recipient-slug>": {
    "total": N,
    "by_type": {"status": A, "contribution": B, "meeting": C},
    "recent": [{"giver": "...", "item_type": "...", "item_id": "...", "given_at": "..."}]
  }
}
```

Last 5 thanks shown in `recent`. Bot commits excluded per existing `BOT_AUTHORS` set (H54 — same pattern as H26). Non-roster members (giver or recipient) dropped from aggregation.

#### 13.13.4 ThankButton component

`app/components/ThankButton.tsx` (client component):

```typescript
interface ThankButtonProps {
  recipient: string;
  itemType: "status" | "contribution" | "meeting";
  itemId: string;
  initialState: "thanked" | "not-thanked" | "not-signed-in" | "self";
  profileSha?: string;
}
```

States:
- `"thanked"`: `[♥ Thanked]` active (warm rose); click → no-op (one-shot recognition; re-thanking not supported in v0.3).
- `"not-thanked"`: `[+ Thanks]` inactive; click → action → optimistic flip to `"thanked"`.
- `"not-signed-in"`: hidden OR styled `"Sign in to thank"` link → `/login?callbackUrl=<current-url>`.
- `"self"`: hidden (no self-thank UI surface).

Surface placements (v0.3):
- Status posts on `/this-week` — `<ThankButton>` next to each post's timestamp.
- Project contribution rows on `/projects/[slug]` — `<ThankButton>` next to each TopContributor row (item_id = synthetic per-contributor id; plan-writing locks per O8).
- Meeting notes on `/meetings/[slug]` — single `<ThankButton>` at top of each meeting note (item_id = date).

#### 13.13.5 KudosCount component

`app/components/KudosCount.tsx` (server component):

Renders on `/members/[slug]`:
- "Thanked N times" pill (link to future `/members/[slug]/kudos` page; not in v0.3 — placeholder href).
- Optional recent-givers row (3 avatars).

Reads from `lib/__generated__/kudos.json`.

#### 13.13.6 Forward-looking (NOT in v0.3)

- `/members/[slug]/kudos` page showing all kudos received with context (v0.3.1+).
- Kudos for ADRs / decision contributions (v0.3.1+ — needs `item_id` resolution for ADR scope).
- Leaderboard / "Top thanked this month" — explicitly excluded per Q4 (no gamification surface).

### 13.14 PWA install — D20

**Trigger.** Chat-17 self-review (2026-modern lens). Platform is mobile-friendly (Lighthouse 99/100 mobile per STATE row `lighthouse_baseline_login`) but not installable. PWA manifest is 1-task ROI for the "modern" signal.

#### 13.14.1 manifest.json

`public/manifest.json` (new):

```json
{
  "name": "Warsaw AI Community",
  "short_name": "Warsaw AI",
  "description": "Discovery + decisions + ship cadence for the Warsaw AI Community",
  "start_url": "/home",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Icons (new): `public/icons/icon-192.png` (192×192) + `public/icons/icon-512.png` (512×512). Plan-writing locks the icon artwork (community logo derivative; plan-writing produces or sources).

#### 13.14.2 Layout link

`app/layout.tsx` extension:

```tsx
export const metadata = {
  // ... existing
  manifest: "/manifest.json",
};
```

Next 16 inlines the `<link rel="manifest">` from the `metadata` export — no manual `<head>` work.

#### 13.14.3 NO service worker / offline mode (v0.3 scope)

Deliberate omission. Service workers + offline caching add complexity disproportionate to v0.3 thesis (Discovery+). Members get the install prompt + standalone app launch; content fetching follows Next.js default caching. Offline mode and push notifications are v0.4+ candidates.

#### 13.14.4 Forward-looking (NOT in v0.3)

- Service worker for offline-first reads (v0.4 candidate).
- Web Push subscriptions for event reminders (v0.4 — pairs with email-digest scope; both wake §6.1).
- Apple Touch icons + iOS-specific manifest extensions (v0.3.1 if mobile install adoption signals demand).

---

## 14. v0.4.0 — World-class community platform (global shell + `/` anonymous landing + `/calendar` + `/handbook` + warm-amber identity)

### 14.0 Intro & scope

**v0.4 thesis (chat-22 brainstorm §0):** Lift v0.3.1's already-restrained text-first surface into a community platform with a warmer, more transparent identity by adding (1) a global navigation shell (header + footer everywhere except `/login`); (2) an anonymous `/` landing with hero + dual CTA + next-event ribbon; (3) a `/handbook` top-nav slot for charter + roadmap pointers; (4) a `/calendar` unified events+meetings index; (5) a token-based CSS variable system + warm amber accent + wordmark; (6) a CI slug-folder integrity check; (7) PWA icon regeneration.

**Public ambition sentence** (Q-1.1 / D21 lock): _"Where Warsaw's AI builders learn, ship, and find each other."_ The three outcome verbs (learn / ship / find) map to platform surfaces (`/calendar` / `/projects` / `/members`); the sentence appears in the `/` hero, README description, and OG `<meta>` description on anonymous-readable pages. It does NOT appear in footer or signed-in `/home`.

**Source of decisions (cite, don't re-litigate):**
- **Brainstorm output (chat-22)** — `docs/specs/2026-05-17-community-platform-v0-4-brainstorm-output.md`. 28 blocking + 38 tuning questions Anton-locked via interactive review. Decision log D21–D44 (continues v0.3 D1–D20). Hardening list H56–H68 (12 entries; continues v0.3 H30–H55).
- **ADR-0014** (this v0.4 ADR) — `/` flips to anonymous-public hero landing; amends ADR-0012. `docs/decisions/0014-community-platform-v0-4-root-anonymous-landing.md`.
- **ADR-0012** (locked, amended by ADR-0014) — Discovery+ posture; `/home`, `/events`, `/meetings`, `/api/calendar.ics`, `/manifest.json`, `/icons/*` anonymous-public.
- **NO ADR-0013** — proposed `/decisions` flip was dropped per Q6.1 A1 lock (Anton's "hide all possible PII" stance); deferred to v0.5+ subject to PII audit (logged in `V0_5_BACKLOG.md`).

**User-test posture (compensating control):** the brainstorm office-hours sharpening Q5 called for a 30-min user-test session with 2 existing Telegram members + 1 prospective member before locking §14. Anton elected on 2026-05-18 (chat-23) to skip user recruitment for friction-reduction reasons; a structural Playwright walkthrough of v0.3.1 production was substituted as primary empirical input. Findings at `docs/research/v0-4-gstack-walkthrough-2026-05-18/findings.md` confirmed zero D-id contradictions (all of D21–D44 reinforced or pure-add; no brainstorm amendment required). The walkthrough captures **objective** friction (broken affordances, redirect chains, route gaps, layout regressions, accessibility gaps); it does NOT capture **subjective** member reactions ("I felt confused here", "I'd never click this"). Phase A landing data + a post-ship user-test together gate Phase B activation per D44.

**Scope envelope (Q10.1 / D44 lock):** **Phase A is COMMITTED as v0.4.0**. Phase B (detail-page upgrades) and Phase C (brand visual + RSS + illustrations) are **CONDITIONAL** on Phase A landing data + user-test feedback. Hard-cut on Phase A merge — no feature flag. Each phase tag is a checkpoint; v0.4.0 alone is shippable if B/C never activate. See §14.10 for the phase scope table.

**Out of v0.4 (cite, don't expand):** payments / commerce / subscriptions; built-in KB or Q&A (GBrain owns); route removal; backend / data shape changes; native iOS / Android apps; DMs / real-time messaging. See §14.11.

**Skill sequence (recap):** chat-22 brainstorm → chat-23 spec (this §) → chat-24 plan → chat-25 Phase A implementation → chat-26+ user-test review → chat-27+ Phase B conditional → chat-28+ Phase C conditional.

---

### 14.1 Visual character

**Character lock (Q-1.2 / Q-1.3 / D22):** **PostHog primary + Linear restraint accent + Claude/Notion editorial-softness accents. NOT Lobste.rs primary. NOT dev.to. NOT Slack-as-chat-replacement.** Brand-language axis (Q-1.4): ~60% PostHog warmth + ~25% Linear restraint + ~15% Claude/Notion editorial softness.

**What each contributes to v0.4 surfaces:**

| Element | PostHog primary (~60%) | Linear restraint (~25%) | Claude/Notion accent (~15%) |
|---|---|---|---|
| Voice / copy | Warm, branded, opinionated empty states | Crisp short sentences | Conversational ("If you've never been to a sync, here's what to expect") |
| Color | Branded palette (warm, not cold corporate) | One accent + generous whitespace | Warm grays + soft accents |
| Typography | Identifiable display + body | Single typeface, generous spacing | Editorial moments allowed (serif option reserved for v0.5+) |
| Imagery | Custom illustrations OK (1-2 v0.4 Phase C touches) | Functional screenshots | Simple line drawings for empty states (Phase C) |
| Layout density | Editorial — content can breathe | Generous whitespace, no clutter | Block-based composition |
| Member profile (Phase B) | "Team page" feel | Whitespace around showcase | Editorial bio formatting |
| Empty states | Friendly + on-brand ("No meetings yet — the next sync is Wednesday 18:30") | Crisp | Helpful + occasionally illustrated (Phase C) |

**Voice rules:** NO mascot in v0.4. NO playful copy on system error messages. NO "🔥 trending" engagement bait. NO banner-stacking.

**Wordmark (Q4.7 / D34 lock):** `Warsaw AI` set in Inter via `next/font`. Default presentation: **Inter Semibold (font-weight 600), 18-20px on desktop header, neutral-900, letter-spacing 0** (no kerning adjustment). PWA icons 192/512 + favicon 32×32: **`WA` initials, white, on `#f59e0b` square**, centered, no padding adjustment beyond Tailwind defaults.

**Open question O2 (wordmark setting) — inline lock with proposal variants:**

| Variant | Setting | Pick rationale |
|---|---|---|
| **A (Default — RECOMMENDED)** | Inter **Semibold (600)**, letter-spacing `0`, font-size `18px` desktop / `18px` mobile, color `neutral-900` | Matches Inter's design intent at this size; Linear / PostHog / Notion all use ~600 weight for wordmarks; consistent vertical metrics with Inter body text |
| B (Heavier) | Inter **Bold (700)**, letter-spacing `-0.01em`, same size + color | More presence; visually heavier; consider only if Variant A feels under-stated in user-test |
| C (Restrained) | Inter **Medium (500)**, letter-spacing `0`, same size + color | Lightest of the three; consider only if Variant A feels overstated against header chrome |

**Phase A ships Variant A.** Variants B/C are reserved for v0.5+ revision if Phase A user-test signals adjustment.

**Accent color (Q4.2 / D33 lock):** Warm amber/orange family. Canonical: **`#f59e0b`** (PostHog amber). Ramp defined as CSS variables in `app/globals.css` referenced by Tailwind via `theme.extend.colors.accent` (Q8.2 / D32 lock):

```css
:root {
  --color-accent-50:  #fffbeb;
  --color-accent-100: #fef3c7;
  --color-accent-500: #f59e0b;  /* canonical */
  --color-accent-600: #d97706;
  --color-accent-700: #b45309;
  --color-accent-900: #78350f;
}
```

**Open question O3 (accent ramp exact hex) — inline lock with contrast verification:** the proposed ramp above is **Tailwind's `amber` ramp values** at the listed stops — chosen because (a) Tailwind ships them; (b) they have battle-tested cross-display rendering; (c) they meet WCAG contrast minimums at the stops we actually use. Contrast verification table (Phase A axe-core check):

| Stop | Hex | On white (`#ffffff`) | Used for |
|---|---|---|---|
| `accent-50` | `#fffbeb` | 1.04:1 (decorative only) | Hover backgrounds, focus-ring fills |
| `accent-500` | `#f59e0b` | 2.13:1 | NOT for body text on white — primary CTA fill ONLY (with white foreground 4.62:1) |
| `accent-600` | `#d97706` | 2.84:1 | NOT for body text on white; CTA borders, active-link underline |
| `accent-700` | `#b45309` | 4.59:1 | **Passes WCAG AA for body text** — accent-link text on white background |
| `accent-900` | `#78350f` | 9.69:1 | Passes AAA for body text — high-emphasis accent text |

**Phase A ships the Tailwind amber ramp** at the stops above. v0.5+ may revisit with a custom-tuned ramp if community-color identity matures.

**Accent usage rules (Q4.8 lock):**
- **Where accent appears:** primary CTAs (Sign in, RSVP Going button, "Add to calendar"); focus rings (Tailwind `ring-accent-500 ring-offset-2`); current-page nav state (underline or background tint); RSVP "Going" pill (Phase B); active-link underline.
- **Where accent does NOT appear:** Links remain `underline` neutral-900; tags use neutral background + neutral-700 text; section headers stay uppercase tracking-wider neutral-500; body text always neutral-900.

Restraint is the brand. Anywhere accent appears, it must mean **"action"** or **"you are here."**

**Typography (Q4.4 / D35 lock):** Inter via `next/font` (one weight per stop loaded — Regular 400 + Semibold 600). System fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Body 16px / 1.5 line-height; h1 30-36px Semibold; h2 18-20px Semibold; h3 16px Semibold; section labels uppercase 12-13px tracking-wider Regular neutral-500. No serif in v0.4 (a serif slot in CSS variables is reserved for v0.5+ editorial pages).

**Card style (Q4.5 lock):** Bordered flat (v0.3.1 pattern preserved). Hover: subtle `hover:bg-neutral-50`. **No shadows on cards.** Shadows reserved for overlays only (dialog / popover / tooltip / dropdown).

**Imagery posture (Q4.6 lock):** functional imagery (avatars, optional project screenshots) is Phase A; 1-2 Notion-style line-drawing illustrated touches for first-impression surfaces are **Phase C** (NOT Phase A). NO mascots in v0.4. NO stock photography in v0.4.

**Dark mode (Q4.3 / D43 lock):** **deferred to v0.5+**. Token foundation laid in Phase A enables the v0.5+ design pass; v0.4 ships light-only.

---

### 14.2 Information architecture

**Top nav (Q2.1 / D26 lock):** 5 items, left-to-right — **Home / Calendar / Projects / Members / Handbook**. Anonymous + signed-in see all 5; clicking gated routes (Projects, Members) triggers sign-in flow on the destination page (Q6.2 — see §14.5). About → footer. This-Week → folded into signed-in `/home` dashboard. Search → v0.5+ (Q2.7 lock).

**Mobile (390px viewport):** Hamburger top-right opens a slide-in panel (Q2.5 / D26 lock). No bottom tab bar. 5 nav items + Sign in / avatar in slot.

**Why Decisions is dropped from top nav:** Decisions stays gated (Q6.1 A1) and the per-project Decisions section on `/projects/[slug]` (Phase B) is the primary surfacing; a global Decisions slot would duplicate. Members reach the standalone `/decisions` index from `/handbook` or via direct URL.

**Events + Meetings unified at `/calendar` (Q2.2 / D27 lock):** the new `/calendar` route is the canonical top-nav target. Composition:
- Top filter chips: All / Events / Meetings (filter state encoded in URL `?filter=events`, H62).
- Default view: chronological merge of upcoming meetings + upcoming events.
- Past section: collapsible "Show past" toggle.
- Subscribe-to-calendar button → same `/api/calendar.ics` data source.

**Old `/events` + `/meetings` indexes** stay URL-accessible as **filtered views** (not in nav). Old bookmarks + ICS-subscribers continue working. Detail pages stay canonical at `/events/[slug]` and `/meetings/[slug]`. **NO 301 redirects** — both URLs return 200 with their filtered content.

**Projects / Decisions / This-Week placement (Q2.3 / D29 lock):**
- **`/handbook`** (top-nav) holds community-wide governance pointers (charter pointer + roadmap pointer + external GitHub link for ADRs + v0.5+ placeholder list for Skills/Academy/GBrain Q&A). **NO ADR markdown content surfaced via `/handbook` UI in v0.4** (Q6.1 (i) lock).
- **Per-project Decisions section** on `/projects/[slug]` (Phase B; gated per D29) — each project's page surfaces its scoped ADRs via frontmatter `project:` field matching. Open question O13 resolved in §14.4 / Phase B detail-template family. v0.4 Phase A scope wraps existing v0.3 templates in the new shell; Phase B activates the per-project Decisions section.
- **This-Week** — URL `/this-week` stays members-only (no change from v0.3). Top-nav slot NOT used; folded into signed-in `/home` dashboard "Your week" pane (Q1.3 / D25 lock).

**User menu (Q2.4 lock):** signed-in avatar dropdown top-right with **exactly 4 items**: `@handle` → "Your week" (→ `/this-week`) → "Edit profile" (→ `/me/edit`) → "Sign out". Anonymous shows `[Sign in]` button in the same slot. **v0.3.1 ships 5 items** (includes "Members") — Phase A drops "Members" since member directory is reachable via top-nav. H58 test extends to dropdown-contents check.

**Breadcrumbs (Q3.3 / D43 lock):** **NO breadcrumbs in v0.4.** IA is 2 levels deep (index → detail). Reconsider at v0.5+ if a 3rd level emerges.

**Loading states (Q3.4 lock):** skeleton placeholders on long lists (>5 items). NO top-bar spinner. Most surfaces are SSG/SSR; inline skeletons for client-side data.

**Empty states (Q3.5 lock):** **copy only (Linear-style), always with a next-action link OR a calibration**. Asymmetric in v0.3.1 (`/meetings` good, `/events` thin per walkthrough findings §3); Phase A codifies via `<EmptyState>` component contract. Examples:
- `/calendar`: "No upcoming events. The next weekly meeting is Wednesday at 18:30."
- `/events` (empty): "No upcoming events. The next weekly sync is Wed 18:30; standalone events appear here as they get scheduled. Propose an event ↗"
- `/decisions` (gated): "No decisions yet. ADRs land in docs/decisions/ as they get written."
- `/projects` (gated): "Member projects appear here as they get added."

Optional 1-2 illustrated touches across the platform are **Phase C** (NOT Phase A). Phase A is copy-only.

**Detail page templates (Q3.2 / D31 lock — Phase B target state):** 3 variants share the global shell. Phase A wraps existing v0.3 detail templates in the new `<Header>`/`<Footer>` shell; Phase B upgrades to the 3-variant family:

| Variant | Routes | Composition (Phase B) |
|---|---|---|
| **A — content-led** | `/projects/[slug]`, `/decisions/[slug]` | Title + meta strip + markdown body + sidebar |
| **B — event-led** | `/events/[slug]`, `/meetings/[slug]` | Hero (date/time/location + RSVP CTA + roster strip) + agenda/notes body + sidebar |
| **C — person-led** | `/members/[slug]` | Photo + name + handle + role + bio body + Working-on (Phase B) + Persona links (PersonaPanel v0.2) |

**Phase A ship reality:** outer shell wraps existing templates; inner composition unchanged.

---

### 14.3 Routes added/changed

**Net change:** 4 NEW route files + 1 modified route + 0 removed routes.

| Route | Phase | HTTP behavior | Composition |
|---|---|---|---|
| **`/` (NEW handler body)** | **A** | Anonymous: 200 (ADR-0014). Signed-in: 302→`/home` preserving `?from=…` (H57). | Hero strip (wordmark left + value prop sentence + sub-line + primary CTA `[Sign in with GitHub]` + secondary CTA `[Join Telegram →]` + next-event ribbon right) + below-hero "This week" strip + "Recent activity" strip + 5-card section nav + Footer. |
| **`/home`** | **A** | Anonymous + signed-in: 200. `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` (v0.3.1 amended posture preserved). | Anonymous: This-Week strip → Recent activity → in-page Sections card grid (existing v0.3 component). Signed-in: prepend "Your week" dashboard pane (Q1.3 / D25) above the same anonymous body. |
| **`/calendar` (NEW)** | **A** | Anonymous + signed-in: 200. | Top filter chips (All / Events / Meetings) with state in URL `?filter=…` (H62). Chronological list (upcoming) + collapsible past section. Subscribe-to-calendar button → `/api/calendar.ics`. Uses `<ListItem>` (D36) for each row. |
| **`/handbook` (NEW)** | **A** | Anonymous + signed-in: 200. | Sectioned page: Charter pointer (links to `community/charter/charter.md`) + Roadmap pointer (open question O4 below) + "Decisions live in our public git repo at github.com/anton1rsod/warsaw-ai-community/tree/main/docs/decisions" external link + v0.5+ placeholder list for Skills/Academy/GBrain Q&A (each labeled "TBD placement"). **NO ADR markdown content surfaced via the page UI** (Q6.1 (i) lock). |
| **`/feed/meetings.xml` (NEW)** | **C** | Anonymous + signed-in: 200 with `Content-Type: application/rss+xml`. | RSS 2.0 feed. Items: title + link + description (≤280 chars excerpt) + pubDate. NO guid / no author beyond optional. H61 excerpt cap. |
| **`/feed/events.xml` (NEW)** | **C** | Anonymous + signed-in: 200 with `Content-Type: application/rss+xml`. | Same shape as meetings feed. |
| `/events` | A | Anonymous + signed-in: 200 (per ADR-0012). | Unchanged from v0.3 except wrapped in global `<Header>`/`<Footer>`. Empty-state copy upgraded per Q3.5. |
| `/meetings` | A | Anonymous + signed-in: 200 (per ADR-0012). | Unchanged from v0.3 except wrapped in global `<Header>`/`<Footer>`. |
| `/events/[slug]`, `/meetings/[slug]` | A wrap, B upgrade | Anonymous + signed-in: 200 (per ADR-0012). | Phase A: wrap existing v0.3 detail templates in new shell. Phase B: upgrade to event-led variant (Q5.7 / D39 — Luma-style hero with RSVP CTA + roster strip + agenda body + share/calendar footer). |
| `/projects`, `/projects/[slug]` | A wrap | Anonymous: 307→/login (D29 — stays gated). Signed-in: 200 wrapped in new shell. Phase B: project portfolio framing + per-project Decisions section (Q5.8 / D29). | |
| `/members`, `/members/[slug]` | A wrap | Anonymous: 307→/login (D29 — stays gated). Signed-in: 200 wrapped in new shell. Phase B: pure PostHog team-page (Q5.6 / D38). PersonaPanel v0.2 preserved as-is throughout v0.4. |
| `/decisions`, `/decisions/[slug]` | A wrap | Anonymous: 307→/login (D28 — stays gated). Signed-in: 200 wrapped in new shell. | |
| `/me/edit`, `/this-week`, `/admin/health`, `/api/me/*` | A wrap | Anonymous: 307→/login (always-gated). Signed-in: 200 wrapped in shell where applicable. | |
| `/login`, `/no-access`, `/consent`, `/api/consent/recover`, `/onboard*` | A no-change | As v0.3.1. **No global shell on `/login`** (Q3.1 exception). | |
| `/manifest.json`, `/icons/*` | A regen | Anonymous + signed-in: 200. Phase A regenerates icons + manifest with `theme_color: "#f59e0b"` + `WA` initials on amber square. | Existing PWA users may need re-install for theme to take effect. |
| `/api/calendar.ics` | A no-change | Anonymous + signed-in: 200. `Cache-Control: public, max-age=300`. | Unchanged from v0.3. |
| `/favicon.ico` (NEW asset) | A | 200 image/x-icon. | `WA` 32×32 on `#f59e0b` square — same iconography as `/icons/icon-192.png`. Resolves the v0.3.1 console 404 observed in walkthrough findings §4. |

**`proxy.ts` PUBLIC_PATHS additions** (Phase A): `/`, `/calendar`, `/handbook`. **PUBLIC_PREFIXES additions** (Phase C): `/feed/` (covers both feed routes). All other gates unchanged. Single `proxy.ts` change file; surgical diff.

**Open question O4 (Roadmap pointer on `/handbook`) — inline lock:** the Handbook roadmap pointer links to the **monorepo `PROJECTS.md`** (existing portfolio source). A separate `community/roadmap.md` is NOT created in v0.4 — `PROJECTS.md` already lists active + planned sub-projects with status. Link text: "Active and planned sub-projects ↗" pointing to GitHub URL `github.com/anton1rsod/warsaw-ai-community/blob/main/PROJECTS.md`.

**Open question O5 (Footer link choices) — inline lock:** footer center carries 5 items in order: **About** (→ `/handbook` until `/about` lands in Phase C) · **Telegram** (external invite URL — chat-24 plan locks the URL) · **RSS** (anchor that links to `/feed/meetings.xml` once Phase C ships; in Phase A this link is omitted) · **GitHub** (external — `github.com/anton1rsod/warsaw-ai-community`) · **MIT-licensed** (anchor to `LICENSE` on GitHub). Footer left: `© 2026 Warsaw AI Community`. Footer right: language-switcher slot (empty in v0.4; populated in v0.5+ when next-intl lands).

**Open question O11 (RSS feed item shapes) — inline lock (Phase C):** each `<item>` has `<title>` + `<link>` + `<description>` (excerpt, ≤280 chars, plain text) + `<pubDate>` (RFC 822). **NO `<guid>`** in v0.4 (URL is stable; URL serves as guid by default). **NO `<author>`** in v0.4 (avoids surfacing member email or handle on a public feed without consent).

**Open question O9 ("Your week" dashboard data sources) — inline lock:** Phase A dashboard pane reads from three sources:
- **Next RSVP commitment** — derived from `event_rsvps.json` (existing v0.3 artifact) filtered by current member's handle + future date.
- **Status compose CTA** — static link to `/this-week` (no data read).
- **Optional kudos given/received this week** — derived from `lib/kudos.ts` aggregator (existing v0.3) filtered by current member's handle + current ISO week.

Passive surface — no streak counter, no notifications, no "you missed 2 weeks" guilt-tripping (H67 / manipulation-resistance §14B).

**Open question O13 (Per-project Decisions section data model — Phase B) — inline lock:** ADRs map to projects via an optional `project:` frontmatter field in `docs/decisions/NNNN-*.md`. Schema: `project: "<project-slug>"` (single string; ADRs scoped to a single project) OR `project: ["<slug-a>", "<slug-b>"]` (array; cross-cutting ADRs). When the field is absent, the ADR is treated as **community-wide** and surfaces only on `/handbook` external-link list (not on any per-project page). Phase B `/projects/[slug]` reads `docs/decisions/*.md` frontmatter at build time, filters by `project` matching, and renders a "Decisions" subsection. No live GitHub API integration in v0.4 — Phase A scope is shell-wrap only; Phase B activates the data plumbing.

---

### 14.4 Components

**Phase A delivers 7 net-new shared components in `app/components/`:**

| Component | Purpose | Phase | File |
|---|---|---|---|
| `<Header>` | Global header (wordmark + 5-nav + avatar/Sign-in / mobile hamburger) | A | `app/components/Header.tsx` |
| `<Footer>` | Global footer (copyright + center link strip + lang-switcher slot) | A | `app/components/Footer.tsx` |
| `<Avatar>` | GitHub-URL avatar with initials fallback; `photo: false` opt-out | A | `app/components/Avatar.tsx` |
| `<ListItem>` | Shared list-row with title/subtitle/meta/avatar/trailing slots | A | `app/components/ListItem.tsx` |
| `<DateTime>` | Relative-on-list + absolute-on-hover; absolute-on-detail | A | `app/components/DateTime.tsx` |
| `<Tag>` | Stage/status/type chip | A | `app/components/Tag.tsx` |
| `<EmptyState>` | Standardized empty-state with next-action slot | A | `app/components/EmptyState.tsx` |

#### `<Header>` (Q3.1 / D30 lock)

- **Left:** wordmark `Warsaw AI` (Inter Semibold 18px, neutral-900) linking to `/`.
- **Center:** 5-item top nav (Home / Calendar / Projects / Members / Handbook). Current-page state: accent-700 underline 2px offset 4px. Hover: neutral-900 underline 1px.
- **Right (anonymous):** `[Sign in]` button (text-only link, neutral-900 underline). Per Q1.2 hero lock, the **primary** `[Sign in with GitHub]` button lives on the `/` hero — `<Header>` right slot stays terse to avoid double-CTA noise on every page.
- **Right (signed-in):** 32px avatar (GitHub URL via `<Avatar>` with `photo: false` opt-out support) opening a dropdown.
- **Signed-in dropdown (Q2.4 lock) — exactly 4 items:** `@handle` (no link, neutral-500) → "Your week" (→ `/this-week`) → "Edit profile" (→ `/me/edit`) → "Sign out" (server-action POST).
- **Mobile (< 768px):** wordmark left + hamburger button right. Tapping hamburger opens a slide-in panel (right edge) containing the 5 nav items stacked + auth section at bottom.
- **Exception:** `/login` does NOT render `<Header>` (Q3.1 lock). `/no-access` and `/consent` use `<Header>` but without the top-nav center slot (auth-state-only header).
- **Skip-to-content link** (H65): first focusable element on Tab, visible only on focus, jumps to `<main id="main">`.

#### `<Footer>` (Q3.1 / D30 lock)

- **Left:** `© 2026 Warsaw AI Community`.
- **Center:** 5 links in order — About · Telegram · RSS · GitHub · MIT-licensed (Phase C surfaces RSS; Phase A renders only About + Telegram + GitHub + MIT).
- **Right:** language-switcher slot (empty in v0.4; v0.5+ next-intl populates).
- **Compact:** ~80px tall desktop, ~140px mobile (wraps).

#### `<Avatar>` (Q5.2 / D37 lock)

```typescript
type AvatarProps = {
  name: string;        // member display name (for initials fallback + alt)
  handle: string;      // GitHub handle (for GitHub avatar URL)
  size: 20 | 24 | 32 | 40 | 96;  // canonical sizes per spec
  photoOptOut?: boolean;  // from member frontmatter photo: false
  decorative?: boolean;   // empty alt
};
```

- **Default render:** `<Image>` from `next/image` with `src="https://avatars.githubusercontent.com/${handle}?size=${size * 2}"` (2× for retina), `width={size}`, `height={size}`, `alt={`${name}'s avatar`}` or `""` if `decorative`.
- **`next.config.ts` `images.remotePatterns` allowlist** (H59): `avatars.githubusercontent.com` ONLY. Strict deny-by-default for any other image origin.
- **`photoOptOut === true` OR `handle` empty:** initials fallback — square (`bg-neutral-200 text-neutral-700 rounded-full`) with initials text centered.
- **Initials algorithm (open question O6) — inline lock:** **single character — the first letter of the GitHub handle (lowercased to uppercase)**. NOT derived from name parts (avoids pseudo-identification of first/last name when a member intentionally publishes only a partial name). Examples: `anton1rsod` → `A`; `markspas` → `M`. Single-char fallback is the privacy-aligned choice; aesthetics handled via the square's amber border on hover.

Avatar appears on (per Q5.2): `/home` This-Week strip (20px), Recent activity (24px), `/calendar` items (32px), `/events/[slug]` RSVP roster strip (40px, Phase B 5-wide grid per ADR-0012 D12), `/meetings/[slug]` attendee list (40px), `/members/[slug]` profile header (96px, Phase B), `<Header>` avatar dropdown trigger (32px).

#### `<ListItem>` (Q5.1 / D36 lock)

```typescript
type ListItemProps = {
  href: string;
  title: string;
  subtitle?: string;
  meta?: string;       // e.g., "Wed May 21 · 18:30" or "3 contributors"
  avatar?: AvatarProps;
  trailing?: ReactNode;  // optional trailing chip
};
```

Used by `/calendar` (Phase A) + `/home` Recent activity (Phase A) + `/handbook` v0.5+ placeholder sections + `/members` (Phase B) + `/projects` index (Phase B) + `/decisions` index (Phase B). Padding: `py-3 px-4`. Hover: `hover:bg-neutral-50`. Focus visible per Q9.1: `focus-visible:ring-2 ring-accent-500 ring-offset-2`.

#### `<DateTime>` (Q5.4 lock)

- **List context** (e.g., `/home` Recent activity, `/calendar` rows): renders relative ("3 days ago") with `title` attribute showing absolute ("Wed, May 14 · 11:30").
- **Detail context** (e.g., `/events/[slug]` hero): renders absolute as primary ("Wednesday, May 21 · 18:30 - 21:00 CEST").
- All times rendered in **CEST timezone** in v0.4 (community is Warsaw-only). v0.5+ Polish + per-user timezone via next-intl.

#### `<Tag>` (Q5.5 lock)

```typescript
type TagProps = {
  label: string;
  variant?: "stage" | "status" | "type";
  value?: string;  // e.g., "active" | "complete" | "accepted"
};
```

**Open question O12 (Tag color mapping) — inline lock:** **NEUTRAL by default, single per-value tint for semantic chips only.**

| Variant | Value examples | Color treatment |
|---|---|---|
| `stage` (projects) | `active` | bg `neutral-100`, text `neutral-700`, **NO accent tint** — restraint-first |
| `stage` (projects) | `complete` | bg `neutral-100`, text `neutral-500` (de-emphasized) |
| `stage` (projects) | `paused` | bg `neutral-100`, text `neutral-500` (de-emphasized) |
| `status` (decisions) | `accepted` | bg `neutral-100`, text `neutral-700` |
| `status` (decisions) | `proposed` | bg `accent-50`, text `accent-700` (the single per-value tint — signals "open question") |
| `status` (decisions) | `superseded` | bg `neutral-100`, text `neutral-400` (struck-through label) |
| `type` (meetings) | `weekly` / `special` / `workshop` | bg `neutral-100`, text `neutral-700` |

**Rationale:** Q4.8 "Accent ONLY means action or you-are-here" — using accent on a status chip would dilute the signal. The single exception (`proposed` ADR status) is justified by the literal "open / needs attention" semantic, which IS an action-adjacent state. All other chips use a neutral palette to keep visual restraint.

#### `<EmptyState>` (Q3.5 codification per walkthrough finding §3)

```typescript
type EmptyStateProps = {
  headline: string;          // "No upcoming events."
  calibration?: string;      // "The next weekly sync is Wed 18:30."
  nextAction?: { label: string; href: string; external?: boolean };  // "Propose an event ↗"
};
```

Always renders at least `headline + (calibration OR nextAction)`. Phase A test (`<EmptyState>` describe block) asserts that no surface renders an `<EmptyState>` without one of those two affordances — codifies Q3.5 lock.

**Mobile slide-in nav animation (open question O7) — inline lock:** **slide-in from right edge, no backdrop blur, 200ms ease-out**. Variants considered:

| Variant | Spec | Pick rationale |
|---|---|---|
| **A (Default — RECOMMENDED)** | `transform: translateX(100% → 0)` over 200ms `cubic-bezier(0.4, 0.0, 0.2, 1)` (Material standard ease-out). Backdrop: `bg-neutral-900/40` fade-in over 150ms. No blur (perf). | Predictable; matches iOS/Android slide-in idiom; cheap on mobile GPU; backdrop dim suffices for context separation |
| B (Drawer-with-blur) | Same translate but backdrop `bg-neutral-900/30 backdrop-blur-sm` | Adds 1-2ms paint cost; less predictable on lower-end Android |
| C (Overlay-fade) | No translate, panel fades in over white-card overlay | Loses spatial affordance — feels modal, not nav |

**Phase A ships Variant A.** Tested on 390×844 mobile viewport via Lighthouse + manual interaction (chat-25 Phase A E2E).

---

### 14.5 Anonymous vs members-only posture

**Lock (Q6.1 / D24 / D28 / D29):**

| Route | Anonymous | Signed-in | Source |
|---|---|---|---|
| `/` | **200 hero** | **302→/home** preserving `?from=…` | ADR-0014 (NEW v0.4) |
| `/home` | 200 (discovery feed) | 200 (+ "Your week" dashboard pane prepended) | ADR-0012 |
| `/calendar` | **200** | 200 | extends ADR-0012 (NEW v0.4) |
| `/handbook` | **200** (charter pointer + roadmap link + GitHub external links + v0.5+ placeholder list; NO ADR markdown content) | 200 (same body) | NEW v0.4; Q6.1 (i) lock |
| `/events`, `/events/[slug]` | 200 (per ADR-0012) | 200 | ADR-0012 |
| `/meetings`, `/meetings/[slug]` | 200 (per ADR-0012) | 200 | ADR-0012 |
| `/api/calendar.ics` | 200 (per ADR-0012) | 200 | ADR-0012 |
| `/manifest.json`, `/icons/*`, `/favicon.ico` | 200 (per ADR-0012) | 200 | ADR-0012 |
| `/feed/meetings.xml`, `/feed/events.xml` | **200** (Phase C) | 200 | NEW v0.4 (Phase C) |
| `/decisions`, `/decisions/[slug]` | **307→/login** (stays GATED) | 200 | D28 — Q6.1 A1 lock (ADR-0013 DROPPED) |
| `/projects`, `/projects/[slug]` | **307→/login** (stays GATED) | 200 | D29 — privacy review v0.5+ |
| `/members`, `/members/[slug]` | **307→/login** (stays GATED) | 200 | D29 — per-member opt-in v0.5+ |
| `/me/*`, `/this-week`, `/admin/*`, `/api/me/*` | 307→/login (always gated) | 200 / 200 | unchanged from v0.1 |
| `/login`, `/no-access`, `/consent`, `/api/consent/recover`, `/onboard*` | 200 (open) | varies | unchanged from v0.1 |

**Anonymous CTAs on member-content pages (Q6.2 / D29 lock):** when an anonymous visitor reaches a gated route, the destination 307→/login is preserved (v0.3.1 behavior). v0.4 Phase A does NOT introduce gated-landing-with-Sign-in-CTA pages — that pattern (per Q6.2 lock text "`/projects` gated landing: 'Member projects — sign in to see' + [Sign in with GitHub]") is reserved for v0.5+ if anonymous→apply conversion data signals demand. Phase A `/` hero serves as the global "what is this community" anchor.

**Reasoning for the v0.5+ defer:** Phase A's `/` hero already pitches the value proposition + Sign-in CTA on the URL-most-likely-to-be-shared. Adding per-gated-route landing pages would multiply the marketing surface by 3 (`/projects`, `/members`, `/decisions`) without clear demand signal. v0.5+ revisits once Phase A conversion data is available.

---

### 14.6 Manipulation-resistance

Per chat-22 §14B audit, v0.4 ships with three explicit anti-manipulation hardenings on top of v0.3's existing posture:

| Surface | Hardening | Why |
|---|---|---|
| **Signed-in `/home` "Your week" dashboard** | Passive surface — **NO streak counter, NO notifications, NO "you missed 2 weeks" guilt-tripping copy**. Counts what HAPPENED; never pressures what SHOULD. Test: no string in the component file matches `/streak\|missed\|don't break the chain/i`. | Q1.3 / §14B audit — dashboard could grow into streak gamification; pre-emptively disallow at the component-test level. |
| **`/` hero next-event ribbon** + **`/events/[slug]` Phase B hero** | **NEUTRAL framing only** ("Next: Wed May 21 · 18:30") — NEVER scarcity ("Only 2 spots left"). No countdown timers. No "spots remaining" rendered unless seats are actually limited by venue capacity field on the event frontmatter. Test: no string in the hero/ribbon component matches `/only \d+ spots\|spots remaining\|hurry/i`. | §14B audit — "Could induce FOMO" risk on the most-trafficked anonymous surface. |
| **All event/meeting count surfaces** (RSVP "Going (3)", attendee list count, "+M members") | **No-scarcity defaults.** Preserves ADR-0012 D12 `event_rsvp_visibility: "members_only"` opt-out. v0.4 inherits unchanged. | §14B audit — RSVP visibility opt-out gives members a privacy escape hatch; v0.4 must NOT regress. |

**No analytics in v0.4 (Q9.4 / D41 lock)** — no Plausible, no PostHog (despite character match!), no Google Analytics. v0.5+ revisits with traffic justification + GDPR/DPA review. **No cookie banner** in v0.4 (no tracking cookies → no banner needed; consent gate for write surfaces stays unchanged).

**No email / push notifications in v0.4** — no email infrastructure exists; PWA install prompt is browser-native only (no custom modal pestering).

**Kudos system** (v0.3 D19) inherits v0.3 posture: minimal, no leaderboard, no streak, no notifications, no public count beyond aggregate on `/projects/[slug]` (Phase B). NO escalation in v0.4.

**Member-profile activity feed: DROPPED from v0.4** per Q5.6 / D38 lock. Defer to v0.5+ with explicit anti-comparison design pass.

**Persona sharing + invite-tree visibility** — both flagged `[anti-manipulation review required]` in V0_5_BACKLOG; NOT in v0.4.

---

### 14.7 GDPR / threat-model

**Standing posture (v0.1 baseline preserved):** member consent gate on first login per ADR-0012 + onboarding flow. Roster admission is opt-in. GDPR export + delete endpoints (`/api/me/export`, `/api/me/delete`) preserved unchanged. No new authentication mechanism in v0.4.

**v0.4 new PII / leak surfaces (chat-22 §14C audit):**

| Surface | Risk | Mitigation |
|---|---|---|
| **`/` anonymous-public flip (ADR-0014)** | Session-coupled rendering could leak signed-in identity into anonymous responses (cache poisoning, server-component drift) | **H56** — `/` anonymous render asserts no `auth()` side-effects; `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` matches `/home`'s posture. Signed-in branch returns 302 only (no body). Test asserts response body for anonymous `/` does not include `@handle`, `Sign out`, or any member-specific data. |
| **`/` signed-in 302 with return-to** | Open-redirect via crafted `?from=…` parameter | **H57** — `from` parameter is validated against an allowlist of internal paths (regex `^\/[a-z0-9-_/]*$`) before being used in the redirect target. Anything else is dropped; redirect falls through to `/home`. |
| **`/handbook` anonymous render** | If Handbook ever surfaces ADR markdown content, must respect ADR-0012 / Anton's PII stance | v0.4 `/handbook` does **NOT** surface ADR content via UI (Q6.1 (i) lock). Links to GitHub instead. No PII risk. v0.5+ flip requires its own ADR with PII audit (V0_5_BACKLOG entry). |
| **Member avatar URL via Vercel `next/image` proxy** | SSRF via arbitrary `<Image src>` injection | **H59** — `next.config.ts` `images.remotePatterns` allowlist: `[{ protocol: "https", hostname: "avatars.githubusercontent.com" }]` ONLY. Any other image origin is rejected at request time. |
| **GitHub avatar served via Vercel edge proxy** | Vercel caches member avatars on edge → 3rd-party data exposure of member photos | **Acceptable per v0.1.0 GDPR posture** (GitHub avatar is already public web data — same image is served from GitHub's CDN to anyone visiting `github.com/<handle>`). Documented in this §. Member opt-out via `photo: false` frontmatter (H60). Phase A `<Avatar>` component honors the opt-out; H60 test verifies. |
| **RSS feeds (Phase C)** | Could leak gated content if title/excerpt logic isn't strict | **H61** — feeds NEVER include gated content (`/projects` + `/decisions` ADRs + `/members`). Meeting/event excerpts capped at 280 chars (mirrors ADR-0012 D7 status excerpt limits). Phase C test asserts that no feed item URL points into a gated surface. |
| **Anonymous render of event detail with `event_rsvp_visibility: "members_only"`** | Anonymous viewer might see "Going" members tagged `private` | **H66** — RSVP roster strip on anonymous render respects ADR-0012 D12. Only `public`-flagged members surface; hidden members contribute to a "+M members (sign in to see)" badge. Test asserts that no `private`-flagged member's name, handle, or avatar appears in the anonymous response body. |
| **`/calendar` unified index** | Could leak meeting attendees if data layer pre-includes attendee blocks | Confirm: ADR-0012's existing data-layer split (events public + attendee lists members-only) is preserved. `/calendar` route handler reads the **public** projection only. Test asserts no `members:` array or `attendees:` array surface in anonymous response. |
| **`/home` signed-in dashboard "Your week"** | Server Component rendering session data — must NOT cache | Already pattern-8-compliant per `docs/playbooks/recurring-plan-defects.md` (auth-aware → forces dynamic). H58 stability check covers. |
| **`<Avatar>` initials fallback** | Could leak last-name info from members who only published a first name | O6 lock — **single character (first letter of handle)** — avoids pseudo-identification entirely. |
| **`persona-builder/personas/*/` slug-folder mismatch** | Could expose persona content to wrong member's profile | **H68** — CI integrity check (`scripts/validate-persona-folders.ts`) asserts every `personas/<X>/` folder maps to a `roster.md` slug. Failure blocks PR merge. |

**GitHub-avatar-via-Vercel-proxy data flow (explicit §14C audit task):**

1. Member is on roster with `community/members/<slug>.md` frontmatter — no `photo: false` field.
2. Member's GitHub handle (`anton1rsod`) is in the roster row.
3. Any page rendering an avatar calls `<Avatar handle="anton1rsod" name="Anton Safronov" size={32} />`.
4. The component renders `<Image src="https://avatars.githubusercontent.com/anton1rsod?size=64" … />`.
5. Vercel's `next/image` proxy intercepts at request time: fetches GitHub avatar; transforms (WebP, resize, quality); caches at edge (default `Cache-Control: public, max-age=31536000, immutable`).
6. Subsequent requests for the same `(handle, size)` tuple from the same edge region return the cached transformed image.
7. **Edge cache scope:** the transformed avatar can be served to anonymous + signed-in users (same image; no per-user variant).
8. **PII consideration:** GitHub avatar URLs are public web data; Vercel caching does not introduce new exposure beyond what GitHub already serves to anyone. The data flow does NOT process personally-identifiable information beyond what the member voluntarily published to GitHub.
9. **Opt-out:** member adds `photo: false` to their `community/members/<slug>.md` frontmatter → `<Avatar>` renders initials fallback (single letter from handle). No GitHub avatar URL fetched, no Vercel proxy hit.
10. **GDPR delete impact:** removing a member from roster + deleting their `community/members/<slug>.md` removes all avatar render paths on the platform; cached transformed images at Vercel's edge expire on the existing TTL (max 1 year). Vercel does NOT retain personally-keyed avatar caches beyond URL.

**Cache-Control headers** (`§14C audit task #3`): Phase A test (`H56`) verifies that `/` returns `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` matching `/home`'s v0.3.1 posture. This prevents edge-cache leakage across the signed-in / anonymous branches of the same URL.

**No CSP / X-Frame-Options addition in v0.4** — adding Content-Security-Policy is a security-mode lift on its own that v0.4 thesis does not require. Note as v0.5+ backlog candidate (logged in `V0_5_BACKLOG.md`).

**Accessibility target (Q9.1 / D43 lock):** **WCAG 2.1 AA across the strict-list. AAA where feasible.** Verification: axe-core run on each strict-list surface; fix all "serious" + "critical" issues before ship. Specifics:
- Body text neutral-900 on white = 19:1 (AAA).
- Section labels neutral-500 = 6:1 (AA large).
- Primary CTA `accent-500` background with white foreground = 4.62:1 (AA).
- Skip-to-content link (H65) visible on Tab focus.
- ARIA landmarks (`<nav>`, `<main>`, `<header>`, `<footer>`) semantic; icon-only buttons get `aria-label`.
- Focus management: dialog/dropdown focus traps; close-on-Escape.

**Performance budget (Q9.2 lock — verified post-Phase-A against `projects/community-platform/perf-baselines/`):**

| Surface | LCP | CLS | TTI |
|---|---|---|---|
| Anonymous `/`, `/home`, `/calendar`, `/events/[slug]`, `/meetings/[slug]`, `/handbook` | <2.0s | <0.05 | <3.0s |
| Signed-in `/home`, `/me/edit`, `/members/[slug]`, `/projects/[slug]`, `/decisions/[slug]` | <2.5s | <0.1 | <4.0s |
| Auth gate (`/login`, `/consent`) | <3.0s | <0.1 | <4.0s |

---

### 14.8 Strict-list (100% coverage)

Phase A files added to `STATE.md`'s spec §8 strict-list (mirrors §13.9 convention). Coverage gate: **100% lines + 100% functions + 100% statements; ≥80% branches** (per CONSTRAINTS line 27 + v0.3 precedent).

| File | Phase | Why strict-list |
|---|---|---|
| `app/components/Header.tsx` | A | Global chrome; auth-state-aware; H58 stability + H65 skip-to-content + H58 dropdown shape |
| `app/components/Footer.tsx` | A | Global chrome; static content but multi-link |
| `app/components/Avatar.tsx` | A | PII / opt-out gate (H60); SSRF gate (H59 via `next/image` config) |
| `app/components/ListItem.tsx` | A | Consumed by 6+ surfaces; regression risk |
| `app/components/DateTime.tsx` | A | Date arithmetic + i18n boundary |
| `app/components/Tag.tsx` | A | Per-value tint mapping (O12) — Q4.8 accent-usage discipline at component level |
| `app/components/EmptyState.tsx` | A | Q3.5 codification — test asserts every render has a next-action OR calibration |
| `app/page.tsx` (root `/` route) | A | ADR-0014 + H56 anonymous render + H57 redirect |
| `app/calendar/page.tsx` | A | NEW route handler; H62 filter URL preservation |
| `app/handbook/page.tsx` | A | NEW route handler; Q6.1 (i) no-ADR-content assertion |
| `proxy.ts` | A | PUBLIC_PATHS extension — already on v0.1 strict-list; re-verify after Phase A diff |
| `lib/i18n/strings.ts` | A | Single-source-of-truth contract (H67) |
| `scripts/validate-persona-folders.ts` | A | H68 CI check — fails PR merge if slug mismatch |
| `app/globals.css` | A | Token CSS variables (H64 contract — naming + comment legend) |
| `app/components/HomeFeed.tsx` (modified) | A | Adds "Your week" dashboard pane for signed-in render |

**Phase B + Phase C add their own strict-list rows when activated; not part of v0.4.0 ship.**

`scripts/validate-persona-folders.ts` and `app/globals.css` are not React components; they're verified by **(a)** custom CI step (Bash + Node check); **(b)** snapshot test of the parsed CSS variable list against an allowlist.

---

### 14.9 Hardening table (H56–H68; 12 entries, H63 retired)

Following HANDOFF_PROTOCOL §4 convention `describe("H<n>: ...")`.

| ID | Hardening | Surface | Test file (describe block) |
|---|---|---|---|
| **H56** | `/` anonymous render asserts no `auth()` side-effects (no session leak in body or headers); `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` matches `/home` posture | `app/page.tsx` (refactored for ADR-0014) | `tests/unit/h-v0-4.spec.ts` — `describe("H56: / anonymous render no session leak")` |
| **H57** | Signed-in `/` 302→`/home` preserves `?from=…` query parameter if it matches `^\/[a-z0-9-_/]*$`; otherwise drops it. Open-redirect prevention. | `app/page.tsx` + signed-in redirect path | `tests/unit/h-v0-4.spec.ts` — `describe("H57: / signed-in redirect preserves safe from")` |
| **H58** | Global `<Header>` shows correct auth-state UI without hydration flash; signed-in dropdown is **exactly 4 items** per Q2.4 (drops v0.3.1's "Members" item) | `app/components/Header.tsx` | `tests/unit/components/header.spec.ts` — `describe("H58: header auth-state stability + dropdown shape")` |
| **H59** | Member avatar URL allowlist limited to `avatars.githubusercontent.com` in `next.config.ts` `images.remotePatterns` (SSRF prevention) | `next.config.ts` + `<Avatar>` | `tests/unit/components/avatar.spec.ts` — `describe("H59: avatar remote allowlist")` |
| **H60** | `photo: false` frontmatter opts out of GitHub avatar render (initials shown instead); `next/image` never fetched | `lib/members.ts` + `<Avatar>` | `tests/unit/components/avatar.spec.ts` — `describe("H60: photo opt-out")` |
| **H61** | RSS feeds (Phase C) NEVER include gated content; meeting/event excerpts capped at 280 chars mirroring ADR-0012 D7 | `app/feed/meetings/route.ts`, `app/feed/events/route.ts` | `tests/unit/h-v0-4.spec.ts` — `describe("H61: RSS no-leak + excerpt cap")` (Phase C only) |
| **H62** | `/calendar` filter chip state encoded in URL query (`?filter=events`) — preserves on share / refresh | `app/calendar/page.tsx` | `tests/unit/h-v0-4.spec.ts` — `describe("H62: calendar filter URL")` |
| ~~**H63**~~ | ~~`/decisions` anonymous render~~ — **RETIRED** (Q6.1 A1 lock; no `/decisions` flip in v0.4) | — | — |
| **H64** | Token CSS variables documented in `app/globals.css` with naming convention (`--color-<role>-<weight>`) + comment legend | `app/globals.css` | `tests/unit/h-v0-4.spec.ts` — `describe("H64: token variable contract")` (parses globals.css; verifies allowlist) |
| **H65** | Skip-to-content link visible on Tab focus (keyboard a11y); first focusable element on `<body>` | `app/components/Header.tsx` | `tests/unit/components/header.spec.ts` — `describe("H65: skip-to-content visibility")` |
| **H66** | Event RSVP avatar strip respects ADR-0012 D12 `event_rsvp_visibility` defaults (anonymous sees `public`-flagged only) | `app/events/[slug]/page.tsx` | `tests/integration/anonymous-event-detail.spec.ts` — `describe("H66: RSVP roster visibility")` (Phase B unblocks full test; Phase A asserts on-render placeholder) |
| **H67** | `lib/i18n/strings.ts` is **single** source of UI text; grep for inline strings in Phase A strict-list JSX returns no v0.4 hits | `lib/i18n/strings.ts` + Phase A components | `tests/unit/h-v0-4.spec.ts` — `describe("H67: i18n string centralization")` (parses Phase A component files; asserts no string literal in JSX text node) |
| **H68** | CI slug-folder integrity check — every `persona-builder/personas/<X>/` folder maps to a `community/members/roster.md` slug | `scripts/validate-persona-folders.ts` + `.github/workflows/ci.yml` | `tests/unit/scripts/validate-persona-folders.spec.ts` — `describe("H68: persona slug-folder integrity")` |

**Net v0.4 hardenings: 12** (H56-H62 + H64-H68; H63 retired). **Total platform hardenings: 67** (v0.1: 13 + v0.2: 16 + v0.3: 26 + v0.4: 12).

**Test-prefix convention:** `describe("H<n>: ...")` for grep-verification at chat-25 closeout: `grep -rn "describe(\"H" projects/community-platform/tests/` returns 67 hits across the test suite.

---

### 14.10 Scope envelope

**Phase A is COMMITTED as v0.4.0.** Phase B + Phase C are CONDITIONAL on Phase A landing data + (post-ship) user-test feedback. Hard-cut on Phase A merge — **no feature flag**.

| Phase | Status | Scope | File count | Tag |
|---|---|---|---|---|
| **A — Shell + landing + Handbook + Calendar + token + wordmark** | **COMMITTED** | Global `<Header>` / `<Footer>` / `<Avatar>` / `<ListItem>` / `<DateTime>` / `<Tag>` / `<EmptyState>`; token CSS variables; warm-amber accent ramp; `/` anonymous hero (ADR-0014); `/calendar` route; `/handbook` route; signed-in `/home` "Your week" dashboard pane; wordmark; PWA icons + favicon regen; manifest theme color; skip-to-content + axe-core baseline; `lib/i18n/strings.ts` centralization; H56-H62 + H64-H68 hardenings; CI slug-folder integrity check (H68) | ~22-26 files | `v0.4.0` |
| **B — Detail templates** | **CONDITIONAL** on Phase A landing + user-test | Unified detail template family (3 variants A content / B event / C person sharing global shell, Q3.2 / D31); PostHog team-page member profile (Q5.6 / D38); Luma-style event detail with RSVP roster (Q5.7 / D39); project portfolio framing + per-project Decisions section (Q5.8 / D29) | ~15 files | `v0.4.1` |
| **C — Brand visual + RSS + illustrations** | **CONDITIONAL** on Phase A + B reception | 1-2 Notion-style illustrated touches (placement decided in chat-23 design-shotgun deferred; v0.5+ design pass may absorb); `/about` thin page; RSS feeds `/feed/meetings.xml` + `/feed/events.xml`; `<link rel="alternate" type="application/rss+xml">` discoverability in global header on anon-public surfaces; H61 hardening | ~10 files | `v0.4.2` |

**Total v0.4 timeline (Q10.4 / D44 lock):** 2.5-4 wks CC-time across phases. Worst case (B + C don't activate): v0.4.0 is the v0.4 ship; B + C absorbed into v0.5 cycle.

**Chat sequencing (Q10.4 / D44 lock recap):**
- chat-22 (DONE 2026-05-18) — brainstorm via `superpowers:brainstorming`.
- chat-23 (THIS CHAT) — spec via `superpowers:spec-writer` + ADR-0014 + (user-test skip + structural walkthrough substitute).
- chat-24 — Phase A implementation plan via `superpowers:writing-plans`.
- chat-25 — Phase A implementation (v0.4.0) via `superpowers:subagent-driven-development`.
- chat-26+ — Phase A landing review; user-test session decision; Phase B activation decision.
- chat-27+ — Phase B implementation (v0.4.1) if activated.
- chat-28+ — Phase C implementation (v0.4.2) if activated.

**PR strategy (Q10.5 lock):** **split per phase**. v0.4.0 ships as one PR. v0.4.1 + v0.4.2 each ship as separate PRs if their phases activate. Smaller PRs → faster reviewer-agent dispatch; each tag is a checkpoint; bisecting regressions stays cheap.

---

### 14.11 Out-of-scope confirmation

The following are confirmed NOT in v0.4 (and not in Phase B / C either unless explicitly noted):

| Q-id | Item | Status | Backlog ref |
|---|---|---|---|
| Q11.1 | Payments / commerce / subscriptions | NOT v0.4 | `V0_5_BACKLOG.md` |
| Q11.2 | Built-in KB / Q&A (GBrain owns) | NOT v0.4 | GBrain sub-project owns; cross-link only |
| Q11.3 | Route removal | NOT v0.4 (v0.4 adds, never removes) | n/a |
| Q11.4 | Backend / data shape changes | NOT v0.4 (pure UI/IA) | Frontmatter format stable; generated JSON artifacts stable |
| Q11.5 | Native iOS / Android apps | NOT v0.4 (PWA install is the mobile story) | `V0_5_BACKLOG.md` (member-photo-upload-UI etc. are v0.6+) |
| Q11.6 | DMs / real-time messaging | NOT v0.4 (Telegram remains conversation channel) | n/a (Q-1.3 anti-character lock) |
| — | **ADR-0013 `/decisions` anonymous flip** | **DROPPED from v0.4** (Q6.1 A1 lock) | `V0_5_BACKLOG.md` — re-evaluate v0.5+ after PII audit |
| — | `/members` + `/members/[slug]` anonymous flip | NOT v0.4 (privacy review needed) | `V0_5_BACKLOG.md` |
| — | `/projects` + `/projects/[slug]` anonymous flip | NOT v0.4 (privacy review needed) | `V0_5_BACKLOG.md` |
| — | Search / cmd-K command palette / GBrain Q&A integration | NOT v0.4 (catalog too small + GBrain integration earns own scope) | `V0_5_BACKLOG.md` |
| — | Dark mode | NOT v0.4 (token foundation only; design pass v0.5+) | `V0_5_BACKLOG.md` |
| — | Full brand identity (mascot / logo mark / illustration system / motion / extended palette) | Phase A delivers wordmark + accent; v0.5+ delivers rest | `V0_5_BACKLOG.md` |
| — | Polish localization translations | NOT v0.4 (structure prepared; translations v0.5+) | `V0_5_BACKLOG.md` |
| — | Member-profile activity feed | NOT v0.4 (dropped per Q5.6 / D38) | `V0_5_BACKLOG.md` |
| — | Storybook component documentation | NOT v0.4 (<30 shared components; RTL tests suffice) | `V0_5_BACKLOG.md` (v0.6+) |
| — | Analytics (Plausible cookieless option) | NOT v0.4 (no demand signal) | `V0_5_BACKLOG.md` |
| — | Member photo upload UI | NOT v0.4 (GitHub avatar suffices) | `V0_5_BACKLOG.md` (v0.6+) |
| — | Onboarding tour | NOT v0.4 (empty-state hints suffice) | `V0_5_BACKLOG.md` (v0.6+) |
| — | Personas v2 (external repos + own pages + sharing + refresh) | NOT v0.4 (PersonaPanel v0.2 preserved) | `V0_5_BACKLOG.md` |
| — | Community Skills / Tools / Reps directory | NOT v0.4 (strategic feature; placement TBD) | `V0_5_BACKLOG.md` |
| — | Academy linking | NOT v0.4 (placement TBD) | `V0_5_BACKLOG.md` |
| — | AI moderation / onboarding / support bots | NOT v0.4 (v0.5+ candidate) | `V0_5_BACKLOG.md` |
| — | Content-Security-Policy header addition | NOT v0.4 (own security-mode lift) | `V0_5_BACKLOG.md` (new entry; chat-23 surface) |
| — | `/projects` + `/members` + `/decisions` per-route gated-landing-with-Sign-in-CTA pages | NOT v0.4 (Phase A `/` hero serves global anchor; per-route landings v0.5+) | `V0_5_BACKLOG.md` |

**Phase B status:** the table above lists Phase B items as Phase A-deferred only when the Q-lock explicitly defers them; items locked for Phase B activation (detail templates, member team-page, etc.) are conditional-not-out-of-scope.

---

*This § (§14) drafted 2026-05-18 in chat-23 via `superpowers:spec-writer`. Source of decisions: `docs/specs/2026-05-17-community-platform-v0-4-brainstorm-output.md` (Anton-locked D21–D44 + H56–H68 + ADR-0014 candidate). Compensating-control input: `docs/research/v0-4-gstack-walkthrough-2026-05-18/findings.md` (structural walkthrough — zero D-id contradictions). Locks 14 open questions O1–O14 inline; O1 (hero copy) in §14.3; O2 (wordmark) in §14.1; O3 (accent ramp) in §14.1; O4 (Handbook roadmap pointer) in §14.3; O5 (footer links) in §14.3; O6 (initials algorithm) in §14.4; O7 (mobile slide-in animation) in §14.4; O8 (sidebar collapse breakpoint) — Phase B target, deferred to chat-24 plan; O9 ("Your week" data sources) in §14.3; O10 (i18n namespace structure) — deferred to chat-24 plan (mechanical decision); O11 (RSS item shape) in §14.3; O12 (Tag colors) in §14.4; O13 (per-project Decisions data model) in §14.3; O14 (user-test findings) — substituted by gstack walkthrough per chat-23 Anton call.*

*Next chat (24): `superpowers:writing-plans` writes Phase A implementation plan against this §14 + ADR-0014. Handoff at `docs/specs/2026-05-19-community-platform-v0-4-plan-writing-handoff.md` (drafted in this same chat-23 commit).*

## 15. v0.5.0 — Admin event-creation UI (`/admin/events/new`)

### 15.0 Intro & scope

v0.5.0 ships one tier of one feature: **admin-only direct-commit event creation via web form**. The git-only workflow used in chat-29 to seed `community/events/2026-05-21-meetup-4/` works fine at the desktop but fails as a mobile / away-from-desktop path (~5 min friction per event in the GitHub.com web editor for multi-file commits). v0.5.0 replaces that with ~30 sec of typing.

**Three-tier scope decomposition** (chat-31 brainstorm seed §2):

| Tier | What it does | Ships in | Trigger to re-evaluate |
|---|---|---|---|
| **1 — CREATE-ONLY** | `/admin/events/new` form → one new `community/events/<slug>/README.md` commit | **v0.5.0 (this spec section)** | n/a — scope-locked |
| 2 — CREATE + EDIT | + `/admin/events/<slug>/edit` form (SHA-gated) | v0.5.1 | Anton reports mobile edit friction |
| 3 — FULL LIFECYCLE | + status flip (cancel / complete) | v0.5.2 or later | First real cancellation + git-only flow inadequate |

Tier 2 and tier 3 are **explicitly deferred per [[feedback_ia_defer_future_placement]]** — they do not pre-commit any surface in v0.5.0 (separate `<EventEditForm>` later, not a polymorphic `<EventForm mode="create"|"edit">`).

**Source of design rationale:** [`docs/specs/2026-05-20-community-platform-v0-5-admin-events-new-brainstorm.md`](../../docs/specs/2026-05-20-community-platform-v0-5-admin-events-new-brainstorm.md) (chat-31 brainstorm seed). This §15 locks the contract; the seed retains the rationale and tradeoff narrative.

### 15.1 Surface (page + form + action + lib)

Single admin-only surface, 4 new files (~7 net including tests).

**`app/admin/events/new/page.tsx` (Server Component, ~30 lines):**

- `export const dynamic = "force-dynamic";` (matches `/admin/invite:8`; required because `auth()` runs per-request)
- Reads `auth()`; if `!session?.githubHandle` → `redirect("/login")`
- If `!isAdmin(session.githubHandle)` → `redirect("/home")`
- Reads `getDefaults().events` from `lib/community-defaults.ts` (current `defaultStartTime="18:00"`, `defaultDurationMinutes=120`, `defaultLocation="TBD — see event description"`)
- Renders `<EventForm action={createEvent} defaults={{ startTime, durationMinutes, location, host: session.githubHandle, today: new Date().toISOString().slice(0,10) }} />`

**`app/components/EventForm.tsx` (Client Component, ~150 lines):**

- `"use client"` controlled inputs
- Fields: title (required, max 200), date (`<input type="date">` required), startTime (`<input type="time">`), durationMinutes (number 1-600), location, host (pre-fills session handle), url (URL validation client-side), slug (optional override; placeholder shows live-derived value), body (monospace textarea, ~12 rows, pre-fills from sanitized `_template/README.md` content)
- "Preview" button → fetches `/api/preview-markdown?body=<body>` → renders HTML below textarea (re-uses v0.2 preview infra)
- "Create event" submit → calls action
- On success: client-side `router.push("/events/" + result.slug)`
- Error inline below submit; form input preserved on error

**`app/actions/create-event.ts` (Server Action, ~120 lines):**

- `"use server"`
- Re-verify RBAC (no-session ∪ not-admin collapse → single `"not_authorized"` error per H69)
- Zod-validate FormData via `CreateEventInputSchema` (title min 1 max 200, date YYYY-MM-DD regex, body max 50_000 bytes per H76, etc.)
- Compute slug: explicit `slug` field if provided; else `deriveEventSlug(date, title)` from lib
- Validate slug via `EventSlugSchema` from `lib/events.ts` (kebab + calendar-valid date per H71/H77)
- Snapshot pre-existence guard via `listEventsFromSnapshot()` per H70
- Compose README content via `composeEventReadme()`; round-trip-parse via gray-matter + `normalizeEventFrontmatter` + `parseEventFrontmatter` per H72; refuse on parse failure
- GitHub pre-existence guard: `gh.readFile(path)` must return null per H78 (defense-in-depth vs stale snapshot)
- Commit via `gh.writeFile(path, content, { message })` (no `sha` → new file semantics; `WriteOptions.sha?: string` is optional per `lib/github-app.ts:21`); CRLF strip handle per H73
- `revalidatePath` fan-out per H79: `/events`, `/events/<slug>`, `/home`, `/`, `/api/calendar.ics`
- Returns discriminated union `{ ok: true; slug } | { ok: false; error: "not_authorized" | "invalid_input" | "slug_exists" | "invalid_slug" | "internal_error" }`

**`lib/event-author.ts` (Pure, ~80 lines):**

- `composeEventReadme(input: EventAuthorInput): string` — emits snake_case frontmatter block matching the `_template/README.md` shape (`date`, `slug`, `title`, optional `start_time`, optional `duration_minutes`, optional `location`, optional `host`, optional `url`, `status` — always emitted, hard-coded "scheduled" per H75), followed by sanitized body (leading `---\n` stripped per H80)
- `deriveEventSlug(date: string, title: string): string` — `<date>-<slug(title)>` with NFKD-strip + lowercase + kebab + 60-char title-suffix cap

**Type contract:**

```typescript
export interface EventAuthorInput {
  date: string;
  slug: string;
  title: string;
  startTime?: string;
  durationMinutes?: number;
  location?: string;
  host?: string;
  url?: string;
  status: "scheduled" | "cancelled" | "completed";
  body: string;
}
```

(`status` accepts all three even though v0.5.0 only writes `"scheduled"` — the type is shared with tier 3 deferral; the action's H75 hard-codes the value.)

**Dependency (Phase 0 of v0.5.0-plan.md):** `lib/events.ts` `normalizeEventFrontmatter` is currently `function`-scope private (line 84). Export it: `export function normalizeEventFrontmatter(...)`. 1-character edit; no import cycle (events.ts doesn't import from event-author.ts).

### 15.2 Auth + RBAC contract

Two boundaries enforce admin-only:

1. **Page** (`app/admin/events/new/page.tsx`) — Server Component reads `auth()` + `isAdmin()`; redirects on fail. UX-only boundary.
2. **Action** (`app/actions/create-event.ts`) — Server Action re-verifies `auth()` + `isAdmin()`; collapses both no-session and not-admin into single `"not_authorized"` error. **The real RBAC boundary.**

The collapse closes the RBAC oracle (security-reviewer M2 finding from chat-9 mint-invitation): direct POST to the action endpoint without admin session must return identical error whether or not the caller is signed in. Cf. `app/actions/mint-invitation.ts:34-40`.

`isAdmin()` is defined in `lib/content-snapshot.ts` and reads the `admin: true` flag from `community/members/<slug>.md` roster files. Already shipped v0.1.1 + used by `/admin/invite` + `/admin/health`.

### 15.3 Frontmatter contract

The composed README must round-trip through `parseEventFrontmatter` cleanly. Composition rules:

| Field | Required | Source | YAML emission |
|---|---|---|---|
| `date` | yes | form `date` (YYYY-MM-DD) | unquoted: `date: 2026-05-28` |
| `slug` | yes | derived or override | quoted: `slug: "2026-05-28-foo-bar"` |
| `title` | yes | form `title` | quoted + escaped: `title: "Foo \"bar\" baz"` |
| `start_time` | optional | form `startTime` (HH:MM) | quoted if present: `start_time: "19:00"` |
| `duration_minutes` | optional | form `durationMinutes` (int 1-600) | unquoted int if present |
| `location` | optional | form `location` | quoted if present |
| `host` | optional | form `host` (defaults to `session.githubHandle`) | quoted if present |
| `url` | optional | form `url` (URL) | quoted if present |
| `status` | yes | **hard-coded server-side to `"scheduled"` per H75** | quoted: `status: "scheduled"` |

Body is appended after closing `---\n\n`. Leading `---\n` is stripped from body per H80 (prevents second frontmatter block injection).

### 15.4 Hardenings H69-H80

Twelve numbered hardenings; each maps 1:1 to a `describe("H<n>:")` test block.

| ID | Hardening | Enforced at | Test surface |
|---|---|---|---|
| **H69** | RBAC oracle defense — collapse no-session ∪ not-admin into single `"not_authorized"` error | `create-event.ts` (RBAC guard) | `create-event-action.test.ts` |
| **H70** | Slug collision (snapshot-level) — refuse if `listEventsFromSnapshot().some(e => e.slug === slug)` | `create-event.ts` (post-Zod, pre-compose) | `create-event-action.test.ts` |
| **H71** | Slug shape — `EventSlugSchema` (kebab + calendar-valid date) per `lib/events.ts:6-24` | `create-event.ts` (Zod safeParse) | `create-event-action.test.ts` + structural in `events.test.ts` |
| **H72** | Round-trip parse — composed README re-parses via gray-matter + `normalizeEventFrontmatter` + `parseEventFrontmatter` | `create-event.ts` (post-compose, pre-commit) | `create-event-action.test.ts` |
| **H73** | CRLF strip on session-derived handle in commit message + Co-Authored-By trailer | `create-event.ts` (commitMessage construction) | `create-event-action.test.ts` (precedent: `rsvp-event.ts:100`) |
| **H74** | Path constructed server-side — admin cannot inject arbitrary path; `EventSlugSchema` rejects `..` / `/` / non-kebab | `create-event.ts` (after slug validation) | `create-event-action.test.ts` |
| **H75** | Status hard-coded `"scheduled"` server-side; form does not expose status field | `event-author.ts composeEventReadme` | `event-author.test.ts` + `create-event-action.test.ts` |
| **H76** | Body size cap 50 KB — `body.length > 50_000` → Zod fail → `"invalid_input"` | `create-event.ts CreateEventInputSchema` | `create-event-action.test.ts` |
| **H77** | Date Zod regex + calendar validity — `^\d{4}-\d{2}-\d{2}$` + `EventSlugSchema.refine` catches non-calendar dates (e.g. `2026-02-31`) | `create-event.ts` (Zod + slug refine) | `create-event-action.test.ts` |
| **H78** | GitHub-level pre-existence guard — `gh.readFile(path)` must return null before `writeFile` (defense-in-depth vs stale snapshot from H70) | `create-event.ts` (pre-commit) | `create-event-action.test.ts` (mocked client) |
| **H79** | Revalidate fan-out — on commit success, revalidate `/events`, `/events/<slug>`, `/home`, `/`, `/api/calendar.ics` (5 paths) | `create-event.ts` (post-commit) | `create-event-action.test.ts` (revalidatePath call assertions) |
| **H80** | Body frontmatter injection guard — `composeEventReadme` strips leading `---\n` from body before append | `event-author.ts composeEventReadme` | `event-author.test.ts` |

**Risk surface coverage:**

- **Authorization:** H69
- **Input validation:** H70, H71, H76, H77
- **Output integrity:** H72, H75, H80
- **Path / injection:** H73, H74, H78
- **Reactivity:** H79

Hardening density (12 / 1 surface) matches v0.1.1 invitation feature density (13 / 1 surface) because admin write to canonical content + ICS fan-out has comparable risk shape.

### 15.5 Testing & coverage

**Unit — `tests/unit/event-author.test.ts`:**

- `composeEventReadme` happy path with all fields → string round-trips through gray-matter + `parseEventFrontmatter` cleanly
- `composeEventReadme` optional-fields-omitted → frontmatter omits them (matches `_template/README.md` shape of bare keys, not commented-out)
- `composeEventReadme` H75 — even if `status` param is `"cancelled"`, output is **NOT** the test target since the type is shared; tier-1 H75 is enforced at the *action* layer (action only ever passes `"scheduled"`)
- `composeEventReadme` H80 guard — body starting with `---\nmalicious: true\n---\n` → composed README has only one frontmatter block
- `composeEventReadme` YAML escape — multi-line title, embedded `"`, embedded `\` all round-trip cleanly
- `deriveEventSlug` happy path — `"AI Community | Meetup #5"` + `"2026-05-28"` → `"2026-05-28-ai-community-meetup-5"`
- `deriveEventSlug` edge cases — empty title (degenerate `<date>-`; rejected downstream by `EventSlugSchema`), unicode accents (NFKD strips), >60-char title (suffix capped), double-spaces, leading/trailing whitespace, Polish characters

**Coverage target — `lib/event-author.ts`:** 100% lines + 100% branches (pure functions; achievable).

**Integration — `tests/unit/create-event-action.test.ts`** (mocked `GitHubAppClient`):

12 `describe("H<n>:")` blocks, one per hardening. Each block tests:

- The hardening fires for the violation case (e.g., H69 — direct call without session → `"not_authorized"`; H70 — snapshot contains slug → `"slug_exists"`; H72 — mock `parseEventFrontmatter` to throw → `"invalid_input"`)
- The happy path passes through the hardening (e.g., H69 with admin session proceeds; H79 success-path triggers 5 revalidatePath calls)

**Coverage target — `app/actions/create-event.ts`:** 100% lines + ≥80% branches (defensive `"internal_error"` fallbacks acceptable per v0.1+v0.2+v0.3 strict-list precedent).

**E2E:** **Deferred to v0.5.1** per O6 lock (matches v0.3 precedent of deferring 14 scenarios to v0.4). E2E happy path commits to git; needs sandbox-repo env override (or full GitHub App mock at route level) — not a v0.5 MVP scope decision.

**§15 strict-list (additions to spec §8 strict-list):**

- `lib/event-author.ts` — 100/100/100
- `app/actions/create-event.ts` — 100% lines (≥80% branches accepted for `internal_error` defensive paths)

### 15.6 ADR-0015 reference

[`docs/decisions/0015-admin-write-permissions-for-events.md`](../../docs/decisions/0015-admin-write-permissions-for-events.md) — **Accepted 2026-05-20** at v0.5 spec lock (chat-31). Matches ADR-0014 precedent of "Accepted at spec lock, not deferred to ship" — the ADR records the *decision*, which is locked here; v0.5.0 implementation is the *consequence*, recorded in CHANGELOG when it ships.

**Decision:** Admin-only direct commit via warsaw-ai-bot. Member-proposed events with admin moderation deferred to a future ADR (own brainstorm — governance, permissions, spam risk, moderation flow; v1.0+ candidate per chat-29 V0_5_BACKLOG entry).

**Rationale (one-paragraph):** matches every other write surface in this codebase (profile, RSVP, thanks, consent — all direct commits, no PRs). PR-based admin writes would add round-trip latency without value (admin reviewing their own PR is theater). Audit trail = git commit history + warsaw-ai-bot bot identity + Co-Authored-By trailer for the admin's GitHub handle. Manipulation-resistance: admin pool size ≤3 and `isAdmin()` list lives in `community/members/<slug>.md` `admin: true` (transparent + auditable).

See ADR-0015 for full Context / Options / Decision / Easier-Harder / Implementation references / Change-control.

### 15.7 Out of v0.5.0 (deferred to v0.5.1+)

- **Tier 2 — `/admin/events/<slug>/edit`** (deferred to v0.5.1; SHA-gated like saveProfile)
- **Tier 3 — Status flip (cancel/complete)** (deferred to v0.5.2 or later; notification-sensitive)
- **`/admin/events` index page** (deferred to v0.5.1 when edit form lands; until then admin browses `/events` and uses git for edits)
- **Image upload** (no event hero image yet in the codebase; v0.6+ if needed)
- **Recurring event templates** (v0.6+ if cadence stabilizes)
- **Polish localization of form labels** (paired with v0.5+ next-intl track; v0.5.0 emits EN-only labels via `lib/i18n/strings.ts` structure inherited from v0.4)
- **Member-proposed events with admin moderation** (own brainstorm; v1.0+ candidate)
- **`pitch.md` / `outcomes.md` / `artifacts/` editing** (post-event content; out of scope for *creation* UI)
- **E2E happy-path Playwright scenario** (deferred to v0.5.1 per O6 — needs sandbox-repo decision)

### 15.8 Open questions locked

Twelve open questions from the chat-31 brainstorm seed §8, locked at v0.5 spec lock (chat-31):

| ID | Question | Lock |
|---|---|---|
| **O1** | Post-submit destination | **Redirect to `/events/<slug>`** (matches saveProfile pattern; admin sees what they created) |
| **O2** | Body preview | **Re-use `/api/preview-markdown`** (zero new infra; matches /me/edit pattern) |
| **O3** | Slug field UX | **Editable text input with placeholder showing live-derived value** (admin sees what they'll commit; one fewer click vs read-only-with-toggle) |
| **O4** | Body pre-fill | **Yes — pre-fill from sanitized `_template/README.md`** content (mirrors what admin does manually today) |
| **O5** | Reject past dates | **Allow with UI warning** (back-dating is a real workflow for retroactive write-ups; warn but don't block) |
| **O6** | E2E happy path | **C — skip for v0.5.0** (matches v0.3 deferral precedent; revisit in v0.5.1 with sandbox-repo decision) |
| **O7** | `/admin/events` index page | **No for v0.5.0** (deferred to v0.5.1 with edit form) |
| **O8** | Mobile form layout | **Single column** with native HTML date/time inputs (wizard is overengineering for 8 fields) |
| **O9** | Live slug derivation in form | **Yes** (client-side; uses `deriveEventSlug` lib; non-blocking) |
| **O10** | Submit button label | **"Create event"** (user-facing language, not git jargon) |
| **O11** | Host field default | **`session.githubHandle`** (admin = host by default; admin can override) |
| **O12** | Audit logging | **Git commit history + warsaw-ai-bot identity + Co-Authored-By trailer** is the audit (no separate audit ledger) |

**Locked-but-marked-for-re-evaluation:**
- O5 — if mis-typed past dates cause real confusion, switch to "block with override checkbox" in v0.5.1.
- O6 — sandbox-repo decision for E2E moves with v0.5.1 scope.

### 15.9 Multi-admin slug race (accepted limitation)

H78's `readFile` + `writeFile` pair is **not atomic**. Two admins creating the same slug within ~1 sec → both see `readFile === null` → both call `writeFile` → GitHub returns 422 on the second call → action returns `"internal_error"`. Second admin retries → `readFile` returns non-null → `"slug_exists"`.

**Accepted for v0.5.0** because:
- Admin pool ≤3; concurrent admin creation is vanishingly rare.
- Failure mode is non-destructive (second admin's work not silently lost; explicit retry produces clear `"slug_exists"`).
- Atomic compare-and-create requires `commitMultipleFiles` (multi-file commit API with `expectedHeadSha` per `lib/github-app.ts:33-42`) and a more complex code path; not worth the v0.5.0 scope.

**Re-evaluate** if admin pool grows to ≥5 OR a real race is observed in CHANGELOG (CHANGELOG-tracked, not spec-tracked).

### 15.10 Implementation phases (preview — full plan in `v0.5.0-plan.md`)

- **Phase 0 — Pre-flight** (~½ day) — export `normalizeEventFrontmatter` from `lib/events.ts`; create empty `lib/event-author.ts` stub.
- **Phase 1 — Pure lib + ADR** (~½ day) — `composeEventReadme` + `deriveEventSlug` + 100% unit tests; draft ADR-0015 (already drafted at v0.5 spec lock — Phase 1 just marks Accepted).
- **Phase 2 — Server action** (~1 day) — `create-event.ts` with all 12 H-IDs + mocked GitHub client unit tests.
- **Phase 3 — Page + form** (~1 day) — `page.tsx` + `EventForm.tsx` + integration tests for page+form+action wire-up.
- **Phase 4 — Reviewer dispatch + closeout** (~½ day) — security-reviewer + typescript-reviewer + code-reviewer dispatch; CHANGELOG [0.5.0]; STATE.md update; tag `community-platform-v0.5.0`.

**Total ~3.5 days** — single-chat-feasible via `superpowers:subagent-driven-development` at implementation time.

---

*This § (§15) drafted 2026-05-20 in chat-31 from the brainstorm seed at `docs/specs/2026-05-20-community-platform-v0-5-admin-events-new-brainstorm.md`. Locks all 12 open questions O1–O12 inline (§15.8) per the seed's recommended defaults; reviewer = Anton-via-Auto-mode "start next recommended phase" approval. ADR-0015 candidate referenced (§15.6); drafted same chat-31 commit. No prior chat-30 dependencies (admin-events-new is independent of v0.4 hotfix surfaces).*

*Next chat: implementation. `superpowers:writing-plans` produces `v0.5.0-plan.md` in the same chat-31 commit; the v0.5.0 implementation chat reads the plan + this §15 + ADR-0015 and runs `superpowers:subagent-driven-development` against 4 phases (~3.5 days). Trigger to start: when v0.5.0 is the highest-leverage scope on the chat menu (typically post-meetup-#4 retro + Phase B gate evaluation 2026-05-25+).*

---

## 16. v0.6.0 — Visual redesign (4 hero surfaces + shared chrome)

### 16.0 Intro & scope

v0.6.0 ships the platform's first deliberate aesthetic — a "warm maximalist" identity that takes the v0.4 amber posture (ADR-0014) and pushes it to the irreverent edge. Through v0.5.1 the platform has functioned but read as "generic Tailwind scaffold with sterile neutrals and default font" (Anton's chat-34 framing: *"doesn't look good at all for a top community platform"*). v0.6 corrects the visual ground without touching any data flow, auth, RBAC, or hardening contract.

**Scope envelope (chat-34 brainstorm lock):**

- **4 hero surfaces** — `/` (anon visitor entry) · `/home` (signed-in dashboard) · `/events` (index) · `/events/[slug]` (detail).
- **Shared chrome** — `Header.tsx` + `Footer.tsx` rewritten; every other page inherits.
- **Tokens** — palette extended (cream / ink / amber / dust), 3-font system via `next/font/google` (Fraunces variable + Inter kept + JetBrains Mono added).
- **New primitives** — `AmberTag`, `MonoLabel`, `Pill` (3 variants), `EventCard`.

**Out of v0.6.0** (separate future versions): `/members` redesign, `/me/edit` redesign, `/admin/events/new` redesign, `/handbook`, `/decisions`, `/projects`, dark mode (token slots laid but no `prefers-color-scheme:dark` block), Tailwind 3→4 migration (orthogonal infra change).

**Source of design rationale:** Chat-34 brainstorm. Visual locks captured in `docs/specs/2026-05-21-community-platform-v0-6-redesign-brainstorm.md` (this chat's handoff doc, includes ASCII descriptions of the 4 design-preview mockups since the live mockup HTML lives in gitignored `.superpowers/brainstorm/`).

### 16.1 Brainstorm locks (aesthetic / hierarchy / typography)

| Axis | Lock | Rejected alternatives + reason |
|---|---|---|
| Aesthetic flavor | **D — Warm maximalist** (PostHog amber evolved with serif italic display + mono technical voice + hand-drawn marks) | A Editorial refinement (too "tech blog"), B Brutalist Warsaw (too institutional for community), C Sharp-tech Linear/Vercel (crowded territory — every YC startup ships this) |
| Hierarchy lens | **Event-first** — next meetup is the hero; calendar dominates the fold | Shipping-first (build feed needs critical mass that doesn't exist yet), Member-first (LinkedIn move, lower personality) |
| Display serif | **Fraunces** (variable; SOFT + WONK axes for per-surface expression; OSS via Google Fonts) | EB Garamond (pulls toward "literary review" not "ships"), Playfair Display (everywhere now), DM Serif Display (one-note) |
| Body | **Inter** (kept; refined, readable; already loaded in v0.4) | n/a (no swap needed) |
| Mono voice | **JetBrains Mono** (OSS via Google Fonts; readable, technical, popular) | IBM Plex Mono / Iosevka (no marginal value over JetBrains Mono) |
| Color anchor | **Amber `#f59e0b`** (kept from v0.4 ADR-0014; supporting palette = cream `#fef6e6` / ink `#1a1a2e` / dust `#8b6f3a`) | New dominant + accent system (would orphan v0.4 brand equity) |
| Dark mode | **Light-only for v0.6**; token slots laid for `prefers-color-scheme:dark` override in v0.7+ | Dark-first (too disruptive for one release); parity (deferred for token-stability) |
| Motion appetite | **Sober** — amber-tag −1.5° static tilt + EventCard hover translateY −2px; CSS-only; no JS animation libs; no page-load orchestration | Always-on ambient motion (perf cost), Hero page-load orchestration (over-engineered for current scale) |
| Surface scope | **All 4** — `/` + `/home` + `/events` + `/events/[slug]` (chat-34 Q4 single-select pick) | 3 surfaces (drops `/events/[slug]` which is Meetup #4's high-stakes page); 2 surfaces (feels incremental, not a v0.6 milestone) |
| Framework | **Tailwind 3.4 stays** + extended theme + custom CSS layer for variable-font axes | Tailwind 4 migration (orthogonal infra change; out of v0.6 scope); shadcn/ui adoption (architectural shift not warranted at current component count) |

### 16.2 Design tokens

**Palette** (`app/globals.css` `:root` — extends v0.4 H64 contract):

```css
:root {
  /* Existing accent ramp (v0.4 — kept) */
  --color-accent-50:  #fffbeb;
  --color-accent-500: #f59e0b;  /* amber anchor */
  --color-accent-600: #d97706;
  --color-accent-700: #b45309;

  /* v0.6 additions */
  --color-cream:      #fef6e6;  /* paper canvas */
  --color-cream-deep: #fdebc9;  /* gradient stop on hero blocks */
  --color-ink:        #1a1a2e;  /* primary text + header strip bg */
  --color-dust:       #8b6f3a;  /* mono-voice labels + secondary text */
  --color-paper:      #ffffff;  /* card bg over cream */
  --color-alert:      #dc1f1f;  /* error states only (no decorative use) */
}
```

Tailwind config extension exposes these as `bg-cream`, `text-ink`, `text-dust`, `bg-paper`, `text-alert` utility classes alongside the existing `accent-*` ramp.

**Typography** (`app/layout.tsx` `next/font/google` imports):

```typescript
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({  // kept from v0.4
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});
```

`<html>` carries all three variables: `className={`${fraunces.variable} ${inter.variable} ${jetbrains.variable}`}`.

**Type roles (Tailwind utility classes):**

- `font-display` → `var(--font-fraunces)` — italic, weight 900, used on H1/H2 hero headlines + the rotated "tag" highlight
- `font-body` → `var(--font-inter)` — body copy, button labels, regular UI text (matches v0.4)
- `font-voice` → `var(--font-jetbrains)` — mono labels ("// next meetup · in 6h 12m"), timestamps, handles, code

**Motifs (locked design language):**

- **Rotated amber tag**: `<span class="bg-accent-500 px-1 -rotate-[1.5deg] inline-block">tonight.</span>` — the signature gesture; appears on hero headlines AND date badges on EventCard
- **Mono label**: `<p class="font-voice text-[10px] uppercase tracking-[1.5px] text-dust">// next meetup · in 6h 12m</p>` — used to introduce every hero block
- **Pills (3 variants)**:
  - `<Pill variant="going">✓ going</Pill>` — solid ink bg, cream text, monospace
  - `<Pill variant="dashed">+ rsvp</Pill>` — dashed ink border, transparent bg
  - `<Pill variant="solid">+ calendar</Pill>` — solid ink border, transparent bg
- **0 radii** — `rounded-none` is the default; NO `rounded-md`/`rounded-lg` on EventCard, Header, Footer, Pill, or AmberTag
- **1.5px rules** — borders are `border-[1.5px] border-ink` (rejecting the 1px Tailwind default which reads as "Material Design template")
- **Spacing scale** — 4 / 12 / 24 / 48 px (Tailwind `1` / `3` / `6` / `12`); compact rhythm, NOT generous-whitespace

**Visual lock** — the cohesive system rendered as `design-preview.html` mockup with Tokens + Header + Footer + 4 surfaces side-by-side (chat-34 approval "nice"). HTML preserved in chat-34 brainstorm output doc.

### 16.3 Shared chrome — Header + Footer

**`app/components/Header.tsx` (Server Component, ~80 lines):**

- Top strip: `bg-ink text-cream font-voice text-[11px] tracking-[0.5px] px-4 py-2 flex justify-between`
- Left: `<span class="font-bold">warsaw.ai</span>` (replaces v0.4 "Warsaw AI" text logo; rendering matches the mono voice)
- Center: nav links — Home / Calendar / Members / Projects / Handbook — separated by ` · ` middots; current page rendered in amber via server-derived `usePathname()`-equivalent (`headers().get('x-pathname')` per H56 / v0.4 posture)
- Right (anon): `[ sign in ]` linked to `/login` (mono brackets are intentional — signals "command-bar" terminal voice)
- Right (signed-in): avatar chip (18×18 amber square with monogram initials) + handle + ▾ dropdown trigger
- Dropdown menu (kept from v0.4): Your week / Members / Edit profile / Sign out — same content, restyled to cream paper + ink type + mono labels on each row

**`app/components/Footer.tsx` (Server Component, ~40 lines):**

- `bg-ink text-cream font-display italic text-[11px] px-4 py-3 flex justify-between`
- Left: `© 2026 Warsaw AI Community · <span class="font-voice not-italic opacity-70">built in public, MIT</span>`
- Right: `<span class="font-voice not-italic text-[10px] opacity-85">about · telegram · github · license</span>`
- Per H62 (v0.4 lock): no second context strip; single band only
- v0.4.2 a11y fix preserved: no empty `aria-label` on placeholder divs

**Auth-state distinction (H64 / H66 preserve)**: Header server-renders the correct right-hand element from `auth()` — no client flicker, no `useEffect` hydration swap (chat-30 v0.4.8 force-dynamic posture extended to `/home`, `/events`, `/events/[slug]` per §16.4).

### 16.4 Hero surface compositions

All 4 surfaces follow the same structure: dark Header strip → cream body → dark Footer strip. The body is where each surface diverges.

**`app/page.tsx` (`/` anon visitor) — Server Component, `force-dynamic`:**

```
┌────────────────────────────────────────┐
│ // next meetup · in 6h 12m             │  ← MonoLabel
│                                        │
│ Warsaw AI                              │  ← Fraunces italic 900, 32px
│ ships in [public.]                     │     [public.] = AmberTag
│                                        │
│ Where Warsaw's AI builders learn,      │  ← Inter italic 13px (sub-tagline)
│ ship, and find each other.             │
│                                        │
│ ┌──────────────────────────────────┐  │
│ │ // tonight                       │  │  ← Next-event card
│ │ AI Community Meetup № 4          │  │     border 1.5px ink, paper bg
│ │ 19:00 · Grzybowska 85a · @anton  │  │
│ │ [RSVP →] [+ calendar]            │  │     Pill variants solid + dashed
│ └──────────────────────────────────┘  │
│                                        │
│ [sign in with github] [join telegram]  │  ← Pill variants going + dashed
└────────────────────────────────────────┘
```

`/` rewritten from `AnonymousHero` component (v0.4) to use new tokens. CTAs preserved per v0.4.2 a11y fix (text-neutral-900 on amber → AAA contrast).

**`app/home/page.tsx` (`/home` signed-in) — Server Component, `force-dynamic`:**

Same chrome; body diverges:
```
┌────────────────────────────────────────┐
│ // your week · meetup in 6h            │  ← MonoLabel personalized
│                                        │
│ Tonight, Anton—                        │  ← Fraunces italic 900, 32px
│ [Meetup № 4.]                          │     [Meetup № 4.] = AmberTag
│                                        │
│ ┌──────────────────────────────────┐  │  ← Same EventCard pattern as /
│ │ AI Community Meetup № 4          │  │     but with viewer-state pills
│ │ 19:00 · Grzybowska 85a           │  │     (going if user RSVPed)
│ │ [✓ going] [+ calendar]           │  │
│ └──────────────────────────────────┘  │
│                                        │
│ // this week · 3 ships                 │  ← Replaces v0.3 "Recent" header
│ ┃ @kazia · persona-builder v0.3   2h  │  ← Build-feed cards
│ ┃ @anton · community-platform v0.5.1 1d│     border-left 3px amber, paper bg
│                                        │
│ ┌──────────────────────────────────┐  │  ← Empty-state if no ships:
│ │ // no recent ships               │  │     italic Georgia "Next ship lands
│ │ Next ship lands when somebody    │  │     when somebody commits."
│ │ commits.                         │  │
│ └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

`/home` keeps existing data layer (`loadYourWeekData(member)` from v0.4.1; `contributions.json` + `recent` data). Visual layer rewritten.

**`app/events/page.tsx` (`/events` index) — Server Component, `force-dynamic`:**

```
┌────────────────────────────────────────┐
│ // events · 1 upcoming                 │
│                                        │
│ Events.                                │  ← Fraunces italic 900, 32px
│                                        │
│ [+ new event] [subscribe (ICS)]        │  ← Pill variants solid + outline
│                                        │     "+ new event" only if admin (H81)
│ // upcoming                            │
│ ┌──────────────────────────────────┐  │
│ │[21]  AI Community Meetup № 4     │  │  ← EventCard primitive:
│ │[MAY] 19:00 · Grzybowska 85a      │  │     amber date-badge tilted -1.5°,
│ │      [1 going]                   │  │     Fraunces italic title,
│ └──────────────────────────────────┘  │     mono meta line, going-count pill
│                                        │
│ // past                                │
│ No past events yet — Warsaw AI         │  ← Empty-state in Georgia italic
│ starts tonight.                        │     (dust color)
└────────────────────────────────────────┘
```

`/events` preserves the v0.5.1 "+ new event" admin-only button placement (H81). Subscribe to calendar link → `/api/calendar.ics` unchanged.

**`app/events/[slug]/page.tsx` (`/events/[slug]` detail) — Server Component, `force-dynamic` (v0.4.8 lock preserved):**

```
┌────────────────────────────────────────┐
│ // meetup № 04 · 21 may · 19:00 sharp  │
│                                        │
│ AI Community                           │  ← Fraunces italic 900, 30px
│ Meetup № 4 [tonight.]                  │     [tonight.] = AmberTag
│                                        │
│ 120 min · Grzybowska 85a · hosted by   │  ← mono meta line
│ @anton1rsod                            │
│                                        │
│ [✓ going] [interested] [+ calendar]    │  ← EventRsvpButton (v0.4.7 hydration
│                                        │     + v0.4.8 force-dynamic preserved)
│ ┌──────────────────────────────────┐  │
│ │ Agenda                           │  │  ← Article body in paper card
│ │ Persona setup · NDA signing ·    │  │     border 1.5px ink
│ │ Idea round · Validation skill.   │  │
│ │ When · Where (markdown article)  │  │
│ └──────────────────────────────────┘  │
│                                        │
│ // going (1)        // interested (0)  │
│ [AS]                No one's marked    │  ← Avatar tile grid (going)
│                     yet.               │     + dust italic empty (interested)
└────────────────────────────────────────┘
```

EventRsvpButton + AddToCalendar functional contract unchanged (props + hydration + force-dynamic from v0.4.7/v0.4.8). Only the visual presentation of the button + roster shifts to the new token system.

### 16.5 New primitives + component breakdown

| Component | Path | New / Modified | Lines (est) | Notes |
|---|---|---|---|---|
| `AmberTag` | `app/components/AmberTag.tsx` | **New** | ~15 | `<span class="bg-accent-500 px-[5px] -rotate-[1.5deg] inline-block">{children}</span>` |
| `MonoLabel` | `app/components/MonoLabel.tsx` | **New** | ~15 | `<p class="font-voice text-[10px] uppercase tracking-[1.5px] text-dust">{children}</p>` |
| `Pill` | `app/components/Pill.tsx` | **New** | ~30 | 3 variants via discriminated union: `'going' \| 'dashed' \| 'solid'` |
| `EventCard` | `app/components/EventCard.tsx` | **New** | ~50 | Date-badge + title + meta + going-count; used on `/events` index AND `/home` "next event" block |
| `Header` | `app/components/Header.tsx` | **Modified** | ~80 (was 90) | Strip rewrite; auth-state branches preserved |
| `HeaderMobileMenu` | `app/components/HeaderMobileMenu.tsx` | **Modified** | ~70 | Hamburger panel restyled to cream + mono nav; behavior unchanged |
| `Footer` | `app/components/Footer.tsx` | **Modified** | ~40 (was 35) | Dark band; serif italic + mono links |
| `AnonymousHero` | `app/components/AnonymousHero.tsx` | **Modified** | ~40 | Rewritten using new primitives; CTA contrast preserved (v0.4.2 H64) |
| `YourWeekPane` | `app/components/YourWeekPane.tsx` | **Modified** | ~50 | "Tonight, Anton—" personalization; uses AmberTag + MonoLabel |
| `HomeFeed` | `app/components/HomeFeed.tsx` | **Modified** | ~45 | Build-feed cards with `border-l-[3px] border-accent-500`; v0.4.3 `<DateTime>` integration preserved |
| `EventRoster` | `app/components/EventRoster.tsx` | **Modified** | ~50 | v0.5.1 H82 + H85 chip preserved; avatar tiles restyled |
| `EventRsvpButton` | `app/components/EventRsvpButton.tsx` | **Style-only** | unchanged | Functional contract preserved (v0.4.7 hydration; v0.4.8 force-dynamic); just swap class names |
| `Avatar` | `app/components/Avatar.tsx` | **Modified** | ~30 | Amber-bg monogram tile (matches Header avatar chip) |
| `ListItem` | `app/components/ListItem.tsx` | **Modified** | ~25 | Border-left amber + paper bg pattern |
| `EmptyState` | `app/components/EmptyState.tsx` | **Modified** | ~25 | Georgia italic + dust color + warm copy posture |
| `DateTime` | `app/components/DateTime.tsx` | **Style-only** | unchanged | Inherits new mono voice via parent classes |

**Untouched in v0.6**: `EventForm`, `ProfileEditor`, `StatusEditor`, `AskGBrainButton`, `ConsentModal`, `GdprPanel`, `TopContributors`, `ContributionCard`, `Tag`, `SafeHtml`. These keep current visual treatment until their parent surface is redesigned in v0.7+.

### 16.6 Empty states + motion + dark-mode posture

**Empty states (warm copy, never sterile):**

| Surface | When empty | Copy (s(key) entry) |
|---|---|---|
| `/home` next-event card | No upcoming event within 7 days | "Next meetup lands soon. Watch this strip." (italic) |
| `/home` ships feed | No commits in 7-day window | "Next ship lands when somebody commits." (italic) |
| `/events` upcoming | No upcoming events | "No upcoming events yet — Warsaw AI starts tonight." (italic, only true on launch night; static after) |
| `/events` past | No past events | "No past events yet — Warsaw AI starts tonight." |
| `/events/[slug]` going roster | 0 going | "Be the first to RSVP." (italic) |
| `/events/[slug]` interested roster | 0 interested | "No one's marked interested yet." (italic) |

All empty-state copy lives in `lib/i18n/strings.ts` under namespace `empty.<surface>.<slot>`. Existing `<EmptyState>` component (`<EmptyState text={s("empty.home.ships")} />`) restyled to dust italic Georgia.

**Motion (sober — no JS animation libs):**

- `AmberTag` — static `-rotate-[1.5deg]`, no animation
- `EventCard` — `hover:translate-y-[-2px] hover:shadow-[0_4px_0_0_#1a1a2e] transition-transform duration-150` (hard ink shadow on hover, matches the brutalist-edge motif)
- `Pill` variant=going — `hover:bg-accent-500 hover:text-ink transition-colors duration-150` on the RSVP toggle path
- Header active-page indicator — no transition (server-rendered per request, no flicker)
- No page-load orchestration; no parallax; no Lottie / Framer Motion / GSAP

**Dark-mode posture:**

Light-only for v0.6. Token slots laid in `:root`; v0.7+ can introduce a `@media (prefers-color-scheme: dark)` override block on the same custom properties without component churn. ADR-0014's "Phase A light only; v0.5+ dark-mode overrides land here" guidance extended to v0.7+.

### 16.7 i18n strategy

**ALL new copy flows through `s(key)` from `lib/i18n/strings.ts`** (flat-keys-with-surface-prefix per v0.4 O10 / H67 lock). New namespaces:

- `hero.anon.*` — `/` page copy (tagline, sub-tagline, sign-in CTA label, join-telegram CTA label)
- `hero.home.*` — `/home` page copy (your-week mono label, personalized hero, ships header, ships empty-state)
- `events.index.*` — `/events` page copy (title, upcoming label, past label, empty-states)
- `events.detail.*` — `/events/[slug]` page copy (mono lead-in label, going-roster label, interested-roster label, empty-states)
- `empty.<surface>.<slot>` — all 6 empty-state copies per §16.6 table
- `chrome.header.*` — Header copy (nav labels, sign-in CTA, dropdown items)
- `chrome.footer.*` — Footer copy (copyright, footer-nav links)

No hardcoded strings outside `s(key)`. New translation key inventory: ~35 entries; matches v0.4 / v0.5 namespace discipline.

### 16.8 Hardening preservation + new H87–H92

**Preserved (must grep-verify post-merge):** H56–H68 (v0.4 chrome / a11y), H69–H80 (v0.5 admin events), H81–H86 (v0.5.1 admin discoverability + safe-handle + log). `grep -rE 'describe\("H8[1-6]:' tests/` returns ≥6 hits at v0.6 merge.

**New v0.6 hardenings:**

| ID | Hardening | Test location |
|---|---|---|
| **H87** | Three Google Fonts loaded via `next/font/google` with `display: 'swap'` + Latin-only subset; no FOIT flash; no external `<link rel="stylesheet">` fallback (offline-safe) | `tests/unit/layout-fonts.test.tsx` |
| **H88** | All v0.6 new UI copy resolves via `s(key)`; no hardcoded English strings in `app/page.tsx`, `app/home/page.tsx`, `app/events/page.tsx`, `app/events/[slug]/page.tsx`, `Header.tsx`, `Footer.tsx`, `EventCard.tsx` (grep guard test) | `tests/unit/i18n-coverage-v0-6.test.ts` |
| **H89** | EventRsvpButton + EventForm + ProfileEditor functional contract preserved — props, server-action call shape, hydration behavior, force-dynamic posture all byte-identical (snapshot test on contract surface) | `tests/unit/v0-6-functional-contract-preservation.test.ts` |
| **H90** | Header amber active-page indicator computed server-side from `headers().get('x-pathname')`; no client-side flicker; matches the v0.4 H56 / v0.4.8 force-dynamic precedent | `tests/unit/header-active-page.test.tsx` |
| **H91** | All 4 v0.6 surfaces clear axe-core serious-violations gate on Vercel preview; v0.4.2 a11y baseline preserved (Footer no aria-prohibited-attr; CTA contrast AA-pass) | `e2e/v0-6-a11y.spec.ts` |
| **H92** | Color-contrast on every v0.6 token pair meets WCAG AA 4.5:1 (ink-on-cream, dust-on-cream, ink-on-paper, cream-on-ink, amber-on-ink, ink-on-amber); Fraunces italic at weight 700 size ≥14px verified | `tests/unit/contrast.test.ts` |

### 16.9 Testing & coverage

**Strict-list coverage targets (100% lines on each new file):**
- `app/components/AmberTag.tsx` — 100/100
- `app/components/MonoLabel.tsx` — 100/100
- `app/components/Pill.tsx` — 100/95+ (3 variant branches)
- `app/components/EventCard.tsx` — 100/95+

**Modified-file targets (≥80% baseline, no regression):**
- `app/page.tsx`, `app/home/page.tsx`, `app/events/page.tsx`, `app/events/[slug]/page.tsx` — visual rewrite preserves existing test coverage; new tests added for empty-state copy keys
- `Header.tsx` — coverage holds (v0.4 baseline 97.41% lines); active-page indicator + amber chip get new tests
- `Footer.tsx` — coverage holds; a11y gate preserved
- `YourWeekPane.tsx`, `HomeFeed.tsx`, `EventRoster.tsx`, `EventRsvpButton.tsx` — style-only or visual-only changes; behavioral tests unchanged

**E2E (Playwright vs Vercel preview):**
- `e2e/v0-6-shell.spec.ts` — Header strip renders (anon and signed-in variants); Footer band renders; current-page amber indicator appears on the right nav link
- `e2e/v0-6-surfaces.spec.ts` — each of 4 surfaces renders the expected hero composition (Fraunces italic title, MonoLabel, EventCard if event present)
- `e2e/v0-6-a11y.spec.ts` — axe-core serious-violations gate on all 4 surfaces (H91)
- Existing v0.4-shell, v0.4-a11y, v0.5.1 E2E tests stay green

**Lighthouse (vs Vercel preview, mobile + desktop):**
- Performance ≥90 (current baseline /login mobile 99 / desktop 100)
- Accessibility ≥90 (current baseline 100)
- Best Practices ≥90 (current baseline 96)
- SEO ≥90 (current baseline 91)

Font-loading is the perf risk: 3 Google Fonts with multiple weights → potential LCP regression. Mitigated by `next/font/google` self-hosting + `display: swap` + Latin-only subset + weight scoping (Fraunces 400/700/900, Inter 400/600, JetBrains 400/700 — total ~8 woff2 files, ~120KB compressed).

### 16.10 Out of scope (v0.7+ candidates)

- `/members`, `/me/edit`, `/admin/events/new`, `/handbook`, `/decisions`, `/projects/[slug]`, `/meetings`, `/meetings/[slug]`, `/this-week` redesigns
- Dark mode (`prefers-color-scheme: dark` token overrides)
- Tailwind 3 → 4 migration (orthogonal infra change)
- Internationalization beyond English (`s(key)` system supports it; no second locale defined)
- Page-load motion orchestration / Lottie / hero animations
- Custom illustration system (hand-drawn marks beyond the rotated tag are out)

### 16.11 Open questions locked

| O# | Question | Lock | Reason |
|---|---|---|---|
| O1 | Does `/home` use `force-dynamic` like `/events/[slug]`? | **Yes** — extends v0.4.8 posture | Header active-page indicator + viewer-state ships card require per-request render |
| O2 | Does `/` use `force-dynamic`? | **Yes** | Same reasoning + `headers().get('x-pathname')` for Header |
| O3 | Does `/events` use `force-dynamic`? | **Yes** | Same reasoning; admin "+ new event" button visibility per H81 already requires `auth()` on render |
| O4 | Does AmberTag rotate animate on hover? | **No** | Static tilt — animation reads as gimmick; v0.6 motion is sober per §16.6 |
| O5 | Does the dark Footer band repeat the dark Header band styling exactly? | **Yes** | Sandwich rhythm (dark / cream / dark) is the editorial framing motif |
| O6 | Are the 3 Pill variants in one file or 3 files? | **One file** with discriminated union | Single source of truth; matches `Tag` precedent (v0.3) |
| O7 | Does mobile have a different Header rendering? | **Yes** — `HeaderMobileMenu.tsx` panel restyled to cream + mono nav, same hamburger trigger | v0.4 H58 hydration stability preserved |
| O8 | Does the v0.6 spec amend ADR-0014, or warrant a new ADR-0016? | **Amend ADR-0014** | Same warm-amber posture extended with typography + token additions; no posture reversal |

### 16.12 Implementation phases (preview — full plan in `v0.6.0-plan.md`)

- **Phase 0 — Pre-flight** (~½ day) — `next/font/google` Fraunces + JetBrains Mono additions in `app/layout.tsx`; Tailwind config `theme.extend.colors` + `theme.extend.fontFamily` additions; `:root` CSS custom property additions in `app/globals.css`. Test that `pnpm tsc --noEmit` + `pnpm build` are green before any visual changes land.
- **Phase 1 — New primitives** (~1 day) — `AmberTag` + `MonoLabel` + `Pill` + `EventCard` with 100% unit-test coverage (H87 font loading, H88 i18n coverage, H92 contrast).
- **Phase 2 — Shared chrome rewrite** (~1 day) — `Header.tsx` + `HeaderMobileMenu.tsx` + `Footer.tsx` rewrite. H90 active-page indicator + v0.4.2 a11y baseline preserved.
- **Phase 3 — Hero surfaces rewrite** (~1.5 days) — `app/page.tsx` + `app/home/page.tsx` + `app/events/page.tsx` + `app/events/[slug]/page.tsx`. Per-surface unit + E2E tests.
- **Phase 4 — A11y + Lighthouse + reviewer dispatch** (~½ day) — H91 axe-core gate; Lighthouse vs Vercel preview; security-reviewer + typescript-reviewer + code-reviewer dispatch.
- **Phase 5 — Closeout** (~½ day) — CHANGELOG `[0.6.0]`; STATE.md update; tag `community-platform-v0.6.0`; memory entry `project_community_platform_v0_6_redesign.md`.

**Total ~5 days** — single-chat-feasible via `superpowers:subagent-driven-development` at implementation time.

---

*This § (§16) drafted 2026-05-21 in chat-34 from the brainstorm visual locks captured at `docs/specs/2026-05-21-community-platform-v0-6-redesign-brainstorm.md`. Locks all 8 open questions O1–O8 inline (§16.11) per the brainstorm-decision precedence. Visual approval: chat-34 "nice" on the `design-preview.html` mockup (gitignored under `.superpowers/brainstorm/`; ASCII descriptions preserved in handoff doc). Reviewer = Anton-via-Auto-mode "start next recommended phase" approval expected after spec self-review pass. No ADR-0016 — amends ADR-0014's warm-amber posture (typography + token additions are extensions, not reversal).*

*Next chat: implementation. `superpowers:writing-plans` produces `v0.6.0-plan.md` referencing this §16 + the brainstorm-output handoff. The v0.6.0 implementation chat reads the plan + this §16 and runs `superpowers:subagent-driven-development` against 5 phases (~5 days). Trigger to start: when Anton picks v0.6 from the menu post-Meetup #4 (typically 2026-05-22 or later, post-meetup retro).*
