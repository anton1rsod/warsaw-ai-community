# Handoff Protocol — community-platform

> **What this is:** the operating discipline every chat in this sub-project follows. Loaded once per chat (via the per-chat handoff doc that references this file). Not chat-specific.
>
> **Why it exists:** previous chats had ~60% of their iteration cost in self-review-prompt cycles (user nudging the agent to check itself) and ~25% in mid-flight assumption corrections. This protocol pushes those checks earlier, eliminating the iteration without sacrificing rigor.
>
> **When to read:** start of every chat in `projects/community-platform/`. Read once; reference by section number from chat-specific briefs.

## 1. Hardening discipline (mandatory pre-publish self-review)

**EVERY section, table, code block, or file the agent presents to the user MUST pass these 4 checks before publishing.** Catches found via the checklist are fixed inline — NOT surfaced in a separate "self-review findings" message that costs a turn.

| Category | What to check | How |
|---|---|---|
| **C1. Codebase verification** | Every claimed type, field, path, function, file, or convention is verified against actual v0.1 code | `grep`/`Read` the relevant file BEFORE claiming. Never assume. Common pitfalls below in §2. |
| **C2. Security self-review** | Info leaks, race windows, NPE risk, input validation gaps, open-redirect surfaces, log discipline | Walk the data flow once; for each user-supplied value, ask "could this leak / inject / overflow / NPE?" |
| **C3. Internal consistency** | Numbers match across sections; cross-references resolve; locked decisions are cited | When changing a number/list, grep the rest of the section/doc for stale references. |
| **C4. Ambiguity check** | Could plan-writing or implementation interpret this two ways? If yes, lock now. | For each spec'd behavior, ask "what's the simplest WRONG implementation that still passes this prose?" — fix the prose. |

**Test of success:** the user should never need to say "check yourself" or "did you verify X?" — the agent already did, and the publish-ready output reflects it.

## 2. Common assumption pitfalls (verify these against code, not memory)

These are the v0.1 facts most likely to trip up a fresh chat. Add to a chat-brief's "Verify-before-claiming queries" if relevant to that chat's scope.

| Assumption topic | Verification command | Why it bit prior chats |
|---|---|---|
| Session shape | `grep -n "session\." projects/community-platform/lib/auth.ts` | v0.1 uses `session.githubHandle` (custom callback), NOT `session.user.handle` (default Auth.js). |
| Consent file path | `grep -n "community/\|profilePath" projects/community-platform/app/actions/consent.ts` | v0.1 writes to `community/members/<slug>.md` (combined profile+consent), NOT `community/consent/<handle>.md`. |
| Aliases file format | `Read community/members/git-email-aliases.md` | 3 columns (`Git email \| GitHub handle \| Notes`), case-insensitive comparison, handle stored without `@`. |
| Roster format | `Read community/members/roster.md` | Two tables (Core organizers / Members) with different schemas. |
| Slug derivation site | `grep -rn "slugify\|toSlug" projects/community-platform/lib/` | Single helper in v0.1; reuse, don't reinvent. |
| Bot write helpers | `grep -n "writeFile\|createCommit" projects/community-platform/lib/github-app.ts` | v0.1 only commits SINGLE files via the bot — multi-file commits need a NEW helper. |
| Routing middleware | `grep -n "PUBLIC_PATHS\|matcher" projects/community-platform/proxy.ts` | Project uses `proxy.ts` not `middleware.ts`; manual `decode()`, not bare `auth()` (per CONSTRAINTS line 19). |
| E2E mock convention | `Read projects/community-platform/app/actions/_test-consent-store.ts` | `E2E_MODE=1` swaps real Octokit + Auth for in-memory mocks. |

## 3. Standard chat-brief template

Every chat-N handoff doc in `docs/specs/` follows this shape. Sections **with ★ are chat-specific**; the rest are filled from this protocol.

```
# Chat-N handoff: <topic>

PROTOCOL: projects/community-platform/HANDOFF_PROTOCOL.md (loaded once at start)

## ★ Setup
Branch off <origin/X>; prerequisites <list>.

## Read in order (~280 lines total — bounded by protocol §5)
1. STATE.md   (right-now state)
2. CONSTRAINTS.md   (locked rules)
3. GOTCHAS.md   (ops patterns)
4. <chat-specific reads, e.g., spec §X for plan-writing>

## ★ Verify-before-claiming queries (run early)
<chat-specific grep/read commands; see protocol §2 for common ones>

## ★ This chat owns
<the work product; skill to invoke; output location>

## ★ Done means
<deliverable list — committed code, STATE update, memory entry, next-chat brief>

## ★ Anti-patterns (chat-specific)
<things this chat should NOT do; e.g., "don't re-litigate Q1-Q7">

## ★ Paste-ready prompt
<self-contained prompt for the next chat to use as input>
```

## 4. Locked output conventions

