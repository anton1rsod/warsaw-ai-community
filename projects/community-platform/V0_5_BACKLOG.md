# v0.5+ Backlog

> Items that are NOT in v0.4 scope. Captures the "good ideas, not v0.4" log from chat-21 menu closeout + (will append) chat-22 brainstorm deferrals.

**Update protocol:** Append-only when items get explicitly deferred. Each entry: source chat, scope rationale, suggested chat to re-address.

---

## From chat-21 menu (closed 2026-05-17 in chat-21-prep)

### Deferred because v0.4 likely restructures the surface

- **Task 4.2 — 14 Playwright E2E scenarios** (chat-21 Option B) — `e2e/v0-3-discovery.spec.ts` covering anonymous `/home`, `/this-week` L2 strip, RSVP toggle, RSVP race, orphan slug, ICS subscribe, AddToCalendar download, Thanks, self-thank blocked, duplicate-thank dedup, RSVP tri-state transitions, RSVP privacy posture, PWA install. **Why defer:** v0.4 will likely restructure `/home`, `/events/[slug]`, `/meetings/[slug]`, `/projects/[slug]` page templates (questionnaire Q3.2 + Q5.7 + Q5.8); E2E tests written today against v0.3.1 markup need re-authoring against v0.4 templates. Plan section reference: `projects/community-platform/v0.3.0-plan.md:4998-5196`. **Re-evaluate:** after v0.4 ships, against v0.4 strict-list.

- **test-reset-profile API route** (chat-21 Option F) — only needed to unblock RSVP race E2E scenario; paired with Task 4.2. Defers with it.

- **Dynamic viewer-state on `/projects/[slug]` + `/meetings/[slug]` ThankButton mounts** (chat-21 Option D) — currently both surfaces ship `<ThankButton initialState="not-signed-in">` (SSG-safe). **Why defer:** v0.4 Q3.2 may unify detail-page templates and Q5.8 may restructure project pages to portfolio-style; flipping these to `force-dynamic` now bakes in an SSG-vs-dynamic decision that v0.4 should make holistically. **Re-evaluate:** post-Q3.2 lock.

### Deferred because cosmetic / low-leverage

