# Claude skill cluster layout

> How Claude Code skills are organized across `~/.claude/` and per-project `.claude/skills/` to minimize session-start token cost without losing any capability.

## Why this exists

Every directory under `~/.claude/skills/` has its `SKILL.md` frontmatter (`name` + `description`) eagerly parsed into Claude's system prompt at session start. With 100+ skills installed, that's multiple kB of token cost on every turn even if you never invoke them. Anti-skill instructions in `CLAUDE.md` *suppress invocation* but don't unload the descriptions.

The fix: keep only universals globally, park domain clusters in a sibling library directory (not eagerly loaded), and **symlink** them into projects that actually need them via project-local `.claude/skills/`.

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
├── skills-library/                  # Parked — NOT loaded unless symlinked into a project
│   └── marketing/
│       ├── ads/         (15)  ads, ads-{audit,budget,competitor,creative,google,landing,linkedin,
│       │                       meta,microsoft,plan,tiktok,youtube}, paid-ads, ad-creative
│       ├── blog/        (12)  blog, blog-{analyze,audit,brief,calendar,chart,geo,outline,
│       │                       repurpose,rewrite,strategy,write}
│       ├── seo/         (6)   seo, seo-{content,geo,schema,sitemap,technical}
│       ├── cro/         (6)   form-cro, onboarding-cro, page-cro, paywall-upgrade-cro,
│       │                       popup-cro, signup-flow-cro
│       ├── copy/        (2)   copywriting, copy-editing
│       ├── content/     (4)   content-strategy, site-architecture, programmatic-seo, competitor-alternatives
│       ├── analytics/   (2)   ab-test-setup, analytics-tracking
│       └── strategy/    (14)  marketing-ideas, marketing-psychology, sales-enablement, social-content,
│                               typefully, email-sequence, cold-email, launch-strategy,
│                               free-tool-strategy, pricing-strategy, churn-prevention,
│                               referral-program, revops, product-marketing-context
│
└── skills-backup-<YYYYMMDD-HHMMSS>.tar.gz   # Pre-cleanup snapshot
```

## Per-project enablement

Claude Code auto-loads `.claude/skills/` from the workspace root AND from any parent directory walked up from the workspace. So for a project that needs the marketing cluster (e.g., OnlyViral, miniads):

```bash
# One-time setup per project
PROJ="$HOME/Projects N1X/onlyviral-backend"
mkdir -p "$PROJ/.claude/skills"

# Symlink the whole marketing library (61 skills)
for d in ~/.claude/skills-library/marketing/*/; do
  for s in "$d"*/; do
    ln -s "$s" "$PROJ/.claude/skills/$(basename "$s")"
  done
done
```

Or symlink only specific subgroups (e.g., just `ads/` and `seo/` for an ads-focused project):

```bash
PROJ="$HOME/Projects N1X/miniads"
mkdir -p "$PROJ/.claude/skills"
for grp in ads seo analytics; do
  for s in ~/.claude/skills-library/marketing/$grp/*/; do
    ln -s "$s" "$PROJ/.claude/skills/$(basename "$s")"
  done
done
```

Verify with `ls -la "$PROJ/.claude/skills/"` — entries should show as symlinks back to the library.

To disable a cluster for a project: `rm -rf "$PROJ/.claude/skills/"` (deletes symlinks only; library is untouched).

## Which project gets which cluster

| Project | Stack | Marketing library? |
|---|---|---|
| Warsaw AI Community (this repo) | Next.js + TS, docs-first community ops | **No** |
| OnlyViral / OnlyViral 2.0 | Python (FastAPI) + Telegram bot | **Yes** — ads, blog, seo, analytics, copy, strategy |
| miniads | Ads platform | **Yes** — ads, seo, analytics, cro |
| trend-radar / TrendSee | Web | Probably — content, seo, blog |
| betting-model-project | Modeling | **No** |
| gemma-benchmark | Eval | **No** |

Re-evaluate when starting a new project; default is **no marketing library** unless the project's purpose is marketing/sales/content.

## Recovery

If the cluster reorg breaks something, restore from the backup tarball:

```bash
# Find the most recent backup
ls -lt ~/.claude/skills-backup-*.tar.gz | head -1

# Restore to a temp location and inspect
mkdir -p /tmp/skills-restore && tar -xzf ~/.claude/skills-backup-<DATE>.tar.gz -C /tmp/skills-restore
ls /tmp/skills-restore/skills/

# Selective restore (e.g., bring back a specific skill)
cp -r /tmp/skills-restore/skills/<name> ~/.claude/skills/

# Or full restore (overwrites current state)
# rm -rf ~/.claude/skills && mv /tmp/skills-restore/skills ~/.claude/skills
```

## What was removed entirely

The 2026-05-16 cleanup deleted 29 entries (no library copy kept, but they're in the backup tarball):

- **Unused language stacks** (25): `cpp-{coding-standards,testing}`, `perl-{patterns,testing}`, `laravel-{patterns,tdd,verification}`, `springboot-{patterns,tdd,verification}`, `java-coding-standards`, `kotlin-{coroutines-flows,exposed-patterns,ktor-patterns,patterns,testing}`, `android-clean-architecture`, `compose-multiplatform-patterns`, `golang-{patterns,testing}`, `rust-{patterns,testing}`, `django-{patterns,tdd,verification}`
- **Broken / wonky** (2): `learned/` (empty), stray top-level `SKILL.md` file
- **Examples / duplicates** (2): `project-guidelines-example`, `continuous-learning` (v1; v2 retained)

If a future project ever needs one back, fetch it from the backup or re-install via the marketplace it came from.

## Open follow-up — Claude Code commands

A parallel set of ~50 `/<command>` definitions (e.g., `quality-gate`, `rust-review`, `learn`, `claw`, `devfleet`, `instinct-*`, `multi-*`, `model-route`, `pm2`, `gradle-build`, `cpp-build`, etc.) lives under `~/.claude/commands/` and is loaded the same way skills are. Same anti-pattern, same fix: prune unused commands, park domain-specific ones outside `~/.claude/commands/`. Out of scope for the 2026-05-16 cleanup; revisit in a follow-up pass.
