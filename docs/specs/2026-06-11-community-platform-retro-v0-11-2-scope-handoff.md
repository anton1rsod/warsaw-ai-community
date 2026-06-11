# Chat handoff: Community Platform — post-v0.12 hygiene (6/12 retro + v0.11.2 scope)

PROTOCOL: `projects/community-platform/HANDOFF_PROTOCOL.md` (loaded once at start)

**Date:** 2026-06-11 · **Supersedes** the v0.12 closeout handoff as the next-chat pointer (its open agenda items are now shipped or folded in below).

## Done already (this chat — 2 tracks, both on main)
- **Track 1 — ADR-0020 (Proposed) `af9376a`:** `/members/[slug]` → **per-member opt-in anonymous-public**. Two default-OFF profile-frontmatter flags: `profile_public` (renders the dossier to anon, minus the viewer-relative overlap lens) + `contact_public` (separately exposes the ask-about / Telegram handle). `/members` index stays gated; `noindex`; OG image route unchanged; proxy boundary-gate on the target slug's flag + in-route re-check; GDPR erasure withdraws naturally. Amends ADR-0012/0014; related ADR-0019. **Decision recorded, NOT built** — the build is the v0.12.1 candidate below.
- **Track 2 — hygiene PR #58 squash-merged `52648cc`:** (2A) added `log.info` + migrated the 7 completed-action logs `warn`→`info` + widened the eslint `no-console` allow-list + completed 2 incomplete `@/lib/log` test mocks; (2B) swapped the 5 v0.10-stale status E2E selectors `/what are you working on/i`→`/shipping log/i` (suite now covers both Quick + Rich). **Test baseline now 1812** (1808 + 4 `log.info` tests); CI green 2m9s; `status.spec` + `v0-9-write-paths` 8/8 at `--workers=1`.

## ★ Next work (pick with Anton)
1. **Fri 6/12 retro** — meeting-signup retro (first real-world use = the Thu 6/11 meetup) + next-scope brainstorm. Reminder `trig_01VcZ2jgMZvQFNSKapg3FuhB` (Fri 10:00 Warsaw).
2. **v0.11.2 scope** — brainstorm first per [[feedback_dont_skip_brainstorming]]. Candidates:
   - **Meeting-signup fast-follows** *(want the meetup's real-world signal → scope AFTER the retro, not blind)*: per-IP rate-limit (BotID/WAF) on redemption · signed fresh-member bridge cookie · persistent active-invite registry · meeting-token `iat` · revoke auto-retry-under-contention.
   - **Persona:** persona-builder should emit `persona_id`/folder == the member's roster slug (so alignment isn't manual — H68 + `readMemberPersona` then hold automatically) · resyncPersona/save-persona rate-limit (joins the rate-limit item).
   - **ADR-0020 build = the v0.12.1 candidate** — the per-member opt-in public dossier (spec/plan when scoped; self-contained; 1-line proxy + 2 flags + `/me/edit` toggles + `noindex` + tests).
3. **Infra / hygiene backlog:** vitest 2.1.9 → ≥3.2.6 (GHSA-5xrq-8626-4rwp; major test-runner change, **own task**) · E2E test-isolation quirk (process-global in-memory mock stores race under local default workers; CI safe at `workers=1` → candidate fix: per-worker store keying) · `log.info` **DONE** this chat.

## ★ Anton-side (non-blocking)
- VoiceOver pass over the v0.12 dossier `<details>` rows + heading rotor (spec §3 a11y; the v0.12 smoke verified the h1→h2 tree as proxy).
- Telegram env vars (`TELEGRAM_BOT_TOKEN`/`CHAT_ID`/`TOPIC_ID`) from v0.10 still unset — echo no-ops as `unconfigured` until set.

## ★ Verify-before-claiming
- Member pages gated / OG public: `curl -s -o /dev/null -w '%{http_code}' https://warsaw-ai-community-platform.vercel.app/members/anton-safronov` → 307; same path + `/opengraph-image` → 200. (Unchanged by ADR-0020 — it's a decision, not a deploy.)
- Test baseline **1812** unit/int. Run status/write-path E2E with `--workers=1` locally — default workers race the shared in-memory store.

## ★ Anti-patterns
- Don't re-open ADR-0020's decisions (driver / two flags / `noindex` / OG-public-for-all = Anton-locked this chat). **Building** it is fine; re-litigating isn't.
- Don't bump vitest mid-feature — own task.
- Don't scope the meeting-signup fast-follows blind — they want the 6/12 retro's real-world signal first.

## ★ Paste-ready prompt
> Open the Warsaw AI Community repo. Read order: root `STATE.md` → `projects/community-platform/STATE.md` → this handoff (`docs/specs/2026-06-11-community-platform-retro-v0-11-2-scope-handoff.md`). Read directly; don't invoke a resume skill. Run the 6/12 retro + scope v0.11.2 with Anton (brainstorming skill), folding in this handoff's candidates.