| Convention | Format | Purpose |
|---|---|---|
| Hardening identifier | `H<n>:` (e.g., `H7: never logs token`) | Numbered for grep-verification at DoD |
| Question identifier | `Q<n>` (e.g., `Q4 lock`) | Cross-chat decision traceability |
| Spec section | `§X.Y` (e.g., `§11.5`) | Cross-chat document navigation |
| ADR | `ADR-NNNN` zero-padded | Per project conventions |
| Test prefix for hardening | `describe("H<n>: ...")` | Single grep verifies all hardenings present |
| Snapshot tests | `lib/__snapshots__/` (Vitest convention) | Format-as-contract regressions |
| Spec self-containment | Reproduce schemas from prior sections; cross-reference for full detail | Reader doesn't need to flip back |

## 5. When to consult what — token-budgeted read order

```
Always-read (~280 lines, every chat):
  STATE.md            (~110 lines)  right-now state of play
  CONSTRAINTS.md      (~85 lines)   locked rules
  GOTCHAS.md          (~105 lines)  ops patterns

Read on-demand (do NOT pre-read):
  spec.md             (1071 lines)  read specific §X.Y when chat scope touches it
  plan.md             (7700+ lines) read line-range from per-phase brief; never whole
  CHANGELOG.md                      read only if a specific historical fact is needed
  HANDOFF.md                        cold-pickup archive; rarely needed

Read once per project (cache mentally):
  CLAUDE.md           project entry point; read order
  README.md           project map
  HANDOFF_PROTOCOL.md (this file)

Per-chat brief (always read):
  docs/specs/<date>-<topic>-handoff.md   ~150-200 lines
```

**Read budget per chat:** ~500 lines is the sweet spot for context-window efficiency. Above ~800 lines and the chat starts paying for stale-context overhead.

## 6. Cross-reference resolution rules

When the agent writes a reference, the agent verifies at commit time:

| Reference form | Verification |
|---|---|
| `§X.Y` | `grep "^### X.Y\|^## X" <doc>` returns a hit |
| Function `foo()` | `grep -rn "function foo\|const foo =" <project>` returns a hit OR the function is being added in this PR |
| Path `<some/file>` | The file exists OR is being created in this PR |
| `Gotcha N` | The N-th row of GOTCHAS.md matches the description |
| `H<n>` | The hardening table in spec §11.5 has row H<n> |
| Commit SHA | `git rev-parse <sha>` succeeds (or it's a new commit being made) |

If a reference doesn't resolve, the agent fixes the reference (or removes it) BEFORE publishing. Stale references erode reader trust.

## 7. Anti-patterns (universal — applies every chat)

| Anti-pattern | Why bad |
|---|---|
| Pre-reading full `plan.md` or `CHANGELOG.md` | Burns context budget; relevant info is reachable on-demand |
| Re-litigating decisions locked in CONSTRAINTS or prior ADRs | Wastes turns; user has already decided |
| Introducing scope outside the chat brief | Scope-creep; spec amendments need ADR |
| Claiming a function/path exists without verifying | C1 violation; typically wrong |
| "I think the field is called X" | Either verify or don't claim |
| Mid-flight discovery of fact already in v0.1 code | C1 violation; should have verified upfront |
| Surfacing self-review findings in a separate post-publish message | Should be inline; iteration cost wasted |
| Sleep/poll loops in commands | Use Monitor (notifications), not sleep |

## 8. Sub-skill sequence (locked from project CLAUDE.md)

For any non-trivial sub-project work:
1. **`superpowers:brainstorming`** → spec section
2. **`superpowers:writing-plans`** → implementation plan
3. **TDD implementation** (Red → Green → Refactor → commit) per CONSTRAINTS line 26
4. **Reviewer agent dispatch** at closeouts — security-reviewer for security surfaces; typescript+code reviewers if monthly cap allows; otherwise CONSTRAINTS self-review checklist (lines 50-59)

A chat brief may NOT skip steps in this sequence (e.g., go from spec straight to implementation). Each step has its own chat.

## 9. Termination of each chat — wrap-up artifacts

Every chat that produces a substantive deliverable closes with these 3 artifacts:

1. **Commit + push to origin** (per project memory `feedback_push_commits`).
2. **STATE.md update** — bump `phase` field; add `last_verified` rows ONLY if state was actually re-verified.
3. **Per-project memory entry update** — status, link to deliverable, timeline row.
4. **Next-chat brief** — drafted at `docs/specs/<date>-<topic>-handoff.md` following the §3 template.

If any artifact is missing, the chat is incomplete — even if the deliverable itself was committed.

---

*Created 2026-05-03 after chat 7 (v0.1.1 invitation feature brainstorm) surfaced the iteration-cost pattern. Updates: append below if a new common pitfall or anti-pattern is observed.*

## Changelog

- **2026-05-03** — initial draft. Sourced from chat-7 self-review findings + token-cost analysis.
