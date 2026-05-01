# AI Collaborator Stack — How to Build Features in This Repo

> The opinionated stack for structured, feature-based development across all Warsaw AI Community sub-projects (GBrain, Persona Builder, Community Platform, future builds). Maps every step of a feature to a specific tool, command, skill, or agent.

**Audience:** AI collaborators (Claude Code, Codex, Cursor, OpenCode, Gemini CLI). Human contributors can read this too — same workflow.

**Last updated:** 2026-05-01
**Prerequisites:** [ECC](https://github.com/affaan-m/everything-claude-code) installed, [Superpowers](https://github.com/) skills available, [gstack](https://github.com/garrytan/gstack) symlinked at `~/.claude/skills/gstack`, repo root [CLAUDE.md](../../CLAUDE.md) loaded.

---

## 1. Mental model

A **feature** in this repo is a versioned bundle inside a project — one increment that takes the project from `0.A.B` to `0.A.C`. Features are the unit of structured work; tasks within a feature are the unit of execution.

The repo is **docs-first**: every feature begins with a brainstorm and a spec, not with code. Code is downstream of decisions, never the other way around.

The stack has four layers:

```
  ┌──────────────────────────────────────────────────────────────┐
  │  Governance + memory (CLAUDE.md, ADRs, memory/, rules/)      │
  ├──────────────────────────────────────────────────────────────┤
  │  Process skills (Superpowers — HOW to think)                 │
  ├──────────────────────────────────────────────────────────────┤
  │  Execution commands (ECC — WHAT to invoke, language-aware)   │
  ├──────────────────────────────────────────────────────────────┤
  │  Power tools (gstack — multi-angle review, QA, rollout)      │
  └──────────────────────────────────────────────────────────────┘
```

When in doubt:

- **Superpowers** decide HOW to approach a step (brainstorm vs. write plan vs. debug systematically).
- **ECC** is the language-aware execution layer (`/tdd`, `/build-fix`, `/code-review`, learning loop).
- **gstack** is the power-tool layer for multi-angle plan review (`/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/plan-devex-review`), browser QA (`/qa`), security audits (`/cso`), and staged rollout (`/canary`, `/guard`, `/freeze`).
- **Agents** are summoned by skills/commands as needed.

Surfaces overlap by design (gstack `/autoplan` + ECC `/plan` + Superpowers `writing-plans` are all "planning"). They cover **different angles** — Superpowers is the *discipline*, ECC is the *generator entry point*, gstack is the *adversarial multi-angle review*. Compose them; don't pick one.

---

## 2. The seven phases of a feature

Every non-trivial feature passes through these seven phases. Skipping a phase is a smell — if you're tempted to skip, write down why and proceed (the explicit reason becomes a learning signal).

```
  1. Research      →   2. Brainstorm  →   3. Spec     →   4. Plan
                                                              │
                                                              ▼
  7. Close-out     ←   6. Review     ←   5. Build (TDD)   ◄──┘
```

Each arrow is a **gate** — an artifact that proves the previous phase produced what the next phase needs.

| Phase | Output | Gate to next phase |
|---|---|---|
| 1. Research | Notes, ADR amendments, links | The unknowns are named |
| 2. Brainstorm | Draft spec | Founder reads the draft |
| 3. Spec | Accepted `spec.md` | Founder explicitly accepts |
| 4. Plan | Accepted `plan.md` (or `plan-X.Y.Z-<slug>.md`) | Plan is testable + sized |
| 5. Build | Code + passing tests | All TDD cycles green |
| 6. Review | Reviewer sign-off | Critical/High issues addressed |
| 7. Close-out | Tag + CHANGELOG entry + ADR(s) | `git tag` + merge to `main` |

---

## 3. Phase-by-phase: what to invoke

### Phase 1 — Research

**Goal:** Confirm we're not solving something that's already solved. Surface unknowns *before* the brainstorm.

**Required priority order** (see `~/.claude/CLAUDE.md`):

1. **GitHub search** — `gh search repos` and `gh search code`. Most undervalued tool.
2. **Library docs** — `/docs <library>` (Context7 MCP).
3. **Web search** — only after 1 and 2 are insufficient.

**Tools:**

| Use case | Invoke |
|---|---|
| Library API / framework usage | `/docs <library>` |
| Battle-tested skeleton | `gh search repos <topic>` |
| "Has anyone solved X" | `gh search code <symbol>` |
| Multi-perspective research | `Agent` tool with `subagent_type: blog-researcher` or `general-purpose` (parallel) |
| Time-bounded literature review | `superpowers:dispatching-parallel-agents` to fan out |

**Output goes in:** `docs/research/YYYY-MM-DD-<topic>.md`. One file per research thread, dated.

**Don't:** Skip this and start brainstorming. A brainstorm without research becomes bikeshedding.

### Phase 2 — Brainstorm

**Goal:** Land on a working spec by exploring options, not by stating answers.

**Always invoke:**

```
Skill: superpowers:brainstorming
```

This is a **rigid** skill — follow the checklist exactly. Brainstorming is the most undervalued skill in the toolbox; cutting it is the single highest-cost mistake an AI collaborator can make in this repo.

**What the brainstorm produces:** a draft `projects/<name>/spec.md` filled in §1–§10 of the project template, ready for founder review.

**Sub-skills that help (gstack):**

| When | Invoke |
|---|---|
| Need YC-style demand pressure (does anyone actually want this?) | `/office-hours` (gstack) — six forcing questions: who, how desperately, what they do today, why now, why you, narrowest beachhead |
| Founder wants a 10x re-frame | `/plan-ceo-review` (gstack) — challenges premises, expands scope where it produces a better product |
| Behavioral / psychology layer matters (gamification, retention loops) | `Skill: marketing-psychology` — runs through loss aversion, variable rewards, social proof, etc. |
| Security/threat shape obvious early (RBAC, PII) | `/cso` (gstack) — early threat-model brainstorm before spec hardens |
| Adversarial critique pass | Spawn parallel agents (`code-reviewer`, `security-reviewer`, `architect`) with the draft spec |

**Recommended sequence for a non-trivial feature:**

```
superpowers:brainstorming   →   /office-hours   →   /plan-ceo-review   →   draft spec
```

Each pass narrows toward a defensible answer rather than the first plausible one.

**Don't:** Write code during brainstorm. Don't propose a spec without first running the brainstorming skill.

### Phase 3 — Spec

**Goal:** Convert the brainstorm draft into an accepted `spec.md` that the founder signs off on.

**Workflow:**

1. AI presents the draft to the founder.
2. Founder reads, asks questions, requests changes.
3. AI revises in-place.
4. Founder explicitly says "accepted" — gate to Phase 4.
5. AI flips `Status: Draft` → `Status: Accepted` in the spec frontmatter.

**Don't:**

- Move past spec without explicit acceptance (no implicit "I'll start coding").
- Edit an accepted spec without writing a superseding spec or an ADR.

**ADR trigger:** if the spec contains 5+ decisions with reversibility cost, write an ADR alongside the spec acceptance.

### Phase 4 — Plan

**Goal:** Produce a `plan.md` (or `plan-X.Y.Z-<slug>.md` for a feature within a project) where every milestone has a verifiable success criterion.

**Always invoke (in this sequence):**

```
1. Skill: superpowers:writing-plans       # discipline (verifiable success criteria, test plan, rollback)
2. Command: /autoplan                      # gstack — generates draft plan body fast
3. Multi-angle review (gstack):
     /plan-eng-review                      # eng-mode: missing milestones, infeasible sequencing
     /plan-design-review                   # design-mode: UX of role-based flows, member journey
     /plan-devex-review                    # DX-mode: contributor friction
     /plan-ceo-review                      # CEO-mode (optional second pass on the plan, not just spec)
4. Command: /plan-tune                     # gstack — refine after multi-angle review
5. Founder accepts → set Status: Accepted in plan.md frontmatter
```

**Alternatives / power-ups:**

```
Command: /plan          # ECC entry point — invokes planner agent (use as fallback)
Command: /multi-plan    # ECC — parallel planning across models. Worth it for v0.1 architecture-defining plans
Agent: planner          # direct delegation
```

**Naming convention:**

| Project state | File name |
|---|---|
| Brand new project | `plan.md` |
| Feature within an existing project | `plan-<version>-<feature-slug>.md` (e.g. `plan-0.1.2-ask-bundle.md`) |
| Cross-project program plan | `docs/specs/YYYY-MM-DD-<topic>.md` |

**Required plan elements:**

- Milestones with **verifiable** success criteria (`Verify: <how we check>`).
- Test plan — unit / integration / E2E.
- Rollout strategy.
- Rollback strategy.
- Dependencies + blockers.

### Phase 5 — Build (TDD)

**Goal:** Implement the plan with tests-first discipline. Universal across languages.

**Always invoke:**

```
Skill: superpowers:test-driven-development
Command: /tdd
Agent: tdd-guide
```

**Per-language flavour** (uses the right test framework + reviewer):

| Language | TDD command | Review command |
|---|---|---|
| TypeScript / JS / Next.js (GBrain) | `/tdd` | `/code-review` |
| Python | `/tdd` | `/python-review` |
| Go | `/go-test` | `/go-review` |
| Kotlin | `/kotlin-test` | `/kotlin-review` |
| Rust | `/rust-test` | `/rust-review` |
| C++ | `/cpp-test` | `/cpp-review` |

**Rules** (from `~/.claude/CLAUDE.md` and `~/.claude/TDD.md`):

- Write the failing test first. Run it. **Confirm it fails for the right reason.**
- Minimum implementation that makes the test pass.
- Refactor. Re-run. Repeat.
- Coverage floor: 80% (`/test-coverage` to verify).
- Never disable a test to make it pass. Investigate.

**When stuck:**

| Situation | Invoke |
|---|---|
| Build won't compile | `/build-fix` (auto-detects language) |
| Test failing for unclear reason | `Skill: superpowers:systematic-debugging` or `/investigate` (gstack) |
| Multiple parallel sub-features | `Skill: superpowers:dispatching-parallel-agents` or `/devfleet` (ECC) |
| Need isolated workspace | `Skill: superpowers:using-git-worktrees` |
| Big feature, multi-step | `Skill: superpowers:executing-plans` |
| Touching member data, RBAC, migrations, or anything destructive | `/careful` (gstack) — slows the agent, asks before destructive ops |
| Need a "second pair of hands" | `/pair-agent` (gstack) — spawns a peer agent for collaborative work |

**For UI-heavy features (Community Platform specifically):**

| Need | Invoke |
|---|---|
| Explore design variants before committing | `/design-shotgun` (gstack) — generates multiple variants in parallel for comparison |
| Production-grade HTML/CSS from approved mockup | `/design-html` (gstack) |
| Design consultation on a flow | `/design-consultation` (gstack) |

**Anti-patterns** (from common LLM mistakes — see `rules/common/llm-discipline.md`):

- "I'll add a quick mock" — no, write the integration test.
- "Let me refactor adjacent code while I'm here" — surgical changes only.
- "I'll use `--no-verify` to skip the hook" — never. Investigate the hook failure.

### Phase 6 — Review

**Goal:** Catch what TDD didn't. Especially security and code-quality issues.

**Always invoke** (in order):

```
Skill: superpowers:requesting-code-review
Command: /review                 # gstack — opinionated reviewer, runs first
Command: /code-review            # ECC universal review, runs second
Command: /quality-gate           # ECC against project standards
Agent: code-reviewer             # detailed pass (if /code-review surfaces complex issues)
Agent: security-reviewer         # if user input, auth, or PII paths touched
```

**For UI-heavy features:**

```
Command: /design-review          # gstack — catches AI-slop UI (low contrast, inconsistent spacing, misaligned roles)
Command: /qa                     # gstack — real-browser QA via Playwright; run with each role's session
Command: /qa-only                # gstack — QA without a full review
Command: /devex-review           # gstack — onboarding/contributor friction audit
```

**Recurring (every 1–2 weeks regardless of feature work):**

```
Command: /cso                    # gstack — OWASP + STRIDE security audit. Critical for Community Platform (RBAC + member PII)
```

**For specific concerns:**

| Concern | Agent |
|---|---|
| TypeScript / JS idioms + types | `typescript-reviewer` |
| Python idioms / PEP 8 / typing | `python-reviewer` |
| Go concurrency / idioms | `go-reviewer` |
| Memory safety (C++) | `cpp-reviewer` |
| Database query design | `database-reviewer` |
| Architectural decision | `architect` |
| Documentation drift | `doc-updater` |

**Rules:**

- Address every **CRITICAL** and **HIGH** issue. Document **MEDIUM** if deferred.
- Receiving feedback: invoke `Skill: superpowers:receiving-code-review` — it has the disagreement protocol.
- If reviewer flags a security issue: STOP. Invoke `security-reviewer` agent. Resolve before proceeding.

### Phase 7 — Close-out

**Goal:** Make the work durable: tag, changelog, ADR, memory.

**Always invoke** (in order):

```
Skill: superpowers:verification-before-completion
Command: /verify                 # ECC — build + lint + test + type-check
Skill: superpowers:finishing-a-development-branch
Command: /freeze                 # gstack — lock the codebase during the release window
Command: /canary                 # gstack — roll to 1–2 friendly members first (Community Platform especially)
Command: /land-and-deploy        # gstack — opens PR, runs CI, deploys
Command: /document-release       # gstack — auto-generates the changelog entry
Command: /unfreeze               # gstack — unlock once stable
```

**Required artifacts:**

1. **CHANGELOG entry** — Keep-a-Changelog format. Move `[Unreleased]` items into a versioned section.
2. **Git tag** — `<project>-v<version>` (e.g. `gbrain-v0.1.2`).
3. **ADR(s)** — for any decision with reversibility cost made during build.
4. **Memory writes** — `~/.claude/projects/<repo-slug>/memory/` for non-obvious feedback or project state changes (see [memory rules in CLAUDE.md](../../CLAUDE.md)).
5. **Merge** — fast-forward to `main` after CI green. No squash (preserves the per-step history).
6. **Schedule clean-up** — if a feature flag, temp instrumentation, or migration shim was introduced, run `Skill: schedule` to set a follow-up agent.

**Optional but valuable:**

- `/retro` (gstack) — post-feature retro: what worked, what didn't, what to change.
- `/learn-eval` (ECC) — extract reusable patterns from the session **with a self-evaluation gate** before saving. Prefer over `/learn`.
- `/learn` (gstack or ECC) — same idea without the eval gate; use only when you trust the output.
- `/skillify` (gstack) **or** `/skill-create` (ECC) — if the work produced a reusable pattern, generate a SKILL.md. Pick one based on familiarity.
- `/document-release` (gstack) — already in the verify chain above, but worth re-running if the changelog needs polish.

---

## 4. The feature folder pattern

A project's directory expresses **versioning + feature scope**. The convention used by GBrain (and recommended for all projects):

```
projects/<project>/
├── README.md                                  ← what / why / who / status
├── spec.md                                    ← project-wide design
├── plan.md                                    ← original v0.1.0 plan
├── plan-0.1.2-ask-bundle.md                   ← per-feature plan, scoped to a version
├── plan-0.2.0-real-channel.md                 ← (future)
├── CHANGELOG.md                               ← Keep-a-Changelog
└── app/                                       ← implementation root
    ├── src/
    ├── tests/
    └── ...
```

**Rules:**

- One `spec.md` per project. Updates are appended sections (e.g. GBrain's `## At a glance — 90-day vision` was added later) or live in a new dated spec under `docs/specs/`.
- One `plan-X.Y.Z-<slug>.md` per feature. Don't keep editing one giant `plan.md`.
- ADRs live in `docs/decisions/` — never inside the project folder. They're cross-project numbered.
- Specs that survive a session live in `docs/specs/YYYY-MM-DD-<topic>.md`. Closeout / handoff / execution-prompt specs are valid first-class citizens.

**When to write a new feature plan:**

- New version line (e.g. v0.2.0 ⇒ new plan).
- Feature large enough that it has its own gates (e.g. v0.1.2 = "ask bundle" had its own E1/E2/E3 phases).

**When NOT to:**

- Single-file fix.
- Cosmetic changes.
- Pure refactors covered by `superpowers:test-driven-development` + existing tests.

---

## 5. Cross-cutting concerns

### 5.1 Memory layer

Three places things can be remembered. Pick the right one:

| Where | What goes there | When to write |
|---|---|---|
| **`docs/decisions/`** (ADRs) | Reversibility-cost decisions | At spec acceptance + close-out |
| **`docs/playbooks/`** | Repeatable procedures | When you've done it twice |
| **`~/.claude/projects/<slug>/memory/`** | User preferences, project state, feedback | When you learned something non-obvious that helps the *next* AI session |

Memory is **not** a place for code patterns (those live in code) or fix recipes (those live in commits). See `~/.claude/CLAUDE.md` "What NOT to save in memory."

### 5.2 ADR triggers

Write an ADR when:

- A decision with **reversibility cost** is made (architecture, license, governance, schema).
- The decision *might* be wrong and you want a paper trail.
- A future contributor will ask "why did we do this?".

Don't write an ADR for:

- Style / naming conventions (those live in `rules/`).
- Per-feature implementation choices (those live in the plan + commit).
- Things you're not sure of yet (write a spec or a research note instead).

### 5.3 Learning loop (ECC's continuous learning)

After every non-trivial session:

```
/learn-eval         # extract + self-grade patterns
/instinct-status    # see what's accumulated
/promote            # promote project-scoped instincts to global
/evolve             # suggest evolved skill structures from instincts
```

This makes the harness *itself* better over time. Worth running at the end of every feature close-out.

### 5.4 Hook layer

Hooks live in `~/.claude/hooks/hooks.json` and `.claude/settings.json` per project. Use them for:

- **PreToolUse** — block writes to forbidden paths (e.g. ingesting Telegram content without consent gating).
- **PostToolUse** — auto-format / lint / type-check after edits.
- **Stop** — final verification on session end.

For Warsaw AI Community: there's no project-local hook config yet. If we add one, route via `update-config` skill.

### 5.5 Multi-agent / parallel execution

For independent sub-tasks within a feature:

```
Skill: superpowers:dispatching-parallel-agents     # 2+ independent tasks
Command: /multi-execute                            # multi-model execution
Command: /multi-backend                            # backend-focused parallel
Command: /multi-frontend                           # frontend-focused parallel
Command: /devfleet                                 # parallel CC agents in worktrees
```

**When to fan out** (rule of thumb): if 2+ tasks have **no shared state** and **no sequential dependency**, run them in parallel. If they share state, sequence them.

---

## 6. The "perfect stack combination" — quick-reference card

| Phase | Superpowers skill (HOW) | ECC command (WHAT) | gstack power tool | Code-graph (MCP) | Agent |
|---|---|---|---|---|---|
| Research | `dispatching-parallel-agents` | `/docs` | `/browse`, `/investigate` | CodeGraph queries (`codegraph_explore`) | `blog-researcher`, `general-purpose` |
| Brainstorm | **`brainstorming`** | — | `/office-hours`, `/plan-ceo-review`, `/cso` (early threat-model) | — | `architect` (adversarial critique) |
| Spec | — | — | `/plan-ceo-review` (re-frame after brainstorm) | — | `architect` |
| Plan | **`writing-plans`** | `/plan`, `/multi-plan` | `/autoplan`, `/plan-eng-review`, `/plan-design-review`, `/plan-devex-review`, `/plan-tune` | Blast-radius queries for refactor plans | `planner` |
| Build | **`test-driven-development`**, `executing-plans`, `subagent-driven-development`, `using-git-worktrees`, `systematic-debugging` | `/tdd`, `/build-fix`, `/<lang>-test`, `/<lang>-build` | `/careful` (destructive ops), `/pair-agent`, `/design-shotgun`, `/design-html` | Symbol/call-graph queries instead of grep cascades | `tdd-guide`, `build-error-resolver` |
| Review | **`requesting-code-review`**, `receiving-code-review` | `/code-review`, `/quality-gate`, `/<lang>-review` | `/review` (run first), `/qa`, `/design-review`, `/devex-review`, `/cso` (recurring) | Touched-symbol blast radius | `code-reviewer`, `security-reviewer`, `<lang>-reviewer` |
| Close-out | **`verification-before-completion`**, **`finishing-a-development-branch`** | `/verify`, `/test-coverage`, `/refactor-clean`, `/learn-eval` | `/freeze`, `/canary`, `/land-and-deploy`, `/document-release`, `/retro`, `/skillify` | Auto-rebuild on git commit | `doc-updater`, `refactor-cleaner` |

**Bold = mandatory**. Bold skills you do not skip. Other items are tool-of-choice depending on the situation.

### 6.1 Decision matrix when surfaces overlap

| Concern | Use this | Skip this |
|---|---|---|
| Plan generation | `/autoplan` (gstack) wrapped by `superpowers:writing-plans` discipline | ECC `/plan` standalone (less opinionated; use only as fallback) |
| Plan review | gstack `/plan-ceo-review` + `/plan-eng-review` + `/plan-design-review` + `/plan-devex-review` | A single `code-reviewer` on the plan — too narrow |
| Code review | gstack `/review` first, ECC `/code-review` second | Skipping reviews — never |
| Pattern extraction | ECC `/learn-eval` (has eval gate) | `/learn` standalone (no quality gate) |
| Skill creation | gstack `/skillify` **or** ECC `/skill-create` (similar; pick one) | hand-rolled SKILL.md |
| Browser / role-based QA | gstack `/qa` | manual click-through |
| Rollout discipline | gstack `/freeze` → `/canary` → `/land-and-deploy` → `/unfreeze` | ad-hoc deploy then panic |
| Security audit cadence | gstack `/cso` every 1–2 weeks | one quarterly audit (too late) |

---

## 7. Anti-patterns (do not do these)

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Start with code, write spec later | Founder review can't catch design errors after they're coded | Run brainstorming before any code |
| Edit `spec.md` after acceptance without superseding ADR | Spec history becomes lossy | Append a dated section *or* write a new ADR |
| Run `/build-fix` repeatedly without root-cause | Fixes the symptom, not the cause | Step into `superpowers:systematic-debugging` |
| Skip TDD because "it's a small change" | Test-less changes regress at the worst possible time | TDD is universal — see `~/.claude/TDD.md` |
| Use `--no-verify` to bypass a failing hook | Hides real failures, leaks bad code | Investigate the hook |
| Add features adjacent to the user's request | Drive-by changes mask real intent + bloat PRs | Surgical changes only — every line traces to the request |
| Hardcode secrets in commits | Trivially leaked via OSS license | `.env` + Vercel env + ADR-0006 rotation |
| Ingest Telegram content without consent gating | Violates ADR-0001 + GDPR | `#kb` / `#archive` tag or topic-level consent only |
| Skip ADR for "small architectural" choice | Future-you forgets why | If it has reversibility cost, write the ADR |

---

## 8. Operating modes

The harness supports three modes. Pick the one that matches the work:

### 8.1 Single-session, low-risk
Bug fix, small feature, doc update. Stay in the main session.

### 8.2 Multi-session, larger feature
Use `/sessions` + `/checkpoint` to preserve state. Use `superpowers:using-git-worktrees` for isolation.

### 8.3 Recurring / scheduled
Use `Skill: schedule` for one-off agents (clean up a feature flag in 2 weeks, ramp a staged rollout). Use `Skill: loop` for recurring tasks (weekly digest health check).

---

## 9. Decision tree — "what do I invoke right now?"

```
Did the user ask for a new feature?
├─ Yes → Have we run brainstorming? 
│        ├─ No  → Skill: superpowers:brainstorming   (and STOP — let founder review)
│        └─ Yes → Has founder accepted spec?
│                 ├─ No  → Wait for founder review
│                 └─ Yes → Skill: superpowers:writing-plans
│
├─ Bug fix?       → Skill: superpowers:systematic-debugging   → /tdd
├─ Build broken?  → /build-fix
├─ Pre-commit?    → /verify  → /code-review  → /security-reviewer
├─ Stuck?         → /context-budget   (clearing space helps)  +  /docs <lib>
└─ Done?          → Skill: superpowers:finishing-a-development-branch
                    → CHANGELOG + tag + ADR(s) + /learn-eval
```

---

## 10. Project-by-project notes

### GBrain (`projects/gbrain/`)

- Implementation: TypeScript / Next.js App Router on Vercel, Gemini direct (post-0.1.1, see ADR-0007).
- Per-feature plan files: `plan-0.1.2-ask-bundle.md`, future `plan-0.2.0-*.md`.
- Tracking: see [`docs/playbooks/gbrain-operations.md`](gbrain-operations.md) and [`gbrain-rollout.md`](gbrain-rollout.md).
- ADRs scoped to GBrain: 0007 (architecture), 0008 (embeddings), 0009 (prompts), 0010 (`/summarize` deferral).

### Persona Builder (`persona-builder/`)

- Implementation: Markdown skill + scripts. No backend.
- Lives at repo root (not `projects/`) by historical convention — see `PROJECTS.md`.
- Personas live in `persona-builder/personas/<slug>/`.

### Community Platform (`projects/community-platform/`)

- **Status: Stub — pending brainstorm.** Do not write spec content until the user explicitly opens a brainstorming session.
- Locked inputs in `spec.md §0`: four-role access, gamification in scope, Telegram-complementary, OSS-first.
- Implementation tech: TBD in brainstorm.

**Stack emphasis for this project specifically** (vs. GBrain's bot-only surface):

| Concern | Why it matters here | Use |
|---|---|---|
| RBAC + member PII | Four roles, auth boundary, GDPR | `/cso` (gstack) every 1–2 weeks; `security-reviewer` on every auth-touching PR |
| Multi-role UX | Admin / CM / member / guest each have different surfaces | `/qa` (gstack) per-role browser session; `/design-shotgun` for surface variants |
| Tight community rollout | 0→19 in one shot is reputationally expensive if broken | `/canary` (gstack) to 1–2 friendly members first |
| Onboarding friction | Members must self-serve role assignment + profile setup | `/devex-review` (gstack) on every PR touching onboarding |
| Gamification mechanic ethics | Easy to slip into manipulative loops | `Skill: marketing-psychology` during brainstorm; explicit non-goal in spec |

---

## 11. gstack power tools — when each earns its keep

[gstack](https://github.com/garrytan/gstack) is symlinked at `~/.claude/skills/gstack`. It complements ECC and Superpowers with multi-angle plan reviews, browser-based QA, security audits, and staged rollout — all designed for fast, opinionated solo-builder shipping. Below is when to reach for each.

### 11.1 Demand pressure & scope challenge

| Tool | Use when | Skip when |
|---|---|---|
| `/office-hours` | New project / feature where demand is uncertain (Community Platform v0.1 is the canonical case — does anyone actually want it?) | You already have N organic asks for the feature |
| `/plan-ceo-review` | After brainstorm or after first plan draft, to challenge premises and find a 10x angle | Pure tech-debt cleanup with no product surface |

### 11.2 Multi-angle plan review

Run all four against the v0.1 plan; pick which to run on per-feature plans based on the surface touched:

| Tool | Catches |
|---|---|
| `/plan-eng-review` | Missing milestones, infeasible sequencing, dependency holes |
| `/plan-design-review` | Role-experience gaps, missing journey screens, accessibility, design-system drift |
| `/plan-devex-review` | Contributor friction, onboarding rough edges, dev loop slowness |
| `/plan-ceo-review` | Strategic misalignment, premature commitment, scope creep |

Pair with `/plan-tune` (gstack) for refinement and `superpowers:writing-plans` (Superpowers) for the underlying discipline.

### 11.3 Build-time helpers

| Tool | Use when |
|---|---|
| `/careful` | Touching member data, RBAC, migrations, anything destructive — slows the agent, asks before each destructive op |
| `/pair-agent` | You want a peer agent to collaborate (not delegate) — useful for tricky design or refactor discussions |
| `/investigate` | Bug hunt where the cause is unclear (pairs with `superpowers:systematic-debugging`) |
| `/design-shotgun` | UI variant exploration — generates multiple design variants in parallel for visual comparison |
| `/design-consultation` | Specific design questions on an existing flow |
| `/design-html` | Production-grade HTML/CSS from approved mockups (Community Platform UI) |
| `/browse` / `/connect-chrome` | Web research, screenshots from real sites, scraping public docs |

### 11.4 Review-time helpers

| Tool | Cadence | Output |
|---|---|---|
| `/review` | Every PR | Opinionated code review (run before `/code-review`) |
| `/qa` | Every PR touching UI; per-role sessions for Community Platform | Real-browser test pass via Playwright |
| `/qa-only` | When you only want the QA pass without a full code review | Faster than `/qa` |
| `/design-review` | Every PR with visual changes | AI-slop UI catches |
| `/devex-review` | Every PR touching onboarding or contributor flow | DX friction audit |
| `/cso` | Every 1–2 weeks (regardless of feature work) | OWASP + STRIDE security audit |

### 11.5 Rollout & release

| Tool | Use when |
|---|---|
| `/freeze` / `/unfreeze` | Code freeze during release window (lockstep with the GBrain merge-freeze pattern) |
| `/canary` | Roll feature to 1–2 friendly members before full launch — *especially* for Community Platform where 0→19 in one shot is high-risk |
| `/guard` | Mode flag — prevents the agent from making changes that break the canary while you observe |
| `/land-and-deploy` | Open PR, run CI, deploy — the actual ship action |
| `/document-release` | Auto-generates the changelog entry (Keep-a-Changelog format compatible) |

### 11.6 Continuous improvement

| Tool | Use when |
|---|---|
| `/retro` | Post-feature reflection — what worked, what didn't, what to change |
| `/learn` | Extract patterns into reusable form (no eval gate — prefer ECC `/learn-eval`) |
| `/skillify` | Turn a repeated pattern into a SKILL.md (pick this *or* ECC `/skill-create`, not both) |
| `/health` | gstack health check — verify tool is up to date |
| `/gstack-upgrade` | Update gstack — run periodically |

### 11.7 What gstack does NOT replace

- **TDD discipline** — Superpowers `test-driven-development` is still mandatory.
- **Language-specific tooling** — ECC's `/<lang>-test`, `/<lang>-build`, `/<lang>-review` are the language-aware execution layer.
- **Memory layer** — ECC's instinct system (`/learn-eval`, `/instinct-status`, `/promote`, `/evolve`) is the long-term learning surface.
- **Governance** — ADRs, charter, and CLAUDE.md.

gstack is a **power tool layer**: most valuable on plan-review, browser QA, and staged rollout. Use it as a multiplier on top of ECC + Superpowers, not a replacement.

---

## 12. Code-graph layer — symbol-aware context via MCP

When an AI agent explores a codebase, the Explore agent burns tokens on grep + read tool calls. A pre-indexed code-graph (Tree-sitter AST → graph of symbols + relationships, exposed via [MCP](https://modelcontextprotocol.io/)) cuts that cost dramatically — benchmarked at 84–96% fewer tool calls and 43–82% faster across 6 reference codebases.

**Adopted tool:** [`colbymchenry/codegraph`](https://github.com/colbymchenry/codegraph) (MIT, MCP, npx-installable). See [ADR-0011](../decisions/0011-code-graph-layer.md) for the full rationale and rejected alternatives.

### 12.1 When to use it

| Situation | Use code-graph? |
|---|---|
| Explore agent answering "how does X work" / "trace request flow" | ✅ Yes — replaces dozens of grep calls |
| "Where is symbol X defined?" / "What calls Y?" | ✅ Yes — pure graph query |
| Refactor risk analysis (blast radius of a change) | ✅ Yes |
| Reading a specific file the user named | ❌ No — just `Read` it |
| Markdown content (GBrain archive, ADRs, specs, playbooks) | ❌ No — code-graph is AST-aware, not content-aware |
| Persona files (persona-builder) | ❌ No — same reason |
| Cross-repo analysis | ❌ No — code-graph is project-scoped; use `gh search` |

### 12.2 Per-project setup

Indexes are **per-project**, not global. Each project's implementation root gets its own MCP config and gitignored index.

```
projects/gbrain/app/.mcp.json                       # CodeGraph MCP server config
projects/gbrain/app/.gitignore                      # exclude CodeGraph DB

projects/community-platform/app/.mcp.json           # added when implementation begins
projects/community-platform/app/.gitignore
```

Install once with `npx @colbymchenry/codegraph` — the interactive installer writes the right config for Claude Code automatically.

### 12.3 What code-graph does NOT cover

- **GBrain's content KB** — markdown archive stays on the Phase 2 pgvector roadmap. Different problem, different solution.
- **Persona Builder personas** — markdown by design.
- **Repo-level docs** — CLAUDE.md, ADRs, specs, playbooks are not indexed.
- **Cross-repo / multi-project graphs** — out of scope for the Warsaw OSS adoption.

### 12.4 Fallback: code-review-graph

If Warsaw later adds AI agents beyond Claude Code (Codex, Cursor, Windsurf, Zed, Continue, OpenCode, Antigravity, Qwen, Qoder, Kiro), [`tirth8205/code-review-graph`](https://github.com/tirth8205/code-review-graph) (MIT, Python) auto-configures MCP for 11 platforms in one install. Lower per-platform optimization than CodeGraph but broader coverage. ADR-0011 designates it as the swap-in candidate when multi-tool support becomes a real need.

### 12.5 Excluded: GitNexus

[`abhigyanpatwari/GitNexus`](https://github.com/abhigyanpatwari/GitNexus) is **PolyForm Noncommercial** licensed — incompatible with ADR-0001 (MIT) and ADR-0004 (commercial trajectory). Any contributor who proposes adopting it must first write a superseding ADR addressing the license incompatibility. Don't adopt it casually.

---

## Appendix A — Required reading before contributing

If you're an AI collaborator landing in this repo for the first time, read in this order:

1. [`CLAUDE.md`](../../CLAUDE.md) — repo-level operating principles.
2. [`PROJECTS.md`](../../PROJECTS.md) — current portfolio + statuses.
3. [`community/charter/charter.md`](../../community/charter/charter.md) — mission + values.
4. [`community/governance/governance.md`](../../community/governance/governance.md) — decision rules.
5. [`docs/decisions/README.md`](../decisions/README.md) — ADR index.
6. The README of the specific project you're working on.
7. This document.

If you're a human contributor, same list — minus this document. (You'll re-derive it intuitively.)

## Appendix B — Tool catalogue (full lookup)

For the complete inventory of installed ECC commands and skills, run `/projects` and `/skill-health`. To audit harness performance, run `/harness-audit`. To see what your harness has learned, run `/instinct-status`. For the gstack catalogue, run `/health` (gstack) or browse `~/.claude/skills/gstack/` directly. The full gstack command list is also in `~/.claude/CLAUDE.md`.

## Appendix C — Update cadence

This playbook is **the one place** the recommended stack lives. If you find yourself reaching for a different combination consistently, update the relevant table here rather than ignoring this doc — drift between practice and playbook is the failure mode this playbook exists to prevent.

When a new tool joins the stack (new ECC release, new gstack skill, new Superpowers skill, new MCP server):

1. Audit which phase it best supports.
2. Add it to the phase tables in §3.
3. Add it to the §6 quick-reference card.
4. If it's a gstack tool, add it to §11. If it's a code-graph or other MCP tool, add it to §12 (or a new §13 if it's a fundamentally new layer).
5. If the tool has a license that's not MIT-compatible, write an ADR documenting the exclusion **before** any session uses it.
6. Bump the **Last updated** date at the top.

