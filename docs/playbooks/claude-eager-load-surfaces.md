# Claude Code eager-load surface layout

> How `~/.claude/skills/` and `~/.claude/commands/` are organized to minimize session-start token cost. Both surfaces parse their entries eagerly into the system prompt — anti-pattern instructions in `CLAUDE.md` *suppress invocation* but never unload the descriptions, so the real fix is to physically park unused entries outside the eagerly-scanned directories.

## Why this exists

Every `SKILL.md` under `~/.claude/skills/<name>/` and every `<command>.md` under `~/.claude/commands/` is parsed at session start. With hundreds of entries installed, that's multiple kB of system-prompt cost on every turn — paid even for entries you never invoke.

The fix is structural, not instructional: keep universals globally, park domain clusters in sibling library directories (not eagerly loaded), and **symlink** them into projects that actually need them via project-local `.claude/skills/` (verified working) and `.claude/commands/` (unverified — test before relying on).

## Directory layout

```
~/.claude/
├── skills/                          # Universal — always loaded (24 entries)
│   ├── (TS/JS/web)        coding-standards, frontend-patterns, backend-patterns, api-design, mcp-server-patterns
│   ├── (Python)           python-patterns, python-testing
│   ├── (testing/quality)  e2e-testing, tdd-workflow, verification-loop, ai-regression-testing, iterative-retrieval
│   ├── (tools/meta)       configure-ecc, eval-harness, skill-forge, skill-stocktake,
│   │                      continuous-learning-v2, strategic-compact, plankton-code-quality, frontend-slides
│   └── (gstack symlinks)  design-html, design-shotgun, office-hours, plan-ceo-review
│
├── commands/                        # Universal — always loaded (18 entries)
│   ├── (meta workflow)    aside, checkpoint, sessions
│   ├── (review/quality)   code-review, refactor-clean, quality-gate, tdd, test-coverage
│   ├── (build/verify)     build-fix, verify, eval, python-review
│   ├── (docs)             docs, update-docs
│   ├── (planning/E2E)     plan, e2e
│   └── (routing/budget)   context-budget, model-route
│
├── skills-library/                  # Parked — NOT loaded unless symlinked into a project
│   └── marketing/                   # 61 skills across 8 subgroups
│       ├── ads/         (15)
│       ├── blog/        (12)
│       ├── seo/         (6)
│       ├── cro/         (6)
│       ├── copy/        (2)
│       ├── content/     (4)
│       ├── analytics/   (2)
│       └── strategy/    (14)
│
├── commands-library/                # Parked — NOT loaded unless symlinked into ~/.claude/commands/
│   ├── instinct/        (9)   learn, learn-eval, evolve, prune, promote,
│   │                          instinct-{export,import,status}, projects
│   ├── multi-agent/     (10)  multi-{backend,frontend,plan,execute,workflow},
│   │                          orchestrate, claw, devfleet, loop-{start,status}
│   ├── skill-meta/      (3)   skill-create, skill-health, rules-distill
│   ├── dev-meta/        (3)   harness-audit, prompt-optimize, update-codemaps
│   └── setup/           (2)   pm2, setup-pm
│
├── skills-backup-<YYYYMMDD-HHMMSS>.tar.gz     # Pre-cleanup snapshot
└── commands-backup-<YYYYMMDD-HHMMSS>.tar.gz   # Pre-cleanup snapshot
```

## Per-project enablement

### Skills (verified working)

Claude Code auto-loads `.claude/skills/` from the workspace root AND any parent directory walked up from the workspace. Confirmed by existing setups: `~/Projects/.claude/skills/` (codegraph/gitnexus) and `<project>/.claude/skills/` (gstack symlink in Warsaw AI Community).

```bash
# Whole marketing library (61 skills) for a marketing/ads project
PROJ="$HOME/Projects N1X/onlyviral-backend"
mkdir -p "$PROJ/.claude/skills"
for d in ~/.claude/skills-library/marketing/*/; do
  for s in "$d"*/; do
    ln -s "$s" "$PROJ/.claude/skills/$(basename "$s")"
  done
done

# Or specific subgroups only
PROJ="$HOME/Projects N1X/miniads"
mkdir -p "$PROJ/.claude/skills"
for grp in ads seo analytics; do
  for s in ~/.claude/skills-library/marketing/$grp/*/; do
    ln -s "$s" "$PROJ/.claude/skills/$(basename "$s")"
  done
done
```

### Commands (UNVERIFIED — test first)

Whether Claude Code loads `<project>/.claude/commands/` the way it loads `<project>/.claude/skills/` is **not confirmed**. Before relying on per-project commands:

```bash
# 30-second verification
mkdir -p /tmp/cc-test/.claude/commands
echo -e '---\ndescription: test marker for project-local commands\n---\nMarker.' > /tmp/cc-test/.claude/commands/ZZ-project-local-test.md
cd /tmp/cc-test && claude   # then in the session: check whether /ZZ-project-local-test appears
```

If it works, the symlink pattern below is fine; if not, fall back to **global toggling** (symlink a cluster into `~/.claude/commands/` directly, remove the symlinks when done).

```bash
# Global toggle — enable instinct cluster
for f in ~/.claude/commands-library/instinct/*.md; do
  ln -s "$f" ~/.claude/commands/
done

# Disable: rm only the symlinks (originals stay safe)
find ~/.claude/commands/ -maxdepth 1 -type l -delete
```

Per-project equivalent (assuming Claude Code reads project-local commands):

```bash
PROJ="$HOME/Projects N1X/onlyviral-backend"
mkdir -p "$PROJ/.claude/commands"
for grp in instinct multi-agent; do
  for f in ~/.claude/commands-library/$grp/*.md; do
    ln -s "$f" "$PROJ/.claude/commands/"
  done
done
```

Verify with `ls -la "$PROJ/.claude/commands/"`.

## Which project gets which cluster

| Project | Stack | Skill clusters | Command clusters |
|---|---|---|---|
| Warsaw AI Community (this repo) | Next.js + TS, docs-first | — | — |
| OnlyViral / OnlyViral 2.0 | Python + Telegram bot | marketing.{ads,blog,seo,analytics,copy,strategy} | multi-agent (if running parallel agents) |
| miniads | Ads platform | marketing.{ads,seo,analytics,cro} | — |
| trend-radar / TrendSee | Web | marketing.{content,seo,blog} | — |
| betting-model-project | Modeling | — | — |
| gemma-benchmark | Eval | — | dev-meta (harness-audit) |

Defaults: **no library symlinks** unless the project's purpose actively needs them.

## Recovery

Both surfaces have backup tarballs created before mutation. To restore:

```bash
# Find the right backup
ls -lt ~/.claude/skills-backup-*.tar.gz | head -1
ls -lt ~/.claude/commands-backup-*.tar.gz | head -1

# Restore to a temp location and inspect first
mkdir -p /tmp/cc-restore
tar -xzf ~/.claude/commands-backup-<DATE>.tar.gz -C /tmp/cc-restore
ls /tmp/cc-restore/commands/

# Selective restore
cp /tmp/cc-restore/commands/<name>.md ~/.claude/commands/

# Full restore (overwrite current state — last resort)
# rm -rf ~/.claude/commands && mv /tmp/cc-restore/commands ~/.claude/commands
```

## What was removed entirely (in backup but not in library)

### Skills cleanup (2026-05-16) — 29 deletions

- **Unused language stacks** (25): `cpp-{coding-standards,testing}`, `perl-{patterns,testing}`, `laravel-{patterns,tdd,verification}`, `springboot-{patterns,tdd,verification}`, `java-coding-standards`, `kotlin-{coroutines-flows,exposed-patterns,ktor-patterns,patterns,testing}`, `android-clean-architecture`, `compose-multiplatform-patterns`, `golang-{patterns,testing}`, `rust-{patterns,testing}`, `django-{patterns,tdd,verification}`
- **Broken / wonky** (2): `learned/` (empty), stray top-level `SKILL.md` file
- **Examples / duplicates** (2): `project-guidelines-example`, `continuous-learning` (v1; v2 retained)

### Commands cleanup (2026-05-16) — 13 deletions

- **Unused language stacks** (13): `cpp-{build,review,test}`, `go-{build,review,test}`, `kotlin-{build,review,test}`, `rust-{build,review,test}`, `gradle-build`

If a future project ever needs one back, fetch it from the backup or re-install via the marketplace it came from.

## Dormant: the instinct ecosystem

The 9 `instinct-*` / `learn` / `evolve` / `prune` / `promote` / `projects` commands + the `continuous-learning-v2` skill are parked but **appear never to have been invoked** on this machine (no `~/.claude/instincts/` directory exists). They're a complete workflow surface for instinct-based pattern extraction. If you never plan to use this, the entire `commands-library/instinct/` cluster + the `continuous-learning-v2` skill can be DELETED in a follow-up — they're pure dead weight right now.

## Open follow-ups

- **`~/.claude/agents/`** — third eager-load surface (~50 specialized agents per the global `CLAUDE.md`). Same playbook applies; smaller per-entry token cost than skills/commands but still worth a pass.
- **Instinct ecosystem DELETE decision** — confirmed unused; needs an explicit "I'm never going to use this" call before pulling the trigger.
- **Project-local `.claude/commands/` verification** — 30-second test described above; do it once and update this playbook with the result.