- **HomeFeed.tsx + meetings.ts literal 100% line coverage** (chat-21 Option G) — currently 98.86% + 98.61% (defensive fallbacks for relativeDate's "Today" branch and gray-matter malformed-frontmatter guards). **Why defer:** within v0.1+v0.2 strict-list precedent ("branches ≥80% acceptable for unreachable-defensive-fallback branches"). No bug correlation.

### Already done (preserved for traceability)

- ~~Signed-in `/home` smoke~~ (chat-21 Option A) — DONE 2026-05-17 by Anton; recorded in STATE.md `Last verified.v0_3_1_ship` and CHANGELOG `[0.3.1]`.
- ~~`[0.3.1]` CHANGELOG entry~~ — DONE 2026-05-17 (this commit).

### Folded into v0.4 brainstorm (NOT v0.5 backlog — on chat-22 questionnaire)

- **SSG-vs-dynamic direction lock for detail pages** (chat-21 Option H) — folds into questionnaire Q3.2 (detail page templates unified?) and indirectly Q8.x.
- **Unify Events + Meetings nav** (chat-21 Option I) — folds into questionnaire Q2.2.
- **Brand-asset PWA icons** (chat-21 Option C) — folds into questionnaire Q4.7 (logo direction; crowdsource from Telegram or design). v0.3.1 ships `#2563eb` solid placeholders.

### Open follow-up (waiting on external input or v0.4 outcome)

- **typescript-reviewer + code-reviewer dispatch on v0.3 strict-list** (chat-21 Option E) — quality finalization pass. **Why defer:** surfaces touched by v0.3 may get restructured in v0.4 (Q3.2 / Q5.6 / Q5.7 / Q5.8); reviewer findings on soon-to-change code would be re-litigated. **Re-evaluate:** dispatch against v0.4 strict-list after v0.4 ships.

- **Mark Spasonov roster backfill** (chat-10 Option A — still open) — PR #3 Draft on `chore/mark-spasonov-backfill`; placeholders `@MARK_TELEGRAM_HANDLE_TBD` + `MARK_GIT_EMAIL_TBD` need real values from Mark out-of-band. **Re-evaluate:** when Mark sends values.

---

## From chat-22 brainstorm

### Strategic open questions (placement TBD per [[feedback_ia_defer_future_placement]])

- **Community Skills + Tools + Reps directory** (option (iii) framing: combined member-capability + tool-stack + referrer surface). v0.5+ strategic feature aligned with marketplace-of-skills long-term ambition. Anton confirmed defer 2026-05-17. Placement TBD — could land under `/handbook` OR own top-nav slot OR `/members` extension. Re-evaluate at v0.5 brand+structure pass.

- **Personas v2** — external git repos per member + own pages (`/members/[slug]/<persona-id>`) + sharing model (cross-member granting) + refresh button from active external git repo. ~1-2 weeks of external-repo plumbing on top of route + UI work. Out of v0.4 envelope. v0.4 keeps PersonaPanel v0.2 as-is. CI slug-folder integrity check (H68) is the v0.4 prerequisite. Re-evaluate v0.5+ when persona-builder skill matures.

- **Academy linking** (internal + external course material). v0.5+ strategic feature. Anton's long-term vision per chat-22. Placement TBD — under `/handbook` OR own top-nav slot OR external linking only. Re-evaluate v0.5+ when first Academy content lands.

- **GBrain Q&A integration with cmd-K command palette** — semantic search across meetings + events + projects + decisions + members. v0.5+ strategic feature. Catalog too small for v0.4. Anton confirmed defer. Placement TBD — under `/handbook` OR cmd-K palette anywhere OR own `/ask` route. Re-evaluate v0.5+ when GBrain Q&A surface is production-ready.

- **AI moderation / onboarding / support bots**. v0.5+ candidate; Anton confirmed implement intent in chat-22. Could live in Telegram OR platform OR both. Re-evaluate v0.5+ design discussion.

### Privacy-flip deferrals (each requires its own ADR when re-evaluated)

- **`/decisions` + `/decisions/[slug]` anonymous flip** (the proposed-but-dropped ADR-0013 from chat-22). Anton's "hide all possible PII" stance in chat-22 deferred this. Markdown still public in git repo for transparency-curious anonymous viewers. Re-evaluate v0.5+ subject to PII audit task: grep `docs/decisions/*.md` for member-identifying fragments + sanitize. ADRs are sanitized governance memory per ADR-0001; flip should be safe post-audit.

- **`/members` + `/members/[slug]` anonymous flip**. Per-member opt-in privacy collection (~2 wks of out-of-band work) needed. Re-evaluate v0.5+ post member opt-in collection.

- **`/projects` + `/projects/[slug]` anonymous flip**. Refs individual contributors + git handles; privacy review needed. Re-evaluate v0.5+ once project showcase patterns settle.

### v0.4-deferred features (placement clearer)

- **Search via cmd-K command palette (GBrain-powered)** — catalog too small for v0.4; v0.5+ feature paired with GBrain Q&A integration above.

- **Dark mode** — token system foundation (CSS variables) ships in v0.4 Phase A; design pass (200+ contrast pairs + toggle UX) → v0.5+ after structure proves stable.

- **Full brand identity** — v0.4 locks wordmark + warm amber accent + tokens; full brand pass (logo mark + illustration system + custom motion + extended palette + mascot/character decision) → v0.5+ design pass.

- **Polish localization** — EN-only v0.4 with `lib/i18n/strings.ts` structure prepared; `next-intl` swap + `messages/pl.json` translation work → v0.5+ with community PL contributors.

- **Member-profile activity feed** — dropped from v0.4 per Q5.6 lock (pure PostHog team-page only). Defer to v0.5+ with explicit anti-comparison design pass.

- **Storybook component documentation** — <30 shared components in v0.4 + RTL tests + on-page usage suffice. Re-evaluate v0.6+ if multi-dev onboarding becomes friction.

- **Analytics (Plausible cookieless option)** — first-impression friction; community scale doesn't justify yet. Re-evaluate v0.5+ with traffic justification + GDPR/DPA review.

- **Member photo upload UI** — GitHub avatar suffices for v0.4; upload adds storage cost + moderation question + image-format validation. Re-evaluate v0.6+ if a member requests + storage decision lands.

- **Onboarding tour (interactive)** — empty-state hints + existing `/consent` + `/onboard` flow suffice. Re-evaluate v0.6+ if first-time UX metrics show drop-off.

- **Lobste.rs-style invite-tree visibility** — manipulation-risk audit flagged this as status-signaling. Defer to v0.5+ once 20+ invitations accumulate AND with anti-manipulation design pass.

- **`/about` content depth** — v0.4 Phase C ships a thin `/about` (charter pointer + roadmap link); full editorial → v0.5+ if anonymous → apply conversion lags.

- **3-level IA breadcrumbs** — v0.4 IA is shallow (2 levels: index → detail). Re-evaluate v0.6+ if entity nesting deepens.

- **Per-language language switcher in footer** — slot reserved in v0.4 footer but empty. Re-evaluate v0.5+ with next-intl.

- **Editorial photography for detail page heroes** — full-bleed hero requires asset library we lack. Re-evaluate v0.6+ optional.

- **Bottom tab bar mobile nav** — v0.4 ships hamburger (preserves scroll real estate). Re-evaluate v0.6+ only if mobile traffic dominates + member feedback supports.

### Conditional v0.4 phases (decided post Phase A user-test)

- **Phase B of v0.4** — detail-page template upgrades (Q3.2 + Q5.6 + Q5.7 + Q5.8): unified 3-variant template family + PostHog team-page member profile + Luma-style event detail + project portfolio framing with per-project Decisions section. ~15 files, ~1 wk. Decided AFTER Phase A v0.4.0 ships + 30-min user-test session findings. If not activated → Phase B work absorbed into v0.5 cycle.

- **Phase C of v0.4** — brand visual + RSS + illustrations: 1-2 Notion-style illustrated touches + `/about` page + RSS feeds (`/feed/meetings.xml` + `/feed/events.xml`). ~10 files, ~3-4 days. Decided AFTER Phase A + Phase B reception. If not activated → Phase C work absorbed into v0.5 cycle.

### Hardenings deferred from v0.4

- **H63 (originally proposed)** — `/decisions` anonymous render hardening. DROPPED from v0.4 per Q6.1 A1 lock. Re-introduce when `/decisions` flip ADR is re-evaluated v0.5+.

### Manipulation-resistance v0.5+ items

- Any feature that introduces gamification, streaks, leaderboards, scarcity framing, or notification pressure MUST come with an explicit anti-manipulation design review pass before ship. Applies to: Lobste.rs invite tree, persona showcase comparison, AI moderation bots that punish inactivity, Academy completion streaks, etc.

---

*Updated 2026-05-18 with chat-22 brainstorm deferrals. Original scaffold drafted 2026-05-17 in chat-21-prep close-out. Lives at `projects/community-platform/V0_5_BACKLOG.md` per "lean handoffs + deferred items get a home" convention.*
