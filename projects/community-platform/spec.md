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
