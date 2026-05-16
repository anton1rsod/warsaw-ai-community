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
